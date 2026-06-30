/**
 * D10-OPT-06 — Comparative Knowledge Modeling Kernel
 *
 * Deterministic orchestration functions for comparison metadata.
 * Produces comparison profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Generates comparisons
 * - Makes decision recommendations
 * - Ranks items
 * - Performs automatic evaluation
 * - Invokes LLMs
 * - Performs semantic reasoning
 * - Performs automatic benchmarking
 * - Accesses filesystem
 * - Performs network requests
 *
 * Comparison metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeComparisonProfile,
  KnowledgeComparisonProvenance,
  KnowledgeComparisonDecision,
  KnowledgeComparisonTrace,
  KnowledgeComparisonRegistry,
  KnowledgeComparisonRegistryMetadata,
  KnowledgeComparisonInput,
  KnowledgeComparisonRelationship,
  KnowledgeArtifactWithComparisons,
  ComparisonType,
  ComparisonObjective,
  ComparisonDimension,
  ComparisonVisibility,
  ComparisonStatus,
  ComparisonGovernance,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_COMPARISON_TYPES,
  CANONICAL_COMPARISON_OBJECTIVES,
  CANONICAL_COMPARISON_DIMENSIONS,
  CANONICAL_COMPARISON_STATUS,
  CANONICAL_COMPARISON_VISIBILITY,
  CANONICAL_COMPARISON_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Comparison Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeComparisonProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ComparisonGovernance;
}): KnowledgeComparisonProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Comparison Decision Composition
// ---------------------------------------------------------------------------

function _composeComparisonDecision(
  comparisonId: string,
  primaryConceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeComparisonDecision {
  return {
    decisionId: `_decision_${comparisonId}`,
    comparisonId,
    primaryConceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Comparison Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeComparisonTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeComparisonDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeComparisonTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_comparison_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Comparison Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeComparisonProfile(params: {
  readonly comparisonId: string;
  readonly title: string;
  readonly comparisonType: ComparisonType;
  readonly objective: ComparisonObjective;
  readonly primaryConceptId: string;
  readonly secondaryConceptId: string;
  readonly dimensions: readonly ComparisonDimension[];
  readonly visibility: ComparisonVisibility;
  readonly status: ComparisonStatus;
  readonly governance: ComparisonGovernance;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeComparisonProvenance;
}): KnowledgeComparisonProfile {
  return {
    comparisonId: params.comparisonId,
    title: params.title,
    comparisonType: params.comparisonType,
    objective: params.objective,
    primaryConceptId: params.primaryConceptId,
    secondaryConceptId: params.secondaryConceptId,
    dimensions: [...params.dimensions],
    visibility: params.visibility,
    status: params.status,
    governance: params.governance,
    tags: [...params.tags],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Comparison Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeComparisonRelationship(params: {
  readonly relationshipId: string;
  readonly sourceComparisonId: string;
  readonly targetComparisonId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeComparisonProvenance;
}): KnowledgeComparisonRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceComparisonId: params.sourceComparisonId,
    targetComparisonId: params.targetComparisonId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeComparisonProfile(
  a: KnowledgeComparisonProfile,
  b: KnowledgeComparisonProfile,
): number {
  if (a.primaryConceptId < b.primaryConceptId) return -1;
  if (a.primaryConceptId > b.primaryConceptId) return 1;

  if (a.secondaryConceptId < b.secondaryConceptId) return -1;
  if (a.secondaryConceptId > b.secondaryConceptId) return 1;

  if (a.comparisonType < b.comparisonType) return -1;
  if (a.comparisonType > b.comparisonType) return 1;

  if (a.comparisonId < b.comparisonId) return -1;
  if (a.comparisonId > b.comparisonId) return 1;

  return 0;
}

function _compareKnowledgeComparisonRelationship(
  a: KnowledgeComparisonRelationship,
  b: KnowledgeComparisonRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Comparison Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeComparisonRegistry(
  profiles: readonly KnowledgeComparisonProfile[],
  relationships: readonly KnowledgeComparisonRelationship[],
): KnowledgeComparisonRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeComparisonProfile);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeComparisonRelationship);

  const concepts = new Set<string>();
  for (const p of sortedProfiles) {
    concepts.add(p.primaryConceptId);
    concepts.add(p.secondaryConceptId);
  }
  const types = new Set(sortedProfiles.map((p) => p.comparisonType));

  const metadata: KnowledgeComparisonRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    comparisonCount: sortedProfiles.length,
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
      generatedFrom: 'deterministic_comparison_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_comparison_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Comparison Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeComparisonRegistryFromInput(
  input: KnowledgeComparisonInput,
): KnowledgeComparisonRegistry {
  return composeKnowledgeComparisonRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Comparison Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeComparisons(
  input: KnowledgeComparisonInput,
): KnowledgeComparisonRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateComparisonForDecision(profile);
    return _composeComparisonDecision(profile.comparisonId, profile.primaryConceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeComparisonRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeComparisonTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateComparisonForDecision(
  profile: KnowledgeComparisonProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.comparisonId || profile.comparisonId.trim() === '') {
    errors.push('COMPARISON_MISSING_PROFILE_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('COMPARISON_MISSING_TITLE');
  }

  if (!profile.primaryConceptId || profile.primaryConceptId.trim() === '') {
    errors.push('COMPARISON_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_COMPARISON_TYPES.includes(profile.comparisonType)) {
    errors.push('COMPARISON_INVALID_TYPE');
  }

  if (!CANONICAL_COMPARISON_OBJECTIVES.includes(profile.objective)) {
    errors.push('COMPARISON_INVALID_OBJECTIVE');
  }

  for (const dim of profile.dimensions) {
    if (!CANONICAL_COMPARISON_DIMENSIONS.includes(dim)) {
      errors.push('COMPARISON_INVALID_DIMENSION');
      break;
    }
  }

  if (!CANONICAL_COMPARISON_VISIBILITY.includes(profile.visibility)) {
    errors.push('COMPARISON_INVALID_VISIBILITY');
  }

  if (!CANONICAL_COMPARISON_STATUS.includes(profile.status)) {
    errors.push('COMPARISON_INVALID_STATUS');
  }

  if (!CANONICAL_COMPARISON_GOVERNANCE.includes(profile.governance)) {
    errors.push('COMPARISON_INVALID_GOVERNANCE');
  }

  if (!profile.provenance) {
    errors.push('COMPARISON_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Comparisons Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithComparisons(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeComparisonProfile[];
  readonly relationships: readonly KnowledgeComparisonRelationship[];
  readonly provenance: KnowledgeComparisonProvenance;
}): KnowledgeArtifactWithComparisons {
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

export function isSupportedComparisonType(
  value: string,
): value is ComparisonType {
  return CANONICAL_COMPARISON_TYPES.includes(value as ComparisonType);
}

export function isSupportedComparisonObjective(
  value: string,
): value is ComparisonObjective {
  return CANONICAL_COMPARISON_OBJECTIVES.includes(value as ComparisonObjective);
}

export function isSupportedComparisonDimension(
  value: string,
): value is ComparisonDimension {
  return CANONICAL_COMPARISON_DIMENSIONS.includes(value as ComparisonDimension);
}

export function isSupportedComparisonVisibility(
  value: string,
): value is ComparisonVisibility {
  return CANONICAL_COMPARISON_VISIBILITY.includes(value as ComparisonVisibility);
}

export function isSupportedComparisonStatus(
  value: string,
): value is ComparisonStatus {
  return CANONICAL_COMPARISON_STATUS.includes(value as ComparisonStatus);
}

export function isSupportedComparisonGovernance(
  value: string,
): value is ComparisonGovernance {
  return CANONICAL_COMPARISON_GOVERNANCE.includes(value as ComparisonGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalComparisonTypes(): readonly ComparisonType[] {
  return CANONICAL_COMPARISON_TYPES;
}

export function getCanonicalComparisonObjectives(): readonly ComparisonObjective[] {
  return CANONICAL_COMPARISON_OBJECTIVES;
}

export function getCanonicalComparisonDimensions(): readonly ComparisonDimension[] {
  return CANONICAL_COMPARISON_DIMENSIONS;
}

export function getCanonicalComparisonVisibility(): readonly ComparisonVisibility[] {
  return CANONICAL_COMPARISON_VISIBILITY;
}

export function getCanonicalComparisonStatuses(): readonly ComparisonStatus[] {
  return CANONICAL_COMPARISON_STATUS;
}
