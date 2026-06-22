'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9501;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const SCREENSHOT_DIR = '/tmp/neuralverse-graph-full-audit';

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.md': 'text/markdown', '.txt': 'text/plain', '.woff': 'font/woff', '.woff2': 'font/woff2'
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
  } catch (error) {
    res.writeHead(500);
    res.end(`Error: ${error.message}`);
  }
}

const viewports = [
  { name: '390', width: 390, height: 844, minX: 130, minY: 140 },
  { name: '768', width: 768, height: 900, minX: 260, minY: 220 },
  { name: '1024', width: 1024, height: 768, minX: 360, minY: 240 },
  { name: '1440', width: 1440, height: 900, minX: 500, minY: 300 }
];

(async () => {
  const server = http.createServer(serveFile);
  await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  let failed = false;

  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => pageErrors.push(error.toString()));
  page.on('requestfailed', request => failedRequests.push(`${request.url()}: ${request.failure()?.errorText || 'failed'}`));

  function assert(condition, message) {
    if (!condition) { console.error(`FAILED: ${message}`); failed = true; }
    else console.log(`PASSED: ${message}`);
  }

  async function goto(hash) {
    await page.goto(`${BASE_URL}${hash}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(250);
  }

  async function waitForGraph() {
    await page.waitForSelector('.nv-kg-svg .nv-kg-node', { timeout: 15000 });
    await page.waitForTimeout(250);
  }

  async function screenshot(name, fullPage = false) {
    const filePath = path.join(SCREENSHOT_DIR, name);
    await page.screenshot({ path: filePath, fullPage });
    console.log(`Screenshot: ${filePath}`);
  }

  async function getNodeBoxes() {
    return page.locator('.nv-kg-node').evaluateAll(nodes => {
      const world = document.querySelector('.nv-kg-world');
      const svg = document.querySelector('.nv-kg-svg');
      const svgRect = svg.getBoundingClientRect();
      const transform = world?.getAttribute('transform') || 'translate(0 0) scale(1)';
      const translate = transform.match(/translate\(([-0-9.]+)\s+([-0-9.]+)\)/);
      const scale = transform.match(/scale\(([-0-9.]+)\)/);
      const tx = translate ? Number(translate[1]) : 0;
      const ty = translate ? Number(translate[2]) : 0;
      const k = scale ? Number(scale[1]) : 1;
      return nodes.map(node => {
        const wx = Number(node.dataset.wx || 0);
        const wy = Number(node.dataset.wy || 0);
        const w = Number(node.dataset.w || 0) * k;
        const h = Number(node.dataset.h || 0) * k;
        const cx = svgRect.left + tx + wx * k;
        const cy = svgRect.top + ty + wy * k;
        return { id: node.dataset.nodeId, type: node.dataset.type, x: cx - w / 2, y: cy - h / 2, right: cx + w / 2, bottom: cy + h / 2, w, h };
      }).filter(box => box.w > 1 && box.h > 1);
    });
  }

  function overlapCount(boxes, tolerance = 4) {
    let count = 0;
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (!(a.right - tolerance < b.x || a.x + tolerance > b.right || a.bottom - tolerance < b.y || a.y + tolerance > b.bottom)) count++;
      }
    }
    return count;
  }

  async function validateLabelClipping() {
    return page.locator('.nv-kg-node').evaluateAll(nodes => nodes.map(node => {
      const shape = node.querySelector('.nv-kg-node-shape');
      const title = node.querySelector('.nv-kg-node-title');
      if (!shape || !title) return null;
      const shapeBox = shape.getBBox();
      const textBox = title.getBBox();
      const pad = 10;
      const ok = textBox.x >= shapeBox.x + pad * -0.2 && textBox.x + textBox.width <= shapeBox.x + shapeBox.width - pad * 0.2 && textBox.y >= shapeBox.y - 2 && textBox.y + textBox.height <= shapeBox.y + shapeBox.height + 2;
      return ok ? null : { id: node.dataset.nodeId, text: title.textContent, textBox, shapeBox };
    }).filter(Boolean));
  }

  async function validateOverview(viewport) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await goto('#/knowledge-graph');
    await waitForGraph();

    const h1Visible = await page.locator('h1:visible').count();
    assert(h1Visible === 1, `${viewport.name}: single visible main heading`);
    const current = await page.locator('[aria-current="page"]').count();
    assert(current <= 1, `${viewport.name}: no duplicate aria-current`);
    assert(await page.locator('.nv-nav-item[href="#/knowledge-graph"][aria-current="page"]').count() === 1, `${viewport.name}: graph nav active`);
    assert(await page.locator('.nv-kg-toolbar').isVisible(), `${viewport.name}: toolbar visible`);
    assert(await page.locator('.nv-kg-svg').isVisible(), `${viewport.name}: graph viewport visible`);
    assert(await page.locator('[data-kg-inspector]').isVisible(), `${viewport.name}: inspector visible or stacked`);
    assert(await page.locator('.nv-kg-legend, [data-kg-fallback]').count() >= 1, `${viewport.name}: legend or fallback accessible`);

    const boxes = await getNodeBoxes();
    assert(boxes.length > 0, `${viewport.name}: visible graph nodes > 0`);
    const xSpread = Math.max(...boxes.map(b => b.right)) - Math.min(...boxes.map(b => b.x));
    const ySpread = Math.max(...boxes.map(b => b.bottom)) - Math.min(...boxes.map(b => b.y));
    assert(xSpread > viewport.minX, `${viewport.name}: x spread ${Math.round(xSpread)} > ${viewport.minX}`);
    assert(ySpread > viewport.minY, `${viewport.name}: y spread ${Math.round(ySpread)} > ${viewport.minY}`);

    const xBuckets = new Set(boxes.map(b => Math.round(b.x / 40)));
    const yBuckets = new Set(boxes.map(b => Math.round(b.y / 40)));
    assert(xBuckets.size >= Math.min(4, boxes.length), `${viewport.name}: not collapsed into repeated columns`);
    assert(yBuckets.size >= Math.min(4, boxes.length), `${viewport.name}: not collapsed into repeated rows`);
    assert(overlapCount(boxes) === 0, `${viewport.name}: no visible node overlap`);
    const clipped = await validateLabelClipping();
    assert(clipped.length === 0, `${viewport.name}: no node label clipping (${clipped.map(c => c.id).join(', ')})`);
    assert(await page.locator('.nv-kg-node--artifact').count() === 0, `${viewport.name}: artifacts hidden in overview`);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 5);
    assert(!overflow, `${viewport.name}: no horizontal overflow`);

    await screenshot(`graph-${viewport.name}-overview.png`);
  }

  async function clickFirst(type) {
    const locator = page.locator(`.nv-kg-node--${type}`).first();
    await locator.evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(400);
  }

  try {
    console.log('Graph viewport audit');
    for (const viewport of viewports) await validateOverview(viewport);

    await page.setViewportSize({ width: 1440, height: 900 });
    await goto('#/knowledge-graph');
    await waitForGraph();

    console.log('Selection and expansion audit');
    await clickFirst('path');
    assert(await page.locator('.nv-kg-node.is-selected').count() === 1, 'click node selects it');
    assert((await page.locator('[data-kg-inspector]').textContent()).includes('Open Resource'), 'inspector updates with node actions');
    assert(await page.locator('.nv-kg-edge').count() > 0, 'edges visible after path expansion');
    assert(await page.locator('.nv-kg-node--module').count() > 0, 'path expands modules');
    await screenshot('graph-node-selected-1440.png');

    let boxes = await getNodeBoxes();
    assert(overlapCount(boxes) === 0, 'expanded path has no node overlap');
    assert((await validateLabelClipping()).length === 0, 'expanded path has no clipped labels');

    await clickFirst('module');
    assert(await page.locator('.nv-kg-node--lesson').count() > 0, 'module expands lessons');
    assert(await page.locator('.nv-kg-edge.is-active').count() > 0, 'connected lineage highlights');
    assert(await page.locator('.nv-kg-node.is-dim').count() > 0, 'unrelated nodes dim');
    await screenshot('graph-expanded-module-1440.png');
    boxes = await getNodeBoxes();
    assert(overlapCount(boxes) === 0, 'expanded module has no node overlap');

    await clickFirst('lesson');
    assert(await page.locator('.nv-kg-node--artifact').count() > 0, 'lesson reveals artifacts');
    await screenshot('graph-expanded-lesson-1440.png');
    boxes = await getNodeBoxes();
    assert(overlapCount(boxes) === 0, 'expanded lesson has no node overlap');

    console.log('Control audit');
    const beforeTransform = await page.locator('.nv-kg-world').getAttribute('transform');
    await page.click('button:has-text("Zoom +")');
    await page.click('button:has-text("Zoom −")');
    await page.click('button:has-text("Pan →")');
    const afterPan = await page.locator('.nv-kg-world').getAttribute('transform');
    assert(beforeTransform !== afterPan, 'zoom/pan controls update camera transform');
    await page.click('button:has-text("Fit All")');
    await page.click('button:has-text("Collapse All")');
    await page.waitForTimeout(350);
    assert(await page.locator('.nv-kg-node--artifact').count() === 0, 'collapse all hides descendants');
    assert(await page.locator('.nv-kg-node--module').count() === 0, 'collapse all returns to path-only level');

    console.log('Search audit');
    await page.fill('.nv-kg-search', 'self attention');
    await page.dispatchEvent('.nv-kg-search', 'change');
    await page.waitForTimeout(500);
    assert(await page.locator('.nv-kg-node.is-selected').count() === 1, 'search selects destination node');
    assert(await page.locator('.nv-kg-node--lesson').count() > 0, 'search expands ancestors for lesson result');
    assert((await page.locator('[data-kg-inspector]').textContent()).toLowerCase().includes('attention'), 'search updates inspector');
    await screenshot('graph-search-focus-1440.png');
    await page.fill('.nv-kg-search', 'zzzz nonexistent graph item');
    await page.dispatchEvent('.nv-kg-search', 'change');
    await page.waitForTimeout(200);
    assert((await page.locator('#nv-kg-search-status').textContent()).includes('No graph node found'), 'empty search state is announced');
    await screenshot('graph-empty-search-1440.png');

    console.log('Keyboard and open-resource audit');
    await page.locator('.nv-kg-node').first().evaluate(el => el.focus());
    assert(await page.evaluate(() => document.activeElement?.classList?.contains('nv-kg-node')), 'SVG node keyboard focus works');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    assert(await page.locator('.nv-kg-node.is-selected').count() === 1, 'keyboard navigation selects graph node');
    const oldUrl = page.url();
    await page.locator('[data-kg-inspector] button:has-text("Open Resource")').first().click();
    await page.waitForTimeout(350);
    assert(page.url() !== oldUrl, 'open selected navigates');

    console.log('Mobile fallback screenshot');
    await page.setViewportSize({ width: 390, height: 844 });
    await goto('#/knowledge-graph');
    await waitForGraph();
    assert(await page.locator('[data-kg-fallback]').isVisible(), 'mobile fallback/list section visible');
    await screenshot('graph-mobile-fallback-390.png', true);

    console.log('Repeated navigation cleanup audit');
    for (let i = 0; i < 5; i++) {
      await goto('#/learning');
      await goto('#/knowledge-graph');
      await waitForGraph();
    }
    assert(await page.locator('[data-knowledge-graph-root]').count() === 1, 'single graph root after repeated navigation');
    assert(await page.locator('.nv-kg-svg').count() === 1, 'single SVG after repeated navigation');

    console.log('Regression route audit');
    const regressionRoutes = ['#/', '#/learning', '#/modules', '#/workspace', '#/content', '#/retrieval-playground', '#/settings'];
    for (const route of regressionRoutes) {
      await goto(route);
      assert(await page.locator('#main-workspace').count() === 1, `${route} loads main workspace`);
    }
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
    await page.waitForTimeout(200);
    assert(await page.locator('#nv-curriculum-search-modal[open]').count() === 1, 'global search opens with Ctrl+K');

    const vizRoute = '#/learning/path-ai-representation-foundations/module/module-semantic-representations-foundations/lesson/lesson-distance-metrics/artifact/artifact-distance-metrics-interactive-visualization';
    await goto(vizRoute);
    assert(await page.locator('#visualization-artifact-distance-metrics-interactive-visualization').count() === 1, 'interactive visualization route loads');

    const realConsoleErrors = consoleErrors.filter(e => !e.includes('nsjail') && !e.includes('/tmp/antigravity'));
    const realPageErrors = pageErrors.filter(e => !e.includes('nsjail') && !e.includes('/tmp/antigravity'));
    assert(realConsoleErrors.length === 0, `console.error count ${realConsoleErrors.length}`);
    assert(realPageErrors.length === 0, `pageerror count ${realPageErrors.length}`);
    assert(failedRequests.length === 0, `failed request count ${failedRequests.length}`);
    console.log(`console.error count: ${realConsoleErrors.length}`);
    console.log(`pageerror count: ${realPageErrors.length}`);
    console.log(`failed request count: ${failedRequests.length}`);
  } catch (error) {
    console.error('Audit exception:', error);
    failed = true;
  } finally {
    await browser.close();
    server.close();
    if (failed) process.exit(1);
  }
})();
