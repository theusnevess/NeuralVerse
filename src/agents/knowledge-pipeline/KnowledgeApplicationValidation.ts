/**
 * D10-OPT-11 — Application Metadata Validation Layer
 *
 * Deterministic validation for application metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeApplicationProfile,
  KnowledgeApplicationRelationship,
  KnowledgeApplicationRegistry,
  KnowledgeApplicationTrace,
  KnowledgeApplicationInput,
  KnowledgeArtifactWithApplications,
  KnowledgeApplicationValidationError,
  KnowledgeApplicationRegistryValidationResult,
  KnowledgeApplicationInputValidationResult,
  KnowledgeApplicationTraceValidationResult,
  KnowledgeArtifactWithApplicationsValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_APPLICATION_TYPES,
  CANONICAL_APPLICATION_OBJECTIVES,
  CANONICAL_APPLICATION_DOMAINS,
  CANONICAL_APPLICATION_STATUS,
  CANONICAL_APPLICATION_VISIBILITY,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix APPLICATION_)
// ---------------------------------------------------------------------------

export const APPLICATION_VALIDATION_CODES = {
  APPLICATION_DUPLICATE_ID: 'APPLICATION_DUPLICATE_ID',
  APPLICATION_DUPLICATE_TITLE: 'APPLICATION_DUPLICATE_TITLE',
  APPLICATION_INVALID_TYPE: 'APPLICATION_INVALID_TYPE',
  APPLICATION_INVALID_OBJECTIVE: 'APPLICATION_INVALID_OBJECTIVE',
  APPLICATION_INVALID_DOMAIN: 'APPLICATION_INVALID_DOMAIN',
  APPLICATION_INVALID_VISIBILITY: 'APPLICATION_INVALID_VISIBILITY',
  APPLICATION_INVALID_STATUS: 'APPLICATION_INVALID_STATUS',
  APPLICATION_INVALID_GOVERNANCE: 'APPLICATION_INVALID_GOVERNANCE',
  APPLICATION_MISSING_PROVENANCE: 'APPLICATION_MISSING_PROVENANCE',
  APPLICATION_MISSING_PROVIDER: 'APPLICATION_MISSING_PROVIDER',
  APPLICATION_MISSING_RATIONALE: 'APPLICATION_MISSING_RATIONALE',
  APPLICATION_MISSING_CONCEPT_REFERENCE: 'APPLICATION_MISSING_CONCEPT_REFERENCE',
  APPLICATION_MISSING_PROFILE_ID: 'APPLICATION_MISSING_PROFILE_ID',
  APPLICATION_MISSING_TITLE: 'APPLICATION_MISSING_TITLE',
  APPLICATION_SELF_RELATIONSHIP: 'APPLICATION_SELF_RELATIONSHIP',
  APPLICATION_EMPTY_REGISTRY: 'APPLICATION_EMPTY_REGISTRY',
  APPLICATION_INVALID_TRACE: 'APPLICATION_INVALID_TRACE',
  APPLICATION_REGISTRY_INCONSISTENCY: 'APPLICATION_REGISTRY_INCONSISTENCY',
  APPLICATION_INVALID_CONFIGURATION: 'APPLICATION_INVALID_CONFIGURATION',
  APPLICATION_INVALID_ORDER: 'APPLICATION_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeApplicationProfile(
  profile: KnowledgeApplicationProfile,
): readonly KnowledgeApplicationValidationError[] {
  const errors: KnowledgeApplicationValidationError[] = [];

  if (!profile.applicationId || profile.applicationId.trim() === '') {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROFILE_ID,
      message: 'Application profile is missing a profile ID.',
      field: 'applicationId',
      applicationId: profile.applicationId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_TITLE,
      message: 'Application profile is missing a title.',
      field: 'title',
      applicationId: profile.applicationId,
    });
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_CONCEPT_REFERENCE,
      message: 'Application profile is missing a concept reference.',
      field: 'conceptId',
      applicationId: profile.applicationId,
    });
  }

  if (!CANONICAL_APPLICATION_TYPES.includes(profile.applicationType)) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TYPE,
      message: `Application profile has unsupported type: "${profile.applicationType}".`,
      field: 'applicationType',
      applicationId: profile.applicationId,
    });
  }

  if (!CANONICAL_APPLICATION_OBJECTIVES.includes(profile.applicationObjective)) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_OBJECTIVE,
      message: `Application profile has unsupported objective: "${profile.applicationObjective}".`,
      field: 'applicationObjective',
      applicationId: profile.applicationId,
    });
  }

  if (!CANONICAL_APPLICATION_DOMAINS.includes(profile.applicationDomain)) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_DOMAIN,
      message: `Application profile has unsupported domain: "${profile.applicationDomain}".`,
      field: 'applicationDomain',
      applicationId: profile.applicationId,
    });
  }

  if (!CANONICAL_APPLICATION_VISIBILITY.includes(profile.visibility)) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_VISIBILITY,
      message: `Application profile has unsupported visibility: "${profile.visibility}".`,
      field: 'visibility',
      applicationId: profile.applicationId,
    });
  }

  if (!CANONICAL_APPLICATION_STATUS.includes(profile.status)) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_STATUS,
      message: `Application profile has unsupported status: "${profile.status}".`,
      field: 'status',
      applicationId: profile.applicationId,
    });
  }

  if (!CANONICAL_APPLICATION_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_GOVERNANCE,
      message: `Application profile has unsupported governance: "${profile.governance}".`,
      field: 'governance',
      applicationId: profile.applicationId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROVENANCE,
      message: 'Application profile is missing provenance.',
      field: 'provenance',
      applicationId: profile.applicationId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROVIDER,
        message: 'Application provenance is missing a provider.',
        field: 'provenance.provider',
        applicationId: profile.applicationId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_RATIONALE,
        message: 'Application provenance is missing a rationale.',
        field: 'provenance.rationale',
        applicationId: profile.applicationId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeApplicationRelationship(
  relationship: KnowledgeApplicationRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeApplicationValidationError[] {
  const errors: KnowledgeApplicationValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROFILE_ID,
      message: 'Application relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceApplicationId === relationship.targetApplicationId) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_SELF_RELATIONSHIP,
      message: 'Application relationship cannot reference itself.',
      field: 'targetApplicationId',
      applicationId: relationship.sourceApplicationId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceApplicationId)) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_CONFIGURATION,
      message: `Application relationship references unknown source profile: "${relationship.sourceApplicationId}".`,
      field: 'sourceApplicationId',
      applicationId: relationship.sourceApplicationId,
    });
  }

  if (!knownProfileIds.has(relationship.targetApplicationId)) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_CONFIGURATION,
      message: `Application relationship references unknown target profile: "${relationship.targetApplicationId}".`,
      field: 'targetApplicationId',
      applicationId: relationship.targetApplicationId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROVENANCE,
      message: 'Application relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Application Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeApplicationRegistry(
  registry: KnowledgeApplicationRegistry,
): KnowledgeApplicationRegistryValidationResult {
  const errors: KnowledgeApplicationValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.applicationId)) {
      errors.push({
        code: APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.applicationId}".`,
        applicationId: profile.applicationId,
      });
    }
    seenIds.add(profile.applicationId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        applicationId: profile.applicationId,
      });
    }
    seenTitles.add(profile.title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeApplicationProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.applicationId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeApplicationRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.applicationCount !== registry.profiles.length) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_REGISTRY_INCONSISTENCY,
      message: `Registry metadata application count (${registry.metadata.applicationCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.applicationCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_application_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeApplicationInput(
  input: KnowledgeApplicationInput,
): KnowledgeApplicationInputValidationResult {
  const errors: KnowledgeApplicationValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeApplicationProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_application_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeApplicationTrace(
  trace: KnowledgeApplicationTrace,
): KnowledgeApplicationTraceValidationResult {
  const errors: KnowledgeApplicationValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Application trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Application trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Application trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Application trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_application_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Applications Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithApplications(
  artifact: KnowledgeArtifactWithApplications,
): KnowledgeArtifactWithApplicationsValidationResult {
  const errors: KnowledgeApplicationValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_EMPTY_REGISTRY,
      message: 'Artifact has no application profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeApplicationProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_applications_composition',
  };
}
