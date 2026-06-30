/**
 * NV-1500-D3-OPT-05 — Curriculum Roadmap Kernel
 *
 * Deterministic orchestration functions for curriculum roadmap composition.
 * Produces roadmap registries, traces, and artifacts.
 *
 * This module never:
 * - Recommends paths
 * - Personalizes curriculum
 * - Predicts learner success
 * - Estimates duration or workload
 * - Infers mastery or readiness
 * - Modifies progression, dependencies, graph, or learning paths
 * - Schedules activities
 * - Generates curriculum
 * - Calls APIs or LLMs
 * - Performs searches
 * - Executes laboratories or assessments
 * - Introduces probabilistic behavior
 * - Accesses the filesystem or network
 * - Uses async operations
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumNode,
  CurriculumRoadmapType,
  CurriculumRoadmapStage,
  CurriculumRoadmapNode,
  CurriculumRoadmap,
  CurriculumRoadmapRegistry,
  CurriculumRoadmapDecision,
  CurriculumRoadmapTrace,
  CurriculumRoadmapInput,
  CurriculumRoadmapProvenance,
  CurriculumArtifactWithRoadmaps,
  CurriculumGovernanceStatus,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_ROADMAP_TYPES,
  CANONICAL_ROADMAP_STAGES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Canonical Roadmap Type Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a roadmap type is supported (in canonical roadmap types).
 */
export function isSupportedRoadmapType(
  type: string,
): type is CurriculumRoadmapType {
  return CANONICAL_ROADMAP_TYPES.includes(type as CurriculumRoadmapType);
}

/**
 * Returns the canonical roadmap types.
 */
export function getCanonicalRoadmapTypes(): readonly CurriculumRoadmapType[] {
  return CANONICAL_ROADMAP_TYPES;
}

// ---------------------------------------------------------------------------
// Canonical Roadmap Stage Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a roadmap stage is supported (in canonical roadmap stages).
 */
export function isSupportedRoadmapStage(
  stage: string,
): stage is CurriculumRoadmapStage {
  return CANONICAL_ROADMAP_STAGES.includes(stage as CurriculumRoadmapStage);
}

/**
 * Returns the canonical roadmap stages.
 */
export function getCanonicalRoadmapStages(): readonly CurriculumRoadmapStage[] {
  return CANONICAL_ROADMAP_STAGES;
}

// ---------------------------------------------------------------------------
// Governance Status Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a governance status is supported.
 */
export function isSupportedRoadmapGovernanceStatus(
  status: string,
): status is CurriculumGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(status as CurriculumGovernanceStatus);
}

// ---------------------------------------------------------------------------
// Stage Order Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the canonical order index for a roadmap stage.
 * Lower index means earlier stage.
 */
function _getStageOrder(stage: CurriculumRoadmapStage): number {
  const index = CANONICAL_ROADMAP_STAGES.indexOf(stage);
  return index === -1 ? -1 : index;
}

/**
 * Checks if two stages are in valid order (stage A comes before or at stage B).
 */
function _isStageOrderValid(
  earlierStage: CurriculumRoadmapStage,
  laterStage: CurriculumRoadmapStage,
): boolean {
  return _getStageOrder(earlierStage) <= _getStageOrder(laterStage);
}

// ---------------------------------------------------------------------------
// Compose Roadmap Node
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum roadmap node from provided parameters.
 * Pure function. No side effects.
 */
export function composeRoadmapNode(params: {
  readonly roadmapNodeId: string;
  readonly curriculumNodeId: string;
  readonly stage: CurriculumRoadmapStage;
  readonly nodeOrder: number;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumRoadmapNode {
  return {
    roadmapNodeId: params.roadmapNodeId,
    curriculumNodeId: params.curriculumNodeId,
    stage: params.stage,
    nodeOrder: params.nodeOrder,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Roadmap
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum roadmap from provided parameters.
 * Pure function. No side effects.
 */
export function composeRoadmap(params: {
  readonly roadmapId: string;
  readonly roadmapType: CurriculumRoadmapType;
  readonly roadmapLabel: string;
  readonly nodes: readonly CurriculumRoadmapNode[];
  readonly entryNodeId: string;
  readonly completionNodeId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumRoadmap {
  return {
    roadmapId: params.roadmapId,
    roadmapType: params.roadmapType,
    roadmapLabel: params.roadmapLabel,
    nodes: [...params.nodes],
    entryNodeId: params.entryNodeId,
    completionNodeId: params.completionNodeId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Roadmap Provenance
// ---------------------------------------------------------------------------

/**
 * Composes roadmap provenance from a roadmap.
 * Pure function. No side effects.
 */
export function composeRoadmapProvenance(
  roadmap: CurriculumRoadmap,
): CurriculumRoadmapProvenance {
  return {
    roadmapId: roadmap.roadmapId,
    source: roadmap.source,
    governanceStatus: roadmap.governanceStatus,
    rationale: roadmap.rationale,
    providedBy: roadmap.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts roadmap nodes deterministically by stage order, then nodeOrder, then nodeId.
 */
function _sortRoadmapNodesDeterministically(
  nodes: readonly CurriculumRoadmapNode[],
): readonly CurriculumRoadmapNode[] {
  return [...nodes].sort((a, b) => {
    const stageCompare = _getStageOrder(a.stage) - _getStageOrder(b.stage);
    if (stageCompare !== 0) return stageCompare;
    const orderCompare = a.nodeOrder - b.nodeOrder;
    if (orderCompare !== 0) return orderCompare;
    return a.roadmapNodeId.localeCompare(b.roadmapNodeId);
  });
}

/**
 * Sorts roadmaps deterministically by roadmapId, then stage order, then nodeOrder, then nodeId.
 */
function _sortRoadmapsDeterministically(
  roadmaps: readonly CurriculumRoadmap[],
): readonly CurriculumRoadmap[] {
  return [...roadmaps].sort((a, b) => {
    const idCompare = a.roadmapId.localeCompare(b.roadmapId);
    if (idCompare !== 0) return idCompare;

    // Compare nodes by stage order, then nodeOrder, then nodeId
    const minLen = Math.min(a.nodes.length, b.nodes.length);
    for (let i = 0; i < minLen; i++) {
      const stageCompare = _getStageOrder(a.nodes[i].stage) - _getStageOrder(b.nodes[i].stage);
      if (stageCompare !== 0) return stageCompare;
      const orderCompare = a.nodes[i].nodeOrder - b.nodes[i].nodeOrder;
      if (orderCompare !== 0) return orderCompare;
      const nodeCompare = a.nodes[i].roadmapNodeId.localeCompare(b.nodes[i].roadmapNodeId);
      if (nodeCompare !== 0) return nodeCompare;
    }
    return a.nodes.length - b.nodes.length;
  });
}

// ---------------------------------------------------------------------------
// Compose Roadmap Decisions
// ---------------------------------------------------------------------------

/**
 * Composes decisions for a roadmap registry.
 * Pure function. No side effects.
 */
function _composeRoadmapDecisions(
  roadmaps: readonly CurriculumRoadmap[],
): readonly CurriculumRoadmapDecision[] {
  return roadmaps.map((roadmap) => {
    const validationErrors = _validateRoadmapForDecision(roadmap);
    return {
      decisionId: `_decision_${roadmap.roadmapId}`,
      roadmapId: roadmap.roadmapId,
      validationPassed: validationErrors.length === 0,
      validationErrors,
    };
  });
}

/**
 * Validates a roadmap for decision composition.
 * Returns validation error codes.
 */
function _validateRoadmapForDecision(roadmap: CurriculumRoadmap): readonly string[] {
  const errors: string[] = [];

  if (!roadmap.roadmapId || roadmap.roadmapId.trim() === '') {
    errors.push('ROADMAP_MISSING_ID');
  }

  if (!isSupportedRoadmapType(roadmap.roadmapType)) {
    errors.push('ROADMAP_UNKNOWN_TYPE');
  }

  if (!roadmap.roadmapLabel || roadmap.roadmapLabel.trim() === '') {
    errors.push('ROADMAP_MISSING_LABEL');
  }

  if (!roadmap.nodes || roadmap.nodes.length === 0) {
    errors.push('ROADMAP_EMPTY_PATH');
  }

  if (!roadmap.entryNodeId || roadmap.entryNodeId.trim() === '') {
    errors.push('ROADMAP_MISSING_ENTRY');
  }

  if (!roadmap.completionNodeId || roadmap.completionNodeId.trim() === '') {
    errors.push('ROADMAP_MISSING_COMPLETION');
  }

  if (!roadmap.source || roadmap.source.trim() === '') {
    errors.push('ROADMAP_MISSING_SOURCE');
  }

  if (!isSupportedRoadmapGovernanceStatus(roadmap.governanceStatus)) {
    errors.push('ROADMAP_INVALID_STATUS');
  }

  if (!roadmap.rationale || roadmap.rationale.trim() === '') {
    errors.push('ROADMAP_MISSING_RATIONALE');
  }

  if (!roadmap.providedBy || roadmap.providedBy.trim() === '') {
    errors.push('ROADMAP_MISSING_PROVIDED_BY');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Compose Curriculum Roadmaps
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum roadmap registry from an input.
 * Pure function. No side effects.
 * Roadmaps sorted by roadmapId, then stage order, then nodeOrder, then nodeId.
 */
export function composeCurriculumRoadmaps(
  input: CurriculumRoadmapInput,
): CurriculumRoadmapRegistry {
  const sortedRoadmaps = _sortRoadmapsDeterministically(input.roadmaps);

  return {
    registryId: input.registryId,
    graphId: input.graphId,
    roadmaps: sortedRoadmaps,
    roadmapCount: sortedRoadmaps.length,
    deterministic: true,
    generatedFrom: 'deterministic_roadmap_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Roadmap Registry
// ---------------------------------------------------------------------------

/**
 * Composes a roadmap registry from parameters.
 * Pure function. No side effects.
 * Roadmaps sorted deterministically.
 */
export function composeRoadmapRegistry(params: {
  readonly registryId: string;
  readonly graphId: string;
  readonly roadmaps: readonly CurriculumRoadmap[];
}): CurriculumRoadmapRegistry {
  const sortedRoadmaps = _sortRoadmapsDeterministically(
    params.roadmaps.map((rm) => ({
      ...rm,
      nodes: _sortRoadmapNodesDeterministically(rm.nodes),
    })),
  );

  return {
    registryId: params.registryId,
    graphId: params.graphId,
    roadmaps: sortedRoadmaps,
    roadmapCount: sortedRoadmaps.length,
    deterministic: true,
    generatedFrom: 'deterministic_roadmap_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Roadmap Trace
// ---------------------------------------------------------------------------

/**
 * Composes a trace for a roadmap registry.
 * Pure function. No side effects.
 */
export function composeRoadmapTrace(
  registryId: string,
  roadmaps: readonly CurriculumRoadmap[],
): CurriculumRoadmapTrace {
  const decisions = _composeRoadmapDecisions(roadmaps);

  return {
    traceId: `_trace_rm_${registryId}`,
    registryId,
    roadmapCount: roadmaps.length,
    decisionsCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_roadmap_kernel',
    randomUsed: false,
    timeDependency: false,
    curriculumMutated: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Curriculum Artifact With Roadmaps
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum artifact containing graph, roadmap registry, trace, and validation.
 * Pure function. No side effects.
 */
export function composeCurriculumArtifactWithRoadmaps(params: {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly roadmapRegistry: CurriculumRoadmapRegistry;
  readonly roadmapTrace: CurriculumRoadmapTrace;
  readonly validation: CurriculumArtifactWithRoadmaps['validation'];
}): CurriculumArtifactWithRoadmaps {
  return {
    artifactId: params.artifactId,
    graph: params.graph,
    roadmapRegistry: params.roadmapRegistry,
    roadmapTrace: params.roadmapTrace,
    validation: params.validation,
    deterministic: true,
    generatedFrom: 'deterministic_roadmap_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}
