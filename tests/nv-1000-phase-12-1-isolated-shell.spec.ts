import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = 'http://localhost:8080/index.html#/laboratory/';
const LABS = ['gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection', 'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention'];
const REGIONS = ['[data-lab-v4-header]', '[data-lab-v4-observation-deck]', '[data-lab-v4-execution-deck]', '[data-lab-v4-analysis-deck]', '[data-lab-v4-research-deck]', '[data-lab-v4-continuations]'];

function intersectionArea(a: any, b: any) {
  if (!a || !b) return 0;
  return Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
}

test.describe('Phase 12.1 Isolated Laboratory Workspace Shell', () => {
  test('all canonical laboratories use one ordered v4 shell without duplicate subsystems', async ({ page }) => {
    const matrix: unknown[] = [];
    for (const slug of LABS) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(BASE + slug, { waitUntil: 'networkidle' });
      const record = await page.evaluate((regions) => {
        const root = document.querySelector('[data-lab-v4-workspace]');
        const children = root ? [...root.children] : [];
        const indexes = regions.map(selector => children.findIndex(child => child.matches(selector)));
        const count = (selector: string) => document.querySelectorAll(selector).length;
        return {
          version: root?.getAttribute('data-workspace-version'),
          rootCount: count('[data-lab-v4-workspace]'),
          regionCounts: regions.map(count),
          indexes,
          titleCount: count('[data-lab-title]'),
          timelineCount: count('[data-lab-timeline]'),
          parameterCount: count('[data-lab-parameters-drawer]'),
          xaiCount: count('[data-xai-panel]'),
          researchCount: count('[data-research-panel]'),
          logCount: count('[data-lab-log]'),
          stageHasParameters: !!root?.querySelector('[data-lab-v4-stage] [data-lab-parameters-drawer]'),
          stageHasControls: !!root?.querySelector('[data-lab-v4-stage] [data-action]'),
          rootState: root?.getAttribute('data-execution-state'),
          researchState: root?.getAttribute('data-research-state')
        };
      }, REGIONS);
      expect(record.rootCount).toBe(1);
      expect(record.version).toBe('4');
      expect(record.regionCounts).toEqual([1, 1, 1, 1, 1, 1]);
      expect(record.indexes).toEqual([0, 1, 2, 3, 4, 5]);
      expect(record.titleCount).toBe(1);
      expect(record.timelineCount).toBe(1);
      expect(record.parameterCount).toBe(1);
      expect(record.xaiCount).toBeLessThanOrEqual(1);
      expect(record.researchCount).toBeLessThanOrEqual(1);
      expect(record.logCount).toBeLessThanOrEqual(1);
      expect(record.stageHasParameters).toBe(false);
      expect(record.stageHasControls).toBe(false);
      expect(record.rootState).toBe('preparation');
      expect(record.researchState).toBe('inactive');
      matrix.push({ slug, ...record });
    }
    mkdirSync('artifacts/nv-1000-phase-12-1', { recursive: true });
    writeFileSync('artifacts/nv-1000-phase-12-1/laboratory-shell-matrix.json', JSON.stringify(matrix, null, 2));
  });

  test('state attributes mirror execution and research sources', async ({ page }) => {
    await page.goto(BASE + 'gradient-descent', { waitUntil: 'networkidle' });
    const root = page.locator('[data-lab-v4-workspace]');
    await expect(root).toHaveAttribute('data-execution-state', 'preparation');
    await page.locator('[data-action="run"]').click();
    await expect(root).toHaveAttribute('data-execution-state', 'running');
    await page.locator('[data-action="pause"]').click();
    await expect(root).toHaveAttribute('data-execution-state', 'paused');
    await page.locator('[data-action="reset-exec"]').click();
    await expect(root).toHaveAttribute('data-execution-state', 'preparation');
    await page.locator('[data-research-toggle]').click();
    await expect(root).toHaveAttribute('data-research-state', 'active');
    await page.locator('[data-research-toggle]').click();
    await expect(root).toHaveAttribute('data-research-state', 'inactive');
  });

  for (const [width, height] of [[1920, 1080], [1440, 900], [1280, 800], [1024, 768], [768, 1024], [430, 932], [390, 844], [360, 740]]) {
    test(`shell regions remain ordered at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(BASE + 'gradient-descent', { waitUntil: 'networkidle' });
      const boxes = await page.evaluate((regions) => regions.map(selector => {
        const r = document.querySelector(selector)?.getBoundingClientRect();
        return r && { x: r.x, y: r.y, width: r.width, height: r.height };
      }), REGIONS);
      for (let index = 0; index < boxes.length - 1; index++) {
        expect(intersectionArea(boxes[index], boxes[index + 1])).toBe(0);
        expect(boxes[index]!.y + boxes[index]!.height).toBeLessThanOrEqual(boxes[index + 1]!.y + 1);
      }
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width + 1);
    });
  }
});
