// @ts-check
import { defineConfig } from 'astro/config';

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
  // Old post URLs that have been shared, kept alive after a slug change.
  redirects: {
    '/blog/leading-a-capstone-team-to-ship--showcase-a-real-rbac-server':
      '/blog/leading-a-capstone-team-to-ship-and-showcase-a-real-rbac-server/',
  },
  integrations: [
    sitemap({
      // /workbench/* is built into dist/ but excluded from the public S3 sync
      // (deployed separately, gated behind Cloudflare Access) — it must never
      // show up in a public sitemap.
      filter: (page) => !page.includes('/workbench/'),
    }),
  ],
});