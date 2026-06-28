/**
 * NV-1900-D7-OPT-12 — Visual Asset Validation Layer
 *
 * Deterministic validation for visual asset metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  VisualAsset,
  VisualRelationship,
  VisualGovernance,
  VisualAssetRegistry,
  VisualAssetTrace,
  VisualAssetInput,
  VisualAssetValidationError,
  VisualAssetRegistryValidationResult,
  VisualAssetInputValidationResult,
  VisualAssetTraceValidationResult,
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
// Validation Error Codes
// ---------------------------------------------------------------------------

export const VISUAL_VALIDATION_CODES = {
  VISUAL_DUPLICATE_ID: 'VISUAL_DUPLICATE_ID',
  VISUAL_DUPLICATE_TITLE: 'VISUAL_DUPLICATE_TITLE',
  VISUAL_RELATIONSHIP_DUPLICATE_ID: 'VISUAL_RELATIONSHIP_DUPLICATE_ID',
  VISUAL_GOVERNANCE_DUPLICATE_ID: 'VISUAL_GOVERNANCE_DUPLICATE_ID',
  VISUAL_INVALID_ASSET_TYPE: 'VISUAL_INVALID_ASSET_TYPE',
  VISUAL_INVALID_REPRESENTATION: 'VISUAL_INVALID_REPRESENTATION',
  VISUAL_INVALID_PURPOSE: 'VISUAL_INVALID_PURPOSE',
  VISUAL_INVALID_RELATIONSHIP: 'VISUAL_INVALID_RELATIONSHIP',
  VISUAL_INVALID_GOVERNANCE: 'VISUAL_INVALID_GOVERNANCE',
  VISUAL_INVALID_STATUS: 'VISUAL_INVALID_STATUS',
  VISUAL_MISSING_PROVENANCE: 'VISUAL_MISSING_PROVENANCE',
  VISUAL_MISSING_PROVIDER: 'VISUAL_MISSING_PROVIDER',
  VISUAL_MISSING_RATIONALE: 'VISUAL_MISSING_RATIONALE',
  VISUAL_MISSING_APPLICATION_REFERENCE: 'VISUAL_MISSING_APPLICATION_REFERENCE',
  VISUAL_MISSING_KNOWLEDGE_REFERENCE: 'VISUAL_MISSING_KNOWLEDGE_REFERENCE',
  VISUAL_MISSING_ASSET_ID: 'VISUAL_MISSING_ASSET_ID',
  VISUAL_MISSING_TITLE: 'VISUAL_MISSING_TITLE',
  VISUAL_EMPTY_REGISTRY: 'VISUAL_EMPTY_REGISTRY',
  VISUAL_INVALID_TRACE: 'VISUAL_INVALID_TRACE',
  VISUAL_REGISTRY_INCONSISTENCY: 'VISUAL_REGISTRY_INCONSISTENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Visual Asset Validation
// ---------------------------------------------------------------------------

export function validateVisualAsset(
  asset: VisualAsset,
): readonly VisualAssetValidationError[] {
  const errors: VisualAssetValidationError[] = [];

  if (!asset.assetId || asset.assetId.trim() === '') {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_MISSING_ASSET_ID,
      message: 'Visual asset is missing an asset ID.',
      field: 'assetId',
      assetId: asset.assetId,
    });
  }

  if (!asset.title || asset.title.trim() === '') {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_MISSING_TITLE,
      message: 'Visual asset is missing a title.',
      field: 'title',
      assetId: asset.assetId,
    });
  }

  if (!CANONICAL_VISUAL_ASSET_TYPES.includes(asset.assetType)) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_ASSET_TYPE,
      message: `Visual asset has unsupported type: "${asset.assetType}".`,
      field: 'assetType',
      assetId: asset.assetId,
    });
  }

  if (!CANONICAL_VISUAL_REPRESENTATION_TYPES.includes(asset.representationType)) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_REPRESENTATION,
      message: `Visual asset has unsupported representation: "${asset.representationType}".`,
      field: 'representationType',
      assetId: asset.assetId,
    });
  }

  if (!CANONICAL_VISUAL_PURPOSE_TYPES.includes(asset.purposeType)) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_PURPOSE,
      message: `Visual asset has unsupported purpose: "${asset.purposeType}".`,
      field: 'purposeType',
      assetId: asset.assetId,
    });
  }

  if (!CANONICAL_VISUAL_ASSET_STATUS.includes(asset.status)) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_STATUS,
      message: `Visual asset has unsupported status: "${asset.status}".`,
      field: 'status',
      assetId: asset.assetId,
    });
  }

  if (!asset.applicationArtifactId || asset.applicationArtifactId.trim() === '') {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_MISSING_APPLICATION_REFERENCE,
      message: 'Visual asset is missing applicationArtifactId.',
      field: 'applicationArtifactId',
      assetId: asset.assetId,
    });
  }

  if (!asset.knowledgeArtifactId || asset.knowledgeArtifactId.trim() === '') {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_MISSING_KNOWLEDGE_REFERENCE,
      message: 'Visual asset is missing knowledgeArtifactId.',
      field: 'knowledgeArtifactId',
      assetId: asset.assetId,
    });
  }

  if (!asset.provenance) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_MISSING_PROVENANCE,
      message: 'Visual asset is missing provenance.',
      field: 'provenance',
      assetId: asset.assetId,
    });
  } else {
    if (!asset.provenance.providedBy || asset.provenance.providedBy.trim() === '') {
      errors.push({
        code: VISUAL_VALIDATION_CODES.VISUAL_MISSING_PROVIDER,
        message: 'Asset provenance is missing providedBy.',
        field: 'provenance.providedBy',
        assetId: asset.assetId,
      });
    }

    if (!asset.provenance.rationale || asset.provenance.rationale.trim() === '') {
      errors.push({
        code: VISUAL_VALIDATION_CODES.VISUAL_MISSING_RATIONALE,
        message: 'Asset provenance is missing rationale.',
        field: 'provenance.rationale',
        assetId: asset.assetId,
      });
    }

    if (!CANONICAL_APPLICATION_GOVERNANCE.includes(asset.provenance.governanceStatus)) {
      errors.push({
        code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_GOVERNANCE,
        message: `Asset provenance has invalid governance status: "${asset.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        assetId: asset.assetId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Visual Relationship Validation
// ---------------------------------------------------------------------------

export function validateVisualRelationship(
  relationship: VisualRelationship,
): readonly VisualAssetValidationError[] {
  const errors: VisualAssetValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_RELATIONSHIP_DUPLICATE_ID,
      message: 'Visual relationship is missing a relationship ID.',
      field: 'relationshipId',
      relationshipId: relationship.relationshipId,
    });
  }

  if (!CANONICAL_VISUAL_RELATIONSHIP_TYPES.includes(relationship.relationshipType)) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_RELATIONSHIP,
      message: `Visual relationship has unsupported type: "${relationship.relationshipType}".`,
      field: 'relationshipType',
      relationshipId: relationship.relationshipId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_MISSING_PROVENANCE,
      message: 'Visual relationship is missing provenance.',
      field: 'provenance',
      relationshipId: relationship.relationshipId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Visual Governance Validation
// ---------------------------------------------------------------------------

export function validateVisualGovernance(
  governance: VisualGovernance,
): readonly VisualAssetValidationError[] {
  const errors: VisualAssetValidationError[] = [];

  if (!governance.governanceId || governance.governanceId.trim() === '') {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_GOVERNANCE_DUPLICATE_ID,
      message: 'Visual governance is missing a governance ID.',
      field: 'governanceId',
      governanceId: governance.governanceId,
    });
  }

  if (!CANONICAL_VISUAL_GOVERNANCE_LEVELS.includes(governance.governanceLevel)) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_GOVERNANCE,
      message: `Visual governance has unsupported level: "${governance.governanceLevel}".`,
      field: 'governanceLevel',
      governanceId: governance.governanceId,
    });
  }

  if (!governance.provenance) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_MISSING_PROVENANCE,
      message: 'Visual governance is missing provenance.',
      field: 'provenance',
      governanceId: governance.governanceId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Visual Asset Registry Validation
// ---------------------------------------------------------------------------

export function validateVisualAssetRegistry(
  registry: VisualAssetRegistry,
): VisualAssetRegistryValidationResult {
  const errors: VisualAssetValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.assets || registry.assets.length === 0) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_EMPTY_REGISTRY,
      message: 'Registry has no assets.',
      field: 'assets',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Duplicate asset IDs
  const seenAssetIds = new Set<string>();
  for (const a of registry.assets) {
    if (seenAssetIds.has(a.assetId)) {
      errors.push({
        code: VISUAL_VALIDATION_CODES.VISUAL_DUPLICATE_ID,
        message: `Duplicate asset ID: "${a.assetId}".`,
        assetId: a.assetId,
      });
    }
    seenAssetIds.add(a.assetId);
  }

  // Duplicate asset titles
  const seenAssetTitles = new Set<string>();
  for (const a of registry.assets) {
    if (seenAssetTitles.has(a.title)) {
      errors.push({
        code: VISUAL_VALIDATION_CODES.VISUAL_DUPLICATE_TITLE,
        message: `Duplicate asset title: "${a.title}".`,
        field: 'title',
        assetId: a.assetId,
      });
    }
    seenAssetTitles.add(a.title);
  }

  // Duplicate relationship IDs
  const seenRelationshipIds = new Set<string>();
  for (const r of registry.relationships) {
    if (seenRelationshipIds.has(r.relationshipId)) {
      errors.push({
        code: VISUAL_VALIDATION_CODES.VISUAL_RELATIONSHIP_DUPLICATE_ID,
        message: `Duplicate relationship ID: "${r.relationshipId}".`,
        relationshipId: r.relationshipId,
      });
    }
    seenRelationshipIds.add(r.relationshipId);
  }

  // Duplicate governance IDs
  const seenGovernanceIds = new Set<string>();
  for (const g of registry.governance) {
    if (seenGovernanceIds.has(g.governanceId)) {
      errors.push({
        code: VISUAL_VALIDATION_CODES.VISUAL_GOVERNANCE_DUPLICATE_ID,
        message: `Duplicate governance ID: "${g.governanceId}".`,
        governanceId: g.governanceId,
      });
    }
    seenGovernanceIds.add(g.governanceId);
  }

  // Validate each asset
  for (const a of registry.assets) {
    errors.push(...validateVisualAsset(a));
  }

  // Validate each relationship
  for (const r of registry.relationships) {
    errors.push(...validateVisualRelationship(r));
  }

  // Validate each governance
  for (const g of registry.governance) {
    errors.push(...validateVisualGovernance(g));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'visual_asset_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Visual Asset Input Validation
// ---------------------------------------------------------------------------

export function validateVisualAssetInput(
  input: VisualAssetInput,
): VisualAssetInputValidationResult {
  const errors: VisualAssetValidationError[] = [];

  if (!input.assets || input.assets.length === 0) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_EMPTY_REGISTRY,
      message: 'Input has no assets.',
      field: 'assets',
    });
  } else {
    for (const a of input.assets) {
      errors.push(...validateVisualAsset(a));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'visual_asset_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Visual Asset Trace Validation
// ---------------------------------------------------------------------------

export function validateVisualAssetTrace(
  trace: VisualAssetTrace,
): VisualAssetTraceValidationResult {
  const errors: VisualAssetValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_TRACE,
      message: 'Visual asset trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_TRACE,
      message: 'Visual asset trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_TRACE,
      message: 'Visual asset trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: VISUAL_VALIDATION_CODES.VISUAL_INVALID_TRACE,
      message: 'Visual asset trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'visual_asset_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Visual Assets Validation
// ---------------------------------------------------------------------------

export function validateApplicationArtifactWithVisualAssets(
  registry: VisualAssetRegistry,
): readonly VisualAssetValidationError[] {
  const errors: VisualAssetValidationError[] = [];
  const registryResult = validateVisualAssetRegistry(registry);
  errors.push(...registryResult.errors);
  return errors;
}
