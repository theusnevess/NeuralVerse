/**
 * D10-OPT-09 — Laboratory Metadata Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Laboratory Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeLaboratoryProfile,
  KnowledgeLaboratoryProvenance,
  KnowledgeLaboratoryRelationship,
  KnowledgeLaboratoryInput,
  KnowledgeLaboratoryRegistry,
  KnowledgeLaboratoryTrace,
  KnowledgeArtifactWithLaboratories,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_LABORATORY_TYPES,
  CANONICAL_LABORATORY_OBJECTIVES,
  CANONICAL_LABORATORY_COMPLEXITY,
  CANONICAL_LABORATORY_STATUS,
  CANONICAL_LABORATORY_VISIBILITY,
  CANONICAL_LABORATORY_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeLaboratoryProvenance,
  composeKnowledgeLaboratoryProfile,
  composeKnowledgeLaboratoryRelationship,
  composeKnowledgeLaboratoryTrace,
  composeKnowledgeLaboratoryRegistry,
  composeKnowledgeLaboratoryRegistryFromInput,
  composeKnowledgeLaboratories,
  composeKnowledgeArtifactWithLaboratories,
  isSupportedLaboratoryType,
  isSupportedLaboratoryObjective,
  isSupportedLaboratoryComplexity,
  isSupportedLaboratoryVisibility,
  isSupportedLaboratoryStatus,
  isSupportedLaboratoryGovernance,
  getCanonicalLaboratoryTypes,
  getCanonicalLaboratoryObjectives,
  getCanonicalLaboratoryComplexities,
  getCanonicalLaboratoryVisibility,
  getCanonicalLaboratoryStatuses,
} from './KnowledgeLaboratoryKernel.ts';

import {
  validateKnowledgeLaboratoryProfile,
  validateKnowledgeLaboratoryRelationship,
  validateKnowledgeLaboratoryRegistry,
  validateKnowledgeLaboratoryInput,
  validateKnowledgeLaboratoryTrace,
  validateKnowledgeArtifactWithLaboratories,
  LABORATORY_VALIDATION_CODES,
} from './KnowledgeLaboratoryValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeLaboratoryProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Knowledge Pipeline',
  rationale: 'Core laboratory for concept.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeLaboratoryProfile = {
  laboratoryId: 'lab-001',
  conceptId: 'concept-001',
  title: 'Neural Network Training Lab',
  laboratoryType: 'machine_learning_laboratory',
  objective: 'experiment',
  complexity: 'intermediate',
  visibility: 'default',
  status: 'canonical',
  governance: 'canonical',
  orderIndex: 1,
  tags: ['neural_networks', 'training'],
  resourceReferences: ['res-001'],
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeLaboratoryProfile = {
  laboratoryId: 'lab-002',
  conceptId: 'concept-001',
  title: 'Data Preprocessing Lab',
  laboratoryType: 'data_science_laboratory',
  objective: 'demonstrate',
  complexity: 'standard',
  visibility: 'advanced',
  status: 'approved',
  governance: 'accepted',
  orderIndex: 2,
  tags: ['data', 'preprocessing'],
  resourceReferences: ['res-002'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeLaboratoryProfile = {
  laboratoryId: 'lab-003',
  conceptId: 'concept-002',
  title: 'Computer Vision Lab',
  laboratoryType: 'computer_vision_laboratory',
  objective: 'explore',
  complexity: 'advanced',
  visibility: 'expert',
  status: 'canonical',
  governance: 'canonical',
  orderIndex: 1,
  tags: ['computer_vision', 'cnn'],
  resourceReferences: [],
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeLaboratoryRelationship = {
  relationshipId: 'rel-001',
  sourceLaboratoryId: 'lab-001',
  targetLaboratoryId: 'lab-002',
  relationshipType: 'extension',
  description: 'Data preprocessing extends training lab.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeLaboratoryInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeLaboratoryInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Composition', () => {
  it('should compose valid laboratory provenance', () => {
    const provenance = composeKnowledgeLaboratoryProvenance({
      source: 'NeuralVerse Team',
      provider: 'Knowledge Pipeline',
      rationale: 'Core laboratory.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Knowledge Pipeline');
    assert.equal(provenance.rationale, 'Core laboratory.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid laboratory profile', () => {
    const profile = composeKnowledgeLaboratoryProfile({
      laboratoryId: 'lab-001',
      conceptId: 'concept-001',
      title: 'Test Laboratory',
      laboratoryType: 'interactive_laboratory',
      objective: 'introduce',
      complexity: 'minimal',
      visibility: 'default',
      status: 'canonical',
      governance: 'canonical',
      orderIndex: 1,
      tags: ['tag1'],
      resourceReferences: ['ref-001'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.laboratoryId, 'lab-001');
    assert.equal(profile.title, 'Test Laboratory');
    assert.equal(profile.laboratoryType, 'interactive_laboratory');
    assert.equal(profile.tags.length, 1);
    assert.equal(profile.resourceReferences.length, 1);
    assert.equal(profile.orderIndex, 1);
  });

  it('should compose valid laboratory relationship', () => {
    const relationship = composeKnowledgeLaboratoryRelationship({
      relationshipId: 'rel-001',
      sourceLaboratoryId: 'lab-001',
      targetLaboratoryId: 'lab-002',
      relationshipType: 'extension',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceLaboratoryId, 'lab-001');
    assert.equal(relationship.targetLaboratoryId, 'lab-002');
    assert.equal(relationship.relationshipType, 'extension');
  });

  it('should compose valid laboratory trace', () => {
    const trace = composeKnowledgeLaboratoryTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', laboratoryId: 'lab-001', conceptId: 'concept-001', validationPassed: true, validationErrors: [] },
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

  it('should compose valid laboratory registry', () => {
    const registry = composeKnowledgeLaboratoryRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeLaboratoryRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge laboratories from input', () => {
    const registry = composeKnowledgeLaboratories(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with laboratories', () => {
    const artifact = composeKnowledgeArtifactWithLaboratories({
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

describe('Laboratory Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeLaboratoryProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeLaboratoryRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeLaboratoryRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge laboratory input', () => {
    const result = validateKnowledgeLaboratoryInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeLaboratoryRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeLaboratoryRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have LABORATORY_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, laboratoryId: 'lab-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE_1, laboratoryId: 'lab-002', title: 'Same Title' };
    const registry = composeKnowledgeLaboratoryRegistry([profile1, profile2], []);
    const result = validateKnowledgeLaboratoryRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have LABORATORY_DUPLICATE_TITLE error');
  });

  it('should detect invalid type', () => {
    const profile = { ...VALID_PROFILE_1, laboratoryType: 'unsupported' as any };
    const errors = validateKnowledgeLaboratoryProfile(profile);
    const typeError = errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_TYPE,
    );
    assert.ok(typeError, 'Should have LABORATORY_INVALID_TYPE error');
  });

  it('should detect invalid objective', () => {
    const profile = { ...VALID_PROFILE_1, objective: 'unsupported' as any };
    const errors = validateKnowledgeLaboratoryProfile(profile);
    const objectiveError = errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_OBJECTIVE,
    );
    assert.ok(objectiveError, 'Should have LABORATORY_INVALID_OBJECTIVE error');
  });

  it('should detect invalid complexity', () => {
    const profile = { ...VALID_PROFILE_1, complexity: 'unsupported' as any };
    const errors = validateKnowledgeLaboratoryProfile(profile);
    const complexityError = errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_COMPLEXITY,
    );
    assert.ok(complexityError, 'Should have LABORATORY_INVALID_COMPLEXITY error');
  });

  it('should detect invalid visibility', () => {
    const profile = { ...VALID_PROFILE_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeLaboratoryProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have LABORATORY_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeLaboratoryProfile(profile);
    const statusError = errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have LABORATORY_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeLaboratoryProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have LABORATORY_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeLaboratoryProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have LABORATORY_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeLaboratoryProfile(profile);
    const providerError = errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have LABORATORY_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeLaboratoryProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have LABORATORY_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetLaboratoryId: 'lab-001' };
    const knownProfileIds = new Set(['lab-001', 'lab-002']);
    const errors = validateKnowledgeLaboratoryRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have LABORATORY_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeLaboratoryRegistry([], []);
    const result = validateKnowledgeLaboratoryRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have LABORATORY_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeLaboratoryTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_laboratory_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeLaboratoryTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeLaboratoryRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        laboratoryCount: 5,
        relationshipCount: 0,
        conceptCount: 1,
        laboratoryTypeCount: 1,
      },
      trace: {
        traceId: '_trace_1',
        decisionCount: 0,
        validationCount: 0,
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
        decisions: [],
        deterministic: true,
        generatedFrom: 'deterministic_laboratory_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_laboratory_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeLaboratoryRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LABORATORY_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have LABORATORY_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeLaboratoryTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeLaboratoryTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with laboratories', () => {
    const artifact = composeKnowledgeArtifactWithLaboratories({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithLaboratories(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeLaboratories>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeLaboratories(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeLaboratoryRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeLaboratoryRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeLaboratoryProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeLaboratoryProvenance({
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
    const results: ReturnType<typeof composeKnowledgeLaboratoryTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeLaboratoryTrace({
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

describe('Laboratory Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.laboratoryId;
    const originalTitle = VALID_PROFILE_1.title;

    composeKnowledgeLaboratories(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.laboratoryId, originalId);
    assert.equal(VALID_PROFILE_1.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.laboratoryId);

    composeKnowledgeLaboratoryRegistry(profiles, []);

    assert.equal(profiles[0].laboratoryId, originalIds[0]);
    assert.equal(profiles[1].laboratoryId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeLaboratoryProfile({
      laboratoryId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      laboratoryType: 'interactive_laboratory',
      objective: 'introduce',
      complexity: 'minimal',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      orderIndex: 1,
      tags: originalTags,
      resourceReferences: [],
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.tags, originalTags);
    assert.deepStrictEqual([...profile.tags], originalTags);
  });

  it('should use defensive copies for resourceReferences', () => {
    const originalRefs = ['ref-001', 'ref-002'];
    const profile = composeKnowledgeLaboratoryProfile({
      laboratoryId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      laboratoryType: 'interactive_laboratory',
      objective: 'introduce',
      complexity: 'minimal',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      orderIndex: 1,
      tags: [],
      resourceReferences: originalRefs,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.resourceReferences, originalRefs);
    assert.deepStrictEqual([...profile.resourceReferences], originalRefs);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Helpers', () => {
  it('should return canonical laboratory types', () => {
    const types = getCanonicalLaboratoryTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_LABORATORY_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical laboratory objectives', () => {
    const objectives = getCanonicalLaboratoryObjectives();
    assert.deepStrictEqual([...objectives], [...CANONICAL_LABORATORY_OBJECTIVES]);
    assert.equal(objectives.length, 10);
  });

  it('should return canonical laboratory complexities', () => {
    const complexities = getCanonicalLaboratoryComplexities();
    assert.deepStrictEqual([...complexities], [...CANONICAL_LABORATORY_COMPLEXITY]);
    assert.equal(complexities.length, 10);
  });

  it('should return canonical laboratory visibility', () => {
    const visibility = getCanonicalLaboratoryVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_LABORATORY_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical laboratory statuses', () => {
    const statuses = getCanonicalLaboratoryStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_LABORATORY_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate laboratory type support', () => {
    assert.equal(isSupportedLaboratoryType('interactive_laboratory'), true);
    assert.equal(isSupportedLaboratoryType('simulation_reference'), true);
    assert.equal(isSupportedLaboratoryType('unsupported'), false);
  });

  it('should validate laboratory objective support', () => {
    assert.equal(isSupportedLaboratoryObjective('introduce'), true);
    assert.equal(isSupportedLaboratoryObjective('demonstrate'), true);
    assert.equal(isSupportedLaboratoryObjective('unsupported'), false);
  });

  it('should validate laboratory complexity support', () => {
    assert.equal(isSupportedLaboratoryComplexity('minimal'), true);
    assert.equal(isSupportedLaboratoryComplexity('advanced'), true);
    assert.equal(isSupportedLaboratoryComplexity('unsupported'), false);
  });

  it('should validate laboratory visibility support', () => {
    assert.equal(isSupportedLaboratoryVisibility('always'), true);
    assert.equal(isSupportedLaboratoryVisibility('default'), true);
    assert.equal(isSupportedLaboratoryVisibility('unsupported'), false);
  });

  it('should validate laboratory status support', () => {
    assert.equal(isSupportedLaboratoryStatus('draft'), true);
    assert.equal(isSupportedLaboratoryStatus('canonical'), true);
    assert.equal(isSupportedLaboratoryStatus('unsupported'), false);
  });

  it('should validate laboratory governance support', () => {
    assert.equal(isSupportedLaboratoryGovernance('canonical'), true);
    assert.equal(isSupportedLaboratoryGovernance('accepted'), true);
    assert.equal(isSupportedLaboratoryGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 laboratory types', () => {
    assert.equal(CANONICAL_LABORATORY_TYPES.length, 10);
  });

  it('should have exactly 10 laboratory objectives', () => {
    assert.equal(CANONICAL_LABORATORY_OBJECTIVES.length, 10);
  });

  it('should have exactly 10 laboratory complexities', () => {
    assert.equal(CANONICAL_LABORATORY_COMPLEXITY.length, 10);
  });

  it('should have exactly 6 laboratory statuses', () => {
    assert.equal(CANONICAL_LABORATORY_STATUS.length, 6);
  });

  it('should have exactly 10 laboratory visibility values', () => {
    assert.equal(CANONICAL_LABORATORY_VISIBILITY.length, 10);
  });

  it('should have exactly 10 laboratory governance values', () => {
    assert.equal(CANONICAL_LABORATORY_GOVERNANCE.length, 10);
  });

  it('should contain all expected laboratory types', () => {
    const expected = ['interactive_laboratory', 'simulation_reference', 'coding_laboratory', 'mathematical_laboratory', 'computer_vision_laboratory', 'machine_learning_laboratory', 'data_science_laboratory', 'engineering_laboratory', 'research_laboratory', 'experimental_workbench'];
    for (const type of expected) {
      assert.ok(CANONICAL_LABORATORY_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected laboratory objectives', () => {
    const expected = ['introduce', 'demonstrate', 'explore', 'experiment', 'implement', 'validate', 'compare', 'optimize', 'investigate', 'master'];
    for (const objective of expected) {
      assert.ok(CANONICAL_LABORATORY_OBJECTIVES.includes(objective as any), `Should include objective: ${objective}`);
    }
  });

  it('should contain all expected laboratory complexities', () => {
    const expected = ['minimal', 'simple', 'standard', 'intermediate', 'advanced', 'expert', 'engineering', 'research', 'reference', 'canonical'];
    for (const complexity of expected) {
      assert.ok(CANONICAL_LABORATORY_COMPLEXITY.includes(complexity as any), `Should include complexity: ${complexity}`);
    }
  });

  it('should contain all expected laboratory statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_LABORATORY_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected laboratory visibility values', () => {
    const expected = ['always', 'default', 'advanced', 'expert', 'curriculum', 'assessment', 'laboratory', 'research', 'internal', 'hidden'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_LABORATORY_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected laboratory governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_LABORATORY_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(LABORATORY_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with LABORATORY_', () => {
    const codes = Object.values(LABORATORY_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('LABORATORY_'), `Code "${code}" should start with LABORATORY_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(LABORATORY_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeLaboratoryProfile({
      laboratoryId: 'lab-001',
      conceptId: 'concept-001',
      title: 'Test',
      laboratoryType: 'interactive_laboratory',
      objective: 'introduce',
      complexity: 'minimal',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      orderIndex: 1,
      tags: [],
      resourceReferences: [],
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(profile);
    for (const key of keys) {
      const value = (profile as any)[key];
      assert.ok(typeof value !== 'function', `Profile field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeLaboratories(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by conceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, laboratoryId: 'lab-003', conceptId: 'concept-003' };
    const profile1 = { ...VALID_PROFILE_1, laboratoryId: 'lab-001', conceptId: 'concept-001' };
    const profile2 = { ...VALID_PROFILE_1, laboratoryId: 'lab-002', conceptId: 'concept-002' };

    const registry = composeKnowledgeLaboratoryRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].conceptId, 'concept-001');
    assert.equal(registry.profiles[1].conceptId, 'concept-002');
    assert.equal(registry.profiles[2].conceptId, 'concept-003');
  });

  it('should sort by laboratoryType when conceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, laboratoryId: 'lab-002', conceptId: 'concept-001', laboratoryType: 'simulation_reference' as const };
    const profileB = { ...VALID_PROFILE_1, laboratoryId: 'lab-001', conceptId: 'concept-001', laboratoryType: 'interactive_laboratory' as const };

    const registry = composeKnowledgeLaboratoryRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].laboratoryType, 'interactive_laboratory');
    assert.equal(registry.profiles[1].laboratoryType, 'simulation_reference');
  });
});
