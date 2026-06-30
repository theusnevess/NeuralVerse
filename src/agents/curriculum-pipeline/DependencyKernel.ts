/**
 * NV-1500-D3-OPT-02 — Curriculum Dependency Kernel
 *
 * Deterministic orchestration functions for curriculum dependency composition.
 * Produces dependency registries, traces, and artifacts.
 *
 * This module never:
 * - Generates curriculum content
 * - Infers prerequisites
 * - Modifies curriculum graphs
 * - Creates learning paths
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
  CurriculumDependencyType,
  CurriculumDependencyRegistry,
  CurriculumDependencyDecision,
  CurriculumDependencyTrace,
  CurriculumDependencyInput,
  CurriculumDependencyProvenance,
  CurriculumArtifactWithDependencies,
  CurriculumGovernanceStatus,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_DEPENDENCY_TYPES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Canonical Dependency Type Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a dependency type is supported (in canonical dependency types).
 */
export function isSupportedDependencyType(
  dependencyType: string,
): dependencyType is CurriculumDependencyType {
  return CANONICAL_DEPENDENCY_TYPES.includes(dependencyType as CurriculumDependencyType);
}

/**
 * Returns the canonical dependency types.
 */
export function getCanonicalDependencyTypes(): readonly CurriculumDependencyType[] {
  return CANONICAL_DEPENDENCY_TYPES;
}

// ---------------------------------------------------------------------------
// Governance Status Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a governance status is supported.
 */
export function isSupportedDependencyGovernanceStatus(
  status: string,
): status is CurriculumGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(status as CurriculumGovernanceStatus);
}

// ---------------------------------------------------------------------------
// Compose Curriculum Dependency
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum dependency from provided parameters.
 * Pure function. No side effects.
 */
export function composeDependency(params: {
  readonly dependencyId: string;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly dependencyType: CurriculumDependencyType;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumDependency {
  return {
    dependencyId: params.dependencyId,
    sourceNodeId: params.sourceNodeId,
    targetNodeId: params.targetNodeId,
    dependencyType: params.dependencyType,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Dependency Provenance
// ---------------------------------------------------------------------------

/**
 * Composes dependency provenance from a dependency.
 * Pure function. No side effects.
 */
export function composeDependencyProvenance(
  dependency: CurriculumDependency,
): CurriculumDependencyProvenance {
  return {
    dependencyId: dependency.dependencyId,
    source: dependency.source,
    governanceStatus: dependency.governanceStatus,
    rationale: dependency.rationale,
    providedBy: dependency.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts dependencies deterministically by sourceNodeId, then targetNodeId, then dependencyId.
 */
function _sortDependenciesDeterministically(
  dependencies: readonly CurriculumDependency[],
): readonly CurriculumDependency[] {
  return [...dependencies].sort((a, b) => {
    const sourceCompare = a.sourceNodeId.localeCompare(b.sourceNodeId);
    if (sourceCompare !== 0) return sourceCompare;
    const targetCompare = a.targetNodeId.localeCompare(b.targetNodeId);
    if (targetCompare !== 0) return targetCompare;
    return a.dependencyId.localeCompare(b.dependencyId);
  });
}

// ---------------------------------------------------------------------------
// Cycle Detection (Deterministic DFS)
// ---------------------------------------------------------------------------

/**
 * Detects cycles in a dependency graph using deterministic DFS.
 * Returns true if a cycle exists, false otherwise.
 * Uses sorted adjacency lists for deterministic traversal order.
 *
 * Pure function. No side effects.
 */
export function detectDependencyCycle(
  dependencies: readonly CurriculumDependency[],
): boolean {
  if (dependencies.length === 0) {
    return false;
  }

  // Build adjacency list from dependencies (source -> targets)
  const adjacencyMap = new Map<string, string[]>();
  for (const dep of dependencies) {
    const existing = adjacencyMap.get(dep.sourceNodeId);
    if (existing) {
      existing.push(dep.targetNodeId);
    } else {
      adjacencyMap.set(dep.sourceNodeId, [dep.targetNodeId]);
    }
  }

  // Sort adjacency lists for deterministic traversal
  for (const [key, value] of adjacencyMap) {
    adjacencyMap.set(key, value.sort());
  }

  // Collect all unique node IDs and sort them for deterministic DFS start order
  const allNodeIds = new Set<string>();
  for (const dep of dependencies) {
    allNodeIds.add(dep.sourceNodeId);
    allNodeIds.add(dep.targetNodeId);
  }
  const sortedNodeIds = [...allNodeIds].sort();

  // DFS with three-color marking: white=0, gray=1, black=2
  const color = new Map<string, number>();
  for (const nodeId of sortedNodeIds) {
    color.set(nodeId, 0);
  }

  function dfs(nodeId: string): boolean {
    color.set(nodeId, 1); // Mark as gray (visiting)

    const neighbors = adjacencyMap.get(nodeId) || [];
    for (const neighbor of neighbors) {
      const neighborColor = color.get(neighbor) ?? 0;
      if (neighborColor === 1) {
        // Found a back edge — cycle detected
        return true;
      }
      if (neighborColor === 0) {
        if (dfs(neighbor)) {
          return true;
        }
      }
    }

    color.set(nodeId, 2); // Mark as black (visited)
    return false;
  }

  // Visit all nodes in deterministic order
  for (const nodeId of sortedNodeIds) {
    if (color.get(nodeId) === 0) {
      if (dfs(nodeId)) {
        return true;
      }
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// Compose Dependency Decisions
// ---------------------------------------------------------------------------

/**
 * Composes decisions for a dependency registry.
 * Pure function. No side effects.
 */
function _composeDependencyDecisions(
  dependencies: readonly CurriculumDependency[],
): readonly CurriculumDependencyDecision[] {
  return dependencies.map((dep) => {
    const validationErrors = _validateDependencyForDecision(dep);
    return {
      decisionId: `_decision_${dep.dependencyId}`,
      dependencyId: dep.dependencyId,
      validationPassed: validationErrors.length === 0,
      validationErrors,
    };
  });
}

/**
 * Validates a dependency for decision composition.
 * Returns validation error codes.
 */
function _validateDependencyForDecision(dep: CurriculumDependency): readonly string[] {
  const errors: string[] = [];

  if (!dep.dependencyId || dep.dependencyId.trim() === '') {
    errors.push('DEPENDENCY_MISSING_ID');
  }

  if (!isSupportedDependencyType(dep.dependencyType)) {
    errors.push('DEPENDENCY_UNKNOWN_TYPE');
  }

  if (!dep.sourceNodeId || dep.sourceNodeId.trim() === '') {
    errors.push('DEPENDENCY_MISSING_SOURCE_NODE');
  }

  if (!dep.targetNodeId || dep.targetNodeId.trim() === '') {
    errors.push('DEPENDENCY_MISSING_TARGET_NODE');
  }

  if (dep.sourceNodeId && dep.targetNodeId && dep.sourceNodeId === dep.targetNodeId) {
    errors.push('DEPENDENCY_SELF_REFERENCE');
  }

  if (!dep.source || dep.source.trim() === '') {
    errors.push('DEPENDENCY_MISSING_SOURCE');
  }

  if (!isSupportedDependencyGovernanceStatus(dep.governanceStatus)) {
    errors.push('DEPENDENCY_INVALID_STATUS');
  }

  if (!dep.rationale || dep.rationale.trim() === '') {
    errors.push('DEPENDENCY_MISSING_RATIONALE');
  }

  if (!dep.providedBy || dep.providedBy.trim() === '') {
    errors.push('DEPENDENCY_MISSING_PROVIDED_BY');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Compose Curriculum Dependencies
// ---------------------------------------------------------------------------

/**
 * Composes curriculum dependencies from an input.
 * Pure function. No side effects.
 * Dependencies sorted by sourceNodeId, then targetNodeId, then dependencyId.
 */
export function composeCurriculumDependencies(
  input: CurriculumDependencyInput,
): CurriculumDependencyRegistry {
  const sortedDependencies = _sortDependenciesDeterministically(input.dependencies);

  return {
    registryId: input.registryId ?? '_default_registry',
    graphId: input.graphId ?? '_default_graph',
    dependencies: sortedDependencies,
    dependencyCount: sortedDependencies.length,
    deterministic: true,
    generatedFrom: 'deterministic_dependency_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Dependency Registry
// ---------------------------------------------------------------------------

/**
 * Composes a dependency registry from parameters.
 * Pure function. No side effects.
 * Dependencies sorted deterministically.
 */
export function composeDependencyRegistry(params: {
  readonly registryId: string;
  readonly graphId: string;
  readonly dependencies: readonly CurriculumDependency[];
}): CurriculumDependencyRegistry {
  const sortedDependencies = _sortDependenciesDeterministically(params.dependencies);

  return {
    registryId: params.registryId,
    graphId: params.graphId,
    dependencies: sortedDependencies,
    dependencyCount: sortedDependencies.length,
    deterministic: true,
    generatedFrom: 'deterministic_dependency_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Dependency Trace
// ---------------------------------------------------------------------------

/**
 * Composes a trace for a dependency registry.
 * Pure function. No side effects.
 */
export function composeDependencyTrace(
  registryId: string,
  dependencies: readonly CurriculumDependency[],
): CurriculumDependencyTrace {
  const decisions = _composeDependencyDecisions(dependencies);

  return {
    traceId: `_trace_dep_${registryId}`,
    registryId,
    dependencyCount: dependencies.length,
    decisionsCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_dependency_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Curriculum Artifact With Dependencies
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum artifact containing graph, dependency registry, trace, and validation.
 * Pure function. No side effects.
 */
export function composeCurriculumArtifactWithDependencies(params: {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly dependencyRegistry: CurriculumDependencyRegistry;
  readonly dependencyTrace: CurriculumDependencyTrace;
  readonly validation: CurriculumArtifactWithDependencies['validation'];
}): CurriculumArtifactWithDependencies {
  return {
    artifactId: params.artifactId,
    graph: params.graph,
    dependencyRegistry: params.dependencyRegistry,
    dependencyTrace: params.dependencyTrace,
    validation: params.validation,
    deterministic: true,
    generatedFrom: 'deterministic_dependency_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}
