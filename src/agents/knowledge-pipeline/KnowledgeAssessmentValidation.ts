/**
 * D10-OPT-12 — Assessment Metadata Validation Layer
 *
 * Deterministic validation for assessment metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeAssessmentProfile,
  KnowledgeAssessmentRelationship,
  KnowledgeAssessmentRegistry,
  KnowledgeAssessmentTrace,
  KnowledgeAssessmentInput,
  KnowledgeArtifactWithAssessments,
  KnowledgeAssessmentValidationError,
  KnowledgeAssessmentRegistryValidationResult,
  KnowledgeAssessmentInputValidationResult,
  KnowledgeAssessmentTraceValidationResult,
  KnowledgeArtifactWithAssessmentsValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_ASSESSMENT_TYPES,
  CANONICAL_ASSESSMENT_OBJECTIVES,
  CANONICAL_ASSESSMENT_DIFFICULTY,
  CANONICAL_ASSESSMENT_STATUS,
  CANONICAL_ASSESSMENT_VISIBILITY,
  CANONICAL_ASSESSMENT_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix ASSESSMENT_)
// ---------------------------------------------------------------------------

export const ASSESSMENT_VALIDATION_CODES = {
  ASSESSMENT_DUPLICATE_ID: 'ASSESSMENT_DUPLICATE_ID',
  ASSESSMENT_DUPLICATE_TITLE: 'ASSESSMENT_DUPLICATE_TITLE',
  ASSESSMENT_INVALID_TYPE: 'ASSESSMENT_INVALID_TYPE',
  ASSESSMENT_INVALID_OBJECTIVE: 'ASSESSMENT_INVALID_OBJECTIVE',
  ASSESSMENT_INVALID_DIFFICULTY: 'ASSESSMENT_INVALID_DIFFICULTY',
  ASSESSMENT_INVALID_VISIBILITY: 'ASSESSMENT_INVALID_VISIBILITY',
  ASSESSMENT_INVALID_STATUS: 'ASSESSMENT_INVALID_STATUS',
  ASSESSMENT_INVALID_GOVERNANCE: 'ASSESSMENT_INVALID_GOVERNANCE',
  ASSESSMENT_MISSING_PROVENANCE: 'ASSESSMENT_MISSING_PROVENANCE',
  ASSESSMENT_MISSING_PROVIDER: 'ASSESSMENT_MISSING_PROVIDER',
  ASSESSMENT_MISSING_RATIONALE: 'ASSESSMENT_MISSING_RATIONALE',
  ASSESSMENT_MISSING_CONCEPT_REFERENCE: 'ASSESSMENT_MISSING_CONCEPT_REFERENCE',
  ASSESSMENT_MISSING_PROFILE_ID: 'ASSESSMENT_MISSING_PROFILE_ID',
  ASSESSMENT_MISSING_TITLE: 'ASSESSMENT_MISSING_TITLE',
  ASSESSMENT_SELF_RELATIONSHIP: 'ASSESSMENT_SELF_RELATIONSHIP',
  ASSESSMENT_EMPTY_REGISTRY: 'ASSESSMENT_EMPTY_REGISTRY',
  ASSESSMENT_INVALID_TRACE: 'ASSESSMENT_INVALID_TRACE',
  ASSESSMENT_REGISTRY_INCONSISTENCY: 'ASSESSMENT_REGISTRY_INCONSISTENCY',
  ASSESSMENT_INVALID_CONFIGURATION: 'ASSESSMENT_INVALID_CONFIGURATION',
  ASSESSMENT_INVALID_ORDER: 'ASSESSMENT_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeAssessmentProfile(
  profile: KnowledgeAssessmentProfile,
): readonly KnowledgeAssessmentValidationError[] {
  const errors: KnowledgeAssessmentValidationError[] = [];

  if (!profile.assessmentId || profile.assessmentId.trim() === '') {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_PROFILE_ID,
      message: 'Assessment profile is missing a profile ID.',
      field: 'assessmentId',
      assessmentId: profile.assessmentId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_TITLE,
      message: 'Assessment profile is missing a title.',
      field: 'title',
      assessmentId: profile.assessmentId,
    });
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_CONCEPT_REFERENCE,
      message: 'Assessment profile is missing a concept reference.',
      field: 'conceptId',
      assessmentId: profile.assessmentId,
    });
  }

  if (!CANONICAL_ASSESSMENT_TYPES.includes(profile.assessmentType)) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_TYPE,
      message: `Assessment profile has unsupported type: "${profile.assessmentType}".`,
      field: 'assessmentType',
      assessmentId: profile.assessmentId,
    });
  }

  if (!CANONICAL_ASSESSMENT_OBJECTIVES.includes(profile.objective)) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_OBJECTIVE,
      message: `Assessment profile has unsupported objective: "${profile.objective}".`,
      field: 'objective',
      assessmentId: profile.assessmentId,
    });
  }

  if (!CANONICAL_ASSESSMENT_DIFFICULTY.includes(profile.difficulty)) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_DIFFICULTY,
      message: `Assessment profile has unsupported difficulty: "${profile.difficulty}".`,
      field: 'difficulty',
      assessmentId: profile.assessmentId,
    });
  }

  if (!CANONICAL_ASSESSMENT_VISIBILITY.includes(profile.visibility)) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_VISIBILITY,
      message: `Assessment profile has unsupported visibility: "${profile.visibility}".`,
      field: 'visibility',
      assessmentId: profile.assessmentId,
    });
  }

  if (!CANONICAL_ASSESSMENT_STATUS.includes(profile.status)) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_STATUS,
      message: `Assessment profile has unsupported status: "${profile.status}".`,
      field: 'status',
      assessmentId: profile.assessmentId,
    });
  }

  if (!CANONICAL_ASSESSMENT_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_GOVERNANCE,
      message: `Assessment profile has unsupported governance: "${profile.governance}".`,
      field: 'governance',
      assessmentId: profile.assessmentId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_PROVENANCE,
      message: 'Assessment profile is missing provenance.',
      field: 'provenance',
      assessmentId: profile.assessmentId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_PROVIDER,
        message: 'Assessment provenance is missing a provider.',
        field: 'provenance.provider',
        assessmentId: profile.assessmentId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_RATIONALE,
        message: 'Assessment provenance is missing a rationale.',
        field: 'provenance.rationale',
        assessmentId: profile.assessmentId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeAssessmentRelationship(
  relationship: KnowledgeAssessmentRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeAssessmentValidationError[] {
  const errors: KnowledgeAssessmentValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_PROFILE_ID,
      message: 'Assessment relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceAssessmentId === relationship.targetAssessmentId) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_SELF_RELATIONSHIP,
      message: 'Assessment relationship cannot reference itself.',
      field: 'targetAssessmentId',
      assessmentId: relationship.sourceAssessmentId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceAssessmentId)) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_CONFIGURATION,
      message: `Assessment relationship references unknown source profile: "${relationship.sourceAssessmentId}".`,
      field: 'sourceAssessmentId',
      assessmentId: relationship.sourceAssessmentId,
    });
  }

  if (!knownProfileIds.has(relationship.targetAssessmentId)) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_CONFIGURATION,
      message: `Assessment relationship references unknown target profile: "${relationship.targetAssessmentId}".`,
      field: 'targetAssessmentId',
      assessmentId: relationship.targetAssessmentId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_PROVENANCE,
      message: 'Assessment relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Assessment Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeAssessmentRegistry(
  registry: KnowledgeAssessmentRegistry,
): KnowledgeAssessmentRegistryValidationResult {
  const errors: KnowledgeAssessmentValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.assessmentId)) {
      errors.push({
        code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.assessmentId}".`,
        assessmentId: profile.assessmentId,
      });
    }
    seenIds.add(profile.assessmentId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        assessmentId: profile.assessmentId,
      });
    }
    seenTitles.add(profile.title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeAssessmentProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.assessmentId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeAssessmentRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.assessmentCount !== registry.profiles.length) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_REGISTRY_INCONSISTENCY,
      message: `Registry metadata assessment count (${registry.metadata.assessmentCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.assessmentCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_assessment_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Assessment Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeAssessmentInput(
  input: KnowledgeAssessmentInput,
): KnowledgeAssessmentInputValidationResult {
  const errors: KnowledgeAssessmentValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeAssessmentProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_assessment_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Assessment Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeAssessmentTrace(
  trace: KnowledgeAssessmentTrace,
): KnowledgeAssessmentTraceValidationResult {
  const errors: KnowledgeAssessmentValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
      message: 'Assessment trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
      message: 'Assessment trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
      message: 'Assessment trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_INVALID_TRACE,
      message: 'Assessment trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_assessment_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Assessments Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithAssessments(
  artifact: KnowledgeArtifactWithAssessments,
): KnowledgeArtifactWithAssessmentsValidationResult {
  const errors: KnowledgeAssessmentValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_EMPTY_REGISTRY,
      message: 'Artifact has no assessment profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeAssessmentProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: ASSESSMENT_VALIDATION_CODES.ASSESSMENT_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_assessments_composition',
  };
}
