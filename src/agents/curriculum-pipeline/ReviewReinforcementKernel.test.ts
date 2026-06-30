/**
 * NV-1500-D3-OPT-07 — Curriculum Review & Reinforcement Planning Kernel Tests
 *
 * Deterministic test suite for the Curriculum Review & Reinforcement Planning Kernel.
 * Every test is deterministic and reproducible.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CurriculumNode,
  CurriculumReviewPlan,
  CurriculumReinforcementPlan,
  CurriculumReviewReinforcementRegistry,
  CurriculumReviewReinforcementInput,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_REVIEW_TYPES,
  CANONICAL_REINFORCEMENT_TYPES,
  CANONICAL_REVIEW_RECURRENCE_MODELS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

import {
  composeCurriculumNode,
  composeCurriculumGraph,
} from './CurriculumGraphKernel.ts';

import {
  composeReviewPlan,
  composeReinforcementPlan,
  composeReviewReinforcementRegistry,
  composeReviewReinforcementTrace,
  composeReviewReinforcementProvenance,
  composeCurriculumReviewReinforcement,
  composeCurriculumArtifactWithReviewReinforcement,
  isSupportedReviewType,
  isSupportedReinforcementType,
  isSupportedReviewRecurrenceModel,
  isSupportedReviewReinforcementGovernanceStatus,
  getCanonicalReviewTypes,
  getCanonicalReinforcementTypes,
  getCanonicalReviewRecurrenceModels,
} from './ReviewReinforcementKernel.ts';

import {
  validateReviewPlan,
  validateReinforcementPlan,
  validateReviewReinforcementRegistry,
  validateCurriculumArtifactWithReviewReinforcement,
  validateReviewReinforcementInput,
  REVIEW_REINFORCEMENT_VALIDATION_CODES,
} from './ReviewReinforcementValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_NODE_CONCEPT: CurriculumNode = {
  nodeId: 'node-concept-001',
  nodeType: 'concept',
  referenceId: 'ref-concept-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Core concept for neural networks.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_COMPETENCY: CurriculumNode = {
  nodeId: 'node-competency-001',
  nodeType: 'competency',
  referenceId: 'ref-competency-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Core competency for deep learning.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_LESSON: CurriculumNode = {
  nodeId: 'node-lesson-001',
  nodeType: 'lesson',
  referenceId: 'ref-lesson-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Introduction to neural networks.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_ASSESSMENT: CurriculumNode = {
  nodeId: 'node-assessment-001',
  nodeType: 'assessment',
  referenceId: 'ref-assessment-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Assessment for neural networks.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_LABORATORY: CurriculumNode = {
  nodeId: 'node-laboratory-001',
  nodeType: 'laboratory',
  referenceId: 'ref-laboratory-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Laboratory for neural networks.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_MODULE: CurriculumNode = {
  nodeId: 'node-module-001',
  nodeType: 'module',
  referenceId: 'ref-module-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Module for neural networks.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_CAPSTONE: CurriculumNode = {
  nodeId: 'node-capstone-001',
  nodeType: 'capstone',
  referenceId: 'ref-capstone-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Capstone project for neural networks.',
  providedBy: 'curriculum-board',
};

const VALID_NODE_LEARNING_PATH: CurriculumNode = {
  nodeId: 'node-learning-path-001',
  nodeType: 'learning_path',
  referenceId: 'ref-learning-path-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Learning path for neural networks.',
  providedBy: 'curriculum-board',
};

const VALID_GRAPH: CurriculumGraph = {
  graphId: 'graph-001',
  graphLabel: 'Test Curriculum',
  nodes: [
    VALID_NODE_CONCEPT,
    VALID_NODE_COMPETENCY,
    VALID_NODE_LESSON,
    VALID_NODE_ASSESSMENT,
    VALID_NODE_LABORATORY,
    VALID_NODE_MODULE,
    VALID_NODE_CAPSTONE,
    VALID_NODE_LEARNING_PATH,
  ],
  edges: [],
  deterministic: true,
  generatedFrom: 'deterministic_curriculum_graph_kernel',
  randomUsed: false,
  timeDependency: false,
};

const GRAPH_NODE_IDS = VALID_GRAPH.nodes.map((n) => n.nodeId);

const VALID_REVIEW_PLAN: CurriculumReviewPlan = {
  reviewId: 'review-001',
  reviewType: 'concept_review',
  targetNodeIds: ['node-concept-001'],
  targetCompetencyIds: ['competency-001'],
  targetDependencyIds: ['dep-001'],
  recurrenceModel: 'module_boundary',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Review concept after module completion.',
  providedBy: 'curriculum-board',
};

const VALID_REINFORCEMENT_PLAN: CurriculumReinforcementPlan = {
  reinforcementId: 'reinforcement-001',
  reinforcementType: 'concept_reinforcement',
  targetNodeIds: ['node-concept-001'],
  targetCompetencyIds: ['competency-001'],
  targetDependencyIds: ['dep-001'],
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Reinforce concept through practice.',
  providedBy: 'curriculum-board',
};

// ---------------------------------------------------------------------------
// Valid Review Plan Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Valid Review Plan', () => {
  it('should compose a valid review plan', () => {
    const plan = composeReviewPlan(VALID_REVIEW_PLAN);
    assert.strictEqual(plan.reviewId, 'review-001');
    assert.strictEqual(plan.reviewType, 'concept_review');
    assert.strictEqual(plan.targetNodeIds.length, 1);
    assert.strictEqual(plan.recurrenceModel, 'module_boundary');
  });

  it('should validate a valid review plan with no errors', () => {
    const errors = validateReviewPlan(VALID_REVIEW_PLAN, GRAPH_NODE_IDS);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Valid Reinforcement Plan Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Valid Reinforcement Plan', () => {
  it('should compose a valid reinforcement plan', () => {
    const plan = composeReinforcementPlan(VALID_REINFORCEMENT_PLAN);
    assert.strictEqual(plan.reinforcementId, 'reinforcement-001');
    assert.strictEqual(plan.reinforcementType, 'concept_reinforcement');
    assert.strictEqual(plan.targetNodeIds.length, 1);
  });

  it('should validate a valid reinforcement plan with no errors', () => {
    const errors = validateReinforcementPlan(VALID_REINFORCEMENT_PLAN, GRAPH_NODE_IDS);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Valid Registry Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Valid Registry', () => {
  it('should compose a valid registry', () => {
    const registry = composeReviewReinforcementRegistry({
      registryId: 'reg-001',
      graphId: 'graph-001',
      reviewPlans: [VALID_REVIEW_PLAN],
      reinforcementPlans: [VALID_REINFORCEMENT_PLAN],
    });
    assert.strictEqual(registry.registryId, 'reg-001');
    assert.strictEqual(registry.reviewPlanCount, 1);
    assert.strictEqual(registry.reinforcementPlanCount, 1);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeReviewReinforcementRegistry({
      registryId: 'reg-001',
      graphId: 'graph-001',
      reviewPlans: [VALID_REVIEW_PLAN],
      reinforcementPlans: [VALID_REINFORCEMENT_PLAN],
    });
    const result = validateReviewReinforcementRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
    assert.strictEqual(result.checkedAt, 'curriculum_review_reinforcement_planning');
  });
});

// ---------------------------------------------------------------------------
// Concept Review Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Concept Review', () => {
  it('should handle concept review', () => {
    const plan = composeReviewPlan({
      reviewId: 'review-concept',
      reviewType: 'concept_review',
      targetNodeIds: ['node-concept-001'],
      targetCompetencyIds: [],
      targetDependencyIds: [],
      recurrenceModel: 'immediate',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Review concept immediately.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(plan.reviewType, 'concept_review');
  });
});

// ---------------------------------------------------------------------------
// Dependency Review Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Dependency Review', () => {
  it('should handle dependency review', () => {
    const plan = composeReviewPlan({
      reviewId: 'review-dependency',
      reviewType: 'dependency_review',
      targetNodeIds: ['node-concept-001', 'node-lesson-001'],
      targetCompetencyIds: [],
      targetDependencyIds: ['dep-001'],
      recurrenceModel: 'short_interval',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Review dependency relationship.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(plan.reviewType, 'dependency_review');
  });
});

// ---------------------------------------------------------------------------
// Competency Review Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Competency Review', () => {
  it('should handle competency review', () => {
    const plan = composeReviewPlan({
      reviewId: 'review-competency',
      reviewType: 'competency_review',
      targetNodeIds: ['node-competency-001'],
      targetCompetencyIds: ['competency-001'],
      targetDependencyIds: [],
      recurrenceModel: 'medium_interval',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Review competency mastery.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(plan.reviewType, 'competency_review');
  });
});

// ---------------------------------------------------------------------------
// Laboratory Review Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Laboratory Review', () => {
  it('should handle laboratory review', () => {
    const plan = composeReviewPlan({
      reviewId: 'review-laboratory',
      reviewType: 'laboratory_review',
      targetNodeIds: ['node-laboratory-001'],
      targetCompetencyIds: [],
      targetDependencyIds: [],
      recurrenceModel: 'long_interval',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Review laboratory outcomes.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(plan.reviewType, 'laboratory_review');
  });
});

// ---------------------------------------------------------------------------
// Maintenance Review Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Maintenance Review', () => {
  it('should handle maintenance review', () => {
    const plan = composeReviewPlan({
      reviewId: 'review-maintenance',
      reviewType: 'maintenance_review',
      targetNodeIds: ['node-module-001'],
      targetCompetencyIds: [],
      targetDependencyIds: [],
      recurrenceModel: 'module_boundary',
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Maintenance review for module.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(plan.reviewType, 'maintenance_review');
  });
});

// ---------------------------------------------------------------------------
// Concept Reinforcement Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Concept Reinforcement', () => {
  it('should handle concept reinforcement', () => {
    const plan = composeReinforcementPlan({
      reinforcementId: 'reinforcement-concept',
      reinforcementType: 'concept_reinforcement',
      targetNodeIds: ['node-concept-001'],
      targetCompetencyIds: [],
      targetDependencyIds: [],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Reinforce concept understanding.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(plan.reinforcementType, 'concept_reinforcement');
  });
});

// ---------------------------------------------------------------------------
// Practice Reinforcement Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Practice Reinforcement', () => {
  it('should handle practice reinforcement', () => {
    const plan = composeReinforcementPlan({
      reinforcementId: 'reinforcement-practice',
      reinforcementType: 'practice_reinforcement',
      targetNodeIds: ['node-lesson-001'],
      targetCompetencyIds: [],
      targetDependencyIds: [],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Reinforce through practice.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(plan.reinforcementType, 'practice_reinforcement');
  });
});

// ---------------------------------------------------------------------------
// Laboratory Reinforcement Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Laboratory Reinforcement', () => {
  it('should handle laboratory reinforcement', () => {
    const plan = composeReinforcementPlan({
      reinforcementId: 'reinforcement-laboratory',
      reinforcementType: 'laboratory_reinforcement',
      targetNodeIds: ['node-laboratory-001'],
      targetCompetencyIds: [],
      targetDependencyIds: [],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Reinforce through laboratory work.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(plan.reinforcementType, 'laboratory_reinforcement');
  });
});

// ---------------------------------------------------------------------------
// Long Term Retention Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Long Term Retention', () => {
  it('should handle long term retention reinforcement', () => {
    const plan = composeReinforcementPlan({
      reinforcementId: 'reinforcement-long-term',
      reinforcementType: 'long_term_retention',
      targetNodeIds: ['node-concept-001', 'node-competency-001'],
      targetCompetencyIds: ['competency-001'],
      targetDependencyIds: [],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Ensure long term retention.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(plan.reinforcementType, 'long_term_retention');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Review ID Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Duplicate Review ID', () => {
  it('should detect duplicate review plan IDs', () => {
    const registry = composeReviewReinforcementRegistry({
      registryId: 'reg-dup',
      graphId: 'graph-001',
      reviewPlans: [
        VALID_REVIEW_PLAN,
        { ...VALID_REVIEW_PLAN, reviewType: 'dependency_review' },
      ],
      reinforcementPlans: [],
    });
    const result = validateReviewReinforcementRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, false);
    const dupError = result.errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_DUPLICATE_ID,
    );
    assert.ok(dupError, 'Should have REVIEW_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Reinforcement ID Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Duplicate Reinforcement ID', () => {
  it('should detect duplicate reinforcement plan IDs', () => {
    const registry = composeReviewReinforcementRegistry({
      registryId: 'reg-dup-reinforcement',
      graphId: 'graph-001',
      reviewPlans: [],
      reinforcementPlans: [
        VALID_REINFORCEMENT_PLAN,
        { ...VALID_REINFORCEMENT_PLAN, reinforcementType: 'dependency_reinforcement' },
      ],
    });
    const result = validateReviewReinforcementRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, false);
    const dupError = result.errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_DUPLICATE_ID,
    );
    assert.ok(dupError, 'Should have REINFORCEMENT_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Review Type Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Unsupported Review Type', () => {
  it('should detect unsupported review type', () => {
    const plan = {
      ...VALID_REVIEW_PLAN,
      reviewType: 'invalid_type' as any,
    };
    const errors = validateReviewPlan(plan, GRAPH_NODE_IDS);
    const typeError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_UNKNOWN_TYPE,
    );
    assert.ok(typeError, 'Should have REVIEW_UNKNOWN_TYPE error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Reinforcement Type Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Unsupported Reinforcement Type', () => {
  it('should detect unsupported reinforcement type', () => {
    const plan = {
      ...VALID_REINFORCEMENT_PLAN,
      reinforcementType: 'invalid_type' as any,
    };
    const errors = validateReinforcementPlan(plan, GRAPH_NODE_IDS);
    const typeError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_UNKNOWN_TYPE,
    );
    assert.ok(typeError, 'Should have REINFORCEMENT_UNKNOWN_TYPE error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Recurrence Model Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Unsupported Recurrence Model', () => {
  it('should detect unsupported recurrence model', () => {
    const plan = {
      ...VALID_REVIEW_PLAN,
      recurrenceModel: 'invalid_model' as any,
    };
    const errors = validateReviewPlan(plan, GRAPH_NODE_IDS);
    const recurrenceError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_UNKNOWN_RECURRENCE,
    );
    assert.ok(recurrenceError, 'Should have REVIEW_UNKNOWN_RECURRENCE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Review Target Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Invalid Review Target', () => {
  it('should detect invalid review target node', () => {
    const plan = {
      ...VALID_REVIEW_PLAN,
      targetNodeIds: ['non-existent-node'],
    };
    const errors = validateReviewPlan(plan, GRAPH_NODE_IDS);
    const targetError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_INVALID_TARGET,
    );
    assert.ok(targetError, 'Should have REVIEW_INVALID_TARGET error');
  });
});

// ---------------------------------------------------------------------------
// Invalid Reinforcement Target Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Invalid Reinforcement Target', () => {
  it('should detect invalid reinforcement target node', () => {
    const plan = {
      ...VALID_REINFORCEMENT_PLAN,
      targetNodeIds: ['non-existent-node'],
    };
    const errors = validateReinforcementPlan(plan, GRAPH_NODE_IDS);
    const targetError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TARGET,
    );
    assert.ok(targetError, 'Should have REINFORCEMENT_INVALID_TARGET error');
  });
});

// ---------------------------------------------------------------------------
// Empty Review Targets Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Empty Review Targets', () => {
  it('should detect empty review targets', () => {
    const plan = {
      ...VALID_REVIEW_PLAN,
      targetNodeIds: [],
    };
    const errors = validateReviewPlan(plan, GRAPH_NODE_IDS);
    const emptyError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_EMPTY_TARGETS,
    );
    assert.ok(emptyError, 'Should have REVIEW_EMPTY_TARGETS error');
  });
});

// ---------------------------------------------------------------------------
// Empty Reinforcement Targets Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Empty Reinforcement Targets', () => {
  it('should detect empty reinforcement targets', () => {
    const plan = {
      ...VALID_REINFORCEMENT_PLAN,
      targetNodeIds: [],
    };
    const errors = validateReinforcementPlan(plan, GRAPH_NODE_IDS);
    const emptyError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_EMPTY_TARGETS,
    );
    assert.ok(emptyError, 'Should have REINFORCEMENT_EMPTY_TARGETS error');
  });
});

// ---------------------------------------------------------------------------
// Missing Review Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Missing Review Provenance', () => {
  it('should detect missing review source', () => {
    const plan = {
      ...VALID_REVIEW_PLAN,
      source: '',
    };
    const errors = validateReviewPlan(plan, GRAPH_NODE_IDS);
    const sourceError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_MISSING_SOURCE,
    );
    assert.ok(sourceError, 'Should have REVIEW_MISSING_SOURCE error');
  });

  it('should detect missing review rationale', () => {
    const plan = {
      ...VALID_REVIEW_PLAN,
      rationale: '',
    };
    const errors = validateReviewPlan(plan, GRAPH_NODE_IDS);
    const rationaleError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have REVIEW_MISSING_RATIONALE error');
  });

  it('should detect missing review providedBy', () => {
    const plan = {
      ...VALID_REVIEW_PLAN,
      providedBy: '',
    };
    const errors = validateReviewPlan(plan, GRAPH_NODE_IDS);
    const providedByError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_MISSING_PROVIDED_BY,
    );
    assert.ok(providedByError, 'Should have REVIEW_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Missing Reinforcement Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Missing Reinforcement Provenance', () => {
  it('should detect missing reinforcement source', () => {
    const plan = {
      ...VALID_REINFORCEMENT_PLAN,
      source: '',
    };
    const errors = validateReinforcementPlan(plan, GRAPH_NODE_IDS);
    const sourceError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_SOURCE,
    );
    assert.ok(sourceError, 'Should have REINFORCEMENT_MISSING_SOURCE error');
  });

  it('should detect missing reinforcement rationale', () => {
    const plan = {
      ...VALID_REINFORCEMENT_PLAN,
      rationale: '',
    };
    const errors = validateReinforcementPlan(plan, GRAPH_NODE_IDS);
    const rationaleError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have REINFORCEMENT_MISSING_RATIONALE error');
  });

  it('should detect missing reinforcement providedBy', () => {
    const plan = {
      ...VALID_REINFORCEMENT_PLAN,
      providedBy: '',
    };
    const errors = validateReinforcementPlan(plan, GRAPH_NODE_IDS);
    const providedByError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_PROVIDED_BY,
    );
    assert.ok(providedByError, 'Should have REINFORCEMENT_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Missing Source', () => {
  it('should detect missing source in review plan', () => {
    const plan = {
      ...VALID_REVIEW_PLAN,
      source: '',
    };
    const errors = validateReviewPlan(plan, GRAPH_NODE_IDS);
    const sourceError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_MISSING_SOURCE,
    );
    assert.ok(sourceError, 'Should have REVIEW_MISSING_SOURCE error');
  });

  it('should detect missing source in reinforcement plan', () => {
    const plan = {
      ...VALID_REINFORCEMENT_PLAN,
      source: '',
    };
    const errors = validateReinforcementPlan(plan, GRAPH_NODE_IDS);
    const sourceError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_SOURCE,
    );
    assert.ok(sourceError, 'Should have REINFORCEMENT_MISSING_SOURCE error');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Empty Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeReviewReinforcementRegistry({
      registryId: 'reg-empty',
      graphId: 'graph-001',
      reviewPlans: [],
      reinforcementPlans: [],
    });
    const result = validateReviewReinforcementRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have REVIEW_REINFORCEMENT_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Review Ordering Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Deterministic Review Ordering', () => {
  it('should sort review plans by reviewType, then recurrenceModel, then reviewId', () => {
    const input: CurriculumReviewReinforcementInput = {
      registryId: 'reg-sort',
      graphId: 'graph-001',
      reviewPlans: [
        { ...VALID_REVIEW_PLAN, reviewId: 'review-003', reviewType: 'module_review', recurrenceModel: 'long_interval' },
        { ...VALID_REVIEW_PLAN, reviewId: 'review-001', reviewType: 'concept_review', recurrenceModel: 'immediate' },
        { ...VALID_REVIEW_PLAN, reviewId: 'review-002', reviewType: 'dependency_review', recurrenceModel: 'short_interval' },
      ],
      reinforcementPlans: [],
    };
    const registry = composeCurriculumReviewReinforcement(input);
    assert.strictEqual(registry.reviewPlans[0].reviewType, 'concept_review');
    assert.strictEqual(registry.reviewPlans[1].reviewType, 'dependency_review');
    assert.strictEqual(registry.reviewPlans[2].reviewType, 'module_review');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Reinforcement Ordering Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Deterministic Reinforcement Ordering', () => {
  it('should sort reinforcement plans by reinforcementType, then reinforcementId', () => {
    const input: CurriculumReviewReinforcementInput = {
      registryId: 'reg-sort-reinforcement',
      graphId: 'graph-001',
      reviewPlans: [],
      reinforcementPlans: [
        { ...VALID_REINFORCEMENT_PLAN, reinforcementId: 'reinforcement-003', reinforcementType: 'long_term_retention' },
        { ...VALID_REINFORCEMENT_PLAN, reinforcementId: 'reinforcement-001', reinforcementType: 'concept_reinforcement' },
        { ...VALID_REINFORCEMENT_PLAN, reinforcementId: 'reinforcement-002', reinforcementType: 'practice_reinforcement' },
      ],
    };
    const registry = composeCurriculumReviewReinforcement(input);
    assert.strictEqual(registry.reinforcementPlans[0].reinforcementType, 'concept_reinforcement');
    assert.strictEqual(registry.reinforcementPlans[1].reinforcementType, 'practice_reinforcement');
    assert.strictEqual(registry.reinforcementPlans[2].reinforcementType, 'long_term_retention');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Immutable Input', () => {
  it('should not mutate input review plans', () => {
    const plans = [VALID_REVIEW_PLAN];
    const original = [...plans];
    composeCurriculumReviewReinforcement({
      registryId: 'reg-immutable',
      graphId: 'graph-001',
      reviewPlans: plans,
      reinforcementPlans: [],
    });
    assert.deepStrictEqual(plans, original);
  });

  it('should not mutate input reinforcement plans', () => {
    const plans = [VALID_REINFORCEMENT_PLAN];
    const original = [...plans];
    composeCurriculumReviewReinforcement({
      registryId: 'reg-immutable-reinforcement',
      graphId: 'graph-001',
      reviewPlans: [],
      reinforcementPlans: plans,
    });
    assert.deepStrictEqual(plans, original);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Identical Output', () => {
  it('should produce identical output for identical input', () => {
    const input: CurriculumReviewReinforcementInput = {
      registryId: 'reg-identical',
      graphId: 'graph-001',
      reviewPlans: [VALID_REVIEW_PLAN],
      reinforcementPlans: [VALID_REINFORCEMENT_PLAN],
    };
    const reg1 = composeCurriculumReviewReinforcement(input);
    const reg2 = composeCurriculumReviewReinforcement(input);
    assert.deepStrictEqual(reg1, reg2);
  });

  it('should produce identical output across 100 iterations', () => {
    const input: CurriculumReviewReinforcementInput = {
      registryId: 'reg-100',
      graphId: 'graph-001',
      reviewPlans: [VALID_REVIEW_PLAN],
      reinforcementPlans: [VALID_REINFORCEMENT_PLAN],
    };
    const reg1 = composeCurriculumReviewReinforcement(input);
    for (let i = 0; i < 99; i++) {
      const reg = composeCurriculumReviewReinforcement(input);
      assert.deepStrictEqual(reg, reg1);
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Negative Capability', () => {
  it('should not infer learner mastery', () => {
    const plan = composeReviewPlan(VALID_REVIEW_PLAN);
    assert.ok(plan.reviewId);
    assert.ok(plan.targetNodeIds);
  });

  it('should not modify curriculum', () => {
    const originalGraph = { ...VALID_GRAPH };
    composeReviewPlan(VALID_REVIEW_PLAN);
    assert.deepStrictEqual(VALID_GRAPH, originalGraph);
  });

  it('should not use runtime scheduling', () => {
    const plan = composeReviewPlan(VALID_REVIEW_PLAN);
    // Review plans should not contain date/time references
    assert.ok(!('date' in plan));
    assert.ok(!('scheduledAt' in plan));
    assert.ok(!('interval' in plan));
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Helper Functions', () => {
  it('isSupportedReviewType should return true for valid types', () => {
    for (const type of CANONICAL_REVIEW_TYPES) {
      assert.strictEqual(isSupportedReviewType(type), true);
    }
  });

  it('isSupportedReviewType should return false for invalid types', () => {
    assert.strictEqual(isSupportedReviewType('invalid'), false);
    assert.strictEqual(isSupportedReviewType(''), false);
  });

  it('isSupportedReinforcementType should return true for valid types', () => {
    for (const type of CANONICAL_REINFORCEMENT_TYPES) {
      assert.strictEqual(isSupportedReinforcementType(type), true);
    }
  });

  it('isSupportedReinforcementType should return false for invalid types', () => {
    assert.strictEqual(isSupportedReinforcementType('invalid'), false);
    assert.strictEqual(isSupportedReinforcementType(''), false);
  });

  it('isSupportedReviewRecurrenceModel should return true for valid models', () => {
    for (const model of CANONICAL_REVIEW_RECURRENCE_MODELS) {
      assert.strictEqual(isSupportedReviewRecurrenceModel(model), true);
    }
  });

  it('isSupportedReviewRecurrenceModel should return false for invalid models', () => {
    assert.strictEqual(isSupportedReviewRecurrenceModel('invalid'), false);
    assert.strictEqual(isSupportedReviewRecurrenceModel(''), false);
  });

  it('isSupportedReviewReinforcementGovernanceStatus should return true for valid statuses', () => {
    for (const status of CANONICAL_GOVERNANCE_STATUSES) {
      assert.strictEqual(isSupportedReviewReinforcementGovernanceStatus(status), true);
    }
  });

  it('isSupportedReviewReinforcementGovernanceStatus should return false for invalid statuses', () => {
    assert.strictEqual(isSupportedReviewReinforcementGovernanceStatus('invalid'), false);
    assert.strictEqual(isSupportedReviewReinforcementGovernanceStatus(''), false);
  });

  it('getCanonicalReviewTypes should return all canonical types', () => {
    const types = getCanonicalReviewTypes();
    assert.strictEqual(types.length, 10);
    assert.deepStrictEqual(types, CANONICAL_REVIEW_TYPES);
  });

  it('getCanonicalReinforcementTypes should return all canonical types', () => {
    const types = getCanonicalReinforcementTypes();
    assert.strictEqual(types.length, 10);
    assert.deepStrictEqual(types, CANONICAL_REINFORCEMENT_TYPES);
  });

  it('getCanonicalReviewRecurrenceModels should return all canonical models', () => {
    const models = getCanonicalReviewRecurrenceModels();
    assert.strictEqual(models.length, 8);
    assert.deepStrictEqual(models, CANONICAL_REVIEW_RECURRENCE_MODELS);
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Registry Validation', () => {
  it('should validate a valid registry', () => {
    const registry = composeReviewReinforcementRegistry({
      registryId: 'reg-valid',
      graphId: 'graph-001',
      reviewPlans: [VALID_REVIEW_PLAN],
      reinforcementPlans: [VALID_REINFORCEMENT_PLAN],
    });
    const result = validateReviewReinforcementRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

// ---------------------------------------------------------------------------
// Artifact Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Artifact Validation', () => {
  it('should compose and validate a valid artifact', () => {
    const registry = composeReviewReinforcementRegistry({
      registryId: 'reg-artifact',
      graphId: 'graph-001',
      reviewPlans: [VALID_REVIEW_PLAN],
      reinforcementPlans: [VALID_REINFORCEMENT_PLAN],
    });
    const trace = composeReviewReinforcementTrace('reg-artifact', [VALID_REVIEW_PLAN], [VALID_REINFORCEMENT_PLAN]);
    const artifact = composeCurriculumArtifactWithReviewReinforcement({
      artifactId: 'artifact-001',
      graph: VALID_GRAPH,
      reviewReinforcementRegistry: registry,
      reviewReinforcementTrace: trace,
      validation: {
        valid: true,
        errors: [],
        checkedAt: 'curriculum_review_reinforcement_planning',
      },
    });
    const result = validateCurriculumArtifactWithReviewReinforcement(artifact);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Trace Validation', () => {
  it('should compose a trace with correct counts', () => {
    const trace = composeReviewReinforcementTrace('reg-trace', [VALID_REVIEW_PLAN], [VALID_REINFORCEMENT_PLAN]);
    assert.strictEqual(trace.reviewPlanCount, 1);
    assert.strictEqual(trace.reinforcementPlanCount, 1);
    assert.strictEqual(trace.decisionsCount, 2);
    assert.strictEqual(trace.validatedCount, 2);
    assert.strictEqual(trace.invalidCount, 0);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
    assert.strictEqual(trace.curriculumMutated, false);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Provenance', () => {
  it('should compose review/reinforcement provenance', () => {
    const registry = composeReviewReinforcementRegistry({
      registryId: 'reg-provenance',
      graphId: 'graph-001',
      reviewPlans: [VALID_REVIEW_PLAN],
      reinforcementPlans: [VALID_REINFORCEMENT_PLAN],
    });
    const provenance = composeReviewReinforcementProvenance(registry);
    assert.strictEqual(provenance.registryId, 'reg-provenance');
    assert.strictEqual(provenance.source, 'curriculum-review-reinforcement-kernel');
    assert.strictEqual(provenance.governanceStatus, 'canonical');
    assert.strictEqual(provenance.providedBy, 'curriculum-board');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Metadata Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Deterministic Metadata', () => {
  it('registry should have deterministic metadata', () => {
    const registry = composeReviewReinforcementRegistry({
      registryId: 'reg-meta',
      graphId: 'graph-001',
      reviewPlans: [],
      reinforcementPlans: [],
    });
    assert.strictEqual(registry.deterministic, true);
    assert.strictEqual(registry.randomUsed, false);
    assert.strictEqual(registry.timeDependency, false);
  });

  it('trace should have deterministic metadata', () => {
    const trace = composeReviewReinforcementTrace('reg-meta', [], []);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
    assert.strictEqual(trace.curriculumMutated, false);
  });
});

// ---------------------------------------------------------------------------
// Input Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Input Validation', () => {
  it('should validate valid input with no errors', () => {
    const input: CurriculumReviewReinforcementInput = {
      registryId: 'reg-input',
      graphId: 'graph-001',
      reviewPlans: [VALID_REVIEW_PLAN],
      reinforcementPlans: [VALID_REINFORCEMENT_PLAN],
    };
    const errors = validateReviewReinforcementInput(input, GRAPH_NODE_IDS);
    assert.deepStrictEqual(errors, []);
  });

  it('should detect missing registry ID', () => {
    const input: CurriculumReviewReinforcementInput = {
      registryId: '',
      graphId: 'graph-001',
      reviewPlans: [],
      reinforcementPlans: [],
    };
    const errors = validateReviewReinforcementInput(input, GRAPH_NODE_IDS);
    const idError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_MISSING_REGISTRY_ID,
    );
    assert.ok(idError, 'Should have REVIEW_REINFORCEMENT_MISSING_REGISTRY_ID error');
  });

  it('should detect missing graph ID', () => {
    const input: CurriculumReviewReinforcementInput = {
      registryId: 'reg-001',
      graphId: '',
      reviewPlans: [],
      reinforcementPlans: [],
    };
    const errors = validateReviewReinforcementInput(input, GRAPH_NODE_IDS);
    const graphError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_MISSING_GRAPH_ID,
    );
    assert.ok(graphError, 'Should have REVIEW_REINFORCEMENT_MISSING_GRAPH_ID error');
  });

  it('should detect empty review plans', () => {
    const input: CurriculumReviewReinforcementInput = {
      registryId: 'reg-001',
      graphId: 'graph-001',
      reviewPlans: [],
      reinforcementPlans: [],
    };
    const errors = validateReviewReinforcementInput(input, GRAPH_NODE_IDS);
    const emptyError = errors.find(
      (e) => e.code === REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have REVIEW_REINFORCEMENT_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Canonical Type Completeness Tests
// ---------------------------------------------------------------------------

describe('Curriculum Review Reinforcement Kernel — Canonical Type Completeness', () => {
  it('should have exactly 10 canonical review types', () => {
    assert.strictEqual(CANONICAL_REVIEW_TYPES.length, 10);
  });

  it('should have exactly 10 canonical reinforcement types', () => {
    assert.strictEqual(CANONICAL_REINFORCEMENT_TYPES.length, 10);
  });

  it('should have exactly 8 canonical recurrence models', () => {
    assert.strictEqual(CANONICAL_REVIEW_RECURRENCE_MODELS.length, 8);
  });
});
