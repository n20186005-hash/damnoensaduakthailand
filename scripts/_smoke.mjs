/**
 * Temporary smoke test: boot the built Worker with `wrangler dev`, hit the three
 * language routes plus the weather API, print a short report, then shut down.
 */
import { spawn } from 'node:child_process';

const PORT = 8787;
const BASE = `http://127.0.0.1:${PORT}`;

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['wrangler', 'dev', '--port', String(PORT), '--ip', '127.0.0.1', '--log-level', 'warn'],
  { stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' },
);

let serverLog = '';
child.stdout.on('data', (d) => (serverLog += d));
child.stderr.on('data', (d) => (serverLog += d));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(timeoutMs = 120000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/th/`, { redirect: 'manual' });
      if (res.status > 0) return true;
    } catch {
      /* not up yet */
    }
    await sleep(2000);
  }
  return false;
}

const report = [];

try {
  const up = await waitForServer();
  if (!up) {
    console.log('[smoke] server never became ready');
    console.log(serverLog.slice(-3000));
    process.exitCode = 1;
  } else {
    for (const path of ['/', '/th/', '/en/', '/zh/', '/api/weather', '/sitemap.xml', '/robots.txt']) {
      try {
        const res = await fetch(`${BASE}${path}`, { redirect: 'manual' });
        const body = res.status === 200 && res.headers.get('content-type')?.includes('text/html') ? await res.text() : '';
        report.push({
          path,
          status: res.status,
          location: res.headers.get('location') ?? '',
          type: res.headers.get('content-type') ?? '',
          weatherRoot: body.includes('id="weather-root"'),
          adviceDress: body.includes('data-role="advice-dress"'),
          dressItems: (body.match(/data-role="advice-dress"[\s\S]*?<\/ul>/) ?? [''])[0].split('<li').length - 1,
        });
      } catch (error) {
        report.push({ path, status: 'ERR ' + error.message });
      }
    }
    console.log('[smoke] ' + JSON.stringify(report, null, 2));
  }
} finally {
  child.kill();
  await sleep(1500);
  if (!child.killed) child.kill('SIGKILL');
}
