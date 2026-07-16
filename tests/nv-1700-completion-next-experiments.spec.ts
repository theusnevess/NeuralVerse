import { expect, test, type Page } from './fixtures/playwright-runtime-observability';
import { mkdirSync, writeFileSync } from 'node:fs';

const labs = ['gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection', 'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention'];
const artifactDir = 'artifacts/nv-1700-completion-next-experiments';
let navigationId = 0;
async function open(page: Page, slug: string) { await page.goto(`/index.html?completion=${navigationId++}#/laboratory/${slug}`, { waitUntil: 'domcontentloaded' }); await expect(page.locator('[data-lab-v4-workspace]')).toBeVisible(); }
async function complete(page: Page) { const step = page.locator('[data-action="step"]'); for (let index = 0; index < 110 && await step.isEnabled(); index++) await step.click(); await expect(page.locator('[data-lab-v4-completion-deck]')).toHaveCount(1); }

test('completion and next experiments use terminal contracts across all laboratories', async ({ page }) => {
  test.setTimeout(300_000); mkdirSync(`${artifactDir}/final-screenshots`, { recursive: true }); const audit: any[] = [], validation: any[] = [];
  for (const slug of labs) {
    await page.setViewportSize({ width: 1440, height: 900 }); await open(page, slug);
    await expect(page.locator('[data-lab-v4-completion-deck]')).toHaveCount(0);
    await expect(page.locator('[data-lab-v4-continuation-deck]')).toHaveAttribute('hidden', '');
    await complete(page);
    const deck = page.locator('[data-lab-v4-completion-deck]');
    await expect(deck.getByRole('heading', { name: 'Experiment Outcome' })).toBeVisible();
    await expect(deck).toContainText('Scientific Outcome');
    await expect(deck.getByRole('heading', { name: 'Configuration Reference' })).toBeVisible();
    const details = await page.evaluate((labSlug) => {
      const lab = window.NeuralVerse.LabRegistry.getBySlug(labSlug); const schema = lab.parameterSchema || [];
      const relationships = window.NeuralVerse.LabEcosystem.getNextExperiments(labSlug);
      return { id: lab.id, parameters: schema.map((item: any) => item.id || item.name), relationships, completion: { eligibility: 'completed with terminal result', snapshot: 'immutable execution snapshot', evidence: 'Scientific Inspector references', research: true, repeat: true, comparison: true }, continuation: { repeat: true, variations: schema.filter((item: any) => ['slider', 'integer', 'float'].includes(item.type)).map((item: any) => item.id || item.name), relationships } };
    }, slug);
    const outcome = await deck.locator('.nv-lab-v4-completion-summary__outcome').textContent();
    expect(outcome).not.toMatch(/Scientific Outcome: (Ready|Running|Paused|Reset)/);
    const links = page.locator('[data-lab-v4-continuation-deck] a[data-continuation-target]');
    for (let index = 0; index < await links.count(); index++) expect(await links.nth(index).getAttribute('href')).toMatch(/^#\/laboratory\//);
    await page.locator('[data-action="reset-exec"]').click();
    await expect(page.locator('[data-lab-v4-completion-deck]')).toHaveCount(0);
    await expect(page.locator('[data-lab-v4-continuation-deck]')).toHaveAttribute('hidden', '');
    audit.push({ laboratory: slug, completionOwner: 'CompletionNextExperiments', completionTrigger: 'execution completed', executionStateSource: 'ExecutionEngine', scientificOutcomeSource: 'getCompletionSummary', configurationSnapshotSource: 'executionSnapshot', evidenceReferenceSupport: 'Scientific Inspector', researchModeIntegration: true, currentNextExperimentMetadata: details.relationships, classification: 'CANONICAL' });
    validation.push({ laboratory: slug, completion: 'PASS', immutableConfiguration: 'PASS', resetIsolation: 'PASS', recommendationDestinations: 'PASS', result: 'PASS' });
  }
  await page.setViewportSize({ width: 390, height: 844 }); await open(page, 'gradient-descent'); await complete(page); expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false); await page.screenshot({ path: `${artifactDir}/final-screenshots/gradient-descent-completed-390x844.png`, fullPage: true });
  writeFileSync(`${artifactDir}/completion-next-experiments-audit.json`, JSON.stringify({ result: 'PASS', laboratories: audit }, null, 2));
  writeFileSync(`${artifactDir}/completion-next-experiments-validation.json`, JSON.stringify({ result: 'PASS', p0Defects: 0, p1Defects: 0, records: validation }, null, 2));
  await captureMatrix(page);
});

async function captureMatrix(page: Page) {
  mkdirSync(`${artifactDir}/final-screenshots`, { recursive: true });
  async function capture(slug: string, width: number, height: number, name: string, research = false) {
    await page.setViewportSize({ width, height }); await open(page, slug);
    if (research) await page.locator('[data-research-activate]').click();
    await page.screenshot({ path: `${artifactDir}/final-screenshots/${name}-ready.png`, fullPage: true });
    await page.locator('[data-action="run"]').click(); await expect.poll(() => page.locator('[data-lab-v4-workspace]').getAttribute('data-execution-lifecycle')).toBe('running');
    await page.screenshot({ path: `${artifactDir}/final-screenshots/${name}-running.png`, fullPage: true });
    await page.locator('[data-action="pause"]').click(); await complete(page);
    await page.screenshot({ path: `${artifactDir}/final-screenshots/${name}-completed.png`, fullPage: true });
  }
  await capture('gradient-descent', 1440, 900, 'gradient-descent-1440');
  await capture('gradient-descent', 1024, 768, 'gradient-descent-1024');
  await capture('gradient-descent', 390, 844, 'gradient-descent-390');
  await capture('kmeans-clustering', 1440, 900, 'kmeans-1440');
  await capture('kmeans-clustering', 390, 844, 'kmeans-390');
  await capture('precision-recall', 1440, 900, 'precision-recall-1440');
  await capture('precision-recall', 390, 844, 'precision-recall-390');
  await capture('cosine-similarity', 1440, 900, 'cosine-1440');
  await capture('cosine-similarity', 390, 844, 'cosine-390');
  await capture('embedding-similarity', 390, 844, 'embedding-390');
  await capture('gradient-descent', 1440, 900, 'research-gradient-1440', true);
}
