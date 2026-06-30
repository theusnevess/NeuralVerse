/**
 * D10-OPT-15 — Premium Asset Governance Kernel
 *
 * Deterministic orchestration functions for premium asset metadata.
 * Produces asset profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Generates assets
 * - Renders assets
 * - Downloads assets
 * - Manages storage
 * - Performs licensing decisions at runtime
 * - Uses image generation
 * - Uses video generation
 * - Uses animation generation
 * - Uses PDF generation
 * - Uses download engines
 * - Uses streaming
 * - Uses file serving
 * - Uses asset rendering
 * - Uses asset optimization
 * - Uses CDN integration
 * - Uses license verification
 * - Uses payment verification
 * - Uses subscription validation
 * - Uses DRM
 * - Uses cloud storage
 * - Uses object storage
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Premium asset metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeAssetProfile,
  KnowledgeAssetProvenance,
  KnowledgeAssetDecision,
  KnowledgeAssetTrace,
  KnowledgeAssetRegistry,
  KnowledgeAssetRegistryMetadata,
  KnowledgeAssetInput,
  KnowledgeAssetRelationship,
  KnowledgeArtifactWithAssets,
  AssetType,
  AssetPurpose,
  AssetAccess,
  AssetVisibility,
  AssetStatus,
  AssetGovernance,
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
// Asset Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeAssetProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: AssetGovernance;
}): KnowledgeAssetProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Asset Decision Composition
// ---------------------------------------------------------------------------

function _composeAssetDecision(
  assetId: string,
  conceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeAssetDecision {
  return {
    decisionId: `_decision_${assetId}`,
    assetId,
    conceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Asset Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeAssetTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeAssetDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeAssetTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_asset_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Asset Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeAssetProfile(params: {
  readonly assetId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly assetType: AssetType;
  readonly purpose: AssetPurpose;
  readonly accessLevel: AssetAccess;
  readonly visibility: AssetVisibility;
  readonly status: AssetStatus;
  readonly governance: AssetGovernance;
  readonly resourceReference: string;
  readonly licenseReference: string;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeAssetProvenance;
}): KnowledgeAssetProfile {
  return {
    assetId: params.assetId,
    conceptId: params.conceptId,
    title: params.title,
    assetType: params.assetType,
    purpose: params.purpose,
    accessLevel: params.accessLevel,
    visibility: params.visibility,
    status: params.status,
    governance: params.governance,
    resourceReference: params.resourceReference,
    licenseReference: params.licenseReference,
    tags: [...params.tags],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Asset Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeAssetRelationship(params: {
  readonly relationshipId: string;
  readonly sourceAssetId: string;
  readonly targetAssetId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeAssetProvenance;
}): KnowledgeAssetRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceAssetId: params.sourceAssetId,
    targetAssetId: params.targetAssetId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeAssetProfile(
  a: KnowledgeAssetProfile,
  b: KnowledgeAssetProfile,
): number {
  if (a.conceptId < b.conceptId) return -1;
  if (a.conceptId > b.conceptId) return 1;

  if (a.assetType < b.assetType) return -1;
  if (a.assetType > b.assetType) return 1;

  if (a.accessLevel < b.accessLevel) return -1;
  if (a.accessLevel > b.accessLevel) return 1;

  if (a.assetId < b.assetId) return -1;
  if (a.assetId > b.assetId) return 1;

  return 0;
}

function _compareKnowledgeAssetRelationship(
  a: KnowledgeAssetRelationship,
  b: KnowledgeAssetRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Asset Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeAssetRegistry(
  profiles: readonly KnowledgeAssetProfile[],
  relationships: readonly KnowledgeAssetRelationship[],
): KnowledgeAssetRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeAssetProfile);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeAssetRelationship);

  const concepts = new Set(sortedProfiles.map((p) => p.conceptId));
  const assetTypes = new Set(sortedProfiles.map((p) => p.assetType));

  const metadata: KnowledgeAssetRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    assetCount: sortedProfiles.length,
    relationshipCount: sortedRelationships.length,
    conceptCount: concepts.size,
    assetTypeCount: assetTypes.size,
  };

  return {
    registryId: metadata.registryId,
    profiles: sortedProfiles,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedProfiles.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_asset_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_asset_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Asset Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeAssetRegistryFromInput(
  input: KnowledgeAssetInput,
): KnowledgeAssetRegistry {
  return composeKnowledgeAssetRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Asset Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeAssets(
  input: KnowledgeAssetInput,
): KnowledgeAssetRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateAssetForDecision(profile);
    return _composeAssetDecision(profile.assetId, profile.conceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeAssetRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeAssetTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateAssetForDecision(
  profile: KnowledgeAssetProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.assetId || profile.assetId.trim() === '') {
    errors.push('ASSET_MISSING_PROFILE_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('ASSET_MISSING_TITLE');
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push('ASSET_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_ASSET_TYPES.includes(profile.assetType)) {
    errors.push('ASSET_INVALID_TYPE');
  }

  if (!CANONICAL_ASSET_PURPOSES.includes(profile.purpose)) {
    errors.push('ASSET_INVALID_PURPOSE');
  }

  if (!CANONICAL_ASSET_ACCESS.includes(profile.accessLevel)) {
    errors.push('ASSET_INVALID_ACCESS');
  }

  if (!CANONICAL_ASSET_VISIBILITY.includes(profile.visibility)) {
    errors.push('ASSET_INVALID_VISIBILITY');
  }

  if (!CANONICAL_ASSET_STATUS.includes(profile.status)) {
    errors.push('ASSET_INVALID_STATUS');
  }

  if (!CANONICAL_ASSET_GOVERNANCE.includes(profile.governance)) {
    errors.push('ASSET_INVALID_GOVERNANCE');
  }

  if (!profile.provenance) {
    errors.push('ASSET_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Assets Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithAssets(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeAssetProfile[];
  readonly relationships: readonly KnowledgeAssetRelationship[];
  readonly provenance: KnowledgeAssetProvenance;
}): KnowledgeArtifactWithAssets {
  return {
    conceptId: params.conceptId,
    conceptTitle: params.conceptTitle,
    profiles: [...params.profiles],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedAssetType(
  value: string,
): value is AssetType {
  return CANONICAL_ASSET_TYPES.includes(value as AssetType);
}

export function isSupportedAssetPurpose(
  value: string,
): value is AssetPurpose {
  return CANONICAL_ASSET_PURPOSES.includes(value as AssetPurpose);
}

export function isSupportedAssetAccess(
  value: string,
): value is AssetAccess {
  return CANONICAL_ASSET_ACCESS.includes(value as AssetAccess);
}

export function isSupportedAssetVisibility(
  value: string,
): value is AssetVisibility {
  return CANONICAL_ASSET_VISIBILITY.includes(value as AssetVisibility);
}

export function isSupportedAssetStatus(
  value: string,
): value is AssetStatus {
  return CANONICAL_ASSET_STATUS.includes(value as AssetStatus);
}

export function isSupportedAssetGovernance(
  value: string,
): value is AssetGovernance {
  return CANONICAL_ASSET_GOVERNANCE.includes(value as AssetGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalAssetTypes(): readonly AssetType[] {
  return CANONICAL_ASSET_TYPES;
}

export function getCanonicalAssetPurposes(): readonly AssetPurpose[] {
  return CANONICAL_ASSET_PURPOSES;
}

export function getCanonicalAssetAccessLevels(): readonly AssetAccess[] {
  return CANONICAL_ASSET_ACCESS;
}

export function getCanonicalAssetVisibility(): readonly AssetVisibility[] {
  return CANONICAL_ASSET_VISIBILITY;
}

export function getCanonicalAssetStatuses(): readonly AssetStatus[] {
  return CANONICAL_ASSET_STATUS;
}
