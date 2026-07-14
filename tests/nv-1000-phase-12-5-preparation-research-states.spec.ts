import { test, expect, type Page } from '@playwright/test';

const LABS = [
  'gradient-descent',
  'linear-regression',
  'logistic-regression',
  'kmeans-clustering',
  'pca-projection',
  'bayes-rule',
  'embedding-similarity',
  'cosine-similarity',
  'precision-recall',
  'transformer-attention',
];

async function navigateToLab(page: Page, slug: string) {
  await page.goto(`/#/laboratory/${slug}`);
  await page.waitForSelector('[data-lab-v4-workspace]', { timeout: 15000 });
  await page.waitForTimeout(500);
}

test.describe('Phase 12.5 — Preparation and Research States', () => {
  test.describe('Canonical root state attributes', () => {
    for (const slug of LABS) {
      test(`${slug} has both data-execution-state and data-research-state`, async ({ page }) => {
        await navigateToLab(page, slug);
        const workspace = page.locator('[data-lab-v4-workspace]');
        await expect(workspace).toHaveAttribute('data-execution-state', 'preparation');
        await expect(workspace).toHaveAttribute('data-research-state', 'inactive');
      });
    }
  });

  test.describe('Preparation state', () => {
    for (const slug of LABS) {
      test(`${slug} shows meaningful preparation visualization`, async ({ page }) => {
        await navigateToLab(page, slug);
        const canvas = page.locator('[data-lab-v4-canvas]');
        await expect(canvas).toBeVisible();
        const svgCount = await canvas.locator('svg').count();
        expect(svgCount).toBeGreaterThan(0);
        const textContent = await canvas.textContent();
        expect(textContent?.trim().length).toBeGreaterThan(10);
      });

      test(`${slug} has 2-5 telemetry values in preparation`, async ({ page }) => {
        await navigateToLab(page, slug);
        const metrics = page.locator('[data-lab-v4-telemetry] [data-hud-metric]');
        const count = await metrics.count();
        expect(count).toBeGreaterThanOrEqual(2);
        expect(count).toBeLessThanOrEqual(5);
      });

      test(`${slug} Run button enabled in preparation`, async ({ page }) => {
        await navigateToLab(page, slug);
        const runBtn = page.locator('[data-action="run"]');
        await expect(runBtn).toBeEnabled();
      });

      test(`${slug} Pause button disabled in preparation`, async ({ page }) => {
        await navigateToLab(page, slug);
        const pauseBtn = page.locator('[data-action="pause"]');
        await expect(pauseBtn).toBeDisabled();
      });
    }
  });

  test.describe('State transitions — gradient-descent', () => {
    test('preparation → running → paused → running → completed', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');
      const workspace = page.locator('[data-lab-v4-workspace]');
      await expect(workspace).toHaveAttribute('data-execution-state', 'preparation');

      await page.locator('[data-action="run"]').click();
      await page.waitForTimeout(600);
      const state1 = await workspace.getAttribute('data-execution-state');
      expect(['running', 'paused', 'completed']).toContain(state1);

      if (state1 === 'running') {
        await page.locator('[data-action="pause"]').click();
        await page.waitForTimeout(200);
        await expect(workspace).toHaveAttribute('data-execution-state', 'paused');

        await page.locator('[data-action="run"]').click();
        await page.waitForTimeout(8000);
        const stateAfterResume = await workspace.getAttribute('data-execution-state');
        expect(['running', 'paused', 'completed']).toContain(stateAfterResume);
      }
    });

    test('completed → reset → preparation', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');
      await page.locator('[data-action="run"]').click();
      await page.waitForTimeout(10000);
      const state = await page.locator('[data-lab-v4-workspace]').getAttribute('data-execution-state');
      if (state === 'completed') {
        await page.locator('[data-action="reset-exec"]').click();
        await page.waitForTimeout(300);
        await expect(page.locator('[data-lab-v4-workspace]')).toHaveAttribute('data-execution-state', 'preparation');
      }
    });
  });

  test.describe('Research Active independence', () => {
    for (const slug of ['gradient-descent', 'kmeans-clustering', 'transformer-attention']) {
      test(`${slug}: Research Active preserves execution state`, async ({ page }) => {
        await navigateToLab(page, slug);
        const workspace = page.locator('[data-lab-v4-workspace]');
        await expect(workspace).toHaveAttribute('data-execution-state', 'preparation');

        await page.locator('[data-research-toggle]').first().click();
        await page.waitForTimeout(300);
        await expect(workspace).toHaveAttribute('data-research-state', 'active');
        await expect(workspace).toHaveAttribute('data-execution-state', 'preparation');
      });
    }
  });

  test.describe('Research persistence', () => {
    test('research data persists in storage across route navigation', async ({ page }) => {
      await navigateToLab(page, 'gradient-descent');
      await page.locator('[data-research-toggle]').first().click();
      await page.waitForTimeout(300);

      const hypothesis = page.locator('[data-research-hypothesis]');
      await hypothesis.fill('Test hypothesis for persistence');
      await page.waitForTimeout(200);

      await page.locator('[data-research-save-session]').click();
      await page.waitForTimeout(300);

      const storedBeforeNav = await page.evaluate(() => {
        const raw = localStorage.getItem('nv_research_sessions');
        if (!raw) return null;
        const all = JSON.parse(raw);
        const sessions = all['lab-gradient-descent'] || [];
        return sessions.length > 0 ? sessions[0].hypothesis : null;
      });
      expect(storedBeforeNav).toBe('Test hypothesis for persistence');

      await page.goto('/#/laboratory');
      await page.waitForTimeout(500);

      const storedAfterNav = await page.evaluate(() => {
        const raw = localStorage.getItem('nv_research_sessions');
        if (!raw) return null;
        const all = JSON.parse(raw);
        const sessions = all['lab-gradient-descent'] || [];
        return sessions.length > 0 ? sessions[0].hypothesis : null;
      });
      expect(storedAfterNav).toBe('Test hypothesis for persistence');
    });
  });

  test.describe('State disagreement detection', () => {
    for (const slug of LABS) {
      test(`${slug}: root and console state attributes agree`, async ({ page }) => {
        await navigateToLab(page, slug);
        const workspace = page.locator('[data-lab-v4-workspace]');
        const console_ = page.locator('[data-lab-v4-execution-console]');
        const rootState = await workspace.getAttribute('data-execution-state');
        const consoleState = await console_.getAttribute('data-execution-state');
        expect(rootState).toBe(consoleState);
      });
    }
  });

  test.describe('No blank canvas detection', () => {
    for (const slug of LABS) {
      test(`${slug}: preparation canvas has meaningful SVG content`, async ({ page }) => {
        await navigateToLab(page, slug);
        const canvas = page.locator('[data-lab-v4-canvas]');
        const svgElements = canvas.locator('svg');
        const svgCount = await svgElements.count();
        expect(svgCount).toBeGreaterThan(0);

        let totalElements = 0;
        for (let i = 0; i < svgCount; i++) {
          const childCount = await svgElements.nth(i).locator('circle, line, path, rect, polyline, text, polygon').count();
          totalElements += childCount;
        }
        expect(totalElements).toBeGreaterThan(3);
      });
    }
  });
});
