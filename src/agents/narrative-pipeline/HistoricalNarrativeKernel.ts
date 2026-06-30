/**
 * NV-1700-D6-OPT-07 — Historical Context, Scientific Evolution & Discovery Timeline Kernel
 *
 * Deterministic orchestration functions for historical metadata.
 * Produces historical contexts, discoveries, events, evolutions, milestones,
 * influence chains, paradigm shifts, and registries.
 *
 * This module never:
 * - Generates historical explanations
 * - Infers chronology
 * - Invents discoveries
 * - Fabricates historical events
 * - Infers causal relationships
 * - Performs historical reasoning
 * - Calls LLMs
 * - Calls external APIs
 * - Mutates narrative artifacts
 *
 * Historical metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  HistoricalProvenance,
  NarrativeGovernanceStatus,
  HistoricalContextType,
  DiscoveryType,
  TimelineEventType,
  EvolutionType,
  MilestoneType,
  InfluenceType,
  ParadigmShiftType,
  HistoryStatus,
  HistoricalContext,
  ScientificDiscovery,
  TimelineEvent,
  ScientificEvolution,
  Milestone,
  InfluenceChain,
  ParadigmShift,
  HistoricalDecision,
  HistoricalTrace,
  HistoricalRegistry,
  HistoricalRegistryMetadata,
  HistoricalInput,
  NarrativeUnitType,
  NarrativeMode,
  NarrativeDomain,
  NarrativeStatus,
  NarrativeProvenance,
  NarrativeArtifactWithHistory,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_HISTORICAL_CONTEXT_TYPES,
  CANONICAL_DISCOVERY_TYPES,
  CANONICAL_TIMELINE_EVENT_TYPES,
  CANONICAL_EVOLUTION_TYPES,
  CANONICAL_MILESTONE_TYPES,
  CANONICAL_INFLUENCE_TYPES,
  CANONICAL_PARADIGM_SHIFT_TYPES,
  CANONICAL_HISTORY_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

// ---------------------------------------------------------------------------
// Historical Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes historical provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeHistoricalContextProvenance(params: {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): HistoricalProvenance {
  return {
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Historical Context Composition
// ---------------------------------------------------------------------------

export function composeHistoricalContext(params: {
  readonly contextId: string;
  readonly contextType: HistoricalContextType;
  readonly title: string;
  readonly description: string;
  readonly timePeriod: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}): HistoricalContext {
  return {
    contextId: params.contextId,
    contextType: params.contextType,
    title: params.title,
    description: params.description,
    timePeriod: params.timePeriod,
    relatedArtifactId: params.relatedArtifactId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Scientific Discovery Composition
// ---------------------------------------------------------------------------

export function composeScientificDiscovery(params: {
  readonly discoveryId: string;
  readonly discoveryType: DiscoveryType;
  readonly title: string;
  readonly description: string;
  readonly year: number;
  readonly relatedConceptId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}): ScientificDiscovery {
  return {
    discoveryId: params.discoveryId,
    discoveryType: params.discoveryType,
    title: params.title,
    description: params.description,
    year: params.year,
    relatedConceptId: params.relatedConceptId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Timeline Event Composition
// ---------------------------------------------------------------------------

export function composeTimelineEvent(params: {
  readonly eventId: string;
  readonly eventType: TimelineEventType;
  readonly year: number;
  readonly title: string;
  readonly description: string;
  readonly relatedDiscoveryId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}): TimelineEvent {
  return {
    eventId: params.eventId,
    eventType: params.eventType,
    year: params.year,
    title: params.title,
    description: params.description,
    relatedDiscoveryId: params.relatedDiscoveryId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Scientific Evolution Composition
// ---------------------------------------------------------------------------

export function composeScientificEvolution(params: {
  readonly evolutionId: string;
  readonly evolutionType: EvolutionType;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}): ScientificEvolution {
  return {
    evolutionId: params.evolutionId,
    evolutionType: params.evolutionType,
    sourceArtifactId: params.sourceArtifactId,
    targetArtifactId: params.targetArtifactId,
    description: params.description,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Milestone Composition
// ---------------------------------------------------------------------------

export function composeMilestone(params: {
  readonly milestoneId: string;
  readonly milestoneType: MilestoneType;
  readonly title: string;
  readonly description: string;
  readonly relatedTimelineId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}): Milestone {
  return {
    milestoneId: params.milestoneId,
    milestoneType: params.milestoneType,
    title: params.title,
    description: params.description,
    relatedTimelineId: params.relatedTimelineId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Influence Chain Composition
// ---------------------------------------------------------------------------

export function composeInfluenceChain(params: {
  readonly influenceId: string;
  readonly influenceType: InfluenceType;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly description: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}): InfluenceChain {
  return {
    influenceId: params.influenceId,
    influenceType: params.influenceType,
    sourceArtifactId: params.sourceArtifactId,
    targetArtifactId: params.targetArtifactId,
    description: params.description,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Paradigm Shift Composition
// ---------------------------------------------------------------------------

export function composeParadigmShift(params: {
  readonly shiftId: string;
  readonly shiftType: ParadigmShiftType;
  readonly title: string;
  readonly description: string;
  readonly affectedDomain: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: HistoricalProvenance;
}): ParadigmShift {
  return {
    shiftId: params.shiftId,
    shiftType: params.shiftType,
    title: params.title,
    description: params.description,
    affectedDomain: params.affectedDomain,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Historical Decision Composition
// ---------------------------------------------------------------------------

function _composeHistoricalDecision(
  historicalId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): HistoricalDecision {
  return {
    decisionId: `_decision_${historicalId}`,
    historicalId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Historical Trace Composition
// ---------------------------------------------------------------------------

export function composeHistoricalTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly HistoricalDecision[];
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly historicalContextCount: number;
  readonly discoveryCount: number;
  readonly timelineEventCount: number;
  readonly evolutionCount: number;
  readonly milestoneCount: number;
  readonly influenceCount: number;
  readonly paradigmShiftCount: number;
}): HistoricalTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    historicalContextCount: params.historicalContextCount,
    discoveryCount: params.discoveryCount,
    timelineEventCount: params.timelineEventCount,
    evolutionCount: params.evolutionCount,
    milestoneCount: params.milestoneCount,
    influenceCount: params.influenceCount,
    paradigmShiftCount: params.paradigmShiftCount,
    registryVersion: params.registryVersion,
    pipelineVersion: params.pipelineVersion,
    compositionMetadata: {},
    deterministicMetadata: {},
    deterministic: true,
    generatedFrom: 'deterministic_historical_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Narrative Artifact With History Composition
// ---------------------------------------------------------------------------

export function composeNarrativeArtifactWithHistory(params: {
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
  readonly historicalContexts: readonly HistoricalContext[];
  readonly discoveries: readonly ScientificDiscovery[];
  readonly timelineEvents: readonly TimelineEvent[];
  readonly evolutions: readonly ScientificEvolution[];
  readonly milestones: readonly Milestone[];
  readonly influenceChains: readonly InfluenceChain[];
  readonly paradigmShifts: readonly ParadigmShift[];
}): NarrativeArtifactWithHistory {
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
    historicalContexts: [...params.historicalContexts],
    discoveries: [...params.discoveries],
    timelineEvents: [...params.timelineEvents],
    evolutions: [...params.evolutions],
    milestones: [...params.milestones],
    influenceChains: [...params.influenceChains],
    paradigmShifts: [...params.paradigmShifts],
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

function _compareContext(a: HistoricalContext, b: HistoricalContext): number {
  if (a.contextId < b.contextId) return -1;
  if (a.contextId > b.contextId) return 1;
  if (a.contextType < b.contextType) return -1;
  if (a.contextType > b.contextType) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareDiscovery(a: ScientificDiscovery, b: ScientificDiscovery): number {
  if (a.discoveryId < b.discoveryId) return -1;
  if (a.discoveryId > b.discoveryId) return 1;
  if (a.discoveryType < b.discoveryType) return -1;
  if (a.discoveryType > b.discoveryType) return 1;
  if (a.year < b.year) return -1;
  if (a.year > b.year) return 1;
  return 0;
}

function _compareEvent(a: TimelineEvent, b: TimelineEvent): number {
  if (a.eventId < b.eventId) return -1;
  if (a.eventId > b.eventId) return 1;
  if (a.eventType < b.eventType) return -1;
  if (a.eventType > b.eventType) return 1;
  if (a.year < b.year) return -1;
  if (a.year > b.year) return 1;
  return 0;
}

function _compareEvolution(a: ScientificEvolution, b: ScientificEvolution): number {
  if (a.evolutionId < b.evolutionId) return -1;
  if (a.evolutionId > b.evolutionId) return 1;
  if (a.evolutionType < b.evolutionType) return -1;
  if (a.evolutionType > b.evolutionType) return 1;
  return 0;
}

function _compareMilestone(a: Milestone, b: Milestone): number {
  if (a.milestoneId < b.milestoneId) return -1;
  if (a.milestoneId > b.milestoneId) return 1;
  if (a.milestoneType < b.milestoneType) return -1;
  if (a.milestoneType > b.milestoneType) return 1;
  return 0;
}

function _compareInfluence(a: InfluenceChain, b: InfluenceChain): number {
  if (a.influenceId < b.influenceId) return -1;
  if (a.influenceId > b.influenceId) return 1;
  if (a.influenceType < b.influenceType) return -1;
  if (a.influenceType > b.influenceType) return 1;
  return 0;
}

function _compareShift(a: ParadigmShift, b: ParadigmShift): number {
  if (a.shiftId < b.shiftId) return -1;
  if (a.shiftId > b.shiftId) return 1;
  if (a.shiftType < b.shiftType) return -1;
  if (a.shiftType > b.shiftType) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Historical Registry Composition
// ---------------------------------------------------------------------------

export function composeHistoricalRegistry(
  historicalContexts: readonly HistoricalContext[],
  discoveries: readonly ScientificDiscovery[],
  timelineEvents: readonly TimelineEvent[],
  evolutions: readonly ScientificEvolution[],
  milestones: readonly Milestone[],
  influenceChains: readonly InfluenceChain[],
  paradigmShifts: readonly ParadigmShift[],
): HistoricalRegistry {
  const sortedContexts = [...historicalContexts].sort(_compareContext);
  const sortedDiscoveries = [...discoveries].sort(_compareDiscovery);
  const sortedEvents = [...timelineEvents].sort(_compareEvent);
  const sortedEvolutions = [...evolutions].sort(_compareEvolution);
  const sortedMilestones = [...milestones].sort(_compareMilestone);
  const sortedInfluences = [...influenceChains].sort(_compareInfluence);
  const sortedShifts = [...paradigmShifts].sort(_compareShift);

  const metadata: HistoricalRegistryMetadata = {
    registryId: `_historical_registry_${sortedContexts.length}`,
    historicalContextCount: sortedContexts.length,
    discoveryCount: sortedDiscoveries.length,
    timelineEventCount: sortedEvents.length,
    evolutionCount: sortedEvolutions.length,
    milestoneCount: sortedMilestones.length,
    influenceCount: sortedInfluences.length,
    paradigmShiftCount: sortedShifts.length,
  };

  return {
    registryId: metadata.registryId,
    historicalContexts: sortedContexts,
    discoveries: sortedDiscoveries,
    timelineEvents: sortedEvents,
    evolutions: sortedEvolutions,
    milestones: sortedMilestones,
    influenceChains: sortedInfluences,
    paradigmShifts: sortedShifts,
    metadata,
    trace: {
      traceId: `_historical_trace_${sortedContexts.length}`,
      decisionCount: 0,
      validationCount: 0,
      historicalContextCount: sortedContexts.length,
      discoveryCount: sortedDiscoveries.length,
      timelineEventCount: sortedEvents.length,
      evolutionCount: sortedEvolutions.length,
      milestoneCount: sortedMilestones.length,
      influenceCount: sortedInfluences.length,
      paradigmShiftCount: sortedShifts.length,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      compositionMetadata: {},
      deterministicMetadata: {},
      deterministic: true,
      generatedFrom: 'deterministic_historical_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_historical_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Historical Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeHistoricalRegistryFromInput(
  input: HistoricalInput,
): HistoricalRegistry {
  return composeHistoricalRegistry(
    input.historicalContexts,
    input.discoveries,
    input.timelineEvents,
    input.evolutions,
    input.milestones,
    input.influenceChains,
    input.paradigmShifts,
  );
}

// ---------------------------------------------------------------------------
// Narrative History Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeNarrativeHistory(
  input: HistoricalInput,
): HistoricalRegistry {
  const decisions = input.historicalContexts.map((ctx) => {
    const errors = _validateContextForDecision(ctx);
    return _composeHistoricalDecision(ctx.contextId, errors.length === 0, errors);
  });

  const registry = composeHistoricalRegistry(
    input.historicalContexts,
    input.discoveries,
    input.timelineEvents,
    input.evolutions,
    input.milestones,
    input.influenceChains,
    input.paradigmShifts,
  );

  return {
    ...registry,
    trace: composeHistoricalTrace({
      traceId: `_historical_trace_${input.historicalContexts.length}`,
      decisions,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      historicalContextCount: input.historicalContexts.length,
      discoveryCount: input.discoveries.length,
      timelineEventCount: input.timelineEvents.length,
      evolutionCount: input.evolutions.length,
      milestoneCount: input.milestones.length,
      influenceCount: input.influenceChains.length,
      paradigmShiftCount: input.paradigmShifts.length,
    }),
  };
}

function _validateContextForDecision(
  ctx: HistoricalContext,
): readonly string[] {
  const errors: string[] = [];
  if (!ctx.contextId || ctx.contextId.trim() === '') errors.push('HISTORY_MISSING_CONTEXT_ID');
  if (!ctx.title || ctx.title.trim() === '') errors.push('HISTORY_MISSING_TITLE');
  if (!CANONICAL_HISTORICAL_CONTEXT_TYPES.includes(ctx.contextType)) errors.push('HISTORY_INVALID_CONTEXT_TYPE');
  if (!CANONICAL_GOVERNANCE_STATUSES.includes(ctx.governanceStatus)) errors.push('HISTORY_INVALID_GOVERNANCE_STATUS');
  if (!ctx.provenance) errors.push('HISTORY_MISSING_PROVENANCE');
  if (!ctx.relatedArtifactId || ctx.relatedArtifactId.trim() === '') errors.push('HISTORY_MISSING_ARTIFACT_REFERENCE');
  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedHistoricalContextType(v: string): v is HistoricalContextType {
  return CANONICAL_HISTORICAL_CONTEXT_TYPES.includes(v as HistoricalContextType);
}

export function isSupportedDiscoveryType(v: string): v is DiscoveryType {
  return CANONICAL_DISCOVERY_TYPES.includes(v as DiscoveryType);
}

export function isSupportedTimelineEventType(v: string): v is TimelineEventType {
  return CANONICAL_TIMELINE_EVENT_TYPES.includes(v as TimelineEventType);
}

export function isSupportedEvolutionType(v: string): v is EvolutionType {
  return CANONICAL_EVOLUTION_TYPES.includes(v as EvolutionType);
}

export function isSupportedMilestoneType(v: string): v is MilestoneType {
  return CANONICAL_MILESTONE_TYPES.includes(v as MilestoneType);
}

export function isSupportedInfluenceType(v: string): v is InfluenceType {
  return CANONICAL_INFLUENCE_TYPES.includes(v as InfluenceType);
}

export function isSupportedParadigmShiftType(v: string): v is ParadigmShiftType {
  return CANONICAL_PARADIGM_SHIFT_TYPES.includes(v as ParadigmShiftType);
}

export function isSupportedHistoryStatus(v: string): v is HistoryStatus {
  return CANONICAL_HISTORY_STATUS.includes(v as HistoryStatus);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalHistoricalContextTypes(): readonly HistoricalContextType[] {
  return CANONICAL_HISTORICAL_CONTEXT_TYPES;
}

export function getCanonicalDiscoveryTypes(): readonly DiscoveryType[] {
  return CANONICAL_DISCOVERY_TYPES;
}

export function getCanonicalTimelineEventTypes(): readonly TimelineEventType[] {
  return CANONICAL_TIMELINE_EVENT_TYPES;
}

export function getCanonicalEvolutionTypes(): readonly EvolutionType[] {
  return CANONICAL_EVOLUTION_TYPES;
}

export function getCanonicalMilestoneTypes(): readonly MilestoneType[] {
  return CANONICAL_MILESTONE_TYPES;
}

export function getCanonicalInfluenceTypes(): readonly InfluenceType[] {
  return CANONICAL_INFLUENCE_TYPES;
}

export function getCanonicalParadigmShiftTypes(): readonly ParadigmShiftType[] {
  return CANONICAL_PARADIGM_SHIFT_TYPES;
}

export function getCanonicalHistoryStatuses(): readonly HistoryStatus[] {
  return CANONICAL_HISTORY_STATUS;
}
