/**
 * NV-1400-D2-OPT-09 — Research Reading Path Orchestration Kernel
 *
 * Deterministic orchestration functions for research reading path metadata.
 * Produces reading path registries, reading paths, and traces.
 *
 * This module never:
 * - Recommends papers
 * - Personalizes reading
 * - Infers prerequisites
 * - Estimates difficulty
 * - Ranks publications
 * - Retrieves publications
 * - Summarizes papers
 * - Calls external APIs
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchReadingPath,
  ResearchReadingPathNode,
  ResearchReadingPathRegistry,
  ResearchReadingPathDecision,
  ResearchReadingPathTrace,
  ResearchReadingPathInput,
  ResearchArtifactWithReadingPaths,
  ResearchReadingPathType,
  ResearchReadingPathStage,
  ResearchReadingPathProvenance,
  ResearchGovernanceStatus,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_READING_PATH_TYPES,
  CANONICAL_READING_PATH_STAGES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Reading Path Node Composition
// ---------------------------------------------------------------------------

/**
 * Composes a reading path node.
 * Pure function. No side effects.
 */
export function composeReadingPathNode(
  nodeId: string,
  referenceId: string,
  title: string,
  stage: ResearchReadingPathStage,
  order: number,
  publicationYear: number,
  governanceStatus: ResearchGovernanceStatus,
  rationale: string,
): ResearchReadingPathNode {
  return {
    nodeId,
    referenceId,
    title,
    stage,
    order,
    publicationYear,
    governanceStatus,
    rationale,
  };
}

// ---------------------------------------------------------------------------
// Reading Path Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes reading path provenance.
 * Pure function. No side effects.
 */
export function composeReadingPathProvenance(
  pathId: string,
  referenceId: string,
  source: string,
  governanceStatus: ResearchGovernanceStatus,
  pathType: ResearchReadingPathType,
  rationale: string,
  providedBy: string,
): ResearchReadingPathProvenance {
  return {
    pathId,
    referenceId,
    source,
    governanceStatus,
    pathType,
    rationale,
    providedBy,
  };
}

// ---------------------------------------------------------------------------
// Reading Path Composition
// ---------------------------------------------------------------------------

/**
 * Composes a reading path.
 * Pure function. No side effects.
 */
export function composeReadingPath(
  pathId: string,
  pathType: ResearchReadingPathType,
  title: string,
  description: string,
  orderedNodes: readonly ResearchReadingPathNode[],
  associatedEvidence: readonly string[],
  associatedTimeline: readonly string[],
  associatedBenchmarks: readonly string[],
  associatedDatasets: readonly string[],
  associatedEvolution: readonly string[],
  governanceStatus: ResearchGovernanceStatus,
  lifecycle: 'active' | 'deprecated' | 'historical',
  rationale: string,
  provenance: ResearchReadingPathProvenance,
): ResearchReadingPath {
  const sortedNodes = _sortNodesDeterministically(orderedNodes);

  return {
    pathId,
    pathType,
    title,
    description,
    orderedNodes: [...sortedNodes],
    associatedEvidence: [...associatedEvidence],
    associatedTimeline: [...associatedTimeline],
    associatedBenchmarks: [...associatedBenchmarks],
    associatedDatasets: [...associatedDatasets],
    associatedEvolution: [...associatedEvolution],
    governanceStatus,
    lifecycle,
    rationale,
    provenance,
  };
}

// ---------------------------------------------------------------------------
// Reading Path Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a reading path registry from reading paths.
 * Pure function. No side effects.
 */
export function composeReadingPathRegistry(
  registryId: string,
  paths: readonly ResearchReadingPath[],
): ResearchReadingPathRegistry {
  const sortedPaths = _sortPathsDeterministically(paths);

  return {
    registryId,
    paths: [...sortedPaths],
    deterministic: true,
    generatedFrom: 'deterministic_reading_path_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Research Reading Paths Composition
// ---------------------------------------------------------------------------

/**
 * Composes research reading paths from an input.
 * Pure function. No side effects.
 */
export function composeResearchReadingPaths(
  input: ResearchReadingPathInput,
): ResearchArtifactWithReadingPaths {
  const decisions = _composeDecisions(input);

  const trace: ResearchReadingPathTrace = {
    traceId: `_reading_path_trace_${input.conceptId}`,
    pathCount: input.paths.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_reading_path_kernel',
    randomUsed: false,
    timeDependency: false,
  };

  const registry = composeReadingPathRegistry(
    `_reading_path_registry_${input.conceptId}`,
    input.paths,
  );

  return {
    artifactId: `_reading_path_artifact_${input.conceptId}`,
    artifactType: 'concept',
    readingPathRegistry: registry,
    readingPathTrace: trace,
  };
}

/**
 * Composes reading path decisions from input paths.
 * Pure function. No side effects.
 */
function _composeDecisions(
  input: ResearchReadingPathInput,
): readonly ResearchReadingPathDecision[] {
  return input.paths.map((path) => {
    const validationErrors = _validatePathForDecision(path);
    const validationPassed = validationErrors.length === 0;

    return {
      decisionId: `_decision_${path.pathId}`,
      pathId: path.pathId,
      pathType: path.pathType,
      validationPassed,
      validationErrors,
    };
  });
}

/**
 * Validates a reading path for decision composition.
 * Returns validation error codes.
 */
function _validatePathForDecision(path: ResearchReadingPath): readonly string[] {
  const errors: string[] = [];

  if (!path.pathId || path.pathId.trim() === '') {
    errors.push('READING_PATH_MISSING_SOURCE');
  }

  if (!CANONICAL_READING_PATH_TYPES.includes(path.pathType)) {
    errors.push('READING_PATH_UNKNOWN_TYPE');
  }

  if (!path.title || path.title.trim() === '') {
    errors.push('READING_PATH_MISSING_SOURCE');
  }

  if (!path.orderedNodes || path.orderedNodes.length === 0) {
    errors.push('READING_PATH_EMPTY_PATH');
  }

  if (!path.associatedEvidence || path.associatedEvidence.length === 0) {
    errors.push('READING_PATH_MISSING_EVIDENCE');
  }

  if (!path.provenance || !path.provenance.rationale || path.provenance.rationale.trim() === '') {
    errors.push('READING_PATH_MISSING_PROVENANCE');
  }

  if (!path.governanceStatus || path.governanceStatus.trim() === '') {
    errors.push('READING_PATH_INVALID_STATUS');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts reading path nodes deterministically.
 * Sorting based on order, then publicationYear, then nodeId.
 * Pure function. No side effects.
 */
function _sortNodesDeterministically(
  nodes: readonly ResearchReadingPathNode[],
): readonly ResearchReadingPathNode[] {
  return [...nodes].sort((a, b) => {
    // Primary sort by order
    if (a.order !== b.order) {
      return a.order - b.order;
    }

    // Secondary sort by publicationYear
    if (a.publicationYear !== b.publicationYear) {
      return a.publicationYear - b.publicationYear;
    }

    // Final sort by nodeId for deterministic ordering
    return a.nodeId.localeCompare(b.nodeId);
  });
}

/**
 * Sorts reading paths deterministically.
 * Sorting based on pathId for consistent ordering.
 * Pure function. No side effects.
 */
function _sortPathsDeterministically(
  paths: readonly ResearchReadingPath[],
): readonly ResearchReadingPath[] {
  return [...paths].sort((a, b) => a.pathId.localeCompare(b.pathId));
}

// ---------------------------------------------------------------------------
// Reading Path Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a reading path trace.
 * Pure function. No side effects.
 */
export function composeReadingPathTrace(
  traceId: string,
  decisions: readonly ResearchReadingPathDecision[],
): ResearchReadingPathTrace {
  return {
    traceId,
    pathCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions: [...decisions],
    deterministic: true,
    generatedFrom: 'deterministic_reading_path_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Path Type and Stage Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a reading path type is supported (in canonical path types).
 */
export function isSupportedReadingPathType(
  pathType: string,
): pathType is ResearchReadingPathType {
  return CANONICAL_READING_PATH_TYPES.includes(pathType as ResearchReadingPathType);
}

/**
 * Checks if a reading path stage is supported (in canonical stages).
 */
export function isSupportedReadingPathStage(
  stage: string,
): stage is ResearchReadingPathStage {
  return CANONICAL_READING_PATH_STAGES.includes(stage as ResearchReadingPathStage);
}

/**
 * Returns all canonical reading path types.
 */
export function getCanonicalReadingPathTypes(): readonly ResearchReadingPathType[] {
  return CANONICAL_READING_PATH_TYPES;
}

/**
 * Returns all canonical reading path stages.
 */
export function getCanonicalReadingPathStages(): readonly ResearchReadingPathStage[] {
  return CANONICAL_READING_PATH_STAGES;
}
