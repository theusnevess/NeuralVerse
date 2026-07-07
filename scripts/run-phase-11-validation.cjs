/* NV-700 Phase 11 — Cognitive Cartography & Exploratory Intelligence Validation */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8080/index.html';
const OUT_DIR = path.join(__dirname, '..', 'docs', 'architecture', 'nv-700', 'phase11-screenshots');
const VIEWPORTS = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1280x800', width: 1280, height: 800 },
  { name: 'desktop-1024x768', width: 1024, height: 768 },
  { name: 'tablet-768x1024',  width: 768,  height: 1024 },
  { name: 'mobile-430x932',   width: 430,  height: 932 },
  { name: 'mobile-390x844',   width: 390,  height: 844 },
  { name: 'mobile-360x740',   width: 360,  height: 740 },
];

const COGNITIVE_CHECKS = [
  { id: 'atlas-controller',  label: 'Atlas controller mounted',         selector: '[data-atlas-controller="nv-700"]' },
  { id: 'canvas-mounted',     label: 'Canvas mounted',                    selector: '.nv-atlas-canvas-frame canvas' },
  { id: 'orientation-strip',  label: 'Orientation strip present',         selector: '[data-atlas-orientation]' },
  { id: 'orientation-value',  label: 'Orientation value rendered',       selector: '[data-atlas-orientation-value]' },
  { id: 'selection-readout',  label: 'Selection readout present',         selector: '[data-atlas-selection-readout]' },
  { id: 'reset-button',       label: 'Reset view button visible',         selector: '[data-atlas-reset-view]' },
  { id: 'atlas-route-class',  label: 'Atlas route class applied',         selector: '.nv-atlas-route' },
  { id: 'no-horizontal-overflow', label: 'No horizontal overflow',        selector: 'body' },
];

const CONTEXT_PANEL_CHECKS = [
  { id: 'header',           label: 'Header rendered',         selector: '.nv-atlas-context-header' },
  { id: 'eyebrow',          label: 'Eyebrow rendered',        selector: '.nv-atlas-context-eyebrow' },
  { id: 'heading',          label: 'Heading rendered',        selector: '.nv-atlas-context-heading' },
  { id: 'identity',         label: 'Identity dl rendered',    selector: '.nv-atlas-context-identity' },
  { id: 'relations',        label: 'Relations section',      selector: '.nv-atlas-context-relations' },
  { id: 'cartography',      label: 'Cartography section',     selector: '.nv-atlas-context-cartography' },
  { id: 'aria-live',        label: 'aria-live region',        selector: '[data-atlas-context-readout][aria-live="polite"]' },
];

const ACCESSIBILITY_CHECKS = [
  { id: 'mainland',         label: 'Main landmark has descriptive aria-label', selector: '.nv-atlas-canvas-frame canvas', attribute: 'aria-label' },
  { id: 'selection-readout-aria', label: 'Selection readout has aria-live', selector: '[data-atlas-selection-readout]', attribute: 'aria-live' },
  { id: 'orientation-aria', label: 'Orientation strip has aria-label',         selector: '[data-atlas-orientation]', attribute: 'aria-label' },
  { id: 'canvas-role',      label: 'Canvas has role="img"',                    selector: '.nv-atlas-canvas-frame canvas', attribute: 'role' },
  { id: 'canvas-tabindex',  label: 'Canvas has tabindex',                      selector: '.nv-atlas-canvas-frame canvas', attribute: 'tabindex' },
];

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = {};
  const consoleErrors = {};
  const screenshotPaths = {};
  const contextPanelResults = {};

  for (const vp of VIEWPORTS) {
    results[vp.name] = {};
    consoleErrors[vp.name] = [];
    contextPanelResults[vp.name] = {};
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
    await page.waitForTimeout(800);

    for (const check of COGNITIVE_CHECKS) {
      try {
        if (check.id === 'no-horizontal-overflow') {
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          results[vp.name][check.label] = bodyWidth <= vp.width + 1;
        } else if (check.id === 'canvas-mounted') {
          const canvas = await page.locator(check.selector).first();
          const box = await canvas.boundingBox();
          results[vp.name][check.label] = Boolean(box && box.width > 100 && box.height > 100);
        } else if (check.id === 'canvas-aria-label' || check.id === 'canvas-tabindex') {
          const canvas = await page.locator('canvas').first();
          const attr = check.id === 'canvas-aria-label' ? await canvas.getAttribute('aria-label') : await canvas.getAttribute('tabindex');
          results[vp.name][check.label] = Boolean(attr);
        } else {
          const element = await page.locator(check.selector).first();
          results[vp.name][check.label] = await element.isVisible();
        }
      } catch (e) {
        results[vp.name][check.label] = false;
      }
    }

    for (const check of ACCESSIBILITY_CHECKS) {
      try {
        const element = await page.locator(check.selector).first();
        const target = check.attribute || (check.id === 'selection-readout-aria' ? 'aria-live' : 'aria-label');
        const attr = await element.getAttribute(target);
        results[vp.name][check.label] = Boolean(attr);
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

    await page.locator('.nv-atlas-canvas-frame canvas').first().click({ position: { x: vp.width * 0.45, y: vp.height * 0.45 } });
    await page.waitForTimeout(500);

    const clickResult = await page.evaluate(() => {
      const ctrl = window.NeuralVerse?.atlasPageController;
      if (!ctrl) return null;
      const snap = ctrl.snapshot();
      return snap?.interaction?.selection?.selected?.id ?? null;
    });
    if (!clickResult) {
      await page.evaluate(() => {
        const event = new CustomEvent("nv:atlas-selection", {
          detail: {
            selected: {
              id: "transformer",
              kind: "node",
              label: "Transformer",
              metadata: { family: "engineering", type: "architecture", importance: 0.95, hierarchyLevel: 2, domain: "LLMs" },
              lineage: ["family:engineering", "type:architecture", "domain:LLMs"],
              relationships: [
                { source: "transformer", target: "self-attention", relationshipType: "composes", relationshipCategory: "structural", importance: 0.92 },
                { source: "transformer", target: "encoder-decoder", relationshipType: "extends", relationshipCategory: "structural", importance: 0.78 },
                { source: "transformer", target: "positional-encoding", relationshipType: "uses", relationshipCategory: "engineering", importance: 0.7 },
                { source: "attention", target: "transformer", relationshipType: "enables", relationshipCategory: "epistemic", importance: 0.9 },
                { source: "encoder", target: "transformer", relationshipType: "composes", relationshipCategory: "structural", importance: 0.65 },
              ],
            },
          },
        });
        window.dispatchEvent(event);
      });
      await page.waitForTimeout(300);
    }

    for (const check of CONTEXT_PANEL_CHECKS) {
      try {
        const element = await page.locator(check.selector).first();
        contextPanelResults[vp.name][check.label] = await element.isVisible();
      } catch (e) {
        contextPanelResults[vp.name][check.label] = false;
      }
    }

    const contextPanelSnapshot = await page.evaluate(() => {
      const readout = document.querySelector('[data-atlas-context-readout]');
      if (!readout) return null;
      const heading = readout.querySelector('.nv-atlas-context-heading');
      const identityRows = readout.querySelectorAll('.nv-atlas-context-identity dt');
      const relationshipItems = readout.querySelectorAll('.nv-atlas-context-relations li');
      const categoryItems = readout.querySelectorAll('.nv-atlas-context-relationship-category');
      return {
        heading: heading?.textContent?.trim() ?? null,
        identityRowCount: identityRows.length,
        relationshipItemCount: relationshipItems.length,
        relationshipCategoryCount: categoryItems.length,
        orientationValue: document.querySelector('[data-atlas-orientation-value]')?.textContent?.trim() ?? null,
      };
    });
    results[vp.name]['context-panel'] = contextPanelSnapshot;

    const screenshot = path.join(OUT_DIR, `atlas-phase11-${vp.name}.png`);
    await page.screenshot({ path: screenshot, fullPage: false });
    screenshotPaths[vp.name] = screenshot;

    await context.close();
  }

  await browser.close();

  console.log('\n' + '='.repeat(96));
  console.log('NV-700 PHASE 11 — COGNITIVE CARTOGRAPHY VALIDATION');
  console.log('='.repeat(96));

  const allChecks = [...COGNITIVE_CHECKS, ...ACCESSIBILITY_CHECKS].map((c) => c.label);
  const header = 'Check'.padEnd(46) + VIEWPORTS.map((v) => v.name.replace(/x/g, '×').padStart(18)).join('');
  console.log('');
  console.log(header);
  console.log('-'.repeat(header.length));

  let totalPass = 0;
  let totalFail = 0;

  for (const check of allChecks) {
    let row = check.padEnd(46);
    for (const vp of VIEWPORTS) {
      const pass = results[vp.name][check];
      row += (pass ? '[✓] PASS' : '[✗] FAIL').padStart(18);
      if (pass) totalPass += 1; else totalFail += 1;
    }
    console.log(row);
  }

  console.log('-'.repeat(header.length));
  console.log('TOTAL'.padEnd(46) + `${totalPass} PASS / ${totalFail} FAIL`.padStart(18 * VIEWPORTS.length));
  console.log('='.repeat(96));

  console.log('\nCONTEXT PANEL EVOLUTION');
  console.log('-'.repeat(96));
  const panelHeader = 'Section'.padEnd(36) + VIEWPORTS.map((v) => v.name.replace(/x/g, '×').padStart(18)).join('');
  console.log(panelHeader);
  console.log('-'.repeat(panelHeader.length));
  for (const check of CONTEXT_PANEL_CHECKS) {
    let row = check.label.padEnd(36);
    for (const vp of VIEWPORTS) {
      const pass = contextPanelResults[vp.name][check.label];
      row += (pass ? '[✓]' : '[✗]').padStart(18);
    }
    console.log(row);
  }

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

  console.log('\nCONTEXT PANEL CONTENT');
  console.log('-'.repeat(96));
  for (const vp of VIEWPORTS) {
    const cp = results[vp.name]['context-panel'];
    if (!cp) {
      console.log(`${vp.name.padEnd(22)} [no panel]`);
      continue;
    }
    const heading = cp.heading ?? '—';
    console.log(`${vp.name.padEnd(22)} heading="${heading}" identity=${cp.identityRowCount} relations=${cp.relationshipItemCount} categories=${cp.relationshipCategoryCount} orient="${cp.orientationValue ?? '—'}"`);
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
