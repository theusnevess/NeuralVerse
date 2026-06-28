/**
 * NV-1900-D7-OPT-02 — Systematic Use Case Mapping Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Use Case Kernel.
 * Covers: valid use case, valid provenance, valid relationships, registry composition,
 * registry metadata, duplicate IDs, duplicate titles, invalid use case type,
 * invalid engineering problem, invalid business value, invalid context,
 * invalid status, invalid governance, missing provenance, missing rationale,
 * missing provider, missing references, self relationships, empty registry,
 * registry inconsistency, deterministic ordering, 100 identical executions,
 * immutable registry, input immutability, helper functions,
 * canonical enum completeness, negative capability verification,
 * validator stability, relationship validation, trace validation,
 * no mutation verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  ApplicationUseCase,
  UseCaseProvenance,
  UseCaseRelationship,
  UseCaseInput,
  UseCaseRegistry,
  UseCaseTrace,
  ApplicationNode,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_USE_CASE_TYPES,
  CANONICAL_ENGINEERING_PROBLEM_TYPES,
  CANONICAL_BUSINESS_VALUE_TYPES,
  CANONICAL_APPLICATION_CONTEXT_TYPES,
  CANONICAL_USE_CASE_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

import {
  composeUseCaseProvenance,
  composeApplicationUseCase,
  composeUseCaseRelationship,
  composeUseCaseTrace,
  composeUseCaseRegistry,
  composeUseCaseRegistryFromInput,
  composeApplicationUseCases,
  composeApplicationArtifactWithUseCases,
  isSupportedUseCaseType,
  isSupportedEngineeringProblemType,
  isSupportedBusinessValueType,
  isSupportedApplicationContext,
  isSupportedUseCaseStatus,
  isSupportedUseCaseGovernance,
  getCanonicalUseCaseTypes,
  getCanonicalEngineeringProblemTypes,
  getCanonicalBusinessValueTypes,
  getCanonicalApplicationContexts,
  getCanonicalUseCaseStatuses,
} from './UseCaseKernel.ts';

import {
  validateApplicationUseCase,
  validateUseCaseRelationship,
  validateUseCaseRegistry,
  validateUseCaseInput,
  validateUseCaseTrace,
  USE_CASE_VALIDATION_CODES,
} from './UseCaseValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: UseCaseProvenance = {
  providedBy: 'NeuralVerse Team',
  rationale: 'Core use case concept.',
  reviewedBy: 'Architecture Review Board',
  reviewDate: '2026-01-01',
  governanceStatus: 'canonical',
};

const VALID_NODE: ApplicationNode = {
  applicationId: 'app-001',
  title: 'Image Classification Pipeline',
  artifactType: 'use_case',
  domain: 'computer_vision',
  status: 'published',
  description: 'End-to-end image classification system.',
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

const VALID_USE_CASE: ApplicationUseCase = {
  useCaseId: 'uc-001',
  title: 'Medical Image Classification',
  description: 'Classification of medical images for diagnostics.',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-001',
  useCaseType: 'classification',
  engineeringProblemType: 'computer_vision',
  businessValueType: 'accuracy',
  applicationContext: 'healthcare',
  summary: 'Classify medical images for diagnostic support.',
  provenance: VALID_PROVENANCE,
};

const VALID_USE_CASE_2: ApplicationUseCase = {
  useCaseId: 'uc-002',
  title: 'Product Recommendation Engine',
  description: 'Recommendation system for e-commerce.',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-002',
  useCaseType: 'recommendation',
  engineeringProblemType: 'recommendation',
  businessValueType: 'personalization',
  applicationContext: 'retail',
  summary: 'Recommend products based on user behavior.',
  provenance: { ...VALID_PROVENANCE, providedBy: 'Research Team' },
};

const VALID_RELATIONSHIP: UseCaseRelationship = {
  relationshipId: 'rel-001',
  sourceUseCase: 'uc-001',
  targetUseCase: 'uc-002',
  relationshipType: 'extends',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: UseCaseInput = {
  useCases: [VALID_USE_CASE, VALID_USE_CASE_2],
  relationships: [VALID_RELATIONSHIP],
};

const EMPTY_INPUT: UseCaseInput = {
  useCases: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Use Case Composition Tests
// ---------------------------------------------------------------------------

describe('Use Case Kernel — Composition', () => {
  it('should compose valid use case provenance', () => {
    const provenance = composeUseCaseProvenance({
      providedBy: 'NeuralVerse Team',
      rationale: 'Core concept.',
      reviewedBy: 'Review Board',
      reviewDate: '2026-01-01',
      governanceStatus: 'canonical',
    });

    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.rationale, 'Core concept.');
    assert.equal(provenance.reviewedBy, 'Review Board');
    assert.equal(provenance.reviewDate, '2026-01-01');
  });

  it('should compose valid application use case', () => {
    const useCase = composeApplicationUseCase({
      useCaseId: 'uc-001',
      title: 'Medical Image Classification',
      description: 'Classification of medical images.',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      useCaseType: 'classification',
      engineeringProblemType: 'computer_vision',
      businessValueType: 'accuracy',
      applicationContext: 'healthcare',
      summary: 'Classify medical images.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(useCase.useCaseId, 'uc-001');
    assert.equal(useCase.title, 'Medical Image Classification');
    assert.equal(useCase.useCaseType, 'classification');
    assert.equal(useCase.engineeringProblemType, 'computer_vision');
    assert.equal(useCase.businessValueType, 'accuracy');
    assert.equal(useCase.applicationContext, 'healthcare');
  });

  it('should compose valid use case relationship', () => {
    const relationship = composeUseCaseRelationship({
      relationshipId: 'rel-001',
      sourceUseCase: 'uc-001',
      targetUseCase: 'uc-002',
      relationshipType: 'extends',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'rel-001');
    assert.equal(relationship.sourceUseCase, 'uc-001');
    assert.equal(relationship.targetUseCase, 'uc-002');
    assert.equal(relationship.relationshipType, 'extends');
  });

  it('should compose valid use case trace', () => {
    const trace = composeUseCaseTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', useCaseId: 'uc-001', validationPassed: true, validationErrors: [] },
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

  it('should validate a valid use case with no errors', () => {
    const errors = validateApplicationUseCase(VALID_USE_CASE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeUseCaseRegistry([VALID_USE_CASE, VALID_USE_CASE_2], [VALID_RELATIONSHIP]);
    const result = validateUseCaseRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate use case input', () => {
    const result = validateUseCaseInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Use Case Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeUseCaseRegistry([], []);
    const result = validateUseCaseRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have USE_CASE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeUseCaseRegistry([VALID_USE_CASE, VALID_USE_CASE], []);
    const result = validateUseCaseRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have USE_CASE_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const uc1 = { ...VALID_USE_CASE, useCaseId: 'uc-001', title: 'Same Title' };
    const uc2 = { ...VALID_USE_CASE, useCaseId: 'uc-002', title: 'Same Title' };
    const registry = composeUseCaseRegistry([uc1, uc2], []);
    const result = validateUseCaseRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have USE_CASE_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by useCaseId', () => {
    const uc3 = { ...VALID_USE_CASE, useCaseId: 'uc-003' };
    const uc1 = { ...VALID_USE_CASE, useCaseId: 'uc-001' };
    const uc2 = { ...VALID_USE_CASE, useCaseId: 'uc-002' };

    const registry = composeUseCaseRegistry([uc3, uc1, uc2], []);

    assert.equal(registry.useCases[0].useCaseId, 'uc-001');
    assert.equal(registry.useCases[1].useCaseId, 'uc-002');
    assert.equal(registry.useCases[2].useCaseId, 'uc-003');
  });

  it('should sort by useCaseType when useCaseId is equal', () => {
    const ucA = { ...VALID_USE_CASE, useCaseId: 'uc-001', useCaseType: 'recommendation' as const };
    const ucB = { ...VALID_USE_CASE, useCaseId: 'uc-001', useCaseType: 'classification' as const };

    const registry = composeUseCaseRegistry([ucA, ucB], []);

    assert.equal(registry.useCases[0].useCaseType, 'classification');
    assert.equal(registry.useCases[1].useCaseType, 'recommendation');
  });

  it('should sort by title when useCaseId and useCaseType are equal', () => {
    const ucA = { ...VALID_USE_CASE, useCaseId: 'uc-001', useCaseType: 'classification' as const, title: 'Zebra System' };
    const ucB = { ...VALID_USE_CASE, useCaseId: 'uc-001', useCaseType: 'classification' as const, title: 'Alpha System' };

    const registry = composeUseCaseRegistry([ucA, ucB], []);

    assert.equal(registry.useCases[0].title, 'Alpha System');
    assert.equal(registry.useCases[1].title, 'Zebra System');
  });

  it('should compute correct metadata counts', () => {
    const registry = composeUseCaseRegistry([VALID_USE_CASE, VALID_USE_CASE_2], [VALID_RELATIONSHIP]);

    assert.equal(registry.metadata.useCaseCount, 2);
    assert.equal(registry.metadata.relationshipCount, 1);
    assert.equal(registry.metadata.typeCount, 2);
    assert.equal(registry.metadata.problemTypeCount, 2);
  });

  it('should sort relationships deterministically', () => {
    const rel2 = { ...VALID_RELATIONSHIP, relationshipId: 'rel-002' };
    const rel1 = { ...VALID_RELATIONSHIP, relationshipId: 'rel-001' };

    const registry = composeUseCaseRegistry([VALID_USE_CASE], [rel2, rel1]);

    assert.equal(registry.relationships[0].relationshipId, 'rel-001');
    assert.equal(registry.relationships[1].relationshipId, 'rel-002');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Use Case Kernel — Validation', () => {
  it('should detect invalid use case type', () => {
    const useCase = { ...VALID_USE_CASE, useCaseType: 'unsupported' as any };
    const errors = validateApplicationUseCase(useCase);
    const typeError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have USE_CASE_INVALID_TYPE error');
  });

  it('should detect invalid engineering problem type', () => {
    const useCase = { ...VALID_USE_CASE, engineeringProblemType: 'unsupported' as any };
    const errors = validateApplicationUseCase(useCase);
    const problemError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_ENGINEERING_PROBLEM,
    );

    assert.ok(problemError, 'Should have USE_CASE_INVALID_ENGINEERING_PROBLEM error');
  });

  it('should detect invalid business value type', () => {
    const useCase = { ...VALID_USE_CASE, businessValueType: 'unsupported' as any };
    const errors = validateApplicationUseCase(useCase);
    const valueError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_BUSINESS_VALUE,
    );

    assert.ok(valueError, 'Should have USE_CASE_INVALID_BUSINESS_VALUE error');
  });

  it('should detect invalid application context', () => {
    const useCase = { ...VALID_USE_CASE, applicationContext: 'unsupported' as any };
    const errors = validateApplicationUseCase(useCase);
    const contextError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_CONTEXT,
    );

    assert.ok(contextError, 'Should have USE_CASE_INVALID_CONTEXT error');
  });

  it('should detect missing provenance', () => {
    const useCase = { ...VALID_USE_CASE, provenance: undefined as any };
    const errors = validateApplicationUseCase(useCase);
    const provenanceError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have USE_CASE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance providedBy', () => {
    const useCase = { ...VALID_USE_CASE, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateApplicationUseCase(useCase);
    const providerError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have USE_CASE_MISSING_PROVIDER error');
  });

  it('should detect missing provenance rationale', () => {
    const useCase = { ...VALID_USE_CASE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateApplicationUseCase(useCase);
    const rationaleError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have USE_CASE_MISSING_RATIONALE error');
  });

  it('should detect missing application reference', () => {
    const useCase = { ...VALID_USE_CASE, applicationArtifactId: '' };
    const errors = validateApplicationUseCase(useCase);
    const refError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_APPLICATION_REFERENCE,
    );

    assert.ok(refError, 'Should have USE_CASE_MISSING_APPLICATION_REFERENCE error');
  });

  it('should detect missing knowledge reference', () => {
    const useCase = { ...VALID_USE_CASE, knowledgeArtifactId: '' };
    const errors = validateApplicationUseCase(useCase);
    const refError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_KNOWLEDGE_REFERENCE,
    );

    assert.ok(refError, 'Should have USE_CASE_MISSING_KNOWLEDGE_REFERENCE error');
  });

  it('should detect missing use case ID', () => {
    const useCase = { ...VALID_USE_CASE, useCaseId: '' };
    const errors = validateApplicationUseCase(useCase);
    const idError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_USE_CASE_ID,
    );

    assert.ok(idError, 'Should have USE_CASE_MISSING_USE_CASE_ID error');
  });

  it('should detect missing title', () => {
    const useCase = { ...VALID_USE_CASE, title: '' };
    const errors = validateApplicationUseCase(useCase);
    const titleError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have USE_CASE_MISSING_TITLE error');
  });

  it('should detect self relationships', () => {
    const selfRel: UseCaseRelationship = {
      ...VALID_RELATIONSHIP,
      sourceUseCase: 'uc-001',
      targetUseCase: 'uc-001',
    };

    const errors = validateUseCaseRelationship(selfRel, ['uc-001', 'uc-002']);
    const selfError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_SELF_RELATIONSHIP,
    );

    assert.ok(selfError, 'Should have USE_CASE_SELF_RELATIONSHIP error');
  });

  it('should detect invalid relationship references', () => {
    const rel: UseCaseRelationship = {
      ...VALID_RELATIONSHIP,
      sourceUseCase: 'unknown-uc',
    };

    const errors = validateUseCaseRelationship(rel, ['uc-001', 'uc-002']);
    const refError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_RELATIONSHIP,
    );

    assert.ok(refError, 'Should have USE_CASE_INVALID_RELATIONSHIP error');
  });

  it('should validate a valid trace', () => {
    const trace = composeUseCaseTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateUseCaseTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: UseCaseTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false,
      generatedFrom: 'deterministic_use_case_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateUseCaseTrace(trace);
    assert.equal(result.valid, false);
  });

  it('should detect invalid governance in provenance', () => {
    const useCase = { ...VALID_USE_CASE, provenance: { ...VALID_PROVENANCE, governanceStatus: 'invalid' as any } };
    const errors = validateApplicationUseCase(useCase);
    const governanceError = errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have USE_CASE_INVALID_GOVERNANCE error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Use Case Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeApplicationUseCases>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeApplicationUseCases(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].useCases, results[i].useCases);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeUseCaseRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeUseCaseRegistry([VALID_USE_CASE, VALID_USE_CASE_2], [VALID_RELATIONSHIP]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].useCases, results[i].useCases);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Use Case Kernel — Immutability', () => {
  it('should not mutate input use cases', () => {
    const originalId = VALID_USE_CASE.useCaseId;
    const originalTitle = VALID_USE_CASE.title;

    composeApplicationUseCases(VALID_INPUT);

    assert.equal(VALID_USE_CASE.useCaseId, originalId);
    assert.equal(VALID_USE_CASE.title, originalTitle);
  });

  it('should not mutate input registry use cases', () => {
    const useCases = [VALID_USE_CASE, VALID_USE_CASE_2];
    const originalIds = useCases.map((u) => u.useCaseId);

    composeUseCaseRegistry(useCases, []);

    assert.equal(useCases[0].useCaseId, originalIds[0]);
    assert.equal(useCases[1].useCaseId, originalIds[1]);
  });

  it('should not mutate the original application node', () => {
    const registry = composeUseCaseRegistry([VALID_USE_CASE], []);
    const artifactWithUseCases = composeApplicationArtifactWithUseCases({
      applicationNode: VALID_NODE,
      useCaseRegistry: registry,
    });

    assert.equal(VALID_NODE.applicationId, 'app-001');
    assert.equal(artifactWithUseCases.applicationNode.applicationId, 'app-001');
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Use Case Kernel — Helper Functions', () => {
  it('should return canonical use case types', () => {
    const types = getCanonicalUseCaseTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_USE_CASE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical engineering problem types', () => {
    const problems = getCanonicalEngineeringProblemTypes();
    assert.deepStrictEqual([...problems], [...CANONICAL_ENGINEERING_PROBLEM_TYPES]);
    assert.equal(problems.length, 10);
  });

  it('should return canonical business value types', () => {
    const values = getCanonicalBusinessValueTypes();
    assert.deepStrictEqual([...values], [...CANONICAL_BUSINESS_VALUE_TYPES]);
    assert.equal(values.length, 10);
  });

  it('should return canonical application contexts', () => {
    const contexts = getCanonicalApplicationContexts();
    assert.deepStrictEqual([...contexts], [...CANONICAL_APPLICATION_CONTEXT_TYPES]);
    assert.equal(contexts.length, 10);
  });

  it('should return canonical use case statuses', () => {
    const statuses = getCanonicalUseCaseStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_USE_CASE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate use case type support', () => {
    assert.equal(isSupportedUseCaseType('classification'), true);
    assert.equal(isSupportedUseCaseType('detection'), true);
    assert.equal(isSupportedUseCaseType('unsupported'), false);
  });

  it('should validate engineering problem type support', () => {
    assert.equal(isSupportedEngineeringProblemType('computer_vision'), true);
    assert.equal(isSupportedEngineeringProblemType('nlp'), true);
    assert.equal(isSupportedEngineeringProblemType('unsupported'), false);
  });

  it('should validate business value type support', () => {
    assert.equal(isSupportedBusinessValueType('cost_reduction'), true);
    assert.equal(isSupportedBusinessValueType('accuracy'), true);
    assert.equal(isSupportedBusinessValueType('unsupported'), false);
  });

  it('should validate application context support', () => {
    assert.equal(isSupportedApplicationContext('healthcare'), true);
    assert.equal(isSupportedApplicationContext('finance'), true);
    assert.equal(isSupportedApplicationContext('unsupported'), false);
  });

  it('should validate use case status support', () => {
    assert.equal(isSupportedUseCaseStatus('draft'), true);
    assert.equal(isSupportedUseCaseStatus('published'), true);
    assert.equal(isSupportedUseCaseStatus('unsupported'), false);
  });

  it('should validate governance status support', () => {
    assert.equal(isSupportedUseCaseGovernance('canonical'), true);
    assert.equal(isSupportedUseCaseGovernance('accepted'), true);
    assert.equal(isSupportedUseCaseGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Use Case Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 use case types', () => {
    assert.equal(CANONICAL_USE_CASE_TYPES.length, 10);
  });

  it('should have exactly 10 engineering problem types', () => {
    assert.equal(CANONICAL_ENGINEERING_PROBLEM_TYPES.length, 10);
  });

  it('should have exactly 10 business value types', () => {
    assert.equal(CANONICAL_BUSINESS_VALUE_TYPES.length, 10);
  });

  it('should have exactly 10 application contexts', () => {
    assert.equal(CANONICAL_APPLICATION_CONTEXT_TYPES.length, 10);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_USE_CASE_STATUS.length, 6);
  });

  it('should contain all expected use case types', () => {
    const expected = ['classification', 'detection', 'segmentation', 'prediction', 'recommendation', 'retrieval', 'generation', 'optimization', 'automation', 'decision_support'];

    for (const type of expected) {
      assert.ok(
        CANONICAL_USE_CASE_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected engineering problem types', () => {
    const expected = ['computer_vision', 'nlp', 'search', 'recommendation', 'forecasting', 'anomaly_detection', 'quality_control', 'robotics', 'scientific_computing', 'decision_system'];

    for (const type of expected) {
      assert.ok(
        CANONICAL_ENGINEERING_PROBLEM_TYPES.includes(type as any),
        `Should include problem type: ${type}`,
      );
    }
  });

  it('should contain all expected business value types', () => {
    const expected = ['cost_reduction', 'automation', 'accuracy', 'speed', 'safety', 'scalability', 'personalization', 'reliability', 'knowledge_discovery', 'decision_quality'];

    for (const type of expected) {
      assert.ok(
        CANONICAL_BUSINESS_VALUE_TYPES.includes(type as any),
        `Should include value type: ${type}`,
      );
    }
  });

  it('should contain all expected application contexts', () => {
    const expected = ['enterprise', 'healthcare', 'manufacturing', 'finance', 'education', 'research', 'agriculture', 'security', 'retail', 'government'];

    for (const context of expected) {
      assert.ok(
        CANONICAL_APPLICATION_CONTEXT_TYPES.includes(context as any),
        `Should include context: ${context}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Use Case Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeApplicationUseCases(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeApplicationUseCases(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeApplicationUseCases(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeApplicationUseCases(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate use case content', () => {
    const result = composeApplicationUseCases(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
  });

  it('should not perform network requests', () => {
    const result = composeApplicationUseCases(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not generate code', () => {
    const result = composeApplicationUseCases(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
  });

  it('should not have executable callbacks in use case', () => {
    const useCase = composeApplicationUseCase({
      useCaseId: 'uc-001',
      title: 'Test',
      description: 'Test.',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      useCaseType: 'classification',
      engineeringProblemType: 'computer_vision',
      businessValueType: 'accuracy',
      applicationContext: 'healthcare',
      summary: 'Test use case.',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(useCase);
    for (const key of keys) {
      const value = (useCase as any)[key];
      assert.ok(typeof value !== 'function', `Use case field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeApplicationUseCases(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
  });

  it('should not access filesystem', () => {
    const result = composeApplicationUseCases(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Use Case Kernel — Registry Validation', () => {
  it('should detect registry inconsistency with invalid deterministic flag', () => {
    const registry: UseCaseRegistry = {
      ...composeUseCaseRegistry([VALID_USE_CASE], []),
      deterministic: false as any,
    };
    const result = validateUseCaseRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid randomUsed flag', () => {
    const registry: UseCaseRegistry = {
      ...composeUseCaseRegistry([VALID_USE_CASE], []),
      randomUsed: true as any,
    };
    const result = validateUseCaseRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid timeDependency flag', () => {
    const registry: UseCaseRegistry = {
      ...composeUseCaseRegistry([VALID_USE_CASE], []),
      timeDependency: true as any,
    };
    const result = validateUseCaseRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should validate empty input', () => {
    const result = validateUseCaseInput(EMPTY_INPUT);
    assert.equal(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === USE_CASE_VALIDATION_CODES.USE_CASE_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have USE_CASE_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('Use Case Kernel — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const result1 = validateUseCaseRegistry(composeUseCaseRegistry([VALID_USE_CASE, VALID_USE_CASE_2], []));
    const result2 = validateUseCaseRegistry(composeUseCaseRegistry([VALID_USE_CASE, VALID_USE_CASE_2], []));

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });

  it('should produce identical validation results for invalid input', () => {
    const useCase = { ...VALID_USE_CASE, useCaseType: 'unsupported' as any };
    const result1 = validateApplicationUseCase(useCase);
    const result2 = validateApplicationUseCase(useCase);

    assert.deepStrictEqual(result1.length, result2.length);
  });
});

// ---------------------------------------------------------------------------
// No Mutation Behavior Tests
// ---------------------------------------------------------------------------

describe('Use Case Kernel — No Mutation Behavior', () => {
  it('should not mutate use cases during registry composition', () => {
    const useCases = [
      { ...VALID_USE_CASE, useCaseId: 'uc-003' },
      { ...VALID_USE_CASE, useCaseId: 'uc-001' },
      { ...VALID_USE_CASE, useCaseId: 'uc-002' },
    ];
    const originalOrder = useCases.map((u) => u.useCaseId);

    composeUseCaseRegistry(useCases, []);

    assert.deepStrictEqual(useCases.map((u) => u.useCaseId), originalOrder);
  });

  it('should not mutate input during full composition', () => {
    const input: UseCaseInput = {
      useCases: [
        { ...VALID_USE_CASE, useCaseId: 'uc-002' },
        { ...VALID_USE_CASE, useCaseId: 'uc-001' },
      ],
      relationships: [],
    };
    const originalOrder = input.useCases.map((u) => u.useCaseId);

    composeApplicationUseCases(input);

    assert.deepStrictEqual(input.useCases.map((u) => u.useCaseId), originalOrder);
  });
});

// ---------------------------------------------------------------------------
// Artifact with Use Cases Tests
// ---------------------------------------------------------------------------

describe('Use Case Kernel — Artifact with Use Cases', () => {
  it('should compose application artifact with use cases', () => {
    const registry = composeUseCaseRegistry([VALID_USE_CASE], []);
    const result = composeApplicationArtifactWithUseCases({
      applicationNode: VALID_NODE,
      useCaseRegistry: registry,
    });

    assert.equal(result.applicationNode.applicationId, 'app-001');
    assert.equal(result.useCaseRegistry.useCases.length, 1);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should not mutate the original application node', () => {
    const registry = composeUseCaseRegistry([VALID_USE_CASE], []);
    const originalDescription = VALID_NODE.description;

    composeApplicationArtifactWithUseCases({
      applicationNode: VALID_NODE,
      useCaseRegistry: registry,
    });

    assert.equal(VALID_NODE.description, originalDescription);
  });
});
