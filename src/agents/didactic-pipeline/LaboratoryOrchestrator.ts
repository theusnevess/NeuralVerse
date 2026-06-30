/**
 * NV-1300-D1-OPT-05 — Deterministic Laboratory Orchestrator
 *
 * Pure deterministic function that orchestrates deep laboratory
 * integration into the instructional flow.
 *
 * Rules:
 * - Select a lab only when a governed laboratory resource exists.
 * - Select integration mode only when the lab supports it.
 * - Attach lab decisions to existing canonical stages only.
 * - Missing requested lab/mode produces explicit omission reason.
 * - Deprecated/invalid lab resources must not be selected.
 * - No lab execution is allowed.
 * - No generated educational text is allowed.
 *
 * Integration Mode → Stage Mapping:
 * - exploratory_before_explanation → intuition or concept_introduction
 * - guided_during_explanation → guided_explanation
 * - validation_after_theory → practical_example or interactive_laboratory
 * - comparative_between_methods → practical_example or interactive_laboratory
 * - challenge_after_assessment → assessment or summary
 * - reinforcement_after_assessment → summary or forward_connections
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 * Does not mutate lab resources, curriculum, or input objects.
 */

import type {
  DidacticLaboratoryIntegrationMode,
  DidacticLaboratoryResource,
  DidacticLaboratoryDecision,
  DidacticLaboratoryPlacement,
  DidacticLaboratoryTrace,
  DidacticPipelineStageName,
  DidacticLaboratoryInput,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Valid integration modes
// ---------------------------------------------------------------------------

const VALID_INTEGRATION_MODES = new Set<string>([
  'exploratory_before_explanation',
  'guided_during_explanation',
  'validation_after_theory',
  'comparative_between_methods',
  'challenge_after_assessment',
  'reinforcement_after_assessment',
]);

// ---------------------------------------------------------------------------
// Integration mode → default target stage mapping
// ---------------------------------------------------------------------------

const INTEGRATION_MODE_STAGE_MAP: Record<
  DidacticLaboratoryIntegrationMode,
  readonly DidacticPipelineStageName[]
> = {
  exploratory_before_explanation: ['intuition', 'concept_introduction'],
  guided_during_explanation: ['guided_explanation'],
  validation_after_theory: ['practical_example', 'interactive_laboratory'],
  comparative_between_methods: ['practical_example', 'interactive_laboratory'],
  challenge_after_assessment: ['assessment', 'summary'],
  reinforcement_after_assessment: ['summary', 'forward_connections'],
};

// ---------------------------------------------------------------------------
// Integration mode rationale templates
// ---------------------------------------------------------------------------

const INTEGRATION_MODE_RATIONALE: Record<DidacticLaboratoryIntegrationMode, string> = {
  exploratory_before_explanation: 'Laboratory placed before explanation to build intuition through exploration.',
  guided_during_explanation: 'Laboratory placed during explanation to reinforce concepts through guided practice.',
  validation_after_theory: 'Laboratory placed after theory to validate understanding through application.',
  comparative_between_methods: 'Laboratory placed to compare different approaches or methods.',
  challenge_after_assessment: 'Laboratory placed after assessment as an extension challenge.',
  reinforcement_after_assessment: 'Laboratory placed after assessment to reinforce learning through practice.',
};

// ---------------------------------------------------------------------------
// Pure deterministic lab resource lookup
// ---------------------------------------------------------------------------

function _findLabResource(
  labId: string,
  resources: readonly DidacticLaboratoryResource[],
): DidacticLaboratoryResource | null {
  for (let i = 0; i < resources.length; i++) {
    if (resources[i].labId === labId && resources[i].lifecycle === 'active') {
      return resources[i];
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Pure deterministic mode support check
// ---------------------------------------------------------------------------

function _labSupportsMode(
  resource: DidacticLaboratoryResource,
  mode: DidacticLaboratoryIntegrationMode,
): boolean {
  for (let i = 0; i < resource.supportedIntegrationModes.length; i++) {
    if (resource.supportedIntegrationModes[i] === mode) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Pure deterministic target stage resolution
// ---------------------------------------------------------------------------

function _resolveTargetStage(
  mode: DidacticLaboratoryIntegrationMode,
  resource: DidacticLaboratoryResource | null,
): DidacticPipelineStageName {
  // Use resource's supportedStages if available and relevant
  if (resource && resource.supportedStages.length > 0) {
    const defaultStages = INTEGRATION_MODE_STAGE_MAP[mode];
    // Find intersection of resource's supported stages and mode's default stages
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

  // Fall back to first default stage for mode
  return INTEGRATION_MODE_STAGE_MAP[mode][0];
}

// ---------------------------------------------------------------------------
// Pure deterministic lab decision builder
// ---------------------------------------------------------------------------

function _buildLabDecision(
  labId: string,
  resource: DidacticLaboratoryResource | null,
  mode: DidacticLaboratoryIntegrationMode,
  omissionReason: string | null,
): DidacticLaboratoryDecision {
  const targetStageId = resource ? _resolveTargetStage(mode, resource) : INTEGRATION_MODE_STAGE_MAP[mode][0];
  const rationale = INTEGRATION_MODE_RATIONALE[mode];

  if (resource) {
    return {
      labId,
      status: 'selected',
      source: resource.source,
      integrationMode: mode,
      targetStageId,
      pedagogicalObjective: resource.pedagogicalObjective,
      requiredConceptIds: resource.requiredConceptIds,
      rationale,
      omissionReason: null,
    };
  }

  return {
    labId,
    status: 'omitted',
    source: '',
    integrationMode: mode,
    targetStageId,
    pedagogicalObjective: '',
    requiredConceptIds: [],
    rationale,
    omissionReason: omissionReason || `No active laboratory resource available for "${labId}".`,
  };
}

// ---------------------------------------------------------------------------
// Core lab orchestration function
// ---------------------------------------------------------------------------

export function orchestrateLaboratories(
  labInput: DidacticLaboratoryInput | undefined,
  labResources: readonly DidacticLaboratoryResource[],
  conceptIds: readonly string[],
): DidacticLaboratoryDecision[] {
  if (!labResources || labResources.length === 0) {
    return [];
  }

  const decisions: DidacticLaboratoryDecision[] = [];
  const processedLabs = new Set<string>();
  const hasExplicitRequests = !!(labInput && Array.isArray(labInput.requestedLabs) && labInput.requestedLabs.length > 0);

  // 1. Process requested lab placements (if any)
  if (hasExplicitRequests) {
    for (let i = 0; i < labInput!.requestedLabs!.length; i++) {
      const placement = labInput!.requestedLabs![i];
      const { labId, integrationMode } = placement;

      // Skip if already processed (deduplicate)
      if (processedLabs.has(labId)) {
        continue;
      }
      processedLabs.add(labId);

      // Validate integration mode
      if (!VALID_INTEGRATION_MODES.has(integrationMode)) {
        decisions.push({
          labId,
          status: 'omitted',
          source: '',
          integrationMode,
          targetStageId: 'interactive_laboratory',
          pedagogicalObjective: '',
          requiredConceptIds: [],
          rationale: '',
          omissionReason: `Unsupported integration mode: "${integrationMode}".`,
        });
        continue;
      }

      // Look up governed resource
      const resource = _findLabResource(labId, labResources);
      if (!resource) {
        decisions.push(_buildLabDecision(labId, null, integrationMode, `Requested lab "${labId}" has no active resource.`));
        continue;
      }

      // Check if lab supports the requested mode
      if (!_labSupportsMode(resource, integrationMode)) {
        decisions.push(_buildLabDecision(
          labId,
          null,
          integrationMode,
          `Lab "${labId}" does not support integration mode "${integrationMode}".`,
        ));
        continue;
      }

      // Check if lab's required concepts are covered
      const missingConcepts = _findMissingConcepts(resource.requiredConceptIds, conceptIds);
      if (missingConcepts.length > 0) {
        decisions.push(_buildLabDecision(
          labId,
          null,
          integrationMode,
          `Lab "${labId}" requires concepts not present in lesson: ${missingConcepts.join(', ')}.`,
        ));
        continue;
      }

      decisions.push(_buildLabDecision(labId, resource, integrationMode, null));
    }
  }

  // 2. Process all available lab resources not explicitly requested
  // (only when no explicit requests were provided)
  if (!hasExplicitRequests) {
    for (let i = 0; i < labResources.length; i++) {
      const resource = labResources[i];
      if (processedLabs.has(resource.labId)) {
        continue;
      }

      // Only include active resources
      if (resource.lifecycle !== 'active') {
        continue;
      }

      processedLabs.add(resource.labId);

      // Determine best integration mode based on resource support
      const bestMode = _determineBestMode(resource);
      if (!bestMode) {
        decisions.push({
          labId: resource.labId,
          status: 'omitted',
          source: resource.source,
          integrationMode: 'guided_during_explanation',
          targetStageId: 'interactive_laboratory',
          pedagogicalObjective: resource.pedagogicalObjective,
          requiredConceptIds: resource.requiredConceptIds,
          rationale: '',
          omissionReason: `Lab "${resource.labId}" has no supported integration modes.`,
        });
        continue;
      }

      // Check concept coverage
      const missingConcepts = _findMissingConcepts(resource.requiredConceptIds, conceptIds);
      if (missingConcepts.length > 0) {
        decisions.push(_buildLabDecision(
          resource.labId,
          null,
          bestMode,
          `Lab "${resource.labId}" requires concepts not present in lesson: ${missingConcepts.join(', ')}.`,
        ));
        continue;
      }

      decisions.push(_buildLabDecision(resource.labId, resource, bestMode, null));
    }
  }

  return decisions;
}

// ---------------------------------------------------------------------------
// Pure deterministic best mode selection
// ---------------------------------------------------------------------------

function _determineBestMode(
  resource: DidacticLaboratoryResource,
): DidacticLaboratoryIntegrationMode | null {
  // Prefer modes in canonical order
  const modeOrder: DidacticLaboratoryIntegrationMode[] = [
    'guided_during_explanation',
    'validation_after_theory',
    'exploratory_before_explanation',
    'comparative_between_methods',
    'reinforcement_after_assessment',
    'challenge_after_assessment',
  ];

  for (let i = 0; i < modeOrder.length; i++) {
    if (_labSupportsMode(resource, modeOrder[i])) {
      return modeOrder[i];
    }
  }

  return null;
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
// Build lab trace from decisions
// ---------------------------------------------------------------------------

export function buildLabTrace(
  decisions: readonly DidacticLaboratoryDecision[],
): DidacticLaboratoryTrace {
  const selectedLabs: string[] = [];
  const omittedLabs: string[] = [];

  for (let i = 0; i < decisions.length; i++) {
    const d = decisions[i];
    if (d.status === 'selected') {
      selectedLabs.push(d.labId);
    } else {
      omittedLabs.push(d.labId);
    }
  }

  return {
    labsSelected: selectedLabs.length,
    labsOmitted: omittedLabs.length,
    decisions,
    selectedLabs,
    omittedLabs,
  };
}

// ---------------------------------------------------------------------------
// Validation helpers (used by ValidationLayer)
// ---------------------------------------------------------------------------

export function validateLaboratoryResource(
  resource: DidacticLaboratoryResource,
): string[] {
  const errors: string[] = [];

  if (!resource.labId || resource.labId.trim() === '') {
    errors.push('Laboratory resource missing labId');
  }
  if (!resource.source || resource.source.trim() === '') {
    errors.push('Laboratory resource missing source');
  }
  if (!Array.isArray(resource.supportedIntegrationModes) || resource.supportedIntegrationModes.length === 0) {
    errors.push('Laboratory resource missing supportedIntegrationModes');
  }
  if (!Array.isArray(resource.supportedStages) || resource.supportedStages.length === 0) {
    errors.push('Laboratory resource missing supportedStages');
  }
  if (!resource.pedagogicalObjective || resource.pedagogicalObjective.trim() === '') {
    errors.push('Laboratory resource missing pedagogicalObjective');
  }
  if (!Array.isArray(resource.requiredConceptIds)) {
    errors.push('Laboratory resource missing requiredConceptIds');
  }
  if (!resource.lifecycle || !['active', 'deprecated', 'experimental'].includes(resource.lifecycle)) {
    errors.push(`Invalid lifecycle: "${resource.lifecycle}"`);
  }

  return errors;
}

export function validateLaboratoryDecision(
  decision: DidacticLaboratoryDecision,
): string[] {
  const errors: string[] = [];

  if (!decision.labId || decision.labId.trim() === '') {
    errors.push('Laboratory decision missing labId');
  }

  if (decision.status === 'selected') {
    if (!decision.source || decision.source.trim() === '') {
      errors.push(`Selected lab "${decision.labId}" missing source`);
    }
    if (!decision.pedagogicalObjective || decision.pedagogicalObjective.trim() === '') {
      errors.push(`Selected lab "${decision.labId}" missing pedagogicalObjective`);
    }
    if (!decision.rationale || decision.rationale.trim() === '') {
      errors.push(`Selected lab "${decision.labId}" missing rationale`);
    }
  }

  if (decision.status === 'omitted') {
    if (!decision.omissionReason || decision.omissionReason.trim() === '') {
      errors.push(`Omitted lab "${decision.labId}" missing omissionReason`);
    }
  }

  return errors;
}

export { VALID_INTEGRATION_MODES, INTEGRATION_MODE_STAGE_MAP, INTEGRATION_MODE_RATIONALE };
