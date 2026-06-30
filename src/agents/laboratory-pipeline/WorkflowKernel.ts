/**
 * NV-1600-D4-OPT-06 — Laboratory Workflow Orchestration Kernel
 *
 * Deterministic orchestration functions for workflow metadata.
 * Produces workflows, workflow steps, artifacts, traces, and registries.
 *
 * This module never:
 * - Executes workflows
 * - Schedules workflows
 * - Runs pipeline execution
 * - Uses workflow engines
 * - Uses orchestration runtime
 * - Uses background jobs
 * - Uses event systems
 * - Uses queues
 * - Uses state machines
 * - Uses interpreters
 * - Uses execution graphs
 * - Uses DAG execution
 * - Uses callbacks
 * - Uses async
 * - Uses promises
 * - Uses timers
 *
 * Workflow metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryWorkflow,
  LaboratoryWorkflowStep,
  LaboratoryWorkflowRegistry,
  LaboratoryWorkflowDecision,
  LaboratoryWorkflowTrace,
  LaboratoryWorkflowInput,
  LaboratoryArtifactWithWorkflows,
  LaboratoryWorkflowProvenance,
  LaboratoryWorkflowType,
  LaboratoryWorkflowStepType,
  LaboratoryWorkflowStatus,
  LaboratoryGovernanceStatus,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_WORKFLOW_TYPES,
  CANONICAL_WORKFLOW_STEP_TYPES,
  CANONICAL_WORKFLOW_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Workflow Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes workflow provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeWorkflowProvenance(params: {
  readonly workflowId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): LaboratoryWorkflowProvenance {
  return {
    workflowId: params.workflowId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Workflow Step Composition
// ---------------------------------------------------------------------------

/**
 * Composes a workflow step from provided parameters.
 * Pure function. No side effects.
 */
export function composeWorkflowStep(params: {
  readonly stepId: string;
  readonly stepType: LaboratoryWorkflowStepType;
  readonly stepOrder: number;
  readonly title: string;
  readonly description: string;
  readonly experimentId: string;
  readonly configurationId: string;
  readonly executionPolicyId: string;
  readonly resultArtifactId: string;
  readonly visualizationId: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
}): LaboratoryWorkflowStep {
  return {
    stepId: params.stepId,
    stepType: params.stepType,
    stepOrder: params.stepOrder,
    title: params.title,
    description: params.description,
    experimentId: params.experimentId,
    configurationId: params.configurationId,
    executionPolicyId: params.executionPolicyId,
    resultArtifactId: params.resultArtifactId,
    visualizationId: params.visualizationId,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Workflow Composition
// ---------------------------------------------------------------------------

/**
 * Composes a workflow from provided parameters.
 * Pure function. No side effects.
 */
export function composeWorkflow(params: {
  readonly workflowId: string;
  readonly workflowType: LaboratoryWorkflowType;
  readonly name: string;
  readonly description: string;
  readonly laboratoryId: string;
  readonly steps: readonly LaboratoryWorkflowStep[];
  readonly status: LaboratoryWorkflowStatus;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryWorkflowProvenance;
}): LaboratoryWorkflow {
  return {
    workflowId: params.workflowId,
    workflowType: params.workflowType,
    name: params.name,
    description: params.description,
    laboratoryId: params.laboratoryId,
    steps: [...params.steps],
    status: params.status,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Workflow Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a workflow decision from validation results.
 * Pure function. No side effects.
 */
function _composeWorkflowDecision(
  workflowId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): LaboratoryWorkflowDecision {
  return {
    decisionId: `_decision_workflow_${workflowId}`,
    workflowId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Workflow Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a workflow trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeWorkflowTrace(params: {
  readonly traceId: string;
  readonly workflowCount: number;
  readonly stepCount: number;
  readonly decisions: readonly LaboratoryWorkflowDecision[];
}): LaboratoryWorkflowTrace {
  return {
    traceId: params.traceId,
    workflowCount: params.workflowCount,
    stepCount: params.stepCount,
    validatedCount: params.decisions.filter((d) => d.validationPassed).length,
    invalidCount: params.decisions.filter((d) => !d.validationPassed).length,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_workflow_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for workflows.
 * Sorts by workflowId, then workflowType, then stepOrder, then stepId.
 * Pure function. No side effects.
 */
function _compareWorkflow(
  a: LaboratoryWorkflow,
  b: LaboratoryWorkflow,
): number {
  if (a.workflowId < b.workflowId) return -1;
  if (a.workflowId > b.workflowId) return 1;

  if (a.workflowType < b.workflowType) return -1;
  if (a.workflowType > b.workflowType) return 1;

  const aStepOrder = a.steps[0]?.stepOrder ?? 0;
  const bStepOrder = b.steps[0]?.stepOrder ?? 0;
  if (aStepOrder < bStepOrder) return -1;
  if (aStepOrder > bStepOrder) return 1;

  const aStepId = a.steps[0]?.stepId ?? '';
  const bStepId = b.steps[0]?.stepId ?? '';
  if (aStepId < bStepId) return -1;
  if (aStepId > bStepId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Workflow Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a workflow registry from workflows.
 * Pure function. No side effects.
 * Deterministic ordering: workflowId → workflowType → stepOrder → stepId.
 */
export function composeWorkflowRegistry(
  workflows: readonly LaboratoryWorkflow[],
): LaboratoryWorkflowRegistry {
  const sortedWorkflows = [...workflows].sort(_compareWorkflow);

  const totalSteps = sortedWorkflows.reduce((sum, wf) => sum + wf.steps.length, 0);

  return {
    registryId: `_workflow_registry_${sortedWorkflows.length}`,
    workflows: sortedWorkflows,
    workflowCount: sortedWorkflows.length,
    stepCount: totalSteps,
    deterministic: true,
    generatedFrom: 'deterministic_workflow_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Workflows Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete laboratory workflow artifact from an input.
 * Pure function. No side effects.
 */
export function composeLaboratoryWorkflows(
  input: LaboratoryWorkflowInput,
): LaboratoryArtifactWithWorkflows {
  const decisions = input.workflows.map((wf) => {
    const errors = _validateWorkflowForDecision(wf);
    return _composeWorkflowDecision(wf.workflowId, errors.length === 0, errors);
  });

  const totalSteps = input.workflows.reduce((sum, wf) => sum + wf.steps.length, 0);

  const trace = composeWorkflowTrace({
    traceId: `_trace_workflow_${input.workflows.length}`,
    workflowCount: input.workflows.length,
    stepCount: totalSteps,
    decisions,
  });

  const registry = composeWorkflowRegistry(input.workflows);

  return {
    artifactId: `_artifact_workflow_${input.workflows.length}`,
    registry,
    trace,
  };
}

/**
 * Validates a workflow for decision composition.
 * Pure function. No side effects.
 */
function _validateWorkflowForDecision(
  wf: LaboratoryWorkflow,
): readonly string[] {
  const errors: string[] = [];

  if (!wf.workflowId || wf.workflowId.trim() === '') {
    errors.push('WORKFLOW_MISSING_WORKFLOW_ID');
  }

  if (!wf.name || wf.name.trim() === '') {
    errors.push('WORKFLOW_MISSING_NAME');
  }

  if (!wf.laboratoryId || wf.laboratoryId.trim() === '') {
    errors.push('WORKFLOW_MISSING_LABORATORY_ID');
  }

  if (!CANONICAL_WORKFLOW_TYPES.includes(wf.workflowType)) {
    errors.push('WORKFLOW_UNKNOWN_TYPE');
  }

  if (!CANONICAL_WORKFLOW_STATUS.includes(wf.status)) {
    errors.push('WORKFLOW_UNKNOWN_STATUS');
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(wf.governanceStatus)) {
    errors.push('WORKFLOW_INVALID_GOVERNANCE');
  }

  if (!wf.provenance) {
    errors.push('WORKFLOW_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported workflow type.
 */
export function isSupportedWorkflowType(
  workflowType: string,
): workflowType is LaboratoryWorkflowType {
  return CANONICAL_WORKFLOW_TYPES.includes(workflowType as LaboratoryWorkflowType);
}

/**
 * Checks if a string is a supported workflow step type.
 */
export function isSupportedWorkflowStepType(
  stepType: string,
): stepType is LaboratoryWorkflowStepType {
  return CANONICAL_WORKFLOW_STEP_TYPES.includes(stepType as LaboratoryWorkflowStepType);
}

/**
 * Checks if a string is a supported workflow status.
 */
export function isSupportedWorkflowStatus(
  status: string,
): status is LaboratoryWorkflowStatus {
  return CANONICAL_WORKFLOW_STATUS.includes(status as LaboratoryWorkflowStatus);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedWorkflowGovernanceStatus(
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
 * Returns the canonical workflow types.
 */
export function getCanonicalWorkflowTypes(): readonly LaboratoryWorkflowType[] {
  return CANONICAL_WORKFLOW_TYPES;
}

/**
 * Returns the canonical workflow step types.
 */
export function getCanonicalWorkflowStepTypes(): readonly LaboratoryWorkflowStepType[] {
  return CANONICAL_WORKFLOW_STEP_TYPES;
}

/**
 * Returns the canonical workflow statuses.
 */
export function getCanonicalWorkflowStatuses(): readonly LaboratoryWorkflowStatus[] {
  return CANONICAL_WORKFLOW_STATUS;
}
