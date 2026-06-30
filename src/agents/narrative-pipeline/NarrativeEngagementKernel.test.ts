/**
 * NV-1700-D6-OPT-06 — Narrative Emotion, Curiosity & Engagement Modeling Test Suite
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  EngagementProvenance,
  CuriosityTrigger,
  EngagementPoint,
  NarrativeTension,
  SurpriseMoment,
  IntellectualReward,
  AttentionRecovery,
  NarrativeMomentum,
  EngagementInput,
  EngagementRegistry,
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
} from './NarrativeAgentContract.ts';

import {
  composeCuriosityProvenance,
  composeCuriosityTrigger,
  composeEngagementPoint,
  composeNarrativeTension,
  composeSurpriseMoment,
  composeIntellectualReward,
  composeAttentionRecovery,
  composeNarrativeMomentum,
  composeEngagementTrace,
  composeEngagementRegistry,
  composeEngagementRegistryFromInput,
  composeNarrativeEngagement,
  composeNarrativeArtifactWithEngagement,
  isSupportedCuriosityTriggerType,
  isSupportedEngagementType,
  isSupportedNarrativeTensionType,
  isSupportedSurpriseType,
  isSupportedIntellectualRewardType,
  isSupportedAttentionRecoveryType,
  isSupportedNarrativeMomentumType,
  isSupportedEngagementStatus,
  getCanonicalCuriosityTriggerTypes,
  getCanonicalEngagementTypes,
  getCanonicalNarrativeTensionTypes,
  getCanonicalSurpriseTypes,
  getCanonicalIntellectualRewardTypes,
  getCanonicalAttentionRecoveryTypes,
  getCanonicalNarrativeMomentumTypes,
  getCanonicalEngagementStatuses,
} from './NarrativeEngagementKernel.ts';

import {
  validateCuriosityTrigger,
  validateEngagementPoint,
  validateNarrativeTension,
  validateSurpriseMoment,
  validateIntellectualReward,
  validateAttentionRecovery,
  validateNarrativeMomentum,
  validateEngagementRegistry,
  validateEngagementInput,
  validateNarrativeArtifactWithEngagement,
  ENGAGEMENT_VALIDATION_CODES,
} from './NarrativeEngagementValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: EngagementProvenance = {
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  providedBy: 'NeuralVerse Team',
  rationale: 'Core engagement modeling.',
};

const VALID_TRIGGER: CuriosityTrigger = {
  triggerId: 'trigger-001',
  triggerType: 'unexpected_result',
  title: 'Counterintuitive Accuracy',
  description: 'Small networks sometimes outperform large ones.',
  relatedArtifactId: 'knowledge-001',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_TRIGGER_2: CuriosityTrigger = {
  triggerId: 'trigger-002',
  triggerType: 'hidden_pattern',
  title: 'Emergent Behavior',
  description: 'Complex behavior from simple rules.',
  relatedArtifactId: 'knowledge-002',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_POINT: EngagementPoint = {
  engagementId: 'engagement-001',
  engagementType: 'active_prediction',
  title: 'Predict the Outcome',
  description: 'What happens when we increase depth?',
  relatedStageId: 'stage-001',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_POINT_2: EngagementPoint = {
  engagementId: 'engagement-002',
  engagementType: 'mental_simulation',
  title: 'Visualize the Process',
  description: 'Imagine the gradient flowing backward.',
  relatedStageId: 'stage-002',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_TENSION: NarrativeTension = {
  tensionId: 'tension-001',
  tensionType: 'unanswered_question',
  title: 'Why Does It Work?',
  description: 'The mechanism remains unclear.',
  resolutionReferenceId: 'knowledge-003',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_TENSION_2: NarrativeTension = {
  tensionId: 'tension-002',
  tensionType: 'engineering_tradeoff',
  title: 'Speed vs Accuracy',
  description: 'Optimization creates inherent tension.',
  resolutionReferenceId: 'knowledge-004',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_SURPRISE: SurpriseMoment = {
  surpriseId: 'surprise-001',
  surpriseType: 'counterintuitive',
  title: 'Dropout Paradox',
  description: 'Removing neurons improves performance.',
  relatedArtifactId: 'knowledge-005',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_SURPRISE_2: SurpriseMoment = {
  surpriseId: 'surprise-002',
  surpriseType: 'performance',
  title: 'GPU Acceleration',
  description: '100x speedup from parallel computation.',
  relatedArtifactId: 'knowledge-006',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_REWARD: IntellectualReward = {
  rewardId: 'reward-001',
  rewardType: 'conceptual_clarity',
  title: 'Understanding Convergence',
  description: 'Why gradient descent finds good solutions.',
  relatedConceptId: 'concept-001',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_REWARD_2: IntellectualReward = {
  rewardId: 'reward-002',
  rewardType: 'pattern_recognition',
  title: 'Seeing the Pattern',
  description: 'Recognizing common architectures.',
  relatedConceptId: 'concept-002',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_RECOVERY: AttentionRecovery = {
  recoveryId: 'recovery-001',
  recoveryType: 'analogy',
  description: 'Return to familiar territory.',
  relatedArtifactId: 'knowledge-007',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_RECOVERY_2: AttentionRecovery = {
  recoveryId: 'recovery-002',
  recoveryType: 'visualization',
  description: 'Visual refresh.',
  relatedArtifactId: 'knowledge-008',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_MOMENTUM: NarrativeMomentum = {
  momentumId: 'momentum-001',
  momentumType: 'accelerating',
  description: 'Increasing pace toward climax.',
  relatedFlowId: 'flow-001',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_MOMENTUM_2: NarrativeMomentum = {
  momentumId: 'momentum-002',
  momentumType: 'deepening',
  description: 'Going deeper into the topic.',
  relatedFlowId: 'flow-002',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_INPUT: EngagementInput = {
  curiosityTriggers: [VALID_TRIGGER, VALID_TRIGGER_2],
  engagementPoints: [VALID_POINT, VALID_POINT_2],
  tensions: [VALID_TENSION, VALID_TENSION_2],
  surprises: [VALID_SURPRISE, VALID_SURPRISE_2],
  rewards: [VALID_REWARD, VALID_REWARD_2],
  recoveryEntries: [VALID_RECOVERY, VALID_RECOVERY_2],
  momentumEntries: [VALID_MOMENTUM, VALID_MOMENTUM_2],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Engagement Kernel — Composition', () => {
  it('should compose valid provenance', () => {
    const p = composeCuriosityProvenance({ source: 'Team', governanceStatus: 'canonical', providedBy: 'Team', rationale: 'Core.' });
    assert.equal(p.source, 'Team');
    assert.equal(p.governanceStatus, 'canonical');
  });

  it('should compose valid curiosity trigger', () => {
    const t = composeCuriosityTrigger({ triggerId: 't-1', triggerType: 'unexpected_result', title: 'T', description: 'D.', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VALID_PROVENANCE });
    assert.equal(t.triggerId, 't-1');
    assert.equal(t.triggerType, 'unexpected_result');
  });

  it('should compose valid engagement point', () => {
    const p = composeEngagementPoint({ engagementId: 'e-1', engagementType: 'active_prediction', title: 'T', description: 'D.', relatedStageId: 's-1', governanceStatus: 'canonical', provenance: VALID_PROVENANCE });
    assert.equal(p.engagementId, 'e-1');
    assert.equal(p.engagementType, 'active_prediction');
  });

  it('should compose valid narrative tension', () => {
    const t = composeNarrativeTension({ tensionId: 't-1', tensionType: 'unanswered_question', title: 'T', description: 'D.', resolutionReferenceId: 'k-1', governanceStatus: 'canonical', provenance: VALID_PROVENANCE });
    assert.equal(t.tensionId, 't-1');
    assert.equal(t.tensionType, 'unanswered_question');
  });

  it('should compose valid surprise moment', () => {
    const s = composeSurpriseMoment({ surpriseId: 's-1', surpriseType: 'counterintuitive', title: 'T', description: 'D.', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VALID_PROVENANCE });
    assert.equal(s.surpriseId, 's-1');
    assert.equal(s.surpriseType, 'counterintuitive');
  });

  it('should compose valid intellectual reward', () => {
    const r = composeIntellectualReward({ rewardId: 'r-1', rewardType: 'conceptual_clarity', title: 'T', description: 'D.', relatedConceptId: 'c-1', governanceStatus: 'canonical', provenance: VALID_PROVENANCE });
    assert.equal(r.rewardId, 'r-1');
    assert.equal(r.rewardType, 'conceptual_clarity');
  });

  it('should compose valid attention recovery', () => {
    const r = composeAttentionRecovery({ recoveryId: 'r-1', recoveryType: 'analogy', description: 'D.', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VALID_PROVENANCE });
    assert.equal(r.recoveryId, 'r-1');
    assert.equal(r.recoveryType, 'analogy');
  });

  it('should compose valid narrative momentum', () => {
    const m = composeNarrativeMomentum({ momentumId: 'm-1', momentumType: 'accelerating', description: 'D.', relatedFlowId: 'f-1', governanceStatus: 'canonical', provenance: VALID_PROVENANCE });
    assert.equal(m.momentumId, 'm-1');
    assert.equal(m.momentumType, 'accelerating');
  });

  it('should compose valid registry', () => {
    const registry = composeEngagementRegistry([VALID_TRIGGER], [VALID_POINT], [VALID_TENSION], [VALID_SURPRISE], [VALID_REWARD], [VALID_RECOVERY], [VALID_MOMENTUM]);
    const result = validateEngagementRegistry(registry);
    assert.equal(result.valid, true);
  });

  it('should validate all entities with no errors', () => {
    assert.deepStrictEqual(validateCuriosityTrigger(VALID_TRIGGER), []);
    assert.deepStrictEqual(validateEngagementPoint(VALID_POINT), []);
    assert.deepStrictEqual(validateNarrativeTension(VALID_TENSION), []);
    assert.deepStrictEqual(validateSurpriseMoment(VALID_SURPRISE), []);
    assert.deepStrictEqual(validateIntellectualReward(VALID_REWARD), []);
    assert.deepStrictEqual(validateAttentionRecovery(VALID_RECOVERY), []);
    assert.deepStrictEqual(validateNarrativeMomentum(VALID_MOMENTUM), []);
  });

  it('should validate engagement input', () => {
    const result = validateEngagementInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should compose valid artifact with engagement', () => {
    const artifact = composeNarrativeArtifactWithEngagement({
      narrativeId: 'n-1', title: 'T', unitType: 'lesson_opening', narrativeMode: 'engineering_problem', domain: 'deep_learning', status: 'published',
      canonicalKnowledgeId: 'k-1', curriculumNodeId: 'c-1', lessonId: 'l-1', laboratoryId: '', sequenceOrder: 1, summary: 'S.', tags: [], provenance: VALID_PROVENANCE,
      curiosityTriggers: [VALID_TRIGGER], engagementPoints: [VALID_POINT], tensions: [VALID_TENSION], surprises: [VALID_SURPRISE], rewards: [VALID_REWARD], recoveryEntries: [VALID_RECOVERY], momentumEntries: [VALID_MOMENTUM],
    });
    assert.equal(artifact.narrativeId, 'n-1');
    assert.equal(artifact.curiosityTriggers.length, 1);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Engagement Kernel — Registry', () => {
  it('should detect duplicate trigger IDs', () => {
    const registry = composeEngagementRegistry([VALID_TRIGGER, VALID_TRIGGER], [], [], [], [], [], []);
    const result = validateEngagementRegistry(registry);
    assert.ok(result.errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_TRIGGER_ID));
  });

  it('should detect duplicate engagement IDs', () => {
    const registry = composeEngagementRegistry([], [VALID_POINT, VALID_POINT], [], [], [], [], []);
    const result = validateEngagementRegistry(registry);
    assert.ok(result.errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_ENGAGEMENT_ID));
  });

  it('should detect duplicate tension IDs', () => {
    const registry = composeEngagementRegistry([], [], [VALID_TENSION, VALID_TENSION], [], [], [], []);
    const result = validateEngagementRegistry(registry);
    assert.ok(result.errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_TENSION_ID));
  });

  it('should detect duplicate surprise IDs', () => {
    const registry = composeEngagementRegistry([], [], [], [VALID_SURPRISE, VALID_SURPRISE], [], [], []);
    const result = validateEngagementRegistry(registry);
    assert.ok(result.errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_SURPRISE_ID));
  });

  it('should detect duplicate reward IDs', () => {
    const registry = composeEngagementRegistry([], [], [], [], [VALID_REWARD, VALID_REWARD], [], []);
    const result = validateEngagementRegistry(registry);
    assert.ok(result.errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_REWARD_ID));
  });

  it('should detect duplicate recovery IDs', () => {
    const registry = composeEngagementRegistry([], [], [], [], [], [VALID_RECOVERY, VALID_RECOVERY], []);
    const result = validateEngagementRegistry(registry);
    assert.ok(result.errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_RECOVERY_ID));
  });

  it('should detect duplicate momentum IDs', () => {
    const registry = composeEngagementRegistry([], [], [], [], [], [], [VALID_MOMENTUM, VALID_MOMENTUM]);
    const result = validateEngagementRegistry(registry);
    assert.ok(result.errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_DUPLICATE_MOMENTUM_ID));
  });

  it('should sort deterministically by triggerId', () => {
    const t3 = { ...VALID_TRIGGER, triggerId: 'trigger-003' };
    const t1 = { ...VALID_TRIGGER, triggerId: 'trigger-001' };
    const t2 = { ...VALID_TRIGGER, triggerId: 'trigger-002' };
    const registry = composeEngagementRegistry([t3, t1, t2], [], [], [], [], [], []);
    assert.equal(registry.curiosityTriggers[0].triggerId, 'trigger-001');
    assert.equal(registry.curiosityTriggers[1].triggerId, 'trigger-002');
    assert.equal(registry.curiosityTriggers[2].triggerId, 'trigger-003');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Engagement Kernel — Validation', () => {
  it('should detect invalid trigger type', () => {
    const errors = validateCuriosityTrigger({ ...VALID_TRIGGER, triggerType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_TRIGGER_TYPE));
  });

  it('should detect invalid engagement type', () => {
    const errors = validateEngagementPoint({ ...VALID_POINT, engagementType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_ENGAGEMENT_TYPE));
  });

  it('should detect invalid tension type', () => {
    const errors = validateNarrativeTension({ ...VALID_TENSION, tensionType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_TENSION_TYPE));
  });

  it('should detect invalid surprise type', () => {
    const errors = validateSurpriseMoment({ ...VALID_SURPRISE, surpriseType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_SURPRISE_TYPE));
  });

  it('should detect invalid reward type', () => {
    const errors = validateIntellectualReward({ ...VALID_REWARD, rewardType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_REWARD_TYPE));
  });

  it('should detect invalid recovery type', () => {
    const errors = validateAttentionRecovery({ ...VALID_RECOVERY, recoveryType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_RECOVERY_TYPE));
  });

  it('should detect invalid momentum type', () => {
    const errors = validateNarrativeMomentum({ ...VALID_MOMENTUM, momentumType: 'unsupported' as any });
    assert.ok(errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_INVALID_MOMENTUM_TYPE));
  });

  it('should detect missing provenance', () => {
    const errors = validateCuriosityTrigger({ ...VALID_TRIGGER, provenance: undefined as any });
    assert.ok(errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_PROVENANCE));
  });

  it('should detect missing source', () => {
    const errors = validateCuriosityTrigger({ ...VALID_TRIGGER, provenance: { ...VALID_PROVENANCE, source: '' } });
    assert.ok(errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_SOURCE));
  });

  it('should detect missing rationale', () => {
    const errors = validateCuriosityTrigger({ ...VALID_TRIGGER, provenance: { ...VALID_PROVENANCE, rationale: '' } });
    assert.ok(errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_RATIONALE));
  });

  it('should detect missing providedBy', () => {
    const errors = validateCuriosityTrigger({ ...VALID_TRIGGER, provenance: { ...VALID_PROVENANCE, providedBy: '' } });
    assert.ok(errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_PROVIDED_BY));
  });

  it('should detect missing artifact reference', () => {
    const errors = validateCuriosityTrigger({ ...VALID_TRIGGER, relatedArtifactId: '' });
    assert.ok(errors.find((e) => e.code === ENGAGEMENT_VALIDATION_CODES.ENGAGEMENT_MISSING_ARTIFACT_REFERENCE));
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Engagement Kernel — Determinism', () => {
  it('should produce identical output (100 iterations)', () => {
    const results: ReturnType<typeof composeNarrativeEngagement>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeNarrativeEngagement(VALID_INPUT));
    }
    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].curiosityTriggers, results[i].curiosityTriggers);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Engagement Kernel — Immutability', () => {
  it('should not mutate input', () => {
    const original = VALID_TRIGGER.triggerId;
    composeNarrativeEngagement(VALID_INPUT);
    assert.equal(VALID_TRIGGER.triggerId, original);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Engagement Kernel — Helper Functions', () => {
  it('should return canonical types', () => {
    assert.equal(getCanonicalCuriosityTriggerTypes().length, 10);
    assert.equal(getCanonicalEngagementTypes().length, 10);
    assert.equal(getCanonicalNarrativeTensionTypes().length, 10);
    assert.equal(getCanonicalSurpriseTypes().length, 10);
    assert.equal(getCanonicalIntellectualRewardTypes().length, 10);
    assert.equal(getCanonicalAttentionRecoveryTypes().length, 10);
    assert.equal(getCanonicalNarrativeMomentumTypes().length, 10);
    assert.equal(getCanonicalEngagementStatuses().length, 6);
  });

  it('should validate type support', () => {
    assert.equal(isSupportedCuriosityTriggerType('unexpected_result'), true);
    assert.equal(isSupportedCuriosityTriggerType('unsupported'), false);
    assert.equal(isSupportedEngagementType('active_prediction'), true);
    assert.equal(isSupportedEngagementType('unsupported'), false);
    assert.equal(isSupportedNarrativeTensionType('unanswered_question'), true);
    assert.equal(isSupportedNarrativeTensionType('unsupported'), false);
    assert.equal(isSupportedSurpriseType('counterintuitive'), true);
    assert.equal(isSupportedSurpriseType('unsupported'), false);
    assert.equal(isSupportedIntellectualRewardType('conceptual_clarity'), true);
    assert.equal(isSupportedIntellectualRewardType('unsupported'), false);
    assert.equal(isSupportedAttentionRecoveryType('analogy'), true);
    assert.equal(isSupportedAttentionRecoveryType('unsupported'), false);
    assert.equal(isSupportedNarrativeMomentumType('accelerating'), true);
    assert.equal(isSupportedNarrativeMomentumType('unsupported'), false);
    assert.equal(isSupportedEngagementStatus('draft'), true);
    assert.equal(isSupportedEngagementStatus('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Engagement Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 curiosity trigger types', () => { assert.equal(CANONICAL_CURIOSITY_TRIGGER_TYPES.length, 10); });
  it('should have exactly 10 engagement types', () => { assert.equal(CANONICAL_ENGAGEMENT_TYPES.length, 10); });
  it('should have exactly 10 tension types', () => { assert.equal(CANONICAL_NARRATIVE_TENSION_TYPES.length, 10); });
  it('should have exactly 10 surprise types', () => { assert.equal(CANONICAL_SURPRISE_TYPES.length, 10); });
  it('should have exactly 10 reward types', () => { assert.equal(CANONICAL_REWARD_TYPES.length, 10); });
  it('should have exactly 10 recovery types', () => { assert.equal(CANONICAL_ATTENTION_RECOVERY_TYPES.length, 10); });
  it('should have exactly 10 momentum types', () => { assert.equal(CANONICAL_MOMENTUM_TYPES.length, 10); });
  it('should have exactly 6 engagement statuses', () => { assert.equal(CANONICAL_ENGAGEMENT_STATUS.length, 6); });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Engagement Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => { assert.ok(composeNarrativeEngagement(VALID_INPUT)); });
  it('should not use Date.now', () => { assert.ok(composeNarrativeEngagement(VALID_INPUT)); });
  it('should not infer emotions', () => {
    const r = composeNarrativeEngagement(VALID_INPUT);
    assert.ok(!('inferredEmotions' in r));
    assert.ok(!('learnerEmotions' in r));
  });
  it('should not estimate curiosity', () => {
    const r = composeNarrativeEngagement(VALID_INPUT);
    assert.ok(!('curiosityEstimate' in r));
    assert.ok(!('learnerCuriosity' in r));
  });
  it('should not personalize pacing', () => {
    const r = composeNarrativeEngagement(VALID_INPUT);
    assert.ok(!('personalizedPacing' in r));
    assert.ok(!('learnerPacing' in r));
  });
  it('should not generate motivational text', () => {
    const r = composeNarrativeEngagement(VALID_INPUT);
    assert.ok(!('motivationalText' in r));
    assert.ok(!('generatedMotivation' in r));
  });
  it('should not call LLMs', () => {
    const r = composeNarrativeEngagement(VALID_INPUT);
    assert.ok(!('llmCall' in r));
  });
  it('should not have executable callbacks', () => {
    const trigger = composeCuriosityTrigger({ triggerId: 't-1', triggerType: 'unexpected_result', title: 'T', description: 'D.', relatedArtifactId: 'k-1', governanceStatus: 'canonical', provenance: VALID_PROVENANCE });
    for (const key of Object.keys(trigger)) {
      assert.ok(typeof (trigger as any)[key] !== 'function');
    }
  });
});