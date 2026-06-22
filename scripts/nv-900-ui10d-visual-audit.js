'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9499;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const KG_URL = `${BASE_URL}#/knowledge-graph`;
const SCREENSHOT_DIR = '/tmp/neuralverse-graph-redesign';

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
  } catch (e) { res.writeHead(500); res.end(`Error: ${e.message}`); }
}

async function main() {
  const server = http.createServer(serveFile);
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  let failed = false;

  const consoleErrors = [];
  const pageErrors = [];
  const failedReqs = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => pageErrors.push(err.toString()));
  page.on('requestfailed', (req) => failedReqs.push(`${req.url()}: ${req.failure()?.errorText || 'failed'}`));

  async function assert(condition, message) {
    if (!condition) { console.error(`FAIL: ${message}`); failed = true; }
    else console.log(`PASS: ${message}`);
  }
  async function shot(name) {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, name), fullPage: false });
    console.log(`SHOT: ${name}`);
  }
  async function waitGraph() {
    await page.waitForFunction(
      () => document.querySelector('.nv-kg-node') !== null,
      { timeout: 30000 }
    );
    await page.waitForTimeout(400);
  }
  async function nodeCounts() {
    return page.evaluate(() => ({
      path: document.querySelectorAll('.nv-kg-node--path').length,
      module: document.querySelectorAll('.nv-kg-node--module').length,
      lesson: document.querySelectorAll('.nv-kg-node--lesson').length,
      artifact: document.querySelectorAll('.nv-kg-node--artifact').length,
      all: document.querySelectorAll('.nv-kg-node').length,
      selected: document.querySelectorAll('.nv-kg-node.is-selected').length,
    }));
  }
  async function click(selector) {
    const el = page.locator(selector).first();
    await el.evaluate((node) => node.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(350);
  }
  async function boxes() {
    return page.locator('.nv-kg-node').evaluateAll((nodes) => nodes.map((n) => {
      const r = n.getBoundingClientRect();
      const fs = n.querySelector('.nv-kg-node-title');
      return { id: n.dataset.nodeId, x: r.x, y: r.y, w: r.width, h: r.height, type: n.dataset.type, text: n.textContent, fontSize: fs ? parseFloat(getComputedStyle(fs).fontSize) : 0 };
    }));
  }

  try {
    // ── 1440 before screenshot ────────────────────────────────────────────
    console.log('\n── 1440px Viewport ──');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(KG_URL, { waitUntil: 'networkidle', timeout: 20000 });
    await waitGraph();
    await shot('graph-before-1440.png');

    // ── Readability: font sizes ────────────────────────────────────────────
    let allBoxes = await boxes();
    const allFontSizes = allBoxes.map((b) => b.fontSize).filter((f) => f > 0);
    const largeEnough = allFontSizes.filter((f) => f >= 11);
    assert(largeEnough.length / allFontSizes.length >= 0.9, `>=90% of labels >=11px (${largeEnough.length}/${allFontSizes.length})`);
    const pathModuleFonts = allBoxes.filter((b) => b.type === 'path' || b.type === 'module').map((b) => b.fontSize);
    assert(pathModuleFonts.every((f) => f >= 14), `All path/module labels >=14px (min: ${Math.min(...pathModuleFonts)})`);

    // ── Overview atlas ────────────────────────────────────────────────────
    const c = await nodeCounts();
    assert(c.path > 0 && c.module === 0 && c.lesson === 0 && c.artifact === 0, `Overview shows only path cards: ${JSON.stringify(c)}`);
    const overviewCards = allBoxes.filter((b) => b.type === 'path');
    const desktopWidths = overviewCards.map((b) => b.w);
    assert(desktopWidths.every((w) => w >= 240), `All overview cards width >=240px (min: ${Math.min(...desktopWidths)})`);
    const desktopHeights = overviewCards.map((b) => b.h);
    assert(desktopHeights.every((h) => h >= 100), `All overview cards height >=100px (min: ${Math.min(...desktopHeights)})`);
    assert(allBoxes.every((b) => b.w > 20 && b.h > 20), 'No zero-size nodes');
    // No overflow
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'No horizontal overflow 1440');

    await shot('graph-after-1440.png');

    // ── Path stage ────────────────────────────────────────────────────────
    await click('.nv-kg-node--path');
    let stageCounts = await nodeCounts();
    assert(stageCounts.path === 1 && stageCounts.module > 0 && stageCounts.lesson === 0 && stageCounts.artifact === 0, `Path stage: ${JSON.stringify(stageCounts)}`);

    // ── Module stage ──────────────────────────────────────────────────────
    await click('.nv-kg-node--module');
    stageCounts = await nodeCounts();
    assert(stageCounts.path >= 1 && stageCounts.module >= 1 && stageCounts.lesson > 0 && stageCounts.artifact === 0, `Module stage: ${JSON.stringify(stageCounts)}`);

    // ── Lesson stage ──────────────────────────────────────────────────────
    await click('.nv-kg-node--lesson');
    stageCounts = await nodeCounts();
    assert(stageCounts.module >= 1 && stageCounts.lesson >= 1 && stageCounts.artifact > 0, `Lesson stage: ${JSON.stringify(stageCounts)}`);

    // ── Artifact stage ────────────────────────────────────────────────────
    await click('.nv-kg-node--artifact');
    stageCounts = await nodeCounts();
    assert(stageCounts.lesson >= 1 && stageCounts.artifact >= 1, `Artifact stage: ${JSON.stringify(stageCounts)}`);

    // ── Back ──────────────────────────────────────────────────────────────
    await page.locator('button:has-text("Back")').first().click();
    await page.waitForTimeout(300);
    stageCounts = await nodeCounts();
    assert(stageCounts.lesson > 0, `Back from artifact: lesson stage restored ${JSON.stringify(stageCounts)}`);

    // ── Reset ─────────────────────────────────────────────────────────────
    await page.locator('button:has-text("Overview")').first().click();
    await page.waitForTimeout(300);
    stageCounts = await nodeCounts();
    assert(stageCounts.path > 0 && stageCounts.module === 0 && stageCounts.lesson === 0 && stageCounts.artifact === 0, `Reset to overview: ${JSON.stringify(stageCounts)}`);

    // ── Search ────────────────────────────────────────────────────────────
    const firstArtifactId = await page.evaluate(() => {
      const storage = window.NeuralVerse?.curriculum?.service?._index;
      const artifacts = storage?.artifacts || [];
      return artifacts.length > 0 ? artifacts[0].id : null;
    });
    if (firstArtifactId) {
      await page.fill('input[aria-label="Search curriculum nodes"]', firstArtifactId);
      await page.locator('input[aria-label="Search curriculum nodes"]').dispatchEvent('change');
      await page.waitForTimeout(400);
      stageCounts = await nodeCounts();
      assert(stageCounts.artifact > 0, `Search artifact focuses artifact stage (visible: ${stageCounts.artifact})`);
    }

    // ── Open resource ─────────────────────────────────────────────────────
    const hashBefore = await page.evaluate(() => window.location.hash);
    const openBtn = page.locator('button:has-text("Open resource")').first();
    if (await openBtn.count() > 0) {
      await openBtn.click();
      await page.waitForTimeout(100);
      const hashAfter = await page.evaluate(() => window.location.hash);
      assert(hashAfter !== hashBefore, 'Open resource changes hash');
    }

    // ── 1024 viewport ─────────────────────────────────────────────────────
    console.log('\n── 1024px Viewport ──');
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(KG_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await waitGraph();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'No overflow 1024');
    await shot('graph-after-1024.png');

    // ── 768 viewport ──────────────────────────────────────────────────────
    console.log('\n── 768px Viewport ──');
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto(KG_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await waitGraph();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'No overflow 768');
    await shot('graph-after-768.png');

    // ── 390 mobile ────────────────────────────────────────────────────────
    console.log('\n── 390px Viewport ──');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(KG_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await waitGraph();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 10), 'No overflow 390');
    await shot('graph-after-390.png');

    // ── Accessibility ─────────────────────────────────────────────────────
    console.log('\n── Accessibility ──');
    assert(await page.locator('h1').count() === 1, 'Single h1');
    assert(await page.locator('[aria-current="page"]').count() <= 1, 'Single aria-current="page"');
    await page.locator('.nv-kg-node').first().focus();
    assert(await page.evaluate(() => document.activeElement?.classList?.contains('nv-kg-node')), 'Node keyboard-focusable');
    // Enter activates
    const activeId = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.dataset?.nodeId || '';
    });
    if (activeId) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      const selCount = await page.evaluate(() => document.querySelectorAll('.nv-kg-node.is-selected').length);
      assert(selCount > 0, 'Enter activates focused node');
    }
    // Reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(KG_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await waitGraph();
    const reducedAnim = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector('.nv-kg-node') || document.body);
      return style.animation === 'none' || style.transition === 'none' || style.transition === '' || style.animation === '';
    });
    assert(reducedAnim, 'Reduced motion respected');

    // ── Inspector ─────────────────────────────────────────────────────────
    const inspText = await page.locator('[data-kg-inspector]').textContent();
    assert(inspText.length > 15, 'Inspector has content');

    // ── Errors ────────────────────────────────────────────────────────────
    const realConsoleErrors = consoleErrors.filter((e) => !e.includes('nsjail') && !e.includes('/tmp/antigravity'));
    const realPageErrors = pageErrors.filter((e) => !e.includes('nsjail') && !e.includes('/tmp/antigravity'));
    assert(realConsoleErrors.length === 0, `0 console.error (${realConsoleErrors.length})`);
    assert(realPageErrors.length === 0, `0 pageerror (${realPageErrors.length})`);
    assert(failedReqs.length === 0, `0 failed requests (${failedReqs.length})`);
  } catch (e) {
    console.error('Exception:', e.stack || e.message);
    failed = true;
  } finally {
    await browser.close();
    server.close();
    console.log(`\nconsole.error: ${consoleErrors.length}, pageerror: ${pageErrors.length}, failedReqs: ${failedReqs.length}`);
    if (failed) process.exit(1);
  }
}
main();
