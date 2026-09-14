import type { APIRoute } from 'astro';
import { getWeather } from '../../lib/weather';

export const prerender = false;

/**
 * Same-origin forecast endpoint consumed by the weather card's refresh script.
 * It returns our normalised payload, so the upstream provider and its API shape
 * stay on the server.
 */
export const GET: APIRoute = async () => {
  const payload = await getWeather();

  if (!payload) {
    return new Response(JSON.stringify({ error: 'unavailable' }), {
      status: 503,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  }

  return new Response(JSON.stringify(payload), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=1800, stale-while-revalidate=300',
    },
  });
};
