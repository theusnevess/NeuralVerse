/**
 * D10-OPT-04 — Multimodal Representation, Visual References Kernel
 *
 * Deterministic orchestration functions for representation metadata.
 * Produces representation profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Generates images
 * - Generates diagrams
 * - Generates animations
 * - Renders visualizations
 * - Executes simulations
 * - Uses graphics libraries
 * - Generates SVG
 * - Generates HTML
 * - Uses canvas rendering
 * - Uses WebGL
 * - Performs multimodal inference
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Representation metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeRepresentationProfile,
  KnowledgeRepresentationProvenance,
  KnowledgeRepresentationDecision,
  KnowledgeRepresentationTrace,
  KnowledgeRepresentationRegistry,
  KnowledgeRepresentationRegistryMetadata,
  KnowledgeRepresentationInput,
  KnowledgeRepresentationRelationship,
  KnowledgeArtifactWithRepresentations,
  RepresentationType,
  VisualObjective,
  RepresentationComplexity,
  RepresentationVisibility,
  RepresentationStatus,
  RepresentationGovernance,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_REPRESENTATION_TYPES,
  CANONICAL_VISUAL_OBJECTIVES,
  CANONICAL_REPRESENTATION_COMPLEXITY,
  CANONICAL_REPRESENTATION_STATUS,
  CANONICAL_REPRESENTATION_VISIBILITY,
  CANONICAL_REPRESENTATION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Representation Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeRepresentationProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: RepresentationGovernance;
}): KnowledgeRepresentationProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Representation Decision Composition
// ---------------------------------------------------------------------------

function _composeRepresentationDecision(
  profileId: string,
  conceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeRepresentationDecision {
  return {
    decisionId: `_decision_${profileId}`,
    profileId,
    conceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Representation Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeRepresentationTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeRepresentationDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeRepresentationTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_representation_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Representation Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeRepresentationProfile(params: {
  readonly representationId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly representationType: RepresentationType;
  readonly visualObjective: VisualObjective;
  readonly complexity: RepresentationComplexity;
  readonly visibility: RepresentationVisibility;
  readonly status: RepresentationStatus;
  readonly governance: RepresentationGovernance;
  readonly tags: readonly string[];
  readonly resourceReferences: readonly string[];
  readonly orderIndex: number;
  readonly provenance: KnowledgeRepresentationProvenance;
}): KnowledgeRepresentationProfile {
  return {
    representationId: params.representationId,
    conceptId: params.conceptId,
    title: params.title,
    representationType: params.representationType,
    visualObjective: params.visualObjective,
    complexity: params.complexity,
    visibility: params.visibility,
    status: params.status,
    governance: params.governance,
    tags: [...params.tags],
    resourceReferences: [...params.resourceReferences],
    orderIndex: params.orderIndex,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Representation Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeRepresentationRelationship(params: {
  readonly relationshipId: string;
  readonly sourceRepresentationId: string;
  readonly targetRepresentationId: string;
  readonly conceptId: string;
  readonly relationshipType: 'prerequisite' | 'alternative' | 'complement' | 'dependency';
  readonly description: string;
  readonly provenance: KnowledgeRepresentationProvenance;
}): KnowledgeRepresentationRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceRepresentationId: params.sourceRepresentationId,
    targetRepresentationId: params.targetRepresentationId,
    conceptId: params.conceptId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeRepresentationProfile(
  a: KnowledgeRepresentationProfile,
  b: KnowledgeRepresentationProfile,
): number {
  if (a.conceptId < b.conceptId) return -1;
  if (a.conceptId > b.conceptId) return 1;

  if (a.orderIndex < b.orderIndex) return -1;
  if (a.orderIndex > b.orderIndex) return 1;

  if (a.representationType < b.representationType) return -1;
  if (a.representationType > b.representationType) return 1;

  if (a.representationId < b.representationId) return -1;
  if (a.representationId > b.representationId) return 1;

  return 0;
}

function _compareKnowledgeRepresentationRelationship(
  a: KnowledgeRepresentationRelationship,
  b: KnowledgeRepresentationRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Representation Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeRepresentationRegistry(
  profiles: readonly KnowledgeRepresentationProfile[],
  relationships: readonly KnowledgeRepresentationRelationship[],
): KnowledgeRepresentationRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeRepresentationProfile);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeRepresentationRelationship);

  const concepts = new Set(sortedProfiles.map((p) => p.conceptId));
  const representationTypes = new Set(sortedProfiles.map((p) => p.representationType));

  const metadata: KnowledgeRepresentationRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    representationCount: sortedProfiles.length,
    relationshipCount: sortedRelationships.length,
    conceptCount: concepts.size,
    representationTypeCount: representationTypes.size,
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
      generatedFrom: 'deterministic_representation_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_representation_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Representation Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeRepresentationRegistryFromInput(
  input: KnowledgeRepresentationInput,
): KnowledgeRepresentationRegistry {
  return composeKnowledgeRepresentationRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Representation Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeRepresentations(
  input: KnowledgeRepresentationInput,
): KnowledgeRepresentationRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateRepresentationForDecision(profile);
    return _composeRepresentationDecision(profile.representationId, profile.conceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeRepresentationRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeRepresentationTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateRepresentationForDecision(
  profile: KnowledgeRepresentationProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.representationId || profile.representationId.trim() === '') {
    errors.push('REPRESENTATION_MISSING_PROFILE_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('REPRESENTATION_MISSING_TITLE');
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push('REPRESENTATION_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_REPRESENTATION_TYPES.includes(profile.representationType)) {
    errors.push('REPRESENTATION_INVALID_TYPE');
  }

  if (!CANONICAL_VISUAL_OBJECTIVES.includes(profile.visualObjective)) {
    errors.push('REPRESENTATION_INVALID_OBJECTIVE');
  }

  if (!CANONICAL_REPRESENTATION_COMPLEXITY.includes(profile.complexity)) {
    errors.push('REPRESENTATION_INVALID_COMPLEXITY');
  }

  if (!CANONICAL_REPRESENTATION_VISIBILITY.includes(profile.visibility)) {
    errors.push('REPRESENTATION_INVALID_VISIBILITY');
  }

  if (!CANONICAL_REPRESENTATION_STATUS.includes(profile.status)) {
    errors.push('REPRESENTATION_INVALID_STATUS');
  }

  if (!CANONICAL_REPRESENTATION_GOVERNANCE.includes(profile.governance)) {
    errors.push('REPRESENTATION_INVALID_GOVERNANCE');
  }

  if (!profile.provenance) {
    errors.push('REPRESENTATION_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Representations Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithRepresentations(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeRepresentationProfile[];
  readonly relationships: readonly KnowledgeRepresentationRelationship[];
  readonly provenance: KnowledgeRepresentationProvenance;
}): KnowledgeArtifactWithRepresentations {
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

export function isSupportedRepresentationType(
  value: string,
): value is RepresentationType {
  return CANONICAL_REPRESENTATION_TYPES.includes(value as RepresentationType);
}

export function isSupportedVisualObjective(
  value: string,
): value is VisualObjective {
  return CANONICAL_VISUAL_OBJECTIVES.includes(value as VisualObjective);
}

export function isSupportedRepresentationComplexity(
  value: string,
): value is RepresentationComplexity {
  return CANONICAL_REPRESENTATION_COMPLEXITY.includes(value as RepresentationComplexity);
}

export function isSupportedRepresentationVisibility(
  value: string,
): value is RepresentationVisibility {
  return CANONICAL_REPRESENTATION_VISIBILITY.includes(value as RepresentationVisibility);
}

export function isSupportedRepresentationStatus(
  value: string,
): value is RepresentationStatus {
  return CANONICAL_REPRESENTATION_STATUS.includes(value as RepresentationStatus);
}

export function isSupportedRepresentationGovernance(
  value: string,
): value is RepresentationGovernance {
  return CANONICAL_REPRESENTATION_GOVERNANCE.includes(value as RepresentationGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalRepresentationTypes(): readonly RepresentationType[] {
  return CANONICAL_REPRESENTATION_TYPES;
}

export function getCanonicalVisualObjectives(): readonly VisualObjective[] {
  return CANONICAL_VISUAL_OBJECTIVES;
}

export function getCanonicalRepresentationComplexities(): readonly RepresentationComplexity[] {
  return CANONICAL_REPRESENTATION_COMPLEXITY;
}

export function getCanonicalRepresentationVisibility(): readonly RepresentationVisibility[] {
  return CANONICAL_REPRESENTATION_VISIBILITY;
}

export function getCanonicalRepresentationStatuses(): readonly RepresentationStatus[] {
  return CANONICAL_REPRESENTATION_STATUS;
}
