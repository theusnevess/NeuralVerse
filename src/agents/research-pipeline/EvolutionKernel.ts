/**
 * NV-1400-D2-OPT-08 — Scientific Evolution Mapping Orchestration Kernel
 *
 * Deterministic orchestration functions for scientific evolution metadata.
 * Produces evolution graphs, nodes, edges, and traces.
 *
 * This module never:
 * - Infers evolution
 * - Predicts future work
 * - Recommends papers
 * - Recommends methods
 * - Calculates graph metrics
 * - Executes graph algorithms
 * - Clusters nodes
 * - Calls external APIs
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchEvolutionNode,
  ResearchEvolutionEdge,
  ResearchEvolutionGraph,
  ResearchEvolutionDecision,
  ResearchEvolutionTrace,
  ResearchEvolutionRegistry,
  ResearchEvolutionInput,
  ResearchArtifactWithEvolution,
  ResearchEvolutionProvenance,
  ResearchEvolutionRelationType,
  ResearchEvolutionNodeType,
  ResearchGovernanceStatus,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_EVOLUTION_RELATIONS,
  CANONICAL_EVOLUTION_NODE_TYPES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Evolution Node Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evolution node.
 * Pure function. No side effects.
 */
export function composeEvolutionNode(
  nodeId: string,
  nodeType: ResearchEvolutionNodeType,
  title: string,
  referenceId: string,
  governanceStatus: ResearchGovernanceStatus,
  rationale: string,
): ResearchEvolutionNode {
  return {
    nodeId,
    nodeType,
    title,
    referenceId,
    governanceStatus,
    rationale,
  };
}

// ---------------------------------------------------------------------------
// Evolution Edge Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evolution edge with provenance.
 * Pure function. No side effects.
 */
export function composeEvolutionEdge(
  edgeId: string,
  sourceNodeId: string,
  targetNodeId: string,
  relationType: ResearchEvolutionRelationType,
  referenceId: string,
  governanceStatus: ResearchGovernanceStatus,
  rationale: string,
  providedBy: string,
  provenance: ResearchEvolutionProvenance,
): ResearchEvolutionEdge {
  return {
    edgeId,
    sourceNodeId,
    targetNodeId,
    relationType,
    referenceId,
    governanceStatus,
    rationale,
    providedBy,
    provenance,
  };
}

// ---------------------------------------------------------------------------
// Evolution Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes evolution provenance.
 * Pure function. No side effects.
 */
export function composeEvolutionProvenance(
  edgeId: string,
  referenceId: string,
  source: string,
  governanceStatus: ResearchGovernanceStatus,
  relationType: ResearchEvolutionRelationType,
  rationale: string,
  providedBy: string,
): ResearchEvolutionProvenance {
  return {
    edgeId,
    referenceId,
    source,
    governanceStatus,
    relationType,
    rationale,
    providedBy,
  };
}

// ---------------------------------------------------------------------------
// Evolution Graph Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evolution graph from nodes and edges.
 * Pure function. No side effects.
 */
export function composeEvolutionGraph(
  graphId: string,
  nodes: readonly ResearchEvolutionNode[],
  edges: readonly ResearchEvolutionEdge[],
): ResearchEvolutionGraph {
  return {
    graphId,
    nodes: [...nodes],
    edges: [...edges],
    deterministic: true,
    generatedFrom: 'deterministic_evolution_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Evolution Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evolution registry from graphs.
 * Pure function. No side effects.
 */
export function composeEvolutionRegistry(
  registryId: string,
  graphs: readonly ResearchEvolutionGraph[],
): ResearchEvolutionRegistry {
  const sortedGraphs = _sortGraphsDeterministically(graphs);

  return {
    registryId,
    graphs: [...sortedGraphs],
    deterministic: true,
    generatedFrom: 'deterministic_evolution_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Research Evolution Composition
// ---------------------------------------------------------------------------

/**
 * Composes research evolution from an input.
 * Pure function. No side effects.
 */
export function composeResearchEvolution(
  input: ResearchEvolutionInput,
): ResearchArtifactWithEvolution {
  const decisions = _composeDecisions(input);

  const trace: ResearchEvolutionTrace = {
    traceId: `_evolution_trace_${input.conceptId}`,
    nodeCount: input.nodes.length,
    edgeCount: input.edges.length,
    decisionsCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_evolution_kernel',
    randomUsed: false,
    timeDependency: false,
  };

  const graph = composeEvolutionGraph(
    `_evolution_graph_${input.conceptId}`,
    input.nodes,
    input.edges,
  );

  return {
    artifactId: `_evolution_artifact_${input.conceptId}`,
    artifactType: 'concept',
    evolutionGraph: graph,
    evolutionTrace: trace,
  };
}

/**
 * Composes evolution decisions from input edges.
 * Pure function. No side effects.
 */
function _composeDecisions(
  input: ResearchEvolutionInput,
): readonly ResearchEvolutionDecision[] {
  return input.edges.map((edge) => {
    const validationErrors = _validateEdgeForDecision(edge, input.nodes);
    const validationPassed = validationErrors.length === 0;

    return {
      decisionId: `_decision_${edge.edgeId}`,
      edgeId: edge.edgeId,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      relationType: edge.relationType,
      validationPassed,
      validationErrors,
    };
  });
}

/**
 * Validates an edge for decision composition.
 * Returns validation error codes.
 */
function _validateEdgeForDecision(
  edge: ResearchEvolutionEdge,
  nodes: readonly ResearchEvolutionNode[],
): readonly string[] {
  const errors: string[] = [];

  if (!CANONICAL_EVOLUTION_RELATIONS.includes(edge.relationType)) {
    errors.push('EVOLUTION_UNKNOWN_RELATION');
  }

  if (!edge.sourceNodeId || edge.sourceNodeId.trim() === '') {
    errors.push('EVOLUTION_MISSING_SOURCE');
  }

  if (!edge.targetNodeId || edge.targetNodeId.trim() === '') {
    errors.push('EVOLUTION_MISSING_TARGET');
  }

  if (edge.sourceNodeId === edge.targetNodeId) {
    errors.push('EVOLUTION_SELF_REFERENCE');
  }

  // Check if source node exists
  const sourceNodeExists = nodes.some((n) => n.nodeId === edge.sourceNodeId);
  if (!sourceNodeExists) {
    errors.push('EVOLUTION_INVALID_REFERENCE');
  }

  // Check if target node exists
  const targetNodeExists = nodes.some((n) => n.nodeId === edge.targetNodeId);
  if (!targetNodeExists) {
    errors.push('EVOLUTION_INVALID_REFERENCE');
  }

  if (!edge.provenance || !edge.provenance.rationale || edge.provenance.rationale.trim() === '') {
    errors.push('EVOLUTION_MISSING_PROVENANCE');
  }

  if (!edge.governanceStatus || edge.governanceStatus.trim() === '') {
    errors.push('EVOLUTION_INVALID_STATUS');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts evolution graphs deterministically.
 * Sorting based on graphId for consistent ordering.
 * Pure function. No side effects.
 */
function _sortGraphsDeterministically(
  graphs: readonly ResearchEvolutionGraph[],
): readonly ResearchEvolutionGraph[] {
  return [...graphs].sort((a, b) => a.graphId.localeCompare(b.graphId));
}

// ---------------------------------------------------------------------------
// Deterministic Cycle Detection
// ---------------------------------------------------------------------------

// DFS color constants
const DFS_WHITE = 0; // Unvisited
const DFS_GRAY = 1; // In progress
const DFS_BLACK = 2; // Completed

/**
 * Detects cycles in the evolution graph using deterministic DFS.
 * Traversal order is always identical for identical input.
 * Returns true if a cycle is detected.
 * Pure function. No side effects.
 */
export function detectEvolutionCycles(
  nodes: readonly ResearchEvolutionNode[],
  edges: readonly ResearchEvolutionEdge[],
): boolean {
  // Build adjacency list deterministically (sorted by nodeId)
  const adjacencyList = new Map<string, string[]>();
  const sortedNodeIds = [...nodes].map((n) => n.nodeId).sort();

  for (const nodeId of sortedNodeIds) {
    adjacencyList.set(nodeId, []);
  }

  // Add edges deterministically (sorted by edgeId)
  const sortedEdges = [...edges].sort((a, b) => a.edgeId.localeCompare(b.edgeId));
  for (const edge of sortedEdges) {
    const targets = adjacencyList.get(edge.sourceNodeId);
    if (targets) {
      targets.push(edge.targetNodeId);
    }
  }

  // Sort adjacency lists for deterministic traversal
  for (const targets of adjacencyList.values()) {
    targets.sort();
  }

  // DFS with three-color marking
  const color = new Map<string, number>();
  for (const nodeId of sortedNodeIds) {
    color.set(nodeId, DFS_WHITE);
  }

  // Deterministic DFS
  for (const nodeId of sortedNodeIds) {
    if (color.get(nodeId) === DFS_WHITE) {
      if (_dfsDetectCycle(nodeId, adjacencyList, color)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Deterministic DFS helper for cycle detection.
 * Returns true if a cycle is found.
 */
function _dfsDetectCycle(
  nodeId: string,
  adjacencyList: Map<string, string[]>,
  color: Map<string, number>,
): boolean {
  color.set(nodeId, DFS_GRAY);

  const targets = adjacencyList.get(nodeId) || [];
  for (const target of targets) {
    const targetColor = color.get(target);
    if (targetColor === DFS_GRAY) {
      // Back edge found - cycle detected
      return true;
    }
    if (targetColor === DFS_WHITE) {
      if (_dfsDetectCycle(target, adjacencyList, color)) {
        return true;
      }
    }
  }

  color.set(nodeId, DFS_BLACK);
  return false;
}

// ---------------------------------------------------------------------------
// Evolution Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evolution trace.
 * Pure function. No side effects.
 */
export function composeEvolutionTrace(
  traceId: string,
  nodeCount: number,
  edgeCount: number,
  decisions: readonly ResearchEvolutionDecision[],
): ResearchEvolutionTrace {
  return {
    traceId,
    nodeCount,
    edgeCount,
    decisionsCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions: [...decisions],
    deterministic: true,
    generatedFrom: 'deterministic_evolution_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Relation Type and Node Type Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if an evolution relation type is supported (in canonical relations).
 */
export function isSupportedEvolutionRelationType(
  relationType: string,
): relationType is ResearchEvolutionRelationType {
  return CANONICAL_EVOLUTION_RELATIONS.includes(relationType as ResearchEvolutionRelationType);
}

/**
 * Checks if an evolution node type is supported (in canonical node types).
 */
export function isSupportedEvolutionNodeType(
  nodeType: string,
): nodeType is ResearchEvolutionNodeType {
  return CANONICAL_EVOLUTION_NODE_TYPES.includes(nodeType as ResearchEvolutionNodeType);
}

/**
 * Returns all canonical evolution relation types.
 */
export function getCanonicalEvolutionRelationTypes(): readonly ResearchEvolutionRelationType[] {
  return CANONICAL_EVOLUTION_RELATIONS;
}

/**
 * Returns all canonical evolution node types.
 */
export function getCanonicalEvolutionNodeTypes(): readonly ResearchEvolutionNodeType[] {
  return CANONICAL_EVOLUTION_NODE_TYPES;
}
