/**
 * D10-OPT-14 — Semantic Connectivity Kernel
 *
 * Deterministic orchestration functions for semantic connectivity metadata.
 * Produces connectivity profiles, relationships, traces, and registries.
 *
 * This module never:
 * - Infers relationships
 * - Performs graph traversal
 * - Executes semantic search
 * - Computes embeddings
 * - Performs ontology reasoning
 * - Interacts with Retrieval Agent
 * - Generates recommendations
 * - Finds paths
 * - Computes transitive closure
 * - Performs reasoning
 * - Invokes LLMs
 * - Accesses filesystem
 * - Performs network requests
 *
 * Semantic connectivity metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeConnectivityProfile,
  KnowledgeConnectivityProvenance,
  KnowledgeConnectivityDecision,
  KnowledgeConnectivityTrace,
  KnowledgeConnectivityRegistry,
  KnowledgeConnectivityRegistryMetadata,
  KnowledgeConnectivityInput,
  KnowledgeConnectivityRelationship,
  KnowledgeArtifactWithConnectivity,
  ConnectivityType,
  ConnectivityStrength,
  ConnectivityScope,
  ConnectivityVisibility,
  ConnectivityStatus,
  ConnectivityGovernance,
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
// Connectivity Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeConnectivityProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ConnectivityGovernance;
}): KnowledgeConnectivityProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Connectivity Decision Composition
// ---------------------------------------------------------------------------

function _composeConnectivityDecision(
  relationshipId: string,
  sourceConceptId: string,
  targetConceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeConnectivityDecision {
  return {
    decisionId: `_decision_${relationshipId}`,
    relationshipId,
    sourceConceptId,
    targetConceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Connectivity Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeConnectivityTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeConnectivityDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeConnectivityTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_connectivity_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Connectivity Profile Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeConnectivityProfile(params: {
  readonly relationshipId: string;
  readonly sourceConceptId: string;
  readonly targetConceptId: string;
  readonly relationshipType: ConnectivityType;
  readonly relationshipStrength: ConnectivityStrength;
  readonly scope: ConnectivityScope;
  readonly visibility: ConnectivityVisibility;
  readonly status: ConnectivityStatus;
  readonly governance: ConnectivityGovernance;
  readonly description: string;
  readonly bidirectional: boolean;
  readonly tags: readonly string[];
  readonly provenance: KnowledgeConnectivityProvenance;
}): KnowledgeConnectivityProfile {
  return {
    relationshipId: params.relationshipId,
    sourceConceptId: params.sourceConceptId,
    targetConceptId: params.targetConceptId,
    relationshipType: params.relationshipType,
    relationshipStrength: params.relationshipStrength,
    scope: params.scope,
    visibility: params.visibility,
    status: params.status,
    governance: params.governance,
    description: params.description,
    bidirectional: params.bidirectional,
    tags: [...params.tags],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Connectivity Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeConnectivityRelationship(params: {
  readonly relationshipId: string;
  readonly sourceRelationshipId: string;
  readonly targetRelationshipId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'alternative' | 'complement';
  readonly description: string;
  readonly provenance: KnowledgeConnectivityProvenance;
}): KnowledgeConnectivityRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceRelationshipId: params.sourceRelationshipId,
    targetRelationshipId: params.targetRelationshipId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeConnectivityProfile(
  a: KnowledgeConnectivityProfile,
  b: KnowledgeConnectivityProfile,
): number {
  if (a.sourceConceptId < b.sourceConceptId) return -1;
  if (a.sourceConceptId > b.sourceConceptId) return 1;

  if (a.targetConceptId < b.targetConceptId) return -1;
  if (a.targetConceptId > b.targetConceptId) return 1;

  const aIndex = CANONICAL_CONNECTIVITY_TYPES.indexOf(a.relationshipType);
  const bIndex = CANONICAL_CONNECTIVITY_TYPES.indexOf(b.relationshipType);
  const aRank = aIndex === -1 ? CANONICAL_CONNECTIVITY_TYPES.length : aIndex;
  const bRank = bIndex === -1 ? CANONICAL_CONNECTIVITY_TYPES.length : bIndex;
  if (aRank < bRank) return -1;
  if (aRank > bRank) return 1;

  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

function _compareKnowledgeConnectivityRelationship(
  a: KnowledgeConnectivityRelationship,
  b: KnowledgeConnectivityRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Connectivity Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeConnectivityRegistry(
  profiles: readonly KnowledgeConnectivityProfile[],
  relationships: readonly KnowledgeConnectivityRelationship[],
): KnowledgeConnectivityRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeConnectivityProfile);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeConnectivityRelationship);

  const concepts = new Set<string>();
  for (const p of sortedProfiles) {
    concepts.add(p.sourceConceptId);
    concepts.add(p.targetConceptId);
  }
  const types = new Set(sortedProfiles.map((p) => p.relationshipType));

  const metadata: KnowledgeConnectivityRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}`,
    relationshipCount: sortedProfiles.length,
    higherOrderRelationshipCount: sortedRelationships.length,
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
      generatedFrom: 'deterministic_connectivity_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_connectivity_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Connectivity Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeConnectivityRegistryFromInput(
  input: KnowledgeConnectivityInput,
): KnowledgeConnectivityRegistry {
  return composeKnowledgeConnectivityRegistry(input.profiles, input.relationships);
}

// ---------------------------------------------------------------------------
// Connectivity Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeConnectivity(
  input: KnowledgeConnectivityInput,
): KnowledgeConnectivityRegistry {
  const decisions = input.profiles.map((profile) => {
    const errors = _validateConnectivityForDecision(profile);
    return _composeConnectivityDecision(profile.relationshipId, profile.sourceConceptId, profile.targetConceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeConnectivityRegistry(input.profiles, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeConnectivityTrace({
      traceId: `_trace_${input.profiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateConnectivityForDecision(
  profile: KnowledgeConnectivityProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.relationshipId || profile.relationshipId.trim() === '') {
    errors.push('CONNECTIVITY_MISSING_RELATIONSHIP_ID');
  }

  if (!profile.sourceConceptId || profile.sourceConceptId.trim() === '') {
    errors.push('CONNECTIVITY_MISSING_CONCEPT_REFERENCE');
  }

  if (!profile.targetConceptId || profile.targetConceptId.trim() === '') {
    errors.push('CONNECTIVITY_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_CONNECTIVITY_TYPES.includes(profile.relationshipType)) {
    errors.push('CONNECTIVITY_INVALID_TYPE');
  }

  if (!CANONICAL_CONNECTIVITY_STRENGTH.includes(profile.relationshipStrength)) {
    errors.push('CONNECTIVITY_INVALID_STRENGTH');
  }

  if (!CANONICAL_CONNECTIVITY_SCOPE.includes(profile.scope)) {
    errors.push('CONNECTIVITY_INVALID_SCOPE');
  }

  if (!CANONICAL_CONNECTIVITY_VISIBILITY.includes(profile.visibility)) {
    errors.push('CONNECTIVITY_INVALID_VISIBILITY');
  }

  if (!CANONICAL_CONNECTIVITY_STATUS.includes(profile.status)) {
    errors.push('CONNECTIVITY_INVALID_STATUS');
  }

  if (!CANONICAL_CONNECTIVITY_GOVERNANCE.includes(profile.governance)) {
    errors.push('CONNECTIVITY_INVALID_GOVERNANCE');
  }

  if (!profile.provenance) {
    errors.push('CONNECTIVITY_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Connectivity Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithConnectivity(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly profiles: readonly KnowledgeConnectivityProfile[];
  readonly relationships: readonly KnowledgeConnectivityRelationship[];
  readonly provenance: KnowledgeConnectivityProvenance;
}): KnowledgeArtifactWithConnectivity {
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

export function isSupportedConnectivityType(
  value: string,
): value is ConnectivityType {
  return CANONICAL_CONNECTIVITY_TYPES.includes(value as ConnectivityType);
}

export function isSupportedConnectivityStrength(
  value: string,
): value is ConnectivityStrength {
  return CANONICAL_CONNECTIVITY_STRENGTH.includes(value as ConnectivityStrength);
}

export function isSupportedConnectivityScope(
  value: string,
): value is ConnectivityScope {
  return CANONICAL_CONNECTIVITY_SCOPE.includes(value as ConnectivityScope);
}

export function isSupportedConnectivityVisibility(
  value: string,
): value is ConnectivityVisibility {
  return CANONICAL_CONNECTIVITY_VISIBILITY.includes(value as ConnectivityVisibility);
}

export function isSupportedConnectivityStatus(
  value: string,
): value is ConnectivityStatus {
  return CANONICAL_CONNECTIVITY_STATUS.includes(value as ConnectivityStatus);
}

export function isSupportedConnectivityGovernance(
  value: string,
): value is ConnectivityGovernance {
  return CANONICAL_CONNECTIVITY_GOVERNANCE.includes(value as ConnectivityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalConnectivityTypes(): readonly ConnectivityType[] {
  return CANONICAL_CONNECTIVITY_TYPES;
}

export function getCanonicalConnectivityStrengths(): readonly ConnectivityStrength[] {
  return CANONICAL_CONNECTIVITY_STRENGTH;
}

export function getCanonicalConnectivityScopes(): readonly ConnectivityScope[] {
  return CANONICAL_CONNECTIVITY_SCOPE;
}

export function getCanonicalConnectivityVisibility(): readonly ConnectivityVisibility[] {
  return CANONICAL_CONNECTIVITY_VISIBILITY;
}

export function getCanonicalConnectivityStatuses(): readonly ConnectivityStatus[] {
  return CANONICAL_CONNECTIVITY_STATUS;
}
