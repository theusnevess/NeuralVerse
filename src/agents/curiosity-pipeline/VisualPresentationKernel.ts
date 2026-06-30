/**
 * NV-2100-D9-OPT-10 — Visual Presentation Kernel
 *
 * Deterministic orchestration functions for visual presentation metadata.
 * Produces presentation profiles, accessibility metadata, reading flow metadata, emphasis metadata, traces, and registries.
 *
 * This module never:
 * - Generates UI
 * - Renders layouts
 * - Produces HTML
 * - Generates CSS
 * - Invokes frontend components
 * - Performs accessibility runtime adaptation
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Visual presentation metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  VisualPresentationProfile,
  AccessibilityMetadata,
  ReadingFlowMetadata,
  VisualEmphasisMetadata,
  PresentationRelationship,
  PresentationRegistry,
  PresentationRegistryMetadata,
  PresentationInput,
  VisualPresentationProvenance,
  VisualPresentationDecision,
  VisualPresentationTrace,
  CuriosityArtifactWithPresentation,
  VisualPresentationType,
  VisualHierarchy,
  AccessibilityLevel,
  ReadingFlow,
  VisualEmphasis,
  VisualPresentationStatus,
  CuriosityGovernance,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_VISUAL_PRESENTATION_TYPES,
  CANONICAL_VISUAL_HIERARCHY,
  CANONICAL_ACCESSIBILITY_LEVELS,
  CANONICAL_READING_FLOW,
  CANONICAL_VISUAL_EMPHASIS,
  CANONICAL_VISUAL_PRESENTATION_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Visual Presentation Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes visual presentation provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeVisualPresentationProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}): VisualPresentationProvenance {
  return {
    provider: params.provider,
    source: params.source,
    rationale: params.rationale,
    version: params.version,
  };
}

// ---------------------------------------------------------------------------
// Visual Presentation Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a visual presentation decision from validation results.
 * Pure function. No side effects.
 */
function _composeVisualPresentationDecision(
  profileId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): VisualPresentationDecision {
  return {
    decisionId: `_decision_${profileId}`,
    profileId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Visual Presentation Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a visual presentation trace from metadata.
 * Pure function. No side effects.
 */
export function composeVisualPresentationTrace(params: {
  readonly traceId: string;
}): VisualPresentationTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_visual_presentation_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Visual Presentation Profile Composition
// ---------------------------------------------------------------------------

/**
 * Composes a visual presentation profile from provided parameters.
 * Pure function. No side effects.
 */
export function composeVisualPresentationProfile(params: {
  readonly profileId: string;
  readonly title: string;
  readonly presentationType: VisualPresentationType;
  readonly visualHierarchy: VisualHierarchy;
  readonly accessibilityLevel: AccessibilityLevel;
  readonly readingFlow: ReadingFlow;
  readonly conceptIds: readonly string[];
  readonly status: VisualPresentationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: VisualPresentationProvenance;
  readonly trace: VisualPresentationTrace;
}): VisualPresentationProfile {
  return {
    profileId: params.profileId,
    title: params.title,
    presentationType: params.presentationType,
    visualHierarchy: params.visualHierarchy,
    accessibilityLevel: params.accessibilityLevel,
    readingFlow: params.readingFlow,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Accessibility Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes accessibility metadata from provided parameters.
 * Pure function. No side effects.
 */
export function composeAccessibilityMetadata(params: {
  readonly metadataId: string;
  readonly profileId: string;
  readonly accessibilityLevel: AccessibilityLevel;
  readonly screenReaderSupport: boolean;
  readonly keyboardNavigation: boolean;
  readonly voiceControl: boolean;
  readonly highContrast: boolean;
  readonly reducedMotion: boolean;
  readonly cognitiveSupport: boolean;
  readonly altText: string;
  readonly ariaLabel: string;
  readonly tabIndex: number;
}): AccessibilityMetadata {
  return {
    metadataId: params.metadataId,
    profileId: params.profileId,
    accessibilityLevel: params.accessibilityLevel,
    screenReaderSupport: params.screenReaderSupport,
    keyboardNavigation: params.keyboardNavigation,
    voiceControl: params.voiceControl,
    highContrast: params.highContrast,
    reducedMotion: params.reducedMotion,
    cognitiveSupport: params.cognitiveSupport,
    altText: params.altText,
    ariaLabel: params.ariaLabel,
    tabIndex: params.tabIndex,
  };
}

// ---------------------------------------------------------------------------
// Reading Flow Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes reading flow metadata from provided parameters.
 * Pure function. No side effects.
 */
export function composeReadingFlowMetadata(params: {
  readonly metadataId: string;
  readonly profileId: string;
  readonly readingFlow: ReadingFlow;
  readonly scannable: boolean;
  readonly progressiveDisclosure: boolean;
  readonly chunkSize: string;
  readonly readingOrder: number;
  readonly cognitiveLoad: string;
}): ReadingFlowMetadata {
  return {
    metadataId: params.metadataId,
    profileId: params.profileId,
    readingFlow: params.readingFlow,
    scannable: params.scannable,
    progressiveDisclosure: params.progressiveDisclosure,
    chunkSize: params.chunkSize,
    readingOrder: params.readingOrder,
    cognitiveLoad: params.cognitiveLoad,
  };
}

// ---------------------------------------------------------------------------
// Visual Emphasis Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes visual emphasis metadata from provided parameters.
 * Pure function. No side effects.
 */
export function composeVisualEmphasisMetadata(params: {
  readonly metadataId: string;
  readonly profileId: string;
  readonly emphasisType: VisualEmphasis;
  readonly intensity: string;
  readonly colorAccent: string;
  readonly iconReference: string;
  readonly animationStyle: string;
  readonly sizeVariation: string;
}): VisualEmphasisMetadata {
  return {
    metadataId: params.metadataId,
    profileId: params.profileId,
    emphasisType: params.emphasisType,
    intensity: params.intensity,
    colorAccent: params.colorAccent,
    iconReference: params.iconReference,
    animationStyle: params.animationStyle,
    sizeVariation: params.sizeVariation,
  };
}

// ---------------------------------------------------------------------------
// Presentation Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a presentation relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composePresentationRelationship(params: {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: VisualPresentationProvenance;
}): PresentationRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceProfileId: params.sourceProfileId,
    targetProfileId: params.targetProfileId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Profiles
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for visual presentation profiles.
 * Sorts by profileId, then presentationType, then title.
 * Pure function. No side effects.
 */
function _compareVisualPresentationProfile(
  a: VisualPresentationProfile,
  b: VisualPresentationProfile,
): number {
  if (a.profileId < b.profileId) return -1;
  if (a.profileId > b.profileId) return 1;

  if (a.presentationType < b.presentationType) return -1;
  if (a.presentationType > b.presentationType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Relationships
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for presentation relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _comparePresentationRelationship(
  a: PresentationRelationship,
  b: PresentationRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Presentation Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a presentation registry from profiles, accessibility, reading flows, emphasis, and relationships.
 * Pure function. No side effects.
 * Deterministic ordering: profileId → presentationType → title.
 */
export function composePresentationRegistry(
  profiles: readonly VisualPresentationProfile[],
  accessibility: readonly AccessibilityMetadata[],
  readingFlows: readonly ReadingFlowMetadata[],
  emphasis: readonly VisualEmphasisMetadata[],
  relationships: readonly PresentationRelationship[],
): PresentationRegistry {
  const sortedProfiles = [...profiles].sort(_compareVisualPresentationProfile);
  const sortedRelationships = [...relationships].sort(_comparePresentationRelationship);

  const metadata: PresentationRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}_${accessibility.length}_${readingFlows.length}_${emphasis.length}_${sortedRelationships.length}`,
    version: '1.0.0',
    profileCount: sortedProfiles.length,
    accessibilityCount: accessibility.length,
    readingFlowCount: readingFlows.length,
    emphasisCount: emphasis.length,
    relationshipCount: sortedRelationships.length,
  };

  return {
    registryId: metadata.registryId,
    profiles: sortedProfiles,
    accessibility,
    readingFlows,
    emphasis,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedProfiles.length}_${accessibility.length}_${readingFlows.length}_${emphasis.length}_${sortedRelationships.length}`,
      generatedFrom: 'deterministic_visual_presentation_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_visual_presentation_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Presentation Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a presentation registry from an input.
 * Pure function. No side effects.
 */
export function composePresentationRegistryFromInput(
  input: PresentationInput,
): PresentationRegistry {
  return composePresentationRegistry(input.profiles, input.accessibility, input.readingFlows, input.emphasis, input.relationships);
}

// ---------------------------------------------------------------------------
// Presentation Artifacts Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete presentation registry from an input.
 * Pure function. No side effects.
 */
export function composePresentationArtifacts(
  input: PresentationInput,
): PresentationRegistry {
  const registry = composePresentationRegistry(input.profiles, input.accessibility, input.readingFlows, input.emphasis, input.relationships);

  return {
    ...registry,
    trace: composeVisualPresentationTrace({
      traceId: `_trace_${input.profiles.length}_${input.accessibility.length}_${input.readingFlows.length}_${input.emphasis.length}_${input.relationships.length}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Presentation Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact with presentation from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifactWithPresentation(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly profiles: readonly VisualPresentationProfile[];
  readonly accessibility: readonly AccessibilityMetadata[];
  readonly readingFlows: readonly ReadingFlowMetadata[];
  readonly emphasis: readonly VisualEmphasisMetadata[];
  readonly relationships: readonly PresentationRelationship[];
  readonly provenance: VisualPresentationProvenance;
}): CuriosityArtifactWithPresentation {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    profiles: [...params.profiles],
    accessibility: [...params.accessibility],
    readingFlows: [...params.readingFlows],
    emphasis: [...params.emphasis],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported visual presentation type.
 */
export function isSupportedVisualPresentationType(
  presentationType: string,
): presentationType is VisualPresentationType {
  return CANONICAL_VISUAL_PRESENTATION_TYPES.includes(presentationType as VisualPresentationType);
}

/**
 * Checks if a string is a supported visual hierarchy.
 */
export function isSupportedVisualHierarchy(
  hierarchy: string,
): hierarchy is VisualHierarchy {
  return CANONICAL_VISUAL_HIERARCHY.includes(hierarchy as VisualHierarchy);
}

/**
 * Checks if a string is a supported accessibility level.
 */
export function isSupportedAccessibilityLevel(
  level: string,
): level is AccessibilityLevel {
  return CANONICAL_ACCESSIBILITY_LEVELS.includes(level as AccessibilityLevel);
}

/**
 * Checks if a string is a supported reading flow.
 */
export function isSupportedReadingFlow(
  flow: string,
): flow is ReadingFlow {
  return CANONICAL_READING_FLOW.includes(flow as ReadingFlow);
}

/**
 * Checks if a string is a supported visual emphasis.
 */
export function isSupportedVisualEmphasis(
  emphasis: string,
): emphasis is VisualEmphasis {
  return CANONICAL_VISUAL_EMPHASIS.includes(emphasis as VisualEmphasis);
}

/**
 * Checks if a string is a supported visual presentation status.
 */
export function isSupportedPresentationStatus(
  status: string,
): status is VisualPresentationStatus {
  return CANONICAL_VISUAL_PRESENTATION_STATUS.includes(status as VisualPresentationStatus);
}

/**
 * Checks if a string is a supported visual presentation governance.
 */
export function isSupportedPresentationGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical visual presentation types.
 */
export function getCanonicalVisualPresentationTypes(): readonly VisualPresentationType[] {
  return [...CANONICAL_VISUAL_PRESENTATION_TYPES];
}

/**
 * Returns the canonical visual hierarchy values.
 */
export function getCanonicalVisualHierarchy(): readonly VisualHierarchy[] {
  return [...CANONICAL_VISUAL_HIERARCHY];
}

/**
 * Returns the canonical accessibility levels.
 */
export function getCanonicalAccessibilityLevels(): readonly AccessibilityLevel[] {
  return [...CANONICAL_ACCESSIBILITY_LEVELS];
}

/**
 * Returns the canonical reading flows.
 */
export function getCanonicalReadingFlows(): readonly ReadingFlow[] {
  return [...CANONICAL_READING_FLOW];
}

/**
 * Returns the canonical visual emphasis values.
 */
export function getCanonicalVisualEmphasis(): readonly VisualEmphasis[] {
  return [...CANONICAL_VISUAL_EMPHASIS];
}

/**
 * Returns the canonical visual presentation statuses.
 */
export function getCanonicalPresentationStatuses(): readonly VisualPresentationStatus[] {
  return [...CANONICAL_VISUAL_PRESENTATION_STATUS];
}
