/**
 * NV-1400-D2-OPT-01 — Scientific Evidence Kernel
 *
 * Deterministic orchestration functions for research metadata.
 * Produces evidence metadata, evidence chains, and research evidence.
 *
 * This module never:
 * - Retrieves references
 * - Summarizes papers
 * - Ranks literature probabilistically
 * - Searches papers
 * - Calls external APIs
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchReference,
  ResearchEvidenceMetadata,
  ResearchEvidenceChain,
  ResearchEvidenceChainLink,
  ResearchEvidenceInput,
  ResearchArtifactWithEvidence,
  ResearchEvidenceTrace,
  ResearchEvidenceDecision,
  ResearchEvidenceStatus,
  ResearchEvidenceLevel,
  ResearchSourceType,
  ResearchTraceMetadata,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_SOURCE_TYPES,
  SOURCE_HIERARCHY_ORDER,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Evidence Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes evidence metadata from a reference and evidence level.
 * Pure function. No side effects.
 */
export function composeEvidenceMetadata(
  reference: ResearchReference,
  evidenceLevel: ResearchEvidenceLevel,
): ResearchEvidenceMetadata {
  return {
    title: reference.title,
    authors: [...reference.authors],
    publicationYear: reference.publicationYear,
    sourceType: reference.sourceType,
    evidenceLevel,
    doi: reference.doi,
    isbn: reference.isbn,
    publisher: reference.publisher,
    venue: reference.venue,
    officialUrl: reference.officialUrl,
    reviewStatus: _deriveReviewStatus(reference),
    verificationDate: 'not_verified',
    governanceStatus: 'provisional',
    edition: reference.edition,
    language: reference.language,
    license: reference.license,
    persistentIdentifier: reference.persistentIdentifier,
  };
}

/**
 * Derives review status from reference characteristics.
 * Deterministic mapping based on source type.
 */
function _deriveReviewStatus(reference: ResearchReference): ResearchEvidenceMetadata['reviewStatus'] {
  switch (reference.sourceType) {
    case 'peer_reviewed_journal':
      return 'peer_reviewed';
    case 'conference_paper':
      return 'peer_reviewed';
    case 'academic_book':
      return 'editorially_reviewed';
    case 'official_textbook':
      return 'editorially_reviewed';
    case 'official_documentation':
      return 'editorially_reviewed';
    case 'benchmark_documentation':
      return 'editorially_reviewed';
    case 'standards_body':
      return 'editorially_reviewed';
    case 'framework_maintainer':
      return 'community_reviewed';
    case 'survey':
      return 'peer_reviewed';
    case 'technical_report':
      return 'community_reviewed';
    case 'engineering_blog':
      return 'self_published';
    default:
      return 'unreviewed';
  }
}

// ---------------------------------------------------------------------------
// Evidence Chain Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evidence chain from chain links.
 * Pure function. No side effects.
 */
export function composeEvidenceChain(
  chainId: string,
  rootEntityType: 'lesson' | 'concept',
  rootEntityId: string,
  links: readonly ResearchEvidenceChainLink[],
): ResearchEvidenceChain {
  return {
    chainId,
    links: [...links],
    rootEntityType,
    rootEntityId,
  };
}

// ---------------------------------------------------------------------------
// Research Evidence Composition
// ---------------------------------------------------------------------------

/**
 * Composes research evidence from an input.
 * Pure function. No side effects.
 */
export function composeResearchEvidence(
  input: ResearchEvidenceInput,
): ResearchArtifactWithEvidence {
  const evidenceMetadata = input.references.map((ref) =>
    composeEvidenceMetadata(ref, input.evidenceLevel),
  );

  const decisions = _composeDecisions(input);

  const trace: ResearchEvidenceTrace = {
    traceId: `_trace_${input.conceptId}`,
    evidenceCount: evidenceMetadata.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    pendingCount: decisions.filter((d) => d.status === 'pending').length,
    invalidCount: decisions.filter((d) => d.status === 'invalid').length,
    deprecatedCount: decisions.filter((d) => d.status === 'deprecated').length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_kernel',
    randomUsed: false,
    timeDependency: false,
  };

  const chain = composeEvidenceChain(
    `_chain_${input.conceptId}`,
    'concept',
    input.conceptId,
    input.chainLinks,
  );

  return {
    artifactId: `_artifact_${input.conceptId}`,
    artifactType: 'concept',
    evidenceMetadata,
    evidenceChain: chain,
    evidenceTrace: trace,
  };
}

/**
 * Composes evidence decisions from input references.
 * Pure function. No side effects.
 */
function _composeDecisions(
  input: ResearchEvidenceInput,
): readonly ResearchEvidenceDecision[] {
  return input.references.map((ref) => {
    const validationErrors = _validateReferenceForDecision(ref);
    const status = _deriveEvidenceStatus(ref);

    return {
      evidenceId: `_evidence_${ref.id}`,
      referenceId: ref.id,
      status,
      evidenceLevel: input.evidenceLevel,
      sourceType: ref.sourceType,
      validationPassed: validationErrors.length === 0,
      validationErrors,
    };
  });
}

/**
 * Derives evidence status from reference.
 * Deterministic mapping.
 */
function _deriveEvidenceStatus(reference: ResearchReference): ResearchEvidenceStatus {
  if (!reference.title || !reference.authors || reference.authors.length === 0) {
    return 'invalid';
  }

  const sourceIndex = SOURCE_HIERARCHY_ORDER.indexOf(reference.sourceType);
  if (sourceIndex === -1) {
    return 'invalid';
  }

  return 'validated';
}

/**
 * Validates a reference for decision composition.
 * Returns validation error codes.
 */
function _validateReferenceForDecision(reference: ResearchReference): readonly string[] {
  const errors: string[] = [];

  if (!reference.title || reference.title.trim() === '') {
    errors.push('EVIDENCE_MISSING_TITLE');
  }

  if (!reference.authors || reference.authors.length === 0) {
    errors.push('EVIDENCE_MISSING_AUTHOR');
  }

  if (typeof reference.publicationYear !== 'number' || reference.publicationYear < 0) {
    errors.push('EVIDENCE_MISSING_YEAR');
  }

  if (!CANONICAL_SOURCE_TYPES.includes(reference.sourceType)) {
    errors.push('EVIDENCE_INVALID_SOURCE_TYPE');
  }

  if (SOURCE_HIERARCHY_ORDER.indexOf(reference.sourceType) === -1) {
    errors.push('EVIDENCE_INVALID_HIERARCHY');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Source Hierarchy Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the hierarchy rank for a source type.
 * Lower rank = higher priority.
 */
export function getSourceHierarchyRank(sourceType: ResearchSourceType): number {
  const index = SOURCE_HIERARCHY_ORDER.indexOf(sourceType);
  return index === -1 ? -1 : index;
}

/**
 * Compares two source types by hierarchy.
 * Returns negative if a has higher priority, positive if b has higher priority.
 */
export function compareSourceHierarchy(
  a: ResearchSourceType,
  b: ResearchSourceType,
): number {
  return getSourceHierarchyRank(a) - getSourceHierarchyRank(b);
}

/**
 * Checks if a source type is supported (in canonical hierarchy).
 */
export function isSupportedSourceType(sourceType: string): sourceType is ResearchSourceType {
  return CANONICAL_SOURCE_TYPES.includes(sourceType as ResearchSourceType);
}
