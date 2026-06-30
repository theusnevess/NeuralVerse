/**
 * NV-1400-D2-OPT-07 — Industry Adoption Intelligence Orchestration Test Suite
 *
 * Comprehensive tests for the industry kernel.
 * Covers: valid industry record, valid registry, duplicate id,
 * duplicate record, unsupported sector, unsupported adoption type,
 * unsupported adoption stage, missing evidence, missing use case,
 * missing provenance, empty registry, deterministic ordering,
 * immutable input, identical output, no company monitoring,
 * no trend prediction, no generated content.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeIndustryProvenance,
  composeIndustryUseCase,
  composeIndustryReference,
  composeIndustryRegistry,
  composeResearchIndustry,
  composeIndustryTrace,
  isSupportedIndustrySector,
  isSupportedAdoptionType,
  isSupportedAdoptionStage,
  getCanonicalIndustrySectors,
  getCanonicalAdoptionTypes,
  getCanonicalAdoptionStages,
} from './IndustryKernel.ts';

import {
  validateIndustryRecord,
  validateIndustryRegistry,
  validateResearchArtifactWithIndustry,
  validateIndustryInput,
  INDUSTRY_VALIDATION_CODES,
} from './IndustryValidation.ts';

import type {
  ResearchIndustryReference,
  ResearchIndustryInput,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE_1 = {
  industryId: 'industry-001',
  referenceId: 'ref-001',
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  sector: 'healthcare' as const,
  adoptionType: 'production' as const,
  adoptionStage: 'established' as const,
  rationale: 'Deep learning is widely adopted in medical imaging.',
};

const VALID_PROVENANCE_2 = {
  industryId: 'industry-002',
  referenceId: 'ref-002',
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  sector: 'finance' as const,
  adoptionType: 'production' as const,
  adoptionStage: 'mature' as const,
  rationale: 'Machine learning is used for fraud detection.',
};

const VALID_USE_CASE_1 = {
  useCaseId: 'usecase-001',
  title: 'Medical Image Analysis',
  description: 'Using deep learning for analyzing medical images.',
  sector: 'healthcare' as const,
  adoptionType: 'production' as const,
  adoptionStage: 'established' as const,
  associatedMethods: ['method-001', 'method-002'],
  rationale: 'Deep learning has shown success in medical imaging.',
};

const VALID_USE_CASE_2 = {
  useCaseId: 'usecase-002',
  title: 'Fraud Detection',
  description: 'Using machine learning for detecting fraudulent transactions.',
  sector: 'finance' as const,
  adoptionType: 'production' as const,
  adoptionStage: 'mature' as const,
  associatedMethods: ['method-003', 'method-004'],
  rationale: 'ML models are effective for fraud detection.',
};

const VALID_RECORD_1: ResearchIndustryReference = {
  industryId: 'industry-001',
  sector: 'healthcare',
  adoptionType: 'production',
  adoptionStage: 'established',
  useCases: [VALID_USE_CASE_1],
  associatedMethods: ['method-001', 'method-002'],
  associatedEvidence: ['ref-001', 'ref-002'],
  associatedBenchmarks: ['benchmark-001'],
  associatedDatasets: ['dataset-001'],
  officialSource: 'https://example.com/healthcare',
  governanceStatus: 'canonical',
  lifecycle: 'active',
  rationale: 'Deep learning is widely adopted in healthcare.',
  provenance: VALID_PROVENANCE_1,
};

const VALID_RECORD_2: ResearchIndustryReference = {
  industryId: 'industry-002',
  sector: 'finance',
  adoptionType: 'production',
  adoptionStage: 'mature',
  useCases: [VALID_USE_CASE_2],
  associatedMethods: ['method-003', 'method-004'],
  associatedEvidence: ['ref-003', 'ref-004'],
  associatedBenchmarks: ['benchmark-002'],
  associatedDatasets: ['dataset-002'],
  officialSource: 'https://example.com/finance',
  governanceStatus: 'canonical',
  lifecycle: 'active',
  rationale: 'ML is widely adopted in finance.',
  provenance: VALID_PROVENANCE_2,
};

// ---------------------------------------------------------------------------
// Valid Industry Record Tests
// ---------------------------------------------------------------------------

describe('composeIndustryReference', () => {
  it('should compose a valid industry reference', () => {
    const record = composeIndustryReference(
      'industry-001',
      'healthcare',
      'production',
      'established',
      [VALID_USE_CASE_1],
      ['method-001'],
      ['ref-001'],
      ['benchmark-001'],
      ['dataset-001'],
      'https://example.com',
      'canonical',
      'active',
      'Test rationale.',
      VALID_PROVENANCE_1,
    );

    assert.equal(record.industryId, 'industry-001');
    assert.equal(record.sector, 'healthcare');
    assert.equal(record.adoptionType, 'production');
    assert.equal(record.adoptionStage, 'established');
    assert.equal(record.lifecycle, 'active');
  });
});

// ---------------------------------------------------------------------------
// Valid Registry Tests
// ---------------------------------------------------------------------------

describe('composeIndustryRegistry', () => {
  it('should compose a valid industry registry', () => {
    const registry = composeIndustryRegistry('registry-001', [VALID_RECORD_1, VALID_RECORD_2]);

    assert.equal(registry.registryId, 'registry-001');
    assert.equal(registry.records.length, 2);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Duplicate ID Tests
// ---------------------------------------------------------------------------

describe('duplicate id validation', () => {
  it('should detect duplicate industry IDs', () => {
    const registry = composeIndustryRegistry('registry-001', [
      VALID_RECORD_1,
      { ...VALID_RECORD_1, industryId: 'industry-001' },
    ]);

    const errors = validateIndustryRegistry(registry);
    const duplicateError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_DUPLICATE_ID);

    assert.ok(duplicateError, 'Should have INDUSTRY_DUPLICATE_ID error');
  });

  it('should not flag unique IDs as duplicates', () => {
    const registry = composeIndustryRegistry('registry-001', [VALID_RECORD_1, VALID_RECORD_2]);
    const errors = validateIndustryRegistry(registry);
    const duplicateErrors = errors.filter((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_DUPLICATE_ID);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Record Tests
// ---------------------------------------------------------------------------

describe('duplicate record validation', () => {
  it('should detect duplicate records (same sector + adoptionType)', () => {
    const registry = composeIndustryRegistry('registry-001', [
      VALID_RECORD_1,
      { ...VALID_RECORD_2, industryId: 'industry-003', sector: 'healthcare', adoptionType: 'production' },
    ]);

    const errors = validateIndustryRegistry(registry);
    const duplicateError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_DUPLICATE_RECORD);

    assert.ok(duplicateError, 'Should have INDUSTRY_DUPLICATE_RECORD error');
  });

  it('should not flag unique records as duplicates', () => {
    const registry = composeIndustryRegistry('registry-001', [VALID_RECORD_1, VALID_RECORD_2]);
    const errors = validateIndustryRegistry(registry);
    const duplicateErrors = errors.filter((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_DUPLICATE_RECORD);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate record errors');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Sector Tests
// ---------------------------------------------------------------------------

describe('unsupported sector validation', () => {
  it('should detect unsupported sector', () => {
    const record: ResearchIndustryReference = {
      ...VALID_RECORD_1,
      sector: 'unsupported_sector' as any,
    };

    const errors = validateIndustryRecord(record);
    const unsupportedError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_UNKNOWN_SECTOR);

    assert.ok(unsupportedError, 'Should have INDUSTRY_UNKNOWN_SECTOR error');
  });

  it('should support all canonical sectors', () => {
    const sectors = getCanonicalIndustrySectors();
    assert.equal(sectors.length, 14);
    assert.ok(sectors.includes('healthcare'));
    assert.ok(sectors.includes('finance'));
    assert.ok(sectors.includes('manufacturing'));
    assert.ok(sectors.includes('automotive'));
    assert.ok(sectors.includes('robotics'));
    assert.ok(sectors.includes('agriculture'));
    assert.ok(sectors.includes('education'));
    assert.ok(sectors.includes('cybersecurity'));
    assert.ok(sectors.includes('telecommunications'));
    assert.ok(sectors.includes('retail'));
    assert.ok(sectors.includes('logistics'));
    assert.ok(sectors.includes('energy'));
    assert.ok(sectors.includes('government'));
    assert.ok(sectors.includes('scientific_research'));
  });

  it('should correctly identify supported sectors', () => {
    assert.equal(isSupportedIndustrySector('healthcare'), true);
    assert.equal(isSupportedIndustrySector('finance'), true);
    assert.equal(isSupportedIndustrySector('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Unsupported Adoption Type Tests
// ---------------------------------------------------------------------------

describe('unsupported adoption type validation', () => {
  it('should detect unsupported adoption type', () => {
    const record: ResearchIndustryReference = {
      ...VALID_RECORD_1,
      adoptionType: 'unsupported_type' as any,
    };

    const errors = validateIndustryRecord(record);
    const unsupportedError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_UNKNOWN_ADOPTION_TYPE);

    assert.ok(unsupportedError, 'Should have INDUSTRY_UNKNOWN_ADOPTION_TYPE error');
  });

  it('should support all canonical adoption types', () => {
    const types = getCanonicalAdoptionTypes();
    assert.equal(types.length, 7);
    assert.ok(types.includes('research_only'));
    assert.ok(types.includes('prototype'));
    assert.ok(types.includes('pilot'));
    assert.ok(types.includes('production'));
    assert.ok(types.includes('standard_practice'));
    assert.ok(types.includes('legacy'));
    assert.ok(types.includes('deprecated'));
  });

  it('should correctly identify supported adoption types', () => {
    assert.equal(isSupportedAdoptionType('production'), true);
    assert.equal(isSupportedAdoptionType('prototype'), true);
    assert.equal(isSupportedAdoptionType('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Unsupported Adoption Stage Tests
// ---------------------------------------------------------------------------

describe('unsupported adoption stage validation', () => {
  it('should detect unsupported adoption stage', () => {
    const record: ResearchIndustryReference = {
      ...VALID_RECORD_1,
      adoptionStage: 'unsupported_stage' as any,
    };

    const errors = validateIndustryRecord(record);
    const unsupportedError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_UNKNOWN_STAGE);

    assert.ok(unsupportedError, 'Should have INDUSTRY_UNKNOWN_STAGE error');
  });

  it('should support all canonical adoption stages', () => {
    const stages = getCanonicalAdoptionStages();
    assert.equal(stages.length, 5);
    assert.ok(stages.includes('experimental'));
    assert.ok(stages.includes('emerging'));
    assert.ok(stages.includes('growing'));
    assert.ok(stages.includes('established'));
    assert.ok(stages.includes('mature'));
  });

  it('should correctly identify supported adoption stages', () => {
    assert.equal(isSupportedAdoptionStage('experimental'), true);
    assert.equal(isSupportedAdoptionStage('mature'), true);
    assert.equal(isSupportedAdoptionStage('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Missing Evidence Tests
// ---------------------------------------------------------------------------

describe('missing evidence validation', () => {
  it('should detect missing associated evidence', () => {
    const record: ResearchIndustryReference = {
      ...VALID_RECORD_1,
      associatedEvidence: [],
    };

    const errors = validateIndustryRecord(record);
    const evidenceError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_EVIDENCE);

    assert.ok(evidenceError, 'Should have INDUSTRY_MISSING_EVIDENCE error');
  });

  it('should not flag valid evidence', () => {
    const errors = validateIndustryRecord(VALID_RECORD_1);
    const evidenceErrors = errors.filter((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_EVIDENCE);

    assert.equal(evidenceErrors.length, 0, 'Should not have evidence errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Use Case Tests
// ---------------------------------------------------------------------------

describe('missing use case validation', () => {
  it('should detect missing use cases', () => {
    const record: ResearchIndustryReference = {
      ...VALID_RECORD_1,
      useCases: [],
    };

    const errors = validateIndustryRecord(record);
    const useCaseError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_USE_CASE);

    assert.ok(useCaseError, 'Should have INDUSTRY_MISSING_USE_CASE error');
  });

  it('should detect missing use case title', () => {
    const record: ResearchIndustryReference = {
      ...VALID_RECORD_1,
      useCases: [{ ...VALID_USE_CASE_1, title: '' }],
    };

    const errors = validateIndustryRecord(record);
    const useCaseError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_USE_CASE);

    assert.ok(useCaseError, 'Should have INDUSTRY_MISSING_USE_CASE error');
  });

  it('should detect missing use case description', () => {
    const record: ResearchIndustryReference = {
      ...VALID_RECORD_1,
      useCases: [{ ...VALID_USE_CASE_1, description: '' }],
    };

    const errors = validateIndustryRecord(record);
    const useCaseError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_USE_CASE);

    assert.ok(useCaseError, 'Should have INDUSTRY_MISSING_USE_CASE error');
  });

  it('should not flag valid use cases', () => {
    const errors = validateIndustryRecord(VALID_RECORD_1);
    const useCaseErrors = errors.filter((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_USE_CASE);

    assert.equal(useCaseErrors.length, 0, 'Should not have use case errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('missing provenance validation', () => {
  it('should detect missing provenance', () => {
    const record: ResearchIndustryReference = {
      ...VALID_RECORD_1,
      provenance: null as any,
    };

    const errors = validateIndustryRecord(record);
    const provenanceError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have INDUSTRY_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const record: ResearchIndustryReference = {
      ...VALID_RECORD_1,
      provenance: {
        ...VALID_PROVENANCE_1,
        rationale: '',
      },
    };

    const errors = validateIndustryRecord(record);
    const provenanceError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have INDUSTRY_MISSING_PROVENANCE error');
  });

  it('should not flag valid provenance', () => {
    const errors = validateIndustryRecord(VALID_RECORD_1);
    const provenanceErrors = errors.filter((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_PROVENANCE);

    assert.equal(provenanceErrors.length, 0, 'Should not have provenance errors');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('empty registry validation', () => {
  it('should detect empty registry', () => {
    const registry = composeIndustryRegistry('registry-001', []);
    const errors = validateIndustryRegistry(registry);
    const emptyErrors = errors.filter((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_EMPTY_REGISTRY);

    assert.ok(emptyErrors.length > 0, 'Should have INDUSTRY_EMPTY_REGISTRY errors');
  });

  it('should not flag non-empty registry', () => {
    const registry = composeIndustryRegistry('registry-001', [VALID_RECORD_1]);
    const errors = validateIndustryRegistry(registry);
    const emptyErrors = errors.filter((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_EMPTY_REGISTRY);

    assert.equal(emptyErrors.length, 0, 'Should not have empty registry errors');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('deterministic ordering', () => {
  it('should sort records deterministically by ID', () => {
    const registry = composeIndustryRegistry('registry-001', [VALID_RECORD_2, VALID_RECORD_1]);

    assert.equal(registry.records[0].industryId, 'industry-001');
    assert.equal(registry.records[1].industryId, 'industry-002');
  });

  it('should produce identical ordering for identical input', () => {
    const input: ResearchIndustryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Industry',
      records: [VALID_RECORD_2, VALID_RECORD_1],
    };

    const output1 = composeResearchIndustry(input);
    const output2 = composeResearchIndustry(input);

    assert.deepEqual(output1.industryRegistry.records, output2.industryRegistry.records);
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('immutable input', () => {
  it('should not mutate input records', () => {
    const input: ResearchIndustryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Industry',
      records: [VALID_RECORD_1, VALID_RECORD_2],
    };

    const originalId = VALID_RECORD_1.industryId;

    composeResearchIndustry(input);

    assert.equal(VALID_RECORD_1.industryId, originalId);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('identical output', () => {
  it('should produce identical registries', () => {
    const input: ResearchIndustryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Industry',
      records: [VALID_RECORD_1, VALID_RECORD_2],
    };

    const artifact1 = composeResearchIndustry(input);
    const artifact2 = composeResearchIndustry(input);

    assert.deepEqual(artifact1.industryRegistry, artifact2.industryRegistry);
  });

  it('should produce identical traces', () => {
    const input: ResearchIndustryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Industry',
      records: [VALID_RECORD_1, VALID_RECORD_2],
    };

    const artifact1 = composeResearchIndustry(input);
    const artifact2 = composeResearchIndustry(input);

    assert.deepEqual(artifact1.industryTrace, artifact2.industryTrace);
  });
});

// ---------------------------------------------------------------------------
// No Company Monitoring Tests
// ---------------------------------------------------------------------------

describe('no company monitoring', () => {
  it('should not monitor companies', () => {
    const input: ResearchIndustryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Industry',
      records: [VALID_RECORD_1, VALID_RECORD_2],
    };

    const artifact = composeResearchIndustry(input);

    // Should not have monitoring fields
    assert.ok(!('companyData' in artifact), 'Should not have companyData field');
    assert.ok(!('monitoring' in artifact), 'Should not have monitoring field');
    assert.ok(!('tracking' in artifact), 'Should not have tracking field');
  });
});

// ---------------------------------------------------------------------------
// No Trend Prediction Tests
// ---------------------------------------------------------------------------

describe('no trend prediction', () => {
  it('should not predict trends', () => {
    const input: ResearchIndustryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Industry',
      records: [VALID_RECORD_1, VALID_RECORD_2],
    };

    const artifact = composeResearchIndustry(input);

    // Should not have prediction fields
    assert.ok(!('predictions' in artifact), 'Should not have predictions field');
    assert.ok(!('forecasts' in artifact), 'Should not have forecasts field');
    assert.ok(!('trends' in artifact), 'Should not have trends field');
  });
});

// ---------------------------------------------------------------------------
// No Generated Content Tests
// ---------------------------------------------------------------------------

describe('no generated content', () => {
  it('should not generate educational content', () => {
    const input: ResearchIndustryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Industry',
      records: [VALID_RECORD_1, VALID_RECORD_2],
    };

    const artifact = composeResearchIndustry(input);

    // Industry metadata should only contain input data, not generated summaries
    for (const record of artifact.industryRegistry.records) {
      assert.ok(!record.rationale.includes('generated'));
      assert.ok(!record.rationale.includes('synthesized'));
    }
  });
});

// ---------------------------------------------------------------------------
// Additional Negative Tests
// ---------------------------------------------------------------------------

describe('additional negative tests', () => {
  it('should validate complete artifact', () => {
    const input: ResearchIndustryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Industry',
      records: [VALID_RECORD_1, VALID_RECORD_2],
    };

    const artifact = composeResearchIndustry(input);
    const result = validateResearchArtifactWithIndustry(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate industry input', () => {
    const input: ResearchIndustryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Industry',
      records: [VALID_RECORD_1, VALID_RECORD_2],
    };

    const errors = validateIndustryInput(input);
    assert.equal(errors.length, 0);
  });

  it('should detect missing concept ID in input', () => {
    const input: ResearchIndustryInput = {
      conceptId: '',
      conceptLabel: 'Industry',
      records: [VALID_RECORD_1],
    };

    const errors = validateIndustryInput(input);
    const conceptError = errors.find((e) => e.field === 'conceptId');

    assert.ok(conceptError, 'Should have conceptId error');
  });

  it('should detect missing concept label in input', () => {
    const input: ResearchIndustryInput = {
      conceptId: 'concept-001',
      conceptLabel: '',
      records: [VALID_RECORD_1],
    };

    const errors = validateIndustryInput(input);
    const labelError = errors.find((e) => e.field === 'conceptLabel');

    assert.ok(labelError, 'Should have conceptLabel error');
  });

  it('should detect missing records in input', () => {
    const input: ResearchIndustryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Industry',
      records: [],
    };

    const errors = validateIndustryInput(input);
    const recordsError = errors.find((e) => e.field === 'records');

    assert.ok(recordsError, 'Should have records error');
  });

  it('should compose industry provenance correctly', () => {
    const provenance = composeIndustryProvenance(
      'industry-001',
      'ref-001',
      'research-agent',
      'canonical',
      'healthcare',
      'production',
      'established',
      'Test rationale.',
    );

    assert.equal(provenance.industryId, 'industry-001');
    assert.equal(provenance.referenceId, 'ref-001');
    assert.equal(provenance.source, 'research-agent');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.sector, 'healthcare');
    assert.equal(provenance.adoptionType, 'production');
    assert.equal(provenance.adoptionStage, 'established');
    assert.equal(provenance.rationale, 'Test rationale.');
  });

  it('should compose industry use case correctly', () => {
    const useCase = composeIndustryUseCase(
      'usecase-001',
      'Medical Image Analysis',
      'Using deep learning for analyzing medical images.',
      'healthcare',
      'production',
      'established',
      ['method-001'],
      'Test rationale.',
    );

    assert.equal(useCase.useCaseId, 'usecase-001');
    assert.equal(useCase.title, 'Medical Image Analysis');
    assert.equal(useCase.sector, 'healthcare');
    assert.equal(useCase.adoptionType, 'production');
    assert.equal(useCase.adoptionStage, 'established');
  });

  it('should compose industry trace correctly', () => {
    const decisions = [
      {
        decisionId: 'decision-001',
        industryId: 'industry-001',
        sector: 'healthcare' as const,
        validationPassed: true,
        validationErrors: [],
      },
    ];

    const trace = composeIndustryTrace('trace-001', decisions);

    assert.equal(trace.traceId, 'trace-001');
    assert.equal(trace.recordCount, 1);
    assert.equal(trace.validatedCount, 1);
    assert.equal(trace.invalidCount, 0);
  });

  it('should detect invalid governance status', () => {
    const record: ResearchIndustryReference = {
      ...VALID_RECORD_1,
      governanceStatus: '' as any,
    };

    const errors = validateIndustryRecord(record);
    const statusError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_INVALID_STATUS);

    assert.ok(statusError, 'Should have INDUSTRY_INVALID_STATUS error');
  });

  it('should detect missing official source', () => {
    const record: ResearchIndustryReference = {
      ...VALID_RECORD_1,
      officialSource: '',
    };

    const errors = validateIndustryRecord(record);
    const sourceError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_SOURCE);

    assert.ok(sourceError, 'Should have INDUSTRY_MISSING_SOURCE error');
  });

  it('should detect missing rationale', () => {
    const record: ResearchIndustryReference = {
      ...VALID_RECORD_1,
      rationale: '',
    };

    const errors = validateIndustryRecord(record);
    const rationaleError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_SOURCE);

    assert.ok(rationaleError, 'Should have INDUSTRY_MISSING_SOURCE error');
  });

  it('should detect missing associated methods', () => {
    const record: ResearchIndustryReference = {
      ...VALID_RECORD_1,
      associatedMethods: [],
    };

    const errors = validateIndustryRecord(record);
    const methodError = errors.find((e) => e.code === INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_SOURCE);

    assert.ok(methodError, 'Should have INDUSTRY_MISSING_SOURCE error');
  });
});
