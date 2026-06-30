/**
 * NV-1300-D1-OPT-06 — Deterministic Assessment Checkpoint Orchestrator
 *
 * Pure deterministic function that orchestrates assessment checkpoint
 * placement in the instructional flow.
 *
 * Rules:
 * - Select an assessment only when a governed assessment resource exists.
 * - Select checkpoint type only when resource supports it.
 * - Attach assessment decisions to existing canonical stages only.
 * - Missing requested assessment/checkpoint produces explicit omission reason.
 * - Deprecated/invalid assessment resources must not be selected.
 * - Assessments requiring laboratory context may only be selected when
 *   matching laboratory trace exists.
 * - No scoring, answer evaluation, or mastery inference is allowed.
 * - No generated educational text is allowed.
 *
 * Checkpoint Type → Stage Mapping:
 * - concept_check → concept_introduction or guided_explanation
 * - misconception_check → common_misconceptions
 * - parameter_interpretation → interactive_laboratory or practical_example
 * - prediction_before_run → interactive_laboratory
 * - reflection_prompt → summary
 * - debugging_prompt → practical_example or interactive_laboratory
 * - synthesis_question → assessment
 * - forward_connection_check → forward_connections
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 * Does not mutate assessment resources, curriculum, or input objects.
 */

import type {
  DidacticAssessmentCheckpointType,
  DidacticAssessmentResource,
  DidacticAssessmentDecision,
  DidacticAssessmentPlacement,
  DidacticAssessmentTrace,
  DidacticPipelineStageName,
  DidacticAssessmentInput,
  DidacticLaboratoryTrace,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Valid checkpoint types
// ---------------------------------------------------------------------------

const VALID_CHECKPOINT_TYPES = new Set<string>([
  'concept_check',
  'misconception_check',
  'parameter_interpretation',
  'prediction_before_run',
  'reflection_prompt',
  'debugging_prompt',
  'synthesis_question',
  'forward_connection_check',
]);

// ---------------------------------------------------------------------------
// Checkpoint type → default target stage mapping
// ---------------------------------------------------------------------------

const CHECKPOINT_TYPE_STAGE_MAP: Record<
  DidacticAssessmentCheckpointType,
  readonly DidacticPipelineStageName[]
> = {
  concept_check: ['concept_introduction', 'guided_explanation'],
  misconception_check: ['common_misconceptions'],
  parameter_interpretation: ['interactive_laboratory', 'practical_example'],
  prediction_before_run: ['interactive_laboratory'],
  reflection_prompt: ['summary'],
  debugging_prompt: ['practical_example', 'interactive_laboratory'],
  synthesis_question: ['assessment'],
  forward_connection_check: ['forward_connections'],
};

// ---------------------------------------------------------------------------
// Checkpoint type rationale templates
// ---------------------------------------------------------------------------

const CHECKPOINT_TYPE_RATIONALE: Record<DidacticAssessmentCheckpointType, string> = {
  concept_check: 'Concept check placed to verify understanding of introduced concepts.',
  misconception_check: 'Misconception check placed to proactively address known misunderstandings.',
  parameter_interpretation: 'Parameter interpretation checkpoint to verify ability to read model outputs.',
  prediction_before_run: 'Prediction checkpoint placed before laboratory run to engage active hypothesis formation.',
  reflection_prompt: 'Reflection prompt placed to encourage deeper thinking about learned material.',
  debugging_prompt: 'Debugging prompt placed to develop analytical and problem-solving skills.',
  synthesis_question: 'Synthesis question placed to assess ability to integrate multiple concepts.',
  forward_connection_check: 'Forward connection check placed to verify ability to link to downstream concepts.',
};

// ---------------------------------------------------------------------------
// Pure deterministic assessment resource lookup
// ---------------------------------------------------------------------------

function _findAssessmentResource(
  assessmentId: string,
  resources: readonly DidacticAssessmentResource[],
): DidacticAssessmentResource | null {
  for (let i = 0; i < resources.length; i++) {
    if (resources[i].assessmentId === assessmentId && resources[i].lifecycle === 'active') {
      return resources[i];
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Pure deterministic target stage resolution
// ---------------------------------------------------------------------------

function _resolveTargetStage(
  type: DidacticAssessmentCheckpointType,
  resource: DidacticAssessmentResource | null,
): DidacticPipelineStageName {
  // Use resource's supportedStages if available and relevant
  if (resource && resource.supportedStages.length > 0) {
    const defaultStages = CHECKPOINT_TYPE_STAGE_MAP[type];
    // Find intersection of resource's supported stages and type's default stages
    for (let i = 0; i < defaultStages.length; i++) {
      for (let j = 0; j < resource.supportedStages.length; j++) {
        if (defaultStages[i] === resource.supportedStages[j]) {
          return defaultStages[i];
        }
      }
    }
    // Fall back to first resource-supported stage
    return resource.supportedStages[0];
  }

  // Fall back to first default stage for type
  return CHECKPOINT_TYPE_STAGE_MAP[type][0];
}

// ---------------------------------------------------------------------------
// Pure deterministic assessment decision builder
// ---------------------------------------------------------------------------

function _buildAssessmentDecision(
  assessmentId: string,
  resource: DidacticAssessmentResource | null,
  type: DidacticAssessmentCheckpointType,
  requiresLabContext: boolean,
  omissionReason: string | null,
): DidacticAssessmentDecision {
  const targetStageId = resource ? _resolveTargetStage(type, resource) : CHECKPOINT_TYPE_STAGE_MAP[type][0];
  const rationale = CHECKPOINT_TYPE_RATIONALE[type];

  if (resource) {
    return {
      assessmentId,
      status: 'selected',
      source: resource.source,
      checkpointType: type,
      targetStageId,
      pedagogicalObjective: resource.pedagogicalObjective,
      targetConceptIds: resource.targetConceptIds,
      rationale,
      requiresLaboratoryContext: resource.requiresLaboratoryContext,
      omissionReason: null,
    };
  }

  return {
    assessmentId,
    status: 'omitted',
    source: '',
    checkpointType: type,
    targetStageId,
    pedagogicalObjective: '',
    targetConceptIds: [],
    rationale,
    requiresLaboratoryContext: requiresLabContext,
    omissionReason: omissionReason || `No active assessment resource available for "${assessmentId}".`,
  };
}

// ---------------------------------------------------------------------------
// Pure deterministic lab context availability check
// ---------------------------------------------------------------------------

function _hasLaboratoryContext(labTrace: DidacticLaboratoryTrace | undefined): boolean {
  if (!labTrace || typeof labTrace !== 'object') {
    return false;
  }
  return labTrace.labsSelected > 0;
}

// ---------------------------------------------------------------------------
// Core assessment orchestration function
// ---------------------------------------------------------------------------

export function orchestrateAssessmentCheckpoints(
  assessmentInput: DidacticAssessmentInput | undefined,
  assessmentResources: readonly DidacticAssessmentResource[],
  conceptIds: readonly string[],
  labTrace: DidacticLaboratoryTrace | undefined,
): DidacticAssessmentDecision[] {
  if (!assessmentResources || assessmentResources.length === 0) {
    return [];
  }

  const decisions: DidacticAssessmentDecision[] = [];
  const processedAssessments = new Set<string>();
  const hasLabContext = _hasLaboratoryContext(labTrace);
  const hasExplicitRequests = !!(assessmentInput && Array.isArray(assessmentInput.requestedAssessments) && assessmentInput.requestedAssessments.length > 0);

  // 1. Process requested assessment placements (if any)
  if (hasExplicitRequests) {
    for (let i = 0; i < assessmentInput!.requestedAssessments!.length; i++) {
      const placement = assessmentInput!.requestedAssessments![i];
      const { assessmentId, checkpointType } = placement;

      // Skip if already processed (deduplicate)
      if (processedAssessments.has(assessmentId)) {
        continue;
      }
      processedAssessments.add(assessmentId);

      // Validate checkpoint type
      if (!VALID_CHECKPOINT_TYPES.has(checkpointType)) {
        decisions.push({
          assessmentId,
          status: 'omitted',
          source: '',
          checkpointType,
          targetStageId: 'assessment',
          pedagogicalObjective: '',
          targetConceptIds: [],
          rationale: '',
          requiresLaboratoryContext: false,
          omissionReason: `Unsupported assessment checkpoint type: "${checkpointType}".`,
        });
        continue;
      }

      // Look up governed resource
      const resource = _findAssessmentResource(assessmentId, assessmentResources);
      if (!resource) {
        decisions.push(_buildAssessmentDecision(assessmentId, null, checkpointType, false, `Requested assessment "${assessmentId}" has no active resource.`));
        continue;
      }

      // Check if assessment requires lab context but no lab trace exists
      if (resource.requiresLaboratoryContext && !hasLabContext) {
        decisions.push(_buildAssessmentDecision(
          assessmentId,
          null,
          checkpointType,
          true,
          `Assessment "${assessmentId}" requires laboratory context but no laboratory trace is available.`,
        ));
        continue;
      }

      // Check concept coverage
      const missingConcepts = _findMissingConcepts(resource.targetConceptIds, conceptIds);
      if (missingConcepts.length > 0) {
        decisions.push(_buildAssessmentDecision(
          assessmentId,
          null,
          checkpointType,
          resource.requiresLaboratoryContext,
          `Assessment "${assessmentId}" targets concepts not present in lesson: ${missingConcepts.join(', ')}.`,
        ));
        continue;
      }

      decisions.push(_buildAssessmentDecision(assessmentId, resource, checkpointType, resource.requiresLaboratoryContext, null));
    }
  }

  // 2. Process all available assessment resources not explicitly requested
  // (only when no explicit requests were provided)
  if (!hasExplicitRequests) {
    for (let i = 0; i < assessmentResources.length; i++) {
      const resource = assessmentResources[i];
      if (processedAssessments.has(resource.assessmentId)) {
        continue;
      }

      // Only include active resources
      if (resource.lifecycle !== 'active') {
        continue;
      }

      processedAssessments.add(resource.assessmentId);

      // Check if assessment requires lab context but no lab trace exists
      if (resource.requiresLaboratoryContext && !hasLabContext) {
        decisions.push(_buildAssessmentDecision(
          resource.assessmentId,
          null,
          resource.checkpointType,
          true,
          `Assessment "${resource.assessmentId}" requires laboratory context but no laboratory trace is available.`,
        ));
        continue;
      }

      // Check concept coverage
      const missingConcepts = _findMissingConcepts(resource.targetConceptIds, conceptIds);
      if (missingConcepts.length > 0) {
        decisions.push(_buildAssessmentDecision(
          resource.assessmentId,
          null,
          resource.checkpointType,
          resource.requiresLaboratoryContext,
          `Assessment "${resource.assessmentId}" targets concepts not present in lesson: ${missingConcepts.join(', ')}.`,
        ));
        continue;
      }

      decisions.push(_buildAssessmentDecision(resource.assessmentId, resource, resource.checkpointType, resource.requiresLaboratoryContext, null));
    }
  }

  return decisions;
}

// ---------------------------------------------------------------------------
// Pure deterministic missing concept detection
// ---------------------------------------------------------------------------

function _findMissingConcepts(
  required: readonly string[],
  available: readonly string[],
): string[] {
  const availableSet = new Set<string>(available);
  const missing: string[] = [];

  for (let i = 0; i < required.length; i++) {
    if (!availableSet.has(required[i])) {
      missing.push(required[i]);
    }
  }

  return missing;
}

// ---------------------------------------------------------------------------
// Build assessment trace from decisions
// ---------------------------------------------------------------------------

export function buildAssessmentTrace(
  decisions: readonly DidacticAssessmentDecision[],
): DidacticAssessmentTrace {
  const selectedAssessments: string[] = [];
  const omittedAssessments: string[] = [];

  for (let i = 0; i < decisions.length; i++) {
    const d = decisions[i];
    if (d.status === 'selected') {
      selectedAssessments.push(d.assessmentId);
    } else {
      omittedAssessments.push(d.assessmentId);
    }
  }

  return {
    assessmentsSelected: selectedAssessments.length,
    assessmentsOmitted: omittedAssessments.length,
    decisions,
    selectedAssessments,
    omittedAssessments,
  };
}

// ---------------------------------------------------------------------------
// Validation helpers (used by ValidationLayer)
// ---------------------------------------------------------------------------

export function validateAssessmentResource(
  resource: DidacticAssessmentResource,
): string[] {
  const errors: string[] = [];

  if (!resource.assessmentId || resource.assessmentId.trim() === '') {
    errors.push('Assessment resource missing assessmentId');
  }
  if (!resource.source || resource.source.trim() === '') {
    errors.push('Assessment resource missing source');
  }
  if (!resource.checkpointType || !VALID_CHECKPOINT_TYPES.has(resource.checkpointType)) {
    errors.push(`Invalid or missing checkpointType: "${resource.checkpointType}"`);
  }
  if (!Array.isArray(resource.supportedStages) || resource.supportedStages.length === 0) {
    errors.push('Assessment resource missing supportedStages');
  }
  if (!resource.pedagogicalObjective || resource.pedagogicalObjective.trim() === '') {
    errors.push('Assessment resource missing pedagogicalObjective');
  }
  if (!Array.isArray(resource.targetConceptIds)) {
    errors.push('Assessment resource missing targetConceptIds');
  }
  if (typeof resource.requiresLaboratoryContext !== 'boolean') {
    errors.push('Assessment resource missing requiresLaboratoryContext');
  }
  if (!resource.lifecycle || !['active', 'deprecated', 'experimental'].includes(resource.lifecycle)) {
    errors.push(`Invalid lifecycle: "${resource.lifecycle}"`);
  }

  return errors;
}

export function validateAssessmentDecision(
  decision: DidacticAssessmentDecision,
): string[] {
  const errors: string[] = [];

  if (!decision.assessmentId || decision.assessmentId.trim() === '') {
    errors.push('Assessment decision missing assessmentId');
  }

  if (decision.status === 'selected') {
    if (!decision.source || decision.source.trim() === '') {
      errors.push(`Selected assessment "${decision.assessmentId}" missing source`);
    }
    if (!decision.pedagogicalObjective || decision.pedagogicalObjective.trim() === '') {
      errors.push(`Selected assessment "${decision.assessmentId}" missing pedagogicalObjective`);
    }
    if (!decision.rationale || decision.rationale.trim() === '') {
      errors.push(`Selected assessment "${decision.assessmentId}" missing rationale`);
    }
  }

  if (decision.status === 'omitted') {
    if (!decision.omissionReason || decision.omissionReason.trim() === '') {
      errors.push(`Omitted assessment "${decision.assessmentId}" missing omissionReason`);
    }
  }

  return errors;
}

export { VALID_CHECKPOINT_TYPES, CHECKPOINT_TYPE_STAGE_MAP, CHECKPOINT_TYPE_RATIONALE };
