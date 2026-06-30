/**
 * NV-1500-D3-OPT-04 — Curriculum Learning Path Kernel Tests
 *
 * Deterministic test suite for the Curriculum Learning Path Kernel.
 * Every test is deterministic and reproducible.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CurriculumNode,
  CurriculumLearningPath,
  CurriculumLearningPathType,
  CurriculumLearningPathStage,
  CurriculumLearningPathRegistry,
  CurriculumLearningPathInput,
  CurriculumArtifactWithLearningPaths,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_LEARNING_PATH_TYPES,
  CANONICAL_LEARNING_PATH_STAGES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

import {
  composeCurriculumNode,
  composeCurriculumGraph,
} from './CurriculumGraphKernel.ts';

import {
  composeLearningPath,
  composeLearningPathNode,
  composeLearningPathRegistry,
  composeLearningPathTrace,
  composeLearningPathProvenance,
  composeCurriculumLearningPaths,
  composeCurriculumArtifactWithLearningPaths,
  isSupportedLearningPathType,
  isSupportedLearningPathStage,
  isSupportedLearningPathGovernanceStatus,
  getCanonicalLearningPathTypes,
  getCanonicalLearningPathStages,
} from './LearningPathKernel.ts';

import {
  validateLearningPath,
  validateLearningPathRegistry,
  validateCurriculumArtifactWithLearningPaths,
  validateLearningPathInput,
  LEARNING_PATH_VALIDATION_CODES,
} from './LearningPathValidation.ts';

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

const VALID_NODE_CAPSTONE: CurriculumNode = {
  nodeId: 'node-capstone',
  nodeType: 'capstone',
  referenceId: 'ref-capstone',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Final capstone project.',
  providedBy: 'curriculum-board',
};

const VALID_GRAPH: CurriculumGraph = {
  graphId: 'graph-001',
  graphLabel: 'Test Curriculum',
  nodes: [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3, VALID_NODE_CAPSTONE],
  edges: [],
  deterministic: true,
  generatedFrom: 'deterministic_curriculum_graph_kernel',
  randomUsed: false,
  timeDependency: false,
};

const VALID_PATH_1: CurriculumLearningPath = {
  pathId: 'path-001',
  pathType: 'foundation',
  pathLabel: 'Foundation Path',
  orderedNodeIds: ['node-001', 'node-002', 'node-003'],
  entryNodeId: 'node-001',
  terminalNodeId: 'node-003',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Foundation learning path for AI fundamentals.',
  providedBy: 'curriculum-board',
};

const VALID_PATH_2: CurriculumLearningPath = {
  pathId: 'path-002',
  pathType: 'specialization',
  pathLabel: 'Specialization Path',
  orderedNodeIds: ['node-002', 'node-003', 'node-capstone'],
  entryNodeId: 'node-002',
  terminalNodeId: 'node-capstone',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Specialization path for advanced learners.',
  providedBy: 'curriculum-board',
};

const VALID_PATH_3: CurriculumLearningPath = {
  pathId: 'path-003',
  pathType: 'research',
  pathLabel: 'Research Path',
  orderedNodeIds: ['node-001', 'node-003'],
  entryNodeId: 'node-001',
  terminalNodeId: 'node-003',
  source: 'governance-committee',
  governanceStatus: 'accepted',
  rationale: 'Research-oriented learning path.',
  providedBy: 'curriculum-board',
};

const VALID_INPUT: CurriculumLearningPathInput = {
  registryId: 'lp-reg-001',
  graphId: 'graph-001',
  paths: [VALID_PATH_1, VALID_PATH_2, VALID_PATH_3],
};

// ---------------------------------------------------------------------------
// Valid Learning Path Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Valid Learning Path', () => {
  it('should compose a valid learning path', () => {
    const path = composeLearningPath(VALID_PATH_1);
    assert.deepStrictEqual(path, VALID_PATH_1);
  });

  it('should validate a valid learning path with no errors', () => {
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPath(VALID_PATH_1, graphNodeIds);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Foundation Path Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Foundation Path', () => {
  it('should compose a foundation path', () => {
    const path = composeLearningPath(VALID_PATH_1);
    assert.strictEqual(path.pathType, 'foundation');
  });
});

// ---------------------------------------------------------------------------
// Specialization Path Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Specialization Path', () => {
  it('should compose a specialization path', () => {
    const path = composeLearningPath(VALID_PATH_2);
    assert.strictEqual(path.pathType, 'specialization');
  });
});

// ---------------------------------------------------------------------------
// Research Path Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Research Path', () => {
  it('should compose a research path', () => {
    const path = composeLearningPath(VALID_PATH_3);
    assert.strictEqual(path.pathType, 'research');
  });
});

// ---------------------------------------------------------------------------
// Laboratory Path Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Laboratory Path', () => {
  it('should compose a laboratory path', () => {
    const labPath: CurriculumLearningPath = {
      pathId: 'path-lab',
      pathType: 'laboratory',
      pathLabel: 'Laboratory Path',
      orderedNodeIds: ['node-001'],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-001',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Laboratory-focused path.',
      providedBy: 'curriculum-board',
    };
    const path = composeLearningPath(labPath);
    assert.strictEqual(path.pathType, 'laboratory');
  });
});

// ---------------------------------------------------------------------------
// Capstone Path Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Capstone Path', () => {
  it('should compose a capstone path', () => {
    const capstonePath: CurriculumLearningPath = {
      pathId: 'path-capstone',
      pathType: 'capstone',
      pathLabel: 'Capstone Path',
      orderedNodeIds: ['node-001', 'node-002', 'node-capstone'],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-capstone',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Capstone-focused path.',
      providedBy: 'curriculum-board',
    };
    const path = composeLearningPath(capstonePath);
    assert.strictEqual(path.pathType, 'capstone');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Path Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Duplicate Path', () => {
  it('should detect duplicate path IDs', () => {
    const registry: CurriculumLearningPathRegistry = {
      registryId: 'lp-reg-dup',
      graphId: 'graph-001',
      paths: [
        VALID_PATH_1,
        { ...VALID_PATH_1, pathId: 'path-001' },
      ],
      pathCount: 2,
      deterministic: true,
      generatedFrom: 'deterministic_learning_path_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const result = validateLearningPathRegistry(registry, graphNodeIds);
    assert.strictEqual(result.valid, false);
    const dupError = result.errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_DUPLICATE_PATH,
    );
    assert.ok(dupError, 'Should have LEARNING_PATH_DUPLICATE_PATH error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Duplicate Node', () => {
  it('should detect duplicate node in orderedNodeIds', () => {
    const dupPath: CurriculumLearningPath = {
      pathId: 'path-dup-node',
      pathType: 'foundation',
      pathLabel: 'Duplicate Node Path',
      orderedNodeIds: ['node-001', 'node-002', 'node-001'],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-001',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Path with duplicate nodes.',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPath(dupPath, graphNodeIds);
    const dupError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_DUPLICATE_NODE,
    );
    assert.ok(dupError, 'Should have LEARNING_PATH_DUPLICATE_NODE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Entry Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Invalid Entry Node', () => {
  it('should detect entry node not in orderedNodeIds', () => {
    const invalidEntryPath: CurriculumLearningPath = {
      pathId: 'path-invalid-entry',
      pathType: 'foundation',
      pathLabel: 'Invalid Entry Path',
      orderedNodeIds: ['node-002', 'node-003'],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-003',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Path with invalid entry.',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPath(invalidEntryPath, graphNodeIds);
    const entryError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_INVALID_ENTRY,
    );
    assert.ok(entryError, 'Should have LEARNING_PATH_INVALID_ENTRY error');
  });

  it('should detect entry node not first in orderedNodeIds', () => {
    const invalidEntryOrderPath: CurriculumLearningPath = {
      pathId: 'path-invalid-entry-order',
      pathType: 'foundation',
      pathLabel: 'Invalid Entry Order Path',
      orderedNodeIds: ['node-002', 'node-001', 'node-003'],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-003',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Path with invalid entry order.',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPath(invalidEntryOrderPath, graphNodeIds);
    const orderError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_INVALID_ORDER,
    );
    assert.ok(orderError, 'Should have LEARNING_PATH_INVALID_ORDER error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Terminal Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Invalid Terminal Node', () => {
  it('should detect terminal node not in orderedNodeIds', () => {
    const invalidTerminalPath: CurriculumLearningPath = {
      pathId: 'path-invalid-terminal',
      pathType: 'foundation',
      pathLabel: 'Invalid Terminal Path',
      orderedNodeIds: ['node-001', 'node-002'],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-003',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Path with invalid terminal.',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPath(invalidTerminalPath, graphNodeIds);
    const terminalError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_INVALID_TERMINAL,
    );
    assert.ok(terminalError, 'Should have LEARNING_PATH_INVALID_TERMINAL error');
  });

  it('should detect terminal node not last in orderedNodeIds', () => {
    const invalidTerminalOrderPath: CurriculumLearningPath = {
      pathId: 'path-invalid-terminal-order',
      pathType: 'foundation',
      pathLabel: 'Invalid Terminal Order Path',
      orderedNodeIds: ['node-001', 'node-002', 'node-003'],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-002',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Path with invalid terminal order.',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPath(invalidTerminalOrderPath, graphNodeIds);
    const orderError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_INVALID_ORDER,
    );
    assert.ok(orderError, 'Should have LEARNING_PATH_INVALID_ORDER error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Path Type Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Unsupported Path Type', () => {
  it('should detect unsupported path type', () => {
    const invalidTypePath: CurriculumLearningPath = {
      pathId: 'path-invalid-type',
      pathType: 'invalid_type' as CurriculumLearningPathType,
      pathLabel: 'Invalid Type Path',
      orderedNodeIds: ['node-001'],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-001',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Path with invalid type.',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPath(invalidTypePath, graphNodeIds);
    const typeError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_UNKNOWN_TYPE,
    );
    assert.ok(typeError, 'Should have LEARNING_PATH_UNKNOWN_TYPE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Ordering Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Invalid Ordering', () => {
  it('should detect entry node not first', () => {
    const invalidOrderPath: CurriculumLearningPath = {
      pathId: 'path-invalid-order',
      pathType: 'foundation',
      pathLabel: 'Invalid Order Path',
      orderedNodeIds: ['node-002', 'node-001'],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-002',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Path with invalid order.',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPath(invalidOrderPath, graphNodeIds);
    const orderError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_INVALID_ORDER,
    );
    assert.ok(orderError, 'Should have LEARNING_PATH_INVALID_ORDER error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Missing Provenance', () => {
  it('should detect missing source on path', () => {
    const noSourcePath: CurriculumLearningPath = {
      pathId: 'path-no-source',
      pathType: 'foundation',
      pathLabel: 'No Source Path',
      orderedNodeIds: ['node-001'],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-001',
      source: '',
      governanceStatus: 'canonical',
      rationale: 'Missing source.',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPath(noSourcePath, graphNodeIds);
    const srcError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_SOURCE,
    );
    assert.ok(srcError, 'Should have LEARNING_PATH_MISSING_SOURCE error');
  });

  it('should detect missing rationale on path', () => {
    const noRationalePath: CurriculumLearningPath = {
      pathId: 'path-no-rationale',
      pathType: 'foundation',
      pathLabel: 'No Rationale Path',
      orderedNodeIds: ['node-001'],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-001',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: '',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPath(noRationalePath, graphNodeIds);
    const ratError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_RATIONALE,
    );
    assert.ok(ratError, 'Should have LEARNING_PATH_MISSING_RATIONALE error');
  });

  it('should detect missing providedBy on path', () => {
    const noProvidedByPath: CurriculumLearningPath = {
      pathId: 'path-no-providedby',
      pathType: 'foundation',
      pathLabel: 'No ProvidedBy Path',
      orderedNodeIds: ['node-001'],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-001',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Missing providedBy.',
      providedBy: '',
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPath(noProvidedByPath, graphNodeIds);
    const pbError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_PROVIDED_BY,
    );
    assert.ok(pbError, 'Should have LEARNING_PATH_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Empty Path Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Empty Path', () => {
  it('should detect empty path', () => {
    const emptyPath: CurriculumLearningPath = {
      pathId: 'path-empty',
      pathType: 'foundation',
      pathLabel: 'Empty Path',
      orderedNodeIds: [],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-001',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Empty path.',
      providedBy: 'curriculum-board',
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPath(emptyPath, graphNodeIds);
    const emptyError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_EMPTY_PATH,
    );
    assert.ok(emptyError, 'Should have LEARNING_PATH_EMPTY_PATH error');
  });

  it('should detect empty registry', () => {
    const registry: CurriculumLearningPathRegistry = {
      registryId: 'lp-reg-empty',
      graphId: 'graph-001',
      paths: [],
      pathCount: 0,
      deterministic: true,
      generatedFrom: 'deterministic_learning_path_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const result = validateLearningPathRegistry(registry, graphNodeIds);
    assert.strictEqual(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have LEARNING_PATH_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Deterministic Ordering', () => {
  it('should sort paths by pathId', () => {
    const input: CurriculumLearningPathInput = {
      registryId: 'lp-reg-sort',
      graphId: 'graph-001',
      paths: [VALID_PATH_2, VALID_PATH_1, VALID_PATH_3],
    };
    const registry = composeCurriculumLearningPaths(input);
    assert.strictEqual(registry.paths[0].pathId, 'path-001');
    assert.strictEqual(registry.paths[1].pathId, 'path-002');
    assert.strictEqual(registry.paths[2].pathId, 'path-003');
  });

  it('should sort paths by orderedNodeIds when pathIds are equal', () => {
    const pathA: CurriculumLearningPath = {
      pathId: 'path-same',
      pathType: 'foundation',
      pathLabel: 'Path A',
      orderedNodeIds: ['node-002', 'node-003'],
      entryNodeId: 'node-002',
      terminalNodeId: 'node-003',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Path A.',
      providedBy: 'curriculum-board',
    };
    const pathB: CurriculumLearningPath = {
      pathId: 'path-same',
      pathType: 'foundation',
      pathLabel: 'Path B',
      orderedNodeIds: ['node-001', 'node-002'],
      entryNodeId: 'node-001',
      terminalNodeId: 'node-002',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Path B.',
      providedBy: 'curriculum-board',
    };
    const input: CurriculumLearningPathInput = {
      registryId: 'lp-reg-sort-ids',
      graphId: 'graph-001',
      paths: [pathA, pathB],
    };
    const registry = composeCurriculumLearningPaths(input);
    assert.deepStrictEqual(registry.paths[0].orderedNodeIds, ['node-001', 'node-002']);
    assert.deepStrictEqual(registry.paths[1].orderedNodeIds, ['node-002', 'node-003']);
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Immutable Input', () => {
  it('should not mutate input paths array', () => {
    const paths = [VALID_PATH_2, VALID_PATH_1];
    const original = paths.map((p) => ({ ...p }));
    const input: CurriculumLearningPathInput = {
      registryId: 'lp-reg-immutable',
      graphId: 'graph-001',
      paths,
    };
    composeCurriculumLearningPaths(input);
    assert.deepStrictEqual(paths, original);
  });

  it('should not mutate input path objects', () => {
    const path = { ...VALID_PATH_1 };
    const original = { ...path };
    composeLearningPathRegistry({
      registryId: 'lp-reg-immutable-obj',
      graphId: 'graph-001',
      paths: [path],
    });
    assert.deepStrictEqual(path, original);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Identical Output', () => {
  it('should produce identical output for identical input', () => {
    const reg1 = composeCurriculumLearningPaths(VALID_INPUT);
    const reg2 = composeCurriculumLearningPaths(VALID_INPUT);
    assert.deepStrictEqual(reg1, reg2);
  });

  it('should produce identical output across 100 iterations', () => {
    const reg1 = composeCurriculumLearningPaths(VALID_INPUT);
    const json1 = JSON.stringify(reg1);
    for (let i = 0; i < 100; i++) {
      const reg = composeCurriculumLearningPaths(VALID_INPUT);
      assert.strictEqual(JSON.stringify(reg), json1);
    }
  });

  it('should produce identical trace for identical input', () => {
    const trace1 = composeLearningPathTrace('lp-reg-001', VALID_INPUT.paths);
    const trace2 = composeLearningPathTrace('lp-reg-001', VALID_INPUT.paths);
    assert.deepStrictEqual(trace1, trace2);
  });
});

// ---------------------------------------------------------------------------
// No Learner Inference Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — No Learner Inference', () => {
  it('should not create new path types beyond canonical', () => {
    assert.deepStrictEqual(getCanonicalLearningPathTypes(), CANONICAL_LEARNING_PATH_TYPES);
  });

  it('should not create new stages beyond canonical', () => {
    assert.deepStrictEqual(getCanonicalLearningPathStages(), CANONICAL_LEARNING_PATH_STAGES);
  });

  it('should not add paths not present in input', () => {
    const input: CurriculumLearningPathInput = {
      registryId: 'lp-reg-no-add',
      graphId: 'graph-001',
      paths: [VALID_PATH_1],
    };
    const registry = composeCurriculumLearningPaths(input);
    assert.strictEqual(registry.paths.length, 1);
    assert.strictEqual(registry.paths[0].pathId, 'path-001');
  });
});

// ---------------------------------------------------------------------------
// No Curriculum Mutation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — No Curriculum Mutation', () => {
  it('should not modify the input graph', () => {
    const originalGraph = { ...VALID_GRAPH, nodes: [...VALID_GRAPH.nodes] };
    const input: CurriculumLearningPathInput = {
      registryId: 'lp-reg-no-mutate',
      graphId: 'graph-001',
      paths: [VALID_PATH_1],
    };
    composeCurriculumLearningPaths(input);
    assert.deepStrictEqual(VALID_GRAPH, originalGraph);
  });
});

// ---------------------------------------------------------------------------
// Helper Functions Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Helper Functions', () => {
  it('isSupportedLearningPathType should return true for valid types', () => {
    assert.strictEqual(isSupportedLearningPathType('foundation'), true);
    assert.strictEqual(isSupportedLearningPathType('core'), true);
    assert.strictEqual(isSupportedLearningPathType('specialization'), true);
    assert.strictEqual(isSupportedLearningPathType('research'), true);
    assert.strictEqual(isSupportedLearningPathType('laboratory'), true);
    assert.strictEqual(isSupportedLearningPathType('project'), true);
    assert.strictEqual(isSupportedLearningPathType('review'), true);
    assert.strictEqual(isSupportedLearningPathType('capstone'), true);
    assert.strictEqual(isSupportedLearningPathType('certification'), true);
    assert.strictEqual(isSupportedLearningPathType('exploration'), true);
  });

  it('isSupportedLearningPathType should return false for invalid types', () => {
    assert.strictEqual(isSupportedLearningPathType('invalid'), false);
    assert.strictEqual(isSupportedLearningPathType(''), false);
    assert.strictEqual(isSupportedLearningPathType('intermediate'), false);
  });

  it('isSupportedLearningPathStage should return true for valid stages', () => {
    assert.strictEqual(isSupportedLearningPathStage('planned'), true);
    assert.strictEqual(isSupportedLearningPathStage('available'), true);
    assert.strictEqual(isSupportedLearningPathStage('active'), true);
    assert.strictEqual(isSupportedLearningPathStage('blocked'), true);
    assert.strictEqual(isSupportedLearningPathStage('optional'), true);
    assert.strictEqual(isSupportedLearningPathStage('review'), true);
    assert.strictEqual(isSupportedLearningPathStage('completed_by_curriculum'), true);
    assert.strictEqual(isSupportedLearningPathStage('terminal'), true);
  });

  it('isSupportedLearningPathStage should return false for invalid stages', () => {
    assert.strictEqual(isSupportedLearningPathStage('invalid'), false);
    assert.strictEqual(isSupportedLearningPathStage(''), false);
    assert.strictEqual(isSupportedLearningPathStage('in_progress'), false);
  });

  it('isSupportedLearningPathGovernanceStatus should return true for valid statuses', () => {
    assert.strictEqual(isSupportedLearningPathGovernanceStatus('canonical'), true);
    assert.strictEqual(isSupportedLearningPathGovernanceStatus('accepted'), true);
    assert.strictEqual(isSupportedLearningPathGovernanceStatus('provisional'), true);
    assert.strictEqual(isSupportedLearningPathGovernanceStatus('deprecated'), true);
    assert.strictEqual(isSupportedLearningPathGovernanceStatus('rejected'), true);
  });

  it('isSupportedLearningPathGovernanceStatus should return false for invalid statuses', () => {
    assert.strictEqual(isSupportedLearningPathGovernanceStatus('invalid'), false);
    assert.strictEqual(isSupportedLearningPathGovernanceStatus(''), false);
  });

  it('getCanonicalLearningPathTypes should return all canonical types', () => {
    const types = getCanonicalLearningPathTypes();
    assert.strictEqual(types.length, 10);
    assert.deepStrictEqual(types, CANONICAL_LEARNING_PATH_TYPES);
  });

  it('getCanonicalLearningPathStages should return all canonical stages', () => {
    const stages = getCanonicalLearningPathStages();
    assert.strictEqual(stages.length, 8);
    assert.deepStrictEqual(stages, CANONICAL_LEARNING_PATH_STAGES);
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Registry Validation', () => {
  it('should validate a valid registry', () => {
    const registry = composeLearningPathRegistry({
      registryId: 'lp-reg-valid',
      graphId: 'graph-001',
      paths: [VALID_PATH_1, VALID_PATH_2],
    });
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const result = validateLearningPathRegistry(registry, graphNodeIds);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
    assert.strictEqual(result.checkedAt, 'curriculum_learning_path_composition');
  });

  it('should detect missing registry ID', () => {
    const registry: CurriculumLearningPathRegistry = {
      registryId: '',
      graphId: 'graph-001',
      paths: [VALID_PATH_1],
      pathCount: 1,
      deterministic: true,
      generatedFrom: 'deterministic_learning_path_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const result = validateLearningPathRegistry(registry, graphNodeIds);
    const idError = result.errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_REGISTRY_ID,
    );
    assert.ok(idError, 'Should have LEARNING_PATH_MISSING_REGISTRY_ID error');
  });

  it('should detect missing graph ID', () => {
    const registry: CurriculumLearningPathRegistry = {
      registryId: 'lp-reg-no-graph',
      graphId: '',
      paths: [VALID_PATH_1],
      pathCount: 1,
      deterministic: true,
      generatedFrom: 'deterministic_learning_path_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const result = validateLearningPathRegistry(registry, graphNodeIds);
    const graphError = result.errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_GRAPH_ID,
    );
    assert.ok(graphError, 'Should have LEARNING_PATH_MISSING_GRAPH_ID error');
  });
});

// ---------------------------------------------------------------------------
// Artifact Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Artifact Validation', () => {
  it('should compose and validate a valid artifact', () => {
    const registry = composeLearningPathRegistry({
      registryId: 'lp-reg-art',
      graphId: 'graph-001',
      paths: [VALID_PATH_1],
    });
    const trace = composeLearningPathTrace('lp-reg-art', registry.paths);
    const validation: CurriculumArtifactWithLearningPaths['validation'] = {
      valid: true,
      errors: [],
      checkedAt: 'curriculum_learning_path_composition',
    };
    const artifact = composeCurriculumArtifactWithLearningPaths({
      artifactId: 'art-lp-001',
      graph: VALID_GRAPH,
      learningPathRegistry: registry,
      learningPathTrace: trace,
      validation,
    });
    const result = validateCurriculumArtifactWithLearningPaths(artifact);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Trace Validation', () => {
  it('should compose a trace with correct counts', () => {
    const trace = composeLearningPathTrace('lp-reg-trace', [
      VALID_PATH_1,
      VALID_PATH_2,
    ]);
    assert.strictEqual(trace.registryId, 'lp-reg-trace');
    assert.strictEqual(trace.pathCount, 2);
    assert.strictEqual(trace.decisionsCount, 2);
    assert.strictEqual(trace.validatedCount, 2);
    assert.strictEqual(trace.invalidCount, 0);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
  });

  it('should identify invalid paths in trace', () => {
    const invalidPath: CurriculumLearningPath = {
      pathId: '',
      pathType: 'invalid' as CurriculumLearningPathType,
      pathLabel: '',
      orderedNodeIds: [],
      entryNodeId: '',
      terminalNodeId: '',
      source: '',
      governanceStatus: 'canonical',
      rationale: '',
      providedBy: '',
    };
    const trace = composeLearningPathTrace('lp-reg-trace-bad', [invalidPath]);
    assert.strictEqual(trace.invalidCount, 1);
    assert.strictEqual(trace.validatedCount, 0);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Provenance', () => {
  it('should compose learning path provenance', () => {
    const prov = composeLearningPathProvenance(VALID_PATH_1);
    assert.strictEqual(prov.pathId, VALID_PATH_1.pathId);
    assert.strictEqual(prov.source, VALID_PATH_1.source);
    assert.strictEqual(prov.governanceStatus, VALID_PATH_1.governanceStatus);
    assert.strictEqual(prov.rationale, VALID_PATH_1.rationale);
    assert.strictEqual(prov.providedBy, VALID_PATH_1.providedBy);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Metadata Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Deterministic Metadata', () => {
  it('registry should have deterministic metadata', () => {
    const registry = composeLearningPathRegistry({
      registryId: 'lp-reg-meta',
      graphId: 'graph-001',
      paths: [VALID_PATH_1],
    });
    assert.strictEqual(registry.deterministic, true);
    assert.strictEqual(registry.generatedFrom, 'deterministic_learning_path_kernel');
    assert.strictEqual(registry.randomUsed, false);
    assert.strictEqual(registry.timeDependency, false);
  });

  it('trace should have deterministic metadata', () => {
    const trace = composeLearningPathTrace('lp-reg-trace-meta', [VALID_PATH_1]);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.generatedFrom, 'deterministic_learning_path_kernel');
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Input Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Input Validation', () => {
  it('should validate valid input with no errors', () => {
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPathInput(VALID_INPUT, graphNodeIds);
    assert.deepStrictEqual(errors, []);
  });

  it('should detect missing registry ID in input', () => {
    const input: CurriculumLearningPathInput = {
      registryId: '',
      graphId: 'graph-001',
      paths: [VALID_PATH_1],
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPathInput(input, graphNodeIds);
    const idError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_REGISTRY_ID,
    );
    assert.ok(idError, 'Should have LEARNING_PATH_MISSING_REGISTRY_ID error');
  });

  it('should detect missing graph ID in input', () => {
    const input: CurriculumLearningPathInput = {
      registryId: 'lp-reg-001',
      graphId: '',
      paths: [VALID_PATH_1],
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPathInput(input, graphNodeIds);
    const graphError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_GRAPH_ID,
    );
    assert.ok(graphError, 'Should have LEARNING_PATH_MISSING_GRAPH_ID error');
  });

  it('should detect empty paths in input', () => {
    const input: CurriculumLearningPathInput = {
      registryId: 'lp-reg-001',
      graphId: 'graph-001',
      paths: [],
    };
    const graphNodeIds = VALID_GRAPH.nodes.map((n) => n.nodeId);
    const errors = validateLearningPathInput(input, graphNodeIds);
    const emptyError = errors.find(
      (e) => e.code === LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have LEARNING_PATH_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Canonical Type Completeness Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Canonical Type Completeness', () => {
  it('should have exactly 10 canonical learning path types', () => {
    assert.strictEqual(CANONICAL_LEARNING_PATH_TYPES.length, 10);
  });

  it('should contain all required learning path types', () => {
    const required = [
      'foundation',
      'core',
      'specialization',
      'research',
      'laboratory',
      'project',
      'review',
      'capstone',
      'certification',
      'exploration',
    ];
    for (const type of required) {
      assert.ok(
        CANONICAL_LEARNING_PATH_TYPES.includes(type as CurriculumLearningPathType),
        `Missing learning path type: ${type}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Canonical Stage Completeness Tests
// ---------------------------------------------------------------------------

describe('Curriculum Learning Path Kernel — Canonical Stage Completeness', () => {
  it('should have exactly 8 canonical learning path stages', () => {
    assert.strictEqual(CANONICAL_LEARNING_PATH_STAGES.length, 8);
  });

  it('should contain all required learning path stages', () => {
    const required = [
      'planned',
      'available',
      'active',
      'blocked',
      'optional',
      'review',
      'completed_by_curriculum',
      'terminal',
    ];
    for (const stage of required) {
      assert.ok(
        CANONICAL_LEARNING_PATH_STAGES.includes(stage as CurriculumLearningPathStage),
        `Missing learning path stage: ${stage}`,
      );
    }
  });
});
