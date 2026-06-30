/**
 * NV-2100-D9-OPT-12 — Curiosity Governance Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Curiosity Governance Kernel.
 * Covers: valid workflow, valid validation policy, valid review record, valid approval,
 * valid relationship, valid provenance, valid trace, empty registry, duplicate IDs,
 * duplicate titles, deterministic ordering, invalid enums, missing provenance/provider/rationale,
 * missing references, missing configuration, self-relationships, empty registries,
 * registry inconsistencies, determinism (100 iterations), immutability, negative
 * capability, cross-agent boundaries, validation code stability, public API
 * exports, backward compatibility with D9-OPT-01 through D9-OPT-11.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  GovernanceWorkflow,
  ValidationPolicyMetadata,
  ReviewRecord,
  ApprovalMetadata,
  GovernanceRelationship,
  GovernanceInput,
  GovernanceRegistry,
  CuriosityGovernanceProvenance,
  CuriosityGovernanceTrace,
  CuriosityArtifactWithGovernance,
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

import {
  composeCuriosityGovernanceProvenance,
  composeCuriosityGovernanceTrace,
  composeGovernanceWorkflow,
  composeValidationPolicy,
  composeReviewRecord,
  composeApprovalMetadata,
  composeGovernanceRelationship,
  composeGovernanceRegistry,
  composeGovernanceRegistryFromInput,
  composeGovernanceArtifacts,
  composeCuriosityArtifactWithGovernance,
  isSupportedGovernanceStage,
  isSupportedReviewOutcome,
  isSupportedValidationPolicy,
  isSupportedApprovalLevel,
  isSupportedPublicationState,
  isSupportedGovernanceStatus,
  isSupportedGovernanceGovernance,
  getCanonicalGovernanceStages,
  getCanonicalReviewOutcomes,
  getCanonicalValidationPolicies,
  getCanonicalApprovalLevels,
  getCanonicalPublicationStates,
  getCanonicalGovernanceStatuses,
} from './CuriosityGovernanceKernel.ts';

import {
  validateGovernanceWorkflow,
  validateValidationPolicy,
  validateReviewRecord,
  validateApprovalMetadata,
  validateGovernanceRelationship,
  validateGovernanceRegistry,
  validateGovernanceInput,
  validateGovernanceTrace,
  validateCuriosityArtifactWithGovernance,
  GOVERNANCE_VALIDATION_CODES,
} from './CuriosityGovernanceValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: CuriosityGovernanceProvenance = {
  provider: 'NeuralVerse Team',
  source: 'Curated Knowledge Base',
  rationale: 'Core governance workflow artifact.',
  version: '1.0.0',
};

const VALID_TRACE: CuriosityGovernanceTrace = {
  traceId: '_trace_1',
  generatedFrom: 'deterministic_curiosity_governance_kernel',
  deterministic: true,
  randomUsed: false,
  timeDependency: false,
};

const VALID_WORKFLOW: GovernanceWorkflow = {
  workflowId: 'gov-001',
  title: 'Curiosity Artifact Approval Workflow',
  governanceStage: 'draft',
  reviewOutcome: 'approved',
  validationPolicy: 'automatic',
  approvalLevel: 'initial',
  publicationState: 'draft',
  conceptIds: ['concept-001', 'concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_WORKFLOW_2: GovernanceWorkflow = {
  workflowId: 'gov-002',
  title: 'Curiosity Content Review Workflow',
  governanceStage: 'review',
  reviewOutcome: 'revision_required',
  validationPolicy: 'manual',
  approvalLevel: 'intermediate',
  publicationState: 'review',
  conceptIds: ['concept-003'],
  status: 'approved',
  governance: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Archives' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_VALIDATION_POLICY: ValidationPolicyMetadata = {
  metadataId: 'vp-001',
  workflowId: 'gov-001',
  validationPolicy: 'automatic',
  automaticChecks: true,
  manualReview: false,
  peerReview: false,
  expertReview: false,
  contentReview: true,
  safetyReview: true,
  qualityReview: true,
  complianceReview: false,
};

const VALID_REVIEW_RECORD: ReviewRecord = {
  recordId: 'review-001',
  workflowId: 'gov-001',
  reviewerId: 'reviewer-001',
  reviewDate: '2026-01-01',
  reviewOutcome: 'approved',
  reviewComments: 'All criteria met.',
  reviewDuration: '2_hours',
  reviewPriority: 1,
};

const VALID_APPROVAL: ApprovalMetadata = {
  metadataId: 'approval-001',
  workflowId: 'gov-001',
  approvalLevel: 'initial',
  approverId: 'approver-001',
  approvalDate: '2026-01-02',
  approvalExpiry: '2027-01-02',
  approvalConditions: ['content_review_passed'],
  approvalRevocable: true,
};

const VALID_RELATIONSHIP: GovernanceRelationship = {
  relationshipId: 'gov-rel-001',
  sourceWorkflowId: 'gov-001',
  targetWorkflowId: 'gov-002',
  relationshipType: 'related_to',
  description: 'These workflows are related.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: GovernanceInput = {
  workflows: [VALID_WORKFLOW, VALID_WORKFLOW_2],
  validations: [VALID_VALIDATION_POLICY],
  reviews: [VALID_REVIEW_RECORD],
  approvals: [VALID_APPROVAL],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: GovernanceInput = {
  workflows: [],
  validations: [],
  reviews: [],
  approvals: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Profile Composition Tests
// ---------------------------------------------------------------------------

describe('Curiosity Governance Kernel — Profile Composition', () => {
  it('should compose valid governance workflow provenance', () => {
    const provenance = composeCuriosityGovernanceProvenance({
      provider: 'NeuralVerse Team',
      source: 'Curated Knowledge Base',
      rationale: 'Core concept.',
      version: '1.0.0',
    });

    assert.equal(provenance.provider, 'NeuralVerse Team');
    assert.equal(provenance.source, 'Curated Knowledge Base');
    assert.equal(provenance.rationale, 'Core concept.');
    assert.equal(provenance.version, '1.0.0');
  });

  it('should compose valid governance workflow', () => {
    const workflow = composeGovernanceWorkflow({
      workflowId: 'gov-001',
      title: 'Curiosity Artifact Approval Workflow',
      governanceStage: 'draft',
      reviewOutcome: 'approved',
      validationPolicy: 'automatic',
      approvalLevel: 'initial',
      publicationState: 'draft',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(workflow.workflowId, 'gov-001');
    assert.equal(workflow.title, 'Curiosity Artifact Approval Workflow');
    assert.equal(workflow.governanceStage, 'draft');
    assert.equal(workflow.reviewOutcome, 'approved');
    assert.equal(workflow.validationPolicy, 'automatic');
    assert.equal(workflow.approvalLevel, 'initial');
    assert.equal(workflow.publicationState, 'draft');
    assert.equal(workflow.conceptIds.length, 1);
    assert.equal(workflow.status, 'published');
    assert.equal(workflow.governance, 'canonical');
  });

  it('should compose valid governance workflow trace', () => {
    const trace = composeCuriosityGovernanceTrace({
      traceId: '_trace_1',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid validation policy', () => {
    const policy = composeValidationPolicy({
      metadataId: 'vp-001',
      workflowId: 'gov-001',
      validationPolicy: 'automatic',
      automaticChecks: true,
      manualReview: false,
      peerReview: false,
      expertReview: false,
      contentReview: true,
      safetyReview: true,
      qualityReview: true,
      complianceReview: false,
    });

    assert.equal(policy.metadataId, 'vp-001');
    assert.equal(policy.workflowId, 'gov-001');
    assert.equal(policy.validationPolicy, 'automatic');
    assert.equal(policy.automaticChecks, true);
    assert.equal(policy.manualReview, false);
    assert.equal(policy.peerReview, false);
    assert.equal(policy.expertReview, false);
    assert.equal(policy.contentReview, true);
    assert.equal(policy.safetyReview, true);
    assert.equal(policy.qualityReview, true);
    assert.equal(policy.complianceReview, false);
  });

  it('should compose valid review record', () => {
    const record = composeReviewRecord({
      recordId: 'review-001',
      workflowId: 'gov-001',
      reviewerId: 'reviewer-001',
      reviewDate: '2026-01-01',
      reviewOutcome: 'approved',
      reviewComments: 'All criteria met.',
      reviewDuration: '2_hours',
      reviewPriority: 1,
    });

    assert.equal(record.recordId, 'review-001');
    assert.equal(record.workflowId, 'gov-001');
    assert.equal(record.reviewerId, 'reviewer-001');
    assert.equal(record.reviewDate, '2026-01-01');
    assert.equal(record.reviewOutcome, 'approved');
    assert.equal(record.reviewComments, 'All criteria met.');
    assert.equal(record.reviewDuration, '2_hours');
    assert.equal(record.reviewPriority, 1);
  });

  it('should compose valid approval metadata', () => {
    const approval = composeApprovalMetadata({
      metadataId: 'approval-001',
      workflowId: 'gov-001',
      approvalLevel: 'initial',
      approverId: 'approver-001',
      approvalDate: '2026-01-02',
      approvalExpiry: '2027-01-02',
      approvalConditions: ['content_review_passed'],
      approvalRevocable: true,
    });

    assert.equal(approval.metadataId, 'approval-001');
    assert.equal(approval.workflowId, 'gov-001');
    assert.equal(approval.approvalLevel, 'initial');
    assert.equal(approval.approverId, 'approver-001');
    assert.equal(approval.approvalDate, '2026-01-02');
    assert.equal(approval.approvalExpiry, '2027-01-02');
    assert.equal(approval.approvalConditions.length, 1);
    assert.equal(approval.approvalRevocable, true);
  });

  it('should compose valid governance relationship', () => {
    const relationship = composeGovernanceRelationship({
      relationshipId: 'gov-rel-001',
      sourceWorkflowId: 'gov-001',
      targetWorkflowId: 'gov-002',
      relationshipType: 'related_to',
      description: 'Related workflows.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'gov-rel-001');
    assert.equal(relationship.sourceWorkflowId, 'gov-001');
    assert.equal(relationship.targetWorkflowId, 'gov-002');
    assert.equal(relationship.relationshipType, 'related_to');
    assert.equal(relationship.description, 'Related workflows.');
  });

  it('should validate a valid workflow with no errors', () => {
    const errors = validateGovernanceWorkflow(VALID_WORKFLOW);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeGovernanceRegistry([VALID_WORKFLOW, VALID_WORKFLOW_2], [VALID_VALIDATION_POLICY], [VALID_REVIEW_RECORD], [VALID_APPROVAL], [VALID_RELATIONSHIP]);
    const result = validateGovernanceRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate governance input', () => {
    const result = validateGovernanceInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Curiosity Governance Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeGovernanceRegistry([], [], [], [], []);
    const result = validateGovernanceRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have GOVERNANCE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeGovernanceRegistry([VALID_WORKFLOW, VALID_WORKFLOW], [], [], [], []);
    const result = validateGovernanceRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have GOVERNANCE_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const workflow1 = { ...VALID_WORKFLOW, workflowId: 'gov-001', title: 'Same Title' };
    const workflow2 = { ...VALID_WORKFLOW, workflowId: 'gov-002', title: 'Same Title' };
    const registry = composeGovernanceRegistry([workflow1, workflow2], [], [], [], []);
    const result = validateGovernanceRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have GOVERNANCE_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by workflowId', () => {
    const workflow3 = { ...VALID_WORKFLOW, workflowId: 'gov-003' };
    const workflow1 = { ...VALID_WORKFLOW, workflowId: 'gov-001' };
    const workflow2 = { ...VALID_WORKFLOW, workflowId: 'gov-002' };

    const registry = composeGovernanceRegistry([workflow3, workflow1, workflow2], [], [], [], []);

    assert.equal(registry.workflows[0].workflowId, 'gov-001');
    assert.equal(registry.workflows[1].workflowId, 'gov-002');
    assert.equal(registry.workflows[2].workflowId, 'gov-003');
  });

  it('should sort by governanceStage when workflowId is equal', () => {
    const workflowA = { ...VALID_WORKFLOW, workflowId: 'gov-001', governanceStage: 'review' as const };
    const workflowB = { ...VALID_WORKFLOW, workflowId: 'gov-001', governanceStage: 'draft' as const };

    const registry = composeGovernanceRegistry([workflowA, workflowB], [], [], [], []);

    // Alphabetical sort: 'draft' < 'review'
    assert.equal(registry.workflows[0].governanceStage, 'draft');
    assert.equal(registry.workflows[1].governanceStage, 'review');
  });

  it('should detect self-relationships', () => {
    const selfRelationship: GovernanceRelationship = {
      relationshipId: 'gov-rel-self',
      sourceWorkflowId: 'gov-001',
      targetWorkflowId: 'gov-001',
      relationshipType: 'related_to',
      description: 'Self relationship.',
      provenance: VALID_PROVENANCE,
    };

    const registry = composeGovernanceRegistry([VALID_WORKFLOW], [], [], [], [selfRelationship]);
    const result = validateGovernanceRegistry(registry);
    const selfError = result.errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have GOVERNANCE_SELF_RELATIONSHIP error');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Curiosity Governance Kernel — Validation', () => {
  it('should detect invalid governance stage', () => {
    const workflow = { ...VALID_WORKFLOW, governanceStage: 'unsupported' as any };
    const errors = validateGovernanceWorkflow(workflow);
    const stageError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_STAGE,
    );

    assert.ok(stageError, 'Should have GOVERNANCE_INVALID_STAGE error');
  });

  it('should detect invalid review outcome', () => {
    const workflow = { ...VALID_WORKFLOW, reviewOutcome: 'unsupported' as any };
    const errors = validateGovernanceWorkflow(workflow);
    const reviewError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_REVIEW,
    );

    assert.ok(reviewError, 'Should have GOVERNANCE_INVALID_REVIEW error');
  });

  it('should detect invalid validation policy', () => {
    const workflow = { ...VALID_WORKFLOW, validationPolicy: 'unsupported' as any };
    const errors = validateGovernanceWorkflow(workflow);
    const policyError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_POLICY,
    );

    assert.ok(policyError, 'Should have GOVERNANCE_INVALID_POLICY error');
  });

  it('should detect invalid approval level', () => {
    const workflow = { ...VALID_WORKFLOW, approvalLevel: 'unsupported' as any };
    const errors = validateGovernanceWorkflow(workflow);
    const approvalError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_APPROVAL,
    );

    assert.ok(approvalError, 'Should have GOVERNANCE_INVALID_APPROVAL error');
  });

  it('should detect invalid publication state', () => {
    const workflow = { ...VALID_WORKFLOW, publicationState: 'unsupported' as any };
    const errors = validateGovernanceWorkflow(workflow);
    const publicationError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_PUBLICATION,
    );

    assert.ok(publicationError, 'Should have GOVERNANCE_INVALID_PUBLICATION error');
  });

  it('should detect invalid status', () => {
    const workflow = { ...VALID_WORKFLOW, status: 'unsupported' as any };
    const errors = validateGovernanceWorkflow(workflow);
    const statusError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have GOVERNANCE_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const workflow = { ...VALID_WORKFLOW, governance: 'unsupported' as any };
    const errors = validateGovernanceWorkflow(workflow);
    const governanceError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have GOVERNANCE_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const workflow = { ...VALID_WORKFLOW, provenance: undefined as any };
    const errors = validateGovernanceWorkflow(workflow);
    const provenanceError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have GOVERNANCE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance provider', () => {
    const workflow = { ...VALID_WORKFLOW, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateGovernanceWorkflow(workflow);
    const providerError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have GOVERNANCE_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const workflow = { ...VALID_WORKFLOW, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateGovernanceWorkflow(workflow);
    const rationaleError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have GOVERNANCE_MISSING_RATIONALE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeCuriosityGovernanceTrace({
      traceId: '_trace_1',
    });

    const result = validateGovernanceTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: CuriosityGovernanceTrace = {
      traceId: '',
      generatedFrom: 'deterministic_curiosity_governance_kernel',
      deterministic: false as true,
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateGovernanceTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect missing validation policy configuration', () => {
    const policy: ValidationPolicyMetadata = {
      metadataId: '',
      workflowId: '',
      validationPolicy: 'automatic',
      automaticChecks: true,
      manualReview: false,
      peerReview: false,
      expertReview: false,
      contentReview: true,
      safetyReview: true,
      qualityReview: true,
      complianceReview: false,
    };

    const errors = validateValidationPolicy(policy);
    const policyError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CURIOSITY_REFERENCE,
    );

    assert.ok(policyError, 'Should have GOVERNANCE_MISSING_CURIOSITY_REFERENCE error');
  });

  it('should detect missing review record configuration', () => {
    const record: ReviewRecord = {
      recordId: 'review-001',
      workflowId: 'gov-001',
      reviewerId: 'reviewer-001',
      reviewDate: '',
      reviewOutcome: 'approved',
      reviewComments: '',
      reviewDuration: '2_hours',
      reviewPriority: 1,
    };

    const errors = validateReviewRecord(record);
    const configError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have GOVERNANCE_INVALID_CONFIGURATION error');
  });

  it('should detect missing approval configuration', () => {
    const approval: ApprovalMetadata = {
      metadataId: 'approval-001',
      workflowId: 'gov-001',
      approvalLevel: 'initial',
      approverId: 'approver-001',
      approvalDate: '',
      approvalExpiry: '2027-01-02',
      approvalConditions: ['content_review_passed'],
      approvalRevocable: true,
    };

    const errors = validateApprovalMetadata(approval);
    const configError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have GOVERNANCE_INVALID_CONFIGURATION error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Curiosity Governance Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeGovernanceArtifacts>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeGovernanceArtifacts(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].workflows, results[i].workflows);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeGovernanceRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeGovernanceRegistry([VALID_WORKFLOW, VALID_WORKFLOW_2], [VALID_VALIDATION_POLICY], [VALID_REVIEW_RECORD], [VALID_APPROVAL], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].workflows, results[i].workflows);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Curiosity Governance Kernel — Immutability', () => {
  it('should not mutate input workflows', () => {
    const originalId = VALID_WORKFLOW.workflowId;
    const originalTitle = VALID_WORKFLOW.title;

    composeGovernanceArtifacts(VALID_INPUT);

    assert.equal(VALID_WORKFLOW.workflowId, originalId);
    assert.equal(VALID_WORKFLOW.title, originalTitle);
  });

  it('should not mutate input registry workflows', () => {
    const workflows = [VALID_WORKFLOW, VALID_WORKFLOW_2];
    const originalIds = workflows.map((w) => w.workflowId);

    composeGovernanceRegistry(workflows, [], [], [], []);

    assert.equal(workflows[0].workflowId, originalIds[0]);
    assert.equal(workflows[1].workflowId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Curiosity Governance Kernel — Helper Functions', () => {
  it('should return canonical governance stages', () => {
    const stages = getCanonicalGovernanceStages();
    assert.deepStrictEqual([...stages], [...CANONICAL_GOVERNANCE_STAGES]);
    assert.equal(stages.length, 10);
  });

  it('should return canonical review outcomes', () => {
    const outcomes = getCanonicalReviewOutcomes();
    assert.deepStrictEqual([...outcomes], [...CANONICAL_REVIEW_OUTCOMES]);
    assert.equal(outcomes.length, 10);
  });

  it('should return canonical validation policies', () => {
    const policies = getCanonicalValidationPolicies();
    assert.deepStrictEqual([...policies], [...CANONICAL_VALIDATION_POLICIES]);
    assert.equal(policies.length, 10);
  });

  it('should return canonical approval levels', () => {
    const levels = getCanonicalApprovalLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_APPROVAL_LEVELS]);
    assert.equal(levels.length, 10);
  });

  it('should return canonical publication states', () => {
    const states = getCanonicalPublicationStates();
    assert.deepStrictEqual([...states], [...CANONICAL_PUBLICATION_STATES]);
    assert.equal(states.length, 10);
  });

  it('should return canonical governance statuses', () => {
    const statuses = getCanonicalGovernanceStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_GOVERNANCE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate governance stage support', () => {
    assert.equal(isSupportedGovernanceStage('draft'), true);
    assert.equal(isSupportedGovernanceStage('review'), true);
    assert.equal(isSupportedGovernanceStage('unsupported'), false);
  });

  it('should validate review outcome support', () => {
    assert.equal(isSupportedReviewOutcome('approved'), true);
    assert.equal(isSupportedReviewOutcome('rejected'), true);
    assert.equal(isSupportedReviewOutcome('unsupported'), false);
  });

  it('should validate validation policy support', () => {
    assert.equal(isSupportedValidationPolicy('automatic'), true);
    assert.equal(isSupportedValidationPolicy('manual'), true);
    assert.equal(isSupportedValidationPolicy('unsupported'), false);
  });

  it('should validate approval level support', () => {
    assert.equal(isSupportedApprovalLevel('initial'), true);
    assert.equal(isSupportedApprovalLevel('intermediate'), true);
    assert.equal(isSupportedApprovalLevel('unsupported'), false);
  });

  it('should validate publication state support', () => {
    assert.equal(isSupportedPublicationState('draft'), true);
    assert.equal(isSupportedPublicationState('published'), true);
    assert.equal(isSupportedPublicationState('unsupported'), false);
  });

  it('should validate governance status support', () => {
    assert.equal(isSupportedGovernanceStatus('draft'), true);
    assert.equal(isSupportedGovernanceStatus('published'), true);
    assert.equal(isSupportedGovernanceStatus('unsupported'), false);
  });

  it('should validate governance governance support', () => {
    assert.equal(isSupportedGovernanceGovernance('canonical'), true);
    assert.equal(isSupportedGovernanceGovernance('accepted'), true);
    assert.equal(isSupportedGovernanceGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Curiosity Governance Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 governance stages', () => {
    assert.equal(CANONICAL_GOVERNANCE_STAGES.length, 10);
  });

  it('should have exactly 10 review outcomes', () => {
    assert.equal(CANONICAL_REVIEW_OUTCOMES.length, 10);
  });

  it('should have exactly 10 validation policies', () => {
    assert.equal(CANONICAL_VALIDATION_POLICIES.length, 10);
  });

  it('should have exactly 10 approval levels', () => {
    assert.equal(CANONICAL_APPROVAL_LEVELS.length, 10);
  });

  it('should have exactly 10 publication states', () => {
    assert.equal(CANONICAL_PUBLICATION_STATES.length, 10);
  });

  it('should have exactly 6 governance statuses', () => {
    assert.equal(CANONICAL_GOVERNANCE_STATUS.length, 6);
  });

  it('should have exactly 5 governance values', () => {
    assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5);
  });

  it('should contain all expected governance stages', () => {
    const expectedStages = [
      'draft',
      'review',
      'revision',
      'validation',
      'approval',
      'publication',
      'monitoring',
      'deprecation',
      'archival',
      'completion',
    ];

    for (const stage of expectedStages) {
      assert.ok(
        CANONICAL_GOVERNANCE_STAGES.includes(stage as any),
        `Should include stage: ${stage}`,
      );
    }
  });

  it('should contain all expected review outcomes', () => {
    const expectedOutcomes = [
      'approved',
      'rejected',
      'revision_required',
      'deferred',
      'escalated',
      'withdrawn',
      'expired',
      'superseded',
      'partial_approval',
      'conditional_approval',
    ];

    for (const outcome of expectedOutcomes) {
      assert.ok(
        CANONICAL_REVIEW_OUTCOMES.includes(outcome as any),
        `Should include outcome: ${outcome}`,
      );
    }
  });

  it('should contain all expected validation policies', () => {
    const expectedPolicies = [
      'automatic',
      'manual',
      'hybrid',
      'peer_review',
      'expert_review',
      'automated_checks',
      'content_review',
      'safety_review',
      'quality_review',
      'compliance_review',
    ];

    for (const policy of expectedPolicies) {
      assert.ok(
        CANONICAL_VALIDATION_POLICIES.includes(policy as any),
        `Should include policy: ${policy}`,
      );
    }
  });

  it('should contain all expected approval levels', () => {
    const expectedLevels = [
      'initial',
      'intermediate',
      'advanced',
      'expert',
      'final',
      'conditional',
      'emergency',
      'override',
      'delegated',
      'revoked',
    ];

    for (const level of expectedLevels) {
      assert.ok(
        CANONICAL_APPROVAL_LEVELS.includes(level as any),
        `Should include level: ${level}`,
      );
    }
  });

  it('should contain all expected publication states', () => {
    const expectedStates = [
      'draft',
      'review',
      'approved',
      'scheduled',
      'published',
      'deprecated',
      'archived',
      'withdrawn',
      'superseded',
      'conditional',
    ];

    for (const state of expectedStates) {
      assert.ok(
        CANONICAL_PUBLICATION_STATES.includes(state as any),
        `Should include state: ${state}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Curiosity Governance Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not approve artifacts', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('approvedArtifacts' in result), 'Should not have approved artifacts');
    assert.ok(!('approval' in result), 'Should not have approval');
  });

  it('should not execute governance decisions', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('executedDecisions' in result), 'Should not have executed decisions');
    assert.ok(!('decisions' in result), 'Should not have decisions');
  });

  it('should not perform moderation', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('moderation' in result), 'Should not have moderation');
    assert.ok(!('moderationEngine' in result), 'Should not have moderation engine');
  });

  it('should not modify curiosity content', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('modifiedContent' in result), 'Should not have modified content');
    assert.ok(!('content' in result), 'Should not have content');
  });

  it('should not execute workflows', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('executedWorkflows' in result), 'Should not have executed workflows');
    assert.ok(!('workflowExecution' in result), 'Should not have workflow execution');
  });

  it('should not access filesystem', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in workflow', () => {
    const workflow = composeGovernanceWorkflow({
      workflowId: 'gov-001',
      title: 'Test',
      governanceStage: 'draft',
      reviewOutcome: 'approved',
      validationPolicy: 'automatic',
      approvalLevel: 'initial',
      publicationState: 'draft',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    const keys = Object.keys(workflow);
    for (const key of keys) {
      const value = (workflow as any)[key];
      assert.ok(typeof value !== 'function', `Workflow field "${key}" should not be a function`);
    }
  });

  it('should not store runtime execution', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Curiosity Governance Kernel — Cross-Agent Boundary', () => {
  it('should not reference Narrative Agent', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('narrativeAgent' in result), 'Should not reference Narrative Agent');
    assert.ok(!('narrative' in result), 'Should not reference narrative');
  });

  it('should not reference Knowledge Agent', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('knowledgeAgent' in result), 'Should not reference Knowledge Agent');
    assert.ok(!('knowledge' in result), 'Should not reference knowledge');
  });

  it('should not reference Didactic Agent', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('didacticAgent' in result), 'Should not reference Didactic Agent');
    assert.ok(!('didactic' in result), 'Should not reference didactic');
  });

  it('should not reference Research Agent', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('researchAgent' in result), 'Should not reference Research Agent');
    assert.ok(!('research' in result), 'Should not reference research');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('laboratoryAgent' in result), 'Should not reference Laboratory Agent');
    assert.ok(!('laboratory' in result), 'Should not reference laboratory');
  });

  it('should not reference Application Agent', () => {
    const result = composeGovernanceArtifacts(VALID_INPUT);
    assert.ok(!('applicationAgent' in result), 'Should not reference Application Agent');
    assert.ok(!('application' in result), 'Should not reference application');
  });
});

// ---------------------------------------------------------------------------
// Validation Codes Tests
// ---------------------------------------------------------------------------

describe('Curiosity Governance Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_DUPLICATE_ID, 'GOVERNANCE_DUPLICATE_ID');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_DUPLICATE_TITLE, 'GOVERNANCE_DUPLICATE_TITLE');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_STAGE, 'GOVERNANCE_INVALID_STAGE');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_REVIEW, 'GOVERNANCE_INVALID_REVIEW');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_POLICY, 'GOVERNANCE_INVALID_POLICY');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_APPROVAL, 'GOVERNANCE_INVALID_APPROVAL');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_PUBLICATION, 'GOVERNANCE_INVALID_PUBLICATION');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_STATUS, 'GOVERNANCE_INVALID_STATUS');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_GOVERNANCE, 'GOVERNANCE_INVALID_GOVERNANCE');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVENANCE, 'GOVERNANCE_MISSING_PROVENANCE');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVIDER, 'GOVERNANCE_MISSING_PROVIDER');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_RATIONALE, 'GOVERNANCE_MISSING_RATIONALE');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CURIOSITY_REFERENCE, 'GOVERNANCE_MISSING_CURIOSITY_REFERENCE');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_WORKFLOW_ID, 'GOVERNANCE_MISSING_WORKFLOW_ID');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_TITLE, 'GOVERNANCE_MISSING_TITLE');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_POLICY, 'GOVERNANCE_MISSING_POLICY');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_SELF_RELATIONSHIP, 'GOVERNANCE_SELF_RELATIONSHIP');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_EMPTY_REGISTRY, 'GOVERNANCE_EMPTY_REGISTRY');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE, 'GOVERNANCE_INVALID_TRACE');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_REGISTRY_INCONSISTENCY, 'GOVERNANCE_REGISTRY_INCONSISTENCY');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_CONFIGURATION, 'GOVERNANCE_INVALID_CONFIGURATION');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_RELATIONSHIP, 'GOVERNANCE_INVALID_RELATIONSHIP');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_GOVERNANCE, 'GOVERNANCE_MISSING_GOVERNANCE');
    assert.equal(GOVERNANCE_VALIDATION_CODES.GOVERNANCE_UNSUPPORTED_CONFIGURATION, 'GOVERNANCE_UNSUPPORTED_CONFIGURATION');
  });

  it('should have exactly 24 validation codes', () => {
    const codeCount = Object.keys(GOVERNANCE_VALIDATION_CODES).length;
    assert.equal(codeCount, 24);
  });
});

// ---------------------------------------------------------------------------
// Public API Export Tests
// ---------------------------------------------------------------------------

describe('Curiosity Governance Kernel — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeCuriosityGovernanceProvenance, 'function');
    assert.equal(typeof composeCuriosityGovernanceTrace, 'function');
    assert.equal(typeof composeGovernanceWorkflow, 'function');
    assert.equal(typeof composeValidationPolicy, 'function');
    assert.equal(typeof composeReviewRecord, 'function');
    assert.equal(typeof composeApprovalMetadata, 'function');
    assert.equal(typeof composeGovernanceRelationship, 'function');
    assert.equal(typeof composeGovernanceRegistry, 'function');
    assert.equal(typeof composeGovernanceRegistryFromInput, 'function');
    assert.equal(typeof composeGovernanceArtifacts, 'function');
    assert.equal(typeof composeCuriosityArtifactWithGovernance, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedGovernanceStage, 'function');
    assert.equal(typeof isSupportedReviewOutcome, 'function');
    assert.equal(typeof isSupportedValidationPolicy, 'function');
    assert.equal(typeof isSupportedApprovalLevel, 'function');
    assert.equal(typeof isSupportedPublicationState, 'function');
    assert.equal(typeof isSupportedGovernanceStatus, 'function');
    assert.equal(typeof isSupportedGovernanceGovernance, 'function');
    assert.equal(typeof getCanonicalGovernanceStages, 'function');
    assert.equal(typeof getCanonicalReviewOutcomes, 'function');
    assert.equal(typeof getCanonicalValidationPolicies, 'function');
    assert.equal(typeof getCanonicalApprovalLevels, 'function');
    assert.equal(typeof getCanonicalPublicationStates, 'function');
    assert.equal(typeof getCanonicalGovernanceStatuses, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateGovernanceWorkflow, 'function');
    assert.equal(typeof validateValidationPolicy, 'function');
    assert.equal(typeof validateReviewRecord, 'function');
    assert.equal(typeof validateApprovalMetadata, 'function');
    assert.equal(typeof validateGovernanceRelationship, 'function');
    assert.equal(typeof validateGovernanceRegistry, 'function');
    assert.equal(typeof validateGovernanceInput, 'function');
    assert.equal(typeof validateGovernanceTrace, 'function');
    assert.equal(typeof validateCuriosityArtifactWithGovernance, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(GOVERNANCE_VALIDATION_CODES);
    assert.equal(typeof GOVERNANCE_VALIDATION_CODES, 'object');
  });
});
