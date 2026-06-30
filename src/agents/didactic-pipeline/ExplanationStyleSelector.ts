/**
 * NV-1300-D1-OPT-03 — Deterministic Explanation Style Selector
 *
 * Pure deterministic function that selects and attaches explanation
 * styles to lesson composition based on governed style resources.
 *
 * Rules:
 * - Select a style only when a governed style resource exists.
 * - If requested style exists, include it.
 * - If requested style is missing, mark omitted with explicit reason.
 * - If no style is requested, use deterministic default priority.
 * - Never select a style without source metadata.
 * - Never generate explanation content.
 * - Never infer learner preference.
 *
 * Default priority (when no styles requested):
 *   1. intuitive
 *   2. visual
 *   3. engineering_oriented
 *   4. mathematical
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 * Does not mutate style resources, curriculum, or input objects.
 */

import type {
  DidacticExplanationStyle,
  DidacticStyleResource,
  DidacticStyleDecision,
  DidacticStyleTrace,
  DidacticPipelineStageName,
  DidacticStyleInput,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Valid explanation styles (for validation)
// ---------------------------------------------------------------------------

const VALID_EXPLANATION_STYLES = new Set<string>([
  'intuitive',
  'visual',
  'mathematical',
  'engineering_oriented',
  'implementation_first',
  'research_oriented',
  'historical',
  'analogy_driven',
]);

// ---------------------------------------------------------------------------
// Default style priority (deterministic, fixed order)
// ---------------------------------------------------------------------------

const DEFAULT_STYLE_PRIORITY: readonly DidacticExplanationStyle[] = [
  'intuitive',
  'visual',
  'engineering_oriented',
  'mathematical',
];

// ---------------------------------------------------------------------------
// Stages that can receive style orchestration metadata
// ---------------------------------------------------------------------------

const STYLE_APPLICABLE_STAGES: readonly DidacticPipelineStageName[] = [
  'context',
  'guided_explanation',
  'visual_demonstration',
  'mathematical_foundation',
  'practical_example',
];

// ---------------------------------------------------------------------------
// Pure deterministic style resource lookup
// ---------------------------------------------------------------------------

function _findStyleResource(
  style: DidacticExplanationStyle,
  resources: readonly DidacticStyleResource[],
): DidacticStyleResource | null {
  for (let i = 0; i < resources.length; i++) {
    if (resources[i].style === style && resources[i].lifecycle === 'active') {
      return resources[i];
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Pure deterministic style decision builder
// ---------------------------------------------------------------------------

function _buildStyleDecision(
  style: DidacticExplanationStyle,
  resource: DidacticStyleResource | null,
  omissionReason: string | null,
): DidacticStyleDecision {
  if (resource) {
    return {
      style,
      status: 'selected',
      resourceId: resource.resourceId,
      source: resource.source,
      supportedStages: resource.supportedStages,
      pedagogicalPurpose: resource.pedagogicalPurpose,
      omissionReason: null,
    };
  }

  return {
    style,
    status: 'omitted',
    resourceId: null,
    source: '',
    supportedStages: [],
    pedagogicalPurpose: '',
    omissionReason: omissionReason || `No active style resource available for "${style}".`,
  };
}

// ---------------------------------------------------------------------------
// Core style selection function
// ---------------------------------------------------------------------------

export function selectExplanationStyles(
  styleInput: DidacticStyleInput | undefined,
  styleResources: readonly DidacticStyleResource[],
): DidacticStyleDecision[] {
  if (!styleResources || styleResources.length === 0) {
    return [];
  }

  const decisions: DidacticStyleDecision[] = [];
  const processedStyles = new Set<string>();

  // 1. Process requested styles first
  const requestedStyles = styleInput?.requestedStyles;
  if (Array.isArray(requestedStyles)) {
    for (let i = 0; i < requestedStyles.length; i++) {
      const style = requestedStyles[i];

      // Skip if already processed (deduplicate)
      if (processedStyles.has(style)) {
        continue;
      }
      processedStyles.add(style);

      // Validate style name
      if (!VALID_EXPLANATION_STYLES.has(style)) {
        decisions.push({
          style,
          status: 'omitted',
          resourceId: null,
          source: '',
          supportedStages: [],
          pedagogicalPurpose: '',
          omissionReason: `Unsupported explanation style: "${style}".`,
        });
        continue;
      }

      // Look up governed resource
      const resource = _findStyleResource(style, styleResources);
      if (resource) {
        decisions.push(_buildStyleDecision(style, resource, null));
      } else {
        decisions.push(_buildStyleDecision(style, null, `Requested style "${style}" has no active resource.`));
      }
    }
  }

  // 2. If no styles were requested, apply default priority
  if (processedStyles.size === 0) {
    for (let i = 0; i < DEFAULT_STYLE_PRIORITY.length; i++) {
      const style = DEFAULT_STYLE_PRIORITY[i];
      const resource = _findStyleResource(style, styleResources);
      if (resource) {
        decisions.push(_buildStyleDecision(style, resource, null));
        processedStyles.add(style);
        break; // Use only the first available from default priority
      }
    }
  }

  return decisions;
}

// ---------------------------------------------------------------------------
// Build style trace from decisions
// ---------------------------------------------------------------------------

export function buildStyleTrace(
  decisions: readonly DidacticStyleDecision[],
): DidacticStyleTrace {
  const selectedStyles: DidacticExplanationStyle[] = [];
  const omittedStyles: DidacticExplanationStyle[] = [];

  for (let i = 0; i < decisions.length; i++) {
    const d = decisions[i];
    if (d.status === 'selected') {
      selectedStyles.push(d.style);
    } else {
      omittedStyles.push(d.style);
    }
  }

  return {
    stylesSelected: selectedStyles.length,
    stylesOmitted: omittedStyles.length,
    decisions,
    selectedStyles,
    omittedStyles,
  };
}

// ---------------------------------------------------------------------------
// Validation helpers (used by ValidationLayer)
// ---------------------------------------------------------------------------

export function validateStyleResource(
  resource: DidacticStyleResource,
): string[] {
  const errors: string[] = [];

  if (!resource.style || !VALID_EXPLANATION_STYLES.has(resource.style)) {
    errors.push(`Invalid or missing style: "${resource.style}"`);
  }
  if (!resource.resourceId || resource.resourceId.trim() === '') {
    errors.push('Style resource missing resourceId');
  }
  if (!resource.source || resource.source.trim() === '') {
    errors.push('Style resource missing source');
  }
  if (!Array.isArray(resource.supportedStages) || resource.supportedStages.length === 0) {
    errors.push('Style resource missing supportedStages');
  }
  if (!resource.pedagogicalPurpose || resource.pedagogicalPurpose.trim() === '') {
    errors.push('Style resource missing pedagogicalPurpose');
  }
  if (!resource.lifecycle || !['active', 'deprecated', 'experimental'].includes(resource.lifecycle)) {
    errors.push(`Invalid lifecycle: "${resource.lifecycle}"`);
  }

  return errors;
}

export function validateStyleDecision(
  decision: DidacticStyleDecision,
): string[] {
  const errors: string[] = [];

  if (!decision.style || !VALID_EXPLANATION_STYLES.has(decision.style)) {
    errors.push(`Invalid or missing style in decision: "${decision.style}"`);
  }

  if (decision.status === 'selected') {
    if (!decision.resourceId || decision.resourceId.trim() === '') {
      errors.push(`Selected style "${decision.style}" missing resourceId`);
    }
    if (!decision.source || decision.source.trim() === '') {
      errors.push(`Selected style "${decision.style}" missing source`);
    }
    if (!decision.pedagogicalPurpose || decision.pedagogicalPurpose.trim() === '') {
      errors.push(`Selected style "${decision.style}" missing pedagogicalPurpose`);
    }
  }

  if (decision.status === 'omitted') {
    if (!decision.omissionReason || decision.omissionReason.trim() === '') {
      errors.push(`Omitted style "${decision.style}" missing omissionReason`);
    }
  }

  return errors;
}

export function getApplicableStages(): readonly DidacticPipelineStageName[] {
  return STYLE_APPLICABLE_STAGES;
}

export { VALID_EXPLANATION_STYLES, DEFAULT_STYLE_PRIORITY };
