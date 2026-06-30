/**
 * NV-1700-D6-OPT-02 — Narrative Style Validation Layer
 *
 * Deterministic validation for narrative style metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  NarrativeStyle,
  NarrativeFrame,
  NarrativeMotivation,
  NarrativeStyleRegistry,
  NarrativeStyleTrace,
  NarrativeStyleInput,
  NarrativeArtifactWithStyle,
  NarrativeStyleValidationError,
  NarrativeStyleValidationResult,
  NarrativeStyleUnitValidationResult,
  NarrativeFrameValidationResult,
  NarrativeMotivationValidationResult,
  NarrativeStyleRegistryValidationResult,
  NarrativeStyleTraceValidationResult,
  NarrativeArtifactWithStyleValidationResult,
  NarrativeStyleInputValidationResult,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_NARRATIVE_STYLES,
  CANONICAL_NARRATIVE_FRAMES,
  CANONICAL_MOTIVATION_TYPES,
  CANONICAL_NARRATIVE_TONES,
  CANONICAL_NARRATIVE_STYLE_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
  CANONICAL_NARRATIVE_DOMAINS,
} from './NarrativeAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const NARRATIVE_STYLE_VALIDATION_CODES = {
  STYLE_DUPLICATE_ID: 'STYLE_DUPLICATE_ID',
  STYLE_DUPLICATE_FRAME: 'STYLE_DUPLICATE_FRAME',
  STYLE_INVALID_STYLE: 'STYLE_INVALID_STYLE',
  STYLE_INVALID_FRAME: 'STYLE_INVALID_FRAME',
  STYLE_INVALID_TONE: 'STYLE_INVALID_TONE',
  STYLE_INVALID_MOTIVATION: 'STYLE_INVALID_MOTIVATION',
  STYLE_INVALID_STATUS: 'STYLE_INVALID_STATUS',
  STYLE_MISSING_PROVENANCE: 'STYLE_MISSING_PROVENANCE',
  STYLE_MISSING_SOURCE: 'STYLE_MISSING_SOURCE',
  STYLE_MISSING_RATIONALE: 'STYLE_MISSING_RATIONALE',
  STYLE_MISSING_PROVIDED_BY: 'STYLE_MISSING_PROVIDED_BY',
  STYLE_MISSING_ARTIFACT_REFERENCE: 'STYLE_MISSING_ARTIFACT_REFERENCE',
  STYLE_EMPTY_REGISTRY: 'STYLE_EMPTY_REGISTRY',
  STYLE_INVALID_TRACE: 'STYLE_INVALID_TRACE',
  STYLE_TRACE_RANDOM_USED: 'STYLE_TRACE_RANDOM_USED',
  STYLE_TRACE_TIME_DEPENDENCY: 'STYLE_TRACE_TIME_DEPENDENCY',
  STYLE_TRACE_MUTATED: 'STYLE_TRACE_MUTATED',
  STYLE_MISSING_STYLE_ID: 'STYLE_MISSING_STYLE_ID',
  STYLE_MISSING_SUMMARY: 'STYLE_MISSING_SUMMARY',
  STYLE_MISSING_FRAME_ID: 'STYLE_MISSING_FRAME_ID',
  STYLE_MISSING_OPENING_STRATEGY: 'STYLE_MISSING_OPENING_STRATEGY',
  STYLE_MISSING_TRANSITION_STRATEGY: 'STYLE_MISSING_TRANSITION_STRATEGY',
  STYLE_MISSING_CLOSURE_STRATEGY: 'STYLE_MISSING_CLOSURE_STRATEGY',
  STYLE_MISSING_MOTIVATION_ID: 'STYLE_MISSING_MOTIVATION_ID',
  STYLE_MISSING_MOTIVATION_TITLE: 'STYLE_MISSING_MOTIVATION_TITLE',
  STYLE_INVALID_DOMAIN: 'STYLE_INVALID_DOMAIN',
} as const;

// ---------------------------------------------------------------------------
// Single Narrative Style Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single narrative style against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeStyle(
  style: NarrativeStyle,
): readonly NarrativeStyleValidationError[] {
  const errors: NarrativeStyleValidationError[] = [];

  if (!style.styleId || style.styleId.trim() === '') {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_STYLE_ID,
      message: 'Narrative style is missing a style ID.',
      field: 'styleId',
      styleId: style.styleId,
    });
  }

  if (!style.summary || style.summary.trim() === '') {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_SUMMARY,
      message: 'Narrative style is missing a summary.',
      field: 'summary',
      styleId: style.styleId,
    });
  }

  if (!CANONICAL_NARRATIVE_STYLES.includes(style.styleType)) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_STYLE,
      message: `Narrative style has unsupported type: "${style.styleType}".`,
      field: 'styleType',
      styleId: style.styleId,
    });
  }

  if (!CANONICAL_NARRATIVE_FRAMES.includes(style.preferredFrame)) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_FRAME,
      message: `Narrative style has unsupported frame: "${style.preferredFrame}".`,
      field: 'preferredFrame',
      styleId: style.styleId,
    });
  }

  if (!CANONICAL_MOTIVATION_TYPES.includes(style.motivationType)) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_MOTIVATION,
      message: `Narrative style has unsupported motivation: "${style.motivationType}".`,
      field: 'motivationType',
      styleId: style.styleId,
    });
  }

  if (!CANONICAL_NARRATIVE_TONES.includes(style.tone)) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_TONE,
      message: `Narrative style has unsupported tone: "${style.tone}".`,
      field: 'tone',
      styleId: style.styleId,
    });
  }

  if (!CANONICAL_NARRATIVE_DOMAINS.includes(style.domain)) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_DOMAIN,
      message: `Narrative style has unsupported domain: "${style.domain}".`,
      field: 'domain',
      styleId: style.styleId,
    });
  }

  if (!style.provenance) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_PROVENANCE,
      message: 'Narrative style is missing provenance.',
      field: 'provenance',
      styleId: style.styleId,
    });
  } else {
    if (!style.provenance.source || style.provenance.source.trim() === '') {
      errors.push({
        code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_SOURCE,
        message: 'Narrative style provenance is missing a source.',
        field: 'provenance.source',
        styleId: style.styleId,
      });
    }

    if (!style.provenance.rationale || style.provenance.rationale.trim() === '') {
      errors.push({
        code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_RATIONALE,
        message: 'Narrative style provenance is missing a rationale.',
        field: 'provenance.rationale',
        styleId: style.styleId,
      });
    }

    if (!style.provenance.providedBy || style.provenance.providedBy.trim() === '') {
      errors.push({
        code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_PROVIDED_BY,
        message: 'Narrative style provenance is missing providedBy.',
        field: 'provenance.providedBy',
        styleId: style.styleId,
      });
    }

    if (!CANONICAL_GOVERNANCE_STATUSES.includes(style.provenance.governanceStatus)) {
      errors.push({
        code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_STATUS,
        message: `Narrative style provenance has invalid governance status: "${style.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        styleId: style.styleId,
      });
    }
  }

  if (!style.knowledgeArtifactId || style.knowledgeArtifactId.trim() === '') {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_ARTIFACT_REFERENCE,
      message: 'Narrative style is missing a knowledge artifact reference.',
      field: 'knowledgeArtifactId',
      styleId: style.styleId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Narrative Frame Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single narrative frame against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeFrame(
  frame: NarrativeFrame,
): readonly NarrativeStyleValidationError[] {
  const errors: NarrativeStyleValidationError[] = [];

  if (!frame.frameId || frame.frameId.trim() === '') {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_FRAME_ID,
      message: 'Narrative frame is missing a frame ID.',
      field: 'frameId',
    });
  }

  if (!CANONICAL_NARRATIVE_FRAMES.includes(frame.frameType)) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_FRAME,
      message: `Narrative frame has unsupported type: "${frame.frameType}".`,
      field: 'frameType',
    });
  }

  if (!frame.openingStrategy || frame.openingStrategy.trim() === '') {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_OPENING_STRATEGY,
      message: 'Narrative frame is missing an opening strategy.',
      field: 'openingStrategy',
    });
  }

  if (!frame.transitionStrategy || frame.transitionStrategy.trim() === '') {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_TRANSITION_STRATEGY,
      message: 'Narrative frame is missing a transition strategy.',
      field: 'transitionStrategy',
    });
  }

  if (!frame.closureStrategy || frame.closureStrategy.trim() === '') {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_CLOSURE_STRATEGY,
      message: 'Narrative frame is missing a closure strategy.',
      field: 'closureStrategy',
    });
  }

  if (!frame.provenance) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_PROVENANCE,
      message: 'Narrative frame is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!frame.provenance.source || frame.provenance.source.trim() === '') {
      errors.push({
        code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_SOURCE,
        message: 'Narrative frame provenance is missing a source.',
        field: 'provenance.source',
      });
    }

    if (!frame.provenance.rationale || frame.provenance.rationale.trim() === '') {
      errors.push({
        code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_RATIONALE,
        message: 'Narrative frame provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }

    if (!frame.provenance.providedBy || frame.provenance.providedBy.trim() === '') {
      errors.push({
        code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_PROVIDED_BY,
        message: 'Narrative frame provenance is missing providedBy.',
        field: 'provenance.providedBy',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Narrative Motivation Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single narrative motivation against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeMotivation(
  motivation: NarrativeMotivation,
): readonly NarrativeStyleValidationError[] {
  const errors: NarrativeStyleValidationError[] = [];

  if (!motivation.motivationId || motivation.motivationId.trim() === '') {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_MOTIVATION_ID,
      message: 'Narrative motivation is missing a motivation ID.',
      field: 'motivationId',
    });
  }

  if (!CANONICAL_MOTIVATION_TYPES.includes(motivation.motivationType)) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_MOTIVATION,
      message: `Narrative motivation has unsupported type: "${motivation.motivationType}".`,
      field: 'motivationType',
    });
  }

  if (!motivation.title || motivation.title.trim() === '') {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_MOTIVATION_TITLE,
      message: 'Narrative motivation is missing a title.',
      field: 'title',
    });
  }

  if (!CANONICAL_NARRATIVE_DOMAINS.includes(motivation.domain)) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_DOMAIN,
      message: `Narrative motivation has unsupported domain: "${motivation.domain}".`,
      field: 'domain',
    });
  }

  if (!motivation.provenance) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_PROVENANCE,
      message: 'Narrative motivation is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!motivation.provenance.source || motivation.provenance.source.trim() === '') {
      errors.push({
        code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_SOURCE,
        message: 'Narrative motivation provenance is missing a source.',
        field: 'provenance.source',
      });
    }

    if (!motivation.provenance.rationale || motivation.provenance.rationale.trim() === '') {
      errors.push({
        code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_RATIONALE,
        message: 'Narrative motivation provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }

    if (!motivation.provenance.providedBy || motivation.provenance.providedBy.trim() === '') {
      errors.push({
        code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_PROVIDED_BY,
        message: 'Narrative motivation provenance is missing providedBy.',
        field: 'provenance.providedBy',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Narrative Style Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a narrative style registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeRegistry(
  registry: NarrativeStyleRegistry,
): NarrativeStyleRegistryValidationResult {
  const errors: NarrativeStyleValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_EMPTY_REGISTRY,
      message: 'Style registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.styles || registry.styles.length === 0) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_EMPTY_REGISTRY,
      message: 'Style registry has no styles.',
      field: 'styles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_TRACE,
      message: 'Style registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_TRACE_RANDOM_USED,
      message: 'Style registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_TRACE_TIME_DEPENDENCY,
      message: 'Style registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate style IDs
  const seenIds = new Set<string>();
  for (const style of registry.styles) {
    if (seenIds.has(style.styleId)) {
      errors.push({
        code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_DUPLICATE_ID,
        message: `Duplicate style ID: "${style.styleId}".`,
        styleId: style.styleId,
      });
    }
    seenIds.add(style.styleId);
  }

  // Validate each style
  for (const style of registry.styles) {
    errors.push(...validateNarrativeStyle(style));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'narrative_style_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Narrative Style Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a narrative style trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeStyleTrace(
  trace: NarrativeStyleTrace,
): NarrativeStyleTraceValidationResult {
  const errors: NarrativeStyleValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_TRACE,
      message: 'Narrative style trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_TRACE,
      message: 'Narrative style trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_TRACE_RANDOM_USED,
      message: 'Narrative style trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_TRACE_TIME_DEPENDENCY,
      message: 'Narrative style trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'narrative_style_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Style Validation
// ---------------------------------------------------------------------------

/**
 * Validates a narrative artifact with style against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeArtifactWithStyle(
  artifact: NarrativeArtifactWithStyle,
): NarrativeArtifactWithStyleValidationResult {
  const errors: NarrativeStyleValidationError[] = [];

  if (!artifact.narrativeId || artifact.narrativeId.trim() === '') {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_STYLE_ID,
      message: 'Narrative artifact with style is missing a narrative ID.',
      field: 'narrativeId',
    });
  }

  if (!artifact.appliedStyle) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_PROVENANCE,
      message: 'Narrative artifact with style is missing appliedStyle.',
      field: 'appliedStyle',
    });
  } else {
    errors.push(...validateNarrativeStyle(artifact.appliedStyle).map((e) => ({
      ...e,
      styleId: artifact.narrativeId,
    })));
  }

  if (!artifact.appliedFrame) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_PROVENANCE,
      message: 'Narrative artifact with style is missing appliedFrame.',
      field: 'appliedFrame',
    });
  } else {
    errors.push(...validateNarrativeFrame(artifact.appliedFrame).map((e) => ({
      ...e,
      styleId: artifact.narrativeId,
    })));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'narrative_artifact_with_style_composition',
  };
}

// ---------------------------------------------------------------------------
// Narrative Style Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates narrative style input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeStyleInput(
  input: NarrativeStyleInput,
): NarrativeStyleInputValidationResult {
  const errors: NarrativeStyleValidationError[] = [];

  if (!input.styles || input.styles.length === 0) {
    errors.push({
      code: NARRATIVE_STYLE_VALIDATION_CODES.STYLE_EMPTY_REGISTRY,
      message: 'Input has no styles.',
      field: 'styles',
    });
  } else {
    for (const style of input.styles) {
      errors.push(...validateNarrativeStyle(style));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'narrative_style_input_composition',
  };
}
