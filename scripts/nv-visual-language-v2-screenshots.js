/**
 * NV-Visual-Language-v2 — Screenshot Capture
 * Captures the new home page and learning page across viewports.
 */
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');
const http = require('http');
const fs = require('fs');
const path = require('path');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9509;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const OUT = '/tmp/nv-vlv2-screenshots';
fs.mkdirSync(OUT, { recursive: true });

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
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const PAGES = [
  { id: 'home', hash: '#/' },
  { id: 'learning', hash: '#/learning' },
  { id: 'settings', hash: '#/settings' },
  { id: 'memory', hash: '#/memory' },
  { id: 'laboratory', hash: '#/laboratory' },
  { id: 'workspace', hash: '#/workspace' },
  { id: 'not-found', hash: '#/this-does-not-exist' },
];

(async () => {
  const server = http.createServer(serveFile).listen(PORT, async () => {
    console.log(`Server up on ${BASE_URL}`);
    const browser = await chromium.launch();

    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      for (const pg of PAGES) {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await page.evaluate((h) => { window.location.hash = h; }, pg.hash);
        await page.waitForTimeout(1500);
        const file = path.join(OUT, `${pg.id}-${vp.name}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`saved: ${file}`);
      }
      await ctx.close();
    }

    await browser.close();
    server.close();
    console.log('done');
  });
})();
