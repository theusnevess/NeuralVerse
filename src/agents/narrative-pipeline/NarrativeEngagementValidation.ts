/**
 * NV-1700-D6-OPT-06 — Narrative Engagement Validation Layer
 *
 * Deterministic validation for engagement metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  EngagementProvenance,
  CuriosityTrigger,
  EngagementPoint,
  NarrativeTension,
  SurpriseMoment,
  IntellectualReward,
  AttentionRecovery,
  NarrativeMomentum,
  EngagementRegistry,
  EngagementInput,
  NarrativeArtifactWithEngagement,
  EngagementValidationError,
  CuriosityTriggerValidationResult,
  EngagementPointValidationResult,
  NarrativeTensionValidationResult,
  SurpriseMomentValidationResult,
  IntellectualRewardValidationResult,
  AttentionRecoveryValidationResult,
  NarrativeMomentumValidationResult,
  EngagementRegistryValidationResult,
  EngagementInputValidationResult,
  NarrativeArtifactWithEngagementValidationResult,
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
// Validation Error Codes
// ---------------------------------------------------------------------------

export const ENGAGEMENT_VALIDATION_CODES = {
  ENGAGEMENT_DUPLICATE_TRIGGER_ID: 'ENGAGEMENT_DUPLICATE_TRIGGER_ID',
  ENGAGEMENT_DUPLICATE_ENGAGEMENT_ID: 'ENGAGEMENT_DUPLICATE_ENGAGEMENT_ID',
  ENGAGEMENT_DUPLICATE_TENSION_ID: 'ENGAGEMENT_DUPLICATE_TENSION_ID',
  ENGAGEMENT_DUPLICATE_SURPRISE_ID: 'ENGAGEMENT_DUPLICATE_SURPRISE_ID',
  ENGAGEMENT_DUPLICATE_REWARD_ID: 'ENGAGEMENT_DUPLICATE_REWARD_ID',
  ENGAGEMENT_DUPLICATE_RECOVERY_ID: 'ENGAGEMENT_DUPLICATE_RECOVERY_ID',
  ENGAGEMENT_DUPLICATE_MOMENTUM_ID: 'ENGAGEMENT_DUPLICATE_MOMENTUM_ID',
  ENGAGEMENT_INVALID_TRIGGER_TYPE: 'ENGAGEMENT_INVALID_TRIGGER_TYPE',
  ENGAGEMENT_INVALID_ENGAGEMENT_TYPE: 'ENGAGEMENT_INVALID_ENGAGEMENT_TYPE',
  ENGAGEMENT_INVALID_TENSION_TYPE: 'ENGAGEMENT_INVALID_TENSION_TYPE',
  ENGAGEMENT_INVALID_SURPRISE_TYPE: 'ENGAGEMENT_INVALID_SURPRISE_TYPE',
  ENGAGEMENT_INVALID_REWARD_TYPE: 'ENGAGEMENT_INVALID_REWARD_TYPE',
  ENGAGEMENT_INVALID_RECOVERY_TYPE: 'ENGAGEMENT_INVALID_RECOVERY_TYPE',
  ENGAGEMENT_INVALID_MOMENTUM_TYPE: 'ENGAGEMENT_INVALID_MOMENTUM_TYPE',
  ENGAGEMENT_INVALID_GOVERNANCE_STATUS: 'ENGAGEMENT_INVALID_GOVERNANCE_STATUS',
  ENGAGEMENT_MISSING_PROVENANCE: 'ENGAGEMENT_MISSING_PROVENANCE',
  ENGAGEMENT_MISSING_SOURCE: 'ENGAGEMENT_MISSING_SOURCE',
  ENGAGEMENT_MISSING_RATIONALE: 'ENGAGEMENT_MISSING_RATIONALE',
  ENGAGEMENT_MISSING_PROVIDED_BY: 'ENGAGEMENT_MISSING_PROVIDED_BY',
  ENGAGEMENT_MISSING_TRIGGER_ID: 'ENGAGEMENT_MISSING_TRIGGER_ID',
  ENGAGEMENT_MISSING_ENGAGEMENT_ID: 'ENGAGEMENT_MISSING_ENGAGEMENT_ID',
  ENGAGEMENT_MISSING_TENSION_ID: 'ENGAGEMENT_MISSING_TENSION_ID',
  ENGAGEMENT_MISSING_SURPRISE_ID: 'ENGAGEMENT_MISSING_SURPRISE_ID',
  ENGAGEMENT_MISSING_REWARD_ID: 'ENGAGEMENT_MISSING_REWARD_ID',
  ENGAGEMENT_MISSING_RECOVERY_ID: 'ENGAGEMENT_MISSING_RECOVERY_ID',
  ENGAGEMENT_MISSING_MOMENTUM_ID: 'ENGAGEMENT_MISSING_MOMENTUM_ID',
  ENGAGEMENT_MISSING_TITLE: 'ENGAGEMENT_MISSING_TITLE',
  ENGAGEMENT_MISSING_DESCRIPTION: 'ENGAGEMENT_MISSING_DESCRIPTION',
  ENGAGEMENT_MISSING_ARTIFACT_REFERENCE: 'ENGAGEMENT_MISSING_ARTIFACT_REFERENCE',
  ENGAGEMENT_EMPTY_REGISTRY: 'ENGAGEMENT_EMPTY_REGISTRY',
  ENGAGEMENT_INVALID_TRACE: 'ENGAGEMENT_INVALID_TRACE',
  ENGAGEMENT_TRACE_RANDOM_USED: 'ENGAGEMENT_TRACE_RANDOM_USED',
  ENGAGEMENT_TRACE_TIME_DEPENDENCY: 'ENGAGEMENT_TRACE_TIME_DEPENDENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Entity Validators
// ---------------------------------------------------------------------------

function _validateProvenance(
  provenance: EngagementProvenance | undefined,
  prefix: string,
  entityId: string,
  errors: EngagementValidationError[],
): void {
  if (!provenance) {
    errors.push({
      code: `${prefix}_MISSING_PROVENANCE`,
      message: `${prefix} is missing provenance.`,
      field: 'provenance',
    });
    return;
  }

  if (!provenance.source || provenance.source.trim() === '') {
    errors.push({
      code: `${prefix}_MISSING_SOURCE`,
      message: `${prefix} provenance is missing a source.`,
      field: 'provenance.source',
    });
  }

  if (!provenance.rationale || provenance.rationale.trim() === '') {
    errors.push({
      code: `${prefix}_MISSING_RATIONALE`,
      message: `${prefix} provenance is missing a rationale.`,
      field: 'provenance.rationale',
    });
  }

  if (!provenance.providedBy || provenance.providedBy.trim() === '') {
    errors.push({
      code: `${prefix}_MISSING_PROVIDED_BY`,
      message: `${prefix} provenance is missing providedBy.`,
      field: 'provenance.providedBy',
    });
  }
}

export function validateCuriosityTrigger(
  trigger: CuriosityTrigger,
): readonly EngagementValidationError[] {
  const errors: EngagementValidationError[] = [];

  if (!trigger.triggerId || trigger.triggerId.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_TRIGGER_ID,
      message: 'Curiosity trigger is missing a trigger ID.',
      field: 'triggerId',
      triggerId: trigger.triggerId,
    });
  }

  if (!trigger.title || trigger.title.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_TITLE,
      message: 'Curiosity trigger is missing a title.',
      field: 'title',
      triggerId: trigger.triggerId,
    });
  }

  if (!CANONICAL_CURIOSITY_TRIGGER_TYPES.includes(trigger.triggerType)) {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_TRIGGER_TYPE,
      message: `Curiosity trigger has unsupported type: "${trigger.triggerType}".`,
      field: 'triggerType',
      triggerId: trigger.triggerId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(trigger.governanceStatus)) {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_GOVERNANCE_STATUS,
      message: `Curiosity trigger has invalid governance status: "${trigger.governanceStatus}".`,
      field: 'governanceStatus',
      triggerId: trigger.triggerId,
    });
  }

  _validateProvenance(trigger.provenance, 'ENGAGEMENT', trigger.triggerId, errors);

  if (!trigger.relatedArtifactId || trigger.relatedArtifactId.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_ARTIFACT_REFERENCE,
      message: 'Curiosity trigger is missing an artifact reference.',
      field: 'relatedArtifactId',
      triggerId: trigger.triggerId,
    });
  }

  return errors;
}

export function validateEngagementPoint(
  point: EngagementPoint,
): readonly EngagementValidationError[] {
  const errors: EngagementValidationError[] = [];

  if (!point.engagementId || point.engagementId.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_ENGAGEMENT_ID,
      message: 'Engagement point is missing an engagement ID.',
      field: 'engagementId',
      engagementId: point.engagementId,
    });
  }

  if (!point.title || point.title.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_TITLE,
      message: 'Engagement point is missing a title.',
      field: 'title',
      engagementId: point.engagementId,
    });
  }

  if (!CANONICAL_ENGAGEMENT_TYPES.includes(point.engagementType)) {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_ENGAGEMENT_TYPE,
      message: `Engagement point has unsupported type: "${point.engagementType}".`,
      field: 'engagementType',
      engagementId: point.engagementId,
    });
  }

  _validateProvenance(point.provenance, 'ENGAGEMENT', point.engagementId, errors);

  return errors;
}

export function validateNarrativeTension(
  tension: NarrativeTension,
): readonly EngagementValidationError[] {
  const errors: EngagementValidationError[] = [];

  if (!tension.tensionId || tension.tensionId.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_TENSION_ID,
      message: 'Narrative tension is missing a tension ID.',
      field: 'tensionId',
      tensionId: tension.tensionId,
    });
  }

  if (!tension.title || tension.title.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_TITLE,
      message: 'Narrative tension is missing a title.',
      field: 'title',
      tensionId: tension.tensionId,
    });
  }

  if (!CANONICAL_NARRATIVE_TENSION_TYPES.includes(tension.tensionType)) {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_TENSION_TYPE,
      message: `Narrative tension has unsupported type: "${tension.tensionType}".`,
      field: 'tensionType',
      tensionId: tension.tensionId,
    });
  }

  _validateProvenance(tension.provenance, 'ENGAGEMENT', tension.tensionId, errors);

  return errors;
}

export function validateSurpriseMoment(
  surprise: SurpriseMoment,
): readonly EngagementValidationError[] {
  const errors: EngagementValidationError[] = [];

  if (!surprise.surpriseId || surprise.surpriseId.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_SURPRISE_ID,
      message: 'Surprise moment is missing a surprise ID.',
      field: 'surpriseId',
      surpriseId: surprise.surpriseId,
    });
  }

  if (!surprise.title || surprise.title.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_TITLE,
      message: 'Surprise moment is missing a title.',
      field: 'title',
      surpriseId: surprise.surpriseId,
    });
  }

  if (!CANONICAL_SURPRISE_TYPES.includes(surprise.surpriseType)) {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_SURPRISE_TYPE,
      message: `Surprise moment has unsupported type: "${surprise.surpriseType}".`,
      field: 'surpriseType',
      surpriseId: surprise.surpriseId,
    });
  }

  _validateProvenance(surprise.provenance, 'ENGAGEMENT', surprise.surpriseId, errors);

  return errors;
}

export function validateIntellectualReward(
  reward: IntellectualReward,
): readonly EngagementValidationError[] {
  const errors: EngagementValidationError[] = [];

  if (!reward.rewardId || reward.rewardId.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_REWARD_ID,
      message: 'Intellectual reward is missing a reward ID.',
      field: 'rewardId',
      rewardId: reward.rewardId,
    });
  }

  if (!reward.title || reward.title.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_TITLE,
      message: 'Intellectual reward is missing a title.',
      field: 'title',
      rewardId: reward.rewardId,
    });
  }

  if (!CANONICAL_REWARD_TYPES.includes(reward.rewardType)) {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_REWARD_TYPE,
      message: `Intellectual reward has unsupported type: "${reward.rewardType}".`,
      field: 'rewardType',
      rewardId: reward.rewardId,
    });
  }

  _validateProvenance(reward.provenance, 'ENGAGEMENT', reward.rewardId, errors);

  return errors;
}

export function validateAttentionRecovery(
  recovery: AttentionRecovery,
): readonly EngagementValidationError[] {
  const errors: EngagementValidationError[] = [];

  if (!recovery.recoveryId || recovery.recoveryId.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_RECOVERY_ID,
      message: 'Attention recovery is missing a recovery ID.',
      field: 'recoveryId',
      recoveryId: recovery.recoveryId,
    });
  }

  if (!recovery.description || recovery.description.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_DESCRIPTION,
      message: 'Attention recovery is missing a description.',
      field: 'description',
      recoveryId: recovery.recoveryId,
    });
  }

  if (!CANONICAL_ATTENTION_RECOVERY_TYPES.includes(recovery.recoveryType)) {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_RECOVERY_TYPE,
      message: `Attention recovery has unsupported type: "${recovery.recoveryType}".`,
      field: 'recoveryType',
      recoveryId: recovery.recoveryId,
    });
  }

  _validateProvenance(recovery.provenance, 'ENGAGEMENT', recovery.recoveryId, errors);

  return errors;
}

export function validateNarrativeMomentum(
  momentum: NarrativeMomentum,
): readonly EngagementValidationError[] {
  const errors: EngagementValidationError[] = [];

  if (!momentum.momentumId || momentum.momentumId.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_MOMENTUM_ID,
      message: 'Narrative momentum is missing a momentum ID.',
      field: 'momentumId',
      momentumId: momentum.momentumId,
    });
  }

  if (!momentum.description || momentum.description.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_DESCRIPTION,
      message: 'Narrative momentum is missing a description.',
      field: 'description',
      momentumId: momentum.momentumId,
    });
  }

  if (!CANONICAL_MOMENTUM_TYPES.includes(momentum.momentumType)) {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_MOMENTUM_TYPE,
      message: `Narrative momentum has unsupported type: "${momentum.momentumType}".`,
      field: 'momentumType',
      momentumId: momentum.momentumId,
    });
  }

  _validateProvenance(momentum.provenance, 'ENGAGEMENT', momentum.momentumId, errors);

  return errors;
}

// ---------------------------------------------------------------------------
// Registry Validation
// ---------------------------------------------------------------------------

export function validateEngagementRegistry(
  registry: EngagementRegistry,
): EngagementRegistryValidationResult {
  const errors: EngagementValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_EMPTY_REGISTRY,
      message: 'Engagement registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_TRACE,
      message: 'Engagement registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_TRACE_RANDOM_USED,
      message: 'Engagement registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_TRACE_TIME_DEPENDENCY,
      message: 'Engagement registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate IDs
  const seenTriggerIds = new Set<string>();
  for (const trigger of registry.curiosityTriggers) {
    if (seenTriggerIds.has(trigger.triggerId)) {
      errors.push({
        code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_TRIGGER_ID,
        message: `Duplicate trigger ID: "${trigger.triggerId}".`,
        triggerId: trigger.triggerId,
      });
    }
    seenTriggerIds.add(trigger.triggerId);
  }

  const seenEngagementIds = new Set<string>();
  for (const point of registry.engagementPoints) {
    if (seenEngagementIds.has(point.engagementId)) {
      errors.push({
        code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_ENGAGEMENT_ID,
        message: `Duplicate engagement ID: "${point.engagementId}".`,
        engagementId: point.engagementId,
      });
    }
    seenEngagementIds.add(point.engagementId);
  }

  const seenTensionIds = new Set<string>();
  for (const tension of registry.tensions) {
    if (seenTensionIds.has(tension.tensionId)) {
      errors.push({
        code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_TENSION_ID,
        message: `Duplicate tension ID: "${tension.tensionId}".`,
        tensionId: tension.tensionId,
      });
    }
    seenTensionIds.add(tension.tensionId);
  }

  const seenSurpriseIds = new Set<string>();
  for (const surprise of registry.surprises) {
    if (seenSurpriseIds.has(surprise.surpriseId)) {
      errors.push({
        code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_SURPRISE_ID,
        message: `Duplicate surprise ID: "${surprise.surpriseId}".`,
        surpriseId: surprise.surpriseId,
      });
    }
    seenSurpriseIds.add(surprise.surpriseId);
  }

  const seenRewardIds = new Set<string>();
  for (const reward of registry.rewards) {
    if (seenRewardIds.has(reward.rewardId)) {
      errors.push({
        code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_REWARD_ID,
        message: `Duplicate reward ID: "${reward.rewardId}".`,
        rewardId: reward.rewardId,
      });
    }
    seenRewardIds.add(reward.rewardId);
  }

  const seenRecoveryIds = new Set<string>();
  for (const recovery of registry.recoveryEntries) {
    if (seenRecoveryIds.has(recovery.recoveryId)) {
      errors.push({
        code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_RECOVERY_ID,
        message: `Duplicate recovery ID: "${recovery.recoveryId}".`,
        recoveryId: recovery.recoveryId,
      });
    }
    seenRecoveryIds.add(recovery.recoveryId);
  }

  const seenMomentumIds = new Set<string>();
  for (const momentum of registry.momentumEntries) {
    if (seenMomentumIds.has(momentum.momentumId)) {
      errors.push({
        code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_MOMENTUM_ID,
        message: `Duplicate momentum ID: "${momentum.momentumId}".`,
        momentumId: momentum.momentumId,
      });
    }
    seenMomentumIds.add(momentum.momentumId);
  }

  // Validate each entity
  for (const trigger of registry.curiosityTriggers) {
    errors.push(...validateCuriosityTrigger(trigger));
  }

  for (const point of registry.engagementPoints) {
    errors.push(...validateEngagementPoint(point));
  }

  for (const tension of registry.tensions) {
    errors.push(...validateNarrativeTension(tension));
  }

  for (const surprise of registry.surprises) {
    errors.push(...validateSurpriseMoment(surprise));
  }

  for (const reward of registry.rewards) {
    errors.push(...validateIntellectualReward(reward));
  }

  for (const recovery of registry.recoveryEntries) {
    errors.push(...validateAttentionRecovery(recovery));
  }

  for (const momentum of registry.momentumEntries) {
    errors.push(...validateNarrativeMomentum(momentum));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'engagement_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

export function validateEngagementInput(
  input: EngagementInput,
): EngagementInputValidationResult {
  const errors: EngagementValidationError[] = [];

  for (const trigger of input.curiosityTriggers) {
    errors.push(...validateCuriosityTrigger(trigger));
  }

  for (const point of input.engagementPoints) {
    errors.push(...validateEngagementPoint(point));
  }

  for (const tension of input.tensions) {
    errors.push(...validateNarrativeTension(tension));
  }

  for (const surprise of input.surprises) {
    errors.push(...validateSurpriseMoment(surprise));
  }

  for (const reward of input.rewards) {
    errors.push(...validateIntellectualReward(reward));
  }

  for (const recovery of input.recoveryEntries) {
    errors.push(...validateAttentionRecovery(recovery));
  }

  for (const momentum of input.momentumEntries) {
    errors.push(...validateNarrativeMomentum(momentum));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'engagement_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

export function validateNarrativeArtifactWithEngagement(
  artifact: NarrativeArtifactWithEngagement,
): NarrativeArtifactWithEngagementValidationResult {
  const errors: EngagementValidationError[] = [];

  if (!artifact.narrativeId || artifact.narrativeId.trim() === '') {
    errors.push({
      code: ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_TRIGGER_ID,
      message: 'Narrative artifact with engagement is missing a narrative ID.',
      field: 'narrativeId',
    });
  }

  for (const trigger of artifact.curiosityTriggers) {
    errors.push(...validateCuriosityTrigger(trigger));
  }

  for (const point of artifact.engagementPoints) {
    errors.push(...validateEngagementPoint(point));
  }

  for (const tension of artifact.tensions) {
    errors.push(...validateNarrativeTension(tension));
  }

  for (const surprise of artifact.surprises) {
    errors.push(...validateSurpriseMoment(surprise));
  }

  for (const reward of artifact.rewards) {
    errors.push(...validateIntellectualReward(reward));
  }

  for (const recovery of artifact.recoveryEntries) {
    errors.push(...validateAttentionRecovery(recovery));
  }

  for (const momentum of artifact.momentumEntries) {
    errors.push(...validateNarrativeMomentum(momentum));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'narrative_artifact_with_engagement_composition',
  };
}
