#!/usr/bin/env node
/**
 * NV-1300-D2 — Research Architecture Deterministic Verification
 *
 * Verifies that all D2 modules produce deterministic outputs
 * with identical inputs across many iterations.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BASE = path.join(__dirname, '..', 'website', 'scripts', 'agents');

let errors = [];
let checked = 0;
let passed = 0;

function log(level, message) {
  const prefix = { error: '\x1b[31mERROR\x1b[0m', ok: '\x1b[32mPASS\x1b[0m', info: '\x1b[36mINFO\x1b[0m' };
  console.log(`${prefix[level] || '    '}  ${message}`);
}

function check(condition, message) {
  checked++;
  if (condition) { passed++; log('ok', message); }
  else { errors.push(message); log('error', message); }
}

function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch (e) { return null; }
}

function _stripEsm(content) {
  return content
    .replace(/^export\s*\{[\s\S]*?\}\s*;?\s*$/gm, '')
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '')
    .replace(/^import\s+\w+\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '');
}

function loadModule(filename) {
  const content = readFile(path.join(BASE, filename));
  if (!content) return null;
  const sandbox = {
    window: { NeuralVerse: {} },
    console: console,
    module: { exports: {} },
    exports: {}
  };
  try {
    const script = new vm.Script(_stripEsm(content), { filename: filename });
    const context = vm.createContext(sandbox);
    script.runInContext(context);
    return sandbox.window.NeuralVerse || {};
  } catch (e) { return null; }
}

function _stableRepr(o) {
  if (o === null || o === undefined) return String(o);
  if (typeof o !== 'object') return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(_stableRepr).join(',') + ']';
  var keys = Object.keys(o).sort();
  return '{' + keys.map(function (k) { return JSON.stringify(k) + ':' + _stableRepr(o[k]); }).join(',') + '}';
}

function testResearchPlannerDeterminism() {
  log('info', '=== Research Planner Determinism ===');
  const mod = loadModule('research-planner.js');
  if (!mod) { check(false, 'Could not load research-planner.js'); return; }
  const createFn = mod.createResearchPlanner;
  if (!createFn) { check(false, 'No createResearchPlanner export'); return; }

  const input = { query: 'How do transformers compare to RNNs?', topic: 'transformers', depth: 'standard' };
  const results = [];
  for (let i = 0; i < 100; i++) {
    const planner = createFn();
    const plan = planner.buildPlan(input);
    results.push(_stableRepr({ id: plan.id, intent: plan.intent, depth: plan.depth }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Planner: 100 iterations produce identical plans');
}

function testDecomposerDeterminism() {
  log('info', '=== Question Decomposer Determinism ===');
  const mod = loadModule('question-decomposer.js');
  if (!mod) { check(false, 'Could not load question-decomposer.js'); return; }
  const createFn = mod.createQuestionDecomposer;
  if (!createFn) { check(false, 'No createQuestionDecomposer export'); return; }

  const results = [];
  for (let i = 0; i < 100; i++) {
    const d = createFn();
    const decomp = d.decompose('How do transformers work?', 'algorithmic');
    results.push(_stableRepr({ count: decomp.count, units: decomp.units.map(u => u.key) }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Decomposer: 100 iterations produce identical decomposition');
}

function testEvidenceRankerDeterminism() {
  log('info', '=== Evidence Ranker Determinism ===');
  const mod = loadModule('evidence-ranker.js');
  if (!mod) { check(false, 'Could not load evidence-ranker.js'); return; }
  const createFn = mod.createEvidenceRanker;
  if (!createFn) { check(false, 'No createEvidenceRanker export'); return; }

  const collection = {
    items: [
      { source: 'curriculum', content: { claim: 'Claim 1' }, refId: 'a' },
      { source: 'external', content: { claim: 'Claim 2', quality: 'peer_reviewed' }, refId: 'b' },
      { source: 'external', content: { claim: 'Claim 3', quality: 'preprint' }, refId: 'c' }
    ]
  };

  const results = [];
  for (let i = 0; i < 100; i++) {
    const r = createFn();
    const ranked = r.rank(collection);
    results.push(_stableRepr(ranked.ranked.map(x => ({ refId: x.item.refId, score: x.score }))));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Ranker: 100 iterations produce identical ranking');
}

function testClaimExtractorDeterminism() {
  log('info', '=== Claim Extractor Determinism ===');
  const mod = loadModule('claim-extractor.js');
  if (!mod) { check(false, 'Could not load claim-extractor.js'); return; }
  const createFn = mod.createClaimExtractor;
  if (!createFn) { check(false, 'No createClaimExtractor export'); return; }

  const ranking = { ranked: [
    { item: { content: { claim: 'Test claim', confidence: 0.8 }, refId: 'a' }, score: 10 },
    { item: { content: { claim: 'Another claim', confidence: 0.6 }, refId: 'b' }, score: 5 }
  ]};

  const results = [];
  for (let i = 0; i < 100; i++) {
    const c = createFn();
    const claims = c.extractFromEvidence(ranking, 10);
    results.push(_stableRepr(claims.map(cl => ({ claim: cl.claim, confidence: cl.confidence }))));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Claim Extractor: 100 iterations produce identical claims');
}

function testConflictDetectorDeterminism() {
  log('info', '=== Conflict Detector Determinism ===');
  const mod = loadModule('conflict-detector.js');
  if (!mod) { check(false, 'Could not load conflict-detector.js'); return; }
  const createFn = mod.createConflictDetector;
  if (!createFn) { check(false, 'No createConflictDetector export'); return; }

  const claims = [
    { id: 'c1', claim: 'Claim A', confidence: 0.9, source: 'curriculum' },
    { id: 'c2', claim: 'Claim B', confidence: 0.5, source: 'external' }
  ];

  const results = [];
  for (let i = 0; i < 100; i++) {
    const d = createFn();
    const conflicts = d.detect(claims);
    results.push(_stableRepr(conflicts));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Conflict Detector: 100 iterations produce identical conflicts');
}

function testConsensusAnalyzerDeterminism() {
  log('info', '=== Consensus Analyzer Determinism ===');
  const mod = loadModule('consensus-analyzer.js');
  if (!mod) { check(false, 'Could not load consensus-analyzer.js'); return; }
  const createFn = mod.createConsensusAnalyzer;
  if (!createFn) { check(false, 'No createConsensusAnalyzer export'); return; }

  const claims = [
    { id: 'c1', confidence: 0.8 },
    { id: 'c2', confidence: 0.7 },
    { id: 'c3', confidence: 0.9 }
  ];
  const conflicts = [];

  const results = [];
  for (let i = 0; i < 100; i++) {
    const a = createFn();
    const analysis = a.analyze(claims, conflicts);
    results.push(_stableRepr({ level: analysis.level, confidence: analysis.confidence }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Consensus Analyzer: 100 iterations produce identical analysis');
}

function testReportComposerDeterminism() {
  log('info', '=== Research Report Composer Determinism ===');
  const mod = loadModule('research-report-composer.js');
  if (!mod) { check(false, 'Could not load research-report-composer.js'); return; }
  const createFn = mod.createResearchReportComposer;
  if (!createFn) { check(false, 'No createResearchReportComposer export'); return; }

  const input = {
    plan: { id: 'r1', topic: 'Test', intent: 'survey', depth: 'standard', query: 'test', scope: { sections: ['scope', 'methodology', 'evidence', 'claims', 'consensus', 'conclusion', 'references'] } },
    claims: [{ id: 'c1', claim: 'Test' }],
    synthesis: { consensusLevel: 'moderate_consensus' },
    consensus: { level: 'moderate_consensus', confidence: 0.7 },
    conflicts: [],
    evidenceCount: 5
  };

  const results = [];
  for (let i = 0; i < 100; i++) {
    const c = createFn();
    const report = c.composeReport(input);
    results.push(_stableRepr({ title: report.title, sectionCount: report.sectionCount, sections: report.sections.map(s => s.content) }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Report Composer: 100 iterations produce identical reports');
}

function testSourceQualityDeterminism() {
  log('info', '=== Source Quality Engine Determinism ===');
  const mod = loadModule('source-quality-engine.js');
  if (!mod) { check(false, 'Could not load source-quality-engine.js'); return; }
  const createFn = mod.createSourceQualityEngine;
  if (!createFn) { check(false, 'No createSourceQualityEngine export'); return; }

  const sources = [
    { type: 'canonical' },
    { type: 'peer_reviewed' },
    { type: 'preprint' }
  ];

  const results = [];
  for (let i = 0; i < 100; i++) {
    const q = createFn();
    const labels = q.labelAll(sources);
    results.push(_stableRepr(labels.map(l => l.label)));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Source Quality: 100 iterations produce identical labels');
}

function testCitationValidatorDeterminism() {
  log('info', '=== Citation Validator Determinism ===');
  const mod = loadModule('citation-validator.js');
  if (!mod) { check(false, 'Could not load citation-validator.js'); return; }
  const createFn = mod.createCitationValidator;
  if (!createFn) { check(false, 'No createCitationValidator export'); return; }

  const claims = [
    { id: 'c1', claim: 'Test', supportingReferences: ['r1'] }
  ];
  const references = [{ id: 'r1' }];

  const results = [];
  for (let i = 0; i < 100; i++) {
    const v = createFn();
    const validation = v.validate(claims, references);
    results.push(_stableRepr({ valid: validation.valid, errorCount: validation.errors.length, warningCount: validation.warnings.length }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Citation Validator: 100 iterations produce identical validation');
}

function testFullPipelineDeterminism() {
  log('info', '=== Full D2 Pipeline Determinism ===');
  const plannerMod = loadModule('research-planner.js');
  const decomposerMod = loadModule('question-decomposer.js');
  const collectorMod = loadModule('evidence-collector.js');
  const rankerMod = loadModule('evidence-ranker.js');
  const claimsMod = loadModule('claim-extractor.js');
  const conflictMod = loadModule('conflict-detector.js');
  const consensusMod = loadModule('consensus-analyzer.js');
  const composerMod = loadModule('research-report-composer.js');

  if (!plannerMod || !decomposerMod || !collectorMod || !rankerMod || !claimsMod || !conflictMod || !consensusMod || !composerMod) {
    check(false, 'Could not load one or more D2 modules');
    return;
  }

  const results = [];
  for (let i = 0; i < 50; i++) {
    const plan = plannerMod.createResearchPlanner().buildPlan({ query: 'transformers vs RNNs', topic: 'transformers', depth: 'standard' });
    const decomp = decomposerMod.createQuestionDecomposer().decompose('transformers vs RNNs', plan.intent);
    const collection = collectorMod.createEvidenceCollector().collect({ curriculum: [{ claim: 'Curriculum claim' }], external: [{ claim: 'External claim', quality: 'peer_reviewed' }] });
    const ranking = rankerMod.createEvidenceRanker().rank(collection);
    const claims = claimsMod.createClaimExtractor().extractFromEvidence(ranking, plan.scope.maxClaims);
    const conflicts = conflictMod.createConflictDetector().detect(claims);
    const consensus = consensusMod.createConsensusAnalyzer().analyze(claims, conflicts);
    const report = composerMod.createResearchReportComposer().composeReport({ plan: plan, claims: claims, consensus: consensus, conflicts: conflicts, evidenceCount: collection.count });
    results.push(_stableRepr({ planId: plan.id, sectionCount: report.sectionCount, consensusLevel: consensus.level }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Full D2 pipeline: 50 iterations produce identical outputs');
}

function testNoLearnerInference() {
  log('info', '=== No Learner Inference in D2 Outputs ===');
  const plannerMod = loadModule('research-planner.js');
  if (!plannerMod) { check(false, 'Could not load research-planner.js'); return; }
  const plan = plannerMod.createResearchPlanner().buildPlan({ query: 'test', topic: 'test', depth: 'standard' });
  const forbidden = ['mastery', 'competence', 'proficiency', 'weakness', 'intelligence score', 'skill score'];
  function walk(o) {
    if (typeof o === 'string') {
      var lower = o.toLowerCase();
      for (var i = 0; i < forbidden.length; i++) {
        if (lower.indexOf(forbidden[i]) !== -1) return forbidden[i];
      }
      return null;
    }
    if (Array.isArray(o)) {
      for (var j = 0; j < o.length; j++) {
        var r = walk(o[j]);
        if (r) return r;
      }
    } else if (o && typeof o === 'object') {
      for (var k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k)) {
          var r2 = walk(o[k]);
          if (r2) return r2;
        }
      }
    }
    return null;
  }
  const inf = walk(plan);
  check(inf === null, 'Planner: no learner inference in output (' + (inf || 'clean') + ')');
}

function testValidatorReportExists() {
  log('info', '=== Validator Report Check ===');
  const reportPath = path.join(__dirname, '..', 'docs', 'architecture', 'nv-1300', 'nv-1300-d2-validator-report.json');
  check(fs.existsSync(reportPath), 'Validator report exists');
}

function runAllTests() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  NV-1300-D2 — Deterministic Verification');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  testResearchPlannerDeterminism();
  console.log('');
  testDecomposerDeterminism();
  console.log('');
  testEvidenceRankerDeterminism();
  console.log('');
  testClaimExtractorDeterminism();
  console.log('');
  testConflictDetectorDeterminism();
  console.log('');
  testConsensusAnalyzerDeterminism();
  console.log('');
  testReportComposerDeterminism();
  console.log('');
  testSourceQualityDeterminism();
  console.log('');
  testCitationValidatorDeterminism();
  console.log('');
  testFullPipelineDeterminism();
  console.log('');
  testNoLearnerInference();
  console.log('');
  testValidatorReportExists();
  console.log('');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  Checks:  ${checked}`);
  console.log(`  Passed:  ${passed}`);
  console.log(`  Errors:  ${errors.length}`);
  console.log('');

  if (errors.length === 0) {
    console.log('\x1b[32m  ALL CHECKS PASSED\x1b[0m');
  } else {
    console.log('\x1b[31m  ERRORS FOUND:\x1b[0m');
    for (const err of errors) {
      console.log(`    \x1b[31m- ${err}\x1b[0m`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');

  const reportDir = path.join(__dirname, '..', 'docs', 'architecture', 'nv-1300');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  const report = {
    validator: 'NV-1300-D2-deterministic-verification',
    timestamp: new Date().toISOString(),
    summary: { checks: checked, passed, errors: errors.length, verdict: errors.length === 0 ? 'READY' : 'NOT READY' },
    errors
  };

  try {
    fs.writeFileSync(path.join(reportDir, 'nv-1300-d2-verify-report.json'), JSON.stringify(report, null, 2));
    console.log('  Report written to docs/architecture/nv-1300/nv-1300-d2-verify-report.json');
  } catch (e) { console.log('  Could not write report: ' + e.message); }

  console.log('');
  process.exit(errors.length === 0 ? 0 : 1);
}

runAllTests();
