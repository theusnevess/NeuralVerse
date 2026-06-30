/**
 * NV-1400-D2-OPT-02 — Scientific Lineage Orchestration Test Suite
 *
 * Comprehensive tests for the lineage kernel.
 * Covers: valid lineage graph, valid relations, duplicate edge, self reference,
 * cycle detection, orphan node, unsupported relation, missing provenance,
 * deterministic output, immutable input, no generated content,
 * no inferred relationships, identical output for identical input.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeLineageNode,
  composeLineageEdge,
  composeLineageProvenance,
  composeLineageGraph,
  composeResearchLineage,
  composeLineageTrace,
  isSupportedRelationType,
  getCanonicalRelationTypes,
} from './LineageKernel.ts';

import {
  validateLineageNode,
  validateLineageEdge,
  validateLineageGraph,
  validateResearchArtifactWithLineage,
  validateLineageInput,
  LINEAGE_VALIDATION_CODES,
} from './LineageValidation.ts';

import type {
  ResearchLineageNode,
  ResearchLineageEdge,
  ResearchLineageGraph,
  ResearchLineageInput,
  ResearchReference,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_REFERENCE_1: ResearchReference = {
  id: 'ref-001',
  title: 'Attention Is All You Need',
  authors: ['Vaswani', 'Shazeer', 'Parmar'],
  publicationYear: 2017,
  sourceType: 'conference_paper',
  doi: '10.48550/arXiv.1706.03762',
};

const VALID_REFERENCE_2: ResearchReference = {
  id: 'ref-002',
  title: 'BERT: Pre-training of Deep Bidirectional Transformers',
  authors: ['Devlin', 'Chang', 'Lee', 'Toutanova'],
  publicationYear: 2019,
  sourceType: 'conference_paper',
  doi: '10.48550/arXiv.1810.04805',
};

const VALID_REFERENCE_3: ResearchReference = {
  id: 'ref-003',
  title: 'GPT-3: Language Models are Few-Shot Learners',
  authors: ['Brown', 'Mann', 'Ryder'],
  publicationYear: 2020,
  sourceType: 'conference_paper',
  doi: '10.48550/arXiv.2005.14165',
};

const VALID_NODE_1: ResearchLineageNode = {
  nodeId: 'node-001',
  referenceId: 'ref-001',
  title: 'Attention Is All You Need',
  sourceType: 'conference_paper',
  evidenceLevel: 'primary',
  governanceStatus: 'canonical',
};

const VALID_NODE_2: ResearchLineageNode = {
  nodeId: 'node-002',
  referenceId: 'ref-002',
  title: 'BERT: Pre-training of Deep Bidirectional Transformers',
  sourceType: 'conference_paper',
  evidenceLevel: 'primary',
  governanceStatus: 'canonical',
};

const VALID_NODE_3: ResearchLineageNode = {
  nodeId: 'node-003',
  referenceId: 'ref-003',
  title: 'GPT-3: Language Models are Few-Shot Learners',
  sourceType: 'conference_paper',
  evidenceLevel: 'primary',
  governanceStatus: 'canonical',
};

const VALID_PROVENANCE_1 = {
  sourceReferenceId: 'ref-001',
  targetReferenceId: 'ref-002',
  relationType: 'predecessor' as const,
  governanceStatus: 'canonical' as const,
  rationale: 'BERT builds upon the Transformer architecture introduced in Attention Is All You Need.',
  providedBy: 'research-agent',
};

const VALID_PROVENANCE_2 = {
  sourceReferenceId: 'ref-001',
  targetReferenceId: 'ref-003',
  relationType: 'derived_from' as const,
  governanceStatus: 'canonical' as const,
  rationale: 'GPT-3 is derived from the Transformer architecture.',
  providedBy: 'research-agent',
};

const VALID_EDGE_1: ResearchLineageEdge = {
  edgeId: 'edge-001',
  sourceNodeId: 'node-001',
  targetNodeId: 'node-002',
  relationType: 'predecessor',
  provenance: VALID_PROVENANCE_1,
  governanceStatus: 'canonical',
};

const VALID_EDGE_2: ResearchLineageEdge = {
  edgeId: 'edge-002',
  sourceNodeId: 'node-001',
  targetNodeId: 'node-003',
  relationType: 'derived_from',
  provenance: VALID_PROVENANCE_2,
  governanceStatus: 'canonical',
};

// ---------------------------------------------------------------------------
// Valid Lineage Graph Tests
// ---------------------------------------------------------------------------

describe('composeLineageGraph', () => {
  it('should compose a valid lineage graph', () => {
    const graph = composeLineageGraph('graph-001', [VALID_NODE_1, VALID_NODE_2], [VALID_EDGE_1]);

    assert.equal(graph.graphId, 'graph-001');
    assert.equal(graph.nodes.length, 2);
    assert.equal(graph.edges.length, 1);
    assert.equal(graph.deterministic, true);
    assert.equal(graph.randomUsed, false);
    assert.equal(graph.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Valid Predecessor Tests
// ---------------------------------------------------------------------------

describe('valid predecessor relation', () => {
  it('should compose a valid predecessor edge', () => {
    const provenance = composeLineageProvenance(
      'ref-001',
      'ref-002',
      'predecessor',
      'canonical',
      'BERT builds upon Transformer.',
      'research-agent',
    );

    const edge = composeLineageEdge(
      'edge-001',
      'node-001',
      'node-002',
      'predecessor',
      provenance,
      'canonical',
    );

    assert.equal(edge.relationType, 'predecessor');
    assert.equal(edge.sourceNodeId, 'node-001');
    assert.equal(edge.targetNodeId, 'node-002');
  });

  it('should validate a valid predecessor edge', () => {
    const errors = validateLineageEdge(VALID_EDGE_1, ['node-001', 'node-002']);
    assert.equal(errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Valid Successor Tests
// ---------------------------------------------------------------------------

describe('valid successor relation', () => {
  it('should compose a valid successor edge', () => {
    const provenance = composeLineageProvenance(
      'ref-002',
      'ref-001',
      'successor',
      'canonical',
      'Transformer is predecessor to BERT.',
      'research-agent',
    );

    const edge = composeLineageEdge(
      'edge-001',
      'node-002',
      'node-001',
      'successor',
      provenance,
      'canonical',
    );

    assert.equal(edge.relationType, 'successor');
    assert.equal(edge.sourceNodeId, 'node-002');
    assert.equal(edge.targetNodeId, 'node-001');
  });
});

// ---------------------------------------------------------------------------
// Valid Derived From Tests
// ---------------------------------------------------------------------------

describe('valid derived_from relation', () => {
  it('should compose a valid derived_from edge', () => {
    const provenance = composeLineageProvenance(
      'ref-001',
      'ref-003',
      'derived_from',
      'canonical',
      'GPT-3 is derived from Transformer.',
      'research-agent',
    );

    const edge = composeLineageEdge(
      'edge-001',
      'node-001',
      'node-003',
      'derived_from',
      provenance,
      'canonical',
    );

    assert.equal(edge.relationType, 'derived_from');
  });

  it('should validate a valid derived_from edge', () => {
    const errors = validateLineageEdge(VALID_EDGE_2, ['node-001', 'node-003']);
    assert.equal(errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Valid Refines Tests
// ---------------------------------------------------------------------------

describe('valid refines relation', () => {
  it('should compose a valid refines edge', () => {
    const provenance = composeLineageProvenance(
      'ref-002',
      'ref-001',
      'refines',
      'canonical',
      'BERT refines the Transformer architecture.',
      'research-agent',
    );

    const edge = composeLineageEdge(
      'edge-001',
      'node-002',
      'node-001',
      'refines',
      provenance,
      'canonical',
    );

    assert.equal(edge.relationType, 'refines');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Edge Tests
// ---------------------------------------------------------------------------

describe('duplicate edge validation', () => {
  it('should detect duplicate edges', () => {
    const graph: ResearchLineageGraph = {
      graphId: 'graph-001',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1, { ...VALID_EDGE_1, edgeId: 'edge-002' }],
      deterministic: true,
      generatedFrom: 'deterministic_lineage_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateLineageGraph(graph);
    const duplicateError = errors.find((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_DUPLICATE_EDGE);

    assert.ok(duplicateError, 'Should have LINEAGE_DUPLICATE_EDGE error');
  });

  it('should not flag unique edges as duplicates', () => {
    const graph: ResearchLineageGraph = {
      graphId: 'graph-001',
      nodes: [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3],
      edges: [VALID_EDGE_1, VALID_EDGE_2],
      deterministic: true,
      generatedFrom: 'deterministic_lineage_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateLineageGraph(graph);
    const duplicateErrors = errors.filter((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_DUPLICATE_EDGE);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Self Reference Tests
// ---------------------------------------------------------------------------

describe('self reference validation', () => {
  it('should detect self reference', () => {
    const edge: ResearchLineageEdge = {
      edgeId: 'edge-001',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-001',
      relationType: 'predecessor',
      provenance: VALID_PROVENANCE_1,
      governanceStatus: 'canonical',
    };

    const errors = validateLineageEdge(edge, ['node-001']);
    const selfRefError = errors.find((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_SELF_REFERENCE);

    assert.ok(selfRefError, 'Should have LINEAGE_SELF_REFERENCE error');
  });

  it('should not flag valid edges as self references', () => {
    const errors = validateLineageEdge(VALID_EDGE_1, ['node-001', 'node-002']);
    const selfRefErrors = errors.filter((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_SELF_REFERENCE);

    assert.equal(selfRefErrors.length, 0, 'Should not have self reference errors');
  });
});

// ---------------------------------------------------------------------------
// Cycle Detection Tests
// ---------------------------------------------------------------------------

describe('cycle detection', () => {
  it('should detect a simple cycle', () => {
    const graph: ResearchLineageGraph = {
      graphId: 'graph-001',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [
        VALID_EDGE_1,
        {
          edgeId: 'edge-002',
          sourceNodeId: 'node-002',
          targetNodeId: 'node-001',
          relationType: 'predecessor',
          provenance: VALID_PROVENANCE_1,
          governanceStatus: 'canonical',
        },
      ],
      deterministic: true,
      generatedFrom: 'deterministic_lineage_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateLineageGraph(graph);
    const cycleError = errors.find((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_CYCLE_DETECTED);

    assert.ok(cycleError, 'Should have LINEAGE_CYCLE_DETECTED error');
  });

  it('should detect a longer cycle', () => {
    const node4: ResearchLineageNode = {
      nodeId: 'node-004',
      referenceId: 'ref-004',
      title: 'Additional Reference',
      sourceType: 'conference_paper',
      evidenceLevel: 'primary',
      governanceStatus: 'canonical',
    };

    const graph: ResearchLineageGraph = {
      graphId: 'graph-001',
      nodes: [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3, node4],
      edges: [
        VALID_EDGE_1,
        VALID_EDGE_2,
        {
          edgeId: 'edge-003',
          sourceNodeId: 'node-002',
          targetNodeId: 'node-003',
          relationType: 'predecessor',
          provenance: VALID_PROVENANCE_1,
          governanceStatus: 'canonical',
        },
        {
          edgeId: 'edge-004',
          sourceNodeId: 'node-003',
          targetNodeId: 'node-001',
          relationType: 'predecessor',
          provenance: VALID_PROVENANCE_1,
          governanceStatus: 'canonical',
        },
      ],
      deterministic: true,
      generatedFrom: 'deterministic_lineage_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateLineageGraph(graph);
    const cycleError = errors.find((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_CYCLE_DETECTED);

    assert.ok(cycleError, 'Should have LINEAGE_CYCLE_DETECTED error');
  });

  it('should not flag acyclic graphs', () => {
    const graph: ResearchLineageGraph = {
      graphId: 'graph-001',
      nodes: [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3],
      edges: [VALID_EDGE_1, VALID_EDGE_2],
      deterministic: true,
      generatedFrom: 'deterministic_lineage_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateLineageGraph(graph);
    const cycleErrors = errors.filter((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_CYCLE_DETECTED);

    assert.equal(cycleErrors.length, 0, 'Should not have cycle errors');
  });
});

// ---------------------------------------------------------------------------
// Orphan Node Tests
// ---------------------------------------------------------------------------

describe('orphan node validation', () => {
  it('should detect orphan nodes', () => {
    const graph: ResearchLineageGraph = {
      graphId: 'graph-001',
      nodes: [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3],
      edges: [VALID_EDGE_1],
      deterministic: true,
      generatedFrom: 'deterministic_lineage_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateLineageGraph(graph);
    const orphanErrors = errors.filter((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_ORPHAN_NODE);

    assert.ok(orphanErrors.length > 0, 'Should have LINEAGE_ORPHAN_NODE errors');
  });

  it('should not flag nodes with edges', () => {
    const graph: ResearchLineageGraph = {
      graphId: 'graph-001',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
      deterministic: true,
      generatedFrom: 'deterministic_lineage_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateLineageGraph(graph);
    const orphanErrors = errors.filter((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_ORPHAN_NODE);

    assert.equal(orphanErrors.length, 0, 'Should not have orphan errors');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Relation Tests
// ---------------------------------------------------------------------------

describe('unsupported relation validation', () => {
  it('should detect unsupported relation type', () => {
    const edge: ResearchLineageEdge = {
      edgeId: 'edge-001',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-002',
      relationType: 'unsupported_relation' as any,
      provenance: VALID_PROVENANCE_1,
      governanceStatus: 'canonical',
    };

    const errors = validateLineageEdge(edge, ['node-001', 'node-002']);
    const unsupportedError = errors.find((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_UNKNOWN_RELATION);

    assert.ok(unsupportedError, 'Should have LINEAGE_UNKNOWN_RELATION error');
  });

  it('should support all canonical relation types', () => {
    const relationTypes = getCanonicalRelationTypes();
    assert.equal(relationTypes.length, 8);
    assert.ok(relationTypes.includes('predecessor'));
    assert.ok(relationTypes.includes('successor'));
    assert.ok(relationTypes.includes('derived_from'));
    assert.ok(relationTypes.includes('refines'));
    assert.ok(relationTypes.includes('extends'));
    assert.ok(relationTypes.includes('supersedes'));
    assert.ok(relationTypes.includes('inspired_by'));
    assert.ok(relationTypes.includes('parallel_to'));
  });

  it('should correctly identify supported relation types', () => {
    assert.equal(isSupportedRelationType('predecessor'), true);
    assert.equal(isSupportedRelationType('successor'), true);
    assert.equal(isSupportedRelationType('derived_from'), true);
    assert.equal(isSupportedRelationType('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('missing provenance validation', () => {
  it('should detect missing provenance', () => {
    const edge: ResearchLineageEdge = {
      edgeId: 'edge-001',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-002',
      relationType: 'predecessor',
      provenance: null as any,
      governanceStatus: 'canonical',
    };

    const errors = validateLineageEdge(edge, ['node-001', 'node-002']);
    const provenanceError = errors.find((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have LINEAGE_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const edge: ResearchLineageEdge = {
      edgeId: 'edge-001',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-002',
      relationType: 'predecessor',
      provenance: {
        ...VALID_PROVENANCE_1,
        rationale: '',
      },
      governanceStatus: 'canonical',
    };

    const errors = validateLineageEdge(edge, ['node-001', 'node-002']);
    const provenanceError = errors.find((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have LINEAGE_MISSING_PROVENANCE error');
  });

  it('should not flag valid provenance', () => {
    const errors = validateLineageEdge(VALID_EDGE_1, ['node-001', 'node-002']);
    const provenanceErrors = errors.filter((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_PROVENANCE);

    assert.equal(provenanceErrors.length, 0, 'Should not have provenance errors');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Output Tests
// ---------------------------------------------------------------------------

describe('deterministic output', () => {
  it('should produce identical output for identical input', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const output1 = composeResearchLineage(input);
    const output2 = composeResearchLineage(input);

    assert.equal(output1.artifactId, output2.artifactId);
    assert.equal(output1.lineageGraph.nodes.length, output2.lineageGraph.nodes.length);
    assert.equal(output1.lineageGraph.edges.length, output2.lineageGraph.edges.length);
    assert.equal(output1.lineageTrace.traceId, output2.lineageTrace.traceId);
  });

  it('should have deterministic trace metadata', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const artifact = composeResearchLineage(input);

    assert.equal(artifact.lineageTrace.deterministic, true);
    assert.equal(artifact.lineageTrace.randomUsed, false);
    assert.equal(artifact.lineageTrace.timeDependency, false);
    assert.equal(artifact.lineageTrace.generatedFrom, 'deterministic_lineage_kernel');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('immutable input', () => {
  it('should not mutate input nodes', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const originalTitle = VALID_NODE_1.title;

    composeResearchLineage(input);

    assert.equal(VALID_NODE_1.title, originalTitle);
  });

  it('should not mutate input edges', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const originalEdgeId = VALID_EDGE_1.edgeId;

    composeResearchLineage(input);

    assert.equal(VALID_EDGE_1.edgeId, originalEdgeId);
  });
});

// ---------------------------------------------------------------------------
// No Generated Content Tests
// ---------------------------------------------------------------------------

describe('no generated content', () => {
  it('should not generate educational content', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const artifact = composeResearchLineage(input);

    // Lineage metadata should only contain input data, not generated summaries
    for (const node of artifact.lineageGraph.nodes) {
      assert.ok(!node.title.includes('generated'));
      assert.ok(!node.title.includes('synthesized'));
    }
  });
});

// ---------------------------------------------------------------------------
// No Inferred Relationships Tests
// ---------------------------------------------------------------------------

describe('no inferred relationships', () => {
  it('should not infer relationships between nodes', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [],
    };

    const artifact = composeResearchLineage(input);

    // Should not have any edges since none were provided
    assert.equal(artifact.lineageGraph.edges.length, 0);
  });

  it('should only include provided edges', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      nodes: [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3],
      edges: [VALID_EDGE_1],
    };

    const artifact = composeResearchLineage(input);

    // Should only have the one provided edge
    assert.equal(artifact.lineageGraph.edges.length, 1);
    assert.equal(artifact.lineageGraph.edges[0].edgeId, 'edge-001');
  });
});

// ---------------------------------------------------------------------------
// Identical Output for Identical Input Tests
// ---------------------------------------------------------------------------

describe('identical output for identical input', () => {
  it('should produce identical lineage graphs', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const artifact1 = composeResearchLineage(input);
    const artifact2 = composeResearchLineage(input);

    assert.deepEqual(artifact1.lineageGraph, artifact2.lineageGraph);
  });

  it('should produce identical lineage traces', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const artifact1 = composeResearchLineage(input);
    const artifact2 = composeResearchLineage(input);

    assert.deepEqual(artifact1.lineageTrace, artifact2.lineageTrace);
  });
});

// ---------------------------------------------------------------------------
// Additional Negative Tests
// ---------------------------------------------------------------------------

describe('additional negative tests', () => {
  it('should validate complete artifact', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const artifact = composeResearchLineage(input);
    const result = validateResearchArtifactWithLineage(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate lineage input', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      nodes: [VALID_NODE_1, VALID_NODE_2],
      edges: [VALID_EDGE_1],
    };

    const errors = validateLineageInput(input);
    assert.equal(errors.length, 0);
  });

  it('should detect missing concept ID in input', () => {
    const input: ResearchLineageInput = {
      conceptId: '',
      conceptLabel: 'Transformer Architecture',
      nodes: [VALID_NODE_1],
      edges: [VALID_EDGE_1],
    };

    const errors = validateLineageInput(input);
    const conceptError = errors.find((e) => e.field === 'conceptId');

    assert.ok(conceptError, 'Should have conceptId error');
  });

  it('should detect missing concept label in input', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: '',
      nodes: [VALID_NODE_1],
      edges: [VALID_EDGE_1],
    };

    const errors = validateLineageInput(input);
    const labelError = errors.find((e) => e.field === 'conceptLabel');

    assert.ok(labelError, 'Should have conceptLabel error');
  });

  it('should detect missing nodes in input', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      nodes: [],
      edges: [VALID_EDGE_1],
    };

    const errors = validateLineageInput(input);
    const nodesError = errors.find((e) => e.field === 'nodes');

    assert.ok(nodesError, 'Should have nodes error');
  });

  it('should detect missing edges in input', () => {
    const input: ResearchLineageInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer Architecture',
      nodes: [VALID_NODE_1],
      edges: [],
    };

    const errors = validateLineageInput(input);
    const edgesError = errors.find((e) => e.field === 'edges');

    assert.ok(edgesError, 'Should have edges error');
  });

  it('should compose lineage nodes correctly', () => {
    const node = composeLineageNode(
      'node-001',
      VALID_REFERENCE_1,
      'primary',
      'canonical',
    );

    assert.equal(node.nodeId, 'node-001');
    assert.equal(node.referenceId, 'ref-001');
    assert.equal(node.title, 'Attention Is All You Need');
    assert.equal(node.evidenceLevel, 'primary');
    assert.equal(node.governanceStatus, 'canonical');
  });

  it('should compose lineage trace correctly', () => {
    const decisions = [
      {
        decisionId: 'decision-001',
        sourceReferenceId: 'ref-001',
        targetReferenceId: 'ref-002',
        relationType: 'predecessor' as const,
        provenance: VALID_PROVENANCE_1,
        validationPassed: true,
        validationErrors: [],
      },
    ];

    const trace = composeLineageTrace('trace-001', 2, 1, decisions);

    assert.equal(trace.traceId, 'trace-001');
    assert.equal(trace.nodeCount, 2);
    assert.equal(trace.edgeCount, 1);
    assert.equal(trace.decisionsCount, 1);
    assert.equal(trace.validatedCount, 1);
    assert.equal(trace.invalidCount, 0);
  });

  it('should detect edges referencing non-existent nodes', () => {
    const edge: ResearchLineageEdge = {
      edgeId: 'edge-001',
      sourceNodeId: 'node-001',
      targetNodeId: 'node-999',
      relationType: 'predecessor',
      provenance: VALID_PROVENANCE_1,
      governanceStatus: 'canonical',
    };

    const errors = validateLineageEdge(edge, ['node-001', 'node-002']);
    const orphanError = errors.find((e) => e.code === LINEAGE_VALIDATION_CODES.LINEAGE_ORPHAN_NODE);

    assert.ok(orphanError, 'Should have LINEAGE_ORPHAN_NODE error');
  });
});
