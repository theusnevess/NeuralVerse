/**
 * NV-1900-D7-OPT-12 — Visual Application Layer & Asset Governance Kernel
 *
 * Deterministic orchestration functions for visual asset metadata.
 * Produces assets, relationships, governance, traces, and registries.
 *
 * This module never:
 * - Generates images
 * - Renders diagrams
 * - Creates illustrations
 * - Invokes image-generation models
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Visual asset metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  VisualAsset,
  VisualAssetProvenance,
  VisualRelationship,
  VisualGovernance,
  VisualAssetDecision,
  VisualAssetTraceDecision,
  VisualAssetTrace,
  VisualAssetRegistry,
  VisualAssetRegistryMetadata,
  VisualAssetInput,
  VisualAssetType,
  VisualRepresentationType,
  VisualPurposeType,
  VisualRelationshipType,
  VisualGovernanceLevel,
  VisualAssetStatus,
  ApplicationGovernanceStatus,
  ApplicationNode,
  ApplicationArtifactWithVisualAssets,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_VISUAL_ASSET_TYPES,
  CANONICAL_VISUAL_REPRESENTATION_TYPES,
  CANONICAL_VISUAL_PURPOSE_TYPES,
  CANONICAL_VISUAL_RELATIONSHIP_TYPES,
  CANONICAL_VISUAL_GOVERNANCE_LEVELS,
  CANONICAL_VISUAL_ASSET_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Visual Asset Provenance Composition
// ---------------------------------------------------------------------------

export function composeVisualAssetProvenance(params: {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}): VisualAssetProvenance {
  return {
    providedBy: params.providedBy,
    rationale: params.rationale,
    reviewedBy: params.reviewedBy,
    reviewDate: params.reviewDate,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Visual Asset Composition
// ---------------------------------------------------------------------------

export function composeVisualAsset(params: {
  readonly assetId: string;
  readonly title: string;
  readonly assetType: VisualAssetType;
  readonly representationType: VisualRepresentationType;
  readonly purposeType: VisualPurposeType;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly status: VisualAssetStatus;
  readonly provenance: VisualAssetProvenance;
}): VisualAsset {
  return {
    assetId: params.assetId,
    title: params.title,
    assetType: params.assetType,
    representationType: params.representationType,
    purposeType: params.purposeType,
    applicationArtifactId: params.applicationArtifactId,
    knowledgeArtifactId: params.knowledgeArtifactId,
    status: params.status,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Visual Relationship Composition
// ---------------------------------------------------------------------------

export function composeVisualRelationship(params: {
  readonly relationshipId: string;
  readonly assetId: string;
  readonly relationshipType: VisualRelationshipType;
  readonly targetId: string;
  readonly description: string;
  readonly provenance: VisualAssetProvenance;
}): VisualRelationship {
  return {
    relationshipId: params.relationshipId,
    assetId: params.assetId,
    relationshipType: params.relationshipType,
    targetId: params.targetId,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Visual Governance Composition
// ---------------------------------------------------------------------------

export function composeVisualGovernance(params: {
  readonly governanceId: string;
  readonly assetId: string;
  readonly governanceLevel: VisualGovernanceLevel;
  readonly description: string;
  readonly provenance: VisualAssetProvenance;
}): VisualGovernance {
  return {
    governanceId: params.governanceId,
    assetId: params.assetId,
    governanceLevel: params.governanceLevel,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Visual Asset Decision Composition
// ---------------------------------------------------------------------------

export function composeVisualAssetDecision(params: {
  readonly decisionId: string;
  readonly assetId: string;
  readonly description: string;
  readonly provenance: VisualAssetProvenance;
}): VisualAssetDecision {
  return {
    decisionId: params.decisionId,
    assetId: params.assetId,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Visual Asset Trace Decision Composition
// ---------------------------------------------------------------------------

function _composeVisualAssetTraceDecision(
  assetId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): VisualAssetTraceDecision {
  return {
    decisionId: `_decision_${assetId}`,
    assetId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Visual Asset Trace Composition
// ---------------------------------------------------------------------------

export function composeVisualAssetTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly VisualAssetTraceDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): VisualAssetTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_visual_asset_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

function _compareAsset(
  a: VisualAsset,
  b: VisualAsset,
): number {
  if (a.assetId < b.assetId) return -1;
  if (a.assetId > b.assetId) return 1;
  if (a.assetType < b.assetType) return -1;
  if (a.assetType > b.assetType) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareRelationship(
  a: VisualRelationship,
  b: VisualRelationship,
): number {
  if (a.assetId < b.assetId) return -1;
  if (a.assetId > b.assetId) return 1;
  if (a.relationshipType < b.relationshipType) return -1;
  if (a.relationshipType > b.relationshipType) return 1;
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;
  return 0;
}

function _compareGovernance(
  a: VisualGovernance,
  b: VisualGovernance,
): number {
  if (a.assetId < b.assetId) return -1;
  if (a.assetId > b.assetId) return 1;
  if (a.governanceLevel < b.governanceLevel) return -1;
  if (a.governanceLevel > b.governanceLevel) return 1;
  if (a.governanceId < b.governanceId) return -1;
  if (a.governanceId > b.governanceId) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Visual Asset Registry Composition
// ---------------------------------------------------------------------------

export function composeVisualAssetRegistry(
  assets: readonly VisualAsset[],
  relationships: readonly VisualRelationship[],
  governance: readonly VisualGovernance[],
): VisualAssetRegistry {
  const sortedAssets = [...assets].sort(_compareAsset);
  const sortedRelationships = [...relationships].sort(_compareRelationship);
  const sortedGovernance = [...governance].sort(_compareGovernance);

  const types = new Set(sortedAssets.map((a) => a.assetType));

  const metadata: VisualAssetRegistryMetadata = {
    registryId: `_registry_${sortedAssets.length}_${sortedRelationships.length}_${sortedGovernance.length}`,
    assetCount: sortedAssets.length,
    relationshipCount: sortedRelationships.length,
    governanceCount: sortedGovernance.length,
    typeCount: types.size,
  };

  return {
    registryId: metadata.registryId,
    assets: sortedAssets,
    relationships: sortedRelationships,
    governance: sortedGovernance,
    metadata,
    trace: {
      traceId: `_trace_${sortedAssets.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_visual_asset_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_visual_asset_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Visual Asset Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeVisualAssetRegistryFromInput(
  input: VisualAssetInput,
): VisualAssetRegistry {
  return composeVisualAssetRegistry(
    input.assets,
    input.relationships,
    input.governance,
  );
}

// ---------------------------------------------------------------------------
// Visual Asset Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeVisualAssets(
  input: VisualAssetInput,
): VisualAssetRegistry {
  const decisions = input.assets.map((asset) => {
    const errors = _validateAssetForDecision(asset);
    return _composeVisualAssetTraceDecision(asset.assetId, errors.length === 0, errors);
  });

  const registry = composeVisualAssetRegistry(
    input.assets,
    input.relationships,
    input.governance,
  );

  return {
    ...registry,
    trace: composeVisualAssetTrace({
      traceId: `_trace_${input.assets.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Visual Assets Composition
// ---------------------------------------------------------------------------

export function composeApplicationArtifactWithVisualAssets(params: {
  readonly applicationNode: ApplicationNode;
  readonly visualAssetRegistry: VisualAssetRegistry;
}): ApplicationArtifactWithVisualAssets {
  return {
    applicationNode: { ...params.applicationNode },
    visualAssetRegistry: { ...params.visualAssetRegistry },
    deterministic: true,
    generatedFrom: 'deterministic_visual_asset_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Visual Asset Decision Validation
// ---------------------------------------------------------------------------

function _validateAssetForDecision(
  asset: VisualAsset,
): readonly string[] {
  const errors: string[] = [];

  if (!asset.assetId || asset.assetId.trim() === '') {
    errors.push('VISUAL_MISSING_ASSET_ID');
  }

  if (!asset.title || asset.title.trim() === '') {
    errors.push('VISUAL_MISSING_TITLE');
  }

  if (!CANONICAL_VISUAL_ASSET_TYPES.includes(asset.assetType)) {
    errors.push('VISUAL_INVALID_ASSET_TYPE');
  }

  if (!CANONICAL_VISUAL_REPRESENTATION_TYPES.includes(asset.representationType)) {
    errors.push('VISUAL_INVALID_REPRESENTATION');
  }

  if (!CANONICAL_VISUAL_PURPOSE_TYPES.includes(asset.purposeType)) {
    errors.push('VISUAL_INVALID_PURPOSE');
  }

  if (!CANONICAL_VISUAL_ASSET_STATUS.includes(asset.status)) {
    errors.push('VISUAL_INVALID_STATUS');
  }

  if (!asset.provenance) {
    errors.push('VISUAL_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedVisualAssetType(
  assetType: string,
): assetType is VisualAssetType {
  return CANONICAL_VISUAL_ASSET_TYPES.includes(assetType as VisualAssetType);
}

export function isSupportedVisualRepresentationType(
  representationType: string,
): representationType is VisualRepresentationType {
  return CANONICAL_VISUAL_REPRESENTATION_TYPES.includes(representationType as VisualRepresentationType);
}

export function isSupportedVisualPurposeType(
  purposeType: string,
): purposeType is VisualPurposeType {
  return CANONICAL_VISUAL_PURPOSE_TYPES.includes(purposeType as VisualPurposeType);
}

export function isSupportedVisualRelationshipType(
  relationshipType: string,
): relationshipType is VisualRelationshipType {
  return CANONICAL_VISUAL_RELATIONSHIP_TYPES.includes(relationshipType as VisualRelationshipType);
}

export function isSupportedVisualGovernanceLevel(
  governanceLevel: string,
): governanceLevel is VisualGovernanceLevel {
  return CANONICAL_VISUAL_GOVERNANCE_LEVELS.includes(governanceLevel as VisualGovernanceLevel);
}

export function isSupportedVisualAssetStatus(
  status: string,
): status is VisualAssetStatus {
  return CANONICAL_VISUAL_ASSET_STATUS.includes(status as VisualAssetStatus);
}

export function isSupportedVisualAssetGovernance(
  governanceStatus: string,
): governanceStatus is ApplicationGovernanceStatus {
  return CANONICAL_APPLICATION_GOVERNANCE.includes(
    governanceStatus as ApplicationGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalVisualAssetTypes(): readonly VisualAssetType[] {
  return CANONICAL_VISUAL_ASSET_TYPES;
}

export function getCanonicalVisualRepresentationTypes(): readonly VisualRepresentationType[] {
  return CANONICAL_VISUAL_REPRESENTATION_TYPES;
}

export function getCanonicalVisualPurposeTypes(): readonly VisualPurposeType[] {
  return CANONICAL_VISUAL_PURPOSE_TYPES;
}

export function getCanonicalVisualRelationshipTypes(): readonly VisualRelationshipType[] {
  return CANONICAL_VISUAL_RELATIONSHIP_TYPES;
}

export function getCanonicalVisualGovernanceLevels(): readonly VisualGovernanceLevel[] {
  return CANONICAL_VISUAL_GOVERNANCE_LEVELS;
}

export function getCanonicalVisualAssetStatuses(): readonly VisualAssetStatus[] {
  return CANONICAL_VISUAL_ASSET_STATUS;
}
