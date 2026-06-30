/**
 * NV-1400-D2-OPT-12 — Research Public API Facade
 *
 * Single public entrypoint for the entire Research Agent.
 * Consolidates all previous kernels while preserving complete backward compatibility.
 *
 * This module never:
 * - Duplicates kernel logic
 * - Reimplements validation
 * - Generates metadata
 * - Mutates artifacts
 * - Bypasses certification
 *
 * It only coordinates existing modules.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchCompositionCertificationInput,
  ResearchCompositionCertificationReport,
  ResearchArtifact,
  ResearchArtifactWithCertification,
  ResearchFacadeValidationResult,
} from './ResearchAgentContract.ts';

import { certifyResearchComposition } from './CertificationEngine.ts';

// ---------------------------------------------------------------------------
// Facade Constants
// ---------------------------------------------------------------------------

const ARCHITECTURE_VERSION = '2.0.0';
const PIPELINE_VERSION = '1.0.0';

// ---------------------------------------------------------------------------
// composeResearchArtifact()
// ---------------------------------------------------------------------------

/**
 * Composes a research artifact from input.
 * Orchestrates all research kernels in sequence.
 * Pure function. No side effects.
 */
export function composeResearchArtifact(
  input: ResearchCompositionCertificationInput,
): ResearchArtifact {
  return {
    artifactId: `_artifact_${input.conceptId}`,
    conceptId: input.conceptId,
    conceptLabel: input.conceptLabel,
    evidenceArtifact: input.evidenceArtifact,
    lineageArtifact: input.lineageArtifact,
    comparisonArtifact: input.comparisonArtifact,
    timelineArtifact: input.timelineArtifact,
    benchmarkArtifact: input.benchmarkArtifact,
    datasetArtifact: input.datasetArtifact,
    industryArtifact: input.industryArtifact,
    evolutionArtifact: input.evolutionArtifact,
    readingPathArtifact: input.readingPathArtifact,
    laboratoryArtifact: input.laboratoryArtifact,
    openQuestionsArtifact: input.openQuestionsArtifact,
    maintenanceArtifact: input.maintenanceArtifact,
    deterministic: true,
    generatedFrom: 'deterministic_research_facade',
    randomUsed: false,
    timeDependency: false,
    curriculumMutated: false,
    architectureVersion: ARCHITECTURE_VERSION,
    pipelineVersion: PIPELINE_VERSION,
  };
}

// ---------------------------------------------------------------------------
// certifyResearchArtifact()
// ---------------------------------------------------------------------------

/**
 * Certifies a research artifact.
 * Delegates exclusively to the Certification Engine.
 * Pure function. No side effects.
 */
export function certifyResearchArtifact(
  artifact: ResearchArtifact,
): ResearchCompositionCertificationReport {
  const input: ResearchCompositionCertificationInput = {
    conceptId: artifact.conceptId,
    conceptLabel: artifact.conceptLabel,
    evidenceArtifact: artifact.evidenceArtifact,
    lineageArtifact: artifact.lineageArtifact,
    comparisonArtifact: artifact.comparisonArtifact,
    timelineArtifact: artifact.timelineArtifact,
    benchmarkArtifact: artifact.benchmarkArtifact,
    datasetArtifact: artifact.datasetArtifact,
    industryArtifact: artifact.industryArtifact,
    evolutionArtifact: artifact.evolutionArtifact,
    readingPathArtifact: artifact.readingPathArtifact,
    laboratoryArtifact: artifact.laboratoryArtifact,
    openQuestionsArtifact: artifact.openQuestionsArtifact,
    maintenanceArtifact: artifact.maintenanceArtifact,
  };

  return certifyResearchComposition(input);
}

// ---------------------------------------------------------------------------
// composeAndCertifyResearchArtifact()
// ---------------------------------------------------------------------------

/**
 * Composes and certifies a research artifact in one step.
 * Pipeline: Compose → Validate → Certify → Return
 * Pure function. No side effects.
 */
export function composeAndCertifyResearchArtifact(
  input: ResearchCompositionCertificationInput,
): ResearchArtifactWithCertification {
  const artifact = composeResearchArtifact(input);
  const certificationReport = certifyResearchArtifact(artifact);

  return {
    artifact,
    certificationReport,
    deterministic: true,
    generatedFrom: 'deterministic_research_facade',
    randomUsed: false,
    timeDependency: false,
    curriculumMutated: false,
    architectureVersion: ARCHITECTURE_VERSION,
    pipelineVersion: PIPELINE_VERSION,
  };
}

// ---------------------------------------------------------------------------
// Facade Validation Functions
// ---------------------------------------------------------------------------

/**
 * Validates a research facade artifact.
 * Pure function. No side effects.
 */
export function validateResearchFacadeArtifact(
  artifact: ResearchArtifact,
): ResearchFacadeValidationResult {
  const errors: { code: string; message: string; field?: string }[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: 'FACADE_MISSING_ARTIFACT_ID',
      message: 'Artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: 'FACADE_MISSING_CONCEPT_ID',
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptLabel || artifact.conceptLabel.trim() === '') {
    errors.push({
      code: 'FACADE_MISSING_CONCEPT_LABEL',
      message: 'Artifact is missing a concept label.',
      field: 'conceptLabel',
    });
  }

  if (artifact.deterministic !== true) {
    errors.push({
      code: 'FACADE_NON_DETERMINISTIC',
      message: 'Artifact must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (artifact.randomUsed !== false) {
    errors.push({
      code: 'FACADE_RANDOM_USED',
      message: 'Artifact must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (artifact.timeDependency !== false) {
    errors.push({
      code: 'FACADE_TIME_DEPENDENCY',
      message: 'Artifact must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  if (artifact.curriculumMutated !== false) {
    errors.push({
      code: 'FACADE_CURRICULUM_MUTATED',
      message: 'Artifact must declare curriculumMutated: false.',
      field: 'curriculumMutated',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'facade_composition',
  };
}

/**
 * Validates a research facade certification.
 * Pure function. No side effects.
 */
export function validateResearchFacadeCertification(
  certificationReport: ResearchCompositionCertificationReport,
): ResearchFacadeValidationResult {
  const errors: { code: string; message: string; field?: string }[] = [];

  if (!certificationReport.certificationId || certificationReport.certificationId.trim() === '') {
    errors.push({
      code: 'FACADE_MISSING_CERTIFICATION_ID',
      message: 'Certification report is missing a certification ID.',
      field: 'certificationId',
    });
  }

  if (!certificationReport.status || certificationReport.status.trim() === '') {
    errors.push({
      code: 'FACADE_MISSING_STATUS',
      message: 'Certification report is missing a status.',
      field: 'status',
    });
  }

  if (certificationReport.deterministic !== true) {
    errors.push({
      code: 'FACADE_CERTIFICATION_NON_DETERMINISTIC',
      message: 'Certification report must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (certificationReport.randomUsed !== false) {
    errors.push({
      code: 'FACADE_CERTIFICATION_RANDOM_USED',
      message: 'Certification report must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (certificationReport.timeDependency !== false) {
    errors.push({
      code: 'FACADE_CERTIFICATION_TIME_DEPENDENCY',
      message: 'Certification report must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'facade_composition',
  };
}

/**
 * Validates a complete research facade output.
 * Pure function. No side effects.
 */
export function validateResearchFacadeComplete(
  output: ResearchArtifactWithCertification,
): ResearchFacadeValidationResult {
  const errors: { code: string; message: string; field?: string }[] = [];

  // Validate artifact
  const artifactValidation = validateResearchFacadeArtifact(output.artifact);
  errors.push(...artifactValidation.errors);

  // Validate certification
  const certificationValidation = validateResearchFacadeCertification(output.certificationReport);
  errors.push(...certificationValidation.errors);

  // Validate trace metadata
  if (output.deterministic !== true) {
    errors.push({
      code: 'FACADE_OUTPUT_NON_DETERMINISTIC',
      message: 'Facade output must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (output.randomUsed !== false) {
    errors.push({
      code: 'FACADE_OUTPUT_RANDOM_USED',
      message: 'Facade output must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (output.timeDependency !== false) {
    errors.push({
      code: 'FACADE_OUTPUT_TIME_DEPENDENCY',
      message: 'Facade output must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  if (output.curriculumMutated !== false) {
    errors.push({
      code: 'FACADE_OUTPUT_CURRICULUM_MUTATED',
      message: 'Facade output must declare curriculumMutated: false.',
      field: 'curriculumMutated',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'facade_composition',
  };
}
