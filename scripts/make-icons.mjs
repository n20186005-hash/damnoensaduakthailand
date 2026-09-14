/**
 * Render the PWA / favicon icons from one inline SVG so every raster size
 * stays visually identical.
 *
 * Usage: npm run pwa:icons
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iconDir = join(root, 'public', 'icons');

const teak = '#0d2a2e';
const gold = '#c9a962';
const goldBright = '#e6c675';

/** A stylised paddle boat on water, drawn inside a 512 box. */
const boat = (inset) => `
  <g transform="translate(${inset} ${inset}) scale(${(512 - inset * 2) / 512})">
    <!-- water -->
    <path d="M60 350 q60 -22 120 0 t120 0 t120 0 t92 0" fill="none" stroke="${gold}" stroke-width="14" stroke-linecap="round" opacity="0.75"/>
    <path d="M84 402 q60 -22 120 0 t120 0 t120 0" fill="none" stroke="${gold}" stroke-width="10" stroke-linecap="round" opacity="0.45"/>
    <!-- hull -->
    <path d="M126 268 h260 l-34 74 a26 26 0 0 1 -22 12 h-148 a26 26 0 0 1 -22 -12 z" fill="${goldBright}"/>
    <path d="M150 288 h212" stroke="${teak}" stroke-width="10" stroke-linecap="round" opacity="0.65"/>
    <!-- canopy -->
    <path d="M162 268 v-46 h188 v46" fill="none" stroke="${goldBright}" stroke-width="12" stroke-linejoin="round"/>
    <path d="M146 222 h220 l-18 -34 h-184 z" fill="${gold}"/>
    <!-- paddler -->
    <circle cx="256" cy="182" r="20" fill="${goldBright}"/>
    <path d="M256 204 v44" stroke="${goldBright}" stroke-width="14" stroke-linecap="round"/>
    <path d="M200 316 l112 -122" stroke="${gold}" stroke-width="12" stroke-linecap="round"/>
  </g>`;

const svg = ({ inset = 0, background = true } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="Damnoen Saduak Floating Market">
${background ? `  <rect width="512" height="512" rx="96" fill="${teak}"/>` : ''}
${boat(inset)}
</svg>`;

await mkdir(iconDir, { recursive: true });

const targets = [
  { file: 'icon-192.png', size: 192, opts: {} },
  { file: 'icon-512.png', size: 512, opts: {} },
  // maskable icons need the artwork kept inside the safe zone (~80% of the tile)
  { file: 'maskable-512.png', size: 512, opts: { inset: 62 } },
  { file: 'apple-touch-icon.png', size: 180, opts: {} },
  { file: 'favicon-48.png', size: 48, opts: {} },
];

for (const t of targets) {
  const png = await sharp(Buffer.from(svg(t.opts))).resize(t.size, t.size).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(join(iconDir, t.file), png);
  console.log(`✓ icons/${t.file} (${t.size}×${t.size}, ${(png.length / 1024).toFixed(1)} KB)`);
}

await writeFile(join(iconDir, 'icon.svg'), svg());
console.log('✓ icons/icon.svg');
