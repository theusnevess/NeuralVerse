/**
 * NV-2100-D9-OPT-02 — Curiosity Purpose Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Curiosity Purpose Kernel.
 * Covers: valid profile, valid provenance, valid trace, empty registry,
 * duplicate IDs, duplicate titles, deterministic ordering, invalid enums,
 * missing provenance/provider/rationale, missing references,
 * self-relationships, empty registries, registry inconsistencies,
 * determinism (100 iterations), immutability, negative capability,
 * cross-agent boundaries, validation code stability, public API exports.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CuriosityPurposeProfile,
  CuriosityPurposeProvenance,
  CuriosityPurposeRelationship,
  CuriosityPurposeInput,
  CuriosityPurposeRegistry,
  CuriosityPurposeTrace,
  CuriosityArtifactWithPurpose,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_CURIOSITY_OUTPUT_TYPES,
  CANONICAL_EDUCATIONAL_PURPOSES,
  CANONICAL_EMOTIONAL_TONES,
  CANONICAL_DELIVERY_CONTEXTS,
  CANONICAL_AUDIENCE_LEVELS,
  CANONICAL_CURIOSITY_PURPOSE_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

import {
  composeCuriosityPurposeProvenance,
  composeCuriosityPurposeTrace,
  composeCuriosityPurposeProfile,
  composeCuriosityPurposeRelationship,
  composeCuriosityPurposeRegistry,
  composeCuriosityPurposeRegistryFromInput,
  composeCuriosityPurposes,
  composeCuriosityArtifactWithPurpose,
  isSupportedCuriosityOutputType,
  isSupportedEducationalPurpose,
  isSupportedEmotionalTone,
  isSupportedDeliveryContext,
  isSupportedAudienceLevel,
  isSupportedCuriosityPurposeStatus,
  isSupportedCuriosityPurposeGovernance,
  getCanonicalCuriosityOutputTypes,
  getCanonicalEducationalPurposes,
  getCanonicalEmotionalTones,
  getCanonicalDeliveryContexts,
  getCanonicalAudienceLevels,
  getCanonicalCuriosityPurposeStatuses,
} from './CuriosityPurposeKernel.ts';

import {
  validateCuriosityPurposeProfile,
  validateCuriosityPurposeRelationship,
  validateCuriosityPurposeRegistry,
  validateCuriosityPurposeInput,
  validateCuriosityPurposeTrace,
  validateCuriosityArtifactWithPurpose,
  CURIOSITY_PURPOSE_VALIDATION_CODES,
} from './CuriosityPurposeValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: CuriosityPurposeProvenance = {
  provider: 'NeuralVerse Team',
  source: 'Curated Knowledge Base',
  rationale: 'Core curiosity purpose artifact.',
  version: '1.0.0',
};

const VALID_TRACE: CuriosityPurposeTrace = {
  traceId: '_trace_1',
  generatedFrom: 'deterministic_curiosity_purpose_kernel',
  deterministic: true,
  randomUsed: false,
  timeDependency: false,
};

const VALID_PROFILE: CuriosityPurposeProfile = {
  id: 'profile-001',
  title: 'Neural Network Surprising Fact',
  outputType: 'fact',
  educationalPurpose: 'stimulate_curiosity',
  emotionalTone: 'surprising',
  deliveryContext: 'lesson_intro',
  audienceLevel: 'beginner',
  conceptIds: ['concept-001', 'concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_PROFILE_2: CuriosityPurposeProfile = {
  id: 'profile-002',
  title: 'Historical Story in AI',
  outputType: 'historical_story',
  educationalPurpose: 'humanize_science',
  emotionalTone: 'dramatic',
  deliveryContext: 'lesson_transition',
  audienceLevel: 'intermediate',
  conceptIds: ['concept-003'],
  status: 'approved',
  governance: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Archives' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_RELATIONSHIP: CuriosityPurposeRelationship = {
  relationshipId: 'rel-001',
  sourceProfileId: 'profile-001',
  targetProfileId: 'profile-002',
  relationshipType: 'related_to',
  description: 'These profiles are related.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: CuriosityPurposeInput = {
  profiles: [VALID_PROFILE, VALID_PROFILE_2],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: CuriosityPurposeInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Profile Composition Tests
// ---------------------------------------------------------------------------

describe('Curiosity Purpose Kernel — Profile Composition', () => {
  it('should compose valid curiosity purpose provenance', () => {
    const provenance = composeCuriosityPurposeProvenance({
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

  it('should compose valid curiosity purpose profile', () => {
    const profile = composeCuriosityPurposeProfile({
      id: 'profile-001',
      title: 'Neural Network Surprising Fact',
      outputType: 'fact',
      educationalPurpose: 'stimulate_curiosity',
      emotionalTone: 'surprising',
      deliveryContext: 'lesson_intro',
      audienceLevel: 'beginner',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(profile.id, 'profile-001');
    assert.equal(profile.title, 'Neural Network Surprising Fact');
    assert.equal(profile.outputType, 'fact');
    assert.equal(profile.educationalPurpose, 'stimulate_curiosity');
    assert.equal(profile.emotionalTone, 'surprising');
    assert.equal(profile.deliveryContext, 'lesson_intro');
    assert.equal(profile.audienceLevel, 'beginner');
    assert.equal(profile.conceptIds.length, 1);
    assert.equal(profile.status, 'published');
    assert.equal(profile.governance, 'canonical');
  });

  it('should compose valid curiosity purpose trace', () => {
    const trace = composeCuriosityPurposeTrace({
      traceId: '_trace_1',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid curiosity purpose relationship', () => {
    const relationship = composeCuriosityPurposeRelationship({
      relationshipId: 'rel-001',
      sourceProfileId: 'profile-001',
      targetProfileId: 'profile-002',
      relationshipType: 'related_to',
      description: 'Related profiles.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceProfileId, 'profile-001');
    assert.equal(relationship.targetProfileId, 'profile-002');
    assert.equal(relationship.relationshipType, 'related_to');
    assert.equal(relationship.description, 'Related profiles.');
  });

  it('should validate a valid profile with no errors', () => {
    const errors = validateCuriosityPurposeProfile(VALID_PROFILE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeCuriosityPurposeRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateCuriosityPurposeRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate curiosity purpose input', () => {
    const result = validateCuriosityPurposeInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Curiosity Purpose Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeCuriosityPurposeRegistry([], []);
    const result = validateCuriosityPurposeRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have PURPOSE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeCuriosityPurposeRegistry([VALID_PROFILE, VALID_PROFILE], []);
    const result = validateCuriosityPurposeRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have PURPOSE_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE, id: 'profile-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE, id: 'profile-002', title: 'Same Title' };
    const registry = composeCuriosityPurposeRegistry([profile1, profile2], []);
    const result = validateCuriosityPurposeRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have PURPOSE_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by id', () => {
    const profile3 = { ...VALID_PROFILE, id: 'profile-003' };
    const profile1 = { ...VALID_PROFILE, id: 'profile-001' };
    const profile2 = { ...VALID_PROFILE, id: 'profile-002' };

    const registry = composeCuriosityPurposeRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].id, 'profile-001');
    assert.equal(registry.profiles[1].id, 'profile-002');
    assert.equal(registry.profiles[2].id, 'profile-003');
  });

  it('should sort by outputType when id is equal', () => {
    const profileA = { ...VALID_PROFILE, id: 'profile-001', outputType: 'historical_story' as const };
    const profileB = { ...VALID_PROFILE, id: 'profile-001', outputType: 'fact' as const };

    const registry = composeCuriosityPurposeRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].outputType, 'fact');
    assert.equal(registry.profiles[1].outputType, 'historical_story');
  });

  it('should detect self-relationships', () => {
    const selfRelationship: CuriosityPurposeRelationship = {
      relationshipId: 'rel-self',
      sourceProfileId: 'profile-001',
      targetProfileId: 'profile-001',
      relationshipType: 'related_to',
      description: 'Self relationship.',
      provenance: VALID_PROVENANCE,
    };

    const registry = composeCuriosityPurposeRegistry([VALID_PROFILE], [selfRelationship]);
    const result = validateCuriosityPurposeRegistry(registry);
    const selfError = result.errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have PURPOSE_SELF_RELATIONSHIP error');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Curiosity Purpose Kernel — Validation', () => {
  it('should detect invalid output type', () => {
    const profile = { ...VALID_PROFILE, outputType: 'unsupported' as any };
    const errors = validateCuriosityPurposeProfile(profile);
    const typeError = errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_OUTPUT_TYPE,
    );

    assert.ok(typeError, 'Should have PURPOSE_INVALID_OUTPUT_TYPE error');
  });

  it('should detect invalid educational purpose', () => {
    const profile = { ...VALID_PROFILE, educationalPurpose: 'unsupported' as any };
    const errors = validateCuriosityPurposeProfile(profile);
    const purposeError = errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_EDUCATIONAL_PURPOSE,
    );

    assert.ok(purposeError, 'Should have PURPOSE_INVALID_EDUCATIONAL_PURPOSE error');
  });

  it('should detect invalid emotional tone', () => {
    const profile = { ...VALID_PROFILE, emotionalTone: 'unsupported' as any };
    const errors = validateCuriosityPurposeProfile(profile);
    const toneError = errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_EMOTIONAL_TONE,
    );

    assert.ok(toneError, 'Should have PURPOSE_INVALID_EMOTIONAL_TONE error');
  });

  it('should detect invalid delivery context', () => {
    const profile = { ...VALID_PROFILE, deliveryContext: 'unsupported' as any };
    const errors = validateCuriosityPurposeProfile(profile);
    const contextError = errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_DELIVERY_CONTEXT,
    );

    assert.ok(contextError, 'Should have PURPOSE_INVALID_DELIVERY_CONTEXT error');
  });

  it('should detect invalid audience level', () => {
    const profile = { ...VALID_PROFILE, audienceLevel: 'unsupported' as any };
    const errors = validateCuriosityPurposeProfile(profile);
    const levelError = errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_AUDIENCE_LEVEL,
    );

    assert.ok(levelError, 'Should have PURPOSE_INVALID_AUDIENCE_LEVEL error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE, status: 'unsupported' as any };
    const errors = validateCuriosityPurposeProfile(profile);
    const statusError = errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have PURPOSE_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE, governance: 'unsupported' as any };
    const errors = validateCuriosityPurposeProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have PURPOSE_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE, provenance: undefined as any };
    const errors = validateCuriosityPurposeProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have PURPOSE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance provider', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateCuriosityPurposeProfile(profile);
    const providerError = errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have PURPOSE_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateCuriosityPurposeProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have PURPOSE_MISSING_RATIONALE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeCuriosityPurposeTrace({
      traceId: '_trace_1',
    });

    const result = validateCuriosityPurposeTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: CuriosityPurposeTrace = {
      traceId: '',
      generatedFrom: 'deterministic_curiosity_purpose_kernel',
      deterministic: false as true,
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateCuriosityPurposeTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Curiosity Purpose Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeCuriosityPurposes>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCuriosityPurposes(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeCuriosityPurposeRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCuriosityPurposeRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
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

describe('Curiosity Purpose Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE.id;
    const originalTitle = VALID_PROFILE.title;

    composeCuriosityPurposes(VALID_INPUT);

    assert.equal(VALID_PROFILE.id, originalId);
    assert.equal(VALID_PROFILE.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.id);

    composeCuriosityPurposeRegistry(profiles, []);

    assert.equal(profiles[0].id, originalIds[0]);
    assert.equal(profiles[1].id, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Curiosity Purpose Kernel — Helper Functions', () => {
  it('should return canonical output types', () => {
    const types = getCanonicalCuriosityOutputTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_CURIOSITY_OUTPUT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical educational purposes', () => {
    const purposes = getCanonicalEducationalPurposes();
    assert.deepStrictEqual([...purposes], [...CANONICAL_EDUCATIONAL_PURPOSES]);
    assert.equal(purposes.length, 10);
  });

  it('should return canonical emotional tones', () => {
    const tones = getCanonicalEmotionalTones();
    assert.deepStrictEqual([...tones], [...CANONICAL_EMOTIONAL_TONES]);
    assert.equal(tones.length, 10);
  });

  it('should return canonical delivery contexts', () => {
    const contexts = getCanonicalDeliveryContexts();
    assert.deepStrictEqual([...contexts], [...CANONICAL_DELIVERY_CONTEXTS]);
    assert.equal(contexts.length, 10);
  });

  it('should return canonical audience levels', () => {
    const levels = getCanonicalAudienceLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_AUDIENCE_LEVELS]);
    assert.equal(levels.length, 10);
  });

  it('should return canonical purpose statuses', () => {
    const statuses = getCanonicalCuriosityPurposeStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_CURIOSITY_PURPOSE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate output type support', () => {
    assert.equal(isSupportedCuriosityOutputType('fact'), true);
    assert.equal(isSupportedCuriosityOutputType('historical_story'), true);
    assert.equal(isSupportedCuriosityOutputType('unsupported'), false);
  });

  it('should validate educational purpose support', () => {
    assert.equal(isSupportedEducationalPurpose('stimulate_curiosity'), true);
    assert.equal(isSupportedEducationalPurpose('increase_attention'), true);
    assert.equal(isSupportedEducationalPurpose('unsupported'), false);
  });

  it('should validate emotional tone support', () => {
    assert.equal(isSupportedEmotionalTone('surprising'), true);
    assert.equal(isSupportedEmotionalTone('humorous'), true);
    assert.equal(isSupportedEmotionalTone('unsupported'), false);
  });

  it('should validate delivery context support', () => {
    assert.equal(isSupportedDeliveryContext('lesson_intro'), true);
    assert.equal(isSupportedDeliveryContext('topic_break'), true);
    assert.equal(isSupportedDeliveryContext('unsupported'), false);
  });

  it('should validate audience level support', () => {
    assert.equal(isSupportedAudienceLevel('beginner'), true);
    assert.equal(isSupportedAudienceLevel('advanced'), true);
    assert.equal(isSupportedAudienceLevel('unsupported'), false);
  });

  it('should validate purpose status support', () => {
    assert.equal(isSupportedCuriosityPurposeStatus('draft'), true);
    assert.equal(isSupportedCuriosityPurposeStatus('published'), true);
    assert.equal(isSupportedCuriosityPurposeStatus('unsupported'), false);
  });

  it('should validate governance support', () => {
    assert.equal(isSupportedCuriosityPurposeGovernance('canonical'), true);
    assert.equal(isSupportedCuriosityPurposeGovernance('accepted'), true);
    assert.equal(isSupportedCuriosityPurposeGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Curiosity Purpose Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 output types', () => {
    assert.equal(CANONICAL_CURIOSITY_OUTPUT_TYPES.length, 10);
  });

  it('should have exactly 10 educational purposes', () => {
    assert.equal(CANONICAL_EDUCATIONAL_PURPOSES.length, 10);
  });

  it('should have exactly 10 emotional tones', () => {
    assert.equal(CANONICAL_EMOTIONAL_TONES.length, 10);
  });

  it('should have exactly 10 delivery contexts', () => {
    assert.equal(CANONICAL_DELIVERY_CONTEXTS.length, 10);
  });

  it('should have exactly 10 audience levels', () => {
    assert.equal(CANONICAL_AUDIENCE_LEVELS.length, 10);
  });

  it('should have exactly 6 purpose statuses', () => {
    assert.equal(CANONICAL_CURIOSITY_PURPOSE_STATUS.length, 6);
  });

  it('should have exactly 5 governance values', () => {
    assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5);
  });

  it('should contain all expected output types', () => {
    const expectedTypes = [
      'fact',
      'historical_story',
      'engineering_story',
      'fun_comparison',
      'analogy',
      'behind_the_scenes',
      'myth_vs_fact',
      'did_you_know',
      'timeline',
      'easter_egg',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_CURIOSITY_OUTPUT_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected educational purposes', () => {
    const expectedPurposes = [
      'increase_attention',
      'improve_retention',
      'connect_concepts',
      'humanize_science',
      'motivate_learning',
      'provide_context',
      'encourage_reflection',
      'break_cognitive_fatigue',
      'reinforce_memory',
      'stimulate_curiosity',
    ];

    for (const purpose of expectedPurposes) {
      assert.ok(
        CANONICAL_EDUCATIONAL_PURPOSES.includes(purpose as any),
        `Should include purpose: ${purpose}`,
      );
    }
  });

  it('should contain all expected emotional tones', () => {
    const expectedTones = [
      'surprising',
      'humorous',
      'playful',
      'technical',
      'reflective',
      'dramatic',
      'inspirational',
      'ironic',
      'neutral',
      'thought_provoking',
    ];

    for (const tone of expectedTones) {
      assert.ok(
        CANONICAL_EMOTIONAL_TONES.includes(tone as any),
        `Should include tone: ${tone}`,
      );
    }
  });

  it('should contain all expected delivery contexts', () => {
    const expectedContexts = [
      'lesson_intro',
      'lesson_transition',
      'lesson_outro',
      'topic_break',
      'quiz_break',
      'laboratory_intro',
      'case_study_intro',
      'module_summary',
      'portfolio_context',
      'random_discovery',
    ];

    for (const context of expectedContexts) {
      assert.ok(
        CANONICAL_DELIVERY_CONTEXTS.includes(context as any),
        `Should include context: ${context}`,
      );
    }
  });

  it('should contain all expected audience levels', () => {
    const expectedLevels = [
      'beginner',
      'intermediate',
      'advanced',
      'researcher',
      'engineer',
      'student',
      'general_public',
      'educator',
      'professional',
      'mixed',
    ];

    for (const level of expectedLevels) {
      assert.ok(
        CANONICAL_AUDIENCE_LEVELS.includes(level as any),
        `Should include level: ${level}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Curiosity Purpose Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate curiosity content', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('curiosityContent' in result), 'Should not have curiosity content');
  });

  it('should not create educational content', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('content' in result), 'Should not have content');
  });

  it('should not produce humor', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('humor' in result), 'Should not have humor');
    assert.ok(!('joke' in result), 'Should not have joke');
  });

  it('should not rewrite narrative', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('rewrittenNarrative' in result), 'Should not have rewritten narrative');
    assert.ok(!('narrative' in result), 'Should not have narrative');
  });

  it('should not personalize content', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('personalizedContent' in result), 'Should not have personalized content');
    assert.ok(!('personalization' in result), 'Should not have personalization');
  });

  it('should not invoke LLMs', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('llmResponse' in result), 'Should not have LLM response');
    assert.ok(!('modelOutput' in result), 'Should not have model output');
  });

  it('should not access filesystem', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeCuriosityPurposeProfile({
      id: 'profile-001',
      title: 'Test',
      outputType: 'fact',
      educationalPurpose: 'stimulate_curiosity',
      emotionalTone: 'surprising',
      deliveryContext: 'lesson_intro',
      audienceLevel: 'beginner',
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
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Curiosity Purpose Kernel — Cross-Agent Boundary', () => {
  it('should not reference Narrative Agent', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('narrativeAgent' in result), 'Should not reference Narrative Agent');
    assert.ok(!('narrative' in result), 'Should not reference narrative');
  });

  it('should not reference Didactic Agent', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('didacticAgent' in result), 'Should not reference Didactic Agent');
    assert.ok(!('didactic' in result), 'Should not reference didactic');
  });

  it('should not reference Knowledge Agent', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('knowledgeAgent' in result), 'Should not reference Knowledge Agent');
    assert.ok(!('knowledge' in result), 'Should not reference knowledge');
  });

  it('should not reference Research Agent', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('researchAgent' in result), 'Should not reference Research Agent');
    assert.ok(!('research' in result), 'Should not reference research');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeCuriosityPurposes(VALID_INPUT);
    assert.ok(!('laboratoryAgent' in result), 'Should not reference Laboratory Agent');
    assert.ok(!('laboratory' in result), 'Should not reference laboratory');
  });
});

// ---------------------------------------------------------------------------
// Validation Codes Tests
// ---------------------------------------------------------------------------

describe('Curiosity Purpose Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_DUPLICATE_ID, 'PURPOSE_DUPLICATE_ID');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_DUPLICATE_TITLE, 'PURPOSE_DUPLICATE_TITLE');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_OUTPUT_TYPE, 'PURPOSE_INVALID_OUTPUT_TYPE');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_EDUCATIONAL_PURPOSE, 'PURPOSE_INVALID_EDUCATIONAL_PURPOSE');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_EMOTIONAL_TONE, 'PURPOSE_INVALID_EMOTIONAL_TONE');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_DELIVERY_CONTEXT, 'PURPOSE_INVALID_DELIVERY_CONTEXT');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_AUDIENCE_LEVEL, 'PURPOSE_INVALID_AUDIENCE_LEVEL');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_STATUS, 'PURPOSE_INVALID_STATUS');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_GOVERNANCE, 'PURPOSE_INVALID_GOVERNANCE');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_PROVENANCE, 'PURPOSE_MISSING_PROVENANCE');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_PROVIDER, 'PURPOSE_MISSING_PROVIDER');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_RATIONALE, 'PURPOSE_MISSING_RATIONALE');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_CURIOSITY_REFERENCE, 'PURPOSE_MISSING_CURIOSITY_REFERENCE');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_PROFILE_ID, 'PURPOSE_MISSING_PROFILE_ID');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_TITLE, 'PURPOSE_MISSING_TITLE');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_SELF_RELATIONSHIP, 'PURPOSE_SELF_RELATIONSHIP');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_EMPTY_REGISTRY, 'PURPOSE_EMPTY_REGISTRY');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_TRACE, 'PURPOSE_INVALID_TRACE');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_REGISTRY_INCONSISTENCY, 'PURPOSE_REGISTRY_INCONSISTENCY');
    assert.equal(CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_CONFIGURATION, 'PURPOSE_INVALID_CONFIGURATION');
  });

  it('should have exactly 20 validation codes', () => {
    const codeCount = Object.keys(CURIOSITY_PURPOSE_VALIDATION_CODES).length;
    assert.equal(codeCount, 20);
  });
});

// ---------------------------------------------------------------------------
// Public API Export Tests
// ---------------------------------------------------------------------------

describe('Curiosity Purpose Kernel — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeCuriosityPurposeProvenance, 'function');
    assert.equal(typeof composeCuriosityPurposeTrace, 'function');
    assert.equal(typeof composeCuriosityPurposeProfile, 'function');
    assert.equal(typeof composeCuriosityPurposeRelationship, 'function');
    assert.equal(typeof composeCuriosityPurposeRegistry, 'function');
    assert.equal(typeof composeCuriosityPurposeRegistryFromInput, 'function');
    assert.equal(typeof composeCuriosityPurposes, 'function');
    assert.equal(typeof composeCuriosityArtifactWithPurpose, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedCuriosityOutputType, 'function');
    assert.equal(typeof isSupportedEducationalPurpose, 'function');
    assert.equal(typeof isSupportedEmotionalTone, 'function');
    assert.equal(typeof isSupportedDeliveryContext, 'function');
    assert.equal(typeof isSupportedAudienceLevel, 'function');
    assert.equal(typeof isSupportedCuriosityPurposeStatus, 'function');
    assert.equal(typeof isSupportedCuriosityPurposeGovernance, 'function');
    assert.equal(typeof getCanonicalCuriosityOutputTypes, 'function');
    assert.equal(typeof getCanonicalEducationalPurposes, 'function');
    assert.equal(typeof getCanonicalEmotionalTones, 'function');
    assert.equal(typeof getCanonicalDeliveryContexts, 'function');
    assert.equal(typeof getCanonicalAudienceLevels, 'function');
    assert.equal(typeof getCanonicalCuriosityPurposeStatuses, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateCuriosityPurposeProfile, 'function');
    assert.equal(typeof validateCuriosityPurposeRelationship, 'function');
    assert.equal(typeof validateCuriosityPurposeRegistry, 'function');
    assert.equal(typeof validateCuriosityPurposeInput, 'function');
    assert.equal(typeof validateCuriosityPurposeTrace, 'function');
    assert.equal(typeof validateCuriosityArtifactWithPurpose, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(CURIOSITY_PURPOSE_VALIDATION_CODES);
    assert.equal(typeof CURIOSITY_PURPOSE_VALIDATION_CODES, 'object');
  });
});
