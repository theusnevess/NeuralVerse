/**
 * NV-2100-D9-OPT-13 — Storage Separation, Retrieval Strategy & Contextual Overlay Modeling
 *
 * Deterministic orchestration functions for storage metadata.
 * Produces storage profiles, retrieval metadata, overlay metadata, traces, and registries.
 *
 * This module never:
 * - Implements storage engines
 * - Creates databases
 * - Executes retrieval algorithms
 * - Performs searches
 * - Ranks results
 * - Executes vector searches
 * - Creates embeddings
 * - Performs contextual reasoning
 * - Executes runtime overlays
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Storage metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CuriosityStorageProfile,
  RetrievalMetadata,
  OverlayMetadata,
  StorageRelationship,
  StorageRegistry,
  StorageRegistryMetadata,
  StorageInput,
  CuriosityStorageProvenance,
  CuriosityStorageDecision,
  CuriosityStorageTrace,
  CuriosityArtifactWithStorage,
  StorageType,
  RetrievalStrategy,
  OverlayType,
  StorageVisibility,
  StorageScope,
  StorageStatus,
  CuriosityGovernance,
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
// Storage Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes storage provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityStorageProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}): CuriosityStorageProvenance {
  return {
    provider: params.provider,
    source: params.source,
    rationale: params.rationale,
    version: params.version,
  };
}

// ---------------------------------------------------------------------------
// Storage Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a storage decision from validation results.
 * Pure function. No side effects.
 */
function _composeCuriosityStorageDecision(
  profileId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): CuriosityStorageDecision {
  return {
    decisionId: `_decision_${profileId}`,
    profileId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Storage Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a storage trace from metadata.
 * Pure function. No side effects.
 */
export function composeCuriosityStorageTrace(params: {
  readonly traceId: string;
}): CuriosityStorageTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_curiosity_storage_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Storage Profile Composition
// ---------------------------------------------------------------------------

/**
 * Composes a storage profile from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityStorageProfile(params: {
  readonly profileId: string;
  readonly title: string;
  readonly storageType: StorageType;
  readonly retrievalStrategy: RetrievalStrategy;
  readonly overlayType: OverlayType;
  readonly storageVisibility: StorageVisibility;
  readonly storageScope: StorageScope;
  readonly conceptIds: readonly string[];
  readonly status: StorageStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityStorageProvenance;
  readonly trace: CuriosityStorageTrace;
}): CuriosityStorageProfile {
  return {
    profileId: params.profileId,
    title: params.title,
    storageType: params.storageType,
    retrievalStrategy: params.retrievalStrategy,
    overlayType: params.overlayType,
    storageVisibility: params.storageVisibility,
    storageScope: params.storageScope,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Retrieval Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes retrieval metadata from provided parameters.
 * Pure function. No side effects.
 */
export function composeRetrievalMetadata(params: {
  readonly metadataId: string;
  readonly profileId: string;
  readonly retrievalStrategy: RetrievalStrategy;
  readonly indexKey: string;
  readonly indexValue: string;
  readonly priority: number;
  readonly contextRequired: readonly string[];
}): RetrievalMetadata {
  return {
    metadataId: params.metadataId,
    profileId: params.profileId,
    retrievalStrategy: params.retrievalStrategy,
    indexKey: params.indexKey,
    indexValue: params.indexValue,
    priority: params.priority,
    contextRequired: [...params.contextRequired],
  };
}

// ---------------------------------------------------------------------------
// Overlay Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes overlay metadata from provided parameters.
 * Pure function. No side effects.
 */
export function composeOverlayMetadata(params: {
  readonly metadataId: string;
  readonly profileId: string;
  readonly overlayType: OverlayType;
  readonly overlayScope: string;
  readonly overlayPriority: number;
  readonly overlayContext: readonly string[];
  readonly overlayDependencies: readonly string[];
}): OverlayMetadata {
  return {
    metadataId: params.metadataId,
    profileId: params.profileId,
    overlayType: params.overlayType,
    overlayScope: params.overlayScope,
    overlayPriority: params.overlayPriority,
    overlayContext: [...params.overlayContext],
    overlayDependencies: [...params.overlayDependencies],
  };
}

// ---------------------------------------------------------------------------
// Storage Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a storage relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeStorageRelationship(params: {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriosityStorageProvenance;
}): StorageRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceProfileId: params.sourceProfileId,
    targetProfileId: params.targetProfileId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Profiles
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for storage profiles.
 * Sorts by profileId, then storageType, then title.
 * Pure function. No side effects.
 */
function _compareCuriosityStorageProfile(
  a: CuriosityStorageProfile,
  b: CuriosityStorageProfile,
): number {
  if (a.profileId < b.profileId) return -1;
  if (a.profileId > b.profileId) return 1;

  if (a.storageType < b.storageType) return -1;
  if (a.storageType > b.storageType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Relationships
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for storage relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _compareStorageRelationship(
  a: StorageRelationship,
  b: StorageRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Storage Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a storage registry from profiles, retrievals, overlays, and relationships.
 * Pure function. No side effects.
 * Deterministic ordering: profileId → storageType → title.
 */
export function composeStorageRegistry(
  profiles: readonly CuriosityStorageProfile[],
  retrievals: readonly RetrievalMetadata[],
  overlays: readonly OverlayMetadata[],
  relationships: readonly StorageRelationship[],
): StorageRegistry {
  const sortedProfiles = [...profiles].sort(_compareCuriosityStorageProfile);
  const sortedRelationships = [...relationships].sort(_compareStorageRelationship);

  const metadata: StorageRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}_${retrievals.length}_${overlays.length}_${sortedRelationships.length}`,
    version: '1.0.0',
    profileCount: sortedProfiles.length,
    retrievalCount: retrievals.length,
    overlayCount: overlays.length,
    relationshipCount: sortedRelationships.length,
  };

  return {
    registryId: metadata.registryId,
    profiles: sortedProfiles,
    retrievals,
    overlays,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedProfiles.length}_${retrievals.length}_${overlays.length}_${sortedRelationships.length}`,
      generatedFrom: 'deterministic_curiosity_storage_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_curiosity_storage_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Storage Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a storage registry from an input.
 * Pure function. No side effects.
 */
export function composeStorageRegistryFromInput(
  input: StorageInput,
): StorageRegistry {
  return composeStorageRegistry(input.profiles, input.retrievals, input.overlays, input.relationships);
}

// ---------------------------------------------------------------------------
// Storage Artifacts Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete storage registry from an input.
 * Pure function. No side effects.
 */
export function composeStorageArtifacts(
  input: StorageInput,
): StorageRegistry {
  const registry = composeStorageRegistry(input.profiles, input.retrievals, input.overlays, input.relationships);

  return {
    ...registry,
    trace: composeCuriosityStorageTrace({
      traceId: `_trace_${input.profiles.length}_${input.retrievals.length}_${input.overlays.length}_${input.relationships.length}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Storage Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact with storage from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifactWithStorage(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly profiles: readonly CuriosityStorageProfile[];
  readonly retrievals: readonly RetrievalMetadata[];
  readonly overlays: readonly OverlayMetadata[];
  readonly relationships: readonly StorageRelationship[];
  readonly provenance: CuriosityStorageProvenance;
}): CuriosityArtifactWithStorage {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    profiles: [...params.profiles],
    retrievals: [...params.retrievals],
    overlays: [...params.overlays],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported storage type.
 */
export function isSupportedStorageType(
  storageType: string,
): storageType is StorageType {
  return CANONICAL_STORAGE_TYPES.includes(storageType as StorageType);
}

/**
 * Checks if a string is a supported retrieval strategy.
 */
export function isSupportedRetrievalStrategy(
  strategy: string,
): strategy is RetrievalStrategy {
  return CANONICAL_RETRIEVAL_STRATEGIES.includes(strategy as RetrievalStrategy);
}

/**
 * Checks if a string is a supported overlay type.
 */
export function isSupportedOverlayType(
  overlayType: string,
): overlayType is OverlayType {
  return CANONICAL_OVERLAY_TYPES.includes(overlayType as OverlayType);
}

/**
 * Checks if a string is a supported storage visibility.
 */
export function isSupportedStorageVisibility(
  visibility: string,
): visibility is StorageVisibility {
  return CANONICAL_STORAGE_VISIBILITY.includes(visibility as StorageVisibility);
}

/**
 * Checks if a string is a supported storage scope.
 */
export function isSupportedStorageScope(
  scope: string,
): scope is StorageScope {
  return CANONICAL_STORAGE_SCOPE.includes(scope as StorageScope);
}

/**
 * Checks if a string is a supported storage status.
 */
export function isSupportedStorageStatus(
  status: string,
): status is StorageStatus {
  return CANONICAL_STORAGE_STATUS.includes(status as StorageStatus);
}

/**
 * Checks if a string is a supported storage governance.
 */
export function isSupportedStorageGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical storage types.
 */
export function getCanonicalStorageTypes(): readonly StorageType[] {
  return [...CANONICAL_STORAGE_TYPES];
}

/**
 * Returns the canonical retrieval strategies.
 */
export function getCanonicalRetrievalStrategies(): readonly RetrievalStrategy[] {
  return [...CANONICAL_RETRIEVAL_STRATEGIES];
}

/**
 * Returns the canonical overlay types.
 */
export function getCanonicalOverlayTypes(): readonly OverlayType[] {
  return [...CANONICAL_OVERLAY_TYPES];
}

/**
 * Returns the canonical storage visibility values.
 */
export function getCanonicalStorageVisibility(): readonly StorageVisibility[] {
  return [...CANONICAL_STORAGE_VISIBILITY];
}

/**
 * Returns the canonical storage scopes.
 */
export function getCanonicalStorageScopes(): readonly StorageScope[] {
  return [...CANONICAL_STORAGE_SCOPE];
}

/**
 * Returns the canonical storage statuses.
 */
export function getCanonicalStorageStatuses(): readonly StorageStatus[] {
  return [...CANONICAL_STORAGE_STATUS];
}
