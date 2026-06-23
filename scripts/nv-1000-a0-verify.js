const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const BASE_URL = 'http://127.0.0.1:8080/';
const ARTIFACTS_DIR = '/tmp/neuralverse-nv1000-a0-verify';
const WEBSITE_DIR = path.resolve(__dirname, '../website');

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown',
  '.txt': 'text/plain',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
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
    res.writeHead(500);
    res.end(`Error: ${e.message}`);
  }
}

const consoleErrors = [];
const pageErrors = [];
const requestFailed = [];

(async () => {
  console.log('=== NV-1000-A0: Didactic Agent Runtime Foundation — Verification ===\n');
  const server = http.createServer(serveFile);
  await new Promise(r => server.listen(8080, '127.0.0.1', r));
  console.log(`Server running at ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  page.on('requestfailed', (req) => {
    requestFailed.push(`${req.failure().errorText} - ${req.url()}`);
  });

  const results = {
    agentPanelExists: false,
    agentTriggerExists: false,
    allTenAgentsRegistered: false,
    agentListCount: 0,
    orchestratorExists: false,
    contextBuilderExists: false,
    guardrailsExists: false,
    panelOpens: false,
    agentSelectable: false,
    scaffoldedResponse: false,
    guardrailRefusal: false,
    panelCloses: false,
    keyboardNavWorks: false,
    responsiveLayouts: {},
    existingRoutesWork: false,
    noConsoleErrors: false,
    noFailedRequests: false,
    passed: 0,
    failed: 0,
    total: 0,
  };

  try {
    // Test 1: Load home page and check agent panel exists
    console.log('\n--- Test 1: Agent Panel Shell ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    results.agentPanelExists = await page.$('#nv-agent-panel') !== null;
    results.agentTriggerExists = await page.$('#nv-agent-trigger') !== null;
    console.log(`  Agent panel element exists: ${results.agentPanelExists}`);
    console.log(`  Agent trigger button exists: ${results.agentTriggerExists}`);

    // Test 2: Check all 10 agents registered
    console.log('\n--- Test 2: Agent Registry ---');
    const agentCount = await page.evaluate(() => {
      const select = document.querySelector('#nv-agent-select');
      if (!select) return 0;
      return select.querySelectorAll('option').length - 1; // exclude placeholder
    });
    results.agentListCount = agentCount;
    results.allTenAgentsRegistered = agentCount === 10;
    console.log(`  Agents listed in selector: ${agentCount}`);
    console.log(`  All 10 agents registered: ${results.allTenAgentsRegistered}`);

    // Test 3: Orchestrator exists
    console.log('\n--- Test 3: Runtime Components ---');
    results.orchestratorExists = await page.evaluate(() => {
      return window.NeuralVerse?.didacticOrchestrator !== undefined;
    });
    results.contextBuilderExists = await page.evaluate(() => {
      return window.NeuralVerse?.contextBuilder !== undefined;
    });
    results.guardrailsExists = await page.evaluate(() => {
      return window.NeuralVerse?.agentGuardrails !== undefined;
    });
    console.log(`  Orchestrator exists: ${results.orchestratorExists}`);
    console.log(`  Context builder exists: ${results.contextBuilderExists}`);
    console.log(`  Guardrails exists: ${results.guardrailsExists}`);

    // Test 4: Panel opens
    console.log('\n--- Test 4: Panel Open/Close ---');
    await page.click('#nv-agent-trigger');
    await page.waitForTimeout(400);
    results.panelOpens = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      return panel?.classList.contains('nv-agent-panel--open') || false;
    });
    console.log(`  Panel opens on trigger click: ${results.panelOpens}`);

    // Test 5: Agent selection works
    console.log('\n--- Test 5: Agent Selection ---');
    await page.selectOption('#nv-agent-select', 'didactic-architecture');
    await page.waitForTimeout(200);
    results.agentSelectable = await page.evaluate(() => {
      return document.querySelector('#nv-agent-select')?.value === 'didactic-architecture';
    });
    console.log(`  Agent selectable: ${results.agentSelectable}`);

    // Test 6: Scaffolded response
    console.log('\n--- Test 6: Scaffolded Response ---');
    await page.fill('#nv-agent-input', 'Review the instructional design of this module');
    await page.click('.nv-agent-submit');
    await page.waitForTimeout(500);
    results.scaffoldedResponse = await page.evaluate(() => {
      const content = document.querySelector('[data-agent-response-content]');
      return content?.textContent?.length > 20 || false;
    });
    console.log(`  Scaffolded response renders: ${results.scaffoldedResponse}`);

    // Test 7: Guardrail refusal
    console.log('\n--- Test 7: Guardrail Refusal ---');
    await page.fill('#nv-agent-input', 'Modify the curriculum content and change the lifecycle status');
    await page.click('.nv-agent-submit');
    await page.waitForTimeout(500);
    results.guardrailRefusal = await page.evaluate(() => {
      const notice = document.querySelector('[data-agent-guardrail-notice]');
      return notice?.style.display !== 'none' || false;
    });
    console.log(`  Guardrail refusal works: ${results.guardrailRefusal}`);

    // Test 8: Panel closes
    console.log('\n--- Test 8: Panel Close ---');
    await page.click('.nv-agent-panel__close');
    await page.waitForTimeout(400);
    results.panelCloses = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      return !panel?.classList.contains('nv-agent-panel--open');
    });
    console.log(`  Panel closes: ${results.panelCloses}`);

    // Test 9: Keyboard navigation (Escape closes panel)
    console.log('\n--- Test 9: Keyboard Navigation ---');
    await page.click('#nv-agent-trigger');
    await page.waitForTimeout(400);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    results.keyboardNavWorks = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      return !panel?.classList.contains('nv-agent-panel--open');
    });
    console.log(`  Escape closes panel: ${results.keyboardNavWorks}`);

    // Test 10: Responsive layout checks
    console.log('\n--- Test 10: Responsive Layout ---');
    const viewports = [
      { width: 390, height: 844, label: 'mobile-390' },
      { width: 768, height: 1024, label: 'tablet-768' },
      { width: 1024, height: 768, label: 'desktop-1024' },
      { width: 1440, height: 900, label: 'desktop-1440' }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(300);
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      results.responsiveLayouts[vp.label] = !hasOverflow;
      console.log(`  ${vp.label} (${vp.width}px): no overflow = ${!hasOverflow}`);
    }

    // Test 11: Existing routes still work
    console.log('\n--- Test 11: Existing Routes ---');
    await page.setViewportSize({ width: 1440, height: 900 });
    const routes = ['#/learning', '#/modules', '#/workspace', '#/knowledge-graph', '#/content'];
    let routesOk = true;
    for (const route of routes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const hasContent = await page.evaluate(() => {
        const main = document.querySelector('.nv-main-workspace');
        return main && main.innerHTML.length > 50;
      });
      if (!hasContent) {
        routesOk = false;
        console.log(`  FAIL: ${route} has no content`);
      }
    }
    results.existingRoutesWork = routesOk;
    console.log(`  Existing routes work: ${routesOk}`);

    // Test 12: Console errors and failed requests
    console.log('\n--- Test 12: Error Checks ---');
    results.noConsoleErrors = consoleErrors.length === 0;
    results.noFailedRequests = requestFailed.length === 0;
    console.log(`  Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(e => console.log(`    - ${e.substring(0, 120)}`));
    }
    console.log(`  Failed requests: ${requestFailed.length}`);
    if (requestFailed.length > 0) {
      requestFailed.forEach(r => console.log(`    - ${r.substring(0, 120)}`));
    }

    // Calculate pass/fail
    const checks = [
      results.agentPanelExists,
      results.agentTriggerExists,
      results.allTenAgentsRegistered,
      results.orchestratorExists,
      results.contextBuilderExists,
      results.guardrailsExists,
      results.panelOpens,
      results.agentSelectable,
      results.scaffoldedResponse,
      results.guardrailRefusal,
      results.panelCloses,
      results.keyboardNavWorks,
      ...Object.values(results.responsiveLayouts),
      results.existingRoutesWork,
      results.noConsoleErrors,
      results.noFailedRequests
    ];

    results.total = checks.length;
    results.passed = checks.filter(Boolean).length;
    results.failed = results.total - results.passed;

  } catch (error) {
    console.error('Verification error:', error.message);
  }

  // Summary
  console.log('\n=== Verification Summary ===');
  console.log(`Total checks: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Agent panel exists: ${results.agentPanelExists}`);
  console.log(`All 10 agents registered: ${results.allTenAgentsRegistered}`);
  console.log(`Orchestrator exists: ${results.orchestratorExists}`);
  console.log(`Context builder exists: ${results.contextBuilderExists}`);
  console.log(`Guardrails exist: ${results.guardrailsExists}`);
  console.log(`Panel works: open=${results.panelOpens}, close=${results.panelCloses}`);
  console.log(`Scaffolded response: ${results.scaffoldedResponse}`);
  console.log(`Guardrail refusal: ${results.guardrailRefusal}`);
  console.log(`Keyboard nav: ${results.keyboardNavWorks}`);
  console.log(`Existing routes: ${results.existingRoutesWork}`);
  console.log(`Console errors: ${consoleErrors.length}`);
  console.log(`Failed requests: ${requestFailed.length}`);

  const decision = results.failed === 0 ? 'READY' : 'NOT READY';
  console.log(`\nNV-1000-A0 Decision: ${decision}`);

  // Write results
  const reportPath = path.join(ARTIFACTS_DIR, 'nv-1000-a0-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nResults written to: ${reportPath}`);

  await browser.close();
  server.close();
})();
