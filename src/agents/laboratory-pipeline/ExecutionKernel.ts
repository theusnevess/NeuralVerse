/**
 * NV-1600-D4-OPT-02 — Safe Deterministic Execution Model Kernel
 *
 * Deterministic orchestration functions for laboratory execution metadata.
 * Produces execution plans, policies, environments, artifacts, traces, and registries.
 *
 * This module never:
 * - Executes code
 * - Spawns processes
 * - Runs Python
 * - Runs JavaScript
 * - Invokes interpreters
 * - Compiles programs
 * - Calls Docker
 * - Calls containers
 * - Executes shell
 * - Opens browser
 * - Accesses filesystem
 * - Performs network requests
 * - Calls APIs
 * - Calls LLMs
 * - Evaluates user code
 * - Generates code
 * - Generates educational content
 *
 * Execution metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryExecutionPlan,
  LaboratoryExecutionPolicy,
  LaboratoryExecutionEnvironment,
  LaboratoryExecutionArtifact,
  LaboratoryExecutionDecision,
  LaboratoryExecutionTrace,
  LaboratoryExecutionInput,
  LaboratoryExecutionRegistry,
  LaboratoryExecutionProvenance,
  ExecutionMode,
  ExecutionState,
  SandboxLevel,
  LaboratoryGovernanceStatus,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_EXECUTION_MODES,
  CANONICAL_EXECUTION_STATES,
  CANONICAL_SANDBOX_LEVELS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Execution Policy Composition
// ---------------------------------------------------------------------------

/**
 * Composes an execution policy from provided parameters.
 * Pure function. No side effects.
 */
export function composeExecutionPolicy(params: {
  readonly policyId: string;
  readonly executionMode: ExecutionMode;
  readonly sandboxLevel: SandboxLevel;
  readonly requiresValidation: boolean;
  readonly allowsParameters: boolean;
  readonly allowsVisualization: boolean;
  readonly allowsComparison: boolean;
  readonly requiresApproval: boolean;
  readonly governanceStatus: LaboratoryGovernanceStatus;
}): LaboratoryExecutionPolicy {
  return {
    policyId: params.policyId,
    executionMode: params.executionMode,
    sandboxLevel: params.sandboxLevel,
    requiresValidation: params.requiresValidation,
    allowsParameters: params.allowsParameters,
    allowsVisualization: params.allowsVisualization,
    allowsComparison: params.allowsComparison,
    requiresApproval: params.requiresApproval,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Execution Environment Composition
// ---------------------------------------------------------------------------

/**
 * Composes an execution environment from provided parameters.
 * Pure function. No side effects.
 */
export function composeExecutionEnvironment(params: {
  readonly environmentId: string;
  readonly sandboxLevel: SandboxLevel;
  readonly runtimeProfile: string;
  readonly resourceProfile: string;
  readonly executionPolicyId: string;
}): LaboratoryExecutionEnvironment {
  return {
    environmentId: params.environmentId,
    sandboxLevel: params.sandboxLevel,
    runtimeProfile: params.runtimeProfile,
    resourceProfile: params.resourceProfile,
    executionPolicyId: params.executionPolicyId,
  };
}

// ---------------------------------------------------------------------------
// Execution Plan Composition
// ---------------------------------------------------------------------------

/**
 * Composes an execution plan from provided parameters.
 * Pure function. No side effects.
 */
export function composeExecutionPlan(params: {
  readonly executionId: string;
  readonly laboratoryId: string;
  readonly executionMode: ExecutionMode;
  readonly executionState: ExecutionState;
  readonly executionPolicy: LaboratoryExecutionPolicy;
  readonly executionEnvironment: LaboratoryExecutionEnvironment;
  readonly parameters: Readonly<Record<string, string>>;
  readonly constraints: readonly string[];
  readonly governanceStatus: LaboratoryGovernanceStatus;
}): LaboratoryExecutionPlan {
  return {
    executionId: params.executionId,
    laboratoryId: params.laboratoryId,
    executionMode: params.executionMode,
    executionState: params.executionState,
    executionPolicy: params.executionPolicy,
    executionEnvironment: params.executionEnvironment,
    parameters: params.parameters,
    constraints: [...params.constraints],
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Execution Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes execution provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeExecutionProvenance(params: {
  readonly executionId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): LaboratoryExecutionProvenance {
  return {
    executionId: params.executionId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Execution Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes an execution decision from validation results.
 * Pure function. No side effects.
 */
function _composeExecutionDecision(
  executionId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): LaboratoryExecutionDecision {
  return {
    decisionId: `_decision_exec_${executionId}`,
    executionId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Execution Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes an execution trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeExecutionTrace(params: {
  readonly traceId: string;
  readonly executionCount: number;
  readonly decisions: readonly LaboratoryExecutionDecision[];
}): LaboratoryExecutionTrace {
  return {
    traceId: params.traceId,
    executionCount: params.executionCount,
    validatedCount: params.decisions.filter((d) => d.validationPassed).length,
    invalidCount: params.decisions.filter((d) => !d.validationPassed).length,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_execution_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Execution Artifact Composition
// ---------------------------------------------------------------------------

/**
 * Composes an execution artifact from a plan and trace.
 * Pure function. No side effects.
 */
export function composeExecutionArtifact(params: {
  readonly artifactId: string;
  readonly executionPlan: LaboratoryExecutionPlan;
  readonly trace: LaboratoryExecutionTrace;
}): LaboratoryExecutionArtifact {
  return {
    artifactId: params.artifactId,
    executionPlan: params.executionPlan,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for execution plans.
 * Sorts by executionId, then executionMode, then laboratoryId.
 * Pure function. No side effects.
 */
function _compareExecutionPlan(
  a: LaboratoryExecutionPlan,
  b: LaboratoryExecutionPlan,
): number {
  if (a.executionId < b.executionId) return -1;
  if (a.executionId > b.executionId) return 1;

  if (a.executionMode < b.executionMode) return -1;
  if (a.executionMode > b.executionMode) return 1;

  if (a.laboratoryId < b.laboratoryId) return -1;
  if (a.laboratoryId > b.laboratoryId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Execution Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes an execution registry from execution plans.
 * Pure function. No side effects.
 * Deterministic ordering: executionId → executionMode → laboratoryId.
 */
export function composeExecutionRegistry(
  executions: readonly LaboratoryExecutionPlan[],
): LaboratoryExecutionRegistry {
  const sorted = [...executions].sort(_compareExecutionPlan);

  return {
    registryId: `_exec_registry_${sorted.length}`,
    executions: sorted,
    executionCount: sorted.length,
    deterministic: true,
    generatedFrom: 'deterministic_execution_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Execution Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete laboratory execution artifact from an input.
 * Pure function. No side effects.
 */
export function composeLaboratoryExecution(
  input: LaboratoryExecutionInput,
): LaboratoryExecutionArtifact {
  const decisions = input.executions.map((exec) => {
    const errors = _validateExecutionForDecision(exec);
    return _composeExecutionDecision(exec.executionId, errors.length === 0, errors);
  });

  const trace = composeExecutionTrace({
    traceId: `_trace_exec_${input.executions.length}`,
    executionCount: input.executions.length,
    decisions,
  });

  const firstExec = input.executions[0];
  const provenance = composeExecutionProvenance({
    executionId: firstExec.executionId,
    source: 'deterministic_execution_kernel',
    governanceStatus: firstExec.governanceStatus,
    rationale: `Registry of ${input.executions.length} execution plans`,
    providedBy: 'deterministic_execution_kernel',
  });

  return composeExecutionArtifact({
    artifactId: `_artifact_exec_${firstExec.executionId}`,
    executionPlan: firstExec,
    trace,
  });
}

/**
 * Validates an execution plan for decision composition.
 * Pure function. No side effects.
 */
function _validateExecutionForDecision(
  exec: LaboratoryExecutionPlan,
): readonly string[] {
  const errors: string[] = [];

  if (!exec.executionId || exec.executionId.trim() === '') {
    errors.push('EXEC_MISSING_EXECUTION_ID');
  }

  if (!exec.laboratoryId || exec.laboratoryId.trim() === '') {
    errors.push('EXEC_MISSING_LABORATORY_ID');
  }

  if (!CANONICAL_EXECUTION_MODES.includes(exec.executionMode)) {
    errors.push('EXEC_UNKNOWN_MODE');
  }

  if (!CANONICAL_EXECUTION_STATES.includes(exec.executionState)) {
    errors.push('EXEC_UNKNOWN_STATE');
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(exec.governanceStatus)) {
    errors.push('EXEC_INVALID_GOVERNANCE');
  }

  if (!exec.executionPolicy) {
    errors.push('EXEC_MISSING_POLICY');
  }

  if (!exec.executionEnvironment) {
    errors.push('EXEC_MISSING_ENVIRONMENT');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported execution mode.
 */
export function isSupportedExecutionMode(
  executionMode: string,
): executionMode is ExecutionMode {
  return CANONICAL_EXECUTION_MODES.includes(executionMode as ExecutionMode);
}

/**
 * Checks if a string is a supported execution state.
 */
export function isSupportedExecutionState(
  executionState: string,
): executionState is ExecutionState {
  return CANONICAL_EXECUTION_STATES.includes(executionState as ExecutionState);
}

/**
 * Checks if a string is a supported sandbox level.
 */
export function isSupportedSandboxLevel(
  sandboxLevel: string,
): sandboxLevel is SandboxLevel {
  return CANONICAL_SANDBOX_LEVELS.includes(sandboxLevel as SandboxLevel);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedExecutionGovernanceStatus(
  governanceStatus: string,
): governanceStatus is LaboratoryGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(
    governanceStatus as LaboratoryGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical execution modes.
 */
export function getCanonicalExecutionModes(): readonly ExecutionMode[] {
  return CANONICAL_EXECUTION_MODES;
}

/**
 * Returns the canonical execution states.
 */
export function getCanonicalExecutionStates(): readonly ExecutionState[] {
  return CANONICAL_EXECUTION_STATES;
}

/**
 * Returns the canonical sandbox levels.
 */
export function getCanonicalSandboxLevels(): readonly SandboxLevel[] {
  return CANONICAL_SANDBOX_LEVELS;
}
