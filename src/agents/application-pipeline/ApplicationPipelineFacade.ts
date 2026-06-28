/**
 * NV-1900-D7-OPT-14 — Public API Consolidation & Application Pipeline Facade
 *
 * Deterministic facade for composing, validating and certifying complete Application Artifacts.
 * This is the only recommended public entrypoint for external consumers.
 *
 * The facade delegates every responsibility to the canonical kernels.
 * The facade owns no business rules.
 * The facade owns no validation logic.
 * The facade owns no composition logic.
 *
 * This module never:
 * - Implements composition
 * - Implements validation
 * - Implements certification
 * - Modifies registries
 * - Generates application metadata
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Delegation only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ApplicationRegistry,
  ApplicationInput,
  ApplicationFacadeStatus,
  ApplicationFacadeTraceMetadata,
  ApplicationFacadeValidationResult,
  ApplicationFacadeArtifactResult,
  ApplicationFacadeCertificationResult,
  ApplicationFacadeCompleteResult,
  ApplicationCertificationReport,
  ApplicationValidationError,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_APPLICATION_FACADE_STATUS,
} from './ApplicationAgentContract.ts';

import { composeApplication } from './ApplicationKernel.ts';
import { certifyApplicationArtifact } from './ApplicationCertificationEngine.ts';

// ---------------------------------------------------------------------------
// Facade Kernel — Delegation Functions
// ---------------------------------------------------------------------------

/**
 * Composes a complete Application Artifact by delegating to canonical kernels.
 * Pure function. No side effects.
 * No business logic inside the facade.
 */
export function composeApplicationArtifact(input: {
  readonly applicationInput: ApplicationInput;
}): ApplicationFacadeArtifactResult {
  // Delegate to the application kernel
  const applicationRegistry = composeApplication(input.applicationInput);

  return {
    applicationRegistry,
    status: 'composed',
    trace: {
      artifactId: applicationRegistry.registryId,
      pipelineVersion: '1.0.0',
      certificationVersion: '0.0.0',
      generatedBy: 'application_pipeline_facade',
      generatedFrom: 'deterministic_application_pipeline_facade',
    },
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Certifies an Application Artifact by delegating to the certification engine.
 * Pure function. No side effects.
 * No business logic inside the facade.
 */
export function certifyApplicationFacadeArtifact(
  applicationRegistry: ApplicationRegistry,
): ApplicationFacadeCertificationResult {
  // Delegate to the certification engine
  const certification = certifyApplicationArtifact({
    applicationRegistry,
  });

  return {
    applicationRegistry,
    certification,
    trace: {
      artifactId: applicationRegistry.registryId,
      pipelineVersion: '1.0.0',
      certificationVersion: '1.0.0',
      generatedBy: 'application_pipeline_facade',
      generatedFrom: 'deterministic_application_pipeline_facade',
    },
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Composes and certifies a complete Application Artifact.
 * Pure function. No side effects.
 * No business logic inside the facade.
 */
export function composeAndCertifyApplicationArtifact(input: {
  readonly applicationInput: ApplicationInput;
}): ApplicationFacadeCompleteResult {
  // Step 1: Compose
  const composed = composeApplicationArtifact(input);

  // Step 2: Validate
  const validation: ApplicationFacadeValidationResult = {
    valid: composed.applicationRegistry.nodes.length > 0,
    errors: composed.applicationRegistry.nodes.length === 0
      ? [{
          code: 'APPLICATION_FACADE_EMPTY_REGISTRY',
          message: 'Application registry has no nodes after composition.',
          field: 'applicationRegistry',
        }]
      : [],
  };

  // Step 3: Certify
  const certified = certifyApplicationFacadeArtifact(composed.applicationRegistry);

  // Step 4: Return deterministic result
  return {
    applicationRegistry: composed.applicationRegistry,
    validation,
    certification: certified.certification,
    trace: {
      artifactId: composed.applicationRegistry.registryId,
      pipelineVersion: '1.0.0',
      certificationVersion: '1.0.0',
      generatedBy: 'application_pipeline_facade',
      generatedFrom: 'deterministic_application_pipeline_facade',
    },
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Facade Validation
// ---------------------------------------------------------------------------

/**
 * Validates a facade artifact result.
 * Pure function. No side effects.
 */
export function validateApplicationFacadeArtifact(
  result: ApplicationFacadeArtifactResult,
): ApplicationFacadeValidationResult {
  const errors: ApplicationValidationError[] = [];

  if (!result.applicationRegistry) {
    errors.push({
      code: 'APPLICATION_FACADE_MISSING_ARTIFACT',
      message: 'Facade result is missing application registry.',
      field: 'applicationRegistry',
    });
  }

  if (!result.trace) {
    errors.push({
      code: 'APPLICATION_FACADE_MISSING_TRACE',
      message: 'Facade result is missing trace metadata.',
      field: 'trace',
    });
  }

  if (!CANONICAL_APPLICATION_FACADE_STATUS.includes(result.status)) {
    errors.push({
      code: 'APPLICATION_FACADE_INVALID_STATUS',
      message: `Facade result has invalid status: "${result.status}".`,
      field: 'status',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a facade certification result.
 * Pure function. No side effects.
 */
export function validateApplicationFacadeCertification(
  result: ApplicationFacadeCertificationResult,
): ApplicationFacadeValidationResult {
  const errors: ApplicationValidationError[] = [];

  if (!result.applicationRegistry) {
    errors.push({
      code: 'APPLICATION_FACADE_MISSING_ARTIFACT',
      message: 'Facade result is missing application registry.',
      field: 'applicationRegistry',
    });
  }

  if (!result.certification) {
    errors.push({
      code: 'APPLICATION_FACADE_MISSING_CERTIFICATION_REPORT',
      message: 'Facade result is missing certification report.',
      field: 'certification',
    });
  }

  if (!result.trace) {
    errors.push({
      code: 'APPLICATION_FACADE_MISSING_TRACE',
      message: 'Facade result is missing trace metadata.',
      field: 'trace',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a facade complete result.
 * Pure function. No side effects.
 */
export function validateApplicationFacadeComplete(
  result: ApplicationFacadeCompleteResult,
): ApplicationFacadeValidationResult {
  const errors: ApplicationValidationError[] = [];

  if (!result.applicationRegistry) {
    errors.push({
      code: 'APPLICATION_FACADE_MISSING_ARTIFACT',
      message: 'Facade result is missing application registry.',
      field: 'applicationRegistry',
    });
  }

  if (!result.validation) {
    errors.push({
      code: 'APPLICATION_FACADE_MISSING_VALIDATION',
      message: 'Facade result is missing validation.',
      field: 'validation',
    });
  }

  if (!result.certification) {
    errors.push({
      code: 'APPLICATION_FACADE_MISSING_CERTIFICATION_REPORT',
      message: 'Facade result is missing certification report.',
      field: 'certification',
    });
  }

  if (!result.trace) {
    errors.push({
      code: 'APPLICATION_FACADE_MISSING_TRACE',
      message: 'Facade result is missing trace metadata.',
      field: 'trace',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedApplicationFacadeStatus(
  status: string,
): status is ApplicationFacadeStatus {
  return CANONICAL_APPLICATION_FACADE_STATUS.includes(status as ApplicationFacadeStatus);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalApplicationFacadeStatuses(): readonly ApplicationFacadeStatus[] {
  return CANONICAL_APPLICATION_FACADE_STATUS;
}
