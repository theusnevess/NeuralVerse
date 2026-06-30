/**
 * D10-OPT-13 — Misconception Registry Validation Layer
 *
 * Deterministic validation for misconception metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeMisconceptionProfile,
  KnowledgeMisconceptionRelationship,
  KnowledgeMisconceptionRegistry,
  KnowledgeMisconceptionTrace,
  KnowledgeMisconceptionInput,
  KnowledgeArtifactWithMisconceptions,
  KnowledgeMisconceptionValidationError,
  KnowledgeMisconceptionRegistryValidationResult,
  KnowledgeMisconceptionInputValidationResult,
  KnowledgeMisconceptionTraceValidationResult,
  KnowledgeArtifactWithMisconceptionsValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_MISCONCEPTION_TYPES,
  CANONICAL_MISCONCEPTION_SEVERITY,
  CANONICAL_CORRECTIVE_STRATEGIES,
  CANONICAL_MISCONCEPTION_STATUS,
  CANONICAL_MISCONCEPTION_VISIBILITY,
  CANONICAL_MISCONCEPTION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix MISCONCEPTION_)
// ---------------------------------------------------------------------------

export const MISCONCEPTION_VALIDATION_CODES = {
  MISCONCEPTION_DUPLICATE_ID: 'MISCONCEPTION_DUPLICATE_ID',
  MISCONCEPTION_DUPLICATE_TITLE: 'MISCONCEPTION_DUPLICATE_TITLE',
  MISCONCEPTION_INVALID_TYPE: 'MISCONCEPTION_INVALID_TYPE',
  MISCONCEPTION_INVALID_SEVERITY: 'MISCONCEPTION_INVALID_SEVERITY',
  MISCONCEPTION_INVALID_CORRECTIVE_STRATEGY: 'MISCONCEPTION_INVALID_CORRECTIVE_STRATEGY',
  MISCONCEPTION_INVALID_VISIBILITY: 'MISCONCEPTION_INVALID_VISIBILITY',
  MISCONCEPTION_INVALID_STATUS: 'MISCONCEPTION_INVALID_STATUS',
  MISCONCEPTION_INVALID_GOVERNANCE: 'MISCONCEPTION_INVALID_GOVERNANCE',
  MISCONCEPTION_MISSING_PROVENANCE: 'MISCONCEPTION_MISSING_PROVENANCE',
  MISCONCEPTION_MISSING_PROVIDER: 'MISCONCEPTION_MISSING_PROVIDER',
  MISCONCEPTION_MISSING_RATIONALE: 'MISCONCEPTION_MISSING_RATIONALE',
  MISCONCEPTION_MISSING_CONCEPT_REFERENCE: 'MISCONCEPTION_MISSING_CONCEPT_REFERENCE',
  MISCONCEPTION_MISSING_PROFILE_ID: 'MISCONCEPTION_MISSING_PROFILE_ID',
  MISCONCEPTION_MISSING_TITLE: 'MISCONCEPTION_MISSING_TITLE',
  MISCONCEPTION_SELF_RELATIONSHIP: 'MISCONCEPTION_SELF_RELATIONSHIP',
  MISCONCEPTION_EMPTY_REGISTRY: 'MISCONCEPTION_EMPTY_REGISTRY',
  MISCONCEPTION_INVALID_TRACE: 'MISCONCEPTION_INVALID_TRACE',
  MISCONCEPTION_REGISTRY_INCONSISTENCY: 'MISCONCEPTION_REGISTRY_INCONSISTENCY',
  MISCONCEPTION_INVALID_CONFIGURATION: 'MISCONCEPTION_INVALID_CONFIGURATION',
  MISCONCEPTION_INVALID_ORDER: 'MISCONCEPTION_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeMisconceptionProfile(
  profile: KnowledgeMisconceptionProfile,
): readonly KnowledgeMisconceptionValidationError[] {
  const errors: KnowledgeMisconceptionValidationError[] = [];

  if (!profile.misconceptionId || profile.misconceptionId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_PROFILE_ID,
      message: 'Misconception profile is missing a profile ID.',
      field: 'misconceptionId',
      misconceptionId: profile.misconceptionId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_TITLE,
      message: 'Misconception profile is missing a title.',
      field: 'title',
      misconceptionId: profile.misconceptionId,
    });
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_CONCEPT_REFERENCE,
      message: 'Misconception profile is missing a concept reference.',
      field: 'conceptId',
      misconceptionId: profile.misconceptionId,
    });
  }

  if (!CANONICAL_MISCONCEPTION_TYPES.includes(profile.misconceptionType)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TYPE,
      message: `Misconception profile has unsupported type: "${profile.misconceptionType}".`,
      field: 'misconceptionType',
      misconceptionId: profile.misconceptionId,
    });
  }

  if (!CANONICAL_MISCONCEPTION_SEVERITY.includes(profile.severity)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_SEVERITY,
      message: `Misconception profile has unsupported severity: "${profile.severity}".`,
      field: 'severity',
      misconceptionId: profile.misconceptionId,
    });
  }

  if (!CANONICAL_CORRECTIVE_STRATEGIES.includes(profile.correctiveStrategy)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_CORRECTIVE_STRATEGY,
      message: `Misconception profile has unsupported corrective strategy: "${profile.correctiveStrategy}".`,
      field: 'correctiveStrategy',
      misconceptionId: profile.misconceptionId,
    });
  }

  if (!CANONICAL_MISCONCEPTION_VISIBILITY.includes(profile.visibility)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_VISIBILITY,
      message: `Misconception profile has unsupported visibility: "${profile.visibility}".`,
      field: 'visibility',
      misconceptionId: profile.misconceptionId,
    });
  }

  if (!CANONICAL_MISCONCEPTION_STATUS.includes(profile.status)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_STATUS,
      message: `Misconception profile has unsupported status: "${profile.status}".`,
      field: 'status',
      misconceptionId: profile.misconceptionId,
    });
  }

  if (!CANONICAL_MISCONCEPTION_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_GOVERNANCE,
      message: `Misconception profile has unsupported governance: "${profile.governance}".`,
      field: 'governance',
      misconceptionId: profile.misconceptionId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_PROVENANCE,
      message: 'Misconception profile is missing provenance.',
      field: 'provenance',
      misconceptionId: profile.misconceptionId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_PROVIDER,
        message: 'Misconception provenance is missing a provider.',
        field: 'provenance.provider',
        misconceptionId: profile.misconceptionId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_RATIONALE,
        message: 'Misconception provenance is missing a rationale.',
        field: 'provenance.rationale',
        misconceptionId: profile.misconceptionId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeMisconceptionRelationship(
  relationship: KnowledgeMisconceptionRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeMisconceptionValidationError[] {
  const errors: KnowledgeMisconceptionValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_PROFILE_ID,
      message: 'Misconception relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceMisconceptionId === relationship.targetMisconceptionId) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_SELF_RELATIONSHIP,
      message: 'Misconception relationship cannot reference itself.',
      field: 'targetMisconceptionId',
      misconceptionId: relationship.sourceMisconceptionId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceMisconceptionId)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_CONFIGURATION,
      message: `Misconception relationship references unknown source profile: "${relationship.sourceMisconceptionId}".`,
      field: 'sourceMisconceptionId',
      misconceptionId: relationship.sourceMisconceptionId,
    });
  }

  if (!knownProfileIds.has(relationship.targetMisconceptionId)) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_CONFIGURATION,
      message: `Misconception relationship references unknown target profile: "${relationship.targetMisconceptionId}".`,
      field: 'targetMisconceptionId',
      misconceptionId: relationship.targetMisconceptionId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_PROVENANCE,
      message: 'Misconception relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Misconception Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeMisconceptionRegistry(
  registry: KnowledgeMisconceptionRegistry,
): KnowledgeMisconceptionRegistryValidationResult {
  const errors: KnowledgeMisconceptionValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.misconceptionId)) {
      errors.push({
        code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.misconceptionId}".`,
        misconceptionId: profile.misconceptionId,
      });
    }
    seenIds.add(profile.misconceptionId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        misconceptionId: profile.misconceptionId,
      });
    }
    seenTitles.add(profile.title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeMisconceptionProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.misconceptionId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeMisconceptionRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.misconceptionCount !== registry.profiles.length) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_REGISTRY_INCONSISTENCY,
      message: `Registry metadata misconception count (${registry.metadata.misconceptionCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.misconceptionCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_misconception_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Misconception Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeMisconceptionInput(
  input: KnowledgeMisconceptionInput,
): KnowledgeMisconceptionInputValidationResult {
  const errors: KnowledgeMisconceptionValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeMisconceptionProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_misconception_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Misconception Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeMisconceptionTrace(
  trace: KnowledgeMisconceptionTrace,
): KnowledgeMisconceptionTraceValidationResult {
  const errors: KnowledgeMisconceptionValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
      message: 'Misconception trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
      message: 'Misconception trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
      message: 'Misconception trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TRACE,
      message: 'Misconception trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_misconception_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Misconceptions Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithMisconceptions(
  artifact: KnowledgeArtifactWithMisconceptions,
): KnowledgeArtifactWithMisconceptionsValidationResult {
  const errors: KnowledgeMisconceptionValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_EMPTY_REGISTRY,
      message: 'Artifact has no misconception profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeMisconceptionProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_misconceptions_composition',
  };
}
