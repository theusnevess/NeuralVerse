/**
 * D10-OPT-09 — Laboratory Metadata Validation Layer
 *
 * Deterministic validation for laboratory metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeLaboratoryProfile,
  KnowledgeLaboratoryRelationship,
  KnowledgeLaboratoryRegistry,
  KnowledgeLaboratoryTrace,
  KnowledgeLaboratoryInput,
  KnowledgeArtifactWithLaboratories,
  KnowledgeLaboratoryValidationError,
  KnowledgeLaboratoryRegistryValidationResult,
  KnowledgeLaboratoryInputValidationResult,
  KnowledgeLaboratoryTraceValidationResult,
  KnowledgeArtifactWithLaboratoriesValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_LABORATORY_TYPES,
  CANONICAL_LABORATORY_OBJECTIVES,
  CANONICAL_LABORATORY_COMPLEXITY,
  CANONICAL_LABORATORY_STATUS,
  CANONICAL_LABORATORY_VISIBILITY,
  CANONICAL_LABORATORY_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix LABORATORY_)
// ---------------------------------------------------------------------------

export const LABORATORY_VALIDATION_CODES = {
  LABORATORY_DUPLICATE_ID: 'LABORATORY_DUPLICATE_ID',
  LABORATORY_DUPLICATE_TITLE: 'LABORATORY_DUPLICATE_TITLE',
  LABORATORY_INVALID_TYPE: 'LABORATORY_INVALID_TYPE',
  LABORATORY_INVALID_OBJECTIVE: 'LABORATORY_INVALID_OBJECTIVE',
  LABORATORY_INVALID_COMPLEXITY: 'LABORATORY_INVALID_COMPLEXITY',
  LABORATORY_INVALID_VISIBILITY: 'LABORATORY_INVALID_VISIBILITY',
  LABORATORY_INVALID_STATUS: 'LABORATORY_INVALID_STATUS',
  LABORATORY_INVALID_GOVERNANCE: 'LABORATORY_INVALID_GOVERNANCE',
  LABORATORY_MISSING_PROVENANCE: 'LABORATORY_MISSING_PROVENANCE',
  LABORATORY_MISSING_PROVIDER: 'LABORATORY_MISSING_PROVIDER',
  LABORATORY_MISSING_RATIONALE: 'LABORATORY_MISSING_RATIONALE',
  LABORATORY_MISSING_CONCEPT_REFERENCE: 'LABORATORY_MISSING_CONCEPT_REFERENCE',
  LABORATORY_MISSING_PROFILE_ID: 'LABORATORY_MISSING_PROFILE_ID',
  LABORATORY_MISSING_TITLE: 'LABORATORY_MISSING_TITLE',
  LABORATORY_SELF_RELATIONSHIP: 'LABORATORY_SELF_RELATIONSHIP',
  LABORATORY_EMPTY_REGISTRY: 'LABORATORY_EMPTY_REGISTRY',
  LABORATORY_INVALID_TRACE: 'LABORATORY_INVALID_TRACE',
  LABORATORY_REGISTRY_INCONSISTENCY: 'LABORATORY_REGISTRY_INCONSISTENCY',
  LABORATORY_INVALID_CONFIGURATION: 'LABORATORY_INVALID_CONFIGURATION',
  LABORATORY_INVALID_ORDER: 'LABORATORY_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeLaboratoryProfile(
  profile: KnowledgeLaboratoryProfile,
): readonly KnowledgeLaboratoryValidationError[] {
  const errors: KnowledgeLaboratoryValidationError[] = [];

  if (!profile.laboratoryId || profile.laboratoryId.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_PROFILE_ID,
      message: 'Laboratory profile is missing a profile ID.',
      field: 'laboratoryId',
      laboratoryId: profile.laboratoryId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_TITLE,
      message: 'Laboratory profile is missing a title.',
      field: 'title',
      laboratoryId: profile.laboratoryId,
    });
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_CONCEPT_REFERENCE,
      message: 'Laboratory profile is missing a concept reference.',
      field: 'conceptId',
      laboratoryId: profile.laboratoryId,
    });
  }

  if (!CANONICAL_LABORATORY_TYPES.includes(profile.laboratoryType)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_TYPE,
      message: `Laboratory profile has unsupported type: "${profile.laboratoryType}".`,
      field: 'laboratoryType',
      laboratoryId: profile.laboratoryId,
    });
  }

  if (!CANONICAL_LABORATORY_OBJECTIVES.includes(profile.objective)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_OBJECTIVE,
      message: `Laboratory profile has unsupported objective: "${profile.objective}".`,
      field: 'objective',
      laboratoryId: profile.laboratoryId,
    });
  }

  if (!CANONICAL_LABORATORY_COMPLEXITY.includes(profile.complexity)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_COMPLEXITY,
      message: `Laboratory profile has unsupported complexity: "${profile.complexity}".`,
      field: 'complexity',
      laboratoryId: profile.laboratoryId,
    });
  }

  if (!CANONICAL_LABORATORY_VISIBILITY.includes(profile.visibility)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_VISIBILITY,
      message: `Laboratory profile has unsupported visibility: "${profile.visibility}".`,
      field: 'visibility',
      laboratoryId: profile.laboratoryId,
    });
  }

  if (!CANONICAL_LABORATORY_STATUS.includes(profile.status)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_STATUS,
      message: `Laboratory profile has unsupported status: "${profile.status}".`,
      field: 'status',
      laboratoryId: profile.laboratoryId,
    });
  }

  if (!CANONICAL_LABORATORY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_GOVERNANCE,
      message: `Laboratory profile has unsupported governance: "${profile.governance}".`,
      field: 'governance',
      laboratoryId: profile.laboratoryId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_PROVENANCE,
      message: 'Laboratory profile is missing provenance.',
      field: 'provenance',
      laboratoryId: profile.laboratoryId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_PROVIDER,
        message: 'Laboratory provenance is missing a provider.',
        field: 'provenance.provider',
        laboratoryId: profile.laboratoryId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_RATIONALE,
        message: 'Laboratory provenance is missing a rationale.',
        field: 'provenance.rationale',
        laboratoryId: profile.laboratoryId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeLaboratoryRelationship(
  relationship: KnowledgeLaboratoryRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeLaboratoryValidationError[] {
  const errors: KnowledgeLaboratoryValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_PROFILE_ID,
      message: 'Laboratory relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceLaboratoryId === relationship.targetLaboratoryId) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_SELF_RELATIONSHIP,
      message: 'Laboratory relationship cannot reference itself.',
      field: 'targetLaboratoryId',
      laboratoryId: relationship.sourceLaboratoryId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceLaboratoryId)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_CONFIGURATION,
      message: `Laboratory relationship references unknown source profile: "${relationship.sourceLaboratoryId}".`,
      field: 'sourceLaboratoryId',
      laboratoryId: relationship.sourceLaboratoryId,
    });
  }

  if (!knownProfileIds.has(relationship.targetLaboratoryId)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_CONFIGURATION,
      message: `Laboratory relationship references unknown target profile: "${relationship.targetLaboratoryId}".`,
      field: 'targetLaboratoryId',
      laboratoryId: relationship.targetLaboratoryId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_PROVENANCE,
      message: 'Laboratory relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Laboratory Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeLaboratoryRegistry(
  registry: KnowledgeLaboratoryRegistry,
): KnowledgeLaboratoryRegistryValidationResult {
  const errors: KnowledgeLaboratoryValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.laboratoryId)) {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LABORATORY_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.laboratoryId}".`,
        laboratoryId: profile.laboratoryId,
      });
    }
    seenIds.add(profile.laboratoryId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LABORATORY_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        laboratoryId: profile.laboratoryId,
      });
    }
    seenTitles.add(profile.title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeLaboratoryProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.laboratoryId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeLaboratoryRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.laboratoryCount !== registry.profiles.length) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_REGISTRY_INCONSISTENCY,
      message: `Registry metadata laboratory count (${registry.metadata.laboratoryCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.laboratoryCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_laboratory_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Laboratory Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeLaboratoryInput(
  input: KnowledgeLaboratoryInput,
): KnowledgeLaboratoryInputValidationResult {
  const errors: KnowledgeLaboratoryValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeLaboratoryProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_laboratory_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Laboratory Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeLaboratoryTrace(
  trace: KnowledgeLaboratoryTrace,
): KnowledgeLaboratoryTraceValidationResult {
  const errors: KnowledgeLaboratoryValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_TRACE,
      message: 'Laboratory trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_TRACE,
      message: 'Laboratory trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_TRACE,
      message: 'Laboratory trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_TRACE,
      message: 'Laboratory trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_laboratory_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Laboratories Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithLaboratories(
  artifact: KnowledgeArtifactWithLaboratories,
): KnowledgeArtifactWithLaboratoriesValidationResult {
  const errors: KnowledgeLaboratoryValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_EMPTY_REGISTRY,
      message: 'Artifact has no laboratory profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeLaboratoryProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_laboratories_composition',
  };
}
