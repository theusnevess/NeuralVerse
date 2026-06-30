/**
 * NV-1500-D3-OPT-02 — Curriculum Dependency Kernel Tests
 *
 * Deterministic test suite for the Curriculum Dependency Kernel.
 * Every test is deterministic and reproducible.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CurriculumNode,
  CurriculumDependency,
  CurriculumDependencyType,
  CurriculumDependencyRegistry,
  CurriculumDependencyInput,
  CurriculumArtifactWithDependencies,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_DEPENDENCY_TYPES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

import {
  composeCurriculumNode,
  composeCurriculumGraph,
} from './CurriculumGraphKernel.ts';

import {
  composeDependency,
  composeDependencyRegistry,
  composeDependencyTrace,
  composeDependencyProvenance,
  composeCurriculumDependencies,
  composeCurriculumArtifactWithDependencies,
  isSupportedDependencyType,
  isSupportedDependencyGovernanceStatus,
  getCanonicalDependencyTypes,
  detectDependencyCycle,
} from './DependencyKernel.ts';

import {
  validateDependency,
  validateDependencyRegistry,
  validateCurriculumArtifactWithDependencies,
  validateDependencyInput,
  DEPENDENCY_VALIDATION_CODES,
} from './DependencyValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_NODE_1: CurriculumNode = {
  nodeId: 'node-001',
  nodeType: 'lesson',
  referenceId: 'ref-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Introduction to neural networks.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_2: CurriculumNode = {
  nodeId: 'node-002',
  nodeType: 'lesson',
  referenceId: 'ref-002',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Deep learning fundamentals.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_3: CurriculumNode = {
  nodeId: 'node-003',
  nodeType: 'lesson',
  referenceId: 'ref-003',
  source: 'governance-committee',
  governanceStatus: 'accepted',
  rationale: 'Advanced architectures.',
  providedBy: 'curriculum-board',
};

const VALID_DEPENDENCY_1: CurriculumDependency = {
  dependencyId: 'dep-001',
  sourceNodeId: 'node-001',
  targetNodeId: 'node-002',
  dependencyType: 'required',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Deep learning requires neural network knowledge.',
  providedBy: 'curriculum-board',
};

const VALID_DEPENDENCY_2: CurriculumDependency = {
  dependencyId: 'dep-002',
  sourceNodeId: 'node-002',
  targetNodeId: 'node-003',
  dependencyType: 'recommended',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Advanced architectures benefit from deep learning.',
  providedBy: 'curriculum-board',
};

const VALID_DEPENDENCY_3: CurriculumDependency = {
  dependencyId: 'dep-003',
  sourceNodeId: 'node-001',
  targetNodeId: 'node-003',
  dependencyType: 'co_requisite',
  source: 'governance-committee',
  governanceStatus: 'accepted',
  rationale: 'Can be studied in parallel.',
  providedBy: 'curriculum-board',
};

const VALID_GRAPH: CurriculumGraph = {
  graphId: 'graph-001',
  graphLabel: 'Test Curriculum',
  nodes: [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3],
  edges: [],
  deterministic: true,
  generatedFrom: 'deterministic_curriculum_graph_kernel',
  randomUsed: false,
  timeDependency: false,
};

const VALID_INPUT: CurriculumDependencyInput = {
  registryId: 'dep-reg-001',
  graphId: 'graph-001',
  dependencies: [VALID_DEPENDENCY_1, VALID_DEPENDENCY_2],
};

// ---------------------------------------------------------------------------
// Valid Dependency Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Valid Dependency', () => {
  it('should compose a valid dependency', () => {
    const dep = composeDependency(VALID_DEPENDENCY_1);
    assert.deepStrictEqual(dep, VALID_DEPENDENCY_1);
  });

  it('should validate a valid dependency with no errors', () => {
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId, VALID_NODE_3.nodeId];
    const errors = validateDependency(VALID_DEPENDENCY_1, nodeIds);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Required Dependency Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Required Dependency', () => {
  it('should compose a required dependency', () => {
    const dep = composeDependency({
      dependencyId: 'dep-req',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-002',
      dependencyType: 'required',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Required dependency.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(dep.dependencyType, 'required');
    const nodeIds = ['node-001', 'node-002'];
    const errors = validateDependency(dep, nodeIds);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Optional Dependency Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Optional Background Dependency', () => {
  it('should compose an optional_background dependency', () => {
    const dep = composeDependency({
      dependencyId: 'dep-opt',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-003',
      dependencyType: 'optional_background',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Optional background.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(dep.dependencyType, 'optional_background');
    const nodeIds = ['node-001', 'node-003'];
    const errors = validateDependency(dep, nodeIds);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Co-requisite Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Co-requisite', () => {
  it('should compose a co_requisite dependency', () => {
    const dep = composeDependency(VALID_DEPENDENCY_3);
    assert.strictEqual(dep.dependencyType, 'co_requisite');
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId, VALID_NODE_3.nodeId];
    const errors = validateDependency(dep, nodeIds);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Dependency Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Duplicate Dependency', () => {
  it('should detect duplicate dependency IDs', () => {
    const registry: CurriculumDependencyRegistry = {
      registryId: 'dep-reg-dup',
      graphId: 'graph-001',
      dependencies: [
        VALID_DEPENDENCY_1,
        { ...VALID_DEPENDENCY_1, dependencyId: 'dep-001' },
      ],
      dependencyCount: 2,
      deterministic: true,
      generatedFrom: 'deterministic_dependency_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId, VALID_NODE_3.nodeId];
    const result = validateDependencyRegistry(registry, nodeIds);
    assert.strictEqual(result.valid, false);
    const dupError = result.errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_DUPLICATE_ID,
    );
    assert.ok(dupError, 'Should have DEPENDENCY_DUPLICATE_ID error');
  });

  it('should detect duplicate relation (same source+target+type)', () => {
    const registry: CurriculumDependencyRegistry = {
      registryId: 'dep-reg-dup-rel',
      graphId: 'graph-001',
      dependencies: [
        VALID_DEPENDENCY_1,
        {
          ...VALID_DEPENDENCY_1,
          dependencyId: 'dep-dup-rel',
        },
      ],
      dependencyCount: 2,
      deterministic: true,
      generatedFrom: 'deterministic_dependency_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId, VALID_NODE_3.nodeId];
    const result = validateDependencyRegistry(registry, nodeIds);
    assert.strictEqual(result.valid, false);
    const dupRelError = result.errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_DUPLICATE_RELATION,
    );
    assert.ok(dupRelError, 'Should have DEPENDENCY_DUPLICATE_RELATION error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Dependency Type Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Unsupported Dependency Type', () => {
  it('should detect unsupported dependency type', () => {
    const invalidDep: CurriculumDependency = {
      dependencyId: 'dep-bad',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-002',
      dependencyType: 'invalid_type' as CurriculumDependencyType,
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad dependency.',
      providedBy: 'curriculum-board',
    };
    const nodeIds = ['node-001', 'node-002'];
    const errors = validateDependency(invalidDep, nodeIds);
    const typeError = errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_UNKNOWN_TYPE,
    );
    assert.ok(typeError, 'Should have DEPENDENCY_UNKNOWN_TYPE error');
  });
});

// ---------------------------------------------------------------------------
// Self Reference Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Self Reference', () => {
  it('should detect self-referencing dependency', () => {
    const selfRefDep: CurriculumDependency = {
      dependencyId: 'dep-self',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-001',
      dependencyType: 'required',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Self-referencing.',
      providedBy: 'curriculum-board',
    };
    const nodeIds = ['node-001'];
    const errors = validateDependency(selfRefDep, nodeIds);
    const selfRefError = errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_SELF_REFERENCE,
    );
    assert.ok(selfRefError, 'Should have DEPENDENCY_SELF_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Source Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Invalid Source Node', () => {
  it('should detect dependency referencing non-existent source node', () => {
    const badDep: CurriculumDependency = {
      dependencyId: 'dep-bad-src',
      sourceNodeId: 'node-999',
      targetNodeId: 'node-001',
      dependencyType: 'required',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad source.',
      providedBy: 'curriculum-board',
    };
    const nodeIds = ['node-001'];
    const errors = validateDependency(badDep, nodeIds);
    const srcError = errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_INVALID_SOURCE_NODE,
    );
    assert.ok(srcError, 'Should have DEPENDENCY_INVALID_SOURCE_NODE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Target Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Invalid Target Node', () => {
  it('should detect dependency referencing non-existent target node', () => {
    const badDep: CurriculumDependency = {
      dependencyId: 'dep-bad-tgt',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-888',
      dependencyType: 'required',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad target.',
      providedBy: 'curriculum-board',
    };
    const nodeIds = ['node-001'];
    const errors = validateDependency(badDep, nodeIds);
    const tgtError = errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_INVALID_TARGET_NODE,
    );
    assert.ok(tgtError, 'Should have DEPENDENCY_INVALID_TARGET_NODE error');
  });
});

// ---------------------------------------------------------------------------
// Orphan Dependency Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Orphan Dependency', () => {
  it('should detect orphan dependency (both nodes missing)', () => {
    const orphanDep: CurriculumDependency = {
      dependencyId: 'dep-orphan',
      sourceNodeId: 'node-999',
      targetNodeId: 'node-888',
      dependencyType: 'required',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Orphan.',
      providedBy: 'curriculum-board',
    };
    const nodeIds = ['node-001'];
    const errors = validateDependency(orphanDep, nodeIds);
    assert.strictEqual(errors.length, 2);
    const srcError = errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_INVALID_SOURCE_NODE,
    );
    const tgtError = errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_INVALID_TARGET_NODE,
    );
    assert.ok(srcError, 'Should have DEPENDENCY_INVALID_SOURCE_NODE error');
    assert.ok(tgtError, 'Should have DEPENDENCY_INVALID_TARGET_NODE error');
  });
});

// ---------------------------------------------------------------------------
// Cycle Detection Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Cycle Detection', () => {
  it('should detect a simple cycle (A -> B -> A)', () => {
    const deps: CurriculumDependency[] = [
      {
        dependencyId: 'dep-cycle-1',
        sourceNodeId: 'A',
        targetNodeId: 'B',
        dependencyType: 'required',
        source: 'governance-committee',
        governanceStatus: 'canonical',
        rationale: 'Cycle part 1.',
        providedBy: 'curriculum-board',
      },
      {
        dependencyId: 'dep-cycle-2',
        sourceNodeId: 'B',
        targetNodeId: 'A',
        dependencyType: 'required',
        source: 'governance-committee',
        governanceStatus: 'canonical',
        rationale: 'Cycle part 2.',
        providedBy: 'curriculum-board',
      },
    ];
    assert.strictEqual(detectDependencyCycle(deps), true);
  });

  it('should detect a longer cycle (A -> B -> C -> A)', () => {
    const deps: CurriculumDependency[] = [
      {
        dependencyId: 'dep-cycle-a',
        sourceNodeId: 'A',
        targetNodeId: 'B',
        dependencyType: 'required',
        source: 'governance-committee',
        governanceStatus: 'canonical',
        rationale: 'Cycle part.',
        providedBy: 'curriculum-board',
      },
      {
        dependencyId: 'dep-cycle-b',
        sourceNodeId: 'B',
        targetNodeId: 'C',
        dependencyType: 'required',
        source: 'governance-committee',
        governanceStatus: 'canonical',
        rationale: 'Cycle part.',
        providedBy: 'curriculum-board',
      },
      {
        dependencyId: 'dep-cycle-c',
        sourceNodeId: 'C',
        targetNodeId: 'A',
        dependencyType: 'required',
        source: 'governance-committee',
        governanceStatus: 'canonical',
        rationale: 'Cycle part.',
        providedBy: 'curriculum-board',
      },
    ];
    assert.strictEqual(detectDependencyCycle(deps), true);
  });

  it('should return false for no cycle', () => {
    const deps: CurriculumDependency[] = [
      VALID_DEPENDENCY_1,
      VALID_DEPENDENCY_2,
    ];
    assert.strictEqual(detectDependencyCycle(deps), false);
  });

  it('should return false for empty dependencies', () => {
    assert.strictEqual(detectDependencyCycle([]), false);
  });

  it('should report cycle in registry validation', () => {
    const registry: CurriculumDependencyRegistry = {
      registryId: 'dep-reg-cycle',
      graphId: 'graph-001',
      dependencies: [
        {
          dependencyId: 'dep-cycle-1',
          sourceNodeId: 'node-001',
          targetNodeId: 'node-002',
          dependencyType: 'required',
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Cycle part 1.',
          providedBy: 'curriculum-board',
        },
        {
          dependencyId: 'dep-cycle-2',
          sourceNodeId: 'node-002',
          targetNodeId: 'node-001',
          dependencyType: 'required',
          source: 'governance-committee',
          governanceStatus: 'canonical',
          rationale: 'Cycle part 2.',
          providedBy: 'curriculum-board',
        },
      ],
      dependencyCount: 2,
      deterministic: true,
      generatedFrom: 'deterministic_dependency_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId, VALID_NODE_3.nodeId];
    const result = validateDependencyRegistry(registry, nodeIds);
    assert.strictEqual(result.valid, false);
    const cycleError = result.errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_CYCLE_DETECTED,
    );
    assert.ok(cycleError, 'Should have DEPENDENCY_CYCLE_DETECTED error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Missing Provenance', () => {
  it('should detect missing source on dependency', () => {
    const dep: CurriculumDependency = {
      dependencyId: 'dep-no-src',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-002',
      dependencyType: 'required',
      source: '',
      governanceStatus: 'canonical',
      rationale: 'Missing source.',
      providedBy: 'curriculum-board',
    };
    const nodeIds = ['node-001', 'node-002'];
    const errors = validateDependency(dep, nodeIds);
    const srcError = errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_SOURCE,
    );
    assert.ok(srcError, 'Should have DEPENDENCY_MISSING_SOURCE error');
  });

  it('should detect missing rationale on dependency', () => {
    const dep: CurriculumDependency = {
      dependencyId: 'dep-no-rat',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-002',
      dependencyType: 'required',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: '',
      providedBy: 'curriculum-board',
    };
    const nodeIds = ['node-001', 'node-002'];
    const errors = validateDependency(dep, nodeIds);
    const ratError = errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_RATIONALE,
    );
    assert.ok(ratError, 'Should have DEPENDENCY_MISSING_RATIONALE error');
  });

  it('should detect missing providedBy on dependency', () => {
    const dep: CurriculumDependency = {
      dependencyId: 'dep-no-pb',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-002',
      dependencyType: 'required',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Missing providedBy.',
      providedBy: '',
    };
    const nodeIds = ['node-001', 'node-002'];
    const errors = validateDependency(dep, nodeIds);
    const pbError = errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_PROVIDED_BY,
    );
    assert.ok(pbError, 'Should have DEPENDENCY_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Deterministic Ordering', () => {
  it('should sort dependencies by sourceNodeId first', () => {
    const input: CurriculumDependencyInput = {
      registryId: 'dep-reg-sort',
      graphId: 'graph-001',
      dependencies: [
        { ...VALID_DEPENDENCY_2, sourceNodeId: 'node-003', targetNodeId: 'node-001' },
        VALID_DEPENDENCY_1,
      ],
    };
    const registry = composeCurriculumDependencies(input);
    assert.strictEqual(registry.dependencies[0].sourceNodeId, 'node-001');
    assert.strictEqual(registry.dependencies[1].sourceNodeId, 'node-003');
  });

  it('should sort dependencies by targetNodeId when sourceNodeIds are equal', () => {
    const dep1: CurriculumDependency = {
      dependencyId: 'dep-sort-1',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-003',
      dependencyType: 'required',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Sort test.',
      providedBy: 'curriculum-board',
    };
    const dep2: CurriculumDependency = {
      dependencyId: 'dep-sort-2',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-002',
      dependencyType: 'required',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Sort test.',
      providedBy: 'curriculum-board',
    };
    const input: CurriculumDependencyInput = {
      registryId: 'dep-reg-sort-target',
      graphId: 'graph-001',
      dependencies: [dep1, dep2],
    };
    const registry = composeCurriculumDependencies(input);
    assert.strictEqual(registry.dependencies[0].targetNodeId, 'node-002');
    assert.strictEqual(registry.dependencies[1].targetNodeId, 'node-003');
  });

  it('should sort dependencies by dependencyId when source and target are equal', () => {
    const dep1: CurriculumDependency = {
      dependencyId: 'dep-zzz',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-002',
      dependencyType: 'required',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Sort test.',
      providedBy: 'curriculum-board',
    };
    const dep2: CurriculumDependency = {
      dependencyId: 'dep-aaa',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-002',
      dependencyType: 'recommended',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Sort test.',
      providedBy: 'curriculum-board',
    };
    const input: CurriculumDependencyInput = {
      registryId: 'dep-reg-sort-id',
      graphId: 'graph-001',
      dependencies: [dep1, dep2],
    };
    const registry = composeCurriculumDependencies(input);
    assert.strictEqual(registry.dependencies[0].dependencyId, 'dep-aaa');
    assert.strictEqual(registry.dependencies[1].dependencyId, 'dep-zzz');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Immutable Input', () => {
  it('should not mutate input dependencies array', () => {
    const deps = [
      { ...VALID_DEPENDENCY_2, sourceNodeId: 'node-003', targetNodeId: 'node-001' },
      VALID_DEPENDENCY_1,
    ];
    const original = deps.map((d) => ({ ...d }));
    const input: CurriculumDependencyInput = {
      registryId: 'dep-reg-immutable',
      graphId: 'graph-001',
      dependencies: deps,
    };
    composeCurriculumDependencies(input);
    assert.deepStrictEqual(deps, original);
  });

  it('should not mutate input dependency objects', () => {
    const dep = { ...VALID_DEPENDENCY_1 };
    const original = { ...dep };
    composeDependencyRegistry({
      registryId: 'dep-reg-immutable-obj',
      graphId: 'graph-001',
      dependencies: [dep],
    });
    assert.deepStrictEqual(dep, original);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Identical Output', () => {
  it('should produce identical output for identical input', () => {
    const reg1 = composeCurriculumDependencies(VALID_INPUT);
    const reg2 = composeCurriculumDependencies(VALID_INPUT);
    assert.deepStrictEqual(reg1, reg2);
  });

  it('should produce identical output across 100 iterations', () => {
    const reg1 = composeCurriculumDependencies(VALID_INPUT);
    const json1 = JSON.stringify(reg1);
    for (let i = 0; i < 100; i++) {
      const reg = composeCurriculumDependencies(VALID_INPUT);
      assert.strictEqual(JSON.stringify(reg), json1);
    }
  });

  it('should produce identical trace for identical input', () => {
    const trace1 = composeDependencyTrace('dep-reg-001', VALID_INPUT.dependencies);
    const trace2 = composeDependencyTrace('dep-reg-001', VALID_INPUT.dependencies);
    assert.deepStrictEqual(trace1, trace2);
  });
});

// ---------------------------------------------------------------------------
// No Curriculum Mutation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — No Curriculum Mutation', () => {
  it('should not create new dependency types beyond canonical', () => {
    assert.deepStrictEqual(getCanonicalDependencyTypes(), CANONICAL_DEPENDENCY_TYPES);
  });

  it('should not add dependencies not present in input', () => {
    const input: CurriculumDependencyInput = {
      registryId: 'dep-reg-no-add',
      graphId: 'graph-001',
      dependencies: [VALID_DEPENDENCY_1],
    };
    const registry = composeCurriculumDependencies(input);
    assert.strictEqual(registry.dependencies.length, 1);
    assert.strictEqual(registry.dependencies[0].dependencyId, 'dep-001');
  });
});

// ---------------------------------------------------------------------------
// No Inferred Dependency Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — No Inferred Dependency', () => {
  it('should not infer dependencies between nodes', () => {
    const input: CurriculumDependencyInput = {
      registryId: 'dep-reg-no-infer',
      graphId: 'graph-001',
      dependencies: [],
    };
    const registry = composeCurriculumDependencies(input);
    assert.strictEqual(registry.dependencies.length, 0);
    assert.strictEqual(registry.dependencyCount, 0);
  });
});

// ---------------------------------------------------------------------------
// Helper Functions Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Helper Functions', () => {
  it('isSupportedDependencyType should return true for valid types', () => {
    assert.strictEqual(isSupportedDependencyType('required'), true);
    assert.strictEqual(isSupportedDependencyType('recommended'), true);
    assert.strictEqual(isSupportedDependencyType('optional_background'), true);
    assert.strictEqual(isSupportedDependencyType('co_requisite'), true);
    assert.strictEqual(isSupportedDependencyType('parallel'), true);
    assert.strictEqual(isSupportedDependencyType('review'), true);
    assert.strictEqual(isSupportedDependencyType('reinforcement'), true);
    assert.strictEqual(isSupportedDependencyType('forward_reference'), true);
    assert.strictEqual(isSupportedDependencyType('historical_context'), true);
    assert.strictEqual(isSupportedDependencyType('enrichment'), true);
  });

  it('isSupportedDependencyType should return false for invalid types', () => {
    assert.strictEqual(isSupportedDependencyType('invalid'), false);
    assert.strictEqual(isSupportedDependencyType(''), false);
    assert.strictEqual(isSupportedDependencyType('blocks'), false);
  });

  it('isSupportedDependencyGovernanceStatus should return true for valid statuses', () => {
    assert.strictEqual(isSupportedDependencyGovernanceStatus('canonical'), true);
    assert.strictEqual(isSupportedDependencyGovernanceStatus('accepted'), true);
    assert.strictEqual(isSupportedDependencyGovernanceStatus('provisional'), true);
    assert.strictEqual(isSupportedDependencyGovernanceStatus('deprecated'), true);
    assert.strictEqual(isSupportedDependencyGovernanceStatus('rejected'), true);
  });

  it('isSupportedDependencyGovernanceStatus should return false for invalid statuses', () => {
    assert.strictEqual(isSupportedDependencyGovernanceStatus('invalid'), false);
    assert.strictEqual(isSupportedDependencyGovernanceStatus(''), false);
  });

  it('getCanonicalDependencyTypes should return all canonical types', () => {
    const types = getCanonicalDependencyTypes();
    assert.strictEqual(types.length, 10);
    assert.deepStrictEqual(types, CANONICAL_DEPENDENCY_TYPES);
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Registry Validation', () => {
  it('should validate a valid registry', () => {
    const registry = composeDependencyRegistry({
      registryId: 'dep-reg-valid',
      graphId: 'graph-001',
      dependencies: [VALID_DEPENDENCY_1, VALID_DEPENDENCY_2],
    });
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId, VALID_NODE_3.nodeId];
    const result = validateDependencyRegistry(registry, nodeIds);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
    assert.strictEqual(result.checkedAt, 'curriculum_dependency_orchestration');
  });

  it('should detect empty registry', () => {
    const registry: CurriculumDependencyRegistry = {
      registryId: 'dep-reg-empty',
      graphId: 'graph-001',
      dependencies: [],
      dependencyCount: 0,
      deterministic: true,
      generatedFrom: 'deterministic_dependency_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId, VALID_NODE_3.nodeId];
    const result = validateDependencyRegistry(registry, nodeIds);
    assert.strictEqual(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have DEPENDENCY_EMPTY_REGISTRY error');
  });

  it('should detect missing registry ID', () => {
    const registry: CurriculumDependencyRegistry = {
      registryId: '',
      graphId: 'graph-001',
      dependencies: [VALID_DEPENDENCY_1],
      dependencyCount: 1,
      deterministic: true,
      generatedFrom: 'deterministic_dependency_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId, VALID_NODE_3.nodeId];
    const result = validateDependencyRegistry(registry, nodeIds);
    const idError = result.errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_REGISTRY_ID,
    );
    assert.ok(idError, 'Should have DEPENDENCY_MISSING_REGISTRY_ID error');
  });

  it('should detect missing graph ID', () => {
    const registry: CurriculumDependencyRegistry = {
      registryId: 'dep-reg-no-graph',
      graphId: '',
      dependencies: [VALID_DEPENDENCY_1],
      dependencyCount: 1,
      deterministic: true,
      generatedFrom: 'deterministic_dependency_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId, VALID_NODE_3.nodeId];
    const result = validateDependencyRegistry(registry, nodeIds);
    const graphError = result.errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_GRAPH_ID,
    );
    assert.ok(graphError, 'Should have DEPENDENCY_MISSING_GRAPH_ID error');
  });
});

// ---------------------------------------------------------------------------
// Artifact Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Artifact Validation', () => {
  it('should compose and validate a valid artifact', () => {
    const registry = composeDependencyRegistry({
      registryId: 'dep-reg-art',
      graphId: 'graph-001',
      dependencies: [VALID_DEPENDENCY_1],
    });
    const trace = composeDependencyTrace('dep-reg-art', registry.dependencies);
    const validation: CurriculumArtifactWithDependencies['validation'] = {
      valid: true,
      errors: [],
      checkedAt: 'curriculum_dependency_orchestration',
    };
    const artifact = composeCurriculumArtifactWithDependencies({
      artifactId: 'art-dep-001',
      graph: VALID_GRAPH,
      dependencyRegistry: registry,
      dependencyTrace: trace,
      validation,
    });
    const result = validateCurriculumArtifactWithDependencies(artifact);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Trace Validation', () => {
  it('should compose a trace with correct counts', () => {
    const trace = composeDependencyTrace('dep-reg-trace', [
      VALID_DEPENDENCY_1,
      VALID_DEPENDENCY_2,
    ]);
    assert.strictEqual(trace.registryId, 'dep-reg-trace');
    assert.strictEqual(trace.dependencyCount, 2);
    assert.strictEqual(trace.decisionsCount, 2);
    assert.strictEqual(trace.validatedCount, 2);
    assert.strictEqual(trace.invalidCount, 0);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
  });

  it('should identify invalid dependencies in trace', () => {
    const invalidDep: CurriculumDependency = {
      dependencyId: '',
      sourceNodeId: '',
      targetNodeId: '',
      dependencyType: 'invalid' as CurriculumDependencyType,
      source: '',
      governanceStatus: 'canonical',
      rationale: '',
      providedBy: '',
    };
    const trace = composeDependencyTrace('dep-reg-trace-bad', [invalidDep]);
    assert.strictEqual(trace.invalidCount, 1);
    assert.strictEqual(trace.validatedCount, 0);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Provenance', () => {
  it('should compose dependency provenance', () => {
    const prov = composeDependencyProvenance(VALID_DEPENDENCY_1);
    assert.strictEqual(prov.dependencyId, VALID_DEPENDENCY_1.dependencyId);
    assert.strictEqual(prov.source, VALID_DEPENDENCY_1.source);
    assert.strictEqual(prov.governanceStatus, VALID_DEPENDENCY_1.governanceStatus);
    assert.strictEqual(prov.rationale, VALID_DEPENDENCY_1.rationale);
    assert.strictEqual(prov.providedBy, VALID_DEPENDENCY_1.providedBy);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Metadata Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Deterministic Metadata', () => {
  it('registry should have deterministic metadata', () => {
    const registry = composeDependencyRegistry({
      registryId: 'dep-reg-meta',
      graphId: 'graph-001',
      dependencies: [VALID_DEPENDENCY_1],
    });
    assert.strictEqual(registry.deterministic, true);
    assert.strictEqual(registry.generatedFrom, 'deterministic_dependency_kernel');
    assert.strictEqual(registry.randomUsed, false);
    assert.strictEqual(registry.timeDependency, false);
  });

  it('trace should have deterministic metadata', () => {
    const trace = composeDependencyTrace('dep-reg-trace-meta', [VALID_DEPENDENCY_1]);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.generatedFrom, 'deterministic_dependency_kernel');
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Input Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Input Validation', () => {
  it('should validate valid input with no errors', () => {
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId, VALID_NODE_3.nodeId];
    const errors = validateDependencyInput(VALID_INPUT, nodeIds);
    assert.deepStrictEqual(errors, []);
  });

  it('should detect missing registry ID in input', () => {
    const input: CurriculumDependencyInput = {
      registryId: '',
      graphId: 'graph-001',
      dependencies: [VALID_DEPENDENCY_1],
    };
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId, VALID_NODE_3.nodeId];
    const errors = validateDependencyInput(input, nodeIds);
    const idError = errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_REGISTRY_ID,
    );
    assert.ok(idError, 'Should have DEPENDENCY_MISSING_REGISTRY_ID error');
  });

  it('should detect missing graph ID in input', () => {
    const input: CurriculumDependencyInput = {
      registryId: 'dep-reg-001',
      graphId: '',
      dependencies: [VALID_DEPENDENCY_1],
    };
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId, VALID_NODE_3.nodeId];
    const errors = validateDependencyInput(input, nodeIds);
    const graphError = errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_GRAPH_ID,
    );
    assert.ok(graphError, 'Should have DEPENDENCY_MISSING_GRAPH_ID error');
  });

  it('should detect empty dependencies in input', () => {
    const input: CurriculumDependencyInput = {
      registryId: 'dep-reg-001',
      graphId: 'graph-001',
      dependencies: [],
    };
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId, VALID_NODE_3.nodeId];
    const errors = validateDependencyInput(input, nodeIds);
    const emptyError = errors.find(
      (e) => e.code === DEPENDENCY_VALIDATION_CODES.DEPENDENCY_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have DEPENDENCY_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Canonical Dependency List Completeness Tests
// ---------------------------------------------------------------------------

describe('Curriculum Dependency Kernel — Canonical Dependency List Completeness', () => {
  it('should have exactly 10 canonical dependency types', () => {
    assert.strictEqual(CANONICAL_DEPENDENCY_TYPES.length, 10);
  });

  it('should contain all required dependency types', () => {
    const required = [
      'required',
      'recommended',
      'optional_background',
      'co_requisite',
      'parallel',
      'review',
      'reinforcement',
      'forward_reference',
      'historical_context',
      'enrichment',
    ];
    for (const type of required) {
      assert.ok(
        CANONICAL_DEPENDENCY_TYPES.includes(type as CurriculumDependencyType),
        `Missing dependency type: ${type}`,
      );
    }
  });
});
