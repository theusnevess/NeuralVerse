/**
 * NV-2000-D8-OPT-16 — Deterministic Assessment Pipeline Facade
 *
 * Pure deterministic facade for the Assessment Pipeline.
 * This is the final public API that exposes a single, stable, deterministic
 * facade over every Assessment subsystem implemented in D8-OPT-01 through D8-OPT-15.
 *
 * The facade exists only to expose the canonical Assessment API.
 * It must never contain business logic, only delegation.
 *
 * Guarantees:
 * - Same inputs always produce identical outputs.
 * - No global mutable state reads.
 * - No random values.
 * - No time dependency.
 * - Canonical order is always preserved.
 *
 * Deterministic. No Math.random. No Date.now.
 */

import {
  type AssessmentCertificationReport,
  type AssessmentFacadeArtifactResult,
  type AssessmentFacadeCertificationResult,
  type AssessmentFacadeCompleteResult,
  type AssessmentFacadeStatus,
  type AssessmentFacadeTraceMetadata,
  type AssessmentFacadeValidationResult,
  type AssessmentNode,
  type AssessmentRegistry,
  type AssessmentRegistryValidationResult,
  type AssessmentValidationError,
  type AssessmentValidationResult,
  type AssessmentTrace,
  CANONICAL_ASSESSMENT_FACADE_STATUS,
  CANONICAL_ASSESSMENT_STATUS,
} from './AssessmentAgentContract.ts';

import {
  composeAssessment,
  composeAssessmentNode,
  composeAssessmentRegistry,
  composeAssessmentRegistryFromInput,
  isSupportedAssessmentStatus,
} from './AssessmentKernel.ts';

import {
  validateAssessmentRegistry,
  validateAssessmentNode,
  validateAssessmentTrace,
} from './AssessmentValidation.ts';

import {
  certifyAssessmentArtifact,
  validateAssessmentCertification,
  isAssessmentCertificationSuccessful,
  calculateAssessmentCertificationScore,
} from './AssessmentCertificationEngine.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported assessment facade status?
 */
export function isSupportedAssessmentFacadeStatus(
  value: string,
): value is AssessmentFacadeStatus {
  return CANONICAL_ASSESSMENT_FACADE_STATUS.includes(
    value as AssessmentFacadeStatus,
  );
}

/**
 * Returns a copy of canonical assessment facade statuses.
 */
export function getCanonicalAssessmentFacadeStatuses(): readonly AssessmentFacadeStatus[] {
  return [...CANONICAL_ASSESSMENT_FACADE_STATUS];
}

// ============================================================================
// DETERMINISTIC ID GENERATOR
// ============================================================================

/**
 * Deterministic ID generator for facade operations.
 */
function _deterministicId(prefix: string, parts: readonly string[]): string {
  const slug = parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
  return `${prefix}-${slug}`;
}

/**
 * Compose an immutable AssessmentFacadeTraceMetadata.
 */
function _composeFacadeTrace(
  operationId: string,
  inputId: string,
): AssessmentFacadeTraceMetadata {
  const traceId = _deterministicId(operationId, [inputId]);
  return {
    traceId,
    deterministic: true,
    generatedFrom: 'deterministic_assessment_facade',
    randomUsed: false,
    timeDependency: false,
  };
}

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate an AssessmentFacadeArtifactResult.
 * Returns structured errors, never exceptions.
 */
export function validateAssessmentFacadeArtifact(
  result: AssessmentFacadeArtifactResult,
): AssessmentFacadeValidationResult {
  const errors: AssessmentValidationError[] = [];

  if (!result || typeof result !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_ARTIFACT',
      message: 'Facade artifact result is not a valid object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'facade_validation',
    };
  }

  if (!isSupportedAssessmentFacadeStatus(result.status)) {
    errors.push({
      code: 'ASSESSMENT_FACADE_INVALID_STATUS',
      message: `Invalid facade status: ${String(result.status)}`,
      field: 'status',
    });
  }

  if (!result.registry || typeof result.registry !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_ARTIFACT',
      message: 'Facade artifact result is missing registry.',
      field: 'registry',
    });
  }

  if (!result.validation || typeof result.validation !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_VALIDATION',
      message: 'Facade artifact result is missing validation.',
      field: 'validation',
    });
  }

  if (!result.trace || typeof result.trace !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_TRACE',
      message: 'Facade artifact result is missing trace metadata.',
      field: 'trace',
    });
  } else {
    if (result.trace.deterministic !== true) {
      errors.push({
        code: 'ASSESSMENT_FACADE_MISSING_TRACE',
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (result.trace.randomUsed !== false) {
      errors.push({
        code: 'ASSESSMENT_FACADE_MISSING_TRACE',
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (result.trace.timeDependency !== false) {
      errors.push({
        code: 'ASSESSMENT_FACADE_MISSING_TRACE',
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'facade_validation',
  };
}

/**
 * Validate an AssessmentFacadeCertificationResult.
 * Returns structured errors, never exceptions.
 */
export function validateAssessmentFacadeCertification(
  result: AssessmentFacadeCertificationResult,
): AssessmentFacadeValidationResult {
  const errors: AssessmentValidationError[] = [];

  if (!result || typeof result !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_ARTIFACT',
      message: 'Facade certification result is not a valid object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'facade_validation',
    };
  }

  if (!isSupportedAssessmentFacadeStatus(result.status)) {
    errors.push({
      code: 'ASSESSMENT_FACADE_INVALID_STATUS',
      message: `Invalid facade status: ${String(result.status)}`,
      field: 'status',
    });
  }

  if (!result.certificationReport || typeof result.certificationReport !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_CERTIFICATION_REPORT',
      message: 'Facade certification result is missing certification report.',
      field: 'certificationReport',
    });
  }

  if (!result.validation || typeof result.validation !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_VALIDATION',
      message: 'Facade certification result is missing validation.',
      field: 'validation',
    });
  }

  if (!result.trace || typeof result.trace !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_TRACE',
      message: 'Facade certification result is missing trace metadata.',
      field: 'trace',
    });
  } else {
    if (result.trace.deterministic !== true) {
      errors.push({
        code: 'ASSESSMENT_FACADE_MISSING_TRACE',
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (result.trace.randomUsed !== false) {
      errors.push({
        code: 'ASSESSMENT_FACADE_MISSING_TRACE',
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (result.trace.timeDependency !== false) {
      errors.push({
        code: 'ASSESSMENT_FACADE_MISSING_TRACE',
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'facade_validation',
  };
}

/**
 * Validate an AssessmentFacadeCompleteResult.
 * Returns structured errors, never exceptions.
 */
export function validateAssessmentFacadeComplete(
  result: AssessmentFacadeCompleteResult,
): AssessmentFacadeValidationResult {
  const errors: AssessmentValidationError[] = [];

  if (!result || typeof result !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_ARTIFACT',
      message: 'Facade complete result is not a valid object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'facade_validation',
    };
  }

  if (!isSupportedAssessmentFacadeStatus(result.status)) {
    errors.push({
      code: 'ASSESSMENT_FACADE_INVALID_STATUS',
      message: `Invalid facade status: ${String(result.status)}`,
      field: 'status',
    });
  }

  if (!result.registry || typeof result.registry !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_ARTIFACT',
      message: 'Facade complete result is missing registry.',
      field: 'registry',
    });
  }

  if (!result.validation || typeof result.validation !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_VALIDATION',
      message: 'Facade complete result is missing validation.',
      field: 'validation',
    });
  }

  if (!result.certificationReport || typeof result.certificationReport !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_CERTIFICATION_REPORT',
      message: 'Facade complete result is missing certification report.',
      field: 'certificationReport',
    });
  }

  if (!result.certificationValidation || typeof result.certificationValidation !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_VALIDATION',
      message: 'Facade complete result is missing certification validation.',
      field: 'certificationValidation',
    });
  }

  if (!result.trace || typeof result.trace !== 'object') {
    errors.push({
      code: 'ASSESSMENT_FACADE_MISSING_TRACE',
      message: 'Facade complete result is missing trace metadata.',
      field: 'trace',
    });
  } else {
    if (result.trace.deterministic !== true) {
      errors.push({
        code: 'ASSESSMENT_FACADE_MISSING_TRACE',
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (result.trace.randomUsed !== false) {
      errors.push({
        code: 'ASSESSMENT_FACADE_MISSING_TRACE',
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (result.trace.timeDependency !== false) {
      errors.push({
        code: 'ASSESSMENT_FACADE_MISSING_TRACE',
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'facade_validation',
  };
}

// ============================================================================
// PUBLIC ENTRY POINTS — Three facade operations
// ============================================================================

/**
 * Compose an assessment artifact.
 * Delegates to Assessment Kernel (OPT-01).
 *
 * Deterministic. Pure. Immutable.
 */
export function composeAssessmentArtifact(params: {
  readonly nodes: readonly AssessmentNode[];
}): AssessmentFacadeArtifactResult {
  const { registry, validation, trace } = composeAssessment({
    nodes: params.nodes,
  });

  const facadeTrace = _composeFacadeTrace(
    'compose-artifact',
    registry.metadata.registryId,
  );

  const artifactId = registry.metadata.registryId;
  const artifactTitle =
    registry.nodes.length > 0 ? registry.nodes[0].title : 'Empty Assessment';

  return {
    status: 'available',
    artifactId,
    artifactTitle,
    registry,
    validation,
    trace: facadeTrace,
  };
}

/**
 * Certify an assessment facade artifact.
 * Delegates to Certification Engine (OPT-15).
 *
 * Deterministic. Pure. Immutable.
 */
export function certifyAssessmentFacadeArtifact(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly registry: AssessmentRegistry;
  readonly certificationAt: string;
  readonly certifiedBy: string;
}): AssessmentFacadeCertificationResult {
  const certificationReport = certifyAssessmentArtifact({
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    findings: [],
    certifiedAt: params.certificationAt,
    certifiedBy: params.certifiedBy,
  });

  const validation = validateAssessmentCertification(certificationReport);

  const facadeTrace = _composeFacadeTrace(
    'certify-artifact',
    params.artifactId,
  );

  const isSuccessful = isAssessmentCertificationSuccessful(
    certificationReport.status,
  );

  return {
    status: isSuccessful ? 'certified' : 'available',
    artifactId: params.artifactId,
    certificationReport,
    validation: {
      valid: validation.valid,
      errors: validation.errors,
      checkedAt: 'facade_validation',
    },
    trace: facadeTrace,
  };
}

/**
 * Compose and certify an assessment artifact in a single pipeline.
 * Pipeline: Compose → Validate → Certify → Return immutable result.
 *
 * Deterministic. Pure. Immutable.
 */
export function composeAndCertifyAssessmentArtifact(params: {
  readonly nodes: readonly AssessmentNode[];
  readonly certificationAt: string;
  readonly certifiedBy: string;
}): AssessmentFacadeCompleteResult {
  const composeResult = composeAssessmentArtifact({
    nodes: params.nodes,
  });

  const certificationResult = certifyAssessmentFacadeArtifact({
    artifactId: composeResult.artifactId,
    artifactTitle: composeResult.artifactTitle,
    registry: composeResult.registry,
    certificationAt: params.certificationAt,
    certifiedBy: params.certifiedBy,
  });

  const facadeTrace = _composeFacadeTrace(
    'compose-and-certify',
    composeResult.artifactId,
  );

  const isSuccessful = isAssessmentCertificationSuccessful(
    certificationResult.certificationReport.status,
  );

  return {
    status: isSuccessful ? 'certified' : 'available',
    artifactId: composeResult.artifactId,
    artifactTitle: composeResult.artifactTitle,
    registry: composeResult.registry,
    validation: composeResult.validation,
    certificationReport: certificationResult.certificationReport,
    certificationValidation: certificationResult.validation,
    trace: facadeTrace,
  };
}
