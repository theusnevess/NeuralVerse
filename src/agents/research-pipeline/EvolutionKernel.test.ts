/**
 * NV-1400-D2-OPT-08 — Scientific Evolution Mapping Orchestration Test Suite
 *
 * Comprehensive tests for the evolution kernel.
 * Covers: valid evolution graph, valid registry, duplicate node,
 * duplicate edge, unsupported relation, self reference, cycle detection,
 * orphan node, missing provenance, invalid reference, empty graph,
 * empty registry, deterministic ordering, immutable input,
 * identical output, no inferred evolution, no generated content.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeEvolutionNode,
  composeEvolutionEdge,
  composeEvolutionProvenance,
  composeEvolutionGraph,
  composeEvolutionRegistry,
  composeResearchEvolution,
  composeEvolutionTrace,
  detectEvolutionCycles,
  isSupportedEvolutionRelationType,
  isSupportedEvolutionNodeType,
  getCanonicalEvolutionRelationTypes,
  getCanonicalEvolutionNodeTypes,
} from './EvolutionKernel.ts';

import {
  validateEvolutionNode,
  validateEvolutionEdge,
  validateEvolutionGraph,
  validateEvolutionRegistry,
  validateResearchArtifactWithEvolution,
  validateEvolutionInput,
  EVOLUTION_VALIDATION_CODES,
} from './EvolutionValidation.ts';

import type {
  ResearchEvolutionNode,
  ResearchEvolutionEdge,
  ResearchEvolutionInput,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_NODE_1: ResearchEvolutionNode = {
  nodeId: 'node-001',
  nodeType: 'method',
  title: 'Convolutional Neural Networks',
  referenceId: 'ref-001',
  governanceStatus: 'canonical',
  rationale: 'Foundational architecture for image processing.',
};

const VALID_NODE_2: ResearchEvolutionNode = {
  nodeId: 'node-002',
  nodeType: 'method',
  title: 'ResNet',
  referenceId: 'ref-002',
  governanceStatus: 'canonical',
  rationale: 'Extended CNNs with residual connections.',
};

const VALID_NODE_3: ResearchEvolutionNode = {
  nodeId: 'node-003',
  nodeType: 'method',
  title: 'Transformer',
  referenceId: 'ref-003',
  governanceStatus: 'canonical',
  rationale: 'Introduced attention mechanism.',
};

const VALID_PROVENANCE_1 = {
  edgeId: 'edge-001',
  referenceId: 'ref-002',
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  relationType: 'extended' as const,
  rationale: 'ResNet extended CNNs with residual connections.',
  providedBy: 'research-agent',
};

const VALID_PROVENANCE_2 = {
  edgeId: 'edge-002',
  referenceId: 'ref-003',
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  relationType: 'introduced' as const,
  rationale: 'Transformer introduced attention mechanism.',
  providedBy: 'research-agent',
};

const VALID_EDGE_1: ResearchEvolutionEdge = {
  edgeId: 'edge-001',
  sourceNodeId: 'node-001',
  targetNodeId: 'node-002',
  relationType: 'extended',
  referenceId: 'ref-002',
  governanceStatus: 'canonical',
  rationale: 'ResNet extended CNNs.',
  providedBy: 'research-agent',
  provenance: VALID_PROVENANCE_1,
};

const VALID_EDGE_2: ResearchEvolutionEdge = {
  edgeId: 'edge-002',
  sourceNodeId: 'node-001',
  targetNodeId: 'node-003',
  relationType: 'inspired',
  referenceId: 'ref-003',
  governanceStatus: 'canonical',
  rationale: 'CNNs inspired Transformer development.',
  providedBy: 'research-agent',
  provenance: VALID_PROVENANCE_2,
};

// ---------------------------------------------------------------------------
// Valid Evolution Graph Tests
// ---------------------------------------------------------------------------

describe('composeEvolutionGraph', () => {
  it('should compose a valid evolution graph', () => {
    const graph = composeEvolutionGraph('graph-001', [VALID_NODE_1, VALID_NODE_2], [VALID_EDGE_1]);

    assert.equal(graph.graphId, 'graph-001');
    assert.equal(graph.nodes.length, 2);
    assert.equal(graph.edges.length, 1);
    assert.equal(graph.deterministic, true);
    assert.equal(graph.randomUsed, false);
    assert.equal(graph.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Valid Registry Tests
// ---------------------------------------------------------------------------

describe('composeEvolutionRegistry', () => {
  it('should compose a valid evolution registry', () => {
    const graph1 = composeEvolutionGraph('graph-001', [VALID_NODE_1], []);
    const graph2 = composeEvolutionGraph('graph-002', [VALID_NODE_2], []);
    const registry = composeEvolutionRegistry('registry-001', [graph1, graph2]);

    assert.equal(registry.registryId, 'registry-001');
    assert.equal(registry.graphs.length, 2);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Node Tests
// ---------------------------------------------------------------------------

describe('duplicate node validation', () => {
  it('should detect duplicate node IDs', () => {
    const graph = composeEvolutionGraph('graph-001', [
      VALID_NODE_1,
      { ...VALID_NODE_1, nodeId: 'node-001' },
    ], []);

    const errors = validateEvolutionGraph(graph);
    const duplicateError = errors.find((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_NODE);

    assert.ok(duplicateError, 'Should have EVOLUTION_DUPLICATE_NODE error');
  });

  it('should not flag unique node IDs as duplicates', () => {
    const graph = composeEvolutionGraph('graph-001', [VALID_NODE_1, VALID_NODE_2], []);
    const errors = validateEvolutionGraph(graph);
    const duplicateErrors = errors.filter((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_NODE);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Edge Tests
// ---------------------------------------------------------------------------

describe('duplicate edge validation', () => {
  it('should detect duplicate edge IDs', () => {
    const graph = composeEvolutionGraph('graph-001', [VALID_NODE_1, VALID_NODE_2], [
      VALID_EDGE_1,
      { ...VALID_EDGE_1, edgeId: 'edge-001' },
    ]);

    const errors = validateEvolutionGraph(graph);
    const duplicateError = errors.find((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_EDGE);

    assert.ok(duplicateError, 'Should have EVOLUTION_DUPLICATE_EDGE error');
  });

  it('should not flag unique edge IDs as duplicates', () => {
    const graph = composeEvolutionGraph('graph-001', [VALID_NODE_1, VALID_NODE_2], [VALID_EDGE_1, VALID_EDGE_2]);
    const errors = validateEvolutionGraph(graph);
    const duplicateErrors = errors.filter((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_EDGE);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate edge errors');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Relation Tests
// ---------------------------------------------------------------------------

describe('unsupported relation validation', () => {
  it('should detect unsupported relation type', () => {
    const edge: ResearchEvolutionEdge = {
      ...VALID_EDGE_1,
      relationType: 'unsupported_relation' as any,
    };

    const errors = validateEvolutionEdge(edge, [VALID_NODE_1, VALID_NODE_2]);
    const unsupportedError = errors.find((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_UNKNOWN_RELATION);

    assert.ok(unsupportedError, 'Should have EVOLUTION_UNKNOWN_RELATION error');
  });

  it('should support all canonical relation types', () => {
    const relations = getCanonicalEvolutionRelationTypes();
    assert.equal(relations.length, 12);
    assert.ok(relations.includes('introduced'));
    assert.ok(relations.includes('extended'));
    assert.ok(relations.includes('refined'));
    assert.ok(relations.includes('generalized'));
    assert.ok(relations.includes('specialized'));
    assert.ok(relations.includes('superseded'));
    assert.ok(relations.includes('replaced'));
    assert.ok(relations.includes('merged_into'));
    assert.ok(relations.includes('split_from'));
    assert.ok(relations.includes('inspired'));
    assert.ok(relations.includes('standardized'));
    assert.ok(relations.includes('deprecated'));
  });

  it('should correctly identify supported relation types', () => {
    assert.equal(isSupportedEvolutionRelationType('introduced'), true);
    assert.equal(isSupportedEvolutionRelationType('extended'), true);
    assert.equal(isSupportedEvolutionRelationType('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Unsupported Node Type Tests
// ---------------------------------------------------------------------------

describe('unsupported node type validation', () => {
  it('should detect unsupported node type', () => {
    const node: ResearchEvolutionNode = {
      ...VALID_NODE_1,
      nodeType: 'unsupported_type' as any,
    };

    const errors = validateEvolutionNode(node);
    const unsupportedError = errors.find((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_REFERENCE);

    assert.ok(unsupportedError, 'Should have EVOLUTION_INVALID_REFERENCE error');
  });

  it('should support all canonical node types', () => {
    const nodeTypes = getCanonicalEvolutionNodeTypes();
    assert.equal(nodeTypes.length, 6);
    assert.ok(nodeTypes.includes('method'));
    assert.ok(nodeTypes.includes('concept'));
    assert.ok(nodeTypes.includes('benchmark'));
    assert.ok(nodeTypes.includes('dataset'));
    assert.ok(nodeTypes.includes('milestone'));
    assert.ok(nodeTypes.includes('publication'));
  });

  it('should correctly identify supported node types', () => {
    assert.equal(isSupportedEvolutionNodeType('method'), true);
    assert.equal(isSupportedEvolutionNodeType('concept'), true);
    assert.equal(isSupportedEvolutionNodeType('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Self Reference Tests
// ---------------------------------------------------------------------------

describe('self reference validation', () => {
  it('should detect self reference', () => {
    const edge: ResearchEvolutionEdge = {
      ...VALID_EDGE_1,
      targetNodeId: 'node-001',
    };

    const errors = validateEvolutionEdge(edge, [VALID_NODE_1]);
    const selfRefError = errors.find((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_SELF_REFERENCE);

    assert.ok(selfRefError, 'Should have EVOLUTION_SELF_REFERENCE error');
  });

  it('should not flag valid edges as self references', () => {
    const errors = validateEvolutionEdge(VALID_EDGE_1, [VALID_NODE_1, VALID_NODE_2]);
    const selfRefErrors = errors.filter((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_SELF_REFERENCE);

    assert.equal(selfRefErrors.length, 0, 'Should not have self reference errors');
  });
});

// ---------------------------------------------------------------------------
// Cycle Detection Tests
// ---------------------------------------------------------------------------

describe('cycle detection', () => {
  it('should detect a simple cycle', () => {
    const nodes: ResearchEvolutionNode[] = [
      { nodeId: 'node-001', nodeType: 'method', title: 'A', referenceId: 'ref-001', governanceStatus: 'canonical', rationale: 'Test' },
      { nodeId: 'node-002', nodeType: 'method', title: 'B', referenceId: 'ref-002', governanceStatus: 'canonical', rationale: 'Test' },
    ];

    const edges: ResearchEvolutionEdge[] = [
      { edgeId: 'edge-001', sourceNodeId: 'node-001', targetNodeId: 'node-002', relationType: 'extended', referenceId: 'ref-001', governanceStatus: 'canonical', rationale: 'Test', providedBy: 'test', provenance: { edgeId: 'edge-001', referenceId: 'ref-001', source: 'test', governanceStatus: 'canonical', relationType: 'extended', rationale: 'Test', providedBy: 'test' } },
      { edgeId: 'edge-002', sourceNodeId: 'node-002', targetNodeId: 'node-001', relationType: 'extended', referenceId: 'ref-002', governanceStatus: 'canonical', rationale: 'Test', providedBy: 'test', provenance: { edgeId: 'edge-002', referenceId: 'ref-002', source: 'test', governanceStatus: 'canonical', relationType: 'extended', rationale: 'Test', providedBy: 'test' } },
    ];

    const hasCycles = detectEvolutionCycles(nodes, edges);
    assert.equal(hasCycles, true, 'Should detect cycle');
  });

  it('should detect a longer cycle', () => {
    const nodes: ResearchEvolutionNode[] = [
      { nodeId: 'node-001', nodeType: 'method', title: 'A', referenceId: 'ref-001', governanceStatus: 'canonical', rationale: 'Test' },
      { nodeId: 'node-002', nodeType: 'method', title: 'B', referenceId: 'ref-002', governanceStatus: 'canonical', rationale: 'Test' },
      { nodeId: 'node-003', nodeType: 'method', title: 'C', referenceId: 'ref-003', governanceStatus: 'canonical', rationale: 'Test' },
    ];

    const edges: ResearchEvolutionEdge[] = [
      { edgeId: 'edge-001', sourceNodeId: 'node-001', targetNodeId: 'node-002', relationType: 'extended', referenceId: 'ref-001', governanceStatus: 'canonical', rationale: 'Test', providedBy: 'test', provenance: { edgeId: 'edge-001', referenceId: 'ref-001', source: 'test', governanceStatus: 'canonical', relationType: 'extended', rationale: 'Test', providedBy: 'test' } },
      { edgeId: 'edge-002', sourceNodeId: 'node-002', targetNodeId: 'node-003', relationType: 'extended', referenceId: 'ref-002', governanceStatus: 'canonical', rationale: 'Test', providedBy: 'test', provenance: { edgeId: 'edge-002', referenceId: 'ref-002', source: 'test', governanceStatus: 'canonical', relationType: 'extended', rationale: 'Test', providedBy: 'test' } },
      { edgeId: 'edge-003', sourceNodeId: 'node-003', targetNodeId: 'node-001', relationType: 'extended', referenceId: 'ref-003', governanceStatus: 'canonical', rationale: 'Test', providedBy: 'test', provenance: { edgeId: 'edge-003', referenceId: 'ref-003', source: 'test', governanceStatus: 'canonical', relationType: 'extended', rationale: 'Test', providedBy: 'test' } },
    ];

    const hasCycles = detectEvolutionCycles(nodes, edges);
    assert.equal(hasCycles, true, 'Should detect longer cycle');
  });

  it('should not flag acyclic graphs', () => {
    const nodes: ResearchEvolutionNode[] = [
      { nodeId: 'node-001', nodeType: 'method', title: 'A', referenceId: 'ref-001', governanceStatus: 'canonical', rationale: 'Test' },
      { nodeId: 'node-002', nodeType: 'method', title: 'B', referenceId: 'ref-002', governanceStatus: 'canonical', rationale: 'Test' },
      { nodeId: 'node-003', nodeType: 'method', title: 'C', referenceId: 'ref-003', governanceStatus: 'canonical', rationale: 'Test' },
    ];

    const edges: ResearchEvolutionEdge[] = [
      { edgeId: 'edge-001', sourceNodeId: 'node-001', targetNodeId: 'node-002', relationType: 'extended', referenceId: 'ref-001', governanceStatus: 'canonical', rationale: 'Test', providedBy: 'test', provenance: { edgeId: 'edge-001', referenceId: 'ref-001', source: 'test', governanceStatus: 'canonical', relationType: 'extended', rationale: 'Test', providedBy: 'test' } },
      { edgeId: 'edge-002', sourceNodeId: 'node-002', targetNodeId: 'node-003', relationType: 'extended', referenceId: 'ref-002', governanceStatus: 'canonical', rationale: 'Test', providedBy: 'test', provenance: { edgeId: 'edge-002', referenceId: 'ref-002', source: 'test', governanceStatus: 'canonical', relationType: 'extended', rationale: 'Test', providedBy: 'test' } },
    ];

    const hasCycles = detectEvolutionCycles(nodes, edges);
    assert.equal(hasCycles, false, 'Should not detect cycle in acyclic graph');
  });
});

// ---------------------------------------------------------------------------
// Orphan Node Tests
// ---------------------------------------------------------------------------

describe('orphan node validation', () => {
  it('should detect orphan nodes', () => {
    const graph = composeEvolutionGraph('graph-001', [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3], [VALID_EDGE_1]);

    const errors = validateEvolutionGraph(graph);
    const orphanError = errors.find((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_ORPHAN_NODE);

    assert.ok(orphanError, 'Should have EVOLUTION_ORPHAN_NODE error');
  });

  it('should not flag nodes with edges', () => {
    const graph = composeEvolutionGraph('graph-001', [VALID_NODE_1, VALID_NODE_2], [VALID_EDGE_1]);
    const errors = validateEvolutionGraph(graph);
    const orphanErrors = errors.filter((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_ORPHAN_NODE);

    assert.equal(orphanErrors.length, 0, 'Should not have orphan errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('missing provenance validation', () => {
  it('should detect missing provenance', () => {
    const edge: ResearchEvolutionEdge = {
      ...VALID_EDGE_1,
      provenance: null as any,
    };

    const errors = validateEvolutionEdge(edge, [VALID_NODE_1, VALID_NODE_2]);
    const provenanceError = errors.find((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have EVOLUTION_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const edge: ResearchEvolutionEdge = {
      ...VALID_EDGE_1,
      provenance: {
        ...VALID_PROVENANCE_1,
        rationale: '',
      },
    };

    const errors = validateEvolutionEdge(edge, [VALID_NODE_1, VALID_NODE_2]);
    const provenanceError = errors.find((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have EVOLUTION_MISSING_PROVENANCE error');
  });

  it('should not flag valid provenance', () => {
    const errors = validateEvolutionEdge(VALID_EDGE_1, [VALID_NODE_1, VALID_NODE_2]);
    const provenanceErrors = errors.filter((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE);

    assert.equal(provenanceErrors.length, 0, 'Should not have provenance errors');
  });
});

// ---------------------------------------------------------------------------
// Invalid Reference Tests
// ---------------------------------------------------------------------------

describe('invalid reference validation', () => {
  it('should detect invalid source node reference', () => {
    const edge: ResearchEvolutionEdge = {
      ...VALID_EDGE_1,
      sourceNodeId: 'non-existent-node',
    };

    const errors = validateEvolutionEdge(edge, [VALID_NODE_1, VALID_NODE_2]);
    const refError = errors.find((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_REFERENCE);

    assert.ok(refError, 'Should have EVOLUTION_INVALID_REFERENCE error');
  });

  it('should detect invalid target node reference', () => {
    const edge: ResearchEvolutionEdge = {
      ...VALID_EDGE_1,
      targetNodeId: 'non-existent-node',
    };

    const errors = validateEvolutionEdge(edge, [VALID_NODE_1, VALID_NODE_2]);
    const refError = errors.find((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_REFERENCE);

    assert.ok(refError, 'Should have EVOLUTION_INVALID_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Empty Graph Tests
// ---------------------------------------------------------------------------

describe('empty graph validation', () => {
  it('should detect empty graph', () => {
    const graph = composeEvolutionGraph('graph-001', [], []);
    const errors = validateEvolutionGraph(graph);
    const emptyErrors = errors.filter((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_GRAPH);

    assert.ok(emptyErrors.length > 0, 'Should have EVOLUTION_EMPTY_GRAPH errors');
  });

  it('should not flag non-empty graph', () => {
    const graph = composeEvolutionGraph('graph-001', [VALID_NODE_1], []);
    const errors = validateEvolutionGraph(graph);
    const emptyErrors = errors.filter((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_GRAPH);

    assert.equal(emptyErrors.length, 0, 'Should not have empty graph errors');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('empty registry validation', () => {
  it('should detect empty registry', () => {
    const registry = composeEvolutionRegistry('registry-001', []);
    const errors = validateEvolutionRegistry(registry);
    const emptyErrors = errors.filter((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_REGISTRY);

    assert.ok(emptyErrors.length > 0, 'Should have EVOLUTION_EMPTY_REGISTRY errors');
  });

  it('should not flag non-empty registry', () => {
    const graph = composeEvolutionGraph('graph-001', [VALID_NODE_1], []);
    const registry = composeEvolutionRegistry('registry-001', [graph]);
    const errors = validateEvolutionRegistry(registry);
    const emptyErrors = errors.filter((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_REGISTRY);

    assert.equal(emptyErrors.length, 0, 'Should not have empty registry errors');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('deterministic ordering', () => {
  it('should sort graphs deterministically by ID', () => {
    const graph1 = composeEvolutionGraph('graph-001', [VALID_NODE_1], []);
    const graph2 = composeEvolutionGraph('graph-002', [VALID_NODE_2], []);
    const registry = composeEvolutionRegistry('registry-001', [graph2, graph1]);

    assert.equal(registry.graphs[0].graphId, 'graph-001');
    assert.equal(registry.graphs[1].graphId, 'graph-002');
  });

  it('should produce identical ordering for identical input', () => {
    const input: ResearchEvolutionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Evolution',
      nodes: [VALID_NODE_2, VALID_NODE_1],
      edges: [VALID_EDGE_1],
    };

    const output1 = composeResearchEvolution(input);
    const output2 = composeResearchEvolution(input);

    assert.deepEqual(output1.evolutionGraph.nodes, output2.evolutionGraph.nodes);
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('immutable input', () => {
  it('should not mutate input nodes', () => {
    const input: ResearchEvolutionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Evolution',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const originalTitle = VALID_NODE_1.title;

    composeResearchEvolution(input);

    assert.equal(VALID_NODE_1.title, originalTitle);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('identical output', () => {
  it('should produce identical graphs', () => {
    const input: ResearchEvolutionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Evolution',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const artifact1 = composeResearchEvolution(input);
    const artifact2 = composeResearchEvolution(input);

    assert.deepEqual(artifact1.evolutionGraph, artifact2.evolutionGraph);
  });

  it('should produce identical traces', () => {
    const input: ResearchEvolutionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Evolution',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const artifact1 = composeResearchEvolution(input);
    const artifact2 = composeResearchEvolution(input);

    assert.deepEqual(artifact1.evolutionTrace, artifact2.evolutionTrace);
  });
});

// ---------------------------------------------------------------------------
// No Inferred Evolution Tests
// ---------------------------------------------------------------------------

describe('no inferred evolution', () => {
  it('should not infer evolution relationships', () => {
    const input: ResearchEvolutionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Evolution',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const artifact = composeResearchEvolution(input);

    // Should not have inference fields
    assert.ok(!('inferredEdges' in artifact), 'Should not have inferredEdges field');
    assert.ok(!('inferredNodes' in artifact), 'Should not have inferredNodes field');
    assert.ok(!('discoveredRelations' in artifact), 'Should not have discoveredRelations field');
  });
});

// ---------------------------------------------------------------------------
// No Generated Content Tests
// ---------------------------------------------------------------------------

describe('no generated content', () => {
  it('should not generate educational content', () => {
    const input: ResearchEvolutionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Evolution',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const artifact = composeResearchEvolution(input);

    // Evolution metadata should only contain input data, not generated summaries
    for (const node of artifact.evolutionGraph.nodes) {
      assert.ok(!node.title.includes('generated'));
      assert.ok(!node.title.includes('synthesized'));
    }
  });
});

// ---------------------------------------------------------------------------
// Additional Negative Tests
// ---------------------------------------------------------------------------

describe('additional negative tests', () => {
  it('should validate complete artifact', () => {
    const input: ResearchEvolutionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Evolution',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const artifact = composeResearchEvolution(input);
    const result = validateResearchArtifactWithEvolution(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate evolution input', () => {
    const input: ResearchEvolutionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Evolution',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const errors = validateEvolutionInput(input);
    assert.equal(errors.length, 0);
  });

  it('should detect missing concept ID in input', () => {
    const input: ResearchEvolutionInput = {
      conceptId: '',
      conceptLabel: 'Evolution',
      nodes: [VALID_NODE_1],
      edges: [],
    };

    const errors = validateEvolutionInput(input);
    const conceptError = errors.find((e) => e.field === 'conceptId');

    assert.ok(conceptError, 'Should have conceptId error');
  });

  it('should detect missing concept label in input', () => {
    const input: ResearchEvolutionInput = {
      conceptId: 'concept-001',
      conceptLabel: '',
      nodes: [VALID_NODE_1],
      edges: [],
    };

    const errors = validateEvolutionInput(input);
    const labelError = errors.find((e) => e.field === 'conceptLabel');

    assert.ok(labelError, 'Should have conceptLabel error');
  });

  it('should detect missing nodes in input', () => {
    const input: ResearchEvolutionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Evolution',
      nodes: [],
      edges: [],
    };

    const errors = validateEvolutionInput(input);
    const nodesError = errors.find((e) => e.field === 'nodes');

    assert.ok(nodesError, 'Should have nodes error');
  });

  it('should compose evolution provenance correctly', () => {
    const provenance = composeEvolutionProvenance(
      'edge-001',
      'ref-001',
      'research-agent',
      'canonical',
      'extended',
      'Test rationale.',
      'research-agent',
    );

    assert.equal(provenance.edgeId, 'edge-001');
    assert.equal(provenance.referenceId, 'ref-001');
    assert.equal(provenance.source, 'research-agent');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.relationType, 'extended');
    assert.equal(provenance.rationale, 'Test rationale.');
    assert.equal(provenance.providedBy, 'research-agent');
  });

  it('should compose evolution node correctly', () => {
    const node = composeEvolutionNode(
      'node-001',
      'method',
      'Test Method',
      'ref-001',
      'canonical',
      'Test rationale.',
    );

    assert.equal(node.nodeId, 'node-001');
    assert.equal(node.nodeType, 'method');
    assert.equal(node.title, 'Test Method');
    assert.equal(node.referenceId, 'ref-001');
    assert.equal(node.governanceStatus, 'canonical');
    assert.equal(node.rationale, 'Test rationale.');
  });

  it('should compose evolution edge correctly', () => {
    const edge = composeEvolutionEdge(
      'edge-001',
      'node-001',
      'node-002',
      'extended',
      'ref-001',
      'canonical',
      'Test rationale.',
      'research-agent',
      VALID_PROVENANCE_1,
    );

    assert.equal(edge.edgeId, 'edge-001');
    assert.equal(edge.sourceNodeId, 'node-001');
    assert.equal(edge.targetNodeId, 'node-002');
    assert.equal(edge.relationType, 'extended');
    assert.equal(edge.referenceId, 'ref-001');
    assert.equal(edge.governanceStatus, 'canonical');
    assert.equal(edge.rationale, 'Test rationale.');
    assert.equal(edge.providedBy, 'research-agent');
  });

  it('should compose evolution trace correctly', () => {
    const decisions = [
      {
        decisionId: 'decision-001',
        edgeId: 'edge-001',
        sourceNodeId: 'node-001',
        targetNodeId: 'node-002',
        relationType: 'extended' as const,
        validationPassed: true,
        validationErrors: [],
      },
    ];

    const trace = composeEvolutionTrace('trace-001', 2, 1, decisions);

    assert.equal(trace.traceId, 'trace-001');
    assert.equal(trace.nodeCount, 2);
    assert.equal(trace.edgeCount, 1);
    assert.equal(trace.decisionsCount, 1);
    assert.equal(trace.validatedCount, 1);
    assert.equal(trace.invalidCount, 0);
  });

  it('should detect invalid governance status', () => {
    const node: ResearchEvolutionNode = {
      ...VALID_NODE_1,
      governanceStatus: '' as any,
    };

    const errors = validateEvolutionNode(node);
    const statusError = errors.find((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STATUS);

    assert.ok(statusError, 'Should have EVOLUTION_INVALID_STATUS error');
  });

  it('should detect missing reference ID', () => {
    const node: ResearchEvolutionNode = {
      ...VALID_NODE_1,
      referenceId: '',
    };

    const errors = validateEvolutionNode(node);
    const refError = errors.find((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_REFERENCE);

    assert.ok(refError, 'Should have EVOLUTION_INVALID_REFERENCE error');
  });

  it('should detect missing rationale', () => {
    const node: ResearchEvolutionNode = {
      ...VALID_NODE_1,
      rationale: '',
    };

    const errors = validateEvolutionNode(node);
    const rationaleError = errors.find((e) => e.code === EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE);

    assert.ok(rationaleError, 'Should have EVOLUTION_MISSING_SOURCE error');
  });
});
