/**
 * NV-2100-D9-OPT-12 — Curiosity Governance Kernel
 *
 * Deterministic orchestration functions for governance workflow metadata.
 * Produces governance workflows, validation policies, review records, approval metadata, traces, and registries.
 *
 * This module never:
 * - Approves artifacts
 * - Executes governance decisions
 * - Performs moderation
 * - Modifies curiosity content
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Governance workflow metadata only.
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
  GovernanceRegistryMetadata,
  GovernanceInput,
  CuriosityGovernanceProvenance,
  CuriosityGovernanceDecision,
  CuriosityGovernanceTrace,
  CuriosityArtifactWithGovernance,
  GovernanceStage,
  ReviewOutcome,
  ValidationPolicy,
  ApprovalLevel,
  PublicationState,
  GovernanceStatus,
  CuriosityGovernance,
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
// Governance Workflow Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes governance workflow provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityGovernanceProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}): CuriosityGovernanceProvenance {
  return {
    provider: params.provider,
    source: params.source,
    rationale: params.rationale,
    version: params.version,
  };
}

// ---------------------------------------------------------------------------
// Governance Workflow Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a governance workflow decision from validation results.
 * Pure function. No side effects.
 */
function _composeCuriosityGovernanceDecision(
  workflowId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): CuriosityGovernanceDecision {
  return {
    decisionId: `_decision_${workflowId}`,
    workflowId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Governance Workflow Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a governance workflow trace from metadata.
 * Pure function. No side effects.
 */
export function composeCuriosityGovernanceTrace(params: {
  readonly traceId: string;
}): CuriosityGovernanceTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_curiosity_governance_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Governance Workflow Composition
// ---------------------------------------------------------------------------

/**
 * Composes a governance workflow from provided parameters.
 * Pure function. No side effects.
 */
export function composeGovernanceWorkflow(params: {
  readonly workflowId: string;
  readonly title: string;
  readonly governanceStage: GovernanceStage;
  readonly reviewOutcome: ReviewOutcome;
  readonly validationPolicy: ValidationPolicy;
  readonly approvalLevel: ApprovalLevel;
  readonly publicationState: PublicationState;
  readonly conceptIds: readonly string[];
  readonly status: GovernanceStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityGovernanceProvenance;
  readonly trace: CuriosityGovernanceTrace;
}): GovernanceWorkflow {
  return {
    workflowId: params.workflowId,
    title: params.title,
    governanceStage: params.governanceStage,
    reviewOutcome: params.reviewOutcome,
    validationPolicy: params.validationPolicy,
    approvalLevel: params.approvalLevel,
    publicationState: params.publicationState,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Validation Policy Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes validation policy metadata from provided parameters.
 * Pure function. No side effects.
 */
export function composeValidationPolicy(params: {
  readonly metadataId: string;
  readonly workflowId: string;
  readonly validationPolicy: ValidationPolicy;
  readonly automaticChecks: boolean;
  readonly manualReview: boolean;
  readonly peerReview: boolean;
  readonly expertReview: boolean;
  readonly contentReview: boolean;
  readonly safetyReview: boolean;
  readonly qualityReview: boolean;
  readonly complianceReview: boolean;
}): ValidationPolicyMetadata {
  return {
    metadataId: params.metadataId,
    workflowId: params.workflowId,
    validationPolicy: params.validationPolicy,
    automaticChecks: params.automaticChecks,
    manualReview: params.manualReview,
    peerReview: params.peerReview,
    expertReview: params.expertReview,
    contentReview: params.contentReview,
    safetyReview: params.safetyReview,
    qualityReview: params.qualityReview,
    complianceReview: params.complianceReview,
  };
}

// ---------------------------------------------------------------------------
// Review Record Composition
// ---------------------------------------------------------------------------

/**
 * Composes a review record from provided parameters.
 * Pure function. No side effects.
 */
export function composeReviewRecord(params: {
  readonly recordId: string;
  readonly workflowId: string;
  readonly reviewerId: string;
  readonly reviewDate: string;
  readonly reviewOutcome: ReviewOutcome;
  readonly reviewComments: string;
  readonly reviewDuration: string;
  readonly reviewPriority: number;
}): ReviewRecord {
  return {
    recordId: params.recordId,
    workflowId: params.workflowId,
    reviewerId: params.reviewerId,
    reviewDate: params.reviewDate,
    reviewOutcome: params.reviewOutcome,
    reviewComments: params.reviewComments,
    reviewDuration: params.reviewDuration,
    reviewPriority: params.reviewPriority,
  };
}

// ---------------------------------------------------------------------------
// Approval Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes approval metadata from provided parameters.
 * Pure function. No side effects.
 */
export function composeApprovalMetadata(params: {
  readonly metadataId: string;
  readonly workflowId: string;
  readonly approvalLevel: ApprovalLevel;
  readonly approverId: string;
  readonly approvalDate: string;
  readonly approvalExpiry: string;
  readonly approvalConditions: readonly string[];
  readonly approvalRevocable: boolean;
}): ApprovalMetadata {
  return {
    metadataId: params.metadataId,
    workflowId: params.workflowId,
    approvalLevel: params.approvalLevel,
    approverId: params.approverId,
    approvalDate: params.approvalDate,
    approvalExpiry: params.approvalExpiry,
    approvalConditions: [...params.approvalConditions],
    approvalRevocable: params.approvalRevocable,
  };
}

// ---------------------------------------------------------------------------
// Governance Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a governance relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeGovernanceRelationship(params: {
  readonly relationshipId: string;
  readonly sourceWorkflowId: string;
  readonly targetWorkflowId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriosityGovernanceProvenance;
}): GovernanceRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceWorkflowId: params.sourceWorkflowId,
    targetWorkflowId: params.targetWorkflowId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Workflows
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for governance workflows.
 * Sorts by workflowId, then governanceStage, then title.
 * Pure function. No side effects.
 */
function _compareGovernanceWorkflow(
  a: GovernanceWorkflow,
  b: GovernanceWorkflow,
): number {
  if (a.workflowId < b.workflowId) return -1;
  if (a.workflowId > b.workflowId) return 1;

  if (a.governanceStage < b.governanceStage) return -1;
  if (a.governanceStage > b.governanceStage) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Relationships
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for governance relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _compareGovernanceRelationship(
  a: GovernanceRelationship,
  b: GovernanceRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Governance Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a governance registry from workflows, validations, reviews, approvals, and relationships.
 * Pure function. No side effects.
 * Deterministic ordering: workflowId → governanceStage → title.
 */
export function composeGovernanceRegistry(
  workflows: readonly GovernanceWorkflow[],
  validations: readonly ValidationPolicyMetadata[],
  reviews: readonly ReviewRecord[],
  approvals: readonly ApprovalMetadata[],
  relationships: readonly GovernanceRelationship[],
): GovernanceRegistry {
  const sortedWorkflows = [...workflows].sort(_compareGovernanceWorkflow);
  const sortedRelationships = [...relationships].sort(_compareGovernanceRelationship);

  const metadata: GovernanceRegistryMetadata = {
    registryId: `_registry_${sortedWorkflows.length}_${validations.length}_${reviews.length}_${approvals.length}_${sortedRelationships.length}`,
    version: '1.0.0',
    workflowCount: sortedWorkflows.length,
    validationCount: validations.length,
    reviewCount: reviews.length,
    approvalCount: approvals.length,
    relationshipCount: sortedRelationships.length,
  };

  return {
    registryId: metadata.registryId,
    workflows: sortedWorkflows,
    validations,
    reviews,
    approvals,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedWorkflows.length}_${validations.length}_${reviews.length}_${approvals.length}_${sortedRelationships.length}`,
      generatedFrom: 'deterministic_curiosity_governance_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_curiosity_governance_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Governance Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a governance registry from an input.
 * Pure function. No side effects.
 */
export function composeGovernanceRegistryFromInput(
  input: GovernanceInput,
): GovernanceRegistry {
  return composeGovernanceRegistry(input.workflows, input.validations, input.reviews, input.approvals, input.relationships);
}

// ---------------------------------------------------------------------------
// Governance Artifacts Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete governance registry from an input.
 * Pure function. No side effects.
 */
export function composeGovernanceArtifacts(
  input: GovernanceInput,
): GovernanceRegistry {
  const registry = composeGovernanceRegistry(input.workflows, input.validations, input.reviews, input.approvals, input.relationships);

  return {
    ...registry,
    trace: composeCuriosityGovernanceTrace({
      traceId: `_trace_${input.workflows.length}_${input.validations.length}_${input.reviews.length}_${input.approvals.length}_${input.relationships.length}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Governance Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact with governance from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifactWithGovernance(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly workflows: readonly GovernanceWorkflow[];
  readonly validations: readonly ValidationPolicyMetadata[];
  readonly reviews: readonly ReviewRecord[];
  readonly approvals: readonly ApprovalMetadata[];
  readonly relationships: readonly GovernanceRelationship[];
  readonly provenance: CuriosityGovernanceProvenance;
}): CuriosityArtifactWithGovernance {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    workflows: [...params.workflows],
    validations: [...params.validations],
    reviews: [...params.reviews],
    approvals: [...params.approvals],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported governance stage.
 */
export function isSupportedGovernanceStage(
  stage: string,
): stage is GovernanceStage {
  return CANONICAL_GOVERNANCE_STAGES.includes(stage as GovernanceStage);
}

/**
 * Checks if a string is a supported review outcome.
 */
export function isSupportedReviewOutcome(
  outcome: string,
): outcome is ReviewOutcome {
  return CANONICAL_REVIEW_OUTCOMES.includes(outcome as ReviewOutcome);
}

/**
 * Checks if a string is a supported validation policy.
 */
export function isSupportedValidationPolicy(
  policy: string,
): policy is ValidationPolicy {
  return CANONICAL_VALIDATION_POLICIES.includes(policy as ValidationPolicy);
}

/**
 * Checks if a string is a supported approval level.
 */
export function isSupportedApprovalLevel(
  level: string,
): level is ApprovalLevel {
  return CANONICAL_APPROVAL_LEVELS.includes(level as ApprovalLevel);
}

/**
 * Checks if a string is a supported publication state.
 */
export function isSupportedPublicationState(
  state: string,
): state is PublicationState {
  return CANONICAL_PUBLICATION_STATES.includes(state as PublicationState);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedGovernanceStatus(
  status: string,
): status is GovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUS.includes(status as GovernanceStatus);
}

/**
 * Checks if a string is a supported governance governance.
 */
export function isSupportedGovernanceGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical governance stages.
 */
export function getCanonicalGovernanceStages(): readonly GovernanceStage[] {
  return [...CANONICAL_GOVERNANCE_STAGES];
}

/**
 * Returns the canonical review outcomes.
 */
export function getCanonicalReviewOutcomes(): readonly ReviewOutcome[] {
  return [...CANONICAL_REVIEW_OUTCOMES];
}

/**
 * Returns the canonical validation policies.
 */
export function getCanonicalValidationPolicies(): readonly ValidationPolicy[] {
  return [...CANONICAL_VALIDATION_POLICIES];
}

/**
 * Returns the canonical approval levels.
 */
export function getCanonicalApprovalLevels(): readonly ApprovalLevel[] {
  return [...CANONICAL_APPROVAL_LEVELS];
}

/**
 * Returns the canonical publication states.
 */
export function getCanonicalPublicationStates(): readonly PublicationState[] {
  return [...CANONICAL_PUBLICATION_STATES];
}

/**
 * Returns the canonical governance statuses.
 */
export function getCanonicalGovernanceStatuses(): readonly GovernanceStatus[] {
  return [...CANONICAL_GOVERNANCE_STATUS];
}
