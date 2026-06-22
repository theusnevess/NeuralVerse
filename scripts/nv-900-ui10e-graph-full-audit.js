'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9500;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const SCREENSHOT_DIR = '/tmp/neuralverse-graph-ui10e-audit';

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
  const failedReqs = [];

  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.toString()));
  page.on('requestfailed', r => failedReqs.push(r.url() + ': ' + (r.failure()?.errorText || 'failed')));

  let failed = false;
  function assert(condition, message) {
    if (!condition) { console.error(`❌ FAILED: ${message}`); failed = true; }
    else { console.log(`✅ PASSED: ${message}`); }
  }
  async function screenshot(name) {
    const p = path.join(SCREENSHOT_DIR, name);
    await page.screenshot({ path: p, fullPage: false });
    console.log(`  📸 ${p}`);
  }

  // Helper: wait for graph to render nodes
  async function waitForGraph(timeout = 15000) {
    await page.waitForFunction(
      () => document.querySelector('.nv-kg-node') !== null || document.querySelector('.nv-kg-empty-state') !== null,
      { timeout }
    );
  }

  try {
    // ── Area 1: Route Health & Visual Layout ──────────────────────────────────
    console.log('\n── Area 1 & 2: Route Health & Visual Layout (1440) ──');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(KG_URL, { waitUntil: 'networkidle', timeout: 20000 });
    await waitForGraph();
    await page.waitForTimeout(1000); // Allow entry animations

    const h1Count = await page.locator('h1').count();
    assert(h1Count === 1, `Exactly one h1 per page (found ${h1Count})`);

    const ariaCurrentCount = await page.locator('[aria-current="page"]').count();
    assert(ariaCurrentCount <= 1, `At most one aria-current="page" (found ${ariaCurrentCount})`);

    const overflow1440 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 5);
    assert(!overflow1440, 'No horizontal overflow at 1440px');

    await screenshot('graph-overview-1440.png');

    // ── Area 4 & 5: Node Readability & Overlap (Overview Stage) ──────────────
    console.log('\n── Area 4 & 5: Node Readability & Overlap ──');
    const nodeBoxes = await page.locator('.nv-kg-node').evaluateAll(nodes =>
      nodes.map(n => {
        const r = n.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height, id: n.dataset.nodeId, type: n.dataset.type };
      })
    );

    assert(nodeBoxes.length > 0, `Graph renders at least 1 node (found ${nodeBoxes.length})`);
    
    // Check path card size
    const pathNodes = nodeBoxes.filter(n => n.type === 'path');
    if (pathNodes.length > 0) {
        assert(pathNodes[0].w >= 240, `Path card width >= 240px (actual: ${pathNodes[0].w})`);
        assert(pathNodes[0].h >= 80, `Path card height >= 80px (actual: ${pathNodes[0].h})`);
    }

    // Overlap check
    let overlapCount = 0;
    for (let i = 0; i < nodeBoxes.length; i++) {
      for (let j = i + 1; j < nodeBoxes.length; j++) {
        const a = nodeBoxes[i], b = nodeBoxes[j];
        // Allow tiny overlap due to glow/stroke bounds, check for core body overlap
        const overlaps = !(a.x + a.w - 4 < b.x || a.x + 4 > b.x + b.w || a.y + a.h - 4 < b.y || a.y + 4 > b.y + b.h);
        if (overlaps) overlapCount++;
      }
    }
    assert(overlapCount === 0, `No visible node overlaps > 4px (found: ${overlapCount})`);

    // ── Area 8: Interactions & Stage Model ──────────────────────────────────
    console.log('\n── Area 8: Interactions & Stage Model ──');
    
    // Path Stage
    const firstPath = page.locator('.nv-kg-node--path').first();
    await firstPath.evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(500);
    await screenshot('graph-path-stage-1440.png');
    
    // Module Stage
    const firstModule = page.locator('.nv-kg-node--module').first();
    if (await firstModule.count() > 0) {
        await firstModule.evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
        await page.waitForTimeout(500);
        await screenshot('graph-module-stage-1440.png');
    }

    // Lesson Stage
    const firstLesson = page.locator('.nv-kg-node--lesson').first();
    if (await firstLesson.count() > 0) {
        await firstLesson.evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
        await page.waitForTimeout(500);
        await screenshot('graph-lesson-stage-1440.png');
    }

    // Artifact Stage
    const firstArtifact = page.locator('.nv-kg-node--artifact').first();
    if (await firstArtifact.count() > 0) {
        await firstArtifact.evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
        await page.waitForTimeout(500);
        await screenshot('graph-artifact-stage-1440.png');
    }

    const inspectorSelectedText = await page.locator('[data-kg-inspector]').textContent();
    assert(inspectorSelectedText.length > 20, 'Inspector shows details for selected node');
    await screenshot('graph-selected-inspector-1440.png');

    // Reset/Collapse All
    const collapseBtn = page.locator('button:has-text("Collapse All")').first();
    if (await collapseBtn.count() > 0) {
        await collapseBtn.evaluate(el => el.click());
        await page.waitForTimeout(500);
    }

    // ── Area 9: Search / Focus ───────────────────────────────────────────────
    console.log('\n── Area 9: Search / Focus ──');
    await page.fill('.nv-kg-search', 'rag');
    await page.dispatchEvent('.nv-kg-search', 'change');
    await page.waitForTimeout(500);
    const selectedNodesRAG = await page.locator('.nv-kg-node.is-selected').count();
    assert(selectedNodesRAG >= 1, `Search 'rag' selected a node`);
    await screenshot('graph-search-focus-1440.png');

    await page.fill('.nv-kg-search', 'nonexistent-query-xyz');
    await page.dispatchEvent('.nv-kg-search', 'change');
    await page.waitForTimeout(500);
    await screenshot('graph-empty-search-1440.png');

    // ── Area 11: Responsiveness ──────────────────────────────────────────────
    console.log('\n── Area 11: Responsiveness ──');
    
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(300);
    const overflow1024 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 5);
    assert(!overflow1024, 'No horizontal overflow at 1024px');
    await screenshot('graph-overview-1024.png');

    await page.setViewportSize({ width: 768, height: 900 });
    await page.waitForTimeout(300);
    const overflow768 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 5);
    assert(!overflow768, 'No horizontal overflow at 768px');
    await screenshot('graph-overview-768.png');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    const overflow390 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 5);
    assert(!overflow390, 'No horizontal overflow at 390px');
    await screenshot('graph-overview-390.png');
    await screenshot('graph-mobile-controls-390.png');

    // Try an interaction on mobile
    const firstPathMobile = page.locator('.nv-kg-node--path').first();
    await firstPathMobile.evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(500);
    await screenshot('graph-mobile-stage-390.png');


    // ── Area 13: Performance (Repeated Navigation) ───────────────────────────
    console.log('\n── Area 13: Performance (Repeated Navigation) ──');
    await page.goto(`${BASE_URL}#/learning`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    await page.goto(KG_URL, { waitUntil: 'networkidle' });
    await waitForGraph();
    await page.waitForTimeout(300);

    const roots = await page.locator('[data-knowledge-graph-root]').count();
    const svgs = await page.locator('.nv-kg-svg').count();
    assert(roots === 1, `Only one graph root (found ${roots})`);
    assert(svgs === 1, `Only one graph SVG (found ${svgs})`);

    // ── Area 14: Regression Check ────────────────────────────────────────────
    console.log('\n── Area 14: Regression Check ──');
    const routes = ['#/learning', '#/modules', '#/workspace', '#/content'];
    let routesOk = true;
    for(const route of routes) {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(200);
        const blank = await page.evaluate(() => document.body.innerHTML.trim() === '');
        if (blank) {
            console.error(`Route ${route} is blank!`);
            routesOk = false;
        }
    }
    assert(routesOk, 'Regression routes load successfully');


    // ── Error Log Assertions ─────────────────────────────────────────────────
    console.log('\n── Error Log Assertions ──');
    const realConsoleErrors = consoleErrors.filter(e => !e.includes('nsjail') && !e.includes('/tmp/antigravity'));
    const realPageErrors = pageErrors.filter(e => !e.includes('nsjail') && !e.includes('/tmp/antigravity'));

    assert(realConsoleErrors.length === 0, `0 console errors (found: ${realConsoleErrors.join('; ')})`);
    assert(realPageErrors.length === 0, `0 page errors (found: ${realPageErrors.join('; ')})`);
    assert(failedReqs.length === 0, `0 failed requests (found: ${failedReqs.join('; ')})`);

  } catch (e) {
    console.error('Test execution exception:', e.message);
    failed = true;
  } finally {
    await browser.close();
    server.close();
    console.log('\n── Test Verification Complete ──');
    if (failed) {
      console.error('❌ SOME TESTS FAILED');
      process.exit(1);
    } else {
      console.log('✅ ALL TESTS PASSED');
      process.exit(0);
    }
  }
})();
