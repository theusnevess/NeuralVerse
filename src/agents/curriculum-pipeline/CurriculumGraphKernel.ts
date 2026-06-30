/**
 * NV-1500-D3-OPT-01 — Curriculum Graph Kernel
 *
 * Deterministic orchestration functions for curriculum graph composition.
 * Produces curriculum nodes, edges, graphs, registries, and artifacts.
 *
 * This module never:
 * - Generates curriculum content
 * - Infers learner mastery
 * - Mutates curriculum data
 * - Introduces probabilistic behavior
 * - Calls external APIs
 * - Accesses the filesystem
 * - Uses async operations
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumNode,
  CurriculumEdge,
  CurriculumNodeType,
  CurriculumRelationshipType,
  CurriculumGovernanceStatus,
  CurriculumGraph,
  CurriculumGraphRegistry,
  CurriculumGraphDecision,
  CurriculumGraphTrace,
  CurriculumGraphInput,
  CurriculumArtifact,
  CurriculumGraphProvenance,
  CurriculumNodeProvenance,
  CurriculumEdgeProvenance,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_NODE_TYPES,
  CANONICAL_RELATIONSHIP_TYPES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Canonical Node Type Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a node type is supported (in canonical node types).
 */
export function isSupportedNodeType(nodeType: string): nodeType is CurriculumNodeType {
  return (CANONICAL_NODE_TYPES as readonly string[]).includes(nodeType);
}

/**
 * Returns the canonical node types.
 */
export function getCanonicalNodeTypes(): readonly CurriculumNodeType[] {
  return CANONICAL_NODE_TYPES;
}

// ---------------------------------------------------------------------------
// Canonical Relationship Type Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a relationship type is supported (in canonical relationship types).
 */
export function isSupportedRelationshipType(
  relationshipType: string,
): relationshipType is CurriculumRelationshipType {
  return CANONICAL_RELATIONSHIP_TYPES.includes(relationshipType as CurriculumRelationshipType);
}

/**
 * Returns the canonical relationship types.
 */
export function getCanonicalRelationshipTypes(): readonly CurriculumRelationshipType[] {
  return CANONICAL_RELATIONSHIP_TYPES;
}

// ---------------------------------------------------------------------------
// Governance Status Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a governance status is supported.
 */
export function isSupportedGovernanceStatus(
  status: string,
): status is CurriculumGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(status as CurriculumGovernanceStatus);
}

/**
 * Returns the canonical governance statuses.
 */
export function getCanonicalGovernanceStatuses(): readonly CurriculumGovernanceStatus[] {
  return CANONICAL_GOVERNANCE_STATUSES;
}

// ---------------------------------------------------------------------------
// Compose Curriculum Node
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum node from provided parameters.
 * Pure function. No side effects.
 */
export function composeCurriculumNode(params: {
  readonly nodeId: string;
  readonly nodeType: CurriculumNodeType;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumNode {
  return {
    nodeId: params.nodeId,
    nodeType: params.nodeType,
    referenceId: params.referenceId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Curriculum Edge
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum edge from provided parameters.
 * Pure function. No side effects.
 */
export function composeCurriculumEdge(params: {
  readonly edgeId: string;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly relationshipType: CurriculumRelationshipType;
  readonly referenceId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumEdge {
  return {
    edgeId: params.edgeId,
    sourceNodeId: params.sourceNodeId,
    targetNodeId: params.targetNodeId,
    relationshipType: params.relationshipType,
    referenceId: params.referenceId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Curriculum Provenance
// ---------------------------------------------------------------------------

/**
 * Composes curriculum node provenance from a node.
 * Pure function. No side effects.
 */
export function composeCurriculumProvenance(node: CurriculumNode): CurriculumGraphProvenance {
  return {
    nodeId: node.nodeId,
    referenceId: node.referenceId,
    source: node.source,
    governanceStatus: node.governanceStatus,
    nodeType: node.nodeType,
    rationale: node.rationale,
    providedBy: node.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Node Provenance
// ---------------------------------------------------------------------------

/**
 * Composes node provenance from a node.
 * Pure function. No side effects.
 */
export function composeNodeProvenance(node: CurriculumNode): CurriculumNodeProvenance {
  return {
    nodeId: node.nodeId,
    referenceId: node.referenceId,
    source: node.source,
    governanceStatus: node.governanceStatus,
    nodeType: node.nodeType,
    rationale: node.rationale,
    providedBy: node.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Edge Provenance
// ---------------------------------------------------------------------------

/**
 * Composes edge provenance from an edge.
 * Pure function. No side effects.
 */
export function composeEdgeProvenance(edge: CurriculumEdge): CurriculumEdgeProvenance {
  return {
    edgeId: edge.edgeId,
    referenceId: edge.referenceId,
    relationshipType: edge.relationshipType,
    source: edge.source,
    governanceStatus: edge.governanceStatus,
    rationale: edge.rationale,
    providedBy: edge.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts nodes deterministically by nodeId.
 */
function _sortNodesDeterministically(
  nodes: readonly CurriculumNode[],
): readonly CurriculumNode[] {
  return [...nodes].sort((a, b) => a.nodeId.localeCompare(b.nodeId));
}

/**
 * Sorts edges deterministically by edgeId.
 */
function _sortEdgesDeterministically(
  edges: readonly CurriculumEdge[],
): readonly CurriculumEdge[] {
  return [...edges].sort((a, b) => a.edgeId.localeCompare(b.edgeId));
}

/**
 * Sorts graphs deterministically by graphId.
 */
function _sortGraphsDeterministically(
  graphs: readonly CurriculumGraph[],
): readonly CurriculumGraph[] {
  return [...graphs].sort((a, b) => a.graphId.localeCompare(b.graphId));
}

// ---------------------------------------------------------------------------
// Compose Curriculum Graph
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum graph from an input.
 * Pure function. No side effects.
 * Nodes sorted by nodeId. Edges sorted by edgeId.
 */
export function composeCurriculumGraph(input: CurriculumGraphInput): CurriculumGraph {
  const sortedNodes = _sortNodesDeterministically(input.nodes);
  const sortedEdges = _sortEdgesDeterministically(input.edges);

  return {
    graphId: input.graphId,
    graphLabel: input.graphLabel,
    nodes: sortedNodes,
    edges: sortedEdges,
    deterministic: true,
    generatedFrom: 'deterministic_curriculum_graph_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Curriculum Graph Decisions
// ---------------------------------------------------------------------------

/**
 * Composes decisions for a graph's nodes.
 * Pure function. No side effects.
 */
function _composeDecisions(nodes: readonly CurriculumNode[]): readonly CurriculumGraphDecision[] {
  return nodes.map((node) => {
    const validationErrors = _validateNodeForDecision(node);
    return {
      decisionId: `_decision_${node.nodeId}`,
      nodeId: node.nodeId,
      validationPassed: validationErrors.length === 0,
      validationErrors,
    };
  });
}

/**
 * Validates a node for decision composition.
 * Returns validation error codes.
 */
function _validateNodeForDecision(node: CurriculumNode): readonly string[] {
  const errors: string[] = [];

  if (!node.nodeId || node.nodeId.trim() === '') {
    errors.push('CURRICULUM_MISSING_NODE_ID');
  }

  if (!isSupportedNodeType(node.nodeType)) {
    errors.push('CURRICULUM_UNKNOWN_NODE_TYPE');
  }

  if (!node.referenceId || node.referenceId.trim() === '') {
    errors.push('CURRICULUM_MISSING_REFERENCE_ID');
  }

  if (!node.source || node.source.trim() === '') {
    errors.push('CURRICULUM_MISSING_SOURCE');
  }

  if (!isSupportedGovernanceStatus(node.governanceStatus)) {
    errors.push('CURRICULUM_INVALID_GOVERNANCE_STATUS');
  }

  if (!node.rationale || node.rationale.trim() === '') {
    errors.push('CURRICULUM_MISSING_RATIONALE');
  }

  if (!node.providedBy || node.providedBy.trim() === '') {
    errors.push('CURRICULUM_MISSING_PROVIDED_BY');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Compose Curriculum Graph Trace
// ---------------------------------------------------------------------------

/**
 * Composes a trace for a curriculum graph.
 * Pure function. No side effects.
 */
export function composeCurriculumTrace(
  graphId: string,
  nodes: readonly CurriculumNode[],
  edges: readonly CurriculumEdge[],
): CurriculumGraphTrace {
  const decisions = _composeDecisions(nodes);

  return {
    traceId: `_trace_${graphId}`,
    graphId,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    decisionsCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_curriculum_graph_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Curriculum Registry
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum graph registry from multiple graphs.
 * Pure function. No side effects.
 * Graphs sorted by graphId.
 */
export function composeCurriculumRegistry(
  registryId: string,
  graphs: readonly CurriculumGraph[],
): CurriculumGraphRegistry {
  const sortedGraphs = _sortGraphsDeterministically(graphs);

  const totalNodeCount = sortedGraphs.reduce((sum, g) => sum + g.nodes.length, 0);
  const totalEdgeCount = sortedGraphs.reduce((sum, g) => sum + g.edges.length, 0);

  return {
    registryId,
    graphs: sortedGraphs,
    nodeCount: totalNodeCount,
    edgeCount: totalEdgeCount,
    graphCount: sortedGraphs.length,
    deterministic: true,
    generatedFrom: 'deterministic_curriculum_graph_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Curriculum Artifact
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum artifact containing graph, trace, and validation.
 * Pure function. No side effects.
 */
export function composeCurriculumArtifact(
  artifactId: string,
  graph: CurriculumGraph,
  trace: CurriculumGraphTrace,
  validation: CurriculumArtifact['validation'],
): CurriculumArtifact {
  return {
    artifactId,
    graph,
    trace,
    validation,
    deterministic: true,
    generatedFrom: 'deterministic_curriculum_graph_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}
