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
  test(`Modules page renders constellation — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${BASE}/index.html#/modules`);
    await page.waitForLoadState('networkidle');

    const hero = page.locator('.nv-modules-hero');
    await expect(hero).toBeVisible();

    const constellation = page.locator('.nv-curriculum-constellation-section');
    await expect(constellation).toBeVisible();

    const nodes = page.locator('.nv-curriculum-constellation__node');
    await expect(nodes).toHaveCount(6);

    const overline = page.locator('.nv-curriculum-constellation__overline');
    await expect(overline).toHaveText('CURRICULUM MAP');

    const title = page.locator('.nv-curriculum-constellation__title');
    await expect(title).toHaveText('Six modules. One engineering path.');

    const caption = page.locator('.nv-curriculum-constellation__caption');
    await expect(caption).toContainText('mathematical foundations');

    const svg = page.locator('.nv-curriculum-constellation__lines');
    await expect(svg).toHaveAttribute('aria-hidden', 'true');

    await page.screenshot({ path: `tests/screenshots/modules-phase2-${vp.name}.png`, fullPage: true });
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

test('Keyboard focus works on constellation nodes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const firstNode = page.locator('.nv-curriculum-constellation__node').first();
  await firstNode.focus();
  await expect(firstNode).toHaveFocus();

  await page.keyboard.press('Tab');
  const secondNode = page.locator('.nv-curriculum-constellation__node').nth(1);
  await expect(secondNode).toHaveFocus();
});

test('Constellation nodes have correct aria-labels', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const nodes = page.locator('.nv-curriculum-constellation__node');
  await expect(nodes.nth(0)).toHaveAttribute('aria-label', 'Module 0: Foundations');
  await expect(nodes.nth(1)).toHaveAttribute('aria-label', 'Module 1: Classical ML & Signal Processing');
  await expect(nodes.nth(2)).toHaveAttribute('aria-label', 'Module 2: Deep Learning & Foundation Models');
  await expect(nodes.nth(3)).toHaveAttribute('aria-label', 'Module 3: 3D Vision & Neural SLAM');
  await expect(nodes.nth(4)).toHaveAttribute('aria-label', 'Module 4: Robotics, Edge AI & Autonomous Systems');
  await expect(nodes.nth(5)).toHaveAttribute('aria-label', 'Module 5: MLOps & Production Engineering');
});

test('Mobile: constellation switches to vertical layout', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(`${BASE}/index.html#/modules`);
  await page.waitForLoadState('networkidle');

  const svg = page.locator('.nv-curriculum-constellation__lines');
  await expect(svg).toBeHidden();

  const nodes = page.locator('.nv-curriculum-constellation__node');
  await expect(nodes).toHaveCount(6);

  await page.screenshot({ path: 'tests/screenshots/modules-phase2-mobile-vertical.png', fullPage: true });
});
