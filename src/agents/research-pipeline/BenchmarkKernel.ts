/**
 * NV-1400-D2-OPT-05 — Benchmark Intelligence Orchestration Kernel
 *
 * Deterministic orchestration functions for research benchmark metadata.
 * Produces benchmark registries, benchmarks, and traces.
 *
 * This module never:
 * - Executes benchmarks
 * - Computes scores
 * - Infers rankings
 * - Generates leaderboards
 * - Calls external APIs
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchBenchmark,
  ResearchBenchmarkRegistry,
  ResearchBenchmarkDecision,
  ResearchBenchmarkTrace,
  ResearchBenchmarkInput,
  ResearchArtifactWithBenchmarks,
  ResearchBenchmarkCategory,
  ResearchBenchmarkType,
  ResearchBenchmarkProvenance,
  ResearchGovernanceStatus,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_BENCHMARK_CATEGORIES,
  CANONICAL_BENCHMARK_TYPES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Benchmark Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes benchmark provenance.
 * Pure function. No side effects.
 */
export function composeBenchmarkProvenance(
  benchmarkId: string,
  referenceId: string,
  source: string,
  governanceStatus: ResearchGovernanceStatus,
  benchmarkCategory: ResearchBenchmarkCategory,
  benchmarkType: ResearchBenchmarkType,
  rationale: string,
): ResearchBenchmarkProvenance {
  return {
    benchmarkId,
    referenceId,
    source,
    governanceStatus,
    benchmarkCategory,
    benchmarkType,
    rationale,
  };
}

// ---------------------------------------------------------------------------
// Benchmark Composition
// ---------------------------------------------------------------------------

/**
 * Composes a benchmark.
 * Pure function. No side effects.
 */
export function composeBenchmark(
  benchmarkId: string,
  benchmarkName: string,
  benchmarkCategory: ResearchBenchmarkCategory,
  benchmarkType: ResearchBenchmarkType,
  associatedMethods: readonly string[],
  associatedEvidence: readonly string[],
  officialSource: string,
  governanceStatus: ResearchGovernanceStatus,
  lifecycle: 'active' | 'deprecated' | 'historical',
  rationale: string,
  provenance: ResearchBenchmarkProvenance,
): ResearchBenchmark {
  return {
    benchmarkId,
    benchmarkName,
    benchmarkCategory,
    benchmarkType,
    associatedMethods: [...associatedMethods],
    associatedEvidence: [...associatedEvidence],
    officialSource,
    governanceStatus,
    lifecycle,
    rationale,
    provenance,
  };
}

// ---------------------------------------------------------------------------
// Benchmark Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a benchmark registry from benchmarks.
 * Pure function. No side effects.
 */
export function composeBenchmarkRegistry(
  registryId: string,
  benchmarks: readonly ResearchBenchmark[],
): ResearchBenchmarkRegistry {
  const sortedBenchmarks = _sortBenchmarksDeterministically(benchmarks);

  return {
    registryId,
    benchmarks: [...sortedBenchmarks],
    deterministic: true,
    generatedFrom: 'deterministic_benchmark_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Research Benchmarks Composition
// ---------------------------------------------------------------------------

/**
 * Composes research benchmarks from an input.
 * Pure function. No side effects.
 */
export function composeResearchBenchmarks(
  input: ResearchBenchmarkInput,
): ResearchArtifactWithBenchmarks {
  const decisions = _composeDecisions(input);

  const trace: ResearchBenchmarkTrace = {
    traceId: `_benchmark_trace_${input.conceptId}`,
    benchmarkCount: input.benchmarks.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_benchmark_kernel',
    randomUsed: false,
    timeDependency: false,
  };

  const registry = composeBenchmarkRegistry(
    `_benchmark_registry_${input.conceptId}`,
    input.benchmarks,
  );

  return {
    artifactId: `_benchmark_artifact_${input.conceptId}`,
    artifactType: 'concept',
    benchmarkRegistry: registry,
    benchmarkTrace: trace,
  };
}

/**
 * Composes benchmark decisions from input benchmarks.
 * Pure function. No side effects.
 */
function _composeDecisions(
  input: ResearchBenchmarkInput,
): readonly ResearchBenchmarkDecision[] {
  return input.benchmarks.map((benchmark) => {
    const validationErrors = _validateBenchmarkForDecision(benchmark);
    const validationPassed = validationErrors.length === 0;

    return {
      decisionId: `_decision_${benchmark.benchmarkId}`,
      benchmarkId: benchmark.benchmarkId,
      benchmarkName: benchmark.benchmarkName,
      validationPassed,
      validationErrors,
    };
  });
}

/**
 * Validates a benchmark for decision composition.
 * Returns validation error codes.
 */
function _validateBenchmarkForDecision(benchmark: ResearchBenchmark): readonly string[] {
  const errors: string[] = [];

  if (!benchmark.benchmarkId || benchmark.benchmarkId.trim() === '') {
    errors.push('BENCHMARK_MISSING_SOURCE');
  }

  if (!benchmark.benchmarkName || benchmark.benchmarkName.trim() === '') {
    errors.push('BENCHMARK_MISSING_SOURCE');
  }

  if (!CANONICAL_BENCHMARK_CATEGORIES.includes(benchmark.benchmarkCategory)) {
    errors.push('BENCHMARK_UNKNOWN_CATEGORY');
  }

  if (!CANONICAL_BENCHMARK_TYPES.includes(benchmark.benchmarkType)) {
    errors.push('BENCHMARK_UNKNOWN_TYPE');
  }

  if (!benchmark.associatedMethods || benchmark.associatedMethods.length === 0) {
    errors.push('BENCHMARK_MISSING_METHOD');
  }

  if (!benchmark.associatedEvidence || benchmark.associatedEvidence.length === 0) {
    errors.push('BENCHMARK_MISSING_EVIDENCE');
  }

  if (!benchmark.provenance || !benchmark.provenance.rationale || benchmark.provenance.rationale.trim() === '') {
    errors.push('BENCHMARK_MISSING_PROVENANCE');
  }

  if (!benchmark.governanceStatus || benchmark.governanceStatus.trim() === '') {
    errors.push('BENCHMARK_INVALID_STATUS');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts benchmarks deterministically.
 * Sorting based on benchmarkId for consistent ordering.
 * Pure function. No side effects.
 */
function _sortBenchmarksDeterministically(
  benchmarks: readonly ResearchBenchmark[],
): readonly ResearchBenchmark[] {
  return [...benchmarks].sort((a, b) => a.benchmarkId.localeCompare(b.benchmarkId));
}

// ---------------------------------------------------------------------------
// Benchmark Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a benchmark trace.
 * Pure function. No side effects.
 */
export function composeBenchmarkTrace(
  traceId: string,
  decisions: readonly ResearchBenchmarkDecision[],
): ResearchBenchmarkTrace {
  return {
    traceId,
    benchmarkCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions: [...decisions],
    deterministic: true,
    generatedFrom: 'deterministic_benchmark_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Category and Type Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a benchmark category is supported (in canonical categories).
 */
export function isSupportedBenchmarkCategory(category: string): category is ResearchBenchmarkCategory {
  return CANONICAL_BENCHMARK_CATEGORIES.includes(category as ResearchBenchmarkCategory);
}

/**
 * Checks if a benchmark type is supported (in canonical types).
 */
export function isSupportedBenchmarkType(type: string): type is ResearchBenchmarkType {
  return CANONICAL_BENCHMARK_TYPES.includes(type as ResearchBenchmarkType);
}

/**
 * Returns all canonical benchmark categories.
 */
export function getCanonicalBenchmarkCategories(): readonly ResearchBenchmarkCategory[] {
  return CANONICAL_BENCHMARK_CATEGORIES;
}

/**
 * Returns all canonical benchmark types.
 */
export function getCanonicalBenchmarkTypes(): readonly ResearchBenchmarkType[] {
  return CANONICAL_BENCHMARK_TYPES;
}
