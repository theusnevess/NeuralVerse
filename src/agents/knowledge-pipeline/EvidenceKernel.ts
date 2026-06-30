/**
 * NV-1700-D5-OPT-02 — Evidence Provenance & Source Traceability Kernel
 *
 * Deterministic orchestration functions for evidence metadata.
 * Produces evidence sources, citations, relationships, traces, and registries.
 *
 * This module never:
 * - Parses documents
 * - Generates citations
 * - Searches external sources
 * - Synchronizes Obsidian
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Evidence metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  EvidenceSource,
  CitationReference,
  EvidenceRelationship,
  EvidenceProvenance,
  EvidenceTrace,
  EvidenceRegistry,
  EvidenceRegistryMetadata,
  EvidenceInput,
  EvidenceSourceType,
  EvidenceAuthorityLevel,
  CitationType,
  SourceStatus,
  EvidenceGovernanceStatus,
  KnowledgeArtifactWithEvidence,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_EVIDENCE_SOURCE_TYPES,
  CANONICAL_EVIDENCE_AUTHORITY,
  CANONICAL_CITATION_TYPES,
  CANONICAL_SOURCE_STATUS,
  CANONICAL_EVIDENCE_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Evidence Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes evidence provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeEvidenceProvenance(params: {
  readonly source: string;
  readonly governanceStatus: EvidenceGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): EvidenceProvenance {
  return {
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Evidence Source Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evidence source from provided parameters.
 * Pure function. No side effects.
 */
export function composeEvidenceSource(params: {
  readonly sourceId: string;
  readonly title: string;
  readonly sourceType: EvidenceSourceType;
  readonly authorityLevel: EvidenceAuthorityLevel;
  readonly status: SourceStatus;
  readonly canonicalIdentifier: string;
  readonly publisher: string;
  readonly authors: readonly string[];
  readonly publicationYear: number;
  readonly urlReference: string;
  readonly tags: readonly string[];
  readonly summary: string;
  readonly provenance: EvidenceProvenance;
}): EvidenceSource {
  return {
    sourceId: params.sourceId,
    title: params.title,
    sourceType: params.sourceType,
    authorityLevel: params.authorityLevel,
    status: params.status,
    canonicalIdentifier: params.canonicalIdentifier,
    publisher: params.publisher,
    authors: [...params.authors],
    publicationYear: params.publicationYear,
    urlReference: params.urlReference,
    tags: [...params.tags],
    summary: params.summary,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Citation Reference Composition
// ---------------------------------------------------------------------------

/**
 * Composes a citation reference from provided parameters.
 * Pure function. No side effects.
 */
export function composeCitationReference(params: {
  readonly citationId: string;
  readonly knowledgeId: string;
  readonly sourceId: string;
  readonly citationType: CitationType;
  readonly sectionReference: string;
  readonly pageReference: string;
  readonly confidenceLevel: number;
  readonly provenance: EvidenceProvenance;
}): CitationReference {
  return {
    citationId: params.citationId,
    knowledgeId: params.knowledgeId,
    sourceId: params.sourceId,
    citationType: params.citationType,
    sectionReference: params.sectionReference,
    pageReference: params.pageReference,
    confidenceLevel: params.confidenceLevel,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Evidence Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evidence relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeEvidenceRelationship(params: {
  readonly relationshipId: string;
  readonly knowledgeId: string;
  readonly sourceId: string;
  readonly citationId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: EvidenceProvenance;
}): EvidenceRelationship {
  return {
    relationshipId: params.relationshipId,
    knowledgeId: params.knowledgeId,
    sourceId: params.sourceId,
    citationId: params.citationId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Evidence Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evidence trace from metadata.
 * Pure function. No side effects.
 */
export function composeEvidenceTrace(params: {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): EvidenceTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisionCount,
    validationCount: params.validationCount,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    deterministic: true,
    generatedFrom: 'deterministic_evidence_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for evidence sources.
 * Sorts by sourceId, then sourceType, then title.
 * Pure function. No side effects.
 */
function _compareEvidenceSource(
  a: EvidenceSource,
  b: EvidenceSource,
): number {
  if (a.sourceId < b.sourceId) return -1;
  if (a.sourceId > b.sourceId) return 1;

  if (a.sourceType < b.sourceType) return -1;
  if (a.sourceType > b.sourceType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

/**
 * Deterministic comparator for citation references.
 * Sorts by citationId, then knowledgeId, then sourceId.
 * Pure function. No side effects.
 */
function _compareCitationReference(
  a: CitationReference,
  b: CitationReference,
): number {
  if (a.citationId < b.citationId) return -1;
  if (a.citationId > b.citationId) return 1;

  if (a.knowledgeId < b.knowledgeId) return -1;
  if (a.knowledgeId > b.knowledgeId) return 1;

  if (a.sourceId < b.sourceId) return -1;
  if (a.sourceId > b.sourceId) return 1;

  return 0;
}

/**
 * Deterministic comparator for evidence relationships.
 * Sorts by relationshipId, then knowledgeId, then sourceId.
 * Pure function. No side effects.
 */
function _compareEvidenceRelationship(
  a: EvidenceRelationship,
  b: EvidenceRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  if (a.knowledgeId < b.knowledgeId) return -1;
  if (a.knowledgeId > b.knowledgeId) return 1;

  if (a.sourceId < b.sourceId) return -1;
  if (a.sourceId > b.sourceId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Evidence Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evidence registry from sources, citations, and relationships.
 * Pure function. No side effects.
 * Deterministic ordering for all collections.
 */
export function composeEvidenceRegistry(
  sources: readonly EvidenceSource[],
  citations: readonly CitationReference[],
  relationships: readonly EvidenceRelationship[],
): EvidenceRegistry {
  const sortedSources = [...sources].sort(_compareEvidenceSource);
  const sortedCitations = [...citations].sort(_compareCitationReference);
  const sortedRelationships = [...relationships].sort(_compareEvidenceRelationship);

  const sourceTypes = new Set(sortedSources.map((s) => s.sourceType));

  const metadata: EvidenceRegistryMetadata = {
    registryId: `_registry_${sortedSources.length}_${sortedCitations.length}_${sortedRelationships.length}`,
    sourceCount: sortedSources.length,
    citationCount: sortedCitations.length,
    relationshipCount: sortedRelationships.length,
    sourceTypeCount: sourceTypes.size,
  };

  return {
    registryId: metadata.registryId,
    sources: sortedSources,
    citations: sortedCitations,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedSources.length}_${sortedCitations.length}_${sortedRelationships.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      deterministic: true,
      generatedFrom: 'deterministic_evidence_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_evidence_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Evidence Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evidence registry from an input.
 * Pure function. No side effects.
 */
export function composeEvidenceRegistryFromInput(
  input: EvidenceInput,
): EvidenceRegistry {
  return composeEvidenceRegistry(
    input.sources,
    input.citations,
    input.relationships,
  );
}

// ---------------------------------------------------------------------------
// Evidence Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete evidence registry from an input.
 * Pure function. No side effects.
 */
export function composeEvidence(
  input: EvidenceInput,
): EvidenceRegistry {
  let decisionCount = 0;
  let validationCount = 0;

  for (const source of input.sources) {
    decisionCount++;
    const errors = _validateSourceForDecision(source);
    if (errors.length === 0) validationCount++;
  }

  for (const citation of input.citations) {
    decisionCount++;
    const errors = _validateCitationForDecision(citation);
    if (errors.length === 0) validationCount++;
  }

  for (const relationship of input.relationships) {
    decisionCount++;
    const errors = _validateRelationshipForDecision(relationship);
    if (errors.length === 0) validationCount++;
  }

  const registry = composeEvidenceRegistry(
    input.sources,
    input.citations,
    input.relationships,
  );

  return {
    ...registry,
    trace: composeEvidenceTrace({
      traceId: `_trace_${input.sources.length}_${input.citations.length}_${input.relationships.length}`,
      decisionCount,
      validationCount,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

/**
 * Validates an evidence source for decision composition.
 * Pure function. No side effects.
 */
function _validateSourceForDecision(
  source: EvidenceSource,
): readonly string[] {
  const errors: string[] = [];

  if (!source.sourceId || source.sourceId.trim() === '') {
    errors.push('EVIDENCE_MISSING_SOURCE_ID');
  }

  if (!source.title || source.title.trim() === '') {
    errors.push('EVIDENCE_MISSING_TITLE');
  }

  if (!CANONICAL_EVIDENCE_SOURCE_TYPES.includes(source.sourceType)) {
    errors.push('EVIDENCE_UNKNOWN_SOURCE_TYPE');
  }

  if (!CANONICAL_EVIDENCE_AUTHORITY.includes(source.authorityLevel)) {
    errors.push('EVIDENCE_UNKNOWN_AUTHORITY');
  }

  if (!CANONICAL_SOURCE_STATUS.includes(source.status)) {
    errors.push('EVIDENCE_UNKNOWN_STATUS');
  }

  if (!source.provenance) {
    errors.push('EVIDENCE_MISSING_PROVENANCE');
  }

  return errors;
}

/**
 * Validates a citation reference for decision composition.
 * Pure function. No side effects.
 */
function _validateCitationForDecision(
  citation: CitationReference,
): readonly string[] {
  const errors: string[] = [];

  if (!citation.citationId || citation.citationId.trim() === '') {
    errors.push('EVIDENCE_MISSING_CITATION_ID');
  }

  if (!citation.knowledgeId || citation.knowledgeId.trim() === '') {
    errors.push('EVIDENCE_MISSING_KNOWLEDGE_ID');
  }

  if (!citation.sourceId || citation.sourceId.trim() === '') {
    errors.push('EVIDENCE_MISSING_SOURCE_REFERENCE');
  }

  if (!CANONICAL_CITATION_TYPES.includes(citation.citationType)) {
    errors.push('EVIDENCE_UNKNOWN_CITATION_TYPE');
  }

  if (!citation.provenance) {
    errors.push('EVIDENCE_MISSING_PROVENANCE');
  }

  return errors;
}

/**
 * Validates an evidence relationship for decision composition.
 * Pure function. No side effects.
 */
function _validateRelationshipForDecision(
  relationship: EvidenceRelationship,
): readonly string[] {
  const errors: string[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push('EVIDENCE_MISSING_RELATIONSHIP_ID');
  }

  if (!relationship.knowledgeId || relationship.knowledgeId.trim() === '') {
    errors.push('EVIDENCE_MISSING_KNOWLEDGE_ID');
  }

  if (!relationship.sourceId || relationship.sourceId.trim() === '') {
    errors.push('EVIDENCE_MISSING_SOURCE_REFERENCE');
  }

  if (!relationship.citationId || relationship.citationId.trim() === '') {
    errors.push('EVIDENCE_MISSING_CITATION_REFERENCE');
  }

  if (!relationship.provenance) {
    errors.push('EVIDENCE_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Evidence Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge artifact with evidence from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeArtifactWithEvidence(params: {
  readonly knowledgeId: string;
  readonly title: string;
  readonly sources: readonly EvidenceSource[];
  readonly citations: readonly CitationReference[];
  readonly relationships: readonly EvidenceRelationship[];
  readonly provenance: EvidenceProvenance;
}): KnowledgeArtifactWithEvidence {
  return {
    knowledgeId: params.knowledgeId,
    title: params.title,
    sources: [...params.sources],
    citations: [...params.citations],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Evidence Composition
// ---------------------------------------------------------------------------

/**
 * Composes knowledge evidence by combining knowledge artifact with evidence.
 * Pure function. No side effects.
 */
export function composeKnowledgeEvidence(params: {
  readonly knowledgeId: string;
  readonly title: string;
  readonly sources: readonly EvidenceSource[];
  readonly citations: readonly CitationReference[];
  readonly relationships: readonly EvidenceRelationship[];
  readonly provenance: EvidenceProvenance;
}): KnowledgeArtifactWithEvidence {
  return composeKnowledgeArtifactWithEvidence(params);
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported evidence source type.
 */
export function isSupportedEvidenceSourceType(
  sourceType: string,
): sourceType is EvidenceSourceType {
  return CANONICAL_EVIDENCE_SOURCE_TYPES.includes(sourceType as EvidenceSourceType);
}

/**
 * Checks if a string is a supported evidence authority level.
 */
export function isSupportedEvidenceAuthority(
  authority: string,
): authority is EvidenceAuthorityLevel {
  return CANONICAL_EVIDENCE_AUTHORITY.includes(authority as EvidenceAuthorityLevel);
}

/**
 * Checks if a string is a supported citation type.
 */
export function isSupportedCitationType(
  citationType: string,
): citationType is CitationType {
  return CANONICAL_CITATION_TYPES.includes(citationType as CitationType);
}

/**
 * Checks if a string is a supported source status.
 */
export function isSupportedSourceStatus(
  status: string,
): status is SourceStatus {
  return CANONICAL_SOURCE_STATUS.includes(status as SourceStatus);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedEvidenceGovernanceStatus(
  governanceStatus: string,
): governanceStatus is EvidenceGovernanceStatus {
  return CANONICAL_EVIDENCE_GOVERNANCE_STATUSES.includes(
    governanceStatus as EvidenceGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical evidence source types.
 */
export function getCanonicalEvidenceSourceTypes(): readonly EvidenceSourceType[] {
  return CANONICAL_EVIDENCE_SOURCE_TYPES;
}

/**
 * Returns the canonical evidence authority levels.
 */
export function getCanonicalEvidenceAuthorityLevels(): readonly EvidenceAuthorityLevel[] {
  return CANONICAL_EVIDENCE_AUTHORITY;
}

/**
 * Returns the canonical citation types.
 */
export function getCanonicalCitationTypes(): readonly CitationType[] {
  return CANONICAL_CITATION_TYPES;
}

/**
 * Returns the canonical source statuses.
 */
export function getCanonicalSourceStatuses(): readonly SourceStatus[] {
  return CANONICAL_SOURCE_STATUS;
}

/**
 * Returns the canonical governance statuses.
 */
export function getCanonicalEvidenceGovernanceStatuses(): readonly EvidenceGovernanceStatus[] {
  return CANONICAL_EVIDENCE_GOVERNANCE_STATUSES;
}
