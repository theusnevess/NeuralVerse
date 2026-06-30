/**
 * D10-OPT-06 — Comparative Knowledge Modeling Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Comparison Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeComparisonProfile,
  KnowledgeComparisonProvenance,
  KnowledgeComparisonRelationship,
  KnowledgeComparisonInput,
  KnowledgeComparisonRegistry,
  KnowledgeComparisonTrace,
  KnowledgeArtifactWithComparisons,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_COMPARISON_TYPES,
  CANONICAL_COMPARISON_OBJECTIVES,
  CANONICAL_COMPARISON_DIMENSIONS,
  CANONICAL_COMPARISON_STATUS,
  CANONICAL_COMPARISON_VISIBILITY,
  CANONICAL_COMPARISON_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeComparisonProvenance,
  composeKnowledgeComparisonProfile,
  composeKnowledgeComparisonRelationship,
  composeKnowledgeComparisonTrace,
  composeKnowledgeComparisonRegistry,
  composeKnowledgeComparisonRegistryFromInput,
  composeKnowledgeComparisons,
  composeKnowledgeArtifactWithComparisons,
  isSupportedComparisonType,
  isSupportedComparisonObjective,
  isSupportedComparisonDimension,
  isSupportedComparisonVisibility,
  isSupportedComparisonStatus,
  isSupportedComparisonGovernance,
  getCanonicalComparisonTypes,
  getCanonicalComparisonObjectives,
  getCanonicalComparisonDimensions,
  getCanonicalComparisonVisibility,
  getCanonicalComparisonStatuses,
} from './KnowledgeComparisonKernel.ts';

import {
  validateKnowledgeComparisonProfile,
  validateKnowledgeComparisonRelationship,
  validateKnowledgeComparisonRegistry,
  validateKnowledgeComparisonInput,
  validateKnowledgeComparisonTrace,
  validateKnowledgeArtifactWithComparisons,
  COMPARISON_VALIDATION_CODES,
} from './KnowledgeComparisonValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeComparisonProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Comparison Agent',
  rationale: 'Core comparison for neural network concepts.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeComparisonProfile = {
  comparisonId: 'cmp-001',
  title: 'CNN vs RNN — Architectural Comparison',
  comparisonType: 'architecture_vs_architecture',
  objective: 'distinguish',
  primaryConceptId: 'concept-cnn',
  secondaryConceptId: 'concept-rnn',
  dimensions: ['accuracy', 'complexity', 'efficiency'],
  visibility: 'default',
  status: 'canonical',
  governance: 'canonical',
  tags: ['cnn', 'rnn', 'architecture'],
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeComparisonProfile = {
  comparisonId: 'cmp-002',
  title: 'GAN vs VAE — Generative Model Comparison',
  comparisonType: 'model_vs_model',
  objective: 'tradeoff_analysis',
  primaryConceptId: 'concept-gan',
  secondaryConceptId: 'concept-vae',
  dimensions: ['interpretability', 'robustness'],
  visibility: 'advanced',
  status: 'approved',
  governance: 'accepted',
  tags: ['gan', 'vae', 'generative'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeComparisonProfile = {
  comparisonId: 'cmp-003',
  title: 'PyTorch vs TensorFlow — Framework Comparison',
  comparisonType: 'framework_vs_framework',
  objective: 'selection',
  primaryConceptId: 'concept-pytorch',
  secondaryConceptId: 'concept-tensorflow',
  dimensions: ['maintainability', 'implementation'],
  visibility: 'default',
  status: 'canonical',
  governance: 'canonical',
  tags: ['pytorch', 'tensorflow', 'framework'],
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeComparisonRelationship = {
  relationshipId: 'rel-001',
  sourceComparisonId: 'cmp-001',
  targetComparisonId: 'cmp-002',
  relationshipType: 'extension',
  description: 'Generative model comparison extends architectural comparison.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeComparisonInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeComparisonInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Comparison Kernel — Composition', () => {
  it('should compose valid comparison provenance', () => {
    const provenance = composeKnowledgeComparisonProvenance({
      source: 'NeuralVerse Team',
      provider: 'Comparison Agent',
      rationale: 'Core comparison.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Comparison Agent');
    assert.equal(provenance.rationale, 'Core comparison.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid comparison profile', () => {
    const profile = composeKnowledgeComparisonProfile({
      comparisonId: 'cmp-001',
      title: 'Test Profile',
      comparisonType: 'concept_vs_concept',
      objective: 'clarify',
      primaryConceptId: 'concept-a',
      secondaryConceptId: 'concept-b',
      dimensions: ['accuracy'],
      visibility: 'default',
      status: 'canonical',
      governance: 'canonical',
      tags: ['tag1'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.comparisonId, 'cmp-001');
    assert.equal(profile.title, 'Test Profile');
    assert.equal(profile.comparisonType, 'concept_vs_concept');
    assert.equal(profile.dimensions.length, 1);
    assert.equal(profile.tags.length, 1);
  });

  it('should compose valid comparison relationship', () => {
    const relationship = composeKnowledgeComparisonRelationship({
      relationshipId: 'rel-001',
      sourceComparisonId: 'cmp-001',
      targetComparisonId: 'cmp-002',
      relationshipType: 'extension',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceComparisonId, 'cmp-001');
    assert.equal(relationship.targetComparisonId, 'cmp-002');
    assert.equal(relationship.relationshipType, 'extension');
  });

  it('should compose valid comparison trace', () => {
    const trace = composeKnowledgeComparisonTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', comparisonId: 'cmp-001', primaryConceptId: 'concept-a', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid comparison registry', () => {
    const registry = composeKnowledgeComparisonRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeComparisonRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge comparisons from input', () => {
    const registry = composeKnowledgeComparisons(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with comparisons', () => {
    const artifact = composeKnowledgeArtifactWithComparisons({
      conceptId: 'concept-cnn',
      conceptTitle: 'Convolutional Neural Networks',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.conceptId, 'concept-cnn');
    assert.equal(artifact.conceptTitle, 'Convolutional Neural Networks');
    assert.equal(artifact.profiles.length, 1);
    assert.equal(artifact.relationships.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Comparison Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeComparisonProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeComparisonRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeComparisonRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge comparison input', () => {
    const result = validateKnowledgeComparisonInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeComparisonRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeComparisonRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have COMPARISON_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, comparisonId: 'cmp-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE_1, comparisonId: 'cmp-002', title: 'Same Title' };
    const registry = composeKnowledgeComparisonRegistry([profile1, profile2], []);
    const result = validateKnowledgeComparisonRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have COMPARISON_DUPLICATE_TITLE error');
  });

  it('should detect invalid type', () => {
    const profile = { ...VALID_PROFILE_1, comparisonType: 'unsupported' as any };
    const errors = validateKnowledgeComparisonProfile(profile);
    const typeError = errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TYPE,
    );
    assert.ok(typeError, 'Should have COMPARISON_INVALID_TYPE error');
  });

  it('should detect invalid objective', () => {
    const profile = { ...VALID_PROFILE_1, objective: 'unsupported' as any };
    const errors = validateKnowledgeComparisonProfile(profile);
    const objectiveError = errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_OBJECTIVE,
    );
    assert.ok(objectiveError, 'Should have COMPARISON_INVALID_OBJECTIVE error');
  });

  it('should detect invalid dimension', () => {
    const profile = { ...VALID_PROFILE_1, dimensions: ['unsupported' as any] };
    const errors = validateKnowledgeComparisonProfile(profile);
    const dimensionError = errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_DIMENSION,
    );
    assert.ok(dimensionError, 'Should have COMPARISON_INVALID_DIMENSION error');
  });

  it('should detect invalid visibility', () => {
    const profile = { ...VALID_PROFILE_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeComparisonProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have COMPARISON_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeComparisonProfile(profile);
    const statusError = errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have COMPARISON_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeComparisonProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have COMPARISON_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeComparisonProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have COMPARISON_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeComparisonProfile(profile);
    const providerError = errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have COMPARISON_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeComparisonProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have COMPARISON_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetComparisonId: 'cmp-001' };
    const knownProfileIds = new Set(['cmp-001', 'cmp-002']);
    const errors = validateKnowledgeComparisonRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have COMPARISON_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeComparisonRegistry([], []);
    const result = validateKnowledgeComparisonRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have COMPARISON_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeComparisonTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_comparison_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeComparisonTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeComparisonRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        comparisonCount: 5,
        relationshipCount: 0,
        conceptCount: 2,
        typeCount: 1,
      },
      trace: {
        traceId: '_trace_1',
        decisionCount: 0,
        validationCount: 0,
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
        decisions: [],
        deterministic: true,
        generatedFrom: 'deterministic_comparison_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_comparison_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeComparisonRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have COMPARISON_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeComparisonTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeComparisonTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with comparisons', () => {
    const artifact = composeKnowledgeArtifactWithComparisons({
      conceptId: 'concept-cnn',
      conceptTitle: 'Convolutional Neural Networks',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithComparisons(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Comparison Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeComparisons>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeComparisons(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeComparisonRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeComparisonRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeComparisonProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeComparisonProvenance({
        source: 'Test',
        provider: 'Provider',
        rationale: 'Rationale',
        governance: 'canonical',
      }));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0], results[i]);
    }
  });

  it('should produce identical trace for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeComparisonTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeComparisonTrace({
        traceId: '_trace_1',
        decisions: [],
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
      }));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0], results[i]);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Comparison Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.comparisonId;
    const originalTitle = VALID_PROFILE_1.title;

    composeKnowledgeComparisons(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.comparisonId, originalId);
    assert.equal(VALID_PROFILE_1.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.comparisonId);

    composeKnowledgeComparisonRegistry(profiles, []);

    assert.equal(profiles[0].comparisonId, originalIds[0]);
    assert.equal(profiles[1].comparisonId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeComparisonProfile({
      comparisonId: 'test',
      title: 'Test.',
      comparisonType: 'concept_vs_concept',
      objective: 'clarify',
      primaryConceptId: 'concept-a',
      secondaryConceptId: 'concept-b',
      dimensions: ['accuracy'],
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: originalTags,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.tags, originalTags);
    assert.deepStrictEqual([...profile.tags], originalTags);
  });

  it('should use defensive copies for dimensions', () => {
    const originalDims = ['accuracy', 'complexity'];
    const profile = composeKnowledgeComparisonProfile({
      comparisonId: 'test',
      title: 'Test.',
      comparisonType: 'concept_vs_concept',
      objective: 'clarify',
      primaryConceptId: 'concept-a',
      secondaryConceptId: 'concept-b',
      dimensions: originalDims as readonly ('accuracy' | 'scalability' | 'memory' | 'maintainability' | 'robustness' | 'interpretability' | 'implementation' | 'complexity' | 'efficiency' | 'applicability')[],
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: [],
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.dimensions, originalDims);
    assert.deepStrictEqual([...profile.dimensions], originalDims);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Comparison Kernel — Helpers', () => {
  it('should return canonical comparison types', () => {
    const types = getCanonicalComparisonTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_COMPARISON_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical comparison objectives', () => {
    const objectives = getCanonicalComparisonObjectives();
    assert.deepStrictEqual([...objectives], [...CANONICAL_COMPARISON_OBJECTIVES]);
    assert.equal(objectives.length, 10);
  });

  it('should return canonical comparison dimensions', () => {
    const dimensions = getCanonicalComparisonDimensions();
    assert.deepStrictEqual([...dimensions], [...CANONICAL_COMPARISON_DIMENSIONS]);
    assert.equal(dimensions.length, 10);
  });

  it('should return canonical comparison visibility', () => {
    const visibility = getCanonicalComparisonVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_COMPARISON_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical comparison statuses', () => {
    const statuses = getCanonicalComparisonStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_COMPARISON_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate comparison type support', () => {
    assert.equal(isSupportedComparisonType('concept_vs_concept'), true);
    assert.equal(isSupportedComparisonType('algorithm_vs_algorithm'), true);
    assert.equal(isSupportedComparisonType('unsupported'), false);
  });

  it('should validate comparison objective support', () => {
    assert.equal(isSupportedComparisonObjective('clarify'), true);
    assert.equal(isSupportedComparisonObjective('decision_support'), true);
    assert.equal(isSupportedComparisonObjective('unsupported'), false);
  });

  it('should validate comparison dimension support', () => {
    assert.equal(isSupportedComparisonDimension('accuracy'), true);
    assert.equal(isSupportedComparisonDimension('complexity'), true);
    assert.equal(isSupportedComparisonDimension('unsupported'), false);
  });

  it('should validate comparison visibility support', () => {
    assert.equal(isSupportedComparisonVisibility('always'), true);
    assert.equal(isSupportedComparisonVisibility('default'), true);
    assert.equal(isSupportedComparisonVisibility('unsupported'), false);
  });

  it('should validate comparison status support', () => {
    assert.equal(isSupportedComparisonStatus('draft'), true);
    assert.equal(isSupportedComparisonStatus('canonical'), true);
    assert.equal(isSupportedComparisonStatus('unsupported'), false);
  });

  it('should validate comparison governance support', () => {
    assert.equal(isSupportedComparisonGovernance('canonical'), true);
    assert.equal(isSupportedComparisonGovernance('accepted'), true);
    assert.equal(isSupportedComparisonGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Comparison Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 comparison types', () => {
    assert.equal(CANONICAL_COMPARISON_TYPES.length, 10);
  });

  it('should have exactly 10 comparison objectives', () => {
    assert.equal(CANONICAL_COMPARISON_OBJECTIVES.length, 10);
  });

  it('should have exactly 10 comparison dimensions', () => {
    assert.equal(CANONICAL_COMPARISON_DIMENSIONS.length, 10);
  });

  it('should have exactly 6 comparison statuses', () => {
    assert.equal(CANONICAL_COMPARISON_STATUS.length, 6);
  });

  it('should have exactly 10 comparison visibility values', () => {
    assert.equal(CANONICAL_COMPARISON_VISIBILITY.length, 10);
  });

  it('should have exactly 10 comparison governance values', () => {
    assert.equal(CANONICAL_COMPARISON_GOVERNANCE.length, 10);
  });

  it('should contain all expected comparison types', () => {
    const expected = ['concept_vs_concept', 'algorithm_vs_algorithm', 'method_vs_method', 'architecture_vs_architecture', 'implementation_vs_implementation', 'theory_vs_theory', 'model_vs_model', 'framework_vs_framework', 'tool_vs_tool', 'approach_vs_approach'];
    for (const type of expected) {
      assert.ok(CANONICAL_COMPARISON_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected comparison objectives', () => {
    const expected = ['clarify', 'distinguish', 'decision_support', 'tradeoff_analysis', 'selection', 'engineering', 'learning', 'review', 'evaluation', 'reference'];
    for (const objective of expected) {
      assert.ok(CANONICAL_COMPARISON_OBJECTIVES.includes(objective as any), `Should include objective: ${objective}`);
    }
  });

  it('should contain all expected comparison dimensions', () => {
    const expected = ['accuracy', 'complexity', 'efficiency', 'memory', 'scalability', 'interpretability', 'robustness', 'maintainability', 'implementation', 'applicability'];
    for (const dimension of expected) {
      assert.ok(CANONICAL_COMPARISON_DIMENSIONS.includes(dimension as any), `Should include dimension: ${dimension}`);
    }
  });

  it('should contain all expected comparison statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_COMPARISON_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected comparison visibility values', () => {
    const expected = ['always', 'default', 'advanced', 'expert', 'curriculum', 'assessment', 'laboratory', 'research', 'internal', 'hidden'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_COMPARISON_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected comparison governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_COMPARISON_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Comparison Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(COMPARISON_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with COMPARISON_', () => {
    const codes = Object.values(COMPARISON_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('COMPARISON_'), `Code "${code}" should start with COMPARISON_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(COMPARISON_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Comparison Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeComparisonProfile({
      comparisonId: 'cmp-001',
      title: 'Test',
      comparisonType: 'concept_vs_concept',
      objective: 'clarify',
      primaryConceptId: 'concept-a',
      secondaryConceptId: 'concept-b',
      dimensions: ['accuracy'],
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: [],
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(profile);
    for (const key of keys) {
      const value = (profile as any)[key];
      assert.ok(typeof value !== 'function', `Profile field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Comparison Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeComparisons(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Comparison Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by primaryConceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, comparisonId: 'cmp-003', primaryConceptId: 'concept-z' };
    const profile1 = { ...VALID_PROFILE_1, comparisonId: 'cmp-001', primaryConceptId: 'concept-a' };
    const profile2 = { ...VALID_PROFILE_1, comparisonId: 'cmp-002', primaryConceptId: 'concept-m' };

    const registry = composeKnowledgeComparisonRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].primaryConceptId, 'concept-a');
    assert.equal(registry.profiles[1].primaryConceptId, 'concept-m');
    assert.equal(registry.profiles[2].primaryConceptId, 'concept-z');
  });

  it('should sort by comparisonType when primaryConceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, comparisonId: 'cmp-002', primaryConceptId: 'concept-a', comparisonType: 'method_vs_method' as const };
    const profileB = { ...VALID_PROFILE_1, comparisonId: 'cmp-001', primaryConceptId: 'concept-a', comparisonType: 'algorithm_vs_algorithm' as const };

    const registry = composeKnowledgeComparisonRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].comparisonType, 'algorithm_vs_algorithm');
    assert.equal(registry.profiles[1].comparisonType, 'method_vs_method');
  });
});
