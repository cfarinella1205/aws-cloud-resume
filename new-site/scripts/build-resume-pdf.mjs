// Prints the built /resume page to dist/resume.pdf using the page's own
// @media print styles, so the downloadable PDF can never drift from the
// HTML resume. Runs after `astro build` (see the "build" script).
import { preview } from 'astro';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const server = await preview({ root: fileURLToPath(new URL('..', import.meta.url)), logLevel: 'warn' });
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  // Don't let the render bump the real visitor counter on every deploy.
  await page.route('**/execute-api.**', (route) => route.abort());
  await page.goto(`http://localhost:${server.port}/resume`, { waitUntil: 'networkidle' });
  await page.pdf({
    path: fileURLToPath(new URL('../dist/resume.pdf', import.meta.url)),
    format: 'Letter',
    preferCSSPageSize: true,   // honor the page's @page margins
    printBackground: false,
  });
  console.log('resume.pdf written to dist/');
} finally {
  await browser.close();
  await server.stop();
}
