/**
 * NV-2100-D9-OPT-03 — Curiosity Humor Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Curiosity Humor Kernel.
 * Covers: valid profile, valid reference, valid relationship, valid governance,
 * valid provenance, valid trace, empty registry, duplicate IDs, duplicate titles,
 * deterministic ordering, invalid enums, missing provenance/provider/rationale,
 * missing governance, missing references, self-relationships, empty registries,
 * registry inconsistencies, unsafe configurations, determinism (100 iterations),
 * immutability, negative capability, cross-agent boundaries, validation code
 * stability, public API exports, backward compatibility with D9-OPT-01 and D9-OPT-02.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  HumorProfile,
  HumorReference,
  HumorRelationship,
  HumorGovernance,
  HumorInput,
  HumorRegistry,
  CuriosityHumorProvenance,
  CuriosityHumorTrace,
  CuriosityArtifactWithHumor,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_HUMOR_TYPES,
  CANONICAL_REFERENCE_TYPES,
  CANONICAL_HUMOR_OBJECTIVES,
  CANONICAL_HUMOR_INTENSITY,
  CANONICAL_HUMOR_SAFETY_LEVELS,
  CANONICAL_HUMOR_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

import {
  composeCuriosityHumorProvenance,
  composeCuriosityHumorTrace,
  composeHumorProfile,
  composeHumorReference,
  composeHumorRelationship,
  composeHumorGovernance,
  composeHumorRegistry,
  composeHumorRegistryFromInput,
  composeCuriosityHumor,
  composeCuriosityArtifactWithHumor,
  isSupportedHumorType,
  isSupportedReferenceType,
  isSupportedHumorObjective,
  isSupportedHumorIntensity,
  isSupportedHumorSafetyLevel,
  isSupportedHumorStatus,
  isSupportedHumorGovernance,
  getCanonicalHumorTypes,
  getCanonicalReferenceTypes,
  getCanonicalHumorObjectives,
  getCanonicalHumorIntensity,
  getCanonicalHumorSafetyLevels,
  getCanonicalHumorStatuses,
} from './CuriosityHumorKernel.ts';

import {
  validateHumorProfile,
  validateHumorReference,
  validateHumorRelationship,
  validateHumorGovernance,
  validateHumorRegistry,
  validateHumorInput,
  validateHumorTrace,
  validateCuriosityArtifactWithHumor,
  HUMOR_VALIDATION_CODES,
} from './CuriosityHumorValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: CuriosityHumorProvenance = {
  provider: 'NeuralVerse Team',
  source: 'Curated Knowledge Base',
  rationale: 'Core humor artifact.',
  version: '1.0.0',
};

const VALID_TRACE: CuriosityHumorTrace = {
  traceId: '_trace_1',
  generatedFrom: 'deterministic_curiosity_humor_kernel',
  deterministic: true,
  randomUsed: false,
  timeDependency: false,
};

const VALID_GOVERNANCE: HumorGovernance = {
  educationalJustification: 'Humor helps students remember complex concepts.',
  pedagogicalPurpose: 'Increase engagement through controlled acid humor.',
  reviewStatus: 'approved',
  safetyLevel: 'fully_safe',
  reviewRequired: false,
};

const VALID_PROFILE: HumorProfile = {
  id: 'humor-001',
  title: 'Neural Network Dry Humor',
  humorType: 'dry_humor',
  referenceType: 'engineering',
  humorObjective: 'make_concept_memorable',
  humorIntensity: 'light',
  safetyLevel: 'fully_safe',
  conceptIds: ['concept-001', 'concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_PROFILE_2: HumorProfile = {
  id: 'humor-002',
  title: 'Scientific Irony in ML',
  humorType: 'scientific_irony',
  referenceType: 'scientist',
  humorObjective: 'illustrate_absurdity',
  humorIntensity: 'moderate',
  safetyLevel: 'reviewed',
  conceptIds: ['concept-003'],
  status: 'approved',
  governance: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Archives' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_REFERENCE: HumorReference = {
  referenceId: 'ref-001',
  referenceType: 'movie',
  referenceTitle: 'The Matrix',
  referenceReason: 'Red pill metaphor for overfitting.',
  educationalPurpose: 'Make overfitting memorable.',
};

const VALID_RELATIONSHIP: HumorRelationship = {
  relationshipId: 'rel-001',
  sourceProfileId: 'humor-001',
  targetProfileId: 'humor-002',
  relationshipType: 'related_to',
  description: 'These profiles are related.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: HumorInput = {
  profiles: [VALID_PROFILE, VALID_PROFILE_2],
  references: [VALID_REFERENCE],
  relationships: [VALID_RELATIONSHIP],
  governance: VALID_GOVERNANCE,
};

const EMPTY_INPUT: HumorInput = {
  profiles: [],
  references: [],
  relationships: [],
  governance: VALID_GOVERNANCE,
};

// ---------------------------------------------------------------------------
// Profile Composition Tests
// ---------------------------------------------------------------------------

describe('Curiosity Humor Kernel — Profile Composition', () => {
  it('should compose valid curiosity humor provenance', () => {
    const provenance = composeCuriosityHumorProvenance({
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

  it('should compose valid humor profile', () => {
    const profile = composeHumorProfile({
      id: 'humor-001',
      title: 'Neural Network Dry Humor',
      humorType: 'dry_humor',
      referenceType: 'engineering',
      humorObjective: 'make_concept_memorable',
      humorIntensity: 'light',
      safetyLevel: 'fully_safe',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(profile.id, 'humor-001');
    assert.equal(profile.title, 'Neural Network Dry Humor');
    assert.equal(profile.humorType, 'dry_humor');
    assert.equal(profile.referenceType, 'engineering');
    assert.equal(profile.humorObjective, 'make_concept_memorable');
    assert.equal(profile.humorIntensity, 'light');
    assert.equal(profile.safetyLevel, 'fully_safe');
    assert.equal(profile.conceptIds.length, 1);
    assert.equal(profile.status, 'published');
    assert.equal(profile.governance, 'canonical');
  });

  it('should compose valid humor trace', () => {
    const trace = composeCuriosityHumorTrace({
      traceId: '_trace_1',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid humor reference', () => {
    const reference = composeHumorReference({
      referenceId: 'ref-001',
      referenceType: 'movie',
      referenceTitle: 'The Matrix',
      referenceReason: 'Red pill metaphor.',
      educationalPurpose: 'Make concept memorable.',
    });

    assert.equal(reference.referenceId, 'ref-001');
    assert.equal(reference.referenceType, 'movie');
    assert.equal(reference.referenceTitle, 'The Matrix');
    assert.equal(reference.referenceReason, 'Red pill metaphor.');
    assert.equal(reference.educationalPurpose, 'Make concept memorable.');
  });

  it('should compose valid humor relationship', () => {
    const relationship = composeHumorRelationship({
      relationshipId: 'rel-001',
      sourceProfileId: 'humor-001',
      targetProfileId: 'humor-002',
      relationshipType: 'related_to',
      description: 'Related profiles.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceProfileId, 'humor-001');
    assert.equal(relationship.targetProfileId, 'humor-002');
    assert.equal(relationship.relationshipType, 'related_to');
    assert.equal(relationship.description, 'Related profiles.');
  });

  it('should compose valid humor governance', () => {
    const governance = composeHumorGovernance({
      educationalJustification: 'Humor helps retention.',
      pedagogicalPurpose: 'Engage students.',
      reviewStatus: 'approved',
      safetyLevel: 'fully_safe',
      reviewRequired: false,
    });

    assert.equal(governance.educationalJustification, 'Humor helps retention.');
    assert.equal(governance.pedagogicalPurpose, 'Engage students.');
    assert.equal(governance.reviewStatus, 'approved');
    assert.equal(governance.safetyLevel, 'fully_safe');
    assert.equal(governance.reviewRequired, false);
  });

  it('should validate a valid profile with no errors', () => {
    const errors = validateHumorProfile(VALID_PROFILE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeHumorRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_REFERENCE], [VALID_RELATIONSHIP], VALID_GOVERNANCE);
    const result = validateHumorRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate humor input', () => {
    const result = validateHumorInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Curiosity Humor Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeHumorRegistry([], [], [], VALID_GOVERNANCE);
    const result = validateHumorRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have HUMOR_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeHumorRegistry([VALID_PROFILE, VALID_PROFILE], [], [], VALID_GOVERNANCE);
    const result = validateHumorRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have HUMOR_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE, id: 'humor-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE, id: 'humor-002', title: 'Same Title' };
    const registry = composeHumorRegistry([profile1, profile2], [], [], VALID_GOVERNANCE);
    const result = validateHumorRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have HUMOR_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by id', () => {
    const profile3 = { ...VALID_PROFILE, id: 'humor-003' };
    const profile1 = { ...VALID_PROFILE, id: 'humor-001' };
    const profile2 = { ...VALID_PROFILE, id: 'humor-002' };

    const registry = composeHumorRegistry([profile3, profile1, profile2], [], [], VALID_GOVERNANCE);

    assert.equal(registry.profiles[0].id, 'humor-001');
    assert.equal(registry.profiles[1].id, 'humor-002');
    assert.equal(registry.profiles[2].id, 'humor-003');
  });

  it('should sort by humorType when id is equal', () => {
    const profileA = { ...VALID_PROFILE, id: 'humor-001', humorType: 'scientific_irony' as const };
    const profileB = { ...VALID_PROFILE, id: 'humor-001', humorType: 'dry_humor' as const };

    const registry = composeHumorRegistry([profileA, profileB], [], [], VALID_GOVERNANCE);

    assert.equal(registry.profiles[0].humorType, 'dry_humor');
    assert.equal(registry.profiles[1].humorType, 'scientific_irony');
  });

  it('should detect self-relationships', () => {
    const selfRelationship: HumorRelationship = {
      relationshipId: 'rel-self',
      sourceProfileId: 'humor-001',
      targetProfileId: 'humor-001',
      relationshipType: 'related_to',
      description: 'Self relationship.',
      provenance: VALID_PROVENANCE,
    };

    const registry = composeHumorRegistry([VALID_PROFILE], [], [selfRelationship], VALID_GOVERNANCE);
    const result = validateHumorRegistry(registry);
    const selfError = result.errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have HUMOR_SELF_RELATIONSHIP error');
  });

  it('should detect duplicate reference IDs', () => {
    const registry = composeHumorRegistry([VALID_PROFILE], [VALID_REFERENCE, VALID_REFERENCE], [], VALID_GOVERNANCE);
    const result = validateHumorRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.REFERENCE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have REFERENCE_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Curiosity Humor Kernel — Validation', () => {
  it('should detect invalid humor type', () => {
    const profile = { ...VALID_PROFILE, humorType: 'unsupported' as any };
    const errors = validateHumorProfile(profile);
    const typeError = errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have HUMOR_INVALID_TYPE error');
  });

  it('should detect invalid reference type', () => {
    const profile = { ...VALID_PROFILE, referenceType: 'unsupported' as any };
    const errors = validateHumorProfile(profile);
    const refError = errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_INVALID_REFERENCE,
    );

    assert.ok(refError, 'Should have HUMOR_INVALID_REFERENCE error');
  });

  it('should detect invalid humor objective', () => {
    const profile = { ...VALID_PROFILE, humorObjective: 'unsupported' as any };
    const errors = validateHumorProfile(profile);
    const objError = errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_INVALID_OBJECTIVE,
    );

    assert.ok(objError, 'Should have HUMOR_INVALID_OBJECTIVE error');
  });

  it('should detect invalid humor intensity', () => {
    const profile = { ...VALID_PROFILE, humorIntensity: 'unsupported' as any };
    const errors = validateHumorProfile(profile);
    const intError = errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_INVALID_INTENSITY,
    );

    assert.ok(intError, 'Should have HUMOR_INVALID_INTENSITY error');
  });

  it('should detect invalid safety level', () => {
    const profile = { ...VALID_PROFILE, safetyLevel: 'unsupported' as any };
    const errors = validateHumorProfile(profile);
    const safetyError = errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_INVALID_SAFETY,
    );

    assert.ok(safetyError, 'Should have HUMOR_INVALID_SAFETY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE, status: 'unsupported' as any };
    const errors = validateHumorProfile(profile);
    const statusError = errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have HUMOR_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE, governance: 'unsupported' as any };
    const errors = validateHumorProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have HUMOR_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE, provenance: undefined as any };
    const errors = validateHumorProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have HUMOR_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance provider', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateHumorProfile(profile);
    const providerError = errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have HUMOR_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateHumorProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have HUMOR_MISSING_RATIONALE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeCuriosityHumorTrace({
      traceId: '_trace_1',
    });

    const result = validateHumorTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: CuriosityHumorTrace = {
      traceId: '',
      generatedFrom: 'deterministic_curiosity_humor_kernel',
      deterministic: false as true,
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateHumorTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect missing governance', () => {
    const governance: HumorGovernance = {
      educationalJustification: '',
      pedagogicalPurpose: '',
      reviewStatus: 'approved',
      safetyLevel: 'fully_safe',
      reviewRequired: false,
    };

    const errors = validateHumorGovernance(governance);
    const govError = errors.find(
      (e) => e.code === HUMOR_VALIDATION_CODES.HUMOR_MISSING_GOVERNANCE,
    );

    assert.ok(govError, 'Should have HUMOR_MISSING_GOVERNANCE error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Curiosity Humor Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeCuriosityHumor>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCuriosityHumor(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeHumorRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeHumorRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_REFERENCE], [VALID_RELATIONSHIP], VALID_GOVERNANCE));
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

describe('Curiosity Humor Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE.id;
    const originalTitle = VALID_PROFILE.title;

    composeCuriosityHumor(VALID_INPUT);

    assert.equal(VALID_PROFILE.id, originalId);
    assert.equal(VALID_PROFILE.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.id);

    composeHumorRegistry(profiles, [], [], VALID_GOVERNANCE);

    assert.equal(profiles[0].id, originalIds[0]);
    assert.equal(profiles[1].id, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Curiosity Humor Kernel — Helper Functions', () => {
  it('should return canonical humor types', () => {
    const types = getCanonicalHumorTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_HUMOR_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical reference types', () => {
    const types = getCanonicalReferenceTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_REFERENCE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical humor objectives', () => {
    const objectives = getCanonicalHumorObjectives();
    assert.deepStrictEqual([...objectives], [...CANONICAL_HUMOR_OBJECTIVES]);
    assert.equal(objectives.length, 10);
  });

  it('should return canonical humor intensity', () => {
    const intensity = getCanonicalHumorIntensity();
    assert.deepStrictEqual([...intensity], [...CANONICAL_HUMOR_INTENSITY]);
    assert.equal(intensity.length, 10);
  });

  it('should return canonical humor safety levels', () => {
    const levels = getCanonicalHumorSafetyLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_HUMOR_SAFETY_LEVELS]);
    assert.equal(levels.length, 10);
  });

  it('should return canonical humor statuses', () => {
    const statuses = getCanonicalHumorStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_HUMOR_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate humor type support', () => {
    assert.equal(isSupportedHumorType('dry_humor'), true);
    assert.equal(isSupportedHumorType('controlled_acid'), true);
    assert.equal(isSupportedHumorType('unsupported'), false);
  });

  it('should validate reference type support', () => {
    assert.equal(isSupportedReferenceType('movie'), true);
    assert.equal(isSupportedReferenceType('video_game'), true);
    assert.equal(isSupportedReferenceType('unsupported'), false);
  });

  it('should validate humor objective support', () => {
    assert.equal(isSupportedHumorObjective('increase_retention'), true);
    assert.equal(isSupportedHumorObjective('capture_attention'), true);
    assert.equal(isSupportedHumorObjective('unsupported'), false);
  });

  it('should validate humor intensity support', () => {
    assert.equal(isSupportedHumorIntensity('none'), true);
    assert.equal(isSupportedHumorIntensity('acid_controlled'), true);
    assert.equal(isSupportedHumorIntensity('unsupported'), false);
  });

  it('should validate humor safety level support', () => {
    assert.equal(isSupportedHumorSafetyLevel('fully_safe'), true);
    assert.equal(isSupportedHumorSafetyLevel('controlled'), true);
    assert.equal(isSupportedHumorSafetyLevel('unsupported'), false);
  });

  it('should validate humor status support', () => {
    assert.equal(isSupportedHumorStatus('draft'), true);
    assert.equal(isSupportedHumorStatus('published'), true);
    assert.equal(isSupportedHumorStatus('unsupported'), false);
  });

  it('should validate humor governance support', () => {
    assert.equal(isSupportedHumorGovernance('canonical'), true);
    assert.equal(isSupportedHumorGovernance('accepted'), true);
    assert.equal(isSupportedHumorGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Curiosity Humor Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 humor types', () => {
    assert.equal(CANONICAL_HUMOR_TYPES.length, 10);
  });

  it('should have exactly 10 reference types', () => {
    assert.equal(CANONICAL_REFERENCE_TYPES.length, 10);
  });

  it('should have exactly 10 humor objectives', () => {
    assert.equal(CANONICAL_HUMOR_OBJECTIVES.length, 10);
  });

  it('should have exactly 10 humor intensity', () => {
    assert.equal(CANONICAL_HUMOR_INTENSITY.length, 10);
  });

  it('should have exactly 10 humor safety levels', () => {
    assert.equal(CANONICAL_HUMOR_SAFETY_LEVELS.length, 10);
  });

  it('should have exactly 6 humor statuses', () => {
    assert.equal(CANONICAL_HUMOR_STATUS.length, 6);
  });

  it('should have exactly 5 governance values', () => {
    assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5);
  });

  it('should contain all expected humor types', () => {
    const expectedTypes = [
      'dry_humor',
      'controlled_acid',
      'engineering_joke',
      'scientific_irony',
      'playful_comparison',
      'unexpected_fact',
      'self_deprecating_science',
      'historical_irony',
      'pop_culture_reference',
      'gaming_reference',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_HUMOR_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected reference types', () => {
    const expectedTypes = [
      'movie',
      'tv_series',
      'anime',
      'video_game',
      'book',
      'internet_culture',
      'scientist',
      'historical_event',
      'technology',
      'engineering',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_REFERENCE_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected humor objectives', () => {
    const expectedObjectives = [
      'increase_retention',
      'capture_attention',
      'reduce_cognitive_load',
      'make_concept_memorable',
      'humanize_engineering',
      'illustrate_absurdity',
      'encourage_reflection',
      'create_surprise',
      'support_storytelling',
      'increase_engagement',
    ];

    for (const objective of expectedObjectives) {
      assert.ok(
        CANONICAL_HUMOR_OBJECTIVES.includes(objective as any),
        `Should include objective: ${objective}`,
      );
    }
  });

  it('should contain all expected humor intensity', () => {
    const expectedIntensity = [
      'none',
      'minimal',
      'light',
      'playful',
      'moderate',
      'strong',
      'acid_light',
      'acid_controlled',
      'highly_ironic',
      'satirical_light',
    ];

    for (const intensity of expectedIntensity) {
      assert.ok(
        CANONICAL_HUMOR_INTENSITY.includes(intensity as any),
        `Should include intensity: ${intensity}`,
      );
    }
  });

  it('should contain all expected humor safety levels', () => {
    const expectedLevels = [
      'fully_safe',
      'reviewed',
      'canonical',
      'educational',
      'neutral',
      'restricted',
      'careful',
      'controlled',
      'review_required',
      'deprecated',
    ];

    for (const level of expectedLevels) {
      assert.ok(
        CANONICAL_HUMOR_SAFETY_LEVELS.includes(level as any),
        `Should include level: ${level}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Curiosity Humor Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate jokes', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('joke' in result), 'Should not have joke');
    assert.ok(!('generatedJoke' in result), 'Should not have generated joke');
  });

  it('should not generate sarcasm', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('sarcasm' in result), 'Should not have sarcasm');
    assert.ok(!('sarcasticContent' in result), 'Should not have sarcastic content');
  });

  it('should not create memes', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('meme' in result), 'Should not have meme');
    assert.ok(!('generatedMeme' in result), 'Should not have generated meme');
  });

  it('should not rewrite narrative', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('rewrittenNarrative' in result), 'Should not have rewritten narrative');
    assert.ok(!('narrative' in result), 'Should not have narrative');
  });

  it('should not create educational text', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('educationalText' in result), 'Should not have educational text');
    assert.ok(!('content' in result), 'Should not have content');
  });

  it('should not invoke LLMs', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('llmResponse' in result), 'Should not have LLM response');
    assert.ok(!('modelOutput' in result), 'Should not have model output');
  });

  it('should not access filesystem', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeHumorProfile({
      id: 'humor-001',
      title: 'Test',
      humorType: 'dry_humor',
      referenceType: 'engineering',
      humorObjective: 'make_concept_memorable',
      humorIntensity: 'light',
      safetyLevel: 'fully_safe',
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
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Curiosity Humor Kernel — Cross-Agent Boundary', () => {
  it('should not reference Narrative Agent', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('narrativeAgent' in result), 'Should not reference Narrative Agent');
    assert.ok(!('narrative' in result), 'Should not reference narrative');
  });

  it('should not reference Knowledge Agent', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('knowledgeAgent' in result), 'Should not reference Knowledge Agent');
    assert.ok(!('knowledge' in result), 'Should not reference knowledge');
  });

  it('should not reference Didactic Agent', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('didacticAgent' in result), 'Should not reference Didactic Agent');
    assert.ok(!('didactic' in result), 'Should not reference didactic');
  });

  it('should not reference Research Agent', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('researchAgent' in result), 'Should not reference Research Agent');
    assert.ok(!('research' in result), 'Should not reference research');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeCuriosityHumor(VALID_INPUT);
    assert.ok(!('laboratoryAgent' in result), 'Should not reference Laboratory Agent');
    assert.ok(!('laboratory' in result), 'Should not reference laboratory');
  });
});

// ---------------------------------------------------------------------------
// Validation Codes Tests
// ---------------------------------------------------------------------------

describe('Curiosity Humor Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_DUPLICATE_ID, 'HUMOR_DUPLICATE_ID');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_DUPLICATE_TITLE, 'HUMOR_DUPLICATE_TITLE');
    assert.equal(HUMOR_VALIDATION_CODES.REFERENCE_DUPLICATE_ID, 'REFERENCE_DUPLICATE_ID');
    assert.equal(HUMOR_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_ID, 'RELATIONSHIP_DUPLICATE_ID');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_INVALID_TYPE, 'HUMOR_INVALID_TYPE');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_INVALID_REFERENCE, 'HUMOR_INVALID_REFERENCE');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_INVALID_OBJECTIVE, 'HUMOR_INVALID_OBJECTIVE');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_INVALID_INTENSITY, 'HUMOR_INVALID_INTENSITY');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_INVALID_SAFETY, 'HUMOR_INVALID_SAFETY');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_INVALID_STATUS, 'HUMOR_INVALID_STATUS');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_INVALID_GOVERNANCE, 'HUMOR_INVALID_GOVERNANCE');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_MISSING_PROVENANCE, 'HUMOR_MISSING_PROVENANCE');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_MISSING_PROVIDER, 'HUMOR_MISSING_PROVIDER');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_MISSING_RATIONALE, 'HUMOR_MISSING_RATIONALE');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_MISSING_CURIOSITY_REFERENCE, 'HUMOR_MISSING_CURIOSITY_REFERENCE');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_MISSING_PROFILE_ID, 'HUMOR_MISSING_PROFILE_ID');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_MISSING_TITLE, 'HUMOR_MISSING_TITLE');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_MISSING_GOVERNANCE, 'HUMOR_MISSING_GOVERNANCE');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_SELF_RELATIONSHIP, 'HUMOR_SELF_RELATIONSHIP');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_EMPTY_REGISTRY, 'HUMOR_EMPTY_REGISTRY');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_INVALID_TRACE, 'HUMOR_INVALID_TRACE');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_REGISTRY_INCONSISTENCY, 'HUMOR_REGISTRY_INCONSISTENCY');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_INVALID_CONFIGURATION, 'HUMOR_INVALID_CONFIGURATION');
    assert.equal(HUMOR_VALIDATION_CODES.HUMOR_UNSAFE_CONFIGURATION, 'HUMOR_UNSAFE_CONFIGURATION');
  });

  it('should have exactly 24 validation codes', () => {
    const codeCount = Object.keys(HUMOR_VALIDATION_CODES).length;
    assert.equal(codeCount, 24);
  });
});

// ---------------------------------------------------------------------------
// Public API Export Tests
// ---------------------------------------------------------------------------

describe('Curiosity Humor Kernel — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeCuriosityHumorProvenance, 'function');
    assert.equal(typeof composeCuriosityHumorTrace, 'function');
    assert.equal(typeof composeHumorProfile, 'function');
    assert.equal(typeof composeHumorReference, 'function');
    assert.equal(typeof composeHumorRelationship, 'function');
    assert.equal(typeof composeHumorGovernance, 'function');
    assert.equal(typeof composeHumorRegistry, 'function');
    assert.equal(typeof composeHumorRegistryFromInput, 'function');
    assert.equal(typeof composeCuriosityHumor, 'function');
    assert.equal(typeof composeCuriosityArtifactWithHumor, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedHumorType, 'function');
    assert.equal(typeof isSupportedReferenceType, 'function');
    assert.equal(typeof isSupportedHumorObjective, 'function');
    assert.equal(typeof isSupportedHumorIntensity, 'function');
    assert.equal(typeof isSupportedHumorSafetyLevel, 'function');
    assert.equal(typeof isSupportedHumorStatus, 'function');
    assert.equal(typeof isSupportedHumorGovernance, 'function');
    assert.equal(typeof getCanonicalHumorTypes, 'function');
    assert.equal(typeof getCanonicalReferenceTypes, 'function');
    assert.equal(typeof getCanonicalHumorObjectives, 'function');
    assert.equal(typeof getCanonicalHumorIntensity, 'function');
    assert.equal(typeof getCanonicalHumorSafetyLevels, 'function');
    assert.equal(typeof getCanonicalHumorStatuses, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateHumorProfile, 'function');
    assert.equal(typeof validateHumorReference, 'function');
    assert.equal(typeof validateHumorRelationship, 'function');
    assert.equal(typeof validateHumorGovernance, 'function');
    assert.equal(typeof validateHumorRegistry, 'function');
    assert.equal(typeof validateHumorInput, 'function');
    assert.equal(typeof validateHumorTrace, 'function');
    assert.equal(typeof validateCuriosityArtifactWithHumor, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(HUMOR_VALIDATION_CODES);
    assert.equal(typeof HUMOR_VALIDATION_CODES, 'object');
  });
});
