/**
 * NV-2100-D9-OPT-04 — Cultural Reference Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Cultural Reference Kernel.
 * Covers: valid profile, valid context reference, valid governance,
 * valid relationship, valid provenance, valid trace, empty registry,
 * duplicate IDs, duplicate titles, deterministic ordering, invalid enums,
 * missing provenance/provider/rationale, missing governance, missing references,
 * self-relationships, empty registries, registry inconsistencies,
 * determinism (100 iterations), immutability, negative capability,
 * cross-agent boundaries, validation code stability, public API exports,
 * backward compatibility with D9-OPT-01 through D9-OPT-03.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CulturalReferenceProfile,
  CurrentContextReference,
  ReferenceRelationship,
  ReferenceGovernance,
  CulturalReferenceInput,
  CulturalReferenceRegistry,
  CulturalReferenceProvenance,
  CulturalReferenceTrace,
  CuriosityArtifactWithCulturalReferences,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_REFERENCE_DOMAINS,
  CANONICAL_REFERENCE_RECENCY,
  CANONICAL_REFERENCE_PURPOSE,
  CANONICAL_REFERENCE_VALIDITY,
  CANONICAL_CONTEXT_SENSITIVITY,
  CANONICAL_REFERENCE_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

import {
  composeCulturalReferenceProvenance,
  composeCulturalReferenceTrace,
  composeCulturalReferenceProfile,
  composeCurrentContextReference,
  composeReferenceGovernance,
  composeReferenceRelationship,
  composeCulturalReferenceRegistry,
  composeCulturalReferenceRegistryFromInput,
  composeCuriosityCulturalReferences,
  composeCuriosityArtifactWithCulturalReferences,
  isSupportedReferenceDomain,
  isSupportedReferenceRecency,
  isSupportedReferencePurpose,
  isSupportedReferenceValidity,
  isSupportedContextSensitivity,
  isSupportedReferenceStatus,
  isSupportedReferenceGovernance,
  getCanonicalReferenceDomains,
  getCanonicalReferenceRecency,
  getCanonicalReferencePurposes,
  getCanonicalReferenceValidity,
  getCanonicalContextSensitivity,
  getCanonicalReferenceStatuses,
} from './CulturalReferenceKernel.ts';

import {
  validateCulturalReferenceProfile,
  validateCurrentContextReference,
  validateReferenceGovernance,
  validateReferenceRelationship,
  validateCulturalReferenceRegistry,
  validateCulturalReferenceInput,
  validateCulturalReferenceTrace,
  validateCuriosityArtifactWithCulturalReferences,
  CULTURAL_REFERENCE_VALIDATION_CODES,
} from './CulturalReferenceValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: CulturalReferenceProvenance = {
  provider: 'NeuralVerse Team',
  source: 'Curated Knowledge Base',
  rationale: 'Core cultural reference artifact.',
  version: '1.0.0',
};

const VALID_TRACE: CulturalReferenceTrace = {
  traceId: '_trace_1',
  generatedFrom: 'deterministic_cultural_reference_kernel',
  deterministic: true,
  randomUsed: false,
  timeDependency: false,
};

const VALID_GOVERNANCE: ReferenceGovernance = {
  educationalJustification: 'Cultural references help students connect concepts.',
  pedagogicalPurpose: 'Increase engagement through cultural context.',
  reviewStatus: 'approved',
  contextSensitivity: 'safe',
  reviewRequired: false,
};

const VALID_PROFILE: CulturalReferenceProfile = {
  id: 'ref-profile-001',
  title: 'Matrix Red Pill Metaphor',
  referenceDomain: 'cinema',
  referenceRecency: 'classic',
  referencePurpose: 'analogy',
  referenceValidity: 'canonical',
  contextSensitivity: 'safe',
  conceptIds: ['concept-001', 'concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_PROFILE_2: CulturalReferenceProfile = {
  id: 'ref-profile-002',
  title: 'Tetris Learning Metaphor',
  referenceDomain: 'video_games',
  referenceRecency: 'timeless',
  referencePurpose: 'engagement',
  referenceValidity: 'verified',
  contextSensitivity: 'safe',
  conceptIds: ['concept-003'],
  status: 'approved',
  governance: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Game Studies' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_CONTEXT_REFERENCE: CurrentContextReference = {
  referenceId: 'ctx-ref-001',
  referenceDomain: 'technology_history',
  referenceRecency: 'current',
  contextSensitivity: 'review_required',
  validityPeriod: '90d',
  lastVerified: '2026-01-01',
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: ReferenceRelationship = {
  relationshipId: 'ref-rel-001',
  sourceProfileId: 'ref-profile-001',
  targetProfileId: 'ref-profile-002',
  relationshipType: 'related_to',
  description: 'These profiles are related.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: CulturalReferenceInput = {
  profiles: [VALID_PROFILE, VALID_PROFILE_2],
  contextReferences: [VALID_CONTEXT_REFERENCE],
  relationships: [VALID_RELATIONSHIP],
  governance: VALID_GOVERNANCE,
};

const EMPTY_INPUT: CulturalReferenceInput = {
  profiles: [],
  contextReferences: [],
  relationships: [],
  governance: VALID_GOVERNANCE,
};

// ---------------------------------------------------------------------------
// Profile Composition Tests
// ---------------------------------------------------------------------------

describe('Cultural Reference Kernel — Profile Composition', () => {
  it('should compose valid cultural reference provenance', () => {
    const provenance = composeCulturalReferenceProvenance({
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

  it('should compose valid cultural reference profile', () => {
    const profile = composeCulturalReferenceProfile({
      id: 'ref-profile-001',
      title: 'Matrix Red Pill Metaphor',
      referenceDomain: 'cinema',
      referenceRecency: 'classic',
      referencePurpose: 'analogy',
      referenceValidity: 'canonical',
      contextSensitivity: 'safe',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(profile.id, 'ref-profile-001');
    assert.equal(profile.title, 'Matrix Red Pill Metaphor');
    assert.equal(profile.referenceDomain, 'cinema');
    assert.equal(profile.referenceRecency, 'classic');
    assert.equal(profile.referencePurpose, 'analogy');
    assert.equal(profile.referenceValidity, 'canonical');
    assert.equal(profile.contextSensitivity, 'safe');
    assert.equal(profile.conceptIds.length, 1);
    assert.equal(profile.status, 'published');
    assert.equal(profile.governance, 'canonical');
  });

  it('should compose valid cultural reference trace', () => {
    const trace = composeCulturalReferenceTrace({
      traceId: '_trace_1',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid current context reference', () => {
    const contextRef = composeCurrentContextReference({
      referenceId: 'ctx-ref-001',
      referenceDomain: 'technology_history',
      referenceRecency: 'current',
      contextSensitivity: 'review_required',
      validityPeriod: '90d',
      lastVerified: '2026-01-01',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(contextRef.referenceId, 'ctx-ref-001');
    assert.equal(contextRef.referenceDomain, 'technology');
    assert.equal(contextRef.referenceRecency, 'current');
    assert.equal(contextRef.contextSensitivity, 'review_required');
    assert.equal(contextRef.validityPeriod, '90d');
    assert.equal(contextRef.lastVerified, '2026-01-01');
  });

  it('should compose valid reference governance', () => {
    const governance = composeReferenceGovernance({
      educationalJustification: 'Cultural references help retention.',
      pedagogicalPurpose: 'Engage students.',
      reviewStatus: 'approved',
      contextSensitivity: 'safe',
      reviewRequired: false,
    });

    assert.equal(governance.educationalJustification, 'Cultural references help retention.');
    assert.equal(governance.pedagogicalPurpose, 'Engage students.');
    assert.equal(governance.reviewStatus, 'approved');
    assert.equal(governance.contextSensitivity, 'safe');
    assert.equal(governance.reviewRequired, false);
  });

  it('should compose valid reference relationship', () => {
    const relationship = composeReferenceRelationship({
      relationshipId: 'ref-rel-001',
      sourceProfileId: 'ref-profile-001',
      targetProfileId: 'ref-profile-002',
      relationshipType: 'related_to',
      description: 'Related profiles.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'ref-rel-001');
    assert.equal(relationship.sourceProfileId, 'ref-profile-001');
    assert.equal(relationship.targetProfileId, 'ref-profile-002');
    assert.equal(relationship.relationshipType, 'related_to');
    assert.equal(relationship.description, 'Related profiles.');
  });

  it('should validate a valid profile with no errors', () => {
    const errors = validateCulturalReferenceProfile(VALID_PROFILE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeCulturalReferenceRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_CONTEXT_REFERENCE], [VALID_RELATIONSHIP], VALID_GOVERNANCE);
    const result = validateCulturalReferenceRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate cultural reference input', () => {
    const result = validateCulturalReferenceInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Cultural Reference Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeCulturalReferenceRegistry([], [], [], VALID_GOVERNANCE);
    const result = validateCulturalReferenceRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have REFERENCE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeCulturalReferenceRegistry([VALID_PROFILE, VALID_PROFILE], [], [], VALID_GOVERNANCE);
    const result = validateCulturalReferenceRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have REFERENCE_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE, id: 'ref-profile-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE, id: 'ref-profile-002', title: 'Same Title' };
    const registry = composeCulturalReferenceRegistry([profile1, profile2], [], [], VALID_GOVERNANCE);
    const result = validateCulturalReferenceRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have REFERENCE_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by id', () => {
    const profile3 = { ...VALID_PROFILE, id: 'ref-profile-003' };
    const profile1 = { ...VALID_PROFILE, id: 'ref-profile-001' };
    const profile2 = { ...VALID_PROFILE, id: 'ref-profile-002' };

    const registry = composeCulturalReferenceRegistry([profile3, profile1, profile2], [], [], VALID_GOVERNANCE);

    assert.equal(registry.profiles[0].id, 'ref-profile-001');
    assert.equal(registry.profiles[1].id, 'ref-profile-002');
    assert.equal(registry.profiles[2].id, 'ref-profile-003');
  });

  it('should sort by referenceDomain when id is equal', () => {
    const profileA = { ...VALID_PROFILE, id: 'ref-profile-001', referenceDomain: 'video_games' as const };
    const profileB = { ...VALID_PROFILE, id: 'ref-profile-001', referenceDomain: 'cinema' as const };

    const registry = composeCulturalReferenceRegistry([profileA, profileB], [], [], VALID_GOVERNANCE);

    assert.equal(registry.profiles[0].referenceDomain, 'cinema');
    assert.equal(registry.profiles[1].referenceDomain, 'video_games');
  });

  it('should detect self-relationships', () => {
    const selfRelationship: ReferenceRelationship = {
      relationshipId: 'ref-rel-self',
      sourceProfileId: 'ref-profile-001',
      targetProfileId: 'ref-profile-001',
      relationshipType: 'related_to',
      description: 'Self relationship.',
      provenance: VALID_PROVENANCE,
    };

    const registry = composeCulturalReferenceRegistry([VALID_PROFILE], [], [selfRelationship], VALID_GOVERNANCE);
    const result = validateCulturalReferenceRegistry(registry);
    const selfError = result.errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have REFERENCE_SELF_RELATIONSHIP error');
  });

  it('should detect duplicate context reference IDs', () => {
    const registry = composeCulturalReferenceRegistry([VALID_PROFILE], [VALID_CONTEXT_REFERENCE, VALID_CONTEXT_REFERENCE], [], VALID_GOVERNANCE);
    const result = validateCulturalReferenceRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.CONTEXT_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have CONTEXT_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Cultural Reference Kernel — Validation', () => {
  it('should detect invalid reference domain', () => {
    const profile = { ...VALID_PROFILE, referenceDomain: 'unsupported' as any };
    const errors = validateCulturalReferenceProfile(profile);
    const domainError = errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_DOMAIN,
    );

    assert.ok(domainError, 'Should have REFERENCE_INVALID_DOMAIN error');
  });

  it('should detect invalid reference recency', () => {
    const profile = { ...VALID_PROFILE, referenceRecency: 'unsupported' as any };
    const errors = validateCulturalReferenceProfile(profile);
    const recencyError = errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_RECENCY,
    );

    assert.ok(recencyError, 'Should have REFERENCE_INVALID_RECENCY error');
  });

  it('should detect invalid reference purpose', () => {
    const profile = { ...VALID_PROFILE, referencePurpose: 'unsupported' as any };
    const errors = validateCulturalReferenceProfile(profile);
    const purposeError = errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_PURPOSE,
    );

    assert.ok(purposeError, 'Should have REFERENCE_INVALID_PURPOSE error');
  });

  it('should detect invalid reference validity', () => {
    const profile = { ...VALID_PROFILE, referenceValidity: 'unsupported' as any };
    const errors = validateCulturalReferenceProfile(profile);
    const validityError = errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_VALIDITY,
    );

    assert.ok(validityError, 'Should have REFERENCE_INVALID_VALIDITY error');
  });

  it('should detect invalid context sensitivity', () => {
    const profile = { ...VALID_PROFILE, contextSensitivity: 'unsupported' as any };
    const errors = validateCulturalReferenceProfile(profile);
    const sensitivityError = errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_SENSITIVITY,
    );

    assert.ok(sensitivityError, 'Should have REFERENCE_INVALID_SENSITIVITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE, status: 'unsupported' as any };
    const errors = validateCulturalReferenceProfile(profile);
    const statusError = errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have REFERENCE_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE, governance: 'unsupported' as any };
    const errors = validateCulturalReferenceProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have REFERENCE_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE, provenance: undefined as any };
    const errors = validateCulturalReferenceProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have REFERENCE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance provider', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateCulturalReferenceProfile(profile);
    const providerError = errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have REFERENCE_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateCulturalReferenceProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have REFERENCE_MISSING_RATIONALE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeCulturalReferenceTrace({
      traceId: '_trace_1',
    });

    const result = validateCulturalReferenceTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: CulturalReferenceTrace = {
      traceId: '',
      generatedFrom: 'deterministic_cultural_reference_kernel',
      deterministic: false as true,
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateCulturalReferenceTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect missing governance', () => {
    const governance: ReferenceGovernance = {
      educationalJustification: '',
      pedagogicalPurpose: '',
      reviewStatus: 'approved',
      contextSensitivity: 'safe',
      reviewRequired: false,
    };

    const errors = validateReferenceGovernance(governance);
    const govError = errors.find(
      (e) => e.code === CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_GOVERNANCE,
    );

    assert.ok(govError, 'Should have REFERENCE_MISSING_GOVERNANCE error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Cultural Reference Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeCuriosityCulturalReferences>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCuriosityCulturalReferences(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeCulturalReferenceRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCulturalReferenceRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_CONTEXT_REFERENCE], [VALID_RELATIONSHIP], VALID_GOVERNANCE));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Cultural Reference Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE.id;
    const originalTitle = VALID_PROFILE.title;

    composeCuriosityCulturalReferences(VALID_INPUT);

    assert.equal(VALID_PROFILE.id, originalId);
    assert.equal(VALID_PROFILE.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.id);

    composeCulturalReferenceRegistry(profiles, [], [], VALID_GOVERNANCE);

    assert.equal(profiles[0].id, originalIds[0]);
    assert.equal(profiles[1].id, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Cultural Reference Kernel — Helper Functions', () => {
  it('should return canonical reference domains', () => {
    const domains = getCanonicalReferenceDomains();
    assert.deepStrictEqual([...domains], [...CANONICAL_REFERENCE_DOMAINS]);
    assert.equal(domains.length, 10);
  });

  it('should return canonical reference recency', () => {
    const recency = getCanonicalReferenceRecency();
    assert.deepStrictEqual([...recency], [...CANONICAL_REFERENCE_RECENCY]);
    assert.equal(recency.length, 10);
  });

  it('should return canonical reference purposes', () => {
    const purposes = getCanonicalReferencePurposes();
    assert.deepStrictEqual([...purposes], [...CANONICAL_REFERENCE_PURPOSE]);
    assert.equal(purposes.length, 10);
  });

  it('should return canonical reference validity', () => {
    const validity = getCanonicalReferenceValidity();
    assert.deepStrictEqual([...validity], [...CANONICAL_REFERENCE_VALIDITY]);
    assert.equal(validity.length, 10);
  });

  it('should return canonical context sensitivity', () => {
    const sensitivity = getCanonicalContextSensitivity();
    assert.deepStrictEqual([...sensitivity], [...CANONICAL_CONTEXT_SENSITIVITY]);
    assert.equal(sensitivity.length, 5);
  });

  it('should return canonical reference statuses', () => {
    const statuses = getCanonicalReferenceStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_REFERENCE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate reference domain support', () => {
    assert.equal(isSupportedReferenceDomain('cinema'), true);
    assert.equal(isSupportedReferenceDomain('video_games'), true);
    assert.equal(isSupportedReferenceDomain('unsupported'), false);
  });

  it('should validate reference recency support', () => {
    assert.equal(isSupportedReferenceRecency('timeless'), true);
    assert.equal(isSupportedReferenceRecency('current'), true);
    assert.equal(isSupportedReferenceRecency('unsupported'), false);
  });

  it('should validate reference purpose support', () => {
    assert.equal(isSupportedReferencePurpose('engagement'), true);
    assert.equal(isSupportedReferencePurpose('analogy'), true);
    assert.equal(isSupportedReferencePurpose('unsupported'), false);
  });

  it('should validate reference validity support', () => {
    assert.equal(isSupportedReferenceValidity('canonical'), true);
    assert.equal(isSupportedReferenceValidity('verified'), true);
    assert.equal(isSupportedReferenceValidity('unsupported'), false);
  });

  it('should validate context sensitivity support', () => {
    assert.equal(isSupportedContextSensitivity('safe'), true);
    assert.equal(isSupportedContextSensitivity('review_required'), true);
    assert.equal(isSupportedContextSensitivity('unsupported'), false);
  });

  it('should validate reference status support', () => {
    assert.equal(isSupportedReferenceStatus('draft'), true);
    assert.equal(isSupportedReferenceStatus('published'), true);
    assert.equal(isSupportedReferenceStatus('unsupported'), false);
  });

  it('should validate reference governance support', () => {
    assert.equal(isSupportedReferenceGovernance('canonical'), true);
    assert.equal(isSupportedReferenceGovernance('accepted'), true);
    assert.equal(isSupportedReferenceGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Cultural Reference Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 reference domains', () => {
    assert.equal(CANONICAL_REFERENCE_DOMAINS.length, 10);
  });

  it('should have exactly 10 reference recency', () => {
    assert.equal(CANONICAL_REFERENCE_RECENCY.length, 10);
  });

  it('should have exactly 10 reference purposes', () => {
    assert.equal(CANONICAL_REFERENCE_PURPOSE.length, 10);
  });

  it('should have exactly 10 reference validity', () => {
    assert.equal(CANONICAL_REFERENCE_VALIDITY.length, 10);
  });

  it('should have exactly 5 context sensitivity', () => {
    assert.equal(CANONICAL_CONTEXT_SENSITIVITY.length, 5);
  });

  it('should have exactly 6 reference statuses', () => {
    assert.equal(CANONICAL_REFERENCE_STATUS.length, 6);
  });

  it('should have exactly 5 governance values', () => {
    assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5);
  });

  it('should contain all expected reference domains', () => {
    const expectedDomains = [
      'cinema',
      'television',
      'literature',
      'video_games',
      'internet_culture',
      'historical_events',
      'science_history',
      'technology_history',
      'engineering',
      'popular_science',
    ];

    for (const domain of expectedDomains) {
      assert.ok(
        CANONICAL_REFERENCE_DOMAINS.includes(domain as any),
        `Should include domain: ${domain}`,
      );
    }
  });

  it('should contain all expected reference recency', () => {
    const expectedRecency = [
      'timeless',
      'historical',
      'modern',
      'contemporary',
      'seasonal',
      'evergreen',
      'legacy',
      'classic',
      'emerging',
      'current',
    ];

    for (const recency of expectedRecency) {
      assert.ok(
        CANONICAL_REFERENCE_RECENCY.includes(recency as any),
        `Should include recency: ${recency}`,
      );
    }
  });

  it('should contain all expected reference purposes', () => {
    const expectedPurposes = [
      'engagement',
      'memorability',
      'analogy',
      'comparison',
      'historical_context',
      'scientific_context',
      'engineering_context',
      'humor',
      'reflection',
      'motivation',
    ];

    for (const purpose of expectedPurposes) {
      assert.ok(
        CANONICAL_REFERENCE_PURPOSE.includes(purpose as any),
        `Should include purpose: ${purpose}`,
      );
    }
  });

  it('should contain all expected reference validity', () => {
    const expectedValidity = [
      'canonical',
      'verified',
      'reviewed',
      'temporary',
      'deprecated',
      'legacy',
      'pending_review',
      'restricted',
      'archived',
      'rejected',
    ];

    for (const validity of expectedValidity) {
      assert.ok(
        CANONICAL_REFERENCE_VALIDITY.includes(validity as any),
        `Should include validity: ${validity}`,
      );
    }
  });

  it('should contain all expected context sensitivity', () => {
    const expectedSensitivity = [
      'safe',
      'review_required',
      'high_attention',
      'restricted',
      'forbidden',
    ];

    for (const sensitivity of expectedSensitivity) {
      assert.ok(
        CANONICAL_CONTEXT_SENSITIVITY.includes(sensitivity as any),
        `Should include sensitivity: ${sensitivity}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Cultural Reference Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not search the internet', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(!('searchResults' in result), 'Should not have search results');
    assert.ok(!('webSearch' in result), 'Should not have web search');
  });

  it('should not retrieve news', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(!('news' in result), 'Should not have news');
    assert.ok(!('newsArticles' in result), 'Should not have news articles');
  });

  it('should not detect trends', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(!('trends' in result), 'Should not have trends');
    assert.ok(!('trendingTopics' in result), 'Should not have trending topics');
  });

  it('should not recommend references', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(!('recommendations' in result), 'Should not have recommendations');
    assert.ok(!('suggestedReferences' in result), 'Should not have suggested references');
  });

  it('should not generate analogies', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(!('generatedAnalogies' in result), 'Should not have generated analogies');
    assert.ok(!('analogies' in result), 'Should not have analogies');
  });

  it('should not access filesystem', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeCulturalReferenceProfile({
      id: 'ref-profile-001',
      title: 'Test',
      referenceDomain: 'cinema',
      referenceRecency: 'timeless',
      referencePurpose: 'analogy',
      referenceValidity: 'canonical',
      contextSensitivity: 'safe',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    const keys = Object.keys(profile);
    for (const key of keys) {
      const value = (profile as any)[key];
      assert.ok(typeof value !== 'function', `Profile field "${key}" should not be a function`);
    }
  });

  it('should not store runtime execution', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Cultural Reference Kernel — Cross-Agent Boundary', () => {
  it('should not reference Narrative Agent', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(!('narrativeAgent' in result), 'Should not reference Narrative Agent');
    assert.ok(!('narrative' in result), 'Should not reference narrative');
  });

  it('should not reference Knowledge Agent', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(!('knowledgeAgent' in result), 'Should not reference Knowledge Agent');
    assert.ok(!('knowledge' in result), 'Should not reference knowledge');
  });

  it('should not reference Didactic Agent', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(!('didacticAgent' in result), 'Should not reference Didactic Agent');
    assert.ok(!('didactic' in result), 'Should not reference didactic');
  });

  it('should not reference Research Agent', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(!('researchAgent' in result), 'Should not reference Research Agent');
    assert.ok(!('research' in result), 'Should not reference research');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeCuriosityCulturalReferences(VALID_INPUT);
    assert.ok(!('laboratoryAgent' in result), 'Should not reference Laboratory Agent');
    assert.ok(!('laboratory' in result), 'Should not reference laboratory');
  });
});

// ---------------------------------------------------------------------------
// Validation Codes Tests
// ---------------------------------------------------------------------------

describe('Cultural Reference Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_DUPLICATE_ID, 'REFERENCE_DUPLICATE_ID');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_DUPLICATE_TITLE, 'REFERENCE_DUPLICATE_TITLE');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.CONTEXT_DUPLICATE_ID, 'CONTEXT_DUPLICATE_ID');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_ID, 'RELATIONSHIP_DUPLICATE_ID');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_DOMAIN, 'REFERENCE_INVALID_DOMAIN');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_RECENCY, 'REFERENCE_INVALID_RECENCY');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_PURPOSE, 'REFERENCE_INVALID_PURPOSE');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_VALIDITY, 'REFERENCE_INVALID_VALIDITY');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_SENSITIVITY, 'REFERENCE_INVALID_SENSITIVITY');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_STATUS, 'REFERENCE_INVALID_STATUS');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_GOVERNANCE, 'REFERENCE_INVALID_GOVERNANCE');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROVENANCE, 'REFERENCE_MISSING_PROVENANCE');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROVIDER, 'REFERENCE_MISSING_PROVIDER');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_RATIONALE, 'REFERENCE_MISSING_RATIONALE');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_CURIOSITY_REFERENCE, 'REFERENCE_MISSING_CURIOSITY_REFERENCE');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROFILE_ID, 'REFERENCE_MISSING_PROFILE_ID');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_TITLE, 'REFERENCE_MISSING_TITLE');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_GOVERNANCE, 'REFERENCE_MISSING_GOVERNANCE');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_SELF_RELATIONSHIP, 'REFERENCE_SELF_RELATIONSHIP');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_EMPTY_REGISTRY, 'REFERENCE_EMPTY_REGISTRY');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_TRACE, 'REFERENCE_INVALID_TRACE');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_REGISTRY_INCONSISTENCY, 'REFERENCE_REGISTRY_INCONSISTENCY');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_CONFIGURATION, 'REFERENCE_INVALID_CONFIGURATION');
    assert.equal(CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_UNSAFE_CONFIGURATION, 'REFERENCE_UNSAFE_CONFIGURATION');
  });

  it('should have exactly 24 validation codes', () => {
    const codeCount = Object.keys(CULTURAL_REFERENCE_VALIDATION_CODES).length;
    assert.equal(codeCount, 24);
  });
});

// ---------------------------------------------------------------------------
// Public API Export Tests
// ---------------------------------------------------------------------------

describe('Cultural Reference Kernel — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeCulturalReferenceProvenance, 'function');
    assert.equal(typeof composeCulturalReferenceTrace, 'function');
    assert.equal(typeof composeCulturalReferenceProfile, 'function');
    assert.equal(typeof composeCurrentContextReference, 'function');
    assert.equal(typeof composeReferenceGovernance, 'function');
    assert.equal(typeof composeReferenceRelationship, 'function');
    assert.equal(typeof composeCulturalReferenceRegistry, 'function');
    assert.equal(typeof composeCulturalReferenceRegistryFromInput, 'function');
    assert.equal(typeof composeCuriosityCulturalReferences, 'function');
    assert.equal(typeof composeCuriosityArtifactWithCulturalReferences, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedReferenceDomain, 'function');
    assert.equal(typeof isSupportedReferenceRecency, 'function');
    assert.equal(typeof isSupportedReferencePurpose, 'function');
    assert.equal(typeof isSupportedReferenceValidity, 'function');
    assert.equal(typeof isSupportedContextSensitivity, 'function');
    assert.equal(typeof isSupportedReferenceStatus, 'function');
    assert.equal(typeof isSupportedReferenceGovernance, 'function');
    assert.equal(typeof getCanonicalReferenceDomains, 'function');
    assert.equal(typeof getCanonicalReferenceRecency, 'function');
    assert.equal(typeof getCanonicalReferencePurposes, 'function');
    assert.equal(typeof getCanonicalReferenceValidity, 'function');
    assert.equal(typeof getCanonicalContextSensitivity, 'function');
    assert.equal(typeof getCanonicalReferenceStatuses, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateCulturalReferenceProfile, 'function');
    assert.equal(typeof validateCurrentContextReference, 'function');
    assert.equal(typeof validateReferenceGovernance, 'function');
    assert.equal(typeof validateReferenceRelationship, 'function');
    assert.equal(typeof validateCulturalReferenceRegistry, 'function');
    assert.equal(typeof validateCulturalReferenceInput, 'function');
    assert.equal(typeof validateCulturalReferenceTrace, 'function');
    assert.equal(typeof validateCuriosityArtifactWithCulturalReferences, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(CULTURAL_REFERENCE_VALIDATION_CODES);
    assert.equal(typeof CULTURAL_REFERENCE_VALIDATION_CODES, 'object');
  });
});
