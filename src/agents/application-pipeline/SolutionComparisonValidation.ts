/**
 * NV-1900-D7-OPT-07 — Solution Comparison Validation Layer
 *
 * Deterministic validation for solution comparison metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  EngineeringSolution,
  SolutionComparison,
  AlternativeTechnique,
  ComparisonDimensionEntry,
  SolutionComparisonRegistry,
  SolutionComparisonTrace,
  SolutionComparisonInput,
  SolutionComparisonValidationError,
  SolutionComparisonRegistryValidationResult,
  SolutionComparisonInputValidationResult,
  SolutionComparisonTraceValidationResult,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_SOLUTION_TYPES,
  CANONICAL_COMPARISON_TYPES,
  CANONICAL_ALTERNATIVE_TECHNIQUE_TYPES,
  CANONICAL_COMPARISON_DIMENSIONS,
  CANONICAL_SOLUTION_COMPARISON_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const SOLUTION_COMPARISON_VALIDATION_CODES = {
  SOLUTION_DUPLICATE_ID: 'SOLUTION_DUPLICATE_ID',
  SOLUTION_DUPLICATE_TITLE: 'SOLUTION_DUPLICATE_TITLE',
  COMPARISON_DUPLICATE_ID: 'COMPARISON_DUPLICATE_ID',
  ALTERNATIVE_DUPLICATE_ID: 'ALTERNATIVE_DUPLICATE_ID',
  DIMENSION_DUPLICATE_ID: 'DIMENSION_DUPLICATE_ID',
  SOLUTION_INVALID_TYPE: 'SOLUTION_INVALID_TYPE',
  COMPARISON_INVALID_TYPE: 'COMPARISON_INVALID_TYPE',
  ALTERNATIVE_INVALID_TYPE: 'ALTERNATIVE_INVALID_TYPE',
  DIMENSION_INVALID_TYPE: 'DIMENSION_INVALID_TYPE',
  SOLUTION_INVALID_STATUS: 'SOLUTION_INVALID_STATUS',
  SOLUTION_INVALID_GOVERNANCE: 'SOLUTION_INVALID_GOVERNANCE',
  SOLUTION_MISSING_PROVENANCE: 'SOLUTION_MISSING_PROVENANCE',
  SOLUTION_MISSING_PROVIDER: 'SOLUTION_MISSING_PROVIDER',
  SOLUTION_MISSING_RATIONALE: 'SOLUTION_MISSING_RATIONALE',
  SOLUTION_MISSING_APPLICATION_REFERENCE: 'SOLUTION_MISSING_APPLICATION_REFERENCE',
  SOLUTION_MISSING_KNOWLEDGE_REFERENCE: 'SOLUTION_MISSING_KNOWLEDGE_REFERENCE',
  SOLUTION_MISSING_ARCHITECTURE_REFERENCE: 'SOLUTION_MISSING_ARCHITECTURE_REFERENCE',
  SOLUTION_MISSING_CASE_STUDY_REFERENCE: 'SOLUTION_MISSING_CASE_STUDY_REFERENCE',
  SOLUTION_MISSING_SOLUTION_ID: 'SOLUTION_MISSING_SOLUTION_ID',
  SOLUTION_MISSING_TITLE: 'SOLUTION_MISSING_TITLE',
  SOLUTION_SELF_COMPARISON: 'SOLUTION_SELF_COMPARISON',
  SOLUTION_EMPTY_REGISTRY: 'SOLUTION_EMPTY_REGISTRY',
  SOLUTION_INVALID_TRACE: 'SOLUTION_INVALID_TRACE',
  SOLUTION_REGISTRY_INCONSISTENCY: 'SOLUTION_REGISTRY_INCONSISTENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Solution Validation
// ---------------------------------------------------------------------------

export function validateEngineeringSolution(
  solution: EngineeringSolution,
): readonly SolutionComparisonValidationError[] {
  const errors: SolutionComparisonValidationError[] = [];

  if (!solution.solutionId || solution.solutionId.trim() === '') {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_SOLUTION_ID,
      message: 'Engineering solution is missing a solution ID.',
      field: 'solutionId',
      solutionId: solution.solutionId,
    });
  }

  if (!solution.title || solution.title.trim() === '') {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_TITLE,
      message: 'Engineering solution is missing a title.',
      field: 'title',
      solutionId: solution.solutionId,
    });
  }

  if (!CANONICAL_SOLUTION_TYPES.includes(solution.solutionType)) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_INVALID_TYPE,
      message: `Engineering solution has unsupported type: "${solution.solutionType}".`,
      field: 'solutionType',
      solutionId: solution.solutionId,
    });
  }

  if (!CANONICAL_SOLUTION_COMPARISON_STATUS.includes(solution.status)) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_INVALID_STATUS,
      message: `Engineering solution has unsupported status: "${solution.status}".`,
      field: 'status',
      solutionId: solution.solutionId,
    });
  }

  if (!solution.applicationArtifactId || solution.applicationArtifactId.trim() === '') {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_APPLICATION_REFERENCE,
      message: 'Engineering solution is missing applicationArtifactId.',
      field: 'applicationArtifactId',
      solutionId: solution.solutionId,
    });
  }

  if (!solution.knowledgeArtifactId || solution.knowledgeArtifactId.trim() === '') {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_KNOWLEDGE_REFERENCE,
      message: 'Engineering solution is missing knowledgeArtifactId.',
      field: 'knowledgeArtifactId',
      solutionId: solution.solutionId,
    });
  }

  if (!solution.architectureId || solution.architectureId.trim() === '') {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_ARCHITECTURE_REFERENCE,
      message: 'Engineering solution is missing architectureId.',
      field: 'architectureId',
      solutionId: solution.solutionId,
    });
  }

  if (!solution.caseStudyId || solution.caseStudyId.trim() === '') {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_CASE_STUDY_REFERENCE,
      message: 'Engineering solution is missing caseStudyId.',
      field: 'caseStudyId',
      solutionId: solution.solutionId,
    });
  }

  if (!solution.provenance) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_PROVENANCE,
      message: 'Engineering solution is missing provenance.',
      field: 'provenance',
      solutionId: solution.solutionId,
    });
  } else {
    if (!solution.provenance.providedBy || solution.provenance.providedBy.trim() === '') {
      errors.push({
        code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_PROVIDER,
        message: 'Solution provenance is missing providedBy.',
        field: 'provenance.providedBy',
        solutionId: solution.solutionId,
      });
    }

    if (!solution.provenance.rationale || solution.provenance.rationale.trim() === '') {
      errors.push({
        code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_RATIONALE,
        message: 'Solution provenance is missing rationale.',
        field: 'provenance.rationale',
        solutionId: solution.solutionId,
      });
    }

    if (!CANONICAL_APPLICATION_GOVERNANCE.includes(solution.provenance.governanceStatus)) {
      errors.push({
        code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_INVALID_GOVERNANCE,
        message: `Solution provenance has invalid governance status: "${solution.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        solutionId: solution.solutionId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Solution Comparison Validation
// ---------------------------------------------------------------------------

export function validateSolutionComparison(
  comparison: SolutionComparison,
  allSolutionIds: readonly string[],
): readonly SolutionComparisonValidationError[] {
  const errors: SolutionComparisonValidationError[] = [];

  if (!comparison.comparisonId || comparison.comparisonId.trim() === '') {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_ID,
      message: 'Solution comparison is missing a comparison ID.',
      field: 'comparisonId',
      comparisonId: comparison.comparisonId,
    });
  }

  if (!CANONICAL_COMPARISON_TYPES.includes(comparison.comparisonType)) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TYPE,
      message: `Solution comparison has unsupported type: "${comparison.comparisonType}".`,
      field: 'comparisonType',
      comparisonId: comparison.comparisonId,
    });
  }

  if (comparison.sourceSolutionId === comparison.targetSolutionId) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_SELF_COMPARISON,
      message: `Solution comparison references itself: "${comparison.sourceSolutionId}".`,
      field: 'sourceSolutionId',
      comparisonId: comparison.comparisonId,
    });
  }

  if (comparison.sourceSolutionId && !allSolutionIds.includes(comparison.sourceSolutionId)) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_ID,
      message: `Solution comparison references unknown source: "${comparison.sourceSolutionId}".`,
      field: 'sourceSolutionId',
      comparisonId: comparison.comparisonId,
    });
  }

  if (comparison.targetSolutionId && !allSolutionIds.includes(comparison.targetSolutionId)) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_ID,
      message: `Solution comparison references unknown target: "${comparison.targetSolutionId}".`,
      field: 'targetSolutionId',
      comparisonId: comparison.comparisonId,
    });
  }

  if (!comparison.provenance) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_PROVENANCE,
      message: 'Solution comparison is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Alternative Technique Validation
// ---------------------------------------------------------------------------

export function validateAlternativeTechnique(
  alternative: AlternativeTechnique,
): readonly SolutionComparisonValidationError[] {
  const errors: SolutionComparisonValidationError[] = [];

  if (!alternative.alternativeId || alternative.alternativeId.trim() === '') {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.ALTERNATIVE_DUPLICATE_ID,
      message: 'Alternative technique is missing an alternative ID.',
      field: 'alternativeId',
      alternativeId: alternative.alternativeId,
    });
  }

  if (!CANONICAL_ALTERNATIVE_TECHNIQUE_TYPES.includes(alternative.alternativeType)) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.ALTERNATIVE_INVALID_TYPE,
      message: `Alternative technique has unsupported type: "${alternative.alternativeType}".`,
      field: 'alternativeType',
      alternativeId: alternative.alternativeId,
    });
  }

  if (!alternative.provenance) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_PROVENANCE,
      message: 'Alternative technique is missing provenance.',
      field: 'provenance',
      alternativeId: alternative.alternativeId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Comparison Dimension Validation
// ---------------------------------------------------------------------------

export function validateComparisonDimension(
  dimension: ComparisonDimensionEntry,
): readonly SolutionComparisonValidationError[] {
  const errors: SolutionComparisonValidationError[] = [];

  if (!dimension.dimensionId || dimension.dimensionId.trim() === '') {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.DIMENSION_DUPLICATE_ID,
      message: 'Comparison dimension is missing a dimension ID.',
      field: 'dimensionId',
      dimensionId: dimension.dimensionId,
    });
  }

  if (!CANONICAL_COMPARISON_DIMENSIONS.includes(dimension.dimension)) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.DIMENSION_INVALID_TYPE,
      message: `Comparison dimension has unsupported dimension: "${dimension.dimension}".`,
      field: 'dimension',
      dimensionId: dimension.dimensionId,
    });
  }

  if (!dimension.provenance) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_PROVENANCE,
      message: 'Comparison dimension is missing provenance.',
      field: 'provenance',
      dimensionId: dimension.dimensionId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Solution Comparison Registry Validation
// ---------------------------------------------------------------------------

export function validateSolutionComparisonRegistry(
  registry: SolutionComparisonRegistry,
): SolutionComparisonRegistryValidationResult {
  const errors: SolutionComparisonValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.solutions || registry.solutions.length === 0) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_EMPTY_REGISTRY,
      message: 'Registry has no solutions.',
      field: 'solutions',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Duplicate solution IDs
  const seenSolIds = new Set<string>();
  for (const sol of registry.solutions) {
    if (seenSolIds.has(sol.solutionId)) {
      errors.push({
        code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_DUPLICATE_ID,
        message: `Duplicate solution ID: "${sol.solutionId}".`,
        solutionId: sol.solutionId,
      });
    }
    seenSolIds.add(sol.solutionId);
  }

  // Duplicate solution titles
  const seenSolTitles = new Set<string>();
  for (const sol of registry.solutions) {
    if (seenSolTitles.has(sol.title)) {
      errors.push({
        code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_DUPLICATE_TITLE,
        message: `Duplicate solution title: "${sol.title}".`,
        field: 'title',
        solutionId: sol.solutionId,
      });
    }
    seenSolTitles.add(sol.title);
  }

  // Duplicate comparison IDs
  const seenCompIds = new Set<string>();
  for (const comp of registry.comparisons) {
    if (seenCompIds.has(comp.comparisonId)) {
      errors.push({
        code: SOLUTION_COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_ID,
        message: `Duplicate comparison ID: "${comp.comparisonId}".`,
        comparisonId: comp.comparisonId,
      });
    }
    seenCompIds.add(comp.comparisonId);
  }

  // Duplicate alternative IDs
  const seenAltIds = new Set<string>();
  for (const alt of registry.alternatives) {
    if (seenAltIds.has(alt.alternativeId)) {
      errors.push({
        code: SOLUTION_COMPARISON_VALIDATION_CODES.ALTERNATIVE_DUPLICATE_ID,
        message: `Duplicate alternative ID: "${alt.alternativeId}".`,
        alternativeId: alt.alternativeId,
      });
    }
    seenAltIds.add(alt.alternativeId);
  }

  // Duplicate dimension IDs
  const seenDimIds = new Set<string>();
  for (const dim of registry.dimensions) {
    if (seenDimIds.has(dim.dimensionId)) {
      errors.push({
        code: SOLUTION_COMPARISON_VALIDATION_CODES.DIMENSION_DUPLICATE_ID,
        message: `Duplicate dimension ID: "${dim.dimensionId}".`,
        dimensionId: dim.dimensionId,
      });
    }
    seenDimIds.add(dim.dimensionId);
  }

  // Validate each solution
  for (const sol of registry.solutions) {
    errors.push(...validateEngineeringSolution(sol));
  }

  // Validate each comparison
  const allSolutionIds = registry.solutions.map((s) => s.solutionId);
  for (const comp of registry.comparisons) {
    errors.push(...validateSolutionComparison(comp, allSolutionIds));
  }

  // Validate each alternative
  for (const alt of registry.alternatives) {
    errors.push(...validateAlternativeTechnique(alt));
  }

  // Validate each dimension
  for (const dim of registry.dimensions) {
    errors.push(...validateComparisonDimension(dim));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'solution_comparison_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Solution Comparison Input Validation
// ---------------------------------------------------------------------------

export function validateSolutionComparisonInput(
  input: SolutionComparisonInput,
): SolutionComparisonInputValidationResult {
  const errors: SolutionComparisonValidationError[] = [];

  if (!input.solutions || input.solutions.length === 0) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_EMPTY_REGISTRY,
      message: 'Input has no solutions.',
      field: 'solutions',
    });
  } else {
    for (const sol of input.solutions) {
      errors.push(...validateEngineeringSolution(sol));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'solution_comparison_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Solution Comparison Trace Validation
// ---------------------------------------------------------------------------

export function validateSolutionComparisonTrace(
  trace: SolutionComparisonTrace,
): SolutionComparisonTraceValidationResult {
  const errors: SolutionComparisonValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_INVALID_TRACE,
      message: 'Solution comparison trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_INVALID_TRACE,
      message: 'Solution comparison trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_INVALID_TRACE,
      message: 'Solution comparison trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_INVALID_TRACE,
      message: 'Solution comparison trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'solution_comparison_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Solution Comparisons Validation
// ---------------------------------------------------------------------------

export function validateApplicationArtifactWithSolutionComparisons(
  registry: SolutionComparisonRegistry,
): readonly SolutionComparisonValidationError[] {
  const errors: SolutionComparisonValidationError[] = [];
  const registryResult = validateSolutionComparisonRegistry(registry);
  errors.push(...registryResult.errors);
  return errors;
}
