/**
 * D10-OPT-03 — Concept Structure, Canonical Components Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Concept Kernel.
 * Covers: composition, validation, helpers, determinism, immutability,
 * runtime restrictions, cross-agent boundary, and public API.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeComponent,
  KnowledgeConceptProvenance,
  KnowledgeComponentRelationship,
  KnowledgeComponentInput,
  KnowledgeComponentRegistry,
  KnowledgeConceptTrace,
  KnowledgeArtifactWithComponents,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_COMPONENT_TYPES,
  CANONICAL_COMPONENT_PRIORITY,
  CANONICAL_COMPONENT_STATUS,
  CANONICAL_COMPONENT_VISIBILITY,
  CANONICAL_COMPONENT_ROLE,
  CANONICAL_COMPONENT_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeConceptProvenance,
  composeKnowledgeComponent,
  composeKnowledgeComponentRelationship,
  composeKnowledgeConceptTrace,
  composeKnowledgeComponentRegistry,
  composeKnowledgeComponentRegistryFromInput,
  composeKnowledgeComponents,
  composeKnowledgeArtifactWithComponents,
  isSupportedComponentType,
  isSupportedComponentPriority,
  isSupportedComponentRole,
  isSupportedComponentVisibility,
  isSupportedComponentStatus,
  isSupportedComponentGovernance,
  getCanonicalComponentTypes,
  getCanonicalComponentPriorities,
  getCanonicalComponentRoles,
  getCanonicalComponentVisibility,
  getCanonicalComponentStatuses,
} from './KnowledgeConceptKernel.ts';

import {
  validateKnowledgeComponent,
  validateKnowledgeComponentRelationship,
  validateKnowledgeComponentRegistry,
  validateKnowledgeComponentInput,
  validateKnowledgeComponentTrace,
  validateKnowledgeArtifactWithComponents,
  COMPONENT_VALIDATION_CODES,
} from './KnowledgeConceptValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: KnowledgeConceptProvenance = {
  source: 'NeuralVerse Team',
  provider: 'Concept Agent',
  rationale: 'Core component for neural network concept.',
  governance: 'canonical',
};

const VALID_COMPONENT_1: KnowledgeComponent = {
  componentId: 'comp-001',
  conceptId: 'concept-001',
  title: 'Neural Networks — Definition',
  componentType: 'definition',
  priority: 'critical',
  role: 'core',
  visibility: 'always',
  status: 'canonical',
  governance: 'canonical',
  tags: ['neural_networks', 'definition'],
  orderIndex: 1,
  references: [],
  provenance: VALID_PROVENANCE,
};

const VALID_COMPONENT_2: KnowledgeComponent = {
  componentId: 'comp-002',
  conceptId: 'concept-001',
  title: 'Neural Networks — Intuition',
  componentType: 'intuition',
  priority: 'high',
  role: 'supporting',
  visibility: 'default',
  status: 'approved',
  governance: 'accepted',
  tags: ['neural_networks', 'intuition'],
  orderIndex: 2,
  references: ['comp-001'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_COMPONENT_3: KnowledgeComponent = {
  componentId: 'comp-003',
  conceptId: 'concept-002',
  title: 'Linear Algebra — Mathematical Foundation',
  componentType: 'mathematical_foundation',
  priority: 'critical',
  role: 'core',
  visibility: 'always',
  status: 'canonical',
  governance: 'canonical',
  tags: ['linear_algebra', 'mathematics'],
  orderIndex: 1,
  references: [],
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: KnowledgeComponentRelationship = {
  relationshipId: 'rel-001',
  sourceComponentId: 'comp-001',
  targetComponentId: 'comp-002',
  conceptId: 'concept-001',
  relationshipType: 'extension',
  description: 'Intuition extends the definition.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: KnowledgeComponentInput = {
  components: [VALID_COMPONENT_1, VALID_COMPONENT_2, VALID_COMPONENT_3],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: KnowledgeComponentInput = {
  components: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Concept Kernel — Composition', () => {
  it('should compose valid concept provenance', () => {
    const provenance = composeKnowledgeConceptProvenance({
      source: 'NeuralVerse Team',
      provider: 'Concept Agent',
      rationale: 'Core component.',
      governance: 'canonical',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.provider, 'Concept Agent');
    assert.equal(provenance.rationale, 'Core component.');
    assert.equal(provenance.governance, 'canonical');
  });

  it('should compose valid component', () => {
    const component = composeKnowledgeComponent({
      componentId: 'comp-001',
      conceptId: 'concept-001',
      title: 'Test Component',
      componentType: 'definition',
      priority: 'critical',
      role: 'core',
      visibility: 'always',
      status: 'canonical',
      governance: 'canonical',
      tags: ['tag1'],
      orderIndex: 1,
      references: [],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(component.componentId, 'comp-001');
    assert.equal(component.conceptId, 'concept-001');
    assert.equal(component.componentType, 'definition');
    assert.equal(component.tags.length, 1);
    assert.equal(component.orderIndex, 1);
  });

  it('should compose valid component relationship', () => {
    const relationship = composeKnowledgeComponentRelationship({
      relationshipId: 'rel-001',
      sourceComponentId: 'comp-001',
      targetComponentId: 'comp-002',
      conceptId: 'concept-001',
      relationshipType: 'extension',
      description: 'Test relationship.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceComponentId, 'comp-001');
    assert.equal(relationship.targetComponentId, 'comp-002');
    assert.equal(relationship.relationshipType, 'extension');
  });

  it('should compose valid concept trace', () => {
    const trace = composeKnowledgeConceptTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', componentId: 'comp-001', conceptId: 'concept-001', validationPassed: true, validationErrors: [] },
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

  it('should compose valid component registry', () => {
    const registry = composeKnowledgeComponentRegistry([VALID_COMPONENT_1, VALID_COMPONENT_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.components.length, 2);
    assert.equal(registry.relationships.length, 1);
  });

  it('should compose registry from input', () => {
    const registry = composeKnowledgeComponentRegistryFromInput(VALID_INPUT);
    assert.equal(registry.components.length, 3);
  });

  it('should compose knowledge components from input', () => {
    const registry = composeKnowledgeComponents(VALID_INPUT);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.trace.decisionCount, 3);
  });

  it('should compose artifact with components', () => {
    const artifact = composeKnowledgeArtifactWithComponents({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      components: [VALID_COMPONENT_1, VALID_COMPONENT_2],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.conceptId, 'concept-001');
    assert.equal(artifact.conceptTitle, 'Neural Networks');
    assert.equal(artifact.components.length, 2);
    assert.equal(artifact.relationships.length, 1);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Concept Kernel — Validation', () => {
  it('should validate a valid component with no errors', () => {
    const errors = validateKnowledgeComponent(VALID_COMPONENT_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeComponentRegistry([VALID_COMPONENT_1, VALID_COMPONENT_2], [VALID_RELATIONSHIP]);
    const result = validateKnowledgeComponentRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate knowledge component input', () => {
    const result = validateKnowledgeComponentInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeKnowledgeComponentRegistry([VALID_COMPONENT_1, VALID_COMPONENT_1], []);
    const result = validateKnowledgeComponentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_DUPLICATE_ID,
    );
    assert.ok(duplicateError, 'Should have COMPONENT_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const comp1 = { ...VALID_COMPONENT_1, componentId: 'comp-001', title: 'Same Title' };
    const comp2 = { ...VALID_COMPONENT_1, componentId: 'comp-002', title: 'Same Title' };
    const registry = composeKnowledgeComponentRegistry([comp1, comp2], []);
    const result = validateKnowledgeComponentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_DUPLICATE_TITLE,
    );
    assert.ok(duplicateError, 'Should have COMPONENT_DUPLICATE_TITLE error');
  });

  it('should detect invalid type', () => {
    const component = { ...VALID_COMPONENT_1, componentType: 'unsupported' as any };
    const errors = validateKnowledgeComponent(component);
    const typeError = errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_TYPE,
    );
    assert.ok(typeError, 'Should have COMPONENT_INVALID_TYPE error');
  });

  it('should detect invalid priority', () => {
    const component = { ...VALID_COMPONENT_1, priority: 'unsupported' as any };
    const errors = validateKnowledgeComponent(component);
    const priorityError = errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_PRIORITY,
    );
    assert.ok(priorityError, 'Should have COMPONENT_INVALID_PRIORITY error');
  });

  it('should detect invalid role', () => {
    const component = { ...VALID_COMPONENT_1, role: 'unsupported' as any };
    const errors = validateKnowledgeComponent(component);
    const roleError = errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_ROLE,
    );
    assert.ok(roleError, 'Should have COMPONENT_INVALID_ROLE error');
  });

  it('should detect invalid visibility', () => {
    const component = { ...VALID_COMPONENT_1, visibility: 'unsupported' as any };
    const errors = validateKnowledgeComponent(component);
    const visibilityError = errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_VISIBILITY,
    );
    assert.ok(visibilityError, 'Should have COMPONENT_INVALID_VISIBILITY error');
  });

  it('should detect invalid status', () => {
    const component = { ...VALID_COMPONENT_1, status: 'unsupported' as any };
    const errors = validateKnowledgeComponent(component);
    const statusError = errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_STATUS,
    );
    assert.ok(statusError, 'Should have COMPONENT_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const component = { ...VALID_COMPONENT_1, governance: 'unsupported' as any };
    const errors = validateKnowledgeComponent(component);
    const governanceError = errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have COMPONENT_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const component = { ...VALID_COMPONENT_1, provenance: undefined as any };
    const errors = validateKnowledgeComponent(component);
    const provenanceError = errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_PROVENANCE,
    );
    assert.ok(provenanceError, 'Should have COMPONENT_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const component = { ...VALID_COMPONENT_1, provenance: { ...VALID_PROVENANCE, provider: '' } };
    const errors = validateKnowledgeComponent(component);
    const providerError = errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_PROVIDER,
    );
    assert.ok(providerError, 'Should have COMPONENT_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const component = { ...VALID_COMPONENT_1, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeComponent(component);
    const rationaleError = errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have COMPONENT_MISSING_RATIONALE error');
  });

  it('should detect self relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, targetComponentId: 'comp-001' };
    const knownComponentIds = new Set(['comp-001', 'comp-002']);
    const errors = validateKnowledgeComponentRelationship(relationship, knownComponentIds);
    const selfError = errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_SELF_RELATIONSHIP,
    );
    assert.ok(selfError, 'Should have COMPONENT_SELF_RELATIONSHIP error');
  });

  it('should detect empty registry', () => {
    const registry = composeKnowledgeComponentRegistry([], []);
    const result = validateKnowledgeComponentRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have COMPONENT_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeConceptTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_concept_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeComponentTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency', () => {
    const registry: KnowledgeComponentRegistry = {
      registryId: '_registry_5',
      components: [VALID_COMPONENT_1],
      relationships: [],
      metadata: {
        registryId: '_registry_5',
        componentCount: 5,
        relationshipCount: 0,
        conceptCount: 1,
        componentTypeCount: 1,
      },
      trace: {
        traceId: '_trace_1',
        decisionCount: 0,
        validationCount: 0,
        registryVersion: '1.0.0',
        compositionVersion: '1.0.0',
        decisions: [],
        deterministic: true,
        generatedFrom: 'deterministic_concept_kernel',
        randomUsed: false,
        timeDependency: false,
      },
      deterministic: true,
      generatedFrom: 'deterministic_concept_kernel',
      randomUsed: false,
      timeDependency: false,
    };
    const result = validateKnowledgeComponentRegistry(registry);
    const inconsistencyError = result.errors.find(
      (e) => e.code === COMPONENT_VALIDATION_CODES.COMPONENT_REGISTRY_INCONSISTENCY,
    );
    assert.ok(inconsistencyError, 'Should have COMPONENT_REGISTRY_INCONSISTENCY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeConceptTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });
    const result = validateKnowledgeComponentTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate artifact with components', () => {
    const artifact = composeKnowledgeArtifactWithComponents({
      conceptId: 'concept-001',
      conceptTitle: 'Neural Networks',
      components: [VALID_COMPONENT_1, VALID_COMPONENT_2],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });
    const result = validateKnowledgeArtifactWithComponents(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Concept Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeComponents>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeComponents(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].components, results[i].components);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeComponentRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeComponentRegistry([VALID_COMPONENT_1, VALID_COMPONENT_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].components, results[i].components);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });

  it('should produce identical provenance for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeConceptProvenance>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeConceptProvenance({
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
    const results: ReturnType<typeof composeKnowledgeConceptTrace>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeConceptTrace({
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

describe('Concept Kernel — Immutability', () => {
  it('should not mutate input components', () => {
    const originalId = VALID_COMPONENT_1.componentId;
    const originalTitle = VALID_COMPONENT_1.title;

    composeKnowledgeComponents(VALID_INPUT);

    assert.equal(VALID_COMPONENT_1.componentId, originalId);
    assert.equal(VALID_COMPONENT_1.title, originalTitle);
  });

  it('should not mutate input registry components', () => {
    const components = [VALID_COMPONENT_1, VALID_COMPONENT_2];
    const originalIds = components.map((c) => c.componentId);

    composeKnowledgeComponentRegistry(components, []);

    assert.equal(components[0].componentId, originalIds[0]);
    assert.equal(components[1].componentId, originalIds[1]);
  });

  it('should use defensive copies for tags', () => {
    const originalTags = ['tag1', 'tag2'];
    const component = composeKnowledgeComponent({
      componentId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      componentType: 'definition',
      priority: 'critical',
      role: 'core',
      visibility: 'always',
      status: 'draft',
      governance: 'public',
      tags: originalTags,
      orderIndex: 1,
      references: [],
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(component.tags, originalTags);
    assert.deepStrictEqual([...component.tags], originalTags);
  });

  it('should use defensive copies for references', () => {
    const originalReferences = ['ref-001', 'ref-002'];
    const component = composeKnowledgeComponent({
      componentId: 'test',
      conceptId: 'concept-001',
      title: 'Test.',
      componentType: 'definition',
      priority: 'critical',
      role: 'core',
      visibility: 'always',
      status: 'draft',
      governance: 'public',
      tags: [],
      orderIndex: 1,
      references: originalReferences,
      provenance: VALID_PROVENANCE,
    });

    assert.notEqual(component.references, originalReferences);
    assert.deepStrictEqual([...component.references], originalReferences);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Concept Kernel — Helpers', () => {
  it('should return canonical component types', () => {
    const types = getCanonicalComponentTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_COMPONENT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical component priorities', () => {
    const priorities = getCanonicalComponentPriorities();
    assert.deepStrictEqual([...priorities], [...CANONICAL_COMPONENT_PRIORITY]);
    assert.equal(priorities.length, 10);
  });

  it('should return canonical component roles', () => {
    const roles = getCanonicalComponentRoles();
    assert.deepStrictEqual([...roles], [...CANONICAL_COMPONENT_ROLE]);
    assert.equal(roles.length, 10);
  });

  it('should return canonical component visibility', () => {
    const visibility = getCanonicalComponentVisibility();
    assert.deepStrictEqual([...visibility], [...CANONICAL_COMPONENT_VISIBILITY]);
    assert.equal(visibility.length, 10);
  });

  it('should return canonical component statuses', () => {
    const statuses = getCanonicalComponentStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_COMPONENT_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate component type support', () => {
    assert.equal(isSupportedComponentType('definition'), true);
    assert.equal(isSupportedComponentType('algorithm'), true);
    assert.equal(isSupportedComponentType('unsupported'), false);
  });

  it('should validate component priority support', () => {
    assert.equal(isSupportedComponentPriority('critical'), true);
    assert.equal(isSupportedComponentPriority('high'), true);
    assert.equal(isSupportedComponentPriority('unsupported'), false);
  });

  it('should validate component role support', () => {
    assert.equal(isSupportedComponentRole('core'), true);
    assert.equal(isSupportedComponentRole('supporting'), true);
    assert.equal(isSupportedComponentRole('unsupported'), false);
  });

  it('should validate component visibility support', () => {
    assert.equal(isSupportedComponentVisibility('always'), true);
    assert.equal(isSupportedComponentVisibility('default'), true);
    assert.equal(isSupportedComponentVisibility('unsupported'), false);
  });

  it('should validate component status support', () => {
    assert.equal(isSupportedComponentStatus('draft'), true);
    assert.equal(isSupportedComponentStatus('canonical'), true);
    assert.equal(isSupportedComponentStatus('unsupported'), false);
  });

  it('should validate component governance support', () => {
    assert.equal(isSupportedComponentGovernance('canonical'), true);
    assert.equal(isSupportedComponentGovernance('accepted'), true);
    assert.equal(isSupportedComponentGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Concept Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 component types', () => {
    assert.equal(CANONICAL_COMPONENT_TYPES.length, 10);
  });

  it('should have exactly 10 component priorities', () => {
    assert.equal(CANONICAL_COMPONENT_PRIORITY.length, 10);
  });

  it('should have exactly 6 component statuses', () => {
    assert.equal(CANONICAL_COMPONENT_STATUS.length, 6);
  });

  it('should have exactly 10 component visibility values', () => {
    assert.equal(CANONICAL_COMPONENT_VISIBILITY.length, 10);
  });

  it('should have exactly 10 component roles', () => {
    assert.equal(CANONICAL_COMPONENT_ROLE.length, 10);
  });

  it('should have exactly 10 component governance values', () => {
    assert.equal(CANONICAL_COMPONENT_GOVERNANCE.length, 10);
  });

  it('should contain all expected component types', () => {
    const expected = ['definition', 'intuition', 'motivation', 'mathematical_foundation', 'algorithm', 'implementation', 'example', 'counterexample', 'limitation', 'application'];
    for (const type of expected) {
      assert.ok(CANONICAL_COMPONENT_TYPES.includes(type as any), `Should include type: ${type}`);
    }
  });

  it('should contain all expected component priorities', () => {
    const expected = ['critical', 'high', 'recommended', 'optional', 'supplementary', 'historical', 'advanced', 'reference', 'experimental', 'deprecated'];
    for (const priority of expected) {
      assert.ok(CANONICAL_COMPONENT_PRIORITY.includes(priority as any), `Should include priority: ${priority}`);
    }
  });

  it('should contain all expected component statuses', () => {
    const expected = ['draft', 'review', 'approved', 'canonical', 'deprecated', 'archived'];
    for (const status of expected) {
      assert.ok(CANONICAL_COMPONENT_STATUS.includes(status as any), `Should include status: ${status}`);
    }
  });

  it('should contain all expected component visibility values', () => {
    const expected = ['always', 'default', 'advanced_only', 'expert_only', 'hidden', 'internal', 'curriculum', 'assessment', 'laboratory', 'research'];
    for (const visibility of expected) {
      assert.ok(CANONICAL_COMPONENT_VISIBILITY.includes(visibility as any), `Should include visibility: ${visibility}`);
    }
  });

  it('should contain all expected component roles', () => {
    const expected = ['core', 'supporting', 'optional', 'cross_reference', 'warning', 'best_practice', 'engineering_note', 'historical_note', 'research_note', 'future_direction'];
    for (const role of expected) {
      assert.ok(CANONICAL_COMPONENT_ROLE.includes(role as any), `Should include role: ${role}`);
    }
  });

  it('should contain all expected component governance values', () => {
    const expected = ['canonical', 'accepted', 'provisional', 'experimental', 'deprecated', 'restricted', 'internal', 'public', 'community', 'archived'];
    for (const governance of expected) {
      assert.ok(CANONICAL_COMPONENT_GOVERNANCE.includes(governance as any), `Should include governance: ${governance}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Validation Code Count Test
// ---------------------------------------------------------------------------

describe('Concept Kernel — Validation Code Count', () => {
  it('should have exactly 20 validation codes', () => {
    const codes = Object.values(COMPONENT_VALIDATION_CODES);
    assert.equal(codes.length, 20);
  });

  it('should have all codes prefixed with COMPONENT_', () => {
    const codes = Object.values(COMPONENT_VALIDATION_CODES);
    for (const code of codes) {
      assert.ok(code.startsWith('COMPONENT_'), `Code "${code}" should start with COMPONENT_`);
    }
  });

  it('should have unique codes', () => {
    const codes = Object.values(COMPONENT_VALIDATION_CODES);
    const unique = new Set(codes);
    assert.equal(codes.length, unique.size, 'All codes should be unique');
  });
});

// ---------------------------------------------------------------------------
// Runtime Restrictions Tests
// ---------------------------------------------------------------------------

describe('Concept Kernel — Runtime Restrictions', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not have executable callbacks in component', () => {
    const component = composeKnowledgeComponent({
      componentId: 'comp-001',
      conceptId: 'concept-001',
      title: 'Test',
      componentType: 'definition',
      priority: 'critical',
      role: 'core',
      visibility: 'always',
      status: 'draft',
      governance: 'public',
      tags: [],
      orderIndex: 1,
      references: [],
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(component);
    for (const key of keys) {
      const value = (component as any)[key];
      assert.ok(typeof value !== 'function', `Component field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have async behavior markers', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    assert.ok(!('promise' in result), 'Should not have promise');
    assert.ok(!('async' in result), 'Should not have async');
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Tests
// ---------------------------------------------------------------------------

describe('Concept Kernel — Cross-Agent Boundary', () => {
  it('should not reference Didactic Agent', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Didactic Agent'), 'Should not reference Didactic Agent');
  });

  it('should not reference Curriculum Agent', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curriculum Agent'), 'Should not reference Curriculum Agent');
  });

  it('should not reference Narrative Agent', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Narrative Agent'), 'Should not reference Narrative Agent');
  });

  it('should not reference Assessment Agent', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Assessment Agent'), 'Should not reference Assessment Agent');
  });

  it('should not reference Curiosity Agent', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Curiosity Agent'), 'Should not reference Curiosity Agent');
  });

  it('should not reference Research Agent', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Research Agent'), 'Should not reference Research Agent');
  });

  it('should not reference Laboratory Agent', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Laboratory Agent'), 'Should not reference Laboratory Agent');
  });

  it('should not reference Application Agent', () => {
    const result = composeKnowledgeComponents(VALID_INPUT);
    const str = JSON.stringify(result);
    assert.ok(!str.includes('Application Agent'), 'Should not reference Application Agent');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Sorting Tests
// ---------------------------------------------------------------------------

describe('Concept Kernel — Deterministic Sorting', () => {
  it('should sort deterministically by conceptId', () => {
    const comp3 = { ...VALID_COMPONENT_1, componentId: 'comp-003', conceptId: 'concept-003' };
    const comp1 = { ...VALID_COMPONENT_1, componentId: 'comp-001', conceptId: 'concept-001' };
    const comp2 = { ...VALID_COMPONENT_1, componentId: 'comp-002', conceptId: 'concept-002' };

    const registry = composeKnowledgeComponentRegistry([comp3, comp1, comp2], []);

    assert.equal(registry.components[0].conceptId, 'concept-001');
    assert.equal(registry.components[1].conceptId, 'concept-002');
    assert.equal(registry.components[2].conceptId, 'concept-003');
  });

  it('should sort by orderIndex when conceptId is equal', () => {
    const compA = { ...VALID_COMPONENT_1, componentId: 'comp-002', conceptId: 'concept-001', orderIndex: 2 };
    const compB = { ...VALID_COMPONENT_1, componentId: 'comp-001', conceptId: 'concept-001', orderIndex: 1 };

    const registry = composeKnowledgeComponentRegistry([compA, compB], []);

    assert.equal(registry.components[0].orderIndex, 1);
    assert.equal(registry.components[1].orderIndex, 2);
  });
});
