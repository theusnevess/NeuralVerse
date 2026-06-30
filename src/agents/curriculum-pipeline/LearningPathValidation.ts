/**
 * NV-1500-D3-OPT-04 — Curriculum Learning Path Validation Layer
 *
 * Deterministic validation for curriculum learning path structures.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumLearningPath,
  CurriculumLearningPathRegistry,
  CurriculumArtifactWithLearningPaths,
  CurriculumLearningPathInput,
  CurriculumLearningPathValidationError,
  CurriculumLearningPathValidationResult,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_LEARNING_PATH_TYPES,
  CANONICAL_LEARNING_PATH_STAGES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const LEARNING_PATH_VALIDATION_CODES = {
  LEARNING_PATH_UNKNOWN_TYPE: 'LEARNING_PATH_UNKNOWN_TYPE',
  LEARNING_PATH_UNKNOWN_STAGE: 'LEARNING_PATH_UNKNOWN_STAGE',
  LEARNING_PATH_DUPLICATE_PATH: 'LEARNING_PATH_DUPLICATE_PATH',
  LEARNING_PATH_DUPLICATE_NODE: 'LEARNING_PATH_DUPLICATE_NODE',
  LEARNING_PATH_INVALID_ENTRY: 'LEARNING_PATH_INVALID_ENTRY',
  LEARNING_PATH_INVALID_TERMINAL: 'LEARNING_PATH_INVALID_TERMINAL',
  LEARNING_PATH_INVALID_REFERENCE: 'LEARNING_PATH_INVALID_REFERENCE',
  LEARNING_PATH_INVALID_ORDER: 'LEARNING_PATH_INVALID_ORDER',
  LEARNING_PATH_MISSING_SOURCE: 'LEARNING_PATH_MISSING_SOURCE',
  LEARNING_PATH_MISSING_PROVENANCE: 'LEARNING_PATH_MISSING_PROVENANCE',
  LEARNING_PATH_EMPTY_PATH: 'LEARNING_PATH_EMPTY_PATH',
  LEARNING_PATH_EMPTY_REGISTRY: 'LEARNING_PATH_EMPTY_REGISTRY',
  LEARNING_PATH_INVALID_STATUS: 'LEARNING_PATH_INVALID_STATUS',
  LEARNING_PATH_NON_CANONICAL_NODE: 'LEARNING_PATH_NON_CANONICAL_NODE',
  LEARNING_PATH_MISSING_ID: 'LEARNING_PATH_MISSING_ID',
  LEARNING_PATH_MISSING_LABEL: 'LEARNING_PATH_MISSING_LABEL',
  LEARNING_PATH_MISSING_ENTRY: 'LEARNING_PATH_MISSING_ENTRY',
  LEARNING_PATH_MISSING_TERMINAL: 'LEARNING_PATH_MISSING_TERMINAL',
  LEARNING_PATH_MISSING_RATIONALE: 'LEARNING_PATH_MISSING_RATIONALE',
  LEARNING_PATH_MISSING_PROVIDED_BY: 'LEARNING_PATH_MISSING_PROVIDED_BY',
  LEARNING_PATH_MISSING_REGISTRY_ID: 'LEARNING_PATH_MISSING_REGISTRY_ID',
  LEARNING_PATH_MISSING_GRAPH_ID: 'LEARNING_PATH_MISSING_GRAPH_ID',
  LEARNING_PATH_TRACE_NOT_DETERMINISTIC: 'LEARNING_PATH_TRACE_NOT_DETERMINISTIC',
  LEARNING_PATH_TRACE_RANDOM_USED: 'LEARNING_PATH_TRACE_RANDOM_USED',
  LEARNING_PATH_TRACE_TIME_DEPENDENCY: 'LEARNING_PATH_TRACE_TIME_DEPENDENCY',
} as const;

// ---------------------------------------------------------------------------
// Learning Path Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curriculum learning path against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLearningPath(
  path: CurriculumLearningPath,
  graphNodeIds: readonly string[],
): readonly CurriculumLearningPathValidationError[] {
  const errors: CurriculumLearningPathValidationError[] = [];

  if (!path.pathId || path.pathId.trim() === '') {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_ID,
      message: 'Curriculum learning path is missing a path ID.',
      field: 'pathId',
      pathId: path.pathId,
    });
  }

  if (!CANONICAL_LEARNING_PATH_TYPES.includes(path.pathType)) {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_UNKNOWN_TYPE,
      message: `Curriculum learning path has unsupported path type: "${path.pathType}".`,
      field: 'pathType',
      pathId: path.pathId,
    });
  }

  if (!path.pathLabel || path.pathLabel.trim() === '') {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_LABEL,
      message: 'Curriculum learning path is missing a path label.',
      field: 'pathLabel',
      pathId: path.pathId,
    });
  }

  // Empty path check
  if (!path.orderedNodeIds || path.orderedNodeIds.length === 0) {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_EMPTY_PATH,
      message: 'Curriculum learning path has no ordered node IDs.',
      field: 'orderedNodeIds',
      pathId: path.pathId,
    });
  }

  // Entry node validation
  if (!path.entryNodeId || path.entryNodeId.trim() === '') {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_ENTRY,
      message: 'Curriculum learning path is missing an entry node ID.',
      field: 'entryNodeId',
      pathId: path.pathId,
    });
  } else if (path.orderedNodeIds && path.orderedNodeIds.length > 0) {
    if (!path.orderedNodeIds.includes(path.entryNodeId)) {
      errors.push({
        code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_INVALID_ENTRY,
        message: `Curriculum learning path entry node "${path.entryNodeId}" is not in orderedNodeIds.`,
        field: 'entryNodeId',
        pathId: path.pathId,
        nodeId: path.entryNodeId,
      });
    }
    if (path.orderedNodeIds[0] !== path.entryNodeId) {
      errors.push({
        code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_INVALID_ORDER,
        message: `Curriculum learning path entry node "${path.entryNodeId}" is not the first node in orderedNodeIds.`,
        field: 'entryNodeId',
        pathId: path.pathId,
        nodeId: path.entryNodeId,
      });
    }
  }

  // Terminal node validation
  if (!path.terminalNodeId || path.terminalNodeId.trim() === '') {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_TERMINAL,
      message: 'Curriculum learning path is missing a terminal node ID.',
      field: 'terminalNodeId',
      pathId: path.pathId,
    });
  } else if (path.orderedNodeIds && path.orderedNodeIds.length > 0) {
    if (!path.orderedNodeIds.includes(path.terminalNodeId)) {
      errors.push({
        code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_INVALID_TERMINAL,
        message: `Curriculum learning path terminal node "${path.terminalNodeId}" is not in orderedNodeIds.`,
        field: 'terminalNodeId',
        pathId: path.pathId,
        nodeId: path.terminalNodeId,
      });
    }
    if (path.orderedNodeIds[path.orderedNodeIds.length - 1] !== path.terminalNodeId) {
      errors.push({
        code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_INVALID_ORDER,
        message: `Curriculum learning path terminal node "${path.terminalNodeId}" is not the last node in orderedNodeIds.`,
        field: 'terminalNodeId',
        pathId: path.pathId,
        nodeId: path.terminalNodeId,
      });
    }
  }

  // Node existence check
  if (path.orderedNodeIds) {
    for (const nodeId of path.orderedNodeIds) {
      if (!graphNodeIds.includes(nodeId)) {
        errors.push({
          code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_INVALID_REFERENCE,
          message: `Curriculum learning path references non-existent curriculum node: "${nodeId}".`,
          field: 'orderedNodeIds',
          pathId: path.pathId,
          nodeId,
        });
      }
    }
  }

  // Duplicate node check in orderedNodeIds
  if (path.orderedNodeIds) {
    const seen = new Set<string>();
    for (const nodeId of path.orderedNodeIds) {
      if (seen.has(nodeId)) {
        errors.push({
          code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_DUPLICATE_NODE,
          message: `Curriculum learning path has duplicate node ID: "${nodeId}" in orderedNodeIds.`,
          field: 'orderedNodeIds',
          pathId: path.pathId,
          nodeId,
        });
      }
      seen.add(nodeId);
    }
  }

  if (!path.source || path.source.trim() === '') {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_SOURCE,
      message: 'Curriculum learning path is missing a source.',
      field: 'source',
      pathId: path.pathId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(path.governanceStatus)) {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_INVALID_STATUS,
      message: `Curriculum learning path has invalid governance status: "${path.governanceStatus}".`,
      field: 'governanceStatus',
      pathId: path.pathId,
    });
  }

  if (!path.rationale || path.rationale.trim() === '') {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_RATIONALE,
      message: 'Curriculum learning path is missing a rationale.',
      field: 'rationale',
      pathId: path.pathId,
    });
  }

  if (!path.providedBy || path.providedBy.trim() === '') {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_PROVIDED_BY,
      message: 'Curriculum learning path is missing a providedBy.',
      field: 'providedBy',
      pathId: path.pathId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Learning Path Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum learning path registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLearningPathRegistry(
  registry: CurriculumLearningPathRegistry,
  graphNodeIds: readonly string[],
): CurriculumLearningPathValidationResult {
  const errors: CurriculumLearningPathValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_REGISTRY_ID,
      message: 'Curriculum learning path registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.graphId || registry.graphId.trim() === '') {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_GRAPH_ID,
      message: 'Curriculum learning path registry is missing a graph ID.',
      field: 'graphId',
    });
  }

  // Empty registry check
  if (registry.paths.length === 0) {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_EMPTY_REGISTRY,
      message: 'Curriculum learning path registry has no paths.',
      field: 'paths',
    });
  }

  // Duplicate path ID check
  const seenPathIds = new Set<string>();
  for (const path of registry.paths) {
    if (seenPathIds.has(path.pathId)) {
      errors.push({
        code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_DUPLICATE_PATH,
        message: `Duplicate learning path ID: "${path.pathId}".`,
        pathId: path.pathId,
      });
    }
    seenPathIds.add(path.pathId);
  }

  // Validate each path
  for (const path of registry.paths) {
    errors.push(...validateLearningPath(path, graphNodeIds));
  }

  // Deterministic metadata check
  if (registry.deterministic !== true) {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum learning path registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_TRACE_RANDOM_USED,
      message: 'Curriculum learning path registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum learning path registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_learning_path_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Learning Paths Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum artifact with learning paths against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumArtifactWithLearningPaths(
  artifact: CurriculumArtifactWithLearningPaths,
): CurriculumLearningPathValidationResult {
  const errors: CurriculumLearningPathValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_PROVENANCE,
      message: 'Curriculum artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate learning path registry
  if (artifact.learningPathRegistry && artifact.graph) {
    const graphNodeIds = artifact.graph.nodes.map((n) => n.nodeId);
    const registryResult = validateLearningPathRegistry(
      artifact.learningPathRegistry,
      graphNodeIds,
    );
    errors.push(...registryResult.errors);
  }

  // Deterministic metadata check
  if (artifact.deterministic !== true) {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum artifact must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (artifact.randomUsed !== false) {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_TRACE_RANDOM_USED,
      message: 'Curriculum artifact must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (artifact.timeDependency !== false) {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum artifact must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_learning_path_composition',
  };
}

// ---------------------------------------------------------------------------
// Learning Path Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates curriculum learning path input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLearningPathInput(
  input: CurriculumLearningPathInput,
  graphNodeIds: readonly string[],
): readonly CurriculumLearningPathValidationError[] {
  const errors: CurriculumLearningPathValidationError[] = [];

  if (!input.registryId || input.registryId.trim() === '') {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_REGISTRY_ID,
      message: 'Curriculum learning path input is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!input.graphId || input.graphId.trim() === '') {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_MISSING_GRAPH_ID,
      message: 'Curriculum learning path input is missing a graph ID.',
      field: 'graphId',
    });
  }

  if (!input.paths || input.paths.length === 0) {
    errors.push({
      code: LEARNING_PATH_VALIDATION_CODES.LEARNING_PATH_EMPTY_REGISTRY,
      message: 'Curriculum learning path input has no paths.',
      field: 'paths',
    });
  } else {
    for (const path of input.paths) {
      errors.push(...validateLearningPath(path, graphNodeIds));
    }
  }

  return errors;
}
