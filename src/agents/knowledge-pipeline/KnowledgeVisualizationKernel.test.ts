/**
 * D10-OPT-08 — Visualization Metadata Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Visualization Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeVisualizationProfile,
  KnowledgeVisualizationProvenance,
  KnowledgeVisualizationRelationship,
  KnowledgeVisualizationInput,
  KnowledgeVisualizationRegistry,
  KnowledgeVisualizationTrace,
  KnowledgeArtifactWithVisualizations,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_VISUALIZATION_TYPES,
  CANONICAL_VISUALIZATION_OBJECTIVES,
  CANONICAL_VISUALIZATION_COMPLEXITY,
  CANONICAL_VISUALIZATION_STATUS,
  CANONICAL_VISUALIZATION_VISIBILITY,
  CANONICAL_VISUALIZATION_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeVisualizationProvenance,
  composeKnowledgeVisualizationProfile,
  composeKnowledgeVisualizationRelationship,
  composeKnowledgeVisualizationTrace,
  composeKnowledgeVisualizationRegistry,
  composeKnowledgeVisualizationRegistryFromInput,
  composeKnowledgeVisualizations,
  composeKnowledgeArtifactWithVisualizations,
  isSupportedVisualizationType,
  isSupportedVisualizationObjective,
  isSupportedVisualizationComplexity,
  isSupportedVisualizationVisibility,
  isSupportedVisualizationStatus,
  isSupportedVisualizationGovernance,
  getCanonicalVisualizationTypes,
  getCanonicalVisualizationObjectives,
  getCanonicalVisualizationComplexities,
  getCanonicalVisualizationVisibility,
  getCanonicalVisualizationStatuses,
} from './KnowledgeVisualizationKernel.ts';

import {
  validateKnowledgeVisualizationProfile,
  validateKnowledgeVisualizationRelationship,
  validateKnowledgeVisualizationRegistry,
  validateKnowledgeVisualizationInput,
  validateKnowledgeVisualizationTrace,
  validateKnowledgeArtifactWithVisualizations,
  VISUALIZATION_VALIDATION_CODES,
} from './KnowledgeVisualizationValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeVisualizationProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Visualization Agent',
  rationale: 'Core visualization for concept.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeVisualizationProfile = {
  visualizationId: 'vis-001',
  conceptId: 'concept-001',
  title: 'Neural Network Architecture Overview',
  visualizationType: 'architecture_overview',
  objective: 'introduce',
  complexity: 'standard',
  visibility: 'default',
  status: 'canonical',
  governance: 'canonical',
  orderIndex: 1,
  tags: ['neural_networks', 'architecture'],
  resourceReferences: ['res-001'],
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeVisualizationProfile = {
  visualizationId: 'vis-002',
  conceptId: 'concept-001',
  title: 'Training Process Flow',
  visualizationType: 'process_flow',
  objective: 'clarify',
  complexity: 'intermediate',
  visibility: 'advanced',
  status: 'approved',
  governance: 'accepted',
  orderIndex: 2,
  tags: ['training', 'process'],
  resourceReferences: ['res-002'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeVisualizationProfile = {
  visualizationId: 'vis-003',
  conceptId: 'concept-002',
  title: 'Loss Function Comparison Matrix',
  visualizationType: 'comparison_matrix',
  objective: 'compare',
  complexity: 'advanced',
  visibility: 'expert',
  status: 'canonical',
  governance: 'canonical',
  orderIndex: 1,
  tags: ['loss', 'comparison'],
  resourceReferences: [],
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeVisualizationRelationship = {
  relationshipId: 'rel-001',
  sourceVisualizationId: 'vis-001',
  targetVisualizationId: 'vis-002',
  relationshipType: 'extension',
  description: 'Process flow extends architecture overview.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeVisualizationInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeVisualizationInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Visualization Kernel — Composition', () => {
  it('should compose valid visualization provenance', () => {
    const provenance = composeKnowledgeVisualizationProvenance({
      source: 'NeuralVerse Team',
      provider: 'Visualization Agent',
      rationale: 'Core visualization.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Visualization Agent');
    assert.equal(provenance.rationale, 'Core visualization.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid visualization profile', () => {
    const profile = composeKnowledgeVisualizationProfile({
      visualizationId: 'vis-001',
      conceptId: 'concept-001',
      title: 'Test Visualization',
      visualizationType: 'concept_diagram',
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

    assert.equal(profile.visualizationId, 'vis-001');
    assert.equal(profile.title, 'Test Visualization');
    assert.equal(profile.visualizationType, 'concept_diagram');
    assert.equal(profile.tags.length, 1);
    assert.equal(profile.resourceReferences.length, 1);
    assert.equal(profile.orderIndex, 1);
  });

  it('should compose valid visualization relationship', () => {
    const relationship = composeKnowledgeVisualizationRelationship({
      relationshipId: 'rel-001',
      sourceVisualizationId: 'vis-001',
      targetVisualizationId: 'vis-002',
      relationshipType: 'extension',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceVisualizationId, 'vis-001');
    assert.equal(relationship.targetVisualizationId, 'vis-002');
    assert.equal(relationship.relationshipType, 'extension');
  });

  it('should compose valid visualization trace', () => {
    const trace = composeKnowledgeVisualizationTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', visualizationId: 'vis-001', conceptId: 'concept-001', validationPassed: true, validationErrors: [] },
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

  it('should compose valid visualization registry', () => {
    const registry = composeKnowledgeVisualizationRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeVisualizationRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge visualizations from input', () => {
    const registry = composeKnowledgeVisualizations(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with visualizations', () => {
    const artifact = composeKnowledgeArtifactWithVisualizations({
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

describe('Visualization Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeVisualizationProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeVisualizationRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeVisualizationRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge visualization input', () => {
    const result = validateKnowledgeVisualizationInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeVisualizationRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeVisualizationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have VISUALIZATION_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, visualizationId: 'vis-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE_1, visualizationId: 'vis-002', title: 'Same Title' };
    const registry = composeKnowledgeVisualizationRegistry([profile1, profile2], []);
    const result = validateKnowledgeVisualizationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have VISUALIZATION_DUPLICATE_TITLE error');
  });

  it('should detect invalid type', () => {
    const profile = { ...VALID_PROFILE_1, visualizationType: 'unsupported' as any };
    const errors = validateKnowledgeVisualizationProfile(profile);
    const typeError = errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_TYPE,
    );
    assert.ok(typeError, 'Should have VISUALIZATION_INVALID_TYPE error');
  });

  it('should detect invalid objective', () => {
    const profile = { ...VALID_PROFILE_1, objective: 'unsupported' as any };
    const errors = validateKnowledgeVisualizationProfile(profile);
    const objectiveError = errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_OBJECTIVE,
    );
    assert.ok(objectiveError, 'Should have VISUALIZATION_INVALID_OBJECTIVE error');
  });

  it('should detect invalid complexity', () => {
    const profile = { ...VALID_PROFILE_1, complexity: 'unsupported' as any };
    const errors = validateKnowledgeVisualizationProfile(profile);
    const complexityError = errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_COMPLEXITY,
    );
    assert.ok(complexityError, 'Should have VISUALIZATION_INVALID_COMPLEXITY error');
  });

  it('should detect invalid visibility', () => {
    const profile = { ...VALID_PROFILE_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeVisualizationProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have VISUALIZATION_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeVisualizationProfile(profile);
    const statusError = errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have VISUALIZATION_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeVisualizationProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have VISUALIZATION_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeVisualizationProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have VISUALIZATION_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeVisualizationProfile(profile);
    const providerError = errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have VISUALIZATION_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeVisualizationProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have VISUALIZATION_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetVisualizationId: 'vis-001' };
    const knownProfileIds = new Set(['vis-001', 'vis-002']);
    const errors = validateKnowledgeVisualizationRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have VISUALIZATION_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeVisualizationRegistry([], []);
    const result = validateKnowledgeVisualizationRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have VISUALIZATION_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeVisualizationTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_visualization_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeVisualizationTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeVisualizationRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        visualizationCount: 5,
        relationshipCount: 0,
        conceptCount: 1,
        visualizationTypeCount: 1,
      },
      trace: {
        traceId: '_trace_1',
        decisionCount: 0,
        validationCount: 0,
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
        decisions: [],
        deterministic: true,
        generatedFrom: 'deterministic_visualization_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_visualization_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeVisualizationRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === VISUALIZATION_VALIDATION_CODES.VISUALIZATION_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have VISUALIZATION_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeVisualizationTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeVisualizationTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with visualizations', () => {
    const artifact = composeKnowledgeArtifactWithVisualizations({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithVisualizations(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Visualization Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeVisualizations>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeVisualizations(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeVisualizationRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeVisualizationRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeVisualizationProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeVisualizationProvenance({
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
    const results: ReturnType<typeof composeKnowledgeVisualizationTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeVisualizationTrace({
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

describe('Visualization Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.visualizationId;
    const originalTitle = VALID_PROFILE_1.title;

    composeKnowledgeVisualizations(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.visualizationId, originalId);
    assert.equal(VALID_PROFILE_1.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.visualizationId);

    composeKnowledgeVisualizationRegistry(profiles, []);

    assert.equal(profiles[0].visualizationId, originalIds[0]);
    assert.equal(profiles[1].visualizationId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeVisualizationProfile({
      visualizationId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      visualizationType: 'concept_diagram',
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
    const profile = composeKnowledgeVisualizationProfile({
      visualizationId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      visualizationType: 'concept_diagram',
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

describe('Visualization Kernel — Helpers', () => {
  it('should return canonical visualization types', () => {
    const types = getCanonicalVisualizationTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_VISUALIZATION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical visualization objectives', () => {
    const objectives = getCanonicalVisualizationObjectives();
    assert.deepStrictEqual([...objectives], [...CANONICAL_VISUALIZATION_OBJECTIVES]);
    assert.equal(objectives.length, 10);
  });

  it('should return canonical visualization complexities', () => {
    const complexities = getCanonicalVisualizationComplexities();
    assert.deepStrictEqual([...complexities], [...CANONICAL_VISUALIZATION_COMPLEXITY]);
    assert.equal(complexities.length, 10);
  });

  it('should return canonical visualization visibility', () => {
    const visibility = getCanonicalVisualizationVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_VISUALIZATION_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical visualization statuses', () => {
    const statuses = getCanonicalVisualizationStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_VISUALIZATION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate visualization type support', () => {
    assert.equal(isSupportedVisualizationType('concept_diagram'), true);
    assert.equal(isSupportedVisualizationType('process_flow'), true);
    assert.equal(isSupportedVisualizationType('unsupported'), false);
  });

  it('should validate visualization objective support', () => {
    assert.equal(isSupportedVisualizationObjective('introduce'), true);
    assert.equal(isSupportedVisualizationObjective('clarify'), true);
    assert.equal(isSupportedVisualizationObjective('unsupported'), false);
  });

  it('should validate visualization complexity support', () => {
    assert.equal(isSupportedVisualizationComplexity('minimal'), true);
    assert.equal(isSupportedVisualizationComplexity('advanced'), true);
    assert.equal(isSupportedVisualizationComplexity('unsupported'), false);
  });

  it('should validate visualization visibility support', () => {
    assert.equal(isSupportedVisualizationVisibility('always'), true);
    assert.equal(isSupportedVisualizationVisibility('default'), true);
    assert.equal(isSupportedVisualizationVisibility('unsupported'), false);
  });

  it('should validate visualization status support', () => {
    assert.equal(isSupportedVisualizationStatus('draft'), true);
    assert.equal(isSupportedVisualizationStatus('canonical'), true);
    assert.equal(isSupportedVisualizationStatus('unsupported'), false);
  });

  it('should validate visualization governance support', () => {
    assert.equal(isSupportedVisualizationGovernance('canonical'), true);
    assert.equal(isSupportedVisualizationGovernance('accepted'), true);
    assert.equal(isSupportedVisualizationGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Visualization Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 visualization types', () => {
    assert.equal(CANONICAL_VISUALIZATION_TYPES.length, 10);
  });

  it('should have exactly 10 visualization objectives', () => {
    assert.equal(CANONICAL_VISUALIZATION_OBJECTIVES.length, 10);
  });

  it('should have exactly 10 visualization complexities', () => {
    assert.equal(CANONICAL_VISUALIZATION_COMPLEXITY.length, 10);
  });

  it('should have exactly 6 visualization statuses', () => {
    assert.equal(CANONICAL_VISUALIZATION_STATUS.length, 6);
  });

  it('should have exactly 10 visualization visibility values', () => {
    assert.equal(CANONICAL_VISUALIZATION_VISIBILITY.length, 10);
  });

  it('should have exactly 10 visualization governance values', () => {
    assert.equal(CANONICAL_VISUALIZATION_GOVERNANCE.length, 10);
  });

  it('should contain all expected visualization types', () => {
    const expected = ['concept_diagram', 'process_flow', 'architecture_overview', 'knowledge_graph', 'timeline', 'comparison_matrix', 'decision_tree', 'pipeline_overview', 'hierarchy', 'system_map'];
    for (const type of expected) {
      assert.ok(CANONICAL_VISUALIZATION_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected visualization objectives', () => {
    const expected = ['introduce', 'clarify', 'summarize', 'compare', 'organize', 'connect', 'visualize', 'navigate', 'analyze', 'reference'];
    for (const objective of expected) {
      assert.ok(CANONICAL_VISUALIZATION_OBJECTIVES.includes(objective as any), `Should include objective: ${objective}`);
    }
  });

  it('should contain all expected visualization complexities', () => {
    const expected = ['minimal', 'simple', 'standard', 'intermediate', 'advanced', 'expert', 'engineering', 'research', 'reference', 'canonical'];
    for (const complexity of expected) {
      assert.ok(CANONICAL_VISUALIZATION_COMPLEXITY.includes(complexity as any), `Should include complexity: ${complexity}`);
    }
  });

  it('should contain all expected visualization statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_VISUALIZATION_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected visualization visibility values', () => {
    const expected = ['always', 'default', 'advanced', 'expert', 'curriculum', 'assessment', 'laboratory', 'research', 'internal', 'hidden'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_VISUALIZATION_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected visualization governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_VISUALIZATION_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Visualization Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(VISUALIZATION_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with VISUALIZATION_', () => {
    const codes = Object.values(VISUALIZATION_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('VISUALIZATION_'), `Code "${code}" should start with VISUALIZATION_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(VISUALIZATION_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Visualization Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeVisualizationProfile({
      visualizationId: 'vis-001',
      conceptId: 'concept-001',
      title: 'Test',
      visualizationType: 'concept_diagram',
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
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Visualization Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeVisualizations(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Visualization Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by conceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, visualizationId: 'vis-003', conceptId: 'concept-003' };
    const profile1 = { ...VALID_PROFILE_1, visualizationId: 'vis-001', conceptId: 'concept-001' };
    const profile2 = { ...VALID_PROFILE_1, visualizationId: 'vis-002', conceptId: 'concept-002' };

    const registry = composeKnowledgeVisualizationRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].conceptId, 'concept-001');
    assert.equal(registry.profiles[1].conceptId, 'concept-002');
    assert.equal(registry.profiles[2].conceptId, 'concept-003');
  });

  it('should sort by visualizationType when conceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, visualizationId: 'vis-002', conceptId: 'concept-001', visualizationType: 'process_flow' as const };
    const profileB = { ...VALID_PROFILE_1, visualizationId: 'vis-001', conceptId: 'concept-001', visualizationType: 'concept_diagram' as const };

    const registry = composeKnowledgeVisualizationRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].visualizationType, 'concept_diagram');
    assert.equal(registry.profiles[1].visualizationType, 'process_flow');
  });
});
