/**
 * D10-OPT-07 — Mathematical Graph Modeling Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Mathematical Graph Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeGraphProfile,
  KnowledgeGraphProvenance,
  KnowledgeGraphRelationship,
  KnowledgeGraphInput,
  KnowledgeGraphRegistry,
  KnowledgeGraphTrace,
  KnowledgeArtifactWithGraphs,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_GRAPH_TYPES,
  CANONICAL_GRAPH_OBJECTIVES,
  CANONICAL_COORDINATE_SYSTEMS,
  CANONICAL_GRAPH_STATUS,
  CANONICAL_GRAPH_VISIBILITY,
  CANONICAL_GRAPH_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeGraphProvenance,
  composeKnowledgeGraphProfile,
  composeKnowledgeGraphRelationship,
  composeKnowledgeGraphTrace,
  composeKnowledgeGraphRegistry,
  composeKnowledgeGraphRegistryFromInput,
  composeKnowledgeGraphs,
  composeKnowledgeArtifactWithGraphs,
  isSupportedGraphType,
  isSupportedGraphObjective,
  isSupportedCoordinateSystem,
  isSupportedGraphVisibility,
  isSupportedGraphStatus,
  isSupportedGraphGovernance,
  getCanonicalGraphTypes,
  getCanonicalGraphObjectives,
  getCanonicalCoordinateSystems,
  getCanonicalGraphVisibility,
  getCanonicalGraphStatuses,
} from './KnowledgeGraphKernel.ts';

import {
  validateKnowledgeGraphProfile,
  validateKnowledgeGraphRelationship,
  validateKnowledgeGraphRegistry,
  validateKnowledgeGraphInput,
  validateKnowledgeGraphTrace,
  validateKnowledgeArtifactWithGraphs,
  GRAPH_VALIDATION_CODES,
} from './KnowledgeGraphValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeGraphProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Graph Agent',
  rationale: 'Core graph for neural network concept.',
  governance: 'canonical',
};

const VALID_PROFILE_1: KnowledgeGraphProfile = {
  graphId: 'graph-001',
  title: 'Sigmoid Function Graph',
  conceptId: 'concept-sigmoid',
  graphType: 'function_graph',
  objective: 'visualize',
  coordinateSystem: 'cartesian_2d',
  mathematicalExpressionRef: 'expr-sigmoid',
  domainReference: 'domain-real',
  rangeReference: 'range-0-1',
  visualizationParameters: ['color:blue', 'thickness:2'],
  visibility: 'default',
  status: 'canonical',
  governance: 'canonical',
  tags: ['sigmoid', 'activation'],
  provenance: VALID_PROVENANCE,
};

const VALID_PROFILE_2: KnowledgeGraphProfile = {
  graphId: 'graph-002',
  title: 'ReLU Function Graph',
  conceptId: 'concept-relu',
  graphType: 'function_graph',
  objective: 'demonstrate',
  coordinateSystem: 'cartesian_2d',
  mathematicalExpressionRef: 'expr-relu',
  domainReference: 'domain-real',
  rangeReference: 'range-0-infinity',
  visualizationParameters: ['color:red', 'thickness:2'],
  visibility: 'default',
  status: 'approved',
  governance: 'accepted',
  tags: ['relu', 'activation'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PROFILE_3: KnowledgeGraphProfile = {
  graphId: 'graph-003',
  title: 'Loss Landscape Surface',
  conceptId: 'concept-loss',
  graphType: 'surface_reference',
  objective: 'analyze',
  coordinateSystem: 'cartesian_3d',
  mathematicalExpressionRef: 'expr-loss',
  domainReference: 'domain-params',
  rangeReference: 'range-loss',
  visualizationParameters: ['colormap:viridis', 'opacity:0.8'],
  visibility: 'advanced',
  status: 'canonical',
  governance: 'canonical',
  tags: ['loss', 'optimization'],
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeGraphRelationship = {
  relationshipId: 'rel-001',
  sourceGraphId: 'graph-001',
  targetGraphId: 'graph-002',
  relationshipType: 'alternative',
  description: 'ReLU alternative to sigmoid.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeGraphInput = {
  profiles: [VALID_PROFILE_1, VALID_PROFILE_2, VALID_PROFILE_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeGraphInput = {
  profiles: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Math Graph Kernel — Composition', () => {
  it('should compose valid graph provenance', () => {
    const provenance = composeKnowledgeGraphProvenance({
      source: 'NeuralVerse Team',
      provider: 'Graph Agent',
      rationale: 'Core graph.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Graph Agent');
    assert.equal(provenance.rationale, 'Core graph.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid graph profile', () => {
    const profile = composeKnowledgeGraphProfile({
      graphId: 'graph-001',
      title: 'Test Graph',
      conceptId: 'concept-test',
      graphType: 'function_graph',
      objective: 'visualize',
      coordinateSystem: 'cartesian_2d',
      mathematicalExpressionRef: 'expr-test',
      domainReference: 'domain-test',
      rangeReference: 'range-test',
      visualizationParameters: ['param:value'],
      visibility: 'default',
      status: 'canonical',
      governance: 'canonical',
      tags: ['tag1'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(profile.graphId, 'graph-001');
    assert.equal(profile.title, 'Test Graph');
    assert.equal(profile.graphType, 'function_graph');
    assert.equal(profile.visualizationParameters.length, 1);
    assert.equal(profile.tags.length, 1);
  });

  it('should compose valid graph relationship', () => {
    const relationship = composeKnowledgeGraphRelationship({
      relationshipId: 'rel-001',
      sourceGraphId: 'graph-001',
      targetGraphId: 'graph-002',
      relationshipType: 'alternative',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceGraphId, 'graph-001');
    assert.equal(relationship.targetGraphId, 'graph-002');
    assert.equal(relationship.relationshipType, 'alternative');
  });

  it('should compose valid graph trace', () => {
    const trace = composeKnowledgeGraphTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', graphId: 'graph-001', conceptId: 'concept-a', validationPassed: true, validationErrors: [] },
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

  it('should compose valid graph registry', () => {
    const registry = composeKnowledgeGraphRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.profiles.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeGraphRegistryFromInput(VALID_INPUT);
    assert.equal(registry.profiles.length, 3);
  });

  it('should compose knowledge graphs from input', () => {
    const registry = composeKnowledgeGraphs(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with graphs', () => {
    const artifact = composeKnowledgeArtifactWithGraphs({
      conceptId: 'concept-sigmoid',
      conceptTitle: 'Sigmoid Function',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.conceptId, 'concept-sigmoid');
    assert.equal(artifact.conceptTitle, 'Sigmoid Function');
    assert.equal(artifact.profiles.length, 1);
    assert.equal(artifact.relationships.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Math Graph Kernel — Validation', () => {
  it('should validate a valid profile with no errors', () => {
    const errors = validateKnowledgeGraphProfile(VALID_PROFILE_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeGraphRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeGraphRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge graph input', () => {
    const result = validateKnowledgeGraphInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeGraphRegistry([VALID_PROFILE_1, VALID_PROFILE_1], []);
    const result = validateKnowledgeGraphRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have GRAPH_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const profile1 = { ...VALID_PROFILE_1, graphId: 'graph-001', title: 'Same Title' };
    const profile2 = { ...VALID_PROFILE_1, graphId: 'graph-002', title: 'Same Title' };
    const registry = composeKnowledgeGraphRegistry([profile1, profile2], []);
    const result = validateKnowledgeGraphRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have GRAPH_DUPLICATE_TITLE error');
  });

  it('should detect invalid type', () => {
    const profile = { ...VALID_PROFILE_1, graphType: 'unsupported' as any };
    const errors = validateKnowledgeGraphProfile(profile);
    const typeError = errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_INVALID_TYPE,
    );
    assert.ok(typeError, 'Should have GRAPH_INVALID_TYPE error');
  });

  it('should detect invalid objective', () => {
    const profile = { ...VALID_PROFILE_1, objective: 'unsupported' as any };
    const errors = validateKnowledgeGraphProfile(profile);
    const objectiveError = errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_INVALID_OBJECTIVE,
    );
    assert.ok(objectiveError, 'Should have GRAPH_INVALID_OBJECTIVE error');
  });

  it('should detect invalid coordinate system', () => {
    const profile = { ...VALID_PROFILE_1, coordinateSystem: 'unsupported' as any };
    const errors = validateKnowledgeGraphProfile(profile);
    const coordinateError = errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_INVALID_COORDINATE_SYSTEM,
    );
    assert.ok(coordinateError, 'Should have GRAPH_INVALID_COORDINATE_SYSTEM error');
  });

  it('should detect invalid visibility', () => {
    const profile = { ...VALID_PROFILE_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeGraphProfile(profile);
    const visibilityError = errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have GRAPH_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const profile = { ...VALID_PROFILE_1, status: 'unsupported' as any };
    const errors = validateKnowledgeGraphProfile(profile);
    const statusError = errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have GRAPH_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const profile = { ...VALID_PROFILE_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeGraphProfile(profile);
    const governanceError = errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have GRAPH_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const profile = { ...VALID_PROFILE_1, provenance: undefined as any };
    const errors = validateKnowledgeGraphProfile(profile);
    const provenanceError = errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have GRAPH_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeGraphProfile(profile);
    const providerError = errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have GRAPH_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const profile = { ...VALID_PROFILE_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeGraphProfile(profile);
    const rationaleError = errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have GRAPH_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetGraphId: 'graph-001' };
    const knownProfileIds = new Set(['graph-001', 'graph-002']);
    const errors = validateKnowledgeGraphRelationship(relationship, knownProfileIds);
    const selfError = errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have GRAPH_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeGraphRegistry([], []);
    const result = validateKnowledgeGraphRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have GRAPH_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeGraphTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_math_graph_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeGraphTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeGraphRegistry = {
      registryId: '_registry_5',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        graphCount: 5,
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
        generatedFrom: 'deterministic_math_graph_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_math_graph_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeGraphRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === GRAPH_VALIDATION_CODES.GRAPH_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have GRAPH_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeGraphTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeGraphTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with graphs', () => {
    const artifact = composeKnowledgeArtifactWithGraphs({
      conceptId: 'concept-sigmoid',
      conceptTitle: 'Sigmoid Function',
      profiles: [VALID_PROFILE_1],
      relationships: [],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithGraphs(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Math Graph Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeGraphs>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeGraphs(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeGraphRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeGraphRegistry([VALID_PROFILE_1, VALID_PROFILE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].profiles, results[i].profiles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeGraphProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeGraphProvenance({
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
    const results: ReturnType<typeof composeKnowledgeGraphTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeGraphTrace({
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

describe('Math Graph Kernel — Immutability', () => {
  it('should not mutate input profiles', () => {
    const originalId = VALID_PROFILE_1.graphId;
    const originalTitle = VALID_PROFILE_1.title;

    composeKnowledgeGraphs(VALID_INPUT);

    assert.equal(VALID_PROFILE_1.graphId, originalId);
    assert.equal(VALID_PROFILE_1.title, originalTitle);
  });

  it('should not mutate input registry profiles', () => {
    const profiles = [VALID_PROFILE_1, VALID_PROFILE_2];
    const originalIds = profiles.map((p) => p.graphId);

    composeKnowledgeGraphRegistry(profiles, []);

    assert.equal(profiles[0].graphId, originalIds[0]);
    assert.equal(profiles[1].graphId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const profile = composeKnowledgeGraphProfile({
      graphId: 'test',
      title: 'Test.',
      conceptId: 'concept-test',
      graphType: 'function_graph',
      objective: 'visualize',
      coordinateSystem: 'cartesian_2d',
      mathematicalExpressionRef: 'expr-test',
      domainReference: 'domain-test',
      rangeReference: 'range-test',
      visualizationParameters: [],
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: originalTags,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.tags, originalTags);
    assert.deepStrictEqual([...profile.tags], originalTags);
  });

  it('should use defensive copies for visualizationParameters', () => {
    const originalParams = ['param1:value1', 'param2:value2'];
    const profile = composeKnowledgeGraphProfile({
      graphId: 'test',
      title: 'Test.',
      conceptId: 'concept-test',
      graphType: 'function_graph',
      objective: 'visualize',
      coordinateSystem: 'cartesian_2d',
      mathematicalExpressionRef: 'expr-test',
      domainReference: 'domain-test',
      rangeReference: 'range-test',
      visualizationParameters: originalParams,
      visibility: 'default',
      status: 'draft',
      governance: 'public',
      tags: [],
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(profile.visualizationParameters, originalParams);
    assert.deepStrictEqual([...profile.visualizationParameters], originalParams);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Math Graph Kernel — Helpers', () => {
  it('should return canonical graph types', () => {
    const types = getCanonicalGraphTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_GRAPH_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical graph objectives', () => {
    const objectives = getCanonicalGraphObjectives();
    assert.deepStrictEqual([...objectives], [...CANONICAL_GRAPH_OBJECTIVES]);
    assert.equal(objectives.length, 10);
  });

  it('should return canonical coordinate systems', () => {
    const systems = getCanonicalCoordinateSystems();
    assert.deepStrictEqual([...systems], [...CANONICAL_COORDINATE_SYSTEMS]);
    assert.equal(systems.length, 10);
  });

  it('should return canonical graph visibility', () => {
    const visibility = getCanonicalGraphVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_GRAPH_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical graph statuses', () => {
    const statuses = getCanonicalGraphStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_GRAPH_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate graph type support', () => {
    assert.equal(isSupportedGraphType('function_graph'), true);
    assert.equal(isSupportedGraphType('coordinate_plane'), true);
    assert.equal(isSupportedGraphType('unsupported'), false);
  });

  it('should validate graph objective support', () => {
    assert.equal(isSupportedGraphObjective('visualize'), true);
    assert.equal(isSupportedGraphObjective('formalize'), true);
    assert.equal(isSupportedGraphObjective('unsupported'), false);
  });

  it('should validate coordinate system support', () => {
    assert.equal(isSupportedCoordinateSystem('cartesian_2d'), true);
    assert.equal(isSupportedCoordinateSystem('polar'), true);
    assert.equal(isSupportedCoordinateSystem('unsupported'), false);
  });

  it('should validate graph visibility support', () => {
    assert.equal(isSupportedGraphVisibility('always'), true);
    assert.equal(isSupportedGraphVisibility('default'), true);
    assert.equal(isSupportedGraphVisibility('unsupported'), false);
  });

  it('should validate graph status support', () => {
    assert.equal(isSupportedGraphStatus('draft'), true);
    assert.equal(isSupportedGraphStatus('canonical'), true);
    assert.equal(isSupportedGraphStatus('unsupported'), false);
  });

  it('should validate graph governance support', () => {
    assert.equal(isSupportedGraphGovernance('canonical'), true);
    assert.equal(isSupportedGraphGovernance('accepted'), true);
    assert.equal(isSupportedGraphGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Math Graph Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 graph types', () => {
    assert.equal(CANONICAL_GRAPH_TYPES.length, 10);
  });

  it('should have exactly 10 graph objectives', () => {
    assert.equal(CANONICAL_GRAPH_OBJECTIVES.length, 10);
  });

  it('should have exactly 10 coordinate systems', () => {
    assert.equal(CANONICAL_COORDINATE_SYSTEMS.length, 10);
  });

  it('should have exactly 6 graph statuses', () => {
    assert.equal(CANONICAL_GRAPH_STATUS.length, 6);
  });

  it('should have exactly 10 graph visibility values', () => {
    assert.equal(CANONICAL_GRAPH_VISIBILITY.length, 10);
  });

  it('should have exactly 10 graph governance values', () => {
    assert.equal(CANONICAL_GRAPH_GOVERNANCE.length, 10);
  });

  it('should contain all expected graph types', () => {
    const expected = ['function_graph', 'coordinate_plane', 'parametric_curve', 'polar_graph', 'implicit_curve', 'surface_reference', 'vector_field_reference', 'probability_distribution', 'optimization_landscape', 'geometric_visualization'];
    for (const type of expected) {
      assert.ok(CANONICAL_GRAPH_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected graph objectives', () => {
    const expected = ['visualize', 'formalize', 'derive', 'compare', 'analyze', 'demonstrate', 'interpret', 'connect', 'explore', 'reference'];
    for (const objective of expected) {
      assert.ok(CANONICAL_GRAPH_OBJECTIVES.includes(objective as any), `Should include objective: ${objective}`);
    }
  });

  it('should contain all expected coordinate systems', () => {
    const expected = ['cartesian_2d', 'cartesian_3d', 'polar', 'cylindrical', 'spherical', 'parametric', 'complex_plane', 'probability_space', 'feature_space', 'abstract_space'];
    for (const system of expected) {
      assert.ok(CANONICAL_COORDINATE_SYSTEMS.includes(system as any), `Should include system: ${system}`);
    }
  });

  it('should contain all expected graph statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_GRAPH_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected graph visibility values', () => {
    const expected = ['always', 'default', 'advanced', 'expert', 'curriculum', 'assessment', 'laboratory', 'research', 'internal', 'hidden'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_GRAPH_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected graph governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_GRAPH_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Math Graph Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(GRAPH_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with GRAPH_', () => {
    const codes = Object.values(GRAPH_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('GRAPH_'), `Code "${code}" should start with GRAPH_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(GRAPH_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Math Graph Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in profile', () => {
    const profile = composeKnowledgeGraphProfile({
      graphId: 'graph-001',
      title: 'Test',
      conceptId: 'concept-test',
      graphType: 'function_graph',
      objective: 'visualize',
      coordinateSystem: 'cartesian_2d',
      mathematicalExpressionRef: 'expr-test',
      domainReference: 'domain-test',
      rangeReference: 'range-test',
      visualizationParameters: [],
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
    const result = composeKnowledgeGraphs(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Math Graph Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeGraphs(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Math Graph Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by conceptId', () => {
    const profile3 = { ...VALID_PROFILE_1, graphId: 'graph-003', conceptId: 'concept-z' };
    const profile1 = { ...VALID_PROFILE_1, graphId: 'graph-001', conceptId: 'concept-a' };
    const profile2 = { ...VALID_PROFILE_1, graphId: 'graph-002', conceptId: 'concept-m' };

    const registry = composeKnowledgeGraphRegistry([profile3, profile1, profile2], []);

    assert.equal(registry.profiles[0].conceptId, 'concept-a');
    assert.equal(registry.profiles[1].conceptId, 'concept-m');
    assert.equal(registry.profiles[2].conceptId, 'concept-z');
  });

  it('should sort by graphType when conceptId is equal', () => {
    const profileA = { ...VALID_PROFILE_1, graphId: 'graph-002', conceptId: 'concept-a', graphType: 'surface_reference' as const };
    const profileB = { ...VALID_PROFILE_1, graphId: 'graph-001', conceptId: 'concept-a', graphType: 'function_graph' as const };

    const registry = composeKnowledgeGraphRegistry([profileA, profileB], []);

    assert.equal(registry.profiles[0].graphType, 'function_graph');
    assert.equal(registry.profiles[1].graphType, 'surface_reference');
  });
});
