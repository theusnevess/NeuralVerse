/**
 * D10-OPT-08 — Visualization Metadata Kernel
 *
 * Deterministic orchestration functions for visualization metadata.
 * Produces visualization profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Generates diagrams
 * - Generates SVG
 * - Renders Canvas
 * - Uses WebGL
 * - Renders images
 * - Generates HTML
 * - Generates CSS
 * - Uses visualization engines
 * - Uses layout engines
 * - Performs automatic layout
 * - Performs graph layout
 * - Generates Mermaid
 * - Generates PlantUML
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Visualization metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeVisualizationProfile,
  KnowledgeVisualizationProvenance,
  KnowledgeVisualizationDecision,
  KnowledgeVisualizationTrace,
  KnowledgeVisualizationRegistry,
  KnowledgeVisualizationRegistryMetadata,
  KnowledgeVisualizationInput,
  KnowledgeVisualizationRelationship,
  KnowledgeArtifactWithVisualizations,
  VisualizationType,
  VisualizationObjective,
  VisualizationComplexity,
  VisualizationVisibility,
  VisualizationStatus,
  VisualizationGovernance,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_VISUALIZATION_TYPES,
  CANONICAL_VISUALIZATION_OBJECTIVES,
  CANONICAL_VISUALIZATION_COMPLEXITY,
  CANONICAL_VISUALIZATION_STATUS,
  CANONICAL_VISUALIZATION_VISIBILITY,
  CANONICAL_VISUALIZATION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Visualization Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeVisualizationProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: VisualizationGovernance;
}): KnowledgeVisualizationProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Visualization Decision Composition
// ---------------------------------------------------------------------------

function _composeVisualizationDecision(
  visualizationId: string,
  conceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeVisualizationDecision {
  return {
    decisionId: `_decision_${visualizationId}`,
    visualizationId,
    conceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Visualization Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeVisualizationTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeVisualizationDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeVisualizationTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_visualization_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Visualization Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeVisualizationProfile(params: {
  readonly visualizationId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly visualizationType: VisualizationType;
  readonly objective: VisualizationObjective;
  readonly complexity: VisualizationComplexity;
  readonly visibility: VisualizationVisibility;
  readonly status: VisualizationStatus;
  readonly governance: VisualizationGovernance;
  readonly orderIndex: number;
  readonly tags: readonly string[];
  readonly resourceReferences: readonly string[];
  readonly provenance: KnowledgeVisualizationProvenance;
}): KnowledgeVisualizationProfile {
  return {
    visualizationId: params.visualizationId,
    conceptId: params.conceptId,
    title: params.title,
    visualizationType: params.visualizationType,
    objective: params.objective,
    complexity: params.complexity,
    visibility: params.visibility,
    status: params.status,
    governance: params.governance,
    orderIndex: params.orderIndex,
    tags: [...params.tags],
    resourceReferences: [...params.resourceReferences],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Visualization Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeVisualizationRelationship(params: {
  readonly relationshipId: string;
  readonly sourceVisualizationId: string;
  readonly targetVisualizationId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeVisualizationProvenance;
}): KnowledgeVisualizationRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceVisualizationId: params.sourceVisualizationId,
    targetVisualizationId: params.targetVisualizationId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeVisualizationProfile(
  a: KnowledgeVisualizationProfile,
  b: KnowledgeVisualizationProfile,
): number {
  if (a.conceptId < b.conceptId) return -1;
  if (a.conceptId > b.conceptId) return 1;

  if (a.visualizationType < b.visualizationType) return -1;
  if (a.visualizationType > b.visualizationType) return 1;

  if (a.orderIndex < b.orderIndex) return -1;
  if (a.orderIndex > b.orderIndex) return 1;

  if (a.visualizationId < b.visualizationId) return -1;
  if (a.visualizationId > b.visualizationId) return 1;

  return 0;
}

function _compareKnowledgeVisualizationRelationship(
  a: KnowledgeVisualizationRelationship,
  b: KnowledgeVisualizationRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Visualization Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeVisualizationRegistry(
  profiles: readonly KnowledgeVisualizationProfile[],
  relationships: readonly KnowledgeVisualizationRelationship[],
): KnowledgeVisualizationRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeVisualizationProfile);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeVisualizationRelationship);

  const concepts = new Set(sortedProfiles.map((p) => p.conceptId));
  const types = new Set(sortedProfiles.map((p) => p.visualizationType));

  const metadata: KnowledgeVisualizationRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    visualizationCount: sortedProfiles.length,
    relationshipCount: sortedRelationships.length,
    conceptCount: concepts.size,
    visualizationTypeCount: types.size,
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
      generatedFrom: 'deterministic_visualization_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_visualization_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Visualization Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeVisualizationRegistryFromInput(
  input: KnowledgeVisualizationInput,
): KnowledgeVisualizationRegistry {
  return composeKnowledgeVisualizationRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Visualization Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeVisualizations(
  input: KnowledgeVisualizationInput,
): KnowledgeVisualizationRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateVisualizationForDecision(profile);
    return _composeVisualizationDecision(profile.visualizationId, profile.conceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeVisualizationRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeVisualizationTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateVisualizationForDecision(
  profile: KnowledgeVisualizationProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.visualizationId || profile.visualizationId.trim() === '') {
    errors.push('VISUALIZATION_MISSING_PROFILE_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('VISUALIZATION_MISSING_TITLE');
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push('VISUALIZATION_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_VISUALIZATION_TYPES.includes(profile.visualizationType)) {
    errors.push('VISUALIZATION_INVALID_TYPE');
  }

  if (!CANONICAL_VISUALIZATION_OBJECTIVES.includes(profile.objective)) {
    errors.push('VISUALIZATION_INVALID_OBJECTIVE');
  }

  if (!CANONICAL_VISUALIZATION_COMPLEXITY.includes(profile.complexity)) {
    errors.push('VISUALIZATION_INVALID_COMPLEXITY');
  }

  if (!CANONICAL_VISUALIZATION_VISIBILITY.includes(profile.visibility)) {
    errors.push('VISUALIZATION_INVALID_VISIBILITY');
  }

  if (!CANONICAL_VISUALIZATION_STATUS.includes(profile.status)) {
    errors.push('VISUALIZATION_INVALID_STATUS');
  }

  if (!CANONICAL_VISUALIZATION_GOVERNANCE.includes(profile.governance)) {
    errors.push('VISUALIZATION_INVALID_GOVERNANCE');
  }

  if (!profile.provenance) {
    errors.push('VISUALIZATION_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Visualizations Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithVisualizations(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeVisualizationProfile[];
  readonly relationships: readonly KnowledgeVisualizationRelationship[];
  readonly provenance: KnowledgeVisualizationProvenance;
}): KnowledgeArtifactWithVisualizations {
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

export function isSupportedVisualizationType(
  value: string,
): value is VisualizationType {
  return CANONICAL_VISUALIZATION_TYPES.includes(value as VisualizationType);
}

export function isSupportedVisualizationObjective(
  value: string,
): value is VisualizationObjective {
  return CANONICAL_VISUALIZATION_OBJECTIVES.includes(value as VisualizationObjective);
}

export function isSupportedVisualizationComplexity(
  value: string,
): value is VisualizationComplexity {
  return CANONICAL_VISUALIZATION_COMPLEXITY.includes(value as VisualizationComplexity);
}

export function isSupportedVisualizationVisibility(
  value: string,
): value is VisualizationVisibility {
  return CANONICAL_VISUALIZATION_VISIBILITY.includes(value as VisualizationVisibility);
}

export function isSupportedVisualizationStatus(
  value: string,
): value is VisualizationStatus {
  return CANONICAL_VISUALIZATION_STATUS.includes(value as VisualizationStatus);
}

export function isSupportedVisualizationGovernance(
  value: string,
): value is VisualizationGovernance {
  return CANONICAL_VISUALIZATION_GOVERNANCE.includes(value as VisualizationGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalVisualizationTypes(): readonly VisualizationType[] {
  return CANONICAL_VISUALIZATION_TYPES;
}

export function getCanonicalVisualizationObjectives(): readonly VisualizationObjective[] {
  return CANONICAL_VISUALIZATION_OBJECTIVES;
}

export function getCanonicalVisualizationComplexities(): readonly VisualizationComplexity[] {
  return CANONICAL_VISUALIZATION_COMPLEXITY;
}

export function getCanonicalVisualizationVisibility(): readonly VisualizationVisibility[] {
  return CANONICAL_VISUALIZATION_VISIBILITY;
}

export function getCanonicalVisualizationStatuses(): readonly VisualizationStatus[] {
  return CANONICAL_VISUALIZATION_STATUS;
}
