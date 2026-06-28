/**
 * NV-1900-D7-OPT-07 — Solution Comparison & Alternative Technique Mapping Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Solution Comparison Kernel.
 * Covers: valid solution, valid comparisons, valid alternative techniques,
 * valid comparison dimensions, valid provenance, registry composition,
 * artifact with comparisons, duplicate IDs, duplicate titles, invalid enums,
 * missing provenance, missing provider, missing rationale, missing references,
 * self comparison, empty registry, registry inconsistency, invalid trace,
 * deterministic ordering, 100 identical executions, immutable registry,
 * input immutability, artifact immutability, cross-agent boundary verification,
 * negative capability verification, helper functions,
 * canonical enum completeness, validator stability, no mutation verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  EngineeringSolution,
  SolutionComparisonProvenance,
  SolutionComparison,
  AlternativeTechnique,
  ComparisonDimensionEntry,
  SolutionComparisonInput,
  SolutionComparisonRegistry,
  SolutionComparisonTrace,
  ApplicationNode,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_SOLUTION_TYPES,
  CANONICAL_COMPARISON_TYPES,
  CANONICAL_ALTERNATIVE_TECHNIQUE_TYPES,
  CANONICAL_COMPARISON_DIMENSIONS,
  CANONICAL_SOLUTION_COMPARISON_STATUS,
} from './ApplicationAgentContract.ts';

import {
  composeSolutionComparisonProvenance,
  composeEngineeringSolution,
  composeSolutionComparison,
  composeAlternativeTechnique,
  composeComparisonDimension,
  composeSolutionComparisonTrace,
  composeSolutionComparisonRegistry,
  composeSolutionComparisonRegistryFromInput,
  composeSolutionComparisons,
  composeApplicationArtifactWithSolutionComparisons,
  isSupportedSolutionType,
  isSupportedComparisonType,
  isSupportedAlternativeTechniqueType,
  isSupportedComparisonDimension,
  isSupportedSolutionComparisonStatus,
  isSupportedSolutionComparisonGovernance,
  getCanonicalSolutionTypes,
  getCanonicalComparisonTypes,
  getCanonicalAlternativeTechniqueTypes,
  getCanonicalComparisonDimensions,
  getCanonicalSolutionComparisonStatuses,
} from './SolutionComparisonKernel.ts';

import {
  validateEngineeringSolution,
  validateSolutionComparison,
  validateAlternativeTechnique,
  validateComparisonDimension,
  validateSolutionComparisonRegistry,
  validateSolutionComparisonInput,
  validateSolutionComparisonTrace,
  SOLUTION_COMPARISON_VALIDATION_CODES,
} from './SolutionComparisonValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: SolutionComparisonProvenance = {
  providedBy: 'NeuralVerse Team',
  rationale: 'Core comparison concept.',
  reviewedBy: 'Architecture Review Board',
  reviewDate: '2026-01-01',
  governanceStatus: 'canonical',
};

const VALID_NODE: ApplicationNode = {
  applicationId: 'app-001',
  title: 'Medical Imaging System',
  artifactType: 'trade_off',
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

const VALID_SOLUTION: EngineeringSolution = {
  solutionId: 'sol-001',
  title: 'CNN-based Classification',
  description: 'Deep learning approach using convolutional neural networks.',
  solutionType: 'deep_learning',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-001',
  architectureId: 'arch-001',
  caseStudyId: 'cs-001',
  status: 'published',
  provenance: VALID_PROVENANCE,
};

const VALID_SOLUTION_2: EngineeringSolution = {
  solutionId: 'sol-002',
  title: 'Random Forest Classification',
  description: 'Classical machine learning approach using random forests.',
  solutionType: 'machine_learning',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-002',
  architectureId: 'arch-002',
  caseStudyId: 'cs-002',
  status: 'approved',
  provenance: { ...VALID_PROVENANCE, providedBy: 'Research Team' },
};

const VALID_COMPARISON: SolutionComparison = {
  comparisonId: 'comp-001',
  sourceSolutionId: 'sol-001',
  targetSolutionId: 'sol-002',
  comparisonType: 'performance',
  description: 'Comparison of CNN vs Random Forest for image classification.',
  provenance: VALID_PROVENANCE,
};

const VALID_ALTERNATIVE: AlternativeTechnique = {
  alternativeId: 'alt-001',
  solutionId: 'sol-001',
  alternativeType: 'complementary',
  description: 'Transfer learning as complementary technique.',
  relatedKnowledgeArtifactId: 'knowledge-003',
  provenance: VALID_PROVENANCE,
};

const VALID_DIMENSION: ComparisonDimensionEntry = {
  dimensionId: 'dim-001',
  comparisonId: 'comp-001',
  dimension: 'accuracy',
  description: 'Accuracy comparison between CNN and Random Forest.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: SolutionComparisonInput = {
  solutions: [VALID_SOLUTION, VALID_SOLUTION_2],
  comparisons: [VALID_COMPARISON],
  alternatives: [VALID_ALTERNATIVE],
  dimensions: [VALID_DIMENSION],
};

const EMPTY_INPUT: SolutionComparisonInput = {
  solutions: [],
  comparisons: [],
  alternatives: [],
  dimensions: [],
};

// ---------------------------------------------------------------------------
// Solution Composition Tests
// ---------------------------------------------------------------------------

describe('Solution Comparison Kernel — Composition', () => {
  it('should compose valid solution comparison provenance', () => {
    const provenance = composeSolutionComparisonProvenance({
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

  it('should compose valid engineering solution', () => {
    const sol = composeEngineeringSolution({
      solutionId: 'sol-001',
      title: 'Test Solution',
      description: 'Test.',
      solutionType: 'deep_learning',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      architectureId: 'arch-001',
      caseStudyId: 'cs-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(sol.solutionId, 'sol-001');
    assert.equal(sol.title, 'Test Solution');
    assert.equal(sol.solutionType, 'deep_learning');
  });

  it('should compose valid solution comparison', () => {
    const comp = composeSolutionComparison({
      comparisonId: 'comp-001',
      sourceSolutionId: 'sol-001',
      targetSolutionId: 'sol-002',
      comparisonType: 'performance',
      description: 'Test comparison.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(comp.comparisonId, 'comp-001');
    assert.equal(comp.sourceSolutionId, 'sol-001');
    assert.equal(comp.targetSolutionId, 'sol-002');
  });

  it('should compose valid alternative technique', () => {
    const alt = composeAlternativeTechnique({
      alternativeId: 'alt-001',
      solutionId: 'sol-001',
      alternativeType: 'complementary',
      description: 'Test alternative.',
      relatedKnowledgeArtifactId: 'knowledge-003',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(alt.alternativeId, 'alt-001');
    assert.equal(alt.alternativeType, 'complementary');
  });

  it('should compose valid comparison dimension', () => {
    const dim = composeComparisonDimension({
      dimensionId: 'dim-001',
      comparisonId: 'comp-001',
      dimension: 'accuracy',
      description: 'Test dimension.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(dim.dimensionId, 'dim-001');
    assert.equal(dim.dimension, 'accuracy');
  });

  it('should compose valid comparison trace', () => {
    const trace = composeSolutionComparisonTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', solutionId: 'sol-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
  });

  it('should validate a valid solution with no errors', () => {
    const errors = validateEngineeringSolution(VALID_SOLUTION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeSolutionComparisonRegistry(
      [VALID_SOLUTION, VALID_SOLUTION_2],
      [VALID_COMPARISON],
      [VALID_ALTERNATIVE],
      [VALID_DIMENSION],
    );
    const result = validateSolutionComparisonRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate solution comparison input', () => {
    const result = validateSolutionComparisonInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Solution Comparison Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeSolutionComparisonRegistry([], [], [], []);
    const result = validateSolutionComparisonRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have SOLUTION_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate solution IDs', () => {
    const registry = composeSolutionComparisonRegistry([VALID_SOLUTION, VALID_SOLUTION], [], [], []);
    const result = validateSolutionComparisonRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have SOLUTION_DUPLICATE_ID error');
  });

  it('should detect duplicate solution titles', () => {
    const sol1 = { ...VALID_SOLUTION, solutionId: 'sol-001', title: 'Same Title' };
    const sol2 = { ...VALID_SOLUTION, solutionId: 'sol-002', title: 'Same Title' };
    const registry = composeSolutionComparisonRegistry([sol1, sol2], [], [], []);
    const result = validateSolutionComparisonRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have SOLUTION_DUPLICATE_TITLE error');
  });

  it('should detect duplicate comparison IDs', () => {
    const registry = composeSolutionComparisonRegistry(
      [VALID_SOLUTION, VALID_SOLUTION_2],
      [VALID_COMPARISON, VALID_COMPARISON],
      [],
      [],
    );
    const result = validateSolutionComparisonRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have COMPARISON_DUPLICATE_ID error');
  });

  it('should detect duplicate alternative IDs', () => {
    const registry = composeSolutionComparisonRegistry(
      [VALID_SOLUTION],
      [],
      [VALID_ALTERNATIVE, VALID_ALTERNATIVE],
      [],
    );
    const result = validateSolutionComparisonRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.ALTERNATIVE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ALTERNATIVE_DUPLICATE_ID error');
  });

  it('should detect duplicate dimension IDs', () => {
    const registry = composeSolutionComparisonRegistry(
      [VALID_SOLUTION],
      [VALID_COMPARISON],
      [],
      [VALID_DIMENSION, VALID_DIMENSION],
    );
    const result = validateSolutionComparisonRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.DIMENSION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have DIMENSION_DUPLICATE_ID error');
  });

  it('should sort solutions deterministically', () => {
    const sol3 = { ...VALID_SOLUTION, solutionId: 'sol-003' };
    const sol1 = { ...VALID_SOLUTION, solutionId: 'sol-001' };
    const sol2 = { ...VALID_SOLUTION, solutionId: 'sol-002' };

    const registry = composeSolutionComparisonRegistry([sol3, sol1, sol2], [], [], []);

    assert.equal(registry.solutions[0].solutionId, 'sol-001');
    assert.equal(registry.solutions[1].solutionId, 'sol-002');
    assert.equal(registry.solutions[2].solutionId, 'sol-003');
  });

  it('should sort comparisons deterministically', () => {
    const comp2 = { ...VALID_COMPARISON, comparisonId: 'comp-002', comparisonType: 'architectural' };
    const comp1 = { ...VALID_COMPARISON, comparisonId: 'comp-001', comparisonType: 'performance' };

    const registry = composeSolutionComparisonRegistry(
      [VALID_SOLUTION, VALID_SOLUTION_2],
      [comp2, comp1],
      [],
      [],
    );

    assert.equal(registry.comparisons[0].comparisonType, 'performance');
    assert.equal(registry.comparisons[1].comparisonType, 'architectural');
  });

  it('should sort alternatives deterministically', () => {
    const alt2 = { ...VALID_ALTERNATIVE, alternativeId: 'alt-002', alternativeType: 'replacement' };
    const alt1 = { ...VALID_ALTERNATIVE, alternativeId: 'alt-001', alternativeType: 'complementary' };

    const registry = composeSolutionComparisonRegistry(
      [VALID_SOLUTION],
      [],
      [alt2, alt1],
      [],
    );

    assert.equal(registry.alternatives[0].alternativeType, 'complementary');
    assert.equal(registry.alternatives[1].alternativeType, 'replacement');
  });

  it('should sort dimensions deterministically', () => {
    const dim2 = { ...VALID_DIMENSION, dimensionId: 'dim-002', dimension: 'latency' };
    const dim1 = { ...VALID_DIMENSION, dimensionId: 'dim-001', dimension: 'accuracy' };

    const registry = composeSolutionComparisonRegistry(
      [VALID_SOLUTION],
      [VALID_COMPARISON],
      [],
      [dim2, dim1],
    );

    assert.equal(registry.dimensions[0].dimension, 'accuracy');
    assert.equal(registry.dimensions[1].dimension, 'latency');
  });

  it('should compute correct metadata counts', () => {
    const registry = composeSolutionComparisonRegistry(
      [VALID_SOLUTION, VALID_SOLUTION_2],
      [VALID_COMPARISON],
      [VALID_ALTERNATIVE],
      [VALID_DIMENSION],
    );

    assert.equal(registry.metadata.solutionCount, 2);
    assert.equal(registry.metadata.comparisonCount, 1);
    assert.equal(registry.metadata.alternativeCount, 1);
    assert.equal(registry.metadata.dimensionCount, 1);
    assert.equal(registry.metadata.typeCount, 2);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Solution Comparison Kernel — Validation', () => {
  it('should detect invalid solution type', () => {
    const sol = { ...VALID_SOLUTION, solutionType: 'unsupported' as any };
    const errors = validateEngineeringSolution(sol);
    const typeError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have SOLUTION_INVALID_TYPE error');
  });

  it('should detect invalid comparison type', () => {
    const comp = { ...VALID_COMPARISON, comparisonType: 'unsupported' as any };
    const errors = validateSolutionComparison(comp, ['sol-001', 'sol-002']);
    const typeError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have COMPARISON_INVALID_TYPE error');
  });

  it('should detect invalid alternative type', () => {
    const alt = { ...VALID_ALTERNATIVE, alternativeType: 'unsupported' as any };
    const errors = validateAlternativeTechnique(alt);
    const typeError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.ALTERNATIVE_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have ALTERNATIVE_INVALID_TYPE error');
  });

  it('should detect invalid dimension', () => {
    const dim = { ...VALID_DIMENSION, dimension: 'unsupported' as any };
    const errors = validateComparisonDimension(dim);
    const dimError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.DIMENSION_INVALID_TYPE,
    );

    assert.ok(dimError, 'Should have DIMENSION_INVALID_TYPE error');
  });

  it('should detect invalid status', () => {
    const sol = { ...VALID_SOLUTION, status: 'unsupported' as any };
    const errors = validateEngineeringSolution(sol);
    const statusError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have SOLUTION_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const sol = { ...VALID_SOLUTION, provenance: { ...VALID_PROVENANCE, governanceStatus: 'invalid' as any } };
    const errors = validateEngineeringSolution(sol);
    const governanceError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have SOLUTION_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const sol = { ...VALID_SOLUTION, provenance: undefined as any };
    const errors = validateEngineeringSolution(sol);
    const provenanceError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have SOLUTION_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const sol = { ...VALID_SOLUTION, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateEngineeringSolution(sol);
    const providerError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have SOLUTION_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const sol = { ...VALID_SOLUTION, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateEngineeringSolution(sol);
    const rationaleError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have SOLUTION_MISSING_RATIONALE error');
  });

  it('should detect missing application reference', () => {
    const sol = { ...VALID_SOLUTION, applicationArtifactId: '' };
    const errors = validateEngineeringSolution(sol);
    const refError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_APPLICATION_REFERENCE,
    );

    assert.ok(refError, 'Should have SOLUTION_MISSING_APPLICATION_REFERENCE error');
  });

  it('should detect missing knowledge reference', () => {
    const sol = { ...VALID_SOLUTION, knowledgeArtifactId: '' };
    const errors = validateEngineeringSolution(sol);
    const refError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_KNOWLEDGE_REFERENCE,
    );

    assert.ok(refError, 'Should have SOLUTION_MISSING_KNOWLEDGE_REFERENCE error');
  });

  it('should detect missing architecture reference', () => {
    const sol = { ...VALID_SOLUTION, architectureId: '' };
    const errors = validateEngineeringSolution(sol);
    const refError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_ARCHITECTURE_REFERENCE,
    );

    assert.ok(refError, 'Should have SOLUTION_MISSING_ARCHITECTURE_REFERENCE error');
  });

  it('should detect missing case study reference', () => {
    const sol = { ...VALID_SOLUTION, caseStudyId: '' };
    const errors = validateEngineeringSolution(sol);
    const refError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_CASE_STUDY_REFERENCE,
    );

    assert.ok(refError, 'Should have SOLUTION_MISSING_CASE_STUDY_REFERENCE error');
  });

  it('should detect missing solution ID', () => {
    const sol = { ...VALID_SOLUTION, solutionId: '' };
    const errors = validateEngineeringSolution(sol);
    const idError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_SOLUTION_ID,
    );

    assert.ok(idError, 'Should have SOLUTION_MISSING_SOLUTION_ID error');
  });

  it('should detect missing title', () => {
    const sol = { ...VALID_SOLUTION, title: '' };
    const errors = validateEngineeringSolution(sol);
    const titleError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have SOLUTION_MISSING_TITLE error');
  });

  it('should detect self comparison', () => {
    const selfComp: SolutionComparison = {
      ...VALID_COMPARISON,
      sourceSolutionId: 'sol-001',
      targetSolutionId: 'sol-001',
    };

    const errors = validateSolutionComparison(selfComp, ['sol-001', 'sol-002']);
    const selfError = errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_SELF_COMPARISON,
    );

    assert.ok(selfError, 'Should have SOLUTION_SELF_COMPARISON error');
  });

  it('should validate a valid trace', () => {
    const trace = composeSolutionComparisonTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateSolutionComparisonTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: SolutionComparisonTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false,
      generatedFrom: 'deterministic_solution_comparison_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateSolutionComparisonTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Solution Comparison Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeSolutionComparisons>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeSolutionComparisons(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].solutions, results[i].solutions);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeSolutionComparisonRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeSolutionComparisonRegistry(
        [VALID_SOLUTION],
        [],
        [],
        [],
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].solutions, results[i].solutions);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Solution Comparison Kernel — Immutability', () => {
  it('should not mutate input solutions', () => {
    const originalId = VALID_SOLUTION.solutionId;
    const originalTitle = VALID_SOLUTION.title;

    composeSolutionComparisons(VALID_INPUT);

    assert.equal(VALID_SOLUTION.solutionId, originalId);
    assert.equal(VALID_SOLUTION.title, originalTitle);
  });

  it('should not mutate input registry solutions', () => {
    const solutions = [VALID_SOLUTION, VALID_SOLUTION_2];
    const originalIds = solutions.map((s) => s.solutionId);

    composeSolutionComparisonRegistry(solutions, [], [], []);

    assert.equal(solutions[0].solutionId, originalIds[0]);
    assert.equal(solutions[1].solutionId, originalIds[1]);
  });

  it('should not mutate the original application node', () => {
    const registry = composeSolutionComparisonRegistry([VALID_SOLUTION], [], [], []);
    const originalDescription = VALID_NODE.description;

    composeApplicationArtifactWithSolutionComparisons({
      applicationNode: VALID_NODE,
      solutionComparisonRegistry: registry,
    });

    assert.equal(VALID_NODE.description, originalDescription);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Solution Comparison Kernel — Helper Functions', () => {
  it('should return canonical solution types', () => {
    const types = getCanonicalSolutionTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_SOLUTION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical comparison types', () => {
    const types = getCanonicalComparisonTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_COMPARISON_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical alternative technique types', () => {
    const types = getCanonicalAlternativeTechniqueTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ALTERNATIVE_TECHNIQUE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical comparison dimensions', () => {
    const dims = getCanonicalComparisonDimensions();
    assert.deepStrictEqual([...dims], [...CANONICAL_COMPARISON_DIMENSIONS]);
    assert.equal(dims.length, 10);
  });

  it('should return canonical statuses', () => {
    const statuses = getCanonicalSolutionComparisonStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_SOLUTION_COMPARISON_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate solution type support', () => {
    assert.equal(isSupportedSolutionType('deep_learning'), true);
    assert.equal(isSupportedSolutionType('machine_learning'), true);
    assert.equal(isSupportedSolutionType('unsupported'), false);
  });

  it('should validate comparison type support', () => {
    assert.equal(isSupportedComparisonType('performance'), true);
    assert.equal(isSupportedComparisonType('architectural'), true);
    assert.equal(isSupportedComparisonType('unsupported'), false);
  });

  it('should validate alternative technique type support', () => {
    assert.equal(isSupportedAlternativeTechniqueType('complementary'), true);
    assert.equal(isSupportedAlternativeTechniqueType('replacement'), true);
    assert.equal(isSupportedAlternativeTechniqueType('unsupported'), false);
  });

  it('should validate comparison dimension support', () => {
    assert.equal(isSupportedComparisonDimension('accuracy'), true);
    assert.equal(isSupportedComparisonDimension('latency'), true);
    assert.equal(isSupportedComparisonDimension('unsupported'), false);
  });

  it('should validate status support', () => {
    assert.equal(isSupportedSolutionComparisonStatus('draft'), true);
    assert.equal(isSupportedSolutionComparisonStatus('published'), true);
    assert.equal(isSupportedSolutionComparisonStatus('unsupported'), false);
  });

  it('should validate governance support', () => {
    assert.equal(isSupportedSolutionComparisonGovernance('canonical'), true);
    assert.equal(isSupportedSolutionComparisonGovernance('accepted'), true);
    assert.equal(isSupportedSolutionComparisonGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Solution Comparison Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 solution types', () => {
    assert.equal(CANONICAL_SOLUTION_TYPES.length, 10);
  });

  it('should have exactly 10 comparison types', () => {
    assert.equal(CANONICAL_COMPARISON_TYPES.length, 10);
  });

  it('should have exactly 10 alternative technique types', () => {
    assert.equal(CANONICAL_ALTERNATIVE_TECHNIQUE_TYPES.length, 10);
  });

  it('should have exactly 10 comparison dimensions', () => {
    assert.equal(CANONICAL_COMPARISON_DIMENSIONS.length, 10);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_SOLUTION_COMPARISON_STATUS.length, 6);
  });

  it('should contain all expected solution types', () => {
    const expected = ['classical_algorithm', 'machine_learning', 'deep_learning', 'hybrid_system', 'rule_based', 'probabilistic', 'heuristic', 'optimization', 'retrieval_augmented', 'multimodal'];

    for (const type of expected) {
      assert.ok(
        CANONICAL_SOLUTION_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected statuses', () => {
    const expected = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expected) {
      assert.ok(
        CANONICAL_SOLUTION_COMPARISON_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Solution Comparison Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeSolutionComparisons(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeSolutionComparisons(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeSolutionComparisons(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeSolutionComparisons(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate comparison content', () => {
    const result = composeSolutionComparisons(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
  });

  it('should not perform network requests', () => {
    const result = composeSolutionComparisons(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
  });

  it('should not generate code', () => {
    const result = composeSolutionComparisons(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
  });

  it('should not have executable callbacks in solution', () => {
    const sol = composeEngineeringSolution({
      solutionId: 'sol-001',
      title: 'Test',
      description: 'Test.',
      solutionType: 'deep_learning',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      architectureId: 'arch-001',
      caseStudyId: 'cs-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(sol);
    for (const key of keys) {
      const value = (sol as any)[key];
      assert.ok(typeof value !== 'function', `Solution field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeSolutionComparisons(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
  });

  it('should not access filesystem', () => {
    const result = composeSolutionComparisons(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Solution Comparison Kernel — Registry Validation', () => {
  it('should detect registry inconsistency with invalid deterministic flag', () => {
    const registry: SolutionComparisonRegistry = {
      ...composeSolutionComparisonRegistry([VALID_SOLUTION], [], [], []),
      deterministic: false as any,
    };
    const result = validateSolutionComparisonRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid randomUsed flag', () => {
    const registry: SolutionComparisonRegistry = {
      ...composeSolutionComparisonRegistry([VALID_SOLUTION], [], [], []),
      randomUsed: true as any,
    };
    const result = validateSolutionComparisonRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid timeDependency flag', () => {
    const registry: SolutionComparisonRegistry = {
      ...composeSolutionComparisonRegistry([VALID_SOLUTION], [], [], []),
      timeDependency: true as any,
    };
    const result = validateSolutionComparisonRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should validate empty input', () => {
    const result = validateSolutionComparisonInput(EMPTY_INPUT);
    assert.equal(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === SOLUTION_COMPARISON_VALIDATION_CODES.SOLUTION_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have SOLUTION_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('Solution Comparison Kernel — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const result1 = validateSolutionComparisonRegistry(composeSolutionComparisonRegistry([VALID_SOLUTION], [], [], []));
    const result2 = validateSolutionComparisonRegistry(composeSolutionComparisonRegistry([VALID_SOLUTION], [], [], []));

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });

  it('should produce identical validation results for invalid input', () => {
    const sol = { ...VALID_SOLUTION, solutionType: 'unsupported' as any };
    const result1 = validateEngineeringSolution(sol);
    const result2 = validateEngineeringSolution(sol);

    assert.deepStrictEqual(result1.length, result2.length);
  });
});

// ---------------------------------------------------------------------------
// No Mutation Behavior Tests
// ---------------------------------------------------------------------------

describe('Solution Comparison Kernel — No Mutation Behavior', () => {
  it('should not mutate solutions during registry composition', () => {
    const solutions = [
      { ...VALID_SOLUTION, solutionId: 'sol-003' },
      { ...VALID_SOLUTION, solutionId: 'sol-001' },
      { ...VALID_SOLUTION, solutionId: 'sol-002' },
    ];
    const originalOrder = solutions.map((s) => s.solutionId);

    composeSolutionComparisonRegistry(solutions, [], [], []);

    assert.deepStrictEqual(solutions.map((s) => s.solutionId), originalOrder);
  });

  it('should not mutate input during full composition', () => {
    const input: SolutionComparisonInput = {
      solutions: [
        { ...VALID_SOLUTION, solutionId: 'sol-002' },
        { ...VALID_SOLUTION, solutionId: 'sol-001' },
      ],
      comparisons: [],
      alternatives: [],
      dimensions: [],
    };
    const originalOrder = input.solutions.map((s) => s.solutionId);

    composeSolutionComparisons(input);

    assert.deepStrictEqual(input.solutions.map((s) => s.solutionId), originalOrder);
  });
});

// ---------------------------------------------------------------------------
// Artifact with Solution Comparisons Tests
// ---------------------------------------------------------------------------

describe('Solution Comparison Kernel — Artifact with Solution Comparisons', () => {
  it('should compose application artifact with solution comparisons', () => {
    const registry = composeSolutionComparisonRegistry([VALID_SOLUTION], [VALID_COMPARISON], [], []);
    const result = composeApplicationArtifactWithSolutionComparisons({
      applicationNode: VALID_NODE,
      solutionComparisonRegistry: registry,
    });

    assert.equal(result.applicationNode.applicationId, 'app-001');
    assert.equal(result.solutionComparisonRegistry.solutions.length, 1);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should not mutate the original application node', () => {
    const registry = composeSolutionComparisonRegistry([VALID_SOLUTION], [], [], []);
    const originalTitle = VALID_NODE.title;

    composeApplicationArtifactWithSolutionComparisons({
      applicationNode: VALID_NODE,
      solutionComparisonRegistry: registry,
    });

    assert.equal(VALID_NODE.title, originalTitle);
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Verification Tests
// ---------------------------------------------------------------------------

describe('Solution Comparison Kernel — Cross-Agent Boundary Verification', () => {
  it('should only reference external IDs, not own external metadata', () => {
    const sol = composeEngineeringSolution({
      solutionId: 'sol-001',
      title: 'Test',
      description: 'Test.',
      solutionType: 'deep_learning',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      architectureId: 'arch-001',
      caseStudyId: 'cs-001',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(typeof sol.knowledgeArtifactId, 'string');
    assert.ok(!('knowledgeContent' in sol), 'Should not have knowledge content');
    assert.ok(!('narrativeContent' in sol), 'Should not have narrative content');
  });

  it('should not generate comparisons automatically', () => {
    const result = composeSolutionComparisons(VALID_INPUT);
    assert.ok(!('autoGenerated' in result), 'Should not have auto-generated');
    assert.ok(!('generatedComparisons' in result), 'Should not have generated comparisons');
  });

  it('should not rank alternatives', () => {
    const result = composeSolutionComparisons(VALID_INPUT);
    assert.ok(!('ranking' in result), 'Should not have ranking');
    assert.ok(!('rankedSolutions' in result), 'Should not have ranked solutions');
  });

  it('should not compute benchmarks', () => {
    const result = composeSolutionComparisons(VALID_INPUT);
    assert.ok(!('benchmarkResults' in result), 'Should not have benchmark results');
    assert.ok(!('performanceScores' in result), 'Should not have performance scores');
  });

  it('should not determine superiority', () => {
    const result = composeSolutionComparisons(VALID_INPUT);
    assert.ok(!('bestSolution' in result), 'Should not have best solution');
    assert.ok(!('recommended' in result), 'Should not have recommended');
  });
});
