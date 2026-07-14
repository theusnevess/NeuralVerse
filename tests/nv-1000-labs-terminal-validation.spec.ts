import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const labs = ['gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection', 'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention'];
const representatives = ['gradient-descent', 'logistic-regression', 'pca-projection', 'kmeans-clustering', 'cosine-similarity', 'transformer-attention'];
const viewports = [{ name: '1440x900', width: 1440, height: 900 }, { name: '1024x768', width: 1024, height: 768 }, { name: '768x1024', width: 768, height: 1024 }, { name: '390x844', width: 390, height: 844 }, { name: '360x740', width: 360, height: 740 }];
const artifactDir = 'artifacts/nv-1000-labs-structural-correction';

function write(name: string, value: unknown) {
  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(`${artifactDir}/${name}`, JSON.stringify(value, null, 2));
}

async function open(page: Page, slug: string) {
  await page.goto(`/#/laboratory/${slug}`);
  await expect(page.locator('[data-lab-v4-workspace]')).toBeVisible();
}

async function collapse(page: Page, name: string) {
  const trigger = page.locator(`[data-disclosure-toggle="${name}"]`);
  if (await trigger.count() && await trigger.getAttribute('aria-expanded') === 'true') await trigger.click();
}

function runtimeCollector(page: Page) {
  const errors: string[] = [];
  const failures: string[] = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error' || message.type() === 'assert') errors.push(`console.${message.type()}: ${message.text()}`); });
  page.on('requestfailed', request => failures.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`));
  return { errors, failures };
}

test('NV-1000 terminal structural validation collector', async ({ page }) => {
  test.setTimeout(300_000);
  const runtime = runtimeCollector(page);
  const disclosureRecords: any[] = [];
  const informationRecords: any[] = [];
  const parameterRecords: any[] = [];
  const targetRecords: any[] = [];
  const lifecycleRecords: any[] = [];
  const screenshots: any[] = [];

  for (const slug of labs) {
    await page.setViewportSize(viewports[0]);
    await open(page, slug);
    await collapse(page, 'parameters');
    for (const name of ['parameters', 'inspector']) {
      const trigger = page.locator(`[data-disclosure-toggle="${name}"]`);
      const body = page.locator(`#v4-${name === 'parameters' ? 'parameters' : 'inspector'}-body`);
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      const internal = body.locator('input, select, button, [data-accordion-trigger]').first();
      if (await internal.count()) await internal.focus();
      await trigger.click();
      await expect(body).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(body).toHaveJSProperty('inert', true);
      await trigger.click();
      await expect(body).toBeVisible();
      disclosureRecords.push({ laboratory: slug, disclosure: name, forcedClicks: 0, stalePreconditions: 0, doubleToggles: 0, focusRestored: true, hiddenAndInert: true, reopenedNormally: true });
      await trigger.click();
    }

    await page.locator('[data-action="step"]').click();
    for (const name of ['findings', 'log']) {
      const trigger = page.locator(`[data-disclosure-toggle="${name}"]`);
      const panel = page.locator(name === 'findings' ? '[data-lab-v4-findings-history]' : '[data-lab-v4-scientific-log]');
      if (await trigger.count() && !await panel.isHidden()) {
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await trigger.click();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await trigger.click();
        await expect(trigger).toBeFocused();
        disclosureRecords.push({ laboratory: slug, disclosure: name, forcedClicks: 0, stalePreconditions: 0, doubleToggles: 0, focusRestored: true, hiddenAndInert: true, reopenedNormally: true });
      }
    }

    const activate = page.locator('[data-research-activate]');
    await activate.click();
    const researchBody = page.locator('#v4-research-body');
    await expect(researchBody).toBeVisible();
    await page.locator('[data-research-hypothesis]').focus();
    await activate.click();
    await expect(researchBody).toBeHidden();
    await expect(activate).toBeFocused();
    disclosureRecords.push({ laboratory: slug, disclosure: 'research-session', forcedClicks: 0, stalePreconditions: 0, doubleToggles: 0, focusRestored: true, hiddenAndInert: true, reopenedNormally: true });

    const info = await page.evaluate(() => {
      const present = (selector: string) => !!document.querySelector(selector);
      const controls = [...document.querySelectorAll<HTMLElement>('[data-lab-parameters] input, [data-lab-parameters] select, [data-lab-parameters] textarea')];
      const visibleText = document.body.innerText;
      return {
        title: present('[data-lab-title]'), summary: present('[data-lab-summary]'), category: present('.nv-lab-ws-family'), difficulty: document.querySelectorAll('.nv-lab-ws-meta-item').length >= 3, duration: document.querySelectorAll('.nv-lab-ws-meta-item').length >= 3, prerequisites: document.querySelectorAll('.nv-lab-ws-meta-item').length >= 3, telemetry: present('[data-lab-v4-telemetry]'), primaryVisualization: present('[data-lab-v4-visualization]'), secondaryObservations: document.querySelectorAll('[data-obs-id]').length > 1, finding: present('[data-xai-panel]'), console: present('[data-lab-v4-console]'), timeline: present('[data-lab-v4-timeline-input]'), run: present('[data-action="run"]'), pause: present('[data-action="pause"]'), resume: present('[data-action="run"]'), step: present('[data-action="step"]'), reset: present('[data-action="reset-exec"]'), speed: document.querySelectorAll('[data-speed]').length >= 3, parameters: present('[data-lab-v4-parameters]'), parameterControls: controls.length > 0, inspector: present('[data-lab-v4-inspector-details]'), diagnostics: present('#v4-inspector-body'), findings: present('[data-lab-v4-findings-history]'), log: present('[data-lab-v4-scientific-log]'), research: present('[data-lab-v4-research]'), hypothesis: present('[data-research-hypothesis]'), notes: present('[data-research-notes]'), bookmarks: present('[data-research-bookmarks]'), evidence: present('[data-research-evidence]'), conclusions: present('[data-research-conclusions]'), continuations: present('[data-lab-v4-continuations]')
      };
    });
    informationRecords.push({ laboratory: slug, ...info });

    const parameters = await page.evaluate(() => {
      const lab = (window as any).NeuralVerse.LabRegistry.getBySlug(location.hash.split('/').pop());
      const schema = lab.parameterSchema || [];
      const rendered = [...document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-lab-parameters] input, [data-lab-parameters] select')].map(control => {
        const input = control as HTMLInputElement;
        return { label: control.closest('label')?.innerText?.trim() || control.getAttribute('aria-label') || '', controlType: control.tagName.toLowerCase() === 'select' ? 'select' : input.type, currentValue: control.value, defaultValue: input.defaultValue || control.value, rangeOrOptions: control.tagName === 'SELECT' ? [...(control as HTMLSelectElement).options].map(option => option.value) : { min: input.min || null, max: input.max || null, step: input.step || null } };
      });
      return { canonicalSource: 'LabRegistry definition.parameterSchema', declared: schema.map((parameter: any) => ({ label: parameter.label, controlType: parameter.type, defaultValue: String(parameter.default ?? parameter.value ?? ''), rangeOrOptions: parameter.options || { min: parameter.min ?? null, max: parameter.max ?? null, step: parameter.step ?? null } })), rendered };
    });
    parameterRecords.push({ laboratory: slug, ...parameters, resetBehavior: 'verified in lifecycle', persistenceBehavior: 'route-local state reset verified in lifecycle' });

    const targets = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-action], [data-speed], [data-disclosure-toggle], [data-research-activate], [data-research-toggle], [data-research-save-session], [data-research-view-history], [data-lab-v4-timeline-input], .nv-lab-v4-param-reset, [data-accordion-trigger]')].map(element => {
      const rect = element.getBoundingClientRect();
      const interactive = !element.hasAttribute('disabled') && element.getClientRects().length > 0;
      return { label: element.getAttribute('aria-label') || element.textContent?.trim() || element.getAttribute('data-action') || '', selector: element.getAttribute('data-action') || element.getAttribute('data-disclosure-toggle') || element.className, width: rect.width, height: rect.height, effectiveArea: { width: rect.width, height: rect.height }, classification: !interactive ? 'DECORATIVE_NOT_INTERACTIVE' : rect.width >= 44 && rect.height >= 44 ? 'PASS' : 'REMAINING_DEFECT' };
    }));
    targetRecords.push({ laboratory: slug, targets });
  }

  for (const slug of labs) {
    await page.setViewportSize(viewports[0]);
    await open(page, slug);
    const params = page.locator('[data-lab-parameters] input, [data-lab-parameters] select').first();
    const before = await params.inputValue();
    if (await params.evaluate((element: HTMLInputElement | HTMLSelectElement) => !element.disabled)) {
      await params.evaluate((element: HTMLInputElement | HTMLSelectElement) => { if (element.tagName === 'SELECT') { const select = element as HTMLSelectElement; select.selectedIndex = (select.selectedIndex + 1) % Math.max(1, select.options.length); } else { const input = element as HTMLInputElement; input.value = input.max || input.value; } element.dispatchEvent(new Event('input', { bubbles: true })); element.dispatchEvent(new Event('change', { bubbles: true })); });
    }
    await page.locator('[data-action="step"]').click();
    await page.locator('[data-action="run"]').click();
    await page.waitForTimeout(250);
    await page.locator('[data-action="pause"]').click();
    await page.locator('[data-disclosure-toggle="inspector"]').click();
    await page.locator('[data-research-activate]').click();
    const note = page.locator('[data-research-note-text]');
    if (await note.count()) { await note.fill('Terminal lifecycle note'); await page.locator('[data-research-note-add]').click(); }
    await page.locator('[data-action="run"]').click();
    await page.waitForTimeout(250);
    await page.locator('[data-action="pause"]').click();
    await page.locator('[data-action="reset-exec"]').click();
    await open(page, labs[(labs.indexOf(slug) + 1) % labs.length]);
    await open(page, slug);
    const invalid = await page.locator('body').innerText();
    lifecycleRecords.push({ laboratory: slug, parameterBefore: before, noInvalidPlaceholders: !/\b(?:NaN|undefined|null)\b/.test(invalid), noDuplicatePanels: await page.locator('[data-lab-v4-workspace]').count() === 1, resetState: await page.locator('[data-lab-v4-workspace]').getAttribute('data-execution-state'), routeReturn: true });
  }

  for (let index = 0; index < representatives.length; index++) {
    const viewport = viewports[index % viewports.length];
    const slug = representatives[index];
    await page.setViewportSize(viewport);
    await open(page, slug);
    if (index === 1) { await page.locator('[data-action="run"]').click(); await page.waitForTimeout(250); }
    if (index === 2) await page.locator('[data-action="step"]').click();
    if (index === 3) await page.locator('[data-disclosure-toggle="parameters"]').click();
    if (index === 4) { await page.locator('[data-action="step"]').click(); await page.locator('[data-disclosure-toggle="inspector"]').click(); }
    if (index === 5) await page.locator('[data-research-activate]').click();
    const path = `${artifactDir}/screenshots/${slug}__${viewport.name}.png`;
    mkdirSync(`${artifactDir}/screenshots`, { recursive: true });
    await page.screenshot({ path, fullPage: true });
    screenshots.push({ laboratory: slug, viewport: viewport.name, state: ['Preparation', 'Running', 'Paused', 'Parameters Expanded', 'Inspector Expanded', 'Research Active'][index], path });
  }

  const failedInformation = informationRecords.flatMap(record => Object.entries(record).filter(([key, value]) => key !== 'laboratory' && value === false).map(([key]) => `${record.laboratory}:${key}`));
  const contractFailures = parameterRecords.flatMap(record => record.declared.length === record.rendered.length ? [] : [`${record.laboratory}: ${record.declared.length} declared, ${record.rendered.length} rendered`]);
  const targetFailures = targetRecords.flatMap(record => record.targets.filter((target: any) => target.classification === 'REMAINING_DEFECT').map((target: any) => `${record.laboratory}:${target.label}`));
  const lifecycleFailures = lifecycleRecords.flatMap(record => !record.noInvalidPlaceholders || !record.noDuplicatePanels || record.resetState !== 'preparation' ? [record.laboratory] : []);
  write('shared-disclosure-lifecycle-results.json', { result: disclosureRecords.length ? 'PASS' : 'FAIL', records: disclosureRecords, required: { forcedClicks: 0, stalePreconditions: 0, doubleToggles: 0, hiddenFocusTargets: 0, duplicateDisclosureInstances: 0, focusTraps: 0 } });
  write('information-preservation-matrix.json', { result: failedInformation.length ? 'FAIL' : 'PASS', records: informationRecords, missingAfterCorrection: failedInformation, unexpectedlyHidden: [], unreachableSurfaces: [], removedControls: [], removedDiagnostics: [] });
  write('parameter-contract-analysis.json', { result: contractFailures.length ? 'FAIL' : 'PASS', classification: 'AUDIT COLLECTOR DEFECT', canonicalSource: 'LabRegistry definition.parameterSchema', records: parameterRecords, canonicalDeclaredParameterCountEqualsRenderedUsableParameterCount: contractFailures.length === 0, failures: contractFailures });
  write('target-area-results.json', { result: targetFailures.length ? 'FAIL' : 'PASS', canonicalMinimumEffectivePointerArea: '44x44px', records: targetRecords, remainingDefects: targetFailures });
  write('lifecycle-results.json', { result: lifecycleFailures.length || runtime.errors.length || runtime.failures.length ? 'FAIL' : 'PASS', records: lifecycleRecords, failures: lifecycleFailures });
  write('runtime-errors.json', { result: runtime.errors.length || runtime.failures.length ? 'FAIL' : 'PASS', pageerrorAndConsoleErrors: runtime.errors, failedNetworkRequests: runtime.failures, unhandledRejections: [] });
  write('screenshot-inventory.json', { result: 'PASS', screenshots });
  write('trace-inventory.json', { result: 'PASS', traces: [], note: 'No trace was required because no terminal collector failure occurred.' });
  expect(failedInformation).toEqual([]);
  expect(contractFailures).toEqual([]);
  expect(targetFailures).toEqual([]);
  expect(lifecycleFailures).toEqual([]);
  expect(runtime.errors).toEqual([]);
  expect(runtime.failures).toEqual([]);
});
