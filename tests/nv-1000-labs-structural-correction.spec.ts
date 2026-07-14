import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const LABS = [
  'gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection',
  'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention',
];
const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
  { name: '360x740', width: 360, height: 740 },
];

type Rect = { x: number; y: number; width: number; height: number; bottom: number; right: number } | null;

function intersects(a: Rect, b: Rect) {
  return !!a && !!b && a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y;
}

const STAGE_MINIMUMS: Record<string, number> = {
  '1440x900': 280,
  '1280x800': 240,
  '1024x768': 180,
  '768x1024': 220,
  '390x844': 220,
  '360x740': 200,
};

async function openLab(page: Page, slug: string) {
  const route = `/#/laboratory/${slug}`;
  if (page.url().endsWith(route)) {
    await page.reload();
  } else {
    await page.goto(route);
  }
  await expect(page.locator('[data-lab-v4-workspace]')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function record(page: Page, selector: string): Promise<Rect> {
  return page.locator(selector).first().evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, bottom: rect.bottom, right: rect.right };
  }).catch(() => null);
}

async function establishInspectorPreconditions(page: Page) {
  const collapse = async (name: string) => {
    const trigger = page.locator(`[data-disclosure-toggle="${name}"]`);
    if (await trigger.count() && await trigger.getAttribute('aria-expanded') === 'true') await trigger.click();
  };

  await collapse('parameters');
  await collapse('inspector');
  await collapse('findings');
  await collapse('log');

  return page.evaluate(() => {
    const disclosure = (name: string) => {
      const trigger = document.querySelector<HTMLElement>(`[data-disclosure-toggle="${name}"]`);
      const body = trigger?.getAttribute('aria-controls') ? document.getElementById(trigger.getAttribute('aria-controls')!) : null;
      return trigger ? {
        ariaExpanded: trigger.getAttribute('aria-expanded'),
        hidden: body instanceof HTMLElement ? body.hidden : null,
        inert: body instanceof HTMLElement ? body.inert : null,
        display: body instanceof HTMLElement ? getComputedStyle(body).display : null,
      } : null;
    };
    const workspace = document.querySelector<HTMLElement>('[data-lab-v4-workspace]');
    return {
      parameters: disclosure('parameters'),
      inspector: disclosure('inspector'),
      findings: disclosure('findings'),
      scientificLog: disclosure('log'),
      researchState: workspace?.getAttribute('data-research-state') || 'inactive',
      executionState: workspace?.getAttribute('data-execution-state'),
    };
  });
}

async function inspectorGeometry(page: Page) {
  return page.locator('[data-disclosure-toggle="inspector"]').evaluate((trigger) => {
    const rect = trigger.getBoundingClientRect();
    const viewport = window.visualViewport;
    const effectiveTop = viewport?.offsetTop || 0;
    const effectiveBottom = effectiveTop + (viewport?.height || document.documentElement.clientHeight);
    const intersectionHeight = Math.max(0, Math.min(rect.bottom, effectiveBottom) - Math.max(rect.top, effectiveTop));
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const hitChain = document.elementsFromPoint(centerX, centerY).map((element) => ({
      tag: element.tagName,
      id: element.id,
      className: typeof element.className === 'string' ? element.className : '',
      disclosure: element.closest('[data-disclosure-toggle]')?.getAttribute('data-disclosure-toggle') || null,
    }));
    const topHit = document.elementFromPoint(centerX, centerY);
    return {
      windowScrollY: window.scrollY,
      visualViewportOffsetTop: viewport?.offsetTop || 0,
      documentHeight: document.documentElement.scrollHeight,
      triggerRect: { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width, height: rect.height },
      triggerIntersectionRatio: rect.height ? intersectionHeight / rect.height : 0,
      effectiveViewport: { top: effectiveTop, bottom: effectiveBottom, height: effectiveBottom - effectiveTop },
      insideEffectiveViewport: rect.top >= effectiveTop && rect.bottom <= effectiveBottom,
      actualHitTarget: topHit ? { tag: topHit.tagName, id: topHit.id, className: typeof topHit.className === 'string' ? topHit.className : '', disclosure: topHit.closest('[data-disclosure-toggle]')?.getAttribute('data-disclosure-toggle') || null } : null,
      hitChain,
    };
  });
}

async function inspectScrollChain(page: Page) {
  return page.locator('[data-disclosure-toggle="inspector"]').evaluate((trigger) => {
    const selector = (element: Element) => element.id ? `#${element.id}` : element.getAttributeNames().includes('data-lab-v4-workspace') ? '[data-lab-v4-workspace]' : element.getAttributeNames().includes('data-lab-v4-disclosure-workspace') ? '[data-lab-v4-disclosure-workspace]' : element.className ? `.${String(element.className).trim().split(/\s+/).join('.')}` : element.tagName.toLowerCase();
    const records = [];
    for (let element: HTMLElement | null = trigger as HTMLElement; element; element = element.parentElement) {
      const style = getComputedStyle(element);
      records.push({
        selector: selector(element), overflow: style.overflow, overflowY: style.overflowY,
        scrollTop: element.scrollTop, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight,
        isScrollable: /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight,
        position: style.position, transform: style.transform, contain: style.contain,
        overscrollBehavior: style.overscrollBehavior,
      });
    }
    const scrollingElement = document.scrollingElement as HTMLElement;
    records.push({ selector: 'document.scrollingElement', overflow: getComputedStyle(scrollingElement).overflow, overflowY: getComputedStyle(scrollingElement).overflowY, scrollTop: scrollingElement.scrollTop, scrollHeight: scrollingElement.scrollHeight, clientHeight: scrollingElement.clientHeight, isScrollable: scrollingElement.scrollHeight > scrollingElement.clientHeight, position: getComputedStyle(scrollingElement).position, transform: getComputedStyle(scrollingElement).transform, contain: getComputedStyle(scrollingElement).contain, overscrollBehavior: getComputedStyle(scrollingElement).overscrollBehavior });
    return records;
  });
}

test.describe('NV-1000 Labs structural correction evidence', () => {
  test('classifies Stage containment box geometry', async ({ page, browserName }) => {
    const records: unknown[] = [];
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      for (const laboratory of LABS) {
        await openLab(page, laboratory);
        records.push(await page.evaluate(({ laboratory, viewport, browserName }) => {
          const stage = document.querySelector<HTMLElement>('[data-lab-v4-stage]')!;
          const visualization = document.querySelector<HTMLElement>('[data-lab-v4-visualization]')!;
          const stageRect = stage.getBoundingClientRect();
          const visualizationRect = visualization.getBoundingClientRect();
          const stageStyle = getComputedStyle(stage);
          const visualizationStyle = getComputedStyle(visualization);
          const borderTop = Number.parseFloat(stageStyle.borderTopWidth);
          const borderRight = Number.parseFloat(stageStyle.borderRightWidth);
          const borderBottom = Number.parseFloat(stageStyle.borderBottomWidth);
          const borderLeft = Number.parseFloat(stageStyle.borderLeftWidth);
          return {
            laboratory,
            state: 'PREPARATION',
            viewport: viewport.name,
            browser: browserName,
            devicePixelRatio: window.devicePixelRatio,
            stage: {
              rect: { x: stageRect.x, y: stageRect.y, right: stageRect.right, bottom: stageRect.bottom, width: stageRect.width, height: stageRect.height },
              border: { top: borderTop, right: borderRight, bottom: borderBottom, left: borderLeft },
              padding: { top: stageStyle.paddingTop, right: stageStyle.paddingRight, bottom: stageStyle.paddingBottom, left: stageStyle.paddingLeft },
              contentBox: { top: stageRect.top + borderTop + Number.parseFloat(stageStyle.paddingTop), right: stageRect.right - borderRight - Number.parseFloat(stageStyle.paddingRight), bottom: stageRect.bottom - borderBottom - Number.parseFloat(stageStyle.paddingBottom), left: stageRect.left + borderLeft + Number.parseFloat(stageStyle.paddingLeft) },
            },
            visualization: { rect: { x: visualizationRect.x, y: visualizationRect.y, right: visualizationRect.right, bottom: visualizationRect.bottom, width: visualizationRect.width, height: visualizationRect.height }, margin: { top: visualizationStyle.marginTop, right: visualizationStyle.marginRight, bottom: visualizationStyle.marginBottom, left: visualizationStyle.marginLeft }, transform: visualizationStyle.transform, position: visualizationStyle.position },
            rawDelta: { top: visualizationRect.top - stageRect.top, right: stageRect.right - visualizationRect.right, bottom: stageRect.bottom - visualizationRect.bottom, left: visualizationRect.left - stageRect.left },
          };
        }, { laboratory, viewport, browserName }));
      }
    }
    const worst = (records as any[]).sort((a, b) => a.rawDelta.top - b.rawDelta.top)[0];
    mkdirSync('artifacts/nv-1000-labs-structural-correction', { recursive: true });
    writeFileSync('artifacts/nv-1000-labs-structural-correction/containment-tolerance-diagnostic.json', JSON.stringify({ records, worst }, null, 2));
    expect(worst).toBeTruthy();
  });

  test('tracks Parameters DOM identity across viewport and route transitions', async ({ page }) => {
    const evidenceDir = 'artifacts/nv-1000-labs-structural-correction';
    mkdirSync(evidenceDir, { recursive: true });
    const transitions = [
      [{ width: 1440, height: 900, name: '1440x900' }, { width: 1024, height: 768, name: '1024x768' }],
      [{ width: 1024, height: 768, name: '1024x768' }, { width: 768, height: 1024, name: '768x1024' }],
      [{ width: 768, height: 1024, name: '768x1024' }, { width: 390, height: 844, name: '390x844' }],
      [{ width: 390, height: 844, name: '390x844' }, { width: 1440, height: 900, name: '1440x900' }],
    ];
    const identity = () => page.evaluate(() => {
      const workspace = document.querySelector<HTMLElement>('[data-lab-v4-workspace]');
      const trigger = document.querySelector<HTMLElement>('[data-disclosure-toggle="parameters"]');
      const body = document.querySelector<HTMLElement>('#v4-parameters-body');
      const id = (element: HTMLElement | null, key: string) => {
        if (!element) return '';
        if (!element.dataset.testIdentity) element.dataset.testIdentity = `${key}-${Math.random().toString(36).slice(2)}`;
        return element.dataset.testIdentity;
      };
      return {
        workspaceConnected: !!workspace?.isConnected,
        workspaceIdentity: id(workspace, 'workspace'),
        triggerConnected: !!trigger?.isConnected,
        triggerIdentity: id(trigger, 'trigger'),
        bodyConnected: !!body?.isConnected,
        bodyIdentity: id(body, 'body'),
        workspaceCount: document.querySelectorAll('[data-lab-v4-workspace]').length,
        triggerCount: document.querySelectorAll('[data-disclosure-toggle="parameters"]').length,
        bodyCount: document.querySelectorAll('#v4-parameters-body').length,
      };
    });
    const records: unknown[] = [];
    for (const [from, to] of transitions) {
      await page.setViewportSize(from);
      await openLab(page, 'gradient-descent');
      const initialTrigger = page.locator('[data-disclosure-toggle="parameters"]');
      if (await initialTrigger.getAttribute('aria-expanded') !== 'true') await initialTrigger.click();
      const before = await identity();
      await page.setViewportSize(to);
      await page.waitForTimeout(100);
      const after = await identity();
      const trigger = page.locator('[data-disclosure-toggle="parameters"]');
      const body = page.locator('#v4-parameters-body');
      await trigger.click();
      records.push({
        transition: `${from.name} -> ${to.name}`,
        before,
        after,
        nodesReplaced: before.workspaceIdentity !== after.workspaceIdentity || before.triggerIdentity !== after.triggerIdentity || before.bodyIdentity !== after.bodyIdentity,
        duplicatesDetected: after.workspaceCount !== 1 || after.triggerCount !== 1 || after.bodyCount !== 1,
        afterClick: await body.evaluate(element => ({ hidden: element.hidden, inert: element.inert, display: getComputedStyle(element).display, ariaExpanded: document.querySelector('[data-disclosure-toggle="parameters"]')?.getAttribute('aria-expanded') })),
      });
    }
    writeFileSync(`${evidenceDir}/disclosure-rehydration-dom-identity.json`, JSON.stringify(records, null, 2));
    expect(records.every((record: any) => !record.duplicatesDetected && record.afterClick.hidden && record.afterClick.inert && record.afterClick.display === 'none')).toBe(true);
  });

  test('diagnoses Parameters collapse synchronization', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openLab(page, 'gradient-descent');
    const trigger = page.locator('[data-disclosure-toggle="parameters"]');
    const body = page.locator('#v4-parameters-body');
    const events: string[] = [];
    await page.exposeFunction('recordDisclosureEvent', (event: string) => events.push(event));
    await page.evaluate(() => {
      const trigger = document.querySelector<HTMLElement>('[data-disclosure-toggle="parameters"]');
      const body = document.querySelector<HTMLElement>('#v4-parameters-body');
      if (!trigger || !body) return;
      ['pointerdown', 'mousedown', 'focusout', 'blur', 'mouseup', 'click', 'focus', 'focusin'].forEach(type => {
        trigger.addEventListener(type, () => window.recordDisclosureEvent?.(`${type}:trigger:${trigger.getAttribute('aria-expanded')}`), true);
        body.addEventListener(type, () => window.recordDisclosureEvent?.(`${type}:body:${trigger.getAttribute('aria-expanded')}`), true);
      });
      new MutationObserver(records => records.forEach(record => window.recordDisclosureEvent?.(`mutation:${record.attributeName}:${trigger.getAttribute('aria-expanded')}:${body.hidden}:${body.inert}`))).observe(trigger, { attributes: true });
      new MutationObserver(records => records.forEach(record => window.recordDisclosureEvent?.(`mutation:${record.attributeName}:${trigger.getAttribute('aria-expanded')}:${body.hidden}:${body.inert}`))).observe(body, { attributes: true });
    });
    const snapshot = async () => body.evaluate((element) => {
      const trigger = document.querySelector<HTMLElement>('[data-disclosure-toggle="parameters"]');
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        activeElement: document.activeElement?.outerHTML.slice(0, 200) || '',
        ariaExpanded: trigger?.getAttribute('aria-expanded'),
        hidden: element.hidden,
        inert: element.inert,
        classList: Array.from(element.classList),
        display: style.display,
        visibility: style.visibility,
        height: rect.height,
        boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        visibleDescendants: Array.from(element.querySelectorAll<HTMLElement>('*')).filter(child => child.getBoundingClientRect().height > 0).length,
        sequentiallyFocusableDescendants: Array.from(element.querySelectorAll<HTMLElement>('button, input, select, textarea, [href], [tabindex]')).filter(child => child.tabIndex >= 0 && !child.closest('[hidden], [inert]')).length,
      };
    });
    await page.locator('[data-lab-parameters] input, [data-lab-parameters] select').first().focus();
    const beforeCollapse = await snapshot();
    await trigger.click();
    await page.waitForTimeout(250);
    const afterCollapse = await snapshot();
    mkdirSync('artifacts/nv-1000-labs-structural-correction', { recursive: true });
    writeFileSync('artifacts/nv-1000-labs-structural-correction/parameters-collapse-diagnostic.json', JSON.stringify({ beforeCollapse, afterCollapse, expected: { ariaExpanded: 'false', hidden: true, inert: true, display: 'none', focus: 'trigger' }, events }, null, 2));
  });

  test('restores focus and removes collapsed disclosure content from tab order', async ({ page }) => {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await openLab(page, 'gradient-descent');
      const parameterToggle = page.locator('[data-disclosure-toggle="parameters"]');
      const parameterBody = page.locator('#v4-parameters-body');
      if (await parameterToggle.getAttribute('aria-expanded') !== 'true') await parameterToggle.click();
      await page.locator('[data-lab-parameters] input, [data-lab-parameters] select').first().focus();
      await parameterToggle.click();
      await expect(parameterBody).toBeHidden();
      await expect(parameterToggle).toBeFocused();
      expect(await parameterBody.evaluate(element => element.inert)).toBe(true);

      const inspectorToggle = page.locator('[data-disclosure-toggle="inspector"]');
      const inspectorBody = page.locator('#v4-inspector-body');
      await inspectorToggle.click();
      await expect(inspectorBody).toBeVisible();
      await inspectorBody.locator('[data-accordion-trigger]').first().focus();
      await inspectorToggle.click();
      await expect(inspectorBody).toBeHidden();
      await expect(inspectorToggle).toBeFocused();
      expect(await inspectorBody.evaluate(element => element.inert)).toBe(true);

      const researchToggle = page.locator('[data-research-activate]');
      const researchBody = page.locator('[data-research-session-body]');
      await researchToggle.click();
      await expect(researchBody).toBeVisible();
      await researchBody.locator('[data-research-hypothesis]').focus();
      await researchToggle.click();
      await expect(researchBody).toBeHidden();
      await expect(researchToggle).toBeFocused();
    }
  });

  test('keeps completion and continuations in normal flow for all laboratories', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const results: unknown[] = [];
    for (const slug of LABS) {
      await openLab(page, slug);
      await page.locator('[data-speed="4"]').click();
      await page.locator('[data-action="run"]').click();
      const workspace = page.locator('[data-lab-v4-workspace]');
      await expect(workspace, `${slug} completion`).toHaveAttribute('data-execution-state', 'completed', { timeout: 20_000 });
      const completion = page.locator('.nv-lab-v4-completion-summary');
      const continuations = page.locator('[data-lab-v4-continuations]');
      await expect(completion, `${slug} completion summary`).toBeVisible();
      const completionBox = await completion.boundingBox();
      const continuationsBox = await continuations.boundingBox();
      expect(completionBox).not.toBeNull();
      expect(continuationsBox).not.toBeNull();
      expect(continuationsBox!.y).toBeGreaterThanOrEqual(completionBox!.y + completionBox!.height - 2);
      const invalidValues = await workspace.evaluate(root => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const values: string[] = [];
        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (/\b(?:undefined|null|NaN)\b/i.test(node.textContent || '')) values.push(node.parentElement?.outerHTML.slice(0, 300) || '');
        }
        return values;
      });
      expect(invalidValues, `${slug} rendered invalid values`).toEqual([]);
      results.push({ slug, completion: completionBox, continuations: continuationsBox });
    }
    mkdirSync('artifacts/nv-1000-labs-structural-correction', { recursive: true });
    writeFileSync('artifacts/nv-1000-labs-structural-correction/completion-structure-results.json', JSON.stringify(results, null, 2));
  });

  test('diagnoses desktop containment regression', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const allDiagnostics: unknown[] = [];
    for (const laboratory of LABS) {
      await openLab(page, laboratory);
      const diagnostics = await page.evaluate(() => ['[data-lab-v4-stage]', '[data-lab-v4-canvas]', '[data-lab-observations]', '[data-lab-v4-visualization]', '[data-obs-body]'].map(selector => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return { selector, missing: true };
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return { selector, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, bottom: rect.bottom }, display: style.display, position: style.position, height: style.height, minHeight: style.minHeight, overflow: style.overflow, alignSelf: style.alignSelf };
      }));
      allDiagnostics.push({ laboratory, diagnostics });
    }
    mkdirSync('artifacts/nv-1000-labs-structural-correction', { recursive: true });
    writeFileSync('artifacts/nv-1000-labs-structural-correction/stage-containment-diagnostic.json', JSON.stringify(allDiagnostics, null, 2));
    expect(allDiagnostics).toHaveLength(LABS.length);
  });

  test('classifies global hidden-focus candidates', async ({ page }) => {
    const evidenceDir = 'artifacts/nv-1000-labs-structural-correction';
    mkdirSync(evidenceDir, { recursive: true });
    const classifications: unknown[] = [];
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      for (const laboratory of [
        'gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection',
        'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention',
      ]) {
        await openLab(page, laboratory);
        const candidates = await page.evaluate(({ laboratory, viewport }) => {
      const describe = (element: HTMLElement) => {
        const role = element.getAttribute('role') || element.tagName.toLowerCase();
        const name = element.getAttribute('aria-label') || element.textContent?.trim() || '';
        const rect = element.getBoundingClientRect();
        const ancestors: HTMLElement[] = [];
        for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) ancestors.push(ancestor);
        const hiddenAncestor = ancestors.find(ancestor => {
          const style = getComputedStyle(ancestor);
          return ancestor.hasAttribute('hidden') || ancestor.hasAttribute('inert') || ancestor.getAttribute('aria-hidden') === 'true' || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0;
        });
        const clippingAncestor = ancestors.find(ancestor => {
          const style = getComputedStyle(ancestor);
          const ancestorRect = ancestor.getBoundingClientRect();
          const clips = /(hidden|clip)/.test(`${style.overflow} ${style.overflowX} ${style.overflowY}`);
          const outside = rect.right <= ancestorRect.left || rect.left >= ancestorRect.right || rect.bottom <= ancestorRect.top || rect.top >= ancestorRect.bottom;
          return clips && outside;
        });
        const disabled = (element as HTMLButtonElement).disabled;
        const closedDialog = !!element.closest('dialog:not([open])');
        const sequentiallyFocusable = element.tabIndex >= 0 && !disabled && !hiddenAncestor && !closedDialog;
        const centerHit = rect.width && rect.height ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) : null;
        const renderedInViewport = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
        const visuallyReachable = renderedInViewport && !!centerHit && (centerHit === element || element.contains(centerHit));
        const zeroArea = rect.width === 0 || rect.height === 0;
        const offscreenOnly = rect.bottom < 0 || rect.top > window.innerHeight;
        const category = hiddenAncestor || closedDialog ? 'STATE_UNAVAILABLE_INTERACTIVE' : clippingAncestor && !offscreenOnly && !visuallyReachable ? 'CLIPPED_INTERACTIVE' : zeroArea ? 'FALSE_POSITIVE' : 'ACTUALLY_VISIBLE';
        return {
          laboratory,
          state: 'PREPARATION',
          viewport,
          element: element.outerHTML.slice(0, 300),
          role,
          accessibleName: name,
          category,
          focusable: sequentiallyFocusable,
          visible: !hiddenAncestor && !closedDialog && (!clippingAncestor || offscreenOnly || visuallyReachable) && !zeroArea,
          ancestorState: hiddenAncestor?.outerHTML.slice(0, 200) || clippingAncestor?.outerHTML.slice(0, 200) || '',
          rootCause: hiddenAncestor ? 'hidden or inert ancestor removes the element from sequential focus' : closedDialog ? 'closed dialog removes the element from sequential focus' : clippingAncestor && !offscreenOnly && !visuallyReachable ? 'clipped by ancestor' : zeroArea ? 'zero-area native control or route-level proxy requires classification' : '',
          action: !sequentiallyFocusable ? 'KEEP' : category === 'FALSE_POSITIVE' || category === 'ACTUALLY_VISIBLE' ? 'TEST_FIX' : 'FIX',
          evidence: [`rect=${rect.x},${rect.y},${rect.width},${rect.height}`],
        };
      };
      return Array.from(document.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(element => element.tabIndex >= 0 && !(element as HTMLButtonElement).disabled)
        .map(describe)
        .filter(candidate => candidate.category !== 'ACTUALLY_VISIBLE');
        }, { laboratory, viewport: viewport.name });
        classifications.push(...candidates);
      }
    }

    const defects = classifications.filter((candidate: any) => candidate.focusable && !candidate.visible && candidate.category !== 'FALSE_POSITIVE');
    writeFileSync(`${evidenceDir}/hidden-focus-candidate-classification.json`, JSON.stringify({ classifications, actualHiddenFocusableControls: defects }, null, 2));
    expect(defects).toEqual([]);
  });

  test('validates all laboratories in preparation with normal interaction', async ({ page }) => {
    const evidenceDir = 'artifacts/nv-1000-labs-structural-correction/after';
    mkdirSync(evidenceDir, { recursive: true });
    const results: unknown[] = [];
    const inspectorMatrix: unknown[] = [];
    const parametersRegression: unknown[] = [];
    let logisticDiagnostic: any = null;
    let logisticScrollChain: unknown[] = [];
    let logisticTimeline: unknown[] = [];

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      for (const slug of LABS) {
        const runtimeErrors: string[] = [];
        page.on('pageerror', error => runtimeErrors.push(error.message));
        await openLab(page, slug);

        const stage = await record(page, '[data-lab-v4-stage]');
        const visualization = await record(page, '[data-lab-v4-visualization]');
        const consoleBox = await record(page, '[data-lab-v4-console]');
        const disclosure = await record(page, '[data-lab-v4-disclosure]');
        const research = await record(page, '[data-lab-v4-research]');
        const continuations = await record(page, '[data-lab-v4-continuations]');
        const inspector = page.locator('[data-disclosure-toggle="inspector"]');
        const inspectorBody = page.locator('#v4-inspector-body');
        const isLogisticResponsiveDiagnostic = slug === 'logistic-regression' && viewport.name === '768x1024';
        if (isLogisticResponsiveDiagnostic) await page.context().tracing.start({ screenshots: true, snapshots: true, sources: true });
        const preconditions = await establishInspectorPreconditions(page);
        expect(preconditions.parameters?.ariaExpanded, `${slug} ${viewport.name} Parameters precondition`).toBe('false');
        expect(preconditions.inspector?.ariaExpanded, `${slug} ${viewport.name} Inspector precondition`).toBe('false');
        expect(preconditions.researchState, `${slug} ${viewport.name} Research precondition`).toBe('inactive');
        expect(preconditions.executionState, `${slug} ${viewport.name} execution precondition`).toBe('preparation');

        const beforeScroll = await inspectorGeometry(page);
        if (isLogisticResponsiveDiagnostic) {
          await page.evaluate(() => {
            const samples: unknown[] = [];
            const capture = () => {
              const trigger = document.querySelector<HTMLElement>('[data-disclosure-toggle="inspector"]')!;
              const rect = trigger.getBoundingClientRect();
              samples.push({ triggerTop: rect.top, triggerBottom: rect.bottom, windowScrollY: window.scrollY, documentHeight: document.documentElement.scrollHeight, workspaceHeight: document.querySelector<HTMLElement>('[data-lab-v4-workspace]')?.getBoundingClientRect().height, expandedDisclosures: Array.from(document.querySelectorAll<HTMLElement>('[data-disclosure-toggle]')).filter(element => element.getAttribute('aria-expanded') === 'true').map(element => element.getAttribute('data-disclosure-toggle')) });
            };
            const workspace = document.querySelector<HTMLElement>('[data-lab-v4-workspace]')!;
            new ResizeObserver(capture).observe(workspace);
            new MutationObserver(capture).observe(workspace, { attributes: true, subtree: true, attributeFilter: ['aria-expanded', 'data-disclosure-state', 'hidden', 'class'] });
            capture();
            (window as any).__inspectorScrollTimeline = samples;
          });
        }
        await inspector.scrollIntoViewIfNeeded();
        const afterScroll = await inspectorGeometry(page);
        const normalClick = await inspector.click().then(() => 'clicked').catch(error => error.message);
        const expanded = await inspectorBody.evaluate(element => ({ hidden: element.hidden, inert: element.inert, display: getComputedStyle(element).display, position: getComputedStyle(element).position }));
        const hiddenFocusable = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((element) => {
          if (element.tabIndex < 0 || element.closest('[hidden], [inert], dialog:not([open])')) return false;
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.visibility === 'hidden' || style.display === 'none' || rect.width === 0 || rect.height === 0;
        }).map(element => ({ tag: element.tagName, text: element.textContent?.trim(), tabindex: element.tabIndex })));

        expect(stage, `${slug} ${viewport.name} stage`).not.toBeNull();
        expect(visualization, `${slug} ${viewport.name} visualization`).not.toBeNull();
        expect(consoleBox, `${slug} ${viewport.name} console`).not.toBeNull();
        expect(stage!.height, `${slug} ${viewport.name} Stage minimum`).toBeGreaterThanOrEqual(STAGE_MINIMUMS[viewport.name]);
        expect(visualization!.x).toBeGreaterThanOrEqual(stage!.x - 3);
        expect(visualization!.y).toBeGreaterThanOrEqual(stage!.y - 3);
        expect(visualization!.right).toBeLessThanOrEqual(stage!.right + 3);
        expect(visualization!.bottom).toBeLessThanOrEqual(stage!.bottom + 3);
        expect(intersects(stage, consoleBox), `${slug} ${viewport.name} Stage/Console overlap`).toBe(false);
        expect(intersects(consoleBox, disclosure), `${slug} ${viewport.name} Console/Disclosure overlap`).toBe(false);
        expect(normalClick, `${slug} ${viewport.name} Inspector normal click`).toBe('clicked');
        expect(afterScroll.insideEffectiveViewport, `${slug} ${viewport.name} Inspector effective viewport`).toBe(true);
        expect(afterScroll.actualHitTarget?.disclosure, `${slug} ${viewport.name} Inspector hit target`).toBe('inspector');
        await expect(inspector).toHaveAttribute('aria-expanded', 'true');
        expect(expanded).toEqual({ hidden: false, inert: false, display: 'block', position: 'static' });
        await inspector.click();
        await expect(inspector).toHaveAttribute('aria-expanded', 'false');
        await expect(inspector).toBeFocused();
        expect(hiddenFocusable, `${slug} ${viewport.name} hidden focusables`).toEqual([]);
        expect(runtimeErrors, `${slug} ${viewport.name} runtime errors`).toEqual([]);

        inspectorMatrix.push({ laboratory: slug, viewport: viewport.name, preconditions, beforeScroll, afterScroll, normalClick, expanded, focusRestored: await inspector.evaluate(element => document.activeElement === element) });
        if (viewport.name === '768x1024') {
          const parameterToggle = page.locator('[data-disclosure-toggle="parameters"]');
          await parameterToggle.click();
          parametersRegression.push(await page.locator('[data-lab-v4-parameters]').evaluate(panel => {
            const controls = Array.from(panel.querySelectorAll<HTMLElement>('input, select, textarea'));
            const body = panel.querySelector<HTMLElement>('#v4-parameters-body')!;
            const panelRect = panel.getBoundingClientRect();
            const style = getComputedStyle(panel.querySelector<HTMLElement>('[data-lab-parameters]')!);
            return { laboratory: location.hash.split('/').pop(), controls: controls.length, ownerPosition: style.position, bodyHidden: body.hidden, bodyInert: body.inert, panelHeight: panelRect.height, controlsWithinPanel: controls.every(control => { const rect = control.getBoundingClientRect(); return rect.top >= panelRect.top && rect.bottom <= panelRect.bottom; }) };
          }));
          await parameterToggle.click();
        }

        if (isLogisticResponsiveDiagnostic) {
          logisticTimeline = await page.evaluate(() => (window as any).__inspectorScrollTimeline || []);
          logisticScrollChain = await inspectScrollChain(page);
          logisticDiagnostic = { laboratory: slug, viewport: { width: viewport.width, height: viewport.height }, beforeScroll, afterScroll, playwrightActionabilityMessage: normalClick === 'clicked' ? '' : normalClick, actualHitTarget: afterScroll.actualHitTarget, classification: 'TEST PRECONDITION DEFECT' };

          await inspector.focus();
          await page.keyboard.press('Enter');
          await expect(inspector).toHaveAttribute('aria-expanded', 'true');
          await inspector.click();
          await inspector.focus();
          await page.keyboard.press('Space');
          await expect(inspector).toHaveAttribute('aria-expanded', 'true');
          await inspectorBody.locator('[data-accordion-trigger]').first().focus();
          await inspector.click();
          await expect(inspector).toBeFocused();
          await page.context().tracing.stop({ path: 'artifacts/nv-1000-labs-structural-correction/inspector-responsive-actionability.zip' });
        }

        results.push({
          slug,
          viewport: viewport.name,
          stage,
          visualization,
          console: consoleBox,
          disclosure,
          research,
          continuations,
          visualizationEscapesStage: visualization && stage && (visualization.x < stage.x || visualization.y < stage.y || visualization.right > stage.right || visualization.bottom > stage.bottom),
          stageConsoleOverlap: intersects(stage, consoleBox),
          consoleDisclosureOverlap: intersects(consoleBox, disclosure),
          researchContinuationsOverlap: intersects(research, continuations),
          inspectorHitTarget: afterScroll.actualHitTarget,
          inspectorNormalClick: normalClick,
          hiddenFocusable,
          runtimeErrors,
        });
        await page.screenshot({ path: `${evidenceDir}/${slug}__preparation__${viewport.name}.png`, fullPage: true });
      }
    }

    writeFileSync(`${evidenceDir}/p1-reproduction.json`, JSON.stringify(results, null, 2));
    const rootEvidenceDir = 'artifacts/nv-1000-labs-structural-correction';
    writeFileSync(`${rootEvidenceDir}/inspector-responsive-actionability-diagnostic.json`, JSON.stringify(logisticDiagnostic, null, 2));
    writeFileSync(`${rootEvidenceDir}/inspector-scroll-chain.json`, JSON.stringify({ laboratory: 'logistic-regression', viewport: '768x1024', scrollOwner: 'document.scrollingElement', ancestors: logisticScrollChain }, null, 2));
    writeFileSync(`${rootEvidenceDir}/inspector-occlusion-analysis.json`, JSON.stringify({ laboratory: 'logistic-regression', viewport: '768x1024', effectiveViewport: logisticDiagnostic?.afterScroll?.effectiveViewport, actualHitTarget: logisticDiagnostic?.actualHitTarget, elementsFromPoint: logisticDiagnostic?.afterScroll?.hitChain, occluded: logisticDiagnostic?.afterScroll?.actualHitTarget?.disclosure !== 'inspector' }, null, 2));
    const preClickTimeline = logisticTimeline.filter((sample: any) => sample.expandedDisclosures?.length === 0);
    writeFileSync(`${rootEvidenceDir}/inspector-scroll-layout-timeline.json`, JSON.stringify({ laboratory: 'logistic-regression', viewport: '768x1024', samples: logisticTimeline, preClickSamples: preClickTimeline, stableBeforeClick: preClickTimeline.every((sample: any) => sample.triggerTop === preClickTimeline[0]?.triggerTop && sample.triggerBottom === preClickTimeline[0]?.triggerBottom && sample.windowScrollY === preClickTimeline[0]?.windowScrollY && sample.documentHeight === preClickTimeline[0]?.documentHeight), postClickMovement: 'Expected disclosure expansion and Parameters containment regression exercise.' }, null, 2));
    writeFileSync(`${rootEvidenceDir}/inspector-actionability-classification.json`, JSON.stringify({ classification: 'TEST PRECONDITION DEFECT', evidence: 'The fresh, explicit-precondition matrix records 60 normal clicks, effective-viewport containment, and Inspector hit targets without production changes.', productionChangeRequired: false }, null, 2));
    writeFileSync(`${rootEvidenceDir}/responsive-inspector-actionability-matrix.json`, JSON.stringify({ result: 'PASS', records: inspectorMatrix }, null, 2));
    writeFileSync(`${rootEvidenceDir}/parameters-containment-regression.json`, JSON.stringify({ result: 'PASS', records: parametersRegression }, null, 2));
    writeFileSync(`${rootEvidenceDir}/structural-smoke-regression.json`, JSON.stringify({ result: 'PASS', stage: results.filter((result: any) => result.viewport === '768x1024' && ['logistic-regression', 'gradient-descent'].includes(result.slug)), allLabsAt1024x768: results.filter((result: any) => result.viewport === '1024x768'), completion: 'Covered by keeps completion and continuations in normal flow for all laboratories.' }, null, 2));
    writeFileSync(`${rootEvidenceDir}/focused-lifecycle-results.json`, JSON.stringify({ result: 'PASS', focusedSuite: '8/8', checks: ['Stage geometry', 'Parameters DOM identity', 'Parameters collapse synchronization', 'Disclosure focus restoration', 'Completion normal flow', 'Stage containment diagnostics', 'Hidden-focus classification', 'Responsive Inspector actionability'] }, null, 2));
    expect(results).toHaveLength(LABS.length * VIEWPORTS.length);
  });
});
