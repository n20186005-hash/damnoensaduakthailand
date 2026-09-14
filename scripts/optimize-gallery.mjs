/**
 * Compress the gallery masters in src/assets/gallery in place. The responsive
 * WebP/JPG variants published to public/gallery are then produced from these
 * masters by `npm run images` (scripts/build-images.mjs).
 *
 * - longest side capped (default 1600px)
 * - EXIF orientation applied and metadata stripped
 * - mozjpeg, progressive, quality 82
 * - overwrites in place, so a failed run can never leave a half-written JPEG
 *   behind in a second location.
 *
 * Usage:  npm run optimize:images
 *         npm run optimize:images -- --width 1440 --quality 78
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const galleryDir = join(here, '..', 'src', 'assets', 'gallery');

const argv = process.argv.slice(2);
const readArg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? Number(argv[i + 1]) : fallback;
};

const MAX_EDGE = readArg('width', 1600);
const QUALITY = readArg('quality', 82);
const MIN_BYTES = readArg('min', 300 * 1024); // skip files already smaller than this

const fmt = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const files = (await readdir(galleryDir))
  .filter((f) => ['.jpg', '.jpeg', '.png'].includes(extname(f).toLowerCase()))
  .sort();

let before = 0;
let after = 0;
let skipped = 0;

for (const file of files) {
  const src = join(galleryDir, file);
  const info = await stat(src);
  before += info.size;

  if (info.size < MIN_BYTES) {
    after += info.size;
    skipped += 1;
    console.log(`·  ${file.padEnd(44)} ${fmt(info.size)}  (already small, skipped)`);
    continue;
  }

  // Read into memory first: keeping a sharp() pipeline open on the same path
  // while writing back to it fails on Windows.
  const input = await readFile(src);
  const buf = await sharp(input)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true, chromaSubsampling: '4:2:0' })
    .toBuffer();

  if (buf.length >= info.size) {
    after += info.size;
    skipped += 1;
    console.log(`·  ${file.padEnd(44)} ${fmt(info.size)}  (no gain, kept original)`);
    continue;
  }

  // Overwrite in place. A rename over an existing file is blocked in this
  // environment (EPERM), so the resized buffer is written directly instead.
  await writeFile(src, buf);
  after += buf.length;
  const pct = (100 - (buf.length / info.size) * 100).toFixed(1);
  console.log(`✓  ${file.padEnd(44)} ${fmt(info.size)} → ${fmt(buf.length)}  (-${pct}%)`);
}

console.log(
  `\n${files.length} files · ${fmt(before)} → ${fmt(after)}  (-${(100 - (after / before) * 100).toFixed(1)}%) · ${skipped} skipped`
);
