/**
 * NV-1400-D2-OPT-08 — Evolution Validation Layer
 *
 * Deterministic validation for scientific evolution metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchEvolutionNode,
  ResearchEvolutionEdge,
  ResearchEvolutionGraph,
  ResearchArtifactWithEvolution,
  ResearchEvolutionValidationError,
  ResearchEvolutionValidationResult,
  ResearchEvolutionInput,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_EVOLUTION_RELATIONS,
  CANONICAL_EVOLUTION_NODE_TYPES,
} from './ResearchAgentContract.ts';

import { detectEvolutionCycles } from './EvolutionKernel.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const EVOLUTION_VALIDATION_CODES = {
  EVOLUTION_UNKNOWN_RELATION: 'EVOLUTION_UNKNOWN_RELATION',
  EVOLUTION_DUPLICATE_NODE: 'EVOLUTION_DUPLICATE_NODE',
  EVOLUTION_DUPLICATE_EDGE: 'EVOLUTION_DUPLICATE_EDGE',
  EVOLUTION_SELF_REFERENCE: 'EVOLUTION_SELF_REFERENCE',
  EVOLUTION_CYCLE_DETECTED: 'EVOLUTION_CYCLE_DETECTED',
  EVOLUTION_ORPHAN_NODE: 'EVOLUTION_ORPHAN_NODE',
  EVOLUTION_INVALID_REFERENCE: 'EVOLUTION_INVALID_REFERENCE',
  EVOLUTION_MISSING_PROVENANCE: 'EVOLUTION_MISSING_PROVENANCE',
  EVOLUTION_EMPTY_GRAPH: 'EVOLUTION_EMPTY_GRAPH',
  EVOLUTION_EMPTY_REGISTRY: 'EVOLUTION_EMPTY_REGISTRY',
  EVOLUTION_MISSING_SOURCE: 'EVOLUTION_MISSING_SOURCE',
  EVOLUTION_INVALID_STATUS: 'EVOLUTION_INVALID_STATUS',
} as const;

// ---------------------------------------------------------------------------
// Node Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single evolution node.
 * Pure function. No side effects.
 */
export function validateEvolutionNode(
  node: ResearchEvolutionNode,
): readonly ResearchEvolutionValidationError[] {
  const errors: ResearchEvolutionValidationError[] = [];

  if (!node.nodeId || node.nodeId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Evolution node is missing an ID.',
      field: 'nodeId',
      nodeId: node.nodeId,
    });
  }

  if (!CANONICAL_EVOLUTION_NODE_TYPES.includes(node.nodeType)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_REFERENCE,
      message: `Evolution node has unknown type: "${node.nodeType}".`,
      field: 'nodeType',
      nodeId: node.nodeId,
    });
  }

  if (!node.title || node.title.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Evolution node is missing a title.',
      field: 'title',
      nodeId: node.nodeId,
    });
  }

  if (!node.referenceId || node.referenceId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_REFERENCE,
      message: 'Evolution node is missing a reference ID.',
      field: 'referenceId',
      nodeId: node.nodeId,
    });
  }

  if (!node.governanceStatus || node.governanceStatus.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STATUS,
      message: 'Evolution node is missing governance status.',
      field: 'governanceStatus',
      nodeId: node.nodeId,
    });
  }

  if (!node.rationale || node.rationale.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Evolution node is missing a rationale.',
      field: 'rationale',
      nodeId: node.nodeId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Edge Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single evolution edge.
 * Pure function. No side effects.
 */
export function validateEvolutionEdge(
  edge: ResearchEvolutionEdge,
  nodes: readonly ResearchEvolutionNode[],
): readonly ResearchEvolutionValidationError[] {
  const errors: ResearchEvolutionValidationError[] = [];

  if (!edge.edgeId || edge.edgeId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Evolution edge is missing an ID.',
      field: 'edgeId',
      edgeId: edge.edgeId,
    });
  }

  if (!CANONICAL_EVOLUTION_RELATIONS.includes(edge.relationType)) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_UNKNOWN_RELATION,
      message: `Evolution edge has unknown relation type: "${edge.relationType}".`,
      field: 'relationType',
      edgeId: edge.edgeId,
    });
  }

  if (!edge.sourceNodeId || edge.sourceNodeId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Evolution edge is missing source node ID.',
      field: 'sourceNodeId',
      edgeId: edge.edgeId,
    });
  }

  if (!edge.targetNodeId || edge.targetNodeId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Evolution edge is missing target node ID.',
      field: 'targetNodeId',
      edgeId: edge.edgeId,
    });
  }

  if (edge.sourceNodeId === edge.targetNodeId) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_SELF_REFERENCE,
      message: `Evolution edge "${edge.edgeId}" has self-reference.`,
      field: 'sourceNodeId',
      edgeId: edge.edgeId,
    });
  }

  // Check if source node exists
  const sourceNodeExists = nodes.some((n) => n.nodeId === edge.sourceNodeId);
  if (!sourceNodeExists) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_REFERENCE,
      message: `Evolution edge "${edge.edgeId}" references non-existent source node: "${edge.sourceNodeId}".`,
      field: 'sourceNodeId',
      edgeId: edge.edgeId,
    });
  }

  // Check if target node exists
  const targetNodeExists = nodes.some((n) => n.nodeId === edge.targetNodeId);
  if (!targetNodeExists) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_REFERENCE,
      message: `Evolution edge "${edge.edgeId}" references non-existent target node: "${edge.targetNodeId}".`,
      field: 'targetNodeId',
      edgeId: edge.edgeId,
    });
  }

  if (!edge.provenance || typeof edge.provenance !== 'object') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
      message: 'Evolution edge is missing provenance.',
      field: 'provenance',
      edgeId: edge.edgeId,
    });
  } else {
    if (!edge.provenance.rationale || edge.provenance.rationale.trim() === '') {
      errors.push({
        code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
        message: 'Evolution provenance is missing rationale.',
        field: 'provenance.rationale',
        edgeId: edge.edgeId,
      });
    }
    if (!edge.provenance.source || edge.provenance.source.trim() === '') {
      errors.push({
        code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
        message: 'Evolution provenance is missing source.',
        field: 'provenance.source',
        edgeId: edge.edgeId,
      });
    }
  }

  if (!edge.governanceStatus || edge.governanceStatus.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STATUS,
      message: 'Evolution edge is missing governance status.',
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
 * Validates an evolution graph for structural integrity.
 * Pure function. No side effects.
 */
export function validateEvolutionGraph(
  graph: ResearchEvolutionGraph,
): readonly ResearchEvolutionValidationError[] {
  const errors: ResearchEvolutionValidationError[] = [];

  if (!graph.graphId || graph.graphId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Evolution graph is missing a graph ID.',
      field: 'graphId',
    });
  }

  // Check for empty graph
  if (!graph.nodes || graph.nodes.length === 0) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_GRAPH,
      message: 'Evolution graph has no nodes.',
      field: 'nodes',
    });
  }

  // Validate all nodes
  if (graph.nodes) {
    for (const node of graph.nodes) {
      errors.push(...validateEvolutionNode(node));
    }
  }

  // Validate all edges
  if (graph.edges) {
    for (const edge of graph.edges) {
      errors.push(...validateEvolutionEdge(edge, graph.nodes || []));
    }
  }

  // Check for duplicate node IDs
  if (graph.nodes) {
    const seenNodeIds = new Set<string>();
    for (const node of graph.nodes) {
      if (seenNodeIds.has(node.nodeId)) {
        errors.push({
          code: EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_NODE,
          message: `Duplicate node ID: "${node.nodeId}".`,
          nodeId: node.nodeId,
        });
      }
      seenNodeIds.add(node.nodeId);
    }
  }

  // Check for duplicate edge IDs
  if (graph.edges) {
    const seenEdgeIds = new Set<string>();
    for (const edge of graph.edges) {
      if (seenEdgeIds.has(edge.edgeId)) {
        errors.push({
          code: EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_EDGE,
          message: `Duplicate edge ID: "${edge.edgeId}".`,
          edgeId: edge.edgeId,
        });
      }
      seenEdgeIds.add(edge.edgeId);
    }
  }

  // Check for orphan nodes (nodes with no edges)
  if (graph.nodes && graph.edges) {
    const nodeIdsWithEdges = new Set<string>();
    for (const edge of graph.edges) {
      nodeIdsWithEdges.add(edge.sourceNodeId);
      nodeIdsWithEdges.add(edge.targetNodeId);
    }

    for (const node of graph.nodes) {
      if (!nodeIdsWithEdges.has(node.nodeId)) {
        errors.push({
          code: EVOLUTION_VALIDATION_CODES.EVOLUTION_ORPHAN_NODE,
          message: `Node "${node.nodeId}" has no edges (orphan node).`,
          nodeId: node.nodeId,
        });
      }
    }
  }

  // Check for cycles
  if (graph.nodes && graph.edges && graph.nodes.length > 0 && graph.edges.length > 0) {
    const hasCycles = detectEvolutionCycles(graph.nodes, graph.edges);
    if (hasCycles) {
      errors.push({
        code: EVOLUTION_VALIDATION_CODES.EVOLUTION_CYCLE_DETECTED,
        message: 'Evolution graph contains a cycle.',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates an evolution registry for structural integrity.
 * Pure function. No side effects.
 */
export function validateEvolutionRegistry(
  registry: { registryId: string; graphs: readonly ResearchEvolutionGraph[] },
): readonly ResearchEvolutionValidationError[] {
  const errors: ResearchEvolutionValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Evolution registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  // Check for empty registry
  if (!registry.graphs || registry.graphs.length === 0) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_REGISTRY,
      message: 'Evolution registry has no graphs.',
      field: 'graphs',
    });
  }

  // Validate all graphs
  if (registry.graphs) {
    for (const graph of registry.graphs) {
      errors.push(...validateEvolutionGraph(graph));
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a research artifact with evolution metadata.
 * Pure function. No side effects.
 */
export function validateResearchArtifactWithEvolution(
  artifact: ResearchArtifactWithEvolution,
): ResearchEvolutionValidationResult {
  const errors: ResearchEvolutionValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Research artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate evolution graph
  errors.push(...validateEvolutionGraph(artifact.evolutionGraph));

  // Validate trace
  if (!artifact.evolutionTrace || typeof artifact.evolutionTrace !== 'object') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
      message: 'Research artifact is missing evolution trace.',
      field: 'evolutionTrace',
    });
  } else {
    if (artifact.evolutionTrace.deterministic !== true) {
      errors.push({
        code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
        message: 'Evolution trace must declare deterministic: true.',
        field: 'evolutionTrace.deterministic',
      });
    }
    if (artifact.evolutionTrace.randomUsed !== false) {
      errors.push({
        code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
        message: 'Evolution trace must declare randomUsed: false.',
        field: 'evolutionTrace.randomUsed',
      });
    }
    if (artifact.evolutionTrace.timeDependency !== false) {
      errors.push({
        code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
        message: 'Evolution trace must declare timeDependency: false.',
        field: 'evolutionTrace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'evolution_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates research evolution input.
 * Pure function. No side effects.
 */
export function validateEvolutionInput(
  input: ResearchEvolutionInput,
): readonly ResearchEvolutionValidationError[] {
  const errors: ResearchEvolutionValidationError[] = [];

  if (!input.conceptId || input.conceptId.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Evolution input is missing concept ID.',
      field: 'conceptId',
    });
  }

  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_SOURCE,
      message: 'Evolution input is missing concept label.',
      field: 'conceptLabel',
    });
  }

  if (!input.nodes || input.nodes.length === 0) {
    errors.push({
      code: EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_GRAPH,
      message: 'Evolution input has no nodes.',
      field: 'nodes',
    });
  } else {
    for (const node of input.nodes) {
      errors.push(...validateEvolutionNode(node));
    }
  }

  if (input.edges) {
    for (const edge of input.edges) {
      errors.push(...validateEvolutionEdge(edge, input.nodes || []));
    }
  }

  return errors;
}
