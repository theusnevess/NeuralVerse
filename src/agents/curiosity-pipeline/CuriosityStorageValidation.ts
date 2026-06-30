/**
 * NV-2100-D9-OPT-13 — Curiosity Storage Validation Layer
 *
 * Deterministic validation for storage metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CuriosityStorageProfile,
  RetrievalMetadata,
  OverlayMetadata,
  StorageRelationship,
  StorageRegistry,
  StorageInput,
  CuriosityStorageTrace,
  CuriosityArtifactWithStorage,
  StorageValidationError,
  StorageRegistryValidationResult,
  StorageInputValidationResult,
  StorageTraceValidationResult,
  CuriosityArtifactWithStorageValidationResult,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_STORAGE_TYPES,
  CANONICAL_RETRIEVAL_STRATEGIES,
  CANONICAL_OVERLAY_TYPES,
  CANONICAL_STORAGE_VISIBILITY,
  CANONICAL_STORAGE_SCOPE,
  CANONICAL_STORAGE_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const STORAGE_VALIDATION_CODES = {
  STORAGE_DUPLICATE_ID: 'STORAGE_DUPLICATE_ID',
  STORAGE_DUPLICATE_TITLE: 'STORAGE_DUPLICATE_TITLE',
  STORAGE_INVALID_STORAGE: 'STORAGE_INVALID_STORAGE',
  STORAGE_INVALID_RETRIEVAL: 'STORAGE_INVALID_RETRIEVAL',
  STORAGE_INVALID_OVERLAY: 'STORAGE_INVALID_OVERLAY',
  STORAGE_INVALID_SCOPE: 'STORAGE_INVALID_SCOPE',
  STORAGE_INVALID_VISIBILITY: 'STORAGE_INVALID_VISIBILITY',
  STORAGE_INVALID_STATUS: 'STORAGE_INVALID_STATUS',
  STORAGE_INVALID_GOVERNANCE: 'STORAGE_INVALID_GOVERNANCE',
  STORAGE_MISSING_PROVENANCE: 'STORAGE_MISSING_PROVENANCE',
  STORAGE_MISSING_PROVIDER: 'STORAGE_MISSING_PROVIDER',
  STORAGE_MISSING_RATIONALE: 'STORAGE_MISSING_RATIONALE',
  STORAGE_MISSING_CURIOSITY_REFERENCE: 'STORAGE_MISSING_CURIOSITY_REFERENCE',
  STORAGE_MISSING_PROFILE_ID: 'STORAGE_MISSING_PROFILE_ID',
  STORAGE_MISSING_TITLE: 'STORAGE_MISSING_TITLE',
  STORAGE_MISSING_OVERLAY: 'STORAGE_MISSING_OVERLAY',
  STORAGE_SELF_RELATIONSHIP: 'STORAGE_SELF_RELATIONSHIP',
  STORAGE_EMPTY_REGISTRY: 'STORAGE_EMPTY_REGISTRY',
  STORAGE_INVALID_TRACE: 'STORAGE_INVALID_TRACE',
  STORAGE_REGISTRY_INCONSISTENCY: 'STORAGE_REGISTRY_INCONSISTENCY',
  STORAGE_INVALID_CONFIGURATION: 'STORAGE_INVALID_CONFIGURATION',
  STORAGE_INVALID_RELATIONSHIP: 'STORAGE_INVALID_RELATIONSHIP',
  STORAGE_MISSING_GOVERNANCE: 'STORAGE_MISSING_GOVERNANCE',
  STORAGE_UNSUPPORTED_STORAGE: 'STORAGE_UNSUPPORTED_STORAGE',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single storage profile against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityStorageProfile(
  profile: CuriosityStorageProfile,
): readonly StorageValidationError[] {
  const errors: StorageValidationError[] = [];

  if (!profile.profileId || profile.profileId.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_PROFILE_ID,
      message: 'Storage profile is missing a profile ID.',
      field: 'profileId',
      profileId: profile.profileId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_TITLE,
      message: 'Storage profile is missing a title.',
      field: 'title',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_STORAGE_TYPES.includes(profile.storageType)) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_STORAGE,
      message: `Storage profile has unsupported storage type: "${profile.storageType}".`,
      field: 'storageType',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_RETRIEVAL_STRATEGIES.includes(profile.retrievalStrategy)) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_RETRIEVAL,
      message: `Storage profile has unsupported retrieval strategy: "${profile.retrievalStrategy}".`,
      field: 'retrievalStrategy',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_OVERLAY_TYPES.includes(profile.overlayType)) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_OVERLAY,
      message: `Storage profile has unsupported overlay type: "${profile.overlayType}".`,
      field: 'overlayType',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_STORAGE_VISIBILITY.includes(profile.storageVisibility)) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_VISIBILITY,
      message: `Storage profile has unsupported storage visibility: "${profile.storageVisibility}".`,
      field: 'storageVisibility',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_STORAGE_SCOPE.includes(profile.storageScope)) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_SCOPE,
      message: `Storage profile has unsupported storage scope: "${profile.storageScope}".`,
      field: 'storageScope',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_STORAGE_STATUS.includes(profile.status)) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_STATUS,
      message: `Storage profile has unsupported status: "${profile.status}".`,
      field: 'status',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_GOVERNANCE,
      message: `Storage profile has invalid governance: "${profile.governance}".`,
      field: 'governance',
      profileId: profile.profileId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_PROVENANCE,
      message: 'Storage profile is missing provenance.',
      field: 'provenance',
      profileId: profile.profileId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_PROVIDER,
        message: 'Storage profile provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: profile.profileId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_RATIONALE,
        message: 'Storage profile provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: profile.profileId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Retrieval Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates retrieval metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateRetrievalMetadata(
  metadata: RetrievalMetadata,
): readonly StorageValidationError[] {
  const errors: StorageValidationError[] = [];

  if (!metadata.metadataId || metadata.metadataId.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_CURIOSITY_REFERENCE,
      message: 'Retrieval metadata is missing a metadata ID.',
      field: 'metadataId',
    });
  }

  if (!metadata.profileId || metadata.profileId.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_CURIOSITY_REFERENCE,
      message: 'Retrieval metadata is missing a profile ID.',
      field: 'profileId',
    });
  }

  if (!CANONICAL_RETRIEVAL_STRATEGIES.includes(metadata.retrievalStrategy)) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_RETRIEVAL,
      message: `Retrieval metadata has unsupported retrieval strategy: "${metadata.retrievalStrategy}".`,
      field: 'retrievalStrategy',
    });
  }

  if (!metadata.indexKey || metadata.indexKey.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_CONFIGURATION,
      message: 'Retrieval metadata is missing index key.',
      field: 'indexKey',
    });
  }

  if (!metadata.indexValue || metadata.indexValue.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_CONFIGURATION,
      message: 'Retrieval metadata is missing index value.',
      field: 'indexValue',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Overlay Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates overlay metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateOverlayMetadata(
  metadata: OverlayMetadata,
): readonly StorageValidationError[] {
  const errors: StorageValidationError[] = [];

  if (!metadata.metadataId || metadata.metadataId.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_OVERLAY,
      message: 'Overlay metadata is missing a metadata ID.',
      field: 'metadataId',
    });
  }

  if (!metadata.profileId || metadata.profileId.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_CURIOSITY_REFERENCE,
      message: 'Overlay metadata is missing a profile ID.',
      field: 'profileId',
    });
  }

  if (!CANONICAL_OVERLAY_TYPES.includes(metadata.overlayType)) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_OVERLAY,
      message: `Overlay metadata has unsupported overlay type: "${metadata.overlayType}".`,
      field: 'overlayType',
    });
  }

  if (!metadata.overlayScope || metadata.overlayScope.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_CONFIGURATION,
      message: 'Overlay metadata is missing overlay scope.',
      field: 'overlayScope',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Storage Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a storage relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateStorageRelationship(
  relationship: StorageRelationship,
): readonly StorageValidationError[] {
  const errors: StorageValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_CURIOSITY_REFERENCE,
      message: 'Storage relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceProfileId || relationship.sourceProfileId.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_CURIOSITY_REFERENCE,
      message: 'Storage relationship is missing a source profile ID.',
      field: 'sourceProfileId',
    });
  }

  if (!relationship.targetProfileId || relationship.targetProfileId.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_CURIOSITY_REFERENCE,
      message: 'Storage relationship is missing a target profile ID.',
      field: 'targetProfileId',
    });
  }

  if (relationship.sourceProfileId === relationship.targetProfileId) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_SELF_RELATIONSHIP,
      message: 'Storage relationship cannot be a self-relationship.',
      field: 'targetProfileId',
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_PROVENANCE,
      message: 'Storage relationship is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!relationship.provenance.provider || relationship.provenance.provider.trim() === '') {
      errors.push({
        code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_PROVIDER,
        message: 'Storage relationship provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_RATIONALE,
        message: 'Storage relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Storage Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a storage registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateStorageRegistry(
  registry: StorageRegistry,
): StorageRegistryValidationResult {
  const errors: StorageValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate profile IDs
  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.profileId)) {
      errors.push({
        code: STORAGE_VALIDATION_CODES.STORAGE_DUPLICATE_ID,
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
        code: STORAGE_VALIDATION_CODES.STORAGE_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        profileId: profile.profileId,
      });
    }
    seenTitles.add(profile.title);
  }

  // Validate each profile
  for (const profile of registry.profiles) {
    errors.push(...validateCuriosityStorageProfile(profile));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateStorageRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'storage_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Storage Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates storage input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateStorageInput(
  input: StorageInput,
): StorageInputValidationResult {
  const errors: StorageValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateCuriosityStorageProfile(profile));
    }
  }

  for (const relationship of input.relationships) {
    errors.push(...validateStorageRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'storage_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Storage Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a storage trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateStorageTrace(
  trace: CuriosityStorageTrace,
): StorageTraceValidationResult {
  const errors: StorageValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_TRACE,
      message: 'Storage trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_TRACE,
      message: 'Storage trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_TRACE,
      message: 'Storage trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_INVALID_TRACE,
      message: 'Storage trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'storage_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Storage Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity artifact with storage against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityArtifactWithStorage(
  artifact: CuriosityArtifactWithStorage,
): CuriosityArtifactWithStorageValidationResult {
  const errors: StorageValidationError[] = [];

  if (!artifact.curiosityId || artifact.curiosityId.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity artifact is missing a curiosity ID.',
      field: 'curiosityId',
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_TITLE,
      message: 'Curiosity artifact is missing a title.',
      field: 'title',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_EMPTY_REGISTRY,
      message: 'Curiosity artifact has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateCuriosityStorageProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_PROVENANCE,
      message: 'Curiosity artifact is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_PROVIDER,
        message: 'Curiosity artifact provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: STORAGE_VALIDATION_CODES.STORAGE_MISSING_RATIONALE,
        message: 'Curiosity artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_artifact_with_storage_composition',
  };
}
