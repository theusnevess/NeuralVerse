/**
 * NV-2100-D9-OPT-12 — Curiosity Governance Validation Layer
 *
 * Deterministic validation for governance workflow metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  GovernanceWorkflow,
  ValidationPolicyMetadata,
  ReviewRecord,
  ApprovalMetadata,
  GovernanceRelationship,
  GovernanceRegistry,
  GovernanceInput,
  CuriosityGovernanceTrace,
  CuriosityArtifactWithGovernance,
  GovernanceValidationError,
  GovernanceRegistryValidationResult,
  GovernanceInputValidationResult,
  GovernanceTraceValidationResult,
  CuriosityArtifactWithGovernanceValidationResult,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_GOVERNANCE_STAGES,
  CANONICAL_REVIEW_OUTCOMES,
  CANONICAL_VALIDATION_POLICIES,
  CANONICAL_APPROVAL_LEVELS,
  CANONICAL_PUBLICATION_STATES,
  CANONICAL_GOVERNANCE_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const GOVERNANCE_VALIDATION_CODES = {
  GOVERNANCE_DUPLICATE_ID: 'GOVERNANCE_DUPLICATE_ID',
  GOVERNANCE_DUPLICATE_TITLE: 'GOVERNANCE_DUPLICATE_TITLE',
  GOVERNANCE_INVALID_STAGE: 'GOVERNANCE_INVALID_STAGE',
  GOVERNANCE_INVALID_REVIEW: 'GOVERNANCE_INVALID_REVIEW',
  GOVERNANCE_INVALID_POLICY: 'GOVERNANCE_INVALID_POLICY',
  GOVERNANCE_INVALID_APPROVAL: 'GOVERNANCE_INVALID_APPROVAL',
  GOVERNANCE_INVALID_PUBLICATION: 'GOVERNANCE_INVALID_PUBLICATION',
  GOVERNANCE_INVALID_STATUS: 'GOVERNANCE_INVALID_STATUS',
  GOVERNANCE_INVALID_GOVERNANCE: 'GOVERNANCE_INVALID_GOVERNANCE',
  GOVERNANCE_MISSING_PROVENANCE: 'GOVERNANCE_MISSING_PROVENANCE',
  GOVERNANCE_MISSING_PROVIDER: 'GOVERNANCE_MISSING_PROVIDER',
  GOVERNANCE_MISSING_RATIONALE: 'GOVERNANCE_MISSING_RATIONALE',
  GOVERNANCE_MISSING_CURIOSITY_REFERENCE: 'GOVERNANCE_MISSING_CURIOSITY_REFERENCE',
  GOVERNANCE_MISSING_WORKFLOW_ID: 'GOVERNANCE_MISSING_WORKFLOW_ID',
  GOVERNANCE_MISSING_TITLE: 'GOVERNANCE_MISSING_TITLE',
  GOVERNANCE_MISSING_POLICY: 'GOVERNANCE_MISSING_POLICY',
  GOVERNANCE_SELF_RELATIONSHIP: 'GOVERNANCE_SELF_RELATIONSHIP',
  GOVERNANCE_EMPTY_REGISTRY: 'GOVERNANCE_EMPTY_REGISTRY',
  GOVERNANCE_INVALID_TRACE: 'GOVERNANCE_INVALID_TRACE',
  GOVERNANCE_REGISTRY_INCONSISTENCY: 'GOVERNANCE_REGISTRY_INCONSISTENCY',
  GOVERNANCE_INVALID_CONFIGURATION: 'GOVERNANCE_INVALID_CONFIGURATION',
  GOVERNANCE_INVALID_RELATIONSHIP: 'GOVERNANCE_INVALID_RELATIONSHIP',
  GOVERNANCE_MISSING_GOVERNANCE: 'GOVERNANCE_MISSING_GOVERNANCE',
  GOVERNANCE_UNSUPPORTED_CONFIGURATION: 'GOVERNANCE_UNSUPPORTED_CONFIGURATION',
} as const;

// ---------------------------------------------------------------------------
// Single Workflow Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single governance workflow against canonical invariants.
 * Pure function. No side effects.
 */
export function validateGovernanceWorkflow(
  workflow: GovernanceWorkflow,
): readonly GovernanceValidationError[] {
  const errors: GovernanceValidationError[] = [];

  if (!workflow.workflowId || workflow.workflowId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_WORKFLOW_ID,
      message: 'Governance workflow is missing a workflow ID.',
      field: 'workflowId',
      workflowId: workflow.workflowId,
    });
  }

  if (!workflow.title || workflow.title.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_TITLE,
      message: 'Governance workflow is missing a title.',
      field: 'title',
      workflowId: workflow.workflowId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STAGES.includes(workflow.governanceStage)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_STAGE,
      message: `Governance workflow has unsupported governance stage: "${workflow.governanceStage}".`,
      field: 'governanceStage',
      workflowId: workflow.workflowId,
    });
  }

  if (!CANONICAL_REVIEW_OUTCOMES.includes(workflow.reviewOutcome)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_REVIEW,
      message: `Governance workflow has unsupported review outcome: "${workflow.reviewOutcome}".`,
      field: 'reviewOutcome',
      workflowId: workflow.workflowId,
    });
  }

  if (!CANONICAL_VALIDATION_POLICIES.includes(workflow.validationPolicy)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_POLICY,
      message: `Governance workflow has unsupported validation policy: "${workflow.validationPolicy}".`,
      field: 'validationPolicy',
      workflowId: workflow.workflowId,
    });
  }

  if (!CANONICAL_APPROVAL_LEVELS.includes(workflow.approvalLevel)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_APPROVAL,
      message: `Governance workflow has unsupported approval level: "${workflow.approvalLevel}".`,
      field: 'approvalLevel',
      workflowId: workflow.workflowId,
    });
  }

  if (!CANONICAL_PUBLICATION_STATES.includes(workflow.publicationState)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_PUBLICATION,
      message: `Governance workflow has unsupported publication state: "${workflow.publicationState}".`,
      field: 'publicationState',
      workflowId: workflow.workflowId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUS.includes(workflow.status)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_STATUS,
      message: `Governance workflow has unsupported status: "${workflow.status}".`,
      field: 'status',
      workflowId: workflow.workflowId,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(workflow.governance)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_GOVERNANCE,
      message: `Governance workflow has invalid governance: "${workflow.governance}".`,
      field: 'governance',
      workflowId: workflow.workflowId,
    });
  }

  if (!workflow.provenance) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVENANCE,
      message: 'Governance workflow is missing provenance.',
      field: 'provenance',
      workflowId: workflow.workflowId,
    });
  } else {
    if (!workflow.provenance.provider || workflow.provenance.provider.trim() === '') {
      errors.push({
        code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVIDER,
        message: 'Governance workflow provenance is missing a provider.',
        field: 'provenance.provider',
        workflowId: workflow.workflowId,
      });
    }

    if (!workflow.provenance.rationale || workflow.provenance.rationale.trim() === '') {
      errors.push({
        code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_RATIONALE,
        message: 'Governance workflow provenance is missing a rationale.',
        field: 'provenance.rationale',
        workflowId: workflow.workflowId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Validation Policy Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates validation policy metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateValidationPolicy(
  metadata: ValidationPolicyMetadata,
): readonly GovernanceValidationError[] {
  const errors: GovernanceValidationError[] = [];

  if (!metadata.metadataId || metadata.metadataId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_POLICY,
      message: 'Validation policy metadata is missing a metadata ID.',
      field: 'metadataId',
    });
  }

  if (!metadata.workflowId || metadata.workflowId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Validation policy metadata is missing a workflow ID.',
      field: 'workflowId',
    });
  }

  if (!CANONICAL_VALIDATION_POLICIES.includes(metadata.validationPolicy)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_POLICY,
      message: `Validation policy metadata has unsupported validation policy: "${metadata.validationPolicy}".`,
      field: 'validationPolicy',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Review Record Validation
// ---------------------------------------------------------------------------

/**
 * Validates a review record against canonical invariants.
 * Pure function. No side effects.
 */
export function validateReviewRecord(
  record: ReviewRecord,
): readonly GovernanceValidationError[] {
  const errors: GovernanceValidationError[] = [];

  if (!record.recordId || record.recordId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Review record is missing a record ID.',
      field: 'recordId',
    });
  }

  if (!record.workflowId || record.workflowId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Review record is missing a workflow ID.',
      field: 'workflowId',
    });
  }

  if (!record.reviewerId || record.reviewerId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Review record is missing a reviewer ID.',
      field: 'reviewerId',
    });
  }

  if (!record.reviewDate || record.reviewDate.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_CONFIGURATION,
      message: 'Review record is missing a review date.',
      field: 'reviewDate',
    });
  }

  if (!CANONICAL_REVIEW_OUTCOMES.includes(record.reviewOutcome)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_REVIEW,
      message: `Review record has unsupported review outcome: "${record.reviewOutcome}".`,
      field: 'reviewOutcome',
    });
  }

  if (!record.reviewComments || record.reviewComments.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_CONFIGURATION,
      message: 'Review record is missing review comments.',
      field: 'reviewComments',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Approval Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates approval metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateApprovalMetadata(
  metadata: ApprovalMetadata,
): readonly GovernanceValidationError[] {
  const errors: GovernanceValidationError[] = [];

  if (!metadata.metadataId || metadata.metadataId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Approval metadata is missing a metadata ID.',
      field: 'metadataId',
    });
  }

  if (!metadata.workflowId || metadata.workflowId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Approval metadata is missing a workflow ID.',
      field: 'workflowId',
    });
  }

  if (!CANONICAL_APPROVAL_LEVELS.includes(metadata.approvalLevel)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_APPROVAL,
      message: `Approval metadata has unsupported approval level: "${metadata.approvalLevel}".`,
      field: 'approvalLevel',
    });
  }

  if (!metadata.approverId || metadata.approverId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Approval metadata is missing an approver ID.',
      field: 'approverId',
    });
  }

  if (!metadata.approvalDate || metadata.approvalDate.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_CONFIGURATION,
      message: 'Approval metadata is missing an approval date.',
      field: 'approvalDate',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Governance Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a governance relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateGovernanceRelationship(
  relationship: GovernanceRelationship,
): readonly GovernanceValidationError[] {
  const errors: GovernanceValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Governance relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceWorkflowId || relationship.sourceWorkflowId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Governance relationship is missing a source workflow ID.',
      field: 'sourceWorkflowId',
    });
  }

  if (!relationship.targetWorkflowId || relationship.targetWorkflowId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Governance relationship is missing a target workflow ID.',
      field: 'targetWorkflowId',
    });
  }

  if (relationship.sourceWorkflowId === relationship.targetWorkflowId) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_SELF_RELATIONSHIP,
      message: 'Governance relationship cannot be a self-relationship.',
      field: 'targetWorkflowId',
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVENANCE,
      message: 'Governance relationship is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!relationship.provenance.provider || relationship.provenance.provider.trim() === '') {
      errors.push({
        code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVIDER,
        message: 'Governance relationship provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_RATIONALE,
        message: 'Governance relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Governance Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a governance registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateGovernanceRegistry(
  registry: GovernanceRegistry,
): GovernanceRegistryValidationResult {
  const errors: GovernanceValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.workflows || registry.workflows.length === 0) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_EMPTY_REGISTRY,
      message: 'Registry has no workflows.',
      field: 'workflows',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate workflow IDs
  const seenIds = new Set<string>();
  for (const workflow of registry.workflows) {
    if (seenIds.has(workflow.workflowId)) {
      errors.push({
        code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_DUPLICATE_ID,
        message: `Duplicate workflow ID: "${workflow.workflowId}".`,
        workflowId: workflow.workflowId,
      });
    }
    seenIds.add(workflow.workflowId);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const workflow of registry.workflows) {
    if (seenTitles.has(workflow.title)) {
      errors.push({
        code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_DUPLICATE_TITLE,
        message: `Duplicate workflow title: "${workflow.title}".`,
        field: 'title',
        workflowId: workflow.workflowId,
      });
    }
    seenTitles.add(workflow.title);
  }

  // Validate each workflow
  for (const workflow of registry.workflows) {
    errors.push(...validateGovernanceWorkflow(workflow));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateGovernanceRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'governance_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Governance Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates governance input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateGovernanceInput(
  input: GovernanceInput,
): GovernanceInputValidationResult {
  const errors: GovernanceValidationError[] = [];

  if (!input.workflows || input.workflows.length === 0) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_EMPTY_REGISTRY,
      message: 'Input has no workflows.',
      field: 'workflows',
    });
  } else {
    for (const workflow of input.workflows) {
      errors.push(...validateGovernanceWorkflow(workflow));
    }
  }

  for (const relationship of input.relationships) {
    errors.push(...validateGovernanceRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'governance_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Governance Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a governance trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateGovernanceTrace(
  trace: CuriosityGovernanceTrace,
): GovernanceTraceValidationResult {
  const errors: GovernanceValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Governance trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Governance trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Governance trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Governance trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'governance_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Governance Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity artifact with governance against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityArtifactWithGovernance(
  artifact: CuriosityArtifactWithGovernance,
): CuriosityArtifactWithGovernanceValidationResult {
  const errors: GovernanceValidationError[] = [];

  if (!artifact.curiosityId || artifact.curiosityId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity artifact is missing a curiosity ID.',
      field: 'curiosityId',
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_TITLE,
      message: 'Curiosity artifact is missing a title.',
      field: 'title',
    });
  }

  if (!artifact.workflows || artifact.workflows.length === 0) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_EMPTY_REGISTRY,
      message: 'Curiosity artifact has no workflows.',
      field: 'workflows',
    });
  } else {
    for (const workflow of artifact.workflows) {
      errors.push(...validateGovernanceWorkflow(workflow));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVENANCE,
      message: 'Curiosity artifact is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVIDER,
        message: 'Curiosity artifact provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_RATIONALE,
        message: 'Curiosity artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_artifact_with_governance_composition',
  };
}
