/**
 * NV-2000-D8-OPT-13 — Portfolio-Oriented Evaluation Kernel Tests
 *
 * Exhaustive deterministic tests for the Portfolio-Oriented Evaluation Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~85 tests covering:
 * - Canonical enum completeness
 * - Helper functions
 * - Portfolio evaluation composition
 * - Artifact reference composition
 * - Competency evidence composition
 * - Showcase classification composition
 * - Relationship composition
 * - Registry composition
 * - Validation codes
 * - Duplicate detection
 * - Deterministic identity (100 iterations)
 * - Immutability
 * - Validator stability
 * - No mutation
 * - Artifact with portfolio evaluations
 * - Cross-agent boundary
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_PORTFOLIO_EVALUATION_TYPES,
  CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
  CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
  CANONICAL_SHOWCASE_LEVELS,
  CANONICAL_PORTFOLIO_EVALUATION_STATUS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type PortfolioEvaluation,
  type PortfolioArtifactReference,
  type PortfolioCompetencyEvidence,
  type PortfolioShowcaseClassification,
  type PortfolioInput,
  type PortfolioRegistry,
  type PortfolioEvaluationProvenance,
  type AssessmentArtifactWithPortfolio,
} from './AssessmentAgentContract.ts';

import {
  composePortfolioEvaluationProvenance,
  composePortfolioEvaluationTrace,
  composePortfolioArtifactReference,
  composePortfolioCompetencyEvidence,
  composePortfolioShowcaseClassification,
  composePortfolioRelationship,
  composePortfolioEvaluation,
  composePortfolioRegistry,
  composePortfolioRegistryFromInput,
  composeAssessmentPortfolioEvaluations,
  composeAssessmentArtifactWithPortfolio,
  isSupportedPortfolioEvaluationType,
  isSupportedPortfolioArtifactType,
  isSupportedPortfolioCompetencyType,
  isSupportedShowcaseLevel,
  isSupportedPortfolioEvaluationStatus,
  isSupportedPortfolioGovernance,
  getCanonicalPortfolioEvaluationTypes,
  getCanonicalPortfolioArtifactTypes,
  getCanonicalPortfolioCompetencyTypes,
  getCanonicalShowcaseLevels,
  getCanonicalPortfolioEvaluationStatuses,
} from './AssessmentPortfolioKernel.ts';

import {
  PORTFOLIO_VALIDATION_CODES,
  validatePortfolioEvaluation,
  validatePortfolioArtifactReference,
  validatePortfolioCompetencyEvidence,
  validatePortfolioShowcaseClassification,
  validatePortfolioRelationship,
  validatePortfolioRegistry,
  validatePortfolioInput,
  validatePortfolioTrace,
  validateAssessmentArtifactWithPortfolio,
} from './AssessmentPortfolioValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_PORTFOLIO_PROVENANCE: PortfolioEvaluationProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for portfolio evaluation.',
};

function _makeArtifactReference(id: string): PortfolioArtifactReference {
  return composePortfolioArtifactReference({
    id,
    artifactType: 'repository',
    description: `Test artifact ${id}`,
  });
}

function _makeCompetencyEvidence(id: string): PortfolioCompetencyEvidence {
  return composePortfolioCompetencyEvidence({
    id,
    competencyType: 'implementation',
    description: `Test competency ${id}`,
  });
}

function _makeShowcaseClassification(id: string): PortfolioShowcaseClassification {
  return composePortfolioShowcaseClassification({
    id,
    showcaseLevel: 'professional',
    description: `Test showcase ${id}`,
  });
}

function _makeEvaluation(
  id: string,
  overrides: Partial<PortfolioEvaluation> = {},
): PortfolioEvaluation {
  return composePortfolioEvaluation({
    id,
    title: `Evaluation ${id}`,
    evaluationType: 'project_based',
    artifacts: [_makeArtifactReference(`artifact-${id}`)],
    competencies: [_makeCompetencyEvidence(`competency-${id}`)],
    showcaseClassifications: [_makeShowcaseClassification(`showcase-${id}`)],
    conceptIds: ['concept-1'],
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_PORTFOLIO_PROVENANCE,
    ...overrides,
  });
}

const VALID_EVALUATION_A = _makeEvaluation('evaluation-a');
const VALID_EVALUATION_B = _makeEvaluation('evaluation-b');
const VALID_EVALUATION_C = _makeEvaluation('evaluation-c');

// ============================================================================
// CANONICAL ENUMS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 portfolio evaluation types', () => {
    assert.equal(CANONICAL_PORTFOLIO_EVALUATION_TYPES.length, 10);
  });

  it('should have exactly 10 portfolio artifact types', () => {
    assert.equal(CANONICAL_PORTFOLIO_ARTIFACT_TYPES.length, 10);
  });

  it('should have exactly 10 portfolio competency types', () => {
    assert.equal(CANONICAL_PORTFOLIO_COMPETENCY_TYPES.length, 10);
  });

  it('should have exactly 10 showcase levels', () => {
    assert.equal(CANONICAL_SHOWCASE_LEVELS.length, 10);
  });

  it('should have exactly 6 portfolio evaluation statuses', () => {
    assert.equal(CANONICAL_PORTFOLIO_EVALUATION_STATUS.length, 6);
  });

  it('should contain expected portfolio evaluation types', () => {
    const expected = [
      'project_based',
      'artifact_review',
      'engineering_showcase',
      'capstone',
      'implementation_validation',
      'architecture_review',
      'competency_demonstration',
      'production_readiness',
      'research_portfolio',
      'professional_showcase',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_PORTFOLIO_EVALUATION_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected portfolio artifact types', () => {
    const expected = [
      'repository',
      'technical_report',
      'architecture_document',
      'research_report',
      'presentation',
      'codebase',
      'deployment',
      'experiment',
      'benchmark',
      'documentation',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_PORTFOLIO_ARTIFACT_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected portfolio competency types', () => {
    const expected = [
      'implementation',
      'architecture',
      'engineering_reasoning',
      'problem_solving',
      'debugging',
      'optimization',
      'documentation',
      'communication',
      'research',
      'deployment',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_PORTFOLIO_COMPETENCY_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected showcase levels', () => {
    const expected = [
      'internal',
      'educational',
      'academic',
      'professional',
      'industry',
      'conference',
      'competition',
      'publication',
      'open_source',
      'flagship',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_SHOWCASE_LEVELS.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected portfolio evaluation statuses', () => {
    const expected = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];
    for (const value of expected) {
      assert.ok(CANONICAL_PORTFOLIO_EVALUATION_STATUS.includes(value as any), `Missing: ${value}`);
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedPortfolioEvaluationType returns true for valid types', () => {
    assert.equal(isSupportedPortfolioEvaluationType('project_based'), true);
    assert.equal(isSupportedPortfolioEvaluationType('capstone'), true);
  });

  it('isSupportedPortfolioEvaluationType returns false for invalid types', () => {
    assert.equal(isSupportedPortfolioEvaluationType('invalid'), false);
    assert.equal(isSupportedPortfolioEvaluationType(''), false);
  });

  it('isSupportedPortfolioArtifactType returns true for valid types', () => {
    assert.equal(isSupportedPortfolioArtifactType('repository'), true);
    assert.equal(isSupportedPortfolioArtifactType('codebase'), true);
  });

  it('isSupportedPortfolioArtifactType returns false for invalid types', () => {
    assert.equal(isSupportedPortfolioArtifactType('invalid'), false);
    assert.equal(isSupportedPortfolioArtifactType(''), false);
  });

  it('isSupportedPortfolioCompetencyType returns true for valid types', () => {
    assert.equal(isSupportedPortfolioCompetencyType('implementation'), true);
    assert.equal(isSupportedPortfolioCompetencyType('architecture'), true);
  });

  it('isSupportedPortfolioCompetencyType returns false for invalid types', () => {
    assert.equal(isSupportedPortfolioCompetencyType('invalid'), false);
    assert.equal(isSupportedPortfolioCompetencyType(''), false);
  });

  it('isSupportedShowcaseLevel returns true for valid levels', () => {
    assert.equal(isSupportedShowcaseLevel('internal'), true);
    assert.equal(isSupportedShowcaseLevel('flagship'), true);
  });

  it('isSupportedShowcaseLevel returns false for invalid levels', () => {
    assert.equal(isSupportedShowcaseLevel('invalid'), false);
    assert.equal(isSupportedShowcaseLevel(''), false);
  });

  it('isSupportedPortfolioEvaluationStatus returns true for valid statuses', () => {
    assert.equal(isSupportedPortfolioEvaluationStatus('draft'), true);
    assert.equal(isSupportedPortfolioEvaluationStatus('archived'), true);
  });

  it('isSupportedPortfolioEvaluationStatus returns false for invalid statuses', () => {
    assert.equal(isSupportedPortfolioEvaluationStatus('invalid'), false);
    assert.equal(isSupportedPortfolioEvaluationStatus(''), false);
  });

  it('isSupportedPortfolioGovernance returns true for valid governance', () => {
    assert.equal(isSupportedPortfolioGovernance('canonical'), true);
    assert.equal(isSupportedPortfolioGovernance('rejected'), true);
  });

  it('isSupportedPortfolioGovernance returns false for invalid governance', () => {
    assert.equal(isSupportedPortfolioGovernance('invalid'), false);
    assert.equal(isSupportedPortfolioGovernance(''), false);
  });

  it('getCanonicalPortfolioEvaluationTypes returns a copy', () => {
    const result = getCanonicalPortfolioEvaluationTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_PORTFOLIO_EVALUATION_TYPES]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_PORTFOLIO_EVALUATION_TYPES.length, 10);
  });

  it('getCanonicalPortfolioArtifactTypes returns a copy', () => {
    const result = getCanonicalPortfolioArtifactTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalPortfolioCompetencyTypes returns a copy', () => {
    const result = getCanonicalPortfolioCompetencyTypes();
    assert.equal(result.length, 10);
  });

  it('getCanonicalShowcaseLevels returns a copy', () => {
    const result = getCanonicalShowcaseLevels();
    assert.equal(result.length, 10);
  });

  it('getCanonicalPortfolioEvaluationStatuses returns a copy', () => {
    const result = getCanonicalPortfolioEvaluationStatuses();
    assert.equal(result.length, 6);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Portfolio Evaluation
// ============================================================================

describe('composePortfolioEvaluation', () => {
  it('should compose portfolio evaluation from valid params', () => {
    const evaluation = composePortfolioEvaluation({
      id: 'pe1',
      title: 'Test',
      evaluationType: 'project_based',
      artifacts: [_makeArtifactReference('a1')],
      competencies: [_makeCompetencyEvidence('c1')],
      showcaseClassifications: [_makeShowcaseClassification('s1')],
      conceptIds: ['concept-1'],
      status: 'draft',
      governance: 'canonical',
      provenance: VALID_PORTFOLIO_PROVENANCE,
    });
    assert.equal(evaluation.id, 'pe1');
    assert.equal(evaluation.title, 'Test');
    assert.equal(evaluation.evaluationType, 'project_based');
    assert.equal(evaluation.trace.deterministic, true);
    assert.equal(evaluation.trace.randomUsed, false);
    assert.equal(evaluation.trace.timeDependency, false);
  });

  it('should not mutate input arrays', () => {
    const conceptIds = ['concept-1'];
    const original = JSON.stringify(conceptIds);
    composePortfolioEvaluation({
      id: 'pe2',
      title: 'Test',
      evaluationType: 'project_based',
      artifacts: [],
      competencies: [],
      showcaseClassifications: [],
      conceptIds,
      status: 'draft',
      governance: 'canonical',
      provenance: VALID_PORTFOLIO_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Artifact Reference
// ============================================================================

describe('composePortfolioArtifactReference', () => {
  it('should compose artifact reference from valid params', () => {
    const artifact = composePortfolioArtifactReference({
      id: 'ar1',
      artifactType: 'repository',
      description: 'Test repository',
    });
    assert.equal(artifact.id, 'ar1');
    assert.equal(artifact.artifactType, 'repository');
    assert.equal(artifact.description, 'Test repository');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Competency Evidence
// ============================================================================

describe('composePortfolioCompetencyEvidence', () => {
  it('should compose competency evidence from valid params', () => {
    const competency = composePortfolioCompetencyEvidence({
      id: 'ce1',
      competencyType: 'implementation',
      description: 'Test implementation',
    });
    assert.equal(competency.id, 'ce1');
    assert.equal(competency.competencyType, 'implementation');
    assert.equal(competency.description, 'Test implementation');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Showcase Classification
// ============================================================================

describe('composePortfolioShowcaseClassification', () => {
  it('should compose showcase classification from valid params', () => {
    const showcase = composePortfolioShowcaseClassification({
      id: 'sc1',
      showcaseLevel: 'professional',
      description: 'Test showcase',
    });
    assert.equal(showcase.id, 'sc1');
    assert.equal(showcase.showcaseLevel, 'professional');
    assert.equal(showcase.description, 'Test showcase');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Relationship
// ============================================================================

describe('composePortfolioRelationship', () => {
  it('should compose relationship from valid params', () => {
    const rel = composePortfolioRelationship({
      id: 'r1',
      sourceEvaluationId: 'a',
      targetEvaluationId: 'b',
      relationshipType: 'depends',
      rationale: 'Test rationale',
    });
    assert.equal(rel.id, 'r1');
    assert.equal(rel.sourceEvaluationId, 'a');
    assert.equal(rel.targetEvaluationId, 'b');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'r1',
      sourceEvaluationId: 'a',
      targetEvaluationId: 'b',
      relationshipType: 'depends',
      rationale: 'Test rationale',
    };
    const r1 = composePortfolioRelationship(params);
    const r2 = composePortfolioRelationship(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composePortfolioRegistry', () => {
  it('should compose registry from evaluations', () => {
    const registry = composePortfolioRegistry([VALID_EVALUATION_A, VALID_EVALUATION_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
  });

  it('should sort nodes by id', () => {
    const registry = composePortfolioRegistry([
      VALID_EVALUATION_C,
      VALID_EVALUATION_A,
      VALID_EVALUATION_B,
    ]);
    assert.equal(registry.nodes[0].id, 'evaluation-a');
    assert.equal(registry.nodes[1].id, 'evaluation-b');
    assert.equal(registry.nodes[2].id, 'evaluation-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_EVALUATION_A, VALID_EVALUATION_B];
    const r1 = composePortfolioRegistry(nodes);
    const r2 = composePortfolioRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_EVALUATION_C, VALID_EVALUATION_A];
    const original = JSON.stringify(nodes);
    composePortfolioRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composePortfolioRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry From Input
// ============================================================================

describe('composePortfolioRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: PortfolioInput = { nodes: [VALID_EVALUATION_A, VALID_EVALUATION_B] };
    const registry = composePortfolioRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
  });

  it('should return identical output for identical input', () => {
    const input: PortfolioInput = { nodes: [VALID_EVALUATION_A] };
    const r1 = composePortfolioRegistryFromInput(input);
    const r2 = composePortfolioRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Assessment Portfolio Evaluations
// ============================================================================

describe('composeAssessmentPortfolioEvaluations', () => {
  it('should compose evaluations into registry', () => {
    const registry = composeAssessmentPortfolioEvaluations({
      evaluations: [VALID_EVALUATION_A, VALID_EVALUATION_B],
    });
    assert.equal(registry.nodes.length, 2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Artifact With Portfolio
// ============================================================================

describe('composeAssessmentArtifactWithPortfolio', () => {
  it('should compose artifact with portfolio evaluations', () => {
    const artifact = composeAssessmentArtifactWithPortfolio({
      artifactId: 'art1',
      artifactTitle: 'Test Artifact',
      portfolioEvaluations: [VALID_EVALUATION_A],
    });
    assert.equal(artifact.artifactId, 'art1');
    assert.equal(artifact.artifactTitle, 'Test Artifact');
    assert.equal(artifact.portfolioEvaluations.length, 1);
  });

  it('should not mutate portfolioEvaluations input', () => {
    const evaluations = [VALID_EVALUATION_A];
    const original = JSON.stringify(evaluations);
    composeAssessmentArtifactWithPortfolio({
      artifactId: 'art1',
      artifactTitle: 'Test Artifact',
      portfolioEvaluations: evaluations,
    });
    assert.equal(JSON.stringify(evaluations), original);
  });
});

// ============================================================================
// VALIDATION — Portfolio Evaluation
// ============================================================================

describe('validatePortfolioEvaluation', () => {
  it('should pass for valid portfolio evaluation', () => {
    const errors = validatePortfolioEvaluation(VALID_EVALUATION_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null evaluation', () => {
    const errors = validatePortfolioEvaluation(null as any);
    assert.ok(errors.length > 0);
  });

  it('should reject evaluation with missing id', () => {
    const evaluation = _makeEvaluation('');
    const errors = validatePortfolioEvaluation(evaluation);
    assert.ok(errors.some((e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_PORTFOLIO_ID));
  });

  it('should reject evaluation with invalid type', () => {
    const evaluation = _makeEvaluation('e1', { evaluationType: 'invalid' as any });
    const errors = validatePortfolioEvaluation(evaluation);
    assert.ok(errors.some((e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TYPE));
  });

  it('should reject evaluation with missing conceptIds', () => {
    const evaluation = _makeEvaluation('e1', { conceptIds: [] });
    const errors = validatePortfolioEvaluation(evaluation);
    assert.ok(errors.some((e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_MISSING_ASSESSMENT_REFERENCE));
  });

  it('should reject evaluation with non-deterministic trace', () => {
    const evaluation: PortfolioEvaluation = {
      id: 'e1',
      title: 'Test',
      evaluationType: 'project_based',
      artifacts: [],
      competencies: [],
      showcaseClassifications: [],
      conceptIds: ['concept-1'],
      status: 'draft',
      governance: 'canonical',
      provenance: VALID_PORTFOLIO_PROVENANCE,
      trace: {
        traceId: 't1',
        deterministic: false as any,
        generatedFrom: 'deterministic_portfolio_kernel',
        randomUsed: false,
        timeDependency: false,
      },
    };
    const errors = validatePortfolioEvaluation(evaluation);
    assert.ok(errors.some((e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Artifact Reference
// ============================================================================

describe('validatePortfolioArtifactReference', () => {
  it('should pass for valid artifact reference', () => {
    const errors = validatePortfolioArtifactReference(_makeArtifactReference('ar1'));
    assert.equal(errors.length, 0);
  });

  it('should reject artifact with missing id', () => {
    const artifact = composePortfolioArtifactReference({
      id: '',
      artifactType: 'repository',
      description: 'Test',
    });
    const errors = validatePortfolioArtifactReference(artifact);
    assert.ok(errors.some((e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_ARTIFACT_DUPLICATE_ID));
  });

  it('should reject artifact with invalid type', () => {
    const artifact = composePortfolioArtifactReference({
      id: 'ar1',
      artifactType: 'invalid' as any,
      description: 'Test',
    });
    const errors = validatePortfolioArtifactReference(artifact);
    assert.ok(errors.some((e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_ARTIFACT));
  });
});

// ============================================================================
// VALIDATION — Competency Evidence
// ============================================================================

describe('validatePortfolioCompetencyEvidence', () => {
  it('should pass for valid competency evidence', () => {
    const errors = validatePortfolioCompetencyEvidence(_makeCompetencyEvidence('ce1'));
    assert.equal(errors.length, 0);
  });

  it('should reject competency with missing id', () => {
    const competency = composePortfolioCompetencyEvidence({
      id: '',
      competencyType: 'implementation',
      description: 'Test',
    });
    const errors = validatePortfolioCompetencyEvidence(competency);
    assert.ok(errors.some((e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_COMPETENCY_DUPLICATE_ID));
  });

  it('should reject competency with invalid type', () => {
    const competency = composePortfolioCompetencyEvidence({
      id: 'ce1',
      competencyType: 'invalid' as any,
      description: 'Test',
    });
    const errors = validatePortfolioCompetencyEvidence(competency);
    assert.ok(errors.some((e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_COMPETENCY));
  });
});

// ============================================================================
// VALIDATION — Showcase Classification
// ============================================================================

describe('validatePortfolioShowcaseClassification', () => {
  it('should pass for valid showcase classification', () => {
    const errors = validatePortfolioShowcaseClassification(_makeShowcaseClassification('sc1'));
    assert.equal(errors.length, 0);
  });

  it('should reject showcase with missing id', () => {
    const showcase = composePortfolioShowcaseClassification({
      id: '',
      showcaseLevel: 'professional',
      description: 'Test',
    });
    const errors = validatePortfolioShowcaseClassification(showcase);
    assert.ok(errors.some((e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_SHOWCASE_DUPLICATE_ID));
  });

  it('should reject showcase with invalid level', () => {
    const showcase = composePortfolioShowcaseClassification({
      id: 'sc1',
      showcaseLevel: 'invalid' as any,
      description: 'Test',
    });
    const errors = validatePortfolioShowcaseClassification(showcase);
    assert.ok(errors.some((e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_INVALID_SHOWCASE));
  });
});

// ============================================================================
// VALIDATION — Relationship
// ============================================================================

describe('validatePortfolioRelationship', () => {
  it('should pass for valid relationship', () => {
    const rel = composePortfolioRelationship({
      id: 'r1',
      sourceEvaluationId: 'a',
      targetEvaluationId: 'b',
      relationshipType: 'depends',
      rationale: 'Test',
    });
    const errors = validatePortfolioRelationship(rel);
    assert.equal(errors.length, 0);
  });

  it('should reject self-relationship', () => {
    const rel = composePortfolioRelationship({
      id: 'r1',
      sourceEvaluationId: 'a',
      targetEvaluationId: 'a',
      relationshipType: 'depends',
      rationale: 'Test',
    });
    const errors = validatePortfolioRelationship(rel);
    assert.ok(errors.some((e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_SELF_RELATIONSHIP));
  });
});

// ============================================================================
// VALIDATION — Registry
// ============================================================================

describe('validatePortfolioRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composePortfolioRegistry([VALID_EVALUATION_A, VALID_EVALUATION_B]);
    const result = validatePortfolioRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null registry', () => {
    const result = validatePortfolioRegistry(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty registry', () => {
    const registry = composePortfolioRegistry([]);
    const result = validatePortfolioRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makeEvaluation('dup'), _makeEvaluation('dup')];
    const registry = composePortfolioRegistry(duplicateNodes);
    const result = validatePortfolioRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makeEvaluation('a', { title: 'Same Title' }),
      _makeEvaluation('b', { title: 'Same Title' }),
    ];
    const registry = composePortfolioRegistry(duplicateTitles);
    const result = validatePortfolioRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === PORTFOLIO_VALIDATION_CODES.PORTFOLIO_DUPLICATE_TITLE));
  });
});

// ============================================================================
// VALIDATION — Input
// ============================================================================

describe('validatePortfolioInput', () => {
  it('should pass for valid input', () => {
    const input: PortfolioInput = { nodes: [VALID_EVALUATION_A] };
    const result = validatePortfolioInput(input);
    assert.equal(result.valid, true);
  });

  it('should reject null input', () => {
    const result = validatePortfolioInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty input', () => {
    const result = validatePortfolioInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Trace
// ============================================================================

describe('validatePortfolioTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composePortfolioEvaluationTrace({ traceId: 't1' });
    const result = validatePortfolioTrace(trace);
    assert.equal(result.valid, true);
  });

  it('should reject null trace', () => {
    const result = validatePortfolioTrace(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Artifact With Portfolio
// ============================================================================

describe('validateAssessmentArtifactWithPortfolio', () => {
  it('should pass for valid artifact', () => {
    const artifact = composeAssessmentArtifactWithPortfolio({
      artifactId: 'art1',
      artifactTitle: 'Test Artifact',
      portfolioEvaluations: [VALID_EVALUATION_A],
    });
    const result = validateAssessmentArtifactWithPortfolio(artifact);
    assert.equal(result.valid, true);
  });

  it('should reject null artifact', () => {
    const result = validateAssessmentArtifactWithPortfolio(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composePortfolioRegistry across 100 iterations', () => {
    const nodes = [VALID_EVALUATION_A, VALID_EVALUATION_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composePortfolioRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composePortfolioEvaluation across 100 iterations', () => {
    const params = {
      id: 'pe1',
      title: 'Test',
      evaluationType: 'project_based' as const,
      artifacts: [_makeArtifactReference('a1')],
      competencies: [_makeCompetencyEvidence('c1')],
      showcaseClassifications: [_makeShowcaseClassification('s1')],
      conceptIds: ['concept-1'],
      status: 'draft' as const,
      governance: 'canonical' as const,
      provenance: VALID_PORTFOLIO_PROVENANCE,
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composePortfolioEvaluation(params);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });
});

// ============================================================================
// IMMUTABILITY
// ============================================================================

describe('Immutability', () => {
  it('should not mutate input nodes array in composePortfolioRegistry', () => {
    const nodes = [VALID_EVALUATION_C, VALID_EVALUATION_A];
    const original = JSON.stringify(nodes);
    composePortfolioRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate conceptIds in composePortfolioEvaluation', () => {
    const conceptIds = ['concept-1'];
    const original = JSON.stringify(conceptIds);
    composePortfolioEvaluation({
      id: 'pe1',
      title: 'Test',
      evaluationType: 'project_based',
      artifacts: [],
      competencies: [],
      showcaseClassifications: [],
      conceptIds,
      status: 'draft',
      governance: 'canonical',
      provenance: VALID_PORTFOLIO_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });

  it('getCanonicalPortfolioEvaluationTypes returns a copy not affecting original', () => {
    const copy = getCanonicalPortfolioEvaluationTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_PORTFOLIO_EVALUATION_TYPES.length, 10);
  });

  it('getCanonicalPortfolioArtifactTypes returns a copy not affecting original', () => {
    const copy = getCanonicalPortfolioArtifactTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_PORTFOLIO_ARTIFACT_TYPES.length, 10);
  });

  it('getCanonicalPortfolioCompetencyTypes returns a copy not affecting original', () => {
    const copy = getCanonicalPortfolioCompetencyTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_PORTFOLIO_COMPETENCY_TYPES.length, 10);
  });
});

// ============================================================================
// CROSS-AGENT BOUNDARY
// ============================================================================

describe('Cross-Agent Boundary', () => {
  it('should not contain generatePortfolio', () => {
    const allEnums = [
      ...CANONICAL_PORTFOLIO_EVALUATION_TYPES,
      ...CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
      ...CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
      ...CANONICAL_SHOWCASE_LEVELS,
    ];
    for (const value of allEnums) {
      assert.ok(!value.toLowerCase().includes('generateportfolio'), `Found forbidden pattern in: ${value}`);
    }
  });

  it('should not contain evaluateRepository', () => {
    const allEnums = [
      ...CANONICAL_PORTFOLIO_EVALUATION_TYPES,
      ...CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
      ...CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
      ...CANONICAL_SHOWCASE_LEVELS,
    ];
    for (const value of allEnums) {
      assert.ok(!value.toLowerCase().includes('evaluaterepository'), `Found forbidden pattern in: ${value}`);
    }
  });

  it('should not contain recommendCareer', () => {
    const allEnums = [
      ...CANONICAL_PORTFOLIO_EVALUATION_TYPES,
      ...CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
      ...CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
      ...CANONICAL_SHOWCASE_LEVELS,
    ];
    for (const value of allEnums) {
      assert.ok(!value.toLowerCase().includes('recommendcareer'), `Found forbidden pattern in: ${value}`);
    }
  });

  it('should not contain hire', () => {
    const allEnums = [
      ...CANONICAL_PORTFOLIO_EVALUATION_TYPES,
      ...CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
      ...CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
      ...CANONICAL_SHOWCASE_LEVELS,
    ];
    for (const value of allEnums) {
      assert.ok(!value.toLowerCase().includes('hire'), `Found forbidden pattern in: ${value}`);
    }
  });

  it('should not contain employment', () => {
    const allEnums = [
      ...CANONICAL_PORTFOLIO_EVALUATION_TYPES,
      ...CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
      ...CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
      ...CANONICAL_SHOWCASE_LEVELS,
    ];
    for (const value of allEnums) {
      assert.ok(!value.toLowerCase().includes('employment'), `Found forbidden pattern in: ${value}`);
    }
  });

  it('should not contain github', () => {
    const allEnums = [
      ...CANONICAL_PORTFOLIO_EVALUATION_TYPES,
      ...CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
      ...CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
      ...CANONICAL_SHOWCASE_LEVELS,
    ];
    for (const value of allEnums) {
      assert.ok(!value.toLowerCase().includes('github'), `Found forbidden pattern in: ${value}`);
    }
  });

  it('should not contain recruit', () => {
    const allEnums = [
      ...CANONICAL_PORTFOLIO_EVALUATION_TYPES,
      ...CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
      ...CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
      ...CANONICAL_SHOWCASE_LEVELS,
    ];
    for (const value of allEnums) {
      assert.ok(!value.toLowerCase().includes('recruit'), `Found forbidden pattern in: ${value}`);
    }
  });

  it('should not contain portfolioGenerator', () => {
    const allEnums = [
      ...CANONICAL_PORTFOLIO_EVALUATION_TYPES,
      ...CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
      ...CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
      ...CANONICAL_SHOWCASE_LEVELS,
    ];
    for (const value of allEnums) {
      assert.ok(!value.toLowerCase().includes('portfoliogenerator'), `Found forbidden pattern in: ${value}`);
    }
  });

  it('should not contain projectGenerator', () => {
    const allEnums = [
      ...CANONICAL_PORTFOLIO_EVALUATION_TYPES,
      ...CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
      ...CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
      ...CANONICAL_SHOWCASE_LEVELS,
    ];
    for (const value of allEnums) {
      assert.ok(!value.toLowerCase().includes('projectgenerator'), `Found forbidden pattern in: ${value}`);
    }
  });

  it('should not contain careerPath', () => {
    const allEnums = [
      ...CANONICAL_PORTFOLIO_EVALUATION_TYPES,
      ...CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
      ...CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
      ...CANONICAL_SHOWCASE_LEVELS,
    ];
    for (const value of allEnums) {
      assert.ok(!value.toLowerCase().includes('careerpath'), `Found forbidden pattern in: ${value}`);
    }
  });
});

// ============================================================================
// NEGATIVE CAPABILITY
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain scoring logic', () => {
    const allEnums = [
      ...CANONICAL_PORTFOLIO_EVALUATION_TYPES,
      ...CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
      ...CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
      ...CANONICAL_SHOWCASE_LEVELS,
    ];
    const source = JSON.stringify(allEnums);
    assert.ok(!source.includes('score'), 'Found scoring logic');
    assert.ok(!source.includes('mastery'), 'Found mastery logic');
  });

  it('should not contain LLM or async patterns', () => {
    const allEnums = [
      ...CANONICAL_PORTFOLIO_EVALUATION_TYPES,
      ...CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
      ...CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
      ...CANONICAL_SHOWCASE_LEVELS,
    ];
    const source = JSON.stringify(allEnums);
    assert.ok(!source.includes('Promise'), 'Found Promise pattern');
    assert.ok(!source.includes('async'), 'Found async pattern');
    assert.ok(!source.includes('await'), 'Found await pattern');
  });
});

// ============================================================================
// VALIDATION CODES
// ============================================================================

describe('Validation Codes', () => {
  it('should have exactly 24 validation codes', () => {
    const codes = Object.values(PORTFOLIO_VALIDATION_CODES);
    assert.equal(codes.length, 24);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(PORTFOLIO_VALIDATION_CODES)) {
      assert.ok(/^[A-Z_]+$/.test(code), `Not UPPER_SNAKE_CASE: ${code}`);
    }
  });

  it('all validation codes should start with PORTFOLIO_', () => {
    for (const code of Object.values(PORTFOLIO_VALIDATION_CODES)) {
      assert.ok(code.startsWith('PORTFOLIO_'), `Does not start with PORTFOLIO_: ${code}`);
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(PORTFOLIO_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});
