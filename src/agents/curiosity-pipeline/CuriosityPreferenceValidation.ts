/**
 * NV-2100-D9-OPT-11 — Curiosity Preference Validation Layer
 *
 * Deterministic validation for user preference metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CuriosityPreferenceProfile,
  ToneControlMetadata,
  PlacementMetadata,
  VisibilityMetadata,
  PreferenceRelationship,
  PreferenceRegistry,
  PreferenceInput,
  CuriosityPreferenceTrace,
  CuriosityArtifactWithPreferences,
  PreferenceValidationError,
  PreferenceRegistryValidationResult,
  PreferenceInputValidationResult,
  PreferenceTraceValidationResult,
  CuriosityArtifactWithPreferencesValidationResult,
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

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const PREFERENCE_VALIDATION_CODES = {
  PREFERENCE_DUPLICATE_ID: 'PREFERENCE_DUPLICATE_ID',
  PREFERENCE_DUPLICATE_TITLE: 'PREFERENCE_DUPLICATE_TITLE',
  PREFERENCE_INVALID_TYPE: 'PREFERENCE_INVALID_TYPE',
  PREFERENCE_INVALID_TONE_CONTROL: 'PREFERENCE_INVALID_TONE_CONTROL',
  PREFERENCE_INVALID_PLACEMENT: 'PREFERENCE_INVALID_PLACEMENT',
  PREFERENCE_INVALID_VISIBILITY: 'PREFERENCE_INVALID_VISIBILITY',
  PREFERENCE_INVALID_ELIGIBILITY: 'PREFERENCE_INVALID_ELIGIBILITY',
  PREFERENCE_INVALID_STATUS: 'PREFERENCE_INVALID_STATUS',
  PREFERENCE_INVALID_GOVERNANCE: 'PREFERENCE_INVALID_GOVERNANCE',
  PREFERENCE_MISSING_PROVENANCE: 'PREFERENCE_MISSING_PROVENANCE',
  PREFERENCE_MISSING_PROVIDER: 'PREFERENCE_MISSING_PROVIDER',
  PREFERENCE_MISSING_RATIONALE: 'PREFERENCE_MISSING_RATIONALE',
  PREFERENCE_MISSING_CURIOSITY_REFERENCE: 'PREFERENCE_MISSING_CURIOSITY_REFERENCE',
  PREFERENCE_MISSING_PROFILE_ID: 'PREFERENCE_MISSING_PROFILE_ID',
  PREFERENCE_MISSING_TITLE: 'PREFERENCE_MISSING_TITLE',
  PREFERENCE_MISSING_PLACEMENT: 'PREFERENCE_MISSING_PLACEMENT',
  PREFERENCE_SELF_RELATIONSHIP: 'PREFERENCE_SELF_RELATIONSHIP',
  PREFERENCE_EMPTY_REGISTRY: 'PREFERENCE_EMPTY_REGISTRY',
  PREFERENCE_INVALID_TRACE: 'PREFERENCE_INVALID_TRACE',
  PREFERENCE_REGISTRY_INCONSISTENCY: 'PREFERENCE_REGISTRY_INCONSISTENCY',
  PREFERENCE_INVALID_CONFIGURATION: 'PREFERENCE_INVALID_CONFIGURATION',
  PREFERENCE_INVALID_RELATIONSHIP: 'PREFERENCE_INVALID_RELATIONSHIP',
  PREFERENCE_MISSING_GOVERNANCE: 'PREFERENCE_MISSING_GOVERNANCE',
  PREFERENCE_UNSUPPORTED_METADATA: 'PREFERENCE_UNSUPPORTED_METADATA',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curiosity preference profile against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityPreferenceProfile(
  profile: CuriosityPreferenceProfile,
): readonly PreferenceValidationError[] {
  const errors: PreferenceValidationError[] = [];

  if (!profile.profileId || profile.profileId.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PROFILE_ID,
      message: 'Curiosity preference profile is missing a profile ID.',
      field: 'profileId',
      profileId: profile.profileId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_TITLE,
      message: 'Curiosity preference profile is missing a title.',
      field: 'title',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_USER_PREFERENCE_TYPES.includes(profile.preferenceType)) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TYPE,
      message: `Curiosity preference profile has unsupported preference type: "${profile.preferenceType}".`,
      field: 'preferenceType',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_TONE_CONTROL_LEVELS.includes(profile.toneControlLevel)) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TONE_CONTROL,
      message: `Curiosity preference profile has unsupported tone control level: "${profile.toneControlLevel}".`,
      field: 'toneControlLevel',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_PLACEMENT_RULES.includes(profile.placementRule)) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_PLACEMENT,
      message: `Curiosity preference profile has unsupported placement rule: "${profile.placementRule}".`,
      field: 'placementRule',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_VISIBILITY_LEVELS.includes(profile.visibilityLevel)) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_VISIBILITY,
      message: `Curiosity preference profile has unsupported visibility level: "${profile.visibilityLevel}".`,
      field: 'visibilityLevel',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_PRESENTATION_ELIGIBILITY.includes(profile.presentationEligibility)) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_ELIGIBILITY,
      message: `Curiosity preference profile has unsupported presentation eligibility: "${profile.presentationEligibility}".`,
      field: 'presentationEligibility',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_PREFERENCE_STATUS.includes(profile.status)) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_STATUS,
      message: `Curiosity preference profile has unsupported status: "${profile.status}".`,
      field: 'status',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_GOVERNANCE,
      message: `Curiosity preference profile has invalid governance: "${profile.governance}".`,
      field: 'governance',
      profileId: profile.profileId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PROVENANCE,
      message: 'Curiosity preference profile is missing provenance.',
      field: 'provenance',
      profileId: profile.profileId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PROVIDER,
        message: 'Curiosity preference provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: profile.profileId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_RATIONALE,
        message: 'Curiosity preference provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: profile.profileId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Tone Control Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates tone control metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateToneControlMetadata(
  metadata: ToneControlMetadata,
): readonly PreferenceValidationError[] {
  const errors: PreferenceValidationError[] = [];

  if (!metadata.metadataId || metadata.metadataId.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PLACEMENT,
      message: 'Tone control metadata is missing a metadata ID.',
      field: 'metadataId',
    });
  }

  if (!metadata.profileId || metadata.profileId.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Tone control metadata is missing a profile ID.',
      field: 'profileId',
    });
  }

  if (!CANONICAL_TONE_CONTROL_LEVELS.includes(metadata.toneControlLevel)) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TONE_CONTROL,
      message: `Tone control metadata has unsupported tone control level: "${metadata.toneControlLevel}".`,
      field: 'toneControlLevel',
    });
  }

  if (!metadata.humorIntensity || metadata.humorIntensity.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_CONFIGURATION,
      message: 'Tone control metadata is missing humor intensity.',
      field: 'humorIntensity',
    });
  }

  if (!metadata.witLevel || metadata.witLevel.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_CONFIGURATION,
      message: 'Tone control metadata is missing wit level.',
      field: 'witLevel',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Placement Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates placement metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validatePlacementMetadata(
  metadata: PlacementMetadata,
): readonly PreferenceValidationError[] {
  const errors: PreferenceValidationError[] = [];

  if (!metadata.metadataId || metadata.metadataId.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PLACEMENT,
      message: 'Placement metadata is missing a metadata ID.',
      field: 'metadataId',
    });
  }

  if (!metadata.profileId || metadata.profileId.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Placement metadata is missing a profile ID.',
      field: 'profileId',
    });
  }

  if (!CANONICAL_PLACEMENT_RULES.includes(metadata.placementRule)) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_PLACEMENT,
      message: `Placement metadata has unsupported placement rule: "${metadata.placementRule}".`,
      field: 'placementRule',
    });
  }

  if (!metadata.frequency || metadata.frequency.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_CONFIGURATION,
      message: 'Placement metadata is missing frequency.',
      field: 'frequency',
    });
  }

  if (!metadata.duration || metadata.duration.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_CONFIGURATION,
      message: 'Placement metadata is missing duration.',
      field: 'duration',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Visibility Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates visibility metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateVisibilityMetadata(
  metadata: VisibilityMetadata,
): readonly PreferenceValidationError[] {
  const errors: PreferenceValidationError[] = [];

  if (!metadata.metadataId || metadata.metadataId.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PLACEMENT,
      message: 'Visibility metadata is missing a metadata ID.',
      field: 'metadataId',
    });
  }

  if (!metadata.profileId || metadata.profileId.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Visibility metadata is missing a profile ID.',
      field: 'profileId',
    });
  }

  if (!CANONICAL_VISIBILITY_LEVELS.includes(metadata.visibilityLevel)) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_VISIBILITY,
      message: `Visibility metadata has unsupported visibility level: "${metadata.visibilityLevel}".`,
      field: 'visibilityLevel',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Preference Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a preference relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validatePreferenceRelationship(
  relationship: PreferenceRelationship,
): readonly PreferenceValidationError[] {
  const errors: PreferenceValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Preference relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceProfileId || relationship.sourceProfileId.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Preference relationship is missing a source profile ID.',
      field: 'sourceProfileId',
    });
  }

  if (!relationship.targetProfileId || relationship.targetProfileId.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Preference relationship is missing a target profile ID.',
      field: 'targetProfileId',
    });
  }

  if (relationship.sourceProfileId === relationship.targetProfileId) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_SELF_RELATIONSHIP,
      message: 'Preference relationship cannot be a self-relationship.',
      field: 'targetProfileId',
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PROVENANCE,
      message: 'Preference relationship is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!relationship.provenance.provider || relationship.provenance.provider.trim() === '') {
      errors.push({
        code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PROVIDER,
        message: 'Preference relationship provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_RATIONALE,
        message: 'Preference relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Preference Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a preference registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validatePreferenceRegistry(
  registry: PreferenceRegistry,
): PreferenceRegistryValidationResult {
  const errors: PreferenceValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate profile IDs
  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.profileId)) {
      errors.push({
        code: PREFERENCE_VALIDATION_CODES.PREFERENCE_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.profileId}".`,
        profileId: profile.profileId,
      });
    }
    seenIds.add(profile.profileId);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: PREFERENCE_VALIDATION_CODES.PREFERENCE_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        profileId: profile.profileId,
      });
    }
    seenTitles.add(profile.title);
  }

  // Validate each profile
  for (const profile of registry.profiles) {
    errors.push(...validateCuriosityPreferenceProfile(profile));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validatePreferenceRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'preference_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Preference Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates preference input against canonical invariants.
 * Pure function. No side effects.
 */
export function validatePreferenceInput(
  input: PreferenceInput,
): PreferenceInputValidationResult {
  const errors: PreferenceValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateCuriosityPreferenceProfile(profile));
    }
  }

  for (const relationship of input.relationships) {
    errors.push(...validatePreferenceRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'preference_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Preference Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a preference trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validatePreferenceTrace(
  trace: CuriosityPreferenceTrace,
): PreferenceTraceValidationResult {
  const errors: PreferenceValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TRACE,
      message: 'Preference trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TRACE,
      message: 'Preference trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TRACE,
      message: 'Preference trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_INVALID_TRACE,
      message: 'Preference trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'preference_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Preferences Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity artifact with preferences against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityArtifactWithPreferences(
  artifact: CuriosityArtifactWithPreferences,
): CuriosityArtifactWithPreferencesValidationResult {
  const errors: PreferenceValidationError[] = [];

  if (!artifact.curiosityId || artifact.curiosityId.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity artifact is missing a curiosity ID.',
      field: 'curiosityId',
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_TITLE,
      message: 'Curiosity artifact is missing a title.',
      field: 'title',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_EMPTY_REGISTRY,
      message: 'Curiosity artifact has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateCuriosityPreferenceProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PROVENANCE,
      message: 'Curiosity artifact is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_PROVIDER,
        message: 'Curiosity artifact provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: PREFERENCE_VALIDATION_CODES.PREFERENCE_MISSING_RATIONALE,
        message: 'Curiosity artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_artifact_with_preferences_composition',
  };
}
