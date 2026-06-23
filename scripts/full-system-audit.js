const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const BASE_URL = 'http://127.0.0.1:8080/';
const ARTIFACTS_DIR = '/tmp/neuralverse-full-system-audit';
const WEBSITE_DIR = path.resolve(__dirname, '../website');

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
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

const consoleLogs = [];
const consoleErrors = [];
const pageErrors = [];
const requestFailed = [];
const networkLogs = [];

(async () => {
  console.log("Starting Full-System Audit, Hardening & Certification...");
  const server = http.createServer(serveFile);
  await new Promise(r => server.listen(8080, '127.0.0.1', r));
  console.log(`Self-contained server running at ${BASE_URL}`);

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  async function checkAriaCurrent(pageInstance, routeName) {
    const pageCount = await pageInstance.evaluate(() => {
      return document.querySelectorAll('[aria-current="page"]').length;
    });
    const totalAriaCurrent = await pageInstance.evaluate(() => {
      return document.querySelectorAll('[aria-current]').length;
    });
    console.log(`[ROUTE: ${routeName}] [aria-current="page"] count: ${pageCount}, total [aria-current]: ${totalAriaCurrent}`);
    
    // Assertion: Count must be 1 on valid routes, <= 1 overall.
    const isUnknownRoute = routeName.includes('does-not-exist');
    if (isUnknownRoute) {
      if (pageCount > 1) {
        console.error(`[ACCESSIBILITY ERROR] Unknown route ${routeName} has multiple [aria-current="page"] elements: ${pageCount}`);
        consoleErrors.push(`Unknown route ${routeName} has multiple [aria-current="page"] elements: ${pageCount}`);
      }
    } else {
      if (pageCount !== 1) {
        console.error(`[ACCESSIBILITY ERROR] Route ${routeName} does not have exactly one [aria-current="page"] element (found: ${pageCount})`);
        consoleErrors.push(`Route ${routeName} does not have exactly one [aria-current="page"] element (found: ${pageCount})`);
      }
    }
    return pageCount;
  }

  async function auditViewport(pageInstance, route, width, height, screenshotName) {
    await pageInstance.setViewportSize({ width, height });
    await pageInstance.waitForTimeout(600);
    
    const overflow = await pageInstance.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth || document.body.scrollWidth > document.body.clientWidth;
    });
    
    if (overflow) {
      console.error(`[OVERFLOW] Horizontal overflow detected on route ${route} at viewport ${width}x${height}`);
      consoleErrors.push(`Horizontal overflow detected on route ${route} at viewport ${width}x${height}`);
    }
    
    const screenshotPath = path.join(ARTIFACTS_DIR, screenshotName);
    await pageInstance.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${screenshotPath}`);
  }

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ type, text });
    if (type === 'error') {
      consoleErrors.push(text);
      console.error(`[CONSOLE ERROR] ${text}`);
    } else if (type === 'warning') {
      if (!text.includes('Favicon')) {
        console.warn(`[CONSOLE WARN] ${text}`);
      }
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.stack || err.toString());
    console.error(`[PAGE ERROR] ${err.stack || err.toString()}`);
  });

  page.on('requestfailed', req => {
    const errText = req.failure() ? req.failure().errorText : 'unknown';
    requestFailed.push({ url: req.url(), errorText: errText });
    console.error(`[REQUEST FAILED] ${req.url()}: ${errText}`);
  });

  page.on('response', res => {
    networkLogs.push({ url: res.url(), status: res.status() });
  });

  // 1. Home Route
  console.log("Navigating to Home...");
  await page.goto(`${BASE_URL}#/`);
  await page.waitForTimeout(1000);
  await checkAriaCurrent(page, '#/');
  await auditViewport(page, '#/', 390, 844, 'home-390.png');
  await auditViewport(page, '#/', 1440, 900, 'home-1440.png');

  // 2. Learning Route
  console.log("Navigating to Learning...");
  await page.click('a[href="#/learning"]');
  await page.waitForTimeout(800);
  await checkAriaCurrent(page, '#/learning');
  await auditViewport(page, '#/learning', 390, 844, 'learning-390.png');
  await auditViewport(page, '#/learning', 1440, 900, 'learning-1440.png');

  // 3. Modules Route
  console.log("Navigating to Modules...");
  await page.click('a[href="#/modules"]');
  await page.waitForTimeout(800);
  await checkAriaCurrent(page, '#/modules');
  await auditViewport(page, '#/modules', 390, 844, 'modules-390.png');
  await auditViewport(page, '#/modules', 1440, 900, 'modules-1440.png');

  // 4. Workspace Route
  console.log("Navigating to Workspace...");
  await page.click('a[href="#/workspace"]');
  await page.waitForTimeout(800);
  await checkAriaCurrent(page, '#/workspace');
  await auditViewport(page, '#/workspace', 390, 844, 'workspace-390.png');
  await auditViewport(page, '#/workspace', 1440, 900, 'workspace-1440.png');

  // 5. Content Route
  console.log("Navigating to Content...");
  await page.click('a[href="#/content"]');
  await page.waitForTimeout(800);
  await checkAriaCurrent(page, '#/content');
  await auditViewport(page, '#/content', 390, 844, 'content-390.png');
  await auditViewport(page, '#/content', 1440, 900, 'content-1440.png');

  // 6. Settings Route
  console.log("Navigating to Settings...");
  await page.click('a[href="#/settings"]');
  await page.waitForTimeout(800);
  await checkAriaCurrent(page, '#/settings');
  await auditViewport(page, '#/settings', 390, 844, 'settings-390.png');
  await auditViewport(page, '#/settings', 1440, 900, 'settings-1440.png');

  // 7. Not Found Route (404)
  console.log("Navigating to Unknown Route...");
  await page.goto(`${BASE_URL}#/does-not-exist`);
  await page.waitForTimeout(800);
  await checkAriaCurrent(page, '#/does-not-exist');
  await auditViewport(page, '#/does-not-exist', 390, 844, 'not-found-390.png');
  await auditViewport(page, '#/does-not-exist', 1440, 900, 'not-found-1440.png');

  // 8. Retrieval Workspace Route
  console.log("Navigating to Retrieval Workspace...");
  await page.goto(`${BASE_URL}#/retrieval-playground`);
  await page.waitForTimeout(1000);
  await checkAriaCurrent(page, '#/retrieval-playground');
  await auditViewport(page, '#/retrieval-playground', 390, 844, 'retrieval-390.png');
  await auditViewport(page, '#/retrieval-playground', 1440, 900, 'retrieval-1440.png');

  // Search Matrix & Functional flow in Retrieval
  console.log("Searching 'transformer'...");
  await page.fill('#playground-search-input', 'transformer');
  await page.click('#playground-search-button');
  await page.waitForTimeout(1000);
  await auditViewport(page, '#/retrieval-playground', 1440, 900, 'retrieval-search-1440.png');

  // Validate results and Select first reference
  const firstResultSelector = '#search-results-container .result-card';
  const firstResultCount = await page.locator(firstResultSelector).count();
  if (firstResultCount > 0) {
    console.log("Selecting first reference in results...");
    await page.click(`${firstResultSelector}:first-child`);
    await page.waitForTimeout(800);
    await auditViewport(page, '#/retrieval-playground', 1440, 900, 'retrieval-inspector-1440.png');
    
    // Trigger Hover Preview
    console.log("Triggering Hover Preview...");
    const previewTrigger = page.locator('[data-preview-ref]:first-child');
    if (await previewTrigger.count() > 0) {
      await previewTrigger.first().hover();
      await page.waitForTimeout(500);
    }
    
    // Pin reference
    const pinBtn = page.locator('#playground-pin-button');
    if (await pinBtn.count() > 0) {
      console.log("Pinning reference...");
      await pinBtn.click();
      await page.waitForTimeout(500);
      await auditViewport(page, '#/retrieval-playground', 1440, 900, 'retrieval-memory-1440.png');
    }
  }

  // Save Query
  const saveQueryBtn = page.locator('#playground-save-query-button');
  if (await saveQueryBtn.count() > 0 && !(await saveQueryBtn.isDisabled())) {
    console.log("Saving query...");
    await saveQueryBtn.click();
    await page.waitForTimeout(500);
  }

  // Open Graph Mode
  const graphTab = page.locator('#tab-graph');
  if (await graphTab.count() > 0) {
    console.log("Switching to Graph Mode...");
    await graphTab.click();
    await page.waitForTimeout(1000);
  }

  // Switch back to search to select items for compare
  await page.click('#tab-search');
  await page.waitForTimeout(500);
  
  const addCompareBtn = page.locator('#search-results-container .search-card-compare-btn');
  const compareBtnCount = await addCompareBtn.count();
  console.log(`Found ${compareBtnCount} compare buttons in search results`);
  if (compareBtnCount >= 2) {
    console.log("Adding references to comparison...");
    await addCompareBtn.nth(0).click();
    await page.waitForTimeout(300);
    await addCompareBtn.nth(1).click();
    await page.waitForTimeout(800);
    
    // Open Compare Mode to view matrix (Compare tab is now visible because compareSelection is populated)
    const compareTab = page.locator('#tab-compare');
    if (await compareTab.count() > 0) {
      console.log("Switching to Compare Mode...");
      await compareTab.click();
      await page.waitForTimeout(1000);
      await auditViewport(page, '#/retrieval-playground', 1440, 900, 'retrieval-compare-1440.png');
      
      // Compile Synthesis
      const compileSynthesisBtn = page.locator('button:has-text("Compile Evidence from Compare Set"), button:has-text("Compile Synthesis"), button:has-text("Synthesize")');
      if (await compileSynthesisBtn.count() > 0) {
        console.log("Compiling Multi-Reference Evidence Synthesis...");
        await compileSynthesisBtn.first().click();
        await page.waitForTimeout(1500);
        await auditViewport(page, '#/retrieval-playground', 1440, 900, 'retrieval-synthesis-1440.png');
      }
    }
  }

  // Open Presentation Mode
  const presentationTab = page.locator('#tab-presentation');
  if (await presentationTab.count() > 0) {
    console.log("Opening Presentation Mode...");
    await presentationTab.click();
    await page.waitForTimeout(1000);
    await auditViewport(page, '#/retrieval-playground', 1440, 900, 'retrieval-presentation-1440.png');
    
    // Copy Snapshot
    const copySnapshotBtn = page.locator('button:has-text("Copy Snapshot")');
    if (await copySnapshotBtn.count() > 0) {
      console.log("Copying snapshot...");
      await copySnapshotBtn.first().click();
      await page.waitForTimeout(500);
    }
    
    // Exit Presentation
    const closePresentationBtn = page.locator('button:visible:has-text("Return to Workspace"), button:visible:has-text("Exit"), button:visible:has-text("Close")');
    if (await closePresentationBtn.count() > 0) {
      await closePresentationBtn.first().click();
      await page.waitForTimeout(500);
    }
  }

  // Reduced Motion Audit
  console.log("Testing Reduced Motion...");
  const rmContext = await browser.newContext({ reducedMotion: 'reduce' });
  const rmPage = await rmContext.newPage();
  await rmPage.goto(`${BASE_URL}#/retrieval-playground`);
  await rmPage.waitForTimeout(1000);
  await auditViewport(rmPage, '#/retrieval-playground', 1440, 900, 'reduced-motion-retrieval-1440.png');
  await rmContext.close();

  // Search Matrix Audit
  const searchModeTab = page.locator('#tab-search');
  if (await searchModeTab.count() > 0) {
    await searchModeTab.click();
    await page.waitForTimeout(300);
  }

  const queries = ["bert", "clip", "yolo", "rag", "pytorch", "deep learning", "nonexistent-query"];
  for (const q of queries) {
    console.log(`Running search check for query: "${q}"`);
    await page.fill('#playground-search-input', q);
    await page.click('#playground-search-button');
    await page.waitForTimeout(500);
  }

  // Reload page to validate persistence
  console.log("Reloading page to validate persistence...");
  await page.reload();
  await page.waitForTimeout(1000);
  
  // Clear Session / Empty States validation
  const clearSessionBtn = page.locator('#playground-clear-session-button');
  if (await clearSessionBtn.count() > 0) {
    console.log("Clearing session...");
    await clearSessionBtn.click();
    await page.waitForTimeout(800);
  }

  // Stress Audit (10 route changes)
  console.log("Running stress audit (route changes)...");
  const routes = ['#/', '#/learning', '#/modules', '#/workspace', '#/content', '#/retrieval-playground', '#/settings'];
  for (let i = 0; i < 10; i++) {
    const route = routes[i % routes.length];
    await page.goto(`${BASE_URL}${route}`);
    await page.waitForTimeout(100);
  }

  // Accessibility DOM assertions
  console.log("Running accessibility DOM assertions...");
  const ariaCurrentCount = await page.evaluate(() => {
    return document.querySelectorAll('[aria-current="page"]').length;
  });
  const emptyFocusableNav = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('nav a, nav button')).filter(el => {
      return el.tabIndex >= 0 && !el.innerText.trim() && !el.getAttribute('aria-label');
    }).length;
  });

  console.log(`[ACCESSIBILITY] aria-current="page" count: ${ariaCurrentCount}`);
  console.log(`[ACCESSIBILITY] empty focusable elements in nav: ${emptyFocusableNav}`);

  await browser.close();
  server.close();

  // Fix Audit Report Accuracy: claim PASS only if raw metrics are valid
  let status = "PASS";
  if (consoleErrors.length > 0 || pageErrors.length > 0 || requestFailed.length > 0) {
    status = "FAIL";
  } else if (ariaCurrentCount > 1) {
    status = "PASS_WITH_ISSUES";
  }

  const report = {
    status,
    consoleErrorsCount: consoleErrors.length,
    pageErrorsCount: pageErrors.length,
    requestFailedCount: requestFailed.length,
    consoleErrors,
    pageErrors,
    requestFailed,
    ariaCurrentCount,
    emptyFocusableNav
  };

  fs.writeFileSync('/home/matheusneves/Projetos/NeuralVerse/neuralverse/final-qa-report.json', JSON.stringify(report, null, 2));
  console.log(`Full-System Audit Completed with status: ${status}.`);
})();
