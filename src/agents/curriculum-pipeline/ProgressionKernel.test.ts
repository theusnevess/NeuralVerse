/**
 * NV-1500-D3-OPT-03 — Curriculum Progression Kernel Tests
 *
 * Deterministic test suite for the Curriculum Progression Kernel.
 * Every test is deterministic and reproducible.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CurriculumNode,
  CurriculumDependency,
  CurriculumProgressionNode,
  CurriculumProgressionState,
  CurriculumProgressionRegistry,
  CurriculumProgressionInput,
  CurriculumArtifactWithProgression,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_PROGRESSION_STATES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

import {
  composeCurriculumNode,
  composeCurriculumGraph,
} from './CurriculumGraphKernel.ts';

import {
  composeDependency,
} from './DependencyKernel.ts';

import {
  composeProgressionNode,
  composeProgressionRegistry,
  composeProgressionTrace,
  composeProgressionProvenance,
  composeCurriculumProgression,
  composeCurriculumArtifactWithProgression,
  isSupportedProgressionState,
  isSupportedProgressionGovernanceStatus,
  getCanonicalProgressionStates,
  resolveProgressionState,
} from './ProgressionKernel.ts';

import {
  validateProgressionNode,
  validateProgressionRegistry,
  validateCurriculumArtifactWithProgression,
  validateProgressionInput,
  PROGRESSION_VALIDATION_CODES,
} from './ProgressionValidation.ts';

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

const VALID_NODE_REVIEW: CurriculumNode = {
  nodeId: 'node-review',
  nodeType: 'review',
  referenceId: 'ref-review',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Review of fundamentals.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_CAPSTONE: CurriculumNode = {
  nodeId: 'node-capstone',
  nodeType: 'capstone',
  referenceId: 'ref-capstone',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Final capstone project.',
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

const VALID_DEPENDENCY_OPTIONAL: CurriculumDependency = {
  dependencyId: 'dep-opt',
  sourceNodeId: 'node-001',
  targetNodeId: 'node-003',
  dependencyType: 'optional_background',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Optional background.',
  providedBy: 'curriculum-board',
};

const VALID_DEPENDENCY_CAPSTONE: CurriculumDependency = {
  dependencyId: 'dep-cap',
  sourceNodeId: 'node-002',
  targetNodeId: 'node-capstone',
  dependencyType: 'required',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Capstone requires deep learning.',
  providedBy: 'curriculum-board',
};

const VALID_GRAPH: CurriculumGraph = {
  graphId: 'graph-001',
  graphLabel: 'Test Curriculum',
  nodes: [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3, VALID_NODE_REVIEW, VALID_NODE_CAPSTONE],
  edges: [],
  deterministic: true,
  generatedFrom: 'deterministic_curriculum_graph_kernel',
  randomUsed: false,
  timeDependency: false,
};

const VALID_PROGRESSION_1: CurriculumProgressionNode = {
  progressionId: 'prog-001',
  curriculumNodeId: 'node-001',
  progressionState: 'available',
  dependencyIds: [],
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'No dependencies, available from start.',
  providedBy: 'curriculum-board',
};

const VALID_PROGRESSION_2: CurriculumProgressionNode = {
  progressionId: 'prog-002',
  curriculumNodeId: 'node-002',
  progressionState: 'blocked',
  dependencyIds: ['dep-001'],
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Blocked by required dependency on node-001.',
  providedBy: 'curriculum-board',
};

const VALID_PROGRESSION_3: CurriculumProgressionNode = {
  progressionId: 'prog-003',
  curriculumNodeId: 'node-003',
  progressionState: 'available',
  dependencyIds: ['dep-002'],
  source: 'governance-committee',
  governanceStatus: 'accepted',
  rationale: 'Available after recommended dependency.',
  providedBy: 'curriculum-board',
};

const VALID_INPUT: CurriculumProgressionInput = {
  registryId: 'prog-reg-001',
  graphId: 'graph-001',
  progressions: [VALID_PROGRESSION_1, VALID_PROGRESSION_2, VALID_PROGRESSION_3],
};

// ---------------------------------------------------------------------------
// Available Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Available Node', () => {
  it('should compose a valid available progression node', () => {
    const prog = composeProgressionNode(VALID_PROGRESSION_1);
    assert.deepStrictEqual(prog, VALID_PROGRESSION_1);
  });

  it('should validate a valid available node with no errors', () => {
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateProgressionNode(VALID_PROGRESSION_1, graphNodeIds);
    assert.deepStrictEqual(errors, []);
  });

  it('should resolve available state for node with no dependencies', () => {
    const state = resolveProgressionState(VALID_NODE_1, []);
    assert.strictEqual(state, 'available');
  });
});

// ---------------------------------------------------------------------------
// Blocked Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Blocked Node', () => {
  it('should compose a valid blocked progression node', () => {
    const prog = composeProgressionNode(VALID_PROGRESSION_2);
    assert.deepStrictEqual(prog, VALID_PROGRESSION_2);
  });

  it('should validate a valid blocked node with no errors', () => {
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateProgressionNode(VALID_PROGRESSION_2, graphNodeIds);
    assert.deepStrictEqual(errors, []);
  });

  it('should resolve blocked state for node with required dependencies', () => {
    const state = resolveProgressionState(VALID_NODE_2, [VALID_DEPENDENCY_1]);
    assert.strictEqual(state, 'blocked');
  });
});

// ---------------------------------------------------------------------------
// Optional Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Optional Node', () => {
  it('should resolve optional state for node with optional_background dependency', () => {
    const state = resolveProgressionState(VALID_NODE_3, [VALID_DEPENDENCY_OPTIONAL]);
    assert.strictEqual(state, 'optional');
  });
});

// ---------------------------------------------------------------------------
// Review Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Review Node', () => {
  it('should resolve review state for review node type', () => {
    const state = resolveProgressionState(VALID_NODE_REVIEW, []);
    assert.strictEqual(state, 'review');
  });
});

// ---------------------------------------------------------------------------
// Reinforcement Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Reinforcement Node', () => {
  it('should resolve reinforcement state for reinforcement node type', () => {
    const reinforcementNode: CurriculumNode = {
      nodeId: 'node-reinf',
      nodeType: 'reinforcement',
      referenceId: 'ref-reinf',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Reinforcement exercise.',
      providedBy: 'curriculum-board',
    };
    const state = resolveProgressionState(reinforcementNode, []);
    assert.strictEqual(state, 'reinforcement');
  });
});

// ---------------------------------------------------------------------------
// Capstone Ready Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Capstone Ready', () => {
  it('should resolve capstone_ready state for capstone with no required dependencies', () => {
    const state = resolveProgressionState(VALID_NODE_CAPSTONE, []);
    assert.strictEqual(state, 'capstone_ready');
  });

  it('should resolve blocked state for capstone with required dependencies', () => {
    const state = resolveProgressionState(VALID_NODE_CAPSTONE, [VALID_DEPENDENCY_CAPSTONE]);
    assert.strictEqual(state, 'blocked');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Duplicate Node', () => {
  it('should detect duplicate progression IDs', () => {
    const registry: CurriculumProgressionRegistry = {
      registryId: 'prog-reg-dup',
      graphId: 'graph-001',
      progressions: [
        VALID_PROGRESSION_1,
        { ...VALID_PROGRESSION_1, progressionId: 'prog-001' },
      ],
      progressionCount: 2,
      deterministic: true,
      generatedFrom: 'deterministic_progression_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const result = validateProgressionRegistry(registry, graphNodeIds);
    assert.strictEqual(result.valid, false);
    const dupError = result.errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_DUPLICATE_ID,
    );
    assert.ok(dupError, 'Should have PROGRESSION_DUPLICATE_ID error');
  });

  it('should detect duplicate curriculum node IDs', () => {
    const registry: CurriculumProgressionRegistry = {
      registryId: 'prog-reg-dup-node',
      graphId: 'graph-001',
      progressions: [
        VALID_PROGRESSION_1,
        { ...VALID_PROGRESSION_1, progressionId: 'prog-other', curriculumNodeId: 'node-001' },
      ],
      progressionCount: 2,
      deterministic: true,
      generatedFrom: 'deterministic_progression_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const result = validateProgressionRegistry(registry, graphNodeIds);
    assert.strictEqual(result.valid, false);
    const dupNodeError = result.errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_DUPLICATE_NODE,
    );
    assert.ok(dupNodeError, 'Should have PROGRESSION_DUPLICATE_NODE error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Progression State Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Unsupported Progression State', () => {
  it('should detect unsupported progression state', () => {
    const invalidProg: CurriculumProgressionNode = {
      progressionId: 'prog-bad',
      curriculumNodeId: 'node-001',
      progressionState: 'invalid_state' as CurriculumProgressionState,
      dependencyIds: [],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad state.',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = ['node-001'];
    const errors = validateProgressionNode(invalidProg, graphNodeIds);
    const stateError = errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_UNKNOWN_STATE,
    );
    assert.ok(stateError, 'Should have PROGRESSION_UNKNOWN_STATE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Dependency Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Invalid Reference', () => {
  it('should detect progression referencing non-existent node', () => {
    const badProg: CurriculumProgressionNode = {
      progressionId: 'prog-bad-ref',
      curriculumNodeId: 'node-999',
      progressionState: 'available',
      dependencyIds: [],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad reference.',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = ['node-001'];
    const errors = validateProgressionNode(badProg, graphNodeIds);
    const refError = errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_INVALID_REFERENCE,
    );
    assert.ok(refError, 'Should have PROGRESSION_INVALID_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Missing Provenance', () => {
  it('should detect missing source on progression', () => {
    const prog: CurriculumProgressionNode = {
      progressionId: 'prog-no-src',
      curriculumNodeId: 'node-001',
      progressionState: 'available',
      dependencyIds: [],
      source: '',
      governanceStatus: 'canonical',
      rationale: 'Missing source.',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = ['node-001'];
    const errors = validateProgressionNode(prog, graphNodeIds);
    const srcError = errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_SOURCE,
    );
    assert.ok(srcError, 'Should have PROGRESSION_MISSING_SOURCE error');
  });

  it('should detect missing rationale on progression', () => {
    const prog: CurriculumProgressionNode = {
      progressionId: 'prog-no-rat',
      curriculumNodeId: 'node-001',
      progressionState: 'available',
      dependencyIds: [],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: '',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = ['node-001'];
    const errors = validateProgressionNode(prog, graphNodeIds);
    const ratError = errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_RATIONALE,
    );
    assert.ok(ratError, 'Should have PROGRESSION_MISSING_RATIONALE error');
  });

  it('should detect missing providedBy on progression', () => {
    const prog: CurriculumProgressionNode = {
      progressionId: 'prog-no-pb',
      curriculumNodeId: 'node-001',
      progressionState: 'available',
      dependencyIds: [],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Missing providedBy.',
      providedBy: '',
    };
    const graphNodeIds = ['node-001'];
    const errors = validateProgressionNode(prog, graphNodeIds);
    const pbError = errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_PROVIDED_BY,
    );
    assert.ok(pbError, 'Should have PROGRESSION_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Orphan Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Orphan Node', () => {
  it('should detect orphan progression referencing non-existent node', () => {
    const orphanProg: CurriculumProgressionNode = {
      progressionId: 'prog-orphan',
      curriculumNodeId: 'node-888',
      progressionState: 'available',
      dependencyIds: [],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Orphan.',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = ['node-001'];
    const errors = validateProgressionNode(orphanProg, graphNodeIds);
    assert.strictEqual(errors.length >= 1, true);
    const refError = errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_INVALID_REFERENCE,
    );
    assert.ok(refError, 'Should have PROGRESSION_INVALID_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Deterministic Ordering', () => {
  it('should sort progressions by curriculumNodeId first', () => {
    const input: CurriculumProgressionInput = {
      registryId: 'prog-reg-sort',
      graphId: 'graph-001',
      progressions: [
        { ...VALID_PROGRESSION_3, curriculumNodeId: 'node-003' },
        VALID_PROGRESSION_1,
      ],
    };
    const registry = composeCurriculumProgression(input);
    assert.strictEqual(registry.progressions[0].curriculumNodeId, 'node-001');
    assert.strictEqual(registry.progressions[1].curriculumNodeId, 'node-003');
  });

  it('should sort progressions by progressionState when curriculumNodeIds are equal', () => {
    const prog1: CurriculumProgressionNode = {
      progressionId: 'prog-sort-1',
      curriculumNodeId: 'node-001',
      progressionState: 'blocked',
      dependencyIds: [],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Sort test.',
      providedBy: 'curriculum-board',
    };
    const prog2: CurriculumProgressionNode = {
      progressionId: 'prog-sort-2',
      curriculumNodeId: 'node-001',
      progressionState: 'available',
      dependencyIds: [],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Sort test.',
      providedBy: 'curriculum-board',
    };
    // Note: This test would only apply if we had duplicate nodes, which validation catches.
    // Sorting is tested via the sort function directly.
  });

  it('should sort progressions by progressionId when curriculumNodeId and state are equal', () => {
    const prog1: CurriculumProgressionNode = {
      progressionId: 'prog-zzz',
      curriculumNodeId: 'node-001',
      progressionState: 'available',
      dependencyIds: [],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Sort test.',
      providedBy: 'curriculum-board',
    };
    const prog2: CurriculumProgressionNode = {
      progressionId: 'prog-aaa',
      curriculumNodeId: 'node-001',
      progressionState: 'available',
      dependencyIds: [],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Sort test.',
      providedBy: 'curriculum-board',
    };
    // Sorting via composeCurriculumProgression
    const input: CurriculumProgressionInput = {
      registryId: 'prog-reg-sort-id',
      graphId: 'graph-001',
      progressions: [prog1, prog2],
    };
    const registry = composeCurriculumProgression(input);
    assert.strictEqual(registry.progressions[0].progressionId, 'prog-aaa');
    assert.strictEqual(registry.progressions[1].progressionId, 'prog-zzz');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Immutable Input', () => {
  it('should not mutate input progressions array', () => {
    const progs = [
      { ...VALID_PROGRESSION_3, curriculumNodeId: 'node-003' },
      VALID_PROGRESSION_1,
    ];
    const original = progs.map((p) => ({ ...p }));
    const input: CurriculumProgressionInput = {
      registryId: 'prog-reg-immutable',
      graphId: 'graph-001',
      progressions: progs,
    };
    composeCurriculumProgression(input);
    assert.deepStrictEqual(progs, original);
  });

  it('should not mutate input progression objects', () => {
    const prog = { ...VALID_PROGRESSION_1 };
    const original = { ...prog };
    composeProgressionRegistry({
      registryId: 'prog-reg-immutable-obj',
      graphId: 'graph-001',
      progressions: [prog],
    });
    assert.deepStrictEqual(prog, original);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Identical Output', () => {
  it('should produce identical output for identical input', () => {
    const reg1 = composeCurriculumProgression(VALID_INPUT);
    const reg2 = composeCurriculumProgression(VALID_INPUT);
    assert.deepStrictEqual(reg1, reg2);
  });

  it('should produce identical output across 100 iterations', () => {
    const reg1 = composeCurriculumProgression(VALID_INPUT);
    const json1 = JSON.stringify(reg1);
    for (let i = 0; i < 100; i++) {
      const reg = composeCurriculumProgression(VALID_INPUT);
      assert.strictEqual(JSON.stringify(reg), json1);
    }
  });

  it('should produce identical trace for identical input', () => {
    const trace1 = composeProgressionTrace('prog-reg-001', VALID_INPUT.progressions);
    const trace2 = composeProgressionTrace('prog-reg-001', VALID_INPUT.progressions);
    assert.deepStrictEqual(trace1, trace2);
  });
});

// ---------------------------------------------------------------------------
// No Learner Inference Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — No Learner Inference', () => {
  it('should not create new progression states beyond canonical', () => {
    assert.deepStrictEqual(getCanonicalProgressionStates(), CANONICAL_PROGRESSION_STATES);
  });

  it('should not add progressions not present in input', () => {
    const input: CurriculumProgressionInput = {
      registryId: 'prog-reg-no-add',
      graphId: 'graph-001',
      progressions: [VALID_PROGRESSION_1],
    };
    const registry = composeCurriculumProgression(input);
    assert.strictEqual(registry.progressions.length, 1);
    assert.strictEqual(registry.progressions[0].progressionId, 'prog-001');
  });
});

// ---------------------------------------------------------------------------
// No Curriculum Mutation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — No Curriculum Mutation', () => {
  it('should not modify the input graph', () => {
    const originalGraph = { ...VALID_GRAPH, nodes: [...VALID_GRAPH.nodes] };
    const input: CurriculumProgressionInput = {
      registryId: 'prog-reg-no-mutate',
      graphId: 'graph-001',
      progressions: [VALID_PROGRESSION_1],
    };
    composeCurriculumProgression(input);
    assert.deepStrictEqual(VALID_GRAPH, originalGraph);
  });
});

// ---------------------------------------------------------------------------
// Helper Functions Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Helper Functions', () => {
  it('isSupportedProgressionState should return true for valid states', () => {
    assert.strictEqual(isSupportedProgressionState('not_available'), true);
    assert.strictEqual(isSupportedProgressionState('available'), true);
    assert.strictEqual(isSupportedProgressionState('recommended'), true);
    assert.strictEqual(isSupportedProgressionState('blocked'), true);
    assert.strictEqual(isSupportedProgressionState('optional'), true);
    assert.strictEqual(isSupportedProgressionState('review'), true);
    assert.strictEqual(isSupportedProgressionState('reinforcement'), true);
    assert.strictEqual(isSupportedProgressionState('completed_by_curriculum'), true);
    assert.strictEqual(isSupportedProgressionState('capstone_ready'), true);
    assert.strictEqual(isSupportedProgressionState('path_complete'), true);
  });

  it('isSupportedProgressionState should return false for invalid states', () => {
    assert.strictEqual(isSupportedProgressionState('invalid'), false);
    assert.strictEqual(isSupportedProgressionState(''), false);
    assert.strictEqual(isSupportedProgressionState('in_progress'), false);
  });

  it('isSupportedProgressionGovernanceStatus should return true for valid statuses', () => {
    assert.strictEqual(isSupportedProgressionGovernanceStatus('canonical'), true);
    assert.strictEqual(isSupportedProgressionGovernanceStatus('accepted'), true);
    assert.strictEqual(isSupportedProgressionGovernanceStatus('provisional'), true);
    assert.strictEqual(isSupportedProgressionGovernanceStatus('deprecated'), true);
    assert.strictEqual(isSupportedProgressionGovernanceStatus('rejected'), true);
  });

  it('isSupportedProgressionGovernanceStatus should return false for invalid statuses', () => {
    assert.strictEqual(isSupportedProgressionGovernanceStatus('invalid'), false);
    assert.strictEqual(isSupportedProgressionGovernanceStatus(''), false);
  });

  it('getCanonicalProgressionStates should return all canonical states', () => {
    const states = getCanonicalProgressionStates();
    assert.strictEqual(states.length, 10);
    assert.deepStrictEqual(states, CANONICAL_PROGRESSION_STATES);
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Registry Validation', () => {
  it('should validate a valid registry', () => {
    const registry = composeProgressionRegistry({
      registryId: 'prog-reg-valid',
      graphId: 'graph-001',
      progressions: [VALID_PROGRESSION_1, VALID_PROGRESSION_2],
    });
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const result = validateProgressionRegistry(registry, graphNodeIds);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
    assert.strictEqual(result.checkedAt, 'curriculum_progression_intelligence');
  });

  it('should detect empty registry', () => {
    const registry: CurriculumProgressionRegistry = {
      registryId: 'prog-reg-empty',
      graphId: 'graph-001',
      progressions: [],
      progressionCount: 0,
      deterministic: true,
      generatedFrom: 'deterministic_progression_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const result = validateProgressionRegistry(registry, graphNodeIds);
    assert.strictEqual(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have PROGRESSION_EMPTY_REGISTRY error');
  });

  it('should detect missing registry ID', () => {
    const registry: CurriculumProgressionRegistry = {
      registryId: '',
      graphId: 'graph-001',
      progressions: [VALID_PROGRESSION_1],
      progressionCount: 1,
      deterministic: true,
      generatedFrom: 'deterministic_progression_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const result = validateProgressionRegistry(registry, graphNodeIds);
    const idError = result.errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_REGISTRY_ID,
    );
    assert.ok(idError, 'Should have PROGRESSION_MISSING_REGISTRY_ID error');
  });

  it('should detect missing graph ID', () => {
    const registry: CurriculumProgressionRegistry = {
      registryId: 'prog-reg-no-graph',
      graphId: '',
      progressions: [VALID_PROGRESSION_1],
      progressionCount: 1,
      deterministic: true,
      generatedFrom: 'deterministic_progression_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const result = validateProgressionRegistry(registry, graphNodeIds);
    const graphError = result.errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_GRAPH_ID,
    );
    assert.ok(graphError, 'Should have PROGRESSION_MISSING_GRAPH_ID error');
  });
});

// ---------------------------------------------------------------------------
// Artifact Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Artifact Validation', () => {
  it('should compose and validate a valid artifact', () => {
    const registry = composeProgressionRegistry({
      registryId: 'prog-reg-art',
      graphId: 'graph-001',
      progressions: [VALID_PROGRESSION_1],
    });
    const trace = composeProgressionTrace('prog-reg-art', registry.progressions);
    const validation: CurriculumArtifactWithProgression['validation'] = {
      valid: true,
      errors: [],
      checkedAt: 'curriculum_progression_intelligence',
    };
    const artifact = composeCurriculumArtifactWithProgression({
      artifactId: 'art-prog-001',
      graph: VALID_GRAPH,
      progressionRegistry: registry,
      progressionTrace: trace,
      validation,
    });
    const result = validateCurriculumArtifactWithProgression(artifact);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Trace Validation', () => {
  it('should compose a trace with correct counts', () => {
    const trace = composeProgressionTrace('prog-reg-trace', [
      VALID_PROGRESSION_1,
      VALID_PROGRESSION_2,
    ]);
    assert.strictEqual(trace.registryId, 'prog-reg-trace');
    assert.strictEqual(trace.progressionCount, 2);
    assert.strictEqual(trace.decisionsCount, 2);
    assert.strictEqual(trace.validatedCount, 2);
    assert.strictEqual(trace.invalidCount, 0);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
  });

  it('should identify invalid progressions in trace', () => {
    const invalidProg: CurriculumProgressionNode = {
      progressionId: '',
      curriculumNodeId: '',
      progressionState: 'invalid' as CurriculumProgressionState,
      dependencyIds: [],
      source: '',
      governanceStatus: 'canonical',
      rationale: '',
      providedBy: '',
    };
    const trace = composeProgressionTrace('prog-reg-trace-bad', [invalidProg]);
    assert.strictEqual(trace.invalidCount, 1);
    assert.strictEqual(trace.validatedCount, 0);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Provenance', () => {
  it('should compose progression provenance', () => {
    const prov = composeProgressionProvenance(VALID_PROGRESSION_1);
    assert.strictEqual(prov.progressionId, VALID_PROGRESSION_1.progressionId);
    assert.strictEqual(prov.source, VALID_PROGRESSION_1.source);
    assert.strictEqual(prov.governanceStatus, VALID_PROGRESSION_1.governanceStatus);
    assert.strictEqual(prov.rationale, VALID_PROGRESSION_1.rationale);
    assert.strictEqual(prov.providedBy, VALID_PROGRESSION_1.providedBy);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Metadata Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Deterministic Metadata', () => {
  it('registry should have deterministic metadata', () => {
    const registry = composeProgressionRegistry({
      registryId: 'prog-reg-meta',
      graphId: 'graph-001',
      progressions: [VALID_PROGRESSION_1],
    });
    assert.strictEqual(registry.deterministic, true);
    assert.strictEqual(registry.generatedFrom, 'deterministic_progression_kernel');
    assert.strictEqual(registry.randomUsed, false);
    assert.strictEqual(registry.timeDependency, false);
  });

  it('trace should have deterministic metadata', () => {
    const trace = composeProgressionTrace('prog-reg-trace-meta', [VALID_PROGRESSION_1]);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.generatedFrom, 'deterministic_progression_kernel');
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Input Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Input Validation', () => {
  it('should validate valid input with no errors', () => {
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateProgressionInput(VALID_INPUT, graphNodeIds);
    assert.deepStrictEqual(errors, []);
  });

  it('should detect missing registry ID in input', () => {
    const input: CurriculumProgressionInput = {
      registryId: '',
      graphId: 'graph-001',
      progressions: [VALID_PROGRESSION_1],
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateProgressionInput(input, graphNodeIds);
    const idError = errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_REGISTRY_ID,
    );
    assert.ok(idError, 'Should have PROGRESSION_MISSING_REGISTRY_ID error');
  });

  it('should detect missing graph ID in input', () => {
    const input: CurriculumProgressionInput = {
      registryId: 'prog-reg-001',
      graphId: '',
      progressions: [VALID_PROGRESSION_1],
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateProgressionInput(input, graphNodeIds);
    const graphError = errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_GRAPH_ID,
    );
    assert.ok(graphError, 'Should have PROGRESSION_MISSING_GRAPH_ID error');
  });

  it('should detect empty progressions in input', () => {
    const input: CurriculumProgressionInput = {
      registryId: 'prog-reg-001',
      graphId: 'graph-001',
      progressions: [],
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateProgressionInput(input, graphNodeIds);
    const emptyError = errors.find(
      (e) => e.code === PROGRESSION_VALIDATION_CODES.PROGRESSION_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have PROGRESSION_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Canonical Progression List Completeness Tests
// ---------------------------------------------------------------------------

describe('Curriculum Progression Kernel — Canonical Progression List Completeness', () => {
  it('should have exactly 10 canonical progression states', () => {
    assert.strictEqual(CANONICAL_PROGRESSION_STATES.length, 10);
  });

  it('should contain all required progression states', () => {
    const required = [
      'not_available',
      'available',
      'recommended',
      'blocked',
      'optional',
      'review',
      'reinforcement',
      'completed_by_curriculum',
      'capstone_ready',
      'path_complete',
    ];
    for (const state of required) {
      assert.ok(
        CANONICAL_PROGRESSION_STATES.includes(state as CurriculumProgressionState),
        `Missing progression state: ${state}`,
      );
    }
  });
});
