/**
 * NV-1700-D5-OPT-02 — Evidence Validation Layer
 *
 * Deterministic validation for evidence metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  EvidenceSource,
  CitationReference,
  EvidenceRelationship,
  EvidenceRegistry,
  EvidenceTrace,
  EvidenceInput,
  KnowledgeArtifactWithEvidence,
  EvidenceValidationError,
  EvidenceSourceValidationResult,
  EvidenceCitationValidationResult,
  EvidenceRelationshipValidationResult,
  EvidenceRegistryValidationResult,
  EvidenceInputValidationResult,
  EvidenceTraceValidationResult,
  KnowledgeArtifactWithEvidenceValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_EVIDENCE_SOURCE_TYPES,
  CANONICAL_EVIDENCE_AUTHORITY,
  CANONICAL_CITATION_TYPES,
  CANONICAL_SOURCE_STATUS,
  CANONICAL_EVIDENCE_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const EVIDENCE_VALIDATION_CODES = {
  EVIDENCE_DUPLICATE_SOURCE: 'EVIDENCE_DUPLICATE_SOURCE',
  EVIDENCE_DUPLICATE_CITATION: 'EVIDENCE_DUPLICATE_CITATION',
  EVIDENCE_DUPLICATE_RELATIONSHIP: 'EVIDENCE_DUPLICATE_RELATIONSHIP',
  EVIDENCE_UNKNOWN_SOURCE_TYPE: 'EVIDENCE_UNKNOWN_SOURCE_TYPE',
  EVIDENCE_UNKNOWN_AUTHORITY: 'EVIDENCE_UNKNOWN_AUTHORITY',
  EVIDENCE_UNKNOWN_CITATION_TYPE: 'EVIDENCE_UNKNOWN_CITATION_TYPE',
  EVIDENCE_UNKNOWN_STATUS: 'EVIDENCE_UNKNOWN_STATUS',
  EVIDENCE_INVALID_REFERENCE: 'EVIDENCE_INVALID_REFERENCE',
  EVIDENCE_MISSING_PROVENANCE: 'EVIDENCE_MISSING_PROVENANCE',
  EVIDENCE_EMPTY_REGISTRY: 'EVIDENCE_EMPTY_REGISTRY',
  EVIDENCE_INVALID_TRACE: 'EVIDENCE_INVALID_TRACE',
  EVIDENCE_MISSING_SOURCE: 'EVIDENCE_MISSING_SOURCE',
  EVIDENCE_MISSING_RATIONALE: 'EVIDENCE_MISSING_RATIONALE',
  EVIDENCE_MISSING_PROVIDED_BY: 'EVIDENCE_MISSING_PROVIDED_BY',
  EVIDENCE_MISSING_SOURCE_ID: 'EVIDENCE_MISSING_SOURCE_ID',
  EVIDENCE_MISSING_TITLE: 'EVIDENCE_MISSING_TITLE',
  EVIDENCE_MISSING_CITATION_ID: 'EVIDENCE_MISSING_CITATION_ID',
  EVIDENCE_MISSING_KNOWLEDGE_ID: 'EVIDENCE_MISSING_KNOWLEDGE_ID',
  EVIDENCE_MISSING_SOURCE_REFERENCE: 'EVIDENCE_MISSING_SOURCE_REFERENCE',
  EVIDENCE_MISSING_RELATIONSHIP_ID: 'EVIDENCE_MISSING_RELATIONSHIP_ID',
  EVIDENCE_MISSING_CITATION_REFERENCE: 'EVIDENCE_MISSING_CITATION_REFERENCE',
  EVIDENCE_INVALID_GOVERNANCE: 'EVIDENCE_INVALID_GOVERNANCE',
  EVIDENCE_INVALID_CONFIDENCE: 'EVIDENCE_INVALID_CONFIDENCE',
  EVIDENCE_INVALID_PUBLICATION_YEAR: 'EVIDENCE_INVALID_PUBLICATION_YEAR',
  EVIDENCE_INVALID_REGISTRY: 'EVIDENCE_INVALID_REGISTRY',
} as const;

// ---------------------------------------------------------------------------
// Single Evidence Source Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single evidence source against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvidenceSource(
  source: EvidenceSource,
): readonly EvidenceValidationError[] {
  const errors: EvidenceValidationError[] = [];

  if (!source.sourceId || source.sourceId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_SOURCE_ID,
      message: 'Evidence source is missing a source ID.',
      field: 'sourceId',
      id: source.sourceId,
    });
  }

  if (!source.title || source.title.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_TITLE,
      message: 'Evidence source is missing a title.',
      field: 'title',
      id: source.sourceId,
    });
  }

  if (!CANONICAL_EVIDENCE_SOURCE_TYPES.includes(source.sourceType)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_UNKNOWN_SOURCE_TYPE,
      message: `Evidence source has unsupported type: "${source.sourceType}".`,
      field: 'sourceType',
      id: source.sourceId,
    });
  }

  if (!CANONICAL_EVIDENCE_AUTHORITY.includes(source.authorityLevel)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_UNKNOWN_AUTHORITY,
      message: `Evidence source has unsupported authority level: "${source.authorityLevel}".`,
      field: 'authorityLevel',
      id: source.sourceId,
    });
  }

  if (!CANONICAL_SOURCE_STATUS.includes(source.status)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_UNKNOWN_STATUS,
      message: `Evidence source has unsupported status: "${source.status}".`,
      field: 'status',
      id: source.sourceId,
    });
  }

  if (source.publicationYear < 0 || source.publicationYear > 9999) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_PUBLICATION_YEAR,
      message: `Evidence source has invalid publication year: ${source.publicationYear}.`,
      field: 'publicationYear',
      id: source.sourceId,
    });
  }

  if (!source.provenance) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
      message: 'Evidence source is missing provenance.',
      field: 'provenance',
      id: source.sourceId,
    });
  } else {
    if (!source.provenance.source || source.provenance.source.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_SOURCE,
        message: 'Evidence provenance is missing a source.',
        field: 'provenance.source',
        id: source.sourceId,
      });
    }

    if (!source.provenance.rationale || source.provenance.rationale.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_RATIONALE,
        message: 'Evidence provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: source.sourceId,
      });
    }

    if (!source.provenance.providedBy || source.provenance.providedBy.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVIDED_BY,
        message: 'Evidence provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: source.sourceId,
      });
    }

    if (!CANONICAL_EVIDENCE_GOVERNANCE_STATUSES.includes(source.provenance.governanceStatus)) {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_GOVERNANCE,
        message: `Evidence provenance has invalid governance status: "${source.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        id: source.sourceId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Citation Reference Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single citation reference against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCitationReference(
  citation: CitationReference,
): readonly EvidenceValidationError[] {
  const errors: EvidenceValidationError[] = [];

  if (!citation.citationId || citation.citationId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_CITATION_ID,
      message: 'Citation reference is missing a citation ID.',
      field: 'citationId',
      id: citation.citationId,
    });
  }

  if (!citation.knowledgeId || citation.knowledgeId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_KNOWLEDGE_ID,
      message: 'Citation reference is missing a knowledge ID.',
      field: 'knowledgeId',
      id: citation.citationId,
    });
  }

  if (!citation.sourceId || citation.sourceId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_SOURCE_REFERENCE,
      message: 'Citation reference is missing a source ID.',
      field: 'sourceId',
      id: citation.citationId,
    });
  }

  if (!CANONICAL_CITATION_TYPES.includes(citation.citationType)) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_UNKNOWN_CITATION_TYPE,
      message: `Citation reference has unsupported type: "${citation.citationType}".`,
      field: 'citationType',
      id: citation.citationId,
    });
  }

  if (citation.confidenceLevel < 0 || citation.confidenceLevel > 1) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_CONFIDENCE,
      message: `Citation reference has invalid confidence level: ${citation.confidenceLevel}.`,
      field: 'confidenceLevel',
      id: citation.citationId,
    });
  }

  if (!citation.provenance) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
      message: 'Citation reference is missing provenance.',
      field: 'provenance',
      id: citation.citationId,
    });
  } else {
    if (!citation.provenance.source || citation.provenance.source.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_SOURCE,
        message: 'Citation provenance is missing a source.',
        field: 'provenance.source',
        id: citation.citationId,
      });
    }

    if (!citation.provenance.rationale || citation.provenance.rationale.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_RATIONALE,
        message: 'Citation provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: citation.citationId,
      });
    }

    if (!citation.provenance.providedBy || citation.provenance.providedBy.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVIDED_BY,
        message: 'Citation provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: citation.citationId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Evidence Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single evidence relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvidenceRelationship(
  relationship: EvidenceRelationship,
): readonly EvidenceValidationError[] {
  const errors: EvidenceValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_RELATIONSHIP_ID,
      message: 'Evidence relationship is missing a relationship ID.',
      field: 'relationshipId',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.knowledgeId || relationship.knowledgeId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_KNOWLEDGE_ID,
      message: 'Evidence relationship is missing a knowledge ID.',
      field: 'knowledgeId',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.sourceId || relationship.sourceId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_SOURCE_REFERENCE,
      message: 'Evidence relationship is missing a source ID.',
      field: 'sourceId',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.citationId || relationship.citationId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_CITATION_REFERENCE,
      message: 'Evidence relationship is missing a citation ID.',
      field: 'citationId',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
      message: 'Evidence relationship is missing provenance.',
      field: 'provenance',
      id: relationship.relationshipId,
    });
  } else {
    if (!relationship.provenance.source || relationship.provenance.source.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_SOURCE,
        message: 'Relationship provenance is missing a source.',
        field: 'provenance.source',
        id: relationship.relationshipId,
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_RATIONALE,
        message: 'Relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: relationship.relationshipId,
      });
    }

    if (!relationship.provenance.providedBy || relationship.provenance.providedBy.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVIDED_BY,
        message: 'Relationship provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: relationship.relationshipId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Evidence Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates an evidence registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvidenceRegistry(
  registry: EvidenceRegistry,
): EvidenceRegistryValidationResult {
  const errors: EvidenceValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.sources || registry.sources.length === 0) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_EMPTY_REGISTRY,
      message: 'Registry has no sources.',
      field: 'sources',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate source IDs
  const seenSourceIds = new Set<string>();
  for (const source of registry.sources) {
    if (seenSourceIds.has(source.sourceId)) {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_DUPLICATE_SOURCE,
        message: `Duplicate source ID: "${source.sourceId}".`,
        id: source.sourceId,
      });
    }
    seenSourceIds.add(source.sourceId);
  }

  // Check for duplicate citation IDs
  const seenCitationIds = new Set<string>();
  for (const citation of registry.citations) {
    if (seenCitationIds.has(citation.citationId)) {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_DUPLICATE_CITATION,
        message: `Duplicate citation ID: "${citation.citationId}".`,
        id: citation.citationId,
      });
    }
    seenCitationIds.add(citation.citationId);
  }

  // Check for duplicate relationship IDs
  const seenRelationshipIds = new Set<string>();
  for (const relationship of registry.relationships) {
    if (seenRelationshipIds.has(relationship.relationshipId)) {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_DUPLICATE_RELATIONSHIP,
        message: `Duplicate relationship ID: "${relationship.relationshipId}".`,
        id: relationship.relationshipId,
      });
    }
    seenRelationshipIds.add(relationship.relationshipId);
  }

  // Validate each source
  for (const source of registry.sources) {
    errors.push(...validateEvidenceSource(source));
  }

  // Validate each citation
  for (const citation of registry.citations) {
    errors.push(...validateCitationReference(citation));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateEvidenceRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'evidence_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Evidence Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates evidence input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvidenceInput(
  input: EvidenceInput,
): EvidenceInputValidationResult {
  const errors: EvidenceValidationError[] = [];

  if (!input.sources || input.sources.length === 0) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_EMPTY_REGISTRY,
      message: 'Input has no sources.',
      field: 'sources',
    });
  } else {
    for (const source of input.sources) {
      errors.push(...validateEvidenceSource(source));
    }
  }

  for (const citation of input.citations) {
    errors.push(...validateCitationReference(citation));
  }

  for (const relationship of input.relationships) {
    errors.push(...validateEvidenceRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'evidence_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Evidence Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates an evidence trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvidenceTrace(
  trace: EvidenceTrace,
): EvidenceTraceValidationResult {
  const errors: EvidenceValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: 'Evidence trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: 'Evidence trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: 'Evidence trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_INVALID_TRACE,
      message: 'Evidence trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'evidence_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Evidence Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge artifact with evidence against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeArtifactWithEvidence(
  artifact: KnowledgeArtifactWithEvidence,
): KnowledgeArtifactWithEvidenceValidationResult {
  const errors: EvidenceValidationError[] = [];

  if (!artifact.knowledgeId || artifact.knowledgeId.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_KNOWLEDGE_ID,
      message: 'Knowledge artifact is missing a knowledge ID.',
      field: 'knowledgeId',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_TITLE,
      message: 'Knowledge artifact is missing a title.',
      field: 'title',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.provenance) {
    errors.push({
      code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
      message: 'Knowledge artifact is missing provenance.',
      field: 'provenance',
      id: artifact.knowledgeId,
    });
  } else {
    if (!artifact.provenance.source || artifact.provenance.source.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_SOURCE,
        message: 'Knowledge artifact provenance is missing a source.',
        field: 'provenance.source',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_RATIONALE,
        message: 'Knowledge artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.providedBy || artifact.provenance.providedBy.trim() === '') {
      errors.push({
        code: EVIDENCE_VALIDATION_CODES.EVIDENCE_MISSING_PROVIDED_BY,
        message: 'Knowledge artifact provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: artifact.knowledgeId,
      });
    }
  }

  // Validate each source
  for (const source of artifact.sources) {
    errors.push(...validateEvidenceSource(source));
  }

  // Validate each citation
  for (const citation of artifact.citations) {
    errors.push(...validateCitationReference(citation));
  }

  // Validate each relationship
  for (const relationship of artifact.relationships) {
    errors.push(...validateEvidenceRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_evidence_composition',
  };
}

// ---------------------------------------------------------------------------
// Evidence Input Validation (Alternative Name)
// ---------------------------------------------------------------------------

/**
 * Validates evidence input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvidenceInputAlt(
  input: EvidenceInput,
): EvidenceInputValidationResult {
  return validateEvidenceInput(input);
}
