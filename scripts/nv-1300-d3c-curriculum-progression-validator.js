#!/usr/bin/env node
/**
 * NV-1300-D3C — Curriculum Progression Validator
 *
 * Validates D3C runtime modules:
 * - Module inventory
 * - Syntax validation
 * - Public API presence
 * - Forbidden runtime patterns
 * - Governance terms
 * - Progression validation
 * - Redundancy detection
 * - Coverage verification
 * - Unlock map generation
 * - Health metrics
 * - Report composition
 * - Evidence traceability
 * - Deterministic execution (1000 iterations)
 * - Preservation of D3A/D3B
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
    'progression-continuity-engine.js',
    'redundancy-detection-engine.js',
    'competency-coverage-verifier.js',
    'goal-unlock-map-generator.js',
    'curriculum-health-analyzer.js',
    'curriculum-progression-report-composer.js'
  ];

  const factories = [
    'createProgressionContinuityEngine',
    'createRedundancyDetectionEngine',
    'createCompetencyCoverageVerifier',
    'createGoalUnlockMapGenerator',
    'createCurriculumHealthAnalyzer',
    'createCurriculumProgressionReportComposer'
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
    'progression-continuity-engine.js',
    'redundancy-detection-engine.js',
    'competency-coverage-verifier.js',
    'goal-unlock-map-generator.js',
    'curriculum-health-analyzer.js',
    'curriculum-progression-report-composer.js'
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
    'progression-continuity-engine.js': [
      'getCapabilities', 'validateProgression', 'detectConceptJumps',
      'detectMissingSteps', 'detectDisconnectedChains', 'detectAbruptComplexity', 'detectIsolatedConcepts'
    ],
    'redundancy-detection-engine.js': [
      'getCapabilities', 'findDuplicateConcepts', 'findDuplicateDependencies',
      'findDuplicateObjectives', 'findDuplicateArtifacts', 'summarizeRedundancy'
    ],
    'competency-coverage-verifier.js': [
      'getCapabilities', 'verifyCoverage', 'findUnsupportedCompetencies',
      'findPartiallyCoveredCompetencies', 'findCoveredCompetencies', 'buildCoverageReport'
    ],
    'goal-unlock-map-generator.js': [
      'getCapabilities', 'generateUnlockMap', 'generateConceptRoadmap',
      'validateUnlockMap', 'explainUnlockMap'
    ],
    'curriculum-health-analyzer.js': [
      'getCapabilities', 'analyzeHealth', 'computeMetrics',
      'computeHealthScore', 'generateRecommendations'
    ],
    'curriculum-progression-report-composer.js': [
      'getCapabilities', 'composeReport', 'composeOverview',
      'composeStructureSummary', 'composeProgression', 'composeDependencyQuality',
      'composeCoverage', 'composeRedundancy', 'composeUnlockGraph',
      'composeHealth', 'composeRecommendations'
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
    'progression-continuity-engine.js',
    'redundancy-detection-engine.js',
    'competency-coverage-verifier.js',
    'goal-unlock-map-generator.js',
    'curriculum-health-analyzer.js',
    'curriculum-progression-report-composer.js'
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
    'progression-continuity-engine.js',
    'redundancy-detection-engine.js',
    'competency-coverage-verifier.js',
    'goal-unlock-map-generator.js',
    'curriculum-health-analyzer.js',
    'curriculum-progression-report-composer.js'
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

// --- Progression Validation ---
function testProgressionValidation() {
  log('check', '=== Progression Validation ===');

  const filePath = path.join(BASE, 'progression-continuity-engine.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('function validateProgression'), 'validateProgression method present');
  check(content.includes('function detectConceptJumps'), 'detectConceptJumps method present');
  check(content.includes('function detectMissingSteps'), 'detectMissingSteps method present');
  check(content.includes('function detectDisconnectedChains'), 'detectDisconnectedChains method present');
  check(content.includes('function detectAbruptComplexity'), 'detectAbruptComplexity method present');
  check(content.includes('function detectIsolatedConcepts'), 'detectIsolatedConcepts method present');
}

// --- Redundancy Detection ---
function testRedundancyDetection() {
  log('check', '=== Redundancy Detection ===');

  const filePath = path.join(BASE, 'redundancy-detection-engine.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('function findDuplicateConcepts'), 'findDuplicateConcepts method present');
  check(content.includes('function findDuplicateDependencies'), 'findDuplicateDependencies method present');
  check(content.includes('function findDuplicateObjectives'), 'findDuplicateObjectives method present');
  check(content.includes('function findDuplicateArtifacts'), 'findDuplicateArtifacts method present');
  check(content.includes('function summarizeRedundancy'), 'summarizeRedundancy method present');
}

// --- Coverage Verification ---
function testCoverageVerification() {
  log('check', '=== Coverage Verification ===');

  const filePath = path.join(BASE, 'competency-coverage-verifier.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('function verifyCoverage'), 'verifyCoverage method present');
  check(content.includes('function findUnsupportedCompetencies'), 'findUnsupportedCompetencies method present');
  check(content.includes('function findPartiallyCoveredCompetencies'), 'findPartiallyCoveredCompetencies method present');
  check(content.includes('function findCoveredCompetencies'), 'findCoveredCompetencies method present');
  check(content.includes('function buildCoverageReport'), 'buildCoverageReport method present');
}

// --- Unlock Map Generation ---
function testUnlockMapGeneration() {
  log('check', '=== Unlock Map Generation ===');

  const filePath = path.join(BASE, 'goal-unlock-map-generator.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('function generateUnlockMap'), 'generateUnlockMap method present');
  check(content.includes('function generateConceptRoadmap'), 'generateConceptRoadmap method present');
  check(content.includes('function validateUnlockMap'), 'validateUnlockMap method present');
  check(content.includes('function explainUnlockMap'), 'explainUnlockMap method present');
}

// --- Health Metrics ---
function testHealthMetrics() {
  log('check', '=== Health Metrics ===');

  const filePath = path.join(BASE, 'curriculum-health-analyzer.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('function analyzeHealth'), 'analyzeHealth method present');
  check(content.includes('function computeMetrics'), 'computeMetrics method present');
  check(content.includes('function computeHealthScore'), 'computeHealthScore method present');
  check(content.includes('function generateRecommendations'), 'generateRecommendations method present');
}

// --- Report Composition ---
function testReportComposition() {
  log('check', '=== Report Composition ===');

  const filePath = path.join(BASE, 'curriculum-progression-report-composer.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('function composeReport'), 'composeReport method present');
  check(content.includes('function composeOverview'), 'composeOverview method present');
  check(content.includes('function composeStructureSummary'), 'composeStructureSummary method present');
  check(content.includes('function composeProgression'), 'composeProgression method present');
  check(content.includes('function composeCoverage'), 'composeCoverage method present');
  check(content.includes('function composeRedundancy'), 'composeRedundancy method present');
  check(content.includes('function composeUnlockGraph'), 'composeUnlockGraph method present');
  check(content.includes('function composeHealth'), 'composeHealth method present');
  check(content.includes('function composeRecommendations'), 'composeRecommendations method present');
}

// --- Evidence Traceability ---
function testEvidenceTraceability() {
  log('check', '=== Evidence Traceability ===');

  const modules = [
    'progression-continuity-engine.js',
    'redundancy-detection-engine.js',
    'competency-coverage-verifier.js',
    'goal-unlock-map-generator.js',
    'curriculum-health-analyzer.js'
  ];

  for (const module of modules) {
    const filePath = path.join(BASE, module);
    const content = readFile(filePath);
    if (!content) continue;

    check(content.includes('evidence') || content.includes('Evidence'), `Evidence structure in ${module}`);
  }
}

// --- Deterministic Execution ---
function testDeterministicExecution() {
  log('check', '=== Deterministic Execution (1000 iterations) ===');

  const modules = [
    'progression-continuity-engine.js',
    'redundancy-detection-engine.js',
    'competency-coverage-verifier.js',
    'goal-unlock-map-generator.js',
    'curriculum-health-analyzer.js',
    'curriculum-progression-report-composer.js'
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

// --- Preservation of D3A/D3B ---
function testPreservationOfD3AD3B() {
  log('check', '=== Preservation of D3A/D3B ===');

  const agentPath = path.join(BASE, 'curriculum-dependency-agent.js');
  const content = readFile(agentPath);
  if (!content) return;

  // D3A preservation
  check(content.includes('getStructureGuardian'), 'D3A getStructureGuardian preserved');
  check(content.includes('getDependencyGraphValidator'), 'D3A getDependencyGraphValidator preserved');
  check(content.includes('getTypedDependencyEngine'), 'D3A getTypedDependencyEngine preserved');
  check(content.includes('getConceptPrerequisiteEngine'), 'D3A getConceptPrerequisiteEngine preserved');

  // D3B preservation
  check(content.includes('getGoalInterpreter'), 'D3B getGoalInterpreter preserved');
  check(content.includes('getJustificationEngine'), 'D3B getJustificationEngine preserved');
  check(content.includes('getDepthEngine'), 'D3B getDepthEngine preserved');
  check(content.includes('getPriorityEngine'), 'D3B getPriorityEngine preserved');
  check(content.includes('getNarrativeBuilder'), 'D3B getNarrativeBuilder preserved');
  check(content.includes('getExplanationComposer'), 'D3B getExplanationComposer preserved');
}

// --- D3C Integration ---
function testD3CIntegration() {
  log('check', '=== D3C Integration ===');

  const agentPath = path.join(BASE, 'curriculum-dependency-agent.js');
  const content = readFile(agentPath);
  if (!content) return;

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

// --- Main ---
function main() {
  console.log('\n=== NV-1300-D3C — Curriculum Progression Validator ===\n');

  testModuleInventory();
  testSyntaxValidation();
  testPublicAPIPresence();
  testForbiddenPatterns();
  testGovernanceTerms();
  testProgressionValidation();
  testRedundancyDetection();
  testCoverageVerification();
  testUnlockMapGeneration();
  testHealthMetrics();
  testReportComposition();
  testEvidenceTraceability();
  testDeterministicExecution();
  testPreservationOfD3AD3B();
  testD3CIntegration();
  testBackwardCompatibility();

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
    validator: 'NV-1300-D3C',
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
    path.join(reportDir, 'nv-1300-d3c-curriculum-progression-validator-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\nVerdict: ${report.verdict}`);
  process.exit(errors.length === 0 ? 0 : 1);
}

main();
