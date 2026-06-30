/**
 * NV-1500-D3-OPT-01 — Curriculum Graph Kernel Tests
 *
 * Deterministic test suite for the Curriculum Graph Kernel.
 * Every test is deterministic and reproducible.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CurriculumNode,
  CurriculumEdge,
  CurriculumGraph,
  CurriculumGraphRegistry,
  CurriculumGraphInput,
  CurriculumGovernanceStatus,
  CurriculumNodeType,
  CurriculumRelationshipType,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_NODE_TYPES,
  CANONICAL_RELATIONSHIP_TYPES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

import {
  composeCurriculumNode,
  composeCurriculumEdge,
  composeCurriculumProvenance,
  composeNodeProvenance,
  composeEdgeProvenance,
  composeCurriculumGraph,
  composeCurriculumTrace,
  composeCurriculumRegistry,
  composeCurriculumArtifact,
  isSupportedNodeType,
  isSupportedRelationshipType,
  isSupportedGovernanceStatus,
  getCanonicalNodeTypes,
  getCanonicalRelationshipTypes,
  getCanonicalGovernanceStatuses,
} from './CurriculumGraphKernel.ts';

import {
  validateCurriculumNode,
  validateCurriculumEdge,
  validateCurriculumGraph,
  validateCurriculumRegistry,
  validateCurriculumArtifact,
  validateCurriculumInput,
  CURRICULUM_VALIDATION_CODES,
} from './CurriculumGraphValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_NODE_1: CurriculumNode = {
  nodeId: 'node-001',
  nodeType: 'learning_path',
  referenceId: 'ref-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Foundational learning path for AI fundamentals.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_2: CurriculumNode = {
  nodeId: 'node-002',
  nodeType: 'module',
  referenceId: 'ref-002',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Core module covering neural network architectures.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_3: CurriculumNode = {
  nodeId: 'node-003',
  nodeType: 'lesson',
  referenceId: 'ref-003',
  source: 'governance-committee',
  governanceStatus: 'accepted',
  rationale: 'Lesson on convolutional neural networks.',
  providedBy: 'curriculum-board',
};

const VALID_EDGE_1: CurriculumEdge = {
  edgeId: 'edge-001',
  sourceNodeId: 'node-001',
  targetNodeId: 'node-002',
  relationshipType: 'contains',
  referenceId: 'ref-edge-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Learning path contains the module.',
  providedBy: 'curriculum-board',
};

const VALID_EDGE_2: CurriculumEdge = {
  edgeId: 'edge-002',
  sourceNodeId: 'node-002',
  targetNodeId: 'node-003',
  relationshipType: 'contains',
  referenceId: 'ref-edge-002',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Module contains the lesson.',
  providedBy: 'curriculum-board',
};

const VALID_INPUT: CurriculumGraphInput = {
  graphId: 'graph-001',
  graphLabel: 'AI Fundamentals Curriculum',
  nodes: [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3],
  edges: [VALID_EDGE_1, VALID_EDGE_2],
};

// ---------------------------------------------------------------------------
// Valid Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Valid Node', () => {
  it('should compose a valid node', () => {
    const node = composeCurriculumNode(VALID_NODE_1);
    assert.deepStrictEqual(node, VALID_NODE_1);
  });

  it('should validate a valid node with no errors', () => {
    const errors = validateCurriculumNode(VALID_NODE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should compose all canonical node types', () => {
    for (const nodeType of CANONICAL_NODE_TYPES) {
      const node = composeCurriculumNode({
        nodeId: `node-${nodeType}`,
        nodeType,
        referenceId: `ref-${nodeType}`,
        source: 'governance-committee',
        governanceStatus: 'canonical',
        rationale: `Rationale for ${nodeType}.`,
        providedBy: 'curriculum-board',
      });
      assert.strictEqual(node.nodeType, nodeType);
      const errors = validateCurriculumNode(node);
      assert.deepStrictEqual(errors, []);
    }
  });
});

// ---------------------------------------------------------------------------
// Valid Edge Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Valid Edge', () => {
  it('should compose a valid edge', () => {
    const edge = composeCurriculumEdge(VALID_EDGE_1);
    assert.deepStrictEqual(edge, VALID_EDGE_1);
  });

  it('should validate a valid edge with no errors', () => {
    const nodeIds = [VALID_NODE_1.nodeId, VALID_NODE_2.nodeId];
    const errors = validateCurriculumEdge(VALID_EDGE_1, nodeIds);
    assert.deepStrictEqual(errors, []);
  });

  it('should compose all canonical relationship types', () => {
    for (const relType of CANONICAL_RELATIONSHIP_TYPES) {
      const edge = composeCurriculumEdge({
        edgeId: `edge-${relType}`,
        sourceNodeId: 'node-001',
        targetNodeId: 'node-002',
        relationshipType: relType,
        referenceId: `ref-edge-${relType}`,
        source: 'governance-committee',
        governanceStatus: 'canonical',
        rationale: `Rationale for ${relType}.`,
        providedBy: 'curriculum-board',
      });
      assert.strictEqual(edge.relationshipType, relType);
      const errors = validateCurriculumEdge(edge, ['node-001', 'node-002']);
      assert.deepStrictEqual(errors, []);
    }
  });
});

// ---------------------------------------------------------------------------
// Valid Graph Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Valid Graph', () => {
  it('should compose a valid graph', () => {
    const graph = composeCurriculumGraph(VALID_INPUT);
    assert.strictEqual(graph.graphId, 'graph-001');
    assert.strictEqual(graph.graphLabel, 'AI Fundamentals Curriculum');
    assert.strictEqual(graph.nodes.length, 3);
    assert.strictEqual(graph.edges.length, 2);
    assert.strictEqual(graph.deterministic, true);
    assert.strictEqual(graph.randomUsed, false);
    assert.strictEqual(graph.timeDependency, false);
  });

  it('should validate a valid graph with no errors', () => {
    const graph = composeCurriculumGraph(VALID_INPUT);
    const result = validateCurriculumGraph(graph);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
    assert.strictEqual(result.checkedAt, 'curriculum_graph_composition');
  });

  it('should compose a valid registry', () => {
    const graph = composeCurriculumGraph(VALID_INPUT);
    const registry = composeCurriculumRegistry('reg-001', [graph]);
    assert.strictEqual(registry.registryId, 'reg-001');
    assert.strictEqual(registry.graphCount, 1);
    assert.strictEqual(registry.nodeCount, 3);
    assert.strictEqual(registry.edgeCount, 2);
  });

  it('should validate a valid registry with no errors', () => {
    const graph = composeCurriculumGraph(VALID_INPUT);
    const registry = composeCurriculumRegistry('reg-001', [graph]);
    const result = validateCurriculumRegistry(registry);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Node Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Duplicate Node', () => {
  it('should detect duplicate node IDs', () => {
    const graph: CurriculumGraph = {
      graphId: 'graph-dup',
      graphLabel: 'Duplicate Test',
      nodes: [VALID_NODE_1, { ...VALID_NODE_1, nodeId: 'node-001' }],
      edges: [],
      deterministic: true,
      generatedFrom: 'deterministic_curriculum_graph_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateCurriculumGraph(graph);
    assert.strictEqual(result.valid, false);
    const dupError = result.errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_DUPLICATE_NODE,
    );
    assert.ok(dupError, 'Should have CURRICULUM_DUPLICATE_NODE error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Edge Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Duplicate Edge', () => {
  it('should detect duplicate edge IDs', () => {
    const graph: CurriculumGraph = {
      graphId: 'graph-dup-edge',
      graphLabel: 'Duplicate Edge Test',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1, { ...VALID_EDGE_1, edgeId: 'edge-001' }],
      deterministic: true,
      generatedFrom: 'deterministic_curriculum_graph_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateCurriculumGraph(graph);
    assert.strictEqual(result.valid, false);
    const dupError = result.errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_DUPLICATE_EDGE,
    );
    assert.ok(dupError, 'Should have CURRICULUM_DUPLICATE_EDGE error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Node Type Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Unsupported Node Type', () => {
  it('should detect unsupported node type', () => {
    const invalidNode: CurriculumNode = {
      nodeId: 'node-bad',
      nodeType: 'invalid_type' as CurriculumNodeType,
      referenceId: 'ref-bad',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad node.',
      providedBy: 'curriculum-board',
    };
    const errors = validateCurriculumNode(invalidNode);
    const typeError = errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_UNKNOWN_NODE_TYPE,
    );
    assert.ok(typeError, 'Should have CURRICULUM_UNKNOWN_NODE_TYPE error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Relationship Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Unsupported Relationship', () => {
  it('should detect unsupported relationship type', () => {
    const invalidEdge: CurriculumEdge = {
      edgeId: 'edge-bad',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-002',
      relationshipType: 'invalid_relationship' as CurriculumRelationshipType,
      referenceId: 'ref-edge-bad',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad edge.',
      providedBy: 'curriculum-board',
    };
    const errors = validateCurriculumEdge(invalidEdge, ['node-001', 'node-002']);
    const relError = errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_UNKNOWN_RELATIONSHIP,
    );
    assert.ok(relError, 'Should have CURRICULUM_UNKNOWN_RELATIONSHIP error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Missing Provenance', () => {
  it('should detect missing source on node', () => {
    const node: CurriculumNode = {
      nodeId: 'node-no-source',
      nodeType: 'lesson',
      referenceId: 'ref-ns',
      source: '',
      governanceStatus: 'canonical',
      rationale: 'Missing source.',
      providedBy: 'curriculum-board',
    };
    const errors = validateCurriculumNode(node);
    const srcError = errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_SOURCE,
    );
    assert.ok(srcError, 'Should have CURRICULUM_MISSING_SOURCE error');
  });

  it('should detect missing reference ID on node', () => {
    const node: CurriculumNode = {
      nodeId: 'node-no-ref',
      nodeType: 'lesson',
      referenceId: '',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Missing ref.',
      providedBy: 'curriculum-board',
    };
    const errors = validateCurriculumNode(node);
    const refError = errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_REFERENCE_ID,
    );
    assert.ok(refError, 'Should have CURRICULUM_MISSING_REFERENCE_ID error');
  });

  it('should detect missing rationale on node', () => {
    const node: CurriculumNode = {
      nodeId: 'node-no-rationale',
      nodeType: 'lesson',
      referenceId: 'ref-nr',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: '',
      providedBy: 'curriculum-board',
    };
    const errors = validateCurriculumNode(node);
    const ratError = errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_RATIONALE,
    );
    assert.ok(ratError, 'Should have CURRICULUM_MISSING_RATIONALE error');
  });

  it('should detect missing providedBy on node', () => {
    const node: CurriculumNode = {
      nodeId: 'node-no-pb',
      nodeType: 'lesson',
      referenceId: 'ref-npb',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Missing providedBy.',
      providedBy: '',
    };
    const errors = validateCurriculumNode(node);
    const pbError = errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_PROVIDED_BY,
    );
    assert.ok(pbError, 'Should have CURRICULUM_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Missing Source', () => {
  it('should detect missing source on edge', () => {
    const edge: CurriculumEdge = {
      edgeId: 'edge-no-src',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-002',
      relationshipType: 'contains',
      referenceId: 'ref-e-ns',
      source: '',
      governanceStatus: 'canonical',
      rationale: 'Missing source.',
      providedBy: 'curriculum-board',
    };
    const errors = validateCurriculumEdge(edge, ['node-001', 'node-002']);
    const srcError = errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_SOURCE,
    );
    assert.ok(srcError, 'Should have CURRICULUM_MISSING_SOURCE error');
  });
});

// ---------------------------------------------------------------------------
// Empty Graph Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Empty Graph', () => {
  it('should detect empty graph', () => {
    const graph: CurriculumGraph = {
      graphId: 'graph-empty',
      graphLabel: 'Empty Graph',
      nodes: [],
      edges: [],
      deterministic: true,
      generatedFrom: 'deterministic_curriculum_graph_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateCurriculumGraph(graph);
    assert.strictEqual(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_EMPTY_GRAPH,
    );
    assert.ok(emptyError, 'Should have CURRICULUM_EMPTY_GRAPH error');
  });

  it('should detect empty registry', () => {
    const registry: CurriculumGraphRegistry = {
      registryId: 'reg-empty',
      graphs: [],
      nodeCount: 0,
      edgeCount: 0,
      graphCount: 0,
      deterministic: true,
      generatedFrom: 'deterministic_curriculum_graph_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateCurriculumRegistry(registry);
    assert.strictEqual(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have CURRICULUM_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Deterministic Ordering', () => {
  it('should sort nodes by nodeId', () => {
    const input: CurriculumGraphInput = {
      graphId: 'graph-order',
      graphLabel: 'Order Test',
      nodes: [VALID_NODE_3, VALID_NODE_1, VALID_NODE_2],
      edges: [],
    };
    const graph = composeCurriculumGraph(input);
    assert.strictEqual(graph.nodes[0].nodeId, 'node-001');
    assert.strictEqual(graph.nodes[1].nodeId, 'node-002');
    assert.strictEqual(graph.nodes[2].nodeId, 'node-003');
  });

  it('should sort edges by edgeId', () => {
    const input: CurriculumGraphInput = {
      graphId: 'graph-edge-order',
      graphLabel: 'Edge Order Test',
      nodes: [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3],
      edges: [VALID_EDGE_2, VALID_EDGE_1],
    };
    const graph = composeCurriculumGraph(input);
    assert.strictEqual(graph.edges[0].edgeId, 'edge-001');
    assert.strictEqual(graph.edges[1].edgeId, 'edge-002');
  });

  it('should sort registry graphs by graphId', () => {
    const graph1 = composeCurriculumGraph({
      graphId: 'graph-b',
      graphLabel: 'B',
      nodes: [VALID_NODE_1],
      edges: [],
    });
    const graph2 = composeCurriculumGraph({
      graphId: 'graph-a',
      graphLabel: 'A',
      nodes: [VALID_NODE_2],
      edges: [],
    });
    const registry = composeCurriculumRegistry('reg-sort', [graph1, graph2]);
    assert.strictEqual(registry.graphs[0].graphId, 'graph-a');
    assert.strictEqual(registry.graphs[1].graphId, 'graph-b');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Immutable Input', () => {
  it('should not mutate input nodes array', () => {
    const nodes = [VALID_NODE_3, VALID_NODE_1];
    const original = [...nodes];
    const input: CurriculumGraphInput = {
      graphId: 'graph-immutable',
      graphLabel: 'Immutable Test',
      nodes,
      edges: [],
    };
    composeCurriculumGraph(input);
    assert.deepStrictEqual(nodes, original);
  });

  it('should not mutate input edges array', () => {
    const edges = [VALID_EDGE_2, VALID_EDGE_1];
    const original = [...edges];
    const input: CurriculumGraphInput = {
      graphId: 'graph-immutable-edges',
      graphLabel: 'Immutable Edge Test',
      nodes: [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3],
      edges,
    };
    composeCurriculumGraph(input);
    assert.deepStrictEqual(edges, original);
  });

  it('should not mutate input graph objects', () => {
    const graph1 = composeCurriculumGraph({
      graphId: 'graph-a',
      graphLabel: 'A',
      nodes: [VALID_NODE_1],
      edges: [],
    });
    const graph2 = composeCurriculumGraph({
      graphId: 'graph-b',
      graphLabel: 'B',
      nodes: [VALID_NODE_2],
      edges: [],
    });
    const originalGraph1 = { ...graph1 };
    const originalGraph2 = { ...graph2 };
    composeCurriculumRegistry('reg-immutable', [graph1, graph2]);
    assert.deepStrictEqual(graph1, originalGraph1);
    assert.deepStrictEqual(graph2, originalGraph2);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Identical Output', () => {
  it('should produce identical output for identical input', () => {
    const graph1 = composeCurriculumGraph(VALID_INPUT);
    const graph2 = composeCurriculumGraph(VALID_INPUT);
    assert.deepStrictEqual(graph1, graph2);
  });

  it('should produce identical output for identical registry input', () => {
    const graph1 = composeCurriculumGraph(VALID_INPUT);
    const graph2 = composeCurriculumGraph(VALID_INPUT);
    const reg1 = composeCurriculumRegistry('reg-001', [graph1]);
    const reg2 = composeCurriculumRegistry('reg-001', [graph2]);
    assert.deepStrictEqual(reg1, reg2);
  });

  it('should produce identical output across 100 iterations', () => {
    const graph1 = composeCurriculumGraph(VALID_INPUT);
    const json1 = JSON.stringify(graph1);
    for (let i = 0; i < 100; i++) {
      const graph = composeCurriculumGraph(VALID_INPUT);
      assert.strictEqual(JSON.stringify(graph), json1);
    }
  });
});

// ---------------------------------------------------------------------------
// No Generated Curriculum Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — No Generated Curriculum', () => {
  it('should not create new node types beyond canonical', () => {
    assert.deepStrictEqual(getCanonicalNodeTypes(), CANONICAL_NODE_TYPES);
  });

  it('should not create new relationship types beyond canonical', () => {
    assert.deepStrictEqual(getCanonicalRelationshipTypes(), CANONICAL_RELATIONSHIP_TYPES);
  });

  it('should not infer relationships', () => {
    const graph = composeCurriculumGraph(VALID_INPUT);
    // Edges should match exactly what was provided
    assert.strictEqual(graph.edges.length, VALID_INPUT.edges.length);
    for (let i = 0; i < graph.edges.length; i++) {
      assert.strictEqual(graph.edges[i].edgeId, VALID_INPUT.edges[i].edgeId);
    }
  });
});

// ---------------------------------------------------------------------------
// No Inferred Relationships Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — No Inferred Relationships', () => {
  it('should not add edges not present in input', () => {
    const input: CurriculumGraphInput = {
      graphId: 'graph-no-infer',
      graphLabel: 'No Infer Test',
      nodes: [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3],
      edges: [VALID_EDGE_1],
    };
    const graph = composeCurriculumGraph(input);
    assert.strictEqual(graph.edges.length, 1);
    assert.strictEqual(graph.edges[0].edgeId, 'edge-001');
  });
});

// ---------------------------------------------------------------------------
// Self-Reference Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Self Reference', () => {
  it('should detect self-referencing edge', () => {
    const selfRefEdge: CurriculumEdge = {
      edgeId: 'edge-self',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-001',
      relationshipType: 'contains',
      referenceId: 'ref-self',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Self-referencing edge.',
      providedBy: 'curriculum-board',
    };
    const nodeIds = ['node-001'];
    const errors = validateCurriculumEdge(selfRefEdge, nodeIds);
    const selfRefError = errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_SELF_REFERENCE,
    );
    assert.ok(selfRefError, 'Should have CURRICULUM_SELF_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Reference Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Invalid Reference', () => {
  it('should detect edge referencing non-existent node', () => {
    const badEdge: CurriculumEdge = {
      edgeId: 'edge-bad-ref',
      sourceNodeId: 'node-999',
      targetNodeId: 'node-001',
      relationshipType: 'contains',
      referenceId: 'ref-bad',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Bad reference.',
      providedBy: 'curriculum-board',
    };
    const errors = validateCurriculumEdge(badEdge, ['node-001']);
    const refError = errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_EDGE_REFERENCES_MISSING_NODE,
    );
    assert.ok(refError, 'Should have CURRICULUM_EDGE_REFERENCES_MISSING_NODE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Status Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Invalid Status', () => {
  it('should detect invalid governance status on node', () => {
    const node: CurriculumNode = {
      nodeId: 'node-bad-status',
      nodeType: 'lesson',
      referenceId: 'ref-bs',
      source: 'governance-committee',
      governanceStatus: 'invalid_status' as CurriculumGovernanceStatus,
      rationale: 'Bad status.',
      providedBy: 'curriculum-board',
    };
    const errors = validateCurriculumNode(node);
    const statusError = errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_INVALID_GOVERNANCE_STATUS,
    );
    assert.ok(statusError, 'Should have CURRICULUM_INVALID_GOVERNANCE_STATUS error');
  });
});

// ---------------------------------------------------------------------------
// Helper Functions Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Helper Functions', () => {
  it('isSupportedNodeType should return true for valid types', () => {
    assert.strictEqual(isSupportedNodeType('learning_path'), true);
    assert.strictEqual(isSupportedNodeType('module'), true);
    assert.strictEqual(isSupportedNodeType('lesson'), true);
    assert.strictEqual(isSupportedNodeType('concept'), true);
    assert.strictEqual(isSupportedNodeType('competency'), true);
    assert.strictEqual(isSupportedNodeType('assessment'), true);
    assert.strictEqual(isSupportedNodeType('laboratory'), true);
    assert.strictEqual(isSupportedNodeType('review'), true);
    assert.strictEqual(isSupportedNodeType('milestone'), true);
    assert.strictEqual(isSupportedNodeType('capstone'), true);
  });

  it('isSupportedNodeType should return false for invalid types', () => {
    assert.strictEqual(isSupportedNodeType('invalid'), false);
    assert.strictEqual(isSupportedNodeType(''), false);
    assert.strictEqual(isSupportedNodeType('topic'), false);
  });

  it('isSupportedRelationshipType should return true for valid types', () => {
    assert.strictEqual(isSupportedRelationshipType('contains'), true);
    assert.strictEqual(isSupportedRelationshipType('depends_on'), true);
    assert.strictEqual(isSupportedRelationshipType('requires'), true);
    assert.strictEqual(isSupportedRelationshipType('introduces'), true);
    assert.strictEqual(isSupportedRelationshipType('reinforces'), true);
    assert.strictEqual(isSupportedRelationshipType('assesses'), true);
    assert.strictEqual(isSupportedRelationshipType('applies'), true);
    assert.strictEqual(isSupportedRelationshipType('reviews'), true);
    assert.strictEqual(isSupportedRelationshipType('precedes'), true);
    assert.strictEqual(isSupportedRelationshipType('maps_to'), true);
  });

  it('isSupportedRelationshipType should return false for invalid types', () => {
    assert.strictEqual(isSupportedRelationshipType('invalid'), false);
    assert.strictEqual(isSupportedRelationshipType(''), false);
    assert.strictEqual(isSupportedRelationshipType('flows_to'), false);
  });

  it('isSupportedGovernanceStatus should return true for valid statuses', () => {
    assert.strictEqual(isSupportedGovernanceStatus('canonical'), true);
    assert.strictEqual(isSupportedGovernanceStatus('accepted'), true);
    assert.strictEqual(isSupportedGovernanceStatus('provisional'), true);
    assert.strictEqual(isSupportedGovernanceStatus('deprecated'), true);
    assert.strictEqual(isSupportedGovernanceStatus('rejected'), true);
  });

  it('isSupportedGovernanceStatus should return false for invalid statuses', () => {
    assert.strictEqual(isSupportedGovernanceStatus('invalid'), false);
    assert.strictEqual(isSupportedGovernanceStatus(''), false);
  });

  it('getCanonicalNodeTypes should return all canonical types', () => {
    const types = getCanonicalNodeTypes();
    assert.strictEqual(types.length, 10);
    assert.deepStrictEqual(types, CANONICAL_NODE_TYPES);
  });

  it('getCanonicalRelationshipTypes should return all canonical types', () => {
    const types = getCanonicalRelationshipTypes();
    assert.strictEqual(types.length, 10);
    assert.deepStrictEqual(types, CANONICAL_RELATIONSHIP_TYPES);
  });

  it('getCanonicalGovernanceStatuses should return all canonical statuses', () => {
    const statuses = getCanonicalGovernanceStatuses();
    assert.strictEqual(statuses.length, 5);
    assert.deepStrictEqual(statuses, CANONICAL_GOVERNANCE_STATUSES);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Provenance', () => {
  it('should compose node provenance', () => {
    const prov = composeNodeProvenance(VALID_NODE_1);
    assert.strictEqual(prov.nodeId, VALID_NODE_1.nodeId);
    assert.strictEqual(prov.nodeType, VALID_NODE_1.nodeType);
    assert.strictEqual(prov.referenceId, VALID_NODE_1.referenceId);
    assert.strictEqual(prov.source, VALID_NODE_1.source);
    assert.strictEqual(prov.governanceStatus, VALID_NODE_1.governanceStatus);
    assert.strictEqual(prov.rationale, VALID_NODE_1.rationale);
    assert.strictEqual(prov.providedBy, VALID_NODE_1.providedBy);
  });

  it('should compose edge provenance', () => {
    const prov = composeEdgeProvenance(VALID_EDGE_1);
    assert.strictEqual(prov.edgeId, VALID_EDGE_1.edgeId);
    assert.strictEqual(prov.relationshipType, VALID_EDGE_1.relationshipType);
    assert.strictEqual(prov.referenceId, VALID_EDGE_1.referenceId);
    assert.strictEqual(prov.source, VALID_EDGE_1.source);
    assert.strictEqual(prov.governanceStatus, VALID_EDGE_1.governanceStatus);
    assert.strictEqual(prov.rationale, VALID_EDGE_1.rationale);
    assert.strictEqual(prov.providedBy, VALID_EDGE_1.providedBy);
  });

  it('should compose legacy provenance from node', () => {
    const prov = composeCurriculumProvenance(VALID_NODE_1);
    assert.strictEqual(prov.nodeId, VALID_NODE_1.nodeId);
    assert.strictEqual(prov.nodeType, VALID_NODE_1.nodeType);
  });
});

// ---------------------------------------------------------------------------
// Trace Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Trace', () => {
  it('should compose a trace with correct counts', () => {
    const trace = composeCurriculumTrace(
      'graph-001',
      [VALID_NODE_1, VALID_NODE_2],
      [VALID_EDGE_1],
    );
    assert.strictEqual(trace.graphId, 'graph-001');
    assert.strictEqual(trace.nodeCount, 2);
    assert.strictEqual(trace.edgeCount, 1);
    assert.strictEqual(trace.decisionsCount, 2);
    assert.strictEqual(trace.validatedCount, 2);
    assert.strictEqual(trace.invalidCount, 0);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
  });

  it('should identify invalid nodes in trace', () => {
    const invalidNode: CurriculumNode = {
      nodeId: '',
      nodeType: 'lesson',
      referenceId: '',
      source: '',
      governanceStatus: 'canonical',
      rationale: '',
      providedBy: '',
    };
    const trace = composeCurriculumTrace('graph-bad', [invalidNode], []);
    assert.strictEqual(trace.invalidCount, 1);
    assert.strictEqual(trace.validatedCount, 0);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Metadata Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Deterministic Metadata', () => {
  it('graph should have deterministic metadata', () => {
    const graph = composeCurriculumGraph(VALID_INPUT);
    assert.strictEqual(graph.deterministic, true);
    assert.strictEqual(graph.generatedFrom, 'deterministic_curriculum_graph_kernel');
    assert.strictEqual(graph.randomUsed, false);
    assert.strictEqual(graph.timeDependency, false);
  });

  it('registry should have deterministic metadata', () => {
    const graph = composeCurriculumGraph(VALID_INPUT);
    const registry = composeCurriculumRegistry('reg-001', [graph]);
    assert.strictEqual(registry.deterministic, true);
    assert.strictEqual(registry.generatedFrom, 'deterministic_curriculum_graph_kernel');
    assert.strictEqual(registry.randomUsed, false);
    assert.strictEqual(registry.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Input Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Input Validation', () => {
  it('should validate valid input with no errors', () => {
    const errors = validateCurriculumInput(VALID_INPUT);
    assert.deepStrictEqual(errors, []);
  });

  it('should detect missing graph ID in input', () => {
    const input: CurriculumGraphInput = {
      graphId: '',
      graphLabel: 'Test',
      nodes: [VALID_NODE_1],
      edges: [],
    };
    const errors = validateCurriculumInput(input);
    const idError = errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_GRAPH_ID,
    );
    assert.ok(idError, 'Should have CURRICULUM_MISSING_GRAPH_ID error');
  });

  it('should detect missing graph label in input', () => {
    const input: CurriculumGraphInput = {
      graphId: 'graph-001',
      graphLabel: '',
      nodes: [VALID_NODE_1],
      edges: [],
    };
    const errors = validateCurriculumInput(input);
    const labelError = errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_PROVENANCE,
    );
    assert.ok(labelError, 'Should have CURRICULUM_MISSING_PROVENANCE error');
  });

  it('should detect empty nodes in input', () => {
    const input: CurriculumGraphInput = {
      graphId: 'graph-001',
      graphLabel: 'Test',
      nodes: [],
      edges: [],
    };
    const errors = validateCurriculumInput(input);
    const emptyError = errors.find(
      (e) => e.code === CURRICULUM_VALIDATION_CODES.CURRICULUM_EMPTY_GRAPH,
    );
    assert.ok(emptyError, 'Should have CURRICULUM_EMPTY_GRAPH error');
  });
});

// ---------------------------------------------------------------------------
// Artifact Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Artifact Validation', () => {
  it('should compose and validate a valid artifact', () => {
    const graph = composeCurriculumGraph(VALID_INPUT);
    const trace = composeCurriculumTrace('graph-001', graph.nodes, graph.edges);
    const validation = validateCurriculumGraph(graph);
    const artifact = composeCurriculumArtifact('art-001', graph, trace, validation);
    const result = validateCurriculumArtifact(artifact);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enums Complete Tests
// ---------------------------------------------------------------------------

describe('Curriculum Graph Kernel — Canonical Enums Complete', () => {
  it('should have exactly 10 canonical node types', () => {
    assert.strictEqual(CANONICAL_NODE_TYPES.length, 10);
  });

  it('should have exactly 10 canonical relationship types', () => {
    assert.strictEqual(CANONICAL_RELATIONSHIP_TYPES.length, 10);
  });

  it('should have exactly 5 canonical governance statuses', () => {
    assert.strictEqual(CANONICAL_GOVERNANCE_STATUSES.length, 5);
  });

  it('should contain all required node types', () => {
    const required = [
      'learning_path',
      'module',
      'lesson',
      'concept',
      'competency',
      'assessment',
      'laboratory',
      'review',
      'milestone',
      'capstone',
    ];
    for (const type of required) {
      assert.ok(
        CANONICAL_NODE_TYPES.includes(type as typeof CANONICAL_NODE_TYPES[number]),
        `Missing node type: ${type}`,
      );
    }
  });

  it('should contain all required relationship types', () => {
    const required = [
      'contains',
      'depends_on',
      'requires',
      'introduces',
      'reinforces',
      'assesses',
      'applies',
      'reviews',
      'precedes',
      'maps_to',
    ];
    for (const type of required) {
      assert.ok(
        CANONICAL_RELATIONSHIP_TYPES.includes(type as CurriculumRelationshipType),
        `Missing relationship type: ${type}`,
      );
    }
  });
});
