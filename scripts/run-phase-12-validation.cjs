/* NV-700 Phase 12 — Exploratory Experience & Knowledge Navigation Excellence Validation */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8080/index.html';
const OUT_DIR = path.join(__dirname, '..', 'docs', 'architecture', 'nv-700', 'phase12-screenshots');
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
  { id: 'canvas-aria-label',  label: 'Canvas has aria-label',             selector: '.nv-atlas-canvas-frame canvas' },
  { id: 'canvas-role',        label: 'Canvas has role="img"',             selector: '.nv-atlas-canvas-frame canvas' },
  { id: 'canvas-tabindex',    label: 'Canvas keyboard reachable',         selector: '.nv-atlas-canvas-frame canvas' },
];

const GUIDE_CHECKS = [
  { id: 'header',           label: 'Header rendered',         selector: '.nv-atlas-context-header' },
  { id: 'role',             label: 'Role subline rendered',    selector: '.nv-atlas-context-role' },
  { id: 'why',              label: 'Why it matters rendered',  selector: '.nv-atlas-context-why' },
  { id: 'guidance',         label: 'Guidance section',         selector: '.nv-atlas-context-guidance' },
  { id: 'suggestions',      label: 'Suggested next list',      selector: '.nv-atlas-context-suggestions' },
  { id: 'identity',         label: 'Identity dl',              selector: '.nv-atlas-context-identity' },
  { id: 'cartography',      label: 'Cartography section',     selector: '.nv-atlas-context-cartography' },
];

const DISCOVERY_CHECKS = [
  { id: 'atlas-via-1', label: 'Atlas visible via 1440 viewport', selector: '.nv-atlas-canvas-frame canvas' },
  { id: 'atlas-via-2', label: 'Atlas visible via 1280 viewport', selector: '.nv-atlas-canvas-frame canvas' },
  { id: 'atlas-via-3', label: 'Atlas visible via 1024 viewport', selector: '.nv-atlas-canvas-frame canvas' },
];

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = {};
  const consoleErrors = {};
  const screenshotPaths = {};
  const guideResults = {};
  const discoveryResults = {};

  for (const vp of VIEWPORTS) {
    results[vp.name] = {};
    consoleErrors[vp.name] = [];
    guideResults[vp.name] = {};
    discoveryResults[vp.name] = {};
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
        } else if (check.id === 'canvas-aria-label') {
          const canvas = await page.locator('.nv-atlas-canvas-frame canvas').first();
          const attr = await canvas.getAttribute('aria-label');
          results[vp.name][check.label] = Boolean(attr);
        } else if (check.id === 'canvas-role') {
          const canvas = await page.locator('.nv-atlas-canvas-frame canvas').first();
          const attr = await canvas.getAttribute('role');
          results[vp.name][check.label] = attr === 'img';
        } else if (check.id === 'canvas-tabindex') {
          const canvas = await page.locator('.nv-atlas-canvas-frame canvas').first();
          const attr = await canvas.getAttribute('tabindex');
          results[vp.name][check.label] = Boolean(attr);
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

    const discovery = await page.evaluate(() => {
      const canvas = document.querySelector('.nv-atlas-canvas-frame canvas');
      const orientation = document.querySelector('[data-atlas-orientation]');
      const story = document.querySelector('[data-atlas-orientation-value]');
      return {
        canvasPresent: Boolean(canvas),
        canvasDimensions: canvas ? { width: canvas.clientWidth, height: canvas.clientHeight } : null,
        orientationVisible: Boolean(orientation),
        storyText: story?.textContent?.trim() ?? null,
      };
    });
    discoveryResults[vp.name] = discovery;
    results[vp.name]['canvas-dimensions'] = discovery.canvasDimensions;

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
              { source: "decoder", target: "transformer", relationshipType: "composes", relationshipCategory: "structural", importance: 0.62 },
              { source: "mlp", target: "transformer", relationshipType: "uses", relationshipCategory: "engineering", importance: 0.58 },
              { source: "norm", target: "transformer", relationshipType: "uses", relationshipCategory: "engineering", importance: 0.55 },
            ],
          },
        },
      });
      window.dispatchEvent(event);
    });
    await page.waitForTimeout(500);

    for (const check of GUIDE_CHECKS) {
      try {
        const element = await page.locator(check.selector).first();
        guideResults[vp.name][check.label] = await element.isVisible();
      } catch (e) {
        guideResults[vp.name][check.label] = false;
      }
    }

    const guideSnapshot = await page.evaluate(() => {
      const readout = document.querySelector('[data-atlas-context-readout]');
      if (!readout) return null;
      const heading = readout.querySelector('.nv-atlas-context-heading');
      const role = readout.querySelector('.nv-atlas-context-role');
      const why = readout.querySelector('.nv-atlas-context-why-copy');
      const suggestions = readout.querySelectorAll('.nv-atlas-context-suggestion');
      const identityRows = readout.querySelectorAll('.nv-atlas-context-identity dt');
      const unlocksItems = readout.querySelectorAll('.nv-atlas-context-guidance .nv-atlas-context-group:nth-of-type(1) li');
      const dependsItems = readout.querySelectorAll('.nv-atlas-context-guidance .nv-atlas-context-group:nth-of-type(2) li');
      return {
        heading: heading?.textContent?.trim() ?? null,
        role: role?.textContent?.trim() ?? null,
        why: why?.textContent?.trim() ?? null,
        suggestionCount: suggestions.length,
        identityRowCount: identityRows.length,
        unlocksCount: unlocksItems.length,
        dependsCount: dependsItems.length,
      };
    });
    results[vp.name]['guide-content'] = guideSnapshot;

    const screenshot = path.join(OUT_DIR, `atlas-phase12-${vp.name}.png`);
    await page.screenshot({ path: screenshot, fullPage: false });
    screenshotPaths[vp.name] = screenshot;

    await context.close();
  }

  await browser.close();

  console.log('\n' + '='.repeat(96));
  console.log('NV-700 PHASE 12 — EXPLORATORY EXPERIENCE VALIDATION');
  console.log('='.repeat(96));

  const allChecks = COGNITIVE_CHECKS.map((c) => c.label);
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

  console.log('\nEXPLORATION GUIDE PANEL EVOLUTION');
  console.log('-'.repeat(96));
  const panelHeader = 'Section'.padEnd(36) + VIEWPORTS.map((v) => v.name.replace(/x/g, '×').padStart(18)).join('');
  console.log(panelHeader);
  console.log('-'.repeat(panelHeader.length));
  for (const check of GUIDE_CHECKS) {
    let row = check.label.padEnd(36);
    for (const vp of VIEWPORTS) {
      const pass = guideResults[vp.name][check.label];
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

  console.log('\nDISCOVERY CUES PER VIEWPORT');
  console.log('-'.repeat(96));
  for (const vp of VIEWPORTS) {
    const d = discoveryResults[vp.name];
    if (!d) continue;
    const dims = d.canvasDimensions ? `${d.canvasDimensions.width}x${d.canvasDimensions.height}` : '—';
    const orient = d.orientationVisible ? '[✓]' : '[✗]';
    console.log(`${vp.name.padEnd(22)} canvas=${dims} orient=${orient} story="${d.storyText ?? '—'}"`);
  }

  console.log('\nEXPLORATION GUIDE CONTENT');
  console.log('-'.repeat(96));
  for (const vp of VIEWPORTS) {
    const g = results[vp.name]['guide-content'];
    if (!g) {
      console.log(`${vp.name.padEnd(22)} [no guide]`);
      continue;
    }
    const heading = g.heading ?? '—';
    const role = g.role ?? '—';
    console.log(`${vp.name.padEnd(22)} "${heading}" role="${role}" unlocks=${g.unlocksCount} depends=${g.dependsCount} suggestions=${g.suggestionCount}`);
  }

  console.log('\nWHY IT MATTERS (sample)');
  console.log('-'.repeat(96));
  for (const vp of VIEWPORTS) {
    const g = results[vp.name] && results[vp.name]['guide-content'];
    if (g && typeof g.why === 'string' && g.why.length > 0) {
      console.log(`${vp.name.padEnd(22)} "${g.why}"`);
    } else {
      console.log(`${vp.name.padEnd(22)} (no why captured)`);
    }
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
