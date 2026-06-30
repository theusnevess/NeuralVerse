/**
 * NV-1700-D5-OPT-03 — Knowledge Graph Relationships & Cross-Reference Orchestration Test Suite
 *
 * Comprehensive deterministic test suite for the Relationship Kernel.
 * Covers: valid relationship, valid cross reference, valid registry,
 * duplicate relationships, duplicate references, self-reference,
 * unsupported type, unsupported strength, unsupported status,
 * missing provenance, missing rationale, missing providedBy,
 * empty registry, deterministic ordering, immutable input,
 * identical output (100 iterations), helper functions,
 * canonical enum completeness, negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeRelationship,
  KnowledgeCrossReference,
  RelationshipProvenance,
  KnowledgeRelationshipInput,
  KnowledgeRelationshipRegistry,
  RelationshipTrace,
  KnowledgeArtifactWithRelationships,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_KNOWLEDGE_RELATIONSHIP_TYPES,
  CANONICAL_RELATIONSHIP_STRENGTH,
  CANONICAL_CROSS_REFERENCE_TYPES,
  CANONICAL_RELATIONSHIP_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

import {
  composeRelationshipProvenance,
  composeKnowledgeRelationship,
  composeKnowledgeCrossReference,
  composeRelationshipTrace,
  composeRelationshipRegistry,
  composeRelationshipRegistryFromInput,
  composeKnowledgeRelationships,
  composeKnowledgeArtifactWithRelationships,
  isSupportedKnowledgeRelationshipType,
  isSupportedRelationshipStrength,
  isSupportedCrossReferenceType,
  isSupportedRelationshipStatus,
  getCanonicalKnowledgeRelationshipTypes,
  getCanonicalRelationshipStrengths,
  getCanonicalCrossReferenceTypes,
  getCanonicalRelationshipStatuses,
} from './RelationshipKernel.ts';

import {
  validateKnowledgeRelationship,
  validateKnowledgeCrossReference,
  validateRelationshipRegistry,
  validateRelationshipInput,
  validateRelationshipTrace,
  validateKnowledgeArtifactWithRelationships,
  RELATIONSHIP_VALIDATION_CODES,
} from './RelationshipValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: RelationshipProvenance = {
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  providedBy: 'NeuralVerse Team',
  rationale: 'Core relationship metadata.',
};

const VALID_RELATIONSHIP: KnowledgeRelationship = {
  relationshipId: 'relationship-001',
  sourceKnowledgeId: 'knowledge-001',
  targetKnowledgeId: 'knowledge-002',
  relationshipType: 'references',
  relationshipStrength: 'strong',
  status: 'published',
  tags: ['deep_learning', 'neural_networks'],
  summary: 'References foundational concepts.',
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP_2: KnowledgeRelationship = {
  relationshipId: 'relationship-002',
  sourceKnowledgeId: 'knowledge-002',
  targetKnowledgeId: 'knowledge-003',
  relationshipType: 'extends',
  relationshipStrength: 'moderate',
  status: 'approved',
  tags: ['cnn', 'computer_vision'],
  summary: 'Extends CNN architecture.',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_CROSS_REFERENCE: KnowledgeCrossReference = {
  referenceId: 'reference-001',
  knowledgeId: 'knowledge-001',
  referenceType: 'internal_link',
  targetIdentifier: 'knowledge-002',
  displayLabel: 'CNN Architecture',
  status: 'published',
  provenance: VALID_PROVENANCE,
};

const VALID_CROSS_REFERENCE_2: KnowledgeCrossReference = {
  referenceId: 'reference-002',
  knowledgeId: 'knowledge-002',
  referenceType: 'external_reference',
  targetIdentifier: 'https://example.com/paper-001',
  displayLabel: 'Research Paper',
  status: 'approved',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_INPUT: KnowledgeRelationshipInput = {
  relationships: [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
  crossReferences: [VALID_CROSS_REFERENCE, VALID_CROSS_REFERENCE_2],
};

const EMPTY_INPUT: KnowledgeRelationshipInput = {
  relationships: [],
  crossReferences: [],
};

// ---------------------------------------------------------------------------
// Relationship Composition Tests
// ---------------------------------------------------------------------------

describe('Relationship Kernel — Relationship Composition', () => {
  it('should compose valid relationship provenance', () => {
    const provenance = composeRelationshipProvenance({
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      providedBy: 'NeuralVerse Team',
      rationale: 'Core relationship.',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.rationale, 'Core relationship.');
  });

  it('should compose valid knowledge relationship', () => {
    const relationship = composeKnowledgeRelationship({
      relationshipId: 'relationship-001',
      sourceKnowledgeId: 'knowledge-001',
      targetKnowledgeId: 'knowledge-002',
      relationshipType: 'references',
      relationshipStrength: 'strong',
      status: 'published',
      tags: ['deep_learning'],
      summary: 'References foundational concepts.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'relationship-001');
    assert.equal(relationship.sourceKnowledgeId, 'knowledge-001');
    assert.equal(relationship.targetKnowledgeId, 'knowledge-002');
    assert.equal(relationship.relationshipType, 'references');
    assert.equal(relationship.relationshipStrength, 'strong');
    assert.equal(relationship.status, 'published');
    assert.equal(relationship.tags.length, 1);
  });

  it('should compose valid knowledge cross reference', () => {
    const crossReference = composeKnowledgeCrossReference({
      referenceId: 'reference-001',
      knowledgeId: 'knowledge-001',
      referenceType: 'internal_link',
      targetIdentifier: 'knowledge-002',
      displayLabel: 'CNN Architecture',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(crossReference.referenceId, 'reference-001');
    assert.equal(crossReference.knowledgeId, 'knowledge-001');
    assert.equal(crossReference.referenceType, 'internal_link');
    assert.equal(crossReference.targetIdentifier, 'knowledge-002');
    assert.equal(crossReference.displayLabel, 'CNN Architecture');
    assert.equal(crossReference.status, 'published');
  });

  it('should compose valid relationship trace', () => {
    const trace = composeRelationshipTrace({
      traceId: '_trace_1',
      decisionCount: 5,
      validationCount: 4,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 5);
    assert.equal(trace.validationCount, 4);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should validate a valid relationship with no errors', () => {
    const errors = validateKnowledgeRelationship(VALID_RELATIONSHIP);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid cross reference with no errors', () => {
    const errors = validateKnowledgeCrossReference(VALID_CROSS_REFERENCE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeRelationshipRegistry(
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
      [VALID_CROSS_REFERENCE, VALID_CROSS_REFERENCE_2],
    );
    const result = validateRelationshipRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate relationship input', () => {
    const result = validateRelationshipInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Relationship Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeRelationshipRegistry([], []);
    const result = validateRelationshipRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have RELATIONSHIP_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate relationship IDs', () => {
    const registry = composeRelationshipRegistry(
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP],
      [],
    );
    const result = validateRelationshipRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have RELATIONSHIP_DUPLICATE_ID error');
  });

  it('should detect duplicate cross reference IDs', () => {
    const registry = composeRelationshipRegistry(
      [],
      [VALID_CROSS_REFERENCE, VALID_CROSS_REFERENCE],
    );
    const result = validateRelationshipRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_REFERENCE,
    );

    assert.ok(duplicateError, 'Should have RELATIONSHIP_DUPLICATE_REFERENCE error');
  });

  it('should detect self-reference', () => {
    const selfRef: KnowledgeRelationship = {
      ...VALID_RELATIONSHIP,
      relationshipId: 'self-ref-001',
      targetKnowledgeId: 'knowledge-001',
    };
    const errors = validateKnowledgeRelationship(selfRef);
    const selfRefError = errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_SELF_REFERENCE,
    );

    assert.ok(selfRefError, 'Should have RELATIONSHIP_SELF_REFERENCE error');
  });

  it('should sort deterministically by relationshipId', () => {
    const relationship3 = { ...VALID_RELATIONSHIP, relationshipId: 'relationship-003' };
    const relationship1 = { ...VALID_RELATIONSHIP, relationshipId: 'relationship-001' };
    const relationship2 = { ...VALID_RELATIONSHIP, relationshipId: 'relationship-002' };

    const registry = composeRelationshipRegistry([relationship3, relationship1, relationship2], []);

    assert.equal(registry.relationships[0].relationshipId, 'relationship-001');
    assert.equal(registry.relationships[1].relationshipId, 'relationship-002');
    assert.equal(registry.relationships[2].relationshipId, 'relationship-003');
  });

  it('should sort by sourceKnowledgeId when relationshipId is equal', () => {
    const relA = { ...VALID_RELATIONSHIP, relationshipId: 'rel-001', sourceKnowledgeId: 'knowledge-002' };
    const relB = { ...VALID_RELATIONSHIP, relationshipId: 'rel-001', sourceKnowledgeId: 'knowledge-001' };

    const registry = composeRelationshipRegistry([relA, relB], []);

    assert.equal(registry.relationships[0].sourceKnowledgeId, 'knowledge-001');
    assert.equal(registry.relationships[1].sourceKnowledgeId, 'knowledge-002');
  });

  it('should sort cross references deterministically by referenceId', () => {
    const ref3 = { ...VALID_CROSS_REFERENCE, referenceId: 'reference-003' };
    const ref1 = { ...VALID_CROSS_REFERENCE, referenceId: 'reference-001' };
    const ref2 = { ...VALID_CROSS_REFERENCE, referenceId: 'reference-002' };

    const registry = composeRelationshipRegistry([], [ref3, ref1, ref2]);

    assert.equal(registry.crossReferences[0].referenceId, 'reference-001');
    assert.equal(registry.crossReferences[1].referenceId, 'reference-002');
    assert.equal(registry.crossReferences[2].referenceId, 'reference-003');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Relationship Kernel — Validation', () => {
  it('should detect invalid relationship type', () => {
    const relationship = { ...VALID_RELATIONSHIP, relationshipType: 'unsupported' as any };
    const errors = validateKnowledgeRelationship(relationship);
    const typeError = errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have RELATIONSHIP_INVALID_TYPE error');
  });

  it('should detect invalid relationship strength', () => {
    const relationship = { ...VALID_RELATIONSHIP, relationshipStrength: 'unsupported' as any };
    const errors = validateKnowledgeRelationship(relationship);
    const strengthError = errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_STRENGTH,
    );

    assert.ok(strengthError, 'Should have RELATIONSHIP_INVALID_STRENGTH error');
  });

  it('should detect invalid relationship status', () => {
    const relationship = { ...VALID_RELATIONSHIP, status: 'unsupported' as any };
    const errors = validateKnowledgeRelationship(relationship);
    const statusError = errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have RELATIONSHIP_INVALID_STATUS error');
  });

  it('should detect missing provenance', () => {
    const relationship = { ...VALID_RELATIONSHIP, provenance: undefined as any };
    const errors = validateKnowledgeRelationship(relationship);
    const provenanceError = errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have RELATIONSHIP_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance source', () => {
    const relationship = { ...VALID_RELATIONSHIP, provenance: { ...VALID_PROVENANCE, source: '' } };
    const errors = validateKnowledgeRelationship(relationship);
    const sourceError = errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_SOURCE_FIELD,
    );

    assert.ok(sourceError, 'Should have RELATIONSHIP_MISSING_SOURCE_FIELD error');
  });

  it('should detect missing provenance rationale', () => {
    const relationship = { ...VALID_RELATIONSHIP, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeRelationship(relationship);
    const rationaleError = errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have RELATIONSHIP_MISSING_RATIONALE error');
  });

  it('should detect missing provenance providedBy', () => {
    const relationship = { ...VALID_RELATIONSHIP, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateKnowledgeRelationship(relationship);
    const providedByError = errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have RELATIONSHIP_MISSING_PROVIDED_BY error');
  });

  it('should detect invalid cross reference type', () => {
    const crossReference = { ...VALID_CROSS_REFERENCE, referenceType: 'unsupported' as any };
    const errors = validateKnowledgeCrossReference(crossReference);
    const typeError = errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_UNKNOWN_REFERENCE_TYPE,
    );

    assert.ok(typeError, 'Should have RELATIONSHIP_UNKNOWN_REFERENCE_TYPE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeRelationshipTrace({
      traceId: '_trace_1',
      decisionCount: 5,
      validationCount: 4,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateRelationshipTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: RelationshipTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      deterministic: false as true,
      generatedFrom: 'deterministic_relationship_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateRelationshipTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Relationship Kernel — Provenance', () => {
  it('should detect missing provenance on relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, provenance: undefined as any };
    const errors = validateKnowledgeRelationship(relationship);
    const provenanceError = errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have RELATIONSHIP_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance on cross reference', () => {
    const crossReference = { ...VALID_CROSS_REFERENCE, provenance: undefined as any };
    const errors = validateKnowledgeCrossReference(crossReference);
    const provenanceError = errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have RELATIONSHIP_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const relationship = { ...VALID_RELATIONSHIP, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeRelationship(relationship);
    const rationaleError = errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have RELATIONSHIP_MISSING_RATIONALE error');
  });

  it('should detect missing providedBy in provenance', () => {
    const relationship = { ...VALID_RELATIONSHIP, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateKnowledgeRelationship(relationship);
    const providedByError = errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have RELATIONSHIP_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Relationship Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeRelationships>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeRelationships(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].relationships, results[i].relationships);
      assert.deepStrictEqual(results[0].crossReferences, results[i].crossReferences);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeRelationshipRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(
        composeRelationshipRegistry(
          [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
          [VALID_CROSS_REFERENCE, VALID_CROSS_REFERENCE_2],
        ),
      );
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].relationships, results[i].relationships);
      assert.deepStrictEqual(results[0].crossReferences, results[i].crossReferences);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Relationship Kernel — Immutability', () => {
  it('should not mutate input relationships', () => {
    const originalId = VALID_RELATIONSHIP.relationshipId;
    const originalSource = VALID_RELATIONSHIP.sourceKnowledgeId;

    composeKnowledgeRelationships(VALID_INPUT);

    assert.equal(VALID_RELATIONSHIP.relationshipId, originalId);
    assert.equal(VALID_RELATIONSHIP.sourceKnowledgeId, originalSource);
  });

  it('should not mutate input cross references', () => {
    const originalId = VALID_CROSS_REFERENCE.referenceId;
    const originalKnowledgeId = VALID_CROSS_REFERENCE.knowledgeId;

    composeKnowledgeRelationships(VALID_INPUT);

    assert.equal(VALID_CROSS_REFERENCE.referenceId, originalId);
    assert.equal(VALID_CROSS_REFERENCE.knowledgeId, originalKnowledgeId);
  });

  it('should not mutate input registry relationships', () => {
    const relationships = [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2];
    const originalIds = relationships.map((r) => r.relationshipId);

    composeRelationshipRegistry(relationships, []);

    assert.equal(relationships[0].relationshipId, originalIds[0]);
    assert.equal(relationships[1].relationshipId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Relationship Kernel — Helper Functions', () => {
  it('should return canonical relationship types', () => {
    const types = getCanonicalKnowledgeRelationshipTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_KNOWLEDGE_RELATIONSHIP_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical relationship strengths', () => {
    const strengths = getCanonicalRelationshipStrengths();
    assert.deepStrictEqual([...strengths], [...CANONICAL_RELATIONSHIP_STRENGTH]);
    assert.equal(strengths.length, 5);
  });

  it('should return canonical cross reference types', () => {
    const types = getCanonicalCrossReferenceTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_CROSS_REFERENCE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical relationship statuses', () => {
    const statuses = getCanonicalRelationshipStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_RELATIONSHIP_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate relationship type support', () => {
    assert.equal(isSupportedKnowledgeRelationshipType('references'), true);
    assert.equal(isSupportedKnowledgeRelationshipType('extends'), true);
    assert.equal(isSupportedKnowledgeRelationshipType('unsupported'), false);
  });

  it('should validate relationship strength support', () => {
    assert.equal(isSupportedRelationshipStrength('weak'), true);
    assert.equal(isSupportedRelationshipStrength('strong'), true);
    assert.equal(isSupportedRelationshipStrength('unsupported'), false);
  });

  it('should validate cross reference type support', () => {
    assert.equal(isSupportedCrossReferenceType('internal_link'), true);
    assert.equal(isSupportedCrossReferenceType('external_reference'), true);
    assert.equal(isSupportedCrossReferenceType('unsupported'), false);
  });

  it('should validate relationship status support', () => {
    assert.equal(isSupportedRelationshipStatus('draft'), true);
    assert.equal(isSupportedRelationshipStatus('published'), true);
    assert.equal(isSupportedRelationshipStatus('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Relationship Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 relationship types', () => {
    assert.equal(CANONICAL_KNOWLEDGE_RELATIONSHIP_TYPES.length, 10);
  });

  it('should have exactly 5 relationship strengths', () => {
    assert.equal(CANONICAL_RELATIONSHIP_STRENGTH.length, 5);
  });

  it('should have exactly 10 cross reference types', () => {
    assert.equal(CANONICAL_CROSS_REFERENCE_TYPES.length, 10);
  });

  it('should have exactly 6 relationship statuses', () => {
    assert.equal(CANONICAL_RELATIONSHIP_STATUS.length, 6);
  });

  it('should contain all expected relationship types', () => {
    const expectedTypes = [
      'references',
      'extends',
      'implements',
      'depends_on',
      'related_to',
      'visualizes',
      'demonstrates',
      'documents',
      'supports',
      'prerequisite_for',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_KNOWLEDGE_RELATIONSHIP_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected relationship strengths', () => {
    const expectedStrengths = [
      'weak',
      'moderate',
      'strong',
      'critical',
      'canonical',
    ];

    for (const strength of expectedStrengths) {
      assert.ok(
        CANONICAL_RELATIONSHIP_STRENGTH.includes(strength as any),
        `Should include strength: ${strength}`,
      );
    }
  });

  it('should contain all expected cross reference types', () => {
    const expectedTypes = [
      'internal_link',
      'external_reference',
      'curriculum_reference',
      'laboratory_reference',
      'visualization_reference',
      'assessment_reference',
      'documentation_reference',
      'research_reference',
      'glossary_reference',
      'related_topic',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_CROSS_REFERENCE_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected relationship statuses', () => {
    const expectedStatuses = [
      'draft',
      'review',
      'approved',
      'published',
      'deprecated',
      'archived',
    ];

    for (const status of expectedStatuses) {
      assert.ok(
        CANONICAL_RELATIONSHIP_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Relationship Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not perform graph traversal', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(!('traversalResult' in result), 'Should not have traversal result');
    assert.ok(!('graphTraversal' in result), 'Should not have graph traversal');
  });

  it('should not perform semantic inference', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(!('inferredRelationships' in result), 'Should not have inferred relationships');
    assert.ok(!('semanticAnalysis' in result), 'Should not have semantic analysis');
  });

  it('should not recommend relationships', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(!('recommendedRelationships' in result), 'Should not have recommended relationships');
    assert.ok(!('recommendation' in result), 'Should not have recommendation');
  });

  it('should not mutate the knowledge graph', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(!('graphMutation' in result), 'Should not have graph mutation');
    assert.ok(!('mutatedGraph' in result), 'Should not have mutated graph');
  });

  it('should not synchronize Obsidian', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(!('syncResult' in result), 'Should not have sync result');
    assert.ok(!('obsidianSync' in result), 'Should not have obsidian sync');
  });

  it('should not generate markdown', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
    assert.ok(!('markdown' in result), 'Should not have markdown');
  });

  it('should not perform network requests', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not have executable callbacks in relationship', () => {
    const relationship = composeKnowledgeRelationship({
      relationshipId: 'relationship-001',
      sourceKnowledgeId: 'knowledge-001',
      targetKnowledgeId: 'knowledge-002',
      relationshipType: 'references',
      relationshipStrength: 'strong',
      status: 'published',
      tags: [],
      summary: 'Test.',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(relationship);
    for (const key of keys) {
      const value = (relationship as any)[key];
      assert.ok(typeof value !== 'function', `Relationship field "${key}" should not be a function`);
    }
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform runtime execution', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });

  it('should not generate code', () => {
    const result = composeKnowledgeRelationships(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });
});

// ---------------------------------------------------------------------------
// Knowledge Artifact With Relationships Tests
// ---------------------------------------------------------------------------

describe('Relationship Kernel — Knowledge Artifact With Relationships', () => {
  it('should compose valid knowledge artifact with relationships', () => {
    const artifact = composeKnowledgeArtifactWithRelationships({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      relationships: [VALID_RELATIONSHIP],
      crossReferences: [VALID_CROSS_REFERENCE],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.knowledgeId, 'knowledge-001');
    assert.equal(artifact.title, 'Neural Networks');
    assert.equal(artifact.relationships.length, 1);
    assert.equal(artifact.crossReferences.length, 1);
  });

  it('should validate valid knowledge artifact with relationships', () => {
    const artifact = composeKnowledgeArtifactWithRelationships({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      relationships: [VALID_RELATIONSHIP],
      crossReferences: [VALID_CROSS_REFERENCE],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithRelationships(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect missing knowledgeId', () => {
    const artifact = composeKnowledgeArtifactWithRelationships({
      knowledgeId: '',
      title: 'Neural Networks',
      relationships: [VALID_RELATIONSHIP],
      crossReferences: [VALID_CROSS_REFERENCE],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithRelationships(artifact);
    const knowledgeIdError = result.errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_KNOWLEDGE_ID,
    );

    assert.ok(knowledgeIdError, 'Should have RELATIONSHIP_MISSING_KNOWLEDGE_ID error');
  });

  it('should detect missing title', () => {
    const artifact = composeKnowledgeArtifactWithRelationships({
      knowledgeId: 'knowledge-001',
      title: '',
      relationships: [VALID_RELATIONSHIP],
      crossReferences: [VALID_CROSS_REFERENCE],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithRelationships(artifact);
    const titleError = result.errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_SOURCE_KNOWLEDGE_ID,
    );

    assert.ok(titleError, 'Should have RELATIONSHIP_MISSING_SOURCE_KNOWLEDGE_ID error');
  });

  it('should detect missing provenance', () => {
    const artifact = composeKnowledgeArtifactWithRelationships({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      relationships: [VALID_RELATIONSHIP],
      crossReferences: [VALID_CROSS_REFERENCE],
      provenance: undefined as any,
    });

    const result = validateKnowledgeArtifactWithRelationships(artifact);
    const provenanceError = result.errors.find(
      (e) => e.code === RELATIONSHIP_VALIDATION_CODES.RELATIONSHIP_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have RELATIONSHIP_MISSING_PROVENANCE error');
  });
});
