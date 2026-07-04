import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8080';
const URL = `${BASE}/index.html#/content`;

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-360', width: 360, height: 740 },
];

for (const vp of VIEWPORTS) {
  test(`1. Content page loads — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const title = page.locator('#content-library-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Technical Reference & Guides');
  });

  test(`2. Editorial entries render — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const entries = page.locator('.nv-editorial-entry');
    const count = await entries.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const entry = entries.nth(i);
      await expect(entry.locator('.nv-editorial-entry__title')).toBeVisible();
      await expect(entry.locator('.nv-editorial-entry__desc')).toBeVisible();
      await expect(entry.locator('.nv-editorial-entry__kicker')).toBeVisible();
      await expect(entry.locator('.nv-editorial-entry__time')).toBeVisible();
    }
  });

  test(`3. Responsive layout — cards stack on mobile — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const list = page.locator('.nv-editorial-library__list');
    const display = await list.evaluate((el) => getComputedStyle(el).display);
    const flexDir = await list.evaluate((el) => getComputedStyle(el).flexDirection);

    expect(display).toMatch(/block|flex|grid/);

    if (vp.width <= 480 && display === 'flex') {
      expect(flexDir).toBe('column');
    }
  });

  test(`4. No horizontal overflow — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(vp.width + 1);
  });

  test(`5. Keyboard navigation — focus-visible outlines — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const entries = page.locator('.nv-editorial-entry');
    const count = await entries.count();
    expect(count).toBeGreaterThan(0);

    await page.keyboard.press('Tab');
    let focusedEntry = page.locator('.nv-editorial-entry:focus');
    let hasFocus = await focusedEntry.count();
    if (hasFocus === 0) {
      await page.keyboard.press('Tab');
      focusedEntry = page.locator('.nv-editorial-entry:focus');
      hasFocus = await focusedEntry.count();
    }

    for (let i = 0; i < Math.min(count, 5); i++) {
      const entry = entries.nth(i);
      await entry.focus();
      const outlineStyle = await entry.evaluate((el) => {
        const s = getComputedStyle(el);
        return `${s.outlineStyle}|${s.outlineWidth}|${s.outlineColor}`;
      });
      const isVisible = !outlineStyle.includes('none') && !outlineStyle.includes('0px');
      expect(isVisible).toBe(true);
    }
  });

  test(`6. ARIA labels on entries — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const entries = page.locator('.nv-editorial-entry');
    const count = await entries.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const entry = entries.nth(i);
      const ariaLabel = await entry.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/^Read .+/);
    }

    const listContainer = page.locator('.nv-editorial-library__list');
    await expect(listContainer).toHaveAttribute('role', 'list');

    const librarySection = page.locator('.nv-editorial-library');
    await expect(librarySection).toHaveAttribute('aria-labelledby', 'content-library-title');
  });

  test(`7. No console errors — ${vp.name}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });

  test(`8. Heading hierarchy — h2 for title — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    const title = page.locator('#content-library-title');
    await expect(title).toBeVisible();

    const tagName = await title.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('h2');

    const h1Count = await page.locator('h1').count();
    const h1Visible = await page.locator('h1:not(.nv-sr-only)').count();
    expect(h1Visible).toBe(0);
  });
}
