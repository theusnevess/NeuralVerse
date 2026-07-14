import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = 'http://localhost:8080/index.html#/laboratory/';
const ALL_LABS = ['gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection', 'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention'];
const KEY_LABS = ['gradient-descent', 'kmeans-clustering', 'pca-projection', 'transformer-attention'];
const STANDARD_VIEWPORTS = [[1440, 900], [768, 1024], [390, 844], [360, 740]] as const;
const FULL_VIEWPORTS = [[1920, 1080], [1440, 900], [1280, 800], [1024, 768], [768, 1024], [430, 932], [390, 844], [360, 740]] as const;

function overlap(a: any, b: any) {
  return !!a && !!b && Math.max(a.x, b.x) < Math.min(a.x + a.width, b.x + b.width) && Math.max(a.y, b.y) < Math.min(a.y + a.height, b.y + b.height);
}

test.describe('Phase 12.2 Scientific Stage Migration', () => {
  test('all ten laboratories render a single useful v4 stage at standard viewports', async ({ page }) => {
    test.setTimeout(240000);
    const matrix: unknown[] = [];
    for (const slug of ALL_LABS) {
      for (const [width, height] of STANDARD_VIEWPORTS) {
        await page.setViewportSize({ width, height });
        const errors: string[] = [];
        page.once('pageerror', error => errors.push(error.message));
        await page.goto(`http://localhost:8080/index.html?phase12=${slug}-${width}-${height}#/laboratory/${slug}`, { waitUntil: 'networkidle' });
        await expect(page.locator('[data-lab-v4-stage]')).toBeVisible();
        await expect(page.locator('[data-lab-v4-telemetry] [data-hud-metric-value]').first()).toBeVisible();
        const before = await page.locator('[data-lab-v4-telemetry]').textContent();
        await page.locator('[data-action="step"]').click();
        await page.waitForTimeout(200);
        const record = await page.evaluate(({ slug, width, height, before }) => {
          const box = (selector: string) => { const r = document.querySelector(selector)?.getBoundingClientRect(); return r && { x: r.x, y: r.y, width: r.width, height: r.height }; };
          const stage = document.querySelector('[data-lab-v4-stage]');
          const canvas = document.querySelector('[data-lab-v4-canvas]');
          const visualization = document.querySelector('[data-lab-v4-visualization]');
          const telemetry = document.querySelector('[data-lab-v4-telemetry]');
          const finding = document.querySelector('[data-lab-v4-current-finding]');
          const values = [...document.querySelectorAll('[data-lab-v4-telemetry] [data-hud-metric-value]')].map(el => el.textContent || '');
          const invalid = values.some(value => /undefined|null|NaN|Infinity|\[object Object\]/i.test(value));
          const meaningful = !!visualization?.querySelector('svg, canvas, table, .nv-lab-obs-title, [class*="chart"], [class*="plot"]');
          const telemetryScroll = telemetry ? telemetry.scrollHeight > telemetry.clientHeight + 1 : false;
          const findingScroll = finding && !finding.hasAttribute('hidden') ? finding.scrollHeight > finding.clientHeight + 1 : false;
          const svgCount = visualization ? visualization.querySelectorAll('svg').length : 0;
          const canvasCount = visualization ? visualization.querySelectorAll('canvas').length : 0;
          const internalAccordions = stage ? stage.querySelectorAll('[data-accordion-trigger], [data-drawer-trigger]').length : 0;
          return {
            slug, width, height,
            stageCount: document.querySelectorAll('[data-lab-v4-stage]').length,
            canvasCount: document.querySelectorAll('[data-lab-v4-canvas]').length,
            visualizationCount: document.querySelectorAll('[data-lab-v4-visualization]').length,
            telemetryCount: document.querySelectorAll('[data-lab-v4-telemetry]').length,
            findingCount: document.querySelectorAll('[data-lab-v4-current-finding]').length,
            meaningful,
            telemetryMetricCount: values.length,
            telemetryChanged: before !== telemetry?.textContent,
            invalid,
            hiddenFinding: finding?.hasAttribute('hidden') || false,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            telemetryScroll,
            findingScroll,
            duplicateSvg: svgCount > 1,
            duplicateCanvas: canvasCount > 1,
            internalAccordions,
            boxes: { stage: box('[data-lab-v4-stage]'), canvas: box('[data-lab-v4-canvas]'), telemetry: box('[data-lab-v4-telemetry]'), finding: box('[data-lab-v4-current-finding]'), console: box('[data-lab-v4-console]') }
          };
        }, { slug, width, height, before });
        expect(record.stageCount).toBe(1);
        expect(record.canvasCount).toBe(1);
        expect(record.visualizationCount).toBe(1);
        expect(record.telemetryCount).toBe(1);
        expect(record.findingCount).toBeLessThanOrEqual(1);
        expect(record.meaningful).toBe(true);
        expect(record.telemetryMetricCount).toBeGreaterThanOrEqual(2);
        expect(record.telemetryMetricCount).toBeLessThanOrEqual(5);
        expect(record.telemetryChanged).toBe(true);
        expect(record.invalid).toBe(false);
        expect(record.overflow).toBe(false);
        expect(record.telemetryScroll).toBe(false);
        expect(record.findingScroll).toBe(false);
        expect(record.duplicateSvg).toBe(false);
        expect(record.duplicateCanvas).toBe(false);
        expect(record.internalAccordions).toBe(0);
        expect(overlap(record.boxes.telemetry, record.boxes.console)).toBe(false);
        if (!record.hiddenFinding) expect(overlap(record.boxes.finding, record.boxes.console)).toBe(false);
        matrix.push({ ...record, consoleErrors: errors.length, verdict: errors.length ? 'FAIL' : 'PASS' });
      }
    }
    mkdirSync('artifacts/nv-1000-phase-12-2', { recursive: true });
    writeFileSync('artifacts/nv-1000-phase-12-2/laboratory-stage-matrix.json', JSON.stringify(matrix, null, 2));
  });

  test('key labs render correctly at full viewport matrix (1920-360)', async ({ page }) => {
    test.setTimeout(240000);
    const matrix: unknown[] = [];
    for (const slug of KEY_LABS) {
      for (const [width, height] of FULL_VIEWPORTS) {
        await page.setViewportSize({ width, height });
        const errors: string[] = [];
        page.once('pageerror', error => errors.push(error.message));
        await page.goto(`http://localhost:8080/index.html?phase12=${slug}-${width}-${height}#/laboratory/${slug}`, { waitUntil: 'networkidle' });
        await expect(page.locator('[data-lab-v4-stage]')).toBeVisible();
        await page.locator('[data-action="step"]').click();
        await page.waitForTimeout(200);
        const record = await page.evaluate(({ slug, width, height }) => {
          const box = (selector: string) => { const r = document.querySelector(selector)?.getBoundingClientRect(); return r && { x: r.x, y: r.y, width: r.width, height: r.height }; };
          const stage = document.querySelector('[data-lab-v4-stage]');
          const canvas = document.querySelector('[data-lab-v4-canvas]');
          const visualization = document.querySelector('[data-lab-v4-visualization]');
          const telemetry = document.querySelector('[data-lab-v4-telemetry]');
          const finding = document.querySelector('[data-lab-v4-current-finding]');
          const values = [...document.querySelectorAll('[data-lab-v4-telemetry] [data-hud-metric-value]')].map(el => el.textContent || '');
          const invalid = values.some(value => /undefined|null|NaN|Infinity|\[object Object\]/i.test(value));
          const meaningful = !!visualization?.querySelector('svg, canvas, table, .nv-lab-obs-title, [class*="chart"], [class*="plot"]');
          return {
            slug, width, height,
            stageCount: document.querySelectorAll('[data-lab-v4-stage]').length,
            canvasCount: document.querySelectorAll('[data-lab-v4-canvas]').length,
            visualizationCount: document.querySelectorAll('[data-lab-v4-visualization]').length,
            telemetryCount: document.querySelectorAll('[data-lab-v4-telemetry]').length,
            findingCount: document.querySelectorAll('[data-lab-v4-current-finding]').length,
            meaningful,
            telemetryMetricCount: values.length,
            invalid,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            boxes: { stage: box('[data-lab-v4-stage]'), canvas: box('[data-lab-v4-canvas]'), telemetry: box('[data-lab-v4-telemetry]'), finding: box('[data-lab-v4-current-finding]'), console: box('[data-lab-v4-console]') }
          };
        }, { slug, width, height });
        expect(record.stageCount).toBe(1);
        expect(record.canvasCount).toBe(1);
        expect(record.visualizationCount).toBe(1);
        expect(record.telemetryCount).toBe(1);
        expect(record.findingCount).toBeLessThanOrEqual(1);
        expect(record.meaningful).toBe(true);
        expect(record.telemetryMetricCount).toBeGreaterThanOrEqual(2);
        expect(record.telemetryMetricCount).toBeLessThanOrEqual(5);
        expect(record.invalid).toBe(false);
        expect(record.overflow).toBe(false);
        expect(overlap(record.boxes.telemetry, record.boxes.console)).toBe(false);
        matrix.push({ ...record, consoleErrors: errors.length, verdict: errors.length ? 'FAIL' : 'PASS' });
      }
    }
    mkdirSync('artifacts/nv-1000-phase-12-2', { recursive: true });
    writeFileSync('artifacts/nv-1000-phase-12-2/key-labs-full-matrix.json', JSON.stringify(matrix, null, 2));
  });

  test('finding region appears once when the existing Gradient Descent rule triggers', async ({ page }) => {
    await page.goto(BASE + 'gradient-descent', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-lab-v4-current-finding]')).toBeHidden();
    for (let i = 0; i < 5; i++) await page.locator('[data-action="step"]').click();
    const finding = page.locator('[data-lab-v4-current-finding]');
    await expect(finding).toBeVisible();
    await expect(finding.locator('.nv-xai-finding')).toHaveCount(1);
    await expect(finding).toContainText('Observation');
    await expect(finding).toContainText('Cause');
  });

  test('stage composes correctly: no overlap between telemetry, canvas, and finding', async ({ page }) => {
    await page.goto(BASE + 'gradient-descent', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('[data-action="step"]').click();
    await page.waitForTimeout(200);
    const layout = await page.evaluate(() => {
      const box = (selector: string) => { const r = document.querySelector(selector)?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; };
      const t = box('[data-lab-v4-telemetry]');
      const c = box('[data-lab-v4-canvas]');
      const f = box('[data-lab-v4-current-finding]');
      const noOverlap = (a: any, b: any) => !a || !b || a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
      return {
        telemetryCanvas: noOverlap(t, c),
        telemetryFinding: noOverlap(t, f),
        canvasFinding: noOverlap(c, f),
        canvasExpandsNoFinding: !f ? (c && c.w > (t?.w || 0)) : true
      };
    });
    expect(layout.telemetryCanvas).toBe(true);
    expect(layout.telemetryFinding).toBe(true);
    expect(layout.canvasFinding).toBe(true);
    expect(layout.canvasExpandsNoFinding).toBe(true);
  });
});
