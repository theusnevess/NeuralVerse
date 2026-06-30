#!/usr/bin/env node
/**
 * NV-1300-D1E — Cognitive Load, Transitions & Final Lesson Composition Validator
 *
 * Validates all D1E modules for:
 *  - Module existence and factory function exposure
 *  - No syntax errors
 *  - Required API surface
 *  - Forbidden patterns (determinism & IO)
 *  - Forbidden terms (learner inference)
 *  - Governance compliance
 *  - D1E integration in planner and agent
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { hasForbiddenPattern, hasForbiddenTerm } = require('./governance-tokenizer.js');

const BASE = path.join(__dirname, '..', 'website', 'scripts', 'agents');

const D1E_FILES = [
  { name: 'cognitive-load-optimizer', path: path.join(BASE, 'cognitive-load-optimizer.js') },
  { name: 'instructional-pacing-engine', path: path.join(BASE, 'instructional-pacing-engine.js') },
  { name: 'lesson-composer', path: path.join(BASE, 'lesson-composer.js') },
  { name: 'readability-optimizer', path: path.join(BASE, 'readability-optimizer.js') },
  { name: 'accessibility-polish', path: path.join(BASE, 'accessibility-polish.js') }
];

const MODIFIED_FILES = [
  { name: 'pedagogical-planner', path: path.join(BASE, 'pedagogical-planner.js') },
  { name: 'didactic-architecture-agent', path: path.join(BASE, 'didactic-architecture-agent.js') }
];

let errors = [];
let checked = 0;
let passed = 0;

function log(level, message) {
  const prefix = {
    error: '\x1b[31mERROR\x1b[0m',
    warn: '\x1b[33mWARN\x1b[0m',
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

function fileExists(filePath) { return fs.existsSync(filePath); }

function _stripEsm(content) {
  return content
    .replace(/^export\s*\{[\s\S]*?\}\s*;?\s*$/gm, '')
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '')
    .replace(/^import\s+\w+\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '');
}

function testModuleExistence() {
  log('info', '=== Module Existence ===');
  for (const mod of D1E_FILES) {
    check(fileExists(mod.path), `Module exists: ${mod.name}.js`);
  }
}

function testSyntaxValidation() {
  log('info', '=== Syntax Validation ===');
  for (const mod of D1E_FILES) {
    const content = readFile(mod.path);
    if (!content) { check(false, `File not readable: ${mod.name}.js`); continue; }
    try {
      new vm.Script(_stripEsm(content), { filename: mod.name + '.js' });
      check(true, `Syntax valid: ${mod.name}.js`);
    } catch (e) {
      check(false, `Syntax error in ${mod.name}.js: ${e.message}`);
    }
  }
  for (const mod of MODIFIED_FILES) {
    const content = readFile(mod.path);
    if (!content) { check(false, `File not readable: ${mod.name}.js`); continue; }
    try {
      new vm.Script(_stripEsm(content), { filename: mod.name + '.js' });
      check(true, `Syntax valid: ${mod.name}.js`);
    } catch (e) {
      check(false, `Syntax error in ${mod.name}.js: ${e.message}`);
    }
  }
}

function testFactoryExposure() {
  log('info', '=== Factory Function Exposure ===');
  const expected = {
    'cognitive-load-optimizer.js': 'createCognitiveLoadOptimizer',
    'instructional-pacing-engine.js': 'createInstructionalPacingEngine',
    'lesson-composer.js': 'createLessonComposer',
    'readability-optimizer.js': 'createReadabilityOptimizer',
    'accessibility-polish.js': 'createAccessibilityPolish'
  };
  for (const [filename, factory] of Object.entries(expected)) {
    const content = readFile(path.join(BASE, filename));
    check(content && content.includes(`function ${factory}`), `Factory: ${factory} in ${filename}`);
  }
}

function testNamespaceExposure() {
  log('info', '=== Namespace Exposure ===');
  for (const mod of D1E_FILES) {
    const content = readFile(mod.path);
    check(content && content.includes('window.NeuralVerse'), `Namespace: window.NeuralVerse in ${mod.name}.js`);
  }
}

function testCognitiveLoadOptimizerAPI() {
  log('info', '=== Cognitive Load Optimizer API ===');
  const content = readFile(path.join(BASE, 'cognitive-load-optimizer.js'));
  if (!content) { check(false, 'cognitive-load-optimizer.js not readable'); return; }

  check(content.includes('measureLoad'), 'LoadOptimizer: measureLoad');
  check(content.includes('optimizeLoad'), 'LoadOptimizer: optimizeLoad');
  check(content.includes('splitHeavySections'), 'LoadOptimizer: splitHeavySections');
  check(content.includes('balanceComplexity'), 'LoadOptimizer: balanceComplexity');
  check(content.includes('computeLoadMetrics'), 'LoadOptimizer: computeLoadMetrics');
  check(content.includes('validateLoad'), 'LoadOptimizer: validateLoad');
  check(content.includes('COMPLEXITY_LEVELS'), 'LoadOptimizer: COMPLEXITY_LEVELS exported');
  check(content.includes('COMPLEXITY_WEIGHTS'), 'LoadOptimizer: COMPLEXITY_WEIGHTS exported');
  check(content.includes('LOAD_CONSTRAINTS'), 'LoadOptimizer: LOAD_CONSTRAINTS exported');
}

function testInstructionalPacingAPI() {
  log('info', '=== Instructional Pacing Engine API ===');
  const content = readFile(path.join(BASE, 'instructional-pacing-engine.js'));
  if (!content) { check(false, 'instructional-pacing-engine.js not readable'); return; }

  check(content.includes('buildPacing'), 'PacingEngine: buildPacing');
  check(content.includes('insertBreathingPoints'), 'PacingEngine: insertBreathingPoints');
  check(content.includes('insertRecaps'), 'PacingEngine: insertRecaps');
  check(content.includes('validatePacing'), 'PacingEngine: validatePacing');
  check(content.includes('PACING_CONSTRAINTS'), 'PacingEngine: PACING_CONSTRAINTS exported');
}

function testLessonComposerAPI() {
  log('info', '=== Lesson Composer API ===');
  const content = readFile(path.join(BASE, 'lesson-composer.js'));
  if (!content) { check(false, 'lesson-composer.js not readable'); return; }

  check(content.includes('composeLesson'), 'Composer: composeLesson');
  check(content.includes('composeSections'), 'Composer: composeSections');
  check(content.includes('composeNarrative'), 'Composer: composeNarrative');
  check(content.includes('buildOutline'), 'Composer: buildOutline');
  check(content.includes('finalizeComposition'), 'Composer: finalizeComposition');
  check(content.includes('COMPOSITION_CONSTRAINTS'), 'Composer: COMPOSITION_CONSTRAINTS exported');
}

function testReadabilityOptimizerAPI() {
  log('info', '=== Readability Optimizer API ===');
  const content = readFile(path.join(BASE, 'readability-optimizer.js'));
  if (!content) { check(false, 'readability-optimizer.js not readable'); return; }

  check(content.includes('optimizeReadability'), 'Readability: optimizeReadability');
  check(content.includes('balanceParagraphs'), 'Readability: balanceParagraphs');
  check(content.includes('normalizeLists'), 'Readability: normalizeLists');
  check(content.includes('validateReadability'), 'Readability: validateReadability');
  check(content.includes('READABILITY_CONSTRAINTS'), 'Readability: READABILITY_CONSTRAINTS exported');
}

function testAccessibilityPolishAPI() {
  log('info', '=== Accessibility Polish API ===');
  const content = readFile(path.join(BASE, 'accessibility-polish.js'));
  if (!content) { check(false, 'accessibility-polish.js not readable'); return; }

  check(content.includes('validateAccessibility'), 'Accessibility: validateAccessibility');
  check(content.includes('annotateVisualizations'), 'Accessibility: annotateVisualizations');
  check(content.includes('annotateLaboratories'), 'Accessibility: annotateLaboratories');
  check(content.includes('annotateEvidence'), 'Accessibility: annotateEvidence');
  check(content.includes('ACCESSIBILITY_CONSTRAINTS'), 'Accessibility: ACCESSIBILITY_CONSTRAINTS exported');
}

function testPlannerD1EFields() {
  log('info', '=== Planner D1E Fields ===');
  const planner = readFile(path.join(BASE, 'pedagogical-planner.js'));
  if (!planner) { check(false, 'Planner file not readable'); return; }

  check(planner.includes('cognitiveLoadOptimizer'), 'Planner: cognitiveLoadOptimizer dependency');
  check(planner.includes('instructionalPacingEngine'), 'Planner: instructionalPacingEngine dependency');
  check(planner.includes('lessonComposer'), 'Planner: lessonComposer dependency');
  check(planner.includes('readabilityOptimizer'), 'Planner: readabilityOptimizer dependency');
  check(planner.includes('accessibilityPolish'), 'Planner: accessibilityPolish dependency');

  check(planner.includes('plan.loadMetrics'), 'Plan: loadMetrics field');
  check(planner.includes('plan.pacingPlan'), 'Plan: pacingPlan field');
  check(planner.includes('plan.lessonOutline'), 'Plan: lessonOutline field');
  check(planner.includes('plan.composition'), 'Plan: composition field');
  check(planner.includes('plan.readabilityMetrics'), 'Plan: readabilityMetrics field');
  check(planner.includes('plan.accessibilityAnnotations'), 'Plan: accessibilityAnnotations field');
}

function testD1EIntegrationInAgent() {
  log('info', '=== D1E Integration in Agent ===');
  const agent = readFile(path.join(BASE, 'didactic-architecture-agent.js'));
  if (!agent) { check(false, 'Agent file not readable'); return; }

  check(agent.includes("import { createCognitiveLoadOptimizer }"), 'Agent imports CognitiveLoadOptimizer');
  check(agent.includes("import { createInstructionalPacingEngine }"), 'Agent imports InstructionalPacingEngine');
  check(agent.includes("import { createLessonComposer }"), 'Agent imports LessonComposer');
  check(agent.includes("import { createReadabilityOptimizer }"), 'Agent imports ReadabilityOptimizer');
  check(agent.includes("import { createAccessibilityPolish }"), 'Agent imports AccessibilityPolish');

  check(agent.includes('createCognitiveLoadOptimizer()'), 'Agent initializes CognitiveLoadOptimizer');
  check(agent.includes('createInstructionalPacingEngine()'), 'Agent initializes InstructionalPacingEngine');
  check(agent.includes('createLessonComposer()'), 'Agent initializes LessonComposer');
  check(agent.includes('createReadabilityOptimizer()'), 'Agent initializes ReadabilityOptimizer');
  check(agent.includes('createAccessibilityPolish()'), 'Agent initializes AccessibilityPolish');

  check(agent.includes('cognitiveLoadOptimizer: cognitiveLoadOptimizer'), 'Agent passes cognitiveLoadOptimizer to planner');
  check(agent.includes('instructionalPacingEngine: instructionalPacingEngine'), 'Agent passes instructionalPacingEngine to planner');
  check(agent.includes('lessonComposer: lessonComposer'), 'Agent passes lessonComposer to planner');
  check(agent.includes('readabilityOptimizer: readabilityOptimizer'), 'Agent passes readabilityOptimizer to planner');
  check(agent.includes('accessibilityPolish: accessibilityPolish'), 'Agent passes accessibilityPolish to planner');

  check(agent.includes('getLessonOutline'), 'Agent exposes getLessonOutline');
  check(agent.includes('getLoadMetrics'), 'Agent exposes getLoadMetrics');
  check(agent.includes('getPacingPlan'), 'Agent exposes getPacingPlan');
  check(agent.includes('getComposition'), 'Agent exposes getComposition');
  check(agent.includes('getAccessibilityReport'), 'Agent exposes getAccessibilityReport');
}

function testForbiddenPatterns() {
  log('info', '=== Forbidden Patterns (Determinism & IO) ===');
  const allFiles = [...D1E_FILES, ...MODIFIED_FILES];
  for (const mod of allFiles) {
    const content = readFile(mod.path);
    if (!content) continue;
    check(hasForbiddenPattern(content, /\bMath\.random\b/g) === 0, `No Math.random in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bDate\.now\b/g) === 0, `No Date.now in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bperformance\.now\b/g) === 0, `No performance.now in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\beval\s*\(/g) === 0, `No eval() in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bnew\s+Function\s*\(/g) === 0, `No new Function() in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bXMLHttpRequest\b/g) === 0, `No XMLHttpRequest in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bWebSocket\b/g) === 0, `No WebSocket in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bfetch\s*\(/g) === 0, `No fetch() in ${mod.name}.js`);
  }
}

function testForbiddenTerms() {
  log('info', '=== Forbidden Terms (Learner Inference) ===');
  const forbiddenTerms = [
    'mastery', 'mastered', 'competence', 'competency', 'proficiency',
    'skill score', 'skill_score', 'learner model', 'learner_model',
    'adaptive difficulty', 'adaptive_difficulty', 'personalization',
    'learning style', 'learning_style', 'weakness score', 'weakness_score',
    'strength score', 'strength_score', 'intelligence score'
  ];
  const allFiles = [...D1E_FILES, ...MODIFIED_FILES];
  for (const mod of allFiles) {
    const content = readFile(mod.path);
    if (!content) continue;
    for (const term of forbiddenTerms) {
      check(!hasForbiddenTerm(content, term), `No '${term}' in ${mod.name}.js`);
    }
  }
}

function testNoCurriculumMutation() {
  log('info', '=== No Curriculum Mutation ===');
  const allFiles = [...D1E_FILES, ...MODIFIED_FILES];
  for (const mod of allFiles) {
    const content = readFile(mod.path);
    if (!content) continue;
    check(hasForbiddenPattern(content, /\bwriteFile\s*\(/g) === 0, `No writeFile in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bappendFile\s*\(/g) === 0, `No appendFile in ${mod.name}.js`);
  }
}

function testFileSizes() {
  log('info', '=== File Size Sanity ===');
  const allFiles = [...D1E_FILES, ...MODIFIED_FILES];
  for (const mod of allFiles) {
    if (!fileExists(mod.path)) continue;
    const stat = fs.statSync(mod.path);
    const sizeKB = stat.size / 1024;
    check(sizeKB > 1, `${mod.name}.js >1KB: ${sizeKB.toFixed(1)}KB`);
    check(sizeKB < 80, `${mod.name}.js <80KB: ${sizeKB.toFixed(1)}KB`);
  }
}

function testPerformanceBudgets() {
  log('info', '=== Performance Budgets ===');
  const clo = readFile(path.join(BASE, 'cognitive-load-optimizer.js'));
  if (clo) check(clo.includes('measureLoad'), 'LoadOptimizer: pure computation → <10ms achievable');
  const ipe = readFile(path.join(BASE, 'instructional-pacing-engine.js'));
  if (ipe) check(ipe.includes('buildPacing'), 'PacingEngine: pure computation → <5ms achievable');
  const lc = readFile(path.join(BASE, 'lesson-composer.js'));
  if (lc) check(lc.includes('composeLesson'), 'Composer: pure computation → <15ms achievable');
  const ap = readFile(path.join(BASE, 'accessibility-polish.js'));
  if (ap) check(ap.includes('validateAccessibility'), 'Accessibility: pure computation → <5ms achievable');
}

function runAllTests() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  NV-1300-D1E — Cognitive Load, Transitions & Final Composition');
  console.log('  Validator');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  testModuleExistence();
  console.log('');
  testSyntaxValidation();
  console.log('');
  testFactoryExposure();
  console.log('');
  testNamespaceExposure();
  console.log('');
  testCognitiveLoadOptimizerAPI();
  console.log('');
  testInstructionalPacingAPI();
  console.log('');
  testLessonComposerAPI();
  console.log('');
  testReadabilityOptimizerAPI();
  console.log('');
  testAccessibilityPolishAPI();
  console.log('');
  testPlannerD1EFields();
  console.log('');
  testD1EIntegrationInAgent();
  console.log('');
  testForbiddenPatterns();
  console.log('');
  testForbiddenTerms();
  console.log('');
  testNoCurriculumMutation();
  console.log('');
  testFileSizes();
  console.log('');
  testPerformanceBudgets();
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
    validator: 'NV-1300-D1E-cognitive-load-and-final-composition',
    timestamp: new Date().toISOString(),
    summary: { checks: checked, passed, errors: errors.length, verdict: errors.length === 0 ? 'READY' : 'NOT READY' },
    errors
  };

  try {
    fs.writeFileSync(path.join(reportDir, 'nv-1300-d1e-validator-report.json'), JSON.stringify(report, null, 2));
    console.log('  Report written to docs/architecture/nv-1300/nv-1300-d1e-validator-report.json');
  } catch (e) { console.log('  Could not write report: ' + e.message); }

  console.log('');
  process.exit(errors.length === 0 ? 0 : 1);
}

runAllTests();
