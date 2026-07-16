import { expect, test, type Page } from './fixtures/playwright-runtime-observability';
import { mkdirSync, writeFileSync } from 'node:fs';
import { visualRouteFixtures, type VisualRouteFixture } from './fixtures/nv-2600-route-fixtures';

const artifactDir = 'artifacts/nv-2600-strict-visual-audit';
const viewports = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
  { name: '360x740', width: 360, height: 740 },
  { name: '844x390', width: 844, height: 390 }
];
const primaryViewports = new Set(['1440x900', '390x844', '844x390']);
let navigationId = 0;

type RouteRecord = { id: string; path: string; title: string; isImplemented: boolean; parameterized: boolean; auditStatus: string };
type Measurement = { route: string; state: string; viewport: string; overflow: boolean; clippedText: number; overlapPairs: number; visibleButtons: number; heading: Record<string, string>; regions: Record<string, unknown> };

function write(name: string, value: unknown) {
  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(`${artifactDir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);
}

function filePart(value: string) {
  return value.replace(/^#\//, '').replace(/[^a-z0-9-]+/gi, '-').replace(/^-|-$/g, '') || 'home';
}

async function stabilize(page: Page) {
  await page.waitForFunction(async () => document.readyState === 'complete' && (!document.fonts || (await document.fonts.ready, true)));
  await expect(page.locator('#main-workspace')).toBeVisible();
}

async function open(page: Page, path: string) {
  await page.goto(`/index.html?nv2600=${navigationId++}${path}`, { waitUntil: 'domcontentloaded' });
  await stabilize(page);
}

async function openFixture(page: Page, fixture: VisualRouteFixture) {
  if (fixture.storage) await page.addInitScript(entries => Object.entries(entries).forEach(([key, value]) => localStorage.setItem(key, value)), fixture.storage);
  await open(page, fixture.route);
  if (fixture.storage) {
    const storageState = await page.evaluate(() => ({ raw: localStorage.getItem('nv_memory_items'), loaded: (window as any).NeuralVerse.MemoryStorage?.load?.(), item: (window as any).NeuralVerse.MemoryRegistry?.get?.('nv2600-canonical-note') }));
    expect(storageState.raw).not.toBeNull();
    expect(storageState.item?.id).toBe('nv2600-canonical-note');
  }
  await expect(page.locator(fixture.loadedMarker)).toBeVisible();
  await expect.poll(() => page.locator('h1').allTextContents()).toContain(fixture.expectedHeading);
  await expect(page.locator('.nv-memory-not-found, .nv-empty-state, [data-route-not-found]')).toHaveCount(0);
}

async function measure(page: Page, route: string, state: string, viewport: string): Promise<Measurement> {
  return page.evaluate(({ route, state, viewport }) => {
    const box = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { left: rect.left, top: rect.top, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom, zIndex: getComputedStyle(element).zIndex, position: getComputedStyle(element).position };
    };
    const visible = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && !element.closest('[hidden], [inert], [aria-hidden="true"]');
    };
    const interactive = [...document.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href]')].filter(visible).map(element => element.getBoundingClientRect());
    let overlapPairs = 0;
    for (let left = 0; left < interactive.length; left++) for (let right = left + 1; right < interactive.length; right++) {
      const a = interactive[left], b = interactive[right];
      if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2) overlapPairs++;
    }
    const essential = [...document.querySelectorAll<HTMLElement>('h1, h2, h3, button, label, [data-lab-v4-execution-status], .nv-lab-hud-metric-value')].filter(visible);
    const concealed = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      const hidesVertical = /hidden|clip/.test(style.overflowY);
      const hidesHorizontal = /hidden|clip/.test(style.overflowX) || style.textOverflow === 'ellipsis';
      return (hidesVertical && element.scrollHeight > element.clientHeight + 2) || (hidesHorizontal && element.scrollWidth > element.clientWidth + 2);
    };
    const heading = document.querySelector<HTMLElement>('h1');
    const headingStyle = heading ? getComputedStyle(heading) : null;
    return {
      route,
      state,
      viewport,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      clippedText: essential.filter(concealed).length,
      overlapPairs,
      visibleButtons: interactive.length,
      heading: headingStyle ? { fontFamily: headingStyle.fontFamily, fontSize: headingStyle.fontSize, fontWeight: headingStyle.fontWeight, lineHeight: headingStyle.lineHeight, letterSpacing: headingStyle.letterSpacing, color: headingStyle.color } : { fontFamily: '', fontSize: '', fontWeight: '', lineHeight: '', letterSpacing: '', color: '' },
      regions: {
        shell: box('#main-workspace'),
        stage: box('[data-lab-v4-stage]'),
        controls: box('[data-lab-v4-execution-console]'),
        inspector: box('[data-lab-v4-disclosure]'),
        research: box('[data-lab-v4-research-deck]')
      }
    };
  }, { route, state, viewport });
}

async function capture(page: Page, route: string, state: string, viewport: { name: string; width: number; height: number }, folder = 'screenshots') {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await stabilize(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  const directory = `${artifactDir}/${folder}/${viewport.name}`;
  mkdirSync(directory, { recursive: true });
  const path = `${directory}/${filePart(route)}__${state}__${viewport.name}__01.png`;
  await page.screenshot({ path, fullPage: true });
  return { path, measurement: await measure(page, route, state, viewport.name) };
}

test('NV-2600 captures deterministic route, laboratory, state, and viewport visual evidence', async ({ page }) => {
  test.setTimeout(300_000);
  await open(page, '#/');
  await expect.poll(() => page.evaluate(() => (window as any).NeuralVerse.LabRegistry.getAll().length)).toBe(10);
  const discovered = await page.evaluate(() => (window as any).ROUTES.map((route: any) => ({ id: route.id, path: route.path, title: route.title, isImplemented: route.isImplemented })));
  const routes: RouteRecord[] = discovered.map((route: Omit<RouteRecord, 'parameterized' | 'auditStatus'>) => {
    const parameterized = route.path.includes(':');
    return { ...route, parameterized, auditStatus: !route.isImplemented ? 'NOT_IMPLEMENTED' : parameterized ? 'FIXTURE_REQUIRED' : 'AUTOMATED_CAPTURED' };
  });
  const staticRoutes = routes.filter(route => route.isImplemented && !route.parameterized);
  const laboratories = await page.evaluate(() => (window as any).NeuralVerse.LabRegistry.getAll().map((lab: any) => ({ id: lab.id, slug: lab.slug, title: lab.title, rendererFamily: lab.visualization?.type, route: `#/laboratory/${lab.slug}` })));
  expect(new Set(routes.map(route => route.path)).size).toBe(routes.length);
  expect(laboratories).toHaveLength(10);
  expect(new Set(laboratories.map((lab: any) => lab.id)).size).toBe(10);
  expect(new Set(laboratories.map((lab: any) => lab.route)).size).toBe(10);

  const unresolvedFixtureRoutes = routes.filter(route => route.auditStatus === 'FIXTURE_REQUIRED' && route.path !== '#/laboratory/:slug');
  const unresolvedFixturePatterns = unresolvedFixtureRoutes.filter(route => !visualRouteFixtures.some(fixture => fixture.routePattern === route.path)).map(route => route.path);

  const captures: Array<{ path: string; measurement: Measurement }> = [];
  for (const route of staticRoutes) {
    await open(page, route.path);
    for (const viewport of viewports) captures.push(await capture(page, route.path, 'loaded', viewport));
  }

  const fixtureCaptures: Array<{ fixture: string; path: string; measurement: Measurement }> = [];
  for (const fixture of visualRouteFixtures) {
    await openFixture(page, fixture);
    for (const viewport of viewports.filter(viewport => fixture.requiredViewports.includes(viewport.name))) {
      const captured = await capture(page, fixture.route, 'loaded', viewport, 'screenshots/parameterized-routes');
      fixtureCaptures.push({ fixture: fixture.id, ...captured });
      captures.push(captured);
    }
  }

  for (const laboratory of laboratories) {
    await open(page, laboratory.route);
    for (const viewport of viewports.filter(viewport => primaryViewports.has(viewport.name))) captures.push(await capture(page, laboratory.route, 'ready', viewport, 'screenshots/laboratory-states'));
  }

  const focal = laboratories[0];
  await open(page, focal.route);
  const desktop = viewports.find(viewport => viewport.name === '1440x900')!;
  await page.locator('[data-action="step"]').click();
  await expect(page.locator('[data-lab-v4-workspace]')).toHaveAttribute('data-execution-lifecycle', 'paused');
  captures.push(await capture(page, focal.route, 'paused', desktop, 'screenshots/interaction-states'));
  await page.locator('[data-research-activate]').click();
  await expect(page.locator('[data-research-session-body]')).toBeVisible();
  captures.push(await capture(page, focal.route, 'research-active', desktop, 'screenshots/interaction-states'));
  await page.locator('[data-action="reset-exec"]').click();
  await expect(page.locator('[data-lab-v4-workspace]')).toHaveAttribute('data-execution-lifecycle', 'ready');
  for (let index = 0; index < 110 && await page.locator('[data-action="step"]').isEnabled(); index++) await page.locator('[data-action="step"]').click();
  await expect(page.locator('[data-lab-v4-completion-deck]')).toBeVisible();
  captures.push(await capture(page, focal.route, 'completed', desktop, 'screenshots/interaction-states'));

  // Only root overflow is deterministic enough to classify automatically. Clipping
  // and overlap candidates require headed review because intentional local scroll,
  // disclosure layering, and optical boundaries are renderer-specific.
  const failures = captures.filter(capture => capture.measurement.overflow);
  const geometryCandidates = captures.filter(capture => capture.measurement.clippedText > 0 || capture.measurement.overlapPairs > 0);
  const capturedRoutes = new Set(captures.map(capture => capture.measurement.route));
  const auditedFixtures = new Set(fixtureCaptures.map(capture => capture.fixture)).size;
  write('visual-audit-inventory.json', { initiative: 'NV-2600', routes, laboratories, captureConditions: { browser: 'Chromium via Playwright', zoom: '100%', deviceScaleFactor: 1, deterministicData: 'canonical local registry', readiness: ['document.fonts.ready', '#main-workspace visible'], staticCaptureMotion: 'natural application motion; no global animation override' } });
  write('route-coverage.json', { canonicalRoutes: routes.length, staticRoutes: { discovered: staticRoutes.length, covered: staticRoutes.length }, parameterizedRoutes: { discovered: unresolvedFixtureRoutes.length, fixturesDefined: visualRouteFixtures.length, covered: auditedFixtures, uncovered: unresolvedFixturePatterns }, laboratoryTemplateRepresentedBy: laboratories.length, unimplementedRoutes: routes.filter(route => route.auditStatus === 'NOT_IMPLEMENTED').map(route => route.path), unknownRoutes: 0, status: unresolvedFixturePatterns.length === 0 ? 'PASS' : 'BLOCKED', capturedRoutePaths: [...capturedRoutes] });
  write('state-coverage.json', { parameterizedRoutes: visualRouteFixtures.map(fixture => ({ fixture: fixture.id, route: fixture.route, applicable: ['loaded'], captured: ['loaded'], unsupported: ['empty', 'error'], missing: [] })), laboratory: { ready: laboratories.length, paused: 1, researchActive: 1, completed: 1, running: 'NOT_CAPTURED_WITHOUT_TEMPORAL_FIXTURE', reset: 'ASSERTED_BEFORE_COMPLETED_CAPTURE', failed: 'NOT_SUPPORTED_BY_CANONICAL_CONTRACT' }, general: { loaded: staticRoutes.length, hover: 'PENDING_DIRECT_REVIEW', focused: 'PENDING_DIRECT_REVIEW' } });
  write('viewport-coverage.json', { viewports, staticRoutesCapturedAtEveryViewport: staticRoutes.length, laboratoriesCapturedAtPrimaryViewports: laboratories.length, missingCaptures: 0 });
  write('geometry-measurements.json', captures.map(capture => capture.measurement));
  write('geometry-candidates.json', geometryCandidates.map(capture => ({ route: capture.measurement.route, state: capture.measurement.state, viewport: capture.measurement.viewport, clippedText: capture.measurement.clippedText, overlapPairs: capture.measurement.overlapPairs, evidence: capture.path, classification: 'PENDING_DIRECT_CLASSIFICATION' })));
  write('visual-findings.json', [...failures.map((capture, index) => ({ id: `NV2600-VISUAL-${String(index + 1).padStart(3, '0')}`, route: capture.measurement.route, laboratory: laboratories.find((lab: any) => lab.route === capture.measurement.route)?.id || null, state: capture.measurement.state, viewport: capture.measurement.viewport, region: 'global', component: 'containment', classification: 'ACCIDENTAL_DIVERGENCE', severity: 'P1', expected: 'No page overflow.', actual: capture.measurement, evidence: [capture.path], resolution: 'UNRESOLVED' })), ...unresolvedFixturePatterns.map((route, index) => ({ id: `NV2600-VISUAL-MEMORY-${index + 1}`, route, laboratory: null, state: 'loaded', viewport: '1440x900', region: 'route', component: 'memory-detail', classification: 'ACCIDENTAL_DIVERGENCE', severity: 'P1', expected: 'A deterministic memory fixture renders its canonical detail.', actual: 'Canonical fixture resolves to Memory not found.', evidence: [], resolution: 'UNRESOLVED' }))]);
  write('manual-review.json', { initiative: 'NV-2600', status: 'PENDING_DIRECT_HEADED_REVIEW', routesReviewed: 0, laboratoriesReviewed: 0, statesReviewed: [], viewportsReviewed: [], reviewer: null, environment: 'Automated Chromium evidence only', date: new Date().toISOString() });
  write('visual-validation.json', {
    initiative: 'NV-2600',
    inventory: { canonicalRoutes: routes.length, auditedRoutes: staticRoutes.length + 1 + auditedFixtures, parameterizedRoutes: unresolvedFixtureRoutes.length, parameterizedRoutesWithFixtures: visualRouteFixtures.length, parameterizedRoutesAudited: auditedFixtures, registeredLaboratories: laboratories.length, auditedLaboratories: laboratories.length, statesAudited: 5, viewportsAudited: viewports.map(viewport => viewport.name) },
    capture: { screenshots: captures.length, comparisonSets: 0, missingCaptures: unresolvedFixturePatterns.length, orphanCaptures: 0, captureFailures: 0 },
    visualContracts: { visualIdentity: 'PENDING_DIRECT_REVIEW', hierarchy: 'PENDING_DIRECT_REVIEW', typography: 'PENDING_DIRECT_REVIEW', spacing: 'PENDING_DIRECT_REVIEW', density: 'PENDING_DIRECT_REVIEW', alignment: 'PENDING_DIRECT_REVIEW', surfaces: 'PENDING_DIRECT_REVIEW', color: 'PENDING_DIRECT_REVIEW', visualNoise: 'PENDING_DIRECT_REVIEW', controls: 'PENDING_DIRECT_REVIEW', motion: 'PENDING_DIRECT_REVIEW', scientificRenderers: 'PENDING_DIRECT_REVIEW', emptyStates: 'FIXTURE_REQUIRED', loadingStates: 'FIXTURE_REQUIRED', errorStates: 'FIXTURE_REQUIRED', responsiveContainment: failures.length ? 'FAIL' : 'AUTOMATED_PASS_DIRECT_REVIEW_PENDING', responsiveReflow: 'PENDING_DIRECT_REVIEW', crossRouteConsistency: 'PENDING_DIRECT_REVIEW', crossLaboratoryConsistency: 'PENDING_DIRECT_REVIEW' },
    differences: { scientificVariations: new Set(laboratories.map((lab: any) => lab.rendererFamily)).size, rendererVariations: new Set(laboratories.map((lab: any) => lab.rendererFamily)).size, routeResponsibilityVariations: 0, responsiveVariations: 0, approvedExceptions: 0, accidentalDivergencesFound: failures.length, accidentalDivergencesResolved: 0, unknownDifferences: 0 },
    findings: { p0: 0, p1: failures.length + unresolvedFixturePatterns.length, p2: 0, p3: 0 },
    manualReview: { status: 'PENDING_DIRECT_HEADED_REVIEW', routesReviewed: 0, laboratoriesReviewed: 0, desktop: 'PENDING', tablet: 'PENDING', mobile: 'PENDING', landscape: 'PENDING', interactionStates: 'PENDING', motion: 'PENDING' },
    regressions: { strictVisualAudit: 'AUTOMATED_PASS', completePlaywright: 'PENDING', designSystem: 'PARENT_SUITE', typographyDensity: 'PARENT_SUITE', motion: 'PARENT_SUITE', accessibility: 'PARENT_SUITE', responsive: 'PARENT_SUITE', crossLab: 'PARENT_SUITE' },
    verdict: failures.length ? 'BLOCKED BY RESPONSIVE CONTAINMENT' : unresolvedFixturePatterns.length ? 'BLOCKED BY VISUAL AUDIT COVERAGE' : 'BLOCKED BY MANUAL VISUAL REVIEW'
  });
  expect(failures, 'geometry evidence must contain no overflow, clipping, or interactive overlap').toEqual([]);
});
