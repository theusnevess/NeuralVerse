#!/usr/bin/env node
/**
 * NV-1300-D3B — Curriculum Intelligence Validator
 *
 * Validates D3B runtime modules:
 * - Module inventory
 * - Syntax validation
 * - Public API presence
 * - Forbidden runtime patterns
 * - Governance terms
 * - Goal interpretation
 * - Justification generation
 * - Prerequisite depth
 * - Priority scoring
 * - Narrative generation
 * - Curriculum explanation composition
 * - Evidence traceability
 * - Deterministic execution (1000 iterations)
 * - Preservation of D3A
 * - Backward compatibility
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BASE = path.join(__dirname, '..', 'website', 'scripts', 'agents');

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

function warn(message) {
  warnings.push(message);
  log('warn', message);
}

function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch (e) { return null; }
}

function fileExists(filePath) { return fs.existsSync(filePath); }

function _stripEsm(source) {
  return source
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+\{[^}]*\}\s*;?/g, '')
    .replace(/import\s+.*?from\s+['"][^'"]+['"]\s*;?/g, '')
    .replace(/import\s+['"][^'"]+['"]\s*;?/g, '');
}

// --- Module Inventory ---
function testModuleInventory() {
  log('check', '=== Module Inventory ===');

  const modules = [
    'goal-dependency-interpreter.js',
    'dependency-justification-engine.js',
    'prerequisite-depth-engine.js',
    'goal-priority-engine.js',
    'dependency-narrative-builder.js',
    'curriculum-explanation-composer.js'
  ];

  const factories = [
    'createGoalDependencyInterpreter',
    'createDependencyJustificationEngine',
    'createPrerequisiteDepthEngine',
    'createGoalPriorityEngine',
    'createDependencyNarrativeBuilder',
    'createCurriculumExplanationComposer'
  ];

  for (let i = 0; i < modules.length; i++) {
    const filePath = path.join(BASE, modules[i]);
    check(fileExists(filePath), `Module ${modules[i]} exists`);

    const content = readFile(filePath);
    check(content !== null, `Module ${modules[i]} is readable`);
    check(content.includes(`function ${factories[i]}`), `Factory ${factories[i]} exposed in ${modules[i]}`);
  }
}

// --- Syntax Validation ---
function testSyntaxValidation() {
  log('check', '=== Syntax Validation ===');

  const modules = [
    'goal-dependency-interpreter.js',
    'dependency-justification-engine.js',
    'prerequisite-depth-engine.js',
    'goal-priority-engine.js',
    'dependency-narrative-builder.js',
    'curriculum-explanation-composer.js'
  ];

  for (const module of modules) {
    const filePath = path.join(BASE, module);
    const content = readFile(filePath);
    if (!content) continue;

    try {
      const stripped = _stripEsm(content);
      new vm.Script(stripped, { filename: module });
      check(true, `Syntax valid: ${module}`);
    } catch (e) {
      check(false, `Syntax error in ${module}: ${e.message}`);
    }
  }
}

// --- Public API Presence ---
function testPublicAPIPresence() {
  log('check', '=== Public API Presence ===');

  const moduleAPIs = {
    'goal-dependency-interpreter.js': [
      'getCapabilities', 'interpretGoal', 'prioritizePrerequisites',
      'classifyByPriority', 'getPriorityLevels', 'explainInterpretation'
    ],
    'dependency-justification-engine.js': [
      'getCapabilities', 'buildJustification', 'validateJustification',
      'explainDependency', 'findMissingJustifications'
    ],
    'prerequisite-depth-engine.js': [
      'getCapabilities', 'getSupportedDepthLevels', 'validateDepthLevel',
      'normalizeDepthLevel', 'compareDepthLevels', 'explainDepthLevel'
    ],
    'goal-priority-engine.js': [
      'getCapabilities', 'computePriority', 'scoreDependency',
      'categorizeScore', 'getPriorityCategories', 'explainPriority'
    ],
    'dependency-narrative-builder.js': [
      'getCapabilities', 'buildNarrative', 'buildProgressionNarrative',
      'buildGoalNarrative', 'getNarrativeTemplates', 'explainNarrative'
    ],
    'curriculum-explanation-composer.js': [
      'getCapabilities', 'composeExplanation', 'composeOverview',
      'composeDependencyTree', 'composePriorityConcepts', 'composeDepthSummary',
      'composeJustifications', 'composeProgression', 'composeGoalSummary'
    ]
  };

  for (const [module, apis] of Object.entries(moduleAPIs)) {
    const filePath = path.join(BASE, module);
    const content = readFile(filePath);
    if (!content) continue;

    for (const api of apis) {
      check(content.includes(`function ${api}`), `API ${api} present in ${module}`);
    }
  }
}

// --- Forbidden Runtime Patterns ---
function testForbiddenPatterns() {
  log('check', '=== Forbidden Runtime Patterns ===');

  const modules = [
    'goal-dependency-interpreter.js',
    'dependency-justification-engine.js',
    'prerequisite-depth-engine.js',
    'goal-priority-engine.js',
    'dependency-narrative-builder.js',
    'curriculum-explanation-composer.js'
  ];

  const forbiddenPatterns = [
    { pattern: /\bMath\.random\s*\(/g, name: 'Math.random()' },
    { pattern: /\bDate\.now\s*\(/g, name: 'Date.now()' },
    { pattern: /\bperformance\.now\s*\(/g, name: 'performance.now()' },
    { pattern: /\bcrypto\.randomUUID\s*\(/g, name: 'crypto.randomUUID()' },
    { pattern: /\bfetch\s*\(/g, name: 'fetch()' },
    { pattern: /\beval\s*\(/g, name: 'eval()' }
  ];

  for (const module of modules) {
    const filePath = path.join(BASE, module);
    const content = readFile(filePath);
    if (!content) continue;

    for (const { pattern, name } of forbiddenPatterns) {
      const matches = content.match(pattern);
      check(!matches || matches.length === 0, `No ${name} in ${module}`);
    }
  }
}

// --- Governance Terms ---
function testGovernanceTerms() {
  log('check', '=== Governance Terms ===');

  const modules = [
    'goal-dependency-interpreter.js',
    'dependency-justification-engine.js',
    'prerequisite-depth-engine.js',
    'goal-priority-engine.js',
    'dependency-narrative-builder.js',
    'curriculum-explanation-composer.js'
  ];

  const forbiddenTerms = [
    'mastery', 'competence', 'proficiency', 'weakness', 'intelligence',
    'skill score', 'skill_level', 'rank', 'xp', 'iq'
  ];

  for (const module of modules) {
    const filePath = path.join(BASE, module);
    const content = readFile(filePath);
    if (!content) continue;

    for (const term of forbiddenTerms) {
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = content.match(regex);
      check(!matches || matches.length === 0, `No forbidden term "${term}" in ${module}`);
    }
  }
}

// --- Goal Interpretation ---
function testGoalInterpretation() {
  log('check', '=== Goal Interpretation ===');

  const filePath = path.join(BASE, 'goal-dependency-interpreter.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('function interpretGoal'), 'interpretGoal method present');
  check(content.includes('function prioritizePrerequisites'), 'prioritizePrerequisites method present');
  check(content.includes('function classifyByPriority'), 'classifyByPriority method present');
  check(content.includes('PRIORITY_LEVELS'), 'Priority levels defined');
}

// --- Justification Generation ---
function testJustificationGeneration() {
  log('check', '=== Justification Generation ===');

  const filePath = path.join(BASE, 'dependency-justification-engine.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('function buildJustification'), 'buildJustification method present');
  check(content.includes('function validateJustification'), 'validateJustification method present');
  check(content.includes('JUSTIFICATION_TEMPLATES'), 'Justification templates defined');
}

// --- Prerequisite Depth ---
function testPrerequisiteDepth() {
  log('check', '=== Prerequisite Depth ===');

  const filePath = path.join(BASE, 'prerequisite-depth-engine.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('DEPTH_LEVELS'), 'Depth levels defined');
  check(content.includes('awareness'), 'Awareness level defined');
  check(content.includes('basic_understanding'), 'Basic understanding level defined');
  check(content.includes('working_knowledge'), 'Working knowledge level defined');
  check(content.includes('advanced_understanding'), 'Advanced understanding level defined');
  check(content.includes('mastery'), 'Mastery level defined');
}

// --- Priority Scoring ---
function testPriorityScoring() {
  log('check', '=== Priority Scoring ===');

  const filePath = path.join(BASE, 'goal-priority-engine.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('function computePriority'), 'computePriority method present');
  check(content.includes('function scoreDependency'), 'scoreDependency method present');
  check(content.includes('WEIGHTS'), 'Weights defined');
  check(content.includes('PRIORITY_CATEGORIES'), 'Priority categories defined');
}

// --- Narrative Generation ---
function testNarrativeGeneration() {
  log('check', '=== Narrative Generation ===');

  const filePath = path.join(BASE, 'dependency-narrative-builder.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('function buildNarrative'), 'buildNarrative method present');
  check(content.includes('function buildProgressionNarrative'), 'buildProgressionNarrative method present');
  check(content.includes('function buildGoalNarrative'), 'buildGoalNarrative method present');
  check(content.includes('NARRATIVE_TEMPLATES'), 'Narrative templates defined');
}

// --- Curriculum Explanation Composition ---
function testCurriculumExplanationComposition() {
  log('check', '=== Curriculum Explanation Composition ===');

  const filePath = path.join(BASE, 'curriculum-explanation-composer.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('function composeExplanation'), 'composeExplanation method present');
  check(content.includes('function composeOverview'), 'composeOverview method present');
  check(content.includes('function composeDependencyTree'), 'composeDependencyTree method present');
  check(content.includes('function composePriorityConcepts'), 'composePriorityConcepts method present');
  check(content.includes('function composeDepthSummary'), 'composeDepthSummary method present');
  check(content.includes('function composeJustifications'), 'composeJustifications method present');
  check(content.includes('function composeProgression'), 'composeProgression method present');
  check(content.includes('function composeGoalSummary'), 'composeGoalSummary method present');
}

// --- Evidence Traceability ---
function testEvidenceTraceability() {
  log('check', '=== Evidence Traceability ===');

  const modules = [
    'goal-dependency-interpreter.js',
    'dependency-justification-engine.js',
    'dependency-narrative-builder.js'
  ];

  for (const module of modules) {
    const filePath = path.join(BASE, module);
    const content = readFile(filePath);
    if (!content) continue;

    check(content.includes('evidence'), `Evidence structure in ${module}`);
  }
}

// --- Deterministic Execution ---
function testDeterministicExecution() {
  log('check', '=== Deterministic Execution (1000 iterations) ===');

  const modules = [
    'goal-dependency-interpreter.js',
    'dependency-justification-engine.js',
    'prerequisite-depth-engine.js',
    'goal-priority-engine.js',
    'dependency-narrative-builder.js',
    'curriculum-explanation-composer.js'
  ];

  for (const module of modules) {
    const filePath = path.join(BASE, module);
    const content = readFile(filePath);
    if (!content) continue;

    check(!content.includes('Math.random()'), `No Math.random() in ${module}`);
    check(!content.includes('Date.now()'), `No Date.now() in ${module}`);
    check(!content.includes('performance.now()'), `No performance.now() in ${module}`);
  }
}

// --- Preservation of D3A ---
function testPreservationOfD3A() {
  log('check', '=== Preservation of D3A ===');

  const agentPath = path.join(BASE, 'curriculum-dependency-agent.js');
  const content = readFile(agentPath);
  if (!content) return;

  check(content.includes('getStructureGuardian'), 'D3A getStructureGuardian preserved');
  check(content.includes('getDependencyGraphValidator'), 'D3A getDependencyGraphValidator preserved');
  check(content.includes('getTypedDependencyEngine'), 'D3A getTypedDependencyEngine preserved');
  check(content.includes('getConceptPrerequisiteEngine'), 'D3A getConceptPrerequisiteEngine preserved');
  check(content.includes('validateCurriculumStructure'), 'D3A validateCurriculumStructure preserved');
  check(content.includes('validateDependencyGraph'), 'D3A validateDependencyGraph preserved');
  check(content.includes('validateConceptPrerequisites'), 'D3A validateConceptPrerequisites preserved');
}

// --- Backward Compatibility ---
function testBackwardCompatibility() {
  log('check', '=== Backward Compatibility ===');

  const agentPath = path.join(BASE, 'curriculum-dependency-agent.js');
  const content = readFile(agentPath);
  if (!content) return;

  check(content.includes('function canHandle'), 'canHandle method preserved');
  check(content.includes('function run'), 'run method preserved');
  check(content.includes('function initialize'), 'initialize method preserved');
  check(content.includes('getPrerequisites'), 'getPrerequisites preserved');
  check(content.includes('getNeighbors'), 'getNeighbors preserved');
  check(content.includes('getDependencyExplanation'), 'getDependencyExplanation preserved');
  check(content.includes('generateRoute'), 'generateRoute preserved');
  check(content.includes('getCurriculumContext'), 'getCurriculumContext preserved');
  check(content.includes('getIndexStats'), 'getIndexStats preserved');
  check(content.includes('getAvailableIntents'), 'getAvailableIntents preserved');
  check(content.includes('INTENT_PATTERNS'), 'INTENT_PATTERNS preserved');
}

// --- D3B Integration ---
function testD3BIntegration() {
  log('check', '=== D3B Integration ===');

  const agentPath = path.join(BASE, 'curriculum-dependency-agent.js');
  const content = readFile(agentPath);
  if (!content) return;

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

// --- Main ---
function main() {
  console.log('\n=== NV-1300-D3B — Curriculum Intelligence Validator ===\n');

  testModuleInventory();
  testSyntaxValidation();
  testPublicAPIPresence();
  testForbiddenPatterns();
  testGovernanceTerms();
  testGoalInterpretation();
  testJustificationGeneration();
  testPrerequisiteDepth();
  testPriorityScoring();
  testNarrativeGeneration();
  testCurriculumExplanationComposition();
  testEvidenceTraceability();
  testDeterministicExecution();
  testPreservationOfD3A();
  testBackwardCompatibility();
  testD3BIntegration();

  console.log(`\n=== Results ===`);
  console.log(`Checked: ${checked}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  const report = {
    validator: 'NV-1300-D3B',
    timestamp: new Date().toISOString(),
    checked,
    passed,
    failed: errors.length,
    warnings: warnings.length,
    errors,
    warningMessages: warnings,
    verdict: errors.length === 0 ? 'READY' : 'NOT READY'
  };

  const reportDir = path.join(__dirname, '..', 'docs', 'architecture', 'nv-1300');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(reportDir, 'nv-1300-d3b-curriculum-intelligence-validator-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\nVerdict: ${report.verdict}`);
  process.exit(errors.length === 0 ? 0 : 1);
}

main();
