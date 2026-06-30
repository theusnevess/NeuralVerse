/**
 * NV-1500-D3-OPT-06 — Curriculum Coverage & Gap Analysis Kernel Tests
 *
 * Deterministic test suite for the Curriculum Coverage & Gap Analysis Kernel.
 * Every test is deterministic and reproducible.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  CurriculumNode,
  CurriculumCoverageRecord,
  CurriculumGapRecord,
  CurriculumCoverageRegistry,
  CurriculumCoverageInput,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_COVERAGE_STATUS,
  CANONICAL_GAP_TYPES,
  CANONICAL_COVERAGE_DIMENSIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

import {
  composeCurriculumNode,
  composeCurriculumGraph,
} from './CurriculumGraphKernel.ts';

import {
  composeCoverageRecord,
  composeGapRecord,
  composeCoverageRegistry,
  composeCoverageTrace,
  composeCoverageProvenance,
  composeCurriculumCoverage,
  composeCurriculumArtifactWithCoverage,
  isSupportedCoverageStatus,
  isSupportedGapType,
  isSupportedCoverageDimension,
  isSupportedCoverageGovernanceStatus,
  getCanonicalCoverageStatuses,
  getCanonicalGapTypes,
  getCanonicalCoverageDimensions,
} from './CoverageKernel.ts';

import {
  validateCoverageRecord,
  validateGapRecord,
  validateCoverageRegistry,
  validateCurriculumArtifactWithCoverage,
  validateCoverageInput,
  COVERAGE_VALIDATION_CODES,
} from './CoverageValidation.ts';

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

const VALID_NODE_REVIEW: CurriculumNode = {
  nodeId: 'node-review-001',
  nodeType: 'review',
  referenceId: 'ref-review-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Review for neural networks.',
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

const VALID_NODE_MODULE: CurriculumNode = {
  nodeId: 'node-module-001',
  nodeType: 'module',
  referenceId: 'ref-module-001',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Module for neural networks.',
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
    VALID_NODE_REVIEW,
    VALID_NODE_CAPSTONE,
    VALID_NODE_MODULE,
    VALID_NODE_LEARNING_PATH,
  ],
  edges: [],
  deterministic: true,
  generatedFrom: 'deterministic_curriculum_graph_kernel',
  randomUsed: false,
  timeDependency: false,
};

const GRAPH_NODE_IDS = VALID_GRAPH.nodes.map((n) => n.nodeId);

const VALID_COVERAGE_RECORD: CurriculumCoverageRecord = {
  coverageId: 'coverage-001',
  entityId: 'node-concept-001',
  dimension: 'concept',
  coverageStatus: 'fully_covered',
  coverageScore: 1.0,
  coveredBy: ['node-lesson-001', 'node-module-001'],
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Concept is fully covered by lesson and module.',
  providedBy: 'curriculum-board',
};

const VALID_GAP_RECORD: CurriculumGapRecord = {
  gapId: 'gap-001',
  entityId: 'node-competency-001',
  gapType: 'missing_assessment',
  dimension: 'competency',
  severity: 'high',
  description: 'Competency lacks assessment coverage.',
  source: 'governance-committee',
  governanceStatus: 'canonical',
  rationale: 'Competency should have assessment.',
  providedBy: 'curriculum-board',
};

// ---------------------------------------------------------------------------
// Valid Coverage Record Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Valid Coverage Record', () => {
  it('should compose a valid coverage record', () => {
    const record = composeCoverageRecord(VALID_COVERAGE_RECORD);
    assert.strictEqual(record.coverageId, 'coverage-001');
    assert.strictEqual(record.entityId, 'node-concept-001');
    assert.strictEqual(record.dimension, 'concept');
    assert.strictEqual(record.coverageStatus, 'fully_covered');
    assert.strictEqual(record.coverageScore, 1.0);
  });

  it('should validate a valid coverage record with no errors', () => {
    const errors = validateCoverageRecord(VALID_COVERAGE_RECORD, GRAPH_NODE_IDS);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Valid Gap Record Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Valid Gap Record', () => {
  it('should compose a valid gap record', () => {
    const record = composeGapRecord(VALID_GAP_RECORD);
    assert.strictEqual(record.gapId, 'gap-001');
    assert.strictEqual(record.entityId, 'node-competency-001');
    assert.strictEqual(record.gapType, 'missing_assessment');
    assert.strictEqual(record.dimension, 'competency');
    assert.strictEqual(record.severity, 'high');
  });

  it('should validate a valid gap record with no errors', () => {
    const errors = validateGapRecord(VALID_GAP_RECORD, GRAPH_NODE_IDS);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Valid Registry Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Valid Registry', () => {
  it('should compose a valid registry', () => {
    const registry = composeCoverageRegistry({
      registryId: 'reg-001',
      graphId: 'graph-001',
      coverageRecords: [VALID_COVERAGE_RECORD],
      gapRecords: [VALID_GAP_RECORD],
    });
    assert.strictEqual(registry.registryId, 'reg-001');
    assert.strictEqual(registry.graphId, 'graph-001');
    assert.strictEqual(registry.coverageCount, 1);
    assert.strictEqual(registry.gapCount, 1);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeCoverageRegistry({
      registryId: 'reg-001',
      graphId: 'graph-001',
      coverageRecords: [VALID_COVERAGE_RECORD],
      gapRecords: [VALID_GAP_RECORD],
    });
    const result = validateCoverageRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
    assert.strictEqual(result.checkedAt, 'curriculum_coverage_gap_analysis');
  });
});

// ---------------------------------------------------------------------------
// Concept Coverage Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Concept Coverage', () => {
  it('should handle concept coverage', () => {
    const record = composeCoverageRecord({
      coverageId: 'coverage-concept',
      entityId: 'node-concept-001',
      dimension: 'concept',
      coverageStatus: 'fully_covered',
      coverageScore: 1.0,
      coveredBy: ['node-lesson-001'],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Concept covered.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(record.dimension, 'concept');
  });
});

// ---------------------------------------------------------------------------
// Competency Coverage Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Competency Coverage', () => {
  it('should handle competency coverage', () => {
    const record = composeCoverageRecord({
      coverageId: 'coverage-competency',
      entityId: 'node-competency-001',
      dimension: 'competency',
      coverageStatus: 'partially_covered',
      coverageScore: 0.5,
      coveredBy: ['node-lesson-001'],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Competency partially covered.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(record.dimension, 'competency');
    assert.strictEqual(record.coverageStatus, 'partially_covered');
  });
});

// ---------------------------------------------------------------------------
// Assessment Coverage Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Assessment Coverage', () => {
  it('should handle assessment coverage', () => {
    const record = composeCoverageRecord({
      coverageId: 'coverage-assessment',
      entityId: 'node-assessment-001',
      dimension: 'assessment',
      coverageStatus: 'fully_covered',
      coverageScore: 1.0,
      coveredBy: ['node-competency-001'],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Assessment covered.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(record.dimension, 'assessment');
  });
});

// ---------------------------------------------------------------------------
// Laboratory Coverage Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Laboratory Coverage', () => {
  it('should handle laboratory coverage', () => {
    const record = composeCoverageRecord({
      coverageId: 'coverage-laboratory',
      entityId: 'node-laboratory-001',
      dimension: 'laboratory',
      coverageStatus: 'fully_covered',
      coverageScore: 1.0,
      coveredBy: ['node-lesson-001'],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Laboratory covered.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(record.dimension, 'laboratory');
  });
});

// ---------------------------------------------------------------------------
// Roadmap Coverage Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Roadmap Coverage', () => {
  it('should handle roadmap coverage', () => {
    const record = composeCoverageRecord({
      coverageId: 'coverage-roadmap',
      entityId: 'node-learning-path-001',
      dimension: 'roadmap',
      coverageStatus: 'fully_covered',
      coverageScore: 1.0,
      coveredBy: ['node-module-001'],
      source: 'governance-committee',
      governanceStatus: 'canonical',
      rationale: 'Roadmap covered.',
      providedBy: 'curriculum-board',
    });
    assert.strictEqual(record.dimension, 'roadmap');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Coverage Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Duplicate Coverage', () => {
  it('should detect duplicate coverage record IDs', () => {
    const registry = composeCoverageRegistry({
      registryId: 'reg-dup',
      graphId: 'graph-001',
      coverageRecords: [
        VALID_COVERAGE_RECORD,
        { ...VALID_COVERAGE_RECORD, entityId: 'node-lesson-001' },
      ],
      gapRecords: [],
    });
    const result = validateCoverageRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, false);
    const dupError = result.errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_DUPLICATE_RECORD,
    );
    assert.ok(dupError, 'Should have COVERAGE_DUPLICATE_RECORD error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Gap Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Duplicate Gap', () => {
  it('should detect duplicate gap record IDs', () => {
    const registry = composeCoverageRegistry({
      registryId: 'reg-dup-gap',
      graphId: 'graph-001',
      coverageRecords: [],
      gapRecords: [
        VALID_GAP_RECORD,
        { ...VALID_GAP_RECORD, entityId: 'node-assessment-001' },
      ],
    });
    const result = validateCoverageRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, false);
    const dupError = result.errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.GAP_DUPLICATE_RECORD,
    );
    assert.ok(dupError, 'Should have GAP_DUPLICATE_RECORD error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Status Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Unsupported Status', () => {
  it('should detect unsupported coverage status', () => {
    const record = {
      ...VALID_COVERAGE_RECORD,
      coverageStatus: 'invalid_status' as any,
    };
    const errors = validateCoverageRecord(record, GRAPH_NODE_IDS);
    const statusError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_UNKNOWN_STATUS,
    );
    assert.ok(statusError, 'Should have COVERAGE_UNKNOWN_STATUS error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Dimension Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Unsupported Dimension', () => {
  it('should detect unsupported dimension', () => {
    const record = {
      ...VALID_COVERAGE_RECORD,
      dimension: 'invalid_dimension' as any,
    };
    const errors = validateCoverageRecord(record, GRAPH_NODE_IDS);
    const dimError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_UNKNOWN_DIMENSION,
    );
    assert.ok(dimError, 'Should have COVERAGE_UNKNOWN_DIMENSION error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Gap Type Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Unsupported Gap Type', () => {
  it('should detect unsupported gap type', () => {
    const record = {
      ...VALID_GAP_RECORD,
      gapType: 'invalid_type' as any,
    };
    const errors = validateGapRecord(record, GRAPH_NODE_IDS);
    const typeError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.GAP_UNKNOWN_TYPE,
    );
    assert.ok(typeError, 'Should have GAP_UNKNOWN_TYPE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid References Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Invalid References', () => {
  it('should detect invalid reference in coverage record', () => {
    const record = {
      ...VALID_COVERAGE_RECORD,
      entityId: 'non-existent-node',
    };
    const errors = validateCoverageRecord(record, GRAPH_NODE_IDS);
    const refError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_REFERENCE,
    );
    assert.ok(refError, 'Should have COVERAGE_INVALID_REFERENCE error');
  });

  it('should detect invalid reference in gap record', () => {
    const record = {
      ...VALID_GAP_RECORD,
      entityId: 'non-existent-node',
    };
    const errors = validateGapRecord(record, GRAPH_NODE_IDS);
    const refError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_REFERENCE,
    );
    assert.ok(refError, 'Should have COVERAGE_INVALID_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Missing Provenance', () => {
  it('should detect missing source', () => {
    const record = {
      ...VALID_COVERAGE_RECORD,
      source: '',
    };
    const errors = validateCoverageRecord(record, GRAPH_NODE_IDS);
    const sourceError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_SOURCE,
    );
    assert.ok(sourceError, 'Should have COVERAGE_MISSING_SOURCE error');
  });

  it('should detect missing rationale', () => {
    const record = {
      ...VALID_COVERAGE_RECORD,
      rationale: '',
    };
    const errors = validateCoverageRecord(record, GRAPH_NODE_IDS);
    const rationaleError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_RATIONALE,
    );
    assert.ok(rationaleError, 'Should have COVERAGE_MISSING_RATIONALE error');
  });

  it('should detect missing providedBy', () => {
    const record = {
      ...VALID_COVERAGE_RECORD,
      providedBy: '',
    };
    const errors = validateCoverageRecord(record, GRAPH_NODE_IDS);
    const providedByError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVIDED_BY,
    );
    assert.ok(providedByError, 'Should have COVERAGE_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Missing Source', () => {
  it('should detect missing source in gap record', () => {
    const record = {
      ...VALID_GAP_RECORD,
      source: '',
    };
    const errors = validateGapRecord(record, GRAPH_NODE_IDS);
    const sourceError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.GAP_MISSING_SOURCE,
    );
    assert.ok(sourceError, 'Should have GAP_MISSING_SOURCE error');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Empty Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeCoverageRegistry({
      registryId: 'reg-empty',
      graphId: 'graph-001',
      coverageRecords: [],
      gapRecords: [],
    });
    const result = validateCoverageRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have COVERAGE_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Deterministic Ordering', () => {
  it('should sort coverage records by dimension, then status, then entityId', () => {
    const input: CurriculumCoverageInput = {
      registryId: 'reg-sort',
      graphId: 'graph-001',
      coverageRecords: [
        { ...VALID_COVERAGE_RECORD, dimension: 'competency', entityId: 'node-competency-001' },
        { ...VALID_COVERAGE_RECORD, dimension: 'concept', entityId: 'node-concept-001' },
        { ...VALID_COVERAGE_RECORD, dimension: 'assessment', entityId: 'node-assessment-001' },
      ],
      gapRecords: [],
    };
    const registry = composeCurriculumCoverage(input);
    assert.strictEqual(registry.coverageRecords[0].dimension, 'concept');
    assert.strictEqual(registry.coverageRecords[1].dimension, 'competency');
    assert.strictEqual(registry.coverageRecords[2].dimension, 'assessment');
  });

  it('should sort gap records by gapType, then entityId, then gapId', () => {
    const input: CurriculumCoverageInput = {
      registryId: 'reg-sort-gap',
      graphId: 'graph-001',
      coverageRecords: [],
      gapRecords: [
        { ...VALID_GAP_RECORD, gapType: 'missing_review', entityId: 'node-review-001', gapId: 'gap-003' },
        { ...VALID_GAP_RECORD, gapType: 'missing_assessment', entityId: 'node-assessment-001', gapId: 'gap-001' },
        { ...VALID_GAP_RECORD, gapType: 'missing_laboratory', entityId: 'node-laboratory-001', gapId: 'gap-002' },
      ],
    };
    const registry = composeCurriculumCoverage(input);
    assert.strictEqual(registry.gapRecords[0].gapType, 'missing_assessment');
    assert.strictEqual(registry.gapRecords[1].gapType, 'missing_laboratory');
    assert.strictEqual(registry.gapRecords[2].gapType, 'missing_review');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Immutable Input', () => {
  it('should not mutate input coverage records', () => {
    const records = [VALID_COVERAGE_RECORD];
    const original = [...records];
    composeCurriculumCoverage({
      registryId: 'reg-immutable',
      graphId: 'graph-001',
      coverageRecords: records,
      gapRecords: [],
    });
    assert.deepStrictEqual(records, original);
  });

  it('should not mutate input gap records', () => {
    const records = [VALID_GAP_RECORD];
    const original = [...records];
    composeCurriculumCoverage({
      registryId: 'reg-immutable-gap',
      graphId: 'graph-001',
      coverageRecords: [],
      gapRecords: records,
    });
    assert.deepStrictEqual(records, original);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Identical Output', () => {
  it('should produce identical output for identical input', () => {
    const input: CurriculumCoverageInput = {
      registryId: 'reg-identical',
      graphId: 'graph-001',
      coverageRecords: [VALID_COVERAGE_RECORD],
      gapRecords: [VALID_GAP_RECORD],
    };
    const reg1 = composeCurriculumCoverage(input);
    const reg2 = composeCurriculumCoverage(input);
    assert.deepStrictEqual(reg1, reg2);
  });

  it('should produce identical output across 100 iterations', () => {
    const input: CurriculumCoverageInput = {
      registryId: 'reg-100',
      graphId: 'graph-001',
      coverageRecords: [VALID_COVERAGE_RECORD],
      gapRecords: [VALID_GAP_RECORD],
    };
    const reg1 = composeCurriculumCoverage(input);
    for (let i = 0; i < 99; i++) {
      const reg = composeCurriculumCoverage(input);
      assert.deepStrictEqual(reg, reg1);
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Negative Capability', () => {
  it('should not infer learner mastery', () => {
    const record = composeCoverageRecord(VALID_COVERAGE_RECORD);
    assert.ok(record.coverageId);
    assert.ok(record.entityId);
  });

  it('should not modify curriculum', () => {
    const originalGraph = { ...VALID_GRAPH };
    composeCoverageRecord(VALID_COVERAGE_RECORD);
    assert.deepStrictEqual(VALID_GRAPH, originalGraph);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Helper Functions', () => {
  it('isSupportedCoverageStatus should return true for valid statuses', () => {
    for (const status of CANONICAL_COVERAGE_STATUS) {
      assert.strictEqual(isSupportedCoverageStatus(status), true);
    }
  });

  it('isSupportedCoverageStatus should return false for invalid statuses', () => {
    assert.strictEqual(isSupportedCoverageStatus('invalid'), false);
    assert.strictEqual(isSupportedCoverageStatus(''), false);
  });

  it('isSupportedGapType should return true for valid gap types', () => {
    for (const type of CANONICAL_GAP_TYPES) {
      assert.strictEqual(isSupportedGapType(type), true);
    }
  });

  it('isSupportedGapType should return false for invalid gap types', () => {
    assert.strictEqual(isSupportedGapType('invalid'), false);
    assert.strictEqual(isSupportedGapType(''), false);
  });

  it('isSupportedCoverageDimension should return true for valid dimensions', () => {
    for (const dimension of CANONICAL_COVERAGE_DIMENSIONS) {
      assert.strictEqual(isSupportedCoverageDimension(dimension), true);
    }
  });

  it('isSupportedCoverageDimension should return false for invalid dimensions', () => {
    assert.strictEqual(isSupportedCoverageDimension('invalid'), false);
    assert.strictEqual(isSupportedCoverageDimension(''), false);
  });

  it('isSupportedCoverageGovernanceStatus should return true for valid statuses', () => {
    for (const status of CANONICAL_GOVERNANCE_STATUSES) {
      assert.strictEqual(isSupportedCoverageGovernanceStatus(status), true);
    }
  });

  it('isSupportedCoverageGovernanceStatus should return false for invalid statuses', () => {
    assert.strictEqual(isSupportedCoverageGovernanceStatus('invalid'), false);
    assert.strictEqual(isSupportedCoverageGovernanceStatus(''), false);
  });

  it('getCanonicalCoverageStatuses should return all canonical statuses', () => {
    const statuses = getCanonicalCoverageStatuses();
    assert.strictEqual(statuses.length, 8);
    assert.deepStrictEqual(statuses, CANONICAL_COVERAGE_STATUS);
  });

  it('getCanonicalGapTypes should return all canonical gap types', () => {
    const types = getCanonicalGapTypes();
    assert.strictEqual(types.length, 10);
    assert.deepStrictEqual(types, CANONICAL_GAP_TYPES);
  });

  it('getCanonicalCoverageDimensions should return all canonical dimensions', () => {
    const dimensions = getCanonicalCoverageDimensions();
    assert.strictEqual(dimensions.length, 12);
    assert.deepStrictEqual(dimensions, CANONICAL_COVERAGE_DIMENSIONS);
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Registry Validation', () => {
  it('should validate a valid registry', () => {
    const registry = composeCoverageRegistry({
      registryId: 'reg-valid',
      graphId: 'graph-001',
      coverageRecords: [VALID_COVERAGE_RECORD],
      gapRecords: [VALID_GAP_RECORD],
    });
    const result = validateCoverageRegistry(registry, GRAPH_NODE_IDS);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

// ---------------------------------------------------------------------------
// Artifact Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Artifact Validation', () => {
  it('should compose and validate a valid artifact', () => {
    const registry = composeCoverageRegistry({
      registryId: 'reg-artifact',
      graphId: 'graph-001',
      coverageRecords: [VALID_COVERAGE_RECORD],
      gapRecords: [VALID_GAP_RECORD],
    });
    const trace = composeCoverageTrace('reg-artifact', [VALID_COVERAGE_RECORD], [VALID_GAP_RECORD]);
    const artifact = composeCurriculumArtifactWithCoverage({
      artifactId: 'artifact-001',
      graph: VALID_GRAPH,
      coverageRegistry: registry,
      coverageTrace: trace,
      validation: {
        valid: true,
        errors: [],
        checkedAt: 'curriculum_coverage_gap_analysis',
      },
    });
    const result = validateCurriculumArtifactWithCoverage(artifact);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Trace Validation', () => {
  it('should compose a trace with correct counts', () => {
    const trace = composeCoverageTrace('reg-trace', [VALID_COVERAGE_RECORD], [VALID_GAP_RECORD]);
    assert.strictEqual(trace.coverageCount, 1);
    assert.strictEqual(trace.gapCount, 1);
    assert.strictEqual(trace.decisionsCount, 1);
    assert.strictEqual(trace.validatedCount, 1);
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

describe('Curriculum Coverage Kernel — Provenance', () => {
  it('should compose coverage provenance', () => {
    const provenance = composeCoverageProvenance(VALID_COVERAGE_RECORD);
    assert.strictEqual(provenance.coverageId, 'coverage-001');
    assert.strictEqual(provenance.source, 'governance-committee');
    assert.strictEqual(provenance.governanceStatus, 'canonical');
    assert.strictEqual(provenance.rationale, 'Concept is fully covered by lesson and module.');
    assert.strictEqual(provenance.providedBy, 'curriculum-board');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Metadata Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Deterministic Metadata', () => {
  it('registry should have deterministic metadata', () => {
    const registry = composeCoverageRegistry({
      registryId: 'reg-meta',
      graphId: 'graph-001',
      coverageRecords: [],
      gapRecords: [],
    });
    assert.strictEqual(registry.deterministic, true);
    assert.strictEqual(registry.randomUsed, false);
    assert.strictEqual(registry.timeDependency, false);
  });

  it('trace should have deterministic metadata', () => {
    const trace = composeCoverageTrace('reg-meta', [], []);
    assert.strictEqual(trace.deterministic, true);
    assert.strictEqual(trace.randomUsed, false);
    assert.strictEqual(trace.timeDependency, false);
    assert.strictEqual(trace.curriculumMutated, false);
  });
});

// ---------------------------------------------------------------------------
// Input Validation Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Input Validation', () => {
  it('should validate valid input with no errors', () => {
    const input: CurriculumCoverageInput = {
      registryId: 'reg-input',
      graphId: 'graph-001',
      coverageRecords: [VALID_COVERAGE_RECORD],
      gapRecords: [VALID_GAP_RECORD],
    };
    const errors = validateCoverageInput(input, GRAPH_NODE_IDS);
    assert.deepStrictEqual(errors, []);
  });

  it('should detect missing registry ID', () => {
    const input: CurriculumCoverageInput = {
      registryId: '',
      graphId: 'graph-001',
      coverageRecords: [],
      gapRecords: [],
    };
    const errors = validateCoverageInput(input, GRAPH_NODE_IDS);
    const idError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_REGISTRY_ID,
    );
    assert.ok(idError, 'Should have COVERAGE_MISSING_REGISTRY_ID error');
  });

  it('should detect missing graph ID', () => {
    const input: CurriculumCoverageInput = {
      registryId: 'reg-001',
      graphId: '',
      coverageRecords: [],
      gapRecords: [],
    };
    const errors = validateCoverageInput(input, GRAPH_NODE_IDS);
    const graphError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_GRAPH_ID,
    );
    assert.ok(graphError, 'Should have COVERAGE_MISSING_GRAPH_ID error');
  });

  it('should detect empty coverage records', () => {
    const input: CurriculumCoverageInput = {
      registryId: 'reg-001',
      graphId: 'graph-001',
      coverageRecords: [],
      gapRecords: [],
    };
    const errors = validateCoverageInput(input, GRAPH_NODE_IDS);
    const emptyError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have COVERAGE_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Canonical Type Completeness Tests
// ---------------------------------------------------------------------------

describe('Curriculum Coverage Kernel — Canonical Type Completeness', () => {
  it('should have exactly 8 canonical coverage statuses', () => {
    assert.strictEqual(CANONICAL_COVERAGE_STATUS.length, 8);
  });

  it('should have exactly 10 canonical gap types', () => {
    assert.strictEqual(CANONICAL_GAP_TYPES.length, 10);
  });

  it('should have exactly 12 canonical coverage dimensions', () => {
    assert.strictEqual(CANONICAL_COVERAGE_DIMENSIONS.length, 12);
  });
});
