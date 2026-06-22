'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9498;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const KG_URL = `${BASE_URL}#/knowledge-graph`;
const SCREENSHOT_DIR = '/tmp/neuralverse-graph-interaction-redesign';

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.md': 'text/markdown', '.txt': 'text/plain', '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function serveFile(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const filePath = path.join(WEBSITE_DIR, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
      res.end(fs.readFileSync(path.join(WEBSITE_DIR, 'index.html')));
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(fs.readFileSync(filePath));
  } catch (e) {
    res.writeHead(500); res.end(`Error: ${e.message}`);
  }
}

(async () => {
  const server = http.createServer(serveFile);
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedReqs = [];
  let failed = false;

  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => pageErrors.push(err.toString()));
  page.on('requestfailed', (req) => failedReqs.push(`${req.url()}: ${req.failure()?.errorText || 'failed'}`));

  function assert(condition, message) {
    if (!condition) { console.error(`FAILED: ${message}`); failed = true; }
    else console.log(`PASSED: ${message}`);
  }
  async function screenshot(name) {
    const file = path.join(SCREENSHOT_DIR, name);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`SCREENSHOT: ${file}`);
  }
  async function waitForGraph() {
    await page.waitForFunction(() => document.querySelectorAll('.nv-kg-node').length > 0, { timeout: 20000 });
    await page.waitForTimeout(250);
  }
  async function counts() {
    return page.evaluate(() => ({
      path: document.querySelectorAll('.nv-kg-node--path').length,
      module: document.querySelectorAll('.nv-kg-node--module').length,
      lesson: document.querySelectorAll('.nv-kg-node--lesson').length,
      artifact: document.querySelectorAll('.nv-kg-node--artifact').length,
      all: document.querySelectorAll('.nv-kg-node').length,
      selected: document.querySelectorAll('.nv-kg-node.is-selected').length,
    }));
  }
  async function clickFirst(selector) {
    const locator = page.locator(selector).first();
    await locator.evaluate((node) => node.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(350);
  }
  async function visibleBoxes() {
    return page.locator('.nv-kg-node').evaluateAll((nodes) => nodes.map((node) => {
      const r = node.getBoundingClientRect();
      return { id: node.dataset.nodeId, x: r.x, y: r.y, w: r.width, h: r.height, text: node.textContent };
    }));
  }
  function overlapCount(boxes) {
    let count = 0;
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (!(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h)) count++;
    }
    return count;
  }

  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(KG_URL, { waitUntil: 'networkidle', timeout: 20000 });
    await waitForGraph();

    assert(await page.locator('h1').count() === 1, 'single h1');
    assert(await page.locator('[aria-current="page"]').count() <= 1, 'single aria-current="page"');
    let c = await counts();
    assert(c.path > 0 && c.module === 0 && c.lesson === 0 && c.artifact === 0, `default overview shows Learning Paths only ${JSON.stringify(c)}`);
    assert(await page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 5), 'no horizontal overflow at 1440');
    await screenshot('overview-paths-only-1440.png');

    await clickFirst('.nv-kg-node--path');
    c = await counts();
    assert(c.path === 1 && c.module > 0 && c.lesson === 0 && c.artifact === 0 && c.selected === 1, `path focus shows modules ${JSON.stringify(c)}`);
    await screenshot('focused-path-modules-1440.png');
    await screenshot('selected-node-inspector-1440.png');

    await clickFirst('.nv-kg-node--module');
    c = await counts();
    assert(c.path >= 1 && c.module > 0 && c.lesson > 0 && c.artifact === 0 && c.selected === 1, `module focus shows lessons ${JSON.stringify(c)}`);
    await screenshot('focused-module-lessons-1440.png');

    await clickFirst('.nv-kg-node--lesson');
    c = await counts();
    assert(c.module >= 1 && c.lesson > 0 && c.artifact > 0 && c.selected === 1, `lesson focus shows artifacts ${JSON.stringify(c)}`);
    await screenshot('focused-lesson-artifacts-1440.png');

    await clickFirst('.nv-kg-node--artifact');
    c = await counts();
    assert(c.lesson >= 1 && c.artifact > 0 && c.selected === 1, `artifact focus shows local artifact neighborhood ${JSON.stringify(c)}`);
    await screenshot('artifact-neighborhood-1440.png');

    const inspectorText = await page.locator('[data-kg-inspector]').textContent();
    assert(/Children|Siblings|Dependencies|Focus|Back to parent|Open resource/i.test(inspectorText), 'inspector exposes counts and actions');

    const artifactId = await page.locator('.nv-kg-node--artifact').first().getAttribute('data-node-id');
    await page.fill('input[aria-label="Search curriculum nodes"]', artifactId);
    await page.locator('input[aria-label="Search curriculum nodes"]').dispatchEvent('change');
    await page.waitForTimeout(500);
    c = await counts();
    assert(c.lesson >= 1 && c.artifact > 0 && c.selected === 1, `searching artifact focuses artifact neighborhood ${JSON.stringify(c)}`);
    await screenshot('search-to-artifact-focus-1440.png');

    await page.locator('button:has-text("Overview")').first().click();
    await page.waitForTimeout(350);
    c = await counts();
    assert(c.path > 0 && c.module === 0 && c.lesson === 0 && c.artifact === 0, `reset returns to Learning Path overview ${JSON.stringify(c)}`);

    await clickFirst('.nv-kg-node--path');
    await page.locator('button:has-text("Expand")').first().click();
    await page.waitForTimeout(250);
    await page.locator('button:has-text("Back to Parent")').first().click();
    await page.waitForTimeout(250);
    assert(await page.locator('.nv-kg-svg').count() === 1, 'inspector and toolbar actions keep one SVG root');

    const boxes = await visibleBoxes();
    assert(overlapCount(boxes) === 0, `no overlapping visible nodes (${overlapCount(boxes)})`);
    assert(boxes.every((box) => box.w > 20 && box.h > 20), 'visible node labels/cards are not clipped to zero size');
    assert(await page.locator('.nv-kg-toolbar button').count() >= 6, 'toolbar usable');
    assert(await page.locator('.nv-kg-fallback button, .nv-kg-fallback a').count() > 0, 'fallback list available');
    await page.locator('.nv-kg-node').first().focus();
    assert(await page.evaluate(() => document.activeElement?.classList?.contains('nv-kg-node')), 'graph nodes keyboard focusable');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(KG_URL, { waitUntil: 'networkidle', timeout: 20000 });
    await waitForGraph();
    await clickFirst('.nv-kg-node--path');
    assert(await page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 10), 'mobile path focus has no horizontal overflow');
    await screenshot('mobile-focused-path-390.png');
    await clickFirst('.nv-kg-node--module');
    await clickFirst('.nv-kg-node--lesson');
    assert((await counts()).artifact > 0, 'mobile lesson focus remains readable');
    await screenshot('mobile-focused-lesson-390.png');

    const realConsoleErrors = consoleErrors.filter((e) => !e.includes('nsjail') && !e.includes('/tmp/antigravity'));
    const realPageErrors = pageErrors.filter((e) => !e.includes('nsjail') && !e.includes('/tmp/antigravity'));
    assert(realConsoleErrors.length === 0, `0 console.error (${realConsoleErrors.length})`);
    assert(realPageErrors.length === 0, `0 pageerror (${realPageErrors.length})`);
    assert(failedReqs.length === 0, `0 failed requests (${failedReqs.length})`);
  } catch (e) {
    console.error('Test execution exception:', e.stack || e.message);
    failed = true;
  } finally {
    await browser.close();
    server.close();
    console.log(`console.error count: ${consoleErrors.length}`);
    console.log(`pageerror count: ${pageErrors.length}`);
    console.log(`failed request count: ${failedReqs.length}`);
    if (failed) process.exit(1);
  }
})();
