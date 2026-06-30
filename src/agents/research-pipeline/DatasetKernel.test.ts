/**
 * NV-1400-D2-OPT-06 — Dataset Mapping Orchestration Test Suite
 *
 * Comprehensive tests for the dataset kernel.
 * Covers: valid dataset, valid dataset registry, duplicate dataset id,
 * duplicate dataset name, unsupported domain, unsupported task,
 * unsupported annotation type, unsupported scale, missing evidence,
 * missing provenance, missing license, empty registry,
 * deterministic ordering, immutable input, identical output,
 * no dataset download, no statistics generation, no generated content.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeDatasetProvenance,
  composeDataset,
  composeDatasetRegistry,
  composeResearchDatasets,
  composeDatasetTrace,
  isSupportedDatasetDomain,
  isSupportedDatasetTask,
  isSupportedDatasetAnnotationType,
  isSupportedDatasetLicense,
  isSupportedDatasetScale,
  getCanonicalDatasetDomains,
  getCanonicalDatasetTasks,
  getCanonicalDatasetAnnotationTypes,
  getCanonicalDatasetLicenses,
  getCanonicalDatasetScales,
} from './DatasetKernel.ts';

import {
  validateDataset,
  validateDatasetRegistry,
  validateResearchArtifactWithDatasets,
  validateDatasetInput,
  DATASET_VALIDATION_CODES,
} from './DatasetValidation.ts';

import type {
  ResearchDataset,
  ResearchDatasetInput,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE_1 = {
  datasetId: 'dataset-001',
  referenceId: 'ref-001',
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  domain: 'computer_vision' as const,
  primaryTask: 'classification' as const,
  publicationYear: 2009,
  rationale: 'ImageNet is a standard benchmark dataset for image classification.',
};

const VALID_PROVENANCE_2 = {
  datasetId: 'dataset-002',
  referenceId: 'ref-002',
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  domain: 'natural_language_processing' as const,
  primaryTask: 'language_modeling' as const,
  publicationYear: 2018,
  rationale: 'WikiText-2 is a standard benchmark dataset for language modeling.',
};

const VALID_DATASET_1: ResearchDataset = {
  datasetId: 'dataset-001',
  datasetName: 'ImageNet',
  domain: 'computer_vision',
  primaryTask: 'classification',
  supportedTasks: ['classification', 'object_detection'],
  annotationType: 'manual',
  license: 'cc_by_4_0',
  scale: 'large',
  publicationYear: 2009,
  officialSource: 'https://www.image-net.org',
  associatedEvidence: ['ref-001', 'ref-002'],
  associatedBenchmarks: ['benchmark-001'],
  associatedMethods: ['method-001', 'method-002'],
  governanceStatus: 'canonical',
  lifecycle: 'active',
  rationale: 'Standard dataset for image classification.',
  provenance: VALID_PROVENANCE_1,
};

const VALID_DATASET_2: ResearchDataset = {
  datasetId: 'dataset-002',
  datasetName: 'WikiText-2',
  domain: 'natural_language_processing',
  primaryTask: 'language_modeling',
  supportedTasks: ['language_modeling'],
  annotationType: 'automatic',
  license: 'cc_by_sa_4_0',
  scale: 'medium',
  publicationYear: 2018,
  officialSource: 'https://blog.einstein.ai/the-wikitext-dependency-language-modeling-dataset/',
  associatedEvidence: ['ref-003', 'ref-004'],
  associatedBenchmarks: ['benchmark-002'],
  associatedMethods: ['method-003', 'method-004'],
  governanceStatus: 'canonical',
  lifecycle: 'active',
  rationale: 'Standard dataset for language modeling.',
  provenance: VALID_PROVENANCE_2,
};

// ---------------------------------------------------------------------------
// Valid Dataset Tests
// ---------------------------------------------------------------------------

describe('composeDataset', () => {
  it('should compose a valid dataset', () => {
    const dataset = composeDataset(
      'dataset-001',
      'ImageNet',
      'computer_vision',
      'classification',
      ['classification', 'object_detection'],
      'manual',
      'cc_by_4_0',
      'large',
      2009,
      'https://www.image-net.org',
      ['ref-001'],
      ['benchmark-001'],
      ['method-001'],
      'canonical',
      'active',
      'Standard dataset.',
      VALID_PROVENANCE_1,
    );

    assert.equal(dataset.datasetId, 'dataset-001');
    assert.equal(dataset.datasetName, 'ImageNet');
    assert.equal(dataset.domain, 'computer_vision');
    assert.equal(dataset.primaryTask, 'classification');
    assert.equal(dataset.lifecycle, 'active');
  });
});

// ---------------------------------------------------------------------------
// Valid Dataset Registry Tests
// ---------------------------------------------------------------------------

describe('composeDatasetRegistry', () => {
  it('should compose a valid dataset registry', () => {
    const registry = composeDatasetRegistry('registry-001', [VALID_DATASET_1, VALID_DATASET_2]);

    assert.equal(registry.registryId, 'registry-001');
    assert.equal(registry.datasets.length, 2);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Dataset ID Tests
// ---------------------------------------------------------------------------

describe('duplicate dataset id validation', () => {
  it('should detect duplicate dataset IDs', () => {
    const registry = composeDatasetRegistry('registry-001', [
      VALID_DATASET_1,
      { ...VALID_DATASET_1, datasetId: 'dataset-001' },
    ]);

    const errors = validateDatasetRegistry(registry);
    const duplicateError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_DUPLICATE_ID);

    assert.ok(duplicateError, 'Should have DATASET_DUPLICATE_ID error');
  });

  it('should not flag unique dataset IDs as duplicates', () => {
    const registry = composeDatasetRegistry('registry-001', [VALID_DATASET_1, VALID_DATASET_2]);
    const errors = validateDatasetRegistry(registry);
    const duplicateErrors = errors.filter((e) => e.code === DATASET_VALIDATION_CODES.DATASET_DUPLICATE_ID);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Dataset Name Tests
// ---------------------------------------------------------------------------

describe('duplicate dataset name validation', () => {
  it('should detect duplicate dataset names', () => {
    const registry = composeDatasetRegistry('registry-001', [
      VALID_DATASET_1,
      { ...VALID_DATASET_1, datasetId: 'dataset-003' },
    ]);

    const errors = validateDatasetRegistry(registry);
    const duplicateError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_DUPLICATE_NAME);

    assert.ok(duplicateError, 'Should have DATASET_DUPLICATE_NAME error');
  });

  it('should not flag unique dataset names as duplicates', () => {
    const registry = composeDatasetRegistry('registry-001', [VALID_DATASET_1, VALID_DATASET_2]);
    const errors = validateDatasetRegistry(registry);
    const duplicateErrors = errors.filter((e) => e.code === DATASET_VALIDATION_CODES.DATASET_DUPLICATE_NAME);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Domain Tests
// ---------------------------------------------------------------------------

describe('unsupported domain validation', () => {
  it('should detect unsupported domain', () => {
    const dataset: ResearchDataset = {
      ...VALID_DATASET_1,
      domain: 'unsupported_domain' as any,
    };

    const errors = validateDataset(dataset);
    const unsupportedError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_UNKNOWN_DOMAIN);

    assert.ok(unsupportedError, 'Should have DATASET_UNKNOWN_DOMAIN error');
  });

  it('should support all canonical domains', () => {
    const domains = getCanonicalDatasetDomains();
    assert.equal(domains.length, 12);
    assert.ok(domains.includes('computer_vision'));
    assert.ok(domains.includes('natural_language_processing'));
    assert.ok(domains.includes('speech'));
    assert.ok(domains.includes('audio'));
    assert.ok(domains.includes('multimodal'));
    assert.ok(domains.includes('robotics'));
    assert.ok(domains.includes('reinforcement_learning'));
    assert.ok(domains.includes('tabular'));
    assert.ok(domains.includes('graph'));
    assert.ok(domains.includes('timeseries'));
    assert.ok(domains.includes('recommendation'));
    assert.ok(domains.includes('scientific_computing'));
  });

  it('should correctly identify supported domains', () => {
    assert.equal(isSupportedDatasetDomain('computer_vision'), true);
    assert.equal(isSupportedDatasetDomain('natural_language_processing'), true);
    assert.equal(isSupportedDatasetDomain('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Unsupported Task Tests
// ---------------------------------------------------------------------------

describe('unsupported task validation', () => {
  it('should detect unsupported task', () => {
    const dataset: ResearchDataset = {
      ...VALID_DATASET_1,
      primaryTask: 'unsupported_task' as any,
    };

    const errors = validateDataset(dataset);
    const unsupportedError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_UNKNOWN_TASK);

    assert.ok(unsupportedError, 'Should have DATASET_UNKNOWN_TASK error');
  });

  it('should support all canonical tasks', () => {
    const tasks = getCanonicalDatasetTasks();
    assert.equal(tasks.length, 16);
    assert.ok(tasks.includes('classification'));
    assert.ok(tasks.includes('regression'));
    assert.ok(tasks.includes('object_detection'));
    assert.ok(tasks.includes('image_segmentation'));
    assert.ok(tasks.includes('instance_segmentation'));
    assert.ok(tasks.includes('semantic_segmentation'));
    assert.ok(tasks.includes('language_modeling'));
    assert.ok(tasks.includes('translation'));
    assert.ok(tasks.includes('question_answering'));
    assert.ok(tasks.includes('retrieval'));
    assert.ok(tasks.includes('reasoning'));
    assert.ok(tasks.includes('planning'));
    assert.ok(tasks.includes('speech_recognition'));
    assert.ok(tasks.includes('speech_synthesis'));
    assert.ok(tasks.includes('forecasting'));
    assert.ok(tasks.includes('recommendation'));
  });

  it('should correctly identify supported tasks', () => {
    assert.equal(isSupportedDatasetTask('classification'), true);
    assert.equal(isSupportedDatasetTask('regression'), true);
    assert.equal(isSupportedDatasetTask('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Unsupported Annotation Type Tests
// ---------------------------------------------------------------------------

describe('unsupported annotation type validation', () => {
  it('should detect unsupported annotation type', () => {
    const dataset: ResearchDataset = {
      ...VALID_DATASET_1,
      annotationType: 'unsupported_type' as any,
    };

    const errors = validateDataset(dataset);
    const unsupportedError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_UNKNOWN_ANNOTATION);

    assert.ok(unsupportedError, 'Should have DATASET_UNKNOWN_ANNOTATION error');
  });

  it('should support all canonical annotation types', () => {
    const annotationTypes = getCanonicalDatasetAnnotationTypes();
    assert.equal(annotationTypes.length, 6);
    assert.ok(annotationTypes.includes('manual'));
    assert.ok(annotationTypes.includes('semi_automatic'));
    assert.ok(annotationTypes.includes('automatic'));
    assert.ok(annotationTypes.includes('synthetic'));
    assert.ok(annotationTypes.includes('expert_reviewed'));
    assert.ok(annotationTypes.includes('crowdsourced'));
  });

  it('should correctly identify supported annotation types', () => {
    assert.equal(isSupportedDatasetAnnotationType('manual'), true);
    assert.equal(isSupportedDatasetAnnotationType('automatic'), true);
    assert.equal(isSupportedDatasetAnnotationType('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Unsupported Scale Tests
// ---------------------------------------------------------------------------

describe('unsupported scale validation', () => {
  it('should detect unsupported scale', () => {
    const dataset: ResearchDataset = {
      ...VALID_DATASET_1,
      scale: 'unsupported_scale' as any,
    };

    const errors = validateDataset(dataset);
    const unsupportedError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_UNKNOWN_SCALE);

    assert.ok(unsupportedError, 'Should have DATASET_UNKNOWN_SCALE error');
  });

  it('should support all canonical scales', () => {
    const scales = getCanonicalDatasetScales();
    assert.equal(scales.length, 6);
    assert.ok(scales.includes('toy'));
    assert.ok(scales.includes('small'));
    assert.ok(scales.includes('medium'));
    assert.ok(scales.includes('large'));
    assert.ok(scales.includes('very_large'));
    assert.ok(scales.includes('web_scale'));
  });

  it('should correctly identify supported scales', () => {
    assert.equal(isSupportedDatasetScale('toy'), true);
    assert.equal(isSupportedDatasetScale('large'), true);
    assert.equal(isSupportedDatasetScale('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Missing Evidence Tests
// ---------------------------------------------------------------------------

describe('missing evidence validation', () => {
  it('should detect missing associated evidence', () => {
    const dataset: ResearchDataset = {
      ...VALID_DATASET_1,
      associatedEvidence: [],
    };

    const errors = validateDataset(dataset);
    const evidenceError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_MISSING_EVIDENCE);

    assert.ok(evidenceError, 'Should have DATASET_MISSING_EVIDENCE error');
  });

  it('should not flag valid evidence', () => {
    const errors = validateDataset(VALID_DATASET_1);
    const evidenceErrors = errors.filter((e) => e.code === DATASET_VALIDATION_CODES.DATASET_MISSING_EVIDENCE);

    assert.equal(evidenceErrors.length, 0, 'Should not have evidence errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('missing provenance validation', () => {
  it('should detect missing provenance', () => {
    const dataset: ResearchDataset = {
      ...VALID_DATASET_1,
      provenance: null as any,
    };

    const errors = validateDataset(dataset);
    const provenanceError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have DATASET_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const dataset: ResearchDataset = {
      ...VALID_DATASET_1,
      provenance: {
        ...VALID_PROVENANCE_1,
        rationale: '',
      },
    };

    const errors = validateDataset(dataset);
    const provenanceError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have DATASET_MISSING_PROVENANCE error');
  });

  it('should not flag valid provenance', () => {
    const errors = validateDataset(VALID_DATASET_1);
    const provenanceErrors = errors.filter((e) => e.code === DATASET_VALIDATION_CODES.DATASET_MISSING_PROVENANCE);

    assert.equal(provenanceErrors.length, 0, 'Should not have provenance errors');
  });
});

// ---------------------------------------------------------------------------
// Missing License Tests
// ---------------------------------------------------------------------------

describe('missing license validation', () => {
  it('should detect missing license', () => {
    const dataset: ResearchDataset = {
      ...VALID_DATASET_1,
      license: 'unsupported_license' as any,
    };

    const errors = validateDataset(dataset);
    const licenseError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_MISSING_LICENSE);

    assert.ok(licenseError, 'Should have DATASET_MISSING_LICENSE error');
  });

  it('should support all canonical licenses', () => {
    const licenses = getCanonicalDatasetLicenses();
    assert.equal(licenses.length, 9);
    assert.ok(licenses.includes('cc_by_4_0'));
    assert.ok(licenses.includes('cc_by_sa_4_0'));
    assert.ok(licenses.includes('cc_by_nc_4_0'));
    assert.ok(licenses.includes('cc0_1_0'));
    assert.ok(licenses.includes('apache_2_0'));
    assert.ok(licenses.includes('mit'));
    assert.ok(licenses.includes('gpl_3_0'));
    assert.ok(licenses.includes('proprietary'));
    assert.ok(licenses.includes('custom'));
  });

  it('should correctly identify supported licenses', () => {
    assert.equal(isSupportedDatasetLicense('cc_by_4_0'), true);
    assert.equal(isSupportedDatasetLicense('apache_2_0'), true);
    assert.equal(isSupportedDatasetLicense('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('empty registry validation', () => {
  it('should detect empty registry', () => {
    const registry = composeDatasetRegistry('registry-001', []);
    const errors = validateDatasetRegistry(registry);
    const emptyErrors = errors.filter((e) => e.code === DATASET_VALIDATION_CODES.DATASET_EMPTY_REGISTRY);

    assert.ok(emptyErrors.length > 0, 'Should have DATASET_EMPTY_REGISTRY errors');
  });

  it('should not flag non-empty registry', () => {
    const registry = composeDatasetRegistry('registry-001', [VALID_DATASET_1]);
    const errors = validateDatasetRegistry(registry);
    const emptyErrors = errors.filter((e) => e.code === DATASET_VALIDATION_CODES.DATASET_EMPTY_REGISTRY);

    assert.equal(emptyErrors.length, 0, 'Should not have empty registry errors');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('deterministic ordering', () => {
  it('should sort datasets deterministically by ID', () => {
    const registry = composeDatasetRegistry('registry-001', [VALID_DATASET_2, VALID_DATASET_1]);

    assert.equal(registry.datasets[0].datasetId, 'dataset-001');
    assert.equal(registry.datasets[1].datasetId, 'dataset-002');
  });

  it('should produce identical ordering for identical input', () => {
    const input: ResearchDatasetInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Datasets',
      datasets: [VALID_DATASET_2, VALID_DATASET_1],
    };

    const output1 = composeResearchDatasets(input);
    const output2 = composeResearchDatasets(input);

    assert.deepEqual(output1.datasetRegistry.datasets, output2.datasetRegistry.datasets);
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('immutable input', () => {
  it('should not mutate input datasets', () => {
    const input: ResearchDatasetInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Datasets',
      datasets: [VALID_DATASET_1, VALID_DATASET_2],
    };

    const originalName = VALID_DATASET_1.datasetName;

    composeResearchDatasets(input);

    assert.equal(VALID_DATASET_1.datasetName, originalName);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('identical output', () => {
  it('should produce identical registries', () => {
    const input: ResearchDatasetInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Datasets',
      datasets: [VALID_DATASET_1, VALID_DATASET_2],
    };

    const artifact1 = composeResearchDatasets(input);
    const artifact2 = composeResearchDatasets(input);

    assert.deepEqual(artifact1.datasetRegistry, artifact2.datasetRegistry);
  });

  it('should produce identical traces', () => {
    const input: ResearchDatasetInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Datasets',
      datasets: [VALID_DATASET_1, VALID_DATASET_2],
    };

    const artifact1 = composeResearchDatasets(input);
    const artifact2 = composeResearchDatasets(input);

    assert.deepEqual(artifact1.datasetTrace, artifact2.datasetTrace);
  });
});

// ---------------------------------------------------------------------------
// No Dataset Download Tests
// ---------------------------------------------------------------------------

describe('no dataset download', () => {
  it('should not download datasets', () => {
    const input: ResearchDatasetInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Datasets',
      datasets: [VALID_DATASET_1, VALID_DATASET_2],
    };

    const artifact = composeResearchDatasets(input);

    // Should not have download fields
    assert.ok(!('downloadUrl' in artifact), 'Should not have downloadUrl field');
    assert.ok(!('downloaded' in artifact), 'Should not have downloaded field');
    assert.ok(!('localPath' in artifact), 'Should not have localPath field');
  });
});

// ---------------------------------------------------------------------------
// No Statistics Generation Tests
// ---------------------------------------------------------------------------

describe('no statistics generation', () => {
  it('should not generate statistics', () => {
    const input: ResearchDatasetInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Datasets',
      datasets: [VALID_DATASET_1, VALID_DATASET_2],
    };

    const artifact = composeResearchDatasets(input);

    // Should not have statistics fields
    assert.ok(!('statistics' in artifact), 'Should not have statistics field');
    assert.ok(!('stats' in artifact), 'Should not have stats field');
    assert.ok(!('metrics' in artifact), 'Should not have metrics field');
  });
});

// ---------------------------------------------------------------------------
// No Generated Content Tests
// ---------------------------------------------------------------------------

describe('no generated content', () => {
  it('should not generate educational content', () => {
    const input: ResearchDatasetInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Datasets',
      datasets: [VALID_DATASET_1, VALID_DATASET_2],
    };

    const artifact = composeResearchDatasets(input);

    // Dataset metadata should only contain input data, not generated summaries
    for (const dataset of artifact.datasetRegistry.datasets) {
      assert.ok(!dataset.datasetName.includes('generated'));
      assert.ok(!dataset.datasetName.includes('synthesized'));
    }
  });
});

// ---------------------------------------------------------------------------
// Additional Negative Tests
// ---------------------------------------------------------------------------

describe('additional negative tests', () => {
  it('should validate complete artifact', () => {
    const input: ResearchDatasetInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Datasets',
      datasets: [VALID_DATASET_1, VALID_DATASET_2],
    };

    const artifact = composeResearchDatasets(input);
    const result = validateResearchArtifactWithDatasets(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate dataset input', () => {
    const input: ResearchDatasetInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Datasets',
      datasets: [VALID_DATASET_1, VALID_DATASET_2],
    };

    const errors = validateDatasetInput(input);
    assert.equal(errors.length, 0);
  });

  it('should detect missing concept ID in input', () => {
    const input: ResearchDatasetInput = {
      conceptId: '',
      conceptLabel: 'Datasets',
      datasets: [VALID_DATASET_1],
    };

    const errors = validateDatasetInput(input);
    const conceptError = errors.find((e) => e.field === 'conceptId');

    assert.ok(conceptError, 'Should have conceptId error');
  });

  it('should detect missing concept label in input', () => {
    const input: ResearchDatasetInput = {
      conceptId: 'concept-001',
      conceptLabel: '',
      datasets: [VALID_DATASET_1],
    };

    const errors = validateDatasetInput(input);
    const labelError = errors.find((e) => e.field === 'conceptLabel');

    assert.ok(labelError, 'Should have conceptLabel error');
  });

  it('should detect missing datasets in input', () => {
    const input: ResearchDatasetInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Datasets',
      datasets: [],
    };

    const errors = validateDatasetInput(input);
    const datasetsError = errors.find((e) => e.field === 'datasets');

    assert.ok(datasetsError, 'Should have datasets error');
  });

  it('should compose dataset provenance correctly', () => {
    const provenance = composeDatasetProvenance(
      'dataset-001',
      'ref-001',
      'research-agent',
      'canonical',
      'computer_vision',
      'classification',
      2009,
      'Standard dataset.',
    );

    assert.equal(provenance.datasetId, 'dataset-001');
    assert.equal(provenance.referenceId, 'ref-001');
    assert.equal(provenance.source, 'research-agent');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.domain, 'computer_vision');
    assert.equal(provenance.primaryTask, 'classification');
    assert.equal(provenance.publicationYear, 2009);
    assert.equal(provenance.rationale, 'Standard dataset.');
  });

  it('should compose dataset trace correctly', () => {
    const decisions = [
      {
        decisionId: 'decision-001',
        datasetId: 'dataset-001',
        datasetName: 'ImageNet',
        validationPassed: true,
        validationErrors: [],
      },
    ];

    const trace = composeDatasetTrace('trace-001', decisions);

    assert.equal(trace.traceId, 'trace-001');
    assert.equal(trace.datasetCount, 1);
    assert.equal(trace.validatedCount, 1);
    assert.equal(trace.invalidCount, 0);
  });

  it('should detect invalid governance status', () => {
    const dataset: ResearchDataset = {
      ...VALID_DATASET_1,
      governanceStatus: '' as any,
    };

    const errors = validateDataset(dataset);
    const statusError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_INVALID_STATUS);

    assert.ok(statusError, 'Should have DATASET_INVALID_STATUS error');
  });

  it('should detect missing official source', () => {
    const dataset: ResearchDataset = {
      ...VALID_DATASET_1,
      officialSource: '',
    };

    const errors = validateDataset(dataset);
    const sourceError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_MISSING_SOURCE);

    assert.ok(sourceError, 'Should have DATASET_MISSING_SOURCE error');
  });

  it('should detect missing rationale', () => {
    const dataset: ResearchDataset = {
      ...VALID_DATASET_1,
      rationale: '',
    };

    const errors = validateDataset(dataset);
    const rationaleError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_MISSING_SOURCE);

    assert.ok(rationaleError, 'Should have DATASET_MISSING_SOURCE error');
  });

  it('should detect missing supported tasks', () => {
    const dataset: ResearchDataset = {
      ...VALID_DATASET_1,
      supportedTasks: [],
    };

    const errors = validateDataset(dataset);
    const taskError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_UNKNOWN_TASK);

    assert.ok(taskError, 'Should have DATASET_UNKNOWN_TASK error');
  });

  it('should detect unsupported supported task', () => {
    const dataset: ResearchDataset = {
      ...VALID_DATASET_1,
      supportedTasks: ['classification', 'unsupported_task' as any],
    };

    const errors = validateDataset(dataset);
    const taskError = errors.find((e) => e.code === DATASET_VALIDATION_CODES.DATASET_UNKNOWN_TASK);

    assert.ok(taskError, 'Should have DATASET_UNKNOWN_TASK error');
  });
});
