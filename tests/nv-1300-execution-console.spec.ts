import { expect, test, type Page } from './fixtures/playwright-runtime-observability';
import { mkdirSync, writeFileSync } from 'node:fs';

const labs = ['gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection', 'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention'];
const artifactDir = 'artifacts/nv-1300-execution-console';
let navigationId = 0;

async function open(page: Page, slug: string) {
  await page.goto(`/index.html?execution-console=${navigationId++}#/laboratory/${slug}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-lab-v4-execution-console]')).toBeVisible();
}

async function state(page: Page) {
  return page.locator('[data-lab-v4-workspace]').getAttribute('data-execution-lifecycle');
}

test('all laboratories preserve canonical execution lifecycle and synchronization', async ({ page }) => {
  test.setTimeout(300_000);
  mkdirSync(`${artifactDir}/final-screenshots`, { recursive: true });
  const records: any[] = [];

  for (const slug of labs) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, slug);
    const console = page.locator('[data-lab-v4-execution-console]');
    const run = page.locator('[data-action="run"]');
    const pause = page.locator('[data-action="pause"]');
    const step = page.locator('[data-action="step"]');
    const reset = page.locator('[data-action="reset-exec"]');

    expect(await state(page), `${slug}: ready`).toBe('ready');
    await expect(console).toHaveAttribute('aria-busy', 'false');
    await expect(run).toBeEnabled();
    await expect(run).toHaveClass(/control--primary/);
    await expect(reset).toBeDisabled();
    if (slug === 'gradient-descent') {
      await console.screenshot({ path: `${artifactDir}/final-screenshots/gradient-descent__ready__1440x900.png` });
    }
    await run.click();
    await expect.poll(() => state(page)).toBe('running');
    await expect(console).toHaveAttribute('aria-busy', 'true');
    await expect(pause).toBeEnabled();
    await expect(pause).toHaveClass(/control--primary/);
    if (slug === 'gradient-descent') {
      await console.screenshot({ path: `${artifactDir}/final-screenshots/gradient-descent__running__1440x900.png` });
    }
    await pause.click();
    await expect.poll(() => state(page)).toBe('paused');
    await expect(run).toHaveText('Resume');
    await expect(run).toBeFocused();
    await expect(page.locator('[data-lab-v4-stage]')).toHaveAttribute('data-scientific-stage-state', 'paused');
    if (slug === 'gradient-descent') {
      await console.screenshot({ path: `${artifactDir}/final-screenshots/gradient-descent__paused__1440x900.png` });
    }
    await run.click();
    await expect.poll(() => state(page)).toBe('running');
    await pause.click();
    await expect.poll(() => state(page)).toBe('paused');

    for (let index = 0; index < 110 && await step.isEnabled(); index++) await step.click();
    await expect.poll(() => state(page)).toBe('completed');
    await expect(console).toHaveAttribute('aria-busy', 'false');
    await expect(console.getByText('Completed', { exact: true })).toBeVisible();
    await expect(page.locator('[data-lab-v4-stage]')).toHaveAttribute('data-scientific-stage-state', 'completed');
    await expect(page.locator('[data-lab-v4-completion-deck]')).toHaveCount(1);
    await expect(reset).toBeEnabled();
    await expect(reset).toHaveClass(/control--primary/);

    const progress = await page.locator('[data-lab-v4-timeline-input]').evaluate((input: HTMLInputElement) => ({ now: input.getAttribute('aria-valuenow'), max: input.getAttribute('aria-valuemax'), text: input.getAttribute('aria-valuetext') }));
    expect(Number(progress.now)).toBeLessThanOrEqual(Number(progress.max));
    expect(progress.text).not.toContain('undefined');
    expect(progress.text).not.toContain('NaN');
    if (['gradient-descent', 'logistic-regression', 'transformer-attention'].includes(slug)) {
      await console.screenshot({ path: `${artifactDir}/final-screenshots/${slug}__completed__1440x900.png` });
    }

    await reset.click();
    await expect.poll(() => state(page)).toBe('ready');
    await expect(run).toBeEnabled();
    await expect(run).toBeFocused();
    await expect(page.locator('[data-lab-v4-completion-deck]')).toHaveCount(0);
    records.push({ laboratory: slug, lifecycle: ['ready', 'running', 'paused', 'running', 'completed', 'ready'], progress, result: 'PASS' });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'transformer-attention');
  const mobile = await page.locator('[data-lab-v4-execution-console]').evaluate(console => ({
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    controlsInside: [...console.querySelectorAll<HTMLElement>('button')].every(button => {
      const parent = console.getBoundingClientRect(); const box = button.getBoundingClientRect();
      return box.left >= parent.left - 1 && box.right <= parent.right + 1;
    })
  }));
  expect(mobile.overflow).toBe(false);
  expect(mobile.controlsInside).toBe(true);
  await page.locator('[data-lab-v4-execution-console]').screenshot({ path: `${artifactDir}/final-screenshots/transformer-attention__ready__390x844.png` });
  writeFileSync(`${artifactDir}/execution-console-validation.json`, JSON.stringify({ result: 'PASS', records, mobile }, null, 2));
});
