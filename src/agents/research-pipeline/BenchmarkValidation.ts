/**
 * NV-1400-D2-OPT-05 — Benchmark Validation Layer
 *
 * Deterministic validation for research benchmark metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchBenchmark,
  ResearchBenchmarkRegistry,
  ResearchArtifactWithBenchmarks,
  ResearchBenchmarkValidationError,
  ResearchBenchmarkValidationResult,
  ResearchBenchmarkInput,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_BENCHMARK_CATEGORIES,
  CANONICAL_BENCHMARK_TYPES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const BENCHMARK_VALIDATION_CODES = {
  BENCHMARK_UNKNOWN_CATEGORY: 'BENCHMARK_UNKNOWN_CATEGORY',
  BENCHMARK_UNKNOWN_TYPE: 'BENCHMARK_UNKNOWN_TYPE',
  BENCHMARK_DUPLICATE_ID: 'BENCHMARK_DUPLICATE_ID',
  BENCHMARK_DUPLICATE_NAME: 'BENCHMARK_DUPLICATE_NAME',
  BENCHMARK_MISSING_SOURCE: 'BENCHMARK_MISSING_SOURCE',
  BENCHMARK_MISSING_PROVENANCE: 'BENCHMARK_MISSING_PROVENANCE',
  BENCHMARK_MISSING_EVIDENCE: 'BENCHMARK_MISSING_EVIDENCE',
  BENCHMARK_MISSING_METHOD: 'BENCHMARK_MISSING_METHOD',
  BENCHMARK_INVALID_STATUS: 'BENCHMARK_INVALID_STATUS',
  BENCHMARK_INVALID_REFERENCE: 'BENCHMARK_INVALID_REFERENCE',
  BENCHMARK_EMPTY_REGISTRY: 'BENCHMARK_EMPTY_REGISTRY',
} as const;

// ---------------------------------------------------------------------------
// Benchmark Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single benchmark.
 * Pure function. No side effects.
 */
export function validateBenchmark(
  benchmark: ResearchBenchmark,
): readonly ResearchBenchmarkValidationError[] {
  const errors: ResearchBenchmarkValidationError[] = [];

  if (!benchmark.benchmarkId || benchmark.benchmarkId.trim() === '') {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_SOURCE,
      message: 'Benchmark is missing an ID.',
      field: 'benchmarkId',
      benchmarkId: benchmark.benchmarkId,
    });
  }

  if (!benchmark.benchmarkName || benchmark.benchmarkName.trim() === '') {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_SOURCE,
      message: 'Benchmark is missing a name.',
      field: 'benchmarkName',
      benchmarkId: benchmark.benchmarkId,
    });
  }

  if (!CANONICAL_BENCHMARK_CATEGORIES.includes(benchmark.benchmarkCategory)) {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_UNKNOWN_CATEGORY,
      message: `Benchmark has unknown category: "${benchmark.benchmarkCategory}".`,
      field: 'benchmarkCategory',
      benchmarkId: benchmark.benchmarkId,
    });
  }

  if (!CANONICAL_BENCHMARK_TYPES.includes(benchmark.benchmarkType)) {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_UNKNOWN_TYPE,
      message: `Benchmark has unknown type: "${benchmark.benchmarkType}".`,
      field: 'benchmarkType',
      benchmarkId: benchmark.benchmarkId,
    });
  }

  if (!benchmark.associatedMethods || benchmark.associatedMethods.length === 0) {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_METHOD,
      message: 'Benchmark has no associated methods.',
      field: 'associatedMethods',
      benchmarkId: benchmark.benchmarkId,
    });
  }

  if (!benchmark.associatedEvidence || benchmark.associatedEvidence.length === 0) {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_EVIDENCE,
      message: 'Benchmark has no associated evidence.',
      field: 'associatedEvidence',
      benchmarkId: benchmark.benchmarkId,
    });
  }

  if (!benchmark.officialSource || benchmark.officialSource.trim() === '') {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_SOURCE,
      message: 'Benchmark is missing an official source.',
      field: 'officialSource',
      benchmarkId: benchmark.benchmarkId,
    });
  }

  if (!benchmark.rationale || benchmark.rationale.trim() === '') {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_SOURCE,
      message: 'Benchmark is missing a rationale.',
      field: 'rationale',
      benchmarkId: benchmark.benchmarkId,
    });
  }

  if (!benchmark.provenance || typeof benchmark.provenance !== 'object') {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_PROVENANCE,
      message: 'Benchmark is missing provenance.',
      field: 'provenance',
      benchmarkId: benchmark.benchmarkId,
    });
  } else {
    if (!benchmark.provenance.rationale || benchmark.provenance.rationale.trim() === '') {
      errors.push({
        code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_PROVENANCE,
        message: 'Benchmark provenance is missing rationale.',
        field: 'provenance.rationale',
        benchmarkId: benchmark.benchmarkId,
      });
    }
    if (!benchmark.provenance.source || benchmark.provenance.source.trim() === '') {
      errors.push({
        code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_PROVENANCE,
        message: 'Benchmark provenance is missing source.',
        field: 'provenance.source',
        benchmarkId: benchmark.benchmarkId,
      });
    }
  }

  if (!benchmark.governanceStatus || benchmark.governanceStatus.trim() === '') {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_INVALID_STATUS,
      message: 'Benchmark is missing governance status.',
      field: 'governanceStatus',
      benchmarkId: benchmark.benchmarkId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a benchmark registry for structural integrity.
 * Pure function. No side effects.
 */
export function validateBenchmarkRegistry(
  registry: ResearchBenchmarkRegistry,
): readonly ResearchBenchmarkValidationError[] {
  const errors: ResearchBenchmarkValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_SOURCE,
      message: 'Benchmark registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  // Check for empty registry
  if (!registry.benchmarks || registry.benchmarks.length === 0) {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_EMPTY_REGISTRY,
      message: 'Benchmark registry has no benchmarks.',
      field: 'benchmarks',
    });
  }

  // Validate all benchmarks
  if (registry.benchmarks) {
    for (const benchmark of registry.benchmarks) {
      errors.push(...validateBenchmark(benchmark));
    }
  }

  // Check for duplicate IDs
  if (registry.benchmarks) {
    const seenIds = new Set<string>();
    for (const benchmark of registry.benchmarks) {
      if (seenIds.has(benchmark.benchmarkId)) {
        errors.push({
          code: BENCHMARK_VALIDATION_CODES.BENCHMARK_DUPLICATE_ID,
          message: `Duplicate benchmark ID: "${benchmark.benchmarkId}".`,
          benchmarkId: benchmark.benchmarkId,
        });
      }
      seenIds.add(benchmark.benchmarkId);
    }
  }

  // Check for duplicate names
  if (registry.benchmarks) {
    const seenNames = new Set<string>();
    for (const benchmark of registry.benchmarks) {
      if (seenNames.has(benchmark.benchmarkName)) {
        errors.push({
          code: BENCHMARK_VALIDATION_CODES.BENCHMARK_DUPLICATE_NAME,
          message: `Duplicate benchmark name: "${benchmark.benchmarkName}".`,
          benchmarkId: benchmark.benchmarkId,
        });
      }
      seenNames.add(benchmark.benchmarkName);
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a research artifact with benchmarks.
 * Pure function. No side effects.
 */
export function validateResearchArtifactWithBenchmarks(
  artifact: ResearchArtifactWithBenchmarks,
): ResearchBenchmarkValidationResult {
  const errors: ResearchBenchmarkValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_SOURCE,
      message: 'Research artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate benchmark registry
  errors.push(...validateBenchmarkRegistry(artifact.benchmarkRegistry));

  // Validate trace
  if (!artifact.benchmarkTrace || typeof artifact.benchmarkTrace !== 'object') {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_PROVENANCE,
      message: 'Research artifact is missing benchmark trace.',
      field: 'benchmarkTrace',
    });
  } else {
    if (artifact.benchmarkTrace.deterministic !== true) {
      errors.push({
        code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_PROVENANCE,
        message: 'Benchmark trace must declare deterministic: true.',
        field: 'benchmarkTrace.deterministic',
      });
    }
    if (artifact.benchmarkTrace.randomUsed !== false) {
      errors.push({
        code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_PROVENANCE,
        message: 'Benchmark trace must declare randomUsed: false.',
        field: 'benchmarkTrace.randomUsed',
      });
    }
    if (artifact.benchmarkTrace.timeDependency !== false) {
      errors.push({
        code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_PROVENANCE,
        message: 'Benchmark trace must declare timeDependency: false.',
        field: 'benchmarkTrace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'benchmark_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates research benchmark input.
 * Pure function. No side effects.
 */
export function validateBenchmarkInput(
  input: ResearchBenchmarkInput,
): readonly ResearchBenchmarkValidationError[] {
  const errors: ResearchBenchmarkValidationError[] = [];

  if (!input.conceptId || input.conceptId.trim() === '') {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_SOURCE,
      message: 'Benchmark input is missing concept ID.',
      field: 'conceptId',
    });
  }

  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_SOURCE,
      message: 'Benchmark input is missing concept label.',
      field: 'conceptLabel',
    });
  }

  if (!input.benchmarks || input.benchmarks.length === 0) {
    errors.push({
      code: BENCHMARK_VALIDATION_CODES.BENCHMARK_EMPTY_REGISTRY,
      message: 'Benchmark input has no benchmarks.',
      field: 'benchmarks',
    });
  } else {
    for (const benchmark of input.benchmarks) {
      errors.push(...validateBenchmark(benchmark));
    }
  }

  return errors;
}
