/**
 * NV-2100-D9-OPT-04 — Cultural Reference Validation Layer
 *
 * Deterministic validation for cultural reference metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CulturalReferenceProfile,
  CurrentContextReference,
  ReferenceRelationship,
  ReferenceGovernance,
  CulturalReferenceRegistry,
  CulturalReferenceInput,
  CulturalReferenceTrace,
  CuriosityArtifactWithCulturalReferences,
  CulturalReferenceValidationError,
  CulturalReferenceRegistryValidationResult,
  CulturalReferenceInputValidationResult,
  CulturalReferenceTraceValidationResult,
  CuriosityArtifactWithCulturalReferencesValidationResult,
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

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const CULTURAL_REFERENCE_VALIDATION_CODES = {
  REFERENCE_DUPLICATE_ID: 'REFERENCE_DUPLICATE_ID',
  REFERENCE_DUPLICATE_TITLE: 'REFERENCE_DUPLICATE_TITLE',
  CONTEXT_DUPLICATE_ID: 'CONTEXT_DUPLICATE_ID',
  RELATIONSHIP_DUPLICATE_ID: 'RELATIONSHIP_DUPLICATE_ID',
  REFERENCE_INVALID_DOMAIN: 'REFERENCE_INVALID_DOMAIN',
  REFERENCE_INVALID_RECENCY: 'REFERENCE_INVALID_RECENCY',
  REFERENCE_INVALID_PURPOSE: 'REFERENCE_INVALID_PURPOSE',
  REFERENCE_INVALID_VALIDITY: 'REFERENCE_INVALID_VALIDITY',
  REFERENCE_INVALID_SENSITIVITY: 'REFERENCE_INVALID_SENSITIVITY',
  REFERENCE_INVALID_STATUS: 'REFERENCE_INVALID_STATUS',
  REFERENCE_INVALID_GOVERNANCE: 'REFERENCE_INVALID_GOVERNANCE',
  REFERENCE_MISSING_PROVENANCE: 'REFERENCE_MISSING_PROVENANCE',
  REFERENCE_MISSING_PROVIDER: 'REFERENCE_MISSING_PROVIDER',
  REFERENCE_MISSING_RATIONALE: 'REFERENCE_MISSING_RATIONALE',
  REFERENCE_MISSING_CURIOSITY_REFERENCE: 'REFERENCE_MISSING_CURIOSITY_REFERENCE',
  REFERENCE_MISSING_PROFILE_ID: 'REFERENCE_MISSING_PROFILE_ID',
  REFERENCE_MISSING_TITLE: 'REFERENCE_MISSING_TITLE',
  REFERENCE_MISSING_GOVERNANCE: 'REFERENCE_MISSING_GOVERNANCE',
  REFERENCE_SELF_RELATIONSHIP: 'REFERENCE_SELF_RELATIONSHIP',
  REFERENCE_EMPTY_REGISTRY: 'REFERENCE_EMPTY_REGISTRY',
  REFERENCE_INVALID_TRACE: 'REFERENCE_INVALID_TRACE',
  REFERENCE_REGISTRY_INCONSISTENCY: 'REFERENCE_REGISTRY_INCONSISTENCY',
  REFERENCE_INVALID_CONFIGURATION: 'REFERENCE_INVALID_CONFIGURATION',
  REFERENCE_UNSAFE_CONFIGURATION: 'REFERENCE_UNSAFE_CONFIGURATION',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single cultural reference profile against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCulturalReferenceProfile(
  profile: CulturalReferenceProfile,
): readonly CulturalReferenceValidationError[] {
  const errors: CulturalReferenceValidationError[] = [];

  if (!profile.id || profile.id.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROFILE_ID,
      message: 'Cultural reference profile is missing a profile ID.',
      field: 'id',
      profileId: profile.id,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_TITLE,
      message: 'Cultural reference profile is missing a title.',
      field: 'title',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_REFERENCE_DOMAINS.includes(profile.referenceDomain)) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_DOMAIN,
      message: `Cultural reference profile has unsupported reference domain: "${profile.referenceDomain}".`,
      field: 'referenceDomain',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_REFERENCE_RECENCY.includes(profile.referenceRecency)) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_RECENCY,
      message: `Cultural reference profile has unsupported reference recency: "${profile.referenceRecency}".`,
      field: 'referenceRecency',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_REFERENCE_PURPOSE.includes(profile.referencePurpose)) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_PURPOSE,
      message: `Cultural reference profile has unsupported reference purpose: "${profile.referencePurpose}".`,
      field: 'referencePurpose',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_REFERENCE_VALIDITY.includes(profile.referenceValidity)) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_VALIDITY,
      message: `Cultural reference profile has unsupported reference validity: "${profile.referenceValidity}".`,
      field: 'referenceValidity',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_CONTEXT_SENSITIVITY.includes(profile.contextSensitivity)) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_SENSITIVITY,
      message: `Cultural reference profile has unsupported context sensitivity: "${profile.contextSensitivity}".`,
      field: 'contextSensitivity',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_REFERENCE_STATUS.includes(profile.status)) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_STATUS,
      message: `Cultural reference profile has unsupported status: "${profile.status}".`,
      field: 'status',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_GOVERNANCE,
      message: `Cultural reference profile has invalid governance: "${profile.governance}".`,
      field: 'governance',
      profileId: profile.id,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROVENANCE,
      message: 'Cultural reference profile is missing provenance.',
      field: 'provenance',
      profileId: profile.id,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROVIDER,
        message: 'Cultural reference provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: profile.id,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_RATIONALE,
        message: 'Cultural reference provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: profile.id,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Current Context Reference Validation
// ---------------------------------------------------------------------------

/**
 * Validates a current context reference against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurrentContextReference(
  reference: CurrentContextReference,
): readonly CulturalReferenceValidationError[] {
  const errors: CulturalReferenceValidationError[] = [];

  if (!reference.referenceId || reference.referenceId.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Current context reference is missing a reference ID.',
      field: 'referenceId',
    });
  }

  if (!CANONICAL_REFERENCE_DOMAINS.includes(reference.referenceDomain)) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_DOMAIN,
      message: `Current context reference has unsupported reference domain: "${reference.referenceDomain}".`,
      field: 'referenceDomain',
    });
  }

  if (!CANONICAL_REFERENCE_RECENCY.includes(reference.referenceRecency)) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_RECENCY,
      message: `Current context reference has unsupported reference recency: "${reference.referenceRecency}".`,
      field: 'referenceRecency',
    });
  }

  if (!CANONICAL_CONTEXT_SENSITIVITY.includes(reference.contextSensitivity)) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_SENSITIVITY,
      message: `Current context reference has unsupported context sensitivity: "${reference.contextSensitivity}".`,
      field: 'contextSensitivity',
    });
  }

  if (!reference.validityPeriod || reference.validityPeriod.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_CONFIGURATION,
      message: 'Current context reference is missing a validity period.',
      field: 'validityPeriod',
    });
  }

  if (!reference.lastVerified || reference.lastVerified.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_CONFIGURATION,
      message: 'Current context reference is missing a last verified date.',
      field: 'lastVerified',
    });
  }

  if (!reference.provenance) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROVENANCE,
      message: 'Current context reference is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!reference.provenance.provider || reference.provenance.provider.trim() === '') {
      errors.push({
        code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROVIDER,
        message: 'Current context reference provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!reference.provenance.rationale || reference.provenance.rationale.trim() === '') {
      errors.push({
        code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_RATIONALE,
        message: 'Current context reference provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Reference Governance Validation
// ---------------------------------------------------------------------------

/**
 * Validates reference governance against canonical invariants.
 * Pure function. No side effects.
 */
export function validateReferenceGovernance(
  governance: ReferenceGovernance,
): readonly CulturalReferenceValidationError[] {
  const errors: CulturalReferenceValidationError[] = [];

  if (!governance.educationalJustification || governance.educationalJustification.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_GOVERNANCE,
      message: 'Reference governance is missing educational justification.',
      field: 'educationalJustification',
    });
  }

  if (!governance.pedagogicalPurpose || governance.pedagogicalPurpose.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_GOVERNANCE,
      message: 'Reference governance is missing pedagogical purpose.',
      field: 'pedagogicalPurpose',
    });
  }

  if (!governance.contextSensitivity || !CANONICAL_CONTEXT_SENSITIVITY.includes(governance.contextSensitivity)) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_SENSITIVITY,
      message: 'Reference governance has invalid context sensitivity.',
      field: 'contextSensitivity',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Reference Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a reference relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateReferenceRelationship(
  relationship: ReferenceRelationship,
): readonly CulturalReferenceValidationError[] {
  const errors: CulturalReferenceValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_ID,
      message: 'Reference relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceProfileId || relationship.sourceProfileId.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Reference relationship is missing a source profile ID.',
      field: 'sourceProfileId',
    });
  }

  if (!relationship.targetProfileId || relationship.targetProfileId.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Reference relationship is missing a target profile ID.',
      field: 'targetProfileId',
    });
  }

  if (relationship.sourceProfileId === relationship.targetProfileId) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_SELF_RELATIONSHIP,
      message: 'Reference relationship cannot be a self-relationship.',
      field: 'targetProfileId',
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROVENANCE,
      message: 'Reference relationship is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!relationship.provenance.provider || relationship.provenance.provider.trim() === '') {
      errors.push({
        code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROVIDER,
        message: 'Reference relationship provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_RATIONALE,
        message: 'Reference relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Cultural Reference Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a cultural reference registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCulturalReferenceRegistry(
  registry: CulturalReferenceRegistry,
): CulturalReferenceRegistryValidationResult {
  const errors: CulturalReferenceValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate profile IDs
  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.id)) {
      errors.push({
        code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_DUPLICATE_ID,
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
        code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        profileId: profile.id,
      });
    }
    seenTitles.add(profile.title);
  }

  // Check for duplicate context reference IDs
  const seenContextIds = new Set<string>();
  for (const contextRef of registry.contextReferences) {
    if (seenContextIds.has(contextRef.referenceId)) {
      errors.push({
        code: CULTURAL_REFERENCE_VALIDATION_CODES.CONTEXT_DUPLICATE_ID,
        message: `Duplicate context reference ID: "${contextRef.referenceId}".`,
        field: 'referenceId',
      });
    }
    seenContextIds.add(contextRef.referenceId);
  }

  // Validate each profile
  for (const profile of registry.profiles) {
    errors.push(...validateCulturalReferenceProfile(profile));
  }

  // Validate each context reference
  for (const contextRef of registry.contextReferences) {
    errors.push(...validateCurrentContextReference(contextRef));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateReferenceRelationship(relationship));
  }

  // Validate governance
  errors.push(...validateReferenceGovernance(registry.governance));

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'cultural_reference_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Cultural Reference Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates cultural reference input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCulturalReferenceInput(
  input: CulturalReferenceInput,
): CulturalReferenceInputValidationResult {
  const errors: CulturalReferenceValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateCulturalReferenceProfile(profile));
    }
  }

  for (const contextRef of input.contextReferences) {
    errors.push(...validateCurrentContextReference(contextRef));
  }

  for (const relationship of input.relationships) {
    errors.push(...validateReferenceRelationship(relationship));
  }

  if (!input.governance) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_GOVERNANCE,
      message: 'Input is missing governance.',
      field: 'governance',
    });
  } else {
    errors.push(...validateReferenceGovernance(input.governance));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'cultural_reference_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Cultural Reference Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a cultural reference trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCulturalReferenceTrace(
  trace: CulturalReferenceTrace,
): CulturalReferenceTraceValidationResult {
  const errors: CulturalReferenceValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_TRACE,
      message: 'Cultural reference trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_TRACE,
      message: 'Cultural reference trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_TRACE,
      message: 'Cultural reference trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_INVALID_TRACE,
      message: 'Cultural reference trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'cultural_reference_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Cultural References Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity artifact with cultural references against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityArtifactWithCulturalReferences(
  artifact: CuriosityArtifactWithCulturalReferences,
): CuriosityArtifactWithCulturalReferencesValidationResult {
  const errors: CulturalReferenceValidationError[] = [];

  if (!artifact.curiosityId || artifact.curiosityId.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity artifact is missing a curiosity ID.',
      field: 'curiosityId',
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_TITLE,
      message: 'Curiosity artifact is missing a title.',
      field: 'title',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_EMPTY_REGISTRY,
      message: 'Curiosity artifact has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateCulturalReferenceProfile(profile));
    }
  }

  if (!artifact.governance) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_GOVERNANCE,
      message: 'Curiosity artifact is missing governance.',
      field: 'governance',
    });
  } else {
    errors.push(...validateReferenceGovernance(artifact.governance));
  }

  if (!artifact.provenance) {
    errors.push({
      code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROVENANCE,
      message: 'Curiosity artifact is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_PROVIDER,
        message: 'Curiosity artifact provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: CULTURAL_REFERENCE_VALIDATION_CODES.REFERENCE_MISSING_RATIONALE,
        message: 'Curiosity artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_artifact_with_cultural_references_composition',
  };
}