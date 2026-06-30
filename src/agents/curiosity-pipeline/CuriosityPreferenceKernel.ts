/**
 * NV-2100-D9-OPT-11 — Curiosity Preference Kernel
 *
 * Deterministic orchestration functions for user preference metadata.
 * Produces preference profiles, tone control metadata, placement metadata, visibility metadata, traces, and registries.
 *
 * This module never:
 * - Personalizes content
 * - Performs runtime adaptation
 * - Decides where curiosity is displayed
 * - Infers user preferences
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * User preference metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CuriosityPreferenceProfile,
  ToneControlMetadata,
  PlacementMetadata,
  VisibilityMetadata,
  PreferenceRelationship,
  PreferenceRegistry,
  PreferenceRegistryMetadata,
  PreferenceInput,
  CuriosityPreferenceProvenance,
  CuriosityPreferenceDecision,
  CuriosityPreferenceTrace,
  CuriosityArtifactWithPreferences,
  UserPreferenceType,
  ToneControlLevel,
  PlacementRule,
  VisibilityLevel,
  PresentationEligibility,
  PreferenceStatus,
  CuriosityGovernance,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_USER_PREFERENCE_TYPES,
  CANONICAL_TONE_CONTROL_LEVELS,
  CANONICAL_PLACEMENT_RULES,
  CANONICAL_VISIBILITY_LEVELS,
  CANONICAL_PRESENTATION_ELIGIBILITY,
  CANONICAL_PREFERENCE_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Curiosity Preference Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes curiosity preference provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityPreferenceProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}): CuriosityPreferenceProvenance {
  return {
    provider: params.provider,
    source: params.source,
    rationale: params.rationale,
    version: params.version,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Preference Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity preference decision from validation results.
 * Pure function. No side effects.
 */
function _composeCuriosityPreferenceDecision(
  profileId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): CuriosityPreferenceDecision {
  return {
    decisionId: `_decision_${profileId}`,
    profileId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Preference Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity preference trace from metadata.
 * Pure function. No side effects.
 */
export function composeCuriosityPreferenceTrace(params: {
  readonly traceId: string;
}): CuriosityPreferenceTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_curiosity_preference_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Preference Profile Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity preference profile from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityPreferenceProfile(params: {
  readonly profileId: string;
  readonly title: string;
  readonly preferenceType: UserPreferenceType;
  readonly toneControlLevel: ToneControlLevel;
  readonly placementRule: PlacementRule;
  readonly visibilityLevel: VisibilityLevel;
  readonly presentationEligibility: PresentationEligibility;
  readonly conceptIds: readonly string[];
  readonly status: PreferenceStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityPreferenceProvenance;
  readonly trace: CuriosityPreferenceTrace;
}): CuriosityPreferenceProfile {
  return {
    profileId: params.profileId,
    title: params.title,
    preferenceType: params.preferenceType,
    toneControlLevel: params.toneControlLevel,
    placementRule: params.placementRule,
    visibilityLevel: params.visibilityLevel,
    presentationEligibility: params.presentationEligibility,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Tone Control Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes tone control metadata from provided parameters.
 * Pure function. No side effects.
 */
export function composeToneControlMetadata(params: {
  readonly metadataId: string;
  readonly profileId: string;
  readonly toneControlLevel: ToneControlLevel;
  readonly humorIntensity: string;
  readonly witLevel: string;
  readonly sarcasmLevel: string;
  readonly dramaticLevel: string;
  readonly inspirationalLevel: string;
  readonly academicLevel: string;
}): ToneControlMetadata {
  return {
    metadataId: params.metadataId,
    profileId: params.profileId,
    toneControlLevel: params.toneControlLevel,
    humorIntensity: params.humorIntensity,
    witLevel: params.witLevel,
    sarcasmLevel: params.sarcasmLevel,
    dramaticLevel: params.dramaticLevel,
    inspirationalLevel: params.inspirationalLevel,
    academicLevel: params.academicLevel,
  };
}

// ---------------------------------------------------------------------------
// Placement Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes placement metadata from provided parameters.
 * Pure function. No side effects.
 */
export function composePlacementMetadata(params: {
  readonly metadataId: string;
  readonly profileId: string;
  readonly placementRule: PlacementRule;
  readonly priority: number;
  readonly frequency: string;
  readonly duration: string;
  readonly cooldown: string;
  readonly contextRequired: readonly string[];
}): PlacementMetadata {
  return {
    metadataId: params.metadataId,
    profileId: params.profileId,
    placementRule: params.placementRule,
    priority: params.priority,
    frequency: params.frequency,
    duration: params.duration,
    cooldown: params.cooldown,
    contextRequired: [...params.contextRequired],
  };
}

// ---------------------------------------------------------------------------
// Visibility Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes visibility metadata from provided parameters.
 * Pure function. No side effects.
 */
export function composeVisibilityMetadata(params: {
  readonly metadataId: string;
  readonly profileId: string;
  readonly visibilityLevel: VisibilityLevel;
  readonly conditions: readonly string[];
  readonly prerequisites: readonly string[];
  readonly exclusions: readonly string[];
  readonly timeRestrictions: string;
}): VisibilityMetadata {
  return {
    metadataId: params.metadataId,
    profileId: params.profileId,
    visibilityLevel: params.visibilityLevel,
    conditions: [...params.conditions],
    prerequisites: [...params.prerequisites],
    exclusions: [...params.exclusions],
    timeRestrictions: params.timeRestrictions,
  };
}

// ---------------------------------------------------------------------------
// Preference Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a preference relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composePreferenceRelationship(params: {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriosityPreferenceProvenance;
}): PreferenceRelationship {
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
 * Deterministic comparator for curiosity preference profiles.
 * Sorts by profileId, then preferenceType, then title.
 * Pure function. No side effects.
 */
function _compareCuriosityPreferenceProfile(
  a: CuriosityPreferenceProfile,
  b: CuriosityPreferenceProfile,
): number {
  if (a.profileId < b.profileId) return -1;
  if (a.profileId > b.profileId) return 1;

  if (a.preferenceType < b.preferenceType) return -1;
  if (a.preferenceType > b.preferenceType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Relationships
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for preference relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _comparePreferenceRelationship(
  a: PreferenceRelationship,
  b: PreferenceRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Preference Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a preference registry from profiles, tone controls, placements, visibility, and relationships.
 * Pure function. No side effects.
 * Deterministic ordering: profileId → preferenceType → title.
 */
export function composePreferenceRegistry(
  profiles: readonly CuriosityPreferenceProfile[],
  toneControls: readonly ToneControlMetadata[],
  placements: readonly PlacementMetadata[],
  visibility: readonly VisibilityMetadata[],
  relationships: readonly PreferenceRelationship[],
): PreferenceRegistry {
  const sortedProfiles = [...profiles].sort(_compareCuriosityPreferenceProfile);
  const sortedRelationships = [...relationships].sort(_comparePreferenceRelationship);

  const metadata: PreferenceRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}_${toneControls.length}_${placements.length}_${visibility.length}_${sortedRelationships.length}`,
    version: '1.0.0',
    profileCount: sortedProfiles.length,
    toneControlCount: toneControls.length,
    placementCount: placements.length,
    visibilityCount: visibility.length,
    relationshipCount: sortedRelationships.length,
  };

  return {
    registryId: metadata.registryId,
    profiles: sortedProfiles,
    toneControls,
    placements,
    visibility,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedProfiles.length}_${toneControls.length}_${placements.length}_${visibility.length}_${sortedRelationships.length}`,
      generatedFrom: 'deterministic_curiosity_preference_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_curiosity_preference_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Preference Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a preference registry from an input.
 * Pure function. No side effects.
 */
export function composePreferenceRegistryFromInput(
  input: PreferenceInput,
): PreferenceRegistry {
  return composePreferenceRegistry(input.profiles, input.toneControls, input.placements, input.visibility, input.relationships);
}

// ---------------------------------------------------------------------------
// Curiosity Preferences Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete preference registry from an input.
 * Pure function. No side effects.
 */
export function composeCuriosityPreferences(
  input: PreferenceInput,
): PreferenceRegistry {
  const registry = composePreferenceRegistry(input.profiles, input.toneControls, input.placements, input.visibility, input.relationships);

  return {
    ...registry,
    trace: composeCuriosityPreferenceTrace({
      traceId: `_trace_${input.profiles.length}_${input.toneControls.length}_${input.placements.length}_${input.visibility.length}_${input.relationships.length}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Preferences Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact with preferences from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifactWithPreferences(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly profiles: readonly CuriosityPreferenceProfile[];
  readonly toneControls: readonly ToneControlMetadata[];
  readonly placements: readonly PlacementMetadata[];
  readonly visibility: readonly VisibilityMetadata[];
  readonly relationships: readonly PreferenceRelationship[];
  readonly provenance: CuriosityPreferenceProvenance;
}): CuriosityArtifactWithPreferences {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    profiles: [...params.profiles],
    toneControls: [...params.toneControls],
    placements: [...params.placements],
    visibility: [...params.visibility],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported user preference type.
 */
export function isSupportedUserPreferenceType(
  preferenceType: string,
): preferenceType is UserPreferenceType {
  return CANONICAL_USER_PREFERENCE_TYPES.includes(preferenceType as UserPreferenceType);
}

/**
 * Checks if a string is a supported tone control level.
 */
export function isSupportedToneControlLevel(
  level: string,
): level is ToneControlLevel {
  return CANONICAL_TONE_CONTROL_LEVELS.includes(level as ToneControlLevel);
}

/**
 * Checks if a string is a supported placement rule.
 */
export function isSupportedPlacementRule(
  rule: string,
): rule is PlacementRule {
  return CANONICAL_PLACEMENT_RULES.includes(rule as PlacementRule);
}

/**
 * Checks if a string is a supported visibility level.
 */
export function isSupportedVisibilityLevel(
  level: string,
): level is VisibilityLevel {
  return CANONICAL_VISIBILITY_LEVELS.includes(level as VisibilityLevel);
}

/**
 * Checks if a string is a supported presentation eligibility.
 */
export function isSupportedPresentationEligibility(
  eligibility: string,
): eligibility is PresentationEligibility {
  return CANONICAL_PRESENTATION_ELIGIBILITY.includes(eligibility as PresentationEligibility);
}

/**
 * Checks if a string is a supported preference status.
 */
export function isSupportedPreferenceStatus(
  status: string,
): status is PreferenceStatus {
  return CANONICAL_PREFERENCE_STATUS.includes(status as PreferenceStatus);
}

/**
 * Checks if a string is a supported preference governance.
 */
export function isSupportedPreferenceGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical user preference types.
 */
export function getCanonicalUserPreferenceTypes(): readonly UserPreferenceType[] {
  return [...CANONICAL_USER_PREFERENCE_TYPES];
}

/**
 * Returns the canonical tone control levels.
 */
export function getCanonicalToneControlLevels(): readonly ToneControlLevel[] {
  return [...CANONICAL_TONE_CONTROL_LEVELS];
}

/**
 * Returns the canonical placement rules.
 */
export function getCanonicalPlacementRules(): readonly PlacementRule[] {
  return [...CANONICAL_PLACEMENT_RULES];
}

/**
 * Returns the canonical visibility levels.
 */
export function getCanonicalVisibilityLevels(): readonly VisibilityLevel[] {
  return [...CANONICAL_VISIBILITY_LEVELS];
}

/**
 * Returns the canonical presentation eligibility values.
 */
export function getCanonicalPresentationEligibility(): readonly PresentationEligibility[] {
  return [...CANONICAL_PRESENTATION_ELIGIBILITY];
}

/**
 * Returns the canonical preference statuses.
 */
export function getCanonicalPreferenceStatuses(): readonly PreferenceStatus[] {
  return [...CANONICAL_PREFERENCE_STATUS];
}
