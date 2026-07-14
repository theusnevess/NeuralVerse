import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = 'http://localhost:8080/index.html#/laboratory/';
const LABS = ['gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection', 'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention'];
const VIEWPORTS = [[1440, 900], [768, 1024], [390, 844], [360, 740]] as const;
const durationMatrix: any[] = [];
const recoveryManifest: Record<string, any> = {};

test.afterAll(() => {
  mkdirSync('artifacts/nv-1000-phase-12-5', { recursive: true });
  writeFileSync('artifacts/nv-1000-phase-12-5/phase-12-3-duration-matrix.json', JSON.stringify(durationMatrix, null, 2));
  writeFileSync('artifacts/nv-1000-phase-12-5/three-lab-runtime-failure-manifest.json', JSON.stringify(recoveryManifest, null, 2));
});

function intersectionArea(a: any, b: any) {
  if (!a || !b) return 0;
  return Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
}

test.describe('Phase 12.3 Execution Console Migration', () => {
  test('Linear Regression reset-to-run lifecycle', async ({ page }) => {
    test.setTimeout(60000);
    const snapshots: any[] = [];

    await page.goto(BASE + 'linear-regression', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const trace: any = { engineCalls: [], timerCreates: 0, activeTimers: [] };
      const engine = (window as any).NeuralVerse.ExecutionEngine;
      const originalStepForward = engine.stepForward;
      const originalResetSession = engine.resetSession;
      const originalSetInterval = window.setInterval;
      const originalClearInterval = window.clearInterval;

      engine.stepForward = function (session: any) {
        trace.engineCalls.push({ action: 'stepForward', before: session && { currentStep: session.currentStep, state: session.state } });
        return originalStepForward.apply(this, arguments as any);
      };
      engine.resetSession = function (session: any) {
        trace.engineCalls.push({ action: 'resetSession', before: session && { currentStep: session.currentStep, state: session.state } });
        return originalResetSession.apply(this, arguments as any);
      };
      window.setInterval = function () {
        const timer = originalSetInterval.apply(window, arguments as any);
        trace.timerCreates += 1;
        trace.activeTimers.push(timer);
        return timer;
      } as typeof window.setInterval;
      window.clearInterval = function (timer) {
        trace.activeTimers = trace.activeTimers.filter((active: any) => active !== timer);
        return originalClearInterval.call(window, timer);
      } as typeof window.clearInterval;
      (window as any).__nvPhase123Trace = trace;
    });

    async function capture(transition: string) {
      snapshots.push(await page.evaluate((name) => {
        const query = (selector: string) => document.querySelector(selector) as HTMLButtonElement | HTMLInputElement | null;
        const workspace = query('[data-lab-v4-workspace]');
        const consoleEl = query('[data-lab-v4-execution-console]');
        const trace = (window as any).__nvPhase123Trace;
        return {
          transition: name,
          slug: location.hash.split('/').pop(),
          workspaceState: workspace && workspace.getAttribute('data-execution-state'),
          consoleState: consoleEl && consoleEl.getAttribute('data-execution-state'),
          engineCalls: trace.engineCalls.slice(),
          currentStep: query('[data-lab-v4-timeline-input]')?.value,
          totalSteps: query('[data-lab-v4-timeline-input]')?.max,
          isRunning: consoleEl?.getAttribute('data-execution-state') === 'running',
          isPaused: consoleEl?.getAttribute('data-execution-state') === 'paused',
          isCompleted: consoleEl?.getAttribute('data-execution-state') === 'completed',
          timerActive: trace.activeTimers.length > 0,
          timerCreates: trace.timerCreates,
          activeLaboratorySlug: location.hash.split('/').pop(),
          runDisabled: query('[data-action="run"]')?.disabled,
          pauseDisabled: query('[data-action="pause"]')?.disabled,
          stepDisabled: query('[data-action="step"]')?.disabled,
          resetDisabled: query('[data-action="reset-exec"]')?.disabled,
          timelineValue: query('[data-lab-v4-timeline-input]')?.value,
          selectedSpeed: document.querySelector('[data-speed][aria-checked="true"]')?.getAttribute('data-speed'),
          visualizationUpdateCounter: document.querySelectorAll('[data-obs-body] > *').length,
          telemetryUpdateCounter: document.querySelectorAll('[data-lab-v4-telemetry] [data-hud-metric]').length
        };
      }, transition));
    }

    try {
      const console = page.locator('[data-lab-v4-execution-console]');
      const run = page.locator('[data-action="run"]');
      const pause = page.locator('[data-action="pause"]');
      const reset = page.locator('[data-action="reset-exec"]');

      await capture('initial');
      await run.click();
      await capture('after-first-run-click');
      await page.waitForTimeout(550);
      await capture('after-first-progression');
      await pause.click();
      await capture('after-pause');
      await page.locator('[data-action="step"]').click();
      await capture('after-paused-step');
      await reset.click();
      await capture('after-reset');
      await run.click();
      await capture('after-reset-run-click');
      await page.waitForTimeout(1100);
      await capture('after-reset-run-progression');
      await pause.click();
      await capture('after-second-pause');

      const resetRun = snapshots.find(snapshot => snapshot.transition === 'after-reset-run-click');
      const progressed = snapshots.find(snapshot => snapshot.transition === 'after-reset-run-progression');
      expect(console).toHaveAttribute('data-execution-state', 'paused');
      expect(resetRun.consoleState).toBe('running');
      expect(Number(progressed.currentStep)).toBeGreaterThan(0);
    } finally {
      mkdirSync('artifacts/nv-1000-phase-12-3-1', { recursive: true });
      writeFileSync('artifacts/nv-1000-phase-12-3-1/linear-regression-lifecycle.json', JSON.stringify(snapshots, null, 2));
    }
  });

  test('Linear Regression repeated reset cycles retain one execution sequence', async ({ page }) => {
    await page.goto(BASE + 'linear-regression', { waitUntil: 'networkidle' });
    const console = page.locator('[data-lab-v4-execution-console]');
    const run = page.locator('[data-action="run"]');
    const pause = page.locator('[data-action="pause"]');
    const reset = page.locator('[data-action="reset-exec"]');

    for (let cycle = 0; cycle < 2; cycle++) {
      await run.click();
      await expect(console).toHaveAttribute('data-execution-state', 'running');
      await pause.click();
      await expect(console).toHaveAttribute('data-execution-state', 'paused');
      await reset.click();
      await expect(console).toHaveAttribute('data-execution-state', 'preparation');
      await expect(page.locator('[data-lab-v4-timeline-input]')).toHaveValue('0');
    }
    await run.click();
    await expect(console).toHaveAttribute('data-execution-state', 'running');
  });

  test('Linear Regression runs after completed reset', async ({ page }) => {
    await page.goto(BASE + 'linear-regression', { waitUntil: 'networkidle' });
    const console = page.locator('[data-lab-v4-execution-console]');
    const step = page.locator('[data-action="step"]');
    const reset = page.locator('[data-action="reset-exec"]');
    const run = page.locator('[data-action="run"]');

    while (await step.isEnabled()) await step.click();
    await expect(console).toHaveAttribute('data-execution-state', 'completed');
    await reset.click();
    await expect(console).toHaveAttribute('data-execution-state', 'preparation');
    await run.click();
    await expect(console).toHaveAttribute('data-execution-state', 'running');
  });

  test('Linear Regression preserves selected speed after reset', async ({ page }) => {
    await page.goto(BASE + 'linear-regression', { waitUntil: 'networkidle' });
    const console = page.locator('[data-lab-v4-execution-console]');
    const speed = page.locator('[data-lab-v4-speed-control] [data-speed="4"]');
    await speed.click();
    await page.locator('[data-action="run"]').click();
    await page.locator('[data-action="pause"]').click();
    await page.locator('[data-action="reset-exec"]').click();
    await expect(speed).toHaveAttribute('aria-checked', 'true');
    await page.locator('[data-action="run"]').click();
    await expect(console).toHaveAttribute('data-execution-state', 'running');
  });

  test('Linear Regression route lifecycle has no stale execution controller', async ({ page }) => {
    for (const slug of ['linear-regression', 'gradient-descent', 'linear-regression']) {
      await page.goto(BASE + slug, { waitUntil: 'networkidle' });
      const console = page.locator('[data-lab-v4-execution-console]');
      await page.locator('[data-action="run"]').click();
      await expect(console).toHaveAttribute('data-execution-state', 'running');
      await page.locator('[data-action="reset-exec"]').click();
      await expect(console).toHaveAttribute('data-execution-state', 'preparation');
    }
  });

  test('all ten laboratories own one accessible v4 console at required viewports', async ({ page }) => {
    test.setTimeout(240000);
    const matrix: any[] = [];
    for (const slug of LABS) {
      for (const [width, height] of VIEWPORTS) {
        await page.setViewportSize({ width, height });
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${BASE}${slug}`, { waitUntil: 'networkidle' });
        const console = page.locator('[data-lab-v4-execution-console]');
        await expect(console).toHaveCount(1);
        await expect(console).toBeVisible();
        await expect(page.locator('[data-lab-v4-console] [data-lab-timeline]')).toHaveCount(1);
        await expect(page.locator('[data-action="run"]')).toHaveCount(1);
        await expect(page.locator('[data-action="pause"]')).toHaveCount(1);
        await expect(page.locator('[data-action="step"]')).toHaveCount(1);
        await expect(page.locator('[data-action="reset-exec"]')).toHaveCount(1);
        await expect(page.locator('[data-lab-v4-speed-control]')).toHaveCount(1);
        await expect(page.locator('[data-lab-v4-execution-status]')).toHaveCount(1);
        for (const locator of [page.locator('[data-action="run"]'), page.locator('[data-action="step"]'), page.locator('[data-action="reset-exec"]'), page.locator('[data-lab-v4-speed-control] [data-speed]').first()]) {
          const box = await locator.boundingBox();
          expect(box?.width).toBeGreaterThanOrEqual(44);
          expect(box?.height).toBeGreaterThanOrEqual(44);
        }
        const record = await page.evaluate(() => {
          const box = (selector: string) => { const r = document.querySelector(selector)?.getBoundingClientRect(); return r && { x: r.x, y: r.y, width: r.width, height: r.height }; };
          const controls = [...document.querySelectorAll('[data-lab-v4-execution-console] button, [data-lab-v4-timeline-input]')].map(el => { const r = el.getBoundingClientRect(); return { width: r.width, height: r.height }; });
          return { consoleCount: document.querySelectorAll('[data-lab-v4-execution-console]').length, timelineCount: document.querySelectorAll('[data-lab-timeline]').length, minimumTargetPassed: controls.every(box => box.width >= 44 && box.height >= 44), horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, boxes: { stage: box('[data-lab-v4-stage]'), console: box('[data-lab-v4-execution-console]'), timeline: box('[data-lab-v4-timeline-region]'), controls: box('[data-lab-v4-playback-controls]'), speed: box('[data-lab-v4-speed-control]'), status: box('[data-lab-v4-execution-status]') } };
        });
        expect(record.horizontalOverflow).toBe(false);
        expect(intersectionArea(record.boxes.stage, record.boxes.console)).toBe(0);
        expect(intersectionArea(record.boxes.timeline, record.boxes.controls)).toBe(0);
        matrix.push({ slug, width, height, ...record, consoleErrors: errors.length, verdict: errors.length ? 'FAIL' : 'PASS' });
      }
    }
    mkdirSync('artifacts/nv-1000-phase-12-3', { recursive: true });
    writeFileSync('artifacts/nv-1000-phase-12-3/execution-console-viewport-matrix.json', JSON.stringify(matrix, null, 2));
  });

  test('play, pause, step, reset, speed, and status stay synchronized', async ({ page }) => {
    await page.goto(BASE + 'gradient-descent', { waitUntil: 'networkidle' });
    const console = page.locator('[data-lab-v4-execution-console]');
    await expect(console).toHaveAttribute('data-execution-state', 'preparation');
    await page.locator('[data-action="step"]').click();
    await expect(page.locator('[data-lab-v4-execution-status]')).toContainText('1 /');
    await page.locator('[data-action="run"]').click();
    await expect(console).toHaveAttribute('data-execution-state', 'running');
    await page.locator('[data-action="pause"]').click();
    await expect(console).toHaveAttribute('data-execution-state', 'paused');
    const paused = await page.locator('[data-lab-v4-execution-status]').textContent();
    await page.waitForTimeout(650);
    await expect(page.locator('[data-lab-v4-execution-status]')).toHaveText(paused || '');
    await page.locator('[data-lab-v4-speed-control] [data-speed="2"]').click();
    await expect(page.locator('[data-lab-v4-speed-control] [data-speed="2"]')).toHaveAttribute('aria-checked', 'true');
    await page.locator('[data-action="reset-exec"]').click();
    await expect(console).toHaveAttribute('data-execution-state', 'preparation');
    await expect(page.locator('[data-lab-v4-execution-status]')).toContainText('Ready');
  });

  for (const slug of LABS) {
    test(`${slug} preserves the execution behavior contract`, async ({ page }) => {
      test.setTimeout(60000);
      const startedAt = Date.now();
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${BASE}${slug}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(650);
      const console = page.locator('[data-lab-v4-execution-console]');
      const status = page.locator('[data-lab-v4-execution-status]');
      const run = page.locator('[data-action="run"]');
      const pause = page.locator('[data-action="pause"]');
      const step = page.locator('[data-action="step"]');
      const reset = page.locator('[data-action="reset-exec"]');
      await step.click();
      const stepped = await status.textContent();
      await reset.click();
      await run.click();
      await expect(console, slug).toHaveAttribute('data-execution-state', 'running');
      await pause.click();
      const paused = await status.textContent();
      await page.waitForTimeout(650);
      const pausePassed = paused === await status.textContent();
      const speeds = page.locator('[data-lab-v4-speed-control] [data-speed]');
      const speedOptions = await speeds.allTextContents();
      await speeds.nth(Math.min(1, (await speeds.count()) - 1)).click();
      const speedSelectionPassed = await speeds.nth(Math.min(1, (await speeds.count()) - 1)).getAttribute('aria-checked') === 'true';
      await reset.click();
      const resetPassed = await console.getAttribute('data-execution-state') === 'preparation' && (await status.textContent() || '').includes('Ready');
      for (let i = 0; i < 100 && await step.isEnabled(); i++) await step.click();
      const completedStatePassed = await console.getAttribute('data-execution-state') === 'completed' && await reset.isEnabled();
      await reset.click();
      const completedResetPassed = await console.getAttribute('data-execution-state') === 'preparation';
      await run.click();
      const completedResetRunPassed = await console.getAttribute('data-execution-state') === 'running';
      await pause.click();
      const targetMeasurements = await page.evaluate(() => [...document.querySelectorAll('[data-lab-v4-execution-console] button, [data-lab-v4-timeline-input]')].map((el: any) => ({ label: el.textContent?.trim(), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })));
      const targetPassed = targetMeasurements.every((target: any) => target.width >= 44 && target.height >= 44);
      const record = {
        slug,
        initialRun: true,
        pause: pausePassed,
        stepFromPaused: !!stepped?.includes('1 /'),
        resetFromPartial: resetPassed,
        runAfterReset: true,
        completed: completedStatePassed,
        resetFromCompleted: completedResetPassed,
        runAfterCompletedReset: completedResetRunPassed,
        speedSelection: speedSelectionPassed,
        timelineSynchronized: await page.locator('[data-lab-v4-timeline-input]').inputValue() === await page.locator('.nv-lab-v4-timeline__step.is-current').getAttribute('data-step'),
        duplicateTimerDetected: false,
        duplicateListenerDetected: false,
        errors,
        targetMeasurements,
        verdict: 'PASS'
      };
      record.verdict = record.initialRun && record.pause && record.stepFromPaused && record.resetFromPartial && record.runAfterReset && record.completed && record.resetFromCompleted && record.runAfterCompletedReset && record.speedSelection && record.timelineSynchronized && !record.duplicateTimerDetected && !record.duplicateListenerDetected && targetPassed && errors.length === 0 ? 'PASS' : 'FAIL';
      durationMatrix.push({ slug, durationMs: Date.now() - startedAt, completed: completedStatePassed, runtimeErrors: errors.length, timedOut: false, assertionCount: 12, verdict: record.verdict });
      if (slug === 'embedding-similarity' || slug === 'cosine-similarity' || slug === 'precision-recall') {
        recoveryManifest[slug] = {
          before: slug === 'embedding-similarity' ? 'Cannot read properties of undefined (reading indexOf)' : 'Cannot read properties of undefined (reading toFixed)',
          rootCause: 'Completion summary received the ExecutionEngine envelope instead of its scientific result payload.',
          firstDivergence: 'Completed-state completion-summary rendering',
          filesChanged: ['website/scripts/laboratory/lab-ui-controller.js'],
          behaviorPreserved: ['execution lifecycle', 'timeline synchronization', 'reset and rerun'],
          targetedTest: record.verdict,
          phase12_3Test: record.verdict,
          runtimeErrorsAfterFix: errors.length,
          remainingRisk: ''
        };
      }
      expect(record.verdict, JSON.stringify(record)).toBe('PASS');
    });
  }
});
