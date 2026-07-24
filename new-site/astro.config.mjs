// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Inline page CSS into each HTML document instead of emitting linked
  // /_astro/*.css bundles. Keeps every page self-contained (one fewer
  // render-blocking request) and lets a page be served from any path
  // without carrying a separate stylesheet dependency alongside it.
  build: {
    inlineStylesheets: 'always'
  },
  vite: {
    plugins: [tailwindcss()]
  }
});