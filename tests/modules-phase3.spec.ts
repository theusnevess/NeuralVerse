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
  test(`Constellation renders with 6 interactive nodes — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${BASE}/index.html#/modules`);
    await page.waitForLoadState('networkidle');

    const nodes = page.locator('.nv-curriculum-constellation__node');
    await expect(nodes).toHaveCount(6);

    const firstNode = nodes.first();
    await expect(firstNode).toHaveAttribute('tabindex', '0');
    await expect(firstNode).toHaveAttribute('aria-pressed', 'false');

    await page.screenshot({ path: `tests/screenshots/modules-phase3-idle-${vp.name}.png`, fullPage: true });
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

test('Node hover highlights connected lines', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(2);
  await node.hover();

  const connectedLines = page.locator('.nv-curriculum-constellation__line--connected');
  const count = await connectedLines.count();
  expect(count).toBeGreaterThan(0);

  await page.screenshot({ path: 'tests/screenshots/modules-phase3-hover.png', fullPage: true });
});

test('Node hover reveals subtitle and description', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(2);
  await node.hover();

  const subtitle = node.locator('.nv-curriculum-constellation__node-subtitle');
  await expect(subtitle).toBeVisible();

  const description = node.locator('.nv-curriculum-constellation__node-description');
  await expect(description).toBeVisible();
});

test('Node click selects and shows selected state', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(2);
  await node.click();

  await expect(node).toHaveAttribute('aria-pressed', 'true');
  await expect(node).toHaveClass(/nv-curriculum-constellation__node--selected/);

  const canvas = page.locator('.nv-curriculum-constellation__canvas');
  await expect(canvas).toHaveClass(/nv-curriculum-constellation__canvas--has-selection/);

  await page.screenshot({ path: 'tests/screenshots/modules-phase3-selected.png', fullPage: true });
});

test('Selected node dims other nodes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(2);
  await node.click();

  const otherNode = page.locator('.nv-curriculum-constellation__node').nth(0);
  const opacity = await otherNode.evaluate((el) => getComputedStyle(el).opacity);
  expect(parseFloat(opacity)).toBeLessThan(1);
});

test('Clicking same node deselects', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(2);
  await node.click();
  await expect(node).toHaveAttribute('aria-pressed', 'true');

  await node.click();
  await expect(node).toHaveAttribute('aria-pressed', 'false');

  const canvas = page.locator('.nv-curriculum-constellation__canvas');
  await expect(canvas).not.toHaveClass(/nv-curriculum-constellation__canvas--has-selection/);
});

test('Clicking canvas background deselects', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(2);
  await node.click();
  await expect(node).toHaveAttribute('aria-pressed', 'true');

  const canvas = page.locator('.nv-curriculum-constellation__canvas');
  await canvas.click({ position: { x: 10, y: 10 } });

  await expect(node).toHaveAttribute('aria-pressed', 'false');
});

test('Keyboard Enter selects node', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(1);
  await node.focus();
  await page.keyboard.press('Enter');

  await expect(node).toHaveAttribute('aria-pressed', 'true');
  await expect(node).toHaveClass(/nv-curriculum-constellation__node--selected/);
});

test('Keyboard Space selects node', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(3);
  await node.focus();
  await page.keyboard.press('Space');

  await expect(node).toHaveAttribute('aria-pressed', 'true');
});

test('Keyboard focus shows hover-like state', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(2);
  await node.focus();

  const subtitle = node.locator('.nv-curriculum-constellation__node-subtitle');
  const opacity = await subtitle.evaluate((el) => getComputedStyle(el).opacity);
  expect(parseFloat(opacity)).toBeGreaterThan(0);
});

test('Aria-labels include subtitle', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const nodes = page.locator('.nv-curriculum-constellation__node');
  await expect(nodes.nth(0)).toHaveAttribute('aria-label', /Foundations/);
  await expect(nodes.nth(0)).toHaveAttribute('aria-label', /Mathematical/);
  await expect(nodes.nth(2)).toHaveAttribute('aria-label', /Deep Learning/);
  await expect(nodes.nth(2)).toHaveAttribute('aria-label', /Neural Network/);
});

test('Selected state shows accent-colored number badge', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(2);
  await node.click();

  const number = node.locator('.nv-curriculum-constellation__node-number');
  const bg = await number.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe('rgba(0, 0, 0, 0)');
});

test('Mobile: nodes show subtitle and description inline', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(0);
  const subtitle = node.locator('.nv-curriculum-constellation__node-subtitle');
  await expect(subtitle).toBeVisible();

  await page.screenshot({ path: 'tests/screenshots/modules-phase3-mobile.png', fullPage: true });
});

test('Mobile: selection works on tap', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const node = page.locator('.nv-curriculum-constellation__node').nth(1);
  await node.tap();

  await expect(node).toHaveAttribute('aria-pressed', 'true');
  await expect(node).toHaveClass(/nv-curriculum-constellation__node--selected/);
});

test('Caption updates on selection', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const caption = page.locator('.nv-curriculum-constellation__caption');
  await expect(caption).toContainText('Select a module');

  const node = page.locator('.nv-curriculum-constellation__node').nth(2);
  await node.click();

  await expect(caption).toContainText('deselect');
});
