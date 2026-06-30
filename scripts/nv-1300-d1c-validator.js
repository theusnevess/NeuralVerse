#!/usr/bin/env node
/**
 * NV-1300-D1C — Media & Laboratory Orchestration Validator
 *
 * Validates all D1C modules for:
 * - Module existence and factory function exposure
 * - No syntax errors
 * - Required API surface
 * - Forbidden patterns
 * - Deterministic constraints
 * - Governance compliance
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { hasForbiddenPattern, hasForbiddenTerm } = require('./governance-tokenizer.js');

const BASE = path.join(__dirname, '..', 'website', 'scripts', 'agents');

const D1C_FILES = [
  { name: 'visualization-orchestrator', path: path.join(BASE, 'visualization-orchestrator.js') },
  { name: 'laboratory-placer', path: path.join(BASE, 'laboratory-placer.js') },
  { name: 'media-orchestrator', path: path.join(BASE, 'media-orchestrator.js') },
  { name: 'instructional-transition-engine', path: path.join(BASE, 'instructional-transition-engine.js') },
  { name: 'media-density-optimizer', path: path.join(BASE, 'media-density-optimizer.js') }
];

const MODIFIED_FILES = [
  { name: 'pedagogical-planner', path: path.join(BASE, 'pedagogical-planner.js') },
  { name: 'didactic-architecture-agent', path: path.join(BASE, 'didactic-architecture-agent.js') }
];

let errors = [];
let warnings = [];
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
  for (const mod of D1C_FILES) {
    check(fileExists(mod.path), `Module exists: ${mod.name}.js`);
  }
}

function testSyntaxValidation() {
  log('info', '=== Syntax Validation ===');
  for (const mod of D1C_FILES) {
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
    'visualization-orchestrator.js': 'createVisualizationOrchestrator',
    'laboratory-placer.js': 'createLaboratoryPlacer',
    'media-orchestrator.js': 'createMediaOrchestrator',
    'instructional-transition-engine.js': 'createInstructionalTransitionEngine',
    'media-density-optimizer.js': 'createMediaDensityOptimizer'
  };

  for (const [filename, factory] of Object.entries(expected)) {
    const content = readFile(path.join(BASE, filename));
    check(content && content.includes(`function ${factory}`), `Factory: ${factory} in ${filename}`);
  }
}

function testNamespaceExposure() {
  log('info', '=== Namespace Exposure ===');
  const expected = {
    'visualization-orchestrator.js': 'createVisualizationOrchestrator',
    'laboratory-placer.js': 'createLaboratoryPlacer',
    'media-orchestrator.js': 'createMediaOrchestrator',
    'instructional-transition-engine.js': 'createInstructionalTransitionEngine',
    'media-density-optimizer.js': 'createMediaDensityOptimizer'
  };

  for (const [filename, factory] of Object.entries(expected)) {
    const content = readFile(path.join(BASE, filename));
    check(content && content.includes('window.NeuralVerse'), `Namespace: window.NeuralVerse in ${filename}`);
    check(content && content.includes(factory), `Exports: ${factory} in ${filename}`);
  }
}

function testAPIs() {
  log('info', '=== Required APIs ===');

  const viz = readFile(path.join(BASE, 'visualization-orchestrator.js'));
  if (viz) {
    check(viz.includes('shouldInsertVisualization'), 'VizOrchestrator: shouldInsertVisualization');
    check(viz.includes('scoreVisualization'), 'VizOrchestrator: scoreVisualization');
    check(viz.includes('selectVisualization'), 'VizOrchestrator: selectVisualization');
    check(viz.includes('buildVisualizationPlacement'), 'VizOrchestrator: buildVisualizationPlacement');
    check(viz.includes('explainSelection'), 'VizOrchestrator: explainSelection');
    check(viz.includes('VIZ_SELECTION_RULES'), 'VizOrchestrator: VIZ_SELECTION_RULES');
    check(viz.includes('CONCEPT_VIZ_AFFINITY'), 'VizOrchestrator: CONCEPT_VIZ_AFFINITY');
    check(viz.includes('MAX_VISUALIZATIONS_PER_PLAN'), 'VizOrchestrator: MAX_VISUALIZATIONS_PER_PLAN');
  }

  const lab = readFile(path.join(BASE, 'laboratory-placer.js'));
  if (lab) {
    check(lab.includes('scoreLaboratory'), 'LabPlacer: scoreLaboratory');
    check(lab.includes('selectLaboratory'), 'LabPlacer: selectLaboratory');
    check(lab.includes('buildPlacement'), 'LabPlacer: buildPlacement');
    check(lab.includes('explainPlacement'), 'LabPlacer: explainPlacement');
    check(lab.includes('LAB_SELECTION_ROLES'), 'LabPlacer: LAB_SELECTION_ROLES');
    check(lab.includes('CONCEPT_LAB_AFFINITY'), 'LabPlacer: CONCEPT_LAB_AFFINITY');
    check(lab.includes('MAX_LABS_PER_PLAN'), 'LabPlacer: MAX_LABS_PER_PLAN');
    check(lab.includes('LAB_ROLES_SUPPORTED'), 'LabPlacer: LAB_ROLES_SUPPORTED');
  }

  const media = readFile(path.join(BASE, 'media-orchestrator.js'));
  if (media) {
    check(media.includes('buildMediaPlan'), 'MediaOrchestrator: buildMediaPlan');
    check(media.includes('validateMediaPlan'), 'MediaOrchestrator: validateMediaPlan');
    check(media.includes('getMediaTimeline'), 'MediaOrchestrator: getMediaTimeline');
  }

  const trans = readFile(path.join(BASE, 'instructional-transition-engine.js'));
  if (trans) {
    check(trans.includes('generateTransition'), 'TransitionEngine: generateTransition');
    check(trans.includes('buildSectionTransitions'), 'TransitionEngine: buildSectionTransitions');
    check(trans.includes('validateTransitions'), 'TransitionEngine: validateTransitions');
    check(trans.includes('TRANSITION_TYPES'), 'TransitionEngine: TRANSITION_TYPES');
    check(trans.includes('SECTION_PURPOSE'), 'TransitionEngine: SECTION_PURPOSE');
  }

  const density = readFile(path.join(BASE, 'media-density-optimizer.js'));
  if (density) {
    check(density.includes('measureDensity'), 'DensityOptimizer: measureDensity');
    check(density.includes('optimizeSequence'), 'DensityOptimizer: optimizeSequence');
    check(density.includes('balance'), 'DensityOptimizer: balance');
    check(density.includes('DENSITY_CONSTRAINTS'), 'DensityOptimizer: DENSITY_CONSTRAINTS');
  }
}

function testForbiddenPatterns() {
  log('info', '=== Forbidden Patterns ===');
  const allFiles = [...D1C_FILES, ...MODIFIED_FILES];
  for (const mod of allFiles) {
    const content = readFile(mod.path);
    if (!content) continue;
    check(hasForbiddenPattern(content, /\bMath\.random\b/g) === 0, `No Math.random in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bDate\.now\b/g) === 0, `No Date.now in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\beval\s*\(/g) === 0, `No eval() in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bnew\s+Function\s*\(/g) === 0, `No new Function() in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bXMLHttpRequest\b/g) === 0, `No XMLHttpRequest in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bWebSocket\b/g) === 0, `No WebSocket in ${mod.name}.js`);
  }
}

function testForbiddenTerms() {
  log('info', '=== Forbidden Terms (Learner Inference) ===');
  const forbiddenTerms = [
    'mastery', 'skill score', 'skill level', 'learner model',
    'adaptive recommendation', 'personalization', 'learning style'
  ];
  const allFiles = [...D1C_FILES, ...MODIFIED_FILES];
  for (const mod of allFiles) {
    const content = readFile(mod.path);
    if (!content) continue;
    for (const term of forbiddenTerms) {
      check(!hasForbiddenTerm(content, term), `No '${term}' in ${mod.name}.js`);
    }
  }
}

function testD1CIntegration() {
  log('info', '=== D1C Integration in Agent ===');
  const agent = readFile(path.join(BASE, 'didactic-architecture-agent.js'));
  if (!agent) { check(false, 'Agent file not readable'); return; }

  check(agent.includes("import { createVisualizationOrchestrator }"), 'Agent imports VisualizationOrchestrator');
  check(agent.includes("import { createLaboratoryPlacer }"), 'Agent imports LaboratoryPlacer');
  check(agent.includes("import { createMediaOrchestrator }"), 'Agent imports MediaOrchestrator');
  check(agent.includes("import { createInstructionalTransitionEngine }"), 'Agent imports InstructionalTransitionEngine');
  check(agent.includes("import { createMediaDensityOptimizer }"), 'Agent imports MediaDensityOptimizer');

  check(agent.includes('createVisualizationOrchestrator()'), 'Agent initializes VisualizationOrchestrator');
  check(agent.includes('createLaboratoryPlacer()'), 'Agent initializes LaboratoryPlacer');
  check(agent.includes('createInstructionalTransitionEngine()'), 'Agent initializes TransitionEngine');
  check(agent.includes('createMediaDensityOptimizer()'), 'Agent initializes DensityOptimizer');
  check(agent.includes('createMediaOrchestrator('), 'Agent initializes MediaOrchestrator');

  check(agent.includes('mediaOrchestrator: mediaOrchestrator'), 'Agent passes mediaOrchestrator to planner');

  check(agent.includes('getVisualizationOrchestrator'), 'Agent exposes getVisualizationOrchestrator');
  check(agent.includes('getLaboratoryPlacer'), 'Agent exposes getLaboratoryPlacer');
  check(agent.includes('getMediaOrchestrator'), 'Agent exposes getMediaOrchestrator');
  check(agent.includes('getTransitionEngine'), 'Agent exposes getTransitionEngine');
  check(agent.includes('getDensityOptimizer'), 'Agent exposes getDensityOptimizer');
  check(agent.includes('getMediaPlan'), 'Agent exposes getMediaPlan');
  check(agent.includes('getVisualizationPlan'), 'Agent exposes getVisualizationPlan');
  check(agent.includes('getLaboratoryPlan'), 'Agent exposes getLaboratoryPlan');
  check(agent.includes('getTransitionMap'), 'Agent exposes getTransitionMap');
}

function testPlannerD1CFields() {
  log('info', '=== Planner D1C Fields ===');
  const planner = readFile(path.join(BASE, 'pedagogical-planner.js'));
  if (!planner) { check(false, 'Planner file not readable'); return; }

  check(planner.includes('mediaOrchestrator'), 'Planner accepts mediaOrchestrator');
  check(planner.includes('plan.mediaPlan'), 'Plan includes mediaPlan');
  check(planner.includes('plan.visualizations'), 'Plan includes visualizations');
  check(planner.includes('plan.laboratories'), 'Plan includes laboratories');
  check(planner.includes('plan.mediaTimeline'), 'Plan includes mediaTimeline');
  check(planner.includes('plan.transitionMap'), 'Plan includes transitionMap');
  check(planner.includes('plan.densityMetrics'), 'Plan includes densityMetrics');
}

function testVisualizationSelectionRules() {
  log('info', '=== Visualization Selection Rules ===');
  const content = readFile(path.join(BASE, 'visualization-orchestrator.js'));
  if (!content) return;

  check(content.includes("'word-embeddings'"), 'VizAffinity has word-embeddings');
  check(content.includes("'self-attention'"), 'VizAffinity has self-attention');
  check(content.includes("'gradient-descent'"), 'VizAffinity has gradient-descent');
  check(content.includes("'pca'"), 'VizAffinity has pca');
  check(content.includes("'bayes-theorem'"), 'VizAffinity has bayes-theorem');
  check(content.includes("'linear-models'"), 'VizAffinity has linear-models');
  check(content.includes("MAX_VISUALIZATIONS_PER_PLAN = 2"), 'Max 2 visualizations per plan');
}

function testLaboratorySelectionRules() {
  log('info', '=== Laboratory Selection Rules ===');
  const content = readFile(path.join(BASE, 'laboratory-placer.js'));
  if (!content) return;

  check(content.includes("'gradient-descent'"), 'LabAffinity has gradient-descent');
  check(content.includes("'pca'"), 'LabAffinity has pca');
  check(content.includes("'word-embeddings'"), 'LabAffinity has word-embeddings');
  check(content.includes("'self-attention'"), 'LabAffinity has self-attention');
  check(content.includes("'bayes-theorem'"), 'LabAffinity has bayes-theorem');
  check(content.includes("MAX_LABS_PER_PLAN = 1"), 'Max 1 laboratory per plan');
  check(content.includes("'exploration'"), 'Lab role: exploration');
  check(content.includes("'guided_practice'"), 'Lab role: guided_practice');
  check(content.includes("'validation'"), 'Lab role: validation');
  check(content.includes("'comparison'"), 'Lab role: comparison');
  check(content.includes("'experiment'"), 'Lab role: experiment');
}

function testTransitionTypes() {
  log('info', '=== Transition Types ===');
  const content = readFile(path.join(BASE, 'instructional-transition-engine.js'));
  if (!content) return;

  check(content.includes("'conceptual'"), 'Transition type: conceptual');
  check(content.includes("'media_to_concept'"), 'Transition type: media_to_concept');
  check(content.includes("'concept_to_media'"), 'Transition type: concept_to_media');
  check(content.includes("'media_to_media'"), 'Transition type: media_to_media');
  check(content.includes("'recap'"), 'Transition type: recap');
  check(content.includes("'cross_domain'"), 'Transition type: cross_domain');
  check(content.includes("'summary'"), 'Transition type: summary');
}

function testDensityConstraints() {
  log('info', '=== Density Constraints ===');
  const content = readFile(path.join(BASE, 'media-density-optimizer.js'));
  if (!content) return;

  check(content.includes('maxConsecutiveMedia: 1'), 'Max consecutive media: 1');
  check(content.includes('minTextBetweenMedia: 1'), 'Min text between media: 1');
  check(content.includes('preferVisualizationBeforeLab: true'), 'Viz before lab preference');
}

function testFileSizes() {
  log('info', '=== File Size Sanity ===');
  const allFiles = [...D1C_FILES, ...MODIFIED_FILES];
  for (const mod of allFiles) {
    if (!fileExists(mod.path)) continue;
    const stat = fs.statSync(mod.path);
    const sizeKB = stat.size / 1024;
    check(sizeKB > 1, `${mod.name}.js >1KB: ${sizeKB.toFixed(1)}KB`);
    check(sizeKB < 60, `${mod.name}.js <60KB: ${sizeKB.toFixed(1)}KB`);
  }
}

function testExternalRequests() {
  log('info', '=== No External Requests ===');
  const allFiles = [...D1C_FILES, ...MODIFIED_FILES];
  for (const mod of allFiles) {
    const content = readFile(mod.path);
    if (!content) continue;
    check(hasForbiddenPattern(content, /\bfetch\s*\(/g) === 0, `No fetch() in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bXMLHttpRequest\b/g) === 0, `No XHR in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bWebSocket\b/g) === 0, `No WebSocket in ${mod.name}.js`);
  }
}

function testNoCurriculumMutation() {
  log('info', '=== No Curriculum Mutation ===');
  const allFiles = [...D1C_FILES, ...MODIFIED_FILES];
  for (const mod of allFiles) {
    const content = readFile(mod.path);
    if (!content) continue;
    check(hasForbiddenPattern(content, /\bwriteFile\s*\(/g) === 0, `No writeFile in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bappendFile\s*\(/g) === 0, `No appendFile in ${mod.name}.js`);
  }
}

function runAllTests() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  NV-1300-D1C — Media & Laboratory Orchestration Validator');
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
  testAPIs();
  console.log('');
  testForbiddenPatterns();
  console.log('');
  testForbiddenTerms();
  console.log('');
  testD1CIntegration();
  console.log('');
  testPlannerD1CFields();
  console.log('');
  testVisualizationSelectionRules();
  console.log('');
  testLaboratorySelectionRules();
  console.log('');
  testTransitionTypes();
  console.log('');
  testDensityConstraints();
  console.log('');
  testFileSizes();
  console.log('');
  testExternalRequests();
  console.log('');
  testNoCurriculumMutation();
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
    validator: 'NV-1300-D1C-media-laboratory-orchestration',
    timestamp: new Date().toISOString(),
    summary: { checks: checked, passed, errors: errors.length, verdict: errors.length === 0 ? 'READY' : 'NOT READY' },
    errors
  };

  try {
    fs.writeFileSync(path.join(reportDir, 'nv-1300-d1c-validator-report.json'), JSON.stringify(report, null, 2));
    console.log('  Report written to docs/architecture/nv-1300/nv-1300-d1c-validator-report.json');
  } catch (e) { console.log('  Could not write report: ' + e.message); }

  console.log('');
  process.exit(errors.length === 0 ? 0 : 1);
}

runAllTests();
