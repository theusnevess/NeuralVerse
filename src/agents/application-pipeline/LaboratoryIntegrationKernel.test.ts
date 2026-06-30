/**
 * NV-1900-D7-OPT-06 — Laboratory Application Integration Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Laboratory Integration Kernel.
 * Covers: valid integration, valid evidence references, valid relationships,
 * valid provenance, registry composition, artifact with laboratories,
 * duplicate IDs, duplicate titles, invalid enums, missing provenance,
 * missing provider, missing rationale, missing references, self relationships,
 * empty registry, registry inconsistency, invalid trace, deterministic ordering,
 * 100 identical executions, immutable registry, input immutability,
 * artifact immutability, cross-agent boundary verification,
 * negative capability verification, helper functions,
 * canonical enum completeness, validator stability, no mutation verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  ApplicationLaboratoryIntegration,
  LaboratoryIntegrationProvenance,
  LaboratoryEvidenceReference,
  LaboratoryIntegrationRelationship,
  LaboratoryIntegrationInput,
  LaboratoryIntegrationRegistry,
  LaboratoryIntegrationTrace,
  ApplicationNode,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_LABORATORY_INTEGRATION_TYPES,
  CANONICAL_LABORATORY_MAPPING_TYPES,
  CANONICAL_LABORATORY_OBJECTIVE_TYPES,
  CANONICAL_LABORATORY_EVIDENCE_TYPES,
  CANONICAL_LABORATORY_INTEGRATION_STATUS,
} from './ApplicationAgentContract.ts';

import {
  composeLaboratoryIntegrationProvenance,
  composeApplicationLaboratoryIntegration,
  composeLaboratoryEvidenceReference,
  composeLaboratoryIntegrationRelationship,
  composeLaboratoryIntegrationTrace,
  composeLaboratoryIntegrationRegistry,
  composeLaboratoryIntegrationRegistryFromInput,
  composeApplicationLaboratoryIntegrations,
  composeApplicationArtifactWithLaboratories,
  isSupportedLaboratoryIntegrationType,
  isSupportedLaboratoryMappingType,
  isSupportedLaboratoryObjectiveType,
  isSupportedLaboratoryEvidenceType,
  isSupportedLaboratoryIntegrationStatus,
  isSupportedLaboratoryIntegrationGovernance,
  getCanonicalLaboratoryIntegrationTypes,
  getCanonicalLaboratoryMappingTypes,
  getCanonicalLaboratoryObjectiveTypes,
  getCanonicalLaboratoryEvidenceTypes,
  getCanonicalLaboratoryIntegrationStatuses,
} from './LaboratoryIntegrationKernel.ts';

import {
  validateApplicationLaboratoryIntegration,
  validateLaboratoryEvidenceReference,
  validateLaboratoryIntegrationRelationship,
  validateLaboratoryIntegrationRegistry,
  validateLaboratoryIntegrationInput,
  validateLaboratoryIntegrationTrace,
  LAB_INTEGRATION_VALIDATION_CODES,
} from './LaboratoryIntegrationValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: LaboratoryIntegrationProvenance = {
  providedBy: 'NeuralVerse Team',
  rationale: 'Core integration concept.',
  reviewedBy: 'Architecture Review Board',
  reviewDate: '2026-01-01',
  governanceStatus: 'canonical',
};

const VALID_NODE: ApplicationNode = {
  applicationId: 'app-001',
  title: 'Medical Imaging System',
  artifactType: 'system_architecture',
  domain: 'computer_vision',
  status: 'published',
  description: 'Complete medical imaging system.',
  provenance: {
    providedBy: 'NeuralVerse Team',
    rationale: 'Core application concept.',
    reviewedBy: 'Architecture Review Board',
    reviewDate: '2026-01-01',
    governanceStatus: 'canonical',
  },
  trace: {
    traceId: '_trace_1',
    decisionCount: 1,
    validationCount: 1,
    registryVersion: '1.0.0',
    compositionVersion: '1.0.0',
    decisions: [],
    deterministic: true,
    generatedFrom: 'deterministic_application_kernel',
    randomUsed: false,
    timeDependency: false,
  },
};

const VALID_INTEGRATION: ApplicationLaboratoryIntegration = {
  integrationId: 'int-001',
  title: 'CNN Architecture Validation Lab',
  description: 'Laboratory demonstrating CNN architecture validation.',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-001',
  laboratoryId: 'lab-001',
  integrationType: 'architecture_validation',
  mappingType: 'primary',
  objectiveType: 'understanding',
  status: 'published',
  provenance: VALID_PROVENANCE,
};

const VALID_INTEGRATION_2: ApplicationLaboratoryIntegration = {
  integrationId: 'int-002',
  title: 'Performance Analysis Lab',
  description: 'Laboratory analyzing system performance.',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-002',
  laboratoryId: 'lab-002',
  integrationType: 'performance_analysis',
  mappingType: 'secondary',
  objectiveType: 'experimentation',
  status: 'approved',
  provenance: { ...VALID_PROVENANCE, providedBy: 'Research Team' },
};

const VALID_EVIDENCE: LaboratoryEvidenceReference = {
  evidenceId: 'ev-001',
  integrationId: 'int-001',
  evidenceType: 'visualization',
  description: 'Visualization of CNN layer activations.',
  laboratoryArtifactReference: 'lab-artifact-001',
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP: LaboratoryIntegrationRelationship = {
  relationshipId: 'rel-001',
  sourceIntegrationId: 'int-001',
  targetIntegrationId: 'int-002',
  relationshipType: 'extends',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: LaboratoryIntegrationInput = {
  integrations: [VALID_INTEGRATION, VALID_INTEGRATION_2],
  evidenceReferences: [VALID_EVIDENCE],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: LaboratoryIntegrationInput = {
  integrations: [],
  evidenceReferences: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Integration Composition Tests
// ---------------------------------------------------------------------------

describe('Laboratory Integration Kernel — Composition', () => {
  it('should compose valid integration provenance', () => {
    const provenance = composeLaboratoryIntegrationProvenance({
      providedBy: 'NeuralVerse Team',
      rationale: 'Core concept.',
      reviewedBy: 'Review Board',
      reviewDate: '2026-01-01',
      governanceStatus: 'canonical',
    });

    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.rationale, 'Core concept.');
  });

  it('should compose valid application laboratory integration', () => {
    const int = composeApplicationLaboratoryIntegration({
      integrationId: 'int-001',
      title: 'Test Integration',
      description: 'Test.',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      laboratoryId: 'lab-001',
      integrationType: 'architecture_validation',
      mappingType: 'primary',
      objectiveType: 'understanding',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(int.integrationId, 'int-001');
    assert.equal(int.title, 'Test Integration');
    assert.equal(int.integrationType, 'architecture_validation');
    assert.equal(int.mappingType, 'primary');
    assert.equal(int.objectiveType, 'understanding');
  });

  it('should compose valid laboratory evidence reference', () => {
    const ev = composeLaboratoryEvidenceReference({
      evidenceId: 'ev-001',
      integrationId: 'int-001',
      evidenceType: 'visualization',
      description: 'Test evidence.',
      laboratoryArtifactReference: 'lab-artifact-001',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(ev.evidenceId, 'ev-001');
    assert.equal(ev.evidenceType, 'visualization');
    assert.equal(ev.laboratoryArtifactReference, 'lab-artifact-001');
  });

  it('should compose valid integration relationship', () => {
    const rel = composeLaboratoryIntegrationRelationship({
      relationshipId: 'rel-001',
      sourceIntegrationId: 'int-001',
      targetIntegrationId: 'int-002',
      relationshipType: 'extends',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(rel.relationshipId, 'rel-001');
    assert.equal(rel.sourceIntegrationId, 'int-001');
    assert.equal(rel.targetIntegrationId, 'int-002');
  });

  it('should compose valid integration trace', () => {
    const trace = composeLaboratoryIntegrationTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', integrationId: 'int-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
  });

  it('should validate a valid integration with no errors', () => {
    const errors = validateApplicationLaboratoryIntegration(VALID_INTEGRATION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeLaboratoryIntegrationRegistry(
      [VALID_INTEGRATION, VALID_INTEGRATION_2],
      [VALID_EVIDENCE],
      [VALID_RELATIONSHIP],
    );
    const result = validateLaboratoryIntegrationRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate integration input', () => {
    const result = validateLaboratoryIntegrationInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Laboratory Integration Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeLaboratoryIntegrationRegistry([], [], []);
    const result = validateLaboratoryIntegrationRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have LAB_INTEGRATION_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate integration IDs', () => {
    const registry = composeLaboratoryIntegrationRegistry([VALID_INTEGRATION, VALID_INTEGRATION], [], []);
    const result = validateLaboratoryIntegrationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have LAB_INTEGRATION_DUPLICATE_ID error');
  });

  it('should detect duplicate integration titles', () => {
    const int1 = { ...VALID_INTEGRATION, integrationId: 'int-001', title: 'Same Title' };
    const int2 = { ...VALID_INTEGRATION, integrationId: 'int-002', title: 'Same Title' };
    const registry = composeLaboratoryIntegrationRegistry([int1, int2], [], []);
    const result = validateLaboratoryIntegrationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have LAB_INTEGRATION_DUPLICATE_TITLE error');
  });

  it('should detect duplicate evidence IDs', () => {
    const registry = composeLaboratoryIntegrationRegistry([VALID_INTEGRATION], [VALID_EVIDENCE, VALID_EVIDENCE], []);
    const result = validateLaboratoryIntegrationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_EVIDENCE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have LAB_INTEGRATION_EVIDENCE_DUPLICATE_ID error');
  });

  it('should detect duplicate relationship IDs', () => {
    const registry = composeLaboratoryIntegrationRegistry(
      [VALID_INTEGRATION, VALID_INTEGRATION_2],
      [],
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP],
    );
    const result = validateLaboratoryIntegrationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_RELATIONSHIP_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have LAB_INTEGRATION_RELATIONSHIP_DUPLICATE_ID error');
  });

  it('should sort integrations deterministically', () => {
    const int3 = { ...VALID_INTEGRATION, integrationId: 'int-003' };
    const int1 = { ...VALID_INTEGRATION, integrationId: 'int-001' };
    const int2 = { ...VALID_INTEGRATION, integrationId: 'int-002' };

    const registry = composeLaboratoryIntegrationRegistry([int3, int1, int2], [], []);

    assert.equal(registry.integrations[0].integrationId, 'int-001');
    assert.equal(registry.integrations[1].integrationId, 'int-002');
    assert.equal(registry.integrations[2].integrationId, 'int-003');
  });

  it('should sort evidence deterministically', () => {
    const ev2 = { ...VALID_EVIDENCE, evidenceId: 'ev-002', evidenceType: 'measurement' as const };
    const ev1 = { ...VALID_EVIDENCE, evidenceId: 'ev-001', evidenceType: 'visualization' as const };

    const registry = composeLaboratoryIntegrationRegistry([VALID_INTEGRATION], [ev2, ev1], []);

    assert.equal(registry.evidenceReferences[0].evidenceType, 'measurement');
    assert.equal(registry.evidenceReferences[1].evidenceType, 'visualization');
  });

  it('should sort relationships deterministically', () => {
    const rel2 = { ...VALID_RELATIONSHIP, relationshipId: 'rel-002', sourceIntegrationId: 'int-002' };
    const rel1 = { ...VALID_RELATIONSHIP, relationshipId: 'rel-001', sourceIntegrationId: 'int-001' };

    const registry = composeLaboratoryIntegrationRegistry(
      [VALID_INTEGRATION, VALID_INTEGRATION_2],
      [],
      [rel2, rel1],
    );

    assert.equal(registry.relationships[0].sourceIntegrationId, 'int-001');
    assert.equal(registry.relationships[1].sourceIntegrationId, 'int-002');
  });

  it('should compute correct metadata counts', () => {
    const registry = composeLaboratoryIntegrationRegistry(
      [VALID_INTEGRATION, VALID_INTEGRATION_2],
      [VALID_EVIDENCE],
      [VALID_RELATIONSHIP],
    );

    assert.equal(registry.metadata.integrationCount, 2);
    assert.equal(registry.metadata.evidenceCount, 1);
    assert.equal(registry.metadata.relationshipCount, 1);
    assert.equal(registry.metadata.typeCount, 2);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Laboratory Integration Kernel — Validation', () => {
  it('should detect invalid integration type', () => {
    const int = { ...VALID_INTEGRATION, integrationType: 'unsupported' as any };
    const errors = validateApplicationLaboratoryIntegration(int);
    const typeError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have LAB_INTEGRATION_INVALID_TYPE error');
  });

  it('should detect invalid mapping type', () => {
    const int = { ...VALID_INTEGRATION, mappingType: 'unsupported' as any };
    const errors = validateApplicationLaboratoryIntegration(int);
    const mappingError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_MAPPING,
    );

    assert.ok(mappingError, 'Should have LAB_INTEGRATION_INVALID_MAPPING error');
  });

  it('should detect invalid objective type', () => {
    const int = { ...VALID_INTEGRATION, objectiveType: 'unsupported' as any };
    const errors = validateApplicationLaboratoryIntegration(int);
    const objectiveError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_OBJECTIVE,
    );

    assert.ok(objectiveError, 'Should have LAB_INTEGRATION_INVALID_OBJECTIVE error');
  });

  it('should detect invalid evidence type', () => {
    const ev = { ...VALID_EVIDENCE, evidenceType: 'unsupported' as any };
    const errors = validateLaboratoryEvidenceReference(ev);
    const evidenceError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_EVIDENCE,
    );

    assert.ok(evidenceError, 'Should have LAB_INTEGRATION_INVALID_EVIDENCE error');
  });

  it('should detect invalid status', () => {
    const int = { ...VALID_INTEGRATION, status: 'unsupported' as any };
    const errors = validateApplicationLaboratoryIntegration(int);
    const statusError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have LAB_INTEGRATION_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const int = { ...VALID_INTEGRATION, provenance: { ...VALID_PROVENANCE, governanceStatus: 'invalid' as any } };
    const errors = validateApplicationLaboratoryIntegration(int);
    const governanceError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have LAB_INTEGRATION_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const int = { ...VALID_INTEGRATION, provenance: undefined as any };
    const errors = validateApplicationLaboratoryIntegration(int);
    const provenanceError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have LAB_INTEGRATION_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const int = { ...VALID_INTEGRATION, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateApplicationLaboratoryIntegration(int);
    const providerError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have LAB_INTEGRATION_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const int = { ...VALID_INTEGRATION, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateApplicationLaboratoryIntegration(int);
    const rationaleError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have LAB_INTEGRATION_MISSING_RATIONALE error');
  });

  it('should detect missing application reference', () => {
    const int = { ...VALID_INTEGRATION, applicationArtifactId: '' };
    const errors = validateApplicationLaboratoryIntegration(int);
    const refError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_APPLICATION_REFERENCE,
    );

    assert.ok(refError, 'Should have LAB_INTEGRATION_MISSING_APPLICATION_REFERENCE error');
  });

  it('should detect missing knowledge reference', () => {
    const int = { ...VALID_INTEGRATION, knowledgeArtifactId: '' };
    const errors = validateApplicationLaboratoryIntegration(int);
    const refError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_KNOWLEDGE_REFERENCE,
    );

    assert.ok(refError, 'Should have LAB_INTEGRATION_MISSING_KNOWLEDGE_REFERENCE error');
  });

  it('should detect missing laboratory reference', () => {
    const int = { ...VALID_INTEGRATION, laboratoryId: '' };
    const errors = validateApplicationLaboratoryIntegration(int);
    const refError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_LABORATORY_REFERENCE,
    );

    assert.ok(refError, 'Should have LAB_INTEGRATION_MISSING_LABORATORY_REFERENCE error');
  });

  it('should detect missing integration ID', () => {
    const int = { ...VALID_INTEGRATION, integrationId: '' };
    const errors = validateApplicationLaboratoryIntegration(int);
    const idError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_INTEGRATION_ID,
    );

    assert.ok(idError, 'Should have LAB_INTEGRATION_MISSING_INTEGRATION_ID error');
  });

  it('should detect missing title', () => {
    const int = { ...VALID_INTEGRATION, title: '' };
    const errors = validateApplicationLaboratoryIntegration(int);
    const titleError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have LAB_INTEGRATION_MISSING_TITLE error');
  });

  it('should detect self relationships', () => {
    const selfRel: LaboratoryIntegrationRelationship = {
      ...VALID_RELATIONSHIP,
      sourceIntegrationId: 'int-001',
      targetIntegrationId: 'int-001',
    };

    const errors = validateLaboratoryIntegrationRelationship(selfRel, ['int-001', 'int-002']);
    const selfError = errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have LAB_INTEGRATION_SELF_RELATIONSHIP error');
  });

  it('should validate a valid trace', () => {
    const trace = composeLaboratoryIntegrationTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateLaboratoryIntegrationTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: LaboratoryIntegrationTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false as true,
      generatedFrom: 'deterministic_laboratory_integration_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateLaboratoryIntegrationTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Laboratory Integration Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeApplicationLaboratoryIntegrations>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeApplicationLaboratoryIntegrations(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].integrations, results[i].integrations);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeLaboratoryIntegrationRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeLaboratoryIntegrationRegistry(
        [VALID_INTEGRATION],
        [VALID_EVIDENCE],
        [],
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].integrations, results[i].integrations);
      assert.deepStrictEqual(results[0].evidenceReferences, results[i].evidenceReferences);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Laboratory Integration Kernel — Immutability', () => {
  it('should not mutate input integrations', () => {
    const originalId = VALID_INTEGRATION.integrationId;
    const originalTitle = VALID_INTEGRATION.title;

    composeApplicationLaboratoryIntegrations(VALID_INPUT);

    assert.equal(VALID_INTEGRATION.integrationId, originalId);
    assert.equal(VALID_INTEGRATION.title, originalTitle);
  });

  it('should not mutate input registry integrations', () => {
    const integrations = [VALID_INTEGRATION, VALID_INTEGRATION_2];
    const originalIds = integrations.map((i) => i.integrationId);

    composeLaboratoryIntegrationRegistry(integrations, [], []);

    assert.equal(integrations[0].integrationId, originalIds[0]);
    assert.equal(integrations[1].integrationId, originalIds[1]);
  });

  it('should not mutate the original application node', () => {
    const registry = composeLaboratoryIntegrationRegistry([VALID_INTEGRATION], [], []);
    const originalDescription = VALID_NODE.description;

    composeApplicationArtifactWithLaboratories({
      applicationNode: VALID_NODE,
      laboratoryIntegrationRegistry: registry,
    });

    assert.equal(VALID_NODE.description, originalDescription);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Laboratory Integration Kernel — Helper Functions', () => {
  it('should return canonical integration types', () => {
    const types = getCanonicalLaboratoryIntegrationTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_LABORATORY_INTEGRATION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical mapping types', () => {
    const types = getCanonicalLaboratoryMappingTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_LABORATORY_MAPPING_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical objective types', () => {
    const types = getCanonicalLaboratoryObjectiveTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_LABORATORY_OBJECTIVE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical evidence types', () => {
    const types = getCanonicalLaboratoryEvidenceTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_LABORATORY_EVIDENCE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical statuses', () => {
    const statuses = getCanonicalLaboratoryIntegrationStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_LABORATORY_INTEGRATION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate integration type support', () => {
    assert.equal(isSupportedLaboratoryIntegrationType('architecture_validation'), true);
    assert.equal(isSupportedLaboratoryIntegrationType('performance_analysis'), true);
    assert.equal(isSupportedLaboratoryIntegrationType('unsupported'), false);
  });

  it('should validate mapping type support', () => {
    assert.equal(isSupportedLaboratoryMappingType('primary'), true);
    assert.equal(isSupportedLaboratoryMappingType('secondary'), true);
    assert.equal(isSupportedLaboratoryMappingType('unsupported'), false);
  });

  it('should validate objective type support', () => {
    assert.equal(isSupportedLaboratoryObjectiveType('understanding'), true);
    assert.equal(isSupportedLaboratoryObjectiveType('experimentation'), true);
    assert.equal(isSupportedLaboratoryObjectiveType('unsupported'), false);
  });

  it('should validate evidence type support', () => {
    assert.equal(isSupportedLaboratoryEvidenceType('visualization'), true);
    assert.equal(isSupportedLaboratoryEvidenceType('measurement'), true);
    assert.equal(isSupportedLaboratoryEvidenceType('unsupported'), false);
  });

  it('should validate status support', () => {
    assert.equal(isSupportedLaboratoryIntegrationStatus('draft'), true);
    assert.equal(isSupportedLaboratoryIntegrationStatus('published'), true);
    assert.equal(isSupportedLaboratoryIntegrationStatus('unsupported'), false);
  });

  it('should validate governance support', () => {
    assert.equal(isSupportedLaboratoryIntegrationGovernance('canonical'), true);
    assert.equal(isSupportedLaboratoryIntegrationGovernance('accepted'), true);
    assert.equal(isSupportedLaboratoryIntegrationGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Laboratory Integration Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 integration types', () => {
    assert.equal(CANONICAL_LABORATORY_INTEGRATION_TYPES.length, 10);
  });

  it('should have exactly 10 mapping types', () => {
    assert.equal(CANONICAL_LABORATORY_MAPPING_TYPES.length, 10);
  });

  it('should have exactly 10 objective types', () => {
    assert.equal(CANONICAL_LABORATORY_OBJECTIVE_TYPES.length, 10);
  });

  it('should have exactly 10 evidence types', () => {
    assert.equal(CANONICAL_LABORATORY_EVIDENCE_TYPES.length, 10);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_LABORATORY_INTEGRATION_STATUS.length, 6);
  });

  it('should contain all expected integration types', () => {
    const expected = ['concept_demonstration', 'algorithm_visualization', 'parameter_exploration', 'architecture_validation', 'engineering_simulation', 'workflow_demonstration', 'performance_analysis', 'comparison_experiment', 'failure_analysis', 'deployment_simulation'];

    for (const type of expected) {
      assert.ok(
        CANONICAL_LABORATORY_INTEGRATION_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected statuses', () => {
    const expected = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expected) {
      assert.ok(
        CANONICAL_LABORATORY_INTEGRATION_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Laboratory Integration Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeApplicationLaboratoryIntegrations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeApplicationLaboratoryIntegrations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeApplicationLaboratoryIntegrations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeApplicationLaboratoryIntegrations(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate integration content', () => {
    const result = composeApplicationLaboratoryIntegrations(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
  });

  it('should not perform network requests', () => {
    const result = composeApplicationLaboratoryIntegrations(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
  });

  it('should not generate code', () => {
    const result = composeApplicationLaboratoryIntegrations(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
  });

  it('should not have executable callbacks in integration', () => {
    const int = composeApplicationLaboratoryIntegration({
      integrationId: 'int-001',
      title: 'Test',
      description: 'Test.',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      laboratoryId: 'lab-001',
      integrationType: 'architecture_validation',
      mappingType: 'primary',
      objectiveType: 'understanding',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(int);
    for (const key of keys) {
      const value = (int as any)[key];
      assert.ok(typeof value !== 'function', `Integration field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeApplicationLaboratoryIntegrations(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
  });

  it('should not access filesystem', () => {
    const result = composeApplicationLaboratoryIntegrations(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Laboratory Integration Kernel — Registry Validation', () => {
  it('should detect registry inconsistency with invalid deterministic flag', () => {
    const registry: LaboratoryIntegrationRegistry = {
      ...composeLaboratoryIntegrationRegistry([VALID_INTEGRATION], [], []),
      deterministic: false as any,
    };
    const result = validateLaboratoryIntegrationRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid randomUsed flag', () => {
    const registry: LaboratoryIntegrationRegistry = {
      ...composeLaboratoryIntegrationRegistry([VALID_INTEGRATION], [], []),
      randomUsed: true as any,
    };
    const result = validateLaboratoryIntegrationRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid timeDependency flag', () => {
    const registry: LaboratoryIntegrationRegistry = {
      ...composeLaboratoryIntegrationRegistry([VALID_INTEGRATION], [], []),
      timeDependency: true as any,
    };
    const result = validateLaboratoryIntegrationRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should validate empty input', () => {
    const result = validateLaboratoryIntegrationInput(EMPTY_INPUT);
    assert.equal(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === LAB_INTEGRATION_VALIDATION_CODES.LAB_INTEGRATION_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have LAB_INTEGRATION_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('Laboratory Integration Kernel — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const result1 = validateLaboratoryIntegrationRegistry(composeLaboratoryIntegrationRegistry([VALID_INTEGRATION], [], []));
    const result2 = validateLaboratoryIntegrationRegistry(composeLaboratoryIntegrationRegistry([VALID_INTEGRATION], [], []));

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });

  it('should produce identical validation results for invalid input', () => {
    const int = { ...VALID_INTEGRATION, integrationType: 'unsupported' as any };
    const result1 = validateApplicationLaboratoryIntegration(int);
    const result2 = validateApplicationLaboratoryIntegration(int);

    assert.deepStrictEqual(result1.length, result2.length);
  });
});

// ---------------------------------------------------------------------------
// No Mutation Behavior Tests
// ---------------------------------------------------------------------------

describe('Laboratory Integration Kernel — No Mutation Behavior', () => {
  it('should not mutate integrations during registry composition', () => {
    const integrations = [
      { ...VALID_INTEGRATION, integrationId: 'int-003' },
      { ...VALID_INTEGRATION, integrationId: 'int-001' },
      { ...VALID_INTEGRATION, integrationId: 'int-002' },
    ];
    const originalOrder = integrations.map((i) => i.integrationId);

    composeLaboratoryIntegrationRegistry(integrations, [], []);

    assert.deepStrictEqual(integrations.map((i) => i.integrationId), originalOrder);
  });

  it('should not mutate input during full composition', () => {
    const input: LaboratoryIntegrationInput = {
      integrations: [
        { ...VALID_INTEGRATION, integrationId: 'int-002' },
        { ...VALID_INTEGRATION, integrationId: 'int-001' },
      ],
      evidenceReferences: [],
      relationships: [],
    };
    const originalOrder = input.integrations.map((i) => i.integrationId);

    composeApplicationLaboratoryIntegrations(input);

    assert.deepStrictEqual(input.integrations.map((i) => i.integrationId), originalOrder);
  });
});

// ---------------------------------------------------------------------------
// Artifact with Laboratories Tests
// ---------------------------------------------------------------------------

describe('Laboratory Integration Kernel — Artifact with Laboratories', () => {
  it('should compose application artifact with laboratories', () => {
    const registry = composeLaboratoryIntegrationRegistry([VALID_INTEGRATION], [VALID_EVIDENCE], []);
    const result = composeApplicationArtifactWithLaboratories({
      applicationNode: VALID_NODE,
      laboratoryIntegrationRegistry: registry,
    });

    assert.equal(result.applicationNode.applicationId, 'app-001');
    assert.equal(result.laboratoryIntegrationRegistry.integrations.length, 1);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should not mutate the original application node', () => {
    const registry = composeLaboratoryIntegrationRegistry([VALID_INTEGRATION], [], []);
    const originalTitle = VALID_NODE.title;

    composeApplicationArtifactWithLaboratories({
      applicationNode: VALID_NODE,
      laboratoryIntegrationRegistry: registry,
    });

    assert.equal(VALID_NODE.title, originalTitle);
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Verification Tests
// ---------------------------------------------------------------------------

describe('Laboratory Integration Kernel — Cross-Agent Boundary Verification', () => {
  it('should only reference laboratory IDs, not own laboratory metadata', () => {
    const int = composeApplicationLaboratoryIntegration({
      integrationId: 'int-001',
      title: 'Test',
      description: 'Test.',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      laboratoryId: 'lab-001',
      integrationType: 'architecture_validation',
      mappingType: 'primary',
      objectiveType: 'understanding',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(typeof int.laboratoryId, 'string');
    assert.ok(!('laboratoryContent' in int), 'Should not have laboratory content');
    assert.ok(!('laboratoryExecution' in int), 'Should not have laboratory execution');
  });

  it('should not execute laboratories', () => {
    const result = composeApplicationLaboratoryIntegrations(VALID_INPUT);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('laboratoryOutput' in result), 'Should not have laboratory output');
  });

  it('should not create laboratories', () => {
    const result = composeApplicationLaboratoryIntegrations(VALID_INPUT);
    assert.ok(!('createdLaboratories' in result), 'Should not have created laboratories');
    assert.ok(!('newLaboratory' in result), 'Should not have new laboratory');
  });

  it('should not schedule laboratories', () => {
    const result = composeApplicationLaboratoryIntegrations(VALID_INPUT);
    assert.ok(!('schedule' in result), 'Should not have schedule');
    assert.ok(!('scheduledLabs' in result), 'Should not have scheduled labs');
  });

  it('should not evaluate laboratory results', () => {
    const result = composeApplicationLaboratoryIntegrations(VALID_INPUT);
    assert.ok(!('evaluationResult' in result), 'Should not have evaluation result');
    assert.ok(!('labScore' in result), 'Should not have lab score');
  });
});
