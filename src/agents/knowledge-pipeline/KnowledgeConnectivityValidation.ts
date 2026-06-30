/**
 * D10-OPT-14 — Semantic Connectivity Validation Layer
 *
 * Deterministic validation for connectivity metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeConnectivityProfile,
  KnowledgeConnectivityRelationship,
  KnowledgeConnectivityRegistry,
  KnowledgeConnectivityTrace,
  KnowledgeConnectivityInput,
  KnowledgeArtifactWithConnectivity,
  KnowledgeConnectivityValidationError,
  KnowledgeConnectivityRegistryValidationResult,
  KnowledgeConnectivityInputValidationResult,
  KnowledgeConnectivityTraceValidationResult,
  KnowledgeArtifactWithConnectivityValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_CONNECTIVITY_TYPES,
  CANONICAL_CONNECTIVITY_STRENGTH,
  CANONICAL_CONNECTIVITY_SCOPE,
  CANONICAL_CONNECTIVITY_STATUS,
  CANONICAL_CONNECTIVITY_VISIBILITY,
  CANONICAL_CONNECTIVITY_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix CONNECTIVITY_)
// ---------------------------------------------------------------------------

export const CONNECTIVITY_VALIDATION_CODES = {
  CONNECTIVITY_DUPLICATE_ID: 'CONNECTIVITY_DUPLICATE_ID',
  CONNECTIVITY_DUPLICATE_TITLE: 'CONNECTIVITY_DUPLICATE_TITLE',
  CONNECTIVITY_INVALID_TYPE: 'CONNECTIVITY_INVALID_TYPE',
  CONNECTIVITY_INVALID_STRENGTH: 'CONNECTIVITY_INVALID_STRENGTH',
  CONNECTIVITY_INVALID_SCOPE: 'CONNECTIVITY_INVALID_SCOPE',
  CONNECTIVITY_INVALID_VISIBILITY: 'CONNECTIVITY_INVALID_VISIBILITY',
  CONNECTIVITY_INVALID_STATUS: 'CONNECTIVITY_INVALID_STATUS',
  CONNECTIVITY_INVALID_GOVERNANCE: 'CONNECTIVITY_INVALID_GOVERNANCE',
  CONNECTIVITY_MISSING_PROVENANCE: 'CONNECTIVITY_MISSING_PROVENANCE',
  CONNECTIVITY_MISSING_PROVIDER: 'CONNECTIVITY_MISSING_PROVIDER',
  CONNECTIVITY_MISSING_RATIONALE: 'CONNECTIVITY_MISSING_RATIONALE',
  CONNECTIVITY_MISSING_CONCEPT_REFERENCE: 'CONNECTIVITY_MISSING_CONCEPT_REFERENCE',
  CONNECTIVITY_MISSING_RELATIONSHIP_ID: 'CONNECTIVITY_MISSING_RELATIONSHIP_ID',
  CONNECTIVITY_MISSING_TITLE: 'CONNECTIVITY_MISSING_TITLE',
  CONNECTIVITY_SELF_RELATIONSHIP: 'CONNECTIVITY_SELF_RELATIONSHIP',
  CONNECTIVITY_EMPTY_REGISTRY: 'CONNECTIVITY_EMPTY_REGISTRY',
  CONNECTIVITY_INVALID_TRACE: 'CONNECTIVITY_INVALID_TRACE',
  CONNECTIVITY_REGISTRY_INCONSISTENCY: 'CONNECTIVITY_REGISTRY_INCONSISTENCY',
  CONNECTIVITY_INVALID_CONFIGURATION: 'CONNECTIVITY_INVALID_CONFIGURATION',
  CONNECTIVITY_INVALID_ORDER: 'CONNECTIVITY_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeConnectivityProfile(
  profile: KnowledgeConnectivityProfile,
): readonly KnowledgeConnectivityValidationError[] {
  const errors: KnowledgeConnectivityValidationError[] = [];

  if (!profile.relationshipId || profile.relationshipId.trim() === '') {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_RELATIONSHIP_ID,
      message: 'Connectivity profile is missing a relationship ID.',
      field: 'relationshipId',
      relationshipId: profile.relationshipId,
    });
  }

  if (!profile.sourceConceptId || profile.sourceConceptId.trim() === '') {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_CONCEPT_REFERENCE,
      message: 'Connectivity profile is missing a source concept reference.',
      field: 'sourceConceptId',
      relationshipId: profile.relationshipId,
    });
  }

  if (!profile.targetConceptId || profile.targetConceptId.trim() === '') {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_CONCEPT_REFERENCE,
      message: 'Connectivity profile is missing a target concept reference.',
      field: 'targetConceptId',
      relationshipId: profile.relationshipId,
    });
  }

  if (!CANONICAL_CONNECTIVITY_TYPES.includes(profile.relationshipType)) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_TYPE,
      message: `Connectivity profile has unsupported type: "${profile.relationshipType}".`,
      field: 'relationshipType',
      relationshipId: profile.relationshipId,
    });
  }

  if (!CANONICAL_CONNECTIVITY_STRENGTH.includes(profile.relationshipStrength)) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_STRENGTH,
      message: `Connectivity profile has unsupported strength: "${profile.relationshipStrength}".`,
      field: 'relationshipStrength',
      relationshipId: profile.relationshipId,
    });
  }

  if (!CANONICAL_CONNECTIVITY_SCOPE.includes(profile.scope)) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_SCOPE,
      message: `Connectivity profile has unsupported scope: "${profile.scope}".`,
      field: 'scope',
      relationshipId: profile.relationshipId,
    });
  }

  if (!CANONICAL_CONNECTIVITY_VISIBILITY.includes(profile.visibility)) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_VISIBILITY,
      message: `Connectivity profile has unsupported visibility: "${profile.visibility}".`,
      field: 'visibility',
      relationshipId: profile.relationshipId,
    });
  }

  if (!CANONICAL_CONNECTIVITY_STATUS.includes(profile.status)) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_STATUS,
      message: `Connectivity profile has unsupported status: "${profile.status}".`,
      field: 'status',
      relationshipId: profile.relationshipId,
    });
  }

  if (!CANONICAL_CONNECTIVITY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_GOVERNANCE,
      message: `Connectivity profile has unsupported governance: "${profile.governance}".`,
      field: 'governance',
      relationshipId: profile.relationshipId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_PROVENANCE,
      message: 'Connectivity profile is missing provenance.',
      field: 'provenance',
      relationshipId: profile.relationshipId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_PROVIDER,
        message: 'Connectivity provenance is missing a provider.',
        field: 'provenance.provider',
        relationshipId: profile.relationshipId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_RATIONALE,
        message: 'Connectivity provenance is missing a rationale.',
        field: 'provenance.rationale',
        relationshipId: profile.relationshipId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeConnectivityRelationship(
  relationship: KnowledgeConnectivityRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeConnectivityValidationError[] {
  const errors: KnowledgeConnectivityValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_RELATIONSHIP_ID,
      message: 'Connectivity relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceRelationshipId === relationship.targetRelationshipId) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_SELF_RELATIONSHIP,
      message: 'Connectivity relationship cannot reference itself.',
      field: 'targetRelationshipId',
      relationshipId: relationship.sourceRelationshipId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceRelationshipId)) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_CONFIGURATION,
      message: `Connectivity relationship references unknown source profile: "${relationship.sourceRelationshipId}".`,
      field: 'sourceRelationshipId',
      relationshipId: relationship.sourceRelationshipId,
    });
  }

  if (!knownProfileIds.has(relationship.targetRelationshipId)) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_CONFIGURATION,
      message: `Connectivity relationship references unknown target profile: "${relationship.targetRelationshipId}".`,
      field: 'targetRelationshipId',
      relationshipId: relationship.targetRelationshipId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_PROVENANCE,
      message: 'Connectivity relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Connectivity Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeConnectivityRegistry(
  registry: KnowledgeConnectivityRegistry,
): KnowledgeConnectivityRegistryValidationResult {
  const errors: KnowledgeConnectivityValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.relationshipId)) {
      errors.push({
        code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.relationshipId}".`,
        relationshipId: profile.relationshipId,
      });
    }
    seenIds.add(profile.relationshipId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    const title = `${profile.sourceConceptId}-${profile.targetConceptId}`;
    if (seenTitles.has(title)) {
      errors.push({
        code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_DUPLICATE_TITLE,
        message: `Duplicate connectivity title: "${title}".`,
        field: 'title',
        relationshipId: profile.relationshipId,
      });
    }
    seenTitles.add(title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeConnectivityProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.relationshipId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeConnectivityRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.relationshipCount !== registry.profiles.length) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  if (registry.metadata.higherOrderRelationshipCount !== registry.relationships.length) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_REGISTRY_INCONSISTENCY,
      message: `Registry metadata higher-order relationship count (${registry.metadata.higherOrderRelationshipCount}) does not match actual higher-order relationship count (${registry.relationships.length}).`,
      field: 'metadata.higherOrderRelationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_connectivity_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Connectivity Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeConnectivityInput(
  input: KnowledgeConnectivityInput,
): KnowledgeConnectivityInputValidationResult {
  const errors: KnowledgeConnectivityValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeConnectivityProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_connectivity_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Connectivity Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeConnectivityTrace(
  trace: KnowledgeConnectivityTrace,
): KnowledgeConnectivityTraceValidationResult {
  const errors: KnowledgeConnectivityValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_TRACE,
      message: 'Connectivity trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_TRACE,
      message: 'Connectivity trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_TRACE,
      message: 'Connectivity trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_INVALID_TRACE,
      message: 'Connectivity trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_connectivity_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Connectivity Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithConnectivity(
  artifact: KnowledgeArtifactWithConnectivity,
): KnowledgeArtifactWithConnectivityValidationResult {
  const errors: KnowledgeConnectivityValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_EMPTY_REGISTRY,
      message: 'Artifact has no connectivity profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeConnectivityProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: CONNECTIVITY_VALIDATION_CODES.CONNECTIVITY_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_connectivity_composition',
  };
}
