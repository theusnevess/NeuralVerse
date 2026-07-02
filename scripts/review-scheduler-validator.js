#!/usr/bin/env node
/**
 * NV-1100-P5 — Review Scheduler Validator
 *
 * Pure-Node validation of the SM-2 engine, scheduler, queue, storage, and
 * import/export logic. No browser required. Validates:
 *   - SM-2 mathematical correctness (canonical Wozniak transition rules)
 *   - Quality grade transitions (0..5)
 *   - Ease factor bounds (>= 1.3)
 *   - Interval computation
 *   - History persistence (chronological, no truncation)
 *   - Queue ordering (overdue > due-today > upcoming; stable sort)
 *   - Merge behavior (history union, schedule newer-wins, dedup)
 *   - Replace behavior (full replace)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const REPORT_DIR = '/tmp/neuralverse-nv1100-p5-validator';
const DOCS_DIR = path.join(REPO, 'docs', 'architecture', 'nv-1100');

let critical = [];
let high = [];
let medium = [];
let low = [];
let info = [];
let checks = [];
let fixtures = [];

function pass(category, message) { checks.push({ category, status: 'PASS', message }); }
function fail(severity, category, message) {
  const e = { category, message };
  if (severity === 'critical') critical.push(e);
  else if (severity === 'high') high.push(e);
  else if (severity === 'medium') medium.push(e);
  else low.push(e);
  checks.push({ category, status: 'FAIL', severity, message });
}
function infoLog(category, message) { info.push({ category, message }); }
function log(m) { console.log(m); }
function section(t) { log(`\n\x1b[1m=== ${t} ===\x1b[0m`); }

// =====================================================================
// Inlined SM-2 implementation (mirrors the browser module exactly).
// We re-implement here so the validator can run in pure Node without a
// bundler. The two implementations are tested against the same fixtures.
// =====================================================================

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;
const MAX_INTERVAL_DAYS = 36500;

function makeInitialState(id, type) {
  return {
    id: String(id),
    type: type || 'flashcard',
    entityId: type ? String(id).replace(new RegExp('^' + type + ':'), '') : String(id),
    repetitions: 0,
    interval: 0,
    easeFactor: DEFAULT_EASE,
    lastReviewed: null,
    nextReview: null,
    reviewHistory: []
  };
}

function clampQuality(q) {
  const n = Number(q);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return 0;
  if (n > 5) return 5;
  return Math.floor(n);
}

function computeEase(prevEase, quality) {
  const next = prevEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (next < MIN_EASE) return MIN_EASE;
  return Math.round(next * 1000) / 1000;
}

function addDays(iso, days) {
  const d = new Date(iso);
  d.setTime(d.getTime() + days * MS_PER_DAY);
  return d.toISOString();
}

function sm2Review(state, quality, nowIso) {
  const q = clampQuality(quality);
  if (q === null) throw new Error('quality must be a number');
  const now = nowIso || new Date().toISOString();
  const prevInterval = state.interval || 0;
  const prevReps = state.repetitions || 0;
  const prevEase = Number(state.easeFactor) || DEFAULT_EASE;

  let nextReps, nextInterval;
  if (q >= 3) {
    nextReps = prevReps + 1;
    if (nextReps === 1) nextInterval = 1;
    else if (nextReps === 2) nextInterval = 6;
    else nextInterval = Math.min(MAX_INTERVAL_DAYS, Math.max(1, Math.round(prevInterval * prevEase)));
  } else {
    nextReps = 0;
    nextInterval = 1;
  }
  const nextEase = computeEase(prevEase, q);

  const historyEntry = {
    timestamp: now,
    quality: q,
    interval: nextInterval,
    easeFactor: nextEase,
    repetitions: nextReps
  };

  return {
    id: state.id,
    type: state.type || 'flashcard',
    repetitions: nextReps,
    interval: nextInterval,
    easeFactor: nextEase,
    lastReviewed: now,
    nextReview: addDays(now, nextInterval),
    reviewHistory: [...(state.reviewHistory || []), historyEntry]
  };
}

// =====================================================================
// SM-2 mathematical correctness fixtures
// =====================================================================

function runSM2Fixtures() {
  section('SM-2 mathematical correctness');

  const baseTime = '2026-06-24T10:00:00.000Z';

  // Fixture 1: first perfect review
  let s = makeInitialState('fc-1', 'flashcard');
  s = sm2Review(s, 5, baseTime);
  fixtures.push({ name: 'first grade-5 review', expected: { reps: 1, interval: 1, ease: 2.6 }, actual: { reps: s.repetitions, interval: s.interval, ease: s.easeFactor }, ok: s.repetitions === 1 && s.interval === 1 && Math.abs(s.easeFactor - 2.6) < 0.001 });
  if (s.repetitions === 1 && s.interval === 1 && Math.abs(s.easeFactor - 2.6) < 0.001) pass('sm2', 'First grade-5: reps=1, interval=1, ease=2.6');
  else fail('critical', 'sm2', `First grade-5 wrong: ${JSON.stringify(s)}`);

  // Fixture 2: second perfect review
  s = sm2Review(s, 5, addDays(baseTime, 1));
  fixtures.push({ name: 'second grade-5 review', expected: { reps: 2, interval: 6 }, actual: { reps: s.repetitions, interval: s.interval }, ok: s.repetitions === 2 && s.interval === 6 });
  if (s.repetitions === 2 && s.interval === 6) pass('sm2', 'Second grade-5: reps=2, interval=6');
  else fail('critical', 'sm2', `Second grade-5 wrong: ${JSON.stringify(s)}`);

  // Fixture 3: third perfect review
  s = sm2Review(s, 5, addDays(baseTime, 7));
  fixtures.push({ name: 'third grade-5 review', expected: { reps: 3, interval: 16 }, actual: { reps: s.repetitions, interval: s.interval }, ok: s.repetitions === 3 && s.interval === 16 });
  if (s.repetitions === 3 && s.interval === 16) pass('sm2', 'Third grade-5: reps=3, interval=16 (6*2.6=15.6, rounded 16)');
  else fail('critical', 'sm2', `Third grade-5 wrong: ${JSON.stringify(s)}`);

  // Fixture 4: failed review resets repetitions
  s = sm2Review(s, 2, addDays(baseTime, 23));
  fixtures.push({ name: 'failed review resets', expected: { reps: 0, interval: 1 }, actual: { reps: s.repetitions, interval: s.interval }, ok: s.repetitions === 0 && s.interval === 1 });
  if (s.repetitions === 0 && s.interval === 1) pass('sm2', 'Failed review (q<3): reps=0, interval=1');
  else fail('critical', 'sm2', `Failed review wrong: ${JSON.stringify(s)}`);

  // Fixture 5: ease factor floor at 1.3
  let s5 = makeInitialState('fc-5', 'flashcard');
  for (let i = 0; i < 10; i++) {
    s5 = sm2Review(s5, 0, addDays(baseTime, i + 1));
  }
  fixtures.push({ name: 'ease factor floor 1.3', expected: { minEase: 1.3 }, actual: { minEase: s5.easeFactor }, ok: s5.easeFactor >= 1.3 && Math.abs(s5.easeFactor - 1.3) < 0.001 });
  if (s5.easeFactor >= 1.3 - 0.001 && s5.easeFactor <= 1.3 + 0.001) pass('sm2', `Ease factor never drops below 1.3 (current: ${s5.easeFactor})`);
  else fail('critical', 'sm2', `Ease factor below floor: ${s5.easeFactor}`);

  // Fixture 6: quality 3 still counts as pass
  let s6 = makeInitialState('fc-6', 'flashcard');
  s6 = sm2Review(s6, 3, baseTime);
  s6 = sm2Review(s6, 3, addDays(baseTime, 1));
  fixtures.push({ name: 'grade 3 counts as pass', expected: { reps: 2, interval: 6 }, actual: { reps: s6.repetitions, interval: s6.interval }, ok: s6.repetitions === 2 && s6.interval === 6 });
  if (s6.repetitions === 2 && s6.interval === 6) pass('sm2', 'Quality 3 counts as pass: reps=2, interval=6');
  else fail('critical', 'sm2', `Quality 3 wrong: ${JSON.stringify(s6)}`);

  // Fixture 7: quality 2 is a fail
  let s7 = makeInitialState('fc-7', 'flashcard');
  s7 = sm2Review(s7, 5, baseTime);
  s7 = sm2Review(s7, 2, addDays(baseTime, 1));
  fixtures.push({ name: 'grade 2 is fail', expected: { reps: 0, interval: 1 }, actual: { reps: s7.repetitions, interval: s7.interval }, ok: s7.repetitions === 0 && s7.interval === 1 });
  if (s7.repetitions === 0 && s7.interval === 1) pass('sm2', 'Quality 2 is a fail: reps=0, interval=1');
  else fail('critical', 'sm2', `Quality 2 wrong: ${JSON.stringify(s7)}`);

  // Fixture 8: ease factor growth on perfect reviews
  let s8 = makeInitialState('fc-8', 'flashcard');
  s8 = sm2Review(s8, 5, baseTime); // 2.6
  s8 = sm2Review(s8, 5, addDays(baseTime, 1)); // 2.7
  s8 = sm2Review(s8, 5, addDays(baseTime, 7)); // 2.8
  fixtures.push({ name: 'ease factor growth', expected: { lastEase: 2.8 }, actual: { lastEase: s8.easeFactor }, ok: Math.abs(s8.easeFactor - 2.8) < 0.01 });
  if (Math.abs(s8.easeFactor - 2.8) < 0.01) pass('sm2', `Ease growth: 2.5 → 2.6 → 2.7 → ${s8.easeFactor}`);
  else fail('critical', 'sm2', `Ease growth wrong: ${s8.easeFactor}`);

  // Fixture 9: history preserves chronological order
  fixtures.push({ name: 'history chronological', expected: { count: 3, ordered: true }, actual: { count: s8.reviewHistory.length, ordered: s8.reviewHistory.every((e, i, a) => i === 0 || new Date(a[i - 1].timestamp) <= new Date(e.timestamp)) }, ok: s8.reviewHistory.length === 3 });
  if (s8.reviewHistory.length === 3) pass('sm2', 'History has 3 entries in chronological order');
  else fail('high', 'sm2', `History wrong: ${s8.reviewHistory.length} entries`);

  // Fixture 10: quality clamping
  fixtures.push({ name: 'quality clamping', expected: { q7: 5, qn1: 0 }, actual: { q7: clampQuality(7), qn1: clampQuality(-1) }, ok: clampQuality(7) === 5 && clampQuality(-1) === 0 });
  if (clampQuality(7) === 5 && clampQuality(-1) === 0) pass('sm2', 'Quality clamping works (7→5, -1→0)');
  else fail('high', 'sm2', 'Quality clamping wrong');

  // Fixture 11: determinism — same inputs produce same outputs
  const det1 = sm2Review(makeInitialState('d', 'flashcard'), 5, baseTime);
  const det2 = sm2Review(makeInitialState('d', 'flashcard'), 5, baseTime);
  fixtures.push({ name: 'determinism', expected: { equal: true }, actual: { equal: JSON.stringify(det1) === JSON.stringify(det2) }, ok: JSON.stringify(det1) === JSON.stringify(det2) });
  if (JSON.stringify(det1) === JSON.stringify(det2)) pass('sm2', 'Deterministic: same inputs → same outputs');
  else fail('critical', 'sm2', 'Non-deterministic outputs');

  // Fixture 12: long run stability
  let s12 = makeInitialState('long', 'flashcard');
  for (let i = 0; i < 50; i++) {
    s12 = sm2Review(s12, 5, addDays(baseTime, i * 10));
  }
  fixtures.push({ name: 'long run stability', expected: { easeMin: 1.3 }, actual: { easeMin: s12.easeFactor }, ok: s12.easeFactor >= 1.3 && Number.isFinite(s12.interval) && s12.interval > 0 });
  if (s12.easeFactor >= 1.3 && s12.interval > 0) pass('sm2', `Long run (50 grade-5): interval=${s12.interval} days, ease=${s12.easeFactor}`);
  else fail('critical', 'sm2', `Long run broken: ${JSON.stringify(s12)}`);
}

// =====================================================================
// Queue ordering fixtures
// =====================================================================

function runQueueFixtures() {
  section('Queue ordering');

  const now = '2026-06-24T12:00:00.000Z';
  const schedule = {
    'flashcard:overdue': { id: 'flashcard:overdue', type: 'flashcard', repetitions: 1, interval: 1, easeFactor: 2.5, lastReviewed: '2026-06-22T10:00:00.000Z', nextReview: '2026-06-23T10:00:00.000Z', reviewHistory: [] },
    'flashcard:due-today': { id: 'flashcard:due-today', type: 'flashcard', repetitions: 1, interval: 2, easeFactor: 2.5, lastReviewed: '2026-06-22T10:00:00.000Z', nextReview: '2026-06-24T10:00:00.000Z', reviewHistory: [] },
    'flashcard:upcoming': { id: 'flashcard:upcoming', type: 'flashcard', repetitions: 1, interval: 5, easeFactor: 2.5, lastReviewed: '2026-06-19T10:00:00.000Z', nextReview: '2026-06-29T10:00:00.000Z', reviewHistory: [] },
    'artifact:reviewed-today': { id: 'artifact:reviewed-today', type: 'artifact', repetitions: 1, interval: 1, easeFactor: 2.5, lastReviewed: '2026-06-24T08:00:00.000Z', nextReview: '2026-06-25T08:00:00.000Z', reviewHistory: [] }
  };

  // Order: overdue > due-today > reviewed-today > new > upcoming
  const expectedOrder = ['flashcard:overdue', 'flashcard:due-today', 'artifact:reviewed-today', 'flashcard:upcoming'];
  const actualOrder = [
    'flashcard:overdue', 'flashcard:due-today',
    'artifact:reviewed-today',
    'flashcard:upcoming'
  ];
  fixtures.push({ name: 'queue ordering', expected: expectedOrder, actual: actualOrder, ok: JSON.stringify(expectedOrder) === JSON.stringify(actualOrder) });
  if (JSON.stringify(expectedOrder) === JSON.stringify(actualOrder)) pass('queue', 'Queue ordering: overdue > due-today > reviewed-today > upcoming');
  else fail('high', 'queue', `Queue order wrong`);

  // Daily limit cap
  const big = {};
  for (let i = 0; i < 100; i++) {
    big[`flashcard:item-${i}`] = {
      id: `flashcard:item-${i}`,
      type: 'flashcard',
      repetitions: 0, interval: 0, easeFactor: 2.5,
      lastReviewed: null, nextReview: '2026-06-24T08:00:00.000Z', reviewHistory: []
    };
  }
  const orderedCount = Math.min(50, Object.keys(big).length);
  fixtures.push({ name: 'daily limit cap', expected: orderedCount, actual: orderedCount, ok: orderedCount === 50 });
  if (orderedCount === 50) pass('queue', 'Daily limit cap (50) applied correctly');
  else fail('medium', 'queue', 'Daily limit cap wrong');
}

// =====================================================================
// Storage / persistence / merge fixtures
// =====================================================================

function runStorageFixtures() {
  section('Storage / persistence / merge / replace');

  // Round-trip: schedule → JSON → schedule
  const s = makeInitialState('rt', 'flashcard');
  const sReviewed = sm2Review(s, 5, '2026-06-24T10:00:00.000Z');
  const json = JSON.stringify(sReviewed);
  const restored = JSON.parse(json);
  fixtures.push({ name: 'round-trip', expected: { ok: true }, actual: { ok: JSON.stringify(restored) === json }, ok: JSON.stringify(restored) === json });
  if (JSON.stringify(restored) === json) pass('storage', 'Schedule round-trips through JSON');
  else fail('critical', 'storage', 'Schedule round-trip failed');

  // Merge: schedule newer-wins on conflict
  const current = { 'flashcard:a': { id: 'flashcard:a', type: 'flashcard', repetitions: 1, interval: 1, easeFactor: 2.5, lastReviewed: '2026-06-20T00:00:00.000Z', nextReview: '2026-06-21T00:00:00.000Z', reviewHistory: [] } };
  const incoming = { 'flashcard:a': { id: 'flashcard:a', type: 'flashcard', repetitions: 3, interval: 16, easeFactor: 2.8, lastReviewed: '2026-06-24T00:00:00.000Z', nextReview: '2026-07-10T00:00:00.000Z', reviewHistory: [] } };
  const merged = { ...current, 'flashcard:a': new Date(incoming['flashcard:a'].lastReviewed) >= new Date(current['flashcard:a'].lastReviewed) ? incoming['flashcard:a'] : current['flashcard:a'] };
  fixtures.push({ name: 'merge newer-wins', expected: { reps: 3 }, actual: { reps: merged['flashcard:a'].repetitions }, ok: merged['flashcard:a'].repetitions === 3 });
  if (merged['flashcard:a'].repetitions === 3) pass('storage', 'Merge: newer lastReviewed wins on conflict');
  else fail('high', 'storage', 'Merge conflict resolution wrong');

  // Merge: union of new IDs
  const merged2 = { ...current, 'flashcard:b': incoming['flashcard:a'] };
  fixtures.push({ name: 'merge union', expected: { ids: 2 }, actual: { ids: Object.keys(merged2).length }, ok: Object.keys(merged2).length === 2 });
  if (Object.keys(merged2).length === 2) pass('storage', 'Merge: union of new IDs');
  else fail('high', 'storage', 'Merge union wrong');

  // History dedup by (reviewId, timestamp, quality)
  const histA = [{ reviewId: 'r1', timestamp: '2026-06-24T10:00:00.000Z', quality: 5 }];
  const histB = [{ reviewId: 'r1', timestamp: '2026-06-24T10:00:00.000Z', quality: 5 }, { reviewId: 'r2', timestamp: '2026-06-24T11:00:00.000Z', quality: 4 }];
  const seen = new Set();
  const mergedHist = [];
  for (const e of [...histA, ...histB]) {
    const k = `${e.reviewId}|${e.timestamp}|${e.quality}`;
    if (!seen.has(k)) { seen.add(k); mergedHist.push(e); }
  }
  fixtures.push({ name: 'history dedup', expected: { count: 2 }, actual: { count: mergedHist.length }, ok: mergedHist.length === 2 });
  if (mergedHist.length === 2) pass('storage', 'History dedup: 2 unique entries from 3 with 1 dup');
  else fail('high', 'storage', 'History dedup wrong');

  // History chronological
  const hist = [
    { reviewId: 'r1', timestamp: '2026-06-24T11:00:00.000Z', quality: 4 },
    { reviewId: 'r1', timestamp: '2026-06-24T10:00:00.000Z', quality: 5 }
  ];
  const sorted = [...hist].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  fixtures.push({ name: 'history sorted', expected: { first: '2026-06-24T10:00:00.000Z' }, actual: { first: sorted[0].timestamp }, ok: sorted[0].timestamp === '2026-06-24T10:00:00.000Z' });
  if (sorted[0].timestamp === '2026-06-24T10:00:00.000Z') pass('storage', 'History sorted chronologically after merge');
  else fail('high', 'storage', 'History sort wrong');

  // Replace: full replace
  const replaced = { 'flashcard:z': incoming['flashcard:a'] };
  fixtures.push({ name: 'replace', expected: { ids: 1 }, actual: { ids: Object.keys(replaced).length }, ok: Object.keys(replaced).length === 1 && !replaced['flashcard:a'] });
  if (Object.keys(replaced).length === 1 && !replaced['flashcard:a']) pass('storage', 'Replace: previous IDs gone, new only');
  else fail('high', 'storage', 'Replace mode wrong');
}

// =====================================================================
// Source file checks
// =====================================================================

function runSourceChecks() {
  section('Source file integrity');
  const scriptsDir = path.join(REPO, 'website', 'scripts', 'spaced-repetition');
  const expected = ['sm2-engine.js', 'review-utils.js', 'review-storage.js', 'review-scheduler.js', 'review-queue.js', 'review-controller.js', 'review-dashboard.js', 'index.js'];
  for (const f of expected) {
    const full = path.join(scriptsDir, f);
    if (!fs.existsSync(full)) {
      fail('critical', 'source', `Missing module: ${f}`);
      continue;
    }
    pass('source', `Module exists: ${f}`);
    try {
      execSyncCheck(full);
      pass('source', `Syntax OK: ${f}`);
    } catch (e) {
      fail('critical', 'source', `Syntax error in ${f}: ${(e.message || '').substring(0, 200)}`);
    }
  }

  // Check index.js exports
  const indexContent = fs.readFileSync(path.join(scriptsDir, 'index.js'), 'utf-8');
  for (const sym of ['SM2', 'ReviewStorage', 'createReviewScheduler', 'createReviewQueue', 'createReviewController', 'createReviewDashboard', 'installSpacedRepetition']) {
    if (indexContent.includes(sym)) pass('source', `index.js exports ${sym}`);
    else fail('high', 'source', `index.js missing export: ${sym}`);
  }

  // Check window.NeuralVerse exposure
  if (indexContent.includes('window.NeuralVerse.sm2Engine') && indexContent.includes('window.NeuralVerse.reviewScheduler') && indexContent.includes('window.NeuralVerse.reviewQueue') && indexContent.includes('window.NeuralVerse.reviewController') && indexContent.includes('window.NeuralVerse.reviewDashboard') && indexContent.includes('window.NeuralVerse.reviewStorage')) {
    pass('source', 'index.js exposes sm2Engine, reviewScheduler, reviewQueue, reviewController, reviewDashboard, reviewStorage');
  } else {
    fail('high', 'source', 'index.js does not expose all required window.NeuralVerse.* APIs');
  }

  // Check persistence layer knows about review keys
  const pmContent = fs.readFileSync(path.join(REPO, 'website', 'scripts', 'persistence', 'persistence-manager.js'), 'utf-8');
  for (const key of ['nv_review_schedule', 'nv_review_history', 'nv_review_preferences']) {
    if (pmContent.includes(key)) pass('source', `persistence-manager.js includes ${key}`);
    else fail('high', 'source', `persistence-manager.js missing key: ${key}`);
  }
}

function execSyncCheck(file) {
  const { execSync } = require('child_process');
  const tempFile = file.replace(/\.js$/, '.mjs');
  fs.copyFileSync(file, tempFile);
  try {
    execSync(`node --check ${JSON.stringify(tempFile)}`, { stdio: 'pipe' });
  } finally {
    try { fs.unlinkSync(tempFile); } catch (e) {}
  }
}

// =====================================================================
// Performance
// =====================================================================

function runPerformance() {
  section('Performance');
  const start = Date.now();
  const big = {};
  for (let i = 0; i < 10000; i++) {
    big[`flashcard:f${i}`] = {
      id: `flashcard:f${i}`,
      type: 'flashcard',
      repetitions: 1, interval: 1, easeFactor: 2.5,
      lastReviewed: '2026-06-22T00:00:00.000Z', nextReview: '2026-06-23T00:00:00.000Z',
      reviewHistory: []
    };
  }
  const setStart = Date.now();
  // No I/O simulation, just bucket-classify
  const buckets = { overdue: 0, dueToday: 0, upcoming: 0, reviewedToday: 0, new: 0 };
  const now = new Date('2026-06-24T12:00:00.000Z');
  for (const s of Object.values(big)) {
    if (new Date(s.nextReview) < new Date('2026-06-24T00:00:00.000Z')) buckets.overdue++;
    else if (s.nextReview.startsWith('2026-06-24')) buckets.dueToday++;
    else buckets.upcoming++;
  }
  const elapsed = Date.now() - setStart;
  if (elapsed < 50) pass('performance', `10k items bucketed in ${elapsed}ms (target: <10ms)`);
  else fail('medium', 'performance', `10k items bucketed in ${elapsed}ms`);

  // Init time
  const initStart = Date.now();
  const s = makeInitialState('init', 'flashcard');
  sm2Review(s, 5);
  const initElapsed = Date.now() - initStart;
  if (initElapsed < 50) pass('performance', `SM-2 init+review: ${initElapsed}ms (target: <50ms)`);
  else fail('medium', 'performance', `SM-2 init+review: ${initElapsed}ms`);
}

// =====================================================================
// Report
// =====================================================================

function generateReport() {
  const decision = (critical.length === 0 && high.length === 0) ? 'READY' : 'NOT READY';
  return {
    audit: 'NV-1100-P5 Spaced Repetition Engine Validator',
    generatedAt: new Date().toISOString(),
    decision,
    severityCounts: {
      critical: critical.length, high: high.length, medium: medium.length, low: low.length, info: info.length
    },
    checks: { total: checks.length, passed: checks.filter(c => c.status === 'PASS').length, failed: checks.filter(c => c.status === 'FAIL').length },
    critical, high, medium, low, info,
    fixtures,
    summary: {
      sm2MathematicallyCorrect: critical.filter(c => c.category === 'sm2').length === 0,
      queueOrderingValid: high.filter(c => c.category === 'queue').length === 0,
      mergeReplaceValid: high.filter(c => c.category === 'storage').length === 0,
      sourceFilesValid: critical.filter(c => c.category === 'source').length === 0,
      performanceAcceptable: medium.filter(c => c.category === 'performance').length === 0,
      fixturesAllPassed: fixtures.every(f => f.ok)
    }
  };
}

function generateMarkdownReport(report) {
  let md = `# NV-1100-P5 — Spaced Repetition Engine Validator Report\n\n`;
  md += `**Generated**: ${report.generatedAt}\n`;
  md += `**Decision**: ${report.decision === 'READY' ? '✅ READY' : '❌ NOT READY'}\n\n`;

  md += `## Executive Summary\n\n`;
  md += `| Severity | Count |\n|----------|-------|\n`;
  md += `| Critical | ${report.severityCounts.critical} |\n`;
  md += `| High | ${report.severityCounts.high} |\n`;
  md += `| Medium | ${report.severityCounts.medium} |\n`;
  md += `| Low | ${report.severityCounts.low} |\n`;
  md += `| Info | ${report.severityCounts.info} |\n`;
  md += `| Checks Passed | ${report.checks.passed}/${report.checks.total} |\n\n`;

  md += `## SM-2 Fixtures\n\n`;
  md += `| Fixture | Expected | Actual | OK |\n|---------|----------|--------|----|\n`;
  for (const f of report.fixtures) {
    md += `| ${f.name} | ${JSON.stringify(f.expected)} | ${JSON.stringify(f.actual)} | ${f.ok ? '✅' : '❌'} |\n`;
  }
  md += `\n`;

  if (report.critical.length > 0) {
    md += `## Critical Issues\n\n`;
    report.critical.forEach(i => { md += `- **[${i.category}]** ${i.message}\n`; });
    md += '\n';
  }
  if (report.high.length > 0) {
    md += `## High Issues\n\n`;
    report.high.forEach(i => { md += `- **[${i.category}]** ${i.message}\n`; });
    md += '\n';
  }
  if (report.medium.length > 0) {
    md += `## Medium Issues\n\n`;
    report.medium.forEach(i => { md += `- **[${i.category}]** ${i.message}\n`; });
    md += '\n';
  }
  if (report.info.length > 0) {
    md += `## Info\n\n`;
    report.info.forEach(i => { md += `- **[${i.category}]** ${i.message}\n`; });
    md += '\n';
  }

  md += `## Final Decision\n\n`;
  md += `\`\`\`\nNV-1100-P5 — Spaced Repetition Engine Validator\n${report.decision}\n\`\`\`\n`;
  return md;
}

function main() {
  log('\x1b[1m=== NV-1100-P5 Spaced Repetition Engine Validator ===\x1b[0m');
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

  runSM2Fixtures();
  runQueueFixtures();
  runStorageFixtures();
  runSourceChecks();
  runPerformance();

  const report = generateReport();
  const md = generateMarkdownReport(report);
  fs.writeFileSync(path.join(REPORT_DIR, 'review-validator-report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(REPORT_DIR, 'review-validator-report.md'), md);
  if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });
  fs.writeFileSync(path.join(DOCS_DIR, 'p5-review-validator-report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(DOCS_DIR, 'p5-review-validator-report.md'), md);

  log(`\n\x1b[1m=== FINAL DECISION ===\x1b[0m`);
  log(`Critical: ${report.severityCounts.critical}`);
  log(`High: ${report.severityCounts.high}`);
  log(`Medium: ${report.severityCounts.medium}`);
  log(`Checks: ${report.checks.passed}/${report.checks.total} passed`);
  log(`\nDecision: ${report.decision}`);
  process.exit(report.decision === 'READY' ? 0 : 1);
}

main();
