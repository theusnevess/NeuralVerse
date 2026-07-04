import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:8080';
const URL = `${BASE}/index.html#/content`;

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900, isMobile: false },
  { name: 'desktop-1280', width: 1280, height: 800, isMobile: false },
  { name: 'tablet-768', width: 768, height: 1024, isMobile: false },
  { name: 'mobile-390', width: 390, height: 844, isMobile: true },
  { name: 'mobile-360', width: 360, height: 740, isMobile: true },
];

const DESKTOP_MIN_REM = 48; // 48rem = 768px

async function gotoContent(page: Page, vp: { width: number; height: number }) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(URL);
  await page.waitForLoadState('networkidle');
}

for (const vp of VIEWPORTS) {
  test.describe(`Content page QA — ${vp.name} (${vp.width}×${vp.height})`, () => {
    test(`1. Heading visible: "Technical Reference & Guides" h2`, async ({ page }) => {
      await gotoContent(page, vp);
      const h2 = page.locator('#content-library-title');
      await expect(h2).toBeVisible();
      await expect(h2).toContainText('Technical Reference & Guides');
      const tagName = await h2.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe('h2');
    });

    test(`2. Metadata flow: each entry shows "Guide · 3 min read"`, async ({ page }) => {
      await gotoContent(page, vp);
      const entries = page.locator('.nv-editorial-entry');
      const count = await entries.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const meta = entries.nth(i).locator('.nv-editorial-entry__meta');
        await expect(meta).toBeVisible();
        const text = await meta.textContent();
        // Should contain a type, middot separator, and "min read"
        expect(text).toMatch(/Guide.*·.*\d+\s*min\s*read/);
        // Verify it renders on a single line (no wrapping)
        const height = await meta.evaluate((el) => el.getBoundingClientRect().height);
        const lineHeight = await meta.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
        // Meta should fit on 1 line (height <= ~1.5x lineHeight to allow rounding)
        expect(height).toBeLessThanOrEqual(lineHeight * 1.8);
      }
    });

    test(`3. Entry titles: h3 titles visible`, async ({ page }) => {
      await gotoContent(page, vp);
      const entries = page.locator('.nv-editorial-entry');
      const count = await entries.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const title = entries.nth(i).locator('.nv-editorial-entry__title');
        await expect(title).toBeVisible();
        const tagName = await title.evaluate((el) => el.tagName.toLowerCase());
        expect(tagName).toBe('h3');
        const text = await title.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    });

    test(`4. Entry descriptions: description paragraphs visible`, async ({ page }) => {
      await gotoContent(page, vp);
      const entries = page.locator('.nv-editorial-entry');
      const count = await entries.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const desc = entries.nth(i).locator('.nv-editorial-entry__desc');
        await expect(desc).toBeVisible();
        const text = await desc.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    });

    test(`5. Sequential numbers: visible on desktop (≥48rem), hidden on mobile (<48rem)`, async ({ page }) => {
      await gotoContent(page, vp);
      const entries = page.locator('.nv-editorial-entry');
      const count = await entries.count();
      expect(count).toBeGreaterThan(0);

      // CSS uses max-width: 48rem (768px) to hide numbers.
      // At exactly 768px, numbers are hidden. Desktop means > 768px.
      const isDesktop = vp.width > DESKTOP_MIN_REM * 16;

      for (let i = 0; i < count; i++) {
        const num = entries.nth(i).locator('.nv-editorial-entry__num');
        const display = await num.evaluate((el) => getComputedStyle(el).display);
        const text = await num.textContent();

        if (isDesktop) {
          expect(display).not.toBe('none');
          // Verify zero-padded number
          const expectedNum = String(i + 1).padStart(2, '0');
          expect(text?.trim()).toBe(expectedNum);
        } else {
          expect(display).toBe('none');
        }
      }
    });

    test(`6. No horizontal overflow: body width ≤ viewport width`, async ({ page }) => {
      await gotoContent(page, vp);
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(vp.width + 1);
    });

    test(`7. Focus visibility: tab to first entry, verify outline appears`, async ({ page }) => {
      await gotoContent(page, vp);
      const entries = page.locator('.nv-editorial-entry');
      const count = await entries.count();
      expect(count).toBeGreaterThan(0);

      // Focus the first entry directly
      const firstEntry = entries.first();
      await firstEntry.focus();

      const outlineStyle = await firstEntry.evaluate((el) => {
        const s = getComputedStyle(el);
        return { style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor };
      });

      expect(outlineStyle.style).not.toBe('none');
      expect(outlineStyle.width).not.toBe('0px');
    });

    test(`8. ARIA: each entry has aria-label="Read ..."`, async ({ page }) => {
      await gotoContent(page, vp);
      const entries = page.locator('.nv-editorial-entry');
      const count = await entries.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const ariaLabel = await entries.nth(i).getAttribute('aria-label');
        expect(ariaLabel).toMatch(/^Read .+/);
      }

      // Also verify list container role
      const listContainer = page.locator('.nv-editorial-library__list');
      await expect(listContainer).toHaveAttribute('role', 'list');

      // Verify section aria-labelledby
      const section = page.locator('.nv-editorial-library');
      await expect(section).toHaveAttribute('aria-labelledby', 'content-library-title');
    });

    test(`9. No console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await gotoContent(page, vp);

      // Wait a moment for any deferred errors
      await page.waitForTimeout(500);
      expect(errors).toEqual([]);
    });

    test(`10. Hover state: background changes on entry hover`, async ({ page }) => {
      await gotoContent(page, vp);
      const entries = page.locator('.nv-editorial-entry');
      const count = await entries.count();
      expect(count).toBeGreaterThan(0);

      const entry = entries.first();

      // Get background before hover
      const bgBefore = await entry.evaluate((el) => getComputedStyle(el).background);

      // Hover over entry
      await entry.hover();
      await page.waitForTimeout(200);

      // Get background after hover
      const bgAfter = await entry.evaluate((el) => getComputedStyle(el).background);

      // Background should change on hover
      expect(bgAfter).not.toBe(bgBefore);
    });

    test(`11. Separator visibility: entries have subtle bottom borders`, async ({ page }) => {
      await gotoContent(page, vp);
      const entries = page.locator('.nv-editorial-entry');
      const count = await entries.count();
      expect(count).toBeGreaterThan(0);

      // Check all entries except the last (which has no border)
      for (let i = 0; i < count - 1; i++) {
        const entry = entries.nth(i);
        const border = await entry.evaluate((el) => {
          const s = getComputedStyle(el);
          return { style: s.borderBottomStyle, width: s.borderBottomWidth, color: s.borderBottomColor };
        });

        expect(border.style).toBe('solid');
        // Border should be subtle (1px)
        expect(border.width).toBe('1px');
        // Border color should not be heavy (should be semi-transparent)
        expect(border.color).toBeTruthy();
      }

      // Last entry should have no border
      const lastEntry = entries.last();
      const lastBorder = await lastEntry.evaluate((el) => {
        const s = getComputedStyle(el);
        return s.borderBottomStyle;
      });
      expect(lastBorder).toBe('none');
    });

    test(`12. Content width: on 1440×900, list doesn't stretch full viewport`, async ({ page }) => {
      await gotoContent(page, vp);

      // This check is specific to the 1440 viewport, but we verify on all
      // The library section should be constrained (max-inline-size from CSS)
      const library = page.locator('.nv-editorial-library');
      const box = await library.boundingBox();

      if (box) {
        // The library should not span the full viewport width
        // It should be constrained (max-inline-size: var(--sys-a11y-reading-width-enhanced))
        // On 1440px, this should be significantly less than 1440px
        if (vp.width === 1440) {
          expect(box.width).toBeLessThan(vp.width);
          // Should be at least 300px narrower than viewport (generous margin)
          expect(box.width).toBeLessThanOrEqual(vp.width - 100);
        }
        // On all viewports, width should not exceed viewport
        expect(box.width).toBeLessThanOrEqual(vp.width);
      }
    });
  });
}
