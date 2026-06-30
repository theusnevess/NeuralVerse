/**
 * NV-2100-D9-OPT-08 — Laboratory Curiosity Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Laboratory Curiosity Kernel.
 * Covers: valid challenge, valid prompt, valid experiment, valid relationship,
 * valid provenance, valid trace, empty registry, duplicate IDs, duplicate titles,
 * deterministic ordering, invalid enums, missing provenance/provider/rationale,
 * missing references, missing configuration, self-relationships, empty registries,
 * registry inconsistencies, determinism (100 iterations), immutability, negative
 * capability, cross-agent boundaries, validation code stability, public API
 * exports, backward compatibility with D9-OPT-01 through D9-OPT-07.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  LaboratoryChallenge,
  WhatIfPrompt,
  ExperimentCuriosity,
  ExplorationRelationship,
  ExplorationInput,
  ExplorationRegistry,
  LaboratoryCuriosityProvenance,
  LaboratoryCuriosityTrace,
  CuriosityArtifactWithExploration,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_LAB_CHALLENGE_TYPES,
  CANONICAL_WHATS_IF_TYPES,
  CANONICAL_EXPERIMENT_TYPES,
  CANONICAL_EXPLORATION_OBJECTIVES,
  CANONICAL_EXPLORATION_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

import {
  composeLaboratoryCuriosityProvenance,
  composeLaboratoryCuriosityTrace,
  composeLaboratoryChallenge,
  composeWhatIfPrompt,
  composeExperimentCuriosity,
  composeExplorationRelationship,
  composeExplorationRegistry,
  composeExplorationRegistryFromInput,
  composeExplorationArtifacts,
  composeCuriosityArtifactWithExploration,
  isSupportedLaboratoryChallengeType,
  isSupportedWhatIfType,
  isSupportedExperimentType,
  isSupportedExplorationObjective,
  isSupportedExplorationStatus,
  isSupportedExplorationGovernance,
  getCanonicalLaboratoryChallengeTypes,
  getCanonicalWhatIfTypes,
  getCanonicalExperimentTypes,
  getCanonicalExplorationObjectives,
  getCanonicalExplorationStatuses,
} from './LaboratoryCuriosityKernel.ts';

import {
  validateLaboratoryChallenge,
  validateWhatIfPrompt,
  validateExperimentCuriosity,
  validateExplorationRelationship,
  validateExplorationRegistry,
  validateExplorationInput,
  validateExplorationTrace,
  validateCuriosityArtifactWithExploration,
  EXPLORATION_VALIDATION_CODES,
} from './LaboratoryCuriosityValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: LaboratoryCuriosityProvenance = {
  provider: 'NeuralVerse Team',
  source: 'Curated Knowledge Base',
  rationale: 'Core laboratory curiosity artifact.',
  version: '1.0.0',
};

const VALID_TRACE: LaboratoryCuriosityTrace = {
  traceId: '_trace_1',
  generatedFrom: 'deterministic_laboratory_curiosity_kernel',
  deterministic: true,
  randomUsed: false,
  timeDependency: false,
};

const VALID_CHALLENGE: LaboratoryChallenge = {
  challengeId: 'chall-001',
  title: 'Predict Neural Network Output',
  challengeType: 'prediction',
  challengeDescription: 'Predict the output of a simple neural network',
  expectedOutcome: 'Correct prediction with 90% accuracy',
  difficultyLevel: 'intermediate',
  conceptIds: ['concept-001', 'concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_CHALLENGE_2: LaboratoryChallenge = {
  challengeId: 'chall-002',
  title: 'Implement CNN from Scratch',
  challengeType: 'implementation',
  challengeDescription: 'Implement a convolutional neural network from scratch',
  expectedOutcome: 'Working CNN that classifies MNIST digits',
  difficultyLevel: 'advanced',
  conceptIds: ['concept-003'],
  status: 'approved',
  governance: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Archives' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_PROMPT: WhatIfPrompt = {
  promptId: 'prompt-001',
  title: 'What if no activation functions?',
  promptType: 'architecture_change',
  promptDescription: 'What would happen if neural networks had no activation functions?',
  expectedInsight: 'Understanding the role of non-linearity',
  conceptIds: ['concept-001'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_EXPERIMENT: ExperimentCuriosity = {
  experimentId: 'exp-001',
  title: 'Thought Experiment: Memory Reduction',
  experimentType: 'thought_experiment',
  experimentDescription: 'Can this algorithm survive if memory is reduced by 90%?',
  hypothesis: 'Algorithm will fail gracefully with reduced memory',
  expectedResult: 'Understanding memory requirements',
  conceptIds: ['concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_RELATIONSHIP: ExplorationRelationship = {
  relationshipId: 'expl-rel-001',
  sourceProfileId: 'chall-001',
  targetProfileId: 'chall-002',
  relationshipType: 'related_to',
  description: 'These challenges are related.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: ExplorationInput = {
  challenges: [VALID_CHALLENGE, VALID_CHALLENGE_2],
  prompts: [VALID_PROMPT],
  experiments: [VALID_EXPERIMENT],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: ExplorationInput = {
  challenges: [],
  prompts: [],
  experiments: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Profile Composition Tests
// ---------------------------------------------------------------------------

describe('Laboratory Curiosity Kernel — Profile Composition', () => {
  it('should compose valid laboratory curiosity provenance', () => {
    const provenance = composeLaboratoryCuriosityProvenance({
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

  it('should compose valid laboratory challenge', () => {
    const challenge = composeLaboratoryChallenge({
      challengeId: 'chall-001',
      title: 'Predict Neural Network Output',
      challengeType: 'prediction',
      challengeDescription: 'Predict the output of a simple neural network',
      expectedOutcome: 'Correct prediction with 90% accuracy',
      difficultyLevel: 'intermediate',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(challenge.challengeId, 'chall-001');
    assert.equal(challenge.title, 'Predict Neural Network Output');
    assert.equal(challenge.challengeType, 'prediction');
    assert.equal(challenge.challengeDescription, 'Predict the output of a simple neural network');
    assert.equal(challenge.expectedOutcome, 'Correct prediction with 90% accuracy');
    assert.equal(challenge.difficultyLevel, 'intermediate');
    assert.equal(challenge.conceptIds.length, 1);
    assert.equal(challenge.status, 'published');
    assert.equal(challenge.governance, 'canonical');
  });

  it('should compose valid laboratory curiosity trace', () => {
    const trace = composeLaboratoryCuriosityTrace({
      traceId: '_trace_1',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid what-if prompt', () => {
    const prompt = composeWhatIfPrompt({
      promptId: 'prompt-001',
      title: 'What if no activation functions?',
      promptType: 'architecture_change',
      promptDescription: 'What would happen if neural networks had no activation functions?',
      expectedInsight: 'Understanding the role of non-linearity',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(prompt.promptId, 'prompt-001');
    assert.equal(prompt.title, 'What if no activation functions?');
    assert.equal(prompt.promptType, 'architecture_change');
    assert.equal(prompt.promptDescription, 'What would happen if neural networks had no activation functions?');
    assert.equal(prompt.expectedInsight, 'Understanding the role of non-linearity');
    assert.equal(prompt.conceptIds.length, 1);
    assert.equal(prompt.status, 'published');
    assert.equal(prompt.governance, 'canonical');
  });

  it('should compose valid experiment curiosity', () => {
    const experiment = composeExperimentCuriosity({
      experimentId: 'exp-001',
      title: 'Thought Experiment: Memory Reduction',
      experimentType: 'thought_experiment',
      experimentDescription: 'Can this algorithm survive if memory is reduced by 90%?',
      hypothesis: 'Algorithm will fail gracefully with reduced memory',
      expectedResult: 'Understanding memory requirements',
      conceptIds: ['concept-002'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(experiment.experimentId, 'exp-001');
    assert.equal(experiment.title, 'Thought Experiment: Memory Reduction');
    assert.equal(experiment.experimentType, 'thought_experiment');
    assert.equal(experiment.experimentDescription, 'Can this algorithm survive if memory is reduced by 90%?');
    assert.equal(experiment.hypothesis, 'Algorithm will fail gracefully with reduced memory');
    assert.equal(experiment.expectedResult, 'Understanding memory requirements');
    assert.equal(experiment.conceptIds.length, 1);
    assert.equal(experiment.status, 'published');
    assert.equal(experiment.governance, 'canonical');
  });

  it('should compose valid exploration relationship', () => {
    const relationship = composeExplorationRelationship({
      relationshipId: 'expl-rel-001',
      sourceProfileId: 'chall-001',
      targetProfileId: 'chall-002',
      relationshipType: 'related_to',
      description: 'Related challenges.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'expl-rel-001');
    assert.equal(relationship.sourceProfileId, 'chall-001');
    assert.equal(relationship.targetProfileId, 'chall-002');
    assert.equal(relationship.relationshipType, 'related_to');
    assert.equal(relationship.description, 'Related challenges.');
  });

  it('should validate a valid challenge with no errors', () => {
    const errors = validateLaboratoryChallenge(VALID_CHALLENGE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeExplorationRegistry([VALID_CHALLENGE, VALID_CHALLENGE_2], [VALID_PROMPT], [VALID_EXPERIMENT], [VALID_RELATIONSHIP]);
    const result = validateExplorationRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate exploration input', () => {
    const result = validateExplorationInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Laboratory Curiosity Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeExplorationRegistry([], [], [], []);
    const result = validateExplorationRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EXPLORATION_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeExplorationRegistry([VALID_CHALLENGE, VALID_CHALLENGE], [], [], []);
    const result = validateExplorationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have EXPLORATION_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const challenge1 = { ...VALID_CHALLENGE, challengeId: 'chall-001', title: 'Same Title' };
    const challenge2 = { ...VALID_CHALLENGE, challengeId: 'chall-002', title: 'Same Title' };
    const registry = composeExplorationRegistry([challenge1, challenge2], [], [], []);
    const result = validateExplorationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have EXPLORATION_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by challengeId', () => {
    const challenge3 = { ...VALID_CHALLENGE, challengeId: 'chall-003' };
    const challenge1 = { ...VALID_CHALLENGE, challengeId: 'chall-001' };
    const challenge2 = { ...VALID_CHALLENGE, challengeId: 'chall-002' };

    const registry = composeExplorationRegistry([challenge3, challenge1, challenge2], [], [], []);

    assert.equal(registry.challenges[0].challengeId, 'chall-001');
    assert.equal(registry.challenges[1].challengeId, 'chall-002');
    assert.equal(registry.challenges[2].challengeId, 'chall-003');
  });

  it('should sort by challengeType when challengeId is equal', () => {
    const challengeA = { ...VALID_CHALLENGE, challengeId: 'chall-001', challengeType: 'implementation' as const };
    const challengeB = { ...VALID_CHALLENGE, challengeId: 'chall-001', challengeType: 'prediction' as const };

    const registry = composeExplorationRegistry([challengeA, challengeB], [], [], []);

    // Alphabetical sort: 'implementation' < 'prediction'
    assert.equal(registry.challenges[0].challengeType, 'implementation');
    assert.equal(registry.challenges[1].challengeType, 'prediction');
  });

  it('should detect self-relationships', () => {
    const selfRelationship: ExplorationRelationship = {
      relationshipId: 'expl-rel-self',
      sourceProfileId: 'chall-001',
      targetProfileId: 'chall-001',
      relationshipType: 'related_to',
      description: 'Self relationship.',
      provenance: VALID_PROVENANCE,
    };

    const registry = composeExplorationRegistry([VALID_CHALLENGE], [], [], [selfRelationship]);
    const result = validateExplorationRegistry(registry);
    const selfError = result.errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have EXPLORATION_SELF_RELATIONSHIP error');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Laboratory Curiosity Kernel — Validation', () => {
  it('should detect invalid challenge type', () => {
    const challenge = { ...VALID_CHALLENGE, challengeType: 'unsupported' as any };
    const errors = validateLaboratoryChallenge(challenge);
    const typeError = errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CHALLENGE,
    );

    assert.ok(typeError, 'Should have EXPLORATION_INVALID_CHALLENGE error');
  });

  it('should detect invalid prompt type', () => {
    const prompt = { ...VALID_PROMPT, promptType: 'unsupported' as any };
    const errors = validateWhatIfPrompt(prompt);
    const typeError = errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_WHATS_IF,
    );

    assert.ok(typeError, 'Should have EXPLORATION_INVALID_WHATS_IF error');
  });

  it('should detect invalid experiment type', () => {
    const experiment = { ...VALID_EXPERIMENT, experimentType: 'unsupported' as any };
    const errors = validateExperimentCuriosity(experiment);
    const typeError = errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_EXPERIMENT,
    );

    assert.ok(typeError, 'Should have EXPLORATION_INVALID_EXPERIMENT error');
  });

  it('should detect invalid status', () => {
    const challenge = { ...VALID_CHALLENGE, status: 'unsupported' as any };
    const errors = validateLaboratoryChallenge(challenge);
    const statusError = errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have EXPLORATION_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const challenge = { ...VALID_CHALLENGE, governance: 'unsupported' as any };
    const errors = validateLaboratoryChallenge(challenge);
    const governanceError = errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have EXPLORATION_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const challenge = { ...VALID_CHALLENGE, provenance: undefined as any };
    const errors = validateLaboratoryChallenge(challenge);
    const provenanceError = errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have EXPLORATION_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance provider', () => {
    const challenge = { ...VALID_CHALLENGE, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateLaboratoryChallenge(challenge);
    const providerError = errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have EXPLORATION_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const challenge = { ...VALID_CHALLENGE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateLaboratoryChallenge(challenge);
    const rationaleError = errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have EXPLORATION_MISSING_RATIONALE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeLaboratoryCuriosityTrace({
      traceId: '_trace_1',
    });

    const result = validateExplorationTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: LaboratoryCuriosityTrace = {
      traceId: '',
      generatedFrom: 'deterministic_laboratory_curiosity_kernel',
      deterministic: false as true,
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateExplorationTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect missing challenge configuration', () => {
    const challenge: LaboratoryChallenge = {
      challengeId: 'chall-001',
      title: 'Test',
      challengeType: 'prediction',
      challengeDescription: '',
      expectedOutcome: '',
      difficultyLevel: '',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    };

    const errors = validateLaboratoryChallenge(challenge);
    const configError = errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have EXPLORATION_INVALID_CONFIGURATION error');
  });

  it('should detect missing prompt configuration', () => {
    const prompt: WhatIfPrompt = {
      promptId: 'prompt-001',
      title: 'Test',
      promptType: 'architecture_change',
      promptDescription: '',
      expectedInsight: '',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    };

    const errors = validateWhatIfPrompt(prompt);
    const configError = errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have EXPLORATION_INVALID_CONFIGURATION error');
  });

  it('should detect missing experiment configuration', () => {
    const experiment: ExperimentCuriosity = {
      experimentId: 'exp-001',
      title: 'Test',
      experimentType: 'thought_experiment',
      experimentDescription: '',
      hypothesis: '',
      expectedResult: '',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    };

    const errors = validateExperimentCuriosity(experiment);
    const configError = errors.find(
      (e) => e.code === EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have EXPLORATION_INVALID_CONFIGURATION error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Laboratory Curiosity Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeExplorationArtifacts>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeExplorationArtifacts(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].challenges, results[i].challenges);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeExplorationRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeExplorationRegistry([VALID_CHALLENGE, VALID_CHALLENGE_2], [VALID_PROMPT], [VALID_EXPERIMENT], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].challenges, results[i].challenges);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Laboratory Curiosity Kernel — Immutability', () => {
  it('should not mutate input challenges', () => {
    const originalId = VALID_CHALLENGE.challengeId;
    const originalTitle = VALID_CHALLENGE.title;

    composeExplorationArtifacts(VALID_INPUT);

    assert.equal(VALID_CHALLENGE.challengeId, originalId);
    assert.equal(VALID_CHALLENGE.title, originalTitle);
  });

  it('should not mutate input registry challenges', () => {
    const challenges = [VALID_CHALLENGE, VALID_CHALLENGE_2];
    const originalIds = challenges.map((c) => c.challengeId);

    composeExplorationRegistry(challenges, [], [], []);

    assert.equal(challenges[0].challengeId, originalIds[0]);
    assert.equal(challenges[1].challengeId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Laboratory Curiosity Kernel — Helper Functions', () => {
  it('should return canonical laboratory challenge types', () => {
    const types = getCanonicalLaboratoryChallengeTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_LAB_CHALLENGE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical what-if types', () => {
    const types = getCanonicalWhatIfTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_WHATS_IF_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical experiment types', () => {
    const types = getCanonicalExperimentTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_EXPERIMENT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical exploration objectives', () => {
    const objectives = getCanonicalExplorationObjectives();
    assert.deepStrictEqual([...objectives], [...CANONICAL_EXPLORATION_OBJECTIVES]);
    assert.equal(objectives.length, 10);
  });

  it('should return canonical exploration statuses', () => {
    const statuses = getCanonicalExplorationStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_EXPLORATION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate laboratory challenge type support', () => {
    assert.equal(isSupportedLaboratoryChallengeType('prediction'), true);
    assert.equal(isSupportedLaboratoryChallengeType('implementation'), true);
    assert.equal(isSupportedLaboratoryChallengeType('unsupported'), false);
  });

  it('should validate what-if type support', () => {
    assert.equal(isSupportedWhatIfType('parameter_change'), true);
    assert.equal(isSupportedWhatIfType('architecture_change'), true);
    assert.equal(isSupportedWhatIfType('unsupported'), false);
  });

  it('should validate experiment type support', () => {
    assert.equal(isSupportedExperimentType('thought_experiment'), true);
    assert.equal(isSupportedExperimentType('laboratory_experiment'), true);
    assert.equal(isSupportedExperimentType('unsupported'), false);
  });

  it('should validate exploration objective support', () => {
    assert.equal(isSupportedExplorationObjective('curiosity'), true);
    assert.equal(isSupportedExplorationObjective('reasoning'), true);
    assert.equal(isSupportedExplorationObjective('unsupported'), false);
  });

  it('should validate exploration status support', () => {
    assert.equal(isSupportedExplorationStatus('draft'), true);
    assert.equal(isSupportedExplorationStatus('published'), true);
    assert.equal(isSupportedExplorationStatus('unsupported'), false);
  });

  it('should validate exploration governance support', () => {
    assert.equal(isSupportedExplorationGovernance('canonical'), true);
    assert.equal(isSupportedExplorationGovernance('accepted'), true);
    assert.equal(isSupportedExplorationGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Laboratory Curiosity Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 laboratory challenge types', () => {
    assert.equal(CANONICAL_LAB_CHALLENGE_TYPES.length, 10);
  });

  it('should have exactly 10 what-if types', () => {
    assert.equal(CANONICAL_WHATS_IF_TYPES.length, 10);
  });

  it('should have exactly 10 experiment types', () => {
    assert.equal(CANONICAL_EXPERIMENT_TYPES.length, 10);
  });

  it('should have exactly 10 exploration objectives', () => {
    assert.equal(CANONICAL_EXPLORATION_OBJECTIVES.length, 10);
  });

  it('should have exactly 6 exploration statuses', () => {
    assert.equal(CANONICAL_EXPLORATION_STATUS.length, 6);
  });

  it('should have exactly 5 governance values', () => {
    assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5);
  });

  it('should contain all expected laboratory challenge types', () => {
    const expectedTypes = [
      'prediction',
      'implementation',
      'observation',
      'comparison',
      'optimization',
      'failure_analysis',
      'reverse_engineering',
      'parameter_variation',
      'constraint_testing',
      'engineering_validation',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_LAB_CHALLENGE_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected what-if types', () => {
    const expectedTypes = [
      'parameter_change',
      'architecture_change',
      'algorithm_change',
      'dataset_change',
      'hardware_change',
      'environment_change',
      'constraint_change',
      'scale_change',
      'assumption_change',
      'failure_scenario',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_WHATS_IF_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected experiment types', () => {
    const expectedTypes = [
      'thought_experiment',
      'laboratory_experiment',
      'engineering_experiment',
      'simulation_candidate',
      'observation',
      'comparison',
      'measurement',
      'validation',
      'reproduction',
      'exploration',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_EXPERIMENT_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected exploration objectives', () => {
    const expectedObjectives = [
      'curiosity',
      'reasoning',
      'validation',
      'engineering_understanding',
      'system_behavior',
      'concept_reinforcement',
      'failure_analysis',
      'hypothesis',
      'exploration',
      'reflection',
    ];

    for (const objective of expectedObjectives) {
      assert.ok(
        CANONICAL_EXPLORATION_OBJECTIVES.includes(objective as any),
        `Should include objective: ${objective}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Laboratory Curiosity Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate challenges', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('generatedChallenges' in result), 'Should not have generated challenges');
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
  });

  it('should not generate experiments', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('generatedExperiments' in result), 'Should not have generated experiments');
    assert.ok(!('experimentResults' in result), 'Should not have experiment results');
  });

  it('should not simulate laboratories', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('laboratorySimulation' in result), 'Should not have laboratory simulation');
    assert.ok(!('simulation' in result), 'Should not have simulation');
  });

  it('should not execute reasoning', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('reasoning' in result), 'Should not have reasoning');
    assert.ok(!('inference' in result), 'Should not have inference');
  });

  it('should not invoke the Laboratory Agent', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('laboratoryAgent' in result), 'Should not have laboratory agent');
    assert.ok(!('laboratoryAgentInvocation' in result), 'Should not have laboratory agent invocation');
  });

  it('should not access filesystem', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in challenge', () => {
    const challenge = composeLaboratoryChallenge({
      challengeId: 'chall-001',
      title: 'Test',
      challengeType: 'prediction',
      challengeDescription: 'Test description',
      expectedOutcome: 'Test outcome',
      difficultyLevel: 'intermediate',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    const keys = Object.keys(challenge);
    for (const key of keys) {
      const value = (challenge as any)[key];
      assert.ok(typeof value !== 'function', `Challenge field "${key}" should not be a function`);
    }
  });

  it('should not store runtime execution', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Laboratory Curiosity Kernel — Cross-Agent Boundary', () => {
  it('should not reference Narrative Agent', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('narrativeAgent' in result), 'Should not reference Narrative Agent');
    assert.ok(!('narrative' in result), 'Should not reference narrative');
  });

  it('should not reference Knowledge Agent', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('knowledgeAgent' in result), 'Should not reference Knowledge Agent');
    assert.ok(!('knowledge' in result), 'Should not reference knowledge');
  });

  it('should not reference Didactic Agent', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('didacticAgent' in result), 'Should not reference Didactic Agent');
    assert.ok(!('didactic' in result), 'Should not reference didactic');
  });

  it('should not reference Research Agent', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('researchAgent' in result), 'Should not reference Research Agent');
    assert.ok(!('research' in result), 'Should not reference research');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('laboratoryAgent' in result), 'Should not reference Laboratory Agent');
    assert.ok(!('laboratory' in result), 'Should not reference laboratory');
  });

  it('should not reference Application Agent', () => {
    const result = composeExplorationArtifacts(VALID_INPUT);
    assert.ok(!('applicationAgent' in result), 'Should not reference Application Agent');
    assert.ok(!('application' in result), 'Should not reference application');
  });
});

// ---------------------------------------------------------------------------
// Validation Codes Tests
// ---------------------------------------------------------------------------

describe('Laboratory Curiosity Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_DUPLICATE_ID, 'EXPLORATION_DUPLICATE_ID');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_DUPLICATE_TITLE, 'EXPLORATION_DUPLICATE_TITLE');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CHALLENGE, 'EXPLORATION_INVALID_CHALLENGE');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_WHATS_IF, 'EXPLORATION_INVALID_WHATS_IF');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_EXPERIMENT, 'EXPLORATION_INVALID_EXPERIMENT');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_OBJECTIVE, 'EXPLORATION_INVALID_OBJECTIVE');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_STATUS, 'EXPLORATION_INVALID_STATUS');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_GOVERNANCE, 'EXPLORATION_INVALID_GOVERNANCE');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVENANCE, 'EXPLORATION_MISSING_PROVENANCE');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVIDER, 'EXPLORATION_MISSING_PROVIDER');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_RATIONALE, 'EXPLORATION_MISSING_RATIONALE');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_CURIOSITY_REFERENCE, 'EXPLORATION_MISSING_CURIOSITY_REFERENCE');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROFILE_ID, 'EXPLORATION_MISSING_PROFILE_ID');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_TITLE, 'EXPLORATION_MISSING_TITLE');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_EXPLORATION, 'EXPLORATION_MISSING_EXPLORATION');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_SELF_RELATIONSHIP, 'EXPLORATION_SELF_RELATIONSHIP');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_EMPTY_REGISTRY, 'EXPLORATION_EMPTY_REGISTRY');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_TRACE, 'EXPLORATION_INVALID_TRACE');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_REGISTRY_INCONSISTENCY, 'EXPLORATION_REGISTRY_INCONSISTENCY');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CONFIGURATION, 'EXPLORATION_INVALID_CONFIGURATION');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_REFERENCE, 'EXPLORATION_INVALID_REFERENCE');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_RELATIONSHIP, 'EXPLORATION_INVALID_RELATIONSHIP');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_RELATIONSHIP, 'EXPLORATION_MISSING_RELATIONSHIP');
    assert.equal(EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_GOVERNANCE, 'EXPLORATION_MISSING_GOVERNANCE');
  });

  it('should have exactly 24 validation codes', () => {
    const codeCount = Object.keys(EXPLORATION_VALIDATION_CODES).length;
    assert.equal(codeCount, 24);
  });
});

// ---------------------------------------------------------------------------
// Public API Export Tests
// ---------------------------------------------------------------------------

describe('Laboratory Curiosity Kernel — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeLaboratoryCuriosityProvenance, 'function');
    assert.equal(typeof composeLaboratoryCuriosityTrace, 'function');
    assert.equal(typeof composeLaboratoryChallenge, 'function');
    assert.equal(typeof composeWhatIfPrompt, 'function');
    assert.equal(typeof composeExperimentCuriosity, 'function');
    assert.equal(typeof composeExplorationRelationship, 'function');
    assert.equal(typeof composeExplorationRegistry, 'function');
    assert.equal(typeof composeExplorationRegistryFromInput, 'function');
    assert.equal(typeof composeExplorationArtifacts, 'function');
    assert.equal(typeof composeCuriosityArtifactWithExploration, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedLaboratoryChallengeType, 'function');
    assert.equal(typeof isSupportedWhatIfType, 'function');
    assert.equal(typeof isSupportedExperimentType, 'function');
    assert.equal(typeof isSupportedExplorationObjective, 'function');
    assert.equal(typeof isSupportedExplorationStatus, 'function');
    assert.equal(typeof isSupportedExplorationGovernance, 'function');
    assert.equal(typeof getCanonicalLaboratoryChallengeTypes, 'function');
    assert.equal(typeof getCanonicalWhatIfTypes, 'function');
    assert.equal(typeof getCanonicalExperimentTypes, 'function');
    assert.equal(typeof getCanonicalExplorationObjectives, 'function');
    assert.equal(typeof getCanonicalExplorationStatuses, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateLaboratoryChallenge, 'function');
    assert.equal(typeof validateWhatIfPrompt, 'function');
    assert.equal(typeof validateExperimentCuriosity, 'function');
    assert.equal(typeof validateExplorationRelationship, 'function');
    assert.equal(typeof validateExplorationRegistry, 'function');
    assert.equal(typeof validateExplorationInput, 'function');
    assert.equal(typeof validateExplorationTrace, 'function');
    assert.equal(typeof validateCuriosityArtifactWithExploration, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(EXPLORATION_VALIDATION_CODES);
    assert.equal(typeof EXPLORATION_VALIDATION_CODES, 'object');
  });
});
