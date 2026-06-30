/**
 * NV-1400-D2-OPT-02 — Lineage Validation Layer
 *
 * Deterministic validation for research lineage metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchLineageNode,
  ResearchLineageEdge,
  ResearchLineageGraph,
  ResearchArtifactWithLineage,
  ResearchLineageValidationError,
  ResearchLineageValidationResult,
  ResearchLineageInput,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_LINEAGE_RELATIONS,
  CANONICAL_SOURCE_TYPES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const LINEAGE_VALIDATION_CODES = {
  LINEAGE_UNKNOWN_RELATION: 'LINEAGE_UNKNOWN_RELATION',
  LINEAGE_DUPLICATE_EDGE: 'LINEAGE_DUPLICATE_EDGE',
  LINEAGE_SELF_REFERENCE: 'LINEAGE_SELF_REFERENCE',
  LINEAGE_ORPHAN_NODE: 'LINEAGE_ORPHAN_NODE',
  LINEAGE_CYCLE_DETECTED: 'LINEAGE_CYCLE_DETECTED',
  LINEAGE_INVALID_DIRECTION: 'LINEAGE_INVALID_DIRECTION',
  LINEAGE_MISSING_SOURCE: 'LINEAGE_MISSING_SOURCE',
  LINEAGE_MISSING_TARGET: 'LINEAGE_MISSING_TARGET',
  LINEAGE_MISSING_PROVENANCE: 'LINEAGE_MISSING_PROVENANCE',
  LINEAGE_INVALID_STATUS: 'LINEAGE_INVALID_STATUS',
} as const;

// ---------------------------------------------------------------------------
// Node Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single lineage node.
 * Pure function. No side effects.
 */
export function validateLineageNode(
  node: ResearchLineageNode,
): readonly ResearchLineageValidationError[] {
  const errors: ResearchLineageValidationError[] = [];

  if (!node.nodeId || node.nodeId.trim() === '') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_SOURCE,
      message: 'Lineage node is missing a node ID.',
      field: 'nodeId',
      nodeId: node.nodeId,
    });
  }

  if (!node.referenceId || node.referenceId.trim() === '') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_SOURCE,
      message: 'Lineage node is missing a reference ID.',
      field: 'referenceId',
      nodeId: node.nodeId,
    });
  }

  if (!node.title || node.title.trim() === '') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_SOURCE,
      message: 'Lineage node is missing a title.',
      field: 'title',
      nodeId: node.nodeId,
    });
  }

  if (!CANONICAL_SOURCE_TYPES.includes(node.sourceType)) {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_INVALID_STATUS,
      message: `Lineage node has unsupported source type: "${node.sourceType}".`,
      field: 'sourceType',
      nodeId: node.nodeId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Edge Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single lineage edge.
 * Pure function. No side effects.
 */
export function validateLineageEdge(
  edge: ResearchLineageEdge,
  nodeIds: readonly string[],
): readonly ResearchLineageValidationError[] {
  const errors: ResearchLineageValidationError[] = [];

  if (!edge.edgeId || edge.edgeId.trim() === '') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_SOURCE,
      message: 'Lineage edge is missing an edge ID.',
      field: 'edgeId',
      edgeId: edge.edgeId,
    });
  }

  if (!edge.sourceNodeId || edge.sourceNodeId.trim() === '') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_SOURCE,
      message: 'Lineage edge is missing a source node ID.',
      field: 'sourceNodeId',
      edgeId: edge.edgeId,
    });
  }

  if (!edge.targetNodeId || edge.targetNodeId.trim() === '') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_TARGET,
      message: 'Lineage edge is missing a target node ID.',
      field: 'targetNodeId',
      edgeId: edge.edgeId,
    });
  }

  if (!CANONICAL_LINEAGE_RELATIONS.includes(edge.relationType)) {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_UNKNOWN_RELATION,
      message: `Lineage edge has unsupported relation type: "${edge.relationType}".`,
      field: 'relationType',
      edgeId: edge.edgeId,
    });
  }

  if (edge.sourceNodeId === edge.targetNodeId && edge.sourceNodeId !== '') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_SELF_REFERENCE,
      message: `Lineage edge references itself: "${edge.sourceNodeId}".`,
      edgeId: edge.edgeId,
    });
  }

  if (nodeIds.length > 0) {
    if (edge.sourceNodeId && !nodeIds.includes(edge.sourceNodeId)) {
      errors.push({
        code: LINEAGE_VALIDATION_CODES.LINEAGE_ORPHAN_NODE,
        message: `Lineage edge references non-existent source node: "${edge.sourceNodeId}".`,
        field: 'sourceNodeId',
        edgeId: edge.edgeId,
      });
    }

    if (edge.targetNodeId && !nodeIds.includes(edge.targetNodeId)) {
      errors.push({
        code: LINEAGE_VALIDATION_CODES.LINEAGE_ORPHAN_NODE,
        message: `Lineage edge references non-existent target node: "${edge.targetNodeId}".`,
        field: 'targetNodeId',
        edgeId: edge.edgeId,
      });
    }
  }

  if (!edge.provenance || typeof edge.provenance !== 'object') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_PROVENANCE,
      message: 'Lineage edge is missing provenance.',
      field: 'provenance',
      edgeId: edge.edgeId,
    });
  } else {
    if (!edge.provenance.rationale || edge.provenance.rationale.trim() === '') {
      errors.push({
        code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_PROVENANCE,
        message: 'Lineage edge provenance is missing rationale.',
        field: 'provenance.rationale',
        edgeId: edge.edgeId,
      });
    }
    if (!edge.provenance.sourceReferenceId || edge.provenance.sourceReferenceId.trim() === '') {
      errors.push({
        code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_PROVENANCE,
        message: 'Lineage edge provenance is missing source reference ID.',
        field: 'provenance.sourceReferenceId',
        edgeId: edge.edgeId,
      });
    }
    if (!edge.provenance.targetReferenceId || edge.provenance.targetReferenceId.trim() === '') {
      errors.push({
        code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_PROVENANCE,
        message: 'Lineage edge provenance is missing target reference ID.',
        field: 'provenance.targetReferenceId',
        edgeId: edge.edgeId,
      });
    }
  }

  if (!edge.governanceStatus || edge.governanceStatus.trim() === '') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_INVALID_STATUS,
      message: 'Lineage edge is missing governance status.',
      field: 'governanceStatus',
      edgeId: edge.edgeId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Graph Validation
// ---------------------------------------------------------------------------

/**
 * Validates a lineage graph for structural integrity.
 * Pure function. No side effects.
 */
export function validateLineageGraph(
  graph: ResearchLineageGraph,
): readonly ResearchLineageValidationError[] {
  const errors: ResearchLineageValidationError[] = [];

  if (!graph.graphId || graph.graphId.trim() === '') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_SOURCE,
      message: 'Lineage graph is missing a graph ID.',
      field: 'graphId',
    });
  }

  // Validate all nodes
  for (const node of graph.nodes) {
    errors.push(...validateLineageNode(node));
  }

  // Check for duplicate nodes
  const nodeIds = graph.nodes.map((n) => n.nodeId);
  const uniqueNodeIds = new Set(nodeIds);
  if (uniqueNodeIds.size !== nodeIds.length) {
    const seen = new Set<string>();
    for (const nodeId of nodeIds) {
      if (seen.has(nodeId)) {
        errors.push({
          code: LINEAGE_VALIDATION_CODES.LINEAGE_DUPLICATE_EDGE,
          message: `Duplicate node ID: "${nodeId}".`,
          nodeId,
        });
      }
      seen.add(nodeId);
    }
  }

  // Validate all edges
  for (const edge of graph.edges) {
    errors.push(...validateLineageEdge(edge, nodeIds));
  }

  // Check for duplicate edges
  const edgeKeys = graph.edges.map((e) => `${e.sourceNodeId}->${e.targetNodeId}->${e.relationType}`);
  const uniqueEdgeKeys = new Set(edgeKeys);
  if (uniqueEdgeKeys.size !== edgeKeys.length) {
    const seen = new Set<string>();
    for (const key of edgeKeys) {
      if (seen.has(key)) {
        errors.push({
          code: LINEAGE_VALIDATION_CODES.LINEAGE_DUPLICATE_EDGE,
          message: `Duplicate edge: "${key}".`,
        });
      }
      seen.add(key);
    }
  }

  // Check for orphan nodes (nodes with no edges)
  const nodesWithEdges = new Set<string>();
  for (const edge of graph.edges) {
    nodesWithEdges.add(edge.sourceNodeId);
    nodesWithEdges.add(edge.targetNodeId);
  }
  for (const node of graph.nodes) {
    if (!nodesWithEdges.has(node.nodeId)) {
      errors.push({
        code: LINEAGE_VALIDATION_CODES.LINEAGE_ORPHAN_NODE,
        message: `Node "${node.nodeId}" has no edges (orphan node).`,
        nodeId: node.nodeId,
      });
    }
  }

  // Check for cycles
  if (_detectCycle(graph.nodes, graph.edges)) {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_CYCLE_DETECTED,
      message: 'Lineage graph contains a cycle.',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Cycle Detection (deterministic DFS)
// ---------------------------------------------------------------------------

/**
 * Detects cycles in a directed graph using deterministic DFS.
 * Pure function. No side effects.
 */
function _detectCycle(
  nodes: readonly ResearchLineageNode[],
  edges: readonly ResearchLineageEdge[],
): boolean {
  const adjacencyList = new Map<string, string[]>();

  // Build adjacency list
  for (const node of nodes) {
    adjacencyList.set(node.nodeId, []);
  }
  for (const edge of edges) {
    const existing = adjacencyList.get(edge.sourceNodeId);
    if (existing) {
      existing.push(edge.targetNodeId);
    }
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  // Visit all nodes in deterministic order
  for (const node of nodes) {
    if (!visited.has(node.nodeId)) {
      if (dfs(node.nodeId)) {
        return true;
      }
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a research artifact with lineage.
 * Pure function. No side effects.
 */
export function validateResearchArtifactWithLineage(
  artifact: ResearchArtifactWithLineage,
): ResearchLineageValidationResult {
  const errors: ResearchLineageValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_SOURCE,
      message: 'Research artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate lineage graph
  errors.push(...validateLineageGraph(artifact.lineageGraph));

  // Validate trace
  if (!artifact.lineageTrace || typeof artifact.lineageTrace !== 'object') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_PROVENANCE,
      message: 'Research artifact is missing lineage trace.',
      field: 'lineageTrace',
    });
  } else {
    if (artifact.lineageTrace.deterministic !== true) {
      errors.push({
        code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_PROVENANCE,
        message: 'Lineage trace must declare deterministic: true.',
        field: 'lineageTrace.deterministic',
      });
    }
    if (artifact.lineageTrace.randomUsed !== false) {
      errors.push({
        code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_PROVENANCE,
        message: 'Lineage trace must declare randomUsed: false.',
        field: 'lineageTrace.randomUsed',
      });
    }
    if (artifact.lineageTrace.timeDependency !== false) {
      errors.push({
        code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_PROVENANCE,
        message: 'Lineage trace must declare timeDependency: false.',
        field: 'lineageTrace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'lineage_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates research lineage input.
 * Pure function. No side effects.
 */
export function validateLineageInput(
  input: ResearchLineageInput,
): readonly ResearchLineageValidationError[] {
  const errors: ResearchLineageValidationError[] = [];

  if (!input.conceptId || input.conceptId.trim() === '') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_SOURCE,
      message: 'Lineage input is missing concept ID.',
      field: 'conceptId',
    });
  }

  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_SOURCE,
      message: 'Lineage input is missing concept label.',
      field: 'conceptLabel',
    });
  }

  if (!input.nodes || input.nodes.length === 0) {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_SOURCE,
      message: 'Lineage input has no nodes.',
      field: 'nodes',
    });
  } else {
    for (const node of input.nodes) {
      errors.push(...validateLineageNode(node));
    }
  }

  if (!input.edges || input.edges.length === 0) {
    errors.push({
      code: LINEAGE_VALIDATION_CODES.LINEAGE_MISSING_SOURCE,
      message: 'Lineage input has no edges.',
      field: 'edges',
    });
  } else {
    const nodeIds = input.nodes?.map((n) => n.nodeId) || [];
    for (const edge of input.edges) {
      errors.push(...validateLineageEdge(edge, nodeIds));
    }
  }

  return errors;
}
