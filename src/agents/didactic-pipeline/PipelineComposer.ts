/**
 * NV-1300-D1-OPT-01 / D1-OPT-02 / D1-OPT-03 / D1-OPT-04 / D1-OPT-05 / D1-OPT-06 / D1-OPT-07 — Deterministic Pipeline Composer
 *
 * Pure deterministic function that receives governed lesson input
 * and returns an ordered lesson plan.
 *
 * D1-OPT-02 extension: prerequisite analysis.
 * D1-OPT-03 extension: explanation style selection.
 * D1-OPT-04 extension: progressive learning layer orchestration.
 * D1-OPT-05 extension: deep laboratory integration.
 * D1-OPT-06 extension: assessment checkpoint orchestration.
 * D1-OPT-07 extension: misconception & cognitive-load support orchestration.
 *
 * Guarantees:
 * - Same inputs always produce identical outputs.
 * - No global mutable state reads.
 * - No random values.
 * - No time dependency (except optional externally provided metadata).
 * - Canonical stage order is always preserved.
 * - No curriculum mutation. No content fabrication.
 *
 * Deterministic. No Math.random. No Date.now.
 */

import type {
  DidacticLessonInput,
  DidacticLessonPlan,
  DidacticPipelineStage,
  DidacticPipelineStageName,
  DidacticTraceMetadata,
  DidacticValidationResult,
  DidacticLessonInputWithDependencies,
  DidacticLessonPlanWithDependencies,
  DidacticDependencyTrace,
  DidacticLessonInputWithStyles,
  DidacticLessonPlanWithStyles,
  DidacticStyleTrace,
  DidacticLessonInputFull,
  DidacticLessonPlanFull,
  DidacticLessonInputComplete,
  DidacticLessonPlanComplete,
  DidacticLearningLayerTrace,
  DidacticLessonInputAll,
  DidacticLessonPlanAll,
  DidacticLaboratoryTrace,
  DidacticLessonInputFinal,
  DidacticLessonPlanFinal,
  DidacticAssessmentTrace,
  DidacticLessonInputComplete2,
  DidacticLessonPlanComplete2,
  DidacticSupportTrace,
} from './DidacticAgentContract.ts';
import { CANONICAL_PIPELINE_STAGES } from './DidacticAgentContract.ts';
import { buildAllStageStatuses, STAGE_RESOURCE_RULES } from './StageInclusionLogic.ts';
import { validateLessonPlan } from './ValidationLayer.ts';
import { analyzePrerequisites, buildDependencyTrace } from './PrerequisiteAnalyzer.ts';
import { selectExplanationStyles, buildStyleTrace } from './ExplanationStyleSelector.ts';
import { orchestrateLearningLayers, buildLayerTrace } from './LearningLayerOrchestrator.ts';
import { orchestrateLaboratories, buildLabTrace } from './LaboratoryOrchestrator.ts';
import { orchestrateAssessmentCheckpoints, buildAssessmentTrace } from './AssessmentOrchestrator.ts';
import { orchestrateInstructionalSupports, buildSupportTrace } from './InstructionalSupportOrchestrator.ts';

// ---------------------------------------------------------------------------
// Deterministic Plan ID Generator
// ---------------------------------------------------------------------------

function _generatePlanId(input: DidacticLessonInput): string {
  const slug = input.topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);
  return `plan-didactic-${input.difficulty}-${slug}`;
}

// ---------------------------------------------------------------------------
// Core Pipeline Composer
// ---------------------------------------------------------------------------

export function composeLessonPlan(input: DidacticLessonInput): DidacticLessonPlan {
  // 1. Validate input shape
  if (!input || typeof input !== 'object') {
    return _buildInvalidPlan('Invalid input: expected a DidacticLessonInput object.');
  }

  if (!input.topic || typeof input.topic !== 'string' || input.topic.trim() === '') {
    return _buildInvalidPlan('Invalid input: topic is required and must be a non-empty string.');
  }

  if (!input.difficulty) {
    return _buildInvalidPlan('Invalid input: difficulty is required.');
  }

  // 2. Determine status of each canonical stage
  const stageStatuses = buildAllStageStatuses(input);

  // 3. Build pipeline stages in canonical order
  const stages: DidacticPipelineStage[] = stageStatuses.map((entry, index) => {
    const rule = STAGE_RESOURCE_RULES.find((r) => r.stageId === entry.stageId);
    return {
      stageId: entry.stageId,
      order: index + 1,
      status: entry.status,
      label: rule?.label || entry.stageId,
      description: rule?.description || '',
      omissionReason: entry.omissionReason,
      resourceRef: entry.resourceRef,
    };
  });

  // 4. Build trace metadata
  const trace: DidacticTraceMetadata = {
    planId: _generatePlanId(input),
    topic: input.topic,
    difficulty: input.difficulty,
    totalStages: stages.length,
    includedStages: stages.filter((s) => s.status === 'included').length,
    omittedStages: stages.filter((s) => s.status === 'omitted').length,
    blockedStages: stages.filter((s) => s.status === 'blocked').length,
    invalidStages: stages.filter((s) => s.status === 'invalid').length,
    generatedFrom: 'deterministic_pipeline',
    deterministic: true,
    curriculumMutated: false,
    randomUsed: false,
    timeDependency: false,
  };

  // 5. Assemble plan (validation placeholder — overwritten in step 6)
  const planWithoutValidation = {
    id: trace.planId,
    topic: input.topic,
    difficulty: input.difficulty,
    stages,
    trace,
  };

  // 6. Self-validate and attach result
  const validationResult = validateLessonPlan(planWithoutValidation as unknown as DidacticLessonPlan);

  const plan: DidacticLessonPlan = {
    ...planWithoutValidation,
    validation: validationResult,
  };

  return plan;
}

// ---------------------------------------------------------------------------
// D1-OPT-02 — Dependency-Aware Pipeline Composer
// ---------------------------------------------------------------------------

/**
 * Composes a lesson plan enriched with deterministic prerequisite analysis.
 * Delegates to composeLessonPlan for core stage logic, then attaches
 * a DidacticDependencyTrace without altering canonical stage order.
 *
 * If no dependencyGraph is provided, returns the base plan unchanged.
 * If dependencyGraph is malformed, returns the base plan with no trace.
 */
export function composeLessonPlanWithDependencies(
  input: DidacticLessonInputWithDependencies,
): DidacticLessonPlanWithDependencies {
  // 1. Delegate to base composer (preserves D1-OPT-01 behavior exactly)
  const basePlan = composeLessonPlan(input);

  // 2. If no dependency graph, return plan as-is
  if (!input.dependencyGraph || typeof input.dependencyGraph !== 'object') {
    return basePlan as DidacticLessonPlanWithDependencies;
  }

  // 3. Analyze prerequisites deterministically
  const decisions = analyzePrerequisites(input, input.dependencyGraph);

  // 4. Build dependency trace
  const dependencyTrace = buildDependencyTrace(input.conceptIds, decisions);

  // 5. Enrich stages with prerequisite metadata (no reorder, no fabrication)
  const enrichedStages = _enrichStagesWithDependencyMetadata(
    basePlan.stages,
    dependencyTrace,
  );

  // 6. Assemble enriched plan (canonical order preserved, trace attached)
  const enrichedPlan: DidacticLessonPlanWithDependencies = {
    ...basePlan,
    stages: enrichedStages,
    dependencyTrace,
  };

  return enrichedPlan;
}

// ---------------------------------------------------------------------------
// D1-OPT-03 — Style-Aware Pipeline Composer
// ---------------------------------------------------------------------------

/**
 * Composes a lesson plan enriched with deterministic explanation style selection.
 * Delegates to composeLessonPlan for core stage logic, then attaches
 * a DidacticStyleTrace without altering canonical stage order.
 *
 * If no styleInput is provided, returns the base plan unchanged.
 * If styleResources is empty, returns the base plan with no style trace.
 */
export function composeLessonPlanWithStyles(
  input: DidacticLessonInputWithStyles,
): DidacticLessonPlanWithStyles {
  // 1. Delegate to base composer (preserves D1-OPT-01 behavior exactly)
  const basePlan = composeLessonPlan(input);

  // 2. If no style input or resources, return plan as-is
  if (!input.styleInput || typeof input.styleInput !== 'object') {
    return basePlan as DidacticLessonPlanWithStyles;
  }

  const styleResources = input.styleInput.styleResources;
  if (!Array.isArray(styleResources) || styleResources.length === 0) {
    return basePlan as DidacticLessonPlanWithStyles;
  }

  // 3. Select explanation styles deterministically
  const decisions = selectExplanationStyles(input.styleInput, styleResources);

  // 4. Build style trace
  const styleTrace = buildStyleTrace(decisions);

  // 5. Assemble enriched plan (canonical order preserved, trace attached)
  const enrichedPlan: DidacticLessonPlanWithStyles = {
    ...basePlan,
    styleTrace,
  };

  return enrichedPlan;
}

// ---------------------------------------------------------------------------
// D1-OPT-02 + D1-OPT-03 — Fully Extended Pipeline Composer
// ---------------------------------------------------------------------------

/**
 * Composes a lesson plan enriched with both prerequisite analysis
 * and explanation style selection. Delegates to composeLessonPlan for
 * core stage logic, then attaches both traces.
 *
 * Canonical stage order is never altered. No content is generated.
 */
export function composeLessonPlanFull(
  input: DidacticLessonInputFull,
): DidacticLessonPlanFull {
  // 1. Delegate to base composer
  const basePlan = composeLessonPlan(input);

  // 2. Process dependency trace
  let dependencyTrace: DidacticDependencyTrace | undefined;
  if (input.dependencyGraph && typeof input.dependencyGraph === 'object') {
    const decisions = analyzePrerequisites(input, input.dependencyGraph);
    dependencyTrace = buildDependencyTrace(input.conceptIds, decisions);
  }

  // 3. Process style trace
  let styleTrace: DidacticStyleTrace | undefined;
  if (input.styleInput && typeof input.styleInput === 'object') {
    const styleResources = input.styleInput.styleResources;
    if (Array.isArray(styleResources) && styleResources.length > 0) {
      const decisions = selectExplanationStyles(input.styleInput, styleResources);
      styleTrace = buildStyleTrace(decisions);
    }
  }

  // 4. Assemble fully enriched plan
  const enrichedPlan: DidacticLessonPlanFull = {
    ...basePlan,
    dependencyTrace,
    styleTrace,
  };

  return enrichedPlan;
}

// ---------------------------------------------------------------------------
// D1-OPT-02 + D1-OPT-03 + D1-OPT-04 — Complete Pipeline Composer
// ---------------------------------------------------------------------------

/**
 * Composes a lesson plan enriched with prerequisite analysis,
 * explanation style selection, and progressive learning layer
 * orchestration. Delegates to composeLessonPlan for core stage logic,
 * then attaches all three traces.
 *
 * Canonical stage order is never altered. No content is generated.
 */
export function composeLessonPlanComplete(
  input: DidacticLessonInputComplete,
): DidacticLessonPlanComplete {
  // 1. Delegate to base composer
  const basePlan = composeLessonPlan(input);

  // 2. Process dependency trace
  let dependencyTrace: DidacticDependencyTrace | undefined;
  if (input.dependencyGraph && typeof input.dependencyGraph === 'object') {
    const decisions = analyzePrerequisites(input, input.dependencyGraph);
    dependencyTrace = buildDependencyTrace(input.conceptIds, decisions);
  }

  // 3. Process style trace
  let styleTrace: DidacticStyleTrace | undefined;
  if (input.styleInput && typeof input.styleInput === 'object') {
    const styleResources = input.styleInput.styleResources;
    if (Array.isArray(styleResources) && styleResources.length > 0) {
      const decisions = selectExplanationStyles(input.styleInput, styleResources);
      styleTrace = buildStyleTrace(decisions);
    }
  }

  // 4. Process learning layer trace
  let learningLayerTrace: DidacticLearningLayerTrace | undefined;
  if (input.layerInput && typeof input.layerInput === 'object') {
    const layerResources = input.layerInput.layerResources;
    if (Array.isArray(layerResources) && layerResources.length > 0) {
      const decisions = orchestrateLearningLayers(
        input.layerInput.depthMode,
        input.layerInput.requestedLayers,
        layerResources,
      );
      learningLayerTrace = buildLayerTrace(
        input.layerInput.depthMode || 'standard',
        decisions,
      );
    }
  }

  // 5. Assemble fully enriched plan
  const enrichedPlan: DidacticLessonPlanComplete = {
    ...basePlan,
    dependencyTrace,
    styleTrace,
    learningLayerTrace,
  };

  return enrichedPlan;
}

// ---------------------------------------------------------------------------
// D1-OPT-02 + D1-OPT-03 + D1-OPT-04 + D1-OPT-05 — All Orchestrations Pipeline Composer
// ---------------------------------------------------------------------------

/**
 * Composes a lesson plan enriched with prerequisite analysis,
 * explanation style selection, progressive learning layer orchestration,
 * and deep laboratory integration. Delegates to composeLessonPlan for
 * core stage logic, then attaches all four traces.
 *
 * Canonical stage order is never altered. No content is generated.
 * No laboratories are executed.
 */
export function composeLessonPlanAll(
  input: DidacticLessonInputAll,
): DidacticLessonPlanAll {
  // 1. Delegate to base composer
  const basePlan = composeLessonPlan(input);

  // 2. Process dependency trace
  let dependencyTrace: DidacticDependencyTrace | undefined;
  if (input.dependencyGraph && typeof input.dependencyGraph === 'object') {
    const decisions = analyzePrerequisites(input, input.dependencyGraph);
    dependencyTrace = buildDependencyTrace(input.conceptIds, decisions);
  }

  // 3. Process style trace
  let styleTrace: DidacticStyleTrace | undefined;
  if (input.styleInput && typeof input.styleInput === 'object') {
    const styleResources = input.styleInput.styleResources;
    if (Array.isArray(styleResources) && styleResources.length > 0) {
      const decisions = selectExplanationStyles(input.styleInput, styleResources);
      styleTrace = buildStyleTrace(decisions);
    }
  }

  // 4. Process learning layer trace
  let learningLayerTrace: DidacticLearningLayerTrace | undefined;
  if (input.layerInput && typeof input.layerInput === 'object') {
    const layerResources = input.layerInput.layerResources;
    if (Array.isArray(layerResources) && layerResources.length > 0) {
      const decisions = orchestrateLearningLayers(
        input.layerInput.depthMode,
        input.layerInput.requestedLayers,
        layerResources,
      );
      learningLayerTrace = buildLayerTrace(
        input.layerInput.depthMode || 'standard',
        decisions,
      );
    }
  }

  // 5. Process laboratory trace
  let laboratoryTrace: DidacticLaboratoryTrace | undefined;
  if (input.laboratoryInput && typeof input.laboratoryInput === 'object') {
    const labResources = input.laboratoryInput.laboratoryResources;
    if (Array.isArray(labResources) && labResources.length > 0) {
      const decisions = orchestrateLaboratories(
        input.laboratoryInput,
        labResources,
        input.conceptIds,
      );
      laboratoryTrace = buildLabTrace(decisions);
    }
  }

  // 6. Assemble fully enriched plan
  const enrichedPlan: DidacticLessonPlanAll = {
    ...basePlan,
    dependencyTrace,
    styleTrace,
    learningLayerTrace,
    laboratoryTrace,
  };

  return enrichedPlan;
}

// ---------------------------------------------------------------------------
// D1-OPT-02 + D1-OPT-03 + D1-OPT-04 + D1-OPT-05 + D1-OPT-06 — Final Pipeline Composer
// ---------------------------------------------------------------------------

/**
 * Composes a lesson plan enriched with prerequisite analysis,
 * explanation style selection, progressive learning layer orchestration,
 * deep laboratory integration, and assessment checkpoint orchestration.
 * Delegates to composeLessonPlan for core stage logic, then attaches
 * all five traces.
 *
 * Canonical stage order is never altered. No content is generated.
 * No laboratories are executed. No assessments are scored.
 */
export function composeLessonPlanFinal(
  input: DidacticLessonInputFinal,
): DidacticLessonPlanFinal {
  // 1. Delegate to base composer
  const basePlan = composeLessonPlan(input);

  // 2. Process dependency trace
  let dependencyTrace: DidacticDependencyTrace | undefined;
  if (input.dependencyGraph && typeof input.dependencyGraph === 'object') {
    const decisions = analyzePrerequisites(input, input.dependencyGraph);
    dependencyTrace = buildDependencyTrace(input.conceptIds, decisions);
  }

  // 3. Process style trace
  let styleTrace: DidacticStyleTrace | undefined;
  if (input.styleInput && typeof input.styleInput === 'object') {
    const styleResources = input.styleInput.styleResources;
    if (Array.isArray(styleResources) && styleResources.length > 0) {
      const decisions = selectExplanationStyles(input.styleInput, styleResources);
      styleTrace = buildStyleTrace(decisions);
    }
  }

  // 4. Process learning layer trace
  let learningLayerTrace: DidacticLearningLayerTrace | undefined;
  if (input.layerInput && typeof input.layerInput === 'object') {
    const layerResources = input.layerInput.layerResources;
    if (Array.isArray(layerResources) && layerResources.length > 0) {
      const decisions = orchestrateLearningLayers(
        input.layerInput.depthMode,
        input.layerInput.requestedLayers,
        layerResources,
      );
      learningLayerTrace = buildLayerTrace(
        input.layerInput.depthMode || 'standard',
        decisions,
      );
    }
  }

  // 5. Process laboratory trace
  let laboratoryTrace: DidacticLaboratoryTrace | undefined;
  if (input.laboratoryInput && typeof input.laboratoryInput === 'object') {
    const labResources = input.laboratoryInput.laboratoryResources;
    if (Array.isArray(labResources) && labResources.length > 0) {
      const decisions = orchestrateLaboratories(
        input.laboratoryInput,
        labResources,
        input.conceptIds,
      );
      laboratoryTrace = buildLabTrace(decisions);
    }
  }

  // 6. Process assessment trace
  let assessmentTrace: DidacticAssessmentTrace | undefined;
  if (input.assessmentInput && typeof input.assessmentInput === 'object') {
    const assessmentResources = input.assessmentInput.assessmentResources;
    if (Array.isArray(assessmentResources) && assessmentResources.length > 0) {
      const decisions = orchestrateAssessmentCheckpoints(
        input.assessmentInput,
        assessmentResources,
        input.conceptIds,
        laboratoryTrace,
      );
      assessmentTrace = buildAssessmentTrace(decisions);
    }
  }

  // 7. Assemble fully enriched plan
  const enrichedPlan: DidacticLessonPlanFinal = {
    ...basePlan,
    dependencyTrace,
    styleTrace,
    learningLayerTrace,
    laboratoryTrace,
    assessmentTrace,
  };

  return enrichedPlan;
}

// ---------------------------------------------------------------------------
// D1-OPT-02 + D1-OPT-03 + D1-OPT-04 + D1-OPT-05 + D1-OPT-06 + D1-OPT-07 — Complete2 Pipeline Composer
// ---------------------------------------------------------------------------

/**
 * Composes a lesson plan enriched with all six orchestrations:
 * prerequisite analysis, explanation style selection, progressive learning
 * layer orchestration, deep laboratory integration, assessment checkpoint
 * orchestration, and misconception & cognitive-load support orchestration.
 *
 * Canonical stage order is never altered. No content is generated.
 * No laboratories are executed. No assessments are scored.
 * No learner diagnosis is performed.
 */
export function composeLessonPlanComplete2(
  input: DidacticLessonInputComplete2,
): DidacticLessonPlanComplete2 {
  // 1. Delegate to base composer
  const basePlan = composeLessonPlan(input);

  // 2. Process dependency trace
  let dependencyTrace: DidacticDependencyTrace | undefined;
  if (input.dependencyGraph && typeof input.dependencyGraph === 'object') {
    const decisions = analyzePrerequisites(input, input.dependencyGraph);
    dependencyTrace = buildDependencyTrace(input.conceptIds, decisions);
  }

  // 3. Process style trace
  let styleTrace: DidacticStyleTrace | undefined;
  if (input.styleInput && typeof input.styleInput === 'object') {
    const styleResources = input.styleInput.styleResources;
    if (Array.isArray(styleResources) && styleResources.length > 0) {
      const decisions = selectExplanationStyles(input.styleInput, styleResources);
      styleTrace = buildStyleTrace(decisions);
    }
  }

  // 4. Process learning layer trace
  let learningLayerTrace: DidacticLearningLayerTrace | undefined;
  if (input.layerInput && typeof input.layerInput === 'object') {
    const layerResources = input.layerInput.layerResources;
    if (Array.isArray(layerResources) && layerResources.length > 0) {
      const decisions = orchestrateLearningLayers(
        input.layerInput.depthMode,
        input.layerInput.requestedLayers,
        layerResources,
      );
      learningLayerTrace = buildLayerTrace(
        input.layerInput.depthMode || 'standard',
        decisions,
      );
    }
  }

  // 5. Process laboratory trace
  let laboratoryTrace: DidacticLaboratoryTrace | undefined;
  if (input.laboratoryInput && typeof input.laboratoryInput === 'object') {
    const labResources = input.laboratoryInput.laboratoryResources;
    if (Array.isArray(labResources) && labResources.length > 0) {
      const decisions = orchestrateLaboratories(
        input.laboratoryInput,
        labResources,
        input.conceptIds,
      );
      laboratoryTrace = buildLabTrace(decisions);
    }
  }

  // 6. Process assessment trace
  let assessmentTrace: DidacticAssessmentTrace | undefined;
  if (input.assessmentInput && typeof input.assessmentInput === 'object') {
    const assessmentResources = input.assessmentInput.assessmentResources;
    if (Array.isArray(assessmentResources) && assessmentResources.length > 0) {
      const decisions = orchestrateAssessmentCheckpoints(
        input.assessmentInput,
        assessmentResources,
        input.conceptIds,
        laboratoryTrace,
      );
      assessmentTrace = buildAssessmentTrace(decisions);
    }
  }

  // 7. Process support trace (misconception + cognitive load)
  let supportTrace: DidacticSupportTrace | undefined;
  if (input.supportInput && typeof input.supportInput === 'object') {
    const misconceptionResources = input.supportInput.misconceptionResources || [];
    const cognitiveLoadResources = input.supportInput.cognitiveLoadResources || [];
    if (misconceptionResources.length > 0 || cognitiveLoadResources.length > 0) {
      const decisions = orchestrateInstructionalSupports(
        input.supportInput,
        misconceptionResources,
        cognitiveLoadResources,
        input.conceptIds,
      );
      supportTrace = buildSupportTrace(decisions);
    }
  }

  // 8. Assemble fully enriched plan
  const enrichedPlan: DidacticLessonPlanComplete2 = {
    ...basePlan,
    dependencyTrace,
    styleTrace,
    learningLayerTrace,
    laboratoryTrace,
    assessmentTrace,
    supportTrace,
  };

  return enrichedPlan;
}

// ---------------------------------------------------------------------------
// Stage enrichment (metadata attachment only — no reorder, no fabrication)
// ---------------------------------------------------------------------------

function _enrichStagesWithDependencyMetadata(
  stages: readonly DidacticPipelineStage[],
  trace: DidacticDependencyTrace,
): DidacticPipelineStage[] {
  // Return stages unchanged — prerequisite metadata lives in dependencyTrace,
  // not in individual stage objects. This preserves the 13-stage contract.
  // The dependencyTrace is the single source of prerequisite orchestration data.
  return stages.map((s) => ({ ...s }));
}

// ---------------------------------------------------------------------------
// Invalid Plan Builder (fallback for malformed input)
// ---------------------------------------------------------------------------

function _buildInvalidPlan(reason: string): DidacticLessonPlan {
  const trace: DidacticTraceMetadata = {
    planId: 'plan-didactic-invalid',
    topic: '',
    difficulty: '',
    totalStages: 0,
    includedStages: 0,
    omittedStages: 0,
    blockedStages: 0,
    invalidStages: 0,
    generatedFrom: 'deterministic_pipeline',
    deterministic: true,
    curriculumMutated: false,
    randomUsed: false,
    timeDependency: false,
  };

  return {
    id: 'plan-didactic-invalid',
    topic: '',
    difficulty: '',
    stages: [],
    trace,
    validation: {
      valid: false,
      errors: [{ code: 'INVALID_INPUT', message: reason }],
      checkedAt: 'plan_generation',
    },
  };
}
