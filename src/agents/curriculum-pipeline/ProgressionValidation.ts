/**
 * NV-1500-D3-OPT-03 — Curriculum Progression Validation Layer
 *
 * Deterministic validation for curriculum progression structures.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumProgressionNode,
  CurriculumProgressionRegistry,
  CurriculumArtifactWithProgression,
  CurriculumProgressionInput,
  CurriculumProgressionValidationError,
  CurriculumProgressionValidationResult,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_PROGRESSION_STATES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const PROGRESSION_VALIDATION_CODES = {
  PROGRESSION_UNKNOWN_STATE: 'PROGRESSION_UNKNOWN_STATE',
  PROGRESSION_DUPLICATE_NODE: 'PROGRESSION_DUPLICATE_NODE',
  PROGRESSION_DUPLICATE_ID: 'PROGRESSION_DUPLICATE_ID',
  PROGRESSION_INVALID_REFERENCE: 'PROGRESSION_INVALID_REFERENCE',
  PROGRESSION_INVALID_DEPENDENCY: 'PROGRESSION_INVALID_DEPENDENCY',
  PROGRESSION_MISSING_SOURCE: 'PROGRESSION_MISSING_SOURCE',
  PROGRESSION_MISSING_PROVENANCE: 'PROGRESSION_MISSING_PROVENANCE',
  PROGRESSION_EMPTY_REGISTRY: 'PROGRESSION_EMPTY_REGISTRY',
  PROGRESSION_INVALID_STATUS: 'PROGRESSION_INVALID_STATUS',
  PROGRESSION_INCONSISTENT_STATE: 'PROGRESSION_INCONSISTENT_STATE',
  PROGRESSION_NON_CANONICAL_STATE: 'PROGRESSION_NON_CANONICAL_STATE',
  PROGRESSION_ORPHAN_NODE: 'PROGRESSION_ORPHAN_NODE',
  PROGRESSION_MISSING_ID: 'PROGRESSION_MISSING_ID',
  PROGRESSION_MISSING_NODE_ID: 'PROGRESSION_MISSING_NODE_ID',
  PROGRESSION_MISSING_RATIONALE: 'PROGRESSION_MISSING_RATIONALE',
  PROGRESSION_MISSING_PROVIDED_BY: 'PROGRESSION_MISSING_PROVIDED_BY',
  PROGRESSION_MISSING_REGISTRY_ID: 'PROGRESSION_MISSING_REGISTRY_ID',
  PROGRESSION_MISSING_GRAPH_ID: 'PROGRESSION_MISSING_GRAPH_ID',
  PROGRESSION_TRACE_NOT_DETERMINISTIC: 'PROGRESSION_TRACE_NOT_DETERMINISTIC',
  PROGRESSION_TRACE_RANDOM_USED: 'PROGRESSION_TRACE_RANDOM_USED',
  PROGRESSION_TRACE_TIME_DEPENDENCY: 'PROGRESSION_TRACE_TIME_DEPENDENCY',
} as const;

// ---------------------------------------------------------------------------
// Progression Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curriculum progression node against canonical invariants.
 * Pure function. No side effects.
 */
export function validateProgressionNode(
  progression: CurriculumProgressionNode,
  graphNodeIds: readonly string[],
): readonly CurriculumProgressionValidationError[] {
  const errors: CurriculumProgressionValidationError[] = [];

  if (!progression.progressionId || progression.progressionId.trim() === '') {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_ID,
      message: 'Curriculum progression is missing a progression ID.',
      field: 'progressionId',
      progressionId: progression.progressionId,
    });
  }

  if (!CANONICAL_PROGRESSION_STATES.includes(progression.progressionState)) {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_UNKNOWN_STATE,
      message: `Curriculum progression has unsupported progression state: "${progression.progressionState}".`,
      field: 'progressionState',
      progressionId: progression.progressionId,
    });
  }

  if (!progression.curriculumNodeId || progression.curriculumNodeId.trim() === '') {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_NODE_ID,
      message: 'Curriculum progression is missing a curriculum node ID.',
      field: 'curriculumNodeId',
      progressionId: progression.progressionId,
    });
  }

  // Node existence check
  if (
    progression.curriculumNodeId &&
    !graphNodeIds.includes(progression.curriculumNodeId)
  ) {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_INVALID_REFERENCE,
      message: `Curriculum progression references non-existent curriculum node: "${progression.curriculumNodeId}".`,
      field: 'curriculumNodeId',
      progressionId: progression.progressionId,
      nodeId: progression.curriculumNodeId,
    });
  }

  if (!progression.source || progression.source.trim() === '') {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_SOURCE,
      message: 'Curriculum progression is missing a source.',
      field: 'source',
      progressionId: progression.progressionId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(progression.governanceStatus)) {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_INVALID_STATUS,
      message: `Curriculum progression has invalid governance status: "${progression.governanceStatus}".`,
      field: 'governanceStatus',
      progressionId: progression.progressionId,
    });
  }

  if (!progression.rationale || progression.rationale.trim() === '') {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_RATIONALE,
      message: 'Curriculum progression is missing a rationale.',
      field: 'rationale',
      progressionId: progression.progressionId,
    });
  }

  if (!progression.providedBy || progression.providedBy.trim() === '') {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_PROVIDED_BY,
      message: 'Curriculum progression is missing a providedBy.',
      field: 'providedBy',
      progressionId: progression.progressionId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Progression Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum progression registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateProgressionRegistry(
  registry: CurriculumProgressionRegistry,
  graphNodeIds: readonly string[],
): CurriculumProgressionValidationResult {
  const errors: CurriculumProgressionValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_REGISTRY_ID,
      message: 'Curriculum progression registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.graphId || registry.graphId.trim() === '') {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_GRAPH_ID,
      message: 'Curriculum progression registry is missing a graph ID.',
      field: 'graphId',
    });
  }

  // Empty registry check
  if (registry.progressions.length === 0) {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_EMPTY_REGISTRY,
      message: 'Curriculum progression registry has no progressions.',
      field: 'progressions',
    });
  }

  // Duplicate progression ID check
  const seenProgIds = new Set<string>();
  for (const prog of registry.progressions) {
    if (seenProgIds.has(prog.progressionId)) {
      errors.push({
        code: PROGRESSION_VALIDATION_CODES.PROGRESSION_DUPLICATE_ID,
        message: `Duplicate progression ID: "${prog.progressionId}".`,
        progressionId: prog.progressionId,
      });
    }
    seenProgIds.add(prog.progressionId);
  }

  // Duplicate node check (same curriculumNodeId)
  const seenNodeIds = new Set<string>();
  for (const prog of registry.progressions) {
    if (seenNodeIds.has(prog.curriculumNodeId)) {
      errors.push({
        code: PROGRESSION_VALIDATION_CODES.PROGRESSION_DUPLICATE_NODE,
        message: `Duplicate progression for curriculum node: "${prog.curriculumNodeId}".`,
        progressionId: prog.progressionId,
        nodeId: prog.curriculumNodeId,
      });
    }
    seenNodeIds.add(prog.curriculumNodeId);
  }

  // Validate each progression
  for (const prog of registry.progressions) {
    errors.push(...validateProgressionNode(prog, graphNodeIds));
  }

  // Deterministic metadata check
  if (registry.deterministic !== true) {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum progression registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_TRACE_RANDOM_USED,
      message: 'Curriculum progression registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum progression registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_progression_intelligence',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Progression Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum artifact with progression against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumArtifactWithProgression(
  artifact: CurriculumArtifactWithProgression,
): CurriculumProgressionValidationResult {
  const errors: CurriculumProgressionValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_PROVENANCE,
      message: 'Curriculum artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate progression registry
  if (artifact.progressionRegistry && artifact.graph) {
    const graphNodeIds = artifact.graph.nodes.map((n) => n.nodeId);
    const registryResult = validateProgressionRegistry(
      artifact.progressionRegistry,
      graphNodeIds,
    );
    errors.push(...registryResult.errors);
  }

  // Deterministic metadata check
  if (artifact.deterministic !== true) {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum artifact must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (artifact.randomUsed !== false) {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_TRACE_RANDOM_USED,
      message: 'Curriculum artifact must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (artifact.timeDependency !== false) {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum artifact must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_progression_intelligence',
  };
}

// ---------------------------------------------------------------------------
// Progression Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates curriculum progression input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateProgressionInput(
  input: CurriculumProgressionInput,
  graphNodeIds: readonly string[],
): readonly CurriculumProgressionValidationError[] {
  const errors: CurriculumProgressionValidationError[] = [];

  if (!input.registryId || input.registryId.trim() === '') {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_REGISTRY_ID,
      message: 'Curriculum progression input is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!input.graphId || input.graphId.trim() === '') {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_MISSING_GRAPH_ID,
      message: 'Curriculum progression input is missing a graph ID.',
      field: 'graphId',
    });
  }

  if (!input.progressions || input.progressions.length === 0) {
    errors.push({
      code: PROGRESSION_VALIDATION_CODES.PROGRESSION_EMPTY_REGISTRY,
      message: 'Curriculum progression input has no progressions.',
      field: 'progressions',
    });
  } else {
    for (const prog of input.progressions) {
      errors.push(...validateProgressionNode(prog, graphNodeIds));
    }
  }

  return errors;
}
