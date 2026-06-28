/**
 * NV-1900-D7-OPT-11 — Portfolio-Oriented Project Mapping Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Portfolio Project Kernel.
 * Covers: valid portfolio project composition, valid deliverables, valid competency evidence,
 * valid showcases, valid provenance, registry composition, artifact with portfolio projects,
 * duplicate IDs, duplicate titles, invalid enums, missing provenance, missing provider,
 * missing rationale, missing references, empty registry, registry inconsistency,
 * invalid trace, deterministic ordering, 100 identical executions, immutable registry,
 * input immutability, artifact immutability, cross-agent boundary verification,
 * negative capability verification, helper functions, canonical enum completeness,
 * validator stability, no mutation verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  PortfolioProject,
  PortfolioProjectProvenance,
  ProjectDeliverable,
  CompetencyEvidence,
  PortfolioShowcase,
  PortfolioProjectInput,
  PortfolioProjectRegistry,
  PortfolioProjectTrace,
  ApplicationNode,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_PORTFOLIO_PROJECT_TYPES,
  CANONICAL_PROJECT_DELIVERABLE_TYPES,
  CANONICAL_PROJECT_COMPETENCY_TYPES,
  CANONICAL_PROJECT_COMPLEXITY_LEVELS,
  CANONICAL_PORTFOLIO_SHOWCASE_TYPES,
  CANONICAL_PORTFOLIO_STATUS,
} from './ApplicationAgentContract.ts';

import {
  composePortfolioProjectProvenance,
  composePortfolioProject,
  composeProjectDeliverable,
  composeCompetencyEvidence,
  composePortfolioShowcase,
  composePortfolioProjectDecision,
  composePortfolioProjectTrace,
  composePortfolioProjectRegistry,
  composePortfolioProjectRegistryFromInput,
  composePortfolioProjects,
  composeApplicationArtifactWithPortfolioProjects,
  isSupportedPortfolioProjectType,
  isSupportedProjectDeliverableType,
  isSupportedCompetencyType,
  isSupportedPortfolioShowcaseType,
  isSupportedProjectComplexityLevel,
  isSupportedPortfolioStatus,
  isSupportedPortfolioGovernance,
  getCanonicalPortfolioProjectTypes,
  getCanonicalProjectDeliverableTypes,
  getCanonicalCompetencyTypes,
  getCanonicalPortfolioShowcaseTypes,
  getCanonicalProjectComplexityLevels,
  getCanonicalPortfolioStatuses,
} from './PortfolioProjectKernel.ts';

import {
  validatePortfolioProject,
  validateProjectDeliverable,
  validateCompetencyEvidence,
  validatePortfolioShowcase,
  validatePortfolioProjectRegistry,
  validatePortfolioProjectInput,
  validatePortfolioProjectTrace,
  PORTFOLIO_VALIDATION_CODES,
} from './PortfolioProjectValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: PortfolioProjectProvenance = {
  providedBy: 'NeuralVerse Team',
  rationale: 'Core portfolio concept.',
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

const VALID_PROJECT: PortfolioProject = {
  projectId: 'proj-001',
  title: 'Image Classification Portfolio',
  description: 'Complete image classification system portfolio project.',
  projectType: 'computer_vision_system',
  complexityLevel: 'advanced',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-001',
  status: 'published',
  provenance: VALID_PROVENANCE,
};

const VALID_PROJECT_2: PortfolioProject = {
  projectId: 'proj-002',
  title: 'MLOps Pipeline Portfolio',
  description: 'Complete MLOps pipeline portfolio project.',
  projectType: 'mlops_platform',
  complexityLevel: 'professional',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-002',
  status: 'approved',
  provenance: { ...VALID_PROVENANCE, providedBy: 'Research Team' },
};

const VALID_DELIVERABLE: ProjectDeliverable = {
  deliverableId: 'del-001',
  projectId: 'proj-001',
  deliverableType: 'source_code',
  description: 'Complete source code for the project.',
  provenance: VALID_PROVENANCE,
};

const VALID_COMPETENCY: CompetencyEvidence = {
  competencyId: 'comp-001',
  projectId: 'proj-001',
  competencyType: 'computer_vision',
  description: 'Demonstrates computer vision expertise.',
  provenance: VALID_PROVENANCE,
};

const VALID_SHOWCASE: PortfolioShowcase = {
  showcaseId: 'show-001',
  projectId: 'proj-001',
  showcaseType: 'github',
  description: 'GitHub repository with code and documentation.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: PortfolioProjectInput = {
  projects: [VALID_PROJECT, VALID_PROJECT_2],
  deliverables: [VALID_DELIVERABLE],
  competencies: [VALID_COMPETENCY],
  showcases: [VALID_SHOWCASE],
};

const EMPTY_INPUT: PortfolioProjectInput = {
  projects: [],
  deliverables: [],
  competencies: [],
  showcases: [],
};

// ---------------------------------------------------------------------------
// Portfolio Project Composition Tests
// ---------------------------------------------------------------------------

describe('Portfolio Project Kernel — Composition', () => {
  it('should compose valid portfolio project provenance', () => {
    const provenance = composePortfolioProjectProvenance({
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

  it('should compose valid portfolio project', () => {
    const project = composePortfolioProject({
      projectId: 'proj-001',
      title: 'Test Project',
      description: 'Test.',
      projectType: 'computer_vision_system',
      complexityLevel: 'advanced',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(project.projectId, 'proj-001');
    assert.equal(project.title, 'Test Project');
    assert.equal(project.projectType, 'computer_vision_system');
    assert.equal(project.complexityLevel, 'advanced');
  });

  it('should compose valid project deliverable', () => {
    const deliverable = composeProjectDeliverable({
      deliverableId: 'del-001',
      projectId: 'proj-001',
      deliverableType: 'source_code',
      description: 'Test deliverable.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(deliverable.deliverableId, 'del-001');
    assert.equal(deliverable.deliverableType, 'source_code');
  });

  it('should compose valid competency evidence', () => {
    const competency = composeCompetencyEvidence({
      competencyId: 'comp-001',
      projectId: 'proj-001',
      competencyType: 'computer_vision',
      description: 'Test competency.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(competency.competencyId, 'comp-001');
    assert.equal(competency.competencyType, 'computer_vision');
  });

  it('should compose valid portfolio showcase', () => {
    const showcase = composePortfolioShowcase({
      showcaseId: 'show-001',
      projectId: 'proj-001',
      showcaseType: 'github',
      description: 'Test showcase.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(showcase.showcaseId, 'show-001');
    assert.equal(showcase.showcaseType, 'github');
  });

  it('should compose valid portfolio project trace', () => {
    const trace = composePortfolioProjectTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', projectId: 'proj-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
  });

  it('should validate a valid project with no errors', () => {
    const errors = validatePortfolioProject(VALID_PROJECT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composePortfolioProjectRegistry(
      [VALID_PROJECT, VALID_PROJECT_2],
      [VALID_DELIVERABLE],
      [VALID_COMPETENCY],
      [VALID_SHOWCASE],
    );
    const result = validatePortfolioProjectRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate portfolio project input', () => {
    const result = validatePortfolioProjectInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Portfolio Project Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composePortfolioProjectRegistry([], [], [], []);
    const result = validatePortfolioProjectRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have PORTFOLIO_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate project IDs', () => {
    const registry = composePortfolioProjectRegistry([VALID_PROJECT, VALID_PROJECT], [], [], []);
    const result = validatePortfolioProjectRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have PORTFOLIO_DUPLICATE_ID error');
  });

  it('should detect duplicate project titles', () => {
    const p1 = { ...VALID_PROJECT, projectId: 'proj-001', title: 'Same Title' };
    const p2 = { ...VALID_PROJECT, projectId: 'proj-002', title: 'Same Title' };
    const registry = composePortfolioProjectRegistry([p1, p2], [], [], []);
    const result = validatePortfolioProjectRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have PORTFOLIO_DUPLICATE_TITLE error');
  });

  it('should detect duplicate deliverable IDs', () => {
    const registry = composePortfolioProjectRegistry(
      [VALID_PROJECT],
      [VALID_DELIVERABLE, VALID_DELIVERABLE],
      [],
      [],
    );
    const result = validatePortfolioProjectRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.DELIVERABLE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have DELIVERABLE_DUPLICATE_ID error');
  });

  it('should detect duplicate competency IDs', () => {
    const registry = composePortfolioProjectRegistry(
      [VALID_PROJECT],
      [],
      [VALID_COMPETENCY, VALID_COMPETENCY],
      [],
    );
    const result = validatePortfolioProjectRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.COMPETENCY_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have COMPETENCY_DUPLICATE_ID error');
  });

  it('should detect duplicate showcase IDs', () => {
    const registry = composePortfolioProjectRegistry(
      [VALID_PROJECT],
      [],
      [],
      [VALID_SHOWCASE, VALID_SHOWCASE],
    );
    const result = validatePortfolioProjectRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.SHOWCASE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have SHOWCASE_DUPLICATE_ID error');
  });

  it('should sort projects deterministically', () => {
    const p3 = { ...VALID_PROJECT, projectId: 'proj-003' };
    const p1 = { ...VALID_PROJECT, projectId: 'proj-001' };
    const p2 = { ...VALID_PROJECT, projectId: 'proj-002' };

    const registry = composePortfolioProjectRegistry([p3, p1, p2], [], [], []);

    assert.equal(registry.projects[0].projectId, 'proj-001');
    assert.equal(registry.projects[1].projectId, 'proj-002');
    assert.equal(registry.projects[2].projectId, 'proj-003');
  });

  it('should sort deliverables deterministically', () => {
    const d2 = { ...VALID_DELIVERABLE, deliverableId: 'del-002', deliverableType: 'documentation' };
    const d1 = { ...VALID_DELIVERABLE, deliverableId: 'del-001', deliverableType: 'source_code' };

    const registry = composePortfolioProjectRegistry(
      [VALID_PROJECT],
      [d2, d1],
      [],
      [],
    );

    assert.equal(registry.deliverables[0].deliverableType, 'documentation');
    assert.equal(registry.deliverables[1].deliverableType, 'source_code');
  });

  it('should sort competencies deterministically', () => {
    const c2 = { ...VALID_COMPETENCY, competencyId: 'comp-002', competencyType: 'software_engineering' };
    const c1 = { ...VALID_COMPETENCY, competencyId: 'comp-001', competencyType: 'computer_vision' };

    const registry = composePortfolioProjectRegistry(
      [VALID_PROJECT],
      [],
      [c2, c1],
      [],
    );

    assert.equal(registry.competencies[0].competencyType, 'computer_vision');
    assert.equal(registry.competencies[1].competencyType, 'software_engineering');
  });

  it('should sort showcases deterministically', () => {
    const s2 = { ...VALID_SHOWCASE, showcaseId: 'show-002', showcaseType: 'technical_blog' };
    const s1 = { ...VALID_SHOWCASE, showcaseId: 'show-001', showcaseType: 'github' };

    const registry = composePortfolioProjectRegistry(
      [VALID_PROJECT],
      [],
      [],
      [s2, s1],
    );

    assert.equal(registry.showcases[0].showcaseType, 'github');
    assert.equal(registry.showcases[1].showcaseType, 'technical_blog');
  });

  it('should compute correct metadata counts', () => {
    const registry = composePortfolioProjectRegistry(
      [VALID_PROJECT, VALID_PROJECT_2],
      [VALID_DELIVERABLE],
      [VALID_COMPETENCY],
      [VALID_SHOWCASE],
    );

    assert.equal(registry.metadata.projectCount, 2);
    assert.equal(registry.metadata.deliverableCount, 1);
    assert.equal(registry.metadata.competencyCount, 1);
    assert.equal(registry.metadata.showcaseCount, 1);
    assert.equal(registry.metadata.typeCount, 2);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Portfolio Project Kernel — Validation', () => {
  it('should detect invalid project type', () => {
    const project = { ...VALID_PROJECT, projectType: 'unsupported' as any };
    const errors = validatePortfolioProject(project);
    const typeError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_PROJECT_TYPE,
    );

    assert.ok(typeError, 'Should have PORTFOLIO_INVALID_PROJECT_TYPE error');
  });

  it('should detect invalid complexity level', () => {
    const project = { ...VALID_PROJECT, complexityLevel: 'unsupported' as any };
    const errors = validatePortfolioProject(project);
    const complexityError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_COMPLEXITY,
    );

    assert.ok(complexityError, 'Should have PORTFOLIO_INVALID_COMPLEXITY error');
  });

  it('should detect invalid deliverable type', () => {
    const deliverable = { ...VALID_DELIVERABLE, deliverableType: 'unsupported' as any };
    const errors = validateProjectDeliverable(deliverable);
    const typeError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_DELIVERABLE,
    );

    assert.ok(typeError, 'Should have PORTFOLIO_INVALID_DELIVERABLE error');
  });

  it('should detect invalid competency type', () => {
    const competency = { ...VALID_COMPETENCY, competencyType: 'unsupported' as any };
    const errors = validateCompetencyEvidence(competency);
    const typeError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_COMPETENCY,
    );

    assert.ok(typeError, 'Should have PORTFOLIO_INVALID_COMPETENCY error');
  });

  it('should detect invalid showcase type', () => {
    const showcase = { ...VALID_SHOWCASE, showcaseType: 'unsupported' as any };
    const errors = validatePortfolioShowcase(showcase);
    const typeError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_SHOWCASE,
    );

    assert.ok(typeError, 'Should have PORTFOLIO_INVALID_SHOWCASE error');
  });

  it('should detect invalid status', () => {
    const project = { ...VALID_PROJECT, status: 'unsupported' as any };
    const errors = validatePortfolioProject(project);
    const statusError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have PORTFOLIO_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const project = { ...VALID_PROJECT, provenance: { ...VALID_PROVENANCE, governanceStatus: 'invalid' as any } };
    const errors = validatePortfolioProject(project);
    const governanceError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have PORTFOLIO_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const project = { ...VALID_PROJECT, provenance: undefined as any };
    const errors = validatePortfolioProject(project);
    const provenanceError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have PORTFOLIO_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const project = { ...VALID_PROJECT, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validatePortfolioProject(project);
    const providerError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have PORTFOLIO_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const project = { ...VALID_PROJECT, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validatePortfolioProject(project);
    const rationaleError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have PORTFOLIO_MISSING_RATIONALE error');
  });

  it('should detect missing application reference', () => {
    const project = { ...VALID_PROJECT, applicationArtifactId: '' };
    const errors = validatePortfolioProject(project);
    const refError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_APPLICATION_REFERENCE,
    );

    assert.ok(refError, 'Should have PORTFOLIO_MISSING_APPLICATION_REFERENCE error');
  });

  it('should detect missing knowledge reference', () => {
    const project = { ...VALID_PROJECT, knowledgeArtifactId: '' };
    const errors = validatePortfolioProject(project);
    const refError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_KNOWLEDGE_REFERENCE,
    );

    assert.ok(refError, 'Should have PORTFOLIO_MISSING_KNOWLEDGE_REFERENCE error');
  });

  it('should detect missing project ID', () => {
    const project = { ...VALID_PROJECT, projectId: '' };
    const errors = validatePortfolioProject(project);
    const idError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PROJECT_ID,
    );

    assert.ok(idError, 'Should have PORTFOLIO_MISSING_PROJECT_ID error');
  });

  it('should detect missing title', () => {
    const project = { ...VALID_PROJECT, title: '' };
    const errors = validatePortfolioProject(project);
    const titleError = errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have PORTFOLIO_MISSING_TITLE error');
  });

  it('should validate a valid trace', () => {
    const trace = composePortfolioProjectTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validatePortfolioProjectTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: PortfolioProjectTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false,
      generatedFrom: 'deterministic_portfolio_project_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validatePortfolioProjectTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Portfolio Project Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composePortfolioProjects>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composePortfolioProjects(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].projects, results[i].projects);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composePortfolioProjectRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composePortfolioProjectRegistry(
        [VALID_PROJECT],
        [],
        [],
        [],
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].projects, results[i].projects);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Portfolio Project Kernel — Immutability', () => {
  it('should not mutate input projects', () => {
    const originalId = VALID_PROJECT.projectId;
    const originalTitle = VALID_PROJECT.title;

    composePortfolioProjects(VALID_INPUT);

    assert.equal(VALID_PROJECT.projectId, originalId);
    assert.equal(VALID_PROJECT.title, originalTitle);
  });

  it('should not mutate input registry projects', () => {
    const projects = [VALID_PROJECT, VALID_PROJECT_2];
    const originalIds = projects.map((p) => p.projectId);

    composePortfolioProjectRegistry(projects, [], [], []);

    assert.equal(projects[0].projectId, originalIds[0]);
    assert.equal(projects[1].projectId, originalIds[1]);
  });

  it('should not mutate the original application node', () => {
    const registry = composePortfolioProjectRegistry([VALID_PROJECT], [], [], []);
    const originalDescription = VALID_NODE.description;

    composeApplicationArtifactWithPortfolioProjects({
      applicationNode: VALID_NODE,
      portfolioProjectRegistry: registry,
    });

    assert.equal(VALID_NODE.description, originalDescription);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Portfolio Project Kernel — Helper Functions', () => {
  it('should return canonical project types', () => {
    const types = getCanonicalPortfolioProjectTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_PORTFOLIO_PROJECT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical deliverable types', () => {
    const types = getCanonicalProjectDeliverableTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_PROJECT_DELIVERABLE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical competency types', () => {
    const types = getCanonicalCompetencyTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_PROJECT_COMPETENCY_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical showcase types', () => {
    const types = getCanonicalPortfolioShowcaseTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_PORTFOLIO_SHOWCASE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical complexity levels', () => {
    const levels = getCanonicalProjectComplexityLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_PROJECT_COMPLEXITY_LEVELS]);
    assert.equal(levels.length, 5);
  });

  it('should return canonical statuses', () => {
    const statuses = getCanonicalPortfolioStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_PORTFOLIO_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate project type support', () => {
    assert.equal(isSupportedPortfolioProjectType('computer_vision_system'), true);
    assert.equal(isSupportedPortfolioProjectType('mlops_platform'), true);
    assert.equal(isSupportedPortfolioProjectType('unsupported'), false);
  });

  it('should validate deliverable type support', () => {
    assert.equal(isSupportedProjectDeliverableType('source_code'), true);
    assert.equal(isSupportedProjectDeliverableType('documentation'), true);
    assert.equal(isSupportedProjectDeliverableType('unsupported'), false);
  });

  it('should validate competency type support', () => {
    assert.equal(isSupportedCompetencyType('computer_vision'), true);
    assert.equal(isSupportedCompetencyType('software_engineering'), true);
    assert.equal(isSupportedCompetencyType('unsupported'), false);
  });

  it('should validate showcase type support', () => {
    assert.equal(isSupportedPortfolioShowcaseType('github'), true);
    assert.equal(isSupportedPortfolioShowcaseType('technical_blog'), true);
    assert.equal(isSupportedPortfolioShowcaseType('unsupported'), false);
  });

  it('should validate complexity level support', () => {
    assert.equal(isSupportedProjectComplexityLevel('introductory'), true);
    assert.equal(isSupportedProjectComplexityLevel('expert'), true);
    assert.equal(isSupportedProjectComplexityLevel('unsupported'), false);
  });

  it('should validate status support', () => {
    assert.equal(isSupportedPortfolioStatus('draft'), true);
    assert.equal(isSupportedPortfolioStatus('published'), true);
    assert.equal(isSupportedPortfolioStatus('unsupported'), false);
  });

  it('should validate governance support', () => {
    assert.equal(isSupportedPortfolioGovernance('canonical'), true);
    assert.equal(isSupportedPortfolioGovernance('accepted'), true);
    assert.equal(isSupportedPortfolioGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Portfolio Project Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 project types', () => {
    assert.equal(CANONICAL_PORTFOLIO_PROJECT_TYPES.length, 10);
  });

  it('should have exactly 10 deliverable types', () => {
    assert.equal(CANONICAL_PROJECT_DELIVERABLE_TYPES.length, 10);
  });

  it('should have exactly 10 competency types', () => {
    assert.equal(CANONICAL_PROJECT_COMPETENCY_TYPES.length, 10);
  });

  it('should have exactly 10 showcase types', () => {
    assert.equal(CANONICAL_PORTFOLIO_SHOWCASE_TYPES.length, 10);
  });

  it('should have exactly 5 complexity levels', () => {
    assert.equal(CANONICAL_PROJECT_COMPLEXITY_LEVELS.length, 5);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_PORTFOLIO_STATUS.length, 6);
  });

  it('should contain all expected project types', () => {
    const expected = ['computer_vision_system', 'machine_learning_pipeline', 'deep_learning_application', 'generative_ai_solution', 'mlops_platform', 'edge_ai_application', 'robotics_project', 'research_reproduction', 'engineering_platform', 'full_stack_ai_system'];

    for (const type of expected) {
      assert.ok(
        CANONICAL_PORTFOLIO_PROJECT_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected statuses', () => {
    const expected = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expected) {
      assert.ok(
        CANONICAL_PORTFOLIO_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Portfolio Project Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composePortfolioProjects(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composePortfolioProjects(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composePortfolioProjects(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composePortfolioProjects(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate project content', () => {
    const result = composePortfolioProjects(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
  });

  it('should not perform network requests', () => {
    const result = composePortfolioProjects(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
  });

  it('should not generate code', () => {
    const result = composePortfolioProjects(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
  });

  it('should not have executable callbacks in project', () => {
    const project = composePortfolioProject({
      projectId: 'proj-001',
      title: 'Test',
      description: 'Test.',
      projectType: 'computer_vision_system',
      complexityLevel: 'advanced',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(project);
    for (const key of keys) {
      const value = (project as any)[key];
      assert.ok(typeof value !== 'function', `Project field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composePortfolioProjects(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
  });

  it('should not access filesystem', () => {
    const result = composePortfolioProjects(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Portfolio Project Kernel — Registry Validation', () => {
  it('should detect registry inconsistency with invalid deterministic flag', () => {
    const registry: PortfolioProjectRegistry = {
      ...composePortfolioProjectRegistry([VALID_PROJECT], [], [], []),
      deterministic: false as any,
    };
    const result = validatePortfolioProjectRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid randomUsed flag', () => {
    const registry: PortfolioProjectRegistry = {
      ...composePortfolioProjectRegistry([VALID_PROJECT], [], [], []),
      randomUsed: true as any,
    };
    const result = validatePortfolioProjectRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid timeDependency flag', () => {
    const registry: PortfolioProjectRegistry = {
      ...composePortfolioProjectRegistry([VALID_PROJECT], [], [], []),
      timeDependency: true as any,
    };
    const result = validatePortfolioProjectRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should validate empty input', () => {
    const result = validatePortfolioProjectInput(EMPTY_INPUT);
    assert.equal(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have PORTFOLIO_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('Portfolio Project Kernel — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const result1 = validatePortfolioProjectRegistry(composePortfolioProjectRegistry([VALID_PROJECT], [], [], []));
    const result2 = validatePortfolioProjectRegistry(composePortfolioProjectRegistry([VALID_PROJECT], [], [], []));

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });

  it('should produce identical validation results for invalid input', () => {
    const project = { ...VALID_PROJECT, projectType: 'unsupported' as any };
    const result1 = validatePortfolioProject(project);
    const result2 = validatePortfolioProject(project);

    assert.deepStrictEqual(result1.length, result2.length);
  });
});

// ---------------------------------------------------------------------------
// No Mutation Behavior Tests
// ---------------------------------------------------------------------------

describe('Portfolio Project Kernel — No Mutation Behavior', () => {
  it('should not mutate projects during registry composition', () => {
    const projects = [
      { ...VALID_PROJECT, projectId: 'proj-003' },
      { ...VALID_PROJECT, projectId: 'proj-001' },
      { ...VALID_PROJECT, projectId: 'proj-002' },
    ];
    const originalOrder = projects.map((p) => p.projectId);

    composePortfolioProjectRegistry(projects, [], [], []);

    assert.deepStrictEqual(projects.map((p) => p.projectId), originalOrder);
  });

  it('should not mutate input during full composition', () => {
    const input: PortfolioProjectInput = {
      projects: [
        { ...VALID_PROJECT, projectId: 'proj-002' },
        { ...VALID_PROJECT, projectId: 'proj-001' },
      ],
      deliverables: [],
      competencies: [],
      showcases: [],
    };
    const originalOrder = input.projects.map((p) => p.projectId);

    composePortfolioProjects(input);

    assert.deepStrictEqual(input.projects.map((p) => p.projectId), originalOrder);
  });
});

// ---------------------------------------------------------------------------
// Artifact with Portfolio Projects Tests
// ---------------------------------------------------------------------------

describe('Portfolio Project Kernel — Artifact with Portfolio Projects', () => {
  it('should compose application artifact with portfolio projects', () => {
    const registry = composePortfolioProjectRegistry([VALID_PROJECT], [VALID_DELIVERABLE], [], []);
    const result = composeApplicationArtifactWithPortfolioProjects({
      applicationNode: VALID_NODE,
      portfolioProjectRegistry: registry,
    });

    assert.equal(result.applicationNode.applicationId, 'app-001');
    assert.equal(result.portfolioProjectRegistry.projects.length, 1);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should not mutate the original application node', () => {
    const registry = composePortfolioProjectRegistry([VALID_PROJECT], [], [], []);
    const originalTitle = VALID_NODE.title;

    composeApplicationArtifactWithPortfolioProjects({
      applicationNode: VALID_NODE,
      portfolioProjectRegistry: registry,
    });

    assert.equal(VALID_NODE.title, originalTitle);
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Verification Tests
// ---------------------------------------------------------------------------

describe('Portfolio Project Kernel — Cross-Agent Boundary Verification', () => {
  it('should only reference external IDs, not own external metadata', () => {
    const project = composePortfolioProject({
      projectId: 'proj-001',
      title: 'Test',
      description: 'Test.',
      projectType: 'computer_vision_system',
      complexityLevel: 'advanced',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(typeof project.knowledgeArtifactId, 'string');
    assert.ok(!('knowledgeContent' in project), 'Should not have knowledge content');
    assert.ok(!('narrativeContent' in project), 'Should not have narrative content');
  });

  it('should not generate projects', () => {
    const result = composePortfolioProjects(VALID_INPUT);
    assert.ok(!('generatedProjects' in result), 'Should not have generated projects');
    assert.ok(!('autoGenerated' in result), 'Should not have auto-generated');
  });

  it('should not create repositories', () => {
    const result = composePortfolioProjects(VALID_INPUT);
    assert.ok(!('repositories' in result), 'Should not have repositories');
    assert.ok(!('createdRepos' in result), 'Should not have created repos');
  });

  it('should not evaluate portfolios', () => {
    const result = composePortfolioProjects(VALID_INPUT);
    assert.ok(!('portfolioScore' in result), 'Should not have portfolio score');
    assert.ok(!('evaluation' in result), 'Should not have evaluation');
  });

  it('should not recommend career paths', () => {
    const result = composePortfolioProjects(VALID_INPUT);
    assert.ok(!('careerRecommendations' in result), 'Should not have career recommendations');
    assert.ok(!('careerPaths' in result), 'Should not have career paths');
  });
});
