/**
 * NV-1500-D3-OPT-03 — Curriculum Progression Kernel
 *
 * Deterministic orchestration functions for curriculum progression composition.
 * Produces progression registries, traces, and artifacts.
 *
 * This module never:
 * - Generates curriculum content
 * - Infers learner mastery
 * - Personalizes learning
 * - Modifies curriculum graphs
 * - Creates learning paths
 * - Executes assessments
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
  CurriculumProgressionState,
  CurriculumProgressionRegistry,
  CurriculumProgressionDecision,
  CurriculumProgressionTrace,
  CurriculumProgressionInput,
  CurriculumProgressionProvenance,
  CurriculumArtifactWithProgression,
  CurriculumGovernanceStatus,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_PROGRESSION_STATES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Canonical Progression State Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a progression state is supported (in canonical progression states).
 */
export function isSupportedProgressionState(
  state: string,
): state is CurriculumProgressionState {
  return CANONICAL_PROGRESSION_STATES.includes(state as CurriculumProgressionState);
}

/**
 * Returns the canonical progression states.
 */
export function getCanonicalProgressionStates(): readonly CurriculumProgressionState[] {
  return CANONICAL_PROGRESSION_STATES;
}

// ---------------------------------------------------------------------------
// Governance Status Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a governance status is supported.
 */
export function isSupportedProgressionGovernanceStatus(
  status: string,
): status is CurriculumGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(status as CurriculumGovernanceStatus);
}

// ---------------------------------------------------------------------------
// Deterministic Progression State Resolution
// ---------------------------------------------------------------------------

/**
 * Resolves the progression state for a curriculum node based exclusively on
 * curriculum metadata. Never inspects learner data.
 *
 * Rules:
 * - nodeType 'review' → 'review'
 * - nodeType 'reinforcement' → 'reinforcement'
 * - nodeType 'capstone' → 'capstone_ready' if no unresolved required dependencies
 * - has unresolved required dependencies → 'blocked'
 * - dependency type 'optional_background' or 'enrichment' → 'optional'
 * - no dependencies → 'available'
 * - has dependencies all resolved → 'available'
 * - default → 'available'
 *
 * Pure function. No side effects.
 */
export function resolveProgressionState(
  node: CurriculumNode,
  dependencies: readonly CurriculumDependency[],
): CurriculumProgressionState {
  // Review nodes are always in review state
  if (node.nodeType === 'review') {
    return 'review';
  }

  // Reinforcement nodes are always in reinforcement state
  if (node.nodeType === 'reinforcement') {
    return 'reinforcement';
  }

  // Capstone nodes are capstone_ready if no unresolved required dependencies
  if (node.nodeType === 'capstone') {
    const requiredDeps = dependencies.filter(
      (d) => d.targetNodeId === node.nodeId && d.dependencyType === 'required',
    );
    if (requiredDeps.length === 0) {
      return 'capstone_ready';
    }
    return 'blocked';
  }

  // Check for required dependencies that would block
  const requiredDeps = dependencies.filter(
    (d) => d.targetNodeId === node.nodeId && d.dependencyType === 'required',
  );

  if (requiredDeps.length > 0) {
    return 'blocked';
  }

  // Check for optional dependencies
  const optionalDeps = dependencies.filter(
    (d) =>
      d.targetNodeId === node.nodeId &&
      (d.dependencyType === 'optional_background' || d.dependencyType === 'enrichment'),
  );

  if (optionalDeps.length > 0 && requiredDeps.length === 0) {
    return 'optional';
  }

  // Default: available
  return 'available';
}

// ---------------------------------------------------------------------------
// Compose Curriculum Progression Node
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum progression node from provided parameters.
 * Pure function. No side effects.
 */
export function composeProgressionNode(params: {
  readonly progressionId: string;
  readonly curriculumNodeId: string;
  readonly progressionState: CurriculumProgressionState;
  readonly dependencyIds: readonly string[];
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumProgressionNode {
  return {
    progressionId: params.progressionId,
    curriculumNodeId: params.curriculumNodeId,
    progressionState: params.progressionState,
    dependencyIds: [...params.dependencyIds],
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Progression Provenance
// ---------------------------------------------------------------------------

/**
 * Composes progression provenance from a progression node.
 * Pure function. No side effects.
 */
export function composeProgressionProvenance(
  progression: CurriculumProgressionNode,
): CurriculumProgressionProvenance {
  return {
    progressionId: progression.progressionId,
    source: progression.source,
    governanceStatus: progression.governanceStatus,
    rationale: progression.rationale,
    providedBy: progression.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts progression nodes deterministically by curriculumNodeId, then progressionState, then progressionId.
 */
function _sortProgressionsDeterministically(
  progressions: readonly CurriculumProgressionNode[],
): readonly CurriculumProgressionNode[] {
  return [...progressions].sort((a, b) => {
    const nodeCompare = a.curriculumNodeId.localeCompare(b.curriculumNodeId);
    if (nodeCompare !== 0) return nodeCompare;
    const stateCompare = a.progressionState.localeCompare(b.progressionState);
    if (stateCompare !== 0) return stateCompare;
    return a.progressionId.localeCompare(b.progressionId);
  });
}

// ---------------------------------------------------------------------------
// Compose Progression Decisions
// ---------------------------------------------------------------------------

/**
 * Composes decisions for a progression registry.
 * Pure function. No side effects.
 */
function _composeProgressionDecisions(
  progressions: readonly CurriculumProgressionNode[],
): readonly CurriculumProgressionDecision[] {
  return progressions.map((prog) => {
    const validationErrors = _validateProgressionForDecision(prog);
    return {
      decisionId: `_decision_${prog.progressionId}`,
      progressionId: prog.progressionId,
      validationPassed: validationErrors.length === 0,
      validationErrors,
    };
  });
}

/**
 * Validates a progression node for decision composition.
 * Returns validation error codes.
 */
function _validateProgressionForDecision(prog: CurriculumProgressionNode): readonly string[] {
  const errors: string[] = [];

  if (!prog.progressionId || prog.progressionId.trim() === '') {
    errors.push('PROGRESSION_MISSING_ID');
  }

  if (!isSupportedProgressionState(prog.progressionState)) {
    errors.push('PROGRESSION_UNKNOWN_STATE');
  }

  if (!prog.curriculumNodeId || prog.curriculumNodeId.trim() === '') {
    errors.push('PROGRESSION_MISSING_NODE_ID');
  }

  if (!prog.source || prog.source.trim() === '') {
    errors.push('PROGRESSION_MISSING_SOURCE');
  }

  if (!isSupportedProgressionGovernanceStatus(prog.governanceStatus)) {
    errors.push('PROGRESSION_INVALID_STATUS');
  }

  if (!prog.rationale || prog.rationale.trim() === '') {
    errors.push('PROGRESSION_MISSING_RATIONALE');
  }

  if (!prog.providedBy || prog.providedBy.trim() === '') {
    errors.push('PROGRESSION_MISSING_PROVIDED_BY');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Compose Curriculum Progression
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum progression registry from an input.
 * Pure function. No side effects.
 * Progressions sorted by curriculumNodeId, then progressionState, then progressionId.
 */
export function composeCurriculumProgression(
  input: CurriculumProgressionInput,
): CurriculumProgressionRegistry {
  const sortedProgressions = _sortProgressionsDeterministically(input.progressions);

  return {
    registryId: input.registryId,
    graphId: input.graphId,
    progressions: sortedProgressions,
    progressionCount: sortedProgressions.length,
    deterministic: true,
    generatedFrom: 'deterministic_progression_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Progression Registry
// ---------------------------------------------------------------------------

/**
 * Composes a progression registry from parameters.
 * Pure function. No side effects.
 * Progressions sorted deterministically.
 */
export function composeProgressionRegistry(params: {
  readonly registryId: string;
  readonly graphId: string;
  readonly progressions: readonly CurriculumProgressionNode[];
}): CurriculumProgressionRegistry {
  const sortedProgressions = _sortProgressionsDeterministically(params.progressions);

  return {
    registryId: params.registryId,
    graphId: params.graphId,
    progressions: sortedProgressions,
    progressionCount: sortedProgressions.length,
    deterministic: true,
    generatedFrom: 'deterministic_progression_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Progression Trace
// ---------------------------------------------------------------------------

/**
 * Composes a trace for a progression registry.
 * Pure function. No side effects.
 */
export function composeProgressionTrace(
  registryId: string,
  progressions: readonly CurriculumProgressionNode[],
): CurriculumProgressionTrace {
  const decisions = _composeProgressionDecisions(progressions);

  return {
    traceId: `_trace_prog_${registryId}`,
    registryId,
    progressionCount: progressions.length,
    decisionsCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_progression_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Curriculum Artifact With Progression
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum artifact containing graph, progression registry, trace, and validation.
 * Pure function. No side effects.
 */
export function composeCurriculumArtifactWithProgression(params: {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly progressionRegistry: CurriculumProgressionRegistry;
  readonly progressionTrace: CurriculumProgressionTrace;
  readonly validation: CurriculumArtifactWithProgression['validation'];
}): CurriculumArtifactWithProgression {
  return {
    artifactId: params.artifactId,
    graph: params.graph,
    progressionRegistry: params.progressionRegistry,
    progressionTrace: params.progressionTrace,
    validation: params.validation,
    deterministic: true,
    generatedFrom: 'deterministic_progression_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}
