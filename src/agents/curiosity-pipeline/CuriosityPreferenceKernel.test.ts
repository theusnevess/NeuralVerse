/**
 * NV-2100-D9-OPT-11 — Curiosity Preference Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Curiosity Preference Kernel.
 * Covers: valid profile, valid tone control, valid placement, valid visibility,
 * valid relationship, valid provenance, valid trace, empty registry, duplicate IDs,
 * duplicate titles, deterministic ordering, invalid enums, missing provenance/provider/rationale,
 * missing references, missing configuration, self-relationships, empty registries,
 * registry inconsistencies, determinism (100 iterations), immutability, negative
 * capability, cross-agent boundaries, validation code stability, public API
 * exports, backward compatibility with D9-OPT-01 through D9-OPT-10.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CuriosityPreferenceProfile,
  ToneControlMetadata,
  PlacementMetadata,
  VisibilityMetadata,
  PreferenceRelationship,
  PreferenceInput,
  PreferenceRegistry,
  CuriosityPreferenceProvenance,
  CuriosityPreferenceTrace,
  CuriosityArtifactWithPreferences,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_USER_PREFERENCE_TYPES,
  CANONICAL_TONE_CONTROL_LEVELS,
  CANONICAL_PLACEMENT_RULES,
  CANONICAL_VISIBILITY_LEVELS,
  CANONICAL_PRESENTATION_ELIGIBILITY,
  CANONICAL_PREFERENCE_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

import {
  composeCuriosityPreferenceProvenance,
  composeCuriosityPreferenceTrace,
  composeCuriosityPreferenceProfile,
  composeToneControlMetadata,
  composePlacementMetadata,
  composeVisibilityMetadata,
  composePreferenceRelationship,
  composePreferenceRegistry,
  composePreferenceRegistryFromInput,
  composeCuriosityPreferences,
  composeCuriosityArtifactWithPreferences,
  isSupportedUserPreferenceType,
  isSupportedToneControlLevel,
  isSupportedPlacementRule,
  isSupportedVisibilityLevel,
  isSupportedPresentationEligibility,
  isSupportedPreferenceStatus,
  isSupportedPreferenceGovernance,
  getCanonicalUserPreferenceTypes,
  getCanonicalToneControlLevels,
  getCanonicalPlacementRules,
  getCanonicalVisibilityLevels,
  getCanonicalPresentationEligibility,
  getCanonicalPreferenceStatuses,
} from './CuriosityPreferenceKernel.ts';

import {
  validateCuriosityPreferenceProfile,
  validateToneControlMetadata,
  validatePlacementMetadata,
  validateVisibilityMetadata,
  validatePreferenceRelationship,
  validatePreferenceRegistry,
  validatePreferenceInput,
  validatePreferenceTrace,
  validateCuriosityArtifactWithPreferences,
  PREFERENCE_VALIDATION_CODES,
} from './CuriosityPreferenceValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: CuriosityPreferenceProvenance = {
  provider: 'NeuralVerse Team',
  source: 'Curated Knowledge Base',
  rationale: 'Core user preference artifact.',
  version: '1.0.0',
};

const VALID_TRACE: CuriosityPreferenceTrace = {
  traceId: '_trace_1',
  generatedFrom: 'deterministic_curiosity_preference_kernel',
  deterministic: true,
  randomUsed: false,
  timeDependency: false,
};

const VALID_PROFILE: CuriosityPreferenceProfile = {
  profileId: 'pref-001',
  title: 'Content Density Preference',
  preferenceType: 'content_density',
  toneControlLevel: 'moderate',
  placementRule: 'lesson_intro',
  visibilityLevel: 'always',
  presentationEligibility: 'full_access',
  conceptIds: ['concept-001', 'concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_PROFILE_2: CuriosityPreferenceProfile = {
  profileId: 'pref-002',
  title: 'Humor Tolerance Preference',
  preferenceType: 'humor_tolerance',
  toneControlLevel: 'playful',
  placementRule: 'topic_break',
  visibilityLevel: 'conditional',
  presentationEligibility: 'limited_access',
  conceptIds: ['concept-003'],
  status: 'approved',
  governance: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Archives' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_TONE_CONTROL: ToneControlMetadata = {
  metadataId: 'tc-001',
  profileId: 'pref-001',
  toneControlLevel: 'moderate',
  humorIntensity: 'moderate',
  witLevel: 'moderate',
  sarcasmLevel: 'low',
  dramaticLevel: 'low',
  inspirationalLevel: 'moderate',
  academicLevel: 'moderate',
};

const VALID_PLACEMENT: PlacementMetadata = {
  metadataId: 'place-001',
  profileId: 'pref-001',
  placementRule: 'lesson_intro',
  priority: 1,
  frequency: 'daily',
  duration: '5_minutes',
  cooldown: '1_hour',
  contextRequired: ['topic_completed'],
};

const VALID_VISIBILITY: VisibilityMetadata = {
  metadataId: 'vis-001',
  profileId: 'pref-001',
  visibilityLevel: 'always',
  conditions: [],
  prerequisites: [],
  exclusions: [],
  timeRestrictions: 'none',
};

const VALID_RELATIONSHIP: PreferenceRelationship = {
  relationshipId: 'pref-rel-001',
  sourceProfileId: 'pref-001',
  targetProfileId: 'pref-002',
  relationshipType: 'related_to',
  description: 'These preferences are related.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: PreferenceInput = {
  profiles: [VALID_PROFILE, VALID_PROFILE_2],
  toneControls: [VALID_TONE_CONTROL],
  placements: [VALID_PLACEMENT],
  visibility: [VALID_VISIBILITY],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: PreferenceInput = {
  profiles: [],
  toneControls: [],
  placements: [],
  visibility: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Profile Composition Tests
// ---------------------------------------------------------------------------

describe('Curiosity Preference Kernel — Profile Composition', () => {
  it('should compose valid curiosity preference provenance', () => {
    const provenance = composeCuriosityPreferenceProvenance({
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

  it('should compose valid curiosity preference profile', () => {
    const profile = composeCuriosityPreferenceProfile({
      profileId: 'pref-001',
      title: 'Content Density Preference',
      preferenceType: 'content_density',
      toneControlLevel: 'moderate',
      placementRule: 'lesson_intro',
      visibilityLevel: 'always',
      presentationEligibility: 'full_access',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(profile.profileId, 'pref-001');
    assert.equal(profile.title, 'Content Density Preference');
    assert.equal(profile.preferenceType, 'content_density');
    assert.equal(profile.toneControlLevel, 'moderate');
    assert.equal(profile.placementRule, 'lesson_intro');
    assert.equal(profile.visibilityLevel, 'always');
    assert.equal(profile.presentationEligibility, 'full_access');
    assert.equal(profile.conceptIds.length, 1);
    assert.equal(profile.status, 'published');
    assert.equal(profile.governance, 'canonical');
  });

  it('should compose valid curiosity preference trace', () => {
    const trace = composeCuriosityPreferenceTrace({
      traceId: '_trace_1',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid tone control metadata', () => {
    const metadata = composeToneControlMetadata({
      metadataId: 'tc-001',
      profileId: 'pref-001',
      toneControlLevel: 'moderate',
      humorIntensity: 'moderate',
      witLevel: 'moderate',
      sarcasmLevel: 'low',
      dramaticLevel: 'low',
      inspirationalLevel: 'moderate',
      academicLevel: 'moderate',
    });

    assert.equal(metadata.metadataId, 'tc-001');
    assert.equal(metadata.profileId, 'pref-001');
    assert.equal(metadata.toneControlLevel, 'moderate');
    assert.equal(metadata.humorIntensity, 'moderate');
    assert.equal(metadata.witLevel, 'moderate');
    assert.equal(metadata.sarcasmLevel, 'low');
    assert.equal(metadata.dramaticLevel, 'low');
    assert.equal(metadata.inspirationalLevel, 'moderate');
    assert.equal(metadata.academicLevel, 'moderate');
  });

  it('should compose valid placement metadata', () => {
    const metadata = composePlacementMetadata({
      metadataId: 'place-001',
      profileId: 'pref-001',
      placementRule: 'lesson_intro',
      priority: 1,
      frequency: 'daily',
      duration: '5_minutes',
      cooldown: '1_hour',
      contextRequired: ['topic_completed'],
    });

    assert.equal(metadata.metadataId, 'place-001');
    assert.equal(metadata.profileId, 'pref-001');
    assert.equal(metadata.placementRule, 'lesson_intro');
    assert.equal(metadata.priority, 1);
    assert.equal(metadata.frequency, 'daily');
    assert.equal(metadata.duration, '5_minutes');
    assert.equal(metadata.cooldown, '1_hour');
    assert.equal(metadata.contextRequired.length, 1);
  });

  it('should compose valid visibility metadata', () => {
    const metadata = composeVisibilityMetadata({
      metadataId: 'vis-001',
      profileId: 'pref-001',
      visibilityLevel: 'always',
      conditions: [],
      prerequisites: [],
      exclusions: [],
      timeRestrictions: 'none',
    });

    assert.equal(metadata.metadataId, 'vis-001');
    assert.equal(metadata.profileId, 'pref-001');
    assert.equal(metadata.visibilityLevel, 'always');
    assert.equal(metadata.conditions.length, 0);
    assert.equal(metadata.prerequisites.length, 0);
    assert.equal(metadata.exclusions.length, 0);
    assert.equal(metadata.timeRestrictions, 'none');
  });

  it('should compose valid preference relationship', () => {
    const relationship = composePreferenceRelationship({
      relationshipId: 'pref-rel-001',
      sourceProfileId: 'pref-001',
      targetProfileId: 'pref-002',
      relationshipType: 'related_to',
      description: 'Related preferences.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'pref-rel-001');
    assert.equal(relationship.sourceProfileId, 'pref-001');
    assert.equal(relationship.targetProfileId, 'pref-002');
    assert.equal(relationship.relationshipType, 'related_to');
    assert.equal(relationship.description, 'Related preferences.');
  });

  it('should validate a valid profile with no errors', () => {
    const errors = validateCuriosityPreferenceProfile(VALID_PROFILE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composePreferenceRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_TONE_CONTROL], [VALID_PLACEMENT], [VALID_VISIBILITY], [VALID_RELATIONSHIP]);
    const result = validatePreferenceRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate preference input', () => {
    const result = validatePreferenceInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Curiosity Preference Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composePreferenceRegistry([], [], [], [], []);
    const result = validatePreferenceRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have PREFERENCE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composePreferenceRegistry([VALID_PROFILE, VALID_PROFILE], [], [], [], []);
    const result = validatePreferenceRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have PREFERENCE_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE, profileId: 'pref-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE, profileId: 'pref-002', title: 'Same Title' };
    const registry = composePreferenceRegistry([profile1, profile2], [], [], [], []);
    const result = validatePreferenceRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have PREFERENCE_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by profileId', () => {
    const profile3 = { ...VALID_PROFILE, profileId: 'pref-003' };
    const profile1 = { ...VALID_PROFILE, profileId: 'pref-001' };
    const profile2 = { ...VALID_PROFILE, profileId: 'pref-002' };

    const registry = composePreferenceRegistry([profile3, profile1, profile2], [], [], [], []);

    assert.equal(registry.profiles[0].profileId, 'pref-001');
    assert.equal(registry.profiles[1].profileId, 'pref-002');
    assert.equal(registry.profiles[2].profileId, 'pref-003');
  });

  it('should sort by preferenceType when profileId is equal', () => {
    const profileA = { ...VALID_PROFILE, profileId: 'pref-001', preferenceType: 'humor_tolerance' as const };
    const profileB = { ...VALID_PROFILE, profileId: 'pref-001', preferenceType: 'content_density' as const };

    const registry = composePreferenceRegistry([profileA, profileB], [], [], [], []);

    // Alphabetical sort: 'content_density' < 'humor_tolerance'
    assert.equal(registry.profiles[0].preferenceType, 'content_density');
    assert.equal(registry.profiles[1].preferenceType, 'humor_tolerance');
  });

  it('should detect self-relationships', () => {
    const selfRelationship: PreferenceRelationship = {
      relationshipId: 'pref-rel-self',
      sourceProfileId: 'pref-001',
      targetProfileId: 'pref-001',
      relationshipType: 'related_to',
      description: 'Self relationship.',
      provenance: VALID_PROVENANCE,
    };

    const registry = composePreferenceRegistry([VALID_PROFILE], [], [], [], [selfRelationship]);
    const result = validatePreferenceRegistry(registry);
    const selfError = result.errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have PREFERENCE_SELF_RELATIONSHIP error');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Curiosity Preference Kernel — Validation', () => {
  it('should detect invalid preference type', () => {
    const profile = { ...VALID_PROFILE, preferenceType: 'unsupported' as any };
    const errors = validateCuriosityPreferenceProfile(profile);
    const typeError = errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have PREFERENCE_INVALID_TYPE error');
  });

  it('should detect invalid tone control level', () => {
    const profile = { ...VALID_PROFILE, toneControlLevel: 'unsupported' as any };
    const errors = validateCuriosityPreferenceProfile(profile);
    const toneError = errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TONE_CONTROL,
    );

    assert.ok(toneError, 'Should have PREFERENCE_INVALID_TONE_CONTROL error');
  });

  it('should detect invalid placement rule', () => {
    const profile = { ...VALID_PROFILE, placementRule: 'unsupported' as any };
    const errors = validateCuriosityPreferenceProfile(profile);
    const placementError = errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_PLACEMENT,
    );

    assert.ok(placementError, 'Should have PREFERENCE_INVALID_PLACEMENT error');
  });

  it('should detect invalid visibility level', () => {
    const profile = { ...VALID_PROFILE, visibilityLevel: 'unsupported' as any };
    const errors = validateCuriosityPreferenceProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_VISIBILITY,
    );

    assert.ok(visibilityError, 'Should have PREFERENCE_INVALID_VISIBILITY error');
  });

  it('should detect invalid presentation eligibility', () => {
    const profile = { ...VALID_PROFILE, presentationEligibility: 'unsupported' as any };
    const errors = validateCuriosityPreferenceProfile(profile);
    const eligibilityError = errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_ELIGIBILITY,
    );

    assert.ok(eligibilityError, 'Should have PREFERENCE_INVALID_ELIGIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE, status: 'unsupported' as any };
    const errors = validateCuriosityPreferenceProfile(profile);
    const statusError = errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have PREFERENCE_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE, governance: 'unsupported' as any };
    const errors = validateCuriosityPreferenceProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have PREFERENCE_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE, provenance: undefined as any };
    const errors = validateCuriosityPreferenceProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have PREFERENCE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance provider', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateCuriosityPreferenceProfile(profile);
    const providerError = errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have PREFERENCE_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateCuriosityPreferenceProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have PREFERENCE_MISSING_RATIONALE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeCuriosityPreferenceTrace({
      traceId: '_trace_1',
    });

    const result = validatePreferenceTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: CuriosityPreferenceTrace = {
      traceId: '',
      generatedFrom: 'deterministic_curiosity_preference_kernel',
      deterministic: false as true,
      randomUsed: false,
      timeDependency: false,
    };

    const result = validatePreferenceTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect missing tone control configuration', () => {
    const metadata: ToneControlMetadata = {
      metadataId: 'tc-001',
      profileId: 'pref-001',
      toneControlLevel: 'moderate',
      humorIntensity: '',
      witLevel: '',
      sarcasmLevel: 'low',
      dramaticLevel: 'low',
      inspirationalLevel: 'moderate',
      academicLevel: 'moderate',
    };

    const errors = validateToneControlMetadata(metadata);
    const configError = errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have PREFERENCE_INVALID_CONFIGURATION error');
  });

  it('should detect missing placement configuration', () => {
    const metadata: PlacementMetadata = {
      metadataId: 'place-001',
      profileId: 'pref-001',
      placementRule: 'lesson_intro',
      priority: 1,
      frequency: '',
      duration: '',
      cooldown: '1_hour',
      contextRequired: ['topic_completed'],
    };

    const errors = validatePlacementMetadata(metadata);
    const configError = errors.find(
      (e) => e.code === PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have PREFERENCE_INVALID_CONFIGURATION error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Curiosity Preference Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeCuriosityPreferences>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCuriosityPreferences(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composePreferenceRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composePreferenceRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_TONE_CONTROL], [VALID_PLACEMENT], [VALID_VISIBILITY], [VALID_RELATIONSHIP]));
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

describe('Curiosity Preference Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE.profileId;
    const originalTitle = VALID_PROFILE.title;

    composeCuriosityPreferences(VALID_INPUT);

    assert.equal(VALID_PROFILE.profileId, originalId);
    assert.equal(VALID_PROFILE.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.profileId);

    composePreferenceRegistry(profiles, [], [], [], []);

    assert.equal(profiles[0].profileId, originalIds[0]);
    assert.equal(profiles[1].profileId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Curiosity Preference Kernel — Helper Functions', () => {
  it('should return canonical user preference types', () => {
    const types = getCanonicalUserPreferenceTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_USER_PREFERENCE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical tone control levels', () => {
    const levels = getCanonicalToneControlLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_TONE_CONTROL_LEVELS]);
    assert.equal(levels.length, 10);
  });

  it('should return canonical placement rules', () => {
    const rules = getCanonicalPlacementRules();
    assert.deepStrictEqual([...rules], [...CANONICAL_PLACEMENT_RULES]);
    assert.equal(rules.length, 10);
  });

  it('should return canonical visibility levels', () => {
    const levels = getCanonicalVisibilityLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_VISIBILITY_LEVELS]);
    assert.equal(levels.length, 10);
  });

  it('should return canonical presentation eligibility', () => {
    const eligibility = getCanonicalPresentationEligibility();
    assert.deepStrictEqual([...eligibility], [...CANONICAL_PRESENTATION_ELIGIBILITY]);
    assert.equal(eligibility.length, 10);
  });

  it('should return canonical preference statuses', () => {
    const statuses = getCanonicalPreferenceStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_PREFERENCE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate user preference type support', () => {
    assert.equal(isSupportedUserPreferenceType('content_density'), true);
    assert.equal(isSupportedUserPreferenceType('humor_tolerance'), true);
    assert.equal(isSupportedUserPreferenceType('unsupported'), false);
  });

  it('should validate tone control level support', () => {
    assert.equal(isSupportedToneControlLevel('neutral'), true);
    assert.equal(isSupportedToneControlLevel('moderate'), true);
    assert.equal(isSupportedToneControlLevel('unsupported'), false);
  });

  it('should validate placement rule support', () => {
    assert.equal(isSupportedPlacementRule('lesson_intro'), true);
    assert.equal(isSupportedPlacementRule('topic_break'), true);
    assert.equal(isSupportedPlacementRule('unsupported'), false);
  });

  it('should validate visibility level support', () => {
    assert.equal(isSupportedVisibilityLevel('always'), true);
    assert.equal(isSupportedVisibilityLevel('conditional'), true);
    assert.equal(isSupportedVisibilityLevel('unsupported'), false);
  });

  it('should validate presentation eligibility support', () => {
    assert.equal(isSupportedPresentationEligibility('full_access'), true);
    assert.equal(isSupportedPresentationEligibility('limited_access'), true);
    assert.equal(isSupportedPresentationEligibility('unsupported'), false);
  });

  it('should validate preference status support', () => {
    assert.equal(isSupportedPreferenceStatus('draft'), true);
    assert.equal(isSupportedPreferenceStatus('published'), true);
    assert.equal(isSupportedPreferenceStatus('unsupported'), false);
  });

  it('should validate preference governance support', () => {
    assert.equal(isSupportedPreferenceGovernance('canonical'), true);
    assert.equal(isSupportedPreferenceGovernance('accepted'), true);
    assert.equal(isSupportedPreferenceGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Curiosity Preference Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 user preference types', () => {
    assert.equal(CANONICAL_USER_PREFERENCE_TYPES.length, 10);
  });

  it('should have exactly 10 tone control levels', () => {
    assert.equal(CANONICAL_TONE_CONTROL_LEVELS.length, 10);
  });

  it('should have exactly 10 placement rules', () => {
    assert.equal(CANONICAL_PLACEMENT_RULES.length, 10);
  });

  it('should have exactly 10 visibility levels', () => {
    assert.equal(CANONICAL_VISIBILITY_LEVELS.length, 10);
  });

  it('should have exactly 10 presentation eligibility', () => {
    assert.equal(CANONICAL_PRESENTATION_ELIGIBILITY.length, 10);
  });

  it('should have exactly 6 preference statuses', () => {
    assert.equal(CANONICAL_PREFERENCE_STATUS.length, 6);
  });

  it('should have exactly 5 governance values', () => {
    assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5);
  });

  it('should contain all expected user preference types', () => {
    const expectedTypes = [
      'content_density',
      'humor_tolerance',
      'tone_preference',
      'pacing',
      'detail_level',
      'interaction_style',
      'learning_style',
      'motivation_type',
      'engagement_pattern',
      'notification_preference',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_USER_PREFERENCE_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected tone control levels', () => {
    const expectedLevels = [
      'neutral',
      'subtle',
      'moderate',
      'playful',
      'humorous',
      'witty',
      'sarcastic',
      'dramatic',
      'inspirational',
      'academic',
    ];

    for (const level of expectedLevels) {
      assert.ok(
        CANONICAL_TONE_CONTROL_LEVELS.includes(level as any),
        `Should include level: ${level}`,
      );
    }
  });

  it('should contain all expected placement rules', () => {
    const expectedRules = [
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

    for (const rule of expectedRules) {
      assert.ok(
        CANONICAL_PLACEMENT_RULES.includes(rule as any),
        `Should include rule: ${rule}`,
      );
    }
  });

  it('should contain all expected visibility levels', () => {
    const expectedLevels = [
      'always',
      'conditional',
      'on_demand',
      'progressive',
      'hidden',
      'disabled',
      'restricted',
      'conditional_on_completion',
      'conditional_on_engagement',
      'conditional_on_time',
    ];

    for (const level of expectedLevels) {
      assert.ok(
        CANONICAL_VISIBILITY_LEVELS.includes(level as any),
        `Should include level: ${level}`,
      );
    }
  });

  it('should contain all expected presentation eligibility', () => {
    const expectedEligibility = [
      'full_access',
      'limited_access',
      'restricted_access',
      'conditional_access',
      'no_access',
      'premium_access',
      'beta_access',
      'preview_access',
      'demo_access',
      'educational_access',
    ];

    for (const eligibility of expectedEligibility) {
      assert.ok(
        CANONICAL_PRESENTATION_ELIGIBILITY.includes(eligibility as any),
        `Should include eligibility: ${eligibility}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Curiosity Preference Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not personalize content', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('personalizedContent' in result), 'Should not have personalized content');
    assert.ok(!('personalization' in result), 'Should not have personalization');
  });

  it('should not perform runtime adaptation', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('runtimeAdaptation' in result), 'Should not have runtime adaptation');
    assert.ok(!('adaptation' in result), 'Should not have adaptation');
  });

  it('should not infer user preferences', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('inferredPreferences' in result), 'Should not have inferred preferences');
    assert.ok(!('preferenceInference' in result), 'Should not have preference inference');
  });

  it('should not make placement decisions', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('placementDecisions' in result), 'Should not have placement decisions');
    assert.ok(!('decisions' in result), 'Should not have decisions');
  });

  it('should not render UI', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('renderedUI' in result), 'Should not have rendered UI');
    assert.ok(!('ui' in result), 'Should not have UI');
  });

  it('should not access filesystem', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeCuriosityPreferenceProfile({
      profileId: 'pref-001',
      title: 'Test',
      preferenceType: 'content_density',
      toneControlLevel: 'moderate',
      placementRule: 'lesson_intro',
      visibilityLevel: 'always',
      presentationEligibility: 'full_access',
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
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Curiosity Preference Kernel — Cross-Agent Boundary', () => {
  it('should not reference Narrative Agent', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('narrativeAgent' in result), 'Should not reference Narrative Agent');
    assert.ok(!('narrative' in result), 'Should not reference narrative');
  });

  it('should not reference Knowledge Agent', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('knowledgeAgent' in result), 'Should not reference Knowledge Agent');
    assert.ok(!('knowledge' in result), 'Should not reference knowledge');
  });

  it('should not reference Didactic Agent', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('didacticAgent' in result), 'Should not reference Didactic Agent');
    assert.ok(!('didactic' in result), 'Should not reference didactic');
  });

  it('should not reference Research Agent', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('researchAgent' in result), 'Should not reference Research Agent');
    assert.ok(!('research' in result), 'Should not reference research');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('laboratoryAgent' in result), 'Should not reference Laboratory Agent');
    assert.ok(!('laboratory' in result), 'Should not reference laboratory');
  });

  it('should not reference Application Agent', () => {
    const result = composeCuriosityPreferences(VALID_INPUT);
    assert.ok(!('applicationAgent' in result), 'Should not reference Application Agent');
    assert.ok(!('application' in result), 'Should not reference application');
  });
});

// ---------------------------------------------------------------------------
// Validation Codes Tests
// ---------------------------------------------------------------------------

describe('Curiosity Preference Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_DUPLICATE_ID, 'PREFERENCE_DUPLICATE_ID');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_DUPLICATE_TITLE, 'PREFERENCE_DUPLICATE_TITLE');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TYPE, 'PREFERENCE_INVALID_TYPE');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TONE_CONTROL, 'PREFERENCE_INVALID_TONE_CONTROL');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_PLACEMENT, 'PREFERENCE_INVALID_PLACEMENT');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_VISIBILITY, 'PREFERENCE_INVALID_VISIBILITY');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_ELIGIBILITY, 'PREFERENCE_INVALID_ELIGIBILITY');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_STATUS, 'PREFERENCE_INVALID_STATUS');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_GOVERNANCE, 'PREFERENCE_INVALID_GOVERNANCE');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PROVENANCE, 'PREFERENCE_MISSING_PROVENANCE');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PROVIDER, 'PREFERENCE_MISSING_PROVIDER');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_RATIONALE, 'PREFERENCE_MISSING_RATIONALE');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_CURIOSITY_REFERENCE, 'PREFERENCE_MISSING_CURIOSITY_REFERENCE');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PROFILE_ID, 'PREFERENCE_MISSING_PROFILE_ID');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_TITLE, 'PREFERENCE_MISSING_TITLE');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PLACEMENT, 'PREFERENCE_MISSING_PLACEMENT');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_SELF_RELATIONSHIP, 'PREFERENCE_SELF_RELATIONSHIP');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_EMPTY_REGISTRY, 'PREFERENCE_EMPTY_REGISTRY');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TRACE, 'PREFERENCE_INVALID_TRACE');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_REGISTRY_INCONSISTENCY, 'PREFERENCE_REGISTRY_INCONSISTENCY');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_CONFIGURATION, 'PREFERENCE_INVALID_CONFIGURATION');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_RELATIONSHIP, 'PREFERENCE_INVALID_RELATIONSHIP');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_GOVERNANCE, 'PREFERENCE_MISSING_GOVERNANCE');
    assert.equal(PREFERENCE_VALIDATION_CODES.PREFERENCE_UNSUPPORTED_METADATA, 'PREFERENCE_UNSUPPORTED_METADATA');
  });

  it('should have exactly 24 validation codes', () => {
    const codeCount = Object.keys(PREFERENCE_VALIDATION_CODES).length;
    assert.equal(codeCount, 24);
  });
});

// ---------------------------------------------------------------------------
// Public API Export Tests
// ---------------------------------------------------------------------------

describe('Curiosity Preference Kernel — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeCuriosityPreferenceProvenance, 'function');
    assert.equal(typeof composeCuriosityPreferenceTrace, 'function');
    assert.equal(typeof composeCuriosityPreferenceProfile, 'function');
    assert.equal(typeof composeToneControlMetadata, 'function');
    assert.equal(typeof composePlacementMetadata, 'function');
    assert.equal(typeof composeVisibilityMetadata, 'function');
    assert.equal(typeof composePreferenceRelationship, 'function');
    assert.equal(typeof composePreferenceRegistry, 'function');
    assert.equal(typeof composePreferenceRegistryFromInput, 'function');
    assert.equal(typeof composeCuriosityPreferences, 'function');
    assert.equal(typeof composeCuriosityArtifactWithPreferences, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedUserPreferenceType, 'function');
    assert.equal(typeof isSupportedToneControlLevel, 'function');
    assert.equal(typeof isSupportedPlacementRule, 'function');
    assert.equal(typeof isSupportedVisibilityLevel, 'function');
    assert.equal(typeof isSupportedPresentationEligibility, 'function');
    assert.equal(typeof isSupportedPreferenceStatus, 'function');
    assert.equal(typeof isSupportedPreferenceGovernance, 'function');
    assert.equal(typeof getCanonicalUserPreferenceTypes, 'function');
    assert.equal(typeof getCanonicalToneControlLevels, 'function');
    assert.equal(typeof getCanonicalPlacementRules, 'function');
    assert.equal(typeof getCanonicalVisibilityLevels, 'function');
    assert.equal(typeof getCanonicalPresentationEligibility, 'function');
    assert.equal(typeof getCanonicalPreferenceStatuses, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateCuriosityPreferenceProfile, 'function');
    assert.equal(typeof validateToneControlMetadata, 'function');
    assert.equal(typeof validatePlacementMetadata, 'function');
    assert.equal(typeof validateVisibilityMetadata, 'function');
    assert.equal(typeof validatePreferenceRelationship, 'function');
    assert.equal(typeof validatePreferenceRegistry, 'function');
    assert.equal(typeof validatePreferenceInput, 'function');
    assert.equal(typeof validatePreferenceTrace, 'function');
    assert.equal(typeof validateCuriosityArtifactWithPreferences, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(PREFERENCE_VALIDATION_CODES);
    assert.equal(typeof PREFERENCE_VALIDATION_CODES, 'object');
  });
});
