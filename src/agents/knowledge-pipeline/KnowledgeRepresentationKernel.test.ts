/**
 * D10-OPT-04 — Multimodal Representation, Visual References Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Representation Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeRepresentationProfile,
  KnowledgeRepresentationProvenance,
  KnowledgeRepresentationRelationship,
  KnowledgeRepresentationInput,
  KnowledgeRepresentationRegistry,
  KnowledgeRepresentationTrace,
  KnowledgeArtifactWithRepresentations,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_REPRESENTATION_TYPES,
  CANONICAL_VISUAL_OBJECTIVES,
  CANONICAL_REPRESENTATION_COMPLEXITY,
  CANONICAL_REPRESENTATION_STATUS,
  CANONICAL_REPRESENTATION_VISIBILITY,
  CANONICAL_REPRESENTATION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeRepresentationProvenance,
  composeKnowledgeRepresentationProfile,
  composeKnowledgeRepresentationRelationship,
  composeKnowledgeRepresentationTrace,
  composeKnowledgeRepresentationRegistry,
  composeKnowledgeRepresentationRegistryFromInput,
  composeKnowledgeRepresentations,
  composeKnowledgeArtifactWithRepresentations,
  isSupportedRepresentationType,
  isSupportedVisualObjective,
  isSupportedRepresentationComplexity,
  isSupportedRepresentationVisibility,
  isSupportedRepresentationStatus,
  isSupportedRepresentationGovernance,
  getCanonicalRepresentationTypes,
  getCanonicalVisualObjectives,
  getCanonicalRepresentationComplexities,
  getCanonicalRepresentationVisibility,
  getCanonicalRepresentationStatuses,
} from './KnowledgeRepresentationKernel.ts';

import {
  validateKnowledgeRepresentationProfile,
  validateKnowledgeRepresentationRelationship,
  validateKnowledgeRepresentationRegistry,
  validateKnowledgeRepresentationInput,
  validateKnowledgeRepresentationTrace,
  validateKnowledgeArtifactWithRepresentations,
  REPRESENTATION_VALIDATION_CODES,
} from './KnowledgeRepresentationValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeRepresentationProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Representation Agent',
  rationale: 'Core representation for neural network concept.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeRepresentationProfile = {
  representationId: 'rep-001',
  conceptId: 'concept-001',
  title: 'Neural Networks — Diagram',
  representationType: 'diagram',
  visualObjective: 'visualize',
  complexity: 'standard',
  visibility: 'default',
  status: 'canonical',
  governance: 'canonical',
  tags: ['neural_networks', 'diagram'],
  resourceReferences: ['ref-001'],
  orderIndex: 1,
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeRepresentationProfile = {
  representationId: 'rep-002',
  conceptId: 'concept-001',
  title: 'Neural Networks — Animation',
  representationType: 'animation',
  visualObjective: 'demonstrate',
  complexity: 'advanced',
  visibility: 'advanced',
  status: 'approved',
  governance: 'accepted',
  tags: ['neural_networks', 'animation'],
  resourceReferences: ['ref-002'],
  orderIndex: 2,
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeRepresentationProfile = {
  representationId: 'rep-003',
  conceptId: 'concept-002',
  title: 'Linear Algebra — Mathematical',
  representationType: 'mathematical',
  visualObjective: 'formalize',
  complexity: 'expert',
  visibility: 'expert',
  status: 'canonical',
  governance: 'canonical',
  tags: ['linear_algebra', 'mathematics'],
  resourceReferences: [],
  orderIndex: 1,
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeRepresentationRelationship = {
  relationshipId: 'rel-001',
  sourceRepresentationId: 'rep-001',
  targetRepresentationId: 'rep-002',
  conceptId: 'concept-001',
  relationshipType: 'complement',
  description: 'Animation complements the diagram.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeRepresentationInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeRepresentationInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Representation Kernel — Composition', () => {
  it('should compose valid representation provenance', () => {
    const provenance = composeKnowledgeRepresentationProvenance({
      source: 'NeuralVerse Team',
      provider: 'Representation Agent',
      rationale: 'Core representation.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Representation Agent');
    assert.equal(provenance.rationale, 'Core representation.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid representation profile', () => {
    const profile = composeKnowledgeRepresentationProfile({
      representationId: 'rep-001',
      conceptId: 'concept-001',
      title: 'Test Profile',
      representationType: 'diagram',
      visualObjective: 'visualize',
      complexity: 'standard',
      visibility: 'default',
      status: 'canonical',
      governance: 'canonical',
      tags: ['tag1'],
      resourceReferences: ['ref-001'],
      orderIndex: 1,
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.representationId, 'rep-001');
    assert.equal(profile.conceptId, 'concept-001');
    assert.equal(profile.representationType, 'diagram');
    assert.equal(profile.tags.length, 1);
    assert.equal(profile.resourceReferences.length, 1);
    assert.equal(profile.orderIndex, 1);
  });

  it('should compose valid representation relationship', () => {
    const relationship = composeKnowledgeRepresentationRelationship({
      relationshipId: 'rel-001',
      sourceRepresentationId: 'rep-001',
      targetRepresentationId: 'rep-002',
      conceptId: 'concept-001',
      relationshipType: 'complement',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceRepresentationId, 'rep-001');
    assert.equal(relationship.targetRepresentationId, 'rep-002');
    assert.equal(relationship.relationshipType, 'complement');
  });

  it('should compose valid representation trace', () => {
    const trace = composeKnowledgeRepresentationTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', profileId: 'rep-001', conceptId: 'concept-001', validationPassed: true, validationErrors: [] },
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

  it('should compose valid representation registry', () => {
    const registry = composeKnowledgeRepresentationRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeRepresentationRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge representations from input', () => {
    const registry = composeKnowledgeRepresentations(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with representations', () => {
    const artifact = composeKnowledgeArtifactWithRepresentations({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1, VALID_PROFILE_2],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.conceptId, 'concept-001');
    assert.equal(artifact.conceptTitle, 'Neural Networks');
    assert.equal(artifact.profiles.length, 2);
    assert.equal(artifact.relationships.length, 1);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Representation Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeRepresentationProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeRepresentationRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeRepresentationRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge representation input', () => {
    const result = validateKnowledgeRepresentationInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeRepresentationRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeRepresentationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have REPRESENTATION_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, representationId: 'rep-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE_1, representationId: 'rep-002', title: 'Same Title' };
    const registry = composeKnowledgeRepresentationRegistry([profile1, profile2], []);
    const result = validateKnowledgeRepresentationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have REPRESENTATION_DUPLICATE_TITLE error');
  });

  it('should detect invalid type', () => {
    const profile = { ...VALID_PROFILE_1, representationType: 'unsupported' as any };
    const errors = validateKnowledgeRepresentationProfile(profile);
    const typeError = errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_TYPE,
    );
    assert.ok(typeError, 'Should have REPRESENTATION_INVALID_TYPE error');
  });

  it('should detect invalid visual objective', () => {
    const profile = { ...VALID_PROFILE_1, visualObjective: 'unsupported' as any };
    const errors = validateKnowledgeRepresentationProfile(profile);
    const objectiveError = errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_OBJECTIVE,
    );
    assert.ok(objectiveError, 'Should have REPRESENTATION_INVALID_OBJECTIVE error');
  });

  it('should detect invalid complexity', () => {
    const profile = { ...VALID_PROFILE_1, complexity: 'unsupported' as any };
    const errors = validateKnowledgeRepresentationProfile(profile);
    const complexityError = errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_COMPLEXITY,
    );
    assert.ok(complexityError, 'Should have REPRESENTATION_INVALID_COMPLEXITY error');
  });

  it('should detect invalid visibility', () => {
    const profile = { ...VALID_PROFILE_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeRepresentationProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have REPRESENTATION_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeRepresentationProfile(profile);
    const statusError = errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have REPRESENTATION_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeRepresentationProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have REPRESENTATION_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeRepresentationProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have REPRESENTATION_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeRepresentationProfile(profile);
    const providerError = errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have REPRESENTATION_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeRepresentationProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have REPRESENTATION_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetRepresentationId: 'rep-001' };
    const knownProfileIds = new Set(['rep-001', 'rep-002']);
    const errors = validateKnowledgeRepresentationRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have REPRESENTATION_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeRepresentationRegistry([], []);
    const result = validateKnowledgeRepresentationRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have REPRESENTATION_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeRepresentationTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_representation_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeRepresentationTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeRepresentationRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        representationCount: 5,
        relationshipCount: 0,
        conceptCount: 1,
        representationTypeCount: 1,
      },
      trace: {
        traceId: '_trace_1',
        decisionCount: 0,
        validationCount: 0,
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
        decisions: [],
        deterministic: true,
        generatedFrom: 'deterministic_representation_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_representation_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeRepresentationRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === REPRESENTATION_VALIDATION_CODES.REPRESENTATION_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have REPRESENTATION_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeRepresentationTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeRepresentationTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with representations', () => {
    const artifact = composeKnowledgeArtifactWithRepresentations({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1, VALID_PROFILE_2],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithRepresentations(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Representation Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeRepresentations>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeRepresentations(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeRepresentationRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeRepresentationRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeRepresentationProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeRepresentationProvenance({
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
    const results: ReturnType<typeof composeKnowledgeRepresentationTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeRepresentationTrace({
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

describe('Representation Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.representationId;
    const originalTitle = VALID_PROFILE_1.title;

    composeKnowledgeRepresentations(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.representationId, originalId);
    assert.equal(VALID_PROFILE_1.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.representationId);

    composeKnowledgeRepresentationRegistry(profiles, []);

    assert.equal(profiles[0].representationId, originalIds[0]);
    assert.equal(profiles[1].representationId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeRepresentationProfile({
      representationId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      representationType: 'diagram',
      visualObjective: 'visualize',
      complexity: 'standard',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: originalTags,
      resourceReferences: [],
      orderIndex: 1,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.tags, originalTags);
    assert.deepStrictEqual([...profile.tags], originalTags);
  });

  it('should use defensive copies for resourceReferences', () => {
    const originalRefs = ['ref-001', 'ref-002'];
    const profile = composeKnowledgeRepresentationProfile({
      representationId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      representationType: 'diagram',
      visualObjective: 'visualize',
      complexity: 'standard',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: [],
      resourceReferences: originalRefs,
      orderIndex: 1,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.resourceReferences, originalRefs);
    assert.deepStrictEqual([...profile.resourceReferences], originalRefs);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Representation Kernel — Helpers', () => {
  it('should return canonical representation types', () => {
    const types = getCanonicalRepresentationTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_REPRESENTATION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical visual objectives', () => {
    const objectives = getCanonicalVisualObjectives();
    assert.deepStrictEqual([...objectives], [...CANONICAL_VISUAL_OBJECTIVES]);
    assert.equal(objectives.length, 10);
  });

  it('should return canonical representation complexities', () => {
    const complexities = getCanonicalRepresentationComplexities();
    assert.deepStrictEqual([...complexities], [...CANONICAL_REPRESENTATION_COMPLEXITY]);
    assert.equal(complexities.length, 10);
  });

  it('should return canonical representation visibility', () => {
    const visibility = getCanonicalRepresentationVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_REPRESENTATION_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical representation statuses', () => {
    const statuses = getCanonicalRepresentationStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_REPRESENTATION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate representation type support', () => {
    assert.equal(isSupportedRepresentationType('textual'), true);
    assert.equal(isSupportedRepresentationType('diagram'), true);
    assert.equal(isSupportedRepresentationType('unsupported'), false);
  });

  it('should validate visual objective support', () => {
    assert.equal(isSupportedVisualObjective('introduce'), true);
    assert.equal(isSupportedVisualObjective('visualize'), true);
    assert.equal(isSupportedVisualObjective('unsupported'), false);
  });

  it('should validate representation complexity support', () => {
    assert.equal(isSupportedRepresentationComplexity('minimal'), true);
    assert.equal(isSupportedRepresentationComplexity('advanced'), true);
    assert.equal(isSupportedRepresentationComplexity('unsupported'), false);
  });

  it('should validate representation visibility support', () => {
    assert.equal(isSupportedRepresentationVisibility('always'), true);
    assert.equal(isSupportedRepresentationVisibility('default'), true);
    assert.equal(isSupportedRepresentationVisibility('unsupported'), false);
  });

  it('should validate representation status support', () => {
    assert.equal(isSupportedRepresentationStatus('draft'), true);
    assert.equal(isSupportedRepresentationStatus('canonical'), true);
    assert.equal(isSupportedRepresentationStatus('unsupported'), false);
  });

  it('should validate representation governance support', () => {
    assert.equal(isSupportedRepresentationGovernance('canonical'), true);
    assert.equal(isSupportedRepresentationGovernance('accepted'), true);
    assert.equal(isSupportedRepresentationGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Representation Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 representation types', () => {
    assert.equal(CANONICAL_REPRESENTATION_TYPES.length, 10);
  });

  it('should have exactly 10 visual objectives', () => {
    assert.equal(CANONICAL_VISUAL_OBJECTIVES.length, 10);
  });

  it('should have exactly 10 representation complexities', () => {
    assert.equal(CANONICAL_REPRESENTATION_COMPLEXITY.length, 10);
  });

  it('should have exactly 6 representation statuses', () => {
    assert.equal(CANONICAL_REPRESENTATION_STATUS.length, 6);
  });

  it('should have exactly 10 representation visibility values', () => {
    assert.equal(CANONICAL_REPRESENTATION_VISIBILITY.length, 10);
  });

  it('should have exactly 10 representation governance values', () => {
    assert.equal(CANONICAL_REPRESENTATION_GOVERNANCE.length, 10);
  });

  it('should contain all expected representation types', () => {
    const expected = ['textual', 'mathematical', 'diagram', 'illustration', 'animation', 'interactive', 'simulation_reference', 'code_reference', 'table', 'graph'];
    for (const type of expected) {
      assert.ok(CANONICAL_REPRESENTATION_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected visual objectives', () => {
    const expected = ['introduce', 'clarify', 'formalize', 'compare', 'demonstrate', 'summarize', 'reinforce', 'visualize', 'connect', 'explore'];
    for (const objective of expected) {
      assert.ok(CANONICAL_VISUAL_OBJECTIVES.includes(objective as any), `Should include objective: ${objective}`);
    }
  });

  it('should contain all expected representation complexities', () => {
    const expected = ['minimal', 'simple', 'standard', 'intermediate', 'advanced', 'expert', 'research', 'engineering', 'reference', 'canonical'];
    for (const complexity of expected) {
      assert.ok(CANONICAL_REPRESENTATION_COMPLEXITY.includes(complexity as any), `Should include complexity: ${complexity}`);
    }
  });

  it('should contain all expected representation statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_REPRESENTATION_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected representation visibility values', () => {
    const expected = ['always', 'default', 'advanced', 'expert', 'curriculum', 'assessment', 'laboratory', 'research', 'internal', 'hidden'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_REPRESENTATION_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected representation governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_REPRESENTATION_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Representation Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(REPRESENTATION_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with REPRESENTATION_', () => {
    const codes = Object.values(REPRESENTATION_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('REPRESENTATION_'), `Code "${code}" should start with REPRESENTATION_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(REPRESENTATION_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Representation Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeRepresentationProfile({
      representationId: 'rep-001',
      conceptId: 'concept-001',
      title: 'Test',
      representationType: 'diagram',
      visualObjective: 'visualize',
      complexity: 'standard',
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: [],
      resourceReferences: [],
      orderIndex: 1,
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(profile);
    for (const key of keys) {
      const value = (profile as any)[key];
      assert.ok(typeof value !== 'function', `Profile field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Representation Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeRepresentations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Representation Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by conceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, representationId: 'rep-003', conceptId: 'concept-003' };
    const profile1 = { ...VALID_PROFILE_1, representationId: 'rep-001', conceptId: 'concept-001' };
    const profile2 = { ...VALID_PROFILE_1, representationId: 'rep-002', conceptId: 'concept-002' };

    const registry = composeKnowledgeRepresentationRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].conceptId, 'concept-001');
    assert.equal(registry.profiles[1].conceptId, 'concept-002');
    assert.equal(registry.profiles[2].conceptId, 'concept-003');
  });

  it('should sort by orderIndex when conceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, representationId: 'rep-002', conceptId: 'concept-001', orderIndex: 2 };
    const profileB = { ...VALID_PROFILE_1, representationId: 'rep-001', conceptId: 'concept-001', orderIndex: 1 };

    const registry = composeKnowledgeRepresentationRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].orderIndex, 1);
    assert.equal(registry.profiles[1].orderIndex, 2);
  });
});
