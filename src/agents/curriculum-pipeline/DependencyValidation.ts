/**
 * NV-1500-D3-OPT-02 — Curriculum Dependency Validation Layer
 *
 * Deterministic validation for curriculum dependency structures.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumDependency,
  CurriculumDependencyRegistry,
  CurriculumArtifactWithDependencies,
  CurriculumDependencyInput,
  CurriculumDependencyValidationError,
  CurriculumDependencyValidationResult,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_DEPENDENCY_TYPES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

import { detectDependencyCycle } from './DependencyKernel.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const DEPENDENCY_VALIDATION_CODES = {
  DEPENDENCY_UNKNOWN_TYPE: 'DEPENDENCY_UNKNOWN_TYPE',
  DEPENDENCY_DUPLICATE_ID: 'DEPENDENCY_DUPLICATE_ID',
  DEPENDENCY_DUPLICATE_RELATION: 'DEPENDENCY_DUPLICATE_RELATION',
  DEPENDENCY_SELF_REFERENCE: 'DEPENDENCY_SELF_REFERENCE',
  DEPENDENCY_INVALID_SOURCE_NODE: 'DEPENDENCY_INVALID_SOURCE_NODE',
  DEPENDENCY_INVALID_TARGET_NODE: 'DEPENDENCY_INVALID_TARGET_NODE',
  DEPENDENCY_MISSING_SOURCE: 'DEPENDENCY_MISSING_SOURCE',
  DEPENDENCY_MISSING_PROVENANCE: 'DEPENDENCY_MISSING_PROVENANCE',
  DEPENDENCY_EMPTY_REGISTRY: 'DEPENDENCY_EMPTY_REGISTRY',
  DEPENDENCY_INVALID_STATUS: 'DEPENDENCY_INVALID_STATUS',
  DEPENDENCY_CYCLE_DETECTED: 'DEPENDENCY_CYCLE_DETECTED',
  DEPENDENCY_ORPHAN_REFERENCE: 'DEPENDENCY_ORPHAN_REFERENCE',
  DEPENDENCY_MISSING_ID: 'DEPENDENCY_MISSING_ID',
  DEPENDENCY_MISSING_SOURCE_NODE: 'DEPENDENCY_MISSING_SOURCE_NODE',
  DEPENDENCY_MISSING_TARGET_NODE: 'DEPENDENCY_MISSING_TARGET_NODE',
  DEPENDENCY_MISSING_RATIONALE: 'DEPENDENCY_MISSING_RATIONALE',
  DEPENDENCY_MISSING_PROVIDED_BY: 'DEPENDENCY_MISSING_PROVIDED_BY',
  DEPENDENCY_MISSING_GRAPH_ID: 'DEPENDENCY_MISSING_GRAPH_ID',
  DEPENDENCY_MISSING_REGISTRY_ID: 'DEPENDENCY_MISSING_REGISTRY_ID',
  DEPENDENCY_TRACE_NOT_DETERMINISTIC: 'DEPENDENCY_TRACE_NOT_DETERMINISTIC',
  DEPENDENCY_TRACE_RANDOM_USED: 'DEPENDENCY_TRACE_RANDOM_USED',
  DEPENDENCY_TRACE_TIME_DEPENDENCY: 'DEPENDENCY_TRACE_TIME_DEPENDENCY',
} as const;

// ---------------------------------------------------------------------------
// Dependency Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curriculum dependency against canonical invariants.
 * Pure function. No side effects.
 */
export function validateDependency(
  dependency: CurriculumDependency,
  nodeIds: readonly string[],
): readonly CurriculumDependencyValidationError[] {
  const errors: CurriculumDependencyValidationError[] = [];

  if (!dependency.dependencyId || dependency.dependencyId.trim() === '') {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_ID,
      message: 'Curriculum dependency is missing a dependency ID.',
      field: 'dependencyId',
      dependencyId: dependency.dependencyId,
    });
  }

  if (!CANONICAL_DEPENDENCY_TYPES.includes(dependency.dependencyType)) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_UNKNOWN_TYPE,
      message: `Curriculum dependency has unsupported dependency type: "${dependency.dependencyType}".`,
      field: 'dependencyType',
      dependencyId: dependency.dependencyId,
    });
  }

  if (!dependency.sourceNodeId || dependency.sourceNodeId.trim() === '') {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_SOURCE_NODE,
      message: 'Curriculum dependency is missing a source node ID.',
      field: 'sourceNodeId',
      dependencyId: dependency.dependencyId,
    });
  }

  if (!dependency.targetNodeId || dependency.targetNodeId.trim() === '') {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_TARGET_NODE,
      message: 'Curriculum dependency is missing a target node ID.',
      field: 'targetNodeId',
      dependencyId: dependency.dependencyId,
    });
  }

  // Self-reference check
  if (
    dependency.sourceNodeId &&
    dependency.targetNodeId &&
    dependency.sourceNodeId === dependency.targetNodeId
  ) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_SELF_REFERENCE,
      message: `Curriculum dependency references itself: "${dependency.dependencyId}" connects node to itself.`,
      field: 'sourceNodeId',
      dependencyId: dependency.dependencyId,
    });
  }

  // Source node existence check
  if (dependency.sourceNodeId && !nodeIds.includes(dependency.sourceNodeId)) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_INVALID_SOURCE_NODE,
      message: `Curriculum dependency references non-existent source node: "${dependency.sourceNodeId}".`,
      field: 'sourceNodeId',
      dependencyId: dependency.dependencyId,
      nodeId: dependency.sourceNodeId,
    });
  }

  // Target node existence check
  if (dependency.targetNodeId && !nodeIds.includes(dependency.targetNodeId)) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_INVALID_TARGET_NODE,
      message: `Curriculum dependency references non-existent target node: "${dependency.targetNodeId}".`,
      field: 'targetNodeId',
      dependencyId: dependency.dependencyId,
      nodeId: dependency.targetNodeId,
    });
  }

  if (!dependency.source || dependency.source.trim() === '') {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_SOURCE,
      message: 'Curriculum dependency is missing a source.',
      field: 'source',
      dependencyId: dependency.dependencyId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(dependency.governanceStatus)) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_INVALID_STATUS,
      message: `Curriculum dependency has invalid governance status: "${dependency.governanceStatus}".`,
      field: 'governanceStatus',
      dependencyId: dependency.dependencyId,
    });
  }

  if (!dependency.rationale || dependency.rationale.trim() === '') {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_RATIONALE,
      message: 'Curriculum dependency is missing a rationale.',
      field: 'rationale',
      dependencyId: dependency.dependencyId,
    });
  }

  if (!dependency.providedBy || dependency.providedBy.trim() === '') {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_PROVIDED_BY,
      message: 'Curriculum dependency is missing a providedBy.',
      field: 'providedBy',
      dependencyId: dependency.dependencyId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Dependency Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum dependency registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateDependencyRegistry(
  registry: CurriculumDependencyRegistry,
  graphNodeIds: readonly string[],
): CurriculumDependencyValidationResult {
  const errors: CurriculumDependencyValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_REGISTRY_ID,
      message: 'Curriculum dependency registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.graphId || registry.graphId.trim() === '') {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_GRAPH_ID,
      message: 'Curriculum dependency registry is missing a graph ID.',
      field: 'graphId',
    });
  }

  // Empty registry check
  if (registry.dependencies.length === 0) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_EMPTY_REGISTRY,
      message: 'Curriculum dependency registry has no dependencies.',
      field: 'dependencies',
    });
  }

  // Duplicate dependency ID check
  const seenDepIds = new Set<string>();
  for (const dep of registry.dependencies) {
    if (seenDepIds.has(dep.dependencyId)) {
      errors.push({
        code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_DUPLICATE_ID,
        message: `Duplicate dependency ID: "${dep.dependencyId}".`,
        dependencyId: dep.dependencyId,
      });
    }
    seenDepIds.add(dep.dependencyId);
  }

  // Duplicate relation check (same source+target+type)
  const seenRelations = new Set<string>();
  for (const dep of registry.dependencies) {
    const relationKey = `${dep.sourceNodeId}|${dep.targetNodeId}|${dep.dependencyType}`;
    if (seenRelations.has(relationKey)) {
      errors.push({
        code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_DUPLICATE_RELATION,
        message: `Duplicate dependency relation: "${dep.sourceNodeId}" -> "${dep.targetNodeId}" with type "${dep.dependencyType}".`,
        dependencyId: dep.dependencyId,
      });
    }
    seenRelations.add(relationKey);
  }

  // Validate each dependency
  for (const dep of registry.dependencies) {
    errors.push(...validateDependency(dep, graphNodeIds));
  }

  // Cycle detection
  if (detectDependencyCycle(registry.dependencies)) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_CYCLE_DETECTED,
      message: 'Dependency registry contains a cycle.',
      field: 'dependencies',
    });
  }

  // Deterministic metadata check
  if (registry.deterministic !== true) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum dependency registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_TRACE_RANDOM_USED,
      message: 'Curriculum dependency registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum dependency registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_dependency_orchestration',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Dependencies Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum artifact with dependencies against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumArtifactWithDependencies(
  artifact: CurriculumArtifactWithDependencies,
): CurriculumDependencyValidationResult {
  const errors: CurriculumDependencyValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_PROVENANCE,
      message: 'Curriculum artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate dependency registry
  if (artifact.dependencyRegistry && artifact.graph) {
    const graphNodeIds = artifact.graph.nodes.map((n) => n.nodeId);
    const registryResult = validateDependencyRegistry(
      artifact.dependencyRegistry,
      graphNodeIds,
    );
    errors.push(...registryResult.errors);
  }

  // Deterministic metadata check
  if (artifact.deterministic !== true) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum artifact must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (artifact.randomUsed !== false) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_TRACE_RANDOM_USED,
      message: 'Curriculum artifact must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (artifact.timeDependency !== false) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum artifact must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_dependency_orchestration',
  };
}

// ---------------------------------------------------------------------------
// Dependency Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates curriculum dependency input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateDependencyInput(
  input: CurriculumDependencyInput,
  graphNodeIds: readonly string[],
): readonly CurriculumDependencyValidationError[] {
  const errors: CurriculumDependencyValidationError[] = [];

  if (!input.registryId || input.registryId.trim() === '') {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_REGISTRY_ID,
      message: 'Curriculum dependency input is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!input.graphId || input.graphId.trim() === '') {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_MISSING_GRAPH_ID,
      message: 'Curriculum dependency input is missing a graph ID.',
      field: 'graphId',
    });
  }

  if (!input.dependencies || input.dependencies.length === 0) {
    errors.push({
      code: DEPENDENCY_VALIDATION_CODES.DEPENDENCY_EMPTY_REGISTRY,
      message: 'Curriculum dependency input has no dependencies.',
      field: 'dependencies',
    });
  } else {
    for (const dep of input.dependencies) {
      errors.push(...validateDependency(dep, graphNodeIds));
    }
  }

  return errors;
}
