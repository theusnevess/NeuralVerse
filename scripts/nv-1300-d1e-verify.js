#!/usr/bin/env node
/**
 * NV-1300-D1E — Deterministic Verification
 *
 * Verifies that all D1E modules produce deterministic outputs
 * with identical inputs across many iterations.
 *
 * Validates:
 *  - Cognitive load optimizer determinism
 *  - Instructional pacing engine determinism
 *  - Lesson composer determinism
 *  - Readability optimizer determinism
 *  - Accessibility polish determinism
 *  - Planner with all D1E fields integrated
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

function _stableRepr(o) {
  if (o === null || o === undefined) return String(o);
  if (typeof o !== 'object') return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(_stableRepr).join(',') + ']';
  var keys = Object.keys(o).sort();
  return '{' + keys.map(function (k) { return JSON.stringify(k) + ':' + _stableRepr(o[k]); }).join(',') + '}';
}

function testCognitiveLoadOptimizerDeterminism() {
  log('info', '=== Cognitive Load Optimizer Determinism ===');
  const mod = loadModule('cognitive-load-optimizer.js');
  if (!mod) { check(false, 'Could not load cognitive-load-optimizer.js'); return; }
  const createFn = mod.createCognitiveLoadOptimizer;
  if (!createFn) { check(false, 'No createCognitiveLoadOptimizer export'); return; }

  const plan = {
    sections: [
      { id: 'motivation', included: true, complexity: 'low' },
      { id: 'core_explanation', included: true, complexity: 'medium' },
      { id: 'mathematics', included: true, complexity: 'high' },
      { id: 'mathematics', included: true, complexity: 'high' },
      { id: 'visualization', included: true, complexity: 'low' },
      { id: 'summary', included: true, complexity: 'low' }
    ]
  };

  const results = [];
  for (let i = 0; i < 100; i++) {
    const optimizer = createFn();
    const metrics = optimizer.computeLoadMetrics(plan);
    results.push(_stableRepr({
      totalWeight: metrics.totalWeight,
      highCount: metrics.highCount,
      violationCount: metrics.violationCount,
      balanced: metrics.balanced
    }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'LoadOptimizer: 100 iterations produce identical metrics');
}

function testInstructionalPacingDeterminism() {
  log('info', '=== Instructional Pacing Engine Determinism ===');
  const mod = loadModule('instructional-pacing-engine.js');
  if (!mod) { check(false, 'Could not load instructional-pacing-engine.js'); return; }
  const createFn = mod.createInstructionalPacingEngine;
  if (!createFn) { check(false, 'No createInstructionalPacingEngine export'); return; }

  const plan = {
    sections: [
      { id: 'motivation', included: true },
      { id: 'core_explanation', included: true },
      { id: 'mathematics', included: true },
      { id: 'mathematics', included: true },
      { id: 'visualization', included: true },
      { id: 'summary', included: true }
    ]
  };

  const results = [];
  for (let i = 0; i < 100; i++) {
    const engine = createFn();
    const pacing = engine.buildPacing(plan);
    results.push(_stableRepr({
      sectionCount: pacing.sections.length,
      needsReliefCount: pacing.sections.filter(function (s) { return s.needsRelief; }).length
    }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'PacingEngine: 100 iterations produce identical pacing');
}

function testLessonComposerDeterminism() {
  log('info', '=== Lesson Composer Determinism ===');
  const mod = loadModule('lesson-composer.js');
  if (!mod) { check(false, 'Could not load lesson-composer.js'); return; }
  const createFn = mod.createLessonComposer;
  if (!createFn) { check(false, 'No createLessonComposer export'); return; }

  const plan = {
    id: 'plan-test-d1e',
    topic: 'Test Topic',
    sections: [
      { id: 'motivation', included: true, label: 'Motivation' },
      { id: 'core_explanation', included: true, label: 'Core' },
      { id: 'summary', included: true, label: 'Summary' }
    ]
  };

  const results = [];
  for (let i = 0; i < 100; i++) {
    const composer = createFn();
    const composition = composer.composeLesson(plan);
    results.push(_stableRepr({
      sectionCount: composition.sectionCount,
      outlineLength: composition.outline.length,
      narrativeLength: composition.narrative.length,
      valid: composition.valid
    }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Composer: 100 iterations produce identical composition');
}

function testReadabilityOptimizerDeterminism() {
  log('info', '=== Readability Optimizer Determinism ===');
  const mod = loadModule('readability-optimizer.js');
  if (!mod) { check(false, 'Could not load readability-optimizer.js'); return; }
  const createFn = mod.createReadabilityOptimizer;
  if (!createFn) { check(false, 'No createReadabilityOptimizer export'); return; }

  const composition = {
    sections: [
      { id: 's1', content: 'Short content.', bullets: ['a', 'b', 'c'] },
      { id: 's2', content: 'Another section.', items: ['x', 'y', 'z'] }
    ]
  };

  const results = [];
  for (let i = 0; i < 100; i++) {
    const optimizer = createFn();
    const metrics = optimizer.validateReadability(composition);
    results.push(_stableRepr({
      valid: metrics.valid,
      errorCount: metrics.errors.length,
      warningCount: metrics.warnings.length
    }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Readability: 100 iterations produce identical validation');
}

function testAccessibilityPolishDeterminism() {
  log('info', '=== Accessibility Polish Determinism ===');
  const mod = loadModule('accessibility-polish.js');
  if (!mod) { check(false, 'Could not load accessibility-polish.js'); return; }
  const createFn = mod.createAccessibilityPolish;
  if (!createFn) { check(false, 'No createAccessibilityPolish export'); return; }

  const composition = {
    sections: [
      { id: 's1', type: 'visualization', hasVisualization: true },
      { id: 's2', type: 'laboratory', hasLaboratory: true },
      { id: 's3', type: 'core_explanation' }
    ]
  };

  const results = [];
  for (let i = 0; i < 100; i++) {
    const polish = createFn();
    const report = polish.validateAccessibility(composition);
    results.push(_stableRepr({
      valid: report.valid,
      errorCount: report.errors.length,
      annotationCount: report.annotations.length
    }));
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Accessibility: 100 iterations produce identical validation');
}

function testPlannerD1EIntegrationDeterminism() {
  log('info', '=== Planner D1E Integration Determinism ===');
  const plannerMod = loadModule('pedagogical-planner.js');
  if (!plannerMod) { check(false, 'Could not load pedagogical-planner.js'); return; }
  const createFn = plannerMod.createPedagogicalPlanner;
  if (!createFn) { check(false, 'No createPedagogicalPlanner export'); return; }

  const cloMod = loadModule('cognitive-load-optimizer.js');
  const ipeMod = loadModule('instructional-pacing-engine.js');
  const lcMod = loadModule('lesson-composer.js');
  const roMod = loadModule('readability-optimizer.js');
  const apMod = loadModule('accessibility-polish.js');

  if (!cloMod || !ipeMod || !lcMod || !roMod || !apMod) {
    check(false, 'Could not load one or more D1E modules');
    return;
  }

  const planner = createFn({
    cognitiveLoadOptimizer: cloMod.createCognitiveLoadOptimizer(),
    instructionalPacingEngine: ipeMod.createInstructionalPacingEngine(),
    lessonComposer: lcMod.createLessonComposer(),
    readabilityOptimizer: roMod.createReadabilityOptimizer(),
    accessibilityPolish: apMod.createAccessibilityPolish()
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
      visualizations: [],
      laboratories: [],
      sharedKnowledge: []
    },
    allowGenerative: false
  };

  const results = [];
  for (let i = 0; i < 50; i++) {
    const plan = planner.buildPlan(input);
    var stable = _stableRepr({
      hasLoadMetrics: !!(plan && plan.loadMetrics),
      hasPacingPlan: !!(plan && plan.pacingPlan),
      hasComposition: !!(plan && plan.composition),
      hasLessonOutline: !!(plan && plan.lessonOutline),
      hasReadabilityMetrics: !!(plan && plan.readabilityMetrics),
      hasAccessibilityAnnotations: !!(plan && plan.accessibilityAnnotations)
    });
    results.push(stable);
  }
  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'Planner with D1E: 50 iterations produce identical D1E field presence');
}

function testNoLearnerInferenceInD1EOutputs() {
  log('info', '=== No Learner Inference in D1E Outputs ===');
  const cloMod = loadModule('cognitive-load-optimizer.js');
  if (!cloMod) { check(false, 'Could not load cognitive-load-optimizer.js'); return; }
  const optimizer = cloMod.createCognitiveLoadOptimizer();
  const plan = { sections: [{ id: 'test', included: true }] };
  const metrics = optimizer.computeLoadMetrics(plan);

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

  const inf = walk(metrics);
  check(inf === null, 'LoadOptimizer: no learner inference in metrics (' + (inf || 'clean') + ')');
}

function testValidatorReportExists() {
  log('info', '=== Validator Report Check ===');
  const reportPath = path.join(__dirname, '..', 'docs', 'architecture', 'nv-1300', 'nv-1300-d1e-validator-report.json');
  check(fs.existsSync(reportPath), 'Validator report exists');
}

function runAllTests() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  NV-1300-D1E — Deterministic Verification');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  testCognitiveLoadOptimizerDeterminism();
  console.log('');
  testInstructionalPacingDeterminism();
  console.log('');
  testLessonComposerDeterminism();
  console.log('');
  testReadabilityOptimizerDeterminism();
  console.log('');
  testAccessibilityPolishDeterminism();
  console.log('');
  testPlannerD1EIntegrationDeterminism();
  console.log('');
  testNoLearnerInferenceInD1EOutputs();
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
    validator: 'NV-1300-D1E-deterministic-verification',
    timestamp: new Date().toISOString(),
    summary: { checks: checked, passed, errors: errors.length, verdict: errors.length === 0 ? 'READY' : 'NOT READY' },
    errors
  };

  try {
    fs.writeFileSync(path.join(reportDir, 'nv-1300-d1e-verify-report.json'), JSON.stringify(report, null, 2));
    console.log('  Report written to docs/architecture/nv-1300/nv-1300-d1e-verify-report.json');
  } catch (e) { console.log('  Could not write report: ' + e.message); }

  console.log('');
  process.exit(errors.length === 0 ? 0 : 1);
}

runAllTests();
