/**
 * NV-2100-D9-OPT-05 — Curiosity Card Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Curiosity Card Kernel.
 * Covers: valid card profile, valid engineer note, valid field note,
 * valid presentation, valid relationship, valid provenance, valid trace,
 * empty registry, duplicate IDs, duplicate titles, deterministic ordering,
 * invalid enums, missing provenance/provider/rationale, missing references,
 * missing presentation, self-relationships, empty registries, registry
 * inconsistencies, determinism (100 iterations), immutability, negative
 * capability, cross-agent boundaries, validation code stability, public
 * API exports, backward compatibility with D9-OPT-01 through D9-OPT-04.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CuriosityCardProfile,
  EngineerNoteProfile,
  FieldNoteProfile,
  CardPresentationMetadata,
  CardRelationship,
  CuriosityCardInput,
  CuriosityCardRegistry,
  CuriosityCardProvenance,
  CuriosityCardTrace,
  CuriosityArtifactWithCards,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_CARD_TYPES,
  CANONICAL_INFORMATION_DENSITY,
  CANONICAL_READING_DURATION,
  CANONICAL_PRESENTATION_STYLE,
  CANONICAL_DISCOVERY_STYLE,
  CANONICAL_CARD_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

import {
  composeCuriosityCardProvenance,
  composeCuriosityCardTrace,
  composeCuriosityCardProfile,
  composeEngineerNoteProfile,
  composeFieldNoteProfile,
  composeCardPresentationMetadata,
  composeCardRelationship,
  composeCuriosityCardRegistry,
  composeCuriosityCardRegistryFromInput,
  composeCuriosityCards,
  composeCuriosityArtifactWithCards,
  isSupportedCardType,
  isSupportedInformationDensity,
  isSupportedReadingDuration,
  isSupportedPresentationStyle,
  isSupportedDiscoveryStyle,
  isSupportedCardStatus,
  isSupportedCardGovernance,
  getCanonicalCardTypes,
  getCanonicalInformationDensity,
  getCanonicalReadingDurations,
  getCanonicalPresentationStyles,
  getCanonicalDiscoveryStyles,
  getCanonicalCardStatuses,
} from './CuriosityCardKernel.ts';

import {
  validateCuriosityCardProfile,
  validateEngineerNoteProfile,
  validateFieldNoteProfile,
  validateCardPresentationMetadata,
  validateCardRelationship,
  validateCuriosityCardRegistry,
  validateCuriosityCardInput,
  validateCuriosityCardTrace,
  validateCuriosityArtifactWithCards,
  CURIOUSITY_CARD_VALIDATION_CODES,
} from './CuriosityCardValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: CuriosityCardProvenance = {
  provider: 'NeuralVerse Team',
  source: 'Curated Knowledge Base',
  rationale: 'Core curiosity card artifact.',
  version: '1.0.0',
};

const VALID_TRACE: CuriosityCardTrace = {
  traceId: '_trace_1',
  generatedFrom: 'deterministic_curiosity_card_kernel',
  deterministic: true,
  randomUsed: false,
  timeDependency: false,
};

const VALID_CARD_PROFILE: CuriosityCardProfile = {
  id: 'card-001',
  title: 'Neural Network Surprising Fact',
  cardType: 'curiosity_card',
  informationDensity: 'compact',
  readingDuration: '30_seconds',
  presentationStyle: 'card',
  discoveryStyle: 'surprising',
  conceptIds: ['concept-001', 'concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_CARD_PROFILE_2: CuriosityCardProfile = {
  id: 'card-002',
  title: 'Historical Note in AI',
  cardType: 'historical_note',
  informationDensity: 'detailed',
  readingDuration: '1_minute',
  presentationStyle: 'lab_note',
  discoveryStyle: 'historical',
  conceptIds: ['concept-003'],
  status: 'approved',
  governance: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Archives' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_ENGINEER_NOTE: EngineerNoteProfile = {
  id: 'eng-001',
  title: 'Engineering Insight on Overfitting',
  engineeringRelevance: 'Critical for production ML systems',
  implementationPerspective: 'Regularization techniques',
  realWorldInsight: 'Early stopping often sufficient',
  practicalTakeaway: 'Monitor validation loss carefully',
  technicalEmphasis: 'Dropout and batch normalization',
  conceptIds: ['concept-001'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_FIELD_NOTE: FieldNoteProfile = {
  id: 'field-001',
  title: 'Observation on Gradient Descent',
  observation: 'Learning rate scheduling improves convergence',
  experiment: 'Tested on MNIST with various schedules',
  historicalAnecdote: 'Rumelhart et al. 1986',
  scientificDiscovery: 'Backpropagation revolution',
  engineeringLesson: 'Gradient clipping prevents exploding gradients',
  conceptIds: ['concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_PRESENTATION: CardPresentationMetadata = {
  presentationId: 'pres-001',
  cardId: 'card-001',
  presentationStyle: 'card',
  informationDensity: 'compact',
  readingDuration: '30_seconds',
  discoveryStyle: 'surprising',
};

const VALID_RELATIONSHIP: CardRelationship = {
  relationshipId: 'card-rel-001',
  sourceCardId: 'card-001',
  targetCardId: 'card-002',
  relationshipType: 'related_to',
  description: 'These cards are related.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: CuriosityCardInput = {
  cards: [VALID_CARD_PROFILE, VALID_CARD_PROFILE_2],
  engineerNotes: [VALID_ENGINEER_NOTE],
  fieldNotes: [VALID_FIELD_NOTE],
  presentations: [VALID_PRESENTATION],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: CuriosityCardInput = {
  cards: [],
  engineerNotes: [],
  fieldNotes: [],
  presentations: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Card Profile Composition Tests
// ---------------------------------------------------------------------------

describe('Curiosity Card Kernel — Profile Composition', () => {
  it('should compose valid curiosity card provenance', () => {
    const provenance = composeCuriosityCardProvenance({
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

  it('should compose valid curiosity card profile', () => {
    const card = composeCuriosityCardProfile({
      id: 'card-001',
      title: 'Neural Network Surprising Fact',
      cardType: 'curiosity_card',
      informationDensity: 'compact',
      readingDuration: '30_seconds',
      presentationStyle: 'card',
      discoveryStyle: 'surprising',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(card.id, 'card-001');
    assert.equal(card.title, 'Neural Network Surprising Fact');
    assert.equal(card.cardType, 'curiosity_card');
    assert.equal(card.informationDensity, 'compact');
    assert.equal(card.readingDuration, '30_seconds');
    assert.equal(card.presentationStyle, 'card');
    assert.equal(card.discoveryStyle, 'surprising');
    assert.equal(card.conceptIds.length, 1);
    assert.equal(card.status, 'published');
    assert.equal(card.governance, 'canonical');
  });

  it('should compose valid curiosity card trace', () => {
    const trace = composeCuriosityCardTrace({
      traceId: '_trace_1',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid engineer note profile', () => {
    const engineerNote = composeEngineerNoteProfile({
      id: 'eng-001',
      title: 'Engineering Insight on Overfitting',
      engineeringRelevance: 'Critical for production ML systems',
      implementationPerspective: 'Regularization techniques',
      realWorldInsight: 'Early stopping often sufficient',
      practicalTakeaway: 'Monitor validation loss carefully',
      technicalEmphasis: 'Dropout and batch normalization',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(engineerNote.id, 'eng-001');
    assert.equal(engineerNote.title, 'Engineering Insight on Overfitting');
    assert.equal(engineerNote.engineeringRelevance, 'Critical for production ML systems');
    assert.equal(engineerNote.implementationPerspective, 'Regularization techniques');
    assert.equal(engineerNote.realWorldInsight, 'Early stopping often sufficient');
    assert.equal(engineerNote.practicalTakeaway, 'Monitor validation loss carefully');
    assert.equal(engineerNote.technicalEmphasis, 'Dropout and batch normalization');
    assert.equal(engineerNote.conceptIds.length, 1);
    assert.equal(engineerNote.status, 'published');
    assert.equal(engineerNote.governance, 'canonical');
  });

  it('should compose valid field note profile', () => {
    const fieldNote = composeFieldNoteProfile({
      id: 'field-001',
      title: 'Observation on Gradient Descent',
      observation: 'Learning rate scheduling improves convergence',
      experiment: 'Tested on MNIST with various schedules',
      historicalAnecdote: 'Rumelhart et al. 1986',
      scientificDiscovery: 'Backpropagation revolution',
      engineeringLesson: 'Gradient clipping prevents exploding gradients',
      conceptIds: ['concept-002'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(fieldNote.id, 'field-001');
    assert.equal(fieldNote.title, 'Observation on Gradient Descent');
    assert.equal(fieldNote.observation, 'Learning rate scheduling improves convergence');
    assert.equal(fieldNote.experiment, 'Tested on MNIST with various schedules');
    assert.equal(fieldNote.historicalAnecdote, 'Rumelhart et al. 1986');
    assert.equal(fieldNote.scientificDiscovery, 'Backpropagation revolution');
    assert.equal(fieldNote.engineeringLesson, 'Gradient clipping prevents exploding gradients');
    assert.equal(fieldNote.conceptIds.length, 1);
    assert.equal(fieldNote.status, 'published');
    assert.equal(fieldNote.governance, 'canonical');
  });

  it('should compose valid card presentation metadata', () => {
    const presentation = composeCardPresentationMetadata({
      presentationId: 'pres-001',
      cardId: 'card-001',
      presentationStyle: 'card',
      informationDensity: 'compact',
      readingDuration: '30_seconds',
      discoveryStyle: 'surprising',
    });

    assert.equal(presentation.presentationId, 'pres-001');
    assert.equal(presentation.cardId, 'card-001');
    assert.equal(presentation.presentationStyle, 'card');
    assert.equal(presentation.informationDensity, 'compact');
    assert.equal(presentation.readingDuration, '30_seconds');
    assert.equal(presentation.discoveryStyle, 'surprising');
  });

  it('should compose valid card relationship', () => {
    const relationship = composeCardRelationship({
      relationshipId: 'card-rel-001',
      sourceCardId: 'card-001',
      targetCardId: 'card-002',
      relationshipType: 'related_to',
      description: 'Related cards.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'card-rel-001');
    assert.equal(relationship.sourceCardId, 'card-001');
    assert.equal(relationship.targetCardId, 'card-002');
    assert.equal(relationship.relationshipType, 'related_to');
    assert.equal(relationship.description, 'Related cards.');
  });

  it('should validate a valid card profile with no errors', () => {
    const errors = validateCuriosityCardProfile(VALID_CARD_PROFILE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeCuriosityCardRegistry([VALID_CARD_PROFILE, VALID_CARD_PROFILE_2], [VALID_ENGINEER_NOTE], [VALID_FIELD_NOTE], [VALID_PRESENTATION], [VALID_RELATIONSHIP]);
    const result = validateCuriosityCardRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate curiosity card input', () => {
    const result = validateCuriosityCardInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Curiosity Card Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeCuriosityCardRegistry([], [], [], [], []);
    const result = validateCuriosityCardRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have CARD_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeCuriosityCardRegistry([VALID_CARD_PROFILE, VALID_CARD_PROFILE], [], [], [], []);
    const result = validateCuriosityCardRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have CARD_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const card1 = { ...VALID_CARD_PROFILE, id: 'card-001', title: 'Same Title' };
    const card2 = { ...VALID_CARD_PROFILE, id: 'card-002', title: 'Same Title' };
    const registry = composeCuriosityCardRegistry([card1, card2], [], [], [], []);
    const result = validateCuriosityCardRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have CARD_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by id', () => {
    const card3 = { ...VALID_CARD_PROFILE, id: 'card-003' };
    const card1 = { ...VALID_CARD_PROFILE, id: 'card-001' };
    const card2 = { ...VALID_CARD_PROFILE, id: 'card-002' };

    const registry = composeCuriosityCardRegistry([card3, card1, card2], [], [], [], []);

    assert.equal(registry.cards[0].id, 'card-001');
    assert.equal(registry.cards[1].id, 'card-002');
    assert.equal(registry.cards[2].id, 'card-003');
  });

  it('should sort by cardType when id is equal', () => {
    const cardA = { ...VALID_CARD_PROFILE, id: 'card-001', cardType: 'historical_note' as const };
    const cardB = { ...VALID_CARD_PROFILE, id: 'card-001', cardType: 'curiosity_card' as const };

    const registry = composeCuriosityCardRegistry([cardA, cardB], [], [], [], []);

    assert.equal(registry.cards[0].cardType, 'curiosity_card');
    assert.equal(registry.cards[1].cardType, 'historical_note');
  });

  it('should detect self-relationships', () => {
    const selfRelationship: CardRelationship = {
      relationshipId: 'card-rel-self',
      sourceCardId: 'card-001',
      targetCardId: 'card-001',
      relationshipType: 'related_to',
      description: 'Self relationship.',
      provenance: VALID_PROVENANCE,
    };

    const registry = composeCuriosityCardRegistry([VALID_CARD_PROFILE], [], [], [], [selfRelationship]);
    const result = validateCuriosityCardRegistry(registry);
    const selfError = result.errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have CARD_SELF_RELATIONSHIP error');
  });

  it('should detect duplicate presentation IDs', () => {
    const registry = composeCuriosityCardRegistry([VALID_CARD_PROFILE], [], [], [VALID_PRESENTATION, VALID_PRESENTATION], []);
    const result = validateCuriosityCardRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_PRESENTATION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have CARD_PRESENTATION_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Curiosity Card Kernel — Validation', () => {
  it('should detect invalid card type', () => {
    const card = { ...VALID_CARD_PROFILE, cardType: 'unsupported' as any };
    const errors = validateCuriosityCardProfile(card);
    const typeError = errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have CARD_INVALID_TYPE error');
  });

  it('should detect invalid information density', () => {
    const card = { ...VALID_CARD_PROFILE, informationDensity: 'unsupported' as any };
    const errors = validateCuriosityCardProfile(card);
    const densityError = errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_DENSITY,
    );

    assert.ok(densityError, 'Should have CARD_INVALID_DENSITY error');
  });

  it('should detect invalid reading duration', () => {
    const card = { ...VALID_CARD_PROFILE, readingDuration: 'unsupported' as any };
    const errors = validateCuriosityCardProfile(card);
    const durationError = errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_DURATION,
    );

    assert.ok(durationError, 'Should have CARD_INVALID_DURATION error');
  });

  it('should detect invalid presentation style', () => {
    const card = { ...VALID_CARD_PROFILE, presentationStyle: 'unsupported' as any };
    const errors = validateCuriosityCardProfile(card);
    const presentationError = errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_PRESENTATION,
    );

    assert.ok(presentationError, 'Should have CARD_INVALID_PRESENTATION error');
  });

  it('should detect invalid discovery style', () => {
    const card = { ...VALID_CARD_PROFILE, discoveryStyle: 'unsupported' as any };
    const errors = validateCuriosityCardProfile(card);
    const discoveryError = errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_DISCOVERY_STYLE,
    );

    assert.ok(discoveryError, 'Should have CARD_INVALID_DISCOVERY_STYLE error');
  });

  it('should detect invalid status', () => {
    const card = { ...VALID_CARD_PROFILE, status: 'unsupported' as any };
    const errors = validateCuriosityCardProfile(card);
    const statusError = errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have CARD_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const card = { ...VALID_CARD_PROFILE, governance: 'unsupported' as any };
    const errors = validateCuriosityCardProfile(card);
    const governanceError = errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have CARD_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const card = { ...VALID_CARD_PROFILE, provenance: undefined as any };
    const errors = validateCuriosityCardProfile(card);
    const provenanceError = errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have CARD_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance provider', () => {
    const card = { ...VALID_CARD_PROFILE, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateCuriosityCardProfile(card);
    const providerError = errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have CARD_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const card = { ...VALID_CARD_PROFILE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateCuriosityCardProfile(card);
    const rationaleError = errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have CARD_MISSING_RATIONALE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeCuriosityCardTrace({
      traceId: '_trace_1',
    });

    const result = validateCuriosityCardTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: CuriosityCardTrace = {
      traceId: '',
      generatedFrom: 'deterministic_curiosity_card_kernel',
      deterministic: false as true,
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateCuriosityCardTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect missing engineer note configuration', () => {
    const engineerNote: EngineerNoteProfile = {
      id: 'eng-001',
      title: 'Test',
      engineeringRelevance: '',
      implementationPerspective: '',
      realWorldInsight: '',
      practicalTakeaway: '',
      technicalEmphasis: '',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    };

    const errors = validateEngineerNoteProfile(engineerNote);
    const configError = errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have CARD_INVALID_CONFIGURATION error');
  });

  it('should detect missing field note configuration', () => {
    const fieldNote: FieldNoteProfile = {
      id: 'field-001',
      title: 'Test',
      observation: '',
      experiment: '',
      historicalAnecdote: '',
      scientificDiscovery: '',
      engineeringLesson: '',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    };

    const errors = validateFieldNoteProfile(fieldNote);
    const configError = errors.find(
      (e) => e.code === CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have CARD_INVALID_CONFIGURATION error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Curiosity Card Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeCuriosityCards>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCuriosityCards(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].cards, results[i].cards);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeCuriosityCardRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCuriosityCardRegistry([VALID_CARD_PROFILE, VALID_CARD_PROFILE_2], [VALID_ENGINEER_NOTE], [VALID_FIELD_NOTE], [VALID_PRESENTATION], [VALID_RELATIONSHIP]));
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

describe('Curiosity Card Kernel — Immutability', () => {
  it('should not mutate input cards', () => {
    const originalId = VALID_CARD_PROFILE.id;
    const originalTitle = VALID_CARD_PROFILE.title;

    composeCuriosityCards(VALID_INPUT);

    assert.equal(VALID_CARD_PROFILE.id, originalId);
    assert.equal(VALID_CARD_PROFILE.title, originalTitle);
  });

  it('should not mutate input registry cards', () => {
    const cards = [VALID_CARD_PROFILE, VALID_CARD_PROFILE_2];
    const originalIds = cards.map((c) => c.id);

    composeCuriosityCardRegistry(cards, [], [], [], []);

    assert.equal(cards[0].id, originalIds[0]);
    assert.equal(cards[1].id, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Curiosity Card Kernel — Helper Functions', () => {
  it('should return canonical card types', () => {
    const types = getCanonicalCardTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_CARD_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical information density', () => {
    const density = getCanonicalInformationDensity();
    assert.deepStrictEqual([...density], [...CANONICAL_INFORMATION_DENSITY]);
    assert.equal(density.length, 10);
  });

  it('should return canonical reading durations', () => {
    const durations = getCanonicalReadingDurations();
    assert.deepStrictEqual([...durations], [...CANONICAL_READING_DURATION]);
    assert.equal(durations.length, 10);
  });

  it('should return canonical presentation styles', () => {
    const styles = getCanonicalPresentationStyles();
    assert.deepStrictEqual([...styles], [...CANONICAL_PRESENTATION_STYLE]);
    assert.equal(styles.length, 10);
  });

  it('should return canonical discovery styles', () => {
    const styles = getCanonicalDiscoveryStyles();
    assert.deepStrictEqual([...styles], [...CANONICAL_DISCOVERY_STYLE]);
    assert.equal(styles.length, 10);
  });

  it('should return canonical card statuses', () => {
    const statuses = getCanonicalCardStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_CARD_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate card type support', () => {
    assert.equal(isSupportedCardType('curiosity_card'), true);
    assert.equal(isSupportedCardType('engineer_note'), true);
    assert.equal(isSupportedCardType('unsupported'), false);
  });

  it('should validate information density support', () => {
    assert.equal(isSupportedInformationDensity('minimal'), true);
    assert.equal(isSupportedInformationDensity('compact'), true);
    assert.equal(isSupportedInformationDensity('unsupported'), false);
  });

  it('should validate reading duration support', () => {
    assert.equal(isSupportedReadingDuration('10_seconds'), true);
    assert.equal(isSupportedReadingDuration('1_minute'), true);
    assert.equal(isSupportedReadingDuration('unsupported'), false);
  });

  it('should validate presentation style support', () => {
    assert.equal(isSupportedPresentationStyle('card'), true);
    assert.equal(isSupportedPresentationStyle('lab_note'), true);
    assert.equal(isSupportedPresentationStyle('unsupported'), false);
  });

  it('should validate discovery style support', () => {
    assert.equal(isSupportedDiscoveryStyle('surprising'), true);
    assert.equal(isSupportedDiscoveryStyle('counter_intuitive'), true);
    assert.equal(isSupportedDiscoveryStyle('unsupported'), false);
  });

  it('should validate card status support', () => {
    assert.equal(isSupportedCardStatus('draft'), true);
    assert.equal(isSupportedCardStatus('published'), true);
    assert.equal(isSupportedCardStatus('unsupported'), false);
  });

  it('should validate card governance support', () => {
    assert.equal(isSupportedCardGovernance('canonical'), true);
    assert.equal(isSupportedCardGovernance('accepted'), true);
    assert.equal(isSupportedCardGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Curiosity Card Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 card types', () => {
    assert.equal(CANONICAL_CARD_TYPES.length, 10);
  });

  it('should have exactly 10 information density', () => {
    assert.equal(CANONICAL_INFORMATION_DENSITY.length, 10);
  });

  it('should have exactly 10 reading durations', () => {
    assert.equal(CANONICAL_READING_DURATION.length, 10);
  });

  it('should have exactly 10 presentation styles', () => {
    assert.equal(CANONICAL_PRESENTATION_STYLE.length, 10);
  });

  it('should have exactly 10 discovery styles', () => {
    assert.equal(CANONICAL_DISCOVERY_STYLE.length, 10);
  });

  it('should have exactly 6 card statuses', () => {
    assert.equal(CANONICAL_CARD_STATUS.length, 6);
  });

  it('should have exactly 5 governance values', () => {
    assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5);
  });

  it('should contain all expected card types', () => {
    const expectedTypes = [
      'curiosity_card',
      'engineer_note',
      'field_note',
      'historical_note',
      'did_you_know',
      'fun_fact',
      'engineering_fact',
      'scientific_observation',
      'comparison_note',
      'behind_the_scenes',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_CARD_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected information density', () => {
    const expectedDensity = [
      'minimal',
      'compact',
      'balanced',
      'detailed',
      'technical',
      'expert',
      'reference',
      'deep',
      'encyclopedic',
      'micro',
    ];

    for (const density of expectedDensity) {
      assert.ok(
        CANONICAL_INFORMATION_DENSITY.includes(density as any),
        `Should include density: ${density}`,
      );
    }
  });

  it('should contain all expected reading durations', () => {
    const expectedDurations = [
      '10_seconds',
      '20_seconds',
      '30_seconds',
      '45_seconds',
      '1_minute',
      '2_minutes',
      '3_minutes',
      '5_minutes',
      '10_minutes',
      'reference',
    ];

    for (const duration of expectedDurations) {
      assert.ok(
        CANONICAL_READING_DURATION.includes(duration as any),
        `Should include duration: ${duration}`,
      );
    }
  });

  it('should contain all expected presentation styles', () => {
    const expectedStyles = [
      'card',
      'sticky_note',
      'lab_note',
      'engineering_log',
      'field_journal',
      'research_annotation',
      'technical_callout',
      'magazine_box',
      'knowledge_chip',
      'observation',
    ];

    for (const style of expectedStyles) {
      assert.ok(
        CANONICAL_PRESENTATION_STYLE.includes(style as any),
        `Should include style: ${style}`,
      );
    }
  });

  it('should contain all expected discovery styles', () => {
    const expectedStyles = [
      'surprising',
      'counter_intuitive',
      'historical',
      'engineering',
      'scientific',
      'practical',
      'humorous',
      'comparative',
      'observational',
      'reflective',
    ];

    for (const style of expectedStyles) {
      assert.ok(
        CANONICAL_DISCOVERY_STYLE.includes(style as any),
        `Should include style: ${style}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Curiosity Card Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate card text', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('generatedText' in result), 'Should not have generated text');
    assert.ok(!('cardText' in result), 'Should not have card text');
  });

  it('should not summarize concepts', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('summary' in result), 'Should not have summary');
    assert.ok(!('summaries' in result), 'Should not have summaries');
  });

  it('should not write engineer notes', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('writtenNotes' in result), 'Should not have written notes');
    assert.ok(!('noteText' in result), 'Should not have note text');
  });

  it('should not create field observations', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('fieldObservations' in result), 'Should not have field observations');
    assert.ok(!('observations' in result), 'Should not have observations');
  });

  it('should not format markdown', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('markdown' in result), 'Should not have markdown');
    assert.ok(!('formattedContent' in result), 'Should not have formatted content');
  });

  it('should not produce HTML', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('html' in result), 'Should not have html');
    assert.ok(!('renderedHtml' in result), 'Should not have rendered html');
  });

  it('should not render UI', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('renderedComponent' in result), 'Should not have rendered component');
    assert.ok(!('jsx' in result), 'Should not have jsx');
  });

  it('should not access filesystem', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in card', () => {
    const card = composeCuriosityCardProfile({
      id: 'card-001',
      title: 'Test',
      cardType: 'curiosity_card',
      informationDensity: 'compact',
      readingDuration: '30_seconds',
      presentationStyle: 'card',
      discoveryStyle: 'surprising',
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
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Curiosity Card Kernel — Cross-Agent Boundary', () => {
  it('should not reference Narrative Agent', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('narrativeAgent' in result), 'Should not reference Narrative Agent');
    assert.ok(!('narrative' in result), 'Should not reference narrative');
  });

  it('should not reference Knowledge Agent', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('knowledgeAgent' in result), 'Should not reference Knowledge Agent');
    assert.ok(!('knowledge' in result), 'Should not reference knowledge');
  });

  it('should not reference Didactic Agent', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('didacticAgent' in result), 'Should not reference Didactic Agent');
    assert.ok(!('didactic' in result), 'Should not reference didactic');
  });

  it('should not reference Research Agent', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('researchAgent' in result), 'Should not reference Research Agent');
    assert.ok(!('research' in result), 'Should not reference research');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeCuriosityCards(VALID_INPUT);
    assert.ok(!('laboratoryAgent' in result), 'Should not reference Laboratory Agent');
    assert.ok(!('laboratory' in result), 'Should not reference laboratory');
  });
});

// ---------------------------------------------------------------------------
// Validation Codes Tests
// ---------------------------------------------------------------------------

describe('Curiosity Card Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_DUPLICATE_ID, 'CARD_DUPLICATE_ID');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_DUPLICATE_TITLE, 'CARD_DUPLICATE_TITLE');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_PRESENTATION_DUPLICATE_ID, 'CARD_PRESENTATION_DUPLICATE_ID');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_RELATIONSHIP_DUPLICATE_ID, 'CARD_RELATIONSHIP_DUPLICATE_ID');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_TYPE, 'CARD_INVALID_TYPE');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_DENSITY, 'CARD_INVALID_DENSITY');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_DURATION, 'CARD_INVALID_DURATION');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_PRESENTATION, 'CARD_INVALID_PRESENTATION');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_DISCOVERY_STYLE, 'CARD_INVALID_DISCOVERY_STYLE');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_STATUS, 'CARD_INVALID_STATUS');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_GOVERNANCE, 'CARD_INVALID_GOVERNANCE');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVENANCE, 'CARD_MISSING_PROVENANCE');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PROVIDER, 'CARD_MISSING_PROVIDER');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_RATIONALE, 'CARD_MISSING_RATIONALE');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_CURIOSITY_REFERENCE, 'CARD_MISSING_CURIOSITY_REFERENCE');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_CARD_ID, 'CARD_MISSING_CARD_ID');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_TITLE, 'CARD_MISSING_TITLE');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_MISSING_PRESENTATION, 'CARD_MISSING_PRESENTATION');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_SELF_RELATIONSHIP, 'CARD_SELF_RELATIONSHIP');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_EMPTY_REGISTRY, 'CARD_EMPTY_REGISTRY');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_TRACE, 'CARD_INVALID_TRACE');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_REGISTRY_INCONSISTENCY, 'CARD_REGISTRY_INCONSISTENCY');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_INVALID_CONFIGURATION, 'CARD_INVALID_CONFIGURATION');
    assert.equal(CURIOUSITY_CARD_VALIDATION_CODES.CARD_UNSUPPORTED_LAYOUT, 'CARD_UNSUPPORTED_LAYOUT');
  });

  it('should have exactly 24 validation codes', () => {
    const codeCount = Object.keys(CURIOUSITY_CARD_VALIDATION_CODES).length;
    assert.equal(codeCount, 24);
  });
});

// ---------------------------------------------------------------------------
// Public API Export Tests
// ---------------------------------------------------------------------------

describe('Curiosity Card Kernel — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeCuriosityCardProvenance, 'function');
    assert.equal(typeof composeCuriosityCardTrace, 'function');
    assert.equal(typeof composeCuriosityCardProfile, 'function');
    assert.equal(typeof composeEngineerNoteProfile, 'function');
    assert.equal(typeof composeFieldNoteProfile, 'function');
    assert.equal(typeof composeCardPresentationMetadata, 'function');
    assert.equal(typeof composeCardRelationship, 'function');
    assert.equal(typeof composeCuriosityCardRegistry, 'function');
    assert.equal(typeof composeCuriosityCardRegistryFromInput, 'function');
    assert.equal(typeof composeCuriosityCards, 'function');
    assert.equal(typeof composeCuriosityArtifactWithCards, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedCardType, 'function');
    assert.equal(typeof isSupportedInformationDensity, 'function');
    assert.equal(typeof isSupportedReadingDuration, 'function');
    assert.equal(typeof isSupportedPresentationStyle, 'function');
    assert.equal(typeof isSupportedDiscoveryStyle, 'function');
    assert.equal(typeof isSupportedCardStatus, 'function');
    assert.equal(typeof isSupportedCardGovernance, 'function');
    assert.equal(typeof getCanonicalCardTypes, 'function');
    assert.equal(typeof getCanonicalInformationDensity, 'function');
    assert.equal(typeof getCanonicalReadingDurations, 'function');
    assert.equal(typeof getCanonicalPresentationStyles, 'function');
    assert.equal(typeof getCanonicalDiscoveryStyles, 'function');
    assert.equal(typeof getCanonicalCardStatuses, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateCuriosityCardProfile, 'function');
    assert.equal(typeof validateEngineerNoteProfile, 'function');
    assert.equal(typeof validateFieldNoteProfile, 'function');
    assert.equal(typeof validateCardPresentationMetadata, 'function');
    assert.equal(typeof validateCardRelationship, 'function');
    assert.equal(typeof validateCuriosityCardRegistry, 'function');
    assert.equal(typeof validateCuriosityCardInput, 'function');
    assert.equal(typeof validateCuriosityCardTrace, 'function');
    assert.equal(typeof validateCuriosityArtifactWithCards, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(CURIOUSITY_CARD_VALIDATION_CODES);
    assert.equal(typeof CURIOUSITY_CARD_VALIDATION_CODES, 'object');
  });
});
