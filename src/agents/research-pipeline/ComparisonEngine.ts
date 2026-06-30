/**
 * NV-1400-D2-OPT-03 — Structured Method Comparison Engine
 *
 * Deterministic orchestration functions for research comparison metadata.
 * Produces comparison matrices, entries, and traces.
 *
 * This module never:
 * - Recommends methods
 * - Ranks methods
 * - Infers superiority
 * - Estimates performance
 * - Generates educational explanations
 * - Retrieves publications
 * - Summarizes papers
 * - Executes benchmarks
 * - Modifies evidence
 * - Modifies lineage
 * - Calls external APIs
 * - Uses LLMs
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchComparisonEntry,
  ResearchComparisonMatrix,
  ResearchComparisonDecision,
  ResearchComparisonTrace,
  ResearchComparisonInput,
  ResearchArtifactWithComparison,
  ResearchComparisonDimension,
  ResearchComparisonAttribute,
  ResearchComparisonValue,
  ResearchComparisonProvenance,
  ResearchGovernanceStatus,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_COMPARISON_DIMENSIONS,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Comparison Attribute Composition
// ---------------------------------------------------------------------------

/**
 * Composes a comparison attribute.
 * Pure function. No side effects.
 */
export function composeComparisonAttribute(
  attributeId: string,
  dimension: ResearchComparisonDimension,
  value: string,
  evidenceReferenceId: string,
  governanceStatus: ResearchGovernanceStatus,
): ResearchComparisonAttribute {
  return {
    attributeId,
    dimension,
    value,
    evidenceReferenceId,
    governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Comparison Value Composition
// ---------------------------------------------------------------------------

/**
 * Composes a comparison value.
 * Pure function. No side effects.
 */
export function composeComparisonValue(
  dimension: ResearchComparisonDimension,
  attributes: readonly ResearchComparisonAttribute[],
): ResearchComparisonValue {
  return {
    dimension,
    attributes: [...attributes],
  };
}

// ---------------------------------------------------------------------------
// Comparison Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes comparison provenance.
 * Pure function. No side effects.
 */
export function composeComparisonProvenance(
  methodReferenceId: string,
  evidenceReferenceId: string,
  lineageReferenceId: string,
  comparisonDimension: ResearchComparisonDimension,
  source: string,
  governanceStatus: ResearchGovernanceStatus,
  rationale: string,
): ResearchComparisonProvenance {
  return {
    methodReferenceId,
    evidenceReferenceId,
    lineageReferenceId,
    comparisonDimension,
    source,
    governanceStatus,
    rationale,
  };
}

// ---------------------------------------------------------------------------
// Comparison Entry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a comparison entry.
 * Pure function. No side effects.
 */
export function composeComparisonEntry(
  entryId: string,
  methodReferenceId: string,
  methodTitle: string,
  evidenceReferenceId: string,
  lineageReferenceId: string,
  comparisonValues: readonly ResearchComparisonValue[],
  provenance: ResearchComparisonProvenance,
  governanceStatus: ResearchGovernanceStatus,
): ResearchComparisonEntry {
  return {
    entryId,
    methodReferenceId,
    methodTitle,
    evidenceReferenceId,
    lineageReferenceId,
    comparisonValues: [...comparisonValues],
    provenance,
    governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Comparison Matrix Composition
// ---------------------------------------------------------------------------

/**
 * Composes a comparison matrix from entries and dimensions.
 * Pure function. No side effects.
 */
export function composeComparisonMatrix(
  matrixId: string,
  methods: readonly string[],
  dimensions: readonly ResearchComparisonDimension[],
  entries: readonly ResearchComparisonEntry[],
): ResearchComparisonMatrix {
  return {
    matrixId,
    methods: [...methods],
    dimensions: [...dimensions],
    entries: [...entries],
    deterministic: true,
    generatedFrom: 'deterministic_comparison_engine',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Research Comparison Composition
// ---------------------------------------------------------------------------

/**
 * Composes research comparison from an input.
 * Pure function. No side effects.
 */
export function composeResearchComparison(
  input: ResearchComparisonInput,
): ResearchArtifactWithComparison {
  const decisions = _composeDecisions(input);

  const trace: ResearchComparisonTrace = {
    traceId: `_comparison_trace_${input.conceptId}`,
    methodCount: _extractUniqueMethodCount(input.entries),
    dimensionCount: input.dimensions.length,
    entryCount: input.entries.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_comparison_engine',
    randomUsed: false,
    timeDependency: false,
  };

  const methods = _extractUniqueMethods(input.entries);
  const matrix = composeComparisonMatrix(
    `_comparison_matrix_${input.conceptId}`,
    methods,
    input.dimensions,
    input.entries,
  );

  return {
    artifactId: `_comparison_artifact_${input.conceptId}`,
    artifactType: 'concept',
    comparisonMatrix: matrix,
    comparisonTrace: trace,
  };
}

/**
 * Composes comparison decisions from input entries.
 * Pure function. No side effects.
 */
function _composeDecisions(
  input: ResearchComparisonInput,
): readonly ResearchComparisonDecision[] {
  const decisions: ResearchComparisonDecision[] = [];

  for (const entry of input.entries) {
    for (const value of entry.comparisonValues) {
      const validationErrors = _validateEntryForDecision(entry, value.dimension);
      const validationPassed = validationErrors.length === 0;

      decisions.push({
        decisionId: `_decision_${entry.entryId}_${value.dimension}`,
        methodReferenceId: entry.methodReferenceId,
        comparisonDimension: value.dimension,
        validationPassed,
        validationErrors,
      });
    }
  }

  return decisions;
}

/**
 * Validates an entry for decision composition.
 * Returns validation error codes.
 */
function _validateEntryForDecision(
  entry: ResearchComparisonEntry,
  dimension: ResearchComparisonDimension,
): readonly string[] {
  const errors: string[] = [];

  if (!CANONICAL_COMPARISON_DIMENSIONS.includes(dimension)) {
    errors.push('COMPARISON_UNKNOWN_DIMENSION');
  }

  if (!entry.methodReferenceId || entry.methodReferenceId.trim() === '') {
    errors.push('COMPARISON_MISSING_EVIDENCE');
  }

  if (!entry.evidenceReferenceId || entry.evidenceReferenceId.trim() === '') {
    errors.push('COMPARISON_MISSING_EVIDENCE');
  }

  if (!entry.lineageReferenceId || entry.lineageReferenceId.trim() === '') {
    errors.push('COMPARISON_MISSING_EVIDENCE');
  }

  if (!entry.provenance || !entry.provenance.rationale || entry.provenance.rationale.trim() === '') {
    errors.push('COMPARISON_MISSING_PROVENANCE');
  }

  if (!entry.governanceStatus || entry.governanceStatus.trim() === '') {
    errors.push('COMPARISON_INVALID_STATUS');
  }

  return errors;
}

/**
 * Extracts unique method reference IDs from entries.
 * Pure function. No side effects.
 */
function _extractUniqueMethods(entries: readonly ResearchComparisonEntry[]): readonly string[] {
  const seen = new Set<string>();
  const methods: string[] = [];

  for (const entry of entries) {
    if (!seen.has(entry.methodReferenceId)) {
      seen.add(entry.methodReferenceId);
      methods.push(entry.methodReferenceId);
    }
  }

  return methods;
}

/**
 * Extracts unique method count from entries.
 * Pure function. No side effects.
 */
function _extractUniqueMethodCount(entries: readonly ResearchComparisonEntry[]): number {
  return _extractUniqueMethods(entries).length;
}

// ---------------------------------------------------------------------------
// Comparison Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a comparison trace.
 * Pure function. No side effects.
 */
export function composeComparisonTrace(
  traceId: string,
  methodCount: number,
  dimensionCount: number,
  decisions: readonly ResearchComparisonDecision[],
): ResearchComparisonTrace {
  return {
    traceId,
    methodCount,
    dimensionCount,
    entryCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions: [...decisions],
    deterministic: true,
    generatedFrom: 'deterministic_comparison_engine',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Dimension Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a comparison dimension is supported (in canonical dimensions).
 */
export function isSupportedComparisonDimension(dimension: string): dimension is ResearchComparisonDimension {
  return CANONICAL_COMPARISON_DIMENSIONS.includes(dimension as ResearchComparisonDimension);
}

/**
 * Returns all canonical comparison dimensions.
 */
export function getCanonicalComparisonDimensions(): readonly ResearchComparisonDimension[] {
  return CANONICAL_COMPARISON_DIMENSIONS;
}
