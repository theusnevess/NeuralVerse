#!/usr/bin/env node
/**
 * NV-1300-D1D — Deterministic Verification
 *
 * Verifies that all D1D modules produce deterministic outputs
 * with identical inputs across many iterations.
 *
 * Validates:
 *  - Evidence tracer determinism
 *  - Memory review bridge determinism (no inference)
 *  - Semantic learning bridge determinism
 *  - Agent collaboration orchestrator determinism
 *  - Generative augmenter determinism (when disabled, fallback is deterministic)
 *  - Planner with all D1D fields integrated
 *  - No learner inference in any output
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BASE = path.join(__dirname, '..', 'website', 'scripts', 'agents');

let errors = [];
let checked = 0;
let passed = 0;

function log(level, message) {
  const prefix = {
    error: '\x1b[31mERROR\x1b[0m',
    ok: '\x1b[32mPASS\x1b[0m',
    info: '\x1b[36mINFO\x1b[0m'
  };
  console.log(`${prefix[level] || '    '}  ${message}`);
}

function check(condition, message) {
  checked++;
  if (condition) {
    passed++;
    log('ok', message);
  } else {
    errors.push(message);
    log('error', message);
  }
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
  } catch (e) {
    return null;
  }
}

function _deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

function _stableRepr(o) {
  if (o === null || o === undefined) return String(o);
  if (typeof o !== 'object') return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(_stableRepr).join(',') + ']';
  var keys = Object.keys(o).sort();
  return '{' + keys.map(function (k) { return JSON.stringify(k) + ':' + _stableRepr(o[k]); }).join(',') + '}';
}

function testEvidenceTracerDeterminism() {
  log('info', '=== Evidence Tracer Determinism ===');
  const mod = loadModule('evidence-tracer.js');
  if (!mod) { check(false, 'Could not load evidence-tracer.js'); return; }
  const createFn = mod.createEvidenceTracer;
  if (!createFn) { check(false, 'No createEvidenceTracer export'); return; }

  const plan = {
    id: 'plan-test-d1d',
    topic: 'Test Topic',
    sections: [
      { id: 'motivation', included: true, metadata: { evidence: [{ layerId: 'motivation', sourceType: 'concept', sourceId: 'c1', reason: 'r' }] } },
      { id: 'core_explanation', included: true, metadata: { evidence: [{ layerId: 'core_explanation', sourceType: 'artifact', sourceId: 'a1', reason: 'r' }] } },
      { id: 'visualization', included: true, metadata: { evidence: [{ layerId: 'visualization', sourceType: 'visualization', sourceId: 'v1', reason: 'r' }] } }
    ],
    mediaTimeline: [
      { sectionId: 'visualization', mediaType: 'visualization', mediaId: 'v1' }
    ],
    transitionMap: [
      { fromSectionId: 'motivation', toSectionId: 'core_explanation', transitionType: 'conceptual' }
    ],
    generatedBlocks: [
      { blockId: 'gen-1', type: 'analogy', content: 'analogy text', confidence: 0.7 }
    ]
  };

  const results = [];
  for (let i = 0; i < 100; i++) {
    const tracer = createFn();
    const out = tracer.traceLesson(plan);
    var stableTree = out && out.tree ? _stableRepr(out.tree) : 'null';
    var stableBlocks = out && out.blocks ? out.blocks.map(function (b) { return _stableRepr({ id: b.blockId, canonicalStatus: b.canonicalStatus, generated: b.generated }); }) : [];
    results.push(_stableRepr({ tree: stableTree, stableBlocks: stableBlocks }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'EvidenceTracer: 100 iterations produce identical tree and canonical-status assignments');
}

function testMemoryReviewBridgeDeterminism() {
  log('info', '=== Memory & Review Bridge Determinism ===');
  const mod = loadModule('memory-review-bridge.js');
  if (!mod) { check(false, 'Could not load memory-review-bridge.js'); return; }
  const createFn = mod.createMemoryReviewBridge;
  if (!createFn) { check(false, 'No createMemoryReviewBridge export'); return; }

  const bridge = createFn();
  const results = [];
  for (let i = 0; i < 100; i++) {
    const ctx = bridge.buildContext({ conceptIds: ['c1', 'c2'], artifactIds: ['a1'] });
    var memoryCounts = ctx && ctx.memory && ctx.memory.counts ? _stableRepr(ctx.memory.counts) : 'null';
    var reviewCounts = ctx && ctx.review && ctx.review.counts ? _stableRepr(ctx.review.counts) : 'null';
    results.push(_stableRepr({ memory: memoryCounts, review: reviewCounts }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'MemoryReviewBridge: 100 iterations produce identical empty-state counts');
}

function testSemanticLearningBridgeDeterminism() {
  log('info', '=== Semantic Learning Bridge Determinism ===');
  const mod = loadModule('semantic-learning-bridge.js');
  if (!mod) { check(false, 'Could not load semantic-learning-bridge.js'); return; }
  const createFn = mod.createSemanticLearningBridge;
  if (!createFn) { check(false, 'No createSemanticLearningBridge export'); return; }

  const bridge = createFn();
  const results = [];
  for (let i = 0; i < 100; i++) {
    const recommendations = bridge.getSemanticRecommendations(['c1', 'c2']);
    results.push(_stableRepr(recommendations));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'SemanticBridge: 100 iterations produce identical recommendation ordering');
}

function testAgentCollaborationOrchestratorDeterminism() {
  log('info', '=== Agent Collaboration Orchestrator Determinism ===');
  const mod = loadModule('agent-collaboration-orchestrator.js');
  if (!mod) { check(false, 'Could not load agent-collaboration-orchestrator.js'); return; }
  const createFn = mod.createAgentCollaborationOrchestrator;
  if (!createFn) { check(false, 'No createAgentCollaborationOrchestrator export'); return; }

  const orch = createFn({ agents: {} });
  const results = [];
  for (let i = 0; i < 100; i++) {
    const out = orch.buildUnifiedContext({
      query: 'test query',
      topic: 'test topic',
      intent: 'explain',
      mode: 'default',
      plan: { visualizations: [], laboratories: [] }
    });
    results.push(_stableRepr({
      summary: out.summary,
      order: out.order,
      blockCount: out.mergedBlocks.length
    }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'AgentCollab: 100 iterations produce identical summary and merged count');
}

function testGenerativeAugmenterDeterminism() {
  log('info', '=== Generative Augmenter Determinism ===');
  const mod = loadModule('generative-augmenter.js');
  if (!mod) { check(false, 'Could not load generative-augmenter.js'); return; }
  const createFn = mod.createGenerativeAugmenter;
  if (!createFn) { check(false, 'No createGenerativeAugmenter export'); return; }

  const aug = createFn();
  const results = [];
  for (let i = 0; i < 100; i++) {
    const r = aug.generateAnalogy({
      topic: 'test topic',
      conceptIds: ['c1'],
      artifactIds: ['a1'],
      canonicalContent: 'canonical content'
    });
    results.push(_stableRepr({
      available: r.available,
      blockCanonicalStatus: r.block ? r.block.canonicalStatus : null,
      blockGenerated: r.block ? r.block.generated : null
    }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'GenAug: 100 iterations with no P11 enabled produce identical fallback (canonical-derived) blocks');
  check(results[0].indexOf('"blockCanonicalStatus":"NonCanonical"') !== -1 || results[0].indexOf('"blockCanonicalStatus":null') !== -1,
    'GenAug: fallback blocks carry explicit canonicalStatus (or null when not produced)');
}

function testGenerativeAugmenterForbiddenReplacements() {
  log('info', '=== Generative Augmenter Forbidden Replacements ===');
  const mod = loadModule('generative-augmenter.js');
  if (!mod) { check(false, 'Could not load generative-augmenter.js'); return; }
  const createFn = mod.createGenerativeAugmenter;
  if (!createFn) { check(false, 'No createGenerativeAugmenter export'); return; }

  const aug = createFn();
  var forbidden = [
    'canonical_explanation',
    'curriculum_definition',
    'prerequisite_creation',
    'citation_invention',
    'concept_definition'
  ];
  var exportedForbidden = aug.FORBIDDEN_REPLACE_TYPES || [];
  var allBlocked = forbidden.every(function (t) { return exportedForbidden.indexOf(t) !== -1; });
  check(allBlocked, 'GenAug: all FORBIDDEN_REPLACE_TYPES are exported and expected');
  check(exportedForbidden.length === forbidden.length, 'GenAug: FORBIDDEN_REPLACE_TYPES has exactly ' + forbidden.length + ' entries');
}

function testPlannerD1DIntegrationDeterminism() {
  log('info', '=== Planner D1D Integration Determinism ===');
  const plannerMod = loadModule('pedagogical-planner.js');
  if (!plannerMod) { check(false, 'Could not load pedagogical-planner.js'); return; }
  const createFn = plannerMod.createPedagogicalPlanner;
  if (!createFn) { check(false, 'No createPedagogicalPlanner export'); return; }

  const evMod = loadModule('evidence-tracer.js');
  const memMod = loadModule('memory-review-bridge.js');
  const semMod = loadModule('semantic-learning-bridge.js');
  const agoMod = loadModule('agent-collaboration-orchestrator.js');
  const genMod = loadModule('generative-augmenter.js');

  if (!evMod || !memMod || !semMod || !agoMod || !genMod) {
    check(false, 'Could not load one or more D1D modules');
    return;
  }

  const planner = createFn({
    evidenceTracer: evMod.createEvidenceTracer(),
    memoryReviewBridge: memMod.createMemoryReviewBridge(),
    semanticLearningBridge: semMod.createSemanticLearningBridge(),
    agentCollaborationOrchestrator: agoMod.createAgentCollaborationOrchestrator({ agents: {} }),
    generativeAugmenter: genMod.createGenerativeAugmenter()
  });

  const input = {
    query: 'test query',
    intent: 'explain',
    mode: 'default',
    topic: 'test topic',
    difficulty: 'standard',
    conceptIds: ['c1', 'c2'],
    artifactIds: ['a1'],
    availableResources: {
      concepts: [{ id: 'c1', name: 'Concept 1' }, { id: 'c2', name: 'Concept 2' }],
      artifacts: [{ id: 'a1', title: 'Artifact 1' }],
      visualizations: [{ id: 'v1', title: 'Viz 1' }],
      laboratories: [{ id: 'l1', title: 'Lab 1' }],
      sharedKnowledge: []
    },
    allowGenerative: false
  };

  const results = [];
  for (let i = 0; i < 50; i++) {
    const plan = planner.buildPlan(input);
    var stable = _stableRepr({
      evidenceTreeNodeCount: plan.evidenceTree ? plan.evidenceTree.totalBlocks : 0,
      evidenceTreeCanonicalCount: plan.evidenceTree ? plan.evidenceTree.canonicalCount : 0,
      memoryHasCounts: !!(plan.memoryContext && plan.memoryContext.counts),
      reviewHasCounts: !!(plan.reviewContext && plan.reviewContext.counts),
      semanticHasCounts: !!(plan.semanticContext && plan.semanticContext.counts),
      agentContribSummary: plan.agentContributions ? plan.agentContributions.summary : null,
      generatedBlocksCount: (plan.generatedBlocks || []).length
    });
    results.push(stable);
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Planner with D1D: 50 iterations produce identical D1D field structure');
}

function testNoLearnerInferenceInD1DOutputs() {
  log('info', '=== No Learner Inference in D1D Outputs ===');
  const memMod = loadModule('memory-review-bridge.js');
  if (!memMod) { check(false, 'Could not load memory-review-bridge.js'); return; }
  const bridge = memMod.createMemoryReviewBridge();
  const ctx = bridge.buildContext({ conceptIds: [], artifactIds: [] });

  const forbidden = ['mastery', 'competence', 'proficiency', 'weakness', 'intelligence score', 'skill score', 'skill_level'];
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

  const inf = walk(ctx);
  check(inf === null, 'MemoryReviewBridge: no learner inference in context (' + (inf || 'clean') + ')');

  const val = bridge.validateContext(ctx);
  check(val.valid, 'MemoryReviewBridge: validateContext passes for default empty context');
}

function testValidatorReportExists() {
  log('info', '=== Validator Report Check ===');
  const reportPath = path.join(__dirname, '..', 'docs', 'architecture', 'nv-1300', 'nv-1300-d1d-validator-report.json');
  check(fs.existsSync(reportPath), 'Validator report exists');
}

function runAllTests() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  NV-1300-D1D — Deterministic Verification');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  testEvidenceTracerDeterminism();
  console.log('');
  testMemoryReviewBridgeDeterminism();
  console.log('');
  testSemanticLearningBridgeDeterminism();
  console.log('');
  testAgentCollaborationOrchestratorDeterminism();
  console.log('');
  testGenerativeAugmenterDeterminism();
  console.log('');
  testGenerativeAugmenterForbiddenReplacements();
  console.log('');
  testPlannerD1DIntegrationDeterminism();
  console.log('');
  testNoLearnerInferenceInD1DOutputs();
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
    validator: 'NV-1300-D1D-deterministic-verification',
    timestamp: new Date().toISOString(),
    summary: { checks: checked, passed, errors: errors.length, verdict: errors.length === 0 ? 'READY' : 'NOT READY' },
    errors
  };

  try {
    fs.writeFileSync(path.join(reportDir, 'nv-1300-d1d-verify-report.json'), JSON.stringify(report, null, 2));
    console.log('  Report written to docs/architecture/nv-1300/nv-1300-d1d-verify-report.json');
  } catch (e) { console.log('  Could not write report: ' + e.message); }

  console.log('');
  process.exit(errors.length === 0 ? 0 : 1);
}

runAllTests();
