/**
 * NV-1400-D2-OPT-01 — Evidence Validation Layer
 *
 * Deterministic validation for research evidence metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchReference,
  ResearchEvidenceMetadata,
  ResearchEvidenceChain,
  ResearchArtifactWithEvidence,
  ResearchEvidenceValidationError,
  ResearchEvidenceValidationResult,
  ResearchEvidenceInput,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_SOURCE_TYPES,
  SOURCE_HIERARCHY_ORDER,
  CANONICAL_REVIEW_STATUSES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const VALIDATION_CODES = {
  EVIDENCE_MISSING_TITLE: 'EVIDENCE_MISSING_TITLE',
  EVIDENCE_MISSING_AUTHOR: 'EVIDENCE_MISSING_AUTHOR',
  EVIDENCE_MISSING_YEAR: 'EVIDENCE_MISSING_YEAR',
  EVIDENCE_INVALID_SOURCE_TYPE: 'EVIDENCE_INVALID_SOURCE_TYPE',
  EVIDENCE_INVALID_HIERARCHY: 'EVIDENCE_INVALID_HIERARCHY',
  EVIDENCE_UNSUPPORTED_SOURCE: 'EVIDENCE_UNSUPPORTED_SOURCE',
  EVIDENCE_DUPLICATE_REFERENCE: 'EVIDENCE_DUPLICATE_REFERENCE',
  EVIDENCE_DUPLICATE_DOI: 'EVIDENCE_DUPLICATE_DOI',
  EVIDENCE_DUPLICATE_PID: 'EVIDENCE_DUPLICATE_PID',
  EVIDENCE_MISSING_PROVENANCE: 'EVIDENCE_MISSING_PROVENANCE',
  EVIDENCE_BROKEN_CHAIN: 'EVIDENCE_BROKEN_CHAIN',
  EVIDENCE_INVALID_REVIEW_STATUS: 'EVIDENCE_INVALID_REVIEW_STATUS',
  EVIDENCE_INVALID_GOVERNANCE: 'EVIDENCE_INVALID_GOVERNANCE',
} as const;

// ---------------------------------------------------------------------------
// Reference Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single reference against canonical invariants.
 * Pure function. No side effects.
 */
export function validateReference(
  reference: ResearchReference,
): readonly ResearchEvidenceValidationError[] {
  const errors: ResearchEvidenceValidationError[] = [];

  if (!reference.title || reference.title.trim() === '') {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_MISSING_TITLE,
      message: 'Reference is missing a title.',
      field: 'title',
      referenceId: reference.id,
    });
  }

  if (!reference.authors || reference.authors.length === 0) {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_MISSING_AUTHOR,
      message: 'Reference is missing authors.',
      field: 'authors',
      referenceId: reference.id,
    });
  }

  if (typeof reference.publicationYear !== 'number' || reference.publicationYear < 0) {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_MISSING_YEAR,
      message: 'Reference is missing a valid publication year.',
      field: 'publicationYear',
      referenceId: reference.id,
    });
  }

  if (!CANONICAL_SOURCE_TYPES.includes(reference.sourceType)) {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_INVALID_SOURCE_TYPE,
      message: `Reference has unsupported source type: "${reference.sourceType}".`,
      field: 'sourceType',
      referenceId: reference.id,
    });
  }

  if (SOURCE_HIERARCHY_ORDER.indexOf(reference.sourceType) === -1) {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_INVALID_HIERARCHY,
      message: `Reference source type "${reference.sourceType}" is not in canonical hierarchy.`,
      field: 'sourceType',
      referenceId: reference.id,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// References Collection Validation
// ---------------------------------------------------------------------------

/**
 * Validates a collection of references for duplicates.
 * Pure function. No side effects.
 */
export function validateReferences(
  references: readonly ResearchReference[],
): readonly ResearchEvidenceValidationError[] {
  const errors: ResearchEvidenceValidationError[] = [];

  const seenIds = new Set<string>();
  const seenDois = new Set<string>();
  const seenPids = new Set<string>();

  for (const ref of references) {
    // Individual reference validation
    errors.push(...validateReference(ref));

    // Duplicate reference ID
    if (seenIds.has(ref.id)) {
      errors.push({
        code: VALIDATION_CODES.EVIDENCE_DUPLICATE_REFERENCE,
        message: `Duplicate reference ID: "${ref.id}".`,
        referenceId: ref.id,
      });
    }
    seenIds.add(ref.id);

    // Duplicate DOI
    if (ref.doi) {
      if (seenDois.has(ref.doi)) {
        errors.push({
          code: VALIDATION_CODES.EVIDENCE_DUPLICATE_DOI,
          message: `Duplicate DOI: "${ref.doi}".`,
          field: 'doi',
          referenceId: ref.id,
        });
      }
      seenDois.add(ref.doi);
    }

    // Duplicate persistent identifier
    if (ref.persistentIdentifier) {
      if (seenPids.has(ref.persistentIdentifier)) {
        errors.push({
          code: VALIDATION_CODES.EVIDENCE_DUPLICATE_PID,
          message: `Duplicate persistent identifier: "${ref.persistentIdentifier}".`,
          field: 'persistentIdentifier',
          referenceId: ref.id,
        });
      }
      seenPids.add(ref.persistentIdentifier);
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Evidence Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates evidence metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvidenceMetadata(
  metadata: ResearchEvidenceMetadata,
): readonly ResearchEvidenceValidationError[] {
  const errors: ResearchEvidenceValidationError[] = [];

  if (!metadata.title || metadata.title.trim() === '') {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_MISSING_TITLE,
      message: 'Evidence metadata is missing a title.',
      field: 'title',
    });
  }

  if (!metadata.authors || metadata.authors.length === 0) {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_MISSING_AUTHOR,
      message: 'Evidence metadata is missing authors.',
      field: 'authors',
    });
  }

  if (typeof metadata.publicationYear !== 'number' || metadata.publicationYear < 0) {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_MISSING_YEAR,
      message: 'Evidence metadata is missing a valid publication year.',
      field: 'publicationYear',
    });
  }

  if (!CANONICAL_SOURCE_TYPES.includes(metadata.sourceType)) {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_INVALID_SOURCE_TYPE,
      message: `Evidence metadata has unsupported source type: "${metadata.sourceType}".`,
      field: 'sourceType',
    });
  }

  if (SOURCE_HIERARCHY_ORDER.indexOf(metadata.sourceType) === -1) {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_INVALID_HIERARCHY,
      message: `Evidence metadata source type "${metadata.sourceType}" is not in canonical hierarchy.`,
      field: 'sourceType',
    });
  }

  if (!CANONICAL_REVIEW_STATUSES.includes(metadata.reviewStatus)) {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_INVALID_REVIEW_STATUS,
      message: `Evidence metadata has invalid review status: "${metadata.reviewStatus}".`,
      field: 'reviewStatus',
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(metadata.governanceStatus)) {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_INVALID_GOVERNANCE,
      message: `Evidence metadata has invalid governance status: "${metadata.governanceStatus}".`,
      field: 'governanceStatus',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Evidence Chain Validation
// ---------------------------------------------------------------------------

/**
 * Validates an evidence chain for structural integrity.
 * Pure function. No side effects.
 */
export function validateEvidenceChain(
  chain: ResearchEvidenceChain,
): readonly ResearchEvidenceValidationError[] {
  const errors: ResearchEvidenceValidationError[] = [];

  if (!chain.chainId || chain.chainId.trim() === '') {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
      message: 'Evidence chain is missing a chain ID.',
      field: 'chainId',
    });
  }

  if (!chain.links || chain.links.length === 0) {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_BROKEN_CHAIN,
      message: 'Evidence chain has no links.',
      field: 'links',
    });
  }

  if (chain.links && chain.links.length > 0) {
    const firstLink = chain.links[0];
    if (firstLink.entityType !== chain.rootEntityType || firstLink.entityId !== chain.rootEntityId) {
      errors.push({
        code: VALIDATION_CODES.EVIDENCE_BROKEN_CHAIN,
        message: 'Evidence chain root does not match first link.',
        field: 'links',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a research artifact with evidence.
 * Pure function. No side effects.
 */
export function validateResearchArtifact(
  artifact: ResearchArtifactWithEvidence,
): ResearchEvidenceValidationResult {
  const errors: ResearchEvidenceValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
      message: 'Research artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate all evidence metadata
  for (const metadata of artifact.evidenceMetadata) {
    errors.push(...validateEvidenceMetadata(metadata));
  }

  // Validate evidence chain
  errors.push(...validateEvidenceChain(artifact.evidenceChain));

  // Validate trace
  if (!artifact.evidenceTrace || typeof artifact.evidenceTrace !== 'object') {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
      message: 'Research artifact is missing evidence trace.',
      field: 'evidenceTrace',
    });
  } else {
    if (artifact.evidenceTrace.deterministic !== true) {
      errors.push({
        code: VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
        message: 'Evidence trace must declare deterministic: true.',
        field: 'evidenceTrace.deterministic',
      });
    }
    if (artifact.evidenceTrace.randomUsed !== false) {
      errors.push({
        code: VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
        message: 'Evidence trace must declare randomUsed: false.',
        field: 'evidenceTrace.randomUsed',
      });
    }
    if (artifact.evidenceTrace.timeDependency !== false) {
      errors.push({
        code: VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
        message: 'Evidence trace must declare timeDependency: false.',
        field: 'evidenceTrace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'evidence_composition',
  };
}

// ---------------------------------------------------------------------------
// Evidence Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates research evidence input.
 * Pure function. No side effects.
 */
export function validateEvidenceInput(
  input: ResearchEvidenceInput,
): readonly ResearchEvidenceValidationError[] {
  const errors: ResearchEvidenceValidationError[] = [];

  if (!input.conceptId || input.conceptId.trim() === '') {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
      message: 'Evidence input is missing concept ID.',
      field: 'conceptId',
    });
  }

  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
      message: 'Evidence input is missing concept label.',
      field: 'conceptLabel',
    });
  }

  if (!input.references || input.references.length === 0) {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
      message: 'Evidence input has no references.',
      field: 'references',
    });
  } else {
    errors.push(...validateReferences(input.references));
  }

  if (!input.chainLinks || input.chainLinks.length === 0) {
    errors.push({
      code: VALIDATION_CODES.EVIDENCE_MISSING_PROVENANCE,
      message: 'Evidence input has no chain links.',
      field: 'chainLinks',
    });
  }

  return errors;
}
