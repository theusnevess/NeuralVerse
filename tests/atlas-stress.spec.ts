import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:8080';
const ATLAS_ROUTE = `${BASE}/#/knowledge-graph`;
const DIR = 'test-results/atlas-stress';

const findings: Array<{ id: string; severity: string; category: string; description: string }> = [];
let findingCounter = 0;
function addFinding(severity: string, category: string, description: string) {
  findingCounter++;
  findings.push({ id: `NV-${findingCounter}`, severity, category, description });
}

function setupConsoleTracking(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const resizeErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.text().includes('ResizeObserver')) resizeErrors.push(msg.text());
  });
  page.on('pageerror', err => pageErrors.push(err.message));
  return { consoleErrors, pageErrors, resizeErrors };
}

async function waitForAtlas(page: Page, timeout = 15000) {
  try {
    await page.waitForSelector('canvas', { timeout });
    await page.waitForFunction(() => {
      const canvas = document.querySelectorAll('canvas')[1];
      return canvas && canvas.width > 0 && canvas.height > 0;
    }, { timeout: 10000 });
    await page.waitForTimeout(2000);
  } catch {
    addFinding('P0', 'Route', 'Atlas canvas did not initialize');
  }
}

// ═══════════════════════════════════════════════════════════════
// STRESS TEST: Repeated Refresh ×50
// ═══════════════════════════════════════════════════════════════
test('Stress: Repeated refresh ×50', async ({ page }) => {
  const tracking = setupConsoleTracking(page);
  
  for (let i = 0; i < 50; i++) {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
  }
  
  await page.waitForTimeout(2000);
  
  if (tracking.pageErrors.length > 0) {
    addFinding('P1', 'Refresh', `Page errors during 50 refreshes: ${tracking.pageErrors.slice(0, 3).join('; ')}`);
  }
  if (tracking.resizeErrors.length > 0) {
    addFinding('P1', 'Refresh', `ResizeObserver errors during 50 refreshes: ${tracking.resizeErrors.length}`);
  }
  if (tracking.consoleErrors.length > 0) {
    addFinding('P2', 'Refresh', `Console errors during 50 refreshes: ${tracking.consoleErrors.slice(0, 3).join('; ')}`);
  }
  
  const canvasCount = await page.evaluate(() => document.querySelectorAll('canvas').length);
  if (canvasCount > 2) {
    addFinding('P1', 'Refresh', `Canvas count grew to ${canvasCount} after 50 refreshes (expected ≤2)`);
  }
  
  console.log(`Refresh stress: ${tracking.pageErrors.length} page errors, ${tracking.resizeErrors.length} resize errors, ${tracking.consoleErrors.length} console errors`);
});

// ═══════════════════════════════════════════════════════════════
// STRESS TEST: Repeated Route Navigation ×100
// ═══════════════════════════════════════════════════════════════
test('Stress: Repeated route navigation ×100', async ({ page }) => {
  const tracking = setupConsoleTracking(page);
  
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await waitForAtlas(page);
  
  for (let i = 0; i < 100; i++) {
    await page.goto(`${BASE}/#/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(100);
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(100);
  }
  
  await page.waitForTimeout(2000);
  
  if (tracking.pageErrors.length > 0) {
    addFinding('P1', 'Navigation', `Page errors during 100 nav cycles: ${tracking.pageErrors.slice(0, 3).join('; ')}`);
  }
  if (tracking.resizeErrors.length > 0) {
    addFinding('P1', 'Navigation', `ResizeObserver errors during 100 nav cycles: ${tracking.resizeErrors.length}`);
  }
  
  const canvasCount = await page.evaluate(() => document.querySelectorAll('canvas').length);
  const listenerCount = await page.evaluate(() => {
    const root = document.querySelector('[data-knowledge-graph-root]');
    return root ? root.getAttribute('data-atlas-controller') : null;
  });
  
  console.log(`Navigation stress: canvas=${canvasCount}, controller=${listenerCount}, errors=${tracking.pageErrors.length}`);
});

// ═══════════════════════════════════════════════════════════════
// STRESS TEST: Rapid Resize ×100
// ═══════════════════════════════════════════════════════════════
test('Stress: Rapid resize ×100', async ({ page }) => {
  const tracking = setupConsoleTracking(page);
  
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await waitForAtlas(page);
  
  const sizes = [
    { w: 1440, h: 900 }, { w: 800, h: 600 }, { w: 390, h: 844 },
    { w: 1280, h: 800 }, { w: 1024, h: 768 }, { w: 768, h: 1024 },
    { w: 360, h: 740 }, { w: 430, h: 932 }, { w: 1920, h: 1080 },
  ];
  
  for (let i = 0; i < 100; i++) {
    const size = sizes[i % sizes.length];
    await page.setViewportSize({ width: size.w, height: size.h });
    await page.waitForTimeout(30);
  }
  
  await page.waitForTimeout(2000);
  
  if (tracking.resizeErrors.length > 0) {
    addFinding('P1', 'Resize', `ResizeObserver errors during 100 resizes: ${tracking.resizeErrors.length}`);
  }
  if (tracking.pageErrors.length > 0) {
    addFinding('P1', 'Resize', `Page errors during 100 resizes: ${tracking.pageErrors.join('; ')}`);
  }
  
  console.log(`Resize stress: resize errors=${tracking.resizeErrors.length}, page errors=${tracking.pageErrors.length}`);
});

// ═══════════════════════════════════════════════════════════════
// STRESS TEST: Rapid Zoom ×200
// ═══════════════════════════════════════════════════════════════
test('Stress: Rapid zoom ×200', async ({ page }) => {
  const tracking = setupConsoleTracking(page);
  
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await waitForAtlas(page);
  
  const canvas = await page.$('canvas');
  const box = await canvas!.boundingBox();
  const centerX = box!.x + box!.width / 2;
  const centerY = box!.y + box!.height / 2;
  
  await page.mouse.move(centerX, centerY);
  
  for (let i = 0; i < 200; i++) {
    await page.mouse.wheel(0, i % 2 === 0 ? -50 : 50);
    if (i % 20 === 0) await page.waitForTimeout(16);
  }
  
  await page.waitForTimeout(1000);
  
  if (tracking.pageErrors.length > 0) {
    addFinding('P1', 'Zoom', `Page errors during 200 zooms: ${tracking.pageErrors.slice(0, 3).join('; ')}`);
  }
  if (tracking.resizeErrors.length > 0) {
    addFinding('P2', 'Zoom', `ResizeObserver errors during 200 zooms: ${tracking.resizeErrors.length}`);
  }
  
  console.log(`Zoom stress: page errors=${tracking.pageErrors.length}, resize errors=${tracking.resizeErrors.length}`);
});

// ═══════════════════════════════════════════════════════════════
// STRESS TEST: Rapid Pan ×200
// ═══════════════════════════════════════════════════════════════
test('Stress: Rapid pan ×200', async ({ page }) => {
  const tracking = setupConsoleTracking(page);
  
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await waitForAtlas(page);
  
  const canvas = await page.$('canvas');
  const box = await canvas!.boundingBox();
  const centerX = box!.x + box!.width / 2;
  const centerY = box!.y + box!.height / 2;
  
  for (let i = 0; i < 200; i++) {
    const dx = (i % 4 === 0 ? 30 : i % 4 === 1 ? -30 : i % 4 === 2 ? 0 : 0);
    const dy = (i % 4 === 0 ? 0 : i % 4 === 1 ? 0 : i % 4 === 2 ? 30 : -30);
    await page.mouse.move(centerX + dx, centerY + dy);
    if (i % 10 === 0) {
      await page.mouse.down();
      await page.mouse.move(centerX + dx + 20, centerY + dy + 20, { steps: 3 });
      await page.mouse.up();
    }
  }
  
  await page.waitForTimeout(1000);
  
  if (tracking.pageErrors.length > 0) {
    addFinding('P1', 'Pan', `Page errors during 200 pans: ${tracking.pageErrors.slice(0, 3).join('; ')}`);
  }
  
  console.log(`Pan stress: page errors=${tracking.pageErrors.length}`);
});

// ═══════════════════════════════════════════════════════════════
// STRESS TEST: Rapid Click ×500
// ═══════════════════════════════════════════════════════════════
test('Stress: Rapid click ×500', async ({ page }) => {
  const tracking = setupConsoleTracking(page);
  
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await waitForAtlas(page);
  
  const canvas = await page.$('canvas');
  const box = await canvas!.boundingBox();
  
  for (let i = 0; i < 500; i++) {
    const x = box!.x + Math.random() * box!.width;
    const y = box!.y + Math.random() * box!.height;
    await page.mouse.click(x, y);
    if (i % 50 === 0) await page.waitForTimeout(16);
  }
  
  await page.waitForTimeout(1000);
  
  if (tracking.pageErrors.length > 0) {
    addFinding('P1', 'Click', `Page errors during 500 clicks: ${tracking.pageErrors.slice(0, 3).join('; ')}`);
  }
  if (tracking.resizeErrors.length > 0) {
    addFinding('P2', 'Click', `ResizeObserver errors during 500 clicks: ${tracking.resizeErrors.length}`);
  }
  
  console.log(`Click stress: page errors=${tracking.pageErrors.length}, resize errors=${tracking.resizeErrors.length}`);
});

// ═══════════════════════════════════════════════════════════════
// STRESS TEST: Random Interaction ×1000
// ═══════════════════════════════════════════════════════════════
test('Stress: Random interaction ×1000', async ({ page }) => {
  const tracking = setupConsoleTracking(page);
  
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await waitForAtlas(page);
  
  const canvas = await page.$('canvas');
  const box = await canvas!.boundingBox();
  
  for (let i = 0; i < 1000; i++) {
    const action = Math.random();
    const x = box!.x + Math.random() * box!.width;
    const y = box!.y + Math.random() * box!.height;
    
    if (action < 0.3) {
      await page.mouse.click(x, y);
    } else if (action < 0.5) {
      await page.mouse.move(x, y);
    } else if (action < 0.7) {
      await page.mouse.wheel(0, (Math.random() - 0.5) * 200);
    } else if (action < 0.85) {
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 60, { steps: 3 });
      await page.mouse.up();
    } else {
      await page.keyboard.press(['Escape', 'Tab', 'ArrowRight', 'ArrowDown'][Math.floor(Math.random() * 4)]);
    }
    
    if (i % 100 === 0) await page.waitForTimeout(16);
  }
  
  await page.waitForTimeout(2000);
  
  if (tracking.pageErrors.length > 0) {
    addFinding('P1', 'Random', `Page errors during 1000 random interactions: ${tracking.pageErrors.slice(0, 5).join('; ')}`);
  }
  if (tracking.resizeErrors.length > 0) {
    addFinding('P2', 'Random', `ResizeObserver errors during 1000 random interactions: ${tracking.resizeErrors.length}`);
  }
  
  console.log(`Random stress: page errors=${tracking.pageErrors.length}, resize errors=${tracking.resizeErrors.length}`);
});

// ═══════════════════════════════════════════════════════════════
// STRESS TEST: Tab Hide/Show ×50
// ═══════════════════════════════════════════════════════════════
test('Stress: Tab hide/show ×50', async ({ page }) => {
  const tracking = setupConsoleTracking(page);
  
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await waitForAtlas(page);
  
  for (let i = 0; i < 50; i++) {
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(50);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(50);
  }
  
  await page.waitForTimeout(1000);
  
  if (tracking.pageErrors.length > 0) {
    addFinding('P2', 'Visibility', `Page errors during 50 visibility changes: ${tracking.pageErrors.join('; ')}`);
  }
  
  console.log(`Visibility stress: page errors=${tracking.pageErrors.length}`);
});

// ═══════════════════════════════════════════════════════════════
// STRESS TEST: devicePixelRatio Simulation
// ═══════════════════════════════════════════════════════════════
test('Stress: devicePixelRatio changes', async ({ page }) => {
  const tracking = setupConsoleTracking(page);
  
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await waitForAtlas(page);
  
  const canvas = await page.$('canvas');
  const box = await canvas!.boundingBox();
  
  // Simulate different DPR
  for (const dpr of [1, 1.5, 2, 2.5, 3, 1]) {
    await page.evaluate((ratio) => {
      Object.defineProperty(window, 'devicePixelRatio', { value: ratio, writable: true });
      window.dispatchEvent(new Event('resize'));
    }, dpr);
    await page.waitForTimeout(200);
    
    // Trigger resize observer
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
  }
  
  await page.waitForTimeout(1000);
  
  if (tracking.pageErrors.length > 0) {
    addFinding('P2', 'DPR', `Page errors during DPR changes: ${tracking.pageErrors.join('; ')}`);
  }
  
  console.log(`DPR stress: page errors=${tracking.pageErrors.length}`);
});

// ═══════════════════════════════════════════════════════════════
// STRESS TEST: Controller Destroy/Recreate ×20
// ═══════════════════════════════════════════════════════════════
test('Stress: Controller destroy/recreate ×20', async ({ page }) => {
  const tracking = setupConsoleTracking(page);
  
  for (let i = 0; i < 20; i++) {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Navigate away to trigger destroy
    await page.goto(`${BASE}/#/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(200);
  }
  
  await page.waitForTimeout(2000);
  
  if (tracking.pageErrors.length > 0) {
    addFinding('P1', 'Lifecycle', `Page errors during 20 destroy/recreate cycles: ${tracking.pageErrors.slice(0, 3).join('; ')}`);
  }
  if (tracking.resizeErrors.length > 0) {
    addFinding('P1', 'Lifecycle', `ResizeObserver errors during 20 destroy/recreate cycles: ${tracking.resizeErrors.length}`);
  }
  
  console.log(`Lifecycle stress: page errors=${tracking.pageErrors.length}, resize errors=${tracking.resizeErrors.length}`);
});

// ═══════════════════════════════════════════════════════════════
// VALIDATION: Final State Check
// ═══════════════════════════════════════════════════════════════
test('Validation: Atlas functional after all stress tests', async ({ page }) => {
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await waitForAtlas(page);
  
  const state = await page.evaluate(() => {
    const canvas = document.querySelectorAll('canvas')[1];
    const ctx = canvas?.getContext('2d');
    let hasContent = false;
    if (ctx) {
      const data = ctx.getImageData(0, 0, Math.min(canvas.width, 50), Math.min(canvas.height, 50)).data;
      hasContent = Array.from(data).some((v, i) => i % 4 !== 3 && v > 0);
    }
    return {
      canvasExists: !!canvas,
      canvasWidth: canvas?.width ?? 0,
      canvasHeight: canvas?.height ?? 0,
      hasContent,
      title: document.querySelector('h1')?.textContent?.trim(),
      orientationVisible: !!document.querySelector('.nv-atlas-orientation'),
      contextPanelVisible: !!document.querySelector('.nv-context-panel'),
    };
  });
  
  expect(state.canvasExists).toBe(true);
  expect(state.canvasWidth).toBeGreaterThan(100);
  expect(state.canvasHeight).toBeGreaterThan(100);
  expect(state.hasContent).toBe(true);
  expect(state.title).toBe('Atlas');
  
  await page.screenshot({ path: `${DIR}/final-state.png`, fullPage: true });
  console.log(`Final state: canvas=${state.canvasWidth}x${state.canvasHeight}, content=${state.hasContent}`);
});

// ═══════════════════════════════════════════════════════════════
// FINDINGS SUMMARY
// ═══════════════════════════════════════════════════════════════
test('Print stress test findings', async () => {
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('STRESS TEST FINDINGS');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const bySeverity = findings.reduce((acc, f) => {
    acc[f.severity] = acc[f.severity] || [];
    acc[f.severity].push(f);
    return acc;
  }, {} as Record<string, typeof findings>);
  
  for (const severity of ['P0', 'P1', 'P2', 'P3']) {
    const items = bySeverity[severity] || [];
    if (items.length > 0) {
      console.log(`\n${severity} (${items.length}):`);
      for (const f of items) {
        console.log(`  [${f.id}] [${f.category}] ${f.description}`);
      }
    }
  }
  
  if (findings.length === 0) {
    console.log('\n✓ No findings — all stress tests passed cleanly');
  }
  
  console.log(`\nTotal findings: ${findings.length}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
});
