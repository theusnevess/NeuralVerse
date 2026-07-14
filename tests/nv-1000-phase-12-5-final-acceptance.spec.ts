import { test, expect, type Locator, type Page } from '@playwright/test';

const LABS = [
  'gradient-descent', 'linear-regression', 'logistic-regression',
  'kmeans-clustering', 'pca-projection', 'bayes-rule',
  'embedding-similarity', 'cosine-similarity', 'precision-recall',
  'transformer-attention',
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile-360', width: 360, height: 740 },
];

const INVALID_VALUE = /undefined|null|NaN|Infinity|\[object Object\]/i;

async function openLab(page: Page, slug: string) {
  await page.goto(`/#/laboratory/${slug}`);
  await expect(page.locator('[data-lab-v4-workspace]')).toBeVisible();
  await page.waitForTimeout(150);
}

async function box(locator: Locator) {
  const value = await locator.boundingBox();
  expect(value).not.toBeNull();
  return value!;
}

function overlaps(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

test.describe('Phase 12.5.3 — final cross-laboratory acceptance', () => {
  test('telemetry is readable, valid, and contained across required viewports', async ({ page }) => {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      for (const slug of LABS) {
        await openLab(page, slug);
        const telemetry = page.locator('[data-lab-v4-telemetry]');
        const metrics = telemetry.locator('[data-hud-metric]');
        const count = await metrics.count();

        expect(count, `${slug} ${viewport.name} metric count`).toBeGreaterThanOrEqual(2);
        expect(count, `${slug} ${viewport.name} metric count`).toBeLessThanOrEqual(5);
        expect(await telemetry.evaluate((el) => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight)).toBe(true);

        for (let index = 0; index < count; index++) {
          const metric = metrics.nth(index);
          const label = metric.locator(':scope > dt');
          const value = metric.locator(':scope > dd');
          expect(await label.isVisible(), `${slug} ${viewport.name} metric ${index} label visible`).toBe(true);
          expect(await value.isVisible(), `${slug} ${viewport.name} metric ${index} value visible`).toBe(true);
          expect(INVALID_VALUE.test((await value.textContent()) || ''), `${slug} ${viewport.name} metric value`).toBe(false);
          expect(overlaps(await box(label), await box(value)), `${slug} ${viewport.name} metric ${index} label/value overlap`).toBe(false);
          if (index > 0) {
            expect(overlaps(await box(metrics.nth(index - 1)), await box(metric)), `${slug} ${viewport.name} adjacent metrics overlap`).toBe(false);
          }
        }
      }
    }
  });

  test('preparation remains meaningful and responsive in all laboratories', async ({ page }) => {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      for (const slug of LABS) {
        await openLab(page, slug);
        const canvas = page.locator('[data-lab-v4-canvas]');
        const svg = canvas.locator('svg').first();
        await expect(svg).toBeVisible();
        expect(await svg.locator('path, line, circle, rect, polygon, polyline, text').count()).toBeGreaterThan(3);
        expect(await canvas.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
        if (viewport.name === 'desktop' || viewport.name === 'mobile') {
          await page.screenshot({
            path: `test-results/nv-1000-phase-12-5/final/${slug}/${viewport.name === 'desktop' ? 'preparation' : 'mobile-preparation'}.png`,
            fullPage: true,
          });
        }
      }
    }
  });

  test('Research Active preserves preparation execution state in all laboratories', async ({ page }) => {
    for (const slug of LABS) {
      await openLab(page, slug);
      const workspace = page.locator('[data-lab-v4-workspace]');
      await page.locator('[data-research-toggle]').first().click();
      await expect(workspace).toHaveAttribute('data-research-state', 'active');
      await expect(workspace).toHaveAttribute('data-execution-state', 'preparation');
      expect(await page.locator('[data-lab-v4-execution-console]').getAttribute('data-execution-state')).toBe('preparation');
    }
  });

  test('Research Session is compact when inactive and accessible only when active', async ({ page }) => {
    for (const slug of LABS) {
      await openLab(page, slug);
      const workspace = page.locator('[data-lab-v4-workspace]');
      const panel = page.locator('[data-research-panel]');
      const body = page.locator('[data-research-session-body]');
      const activation = panel.locator('.nv-lab-v4-research__activate');
      const hypothesis = page.locator('[data-research-hypothesis]');

      await expect(workspace).toHaveAttribute('data-research-state', 'inactive');
      await expect(panel).toHaveAttribute('data-research-panel-state', 'inactive');
      await expect(body).toBeHidden();
      await expect(hypothesis).toBeHidden();
      await expect(activation).toHaveText('Activate Research Session');
      expect(await body.evaluate((el) => el.getBoundingClientRect().height)).toBe(0);

      await activation.click();
      await expect(workspace).toHaveAttribute('data-research-state', 'active');
      await expect(panel).toHaveAttribute('data-research-panel-state', 'active');
      await expect(body).toBeVisible();
      await expect(hypothesis).toBeVisible();
      await expect(activation).toHaveText('Deactivate Research Session');
      await expect(workspace).toHaveAttribute('data-execution-state', 'preparation');

      await activation.click();
      await expect(workspace).toHaveAttribute('data-research-state', 'inactive');
      await expect(body).toBeHidden();
      await expect(hypothesis).toBeHidden();
      await expect(workspace).toHaveAttribute('data-execution-state', 'preparation');
    }
  });
});
