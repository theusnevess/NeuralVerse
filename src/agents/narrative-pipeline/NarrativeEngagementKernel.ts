/**
 * NV-1700-D6-OPT-06 — Narrative Emotion, Curiosity & Engagement Modeling Kernel
 *
 * Deterministic orchestration functions for engagement metadata.
 * Produces curiosity triggers, engagement points, tensions, surprises, rewards,
 * recovery entries, momentum entries, and registries.
 *
 * This module never:
 * - Infers learner emotions
 * - Estimates curiosity
 * - Manipulates engagement
 * - Personalizes pacing
 * - Generates motivational text
 * - Performs emotional adaptation
 * - Creates psychological profiles
 * - Calls LLMs
 * - Calls external APIs
 * - Mutates knowledge
 *
 * Engagement metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  EngagementProvenance,
  NarrativeGovernanceStatus,
  CuriosityTriggerType,
  EngagementType,
  NarrativeTensionType,
  SurpriseType,
  IntellectualRewardType,
  AttentionRecoveryType,
  NarrativeMomentumType,
  EngagementStatus,
  CuriosityTrigger,
  EngagementPoint,
  NarrativeTension,
  SurpriseMoment,
  IntellectualReward,
  AttentionRecovery,
  NarrativeMomentum,
  EngagementDecision,
  EngagementTrace,
  EngagementRegistry,
  EngagementRegistryMetadata,
  EngagementInput,
  NarrativeUnitType,
  NarrativeMode,
  NarrativeDomain,
  NarrativeStatus,
  NarrativeProvenance,
  NarrativeArtifactWithEngagement,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_CURIOSITY_TRIGGER_TYPES,
  CANONICAL_ENGAGEMENT_TYPES,
  CANONICAL_NARRATIVE_TENSION_TYPES,
  CANONICAL_SURPRISE_TYPES,
  CANONICAL_REWARD_TYPES,
  CANONICAL_ATTENTION_RECOVERY_TYPES,
  CANONICAL_MOMENTUM_TYPES,
  CANONICAL_ENGAGEMENT_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

// ---------------------------------------------------------------------------
// Engagement Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes engagement provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityProvenance(params: {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): EngagementProvenance {
  return {
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Trigger Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity trigger from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityTrigger(params: {
  readonly triggerId: string;
  readonly triggerType: CuriosityTriggerType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}): CuriosityTrigger {
  return {
    triggerId: params.triggerId,
    triggerType: params.triggerType,
    title: params.title,
    description: params.description,
    relatedArtifactId: params.relatedArtifactId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Engagement Point Composition
// ---------------------------------------------------------------------------

/**
 * Composes an engagement point from provided parameters.
 * Pure function. No side effects.
 */
export function composeEngagementPoint(params: {
  readonly engagementId: string;
  readonly engagementType: EngagementType;
  readonly title: string;
  readonly description: string;
  readonly relatedStageId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}): EngagementPoint {
  return {
    engagementId: params.engagementId,
    engagementType: params.engagementType,
    title: params.title,
    description: params.description,
    relatedStageId: params.relatedStageId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Narrative Tension Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative tension from provided parameters.
 * Pure function. No side effects.
 */
export function composeNarrativeTension(params: {
  readonly tensionId: string;
  readonly tensionType: NarrativeTensionType;
  readonly title: string;
  readonly description: string;
  readonly resolutionReferenceId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}): NarrativeTension {
  return {
    tensionId: params.tensionId,
    tensionType: params.tensionType,
    title: params.title,
    description: params.description,
    resolutionReferenceId: params.resolutionReferenceId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Surprise Moment Composition
// ---------------------------------------------------------------------------

/**
 * Composes a surprise moment from provided parameters.
 * Pure function. No side effects.
 */
export function composeSurpriseMoment(params: {
  readonly surpriseId: string;
  readonly surpriseType: SurpriseType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}): SurpriseMoment {
  return {
    surpriseId: params.surpriseId,
    surpriseType: params.surpriseType,
    title: params.title,
    description: params.description,
    relatedArtifactId: params.relatedArtifactId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Intellectual Reward Composition
// ---------------------------------------------------------------------------

/**
 * Composes an intellectual reward from provided parameters.
 * Pure function. No side effects.
 */
export function composeIntellectualReward(params: {
  readonly rewardId: string;
  readonly rewardType: IntellectualRewardType;
  readonly title: string;
  readonly description: string;
  readonly relatedConceptId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}): IntellectualReward {
  return {
    rewardId: params.rewardId,
    rewardType: params.rewardType,
    title: params.title,
    description: params.description,
    relatedConceptId: params.relatedConceptId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Attention Recovery Composition
// ---------------------------------------------------------------------------

/**
 * Composes an attention recovery from provided parameters.
 * Pure function. No side effects.
 */
export function composeAttentionRecovery(params: {
  readonly recoveryId: string;
  readonly recoveryType: AttentionRecoveryType;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}): AttentionRecovery {
  return {
    recoveryId: params.recoveryId,
    recoveryType: params.recoveryType,
    description: params.description,
    relatedArtifactId: params.relatedArtifactId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Narrative Momentum Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative momentum from provided parameters.
 * Pure function. No side effects.
 */
export function composeNarrativeMomentum(params: {
  readonly momentumId: string;
  readonly momentumType: NarrativeMomentumType;
  readonly description: string;
  readonly relatedFlowId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: EngagementProvenance;
}): NarrativeMomentum {
  return {
    momentumId: params.momentumId,
    momentumType: params.momentumType,
    description: params.description,
    relatedFlowId: params.relatedFlowId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Engagement Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes an engagement decision from validation results.
 * Pure function. No side effects.
 */
function _composeEngagementDecision(
  engagementId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): EngagementDecision {
  return {
    decisionId: `_decision_${engagementId}`,
    engagementId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Engagement Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes an engagement trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeEngagementTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly EngagementDecision[];
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly curiosityCount: number;
  readonly engagementCount: number;
  readonly tensionCount: number;
  readonly surpriseCount: number;
  readonly rewardCount: number;
  readonly attentionRecoveryCount: number;
  readonly momentumCount: number;
}): EngagementTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    curiosityCount: params.curiosityCount,
    engagementCount: params.engagementCount,
    tensionCount: params.tensionCount,
    surpriseCount: params.surpriseCount,
    rewardCount: params.rewardCount,
    attentionRecoveryCount: params.attentionRecoveryCount,
    momentumCount: params.momentumCount,
    registryVersion: params.registryVersion,
    pipelineVersion: params.pipelineVersion,
    compositionMetadata: {},
    deterministicMetadata: {},
    deterministic: true,
    generatedFrom: 'deterministic_engagement_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Engagement Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative artifact with applied engagement.
 * Pure function. No side effects.
 */
export function composeNarrativeArtifactWithEngagement(params: {
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
  readonly curiosityTriggers: readonly CuriosityTrigger[];
  readonly engagementPoints: readonly EngagementPoint[];
  readonly tensions: readonly NarrativeTension[];
  readonly surprises: readonly SurpriseMoment[];
  readonly rewards: readonly IntellectualReward[];
  readonly recoveryEntries: readonly AttentionRecovery[];
  readonly momentumEntries: readonly NarrativeMomentum[];
}): NarrativeArtifactWithEngagement {
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
    curiosityTriggers: [...params.curiosityTriggers],
    engagementPoints: [...params.engagementPoints],
    tensions: [...params.tensions],
    surprises: [...params.surprises],
    rewards: [...params.rewards],
    recoveryEntries: [...params.recoveryEntries],
    momentumEntries: [...params.momentumEntries],
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

function _compareTrigger(a: CuriosityTrigger, b: CuriosityTrigger): number {
  if (a.triggerId < b.triggerId) return -1;
  if (a.triggerId > b.triggerId) return 1;
  if (a.triggerType < b.triggerType) return -1;
  if (a.triggerType > b.triggerType) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareEngagement(a: EngagementPoint, b: EngagementPoint): number {
  if (a.engagementId < b.engagementId) return -1;
  if (a.engagementId > b.engagementId) return 1;
  if (a.engagementType < b.engagementType) return -1;
  if (a.engagementType > b.engagementType) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareTension(a: NarrativeTension, b: NarrativeTension): number {
  if (a.tensionId < b.tensionId) return -1;
  if (a.tensionId > b.tensionId) return 1;
  if (a.tensionType < b.tensionType) return -1;
  if (a.tensionType > b.tensionType) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareSurprise(a: SurpriseMoment, b: SurpriseMoment): number {
  if (a.surpriseId < b.surpriseId) return -1;
  if (a.surpriseId > b.surpriseId) return 1;
  if (a.surpriseType < b.surpriseType) return -1;
  if (a.surpriseType > b.surpriseType) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareReward(a: IntellectualReward, b: IntellectualReward): number {
  if (a.rewardId < b.rewardId) return -1;
  if (a.rewardId > b.rewardId) return 1;
  if (a.rewardType < b.rewardType) return -1;
  if (a.rewardType > b.rewardType) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareRecovery(a: AttentionRecovery, b: AttentionRecovery): number {
  if (a.recoveryId < b.recoveryId) return -1;
  if (a.recoveryId > b.recoveryId) return 1;
  if (a.recoveryType < b.recoveryType) return -1;
  if (a.recoveryType > b.recoveryType) return 1;
  return 0;
}

function _compareMomentum(a: NarrativeMomentum, b: NarrativeMomentum): number {
  if (a.momentumId < b.momentumId) return -1;
  if (a.momentumId > b.momentumId) return 1;
  if (a.momentumType < b.momentumType) return -1;
  if (a.momentumType > b.momentumType) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Engagement Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes an engagement registry from input data.
 * Pure function. No side effects.
 */
export function composeEngagementRegistry(
  curiosityTriggers: readonly CuriosityTrigger[],
  engagementPoints: readonly EngagementPoint[],
  tensions: readonly NarrativeTension[],
  surprises: readonly SurpriseMoment[],
  rewards: readonly IntellectualReward[],
  recoveryEntries: readonly AttentionRecovery[],
  momentumEntries: readonly NarrativeMomentum[],
): EngagementRegistry {
  const sortedTriggers = [...curiosityTriggers].sort(_compareTrigger);
  const sortedEngagement = [...engagementPoints].sort(_compareEngagement);
  const sortedTensions = [...tensions].sort(_compareTension);
  const sortedSurprises = [...surprises].sort(_compareSurprise);
  const sortedRewards = [...rewards].sort(_compareReward);
  const sortedRecovery = [...recoveryEntries].sort(_compareRecovery);
  const sortedMomentum = [...momentumEntries].sort(_compareMomentum);

  const metadata: EngagementRegistryMetadata = {
    registryId: `_engagement_registry_${sortedTriggers.length}`,
    curiosityCount: sortedTriggers.length,
    engagementCount: sortedEngagement.length,
    tensionCount: sortedTensions.length,
    surpriseCount: sortedSurprises.length,
    rewardCount: sortedRewards.length,
    attentionRecoveryCount: sortedRecovery.length,
    momentumCount: sortedMomentum.length,
  };

  return {
    registryId: metadata.registryId,
    curiosityTriggers: sortedTriggers,
    engagementPoints: sortedEngagement,
    tensions: sortedTensions,
    surprises: sortedSurprises,
    rewards: sortedRewards,
    recoveryEntries: sortedRecovery,
    momentumEntries: sortedMomentum,
    metadata,
    trace: {
      traceId: `_engagement_trace_${sortedTriggers.length}`,
      decisionCount: 0,
      validationCount: 0,
      curiosityCount: sortedTriggers.length,
      engagementCount: sortedEngagement.length,
      tensionCount: sortedTensions.length,
      surpriseCount: sortedSurprises.length,
      rewardCount: sortedRewards.length,
      attentionRecoveryCount: sortedRecovery.length,
      momentumCount: sortedMomentum.length,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      compositionMetadata: {},
      deterministicMetadata: {},
      deterministic: true,
      generatedFrom: 'deterministic_engagement_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_engagement_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Engagement Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes an engagement registry from an input.
 * Pure function. No side effects.
 */
export function composeEngagementRegistryFromInput(
  input: EngagementInput,
): EngagementRegistry {
  return composeEngagementRegistry(
    input.curiosityTriggers,
    input.engagementPoints,
    input.tensions,
    input.surprises,
    input.rewards,
    input.recoveryEntries,
    input.momentumEntries,
  );
}

// ---------------------------------------------------------------------------
// Narrative Engagement Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete engagement registry from an input.
 * Pure function. No side effects.
 */
export function composeNarrativeEngagement(
  input: EngagementInput,
): EngagementRegistry {
  const decisions = input.curiosityTriggers.map((trigger) => {
    const errors = _validateTriggerForDecision(trigger);
    return _composeEngagementDecision(trigger.triggerId, errors.length === 0, errors);
  });

  const registry = composeEngagementRegistry(
    input.curiosityTriggers,
    input.engagementPoints,
    input.tensions,
    input.surprises,
    input.rewards,
    input.recoveryEntries,
    input.momentumEntries,
  );

  return {
    ...registry,
    trace: composeEngagementTrace({
      traceId: `_engagement_trace_${input.curiosityTriggers.length}`,
      decisions,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      curiosityCount: input.curiosityTriggers.length,
      engagementCount: input.engagementPoints.length,
      tensionCount: input.tensions.length,
      surpriseCount: input.surprises.length,
      rewardCount: input.rewards.length,
      attentionRecoveryCount: input.recoveryEntries.length,
      momentumCount: input.momentumEntries.length,
    }),
  };
}

/**
 * Validates a curiosity trigger for decision composition.
 * Pure function. No side effects.
 */
function _validateTriggerForDecision(
  trigger: CuriosityTrigger,
): readonly string[] {
  const errors: string[] = [];

  if (!trigger.triggerId || trigger.triggerId.trim() === '') {
    errors.push('ENGAGEMENT_MISSING_TRIGGER_ID');
  }

  if (!trigger.title || trigger.title.trim() === '') {
    errors.push('ENGAGEMENT_MISSING_TITLE');
  }

  if (!CANONICAL_CURIOSITY_TRIGGER_TYPES.includes(trigger.triggerType)) {
    errors.push('ENGAGEMENT_INVALID_TRIGGER_TYPE');
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(trigger.governanceStatus)) {
    errors.push('ENGAGEMENT_INVALID_GOVERNANCE_STATUS');
  }

  if (!trigger.provenance) {
    errors.push('ENGAGEMENT_MISSING_PROVENANCE');
  }

  if (!trigger.relatedArtifactId || trigger.relatedArtifactId.trim() === '') {
    errors.push('ENGAGEMENT_MISSING_ARTIFACT_REFERENCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedCuriosityTriggerType(
  triggerType: string,
): triggerType is CuriosityTriggerType {
  return CANONICAL_CURIOSITY_TRIGGER_TYPES.includes(triggerType as CuriosityTriggerType);
}

export function isSupportedEngagementType(
  engagementType: string,
): engagementType is EngagementType {
  return CANONICAL_ENGAGEMENT_TYPES.includes(engagementType as EngagementType);
}

export function isSupportedNarrativeTensionType(
  tensionType: string,
): tensionType is NarrativeTensionType {
  return CANONICAL_NARRATIVE_TENSION_TYPES.includes(tensionType as NarrativeTensionType);
}

export function isSupportedSurpriseType(
  surpriseType: string,
): surpriseType is SurpriseType {
  return CANONICAL_SURPRISE_TYPES.includes(surpriseType as SurpriseType);
}

export function isSupportedIntellectualRewardType(
  rewardType: string,
): rewardType is IntellectualRewardType {
  return CANONICAL_REWARD_TYPES.includes(rewardType as IntellectualRewardType);
}

export function isSupportedAttentionRecoveryType(
  recoveryType: string,
): recoveryType is AttentionRecoveryType {
  return CANONICAL_ATTENTION_RECOVERY_TYPES.includes(recoveryType as AttentionRecoveryType);
}

export function isSupportedNarrativeMomentumType(
  momentumType: string,
): momentumType is NarrativeMomentumType {
  return CANONICAL_MOMENTUM_TYPES.includes(momentumType as NarrativeMomentumType);
}

export function isSupportedEngagementStatus(
  status: string,
): status is EngagementStatus {
  return CANONICAL_ENGAGEMENT_STATUS.includes(status as EngagementStatus);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalCuriosityTriggerTypes(): readonly CuriosityTriggerType[] {
  return CANONICAL_CURIOSITY_TRIGGER_TYPES;
}

export function getCanonicalEngagementTypes(): readonly EngagementType[] {
  return CANONICAL_ENGAGEMENT_TYPES;
}

export function getCanonicalNarrativeTensionTypes(): readonly NarrativeTensionType[] {
  return CANONICAL_NARRATIVE_TENSION_TYPES;
}

export function getCanonicalSurpriseTypes(): readonly SurpriseType[] {
  return CANONICAL_SURPRISE_TYPES;
}

export function getCanonicalIntellectualRewardTypes(): readonly IntellectualRewardType[] {
  return CANONICAL_REWARD_TYPES;
}

export function getCanonicalAttentionRecoveryTypes(): readonly AttentionRecoveryType[] {
  return CANONICAL_ATTENTION_RECOVERY_TYPES;
}

export function getCanonicalNarrativeMomentumTypes(): readonly NarrativeMomentumType[] {
  return CANONICAL_MOMENTUM_TYPES;
}

export function getCanonicalEngagementStatuses(): readonly EngagementStatus[] {
  return CANONICAL_ENGAGEMENT_STATUS;
}
