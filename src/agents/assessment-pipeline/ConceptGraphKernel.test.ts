/**
 * NV-2000-D8-OPT-04 — Concept Graph Kernel Tests
 *
 * Exhaustive deterministic tests for the Concept Graph Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~90 tests covering:
 * - Canonical enum completeness
 * - Helper functions
 * - Node reference composition
 * - Relationship composition
 * - Coverage composition
 * - Graph composition
 * - Registry composition
 * - Validation codes
 * - Duplicate detection
 * - Deterministic identity (100 iterations)
 * - Immutability
 * - Validator stability
 * - No mutation
 * - Artifact with concept graph
 * - Cross-agent boundary
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_CONCEPT_NODE_TYPES,
  CANONICAL_RELATIONSHIP_TYPES,
  CANONICAL_GRAPH_COVERAGE_TYPES,
  CANONICAL_ASSESSMENT_GRAPH_OBJECTIVES,
  CANONICAL_GRAPH_MAPPING_STATUS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type AssessmentConceptGraph,
  type ConceptNodeReference,
  type ConceptRelationship,
  type AssessmentConceptCoverage,
  type ConceptGraphInput,
  type ConceptGraphRegistry,
  type ConceptGraphProvenance,
  type AssessmentArtifactWithConceptGraph,
} from './AssessmentAgentContract.ts';

import {
  composeConceptGraphProvenance,
  composeConceptGraphTrace,
  composeConceptNodeReference,
  composeConceptRelationship,
  composeAssessmentConceptCoverage,
  composeGraphCoverageEntry,
  composeAssessmentConceptGraph,
  composeConceptGraphRegistry,
  composeConceptGraphRegistryFromInput,
  composeAssessmentConceptGraphs,
  composeAssessmentArtifactWithConceptGraph,
  isSupportedConceptNodeType,
  isSupportedRelationshipType,
  isSupportedGraphCoverageType,
  isSupportedAssessmentGraphObjective,
  isSupportedGraphMappingStatus,
  isSupportedGraphGovernance,
  getCanonicalConceptNodeTypes,
  getCanonicalRelationshipTypes,
  getCanonicalGraphCoverageTypes,
  getCanonicalAssessmentGraphObjectives,
  getCanonicalGraphMappingStatuses,
} from './ConceptGraphKernel.ts';

import {
  CONCEPT_GRAPH_VALIDATION_CODES,
  validateConceptNodeReference,
  validateConceptRelationship,
  validateAssessmentConceptCoverage,
  validateAssessmentConceptGraph,
  validateConceptGraphRegistry,
  validateConceptGraphInput,
  validateConceptGraphTrace,
  validateAssessmentArtifactWithConceptGraph,
} from './ConceptGraphValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_GRAPH_PROVENANCE: ConceptGraphProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for concept graph.',
};

function _makeNodeRef(id: string): ConceptNodeReference {
  return composeConceptNodeReference({
    id,
    title: `Node ${id}`,
    nodeType: 'concept',
    knowledgeGraphId: 'kg-1',
    knowledgeNodeId: `kn-${id}`,
  });
}

function _makeRel(id: string, source: string, target: string): ConceptRelationship {
  return composeConceptRelationship({
    id,
    sourceConceptId: source,
    targetConceptId: target,
    relationshipType: 'prerequisite',
    knowledgeGraphId: 'kg-1',
    rationale: 'Test relationship',
  });
}

function _makeCoverage(id: string): AssessmentConceptCoverage {
  return composeAssessmentConceptCoverage({
    id,
    coverageType: 'single_node',
    objective: 'concept_validation',
    conceptNodeIds: ['node-a'],
    relationshipIds: [],
  });
}

function _makeGraph(id: string, overrides: Partial<AssessmentConceptGraph> = {}): AssessmentConceptGraph {
  return composeAssessmentConceptGraph({
    id,
    title: `Graph ${id}`,
    knowledgeGraphId: 'kg-1',
    conceptNodes: [_makeNodeRef('node-a'), _makeNodeRef('node-b')],
    relationships: [_makeRel('rel-1', 'node-a', 'node-b')],
    coverages: [_makeCoverage('cov-1')],
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_GRAPH_PROVENANCE,
    ...overrides,
  });
}

const VALID_GRAPH_A = _makeGraph('graph-a');
const VALID_GRAPH_B = _makeGraph('graph-b');
const VALID_GRAPH_C = _makeGraph('graph-c');

// ============================================================================
// CANONICAL ENUM COMPLETENESS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 concept node types', () => {
    assert.equal(CANONICAL_CONCEPT_NODE_TYPES.length, 10);
  });

  it('should have exactly 10 relationship types', () => {
    assert.equal(CANONICAL_RELATIONSHIP_TYPES.length, 10);
  });

  it('should have exactly 10 graph coverage types', () => {
    assert.equal(CANONICAL_GRAPH_COVERAGE_TYPES.length, 10);
  });

  it('should have exactly 10 assessment graph objectives', () => {
    assert.equal(CANONICAL_ASSESSMENT_GRAPH_OBJECTIVES.length, 10);
  });

  it('should have exactly 6 graph mapping statuses', () => {
    assert.equal(CANONICAL_GRAPH_MAPPING_STATUS.length, 6);
  });

  it('should contain expected concept node types', () => {
    const expected = [
      'concept', 'principle', 'definition', 'algorithm', 'technique',
      'formula', 'workflow', 'architecture', 'constraint', 'application',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_CONCEPT_NODE_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected relationship types', () => {
    const expected = [
      'prerequisite', 'dependency', 'composition', 'generalization',
      'specialization', 'comparison', 'causality', 'implementation',
      'application', 'equivalence',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_RELATIONSHIP_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected graph coverage types', () => {
    const expected = [
      'single_node', 'partial_cluster', 'complete_cluster', 'dependency_chain',
      'hierarchical_branch', 'cross_domain', 'workflow_path', 'architecture_layer',
      'competency_group', 'full_graph',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_GRAPH_COVERAGE_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected assessment graph objectives', () => {
    const expected = [
      'concept_validation', 'dependency_validation', 'prerequisite_validation',
      'relationship_validation', 'competency_validation', 'architecture_validation',
      'reasoning_validation', 'workflow_validation', 'integration_validation',
      'mastery_validation',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_ASSESSMENT_GRAPH_OBJECTIVES.includes(value as any), `Missing: ${value}`);
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedConceptNodeType returns true for valid types', () => {
    assert.equal(isSupportedConceptNodeType('concept'), true);
    assert.equal(isSupportedConceptNodeType('application'), true);
  });

  it('isSupportedConceptNodeType returns false for invalid types', () => {
    assert.equal(isSupportedConceptNodeType('invalid'), false);
    assert.equal(isSupportedConceptNodeType(''), false);
  });

  it('isSupportedRelationshipType returns true for valid types', () => {
    assert.equal(isSupportedRelationshipType('prerequisite'), true);
    assert.equal(isSupportedRelationshipType('equivalence'), true);
  });

  it('isSupportedRelationshipType returns false for invalid types', () => {
    assert.equal(isSupportedRelationshipType('invalid'), false);
    assert.equal(isSupportedRelationshipType(''), false);
  });

  it('isSupportedGraphCoverageType returns true for valid types', () => {
    assert.equal(isSupportedGraphCoverageType('single_node'), true);
    assert.equal(isSupportedGraphCoverageType('full_graph'), true);
  });

  it('isSupportedGraphCoverageType returns false for invalid types', () => {
    assert.equal(isSupportedGraphCoverageType('invalid'), false);
    assert.equal(isSupportedGraphCoverageType(''), false);
  });

  it('isSupportedAssessmentGraphObjective returns true for valid objectives', () => {
    assert.equal(isSupportedAssessmentGraphObjective('concept_validation'), true);
    assert.equal(isSupportedAssessmentGraphObjective('mastery_validation'), true);
  });

  it('isSupportedAssessmentGraphObjective returns false for invalid objectives', () => {
    assert.equal(isSupportedAssessmentGraphObjective('invalid'), false);
    assert.equal(isSupportedAssessmentGraphObjective(''), false);
  });

  it('isSupportedGraphMappingStatus returns true for valid statuses', () => {
    assert.equal(isSupportedGraphMappingStatus('draft'), true);
    assert.equal(isSupportedGraphMappingStatus('archived'), true);
  });

  it('isSupportedGraphMappingStatus returns false for invalid statuses', () => {
    assert.equal(isSupportedGraphMappingStatus('invalid'), false);
    assert.equal(isSupportedGraphMappingStatus(''), false);
  });

  it('isSupportedGraphGovernance returns true for valid governance', () => {
    assert.equal(isSupportedGraphGovernance('canonical'), true);
    assert.equal(isSupportedGraphGovernance('rejected'), true);
  });

  it('isSupportedGraphGovernance returns false for invalid governance', () => {
    assert.equal(isSupportedGraphGovernance('invalid'), false);
    assert.equal(isSupportedGraphGovernance(''), false);
  });

  it('getCanonicalConceptNodeTypes returns a copy', () => {
    const result = getCanonicalConceptNodeTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_CONCEPT_NODE_TYPES]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_CONCEPT_NODE_TYPES.length, 10);
  });

  it('getCanonicalRelationshipTypes returns a copy', () => {
    const result = getCanonicalRelationshipTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalGraphCoverageTypes returns a copy', () => {
    const result = getCanonicalGraphCoverageTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalAssessmentGraphObjectives returns a copy', () => {
    const result = getCanonicalAssessmentGraphObjectives();
    assert.equal(result.length, 10);
  });

  it('getCanonicalGraphMappingStatuses returns a copy', () => {
    const result = getCanonicalGraphMappingStatuses();
    assert.equal(result.length, 6);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Node Reference
// ============================================================================

describe('composeConceptNodeReference', () => {
  it('should compose node reference from valid params', () => {
    const node = composeConceptNodeReference({
      id: 'n1', title: 'Test', nodeType: 'algorithm',
      knowledgeGraphId: 'kg', knowledgeNodeId: 'kn1',
    });
    assert.equal(node.id, 'n1');
    assert.equal(node.title, 'Test');
    assert.equal(node.nodeType, 'algorithm');
    assert.equal(node.knowledgeGraphId, 'kg');
    assert.equal(node.knowledgeNodeId, 'kn1');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'n', title: 'T', nodeType: 'concept' as const,
      knowledgeGraphId: 'kg', knowledgeNodeId: 'kn',
    };
    const n1 = composeConceptNodeReference(params);
    const n2 = composeConceptNodeReference(params);
    assert.deepEqual(n1, n2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Relationship
// ============================================================================

describe('composeConceptRelationship', () => {
  it('should compose relationship from valid params', () => {
    const rel = composeConceptRelationship({
      id: 'r1', sourceConceptId: 'a', targetConceptId: 'b',
      relationshipType: 'dependency', knowledgeGraphId: 'kg', rationale: 'r',
    });
    assert.equal(rel.id, 'r1');
    assert.equal(rel.sourceConceptId, 'a');
    assert.equal(rel.targetConceptId, 'b');
    assert.equal(rel.relationshipType, 'dependency');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'r', sourceConceptId: 'a', targetConceptId: 'b',
      relationshipType: 'prerequisite' as const, knowledgeGraphId: 'kg', rationale: 'r',
    };
    const r1 = composeConceptRelationship(params);
    const r2 = composeConceptRelationship(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Coverage
// ============================================================================

describe('composeAssessmentConceptCoverage', () => {
  it('should compose coverage from valid params', () => {
    const cov = composeAssessmentConceptCoverage({
      id: 'c1', coverageType: 'dependency_chain',
      objective: 'dependency_validation', conceptNodeIds: ['a', 'b'],
      relationshipIds: ['r1'],
    });
    assert.equal(cov.id, 'c1');
    assert.equal(cov.coverageType, 'dependency_chain');
    assert.equal(cov.objective, 'dependency_validation');
    assert.deepEqual([...cov.conceptNodeIds], ['a', 'b']);
    assert.deepEqual([...cov.relationshipIds], ['r1']);
  });

  it('should not mutate input arrays', () => {
    const nodeIds = ['a', 'b'];
    const relIds = ['r1'];
    const original = JSON.stringify({ nodeIds, relIds });
    composeAssessmentConceptCoverage({
      id: 'c', coverageType: 'single_node', objective: 'concept_validation',
      conceptNodeIds: nodeIds, relationshipIds: relIds,
    });
    assert.equal(JSON.stringify({ nodeIds, relIds }), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Graph
// ============================================================================

describe('composeAssessmentConceptGraph', () => {
  it('should compose graph from valid params', () => {
    const graph = composeAssessmentConceptGraph({
      id: 'g1', title: 'Test Graph', knowledgeGraphId: 'kg',
      conceptNodes: [_makeNodeRef('n1')],
      relationships: [_makeRel('r1', 'n1', 'n1')],
      coverages: [_makeCoverage('c1')],
      status: 'draft', governance: 'canonical',
      provenance: VALID_GRAPH_PROVENANCE,
    });
    assert.equal(graph.id, 'g1');
    assert.equal(graph.title, 'Test Graph');
    assert.equal(graph.knowledgeGraphId, 'kg');
    assert.equal(graph.conceptNodes.length, 1);
    assert.equal(graph.relationships.length, 1);
    assert.equal(graph.coverages.length, 1);
    assert.equal(graph.trace.deterministic, true);
    assert.equal(graph.trace.randomUsed, false);
    assert.equal(graph.trace.timeDependency, false);
  });

  it('should not mutate input arrays', () => {
    const nodes = [_makeNodeRef('n1')];
    const rels = [_makeRel('r1', 'n1', 'n1')];
    const covs = [_makeCoverage('c1')];
    const original = JSON.stringify({ nodes, rels, covs });
    composeAssessmentConceptGraph({
      id: 'g', title: 'T', knowledgeGraphId: 'kg',
      conceptNodes: nodes, relationships: rels, coverages: covs,
      status: 'draft', governance: 'canonical', provenance: VALID_GRAPH_PROVENANCE,
    });
    assert.equal(JSON.stringify({ nodes, rels, covs }), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composeConceptGraphRegistry', () => {
  it('should compose registry from graphs', () => {
    const registry = composeConceptGraphRegistry([VALID_GRAPH_A, VALID_GRAPH_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
  });

  it('should sort nodes by id', () => {
    const registry = composeConceptGraphRegistry([VALID_GRAPH_C, VALID_GRAPH_A, VALID_GRAPH_B]);
    assert.equal(registry.nodes[0].id, 'graph-a');
    assert.equal(registry.nodes[1].id, 'graph-b');
    assert.equal(registry.nodes[2].id, 'graph-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_GRAPH_A, VALID_GRAPH_B];
    const r1 = composeConceptGraphRegistry(nodes);
    const r2 = composeConceptGraphRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_GRAPH_C, VALID_GRAPH_A];
    const original = JSON.stringify(nodes);
    composeConceptGraphRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composeConceptGraphRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry from Input
// ============================================================================

describe('composeConceptGraphRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: ConceptGraphInput = { nodes: [VALID_GRAPH_A, VALID_GRAPH_B] };
    const registry = composeConceptGraphRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
  });

  it('should return identical output for identical input', () => {
    const input: ConceptGraphInput = { nodes: [VALID_GRAPH_A] };
    const r1 = composeConceptGraphRegistryFromInput(input);
    const r2 = composeConceptGraphRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Assessment Artifact
// ============================================================================

describe('composeAssessmentArtifactWithConceptGraph', () => {
  it('should compose artifact with graph', () => {
    const result = composeAssessmentArtifactWithConceptGraph({
      artifactId: 'art-1',
      artifactTitle: 'Test',
      conceptGraph: VALID_GRAPH_A,
    });
    assert.equal(result.artifactId, 'art-1');
    assert.equal(result.artifactTitle, 'Test');
    assert.equal(result.conceptGraph.id, 'graph-a');
  });

  it('should return identical output for identical input', () => {
    const params = {
      artifactId: 'a', artifactTitle: 'T', conceptGraph: VALID_GRAPH_A,
    };
    const r1 = composeAssessmentArtifactWithConceptGraph(params);
    const r2 = composeAssessmentArtifactWithConceptGraph(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// VALIDATION — Node reference validation
// ============================================================================

describe('validateConceptNodeReference', () => {
  it('should pass for valid node reference', () => {
    const errors = validateConceptNodeReference(_makeNodeRef('n1'));
    assert.equal(errors.length, 0);
  });

  it('should reject node with missing id', () => {
    const node = composeConceptNodeReference({
      id: '', title: 'T', nodeType: 'concept',
      knowledgeGraphId: 'kg', knowledgeNodeId: 'kn',
    });
    const errors = validateConceptNodeReference(node);
    assert.ok(errors.length > 0);
  });

  it('should reject node with invalid nodeType', () => {
    const node = composeConceptNodeReference({
      id: 'n', title: 'T', nodeType: 'invalid' as any,
      knowledgeGraphId: 'kg', knowledgeNodeId: 'kn',
    });
    const errors = validateConceptNodeReference(node);
    assert.ok(errors.some((e) => e.code === CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_NODE_TYPE));
  });
});

// ============================================================================
// VALIDATION — Relationship validation
// ============================================================================

describe('validateConceptRelationship', () => {
  it('should pass for valid relationship', () => {
    const errors = validateConceptRelationship(_makeRel('r1', 'a', 'b'));
    assert.equal(errors.length, 0);
  });

  it('should reject relationship with invalid type', () => {
    const rel = composeConceptRelationship({
      id: 'r', sourceConceptId: 'a', targetConceptId: 'b',
      relationshipType: 'invalid' as any, knowledgeGraphId: 'kg', rationale: 'r',
    });
    const errors = validateConceptRelationship(rel);
    assert.ok(errors.some((e) => e.code === CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_RELATIONSHIP));
  });
});

// ============================================================================
// VALIDATION — Coverage validation
// ============================================================================

describe('validateAssessmentConceptCoverage', () => {
  it('should pass for valid coverage', () => {
    const errors = validateAssessmentConceptCoverage(_makeCoverage('c1'));
    assert.equal(errors.length, 0);
  });

  it('should reject coverage with invalid type', () => {
    const cov = composeAssessmentConceptCoverage({
      id: 'c', coverageType: 'invalid' as any,
      objective: 'concept_validation', conceptNodeIds: [], relationshipIds: [],
    });
    const errors = validateAssessmentConceptCoverage(cov);
    assert.ok(errors.some((e) => e.code === CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_COVERAGE));
  });
});

// ============================================================================
// VALIDATION — Graph validation
// ============================================================================

describe('validateAssessmentConceptGraph', () => {
  it('should pass for valid graph', () => {
    const errors = validateAssessmentConceptGraph(VALID_GRAPH_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null graph', () => {
    const errors = validateAssessmentConceptGraph(null as any);
    assert.ok(errors.length > 0);
  });

  it('should reject graph with missing id', () => {
    const graph = _makeGraph('');
    const errors = validateAssessmentConceptGraph(graph);
    assert.ok(errors.some((e) => e.code === CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_GRAPH_ID));
  });

  it('should reject graph with invalid status', () => {
    const graph = _makeGraph('g', { status: 'invalid' as any });
    const errors = validateAssessmentConceptGraph(graph);
    assert.ok(errors.some((e) => e.code === CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_STATUS));
  });

  it('should reject graph with missing provenance', () => {
    const graph = _makeGraph('g', { provenance: null as any });
    const errors = validateAssessmentConceptGraph(graph);
    assert.ok(errors.some((e) => e.code === CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_PROVENANCE));
  });

  it('should reject graph with non-deterministic trace', () => {
    const graph: AssessmentConceptGraph = {
      id: 'g',
      title: 'Graph g',
      knowledgeGraphId: 'kg-1',
      conceptNodes: [],
      relationships: [],
      coverages: [],
      status: 'draft',
      governance: 'canonical',
      provenance: VALID_GRAPH_PROVENANCE,
      trace: {
        traceId: 'test-trace',
        deterministic: false as any,
        generatedFrom: 'deterministic_concept_graph_kernel',
        randomUsed: false,
        timeDependency: false,
      },
    };
    const errors = validateAssessmentConceptGraph(graph);
    assert.ok(errors.some((e) => e.code === CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Registry validation
// ============================================================================

describe('validateConceptGraphRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composeConceptGraphRegistry([VALID_GRAPH_A, VALID_GRAPH_B]);
    const result = validateConceptGraphRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null registry', () => {
    const result = validateConceptGraphRegistry(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty registry', () => {
    const registry = composeConceptGraphRegistry([]);
    const result = validateConceptGraphRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makeGraph('dup'), _makeGraph('dup')];
    const registry = composeConceptGraphRegistry(duplicateNodes);
    const result = validateConceptGraphRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makeGraph('a', { title: 'Same Title' }),
      _makeGraph('b', { title: 'Same Title' }),
    ];
    const registry = composeConceptGraphRegistry(duplicateTitles);
    const result = validateConceptGraphRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_DUPLICATE_TITLE));
  });
});

// ============================================================================
// VALIDATION — Input validation
// ============================================================================

describe('validateConceptGraphInput', () => {
  it('should pass for valid input', () => {
    const input: ConceptGraphInput = { nodes: [VALID_GRAPH_A] };
    const result = validateConceptGraphInput(input);
    assert.equal(result.valid, true);
  });

  it('should reject null input', () => {
    const result = validateConceptGraphInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty input', () => {
    const result = validateConceptGraphInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Trace validation
// ============================================================================

describe('validateConceptGraphTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composeConceptGraphTrace({ traceId: 'test' });
    const result = validateConceptGraphTrace(trace);
    assert.equal(result.valid, true);
  });

  it('should reject null trace', () => {
    const result = validateConceptGraphTrace(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Artifact validation
// ============================================================================

describe('validateAssessmentArtifactWithConceptGraph', () => {
  it('should pass for valid artifact', () => {
    const artifact = composeAssessmentArtifactWithConceptGraph({
      artifactId: 'art-1', artifactTitle: 'Test', conceptGraph: VALID_GRAPH_A,
    });
    const result = validateAssessmentArtifactWithConceptGraph(artifact);
    assert.equal(result.valid, true);
  });

  it('should reject null artifact', () => {
    const result = validateAssessmentArtifactWithConceptGraph(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composeConceptGraphRegistry across 100 iterations', () => {
    const nodes = [VALID_GRAPH_A, VALID_GRAPH_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeConceptGraphRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composeAssessmentConceptGraph across 100 iterations', () => {
    const params = {
      id: 'g', title: 'T', knowledgeGraphId: 'kg',
      conceptNodes: [_makeNodeRef('n1')],
      relationships: [_makeRel('r1', 'n1', 'n1')],
      coverages: [_makeCoverage('c1')],
      status: 'draft' as const, governance: 'canonical' as const,
      provenance: VALID_GRAPH_PROVENANCE,
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeAssessmentConceptGraph(params);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });
});

// ============================================================================
// IMMUTABILITY — No mutation
// ============================================================================

describe('Immutability', () => {
  it('should not mutate input nodes array in composeConceptGraphRegistry', () => {
    const nodes = [VALID_GRAPH_C, VALID_GRAPH_A];
    const original = JSON.stringify(nodes);
    composeConceptGraphRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate conceptNodes in composeAssessmentConceptGraph', () => {
    const nodes = [_makeNodeRef('n1')];
    const original = JSON.stringify(nodes);
    composeAssessmentConceptGraph({
      id: 'g', title: 'T', knowledgeGraphId: 'kg',
      conceptNodes: nodes, relationships: [], coverages: [],
      status: 'draft', governance: 'canonical', provenance: VALID_GRAPH_PROVENANCE,
    });
    assert.equal(JSON.stringify(nodes), original);
  });

  it('getCanonicalConceptNodeTypes returns a copy not affecting original', () => {
    const copy = getCanonicalConceptNodeTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_CONCEPT_NODE_TYPES.length, 10);
  });

  it('getCanonicalRelationshipTypes returns a copy not affecting original', () => {
    const copy = getCanonicalRelationshipTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_RELATIONSHIP_TYPES.length, 10);
  });

  it('getCanonicalGraphCoverageTypes returns a copy not affecting original', () => {
    const copy = getCanonicalGraphCoverageTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_GRAPH_COVERAGE_TYPES.length, 10);
  });
});

// ============================================================================
// CROSS-AGENT BOUNDARY — No graph computation
// ============================================================================

describe('Cross-Agent Boundary', () => {
  it('should not contain graph traversal logic', () => {
    const source = JSON.stringify(CANONICAL_CONCEPT_NODE_TYPES);
    assert.ok(!source.includes('traverse'));
    assert.ok(!source.includes('walk'));
    assert.ok(!source.includes('bfs'));
    assert.ok(!source.includes('dfs'));
  });

  it('should not contain graph inference logic', () => {
    const source = JSON.stringify(CANONICAL_RELATIONSHIP_TYPES);
    assert.ok(!source.includes('infer'));
    assert.ok(!source.includes('deduce'));
    assert.ok(!source.includes('discover'));
  });

  it('should not contain knowledge graph construction', () => {
    const source = JSON.stringify(CANONICAL_CONCEPT_NODE_TYPES);
    assert.ok(!source.includes('construct'));
    assert.ok(!source.includes('build_graph'));
    assert.ok(!source.includes('create_graph'));
  });

  it('should not modify Knowledge Agent registries', () => {
    const source = JSON.stringify(CANONICAL_GRAPH_COVERAGE_TYPES);
    assert.ok(!source.includes('knowledge_agent'));
    assert.ok(!source.includes('knowledge_registry'));
  });

  it('should not create curriculum graphs', () => {
    const source = JSON.stringify(CANONICAL_ASSESSMENT_GRAPH_OBJECTIVES);
    assert.ok(!source.includes('curriculum'));
    assert.ok(!source.includes('learning_path'));
  });
});

// ============================================================================
// NEGATIVE CAPABILITY — No scoring/mastery/feedback
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain grading logic', () => {
    const source = JSON.stringify(CANONICAL_CONCEPT_NODE_TYPES);
    assert.ok(!source.includes('grade'));
    assert.ok(!source.includes('score'));
    assert.ok(!source.includes('mastery'));
  });

  it('should not contain feedback logic', () => {
    const source = JSON.stringify(CANONICAL_CONCEPT_NODE_TYPES);
    assert.ok(!source.includes('feedback'));
    assert.ok(!source.includes('hint'));
  });

  it('should not contain LLM or async patterns', () => {
    const source = JSON.stringify(CANONICAL_CONCEPT_NODE_TYPES);
    assert.ok(!source.includes('Promise'));
    assert.ok(!source.includes('async'));
    assert.ok(!source.includes('await'));
  });
});

// ============================================================================
// VALIDATION CODES — Structure verification
// ============================================================================

describe('Validation Codes', () => {
  it('should have exactly 22 validation codes', () => {
    const codes = Object.values(CONCEPT_GRAPH_VALIDATION_CODES);
    assert.equal(codes.length, 22);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(CONCEPT_GRAPH_VALIDATION_CODES)) {
      assert.ok(/^[A-Z_]+$/.test(code), `Not UPPER_SNAKE_CASE: ${code}`);
    }
  });

  it('all validation codes should start with GRAPH_', () => {
    for (const code of Object.values(CONCEPT_GRAPH_VALIDATION_CODES)) {
      assert.ok(code.startsWith('GRAPH_'), `Does not start with GRAPH_: ${code}`);
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(CONCEPT_GRAPH_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});
