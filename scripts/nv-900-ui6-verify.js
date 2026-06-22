'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9494;
const BASE_URL = `http://127.0.0.1:${PORT}/`;

const MIME = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.md':   'text/markdown',
  '.txt':  'text/plain',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
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
  } catch(e) {
    res.writeHead(500);
    res.end(`Error: ${e.message}`);
  }
}

(async () => {
  const server = http.createServer(serveFile);
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  console.log(`Test Server running at ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', m => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', e => {
    consoleErrors.push(e.toString());
  });

  let failed = false;
  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      failed = true;
    } else {
      console.log(`✅ PASSED: ${message}`);
    }
  }

  try {
    console.log('\n--- 1. Testing Artifact View Cross-Links ---');
    const artifactUrl = `${BASE_URL}#/learning/path-advanced-rag-foundations/module/module-advanced-retrieval-pipelines/lesson/lesson-query-routing/artifact/artifact-query-routing-explanatory-text`;
    await page.goto(artifactUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Verify lineage breadcrumb
    const lineageTrail = await page.locator('.nv-part-of-trail');
    assert(await lineageTrail.isVisible(), 'Parent lineage trail should be visible.');

    const lineageLinks = await lineageTrail.locator('a');
    assert(await lineageLinks.count() === 3, 'Parent lineage trail should contain exactly 3 links (Path, Module, Lesson).');

    // Verify sibling artifact cards
    const crossLinkSection = await page.locator('.nv-cross-links-section');
    assert(await crossLinkSection.isVisible(), 'Cross-linking container section should be visible.');

    const siblingCards = await page.locator('.nv-cross-link-card');
    const siblingCount = await siblingCards.count();
    assert(siblingCount > 0, `Should render sibling artifact cards (found: ${siblingCount}).`);

    // Verify card content structure
    const firstSibling = siblingCards.nth(0);
    const kicker = await firstSibling.locator('.nv-cross-link-card__kicker');
    assert(await kicker.isVisible(), 'Cross-link card should have a kicker denoting entity type.');

    const title = await firstSibling.locator('.nv-cross-link-card__title');
    assert(await title.isVisible(), 'Cross-link card should have a title.');

    const actionBtn = await firstSibling.locator('.nv-cross-link-card__action a');
    assert(await actionBtn.isVisible(), 'Cross-link card should have an explore button/link.');

    console.log('\n--- 2. Testing Lesson View Cross-Links ---');
    const lessonUrl = `${BASE_URL}#/learning/path-advanced-rag-foundations/module/module-advanced-retrieval-pipelines/lesson/lesson-query-routing`;
    await page.goto(lessonUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const lessonCrossLinks = await page.locator('.nv-cross-links-section');
    assert(await lessonCrossLinks.isVisible(), 'Lesson cross-links section should be visible.');

    const lessonCards = await page.locator('.nv-cross-link-card');
    assert(await lessonCards.count() >= 2, 'Lesson cross-links should display parent Path, parent Module, and next/prev lesson if any.');

    console.log('\n--- 3. Testing Module View Cross-Links ---');
    const moduleUrl = `${BASE_URL}#/learning/path-advanced-rag-foundations/module/module-advanced-retrieval-pipelines`;
    await page.goto(moduleUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const moduleCrossLinks = await page.locator('.nv-cross-links-section');
    assert(await moduleCrossLinks.isVisible(), 'Module cross-links section should be visible.');

    const moduleCards = await page.locator('.nv-cross-link-card');
    assert(await moduleCards.count() >= 2, 'Module cross-links should display parent Path and sibling modules.');

    console.log('\n--- 4. Testing Learning Path View Context Section ---');
    const pathUrl = `${BASE_URL}#/learning/path-advanced-rag-foundations`;
    await page.goto(pathUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const pathCrossLinks = await page.locator('.nv-cross-links-section');
    assert(await pathCrossLinks.isVisible(), 'Path curriculum summary/cross-links section should be visible.');

    console.log('\n--- 5. Testing Navigation Affordance Flow ---');
    // Go to first sibling and click it
    await page.goto(artifactUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const targetSibling = siblingCards.nth(0);
    const targetTitle = await targetSibling.locator('.nv-cross-link-card__title').textContent();
    const targetLink = await targetSibling.locator('.nv-cross-link-card__action a').getAttribute('href');

    console.log(`Navigating via cross-link card: "${targetTitle.trim()}" -> ${targetLink}`);
    await targetSibling.locator('.nv-cross-link-card__action a').click();
    await page.waitForTimeout(2000);

    const currentHash = await page.evaluate(() => window.location.hash);
    assert(currentHash === targetLink, `URL hash should update to target sibling path: ${targetLink}. Found: ${currentHash}`);

    // Verify there are no console errors
    assert(consoleErrors.length === 0, `No console errors should be captured. Found: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Console errors captured:', consoleErrors);
    }

  } catch(e) {
    console.error('Unexpected test error:', e);
    failed = true;
  } finally {
    await browser.close();
    server.close();
    console.log('\n--- Test Execution Complete ---');
    if (failed) {
      console.error('❌ NV-900-UI6 Verification FAILED!');
      process.exit(1);
    } else {
      console.log('🎉 NV-900-UI6 Verification PASSED successfully!');
      process.exit(0);
    }
  }
})();
