/**
 * NV-1600-D4-OPT-06 — Workflow Validation Layer
 *
 * Deterministic validation for workflow metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryWorkflow,
  LaboratoryWorkflowStep,
  LaboratoryWorkflowRegistry,
  LaboratoryArtifactWithWorkflows,
  LaboratoryWorkflowInput,
  LaboratoryWorkflowValidationError,
  LaboratoryWorkflowValidationResult,
  LaboratoryWorkflowRegistryValidationResult,
  LaboratoryWorkflowArtifactValidationResult,
  LaboratoryWorkflowInputValidationResult,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_WORKFLOW_TYPES,
  CANONICAL_WORKFLOW_STEP_TYPES,
  CANONICAL_WORKFLOW_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const WORKFLOW_VALIDATION_CODES = {
  WORKFLOW_UNKNOWN_TYPE: 'WORKFLOW_UNKNOWN_TYPE',
  WORKFLOW_UNKNOWN_STATUS: 'WORKFLOW_UNKNOWN_STATUS',
  STEP_UNKNOWN_TYPE: 'STEP_UNKNOWN_TYPE',
  WORKFLOW_DUPLICATE_ID: 'WORKFLOW_DUPLICATE_ID',
  WORKFLOW_DUPLICATE_NAME: 'WORKFLOW_DUPLICATE_NAME',
  STEP_DUPLICATE_ID: 'STEP_DUPLICATE_ID',
  WORKFLOW_MISSING_WORKFLOW_ID: 'WORKFLOW_MISSING_WORKFLOW_ID',
  WORKFLOW_MISSING_NAME: 'WORKFLOW_MISSING_NAME',
  WORKFLOW_MISSING_LABORATORY_ID: 'WORKFLOW_MISSING_LABORATORY_ID',
  WORKFLOW_MISSING_STEPS: 'WORKFLOW_MISSING_STEPS',
  WORKFLOW_INVALID_GOVERNANCE: 'WORKFLOW_INVALID_GOVERNANCE',
  WORKFLOW_MISSING_PROVENANCE: 'WORKFLOW_MISSING_PROVENANCE',
  WORKFLOW_INVALID_REFERENCE: 'WORKFLOW_INVALID_REFERENCE',
  STEP_MISSING_ID: 'STEP_MISSING_ID',
  STEP_MISSING_TITLE: 'STEP_MISSING_TITLE',
  STEP_INVALID_GOVERNANCE: 'STEP_INVALID_GOVERNANCE',
  STEP_INVALID_ORDER: 'STEP_INVALID_ORDER',
  MISSING_PROVENANCE: 'MISSING_PROVENANCE',
  MISSING_SOURCE: 'MISSING_SOURCE',
  MISSING_RATIONALE: 'MISSING_RATIONALE',
  MISSING_PROVIDED_BY: 'MISSING_PROVIDED_BY',
  EMPTY_REGISTRY: 'EMPTY_REGISTRY',
  TRACE_NOT_DETERMINISTIC: 'TRACE_NOT_DETERMINISTIC',
  TRACE_RANDOM_USED: 'TRACE_RANDOM_USED',
  TRACE_TIME_DEPENDENCY: 'TRACE_TIME_DEPENDENCY',
  TRACE_LABORATORY_MUTATED: 'TRACE_LABORATORY_MUTATED',
  REGISTRY_DUPLICATE_WORKFLOW_ID: 'REGISTRY_DUPLICATE_WORKFLOW_ID',
  REGISTRY_DUPLICATE_WORKFLOW_NAME: 'REGISTRY_DUPLICATE_WORKFLOW_NAME',
} as const;

// ---------------------------------------------------------------------------
// Single Workflow Step Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single workflow step against canonical invariants.
 * Pure function. No side effects.
 */
export function validateWorkflowStep(
  step: LaboratoryWorkflowStep,
): readonly LaboratoryWorkflowValidationError[] {
  const errors: LaboratoryWorkflowValidationError[] = [];

  if (!step.stepId || step.stepId.trim() === '') {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.STEP_MISSING_ID,
      message: 'Workflow step is missing a step ID.',
      field: 'stepId',
      stepId: step.stepId,
    });
  }

  if (!step.title || step.title.trim() === '') {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.STEP_MISSING_TITLE,
      message: 'Workflow step is missing a title.',
      field: 'title',
      stepId: step.stepId,
    });
  }

  if (!CANONICAL_WORKFLOW_STEP_TYPES.includes(step.stepType)) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.STEP_UNKNOWN_TYPE,
      message: `Workflow step has unsupported type: "${step.stepType}".`,
      field: 'stepType',
      stepId: step.stepId,
    });
  }

  if (typeof step.stepOrder !== 'number' || step.stepOrder < 0) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.STEP_INVALID_ORDER,
      message: 'Workflow step has invalid step order.',
      field: 'stepOrder',
      stepId: step.stepId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(step.governanceStatus)) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.STEP_INVALID_GOVERNANCE,
      message: `Workflow step has invalid governance status: "${step.governanceStatus}".`,
      field: 'governanceStatus',
      stepId: step.stepId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Workflow Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single workflow against canonical invariants.
 * Pure function. No side effects.
 */
export function validateWorkflow(
  wf: LaboratoryWorkflow,
): readonly LaboratoryWorkflowValidationError[] {
  const errors: LaboratoryWorkflowValidationError[] = [];

  if (!wf.workflowId || wf.workflowId.trim() === '') {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.WORKFLOW_MISSING_WORKFLOW_ID,
      message: 'Workflow is missing a workflow ID.',
      field: 'workflowId',
      workflowId: wf.workflowId,
    });
  }

  if (!wf.name || wf.name.trim() === '') {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.WORKFLOW_MISSING_NAME,
      message: 'Workflow is missing a name.',
      field: 'name',
      workflowId: wf.workflowId,
    });
  }

  if (!wf.laboratoryId || wf.laboratoryId.trim() === '') {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.WORKFLOW_MISSING_LABORATORY_ID,
      message: 'Workflow is missing a laboratory ID.',
      field: 'laboratoryId',
      workflowId: wf.workflowId,
    });
  }

  if (!CANONICAL_WORKFLOW_TYPES.includes(wf.workflowType)) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.WORKFLOW_UNKNOWN_TYPE,
      message: `Workflow has unsupported type: "${wf.workflowType}".`,
      field: 'workflowType',
      workflowId: wf.workflowId,
    });
  }

  if (!CANONICAL_WORKFLOW_STATUS.includes(wf.status)) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.WORKFLOW_UNKNOWN_STATUS,
      message: `Workflow has unsupported status: "${wf.status}".`,
      field: 'status',
      workflowId: wf.workflowId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(wf.governanceStatus)) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.WORKFLOW_INVALID_GOVERNANCE,
      message: `Workflow has invalid governance status: "${wf.governanceStatus}".`,
      field: 'governanceStatus',
      workflowId: wf.workflowId,
    });
  }

  if (!wf.provenance) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.WORKFLOW_MISSING_PROVENANCE,
      message: 'Workflow is missing provenance.',
      field: 'provenance',
      workflowId: wf.workflowId,
    });
  }

  if (!wf.steps || wf.steps.length === 0) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.WORKFLOW_MISSING_STEPS,
      message: 'Workflow has no steps.',
      field: 'steps',
      workflowId: wf.workflowId,
    });
  } else {
    // Check for duplicate step IDs
    const seenStepIds = new Set<string>();
    for (const step of wf.steps) {
      if (seenStepIds.has(step.stepId)) {
        errors.push({
          code: WORKFLOW_VALIDATION_CODES.STEP_DUPLICATE_ID,
          message: `Duplicate step ID: "${step.stepId}".`,
          field: 'stepId',
          workflowId: wf.workflowId,
          stepId: step.stepId,
        });
      }
      seenStepIds.add(step.stepId);
    }

    // Validate each step
    for (const step of wf.steps) {
      errors.push(...validateWorkflowStep(step));
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Workflow Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a workflow registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateWorkflowRegistry(
  registry: LaboratoryWorkflowRegistry,
): LaboratoryWorkflowRegistryValidationResult {
  const errors: LaboratoryWorkflowValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.workflows || registry.workflows.length === 0) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Registry has no workflows.',
      field: 'workflows',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.TRACE_RANDOM_USED,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate workflow IDs
  const seenWorkflowIds = new Set<string>();
  for (const wf of registry.workflows) {
    if (seenWorkflowIds.has(wf.workflowId)) {
      errors.push({
        code: WORKFLOW_VALIDATION_CODES.REGISTRY_DUPLICATE_WORKFLOW_ID,
        message: `Duplicate workflow ID: "${wf.workflowId}".`,
        workflowId: wf.workflowId,
      });
    }
    seenWorkflowIds.add(wf.workflowId);
  }

  // Check for duplicate workflow names
  const seenWorkflowNames = new Set<string>();
  for (const wf of registry.workflows) {
    if (seenWorkflowNames.has(wf.name)) {
      errors.push({
        code: WORKFLOW_VALIDATION_CODES.REGISTRY_DUPLICATE_WORKFLOW_NAME,
        message: `Duplicate workflow name: "${wf.name}".`,
        field: 'name',
        workflowId: wf.workflowId,
      });
    }
    seenWorkflowNames.add(wf.name);
  }

  // Validate each workflow
  for (const wf of registry.workflows) {
    errors.push(...validateWorkflow(wf));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'workflow_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a laboratory artifact with workflows against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryArtifactWithWorkflows(
  artifact: LaboratoryArtifactWithWorkflows,
): LaboratoryWorkflowArtifactValidationResult {
  const errors: LaboratoryWorkflowValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.WORKFLOW_INVALID_REFERENCE,
      message: 'Artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!artifact.registry) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Artifact is missing a registry.',
      field: 'registry',
    });
  } else {
    const registryResult = validateWorkflowRegistry(artifact.registry);
    errors.push(...registryResult.errors);
  }

  if (!artifact.trace) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Artifact is missing a trace.',
      field: 'trace',
    });
  } else {
    if (artifact.trace.deterministic !== true) {
      errors.push({
        code: WORKFLOW_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (artifact.trace.randomUsed !== false) {
      errors.push({
        code: WORKFLOW_VALIDATION_CODES.TRACE_RANDOM_USED,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (artifact.trace.timeDependency !== false) {
      errors.push({
        code: WORKFLOW_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'workflow_artifact_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates workflow input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateWorkflowInput(
  input: LaboratoryWorkflowInput,
): LaboratoryWorkflowInputValidationResult {
  const errors: LaboratoryWorkflowValidationError[] = [];

  if (!input.workflows || input.workflows.length === 0) {
    errors.push({
      code: WORKFLOW_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Input has no workflows.',
      field: 'workflows',
    });
  } else {
    for (const wf of input.workflows) {
      errors.push(...validateWorkflow(wf));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'workflow_input_composition',
  };
}
