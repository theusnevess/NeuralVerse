/* NV-700 Phase 10 — Cartographic Refinement Playwright Validation */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8080/index.html';
const OUT_DIR = path.join(__dirname, '..', 'docs', 'architecture', 'nv-700', 'phase10-screenshots');
const VIEWPORTS = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1280x800', width: 1280, height: 800 },
  { name: 'desktop-1024x768', width: 1024, height: 768 },
  { name: 'tablet-768x1024',  width: 768,  height: 1024 },
  { name: 'mobile-430x932',   width: 430,  height: 932 },
  { name: 'mobile-390x844',   width: 390,  height: 844 },
  { name: 'mobile-360x740',   width: 360,  height: 740 },
];

const CARTOGRAPHIC_CHECKS = [
  { id: 'frame-present',       label: 'Atlas frame present',          selector: '[data-atlas-controller="nv-700"]' },
  { id: 'canvas-mounted',      label: 'Canvas mounted',                selector: 'canvas[data-atlas-summary], .nv-atlas-canvas-frame canvas' },
  { id: 'header-eyebrow',      label: 'Header eyebrow rendered',       selector: '.nv-atlas-eyebrow' },
  { id: 'title-rendered',      label: 'Title rendered',                selector: '.nv-atlas-title' },
  { id: 'reset-button',        label: 'Reset view button visible',     selector: '[data-atlas-reset-view]' },
  { id: 'selection-readout',   label: 'Selection readout present',     selector: '[data-atlas-selection-readout]' },
  { id: 'atlas-route-class',   label: 'Atlas route class applied',     selector: '.nv-atlas-route' },
  { id: 'no-horizontal-overflow', label: 'No horizontal overflow',      selector: 'body' },
];

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = {};
  const consoleErrors = {};
  const screenshotPaths = {};

  for (const vp of VIEWPORTS) {
    results[vp.name] = {};
    consoleErrors[vp.name] = [];
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors[vp.name].push(msg.text());
    });
    page.on('pageerror', (err) => {
      consoleErrors[vp.name].push(`pageerror: ${err.message}`);
    });

    try {
      await page.goto(`${BASE}#/knowledge-graph`, { waitUntil: 'networkidle' });
    } catch (e) {
      results[vp.name]['navigation'] = false;
      await context.close();
      continue;
    }

    await page.waitForSelector('.nv-atlas-canvas-frame canvas', { timeout: 12000 });
    await page.waitForTimeout(900);

    for (const check of CARTOGRAPHIC_CHECKS) {
      try {
        if (check.id === 'no-horizontal-overflow') {
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          results[vp.name][check.label] = bodyWidth <= vp.width + 1;
        } else if (check.id === 'canvas-mounted') {
          const canvas = await page.locator(check.selector).first();
          const box = await canvas.boundingBox();
          results[vp.name][check.label] = Boolean(box && box.width > 100 && box.height > 100);
        } else {
          const element = await page.locator(check.selector).first();
          results[vp.name][check.label] = await element.isVisible();
        }
      } catch (e) {
        results[vp.name][check.label] = false;
      }
    }

    const atlasSnapshot = await page.evaluate(() => {
      const ctrl = window.NeuralVerse?.atlasPageController;
      if (!ctrl) return null;
      const snap = ctrl.snapshot();
      return snap ? {
        status: snap.status,
        projection: snap.projection,
        nodeCount: snap.nodeCount,
        edgeCount: snap.edgeCount,
        drawCalls: snap.render?.metrics?.drawCalls ?? null,
        visibleNodes: snap.render?.metrics?.visibleNodes ?? null,
        visibleEdges: snap.render?.metrics?.visibleEdges ?? null,
        visibleLabels: snap.render?.metrics?.visibleLabels ?? null,
        fps: snap.render?.metrics?.fps ?? null,
        frameTimeMs: snap.render?.metrics?.frameTimeMs ?? null,
        payloadId: snap.payloadId,
      } : null;
    });
    results[vp.name]['atlas-metrics'] = atlasSnapshot;

    const continentCount = await page.evaluate(() => {
      return new Promise((resolve) => {
        const start = performance.now();
        const check = () => {
          const ctrl = window.NeuralVerse?.atlasPageController;
          if (ctrl) {
            const snap = ctrl.snapshot();
            resolve(snap?.nodeCount ?? 0);
          } else if (performance.now() - start > 5000) {
            resolve(0);
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });
    });
    results[vp.name]['continent-count'] = continentCount;

    const screenshot = path.join(OUT_DIR, `atlas-phase10-${vp.name}.png`);
    await page.screenshot({ path: screenshot, fullPage: false });
    screenshotPaths[vp.name] = screenshot;

    await context.close();
  }

  await browser.close();

  console.log('\n' + '='.repeat(96));
  console.log('NV-700 PHASE 10 — CARTOGRAPHIC REFINEMENT VALIDATION');
  console.log('='.repeat(96));

  const checkLabels = ['Atlas frame present', 'Canvas mounted', 'Header eyebrow rendered', 'Title rendered', 'Reset view button visible', 'Selection readout present', 'Atlas route class applied', 'No horizontal overflow'];
  const header = 'Check'.padEnd(34) + VIEWPORTS.map(v => v.name.replace(/x/g, '×').padStart(18)).join('');
  console.log('');
  console.log(header);
  console.log('-'.repeat(header.length));

  let totalPass = 0;
  let totalFail = 0;

  for (const check of checkLabels) {
    let row = check.padEnd(34);
    for (const vp of VIEWPORTS) {
      const pass = results[vp.name][check];
      row += (pass ? '[✓] PASS' : '[✗] FAIL').padStart(18);
      if (pass) totalPass += 1; else totalFail += 1;
    }
    console.log(row);
  }

  console.log('-'.repeat(header.length));
  console.log('TOTAL'.padEnd(34) + `${totalPass} PASS / ${totalFail} FAIL`.padStart(18 * VIEWPORTS.length));
  console.log('='.repeat(96));

  console.log('\nATLAS METRICS PER VIEWPORT');
  console.log('-'.repeat(96));
  for (const vp of VIEWPORTS) {
    const m = results[vp.name]['atlas-metrics'];
    if (!m) {
      console.log(`${vp.name.padEnd(22)} status: unavailable`);
      continue;
    }
    console.log(`${vp.name.padEnd(22)} status=${m.status} draw=${m.drawCalls} nodes=${m.visibleNodes} edges=${m.visibleEdges} labels=${m.visibleLabels} fps=${m.fps?.toFixed(1)} frame=${m.frameTimeMs?.toFixed(2)}ms`);
  }

  console.log('\nCONSOLE ERRORS');
  console.log('-'.repeat(96));
  let errorCount = 0;
  for (const vp of VIEWPORTS) {
    const errors = consoleErrors[vp.name];
    if (errors.length === 0) {
      console.log(`${vp.name.padEnd(22)} [clean]`);
    } else {
      errorCount += errors.length;
      console.log(`${vp.name.padEnd(22)} ${errors.length} error(s):`);
      for (const err of errors) console.log(`    - ${err}`);
    }
  }

  console.log('\nSCREENSHOTS');
  console.log('-'.repeat(96));
  for (const vp of VIEWPORTS) {
    if (screenshotPaths[vp.name]) {
      const stat = fs.statSync(screenshotPaths[vp.name]);
      console.log(`${vp.name.padEnd(22)} ${screenshotPaths[vp.name]} (${(stat.size / 1024).toFixed(1)} kB)`);
    }
  }

  console.log('\nSUMMARY');
  console.log('-'.repeat(96));
  console.log(`Total checks:    ${totalPass + totalFail}`);
  console.log(`Passed:          ${totalPass}`);
  console.log(`Failed:          ${totalFail}`);
  console.log(`Console errors:  ${errorCount}`);
  console.log(`Screenshots:     ${Object.keys(screenshotPaths).length}`);
  process.exit(totalFail > 0 || errorCount > 0 ? 1 : 0);
})();
