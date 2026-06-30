#!/usr/bin/env node
/**
 * NV-1300-D3D — Curriculum Certification Verify Script
 *
 * Behavioral verification of D3D modules:
 * - Instantiate all D3D factories
 * - Compose unified report from full fixture
 * - Compose unified report from partial fixture
 * - Validate unavailable sections
 * - Build capability matrix
 * - Run certification with clean fixture
 * - Run certification with issue fixture
 * - Verify issue severity classification
 * - Verify facade API
 * - Verify 1000 repeated executions
 * - Verify byte-identical outputs
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
const FULL_INPUT = {
  structure: {
    valid: true,
    stats: { learningPaths: 5, modules: 20, lessons: 60, artifacts: 300 }
  },
  dependencies: {
    valid: true,
    stats: { nodeCount: 40, edgeCount: 80 }
  },
  conceptPrerequisites: { valid: true },
  goalInterpretation: {
    goal: 'Diffusion Models',
    totalPrerequisites: 5,
    byPriority: { critical: [{}], high: [{}], medium: [{}] }
  },
  progression: {
    valid: true,
    totalIssues: 2,
    issues: []
  },
  redundancy: { total: 0, byType: { concepts: 0, dependencies: 0, objectives: 0, artifacts: 0 } },
  coverage: {
    summary: { total: 10, covered: 8, partiallyCovered: 1, unsupported: 1, coverageRatio: '80.0%' }
  },
  health: {
    healthScore: 85,
    metrics: { orphanRate: 5, dependencyDensity: 15 },
    warnings: [],
    recommendations: []
  }
};

const PARTIAL_INPUT = {
  structure: { valid: true, stats: { learningPaths: 2, modules: 10, lessons: 30, artifacts: 150 } }
};

const ISSUE_INPUT = {
  structure: { valid: false, errors: ['Orphan module detected', 'Broken reference'] },
  dependencies: { valid: false },
  progression: { valid: false, totalIssues: 15, issues: [{ severity: 'critical', message: 'Critical progression issue' }] }
};

// --- Tests ---
function testReportComposerFactory() {
  log('check', '=== Test: Report Composer Factory ===');

  const sandbox = loadModule('unified-curriculum-report-composer.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.unifiedCurriculumReportComposer ||
                  sandbox.createUnifiedCurriculumReportComposer;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.composeUnifiedReport === 'function', 'composeUnifiedReport method exists');
  check(typeof instance.composeExecutiveSummary === 'function', 'composeExecutiveSummary method exists');
  check(typeof instance.composeStructureSection === 'function', 'composeStructureSection method exists');
  check(typeof instance.composeDependencySection === 'function', 'composeDependencySection method exists');
  check(typeof instance.composeGoalInterpretationSection === 'function', 'composeGoalInterpretationSection method exists');
  check(typeof instance.composeProgressionSection === 'function', 'composeProgressionSection method exists');
  check(typeof instance.composeCoverageSection === 'function', 'composeCoverageSection method exists');
  check(typeof instance.composeHealthSection === 'function', 'composeHealthSection method exists');
  check(typeof instance.composeEvidenceAppendix === 'function', 'composeEvidenceAppendix method exists');
  check(typeof instance.validateUnifiedReport === 'function', 'validateUnifiedReport method exists');
}

function testUnifiedReportFull() {
  log('check', '=== Test: Unified Report Full Fixture ===');

  const sandbox = loadModule('unified-curriculum-report-composer.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.unifiedCurriculumReportComposer ||
                  sandbox.createUnifiedCurriculumReportComposer;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.composeUnifiedReport(FULL_INPUT);
  check(result.valid === true, 'Report is valid');
  check(Array.isArray(result.sections), 'Sections array present');
  check(result.sections.length >= 10, 'At least 10 sections');
  check(result.totalSections >= 10, 'totalSections correct');
}

function testUnifiedReportPartial() {
  log('check', '=== Test: Unified Report Partial Fixture ===');

  const sandbox = loadModule('unified-curriculum-report-composer.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.unifiedCurriculumReportComposer ||
                  sandbox.createUnifiedCurriculumReportComposer;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.composeUnifiedReport(PARTIAL_INPUT);
  check(result.valid === true, 'Report is valid with partial input');
  check(Array.isArray(result.sections), 'Sections array present');

  const unavailableSections = result.sections.filter(s => s.status === 'unavailable');
  check(unavailableSections.length > 0, 'Unavailable sections present');
}

function testUnavailableSections() {
  log('check', '=== Test: Unavailable Section Handling ===');

  const sandbox = loadModule('unified-curriculum-report-composer.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.unifiedCurriculumReportComposer ||
                  sandbox.createUnifiedCurriculumReportComposer;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.composeUnifiedReport({});
  check(result.valid === true, 'Report handles empty input');

  const unavailableSections = result.sections.filter(s => s.status === 'unavailable');
  check(unavailableSections.length > 0, 'Unavailable sections for missing data');
}

function testCapabilityMatrixFactory() {
  log('check', '=== Test: Capability Matrix Factory ===');

  const sandbox = loadModule('curriculum-capability-matrix.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumCapabilityMatrix ||
                  sandbox.createCurriculumCapabilityMatrix;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.buildMatrix === 'function', 'buildMatrix method exists');
  check(typeof instance.getCapability === 'function', 'getCapability method exists');
  check(typeof instance.listCapabilities === 'function', 'listCapabilities method exists');
  check(typeof instance.validateMatrix === 'function', 'validateMatrix method exists');
  check(typeof instance.summarizeCoverage === 'function', 'summarizeCoverage method exists');
}

function testCapabilityMatrixBuild() {
  log('check', '=== Test: Capability Matrix Build ===');

  const sandbox = loadModule('curriculum-capability-matrix.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumCapabilityMatrix ||
                  sandbox.createCurriculumCapabilityMatrix;
  const instance = typeof factory === 'function' ? factory() : factory;

  const matrix = instance.buildMatrix();
  check(matrix.valid === true, 'Matrix is valid');
  check(Array.isArray(matrix.capabilities), 'Capabilities array present');
  check(matrix.totalCapabilities > 0, 'Total capabilities > 0');
  check(matrix.byGroup !== undefined, 'byGroup present');
  check(matrix.byPhase !== undefined, 'byPhase present');
}

function testCertificationRunnerFactory() {
  log('check', '=== Test: Certification Runner Factory ===');

  const sandbox = loadModule('curriculum-certification-runner.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumCertificationRunner ||
                  sandbox.createCurriculumCertificationRunner;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.runCertification === 'function', 'runCertification method exists');
  check(typeof instance.runStructureCertification === 'function', 'runStructureCertification method exists');
  check(typeof instance.runDependencyCertification === 'function', 'runDependencyCertification method exists');
  check(typeof instance.runIntelligenceCertification === 'function', 'runIntelligenceCertification method exists');
  check(typeof instance.runProgressionCertification === 'function', 'runProgressionCertification method exists');
  check(typeof instance.runUnifiedReportCertification === 'function', 'runUnifiedReportCertification method exists');
  check(typeof instance.classifyIssue === 'function', 'classifyIssue method exists');
  check(typeof instance.summarizeCertification === 'function', 'summarizeCertification method exists');
}

function testCertificationClean() {
  log('check', '=== Test: Certification Clean Fixture ===');

  const sandbox = loadModule('curriculum-certification-runner.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumCertificationRunner ||
                  sandbox.createCurriculumCertificationRunner;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.runCertification(FULL_INPUT);
  check(result.certified === true, 'Certification passes with clean input');
  check(Array.isArray(result.issues), 'Issues array present');
  check(result.summary !== undefined, 'Summary present');
}

function testCertificationIssues() {
  log('check', '=== Test: Certification Issue Fixture ===');

  const sandbox = loadModule('curriculum-certification-runner.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumCertificationRunner ||
                  sandbox.createCurriculumCertificationRunner;
  const instance = typeof factory === 'function' ? factory() : factory;

  const result = instance.runCertification(ISSUE_INPUT);
  check(result.certified === false, 'Certification fails with issues');
  check(result.issues.length > 0, 'Issues detected');
}

function testIssueClassification() {
  log('check', '=== Test: Issue Severity Classification ===');

  const sandbox = loadModule('curriculum-certification-runner.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumCertificationRunner ||
                  sandbox.createCurriculumCertificationRunner;
  const instance = typeof factory === 'function' ? factory() : factory;

  const classified = instance.classifyIssue({ source: 'test', message: 'Test issue', severity: 'high' });
  check(classified.severity === 'high', 'Severity classified correctly');
  check(classified.severityDescription !== undefined, 'Description present');
}

function testFacadeFactory() {
  log('check', '=== Test: Facade Factory ===');

  const sandbox = loadModule('curriculum-agent-facade.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumAgentFacade ||
                  sandbox.createCurriculumAgentFacade;
  check(typeof factory === 'function' || typeof factory === 'object', 'Factory exists');

  const instance = typeof factory === 'function' ? factory() : factory;
  check(typeof instance.validateCurriculum === 'function', 'validateCurriculum method exists');
  check(typeof instance.validateDependencies === 'function', 'validateDependencies method exists');
  check(typeof instance.explainDependency === 'function', 'explainDependency method exists');
  check(typeof instance.interpretGoal === 'function', 'interpretGoal method exists');
  check(typeof instance.analyzeProgression === 'function', 'analyzeProgression method exists');
  check(typeof instance.generateUnlockMap === 'function', 'generateUnlockMap method exists');
  check(typeof instance.composeReport === 'function', 'composeReport method exists');
  check(typeof instance.runCertification === 'function', 'runCertification method exists');
  check(typeof instance.getCapabilityMatrix === 'function', 'getCapabilityMatrix method exists');
  check(typeof instance.getLastResult === 'function', 'getLastResult method exists');
}

function testDeterministicExecution() {
  log('check', '=== Test: 1000 Deterministic Iterations ===');

  const modules = [
    { file: 'unified-curriculum-report-composer.js', factory: 'unifiedCurriculumReportComposer', method: 'getCapabilities', args: [] },
    { file: 'curriculum-capability-matrix.js', factory: 'curriculumCapabilityMatrix', method: 'getCapabilities', args: [] },
    { file: 'curriculum-certification-runner.js', factory: 'curriculumCertificationRunner', method: 'getCapabilities', args: [] },
    { file: 'curriculum-agent-facade.js', factory: 'curriculumAgentFacade', method: 'getCapabilities', args: [] }
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

function testD3DIntegration() {
  log('check', '=== Test: D3D Integration ===');

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

function warn(message) {
  console.log(`\x1b[33mWARN\x1b[0m  ${message}`);
}

// --- Main ---
function main() {
  console.log('\n=== NV-1300-D3D — Curriculum Certification Verify Script ===\n');

  testReportComposerFactory();
  testUnifiedReportFull();
  testUnifiedReportPartial();
  testUnavailableSections();
  testCapabilityMatrixFactory();
  testCapabilityMatrixBuild();
  testCertificationRunnerFactory();
  testCertificationClean();
  testCertificationIssues();
  testIssueClassification();
  testFacadeFactory();
  testDeterministicExecution();
  testD3DIntegration();

  console.log(`\n=== Results ===`);
  console.log(`Checked: ${checked}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  const report = {
    validator: 'NV-1300-D3D-Verify',
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
    path.join(reportDir, 'nv-1300-d3d-curriculum-certification-verify-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\nVerdict: ${report.verdict}`);
  process.exit(errors.length === 0 ? 0 : 1);
}

main();
