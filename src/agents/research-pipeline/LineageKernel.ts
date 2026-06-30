/**
 * NV-1400-D2-OPT-02 — Scientific Lineage Orchestration Kernel
 *
 * Deterministic orchestration functions for research lineage metadata.
 * Produces lineage graphs, edges, nodes, and traces.
 *
 * This module never:
 * - Infers lineage
 * - Retrieves papers
 * - Generates content
 * - Calls external APIs
 * - Creates inferred relationships
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchLineageNode,
  ResearchLineageEdge,
  ResearchLineageGraph,
  ResearchLineageDecision,
  ResearchLineageTrace,
  ResearchLineageInput,
  ResearchArtifactWithLineage,
  ResearchLineageProvenance,
  ResearchLineageRelationType,
  ResearchReference,
  ResearchEvidenceLevel,
  ResearchGovernanceStatus,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_LINEAGE_RELATIONS,
  CANONICAL_SOURCE_TYPES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Lineage Node Composition
// ---------------------------------------------------------------------------

/**
 * Composes a lineage node from a reference.
 * Pure function. No side effects.
 */
export function composeLineageNode(
  nodeId: string,
  reference: ResearchReference,
  evidenceLevel: ResearchEvidenceLevel,
  governanceStatus: ResearchGovernanceStatus,
): ResearchLineageNode {
  return {
    nodeId,
    referenceId: reference.id,
    title: reference.title,
    sourceType: reference.sourceType,
    evidenceLevel,
    governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Lineage Edge Composition
// ---------------------------------------------------------------------------

/**
 * Composes a lineage edge with provenance.
 * Pure function. No side effects.
 */
export function composeLineageEdge(
  edgeId: string,
  sourceNodeId: string,
  targetNodeId: string,
  relationType: ResearchLineageRelationType,
  provenance: ResearchLineageProvenance,
  governanceStatus: ResearchGovernanceStatus,
): ResearchLineageEdge {
  return {
    edgeId,
    sourceNodeId,
    targetNodeId,
    relationType,
    provenance,
    governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Lineage Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes lineage provenance.
 * Pure function. No side effects.
 */
export function composeLineageProvenance(
  sourceReferenceId: string,
  targetReferenceId: string,
  relationType: ResearchLineageRelationType,
  governanceStatus: ResearchGovernanceStatus,
  rationale: string,
  providedBy: string,
): ResearchLineageProvenance {
  return {
    sourceReferenceId,
    targetReferenceId,
    relationType,
    governanceStatus,
    rationale,
    providedBy,
  };
}

// ---------------------------------------------------------------------------
// Lineage Graph Composition
// ---------------------------------------------------------------------------

/**
 * Composes a lineage graph from nodes and edges.
 * Pure function. No side effects.
 */
export function composeLineageGraph(
  graphId: string,
  nodes: readonly ResearchLineageNode[],
  edges: readonly ResearchLineageEdge[],
): ResearchLineageGraph {
  return {
    graphId,
    nodes: [...nodes],
    edges: [...edges],
    deterministic: true,
    generatedFrom: 'deterministic_lineage_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Research Lineage Composition
// ---------------------------------------------------------------------------

/**
 * Composes research lineage from an input.
 * Pure function. No side effects.
 */
export function composeResearchLineage(
  input: ResearchLineageInput,
): ResearchArtifactWithLineage {
  const decisions = _composeDecisions(input);

  const trace: ResearchLineageTrace = {
    traceId: `_lineage_trace_${input.conceptId}`,
    nodeCount: input.nodes.length,
    edgeCount: input.edges.length,
    decisionsCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_lineage_kernel',
    randomUsed: false,
    timeDependency: false,
  };

  const graph = composeLineageGraph(
    `_lineage_graph_${input.conceptId}`,
    input.nodes,
    input.edges,
  );

  return {
    artifactId: `_lineage_artifact_${input.conceptId}`,
    artifactType: 'concept',
    lineageGraph: graph,
    lineageTrace: trace,
  };
}

/**
 * Composes lineage decisions from input edges.
 * Pure function. No side effects.
 */
function _composeDecisions(
  input: ResearchLineageInput,
): readonly ResearchLineageDecision[] {
  return input.edges.map((edge) => {
    const validationErrors = _validateEdgeForDecision(edge);
    const validationPassed = validationErrors.length === 0;

    return {
      decisionId: `_decision_${edge.edgeId}`,
      sourceReferenceId: edge.provenance.sourceReferenceId,
      targetReferenceId: edge.provenance.targetReferenceId,
      relationType: edge.relationType,
      provenance: edge.provenance,
      validationPassed,
      validationErrors,
    };
  });
}

/**
 * Validates an edge for decision composition.
 * Returns validation error codes.
 */
function _validateEdgeForDecision(edge: ResearchLineageEdge): readonly string[] {
  const errors: string[] = [];

  if (!CANONICAL_LINEAGE_RELATIONS.includes(edge.relationType)) {
    errors.push('LINEAGE_UNKNOWN_RELATION');
  }

  if (!edge.sourceNodeId || edge.sourceNodeId.trim() === '') {
    errors.push('LINEAGE_MISSING_SOURCE');
  }

  if (!edge.targetNodeId || edge.targetNodeId.trim() === '') {
    errors.push('LINEAGE_MISSING_TARGET');
  }

  if (edge.sourceNodeId === edge.targetNodeId) {
    errors.push('LINEAGE_SELF_REFERENCE');
  }

  if (!edge.provenance || !edge.provenance.rationale || edge.provenance.rationale.trim() === '') {
    errors.push('LINEAGE_MISSING_PROVENANCE');
  }

  if (!edge.governanceStatus || edge.governanceStatus.trim() === '') {
    errors.push('LINEAGE_INVALID_STATUS');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Lineage Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a lineage trace.
 * Pure function. No side effects.
 */
export function composeLineageTrace(
  traceId: string,
  nodeCount: number,
  edgeCount: number,
  decisions: readonly ResearchLineageDecision[],
): ResearchLineageTrace {
  return {
    traceId,
    nodeCount,
    edgeCount,
    decisionsCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions: [...decisions],
    deterministic: true,
    generatedFrom: 'deterministic_lineage_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Relation Type Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a relation type is supported (in canonical relations).
 */
export function isSupportedRelationType(relationType: string): relationType is ResearchLineageRelationType {
  return CANONICAL_LINEAGE_RELATIONS.includes(relationType as ResearchLineageRelationType);
}

/**
 * Returns all canonical relation types.
 */
export function getCanonicalRelationTypes(): readonly ResearchLineageRelationType[] {
  return CANONICAL_LINEAGE_RELATIONS;
}
