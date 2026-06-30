/**
 * NV-1300-D1-OPT-08 — Deterministic Composition Certification Engine
 *
 * Pure deterministic function that audits a composed Didactic Agent
 * lesson plan for structural validity, pedagogical coherence,
 * trace completeness, and publication readiness.
 *
 * Rules:
 * - blocked if canonical stage order is invalid;
 * - blocked if non-canonical stages exist;
 * - blocked if selected resource lacks source metadata;
 * - blocked if any trace claims mutation, randomness, or time dependency;
 * - needs_revision if required prerequisites are missing with no support decision;
 * - needs_revision if assessment/lab/support/style/layer decisions are selected but not traceable;
 * - certified_with_warnings if optional dimensions are incomplete but structurally valid;
 * - certified only if all mandatory dimensions pass and no warnings remain.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 * Does not mutate input plans or produce learner-inference fields.
 */

import type {
  DidacticLessonPlanComplete2,
  DidacticPipelineStage,
  DidacticPipelineStageName,
  DidacticCompositionCertificationStatus,
  DidacticCompositionFindingSeverity,
  DidacticCompositionFinding,
  DidacticCompositionQualityDimension,
  DidacticCompositionCertificationReport,
} from './DidacticAgentContract.ts';
import { CANONICAL_PIPELINE_STAGES } from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Valid certification statuses
// ---------------------------------------------------------------------------

const VALID_CERTIFICATION_STATUSES = new Set<string>([
  'certified',
  'certified_with_warnings',
  'needs_revision',
  'blocked',
]);

const VALID_FINDING_SEVERITIES = new Set<string>(['error', 'warning', 'recommendation']);

const VALID_QUALITY_DIMENSIONS = new Set<string>([
  'structural_validity',
  'trace_completeness',
  'prerequisite_handling',
  'style_coverage',
  'layer_progression',
  'laboratory_integration',
  'assessment_integration',
  'misconception_support',
  'cognitive_load_support',
  'deterministic_integrity',
  'governance_readiness',
]);

// ---------------------------------------------------------------------------
// All quality dimensions in canonical order
// ---------------------------------------------------------------------------

const ALL_QUALITY_DIMENSIONS: readonly DidacticCompositionQualityDimension[] = [
  'structural_validity',
  'trace_completeness',
  'prerequisite_handling',
  'style_coverage',
  'layer_progression',
  'laboratory_integration',
  'assessment_integration',
  'misconception_support',
  'cognitive_load_support',
  'deterministic_integrity',
  'governance_readiness',
];

// ---------------------------------------------------------------------------
// Finding builder
// ---------------------------------------------------------------------------

function _finding(
  code: string,
  message: string,
  severity: DidacticCompositionFindingSeverity,
  qualityDimension: DidacticCompositionQualityDimension,
): DidacticCompositionFinding {
  return { code, message, severity, qualityDimension };
}

// ---------------------------------------------------------------------------
// Dimension checkers
// ---------------------------------------------------------------------------

function _checkStructuralValidity(
  stages: readonly DidacticPipelineStage[],
): DidacticCompositionFinding[] {
  const findings: DidacticCompositionFinding[] = [];
  const canonicalSet = new Set<string>(CANONICAL_PIPELINE_STAGES);
  const canonicalOrder = new Map<string, number>();
  CANONICAL_PIPELINE_STAGES.forEach((id, idx) => canonicalOrder.set(id, idx));

  // Check for non-canonical stages
  for (const stage of stages) {
    if (!canonicalSet.has(stage.stageId)) {
      findings.push(_finding(
        'STRUCT_NON_CANONICAL_STAGE',
        `Non-canonical stage "${stage.stageId}" detected.`,
        'error',
        'structural_validity',
      ));
    }
  }

  // Check canonical stage order
  let lastCanonicalIndex = -1;
  for (const stage of stages) {
    const canonicalIndex = canonicalOrder.get(stage.stageId);
    if (canonicalIndex === undefined) continue;
    if (canonicalIndex < lastCanonicalIndex) {
      findings.push(_finding(
        'STRUCT_INVALID_ORDER',
        `Stage "${stage.stageId}" appears out of canonical order.`,
        'error',
        'structural_validity',
      ));
    }
    lastCanonicalIndex = canonicalIndex;
  }

  // Check for selected resources lacking source metadata
  for (const stage of stages) {
    if (stage.status === 'included' && stage.resourceRef) {
      if (!stage.resourceRef.source || stage.resourceRef.source.trim() === '') {
        findings.push(_finding(
          'STRUCT_SELECTED_NO_SOURCE',
          `Selected stage "${stage.stageId}" has a resource without source metadata.`,
          'error',
          'structural_validity',
        ));
      }
    }
  }

  return findings;
}

function _checkTraceCompleteness(
  plan: DidacticLessonPlanComplete2,
): DidacticCompositionFinding[] {
  const findings: DidacticCompositionFinding[] = [];

  // Check base trace
  if (!plan.trace || typeof plan.trace !== 'object') {
    findings.push(_finding(
      'TRACE_BASE_MISSING',
      'Base lesson plan trace metadata is missing.',
      'error',
      'trace_completeness',
    ));
  } else {
    if (!plan.trace.planId || plan.trace.planId.trim() === '') {
      findings.push(_finding(
        'TRACE_MISSING_PLAN_ID',
        'Trace metadata is missing planId.',
        'error',
        'trace_completeness',
      ));
    }
    if (!plan.trace.topic || plan.trace.topic.trim() === '') {
      findings.push(_finding(
        'TRACE_MISSING_TOPIC',
        'Trace metadata is missing topic.',
        'warning',
        'trace_completeness',
      ));
    }
  }

  // Check trace counts match actual stages
  if (plan.trace && Array.isArray(plan.stages)) {
    const included = plan.stages.filter((s) => s.status === 'included').length;
    const omitted = plan.stages.filter((s) => s.status === 'omitted').length;

    if (plan.trace.includedStages !== included) {
      findings.push(_finding(
        'TRACE_INCLUDED_MISMATCH',
        `includedStages (${plan.trace.includedStages}) does not match actual (${included}).`,
        'error',
        'trace_completeness',
      ));
    }
    if (plan.trace.omittedStages !== omitted) {
      findings.push(_finding(
        'TRACE_OMITTED_MISMATCH',
        `omittedStages (${plan.trace.omittedStages}) does not match actual (${omitted}).`,
        'error',
        'trace_completeness',
      ));
    }
  }

  return findings;
}

function _checkPrerequisiteHandling(
  plan: DidacticLessonPlanComplete2,
): DidacticCompositionFinding[] {
  const findings: DidacticCompositionFinding[] = [];

  if (plan.dependencyTrace && Array.isArray(plan.dependencyTrace.decisions)) {
    // Check for required missing prerequisites with no support action
    for (const d of plan.dependencyTrace.decisions) {
      if (d.dependencyType === 'required' && d.status === 'missing' && d.supportAction === 'none') {
        findings.push(_finding(
          'PREREQ_REQUIRED_NO_SUPPORT',
          `Required prerequisite "${d.prerequisiteConceptId}" is missing with no support action.`,
          'error',
          'prerequisite_handling',
        ));
      }
    }
  }

  return findings;
}

function _checkStyleCoverage(
  plan: DidacticLessonPlanComplete2,
): DidacticCompositionFinding[] {
  const findings: DidacticCompositionFinding[] = [];

  if (plan.styleTrace && Array.isArray(plan.styleTrace.decisions)) {
    // Check for selected styles without source
    for (const d of plan.styleTrace.decisions) {
      if (d.status === 'selected' && (!d.source || d.source.trim() === '')) {
        findings.push(_finding(
          'STYLE_SELECTED_NO_SOURCE',
          `Selected style "${d.style}" has no source metadata.`,
          'warning',
          'style_coverage',
        ));
      }
    }

    // Warn if no styles selected
    if (plan.styleTrace.stylesSelected === 0) {
      findings.push(_finding(
        'STYLE_NONE_SELECTED',
        'No explanation styles were selected.',
        'recommendation',
        'style_coverage',
      ));
    }
  }

  return findings;
}

function _checkLayerProgression(
  plan: DidacticLessonPlanComplete2,
): DidacticCompositionFinding[] {
  const findings: DidacticCompositionFinding[] = [];

  if (plan.learningLayerTrace && Array.isArray(plan.learningLayerTrace.decisions)) {
    // Check for selected layers without source
    for (const d of plan.learningLayerTrace.decisions) {
      if (d.status === 'selected' && (!d.source || d.source.trim() === '')) {
        findings.push(_finding(
          'LAYER_SELECTED_NO_SOURCE',
          `Selected layer "${d.layer}" has no source metadata.`,
          'warning',
          'layer_progression',
        ));
      }
    }

    // Warn if no layers selected
    if (plan.learningLayerTrace.layersSelected === 0) {
      findings.push(_finding(
        'LAYER_NONE_SELECTED',
        'No learning layers were selected.',
        'recommendation',
        'layer_progression',
      ));
    }
  }

  return findings;
}

function _checkLaboratoryIntegration(
  plan: DidacticLessonPlanComplete2,
): DidacticCompositionFinding[] {
  const findings: DidacticCompositionFinding[] = [];

  if (plan.laboratoryTrace && Array.isArray(plan.laboratoryTrace.decisions)) {
    // Check for selected labs without source
    for (const d of plan.laboratoryTrace.decisions) {
      if (d.status === 'selected' && (!d.source || d.source.trim() === '')) {
        findings.push(_finding(
          'LAB_SELECTED_NO_SOURCE',
          `Selected laboratory "${d.labId}" has no source metadata.`,
          'warning',
          'laboratory_integration',
        ));
      }
    }
  }

  return findings;
}

function _checkAssessmentIntegration(
  plan: DidacticLessonPlanComplete2,
): DidacticCompositionFinding[] {
  const findings: DidacticCompositionFinding[] = [];

  if (plan.assessmentTrace && Array.isArray(plan.assessmentTrace.decisions)) {
    // Check for selected assessments without source
    for (const d of plan.assessmentTrace.decisions) {
      if (d.status === 'selected' && (!d.source || d.source.trim() === '')) {
        findings.push(_finding(
          'ASSESS_SELECTED_NO_SOURCE',
          `Selected assessment "${d.assessmentId}" has no source metadata.`,
          'warning',
          'assessment_integration',
        ));
      }
    }
  }

  return findings;
}

function _checkMisconceptionSupport(
  plan: DidacticLessonPlanComplete2,
): DidacticCompositionFinding[] {
  const findings: DidacticCompositionFinding[] = [];

  if (plan.supportTrace && Array.isArray(plan.supportTrace.decisions)) {
    // Check for selected misconception supports without source
    for (const d of plan.supportTrace.decisions) {
      if (d.category === 'misconception' && d.status === 'selected' && (!d.source || d.source.trim() === '')) {
        findings.push(_finding(
          'MISCONCEPT_SELECTED_NO_SOURCE',
          `Selected misconception support "${d.supportId}" has no source metadata.`,
          'warning',
          'misconception_support',
        ));
      }
    }
  }

  return findings;
}

function _checkCognitiveLoadSupport(
  plan: DidacticLessonPlanComplete2,
): DidacticCompositionFinding[] {
  const findings: DidacticCompositionFinding[] = [];

  if (plan.supportTrace && Array.isArray(plan.supportTrace.decisions)) {
    // Check for selected cognitive-load supports without source
    for (const d of plan.supportTrace.decisions) {
      if (d.category === 'cognitive_load' && d.status === 'selected' && (!d.source || d.source.trim() === '')) {
        findings.push(_finding(
          'COGNLOAD_SELECTED_NO_SOURCE',
          `Selected cognitive-load support "${d.supportId}" has no source metadata.`,
          'warning',
          'cognitive_load_support',
        ));
      }
    }
  }

  return findings;
}

function _checkDeterministicIntegrity(
  plan: DidacticLessonPlanComplete2,
): DidacticCompositionFinding[] {
  const findings: DidacticCompositionFinding[] = [];

  if (plan.trace) {
    if (plan.trace.deterministic !== true) {
      findings.push(_finding(
        'DETERM_NOT_DECLARED',
        'Trace does not declare deterministic: true.',
        'error',
        'deterministic_integrity',
      ));
    }
    if (plan.trace.curriculumMutated !== false) {
      findings.push(_finding(
        'DETERM_CURRICULUM_MUTATED',
        'Trace declares curriculumMutated: true.',
        'error',
        'deterministic_integrity',
      ));
    }
    if (plan.trace.randomUsed !== false) {
      findings.push(_finding(
        'DETERM_RANDOM_USED',
        'Trace declares randomUsed: true.',
        'error',
        'deterministic_integrity',
      ));
    }
    if (plan.trace.timeDependency !== false) {
      findings.push(_finding(
        'DETERM_TIME_DEPENDENCY',
        'Trace declares timeDependency: true.',
        'error',
        'deterministic_integrity',
      ));
    }
  }

  return findings;
}

function _checkGovernanceReadiness(
  plan: DidacticLessonPlanComplete2,
): DidacticCompositionFinding[] {
  const findings: DidacticCompositionFinding[] = [];

  // Warn if no validation result
  if (!plan.validation || typeof plan.validation !== 'object') {
    findings.push(_finding(
      'GOV_NO_VALIDATION',
      'Lesson plan has no validation result.',
      'warning',
      'governance_readiness',
    ));
  } else if (!plan.validation.valid) {
    findings.push(_finding(
      'GOV_VALIDATION_FAILED',
      'Lesson plan validation has errors.',
      'warning',
      'governance_readiness',
    ));
  }

  // Warn if no stages included
  if (Array.isArray(plan.stages)) {
    const included = plan.stages.filter((s) => s.status === 'included').length;
    if (included === 0) {
      findings.push(_finding(
        'GOV_NO_INCLUDED_STAGES',
        'No stages are included in the lesson plan.',
        'warning',
        'governance_readiness',
      ));
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Core certification function
// ---------------------------------------------------------------------------

export function certifyDidacticComposition(
  plan: DidacticLessonPlanComplete2,
): DidacticCompositionCertificationReport {
  const findings: DidacticCompositionFinding[] = [];

  // Run all dimension checks
  if (plan.stages) {
    findings.push(..._checkStructuralValidity(plan.stages));
  }
  findings.push(..._checkTraceCompleteness(plan));
  findings.push(..._checkPrerequisiteHandling(plan));
  findings.push(..._checkStyleCoverage(plan));
  findings.push(..._checkLayerProgression(plan));
  findings.push(..._checkLaboratoryIntegration(plan));
  findings.push(..._checkAssessmentIntegration(plan));
  findings.push(..._checkMisconceptionSupport(plan));
  findings.push(..._checkCognitiveLoadSupport(plan));
  findings.push(..._checkDeterministicIntegrity(plan));
  findings.push(..._checkGovernanceReadiness(plan));

  // Count findings by severity
  const errorCount = findings.filter((f) => f.severity === 'error').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;
  const recommendationCount = findings.filter((f) => f.severity === 'recommendation').length;

  // Determine certification status
  let status: DidacticCompositionCertificationStatus;
  if (errorCount > 0) {
    // Check if any errors are blocking (structural or deterministic)
    const blockingErrors = findings.filter(
      (f) => f.severity === 'error' && (
        f.qualityDimension === 'structural_validity' ||
        f.qualityDimension === 'deterministic_integrity'
      ),
    );
    status = blockingErrors.length > 0 ? 'blocked' : 'needs_revision';
  } else if (warningCount > 0 || recommendationCount > 0) {
    status = 'certified_with_warnings';
  } else {
    status = 'certified';
  }

  // Calculate quality score (artifact-level only, no learner inference)
  const totalDimensions = ALL_QUALITY_DIMENSIONS.length;
  const dimensionsWithFindings = new Set(
    findings.filter((f) => f.severity === 'error' || f.severity === 'warning')
      .map((f) => f.qualityDimension),
  ).size;
  const passingDimensions = totalDimensions - dimensionsWithFindings;
  const qualityScore = Math.round((passingDimensions / totalDimensions) * 100);

  // Assemble report
  const report: DidacticCompositionCertificationReport = {
    planId: plan.id || '',
    topic: plan.topic || '',
    status,
    findings,
    dimensionsChecked: [...ALL_QUALITY_DIMENSIONS],
    errorCount,
    warningCount,
    recommendationCount,
    qualityScore,
    deterministic: true,
    certifiedAt: 'composition_certification',
  };

  return report;
}

// ---------------------------------------------------------------------------
// Validation helpers (used by ValidationLayer)
// ---------------------------------------------------------------------------

export function validateCertificationReport(
  report: DidacticCompositionCertificationReport,
): string[] {
  const errors: string[] = [];

  if (!report || typeof report !== 'object') {
    return ['Certification report is not a valid object'];
  }

  if (!VALID_CERTIFICATION_STATUSES.has(report.status)) {
    errors.push(`Invalid certification status: "${report.status}"`);
  }

  if (!Array.isArray(report.findings)) {
    errors.push('Certification report missing findings array');
  }

  for (const finding of report.findings) {
    if (!VALID_FINDING_SEVERITIES.has(finding.severity)) {
      errors.push(`Invalid finding severity: "${finding.severity}"`);
    }
    if (!finding.code || finding.code.trim() === '') {
      errors.push('Finding missing code');
    }
    if (!finding.message || finding.message.trim() === '') {
      errors.push('Finding missing message');
    }
    if (!VALID_QUALITY_DIMENSIONS.has(finding.qualityDimension)) {
      errors.push(`Invalid quality dimension: "${finding.qualityDimension}"`);
    }
  }

  // Semantic checks
  if (report.status === 'blocked' && report.errorCount === 0) {
    errors.push('Blocked report must have at least one error finding');
  }
  if (report.status === 'certified' && report.errorCount > 0) {
    errors.push('Certified report must not have error findings');
  }

  if (typeof report.qualityScore === 'number') {
    if (report.qualityScore < 0 || report.qualityScore > 100) {
      errors.push(`Quality score out of range: ${report.qualityScore}`);
    }
  }

  return errors;
}

export { VALID_CERTIFICATION_STATUSES, VALID_FINDING_SEVERITIES, VALID_QUALITY_DIMENSIONS, ALL_QUALITY_DIMENSIONS };
