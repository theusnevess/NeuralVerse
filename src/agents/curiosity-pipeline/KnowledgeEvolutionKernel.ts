/**
 * NV-2100-D9-OPT-06 — Knowledge Evolution Kernel
 *
 * Deterministic orchestration functions for knowledge evolution metadata.
 * Produces evolution profiles, historical oddities, research trails, milestones, traces, and registries.
 *
 * This module never:
 * - Generates historical curiosities
 * - Writes research stories
 * - Explains scientific discoveries
 * - Performs historical analysis
 * - Reconstructs timelines
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Knowledge evolution metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeEvolutionProfile,
  HistoricalOddity,
  ResearchTrail,
  EvolutionMilestone,
  EvolutionRelationship,
  KnowledgeEvolutionRegistry,
  KnowledgeEvolutionRegistryMetadata,
  KnowledgeEvolutionInput,
  KnowledgeEvolutionProvenance,
  KnowledgeEvolutionDecision,
  KnowledgeEvolutionTrace,
  CuriosityArtifactWithKnowledgeEvolution,
  DiscoveryType,
  EvolutionStage,
  ResearchTrailType,
  OddityType,
  EvolutionPurpose,
  KnowledgeEvolutionStatus,
  CuriosityGovernance,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_DISCOVERY_TYPES,
  CANONICAL_EVOLUTION_STAGES,
  CANONICAL_RESEARCH_TRAIL_TYPES,
  CANONICAL_ODDITY_TYPES,
  CANONICAL_EVOLUTION_PURPOSES,
  CANONICAL_KNOWLEDGE_EVOLUTION_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Knowledge Evolution Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes knowledge evolution provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeEvolutionProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}): KnowledgeEvolutionProvenance {
  return {
    provider: params.provider,
    source: params.source,
    rationale: params.rationale,
    version: params.version,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge evolution decision from validation results.
 * Pure function. No side effects.
 */
function _composeKnowledgeEvolutionDecision(
  profileId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeEvolutionDecision {
  return {
    decisionId: `_decision_${profileId}`,
    profileId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge evolution trace from metadata.
 * Pure function. No side effects.
 */
export function composeKnowledgeEvolutionTrace(params: {
  readonly traceId: string;
}): KnowledgeEvolutionTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_knowledge_evolution_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Profile Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge evolution profile from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeEvolutionProfile(params: {
  readonly id: string;
  readonly title: string;
  readonly discoveryType: DiscoveryType;
  readonly evolutionStage: EvolutionStage;
  readonly researchTrailType: ResearchTrailType;
  readonly evolutionPurpose: EvolutionPurpose;
  readonly conceptIds: readonly string[];
  readonly status: KnowledgeEvolutionStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: KnowledgeEvolutionProvenance;
  readonly trace: KnowledgeEvolutionTrace;
}): KnowledgeEvolutionProfile {
  return {
    id: params.id,
    title: params.title,
    discoveryType: params.discoveryType,
    evolutionStage: params.evolutionStage,
    researchTrailType: params.researchTrailType,
    evolutionPurpose: params.evolutionPurpose,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Historical Oddity Composition
// ---------------------------------------------------------------------------

/**
 * Composes a historical oddity from provided parameters.
 * Pure function. No side effects.
 */
export function composeHistoricalOddity(params: {
  readonly oddityId: string;
  readonly title: string;
  readonly oddityType: OddityType;
  readonly historicalContext: string;
  readonly unexpectedElement: string;
  readonly lessonLearned: string;
  readonly conceptIds: readonly string[];
  readonly status: KnowledgeEvolutionStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: KnowledgeEvolutionProvenance;
  readonly trace: KnowledgeEvolutionTrace;
}): HistoricalOddity {
  return {
    oddityId: params.oddityId,
    title: params.title,
    oddityType: params.oddityType,
    historicalContext: params.historicalContext,
    unexpectedElement: params.unexpectedElement,
    lessonLearned: params.lessonLearned,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Research Trail Composition
// ---------------------------------------------------------------------------

/**
 * Composes a research trail from provided parameters.
 * Pure function. No side effects.
 */
export function composeResearchTrail(params: {
  readonly trailId: string;
  readonly title: string;
  readonly trailType: ResearchTrailType;
  readonly trailDescription: string;
  readonly keyContributors: readonly string[];
  readonly breakthroughMoment: string;
  readonly impactAssessment: string;
  readonly conceptIds: readonly string[];
  readonly status: KnowledgeEvolutionStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: KnowledgeEvolutionProvenance;
  readonly trace: KnowledgeEvolutionTrace;
}): ResearchTrail {
  return {
    trailId: params.trailId,
    title: params.title,
    trailType: params.trailType,
    trailDescription: params.trailDescription,
    keyContributors: [...params.keyContributors],
    breakthroughMoment: params.breakthroughMoment,
    impactAssessment: params.impactAssessment,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Evolution Milestone Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evolution milestone from provided parameters.
 * Pure function. No side effects.
 */
export function composeEvolutionMilestone(params: {
  readonly milestoneId: string;
  readonly profileId: string;
  readonly title: string;
  readonly stage: EvolutionStage;
  readonly year: string;
  readonly description: string;
  readonly significance: string;
}): EvolutionMilestone {
  return {
    milestoneId: params.milestoneId,
    profileId: params.profileId,
    title: params.title,
    stage: params.stage,
    year: params.year,
    description: params.description,
    significance: params.significance,
  };
}

// ---------------------------------------------------------------------------
// Evolution Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evolution relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeEvolutionRelationship(params: {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: KnowledgeEvolutionProvenance;
}): EvolutionRelationship {
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
 * Deterministic comparator for knowledge evolution profiles.
 * Sorts by id, then discoveryType, then title.
 * Pure function. No side effects.
 */
function _compareKnowledgeEvolutionProfile(
  a: KnowledgeEvolutionProfile,
  b: KnowledgeEvolutionProfile,
): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;

  if (a.discoveryType < b.discoveryType) return -1;
  if (a.discoveryType > b.discoveryType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Oddities
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for historical oddities.
 * Sorts by oddityId.
 * Pure function. No side effects.
 */
function _compareHistoricalOddity(
  a: HistoricalOddity,
  b: HistoricalOddity,
): number {
  if (a.oddityId < b.oddityId) return -1;
  if (a.oddityId > b.oddityId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Trails
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for research trails.
 * Sorts by trailId.
 * Pure function. No side effects.
 */
function _compareResearchTrail(
  a: ResearchTrail,
  b: ResearchTrail,
): number {
  if (a.trailId < b.trailId) return -1;
  if (a.trailId > b.trailId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Milestones
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for evolution milestones.
 * Sorts by milestoneId.
 * Pure function. No side effects.
 */
function _compareEvolutionMilestone(
  a: EvolutionMilestone,
  b: EvolutionMilestone,
): number {
  if (a.milestoneId < b.milestoneId) return -1;
  if (a.milestoneId > b.milestoneId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Relationships
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for evolution relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _compareEvolutionRelationship(
  a: EvolutionRelationship,
  b: EvolutionRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge evolution registry from profiles, oddities, trails, milestones, and relationships.
 * Pure function. No side effects.
 * Deterministic ordering: id → discoveryType → title.
 */
export function composeKnowledgeEvolutionRegistry(
  profiles: readonly KnowledgeEvolutionProfile[],
  oddities: readonly HistoricalOddity[],
  trails: readonly ResearchTrail[],
  milestones: readonly EvolutionMilestone[],
  relationships: readonly EvolutionRelationship[],
): KnowledgeEvolutionRegistry {
  const sortedProfiles = [...profiles].sort(_compareKnowledgeEvolutionProfile);
  const sortedOddities = [...oddities].sort(_compareHistoricalOddity);
  const sortedTrails = [...trails].sort(_compareResearchTrail);
  const sortedMilestones = [...milestones].sort(_compareEvolutionMilestone);
  const sortedRelationships = [...relationships].sort(_compareEvolutionRelationship);

  const metadata: KnowledgeEvolutionRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}_${sortedOddities.length}_${sortedTrails.length}_${sortedMilestones.length}_${sortedRelationships.length}`,
    version: '1.0.0',
    profileCount: sortedProfiles.length,
    oddityCount: sortedOddities.length,
    trailCount: sortedTrails.length,
    milestoneCount: sortedMilestones.length,
    relationshipCount: sortedRelationships.length,
  };

  return {
    registryId: metadata.registryId,
    profiles: sortedProfiles,
    oddities: sortedOddities,
    trails: sortedTrails,
    milestones: sortedMilestones,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedProfiles.length}_${sortedOddities.length}_${sortedTrails.length}_${sortedMilestones.length}_${sortedRelationships.length}`,
      generatedFrom: 'deterministic_knowledge_evolution_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_knowledge_evolution_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge evolution registry from an input.
 * Pure function. No side effects.
 */
export function composeKnowledgeEvolutionRegistryFromInput(
  input: KnowledgeEvolutionInput,
): KnowledgeEvolutionRegistry {
  return composeKnowledgeEvolutionRegistry(input.profiles, input.oddities, input.trails, input.milestones, input.relationships);
}

// ---------------------------------------------------------------------------
// Knowledge Evolution Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete knowledge evolution registry from an input.
 * Pure function. No side effects.
 */
export function composeKnowledgeEvolution(
  input: KnowledgeEvolutionInput,
): KnowledgeEvolutionRegistry {
  const registry = composeKnowledgeEvolutionRegistry(input.profiles, input.oddities, input.trails, input.milestones, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeEvolutionTrace({
      traceId: `_trace_${input.profiles.length}_${input.oddities.length}_${input.trails.length}_${input.milestones.length}_${input.relationships.length}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Knowledge Evolution Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact with knowledge evolution from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifactWithKnowledgeEvolution(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly profiles: readonly KnowledgeEvolutionProfile[];
  readonly oddities: readonly HistoricalOddity[];
  readonly trails: readonly ResearchTrail[];
  readonly milestones: readonly EvolutionMilestone[];
  readonly relationships: readonly EvolutionRelationship[];
  readonly provenance: KnowledgeEvolutionProvenance;
}): CuriosityArtifactWithKnowledgeEvolution {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    profiles: [...params.profiles],
    oddities: [...params.oddities],
    trails: [...params.trails],
    milestones: [...params.milestones],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported discovery type.
 */
export function isSupportedDiscoveryType(
  discoveryType: string,
): discoveryType is DiscoveryType {
  return CANONICAL_DISCOVERY_TYPES.includes(discoveryType as DiscoveryType);
}

/**
 * Checks if a string is a supported evolution stage.
 */
export function isSupportedEvolutionStage(
  stage: string,
): stage is EvolutionStage {
  return CANONICAL_EVOLUTION_STAGES.includes(stage as EvolutionStage);
}

/**
 * Checks if a string is a supported research trail type.
 */
export function isSupportedResearchTrailType(
  trailType: string,
): trailType is ResearchTrailType {
  return CANONICAL_RESEARCH_TRAIL_TYPES.includes(trailType as ResearchTrailType);
}

/**
 * Checks if a string is a supported oddity type.
 */
export function isSupportedOddityType(
  oddityType: string,
): oddityType is OddityType {
  return CANONICAL_ODDITY_TYPES.includes(oddityType as OddityType);
}

/**
 * Checks if a string is a supported evolution purpose.
 */
export function isSupportedEvolutionPurpose(
  purpose: string,
): purpose is EvolutionPurpose {
  return CANONICAL_EVOLUTION_PURPOSES.includes(purpose as EvolutionPurpose);
}

/**
 * Checks if a string is a supported knowledge evolution status.
 */
export function isSupportedKnowledgeEvolutionStatus(
  status: string,
): status is KnowledgeEvolutionStatus {
  return CANONICAL_KNOWLEDGE_EVOLUTION_STATUS.includes(status as KnowledgeEvolutionStatus);
}

/**
 * Checks if a string is a supported knowledge evolution governance.
 */
export function isSupportedKnowledgeEvolutionGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical discovery types.
 */
export function getCanonicalDiscoveryTypes(): readonly DiscoveryType[] {
  return [...CANONICAL_DISCOVERY_TYPES];
}

/**
 * Returns the canonical evolution stages.
 */
export function getCanonicalEvolutionStages(): readonly EvolutionStage[] {
  return [...CANONICAL_EVOLUTION_STAGES];
}

/**
 * Returns the canonical research trail types.
 */
export function getCanonicalResearchTrailTypes(): readonly ResearchTrailType[] {
  return [...CANONICAL_RESEARCH_TRAIL_TYPES];
}

/**
 * Returns the canonical oddity types.
 */
export function getCanonicalOddityTypes(): readonly OddityType[] {
  return [...CANONICAL_ODDITY_TYPES];
}

/**
 * Returns the canonical evolution purposes.
 */
export function getCanonicalEvolutionPurposes(): readonly EvolutionPurpose[] {
  return [...CANONICAL_EVOLUTION_PURPOSES];
}

/**
 * Returns the canonical knowledge evolution statuses.
 */
export function getCanonicalKnowledgeEvolutionStatuses(): readonly KnowledgeEvolutionStatus[] {
  return [...CANONICAL_KNOWLEDGE_EVOLUTION_STATUS];
}
