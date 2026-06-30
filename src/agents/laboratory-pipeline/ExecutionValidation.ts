/**
 * NV-1600-D4-OPT-02 — Execution Validation Layer
 *
 * Deterministic validation for execution metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryExecutionPlan,
  LaboratoryExecutionPolicy,
  LaboratoryExecutionEnvironment,
  LaboratoryExecutionRegistry,
  LaboratoryExecutionArtifact,
  LaboratoryExecutionInput,
  LaboratoryExecutionValidationError,
  LaboratoryExecutionValidationResult,
  LaboratoryExecutionPolicyValidationResult,
  LaboratoryExecutionEnvironmentValidationResult,
  LaboratoryExecutionRegistryValidationResult,
  LaboratoryExecutionArtifactValidationResult,
  LaboratoryExecutionInputValidationResult,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_EXECUTION_MODES,
  CANONICAL_EXECUTION_STATES,
  CANONICAL_SANDBOX_LEVELS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const EXECUTION_VALIDATION_CODES = {
  EXEC_UNKNOWN_MODE: 'EXEC_UNKNOWN_MODE',
  EXEC_UNKNOWN_STATE: 'EXEC_UNKNOWN_STATE',
  EXEC_UNKNOWN_SANDBOX: 'EXEC_UNKNOWN_SANDBOX',
  EXEC_DUPLICATE_ID: 'EXEC_DUPLICATE_ID',
  EXEC_INVALID_REFERENCE: 'EXEC_INVALID_REFERENCE',
  EXEC_EMPTY_REGISTRY: 'EXEC_EMPTY_REGISTRY',
  EXEC_MISSING_SOURCE: 'EXEC_MISSING_SOURCE',
  EXEC_MISSING_RATIONALE: 'EXEC_MISSING_RATIONALE',
  EXEC_MISSING_PROVIDED_BY: 'EXEC_MISSING_PROVIDED_BY',
  EXEC_MISSING_PROVENANCE: 'EXEC_MISSING_PROVENANCE',
  EXEC_INVALID_POLICY: 'EXEC_INVALID_POLICY',
  EXEC_INVALID_ENVIRONMENT: 'EXEC_INVALID_ENVIRONMENT',
  EXEC_INVALID_TRACE: 'EXEC_INVALID_TRACE',
  EXEC_INVALID_ARTIFACT: 'EXEC_INVALID_ARTIFACT',
  EXEC_INVALID_INPUT: 'EXEC_INVALID_INPUT',
  EXEC_MISSING_EXECUTION_ID: 'EXEC_MISSING_EXECUTION_ID',
  EXEC_MISSING_LABORATORY_ID: 'EXEC_MISSING_LABORATORY_ID',
  EXEC_INVALID_GOVERNANCE: 'EXEC_INVALID_GOVERNANCE',
  EXEC_MISSING_POLICY: 'EXEC_MISSING_POLICY',
  EXEC_MISSING_ENVIRONMENT: 'EXEC_MISSING_ENVIRONMENT',
  EXEC_INVALID_POLICY_GOVERNANCE: 'EXEC_INVALID_POLICY_GOVERNANCE',
  EXEC_INVALID_POLICY_SANDBOX: 'EXEC_INVALID_POLICY_SANDBOX',
  EXEC_INVALID_ENVIRONMENT_SANDBOX: 'EXEC_INVALID_ENVIRONMENT_SANDBOX',
} as const;

// ---------------------------------------------------------------------------
// Execution Plan Validation
// ---------------------------------------------------------------------------

/**
 * Validates an execution plan against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExecutionPlan(
  plan: LaboratoryExecutionPlan,
): readonly LaboratoryExecutionValidationError[] {
  const errors: LaboratoryExecutionValidationError[] = [];

  if (!plan.executionId || plan.executionId.trim() === '') {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_MISSING_EXECUTION_ID,
      message: 'Execution plan is missing an execution ID.',
      field: 'executionId',
      executionId: plan.executionId,
    });
  }

  if (!plan.laboratoryId || plan.laboratoryId.trim() === '') {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_MISSING_LABORATORY_ID,
      message: 'Execution plan is missing a laboratory ID.',
      field: 'laboratoryId',
      executionId: plan.executionId,
    });
  }

  if (!CANONICAL_EXECUTION_MODES.includes(plan.executionMode)) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_UNKNOWN_MODE,
      message: `Execution plan has unsupported mode: "${plan.executionMode}".`,
      field: 'executionMode',
      executionId: plan.executionId,
    });
  }

  if (!CANONICAL_EXECUTION_STATES.includes(plan.executionState)) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_UNKNOWN_STATE,
      message: `Execution plan has unsupported state: "${plan.executionState}".`,
      field: 'executionState',
      executionId: plan.executionId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(plan.governanceStatus)) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_GOVERNANCE,
      message: `Execution plan has invalid governance status: "${plan.governanceStatus}".`,
      field: 'governanceStatus',
      executionId: plan.executionId,
    });
  }

  if (!plan.executionPolicy) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_MISSING_POLICY,
      message: 'Execution plan is missing an execution policy.',
      field: 'executionPolicy',
      executionId: plan.executionId,
    });
  } else {
    errors.push(...validateExecutionPolicy(plan.executionPolicy));
  }

  if (!plan.executionEnvironment) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_MISSING_ENVIRONMENT,
      message: 'Execution plan is missing an execution environment.',
      field: 'executionEnvironment',
      executionId: plan.executionId,
    });
  } else {
    errors.push(...validateExecutionEnvironment(plan.executionEnvironment));
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Execution Policy Validation
// ---------------------------------------------------------------------------

/**
 * Validates an execution policy against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExecutionPolicy(
  policy: LaboratoryExecutionPolicy,
): readonly LaboratoryExecutionValidationError[] {
  const errors: LaboratoryExecutionValidationError[] = [];

  if (!policy.policyId || policy.policyId.trim() === '') {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_POLICY,
      message: 'Execution policy is missing a policy ID.',
      field: 'policyId',
    });
  }

  if (!CANONICAL_EXECUTION_MODES.includes(policy.executionMode)) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_UNKNOWN_MODE,
      message: `Execution policy has unsupported mode: "${policy.executionMode}".`,
      field: 'executionMode',
    });
  }

  if (!CANONICAL_SANDBOX_LEVELS.includes(policy.sandboxLevel)) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_UNKNOWN_SANDBOX,
      message: `Execution policy has unsupported sandbox level: "${policy.sandboxLevel}".`,
      field: 'sandboxLevel',
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(policy.governanceStatus)) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_POLICY_GOVERNANCE,
      message: `Execution policy has invalid governance status: "${policy.governanceStatus}".`,
      field: 'governanceStatus',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Execution Environment Validation
// ---------------------------------------------------------------------------

/**
 * Validates an execution environment against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExecutionEnvironment(
  environment: LaboratoryExecutionEnvironment,
): readonly LaboratoryExecutionValidationError[] {
  const errors: LaboratoryExecutionValidationError[] = [];

  if (!environment.environmentId || environment.environmentId.trim() === '') {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_ENVIRONMENT,
      message: 'Execution environment is missing an environment ID.',
      field: 'environmentId',
    });
  }

  if (!CANONICAL_SANDBOX_LEVELS.includes(environment.sandboxLevel)) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_UNKNOWN_SANDBOX,
      message: `Execution environment has unsupported sandbox level: "${environment.sandboxLevel}".`,
      field: 'sandboxLevel',
    });
  }

  if (!environment.runtimeProfile || environment.runtimeProfile.trim() === '') {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_ENVIRONMENT,
      message: 'Execution environment is missing a runtime profile.',
      field: 'runtimeProfile',
    });
  }

  if (!environment.resourceProfile || environment.resourceProfile.trim() === '') {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_ENVIRONMENT,
      message: 'Execution environment is missing a resource profile.',
      field: 'resourceProfile',
    });
  }

  if (!environment.executionPolicyId || environment.executionPolicyId.trim() === '') {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_ENVIRONMENT,
      message: 'Execution environment is missing an execution policy ID.',
      field: 'executionPolicyId',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Execution Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates an execution registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExecutionRegistry(
  registry: LaboratoryExecutionRegistry,
): LaboratoryExecutionRegistryValidationResult {
  const errors: LaboratoryExecutionValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_MISSING_PROVENANCE,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.executions || registry.executions.length === 0) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_EMPTY_REGISTRY,
      message: 'Registry has no executions.',
      field: 'executions',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate IDs
  const seenIds = new Set<string>();
  for (const exec of registry.executions) {
    if (seenIds.has(exec.executionId)) {
      errors.push({
        code: EXECUTION_VALIDATION_CODES.EXEC_DUPLICATE_ID,
        message: `Duplicate execution ID: "${exec.executionId}".`,
        executionId: exec.executionId,
      });
    }
    seenIds.add(exec.executionId);
  }

  // Validate each execution
  for (const exec of registry.executions) {
    errors.push(...validateExecutionPlan(exec));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'execution_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Execution Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates an execution artifact against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExecutionArtifact(
  artifact: LaboratoryExecutionArtifact,
): LaboratoryExecutionArtifactValidationResult {
  const errors: LaboratoryExecutionValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_ARTIFACT,
      message: 'Artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!artifact.executionPlan) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_ARTIFACT,
      message: 'Artifact is missing an execution plan.',
      field: 'executionPlan',
    });
  } else {
    errors.push(...validateExecutionPlan(artifact.executionPlan));
  }

  if (!artifact.trace) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_TRACE,
      message: 'Artifact is missing a trace.',
      field: 'trace',
    });
  } else {
    if (artifact.trace.deterministic !== true) {
      errors.push({
        code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (artifact.trace.randomUsed !== false) {
      errors.push({
        code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (artifact.trace.timeDependency !== false) {
      errors.push({
        code: EXECUTION_VALIDATION_CODES.EXEC_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'execution_artifact_composition',
  };
}

// ---------------------------------------------------------------------------
// Execution Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates execution input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExecutionInput(
  input: LaboratoryExecutionInput,
): LaboratoryExecutionInputValidationResult {
  const errors: LaboratoryExecutionValidationError[] = [];

  if (!input.executions || input.executions.length === 0) {
    errors.push({
      code: EXECUTION_VALIDATION_CODES.EXEC_EMPTY_REGISTRY,
      message: 'Input has no executions.',
      field: 'executions',
    });
  } else {
    for (const exec of input.executions) {
      errors.push(...validateExecutionPlan(exec));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'execution_input_composition',
  };
}
