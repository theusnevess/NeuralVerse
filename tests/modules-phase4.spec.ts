import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8080';

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-360', width: 360, height: 740 },
];

for (const vp of VIEWPORTS) {
  test(`Constellation renders with progression nodes — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${BASE}/index.html#/modules`);
    await page.waitForLoadState('networkidle');

    const nodes = page.locator('.nv-curriculum-constellation__node');
    await expect(nodes).toHaveCount(6);

    const originNode = page.locator('.nv-curriculum-constellation__node--origin');
    await expect(originNode).toHaveCount(1);

    const terminalNode = page.locator('.nv-curriculum-constellation__node--terminal');
    await expect(terminalNode).toHaveCount(1);

    await page.screenshot({ path: `tests/screenshots/modules-phase4-idle-${vp.name}.png`, fullPage: true });
  });

  test(`No horizontal overflow — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${BASE}/index.html#/modules`);
    await page.waitForLoadState('networkidle');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(vp.width + 1);
  });

  test(`No console errors — ${vp.name}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${BASE}/index.html#/modules`);
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });
}

test('Hover on Foundations shows successor (Classical ML)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const foundations = page.locator('.nv-curriculum-constellation__node').nth(0);
  await foundations.hover();

  const classicalML = page.locator('.nv-curriculum-constellation__node').nth(1);
  await expect(classicalML).toHaveClass(/nv-curriculum-constellation__node--successor/);

  const infoPanel = page.locator('.nv-curriculum-constellation__progression-info');
  await expect(infoPanel).toBeVisible();
  await expect(infoPanel).toContainText('Unlocks');
  await expect(infoPanel).toContainText('Classical ML');
});

test('Hover on Deep Learning shows prereqs and successors', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const deepLearning = page.locator('.nv-curriculum-constellation__node').nth(2);
  await deepLearning.hover();

  const classicalML = page.locator('.nv-curriculum-constellation__node').nth(1);
  await expect(classicalML).toHaveClass(/nv-curriculum-constellation__node--prereq/);

  const vision = page.locator('.nv-curriculum-constellation__node').nth(3);
  await expect(vision).toHaveClass(/nv-curriculum-constellation__node--successor/);

  const robotics = page.locator('.nv-curriculum-constellation__node').nth(4);
  await expect(robotics).toHaveClass(/nv-curriculum-constellation__node--successor/);

  const infoPanel = page.locator('.nv-curriculum-constellation__progression-info');
  await expect(infoPanel).toContainText('Prerequisites');
  await expect(infoPanel).toContainText('Unlocks');
});

test('Hover on MLOps shows prerequisites only', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const mlops = page.locator('.nv-curriculum-constellation__node').nth(5);
  await mlops.hover();

  const robotics = page.locator('.nv-curriculum-constellation__node').nth(4);
  await expect(robotics).toHaveClass(/nv-curriculum-constellation__node--prereq/);

  const infoPanel = page.locator('.nv-curriculum-constellation__progression-info');
  await expect(infoPanel).toContainText('Prerequisites');
  await expect(infoPanel).toContainText('Robotics');
});

test('Hover dims unrelated nodes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const deepLearning = page.locator('.nv-curriculum-constellation__node').nth(2);
  await deepLearning.hover();

  const foundations = page.locator('.nv-curriculum-constellation__node').nth(0);
  const opacity = await foundations.evaluate((el) => getComputedStyle(el).opacity);
  expect(parseFloat(opacity)).toBeLessThan(1);
});

test('Selected node shows progression info', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const deepLearning = page.locator('.nv-curriculum-constellation__node').nth(2);
  await deepLearning.click();

  const infoPanel = page.locator('.nv-curriculum-constellation__progression-info');
  await expect(infoPanel).toBeVisible();
  await expect(infoPanel).toContainText('Prerequisites');
  await expect(infoPanel).toContainText('Classical ML');
  await expect(infoPanel).toContainText('Unlocks');
});

test('Connection lines use directional gradient', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const firstPath = page.locator('.nv-curriculum-constellation__lines path').first();
  const stroke = await firstPath.getAttribute('stroke');
  expect(stroke).toContain('flow-grad');
});

test('Progression info panel has aria-live', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const infoPanel = page.locator('.nv-curriculum-constellation__progression-info');
  await expect(infoPanel).toHaveAttribute('aria-live', 'polite');
});

test('Keyboard focus shows progression', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(2);
  await node.focus();

  const infoPanel = page.locator('.nv-curriculum-constellation__progression-info');
  await expect(infoPanel).toBeVisible();
});

test('Canvas click clears progression info', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(2);
  await node.click();

  const infoPanel = page.locator('.nv-curriculum-constellation__progression-info');
  await expect(infoPanel).toBeVisible();

  const canvas = page.locator('.nv-curriculum-constellation__canvas');
  await canvas.click({ position: { x: 10, y: 10 } });

  await expect(infoPanel).toBeHidden();
});

test('Mobile: progression info displays inline', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(0);
  await node.tap();

  const infoPanel = page.locator('.nv-curriculum-constellation__progression-info');
  await expect(infoPanel).toBeVisible();

  await page.screenshot({ path: 'tests/screenshots/modules-phase4-mobile.png', fullPage: true });
});

test('Desktop: progression hover screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(2);
  await node.hover();

  await page.screenshot({ path: 'tests/screenshots/modules-phase4-hover.png', fullPage: true });
});

test('Desktop: progression selected screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(2);
  await node.click();

  await page.screenshot({ path: 'tests/screenshots/modules-phase4-selected.png', fullPage: true });
});
