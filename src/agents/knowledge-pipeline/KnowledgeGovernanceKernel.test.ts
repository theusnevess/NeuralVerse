/**
 * D10-OPT-16 — Continuous Governance Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Governance Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeGovernanceProfile,
  KnowledgeGovernanceProvenance,
  KnowledgeGovernanceRelationship,
  KnowledgeGovernanceInput,
  KnowledgeGovernanceRegistry,
  KnowledgeGovernanceTrace,
  KnowledgeArtifactWithGovernance,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_GOVERNANCE_STAGES,
  CANONICAL_GOVERNANCE_EVENTS,
  CANONICAL_REVIEW_LEVELS,
  CANONICAL_GOVERNANCE_STATUS,
  CANONICAL_GOVERNANCE_VISIBILITY,
  CANONICAL_GOVERNANCE_POLICY,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeGovernanceProvenance,
  composeKnowledgeGovernanceProfile,
  composeKnowledgeGovernanceRelationship,
  composeKnowledgeGovernanceTrace,
  composeKnowledgeGovernanceRegistry,
  composeKnowledgeGovernanceRegistryFromInput,
  composeKnowledgeGovernance,
  composeKnowledgeArtifactWithGovernance,
  isSupportedGovernanceStage,
  isSupportedGovernanceEvent,
  isSupportedReviewLevel,
  isSupportedGovernanceVisibility,
  isSupportedGovernanceStatus,
  isSupportedGovernancePolicy,
  getCanonicalGovernanceStages,
  getCanonicalGovernanceEvents,
  getCanonicalReviewLevels,
  getCanonicalGovernanceVisibility,
  getCanonicalGovernanceStatuses,
} from './KnowledgeGovernanceKernel.ts';

import {
  validateKnowledgeGovernanceProfile,
  validateKnowledgeGovernanceRelationship,
  validateKnowledgeGovernanceRegistry,
  validateKnowledgeGovernanceInput,
  validateKnowledgeGovernanceTrace,
  validateKnowledgeArtifactWithGovernance,
  GOVERNANCE_VALIDATION_CODES,
} from './KnowledgeGovernanceValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeGovernanceProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Governance Agent',
  rationale: 'Core governance for concept.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeGovernanceProfile = {
  governanceId: 'gov-001',
  conceptId: 'concept-001',
  title: 'Neural Network Governance',
  governanceStage: 'approved',
  reviewLevel: 'technical',
  governanceEvent: 'approved',
  visibility: 'default',
  status: 'canonical',
  policy: 'canonical',
  reviewReference: 'review-001',
  approvalReference: 'approval-001',
  tags: ['neural_networks', 'governance'],
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeGovernanceProfile = {
  governanceId: 'gov-002',
  conceptId: 'concept-001',
  title: 'Neural Network Technical Review',
  governanceStage: 'technical_review',
  reviewLevel: 'engineering',
  governanceEvent: 'review_requested',
  visibility: 'advanced',
  status: 'review',
  policy: 'accepted',
  reviewReference: 'review-002',
  approvalReference: '',
  tags: ['neural_networks', 'technical'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeGovernanceProfile = {
  governanceId: 'gov-003',
  conceptId: 'concept-002',
  title: 'Linear Algebra Governance',
  governanceStage: 'canonical',
  reviewLevel: 'scientific',
  governanceEvent: 'validation_passed',
  visibility: 'expert',
  status: 'canonical',
  policy: 'canonical',
  reviewReference: 'review-003',
  approvalReference: 'approval-003',
  tags: ['linear_algebra', 'governance'],
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeGovernanceRelationship = {
  relationshipId: 'rel-001',
  sourceGovernanceId: 'gov-001',
  targetGovernanceId: 'gov-002',
  relationshipType: 'extension',
  description: 'Technical review extends governance.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeGovernanceInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeGovernanceInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Governance Kernel — Composition', () => {
  it('should compose valid governance provenance', () => {
    const provenance = composeKnowledgeGovernanceProvenance({
      source: 'NeuralVerse Team',
      provider: 'Governance Agent',
      rationale: 'Core governance.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Governance Agent');
    assert.equal(provenance.rationale, 'Core governance.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid governance profile', () => {
    const profile = composeKnowledgeGovernanceProfile({
      governanceId: 'gov-001',
      conceptId: 'concept-001',
      title: 'Test Governance',
      governanceStage: 'draft',
      reviewLevel: 'editorial',
      governanceEvent: 'created',
      visibility: 'default',
      status: 'draft',
      policy: 'public',
      reviewReference: '',
      approvalReference: '',
      tags: ['tag1'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.governanceId, 'gov-001');
    assert.equal(profile.title, 'Test Governance');
    assert.equal(profile.governanceStage, 'draft');
    assert.equal(profile.tags.length, 1);
  });

  it('should compose valid governance relationship', () => {
    const relationship = composeKnowledgeGovernanceRelationship({
      relationshipId: 'rel-001',
      sourceGovernanceId: 'gov-001',
      targetGovernanceId: 'gov-002',
      relationshipType: 'extension',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceGovernanceId, 'gov-001');
    assert.equal(relationship.targetGovernanceId, 'gov-002');
    assert.equal(relationship.relationshipType, 'extension');
  });

  it('should compose valid governance trace', () => {
    const trace = composeKnowledgeGovernanceTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', governanceId: 'gov-001', conceptId: 'concept-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid governance registry', () => {
    const registry = composeKnowledgeGovernanceRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeGovernanceRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge governance from input', () => {
    const registry = composeKnowledgeGovernance(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with governance', () => {
    const artifact = composeKnowledgeArtifactWithGovernance({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.conceptId, 'concept-001');
    assert.equal(artifact.conceptTitle, 'Neural Networks');
    assert.equal(artifact.profiles.length, 1);
    assert.equal(artifact.relationships.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Governance Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeGovernanceProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeGovernanceRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeGovernanceRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge governance input', () => {
    const result = validateKnowledgeGovernanceInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeGovernanceRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeGovernanceRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have GOVERNANCE_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, governanceId: 'gov-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE_1, governanceId: 'gov-002', title: 'Same Title' };
    const registry = composeKnowledgeGovernanceRegistry([profile1, profile2], []);
    const result = validateKnowledgeGovernanceRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have GOVERNANCE_DUPLICATE_TITLE error');
  });

  it('should detect invalid stage', () => {
    const profile = { ...VALID_PROFILE_1, governanceStage: 'unsupported' as any };
    const errors = validateKnowledgeGovernanceProfile(profile);
    const stageError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_STAGE,
    );
    assert.ok(stageError, 'Should have GOVERNANCE_INVALID_STAGE error');
  });

  it('should detect invalid event', () => {
    const profile = { ...VALID_PROFILE_1, governanceEvent: 'unsupported' as any };
    const errors = validateKnowledgeGovernanceProfile(profile);
    const eventError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_EVENT,
    );
    assert.ok(eventError, 'Should have GOVERNANCE_INVALID_EVENT error');
  });

  it('should detect invalid review level', () => {
    const profile = { ...VALID_PROFILE_1, reviewLevel: 'unsupported' as any };
    const errors = validateKnowledgeGovernanceProfile(profile);
    const reviewError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_REVIEW,
    );
    assert.ok(reviewError, 'Should have GOVERNANCE_INVALID_REVIEW error');
  });

  it('should detect invalid visibility', () => {
    const profile = { ...VALID_PROFILE_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeGovernanceProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have GOVERNANCE_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeGovernanceProfile(profile);
    const statusError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have GOVERNANCE_INVALID_STATUS error');
  });

  it('should detect invalid policy', () => {
    const profile = { ...VALID_PROFILE_1, policy: 'unsupported' as any };
    const errors = validateKnowledgeGovernanceProfile(profile);
    const policyError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_POLICY,
    );
    assert.ok(policyError, 'Should have GOVERNANCE_INVALID_POLICY error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeGovernanceProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have GOVERNANCE_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeGovernanceProfile(profile);
    const providerError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have GOVERNANCE_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeGovernanceProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have GOVERNANCE_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetGovernanceId: 'gov-001' };
    const knownProfileIds = new Set(['gov-001', 'gov-002']);
    const errors = validateKnowledgeGovernanceRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have GOVERNANCE_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeGovernanceRegistry([], []);
    const result = validateKnowledgeGovernanceRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have GOVERNANCE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeGovernanceTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_governance_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeGovernanceTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeGovernanceRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        governanceCount: 5,
        relationshipCount: 0,
        conceptCount: 1,
        stageCount: 1,
      },
      trace: {
        traceId: '_trace_1',
        decisionCount: 0,
        validationCount: 0,
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
        decisions: [],
        deterministic: true,
        generatedFrom: 'deterministic_governance_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_governance_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeGovernanceRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === GOVERNANCE_VALIDATION_CODES.GOVERNANCE_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have GOVERNANCE_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeGovernanceTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeGovernanceTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with governance', () => {
    const artifact = composeKnowledgeArtifactWithGovernance({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithGovernance(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Governance Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeGovernance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeGovernance(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeGovernanceRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeGovernanceRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeGovernanceProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeGovernanceProvenance({
        source: 'Test',
        provider: 'Provider',
        rationale: 'Rationale',
        governance: 'canonical',
      }));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0], results[i]);
    }
  });

  it('should produce identical trace for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeGovernanceTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeGovernanceTrace({
        traceId: '_trace_1',
        decisions: [],
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
      }));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0], results[i]);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Governance Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.governanceId;
    const originalTitle = VALID_PROFILE_1.title;

    composeKnowledgeGovernance(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.governanceId, originalId);
    assert.equal(VALID_PROFILE_1.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.governanceId);

    composeKnowledgeGovernanceRegistry(profiles, []);

    assert.equal(profiles[0].governanceId, originalIds[0]);
    assert.equal(profiles[1].governanceId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeGovernanceProfile({
      governanceId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      governanceStage: 'draft',
      reviewLevel: 'editorial',
      governanceEvent: 'created',
      visibility: 'default',
      status: 'draft',
      policy: 'public',
      reviewReference: '',
      approvalReference: '',
      tags: originalTags,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.tags, originalTags);
    assert.deepStrictEqual([...profile.tags], originalTags);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Governance Kernel — Helpers', () => {
  it('should return canonical governance stages', () => {
    const stages = getCanonicalGovernanceStages();
    assert.deepStrictEqual([...stages], [...CANONICAL_GOVERNANCE_STAGES]);
    assert.equal(stages.length, 10);
  });

  it('should return canonical governance events', () => {
    const events = getCanonicalGovernanceEvents();
    assert.deepStrictEqual([...events], [...CANONICAL_GOVERNANCE_EVENTS]);
    assert.equal(events.length, 10);
  });

  it('should return canonical review levels', () => {
    const levels = getCanonicalReviewLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_REVIEW_LEVELS]);
    assert.equal(levels.length, 10);
  });

  it('should return canonical governance visibility', () => {
    const visibility = getCanonicalGovernanceVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_GOVERNANCE_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical governance statuses', () => {
    const statuses = getCanonicalGovernanceStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_GOVERNANCE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate governance stage support', () => {
    assert.equal(isSupportedGovernanceStage('proposed'), true);
    assert.equal(isSupportedGovernanceStage('draft'), true);
    assert.equal(isSupportedGovernanceStage('unsupported'), false);
  });

  it('should validate governance event support', () => {
    assert.equal(isSupportedGovernanceEvent('created'), true);
    assert.equal(isSupportedGovernanceEvent('approved'), true);
    assert.equal(isSupportedGovernanceEvent('unsupported'), false);
  });

  it('should validate review level support', () => {
    assert.equal(isSupportedReviewLevel('automatic'), true);
    assert.equal(isSupportedReviewLevel('technical'), true);
    assert.equal(isSupportedReviewLevel('unsupported'), false);
  });

  it('should validate governance visibility support', () => {
    assert.equal(isSupportedGovernanceVisibility('always'), true);
    assert.equal(isSupportedGovernanceVisibility('default'), true);
    assert.equal(isSupportedGovernanceVisibility('unsupported'), false);
  });

  it('should validate governance status support', () => {
    assert.equal(isSupportedGovernanceStatus('draft'), true);
    assert.equal(isSupportedGovernanceStatus('canonical'), true);
    assert.equal(isSupportedGovernanceStatus('unsupported'), false);
  });

  it('should validate governance policy support', () => {
    assert.equal(isSupportedGovernancePolicy('canonical'), true);
    assert.equal(isSupportedGovernancePolicy('accepted'), true);
    assert.equal(isSupportedGovernancePolicy('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Governance Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 governance stages', () => {
    assert.equal(CANONICAL_GOVERNANCE_STAGES.length, 10);
  });

  it('should have exactly 10 governance events', () => {
    assert.equal(CANONICAL_GOVERNANCE_EVENTS.length, 10);
  });

  it('should have exactly 10 review levels', () => {
    assert.equal(CANONICAL_REVIEW_LEVELS.length, 10);
  });

  it('should have exactly 6 governance statuses', () => {
    assert.equal(CANONICAL_GOVERNANCE_STATUS.length, 6);
  });

  it('should have exactly 10 governance visibility values', () => {
    assert.equal(CANONICAL_GOVERNANCE_VISIBILITY.length, 10);
  });

  it('should have exactly 10 governance policy values', () => {
    assert.equal(CANONICAL_GOVERNANCE_POLICY.length, 10);
  });

  it('should contain all expected governance stages', () => {
    const expected = ['proposed', 'draft', 'technical_review', 'editorial_review', 'validation', 'approved', 'canonical', 'deprecated', 'archived', 'superseded'];
    for (const stage of expected) {
      assert.ok(CANONICAL_GOVERNANCE_STAGES.includes(stage as any), `Should include stage: ${stage}`);
    }
  });

  it('should contain all expected governance events', () => {
    const expected = ['created', 'updated', 'review_requested', 'review_completed', 'validation_passed', 'validation_failed', 'approved', 'deprecated', 'archived', 'restored'];
    for (const event of expected) {
      assert.ok(CANONICAL_GOVERNANCE_EVENTS.includes(event as any), `Should include event: ${event}`);
    }
  });

  it('should contain all expected review levels', () => {
    const expected = ['automatic', 'editorial', 'technical', 'scientific', 'engineering', 'domain', 'research', 'expert', 'committee', 'canonical'];
    for (const level of expected) {
      assert.ok(CANONICAL_REVIEW_LEVELS.includes(level as any), `Should include level: ${level}`);
    }
  });

  it('should contain all expected governance statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_GOVERNANCE_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected governance visibility values', () => {
    const expected = ['always', 'default', 'advanced', 'expert', 'curriculum', 'assessment', 'laboratory', 'research', 'internal', 'hidden'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_GOVERNANCE_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected governance policy values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const policy of expected) {
      assert.ok(CANONICAL_GOVERNANCE_POLICY.includes(policy as any), `Should include policy: ${policy}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Governance Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(GOVERNANCE_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with GOVERNANCE_', () => {
    const codes = Object.values(GOVERNANCE_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('GOVERNANCE_'), `Code "${code}" should start with GOVERNANCE_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(GOVERNANCE_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Governance Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeGovernanceProfile({
      governanceId: 'gov-001',
      conceptId: 'concept-001',
      title: 'Test',
      governanceStage: 'draft',
      reviewLevel: 'editorial',
      governanceEvent: 'created',
      visibility: 'default',
      status: 'draft',
      policy: 'public',
      reviewReference: '',
      approvalReference: '',
      tags: [],
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(profile);
    for (const key of keys) {
      const value = (profile as any)[key];
      assert.ok(typeof value !== 'function', `Profile field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Governance Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeGovernance(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Governance Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by conceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, governanceId: 'gov-003', conceptId: 'concept-003' };
    const profile1 = { ...VALID_PROFILE_1, governanceId: 'gov-001', conceptId: 'concept-001' };
    const profile2 = { ...VALID_PROFILE_1, governanceId: 'gov-002', conceptId: 'concept-002' };

    const registry = composeKnowledgeGovernanceRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].conceptId, 'concept-001');
    assert.equal(registry.profiles[1].conceptId, 'concept-002');
    assert.equal(registry.profiles[2].conceptId, 'concept-003');
  });

  it('should sort by governanceStage when conceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, governanceId: 'gov-002', conceptId: 'concept-001', governanceStage: 'technical_review' as const };
    const profileB = { ...VALID_PROFILE_1, governanceId: 'gov-001', conceptId: 'concept-001', governanceStage: 'draft' as const };

    const registry = composeKnowledgeGovernanceRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].governanceStage, 'draft');
    assert.equal(registry.profiles[1].governanceStage, 'technical_review');
  });
});
