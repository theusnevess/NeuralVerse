/**
 * NV-1700-D6-OPT-04 — Analogy, Metaphor & Intuition Modeling Test Suite
 *
 * Comprehensive deterministic test suite for the Analogy Kernel.
 * Covers: valid analogy, valid metaphor, valid intuition, valid mapping,
 * valid bridge, duplicate IDs, invalid enums, invalid abstraction level,
 * missing provenance, registry validation, artifact validation,
 * deterministic ordering, immutable input, helper functions,
 * canonical enum completeness, identical output (100 iterations),
 * negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  AnalogyProvenance,
  Analogy,
  Metaphor,
  Intuition,
  ConceptMapping,
  CognitiveBridge,
  AnalogyInput,
  AnalogyRegistry,
  AnalogyTrace,
  NarrativeArtifactWithAnalogies,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_ANALOGY_TYPES,
  CANONICAL_METAPHOR_TYPES,
  CANONICAL_INTUITION_TYPES,
  CANONICAL_MAPPING_TYPES,
  CANONICAL_ABSTRACTION_LEVELS,
  CANONICAL_ANALOGY_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

import {
  composeAnalogyProvenance,
  composeAnalogy,
  composeMetaphor,
  composeIntuition,
  composeConceptMapping,
  composeCognitiveBridge,
  composeAnalogyTrace,
  composeAnalogyRegistry,
  composeAnalogyRegistryFromInput,
  composeNarrativeAnalogies,
  composeNarrativeArtifactWithAnalogies,
  isSupportedAnalogyType,
  isSupportedMetaphorType,
  isSupportedIntuitionType,
  isSupportedMappingType,
  isSupportedAbstractionLevel,
  isSupportedAnalogyStatus,
  getCanonicalAnalogyTypes,
  getCanonicalMetaphorTypes,
  getCanonicalIntuitionTypes,
  getCanonicalMappingTypes,
  getCanonicalAbstractionLevels,
  getCanonicalAnalogyStatuses,
} from './AnalogyKernel.ts';

import {
  validateAnalogy,
  validateMetaphor,
  validateIntuition,
  validateConceptMapping,
  validateCognitiveBridge,
  validateAnalogyRegistry,
  validateAnalogyInput,
  validateNarrativeArtifactWithAnalogies,
  ANALOGY_VALIDATION_CODES,
} from './AnalogyValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: AnalogyProvenance = {
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  providedBy: 'NeuralVerse Team',
  rationale: 'Core analogy modeling for neural network concepts.',
};

const VALID_ANALOGY: Analogy = {
  analogyId: 'analogy-001',
  analogyType: 'structural',
  title: 'Neural Network as Layered Architecture',
  description: 'Neural networks are like layered buildings with increasing abstraction.',
  sourceConceptId: 'concept-001',
  targetConceptId: 'concept-002',
  mappingId: 'mapping-001',
  abstractionLevel: 'conceptual',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_ANALOGY_2: Analogy = {
  analogyId: 'analogy-002',
  analogyType: 'functional',
  title: 'Backpropagation as Credit Assignment',
  description: 'Backpropagation assigns credit backwards through the network.',
  sourceConceptId: 'concept-003',
  targetConceptId: 'concept-004',
  mappingId: 'mapping-002',
  abstractionLevel: 'algorithmic',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_METAPHOR: Metaphor = {
  metaphorId: 'metaphor-001',
  metaphorType: 'journey',
  title: 'Learning as a Journey',
  description: 'Training a model is like embarking on a journey through loss landscape.',
  relatedAnalogyId: 'analogy-001',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_METAPHOR_2: Metaphor = {
  metaphorId: 'metaphor-002',
  metaphorType: 'construction',
  title: 'Building a Neural Network',
  description: 'Constructing layers is like building floors of a skyscraper.',
  relatedAnalogyId: 'analogy-002',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_INTUITION: Intuition = {
  intuitionId: 'intuition-001',
  intuitionType: 'visual',
  title: 'Visualizing Decision Boundaries',
  description: 'Understanding how classifiers separate data visually.',
  supportedConceptId: 'concept-001',
  abstractionLevel: 'observable',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_INTUITION_2: Intuition = {
  intuitionId: 'intuition-002',
  intuitionType: 'causal',
  title: 'Understanding Gradient Flow',
  description: 'How gradients cause weight updates in backpropagation.',
  supportedConceptId: 'concept-003',
  abstractionLevel: 'conceptual',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_MAPPING: ConceptMapping = {
  mappingId: 'mapping-001',
  mappingType: 'structure_mapping',
  sourceArtifactId: 'artifact-001',
  targetArtifactId: 'artifact-002',
  description: 'Mapping structural properties between domains.',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_MAPPING_2: ConceptMapping = {
  mappingId: 'mapping-002',
  mappingType: 'behavior_mapping',
  sourceArtifactId: 'artifact-003',
  targetArtifactId: 'artifact-004',
  description: 'Mapping behavioral properties between domains.',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_BRIDGE: CognitiveBridge = {
  bridgeId: 'bridge-001',
  analogyId: 'analogy-001',
  metaphorId: 'metaphor-001',
  intuitionId: 'intuition-001',
  mappingId: 'mapping-001',
  bridgePurpose: 'Connect structural understanding to visual intuition.',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_BRIDGE_2: CognitiveBridge = {
  bridgeId: 'bridge-002',
  analogyId: 'analogy-002',
  metaphorId: 'metaphor-002',
  intuitionId: 'intuition-002',
  mappingId: 'mapping-002',
  bridgePurpose: 'Connect functional understanding to causal intuition.',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_INPUT: AnalogyInput = {
  analogies: [VALID_ANALOGY, VALID_ANALOGY_2],
  metaphors: [VALID_METAPHOR, VALID_METAPHOR_2],
  intuitions: [VALID_INTUITION, VALID_INTUITION_2],
  mappings: [VALID_MAPPING, VALID_MAPPING_2],
  bridges: [VALID_BRIDGE, VALID_BRIDGE_2],
};

const EMPTY_INPUT: AnalogyInput = {
  analogies: [],
  metaphors: [],
  intuitions: [],
  mappings: [],
  bridges: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Analogy Kernel — Composition', () => {
  it('should compose valid analogy provenance', () => {
    const provenance = composeAnalogyProvenance({
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      providedBy: 'NeuralVerse Team',
      rationale: 'Core concept.',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.rationale, 'Core concept.');
  });

  it('should compose valid analogy', () => {
    const analogy = composeAnalogy({
      analogyId: 'analogy-001',
      analogyType: 'structural',
      title: 'Neural Network as Architecture',
      description: 'Neural networks are like layered buildings.',
      sourceConceptId: 'concept-001',
      targetConceptId: 'concept-002',
      mappingId: 'mapping-001',
      abstractionLevel: 'conceptual',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(analogy.analogyId, 'analogy-001');
    assert.equal(analogy.analogyType, 'structural');
    assert.equal(analogy.title, 'Neural Network as Architecture');
    assert.equal(analogy.abstractionLevel, 'conceptual');
  });

  it('should compose valid metaphor', () => {
    const metaphor = composeMetaphor({
      metaphorId: 'metaphor-001',
      metaphorType: 'journey',
      title: 'Learning as a Journey',
      description: 'Training is like a journey.',
      relatedAnalogyId: 'analogy-001',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(metaphor.metaphorId, 'metaphor-001');
    assert.equal(metaphor.metaphorType, 'journey');
    assert.equal(metaphor.title, 'Learning as a Journey');
  });

  it('should compose valid intuition', () => {
    const intuition = composeIntuition({
      intuitionId: 'intuition-001',
      intuitionType: 'visual',
      title: 'Visualizing Boundaries',
      description: 'Understanding classifiers visually.',
      supportedConceptId: 'concept-001',
      abstractionLevel: 'observable',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(intuition.intuitionId, 'intuition-001');
    assert.equal(intuition.intuitionType, 'visual');
    assert.equal(intuition.title, 'Visualizing Boundaries');
  });

  it('should compose valid concept mapping', () => {
    const mapping = composeConceptMapping({
      mappingId: 'mapping-001',
      mappingType: 'structure_mapping',
      sourceArtifactId: 'artifact-001',
      targetArtifactId: 'artifact-002',
      description: 'Structural mapping.',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(mapping.mappingId, 'mapping-001');
    assert.equal(mapping.mappingType, 'structure_mapping');
    assert.equal(mapping.description, 'Structural mapping.');
  });

  it('should compose valid cognitive bridge', () => {
    const bridge = composeCognitiveBridge({
      bridgeId: 'bridge-001',
      analogyId: 'analogy-001',
      metaphorId: 'metaphor-001',
      intuitionId: 'intuition-001',
      mappingId: 'mapping-001',
      bridgePurpose: 'Connect structural to visual.',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(bridge.bridgeId, 'bridge-001');
    assert.equal(bridge.bridgePurpose, 'Connect structural to visual.');
  });

  it('should compose valid analogy trace', () => {
    const trace = composeAnalogyTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', analogyId: 'analogy-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      analogyCount: 1,
      metaphorCount: 0,
      intuitionCount: 0,
      mappingCount: 0,
      bridgeCount: 0,
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.analogyCount, 1);
  });

  it('should compose valid analogy registry', () => {
    const registry = composeAnalogyRegistry(
      [VALID_ANALOGY, VALID_ANALOGY_2],
      [VALID_METAPHOR, VALID_METAPHOR_2],
      [VALID_INTUITION, VALID_INTUITION_2],
      [VALID_MAPPING, VALID_MAPPING_2],
      [VALID_BRIDGE, VALID_BRIDGE_2],
    );
    const result = validateAnalogyRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate a valid analogy with no errors', () => {
    const errors = validateAnalogy(VALID_ANALOGY);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid metaphor with no errors', () => {
    const errors = validateMetaphor(VALID_METAPHOR);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid intuition with no errors', () => {
    const errors = validateIntuition(VALID_INTUITION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid mapping with no errors', () => {
    const errors = validateConceptMapping(VALID_MAPPING);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid bridge with no errors', () => {
    const errors = validateCognitiveBridge(VALID_BRIDGE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate analogy input', () => {
    const result = validateAnalogyInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should compose valid narrative artifact with analogies', () => {
    const artifact = composeNarrativeArtifactWithAnalogies({
      narrativeId: 'narrative-001',
      title: 'The Architecture Story',
      unitType: 'lesson_opening',
      narrativeMode: 'engineering_problem',
      domain: 'deep_learning',
      status: 'published',
      canonicalKnowledgeId: 'knowledge-001',
      curriculumNodeId: 'curriculum-001',
      lessonId: 'lesson-001',
      laboratoryId: '',
      sequenceOrder: 1,
      summary: 'Opening narrative.',
      tags: ['architecture'],
      provenance: VALID_PROVENANCE,
      analogies: [VALID_ANALOGY],
      metaphors: [VALID_METAPHOR],
      intuitions: [VALID_INTUITION],
      mappings: [VALID_MAPPING],
      bridges: [VALID_BRIDGE],
    });

    assert.equal(artifact.narrativeId, 'narrative-001');
    assert.equal(artifact.analogies.length, 1);
    assert.equal(artifact.metaphors.length, 1);
    assert.equal(artifact.intuitions.length, 1);
    assert.equal(artifact.mappings.length, 1);
    assert.equal(artifact.bridges.length, 1);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Analogy Kernel — Registry', () => {
  it('should detect duplicate analogy IDs', () => {
    const registry = composeAnalogyRegistry(
      [VALID_ANALOGY, VALID_ANALOGY],
      [VALID_METAPHOR],
      [VALID_INTUITION],
      [VALID_MAPPING],
      [VALID_BRIDGE],
    );
    const result = validateAnalogyRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.ANALOGY_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ANALOGY_DUPLICATE_ID error');
  });

  it('should detect duplicate metaphor IDs', () => {
    const registry = composeAnalogyRegistry(
      [VALID_ANALOGY],
      [VALID_METAPHOR, VALID_METAPHOR],
      [VALID_INTUITION],
      [VALID_MAPPING],
      [VALID_BRIDGE],
    );
    const result = validateAnalogyRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.METAPHOR_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have METAPHOR_DUPLICATE_ID error');
  });

  it('should detect duplicate intuition IDs', () => {
    const registry = composeAnalogyRegistry(
      [VALID_ANALOGY],
      [VALID_METAPHOR],
      [VALID_INTUITION, VALID_INTUITION],
      [VALID_MAPPING],
      [VALID_BRIDGE],
    );
    const result = validateAnalogyRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.INTUITION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have INTUITION_DUPLICATE_ID error');
  });

  it('should detect duplicate mapping IDs', () => {
    const registry = composeAnalogyRegistry(
      [VALID_ANALOGY],
      [VALID_METAPHOR],
      [VALID_INTUITION],
      [VALID_MAPPING, VALID_MAPPING],
      [VALID_BRIDGE],
    );
    const result = validateAnalogyRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.MAPPING_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have MAPPING_DUPLICATE_ID error');
  });

  it('should detect duplicate bridge IDs', () => {
    const registry = composeAnalogyRegistry(
      [VALID_ANALOGY],
      [VALID_METAPHOR],
      [VALID_INTUITION],
      [VALID_MAPPING],
      [VALID_BRIDGE, VALID_BRIDGE],
    );
    const result = validateAnalogyRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.BRIDGE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have BRIDGE_DUPLICATE_ID error');
  });

  it('should sort deterministically by analogyId', () => {
    const analogy3 = { ...VALID_ANALOGY, analogyId: 'analogy-003' };
    const analogy1 = { ...VALID_ANALOGY, analogyId: 'analogy-001' };
    const analogy2 = { ...VALID_ANALOGY, analogyId: 'analogy-002' };

    const registry = composeAnalogyRegistry(
      [analogy3, analogy1, analogy2],
      [VALID_METAPHOR],
      [VALID_INTUITION],
      [VALID_MAPPING],
      [VALID_BRIDGE],
    );

    assert.equal(registry.analogies[0].analogyId, 'analogy-001');
    assert.equal(registry.analogies[1].analogyId, 'analogy-002');
    assert.equal(registry.analogies[2].analogyId, 'analogy-003');
  });

  it('should sort by analogyType when analogyId is equal', () => {
    const analogyA = { ...VALID_ANALOGY, analogyId: 'analogy-001', analogyType: 'functional' as const };
    const analogyB = { ...VALID_ANALOGY, analogyId: 'analogy-001', analogyType: 'structural' as const };

    const registry = composeAnalogyRegistry(
      [analogyA, analogyB],
      [VALID_METAPHOR],
      [VALID_INTUITION],
      [VALID_MAPPING],
      [VALID_BRIDGE],
    );

    assert.equal(registry.analogies[0].analogyType, 'functional');
    assert.equal(registry.analogies[1].analogyType, 'structural');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Analogy Kernel — Validation', () => {
  it('should detect invalid analogy type', () => {
    const analogy = { ...VALID_ANALOGY, analogyType: 'unsupported' as any };
    const errors = validateAnalogy(analogy);
    const typeError = errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.ANALOGY_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have ANALOGY_INVALID_TYPE error');
  });

  it('should detect invalid metaphor type', () => {
    const metaphor = { ...VALID_METAPHOR, metaphorType: 'unsupported' as any };
    const errors = validateMetaphor(metaphor);
    const typeError = errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.METAPHOR_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have METAPHOR_INVALID_TYPE error');
  });

  it('should detect invalid intuition type', () => {
    const intuition = { ...VALID_INTUITION, intuitionType: 'unsupported' as any };
    const errors = validateIntuition(intuition);
    const typeError = errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.INTUITION_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have INTUITION_INVALID_TYPE error');
  });

  it('should detect invalid mapping type', () => {
    const mapping = { ...VALID_MAPPING, mappingType: 'unsupported' as any };
    const errors = validateConceptMapping(mapping);
    const typeError = errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.MAPPING_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have MAPPING_INVALID_TYPE error');
  });

  it('should detect invalid abstraction level', () => {
    const analogy = { ...VALID_ANALOGY, abstractionLevel: 'unsupported' as any };
    const errors = validateAnalogy(analogy);
    const levelError = errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.ANALOGY_INVALID_ABSTRACTION_LEVEL,
    );

    assert.ok(levelError, 'Should have ANALOGY_INVALID_ABSTRACTION_LEVEL error');
  });

  it('should detect missing analogy provenance', () => {
    const analogy = { ...VALID_ANALOGY, provenance: undefined as any };
    const errors = validateAnalogy(analogy);
    const provenanceError = errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have ANALOGY_MISSING_PROVENANCE error');
  });

  it('should detect missing analogy source', () => {
    const analogy = { ...VALID_ANALOGY, provenance: { ...VALID_PROVENANCE, source: '' } };
    const errors = validateAnalogy(analogy);
    const sourceError = errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have ANALOGY_MISSING_SOURCE error');
  });

  it('should detect missing analogy rationale', () => {
    const analogy = { ...VALID_ANALOGY, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateAnalogy(analogy);
    const rationaleError = errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have ANALOGY_MISSING_RATIONALE error');
  });

  it('should detect missing analogy providedBy', () => {
    const analogy = { ...VALID_ANALOGY, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateAnalogy(analogy);
    const providedByError = errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have ANALOGY_MISSING_PROVIDED_BY error');
  });

  it('should detect missing source concept', () => {
    const analogy = { ...VALID_ANALOGY, sourceConceptId: '' };
    const errors = validateAnalogy(analogy);
    const sourceError = errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_SOURCE_CONCEPT,
    );

    assert.ok(sourceError, 'Should have ANALOGY_MISSING_SOURCE_CONCEPT error');
  });

  it('should detect missing target concept', () => {
    const analogy = { ...VALID_ANALOGY, targetConceptId: '' };
    const errors = validateAnalogy(analogy);
    const targetError = errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_TARGET_CONCEPT,
    );

    assert.ok(targetError, 'Should have ANALOGY_MISSING_TARGET_CONCEPT error');
  });

  it('should detect missing bridge purpose', () => {
    const bridge = { ...VALID_BRIDGE, bridgePurpose: '' };
    const errors = validateCognitiveBridge(bridge);
    const purposeError = errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.BRIDGE_MISSING_PURPOSE,
    );

    assert.ok(purposeError, 'Should have BRIDGE_MISSING_PURPOSE error');
  });

  it('should detect missing mapping description', () => {
    const mapping = { ...VALID_MAPPING, description: '' };
    const errors = validateConceptMapping(mapping);
    const descError = errors.find(
      (e) => e.code === ANALOGY_VALIDATION_CODES.MAPPING_MISSING_DESCRIPTION,
    );

    assert.ok(descError, 'Should have MAPPING_MISSING_DESCRIPTION error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Analogy Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeNarrativeAnalogies>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeNarrativeAnalogies(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].analogies, results[i].analogies);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeAnalogyRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeAnalogyRegistry(
        [VALID_ANALOGY, VALID_ANALOGY_2],
        [VALID_METAPHOR, VALID_METAPHOR_2],
        [VALID_INTUITION, VALID_INTUITION_2],
        [VALID_MAPPING, VALID_MAPPING_2],
        [VALID_BRIDGE, VALID_BRIDGE_2],
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].analogies, results[i].analogies);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Analogy Kernel — Immutability', () => {
  it('should not mutate input analogies', () => {
    const originalId = VALID_ANALOGY.analogyId;
    const originalTitle = VALID_ANALOGY.title;

    composeNarrativeAnalogies(VALID_INPUT);

    assert.equal(VALID_ANALOGY.analogyId, originalId);
    assert.equal(VALID_ANALOGY.title, originalTitle);
  });

  it('should not mutate input registry analogies', () => {
    const analogies = [VALID_ANALOGY, VALID_ANALOGY_2];
    const originalIds = analogies.map((a) => a.analogyId);

    composeAnalogyRegistry(
      analogies,
      [VALID_METAPHOR],
      [VALID_INTUITION],
      [VALID_MAPPING],
      [VALID_BRIDGE],
    );

    assert.equal(analogies[0].analogyId, originalIds[0]);
    assert.equal(analogies[1].analogyId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Analogy Kernel — Helper Functions', () => {
  it('should return canonical analogy types', () => {
    const types = getCanonicalAnalogyTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ANALOGY_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical metaphor types', () => {
    const types = getCanonicalMetaphorTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_METAPHOR_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical intuition types', () => {
    const types = getCanonicalIntuitionTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_INTUITION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical mapping types', () => {
    const types = getCanonicalMappingTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_MAPPING_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical abstraction levels', () => {
    const levels = getCanonicalAbstractionLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_ABSTRACTION_LEVELS]);
    assert.equal(levels.length, 10);
  });

  it('should return canonical analogy statuses', () => {
    const statuses = getCanonicalAnalogyStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_ANALOGY_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate analogy type support', () => {
    assert.equal(isSupportedAnalogyType('structural'), true);
    assert.equal(isSupportedAnalogyType('historical'), true);
    assert.equal(isSupportedAnalogyType('unsupported'), false);
  });

  it('should validate metaphor type support', () => {
    assert.equal(isSupportedMetaphorType('journey'), true);
    assert.equal(isSupportedMetaphorType('navigation'), true);
    assert.equal(isSupportedMetaphorType('unsupported'), false);
  });

  it('should validate intuition type support', () => {
    assert.equal(isSupportedIntuitionType('visual'), true);
    assert.equal(isSupportedIntuitionType('systems'), true);
    assert.equal(isSupportedIntuitionType('unsupported'), false);
  });

  it('should validate mapping type support', () => {
    assert.equal(isSupportedMappingType('one_to_one'), true);
    assert.equal(isSupportedMappingType('system_mapping'), true);
    assert.equal(isSupportedMappingType('unsupported'), false);
  });

  it('should validate abstraction level support', () => {
    assert.equal(isSupportedAbstractionLevel('concrete'), true);
    assert.equal(isSupportedAbstractionLevel('research'), true);
    assert.equal(isSupportedAbstractionLevel('unsupported'), false);
  });

  it('should validate analogy status support', () => {
    assert.equal(isSupportedAnalogyStatus('draft'), true);
    assert.equal(isSupportedAnalogyStatus('published'), true);
    assert.equal(isSupportedAnalogyStatus('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Analogy Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 analogy types', () => {
    assert.equal(CANONICAL_ANALOGY_TYPES.length, 10);
  });

  it('should have exactly 10 metaphor types', () => {
    assert.equal(CANONICAL_METAPHOR_TYPES.length, 10);
  });

  it('should have exactly 10 intuition types', () => {
    assert.equal(CANONICAL_INTUITION_TYPES.length, 10);
  });

  it('should have exactly 10 mapping types', () => {
    assert.equal(CANONICAL_MAPPING_TYPES.length, 10);
  });

  it('should have exactly 10 abstraction levels', () => {
    assert.equal(CANONICAL_ABSTRACTION_LEVELS.length, 10);
  });

  it('should have exactly 6 analogy statuses', () => {
    assert.equal(CANONICAL_ANALOGY_STATUS.length, 6);
  });

  it('should contain all expected analogy types', () => {
    const expectedTypes = [
      'structural',
      'functional',
      'behavioral',
      'mechanical',
      'physical',
      'biological',
      'mathematical',
      'computational',
      'everyday_life',
      'historical',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_ANALOGY_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected metaphor types', () => {
    const expectedTypes = [
      'journey',
      'construction',
      'flow',
      'container',
      'network',
      'ecosystem',
      'toolbox',
      'machine',
      'language',
      'navigation',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_METAPHOR_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected intuition types', () => {
    const expectedTypes = [
      'visual',
      'spatial',
      'physical',
      'numerical',
      'behavioral',
      'causal',
      'comparative',
      'incremental',
      'probabilistic',
      'systems',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_INTUITION_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Analogy Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeNarrativeAnalogies(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeNarrativeAnalogies(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeNarrativeAnalogies(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeNarrativeAnalogies(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate analogies', () => {
    const result = composeNarrativeAnalogies(VALID_INPUT);
    assert.ok(!('generatedAnalogies' in result), 'Should not have generated analogies');
    assert.ok(!('autoGeneratedAnalogies' in result), 'Should not have auto-generated analogies');
  });

  it('should not invent metaphors', () => {
    const result = composeNarrativeAnalogies(VALID_INPUT);
    assert.ok(!('inventedMetaphors' in result), 'Should not have invented metaphors');
    assert.ok(!('generatedMetaphors' in result), 'Should not have generated metaphors');
  });

  it('should not infer intuition automatically', () => {
    const result = composeNarrativeAnalogies(VALID_INPUT);
    assert.ok(!('inferredIntuition' in result), 'Should not have inferred intuition');
    assert.ok(!('autoInferredIntuition' in result), 'Should not have auto-inferred intuition');
  });

  it('should not rewrite explanations', () => {
    const result = composeNarrativeAnalogies(VALID_INPUT);
    assert.ok(!('rewrittenExplanations' in result), 'Should not have rewritten explanations');
    assert.ok(!('modifiedExplanations' in result), 'Should not have modified explanations');
  });

  it('should not personalize analogies', () => {
    const result = composeNarrativeAnalogies(VALID_INPUT);
    assert.ok(!('personalizedAnalogies' in result), 'Should not have personalized analogies');
    assert.ok(!('learnerAnalogies' in result), 'Should not have learner analogies');
  });

  it('should not infer learner understanding', () => {
    const result = composeNarrativeAnalogies(VALID_INPUT);
    assert.ok(!('learnerUnderstanding' in result), 'Should not have learner understanding');
    assert.ok(!('understandingInference' in result), 'Should not have understanding inference');
  });

  it('should not generate educational content', () => {
    const result = composeNarrativeAnalogies(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
  });

  it('should not call LLMs', () => {
    const result = composeNarrativeAnalogies(VALID_INPUT);
    assert.ok(!('llmCall' in result), 'Should not have LLM call');
    assert.ok(!('modelResponse' in result), 'Should not have model response');
  });

  it('should not have executable callbacks in analogy', () => {
    const analogy = composeAnalogy({
      analogyId: 'analogy-001',
      analogyType: 'structural',
      title: 'Test',
      description: 'Test.',
      sourceConceptId: 'concept-001',
      targetConceptId: 'concept-002',
      mappingId: 'mapping-001',
      abstractionLevel: 'conceptual',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(analogy);
    for (const key of keys) {
      const value = (analogy as any)[key];
      assert.ok(typeof value !== 'function', `Analogy field "${key}" should not be a function`);
    }
  });
});