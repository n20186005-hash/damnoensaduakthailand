#!/usr/bin/env node
/**
 * Pre-generates every responsive variant the `astro:assets` image service
 * (`src/lib/image-service.mjs`) resolves to, so the Cloudflare Worker can serve
 * optimised images straight from static assets.
 *
 *   src/assets/gallery/<slug>.jpg
 *     -> public/gallery/<slug>-480.{webp,jpg}
 *     -> public/gallery/<slug>-960.{webp,jpg}
 *     -> public/gallery/<slug>-1440.{webp,jpg}
 *
 * Run automatically through `npm run build` / `npm run dev` (pre-hooks).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(root, 'src', 'assets', 'gallery');
const OUT_DIR = path.join(root, 'public', 'gallery');
const WIDTHS = [480, 960, 1440];
const WEBP_OPTIONS = { quality: 72, effort: 5 };
const JPEG_OPTIONS = { quality: 74, mozjpeg: true, progressive: true };

const slugOf = (file) =>
  path
    .basename(file, path.extname(file))
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const isFresh = (target, source) =>
  fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(source).mtimeMs;

async function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`[images] source folder missing: ${SRC_DIR}`);
    process.exitCode = 1;
    return;
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const masterFiles = fs
    .readdirSync(SRC_DIR)
    .filter((name) => /\.(jpe?g|png)$/i.test(name))
    .sort();

  let written = 0;
  let skipped = 0;
  let bytes = 0;

  for (const file of masterFiles) {
    const source = path.join(SRC_DIR, file);
    const slug = slugOf(file);
    const meta = await sharp(source).metadata();
    // Never upscale: clamp the ladder to the master width.
    const finalWidths = Array.from(new Set(WIDTHS.map((width) => Math.min(width, meta.width)))).sort(
      (a, b) => a - b,
    );

    for (const width of finalWidths) {
      const targets = [
        { file: `${slug}-${width}.webp`, run: (pipeline) => pipeline.webp(WEBP_OPTIONS) },
        { file: `${slug}-${width}.jpg`, run: (pipeline) => pipeline.jpeg(JPEG_OPTIONS) },
      ];
      for (const { file: name, run } of targets) {
        const target = path.join(OUT_DIR, name);
        if (isFresh(target, source)) {
          skipped += 1;
          continue;
        }
        const buffer = await run(
          sharp(source).rotate().resize({ width, withoutEnlargement: true }).withMetadata({ icc: 'srgb' }),
        ).toBuffer();
        fs.writeFileSync(target, buffer);
        bytes += buffer.length;
        written += 1;
      }
    }
  }

  const totalMb = (fs.readdirSync(OUT_DIR).reduce((sum, name) => {
    const stat = fs.statSync(path.join(OUT_DIR, name));
    return name.endsWith('.jpg') || name.endsWith('.webp') ? sum + stat.size : sum;
  }, 0) / (1024 * 1024)).toFixed(2);

  console.log(
    `[images] ${masterFiles.length} masters -> ${written} new variants (${skipped} cached), ` +
      `gallery payload ${totalMb} MB`,
  );
}

await main();
