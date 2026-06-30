/**
 * D10-OPT-12 — Assessment Metadata Kernel
 *
 * Deterministic orchestration functions for assessment metadata.
 * Produces assessment profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Generates assessments
 * - Generates questions
 * - Generates quizzes
 * - Grades
 * - Scores automatically
 * - Evaluates competencies
 * - Performs adaptive assessment
 * - Diagnoses students
 * - Generates feedback
 * - Generates rubrics
 * - Adapts difficulty
 * - Executes exams
 * - Orchestrates assessments
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Assessment metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeAssessmentProfile,
  KnowledgeAssessmentProvenance,
  KnowledgeAssessmentDecision,
  KnowledgeAssessmentTrace,
  KnowledgeAssessmentRegistry,
  KnowledgeAssessmentRegistryMetadata,
  KnowledgeAssessmentInput,
  KnowledgeAssessmentRelationship,
  KnowledgeArtifactWithAssessments,
  AssessmentType,
  AssessmentObjective,
  AssessmentDifficulty,
  AssessmentVisibility,
  AssessmentStatus,
  AssessmentGovernance,
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
// Assessment Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeAssessmentProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: AssessmentGovernance;
}): KnowledgeAssessmentProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Assessment Decision Composition
// ---------------------------------------------------------------------------

function _composeAssessmentDecision(
  assessmentId: string,
  conceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeAssessmentDecision {
  return {
    decisionId: `_decision_${assessmentId}`,
    assessmentId,
    conceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Assessment Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeAssessmentTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeAssessmentDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeAssessmentTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_assessment_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Assessment Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeAssessmentProfile(params: {
  readonly assessmentId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly assessmentType: AssessmentType;
  readonly objective: AssessmentObjective;
  readonly difficulty: AssessmentDifficulty;
  readonly visibility: AssessmentVisibility;
  readonly status: AssessmentStatus;
  readonly governance: AssessmentGovernance;
  readonly estimatedDuration: number;
  readonly competencyReferences: readonly string[];
  readonly tags: readonly string[];
  readonly provenance: KnowledgeAssessmentProvenance;
}): KnowledgeAssessmentProfile {
  return {
    assessmentId: params.assessmentId,
    conceptId: params.conceptId,
    title: params.title,
    assessmentType: params.assessmentType,
    objective: params.objective,
    difficulty: params.difficulty,
    visibility: params.visibility,
    status: params.status,
    governance: params.governance,
    estimatedDuration: params.estimatedDuration,
    competencyReferences: [...params.competencyReferences],
    tags: [...params.tags],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Assessment Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeAssessmentRelationship(params: {
  readonly relationshipId: string;
  readonly sourceAssessmentId: string;
  readonly targetAssessmentId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeAssessmentProvenance;
}): KnowledgeAssessmentRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceAssessmentId: params.sourceAssessmentId,
    targetAssessmentId: params.targetAssessmentId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeAssessmentProfile(
  a: KnowledgeAssessmentProfile,
  b: KnowledgeAssessmentProfile,
): number {
  if (a.conceptId < b.conceptId) return -1;
  if (a.conceptId > b.conceptId) return 1;

  if (a.assessmentType < b.assessmentType) return -1;
  if (a.assessmentType > b.assessmentType) return 1;

  if (a.difficulty < b.difficulty) return -1;
  if (a.difficulty > b.difficulty) return 1;

  if (a.assessmentId < b.assessmentId) return -1;
  if (a.assessmentId > b.assessmentId) return 1;

  return 0;
}

function _compareKnowledgeAssessmentRelationship(
  a: KnowledgeAssessmentRelationship,
  b: KnowledgeAssessmentRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Assessment Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeAssessmentRegistry(
  profiles: readonly KnowledgeAssessmentProfile[],
  relationships: readonly KnowledgeAssessmentRelationship[],
): KnowledgeAssessmentRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeAssessmentProfile);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeAssessmentRelationship);

  const concepts = new Set(sortedProfiles.map((p) => p.conceptId));
  const types = new Set(sortedProfiles.map((p) => p.assessmentType));

  const metadata: KnowledgeAssessmentRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    assessmentCount: sortedProfiles.length,
    relationshipCount: sortedRelationships.length,
    conceptCount: concepts.size,
    typeCount: types.size,
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
      generatedFrom: 'deterministic_assessment_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_assessment_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Assessment Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeAssessmentRegistryFromInput(
  input: KnowledgeAssessmentInput,
): KnowledgeAssessmentRegistry {
  return composeKnowledgeAssessmentRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Assessment Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeAssessments(
  input: KnowledgeAssessmentInput,
): KnowledgeAssessmentRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateAssessmentForDecision(profile);
    return _composeAssessmentDecision(profile.assessmentId, profile.conceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeAssessmentRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeAssessmentTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateAssessmentForDecision(
  profile: KnowledgeAssessmentProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.assessmentId || profile.assessmentId.trim() === '') {
    errors.push('ASSESSMENT_MISSING_PROFILE_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('ASSESSMENT_MISSING_TITLE');
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push('ASSESSMENT_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_ASSESSMENT_TYPES.includes(profile.assessmentType)) {
    errors.push('ASSESSMENT_INVALID_TYPE');
  }

  if (!CANONICAL_ASSESSMENT_OBJECTIVES.includes(profile.objective)) {
    errors.push('ASSESSMENT_INVALID_OBJECTIVE');
  }

  if (!CANONICAL_ASSESSMENT_DIFFICULTY.includes(profile.difficulty)) {
    errors.push('ASSESSMENT_INVALID_DIFFICULTY');
  }

  if (!CANONICAL_ASSESSMENT_VISIBILITY.includes(profile.visibility)) {
    errors.push('ASSESSMENT_INVALID_VISIBILITY');
  }

  if (!CANONICAL_ASSESSMENT_STATUS.includes(profile.status)) {
    errors.push('ASSESSMENT_INVALID_STATUS');
  }

  if (!CANONICAL_ASSESSMENT_GOVERNANCE.includes(profile.governance)) {
    errors.push('ASSESSMENT_INVALID_GOVERNANCE');
  }

  if (!profile.provenance) {
    errors.push('ASSESSMENT_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Assessments Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithAssessments(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeAssessmentProfile[];
  readonly relationships: readonly KnowledgeAssessmentRelationship[];
  readonly provenance: KnowledgeAssessmentProvenance;
}): KnowledgeArtifactWithAssessments {
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

export function isSupportedAssessmentType(
  value: string,
): value is AssessmentType {
  return CANONICAL_ASSESSMENT_TYPES.includes(value as AssessmentType);
}

export function isSupportedAssessmentObjective(
  value: string,
): value is AssessmentObjective {
  return CANONICAL_ASSESSMENT_OBJECTIVES.includes(value as AssessmentObjective);
}

export function isSupportedAssessmentDifficulty(
  value: string,
): value is AssessmentDifficulty {
  return CANONICAL_ASSESSMENT_DIFFICULTY.includes(value as AssessmentDifficulty);
}

export function isSupportedAssessmentVisibility(
  value: string,
): value is AssessmentVisibility {
  return CANONICAL_ASSESSMENT_VISIBILITY.includes(value as AssessmentVisibility);
}

export function isSupportedAssessmentStatus(
  value: string,
): value is AssessmentStatus {
  return CANONICAL_ASSESSMENT_STATUS.includes(value as AssessmentStatus);
}

export function isSupportedAssessmentGovernance(
  value: string,
): value is AssessmentGovernance {
  return CANONICAL_ASSESSMENT_GOVERNANCE.includes(value as AssessmentGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalAssessmentTypes(): readonly AssessmentType[] {
  return CANONICAL_ASSESSMENT_TYPES;
}

export function getCanonicalAssessmentObjectives(): readonly AssessmentObjective[] {
  return CANONICAL_ASSESSMENT_OBJECTIVES;
}

export function getCanonicalAssessmentDifficulties(): readonly AssessmentDifficulty[] {
  return CANONICAL_ASSESSMENT_DIFFICULTY;
}

export function getCanonicalAssessmentVisibility(): readonly AssessmentVisibility[] {
  return CANONICAL_ASSESSMENT_VISIBILITY;
}

export function getCanonicalAssessmentStatuses(): readonly AssessmentStatus[] {
  return CANONICAL_ASSESSMENT_STATUS;
}
