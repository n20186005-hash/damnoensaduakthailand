import fs from 'node:fs';

/* The message bundles are typed as `Record<string, any>`, so every callback in
   `*.map()` was implicitly `any` under `astro/tsconfigs/strict`. Annotate them
   explicitly so `npm run check` is green. */
const PATCHES = [
  ['src/components/About.astro', 'about.stats.map((s) =>', 'about.stats.map((s: any) =>'],
  ['src/components/About.astro', 'about.highlights.map((h) =>', 'about.highlights.map((h: any) =>'],
  ['src/components/Food.astro', 'food.dishes.map((d) =>', 'food.dishes.map((d: any) =>'],
  ['src/components/Footer.astro', 'footer.navItems.map((n) =>', 'footer.navItems.map((n: any) =>'],
  ['src/components/Footer.astro', 's.name[lang]', '(s.name as Record<string, string>)[lang]'],
  ['src/components/Guide.astro', 'guide.hours.items.map((it) =>', 'guide.hours.items.map((it: any) =>'],
  ['src/components/Guide.astro', 'guide.fees.items.map((it) =>', 'guide.fees.items.map((it: any) =>'],
  [
    'src/components/Guide.astro',
    'guide.transport.items.map((it) =>',
    'guide.transport.items.map((it: any) =>',
  ],
  ['src/components/Guide.astro', 'guide.faqs.map((f) =>', 'guide.faqs.map((f: any) =>'],
  ['src/components/History.astro', 'history.blocks.map((b, i) =>', 'history.blocks.map((b: any, i: number) =>'],
  ['src/components/MapSection.astro', 'map.stats.slice(1).map((s) =>', 'map.stats.slice(1).map((s: any) =>'],
  ['src/components/Reviews.astro', 'reviews.featured.map((f) =>', 'reviews.featured.map((f: any) =>'],
  ['src/components/Reviews.astro', 'reviews.items.map((r) =>', 'reviews.items.map((r: any) =>'],
];

for (const [file, from, to] of PATCHES) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(from)) {
    console.log(`skip (not found): ${file} :: ${from}`);
    continue;
  }
  fs.writeFileSync(file, source.replace(from, to));
  console.log(`patched: ${file}`);
}
