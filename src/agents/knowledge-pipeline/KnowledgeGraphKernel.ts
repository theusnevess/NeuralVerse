/**
 * D10-OPT-07 — Mathematical Graph Modeling Kernel
 *
 * Deterministic orchestration functions for mathematical graph metadata.
 * Produces graph profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Generates graphs
 * - Generates plots
 * - Generates SVG
 * - Renders canvas
 * - Uses WebGL
 * - Computes coordinates
 * - Performs symbolic mathematics
 * - Integrates with CAS
 * - Renders graphs
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Mathematical graph metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeGraphProfile,
  KnowledgeGraphProvenance,
  KnowledgeGraphDecision,
  KnowledgeGraphTrace,
  KnowledgeGraphRegistry,
  KnowledgeGraphRegistryMetadata,
  KnowledgeGraphInput,
  KnowledgeGraphRelationship,
  KnowledgeArtifactWithGraphs,
  MathGraphType,
  MathGraphObjective,
  CoordinateSystem,
  MathGraphVisibility,
  MathGraphStatus,
  MathGraphGovernance,
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
// Graph Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeGraphProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: MathGraphGovernance;
}): KnowledgeGraphProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Graph Decision Composition
// ---------------------------------------------------------------------------

function _composeGraphDecision(
  graphId: string,
  conceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeGraphDecision {
  return {
    decisionId: `_decision_${graphId}`,
    graphId,
    conceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Graph Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeGraphTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeGraphDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeGraphTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_math_graph_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Graph Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeGraphProfile(params: {
  readonly graphId: string;
  readonly title: string;
  readonly conceptId: string;
  readonly graphType: MathGraphType;
  readonly objective: MathGraphObjective;
  readonly coordinateSystem: CoordinateSystem;
  readonly mathematicalExpressionRef: string;
  readonly domainReference: string;
  readonly rangeReference: string;
  readonly visualizationParameters: readonly string[];
  readonly visibility: MathGraphVisibility;
  readonly status: MathGraphStatus;
  readonly governance: MathGraphGovernance;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeGraphProvenance;
}): KnowledgeGraphProfile {
  return {
    graphId: params.graphId,
    title: params.title,
    conceptId: params.conceptId,
    graphType: params.graphType,
    objective: params.objective,
    coordinateSystem: params.coordinateSystem,
    mathematicalExpressionRef: params.mathematicalExpressionRef,
    domainReference: params.domainReference,
    rangeReference: params.rangeReference,
    visualizationParameters: [...params.visualizationParameters],
    visibility: params.visibility,
    status: params.status,
    governance: params.governance,
    tags: [...params.tags],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Graph Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeGraphRelationship(params: {
  readonly relationshipId: string;
  readonly sourceGraphId: string;
  readonly targetGraphId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeGraphProvenance;
}): KnowledgeGraphRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceGraphId: params.sourceGraphId,
    targetGraphId: params.targetGraphId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeGraphProfile(
  a: KnowledgeGraphProfile,
  b: KnowledgeGraphProfile,
): number {
  if (a.conceptId < b.conceptId) return -1;
  if (a.conceptId > b.conceptId) return 1;

  if (a.graphType < b.graphType) return -1;
  if (a.graphType > b.graphType) return 1;

  if (a.coordinateSystem < b.coordinateSystem) return -1;
  if (a.coordinateSystem > b.coordinateSystem) return 1;

  if (a.graphId < b.graphId) return -1;
  if (a.graphId > b.graphId) return 1;

  return 0;
}

function _compareKnowledgeGraphRelationship(
  a: KnowledgeGraphRelationship,
  b: KnowledgeGraphRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Graph Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeGraphRegistry(
  profiles: readonly KnowledgeGraphProfile[],
  relationships: readonly KnowledgeGraphRelationship[],
): KnowledgeGraphRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeGraphProfile);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeGraphRelationship);

  const concepts = new Set(sortedProfiles.map((p) => p.conceptId));
  const types = new Set(sortedProfiles.map((p) => p.graphType));

  const metadata: KnowledgeGraphRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    graphCount: sortedProfiles.length,
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
      generatedFrom: 'deterministic_math_graph_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_math_graph_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Graph Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeGraphRegistryFromInput(
  input: KnowledgeGraphInput,
): KnowledgeGraphRegistry {
  return composeKnowledgeGraphRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Graph Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeGraphs(
  input: KnowledgeGraphInput,
): KnowledgeGraphRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateGraphForDecision(profile);
    return _composeGraphDecision(profile.graphId, profile.conceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeGraphRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeGraphTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateGraphForDecision(
  profile: KnowledgeGraphProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.graphId || profile.graphId.trim() === '') {
    errors.push('GRAPH_MISSING_PROFILE_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('GRAPH_MISSING_TITLE');
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push('GRAPH_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_GRAPH_TYPES.includes(profile.graphType)) {
    errors.push('GRAPH_INVALID_TYPE');
  }

  if (!CANONICAL_GRAPH_OBJECTIVES.includes(profile.objective)) {
    errors.push('GRAPH_INVALID_OBJECTIVE');
  }

  if (!CANONICAL_COORDINATE_SYSTEMS.includes(profile.coordinateSystem)) {
    errors.push('GRAPH_INVALID_COORDINATE_SYSTEM');
  }

  if (!CANONICAL_GRAPH_VISIBILITY.includes(profile.visibility)) {
    errors.push('GRAPH_INVALID_VISIBILITY');
  }

  if (!CANONICAL_GRAPH_STATUS.includes(profile.status)) {
    errors.push('GRAPH_INVALID_STATUS');
  }

  if (!CANONICAL_GRAPH_GOVERNANCE.includes(profile.governance)) {
    errors.push('GRAPH_INVALID_GOVERNANCE');
  }

  if (!profile.provenance) {
    errors.push('GRAPH_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Graphs Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithGraphs(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeGraphProfile[];
  readonly relationships: readonly KnowledgeGraphRelationship[];
  readonly provenance: KnowledgeGraphProvenance;
}): KnowledgeArtifactWithGraphs {
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

export function isSupportedGraphType(
  value: string,
): value is MathGraphType {
  return CANONICAL_GRAPH_TYPES.includes(value as MathGraphType);
}

export function isSupportedGraphObjective(
  value: string,
): value is MathGraphObjective {
  return CANONICAL_GRAPH_OBJECTIVES.includes(value as MathGraphObjective);
}

export function isSupportedCoordinateSystem(
  value: string,
): value is CoordinateSystem {
  return CANONICAL_COORDINATE_SYSTEMS.includes(value as CoordinateSystem);
}

export function isSupportedGraphVisibility(
  value: string,
): value is MathGraphVisibility {
  return CANONICAL_GRAPH_VISIBILITY.includes(value as MathGraphVisibility);
}

export function isSupportedGraphStatus(
  value: string,
): value is MathGraphStatus {
  return CANONICAL_GRAPH_STATUS.includes(value as MathGraphStatus);
}

export function isSupportedGraphGovernance(
  value: string,
): value is MathGraphGovernance {
  return CANONICAL_GRAPH_GOVERNANCE.includes(value as MathGraphGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalGraphTypes(): readonly MathGraphType[] {
  return CANONICAL_GRAPH_TYPES;
}

export function getCanonicalGraphObjectives(): readonly MathGraphObjective[] {
  return CANONICAL_GRAPH_OBJECTIVES;
}

export function getCanonicalCoordinateSystems(): readonly CoordinateSystem[] {
  return CANONICAL_COORDINATE_SYSTEMS;
}

export function getCanonicalGraphVisibility(): readonly MathGraphVisibility[] {
  return CANONICAL_GRAPH_VISIBILITY;
}

export function getCanonicalGraphStatuses(): readonly MathGraphStatus[] {
  return CANONICAL_GRAPH_STATUS;
}
