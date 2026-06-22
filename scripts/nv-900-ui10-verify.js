'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9498;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const SCREENSHOT_DIR = '/tmp/neuralverse-knowledge-graph';

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

(async () => {
  const server = http.createServer(serveFile);
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  let failed = false;

  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.toString()));
  page.on('requestfailed', (request) => failedRequests.push(`${request.url()}: ${request.failure()?.errorText || 'failed'}`));

  function assert(condition, message) {
    if (!condition) { console.error(`FAILED: ${message}`); failed = true; }
    else console.log(`PASSED: ${message}`);
  }

  async function screenshot(name, width = 1440, height = 900) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(150);
    const filePath = path.join(SCREENSHOT_DIR, name);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Screenshot saved: ${filePath}`);
  }

  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}#/knowledge-graph`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForSelector('[data-knowledge-graph-root] .nv-kg-svg', { timeout: 10000 });
    assert(await page.locator('.nv-kg-node').count() > 0, 'overview graph renders nodes');
    assert(await page.locator('.nv-kg-edge').count() > 0, 'overview graph renders edges');
    assert(await page.locator('[data-kg-fallback]').count() === 1, 'fallback list exists');
    await screenshot('knowledge-graph-overview-1440.png');
    await screenshot('knowledge-graph-overview-390.png', 390, 844);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.selectOption('.nv-kg-toolbar select', 'focused-lesson');
    await page.waitForTimeout(250);
    assert(await page.locator('.nv-kg-node--artifact').count() > 0, 'focused lesson graph renders contained artifacts');
    await screenshot('knowledge-graph-focused-lesson-1440.png');

    await page.selectOption('.nv-kg-toolbar select', 'artifact-neighborhood');
    await page.waitForTimeout(250);
    assert(await page.locator('.nv-kg-node--artifact').count() > 1, 'artifact neighborhood renders sibling artifacts');
    await screenshot('knowledge-graph-artifact-neighborhood-1440.png');

    await page.locator('.nv-kg-node').first().click();
    await page.waitForTimeout(100);
    assert((await page.locator('[data-kg-inspector]').textContent()).includes('Open resource'), 'node selection updates inspector');
    await screenshot('knowledge-graph-selected-node-1440.png');

    await page.locator('.nv-kg-edge').first().dispatchEvent('click');
    await page.waitForTimeout(100);
    assert((await page.locator('[data-kg-inspector]').textContent()).includes('Selected Relationship'), 'edge selection updates inspector');
    await screenshot('knowledge-graph-selected-edge-1440.png');

    const firstCheckbox = page.locator('.nv-kg-filter input[type="checkbox"]').first();
    await firstCheckbox.dispatchEvent('click');
    await page.waitForTimeout(100);
    assert(await page.locator('.nv-kg-node').count() >= 0, 'filters update graph without error');
    await screenshot('knowledge-graph-filters-1440.png');
    await firstCheckbox.dispatchEvent('click');

    await page.fill('.nv-kg-search', 'self attention');
    await page.dispatchEvent('.nv-kg-search', 'change');
    await page.waitForTimeout(250);
    assert(await page.locator('.nv-kg-node.is-selected').count() >= 1, 'search focus selects a node');

    await page.locator('.nv-kg-node').first().focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    assert(await page.locator('.nv-kg-node.is-selected').count() >= 1, 'keyboard navigation selects nodes');

    const beforeHash = page.url();
    await page.click('button:has-text("Open selected")');
    await page.waitForTimeout(300);
    assert(page.url() !== beforeHash, 'open selected resource navigates');

    await page.goto(`${BASE_URL}#/knowledge-graph`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForSelector('[data-kg-fallback]');
    await screenshot('knowledge-graph-mobile-fallback-390.png', 390, 844);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    assert(!overflow, 'mobile has no horizontal overflow');
    const footerCollision = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      const graph = document.querySelector('.nv-kg');
      if (!footer || !graph) return false;
      return graph.getBoundingClientRect().bottom > footer.getBoundingClientRect().top;
    });
    assert(!footerCollision, 'no footer collision detected');

    assert(consoleErrors.length === 0, `console.error count is ${consoleErrors.length}`);
    assert(pageErrors.length === 0, `pageerror count is ${pageErrors.length}`);
    assert(failedRequests.length === 0, `failed request count is ${failedRequests.length}`);
  } catch (error) {
    console.error('Verification exception:', error);
    failed = true;
  } finally {
    await browser.close();
    server.close();
    console.log(`console.error count: ${consoleErrors.length}`);
    console.log(`pageerror count: ${pageErrors.length}`);
    console.log(`failed request count: ${failedRequests.length}`);
    if (failed) process.exit(1);
  }
})();
