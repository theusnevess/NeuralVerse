/**
 * D10-OPT-06 — Comparative Knowledge Modeling Validation Layer
 *
 * Deterministic validation for comparison metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeComparisonProfile,
  KnowledgeComparisonRelationship,
  KnowledgeComparisonRegistry,
  KnowledgeComparisonTrace,
  KnowledgeComparisonInput,
  KnowledgeArtifactWithComparisons,
  KnowledgeComparisonValidationError,
  KnowledgeComparisonRegistryValidationResult,
  KnowledgeComparisonInputValidationResult,
  KnowledgeComparisonTraceValidationResult,
  KnowledgeArtifactWithComparisonsValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_COMPARISON_TYPES,
  CANONICAL_COMPARISON_OBJECTIVES,
  CANONICAL_COMPARISON_DIMENSIONS,
  CANONICAL_COMPARISON_STATUS,
  CANONICAL_COMPARISON_VISIBILITY,
  CANONICAL_COMPARISON_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix COMPARISON_)
// ---------------------------------------------------------------------------

export const COMPARISON_VALIDATION_CODES = {
  COMPARISON_DUPLICATE_ID: 'COMPARISON_DUPLICATE_ID',
  COMPARISON_DUPLICATE_TITLE: 'COMPARISON_DUPLICATE_TITLE',
  COMPARISON_INVALID_TYPE: 'COMPARISON_INVALID_TYPE',
  COMPARISON_INVALID_OBJECTIVE: 'COMPARISON_INVALID_OBJECTIVE',
  COMPARISON_INVALID_DIMENSION: 'COMPARISON_INVALID_DIMENSION',
  COMPARISON_INVALID_VISIBILITY: 'COMPARISON_INVALID_VISIBILITY',
  COMPARISON_INVALID_STATUS: 'COMPARISON_INVALID_STATUS',
  COMPARISON_INVALID_GOVERNANCE: 'COMPARISON_INVALID_GOVERNANCE',
  COMPARISON_MISSING_PROVENANCE: 'COMPARISON_MISSING_PROVENANCE',
  COMPARISON_MISSING_PROVIDER: 'COMPARISON_MISSING_PROVIDER',
  COMPARISON_MISSING_RATIONALE: 'COMPARISON_MISSING_RATIONALE',
  COMPARISON_MISSING_CONCEPT_REFERENCE: 'COMPARISON_MISSING_CONCEPT_REFERENCE',
  COMPARISON_MISSING_PROFILE_ID: 'COMPARISON_MISSING_PROFILE_ID',
  COMPARISON_MISSING_TITLE: 'COMPARISON_MISSING_TITLE',
  COMPARISON_SELF_RELATIONSHIP: 'COMPARISON_SELF_RELATIONSHIP',
  COMPARISON_EMPTY_REGISTRY: 'COMPARISON_EMPTY_REGISTRY',
  COMPARISON_INVALID_TRACE: 'COMPARISON_INVALID_TRACE',
  COMPARISON_REGISTRY_INCONSISTENCY: 'COMPARISON_REGISTRY_INCONSISTENCY',
  COMPARISON_INVALID_CONFIGURATION: 'COMPARISON_INVALID_CONFIGURATION',
  COMPARISON_INVALID_ORDER: 'COMPARISON_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeComparisonProfile(
  profile: KnowledgeComparisonProfile,
): readonly KnowledgeComparisonValidationError[] {
  const errors: KnowledgeComparisonValidationError[] = [];

  if (!profile.comparisonId || profile.comparisonId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROFILE_ID,
      message: 'Comparison profile is missing a profile ID.',
      field: 'comparisonId',
      comparisonId: profile.comparisonId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_TITLE,
      message: 'Comparison profile is missing a title.',
      field: 'title',
      comparisonId: profile.comparisonId,
    });
  }

  if (!profile.primaryConceptId || profile.primaryConceptId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_CONCEPT_REFERENCE,
      message: 'Comparison profile is missing a primary concept reference.',
      field: 'primaryConceptId',
      comparisonId: profile.comparisonId,
    });
  }

  if (!CANONICAL_COMPARISON_TYPES.includes(profile.comparisonType)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TYPE,
      message: `Comparison profile has unsupported type: "${profile.comparisonType}".`,
      field: 'comparisonType',
      comparisonId: profile.comparisonId,
    });
  }

  if (!CANONICAL_COMPARISON_OBJECTIVES.includes(profile.objective)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_OBJECTIVE,
      message: `Comparison profile has unsupported objective: "${profile.objective}".`,
      field: 'objective',
      comparisonId: profile.comparisonId,
    });
  }

  for (const dim of profile.dimensions) {
    if (!CANONICAL_COMPARISON_DIMENSIONS.includes(dim)) {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_DIMENSION,
        message: `Comparison profile has unsupported dimension: "${dim}".`,
        field: 'dimensions',
        comparisonId: profile.comparisonId,
      });
      break;
    }
  }

  if (!CANONICAL_COMPARISON_VISIBILITY.includes(profile.visibility)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_VISIBILITY,
      message: `Comparison profile has unsupported visibility: "${profile.visibility}".`,
      field: 'visibility',
      comparisonId: profile.comparisonId,
    });
  }

  if (!CANONICAL_COMPARISON_STATUS.includes(profile.status)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_STATUS,
      message: `Comparison profile has unsupported status: "${profile.status}".`,
      field: 'status',
      comparisonId: profile.comparisonId,
    });
  }

  if (!CANONICAL_COMPARISON_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_GOVERNANCE,
      message: `Comparison profile has unsupported governance: "${profile.governance}".`,
      field: 'governance',
      comparisonId: profile.comparisonId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE,
      message: 'Comparison profile is missing provenance.',
      field: 'provenance',
      comparisonId: profile.comparisonId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVIDER,
        message: 'Comparison provenance is missing a provider.',
        field: 'provenance.provider',
        comparisonId: profile.comparisonId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_RATIONALE,
        message: 'Comparison provenance is missing a rationale.',
        field: 'provenance.rationale',
        comparisonId: profile.comparisonId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeComparisonRelationship(
  relationship: KnowledgeComparisonRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeComparisonValidationError[] {
  const errors: KnowledgeComparisonValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROFILE_ID,
      message: 'Comparison relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceComparisonId === relationship.targetComparisonId) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_SELF_RELATIONSHIP,
      message: 'Comparison relationship cannot reference itself.',
      field: 'targetComparisonId',
      comparisonId: relationship.sourceComparisonId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceComparisonId)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_CONFIGURATION,
      message: `Comparison relationship references unknown source profile: "${relationship.sourceComparisonId}".`,
      field: 'sourceComparisonId',
      comparisonId: relationship.sourceComparisonId,
    });
  }

  if (!knownProfileIds.has(relationship.targetComparisonId)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_CONFIGURATION,
      message: `Comparison relationship references unknown target profile: "${relationship.targetComparisonId}".`,
      field: 'targetComparisonId',
      comparisonId: relationship.targetComparisonId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE,
      message: 'Comparison relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Comparison Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeComparisonRegistry(
  registry: KnowledgeComparisonRegistry,
): KnowledgeComparisonRegistryValidationResult {
  const errors: KnowledgeComparisonValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.comparisonId)) {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.comparisonId}".`,
        comparisonId: profile.comparisonId,
      });
    }
    seenIds.add(profile.comparisonId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        comparisonId: profile.comparisonId,
      });
    }
    seenTitles.add(profile.title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeComparisonProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.comparisonId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeComparisonRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.comparisonCount !== registry.profiles.length) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_REGISTRY_INCONSISTENCY,
      message: `Registry metadata comparison count (${registry.metadata.comparisonCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.comparisonCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_comparison_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Comparison Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeComparisonInput(
  input: KnowledgeComparisonInput,
): KnowledgeComparisonInputValidationResult {
  const errors: KnowledgeComparisonValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeComparisonProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_comparison_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Comparison Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeComparisonTrace(
  trace: KnowledgeComparisonTrace,
): KnowledgeComparisonTraceValidationResult {
  const errors: KnowledgeComparisonValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
      message: 'Comparison trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
      message: 'Comparison trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
      message: 'Comparison trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TRACE,
      message: 'Comparison trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_comparison_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Comparisons Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithComparisons(
  artifact: KnowledgeArtifactWithComparisons,
): KnowledgeArtifactWithComparisonsValidationResult {
  const errors: KnowledgeComparisonValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_REGISTRY,
      message: 'Artifact has no comparison profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeComparisonProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_comparisons_composition',
  };
}
