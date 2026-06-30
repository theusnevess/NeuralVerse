/**
 * D10-OPT-07 — Mathematical Graph Modeling Validation Layer
 *
 * Deterministic validation for mathematical graph metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeGraphProfile,
  KnowledgeGraphRelationship,
  KnowledgeGraphRegistry,
  KnowledgeGraphTrace,
  KnowledgeGraphInput,
  KnowledgeArtifactWithGraphs,
  KnowledgeGraphValidationError,
  KnowledgeGraphRegistryValidationResult,
  KnowledgeGraphInputValidationResult,
  KnowledgeGraphTraceValidationResult,
  KnowledgeArtifactWithGraphsValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_GRAPH_TYPES,
  CANONICAL_GRAPH_OBJECTIVES,
  CANONICAL_COORDINATE_SYSTEMS,
  CANONICAL_GRAPH_STATUS,
  CANONICAL_GRAPH_VISIBILITY,
  CANONICAL_GRAPH_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 20, prefix GRAPH_)
// ---------------------------------------------------------------------------

export const GRAPH_VALIDATION_CODES = {
  GRAPH_DUPLICATE_ID: 'GRAPH_DUPLICATE_ID',
  GRAPH_DUPLICATE_TITLE: 'GRAPH_DUPLICATE_TITLE',
  GRAPH_INVALID_TYPE: 'GRAPH_INVALID_TYPE',
  GRAPH_INVALID_OBJECTIVE: 'GRAPH_INVALID_OBJECTIVE',
  GRAPH_INVALID_COORDINATE_SYSTEM: 'GRAPH_INVALID_COORDINATE_SYSTEM',
  GRAPH_INVALID_VISIBILITY: 'GRAPH_INVALID_VISIBILITY',
  GRAPH_INVALID_STATUS: 'GRAPH_INVALID_STATUS',
  GRAPH_INVALID_GOVERNANCE: 'GRAPH_INVALID_GOVERNANCE',
  GRAPH_MISSING_PROVENANCE: 'GRAPH_MISSING_PROVENANCE',
  GRAPH_MISSING_PROVIDER: 'GRAPH_MISSING_PROVIDER',
  GRAPH_MISSING_RATIONALE: 'GRAPH_MISSING_RATIONALE',
  GRAPH_MISSING_CONCEPT_REFERENCE: 'GRAPH_MISSING_CONCEPT_REFERENCE',
  GRAPH_MISSING_PROFILE_ID: 'GRAPH_MISSING_PROFILE_ID',
  GRAPH_MISSING_TITLE: 'GRAPH_MISSING_TITLE',
  GRAPH_SELF_RELATIONSHIP: 'GRAPH_SELF_RELATIONSHIP',
  GRAPH_EMPTY_REGISTRY: 'GRAPH_EMPTY_REGISTRY',
  GRAPH_INVALID_TRACE: 'GRAPH_INVALID_TRACE',
  GRAPH_REGISTRY_INCONSISTENCY: 'GRAPH_REGISTRY_INCONSISTENCY',
  GRAPH_INVALID_CONFIGURATION: 'GRAPH_INVALID_CONFIGURATION',
  GRAPH_INVALID_ORDER: 'GRAPH_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeGraphProfile(
  profile: KnowledgeGraphProfile,
): readonly KnowledgeGraphValidationError[] {
  const errors: KnowledgeGraphValidationError[] = [];

  if (!profile.graphId || profile.graphId.trim() === '') {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_MISSING_PROFILE_ID,
      message: 'Graph profile is missing a profile ID.',
      field: 'graphId',
      graphId: profile.graphId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_MISSING_TITLE,
      message: 'Graph profile is missing a title.',
      field: 'title',
      graphId: profile.graphId,
    });
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_MISSING_CONCEPT_REFERENCE,
      message: 'Graph profile is missing a concept reference.',
      field: 'conceptId',
      graphId: profile.graphId,
    });
  }

  if (!CANONICAL_GRAPH_TYPES.includes(profile.graphType)) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_TYPE,
      message: `Graph profile has unsupported type: "${profile.graphType}".`,
      field: 'graphType',
      graphId: profile.graphId,
    });
  }

  if (!CANONICAL_GRAPH_OBJECTIVES.includes(profile.objective)) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_OBJECTIVE,
      message: `Graph profile has unsupported objective: "${profile.objective}".`,
      field: 'objective',
      graphId: profile.graphId,
    });
  }

  if (!CANONICAL_COORDINATE_SYSTEMS.includes(profile.coordinateSystem)) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_COORDINATE_SYSTEM,
      message: `Graph profile has unsupported coordinate system: "${profile.coordinateSystem}".`,
      field: 'coordinateSystem',
      graphId: profile.graphId,
    });
  }

  if (!CANONICAL_GRAPH_VISIBILITY.includes(profile.visibility)) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_VISIBILITY,
      message: `Graph profile has unsupported visibility: "${profile.visibility}".`,
      field: 'visibility',
      graphId: profile.graphId,
    });
  }

  if (!CANONICAL_GRAPH_STATUS.includes(profile.status)) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_STATUS,
      message: `Graph profile has unsupported status: "${profile.status}".`,
      field: 'status',
      graphId: profile.graphId,
    });
  }

  if (!CANONICAL_GRAPH_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_GOVERNANCE,
      message: `Graph profile has unsupported governance: "${profile.governance}".`,
      field: 'governance',
      graphId: profile.graphId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_MISSING_PROVENANCE,
      message: 'Graph profile is missing provenance.',
      field: 'provenance',
      graphId: profile.graphId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: GRAPH_VALIDATION_CODES.GRAPH_MISSING_PROVIDER,
        message: 'Graph provenance is missing a provider.',
        field: 'provenance.provider',
        graphId: profile.graphId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: GRAPH_VALIDATION_CODES.GRAPH_MISSING_RATIONALE,
        message: 'Graph provenance is missing a rationale.',
        field: 'provenance.rationale',
        graphId: profile.graphId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeGraphRelationship(
  relationship: KnowledgeGraphRelationship,
  knownProfileIds: ReadonlySet<string>,
): readonly KnowledgeGraphValidationError[] {
  const errors: KnowledgeGraphValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_MISSING_PROFILE_ID,
      message: 'Graph relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceGraphId === relationship.targetGraphId) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_SELF_RELATIONSHIP,
      message: 'Graph relationship cannot reference itself.',
      field: 'targetGraphId',
      graphId: relationship.sourceGraphId,
    });
  }

  if (!knownProfileIds.has(relationship.sourceGraphId)) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_CONFIGURATION,
      message: `Graph relationship references unknown source profile: "${relationship.sourceGraphId}".`,
      field: 'sourceGraphId',
      graphId: relationship.sourceGraphId,
    });
  }

  if (!knownProfileIds.has(relationship.targetGraphId)) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_CONFIGURATION,
      message: `Graph relationship references unknown target profile: "${relationship.targetGraphId}".`,
      field: 'targetGraphId',
      graphId: relationship.targetGraphId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_MISSING_PROVENANCE,
      message: 'Graph relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Graph Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeGraphRegistry(
  registry: KnowledgeGraphRegistry,
): KnowledgeGraphRegistryValidationResult {
  const errors: KnowledgeGraphValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.graphId)) {
      errors.push({
        code: GRAPH_VALIDATION_CODES.GRAPH_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.graphId}".`,
        graphId: profile.graphId,
      });
    }
    seenIds.add(profile.graphId);
  }

  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: GRAPH_VALIDATION_CODES.GRAPH_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        graphId: profile.graphId,
      });
    }
    seenTitles.add(profile.title);
  }

  for (const profile of registry.profiles) {
    errors.push(...validateKnowledgeGraphProfile(profile));
  }

  const knownProfileIds = new Set(registry.profiles.map((p) => p.graphId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeGraphRelationship(relationship, knownProfileIds));
  }

  if (registry.metadata.graphCount !== registry.profiles.length) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_REGISTRY_INCONSISTENCY,
      message: `Registry metadata graph count (${registry.metadata.graphCount}) does not match actual profile count (${registry.profiles.length}).`,
      field: 'metadata.graphCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_graph_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Graph Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeGraphInput(
  input: KnowledgeGraphInput,
): KnowledgeGraphInputValidationResult {
  const errors: KnowledgeGraphValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateKnowledgeGraphProfile(profile));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_graph_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Graph Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeGraphTrace(
  trace: KnowledgeGraphTrace,
): KnowledgeGraphTraceValidationResult {
  const errors: KnowledgeGraphValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
      message: 'Graph trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
      message: 'Graph trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
      message: 'Graph trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
      message: 'Graph trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_graph_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Graphs Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithGraphs(
  artifact: KnowledgeArtifactWithGraphs,
): KnowledgeArtifactWithGraphsValidationResult {
  const errors: KnowledgeGraphValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Artifact has no graph profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateKnowledgeGraphProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: GRAPH_VALIDATION_CODES.GRAPH_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_graphs_composition',
  };
}
