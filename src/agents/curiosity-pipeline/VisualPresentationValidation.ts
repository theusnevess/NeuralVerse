/**
 * NV-2100-D9-OPT-10 — Visual Presentation Validation Layer
 *
 * Deterministic validation for visual presentation metadata.
 * Returns structured errors, never exceptions for expected validation failures.
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
  PresentationInput,
  VisualPresentationTrace,
  CuriosityArtifactWithPresentation,
  PresentationValidationError,
  PresentationRegistryValidationResult,
  PresentationInputValidationResult,
  PresentationTraceValidationResult,
  CuriosityArtifactWithPresentationValidationResult,
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
// Validation Error Codes
// ---------------------------------------------------------------------------

export const PRESENTATION_VALIDATION_CODES = {
  PRESENTATION_DUPLICATE_ID: 'PRESENTATION_DUPLICATE_ID',
  PRESENTATION_DUPLICATE_TITLE: 'PRESENTATION_DUPLICATE_TITLE',
  PRESENTATION_INVALID_TYPE: 'PRESENTATION_INVALID_TYPE',
  PRESENTATION_INVALID_HIERARCHY: 'PRESENTATION_INVALID_HIERARCHY',
  PRESENTATION_INVALID_ACCESSIBILITY: 'PRESENTATION_INVALID_ACCESSIBILITY',
  PRESENTATION_INVALID_READING_FLOW: 'PRESENTATION_INVALID_READING_FLOW',
  PRESENTATION_INVALID_EMPHASIS: 'PRESENTATION_INVALID_EMPHASIS',
  PRESENTATION_INVALID_STATUS: 'PRESENTATION_INVALID_STATUS',
  PRESENTATION_INVALID_GOVERNANCE: 'PRESENTATION_INVALID_GOVERNANCE',
  PRESENTATION_MISSING_PROVENANCE: 'PRESENTATION_MISSING_PROVENANCE',
  PRESENTATION_MISSING_PROVIDER: 'PRESENTATION_MISSING_PROVIDER',
  PRESENTATION_MISSING_RATIONALE: 'PRESENTATION_MISSING_RATIONALE',
  PRESENTATION_MISSING_CURIOSITY_REFERENCE: 'PRESENTATION_MISSING_CURIOSITY_REFERENCE',
  PRESENTATION_MISSING_PROFILE_ID: 'PRESENTATION_MISSING_PROFILE_ID',
  PRESENTATION_MISSING_TITLE: 'PRESENTATION_MISSING_TITLE',
  PRESENTATION_MISSING_ACCESSIBILITY: 'PRESENTATION_MISSING_ACCESSIBILITY',
  PRESENTATION_SELF_RELATIONSHIP: 'PRESENTATION_SELF_RELATIONSHIP',
  PRESENTATION_EMPTY_REGISTRY: 'PRESENTATION_EMPTY_REGISTRY',
  PRESENTATION_INVALID_TRACE: 'PRESENTATION_INVALID_TRACE',
  PRESENTATION_REGISTRY_INCONSISTENCY: 'PRESENTATION_REGISTRY_INCONSISTENCY',
  PRESENTATION_INVALID_CONFIGURATION: 'PRESENTATION_INVALID_CONFIGURATION',
  PRESENTATION_INVALID_RELATIONSHIP: 'PRESENTATION_INVALID_RELATIONSHIP',
  PRESENTATION_MISSING_GOVERNANCE: 'PRESENTATION_MISSING_GOVERNANCE',
  PRESENTATION_UNSUPPORTED_METADATA: 'PRESENTATION_UNSUPPORTED_METADATA',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single visual presentation profile against canonical invariants.
 * Pure function. No side effects.
 */
export function validateVisualPresentationProfile(
  profile: VisualPresentationProfile,
): readonly PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  if (!profile.profileId || profile.profileId.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_PROFILE_ID,
      message: 'Visual presentation profile is missing a profile ID.',
      field: 'profileId',
      profileId: profile.profileId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_TITLE,
      message: 'Visual presentation profile is missing a title.',
      field: 'title',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_VISUAL_PRESENTATION_TYPES.includes(profile.presentationType)) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_TYPE,
      message: `Visual presentation profile has unsupported presentation type: "${profile.presentationType}".`,
      field: 'presentationType',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_VISUAL_HIERARCHY.includes(profile.visualHierarchy)) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_HIERARCHY,
      message: `Visual presentation profile has unsupported visual hierarchy: "${profile.visualHierarchy}".`,
      field: 'visualHierarchy',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_ACCESSIBILITY_LEVELS.includes(profile.accessibilityLevel)) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_ACCESSIBILITY,
      message: `Visual presentation profile has unsupported accessibility level: "${profile.accessibilityLevel}".`,
      field: 'accessibilityLevel',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_READING_FLOW.includes(profile.readingFlow)) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_READING_FLOW,
      message: `Visual presentation profile has unsupported reading flow: "${profile.readingFlow}".`,
      field: 'readingFlow',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_VISUAL_PRESENTATION_STATUS.includes(profile.status)) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_STATUS,
      message: `Visual presentation profile has unsupported status: "${profile.status}".`,
      field: 'status',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_GOVERNANCE,
      message: `Visual presentation profile has invalid governance: "${profile.governance}".`,
      field: 'governance',
      profileId: profile.profileId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_PROVENANCE,
      message: 'Visual presentation profile is missing provenance.',
      field: 'provenance',
      profileId: profile.profileId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_PROVIDER,
        message: 'Visual presentation provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: profile.profileId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_RATIONALE,
        message: 'Visual presentation provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: profile.profileId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Accessibility Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates accessibility metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateAccessibilityMetadata(
  metadata: AccessibilityMetadata,
): readonly PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  if (!metadata.metadataId || metadata.metadataId.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_ACCESSIBILITY,
      message: 'Accessibility metadata is missing a metadata ID.',
      field: 'metadataId',
    });
  }

  if (!metadata.profileId || metadata.profileId.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Accessibility metadata is missing a profile ID.',
      field: 'profileId',
    });
  }

  if (!CANONICAL_ACCESSIBILITY_LEVELS.includes(metadata.accessibilityLevel)) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_ACCESSIBILITY,
      message: `Accessibility metadata has unsupported accessibility level: "${metadata.accessibilityLevel}".`,
      field: 'accessibilityLevel',
    });
  }

  if (!metadata.altText || metadata.altText.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_CONFIGURATION,
      message: 'Accessibility metadata is missing alt text.',
      field: 'altText',
    });
  }

  if (!metadata.ariaLabel || metadata.ariaLabel.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_CONFIGURATION,
      message: 'Accessibility metadata is missing ARIA label.',
      field: 'ariaLabel',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Reading Flow Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates reading flow metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateReadingFlowMetadata(
  metadata: ReadingFlowMetadata,
): readonly PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  if (!metadata.metadataId || metadata.metadataId.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_ACCESSIBILITY,
      message: 'Reading flow metadata is missing a metadata ID.',
      field: 'metadataId',
    });
  }

  if (!metadata.profileId || metadata.profileId.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Reading flow metadata is missing a profile ID.',
      field: 'profileId',
    });
  }

  if (!CANONICAL_READING_FLOW.includes(metadata.readingFlow)) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_READING_FLOW,
      message: `Reading flow metadata has unsupported reading flow: "${metadata.readingFlow}".`,
      field: 'readingFlow',
    });
  }

  if (!metadata.chunkSize || metadata.chunkSize.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_CONFIGURATION,
      message: 'Reading flow metadata is missing chunk size.',
      field: 'chunkSize',
    });
  }

  if (!metadata.cognitiveLoad || metadata.cognitiveLoad.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_CONFIGURATION,
      message: 'Reading flow metadata is missing cognitive load.',
      field: 'cognitiveLoad',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Visual Emphasis Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates visual emphasis metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateVisualEmphasisMetadata(
  metadata: VisualEmphasisMetadata,
): readonly PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  if (!metadata.metadataId || metadata.metadataId.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_ACCESSIBILITY,
      message: 'Visual emphasis metadata is missing a metadata ID.',
      field: 'metadataId',
    });
  }

  if (!metadata.profileId || metadata.profileId.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Visual emphasis metadata is missing a profile ID.',
      field: 'profileId',
    });
  }

  if (!CANONICAL_VISUAL_EMPHASIS.includes(metadata.emphasisType)) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_EMPHASIS,
      message: `Visual emphasis metadata has unsupported emphasis type: "${metadata.emphasisType}".`,
      field: 'emphasisType',
    });
  }

  if (!metadata.intensity || metadata.intensity.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_CONFIGURATION,
      message: 'Visual emphasis metadata is missing intensity.',
      field: 'intensity',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Presentation Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a presentation relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validatePresentationRelationship(
  relationship: PresentationRelationship,
): readonly PresentationValidationError[] {
  const errors: PresentationValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Presentation relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceProfileId || relationship.sourceProfileId.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Presentation relationship is missing a source profile ID.',
      field: 'sourceProfileId',
    });
  }

  if (!relationship.targetProfileId || relationship.targetProfileId.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Presentation relationship is missing a target profile ID.',
      field: 'targetProfileId',
    });
  }

  if (relationship.sourceProfileId === relationship.targetProfileId) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_SELF_RELATIONSHIP,
      message: 'Presentation relationship cannot be a self-relationship.',
      field: 'targetProfileId',
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_PROVENANCE,
      message: 'Presentation relationship is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!relationship.provenance.provider || relationship.provenance.provider.trim() === '') {
      errors.push({
        code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_PROVIDER,
        message: 'Presentation relationship provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_RATIONALE,
        message: 'Presentation relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Presentation Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a presentation registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validatePresentationRegistry(
  registry: PresentationRegistry,
): PresentationRegistryValidationResult {
  const errors: PresentationValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate profile IDs
  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.profileId)) {
      errors.push({
        code: PRESENTATION_VALIDATION_CODES.PRESENTATION_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.profileId}".`,
        profileId: profile.profileId,
      });
    }
    seenIds.add(profile.profileId);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: PRESENTATION_VALIDATION_CODES.PRESENTATION_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        profileId: profile.profileId,
      });
    }
    seenTitles.add(profile.title);
  }

  // Validate each profile
  for (const profile of registry.profiles) {
    errors.push(...validateVisualPresentationProfile(profile));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validatePresentationRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'presentation_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Presentation Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates presentation input against canonical invariants.
 * Pure function. No side effects.
 */
export function validatePresentationInput(
  input: PresentationInput,
): PresentationInputValidationResult {
  const errors: PresentationValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateVisualPresentationProfile(profile));
    }
  }

  for (const relationship of input.relationships) {
    errors.push(...validatePresentationRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'presentation_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Presentation Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a presentation trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validatePresentationTrace(
  trace: VisualPresentationTrace,
): PresentationTraceValidationResult {
  const errors: PresentationValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_TRACE,
      message: 'Presentation trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_TRACE,
      message: 'Presentation trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_TRACE,
      message: 'Presentation trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_INVALID_TRACE,
      message: 'Presentation trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'presentation_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Presentation Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity artifact with presentation against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityArtifactWithPresentation(
  artifact: CuriosityArtifactWithPresentation,
): CuriosityArtifactWithPresentationValidationResult {
  const errors: PresentationValidationError[] = [];

  if (!artifact.curiosityId || artifact.curiosityId.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity artifact is missing a curiosity ID.',
      field: 'curiosityId',
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_TITLE,
      message: 'Curiosity artifact is missing a title.',
      field: 'title',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_EMPTY_REGISTRY,
      message: 'Curiosity artifact has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateVisualPresentationProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_PROVENANCE,
      message: 'Curiosity artifact is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_PROVIDER,
        message: 'Curiosity artifact provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: PRESENTATION_VALIDATION_CODES.PRESENTATION_MISSING_RATIONALE,
        message: 'Curiosity artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_artifact_with_presentation_composition',
  };
}
