/**
 * D10-OPT-04 — Multimodal Representation, Visual References Validation Layer
 *
 * Deterministic validation for representation metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeRepresentationProfile,
  KnowledgeRepresentationRelationship,
  KnowledgeRepresentationRegistry,
  KnowledgeRepresentationTrace,
  KnowledgeRepresentationInput,
  KnowledgeArtifactWithRepresentations,
  KnowledgeRepresentationValidationError,
  KnowledgeRepresentationRegistryValidationResult,
  KnowledgeRepresentationInputValidationResult,
  KnowledgeRepresentationTraceValidationResult,
  KnowledgeArtifactWithRepresentationsValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_REPRESENTATION_TYPES,
  CANONICAL_VISUAL_OBJECTIVES,
  CANONICAL_REPRESENTATION_COMPLEXITY,
  CANONICAL_REPRESENTATION_STATUS,
  CANONICAL_REPRESENTATION_VISIBILITY,
  CANONICAL_REPRESENTATION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix REPRESENTATION_)
// ---------------------------------------------------------------------------

export const REPRESENTATION_VALIDATION_CODES = {
  REPRESENTATION_DUPLICATE_ID: 'REPRESENTATION_DUPLICATE_ID',
  REPRESENTATION_DUPLICATE_TITLE: 'REPRESENTATION_DUPLICATE_TITLE',
  REPRESENTATION_INVALID_TYPE: 'REPRESENTATION_INVALID_TYPE',
  REPRESENTATION_INVALID_OBJECTIVE: 'REPRESENTATION_INVALID_OBJECTIVE',
  REPRESENTATION_INVALID_COMPLEXITY: 'REPRESENTATION_INVALID_COMPLEXITY',
  REPRESENTATION_INVALID_VISIBILITY: 'REPRESENTATION_INVALID_VISIBILITY',
  REPRESENTATION_INVALID_STATUS: 'REPRESENTATION_INVALID_STATUS',
  REPRESENTATION_INVALID_GOVERNANCE: 'REPRESENTATION_INVALID_GOVERNANCE',
  REPRESENTATION_MISSING_PROVENANCE: 'REPRESENTATION_MISSING_PROVENANCE',
  REPRESENTATION_MISSING_PROVIDER: 'REPRESENTATION_MISSING_PROVIDER',
  REPRESENTATION_MISSING_RATIONALE: 'REPRESENTATION_MISSING_RATIONALE',
  REPRESENTATION_MISSING_CONCEPT_REFERENCE: 'REPRESENTATION_MISSING_CONCEPT_REFERENCE',
  REPRESENTATION_MISSING_PROFILE_ID: 'REPRESENTATION_MISSING_PROFILE_ID',
  REPRESENTATION_MISSING_TITLE: 'REPRESENTATION_MISSING_TITLE',
  REPRESENTATION_SELF_RELATIONSHIP: 'REPRESENTATION_SELF_RELATIONSHIP',
  REPRESENTATION_EMPTY_REGISTRY: 'REPRESENTATION_EMPTY_REGISTRY',
  REPRESENTATION_INVALID_TRACE: 'REPRESENTATION_INVALID_TRACE',
  REPRESENTATION_REGISTRY_INCONSISTENCY: 'REPRESENTATION_REGISTRY_INCONSISTENCY',
  REPRESENTATION_INVALID_CONFIGURATION: 'REPRESENTATION_INVALID_CONFIGURATION',
  REPRESENTATION_INVALID_ORDER: 'REPRESENTATION_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeRepresentationProfile(
  profile: KnowledgeRepresentationProfile,
): readonly KnowledgeRepresentationValidationError[] {
  const errors: KnowledgeRepresentationValidationError[] = [];

  if (!profile.representationId || profile.representationId.trim() === '') {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_PROFILE_ID,
      message: 'Representation profile is missing a profile ID.',
      field: 'representationId',
      profileId: profile.representationId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_TITLE,
      message: 'Representation profile is missing a title.',
      field: 'title',
      profileId: profile.representationId,
    });
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_CONCEPT_REFERENCE,
      message: 'Representation profile is missing a concept reference.',
      field: 'conceptId',
      profileId: profile.representationId,
    });
  }

  if (!CANONICAL_REPRESENTATION_TYPES.includes(profile.representationType)) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_TYPE,
      message: `Representation profile has unsupported type: "${profile.representationType}".`,
      field: 'representationType',
      profileId: profile.representationId,
    });
  }

  if (!CANONICAL_VISUAL_OBJECTIVES.includes(profile.visualObjective)) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_OBJECTIVE,
      message: `Representation profile has unsupported visual objective: "${profile.visualObjective}".`,
      field: 'visualObjective',
      profileId: profile.representationId,
    });
  }

  if (!CANONICAL_REPRESENTATION_COMPLEXITY.includes(profile.complexity)) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_COMPLEXITY,
      message: `Representation profile has unsupported complexity: "${profile.complexity}".`,
      field: 'complexity',
      profileId: profile.representationId,
    });
  }

  if (!CANONICAL_REPRESENTATION_VISIBILITY.includes(profile.visibility)) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_VISIBILITY,
      message: `Representation profile has unsupported visibility: "${profile.visibility}".`,
      field: 'visibility',
      profileId: profile.representationId,
    });
  }

  if (!CANONICAL_REPRESENTATION_STATUS.includes(profile.status)) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_STATUS,
      message: `Representation profile has unsupported status: "${profile.status}".`,
      field: 'status',
      profileId: profile.representationId,
    });
  }

  if (!CANONICAL_REPRESENTATION_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_GOVERNANCE,
      message: `Representation profile has unsupported governance: "${profile.governance}".`,
      field: 'governance',
      profileId: profile.representationId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_PROVENANCE,
      message: 'Representation profile is missing provenance.',
      field: 'provenance',
      profileId: profile.representationId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_PROVIDER,
        message: 'Representation provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: profile.representationId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_RATIONALE,
        message: 'Representation provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: profile.representationId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeRepresentationRelationship(
  relationship: KnowledgeRepresentationRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeRepresentationValidationError[] {
  const errors: KnowledgeRepresentationValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_PROFILE_ID,
      message: 'Representation relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceRepresentationId === relationship.targetRepresentationId) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_SELF_RELATIONSHIP,
      message: 'Representation relationship cannot reference itself.',
      field: 'targetRepresentationId',
      profileId: relationship.sourceRepresentationId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceRepresentationId)) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_CONFIGURATION,
      message: `Representation relationship references unknown source profile: "${relationship.sourceRepresentationId}".`,
      field: 'sourceRepresentationId',
      profileId: relationship.sourceRepresentationId,
    });
  }

  if (!knownProfileIds.has(relationship.targetRepresentationId)) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_CONFIGURATION,
      message: `Representation relationship references unknown target profile: "${relationship.targetRepresentationId}".`,
      field: 'targetRepresentationId',
      profileId: relationship.targetRepresentationId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_PROVENANCE,
      message: 'Representation relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Representation Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeRepresentationRegistry(
  registry: KnowledgeRepresentationRegistry,
): KnowledgeRepresentationRegistryValidationResult {
  const errors: KnowledgeRepresentationValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.representationId)) {
      errors.push({
        code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.representationId}".`,
        profileId: profile.representationId,
      });
    }
    seenIds.add(profile.representationId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        profileId: profile.representationId,
      });
    }
    seenTitles.add(profile.title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeRepresentationProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.representationId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeRepresentationRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.representationCount !== registry.profiles.length) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_REGISTRY_INCONSISTENCY,
      message: `Registry metadata representation count (${registry.metadata.representationCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.representationCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_representation_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Representation Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeRepresentationInput(
  input: KnowledgeRepresentationInput,
): KnowledgeRepresentationInputValidationResult {
  const errors: KnowledgeRepresentationValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeRepresentationProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_representation_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Representation Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeRepresentationTrace(
  trace: KnowledgeRepresentationTrace,
): KnowledgeRepresentationTraceValidationResult {
  const errors: KnowledgeRepresentationValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_TRACE,
      message: 'Representation trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_TRACE,
      message: 'Representation trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_TRACE,
      message: 'Representation trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_TRACE,
      message: 'Representation trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_representation_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Representations Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithRepresentations(
  artifact: KnowledgeArtifactWithRepresentations,
): KnowledgeArtifactWithRepresentationsValidationResult {
  const errors: KnowledgeRepresentationValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_EMPTY_REGISTRY,
      message: 'Artifact has no representation profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeRepresentationProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_representations_composition',
  };
}
