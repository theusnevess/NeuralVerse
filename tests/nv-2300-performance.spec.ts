import { expect, test } from './fixtures/playwright-runtime-observability';
import { mkdirSync, writeFileSync } from 'node:fs';

const laboratories = ['gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection', 'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention'];

async function open(page: any, laboratory: string) {
  const started = performance.now();
  await page.goto(`/index.html?performance=${laboratory}#/laboratory/${laboratory}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-lab-v4-workspace]')).toBeVisible();
  await expect(page.locator('[data-action="run"]')).toBeEnabled();
  return performance.now() - started;
}

async function installResourceTracker(page: any) {
  await page.addInitScript(() => {
    const state = { timeouts: new Set<number>(), intervals: new Set<number>(), rafs: new Set<number>(), listeners: new Set<string>(), observerInstances: new WeakSet(), observers: { resize: 0, intersection: 0, mutation: 0 }, objectUrls: new Set<string>(), objectUrlsCreated: 0, objectUrlsRevoked: 0, longTasks: [] as number[], longTaskSupported: false };
    const timeout = window.setTimeout.bind(window);
    const interval = window.setInterval.bind(window);
    const raf = window.requestAnimationFrame.bind(window);
    const cancelTimeout = window.clearTimeout.bind(window);
    const cancelInterval = window.clearInterval.bind(window);
    const cancelRaf = window.cancelAnimationFrame.bind(window);
    window.setTimeout = ((callback: TimerHandler, delay?: number, ...args: any[]) => { const id = timeout(() => { state.timeouts.delete(id); typeof callback === 'function' ? callback(...args) : Function(callback)(); }, delay); state.timeouts.add(id); return id; }) as typeof window.setTimeout;
    window.setInterval = ((callback: TimerHandler, delay?: number, ...args: any[]) => { const id = interval(callback, delay, ...args); state.intervals.add(id); return id; }) as typeof window.setInterval;
    window.requestAnimationFrame = ((callback: FrameRequestCallback) => { const id = raf(time => { state.rafs.delete(id); callback(time); }); state.rafs.add(id); return id; }) as typeof window.requestAnimationFrame;
    window.clearTimeout = ((id?: number) => { if (id !== undefined) state.timeouts.delete(id); return cancelTimeout(id); }) as typeof window.clearTimeout;
    window.clearInterval = ((id?: number) => { if (id !== undefined) state.intervals.delete(id); return cancelInterval(id); }) as typeof window.clearInterval;
    window.cancelAnimationFrame = ((id: number) => { state.rafs.delete(id); return cancelRaf(id); }) as typeof window.cancelAnimationFrame;
    const listen = EventTarget.prototype.addEventListener;
    const unlisten = EventTarget.prototype.removeEventListener;
    const listenerKey = (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null) => `${type}:${String(listener)}:${target === window ? 'window' : target === document ? 'document' : (target as Element).tagName || 'other'}`;
    EventTarget.prototype.addEventListener = function (type, listener, ...args) { if (listener) state.listeners.add(listenerKey(this, type, listener)); return listen.call(this, type, listener, ...args); };
    EventTarget.prototype.removeEventListener = function (type, listener, ...args) { if (listener) state.listeners.delete(listenerKey(this, type, listener)); return unlisten.call(this, type, listener, ...args); };
    for (const [name, key] of [['ResizeObserver', 'resize'], ['IntersectionObserver', 'intersection'], ['MutationObserver', 'mutation']] as const) {
      const Original = (window as any)[name];
      if (!Original) continue;
      (window as any)[name] = class extends Original { constructor(...args: any[]) { super(...args); state.observerInstances.add(this); state.observers[key]++; } disconnect() { if (state.observerInstances.delete(this)) state.observers[key]--; return super.disconnect(); } };
    }
    const createObjectURL = URL.createObjectURL.bind(URL);
    const revokeObjectURL = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (value: Blob | MediaSource) => { const url = createObjectURL(value); state.objectUrls.add(url); state.objectUrlsCreated++; return url; };
    URL.revokeObjectURL = url => { if (state.objectUrls.delete(url)) state.objectUrlsRevoked++; return revokeObjectURL(url); };
    if (window.PerformanceObserver && PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      state.longTaskSupported = true;
      new PerformanceObserver(list => list.getEntries().forEach(entry => state.longTasks.push(entry.duration))).observe({ type: 'longtask', buffered: true });
    }
    (window as any).__nvPerformanceResources = () => ({ timeouts: state.timeouts.size, intervals: state.intervals.size, rafs: state.rafs.size, listeners: state.listeners.size, objectUrls: state.objectUrls.size, objectUrlsCreated: state.objectUrlsCreated, objectUrlsRevoked: state.objectUrlsRevoked, longTaskSupported: state.longTaskSupported, longTaskCount: state.longTasks.length, maxLongTaskMs: Math.max(0, ...state.longTasks), ...state.observers, nodes: document.querySelectorAll('*').length });
  });
}

function writeEndurance(name: string, value: unknown) {
  mkdirSync('artifacts/nv-2300-performance/endurance', { recursive: true });
  writeFileSync(`artifacts/nv-2300-performance/endurance/${name}`, JSON.stringify(value, null, 2));
}

test('all laboratories reach a bounded canonical ready state', async ({ page }) => {
  for (const laboratory of laboratories) {
    const duration = await open(page, laboratory);
    expect(duration, `${laboratory} readiness`).toBeLessThan(10_000);
    const snapshot = await page.locator('[data-lab-v4-workspace]').evaluate(workspace => ({
      nodes: workspace.querySelectorAll('*').length,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      running: workspace.getAttribute('data-execution-lifecycle')
    }));
    expect(snapshot.nodes, `${laboratory} DOM`).toBeGreaterThan(0);
    expect(snapshot.overflow, `${laboratory} overflow`).toBe(false);
    expect(snapshot.running, `${laboratory} lifecycle`).toBe('ready');
  }
});

test('execution controls acknowledge canonical state and Reset releases transient UI', async ({ page }) => {
  await open(page, 'gradient-descent');
  const workspace = page.locator('[data-lab-v4-workspace]');
  const step = page.locator('[data-action="step"]');
  const reset = page.locator('[data-action="reset-exec"]');

  const started = performance.now();
  await step.click();
  await expect(workspace).toHaveAttribute('data-execution-lifecycle', 'paused');
  expect(performance.now() - started).toBeLessThan(1_000);

  await reset.click();
  await expect(workspace).toHaveAttribute('data-execution-lifecycle', 'ready');
  await expect(page.locator('[data-lab-v4-completion-deck]')).toHaveCount(0);
});

test('resize preserves mounted scientific state without page overflow', async ({ page }) => {
  await open(page, 'kmeans-clustering');
  await page.locator('[data-action="step"]').click();
  await expect(page.locator('[data-lab-v4-workspace]')).toHaveAttribute('data-execution-lifecycle', 'paused');
  for (const viewport of [{ width: 1024, height: 768 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    const state = await page.locator('[data-lab-v4-workspace]').evaluate(workspace => ({
      lifecycle: workspace.getAttribute('data-execution-lifecycle'),
      overflow: document.documentElement.scrollWidth > innerWidth + 1
    }));
    expect(state.lifecycle).toBe('paused');
    expect(state.overflow).toBe(false);
  }
});

test('Scientific Stage replaces its accessible summary on repeated snapshots', async ({ page }) => {
  await open(page, 'gradient-descent');
  for (let step = 0; step < 3; step++) {
    await page.locator('[data-action="step"]').click();
  }
  const summaries = page.locator('[data-scientific-stage-summary]');
  await expect(summaries).toHaveCount(1);
  await expect(summaries).toBeVisible();
});

test('ten execution cycles return transient resources to the mounted baseline', async ({ page }) => {
  await installResourceTracker(page);
  await open(page, 'gradient-descent');
  const baseline = await page.evaluate(() => (window as any).__nvPerformanceResources());
  const cycles: any[] = [];
  let postResetBaseline: any = null;
  for (let cycle = 0; cycle < 10; cycle++) {
    await page.locator('[data-action="step"]').click();
    await expect(page.locator('[data-lab-v4-workspace]')).toHaveAttribute('data-execution-lifecycle', 'paused');
    await page.locator('[data-action="reset-exec"]').click();
    await expect(page.locator('[data-lab-v4-workspace]')).toHaveAttribute('data-execution-lifecycle', 'ready');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const sample = await page.evaluate(() => (window as any).__nvPerformanceResources());
    cycles.push(sample);
    if (!postResetBaseline) postResetBaseline = sample;
    expect(sample.intervals).toBeLessThanOrEqual(baseline.intervals);
    expect(sample.rafs).toBeLessThanOrEqual(baseline.rafs);
    expect(sample.timeouts).toBeLessThanOrEqual(baseline.timeouts);
    expect(sample.nodes).toBeLessThanOrEqual(postResetBaseline.nodes + 5);
  }
  writeEndurance('execution-cycles.json', { baseline, postResetBaseline, cycles });
  expect(Math.max(...cycles.map(sample => sample.nodes)) - Math.min(...cycles.map(sample => sample.nodes))).toBeLessThanOrEqual(5);
});

test('route switching retains one mounted Laboratory resource baseline', async ({ page }) => {
  await installResourceTracker(page);
  const samples: any[] = [];
  for (let cycle = 0; cycle < 2; cycle++) {
    for (const laboratory of laboratories) {
      await open(page, laboratory);
      samples.push({ laboratory, cycle, resources: await page.evaluate(() => (window as any).__nvPerformanceResources()) });
    }
  }
  for (const laboratory of laboratories) {
    const first = samples.find(sample => sample.laboratory === laboratory && sample.cycle === 0).resources;
    const second = samples.find(sample => sample.laboratory === laboratory && sample.cycle === 1).resources;
    expect(second.intervals, `${laboratory} interval baseline`).toBe(first.intervals);
    expect(second.rafs, `${laboratory} RAF baseline`).toBe(first.rafs);
    expect(second.listeners, `${laboratory} live listener baseline`).toBe(first.listeners);
    expect(second.resize, `${laboratory} ResizeObserver baseline`).toBe(first.resize);
    expect(second.intersection, `${laboratory} IntersectionObserver baseline`).toBe(first.intersection);
    expect(second.mutation, `${laboratory} MutationObserver baseline`).toBe(first.mutation);
    expect(second.nodes, `${laboratory} DOM baseline`).toBeLessThanOrEqual(first.nodes + 5);
  }
  writeEndurance('route-switch-cycles.json', { cycles: 2, samples });
});

test('canonical Research model scales deterministic immutable profiles through 25 runs', async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('nv_research_sessions'));
  await open(page, 'gradient-descent');
  const profiles = await page.evaluate(() => {
    const lab = window.NeuralVerse.LabRegistry.getBySlug('gradient-descent');
    const results: any[] = [];
    for (const count of [1, 2, 10, 25]) {
      window.NeuralVerse.ResearchMode.exit();
      const started = performance.now();
      window.NeuralVerse.ResearchMode.activate(lab);
      window.NeuralVerse.ResearchMode.update({ researchQuestion: 'Deterministic research question', hypothesis: { statement: 'Deterministic hypothesis', rationale: 'Measured profile', status: 'inconclusive' }, limitations: ['Controlled test limitation'], conclusion: 'Deterministic conclusion' });
      window.NeuralVerse.ResearchMode.transition('active');
      for (let index = 0; index < count; index++) {
        const run = window.NeuralVerse.ResearchMode.beginRun(lab, { learningRate: index + 1 });
        window.NeuralVerse.ResearchMode.finishRun('completed', { outcome: index }, [{ label: 'Loss', value: index }]);
        window.NeuralVerse.ResearchMode.captureEvidence({ sourceId: `profile-${count}-run-${index}`, category: 'Stage evidence', scientificSummary: `Deterministic evidence ${index}`, measurements: { loss: index }, provenance: { source: 'Performance test', sourceSteps: [index] } });
        window.NeuralVerse.ResearchMode.addObservation(`Observation ${index}`, [], index);
        window.NeuralVerse.ResearchMode.addInterpretation(`Interpretation ${index}`, [], index);
        if (index === 1) window.NeuralVerse.ResearchMode.compare([window.NeuralVerse.ResearchMode.getSession().runs[0].runId, run.runId]);
      }
      const session = window.NeuralVerse.ResearchMode.getSession();
      const json = window.NeuralVerse.ResearchMode.export('json');
      const markdown = window.NeuralVerse.ResearchMode.export('markdown');
      results.push({ count, durationMs: performance.now() - started, runs: session.runs.length, evidence: session.capturedEvidence.length, observations: session.observations.length, interpretations: session.interpretations.length, payloadBytes: json.length, markdownBytes: markdown.length, persisted: window.NeuralVerse.ResearchStorage.getSession(lab.id, session.id) !== null, uniqueRunIds: new Set(session.runs.map((run: any) => run.runId)).size });
    }
    return results;
  });
  for (const profile of profiles) {
    expect(profile.runs).toBe(profile.count);
    expect(profile.evidence).toBe(profile.count);
    expect(profile.observations).toBe(profile.count);
    expect(profile.interpretations).toBe(profile.count);
    expect(profile.uniqueRunIds).toBe(profile.count);
    expect(profile.persisted, `Research profile ${profile.count}: ${JSON.stringify(profile)}`).toBe(true);
    expect(profile.payloadBytes).toBeGreaterThan(0);
    expect(profile.markdownBytes).toBeGreaterThan(0);
  }
  writeEndurance('research-scaling.json', { profiles });
});

test('ResearchStorage and unified StorageAdapter share one durable local backend', async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('nv_research_sessions'));
  await open(page, 'gradient-descent');
  const coherence = await page.evaluate(async () => {
    const lab = window.NeuralVerse.LabRegistry.getBySlug('gradient-descent');
    window.NeuralVerse.ResearchMode.activate(lab);
    const session = window.NeuralVerse.ResearchMode.getSession();
    window.NeuralVerse.ResearchMode.update({ researchQuestion: 'Coherent storage path' });
    const key = 'nv_research_sessions';
    const unifiedRaw = await window.NeuralVerse.StorageAdapter.getItem(key);
    const direct = window.NeuralVerse.ResearchStorage.getSession(lab.id, session.id);
    window.NeuralVerse.ResearchStorage.deleteSession(lab.id, session.id);
    const afterRemoveRaw = await window.NeuralVerse.StorageAdapter.getItem(key);
    const afterRemove = window.NeuralVerse.ResearchStorage.getSession(lab.id, session.id);
    return { key, direct, unifiedHasSession: String(unifiedRaw).includes(session.id), afterRemove, unifiedRemoved: !String(afterRemoveRaw || '').includes(session.id) };
  });
  expect(coherence.direct?.id).toBeTruthy();
  expect(coherence.unifiedHasSession).toBe(true);
  expect(coherence.afterRemove).toBeNull();
  expect(coherence.unifiedRemoved).toBe(true);
  writeEndurance('storage-coherence.json', { key: coherence.key, sameBackend: true, sameNamespace: true, removeSymmetric: true });
});

test('ResearchStorage restores semantically equivalent deterministic sessions through 25 runs', async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('nv_research_sessions'));
  await open(page, 'gradient-descent');
  const profiles = await page.evaluate(() => {
    const lab = window.NeuralVerse.LabRegistry.getBySlug('gradient-descent');
    return [1, 2, 10, 25].map(count => {
      window.NeuralVerse.ResearchMode.exit();
      window.NeuralVerse.ResearchMode.activate(lab);
      window.NeuralVerse.ResearchMode.update({ researchQuestion: `Restore ${count}`, hypothesis: { statement: 'Stable', rationale: 'Deterministic', status: 'inconclusive' }, limitations: ['Test limitation'], conclusion: 'Test conclusion' });
      window.NeuralVerse.ResearchMode.transition('active');
      for (let index = 0; index < count; index++) {
        window.NeuralVerse.ResearchMode.beginRun(lab, { learningRate: index });
        window.NeuralVerse.ResearchMode.finishRun('completed', { outcome: index }, [{ label: 'Loss', value: index }]);
        window.NeuralVerse.ResearchMode.captureEvidence({ sourceId: `restore-${count}-${index}`, category: 'Stage', scientificSummary: `Evidence ${index}`, measurements: { loss: index }, provenance: { source: 'Performance', sourceSteps: [index] } });
        window.NeuralVerse.ResearchMode.addObservation(`Observation ${index}`, [], index);
        window.NeuralVerse.ResearchMode.addInterpretation(`Interpretation ${index}`, [], index);
      }
      const source = JSON.parse(JSON.stringify(window.NeuralVerse.ResearchMode.getSession()));
      const restored = window.NeuralVerse.ResearchStorage.getSession(lab.id, source.id);
      return { count, equivalent: JSON.stringify(source) === JSON.stringify(restored), runIds: restored.runs.map((run: any) => run.runId), evidence: restored.capturedEvidence.length, exportedJson: window.NeuralVerse.ResearchMode.export('json').includes(source.id), exportedMarkdown: window.NeuralVerse.ResearchMode.export('markdown').includes(source.title) };
    });
  });
  for (const profile of profiles) {
    expect(profile.equivalent).toBe(true);
    expect(profile.runIds).toHaveLength(profile.count);
    expect(new Set(profile.runIds).size).toBe(profile.count);
    expect(profile.evidence).toBe(profile.count);
    expect(profile.exportedJson).toBe(true);
    expect(profile.exportedMarkdown).toBe(true);
  }
  writeEndurance('restoration-results.json', { profiles, duplicateRuns: 0, duplicateEvidence: 0 });
});

test('restored Research sessions hydrate each lifecycle state and preserve prior runs through mutation', async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('nv_research_sessions'));
  await open(page, 'gradient-descent');
  const states = ['draft', 'active', 'review', 'completed'] as const;
  const hydrated: any[] = [];
  for (const state of states) {
    const source = await page.evaluate(targetState => {
      const lab = window.NeuralVerse.LabRegistry.getBySlug('gradient-descent');
      window.NeuralVerse.ResearchMode.activate(lab);
      window.NeuralVerse.ResearchMode.update({ title: `Restored ${targetState}`, researchQuestion: 'Does restoration retain canonical state?', hypothesis: { statement: 'State remains canonical', rationale: 'Deterministic restoration', status: 'inconclusive' }, limitations: ['Browser-local only'], conclusion: 'The session restored.' });
      if (targetState !== 'draft') window.NeuralVerse.ResearchMode.transition('active');
      if (targetState === 'completed') {
        window.NeuralVerse.ResearchMode.beginRun(lab, { learningRate: 0.1 });
        window.NeuralVerse.ResearchMode.finishRun('completed', { outcome: 1 }, [{ label: 'Loss', value: 1 }]);
        window.NeuralVerse.ResearchMode.captureEvidence({ sourceId: `lifecycle-${targetState}`, category: 'Stage', scientificSummary: 'Restored evidence', measurements: {}, provenance: { source: 'NV-2300', sourceSteps: [1] } });
        window.NeuralVerse.ResearchMode.transition('review');
        window.NeuralVerse.ResearchMode.transition('completed');
      } else if (targetState === 'review') {
        window.NeuralVerse.ResearchMode.transition('review');
      }
      const session = JSON.parse(JSON.stringify(window.NeuralVerse.ResearchMode.getSession()));
      window.NeuralVerse.ResearchMode.exit();
      return session;
    }, state);
    const restored = await page.locator('[data-research-restore]').evaluate((button: HTMLButtonElement) => { button.click(); return { active: window.NeuralVerse.ResearchMode.isActive(), available: window.NeuralVerse.ResearchStorage.getSessionsForLab(window.NeuralVerse.LabRegistry.getBySlug('gradient-descent').id).length }; });
    expect(restored.active).toBe(true);
    expect(restored.available).toBeGreaterThan(0);
    const view = await page.evaluate(() => ({ state: window.NeuralVerse.ResearchMode.getSession().state, title: (document.querySelector('[data-research-title]') as HTMLInputElement).value, question: (document.querySelector('[data-research-question]') as HTMLTextAreaElement).value, runs: document.querySelectorAll('[data-research-run-id]').length }));
    expect(view).toEqual({ state, title: source.title, question: source.researchQuestion, runs: source.runs.length });
    hydrated.push(view);
    if (state === 'completed') {
      await page.locator('[data-research-reopen]').click();
      await expect.poll(() => page.evaluate(() => window.NeuralVerse.ResearchMode.getSession().state)).toBe('active');
    }
    await page.evaluate(() => window.NeuralVerse.ResearchMode.exit());
  }
  writeEndurance('restored-lifecycle-hydration.json', { states: hydrated.map(item => item.state), reopened: true });
});

test('a restored 25-run Research session exports canonical content and appends an immutable run 26', async ({ page }) => {
  await installResourceTracker(page);
  await page.addInitScript(() => localStorage.removeItem('nv_research_sessions'));
  await open(page, 'gradient-descent');
  const original = await page.evaluate(() => {
    const lab = window.NeuralVerse.LabRegistry.getBySlug('gradient-descent');
    window.NeuralVerse.ResearchMode.activate(lab);
    window.NeuralVerse.ResearchMode.update({ title: 'Restored endurance', researchQuestion: 'Do restored runs remain immutable?', hypothesis: { statement: 'Prior snapshots remain unchanged', rationale: 'Append-only runs', status: 'inconclusive' }, limitations: ['Browser-local only'], conclusion: 'Prior runs persisted.' });
    window.NeuralVerse.ResearchMode.transition('active');
    for (let index = 0; index < 25; index++) {
      window.NeuralVerse.ResearchMode.beginRun(lab, { learningRate: index + 1 });
      window.NeuralVerse.ResearchMode.finishRun('completed', { outcome: index }, [{ label: 'Loss', value: index }]);
    }
    const session = JSON.parse(JSON.stringify(window.NeuralVerse.ResearchMode.getSession()));
    window.NeuralVerse.ResearchMode.exit();
    return session;
  });
  const restored = await page.locator('[data-research-restore]').evaluate((button: HTMLButtonElement) => { button.click(); return window.NeuralVerse.ResearchMode.isActive(); });
  expect(restored).toBe(true);
  const result = await page.evaluate(() => {
    const lab = window.NeuralVerse.LabRegistry.getBySlug('gradient-descent');
    const before = JSON.parse(JSON.stringify(window.NeuralVerse.ResearchMode.getSession().runs));
    window.NeuralVerse.ResearchMode.beginRun(lab, { learningRate: 26 });
    window.NeuralVerse.ResearchMode.finishRun('completed', { outcome: 26 }, [{ label: 'Loss', value: 26 }]);
    const session = window.NeuralVerse.ResearchMode.getSession();
    return { runs: session.runs.length, originalUnchanged: JSON.stringify(before) === JSON.stringify(session.runs.slice(0, 25)), persistedRuns: window.NeuralVerse.ResearchStorage.getSession(lab.id, session.id).runs.length, json: window.NeuralVerse.ResearchMode.export('json'), markdown: window.NeuralVerse.ResearchMode.export('markdown') };
  });
  await page.locator('[data-research-export="json"]').click();
  await page.locator('[data-research-export="markdown"]').click();
  const resources = await page.evaluate(() => (window as any).__nvPerformanceResources());
  expect(original.runs).toHaveLength(25);
  expect(result.runs).toBe(26);
  expect(result.originalUnchanged).toBe(true);
  expect(result.persistedRuns).toBe(26);
  expect(result.json).toContain('Restored endurance');
  expect(result.markdown).toContain('Restored endurance');
  expect(resources.objectUrlsCreated).toBe(2);
  expect(resources.objectUrlsRevoked).toBe(2);
  expect(resources.objectUrls).toBe(0);
  writeEndurance('restored-mutation-and-export.json', { runsBefore: original.runs.length, runsAfter: result.runs, originalUnchanged: result.originalUnchanged, persistedRuns: result.persistedRuns, objectUrls: resources });
});

test('three route sweeps retain bounded heap use and avoid critical interaction long tasks', async ({ page }) => {
  await installResourceTracker(page);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('HeapProfiler.enable');
  const samples: any[] = [];
  const longTasks: any[] = [];
  for (let sweep = 0; sweep < 3; sweep++) {
    for (const laboratory of laboratories) {
      await open(page, laboratory);
      await page.locator('[data-action="step"]').click();
      await page.locator('[data-action="reset-exec"]').click();
      longTasks.push({ sweep, laboratory, ...(await page.evaluate(() => (window as any).__nvPerformanceResources())) });
    }
    await cdp.send('HeapProfiler.collectGarbage');
    const heap = await cdp.send('Runtime.getHeapUsage') as { usedSize: number; totalSize: number };
    samples.push({ sweep, usedSize: heap.usedSize, totalSize: heap.totalSize });
  }
  await cdp.detach();
  const baseline = samples[0].usedSize;
  const maximum = Math.max(...samples.map(sample => sample.usedSize));
  const maxLongTaskMs = Math.max(...longTasks.map(sample => sample.maxLongTaskMs));
  expect(longTasks.every(sample => sample.longTaskSupported)).toBe(true);
  expect(maximum, `heap samples: ${JSON.stringify(samples)}`).toBeLessThanOrEqual(baseline * 1.35 + 5 * 1024 * 1024);
  expect(maxLongTaskMs, `long-task samples: ${JSON.stringify(longTasks)}`).toBeLessThanOrEqual(200);
  writeEndurance('memory-and-long-tasks.json', { sweeps: 3, heapSamples: samples, heapBaselineBytes: baseline, heapMaximumBytes: maximum, heapGrowthRatio: maximum / baseline, longTaskSamples: longTasks, maxLongTaskMs, thresholdMs: 200 });
});
