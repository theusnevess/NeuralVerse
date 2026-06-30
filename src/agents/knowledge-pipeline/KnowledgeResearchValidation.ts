/**
 * D10-OPT-10 — Research Provenance Validation Layer
 *
 * Deterministic validation for research metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeResearchProfile,
  KnowledgeResearchRelationship,
  KnowledgeResearchRegistry,
  KnowledgeResearchTrace,
  KnowledgeResearchInput,
  KnowledgeArtifactWithResearch,
  KnowledgeResearchValidationError,
  KnowledgeResearchRegistryValidationResult,
  KnowledgeResearchInputValidationResult,
  KnowledgeResearchTraceValidationResult,
  KnowledgeArtifactWithResearchValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_RESEARCH_SOURCE_TYPES,
  CANONICAL_EVIDENCE_LEVELS,
  CANONICAL_RESEARCH_CITATION_TYPES as CANONICAL_CITATION_TYPES,
  CANONICAL_RESEARCH_STATUS,
  CANONICAL_RESEARCH_VISIBILITY,
  CANONICAL_RESEARCH_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix RESEARCH_)
// ---------------------------------------------------------------------------

export const RESEARCH_VALIDATION_CODES = {
  RESEARCH_DUPLICATE_ID: 'RESEARCH_DUPLICATE_ID',
  RESEARCH_DUPLICATE_TITLE: 'RESEARCH_DUPLICATE_TITLE',
  RESEARCH_INVALID_SOURCE: 'RESEARCH_INVALID_SOURCE',
  RESEARCH_INVALID_EVIDENCE: 'RESEARCH_INVALID_EVIDENCE',
  RESEARCH_INVALID_CITATION: 'RESEARCH_INVALID_CITATION',
  RESEARCH_INVALID_VISIBILITY: 'RESEARCH_INVALID_VISIBILITY',
  RESEARCH_INVALID_STATUS: 'RESEARCH_INVALID_STATUS',
  RESEARCH_INVALID_GOVERNANCE: 'RESEARCH_INVALID_GOVERNANCE',
  RESEARCH_MISSING_PROVENANCE: 'RESEARCH_MISSING_PROVENANCE',
  RESEARCH_MISSING_PROVIDER: 'RESEARCH_MISSING_PROVIDER',
  RESEARCH_MISSING_RATIONALE: 'RESEARCH_MISSING_RATIONALE',
  RESEARCH_MISSING_CONCEPT_REFERENCE: 'RESEARCH_MISSING_CONCEPT_REFERENCE',
  RESEARCH_MISSING_PROFILE_ID: 'RESEARCH_MISSING_PROFILE_ID',
  RESEARCH_MISSING_TITLE: 'RESEARCH_MISSING_TITLE',
  RESEARCH_SELF_RELATIONSHIP: 'RESEARCH_SELF_RELATIONSHIP',
  RESEARCH_EMPTY_REGISTRY: 'RESEARCH_EMPTY_REGISTRY',
  RESEARCH_INVALID_TRACE: 'RESEARCH_INVALID_TRACE',
  RESEARCH_REGISTRY_INCONSISTENCY: 'RESEARCH_REGISTRY_INCONSISTENCY',
  RESEARCH_INVALID_CONFIGURATION: 'RESEARCH_INVALID_CONFIGURATION',
  RESEARCH_INVALID_ORDER: 'RESEARCH_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeResearchProfile(
  profile: KnowledgeResearchProfile,
): readonly KnowledgeResearchValidationError[] {
  const errors: KnowledgeResearchValidationError[] = [];

  if (!profile.researchId || profile.researchId.trim() === '') {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_PROFILE_ID,
      message: 'Research profile is missing a profile ID.',
      field: 'researchId',
      researchId: profile.researchId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_TITLE,
      message: 'Research profile is missing a title.',
      field: 'title',
      researchId: profile.researchId,
    });
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_CONCEPT_REFERENCE,
      message: 'Research profile is missing a concept reference.',
      field: 'conceptId',
      researchId: profile.researchId,
    });
  }

  if (!CANONICAL_RESEARCH_SOURCE_TYPES.includes(profile.researchSourceType)) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_SOURCE,
      message: `Research profile has unsupported source type: "${profile.researchSourceType}".`,
      field: 'researchSourceType',
      researchId: profile.researchId,
    });
  }

  if (!CANONICAL_EVIDENCE_LEVELS.includes(profile.evidenceLevel)) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_EVIDENCE,
      message: `Research profile has unsupported evidence level: "${profile.evidenceLevel}".`,
      field: 'evidenceLevel',
      researchId: profile.researchId,
    });
  }

  if (!CANONICAL_CITATION_TYPES.includes(profile.citationType)) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_CITATION,
      message: `Research profile has unsupported citation type: "${profile.citationType}".`,
      field: 'citationType',
      researchId: profile.researchId,
    });
  }

  if (!CANONICAL_RESEARCH_VISIBILITY.includes(profile.visibility)) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_VISIBILITY,
      message: `Research profile has unsupported visibility: "${profile.visibility}".`,
      field: 'visibility',
      researchId: profile.researchId,
    });
  }

  if (!CANONICAL_RESEARCH_STATUS.includes(profile.status)) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_STATUS,
      message: `Research profile has unsupported status: "${profile.status}".`,
      field: 'status',
      researchId: profile.researchId,
    });
  }

  if (!CANONICAL_RESEARCH_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_GOVERNANCE,
      message: `Research profile has unsupported governance: "${profile.governance}".`,
      field: 'governance',
      researchId: profile.researchId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_PROVENANCE,
      message: 'Research profile is missing provenance.',
      field: 'provenance',
      researchId: profile.researchId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_PROVIDER,
        message: 'Research provenance is missing a provider.',
        field: 'provenance.provider',
        researchId: profile.researchId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_RATIONALE,
        message: 'Research provenance is missing a rationale.',
        field: 'provenance.rationale',
        researchId: profile.researchId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeResearchRelationship(
  relationship: KnowledgeResearchRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeResearchValidationError[] {
  const errors: KnowledgeResearchValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_PROFILE_ID,
      message: 'Research relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceResearchId === relationship.targetResearchId) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_SELF_RELATIONSHIP,
      message: 'Research relationship cannot reference itself.',
      field: 'targetResearchId',
      researchId: relationship.sourceResearchId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceResearchId)) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_CONFIGURATION,
      message: `Research relationship references unknown source profile: "${relationship.sourceResearchId}".`,
      field: 'sourceResearchId',
      researchId: relationship.sourceResearchId,
    });
  }

  if (!knownProfileIds.has(relationship.targetResearchId)) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_CONFIGURATION,
      message: `Research relationship references unknown target profile: "${relationship.targetResearchId}".`,
      field: 'targetResearchId',
      researchId: relationship.targetResearchId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_PROVENANCE,
      message: 'Research relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Research Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeResearchRegistry(
  registry: KnowledgeResearchRegistry,
): KnowledgeResearchRegistryValidationResult {
  const errors: KnowledgeResearchValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.researchId)) {
      errors.push({
        code: RESEARCH_VALIDATION_CODES.RESEARCH_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.researchId}".`,
        researchId: profile.researchId,
      });
    }
    seenIds.add(profile.researchId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: RESEARCH_VALIDATION_CODES.RESEARCH_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        researchId: profile.researchId,
      });
    }
    seenTitles.add(profile.title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeResearchProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.researchId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeResearchRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.researchCount !== registry.profiles.length) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_REGISTRY_INCONSISTENCY,
      message: `Registry metadata research count (${registry.metadata.researchCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.researchCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_research_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Research Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeResearchInput(
  input: KnowledgeResearchInput,
): KnowledgeResearchInputValidationResult {
  const errors: KnowledgeResearchValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeResearchProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_research_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Research Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeResearchTrace(
  trace: KnowledgeResearchTrace,
): KnowledgeResearchTraceValidationResult {
  const errors: KnowledgeResearchValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_TRACE,
      message: 'Research trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_TRACE,
      message: 'Research trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_TRACE,
      message: 'Research trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_INVALID_TRACE,
      message: 'Research trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_research_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Research Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithResearch(
  artifact: KnowledgeArtifactWithResearch,
): KnowledgeArtifactWithResearchValidationResult {
  const errors: KnowledgeResearchValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_EMPTY_REGISTRY,
      message: 'Artifact has no research profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeResearchProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: RESEARCH_VALIDATION_CODES.RESEARCH_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_research_composition',
  };
}
