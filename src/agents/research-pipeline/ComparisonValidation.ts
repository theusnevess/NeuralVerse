/**
 * NV-1400-D2-OPT-03 — Comparison Validation Layer
 *
 * Deterministic validation for research comparison metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchComparisonEntry,
  ResearchComparisonMatrix,
  ResearchArtifactWithComparison,
  ResearchComparisonValidationError,
  ResearchComparisonValidationResult,
  ResearchComparisonInput,
  ResearchComparisonDimension,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_COMPARISON_DIMENSIONS,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const COMPARISON_VALIDATION_CODES = {
  COMPARISON_UNKNOWN_DIMENSION: 'COMPARISON_UNKNOWN_DIMENSION',
  COMPARISON_DUPLICATE_METHOD: 'COMPARISON_DUPLICATE_METHOD',
  COMPARISON_DUPLICATE_DIMENSION: 'COMPARISON_DUPLICATE_DIMENSION',
  COMPARISON_UNSUPPORTED_METHOD: 'COMPARISON_UNSUPPORTED_METHOD',
  COMPARISON_MISSING_EVIDENCE: 'COMPARISON_MISSING_EVIDENCE',
  COMPARISON_MISSING_PROVENANCE: 'COMPARISON_MISSING_PROVENANCE',
  COMPARISON_INVALID_ATTRIBUTE: 'COMPARISON_INVALID_ATTRIBUTE',
  COMPARISON_INVALID_STATUS: 'COMPARISON_INVALID_STATUS',
  COMPARISON_EMPTY_MATRIX: 'COMPARISON_EMPTY_MATRIX',
  COMPARISON_INCONSISTENT_DIMENSIONS: 'COMPARISON_INCONSISTENT_DIMENSIONS',
} as const;

// ---------------------------------------------------------------------------
// Entry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single comparison entry.
 * Pure function. No side effects.
 */
export function validateComparisonEntry(
  entry: ResearchComparisonEntry,
  supportedMethodIds: readonly string[],
): readonly ResearchComparisonValidationError[] {
  const errors: ResearchComparisonValidationError[] = [];

  if (!entry.entryId || entry.entryId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_EVIDENCE,
      message: 'Comparison entry is missing an entry ID.',
      field: 'entryId',
      methodReferenceId: entry.methodReferenceId,
    });
  }

  if (!entry.methodReferenceId || entry.methodReferenceId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_EVIDENCE,
      message: 'Comparison entry is missing a method reference ID.',
      field: 'methodReferenceId',
      methodReferenceId: entry.methodReferenceId,
    });
  }

  if (!entry.methodTitle || entry.methodTitle.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_EVIDENCE,
      message: 'Comparison entry is missing a method title.',
      field: 'methodTitle',
      methodReferenceId: entry.methodReferenceId,
    });
  }

  if (!entry.evidenceReferenceId || entry.evidenceReferenceId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_EVIDENCE,
      message: 'Comparison entry is missing an evidence reference ID.',
      field: 'evidenceReferenceId',
      methodReferenceId: entry.methodReferenceId,
    });
  }

  if (!entry.lineageReferenceId || entry.lineageReferenceId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_EVIDENCE,
      message: 'Comparison entry is missing a lineage reference ID.',
      field: 'lineageReferenceId',
      methodReferenceId: entry.methodReferenceId,
    });
  }

  // Validate method is supported
  if (supportedMethodIds.length > 0 && entry.methodReferenceId && !supportedMethodIds.includes(entry.methodReferenceId)) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_UNSUPPORTED_METHOD,
      message: `Comparison entry references unsupported method: "${entry.methodReferenceId}".`,
      field: 'methodReferenceId',
      methodReferenceId: entry.methodReferenceId,
    });
  }

  // Validate comparison values
  if (!entry.comparisonValues || entry.comparisonValues.length === 0) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_MATRIX,
      message: 'Comparison entry has no comparison values.',
      field: 'comparisonValues',
      methodReferenceId: entry.methodReferenceId,
    });
  } else {
    for (const value of entry.comparisonValues) {
      if (!CANONICAL_COMPARISON_DIMENSIONS.includes(value.dimension)) {
        errors.push({
          code: COMPARISON_VALIDATION_CODES.COMPARISON_UNKNOWN_DIMENSION,
          message: `Comparison entry has unknown dimension: "${value.dimension}".`,
          field: 'comparisonValues.dimension',
          methodReferenceId: entry.methodReferenceId,
          dimension: value.dimension,
        });
      }

      if (!value.attributes || value.attributes.length === 0) {
        errors.push({
          code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_ATTRIBUTE,
          message: `Comparison entry has empty attributes for dimension: "${value.dimension}".`,
          field: 'comparisonValues.attributes',
          methodReferenceId: entry.methodReferenceId,
          dimension: value.dimension,
        });
      }
    }
  }

  // Validate provenance
  if (!entry.provenance || typeof entry.provenance !== 'object') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE,
      message: 'Comparison entry is missing provenance.',
      field: 'provenance',
      methodReferenceId: entry.methodReferenceId,
    });
  } else {
    if (!entry.provenance.rationale || entry.provenance.rationale.trim() === '') {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE,
        message: 'Comparison entry provenance is missing rationale.',
        field: 'provenance.rationale',
        methodReferenceId: entry.methodReferenceId,
      });
    }
    if (!entry.provenance.source || entry.provenance.source.trim() === '') {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE,
        message: 'Comparison entry provenance is missing source.',
        field: 'provenance.source',
        methodReferenceId: entry.methodReferenceId,
      });
    }
  }

  // Validate governance status
  if (!entry.governanceStatus || entry.governanceStatus.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_STATUS,
      message: 'Comparison entry is missing governance status.',
      field: 'governanceStatus',
      methodReferenceId: entry.methodReferenceId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Matrix Validation
// ---------------------------------------------------------------------------

/**
 * Validates a comparison matrix for structural integrity.
 * Pure function. No side effects.
 */
export function validateComparisonMatrix(
  matrix: ResearchComparisonMatrix,
): readonly ResearchComparisonValidationError[] {
  const errors: ResearchComparisonValidationError[] = [];

  if (!matrix.matrixId || matrix.matrixId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_EVIDENCE,
      message: 'Comparison matrix is missing a matrix ID.',
      field: 'matrixId',
    });
  }

  // Check for empty matrix
  if (!matrix.methods || matrix.methods.length === 0) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_MATRIX,
      message: 'Comparison matrix has no methods.',
      field: 'methods',
    });
  }

  if (!matrix.dimensions || matrix.dimensions.length === 0) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_MATRIX,
      message: 'Comparison matrix has no dimensions.',
      field: 'dimensions',
    });
  }

  if (!matrix.entries || matrix.entries.length === 0) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_MATRIX,
      message: 'Comparison matrix has no entries.',
      field: 'entries',
    });
  }

  // Validate dimensions are canonical
  if (matrix.dimensions) {
    for (const dimension of matrix.dimensions) {
      if (!CANONICAL_COMPARISON_DIMENSIONS.includes(dimension)) {
        errors.push({
          code: COMPARISON_VALIDATION_CODES.COMPARISON_UNKNOWN_DIMENSION,
          message: `Comparison matrix has unknown dimension: "${dimension}".`,
          field: 'dimensions',
          dimension,
        });
      }
    }
  }

  // Check for duplicate dimensions
  if (matrix.dimensions) {
    const seenDimensions = new Set<ResearchComparisonDimension>();
    for (const dimension of matrix.dimensions) {
      if (seenDimensions.has(dimension)) {
        errors.push({
          code: COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_DIMENSION,
          message: `Comparison matrix has duplicate dimension: "${dimension}".`,
          field: 'dimensions',
          dimension,
        });
      }
      seenDimensions.add(dimension);
    }
  }

  // Check for duplicate methods
  if (matrix.methods) {
    const seenMethods = new Set<string>();
    for (const method of matrix.methods) {
      if (seenMethods.has(method)) {
        errors.push({
          code: COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_METHOD,
          message: `Comparison matrix has duplicate method: "${method}".`,
          field: 'methods',
          methodReferenceId: method,
        });
      }
      seenMethods.add(method);
    }
  }

  // Validate all entries
  if (matrix.entries) {
    for (const entry of matrix.entries) {
      errors.push(...validateComparisonEntry(entry, matrix.methods || []));
    }
  }

  // Check for inconsistent dimensions across entries
  if (matrix.entries && matrix.entries.length > 0 && matrix.dimensions) {
    const expectedDimensions = new Set(matrix.dimensions);
    for (const entry of matrix.entries) {
      if (entry.comparisonValues) {
        const entryDimensions = new Set(entry.comparisonValues.map((v) => v.dimension));
        for (const dim of expectedDimensions) {
          if (!entryDimensions.has(dim)) {
            errors.push({
              code: COMPARISON_VALIDATION_CODES.COMPARISON_INCONSISTENT_DIMENSIONS,
              message: `Entry "${entry.entryId}" is missing dimension: "${dim}".`,
              field: 'comparisonValues',
              methodReferenceId: entry.methodReferenceId,
              dimension: dim,
            });
          }
        }
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a research artifact with comparison.
 * Pure function. No side effects.
 */
export function validateResearchArtifactWithComparison(
  artifact: ResearchArtifactWithComparison,
): ResearchComparisonValidationResult {
  const errors: ResearchComparisonValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_EVIDENCE,
      message: 'Research artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate comparison matrix
  errors.push(...validateComparisonMatrix(artifact.comparisonMatrix));

  // Validate trace
  if (!artifact.comparisonTrace || typeof artifact.comparisonTrace !== 'object') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE,
      message: 'Research artifact is missing comparison trace.',
      field: 'comparisonTrace',
    });
  } else {
    if (artifact.comparisonTrace.deterministic !== true) {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE,
        message: 'Comparison trace must declare deterministic: true.',
        field: 'comparisonTrace.deterministic',
      });
    }
    if (artifact.comparisonTrace.randomUsed !== false) {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE,
        message: 'Comparison trace must declare randomUsed: false.',
        field: 'comparisonTrace.randomUsed',
      });
    }
    if (artifact.comparisonTrace.timeDependency !== false) {
      errors.push({
        code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE,
        message: 'Comparison trace must declare timeDependency: false.',
        field: 'comparisonTrace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'comparison_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates research comparison input.
 * Pure function. No side effects.
 */
export function validateComparisonInput(
  input: ResearchComparisonInput,
): readonly ResearchComparisonValidationError[] {
  const errors: ResearchComparisonValidationError[] = [];

  if (!input.conceptId || input.conceptId.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_EVIDENCE,
      message: 'Comparison input is missing concept ID.',
      field: 'conceptId',
    });
  }

  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_EVIDENCE,
      message: 'Comparison input is missing concept label.',
      field: 'conceptLabel',
    });
  }

  if (!input.entries || input.entries.length === 0) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_MATRIX,
      message: 'Comparison input has no entries.',
      field: 'entries',
    });
  } else {
    const methodIds = input.entries.map((e) => e.methodReferenceId);
    for (const entry of input.entries) {
      errors.push(...validateComparisonEntry(entry, methodIds));
    }
  }

  if (!input.dimensions || input.dimensions.length === 0) {
    errors.push({
      code: COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_MATRIX,
      message: 'Comparison input has no dimensions.',
      field: 'dimensions',
    });
  } else {
    for (const dimension of input.dimensions) {
      if (!CANONICAL_COMPARISON_DIMENSIONS.includes(dimension)) {
        errors.push({
          code: COMPARISON_VALIDATION_CODES.COMPARISON_UNKNOWN_DIMENSION,
          message: `Comparison input has unknown dimension: "${dimension}".`,
          field: 'dimensions',
          dimension,
        });
      }
    }
  }

  return errors;
}
