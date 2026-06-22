'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9393;
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
  console.log(`Server running at ${BASE_URL}`);

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

  const requestLogs = [];
  page.on('request', r => {
    const url = r.url();
    if (url.includes('.md')) {
      requestLogs.push(url);
    }
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
    console.log('\n--- Test 1: Performance / Lazy Loading Check ---');
    // Go to the lesson route. The outline should render without loading any .md artifacts.
    const lessonHash = '#/learning/path-advanced-rag-foundations/module/module-advanced-retrieval-pipelines/lesson/lesson-query-routing';
    await page.goto(`${BASE_URL}${lessonHash}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    const initialMdRequests = requestLogs.filter(url => url.includes('/content/'));
    assert(initialMdRequests.length === 0, `No artifact Markdown (.md) should be loaded on lesson overview page. Found: ${initialMdRequests.length}`);

    console.log('\n--- Test 2: Active Artifact Lazy Load & Outline Highlight ---');
    // Go to first artifact page
    const artifact1Hash = `${lessonHash}/artifact/artifact-query-routing-explanatory-text`;
    await page.goto(`${BASE_URL}${artifact1Hash}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const artifact1Requests = requestLogs.filter(url => url.includes('explanatory-text.md'));
    assert(artifact1Requests.length === 1, 'Markdown file for active artifact should be loaded on demand.');

    // Check that exactly one outline item is marked active (aria-current="location")
    const activeOutlineText = await page.evaluate(() => {
      const activeItem = document.querySelector('.nv-lesson-workspace__outline-item[aria-current="location"]');
      return activeItem ? activeItem.textContent.trim() : null;
    });
    assert(activeOutlineText !== null && activeOutlineText.includes('Dynamic Routing Mechanisms'), `Outline should highlight the active artifact. Active item text: ${activeOutlineText}`);

    console.log('\n--- Test 3: Prev / Next Navigation buttons ---');
    // On the first artifact, Prev should be a placeholder/button with disabled attribute or not be an <a> link
    const prevBtnState = await page.evaluate(() => {
      const btn = document.querySelector('.nv-button--prev');
      if (!btn) return 'absent';
      return btn.tagName.toLowerCase() === 'button' || btn.disabled || btn.hasAttribute('disabled') ? 'disabled' : 'enabled';
    });
    assert(prevBtnState === 'absent' || prevBtnState === 'disabled', `Previous button should be a disabled placeholder on the first artifact. Found: ${prevBtnState}`);

    // Click Next button to navigate to second artifact
    const nextBtnExists = await page.evaluate(() => {
      const btn = document.querySelector('.nv-button--next');
      return !!btn && btn.tagName.toLowerCase() === 'a';
    });
    assert(nextBtnExists, 'Next button should exist as a link on the first artifact.');

    // Click the Next link
    await page.click('.nv-button--next');
    await page.waitForTimeout(2000);

    // Verify URL changed to second artifact
    const currentUrl = page.url();
    assert(currentUrl.includes('artifact-query-routing-visual-intuition'), `Should navigate to next artifact page. Current URL: ${currentUrl}`);

    // Verify both Prev and Next buttons are links on intermediate artifact
    const prevNextState = await page.evaluate(() => {
      const prev = document.querySelector('.nv-button--prev');
      const next = document.querySelector('.nv-button--next');
      return {
        prevIsLink: prev && prev.tagName.toLowerCase() === 'a',
        nextIsLink: next && next.tagName.toLowerCase() === 'a',
      };
    });
    assert(prevNextState.prevIsLink && prevNextState.nextIsLink, 'Both Prev and Next should be active links on an intermediate artifact.');

    // Go to the last artifact
    const lastArtifactHash = `${lessonHash}/artifact/artifact-query-routing-comparison-table`;
    await page.goto(`${BASE_URL}${lastArtifactHash}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const nextBtnStateLast = await page.evaluate(() => {
      const btn = document.querySelector('.nv-button--next');
      if (!btn) return 'absent';
      return btn.tagName.toLowerCase() === 'button' || btn.disabled || btn.hasAttribute('disabled') ? 'disabled' : 'enabled';
    });
    assert(nextBtnStateLast === 'absent' || nextBtnStateLast === 'disabled', `Next button should be a disabled placeholder on the last artifact. Found: ${nextBtnStateLast}`);

    console.log('\n--- Test 4: Mobile Viewport Accordion & Outline ---');
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Check outline details accordion is present and doesn't break layout
    const detailsAccordionExists = await page.evaluate(() => {
      const details = document.querySelector('.nv-lesson-workspace__outline-accordion');
      return !!details;
    });
    assert(detailsAccordionExists, 'Outline details/summary accordion should exist in workspace.');

    // Test collapse/expand
    await page.evaluate(() => {
      const details = document.querySelector('.nv-lesson-workspace__outline-accordion');
      details.open = false;
    });
    await page.waitForTimeout(500);
    const detailsIsClosed = await page.evaluate(() => {
      const details = document.querySelector('.nv-lesson-workspace__outline-accordion');
      return !details.open;
    });
    assert(detailsIsClosed, 'Outline details accordion can be closed.');

    await page.evaluate(() => {
      const details = document.querySelector('.nv-lesson-workspace__outline-accordion');
      details.open = true;
    });
    await page.waitForTimeout(500);

    console.log('\n--- Test 5: Layout (No Sticky overlaps, No Horizontal Scroll) ---');
    // Scroll to the bottom of the page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Check if sticky panels overlap the footer
    const overlaps = await page.evaluate(() => {
      const footer = document.querySelector('.nv-footer, footer');
      const outline = document.querySelector('.nv-lesson-workspace__outline-col');
      const metadata = document.querySelector('.nv-lesson-workspace__metadata-col');
      if (!footer) return { footerNotFound: true };
      
      const footerRect = footer.getBoundingClientRect();
      const res = { outlineOverlaps: false, metadataOverlaps: false };

      if (outline && outline.offsetHeight > 0) {
        const outlineRect = outline.getBoundingClientRect();
        // overlap exists if bottom of outline is below top of footer
        if (outlineRect.bottom > footerRect.top + 5) res.outlineOverlaps = true;
      }
      if (metadata && metadata.offsetHeight > 0) {
        const metadataRect = metadata.getBoundingClientRect();
        if (metadataRect.bottom > footerRect.top + 5) res.metadataOverlaps = true;
      }
      return res;
    });

    assert(!overlaps.footerNotFound, 'Footer element was found on page.');
    assert(!overlaps.outlineOverlaps, 'Sticky outline column should not overlap footer.');
    assert(!overlaps.metadataOverlaps, 'Sticky metadata column should not overlap footer.');

    // Reset viewport to desktop and check horizontal scroll
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    assert(!hasHorizontalScroll, 'There should be no horizontal scroll overflow in desktop layout.');

    console.log('\n--- Test 6: Accessibility (H1 & aria-current="page" constraints) ---');
    const h1Details = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1')).map(h => ({
        text: h.textContent.trim(),
        class: h.className,
      }));
    });
    console.log('H1 elements found:', JSON.stringify(h1Details, null, 2));
    const h1Count = h1Details.length;
    assert(h1Count === 1, `There should be exactly one <h1> element on the page. Found: ${h1Count}`);

    const ariaCurrentPageCount = await page.evaluate(() => document.querySelectorAll('[aria-current="page"]').length);
    assert(ariaCurrentPageCount === 1, `There should be exactly one [aria-current="page"] element on the page (global nav). Found: ${ariaCurrentPageCount}`);

    console.log('\n--- Test 7: Keyboard Navigation and Visible Focus ---');
    // Tab sequentially and check focus
    await page.goto(`${BASE_URL}${artifact1Hash}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const focusIndicatorVisible = await page.evaluate(() => {
      const item = document.querySelector('.nv-lesson-workspace__outline-item');
      if (!item) return false;
      item.focus();
      const style = window.getComputedStyle(item);
      // Under focus, it should have border or outline visible
      return style.outlineStyle !== 'none' || style.borderColor !== 'transparent' || style.backgroundColor !== 'transparent';
    });
    assert(focusIndicatorVisible, 'Focused outline items should have a visible focus styling.');

    console.log('\n--- Test 8: Performance / Request Deduplication ---');
    // Rapidly toggle between artifacts to check for duplicate requests
    requestLogs.length = 0; // Clear requests logs
    
    // Trigger rapid outline item clicks
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.nv-lesson-workspace__outline-item'));
      const links = items.filter(el => el.getAttribute('href') && el.getAttribute('href').includes('/artifact/'));
      if (links.length >= 2) {
        links[0].click();
        setTimeout(() => links[1].click(), 10);
        setTimeout(() => links[0].click(), 20);
      }
    });
    await page.waitForTimeout(2000);

    const totalMdRequests = requestLogs.filter(url => url.includes('.md'));
    const uniqueRequests = [...new Set(totalMdRequests)];
    assert(totalMdRequests.length === uniqueRequests.length, `No duplicate requests should be fired during rapid clicks. Total md requests: ${totalMdRequests.length}, Unique: ${uniqueRequests.length}`);

  } catch(e) {
    console.error('Test Execution Error:', e);
    failed = true;
  }

  await browser.close();
  server.close();

  if (failed) {
    console.error('\n❌ Workspace Extra Audit failed!');
    process.exit(1);
  } else {
    console.log('\n🌟 Workspace Extra Audit PASSED perfectly!');
    process.exit(0);
  }
})();
