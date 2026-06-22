'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9497;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const SCREENSHOT_DIR = '/tmp/neuralverse-visualizations';

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

const routes = {
  "artifact-distance-metrics-interactive-visualization": "#/learning/path-ai-representation-foundations/module/module-semantic-representations-foundations/lesson/lesson-distance-metrics/artifact/artifact-distance-metrics-interactive-visualization",
  "artifact-nearest-neighbor-search-interactive-visualization": "#/learning/path-ai-representation-foundations/module/module-semantic-representations-foundations/lesson/lesson-nearest-neighbor-search/artifact/artifact-nearest-neighbor-search-interactive-visualization",
  "artifact-rag-foundations-interactive-visualization": "#/learning/path-ai-representation-foundations/module/module-vector-retrieval-architectures/lesson/lesson-rag-foundations/artifact/artifact-rag-foundations-interactive-visualization",
  "artifact-self-attention-interactive-visualization": "#/learning/path-transformer-foundations/module/module-transformer-fundamentals/lesson/lesson-self-attention/artifact/artifact-self-attention-interactive-visualization",
  "artifact-convolution-intuition-interactive-visualization": "#/learning/path-computer-vision-foundations/module/module-visual-feature-extraction-foundations/lesson/lesson-convolution-intuition/artifact/artifact-convolution-intuition-interactive-visualization",
  "artifact-object-detection-fundamentals-interactive-visualization": "#/learning/path-object-detection-foundations/module/module-detection-fundamentals/lesson/lesson-object-detection-fundamentals/artifact/artifact-object-detection-fundamentals-interactive-visualization",
  "artifact-encoder-decoder-segmentation-interactive-visualization": "#/learning/path-segmentation-foundations/module/module-segmentation-architectures/lesson/lesson-encoder-decoder-segmentation/artifact/artifact-encoder-decoder-segmentation-interactive-visualization",
  "artifact-bayes-theorem-interactive-visualization": "#/learning/path-statistics-probability-ai/module/module-probability-foundations/lesson/lesson-bayes-theorem/artifact/artifact-bayes-theorem-interactive-visualization",
  "artifact-overfitting-underfitting-interactive-visualization": "#/learning/path-machine-learning-foundations/module/module-model-generalization-evaluation/lesson/lesson-overfitting-underfitting/artifact/artifact-overfitting-underfitting-interactive-visualization",
  "artifact-forward-propagation-interactive-visualization": "#/learning/path-deep-learning-foundations/module/module-neural-network-fundamentals/lesson/lesson-forward-propagation/artifact/artifact-forward-propagation-interactive-visualization"
};

(async () => {
  const server = http.createServer(serveFile);
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  console.log(`Test Server running at ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext();
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
    await page.setViewportSize({ width: 1440, height: 900 });

    for (const [id, route] of Object.entries(routes)) {
      console.log(`\n--- Testing Visualization: ${id} ---`);
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);

      // 1. Verify container exists
      const containerSelector = `#visualization-${id}`;
      const containerExists = await page.locator(containerSelector).count();
      assert(containerExists === 1, `Container ${containerSelector} should exist.`);

      // 2. Accessibility: Verify exactly one h1
      const h1Count = await page.locator('h1').count();
      assert(h1Count === 1, `There should be exactly one h1 per page. Found: ${h1Count}`);

      // 3. Take verification screenshot
      const screenshotPath = path.join(SCREENSHOT_DIR, `${id}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`Screenshot saved to ${screenshotPath}`);

      // 4. Verify interactive controls exist based on type
      if (id === 'artifact-distance-metrics-interactive-visualization') {
        const inputs = await page.locator('.nv-input-ax').count();
        assert(inputs === 1, "Should render coordinate input fields");
        
        // Try modifying coordinate input
        await page.fill('.nv-input-ax', '2');
        await page.dispatchEvent('.nv-input-ax', 'input');
        const metricVal = await page.locator('.nv-metric-euclidean').textContent();
        assert(metricVal !== '0.00', `Euclidean distance should update on input, got ${metricVal}`);
      }

      if (id === 'artifact-nearest-neighbor-search-interactive-visualization') {
        const sliderCount = await page.locator('#k-range').count();
        assert(sliderCount === 1, "Should render K range slider");
        
        // Change metric
        await page.evaluate(() => {
          const radio = document.querySelector('input[value="euclidean"]');
          if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        await page.waitForTimeout(100);
      }

      if (id === 'artifact-rag-foundations-interactive-visualization') {
        const tabsCount = await page.locator('.nv-rag-tab').count();
        assert(tabsCount === 3, "Should render 3 pipeline phase tabs");

        // Click next tab
        await page.click('.nv-rag-tab[data-stage="augment"]');
        const isHidden = await page.locator('#panel-retrieve').evaluate(el => el.classList.contains('nv-hidden'));
        assert(isHidden, "First tab panel should be hidden on tab switch");
      }

      if (id === 'artifact-self-attention-interactive-visualization') {
        const chipsCount = await page.locator('.nv-token-chip').count();
        assert(chipsCount === 5, "Should render 5 token chips");

        // Click a token chip
        await page.click('.nv-token-chip:nth-child(3)');
        await page.waitForTimeout(100);
      }

      if (id === 'artifact-convolution-intuition-interactive-visualization') {
        const playBtn = await page.locator('.nv-btn-conv-play').count();
        assert(playBtn === 1, "Should render Play animation button");
      }

      if (id === 'artifact-object-detection-fundamentals-interactive-visualization') {
        const gtXInput = await page.locator('.nv-gt-x').count();
        assert(gtXInput === 1, "Should render bounding box inputs");
      }

      if (id === 'artifact-encoder-decoder-segmentation-interactive-visualization') {
        const opacitySlider = await page.locator('#seg-opacity-slider').count();
        assert(opacitySlider === 1, "Should render opacity adjustment slider");
      }

      if (id === 'artifact-bayes-theorem-interactive-visualization') {
        const priorSlider = await page.locator('#bayes-prior-slider').count();
        assert(priorSlider === 1, "Should render prior probability slider");
      }

      if (id === 'artifact-overfitting-underfitting-interactive-visualization') {
        const degreeSlider = await page.locator('#overfit-degree-slider').count();
        assert(degreeSlider === 1, "Should render complexity degree slider");
      }

      if (id === 'artifact-forward-propagation-interactive-visualization') {
        const stepBtn = await page.locator('.nv-btn-fprop-forward').count();
        assert(stepBtn === 1, "Should render step forward control");
      }

      // 5. Test cleanup / Navigation away
      console.log(`Navigating away from ${id} to verify destruction and cleanup...`);
      await page.goto(`${BASE_URL}#/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);

      // Verify that the visualization container element is gone
      const containerGone = await page.locator(containerSelector).count();
      assert(containerGone === 0, `Visualization container ${containerSelector} should be cleaned up.`);
    }

    // 6. Assertions for error logs
    assert(consoleErrors.length === 0, `Should have no page console errors. Found: ${consoleErrors.join(', ')}`);
    assert(failedRequests.length === 0, `Should have no failed network requests. Found: ${failedRequests.join(', ')}`);

  } catch(e) {
    console.error("Test execution failed with exception:", e);
    failed = true;
  } finally {
    await browser.close();
    server.close();
    console.log('\n--- Test Verification Finished ---');
    if (failed) {
      console.error('❌ SOME TESTS FAILED.');
      process.exit(1);
    } else {
      console.log('✅ ALL TESTS PASSED SUCCESSFULLY.');
      process.exit(0);
    }
  }
})();
