#!/usr/bin/env node
/**
 * Verifies that every locale file exposes exactly the same shape:
 *   - identical key paths (parity)
 *   - identical array lengths for every list
 * Run with `node scripts/check-i18n.mjs` (or `npm run check:i18n`).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = ['th', 'en', 'zh'];

const load = (locale) =>
  JSON.parse(readFileSync(path.join(root, 'src', 'i18n', `${locale}.json`), 'utf8'));

const walk = (value, prefix, out) => {
  if (Array.isArray(value)) {
    out.set(prefix, `array(${value.length})`);
    value.forEach((item, index) => walk(item, `${prefix}[${index}]`, out));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      walk(child, prefix ? `${prefix}.${key}` : key, out);
    }
    return;
  }
  out.set(prefix, typeof value);
};

const maps = new Map();
for (const locale of LOCALES) {
  const map = new Map();
  walk(load(locale), '', map);
  maps.set(locale, map);
}

const base = maps.get(LOCALES[0]);
let failures = 0;

for (const locale of LOCALES.slice(1)) {
  const other = maps.get(locale);
  const missing = [...base.keys()].filter((key) => !other.has(key));
  const extra = [...other.keys()].filter((key) => !base.has(key));
  const sizeMismatch = [...base.keys()]
    .filter((key) => other.has(key) && base.get(key) !== other.get(key))
    .map((key) => `${key}: ${LOCALES[0]}=${base.get(key)} ${locale}=${other.get(key)}`);

  if (missing.length || extra.length || sizeMismatch.length) {
    failures += 1;
    console.log(`\n[${locale}] MISMATCH`);
    if (missing.length) console.log(`  missing (${missing.length}): ${missing.join(', ')}`);
    if (extra.length) console.log(`  extra   (${extra.length}): ${extra.join(', ')}`);
    if (sizeMismatch.length) console.log(`  length  (${sizeMismatch.length}): ${sizeMismatch.join(' | ')}`);
  }
}

if (failures === 0) {
  console.log(`i18n parity OK — ${base.size} leaf keys across ${LOCALES.join('/')}`);
} else {
  process.exitCode = 1;
}
