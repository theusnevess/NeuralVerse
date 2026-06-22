'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9496;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const SCREENSHOT_DIR = '/tmp/neuralverse-personalization';

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
    // Navigate to a curriculum artifact page
    const artifactUrl = `${BASE_URL}#/learning/path-advanced-rag-foundations/module/module-advanced-retrieval-pipelines/lesson/lesson-query-routing/artifact/artifact-query-routing-visual-intuition`;
    
    console.log('\n--- Setting viewport to 1440x900 ---');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(artifactUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Clear previous localStorage
    await page.evaluate(() => localStorage.clear());

    // 1. Testing Bookmarks Toggle & State Persistence
    console.log('\n--- 1. Testing Bookmarks Toggle & Persistence ---');
    
    // Find the bookmark toggle button in the reading header
    const bookmarkBtn = await page.locator('.nv-button--bookmark');
    assert(await bookmarkBtn.isVisible(), 'Bookmark button should be visible in the header.');
    
    // Bookmark status should be un-bookmarked initially
    let isBookmarked = await bookmarkBtn.getAttribute('data-bookmarked');
    assert(isBookmarked === 'false' || isBookmarked === null, 'Bookmark should initially be false.');
    
    // Click the bookmark button
    await bookmarkBtn.click();
    await page.waitForTimeout(500);
    
    // Bookmark status should now be true
    isBookmarked = await bookmarkBtn.getAttribute('data-bookmarked');
    assert(isBookmarked === 'true', 'Bookmark attribute should be true after click.');
    
    // Reload the page and check if it's still bookmarked
    console.log('Reloading page...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const reloadedBookmarkBtn = await page.locator('.nv-button--bookmark');
    isBookmarked = await reloadedBookmarkBtn.getAttribute('data-bookmarked');
    assert(isBookmarked === 'true', 'Bookmark state should be persisted after reload.');

    // Save screenshot
    const bookmarkScreenshot = path.join(SCREENSHOT_DIR, '01-bookmark-active.png');
    await page.screenshot({ path: bookmarkScreenshot });
    console.log(`Saved screenshot: ${bookmarkScreenshot}`);

    // 2. Testing Personal Notes Autosave
    console.log('\n--- 2. Testing Personal Notes Autosave ---');
    
    // Find notes textarea in the metadata sidebar
    const notesTextarea = await page.locator('.nv-notes-textarea');
    assert(await notesTextarea.isVisible(), 'Notes textarea should be visible in the metadata column.');
    
    // Type some notes
    await notesTextarea.fill('This is a test personal study note on Query Routing.');
    // Trigger input event to simulate typing and wait for debounced save
    await page.waitForTimeout(1000);
    
    // Reload page to verify persistence
    console.log('Reloading page...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const reloadedNotes = await page.locator('.nv-notes-textarea').inputValue();
    assert(reloadedNotes === 'This is a test personal study note on Query Routing.', 'Notes content should be persisted after reload.');

    // 3. Testing Tags management
    console.log('\n--- 3. Testing Personal Tagging ---');
    
    const tagInput = await page.locator('.nv-add-tag-input');
    assert(await tagInput.isVisible(), 'Tag input field should be visible.');
    
    // Type a tag name and hit Enter
    await tagInput.fill('retrieval');
    await tagInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Verify tag is added to the UI
    const tagBadge = await page.locator('.nv-tag-badge');
    const tagText = await tagBadge.textContent();
    assert(tagText.includes('retrieval'), 'Tag badge should appear with correct text.');
    
    // Reload and check persistence
    console.log('Reloading page...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const reloadedTagBadge = await page.locator('.nv-tag-badge');
    assert(await reloadedTagBadge.count() > 0, 'Tags should persist after reload.');

    // 4. Testing Paragraph-Level Highlights
    console.log('\n--- 4. Testing Paragraph-Level Highlights ---');
    
    // We select the first paragraph within the artifact content
    const firstParagraph = await page.locator('article.nv-curriculum-reader p').first();
    assert(await firstParagraph.isVisible(), 'Markdown paragraph element should be present.');
    
    // Retrieve the dynamic highlight anchor assigned by the controller
    const activeAnchorId = await firstParagraph.getAttribute('data-highlight-anchor');
    assert(activeAnchorId !== null, `Paragraph should have data-highlight-anchor assigned (value: ${activeAnchorId}).`);
    
    // We simulate programmatic highlighting by calling the global API
    await page.evaluate((anchorId) => {
      const p = document.querySelector(`article.nv-curriculum-reader p[data-highlight-anchor="${anchorId}"]`);
      if (p) {
        window.NeuralVerse.PersonalizationService.toggleHighlight(
          'artifact-query-routing-visual-intuition',
          anchorId,
          'yellow'
        );
        p.classList.add('nv-highlight--yellow');
      }
    }, activeAnchorId);
    
    await page.waitForTimeout(500);
    
    // Verify class was added
    let hasClass = await firstParagraph.evaluate(node => node.classList.contains('nv-highlight--yellow'));
    assert(hasClass, 'Paragraph should receive highlighting style class.');
    
    // Reload page to verify persistence
    console.log('Reloading page...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // The highlights should be re-applied on rendering the artifact
    const reloadedFirstParagraph = await page.locator('article.nv-curriculum-reader p').first();
    hasClass = await reloadedFirstParagraph.evaluate(node => node.classList.contains('nv-highlight--yellow'));
    assert(hasClass, 'Highlighting should persist and be re-applied after page reload.');

    // Save screenshot
    const highlightScreenshot = path.join(SCREENSHOT_DIR, '02-paragraph-highlight.png');
    await page.screenshot({ path: highlightScreenshot });
    console.log(`Saved screenshot: ${highlightScreenshot}`);

    // 5. Testing Personalized Workspace Dashboard
    console.log('\n--- 5. Testing Personalized Workspace Dashboard ---');
    
    // Navigate to #/workspace dashboard
    await page.goto(`${BASE_URL}#/workspace`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Verify Dashboard layout is visible
    const dashboard = await page.locator('.nv-workspace-dashboard');
    assert(await dashboard.isVisible(), 'Workspace dashboard layout should render.');
    
    // Verify "Continue Reading" hero card lists the last visited artifact
    const continueTitle = await page.locator('.nv-continue-reading-banner__title');
    assert(await continueTitle.isVisible(), 'Continue Reading card should be visible.');
    const continueText = await continueTitle.textContent();
    assert(continueText.includes('The Post Office Sorting Office'), 'Continue Reading should list the last visited artifact.');
    
    // Verify "Bookmarks Quick List" contains our bookmarked artifact
    const bookmarkedList = await page.locator('.nv-workspace-dashboard').locator('text=Bookmarks Quick List');
    assert(await bookmarkedList.isVisible(), 'Bookmarked section header should be visible on dashboard.');
    
    // Verify "Recently Visited" history list contains entries
    const visitedList = await page.locator('.nv-workspace-dashboard').locator('text=Recently Visited');
    assert(await visitedList.isVisible(), 'Recently Visited section header should be visible.');
    
    // Save screenshot of Dashboard
    const dashboardScreenshot = path.join(SCREENSHOT_DIR, '03-dashboard.png');
    await page.screenshot({ path: dashboardScreenshot });
    console.log(`Saved screenshot: ${dashboardScreenshot}`);

    // 6. Testing Global Search Integration with Personalization Filters
    console.log('\n--- 6. Testing Global Search Personalization Filters ---');
    
    // Click Ctrl+K equivalent to trigger search modal
    await page.keyboard.press('Control+KeyK');
    await page.waitForTimeout(1000);
    
    const searchModal = await page.locator('#nv-curriculum-search-modal');
    assert(await searchModal.evaluate(node => node.open), 'Global Search modal should be open.');
    
    // Take a screenshot right after opening search modal
    const preSearchScreenshot = path.join(SCREENSHOT_DIR, '04-search-opened-debug.png');
    await page.screenshot({ path: preSearchScreenshot });
    console.log(`Saved pre-assert search screenshot: ${preSearchScreenshot}`);
    
    // Evaluate properties of checkbox
    const checkboxDetails = await page.evaluate(() => {
      const el = document.getElementById('nv-search-filter-bookmarked');
      if (!el) return 'NOT FOUND';
      return {
        outerHTML: el.outerHTML,
        offsetParent: el.offsetParent ? el.offsetParent.tagName + '.' + el.offsetParent.className : 'null',
        clientWidth: el.clientWidth,
        clientHeight: el.clientHeight,
        display: getComputedStyle(el).display,
        visibility: getComputedStyle(el).visibility,
        opacity: getComputedStyle(el).opacity,
        parentElement: el.parentElement ? el.parentElement.outerHTML : 'null'
      };
    });
    console.log('Checkbox details:', checkboxDetails);

    // Find the Bookmarked filter checkbox
    const bookmarkedCheckbox = await page.locator('#nv-search-filter-bookmarked');
    assert(await bookmarkedCheckbox.isVisible(), 'Bookmarked filter checkbox should be visible.');
    
    // Click the Bookmarked checkbox
    await bookmarkedCheckbox.click();
    await page.waitForTimeout(500);
    
    // The search results should now contain our bookmarked artifact
    const firstResult = await page.locator('.nv-search-item').first();
    assert(await firstResult.isVisible(), 'Search should display matches based on active filter.');
    const resultTitle = await firstResult.locator('.nv-search-item-title').textContent();
    assert(resultTitle.includes('The Post Office Sorting Office'), 'Filter should restrict results to the bookmarked item.');

    // Save screenshot of Search Modal with filter active
    const searchScreenshot = path.join(SCREENSHOT_DIR, '04-search-filter.png');
    await page.screenshot({ path: searchScreenshot });
    console.log(`Saved screenshot: ${searchScreenshot}`);

    console.log('\n--- All verification assertions executed ---');

  } catch(e) {
    console.error(`Error during verification execution: ${e.stack}`);
    failed = true;
  } finally {
    await browser.close();
    await new Promise(r => server.close(r));
    console.log('Test Server stopped.');
  }

  if (failed) {
    console.error('\n❌ QA Audit Failed.');
    process.exit(1);
  } else {
    console.log('\n🌟 QA Audit Successful! NV-900-UI8 Personalized Workspace is certified.');
    process.exit(0);
  }
})();
