/**
 * D10-OPT-02 — Multi-Level Explanation Validation Layer
 *
 * Deterministic validation for explanation metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeExplanationProfile,
  KnowledgeExplanationRelationship,
  KnowledgeExplanationRegistry,
  KnowledgeExplanationTrace,
  KnowledgeExplanationInput,
  KnowledgeArtifactWithExplanations,
  KnowledgeExplanationValidationError,
  KnowledgeExplanationRegistryValidationResult,
  KnowledgeExplanationInputValidationResult,
  KnowledgeExplanationTraceValidationResult,
  KnowledgeArtifactWithExplanationsValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_EXPLANATION_LEVELS,
  CANONICAL_EXPLANATION_FORMATS,
  CANONICAL_EXPLANATION_PURPOSES,
  CANONICAL_AUDIENCE_LEVELS,
  CANONICAL_EXPLANATION_STATUS,
  CANONICAL_EXPLANATION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix EXPLANATION_)
// ---------------------------------------------------------------------------

export const EXPLANATION_VALIDATION_CODES = {
  EXPLANATION_DUPLICATE_ID: 'EXPLANATION_DUPLICATE_ID',
  EXPLANATION_DUPLICATE_TITLE: 'EXPLANATION_DUPLICATE_TITLE',
  EXPLANATION_INVALID_LEVEL: 'EXPLANATION_INVALID_LEVEL',
  EXPLANATION_INVALID_FORMAT: 'EXPLANATION_INVALID_FORMAT',
  EXPLANATION_INVALID_PURPOSE: 'EXPLANATION_INVALID_PURPOSE',
  EXPLANATION_INVALID_AUDIENCE: 'EXPLANATION_INVALID_AUDIENCE',
  EXPLANATION_INVALID_STATUS: 'EXPLANATION_INVALID_STATUS',
  EXPLANATION_INVALID_GOVERNANCE: 'EXPLANATION_INVALID_GOVERNANCE',
  EXPLANATION_MISSING_PROVENANCE: 'EXPLANATION_MISSING_PROVENANCE',
  EXPLANATION_MISSING_PROVIDER: 'EXPLANATION_MISSING_PROVIDER',
  EXPLANATION_MISSING_RATIONALE: 'EXPLANATION_MISSING_RATIONALE',
  EXPLANATION_MISSING_CONCEPT_REFERENCE: 'EXPLANATION_MISSING_CONCEPT_REFERENCE',
  EXPLANATION_MISSING_PROFILE_ID: 'EXPLANATION_MISSING_PROFILE_ID',
  EXPLANATION_MISSING_TITLE: 'EXPLANATION_MISSING_TITLE',
  EXPLANATION_SELF_RELATIONSHIP: 'EXPLANATION_SELF_RELATIONSHIP',
  EXPLANATION_EMPTY_REGISTRY: 'EXPLANATION_EMPTY_REGISTRY',
  EXPLANATION_INVALID_TRACE: 'EXPLANATION_INVALID_TRACE',
  EXPLANATION_REGISTRY_INCONSISTENCY: 'EXPLANATION_REGISTRY_INCONSISTENCY',
  EXPLANATION_INVALID_CONFIGURATION: 'EXPLANATION_INVALID_CONFIGURATION',
  EXPLANATION_INVALID_SEQUENCE: 'EXPLANATION_INVALID_SEQUENCE',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeExplanationProfile(
  profile: KnowledgeExplanationProfile,
): readonly KnowledgeExplanationValidationError[] {
  const errors: KnowledgeExplanationValidationError[] = [];

  if (!profile.profileId || profile.profileId.trim() === '') {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_PROFILE_ID,
      message: 'Explanation profile is missing a profile ID.',
      field: 'profileId',
      profileId: profile.profileId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_TITLE,
      message: 'Explanation profile is missing a title.',
      field: 'title',
      profileId: profile.profileId,
    });
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_CONCEPT_REFERENCE,
      message: 'Explanation profile is missing a concept reference.',
      field: 'conceptId',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_EXPLANATION_LEVELS.includes(profile.level)) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_LEVEL,
      message: `Explanation profile has unsupported level: "${profile.level}".`,
      field: 'level',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_EXPLANATION_FORMATS.includes(profile.format)) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_FORMAT,
      message: `Explanation profile has unsupported format: "${profile.format}".`,
      field: 'format',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_EXPLANATION_PURPOSES.includes(profile.purpose)) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_PURPOSE,
      message: `Explanation profile has unsupported purpose: "${profile.purpose}".`,
      field: 'purpose',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_AUDIENCE_LEVELS.includes(profile.audienceLevel)) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_AUDIENCE,
      message: `Explanation profile has unsupported audience level: "${profile.audienceLevel}".`,
      field: 'audienceLevel',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_EXPLANATION_STATUS.includes(profile.status)) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_STATUS,
      message: `Explanation profile has unsupported status: "${profile.status}".`,
      field: 'status',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_EXPLANATION_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_GOVERNANCE,
      message: `Explanation profile has unsupported governance: "${profile.governance}".`,
      field: 'governance',
      profileId: profile.profileId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_PROVENANCE,
      message: 'Explanation profile is missing provenance.',
      field: 'provenance',
      profileId: profile.profileId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_PROVIDER,
        message: 'Explanation provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: profile.profileId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_RATIONALE,
        message: 'Explanation provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: profile.profileId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeExplanationRelationship(
  relationship: KnowledgeExplanationRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeExplanationValidationError[] {
  const errors: KnowledgeExplanationValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_PROFILE_ID,
      message: 'Explanation relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceProfileId === relationship.targetProfileId) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_SELF_RELATIONSHIP,
      message: 'Explanation relationship cannot reference itself.',
      field: 'targetProfileId',
      profileId: relationship.sourceProfileId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceProfileId)) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_CONFIGURATION,
      message: `Explanation relationship references unknown source profile: "${relationship.sourceProfileId}".`,
      field: 'sourceProfileId',
      profileId: relationship.sourceProfileId,
    });
  }

  if (!knownProfileIds.has(relationship.targetProfileId)) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_CONFIGURATION,
      message: `Explanation relationship references unknown target profile: "${relationship.targetProfileId}".`,
      field: 'targetProfileId',
      profileId: relationship.targetProfileId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_PROVENANCE,
      message: 'Explanation relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Explanation Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeExplanationRegistry(
  registry: KnowledgeExplanationRegistry,
): KnowledgeExplanationRegistryValidationResult {
  const errors: KnowledgeExplanationValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.profileId)) {
      errors.push({
        code: EXPLANATION_VALIDATION_CODES.EXPLANATION_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.profileId}".`,
        profileId: profile.profileId,
      });
    }
    seenIds.add(profile.profileId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: EXPLANATION_VALIDATION_CODES.EXPLANATION_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        profileId: profile.profileId,
      });
    }
    seenTitles.add(profile.title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeExplanationProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.profileId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeExplanationRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.profileCount !== registry.profiles.length) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_REGISTRY_INCONSISTENCY,
      message: `Registry metadata profile count (${registry.metadata.profileCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.profileCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_explanation_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Explanation Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeExplanationInput(
  input: KnowledgeExplanationInput,
): KnowledgeExplanationInputValidationResult {
  const errors: KnowledgeExplanationValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeExplanationProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_explanation_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Explanation Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeExplanationTrace(
  trace: KnowledgeExplanationTrace,
): KnowledgeExplanationTraceValidationResult {
  const errors: KnowledgeExplanationValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_TRACE,
      message: 'Explanation trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_TRACE,
      message: 'Explanation trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_TRACE,
      message: 'Explanation trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_INVALID_TRACE,
      message: 'Explanation trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_explanation_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Explanations Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithExplanations(
  artifact: KnowledgeArtifactWithExplanations,
): KnowledgeArtifactWithExplanationsValidationResult {
  const errors: KnowledgeExplanationValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_EMPTY_REGISTRY,
      message: 'Artifact has no explanation profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeExplanationProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: EXPLANATION_VALIDATION_CODES.EXPLANATION_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_explanations_composition',
  };
}
