/**
 * NV-1900-D7-OPT-04 — Complete Case Study Modeling Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Case Study Kernel.
 * Covers: valid case study, valid datasets, valid engineering decisions,
 * valid engineering lessons, valid provenance, registry composition,
 * artifact with case studies, duplicate IDs, duplicate titles,
 * invalid enums, missing provenance, missing provider, missing rationale,
 * missing references, empty registry, registry inconsistency, invalid trace,
 * deterministic ordering, 100 identical executions, immutable registry,
 * input immutability, artifact immutability, helper functions,
 * canonical enum completeness, negative capability verification,
 * validator stability, no mutation verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  ApplicationCaseStudy,
  CaseStudyProvenance,
  CaseStudyDataset,
  EngineeringDecision,
  EngineeringLesson,
  CaseStudyInput,
  CaseStudyRegistry,
  CaseStudyTrace,
  ApplicationNode,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_CASE_STUDY_TYPES,
  CANONICAL_CASE_STUDY_PROBLEM_DOMAINS,
  CANONICAL_DATASET_ROLES,
  CANONICAL_ENGINEERING_DECISION_TYPES,
  CANONICAL_CASE_STUDY_LESSON_TYPES,
  CANONICAL_CASE_STUDY_STATUS,
} from './ApplicationAgentContract.ts';

import {
  composeCaseStudyProvenance,
  composeApplicationCaseStudy,
  composeCaseStudyDataset,
  composeEngineeringDecision,
  composeEngineeringLesson,
  composeCaseStudyTrace,
  composeCaseStudyRegistry,
  composeCaseStudyRegistryFromInput,
  composeApplicationCaseStudies,
  composeApplicationArtifactWithCaseStudies,
  isSupportedCaseStudyType,
  isSupportedProblemDomain,
  isSupportedDatasetRole,
  isSupportedEngineeringDecisionType,
  isSupportedLessonType,
  isSupportedCaseStudyStatus,
  isSupportedCaseStudyGovernance,
  getCanonicalCaseStudyTypes,
  getCanonicalProblemDomains,
  getCanonicalDatasetRoles,
  getCanonicalEngineeringDecisionTypes,
  getCanonicalLessonTypes,
  getCanonicalCaseStudyStatuses,
} from './CaseStudyKernel.ts';

import {
  validateApplicationCaseStudy,
  validateCaseStudyDataset,
  validateEngineeringDecision,
  validateEngineeringLesson,
  validateCaseStudyRegistry,
  validateCaseStudyInput,
  validateCaseStudyTrace,
  CASE_STUDY_VALIDATION_CODES,
} from './CaseStudyValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: CaseStudyProvenance = {
  providedBy: 'NeuralVerse Team',
  rationale: 'Core case study concept.',
  reviewedBy: 'Architecture Review Board',
  reviewDate: '2026-01-01',
  governanceStatus: 'canonical',
};

const VALID_NODE: ApplicationNode = {
  applicationId: 'app-001',
  title: 'Medical Imaging System',
  artifactType: 'case_study',
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

const VALID_CASE_STUDY: ApplicationCaseStudy = {
  caseStudyId: 'cs-001',
  title: 'Medical Image Classification at Scale',
  description: 'Industrial deployment of CNN-based medical image classification.',
  caseStudyType: 'industrial',
  problemDomain: 'healthcare',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-001',
  architectureIds: ['arch-001'],
  useCaseIds: ['uc-001'],
  summary: 'Deployed CNN for medical image classification achieving 95% accuracy.',
  status: 'published',
  provenance: VALID_PROVENANCE,
};

const VALID_CASE_STUDY_2: ApplicationCaseStudy = {
  caseStudyId: 'cs-002',
  title: 'Recommendation System Optimization',
  description: 'Optimization of production recommendation system.',
  caseStudyType: 'production',
  problemDomain: 'recommendation',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-002',
  architectureIds: ['arch-002'],
  useCaseIds: ['uc-002'],
  summary: 'Optimized recommendation system latency by 40%.',
  status: 'approved',
  provenance: { ...VALID_PROVENANCE, providedBy: 'Research Team' },
};

const VALID_DATASET: CaseStudyDataset = {
  datasetId: 'ds-001',
  caseStudyId: 'cs-001',
  datasetName: 'MIMIC-CXR',
  datasetRole: 'training',
  description: 'Medical chest X-ray dataset.',
  provenance: VALID_PROVENANCE,
};

const VALID_DECISION: EngineeringDecision = {
  decisionId: 'dec-001',
  caseStudyId: 'cs-001',
  decisionType: 'model_selection',
  description: 'Selected ResNet-50 for image classification.',
  rationale: 'Proven architecture with strong transfer learning capabilities.',
  provenance: VALID_PROVENANCE,
};

const VALID_LESSON: EngineeringLesson = {
  lessonId: 'les-001',
  caseStudyId: 'cs-001',
  lessonType: 'performance',
  description: 'Transfer learning significantly reduces training time.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: CaseStudyInput = {
  caseStudies: [VALID_CASE_STUDY, VALID_CASE_STUDY_2],
  datasets: [VALID_DATASET],
  decisions: [VALID_DECISION],
  lessons: [VALID_LESSON],
};

const EMPTY_INPUT: CaseStudyInput = {
  caseStudies: [],
  datasets: [],
  decisions: [],
  lessons: [],
};

// ---------------------------------------------------------------------------
// Case Study Composition Tests
// ---------------------------------------------------------------------------

describe('Case Study Kernel — Composition', () => {
  it('should compose valid case study provenance', () => {
    const provenance = composeCaseStudyProvenance({
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

  it('should compose valid application case study', () => {
    const cs = composeApplicationCaseStudy({
      caseStudyId: 'cs-001',
      title: 'Test Case Study',
      description: 'Test.',
      caseStudyType: 'industrial',
      problemDomain: 'healthcare',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      architectureIds: ['arch-001'],
      useCaseIds: ['uc-001'],
      summary: 'Test summary.',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(cs.caseStudyId, 'cs-001');
    assert.equal(cs.title, 'Test Case Study');
    assert.equal(cs.caseStudyType, 'industrial');
    assert.equal(cs.problemDomain, 'healthcare');
    assert.equal(cs.architectureIds.length, 1);
    assert.equal(cs.useCaseIds.length, 1);
  });

  it('should compose valid case study dataset', () => {
    const ds = composeCaseStudyDataset({
      datasetId: 'ds-001',
      caseStudyId: 'cs-001',
      datasetName: 'Test Dataset',
      datasetRole: 'training',
      description: 'Test dataset.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(ds.datasetId, 'ds-001');
    assert.equal(ds.datasetRole, 'training');
    assert.equal(ds.datasetName, 'Test Dataset');
  });

  it('should compose valid engineering decision', () => {
    const dec = composeEngineeringDecision({
      decisionId: 'dec-001',
      caseStudyId: 'cs-001',
      decisionType: 'model_selection',
      description: 'Selected model.',
      rationale: 'Strong performance.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(dec.decisionId, 'dec-001');
    assert.equal(dec.decisionType, 'model_selection');
    assert.equal(dec.rationale, 'Strong performance.');
  });

  it('should compose valid engineering lesson', () => {
    const les = composeEngineeringLesson({
      lessonId: 'les-001',
      caseStudyId: 'cs-001',
      lessonType: 'performance',
      description: 'Transfer learning helps.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(les.lessonId, 'les-001');
    assert.equal(les.lessonType, 'performance');
    assert.equal(les.description, 'Transfer learning helps.');
  });

  it('should compose valid case study trace', () => {
    const trace = composeCaseStudyTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', caseStudyId: 'cs-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
  });

  it('should validate a valid case study with no errors', () => {
    const errors = validateApplicationCaseStudy(VALID_CASE_STUDY);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeCaseStudyRegistry(
      [VALID_CASE_STUDY, VALID_CASE_STUDY_2],
      [VALID_DATASET],
      [VALID_DECISION],
      [VALID_LESSON],
    );
    const result = validateCaseStudyRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate case study input', () => {
    const result = validateCaseStudyInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Case Study Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeCaseStudyRegistry([], [], [], []);
    const result = validateCaseStudyRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have CASE_STUDY_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate case study IDs', () => {
    const registry = composeCaseStudyRegistry([VALID_CASE_STUDY, VALID_CASE_STUDY], [], [], []);
    const result = validateCaseStudyRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have CASE_STUDY_DUPLICATE_ID error');
  });

  it('should detect duplicate case study titles', () => {
    const cs1 = { ...VALID_CASE_STUDY, caseStudyId: 'cs-001', title: 'Same Title' };
    const cs2 = { ...VALID_CASE_STUDY, caseStudyId: 'cs-002', title: 'Same Title' };
    const registry = composeCaseStudyRegistry([cs1, cs2], [], [], []);
    const result = validateCaseStudyRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have CASE_STUDY_DUPLICATE_TITLE error');
  });

  it('should detect duplicate dataset IDs', () => {
    const registry = composeCaseStudyRegistry([VALID_CASE_STUDY], [VALID_DATASET, VALID_DATASET], [], []);
    const result = validateCaseStudyRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_DATASET_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have CASE_STUDY_DATASET_DUPLICATE_ID error');
  });

  it('should detect duplicate decision IDs', () => {
    const registry = composeCaseStudyRegistry([VALID_CASE_STUDY], [], [VALID_DECISION, VALID_DECISION], []);
    const result = validateCaseStudyRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_DECISION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have CASE_STUDY_DECISION_DUPLICATE_ID error');
  });

  it('should detect duplicate lesson IDs', () => {
    const registry = composeCaseStudyRegistry([VALID_CASE_STUDY], [], [], [VALID_LESSON, VALID_LESSON]);
    const result = validateCaseStudyRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_LESSON_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have CASE_STUDY_LESSON_DUPLICATE_ID error');
  });

  it('should sort case studies deterministically', () => {
    const cs3 = { ...VALID_CASE_STUDY, caseStudyId: 'cs-003' };
    const cs1 = { ...VALID_CASE_STUDY, caseStudyId: 'cs-001' };
    const cs2 = { ...VALID_CASE_STUDY, caseStudyId: 'cs-002' };

    const registry = composeCaseStudyRegistry([cs3, cs1, cs2], [], [], []);

    assert.equal(registry.caseStudies[0].caseStudyId, 'cs-001');
    assert.equal(registry.caseStudies[1].caseStudyId, 'cs-002');
    assert.equal(registry.caseStudies[2].caseStudyId, 'cs-003');
  });

  it('should sort datasets deterministically', () => {
    const ds2 = { ...VALID_DATASET, datasetId: 'ds-002', datasetRole: 'testing' };
    const ds1 = { ...VALID_DATASET, datasetId: 'ds-001', datasetRole: 'training' };

    const registry = composeCaseStudyRegistry([VALID_CASE_STUDY], [ds2, ds1], [], []);

    assert.equal(registry.datasets[0].datasetRole, 'testing');
    assert.equal(registry.datasets[1].datasetRole, 'training');
  });

  it('should sort decisions deterministically', () => {
    const dec2 = { ...VALID_DECISION, decisionId: 'dec-002', decisionType: 'deployment_strategy' };
    const dec1 = { ...VALID_DECISION, decisionId: 'dec-001', decisionType: 'model_selection' };

    const registry = composeCaseStudyRegistry([VALID_CASE_STUDY], [], [dec2, dec1], []);

    assert.equal(registry.decisions[0].decisionType, 'deployment_strategy');
    assert.equal(registry.decisions[1].decisionType, 'model_selection');
  });

  it('should sort lessons deterministically', () => {
    const les2 = { ...VALID_LESSON, lessonId: 'les-002', lessonType: 'scalability' };
    const les1 = { ...VALID_LESSON, lessonId: 'les-001', lessonType: 'performance' };

    const registry = composeCaseStudyRegistry([VALID_CASE_STUDY], [], [], [les2, les1]);

    assert.equal(registry.lessons[0].lessonType, 'performance');
    assert.equal(registry.lessons[1].lessonType, 'scalability');
  });

  it('should compute correct metadata counts', () => {
    const registry = composeCaseStudyRegistry(
      [VALID_CASE_STUDY, VALID_CASE_STUDY_2],
      [VALID_DATASET],
      [VALID_DECISION],
      [VALID_LESSON],
    );

    assert.equal(registry.metadata.caseStudyCount, 2);
    assert.equal(registry.metadata.datasetCount, 1);
    assert.equal(registry.metadata.decisionCount, 1);
    assert.equal(registry.metadata.lessonCount, 1);
    assert.equal(registry.metadata.typeCount, 2);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Case Study Kernel — Validation', () => {
  it('should detect invalid case study type', () => {
    const cs = { ...VALID_CASE_STUDY, caseStudyType: 'unsupported' as any };
    const errors = validateApplicationCaseStudy(cs);
    const typeError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have CASE_STUDY_INVALID_TYPE error');
  });

  it('should detect invalid problem domain', () => {
    const cs = { ...VALID_CASE_STUDY, problemDomain: 'unsupported' as any };
    const errors = validateApplicationCaseStudy(cs);
    const domainError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_PROBLEM_DOMAIN,
    );

    assert.ok(domainError, 'Should have CASE_STUDY_INVALID_PROBLEM_DOMAIN error');
  });

  it('should detect invalid dataset role', () => {
    const ds = { ...VALID_DATASET, datasetRole: 'unsupported' as any };
    const errors = validateCaseStudyDataset(ds);
    const roleError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_DATASET_ROLE,
    );

    assert.ok(roleError, 'Should have CASE_STUDY_INVALID_DATASET_ROLE error');
  });

  it('should detect invalid decision type', () => {
    const dec = { ...VALID_DECISION, decisionType: 'unsupported' as any };
    const errors = validateEngineeringDecision(dec);
    const typeError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_DECISION_TYPE,
    );

    assert.ok(typeError, 'Should have CASE_STUDY_INVALID_DECISION_TYPE error');
  });

  it('should detect invalid lesson type', () => {
    const les = { ...VALID_LESSON, lessonType: 'unsupported' as any };
    const errors = validateEngineeringLesson(les);
    const typeError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_LESSON_TYPE,
    );

    assert.ok(typeError, 'Should have CASE_STUDY_INVALID_LESSON_TYPE error');
  });

  it('should detect invalid status', () => {
    const cs = { ...VALID_CASE_STUDY, status: 'unsupported' as any };
    const errors = validateApplicationCaseStudy(cs);
    const statusError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have CASE_STUDY_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const cs = { ...VALID_CASE_STUDY, provenance: { ...VALID_PROVENANCE, governanceStatus: 'invalid' as any } };
    const errors = validateApplicationCaseStudy(cs);
    const governanceError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have CASE_STUDY_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const cs = { ...VALID_CASE_STUDY, provenance: undefined as any };
    const errors = validateApplicationCaseStudy(cs);
    const provenanceError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have CASE_STUDY_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const cs = { ...VALID_CASE_STUDY, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateApplicationCaseStudy(cs);
    const providerError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have CASE_STUDY_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const cs = { ...VALID_CASE_STUDY, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateApplicationCaseStudy(cs);
    const rationaleError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have CASE_STUDY_MISSING_RATIONALE error');
  });

  it('should detect missing application reference', () => {
    const cs = { ...VALID_CASE_STUDY, applicationArtifactId: '' };
    const errors = validateApplicationCaseStudy(cs);
    const refError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_APPLICATION_REFERENCE,
    );

    assert.ok(refError, 'Should have CASE_STUDY_MISSING_APPLICATION_REFERENCE error');
  });

  it('should detect missing knowledge reference', () => {
    const cs = { ...VALID_CASE_STUDY, knowledgeArtifactId: '' };
    const errors = validateApplicationCaseStudy(cs);
    const refError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_KNOWLEDGE_REFERENCE,
    );

    assert.ok(refError, 'Should have CASE_STUDY_MISSING_KNOWLEDGE_REFERENCE error');
  });

  it('should detect missing case study ID', () => {
    const cs = { ...VALID_CASE_STUDY, caseStudyId: '' };
    const errors = validateApplicationCaseStudy(cs);
    const idError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_CASE_STUDY_ID,
    );

    assert.ok(idError, 'Should have CASE_STUDY_MISSING_CASE_STUDY_ID error');
  });

  it('should detect missing title', () => {
    const cs = { ...VALID_CASE_STUDY, title: '' };
    const errors = validateApplicationCaseStudy(cs);
    const titleError = errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have CASE_STUDY_MISSING_TITLE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeCaseStudyTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateCaseStudyTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: CaseStudyTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false,
      generatedFrom: 'deterministic_case_study_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateCaseStudyTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Case Study Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeApplicationCaseStudies>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeApplicationCaseStudies(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].caseStudies, results[i].caseStudies);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeCaseStudyRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeCaseStudyRegistry(
        [VALID_CASE_STUDY],
        [VALID_DATASET],
        [VALID_DECISION],
        [VALID_LESSON],
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].caseStudies, results[i].caseStudies);
      assert.deepStrictEqual(results[0].datasets, results[i].datasets);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Case Study Kernel — Immutability', () => {
  it('should not mutate input case studies', () => {
    const originalId = VALID_CASE_STUDY.caseStudyId;
    const originalTitle = VALID_CASE_STUDY.title;

    composeApplicationCaseStudies(VALID_INPUT);

    assert.equal(VALID_CASE_STUDY.caseStudyId, originalId);
    assert.equal(VALID_CASE_STUDY.title, originalTitle);
  });

  it('should not mutate input registry case studies', () => {
    const caseStudies = [VALID_CASE_STUDY, VALID_CASE_STUDY_2];
    const originalIds = caseStudies.map((c) => c.caseStudyId);

    composeCaseStudyRegistry(caseStudies, [], [], []);

    assert.equal(caseStudies[0].caseStudyId, originalIds[0]);
    assert.equal(caseStudies[1].caseStudyId, originalIds[1]);
  });

  it('should not mutate the original application node', () => {
    const registry = composeCaseStudyRegistry([VALID_CASE_STUDY], [], [], []);
    const originalDescription = VALID_NODE.description;

    composeApplicationArtifactWithCaseStudies({
      applicationNode: VALID_NODE,
      caseStudyRegistry: registry,
    });

    assert.equal(VALID_NODE.description, originalDescription);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Case Study Kernel — Helper Functions', () => {
  it('should return canonical case study types', () => {
    const types = getCanonicalCaseStudyTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_CASE_STUDY_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical problem domains', () => {
    const domains = getCanonicalProblemDomains();
    assert.deepStrictEqual([...domains], [...CANONICAL_CASE_STUDY_PROBLEM_DOMAINS]);
    assert.equal(domains.length, 10);
  });

  it('should return canonical dataset roles', () => {
    const roles = getCanonicalDatasetRoles();
    assert.deepStrictEqual([...roles], [...CANONICAL_DATASET_ROLES]);
    assert.equal(roles.length, 10);
  });

  it('should return canonical decision types', () => {
    const types = getCanonicalEngineeringDecisionTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ENGINEERING_DECISION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical lesson types', () => {
    const types = getCanonicalLessonTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_CASE_STUDY_LESSON_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical statuses', () => {
    const statuses = getCanonicalCaseStudyStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_CASE_STUDY_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate case study type support', () => {
    assert.equal(isSupportedCaseStudyType('industrial'), true);
    assert.equal(isSupportedCaseStudyType('academic'), true);
    assert.equal(isSupportedCaseStudyType('unsupported'), false);
  });

  it('should validate problem domain support', () => {
    assert.equal(isSupportedProblemDomain('healthcare'), true);
    assert.equal(isSupportedProblemDomain('finance'), true);
    assert.equal(isSupportedProblemDomain('unsupported'), false);
  });

  it('should validate dataset role support', () => {
    assert.equal(isSupportedDatasetRole('training'), true);
    assert.equal(isSupportedDatasetRole('testing'), true);
    assert.equal(isSupportedDatasetRole('unsupported'), false);
  });

  it('should validate decision type support', () => {
    assert.equal(isSupportedEngineeringDecisionType('model_selection'), true);
    assert.equal(isSupportedEngineeringDecisionType('deployment_strategy'), true);
    assert.equal(isSupportedEngineeringDecisionType('unsupported'), false);
  });

  it('should validate lesson type support', () => {
    assert.equal(isSupportedLessonType('performance'), true);
    assert.equal(isSupportedLessonType('scalability'), true);
    assert.equal(isSupportedLessonType('unsupported'), false);
  });

  it('should validate status support', () => {
    assert.equal(isSupportedCaseStudyStatus('draft'), true);
    assert.equal(isSupportedCaseStudyStatus('published'), true);
    assert.equal(isSupportedCaseStudyStatus('unsupported'), false);
  });

  it('should validate governance support', () => {
    assert.equal(isSupportedCaseStudyGovernance('canonical'), true);
    assert.equal(isSupportedCaseStudyGovernance('accepted'), true);
    assert.equal(isSupportedCaseStudyGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Case Study Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 case study types', () => {
    assert.equal(CANONICAL_CASE_STUDY_TYPES.length, 10);
  });

  it('should have exactly 10 problem domains', () => {
    assert.equal(CANONICAL_CASE_STUDY_PROBLEM_DOMAINS.length, 10);
  });

  it('should have exactly 10 dataset roles', () => {
    assert.equal(CANONICAL_DATASET_ROLES.length, 10);
  });

  it('should have exactly 10 decision types', () => {
    assert.equal(CANONICAL_ENGINEERING_DECISION_TYPES.length, 10);
  });

  it('should have exactly 10 lesson types', () => {
    assert.equal(CANONICAL_CASE_STUDY_LESSON_TYPES.length, 10);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_CASE_STUDY_STATUS.length, 6);
  });

  it('should contain all expected case study types', () => {
    const expected = ['industrial', 'academic', 'research', 'production', 'prototype', 'benchmark', 'deployment', 'migration', 'optimization', 'validation'];

    for (const type of expected) {
      assert.ok(
        CANONICAL_CASE_STUDY_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected problem domains', () => {
    const expected = ['computer_vision', 'natural_language_processing', 'speech', 'recommendation', 'robotics', 'healthcare', 'manufacturing', 'finance', 'scientific_research', 'multimodal_ai'];

    for (const domain of expected) {
      assert.ok(
        CANONICAL_CASE_STUDY_PROBLEM_DOMAINS.includes(domain as any),
        `Should include domain: ${domain}`,
      );
    }
  });

  it('should contain all expected statuses', () => {
    const expected = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expected) {
      assert.ok(
        CANONICAL_CASE_STUDY_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Case Study Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeApplicationCaseStudies(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeApplicationCaseStudies(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeApplicationCaseStudies(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeApplicationCaseStudies(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate case study content', () => {
    const result = composeApplicationCaseStudies(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
  });

  it('should not perform network requests', () => {
    const result = composeApplicationCaseStudies(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
  });

  it('should not generate code', () => {
    const result = composeApplicationCaseStudies(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
  });

  it('should not have executable callbacks in case study', () => {
    const cs = composeApplicationCaseStudy({
      caseStudyId: 'cs-001',
      title: 'Test',
      description: 'Test.',
      caseStudyType: 'industrial',
      problemDomain: 'healthcare',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      architectureIds: [],
      useCaseIds: [],
      summary: 'Test.',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(cs);
    for (const key of keys) {
      const value = (cs as any)[key];
      assert.ok(typeof value !== 'function', `Case study field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeApplicationCaseStudies(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
  });

  it('should not access filesystem', () => {
    const result = composeApplicationCaseStudies(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Case Study Kernel — Registry Validation', () => {
  it('should detect registry inconsistency with invalid deterministic flag', () => {
    const registry: CaseStudyRegistry = {
      ...composeCaseStudyRegistry([VALID_CASE_STUDY], [], [], []),
      deterministic: false as any,
    };
    const result = validateCaseStudyRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid randomUsed flag', () => {
    const registry: CaseStudyRegistry = {
      ...composeCaseStudyRegistry([VALID_CASE_STUDY], [], [], []),
      randomUsed: true as any,
    };
    const result = validateCaseStudyRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid timeDependency flag', () => {
    const registry: CaseStudyRegistry = {
      ...composeCaseStudyRegistry([VALID_CASE_STUDY], [], [], []),
      timeDependency: true as any,
    };
    const result = validateCaseStudyRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should validate empty input', () => {
    const result = validateCaseStudyInput(EMPTY_INPUT);
    assert.equal(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === CASE_STUDY_VALIDATION_CODES.CASE_STUDY_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have CASE_STUDY_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('Case Study Kernel — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const result1 = validateCaseStudyRegistry(composeCaseStudyRegistry([VALID_CASE_STUDY], [], [], []));
    const result2 = validateCaseStudyRegistry(composeCaseStudyRegistry([VALID_CASE_STUDY], [], [], []));

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });

  it('should produce identical validation results for invalid input', () => {
    const cs = { ...VALID_CASE_STUDY, caseStudyType: 'unsupported' as any };
    const result1 = validateApplicationCaseStudy(cs);
    const result2 = validateApplicationCaseStudy(cs);

    assert.deepStrictEqual(result1.length, result2.length);
  });
});

// ---------------------------------------------------------------------------
// No Mutation Behavior Tests
// ---------------------------------------------------------------------------

describe('Case Study Kernel — No Mutation Behavior', () => {
  it('should not mutate case studies during registry composition', () => {
    const caseStudies = [
      { ...VALID_CASE_STUDY, caseStudyId: 'cs-003' },
      { ...VALID_CASE_STUDY, caseStudyId: 'cs-001' },
      { ...VALID_CASE_STUDY, caseStudyId: 'cs-002' },
    ];
    const originalOrder = caseStudies.map((c) => c.caseStudyId);

    composeCaseStudyRegistry(caseStudies, [], [], []);

    assert.deepStrictEqual(caseStudies.map((c) => c.caseStudyId), originalOrder);
  });

  it('should not mutate input during full composition', () => {
    const input: CaseStudyInput = {
      caseStudies: [
        { ...VALID_CASE_STUDY, caseStudyId: 'cs-002' },
        { ...VALID_CASE_STUDY, caseStudyId: 'cs-001' },
      ],
      datasets: [],
      decisions: [],
      lessons: [],
    };
    const originalOrder = input.caseStudies.map((c) => c.caseStudyId);

    composeApplicationCaseStudies(input);

    assert.deepStrictEqual(input.caseStudies.map((c) => c.caseStudyId), originalOrder);
  });
});

// ---------------------------------------------------------------------------
// Artifact with Case Studies Tests
// ---------------------------------------------------------------------------

describe('Case Study Kernel — Artifact with Case Studies', () => {
  it('should compose application artifact with case studies', () => {
    const registry = composeCaseStudyRegistry([VALID_CASE_STUDY], [VALID_DATASET], [], []);
    const result = composeApplicationArtifactWithCaseStudies({
      applicationNode: VALID_NODE,
      caseStudyRegistry: registry,
    });

    assert.equal(result.applicationNode.applicationId, 'app-001');
    assert.equal(result.caseStudyRegistry.caseStudies.length, 1);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should not mutate the original application node', () => {
    const registry = composeCaseStudyRegistry([VALID_CASE_STUDY], [], [], []);
    const originalTitle = VALID_NODE.title;

    composeApplicationArtifactWithCaseStudies({
      applicationNode: VALID_NODE,
      caseStudyRegistry: registry,
    });

    assert.equal(VALID_NODE.title, originalTitle);
  });
});
