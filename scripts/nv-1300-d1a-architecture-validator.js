#!/usr/bin/env node
/**
 * NV-1300-D1A-F1 — Architecture Hardening Validator
 *
 * Validates architecture hardening goals:
 * - Validator precision (no false positives)
 * - Planner orchestration boundaries
 * - Dependency injection verification
 * - Example Provider abstraction presence
 * - Backward compatibility
 * - Zero API regressions
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { tokenizeSource, hasForbiddenPattern, hasForbiddenTerm } = require('./governance-tokenizer.js');

const BASE = path.join(__dirname, '..', 'website', 'scripts', 'agents');
const AGENTS_DIR = path.join(__dirname, '..', 'website', 'scripts', 'agents');

let errors = [];
let warnings = [];
let checked = 0;
let passed = 0;

function log(level, message) {
  const prefix = {
    error: '\x1b[31mERROR\x1b[0m',
    warn: '\x1b[33mWARN\x1b[0m',
    ok: '\x1b[32mPASS\x1b[0m',
    info: '\x1b[36mINFO\x1b[0m',
    check: '\x1b[35mCHECK\x1b[0m'
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

function fileExists(filePath) { return fs.existsSync(filePath); }

// --- Objective 1: Validator Precision ---
function testValidatorPrecision() {
  log('check', '=== Objective 1: Validator Precision ===');

  const testFiles = [
    'pedagogical-planner.js',
    'composition-graph.js',
    'instructional-layers.js',
    'difficulty-ladder.js',
    'multi-perspective-engine.js',
    'semantic-dependency-resolver.js',
    'cross-domain-connector.js',
    'recap-inserter.js'
  ];

  // These patterns MUST NOT trigger when in comments/strings
  const falsePositivePatterns = [
    /\bMath\.random\b/g,
    /\bDate\.now\b/g
  ];

  for (const f of testFiles) {
    const content = readFile(path.join(AGENTS_DIR, f));
    if (!content) continue;

    for (const pattern of falsePositivePatterns) {
      const count = hasForbiddenPattern(content, pattern);
      check(count === 0, `Tokenizer: no false positive for ${pattern.source} in ${f}`);
    }
  }

  // Learner terms must not trigger on substrings
  const learnerTerms = ['xp', 'iq', 'rank'];
  const termFiles = [
    'didactic-architecture-agent.js',
    'pedagogical-planner.js',
    'instructional-layers.js',
    'difficulty-ladder.js',
    'multi-perspective-engine.js',
    'composition-graph.js',
    'example-selection-engine.js'
  ];

  for (const f of termFiles) {
    const content = readFile(path.join(AGENTS_DIR, f));
    if (!content) continue;
    for (const term of learnerTerms) {
      check(!hasForbiddenTerm(content, term), `Word-boundary: no false positive for "${term}" in ${f}`);
    }
  }

  // Verify fixtures pass (patterns in comments/strings must NOT trigger)
  const fixtureContent = `
    // Math.random
    const text = "Math.random";
    const explanation = "...";
    function rankConnections(){}
    const techniques = [];
    const competencyMatrix = {};
  `;
  check(hasForbiddenPattern(fixtureContent, /\bMath\.random\b/g) === 0, 'Fixture: Math.random in comment does not trigger');
  check(hasForbiddenPattern(fixtureContent, /\bMath\.random\b/g) === 0, 'Fixture: Math.random in string does not trigger');
  check(!hasForbiddenTerm(fixtureContent, 'rank'), 'Fixture: rankConnections identifier does not trigger');
  check(!hasForbiddenTerm(fixtureContent, 'xp'), 'Fixture: explanation does not trigger xp');
  check(!hasForbiddenTerm(fixtureContent, 'iq'), 'Fixture: techniques does not trigger iq');

  // Verify real violations DO trigger
  const violationContent = `
    Math.random();
    Date.now();
    eval("...");
    fetch("https://example.com");
  `;
  check(hasForbiddenPattern(violationContent, /\bMath\.random\b/g) > 0, 'Fixture: Math.random() in code triggers');
  check(hasForbiddenPattern(violationContent, /\bDate\.now\b/g) > 0, 'Fixture: Date.now() in code triggers');
  check(hasForbiddenPattern(violationContent, /\beval\s*\(/g) > 0, 'Fixture: eval() triggers');
  check(hasForbiddenPattern(violationContent, /\bfetch\s*\(/g) > 0, 'Fixture: fetch() triggers');
}

// --- Objective 2: Planner Orchestration Boundaries ---
function testPlannerOrchestration() {
  log('check', '=== Objective 2: Planner Orchestration Boundaries ===');

  const plannerContent = readFile(path.join(BASE, 'pedagogical-planner.js'));
  if (!plannerContent) {
    check(false, 'Planner file not readable');
    return;
  }

  // Verify DI is used
  check(plannerContent.includes('function createPedagogicalPlanner(deps)'), 'Planner accepts deps parameter');
  check(plannerContent.includes('deps.compositionGraph'), 'Planner receives compositionGraph via DI');
  check(plannerContent.includes('deps.instructionalLayers'), 'Planner receives instructionalLayers via DI');
  check(plannerContent.includes('deps.difficultyLadder'), 'Planner receives difficultyLadder via DI');
  check(plannerContent.includes('deps.multiPerspectiveEngine'), 'Planner receives multiPerspectiveEngine via DI');
  check(plannerContent.includes('deps.semanticResolver'), 'Planner receives semanticResolver via DI');
  check(plannerContent.includes('deps.exampleEngine'), 'Planner receives exampleEngine via DI');
  check(plannerContent.includes('deps.crossDomainConnector'), 'Planner receives crossDomainConnector via DI');
  check(plannerContent.includes('deps.recapInserter'), 'Planner receives recapInserter via DI');
  check(plannerContent.includes('deps.resourceSelector'), 'Planner receives resourceSelector via DI');

  // Verify delegation calls exist
  check(plannerContent.includes('instructionalLayers.selectLayers'), 'Delegates layer selection');
  check(plannerContent.includes('difficultyLadder.applyPreset'), 'Delegates difficulty preset');
  check(plannerContent.includes('multiPerspectiveEngine.selectPerspective'), 'Delegates perspective selection');
  check(plannerContent.includes('compositionGraph.buildFromSections'), 'Delegates graph building');
  check(plannerContent.includes('semanticResolver.buildDependencyChain'), 'Delegates dependency chain');
  check(plannerContent.includes('exampleEngine.selectBestExamples'), 'Delegates example selection');
  check(plannerContent.includes('crossDomainConnector.rankConnections'), 'Delegates cross-domain ranking');
  check(plannerContent.includes('recapInserter.insertRecaps'), 'Delegates recap insertion');
  check(plannerContent.includes('resourceSelector.buildResourceBundle'), 'Delegates resource selection');

  // Verify planner does NOT have forbidden internal logic
  const forbiddenInternal = [
    'function resolvePrerequisites',
    'function rankExamples',
    'function insertRecap',
    'function discoverCrossDomain',
    'function selectLaboratory',
    'function selectVisualization',
    'function buildTransition'
  ];
  for (const fn of forbiddenInternal) {
    check(!plannerContent.includes(fn), `Planner does NOT define: ${fn}`);
  }

  // No ES module imports (pure DI)
  check(!plannerContent.includes('import {'), 'Planner has no import statements (pure DI)');
  check(!plannerContent.includes("from './"), 'Planner has no module imports');
}

// --- Objective 3: Example Provider Abstraction ---
function testExampleProvider() {
  log('check', '=== Objective 3: Example Provider Abstraction ===');

  const providerPath = path.join(BASE, 'example-provider.js');
  check(fileExists(providerPath), 'example-provider.js exists');

  const content = readFile(providerPath);
  if (!content) {
    check(false, 'Example provider not readable');
    return;
  }

  // Verify factory
  check(content.includes('function createExampleProvider'), 'createExampleProvider factory exists');
  check(content.includes('function createExampleProvider(deps)'), 'Factory accepts deps parameter');

  // Verify required methods
  check(content.includes('function getExamplesForConcept'), 'getExamplesForConcept method exists');
  check(content.includes('function getExamplesForArtifact'), 'getExamplesForArtifact method exists');
  check(content.includes('function getExamplesByDifficulty'), 'getExamplesByDifficulty method exists');
  check(content.includes('function getExamplesByCategory'), 'getExamplesByCategory method exists');

  // Verify delegation to registry
  check(content.includes('exampleRegistry'), 'Delegates to exampleRegistry');
  check(content.includes('getExamplesByConcept'), 'Uses registry getExamplesByConcept');
  check(content.includes('getExamplesByDifficulty'), 'Uses registry getExamplesByDifficulty');
  check(content.includes('getExamplesByCategory'), 'Uses registry getExamplesByCategory');

  // Verify window exposure
  check(content.includes('window.NeuralVerse'), 'Exposes on window.NeuralVerse');
  check(content.includes('createExampleProvider'), 'Registers factory on window.NeuralVerse');

  // Verify ES module export
  check(content.includes('export { createExampleProvider }'), 'ES module export present');

  // Verify no forbidden patterns
  check(hasForbiddenPattern(content, /\bMath\.random\b/g) === 0, 'No Math.random in example-provider');
  check(hasForbiddenPattern(content, /\bDate\.now\b/g) === 0, 'No Date.now in example-provider');
  check(hasForbiddenPattern(content, /\bfetch\s*\(/g) === 0, 'No fetch() in example-provider');

  // Verify backward compatibility methods
  check(content.includes('getAllExamples'), 'getAllExamples backward-compatible method');
  check(content.includes('searchExamples'), 'searchExamples backward-compatible method');
  check(content.includes('getExample'), 'getExample backward-compatible method');
  check(content.includes('getCount'), 'getCount backward-compatible method');
  check(content.includes('getSource'), 'getSource method for migration tracking');
}

// --- Objective 4: Dependency Injection Verification ---
function testDependencyInjection() {
  log('check', '=== Objective 4: Dependency Injection ===');

  const plannerContent = readFile(path.join(BASE, 'pedagogical-planner.js'));
  if (!plannerContent) {
    check(false, 'Planner not readable');
    return;
  }

  // Verify all D1A/D1B dependencies are injected
  const requiredDeps = [
    'compositionGraph', 'instructionalLayers', 'difficultyLadder',
    'multiPerspectiveEngine', 'semanticResolver', 'exampleEngine',
    'crossDomainConnector', 'recapInserter', 'resourceSelector'
  ];

  for (const dep of requiredDeps) {
    check(plannerContent.includes(`deps.${dep}`), `Dependency injected: ${dep}`);
  }

  // Verify agent passes deps correctly
  const agentContent = readFile(path.join(BASE, 'didactic-architecture-agent.js'));
  if (!agentContent) {
    check(false, 'Agent not readable');
    return;
  }

  check(agentContent.includes('createPedagogicalPlanner({'), 'Agent initializes planner with deps object');
  check(agentContent.includes('compositionGraph: compositionGraph'), 'Agent passes compositionGraph');
  check(agentContent.includes('instructionalLayers: instructionalLayers'), 'Agent passes instructionalLayers');
  check(agentContent.includes('difficultyLadder: difficultyLadder'), 'Agent passes difficultyLadder');
  check(agentContent.includes('multiPerspectiveEngine: multiPerspectiveEngine'), 'Agent passes multiPerspectiveEngine');
  check(agentContent.includes('semanticResolver: semanticResolver'), 'Agent passes semanticResolver');
  check(agentContent.includes('exampleEngine: exampleEngine'), 'Agent passes exampleEngine');
  check(agentContent.includes('crossDomainConnector: crossDomainConnector'), 'Agent passes crossDomainConnector');
  check(agentContent.includes('recapInserter: recapInserter'), 'Agent passes recapInserter');
  check(agentContent.includes('resourceSelector: resourceSelector'), 'Agent passes resourceSelector');
}

// --- Objective 5: Backward Compatibility ---
function testBackwardCompatibility() {
  log('check', '=== Objective 5: Backward Compatibility ===');

  // Verify existing APIs are preserved
  const agentContent = readFile(path.join(BASE, 'didactic-architecture-agent.js'));
  if (!agentContent) {
    check(false, 'Agent not readable');
    return;
  }

  const preservedAPIs = [
    'getPlanner', 'getCompositionGraph', 'getInstructionalLayers',
    'getDifficultyLadder', 'getMultiPerspectiveEngine', 'getLastPlan',
    'getSemanticResolver', 'getExampleEngine', 'getExampleRegistry',
    'getCrossDomainConnector', 'getRecapInserter', 'getResourceSelector'
  ];

  for (const api of preservedAPIs) {
    check(agentContent.includes(api), `API preserved: ${api}`);
  }

  // Verify existing modes preserved
  const existingModes = [
    'buildStandardResponse', 'buildComparisonResponse', 'buildSocraticResponse',
    'buildAnalogyResponse', 'buildMisconceptionResponse', 'buildReflectionResponse',
    'buildTransferResponse', 'buildReadingCompanionResponse', 'buildConnectionResponse',
    'buildSummaryResponse', 'detectIntent', 'buildReasoningStrategy'
  ];

  for (const mode of existingModes) {
    check(agentContent.includes(`function ${mode}`), `Mode preserved: ${mode}`);
  }

  // Verify namespace exposure
  check(agentContent.includes('window.NeuralVerse'), 'Namespace preserved');

  // Verify plan structure backward compatibility
  const plannerContent = readFile(path.join(BASE, 'pedagogical-planner.js'));
  if (plannerContent) {
    const planFields = [
      'id', 'topic', 'intent', 'mode', 'difficulty', 'selectedPerspective',
      'layers', 'sections', 'evidence', 'warnings', 'omissions', 'generatedAt',
      'conceptIds', 'artifactIds', 'dependencyChain', 'missingPrerequisites',
      'insertedRecaps', 'recapsCount', 'selectedExamples', 'selectedResources',
      'crossDomainConnections', 'semanticWarnings'
    ];
    for (const field of planFields) {
      check(plannerContent.includes(field), `Plan field preserved: ${field}`);
    }
  }
}

// --- Governance Tokenizer Validation ---
function testGovernanceTokenizer() {
  log('check', '=== Governance Tokenizer Validation ===');

  const tokenizerPath = path.join(__dirname, 'governance-tokenizer.js');
  check(fileExists(tokenizerPath), 'governance-tokenizer.js exists');

  const content = readFile(tokenizerPath);
  if (!content) {
    check(false, 'Tokenizer not readable');
    return;
  }

  check(content.includes('function tokenizeSource'), 'tokenizeSource function exists');
  check(content.includes('function stripComments'), 'stripComments function exists');
  check(content.includes('function hasForbiddenPattern'), 'hasForbiddenPattern function exists');
  check(content.includes('function hasForbiddenTerm'), 'hasForbiddenTerm function exists');

  // Test tokenizer handles edge cases
  const testCases = [
    { input: '// Math.random', expect: 0, desc: 'single-line comment' },
    { input: '/* Math.random */', expect: 0, desc: 'block comment' },
    { input: '"Math.random"', expect: 0, desc: 'double-quoted string' },
    { input: "'Math.random'", expect: 0, desc: 'single-quoted string' },
    { input: '`Math.random`', expect: 0, desc: 'template literal' },
    { input: 'Math.random()', expect: 1, desc: 'executable code' },
    { input: 'a = Math.random(); // safe', expect: 1, desc: 'code with comment' },
    { input: 'x = "Math.random"; y = Math.random();', expect: 1, desc: 'mixed string and code' },
  ];

  for (const tc of testCases) {
    const count = hasForbiddenPattern(tc.input, /\bMath\.random\b/g);
    check(count === tc.expect, `Tokenizer: ${tc.desc} → ${count} (expected ${tc.expect})`);
  }
}

// --- Run All Tests ---
function runAllTests() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  NV-1300-D1A-F1 — Architecture Hardening Validator');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  testValidatorPrecision();
  console.log('');
  testPlannerOrchestration();
  console.log('');
  testExampleProvider();
  console.log('');
  testDependencyInjection();
  console.log('');
  testBackwardCompatibility();
  console.log('');
  testGovernanceTokenizer();
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
    validator: 'NV-1300-D1A-F1-architecture',
    timestamp: new Date().toISOString(),
    summary: {
      checks: checked,
      passed: passed,
      errors: errors.length,
      verdict: errors.length === 0 ? 'READY' : 'NOT READY'
    },
    errors,
    warnings
  };

  try {
    fs.writeFileSync(path.join(reportDir, 'nv-1300-d1a-f1-architecture-report.json'), JSON.stringify(report, null, 2));
    console.log('  Report written to docs/architecture/nv-1300/nv-1300-d1a-f1-architecture-report.json');
  } catch (e) { console.log('  Could not write report: ' + e.message); }

  console.log('');
  process.exit(errors.length === 0 ? 0 : 1);
}

runAllTests();
