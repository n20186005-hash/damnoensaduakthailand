import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// The production origin can be overridden per environment; the fallback keeps
// local builds, canonical tags and the sitemap deterministic.
const site = process.env.CURRENT_SITE_DOMAIN
  ? `https://${process.env.CURRENT_SITE_DOMAIN}`
  : 'https://damnoensaduakthailand.com';

// https://astro.build/config
export default defineConfig({
  site,
  // On-demand rendering: the market page is rendered by the Worker so the
  // weather module is fetched and cached on the server. The legal pages and the
  // root redirect opt back into prerendering with `export const prerender = true`.
  output: 'server',
  adapter: cloudflare({
    // `custom` keeps the service configured below: images resolve to the
    // build-time generated static variants in `public/gallery`, so the Worker
    // never needs a native image pipeline at runtime.
    imageService: 'custom',
    platformProxy: {
      enabled: true,
    },
  }),
  image: {
    // `src/assets/gallery/*.jpg` -> `/gallery/<slug>-<width>.{webp,jpg}`.
    // The variants are produced by `scripts/build-images.mjs` (npm run images).
    service: {
      entrypoint: './src/lib/image-service.mjs',
    },
  },
  i18n: {
    defaultLocale: 'th',
    locales: ['th', 'en', 'zh'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
