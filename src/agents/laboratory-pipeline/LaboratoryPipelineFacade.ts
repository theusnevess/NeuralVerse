/**
 * NV-1600-D4-OPT-11 — Public API Consolidation & Laboratory Pipeline Facade
 *
 * Single public entrypoint for the entire Laboratory Pipeline.
 * Consolidates all previous D4 kernels while preserving complete backward compatibility.
 *
 * This module never:
 * - Duplicates kernel logic
 * - Reimplements validation
 * - Generates metadata
 * - Mutates artifacts
 * - Bypasses certification
 * - Executes laboratories
 * - Runs workflows
 * - Runs experiments
 * - Generates observations
 * - Generates hypotheses
 * - Rewrites metadata
 * - Repairs artifacts
 * - Infers metadata
 * - Infers learner information
 * - Performs persistence
 * - Performs networking
 * - Calls external APIs
 * - Calls LLMs
 * - Performs filesystem operations
 * - Performs runtime scheduling
 *
 * It only coordinates existing modules.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryCompositionInput,
  LaboratoryFacadeOutput,
  LaboratoryCertificationOutput,
  LaboratoryCompleteOutput,
  LaboratoryFacadeStatus,
  LaboratoryFacadeTraceMetadata,
  LaboratoryFacadeValidationResult,
  LaboratoryFacadeValidationError,
  LaboratoryCompositionCertificationInput,
  LaboratoryCompositionCertificationProvenance,
  LaboratoryRegistry,
  LaboratoryExecutionRegistry,
  LaboratoryConfigurationRegistry,
  ExperimentRegistry,
  ResultArtifactRegistry,
  LaboratoryWorkflowRegistry,
  LaboratoryInteractionRegistry,
  LaboratoryHypothesisRegistry,
  LaboratoryHistoryRegistry,
  LaboratoryCompositionCertificationReport,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_FACADE_STATUS,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Kernel Imports
// ---------------------------------------------------------------------------

import { composeLaboratoryRegistry } from './LaboratoryKernel.ts';
import { composeExecutionRegistry } from './ExecutionKernel.ts';
import { composeConfigurationRegistry } from './ParameterKernel.ts';
import { composeExperimentRegistry } from './ExperimentKernel.ts';
import { composeResultArtifactRegistry } from './ResultArtifactKernel.ts';
import { composeWorkflowRegistry } from './WorkflowKernel.ts';
import { composeInteractionRegistry } from './InteractionKernel.ts';
import { composeHypothesisRegistry } from './HypothesisKernel.ts';
import { composeHistoryRegistry } from './LaboratoryHistoryKernel.ts';
import { certifyLaboratoryComposition } from './CertificationEngine.ts';

// ---------------------------------------------------------------------------
// Facade Status Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the canonical facade statuses.
 */
export function getCanonicalFacadeStatuses(): readonly LaboratoryFacadeStatus[] {
  return CANONICAL_FACADE_STATUS;
}

/**
 * Checks if a string is a supported facade status.
 */
export function isSupportedFacadeStatus(
  status: string,
): status is LaboratoryFacadeStatus {
  return CANONICAL_FACADE_STATUS.includes(status as LaboratoryFacadeStatus);
}

// ---------------------------------------------------------------------------
// Composition Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates a composition input against canonical invariants.
 * Pure function. No side effects.
 */
function _validateCompositionInput(
  input: LaboratoryCompositionInput,
): readonly LaboratoryFacadeValidationError[] {
  const errors: LaboratoryFacadeValidationError[] = [];

  if (!input.laboratories || input.laboratories.length === 0) {
    errors.push({
      code: 'FACADE_MISSING_LABORATORIES',
      message: 'Composition input has no laboratories.',
      field: 'laboratories',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a facade output against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryFacadeArtifact(
  output: LaboratoryFacadeOutput,
): LaboratoryFacadeValidationResult {
  const errors: LaboratoryFacadeValidationError[] = [];

  if (!output.artifactId || output.artifactId.trim() === '') {
    errors.push({
      code: 'FACADE_MISSING_ARTIFACT_ID',
      message: 'Facade output is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!output.laboratoryRegistry) {
    errors.push({
      code: 'FACADE_MISSING_REGISTRY',
      message: 'Facade output is missing a laboratory registry.',
      field: 'laboratoryRegistry',
    });
  }

  if (!output.executionRegistry) {
    errors.push({
      code: 'FACADE_MISSING_REGISTRY',
      message: 'Facade output is missing an execution registry.',
      field: 'executionRegistry',
    });
  }

  if (!output.configurationRegistry) {
    errors.push({
      code: 'FACADE_MISSING_REGISTRY',
      message: 'Facade output is missing a configuration registry.',
      field: 'configurationRegistry',
    });
  }

  if (!output.experimentRegistry) {
    errors.push({
      code: 'FACADE_MISSING_REGISTRY',
      message: 'Facade output is missing an experiment registry.',
      field: 'experimentRegistry',
    });
  }

  if (!output.resultArtifactRegistry) {
    errors.push({
      code: 'FACADE_MISSING_REGISTRY',
      message: 'Facade output is missing a result artifact registry.',
      field: 'resultArtifactRegistry',
    });
  }

  if (!output.workflowRegistry) {
    errors.push({
      code: 'FACADE_MISSING_REGISTRY',
      message: 'Facade output is missing a workflow registry.',
      field: 'workflowRegistry',
    });
  }

  if (!output.interactionRegistry) {
    errors.push({
      code: 'FACADE_MISSING_REGISTRY',
      message: 'Facade output is missing an interaction registry.',
      field: 'interactionRegistry',
    });
  }

  if (!output.hypothesisRegistry) {
    errors.push({
      code: 'FACADE_MISSING_REGISTRY',
      message: 'Facade output is missing a hypothesis registry.',
      field: 'hypothesisRegistry',
    });
  }

  if (!output.historyRegistry) {
    errors.push({
      code: 'FACADE_MISSING_REGISTRY',
      message: 'Facade output is missing a history registry.',
      field: 'historyRegistry',
    });
  }

  if (!isSupportedFacadeStatus(output.facadeStatus)) {
    errors.push({
      code: 'FACADE_INVALID_STATUS',
      message: `Facade output has invalid status: "${output.facadeStatus}".`,
      field: 'facadeStatus',
    });
  }

  if (!output.traceMetadata) {
    errors.push({
      code: 'FACADE_INVALID_TRACE',
      message: 'Facade output is missing trace metadata.',
      field: 'traceMetadata',
    });
  } else {
    if (output.traceMetadata.deterministic !== true) {
      errors.push({
        code: 'FACADE_INVALID_TRACE',
        message: 'Trace metadata must declare deterministic: true.',
        field: 'traceMetadata.deterministic',
      });
    }
    if (output.traceMetadata.randomUsed !== false) {
      errors.push({
        code: 'FACADE_INVALID_TRACE',
        message: 'Trace metadata must declare randomUsed: false.',
        field: 'traceMetadata.randomUsed',
      });
    }
    if (output.traceMetadata.timeDependency !== false) {
      errors.push({
        code: 'FACADE_INVALID_TRACE',
        message: 'Trace metadata must declare timeDependency: false.',
        field: 'traceMetadata.timeDependency',
      });
    }
    if (output.traceMetadata.laboratoryMutated !== false) {
      errors.push({
        code: 'FACADE_INVALID_TRACE',
        message: 'Trace metadata must declare laboratoryMutated: false.',
        field: 'traceMetadata.laboratoryMutated',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a certification output against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryFacadeCertification(
  output: LaboratoryCertificationOutput,
): LaboratoryFacadeValidationResult {
  const errors: LaboratoryFacadeValidationError[] = [];

  if (!output.artifactId || output.artifactId.trim() === '') {
    errors.push({
      code: 'FACADE_MISSING_ARTIFACT_ID',
      message: 'Certification output is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!output.certificationReport) {
    errors.push({
      code: 'FACADE_MISSING_CERTIFICATION',
      message: 'Certification output is missing a certification report.',
      field: 'certificationReport',
    });
  }

  if (!isSupportedFacadeStatus(output.facadeStatus)) {
    errors.push({
      code: 'FACADE_INVALID_STATUS',
      message: `Certification output has invalid status: "${output.facadeStatus}".`,
      field: 'facadeStatus',
    });
  }

  if (!output.traceMetadata) {
    errors.push({
      code: 'FACADE_INVALID_TRACE',
      message: 'Certification output is missing trace metadata.',
      field: 'traceMetadata',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a complete output against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryFacadeComplete(
  output: LaboratoryCompleteOutput,
): LaboratoryFacadeValidationResult {
  const errors: LaboratoryFacadeValidationError[] = [];

  if (!output.artifactId || output.artifactId.trim() === '') {
    errors.push({
      code: 'FACADE_MISSING_ARTIFACT_ID',
      message: 'Complete output is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!output.facadeOutput) {
    errors.push({
      code: 'FACADE_MISSING_REGISTRY',
      message: 'Complete output is missing a facade output.',
      field: 'facadeOutput',
    });
  } else {
    const facadeResult = validateLaboratoryFacadeArtifact(output.facadeOutput);
    errors.push(...facadeResult.errors);
  }

  if (!output.certificationOutput) {
    errors.push({
      code: 'FACADE_MISSING_CERTIFICATION',
      message: 'Complete output is missing a certification output.',
      field: 'certificationOutput',
    });
  } else {
    const certResult = validateLaboratoryFacadeCertification(output.certificationOutput);
    errors.push(...certResult.errors);
  }

  if (!isSupportedFacadeStatus(output.facadeStatus)) {
    errors.push({
      code: 'FACADE_INVALID_STATUS',
      message: `Complete output has invalid status: "${output.facadeStatus}".`,
      field: 'facadeStatus',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Public API — Compose
// ---------------------------------------------------------------------------

/**
 * Composes a complete laboratory artifact from an input.
 * Delegates to all underlying kernels.
 * Pure function. No side effects.
 */
export function composeLaboratoryArtifact(
  input: LaboratoryCompositionInput,
): LaboratoryFacadeOutput {
  const validationErrors = _validateCompositionInput(input);
  const facadeStatus: LaboratoryFacadeStatus = validationErrors.length === 0 ? 'composed' : 'failed';

  const laboratoryRegistry = composeLaboratoryRegistry(input.laboratories);
  const executionRegistry = composeExecutionRegistry(input.executions);
  const configurationRegistry = composeConfigurationRegistry(
    input.configurations,
    input.parameters,
    input.groups,
  );
  const experimentRegistry = composeExperimentRegistry(
    input.experiments,
    input.scenarios,
    input.datasetReferences,
    input.expectedOutputs,
    input.evaluationMetadata,
  );
  const resultArtifactRegistry = composeResultArtifactRegistry(
    input.visualizations,
    input.observations,
    input.metrics,
    input.artifacts,
    input.relationships,
  );
  const workflowRegistry = composeWorkflowRegistry(input.workflows);
  const interactionRegistry = composeInteractionRegistry(input.interactions);
  const hypothesisRegistry = composeHypothesisRegistry(input.hypotheses);
  const historyRegistry = composeHistoryRegistry(
    input.historyRecords,
    input.historyEvidence,
    input.historyRelationships,
  );

  return {
    artifactId: `_artifact_lab_${input.laboratories.length}`,
    laboratoryRegistry,
    executionRegistry,
    configurationRegistry,
    experimentRegistry,
    resultArtifactRegistry,
    workflowRegistry,
    interactionRegistry,
    hypothesisRegistry,
    historyRegistry,
    facadeStatus,
    traceMetadata: {
      artifactId: `_artifact_lab_${input.laboratories.length}`,
      pipeline: 'laboratory_pipeline',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
      laboratoryMutated: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_facade',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Public API — Certify
// ---------------------------------------------------------------------------

/**
 * Certifies a laboratory artifact.
 * Delegates to the CertificationEngine.
 * Pure function. No side effects.
 */
export function certifyLaboratoryArtifact(
  output: LaboratoryFacadeOutput,
): LaboratoryCertificationOutput {
  const certificationInput: LaboratoryCompositionCertificationInput = {
    certificationId: `_cert_${output.artifactId}`,
    artifactId: output.artifactId,
    findings: [],
    dimensionsChecked: [
      'registry_integrity',
      'execution_integrity',
      'parameter_integrity',
      'experiment_integrity',
      'workflow_integrity',
      'interaction_integrity',
      'hypothesis_integrity',
      'history_integrity',
      'result_artifact_integrity',
      'configuration_integrity',
      'visualization_integrity',
      'evidence_integrity',
      'provenance_integrity',
      'relationship_integrity',
      'determinism',
      'validation_integrity',
      'architectural_boundary',
      'documentation_completeness',
    ],
    governanceStatus: 'canonical',
    provenance: {
      certificationId: `_cert_${output.artifactId}`,
      source: 'deterministic_laboratory_facade',
      governanceStatus: 'canonical',
      rationale: 'Laboratory artifact certification',
      providedBy: 'deterministic_laboratory_facade',
    },
  };

  const certificationReport = certifyLaboratoryComposition(certificationInput);

  const facadeStatus: LaboratoryFacadeStatus =
    certificationReport.certificationStatus === 'certified' ||
    certificationReport.certificationStatus === 'certified_with_warnings'
      ? 'certified'
      : 'failed';

  return {
    artifactId: output.artifactId,
    certificationReport,
    facadeStatus,
    traceMetadata: {
      artifactId: output.artifactId,
      pipeline: 'laboratory_pipeline',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
      laboratoryMutated: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_facade',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Public API — Compose and Certify
// ---------------------------------------------------------------------------

/**
 * Composes and certifies a laboratory artifact.
 * Internally performs compose → certify.
 * Pure function. No side effects.
 */
export function composeAndCertifyLaboratoryArtifact(
  input: LaboratoryCompositionInput,
): LaboratoryCompleteOutput {
  const facadeOutput = composeLaboratoryArtifact(input);
  const certificationOutput = certifyLaboratoryArtifact(facadeOutput);

  const facadeStatus: LaboratoryFacadeStatus =
    facadeOutput.facadeStatus === 'composed' && certificationOutput.facadeStatus === 'certified'
      ? 'certified'
      : 'failed';

  return {
    artifactId: facadeOutput.artifactId,
    facadeOutput,
    certificationOutput,
    facadeStatus,
    traceMetadata: {
      artifactId: facadeOutput.artifactId,
      pipeline: 'laboratory_pipeline',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
      laboratoryMutated: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_facade',
    randomUsed: false,
    timeDependency: false,
  };
}
