import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8080';

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'small-mobile-360', width: 360, height: 740 },
];

test.describe('NV-210-M8 Modules canonical implementation', () => {
  for (const viewport of VIEWPORTS) {
    test(`renders canonical structure without overflow or console errors - ${viewport.name}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE}/index.html#/modules`);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('.nv-modules-control')).toBeVisible();
      await expect(page.locator('.nv-modules-control__region')).toHaveCount(6);
      await expect(page.getByRole('heading', { name: 'Modules Page' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Recognize the available module routes' })).toBeVisible();
      await expect(page.locator('.nv-modules-control__module')).toHaveCount(6);

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 1);
      expect(errors).toEqual([]);

      await page.screenshot({ path: `tests/screenshots/modules-m8-idle-${viewport.name}.png`, fullPage: true });
    });
  }

  test('supports hover, focus and selection states', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/index.html#/modules`);
    await page.waitForLoadState('networkidle');

    const module = page.locator('.nv-modules-control__module').nth(2);
    await module.hover();
    await page.screenshot({ path: 'tests/screenshots/modules-m8-hover-desktop.png', fullPage: true });

    await module.focus();
    await expect(module).toBeFocused();
    await expect(page.locator('#modules-interpretation')).toContainText('Deep Learning');
    await page.screenshot({ path: 'tests/screenshots/modules-m8-focus-desktop.png', fullPage: true });

    await module.click();
    await expect(module).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#modules-planning')).toContainText('Confirm preparation');
    await page.screenshot({ path: 'tests/screenshots/modules-m8-selection-desktop.png', fullPage: true });
  });

  test('keeps keyboard navigation predictable', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/index.html#/modules`);
    await page.waitForLoadState('networkidle');

    const first = page.locator('.nv-modules-control__module').first();
    const second = page.locator('.nv-modules-control__module').nth(1);
    await first.focus();
    await expect(first).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(second).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('aria-selected', 'true');
  });

  test('honors reduced motion preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/index.html#/modules`);
    await page.waitForLoadState('networkidle');

    const transition = await page.locator('.nv-modules-control__module').first().evaluate((node) => getComputedStyle(node).transitionDuration);
    expect(transition).toBe('0s');
  });
});
