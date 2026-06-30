#!/usr/bin/env node
/**
 * NV-1300-D1B — Structural Validator
 *
 * Validates all D1B modules for:
 * - Module existence and factory function exposure
 * - No syntax errors
 * - Required API surface
 * - Forbidden patterns
 * - Data structure integrity
 */

const fs = require('fs');
const path = require('path');
const { hasForbiddenPattern, hasForbiddenTerm } = require('./governance-tokenizer.js');

const BASE = path.join(__dirname, '..', 'website', 'scripts', 'agents');

const D1B_FILES = [
  { name: 'semantic-dependency-resolver', path: path.join(BASE, 'semantic-dependency-resolver.js') },
  { name: 'example-selection-engine', path: path.join(BASE, 'example-selection-engine.js') },
  { name: 'example-registry', path: path.join(BASE, 'example-registry.js') },
  { name: 'cross-domain-connector', path: path.join(BASE, 'cross-domain-connector.js') },
  { name: 'recap-inserter', path: path.join(BASE, 'recap-inserter.js') },
  { name: 'resource-selector', path: path.join(BASE, 'resource-selector.js') }
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

function testModuleExistence() {
  log('info', '=== Module Existence ===');
  for (const mod of D1B_FILES) {
    check(fileExists(mod.path), `Module exists: ${mod.name}.js`);
  }
}

function testFactoryExposure() {
  log('info', '=== Factory Function Exposure ===');
  const expected = {
    'semantic-dependency-resolver.js': 'createSemanticDependencyResolver',
    'example-selection-engine.js': 'createExampleSelectionEngine',
    'example-registry.js': 'createExampleRegistry',
    'cross-domain-connector.js': 'createCrossDomainConnector',
    'recap-inserter.js': 'createRecapInserter',
    'resource-selector.js': 'createResourceSelector'
  };

  for (const [filename, factory] of Object.entries(expected)) {
    const content = readFile(path.join(BASE, filename));
    check(content && content.includes(`function ${factory}`), `Factory: ${factory} in ${filename}`);
  }
}

function testAPIs() {
  log('info', '=== Required APIs ===');

  const resolver = readFile(path.join(BASE, 'semantic-dependency-resolver.js'));
  if (resolver) {
    check(resolver.includes('resolvePrerequisites'), 'Resolver: resolvePrerequisites');
    check(resolver.includes('resolveTransitivePrerequisites'), 'Resolver: resolveTransitivePrerequisites');
    check(resolver.includes('detectMissingDependencies'), 'Resolver: detectMissingDependencies');
    check(resolver.includes('buildDependencyChain'), 'Resolver: buildDependencyChain');
    check(resolver.includes('validateDependencyOrder'), 'Resolver: validateDependencyOrder');
    check(resolver.includes('explainDependency'), 'Resolver: explainDependency');
  }

  const exampleEngine = readFile(path.join(BASE, 'example-selection-engine.js'));
  if (exampleEngine) {
    check(exampleEngine.includes('scoreExample'), 'ExampleEngine: scoreExample');
    check(exampleEngine.includes('rankExamples'), 'ExampleEngine: rankExamples');
    check(exampleEngine.includes('selectBestExamples'), 'ExampleEngine: selectBestExamples');
    check(exampleEngine.includes('explainSelection'), 'ExampleEngine: explainSelection');
    check(exampleEngine.includes('WEIGHTS'), 'ExampleEngine: WEIGHTS');
  }

  const registry = readFile(path.join(BASE, 'example-registry.js'));
  if (registry) {
    check(registry.includes('getExample'), 'Registry: getExample');
    check(registry.includes('getAllExamples'), 'Registry: getAllExamples');
    check(registry.includes('getExamplesByConcept'), 'Registry: getExamplesByConcept');
    check(registry.includes('getExamplesByCategory'), 'Registry: getExamplesByCategory');
    check(registry.includes('getExamplesByDifficulty'), 'Registry: getExamplesByDifficulty');
    check(registry.includes('searchExamples'), 'Registry: searchExamples');
    check(registry.includes('CANONICAL_EXAMPLES'), 'Registry: CANONICAL_EXAMPLES');
  }

  const crossDomain = readFile(path.join(BASE, 'cross-domain-connector.js'));
  if (crossDomain) {
    check(crossDomain.includes('getConnections'), 'CrossDomain: getConnections');
    check(crossDomain.includes('explainConnection'), 'CrossDomain: explainConnection');
    check(crossDomain.includes('rankConnections'), 'CrossDomain: rankConnections');
    check(crossDomain.includes('filterConnections'), 'CrossDomain: filterConnections');
    check(crossDomain.includes('CANONICAL_CROSS_DOMAIN_CONNECTIONS'), 'CrossDomain: CANONICAL_CROSS_DOMAIN_CONNECTIONS');
  }

  const recap = readFile(path.join(BASE, 'recap-inserter.js'));
  if (recap) {
    check(recap.includes('needsRecap'), 'RecapInserter: needsRecap');
    check(recap.includes('createRecap'), 'RecapInserter: createRecap');
    check(recap.includes('insertRecaps'), 'RecapInserter: insertRecaps');
    check(recap.includes('RECAP_DEPTH_LIMITS'), 'RecapInserter: RECAP_DEPTH_LIMITS');
  }

  const resource = readFile(path.join(BASE, 'resource-selector.js'));
  if (resource) {
    check(resource.includes('selectConcepts'), 'ResourceSelector: selectConcepts');
    check(resource.includes('selectArtifacts'), 'ResourceSelector: selectArtifacts');
    check(resource.includes('selectVisualizations'), 'ResourceSelector: selectVisualizations');
    check(resource.includes('selectLabs'), 'ResourceSelector: selectLabs');
    check(resource.includes('selectSharedKnowledge'), 'ResourceSelector: selectSharedKnowledge');
    check(resource.includes('buildResourceBundle'), 'ResourceSelector: buildResourceBundle');
    check(resource.includes('validateResourceBundle'), 'ResourceSelector: validateResourceBundle');
  }
}

function testForbiddenPatterns() {
  log('info', '=== Forbidden Patterns ===');
  const allFiles = [...D1B_FILES, ...MODIFIED_FILES];
  for (const mod of allFiles) {
    const content = readFile(mod.path);
    if (!content) continue;
    check(hasForbiddenPattern(content, /\bMath\.random\b/g) === 0, `No Math.random in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bDate\.now\b/g) === 0, `No Date.now in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\beval\s*\(/g) === 0, `No eval() in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bnew\s+Function\s*\(/g) === 0, `No new Function() in ${mod.name}.js`);
  }
}

function testD1BIntegration() {
  log('info', '=== D1B Integration in Agent ===');
  const agent = readFile(path.join(BASE, 'didactic-architecture-agent.js'));
  if (!agent) { check(false, 'Agent file not readable'); return; }

  check(agent.includes("import { createSemanticDependencyResolver }"), 'Agent imports SemanticDependencyResolver');
  check(agent.includes("import { createExampleSelectionEngine }"), 'Agent imports ExampleSelectionEngine');
  check(agent.includes("import { createExampleRegistry }"), 'Agent imports ExampleRegistry');
  check(agent.includes("import { createCrossDomainConnector }"), 'Agent imports CrossDomainConnector');
  check(agent.includes("import { createRecapInserter }"), 'Agent imports RecapInserter');
  check(agent.includes("import { createResourceSelector }"), 'Agent imports ResourceSelector');

  check(agent.includes('createSemanticDependencyResolver()'), 'Agent initializes SemanticResolver');
  check(agent.includes('createExampleSelectionEngine()'), 'Agent initializes ExampleEngine');
  check(agent.includes('createExampleRegistry()'), 'Agent initializes ExampleRegistry');
  check(agent.includes('createCrossDomainConnector()'), 'Agent initializes CrossDomainConnector');
  check(agent.includes('createRecapInserter()'), 'Agent initializes RecapInserter');
  check(agent.includes('createResourceSelector()'), 'Agent initializes ResourceSelector');

  check(agent.includes('semanticResolver: semanticResolver'), 'Agent passes semanticResolver to planner');
  check(agent.includes('exampleEngine: exampleEngine'), 'Agent passes exampleEngine to planner');
  check(agent.includes('exampleRegistry: exampleReg'), 'Agent passes exampleRegistry to planner');
  check(agent.includes('crossDomainConnector: crossDomainConnector'), 'Agent passes crossDomainConnector to planner');
  check(agent.includes('recapInserter: recapInserter'), 'Agent passes recapInserter to planner');
  check(agent.includes('resourceSelector: resourceSelector'), 'Agent passes resourceSelector to planner');

  check(agent.includes('getSemanticResolver'), 'Agent exposes getSemanticResolver');
  check(agent.includes('getExampleEngine'), 'Agent exposes getExampleEngine');
  check(agent.includes('getExampleRegistry'), 'Agent exposes getExampleRegistry');
  check(agent.includes('getCrossDomainConnector'), 'Agent exposes getCrossDomainConnector');
  check(agent.includes('getRecapInserter'), 'Agent exposes getRecapInserter');
  check(agent.includes('getResourceSelector'), 'Agent exposes getResourceSelector');
}

function testPlannerD1BFields() {
  log('info', '=== Planner D1B Fields ===');
  const planner = readFile(path.join(BASE, 'pedagogical-planner.js'));
  if (!planner) { check(false, 'Planner file not readable'); return; }

  check(planner.includes('semanticResolver'), 'Planner accepts semanticResolver');
  check(planner.includes('exampleEngine'), 'Planner accepts exampleEngine');
  check(planner.includes('exampleRegistry'), 'Planner accepts exampleRegistry');
  check(planner.includes('crossDomainConnector'), 'Planner accepts crossDomainConnector');
  check(planner.includes('recapInserter'), 'Planner accepts recapInserter');
  check(planner.includes('resourceSelector'), 'Planner accepts resourceSelector');

  check(planner.includes('dependencyChain'), 'Plan includes dependencyChain');
  check(planner.includes('missingPrerequisites'), 'Plan includes missingPrerequisites');
  check(planner.includes('insertedRecaps'), 'Plan includes insertedRecaps');
  check(planner.includes('selectedExamples'), 'Plan includes selectedExamples');
  check(planner.includes('selectedResources'), 'Plan includes selectedResources');
  check(planner.includes('crossDomainConnections'), 'Plan includes crossDomainConnections');
  check(planner.includes('semanticWarnings'), 'Plan includes semanticWarnings');
  check(planner.includes('recapsCount'), 'Plan includes recapsCount');
}

function testCrossDomainData() {
  log('info', '=== Cross-Domain Connection Data ===');
  const content = readFile(path.join(BASE, 'cross-domain-connector.js'));
  if (!content) return;

  check(content.includes("'linear-models'"), 'CrossDomain has linear-models');
  check(content.includes("'word-embeddings'"), 'CrossDomain has word-embeddings');
  check(content.includes("'gradient-descent'"), 'CrossDomain has gradient-descent');
  check(content.includes("'self-attention'"), 'CrossDomain has self-attention');
  check(content.includes("'transformer-architecture'"), 'CrossDomain has transformer-architecture');
  check(content.includes("'rag-pipeline'"), 'CrossDomain has rag-pipeline');
  check(content.includes("'dense-retrieval'"), 'CrossDomain has dense-retrieval');
  check(content.includes("'semantic-search'"), 'CrossDomain has semantic-search');
  check(content.includes("'mathematical-foundation'"), 'CrossDomain has relationship types');
  check(content.includes("'core-component'"), 'CrossDomain has core-component type');
  check(content.includes("'enables'"), 'CrossDomain has enables type');
}

function testExampleRegistryData() {
  log('info', '=== Example Registry Data ===');
  const content = readFile(path.join(BASE, 'example-registry.js'));
  if (!content) return;

  check(content.includes("'ex-linear-regression-housing'"), 'Registry has linear regression example');
  check(content.includes("'ex-gradient-descent-optimization'"), 'Registry has gradient descent example');
  check(content.includes("'ex-self-attention-mechanism'"), 'Registry has self-attention example');
  check(content.includes("'ex-rag-pipeline'"), 'Registry has RAG example');
  check(content.includes("'ex-pca-dimensionality-reduction'"), 'Registry has PCA example');
  check(content.includes("'ex-embedding-similarity'"), 'Registry has embedding similarity example');
  check(content.includes("canonicalStatus"), 'Examples have canonicalStatus');
  check(content.includes("conceptIds"), 'Examples have conceptIds');
  check(content.includes("visualizationIds"), 'Examples have visualizationIds');
  check(content.includes("laboratoryIds"), 'Examples have laboratoryIds');
}

function testRecapLimits() {
  log('info', '=== Recap Depth Limits ===');
  const content = readFile(path.join(BASE, 'recap-inserter.js'));
  if (!content) return;

  check(content.includes('essentials: 1'), 'Essentials max 1 recap');
  check(content.includes('standard: 2'), 'Standard max 2 recaps');
  check(content.includes('deep_dive: 3'), 'Deep Dive max 3 recaps');
  check(content.includes('research_notes: 3'), 'Research Notes max 3 recaps');
}

function testFileSizes() {
  log('info', '=== File Size Sanity ===');
  const allFiles = [...D1B_FILES, ...MODIFIED_FILES];
  for (const mod of allFiles) {
    if (!fileExists(mod.path)) continue;
    const stat = fs.statSync(mod.path);
    const sizeKB = stat.size / 1024;
    check(sizeKB > 1, `${mod.name}.js >1KB: ${sizeKB.toFixed(1)}KB`);
    check(sizeKB < 60, `${mod.name}.js <60KB: ${sizeKB.toFixed(1)}KB`);
  }
}

function runAllTests() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  NV-1300-D1B — Structural Validator');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  testModuleExistence();
  console.log('');
  testFactoryExposure();
  console.log('');
  testAPIs();
  console.log('');
  testForbiddenPatterns();
  console.log('');
  testD1BIntegration();
  console.log('');
  testPlannerD1BFields();
  console.log('');
  testCrossDomainData();
  console.log('');
  testExampleRegistryData();
  console.log('');
  testRecapLimits();
  console.log('');
  testFileSizes();
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
    validator: 'NV-1300-D1B-structural',
    timestamp: new Date().toISOString(),
    summary: { checks: checked, passed, errors: errors.length, verdict: errors.length === 0 ? 'READY' : 'NOT READY' },
    errors
  };

  try {
    fs.writeFileSync(path.join(reportDir, 'nv-1300-d1b-structural-report.json'), JSON.stringify(report, null, 2));
    console.log('  Report written to docs/architecture/nv-1300/nv-1300-d1b-structural-report.json');
  } catch (e) { console.log('  Could not write report: ' + e.message); }

  console.log('');
  process.exit(errors.length === 0 ? 0 : 1);
}

runAllTests();
