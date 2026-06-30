#!/usr/bin/env node
/**
 * NV-1300-D3A — Curriculum Core Verify Script
 *
 * Behavioral verification of D3A modules:
 * - Valid hierarchy fixture
 * - Orphan module fixture
 * - Broken lesson reference fixture
 * - Dependency cycle fixture
 * - Self-dependency fixture
 * - Duplicate edge fixture
 * - Typed dependency alias fixture
 * - Concept prerequisite chain fixture
 * - Malformed input fixture
 * - 1000 repeated executions of full D3A core pipeline
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
const VALID_HIERARCHY = {
  learningPaths: [
    { id: 'path-1', title: 'Path 1', moduleIds: ['mod-1', 'mod-2'] },
    { id: 'path-2', title: 'Path 2', moduleIds: ['mod-3'] }
  ],
  modules: [
    { id: 'mod-1', title: 'Module 1', lessonIds: ['les-1', 'les-2'] },
    { id: 'mod-2', title: 'Module 2', lessonIds: ['les-3'] },
    { id: 'mod-3', title: 'Module 3', lessonIds: ['les-4'] }
  ],
  lessons: [
    { id: 'les-1', title: 'Lesson 1', artifactIds: ['art-1'] },
    { id: 'les-2', title: 'Lesson 2', artifactIds: ['art-2'] },
    { id: 'les-3', title: 'Lesson 3', artifactIds: ['art-3'] },
    { id: 'les-4', title: 'Lesson 4', artifactIds: ['art-4'] }
  ],
  artifacts: [
    { id: 'art-1', title: 'Artifact 1', type: 'text' },
    { id: 'art-2', title: 'Artifact 2', type: 'visual' },
    { id: 'art-3', title: 'Artifact 3', type: 'exercise' },
    { id: 'art-4', title: 'Artifact 4', type: 'text' }
  ]
};

const ORPHAN_MODULE_HIERARCHY = {
  learningPaths: [
    { id: 'path-1', title: 'Path 1', moduleIds: ['mod-1'] }
  ],
  modules: [
    { id: 'mod-1', title: 'Module 1', lessonIds: ['les-1'] },
    { id: 'mod-orphan', title: 'Orphan Module', lessonIds: ['les-orphan'] }
  ],
  lessons: [
    { id: 'les-1', title: 'Lesson 1', artifactIds: ['art-1'] },
    { id: 'les-orphan', title: 'Orphan Lesson', artifactIds: [] }
  ],
  artifacts: [
    { id: 'art-1', title: 'Artifact 1', type: 'text' }
  ]
};

const BROKEN_REF_HIERARCHY = {
  learningPaths: [
    { id: 'path-1', title: 'Path 1', moduleIds: ['mod-1', 'mod-missing'] }
  ],
  modules: [
    { id: 'mod-1', title: 'Module 1', lessonIds: ['les-1', 'les-missing'] }
  ],
  lessons: [
    { id: 'les-1', title: 'Lesson 1', artifactIds: ['art-1', 'art-missing'] }
  ],
  artifacts: [
    { id: 'art-1', title: 'Artifact 1', type: 'text' }
  ]
};

const CYCLE_GRAPH = {
  nodes: [
    { id: 'a' }, { id: 'b' }, { id: 'c' }
  ],
  edges: [
    { source: 'a', target: 'b' },
    { source: 'b', target: 'c' },
    { source: 'c', target: 'a' }
  ]
};

const SELF_DEP_GRAPH = {
  nodes: [{ id: 'a' }],
  edges: [{ source: 'a', target: 'a' }]
};

const DUPLICATE_EDGES_GRAPH = {
  nodes: [{ id: 'a' }, { id: 'b' }],
  edges: [
    { source: 'a', target: 'b' },
    { source: 'a', target: 'b' }
  ]
};

const VALID_CONCEPTS = [
  { id: 'c1', name: 'Concept 1', prerequisiteConcepts: [] },
  { id: 'c2', name: 'Concept 2', prerequisiteConcepts: ['c1'] },
  { id: 'c3', name: 'Concept 3', prerequisiteConcepts: ['c1', 'c2'] }
];

const CYCLE_CONCEPTS = [
  { id: 'c1', name: 'Concept 1', prerequisiteConcepts: ['c3'] },
  { id: 'c2', name: 'Concept 2', prerequisiteConcepts: ['c1'] },
  { id: 'c3', name: 'Concept 3', prerequisiteConcepts: ['c2'] }
];

// --- Tests ---
function testValidHierarchy() {
  log('check', '=== Test: Valid Hierarchy Fixture ===');

  const sandbox = loadModule('curriculum-structure-guardian.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumStructureGuardian ||
                  sandbox.createCurriculumStructureGuardian;
  if (typeof factory !== 'function' && typeof factory !== 'object') {
    check(false, 'Factory not found');
    return;
  }

  const guardian = typeof factory === 'function' ? factory() : factory;
  const result = guardian.validateStructure(VALID_HIERARCHY);

  check(result.valid === true, 'Valid hierarchy returns valid=true');
  check(result.stats.learningPaths === 2, 'Correct path count');
  check(result.stats.modules === 3, 'Correct module count');
  check(result.stats.lessons === 4, 'Correct lesson count');
  check(result.stats.artifacts === 4, 'Correct artifact count');
}

function testOrphanModule() {
  log('check', '=== Test: Orphan Module Fixture ===');

  const sandbox = loadModule('curriculum-structure-guardian.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumStructureGuardian ||
                  sandbox.createCurriculumStructureGuardian;
  if (typeof factory !== 'function' && typeof factory !== 'object') {
    check(false, 'Factory not found');
    return;
  }

  const guardian = typeof factory === 'function' ? factory() : factory;
  const orphans = guardian.getOrphans(ORPHAN_MODULE_HIERARCHY);

  check(orphans.orphanModules.length === 1, 'One orphan module detected');
  check(orphans.orphanModules[0].id === 'mod-orphan', 'Correct orphan module identified');
  check(orphans.orphanLessons.length === 1, 'One orphan lesson detected');
}

function testBrokenReferences() {
  log('check', '=== Test: Broken Lesson Reference Fixture ===');

  const sandbox = loadModule('curriculum-structure-guardian.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumStructureGuardian ||
                  sandbox.createCurriculumStructureGuardian;
  if (typeof factory !== 'function' && typeof factory !== 'object') {
    check(false, 'Factory not found');
    return;
  }

  const guardian = typeof factory === 'function' ? factory() : factory;
  const broken = guardian.getBrokenReferences(BROKEN_REF_HIERARCHY);

  check(broken.broken.length === 3, 'Three broken references detected');
}

function testDependencyCycle() {
  log('check', '=== Test: Dependency Cycle Fixture ===');

  const sandbox = loadModule('dependency-graph-validator.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.dependencyGraphValidator ||
                  sandbox.createDependencyGraphValidator;
  if (typeof factory !== 'function' && typeof factory !== 'object') {
    check(false, 'Factory not found');
    return;
  }

  const validator = typeof factory === 'function' ? factory() : factory;
  const cycles = validator.detectCycles(CYCLE_GRAPH);

  check(cycles.hasCycles === true, 'Cycle detected');
  check(cycles.cycles.length > 0, 'At least one cycle found');
}

function testSelfDependency() {
  log('check', '=== Test: Self-Dependency Fixture ===');

  const sandbox = loadModule('dependency-graph-validator.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.dependencyGraphValidator ||
                  sandbox.createDependencyGraphValidator;
  if (typeof factory !== 'function' && typeof factory !== 'object') {
    check(false, 'Factory not found');
    return;
  }

  const validator = typeof factory === 'function' ? factory() : factory;
  const selfDeps = validator.detectSelfDependencies(SELF_DEP_GRAPH);

  check(selfDeps.selfDependencies.length === 1, 'Self-dependency detected');
}

function testDuplicateEdges() {
  log('check', '=== Test: Duplicate Edge Fixture ===');

  const sandbox = loadModule('dependency-graph-validator.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.dependencyGraphValidator ||
                  sandbox.createDependencyGraphValidator;
  if (typeof factory !== 'function' && typeof factory !== 'object') {
    check(false, 'Factory not found');
    return;
  }

  const validator = typeof factory === 'function' ? factory() : factory;
  const dupes = validator.detectDuplicateEdges(DUPLICATE_EDGES_GRAPH);

  check(dupes.duplicateEdges.length === 1, 'Duplicate edge detected');
}

function testTypedDependencyAlias() {
  log('check', '=== Test: Typed Dependency Alias Fixture ===');

  const sandbox = loadModule('typed-dependency-engine.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.typedDependencyEngine ||
                  sandbox.createTypedDependencyEngine;
  if (typeof factory !== 'function' && typeof factory !== 'object') {
    check(false, 'Factory not found');
    return;
  }

  const engine = typeof factory === 'function' ? factory() : factory;

  check(engine.normalizeDependencyType('required') === 'required', 'Alias "required" works');
  check(engine.normalizeDependencyType('optional background') === 'optional_background', 'Alias "optional background" works');
  check(engine.normalizeDependencyType('co-requisite') === 'co_requisite', 'Alias "co-requisite" works');
  check(engine.normalizeDependencyType('prerequisite') === 'required', 'Alias "prerequisite" maps to required');
  check(engine.normalizeDependencyType('invalid') === null, 'Invalid type returns null');
  check(engine.validateDependencyType('recommended') === true, 'Valid type passes');
  check(engine.validateDependencyType('invalid') === false, 'Invalid type fails');
}

function testConceptPrerequisiteChain() {
  log('check', '=== Test: Concept Prerequisite Chain Fixture ===');

  const sandbox = loadModule('concept-prerequisite-engine.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.conceptPrerequisiteEngine ||
                  sandbox.createConceptPrerequisiteEngine;
  if (typeof factory !== 'function' && typeof factory !== 'object') {
    check(false, 'Factory not found');
    return;
  }

  const engine = typeof factory === 'function' ? factory() : factory;

  const chain = engine.buildConceptChain('c3', { concepts: VALID_CONCEPTS });
  check(chain.chain.length === 3, 'Chain has 3 concepts');
  check(chain.hasCycle === false, 'No cycle in valid chain');

  const prereqs = engine.getPrerequisitesForConcept('c3', { concepts: VALID_CONCEPTS });
  check(prereqs.length === 2, 'c3 has 2 direct prerequisites');
  check(prereqs.includes('c1'), 'c1 is prerequisite');
  check(prereqs.includes('c2'), 'c2 is prerequisite');

  const cycleResult = engine.validateConceptPrerequisites({ concepts: CYCLE_CONCEPTS });
  check(cycleResult.valid === false, 'Cycle detected in concept prerequisites');
}

function testMalformedInput() {
  log('check', '=== Test: Malformed Input Fixture ===');

  const sandbox = loadModule('curriculum-structure-guardian.js');
  if (!sandbox) return;

  const factory = sandbox.window?.NeuralVerse?.curriculumStructureGuardian ||
                  sandbox.createCurriculumStructureGuardian;
  if (typeof factory !== 'function' && typeof factory !== 'object') {
    check(false, 'Factory not found');
    return;
  }

  const guardian = typeof factory === 'function' ? factory() : factory;

  check(guardian.validateStructure(null).valid === false, 'Null input handled');
  check(guardian.validateStructure(undefined).valid === false, 'Undefined input handled');
  check(guardian.validateStructure('string').valid === false, 'String input handled');
  check(guardian.getOrphans(null).orphanPaths.length === 0, 'Null input handled in getOrphans');
  check(guardian.getBrokenReferences({}).broken.length === 0, 'Empty input handled');
}

function testDeterministicPipeline() {
  log('check', '=== Test: 1000 Repeated Executions ===');

  const structureSandbox = loadModule('curriculum-structure-guardian.js');
  const typedSandbox = loadModule('typed-dependency-engine.js');
  const conceptSandbox = loadModule('concept-prerequisite-engine.js');

  if (!structureSandbox || !typedSandbox || !conceptSandbox) {
    check(false, 'Could not load all modules');
    return;
  }

  const structureFactory = structureSandbox.window?.NeuralVerse?.curriculumStructureGuardian ||
                          structureSandbox.createCurriculumStructureGuardian;
  const typedFactory = typedSandbox.window?.NeuralVerse?.typedDependencyEngine ||
                      typedSandbox.createTypedDependencyEngine;
  const conceptFactory = conceptSandbox.window?.NeuralVerse?.conceptPrerequisiteEngine ||
                        conceptSandbox.createConceptPrerequisiteEngine;

  const guardian = typeof structureFactory === 'function' ? structureFactory() : structureFactory;
  const typedEngine = typeof typedFactory === 'function' ? typedFactory() : typedFactory;
  const conceptEngine = typeof conceptFactory === 'function' ? conceptFactory() : conceptFactory;

  const structureResults = [];
  const typedResults = [];
  const conceptResults = [];

  for (let i = 0; i < 1000; i++) {
    structureResults.push(JSON.stringify(guardian.validateStructure(VALID_HIERARCHY)));
    typedResults.push(JSON.stringify(typedEngine.normalizeDependencyType('required')));
    conceptResults.push(JSON.stringify(conceptEngine.getPrerequisitesForConcept('c3', { concepts: VALID_CONCEPTS })));
  }

  check(structureResults.every(r => r === structureResults[0]), 'Structure validation deterministic');
  check(typedResults.every(r => r === typedResults[0]), 'Typed dependency normalization deterministic');
  check(conceptResults.every(r => r === conceptResults[0]), 'Concept prerequisite resolution deterministic');
}

// --- Main ---
function main() {
  console.log('\n=== NV-1300-D3A — Curriculum Core Verify Script ===\n');

  testValidHierarchy();
  testOrphanModule();
  testBrokenReferences();
  testDependencyCycle();
  testSelfDependency();
  testDuplicateEdges();
  testTypedDependencyAlias();
  testConceptPrerequisiteChain();
  testMalformedInput();
  testDeterministicPipeline();

  console.log(`\n=== Results ===`);
  console.log(`Checked: ${checked}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  const report = {
    validator: 'NV-1300-D3A-Verify',
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
    path.join(reportDir, 'nv-1300-d3a-curriculum-core-verify-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\nVerdict: ${report.verdict}`);
  process.exit(errors.length === 0 ? 0 : 1);
}

main();
