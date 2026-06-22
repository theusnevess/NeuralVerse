'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9501;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const SCREENSHOT_DIR = '/tmp/neuralverse-graph-hover-audit';

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

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
    res.writeHead(500); res.end(`Error: ${e.message}`);
  }
}

const KG_URL = `${BASE_URL}#/knowledge-graph`;

(async () => {
  const server = http.createServer(serveFile);
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  console.log(`Test server: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.toString()));

  async function screenshot(name) {
    const p = path.join(SCREENSHOT_DIR, name);
    await page.screenshot({ path: p, fullPage: false });
    console.log(`  📸 ${p}`);
  }

  try {
    console.log('\n── Area: Hover Interaction Audit ──');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(KG_URL, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForFunction(() => document.querySelector('.nv-kg-node') !== null, { timeout: 15000 });
    await page.waitForTimeout(1000);

    const firstPath = page.locator('.nv-kg-node--path').first();
    await firstPath.hover({ force: true });
    await page.waitForTimeout(500);
    await screenshot('hover-path.png');

    const firstModule = page.locator('.nv-kg-node--module').first();
    if (await firstModule.count() > 0) {
      await firstModule.hover({ force: true });
      await page.waitForTimeout(500);
      await screenshot('hover-module.png');
    }

    console.log(`Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) console.log(consoleErrors);
    console.log(`Page Errors: ${pageErrors.length}`);
    if (pageErrors.length > 0) console.log(pageErrors);

  } catch (e) {
    console.error('Test exception:', e);
  } finally {
    await browser.close();
    server.close();
    console.log('\n── Audit Complete ──');
  }
})();
