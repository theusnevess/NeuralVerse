/**
 * NV-1500-D3-OPT-04 — Curriculum Learning Path Kernel
 *
 * Deterministic orchestration functions for curriculum learning path composition.
 * Produces learning path registries, traces, and artifacts.
 *
 * This module never:
 * - Generates curriculum content
 * - Infers learner mastery
 * - Personalizes learning
 * - Modifies curriculum graphs
 * - Creates new curriculum nodes
 * - Infers new dependencies
 * - Reorders curriculum outside deterministic canonical ordering
 * - Introduces probabilistic behavior
 * - Calls external APIs
 * - Accesses the filesystem
 * - Uses async operations
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumNode,
  CurriculumDependency,
  CurriculumProgressionNode,
  CurriculumLearningPathType,
  CurriculumLearningPathStage,
  CurriculumLearningPathNode,
  CurriculumLearningPath,
  CurriculumLearningPathRegistry,
  CurriculumLearningPathDecision,
  CurriculumLearningPathTrace,
  CurriculumLearningPathInput,
  CurriculumLearningPathProvenance,
  CurriculumArtifactWithLearningPaths,
  CurriculumGovernanceStatus,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_LEARNING_PATH_TYPES,
  CANONICAL_LEARNING_PATH_STAGES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Canonical Learning Path Type Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a learning path type is supported (in canonical learning path types).
 */
export function isSupportedLearningPathType(
  type: string,
): type is CurriculumLearningPathType {
  return CANONICAL_LEARNING_PATH_TYPES.includes(type as CurriculumLearningPathType);
}

/**
 * Returns the canonical learning path types.
 */
export function getCanonicalLearningPathTypes(): readonly CurriculumLearningPathType[] {
  return CANONICAL_LEARNING_PATH_TYPES;
}

// ---------------------------------------------------------------------------
// Canonical Learning Path Stage Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a learning path stage is supported (in canonical learning path stages).
 */
export function isSupportedLearningPathStage(
  stage: string,
): stage is CurriculumLearningPathStage {
  return CANONICAL_LEARNING_PATH_STAGES.includes(stage as CurriculumLearningPathStage);
}

/**
 * Returns the canonical learning path stages.
 */
export function getCanonicalLearningPathStages(): readonly CurriculumLearningPathStage[] {
  return CANONICAL_LEARNING_PATH_STAGES;
}

// ---------------------------------------------------------------------------
// Governance Status Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a governance status is supported.
 */
export function isSupportedLearningPathGovernanceStatus(
  status: string,
): status is CurriculumGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(status as CurriculumGovernanceStatus);
}

// ---------------------------------------------------------------------------
// Compose Learning Path
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum learning path from provided parameters.
 * Pure function. No side effects.
 */
export function composeLearningPath(params: {
  readonly pathId: string;
  readonly pathType: CurriculumLearningPathType;
  readonly pathLabel: string;
  readonly orderedNodeIds: readonly string[];
  readonly entryNodeId: string;
  readonly terminalNodeId: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumLearningPath {
  return {
    pathId: params.pathId,
    pathType: params.pathType,
    pathLabel: params.pathLabel,
    orderedNodeIds: [...params.orderedNodeIds],
    entryNodeId: params.entryNodeId,
    terminalNodeId: params.terminalNodeId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Learning Path Node
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum learning path node from provided parameters.
 * Pure function. No side effects.
 */
export function composeLearningPathNode(params: {
  readonly pathNodeId: string;
  readonly curriculumNodeId: string;
  readonly stage: CurriculumLearningPathStage;
  readonly order: number;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumLearningPathNode {
  return {
    pathNodeId: params.pathNodeId,
    curriculumNodeId: params.curriculumNodeId,
    stage: params.stage,
    order: params.order,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Learning Path Provenance
// ---------------------------------------------------------------------------

/**
 * Composes learning path provenance from a learning path.
 * Pure function. No side effects.
 */
export function composeLearningPathProvenance(
  path: CurriculumLearningPath,
): CurriculumLearningPathProvenance {
  return {
    pathId: path.pathId,
    source: path.source,
    governanceStatus: path.governanceStatus,
    rationale: path.rationale,
    providedBy: path.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts learning paths deterministically by pathId, then orderedNodeIds.
 */
function _sortPathsDeterministically(
  paths: readonly CurriculumLearningPath[],
): readonly CurriculumLearningPath[] {
  return [...paths].sort((a, b) => {
    const idCompare = a.pathId.localeCompare(b.pathId);
    if (idCompare !== 0) return idCompare;

    // Compare orderedNodeIds lexicographically
    const minLen = Math.min(a.orderedNodeIds.length, b.orderedNodeIds.length);
    for (let i = 0; i < minLen; i++) {
      const nodeCompare = a.orderedNodeIds[i].localeCompare(b.orderedNodeIds[i]);
      if (nodeCompare !== 0) return nodeCompare;
    }
    return a.orderedNodeIds.length - b.orderedNodeIds.length;
  });
}

// ---------------------------------------------------------------------------
// Compose Learning Path Decisions
// ---------------------------------------------------------------------------

/**
 * Composes decisions for a learning path registry.
 * Pure function. No side effects.
 */
function _composeLearningPathDecisions(
  paths: readonly CurriculumLearningPath[],
): readonly CurriculumLearningPathDecision[] {
  return paths.map((path) => {
    const validationErrors = _validatePathForDecision(path);
    return {
      decisionId: `_decision_${path.pathId}`,
      pathId: path.pathId,
      validationPassed: validationErrors.length === 0,
      validationErrors,
    };
  });
}

/**
 * Validates a learning path for decision composition.
 * Returns validation error codes.
 */
function _validatePathForDecision(path: CurriculumLearningPath): readonly string[] {
  const errors: string[] = [];

  if (!path.pathId || path.pathId.trim() === '') {
    errors.push('LEARNING_PATH_MISSING_ID');
  }

  if (!isSupportedLearningPathType(path.pathType)) {
    errors.push('LEARNING_PATH_UNKNOWN_TYPE');
  }

  if (!path.pathLabel || path.pathLabel.trim() === '') {
    errors.push('LEARNING_PATH_MISSING_LABEL');
  }

  if (!path.orderedNodeIds || path.orderedNodeIds.length === 0) {
    errors.push('LEARNING_PATH_EMPTY_PATH');
  }

  if (!path.entryNodeId || path.entryNodeId.trim() === '') {
    errors.push('LEARNING_PATH_MISSING_ENTRY');
  }

  if (!path.terminalNodeId || path.terminalNodeId.trim() === '') {
    errors.push('LEARNING_PATH_MISSING_TERMINAL');
  }

  if (!path.source || path.source.trim() === '') {
    errors.push('LEARNING_PATH_MISSING_SOURCE');
  }

  if (!isSupportedLearningPathGovernanceStatus(path.governanceStatus)) {
    errors.push('LEARNING_PATH_INVALID_STATUS');
  }

  if (!path.rationale || path.rationale.trim() === '') {
    errors.push('LEARNING_PATH_MISSING_RATIONALE');
  }

  if (!path.providedBy || path.providedBy.trim() === '') {
    errors.push('LEARNING_PATH_MISSING_PROVIDED_BY');
  }

  // Validate entryNodeId is in orderedNodeIds
  if (path.orderedNodeIds && path.orderedNodeIds.length > 0 && path.entryNodeId) {
    if (!path.orderedNodeIds.includes(path.entryNodeId)) {
      errors.push('LEARNING_PATH_INVALID_ENTRY');
    }
  }

  // Validate terminalNodeId is in orderedNodeIds
  if (path.orderedNodeIds && path.orderedNodeIds.length > 0 && path.terminalNodeId) {
    if (!path.orderedNodeIds.includes(path.terminalNodeId)) {
      errors.push('LEARNING_PATH_INVALID_TERMINAL');
    }
  }

  // Validate entryNodeId is first in orderedNodeIds
  if (path.orderedNodeIds && path.orderedNodeIds.length > 0 && path.entryNodeId) {
    if (path.orderedNodeIds[0] !== path.entryNodeId) {
      errors.push('LEARNING_PATH_INVALID_ORDER');
    }
  }

  // Validate terminalNodeId is last in orderedNodeIds
  if (path.orderedNodeIds && path.orderedNodeIds.length > 0 && path.terminalNodeId) {
    if (path.orderedNodeIds[path.orderedNodeIds.length - 1] !== path.terminalNodeId) {
      errors.push('LEARNING_PATH_INVALID_ORDER');
    }
  }

  // Validate no duplicate nodeIds in orderedNodeIds
  if (path.orderedNodeIds) {
    const seen = new Set<string>();
    for (const nodeId of path.orderedNodeIds) {
      if (seen.has(nodeId)) {
        errors.push('LEARNING_PATH_DUPLICATE_NODE');
        break;
      }
      seen.add(nodeId);
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Compose Curriculum Learning Paths
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum learning path registry from an input.
 * Pure function. No side effects.
 * Paths sorted by pathId, then orderedNodeIds.
 */
export function composeCurriculumLearningPaths(
  input: CurriculumLearningPathInput,
): CurriculumLearningPathRegistry {
  const sortedPaths = _sortPathsDeterministically(input.paths);

  return {
    registryId: input.registryId ?? '_default_registry',
    graphId: input.graphId ?? '_default_graph',
    paths: sortedPaths,
    pathCount: sortedPaths.length,
    deterministic: true,
    generatedFrom: 'deterministic_learning_path_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Learning Path Registry
// ---------------------------------------------------------------------------

/**
 * Composes a learning path registry from parameters.
 * Pure function. No side effects.
 * Paths sorted deterministically.
 */
export function composeLearningPathRegistry(params: {
  readonly registryId: string;
  readonly graphId: string;
  readonly paths: readonly CurriculumLearningPath[];
}): CurriculumLearningPathRegistry {
  const sortedPaths = _sortPathsDeterministically(params.paths);

  return {
    registryId: params.registryId,
    graphId: params.graphId,
    paths: sortedPaths,
    pathCount: sortedPaths.length,
    deterministic: true,
    generatedFrom: 'deterministic_learning_path_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Learning Path Trace
// ---------------------------------------------------------------------------

/**
 * Composes a trace for a learning path registry.
 * Pure function. No side effects.
 */
export function composeLearningPathTrace(
  registryId: string,
  paths: readonly CurriculumLearningPath[],
): CurriculumLearningPathTrace {
  const decisions = _composeLearningPathDecisions(paths);

  return {
    traceId: `_trace_lp_${registryId}`,
    registryId,
    pathCount: paths.length,
    decisionsCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_learning_path_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Curriculum Artifact With Learning Paths
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum artifact containing graph, learning path registry, trace, and validation.
 * Pure function. No side effects.
 */
export function composeCurriculumArtifactWithLearningPaths(params: {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly learningPathRegistry: CurriculumLearningPathRegistry;
  readonly learningPathTrace: CurriculumLearningPathTrace;
  readonly validation: CurriculumArtifactWithLearningPaths['validation'];
}): CurriculumArtifactWithLearningPaths {
  return {
    artifactId: params.artifactId,
    graph: params.graph,
    learningPathRegistry: params.learningPathRegistry,
    learningPathTrace: params.learningPathTrace,
    validation: params.validation,
    deterministic: true,
    generatedFrom: 'deterministic_learning_path_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}
