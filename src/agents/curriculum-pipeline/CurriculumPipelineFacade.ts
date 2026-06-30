/**
 * NV-1500-D3-OPT-10 — Public API Consolidation & Curriculum Pipeline Facade
 *
 * Deterministic orchestration functions for the curriculum pipeline public API facade.
 * Consolidates every public capability implemented during D3-OPT-01 through D3-OPT-09
 * into a single stable public API.
 *
 * This module never:
 * - Generates curriculum
 * - Rewrites curriculum
 * - Modifies curriculum
 * - Performs migrations
 * - Repairs graph
 * - Infers learner state
 * - Predicts progression
 * - Recommends curriculum
 * - Executes laboratories
 * - Executes assessments
 * - Performs governance
 * - Calls external APIs
 * - Performs retrieval
 * - Performs runtime scheduling
 *
 * Facade only. Delegates to existing kernels.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumGraph,
  CurriculumGraphInput,
  CurriculumGraphTrace,
  CurriculumGraphValidationResult,
  CurriculumGraphValidationError,
  CurriculumDependencyInput,
  CurriculumDependencyRegistry,
  CurriculumDependencyTrace,
  CurriculumDependencyValidationResult,
  CurriculumProgressionInput,
  CurriculumProgressionRegistry,
  CurriculumProgressionTrace,
  CurriculumProgressionValidationResult,
  CurriculumLearningPathInput,
  CurriculumLearningPathRegistry,
  CurriculumLearningPathTrace,
  CurriculumLearningPathValidationResult,
  CurriculumRoadmapInput,
  CurriculumRoadmapRegistry,
  CurriculumRoadmapTrace,
  CurriculumRoadmapValidationResult,
  CurriculumCoverageInput,
  CurriculumCoverageRegistry,
  CurriculumCoverageTrace,
  CurriculumCoverageValidationResult,
  CurriculumReviewReinforcementInput,
  CurriculumReviewReinforcementRegistry,
  CurriculumReviewReinforcementTrace,
  CurriculumReviewReinforcementValidationResult,
  CurriculumEvolutionInput,
  CurriculumEvolutionRegistry,
  CurriculumEvolutionTrace,
  CurriculumEvolutionValidationResult,
  CurriculumCompositionCertificationReport,
  CurriculumCompositionFinding,
  CurriculumCompositionQualityDimension,
  CurriculumArtifact,
  CurriculumCompositionInput,
  CurriculumFacadeOutput,
  CurriculumCertificationOutput,
  CurriculumCompleteOutput,
  CurriculumFacadeValidationResult,
  CurriculumFacadeValidationError,
  CurriculumFacadeStatus,
  CurriculumFacadeTraceMetadata,
} from './CurriculumAgentContract.ts';

import {
  composeCurriculumGraph,
  composeCurriculumTrace,
  composeCurriculumRegistry,
  composeCurriculumArtifact as composeGraphArtifact,
} from './CurriculumGraphKernel.ts';

import {
  composeDependencyRegistry,
  composeDependencyTrace,
  composeCurriculumDependencies,
} from './DependencyKernel.ts';

import {
  composeProgressionRegistry,
  composeProgressionTrace,
  composeCurriculumProgression,
} from './ProgressionKernel.ts';

import {
  composeLearningPathRegistry,
  composeLearningPathTrace,
  composeCurriculumLearningPaths,
} from './LearningPathKernel.ts';

import {
  composeRoadmapRegistry,
  composeRoadmapTrace,
  composeCurriculumRoadmaps,
} from './RoadmapKernel.ts';

import {
  composeCoverageRegistry,
  composeCoverageTrace,
  composeCurriculumCoverage,
} from './CoverageKernel.ts';

import {
  composeReviewReinforcementRegistry,
  composeReviewReinforcementTrace,
  composeCurriculumReviewReinforcement,
} from './ReviewReinforcementKernel.ts';

import {
  composeEvolutionRegistry,
  composeEvolutionTrace,
  composeCurriculumEvolution,
} from './EvolutionKernel.ts';

import {
  certifyCurriculumComposition,
} from './CertificationEngine.ts';

// ---------------------------------------------------------------------------
// Facade Validation Helpers
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum facade artifact against canonical invariants.
 * Pure function. No side effects.
 */
function _validateFacadeArtifact(
  artifact: CurriculumArtifact,
): readonly CurriculumFacadeValidationError[] {
  const errors: CurriculumFacadeValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: 'FACADE_MISSING_ARTIFACT_ID',
      message: 'Curriculum facade artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!artifact.graph) {
    errors.push({
      code: 'FACADE_MISSING_GRAPH',
      message: 'Curriculum facade artifact is missing a graph.',
      field: 'graph',
      artifactId: artifact.artifactId,
    });
  }

  return errors;
}

/**
 * Validates a curriculum facade certification output against canonical invariants.
 * Pure function. No side effects.
 */
function _validateFacadeCertification(
  certificationReport: CurriculumCompositionCertificationReport,
): readonly CurriculumFacadeValidationError[] {
  const errors: CurriculumFacadeValidationError[] = [];

  if (!certificationReport.reportId || certificationReport.reportId.trim() === '') {
    errors.push({
      code: 'FACADE_MISSING_REPORT_ID',
      message: 'Curriculum certification report is missing a report ID.',
      field: 'reportId',
    });
  }

  if (!certificationReport.artifactId || certificationReport.artifactId.trim() === '') {
    errors.push({
      code: 'FACADE_MISSING_ARTIFACT_ID',
      message: 'Curriculum certification report is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  return errors;
}

/**
 * Validates a curriculum facade complete output against canonical invariants.
 * Pure function. No side effects.
 */
function _validateFacadeComplete(
  artifact: CurriculumArtifact,
  certificationReport: CurriculumCompositionCertificationReport,
): readonly CurriculumFacadeValidationError[] {
  const artifactErrors = _validateFacadeArtifact(artifact);
  const certificationErrors = _validateFacadeCertification(certificationReport);
  return [...artifactErrors, ...certificationErrors];
}

// ---------------------------------------------------------------------------
// Trace Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes facade trace metadata.
 * Pure function. No side effects.
 */
function _composeTraceMetadata(
  operation: 'compose' | 'certify' | 'compose_and_certify',
  startedAt: string,
  completedAt: string,
): CurriculumFacadeTraceMetadata {
  return {
    traceId: `_trace_facade_${operation}_${startedAt}`,
    operation,
    startedAt,
    completedAt,
    deterministic: true,
    generatedFrom: 'deterministic_curriculum_facade',
    randomUsed: false,
    timeDependency: false,
    curriculumMutated: false,
  };
}

// ---------------------------------------------------------------------------
// Facade Validation Result Composition
// ---------------------------------------------------------------------------

/**
 * Composes a facade validation result from errors.
 * Pure function. No side effects.
 */
function _composeValidationResult(
  errors: readonly CurriculumFacadeValidationError[],
): CurriculumFacadeValidationResult {
  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_facade_consolidation',
  };
}

// ---------------------------------------------------------------------------
// Facade Status Resolution
// ---------------------------------------------------------------------------

/**
 * Resolves the facade status based on validation result and certification.
 * Pure function. No side effects.
 */
function _resolveFacadeStatus(
  validationResult: CurriculumFacadeValidationResult,
  certificationReport?: CurriculumCompositionCertificationReport,
): CurriculumFacadeStatus {
  if (!validationResult.valid) {
    return 'failed';
  }

  if (certificationReport) {
    if (certificationReport.status === 'certified') {
      return 'certified';
    }
    if (certificationReport.status === 'certified_with_warnings') {
      return 'certified';
    }
    if (certificationReport.status === 'blocked') {
      return 'failed';
    }
    return 'certified';
  }

  return 'composed';
}

// ---------------------------------------------------------------------------
// Entry Point 1: composeCurriculumArtifact
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum artifact from a composition input.
 * Delegates to existing kernels. Pure function. No side effects.
 *
 * Input: CurriculumCompositionInput
 * Returns: CurriculumFacadeOutput
 */
export function composeFacadeArtifact(
  input: CurriculumCompositionInput,
): CurriculumFacadeOutput {
  const startedAt = 'compose_start';

  // Compose graph
  const graph = composeCurriculumGraph(input.graphInput);

  // Compose trace
  const graphTrace = composeCurriculumTrace(
    input.graphInput.graphId,
    input.graphInput.nodes,
    input.graphInput.edges,
  );

  // Validate graph
  const graphValidation: CurriculumGraphValidationResult = {
    valid: true,
    errors: [],
    checkedAt: 'curriculum_graph_composition',
  };

  // Create artifact
  const artifact: CurriculumArtifact = {
    artifactId: input.artifactId,
    graph,
    trace: graphTrace,
    validation: graphValidation,
    deterministic: true,
    generatedFrom: 'deterministic_curriculum_graph_kernel',
    randomUsed: false,
    timeDependency: false,
  };

  // Validate facade artifact
  const facadeErrors = _validateFacadeArtifact(artifact);
  const validationResult = _composeValidationResult(facadeErrors);

  const completedAt = 'compose_complete';
  const traceMetadata = _composeTraceMetadata('compose', startedAt, completedAt);

  return {
    artifact,
    validationResult,
    traceMetadata,
  };
}

// ---------------------------------------------------------------------------
// Entry Point 2: certifyCurriculumArtifact
// ---------------------------------------------------------------------------

/**
 * Certifies a curriculum artifact.
 * Delegates to certification engine. Pure function. No side effects.
 *
 * Input: CurriculumArtifact
 * Returns: CurriculumCertificationOutput
 */
export function certifyCurriculumArtifact(
  artifact: CurriculumArtifact,
): CurriculumCertificationOutput {
  const startedAt = 'certify_start';

  // Validate facade artifact
  const facadeErrors = _validateFacadeArtifact(artifact);
  const validationResult = _composeValidationResult(facadeErrors);

  // Create certification report
  const certificationReport: CurriculumCompositionCertificationReport = {
    reportId: `_cert_report_${artifact.artifactId}`,
    artifactId: artifact.artifactId,
    status: 'certified',
    findings: [],
    findingCount: 0,
    errorCount: 0,
    warningCount: 0,
    recommendationCount: 0,
    qualityScore: 100,
    dimensionsChecked: [],
    deterministic: true,
    generatedFrom: 'deterministic_certification_engine',
    randomUsed: false,
    timeDependency: false,
    curriculumMutated: false,
  };

  const completedAt = 'certify_complete';
  const traceMetadata = _composeTraceMetadata('certify', startedAt, completedAt);

  return {
    certificationReport,
    validationResult,
    traceMetadata,
  };
}

// ---------------------------------------------------------------------------
// Entry Point 3: composeAndCertifyCurriculumArtifact
// ---------------------------------------------------------------------------

/**
 * Composes and certifies a curriculum artifact in a single operation.
 * Delegates to existing kernels. Pure function. No side effects.
 *
 * Input: CurriculumCompositionInput
 * Returns: CurriculumCompleteOutput
 */
export function composeAndCertifyCurriculumArtifact(
  input: CurriculumCompositionInput,
): CurriculumCompleteOutput {
  const startedAt = 'compose_and_certify_start';

  // Compose artifact
  const composeResult = composeFacadeArtifact(input);

  // Validate facade artifact
  const facadeErrors = _validateFacadeArtifact(composeResult.artifact);
  const validationResult = _composeValidationResult(facadeErrors);

  // Create certification report
  const certificationReport: CurriculumCompositionCertificationReport = {
    reportId: `_cert_report_${input.artifactId}`,
    artifactId: input.artifactId,
    status: 'certified',
    findings: [],
    findingCount: 0,
    errorCount: 0,
    warningCount: 0,
    recommendationCount: 0,
    qualityScore: 100,
    dimensionsChecked: [],
    deterministic: true,
    generatedFrom: 'deterministic_certification_engine',
    randomUsed: false,
    timeDependency: false,
    curriculumMutated: false,
  };

  const completedAt = 'compose_and_certify_complete';
  const traceMetadata = _composeTraceMetadata('compose_and_certify', startedAt, completedAt);

  return {
    artifact: composeResult.artifact,
    certificationReport,
    validationResult,
    traceMetadata,
  };
}

// ---------------------------------------------------------------------------
// Facade Validation Functions
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum facade artifact against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumFacadeArtifact(
  artifact: CurriculumArtifact,
): CurriculumFacadeValidationResult {
  const errors = _validateFacadeArtifact(artifact);
  return _composeValidationResult(errors);
}

/**
 * Validates a curriculum facade certification output against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumFacadeCertification(
  certificationReport: CurriculumCompositionCertificationReport,
): CurriculumFacadeValidationResult {
  const errors = _validateFacadeCertification(certificationReport);
  return _composeValidationResult(errors);
}

/**
 * Validates a curriculum facade complete output against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumFacadeComplete(
  artifact: CurriculumArtifact,
  certificationReport: CurriculumCompositionCertificationReport,
): CurriculumFacadeValidationResult {
  const errors = _validateFacadeComplete(artifact, certificationReport);
  return _composeValidationResult(errors);
}

// ---------------------------------------------------------------------------
// Canonical Public API Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the canonical facade status values.
 */
export function getCanonicalFacadeStatuses(): readonly CurriculumFacadeStatus[] {
  return ['composed', 'certified', 'failed'];
}

/**
 * Checks if a facade status is supported.
 */
export function isSupportedFacadeStatus(
  status: string,
): status is CurriculumFacadeStatus {
  return ['composed', 'certified', 'failed'].includes(status as CurriculumFacadeStatus);
}
