/**
 * Server-side weather module.
 *
 * The forecast is fetched once per cache window while rendering the request, so
 * the browser only ever talks to our own `/api/weather` route: the upstream
 * provider URL, its query string and its response envelope never reach the
 * client.
 *
 * Caching layers:
 *   1. a per-isolate memory cache (30 min) — avoids repeated upstream calls
 *      when several renders happen in the same Worker instance;
 *   2. Cloudflare's edge cache through the `cf` fetch option (30 min), which is
 *      ignored by Node during `astro dev`.
 */
import { siteConfig } from '../config';

export interface WeatherWindow {
  /** `HH:MM`, local market time. */
  start: string;
  end: string;
  kind: 'clear' | 'heat' | 'rain';
}

export interface WeatherPayload {
  current?: Record<string, number | string>;
  daily?: Record<string, unknown>;
  hourly?: Record<string, unknown>;
  /** Official weather warnings returned by the provider, when available. */
  alerts?: { event?: string; headline?: string; severity?: string }[];
  /** Derived from the hourly series, local market time. */
  windows?: WeatherWindow[];
  fetchedAt?: string;
}

const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_TTL_S = 30 * 60;
const REQUEST_TIMEOUT_MS = 9000;

/** Opening hours of the market — only these hours can win "best window". */
const OPEN_HOUR = 7;
const CLOSE_HOUR = 17;

const HEAVY_RAIN = new Set([63, 64, 65, 66, 67, 81, 82]);
const RAIN = new Set([51, 53, 55, 56, 57, 61, 62, 80]);
const STORM = new Set([95, 96, 99]);

type Day = { time: string[]; code: number[]; chance: number[]; feels: number[] };

let memory: { at: number; payload: WeatherPayload } | null = null;

function upstreamUrl(): string {
  const { lat, lng } = siteConfig.coords;
  const params = [
    `latitude=${lat}`,
    `longitude=${lng}`,
    'current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day',
    'hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code',
    'daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,sunrise,sunset',
    'timezone=Asia%2FBangkok',
    'forecast_days=7',
    'wind_speed_unit=kmh',
    // Official weather warnings, rendered as the top-priority banner.
    'alerts=true',
  ];
  return `https://api.open-meteo.com/v1/forecast?${params.join('&')}`;
}

/** Higher is better: dry, comfortable hours score close to 100. */
function scoreHour(apparent: number, code: number, chance: number): number {
  let score = 100;
  if (STORM.has(code)) score -= 85;
  else if (HEAVY_RAIN.has(code)) score -= 65;
  else if (RAIN.has(code)) score -= 32;

  if (chance >= 75) score -= 45;
  else if (chance >= 55) score -= 28;
  else if (chance >= 35) score -= 12;

  if (apparent >= 36) score -= 30;
  else if (apparent >= 33) score -= 16;
  else if (apparent >= 31) score -= 6;
  if (apparent <= 20) score -= 8;

  return Math.max(0, Math.min(100, score));
}

/** `hourly` -> the two best non-overlapping visit windows of the trading day. */
export function bestWindows(hourly: unknown, nowIso?: string): WeatherWindow[] {
  const source = hourly as
    | { time?: string[]; weather_code?: number[]; precipitation_probability?: number[]; apparent_temperature?: number[] }
    | undefined;
  if (!source?.time?.length) return [];

  const days = new Map<string, Day>();
  source.time.forEach((stamp, index) => {
    const date = stamp.slice(0, 10);
    if (!days.has(date)) days.set(date, { time: [], code: [], chance: [], feels: [] });
    const day = days.get(date)!;
    day.time.push(stamp);
    day.code.push(source.weather_code?.[index] ?? 0);
    day.chance.push(source.precipitation_probability?.[index] ?? 0);
    day.feels.push(source.apparent_temperature?.[index] ?? 30);
  });

  const dates = [...days.keys()].sort();
  const today = (nowIso ?? dates[0] ?? '').slice(0, 10);
  const nowHour = nowIso ? Number(nowIso.slice(11, 13)) : OPEN_HOUR;

  const order = [today, ...dates.filter((date) => date !== today)];

  for (const date of order) {
    const day = days.get(date);
    if (!day) continue;

    const scores = day.time
      .map((stamp, index) => ({
        hour: Number(stamp.slice(11, 13)),
        score: scoreHour(day.feels[index], day.code[index], day.chance[index]),
        code: day.code[index],
        chance: day.chance[index],
        feels: day.feels[index],
      }))
      .filter((slot) => slot.hour >= OPEN_HOUR && slot.hour <= CLOSE_HOUR)
      .filter((slot) => (date === today ? slot.hour >= nowHour : true));

    if (scores.length === 0) continue;

    const slots = scores.map((slot, index) => ({
      ...slot,
      next: scores[index + 1] && scores[index + 1].hour === slot.hour + 1 ? scores[index + 1] : null,
    }));

    const candidates = slots
      .filter((slot) => slot.next)
      .map((slot) => ({
        start: slot.hour,
        end: slot.hour + 2,
        average: (slot.score + slot.next!.score) / 2,
        chance: Math.max(slot.chance, slot.next!.chance),
        feels: (slot.feels + slot.next!.feels) / 2,
        code: Math.max(slot.code, slot.next!.code),
      }))
      .sort((a, b) => b.average - a.average);

    if (candidates.length === 0) {
      const only = scores[0];
      candidates.push({
        start: only.hour,
        end: only.hour + 1,
        average: only.score,
        chance: only.chance,
        feels: only.feels,
        code: only.code,
      });
    }

    const picked: typeof candidates = [];
    for (const candidate of candidates) {
      const overlaps = picked.some((chosen) => candidate.start < chosen.end && candidate.end > chosen.start);
      if (overlaps) continue;
      picked.push(candidate);
      if (picked.length === 2) break;
    }

    const kindOf = (candidate: (typeof candidates)[number]): WeatherWindow['kind'] =>
      candidate.chance >= 50 || RAIN.has(candidate.code) || HEAVY_RAIN.has(candidate.code) || STORM.has(candidate.code)
        ? 'rain'
        : candidate.feels >= 32
          ? 'heat'
          : 'clear';

    const pad = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

    return picked.map((candidate) => ({
      start: pad(candidate.start),
      end: pad(candidate.end),
      kind: kindOf(candidate),
    }));
  }

  return [];
}

export async function getWeather(): Promise<WeatherPayload | null> {
  if (memory && Date.now() - memory.at < CACHE_TTL_MS) {
    return memory.payload;
  }

  const init: RequestInit & { cf?: Record<string, unknown> } = {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cf: { cacheTtl: CACHE_TTL_S, cacheEverything: true },
  };

  try {
    const response = await fetch(upstreamUrl(), init);
    if (!response.ok) return memory?.payload ?? null;

    const payload = (await response.json()) as WeatherPayload;
    payload.windows = bestWindows(payload.hourly, String(payload.current?.time ?? ''));
    payload.fetchedAt = new Date().toISOString();

    memory = { at: Date.now(), payload };
    return payload;
  } catch {
    return memory?.payload ?? null;
  }
}
