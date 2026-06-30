/**
 * NV-2100-D9-OPT-02 — Curiosity Purpose Validation Layer
 *
 * Deterministic validation for curiosity educational purpose metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CuriosityPurposeProfile,
  CuriosityPurposeRelationship,
  CuriosityPurposeRegistry,
  CuriosityPurposeTrace,
  CuriosityPurposeInput,
  CuriosityArtifactWithPurpose,
  CuriosityPurposeValidationError,
  CuriosityPurposeRegistryValidationResult,
  CuriosityPurposeInputValidationResult,
  CuriosityPurposeTraceValidationResult,
  CuriosityArtifactWithPurposeValidationResult,
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

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const CURIOSITY_PURPOSE_VALIDATION_CODES = {
  PURPOSE_DUPLICATE_ID: 'PURPOSE_DUPLICATE_ID',
  PURPOSE_DUPLICATE_TITLE: 'PURPOSE_DUPLICATE_TITLE',
  PURPOSE_INVALID_OUTPUT_TYPE: 'PURPOSE_INVALID_OUTPUT_TYPE',
  PURPOSE_INVALID_EDUCATIONAL_PURPOSE: 'PURPOSE_INVALID_EDUCATIONAL_PURPOSE',
  PURPOSE_INVALID_EMOTIONAL_TONE: 'PURPOSE_INVALID_EMOTIONAL_TONE',
  PURPOSE_INVALID_DELIVERY_CONTEXT: 'PURPOSE_INVALID_DELIVERY_CONTEXT',
  PURPOSE_INVALID_AUDIENCE_LEVEL: 'PURPOSE_INVALID_AUDIENCE_LEVEL',
  PURPOSE_INVALID_STATUS: 'PURPOSE_INVALID_STATUS',
  PURPOSE_INVALID_GOVERNANCE: 'PURPOSE_INVALID_GOVERNANCE',
  PURPOSE_MISSING_PROVENANCE: 'PURPOSE_MISSING_PROVENANCE',
  PURPOSE_MISSING_PROVIDER: 'PURPOSE_MISSING_PROVIDER',
  PURPOSE_MISSING_RATIONALE: 'PURPOSE_MISSING_RATIONALE',
  PURPOSE_MISSING_CURIOSITY_REFERENCE: 'PURPOSE_MISSING_CURIOSITY_REFERENCE',
  PURPOSE_MISSING_PROFILE_ID: 'PURPOSE_MISSING_PROFILE_ID',
  PURPOSE_MISSING_TITLE: 'PURPOSE_MISSING_TITLE',
  PURPOSE_SELF_RELATIONSHIP: 'PURPOSE_SELF_RELATIONSHIP',
  PURPOSE_EMPTY_REGISTRY: 'PURPOSE_EMPTY_REGISTRY',
  PURPOSE_INVALID_TRACE: 'PURPOSE_INVALID_TRACE',
  PURPOSE_REGISTRY_INCONSISTENCY: 'PURPOSE_REGISTRY_INCONSISTENCY',
  PURPOSE_INVALID_CONFIGURATION: 'PURPOSE_INVALID_CONFIGURATION',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curiosity purpose profile against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityPurposeProfile(
  profile: CuriosityPurposeProfile,
): readonly CuriosityPurposeValidationError[] {
  const errors: CuriosityPurposeValidationError[] = [];

  if (!profile.id || profile.id.trim() === '') {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_PROFILE_ID,
      message: 'Curiosity purpose profile is missing a profile ID.',
      field: 'id',
      profileId: profile.id,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_TITLE,
      message: 'Curiosity purpose profile is missing a title.',
      field: 'title',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_CURIOSITY_OUTPUT_TYPES.includes(profile.outputType)) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_OUTPUT_TYPE,
      message: `Curiosity purpose profile has unsupported output type: "${profile.outputType}".`,
      field: 'outputType',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_EDUCATIONAL_PURPOSES.includes(profile.educationalPurpose)) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_EDUCATIONAL_PURPOSE,
      message: `Curiosity purpose profile has unsupported educational purpose: "${profile.educationalPurpose}".`,
      field: 'educationalPurpose',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_EMOTIONAL_TONES.includes(profile.emotionalTone)) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_EMOTIONAL_TONE,
      message: `Curiosity purpose profile has unsupported emotional tone: "${profile.emotionalTone}".`,
      field: 'emotionalTone',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_DELIVERY_CONTEXTS.includes(profile.deliveryContext)) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_DELIVERY_CONTEXT,
      message: `Curiosity purpose profile has unsupported delivery context: "${profile.deliveryContext}".`,
      field: 'deliveryContext',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_AUDIENCE_LEVELS.includes(profile.audienceLevel)) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_AUDIENCE_LEVEL,
      message: `Curiosity purpose profile has unsupported audience level: "${profile.audienceLevel}".`,
      field: 'audienceLevel',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_CURIOSITY_PURPOSE_STATUS.includes(profile.status)) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_STATUS,
      message: `Curiosity purpose profile has unsupported status: "${profile.status}".`,
      field: 'status',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_GOVERNANCE,
      message: `Curiosity purpose profile has invalid governance: "${profile.governance}".`,
      field: 'governance',
      profileId: profile.id,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_PROVENANCE,
      message: 'Curiosity purpose profile is missing provenance.',
      field: 'provenance',
      profileId: profile.id,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_PROVIDER,
        message: 'Curiosity purpose provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: profile.id,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_RATIONALE,
        message: 'Curiosity purpose provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: profile.id,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity purpose relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityPurposeRelationship(
  relationship: CuriosityPurposeRelationship,
): readonly CuriosityPurposeValidationError[] {
  const errors: CuriosityPurposeValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity purpose relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceProfileId || relationship.sourceProfileId.trim() === '') {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity purpose relationship is missing a source profile ID.',
      field: 'sourceProfileId',
    });
  }

  if (!relationship.targetProfileId || relationship.targetProfileId.trim() === '') {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity purpose relationship is missing a target profile ID.',
      field: 'targetProfileId',
    });
  }

  if (relationship.sourceProfileId === relationship.targetProfileId) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_SELF_RELATIONSHIP,
      message: 'Curiosity purpose relationship cannot be a self-relationship.',
      field: 'targetProfileId',
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_PROVENANCE,
      message: 'Curiosity purpose relationship is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!relationship.provenance.provider || relationship.provenance.provider.trim() === '') {
      errors.push({
        code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_PROVIDER,
        message: 'Curiosity purpose relationship provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_RATIONALE,
        message: 'Curiosity purpose relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity purpose registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityPurposeRegistry(
  registry: CuriosityPurposeRegistry,
): CuriosityPurposeRegistryValidationResult {
  const errors: CuriosityPurposeValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate profile IDs
  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.id)) {
      errors.push({
        code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.id}".`,
        profileId: profile.id,
      });
    }
    seenIds.add(profile.id);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        profileId: profile.id,
      });
    }
    seenTitles.add(profile.title);
  }

  // Validate each profile
  for (const profile of registry.profiles) {
    errors.push(...validateCuriosityPurposeProfile(profile));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateCuriosityPurposeRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_purpose_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates curiosity purpose input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityPurposeInput(
  input: CuriosityPurposeInput,
): CuriosityPurposeInputValidationResult {
  const errors: CuriosityPurposeValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateCuriosityPurposeProfile(profile));
    }
  }

  for (const relationship of input.relationships) {
    errors.push(...validateCuriosityPurposeRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_purpose_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Purpose Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity purpose trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityPurposeTrace(
  trace: CuriosityPurposeTrace,
): CuriosityPurposeTraceValidationResult {
  const errors: CuriosityPurposeValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_TRACE,
      message: 'Curiosity purpose trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_TRACE,
      message: 'Curiosity purpose trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_TRACE,
      message: 'Curiosity purpose trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_TRACE,
      message: 'Curiosity purpose trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_purpose_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Purpose Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity artifact with purpose against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityArtifactWithPurpose(
  artifact: CuriosityArtifactWithPurpose,
): CuriosityArtifactWithPurposeValidationResult {
  const errors: CuriosityPurposeValidationError[] = [];

  if (!artifact.curiosityId || artifact.curiosityId.trim() === '') {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity artifact is missing a curiosity ID.',
      field: 'curiosityId',
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_TITLE,
      message: 'Curiosity artifact is missing a title.',
      field: 'title',
    });
  }

  if (!artifact.profile) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_INVALID_CONFIGURATION,
      message: 'Curiosity artifact is missing a purpose profile.',
      field: 'profile',
    });
  } else {
    errors.push(...validateCuriosityPurposeProfile(artifact.profile));
  }

  if (!artifact.provenance) {
    errors.push({
      code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_PROVENANCE,
      message: 'Curiosity artifact is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_PROVIDER,
        message: 'Curiosity artifact provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: CURIOSITY_PURPOSE_VALIDATION_CODES.PURPOSE_MISSING_RATIONALE,
        message: 'Curiosity artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_artifact_with_purpose_composition',
  };
}
