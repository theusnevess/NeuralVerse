/**
 * D10-OPT-16 — Continuous Governance Validation Layer
 *
 * Deterministic validation for governance metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeGovernanceProfile,
  KnowledgeGovernanceRelationship,
  KnowledgeGovernanceRegistry,
  KnowledgeGovernanceTrace,
  KnowledgeGovernanceInput,
  KnowledgeArtifactWithGovernance,
  KnowledgeGovernanceValidationError,
  KnowledgeGovernanceRegistryValidationResult,
  KnowledgeGovernanceInputValidationResult,
  KnowledgeGovernanceTraceValidationResult,
  KnowledgeArtifactWithGovernanceValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_GOVERNANCE_STAGES,
  CANONICAL_GOVERNANCE_EVENTS,
  CANONICAL_REVIEW_LEVELS,
  CANONICAL_GOVERNANCE_STATUS,
  CANONICAL_GOVERNANCE_VISIBILITY,
  CANONICAL_GOVERNANCE_POLICY,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix GOVERNANCE_)
// ---------------------------------------------------------------------------

export const GOVERNANCE_VALIDATION_CODES = {
  GOVERNANCE_DUPLICATE_ID: 'GOVERNANCE_DUPLICATE_ID',
  GOVERNANCE_DUPLICATE_TITLE: 'GOVERNANCE_DUPLICATE_TITLE',
  GOVERNANCE_INVALID_STAGE: 'GOVERNANCE_INVALID_STAGE',
  GOVERNANCE_INVALID_EVENT: 'GOVERNANCE_INVALID_EVENT',
  GOVERNANCE_INVALID_REVIEW: 'GOVERNANCE_INVALID_REVIEW',
  GOVERNANCE_INVALID_VISIBILITY: 'GOVERNANCE_INVALID_VISIBILITY',
  GOVERNANCE_INVALID_STATUS: 'GOVERNANCE_INVALID_STATUS',
  GOVERNANCE_INVALID_POLICY: 'GOVERNANCE_INVALID_POLICY',
  GOVERNANCE_MISSING_PROVENANCE: 'GOVERNANCE_MISSING_PROVENANCE',
  GOVERNANCE_MISSING_PROVIDER: 'GOVERNANCE_MISSING_PROVIDER',
  GOVERNANCE_MISSING_RATIONALE: 'GOVERNANCE_MISSING_RATIONALE',
  GOVERNANCE_MISSING_CONCEPT_REFERENCE: 'GOVERNANCE_MISSING_CONCEPT_REFERENCE',
  GOVERNANCE_MISSING_PROFILE_ID: 'GOVERNANCE_MISSING_PROFILE_ID',
  GOVERNANCE_MISSING_TITLE: 'GOVERNANCE_MISSING_TITLE',
  GOVERNANCE_SELF_RELATIONSHIP: 'GOVERNANCE_SELF_RELATIONSHIP',
  GOVERNANCE_EMPTY_REGISTRY: 'GOVERNANCE_EMPTY_REGISTRY',
  GOVERNANCE_INVALID_TRACE: 'GOVERNANCE_INVALID_TRACE',
  GOVERNANCE_REGISTRY_INCONSISTENCY: 'GOVERNANCE_REGISTRY_INCONSISTENCY',
  GOVERNANCE_INVALID_CONFIGURATION: 'GOVERNANCE_INVALID_CONFIGURATION',
  GOVERNANCE_INVALID_ORDER: 'GOVERNANCE_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeGovernanceProfile(
  profile: KnowledgeGovernanceProfile,
): readonly KnowledgeGovernanceValidationError[] {
  const errors: KnowledgeGovernanceValidationError[] = [];

  if (!profile.governanceId || profile.governanceId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROFILE_ID,
      message: 'Governance profile is missing a profile ID.',
      field: 'governanceId',
      governanceId: profile.governanceId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_TITLE,
      message: 'Governance profile is missing a title.',
      field: 'title',
      governanceId: profile.governanceId,
    });
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CONCEPT_REFERENCE,
      message: 'Governance profile is missing a concept reference.',
      field: 'conceptId',
      governanceId: profile.governanceId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STAGES.includes(profile.governanceStage)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_STAGE,
      message: `Governance profile has unsupported stage: "${profile.governanceStage}".`,
      field: 'governanceStage',
      governanceId: profile.governanceId,
    });
  }

  if (!CANONICAL_GOVERNANCE_EVENTS.includes(profile.governanceEvent)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_EVENT,
      message: `Governance profile has unsupported event: "${profile.governanceEvent}".`,
      field: 'governanceEvent',
      governanceId: profile.governanceId,
    });
  }

  if (!CANONICAL_REVIEW_LEVELS.includes(profile.reviewLevel)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_REVIEW,
      message: `Governance profile has unsupported review level: "${profile.reviewLevel}".`,
      field: 'reviewLevel',
      governanceId: profile.governanceId,
    });
  }

  if (!CANONICAL_GOVERNANCE_VISIBILITY.includes(profile.visibility)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_VISIBILITY,
      message: `Governance profile has unsupported visibility: "${profile.visibility}".`,
      field: 'visibility',
      governanceId: profile.governanceId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUS.includes(profile.status)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_STATUS,
      message: `Governance profile has unsupported status: "${profile.status}".`,
      field: 'status',
      governanceId: profile.governanceId,
    });
  }

  if (!CANONICAL_GOVERNANCE_POLICY.includes(profile.policy)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_POLICY,
      message: `Governance profile has unsupported policy: "${profile.policy}".`,
      field: 'policy',
      governanceId: profile.governanceId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVENANCE,
      message: 'Governance profile is missing provenance.',
      field: 'provenance',
      governanceId: profile.governanceId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVIDER,
        message: 'Governance provenance is missing a provider.',
        field: 'provenance.provider',
        governanceId: profile.governanceId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_RATIONALE,
        message: 'Governance provenance is missing a rationale.',
        field: 'provenance.rationale',
        governanceId: profile.governanceId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeGovernanceRelationship(
  relationship: KnowledgeGovernanceRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeGovernanceValidationError[] {
  const errors: KnowledgeGovernanceValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROFILE_ID,
      message: 'Governance relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceGovernanceId === relationship.targetGovernanceId) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_SELF_RELATIONSHIP,
      message: 'Governance relationship cannot reference itself.',
      field: 'targetGovernanceId',
      governanceId: relationship.sourceGovernanceId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceGovernanceId)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_CONFIGURATION,
      message: `Governance relationship references unknown source profile: "${relationship.sourceGovernanceId}".`,
      field: 'sourceGovernanceId',
      governanceId: relationship.sourceGovernanceId,
    });
  }

  if (!knownProfileIds.has(relationship.targetGovernanceId)) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_CONFIGURATION,
      message: `Governance relationship references unknown target profile: "${relationship.targetGovernanceId}".`,
      field: 'targetGovernanceId',
      governanceId: relationship.targetGovernanceId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVENANCE,
      message: 'Governance relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Governance Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeGovernanceRegistry(
  registry: KnowledgeGovernanceRegistry,
): KnowledgeGovernanceRegistryValidationResult {
  const errors: KnowledgeGovernanceValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.governanceId)) {
      errors.push({
        code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.governanceId}".`,
        governanceId: profile.governanceId,
      });
    }
    seenIds.add(profile.governanceId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        governanceId: profile.governanceId,
      });
    }
    seenTitles.add(profile.title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeGovernanceProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.governanceId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeGovernanceRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.governanceCount !== registry.profiles.length) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_REGISTRY_INCONSISTENCY,
      message: `Registry metadata governance count (${registry.metadata.governanceCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.governanceCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_governance_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Governance Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeGovernanceInput(
  input: KnowledgeGovernanceInput,
): KnowledgeGovernanceInputValidationResult {
  const errors: KnowledgeGovernanceValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeGovernanceProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_governance_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Governance Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeGovernanceTrace(
  trace: KnowledgeGovernanceTrace,
): KnowledgeGovernanceTraceValidationResult {
  const errors: KnowledgeGovernanceValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Governance trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Governance trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Governance trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_INVALID_TRACE,
      message: 'Governance trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_governance_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Governance Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithGovernance(
  artifact: KnowledgeArtifactWithGovernance,
): KnowledgeArtifactWithGovernanceValidationResult {
  const errors: KnowledgeGovernanceValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_EMPTY_REGISTRY,
      message: 'Artifact has no governance profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeGovernanceProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: GOVERNANCE_VALIDATION_CODES.GOVERNANCE_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_governance_composition',
  };
}
