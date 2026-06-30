/**
 * NV-1700-D6-OPT-02 — Narrative Style & Framing Orchestration Kernel
 *
 * Deterministic orchestration functions for narrative style metadata.
 * Produces narrative styles, frames, motivations, and style registries.
 *
 * This module never:
 * - Generates lesson prose
 * - Generates examples
 * - Generates analogies
 * - Makes unsupported historical claims
 * - Calls LLMs
 * - Calls external APIs
 * - Performs runtime personalization
 * - Rewrites knowledge
 * - Mutates curriculum
 * - Infers learner mastery
 * - Recommends styles for learners
 *
 * Narrative style metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  NarrativeProvenance,
  NarrativeGovernanceStatus,
  NarrativeStyleType,
  NarrativeFrameType,
  MotivationType,
  NarrativeTone,
  NarrativeStyleStatus,
  NarrativeDomain,
  NarrativeStyle,
  NarrativeFrame,
  NarrativeMotivation,
  NarrativeStyleDecision,
  NarrativeStyleTrace,
  NarrativeStyleRegistry,
  NarrativeStyleRegistryMetadata,
  NarrativeStyleInput,
  NarrativeUnitType,
  NarrativeMode,
  NarrativeStatus,
  NarrativeArtifactWithStyle,
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
// Narrative Style Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative style from provided parameters.
 * Pure function. No side effects.
 */
export function composeNarrativeStyle(params: {
  readonly styleId: string;
  readonly styleType: NarrativeStyleType;
  readonly preferredFrame: NarrativeFrameType;
  readonly motivationType: MotivationType;
  readonly tone: NarrativeTone;
  readonly domain: NarrativeDomain;
  readonly knowledgeArtifactId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly sequencePriority: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
}): NarrativeStyle {
  return {
    styleId: params.styleId,
    styleType: params.styleType,
    preferredFrame: params.preferredFrame,
    motivationType: params.motivationType,
    tone: params.tone,
    domain: params.domain,
    knowledgeArtifactId: params.knowledgeArtifactId,
    curriculumNodeId: params.curriculumNodeId,
    lessonId: params.lessonId,
    sequencePriority: params.sequencePriority,
    summary: params.summary,
    tags: [...params.tags],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Narrative Frame Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative frame from provided parameters.
 * Pure function. No side effects.
 */
export function composeNarrativeFrame(params: {
  readonly frameId: string;
  readonly frameType: NarrativeFrameType;
  readonly openingStrategy: string;
  readonly transitionStrategy: string;
  readonly closureStrategy: string;
  readonly supportedStyles: readonly NarrativeStyleType[];
  readonly provenance: NarrativeProvenance;
}): NarrativeFrame {
  return {
    frameId: params.frameId,
    frameType: params.frameType,
    openingStrategy: params.openingStrategy,
    transitionStrategy: params.transitionStrategy,
    closureStrategy: params.closureStrategy,
    supportedStyles: [...params.supportedStyles],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Narrative Motivation Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative motivation from provided parameters.
 * Pure function. No side effects.
 */
export function composeNarrativeMotivation(params: {
  readonly motivationId: string;
  readonly motivationType: MotivationType;
  readonly title: string;
  readonly description: string;
  readonly domain: NarrativeDomain;
  readonly knowledgeArtifactId: string;
  readonly provenance: NarrativeProvenance;
}): NarrativeMotivation {
  return {
    motivationId: params.motivationId,
    motivationType: params.motivationType,
    title: params.title,
    description: params.description,
    domain: params.domain,
    knowledgeArtifactId: params.knowledgeArtifactId,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Narrative Tone Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative tone metadata object.
 * Pure function. No side effects.
 */
export function composeNarrativeTone(params: {
  readonly toneId: string;
  readonly tone: NarrativeTone;
  readonly domain: NarrativeDomain;
  readonly description: string;
  readonly provenance: NarrativeProvenance;
}): { readonly toneId: string; readonly tone: NarrativeTone; readonly domain: NarrativeDomain; readonly description: string; readonly provenance: NarrativeProvenance } {
  return {
    toneId: params.toneId,
    tone: params.tone,
    domain: params.domain,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Narrative Style Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative style decision from validation results.
 * Pure function. No side effects.
 */
function _composeNarrativeStyleDecision(
  styleId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): NarrativeStyleDecision {
  return {
    decisionId: `_decision_${styleId}`,
    styleId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Narrative Style Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative style trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeNarrativeStyleTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly NarrativeStyleDecision[];
  readonly registryVersion: string;
  readonly pipelineVersion: string;
}): NarrativeStyleTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    pipelineVersion: params.pipelineVersion,
    compositionMetadata: {},
    deterministicMetadata: {},
    deterministic: true,
    generatedFrom: 'deterministic_narrative_style_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Style Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative artifact with applied style.
 * Pure function. No side effects.
 */
export function composeNarrativeArtifactWithStyle(params: {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
  readonly appliedStyle: NarrativeStyle;
  readonly appliedFrame: NarrativeFrame;
}): NarrativeArtifactWithStyle {
  return {
    narrativeId: params.narrativeId,
    title: params.title,
    unitType: params.unitType,
    narrativeMode: params.narrativeMode,
    domain: params.domain,
    status: params.status,
    canonicalKnowledgeId: params.canonicalKnowledgeId,
    curriculumNodeId: params.curriculumNodeId,
    lessonId: params.lessonId,
    laboratoryId: params.laboratoryId,
    sequenceOrder: params.sequenceOrder,
    summary: params.summary,
    tags: [...params.tags],
    provenance: params.provenance,
    appliedStyle: params.appliedStyle,
    appliedFrame: params.appliedFrame,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for narrative styles.
 * Sorts by styleId, then styleType, then preferredFrame, then sequencePriority.
 * Pure function. No side effects.
 */
function _compareNarrativeStyle(
  a: NarrativeStyle,
  b: NarrativeStyle,
): number {
  if (a.styleId < b.styleId) return -1;
  if (a.styleId > b.styleId) return 1;

  if (a.styleType < b.styleType) return -1;
  if (a.styleType > b.styleType) return 1;

  if (a.preferredFrame < b.preferredFrame) return -1;
  if (a.preferredFrame > b.preferredFrame) return 1;

  if (a.sequencePriority < b.sequencePriority) return -1;
  if (a.sequencePriority > b.sequencePriority) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Narrative Style Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative style registry from styles.
 * Pure function. No side effects.
 * Deterministic ordering: styleId → styleType → preferredFrame → sequencePriority.
 */
export function composeNarrativeStyleRegistry(
  styles: readonly NarrativeStyle[],
): NarrativeStyleRegistry {
  const sortedStyles = [...styles].sort(_compareNarrativeStyle);

  const domains = new Set(sortedStyles.map((s) => s.domain));
  const types = new Set(sortedStyles.map((s) => s.styleType));
  const frames = new Set(sortedStyles.map((s) => s.preferredFrame));

  const metadata: NarrativeStyleRegistryMetadata = {
    registryId: `_style_registry_${sortedStyles.length}`,
    styleCount: sortedStyles.length,
    domainCount: domains.size,
    typeCount: types.size,
    frameCount: frames.size,
  };

  return {
    registryId: metadata.registryId,
    styles: sortedStyles,
    metadata,
    trace: {
      traceId: `_style_trace_${sortedStyles.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      compositionMetadata: {},
      deterministicMetadata: {},
      deterministic: true,
      generatedFrom: 'deterministic_narrative_style_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_narrative_style_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Narrative Style Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative style registry from an input.
 * Pure function. No side effects.
 */
export function composeNarrativeStyleRegistryFromInput(
  input: NarrativeStyleInput,
): NarrativeStyleRegistry {
  return composeNarrativeStyleRegistry(input.styles);
}

// ---------------------------------------------------------------------------
// Narrative Style Orchestration (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete narrative style registry from an input.
 * Pure function. No side effects.
 */
export function composeNarrativeStyleOrchestration(
  input: NarrativeStyleInput,
): NarrativeStyleRegistry {
  const decisions = input.styles.map((style) => {
    const errors = _validateStyleForDecision(style);
    return _composeNarrativeStyleDecision(style.styleId, errors.length === 0, errors);
  });

  const registry = composeNarrativeStyleRegistry(input.styles);

  return {
    ...registry,
    trace: composeNarrativeStyleTrace({
      traceId: `_style_trace_${input.styles.length}`,
      decisions,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
    }),
  };
}

/**
 * Validates a narrative style for decision composition.
 * Pure function. No side effects.
 */
function _validateStyleForDecision(
  style: NarrativeStyle,
): readonly string[] {
  const errors: string[] = [];

  if (!style.styleId || style.styleId.trim() === '') {
    errors.push('STYLE_MISSING_STYLE_ID');
  }

  if (!style.summary || style.summary.trim() === '') {
    errors.push('STYLE_MISSING_SUMMARY');
  }

  if (!CANONICAL_NARRATIVE_STYLES.includes(style.styleType)) {
    errors.push('STYLE_INVALID_STYLE');
  }

  if (!CANONICAL_NARRATIVE_FRAMES.includes(style.preferredFrame)) {
    errors.push('STYLE_INVALID_FRAME');
  }

  if (!CANONICAL_MOTIVATION_TYPES.includes(style.motivationType)) {
    errors.push('STYLE_INVALID_MOTIVATION');
  }

  if (!CANONICAL_NARRATIVE_TONES.includes(style.tone)) {
    errors.push('STYLE_INVALID_TONE');
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(style.provenance.governanceStatus)) {
    errors.push('STYLE_INVALID_STATUS');
  }

  if (!style.provenance) {
    errors.push('STYLE_MISSING_PROVENANCE');
  }

  if (!style.knowledgeArtifactId || style.knowledgeArtifactId.trim() === '') {
    errors.push('STYLE_MISSING_ARTIFACT_REFERENCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported narrative style.
 */
export function isSupportedNarrativeStyle(
  style: string,
): style is NarrativeStyleType {
  return CANONICAL_NARRATIVE_STYLES.includes(style as NarrativeStyleType);
}

/**
 * Checks if a string is a supported narrative frame.
 */
export function isSupportedNarrativeFrame(
  frame: string,
): frame is NarrativeFrameType {
  return CANONICAL_NARRATIVE_FRAMES.includes(frame as NarrativeFrameType);
}

/**
 * Checks if a string is a supported motivation type.
 */
export function isSupportedMotivationType(
  motivation: string,
): motivation is MotivationType {
  return CANONICAL_MOTIVATION_TYPES.includes(motivation as MotivationType);
}

/**
 * Checks if a string is a supported narrative tone.
 */
export function isSupportedNarrativeTone(
  tone: string,
): tone is NarrativeTone {
  return CANONICAL_NARRATIVE_TONES.includes(tone as NarrativeTone);
}

/**
 * Checks if a string is a supported narrative style status.
 */
export function isSupportedNarrativeStyleStatus(
  status: string,
): status is NarrativeStyleStatus {
  return CANONICAL_NARRATIVE_STYLE_STATUS.includes(status as NarrativeStyleStatus);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical narrative styles.
 */
export function getCanonicalNarrativeStyles(): readonly NarrativeStyleType[] {
  return CANONICAL_NARRATIVE_STYLES;
}

/**
 * Returns the canonical narrative frames.
 */
export function getCanonicalNarrativeFrames(): readonly NarrativeFrameType[] {
  return CANONICAL_NARRATIVE_FRAMES;
}

/**
 * Returns the canonical motivation types.
 */
export function getCanonicalMotivationTypes(): readonly MotivationType[] {
  return CANONICAL_MOTIVATION_TYPES;
}

/**
 * Returns the canonical narrative tones.
 */
export function getCanonicalNarrativeTones(): readonly NarrativeTone[] {
  return CANONICAL_NARRATIVE_TONES;
}

/**
 * Returns the canonical narrative style statuses.
 */
export function getCanonicalNarrativeStyleStatuses(): readonly NarrativeStyleStatus[] {
  return CANONICAL_NARRATIVE_STYLE_STATUS;
}
