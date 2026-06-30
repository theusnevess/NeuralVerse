/**
 * NV-1400-D2-OPT-10 — Laboratory Integration Validation Layer
 *
 * Deterministic validation for research laboratory metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchLaboratoryMetadata,
  ResearchLaboratoryRegistry,
  ResearchArtifactWithLaboratories,
  ResearchLaboratoryValidationError,
  ResearchLaboratoryValidationResult,
  ResearchLaboratoryInput,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_LABORATORY_TYPES,
  CANONICAL_LABORATORY_PURPOSES,
  CANONICAL_LABORATORY_INTEGRATION_MODES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const LABORATORY_VALIDATION_CODES = {
  LABMETA_UNKNOWN_TYPE: 'LABMETA_UNKNOWN_TYPE',
  LABMETA_UNKNOWN_PURPOSE: 'LABMETA_UNKNOWN_PURPOSE',
  LABMETA_UNKNOWN_MODE: 'LABMETA_UNKNOWN_MODE',
  LABMETA_DUPLICATE_ID: 'LABMETA_DUPLICATE_ID',
  LABMETA_DUPLICATE_RECORD: 'LABMETA_DUPLICATE_RECORD',
  LABMETA_MISSING_SOURCE: 'LABMETA_MISSING_SOURCE',
  LABMETA_MISSING_EVIDENCE: 'LABMETA_MISSING_EVIDENCE',
  LABMETA_INVALID_REFERENCE: 'LABMETA_INVALID_REFERENCE',
  LABMETA_MISSING_PROVENANCE: 'LABMETA_MISSING_PROVENANCE',
  LABMETA_EMPTY_REGISTRY: 'LABMETA_EMPTY_REGISTRY',
  LABMETA_INVALID_STATUS: 'LABMETA_INVALID_STATUS',
} as const;

// ---------------------------------------------------------------------------
// Laboratory Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single laboratory metadata entry.
 * Pure function. No side effects.
 */
export function validateLaboratoryMetadata(
  metadata: ResearchLaboratoryMetadata,
): readonly ResearchLaboratoryValidationError[] {
  const errors: ResearchLaboratoryValidationError[] = [];

  if (!metadata.laboratoryId || metadata.laboratoryId.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_SOURCE,
      message: 'Laboratory metadata is missing an ID.',
      field: 'laboratoryId',
      laboratoryId: metadata.laboratoryId,
    });
  }

  if (!CANONICAL_LABORATORY_TYPES.includes(metadata.laboratoryType)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_UNKNOWN_TYPE,
      message: `Laboratory metadata has unknown type: "${metadata.laboratoryType}".`,
      field: 'laboratoryType',
      laboratoryId: metadata.laboratoryId,
    });
  }

  if (!CANONICAL_LABORATORY_PURPOSES.includes(metadata.purpose)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_UNKNOWN_PURPOSE,
      message: `Laboratory metadata has unknown purpose: "${metadata.purpose}".`,
      field: 'purpose',
      laboratoryId: metadata.laboratoryId,
    });
  }

  if (!CANONICAL_LABORATORY_INTEGRATION_MODES.includes(metadata.integrationMode)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_UNKNOWN_MODE,
      message: `Laboratory metadata has unknown integration mode: "${metadata.integrationMode}".`,
      field: 'integrationMode',
      laboratoryId: metadata.laboratoryId,
    });
  }

  if (!metadata.title || metadata.title.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_SOURCE,
      message: 'Laboratory metadata is missing a title.',
      field: 'title',
      laboratoryId: metadata.laboratoryId,
    });
  }

  if (!metadata.description || metadata.description.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_SOURCE,
      message: 'Laboratory metadata is missing a description.',
      field: 'description',
      laboratoryId: metadata.laboratoryId,
    });
  }

  if (!metadata.associatedEvidence || metadata.associatedEvidence.length === 0) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_EVIDENCE,
      message: 'Laboratory metadata has no associated evidence.',
      field: 'associatedEvidence',
      laboratoryId: metadata.laboratoryId,
    });
  }

  if (!metadata.officialSource || metadata.officialSource.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_SOURCE,
      message: 'Laboratory metadata is missing an official source.',
      field: 'officialSource',
      laboratoryId: metadata.laboratoryId,
    });
  }

  if (!metadata.rationale || metadata.rationale.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_SOURCE,
      message: 'Laboratory metadata is missing a rationale.',
      field: 'rationale',
      laboratoryId: metadata.laboratoryId,
    });
  }

  if (!metadata.provenance || typeof metadata.provenance !== 'object') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_PROVENANCE,
      message: 'Laboratory metadata is missing provenance.',
      field: 'provenance',
      laboratoryId: metadata.laboratoryId,
    });
  } else {
    if (!metadata.provenance.rationale || metadata.provenance.rationale.trim() === '') {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_PROVENANCE,
        message: 'Laboratory provenance is missing rationale.',
        field: 'provenance.rationale',
        laboratoryId: metadata.laboratoryId,
      });
    }
    if (!metadata.provenance.source || metadata.provenance.source.trim() === '') {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_PROVENANCE,
        message: 'Laboratory provenance is missing source.',
        field: 'provenance.source',
        laboratoryId: metadata.laboratoryId,
      });
    }
  }

  if (!metadata.governanceStatus || metadata.governanceStatus.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_INVALID_STATUS,
      message: 'Laboratory metadata is missing governance status.',
      field: 'governanceStatus',
      laboratoryId: metadata.laboratoryId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a laboratory registry for structural integrity.
 * Pure function. No side effects.
 */
export function validateLaboratoryRegistry(
  registry: ResearchLaboratoryRegistry,
): readonly ResearchLaboratoryValidationError[] {
  const errors: ResearchLaboratoryValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_SOURCE,
      message: 'Laboratory registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  // Check for empty registry
  if (!registry.laboratories || registry.laboratories.length === 0) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_EMPTY_REGISTRY,
      message: 'Laboratory registry has no laboratories.',
      field: 'laboratories',
    });
  }

  // Validate all laboratories
  if (registry.laboratories) {
    for (const lab of registry.laboratories) {
      errors.push(...validateLaboratoryMetadata(lab));
    }
  }

  // Check for duplicate IDs
  if (registry.laboratories) {
    const seenIds = new Set<string>();
    for (const lab of registry.laboratories) {
      if (seenIds.has(lab.laboratoryId)) {
        errors.push({
          code: LABORATORY_VALIDATION_CODES.LABMETA_DUPLICATE_ID,
          message: `Duplicate laboratory ID: "${lab.laboratoryId}".`,
          laboratoryId: lab.laboratoryId,
        });
      }
      seenIds.add(lab.laboratoryId);
    }
  }

  // Check for duplicate records (same type + purpose)
  if (registry.laboratories) {
    const seenRecords = new Set<string>();
    for (const lab of registry.laboratories) {
      const key = `${lab.laboratoryType}:${lab.purpose}`;
      if (seenRecords.has(key)) {
        errors.push({
          code: LABORATORY_VALIDATION_CODES.LABMETA_DUPLICATE_RECORD,
          message: `Duplicate laboratory record for type "${lab.laboratoryType}" with purpose "${lab.purpose}".`,
          laboratoryId: lab.laboratoryId,
        });
      }
      seenRecords.add(key);
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a research artifact with laboratory metadata.
 * Pure function. No side effects.
 */
export function validateResearchArtifactWithLaboratories(
  artifact: ResearchArtifactWithLaboratories,
): ResearchLaboratoryValidationResult {
  const errors: ResearchLaboratoryValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_SOURCE,
      message: 'Research artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate laboratory registry
  errors.push(...validateLaboratoryRegistry(artifact.laboratoryRegistry));

  // Validate trace
  if (!artifact.laboratoryTrace || typeof artifact.laboratoryTrace !== 'object') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_PROVENANCE,
      message: 'Research artifact is missing laboratory trace.',
      field: 'laboratoryTrace',
    });
  } else {
    if (artifact.laboratoryTrace.deterministic !== true) {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_PROVENANCE,
        message: 'Laboratory trace must declare deterministic: true.',
        field: 'laboratoryTrace.deterministic',
      });
    }
    if (artifact.laboratoryTrace.randomUsed !== false) {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_PROVENANCE,
        message: 'Laboratory trace must declare randomUsed: false.',
        field: 'laboratoryTrace.randomUsed',
      });
    }
    if (artifact.laboratoryTrace.timeDependency !== false) {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_PROVENANCE,
        message: 'Laboratory trace must declare timeDependency: false.',
        field: 'laboratoryTrace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'laboratory_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates research laboratory input.
 * Pure function. No side effects.
 */
export function validateLaboratoryInput(
  input: ResearchLaboratoryInput,
): readonly ResearchLaboratoryValidationError[] {
  const errors: ResearchLaboratoryValidationError[] = [];

  if (!input.conceptId || input.conceptId.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_SOURCE,
      message: 'Laboratory input is missing concept ID.',
      field: 'conceptId',
    });
  }

  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_MISSING_SOURCE,
      message: 'Laboratory input is missing concept label.',
      field: 'conceptLabel',
    });
  }

  if (!input.laboratories || input.laboratories.length === 0) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LABMETA_EMPTY_REGISTRY,
      message: 'Laboratory input has no laboratories.',
      field: 'laboratories',
    });
  } else {
    for (const lab of input.laboratories) {
      errors.push(...validateLaboratoryMetadata(lab));
    }
  }

  return errors;
}
