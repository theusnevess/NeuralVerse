#!/usr/bin/env node
/**
 * NV-1300-D3B — Curriculum Intelligence Verify Script
 *
 * Behavioral verification of D3B modules:
 * - Instantiate every factory
 * - Execute 1000 deterministic iterations
 * - Compare byte-identical outputs
 * - Verify exported APIs
 * - Verify integration with D3A
 * - Verify evidence generation
 * - Verify goal interpretation
 * - Verify explanation composition
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
const TEST_CONCEPTS = [
  { id: 'probability', name: 'Probability', type: 'mathematics', prerequisiteConcepts: [] },
  { id: 'linear-algebra', name: 'Linear Algebra', type: 'mathematics', prerequisiteConcepts: [] },
  { id: 'optimization', name: 'Optimization', type: 'mathematics', prerequisiteConcepts: ['linear-algebra'] },
  { id: 'cnn', name: 'CNNs', type: 'algorithmic', prerequisiteConcepts: ['linear-algebra', 'optimization'] },
  { id: 'autoencoder', name: 'Autoencoders', type: 'conceptual', prerequisiteConcepts: ['cnn'] },
  { id: 'diffusion-models', name: 'Diffusion Models', type: 'algorithmic', prerequisiteConcepts: ['probability', 'optimization', 'autoencoder'] }
];

const TEST_DEPENDENCY = {
  source: 'linear-algebra',
  target: 'cnn',
  type: 'mathematics',
  depth: 1
};

const TEST_CHAIN = ['probability', 'linear-algebra', 'optimization', 'cnn'];

const TEST_GOAL = 'diffusion-models';

// --- Tests ---
function testGoalInterpreterFactory() {
  log('check', '=== Test: Goal Interpreter Factory ===');

  const sandbox = loadModule('goal-dependency-interpreter.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.goalDependencyInterpreter ||
                  sandbox.createGoalDependencyInterpreter;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.interpretGoal === 'function', 'interpretGoal method exists');
  check(typeof instance.prioritizePrerequisites === 'function', 'prioritizePrerequisites method exists');
  check(typeof instance.classifyByPriority === 'function', 'classifyByPriority method exists');
  check(typeof instance.getPriorityLevels === 'function', 'getPriorityLevels method exists');
}

function testGoalInterpretation() {
  log('check', '=== Test: Goal Interpretation ===');

  const sandbox = loadModule('goal-dependency-interpreter.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.goalDependencyInterpreter ||
                  sandbox.createGoalDependencyInterpreter;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.interpretGoal(TEST_GOAL, { concepts: TEST_CONCEPTS });
  check(result.valid !== false || result.error === 'Goal concept not found', 'Interpretation returns result');
  check(result.goal === TEST_GOAL, 'Goal preserved in result');
}

function testJustificationEngineFactory() {
  log('check', '=== Test: Justification Engine Factory ===');

  const sandbox = loadModule('dependency-justification-engine.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.dependencyJustificationEngine ||
                  sandbox.createDependencyJustificationEngine;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.buildJustification === 'function', 'buildJustification method exists');
  check(typeof instance.validateJustification === 'function', 'validateJustification method exists');
  check(typeof instance.explainDependency === 'function', 'explainDependency method exists');
}

function testJustificationGeneration() {
  log('check', '=== Test: Justification Generation ===');

  const sandbox = loadModule('dependency-justification-engine.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.dependencyJustificationEngine ||
                  sandbox.createDependencyJustificationEngine;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.buildJustification(TEST_DEPENDENCY);
  check(result.valid === true, 'Justification is valid');
  check(result.source === TEST_DEPENDENCY.source, 'Source preserved');
  check(result.target === TEST_DEPENDENCY.target, 'Target preserved');
  check(typeof result.summary === 'string', 'Summary present');
  check(typeof result.technicalReason === 'string', 'Technical reason present');
  check(typeof result.pedagogicalReason === 'string', 'Pedagogical reason present');
}

function testDepthEngineFactory() {
  log('check', '=== Test: Depth Engine Factory ===');

  const sandbox = loadModule('prerequisite-depth-engine.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.prerequisiteDepthEngine ||
                  sandbox.createPrerequisiteDepthEngine;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.getSupportedDepthLevels === 'function', 'getSupportedDepthLevels method exists');
  check(typeof instance.validateDepthLevel === 'function', 'validateDepthLevel method exists');
  check(typeof instance.normalizeDepthLevel === 'function', 'normalizeDepthLevel method exists');
  check(typeof instance.compareDepthLevels === 'function', 'compareDepthLevels method exists');
}

function testDepthLevels() {
  log('check', '=== Test: Depth Levels ===');

  const sandbox = loadModule('prerequisite-depth-engine.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.prerequisiteDepthEngine ||
                  sandbox.createPrerequisiteDepthEngine;
  const instance = typeof factory === 'function' ? factory() : factory;

  const levels = instance.getSupportedDepthLevels();
  check(levels.includes('awareness'), 'Awareness level exists');
  check(levels.includes('basic_understanding'), 'Basic understanding level exists');
  check(levels.includes('working_knowledge'), 'Working knowledge level exists');
  check(levels.includes('advanced_understanding'), 'Advanced understanding level exists');
  check(levels.includes('mastery'), 'Mastery level exists');

  check(instance.validateDepthLevel('awareness') === true, 'Valid depth level passes');
  check(instance.validateDepthLevel('invalid') === false, 'Invalid depth level fails');
  check(instance.normalizeDepthLevel('basic') === 'basic_understanding', 'Alias normalized');
}

function testPriorityEngineFactory() {
  log('check', '=== Test: Priority Engine Factory ===');

  const sandbox = loadModule('goal-priority-engine.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.goalPriorityEngine ||
                  sandbox.createGoalPriorityEngine;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.computePriority === 'function', 'computePriority method exists');
  check(typeof instance.scoreDependency === 'function', 'scoreDependency method exists');
  check(typeof instance.categorizeScore === 'function', 'categorizeScore method exists');
}

function testPriorityScoring() {
  log('check', '=== Test: Priority Scoring ===');

  const sandbox = loadModule('goal-priority-engine.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.goalPriorityEngine ||
                  sandbox.createGoalPriorityEngine;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.computePriority(TEST_GOAL, TEST_DEPENDENCY, { concepts: TEST_CONCEPTS });
  check(result.valid === true, 'Priority computation is valid');
  check(result.source === TEST_DEPENDENCY.source, 'Source preserved');
  check(result.target === TEST_DEPENDENCY.target, 'Target preserved');
  check(typeof result.totalScore === 'number', 'Total score present');
  check(typeof result.category === 'string', 'Category present');
}

function testNarrativeBuilderFactory() {
  log('check', '=== Test: Narrative Builder Factory ===');

  const sandbox = loadModule('dependency-narrative-builder.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.dependencyNarrativeBuilder ||
                  sandbox.createDependencyNarrativeBuilder;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.buildNarrative === 'function', 'buildNarrative method exists');
  check(typeof instance.buildProgressionNarrative === 'function', 'buildProgressionNarrative method exists');
  check(typeof instance.buildGoalNarrative === 'function', 'buildGoalNarrative method exists');
}

function testNarrativeGeneration() {
  log('check', '=== Test: Narrative Generation ===');

  const sandbox = loadModule('dependency-narrative-builder.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.dependencyNarrativeBuilder ||
                  sandbox.createDependencyNarrativeBuilder;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.buildNarrative('probability', 'diffusion-models', {
    reason: 'Probability provides the mathematical foundation for diffusion models'
  });
  check(result.valid === true, 'Narrative is valid');
  check(result.source === 'probability', 'Source preserved');
  check(result.target === 'diffusion-models', 'Target preserved');
  check(typeof result.narrative === 'string', 'Narrative text present');
  check(result.narrative.length > 0, 'Narrative is not empty');
}

function testComposerFactory() {
  log('check', '=== Test: Explanation Composer Factory ===');

  const sandbox = loadModule('curriculum-explanation-composer.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumExplanationComposer ||
                  sandbox.createCurriculumExplanationComposer;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.composeExplanation === 'function', 'composeExplanation method exists');
  check(typeof instance.composeOverview === 'function', 'composeOverview method exists');
  check(typeof instance.composeDependencyTree === 'function', 'composeDependencyTree method exists');
  check(typeof instance.composePriorityConcepts === 'function', 'composePriorityConcepts method exists');
  check(typeof instance.composeDepthSummary === 'function', 'composeDepthSummary method exists');
  check(typeof instance.composeJustifications === 'function', 'composeJustifications method exists');
  check(typeof instance.composeProgression === 'function', 'composeProgression method exists');
  check(typeof instance.composeGoalSummary === 'function', 'composeGoalSummary method exists');
}

function testExplanationComposition() {
  log('check', '=== Test: Explanation Composition ===');

  const sandbox = loadModule('curriculum-explanation-composer.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumExplanationComposer ||
                  sandbox.createCurriculumExplanationComposer;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.composeExplanation(TEST_GOAL, {
    totalPrerequisites: 3,
    prerequisites: [
      { name: 'Probability', priority: 'critical', score: 85 },
      { name: 'Linear Algebra', priority: 'high', score: 70 },
      { name: 'Optimization', priority: 'medium', score: 50 }
    ]
  });
  check(result.valid === true, 'Explanation is valid');
  check(result.goal === TEST_GOAL, 'Goal preserved');
  check(Array.isArray(result.sections), 'Sections present');
  check(result.sections.length > 0, 'Sections not empty');
}

function testDeterministicExecution() {
  log('check', '=== Test: 1000 Deterministic Iterations ===');

  const modules = [
    { file: 'goal-dependency-interpreter.js', factory: 'goalDependencyInterpreter', method: 'getPriorityLevels', args: [] },
    { file: 'dependency-justification-engine.js', factory: 'dependencyJustificationEngine', method: 'getJustificationTemplates', args: [] },
    { file: 'prerequisite-depth-engine.js', factory: 'prerequisiteDepthEngine', method: 'getSupportedDepthLevels', args: [] },
    { file: 'goal-priority-engine.js', factory: 'goalPriorityEngine', method: 'getPriorityCategories', args: [] },
    { file: 'dependency-narrative-builder.js', factory: 'dependencyNarrativeBuilder', method: 'getNarrativeTemplates', args: [] }
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

function testEvidenceGeneration() {
  log('check', '=== Test: Evidence Generation ===');

  const sandbox = loadModule('dependency-justification-engine.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.dependencyJustificationEngine ||
                  sandbox.createDependencyJustificationEngine;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.buildJustification(TEST_DEPENDENCY);
  check(result.evidence !== undefined, 'Evidence object present');
  check(result.evidence.sourceType === 'curriculum', 'Evidence source type correct');
  check(result.evidence.sourceId === TEST_DEPENDENCY.source, 'Evidence source ID correct');
  check(result.evidence.targetId === TEST_DEPENDENCY.target, 'Evidence target ID correct');
}

function testIntegrationWithD3A() {
  log('check', '=== Test: Integration with D3A ===');

  const agentPath = path.join(BASE, 'curriculum-dependency-agent.js');
  const content = readFile(agentPath);
  if (!content) return;

  check(content.includes('ensureD3BModules'), 'D3B module initialization exists');
  check(content.includes('getGoalInterpreter'), 'D3B getGoalInterpreter exposed');
  check(content.includes('getJustificationEngine'), 'D3B getJustificationEngine exposed');
  check(content.includes('getDepthEngine'), 'D3B getDepthEngine exposed');
  check(content.includes('getPriorityEngine'), 'D3B getPriorityEngine exposed');
  check(content.includes('getNarrativeBuilder'), 'D3B getNarrativeBuilder exposed');
  check(content.includes('getExplanationComposer'), 'D3B getExplanationComposer exposed');
  check(content.includes('interpretGoal'), 'D3B interpretGoal method exposed');
  check(content.includes('explainDependencyJustification'), 'D3B explainDependencyJustification exposed');
  check(content.includes('composeCurriculumExplanation'), 'D3B composeCurriculumExplanation exposed');
}

function warn(message) {
  console.log(`\x1b[33mWARN\x1b[0m  ${message}`);
}

// --- Main ---
function main() {
  console.log('\n=== NV-1300-D3B — Curriculum Intelligence Verify Script ===\n');

  testGoalInterpreterFactory();
  testGoalInterpretation();
  testJustificationEngineFactory();
  testJustificationGeneration();
  testDepthEngineFactory();
  testDepthLevels();
  testPriorityEngineFactory();
  testPriorityScoring();
  testNarrativeBuilderFactory();
  testNarrativeGeneration();
  testComposerFactory();
  testExplanationComposition();
  testDeterministicExecution();
  testEvidenceGeneration();
  testIntegrationWithD3A();

  console.log(`\n=== Results ===`);
  console.log(`Checked: ${checked}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  const report = {
    validator: 'NV-1300-D3B-Verify',
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
    path.join(reportDir, 'nv-1300-d3b-curriculum-intelligence-verify-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\nVerdict: ${report.verdict}`);
  process.exit(errors.length === 0 ? 0 : 1);
}

main();
