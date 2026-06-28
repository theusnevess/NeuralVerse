/**
 * NV-1900-D7-OPT-07 — Solution Comparison & Alternative Technique Mapping Kernel
 *
 * Deterministic orchestration functions for solution comparison metadata.
 * Produces solutions, comparisons, alternatives, dimensions, traces, and registries.
 *
 * This module never:
 * - Recommends solutions
 * - Ranks alternatives
 * - Computes benchmark results
 * - Determines which solution is superior
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Solution comparison metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  EngineeringSolution,
  SolutionComparisonProvenance,
  SolutionComparison,
  AlternativeTechnique,
  ComparisonDimensionEntry,
  SolutionComparisonDecision,
  SolutionComparisonTrace,
  SolutionComparisonRegistry,
  SolutionComparisonRegistryMetadata,
  SolutionComparisonInput,
  SolutionType,
  ComparisonType,
  AlternativeTechniqueType,
  ComparisonDimension,
  SolutionComparisonStatus,
  ApplicationGovernanceStatus,
  ApplicationNode,
  ApplicationArtifactWithSolutionComparisons,
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
// Solution Comparison Provenance Composition
// ---------------------------------------------------------------------------

export function composeSolutionComparisonProvenance(params: {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}): SolutionComparisonProvenance {
  return {
    providedBy: params.providedBy,
    rationale: params.rationale,
    reviewedBy: params.reviewedBy,
    reviewDate: params.reviewDate,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Engineering Solution Composition
// ---------------------------------------------------------------------------

export function composeEngineeringSolution(params: {
  readonly solutionId: string;
  readonly title: string;
  readonly description: string;
  readonly solutionType: SolutionType;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly architectureId: string;
  readonly caseStudyId: string;
  readonly status: SolutionComparisonStatus;
  readonly provenance: SolutionComparisonProvenance;
}): EngineeringSolution {
  return {
    solutionId: params.solutionId,
    title: params.title,
    description: params.description,
    solutionType: params.solutionType,
    applicationArtifactId: params.applicationArtifactId,
    knowledgeArtifactId: params.knowledgeArtifactId,
    architectureId: params.architectureId,
    caseStudyId: params.caseStudyId,
    status: params.status,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Solution Comparison Composition
// ---------------------------------------------------------------------------

export function composeSolutionComparison(params: {
  readonly comparisonId: string;
  readonly sourceSolutionId: string;
  readonly targetSolutionId: string;
  readonly comparisonType: ComparisonType;
  readonly description: string;
  readonly provenance: SolutionComparisonProvenance;
}): SolutionComparison {
  return {
    comparisonId: params.comparisonId,
    sourceSolutionId: params.sourceSolutionId,
    targetSolutionId: params.targetSolutionId,
    comparisonType: params.comparisonType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Alternative Technique Composition
// ---------------------------------------------------------------------------

export function composeAlternativeTechnique(params: {
  readonly alternativeId: string;
  readonly solutionId: string;
  readonly alternativeType: AlternativeTechniqueType;
  readonly description: string;
  readonly relatedKnowledgeArtifactId: string;
  readonly provenance: SolutionComparisonProvenance;
}): AlternativeTechnique {
  return {
    alternativeId: params.alternativeId,
    solutionId: params.solutionId,
    alternativeType: params.alternativeType,
    description: params.description,
    relatedKnowledgeArtifactId: params.relatedKnowledgeArtifactId,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Comparison Dimension Composition
// ---------------------------------------------------------------------------

export function composeComparisonDimension(params: {
  readonly dimensionId: string;
  readonly comparisonId: string;
  readonly dimension: ComparisonDimension;
  readonly description: string;
  readonly provenance: SolutionComparisonProvenance;
}): ComparisonDimensionEntry {
  return {
    dimensionId: params.dimensionId,
    comparisonId: params.comparisonId,
    dimension: params.dimension,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Solution Comparison Decision Composition
// ---------------------------------------------------------------------------

function _composeSolutionComparisonDecision(
  solutionId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): SolutionComparisonDecision {
  return {
    decisionId: `_decision_${solutionId}`,
    solutionId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Solution Comparison Trace Composition
// ---------------------------------------------------------------------------

export function composeSolutionComparisonTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly SolutionComparisonDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): SolutionComparisonTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_solution_comparison_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

function _compareSolution(
  a: EngineeringSolution,
  b: EngineeringSolution,
): number {
  if (a.solutionId < b.solutionId) return -1;
  if (a.solutionId > b.solutionId) return 1;
  if (a.solutionType < b.solutionType) return -1;
  if (a.solutionType > b.solutionType) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareComparison(
  a: SolutionComparison,
  b: SolutionComparison,
): number {
  if (a.comparisonId < b.comparisonId) return -1;
  if (a.comparisonId > b.comparisonId) return 1;
  if (a.comparisonType < b.comparisonType) return -1;
  if (a.comparisonType > b.comparisonType) return 1;
  return 0;
}

function _compareAlternative(
  a: AlternativeTechnique,
  b: AlternativeTechnique,
): number {
  if (a.solutionId < b.solutionId) return -1;
  if (a.solutionId > b.solutionId) return 1;
  if (a.alternativeType < b.alternativeType) return -1;
  if (a.alternativeType > b.alternativeType) return 1;
  if (a.alternativeId < b.alternativeId) return -1;
  if (a.alternativeId > b.alternativeId) return 1;
  return 0;
}

function _compareDimensionEntry(
  a: ComparisonDimensionEntry,
  b: ComparisonDimensionEntry,
): number {
  if (a.comparisonId < b.comparisonId) return -1;
  if (a.comparisonId > b.comparisonId) return 1;
  if (a.dimension < b.dimension) return -1;
  if (a.dimension > b.dimension) return 1;
  if (a.dimensionId < b.dimensionId) return -1;
  if (a.dimensionId > b.dimensionId) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Solution Comparison Registry Composition
// ---------------------------------------------------------------------------

export function composeSolutionComparisonRegistry(
  solutions: readonly EngineeringSolution[],
  comparisons: readonly SolutionComparison[],
  alternatives: readonly AlternativeTechnique[],
  dimensions: readonly ComparisonDimensionEntry[],
): SolutionComparisonRegistry {
  const sortedSolutions = [...solutions].sort(_compareSolution);
  const sortedComparisons = [...comparisons].sort(_compareComparison);
  const sortedAlternatives = [...alternatives].sort(_compareAlternative);
  const sortedDimensions = [...dimensions].sort(_compareDimensionEntry);

  const types = new Set(sortedSolutions.map((s) => s.solutionType));

  const metadata: SolutionComparisonRegistryMetadata = {
    registryId: `_registry_${sortedSolutions.length}_${sortedComparisons.length}_${sortedAlternatives.length}_${sortedDimensions.length}`,
    solutionCount: sortedSolutions.length,
    comparisonCount: sortedComparisons.length,
    alternativeCount: sortedAlternatives.length,
    dimensionCount: sortedDimensions.length,
    typeCount: types.size,
  };

  return {
    registryId: metadata.registryId,
    solutions: sortedSolutions,
    comparisons: sortedComparisons,
    alternatives: sortedAlternatives,
    dimensions: sortedDimensions,
    metadata,
    trace: {
      traceId: `_trace_${sortedSolutions.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_solution_comparison_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_solution_comparison_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Solution Comparison Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeSolutionComparisonRegistryFromInput(
  input: SolutionComparisonInput,
): SolutionComparisonRegistry {
  return composeSolutionComparisonRegistry(
    input.solutions,
    input.comparisons,
    input.alternatives,
    input.dimensions,
  );
}

// ---------------------------------------------------------------------------
// Solution Comparison Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeSolutionComparisons(
  input: SolutionComparisonInput,
): SolutionComparisonRegistry {
  const decisions = input.solutions.map((solution) => {
    const errors = _validateSolutionForDecision(solution);
    return _composeSolutionComparisonDecision(solution.solutionId, errors.length === 0, errors);
  });

  const registry = composeSolutionComparisonRegistry(
    input.solutions,
    input.comparisons,
    input.alternatives,
    input.dimensions,
  );

  return {
    ...registry,
    trace: composeSolutionComparisonTrace({
      traceId: `_trace_${input.solutions.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Solution Comparisons Composition
// ---------------------------------------------------------------------------

export function composeApplicationArtifactWithSolutionComparisons(params: {
  readonly applicationNode: ApplicationNode;
  readonly solutionComparisonRegistry: SolutionComparisonRegistry;
}): ApplicationArtifactWithSolutionComparisons {
  return {
    applicationNode: { ...params.applicationNode },
    solutionComparisonRegistry: { ...params.solutionComparisonRegistry },
    deterministic: true,
    generatedFrom: 'deterministic_solution_comparison_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Solution Comparison Decision Validation
// ---------------------------------------------------------------------------

function _validateSolutionForDecision(
  solution: EngineeringSolution,
): readonly string[] {
  const errors: string[] = [];

  if (!solution.solutionId || solution.solutionId.trim() === '') {
    errors.push('SOLUTION_MISSING_SOLUTION_ID');
  }

  if (!solution.title || solution.title.trim() === '') {
    errors.push('SOLUTION_MISSING_TITLE');
  }

  if (!CANONICAL_SOLUTION_TYPES.includes(solution.solutionType)) {
    errors.push('SOLUTION_INVALID_TYPE');
  }

  if (!CANONICAL_SOLUTION_COMPARISON_STATUS.includes(solution.status)) {
    errors.push('SOLUTION_INVALID_STATUS');
  }

  if (!solution.provenance) {
    errors.push('SOLUTION_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedSolutionType(
  solutionType: string,
): solutionType is SolutionType {
  return CANONICAL_SOLUTION_TYPES.includes(solutionType as SolutionType);
}

export function isSupportedComparisonType(
  comparisonType: string,
): comparisonType is ComparisonType {
  return CANONICAL_COMPARISON_TYPES.includes(comparisonType as ComparisonType);
}

export function isSupportedAlternativeTechniqueType(
  alternativeType: string,
): alternativeType is AlternativeTechniqueType {
  return CANONICAL_ALTERNATIVE_TECHNIQUE_TYPES.includes(alternativeType as AlternativeTechniqueType);
}

export function isSupportedComparisonDimension(
  dimension: string,
): dimension is ComparisonDimension {
  return CANONICAL_COMPARISON_DIMENSIONS.includes(dimension as ComparisonDimension);
}

export function isSupportedSolutionComparisonStatus(
  status: string,
): status is SolutionComparisonStatus {
  return CANONICAL_SOLUTION_COMPARISON_STATUS.includes(status as SolutionComparisonStatus);
}

export function isSupportedSolutionComparisonGovernance(
  governanceStatus: string,
): governanceStatus is ApplicationGovernanceStatus {
  return CANONICAL_APPLICATION_GOVERNANCE.includes(
    governanceStatus as ApplicationGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalSolutionTypes(): readonly SolutionType[] {
  return CANONICAL_SOLUTION_TYPES;
}

export function getCanonicalComparisonTypes(): readonly ComparisonType[] {
  return CANONICAL_COMPARISON_TYPES;
}

export function getCanonicalAlternativeTechniqueTypes(): readonly AlternativeTechniqueType[] {
  return CANONICAL_ALTERNATIVE_TECHNIQUE_TYPES;
}

export function getCanonicalComparisonDimensions(): readonly ComparisonDimension[] {
  return CANONICAL_COMPARISON_DIMENSIONS;
}

export function getCanonicalSolutionComparisonStatuses(): readonly SolutionComparisonStatus[] {
  return CANONICAL_SOLUTION_COMPARISON_STATUS;
}
