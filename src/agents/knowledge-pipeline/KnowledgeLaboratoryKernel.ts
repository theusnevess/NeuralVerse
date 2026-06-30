/**
 * D10-OPT-09 — Laboratory Metadata Kernel
 *
 * Deterministic orchestration functions for laboratory metadata.
 * Produces laboratory profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Executes laboratories
 * - Executes simulations
 * - Executes experiments
 * - Executes Python
 * - Executes Jupyter
 * - Executes notebooks
 * - Executes code
 * - Generates exercises
 * - Grades
 * - Performs runtime orchestration
 * - Uses workflow engines
 * - Uses Docker
 * - Uses VMs
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Laboratory metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeLaboratoryProfile,
  KnowledgeLaboratoryProvenance,
  KnowledgeLaboratoryDecision,
  KnowledgeLaboratoryTrace,
  KnowledgeLaboratoryRegistry,
  KnowledgeLaboratoryRegistryMetadata,
  KnowledgeLaboratoryInput,
  KnowledgeLaboratoryRelationship,
  KnowledgeArtifactWithLaboratories,
  LaboratoryType,
  LaboratoryObjective,
  LaboratoryComplexity,
  LaboratoryVisibility,
  LaboratoryStatus,
  LaboratoryGovernance,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_LABORATORY_TYPES,
  CANONICAL_LABORATORY_OBJECTIVES,
  CANONICAL_LABORATORY_COMPLEXITY,
  CANONICAL_LABORATORY_STATUS,
  CANONICAL_LABORATORY_VISIBILITY,
  CANONICAL_LABORATORY_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Laboratory Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeLaboratoryProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: LaboratoryGovernance;
}): KnowledgeLaboratoryProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Decision Composition
// ---------------------------------------------------------------------------

function _composeLaboratoryDecision(
  laboratoryId: string,
  conceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeLaboratoryDecision {
  return {
    decisionId: `_decision_${laboratoryId}`,
    laboratoryId,
    conceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeLaboratoryTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeLaboratoryDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeLaboratoryTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeLaboratoryProfile(params: {
  readonly laboratoryId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly laboratoryType: LaboratoryType;
  readonly objective: LaboratoryObjective;
  readonly complexity: LaboratoryComplexity;
  readonly visibility: LaboratoryVisibility;
  readonly status: LaboratoryStatus;
  readonly governance: LaboratoryGovernance;
  readonly orderIndex: number;
  readonly tags: readonly string[];
  readonly resourceReferences: readonly string[];
  readonly provenance: KnowledgeLaboratoryProvenance;
}): KnowledgeLaboratoryProfile {
  return {
    laboratoryId: params.laboratoryId,
    conceptId: params.conceptId,
    title: params.title,
    laboratoryType: params.laboratoryType,
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
// Laboratory Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeLaboratoryRelationship(params: {
  readonly relationshipId: string;
  readonly sourceLaboratoryId: string;
  readonly targetLaboratoryId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeLaboratoryProvenance;
}): KnowledgeLaboratoryRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceLaboratoryId: params.sourceLaboratoryId,
    targetLaboratoryId: params.targetLaboratoryId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeLaboratoryProfile(
  a: KnowledgeLaboratoryProfile,
  b: KnowledgeLaboratoryProfile,
): number {
  if (a.conceptId < b.conceptId) return -1;
  if (a.conceptId > b.conceptId) return 1;

  if (a.laboratoryType < b.laboratoryType) return -1;
  if (a.laboratoryType > b.laboratoryType) return 1;

  if (a.orderIndex < b.orderIndex) return -1;
  if (a.orderIndex > b.orderIndex) return 1;

  if (a.laboratoryId < b.laboratoryId) return -1;
  if (a.laboratoryId > b.laboratoryId) return 1;

  return 0;
}

function _compareKnowledgeLaboratoryRelationship(
  a: KnowledgeLaboratoryRelationship,
  b: KnowledgeLaboratoryRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Laboratory Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeLaboratoryRegistry(
  profiles: readonly KnowledgeLaboratoryProfile[],
  relationships: readonly KnowledgeLaboratoryRelationship[],
): KnowledgeLaboratoryRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeLaboratoryProfile);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeLaboratoryRelationship);

  const concepts = new Set(sortedProfiles.map((p) => p.conceptId));
  const types = new Set(sortedProfiles.map((p) => p.laboratoryType));

  const metadata: KnowledgeLaboratoryRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    laboratoryCount: sortedProfiles.length,
    relationshipCount: sortedRelationships.length,
    conceptCount: concepts.size,
    laboratoryTypeCount: types.size,
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
      generatedFrom: 'deterministic_laboratory_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeLaboratoryRegistryFromInput(
  input: KnowledgeLaboratoryInput,
): KnowledgeLaboratoryRegistry {
  return composeKnowledgeLaboratoryRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Laboratory Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeLaboratories(
  input: KnowledgeLaboratoryInput,
): KnowledgeLaboratoryRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateLaboratoryForDecision(profile);
    return _composeLaboratoryDecision(profile.laboratoryId, profile.conceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeLaboratoryRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeLaboratoryTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateLaboratoryForDecision(
  profile: KnowledgeLaboratoryProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.laboratoryId || profile.laboratoryId.trim() === '') {
    errors.push('LABORATORY_MISSING_PROFILE_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('LABORATORY_MISSING_TITLE');
  }

  if (!profile.conceptId || profile.conceptId.trim() === '') {
    errors.push('LABORATORY_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_LABORATORY_TYPES.includes(profile.laboratoryType)) {
    errors.push('LABORATORY_INVALID_TYPE');
  }

  if (!CANONICAL_LABORATORY_OBJECTIVES.includes(profile.objective)) {
    errors.push('LABORATORY_INVALID_OBJECTIVE');
  }

  if (!CANONICAL_LABORATORY_COMPLEXITY.includes(profile.complexity)) {
    errors.push('LABORATORY_INVALID_COMPLEXITY');
  }

  if (!CANONICAL_LABORATORY_VISIBILITY.includes(profile.visibility)) {
    errors.push('LABORATORY_INVALID_VISIBILITY');
  }

  if (!CANONICAL_LABORATORY_STATUS.includes(profile.status)) {
    errors.push('LABORATORY_INVALID_STATUS');
  }

  if (!CANONICAL_LABORATORY_GOVERNANCE.includes(profile.governance)) {
    errors.push('LABORATORY_INVALID_GOVERNANCE');
  }

  if (!profile.provenance) {
    errors.push('LABORATORY_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Laboratories Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithLaboratories(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeLaboratoryProfile[];
  readonly relationships: readonly KnowledgeLaboratoryRelationship[];
  readonly provenance: KnowledgeLaboratoryProvenance;
}): KnowledgeArtifactWithLaboratories {
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

export function isSupportedLaboratoryType(
  value: string,
): value is LaboratoryType {
  return CANONICAL_LABORATORY_TYPES.includes(value as LaboratoryType);
}

export function isSupportedLaboratoryObjective(
  value: string,
): value is LaboratoryObjective {
  return CANONICAL_LABORATORY_OBJECTIVES.includes(value as LaboratoryObjective);
}

export function isSupportedLaboratoryComplexity(
  value: string,
): value is LaboratoryComplexity {
  return CANONICAL_LABORATORY_COMPLEXITY.includes(value as LaboratoryComplexity);
}

export function isSupportedLaboratoryVisibility(
  value: string,
): value is LaboratoryVisibility {
  return CANONICAL_LABORATORY_VISIBILITY.includes(value as LaboratoryVisibility);
}

export function isSupportedLaboratoryStatus(
  value: string,
): value is LaboratoryStatus {
  return CANONICAL_LABORATORY_STATUS.includes(value as LaboratoryStatus);
}

export function isSupportedLaboratoryGovernance(
  value: string,
): value is LaboratoryGovernance {
  return CANONICAL_LABORATORY_GOVERNANCE.includes(value as LaboratoryGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalLaboratoryTypes(): readonly LaboratoryType[] {
  return CANONICAL_LABORATORY_TYPES;
}

export function getCanonicalLaboratoryObjectives(): readonly LaboratoryObjective[] {
  return CANONICAL_LABORATORY_OBJECTIVES;
}

export function getCanonicalLaboratoryComplexities(): readonly LaboratoryComplexity[] {
  return CANONICAL_LABORATORY_COMPLEXITY;
}

export function getCanonicalLaboratoryVisibility(): readonly LaboratoryVisibility[] {
  return CANONICAL_LABORATORY_VISIBILITY;
}

export function getCanonicalLaboratoryStatuses(): readonly LaboratoryStatus[] {
  return CANONICAL_LABORATORY_STATUS;
}
