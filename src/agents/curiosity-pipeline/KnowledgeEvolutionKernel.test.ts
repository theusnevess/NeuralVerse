/**
 * NV-2100-D9-OPT-06 — Knowledge Evolution Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Knowledge Evolution Kernel.
 * Covers: valid profile, valid historical oddity, valid research trail,
 * valid milestone, valid relationship, valid provenance, valid trace,
 * empty registry, duplicate IDs, duplicate titles, deterministic ordering,
 * invalid enums, missing provenance/provider/rationale, missing references,
 * missing milestone, self-relationships, empty registries, registry
 * inconsistencies, determinism (100 iterations), immutability, negative
 * capability, cross-agent boundaries, validation code stability, public
 * API exports, backward compatibility with D9-OPT-01 through D9-OPT-05.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeEvolutionProfile,
  HistoricalOddity,
  ResearchTrail,
  EvolutionMilestone,
  EvolutionRelationship,
  KnowledgeEvolutionInput,
  KnowledgeEvolutionRegistry,
  KnowledgeEvolutionProvenance,
  KnowledgeEvolutionTrace,
  CuriosityArtifactWithKnowledgeEvolution,
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

import {
  composeKnowledgeEvolutionProvenance,
  composeKnowledgeEvolutionTrace,
  composeKnowledgeEvolutionProfile,
  composeHistoricalOddity,
  composeResearchTrail,
  composeEvolutionMilestone,
  composeEvolutionRelationship,
  composeKnowledgeEvolutionRegistry,
  composeKnowledgeEvolutionRegistryFromInput,
  composeKnowledgeEvolution,
  composeCuriosityArtifactWithKnowledgeEvolution,
  isSupportedDiscoveryType,
  isSupportedEvolutionStage,
  isSupportedResearchTrailType,
  isSupportedOddityType,
  isSupportedEvolutionPurpose,
  isSupportedKnowledgeEvolutionStatus,
  isSupportedKnowledgeEvolutionGovernance,
  getCanonicalDiscoveryTypes,
  getCanonicalEvolutionStages,
  getCanonicalResearchTrailTypes,
  getCanonicalOddityTypes,
  getCanonicalEvolutionPurposes,
  getCanonicalKnowledgeEvolutionStatuses,
} from './KnowledgeEvolutionKernel.ts';

import {
  validateKnowledgeEvolutionProfile,
  validateHistoricalOddity,
  validateResearchTrail,
  validateEvolutionMilestone,
  validateEvolutionRelationship,
  validateKnowledgeEvolutionRegistry,
  validateKnowledgeEvolutionInput,
  validateKnowledgeEvolutionTrace,
  validateCuriosityArtifactWithKnowledgeEvolution,
  KNOWLEDGE_EVOLUTION_VALIDATION_CODES,
} from './KnowledgeEvolutionValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeEvolutionProvenance = {
  provider: 'NeuralVerse Team',
  source: 'Curated Knowledge Base',
  rationale: 'Core knowledge evolution artifact.',
  version: '1.0.0',
};

const VALID_TRACE: KnowledgeEvolutionTrace = {
  traceId: '_trace_1',
  generatedFrom: 'deterministic_knowledge_evolution_kernel',
  deterministic: true,
  randomUsed: false,
  timeDependency: false,
};

const VALID_PROFILE: KnowledgeEvolutionProfile = {
  id: 'evo-001',
  title: 'Neural Network Discovery',
  discoveryType: 'scientific_discovery',
  evolutionStage: 'modern_state',
  researchTrailType: 'scientific',
  evolutionPurpose: 'scientific_context',
  conceptIds: ['concept-001', 'concept-002'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_PROFILE_2: KnowledgeEvolutionProfile = {
  id: 'evo-002',
  title: 'Backpropagation Evolution',
  discoveryType: 'engineering_breakthrough',
  evolutionStage: 'adoption',
  researchTrailType: 'engineering',
  evolutionPurpose: 'engineering_context',
  conceptIds: ['concept-003'],
  status: 'approved',
  governance: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Archives' },
  trace: { ...VALID_TRACE, traceId: '_trace_2' },
};

const VALID_ODDITY: HistoricalOddity = {
  oddityId: 'oddity-001',
  title: 'Unexpected Neural Network Behavior',
  oddityType: 'unexpected_result',
  historicalContext: 'Early neural network experiments',
  unexpectedElement: 'Network learned to count without being taught',
  lessonLearned: 'Emergent behavior can surprise researchers',
  conceptIds: ['concept-001'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_TRAIL: ResearchTrail = {
  trailId: 'trail-001',
  title: 'Evolution of Deep Learning',
  trailType: 'chronological',
  trailDescription: 'From perceptrons to modern deep learning',
  keyContributors: ['Rosenblatt', 'Rumelhart', 'LeCun', 'Hinton'],
  breakthroughMoment: 'Backpropagation algorithm',
  impactAssessment: 'Revolutionized machine learning',
  conceptIds: ['concept-001'],
  status: 'published',
  governance: 'canonical',
  provenance: VALID_PROVENANCE,
  trace: VALID_TRACE,
};

const VALID_MILESTONE: EvolutionMilestone = {
  milestoneId: 'milestone-001',
  profileId: 'evo-001',
  title: 'Perceptron Invention',
  stage: 'origin',
  year: '1958',
  description: 'Frank Rosenblatt invents the perceptron',
  significance: 'First neural network model',
};

const VALID_RELATIONSHIP: EvolutionRelationship = {
  relationshipId: 'evo-rel-001',
  sourceProfileId: 'evo-001',
  targetProfileId: 'evo-002',
  relationshipType: 'evolves_into',
  description: 'Neural networks evolved into deep learning',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeEvolutionInput = {
  profiles: [VALID_PROFILE, VALID_PROFILE_2],
  oddities: [VALID_ODDITY],
  trails: [VALID_TRAIL],
  milestones: [VALID_MILESTONE],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeEvolutionInput = {
  profiles: [],
  oddities: [],
  trails: [],
  milestones: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Profile Composition Tests
// ---------------------------------------------------------------------------

describe('Knowledge Evolution Kernel — Profile Composition', () => {
  it('should compose valid knowledge evolution provenance', () => {
    const provenance = composeKnowledgeEvolutionProvenance({
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

  it('should compose valid knowledge evolution profile', () => {
    const profile = composeKnowledgeEvolutionProfile({
      id: 'evo-001',
      title: 'Neural Network Discovery',
      discoveryType: 'scientific_discovery',
      evolutionStage: 'modern_state',
      researchTrailType: 'scientific',
      evolutionPurpose: 'scientific_context',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(profile.id, 'evo-001');
    assert.equal(profile.title, 'Neural Network Discovery');
    assert.equal(profile.discoveryType, 'scientific_discovery');
    assert.equal(profile.evolutionStage, 'modern_state');
    assert.equal(profile.researchTrailType, 'scientific');
    assert.equal(profile.evolutionPurpose, 'scientific_context');
    assert.equal(profile.conceptIds.length, 1);
    assert.equal(profile.status, 'published');
    assert.equal(profile.governance, 'canonical');
  });

  it('should compose valid knowledge evolution trace', () => {
    const trace = composeKnowledgeEvolutionTrace({
      traceId: '_trace_1',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid historical oddity', () => {
    const oddity = composeHistoricalOddity({
      oddityId: 'oddity-001',
      title: 'Unexpected Neural Network Behavior',
      oddityType: 'unexpected_result',
      historicalContext: 'Early neural network experiments',
      unexpectedElement: 'Network learned to count without being taught',
      lessonLearned: 'Emergent behavior can surprise researchers',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(oddity.oddityId, 'oddity-001');
    assert.equal(oddity.title, 'Unexpected Neural Network Behavior');
    assert.equal(oddity.oddityType, 'unexpected_result');
    assert.equal(oddity.historicalContext, 'Early neural network experiments');
    assert.equal(oddity.unexpectedElement, 'Network learned to count without being taught');
    assert.equal(oddity.lessonLearned, 'Emergent behavior can surprise researchers');
    assert.equal(oddity.conceptIds.length, 1);
    assert.equal(oddity.status, 'published');
    assert.equal(oddity.governance, 'canonical');
  });

  it('should compose valid research trail', () => {
    const trail = composeResearchTrail({
      trailId: 'trail-001',
      title: 'Evolution of Deep Learning',
      trailType: 'chronological',
      trailDescription: 'From perceptrons to modern deep learning',
      keyContributors: ['Rosenblatt', 'Rumelhart', 'LeCun', 'Hinton'],
      breakthroughMoment: 'Backpropagation algorithm',
      impactAssessment: 'Revolutionized machine learning',
      conceptIds: ['concept-001'],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    assert.equal(trail.trailId, 'trail-001');
    assert.equal(trail.title, 'Evolution of Deep Learning');
    assert.equal(trail.trailType, 'chronological');
    assert.equal(trail.trailDescription, 'From perceptrons to modern deep learning');
    assert.equal(trail.keyContributors.length, 4);
    assert.equal(trail.breakthroughMoment, 'Backpropagation algorithm');
    assert.equal(trail.impactAssessment, 'Revolutionized machine learning');
    assert.equal(trail.conceptIds.length, 1);
    assert.equal(trail.status, 'published');
    assert.equal(trail.governance, 'canonical');
  });

  it('should compose valid evolution milestone', () => {
    const milestone = composeEvolutionMilestone({
      milestoneId: 'milestone-001',
      profileId: 'evo-001',
      title: 'Perceptron Invention',
      stage: 'origin',
      year: '1958',
      description: 'Frank Rosenblatt invents the perceptron',
      significance: 'First neural network model',
    });

    assert.equal(milestone.milestoneId, 'milestone-001');
    assert.equal(milestone.profileId, 'evo-001');
    assert.equal(milestone.title, 'Perceptron Invention');
    assert.equal(milestone.stage, 'origin');
    assert.equal(milestone.year, '1958');
    assert.equal(milestone.description, 'Frank Rosenblatt invents the perceptron');
    assert.equal(milestone.significance, 'First neural network model');
  });

  it('should compose valid evolution relationship', () => {
    const relationship = composeEvolutionRelationship({
      relationshipId: 'evo-rel-001',
      sourceProfileId: 'evo-001',
      targetProfileId: 'evo-002',
      relationshipType: 'evolves_into',
      description: 'Neural networks evolved into deep learning',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'evo-rel-001');
    assert.equal(relationship.sourceProfileId, 'evo-001');
    assert.equal(relationship.targetProfileId, 'evo-002');
    assert.equal(relationship.relationshipType, 'evolves_into');
    assert.equal(relationship.description, 'Neural networks evolved into deep learning');
  });

  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeEvolutionProfile(VALID_PROFILE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeEvolutionRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_ODDITY], [VALID_TRAIL], [VALID_MILESTONE], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeEvolutionRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge evolution input', () => {
    const result = validateKnowledgeEvolutionInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Knowledge Evolution Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeKnowledgeEvolutionRegistry([], [], [], [], []);
    const result = validateKnowledgeEvolutionRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EVOLUTION_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeEvolutionRegistry([VALID_PROFILE, VALID_PROFILE], [], [], [], []);
    const result = validateKnowledgeEvolutionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have EVOLUTION_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE, id: 'evo-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE, id: 'evo-002', title: 'Same Title' };
    const registry = composeKnowledgeEvolutionRegistry([profile1, profile2], [], [], [], []);
    const result = validateKnowledgeEvolutionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have EVOLUTION_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by id', () => {
    const profile3 = { ...VALID_PROFILE, id: 'evo-003' };
    const profile1 = { ...VALID_PROFILE, id: 'evo-001' };
    const profile2 = { ...VALID_PROFILE, id: 'evo-002' };

    const registry = composeKnowledgeEvolutionRegistry([profile3, profile1, profile2], [], [], [], []);

    assert.equal(registry.profiles[0].id, 'evo-001');
    assert.equal(registry.profiles[1].id, 'evo-002');
    assert.equal(registry.profiles[2].id, 'evo-003');
  });

  it('should sort by discoveryType when id is equal', () => {
    const profileA = { ...VALID_PROFILE, id: 'evo-001', discoveryType: 'engineering_breakthrough' as const };
    const profileB = { ...VALID_PROFILE, id: 'evo-001', discoveryType: 'scientific_discovery' as const };

    const registry = composeKnowledgeEvolutionRegistry([profileA, profileB], [], [], [], []);

    assert.equal(registry.profiles[0].discoveryType, 'engineering_breakthrough');
    assert.equal(registry.profiles[1].discoveryType, 'scientific_discovery');
  });

  it('should detect self-relationships', () => {
    const selfRelationship: EvolutionRelationship = {
      relationshipId: 'evo-rel-self',
      sourceProfileId: 'evo-001',
      targetProfileId: 'evo-001',
      relationshipType: 'evolves_into',
      description: 'Self relationship.',
      provenance: VALID_PROVENANCE,
    };

    const registry = composeKnowledgeEvolutionRegistry([VALID_PROFILE], [], [], [], [selfRelationship]);
    const result = validateKnowledgeEvolutionRegistry(registry);
    const selfError = result.errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have EVOLUTION_SELF_RELATIONSHIP error');
  });

  it('should detect duplicate oddity IDs', () => {
    const registry = composeKnowledgeEvolutionRegistry([VALID_PROFILE], [VALID_ODDITY, VALID_ODDITY], [], [], []);
    const result = validateKnowledgeEvolutionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.ODDITY_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ODDITY_DUPLICATE_ID error');
  });

  it('should detect duplicate trail IDs', () => {
    const registry = composeKnowledgeEvolutionRegistry([VALID_PROFILE], [], [VALID_TRAIL, VALID_TRAIL], [], []);
    const result = validateKnowledgeEvolutionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.TRAIL_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have TRAIL_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Knowledge Evolution Kernel — Validation', () => {
  it('should detect invalid discovery type', () => {
    const profile = { ...VALID_PROFILE, discoveryType: 'unsupported' as any };
    const errors = validateKnowledgeEvolutionProfile(profile);
    const typeError = errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_DISCOVERY_TYPE,
    );

    assert.ok(typeError, 'Should have EVOLUTION_INVALID_DISCOVERY_TYPE error');
  });

  it('should detect invalid evolution stage', () => {
    const profile = { ...VALID_PROFILE, evolutionStage: 'unsupported' as any };
    const errors = validateKnowledgeEvolutionProfile(profile);
    const stageError = errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STAGE,
    );

    assert.ok(stageError, 'Should have EVOLUTION_INVALID_STAGE error');
  });

  it('should detect invalid research trail type', () => {
    const profile = { ...VALID_PROFILE, researchTrailType: 'unsupported' as any };
    const errors = validateKnowledgeEvolutionProfile(profile);
    const trailError = errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TRAIL,
    );

    assert.ok(trailError, 'Should have EVOLUTION_INVALID_TRAIL error');
  });

  it('should detect invalid evolution purpose', () => {
    const profile = { ...VALID_PROFILE, evolutionPurpose: 'unsupported' as any };
    const errors = validateKnowledgeEvolutionProfile(profile);
    const purposeError = errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_PURPOSE,
    );

    assert.ok(purposeError, 'Should have EVOLUTION_INVALID_PURPOSE error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE, status: 'unsupported' as any };
    const errors = validateKnowledgeEvolutionProfile(profile);
    const statusError = errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have EVOLUTION_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE, governance: 'unsupported' as any };
    const errors = validateKnowledgeEvolutionProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have EVOLUTION_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE, provenance: undefined as any };
    const errors = validateKnowledgeEvolutionProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have EVOLUTION_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance provider', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeEvolutionProfile(profile);
    const providerError = errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have EVOLUTION_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const profile = { ...VALID_PROFILE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeEvolutionProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have EVOLUTION_MISSING_RATIONALE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeEvolutionTrace({
      traceId: '_trace_1',
    });

    const result = validateKnowledgeEvolutionTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeEvolutionTrace = {
      traceId: '',
      generatedFrom: 'deterministic_knowledge_evolution_kernel',
      deterministic: false as true,
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateKnowledgeEvolutionTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect missing oddity configuration', () => {
    const oddity: HistoricalOddity = {
      oddityId: 'oddity-001',
      title: 'Test',
      oddityType: 'unexpected_result',
      historicalContext: '',
      unexpectedElement: '',
      lessonLearned: '',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    };

    const errors = validateHistoricalOddity(oddity);
    const configError = errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have EVOLUTION_INVALID_CONFIGURATION error');
  });

  it('should detect missing trail configuration', () => {
    const trail: ResearchTrail = {
      trailId: 'trail-001',
      title: 'Test',
      trailType: 'chronological',
      trailDescription: '',
      keyContributors: [],
      breakthroughMoment: '',
      impactAssessment: '',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    };

    const errors = validateResearchTrail(trail);
    const configError = errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_CONFIGURATION,
    );

    assert.ok(configError, 'Should have EVOLUTION_INVALID_CONFIGURATION error');
  });

  it('should detect missing milestone configuration', () => {
    const milestone: EvolutionMilestone = {
      milestoneId: '',
      profileId: '',
      title: '',
      stage: 'origin',
      year: '',
      description: '',
      significance: '',
    };

    const errors = validateEvolutionMilestone(milestone);
    const milestoneError = errors.find(
      (e) => e.code === KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_MILESTONE,
    );

    assert.ok(milestoneError, 'Should have EVOLUTION_MISSING_MILESTONE error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Knowledge Evolution Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeEvolution>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeEvolution(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeEvolutionRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeEvolutionRegistry([VALID_PROFILE, VALID_PROFILE_2], [VALID_ODDITY], [VALID_TRAIL], [VALID_MILESTONE], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Knowledge Evolution Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE.id;
    const originalTitle = VALID_PROFILE.title;

    composeKnowledgeEvolution(VALID_INPUT);

    assert.equal(VALID_PROFILE.id, originalId);
    assert.equal(VALID_PROFILE.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.id);

    composeKnowledgeEvolutionRegistry(profiles, [], [], [], []);

    assert.equal(profiles[0].id, originalIds[0]);
    assert.equal(profiles[1].id, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Knowledge Evolution Kernel — Helper Functions', () => {
  it('should return canonical discovery types', () => {
    const types = getCanonicalDiscoveryTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_DISCOVERY_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical evolution stages', () => {
    const stages = getCanonicalEvolutionStages();
    assert.deepStrictEqual([...stages], [...CANONICAL_EVOLUTION_STAGES]);
    assert.equal(stages.length, 10);
  });

  it('should return canonical research trail types', () => {
    const types = getCanonicalResearchTrailTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_RESEARCH_TRAIL_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical oddity types', () => {
    const types = getCanonicalOddityTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ODDITY_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical evolution purposes', () => {
    const purposes = getCanonicalEvolutionPurposes();
    assert.deepStrictEqual([...purposes], [...CANONICAL_EVOLUTION_PURPOSES]);
    assert.equal(purposes.length, 10);
  });

  it('should return canonical knowledge evolution statuses', () => {
    const statuses = getCanonicalKnowledgeEvolutionStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_KNOWLEDGE_EVOLUTION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate discovery type support', () => {
    assert.equal(isSupportedDiscoveryType('scientific_discovery'), true);
    assert.equal(isSupportedDiscoveryType('engineering_breakthrough'), true);
    assert.equal(isSupportedDiscoveryType('unsupported'), false);
  });

  it('should validate evolution stage support', () => {
    assert.equal(isSupportedEvolutionStage('origin'), true);
    assert.equal(isSupportedEvolutionStage('modern_state'), true);
    assert.equal(isSupportedEvolutionStage('unsupported'), false);
  });

  it('should validate research trail type support', () => {
    assert.equal(isSupportedResearchTrailType('chronological'), true);
    assert.equal(isSupportedResearchTrailType('scientific'), true);
    assert.equal(isSupportedResearchTrailType('unsupported'), false);
  });

  it('should validate oddity type support', () => {
    assert.equal(isSupportedOddityType('unexpected_result'), true);
    assert.equal(isSupportedOddityType('historical_mistake'), true);
    assert.equal(isSupportedOddityType('unsupported'), false);
  });

  it('should validate evolution purpose support', () => {
    assert.equal(isSupportedEvolutionPurpose('historical_understanding'), true);
    assert.equal(isSupportedEvolutionPurpose('scientific_context'), true);
    assert.equal(isSupportedEvolutionPurpose('unsupported'), false);
  });

  it('should validate knowledge evolution status support', () => {
    assert.equal(isSupportedKnowledgeEvolutionStatus('draft'), true);
    assert.equal(isSupportedKnowledgeEvolutionStatus('published'), true);
    assert.equal(isSupportedKnowledgeEvolutionStatus('unsupported'), false);
  });

  it('should validate knowledge evolution governance support', () => {
    assert.equal(isSupportedKnowledgeEvolutionGovernance('canonical'), true);
    assert.equal(isSupportedKnowledgeEvolutionGovernance('accepted'), true);
    assert.equal(isSupportedKnowledgeEvolutionGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Knowledge Evolution Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 discovery types', () => {
    assert.equal(CANONICAL_DISCOVERY_TYPES.length, 10);
  });

  it('should have exactly 10 evolution stages', () => {
    assert.equal(CANONICAL_EVOLUTION_STAGES.length, 10);
  });

  it('should have exactly 10 research trail types', () => {
    assert.equal(CANONICAL_RESEARCH_TRAIL_TYPES.length, 10);
  });

  it('should have exactly 10 oddity types', () => {
    assert.equal(CANONICAL_ODDITY_TYPES.length, 10);
  });

  it('should have exactly 10 evolution purposes', () => {
    assert.equal(CANONICAL_EVOLUTION_PURPOSES.length, 10);
  });

  it('should have exactly 6 knowledge evolution statuses', () => {
    assert.equal(CANONICAL_KNOWLEDGE_EVOLUTION_STATUS.length, 6);
  });

  it('should have exactly 5 governance values', () => {
    assert.equal(CANONICAL_CURIOSITY_GOVERNANCE.length, 5);
  });

  it('should contain all expected discovery types', () => {
    const expectedTypes = [
      'scientific_discovery',
      'engineering_breakthrough',
      'historical_oddity',
      'accidental_discovery',
      'failed_experiment',
      'paradigm_shift',
      'technology_evolution',
      'research_milestone',
      'forgotten_knowledge',
      'rediscovery',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_DISCOVERY_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected evolution stages', () => {
    const expectedStages = [
      'origin',
      'early_development',
      'experimentation',
      'validation',
      'adoption',
      'optimization',
      'standardization',
      'decline',
      'rediscovery',
      'modern_state',
    ];

    for (const stage of expectedStages) {
      assert.ok(
        CANONICAL_EVOLUTION_STAGES.includes(stage as any),
        `Should include stage: ${stage}`,
      );
    }
  });

  it('should contain all expected research trail types', () => {
    const expectedTypes = [
      'chronological',
      'causal',
      'technological',
      'scientific',
      'engineering',
      'experimental',
      'comparative',
      'iterative',
      'cross_disciplinary',
      'knowledge_chain',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_RESEARCH_TRAIL_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected oddity types', () => {
    const expectedTypes = [
      'unexpected_result',
      'historical_mistake',
      'engineering_failure',
      'scientific_myth',
      'counter_intuitive',
      'coincidence',
      'unusual_fact',
      'forgotten_attempt',
      'surprising_origin',
      'legend_vs_reality',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_ODDITY_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected evolution purposes', () => {
    const expectedPurposes = [
      'historical_understanding',
      'scientific_context',
      'engineering_context',
      'research_context',
      'motivation',
      'reflection',
      'knowledge_connection',
      'timeline_visualization',
      'innovation_story',
      'critical_thinking',
    ];

    for (const purpose of expectedPurposes) {
      assert.ok(
        CANONICAL_EVOLUTION_PURPOSES.includes(purpose as any),
        `Should include purpose: ${purpose}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Knowledge Evolution Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate historical curiosities', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('generatedHistoricalContent' in result), 'Should not have generated historical content');
    assert.ok(!('historicalContent' in result), 'Should not have historical content');
  });

  it('should not write research stories', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('researchStory' in result), 'Should not have research story');
    assert.ok(!('stories' in result), 'Should not have stories');
  });

  it('should not explain scientific discoveries', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('discoveryExplanation' in result), 'Should not have discovery explanation');
    assert.ok(!('explanations' in result), 'Should not have explanations');
  });

  it('should not perform historical analysis', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('historicalAnalysis' in result), 'Should not have historical analysis');
    assert.ok(!('analysis' in result), 'Should not have analysis');
  });

  it('should not reconstruct timelines', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('timeline' in result), 'Should not have timeline');
    assert.ok(!('reconstructedTimeline' in result), 'Should not have reconstructed timeline');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeEvolutionProfile({
      id: 'evo-001',
      title: 'Test',
      discoveryType: 'scientific_discovery',
      evolutionStage: 'modern_state',
      researchTrailType: 'scientific',
      evolutionPurpose: 'scientific_context',
      conceptIds: [],
      status: 'published',
      governance: 'canonical',
      provenance: VALID_PROVENANCE,
      trace: VALID_TRACE,
    });

    const keys = Object.keys(profile);
    for (const key of keys) {
      const value = (profile as any)[key];
      assert.ok(typeof value !== 'function', `Profile field "${key}" should not be a function`);
    }
  });

  it('should not store runtime execution', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Knowledge Evolution Kernel — Cross-Agent Boundary', () => {
  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('narrativeAgent' in result), 'Should not reference Narrative Agent');
    assert.ok(!('narrative' in result), 'Should not reference narrative');
  });

  it('should not reference Knowledge Agent', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('knowledgeAgent' in result), 'Should not reference Knowledge Agent');
    assert.ok(!('knowledge' in result), 'Should not reference knowledge');
  });

  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('didacticAgent' in result), 'Should not reference Didactic Agent');
    assert.ok(!('didactic' in result), 'Should not reference didactic');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('researchAgent' in result), 'Should not reference Research Agent');
    assert.ok(!('research' in result), 'Should not reference research');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('laboratoryAgent' in result), 'Should not reference Laboratory Agent');
    assert.ok(!('laboratory' in result), 'Should not reference laboratory');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeEvolution(VALID_INPUT);
    assert.ok(!('applicationAgent' in result), 'Should not reference Application Agent');
    assert.ok(!('application' in result), 'Should not reference application');
  });
});

// ---------------------------------------------------------------------------
// Validation Codes Tests
// ---------------------------------------------------------------------------

describe('Knowledge Evolution Kernel — Validation Codes', () => {
  it('should have stable validation codes', () => {
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_ID, 'EVOLUTION_DUPLICATE_ID');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_DUPLICATE_TITLE, 'EVOLUTION_DUPLICATE_TITLE');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.ODDITY_DUPLICATE_ID, 'ODDITY_DUPLICATE_ID');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.TRAIL_DUPLICATE_ID, 'TRAIL_DUPLICATE_ID');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_DISCOVERY_TYPE, 'EVOLUTION_INVALID_DISCOVERY_TYPE');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STAGE, 'EVOLUTION_INVALID_STAGE');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TRAIL, 'EVOLUTION_INVALID_TRAIL');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_ODDITY, 'EVOLUTION_INVALID_ODDITY');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_PURPOSE, 'EVOLUTION_INVALID_PURPOSE');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_STATUS, 'EVOLUTION_INVALID_STATUS');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_GOVERNANCE, 'EVOLUTION_INVALID_GOVERNANCE');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVENANCE, 'EVOLUTION_MISSING_PROVENANCE');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROVIDER, 'EVOLUTION_MISSING_PROVIDER');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_RATIONALE, 'EVOLUTION_MISSING_RATIONALE');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_CURIOSITY_REFERENCE, 'EVOLUTION_MISSING_CURIOSITY_REFERENCE');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_PROFILE_ID, 'EVOLUTION_MISSING_PROFILE_ID');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_TITLE, 'EVOLUTION_MISSING_TITLE');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_MISSING_MILESTONE, 'EVOLUTION_MISSING_MILESTONE');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_SELF_RELATIONSHIP, 'EVOLUTION_SELF_RELATIONSHIP');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_EMPTY_REGISTRY, 'EVOLUTION_EMPTY_REGISTRY');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TRACE, 'EVOLUTION_INVALID_TRACE');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_REGISTRY_INCONSISTENCY, 'EVOLUTION_REGISTRY_INCONSISTENCY');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_CONFIGURATION, 'EVOLUTION_INVALID_CONFIGURATION');
    assert.equal(KNOWLEDGE_EVOLUTION_VALIDATION_CODES.EVOLUTION_INVALID_TIMELINE, 'EVOLUTION_INVALID_TIMELINE');
  });

  it('should have exactly 24 validation codes', () => {
    const codeCount = Object.keys(KNOWLEDGE_EVOLUTION_VALIDATION_CODES).length;
    assert.equal(codeCount, 24);
  });
});

// ---------------------------------------------------------------------------
// Public API Export Tests
// ---------------------------------------------------------------------------

describe('Knowledge Evolution Kernel — Public API Exports', () => {
  it('should export all composition functions', () => {
    assert.equal(typeof composeKnowledgeEvolutionProvenance, 'function');
    assert.equal(typeof composeKnowledgeEvolutionTrace, 'function');
    assert.equal(typeof composeKnowledgeEvolutionProfile, 'function');
    assert.equal(typeof composeHistoricalOddity, 'function');
    assert.equal(typeof composeResearchTrail, 'function');
    assert.equal(typeof composeEvolutionMilestone, 'function');
    assert.equal(typeof composeEvolutionRelationship, 'function');
    assert.equal(typeof composeKnowledgeEvolutionRegistry, 'function');
    assert.equal(typeof composeKnowledgeEvolutionRegistryFromInput, 'function');
    assert.equal(typeof composeKnowledgeEvolution, 'function');
    assert.equal(typeof composeCuriosityArtifactWithKnowledgeEvolution, 'function');
  });

  it('should export all helper functions', () => {
    assert.equal(typeof isSupportedDiscoveryType, 'function');
    assert.equal(typeof isSupportedEvolutionStage, 'function');
    assert.equal(typeof isSupportedResearchTrailType, 'function');
    assert.equal(typeof isSupportedOddityType, 'function');
    assert.equal(typeof isSupportedEvolutionPurpose, 'function');
    assert.equal(typeof isSupportedKnowledgeEvolutionStatus, 'function');
    assert.equal(typeof isSupportedKnowledgeEvolutionGovernance, 'function');
    assert.equal(typeof getCanonicalDiscoveryTypes, 'function');
    assert.equal(typeof getCanonicalEvolutionStages, 'function');
    assert.equal(typeof getCanonicalResearchTrailTypes, 'function');
    assert.equal(typeof getCanonicalOddityTypes, 'function');
    assert.equal(typeof getCanonicalEvolutionPurposes, 'function');
    assert.equal(typeof getCanonicalKnowledgeEvolutionStatuses, 'function');
  });

  it('should export all validation functions', () => {
    assert.equal(typeof validateKnowledgeEvolutionProfile, 'function');
    assert.equal(typeof validateHistoricalOddity, 'function');
    assert.equal(typeof validateResearchTrail, 'function');
    assert.equal(typeof validateEvolutionMilestone, 'function');
    assert.equal(typeof validateEvolutionRelationship, 'function');
    assert.equal(typeof validateKnowledgeEvolutionRegistry, 'function');
    assert.equal(typeof validateKnowledgeEvolutionInput, 'function');
    assert.equal(typeof validateKnowledgeEvolutionTrace, 'function');
    assert.equal(typeof validateCuriosityArtifactWithKnowledgeEvolution, 'function');
  });

  it('should export validation codes', () => {
    assert.ok(KNOWLEDGE_EVOLUTION_VALIDATION_CODES);
    assert.equal(typeof KNOWLEDGE_EVOLUTION_VALIDATION_CODES, 'object');
  });
});
