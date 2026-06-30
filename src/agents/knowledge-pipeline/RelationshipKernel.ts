/**
 * NV-1700-D5-OPT-03 — Knowledge Graph Relationships & Cross-Reference Orchestration Kernel
 *
 * Deterministic orchestration functions for knowledge relationship metadata.
 * Produces relationships, cross-references, traces, and registries.
 *
 * This module never:
 * - Performs graph traversal
 * - Performs semantic inference
 * - Recommends relationships
 * - Mutates the knowledge graph
 * - Synchronizes Obsidian
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Knowledge relationship metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeRelationship,
  KnowledgeCrossReference,
  RelationshipProvenance,
  RelationshipTrace,
  KnowledgeRelationshipRegistry,
  RelationshipRegistryMetadata,
  KnowledgeRelationshipInput,
  KnowledgeRelationshipType,
  RelationshipStrength,
  CrossReferenceType,
  RelationshipStatus,
  KnowledgeGovernanceStatus,
  KnowledgeArtifactWithRelationships,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_KNOWLEDGE_RELATIONSHIP_TYPES,
  CANONICAL_RELATIONSHIP_STRENGTH,
  CANONICAL_CROSS_REFERENCE_TYPES,
  CANONICAL_RELATIONSHIP_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Relationship Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes relationship provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeRelationshipProvenance(params: {
  readonly source: string;
  readonly governanceStatus: KnowledgeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): RelationshipProvenance {
  return {
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeRelationship(params: {
  readonly relationshipId: string;
  readonly sourceKnowledgeId: string;
  readonly targetKnowledgeId: string;
  readonly relationshipType: KnowledgeRelationshipType;
  readonly relationshipStrength: RelationshipStrength;
  readonly status: RelationshipStatus;
  readonly tags: readonly string[];
  readonly summary: string;
  readonly provenance: RelationshipProvenance;
}): KnowledgeRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceKnowledgeId: params.sourceKnowledgeId,
    targetKnowledgeId: params.targetKnowledgeId,
    relationshipType: params.relationshipType,
    relationshipStrength: params.relationshipStrength,
    status: params.status,
    tags: [...params.tags],
    summary: params.summary,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Cross Reference Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge cross reference from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeCrossReference(params: {
  readonly referenceId: string;
  readonly knowledgeId: string;
  readonly referenceType: CrossReferenceType;
  readonly targetIdentifier: string;
  readonly displayLabel: string;
  readonly status: RelationshipStatus;
  readonly provenance: RelationshipProvenance;
}): KnowledgeCrossReference {
  return {
    referenceId: params.referenceId,
    knowledgeId: params.knowledgeId,
    referenceType: params.referenceType,
    targetIdentifier: params.targetIdentifier,
    displayLabel: params.displayLabel,
    status: params.status,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Relationship Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a relationship trace from metadata.
 * Pure function. No side effects.
 */
export function composeRelationshipTrace(params: {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): RelationshipTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisionCount,
    validationCount: params.validationCount,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    deterministic: true,
    generatedFrom: 'deterministic_relationship_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for knowledge relationships.
 * Sorts by relationshipId, then sourceKnowledgeId, then targetKnowledgeId.
 * Pure function. No side effects.
 */
function _compareKnowledgeRelationship(
  a: KnowledgeRelationship,
  b: KnowledgeRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  if (a.sourceKnowledgeId < b.sourceKnowledgeId) return -1;
  if (a.sourceKnowledgeId > b.sourceKnowledgeId) return 1;

  if (a.targetKnowledgeId < b.targetKnowledgeId) return -1;
  if (a.targetKnowledgeId > b.targetKnowledgeId) return 1;

  return 0;
}

/**
 * Deterministic comparator for knowledge cross references.
 * Sorts by referenceId, then knowledgeId, then referenceType.
 * Pure function. No side effects.
 */
function _compareKnowledgeCrossReference(
  a: KnowledgeCrossReference,
  b: KnowledgeCrossReference,
): number {
  if (a.referenceId < b.referenceId) return -1;
  if (a.referenceId > b.referenceId) return 1;

  if (a.knowledgeId < b.knowledgeId) return -1;
  if (a.knowledgeId > b.knowledgeId) return 1;

  if (a.referenceType < b.referenceType) return -1;
  if (a.referenceType > b.referenceType) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Knowledge Relationship Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge relationship registry from relationships and cross references.
 * Pure function. No side effects.
 * Deterministic ordering for all collections.
 */
export function composeRelationshipRegistry(
  relationships: readonly KnowledgeRelationship[],
  crossReferences: readonly KnowledgeCrossReference[],
): KnowledgeRelationshipRegistry {
  const sortedRelationships = [...relationships].sort(_compareKnowledgeRelationship);
  const sortedCrossReferences = [...crossReferences].sort(_compareKnowledgeCrossReference);

  const relationshipTypes = new Set(sortedRelationships.map((r) => r.relationshipType));
  const crossReferenceTypes = new Set(sortedCrossReferences.map((c) => c.referenceType));

  const metadata: RelationshipRegistryMetadata = {
    registryId: `_registry_${sortedRelationships.length}_${sortedCrossReferences.length}`,
    relationshipCount: sortedRelationships.length,
    crossReferenceCount: sortedCrossReferences.length,
    relationshipTypeCount: relationshipTypes.size,
    crossReferenceTypeCount: crossReferenceTypes.size,
  };

  return {
    registryId: metadata.registryId,
    relationships: sortedRelationships,
    crossReferences: sortedCrossReferences,
    metadata,
    trace: {
      traceId: `_trace_${sortedRelationships.length}_${sortedCrossReferences.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      deterministic: true,
      generatedFrom: 'deterministic_relationship_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_relationship_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Relationship Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge relationship registry from an input.
 * Pure function. No side effects.
 */
export function composeRelationshipRegistryFromInput(
  input: KnowledgeRelationshipInput,
): KnowledgeRelationshipRegistry {
  return composeRelationshipRegistry(
    input.relationships,
    input.crossReferences,
  );
}

// ---------------------------------------------------------------------------
// Knowledge Relationships Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete knowledge relationship registry from an input.
 * Pure function. No side effects.
 */
export function composeKnowledgeRelationships(
  input: KnowledgeRelationshipInput,
): KnowledgeRelationshipRegistry {
  let decisionCount = 0;
  let validationCount = 0;

  for (const relationship of input.relationships) {
    decisionCount++;
    const errors = _validateRelationshipForDecision(relationship);
    if (errors.length === 0) validationCount++;
  }

  for (const crossReference of input.crossReferences) {
    decisionCount++;
    const errors = _validateCrossReferenceForDecision(crossReference);
    if (errors.length === 0) validationCount++;
  }

  const registry = composeRelationshipRegistry(
    input.relationships,
    input.crossReferences,
  );

  return {
    ...registry,
    trace: composeRelationshipTrace({
      traceId: `_trace_${input.relationships.length}_${input.crossReferences.length}`,
      decisionCount,
      validationCount,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

/**
 * Validates a knowledge relationship for decision composition.
 * Pure function. No side effects.
 */
function _validateRelationshipForDecision(
  relationship: KnowledgeRelationship,
): readonly string[] {
  const errors: string[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push('RELATIONSHIP_MISSING_RELATIONSHIP_ID');
  }

  if (!relationship.sourceKnowledgeId || relationship.sourceKnowledgeId.trim() === '') {
    errors.push('RELATIONSHIP_MISSING_SOURCE');
  }

  if (!relationship.targetKnowledgeId || relationship.targetKnowledgeId.trim() === '') {
    errors.push('RELATIONSHIP_MISSING_TARGET');
  }

  if (relationship.sourceKnowledgeId === relationship.targetKnowledgeId) {
    errors.push('RELATIONSHIP_SELF_REFERENCE');
  }

  if (!CANONICAL_KNOWLEDGE_RELATIONSHIP_TYPES.includes(relationship.relationshipType)) {
    errors.push('RELATIONSHIP_INVALID_TYPE');
  }

  if (!CANONICAL_RELATIONSHIP_STRENGTH.includes(relationship.relationshipStrength)) {
    errors.push('RELATIONSHIP_INVALID_STRENGTH');
  }

  if (!CANONICAL_RELATIONSHIP_STATUS.includes(relationship.status)) {
    errors.push('RELATIONSHIP_INVALID_STATUS');
  }

  if (!relationship.provenance) {
    errors.push('RELATIONSHIP_MISSING_PROVENANCE');
  }

  return errors;
}

/**
 * Validates a knowledge cross reference for decision composition.
 * Pure function. No side effects.
 */
function _validateCrossReferenceForDecision(
  crossReference: KnowledgeCrossReference,
): readonly string[] {
  const errors: string[] = [];

  if (!crossReference.referenceId || crossReference.referenceId.trim() === '') {
    errors.push('RELATIONSHIP_MISSING_REFERENCE_ID');
  }

  if (!crossReference.knowledgeId || crossReference.knowledgeId.trim() === '') {
    errors.push('RELATIONSHIP_MISSING_KNOWLEDGE_ID');
  }

  if (!CANONICAL_CROSS_REFERENCE_TYPES.includes(crossReference.referenceType)) {
    errors.push('RELATIONSHIP_UNKNOWN_REFERENCE_TYPE');
  }

  if (!crossReference.targetIdentifier || crossReference.targetIdentifier.trim() === '') {
    errors.push('RELATIONSHIP_INVALID_REFERENCE');
  }

  if (!CANONICAL_RELATIONSHIP_STATUS.includes(crossReference.status)) {
    errors.push('RELATIONSHIP_INVALID_STATUS');
  }

  if (!crossReference.provenance) {
    errors.push('RELATIONSHIP_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Relationships Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge artifact with relationships from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeArtifactWithRelationships(params: {
  readonly knowledgeId: string;
  readonly title: string;
  readonly relationships: readonly KnowledgeRelationship[];
  readonly crossReferences: readonly KnowledgeCrossReference[];
  readonly provenance: RelationshipProvenance;
}): KnowledgeArtifactWithRelationships {
  return {
    knowledgeId: params.knowledgeId,
    title: params.title,
    relationships: [...params.relationships],
    crossReferences: [...params.crossReferences],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported knowledge relationship type.
 */
export function isSupportedKnowledgeRelationshipType(
  relationshipType: string,
): relationshipType is KnowledgeRelationshipType {
  return CANONICAL_KNOWLEDGE_RELATIONSHIP_TYPES.includes(relationshipType as KnowledgeRelationshipType);
}

/**
 * Checks if a string is a supported relationship strength.
 */
export function isSupportedRelationshipStrength(
  strength: string,
): strength is RelationshipStrength {
  return CANONICAL_RELATIONSHIP_STRENGTH.includes(strength as RelationshipStrength);
}

/**
 * Checks if a string is a supported cross reference type.
 */
export function isSupportedCrossReferenceType(
  referenceType: string,
): referenceType is CrossReferenceType {
  return CANONICAL_CROSS_REFERENCE_TYPES.includes(referenceType as CrossReferenceType);
}

/**
 * Checks if a string is a supported relationship status.
 */
export function isSupportedRelationshipStatus(
  status: string,
): status is RelationshipStatus {
  return CANONICAL_RELATIONSHIP_STATUS.includes(status as RelationshipStatus);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical knowledge relationship types.
 */
export function getCanonicalKnowledgeRelationshipTypes(): readonly KnowledgeRelationshipType[] {
  return CANONICAL_KNOWLEDGE_RELATIONSHIP_TYPES;
}

/**
 * Returns the canonical relationship strengths.
 */
export function getCanonicalRelationshipStrengths(): readonly RelationshipStrength[] {
  return CANONICAL_RELATIONSHIP_STRENGTH;
}

/**
 * Returns the canonical cross reference types.
 */
export function getCanonicalCrossReferenceTypes(): readonly CrossReferenceType[] {
  return CANONICAL_CROSS_REFERENCE_TYPES;
}

/**
 * Returns the canonical relationship statuses.
 */
export function getCanonicalRelationshipStatuses(): readonly RelationshipStatus[] {
  return CANONICAL_RELATIONSHIP_STATUS;
}
