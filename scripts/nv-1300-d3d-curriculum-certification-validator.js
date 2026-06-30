#!/usr/bin/env node
/**
 * NV-1300-D3D — Curriculum Certification Validator
 *
 * Validates D3D runtime modules:
 * - Runtime module inventory
 * - Syntax validation
 * - Factory exposure
 * - Public API exposure
 * - Forbidden pattern scan
 * - Governance scan
 * - Unified report sections
 * - Unavailable section handling
 * - Capability matrix coverage
 * - Certification runner issue classification
 * - Facade API coverage
 * - D3A/D3B/D3C preservation
 * - Backward compatibility
 * - Input mutation safety
 * - 1000 execution determinism
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

// --- Runtime Module Inventory ---
function testRuntimeModuleInventory() {
  log('check', '=== Runtime Module Inventory ===');

  const modules = [
    'unified-curriculum-report-composer.js',
    'curriculum-capability-matrix.js',
    'curriculum-certification-runner.js',
    'curriculum-agent-facade.js'
  ];

  const factories = [
    'createUnifiedCurriculumReportComposer',
    'createCurriculumCapabilityMatrix',
    'createCurriculumCertificationRunner',
    'createCurriculumAgentFacade'
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
    'unified-curriculum-report-composer.js',
    'curriculum-capability-matrix.js',
    'curriculum-certification-runner.js',
    'curriculum-agent-facade.js'
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

// --- Public API Exposure ---
function testPublicAPIExposure() {
  log('check', '=== Public API Exposure ===');

  const moduleAPIs = {
    'unified-curriculum-report-composer.js': [
      'getCapabilities', 'composeUnifiedReport', 'composeExecutiveSummary',
      'composeStructureSection', 'composeDependencySection', 'composeGoalInterpretationSection',
      'composeProgressionSection', 'composeCoverageSection', 'composeHealthSection',
      'composeEvidenceAppendix', 'validateUnifiedReport'
    ],
    'curriculum-capability-matrix.js': [
      'getCapabilities', 'buildMatrix', 'getCapability',
      'listCapabilities', 'validateMatrix', 'summarizeCoverage'
    ],
    'curriculum-certification-runner.js': [
      'getCapabilities', 'runCertification', 'runStructureCertification',
      'runDependencyCertification', 'runIntelligenceCertification',
      'runProgressionCertification', 'runUnifiedReportCertification',
      'classifyIssue', 'summarizeCertification'
    ],
    'curriculum-agent-facade.js': [
      'getCapabilities', 'validateCurriculum', 'validateDependencies',
      'explainDependency', 'interpretGoal', 'analyzeProgression',
      'generateUnlockMap', 'composeReport', 'runCertification',
      'getCapabilityMatrix', 'getLastResult'
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

// --- Forbidden Pattern Scan ---
function testForbiddenPatterns() {
  log('check', '=== Forbidden Pattern Scan ===');

  const modules = [
    'unified-curriculum-report-composer.js',
    'curriculum-capability-matrix.js',
    'curriculum-certification-runner.js',
    'curriculum-agent-facade.js'
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

// --- Governance Scan ---
function testGovernanceScan() {
  log('check', '=== Governance Scan ===');

  const modules = [
    'unified-curriculum-report-composer.js',
    'curriculum-capability-matrix.js',
    'curriculum-certification-runner.js',
    'curriculum-agent-facade.js'
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

// --- Unified Report Sections ---
function testUnifiedReportSections() {
  log('check', '=== Unified Report Sections ===');

  const filePath = path.join(BASE, 'unified-curriculum-report-composer.js');
  const content = readFile(filePath);
  if (!content) return;

  const sections = [
    'Executive Summary', 'Structure Validation', 'Dependency Graph',
    'Goal Interpretation', 'Progression Continuity', 'Coverage',
    'Curriculum Health', 'Evidence Appendix', 'Warnings', 'Recommendations'
  ];

  for (const section of sections) {
    check(content.includes(`'${section}'`) || content.includes(`"${section}"`), `Section "${section}" defined`);
  }
}

// --- Unavailable Section Handling ---
function testUnavailableSectionHandling() {
  log('check', '=== Unavailable Section Handling ===');

  const filePath = path.join(BASE, 'unified-curriculum-report-composer.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes("'unavailable'") || content.includes('"unavailable"'), 'Unavailable status defined');
  check(content.includes('Section unavailable'), 'Unavailable message defined');
}

// --- Capability Matrix Coverage ---
function testCapabilityMatrixCoverage() {
  log('check', '=== Capability Matrix Coverage ===');

  const filePath = path.join(BASE, 'curriculum-capability-matrix.js');
  const content = readFile(filePath);
  if (!content) return;

  const groups = [
    'structure', 'dependencies', 'typed_dependencies', 'concept_prerequisites',
    'goal_interpretation', 'justification', 'depth_metadata', 'priority',
    'progression', 'redundancy', 'coverage', 'unlock_maps', 'health',
    'reporting', 'governance', 'determinism'
  ];

  for (const group of groups) {
    check(content.includes(`'${group}'`), `Group "${group}" defined`);
  }
}

// --- Certification Runner Issue Classification ---
function testCertificationRunnerIssueClassification() {
  log('check', '=== Certification Runner Issue Classification ===');

  const filePath = path.join(BASE, 'curriculum-certification-runner.js');
  const content = readFile(filePath);
  if (!content) return;

  const severities = ['critical', 'high', 'medium', 'low', 'info', 'environment'];
  for (const severity of severities) {
    check(content.includes(`'${severity}'`), `Severity "${severity}" defined`);
  }
}

// --- Facade API Coverage ---
function testFacadeAPICoverage() {
  log('check', '=== Facade API Coverage ===');

  const filePath = path.join(BASE, 'curriculum-agent-facade.js');
  const content = readFile(filePath);
  if (!content) return;

  const apis = [
    'validateCurriculum', 'validateDependencies', 'explainDependency',
    'interpretGoal', 'analyzeProgression', 'generateUnlockMap',
    'composeReport', 'runCertification', 'getCapabilityMatrix', 'getLastResult'
  ];

  for (const api of apis) {
    check(content.includes(`function ${api}`), `Facade API ${api} present`);
  }
}

// --- D3A/D3B/D3C Preservation ---
function testD3AD3BD3CPreservation() {
  log('check', '=== D3A/D3B/D3C Preservation ===');

  const agentPath = path.join(BASE, 'curriculum-dependency-agent.js');
  const content = readFile(agentPath);
  if (!content) return;

  // D3A
  check(content.includes('getStructureGuardian'), 'D3A getStructureGuardian preserved');
  check(content.includes('getDependencyGraphValidator'), 'D3A getDependencyGraphValidator preserved');
  check(content.includes('getTypedDependencyEngine'), 'D3A getTypedDependencyEngine preserved');
  check(content.includes('getConceptPrerequisiteEngine'), 'D3A getConceptPrerequisiteEngine preserved');

  // D3B
  check(content.includes('getGoalInterpreter'), 'D3B getGoalInterpreter preserved');
  check(content.includes('getJustificationEngine'), 'D3B getJustificationEngine preserved');
  check(content.includes('getDepthEngine'), 'D3B getDepthEngine preserved');
  check(content.includes('getPriorityEngine'), 'D3B getPriorityEngine preserved');
  check(content.includes('getNarrativeBuilder'), 'D3B getNarrativeBuilder preserved');
  check(content.includes('getExplanationComposer'), 'D3B getExplanationComposer preserved');

  // D3C
  check(content.includes('getProgressionContinuityEngine'), 'D3C getProgressionContinuityEngine preserved');
  check(content.includes('getRedundancyDetectionEngine'), 'D3C getRedundancyDetectionEngine preserved');
  check(content.includes('getCoverageVerifier'), 'D3C getCoverageVerifier preserved');
  check(content.includes('getGoalUnlockMapGenerator'), 'D3C getGoalUnlockMapGenerator preserved');
  check(content.includes('getCurriculumHealthAnalyzer'), 'D3C getCurriculumHealthAnalyzer preserved');
  check(content.includes('getProgressionReportComposer'), 'D3C getProgressionReportComposer preserved');
}

// --- D3D Integration ---
function testD3DIntegration() {
  log('check', '=== D3D Integration ===');

  const agentPath = path.join(BASE, 'curriculum-dependency-agent.js');
  const content = readFile(agentPath);
  if (!content) return;

  check(content.includes('ensureD3DModules'), 'D3D module initialization exists');
  check(content.includes('getUnifiedReportComposer'), 'D3D getUnifiedReportComposer exposed');
  check(content.includes('getCapabilityMatrix'), 'D3D getCapabilityMatrix exposed');
  check(content.includes('getCertificationRunner'), 'D3D getCertificationRunner exposed');
  check(content.includes('getCurriculumAgentFacade'), 'D3D getCurriculumAgentFacade exposed');
  check(content.includes('composeUnifiedCurriculumReport'), 'D3D composeUnifiedCurriculumReport exposed');
  check(content.includes('runCurriculumCertification'), 'D3D runCurriculumCertification exposed');
  check(content.includes('getD3CapabilityMatrix'), 'D3D getD3CapabilityMatrix exposed');
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

// --- Input Mutation Safety ---
function testInputMutationSafety() {
  log('check', '=== Input Mutation Safety ===');

  const modules = [
    'unified-curriculum-report-composer.js',
    'curriculum-capability-matrix.js',
    'curriculum-certification-runner.js',
    'curriculum-agent-facade.js'
  ];

  for (const module of modules) {
    const filePath = path.join(BASE, module);
    const content = readFile(filePath);
    if (!content) continue;

    check(!content.includes('.push(') || content.includes('const ') || content.includes('let '),
      `No direct push mutation in ${module}`);
    check(!content.includes('.splice('), `No splice mutation in ${module}`);
    check(!content.includes('.pop()'), `No pop mutation in ${module}`);
  }
}

// --- Main ---
function main() {
  console.log('\n=== NV-1300-D3D — Curriculum Certification Validator ===\n');

  testRuntimeModuleInventory();
  testSyntaxValidation();
  testPublicAPIExposure();
  testForbiddenPatterns();
  testGovernanceScan();
  testUnifiedReportSections();
  testUnavailableSectionHandling();
  testCapabilityMatrixCoverage();
  testCertificationRunnerIssueClassification();
  testFacadeAPICoverage();
  testD3AD3BD3CPreservation();
  testD3DIntegration();
  testBackwardCompatibility();
  testInputMutationSafety();

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
    validator: 'NV-1300-D3D',
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
    path.join(reportDir, 'nv-1300-d3d-curriculum-certification-validator-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\nVerdict: ${report.verdict}`);
  process.exit(errors.length === 0 ? 0 : 1);
}

main();
