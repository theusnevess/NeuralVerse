/**
 * D10-OPT-08 — Visualization Metadata Validation Layer
 *
 * Deterministic validation for visualization metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeVisualizationProfile,
  KnowledgeVisualizationRelationship,
  KnowledgeVisualizationRegistry,
  KnowledgeVisualizationTrace,
  KnowledgeVisualizationInput,
  KnowledgeArtifactWithVisualizations,
  KnowledgeVisualizationValidationError,
  KnowledgeVisualizationRegistryValidationResult,
  KnowledgeVisualizationInputValidationResult,
  KnowledgeVisualizationTraceValidationResult,
  KnowledgeArtifactWithVisualizationsValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_VISUALIZATION_TYPES,
  CANONICAL_VISUALIZATION_OBJECTIVES,
  CANONICAL_VISUALIZATION_COMPLEXITY,
  CANONICAL_VISUALIZATION_STATUS,
  CANONICAL_VISUALIZATION_VISIBILITY,
  CANONICAL_VISUALIZATION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix VISUALIZATION_)
// ---------------------------------------------------------------------------

export const VISUALIZATION_VALIDATION_CODES = {
  VISUALIZATION_DUPLICATE_ID: 'VISUALIZATION_DUPLICATE_ID',
  VISUALIZATION_DUPLICATE_TITLE: 'VISUALIZATION_DUPLICATE_TITLE',
  VISUALIZATION_INVALID_TYPE: 'VISUALIZATION_INVALID_TYPE',
  VISUALIZATION_INVALID_OBJECTIVE: 'VISUALIZATION_INVALID_OBJECTIVE',
  VISUALIZATION_INVALID_COMPLEXITY: 'VISUALIZATION_INVALID_COMPLEXITY',
  VISUALIZATION_INVALID_VISIBILITY: 'VISUALIZATION_INVALID_VISIBILITY',
  VISUALIZATION_INVALID_STATUS: 'VISUALIZATION_INVALID_STATUS',
  VISUALIZATION_INVALID_GOVERNANCE: 'VISUALIZATION_INVALID_GOVERNANCE',
  VISUALIZATION_MISSING_PROVENANCE: 'VISUALIZATION_MISSING_PROVENANCE',
  VISUALIZATION_MISSING_PROVIDER: 'VISUALIZATION_MISSING_PROVIDER',
  VISUALIZATION_MISSING_RATIONALE: 'VISUALIZATION_MISSING_RATIONALE',
  VISUALIZATION_MISSING_CONCEPT_REFERENCE: 'VISUALIZATION_MISSING_CONCEPT_REFERENCE',
  VISUALIZATION_MISSING_PROFILE_ID: 'VISUALIZATION_MISSING_PROFILE_ID',
  VISUALIZATION_MISSING_TITLE: 'VISUALIZATION_MISSING_TITLE',
  VISUALIZATION_SELF_RELATIONSHIP: 'VISUALIZATION_SELF_RELATIONSHIP',
  VISUALIZATION_EMPTY_REGISTRY: 'VISUALIZATION_EMPTY_REGISTRY',
  VISUALIZATION_INVALID_TRACE: 'VISUALIZATION_INVALID_TRACE',
  VISUALIZATION_REGISTRY_INCONSISTENCY: 'VISUALIZATION_REGISTRY_INCONSISTENCY',
  VISUALIZATION_INVALID_CONFIGURATION: 'VISUALIZATION_INVALID_CONFIGURATION',
  VISUALIZATION_INVALID_ORDER: 'VISUALIZATION_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeVisualizationProfile(
  profile: KnowledgeVisualizationProfile,
): readonly KnowledgeVisualizationValidationError[] {
  const errors: KnowledgeVisualizationValidationError[] = [];

  if (!profile.visualizationId || profile.visualizationId.trim() === '') {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_PROFILE_ID,
      message: 'Visualization profile is missing a profile ID.',
      field: 'visualizationId',
      visualizationId: profile.visualizationId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_TITLE,
      message: 'Visualization profile is missing a title.',
      field: 'title',
      visualizationId: profile.visualizationId,
    });
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_CONCEPT_REFERENCE,
      message: 'Visualization profile is missing a concept reference.',
      field: 'conceptId',
      visualizationId: profile.visualizationId,
    });
  }

  if (!CANONICAL_VISUALIZATION_TYPES.includes(profile.visualizationType)) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_TYPE,
      message: `Visualization profile has unsupported type: "${profile.visualizationType}".`,
      field: 'visualizationType',
      visualizationId: profile.visualizationId,
    });
  }

  if (!CANONICAL_VISUALIZATION_OBJECTIVES.includes(profile.objective)) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_OBJECTIVE,
      message: `Visualization profile has unsupported objective: "${profile.objective}".`,
      field: 'objective',
      visualizationId: profile.visualizationId,
    });
  }

  if (!CANONICAL_VISUALIZATION_COMPLEXITY.includes(profile.complexity)) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_COMPLEXITY,
      message: `Visualization profile has unsupported complexity: "${profile.complexity}".`,
      field: 'complexity',
      visualizationId: profile.visualizationId,
    });
  }

  if (!CANONICAL_VISUALIZATION_VISIBILITY.includes(profile.visibility)) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_VISIBILITY,
      message: `Visualization profile has unsupported visibility: "${profile.visibility}".`,
      field: 'visibility',
      visualizationId: profile.visualizationId,
    });
  }

  if (!CANONICAL_VISUALIZATION_STATUS.includes(profile.status)) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_STATUS,
      message: `Visualization profile has unsupported status: "${profile.status}".`,
      field: 'status',
      visualizationId: profile.visualizationId,
    });
  }

  if (!CANONICAL_VISUALIZATION_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_GOVERNANCE,
      message: `Visualization profile has unsupported governance: "${profile.governance}".`,
      field: 'governance',
      visualizationId: profile.visualizationId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_PROVENANCE,
      message: 'Visualization profile is missing provenance.',
      field: 'provenance',
      visualizationId: profile.visualizationId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_PROVIDER,
        message: 'Visualization provenance is missing a provider.',
        field: 'provenance.provider',
        visualizationId: profile.visualizationId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_RATIONALE,
        message: 'Visualization provenance is missing a rationale.',
        field: 'provenance.rationale',
        visualizationId: profile.visualizationId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeVisualizationRelationship(
  relationship: KnowledgeVisualizationRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeVisualizationValidationError[] {
  const errors: KnowledgeVisualizationValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_PROFILE_ID,
      message: 'Visualization relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceVisualizationId === relationship.targetVisualizationId) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_SELF_RELATIONSHIP,
      message: 'Visualization relationship cannot reference itself.',
      field: 'targetVisualizationId',
      visualizationId: relationship.sourceVisualizationId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceVisualizationId)) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_CONFIGURATION,
      message: `Visualization relationship references unknown source profile: "${relationship.sourceVisualizationId}".`,
      field: 'sourceVisualizationId',
      visualizationId: relationship.sourceVisualizationId,
    });
  }

  if (!knownProfileIds.has(relationship.targetVisualizationId)) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_CONFIGURATION,
      message: `Visualization relationship references unknown target profile: "${relationship.targetVisualizationId}".`,
      field: 'targetVisualizationId',
      visualizationId: relationship.targetVisualizationId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_PROVENANCE,
      message: 'Visualization relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Visualization Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeVisualizationRegistry(
  registry: KnowledgeVisualizationRegistry,
): KnowledgeVisualizationRegistryValidationResult {
  const errors: KnowledgeVisualizationValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.visualizationId)) {
      errors.push({
        code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.visualizationId}".`,
        visualizationId: profile.visualizationId,
      });
    }
    seenIds.add(profile.visualizationId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        visualizationId: profile.visualizationId,
      });
    }
    seenTitles.add(profile.title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeVisualizationProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.visualizationId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeVisualizationRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.visualizationCount !== registry.profiles.length) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_REGISTRY_INCONSISTENCY,
      message: `Registry metadata visualization count (${registry.metadata.visualizationCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.visualizationCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_visualization_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Visualization Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeVisualizationInput(
  input: KnowledgeVisualizationInput,
): KnowledgeVisualizationInputValidationResult {
  const errors: KnowledgeVisualizationValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeVisualizationProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_visualization_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Visualization Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeVisualizationTrace(
  trace: KnowledgeVisualizationTrace,
): KnowledgeVisualizationTraceValidationResult {
  const errors: KnowledgeVisualizationValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_TRACE,
      message: 'Visualization trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_TRACE,
      message: 'Visualization trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_TRACE,
      message: 'Visualization trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_TRACE,
      message: 'Visualization trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_visualization_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Visualizations Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithVisualizations(
  artifact: KnowledgeArtifactWithVisualizations,
): KnowledgeArtifactWithVisualizationsValidationResult {
  const errors: KnowledgeVisualizationValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_EMPTY_REGISTRY,
      message: 'Artifact has no visualization profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeVisualizationProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_visualizations_composition',
  };
}
