/**
 * NV-Visual-Language-v2 — Visual Smoke Test
 * Verifies the new home page renders without console errors
 * and that key visual elements are present at multiple viewports.
 */
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');
const http = require('http');
const fs = require('fs');
const path = require('path');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9508;
const BASE_URL = `http://127.0.0.1:${PORT}/`;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.md': 'text/markdown',
  '.txt': 'text/plain', '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function serveFile(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const filePath = path.join(WEBSITE_DIR, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      const idx = path.join(WEBSITE_DIR, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
      res.end(fs.readFileSync(idx));
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(fs.readFileSync(filePath));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(String(e));
  }
}

const VIEWPORTS = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

const PAGES = [
  { id: 'home', hash: '#/', requireSelectors: ['.nv-page-hero', '.nv-page-section', '.nv-feature-card', '.nv-page-footnote'] },
  { id: 'learning', hash: '#/learning', requireSelectors: ['.nv-learning-hero', '.nv-learning-section', '.nv-philosophy-card', '.nv-future-card'] },
  { id: 'settings', hash: '#/settings', requireSelectors: ['.nv-settings-page', '.nv-page-section__header', '.nv-settings-section'] },
  { id: 'workspace', hash: '#/workspace', requireSelectors: ['.nv-page-section__header', '.nv-review-dashboard'] },
  { id: 'memory', hash: '#/memory', requireSelectors: ['.nv-page-section__header', '.nv-memory', '.nv-memory-actions'] },
  { id: 'laboratory', hash: '#/laboratory', requireSelectors: ['.nv-page-section__header', '.nv-lab-index', '[data-lab-index]'] },
  { id: 'retrieval', hash: '#/retrieval-playground', requireSelectors: ['.nv-page-section__header', '.nv-topology-bg'] },
  { id: 'visualizations', hash: '#/visualizations', requireSelectors: ['.nv-page-section__header', '.nv-pviz-page'] },
  { id: 'semantic', hash: '#/semantic-learning', requireSelectors: ['.nv-page-section__header', '[data-semantic-root]'] },
  { id: 'not-found', hash: '#/this-route-does-not-exist', requireSelectors: ['.nv-page-section', '.nv-feature-card'] },
];

(async () => {
  const server = http.createServer(serveFile).listen(PORT, async () => {
    console.log(`Server up on ${BASE_URL}`);
    const browser = await chromium.launch();
    let totalFails = 0;
    let totalChecks = 0;

    for (const vp of VIEWPORTS) {
      console.log(`\n=== Viewport ${vp.name} (${vp.width}x${vp.height}) ===`);
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      const consoleErrors = [];
      page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
      page.on('pageerror', e => consoleErrors.push(`pageerror: ${e.message}`));

      for (const pg of PAGES) {
        try {
          await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
          await page.evaluate((h) => { window.location.hash = h; }, pg.hash);
          await page.waitForTimeout(1200);
          const results = await page.evaluate((sels) => {
            return sels.map(s => ({ selector: s, found: !!document.querySelector(s) }));
          }, pg.requireSelectors);
          const missing = results.filter(r => !r.found);
          const overflow = await page.evaluate(() => {
            return {
              docW: document.documentElement.scrollWidth,
              winW: window.innerWidth,
              overflowing: document.documentElement.scrollWidth > window.innerWidth + 2
            };
          });
          if (missing.length > 0) {
            console.log(`  [${pg.id}] MISSING SELECTORS: ${missing.map(m => m.selector).join(', ')}`);
            totalFails++;
          } else {
            console.log(`  [${pg.id}] all ${pg.requireSelectors.length} selectors present`);
          }
          totalChecks++;
          if (overflow.overflowing) {
            console.log(`  [${pg.id}] HORIZONTAL OVERFLOW (docW=${overflow.docW} > winW=${overflow.winW})`);
            totalFails++;
            totalChecks++;
          } else {
            console.log(`  [${pg.id}] no horizontal overflow`);
            totalChecks++;
          }
          if (consoleErrors.length > 0) {
            console.log(`  [${pg.id}] CONSOLE ERRORS:`);
            consoleErrors.forEach(e => console.log(`     - ${e}`));
            totalFails += consoleErrors.length;
            totalChecks += consoleErrors.length;
          } else {
            console.log(`  [${pg.id}] no console errors`);
            totalChecks++;
          }
        } catch (e) {
          console.log(`  [${pg.id}] EXCEPTION: ${e.message}`);
          totalFails++;
          totalChecks++;
        }
      }

      await ctx.close();
    }

    await browser.close();
    server.close();
    console.log(`\n=== Summary: ${totalChecks - totalFails}/${totalChecks} checks passed ===`);
    if (totalFails > 0) {
      console.log(`FAILED: ${totalFails} issue(s)`);
      process.exit(1);
    } else {
      console.log('ALL OK');
      process.exit(0);
    }
  });
})();
