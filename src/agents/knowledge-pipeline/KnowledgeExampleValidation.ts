/**
 * D10-OPT-05 — Progressive Examples, Canonical Example Modeling Validation Layer
 *
 * Deterministic validation for example metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeExampleProfile,
  KnowledgeExampleRelationship,
  KnowledgeExampleRegistry,
  KnowledgeExampleTrace,
  KnowledgeExampleInput,
  KnowledgeArtifactWithExamples,
  KnowledgeExampleValidationError,
  KnowledgeExampleRegistryValidationResult,
  KnowledgeExampleInputValidationResult,
  KnowledgeExampleTraceValidationResult,
  KnowledgeArtifactWithExamplesValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_EXAMPLE_TYPES,
  CANONICAL_EXAMPLE_LEVELS,
  CANONICAL_PROGRESSIVE_STAGES,
  CANONICAL_EXAMPLE_STATUS,
  CANONICAL_EXAMPLE_VISIBILITY,
  CANONICAL_EXAMPLE_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix EXAMPLE_)
// ---------------------------------------------------------------------------

export const EXAMPLE_VALIDATION_CODES = {
  EXAMPLE_DUPLICATE_ID: 'EXAMPLE_DUPLICATE_ID',
  EXAMPLE_DUPLICATE_TITLE: 'EXAMPLE_DUPLICATE_TITLE',
  EXAMPLE_INVALID_TYPE: 'EXAMPLE_INVALID_TYPE',
  EXAMPLE_INVALID_LEVEL: 'EXAMPLE_INVALID_LEVEL',
  EXAMPLE_INVALID_STAGE: 'EXAMPLE_INVALID_STAGE',
  EXAMPLE_INVALID_VISIBILITY: 'EXAMPLE_INVALID_VISIBILITY',
  EXAMPLE_INVALID_STATUS: 'EXAMPLE_INVALID_STATUS',
  EXAMPLE_INVALID_GOVERNANCE: 'EXAMPLE_INVALID_GOVERNANCE',
  EXAMPLE_MISSING_PROVENANCE: 'EXAMPLE_MISSING_PROVENANCE',
  EXAMPLE_MISSING_PROVIDER: 'EXAMPLE_MISSING_PROVIDER',
  EXAMPLE_MISSING_RATIONALE: 'EXAMPLE_MISSING_RATIONALE',
  EXAMPLE_MISSING_CONCEPT_REFERENCE: 'EXAMPLE_MISSING_CONCEPT_REFERENCE',
  EXAMPLE_MISSING_PROFILE_ID: 'EXAMPLE_MISSING_PROFILE_ID',
  EXAMPLE_MISSING_TITLE: 'EXAMPLE_MISSING_TITLE',
  EXAMPLE_SELF_RELATIONSHIP: 'EXAMPLE_SELF_RELATIONSHIP',
  EXAMPLE_EMPTY_REGISTRY: 'EXAMPLE_EMPTY_REGISTRY',
  EXAMPLE_INVALID_TRACE: 'EXAMPLE_INVALID_TRACE',
  EXAMPLE_REGISTRY_INCONSISTENCY: 'EXAMPLE_REGISTRY_INCONSISTENCY',
  EXAMPLE_INVALID_CONFIGURATION: 'EXAMPLE_INVALID_CONFIGURATION',
  EXAMPLE_INVALID_ORDER: 'EXAMPLE_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeExampleProfile(
  profile: KnowledgeExampleProfile,
): readonly KnowledgeExampleValidationError[] {
  const errors: KnowledgeExampleValidationError[] = [];

  if (!profile.exampleId || profile.exampleId.trim() === '') {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_PROFILE_ID,
      message: 'Example profile is missing a profile ID.',
      field: 'exampleId',
      exampleId: profile.exampleId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_TITLE,
      message: 'Example profile is missing a title.',
      field: 'title',
      exampleId: profile.exampleId,
    });
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_CONCEPT_REFERENCE,
      message: 'Example profile is missing a concept reference.',
      field: 'conceptId',
      exampleId: profile.exampleId,
    });
  }

  if (!CANONICAL_EXAMPLE_TYPES.includes(profile.exampleType)) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_TYPE,
      message: `Example profile has unsupported type: "${profile.exampleType}".`,
      field: 'exampleType',
      exampleId: profile.exampleId,
    });
  }

  if (!CANONICAL_EXAMPLE_LEVELS.includes(profile.exampleLevel)) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_LEVEL,
      message: `Example profile has unsupported level: "${profile.exampleLevel}".`,
      field: 'exampleLevel',
      exampleId: profile.exampleId,
    });
  }

  if (!CANONICAL_PROGRESSIVE_STAGES.includes(profile.progressiveStage)) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_STAGE,
      message: `Example profile has unsupported progressive stage: "${profile.progressiveStage}".`,
      field: 'progressiveStage',
      exampleId: profile.exampleId,
    });
  }

  if (!CANONICAL_EXAMPLE_VISIBILITY.includes(profile.visibility)) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_VISIBILITY,
      message: `Example profile has unsupported visibility: "${profile.visibility}".`,
      field: 'visibility',
      exampleId: profile.exampleId,
    });
  }

  if (!CANONICAL_EXAMPLE_STATUS.includes(profile.status)) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_STATUS,
      message: `Example profile has unsupported status: "${profile.status}".`,
      field: 'status',
      exampleId: profile.exampleId,
    });
  }

  if (!CANONICAL_EXAMPLE_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_GOVERNANCE,
      message: `Example profile has unsupported governance: "${profile.governance}".`,
      field: 'governance',
      exampleId: profile.exampleId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_PROVENANCE,
      message: 'Example profile is missing provenance.',
      field: 'provenance',
      exampleId: profile.exampleId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_PROVIDER,
        message: 'Example provenance is missing a provider.',
        field: 'provenance.provider',
        exampleId: profile.exampleId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_RATIONALE,
        message: 'Example provenance is missing a rationale.',
        field: 'provenance.rationale',
        exampleId: profile.exampleId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeExampleRelationship(
  relationship: KnowledgeExampleRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeExampleValidationError[] {
  const errors: KnowledgeExampleValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_PROFILE_ID,
      message: 'Example relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceExampleId === relationship.targetExampleId) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_SELF_RELATIONSHIP,
      message: 'Example relationship cannot reference itself.',
      field: 'targetExampleId',
      exampleId: relationship.sourceExampleId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceExampleId)) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_CONFIGURATION,
      message: `Example relationship references unknown source profile: "${relationship.sourceExampleId}".`,
      field: 'sourceExampleId',
      exampleId: relationship.sourceExampleId,
    });
  }

  if (!knownProfileIds.has(relationship.targetExampleId)) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_CONFIGURATION,
      message: `Example relationship references unknown target profile: "${relationship.targetExampleId}".`,
      field: 'targetExampleId',
      exampleId: relationship.targetExampleId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_PROVENANCE,
      message: 'Example relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Example Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeExampleRegistry(
  registry: KnowledgeExampleRegistry,
): KnowledgeExampleRegistryValidationResult {
  const errors: KnowledgeExampleValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.exampleId)) {
      errors.push({
        code: EXAMPLE_VALIDATION_CODES.EXAMPLE_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.exampleId}".`,
        exampleId: profile.exampleId,
      });
    }
    seenIds.add(profile.exampleId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: EXAMPLE_VALIDATION_CODES.EXAMPLE_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        exampleId: profile.exampleId,
      });
    }
    seenTitles.add(profile.title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeExampleProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.exampleId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeExampleRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.exampleCount !== registry.profiles.length) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_REGISTRY_INCONSISTENCY,
      message: `Registry metadata example count (${registry.metadata.exampleCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.exampleCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_example_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Example Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeExampleInput(
  input: KnowledgeExampleInput,
): KnowledgeExampleInputValidationResult {
  const errors: KnowledgeExampleValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeExampleProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_example_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Example Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeExampleTrace(
  trace: KnowledgeExampleTrace,
): KnowledgeExampleTraceValidationResult {
  const errors: KnowledgeExampleValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_TRACE,
      message: 'Example trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_TRACE,
      message: 'Example trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_TRACE,
      message: 'Example trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_INVALID_TRACE,
      message: 'Example trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_example_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Examples Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithExamples(
  artifact: KnowledgeArtifactWithExamples,
): KnowledgeArtifactWithExamplesValidationResult {
  const errors: KnowledgeExampleValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_EMPTY_REGISTRY,
      message: 'Artifact has no example profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeExampleProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: EXAMPLE_VALIDATION_CODES.EXAMPLE_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_examples_composition',
  };
}
