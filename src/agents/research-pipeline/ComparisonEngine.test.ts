/**
 * NV-1400-D2-OPT-03 — Structured Method Comparison Engine Test Suite
 *
 * Comprehensive tests for the comparison engine.
 * Covers: valid comparison matrix, valid comparison entry, duplicate method,
 * duplicate dimension, unsupported dimension, unsupported method, missing evidence,
 * missing provenance, empty matrix, inconsistent dimensions, deterministic output,
 * immutable input, no generated content, no inferred recommendation, no ranking,
 * identical output for identical input.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeComparisonAttribute,
  composeComparisonValue,
  composeComparisonProvenance,
  composeComparisonEntry,
  composeComparisonMatrix,
  composeResearchComparison,
  composeComparisonTrace,
  isSupportedComparisonDimension,
  getCanonicalComparisonDimensions,
} from './ComparisonEngine.ts';

import {
  validateComparisonEntry,
  validateComparisonMatrix,
  validateResearchArtifactWithComparison,
  validateComparisonInput,
  COMPARISON_VALIDATION_CODES,
} from './ComparisonValidation.ts';

import type {
  ResearchComparisonEntry,
  ResearchComparisonMatrix,
  ResearchComparisonInput,
  ResearchComparisonDimension,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_ATTRIBUTE_1 = {
  attributeId: 'attr-001',
  dimension: 'computational_complexity' as const,
  value: 'O(n²)',
  evidenceReferenceId: 'ref-001',
  governanceStatus: 'canonical' as const,
};

const VALID_ATTRIBUTE_2 = {
  attributeId: 'attr-002',
  dimension: 'memory_complexity' as const,
  value: 'O(n)',
  evidenceReferenceId: 'ref-001',
  governanceStatus: 'canonical' as const,
};

const VALID_VALUE_1 = {
  dimension: 'computational_complexity' as const,
  attributes: [VALID_ATTRIBUTE_1],
};

const VALID_VALUE_2 = {
  dimension: 'memory_complexity' as const,
  attributes: [VALID_ATTRIBUTE_2],
};

const VALID_PROVENANCE_1 = {
  methodReferenceId: 'method-001',
  evidenceReferenceId: 'ref-001',
  lineageReferenceId: 'lineage-001',
  comparisonDimension: 'computational_complexity' as const,
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  rationale: 'Transformer complexity is well-documented in literature.',
};

const VALID_PROVENANCE_2 = {
  methodReferenceId: 'method-002',
  evidenceReferenceId: 'ref-002',
  lineageReferenceId: 'lineage-002',
  comparisonDimension: 'computational_complexity' as const,
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  rationale: 'RNN complexity is well-documented in literature.',
};

const VALID_ENTRY_1: ResearchComparisonEntry = {
  entryId: 'entry-001',
  methodReferenceId: 'method-001',
  methodTitle: 'Transformer',
  evidenceReferenceId: 'ref-001',
  lineageReferenceId: 'lineage-001',
  comparisonValues: [VALID_VALUE_1, VALID_VALUE_2],
  provenance: VALID_PROVENANCE_1,
  governanceStatus: 'canonical',
};

const VALID_ENTRY_2: ResearchComparisonEntry = {
  entryId: 'entry-002',
  methodReferenceId: 'method-002',
  methodTitle: 'RNN',
  evidenceReferenceId: 'ref-002',
  lineageReferenceId: 'lineage-002',
  comparisonValues: [VALID_VALUE_1, VALID_VALUE_2],
  provenance: VALID_PROVENANCE_2,
  governanceStatus: 'canonical',
};

// ---------------------------------------------------------------------------
// Valid Comparison Matrix Tests
// ---------------------------------------------------------------------------

describe('composeComparisonMatrix', () => {
  it('should compose a valid comparison matrix', () => {
    const matrix = composeComparisonMatrix(
      'matrix-001',
      ['method-001', 'method-002'],
      ['computational_complexity', 'memory_complexity'],
      [VALID_ENTRY_1, VALID_ENTRY_2],
    );

    assert.equal(matrix.matrixId, 'matrix-001');
    assert.equal(matrix.methods.length, 2);
    assert.equal(matrix.dimensions.length, 2);
    assert.equal(matrix.entries.length, 2);
    assert.equal(matrix.deterministic, true);
    assert.equal(matrix.randomUsed, false);
    assert.equal(matrix.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Valid Comparison Entry Tests
// ---------------------------------------------------------------------------

describe('valid comparison entry', () => {
  it('should compose a valid comparison entry', () => {
    const entry = composeComparisonEntry(
      'entry-001',
      'method-001',
      'Transformer',
      'ref-001',
      'lineage-001',
      [VALID_VALUE_1, VALID_VALUE_2],
      VALID_PROVENANCE_1,
      'canonical',
    );

    assert.equal(entry.entryId, 'entry-001');
    assert.equal(entry.methodReferenceId, 'method-001');
    assert.equal(entry.methodTitle, 'Transformer');
    assert.equal(entry.comparisonValues.length, 2);
  });

  it('should validate a valid comparison entry', () => {
    const errors = validateComparisonEntry(VALID_ENTRY_1, ['method-001', 'method-002']);
    assert.equal(errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Method Tests
// ---------------------------------------------------------------------------

describe('duplicate method validation', () => {
  it('should detect duplicate methods in matrix', () => {
    const matrix: ResearchComparisonMatrix = {
      matrixId: 'matrix-001',
      methods: ['method-001', 'method-001'],
      dimensions: ['computational_complexity'],
      entries: [VALID_ENTRY_1],
      deterministic: true,
      generatedFrom: 'deterministic_comparison_engine',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateComparisonMatrix(matrix);
    const duplicateError = errors.find((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_METHOD);

    assert.ok(duplicateError, 'Should have COMPARISON_DUPLICATE_METHOD error');
  });

  it('should not flag unique methods as duplicates', () => {
    const matrix: ResearchComparisonMatrix = {
      matrixId: 'matrix-001',
      methods: ['method-001', 'method-002'],
      dimensions: ['computational_complexity'],
      entries: [VALID_ENTRY_1, VALID_ENTRY_2],
      deterministic: true,
      generatedFrom: 'deterministic_comparison_engine',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateComparisonMatrix(matrix);
    const duplicateErrors = errors.filter((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_METHOD);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Dimension Tests
// ---------------------------------------------------------------------------

describe('duplicate dimension validation', () => {
  it('should detect duplicate dimensions', () => {
    const matrix: ResearchComparisonMatrix = {
      matrixId: 'matrix-001',
      methods: ['method-001'],
      dimensions: ['computational_complexity', 'computational_complexity'],
      entries: [VALID_ENTRY_1],
      deterministic: true,
      generatedFrom: 'deterministic_comparison_engine',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateComparisonMatrix(matrix);
    const duplicateError = errors.find((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_DIMENSION);

    assert.ok(duplicateError, 'Should have COMPARISON_DUPLICATE_DIMENSION error');
  });

  it('should not flag unique dimensions as duplicates', () => {
    const matrix: ResearchComparisonMatrix = {
      matrixId: 'matrix-001',
      methods: ['method-001'],
      dimensions: ['computational_complexity', 'memory_complexity'],
      entries: [VALID_ENTRY_1],
      deterministic: true,
      generatedFrom: 'deterministic_comparison_engine',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateComparisonMatrix(matrix);
    const duplicateErrors = errors.filter((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_DUPLICATE_DIMENSION);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Dimension Tests
// ---------------------------------------------------------------------------

describe('unsupported dimension validation', () => {
  it('should detect unsupported dimension', () => {
    const entry: ResearchComparisonEntry = {
      ...VALID_ENTRY_1,
      comparisonValues: [
        {
          dimension: 'unsupported_dimension' as any,
          attributes: [VALID_ATTRIBUTE_1],
        },
      ],
    };

    const errors = validateComparisonEntry(entry, ['method-001']);
    const unsupportedError = errors.find((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_UNKNOWN_DIMENSION);

    assert.ok(unsupportedError, 'Should have COMPARISON_UNKNOWN_DIMENSION error');
  });

  it('should support all canonical dimensions', () => {
    const dimensions = getCanonicalComparisonDimensions();
    assert.equal(dimensions.length, 14);
    assert.ok(dimensions.includes('problem_scope'));
    assert.ok(dimensions.includes('core_assumption'));
    assert.ok(dimensions.includes('algorithmic_family'));
    assert.ok(dimensions.includes('computational_complexity'));
    assert.ok(dimensions.includes('memory_complexity'));
    assert.ok(dimensions.includes('training_requirements'));
    assert.ok(dimensions.includes('data_requirements'));
    assert.ok(dimensions.includes('interpretability'));
    assert.ok(dimensions.includes('robustness'));
    assert.ok(dimensions.includes('generalization'));
    assert.ok(dimensions.includes('limitations'));
    assert.ok(dimensions.includes('strengths'));
    assert.ok(dimensions.includes('typical_use_cases'));
    assert.ok(dimensions.includes('research_maturity'));
  });

  it('should correctly identify supported dimensions', () => {
    assert.equal(isSupportedComparisonDimension('computational_complexity'), true);
    assert.equal(isSupportedComparisonDimension('memory_complexity'), true);
    assert.equal(isSupportedComparisonDimension('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Unsupported Method Tests
// ---------------------------------------------------------------------------

describe('unsupported method validation', () => {
  it('should detect unsupported method', () => {
    const entry: ResearchComparisonEntry = {
      ...VALID_ENTRY_1,
      methodReferenceId: 'method-999',
    };

    const errors = validateComparisonEntry(entry, ['method-001', 'method-002']);
    const unsupportedError = errors.find((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_UNSUPPORTED_METHOD);

    assert.ok(unsupportedError, 'Should have COMPARISON_UNSUPPORTED_METHOD error');
  });

  it('should not flag supported methods', () => {
    const errors = validateComparisonEntry(VALID_ENTRY_1, ['method-001', 'method-002']);
    const unsupportedErrors = errors.filter((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_UNSUPPORTED_METHOD);

    assert.equal(unsupportedErrors.length, 0, 'Should not have unsupported method errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Evidence Tests
// ---------------------------------------------------------------------------

describe('missing evidence validation', () => {
  it('should detect missing evidence reference', () => {
    const entry: ResearchComparisonEntry = {
      ...VALID_ENTRY_1,
      evidenceReferenceId: '',
    };

    const errors = validateComparisonEntry(entry, ['method-001']);
    const evidenceError = errors.find((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_EVIDENCE);

    assert.ok(evidenceError, 'Should have COMPARISON_MISSING_EVIDENCE error');
  });

  it('should detect missing lineage reference', () => {
    const entry: ResearchComparisonEntry = {
      ...VALID_ENTRY_1,
      lineageReferenceId: '',
    };

    const errors = validateComparisonEntry(entry, ['method-001']);
    const evidenceError = errors.find((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_EVIDENCE);

    assert.ok(evidenceError, 'Should have COMPARISON_MISSING_EVIDENCE error');
  });

  it('should not flag valid evidence', () => {
    const errors = validateComparisonEntry(VALID_ENTRY_1, ['method-001']);
    const evidenceErrors = errors.filter((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_EVIDENCE);

    assert.equal(evidenceErrors.length, 0, 'Should not have evidence errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('missing provenance validation', () => {
  it('should detect missing provenance', () => {
    const entry: ResearchComparisonEntry = {
      ...VALID_ENTRY_1,
      provenance: null as any,
    };

    const errors = validateComparisonEntry(entry, ['method-001']);
    const provenanceError = errors.find((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have COMPARISON_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const entry: ResearchComparisonEntry = {
      ...VALID_ENTRY_1,
      provenance: {
        ...VALID_PROVENANCE_1,
        rationale: '',
      },
    };

    const errors = validateComparisonEntry(entry, ['method-001']);
    const provenanceError = errors.find((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have COMPARISON_MISSING_PROVENANCE error');
  });

  it('should not flag valid provenance', () => {
    const errors = validateComparisonEntry(VALID_ENTRY_1, ['method-001']);
    const provenanceErrors = errors.filter((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_MISSING_PROVENANCE);

    assert.equal(provenanceErrors.length, 0, 'Should not have provenance errors');
  });
});

// ---------------------------------------------------------------------------
// Empty Matrix Tests
// ---------------------------------------------------------------------------

describe('empty matrix validation', () => {
  it('should detect empty matrix', () => {
    const matrix: ResearchComparisonMatrix = {
      matrixId: 'matrix-001',
      methods: [],
      dimensions: [],
      entries: [],
      deterministic: true,
      generatedFrom: 'deterministic_comparison_engine',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateComparisonMatrix(matrix);
    const emptyErrors = errors.filter((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_MATRIX);

    assert.ok(emptyErrors.length > 0, 'Should have COMPARISON_EMPTY_MATRIX errors');
  });

  it('should not flag non-empty matrix', () => {
    const matrix: ResearchComparisonMatrix = {
      matrixId: 'matrix-001',
      methods: ['method-001'],
      dimensions: ['computational_complexity'],
      entries: [VALID_ENTRY_1],
      deterministic: true,
      generatedFrom: 'deterministic_comparison_engine',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateComparisonMatrix(matrix);
    const emptyErrors = errors.filter((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_EMPTY_MATRIX);

    assert.equal(emptyErrors.length, 0, 'Should not have empty matrix errors');
  });
});

// ---------------------------------------------------------------------------
// Inconsistent Dimensions Tests
// ---------------------------------------------------------------------------

describe('inconsistent dimensions validation', () => {
  it('should detect inconsistent dimensions', () => {
    const entry: ResearchComparisonEntry = {
      ...VALID_ENTRY_1,
      comparisonValues: [VALID_VALUE_1],
    };

    const matrix: ResearchComparisonMatrix = {
      matrixId: 'matrix-001',
      methods: ['method-001'],
      dimensions: ['computational_complexity', 'memory_complexity'],
      entries: [entry],
      deterministic: true,
      generatedFrom: 'deterministic_comparison_engine',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateComparisonMatrix(matrix);
    const inconsistentError = errors.find((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_INCONSISTENT_DIMENSIONS);

    assert.ok(inconsistentError, 'Should have COMPARISON_INCONSISTENT_DIMENSIONS error');
  });

  it('should not flag consistent dimensions', () => {
    const matrix: ResearchComparisonMatrix = {
      matrixId: 'matrix-001',
      methods: ['method-001'],
      dimensions: ['computational_complexity', 'memory_complexity'],
      entries: [VALID_ENTRY_1],
      deterministic: true,
      generatedFrom: 'deterministic_comparison_engine',
      randomUsed: false,
      timeDependency: false,
    };

    const errors = validateComparisonMatrix(matrix);
    const inconsistentErrors = errors.filter((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_INCONSISTENT_DIMENSIONS);

    assert.equal(inconsistentErrors.length, 0, 'Should not have inconsistent dimension errors');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Output Tests
// ---------------------------------------------------------------------------

describe('deterministic output', () => {
  it('should produce identical output for identical input', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer vs RNN',
      entries: [VALID_ENTRY_1, VALID_ENTRY_2],
      dimensions: ['computational_complexity', 'memory_complexity'],
    };

    const output1 = composeResearchComparison(input);
    const output2 = composeResearchComparison(input);

    assert.equal(output1.artifactId, output2.artifactId);
    assert.equal(output1.comparisonMatrix.methods.length, output2.comparisonMatrix.methods.length);
    assert.equal(output1.comparisonMatrix.dimensions.length, output2.comparisonMatrix.dimensions.length);
    assert.equal(output1.comparisonTrace.traceId, output2.comparisonTrace.traceId);
  });

  it('should have deterministic trace metadata', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer vs RNN',
      entries: [VALID_ENTRY_1, VALID_ENTRY_2],
      dimensions: ['computational_complexity', 'memory_complexity'],
    };

    const artifact = composeResearchComparison(input);

    assert.equal(artifact.comparisonTrace.deterministic, true);
    assert.equal(artifact.comparisonTrace.randomUsed, false);
    assert.equal(artifact.comparisonTrace.timeDependency, false);
    assert.equal(artifact.comparisonTrace.generatedFrom, 'deterministic_comparison_engine');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('immutable input', () => {
  it('should not mutate input entries', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer vs RNN',
      entries: [VALID_ENTRY_1, VALID_ENTRY_2],
      dimensions: ['computational_complexity', 'memory_complexity'],
    };

    const originalTitle = VALID_ENTRY_1.methodTitle;

    composeResearchComparison(input);

    assert.equal(VALID_ENTRY_1.methodTitle, originalTitle);
  });

  it('should not mutate input dimensions', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer vs RNN',
      entries: [VALID_ENTRY_1, VALID_ENTRY_2],
      dimensions: ['computational_complexity', 'memory_complexity'],
    };

    const originalLength = input.dimensions.length;

    composeResearchComparison(input);

    assert.equal(input.dimensions.length, originalLength);
  });
});

// ---------------------------------------------------------------------------
// No Generated Content Tests
// ---------------------------------------------------------------------------

describe('no generated content', () => {
  it('should not generate educational content', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer vs RNN',
      entries: [VALID_ENTRY_1, VALID_ENTRY_2],
      dimensions: ['computational_complexity', 'memory_complexity'],
    };

    const artifact = composeResearchComparison(input);

    // Comparison metadata should only contain input data, not generated summaries
    for (const entry of artifact.comparisonMatrix.entries) {
      assert.ok(!entry.methodTitle.includes('generated'));
      assert.ok(!entry.methodTitle.includes('synthesized'));
    }
  });
});

// ---------------------------------------------------------------------------
// No Inferred Recommendation Tests
// ---------------------------------------------------------------------------

describe('no inferred recommendation', () => {
  it('should not infer recommendations', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer vs RNN',
      entries: [VALID_ENTRY_1, VALID_ENTRY_2],
      dimensions: ['computational_complexity', 'memory_complexity'],
    };

    const artifact = composeResearchComparison(input);

    // Should not have any recommendation fields
    assert.ok(!('recommendation' in artifact), 'Should not have recommendation field');
    assert.ok(!('bestMethod' in artifact), 'Should not have bestMethod field');
    assert.ok(!('superiorMethod' in artifact), 'Should not have superiorMethod field');
  });
});

// ---------------------------------------------------------------------------
// No Ranking Tests
// ---------------------------------------------------------------------------

describe('no ranking', () => {
  it('should not rank methods', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer vs RNN',
      entries: [VALID_ENTRY_1, VALID_ENTRY_2],
      dimensions: ['computational_complexity', 'memory_complexity'],
    };

    const artifact = composeResearchComparison(input);

    // Should not have any ranking fields
    assert.ok(!('ranking' in artifact), 'Should not have ranking field');
    assert.ok(!('rank' in artifact), 'Should not have rank field');
    assert.ok(!('score' in artifact), 'Should not have score field');
  });
});

// ---------------------------------------------------------------------------
// Identical Output for Identical Input Tests
// ---------------------------------------------------------------------------

describe('identical output for identical input', () => {
  it('should produce identical comparison matrices', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer vs RNN',
      entries: [VALID_ENTRY_1, VALID_ENTRY_2],
      dimensions: ['computational_complexity', 'memory_complexity'],
    };

    const artifact1 = composeResearchComparison(input);
    const artifact2 = composeResearchComparison(input);

    assert.deepEqual(artifact1.comparisonMatrix, artifact2.comparisonMatrix);
  });

  it('should produce identical comparison traces', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer vs RNN',
      entries: [VALID_ENTRY_1, VALID_ENTRY_2],
      dimensions: ['computational_complexity', 'memory_complexity'],
    };

    const artifact1 = composeResearchComparison(input);
    const artifact2 = composeResearchComparison(input);

    assert.deepEqual(artifact1.comparisonTrace, artifact2.comparisonTrace);
  });
});

// ---------------------------------------------------------------------------
// Additional Negative Tests
// ---------------------------------------------------------------------------

describe('additional negative tests', () => {
  it('should validate complete artifact', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer vs RNN',
      entries: [VALID_ENTRY_1, VALID_ENTRY_2],
      dimensions: ['computational_complexity', 'memory_complexity'],
    };

    const artifact = composeResearchComparison(input);
    const result = validateResearchArtifactWithComparison(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate comparison input', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer vs RNN',
      entries: [VALID_ENTRY_1, VALID_ENTRY_2],
      dimensions: ['computational_complexity', 'memory_complexity'],
    };

    const errors = validateComparisonInput(input);
    assert.equal(errors.length, 0);
  });

  it('should detect missing concept ID in input', () => {
    const input: ResearchComparisonInput = {
      conceptId: '',
      conceptLabel: 'Transformer vs RNN',
      entries: [VALID_ENTRY_1],
      dimensions: ['computational_complexity'],
    };

    const errors = validateComparisonInput(input);
    const conceptError = errors.find((e) => e.field === 'conceptId');

    assert.ok(conceptError, 'Should have conceptId error');
  });

  it('should detect missing concept label in input', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: '',
      entries: [VALID_ENTRY_1],
      dimensions: ['computational_complexity'],
    };

    const errors = validateComparisonInput(input);
    const labelError = errors.find((e) => e.field === 'conceptLabel');

    assert.ok(labelError, 'Should have conceptLabel error');
  });

  it('should detect missing entries in input', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer vs RNN',
      entries: [],
      dimensions: ['computational_complexity'],
    };

    const errors = validateComparisonInput(input);
    const entriesError = errors.find((e) => e.field === 'entries');

    assert.ok(entriesError, 'Should have entries error');
  });

  it('should detect missing dimensions in input', () => {
    const input: ResearchComparisonInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformer vs RNN',
      entries: [VALID_ENTRY_1],
      dimensions: [],
    };

    const errors = validateComparisonInput(input);
    const dimensionsError = errors.find((e) => e.field === 'dimensions');

    assert.ok(dimensionsError, 'Should have dimensions error');
  });

  it('should compose comparison attributes correctly', () => {
    const attribute = composeComparisonAttribute(
      'attr-001',
      'computational_complexity',
      'O(n²)',
      'ref-001',
      'canonical',
    );

    assert.equal(attribute.attributeId, 'attr-001');
    assert.equal(attribute.dimension, 'computational_complexity');
    assert.equal(attribute.value, 'O(n²)');
    assert.equal(attribute.evidenceReferenceId, 'ref-001');
    assert.equal(attribute.governanceStatus, 'canonical');
  });

  it('should compose comparison values correctly', () => {
    const value = composeComparisonValue(
      'computational_complexity',
      [VALID_ATTRIBUTE_1],
    );

    assert.equal(value.dimension, 'computational_complexity');
    assert.equal(value.attributes.length, 1);
  });

  it('should compose comparison trace correctly', () => {
    const decisions = [
      {
        decisionId: 'decision-001',
        methodReferenceId: 'method-001',
        comparisonDimension: 'computational_complexity' as const,
        validationPassed: true,
        validationErrors: [],
      },
    ];

    const trace = composeComparisonTrace('trace-001', 2, 1, decisions);

    assert.equal(trace.traceId, 'trace-001');
    assert.equal(trace.methodCount, 2);
    assert.equal(trace.dimensionCount, 1);
    assert.equal(trace.entryCount, 1);
    assert.equal(trace.validatedCount, 1);
    assert.equal(trace.invalidCount, 0);
  });

  it('should detect invalid attributes', () => {
    const entry: ResearchComparisonEntry = {
      ...VALID_ENTRY_1,
      comparisonValues: [
        {
          dimension: 'computational_complexity',
          attributes: [],
        },
      ],
    };

    const errors = validateComparisonEntry(entry, ['method-001']);
    const attributeError = errors.find((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_ATTRIBUTE);

    assert.ok(attributeError, 'Should have COMPARISON_INVALID_ATTRIBUTE error');
  });

  it('should detect invalid governance status', () => {
    const entry: ResearchComparisonEntry = {
      ...VALID_ENTRY_1,
      governanceStatus: '' as any,
    };

    const errors = validateComparisonEntry(entry, ['method-001']);
    const statusError = errors.find((e) => e.code === COMPARISON_VALIDATION_CODES.COMPARISON_INVALID_STATUS);

    assert.ok(statusError, 'Should have COMPARISON_INVALID_STATUS error');
  });
});
