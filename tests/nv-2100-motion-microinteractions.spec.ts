import { expect, test } from './fixtures/playwright-runtime-observability';

const laboratories = ['gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection', 'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention'];

async function open(page: any, laboratory: string) {
  await page.goto(`/index.html#/laboratory/${laboratory}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-lab-v4-workspace]')).toBeVisible();
}

test('all laboratories resolve canonical motion tokens and retain direct reduced-motion state', async ({ page }) => {
  for (const laboratory of laboratories) {
    await open(page, laboratory);
    const tokens = await page.locator('[data-lab-v4-workspace]').evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return ['--nv-motion-duration-fast', '--nv-motion-duration-standard', '--nv-motion-ease-enter'].map(name => style.getPropertyValue(name).trim());
    });
    expect(tokens.every(Boolean), laboratory).toBe(true);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'gradient-descent');
  const reduced = await page.locator('[data-lab-v4-workspace]').evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--nv-motion-duration-standard').trim());
  expect(reduced).toBe('0ms');
});

test('Step advances one canonical state and Reset clears visual feedback', async ({ page }) => {
  await open(page, 'gradient-descent');
  const workspace = page.locator('[data-lab-v4-workspace]');
  const step = page.locator('[data-action="step"]');
  const reset = page.locator('[data-action="reset-exec"]');

  await step.click();
  await expect(workspace).toHaveAttribute('data-execution-lifecycle', 'paused');
  await expect(page.locator('[data-lab-v4-timeline-input]')).toHaveAttribute('aria-valuenow', '0');

  await page.locator('[data-inspector-key]').first().evaluate(element => element.classList.add('nv-lab-inspector-row--changed'));
  await reset.click();
  await expect(workspace).toHaveAttribute('data-execution-lifecycle', 'ready');
  await page.waitForTimeout(700);
  await expect(page.locator('.nv-lab-inspector-row--changed')).toHaveCount(0);
  await expect(page.locator('[data-lab-v4-completion-deck]')).toHaveCount(0);
});

test('Research activation synchronizes lifecycle, semantic visibility, and disclosure state', async ({ page }) => {
  await open(page, 'gradient-descent');
  const workspace = page.locator('[data-lab-v4-workspace]');
  const activate = page.locator('[data-research-activate]');
  const body = page.locator('[data-research-session-body]');

  await activate.click();
  await expect(workspace).toHaveAttribute('data-research-state', 'active');
  await expect(activate).toHaveAttribute('aria-expanded', 'true');
  await expect(body).not.toHaveAttribute('hidden', '');
  await expect(body).not.toHaveAttribute('inert', '');
  await expect(body).not.toHaveAttribute('aria-hidden', 'true');
  await expect(body.locator('[data-research-question]')).toBeVisible();

  await activate.click();
  await activate.click();
  await expect(workspace).toHaveAttribute('data-research-state', 'active');
  await expect(body).not.toHaveAttribute('hidden', '');
  await expect(body.locator('[data-research-question]')).toBeVisible();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await activate.click();
  await activate.click();
  await expect(activate).toHaveAttribute('aria-expanded', 'true');
  await expect(body).not.toHaveAttribute('hidden', '');
  await expect(body).not.toHaveAttribute('inert', '');
  expect(await body.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(0);
});
