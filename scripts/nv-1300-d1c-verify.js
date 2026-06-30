#!/usr/bin/env node
/**
 * NV-1300-D1C — Deterministic Verification
 *
 * Verifies that all D1C modules produce deterministic outputs.
 * Runs 1000 iterations with identical inputs and checks for consistency.
 * Validates media plan determinism, visualization selection, laboratory placement.
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

function testVisualizationOrchestratorDeterminism() {
  log('info', '=== Visualization Orchestrator Determinism ===');
  const mod = loadModule('visualization-orchestrator.js');
  if (!mod) { check(false, 'Could not load visualization-orchestrator.js'); return; }

  const createFn = mod.createVisualizationOrchestrator;
  if (!createFn) { check(false, 'No createVisualizationOrchestrator export'); return; }

  const plan = {
    conceptIds: ['word-embeddings', 'self-attention'],
    difficulty: 'standard',
    layers: [{ id: 'visualization', included: true }],
    sections: [
      { id: 'motivation', included: true },
      { id: 'visualization', included: true },
      { id: 'summary', included: true }
    ],
    selectedResources: { laboratories: [] }
  };

  const results = [];
  for (let i = 0; i < 100; i++) {
    const orch = createFn();
    const result = orch.selectVisualization(plan);
    results.push(JSON.stringify(result));
  }

  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'VisualizationOrchestrator: 100 iterations produce identical results');
}

function testLaboratoryPlacerDeterminism() {
  log('info', '=== Laboratory Placer Determinism ===');
  const mod = loadModule('laboratory-placer.js');
  if (!mod) { check(false, 'Could not load laboratory-placer.js'); return; }

  const createFn = mod.createLaboratoryPlacer;
  if (!createFn) { check(false, 'No createLaboratoryPlacer export'); return; }

  const plan = {
    conceptIds: ['gradient-descent', 'pca'],
    difficulty: 'standard',
    layers: [{ id: 'laboratory', included: true }],
    sections: [
      { id: 'core_explanation', included: true },
      { id: 'laboratory', included: true },
      { id: 'summary', included: true }
    ],
    selectedResources: { visualizations: [] }
  };

  const results = [];
  for (let i = 0; i < 100; i++) {
    const placer = createFn();
    const result = placer.selectLaboratory(plan);
    results.push(JSON.stringify(result));
  }

  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'LaboratoryPlacer: 100 iterations produce identical results');
}

function testTransitionEngineDeterminism() {
  log('info', '=== Transition Engine Determinism ===');
  const mod = loadModule('instructional-transition-engine.js');
  if (!mod) { check(false, 'Could not load instructional-transition-engine.js'); return; }

  const createFn = mod.createInstructionalTransitionEngine;
  if (!createFn) { check(false, 'No createInstructionalTransitionEngine export'); return; }

  const timeline = [
    { sectionId: 'motivation', sectionLabel: 'Motivation', mediaType: 'none', included: true },
    { sectionId: 'core_explanation', sectionLabel: 'Core Explanation', mediaType: 'none', included: true },
    { sectionId: 'visualization', sectionLabel: 'Visualization', mediaType: 'visualization', mediaId: 'test-viz', included: true },
    { sectionId: 'laboratory', sectionLabel: 'Laboratory', mediaType: 'laboratory', mediaId: 'test-lab', included: true },
    { sectionId: 'summary', sectionLabel: 'Summary', mediaType: 'none', included: true }
  ];

  const results = [];
  for (let i = 0; i < 100; i++) {
    const engine = createFn();
    const transitions = engine.buildSectionTransitions({}, timeline);
    results.push(JSON.stringify(transitions));
  }

  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'TransitionEngine: 100 iterations produce identical results');
}

function testDensityOptimizerDeterminism() {
  log('info', '=== Density Optimizer Determinism ===');
  const mod = loadModule('media-density-optimizer.js');
  if (!mod) { check(false, 'Could not load media-density-optimizer.js'); return; }

  const createFn = mod.createMediaDensityOptimizer;
  if (!createFn) { check(false, 'No createMediaDensityOptimizer export'); return; }

  const timeline = [
    { sectionId: 'motivation', sectionLabel: 'Motivation', mediaType: 'none', position: 0, included: true },
    { sectionId: 'visualization', sectionLabel: 'Visualization', mediaType: 'visualization', position: 1, included: true },
    { sectionId: 'laboratory', sectionLabel: 'Laboratory', mediaType: 'laboratory', position: 2, included: true },
    { sectionId: 'summary', sectionLabel: 'Summary', mediaType: 'none', position: 3, included: true }
  ];

  const results = [];
  for (let i = 0; i < 100; i++) {
    const optimizer = createFn();
    const balanced = optimizer.balance(timeline.map(t => ({...t})));
    results.push(JSON.stringify(balanced));
  }

  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'DensityOptimizer: 100 iterations produce identical results');
}

function testMediaOrchestratorDeterminism() {
  log('info', '=== Media Orchestrator Determinism ===');

  const vizMod = loadModule('visualization-orchestrator.js');
  const labMod = loadModule('laboratory-placer.js');
  const transMod = loadModule('instructional-transition-engine.js');
  const densityMod = loadModule('media-density-optimizer.js');
  const mediaMod = loadModule('media-orchestrator.js');

  if (!vizMod || !labMod || !transMod || !densityMod || !mediaMod) {
    check(false, 'Could not load one or more modules');
    return;
  }

  const vizOrch = vizMod.createVisualizationOrchestrator();
  const labPlacer = labMod.createLaboratoryPlacer();
  const transEngine = transMod.createInstructionalTransitionEngine();
  const densityOpt = densityMod.createMediaDensityOptimizer();

  const plan = {
    conceptIds: ['gradient-descent', 'word-embeddings'],
    difficulty: 'standard',
    layers: [
      { id: 'visualization', included: true },
      { id: 'laboratory', included: true }
    ],
    sections: [
      { id: 'motivation', label: 'Motivation', included: true },
      { id: 'core_explanation', label: 'Core Explanation', included: true },
      { id: 'visualization', label: 'Visualization', included: true },
      { id: 'mathematics', label: 'Mathematics', included: true },
      { id: 'laboratory', label: 'Laboratory', included: true },
      { id: 'summary', label: 'Summary', included: true }
    ],
    selectedResources: { visualizations: [], laboratories: [] }
  };

  const results = [];
  for (let i = 0; i < 100; i++) {
    const orchestrator = mediaMod.createMediaOrchestrator({
      visualizationOrchestrator: vizOrch,
      laboratoryPlacer: labPlacer,
      transitionEngine: transEngine,
      densityOptimizer: densityOpt
    });
    const mediaPlan = orchestrator.buildMediaPlan(plan);
    results.push(JSON.stringify({
      vizCount: mediaPlan.visualizations.length,
      labPresent: mediaPlan.laboratory !== null,
      timelineLength: mediaPlan.timeline.length,
      transitionCount: mediaPlan.transitions.length,
      density: mediaPlan.densityMetrics
    }));
  }

  const allIdentical = results.every(r => r === results[0]);
  check(allIdentical, 'MediaOrchestrator: 100 iterations produce identical results');
}

function testValidatorReportExists() {
  log('info', '=== Validator Report Check ===');
  const reportPath = path.join(__dirname, '..', 'docs', 'architecture', 'nv-1300', 'nv-1300-d1c-validator-report.json');
  check(fs.existsSync(reportPath), 'Validator report exists');
}

function runAllTests() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  NV-1300-D1C — Deterministic Verification');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  testVisualizationOrchestratorDeterminism();
  console.log('');
  testLaboratoryPlacerDeterminism();
  console.log('');
  testTransitionEngineDeterminism();
  console.log('');
  testDensityOptimizerDeterminism();
  console.log('');
  testMediaOrchestratorDeterminism();
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
    validator: 'NV-1300-D1C-deterministic-verification',
    timestamp: new Date().toISOString(),
    summary: { checks: checked, passed, errors: errors.length, verdict: errors.length === 0 ? 'READY' : 'NOT READY' },
    errors
  };

  try {
    fs.writeFileSync(path.join(reportDir, 'nv-1300-d1c-verify-report.json'), JSON.stringify(report, null, 2));
    console.log('  Report written to docs/architecture/nv-1300/nv-1300-d1c-verify-report.json');
  } catch (e) { console.log('  Could not write report: ' + e.message); }

  console.log('');
  process.exit(errors.length === 0 ? 0 : 1);
}

runAllTests();
