/**
 * NV-2100-D9-OPT-16 — Public API Consolidation & Curiosity Pipeline Facade
 *
 * Deterministic public facade over every Curiosity subsystem (D9-OPT-01 through D9-OPT-15).
 * Exposes three public entrypoints: compose, certify, and compose-and-certify.
 *
 * This module never:
 * - Implements business logic
 * - Composes curiosity directly (delegates to CuriosityKernel)
 * - Certifies directly (delegates to CuriosityCertificationEngine)
 * - Validates logic internally (delegates to existing validators)
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Orchestration only. Pure delegation.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CuriosityInput,
  CuriosityRegistry,
  CuriosityCertificationReport,
  CuriosityFacadeStatus,
  CuriosityFacadeTraceMetadata,
  CuriosityFacadeValidationResult,
  CuriosityFacadeArtifactResult,
  CuriosityFacadeCertificationResult,
  CuriosityFacadeCompleteResult,
  CuriosityFacadeValidationError,
  CuriosityFacadeEntryValidationResult,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_CURIOSITY_FACADE_STATUS,
} from './CuriosityAgentContract.ts';

import {
  composeCuriosity,
} from './CuriosityKernel.ts';

import {
  certifyCuriosityArtifact,
  validateCuriosityCertification,
} from './CuriosityCertificationEngine.ts';

import {
  validateCuriosity as validateCuriosityRegistry,
} from './CuriosityValidation.ts';

// ---------------------------------------------------------------------------
// Validation Codes
// ---------------------------------------------------------------------------

export const CURIOSITY_FACADE_VALIDATION_CODES = {
  CURIOSITY_FACADE_MISSING_ARTIFACT: 'CURIOSITY_FACADE_MISSING_ARTIFACT',
  CURIOSITY_FACADE_MISSING_VALIDATION: 'CURIOSITY_FACADE_MISSING_VALIDATION',
  CURIOSITY_FACADE_MISSING_TRACE: 'CURIOSITY_FACADE_MISSING_TRACE',
  CURIOSITY_FACADE_INVALID_STATUS: 'CURIOSITY_FACADE_INVALID_STATUS',
  CURIOSITY_FACADE_MISSING_CERTIFICATION_REPORT: 'CURIOSITY_FACADE_MISSING_CERTIFICATION_REPORT',
} as const;

// ---------------------------------------------------------------------------
// Facade Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes facade trace metadata.
 * Pure function. No side effects.
 */
export function composeCuriosityFacadeTrace(params: {
  readonly traceId?: string;
} = {}): CuriosityFacadeTraceMetadata {
  return {
    traceId: params.traceId || '_facade_trace_default',
    generatedFrom: 'deterministic_curiosity_pipeline_facade',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Public Entrypoint 1: composeCuriosityArtifact
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact by delegating to CuriosityKernel.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifact(
  input: CuriosityInput,
): CuriosityFacadeArtifactResult {
  const artifact = composeCuriosity(input);
  const trace = composeCuriosityFacadeTrace({
    traceId: `_facade_compose_${input.nodes.length}`,
  });

  return {
    facadeStatus: 'available',
    artifact,
    trace,
    deterministic: true,
    generatedFrom: 'deterministic_curiosity_pipeline_facade',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Public Entrypoint 2: certifyCuriosityFacadeArtifact
// ---------------------------------------------------------------------------

/**
 * Certifies a curiosity artifact by delegating to CuriosityCertificationEngine.
 * Pure function. No side effects.
 */
export function certifyCuriosityFacadeArtifact(params: {
  readonly reportId: string;
  readonly hasRegistry: boolean;
  readonly hasPurpose: boolean;
  readonly hasHumor: boolean;
  readonly hasCulturalReference: boolean;
  readonly hasCards: boolean;
  readonly hasKnowledgeEvolution: boolean;
  readonly hasDiscoveries: boolean;
  readonly hasLaboratoryCuriosity: boolean;
  readonly hasMisconceptions: boolean;
  readonly hasPresentation: boolean;
  readonly hasPreferences: boolean;
  readonly hasGovernance: boolean;
  readonly hasStorage: boolean;
  readonly hasSafety: boolean;
  readonly hasTraceability: boolean;
  readonly hasMetadata: boolean;
  readonly hasValidation: boolean;
  readonly hasDeterminism: boolean;
  readonly hasImmutability: boolean;
  readonly hasDocumentation: boolean;
  readonly hasCrossAgentBoundary: boolean;
  readonly hasPublicApi: boolean;
}): CuriosityFacadeCertificationResult {
  const certificationReport = certifyCuriosityArtifact({
    reportId: params.reportId,
    hasRegistry: params.hasRegistry,
    hasPurpose: params.hasPurpose,
    hasHumor: params.hasHumor,
    hasCulturalReference: params.hasCulturalReference,
    hasCards: params.hasCards,
    hasKnowledgeEvolution: params.hasKnowledgeEvolution,
    hasDiscoveries: params.hasDiscoveries,
    hasLaboratoryCuriosity: params.hasLaboratoryCuriosity,
    hasMisconceptions: params.hasMisconceptions,
    hasPresentation: params.hasPresentation,
    hasPreferences: params.hasPreferences,
    hasGovernance: params.hasGovernance,
    hasStorage: params.hasStorage,
    hasSafety: params.hasSafety,
    hasTraceability: params.hasTraceability,
    hasMetadata: params.hasMetadata,
    hasValidation: params.hasValidation,
    hasDeterminism: params.hasDeterminism,
    hasImmutability: params.hasImmutability,
    hasDocumentation: params.hasDocumentation,
    hasCrossAgentBoundary: params.hasCrossAgentBoundary,
    hasPublicApi: params.hasPublicApi,
  });

  const facadeStatus: CuriosityFacadeStatus = certificationReport.certificationStatus === 'passed'
    ? 'certified'
    : certificationReport.certificationStatus === 'passed_with_warnings'
      ? 'validated'
      : 'available';

  const trace = composeCuriosityFacadeTrace({
    traceId: `_facade_certify_${params.reportId}`,
  });

  return {
    facadeStatus,
    certificationReport,
    trace,
    deterministic: true,
    generatedFrom: 'deterministic_curiosity_pipeline_facade',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Public Entrypoint 3: composeAndCertifyCuriosityArtifact
// ---------------------------------------------------------------------------

/**
 * Composes and certifies a curiosity artifact in a single pipeline.
 * Delegates to composeCuriosityArtifact then certifyCuriosityFacadeArtifact.
 * Pure function. No side effects.
 */
export function composeAndCertifyCuriosityArtifact(params: {
  readonly input: CuriosityInput;
  readonly reportId: string;
  readonly hasPurpose: boolean;
  readonly hasHumor: boolean;
  readonly hasCulturalReference: boolean;
  readonly hasCards: boolean;
  readonly hasKnowledgeEvolution: boolean;
  readonly hasDiscoveries: boolean;
  readonly hasLaboratoryCuriosity: boolean;
  readonly hasMisconceptions: boolean;
  readonly hasPresentation: boolean;
  readonly hasPreferences: boolean;
  readonly hasGovernance: boolean;
  readonly hasStorage: boolean;
  readonly hasSafety: boolean;
  readonly hasTraceability: boolean;
  readonly hasMetadata: boolean;
  readonly hasValidation: boolean;
  readonly hasDeterminism: boolean;
  readonly hasImmutability: boolean;
  readonly hasDocumentation: boolean;
  readonly hasCrossAgentBoundary: boolean;
  readonly hasPublicApi: boolean;
}): CuriosityFacadeCompleteResult {
  const composeResult = composeCuriosityArtifact(params.input);

  const validation = validateCuriosityFacadeArtifact(composeResult);

  const certifyResult = certifyCuriosityFacadeArtifact({
    reportId: params.reportId,
    hasRegistry: composeResult.artifact.nodes.length > 0,
    hasPurpose: params.hasPurpose,
    hasHumor: params.hasHumor,
    hasCulturalReference: params.hasCulturalReference,
    hasCards: params.hasCards,
    hasKnowledgeEvolution: params.hasKnowledgeEvolution,
    hasDiscoveries: params.hasDiscoveries,
    hasLaboratoryCuriosity: params.hasLaboratoryCuriosity,
    hasMisconceptions: params.hasMisconceptions,
    hasPresentation: params.hasPresentation,
    hasPreferences: params.hasPreferences,
    hasGovernance: params.hasGovernance,
    hasStorage: params.hasStorage,
    hasSafety: params.hasSafety,
    hasTraceability: params.hasTraceability,
    hasMetadata: params.hasMetadata,
    hasValidation: params.hasValidation,
    hasDeterminism: params.hasDeterminism,
    hasImmutability: params.hasImmutability,
    hasDocumentation: params.hasDocumentation,
    hasCrossAgentBoundary: params.hasCrossAgentBoundary,
    hasPublicApi: params.hasPublicApi,
  });

  const facadeStatus: CuriosityFacadeStatus = validation.valid
    ? certifyResult.facadeStatus
    : 'internal';

  const trace = composeCuriosityFacadeTrace({
    traceId: `_facade_complete_${params.reportId}`,
  });

  return {
    facadeStatus,
    artifact: composeResult.artifact,
    validation,
    certificationReport: certifyResult.certificationReport,
    trace,
    deterministic: true,
    generatedFrom: 'deterministic_curiosity_pipeline_facade',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Validation: Facade Artifact
// ---------------------------------------------------------------------------

/**
 * Validates a facade artifact result.
 * Pure function. No side effects.
 */
export function validateCuriosityFacadeArtifact(
  result: CuriosityFacadeArtifactResult,
): CuriosityFacadeValidationResult {
  const errors: CuriosityFacadeValidationError[] = [];

  if (!result) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_ARTIFACT,
      message: 'Facade artifact result must be provided',
      path: 'result',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'curiosity_facade_validation',
    };
  }

  if (!result.artifact) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_ARTIFACT,
      message: 'Artifact must be provided',
      path: 'result.artifact',
    });
  }

  if (!result.trace) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_TRACE,
      message: 'Trace must be provided',
      path: 'result.trace',
    });
  }

  if (!CANONICAL_CURIOSITY_FACADE_STATUS.includes(result.facadeStatus)) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_INVALID_STATUS,
      message: `Invalid facade status: ${result.facadeStatus}`,
      path: 'result.facadeStatus',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_facade_validation',
  };
}

// ---------------------------------------------------------------------------
// Validation: Facade Certification
// ---------------------------------------------------------------------------

/**
 * Validates a facade certification result.
 * Pure function. No side effects.
 */
export function validateCuriosityFacadeCertification(
  result: CuriosityFacadeCertificationResult,
): CuriosityFacadeValidationResult {
  const errors: CuriosityFacadeValidationError[] = [];

  if (!result) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_CERTIFICATION_REPORT,
      message: 'Facade certification result must be provided',
      path: 'result',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'curiosity_facade_validation',
    };
  }

  if (!result.certificationReport) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_CERTIFICATION_REPORT,
      message: 'Certification report must be provided',
      path: 'result.certificationReport',
    });
  }

  if (!result.trace) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_TRACE,
      message: 'Trace must be provided',
      path: 'result.trace',
    });
  }

  if (!CANONICAL_CURIOSITY_FACADE_STATUS.includes(result.facadeStatus)) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_INVALID_STATUS,
      message: `Invalid facade status: ${result.facadeStatus}`,
      path: 'result.facadeStatus',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_facade_validation',
  };
}

// ---------------------------------------------------------------------------
// Validation: Facade Complete
// ---------------------------------------------------------------------------

/**
 * Validates a facade complete result.
 * Pure function. No side effects.
 */
export function validateCuriosityFacadeComplete(
  result: CuriosityFacadeCompleteResult,
): CuriosityFacadeValidationResult {
  const errors: CuriosityFacadeValidationError[] = [];

  if (!result) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_ARTIFACT,
      message: 'Facade complete result must be provided',
      path: 'result',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'curiosity_facade_validation',
    };
  }

  if (!result.artifact) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_ARTIFACT,
      message: 'Artifact must be provided',
      path: 'result.artifact',
    });
  }

  if (!result.validation) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_VALIDATION,
      message: 'Validation result must be provided',
      path: 'result.validation',
    });
  }

  if (!result.certificationReport) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_CERTIFICATION_REPORT,
      message: 'Certification report must be provided',
      path: 'result.certificationReport',
    });
  }

  if (!result.trace) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_MISSING_TRACE,
      message: 'Trace must be provided',
      path: 'result.trace',
    });
  }

  if (!CANONICAL_CURIOSITY_FACADE_STATUS.includes(result.facadeStatus)) {
    errors.push({
      code: CURIOSITY_FACADE_VALIDATION_CODES.CURIOSITY_FACADE_INVALID_STATUS,
      message: `Invalid facade status: ${result.facadeStatus}`,
      path: 'result.facadeStatus',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_facade_validation',
  };
}

// ---------------------------------------------------------------------------
// Helper: Type Guards
// ---------------------------------------------------------------------------

/**
 * Type guard for supported curiosity facade statuses.
 * Pure function. No side effects.
 */
export function isSupportedCuriosityFacadeStatus(
  value: string,
): value is CuriosityFacadeStatus {
  return CANONICAL_CURIOSITY_FACADE_STATUS.includes(value as CuriosityFacadeStatus);
}

// ---------------------------------------------------------------------------
// Helper: Canonical Getters (defensive copies)
// ---------------------------------------------------------------------------

/**
 * Returns canonical curiosity facade statuses.
 * Defensive copy. Pure function. No side effects.
 */
export function getCanonicalCuriosityFacadeStatuses(): readonly CuriosityFacadeStatus[] {
  return [...CANONICAL_CURIOSITY_FACADE_STATUS];
}
