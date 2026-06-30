/**
 * NV-1700-D5-OPT-03 — Relationship Validation Layer
 *
 * Deterministic validation for knowledge relationship metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeRelationship,
  KnowledgeCrossReference,
  KnowledgeRelationshipRegistry,
  RelationshipTrace,
  KnowledgeRelationshipInput,
  KnowledgeArtifactWithRelationships,
  RelationshipValidationError,
  KnowledgeRelationshipValidationResult,
  KnowledgeCrossReferenceValidationResult,
  KnowledgeRelationshipRegistryValidationResult,
  KnowledgeRelationshipInputValidationResult,
  RelationshipTraceValidationResult,
  KnowledgeArtifactWithRelationshipsValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_KNOWLEDGE_RELATIONSHIP_TYPES,
  CANONICAL_RELATIONSHIP_STRENGTH,
  CANONICAL_CROSS_REFERENCE_TYPES,
  CANONICAL_RELATIONSHIP_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const RELATIONSHIP_VALIDATION_CODES = {
  RELATIONSHIP_DUPLICATE_ID: 'RELATIONSHIP_DUPLICATE_ID',
  RELATIONSHIP_DUPLICATE_REFERENCE: 'RELATIONSHIP_DUPLICATE_REFERENCE',
  RELATIONSHIP_INVALID_TYPE: 'RELATIONSHIP_INVALID_TYPE',
  RELATIONSHIP_INVALID_STRENGTH: 'RELATIONSHIP_INVALID_STRENGTH',
  RELATIONSHIP_INVALID_STATUS: 'RELATIONSHIP_INVALID_STATUS',
  RELATIONSHIP_INVALID_REFERENCE: 'RELATIONSHIP_INVALID_REFERENCE',
  RELATIONSHIP_SELF_REFERENCE: 'RELATIONSHIP_SELF_REFERENCE',
  RELATIONSHIP_MISSING_SOURCE: 'RELATIONSHIP_MISSING_SOURCE',
  RELATIONSHIP_MISSING_TARGET: 'RELATIONSHIP_MISSING_TARGET',
  RELATIONSHIP_MISSING_PROVENANCE: 'RELATIONSHIP_MISSING_PROVENANCE',
  RELATIONSHIP_EMPTY_REGISTRY: 'RELATIONSHIP_EMPTY_REGISTRY',
  RELATIONSHIP_INVALID_TRACE: 'RELATIONSHIP_INVALID_TRACE',
  RELATIONSHIP_UNKNOWN_REFERENCE_TYPE: 'RELATIONSHIP_UNKNOWN_REFERENCE_TYPE',
  RELATIONSHIP_BROKEN_REFERENCE: 'RELATIONSHIP_BROKEN_REFERENCE',
  RELATIONSHIP_MISSING_RELATIONSHIP_ID: 'RELATIONSHIP_MISSING_RELATIONSHIP_ID',
  RELATIONSHIP_MISSING_REFERENCE_ID: 'RELATIONSHIP_MISSING_REFERENCE_ID',
  RELATIONSHIP_MISSING_KNOWLEDGE_ID: 'RELATIONSHIP_MISSING_KNOWLEDGE_ID',
  RELATIONSHIP_MISSING_SOURCE_KNOWLEDGE_ID: 'RELATIONSHIP_MISSING_SOURCE_KNOWLEDGE_ID',
  RELATIONSHIP_MISSING_TARGET_KNOWLEDGE_ID: 'RELATIONSHIP_MISSING_TARGET_KNOWLEDGE_ID',
  RELATIONSHIP_MISSING_GOVERNANCE: 'RELATIONSHIP_MISSING_GOVERNANCE',
  RELATIONSHIP_MISSING_SOURCE_FIELD: 'RELATIONSHIP_MISSING_SOURCE_FIELD',
  RELATIONSHIP_MISSING_RATIONALE: 'RELATIONSHIP_MISSING_RATIONALE',
  RELATIONSHIP_MISSING_PROVIDED_BY: 'RELATIONSHIP_MISSING_PROVIDED_BY',
  RELATIONSHIP_INVALID_GOVERNANCE: 'RELATIONSHIP_INVALID_GOVERNANCE',
  RELATIONSHIP_MISSING_DISPLAY_LABEL: 'RELATIONSHIP_MISSING_DISPLAY_LABEL',
  RELATIONSHIP_MISSING_TARGET_IDENTIFIER: 'RELATIONSHIP_MISSING_TARGET_IDENTIFIER',
  RELATIONSHIP_MISSING_SUMMARY: 'RELATIONSHIP_MISSING_SUMMARY',
  RELATIONSHIP_INVALID_REGISTRY: 'RELATIONSHIP_INVALID_REGISTRY',
} as const;

// ---------------------------------------------------------------------------
// Single Knowledge Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single knowledge relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeRelationship(
  relationship: KnowledgeRelationship,
): readonly RelationshipValidationError[] {
  const errors: RelationshipValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_RELATIONSHIP_ID,
      message: 'Knowledge relationship is missing a relationship ID.',
      field: 'relationshipId',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.sourceKnowledgeId || relationship.sourceKnowledgeId.trim() === '') {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_SOURCE_KNOWLEDGE_ID,
      message: 'Knowledge relationship is missing a source knowledge ID.',
      field: 'sourceKnowledgeId',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.targetKnowledgeId || relationship.targetKnowledgeId.trim() === '') {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_TARGET_KNOWLEDGE_ID,
      message: 'Knowledge relationship is missing a target knowledge ID.',
      field: 'targetKnowledgeId',
      id: relationship.relationshipId,
    });
  }

  if (relationship.sourceKnowledgeId === relationship.targetKnowledgeId) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_SELF_REFERENCE,
      message: 'Knowledge relationship references itself.',
      field: 'targetKnowledgeId',
      id: relationship.relationshipId,
    });
  }

  if (!CANONICAL_KNOWLEDGE_RELATIONSHIP_TYPES.includes(relationship.relationshipType)) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_TYPE,
      message: `Knowledge relationship has unsupported type: "${relationship.relationshipType}".`,
      field: 'relationshipType',
      id: relationship.relationshipId,
    });
  }

  if (!CANONICAL_RELATIONSHIP_STRENGTH.includes(relationship.relationshipStrength)) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_STRENGTH,
      message: `Knowledge relationship has unsupported strength: "${relationship.relationshipStrength}".`,
      field: 'relationshipStrength',
      id: relationship.relationshipId,
    });
  }

  if (!CANONICAL_RELATIONSHIP_STATUS.includes(relationship.status)) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_STATUS,
      message: `Knowledge relationship has unsupported status: "${relationship.status}".`,
      field: 'status',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.summary || relationship.summary.trim() === '') {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_SUMMARY,
      message: 'Knowledge relationship is missing a summary.',
      field: 'summary',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_PROVENANCE,
      message: 'Knowledge relationship is missing provenance.',
      field: 'provenance',
      id: relationship.relationshipId,
    });
  } else {
    if (!relationship.provenance.source || relationship.provenance.source.trim() === '') {
      errors.push({
        code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_SOURCE_FIELD,
        message: 'Relationship provenance is missing a source.',
        field: 'provenance.source',
        id: relationship.relationshipId,
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_RATIONALE,
        message: 'Relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: relationship.relationshipId,
      });
    }

    if (!relationship.provenance.providedBy || relationship.provenance.providedBy.trim() === '') {
      errors.push({
        code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_PROVIDED_BY,
        message: 'Relationship provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: relationship.relationshipId,
      });
    }

    if (!CANONICAL_GOVERNANCE_STATUSES.includes(relationship.provenance.governanceStatus)) {
      errors.push({
        code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_GOVERNANCE,
        message: `Relationship provenance has invalid governance status: "${relationship.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        id: relationship.relationshipId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Cross Reference Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single knowledge cross reference against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeCrossReference(
  crossReference: KnowledgeCrossReference,
): readonly RelationshipValidationError[] {
  const errors: RelationshipValidationError[] = [];

  if (!crossReference.referenceId || crossReference.referenceId.trim() === '') {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_REFERENCE_ID,
      message: 'Knowledge cross reference is missing a reference ID.',
      field: 'referenceId',
      id: crossReference.referenceId,
    });
  }

  if (!crossReference.knowledgeId || crossReference.knowledgeId.trim() === '') {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_KNOWLEDGE_ID,
      message: 'Knowledge cross reference is missing a knowledge ID.',
      field: 'knowledgeId',
      id: crossReference.referenceId,
    });
  }

  if (!CANONICAL_CROSS_REFERENCE_TYPES.includes(crossReference.referenceType)) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_UNKNOWN_REFERENCE_TYPE,
      message: `Knowledge cross reference has unsupported type: "${crossReference.referenceType}".`,
      field: 'referenceType',
      id: crossReference.referenceId,
    });
  }

  if (!crossReference.targetIdentifier || crossReference.targetIdentifier.trim() === '') {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_TARGET_IDENTIFIER,
      message: 'Knowledge cross reference is missing a target identifier.',
      field: 'targetIdentifier',
      id: crossReference.referenceId,
    });
  }

  if (!crossReference.displayLabel || crossReference.displayLabel.trim() === '') {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_DISPLAY_LABEL,
      message: 'Knowledge cross reference is missing a display label.',
      field: 'displayLabel',
      id: crossReference.referenceId,
    });
  }

  if (!CANONICAL_RELATIONSHIP_STATUS.includes(crossReference.status)) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_STATUS,
      message: `Knowledge cross reference has unsupported status: "${crossReference.status}".`,
      field: 'status',
      id: crossReference.referenceId,
    });
  }

  if (!crossReference.provenance) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_PROVENANCE,
      message: 'Knowledge cross reference is missing provenance.',
      field: 'provenance',
      id: crossReference.referenceId,
    });
  } else {
    if (!crossReference.provenance.source || crossReference.provenance.source.trim() === '') {
      errors.push({
        code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_SOURCE_FIELD,
        message: 'Cross reference provenance is missing a source.',
        field: 'provenance.source',
        id: crossReference.referenceId,
      });
    }

    if (!crossReference.provenance.rationale || crossReference.provenance.rationale.trim() === '') {
      errors.push({
        code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_RATIONALE,
        message: 'Cross reference provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: crossReference.referenceId,
      });
    }

    if (!crossReference.provenance.providedBy || crossReference.provenance.providedBy.trim() === '') {
      errors.push({
        code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_PROVIDED_BY,
        message: 'Cross reference provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: crossReference.referenceId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Relationship Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge relationship registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateRelationshipRegistry(
  registry: KnowledgeRelationshipRegistry,
): KnowledgeRelationshipRegistryValidationResult {
  const errors: RelationshipValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.relationships || registry.relationships.length === 0) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_EMPTY_REGISTRY,
      message: 'Registry has no relationships.',
      field: 'relationships',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate relationship IDs
  const seenRelationshipIds = new Set<string>();
  for (const relationship of registry.relationships) {
    if (seenRelationshipIds.has(relationship.relationshipId)) {
      errors.push({
        code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_ID,
        message: `Duplicate relationship ID: "${relationship.relationshipId}".`,
        id: relationship.relationshipId,
      });
    }
    seenRelationshipIds.add(relationship.relationshipId);
  }

  // Check for duplicate cross reference IDs
  const seenReferenceIds = new Set<string>();
  for (const crossReference of registry.crossReferences) {
    if (seenReferenceIds.has(crossReference.referenceId)) {
      errors.push({
        code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_REFERENCE,
        message: `Duplicate cross reference ID: "${crossReference.referenceId}".`,
        id: crossReference.referenceId,
      });
    }
    seenReferenceIds.add(crossReference.referenceId);
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeRelationship(relationship));
  }

  // Validate each cross reference
  for (const crossReference of registry.crossReferences) {
    errors.push(...validateKnowledgeCrossReference(crossReference));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_relationship_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Relationship Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates knowledge relationship input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateRelationshipInput(
  input: KnowledgeRelationshipInput,
): KnowledgeRelationshipInputValidationResult {
  const errors: RelationshipValidationError[] = [];

  if (!input.relationships || input.relationships.length === 0) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_EMPTY_REGISTRY,
      message: 'Input has no relationships.',
      field: 'relationships',
    });
  } else {
    for (const relationship of input.relationships) {
      errors.push(...validateKnowledgeRelationship(relationship));
    }
  }

  for (const crossReference of input.crossReferences) {
    errors.push(...validateKnowledgeCrossReference(crossReference));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_relationship_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Relationship Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a relationship trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateRelationshipTrace(
  trace: RelationshipTrace,
): RelationshipTraceValidationResult {
  const errors: RelationshipValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_TRACE,
      message: 'Relationship trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_TRACE,
      message: 'Relationship trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_TRACE,
      message: 'Relationship trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_TRACE,
      message: 'Relationship trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'relationship_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Relationships Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge artifact with relationships against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeArtifactWithRelationships(
  artifact: KnowledgeArtifactWithRelationships,
): KnowledgeArtifactWithRelationshipsValidationResult {
  const errors: RelationshipValidationError[] = [];

  if (!artifact.knowledgeId || artifact.knowledgeId.trim() === '') {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_KNOWLEDGE_ID,
      message: 'Knowledge artifact is missing a knowledge ID.',
      field: 'knowledgeId',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_SOURCE_KNOWLEDGE_ID,
      message: 'Knowledge artifact is missing a title.',
      field: 'title',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.provenance) {
    errors.push({
      code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_PROVENANCE,
      message: 'Knowledge artifact is missing provenance.',
      field: 'provenance',
      id: artifact.knowledgeId,
    });
  } else {
    if (!artifact.provenance.source || artifact.provenance.source.trim() === '') {
      errors.push({
        code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_SOURCE_FIELD,
        message: 'Knowledge artifact provenance is missing a source.',
        field: 'provenance.source',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_RATIONALE,
        message: 'Knowledge artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.providedBy || artifact.provenance.providedBy.trim() === '') {
      errors.push({
        code: RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_PROVIDED_BY,
        message: 'Knowledge artifact provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: artifact.knowledgeId,
      });
    }
  }

  // Validate each relationship
  for (const relationship of artifact.relationships) {
    errors.push(...validateKnowledgeRelationship(relationship));
  }

  // Validate each cross reference
  for (const crossReference of artifact.crossReferences) {
    errors.push(...validateKnowledgeCrossReference(crossReference));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_relationships_composition',
  };
}
