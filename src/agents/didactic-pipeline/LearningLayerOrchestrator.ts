/**
 * NV-1300-D1-OPT-04 — Deterministic Learning Layer Orchestrator
 *
 * Pure deterministic function that orchestrates progressive learning
 * depth layers from motivation to advanced application.
 *
 * Rules:
 * - overview selects first 3 available layers in canonical order.
 * - standard selects layers 1–7 when available.
 * - deep selects layers 1–9 when available.
 * - full selects all 10 layers when available.
 * - Missing requested layers are omitted with explicit reason.
 * - Never select a layer without resourceId, source, and pedagogicalPurpose.
 * - Deprecated/invalid resources must not be selected.
 * - No generated educational text is allowed.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 * Does not mutate layer resources, curriculum, or input objects.
 */

import type {
  DidacticLearningLayer,
  DidacticLearningDepthMode,
  DidacticLearningLayerResource,
  DidacticLearningLayerDecision,
  DidacticLearningLayerTrace,
  DidacticLayerStageMapping,
  DidacticPipelineStageName,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Valid learning layers (canonical order)
// ---------------------------------------------------------------------------

const CANONICAL_LEARNING_LAYERS: readonly DidacticLearningLayer[] = [
  'problem_or_motivation',
  'high_level_intuition',
  'conceptual_explanation',
  'visual_interpretation',
  'mathematical_formalization',
  'algorithmic_reasoning',
  'implementation_example',
  'interactive_experimentation',
  'real_world_application',
  'limitations_tradeoffs_common_mistakes',
];

const VALID_LEARNING_LAYERS = new Set<string>(CANONICAL_LEARNING_LAYERS);

const VALID_DEPTH_MODES = new Set<string>(['overview', 'standard', 'deep', 'full']);

// ---------------------------------------------------------------------------
// Depth mode → layer count mapping (canonical order indices 0-based)
// ---------------------------------------------------------------------------

const DEPTH_MODE_LAYER_COUNT: Record<DidacticLearningDepthMode, number> = {
  overview: 3,
  standard: 7,
  deep: 9,
  full: 10,
};

// ---------------------------------------------------------------------------
// Default layer-to-stage mapping
// ---------------------------------------------------------------------------

const DEFAULT_LAYER_STAGE_MAPPINGS: readonly DidacticLayerStageMapping[] = [
  { layer: 'problem_or_motivation', stageId: 'motivation', mappingType: 'primary' },
  { layer: 'high_level_intuition', stageId: 'intuition', mappingType: 'primary' },
  { layer: 'conceptual_explanation', stageId: 'guided_explanation', mappingType: 'primary' },
  { layer: 'visual_interpretation', stageId: 'visual_demonstration', mappingType: 'primary' },
  { layer: 'mathematical_formalization', stageId: 'mathematical_foundation', mappingType: 'primary' },
  { layer: 'algorithmic_reasoning', stageId: 'guided_explanation', mappingType: 'secondary' },
  { layer: 'algorithmic_reasoning', stageId: 'practical_example', mappingType: 'secondary' },
  { layer: 'implementation_example', stageId: 'practical_example', mappingType: 'primary' },
  { layer: 'interactive_experimentation', stageId: 'interactive_laboratory', mappingType: 'primary' },
  { layer: 'real_world_application', stageId: 'practical_example', mappingType: 'secondary' },
  { layer: 'real_world_application', stageId: 'forward_connections', mappingType: 'secondary' },
  { layer: 'limitations_tradeoffs_common_mistakes', stageId: 'common_misconceptions', mappingType: 'primary' },
  { layer: 'limitations_tradeoffs_common_mistakes', stageId: 'summary', mappingType: 'secondary' },
];

// ---------------------------------------------------------------------------
// Pure deterministic layer resource lookup
// ---------------------------------------------------------------------------

function _findLayerResource(
  layer: DidacticLearningLayer,
  resources: readonly DidacticLearningLayerResource[],
): DidacticLearningLayerResource | null {
  for (let i = 0; i < resources.length; i++) {
    if (resources[i].layer === layer && resources[i].lifecycle === 'active') {
      return resources[i];
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Pure deterministic stage mapping resolution
// ---------------------------------------------------------------------------

function _resolveMappedStages(
  layer: DidacticLearningLayer,
  resource: DidacticLearningLayerResource | null,
): readonly DidacticPipelineStageName[] {
  // Use resource's supportedStages if available
  if (resource && resource.supportedStages.length > 0) {
    return resource.supportedStages;
  }

  // Fall back to default mappings
  const stages: DidacticPipelineStageName[] = [];
  for (let i = 0; i < DEFAULT_LAYER_STAGE_MAPPINGS.length; i++) {
    const m = DEFAULT_LAYER_STAGE_MAPPINGS[i];
    if (m.layer === layer) {
      stages.push(m.stageId);
    }
  }
  return stages;
}

// ---------------------------------------------------------------------------
// Pure deterministic layer decision builder
// ---------------------------------------------------------------------------

function _buildLayerDecision(
  layer: DidacticLearningLayer,
  resource: DidacticLearningLayerResource | null,
  omissionReason: string | null,
): DidacticLearningLayerDecision {
  const mappedStages = resource ? _resolveMappedStages(layer, resource) : [];

  if (resource) {
    return {
      layer,
      status: 'selected',
      resourceId: resource.resourceId,
      source: resource.source,
      supportedStages: resource.supportedStages,
      pedagogicalPurpose: resource.pedagogicalPurpose,
      mappedStages,
      omissionReason: null,
    };
  }

  return {
    layer,
    status: 'omitted',
    resourceId: null,
    source: '',
    supportedStages: [],
    pedagogicalPurpose: '',
    mappedStages: [],
    omissionReason: omissionReason || `No active layer resource available for "${layer}".`,
  };
}

// ---------------------------------------------------------------------------
// Core layer orchestration function
// ---------------------------------------------------------------------------

export function orchestrateLearningLayers(
  depthMode: DidacticLearningDepthMode | undefined,
  requestedLayers: readonly DidacticLearningLayer[] | undefined,
  layerResources: readonly DidacticLearningLayerResource[],
): DidacticLearningLayerDecision[] {
  if (!layerResources || layerResources.length === 0) {
    return [];
  }

  const effectiveDepthMode = depthMode || 'standard';
  const maxLayers = DEPTH_MODE_LAYER_COUNT[effectiveDepthMode] || 7;

  const decisions: DidacticLearningLayerDecision[] = [];
  const processedLayers = new Set<string>();

  // 1. Process requested layers first (if any)
  if (Array.isArray(requestedLayers) && requestedLayers.length > 0) {
    for (let i = 0; i < requestedLayers.length; i++) {
      const layer = requestedLayers[i];

      // Skip if already processed (deduplicate)
      if (processedLayers.has(layer)) {
        continue;
      }
      processedLayers.add(layer);

      // Validate layer name
      if (!VALID_LEARNING_LAYERS.has(layer)) {
        decisions.push({
          layer,
          status: 'omitted',
          resourceId: null,
          source: '',
          supportedStages: [],
          pedagogicalPurpose: '',
          mappedStages: [],
          omissionReason: `Unsupported learning layer: "${layer}".`,
        });
        continue;
      }

      // Look up governed resource
      const resource = _findLayerResource(layer, layerResources);
      if (resource) {
        decisions.push(_buildLayerDecision(layer, resource, null));
      } else {
        decisions.push(_buildLayerDecision(layer, null, `Requested layer "${layer}" has no active resource.`));
      }
    }
  } else {
    // 2. No layers requested — apply depth mode selection
    const layerCount = Math.min(maxLayers, CANONICAL_LEARNING_LAYERS.length);
    for (let i = 0; i < layerCount; i++) {
      const layer = CANONICAL_LEARNING_LAYERS[i];
      const resource = _findLayerResource(layer, layerResources);
      decisions.push(_buildLayerDecision(layer, resource, null));
      processedLayers.add(layer);
    }
  }

  return decisions;
}

// ---------------------------------------------------------------------------
// Build layer trace from decisions
// ---------------------------------------------------------------------------

export function buildLayerTrace(
  depthMode: DidacticLearningDepthMode,
  decisions: readonly DidacticLearningLayerDecision[],
): DidacticLearningLayerTrace {
  const selectedLayers: DidacticLearningLayer[] = [];
  const omittedLayers: DidacticLearningLayer[] = [];

  for (let i = 0; i < decisions.length; i++) {
    const d = decisions[i];
    if (d.status === 'selected') {
      selectedLayers.push(d.layer);
    } else {
      omittedLayers.push(d.layer);
    }
  }

  return {
    depthMode,
    layersSelected: selectedLayers.length,
    layersOmitted: omittedLayers.length,
    decisions,
    selectedLayers,
    omittedLayers,
  };
}

// ---------------------------------------------------------------------------
// Validation helpers (used by ValidationLayer)
// ---------------------------------------------------------------------------

export function validateLearningLayerResource(
  resource: DidacticLearningLayerResource,
): string[] {
  const errors: string[] = [];

  if (!resource.layer || !VALID_LEARNING_LAYERS.has(resource.layer)) {
    errors.push(`Invalid or missing layer: "${resource.layer}"`);
  }
  if (!resource.resourceId || resource.resourceId.trim() === '') {
    errors.push('Layer resource missing resourceId');
  }
  if (!resource.source || resource.source.trim() === '') {
    errors.push('Layer resource missing source');
  }
  if (!Array.isArray(resource.supportedStages) || resource.supportedStages.length === 0) {
    errors.push('Layer resource missing supportedStages');
  }
  if (!resource.pedagogicalPurpose || resource.pedagogicalPurpose.trim() === '') {
    errors.push('Layer resource missing pedagogicalPurpose');
  }
  if (!Array.isArray(resource.depthModeSupport) || resource.depthModeSupport.length === 0) {
    errors.push('Layer resource missing depthModeSupport');
  }
  if (!resource.lifecycle || !['active', 'deprecated', 'experimental'].includes(resource.lifecycle)) {
    errors.push(`Invalid lifecycle: "${resource.lifecycle}"`);
  }

  return errors;
}

export function validateLearningLayerDecision(
  decision: DidacticLearningLayerDecision,
): string[] {
  const errors: string[] = [];

  if (!decision.layer || !VALID_LEARNING_LAYERS.has(decision.layer)) {
    errors.push(`Invalid or missing layer in decision: "${decision.layer}"`);
  }

  if (decision.status === 'selected') {
    if (!decision.resourceId || decision.resourceId.trim() === '') {
      errors.push(`Selected layer "${decision.layer}" missing resourceId`);
    }
    if (!decision.source || decision.source.trim() === '') {
      errors.push(`Selected layer "${decision.layer}" missing source`);
    }
    if (!decision.pedagogicalPurpose || decision.pedagogicalPurpose.trim() === '') {
      errors.push(`Selected layer "${decision.layer}" missing pedagogicalPurpose`);
    }
  }

  if (decision.status === 'omitted') {
    if (!decision.omissionReason || decision.omissionReason.trim() === '') {
      errors.push(`Omitted layer "${decision.layer}" missing omissionReason`);
    }
  }

  return errors;
}

export function getCanonicalLearningLayers(): readonly DidacticLearningLayer[] {
  return CANONICAL_LEARNING_LAYERS;
}

export function getDefaultLayerStageMappings(): readonly DidacticLayerStageMapping[] {
  return DEFAULT_LAYER_STAGE_MAPPINGS;
}

export { VALID_LEARNING_LAYERS, VALID_DEPTH_MODES, DEPTH_MODE_LAYER_COUNT };
