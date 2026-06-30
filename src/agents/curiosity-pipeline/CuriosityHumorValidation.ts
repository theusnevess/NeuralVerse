/**
 * NV-2100-D9-OPT-03 — Curiosity Humor Validation Layer
 *
 * Deterministic validation for curiosity humor metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  HumorProfile,
  HumorReference,
  HumorRelationship,
  HumorGovernance,
  HumorRegistry,
  HumorInput,
  CuriosityHumorTrace,
  CuriosityArtifactWithHumor,
  HumorValidationError,
  HumorRegistryValidationResult,
  HumorInputValidationResult,
  HumorTraceValidationResult,
  CuriosityArtifactWithHumorValidationResult,
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

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const HUMOR_VALIDATION_CODES = {
  HUMOR_DUPLICATE_ID: 'HUMOR_DUPLICATE_ID',
  HUMOR_DUPLICATE_TITLE: 'HUMOR_DUPLICATE_TITLE',
  REFERENCE_DUPLICATE_ID: 'REFERENCE_DUPLICATE_ID',
  RELATIONSHIP_DUPLICATE_ID: 'RELATIONSHIP_DUPLICATE_ID',
  HUMOR_INVALID_TYPE: 'HUMOR_INVALID_TYPE',
  HUMOR_INVALID_REFERENCE: 'HUMOR_INVALID_REFERENCE',
  HUMOR_INVALID_OBJECTIVE: 'HUMOR_INVALID_OBJECTIVE',
  HUMOR_INVALID_INTENSITY: 'HUMOR_INVALID_INTENSITY',
  HUMOR_INVALID_SAFETY: 'HUMOR_INVALID_SAFETY',
  HUMOR_INVALID_STATUS: 'HUMOR_INVALID_STATUS',
  HUMOR_INVALID_GOVERNANCE: 'HUMOR_INVALID_GOVERNANCE',
  HUMOR_MISSING_PROVENANCE: 'HUMOR_MISSING_PROVENANCE',
  HUMOR_MISSING_PROVIDER: 'HUMOR_MISSING_PROVIDER',
  HUMOR_MISSING_RATIONALE: 'HUMOR_MISSING_RATIONALE',
  HUMOR_MISSING_CURIOSITY_REFERENCE: 'HUMOR_MISSING_CURIOSITY_REFERENCE',
  HUMOR_MISSING_PROFILE_ID: 'HUMOR_MISSING_PROFILE_ID',
  HUMOR_MISSING_TITLE: 'HUMOR_MISSING_TITLE',
  HUMOR_MISSING_GOVERNANCE: 'HUMOR_MISSING_GOVERNANCE',
  HUMOR_SELF_RELATIONSHIP: 'HUMOR_SELF_RELATIONSHIP',
  HUMOR_EMPTY_REGISTRY: 'HUMOR_EMPTY_REGISTRY',
  HUMOR_INVALID_TRACE: 'HUMOR_INVALID_TRACE',
  HUMOR_REGISTRY_INCONSISTENCY: 'HUMOR_REGISTRY_INCONSISTENCY',
  HUMOR_INVALID_CONFIGURATION: 'HUMOR_INVALID_CONFIGURATION',
  HUMOR_UNSAFE_CONFIGURATION: 'HUMOR_UNSAFE_CONFIGURATION',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single humor profile against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHumorProfile(
  profile: HumorProfile,
): readonly HumorValidationError[] {
  const errors: HumorValidationError[] = [];

  if (!profile.id || profile.id.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_PROFILE_ID,
      message: 'Humor profile is missing a profile ID.',
      field: 'id',
      profileId: profile.id,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_TITLE,
      message: 'Humor profile is missing a title.',
      field: 'title',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_HUMOR_TYPES.includes(profile.humorType)) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_TYPE,
      message: `Humor profile has unsupported humor type: "${profile.humorType}".`,
      field: 'humorType',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_REFERENCE_TYPES.includes(profile.referenceType)) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_REFERENCE,
      message: `Humor profile has unsupported reference type: "${profile.referenceType}".`,
      field: 'referenceType',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_HUMOR_OBJECTIVES.includes(profile.humorObjective)) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_OBJECTIVE,
      message: `Humor profile has unsupported humor objective: "${profile.humorObjective}".`,
      field: 'humorObjective',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_HUMOR_INTENSITY.includes(profile.humorIntensity)) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_INTENSITY,
      message: `Humor profile has unsupported humor intensity: "${profile.humorIntensity}".`,
      field: 'humorIntensity',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_HUMOR_SAFETY_LEVELS.includes(profile.safetyLevel)) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_SAFETY,
      message: `Humor profile has unsupported safety level: "${profile.safetyLevel}".`,
      field: 'safetyLevel',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_HUMOR_STATUS.includes(profile.status)) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_STATUS,
      message: `Humor profile has unsupported status: "${profile.status}".`,
      field: 'status',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_GOVERNANCE,
      message: `Humor profile has invalid governance: "${profile.governance}".`,
      field: 'governance',
      profileId: profile.id,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_PROVENANCE,
      message: 'Humor profile is missing provenance.',
      field: 'provenance',
      profileId: profile.id,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_PROVIDER,
        message: 'Humor provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: profile.id,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_RATIONALE,
        message: 'Humor provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: profile.id,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Humor Reference Validation
// ---------------------------------------------------------------------------

/**
 * Validates a humor reference against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHumorReference(
  reference: HumorReference,
): readonly HumorValidationError[] {
  const errors: HumorValidationError[] = [];

  if (!reference.referenceId || reference.referenceId.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_CURIOSITY_REFERENCE,
      message: 'Humor reference is missing a reference ID.',
      field: 'referenceId',
    });
  }

  if (!CANONICAL_REFERENCE_TYPES.includes(reference.referenceType)) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_REFERENCE,
      message: `Humor reference has unsupported reference type: "${reference.referenceType}".`,
      field: 'referenceType',
    });
  }

  if (!reference.referenceTitle || reference.referenceTitle.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_TITLE,
      message: 'Humor reference is missing a reference title.',
      field: 'referenceTitle',
    });
  }

  if (!reference.referenceReason || reference.referenceReason.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_RATIONALE,
      message: 'Humor reference is missing a reference reason.',
      field: 'referenceReason',
    });
  }

  if (!reference.educationalPurpose || reference.educationalPurpose.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_CONFIGURATION,
      message: 'Humor reference is missing an educational purpose.',
      field: 'educationalPurpose',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Humor Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a humor relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHumorRelationship(
  relationship: HumorRelationship,
): readonly HumorValidationError[] {
  const errors: HumorValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_ID,
      message: 'Humor relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceProfileId || relationship.sourceProfileId.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_CURIOSITY_REFERENCE,
      message: 'Humor relationship is missing a source profile ID.',
      field: 'sourceProfileId',
    });
  }

  if (!relationship.targetProfileId || relationship.targetProfileId.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_CURIOSITY_REFERENCE,
      message: 'Humor relationship is missing a target profile ID.',
      field: 'targetProfileId',
    });
  }

  if (relationship.sourceProfileId === relationship.targetProfileId) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_SELF_RELATIONSHIP,
      message: 'Humor relationship cannot be a self-relationship.',
      field: 'targetProfileId',
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_PROVENANCE,
      message: 'Humor relationship is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!relationship.provenance.provider || relationship.provenance.provider.trim() === '') {
      errors.push({
        code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_PROVIDER,
        message: 'Humor relationship provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_RATIONALE,
        message: 'Humor relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Humor Governance Validation
// ---------------------------------------------------------------------------

/**
 * Validates humor governance against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHumorGovernance(
  governance: HumorGovernance,
): readonly HumorValidationError[] {
  const errors: HumorValidationError[] = [];

  if (!governance.educationalJustification || governance.educationalJustification.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_GOVERNANCE,
      message: 'Humor governance is missing educational justification.',
      field: 'educationalJustification',
    });
  }

  if (!governance.pedagogicalPurpose || governance.pedagogicalPurpose.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_GOVERNANCE,
      message: 'Humor governance is missing pedagogical purpose.',
      field: 'pedagogicalPurpose',
    });
  }

  if (!governance.safetyLevel || !CANONICAL_HUMOR_SAFETY_LEVELS.includes(governance.safetyLevel)) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_SAFETY,
      message: 'Humor governance has invalid safety level.',
      field: 'safetyLevel',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Humor Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a humor registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHumorRegistry(
  registry: HumorRegistry,
): HumorRegistryValidationResult {
  const errors: HumorValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate profile IDs
  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.id)) {
      errors.push({
        code: HUMOR_VALIDATION_CODES.HUMOR_DUPLICATE_ID,
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
        code: HUMOR_VALIDATION_CODES.HUMOR_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        profileId: profile.id,
      });
    }
    seenTitles.add(profile.title);
  }

  // Check for duplicate reference IDs
  const seenRefIds = new Set<string>();
  for (const reference of registry.references) {
    if (seenRefIds.has(reference.referenceId)) {
      errors.push({
        code: HUMOR_VALIDATION_CODES.REFERENCE_DUPLICATE_ID,
        message: `Duplicate reference ID: "${reference.referenceId}".`,
        field: 'referenceId',
      });
    }
    seenRefIds.add(reference.referenceId);
  }

  // Validate each profile
  for (const profile of registry.profiles) {
    errors.push(...validateHumorProfile(profile));
  }

  // Validate each reference
  for (const reference of registry.references) {
    errors.push(...validateHumorReference(reference));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateHumorRelationship(relationship));
  }

  // Validate governance
  errors.push(...validateHumorGovernance(registry.governance));

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'humor_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Humor Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates humor input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHumorInput(
  input: HumorInput,
): HumorInputValidationResult {
  const errors: HumorValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateHumorProfile(profile));
    }
  }

  for (const reference of input.references) {
    errors.push(...validateHumorReference(reference));
  }

  for (const relationship of input.relationships) {
    errors.push(...validateHumorRelationship(relationship));
  }

  if (!input.governance) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_GOVERNANCE,
      message: 'Input is missing governance.',
      field: 'governance',
    });
  } else {
    errors.push(...validateHumorGovernance(input.governance));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'humor_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Humor Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a humor trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHumorTrace(
  trace: CuriosityHumorTrace,
): HumorTraceValidationResult {
  const errors: HumorValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_TRACE,
      message: 'Humor trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_TRACE,
      message: 'Humor trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_TRACE,
      message: 'Humor trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_TRACE,
      message: 'Humor trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'humor_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Humor Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity artifact with humor against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityArtifactWithHumor(
  artifact: CuriosityArtifactWithHumor,
): CuriosityArtifactWithHumorValidationResult {
  const errors: HumorValidationError[] = [];

  if (!artifact.curiosityId || artifact.curiosityId.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity artifact is missing a curiosity ID.',
      field: 'curiosityId',
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_TITLE,
      message: 'Curiosity artifact is missing a title.',
      field: 'title',
    });
  }

  if (!artifact.profile) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_INVALID_CONFIGURATION,
      message: 'Curiosity artifact is missing a humor profile.',
      field: 'profile',
    });
  } else {
    errors.push(...validateHumorProfile(artifact.profile));
  }

  if (!artifact.governance) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_GOVERNANCE,
      message: 'Curiosity artifact is missing governance.',
      field: 'governance',
    });
  } else {
    errors.push(...validateHumorGovernance(artifact.governance));
  }

  if (!artifact.provenance) {
    errors.push({
      code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_PROVENANCE,
      message: 'Curiosity artifact is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_PROVIDER,
        message: 'Curiosity artifact provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: HUMOR_VALIDATION_CODES.HUMOR_MISSING_RATIONALE,
        message: 'Curiosity artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_artifact_with_humor_composition',
  };
}