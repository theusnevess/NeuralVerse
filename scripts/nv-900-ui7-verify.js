'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9495;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const SCREENSHOT_DIR = '/tmp/neuralverse-reading-experience';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

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
  
  // Create page and register handlers for errors
  const page = await ctx.newPage();
  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', m => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', e => {
    consoleErrors.push(e.toString());
  });
  page.on('requestfailed', r => {
    failedRequests.push(r.url() + ': ' + (r.failure() ? r.failure().errorText : 'failed'));
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
    // Navigate to explanatory text artifact page (Visual Intuition)
    const visualIntuitionUrl = `${BASE_URL}#/learning/path-advanced-rag-foundations/module/module-advanced-retrieval-pipelines/lesson/lesson-query-routing/artifact/artifact-query-routing-visual-intuition`;
    
    console.log('\n--- Setting viewport to 1440x900 ---');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(visualIntuitionUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 1. Table of Contents card rendering
    console.log('\n--- 1. Testing Table of Contents card (Desktop) ---');
    const tocCard = await page.locator('.nv-toc-card');
    assert(await tocCard.isVisible(), 'Desktop Table of Contents sidebar card should be visible.');
    const tocLinks = await tocCard.locator('.nv-toc-link');
    const tocCount = await tocLinks.count();
    assert(tocCount > 0, `Table of Contents should have clickable links (found: ${tocCount}).`);
    
    // Save screenshot
    const tocScreenshotPath = path.join(SCREENSHOT_DIR, 'artifact-toc-1440.png');
    await page.screenshot({ path: tocScreenshotPath });
    console.log(`Saved screenshot: ${tocScreenshotPath}`);

    // 2. Focus Mode rendering
    console.log('\n--- 2. Testing Focus Mode layout ---');
    const focusBtn = await page.locator('.nv-button--focus-mode');
    assert(await focusBtn.isVisible(), 'Focus Mode toggle button should be visible.');
    
    // Toggle Focus Mode
    await focusBtn.click();
    await page.waitForTimeout(1000);
    const workspace = await page.locator('.nv-lesson-workspace');
    assert(await workspace.evaluate(node => node.classList.contains('nv-lesson-workspace--focus')), 'Workspace element should contain focus class.');
    
    // Verify sidebars are hidden
    const outlineCol = await page.locator('.nv-lesson-workspace__outline-col');
    const metadataCol = await page.locator('.nv-lesson-workspace__metadata-col');
    assert(!(await outlineCol.isVisible()), 'Lesson outline column should be hidden in Focus Mode.');
    assert(!(await metadataCol.isVisible()), 'Metadata/TOC column should be hidden in Focus Mode.');

    // Save Focus Mode screenshot
    const focusScreenshotPath = path.join(SCREENSHOT_DIR, 'artifact-focus-1440.png');
    await page.screenshot({ path: focusScreenshotPath });
    console.log(`Saved screenshot: ${focusScreenshotPath}`);

    // 3. Reading Progress Indicator
    console.log('\n--- 3. Testing Reading Progress Bar ---');
    // Scroll down slightly
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);

    const progressBar = await page.locator('.nv-sticky-reading-header__progress-bar');
    assert(await progressBar.count() > 0, 'Sticky Reading Header progress bar should be present in the DOM.');
    const progressTransform = await progressBar.evaluate(node => node.style.transform);
    assert(progressTransform.startsWith('scaleX'), `Progress bar transform should be scaled (value: ${progressTransform}).`);

    // Save Progress screenshot
    const progressScreenshotPath = path.join(SCREENSHOT_DIR, 'artifact-progress-1440.png');
    await page.screenshot({ path: progressScreenshotPath });
    console.log(`Saved screenshot: ${progressScreenshotPath}`);

    // Exit Focus Mode
    await focusBtn.click();
    await page.waitForTimeout(500);

    // 4. Comparison Table layout
    console.log('\n--- 4. Testing Comparison Table rendering ---');
    const comparisonUrl = `${BASE_URL}#/learning/path-advanced-rag-foundations/module/module-advanced-retrieval-pipelines/lesson/lesson-query-routing/artifact/artifact-query-routing-comparison-table`;
    await page.goto(comparisonUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const table = await page.locator('.nv-curriculum-table');
    assert(await table.isVisible(), 'Comparison Table should be visible.');
    const tableContainer = await page.locator('.nv-table-container');
    assert(await tableContainer.isVisible(), 'Table container wrapper should support horizontal scroll.');

    // Save Comparison Table screenshot
    const comparisonScreenshotPath = path.join(SCREENSHOT_DIR, 'comparison-table-1440.png');
    await page.screenshot({ path: comparisonScreenshotPath });
    console.log(`Saved screenshot: ${comparisonScreenshotPath}`);

    // 5. Exercise Layout
    console.log('\n--- 5. Testing Exercise Layout ---');
    const exerciseUrl = `${BASE_URL}#/learning/path-advanced-rag-foundations/module/module-advanced-retrieval-pipelines/lesson/lesson-query-routing/artifact/artifact-query-routing-exercise`;
    await page.goto(exerciseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const taskBox = await page.locator('.nv-exercise-section--task');
    const outputBox = await page.locator('.nv-exercise-section--output');
    assert(await taskBox.isVisible(), 'Learner Task section should be clearly styled and highlighted.');
    assert(await outputBox.isVisible(), 'Expected Learner Output section should be clearly styled and highlighted.');

    // Save Exercise screenshot
    const exerciseScreenshotPath = path.join(SCREENSHOT_DIR, 'exercise-layout-1440.png');
    await page.screenshot({ path: exerciseScreenshotPath });
    console.log(`Saved screenshot: ${exerciseScreenshotPath}`);

    // 6. Mobile Layout
    console.log('\n--- 6. Testing Mobile Layout (390x844) ---');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(visualIntuitionUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Save Mobile Layout screenshot
    const mobileScreenshotPath = path.join(SCREENSHOT_DIR, 'artifact-mobile-390.png');
    await page.screenshot({ path: mobileScreenshotPath });
    console.log(`Saved screenshot: ${mobileScreenshotPath}`);

    // 7. Collapsible Mobile TOC Accordion
    console.log('\n--- 7. Testing Mobile Collapsible Table of Contents ---');
    const mobileTOC = await page.locator('.nv-mobile-toc');
    assert(await mobileTOC.isVisible(), 'Mobile collapsible TOC should be visible on narrow viewports.');
    
    // Open the accordion
    const mobileTOCSummary = await mobileTOC.locator('summary');
    await mobileTOCSummary.click();
    await page.waitForTimeout(500);

    // Save mobile TOC screenshot
    const mobileTOCScreenshotPath = path.join(SCREENSHOT_DIR, 'toc-mobile-390.png');
    await page.screenshot({ path: mobileTOCScreenshotPath });
    console.log(`Saved screenshot: ${mobileTOCScreenshotPath}`);

    // 8. Keyboard navigation
    console.log('\n--- 8. Testing Keyboard Navigation ---');
    // Scroll to bottom using keyboard 'End'
    await page.keyboard.press('End');
    await page.waitForTimeout(500);
    const scrollPosBottom = await page.evaluate(() => window.scrollY);
    assert(scrollPosBottom > 0, `Page scrolled down on End key press (scroll position: ${scrollPosBottom}).`);

    // Scroll back to top using keyboard 'Home'
    await page.keyboard.press('Home');
    
    // Wait dynamically for smooth scroll animation to finish
    for (let i = 0; i < 20; i++) {
      const scrollY = await page.evaluate(() => window.scrollY);
      if (scrollY === 0) break;
      await page.waitForTimeout(100);
    }
    
    const scrollPosTop = await page.evaluate(() => window.scrollY);
    assert(scrollPosTop === 0, `Page scrolled back to top on Home key press (scroll position: ${scrollPosTop}).`);

    // 9. Error Audits
    console.log('\n--- 9. Executing Console and Request Audits ---');
    assert(consoleErrors.length === 0, `console.error count = ${consoleErrors.length}.`);
    if (consoleErrors.length > 0) {
      console.error('Console errors logged:', consoleErrors);
    }
    
    assert(failedRequests.length === 0, `failed request count = ${failedRequests.length}.`);
    if (failedRequests.length > 0) {
      console.error('Failed requests logged:', failedRequests);
    }

  } catch(e) {
    console.error('Unexpected test error:', e);
    failed = true;
  } finally {
    await browser.close();
    server.close();
    console.log('\n--- Test Execution Complete ---');
    if (failed) {
      console.error('❌ NV-900-UI7 Verification FAILED!');
      process.exit(1);
    } else {
      console.log('🎉 NV-900-UI7 Verification PASSED successfully!');
      process.exit(0);
    }
  }
})();
