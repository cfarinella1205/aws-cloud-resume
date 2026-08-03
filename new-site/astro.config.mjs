// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://carsonfarinella.com',
  // Inline page CSS into each HTML document instead of emitting linked
  // /_astro/*.css bundles. Keeps every page self-contained (one fewer
  // render-blocking request) and lets a page be served from any path
  // without carrying a separate stylesheet dependency alongside it.
  build: {
    inlineStylesheets: 'always'
  },
  integrations: [
    sitemap({
      // /workbench/* is built into dist/ but excluded from the public S3 sync
      // (deployed separately, gated behind Cloudflare Access) — it must never
      // show up in a public sitemap.
      filter: (page) => !page.includes('/workbench/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});