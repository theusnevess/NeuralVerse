/**
 * NV-1300-D1-OPT-07 — Deterministic Instructional Support Orchestrator
 *
 * Pure deterministic function that orchestrates misconception warnings
 * and cognitive-load safeguards in the instructional flow.
 *
 * Rules:
 * - Select a support item only when a governed support resource exists.
 * - Select only when target concept coverage matches.
 * - Attach support decisions to existing canonical stages only.
 * - Missing requested support produces explicit omission reason.
 * - Deprecated/invalid resources must not be selected.
 * - No generated explanation/warning text is allowed.
 * - No learner-state inference is allowed.
 *
 * Misconception Type → Stage Mapping:
 * - definition_confusion → concept_introduction
 * - notation_confusion → mathematical_foundation
 * - mathematical_misinterpretation → mathematical_foundation
 * - implementation_pitfall → practical_example
 * - visual_misreading → visual_demonstration
 * - concept_overlap → context or guided_explanation
 * - false_intuition → intuition or common_misconceptions
 * - overgeneralization → common_misconceptions or summary
 *
 * Cognitive Load Type → Stage Mapping:
 * - prerequisite_recap → context
 * - terminology_anchor → concept_introduction
 * - notation_anchor → mathematical_foundation
 * - visual_anchor → visual_demonstration
 * - step_chunking → guided_explanation
 * - complexity_warning → context or guided_explanation
 * - transition_bridge → context or forward_connections
 * - summary_checkpoint → summary
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 * Does not mutate support resources, curriculum, or input objects.
 */

import type {
  DidacticMisconceptionSupportType,
  DidacticCognitiveLoadSupportType,
  DidacticMisconceptionResource,
  DidacticCognitiveLoadResource,
  DidacticSupportDecision,
  DidacticSupportTrace,
  DidacticPipelineStageName,
  DidacticSupportInput,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Valid support types
// ---------------------------------------------------------------------------

const VALID_MISCONCEPTION_TYPES = new Set<string>([
  'definition_confusion',
  'notation_confusion',
  'mathematical_misinterpretation',
  'implementation_pitfall',
  'visual_misreading',
  'concept_overlap',
  'false_intuition',
  'overgeneralization',
]);

const VALID_COGNITIVE_LOAD_TYPES = new Set<string>([
  'prerequisite_recap',
  'terminology_anchor',
  'notation_anchor',
  'visual_anchor',
  'step_chunking',
  'complexity_warning',
  'transition_bridge',
  'summary_checkpoint',
]);

// ---------------------------------------------------------------------------
// Misconception type → default target stage mapping
// ---------------------------------------------------------------------------

const MISCONCEPTION_TYPE_STAGE_MAP: Record<
  DidacticMisconceptionSupportType,
  readonly DidacticPipelineStageName[]
> = {
  definition_confusion: ['concept_introduction'],
  notation_confusion: ['mathematical_foundation'],
  mathematical_misinterpretation: ['mathematical_foundation'],
  implementation_pitfall: ['practical_example'],
  visual_misreading: ['visual_demonstration'],
  concept_overlap: ['context', 'guided_explanation'],
  false_intuition: ['intuition', 'common_misconceptions'],
  overgeneralization: ['common_misconceptions', 'summary'],
};

// ---------------------------------------------------------------------------
// Cognitive load type → default target stage mapping
// ---------------------------------------------------------------------------

const COGNITIVE_LOAD_TYPE_STAGE_MAP: Record<
  DidacticCognitiveLoadSupportType,
  readonly DidacticPipelineStageName[]
> = {
  prerequisite_recap: ['context'],
  terminology_anchor: ['concept_introduction'],
  notation_anchor: ['mathematical_foundation'],
  visual_anchor: ['visual_demonstration'],
  step_chunking: ['guided_explanation'],
  complexity_warning: ['context', 'guided_explanation'],
  transition_bridge: ['context', 'forward_connections'],
  summary_checkpoint: ['summary'],
};

// ---------------------------------------------------------------------------
// Support rationale templates
// ---------------------------------------------------------------------------

const MISCONCEPTION_RATIONALE: Record<DidacticMisconceptionSupportType, string> = {
  definition_confusion: 'Definition confusion warning placed to proactively address known definitional misunderstandings.',
  notation_confusion: 'Notation confusion warning placed to prevent misreading of mathematical or symbolic notation.',
  mathematical_misinterpretation: 'Mathematical misinterpretation warning placed to address common formula or derivation errors.',
  implementation_pitfall: 'Implementation pitfall warning placed to highlight known coding or construction errors.',
  visual_misreading: 'Visual misreading warning placed to prevent incorrect interpretation of diagrams or visualizations.',
  concept_overlap: 'Concept overlap warning placed to clarify distinctions between similar concepts.',
  false_intuition: 'False intuition warning placed to address intuitive but incorrect mental models.',
  overgeneralization: 'Overgeneralization warning placed to prevent applying concepts beyond their valid scope.',
};

const COGNITIVE_LOAD_RATIONALE: Record<DidacticCognitiveLoadSupportType, string> = {
  prerequisite_recap: 'Prerequisite recap placed to reinforce foundational knowledge before new concepts.',
  terminology_anchor: 'Terminology anchor placed to ensure consistent use of key terms.',
  notation_anchor: 'Notation anchor placed to establish consistent mathematical or symbolic notation.',
  visual_anchor: 'Visual anchor placed to provide consistent spatial reference for visual understanding.',
  step_chunking: 'Step chunking placed to break complex explanations into manageable segments.',
  complexity_warning: 'Complexity warning placed to signal high cognitive load sections.',
  transition_bridge: 'Transition bridge placed to smooth transitions between conceptual sections.',
  summary_checkpoint: 'Summary checkpoint placed to consolidate understanding at key milestones.',
};

// ---------------------------------------------------------------------------
// Pure deterministic resource lookup
// ---------------------------------------------------------------------------

function _findMisconceptionResource(
  misconceptionId: string,
  resources: readonly DidacticMisconceptionResource[],
): DidacticMisconceptionResource | null {
  for (let i = 0; i < resources.length; i++) {
    if (resources[i].misconceptionId === misconceptionId && resources[i].lifecycle === 'active') {
      return resources[i];
    }
  }
  return null;
}

function _findCognitiveLoadResource(
  supportId: string,
  resources: readonly DidacticCognitiveLoadResource[],
): DidacticCognitiveLoadResource | null {
  for (let i = 0; i < resources.length; i++) {
    if (resources[i].supportId === supportId && resources[i].lifecycle === 'active') {
      return resources[i];
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Pure deterministic target stage resolution
// ---------------------------------------------------------------------------

function _resolveMisconceptionStage(
  type: DidacticMisconceptionSupportType,
  resource: DidacticMisconceptionResource | null,
): DidacticPipelineStageName {
  if (resource && resource.supportedStages.length > 0) {
    const defaultStages = MISCONCEPTION_TYPE_STAGE_MAP[type];
    for (let i = 0; i < defaultStages.length; i++) {
      for (let j = 0; j < resource.supportedStages.length; j++) {
        if (defaultStages[i] === resource.supportedStages[j]) {
          return defaultStages[i];
        }
      }
    }
    return resource.supportedStages[0];
  }
  return MISCONCEPTION_TYPE_STAGE_MAP[type][0];
}

function _resolveCognitiveLoadStage(
  type: DidacticCognitiveLoadSupportType,
  resource: DidacticCognitiveLoadResource | null,
): DidacticPipelineStageName {
  if (resource && resource.supportedStages.length > 0) {
    const defaultStages = COGNITIVE_LOAD_TYPE_STAGE_MAP[type];
    for (let i = 0; i < defaultStages.length; i++) {
      for (let j = 0; j < resource.supportedStages.length; j++) {
        if (defaultStages[i] === resource.supportedStages[j]) {
          return defaultStages[i];
        }
      }
    }
    return resource.supportedStages[0];
  }
  return COGNITIVE_LOAD_TYPE_STAGE_MAP[type][0];
}

// ---------------------------------------------------------------------------
// Pure deterministic decision builders
// ---------------------------------------------------------------------------

function _buildMisconceptionDecision(
  misconceptionId: string,
  resource: DidacticMisconceptionResource | null,
  type: DidacticMisconceptionSupportType,
  omissionReason: string | null,
): DidacticSupportDecision {
  const targetStageId = resource ? _resolveMisconceptionStage(type, resource) : MISCONCEPTION_TYPE_STAGE_MAP[type][0];
  const rationale = MISCONCEPTION_RATIONALE[type];

  if (resource) {
    return {
      supportId: misconceptionId,
      status: 'selected',
      category: 'misconception',
      supportType: type,
      source: resource.source,
      targetStageId,
      pedagogicalObjective: resource.pedagogicalObjective,
      targetConceptIds: resource.targetConceptIds,
      rationale,
      severity: resource.severity,
      omissionReason: null,
    };
  }

  return {
    supportId: misconceptionId,
    status: 'omitted',
    category: 'misconception',
    supportType: type,
    source: '',
    targetStageId,
    pedagogicalObjective: '',
    targetConceptIds: [],
    rationale,
    severity: null,
    omissionReason: omissionReason || `No active misconception resource available for "${misconceptionId}".`,
  };
}

function _buildCognitiveLoadDecision(
  supportId: string,
  resource: DidacticCognitiveLoadResource | null,
  type: DidacticCognitiveLoadSupportType,
  omissionReason: string | null,
): DidacticSupportDecision {
  const targetStageId = resource ? _resolveCognitiveLoadStage(type, resource) : COGNITIVE_LOAD_TYPE_STAGE_MAP[type][0];
  const rationale = COGNITIVE_LOAD_RATIONALE[type];

  if (resource) {
    return {
      supportId,
      status: 'selected',
      category: 'cognitive_load',
      supportType: type,
      source: resource.source,
      targetStageId,
      pedagogicalObjective: resource.pedagogicalObjective,
      targetConceptIds: resource.targetConceptIds,
      rationale,
      severity: resource.loadLevel,
      omissionReason: null,
    };
  }

  return {
    supportId,
    status: 'omitted',
    category: 'cognitive_load',
    supportType: type,
    source: '',
    targetStageId,
    pedagogicalObjective: '',
    targetConceptIds: [],
    rationale,
    severity: null,
    omissionReason: omissionReason || `No active cognitive-load resource available for "${supportId}".`,
  };
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
// Core support orchestration function
// ---------------------------------------------------------------------------

export function orchestrateInstructionalSupports(
  supportInput: DidacticSupportInput | undefined,
  misconceptionResources: readonly DidacticMisconceptionResource[],
  cognitiveLoadResources: readonly DidacticCognitiveLoadResource[],
  conceptIds: readonly string[],
): DidacticSupportDecision[] {
  const decisions: DidacticSupportDecision[] = [];
  const processedSupports = new Set<string>();
  const hasExplicitRequests = !!(supportInput && Array.isArray(supportInput.requestedSupports) && supportInput.requestedSupports.length > 0);

  // 1. Process requested supports (if any)
  if (hasExplicitRequests) {
    for (let i = 0; i < supportInput!.requestedSupports!.length; i++) {
      const placement = supportInput!.requestedSupports![i];
      const { supportId, supportType, category } = placement;

      // Skip if already processed
      if (processedSupports.has(supportId)) {
        continue;
      }
      processedSupports.add(supportId);

      if (category === 'misconception') {
        // Validate misconception support type
        if (!VALID_MISCONCEPTION_TYPES.has(supportType)) {
          decisions.push({
            supportId,
            status: 'omitted',
            category: 'misconception',
            supportType: supportType as DidacticMisconceptionSupportType,
            source: '',
            targetStageId: 'common_misconceptions',
            pedagogicalObjective: '',
            targetConceptIds: [],
            rationale: '',
            severity: null,
            omissionReason: `Unsupported misconception support type: "${supportType}".`,
          });
          continue;
        }

        const resource = _findMisconceptionResource(supportId, misconceptionResources);
        if (!resource) {
          decisions.push(_buildMisconceptionDecision(supportId, null, supportType as DidacticMisconceptionSupportType, `Requested misconception support "${supportId}" has no active resource.`));
          continue;
        }

        const missingConcepts = _findMissingConcepts(resource.targetConceptIds, conceptIds);
        if (missingConcepts.length > 0) {
          decisions.push(_buildMisconceptionDecision(
            supportId,
            null,
            supportType as DidacticMisconceptionSupportType,
            `Misconception support "${supportId}" targets concepts not present in lesson: ${missingConcepts.join(', ')}.`,
          ));
          continue;
        }

        decisions.push(_buildMisconceptionDecision(supportId, resource, supportType as DidacticMisconceptionSupportType, null));
      } else if (category === 'cognitive_load') {
        // Validate cognitive-load support type
        if (!VALID_COGNITIVE_LOAD_TYPES.has(supportType)) {
          decisions.push({
            supportId,
            status: 'omitted',
            category: 'cognitive_load',
            supportType: supportType as DidacticCognitiveLoadSupportType,
            source: '',
            targetStageId: 'context',
            pedagogicalObjective: '',
            targetConceptIds: [],
            rationale: '',
            severity: null,
            omissionReason: `Unsupported cognitive-load support type: "${supportType}".`,
          });
          continue;
        }

        const resource = _findCognitiveLoadResource(supportId, cognitiveLoadResources);
        if (!resource) {
          decisions.push(_buildCognitiveLoadDecision(supportId, null, supportType as DidacticCognitiveLoadSupportType, `Requested cognitive-load support "${supportId}" has no active resource.`));
          continue;
        }

        const missingConcepts = _findMissingConcepts(resource.targetConceptIds, conceptIds);
        if (missingConcepts.length > 0) {
          decisions.push(_buildCognitiveLoadDecision(
            supportId,
            null,
            supportType as DidacticCognitiveLoadSupportType,
            `Cognitive-load support "${supportId}" targets concepts not present in lesson: ${missingConcepts.join(', ')}.`,
          ));
          continue;
        }

        decisions.push(_buildCognitiveLoadDecision(supportId, resource, supportType as DidacticCognitiveLoadSupportType, null));
      }
    }
  }

  // 2. Process all available misconception resources not explicitly requested
  // (only when no explicit requests were provided)
  if (!hasExplicitRequests) {
    for (let i = 0; i < misconceptionResources.length; i++) {
      const resource = misconceptionResources[i];
      if (processedSupports.has(resource.misconceptionId)) {
        continue;
      }
      if (resource.lifecycle !== 'active') {
        continue;
      }
      processedSupports.add(resource.misconceptionId);

      const missingConcepts = _findMissingConcepts(resource.targetConceptIds, conceptIds);
      if (missingConcepts.length > 0) {
        decisions.push(_buildMisconceptionDecision(
          resource.misconceptionId,
          null,
          resource.supportType,
          `Misconception support "${resource.misconceptionId}" targets concepts not present in lesson: ${missingConcepts.join(', ')}.`,
        ));
        continue;
      }

      decisions.push(_buildMisconceptionDecision(resource.misconceptionId, resource, resource.supportType, null));
    }

    // 3. Process all available cognitive-load resources not explicitly requested
    for (let i = 0; i < cognitiveLoadResources.length; i++) {
      const resource = cognitiveLoadResources[i];
      if (processedSupports.has(resource.supportId)) {
        continue;
      }
      if (resource.lifecycle !== 'active') {
        continue;
      }
      processedSupports.add(resource.supportId);

      const missingConcepts = _findMissingConcepts(resource.targetConceptIds, conceptIds);
      if (missingConcepts.length > 0) {
        decisions.push(_buildCognitiveLoadDecision(
          resource.supportId,
          null,
          resource.supportType,
          `Cognitive-load support "${resource.supportId}" targets concepts not present in lesson: ${missingConcepts.join(', ')}.`,
        ));
        continue;
      }

      decisions.push(_buildCognitiveLoadDecision(resource.supportId, resource, resource.supportType, null));
    }
  }

  return decisions;
}

// ---------------------------------------------------------------------------
// Build support trace from decisions
// ---------------------------------------------------------------------------

export function buildSupportTrace(
  decisions: readonly DidacticSupportDecision[],
): DidacticSupportTrace {
  const selectedSupports: string[] = [];
  const omittedSupports: string[] = [];

  for (let i = 0; i < decisions.length; i++) {
    const d = decisions[i];
    if (d.status === 'selected') {
      selectedSupports.push(d.supportId);
    } else {
      omittedSupports.push(d.supportId);
    }
  }

  return {
    supportsSelected: selectedSupports.length,
    supportsOmitted: omittedSupports.length,
    decisions,
    selectedSupports,
    omittedSupports,
  };
}

// ---------------------------------------------------------------------------
// Validation helpers (used by ValidationLayer)
// ---------------------------------------------------------------------------

export function validateMisconceptionResource(
  resource: DidacticMisconceptionResource,
): string[] {
  const errors: string[] = [];

  if (!resource.misconceptionId || resource.misconceptionId.trim() === '') {
    errors.push('Misconception resource missing misconceptionId');
  }
  if (!resource.supportType || !VALID_MISCONCEPTION_TYPES.has(resource.supportType)) {
    errors.push(`Invalid or missing supportType: "${resource.supportType}"`);
  }
  if (!resource.source || resource.source.trim() === '') {
    errors.push('Misconception resource missing source');
  }
  if (!Array.isArray(resource.supportedStages) || resource.supportedStages.length === 0) {
    errors.push('Misconception resource missing supportedStages');
  }
  if (!resource.pedagogicalObjective || resource.pedagogicalObjective.trim() === '') {
    errors.push('Misconception resource missing pedagogicalObjective');
  }
  if (!Array.isArray(resource.targetConceptIds)) {
    errors.push('Misconception resource missing targetConceptIds');
  }
  if (!resource.severity || !['low', 'medium', 'high'].includes(resource.severity)) {
    errors.push(`Invalid severity: "${resource.severity}"`);
  }
  if (!resource.lifecycle || !['active', 'deprecated', 'experimental'].includes(resource.lifecycle)) {
    errors.push(`Invalid lifecycle: "${resource.lifecycle}"`);
  }

  return errors;
}

export function validateCognitiveLoadResource(
  resource: DidacticCognitiveLoadResource,
): string[] {
  const errors: string[] = [];

  if (!resource.supportId || resource.supportId.trim() === '') {
    errors.push('Cognitive-load resource missing supportId');
  }
  if (!resource.supportType || !VALID_COGNITIVE_LOAD_TYPES.has(resource.supportType)) {
    errors.push(`Invalid or missing supportType: "${resource.supportType}"`);
  }
  if (!resource.source || resource.source.trim() === '') {
    errors.push('Cognitive-load resource missing source');
  }
  if (!Array.isArray(resource.supportedStages) || resource.supportedStages.length === 0) {
    errors.push('Cognitive-load resource missing supportedStages');
  }
  if (!resource.pedagogicalObjective || resource.pedagogicalObjective.trim() === '') {
    errors.push('Cognitive-load resource missing pedagogicalObjective');
  }
  if (!Array.isArray(resource.targetConceptIds)) {
    errors.push('Cognitive-load resource missing targetConceptIds');
  }
  if (!resource.loadLevel || !['low', 'medium', 'high'].includes(resource.loadLevel)) {
    errors.push(`Invalid loadLevel: "${resource.loadLevel}"`);
  }
  if (!resource.lifecycle || !['active', 'deprecated', 'experimental'].includes(resource.lifecycle)) {
    errors.push(`Invalid lifecycle: "${resource.lifecycle}"`);
  }

  return errors;
}

export function validateSupportDecision(
  decision: DidacticSupportDecision,
): string[] {
  const errors: string[] = [];

  if (!decision.supportId || decision.supportId.trim() === '') {
    errors.push('Support decision missing supportId');
  }

  if (decision.status === 'selected') {
    if (!decision.source || decision.source.trim() === '') {
      errors.push(`Selected support "${decision.supportId}" missing source`);
    }
    if (!decision.pedagogicalObjective || decision.pedagogicalObjective.trim() === '') {
      errors.push(`Selected support "${decision.supportId}" missing pedagogicalObjective`);
    }
    if (!decision.rationale || decision.rationale.trim() === '') {
      errors.push(`Selected support "${decision.supportId}" missing rationale`);
    }
  }

  if (decision.status === 'omitted') {
    if (!decision.omissionReason || decision.omissionReason.trim() === '') {
      errors.push(`Omitted support "${decision.supportId}" missing omissionReason`);
    }
  }

  return errors;
}

export { VALID_MISCONCEPTION_TYPES, VALID_COGNITIVE_LOAD_TYPES, MISCONCEPTION_TYPE_STAGE_MAP, COGNITIVE_LOAD_TYPE_STAGE_MAP, MISCONCEPTION_RATIONALE, COGNITIVE_LOAD_RATIONALE };
