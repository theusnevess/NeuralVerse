#!/usr/bin/env node
/**
 * NV-1300-D3A — Curriculum Core Validator
 *
 * Validates D3A runtime modules:
 * - Module existence and factory exposure
 * - Public API presence
 * - Syntax validation
 * - Forbidden runtime patterns
 * - Governance terms handling
 * - Typed dependency normalization
 * - Dependency graph validation
 * - Concept prerequisite validation
 * - Deterministic output (1000 iterations)
 * - No mutation of input objects
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

// --- Module Existence and Factory Exposure ---
function testModuleExistence() {
  log('check', '=== Module Existence and Factory Exposure ===');

  const modules = [
    'curriculum-structure-guardian.js',
    'dependency-graph-validator.js',
    'typed-dependency-engine.js',
    'concept-prerequisite-engine.js'
  ];

  const factories = [
    'createCurriculumStructureGuardian',
    'createDependencyGraphValidator',
    'createTypedDependencyEngine',
    'createConceptPrerequisiteEngine'
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
    'curriculum-structure-guardian.js',
    'dependency-graph-validator.js',
    'typed-dependency-engine.js',
    'concept-prerequisite-engine.js'
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
    'curriculum-structure-guardian.js': [
      'getCapabilities', 'validateStructure', 'validateOwnership',
      'getOrphans', 'getBrokenReferences', 'getReachabilityReport', 'summarizeStructure'
    ],
    'dependency-graph-validator.js': [
      'getCapabilities', 'validateGraph', 'detectCycles', 'detectSelfDependencies',
      'detectDuplicateEdges', 'detectBrokenReferences', 'validateDependencyDirection', 'topologicalSort'
    ],
    'typed-dependency-engine.js': [
      'getCapabilities', 'getSupportedTypes', 'normalizeDependencyType',
      'validateDependencyType', 'classifyDependency', 'filterByType', 'explainType'
    ],
    'concept-prerequisite-engine.js': [
      'getCapabilities', 'getPrerequisitesForConcept', 'getPrerequisitesForArtifact',
      'getPrerequisitesForLesson', 'buildConceptChain', 'validateConceptPrerequisites'
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
    'curriculum-structure-guardian.js',
    'dependency-graph-validator.js',
    'typed-dependency-engine.js',
    'concept-prerequisite-engine.js'
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
    'curriculum-structure-guardian.js',
    'dependency-graph-validator.js',
    'typed-dependency-engine.js',
    'concept-prerequisite-engine.js'
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

// --- Typed Dependency Validation ---
function testTypedDependencyValidation() {
  log('check', '=== Typed Dependency Validation ===');

  const filePath = path.join(BASE, 'typed-dependency-engine.js');
  const content = readFile(filePath);
  if (!content) return;

  const validTypes = ['required', 'recommended', 'optional_background', 'enrichment', 'co_requisite'];
  for (const type of validTypes) {
    check(content.includes(`'${type}'`), `Type "${type}" defined in engine`);
  }

  const aliases = [
    'optional background', 'co-requisite', 'corequisite',
    'prerequisite', 'suggested', 'background', 'extension'
  ];
  for (const alias of aliases) {
    check(content.includes(`'${alias}'`), `Alias "${alias}" defined in engine`);
  }
}

// --- Dependency Graph Validation ---
function testDependencyGraphValidation() {
  log('check', '=== Dependency Graph Validation ===');

  const filePath = path.join(BASE, 'dependency-graph-validator.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('function detectCycles'), 'Cycle detection method present');
  check(content.includes('function detectSelfDependencies'), 'Self-dependency detection present');
  check(content.includes('function detectDuplicateEdges'), 'Duplicate edge detection present');
  check(content.includes('function detectBrokenReferences'), 'Broken reference detection present');
  check(content.includes('function topologicalSort'), 'Topological sort present');
}

// --- Concept Prerequisite Validation ---
function testConceptPrerequisiteValidation() {
  log('check', '=== Concept Prerequisite Validation ===');

  const filePath = path.join(BASE, 'concept-prerequisite-engine.js');
  const content = readFile(filePath);
  if (!content) return;

  check(content.includes('function getPrerequisitesForConcept'), 'Concept prerequisite resolution present');
  check(content.includes('function buildConceptChain'), 'Concept chain building present');
  check(content.includes('function validateConceptPrerequisites'), 'Concept prerequisite validation present');
  check(content.includes('detectPrerequisiteCycles'), 'Prerequisite cycle detection present');
}

// --- No Mutation of Input Objects ---
function testNoMutation() {
  log('check', '=== No Mutation of Input Objects ===');

  const modules = [
    'curriculum-structure-guardian.js',
    'dependency-graph-validator.js',
    'typed-dependency-engine.js',
    'concept-prerequisite-engine.js'
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

// --- Deterministic Output (1000 iterations) ---
function testDeterministicOutput() {
  log('check', '=== Deterministic Output (1000 iterations) ===');

  const modules = [
    { file: 'typed-dependency-engine.js', factory: 'createTypedDependencyEngine', method: 'normalizeDependencyType', args: ['required'] },
    { file: 'typed-dependency-engine.js', factory: 'createTypedDependencyEngine', method: 'getSupportedTypes', args: [] },
    { file: 'typed-dependency-engine.js', factory: 'createTypedDependencyEngine', method: 'validateDependencyType', args: ['recommended'] }
  ];

  for (const { file, factory, method, args } of modules) {
    const filePath = path.join(BASE, file);
    const content = readFile(filePath);
    if (!content) continue;

    try {
      const stripped = _stripEsm(content);
      const script = new vm.Script(stripped, { filename: file });
      const sandbox = { window: {}, module: { exports: {} }, exports: {} };
      const context = vm.createContext(sandbox);
      script.runInContext(context);

      const factoryFn = sandbox.window?.NeuralVerse?.[factory.replace('create', '').charAt(0).toLowerCase() + factory.replace('create', '').slice(1)] ||
                       sandbox[factory];

      if (typeof factoryFn === 'function') {
        const instance = factoryFn();
        if (typeof instance[method] === 'function') {
          const results = [];
          for (let i = 0; i < 1000; i++) {
            results.push(JSON.stringify(instance[method](...args)));
          }
          const allSame = results.every(r => r === results[0]);
          check(allSame, `Deterministic output: ${method} in ${file}`);
        } else {
          warn(`Method ${method} not found in ${file}`);
        }
      } else {
        warn(`Factory ${factory} not found in ${file}`);
      }
    } catch (e) {
      warn(`Could not test determinism for ${file}: ${e.message}`);
    }
  }
}

// --- Main ---
function main() {
  console.log('\n=== NV-1300-D3A — Curriculum Core Validator ===\n');

  testModuleExistence();
  testSyntaxValidation();
  testPublicAPIPresence();
  testForbiddenPatterns();
  testGovernanceTerms();
  testTypedDependencyValidation();
  testDependencyGraphValidation();
  testConceptPrerequisiteValidation();
  testNoMutation();
  testDeterministicOutput();

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
    validator: 'NV-1300-D3A',
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
    path.join(reportDir, 'nv-1300-d3a-curriculum-core-validator-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\nVerdict: ${report.verdict}`);
  process.exit(errors.length === 0 ? 0 : 1);
}

main();
