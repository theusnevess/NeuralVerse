'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9292;
const BASE_URL = `http://127.0.0.1:${PORT}/`;

const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.md':'text/markdown','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain','.woff':'font/woff','.woff2':'font/woff2' };

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
  } catch(e) { res.writeHead(500); res.end(`Error: ${e.message}`); }
}

(async () => {
  const server = http.createServer(serveFile);
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  console.log(`Server OK at ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') { errors.push(m.text()); console.error('[ERR]', m.text().slice(0,120)); }});
  page.on('pageerror', e => { errors.push(e.toString()); });

  const ARTIFACT_HASH = '#/learning/path-advanced-rag-foundations/module/module-advanced-retrieval-pipelines/lesson/lesson-query-routing/artifact/artifact-query-routing-explanatory-text';

  console.log('Navigating to artifact…');
  await page.goto(`${BASE_URL}${ARTIFACT_HASH}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  const stats = await page.evaluate(() => {
    const reader = document.querySelector('.nv-curriculum-reader');
    const body = reader ? reader.innerHTML.substring(0, 800) : 'NOT_FOUND';
    return {
      readerPresent: !!reader,
      h2Count: document.querySelectorAll('.nv-curriculum-reader h2').length,
      h3Count: document.querySelectorAll('.nv-curriculum-reader h3').length,
      h4Count: document.querySelectorAll('.nv-curriculum-reader h4').length,
      pCount: document.querySelectorAll('.nv-curriculum-reader p').length,
      preCount: document.querySelectorAll('.nv-curriculum-reader pre').length,
      tableCount: document.querySelectorAll('.nv-curriculum-table').length,
      ulCount: document.querySelectorAll('.nv-curriculum-reader ul').length,
      olCount: document.querySelectorAll('.nv-curriculum-reader ol').length,
      blockquoteCount: document.querySelectorAll('.nv-curriculum-reader blockquote').length,
      ariaCurrent: document.querySelectorAll('[aria-current="page"]').length,
      h1Count: document.querySelectorAll('h1').length,
      bodyFirstKB: body,
    };
  });

  console.log('Artifact markdown stats:');
  console.log(JSON.stringify(stats, null, 2));

  // Also check nav aria-current breakdown
  const ariaDetails = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[aria-current="page"]')).map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim().slice(0, 60),
      class: el.className,
      href: el.getAttribute('href'),
    }));
  });
  console.log('\naria-current elements:');
  console.log(JSON.stringify(ariaDetails, null, 2));

  // Screenshot
  await page.setViewportSize({ width: 1440, height: 900 });
  const dir = '/home/matheusneves/Projetos/NeuralVerse/neuralverse/screenshots/qa4-audit';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, 'artifact-detail-verify.png'), fullPage: true });
  console.log('Screenshot saved.');

  // Also check comparison tab synthesis button
  await page.goto(`${BASE_URL}#/retrieval-playground`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1500);
  await page.locator('#playground-search-input').fill('neural');
  await page.locator('#playground-search-button').click();
  await page.waitForTimeout(1500);
  const cmps = page.locator('.search-card-compare-btn');
  const cmpN = await cmps.count();
  console.log(`Compare buttons: ${cmpN}`);
  if (cmpN >= 2) {
    await cmps.nth(0).click(); await page.waitForTimeout(200);
    await cmps.nth(1).click(); await page.waitForTimeout(600);
    const compareTab = page.locator('#tab-compare');
    if (await compareTab.count() > 0) {
      await compareTab.click();
      await page.waitForTimeout(1200);
      // Check visibility of synthesis-related buttons
      const allBtns = await page.evaluate(() =>
        Array.from(document.querySelectorAll('button')).map(b => ({
          id: b.id, text: b.textContent?.trim().slice(0,40),
          visible: b.offsetHeight > 0 && b.offsetParent !== null,
          disabled: b.disabled,
        })).filter(b => b.text.match(/compile|synthesize|evidence/i))
      );
      console.log('\nSynthesis-related buttons in compare tab:');
      console.log(JSON.stringify(allBtns, null, 2));
      await page.screenshot({ path: path.join(dir, 'retrieval-compare-verify.png'), fullPage: false });
    }
  }

  await browser.close();
  server.close();
  console.log('\nErrors count:', errors.length, errors.slice(0,3));
})();
