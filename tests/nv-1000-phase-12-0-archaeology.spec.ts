/**
 * NV-1000 Phase 12.0 - audit-only DOM/CSS runtime evidence collection.
 * This test intentionally writes only artifacts and screenshots, never product files.
 */
import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'http://localhost:8080/index.html#/laboratory/';
const ARTIFACTS = 'artifacts/nv-1000-phase-12-0';
const SHOTS = 'test-results/nv-1000-phase-12-0';
const DEEP_LABS = ['gradient-descent', 'kmeans-clustering', 'pca-projection', 'transformer-attention'];
const ALL_LABS = ['gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection', 'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention'];
const VIEWPORTS = [[1920, 1080], [1600, 900], [1440, 900], [1280, 800], [1024, 768], [900, 900], [768, 1024], [430, 932], [390, 844], [375, 812], [360, 740]] as const;
const MAJOR = ['[data-lab-workspace]', '.nv-lab-workspace-header', '[data-lab-canvas-region]', '.nv-lab-obs-panel--primary', '[data-lab-hud-telemetry]', '[data-lab-inspector]', '[data-xai-panel]', '[data-lab-instrument-bar]', '[data-lab-parameters-drawer]', '[data-lab-log]', '[data-research-panel]', '[data-lab-continuations]'];
const PROPERTIES = ['display', 'position', 'inset', 'top', 'right', 'bottom', 'left', 'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight', 'gridTemplateColumns', 'gridTemplateRows', 'gridColumn', 'gridRow', 'flexDirection', 'overflow', 'overflowX', 'overflowY', 'zIndex', 'transform', 'margin', 'padding', 'background', 'border', 'fontSize', 'lineHeight'];

async function step(page: Page, count: number) {
  for (let i = 0; i < count; i++) await page.locator('[data-action="step"]').click();
  await page.waitForTimeout(100);
}

async function state(page: Page, name: string) {
  if (name === 'one-step') await step(page, 1);
  if (name === 'mid-execution') await step(page, 5);
  if (name === 'completed') { await page.locator('[data-action="run"]').click(); await page.waitForTimeout(3200); }
  if (name === 'parameters-open') { await step(page, 1); await page.locator('[data-lab-params-toggle]').click(); }
  if (name === 'inspector-details-open') { await step(page, 2); const trigger = page.locator('[data-accordion-trigger]').first(); if (await trigger.isVisible().catch(() => false)) await trigger.click(); }
  if (name === 'scientific-log-open') { await step(page, 2); const toggle = page.locator('[data-lab-log-toggle]'); if (await toggle.isVisible().catch(() => false)) await toggle.click(); }
  if (name === 'xai-expanded') { await step(page, 5); const finding = page.locator('.nv-xai-finding').first(); if (await finding.isVisible().catch(() => false)) await finding.click(); }
  if (name === 'research-mode') await page.locator('[data-research-toggle]').click();
  if (name === 'parameters-and-log-open') { await step(page, 2); await page.locator('[data-lab-params-toggle]').click(); const toggle = page.locator('[data-lab-log-toggle]'); if (await toggle.isVisible().catch(() => false)) await toggle.click(); }
}

test('NV-1000 Phase 12.0 archaeology exports runtime evidence', async ({ page }) => {
  test.setTimeout(240000);
  mkdirSync(ARTIFACTS, { recursive: true });
  mkdirSync(SHOTS, { recursive: true });
  const domOwnership: unknown[] = [];
  const computed: unknown[] = [];
  const scrollContainers: unknown[] = [];
  const overlaps: unknown[] = [];
  const responsive: unknown[] = [];

  for (const slug of ALL_LABS) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + slug, { waitUntil: 'networkidle' });
    await step(page, 1);
    domOwnership.push(await page.evaluate((lab) => {
      const nodes = ['[data-lab-workspace]', '.nv-lab-workspace-header', '.nv-lab-back-btn', '[data-lab-title]', '[data-lab-canvas-region]', '.nv-lab-obs-panel--primary', '[data-lab-hud-telemetry]', '[data-lab-inspector]', '[data-xai-panel]', '[data-xai-history]', '[data-lab-timeline]', '.nv-lab-ws-controls', '.nv-lab-ws-speed', '.nv-lab-instrument-status', '[data-lab-parameters-drawer]', '[data-lab-log]', '[data-research-panel]', '[data-lab-continuations]'];
      return { lab, nodes: nodes.map(selector => { const e = document.querySelector(selector); return { selector, exists: !!e, parent: e?.parentElement?.getAttribute('data-lab-drawer-layer') !== null ? '[data-lab-drawer-layer]' : e?.parentElement?.className || null, classes: e?.className || null, role: e?.getAttribute('role') || null, attributes: e ? [...e.attributes].filter(a => a.name.startsWith('data-') || a.name.startsWith('aria-')).map(a => [a.name, a.value]) : [] }; }) };
    }, slug));
  }

  for (const slug of DEEP_LABS) {
    for (const name of ['initial', 'one-step', 'mid-execution', 'completed', 'parameters-open', 'inspector-details-open', 'scientific-log-open', 'xai-expanded', 'research-mode', 'parameters-and-log-open']) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(BASE + slug, { waitUntil: 'networkidle' });
      await state(page, name);
      const folder = join(SHOTS, slug); mkdirSync(folder, { recursive: true });
      await page.screenshot({ path: join(folder, `${name}-1440x900.png`), fullPage: true });
      const evidence = await page.evaluate(({ slug, name, major, properties }) => {
        const rect = (selector: string) => { const e = document.querySelector(selector); const r = e?.getBoundingClientRect(); return !r || !r.width || !r.height ? null : { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }; };
        const intersects = (a: any, b: any) => !!a && !!b && Math.max(a.x, b.x) < Math.min(a.x + a.width, b.x + b.width) && Math.max(a.y, b.y) < Math.min(a.y + a.height, b.y + b.height);
        const styles = major.map(selector => { const e = document.querySelector(selector); const s = e && getComputedStyle(e); return { selector, rect: rect(selector), styles: s ? Object.fromEntries(properties.map((p: string) => [p, (s as any)[p]])) : null }; });
        const scroll = [...document.querySelectorAll('*')].filter(e => { const s = getComputedStyle(e); return (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth) && s.overflow !== 'visible'; }).map(e => ({ selector: e.getAttribute('data-lab-log') !== null ? '[data-lab-log]' : e.className || e.tagName, x: e.scrollWidth > e.clientWidth, y: e.scrollHeight > e.clientHeight, nested: !!e.parentElement?.closest('[data-lab-workspace]') }));
        const pairs = [['inspector', '[data-lab-inspector]', 'visualization', '.nv-lab-obs-panel--primary'], ['inspector', '[data-lab-inspector]', 'instrument', '[data-lab-instrument-bar]'], ['xai', '[data-xai-panel]', 'visualization', '.nv-lab-obs-panel--primary'], ['xai', '[data-xai-panel]', 'instrument', '[data-lab-instrument-bar]'], ['parameters', '[data-lab-parameters-drawer]', 'log', '[data-lab-log]'], ['log', '[data-lab-log]', 'continuations', '[data-lab-continuations]']].map(([an, as, bn, bs]) => ({ pair: `${an}-${bn}`, intersects: intersects(rect(as), rect(bs)), a: rect(as), b: rect(bs) }));
        return { slug, name, styles, scroll, pairs, document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, viewport: [innerWidth, innerHeight] } };
      }, { slug, name, major: MAJOR, properties: PROPERTIES });
      computed.push({ slug, name, styles: (evidence as any).styles });
      scrollContainers.push({ slug, name, scroll: (evidence as any).scroll });
      overlaps.push({ slug, name, pairs: (evidence as any).pairs });
    }
  }

  for (const [width, height] of VIEWPORTS) {
    await page.setViewportSize({ width, height });
    await page.goto(BASE + 'gradient-descent', { waitUntil: 'networkidle' });
    await step(page, 3);
    await page.locator('[data-research-toggle]').click();
    responsive.push(await page.evaluate(([width, height]) => ({ width, height, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, mode: getComputedStyle(document.querySelector('[data-lab-canvas-region]')!).gridTemplateAreas, regions: ['.nv-lab-obs-panel--primary', '[data-lab-hud-telemetry]', '[data-xai-panel]', '[data-lab-instrument-bar]', '[data-lab-parameters-drawer]'].map(selector => { const e = document.querySelector(selector); const r = e?.getBoundingClientRect(); return { selector, display: e && getComputedStyle(e).display, rect: r && [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; }) }), [width, height]));
    if ([[1440, 900], [1280, 800], [1024, 768], [768, 1024], [390, 844], [360, 740]].some(v => v[0] === width && v[1] === height)) {
      mkdirSync(join(SHOTS, 'responsive'), { recursive: true });
      await page.screenshot({ path: join(SHOTS, 'responsive', `gradient-descent-research-${width}x${height}.png`), fullPage: true });
    }
  }

  writeFileSync(join(ARTIFACTS, 'dom-ownership.json'), JSON.stringify(domOwnership, null, 2));
  writeFileSync(join(ARTIFACTS, 'runtime-computed-styles.json'), JSON.stringify(computed, null, 2));
  writeFileSync(join(ARTIFACTS, 'scroll-containers.json'), JSON.stringify(scrollContainers, null, 2));
  writeFileSync(join(ARTIFACTS, 'overlap-matrix.json'), JSON.stringify(overlaps, null, 2));
  writeFileSync(join(ARTIFACTS, 'responsive-matrix.json'), JSON.stringify(responsive, null, 2));
  const css = readFileSync('website/styles/laboratories.css', 'utf8');
  const lines = css.split('\n');
  const phaseAt = (line: number) => line >= 9110 ? 'Phase 11' : line >= 8797 ? 'Phase 10' : line >= 8201 ? 'Phase 9' : line >= 7752 ? 'Phase 8' : line >= 7250 ? 'Phase 7' : line >= 6639 ? 'Phase 6' : line >= 3277 ? 'Phase 5.3' : line >= 2090 ? 'Phase 5' : 'Pre-workspace';
  const selectorRows: any[] = [];
  const rule = /(^|\n)\s*([^@{}][^{]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(css))) {
    const start = css.slice(0, match.index).split('\n').length;
    const selectorText = match[2].trim();
    if (!selectorText || selectorText.startsWith('from') || selectorText.startsWith('to')) continue;
    for (const selector of selectorText.split(',').map(s => s.trim()).filter(Boolean)) {
      const propertyCount = match[3].split(';').filter(p => p.trim() && p.includes(':')).length;
      selectorRows.push({ selector, file: 'website/styles/laboratories.css', line_start: start, line_end: start + match[0].split('\n').length - 1, phase: phaseAt(start), specificity: [selector.match(/#/g)?.length || 0, (selector.match(/\.|\[/g)?.length || 0), (selector.replace(/::?[\w-]+(?:\([^)]*\))?/g, '').match(/[a-z][\w-]*/gi)?.length || 0)].join('-'), media_query: [...lines.slice(0, start).join('\n').matchAll(/@media\s*\(([^)]+)\)/g)].at(-1)?.[1] || '', property_count: propertyCount, contains_important: match[3].includes('!important'), matches_runtime_dom: false, matched_element_count: 0, overridden_property_count: 'requires DevTools cascade trace', javascript_dependency: 'requires source contract map', test_dependency: 'requires test contract map', classification: phaseAt(start) === 'Phase 11' ? 'CANONICAL_CANDIDATE' : 'UNKNOWN_REQUIRES_VALIDATION', recommended_action: phaseAt(start) === 'Phase 11' ? 'MIGRATE_OR_VERIFY' : 'RETAIN_UNTIL_PARITY' });
    }
  }
  const counts = new Map<string, number>(); selectorRows.forEach(row => counts.set(row.selector, (counts.get(row.selector) || 0) + 1));
  selectorRows.forEach(row => row.definition_count = counts.get(row.selector));
  const csv = ['selector,file,line_start,line_end,phase,specificity,media_query,property_count,contains_important,definition_count,classification,recommended_action', ...selectorRows.map(row => [row.selector, row.file, row.line_start, row.line_end, row.phase, row.specificity, row.media_query, row.property_count, row.contains_important, row.definition_count, row.classification, row.recommended_action].map(value => JSON.stringify(value)).join(','))].join('\n');
  writeFileSync(join(ARTIFACTS, 'selector-inventory.json'), JSON.stringify(selectorRows, null, 2));
  writeFileSync(join(ARTIFACTS, 'selector-inventory.csv'), csv);
  const breakpointRows = [...css.matchAll(/@media\s*\(([^)]+)\)/g)].map(m => ({ query: m[1], line: css.slice(0, m.index).split('\n').length, phase: phaseAt(css.slice(0, m.index).split('\n').length), classification: 'UNKNOWN_REQUIRES_VALIDATION' }));
  writeFileSync(join(ARTIFACTS, 'breakpoint-inventory.csv'), ['query,line,phase,classification', ...breakpointRows.map(row => [row.query, row.line, row.phase, row.classification].map(JSON.stringify).join(','))].join('\n'));
  const contracts = [['data-lab-workspace', 'LaboratoryController; Playwright', 'workspace root', 'PRESERVE'], ['data-lab-title', 'LabUIController; Playwright', 'metadata updates and route assertion', 'PRESERVE'], ['data-action', 'LabUIController; Playwright', 'execution controls', 'PRESERVE'], ['data-lab-parameters', 'LabUIController; Playwright', 'parameter rendering', 'PRESERVE'], ['data-lab-log', 'LabUIController; Playwright', 'log visibility and drawer contract', 'PRESERVE'], ['data-xai-panel', 'LabUIController; Playwright', 'finding rendering', 'PRESERVE'], ['data-research-toggle', 'LabUIController; Playwright', 'research state entry', 'PRESERVE']];
  writeFileSync(join(ARTIFACTS, 'preservation-contracts.csv'), ['selector_or_attribute,used_by,reason,migration', ...contracts.map(row => row.map(JSON.stringify).join(','))].join('\n'));
  const removals = [['Phase 5-10 layout rules', 'LEGACY_ACTIVE_OR_SHADOWED', 'Repeated active selectors; cannot remove before v4 parity', 'CSS selector and test contract mapping', 'After Phase 12.1 parity'], ['.nv-lab-ws-log legacy block', 'UNSAFE_TO_REMOVE', 'Legacy selector remains in historical and test paths', 'test and CSS references', 'After log shell migration'], ['.nv-lab-obs-panel--secondary', 'UNKNOWN_REQUIRES_VALIDATION', 'Hidden in Phase 11 but emitted for data definitions', 'laboratory-controller data observations', 'After per-lab output verification']];
  writeFileSync(join(ARTIFACTS, 'removal-candidates.csv'), ['selector_or_block,classification,evidence,dependencies,safe_removal_phase', ...removals.map(row => row.map(JSON.stringify).join(','))].join('\n'));
  expect(domOwnership).toHaveLength(10);
  expect(computed).toHaveLength(40);
});
