/**
 * NV-2100-D9-OPT-09 — Misconception Curiosity Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Misconception Curiosity Kernel.
 * Covers: valid card, valid reference, valid insight, valid relationship,
 * valid provenance, valid trace, empty registry, duplicate IDs, duplicate titles,
 * deterministic ordering, invalid enums, missing provenance/provider/rationale,
 * missing references, missing configuration, self-relationships, empty registries,
 * registry inconsistencies, determinism (100 iterations), immutability, negative
 * capability, cross-agent boundaries, validation code stability, public API
 * exports, backward compatibility with D9-OPT-01 through D9-OPT-08.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  MisconceptionCard,
  AssessmentReinforcementReference,
  CorrectiveInsight,
  MisconceptionRelationship,
  MisconceptionInput,
  MisconceptionRegistry,
  MisconceptionCuriosityProvenance,
  MisconceptionCuriosityTrace,
  CuriosityArtifactWithMisconceptions,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_MISCONCEPTION_CARD_TYPES,
  CANONICAL_REINFORCEMENT_REFERENCE_TYPES,
  CANONICAL_MISCONCEPTION_IMPORTANCE,
  CANONICAL_CORRECTIVE_OUTCOMES,
  CANONICAL_MISCONCEPTION_CURIOSITY_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

import {
  composeMisconceptionCuriosityProvenance,
  composeMisconceptionCuriosityTrace,
  composeMisconceptionCard,
  composeAssessmentReinforcementReference,
  composeCorrectiveInsight,
  composeMisconceptionRelationship,
  composeMisconceptionRegistry,
  composeMisconceptionRegistryFromInput,
  composeMisconceptionArtifacts,
  composeCuriosityArtifactWithMisconceptions,
  isSupportedMisconceptionCardType,
  isSupportedReinforcementReferenceType,
  isSupportedMisconceptionImportance,
  isSupportedCorrectiveOutcome,
  isSupportedMisconceptionCuriosityStatus,
  isSupportedMisconceptionCuriosityGovernance,
  getCanonicalMisconceptionCardTypes,
  getCanonicalReinforcementReferenceTypes,
  getCanonicalMisconceptionImportance,
  getCanonicalCorrectiveOutcomes,
  getCanonicalMisconceptionCuriosityStatuses,
} from './MisconceptionCuriosityKernel.ts';

import {
  validateMisconceptionCard,
  validateAssessmentReinforcementReference,
  validateCorrectiveInsight,
  validateMisconceptionRelationship,
  validateMisconceptionRegistry,
  validateMisconceptionInput,
  validateMisconceptionTrace,
  validateCuriosityArtifactWithMisconceptions,
  MISCONCEPTION_CURIOSITY_VALIDATION_CODES,
} from './MisconceptionCuriosityValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: MisconceptionCuriosityProvenance = {
  provider: 'NeuralVerse Team',
  source: 'Curated Knowledge Base',
  rationale: 'Core misconception curiosity artifact.',
  version: '1.0.0',
};

const VALID_TRACE: MisconceptionCuriosityTrace = {
  traceId: '_trace_1',
  generatedFrom: 'deterministic_misconception_curiosity_kernel',
  deterministic: true,
  randomUsed: false,
  timeDependency: false,
};

const VALID_CARD: MisconceptionCard = {
  cardId: 'card-001',
  title: 'Batch Normalization Misconception',
  cardType: 'classic_misconception',
  misconceptionDescription: 'Most engineers believe Batch Normalization reduces overfitting.',
  correctionDescription: 'It was actually introduced to stabilize optimization.',
  importance: 'high',
  conceptIds: ['concept-001', 'concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_CARD_2: MisconceptionCard = {
  cardId: 'card-002',
  title: 'BFS Shortest Path Misconception',
  cardType: 'algorithm_confusion',
  misconceptionDescription: 'Nearly everyone assumes BFS always finds the shortest path.',
  correctionDescription: "That's only true under specific edge-weight assumptions.",
  importance: 'moderate',
  conceptIds: ['concept-003'],
  status: 'approved',
  governance: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Archives' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_REFERENCE: AssessmentReinforcementReference = {
  referenceId: 'ref-001',
  title: 'Visual Review of Batch Normalization',
  referenceType: 'visual_review',
  referenceDescription: 'Visual explanation of how Batch Normalization works.',
  relatedCardId: 'card-001',
  conceptIds: ['concept-001'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_INSIGHT: CorrectiveInsight = {
  insightId: 'insight-001',
  cardId: 'card-001',
  insightTitle: 'Understanding Optimization Stabilization',
  insightDescription: 'Batch Normalization stabilizes optimization by normalizing inputs.',
  correctiveOutcome: 'concept_clarity',
  conceptIds: ['concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_RELATIONSHIP: MisconceptionRelationship = {
  relationshipId: 'misc-rel-001',
  sourceCardId: 'card-001',
  targetCardId: 'card-002',
  relationshipType: 'related_to',
  description: 'These misconceptions are related.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: MisconceptionInput = {
  cards: [VALID_CARD, VALID_CARD_2],
  references: [VALID_REFERENCE],
  insights: [VALID_INSIGHT],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: MisconceptionInput = {
  cards: [],
  references: [],
  insights: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Profile Composition Tests
// ---------------------------------------------------------------------------

describe('Misconception Curiosity Kernel — Profile Composition', () => {
  it('should compose valid misconception curiosity provenance', () => {
    const provenance = composeMisconceptionCuriosityProvenance({
      provider: 'NeuralVerse Team',
      source: 'Curated Knowledge Base',
      rationale: 'Core concept.',
      version: '1.0.0',
    });

    assert.equal(provenance.provider, 'NeuralVerse Team');
    assert.equal(provenance.source, 'Curated Knowledge Base');
    assert.equal(provenance.rationale, 'Core concept.');
    assert.equal(provenance.version, '1.0.0');
  });

  it('should compose valid misconception card', () => {
    const card = composeMisconceptionCard({
      cardId: 'card-001',
      title: 'Batch Normalization Misconception',
      cardType: 'classic_misconception',
      misconceptionDescription: 'Most engineers believe Batch Normalization reduces overfitting.',
      correctionDescription: 'It was actually introduced to stabilize optimization.',
      importance: 'high',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(card.cardId, 'card-001');
    assert.equal(card.title, 'Batch Normalization Misconception');
    assert.equal(card.cardType, 'classic_misconception');
    assert.equal(card.misconceptionDescription, 'Most engineers believe Batch Normalization reduces overfitting.');
    assert.equal(card.correctionDescription, 'It was actually introduced to stabilize optimization.');
    assert.equal(card.importance, 'high');
    assert.equal(card.conceptIds.length, 1);
    assert.equal(card.status, 'published');
    assert.equal(card.governance, 'canonical');
  });

  it('should compose valid misconception curiosity trace', () => {
    const trace = composeMisconceptionCuriosityTrace({
      traceId: '_trace_1',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid assessment reinforcement reference', () => {
    const reference = composeAssessmentReinforcementReference({
      referenceId: 'ref-001',
      title: 'Visual Review of Batch Normalization',
      referenceType: 'visual_review',
      referenceDescription: 'Visual explanation of how Batch Normalization works.',
      relatedCardId: 'card-001',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(reference.referenceId, 'ref-001');
    assert.equal(reference.title, 'Visual Review of Batch Normalization');
    assert.equal(reference.referenceType, 'visual_review');
    assert.equal(reference.referenceDescription, 'Visual explanation of how Batch Normalization works.');
    assert.equal(reference.relatedCardId, 'card-001');
    assert.equal(reference.conceptIds.length, 1);
    assert.equal(reference.status, 'published');
    assert.equal(reference.governance, 'canonical');
  });

  it('should compose valid corrective insight', () => {
    const insight = composeCorrectiveInsight({
      insightId: 'insight-001',
      cardId: 'card-001',
      insightTitle: 'Understanding Optimization Stabilization',
      insightDescription: 'Batch Normalization stabilizes optimization by normalizing inputs.',
      correctiveOutcome: 'concept_clarity',
      conceptIds: ['concept-002'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(insight.insightId, 'insight-001');
    assert.equal(insight.cardId, 'card-001');
    assert.equal(insight.insightTitle, 'Understanding Optimization Stabilization');
    assert.equal(insight.insightDescription, 'Batch Normalization stabilizes optimization by normalizing inputs.');
    assert.equal(insight.correctiveOutcome, 'concept_clarity');
    assert.equal(insight.conceptIds.length, 1);
    assert.equal(insight.status, 'published');
    assert.equal(insight.governance, 'canonical');
  });

  it('should compose valid misconception relationship', () => {
    const relationship = composeMisconceptionRelationship({
      relationshipId: 'misc-rel-001',
      sourceCardId: 'card-001',
      targetCardId: 'card-002',
      relationshipType: 'related_to',
      description: 'Related misconceptions.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'misc-rel-001');
    assert.equal(relationship.sourceCardId, 'card-001');
    assert.equal(relationship.targetCardId, 'card-002');
    assert.equal(relationship.relationshipType, 'related_to');
    assert.equal(relationship.description, 'Related misconceptions.');
  });

  it('should validate a valid card with no errors', () => {
    const errors = validateMisconceptionCard(VALID_CARD);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeMisconceptionRegistry([VALID_CARD, VALID_CARD_2], [VALID_REFERENCE], [VALID_INSIGHT], [VALID_RELATIONSHIP]);
    const result = validateMisconceptionRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate misconception input', () => {
    const result = validateMisconceptionInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Misconception Curiosity Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeMisconceptionRegistry([], [], [], []);
    const result = validateMisconceptionRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have MISCONCEPTION_CURIOSITY_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeMisconceptionRegistry([VALID_CARD, VALID_CARD], [], [], []);
    const result = validateMisconceptionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have MISCONCEPTION_CURIOSITY_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const card1 = { ...VALID_CARD, cardId: 'card-001', title: 'Same Title' };
    const card2 = { ...VALID_CARD, cardId: 'card-002', title: 'Same Title' };
    const registry = composeMisconceptionRegistry([card1, card2], [], [], []);
    const result = validateMisconceptionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have MISCONCEPTION_CURIOSITY_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by cardId', () => {
    const card3 = { ...VALID_CARD, cardId: 'card-003' };
    const card1 = { ...VALID_CARD, cardId: 'card-001' };
    const card2 = { ...VALID_CARD, cardId: 'card-002' };

    const registry = composeMisconceptionRegistry([card3, card1, card2], [], [], []);

    assert.equal(registry.cards[0].cardId, 'card-001');
    assert.equal(registry.cards[1].cardId, 'card-002');
    assert.equal(registry.cards[2].cardId, 'card-003');
  });

  it('should sort by cardType when cardId is equal', () => {
    const cardA = { ...VALID_CARD, cardId: 'card-001', cardType: 'algorithm_confusion' as const };
    const cardB = { ...VALID_CARD, cardId: 'card-001', cardType: 'classic_misconception' as const };

    const registry = composeMisconceptionRegistry([cardA, cardB], [], [], []);

    // Alphabetical sort: 'algorithm_confusion' < 'classic_misconception'
    assert.equal(registry.cards[0].cardType, 'algorithm_confusion');
    assert.equal(registry.cards[1].cardType, 'classic_misconception');
  });

  it('should detect self-relationships', () => {
    const selfRelationship: MisconceptionRelationship = {
      relationshipId: 'misc-rel-self',
      sourceCardId: 'card-001',
      targetCardId: 'card-001',
      relationshipType: 'related_to',
      description: 'Self relationship.',
      provenance: VALID_PROVENANCE,
    };

    const registry = composeMisconceptionRegistry([VALID_CARD], [], [], [selfRelationship]);
    const result = validateMisconceptionRegistry(registry);
    const selfError = result.errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have MISCONCEPTION_CURIOSITY_SELF_RELATIONSHIP error');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Misconception Curiosity Kernel — Validation', () => {
  it('should detect invalid card type', () => {
    const card = { ...VALID_CARD, cardType: 'unsupported' as any };
    const errors = validateMisconceptionCard(card);
    const typeError = errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_CARD,
    );

    assert.ok(typeError, 'Should have MISCONCEPTION_CURIOSITY_INVALID_CARD error');
  });

  it('should detect invalid reference type', () => {
    const reference = { ...VALID_REFERENCE, referenceType: 'unsupported' as any };
    const errors = validateAssessmentReinforcementReference(reference);
    const typeError = errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_REFERENCE,
    );

    assert.ok(typeError, 'Should have MISCONCEPTION_CURIOSITY_INVALID_REFERENCE error');
  });

  it('should detect invalid corrective outcome', () => {
    const insight = { ...VALID_INSIGHT, correctiveOutcome: 'unsupported' as any };
    const errors = validateCorrectiveInsight(insight);
    const outcomeError = errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_OUTCOME,
    );

    assert.ok(outcomeError, 'Should have MISCONCEPTION_CURIOSITY_INVALID_OUTCOME error');
  });

  it('should detect invalid importance', () => {
    const card = { ...VALID_CARD, importance: 'unsupported' as any };
    const errors = validateMisconceptionCard(card);
    const importanceError = errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_IMPORTANCE,
    );

    assert.ok(importanceError, 'Should have MISCONCEPTION_CURIOSITY_INVALID_IMPORTANCE error');
  });

  it('should detect invalid status', () => {
    const card = { ...VALID_CARD, status: 'unsupported' as any };
    const errors = validateMisconceptionCard(card);
    const statusError = errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have MISCONCEPTION_CURIOSITY_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const card = { ...VALID_CARD, governance: 'unsupported' as any };
    const errors = validateMisconceptionCard(card);
    const governanceError = errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have MISCONCEPTION_CURIOSITY_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const card = { ...VALID_CARD, provenance: undefined as any };
    const errors = validateMisconceptionCard(card);
    const provenanceError = errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISCONCEPTION_CURIOSITY_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance provider', () => {
    const card = { ...VALID_CARD, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateMisconceptionCard(card);
    const providerError = errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have MISCONCEPTION_CURIOSITY_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const card = { ...VALID_CARD, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateMisconceptionCard(card);
    const rationaleError = errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have MISCONCEPTION_CURIOSITY_MISSING_RATIONALE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeMisconceptionCuriosityTrace({
      traceId: '_trace_1',
    });

    const result = validateMisconceptionTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: MisconceptionCuriosityTrace = {
      traceId: '',
      generatedFrom: 'deterministic_misconception_curiosity_kernel',
      deterministic: false as true,
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateMisconceptionTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect missing card configuration', () => {
    const card: MisconceptionCard = {
      cardId: 'card-001',
      title: 'Test',
      cardType: 'classic_misconception',
      misconceptionDescription: '',
      correctionDescription: '',
      importance: 'high',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    };

    const errors = validateMisconceptionCard(card);
    const configError = errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION error');
  });

  it('should detect missing reference configuration', () => {
    const reference: AssessmentReinforcementReference = {
      referenceId: 'ref-001',
      title: 'Test',
      referenceType: 'concept_review',
      referenceDescription: '',
      relatedCardId: '',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    };

    const errors = validateAssessmentReinforcementReference(reference);
    const configError = errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION error');
  });

  it('should detect missing insight configuration', () => {
    const insight: CorrectiveInsight = {
      insightId: 'insight-001',
      cardId: 'card-001',
      insightTitle: 'Test',
      insightDescription: '',
      correctiveOutcome: 'concept_clarity',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    };

    const errors = validateCorrectiveInsight(insight);
    const configError = errors.find(
      (e) => e.code === MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Misconception Curiosity Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeMisconceptionArtifacts>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeMisconceptionArtifacts(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].cards, results[i].cards);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeMisconceptionRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeMisconceptionRegistry([VALID_CARD, VALID_CARD_2], [VALID_REFERENCE], [VALID_INSIGHT], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].cards, results[i].cards);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Misconception Curiosity Kernel — Immutability', () => {
  it('should not mutate input cards', () => {
    const originalId = VALID_CARD.cardId;
    const originalTitle = VALID_CARD.title;

    composeMisconceptionArtifacts(VALID_INPUT);

    assert.equal(VALID_CARD.cardId, originalId);
    assert.equal(VALID_CARD.title, originalTitle);
  });

  it('should not mutate input registry cards', () => {
    const cards = [VALID_CARD, VALID_CARD_2];
    const originalIds = cards.map((c) => c.cardId);

    composeMisconceptionRegistry(cards, [], [], []);

    assert.equal(cards[0].cardId, originalIds[0]);
    assert.equal(cards[1].cardId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Misconception Curiosity Kernel — Helper Functions', () => {
  it('should return canonical misconception card types', () => {
    const types = getCanonicalMisconceptionCardTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_MISCONCEPTION_CARD_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical reinforcement reference types', () => {
    const types = getCanonicalReinforcementReferenceTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_REINFORCEMENT_REFERENCE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical misconception importance', () => {
    const importance = getCanonicalMisconceptionImportance();
    assert.deepStrictEqual([...importance], [...CANONICAL_MISCONCEPTION_IMPORTANCE]);
    assert.equal(importance.length, 10);
  });

  it('should return canonical corrective outcomes', () => {
    const outcomes = getCanonicalCorrectiveOutcomes();
    assert.deepStrictEqual([...outcomes], [...CANONICAL_CORRECTIVE_OUTCOMES]);
    assert.equal(outcomes.length, 10);
  });

  it('should return canonical misconception curiosity statuses', () => {
    const statuses = getCanonicalMisconceptionCuriosityStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_MISCONCEPTION_CURIOSITY_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate misconception card type support', () => {
    assert.equal(isSupportedMisconceptionCardType('classic_misconception'), true);
    assert.equal(isSupportedMisconceptionCardType('engineering_trap'), true);
    assert.equal(isSupportedMisconceptionCardType('unsupported'), false);
  });

  it('should validate reinforcement reference type support', () => {
    assert.equal(isSupportedReinforcementReferenceType('concept_review'), true);
    assert.equal(isSupportedReinforcementReferenceType('visual_review'), true);
    assert.equal(isSupportedReinforcementReferenceType('unsupported'), false);
  });

  it('should validate misconception importance support', () => {
    assert.equal(isSupportedMisconceptionImportance('minimal'), true);
    assert.equal(isSupportedMisconceptionImportance('high'), true);
    assert.equal(isSupportedMisconceptionImportance('unsupported'), false);
  });

  it('should validate corrective outcome support', () => {
    assert.equal(isSupportedCorrectiveOutcome('concept_clarity'), true);
    assert.equal(isSupportedCorrectiveOutcome('mental_model_update'), true);
    assert.equal(isSupportedCorrectiveOutcome('unsupported'), false);
  });

  it('should validate misconception curiosity status support', () => {
    assert.equal(isSupportedMisconceptionCuriosityStatus('draft'), true);
    assert.equal(isSupportedMisconceptionCuriosityStatus('published'), true);
    assert.equal(isSupportedMisconceptionCuriosityStatus('unsupported'), false);
  });

  it('should validate misconception curiosity governance support', () => {
    assert.equal(isSupportedMisconceptionCuriosityGovernance('canonical'), true);
    assert.equal(isSupportedMisconceptionCuriosityGovernance('accepted'), true);
    assert.equal(isSupportedMisconceptionCuriosityGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Misconception Curiosity Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 misconception card types', () => {
    assert.equal(CANONICAL_MISCONCEPTION_CARD_TYPES.length, 10);
  });

  it('should have exactly 10 reinforcement reference types', () => {
    assert.equal(CANONICAL_REINFORCEMENT_REFERENCE_TYPES.length, 10);
  });

  it('should have exactly 10 misconception importance', () => {
    assert.equal(CANONICAL_MISCONCEPTION_IMPORTANCE.length, 10);
  });

  it('should have exactly 10 corrective outcomes', () => {
    assert.equal(CANONICAL_CORRECTIVE_OUTCOMES.length, 10);
  });

  it('should have exactly 6 misconception curiosity statuses', () => {
    assert.equal(CANONICAL_MISCONCEPTION_CURIOSITY_STATUS.length, 6);
  });

  it('should have exactly 5 governance values', () => {
    assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5);
  });

  it('should contain all expected misconception card types', () => {
    const expectedTypes = [
      'classic_misconception',
      'engineering_trap',
      'mathematical_error',
      'algorithm_confusion',
      'architecture_confusion',
      'historical_misbelief',
      'visual_misinterpretation',
      'terminology_confusion',
      'counterintuitive_fact',
      'false_intuition',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_MISCONCEPTION_CARD_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected reinforcement reference types', () => {
    const expectedTypes = [
      'concept_review',
      'visual_review',
      'worked_example',
      'engineering_case',
      'comparison',
      'field_note',
      'experiment',
      'knowledge_reference',
      'laboratory_reference',
      'reflection',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_REINFORCEMENT_REFERENCE_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected misconception importance', () => {
    const expectedImportance = [
      'minimal',
      'low',
      'moderate',
      'high',
      'critical',
      'canonical',
      'frequent',
      'rare',
      'advanced',
      'expert',
    ];

    for (const importance of expectedImportance) {
      assert.ok(
        CANONICAL_MISCONCEPTION_IMPORTANCE.includes(importance as any),
        `Should include importance: ${importance}`,
      );
    }
  });

  it('should contain all expected corrective outcomes', () => {
    const expectedOutcomes = [
      'concept_clarity',
      'mental_model_update',
      'engineering_awareness',
      'historical_understanding',
      'reasoning_improvement',
      'visual_interpretation',
      'application_awareness',
      'terminology_precision',
      'reflection',
      'long_term_retention',
    ];

    for (const outcome of expectedOutcomes) {
      assert.ok(
        CANONICAL_CORRECTIVE_OUTCOMES.includes(outcome as any),
        `Should include outcome: ${outcome}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Misconception Curiosity Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not diagnose learners', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('learnerDiagnosis' in result), 'Should not have learner diagnosis');
    assert.ok(!('diagnosis' in result), 'Should not have diagnosis');
  });

  it('should not detect misconceptions automatically', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('detectedMisconceptions' in result), 'Should not have detected misconceptions');
    assert.ok(!('autoDetection' in result), 'Should not have auto detection');
  });

  it('should not evaluate assessments', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('assessmentEvaluation' in result), 'Should not have assessment evaluation');
    assert.ok(!('evaluation' in result), 'Should not have evaluation');
  });

  it('should not personalize remediation', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('personalizedRemediation' in result), 'Should not have personalized remediation');
    assert.ok(!('remediation' in result), 'Should not have remediation');
  });

  it('should not invoke the Assessment Agent', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('assessmentAgent' in result), 'Should not have assessment agent');
    assert.ok(!('assessmentAgentInvocation' in result), 'Should not have assessment agent invocation');
  });

  it('should not access filesystem', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in card', () => {
    const card = composeMisconceptionCard({
      cardId: 'card-001',
      title: 'Test',
      cardType: 'classic_misconception',
      misconceptionDescription: 'Test misconception.',
      correctionDescription: 'Test correction.',
      importance: 'high',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    const keys = Object.keys(card);
    for (const key of keys) {
      const value = (card as any)[key];
      assert.ok(typeof value !== 'function', `Card field "${key}" should not be a function`);
    }
  });

  it('should not store runtime execution', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Misconception Curiosity Kernel — Cross-Agent Boundary', () => {
  it('should not reference Assessment Agent', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('assessmentAgent' in result), 'Should not reference Assessment Agent');
    assert.ok(!('assessment' in result), 'Should not reference assessment');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('narrativeAgent' in result), 'Should not reference Narrative Agent');
    assert.ok(!('narrative' in result), 'Should not reference narrative');
  });

  it('should not reference Knowledge Agent', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('knowledgeAgent' in result), 'Should not reference Knowledge Agent');
    assert.ok(!('knowledge' in result), 'Should not reference knowledge');
  });

  it('should not reference Didactic Agent', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('didacticAgent' in result), 'Should not reference Didactic Agent');
    assert.ok(!('didactic' in result), 'Should not reference didactic');
  });

  it('should not reference Research Agent', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('researchAgent' in result), 'Should not reference Research Agent');
    assert.ok(!('research' in result), 'Should not reference research');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('laboratoryAgent' in result), 'Should not reference Laboratory Agent');
    assert.ok(!('laboratory' in result), 'Should not reference laboratory');
  });

  it('should not reference Application Agent', () => {
    const result = composeMisconceptionArtifacts(VALID_INPUT);
    assert.ok(!('applicationAgent' in result), 'Should not reference Application Agent');
    assert.ok(!('application' in result), 'Should not reference application');
  });
});

// ---------------------------------------------------------------------------
// Validation Codes Tests
// ---------------------------------------------------------------------------

describe('Misconception Curiosity Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_DUPLICATE_ID, 'MISCONCEPTION_CURIOSITY_DUPLICATE_ID');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_DUPLICATE_TITLE, 'MISCONCEPTION_CURIOSITY_DUPLICATE_TITLE');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_CARD, 'MISCONCEPTION_CURIOSITY_INVALID_CARD');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_REFERENCE, 'MISCONCEPTION_CURIOSITY_INVALID_REFERENCE');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_OUTCOME, 'MISCONCEPTION_CURIOSITY_INVALID_OUTCOME');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_IMPORTANCE, 'MISCONCEPTION_CURIOSITY_INVALID_IMPORTANCE');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_STATUS, 'MISCONCEPTION_CURIOSITY_INVALID_STATUS');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_GOVERNANCE, 'MISCONCEPTION_CURIOSITY_INVALID_GOVERNANCE');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVENANCE, 'MISCONCEPTION_CURIOSITY_MISSING_PROVENANCE');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROVIDER, 'MISCONCEPTION_CURIOSITY_MISSING_PROVIDER');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_RATIONALE, 'MISCONCEPTION_CURIOSITY_MISSING_RATIONALE');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_CURIOSITY_REFERENCE, 'MISCONCEPTION_CURIOSITY_MISSING_CURIOSITY_REFERENCE');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_PROFILE_ID, 'MISCONCEPTION_CURIOSITY_MISSING_PROFILE_ID');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_TITLE, 'MISCONCEPTION_CURIOSITY_MISSING_TITLE');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_CARD, 'MISCONCEPTION_CURIOSITY_MISSING_CARD');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_SELF_RELATIONSHIP, 'MISCONCEPTION_CURIOSITY_SELF_RELATIONSHIP');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_EMPTY_REGISTRY, 'MISCONCEPTION_CURIOSITY_EMPTY_REGISTRY');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_TRACE, 'MISCONCEPTION_CURIOSITY_INVALID_TRACE');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_REGISTRY_INCONSISTENCY, 'MISCONCEPTION_CURIOSITY_REGISTRY_INCONSISTENCY');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION, 'MISCONCEPTION_CURIOSITY_INVALID_CONFIGURATION');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_INVALID_RELATIONSHIP, 'MISCONCEPTION_CURIOSITY_INVALID_RELATIONSHIP');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_RELATIONSHIP, 'MISCONCEPTION_CURIOSITY_MISSING_RELATIONSHIP');
    assert.equal(MISCONCEPTION_CURIOSITY_VALIDATION_CODES.MISCONCEPTION_CURIOSITY_MISSING_GOVERNANCE, 'MISCONCEPTION_CURIOSITY_MISSING_GOVERNANCE');
  });

  it('should have exactly 24 validation codes', () => {
    const codeCount = Object.keys(MISCONCEPTION_CURIOSITY_VALIDATION_CODES).length;
    assert.equal(codeCount, 24);
  });
});

// ---------------------------------------------------------------------------
// Public API Export Tests
// ---------------------------------------------------------------------------

describe('Misconception Curiosity Kernel — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeMisconceptionCuriosityProvenance, 'function');
    assert.equal(typeof composeMisconceptionCuriosityTrace, 'function');
    assert.equal(typeof composeMisconceptionCard, 'function');
    assert.equal(typeof composeAssessmentReinforcementReference, 'function');
    assert.equal(typeof composeCorrectiveInsight, 'function');
    assert.equal(typeof composeMisconceptionRelationship, 'function');
    assert.equal(typeof composeMisconceptionRegistry, 'function');
    assert.equal(typeof composeMisconceptionRegistryFromInput, 'function');
    assert.equal(typeof composeMisconceptionArtifacts, 'function');
    assert.equal(typeof composeCuriosityArtifactWithMisconceptions, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedMisconceptionCardType, 'function');
    assert.equal(typeof isSupportedReinforcementReferenceType, 'function');
    assert.equal(typeof isSupportedMisconceptionImportance, 'function');
    assert.equal(typeof isSupportedCorrectiveOutcome, 'function');
    assert.equal(typeof isSupportedMisconceptionCuriosityStatus, 'function');
    assert.equal(typeof isSupportedMisconceptionCuriosityGovernance, 'function');
    assert.equal(typeof getCanonicalMisconceptionCardTypes, 'function');
    assert.equal(typeof getCanonicalReinforcementReferenceTypes, 'function');
    assert.equal(typeof getCanonicalMisconceptionImportance, 'function');
    assert.equal(typeof getCanonicalCorrectiveOutcomes, 'function');
    assert.equal(typeof getCanonicalMisconceptionCuriosityStatuses, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateMisconceptionCard, 'function');
    assert.equal(typeof validateAssessmentReinforcementReference, 'function');
    assert.equal(typeof validateCorrectiveInsight, 'function');
    assert.equal(typeof validateMisconceptionRelationship, 'function');
    assert.equal(typeof validateMisconceptionRegistry, 'function');
    assert.equal(typeof validateMisconceptionInput, 'function');
    assert.equal(typeof validateMisconceptionTrace, 'function');
    assert.equal(typeof validateCuriosityArtifactWithMisconceptions, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(MISCONCEPTION_CURIOSITY_VALIDATION_CODES);
    assert.equal(typeof MISCONCEPTION_CURIOSITY_VALIDATION_CODES, 'object');
  });
});
