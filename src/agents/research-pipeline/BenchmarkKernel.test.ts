/**
 * NV-1400-D2-OPT-05 — Benchmark Intelligence Orchestration Test Suite
 *
 * Comprehensive tests for the benchmark kernel.
 * Covers: valid benchmark, valid benchmark registry, duplicate benchmark id,
 * duplicate benchmark name, unsupported category, unsupported benchmark type,
 * missing evidence, missing method, missing provenance, empty registry,
 * deterministic ordering, immutable input, identical output,
 * no benchmark execution, no generated content, no ranking, no scoring.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeBenchmarkProvenance,
  composeBenchmark,
  composeBenchmarkRegistry,
  composeResearchBenchmarks,
  composeBenchmarkTrace,
  isSupportedBenchmarkCategory,
  isSupportedBenchmarkType,
  getCanonicalBenchmarkCategories,
  getCanonicalBenchmarkTypes,
} from './BenchmarkKernel.ts';

import {
  validateBenchmark,
  validateBenchmarkRegistry,
  validateResearchArtifactWithBenchmarks,
  validateBenchmarkInput,
  BENCHMARK_VALIDATION_CODES,
} from './BenchmarkValidation.ts';

import type {
  ResearchBenchmark,
  ResearchBenchmarkInput,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE_1 = {
  benchmarkId: 'benchmark-001',
  referenceId: 'ref-001',
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  benchmarkCategory: 'classification' as const,
  benchmarkType: 'academic' as const,
  rationale: 'ImageNet is a standard benchmark for image classification.',
};

const VALID_PROVENANCE_2 = {
  benchmarkId: 'benchmark-002',
  referenceId: 'ref-002',
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  benchmarkCategory: 'language_understanding' as const,
  benchmarkType: 'academic' as const,
  rationale: 'GLUE is a standard benchmark for language understanding.',
};

const VALID_BENCHMARK_1: ResearchBenchmark = {
  benchmarkId: 'benchmark-001',
  benchmarkName: 'ImageNet',
  benchmarkCategory: 'classification',
  benchmarkType: 'academic',
  associatedMethods: ['method-001', 'method-002'],
  associatedEvidence: ['ref-001', 'ref-002'],
  officialSource: 'https://www.image-net.org',
  governanceStatus: 'canonical',
  lifecycle: 'active',
  rationale: 'Standard benchmark for image classification.',
  provenance: VALID_PROVENANCE_1,
};

const VALID_BENCHMARK_2: ResearchBenchmark = {
  benchmarkId: 'benchmark-002',
  benchmarkName: 'GLUE',
  benchmarkCategory: 'language_understanding',
  benchmarkType: 'academic',
  associatedMethods: ['method-003', 'method-004'],
  associatedEvidence: ['ref-003', 'ref-004'],
  officialSource: 'https://gluebenchmark.com',
  governanceStatus: 'canonical',
  lifecycle: 'active',
  rationale: 'Standard benchmark for language understanding.',
  provenance: VALID_PROVENANCE_2,
};

// ---------------------------------------------------------------------------
// Valid Benchmark Tests
// ---------------------------------------------------------------------------

describe('composeBenchmark', () => {
  it('should compose a valid benchmark', () => {
    const benchmark = composeBenchmark(
      'benchmark-001',
      'ImageNet',
      'classification',
      'academic',
      ['method-001'],
      ['ref-001'],
      'https://www.image-net.org',
      'canonical',
      'active',
      'Standard benchmark.',
      VALID_PROVENANCE_1,
    );

    assert.equal(benchmark.benchmarkId, 'benchmark-001');
    assert.equal(benchmark.benchmarkName, 'ImageNet');
    assert.equal(benchmark.benchmarkCategory, 'classification');
    assert.equal(benchmark.benchmarkType, 'academic');
    assert.equal(benchmark.lifecycle, 'active');
  });
});

// ---------------------------------------------------------------------------
// Valid Benchmark Registry Tests
// ---------------------------------------------------------------------------

describe('composeBenchmarkRegistry', () => {
  it('should compose a valid benchmark registry', () => {
    const registry = composeBenchmarkRegistry('registry-001', [VALID_BENCHMARK_1, VALID_BENCHMARK_2]);

    assert.equal(registry.registryId, 'registry-001');
    assert.equal(registry.benchmarks.length, 2);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Benchmark ID Tests
// ---------------------------------------------------------------------------

describe('duplicate benchmark id validation', () => {
  it('should detect duplicate benchmark IDs', () => {
    const registry = composeBenchmarkRegistry('registry-001', [
      VALID_BENCHMARK_1,
      { ...VALID_BENCHMARK_1, benchmarkId: 'benchmark-001' },
    ]);

    const errors = validateBenchmarkRegistry(registry);
    const duplicateError = errors.find((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_DUPLICATE_ID);

    assert.ok(duplicateError, 'Should have BENCHMARK_DUPLICATE_ID error');
  });

  it('should not flag unique benchmark IDs as duplicates', () => {
    const registry = composeBenchmarkRegistry('registry-001', [VALID_BENCHMARK_1, VALID_BENCHMARK_2]);
    const errors = validateBenchmarkRegistry(registry);
    const duplicateErrors = errors.filter((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_DUPLICATE_ID);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Benchmark Name Tests
// ---------------------------------------------------------------------------

describe('duplicate benchmark name validation', () => {
  it('should detect duplicate benchmark names', () => {
    const registry = composeBenchmarkRegistry('registry-001', [
      VALID_BENCHMARK_1,
      { ...VALID_BENCHMARK_1, benchmarkId: 'benchmark-003' },
    ]);

    const errors = validateBenchmarkRegistry(registry);
    const duplicateError = errors.find((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_DUPLICATE_NAME);

    assert.ok(duplicateError, 'Should have BENCHMARK_DUPLICATE_NAME error');
  });

  it('should not flag unique benchmark names as duplicates', () => {
    const registry = composeBenchmarkRegistry('registry-001', [VALID_BENCHMARK_1, VALID_BENCHMARK_2]);
    const errors = validateBenchmarkRegistry(registry);
    const duplicateErrors = errors.filter((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_DUPLICATE_NAME);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Category Tests
// ---------------------------------------------------------------------------

describe('unsupported category validation', () => {
  it('should detect unsupported category', () => {
    const benchmark: ResearchBenchmark = {
      ...VALID_BENCHMARK_1,
      benchmarkCategory: 'unsupported_category' as any,
    };

    const errors = validateBenchmark(benchmark);
    const unsupportedError = errors.find((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_UNKNOWN_CATEGORY);

    assert.ok(unsupportedError, 'Should have BENCHMARK_UNKNOWN_CATEGORY error');
  });

  it('should support all canonical categories', () => {
    const categories = getCanonicalBenchmarkCategories();
    assert.equal(categories.length, 14);
    assert.ok(categories.includes('classification'));
    assert.ok(categories.includes('regression'));
    assert.ok(categories.includes('object_detection'));
    assert.ok(categories.includes('image_segmentation'));
    assert.ok(categories.includes('language_understanding'));
    assert.ok(categories.includes('language_generation'));
    assert.ok(categories.includes('retrieval'));
    assert.ok(categories.includes('reasoning'));
    assert.ok(categories.includes('planning'));
    assert.ok(categories.includes('reinforcement_learning'));
    assert.ok(categories.includes('multimodal'));
    assert.ok(categories.includes('speech'));
    assert.ok(categories.includes('time_series'));
    assert.ok(categories.includes('recommendation'));
  });

  it('should correctly identify supported categories', () => {
    assert.equal(isSupportedBenchmarkCategory('classification'), true);
    assert.equal(isSupportedBenchmarkCategory('regression'), true);
    assert.equal(isSupportedBenchmarkCategory('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Unsupported Benchmark Type Tests
// ---------------------------------------------------------------------------

describe('unsupported benchmark type validation', () => {
  it('should detect unsupported benchmark type', () => {
    const benchmark: ResearchBenchmark = {
      ...VALID_BENCHMARK_1,
      benchmarkType: 'unsupported_type' as any,
    };

    const errors = validateBenchmark(benchmark);
    const unsupportedError = errors.find((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_UNKNOWN_TYPE);

    assert.ok(unsupportedError, 'Should have BENCHMARK_UNKNOWN_TYPE error');
  });

  it('should support all canonical benchmark types', () => {
    const types = getCanonicalBenchmarkTypes();
    assert.equal(types.length, 6);
    assert.ok(types.includes('academic'));
    assert.ok(types.includes('industry'));
    assert.ok(types.includes('competition'));
    assert.ok(types.includes('standardized'));
    assert.ok(types.includes('historical'));
    assert.ok(types.includes('reference'));
  });

  it('should correctly identify supported benchmark types', () => {
    assert.equal(isSupportedBenchmarkType('academic'), true);
    assert.equal(isSupportedBenchmarkType('industry'), true);
    assert.equal(isSupportedBenchmarkType('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Missing Evidence Tests
// ---------------------------------------------------------------------------

describe('missing evidence validation', () => {
  it('should detect missing associated evidence', () => {
    const benchmark: ResearchBenchmark = {
      ...VALID_BENCHMARK_1,
      associatedEvidence: [],
    };

    const errors = validateBenchmark(benchmark);
    const evidenceError = errors.find((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_EVIDENCE);

    assert.ok(evidenceError, 'Should have BENCHMARK_MISSING_EVIDENCE error');
  });

  it('should not flag valid evidence', () => {
    const errors = validateBenchmark(VALID_BENCHMARK_1);
    const evidenceErrors = errors.filter((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_EVIDENCE);

    assert.equal(evidenceErrors.length, 0, 'Should not have evidence errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Method Tests
// ---------------------------------------------------------------------------

describe('missing method validation', () => {
  it('should detect missing associated methods', () => {
    const benchmark: ResearchBenchmark = {
      ...VALID_BENCHMARK_1,
      associatedMethods: [],
    };

    const errors = validateBenchmark(benchmark);
    const methodError = errors.find((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_METHOD);

    assert.ok(methodError, 'Should have BENCHMARK_MISSING_METHOD error');
  });

  it('should not flag valid methods', () => {
    const errors = validateBenchmark(VALID_BENCHMARK_1);
    const methodErrors = errors.filter((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_METHOD);

    assert.equal(methodErrors.length, 0, 'Should not have method errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('missing provenance validation', () => {
  it('should detect missing provenance', () => {
    const benchmark: ResearchBenchmark = {
      ...VALID_BENCHMARK_1,
      provenance: null as any,
    };

    const errors = validateBenchmark(benchmark);
    const provenanceError = errors.find((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have BENCHMARK_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const benchmark: ResearchBenchmark = {
      ...VALID_BENCHMARK_1,
      provenance: {
        ...VALID_PROVENANCE_1,
        rationale: '',
      },
    };

    const errors = validateBenchmark(benchmark);
    const provenanceError = errors.find((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have BENCHMARK_MISSING_PROVENANCE error');
  });

  it('should not flag valid provenance', () => {
    const errors = validateBenchmark(VALID_BENCHMARK_1);
    const provenanceErrors = errors.filter((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_PROVENANCE);

    assert.equal(provenanceErrors.length, 0, 'Should not have provenance errors');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('empty registry validation', () => {
  it('should detect empty registry', () => {
    const registry = composeBenchmarkRegistry('registry-001', []);
    const errors = validateBenchmarkRegistry(registry);
    const emptyErrors = errors.filter((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_EMPTY_REGISTRY);

    assert.ok(emptyErrors.length > 0, 'Should have BENCHMARK_EMPTY_REGISTRY errors');
  });

  it('should not flag non-empty registry', () => {
    const registry = composeBenchmarkRegistry('registry-001', [VALID_BENCHMARK_1]);
    const errors = validateBenchmarkRegistry(registry);
    const emptyErrors = errors.filter((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_EMPTY_REGISTRY);

    assert.equal(emptyErrors.length, 0, 'Should not have empty registry errors');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('deterministic ordering', () => {
  it('should sort benchmarks deterministically by ID', () => {
    const registry = composeBenchmarkRegistry('registry-001', [VALID_BENCHMARK_2, VALID_BENCHMARK_1]);

    assert.equal(registry.benchmarks[0].benchmarkId, 'benchmark-001');
    assert.equal(registry.benchmarks[1].benchmarkId, 'benchmark-002');
  });

  it('should produce identical ordering for identical input', () => {
    const input: ResearchBenchmarkInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Benchmarks',
      benchmarks: [VALID_BENCHMARK_2, VALID_BENCHMARK_1],
    };

    const output1 = composeResearchBenchmarks(input);
    const output2 = composeResearchBenchmarks(input);

    assert.deepEqual(output1.benchmarkRegistry.benchmarks, output2.benchmarkRegistry.benchmarks);
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('immutable input', () => {
  it('should not mutate input benchmarks', () => {
    const input: ResearchBenchmarkInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Benchmarks',
      benchmarks: [VALID_BENCHMARK_1, VALID_BENCHMARK_2],
    };

    const originalName = VALID_BENCHMARK_1.benchmarkName;

    composeResearchBenchmarks(input);

    assert.equal(VALID_BENCHMARK_1.benchmarkName, originalName);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('identical output', () => {
  it('should produce identical registries', () => {
    const input: ResearchBenchmarkInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Benchmarks',
      benchmarks: [VALID_BENCHMARK_1, VALID_BENCHMARK_2],
    };

    const artifact1 = composeResearchBenchmarks(input);
    const artifact2 = composeResearchBenchmarks(input);

    assert.deepEqual(artifact1.benchmarkRegistry, artifact2.benchmarkRegistry);
  });

  it('should produce identical traces', () => {
    const input: ResearchBenchmarkInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Benchmarks',
      benchmarks: [VALID_BENCHMARK_1, VALID_BENCHMARK_2],
    };

    const artifact1 = composeResearchBenchmarks(input);
    const artifact2 = composeResearchBenchmarks(input);

    assert.deepEqual(artifact1.benchmarkTrace, artifact2.benchmarkTrace);
  });
});

// ---------------------------------------------------------------------------
// No Benchmark Execution Tests
// ---------------------------------------------------------------------------

describe('no benchmark execution', () => {
  it('should not execute benchmarks', () => {
    const input: ResearchBenchmarkInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Benchmarks',
      benchmarks: [VALID_BENCHMARK_1, VALID_BENCHMARK_2],
    };

    const artifact = composeResearchBenchmarks(input);

    // Should not have execution fields
    assert.ok(!('executionResults' in artifact), 'Should not have executionResults field');
    assert.ok(!('scores' in artifact), 'Should not have scores field');
    assert.ok(!('leaderboard' in artifact), 'Should not have leaderboard field');
  });
});

// ---------------------------------------------------------------------------
// No Generated Content Tests
// ---------------------------------------------------------------------------

describe('no generated content', () => {
  it('should not generate educational content', () => {
    const input: ResearchBenchmarkInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Benchmarks',
      benchmarks: [VALID_BENCHMARK_1, VALID_BENCHMARK_2],
    };

    const artifact = composeResearchBenchmarks(input);

    // Benchmark metadata should only contain input data, not generated summaries
    for (const benchmark of artifact.benchmarkRegistry.benchmarks) {
      assert.ok(!benchmark.benchmarkName.includes('generated'));
      assert.ok(!benchmark.benchmarkName.includes('synthesized'));
    }
  });
});

// ---------------------------------------------------------------------------
// No Ranking Tests
// ---------------------------------------------------------------------------

describe('no ranking', () => {
  it('should not rank benchmarks', () => {
    const input: ResearchBenchmarkInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Benchmarks',
      benchmarks: [VALID_BENCHMARK_1, VALID_BENCHMARK_2],
    };

    const artifact = composeResearchBenchmarks(input);

    // Should not have ranking fields
    assert.ok(!('ranking' in artifact), 'Should not have ranking field');
    assert.ok(!('rank' in artifact), 'Should not have rank field');
    assert.ok(!('score' in artifact), 'Should not have score field');
  });
});

// ---------------------------------------------------------------------------
// No Scoring Tests
// ---------------------------------------------------------------------------

describe('no scoring', () => {
  it('should not compute scores', () => {
    const input: ResearchBenchmarkInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Benchmarks',
      benchmarks: [VALID_BENCHMARK_1, VALID_BENCHMARK_2],
    };

    const artifact = composeResearchBenchmarks(input);

    // Should not have scoring fields
    assert.ok(!('scores' in artifact), 'Should not have scores field');
    assert.ok(!('metrics' in artifact), 'Should not have metrics field');
    assert.ok(!('performance' in artifact), 'Should not have performance field');
  });
});

// ---------------------------------------------------------------------------
// Additional Negative Tests
// ---------------------------------------------------------------------------

describe('additional negative tests', () => {
  it('should validate complete artifact', () => {
    const input: ResearchBenchmarkInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Benchmarks',
      benchmarks: [VALID_BENCHMARK_1, VALID_BENCHMARK_2],
    };

    const artifact = composeResearchBenchmarks(input);
    const result = validateResearchArtifactWithBenchmarks(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate benchmark input', () => {
    const input: ResearchBenchmarkInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Benchmarks',
      benchmarks: [VALID_BENCHMARK_1, VALID_BENCHMARK_2],
    };

    const errors = validateBenchmarkInput(input);
    assert.equal(errors.length, 0);
  });

  it('should detect missing concept ID in input', () => {
    const input: ResearchBenchmarkInput = {
      conceptId: '',
      conceptLabel: 'Benchmarks',
      benchmarks: [VALID_BENCHMARK_1],
    };

    const errors = validateBenchmarkInput(input);
    const conceptError = errors.find((e) => e.field === 'conceptId');

    assert.ok(conceptError, 'Should have conceptId error');
  });

  it('should detect missing concept label in input', () => {
    const input: ResearchBenchmarkInput = {
      conceptId: 'concept-001',
      conceptLabel: '',
      benchmarks: [VALID_BENCHMARK_1],
    };

    const errors = validateBenchmarkInput(input);
    const labelError = errors.find((e) => e.field === 'conceptLabel');

    assert.ok(labelError, 'Should have conceptLabel error');
  });

  it('should detect missing benchmarks in input', () => {
    const input: ResearchBenchmarkInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Benchmarks',
      benchmarks: [],
    };

    const errors = validateBenchmarkInput(input);
    const benchmarksError = errors.find((e) => e.field === 'benchmarks');

    assert.ok(benchmarksError, 'Should have benchmarks error');
  });

  it('should compose benchmark provenance correctly', () => {
    const provenance = composeBenchmarkProvenance(
      'benchmark-001',
      'ref-001',
      'research-agent',
      'canonical',
      'classification',
      'academic',
      'Standard benchmark.',
    );

    assert.equal(provenance.benchmarkId, 'benchmark-001');
    assert.equal(provenance.referenceId, 'ref-001');
    assert.equal(provenance.source, 'research-agent');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.benchmarkCategory, 'classification');
    assert.equal(provenance.benchmarkType, 'academic');
    assert.equal(provenance.rationale, 'Standard benchmark.');
  });

  it('should compose benchmark trace correctly', () => {
    const decisions = [
      {
        decisionId: 'decision-001',
        benchmarkId: 'benchmark-001',
        benchmarkName: 'ImageNet',
        validationPassed: true,
        validationErrors: [],
      },
    ];

    const trace = composeBenchmarkTrace('trace-001', decisions);

    assert.equal(trace.traceId, 'trace-001');
    assert.equal(trace.benchmarkCount, 1);
    assert.equal(trace.validatedCount, 1);
    assert.equal(trace.invalidCount, 0);
  });

  it('should detect invalid governance status', () => {
    const benchmark: ResearchBenchmark = {
      ...VALID_BENCHMARK_1,
      governanceStatus: '' as any,
    };

    const errors = validateBenchmark(benchmark);
    const statusError = errors.find((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_INVALID_STATUS);

    assert.ok(statusError, 'Should have BENCHMARK_INVALID_STATUS error');
  });

  it('should detect missing official source', () => {
    const benchmark: ResearchBenchmark = {
      ...VALID_BENCHMARK_1,
      officialSource: '',
    };

    const errors = validateBenchmark(benchmark);
    const sourceError = errors.find((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_SOURCE);

    assert.ok(sourceError, 'Should have BENCHMARK_MISSING_SOURCE error');
  });

  it('should detect missing rationale', () => {
    const benchmark: ResearchBenchmark = {
      ...VALID_BENCHMARK_1,
      rationale: '',
    };

    const errors = validateBenchmark(benchmark);
    const rationaleError = errors.find((e) => e.code === BENCHMARK_VALIDATION_CODES.BENCHMARK_MISSING_SOURCE);

    assert.ok(rationaleError, 'Should have BENCHMARK_MISSING_SOURCE error');
  });
});
