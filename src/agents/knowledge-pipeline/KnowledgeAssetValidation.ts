/**
 * D10-OPT-15 — Premium Asset Governance Validation Layer
 *
 * Deterministic validation for premium asset metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeAssetProfile,
  KnowledgeAssetRelationship,
  KnowledgeAssetRegistry,
  KnowledgeAssetTrace,
  KnowledgeAssetInput,
  KnowledgeArtifactWithAssets,
  KnowledgeAssetValidationError,
  KnowledgeAssetRegistryValidationResult,
  KnowledgeAssetInputValidationResult,
  KnowledgeAssetTraceValidationResult,
  KnowledgeArtifactWithAssetsValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_ASSET_TYPES,
  CANONICAL_ASSET_PURPOSES,
  CANONICAL_ASSET_ACCESS,
  CANONICAL_ASSET_STATUS,
  CANONICAL_ASSET_VISIBILITY,
  CANONICAL_ASSET_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix ASSET_)
// ---------------------------------------------------------------------------

export const ASSET_VALIDATION_CODES = {
  ASSET_DUPLICATE_ID: 'ASSET_DUPLICATE_ID',
  ASSET_DUPLICATE_TITLE: 'ASSET_DUPLICATE_TITLE',
  ASSET_INVALID_TYPE: 'ASSET_INVALID_TYPE',
  ASSET_INVALID_PURPOSE: 'ASSET_INVALID_PURPOSE',
  ASSET_INVALID_ACCESS: 'ASSET_INVALID_ACCESS',
  ASSET_INVALID_VISIBILITY: 'ASSET_INVALID_VISIBILITY',
  ASSET_INVALID_STATUS: 'ASSET_INVALID_STATUS',
  ASSET_INVALID_GOVERNANCE: 'ASSET_INVALID_GOVERNANCE',
  ASSET_MISSING_PROVENANCE: 'ASSET_MISSING_PROVENANCE',
  ASSET_MISSING_PROVIDER: 'ASSET_MISSING_PROVIDER',
  ASSET_MISSING_RATIONALE: 'ASSET_MISSING_RATIONALE',
  ASSET_MISSING_CONCEPT_REFERENCE: 'ASSET_MISSING_CONCEPT_REFERENCE',
  ASSET_MISSING_PROFILE_ID: 'ASSET_MISSING_PROFILE_ID',
  ASSET_MISSING_TITLE: 'ASSET_MISSING_TITLE',
  ASSET_SELF_RELATIONSHIP: 'ASSET_SELF_RELATIONSHIP',
  ASSET_EMPTY_REGISTRY: 'ASSET_EMPTY_REGISTRY',
  ASSET_INVALID_TRACE: 'ASSET_INVALID_TRACE',
  ASSET_REGISTRY_INCONSISTENCY: 'ASSET_REGISTRY_INCONSISTENCY',
  ASSET_INVALID_CONFIGURATION: 'ASSET_INVALID_CONFIGURATION',
  ASSET_INVALID_ORDER: 'ASSET_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeAssetProfile(
  profile: KnowledgeAssetProfile,
): readonly KnowledgeAssetValidationError[] {
  const errors: KnowledgeAssetValidationError[] = [];

  if (!profile.assetId || profile.assetId.trim() === '') {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_MISSING_PROFILE_ID,
      message: 'Asset profile is missing a profile ID.',
      field: 'assetId',
      assetId: profile.assetId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_MISSING_TITLE,
      message: 'Asset profile is missing a title.',
      field: 'title',
      assetId: profile.assetId,
    });
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_MISSING_CONCEPT_REFERENCE,
      message: 'Asset profile is missing a concept reference.',
      field: 'conceptId',
      assetId: profile.assetId,
    });
  }

  if (!CANONICAL_ASSET_TYPES.includes(profile.assetType)) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_TYPE,
      message: `Asset profile has unsupported type: "${profile.assetType}".`,
      field: 'assetType',
      assetId: profile.assetId,
    });
  }

  if (!CANONICAL_ASSET_PURPOSES.includes(profile.purpose)) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_PURPOSE,
      message: `Asset profile has unsupported purpose: "${profile.purpose}".`,
      field: 'purpose',
      assetId: profile.assetId,
    });
  }

  if (!CANONICAL_ASSET_ACCESS.includes(profile.accessLevel)) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_ACCESS,
      message: `Asset profile has unsupported access level: "${profile.accessLevel}".`,
      field: 'accessLevel',
      assetId: profile.assetId,
    });
  }

  if (!CANONICAL_ASSET_VISIBILITY.includes(profile.visibility)) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_VISIBILITY,
      message: `Asset profile has unsupported visibility: "${profile.visibility}".`,
      field: 'visibility',
      assetId: profile.assetId,
    });
  }

  if (!CANONICAL_ASSET_STATUS.includes(profile.status)) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_STATUS,
      message: `Asset profile has unsupported status: "${profile.status}".`,
      field: 'status',
      assetId: profile.assetId,
    });
  }

  if (!CANONICAL_ASSET_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_GOVERNANCE,
      message: `Asset profile has unsupported governance: "${profile.governance}".`,
      field: 'governance',
      assetId: profile.assetId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_MISSING_PROVENANCE,
      message: 'Asset profile is missing provenance.',
      field: 'provenance',
      assetId: profile.assetId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: ASSET_VALIDATION_CODES.ASSET_MISSING_PROVIDER,
        message: 'Asset provenance is missing a provider.',
        field: 'provenance.provider',
        assetId: profile.assetId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: ASSET_VALIDATION_CODES.ASSET_MISSING_RATIONALE,
        message: 'Asset provenance is missing a rationale.',
        field: 'provenance.rationale',
        assetId: profile.assetId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeAssetRelationship(
  relationship: KnowledgeAssetRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeAssetValidationError[] {
  const errors: KnowledgeAssetValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_MISSING_PROFILE_ID,
      message: 'Asset relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceAssetId === relationship.targetAssetId) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_SELF_RELATIONSHIP,
      message: 'Asset relationship cannot reference itself.',
      field: 'targetAssetId',
      assetId: relationship.sourceAssetId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceAssetId)) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_CONFIGURATION,
      message: `Asset relationship references unknown source profile: "${relationship.sourceAssetId}".`,
      field: 'sourceAssetId',
      assetId: relationship.sourceAssetId,
    });
  }

  if (!knownProfileIds.has(relationship.targetAssetId)) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_CONFIGURATION,
      message: `Asset relationship references unknown target profile: "${relationship.targetAssetId}".`,
      field: 'targetAssetId',
      assetId: relationship.targetAssetId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_MISSING_PROVENANCE,
      message: 'Asset relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Asset Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeAssetRegistry(
  registry: KnowledgeAssetRegistry,
): KnowledgeAssetRegistryValidationResult {
  const errors: KnowledgeAssetValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.assetId)) {
      errors.push({
        code: ASSET_VALIDATION_CODES.ASSET_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.assetId}".`,
        assetId: profile.assetId,
      });
    }
    seenIds.add(profile.assetId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: ASSET_VALIDATION_CODES.ASSET_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        assetId: profile.assetId,
      });
    }
    seenTitles.add(profile.title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeAssetProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.assetId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeAssetRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.assetCount !== registry.profiles.length) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_REGISTRY_INCONSISTENCY,
      message: `Registry metadata asset count (${registry.metadata.assetCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.assetCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_asset_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Asset Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeAssetInput(
  input: KnowledgeAssetInput,
): KnowledgeAssetInputValidationResult {
  const errors: KnowledgeAssetValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeAssetProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_asset_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Asset Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeAssetTrace(
  trace: KnowledgeAssetTrace,
): KnowledgeAssetTraceValidationResult {
  const errors: KnowledgeAssetValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_TRACE,
      message: 'Asset trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_TRACE,
      message: 'Asset trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_TRACE,
      message: 'Asset trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_INVALID_TRACE,
      message: 'Asset trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_asset_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Assets Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithAssets(
  artifact: KnowledgeArtifactWithAssets,
): KnowledgeArtifactWithAssetsValidationResult {
  const errors: KnowledgeAssetValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_EMPTY_REGISTRY,
      message: 'Artifact has no asset profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeAssetProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: ASSET_VALIDATION_CODES.ASSET_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_assets_composition',
  };
}
