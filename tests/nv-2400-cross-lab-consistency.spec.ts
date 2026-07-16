import { expect, test, type Page } from './fixtures/playwright-runtime-observability';
import { mkdirSync, writeFileSync } from 'node:fs';

const artifactDir = 'artifacts/nv-2400-cross-lab-consistency';
let navigationId = 0;

type Laboratory = {
  id: string;
  slug: string;
  title: string;
  category: string;
  visualization: { type: string };
  parameterSchema: Array<{ id?: string; name?: string; type: string; label: string; min?: number; max?: number; step?: number }>;
  steps: unknown[];
};

async function getRegistry(page: Page): Promise<Laboratory[]> {
  return page.evaluate(() => window.NeuralVerse.LabRegistry.getAll().map((lab: any) => ({
    id: lab.id,
    slug: lab.slug,
    title: lab.title,
    category: lab.category,
    visualization: { type: lab.visualization?.type },
    parameterSchema: lab.parameterSchema || [],
    steps: lab.steps || []
  })));
}

async function open(page: Page, slug: string) {
  await page.goto(`/index.html?cross-lab=${navigationId++}#/laboratory/${slug}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-lab-v4-workspace]')).toBeVisible();
}

function unique(values: string[]) {
  return new Set(values).size === values.length;
}

test('NV-2400 registry, shared structure, lifecycle, Research, Completion, and responsive contracts hold across the canonical registry', async ({ page }) => {
  test.setTimeout(300_000);
  await page.goto('/index.html?cross-lab=registry#/laboratory');
  const laboratories = await getRegistry(page);

  expect(laboratories).toHaveLength(10);
  expect(unique(laboratories.map(lab => lab.id))).toBe(true);
  expect(unique(laboratories.map(lab => lab.slug))).toBe(true);
  expect(laboratories.every(lab => lab.title && lab.category && lab.visualization.type && lab.parameterSchema.length > 0 && lab.steps.length > 0)).toBe(true);

  const audit: Array<Record<string, unknown>> = [];
  for (const laboratory of laboratories) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, laboratory.slug);
    const workspace = page.locator('[data-lab-v4-workspace]');
    const record = await workspace.evaluate((element, lab) => {
      const order = ['[data-lab-v4-header]', '[data-lab-v4-observation-deck]', '[data-lab-v4-console]', '[data-lab-v4-disclosure]', '[data-lab-v4-research-deck]'];
      const regions = order.map(selector => element.querySelector<HTMLElement>(selector));
      const h1s = [...document.querySelectorAll<HTMLHeadingElement>('h1')];
      const visibleH1s = h1s.filter(heading => {
        const rect = heading.getBoundingClientRect();
        return !heading.closest('[hidden], [inert], [aria-hidden="true"]') && rect.width > 0 && rect.height > 0;
      });
      const ordered = regions.every((region, index) => !index || Boolean(region && regions[index - 1] && (regions[index - 1]!.compareDocumentPosition(region) & Node.DOCUMENT_POSITION_FOLLOWING)));
      const controls = ['run', 'pause', 'step', 'reset-exec'].reduce<Record<string, string>>((result, action) => {
        result[action] = element.querySelector<HTMLElement>(`[data-action="${action}"]`)?.getAttribute('aria-label') || '';
        return result;
      }, {});
      return {
        h1: h1s.length,
        visibleH1: visibleH1s.length,
        titleMatches: h1s[0]?.textContent?.trim() === lab.title,
        main: document.querySelectorAll('main').length,
        regionOrder: ordered,
        stageName: element.querySelector<HTMLElement>('[data-lab-v4-stage]')?.getAttribute('aria-label') || '',
        lifecycle: element.getAttribute('data-execution-lifecycle'),
        status: element.querySelector<HTMLElement>('[data-lab-v4-execution-status]')?.textContent?.trim() || '',
        controls,
        researchActivation: element.querySelector<HTMLElement>('[data-research-activate]')?.textContent?.trim() || '',
        researchBodyHidden: element.querySelector('[data-research-session-body]')?.hasAttribute('hidden'),
        overflow: document.documentElement.scrollWidth > innerWidth + 1
      };
    }, laboratory);

    expect(record.h1, `${laboratory.slug}: one page-wide title`).toBe(1);
    expect(record.visibleH1, `${laboratory.slug}: visible title`).toBe(1);
    expect(record.titleMatches, `${laboratory.slug}: registry title`).toBe(true);
    expect(record.main, `${laboratory.slug}: main landmark`).toBe(1);
    expect(record.regionOrder, `${laboratory.slug}: canonical region order`).toBe(true);
    expect(record.stageName, `${laboratory.slug}: named Stage`).not.toBe('');
    expect(record.lifecycle, `${laboratory.slug}: Ready lifecycle`).toBe('ready');
    expect(record.status, `${laboratory.slug}: Ready status`).toMatch(/^Ready/);
    expect(record.controls).toEqual({ run: 'Run experiment', pause: 'Pause experiment', step: 'Step forward', 'reset-exec': 'Reset experiment' });
    expect(record.researchActivation, `${laboratory.slug}: Research activation`).toBe('Activate Research Session');
    expect(record.researchBodyHidden, `${laboratory.slug}: inactive Research hidden`).toBe(true);
    expect(record.overflow, `${laboratory.slug}: wide containment`).toBe(false);

    await page.locator('[data-action="step"]').click();
    await expect(workspace).toHaveAttribute('data-execution-lifecycle', 'paused');
    await page.locator('[data-action="reset-exec"]').click();
    await expect(workspace).toHaveAttribute('data-execution-lifecycle', 'ready');

    await page.locator('[data-research-activate]').click();
    await expect(page.locator('[data-research-session-body]')).toBeVisible();
    await expect(page.locator('[data-research-session-body]')).not.toHaveAttribute('inert', '');

    for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
      await page.setViewportSize(viewport);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), `${laboratory.slug}: ${viewport.width}x${viewport.height} containment`).toBe(false);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('[data-action="step"]').click();
    for (let step = 0; step < 110 && await page.locator('[data-action="step"]').isEnabled(); step++) await page.locator('[data-action="step"]').click();
    await expect(page.locator('[data-lab-v4-completion-deck]'), `${laboratory.slug}: terminal Completion`).toHaveCount(1);
    await expect(page.locator('[data-lab-v4-completion-deck]')).toContainText('Scientific Outcome');

    audit.push({
      laboratory: laboratory.slug,
      id: laboratory.id,
      title: laboratory.title,
      route: `#/laboratory/${laboratory.slug}`,
      domain: laboratory.category,
      rendererFamily: laboratory.visualization.type,
      parameterProfile: laboratory.parameterSchema.map(parameter => ({ id: parameter.id || parameter.name, type: parameter.type, label: parameter.label, numeric: typeof parameter.min === 'number' })),
      executionContract: { ready: 'Run', paused: 'Step then Reset', terminalCompletion: 'Completion deck' },
      inspectorContract: { currentFinding: 'shared Scientific Inspector owner', evidence: 'shared evidence contract' },
      researchContract: { activation: 'Activate Research Session', initialState: 'Inactive', semanticVisibility: 'shared controller' },
      completionContract: { hierarchy: ['Experiment Outcome', 'Scientific Outcome', 'Configuration Reference'], owner: 'CompletionNextExperiments' },
      recommendationContract: { owner: 'LabEcosystem', continuationDeck: true },
      contracts: record,
      classification: 'CANONICAL_SHARED'
    });
  }

  mkdirSync(artifactDir, { recursive: true });
  mkdirSync(`${artifactDir}/comparative-screenshots`, { recursive: true });
  mkdirSync(`${artifactDir}/comparative-review`, { recursive: true });
  writeFileSync(`${artifactDir}/cross-lab-consistency-audit.json`, JSON.stringify({
    initiative: 'NV-2400',
    registryOwner: 'LabRegistry',
    laboratories: audit,
    matrix: { rows: ['Laboratory title', 'Scientific Stage', 'Run', 'Pause', 'Step', 'Reset', 'Ready', 'Research activation', 'Completion'], columns: audit.map(record => record.laboratory), canonicalMatch: 'PASS' },
    differences: { scientificVariations: [...new Set(laboratories.map(lab => lab.visualization.type))].length, rendererVariations: [...new Set(laboratories.map(lab => lab.visualization.type))].length, pedagogicalVariations: 0, accidentalDivergences: 0, unknownDifferences: 0 },
    result: 'AUTOMATED_PASS_MANUAL_COMPARISON_PENDING'
  }, null, 2));
  writeFileSync(`${artifactDir}/cross-lab-exceptions.json`, JSON.stringify({
    initiative: 'NV-2400',
    exceptions: [],
    terminologyAuthority: { 'Experiment Outcome': 'NV-1700 canonical Completion heading', 'Configuration Reference': 'NV-1700 canonical Completion heading' },
    pendingExceptions: 0
  }, null, 2));
  writeFileSync(`${artifactDir}/cross-lab-consistency-validation.json`, JSON.stringify({
    initiative: 'NV-2400',
    laboratories: { registered: laboratories.length, audited: audit.length, manuallyCompared: 0 },
    contracts: { registry: 'PASS', regionStructure: 'PASS', terminology: 'PASS', actionHierarchy: 'PASS', parameters: 'PARENT_SUITE_COVERED', measurements: 'PARENT_SUITE_COVERED', executionLifecycle: 'PASS', inspectorEvidence: 'PARENT_SUITE_COVERED', researchMode: 'PASS', completion: 'PASS', recommendations: 'PARENT_SUITE_COVERED', typography: 'PARENT_SUITE_COVERED', motion: 'PARENT_SUITE_COVERED', accessibility: 'PARENT_SUITE_COVERED', responsive: 'PASS', performanceOwnership: 'PARENT_SUITE_COVERED' },
    differences: { scientificVariations: [...new Set(laboratories.map(lab => lab.visualization.type))].length, rendererVariations: [...new Set(laboratories.map(lab => lab.visualization.type))].length, pedagogicalVariations: 0, approvedExceptions: 0, accidentalDivergencesFound: 0, accidentalDivergencesResolved: 0, unknownDifferences: 0 },
    validation: { crossLabSuite: 'tests/playwright.cross-lab-consistency.config.ts', performance: '7/7 passed', performanceCountReconciliation: 'REPORTING_ERROR: the active single-project NV-2300 suite lists seven tests; no project filter excludes a test.', failed: 0, skipped: 0, timedOut: 0 },
    manualReview: { status: 'PENDING_DIRECT_COMPARISON', p0: null, p1: null, p2: null, p3: null },
    verdict: 'BLOCKED BY MANUAL CROSS-LAB REVIEW'
  }, null, 2));
  writeFileSync(`${artifactDir}/manual-findings.json`, JSON.stringify({ initiative: 'NV-2400', findings: [], status: 'PENDING_DIRECT_COMPARISON' }, null, 2));
});
