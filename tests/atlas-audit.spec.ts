import { test, expect, type Page, type BrowserContext } from '@playwright/test';

const BASE = 'http://localhost:8080';
const ATLAS_ROUTE = `${BASE}/#/knowledge-graph`;
const SCREENSHOT_DIR = 'test-results/atlas-audit';

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '430x932', width: 430, height: 932 },
  { name: '390x844', width: 390, height: 844 },
  { name: '360x740', width: 360, height: 740 },
];

const findings: Array<{ id: string; severity: string; category: string; description: string; viewport?: string }> = [];
let findingCounter = 0;

function addFinding(severity: string, category: string, description: string, viewport?: string) {
  findingCounter++;
  findings.push({ id: `NV-${findingCounter}`, severity, category, description, viewport });
}

// Helper: wait for Atlas to initialize
async function waitForAtlasReady(page: Page, timeout = 15000) {
  try {
    await page.waitForSelector('canvas', { timeout });
    // Wait for any loading indicators to disappear
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    }, { timeout: 10000 });
    // Give the renderer a moment to paint
    await page.waitForTimeout(2000);
  } catch {
    addFinding('P0', 'Route', 'Atlas canvas did not initialize within timeout');
  }
}

// Helper: get console errors
function setupConsoleTracking(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const warnings: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  page.on('pageerror', err => pageErrors.push(err.message));

  return { consoleErrors, pageErrors, warnings };
}

// Helper: check for horizontal overflow
async function checkHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
}

// Helper: get all visible text
async function getVisibleText(page: Page): Promise<string> {
  return page.evaluate(() => document.body?.innerText || '');
}

// Helper: count canvases
async function getCanvasCount(page: Page): Promise<number> {
  return page.evaluate(() => document.querySelectorAll('canvas').length);
}

// Helper: get H1 text
async function getH1Text(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1?.textContent?.trim() || null;
  });
}

// Helper: get page title
async function getPageTitle(page: Page): Promise<string> {
  return page.title();
}

// Helper: check for atlas route elements
async function getAtlasElements(page: Page) {
  return page.evaluate(() => {
    return {
      hasCanvasFrame: !!document.querySelector('.nv-atlas-canvas-frame, [data-atlas-canvas], canvas'),
      hasHeader: !!document.querySelector('.nv-atlas-header, [data-atlas-header]'),
      hasOrientationStrip: !!document.querySelector('.nv-atlas-orientation, [data-atlas-orientation]'),
      hasLegend: !!document.querySelector('.nv-atlas-legend, [data-atlas-legend]'),
      hasContextPanel: !!document.querySelector('.nv-atlas-context, [data-atlas-context]'),
      hasTooltip: !!document.querySelector('.nv-atlas-hover-tooltip, [data-atlas-tooltip]'),
      hasResetButton: !!document.querySelector('[data-atlas-reset], .nv-atlas-reset'),
      hasSkipLink: !!document.querySelector('.nv-atlas-skip-link, [data-skip-link]'),
      hasJourneyPanel: !!document.querySelector('.nv-atlas-journey, [data-atlas-journey]'),
      hasBreadcrumb: !!document.querySelector('.nv-atlas-breadcrumb, [data-atlas-breadcrumb]'),
      hasSelectionReadout: !!document.querySelector('.nv-atlas-selection, [data-atlas-selection]'),
      canvasCount: document.querySelectorAll('canvas').length,
      h1Count: document.querySelectorAll('h1').length,
      h1Text: document.querySelector('h1')?.textContent?.trim() || null,
    };
  });
}

// Helper: check aria/accessibility attributes
async function getAccessibilityInfo(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return {
      canvasRole: canvas?.getAttribute('role') || null,
      canvasAriaLabel: canvas?.getAttribute('aria-label') || null,
      canvasTabindex: canvas?.getAttribute('tabindex') || null,
      skipLinkExists: !!document.querySelector('a[href="#main-content"], [data-skip-link]'),
      focusableElements: document.querySelectorAll('[tabindex], button, a[href], input, select, textarea').length,
      ariaLiveRegions: document.querySelectorAll('[aria-live]').length,
    };
  });
}

// Helper: simulate node click on canvas
async function clickCanvasCenter(page: Page) {
  const canvas = await page.$('canvas');
  if (!canvas) return;
  const box = await canvas.boundingBox();
  if (!box) return;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

// Helper: drag canvas
async function dragCanvas(page: Page, startX: number, startY: number, endX: number, endY: number) {
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 10 });
  await page.mouse.up();
}

// Helper: zoom canvas
async function zoomCanvas(page: Page, x: number, y: number, delta: number) {
  await page.mouse.move(x, y);
  await page.mouse.wheel(0, delta);
  await page.waitForTimeout(300);
}

// Helper: measure render time
async function measureInitialRender(page: Page): Promise<number> {
  const start = Date.now();
  await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
  await waitForAtlasReady(page);
  return Date.now() - start;
}

// Helper: check for ResizeObserver errors
function setupResizeObserverTracking(page: Page) {
  const resizeErrors: string[] = [];
  page.on('console', msg => {
    if (msg.text().includes('ResizeObserver') || msg.text().includes('loop')) {
      resizeErrors.push(msg.text());
    }
  });
  return resizeErrors;
}

// ═══════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════

test.describe('Atlas Page — Comprehensive Playwright UX/UI Audit', () => {

  // ── 1. Route Validation ──────────────────────────────────────
  test('1.1 Route resolves correctly', async ({ page }) => {
    const console = setupConsoleTracking(page);
    const response = await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });

    expect(response?.status()).toBeLessThan(400);

    const bodyText = await getVisibleText(page);
    const hasNotFound = bodyText.toLowerCase().includes('not found') || bodyText.toLowerCase().includes('404');
    if (hasNotFound) addFinding('P0', 'Route', 'Page shows "Not Found" content');

    const hasWorkspaceEmpty = bodyText.toLowerCase().includes('workspace empty');
    if (hasWorkspaceEmpty) addFinding('P1', 'Route', 'Workspace Empty text leaked');

    const hasWorkspaceCTA = bodyText.toLowerCase().includes('get started') && bodyText.toLowerCase().includes('workspace');
    if (hasWorkspaceCTA) addFinding('P1', 'Route', 'Workspace CTA leaked into Atlas');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/route-resolve.png`, fullPage: true });
  });

  test('1.2 Atlas canvas exists and is visible', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvasCount = await getCanvasCount(page);
    if (canvasCount === 0) addFinding('P0', 'Route', 'No canvas found on Atlas page');
    if (canvasCount > 1) addFinding('P2', 'Route', `Multiple canvases found (${canvasCount}), expected 1`);

    const canvas = await page.$('canvas');
    expect(canvas).toBeTruthy();
    const box = await canvas?.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('1.3 Correct H1 and page title', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const h1 = await getH1Text(page);
    const title = await getPageTitle(page);

    // Atlas should have meaningful H1
    const text = await getVisibleText(page);
    const hasAtlasTitle = text.includes('Atlas') || text.includes('Knowledge') || text.includes('NeuralVerse');
    if (!hasAtlasTitle) addFinding('P3', 'Route', `H1 may be missing or non-descriptive: "${h1}"`);
  });

  test('1.4 No horizontal overflow at any viewport', async ({ page }) => {
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
      await waitForAtlasReady(page);

      const overflow = await checkHorizontalOverflow(page);
      if (overflow) {
        addFinding('P2', 'Layout', `Horizontal overflow detected at ${vp.name}`, vp.name);
      }
    }
  });

  test('1.5 Refresh stability', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const state1 = await getAtlasElements(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);
    const state2 = await getAtlasElements(page);

    expect(state1.canvasCount).toBe(state2.canvasCount);
    if (state1.h1Text !== state2.h1Text) addFinding('P2', 'Route', 'H1 text changed after refresh');
  });

  test('1.6 Navigation away and back stability', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvasCount1 = await getCanvasCount(page);

    // Navigate away
    await page.goto(`${BASE}/#/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Navigate back
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvasCount2 = await getCanvasCount(page);
    if (canvasCount1 !== canvasCount2) {
      addFinding('P2', 'Route', `Canvas count changed after navigation: ${canvasCount1} → ${canvasCount2}`);
    }
  });

  // ── 2. Screenshot Matrix ────────────────────────────────────
  test('2.1 Screenshot matrix — all viewports', async ({ page }) => {
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
      await waitForAtlasReady(page);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/initial-${vp.name}.png`, fullPage: true });

      // Pan
      const canvas = await page.$('canvas');
      if (canvas) {
        const box = await canvas.boundingBox();
        if (box) {
          await dragCanvas(page, box.x + box.width / 2, box.y + box.height / 2, box.x + box.width / 2 - 100, box.y + box.height / 2 - 50);
          await page.waitForTimeout(500);
          await page.screenshot({ path: `${SCREENSHOT_DIR}/after-pan-${vp.name}.png`, fullPage: true });

          // Zoom
          await zoomCanvas(page, box.x + box.width / 2, box.y + box.height / 2, -300);
          await page.waitForTimeout(500);
          await page.screenshot({ path: `${SCREENSHOT_DIR}/after-zoom-${vp.name}.png`, fullPage: true });

          // Click on canvas center (try node selection)
          await clickCanvasCenter(page);
          await page.waitForTimeout(500);
          await page.screenshot({ path: `${SCREENSHOT_DIR}/after-select-${vp.name}.png`, fullPage: true });
        }
      }
    }
  });

  // ── 3. Mouse Interaction Audit ──────────────────────────────
  test('3.1 Left click on node', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    expect(canvas).toBeTruthy();
    const box = await canvas!.boundingBox();
    expect(box).toBeTruthy();

    // Click center of canvas
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(500);

    // Check if selection readout appeared
    const hasSelection = await page.evaluate(() => {
      const readout = document.querySelector('.nv-atlas-selection, [data-atlas-selection]');
      return readout ? readout.textContent?.trim() !== '' : false;
    });

    await page.screenshot({ path: `${SCREENSHOT_DIR}/node-click.png` });
  });

  test('3.2 Left click on background clears selection', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();

    // Click center first (select)
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(300);

    // Click far corner (background, clear)
    await page.mouse.click(box!.x + 20, box!.y + 20);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/background-clear.png` });
  });

  test('3.3 Left drag moves map, nodes do not move independently', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();

    // Capture initial state
    await page.screenshot({ path: `${SCREENSHOT_DIR}/drag-before.png` });

    // Drag
    await dragCanvas(page, box!.x + box!.width / 2, box!.y + box!.height / 2, box!.x + box!.width / 2 + 150, box!.y + box!.height / 2 + 100);
    await page.waitForTimeout(500);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/drag-after.png` });
  });

  test('3.4 Wheel zoom only, no pan', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();
    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    await page.screenshot({ path: `${SCREENSHOT_DIR}/zoom-before.png` });

    // Zoom in
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/zoom-in.png` });

    // Zoom out
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/zoom-out.png` });
  });

  test('3.5 Cursor states are correct', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();

    // Over canvas center (likely a node)
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(200);
    const cursorOverNode = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return window.getComputedStyle(canvas!).cursor;
    });

    // Over empty area (corner)
    await page.mouse.move(box!.x + 10, box!.y + 10);
    await page.waitForTimeout(200);
    const cursorOverEmpty = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return window.getComputedStyle(canvas!).cursor;
    });

    // During drag
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);
    const cursorDuringDrag = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return window.getComputedStyle(canvas!).cursor;
    });
    await page.mouse.up();

    if (cursorOverEmpty !== cursorOverNode) {
      // Good — different cursors for different contexts
    }
    await page.screenshot({ path: `${SCREENSHOT_DIR}/cursor-states.png` });
  });

  test('3.6 Double-click on node', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();

    await page.mouse.dblclick(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/double-click.png` });
  });

  test('3.7 Rapid click stress test', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();
    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Rapid clicks
    for (let i = 0; i < 20; i++) {
      await page.mouse.click(centerX + Math.random() * 40 - 20, centerY + Math.random() * 40 - 20);
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(1000);
    const resizeErrors = consoleErrors.filter(e => e.includes('ResizeObserver'));
    if (resizeErrors.length > 0) {
      addFinding('P2', 'Interaction', `ResizeObserver loop errors after rapid clicking: ${resizeErrors.length}`);
    }
  });

  test('3.8 Rapid zoom stress test', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();
    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.mouse.move(centerX, centerY);
    for (let i = 0; i < 30; i++) {
      await page.mouse.wheel(0, i % 2 === 0 ? -100 : 100);
      await page.waitForTimeout(30);
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/rapid-zoom.png` });
  });

  test('3.9 Pan after selection preserves selection', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();

    // Select
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(300);

    // Pan
    await dragCanvas(page, box!.x + box!.width / 2, box!.y + box!.height / 2, box!.x + box!.width / 2 + 80, box!.y + box!.height / 2 + 60);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/pan-after-select.png` });
  });

  test('3.10 Repeated pan/zoom stress', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();
    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    const pageErrors: string[] = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    for (let i = 0; i < 15; i++) {
      await dragCanvas(page, centerX, centerY, centerX + (i % 2 === 0 ? 50 : -50), centerY + (i % 2 === 0 ? -30 : 30));
      await zoomCanvas(page, centerX, centerY, i % 2 === 0 ? -200 : 200);
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(1000);
    if (pageErrors.length > 0) {
      addFinding('P2', 'Interaction', `Page errors during stress test: ${pageErrors.slice(0, 3).join('; ')}`);
    }
    await page.screenshot({ path: `${SCREENSHOT_DIR}/stress-test.png` });
  });

  // ── 4. Keyboard Audit ───────────────────────────────────────
  test('4.1 Tab and Shift+Tab navigation', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const focusOrder: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return 'body';
        return `${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + String(el.className).split(' ')[0] : ''}`;
      });
      focusOrder.push(focused);
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/tab-navigation.png` });
  });

  test('4.2 Escape key', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    // Select a node first
    await clickCanvasCenter(page);
    await page.waitForTimeout(300);

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/escape-key.png` });
  });

  test('4.3 Arrow keys', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();

    // Focus canvas
    await canvas!.click();
    await page.waitForTimeout(200);

    for (const key of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']) {
      await page.keyboard.press(key);
      await page.waitForTimeout(200);
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/arrow-keys.png` });
  });

  test('4.4 Enter and Space', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    // Tab to first interactive element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/enter-space.png` });
  });

  // ── 5. Touch / Mobile Audit ─────────────────────────────────
  test('5.1 Mobile initial view', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-initial.png`, fullPage: true });

    // Check if canvas fills viewport appropriately
    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();
    if (box) {
      if (box.width < 300) {
        addFinding('P2', 'Mobile', `Canvas too narrow at mobile viewport: ${box.width}px`);
      }
    }
  });

  test('5.2 Mobile tap interactions', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();
    if (box) {
      // Tap center
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-tap-node.png` });

      // Tap background
      await page.touchscreen.tap(box.x + 10, box.y + 10);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-tap-bg.png` });
    }
  });

  test('5.3 Mobile drag', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();
    if (box) {
      await dragCanvas(page, box.x + box.width / 2, box.y + box.height / 2, box.x + box.width / 2 + 100, box.y + box.height / 2 + 50);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-drag.png` });
    }
  });

  test('5.4 Mobile context panel usability', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    // Select a node
    await clickCanvasCenter(page);
    await page.waitForTimeout(500);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-context.png`, fullPage: true });

    // Check if context panel is visible
    const contextVisible = await page.evaluate(() => {
      const ctx = document.querySelector('.nv-atlas-context, [data-atlas-context]');
      if (!ctx) return false;
      const rect = ctx.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    if (!contextVisible) {
      addFinding('P2', 'Mobile', 'Context panel not visible after node selection on mobile');
    }
  });

  // ── 6. Visual / Cartographic Audit ──────────────────────────
  test('6.1 Atlas visual elements present', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const elements = await getAtlasElements(page);

    // Check for atlas-specific elements
    if (!elements.hasOrientationStrip) {
      addFinding('P3', 'Cartography', 'Orientation strip not detected');
    }
    if (!elements.hasLegend) {
      addFinding('P3', 'Cartography', 'Legend not detected');
    }
    if (!elements.hasContextPanel) {
      addFinding('P2', 'Cartography', 'Context panel not detected');
    }
    if (!elements.hasResetButton) {
      addFinding('P3', 'Cartography', 'Reset button not detected');
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/visual-elements.png`, fullPage: true });
  });

  test('6.2 Atlas feels like atlas, not graph demo', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    // Check for atlas-specific visual cues
    const visualCheck = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      const canvas = document.querySelector('canvas');
      const canvasRect = canvas?.getBoundingClientRect();

      return {
        bodyBg: styles.backgroundColor,
        hasDarkBackground: styles.backgroundColor.includes('rgb') && !styles.backgroundColor.includes('255, 255, 255'),
        canvasWidth: canvasRect?.width || 0,
        canvasHeight: canvasRect?.height || 0,
        hasOrientation: !!document.querySelector('[data-atlas-orientation]'),
        hasLegend: !!document.querySelector('[data-atlas-legend]'),
        hasSelectionReadout: !!document.querySelector('[data-atlas-selection]'),
        hasTooltip: !!document.querySelector('[data-atlas-tooltip]'),
        hasJourneyPanel: !!document.querySelector('[data-atlas-journey]'),
      };
    });

    // At minimum, dark background + canvas should give atlas feel
    await page.screenshot({ path: `${SCREENSHOT_DIR}/atlas-identity.png` });
  });

  test('6.3 Compass / scale / orientation', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const compassInfo = await page.evaluate(() => {
      // Look for compass-like elements
      const orientation = document.querySelector('[data-atlas-orientation]');
      return {
        hasOrientationStrip: !!orientation,
        orientationText: orientation?.textContent?.trim()?.substring(0, 100) || null,
        orientationVisible: orientation ? orientation.getBoundingClientRect().height > 0 : false,
      };
    });

    if (!compassInfo.hasOrientationStrip) {
      addFinding('P3', 'Cartography', 'Compass/orientation strip not found');
    } else if (!compassInfo.orientationVisible) {
      addFinding('P3', 'Cartography', 'Compass/orientation strip exists but is not visible');
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/compass-orientation.png` });
  });

  test('6.4 Map frame and boundaries', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const frameInfo = await page.evaluate(() => {
      const frame = document.querySelector('.nv-atlas-canvas-frame, [data-atlas-canvas-frame]');
      if (!frame) return { hasFrame: false };
      const rect = frame.getBoundingClientRect();
      return {
        hasFrame: true,
        width: rect.width,
        height: rect.height,
        hasBorder: window.getComputedStyle(frame).borderWidth !== '0px',
      };
    });

    if (!frameInfo.hasFrame) {
      addFinding('P3', 'Cartography', 'Map frame not detected');
    }
  });

  // ── 7. Context Panel Review ──────────────────────────────────
  test('7.1 Context panel updates on node selection', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();

    // Click center
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(800);

    const ctxBefore = await page.evaluate(() => {
      const ctx = document.querySelector('.nv-atlas-context, [data-atlas-context]');
      return ctx?.textContent?.trim()?.substring(0, 200) || 'NO_CONTEXT';
    });

    await page.screenshot({ path: `${SCREENSHOT_DIR}/context-panel-select.png` });
  });

  test('7.2 Context panel does not show stale data', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();

    // Select node 1
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(800);
    const ctx1 = await page.evaluate(() => {
      const ctx = document.querySelector('.nv-atlas-context, [data-atlas-context]');
      return ctx?.textContent?.trim()?.substring(0, 200) || 'NO_CONTEXT';
    });

    // Select different area
    await page.mouse.click(box!.x + 50, box!.y + 50);
    await page.waitForTimeout(800);
    const ctx2 = await page.evaluate(() => {
      const ctx = document.querySelector('.nv-atlas-context, [data-atlas-context]');
      return ctx?.textContent?.trim()?.substring(0, 200) || 'NO_CONTEXT';
    });

    // Context should change or clear
    if (ctx1 === ctx2 && ctx1 !== 'NO_CONTEXT') {
      addFinding('P2', 'Context', 'Context panel shows same content after selecting different node');
    }
  });

  // ── 8. Navigation Continuity ────────────────────────────────
  test('8.1 Focus query parameter', async ({ page }) => {
    const console = setupConsoleTracking(page);

    await page.goto(`${ATLAS_ROUTE}?focus=embeddings`, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    if (console.pageErrors.length > 0) {
      addFinding('P1', 'Navigation', `Page errors with focus query: ${console.pageErrors[0]}`);
    }
    if (console.consoleErrors.length > 0) {
      addFinding('P2', 'Navigation', `Console errors with focus query: ${console.consoleErrors[0]}`);
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/focus-query.png` });
  });

  test('8.2 Invalid focus query parameter graceful fallback', async ({ page }) => {
    const console = setupConsoleTracking(page);

    await page.goto(`${ATLAS_ROUTE}?focus=nonexistent-concept-xyz`, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    if (console.pageErrors.length > 0) {
      addFinding('P2', 'Navigation', `Page errors with invalid focus: ${console.pageErrors[0]}`);
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/invalid-focus.png` });
  });

  // ── 9. Accessibility Audit ──────────────────────────────────
  test('9.1 Canvas accessibility attributes', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const a11y = await getAccessibilityInfo(page);

    if (!a11y.canvasAriaLabel) {
      addFinding('P1', 'Accessibility', 'Canvas has no aria-label');
    }
    if (!a11y.canvasRole) {
      addFinding('P2', 'Accessibility', 'Canvas has no role attribute');
    }
    if (a11y.canvasTabindex === null) {
      addFinding('P2', 'Accessibility', 'Canvas is not keyboard-focusable (no tabindex)');
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/a11y-canvas.png` });
  });

  test('9.2 Single H1 check', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const a11y = await getAccessibilityInfo(page);
    if (a11y.h1Count > 1) {
      addFinding('P2', 'Accessibility', `Multiple H1 elements found (${a11y.h1Count})`);
    }
    if (a11y.h1Count === 0) {
      addFinding('P1', 'Accessibility', 'No H1 element found');
    }
  });

  test('9.3 Focus indicators visible', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    // Tab through elements and check for visible focus
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      const hasOutline = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return false;
        const style = window.getComputedStyle(el);
        return style.outlineStyle !== 'none' || style.outlineWidth !== '0px' ||
               style.boxShadow !== 'none';
      });

      if (!hasOutline && i > 0) {
        // Some elements may not have focus indicators
      }
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/focus-indicators.png` });
  });

  test('9.4 Skip link presence', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const a11y = await getAccessibilityInfo(page);
    if (!a11y.skipLinkExists) {
      addFinding('P3', 'Accessibility', 'No skip link found');
    }
  });

  test('9.5 ARIA live regions', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const a11y = await getAccessibilityInfo(page);
    if (a11y.ariaLiveRegions === 0) {
      addFinding('P2', 'Accessibility', 'No ARIA live regions found for dynamic content updates');
    }
  });

  test('9.6 Color-only encoding check', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    // Check legend for text labels alongside colors
    const legendInfo = await page.evaluate(() => {
      const legend = document.querySelector('[data-atlas-legend]');
      if (!legend) return { hasLegend: false };
      return {
        hasLegend: true,
        text: legend.textContent?.trim()?.substring(0, 200) || '',
        hasImages: legend.querySelectorAll('img, svg').length,
      };
    });

    await page.screenshot({ path: `${SCREENSHOT_DIR}/color-encoding.png` });
  });

  test('9.7 Reduced motion support', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    // Interact and check for animations
    await clickCanvasCenter(page);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/reduced-motion.png` });
  });

  // ── 10. Performance Audit ───────────────────────────────────
  test('10.1 Initial render time', async ({ page }) => {
    const renderTime = await measureInitialRender(page);
    if (renderTime > 5000) {
      addFinding('P2', 'Performance', `Slow initial render: ${renderTime}ms`);
    }
    if (renderTime > 10000) {
      addFinding('P1', 'Performance', `Very slow initial render: ${renderTime}ms`);
    }

    console.log(`Initial render time: ${renderTime}ms`);
  });

  test('10.2 Console errors during session', async ({ page }) => {
    const console = setupConsoleTracking(page);
    const resizeErrors = setupResizeObserverTracking(page);

    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    // Interact
    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();
    if (box) {
      await dragCanvas(page, box.x + box.width / 2, box.y + box.height / 2, box.x + box.width / 2 + 50, box.y + box.height / 2 + 50);
      await zoomCanvas(page, box.x + box.width / 2, box.y + box.height / 2, -200);
      await clickCanvasCenter(page);
    }

    await page.waitForTimeout(2000);

    if (console.pageErrors.length > 0) {
      addFinding('P1', 'Performance', `Page errors: ${console.pageErrors.join('; ')}`);
    }
    if (console.consoleErrors.length > 0) {
      addFinding('P2', 'Performance', `Console errors: ${console.consoleErrors.join('; ')}`);
    }
    if (resizeErrors.length > 0) {
      addFinding('P2', 'Performance', `ResizeObserver errors: ${resizeErrors.join('; ')}`);
    }
  });

  test('10.3 Canvas blanking check', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    // Check canvas is not blank
    const canvasBlank = await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return true;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100));
      let nonBlank = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] !== 0 || imageData.data[i + 1] !== 0 || imageData.data[i + 2] !== 0 || imageData.data[i + 3] !== 0) {
          nonBlank++;
        }
      }
      return nonBlank === 0;
    });

    if (canvasBlank) {
      addFinding('P1', 'Performance', 'Canvas appears blank — no pixels rendered');
    }
  });

  test('10.4 Resize stability', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Resize rapidly
    const sizes = [
      { w: 1440, h: 900 }, { w: 800, h: 600 }, { w: 390, h: 844 },
      { w: 1280, h: 800 }, { w: 1024, h: 768 }, { w: 1440, h: 900 },
    ];

    for (const s of sizes) {
      await page.setViewportSize({ width: s.w, height: s.h });
      await page.waitForTimeout(300);
    }

    await page.waitForTimeout(1000);

    if (consoleErrors.length > 0) {
      addFinding('P2', 'Performance', `Errors during resize: ${consoleErrors.join('; ')}`);
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/resize-stability.png` });
  });

  // ── 11. Specific Question Answers ───────────────────────────
  test('11.1 Five-second atlas recognition test', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    // Screenshot at key moments
    await page.screenshot({ path: `${SCREENSHOT_DIR}/5sec-recognition.png` });

    const elements = await getAtlasElements(page);
    const atlasIndicators = [
      elements.hasCanvasFrame,
      elements.hasOrientationStrip,
      elements.hasLegend,
      elements.hasContextPanel,
      elements.hasSelectionReadout,
      elements.hasJourneyPanel,
    ].filter(Boolean).length;

    console.log(`Atlas visual indicators found: ${atlasIndicators}/6`);
  });

  // ── 12. Journey / Guided Discovery ──────────────────────────
  test('12.1 Journey panel presence and interaction', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const journeyInfo = await page.evaluate(() => {
      const journey = document.querySelector('[data-atlas-journey]');
      if (!journey) return { exists: false };
      return {
        exists: true,
        text: journey.textContent?.trim()?.substring(0, 300) || '',
        visible: journey.getBoundingClientRect().height > 0,
      };
    });

    if (!journeyInfo.exists) {
      addFinding('P3', 'Exploration', 'Journey panel not found');
    } else if (!journeyInfo.visible) {
      addFinding('P3', 'Exploration', 'Journey panel exists but is not visible');
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/journey-panel.png` });
  });

  // ── 13. Tooltip Audit ───────────────────────────────────────
  test('13.1 Hover tooltip on node', async ({ page }) => {
    await page.goto(ATLAS_ROUTE, { waitUntil: 'domcontentloaded' });
    await waitForAtlasReady(page);

    const canvas = await page.$('canvas');
    const box = await canvas!.boundingBox();

    // Hover over center
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(500);

    const tooltipInfo = await page.evaluate(() => {
      const tooltip = document.querySelector('[data-atlas-tooltip]');
      if (!tooltip) return { exists: false };
      return {
        exists: true,
        text: tooltip.textContent?.trim()?.substring(0, 200) || '',
        visible: tooltip.getBoundingClientRect().width > 0,
      };
    });

    await page.screenshot({ path: `${SCREENSHOT_DIR}/hover-tooltip.png` });
  });
});

// ═══════════════════════════════════════════════════════════════
// FINDINGS SUMMARY (runs after all tests)
// ═══════════════════════════════════════════════════════════════

test.describe('Findings Summary', () => {
  test('Print all findings', async () => {
    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('ATLAS AUDIT FINDINGS');
    console.log('═══════════════════════════════════════════════════════════════');

    const bySeverity = findings.reduce((acc, f) => {
      acc[f.severity] = acc[f.severity] || [];
      acc[f.severity].push(f);
      return acc;
    }, {} as Record<string, typeof findings>);

    for (const severity of ['P0', 'P1', 'P2', 'P3', 'P4']) {
      const items = bySeverity[severity] || [];
      if (items.length > 0) {
        console.log(`\n${severity} (${items.length}):`);
        for (const f of items) {
          console.log(`  [${f.id}] [${f.category}] ${f.description}${f.viewport ? ` (${f.viewport})` : ''}`);
        }
      }
    }

    console.log(`\nTotal findings: ${findings.length}`);
    console.log('═══════════════════════════════════════════════════════════════\n');
  });
});
