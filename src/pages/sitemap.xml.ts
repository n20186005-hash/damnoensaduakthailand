import type { APIRoute } from 'astro';

const SITE = 'https://damnoensaduakthailand.com';
const LANGS = ['th', 'en', 'zh'];
const TOPICS = [
  'opening-hours',
  'boat-prices',
  'from-bangkok',
  'avoid-scams',
  'maeklong-day-trip',
];
const LEGAL = ['privacy-policy', 'terms-of-service', 'cookie-settings'];

const pages: string[] = [];
LANGS.forEach((l) => pages.push(`/${l}/`));
TOPICS.forEach((s) => LANGS.forEach((l) => pages.push(`/${l}/${s}/`)));
LEGAL.forEach((s) => LANGS.forEach((l) => pages.push(`/${l}/${s}/`)));

function alternates(path: string): string {
  const rest = path.slice(3); // drop leading '/xx'
  const links = LANGS.map(
    (l) => `      <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}/${l}${rest}"/>`
  ).join('\n');
  const xdefault = `      <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/en${rest}"/>`;
  return `${links}\n${xdefault}`;
}

function urlset(): string {
  return pages
    .map(
      (path) =>
        `  <url>\n    <loc>${SITE}${path}</loc>\n${alternates(path)}\n  </url>`
    )
    .join('\n');
}

export const GET: APIRoute = () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlset()}
</urlset>`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
