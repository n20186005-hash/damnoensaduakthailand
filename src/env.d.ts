/// <reference types="astro/client" />
/// <reference types="node" />

/* Globals used by the Google Analytics bootstrap in BaseLayout.astro. */
interface Window {
  dataLayer: unknown[];
  gtag?: (...args: any[]) => void;
}
