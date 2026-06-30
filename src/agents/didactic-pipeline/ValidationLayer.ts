/**
 * NV-1300-D1-OPT-01 / D1-OPT-02 / D1-OPT-03 / D1-OPT-04 / D1-OPT-05 / D1-OPT-06 / D1-OPT-07 / D1-OPT-08 — Deterministic Validation Layer
 *
 * Validates lesson plans against structural and governance invariants.
 * Returns structured errors, never only console messages.
 *
 * D1-OPT-08: validates composition certification reports.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  DidacticLessonPlan,
  DidacticPipelineStage,
  DidacticPipelineStageName,
  DidacticValidationError,
  DidacticValidationResult,
  DidacticLessonPlanWithDependencies,
  DidacticDependencyTrace,
  DidacticLessonPlanWithStyles,
  DidacticStyleTrace,
  DidacticLessonPlanFull,
  DidacticLessonPlanComplete,
  DidacticLearningLayerTrace,
  DidacticLessonPlanAll,
  DidacticLaboratoryTrace,
  DidacticLessonPlanFinal,
  DidacticAssessmentTrace,
  DidacticLessonPlanComplete2,
  DidacticSupportTrace,
  DidacticCompositionCertificationReport,
} from './DidacticAgentContract.ts';
import { CANONICAL_PIPELINE_STAGES } from './DidacticAgentContract.ts';
import { VALID_DEPENDENCY_TYPES, VALID_REQUIRED_DEPTHS } from './PrerequisiteAnalyzer.ts';
import { VALID_EXPLANATION_STYLES } from './ExplanationStyleSelector.ts';
import { VALID_LEARNING_LAYERS, VALID_DEPTH_MODES } from './LearningLayerOrchestrator.ts';
import { VALID_INTEGRATION_MODES } from './LaboratoryOrchestrator.ts';
import { VALID_CHECKPOINT_TYPES } from './AssessmentOrchestrator.ts';
import { VALID_MISCONCEPTION_TYPES, VALID_COGNITIVE_LOAD_TYPES } from './InstructionalSupportOrchestrator.ts';
import { VALID_CERTIFICATION_STATUSES, VALID_FINDING_SEVERITIES, VALID_QUALITY_DIMENSIONS } from './CompositionCertificationEngine.ts';

// ---------------------------------------------------------------------------
// Validation Functions — Base Stage Validation
// ---------------------------------------------------------------------------

function _checkCanonicalStageNames(stages: readonly DidacticPipelineStage[]): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];
  const canonicalSet = new Set<string>(CANONICAL_PIPELINE_STAGES);

  for (const stage of stages) {
    if (!canonicalSet.has(stage.stageId)) {
      errors.push({
        code: 'NON_CANONICAL_STAGE',
        message: `Non-canonical stage name: "${stage.stageId}"`,
        stageId: stage.stageId,
      });
    }
  }

  return errors;
}

function _checkStageOrder(stages: readonly DidacticPipelineStage[]): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];
  const canonicalOrder = new Map<string, number>();
  CANONICAL_PIPELINE_STAGES.forEach((id, idx) => canonicalOrder.set(id, idx));

  let lastCanonicalIndex = -1;
  for (const stage of stages) {
    const canonicalIndex = canonicalOrder.get(stage.stageId);
    if (canonicalIndex === undefined) continue;

    if (canonicalIndex < lastCanonicalIndex) {
      errors.push({
        code: 'INVALID_STAGE_ORDER',
        message: `Stage "${stage.stageId}" appears out of canonical order.`,
        stageId: stage.stageId,
      });
    }
    lastCanonicalIndex = canonicalIndex;
  }

  return errors;
}

function _checkDuplicateStageIds(stages: readonly DidacticPipelineStage[]): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];
  const seen = new Map<string, number>();

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const prevIndex = seen.get(stage.stageId);
    if (prevIndex !== undefined) {
      errors.push({
        code: 'DUPLICATE_STAGE_ID',
        message: `Duplicate stage ID "${stage.stageId}" at index ${i}.`,
        stageId: stage.stageId,
      });
    } else {
      seen.set(stage.stageId, i);
    }
  }

  return errors;
}

function _checkMissingStageMetadata(stages: readonly DidacticPipelineStage[]): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  for (const stage of stages) {
    if (!stage.label || stage.label.trim() === '') {
      errors.push({
        code: 'MISSING_STAGE_LABEL',
        message: `Stage "${stage.stageId}" is missing a label.`,
        stageId: stage.stageId,
      });
    }
    if (!stage.description || stage.description.trim() === '') {
      errors.push({
        code: 'MISSING_STAGE_DESCRIPTION',
        message: `Stage "${stage.stageId}" is missing a description.`,
        stageId: stage.stageId,
      });
    }
    if (typeof stage.order !== 'number' || stage.order < 0) {
      errors.push({
        code: 'MISSING_STAGE_ORDER',
        message: `Stage "${stage.stageId}" has invalid or missing order.`,
        stageId: stage.stageId,
      });
    }
  }

  return errors;
}

function _checkUnsupportedStageStatus(stages: readonly DidacticPipelineStage[]): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];
  const validStatuses = new Set(['included', 'omitted', 'blocked', 'invalid']);

  for (const stage of stages) {
    if (!validStatuses.has(stage.status)) {
      errors.push({
        code: 'UNSUPPORTED_STAGE_STATUS',
        message: `Stage "${stage.stageId}" has unsupported status: "${stage.status}".`,
        stageId: stage.stageId,
      });
    }
  }

  return errors;
}

function _checkOmittedWithoutReason(stages: readonly DidacticPipelineStage[]): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  for (const stage of stages) {
    if (stage.status === 'omitted' && !stage.omissionReason) {
      errors.push({
        code: 'OMITTED_WITHOUT_REASON',
        message: `Stage "${stage.stageId}" is omitted but has no omission reason.`,
        stageId: stage.stageId,
      });
    }
    if (stage.status === 'omitted' && stage.omissionReason && !stage.omissionReason.reason) {
      errors.push({
        code: 'OMITTED_WITHOUT_REASON',
        message: `Stage "${stage.stageId}" is omitted but omission reason is empty.`,
        stageId: stage.stageId,
      });
    }
  }

  return errors;
}

function _checkTraceMetadata(plan: DidacticLessonPlan): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!plan.trace) {
    errors.push({
      code: 'MISSING_TRACE_METADATA',
      message: 'Lesson plan is missing trace metadata.',
    });
  } else {
    if (!plan.trace.planId) {
      errors.push({
        code: 'MISSING_TRACE_PLAN_ID',
        message: 'Trace metadata is missing planId.',
      });
    }
    if (plan.trace.deterministic !== true) {
      errors.push({
        code: 'TRACE_NOT_DETERMINISTIC',
        message: 'Trace metadata must declare deterministic: true.',
      });
    }
    if (plan.trace.curriculumMutated !== false) {
      errors.push({
        code: 'TRACE_CURRICULUM_MUTATED',
        message: 'Trace metadata must declare curriculumMutated: false.',
      });
    }
    if (plan.trace.randomUsed !== false) {
      errors.push({
        code: 'TRACE_RANDOM_USED',
        message: 'Trace metadata must declare randomUsed: false.',
      });
    }
    if (plan.trace.timeDependency !== false) {
      errors.push({
        code: 'TRACE_TIME_DEPENDENCY',
        message: 'Trace metadata must declare timeDependency: false.',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// D1-OPT-02 — Prerequisite Validation Functions
// ---------------------------------------------------------------------------

function _checkPrerequisiteDecisions(
  trace: DidacticDependencyTrace,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    return errors;
  }

  if (!Array.isArray(trace.decisions)) {
    return errors;
  }

  for (let i = 0; i < trace.decisions.length; i++) {
    const d = trace.decisions[i];

    if (!d.rationale || d.rationale.trim() === '') {
      errors.push({
        code: 'PREREQ_DECISION_NO_RATIONALE',
        message: `Prerequisite decision for "${d.prerequisiteConceptId}" is missing rationale.`,
      });
    }

    if (!d.source || d.source.trim() === '') {
      errors.push({
        code: 'PREREQ_MISSING_SOURCE',
        message: `Prerequisite decision for "${d.prerequisiteConceptId}" is missing source.`,
      });
    }

    if (!VALID_DEPENDENCY_TYPES.has(d.dependencyType)) {
      errors.push({
        code: 'PREREQ_UNSUPPORTED_DEPENDENCY_TYPE',
        message: `Unsupported dependency type: "${d.dependencyType}".`,
      });
    }

    if (!VALID_REQUIRED_DEPTHS.has(d.requiredDepth)) {
      errors.push({
        code: 'PREREQ_UNSUPPORTED_REQUIRED_DEPTH',
        message: `Unsupported required depth: "${d.requiredDepth}".`,
      });
    }

    if (
      d.dependencyType === 'required' &&
      d.status === 'missing' &&
      d.supportAction !== 'block_or_recap_required'
    ) {
      errors.push({
        code: 'PREREQ_REQUIRED_MISSING_NO_ACTION',
        message: `Required prerequisite "${d.prerequisiteConceptId}" is missing but support action is "${d.supportAction}".`,
      });
    }

    if (d.status === 'unknown') {
      errors.push({
        code: 'PREREQ_UNKNOWN_STATUS_TREATED_AS_KNOWN',
        message: `Prerequisite "${d.prerequisiteConceptId}" has unknown status.`,
      });
    }
  }

  return errors;
}

function _checkDependencyTraceStructure(
  trace: DidacticDependencyTrace,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    return errors;
  }

  if (!trace.conceptId || trace.conceptId.trim() === '') {
    errors.push({
      code: 'DEPENDENCY_TRACE_MISSING_CONCEPT_ID',
      message: 'Dependency trace is missing conceptId.',
    });
  }

  return errors;
}

function _checkBlockedStagesWithoutTrace(
  stages: readonly DidacticPipelineStage[],
  trace: DidacticDependencyTrace | undefined,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!trace) {
    for (const stage of stages) {
      if (stage.status === 'blocked') {
        errors.push({
          code: 'BLOCKED_STAGE_NO_DEPENDENCY_TRACE',
          message: `Stage "${stage.stageId}" is blocked but no dependency trace is attached.`,
          stageId: stage.stageId,
        });
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// D1-OPT-03 — Style Validation Functions
// ---------------------------------------------------------------------------

function _checkStyleDecisions(
  trace: DidacticStyleTrace,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    return errors;
  }

  if (!Array.isArray(trace.decisions)) {
    return errors;
  }

  const seenStyles = new Set<string>();

  for (let i = 0; i < trace.decisions.length; i++) {
    const d = trace.decisions[i];

    if (!VALID_EXPLANATION_STYLES.has(d.style)) {
      errors.push({
        code: 'STYLE_UNSUPPORTED',
        message: `Unsupported explanation style: "${d.style}".`,
      });
    }

    if (seenStyles.has(d.style)) {
      errors.push({
        code: 'STYLE_DUPLICATE_DECISION',
        message: `Duplicate style decision for "${d.style}".`,
      });
    }
    seenStyles.add(d.style);

    if (d.status === 'selected') {
      if (!d.resourceId || d.resourceId.trim() === '') {
        errors.push({
          code: 'STYLE_SELECTED_NO_RESOURCE',
          message: `Selected style "${d.style}" is missing resourceId.`,
        });
      }
      if (!d.source || d.source.trim() === '') {
        errors.push({
          code: 'STYLE_MISSING_SOURCE',
          message: `Style decision for "${d.style}" is missing source.`,
        });
      }
      if (!d.pedagogicalPurpose || d.pedagogicalPurpose.trim() === '') {
        errors.push({
          code: 'STYLE_MISSING_PEDAGOGICAL_PURPOSE',
          message: `Style decision for "${d.style}" is missing pedagogicalPurpose.`,
        });
      }
    }

    if (d.status === 'omitted') {
      if (!d.omissionReason || d.omissionReason.trim() === '') {
        errors.push({
          code: 'STYLE_OMITTED_NO_REASON',
          message: `Omitted style "${d.style}" is missing omissionReason.`,
        });
      }
    }
  }

  return errors;
}

function _checkStyleTraceStructure(
  trace: DidacticStyleTrace,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    return errors;
  }

  if (Array.isArray(trace.decisions)) {
    const selectedCount = trace.decisions.filter((d) => d.status === 'selected').length;
    const omittedCount = trace.decisions.filter((d) => d.status === 'omitted').length;

    if (trace.stylesSelected !== selectedCount) {
      errors.push({
        code: 'STYLE_TRACE_COUNT_MISMATCH',
        message: `stylesSelected (${trace.stylesSelected}) does not match actual selected count (${selectedCount}).`,
      });
    }
    if (trace.stylesOmitted !== omittedCount) {
      errors.push({
        code: 'STYLE_TRACE_COUNT_MISMATCH',
        message: `stylesOmitted (${trace.stylesOmitted}) does not match actual omitted count (${omittedCount}).`,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// D1-OPT-04 — Learning Layer Validation Functions
// ---------------------------------------------------------------------------

function _checkLayerDecisions(
  trace: DidacticLearningLayerTrace,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    return errors;
  }

  if (!Array.isArray(trace.decisions)) {
    return errors;
  }

  // validate depth mode
  if (!VALID_DEPTH_MODES.has(trace.depthMode)) {
    errors.push({
      code: 'LAYER_UNSUPPORTED_DEPTH_MODE',
      message: `Unsupported depth mode: "${trace.depthMode}".`,
    });
  }

  const seenLayers = new Set<string>();

  for (let i = 0; i < trace.decisions.length; i++) {
    const d = trace.decisions[i];

    // unsupported learning layer
    if (!VALID_LEARNING_LAYERS.has(d.layer)) {
      errors.push({
        code: 'LAYER_UNSUPPORTED',
        message: `Unsupported learning layer: "${d.layer}".`,
      });
    }

    // duplicate layer decision
    if (seenLayers.has(d.layer)) {
      errors.push({
        code: 'LAYER_DUPLICATE_DECISION',
        message: `Duplicate layer decision for "${d.layer}".`,
      });
    }
    seenLayers.add(d.layer);

    if (d.status === 'selected') {
      // selected layer without resourceId
      if (!d.resourceId || d.resourceId.trim() === '') {
        errors.push({
          code: 'LAYER_SELECTED_NO_RESOURCE',
          message: `Selected layer "${d.layer}" is missing resourceId.`,
        });
      }

      // layer decision without source
      if (!d.source || d.source.trim() === '') {
        errors.push({
          code: 'LAYER_MISSING_SOURCE',
          message: `Layer decision for "${d.layer}" is missing source.`,
        });
      }

      // layer decision without pedagogical purpose
      if (!d.pedagogicalPurpose || d.pedagogicalPurpose.trim() === '') {
        errors.push({
          code: 'LAYER_MISSING_PEDAGOGICAL_PURPOSE',
          message: `Layer decision for "${d.layer}" is missing pedagogicalPurpose.`,
        });
      }
    }

    if (d.status === 'omitted') {
      // omitted requested layer without omission reason
      if (!d.omissionReason || d.omissionReason.trim() === '') {
        errors.push({
          code: 'LAYER_OMITTED_NO_REASON',
          message: `Omitted layer "${d.layer}" is missing omissionReason.`,
        });
      }
    }
  }

  return errors;
}

function _checkLayerTraceStructure(
  trace: DidacticLearningLayerTrace,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    return errors;
  }

  // Verify counts match decisions
  if (Array.isArray(trace.decisions)) {
    const selectedCount = trace.decisions.filter((d) => d.status === 'selected').length;
    const omittedCount = trace.decisions.filter((d) => d.status === 'omitted').length;

    if (trace.layersSelected !== selectedCount) {
      errors.push({
        code: 'LAYER_TRACE_COUNT_MISMATCH',
        message: `layersSelected (${trace.layersSelected}) does not match actual selected count (${selectedCount}).`,
      });
    }
    if (trace.layersOmitted !== omittedCount) {
      errors.push({
        code: 'LAYER_TRACE_COUNT_MISMATCH',
        message: `layersOmitted (${trace.layersOmitted}) does not match actual omitted count (${omittedCount}).`,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// D1-OPT-05 — Laboratory Validation Functions
// ---------------------------------------------------------------------------

function _checkLabDecisions(
  trace: DidacticLaboratoryTrace,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    return errors;
  }

  if (!Array.isArray(trace.decisions)) {
    return errors;
  }

  const seenLabs = new Set<string>();

  for (let i = 0; i < trace.decisions.length; i++) {
    const d = trace.decisions[i];

    // unsupported integration mode
    if (!VALID_INTEGRATION_MODES.has(d.integrationMode)) {
      errors.push({
        code: 'LAB_UNSUPPORTED_MODE',
        message: `Unsupported laboratory integration mode: "${d.integrationMode}".`,
      });
    }

    // duplicate lab decision
    if (seenLabs.has(d.labId)) {
      errors.push({
        code: 'LAB_DUPLICATE_DECISION',
        message: `Duplicate laboratory decision for "${d.labId}".`,
      });
    }
    seenLabs.add(d.labId);

    if (d.status === 'selected') {
      // selected lab without labId
      if (!d.labId || d.labId.trim() === '') {
        errors.push({
          code: 'LAB_SELECTED_NO_LAB_ID',
          message: 'Selected laboratory is missing labId.',
        });
      }

      // lab decision without source
      if (!d.source || d.source.trim() === '') {
        errors.push({
          code: 'LAB_MISSING_SOURCE',
          message: `Laboratory decision for "${d.labId}" is missing source.`,
        });
      }

      // lab decision without pedagogical objective
      if (!d.pedagogicalObjective || d.pedagogicalObjective.trim() === '') {
        errors.push({
          code: 'LAB_MISSING_PEDAGOGICAL_OBJECTIVE',
          message: `Laboratory decision for "${d.labId}" is missing pedagogicalObjective.`,
        });
      }

      // lab mapped to non-canonical stage
      if (!CANONICAL_PIPELINE_STAGES.includes(d.targetStageId)) {
        errors.push({
          code: 'LAB_MAPPED_TO_NON_CANONICAL_STAGE',
          message: `Laboratory "${d.labId}" mapped to non-canonical stage "${d.targetStageId}".`,
          stageId: d.targetStageId,
        });
      }
    }

    if (d.status === 'omitted') {
      // omitted lab without omission reason
      if (!d.omissionReason || d.omissionReason.trim() === '') {
        errors.push({
          code: 'LAB_OMITTED_NO_REASON',
          message: `Omitted laboratory "${d.labId}" is missing omissionReason.`,
        });
      }
    }
  }

  return errors;
}

function _checkLabTraceStructure(
  trace: DidacticLaboratoryTrace,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    return errors;
  }

  // Verify counts match decisions
  if (Array.isArray(trace.decisions)) {
    const selectedCount = trace.decisions.filter((d) => d.status === 'selected').length;
    const omittedCount = trace.decisions.filter((d) => d.status === 'omitted').length;

    if (trace.labsSelected !== selectedCount) {
      errors.push({
        code: 'LAB_TRACE_COUNT_MISMATCH',
        message: `labsSelected (${trace.labsSelected}) does not match actual selected count (${selectedCount}).`,
      });
    }
    if (trace.labsOmitted !== omittedCount) {
      errors.push({
        code: 'LAB_TRACE_COUNT_MISMATCH',
        message: `labsOmitted (${trace.labsOmitted}) does not match actual omitted count (${omittedCount}).`,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// D1-OPT-06 — Assessment Validation Functions
// ---------------------------------------------------------------------------

function _checkAssessmentDecisions(
  trace: DidacticAssessmentTrace,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    return errors;
  }

  if (!Array.isArray(trace.decisions)) {
    return errors;
  }

  const seenAssessments = new Set<string>();

  for (let i = 0; i < trace.decisions.length; i++) {
    const d = trace.decisions[i];

    // unsupported checkpoint type
    if (!VALID_CHECKPOINT_TYPES.has(d.checkpointType)) {
      errors.push({
        code: 'ASSESS_UNSUPPORTED_CHECKPOINT_TYPE',
        message: `Unsupported assessment checkpoint type: "${d.checkpointType}".`,
      });
    }

    // duplicate assessment decision
    if (seenAssessments.has(d.assessmentId)) {
      errors.push({
        code: 'ASSESS_DUPLICATE_DECISION',
        message: `Duplicate assessment decision for "${d.assessmentId}".`,
      });
    }
    seenAssessments.add(d.assessmentId);

    if (d.status === 'selected') {
      // selected assessment without assessmentId
      if (!d.assessmentId || d.assessmentId.trim() === '') {
        errors.push({
          code: 'ASSESS_SELECTED_NO_ID',
          message: 'Selected assessment is missing assessmentId.',
        });
      }

      // assessment decision without source
      if (!d.source || d.source.trim() === '') {
        errors.push({
          code: 'ASSESS_MISSING_SOURCE',
          message: `Assessment decision for "${d.assessmentId}" is missing source.`,
        });
      }

      // assessment decision without pedagogical objective
      if (!d.pedagogicalObjective || d.pedagogicalObjective.trim() === '') {
        errors.push({
          code: 'ASSESS_MISSING_PEDAGOGICAL_OBJECTIVE',
          message: `Assessment decision for "${d.assessmentId}" is missing pedagogicalObjective.`,
        });
      }

      // assessment mapped to non-canonical stage
      if (!CANONICAL_PIPELINE_STAGES.includes(d.targetStageId)) {
        errors.push({
          code: 'ASSESS_MAPPED_TO_NON_CANONICAL_STAGE',
          message: `Assessment "${d.assessmentId}" mapped to non-canonical stage "${d.targetStageId}".`,
          stageId: d.targetStageId,
        });
      }
    }

    if (d.status === 'omitted') {
      // omitted assessment without omission reason
      if (!d.omissionReason || d.omissionReason.trim() === '') {
        errors.push({
          code: 'ASSESS_OMITTED_NO_REASON',
          message: `Omitted assessment "${d.assessmentId}" is missing omissionReason.`,
        });
      }
    }
  }

  return errors;
}

function _checkAssessmentTraceStructure(
  trace: DidacticAssessmentTrace,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    return errors;
  }

  // Verify counts match decisions
  if (Array.isArray(trace.decisions)) {
    const selectedCount = trace.decisions.filter((d) => d.status === 'selected').length;
    const omittedCount = trace.decisions.filter((d) => d.status === 'omitted').length;

    if (trace.assessmentsSelected !== selectedCount) {
      errors.push({
        code: 'ASSESS_TRACE_COUNT_MISMATCH',
        message: `assessmentsSelected (${trace.assessmentsSelected}) does not match actual selected count (${selectedCount}).`,
      });
    }
    if (trace.assessmentsOmitted !== omittedCount) {
      errors.push({
        code: 'ASSESS_TRACE_COUNT_MISMATCH',
        message: `assessmentsOmitted (${trace.assessmentsOmitted}) does not match actual omitted count (${omittedCount}).`,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// D1-OPT-07 — Support Validation Functions
// ---------------------------------------------------------------------------

function _checkSupportDecisions(
  trace: DidacticSupportTrace,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    return errors;
  }

  if (!Array.isArray(trace.decisions)) {
    return errors;
  }

  const seenSupports = new Set<string>();

  for (let i = 0; i < trace.decisions.length; i++) {
    const d = trace.decisions[i];

    // unsupported support type (check based on category)
    if (d.category === 'misconception' && !VALID_MISCONCEPTION_TYPES.has(d.supportType)) {
      errors.push({
        code: 'SUPPORT_UNSUPPORTED_MISCONCEPTION_TYPE',
        message: `Unsupported misconception support type: "${d.supportType}".`,
      });
    }
    if (d.category === 'cognitive_load' && !VALID_COGNITIVE_LOAD_TYPES.has(d.supportType)) {
      errors.push({
        code: 'SUPPORT_UNSUPPORTED_COGNITIVE_LOAD_TYPE',
        message: `Unsupported cognitive-load support type: "${d.supportType}".`,
      });
    }

    // duplicate support decision
    if (seenSupports.has(d.supportId)) {
      errors.push({
        code: 'SUPPORT_DUPLICATE_DECISION',
        message: `Duplicate support decision for "${d.supportId}".`,
      });
    }
    seenSupports.add(d.supportId);

    if (d.status === 'selected') {
      // selected support without supportId
      if (!d.supportId || d.supportId.trim() === '') {
        errors.push({
          code: 'SUPPORT_SELECTED_NO_ID',
          message: 'Selected support is missing supportId.',
        });
      }

      // support decision without source
      if (!d.source || d.source.trim() === '') {
        errors.push({
          code: 'SUPPORT_MISSING_SOURCE',
          message: `Support decision for "${d.supportId}" is missing source.`,
        });
      }

      // support decision without pedagogical objective
      if (!d.pedagogicalObjective || d.pedagogicalObjective.trim() === '') {
        errors.push({
          code: 'SUPPORT_MISSING_PEDAGOGICAL_OBJECTIVE',
          message: `Support decision for "${d.supportId}" is missing pedagogicalObjective.`,
        });
      }

      // support mapped to non-canonical stage
      if (!CANONICAL_PIPELINE_STAGES.includes(d.targetStageId)) {
        errors.push({
          code: 'SUPPORT_MAPPED_TO_NON_CANONICAL_STAGE',
          message: `Support "${d.supportId}" mapped to non-canonical stage "${d.targetStageId}".`,
          stageId: d.targetStageId,
        });
      }
    }

    if (d.status === 'omitted') {
      // omitted support without omission reason
      if (!d.omissionReason || d.omissionReason.trim() === '') {
        errors.push({
          code: 'SUPPORT_OMITTED_NO_REASON',
          message: `Omitted support "${d.supportId}" is missing omissionReason.`,
        });
      }
    }
  }

  return errors;
}

function _checkSupportTraceStructure(
  trace: DidacticSupportTrace,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    return errors;
  }

  // Verify counts match decisions
  if (Array.isArray(trace.decisions)) {
    const selectedCount = trace.decisions.filter((d) => d.status === 'selected').length;
    const omittedCount = trace.decisions.filter((d) => d.status === 'omitted').length;

    if (trace.supportsSelected !== selectedCount) {
      errors.push({
        code: 'SUPPORT_TRACE_COUNT_MISMATCH',
        message: `supportsSelected (${trace.supportsSelected}) does not match actual selected count (${selectedCount}).`,
      });
    }
    if (trace.supportsOmitted !== omittedCount) {
      errors.push({
        code: 'SUPPORT_TRACE_COUNT_MISMATCH',
        message: `supportsOmitted (${trace.supportsOmitted}) does not match actual omitted count (${omittedCount}).`,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// D1-OPT-08 — Certification Validation Functions
// ---------------------------------------------------------------------------

function _checkCertificationReportStructure(
  report: DidacticCompositionCertificationReport,
): DidacticValidationError[] {
  const errors: DidacticValidationError[] = [];

  if (!report || typeof report !== 'object') {
    return errors;
  }

  // invalid certification status
  if (!VALID_CERTIFICATION_STATUSES.has(report.status)) {
    errors.push({
      code: 'CERT_INVALID_STATUS',
      message: `Invalid certification status: "${report.status}".`,
    });
  }

  // findings validation
  if (Array.isArray(report.findings)) {
    for (let i = 0; i < report.findings.length; i++) {
      const f = report.findings[i];

      // finding without severity
      if (!f.severity || !VALID_FINDING_SEVERITIES.has(f.severity)) {
        errors.push({
          code: 'CERT_FINDING_NO_SEVERITY',
          message: `Finding at index ${i} has invalid severity: "${f.severity}".`,
        });
      }

      // finding without quality dimension
      if (!f.qualityDimension || !VALID_QUALITY_DIMENSIONS.has(f.qualityDimension)) {
        errors.push({
          code: 'CERT_FINDING_NO_DIMENSION',
          message: `Finding at index ${i} has invalid quality dimension: "${f.qualityDimension}".`,
        });
      }

      // finding without message/code
      if (!f.code || f.code.trim() === '') {
        errors.push({
          code: 'CERT_FINDING_NO_CODE',
          message: `Finding at index ${i} is missing code.`,
        });
      }
      if (!f.message || f.message.trim() === '') {
        errors.push({
          code: 'CERT_FINDING_NO_MESSAGE',
          message: `Finding at index ${i} is missing message.`,
        });
      }
    }
  }

  // blocked report without error finding
  if (report.status === 'blocked') {
    const hasError = Array.isArray(report.findings) &&
      report.findings.some((f) => f.severity === 'error');
    if (!hasError) {
      errors.push({
        code: 'CERT_BLOCKED_NO_ERROR',
        message: 'Blocked report must have at least one error finding.',
      });
    }
  }

  // certified report with error finding
  if (report.status === 'certified') {
    const hasError = Array.isArray(report.findings) &&
      report.findings.some((f) => f.severity === 'error');
    if (hasError) {
      errors.push({
        code: 'CERT_CERTIFIED_HAS_ERROR',
        message: 'Certified report must not have error findings.',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Main Validation Entry Point
// ---------------------------------------------------------------------------

export function validateLessonPlan(plan: DidacticLessonPlan): DidacticValidationResult {
  const errors: DidacticValidationError[] = [];

  if (!plan || typeof plan !== 'object') {
    return {
      valid: false,
      errors: [{ code: 'INVALID_PLAN', message: 'Lesson plan is not a valid object.' }],
      checkedAt: 'plan_generation',
    };
  }

  if (!Array.isArray(plan.stages)) {
    return {
      valid: false,
      errors: [{ code: 'MISSING_STAGES', message: 'Lesson plan is missing stages array.' }],
      checkedAt: 'plan_generation',
    };
  }

  errors.push(..._checkCanonicalStageNames(plan.stages));
  errors.push(..._checkStageOrder(plan.stages));
  errors.push(..._checkDuplicateStageIds(plan.stages));
  errors.push(..._checkMissingStageMetadata(plan.stages));
  errors.push(..._checkUnsupportedStageStatus(plan.stages));
  errors.push(..._checkOmittedWithoutReason(plan.stages));
  errors.push(..._checkTraceMetadata(plan));

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'plan_generation',
  };
}

// ---------------------------------------------------------------------------
// D1-OPT-02 — Dependency-Aware Validation Entry Point
// ---------------------------------------------------------------------------

export function validateLessonPlanWithDependencies(
  plan: DidacticLessonPlanWithDependencies,
): DidacticValidationResult {
  const baseResult = validateLessonPlan(plan);
  const errors = [...baseResult.errors];

  if (plan.dependencyTrace) {
    errors.push(..._checkDependencyTraceStructure(plan.dependencyTrace));
    errors.push(..._checkPrerequisiteDecisions(plan.dependencyTrace));
  }

  errors.push(..._checkBlockedStagesWithoutTrace(plan.stages, plan.dependencyTrace));

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'plan_generation',
  };
}

// ---------------------------------------------------------------------------
// D1-OPT-03 — Style-Aware Validation Entry Point
// ---------------------------------------------------------------------------

export function validateLessonPlanWithStyles(
  plan: DidacticLessonPlanWithStyles,
): DidacticValidationResult {
  const baseResult = validateLessonPlan(plan);
  const errors = [...baseResult.errors];

  if (plan.styleTrace) {
    errors.push(..._checkStyleTraceStructure(plan.styleTrace));
    errors.push(..._checkStyleDecisions(plan.styleTrace));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'plan_generation',
  };
}

// ---------------------------------------------------------------------------
// D1-OPT-02 + D1-OPT-03 — Combined Validation Entry Point
// ---------------------------------------------------------------------------

export function validateLessonPlanFull(
  plan: DidacticLessonPlanFull,
): DidacticValidationResult {
  const baseResult = validateLessonPlanWithDependencies(plan);
  const errors = [...baseResult.errors];

  if (plan.styleTrace) {
    errors.push(..._checkStyleTraceStructure(plan.styleTrace));
    errors.push(..._checkStyleDecisions(plan.styleTrace));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'plan_generation',
  };
}

// ---------------------------------------------------------------------------
// D1-OPT-02 + D1-OPT-03 + D1-OPT-04 — Complete Validation Entry Point
// ---------------------------------------------------------------------------

export function validateLessonPlanComplete(
  plan: DidacticLessonPlanComplete,
): DidacticValidationResult {
  const baseResult = validateLessonPlanFull(plan);
  const errors = [...baseResult.errors];

  if (plan.learningLayerTrace) {
    errors.push(..._checkLayerTraceStructure(plan.learningLayerTrace));
    errors.push(..._checkLayerDecisions(plan.learningLayerTrace));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'plan_generation',
  };
}

// ---------------------------------------------------------------------------
// D1-OPT-02 + D1-OPT-03 + D1-OPT-04 + D1-OPT-05 — All Orchestrations Validation Entry Point
// ---------------------------------------------------------------------------

export function validateLessonPlanAll(
  plan: DidacticLessonPlanAll,
): DidacticValidationResult {
  const baseResult = validateLessonPlanComplete(plan);
  const errors = [...baseResult.errors];

  if (plan.laboratoryTrace) {
    errors.push(..._checkLabTraceStructure(plan.laboratoryTrace));
    errors.push(..._checkLabDecisions(plan.laboratoryTrace));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'plan_generation',
  };
}

// ---------------------------------------------------------------------------
// D1-OPT-02 + D1-OPT-03 + D1-OPT-04 + D1-OPT-05 + D1-OPT-06 — Final Validation Entry Point
// ---------------------------------------------------------------------------

export function validateLessonPlanFinal(
  plan: DidacticLessonPlanFinal,
): DidacticValidationResult {
  const baseResult = validateLessonPlanAll(plan);
  const errors = [...baseResult.errors];

  if (plan.assessmentTrace) {
    errors.push(..._checkAssessmentTraceStructure(plan.assessmentTrace));
    errors.push(..._checkAssessmentDecisions(plan.assessmentTrace));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'plan_generation',
  };
}

// ---------------------------------------------------------------------------
// D1-OPT-02 + D1-OPT-03 + D1-OPT-04 + D1-OPT-05 + D1-OPT-06 + D1-OPT-07 — Complete2 Validation Entry Point
// ---------------------------------------------------------------------------

export function validateLessonPlanComplete2(
  plan: DidacticLessonPlanComplete2,
): DidacticValidationResult {
  const baseResult = validateLessonPlanFinal(plan);
  const errors = [...baseResult.errors];

  if (plan.supportTrace) {
    errors.push(..._checkSupportTraceStructure(plan.supportTrace));
    errors.push(..._checkSupportDecisions(plan.supportTrace));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'plan_generation',
  };
}

// ---------------------------------------------------------------------------
// D1-OPT-08 — Certification Validation Entry Point
// ---------------------------------------------------------------------------

export function validateCertificationReport(
  report: DidacticCompositionCertificationReport,
): DidacticValidationResult {
  const errors: DidacticValidationError[] = [];

  errors.push(..._checkCertificationReportStructure(report));

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'plan_generation',
  };
}

// ---------------------------------------------------------------------------
// D1-OPT-09 — Facade Output Validation Entry Point
// ---------------------------------------------------------------------------

/**
 * Validates a facade lesson plan output.
 * Checks that lessonPlan is present, valid, and trace metadata is complete.
 */
export function validateFacadeLessonPlanOutput(
  output: { lessonPlan: DidacticLessonPlanComplete2; validationResult: DidacticValidationResult; traceMetadata: unknown },
): DidacticValidationResult {
  const errors: DidacticValidationError[] = [];

  if (!output || typeof output !== 'object') {
    return {
      valid: false,
      errors: [{ code: 'FACADE_OUTPUT_INVALID', message: 'Facade output is not a valid object.' }],
      checkedAt: 'plan_generation',
    };
  }

  // missing lessonPlan
  if (!output.lessonPlan || typeof output.lessonPlan !== 'object') {
    errors.push({
      code: 'FACADE_MISSING_LESSON_PLAN',
      message: 'Facade output is missing lessonPlan.',
    });
  } else {
    // Validate the lesson plan itself
    const planResult = validateLessonPlanComplete2(output.lessonPlan);
    errors.push(...planResult.errors);
  }

  // missing validationResult
  if (!output.validationResult || typeof output.validationResult !== 'object') {
    errors.push({
      code: 'FACADE_MISSING_VALIDATION_RESULT',
      message: 'Facade output is missing validationResult.',
    });
  }

  // missing trace metadata
  if (!output.traceMetadata || typeof output.traceMetadata !== 'object') {
    errors.push({
      code: 'FACADE_MISSING_TRACE_METADATA',
      message: 'Facade output is missing traceMetadata.',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'plan_generation',
  };
}

/**
 * Validates a facade certification output.
 * Checks that certificationReport is present and valid.
 */
export function validateFacadeCertificationOutput(
  output: { certificationReport: DidacticCompositionCertificationReport; validationResult: DidacticValidationResult; traceMetadata: unknown },
): DidacticValidationResult {
  const errors: DidacticValidationError[] = [];

  if (!output || typeof output !== 'object') {
    return {
      valid: false,
      errors: [{ code: 'FACADE_OUTPUT_INVALID', message: 'Facade output is not a valid object.' }],
      checkedAt: 'plan_generation',
    };
  }

  // missing certificationReport
  if (!output.certificationReport || typeof output.certificationReport !== 'object') {
    errors.push({
      code: 'FACADE_MISSING_CERTIFICATION_REPORT',
      message: 'Facade output is missing certificationReport.',
    });
  } else {
    // Validate the certification report itself
    const certResult = validateCertificationReport(output.certificationReport);
    errors.push(...certResult.errors);
  }

  // missing validationResult
  if (!output.validationResult || typeof output.validationResult !== 'object') {
    errors.push({
      code: 'FACADE_MISSING_VALIDATION_RESULT',
      message: 'Facade output is missing validationResult.',
    });
  }

  // missing trace metadata
  if (!output.traceMetadata || typeof output.traceMetadata !== 'object') {
    errors.push({
      code: 'FACADE_MISSING_TRACE_METADATA',
      message: 'Facade output is missing traceMetadata.',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'plan_generation',
  };
}

/**
 * Validates a facade complete output (compose + certify).
 * Checks that both lessonPlan and certificationReport are present and valid.
 */
export function validateFacadeCompleteOutput(
  output: {
    lessonPlan: DidacticLessonPlanComplete2;
    certificationReport: DidacticCompositionCertificationReport;
    validationResult: DidacticValidationResult;
    certificationValidation: DidacticValidationResult;
    traceMetadata: unknown;
  },
): DidacticValidationResult {
  const errors: DidacticValidationError[] = [];

  if (!output || typeof output !== 'object') {
    return {
      valid: false,
      errors: [{ code: 'FACADE_OUTPUT_INVALID', message: 'Facade output is not a valid object.' }],
      checkedAt: 'plan_generation',
    };
  }

  // Validate lesson plan
  if (!output.lessonPlan || typeof output.lessonPlan !== 'object') {
    errors.push({
      code: 'FACADE_MISSING_LESSON_PLAN',
      message: 'Facade output is missing lessonPlan.',
    });
  } else {
    const planResult = validateLessonPlanComplete2(output.lessonPlan);
    errors.push(...planResult.errors);
  }

  // Validate certification report
  if (!output.certificationReport || typeof output.certificationReport !== 'object') {
    errors.push({
      code: 'FACADE_MISSING_CERTIFICATION_REPORT',
      message: 'Facade output is missing certificationReport.',
    });
  } else {
    const certResult = validateCertificationReport(output.certificationReport);
    errors.push(...certResult.errors);
  }

  // missing validation results
  if (!output.validationResult || typeof output.validationResult !== 'object') {
    errors.push({
      code: 'FACADE_MISSING_VALIDATION_RESULT',
      message: 'Facade output is missing validationResult.',
    });
  }
  if (!output.certificationValidation || typeof output.certificationValidation !== 'object') {
    errors.push({
      code: 'FACADE_MISSING_CERTIFICATION_VALIDATION',
      message: 'Facade output is missing certificationValidation.',
    });
  }

  // missing trace metadata
  if (!output.traceMetadata || typeof output.traceMetadata !== 'object') {
    errors.push({
      code: 'FACADE_MISSING_TRACE_METADATA',
      message: 'Facade output is missing traceMetadata.',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'plan_generation',
  };
}
