/**
 * NV-1500-D3-OPT-01 — Curriculum Graph Validation Layer
 *
 * Deterministic validation for curriculum graph structures.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumNode,
  CurriculumEdge,
  CurriculumGraph,
  CurriculumGraphRegistry,
  CurriculumGraphInput,
  CurriculumNodeType,
  CurriculumRelationshipType,
  CurriculumGraphValidationError,
  CurriculumGraphValidationResult,
  CurriculumArtifact,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_NODE_TYPES,
  CANONICAL_RELATIONSHIP_TYPES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const CURRICULUM_VALIDATION_CODES = {
  CURRICULUM_UNKNOWN_NODE_TYPE: 'CURRICULUM_UNKNOWN_NODE_TYPE',
  CURRICULUM_UNKNOWN_RELATIONSHIP: 'CURRICULUM_UNKNOWN_RELATIONSHIP',
  CURRICULUM_DUPLICATE_NODE: 'CURRICULUM_DUPLICATE_NODE',
  CURRICULUM_DUPLICATE_EDGE: 'CURRICULUM_DUPLICATE_EDGE',
  CURRICULUM_SELF_REFERENCE: 'CURRICULUM_SELF_REFERENCE',
  CURRICULUM_INVALID_REFERENCE: 'CURRICULUM_INVALID_REFERENCE',
  CURRICULUM_MISSING_SOURCE: 'CURRICULUM_MISSING_SOURCE',
  CURRICULUM_MISSING_PROVENANCE: 'CURRICULUM_MISSING_PROVENANCE',
  CURRICULUM_EMPTY_GRAPH: 'CURRICULUM_EMPTY_GRAPH',
  CURRICULUM_EMPTY_REGISTRY: 'CURRICULUM_EMPTY_REGISTRY',
  CURRICULUM_INVALID_STATUS: 'CURRICULUM_INVALID_STATUS',
  CURRICULUM_MISSING_NODE_ID: 'CURRICULUM_MISSING_NODE_ID',
  CURRICULUM_MISSING_EDGE_ID: 'CURRICULUM_MISSING_EDGE_ID',
  CURRICULUM_MISSING_REFERENCE_ID: 'CURRICULUM_MISSING_REFERENCE_ID',
  CURRICULUM_MISSING_RATIONALE: 'CURRICULUM_MISSING_RATIONALE',
  CURRICULUM_MISSING_PROVIDED_BY: 'CURRICULUM_MISSING_PROVIDED_BY',
  CURRICULUM_MISSING_GRAPH_ID: 'CURRICULUM_MISSING_GRAPH_ID',
  CURRICULUM_INVALID_GOVERNANCE_STATUS: 'CURRICULUM_INVALID_GOVERNANCE_STATUS',
  CURRICULUM_EDGE_REFERENCES_MISSING_NODE: 'CURRICULUM_EDGE_REFERENCES_MISSING_NODE',
  CURRICULUM_TRACE_NOT_DETERMINISTIC: 'CURRICULUM_TRACE_NOT_DETERMINISTIC',
  CURRICULUM_TRACE_RANDOM_USED: 'CURRICULUM_TRACE_RANDOM_USED',
  CURRICULUM_TRACE_TIME_DEPENDENCY: 'CURRICULUM_TRACE_TIME_DEPENDENCY',
} as const;

// ---------------------------------------------------------------------------
// Node Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curriculum node against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumNode(
  node: CurriculumNode,
): readonly CurriculumGraphValidationError[] {
  const errors: CurriculumGraphValidationError[] = [];

  if (!node.nodeId || node.nodeId.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_NODE_ID,
      message: 'Curriculum node is missing a node ID.',
      field: 'nodeId',
      nodeId: node.nodeId,
    });
  }

  if (!(CANONICAL_NODE_TYPES as readonly CurriculumNodeType[]).includes(node.nodeType)) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_UNKNOWN_NODE_TYPE,
      message: `Curriculum node has unsupported node type: "${node.nodeType}".`,
      field: 'nodeType',
      nodeId: node.nodeId,
    });
  }

  if (!node.referenceId || node.referenceId.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_REFERENCE_ID,
      message: 'Curriculum node is missing a reference ID.',
      field: 'referenceId',
      nodeId: node.nodeId,
    });
  }

  if (!node.source || node.source.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_SOURCE,
      message: 'Curriculum node is missing a source.',
      field: 'source',
      nodeId: node.nodeId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(node.governanceStatus)) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_INVALID_GOVERNANCE_STATUS,
      message: `Curriculum node has invalid governance status: "${node.governanceStatus}".`,
      field: 'governanceStatus',
      nodeId: node.nodeId,
    });
  }

  if (!node.rationale || node.rationale.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_RATIONALE,
      message: 'Curriculum node is missing a rationale.',
      field: 'rationale',
      nodeId: node.nodeId,
    });
  }

  if (!node.providedBy || node.providedBy.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_PROVIDED_BY,
      message: 'Curriculum node is missing a providedBy.',
      field: 'providedBy',
      nodeId: node.nodeId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Edge Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curriculum edge against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumEdge(
  edge: CurriculumEdge,
  nodeIds: readonly string[],
): readonly CurriculumGraphValidationError[] {
  const errors: CurriculumGraphValidationError[] = [];

  if (!edge.edgeId || edge.edgeId.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_EDGE_ID,
      message: 'Curriculum edge is missing an edge ID.',
      field: 'edgeId',
      edgeId: edge.edgeId,
    });
  }

  if (!CANONICAL_RELATIONSHIP_TYPES.includes(edge.relationshipType)) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_UNKNOWN_RELATIONSHIP,
      message: `Curriculum edge has unsupported relationship type: "${edge.relationshipType}".`,
      field: 'relationshipType',
      edgeId: edge.edgeId,
    });
  }

  if (!edge.sourceNodeId || edge.sourceNodeId.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_PROVENANCE,
      message: 'Curriculum edge is missing a source node ID.',
      field: 'sourceNodeId',
      edgeId: edge.edgeId,
    });
  }

  if (!edge.targetNodeId || edge.targetNodeId.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_PROVENANCE,
      message: 'Curriculum edge is missing a target node ID.',
      field: 'targetNodeId',
      edgeId: edge.edgeId,
    });
  }

  // Self-reference check
  if (edge.sourceNodeId && edge.targetNodeId && edge.sourceNodeId === edge.targetNodeId) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_SELF_REFERENCE,
      message: `Curriculum edge references itself: "${edge.edgeId}" connects node to itself.`,
      field: 'sourceNodeId',
      edgeId: edge.edgeId,
    });
  }

  // Edge references existing nodes
  if (edge.sourceNodeId && !nodeIds.includes(edge.sourceNodeId)) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_EDGE_REFERENCES_MISSING_NODE,
      message: `Curriculum edge references non-existent source node: "${edge.sourceNodeId}".`,
      field: 'sourceNodeId',
      edgeId: edge.edgeId,
    });
  }

  if (edge.targetNodeId && !nodeIds.includes(edge.targetNodeId)) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_EDGE_REFERENCES_MISSING_NODE,
      message: `Curriculum edge references non-existent target node: "${edge.targetNodeId}".`,
      field: 'targetNodeId',
      edgeId: edge.edgeId,
    });
  }

  if (!edge.referenceId || edge.referenceId.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_REFERENCE_ID,
      message: 'Curriculum edge is missing a reference ID.',
      field: 'referenceId',
      edgeId: edge.edgeId,
    });
  }

  if (!edge.source || edge.source.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_SOURCE,
      message: 'Curriculum edge is missing a source.',
      field: 'source',
      edgeId: edge.edgeId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(edge.governanceStatus)) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_INVALID_GOVERNANCE_STATUS,
      message: `Curriculum edge has invalid governance status: "${edge.governanceStatus}".`,
      field: 'governanceStatus',
      edgeId: edge.edgeId,
    });
  }

  if (!edge.rationale || edge.rationale.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_RATIONALE,
      message: 'Curriculum edge is missing a rationale.',
      field: 'rationale',
      edgeId: edge.edgeId,
    });
  }

  if (!edge.providedBy || edge.providedBy.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_PROVIDED_BY,
      message: 'Curriculum edge is missing a providedBy.',
      field: 'providedBy',
      edgeId: edge.edgeId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Graph Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum graph against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumGraph(
  graph: CurriculumGraph,
): CurriculumGraphValidationResult {
  const errors: CurriculumGraphValidationError[] = [];

  if (!graph.graphId || graph.graphId.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_GRAPH_ID,
      message: 'Curriculum graph is missing a graph ID.',
      field: 'graphId',
    });
  }

  // Empty graph check
  if (graph.nodes.length === 0) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_EMPTY_GRAPH,
      message: 'Curriculum graph has no nodes.',
      field: 'nodes',
    });
  }

  // Duplicate node check
  const seenNodeIds = new Set<string>();
  for (const node of graph.nodes) {
    if (seenNodeIds.has(node.nodeId)) {
      errors.push({
        code: CURRICULUM_VALIDATION_CODES.CURRICULUM_DUPLICATE_NODE,
        message: `Duplicate node ID: "${node.nodeId}".`,
        nodeId: node.nodeId,
      });
    }
    seenNodeIds.add(node.nodeId);
  }

  // Validate each node
  for (const node of graph.nodes) {
    errors.push(...validateCurriculumNode(node));
  }

  // Duplicate edge check
  const seenEdgeIds = new Set<string>();
  for (const edge of graph.edges) {
    if (seenEdgeIds.has(edge.edgeId)) {
      errors.push({
        code: CURRICULUM_VALIDATION_CODES.CURRICULUM_DUPLICATE_EDGE,
        message: `Duplicate edge ID: "${edge.edgeId}".`,
        edgeId: edge.edgeId,
      });
    }
    seenEdgeIds.add(edge.edgeId);
  }

  // Validate each edge
  const nodeIds = graph.nodes.map((n) => n.nodeId);
  for (const edge of graph.edges) {
    errors.push(...validateCurriculumEdge(edge, nodeIds));
  }

  // Deterministic metadata check
  if (graph.deterministic !== true) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum graph must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (graph.randomUsed !== false) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_TRACE_RANDOM_USED,
      message: 'Curriculum graph must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (graph.timeDependency !== false) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum graph must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_graph_composition',
  };
}

// ---------------------------------------------------------------------------
// Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum graph registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumRegistry(
  registry: CurriculumGraphRegistry,
): CurriculumGraphValidationResult {
  const errors: CurriculumGraphValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_PROVENANCE,
      message: 'Curriculum registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (registry.graphs.length === 0) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_EMPTY_REGISTRY,
      message: 'Curriculum registry has no graphs.',
      field: 'graphs',
    });
  }

  // Validate each graph
  for (const graph of registry.graphs) {
    const graphResult = validateCurriculumGraph(graph);
    errors.push(...graphResult.errors);
  }

  // Deterministic metadata check
  if (registry.deterministic !== true) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_TRACE_RANDOM_USED,
      message: 'Curriculum registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_graph_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum artifact against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumArtifact(
  artifact: CurriculumArtifact,
): CurriculumGraphValidationResult {
  const errors: CurriculumGraphValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_PROVENANCE,
      message: 'Curriculum artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate graph
  if (artifact.graph) {
    const graphResult = validateCurriculumGraph(artifact.graph);
    errors.push(...graphResult.errors);
  }

  // Deterministic metadata check
  if (artifact.deterministic !== true) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum artifact must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (artifact.randomUsed !== false) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_TRACE_RANDOM_USED,
      message: 'Curriculum artifact must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (artifact.timeDependency !== false) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum artifact must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_graph_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates curriculum graph input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumInput(
  input: CurriculumGraphInput,
): readonly CurriculumGraphValidationError[] {
  const errors: CurriculumGraphValidationError[] = [];

  if (!input.graphId || input.graphId.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_GRAPH_ID,
      message: 'Curriculum graph input is missing a graph ID.',
      field: 'graphId',
    });
  }

  if (!input.graphLabel || input.graphLabel.trim() === '') {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_MISSING_PROVENANCE,
      message: 'Curriculum graph input is missing a graph label.',
      field: 'graphLabel',
    });
  }

  if (!input.nodes || input.nodes.length === 0) {
    errors.push({
      code: CURRICULUM_VALIDATION_CODES.CURRICULUM_EMPTY_GRAPH,
      message: 'Curriculum graph input has no nodes.',
      field: 'nodes',
    });
  } else {
    for (const node of input.nodes) {
      errors.push(...validateCurriculumNode(node));
    }
  }

  if (input.edges) {
    const nodeIds = (input.nodes || []).map((n) => n.nodeId);
    for (const edge of input.edges) {
      errors.push(...validateCurriculumEdge(edge, nodeIds));
    }
  }

  return errors;
}
