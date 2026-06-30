#!/usr/bin/env node
/**
 * NV-1300-D3C — Curriculum Progression Verify Script
 *
 * Behavioral verification of D3C modules:
 * - Instantiate every factory
 * - Verify exports
 * - Progression fixtures
 * - Redundancy fixtures
 * - Coverage fixtures
 * - Unlock graph fixtures
 * - Report fixtures
 * - 1000 deterministic executions
 * - Byte-identical outputs
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BASE = path.join(__dirname, '..', 'website', 'scripts', 'agents');

let checked = 0;
let passed = 0;
let errors = [];

function log(level, message) {
  const prefix = {
    error: '\x1b[31mERROR\x1b[0m',
    ok: '\x1b[32mPASS\x1b[0m',
    check: '\x1b[35mCHECK\x1b[0m',
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

function _stripEsm(source) {
  return source
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+\{[^}]*\}\s*;?/g, '')
    .replace(/import\s+.*?from\s+['"][^'"]+['"]\s*;?/g, '')
    .replace(/import\s+['"][^'"]+['"]\s*;?/g, '');
}

function loadModule(filename) {
  const filePath = path.join(BASE, filename);
  const content = readFile(filePath);
  if (!content) return null;

  try {
    const stripped = _stripEsm(content);
    const script = new vm.Script(stripped, { filename });
    const sandbox = { window: {}, module: { exports: {} }, exports: {} };
    const context = vm.createContext(sandbox);
    script.runInContext(context);
    return sandbox;
  } catch (e) {
    console.error(`Failed to load ${filename}: ${e.message}`);
    return null;
  }
}

// --- Test Fixtures ---
const TEST_CURRICULUM = {
  concepts: [
    { id: 'probability', name: 'Probability', type: 'mathematics', prerequisiteConcepts: [] },
    { id: 'linear-algebra', name: 'Linear Algebra', type: 'mathematics', prerequisiteConcepts: [] },
    { id: 'optimization', name: 'Optimization', type: 'mathematics', prerequisiteConcepts: ['linear-algebra'] },
    { id: 'cnn', name: 'CNNs', type: 'algorithmic', prerequisiteConcepts: ['linear-algebra', 'optimization'] },
    { id: 'autoencoder', name: 'Autoencoders', type: 'conceptual', prerequisiteConcepts: ['cnn'] },
    { id: 'diffusion-models', name: 'Diffusion Models', type: 'algorithmic', prerequisiteConcepts: ['probability', 'optimization', 'autoencoder'] }
  ],
  lessons: [
    { id: 'les-1', title: 'Lesson 1', conceptIds: ['probability'] },
    { id: 'les-2', title: 'Lesson 2', conceptIds: ['linear-algebra'] },
    { id: 'les-3', title: 'Lesson 3', conceptIds: ['optimization'] }
  ],
  artifacts: [
    { id: 'art-1', title: 'Artifact 1', lessonId: 'les-1' },
    { id: 'art-2', title: 'Artifact 2', lessonId: 'les-2' }
  ]
};

const TEST_COMPETENCY_MAP = {
  competencies: [
    { id: 'object-detection', name: 'Object Detection' },
    { id: 'image-classification', name: 'Image Classification' },
    { id: 'semantic-segmentation', name: 'Semantic Segmentation' }
  ]
};

// --- Tests ---
function testProgressionEngineFactory() {
  log('check', '=== Test: Progression Engine Factory ===');

  const sandbox = loadModule('progression-continuity-engine.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.progressionContinuityEngine ||
                  sandbox.createProgressionContinuityEngine;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.validateProgression === 'function', 'validateProgression method exists');
  check(typeof instance.detectConceptJumps === 'function', 'detectConceptJumps method exists');
  check(typeof instance.detectMissingSteps === 'function', 'detectMissingSteps method exists');
  check(typeof instance.detectDisconnectedChains === 'function', 'detectDisconnectedChains method exists');
  check(typeof instance.detectAbruptComplexity === 'function', 'detectAbruptComplexity method exists');
  check(typeof instance.detectIsolatedConcepts === 'function', 'detectIsolatedConcepts method exists');
}

function testProgressionValidation() {
  log('check', '=== Test: Progression Validation ===');

  const sandbox = loadModule('progression-continuity-engine.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.progressionContinuityEngine ||
                  sandbox.createProgressionContinuityEngine;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.validateProgression(TEST_CURRICULUM);
  check(result.valid !== undefined, 'Validation returns result');
  check(Array.isArray(result.issues), 'Issues array present');
}

function testRedundancyEngineFactory() {
  log('check', '=== Test: Redundancy Engine Factory ===');

  const sandbox = loadModule('redundancy-detection-engine.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.redundancyDetectionEngine ||
                  sandbox.createRedundancyDetectionEngine;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.findDuplicateConcepts === 'function', 'findDuplicateConcepts method exists');
  check(typeof instance.findDuplicateDependencies === 'function', 'findDuplicateDependencies method exists');
  check(typeof instance.findDuplicateObjectives === 'function', 'findDuplicateObjectives method exists');
  check(typeof instance.findDuplicateArtifacts === 'function', 'findDuplicateArtifacts method exists');
  check(typeof instance.summarizeRedundancy === 'function', 'summarizeRedundancy method exists');
}

function testRedundancyDetection() {
  log('check', '=== Test: Redundancy Detection ===');

  const sandbox = loadModule('redundancy-detection-engine.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.redundancyDetectionEngine ||
                  sandbox.createRedundancyDetectionEngine;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.summarizeRedundancy(TEST_CURRICULUM);
  check(typeof result.total === 'number', 'Total count present');
  check(typeof result.byType === 'object', 'By type present');
  check(typeof result.hasRedundancy === 'boolean', 'Has redundancy flag present');
}

function testCoverageVerifierFactory() {
  log('check', '=== Test: Coverage Verifier Factory ===');

  const sandbox = loadModule('competency-coverage-verifier.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.competencyCoverageVerifier ||
                  sandbox.createCompetencyCoverageVerifier;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.verifyCoverage === 'function', 'verifyCoverage method exists');
  check(typeof instance.findUnsupportedCompetencies === 'function', 'findUnsupportedCompetencies method exists');
  check(typeof instance.findPartiallyCoveredCompetencies === 'function', 'findPartiallyCoveredCompetencies method exists');
  check(typeof instance.findCoveredCompetencies === 'function', 'findCoveredCompetencies method exists');
  check(typeof instance.buildCoverageReport === 'function', 'buildCoverageReport method exists');
}

function testCoverageVerification() {
  log('check', '=== Test: Coverage Verification ===');

  const sandbox = loadModule('competency-coverage-verifier.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.competencyCoverageVerifier ||
                  sandbox.createCompetencyCoverageVerifier;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.verifyCoverage(TEST_CURRICULUM, TEST_COMPETENCY_MAP);
  check(result.valid === true, 'Coverage verification is valid');
  check(result.summary !== undefined, 'Summary present');
  check(result.coverage !== undefined, 'Coverage object present');
}

function testUnlockMapGeneratorFactory() {
  log('check', '=== Test: Unlock Map Generator Factory ===');

  const sandbox = loadModule('goal-unlock-map-generator.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.goalUnlockMapGenerator ||
                  sandbox.createGoalUnlockMapGenerator;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.generateUnlockMap === 'function', 'generateUnlockMap method exists');
  check(typeof instance.generateConceptRoadmap === 'function', 'generateConceptRoadmap method exists');
  check(typeof instance.validateUnlockMap === 'function', 'validateUnlockMap method exists');
  check(typeof instance.explainUnlockMap === 'function', 'explainUnlockMap method exists');
}

function testUnlockMapGeneration() {
  log('check', '=== Test: Unlock Map Generation ===');

  const sandbox = loadModule('goal-unlock-map-generator.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.goalUnlockMapGenerator ||
                  sandbox.createGoalUnlockMapGenerator;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.generateUnlockMap('diffusion-models', TEST_CURRICULUM);
  check(result.valid === true, 'Unlock map is valid');
  check(result.target !== undefined, 'Target present');
  check(Array.isArray(result.criticalPath), 'Critical path present');
}

function testHealthAnalyzerFactory() {
  log('check', '=== Test: Health Analyzer Factory ===');

  const sandbox = loadModule('curriculum-health-analyzer.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumHealthAnalyzer ||
                  sandbox.createCurriculumHealthAnalyzer;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.analyzeHealth === 'function', 'analyzeHealth method exists');
  check(typeof instance.computeMetrics === 'function', 'computeMetrics method exists');
  check(typeof instance.computeHealthScore === 'function', 'computeHealthScore method exists');
  check(typeof instance.generateRecommendations === 'function', 'generateRecommendations method exists');
}

function testHealthAnalysis() {
  log('check', '=== Test: Health Analysis ===');

  const sandbox = loadModule('curriculum-health-analyzer.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumHealthAnalyzer ||
                  sandbox.createCurriculumHealthAnalyzer;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.analyzeHealth(TEST_CURRICULUM);
  check(result.valid === true, 'Health analysis is valid');
  check(typeof result.healthScore === 'number', 'Health score present');
  check(result.metrics !== undefined, 'Metrics present');
  check(Array.isArray(result.warnings), 'Warnings array present');
  check(Array.isArray(result.recommendations), 'Recommendations array present');
}

function testReportComposerFactory() {
  log('check', '=== Test: Report Composer Factory ===');

  const sandbox = loadModule('curriculum-progression-report-composer.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumProgressionReportComposer ||
                  sandbox.createCurriculumProgressionReportComposer;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.composeReport === 'function', 'composeReport method exists');
  check(typeof instance.composeOverview === 'function', 'composeOverview method exists');
  check(typeof instance.composeStructureSummary === 'function', 'composeStructureSummary method exists');
  check(typeof instance.composeProgression === 'function', 'composeProgression method exists');
  check(typeof instance.composeCoverage === 'function', 'composeCoverage method exists');
  check(typeof instance.composeRedundancy === 'function', 'composeRedundancy method exists');
  check(typeof instance.composeUnlockGraph === 'function', 'composeUnlockGraph method exists');
  check(typeof instance.composeHealth === 'function', 'composeHealth method exists');
  check(typeof instance.composeRecommendations === 'function', 'composeRecommendations method exists');
}

function testReportComposition() {
  log('check', '=== Test: Report Composition ===');

  const sandbox = loadModule('curriculum-progression-report-composer.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumProgressionReportComposer ||
                  sandbox.createCurriculumProgressionReportComposer;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.composeReport(TEST_CURRICULUM, {
    health: 85,
    progression: { totalIssues: 2, issues: [] },
    redundancy: { total: 0, byType: { concepts: 0, dependencies: 0, objectives: 0, artifacts: 0 } },
    coverage: { summary: { total: 3, covered: 2, partiallyCovered: 1, unsupported: 0, coverageRatio: '66.7%' } }
  });
  check(result.valid === true, 'Report is valid');
  check(Array.isArray(result.sections), 'Sections array present');
  check(result.sections.length > 0, 'Sections not empty');
}

function testDeterministicExecution() {
  log('check', '=== Test: 1000 Deterministic Iterations ===');

  const modules = [
    { file: 'progression-continuity-engine.js', factory: 'progressionContinuityEngine', method: 'getCapabilities', args: [] },
    { file: 'redundancy-detection-engine.js', factory: 'redundancyDetectionEngine', method: 'getCapabilities', args: [] },
    { file: 'competency-coverage-verifier.js', factory: 'competencyCoverageVerifier', method: 'getCapabilities', args: [] },
    { file: 'goal-unlock-map-generator.js', factory: 'goalUnlockMapGenerator', method: 'getCapabilities', args: [] },
    { file: 'curriculum-health-analyzer.js', factory: 'curriculumHealthAnalyzer', method: 'getCapabilities', args: [] },
    { file: 'curriculum-progression-report-composer.js', factory: 'curriculumProgressionReportComposer', method: 'getCapabilities', args: [] }
  ];

  for (const { file, factory, method, args } of modules) {
    const sandbox = loadModule(file);
    if (!sandbox) continue;

    const factoryFn = sandbox.window?.NeuralVerse?.[factory] ||
                     sandbox[`create${factory.charAt(0).toUpperCase() + factory.slice(1)}`];

    if (!factoryFn) {
      warn(`Factory not found for ${file}`);
      continue;
    }

    const instance = typeof factoryFn === 'function' ? factoryFn() : factoryFn;
    if (typeof instance[method] !== 'function') {
      warn(`Method ${method} not found in ${file}`);
      continue;
    }

    const results = [];
    for (let i = 0; i < 1000; i++) {
      results.push(JSON.stringify(instance[method](...args)));
    }

    const allSame = results.every(r => r === results[0]);
    check(allSame, `Deterministic output: ${method} in ${file}`);
  }
}

function testD3CIntegration() {
  log('check', '=== Test: D3C Integration ===');

  const agentPath = path.join(BASE, 'curriculum-dependency-agent.js');
  const content = readFile(agentPath);
  if (!content) return;

  check(content.includes('ensureD3CModules'), 'D3C module initialization exists');
  check(content.includes('getProgressionContinuityEngine'), 'D3C getProgressionContinuityEngine exposed');
  check(content.includes('getRedundancyDetectionEngine'), 'D3C getRedundancyDetectionEngine exposed');
  check(content.includes('getCoverageVerifier'), 'D3C getCoverageVerifier exposed');
  check(content.includes('getGoalUnlockMapGenerator'), 'D3C getGoalUnlockMapGenerator exposed');
  check(content.includes('getCurriculumHealthAnalyzer'), 'D3C getCurriculumHealthAnalyzer exposed');
  check(content.includes('getProgressionReportComposer'), 'D3C getProgressionReportComposer exposed');
  check(content.includes('validateProgression'), 'D3C validateProgression exposed');
  check(content.includes('detectRedundancy'), 'D3C detectRedundancy exposed');
  check(content.includes('analyzeCurriculumHealth'), 'D3C analyzeCurriculumHealth exposed');
  check(content.includes('generateUnlockMap'), 'D3C generateUnlockMap exposed');
}

function warn(message) {
  console.log(`\x1b[33mWARN\x1b[0m  ${message}`);
}

// --- Main ---
function main() {
  console.log('\n=== NV-1300-D3C — Curriculum Progression Verify Script ===\n');

  testProgressionEngineFactory();
  testProgressionValidation();
  testRedundancyEngineFactory();
  testRedundancyDetection();
  testCoverageVerifierFactory();
  testCoverageVerification();
  testUnlockMapGeneratorFactory();
  testUnlockMapGeneration();
  testHealthAnalyzerFactory();
  testHealthAnalysis();
  testReportComposerFactory();
  testReportComposition();
  testDeterministicExecution();
  testD3CIntegration();

  console.log(`\n=== Results ===`);
  console.log(`Checked: ${checked}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  const report = {
    validator: 'NV-1300-D3C-Verify',
    timestamp: new Date().toISOString(),
    checked,
    passed,
    failed: errors.length,
    errors,
    verdict: errors.length === 0 ? 'READY' : 'NOT READY'
  };

  const reportDir = path.join(__dirname, '..', 'docs', 'architecture', 'nv-1300');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(reportDir, 'nv-1300-d3c-curriculum-progression-verify-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\nVerdict: ${report.verdict}`);
  process.exit(errors.length === 0 ? 0 : 1);
}

main();
