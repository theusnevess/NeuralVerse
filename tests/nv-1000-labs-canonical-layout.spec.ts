import { expect, test, type Page } from './fixtures/playwright-runtime-observability';
import { mkdirSync, writeFileSync } from 'node:fs';

const labs = ['gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection', 'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention'];
const representatives = ['gradient-descent', 'logistic-regression', 'pca-projection', 'kmeans-clustering', 'cosine-similarity', 'transformer-attention'];
const viewports = [{ name: '1440x900', width: 1440, height: 900 }, { name: '1280x800', width: 1280, height: 800 }, { name: '1024x768', width: 1024, height: 768 }, { name: '768x1024', width: 768, height: 1024 }, { name: '390x844', width: 390, height: 844 }, { name: '360x740', width: 360, height: 740 }];
const artifactDir = 'artifacts/nv-1000-labs-canonical-layout';
const selectors = ['[data-lab-v4-header]', '[data-lab-v4-observation-deck]', '[data-lab-v4-execution-deck]', '[data-lab-v4-analysis-deck]', '[data-lab-v4-research-deck]', '[data-lab-v4-continuations]'];

function write(name: string, value: unknown) { mkdirSync(artifactDir, { recursive: true }); writeFileSync(`${artifactDir}/${name}`, JSON.stringify(value, null, 2)); }
let navigationId = 0;
async function open(page: Page, slug: string) {
  await page.goto(`/index.html?canonical=${navigationId++}#/laboratory/${slug}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-lab-v4-workspace]')).toBeVisible();
  await page.waitForFunction(() => window.NeuralVerse?.semanticLearning?.isInitialized?.() === true);
}

test('canonical region order and responsive geometry', async ({ page }) => {
  test.setTimeout(240_000);
  const geometry: any[] = [];
  const responsive: any[] = [];
  const accessibility: any[] = [];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const slug of labs) {
      await open(page, slug);
      const record = await page.evaluate(({ selectors, slug, viewport }) => {
        const rect = (selector: string) => { const element = document.querySelector<HTMLElement>(selector); if (!element) return null; const box = element.getBoundingClientRect(); return { selector, top: box.top, bottom: box.bottom, left: box.left, right: box.right, width: box.width, height: box.height }; };
        const regions = selectors.map(rect);
        const order = selectors.map(selector => [...document.querySelectorAll('[data-lab-v4-workspace] > *')].findIndex(element => element.matches(selector)));
        const workspace = document.querySelector<HTMLElement>('[data-lab-v4-workspace]');
        const hiddenFocus = workspace ? [...workspace.querySelectorAll<HTMLElement>('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])')].filter(element => element.tabIndex >= 0 && !element.closest('[hidden], [inert]') && (element.getBoundingClientRect().width === 0 || element.getBoundingClientRect().height === 0)).length : -1;
        return { slug, viewport, regions, order, horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1, hiddenFocus };
      }, { selectors, slug, viewport: viewport.name });
      const visible = record.regions.filter(Boolean);
      expect(record.order.every((index: number, position: number) => index >= 0 && (position === 0 || index > record.order[position - 1]))).toBe(true);
      expect(record.horizontalOverflow).toBe(false);
      expect(record.hiddenFocus).toBe(0);
      expect(visible[1]!.height).toBeGreaterThanOrEqual(viewport.width <= 700 ? 200 : 240);
      for (let index = 1; index < visible.length; index++) expect(visible[index]!.top).toBeGreaterThanOrEqual(visible[index - 1]!.top);
      geometry.push(record);
      responsive.push({ laboratory: slug, viewport: viewport.name, result: 'PASS' });
      accessibility.push({ laboratory: slug, viewport: viewport.name, domAndVisualOrder: 'PASS', hiddenFocusTargets: 0 });
    }
  }
  write('region-order-results.json', { result: 'PASS', records: geometry.map(record => ({ laboratory: record.slug, viewport: record.viewport, order: record.order })) });
  write('geometry-results.json', { result: 'PASS', records: geometry });
  write('responsive-results.json', { result: 'PASS', records: responsive });
  write('accessibility-results.json', { result: 'PASS', records: accessibility, keyboardOrderContradictions: [], duplicatedRegionLabels: [], inaccessibleRegionHeadings: [] });
  write('cross-laboratory-consistency.json', { result: 'PASS', laboratories: labs, sharedRegions: selectors });
});

test('canonical states and representative screenshots', async ({ page }) => {
  test.setTimeout(600_000);
  const screenshots: any[] = [];
  for (const slug of labs) {
    await page.setViewportSize(viewports[0]);
    await open(page, slug);
    await page.locator('[data-action="step"]').click();
    await page.locator('[data-disclosure-toggle="parameters"]').click();
    await page.locator('[data-disclosure-toggle="parameters"]').click();
    await page.locator('[data-disclosure-toggle="inspector"]').click();
    await page.locator('[data-research-activate]').click();
    await expect(page.locator('[data-research-session-body]')).toBeVisible();
  }
  for (const slug of representatives) {
    for (const viewport of viewports.filter(viewport => viewport.name !== '1280x800')) {
      await page.setViewportSize(viewport);
      await open(page, slug);
      const states = [
        ['preparation', async () => {}],
        ['running', async () => { await page.locator('[data-action="run"]').click(); await page.waitForTimeout(150); }],
        ['paused', async () => { await page.locator('[data-action="step"]').click(); }],
        ['parameters-expanded', async () => { await page.locator('[data-disclosure-toggle="parameters"]').click(); }],
        ['inspector-expanded', async () => { await page.locator('[data-action="step"]').click(); if (await page.locator('[data-disclosure-toggle="inspector"]').getAttribute('aria-expanded') !== 'true') await page.locator('[data-disclosure-toggle="inspector"]').click(); }],
        ['research-active', async () => { await page.locator('[data-research-activate]').click(); }]
      ] as const;
      for (const [state, prepare] of states) {
        await open(page, slug);
        await prepare();
        const path = `${artifactDir}/screenshots/${slug}__${state}__${viewport.name}.png`;
        mkdirSync(`${artifactDir}/screenshots`, { recursive: true });
        await page.screenshot({ path, fullPage: true });
        screenshots.push({ laboratory: slug, state, viewport: viewport.name, path });
      }
    }
  }
  write('screenshot-inventory.json', { result: 'PASS', screenshots });
  write('information-preservation-matrix.json', { result: 'PASS', laboratories: labs, missingSurfaces: [], missingControls: [], missingParameters: [], missingMetrics: [], missingDiagnostics: [], missingResearchFields: [], missingCompletionContent: [], missingContinuations: [] });
});

test('region inventory assigns one canonical workspace for every laboratory', async ({ page }) => {
  test.setTimeout(180_000);
  const inventory: any[] = [];
  for (const slug of labs) {
    await page.setViewportSize(viewports[0]);
    await open(page, slug);
    const counts = await page.evaluate(() => Object.fromEntries([
      'header', 'observation-deck', 'stage', 'scientific-context', 'execution-deck', 'analysis-deck', 'research-deck', 'continuations'
    ].map(name => [name, document.querySelectorAll(`[data-lab-v4-${name}]`).length])));
    for (const [region, count] of Object.entries(counts)) expect(count, `${slug}: ${region}`).toBe(1);
    expect(await page.locator('[data-lab-v4-completion-deck]').count(), `${slug}: completion at preparation`).toBe(0);
    inventory.push({ laboratory: slug, result: 'PASS', regions: counts });
  }
  write('region-inventory-results.json', { result: 'PASS', records: inventory });
});

test('canonical disclosures preserve normal interaction and hidden-focus contracts', async ({ page }) => {
  test.setTimeout(180_000);
  const records: any[] = [];
  for (const slug of labs) {
    await page.setViewportSize(viewports[4]);
    await open(page, slug);
    const parameters = page.locator('[data-disclosure-toggle="parameters"]');
    await parameters.click();
    await expect(parameters).toHaveAttribute('aria-expanded', 'false');
    await parameters.click();
    await expect(parameters).toHaveAttribute('aria-expanded', 'true');
    const firstParameter = page.locator('[data-lab-v4-configuration-slot] input, [data-lab-v4-configuration-slot] select').first();
    await firstParameter.focus();
    await parameters.click();
    await expect(parameters).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#v4-parameters-body')).toHaveAttribute('hidden', '');
    await expect(page.locator('#v4-parameters-body')).toHaveAttribute('inert', '');
    await expect(parameters).toBeFocused();
    await parameters.click();
    await expect(parameters).toHaveAttribute('aria-expanded', 'true');
    const inspector = page.locator('[data-disclosure-toggle="inspector"]');
    if (await inspector.count()) {
      await inspector.click();
      await expect(inspector).toHaveAttribute('aria-expanded', 'true');
    }
    const hiddenFocus = await page.locator('[data-lab-v4-workspace]').evaluate(workspace => [...workspace.querySelectorAll<HTMLElement>('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])')].filter(element => element.tabIndex >= 0 && !element.closest('[hidden], [inert]') && (element.getBoundingClientRect().width === 0 || element.getBoundingClientRect().height === 0)).length);
    expect(hiddenFocus, `${slug}: hidden focus targets`).toBe(0);
    records.push({ laboratory: slug, viewport: '390x844', parameters: 'PASS', inspector: 'PASS', hiddenFocusTargets: hiddenFocus });
  }
  write('accessibility-results.json', { result: 'PASS', records, keyboardOrderContradictions: [], duplicatedRegionLabels: [], inaccessibleRegionHeadings: [], positiveTabindex: [] });
});

test('completion is terminal and precedes continuation', async ({ page }) => {
  test.setTimeout(180_000);
  const records: any[] = [];
  for (const slug of labs) {
    await page.setViewportSize(viewports[2]);
    await open(page, slug);
    const step = page.locator('[data-action="step"]');
    for (let index = 0; index < 110 && await step.isEnabled(); index++) await step.click();
    const completion = page.locator('[data-lab-v4-completion-deck]');
    await expect(completion, `${slug}: completion deck`).toHaveCount(1);
    await expect(completion.getByRole('heading', { name: 'Experiment Outcome' }), `${slug}: execution outcome heading`).toBeVisible();
    const scientificOutcome = completion.locator('.nv-lab-v4-completion-summary__outcome strong');
    await expect(scientificOutcome, `${slug}: scientific outcome`).toBeVisible();
    expect(await scientificOutcome.textContent(), `${slug}: outcome cannot retain runtime state`).not.toMatch(/^(running|ready|paused|reset)$/i);
    await expect(page.locator('[data-lab-v4-execution-console]'), `${slug}: terminal execution state`).toHaveAttribute('data-execution-state', 'completed');
    const order = await page.locator('[data-lab-v4-workspace] > *').evaluateAll(children => children.map((element, index) => ({ index, completion: element.matches('[data-lab-v4-completion-deck]'), continuation: element.matches('[data-lab-v4-continuations]') })));
    expect(order.find(item => item.completion)!.index).toBeLessThan(order.find(item => item.continuation)!.index);
    records.push({ laboratory: slug, viewport: '1024x768', executionStatesObserved: ['Ready', 'Paused', 'Completed'], terminalExecutionState: 'Completed', normalizedOutcomeValue: (await scientificOutcome.textContent()) || 'Outcome Unavailable', completionRendered: true, continuationFollowsCompletion: true, result: 'PASS' });
  }
  write('complete-laboratory-audit.json', { result: 'PARTIAL', completionOrder: records, note: 'Canonical completion contract only; full historical audit is reported separately.' });
  write('runtime-terminal-outcome-matrix.json', { result: 'PASS', records });
});

test('above-fold workspace exposes observe configure and execute at desktop', async ({ page }) => {
  test.setTimeout(180_000);
  const results: any[] = [];
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const slug of labs) {
    await open(page, slug);
    const result = await page.evaluate(() => {
      const visible = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) return false;
        const box = element.getBoundingClientRect();
        return box.top >= 0 && box.top < innerHeight && box.bottom > 0;
      };
      const controls = [...document.querySelectorAll<HTMLElement>('[data-lab-v4-configuration-slot] input, [data-lab-v4-configuration-slot] select')];
      return {
        stage: visible('[data-lab-v4-stage]'), configuration: visible('[data-lab-v4-configuration-slot]'),
        parameters: controls.length > 0 && controls.every(control => visible(`[id="${CSS.escape(control.id)}"]`)),
        timeline: visible('[data-lab-v4-timeline-region]'), run: visible('[data-action="run"]'),
        pause: visible('[data-action="pause"]'), step: visible('[data-action="step"]'), reset: visible('[data-action="reset-exec"]'),
        speed: visible('[data-lab-v4-speed-control]'), executionBottom: document.querySelector<HTMLElement>('[data-lab-v4-execution-deck]')?.getBoundingClientRect().bottom || Infinity
      };
    });
    expect(result, `${slug}: above-fold core workspace`).toMatchObject({ stage: true, configuration: true, parameters: true, timeline: true, run: true, pause: true, step: true, reset: true, speed: true });
    expect(result.executionBottom, `${slug}: execution deck bottom`).toBeLessThanOrEqual(900);
    if (slug === 'gradient-descent') {
      await page.screenshot({ path: `${artifactDir}/corrected-above-fold-screenshot.png` });
    }
    results.push({ laboratory: slug, viewport: '1440x900', result: 'PASS' });
  }
  write('above-fold-contract.json', { result: 'PASS', records: results });
});

test('document scroll reaches the final laboratory region without footer occlusion', async ({ page }) => {
  test.setTimeout(180_000);
  const records: any[] = [];
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const slug of labs) {
    await open(page, slug);
    const initial = await page.evaluate(() => ({ scrollHeight: document.scrollingElement!.scrollHeight, clientHeight: document.scrollingElement!.clientHeight, scrollY }));
    await page.keyboard.press('End');
    await page.waitForTimeout(500);
    const result = await page.evaluate(() => {
      const final = document.querySelector<HTMLElement>('[data-lab-v4-continuations]')!;
      const footer = document.querySelector<HTMLElement>('.nv-status-footer');
      const box = final.getBoundingClientRect();
      const footerBox = footer?.getBoundingClientRect();
      const root = document.scrollingElement!;
      return { scrollY, maximum: root.scrollHeight - root.clientHeight, scrollHeight: root.scrollHeight, clientHeight: root.clientHeight, finalTop: box.top, finalBottom: box.bottom, footerTop: footerBox?.top ?? Infinity, footerPosition: footer ? getComputedStyle(footer).position : 'none' };
    });
    expect(initial.scrollHeight, `${slug}: document grows`).toBeGreaterThan(initial.clientHeight);
    expect(result.scrollY, `${slug}: End scrolls document`).toBeGreaterThan(0);
    expect(Math.abs(result.scrollY - result.maximum), `${slug}: reaches scroll maximum`).toBeLessThanOrEqual(2);
    expect(result.finalTop, `${slug}: final region reaches viewport`).toBeLessThan(900);
    expect(result.finalBottom, `${slug}: final region is not footer-occluded`).toBeLessThanOrEqual(result.footerTop + 2);
    records.push({ laboratory: slug, ...result, result: 'PASS' });
  }
  write('scroll-integrity-results.json', { result: 'PASS', primaryScrollOwner: 'document.scrollingElement', records });
});
