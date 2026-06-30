/**
 * NV-1300-D1-OPT-09 — Didactic Pipeline Public Facade
 *
 * Canonical public API for the Didactic Agent deterministic lesson pipeline.
 * Consolidates D1-OPT-01 through D1-OPT-08 into a stable, readable facade
 * while preserving backward compatibility with all previous composer functions.
 *
 * This module exposes three canonical entrypoints:
 * - composeDidacticLessonPlan(input) — compose a complete lesson plan
 * - certifyDidacticLessonPlan(plan) — certify a composed lesson plan
 * - composeAndCertifyDidacticLessonPlan(input) — compose + certify in one call
 *
 * Previous composer functions remain available as backward-compatible aliases.
 *
 * Guarantees:
 * - Same inputs always produce identical outputs.
 * - No global mutable state reads.
 * - No random values.
 * - No time dependency.
 * - Canonical stage order is always preserved.
 * - No curriculum mutation. No content fabrication.
 * - No learner inference.
 *
 * Deterministic. No Math.random. No Date.now.
 */

import type {
  DidacticLessonInputComplete2,
  DidacticLessonPlanComplete2,
  DidacticCompositionCertificationReport,
} from './DidacticAgentContract.ts';
import { composeLessonPlanComplete2 } from './PipelineComposer.ts';
import { certifyDidacticComposition } from './CompositionCertificationEngine.ts';
import { validateLessonPlanComplete2 } from './ValidationLayer.ts';

// ---------------------------------------------------------------------------
// Facade Output Types
// ---------------------------------------------------------------------------

/**
 * Canonical output of composeDidacticLessonPlan.
 * Contains the enriched lesson plan with all orchestration traces.
 */
export interface DidacticFacadeLessonPlanOutput {
  readonly lessonPlan: DidacticLessonPlanComplete2;
  readonly validationResult: DidacticValidationResult;
  readonly traceMetadata: DidacticFacadeTraceMetadata;
}

/**
 * Canonical output of certifyDidacticLessonPlan.
 * Contains the certification report for governance review.
 */
export interface DidacticFacadeCertificationOutput {
  readonly certificationReport: DidacticCompositionCertificationReport;
  readonly validationResult: DidacticValidationResult;
  readonly traceMetadata: DidacticFacadeTraceMetadata;
}

/**
 * Canonical output of composeAndCertifyDidacticLessonPlan.
 * Contains both the lesson plan and certification report.
 */
export interface DidacticFacadeCompleteOutput {
  readonly lessonPlan: DidacticLessonPlanComplete2;
  readonly certificationReport: DidacticCompositionCertificationReport;
  readonly validationResult: DidacticValidationResult;
  readonly certificationValidation: DidacticValidationResult;
  readonly traceMetadata: DidacticFacadeTraceMetadata;
}

/**
 * Facade trace metadata — lightweight governance trail for facade operations.
 */
export interface DidacticFacadeTraceMetadata {
  readonly facadeVersion: '1.0.0';
  readonly composed: boolean;
  readonly certified: boolean;
  readonly deterministic: true;
  readonly generatedFrom: 'didactic_pipeline_facade';
}

// ---------------------------------------------------------------------------
// Re-export validation type for facade
// ---------------------------------------------------------------------------

import type { DidacticValidationResult } from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Canonical Facade Entrypoints
// ---------------------------------------------------------------------------

/**
 * Compose a complete Didactic Agent lesson plan.
 *
 * This is the canonical high-level composition entrypoint.
 * It delegates to the full pipeline composer (D1-OPT-01 through D1-OPT-07)
 * and returns the enriched lesson plan with validation.
 *
 * @param input - Complete lesson input with all orchestration resources
 * @returns Facade output containing lesson plan, validation, and trace metadata
 */
export function composeDidacticLessonPlan(
  input: DidacticLessonInputComplete2,
): DidacticFacadeLessonPlanOutput {
  // 1. Compose the lesson plan
  const lessonPlan = composeLessonPlanComplete2(input);

  // 2. Validate the result
  const validationResult = validateLessonPlanComplete2(lessonPlan);

  // 3. Build facade trace metadata
  const traceMetadata: DidacticFacadeTraceMetadata = {
    facadeVersion: '1.0.0',
    composed: true,
    certified: false,
    deterministic: true,
    generatedFrom: 'didactic_pipeline_facade',
  };

  return {
    lessonPlan,
    validationResult,
    traceMetadata,
  };
}

/**
 * Certify a composed Didactic Agent lesson plan.
 *
 * This is the canonical certification entrypoint.
 * It delegates to the certification engine (D1-OPT-08)
 * and returns the certification report with validation.
 *
 * @param plan - A composed lesson plan to certify
 * @returns Facade output containing certification report, validation, and trace metadata
 */
export function certifyDidacticLessonPlan(
  plan: DidacticLessonPlanComplete2,
): DidacticFacadeCertificationOutput {
  // 1. Certify the composition
  const certificationReport = certifyDidacticComposition(plan);

  // 2. Validate the certification report
  const validationResult = validateCertificationReportInternal(certificationReport);

  // 3. Build facade trace metadata
  const traceMetadata: DidacticFacadeTraceMetadata = {
    facadeVersion: '1.0.0',
    composed: false,
    certified: true,
    deterministic: true,
    generatedFrom: 'didactic_pipeline_facade',
  };

  return {
    certificationReport,
    validationResult,
    traceMetadata,
  };
}

/**
 * Compose and certify a Didactic Agent lesson plan in a single call.
 *
 * This is the canonical all-in-one entrypoint that produces both
 * the lesson plan and its certification report.
 *
 * @param input - Complete lesson input with all orchestration resources
 * @returns Facade output containing lesson plan, certification report, and trace metadata
 */
export function composeAndCertifyDidacticLessonPlan(
  input: DidacticLessonInputComplete2,
): DidacticFacadeCompleteOutput {
  // 1. Compose the lesson plan
  const compositionOutput = composeDidacticLessonPlan(input);

  // 2. Certify the composed plan
  const certificationOutput = certifyDidacticLessonPlan(compositionOutput.lessonPlan);

  // 3. Build facade trace metadata
  const traceMetadata: DidacticFacadeTraceMetadata = {
    facadeVersion: '1.0.0',
    composed: true,
    certified: true,
    deterministic: true,
    generatedFrom: 'didactic_pipeline_facade',
  };

  return {
    lessonPlan: compositionOutput.lessonPlan,
    certificationReport: certificationOutput.certificationReport,
    validationResult: compositionOutput.validationResult,
    certificationValidation: certificationOutput.validationResult,
    traceMetadata,
  };
}

// ---------------------------------------------------------------------------
// Internal Validation Helper
// ---------------------------------------------------------------------------

/**
 * Validates a certification report using the validation layer.
 * This is an internal helper — the public validateCertificationReport
 * is exported from ValidationLayer.ts.
 */
function validateCertificationReportInternal(
  report: import('./DidacticAgentContract.ts').DidacticCompositionCertificationReport,
): DidacticValidationResult {
  const errors: import('./DidacticAgentContract.ts').DidacticValidationError[] = [];

  if (!report || typeof report !== 'object') {
    return {
      valid: false,
      errors: [{ code: 'INVALID_CERTIFICATION_REPORT', message: 'Certification report is not a valid object.' }],
      checkedAt: 'plan_generation',
    };
  }

  const validStatuses = new Set(['certified', 'certified_with_warnings', 'needs_revision', 'blocked']);
  if (!validStatuses.has(report.status)) {
    errors.push({
      code: 'CERT_INVALID_STATUS',
      message: `Invalid certification status: "${report.status}".`,
    });
  }

  if (report.status === 'blocked' && report.errorCount === 0) {
    errors.push({
      code: 'CERT_BLOCKED_NO_ERROR',
      message: 'Blocked report must have at least one error finding.',
    });
  }

  if (report.status === 'certified' && report.errorCount > 0) {
    errors.push({
      code: 'CERT_CERTIFIED_HAS_ERROR',
      message: 'Certified report must not have error findings.',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'plan_generation',
  };
}
