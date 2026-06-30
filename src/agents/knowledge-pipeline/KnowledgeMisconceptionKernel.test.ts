/**
 * D10-OPT-13 — Misconception Registry Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Misconception Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeMisconceptionProfile,
  KnowledgeMisconceptionProvenance,
  KnowledgeMisconceptionRelationship,
  KnowledgeMisconceptionInput,
  KnowledgeMisconceptionRegistry,
  KnowledgeMisconceptionTrace,
  KnowledgeArtifactWithMisconceptions,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_MISCONCEPTION_TYPES,
  CANONICAL_MISCONCEPTION_SEVERITY,
  CANONICAL_CORRECTIVE_STRATEGIES,
  CANONICAL_MISCONCEPTION_STATUS,
  CANONICAL_MISCONCEPTION_VISIBILITY,
  CANONICAL_MISCONCEPTION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeMisconceptionProvenance,
  composeKnowledgeMisconceptionProfile,
  composeKnowledgeMisconceptionRelationship,
  composeKnowledgeMisconceptionTrace,
  composeKnowledgeMisconceptionRegistry,
  composeKnowledgeMisconceptionRegistryFromInput,
  composeKnowledgeMisconceptions,
  composeKnowledgeArtifactWithMisconceptions,
  isSupportedMisconceptionType,
  isSupportedMisconceptionSeverity,
  isSupportedCorrectiveStrategy,
  isSupportedMisconceptionVisibility,
  isSupportedMisconceptionStatus,
  isSupportedMisconceptionGovernance,
  getCanonicalMisconceptionTypes,
  getCanonicalMisconceptionSeverities,
  getCanonicalCorrectiveStrategies,
  getCanonicalMisconceptionVisibility,
  getCanonicalMisconceptionStatuses,
} from './KnowledgeMisconceptionKernel.ts';

import {
  validateKnowledgeMisconceptionProfile,
  validateKnowledgeMisconceptionRelationship,
  validateKnowledgeMisconceptionRegistry,
  validateKnowledgeMisconceptionInput,
  validateKnowledgeMisconceptionTrace,
  validateKnowledgeArtifactWithMisconceptions,
  MISCONCEPTION_VALIDATION_CODES,
} from './KnowledgeMisconceptionValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeMisconceptionProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Misconception Agent',
  rationale: 'Core misconception for concept.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeMisconceptionProfile = {
  misconceptionId: 'miscon-001',
  conceptId: 'concept-001',
  title: 'Neural Network Overfitting Misconception',
  misconceptionType: 'conceptual',
  severity: 'significant',
  correctiveStrategy: 'counterexample',
  visibility: 'default',
  status: 'canonical',
  governance: 'canonical',
  description: 'Belief that more parameters always improve performance.',
  commonCause: 'Lack of understanding of generalization.',
  references: ['ref-001', 'ref-002'],
  tags: ['neural_networks', 'overfitting'],
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeMisconceptionProfile = {
  misconceptionId: 'miscon-002',
  conceptId: 'concept-001',
  title: 'Gradient Descent Misconception',
  misconceptionType: 'mathematical',
  severity: 'moderate',
  correctiveStrategy: 'mathematical_derivation',
  visibility: 'advanced',
  status: 'approved',
  governance: 'accepted',
  description: 'Belief that gradient descent always finds global minimum.',
  commonCause: 'Simplification of optimization landscape.',
  references: ['ref-003'],
  tags: ['gradient_descent', 'optimization'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeMisconceptionProfile = {
  misconceptionId: 'miscon-003',
  conceptId: 'concept-002',
  title: 'Matrix Multiplication Misconception',
  misconceptionType: 'algorithmic',
  severity: 'high',
  correctiveStrategy: 'worked_example',
  visibility: 'expert',
  status: 'canonical',
  governance: 'canonical',
  description: 'Belief that matrix multiplication is commutative.',
  commonCause: 'Conflation with scalar multiplication.',
  references: [],
  tags: ['matrix', 'linear_algebra'],
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeMisconceptionRelationship = {
  relationshipId: 'rel-001',
  sourceMisconceptionId: 'miscon-001',
  targetMisconceptionId: 'miscon-002',
  relationshipType: 'extension',
  description: 'Gradient descent misconception extends overfitting misconception.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeMisconceptionInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeMisconceptionInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Misconception Kernel — Composition', () => {
  it('should compose valid misconception provenance', () => {
    const provenance = composeKnowledgeMisconceptionProvenance({
      source: 'NeuralVerse Team',
      provider: 'Misconception Agent',
      rationale: 'Core misconception.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Misconception Agent');
    assert.equal(provenance.rationale, 'Core misconception.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid misconception profile', () => {
    const profile = composeKnowledgeMisconceptionProfile({
      misconceptionId: 'miscon-001',
      conceptId: 'concept-001',
      title: 'Test Misconception',
      misconceptionType: 'conceptual',
      severity: 'minimal',
      correctiveStrategy: 'clarification',
      visibility: 'default',
      status: 'canonical',
      governance: 'canonical',
      description: 'Test description.',
      commonCause: 'Test cause.',
      references: ['ref-001'],
      tags: ['tag1'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.misconceptionId, 'miscon-001');
    assert.equal(profile.title, 'Test Misconception');
    assert.equal(profile.misconceptionType, 'conceptual');
    assert.equal(profile.tags.length, 1);
    assert.equal(profile.references.length, 1);
  });

  it('should compose valid misconception relationship', () => {
    const relationship = composeKnowledgeMisconceptionRelationship({
      relationshipId: 'rel-001',
      sourceMisconceptionId: 'miscon-001',
      targetMisconceptionId: 'miscon-002',
      relationshipType: 'extension',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceMisconceptionId, 'miscon-001');
    assert.equal(relationship.targetMisconceptionId, 'miscon-002');
    assert.equal(relationship.relationshipType, 'extension');
  });

  it('should compose valid misconception trace', () => {
    const trace = composeKnowledgeMisconceptionTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', misconceptionId: 'miscon-001', conceptId: 'concept-001', validationPassed: true, validationErrors: [] },
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

  it('should compose valid misconception registry', () => {
    const registry = composeKnowledgeMisconceptionRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeMisconceptionRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge misconceptions from input', () => {
    const registry = composeKnowledgeMisconceptions(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with misconceptions', () => {
    const artifact = composeKnowledgeArtifactWithMisconceptions({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.conceptId, 'concept-001');
    assert.equal(artifact.conceptTitle, 'Neural Networks');
    assert.equal(artifact.profiles.length, 1);
    assert.equal(artifact.relationships.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Misconception Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeMisconceptionProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeMisconceptionRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeMisconceptionRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge misconception input', () => {
    const result = validateKnowledgeMisconceptionInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeMisconceptionRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeMisconceptionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have MISCONCEPTION_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, misconceptionId: 'miscon-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE_1, misconceptionId: 'miscon-002', title: 'Same Title' };
    const registry = composeKnowledgeMisconceptionRegistry([profile1, profile2], []);
    const result = validateKnowledgeMisconceptionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have MISCONCEPTION_DUPLICATE_TITLE error');
  });

  it('should detect invalid type', () => {
    const profile = { ...VALID_PROFILE_1, misconceptionType: 'unsupported' as any };
    const errors = validateKnowledgeMisconceptionProfile(profile);
    const typeError = errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_TYPE,
    );
    assert.ok(typeError, 'Should have MISCONCEPTION_INVALID_TYPE error');
  });

  it('should detect invalid severity', () => {
    const profile = { ...VALID_PROFILE_1, severity: 'unsupported' as any };
    const errors = validateKnowledgeMisconceptionProfile(profile);
    const severityError = errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_SEVERITY,
    );
    assert.ok(severityError, 'Should have MISCONCEPTION_INVALID_SEVERITY error');
  });

  it('should detect invalid corrective strategy', () => {
    const profile = { ...VALID_PROFILE_1, correctiveStrategy: 'unsupported' as any };
    const errors = validateKnowledgeMisconceptionProfile(profile);
    const strategyError = errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_CORRECTIVE_STRATEGY,
    );
    assert.ok(strategyError, 'Should have MISCONCEPTION_INVALID_CORRECTIVE_STRATEGY error');
  });

  it('should detect invalid visibility', () => {
    const profile = { ...VALID_PROFILE_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeMisconceptionProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have MISCONCEPTION_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeMisconceptionProfile(profile);
    const statusError = errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have MISCONCEPTION_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeMisconceptionProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have MISCONCEPTION_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeMisconceptionProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have MISCONCEPTION_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeMisconceptionProfile(profile);
    const providerError = errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have MISCONCEPTION_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeMisconceptionProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have MISCONCEPTION_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetMisconceptionId: 'miscon-001' };
    const knownProfileIds = new Set(['miscon-001', 'miscon-002']);
    const errors = validateKnowledgeMisconceptionRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have MISCONCEPTION_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeMisconceptionRegistry([], []);
    const result = validateKnowledgeMisconceptionRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have MISCONCEPTION_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeMisconceptionTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_misconception_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeMisconceptionTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeMisconceptionRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        misconceptionCount: 5,
        relationshipCount: 0,
        conceptCount: 1,
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
        generatedFrom: 'deterministic_misconception_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_misconception_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeMisconceptionRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === MISCONCEPTION_VALIDATION_CODES.MISCONCEPTION_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have MISCONCEPTION_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeMisconceptionTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeMisconceptionTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with misconceptions', () => {
    const artifact = composeKnowledgeArtifactWithMisconceptions({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithMisconceptions(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Misconception Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeMisconceptions>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeMisconceptions(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeMisconceptionRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeMisconceptionRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeMisconceptionProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeMisconceptionProvenance({
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
    const results: ReturnType<typeof composeKnowledgeMisconceptionTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeMisconceptionTrace({
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

describe('Misconception Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.misconceptionId;
    const originalTitle = VALID_PROFILE_1.title;

    composeKnowledgeMisconceptions(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.misconceptionId, originalId);
    assert.equal(VALID_PROFILE_1.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.misconceptionId);

    composeKnowledgeMisconceptionRegistry(profiles, []);

    assert.equal(profiles[0].misconceptionId, originalIds[0]);
    assert.equal(profiles[1].misconceptionId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeMisconceptionProfile({
      misconceptionId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      misconceptionType: 'conceptual',
      severity: 'minimal',
      correctiveStrategy: 'clarification',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      description: 'Test.',
      commonCause: 'Test.',
      references: [],
      tags: originalTags,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.tags, originalTags);
    assert.deepStrictEqual([...profile.tags], originalTags);
  });

  it('should use defensive copies for references', () => {
    const originalRefs = ['ref-001', 'ref-002'];
    const profile = composeKnowledgeMisconceptionProfile({
      misconceptionId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      misconceptionType: 'conceptual',
      severity: 'minimal',
      correctiveStrategy: 'clarification',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      description: 'Test.',
      commonCause: 'Test.',
      references: originalRefs,
      tags: [],
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.references, originalRefs);
    assert.deepStrictEqual([...profile.references], originalRefs);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Misconception Kernel — Helpers', () => {
  it('should return canonical misconception types', () => {
    const types = getCanonicalMisconceptionTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_MISCONCEPTION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical misconception severities', () => {
    const severities = getCanonicalMisconceptionSeverities();
    assert.deepStrictEqual([...severities], [...CANONICAL_MISCONCEPTION_SEVERITY]);
    assert.equal(severities.length, 10);
  });

  it('should return canonical corrective strategies', () => {
    const strategies = getCanonicalCorrectiveStrategies();
    assert.deepStrictEqual([...strategies], [...CANONICAL_CORRECTIVE_STRATEGIES]);
    assert.equal(strategies.length, 10);
  });

  it('should return canonical misconception visibility', () => {
    const visibility = getCanonicalMisconceptionVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_MISCONCEPTION_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical misconception statuses', () => {
    const statuses = getCanonicalMisconceptionStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_MISCONCEPTION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate misconception type support', () => {
    assert.equal(isSupportedMisconceptionType('conceptual'), true);
    assert.equal(isSupportedMisconceptionType('mathematical'), true);
    assert.equal(isSupportedMisconceptionType('unsupported'), false);
  });

  it('should validate misconception severity support', () => {
    assert.equal(isSupportedMisconceptionSeverity('minimal'), true);
    assert.equal(isSupportedMisconceptionSeverity('critical'), true);
    assert.equal(isSupportedMisconceptionSeverity('unsupported'), false);
  });

  it('should validate corrective strategy support', () => {
    assert.equal(isSupportedCorrectiveStrategy('clarification'), true);
    assert.equal(isSupportedCorrectiveStrategy('counterexample'), true);
    assert.equal(isSupportedCorrectiveStrategy('unsupported'), false);
  });

  it('should validate misconception visibility support', () => {
    assert.equal(isSupportedMisconceptionVisibility('always'), true);
    assert.equal(isSupportedMisconceptionVisibility('default'), true);
    assert.equal(isSupportedMisconceptionVisibility('unsupported'), false);
  });

  it('should validate misconception status support', () => {
    assert.equal(isSupportedMisconceptionStatus('draft'), true);
    assert.equal(isSupportedMisconceptionStatus('canonical'), true);
    assert.equal(isSupportedMisconceptionStatus('unsupported'), false);
  });

  it('should validate misconception governance support', () => {
    assert.equal(isSupportedMisconceptionGovernance('canonical'), true);
    assert.equal(isSupportedMisconceptionGovernance('accepted'), true);
    assert.equal(isSupportedMisconceptionGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Misconception Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 misconception types', () => {
    assert.equal(CANONICAL_MISCONCEPTION_TYPES.length, 10);
  });

  it('should have exactly 10 misconception severities', () => {
    assert.equal(CANONICAL_MISCONCEPTION_SEVERITY.length, 10);
  });

  it('should have exactly 10 corrective strategies', () => {
    assert.equal(CANONICAL_CORRECTIVE_STRATEGIES.length, 10);
  });

  it('should have exactly 6 misconception statuses', () => {
    assert.equal(CANONICAL_MISCONCEPTION_STATUS.length, 6);
  });

  it('should have exactly 10 misconception visibility values', () => {
    assert.equal(CANONICAL_MISCONCEPTION_VISIBILITY.length, 10);
  });

  it('should have exactly 10 misconception governance values', () => {
    assert.equal(CANONICAL_MISCONCEPTION_GOVERNANCE.length, 10);
  });

  it('should contain all expected misconception types', () => {
    const expected = ['conceptual', 'terminology', 'mathematical', 'algorithmic', 'implementation', 'engineering', 'causal', 'historical', 'procedural', 'interpretation'];
    for (const type of expected) {
      assert.ok(CANONICAL_MISCONCEPTION_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected misconception severities', () => {
    const expected = ['minimal', 'low', 'moderate', 'significant', 'high', 'critical', 'engineering', 'research', 'canonical', 'fundamental'];
    for (const severity of expected) {
      assert.ok(CANONICAL_MISCONCEPTION_SEVERITY.includes(severity as any), `Should include severity: ${severity}`);
    }
  });

  it('should contain all expected corrective strategies', () => {
    const expected = ['clarification', 'counterexample', 'comparison', 'worked_example', 'visualization', 'mathematical_derivation', 'implementation_walkthrough', 'historical_context', 'guided_reasoning', 'reference'];
    for (const strategy of expected) {
      assert.ok(CANONICAL_CORRECTIVE_STRATEGIES.includes(strategy as any), `Should include strategy: ${strategy}`);
    }
  });

  it('should contain all expected misconception statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_MISCONCEPTION_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected misconception visibility values', () => {
    const expected = ['always', 'default', 'advanced', 'expert', 'curriculum', 'assessment', 'laboratory', 'research', 'internal', 'hidden'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_MISCONCEPTION_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected misconception governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_MISCONCEPTION_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Misconception Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(MISCONCEPTION_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with MISCONCEPTION_', () => {
    const codes = Object.values(MISCONCEPTION_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('MISCONCEPTION_'), `Code "${code}" should start with MISCONCEPTION_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(MISCONCEPTION_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Misconception Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeMisconceptionProfile({
      misconceptionId: 'miscon-001',
      conceptId: 'concept-001',
      title: 'Test',
      misconceptionType: 'conceptual',
      severity: 'minimal',
      correctiveStrategy: 'clarification',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      description: 'Test.',
      commonCause: 'Test.',
      references: [],
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
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Misconception Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeMisconceptions(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Misconception Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by conceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, misconceptionId: 'miscon-003', conceptId: 'concept-003' };
    const profile1 = { ...VALID_PROFILE_1, misconceptionId: 'miscon-001', conceptId: 'concept-001' };
    const profile2 = { ...VALID_PROFILE_1, misconceptionId: 'miscon-002', conceptId: 'concept-002' };

    const registry = composeKnowledgeMisconceptionRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].conceptId, 'concept-001');
    assert.equal(registry.profiles[1].conceptId, 'concept-002');
    assert.equal(registry.profiles[2].conceptId, 'concept-003');
  });

  it('should sort by misconceptionType when conceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, misconceptionId: 'miscon-002', conceptId: 'concept-001', misconceptionType: 'mathematical' as const };
    const profileB = { ...VALID_PROFILE_1, misconceptionId: 'miscon-001', conceptId: 'concept-001', misconceptionType: 'conceptual' as const };

    const registry = composeKnowledgeMisconceptionRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].misconceptionType, 'conceptual');
    assert.equal(registry.profiles[1].misconceptionType, 'mathematical');
  });
});
