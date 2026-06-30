/**
 * NV-1700-D6-OPT-07 — Historical Narrative Validation Layer
 */

import type {
  HistoricalProvenance,
  HistoricalContext,
  ScientificDiscovery,
  TimelineEvent,
  ScientificEvolution,
  Milestone,
  InfluenceChain,
  ParadigmShift,
  HistoricalRegistry,
  HistoricalInput,
  NarrativeArtifactWithHistory,
  HistoricalValidationError,
  HistoricalContextValidationResult,
  ScientificDiscoveryValidationResult,
  TimelineEventValidationResult,
  ScientificEvolutionValidationResult,
  MilestoneValidationResult,
  InfluenceChainValidationResult,
  ParadigmShiftValidationResult,
  HistoricalRegistryValidationResult,
  HistoricalInputValidationResult,
  NarrativeArtifactWithHistoryValidationResult,
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

export const HISTORICAL_VALIDATION_CODES = {
  HISTORY_DUPLICATE_CONTEXT_ID: 'HISTORY_DUPLICATE_CONTEXT_ID',
  HISTORY_DUPLICATE_DISCOVERY_ID: 'HISTORY_DUPLICATE_DISCOVERY_ID',
  HISTORY_DUPLICATE_EVENT_ID: 'HISTORY_DUPLICATE_EVENT_ID',
  HISTORY_DUPLICATE_EVOLUTION_ID: 'HISTORY_DUPLICATE_EVOLUTION_ID',
  HISTORY_DUPLICATE_MILESTONE_ID: 'HISTORY_DUPLICATE_MILESTONE_ID',
  HISTORY_DUPLICATE_INFLUENCE_ID: 'HISTORY_DUPLICATE_INFLUENCE_ID',
  HISTORY_DUPLICATE_SHIFT_ID: 'HISTORY_DUPLICATE_SHIFT_ID',
  HISTORY_INVALID_CONTEXT_TYPE: 'HISTORY_INVALID_CONTEXT_TYPE',
  HISTORY_INVALID_DISCOVERY_TYPE: 'HISTORY_INVALID_DISCOVERY_TYPE',
  HISTORY_INVALID_EVENT_TYPE: 'HISTORY_INVALID_EVENT_TYPE',
  HISTORY_INVALID_MILESTONE_TYPE: 'HISTORY_INVALID_MILESTONE_TYPE',
  HISTORY_INVALID_EVOLUTION_TYPE: 'HISTORY_INVALID_EVOLUTION_TYPE',
  HISTORY_INVALID_INFLUENCE_TYPE: 'HISTORY_INVALID_INFLUENCE_TYPE',
  HISTORY_INVALID_PARADIGM_SHIFT_TYPE: 'HISTORY_INVALID_PARADIGM_SHIFT_TYPE',
  HISTORY_INVALID_GOVERNANCE_STATUS: 'HISTORY_INVALID_GOVERNANCE_STATUS',
  HISTORY_MISSING_PROVENANCE: 'HISTORY_MISSING_PROVENANCE',
  HISTORY_MISSING_SOURCE: 'HISTORY_MISSING_SOURCE',
  HISTORY_MISSING_RATIONALE: 'HISTORY_MISSING_RATIONALE',
  HISTORY_MISSING_PROVIDED_BY: 'HISTORY_MISSING_PROVIDED_BY',
  HISTORY_MISSING_CONTEXT_ID: 'HISTORY_MISSING_CONTEXT_ID',
  HISTORY_MISSING_DISCOVERY_ID: 'HISTORY_MISSING_DISCOVERY_ID',
  HISTORY_MISSING_EVENT_ID: 'HISTORY_MISSING_EVENT_ID',
  HISTORY_MISSING_MILESTONE_ID: 'HISTORY_MISSING_MILESTONE_ID',
  HISTORY_MISSING_INFLUENCE_ID: 'HISTORY_MISSING_INFLUENCE_ID',
  HISTORY_MISSING_SHIFT_ID: 'HISTORY_MISSING_SHIFT_ID',
  HISTORY_MISSING_TITLE: 'HISTORY_MISSING_TITLE',
  HISTORY_MISSING_DESCRIPTION: 'HISTORY_MISSING_DESCRIPTION',
  HISTORY_MISSING_ARTIFACT_REFERENCE: 'HISTORY_MISSING_ARTIFACT_REFERENCE',
  HISTORY_EMPTY_REGISTRY: 'HISTORY_EMPTY_REGISTRY',
  HISTORY_INVALID_TRACE: 'HISTORY_INVALID_TRACE',
  HISTORY_TRACE_RANDOM_USED: 'HISTORY_TRACE_RANDOM_USED',
  HISTORY_TRACE_TIME_DEPENDENCY: 'HISTORY_TRACE_TIME_DEPENDENCY',
} as const;

function _validateProvenance(
  provenance: HistoricalProvenance | undefined,
  prefix: string,
  errors: HistoricalValidationError[],
): void {
  if (!provenance) {
    errors.push({ code: `${prefix}_MISSING_PROVENANCE`, message: `${prefix} is missing provenance.`, field: 'provenance' });
    return;
  }
  if (!provenance.source || provenance.source.trim() === '') errors.push({ code: 'HISTORY_MISSING_SOURCE', message: `${prefix} provenance missing source.`, field: 'provenance.source' });
  if (!provenance.rationale || provenance.rationale.trim() === '') errors.push({ code: 'HISTORY_MISSING_RATIONALE', message: `${prefix} provenance missing rationale.`, field: 'provenance.rationale' });
  if (!provenance.providedBy || provenance.providedBy.trim() === '') errors.push({ code: 'HISTORY_MISSING_PROVIDED_BY', message: `${prefix} provenance missing providedBy.`, field: 'provenance.providedBy' });
}

export function validateHistoricalContext(ctx: HistoricalContext): readonly HistoricalValidationError[] {
  const errors: HistoricalValidationError[] = [];
  if (!ctx.contextId || ctx.contextId.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_CONTEXT_ID, message: 'Context missing ID.', field: 'contextId', contextId: ctx.contextId });
  if (!ctx.title || ctx.title.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_TITLE, message: 'Context missing title.', field: 'title', contextId: ctx.contextId });
  if (!CANONICAL_HISTORICAL_CONTEXT_TYPES.includes(ctx.contextType)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_CONTEXT_TYPE, message: `Invalid context type: "${ctx.contextType}".`, field: 'contextType', contextId: ctx.contextId });
  if (!CANONICAL_GOVERNANCE_STATUSES.includes(ctx.governanceStatus)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_GOVERNANCE_STATUS, message: `Invalid governance: "${ctx.governanceStatus}".`, field: 'governanceStatus', contextId: ctx.contextId });
  _validateProvenance(ctx.provenance, 'HISTORY', errors);
  if (!ctx.relatedArtifactId || ctx.relatedArtifactId.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_ARTIFACT_REFERENCE, message: 'Context missing artifact reference.', field: 'relatedArtifactId', contextId: ctx.contextId });
  return errors;
}

export function validateScientificDiscovery(d: ScientificDiscovery): readonly HistoricalValidationError[] {
  const errors: HistoricalValidationError[] = [];
  if (!d.discoveryId || d.discoveryId.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_DISCOVERY_ID, message: 'Discovery missing ID.', field: 'discoveryId', discoveryId: d.discoveryId });
  if (!d.title || d.title.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_TITLE, message: 'Discovery missing title.', field: 'title', discoveryId: d.discoveryId });
  if (!CANONICAL_DISCOVERY_TYPES.includes(d.discoveryType)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_DISCOVERY_TYPE, message: `Invalid discovery type: "${d.discoveryType}".`, field: 'discoveryType', discoveryId: d.discoveryId });
  _validateProvenance(d.provenance, 'HISTORY', errors);
  return errors;
}

export function validateTimelineEvent(e: TimelineEvent): readonly HistoricalValidationError[] {
  const errors: HistoricalValidationError[] = [];
  if (!e.eventId || e.eventId.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_EVENT_ID, message: 'Event missing ID.', field: 'eventId', eventId: e.eventId });
  if (!e.title || e.title.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_TITLE, message: 'Event missing title.', field: 'title', eventId: e.eventId });
  if (!CANONICAL_TIMELINE_EVENT_TYPES.includes(e.eventType)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_EVENT_TYPE, message: `Invalid event type: "${e.eventType}".`, field: 'eventType', eventId: e.eventId });
  _validateProvenance(e.provenance, 'HISTORY', errors);
  return errors;
}

export function validateScientificEvolution(e: ScientificEvolution): readonly HistoricalValidationError[] {
  const errors: HistoricalValidationError[] = [];
  if (!e.evolutionId || e.evolutionId.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_CONTEXT_ID, message: 'Evolution missing ID.', field: 'evolutionId', evolutionId: e.evolutionId });
  if (!e.description || e.description.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_DESCRIPTION, message: 'Evolution missing description.', field: 'description', evolutionId: e.evolutionId });
  if (!CANONICAL_EVOLUTION_TYPES.includes(e.evolutionType)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_EVOLUTION_TYPE, message: `Invalid evolution type: "${e.evolutionType}".`, field: 'evolutionType', evolutionId: e.evolutionId });
  _validateProvenance(e.provenance, 'HISTORY', errors);
  return errors;
}

export function validateMilestone(m: Milestone): readonly HistoricalValidationError[] {
  const errors: HistoricalValidationError[] = [];
  if (!m.milestoneId || m.milestoneId.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_MILESTONE_ID, message: 'Milestone missing ID.', field: 'milestoneId', milestoneId: m.milestoneId });
  if (!m.title || m.title.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_TITLE, message: 'Milestone missing title.', field: 'title', milestoneId: m.milestoneId });
  if (!CANONICAL_MILESTONE_TYPES.includes(m.milestoneType)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_MILESTONE_TYPE, message: `Invalid milestone type: "${m.milestoneType}".`, field: 'milestoneType', milestoneId: m.milestoneId });
  _validateProvenance(m.provenance, 'HISTORY', errors);
  return errors;
}

export function validateInfluenceChain(i: InfluenceChain): readonly HistoricalValidationError[] {
  const errors: HistoricalValidationError[] = [];
  if (!i.influenceId || i.influenceId.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_INFLUENCE_ID, message: 'Influence missing ID.', field: 'influenceId', influenceId: i.influenceId });
  if (!i.description || i.description.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_DESCRIPTION, message: 'Influence missing description.', field: 'description', influenceId: i.influenceId });
  if (!CANONICAL_INFLUENCE_TYPES.includes(i.influenceType)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_INFLUENCE_TYPE, message: `Invalid influence type: "${i.influenceType}".`, field: 'influenceType', influenceId: i.influenceId });
  _validateProvenance(i.provenance, 'HISTORY', errors);
  return errors;
}

export function validateParadigmShift(s: ParadigmShift): readonly HistoricalValidationError[] {
  const errors: HistoricalValidationError[] = [];
  if (!s.shiftId || s.shiftId.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_SHIFT_ID, message: 'Shift missing ID.', field: 'shiftId', shiftId: s.shiftId });
  if (!s.title || s.title.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_TITLE, message: 'Shift missing title.', field: 'title', shiftId: s.shiftId });
  if (!CANONICAL_PARADIGM_SHIFT_TYPES.includes(s.shiftType)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_PARADIGM_SHIFT_TYPE, message: `Invalid shift type: "${s.shiftType}".`, field: 'shiftType', shiftId: s.shiftId });
  _validateProvenance(s.provenance, 'HISTORY', errors);
  return errors;
}

export function validateHistoricalRegistry(registry: HistoricalRegistry): HistoricalRegistryValidationResult {
  const errors: HistoricalValidationError[] = [];
  if (!registry.registryId || registry.registryId.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_EMPTY_REGISTRY, message: 'Registry missing ID.', field: 'registryId' });
  if (registry.deterministic !== true) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_INVALID_TRACE, message: 'Registry must declare deterministic: true.', field: 'deterministic' });
  if (registry.randomUsed !== false) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_TRACE_RANDOM_USED, message: 'Registry must declare randomUsed: false.', field: 'randomUsed' });
  if (registry.timeDependency !== false) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_TRACE_TIME_DEPENDENCY, message: 'Registry must declare timeDependency: false.', field: 'timeDependency' });

  const seenCtx = new Set<string>();
  for (const c of registry.historicalContexts) { if (seenCtx.has(c.contextId)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_CONTEXT_ID, message: `Duplicate context: "${c.contextId}".`, contextId: c.contextId }); seenCtx.add(c.contextId); }
  const seenDisc = new Set<string>();
  for (const d of registry.discoveries) { if (seenDisc.has(d.discoveryId)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_DISCOVERY_ID, message: `Duplicate discovery: "${d.discoveryId}".`, discoveryId: d.discoveryId }); seenDisc.add(d.discoveryId); }
  const seenEvt = new Set<string>();
  for (const e of registry.timelineEvents) { if (seenEvt.has(e.eventId)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_EVENT_ID, message: `Duplicate event: "${e.eventId}".`, eventId: e.eventId }); seenEvt.add(e.eventId); }
  const seenEvo = new Set<string>();
  for (const e of registry.evolutions) { if (seenEvo.has(e.evolutionId)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_EVOLUTION_ID, message: `Duplicate evolution: "${e.evolutionId}".`, evolutionId: e.evolutionId }); seenEvo.add(e.evolutionId); }
  const seenMil = new Set<string>();
  for (const m of registry.milestones) { if (seenMil.has(m.milestoneId)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_MILESTONE_ID, message: `Duplicate milestone: "${m.milestoneId}".`, milestoneId: m.milestoneId }); seenMil.add(m.milestoneId); }
  const seenInf = new Set<string>();
  for (const i of registry.influenceChains) { if (seenInf.has(i.influenceId)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_INFLUENCE_ID, message: `Duplicate influence: "${i.influenceId}".`, influenceId: i.influenceId }); seenInf.add(i.influenceId); }
  const seenShf = new Set<string>();
  for (const s of registry.paradigmShifts) { if (seenShf.has(s.shiftId)) errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_DUPLICATE_SHIFT_ID, message: `Duplicate shift: "${s.shiftId}".`, shiftId: s.shiftId }); seenShf.add(s.shiftId); }

  for (const c of registry.historicalContexts) errors.push(...validateHistoricalContext(c));
  for (const d of registry.discoveries) errors.push(...validateScientificDiscovery(d));
  for (const e of registry.timelineEvents) errors.push(...validateTimelineEvent(e));
  for (const e of registry.evolutions) errors.push(...validateScientificEvolution(e));
  for (const m of registry.milestones) errors.push(...validateMilestone(m));
  for (const i of registry.influenceChains) errors.push(...validateInfluenceChain(i));
  for (const s of registry.paradigmShifts) errors.push(...validateParadigmShift(s));

  return { valid: errors.length === 0, errors, checkedAt: 'historical_registry_composition' };
}

export function validateHistoricalInput(input: HistoricalInput): HistoricalInputValidationResult {
  const errors: HistoricalValidationError[] = [];
  for (const c of input.historicalContexts) errors.push(...validateHistoricalContext(c));
  for (const d of input.discoveries) errors.push(...validateScientificDiscovery(d));
  for (const e of input.timelineEvents) errors.push(...validateTimelineEvent(e));
  for (const e of input.evolutions) errors.push(...validateScientificEvolution(e));
  for (const m of input.milestones) errors.push(...validateMilestone(m));
  for (const i of input.influenceChains) errors.push(...validateInfluenceChain(i));
  for (const s of input.paradigmShifts) errors.push(...validateParadigmShift(s));
  return { valid: errors.length === 0, errors, checkedAt: 'historical_input_composition' };
}

export function validateNarrativeArtifactWithHistory(artifact: NarrativeArtifactWithHistory): NarrativeArtifactWithHistoryValidationResult {
  const errors: HistoricalValidationError[] = [];
  if (!artifact.narrativeId || artifact.narrativeId.trim() === '') errors.push({ code: HISTORICAL_VALIDATION_CODES.HISTORY_MISSING_CONTEXT_ID, message: 'Artifact missing narrative ID.', field: 'narrativeId' });
  for (const c of artifact.historicalContexts) errors.push(...validateHistoricalContext(c));
  for (const d of artifact.discoveries) errors.push(...validateScientificDiscovery(d));
  for (const e of artifact.timelineEvents) errors.push(...validateTimelineEvent(e));
  for (const e of artifact.evolutions) errors.push(...validateScientificEvolution(e));
  for (const m of artifact.milestones) errors.push(...validateMilestone(m));
  for (const i of artifact.influenceChains) errors.push(...validateInfluenceChain(i));
  for (const s of artifact.paradigmShifts) errors.push(...validateParadigmShift(s));
  return { valid: errors.length === 0, errors, checkedAt: 'narrative_artifact_with_history_composition' };
}
