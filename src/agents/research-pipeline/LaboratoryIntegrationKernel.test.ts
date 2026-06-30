/**
 * NV-1400-D2-OPT-10 — Research Laboratory Integration Orchestration Test Suite
 *
 * Comprehensive tests for the laboratory integration kernel.
 * Covers: valid laboratory metadata, valid registry, duplicate laboratory,
 * unsupported laboratory type, unsupported purpose, unsupported integration mode,
 * missing provenance, missing evidence, invalid reference, empty registry,
 * deterministic ordering, immutable input, identical output,
 * no execution callbacks, no generated code, no runtime execution,
 * no generated content.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeLaboratoryProvenance,
  composeLaboratoryMetadata,
  composeLaboratoryRegistry,
  composeResearchLaboratories,
  composeLaboratoryTrace,
  isSupportedLaboratoryType,
  isSupportedLaboratoryPurpose,
  isSupportedLaboratoryIntegrationMode,
  getCanonicalLaboratoryTypes,
  getCanonicalLaboratoryPurposes,
  getCanonicalLaboratoryIntegrationModes,
} from './LaboratoryIntegrationKernel.ts';

import {
  validateLaboratoryMetadata,
  validateLaboratoryRegistry,
  validateResearchArtifactWithLaboratories,
  validateLaboratoryInput,
  LABORATORY_VALIDATION_CODES,
} from './LaboratoryIntegrationValidation.ts';

import type {
  ResearchLaboratoryMetadata,
  ResearchLaboratoryInput,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE_1 = {
  laboratoryId: 'lab-001',
  referenceId: 'ref-001',
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  laboratoryType: 'algorithm_reproduction' as const,
  purpose: 'reproduction' as const,
  rationale: 'Reproduce CNN algorithm from original paper.',
  providedBy: 'research-agent',
};

const VALID_PROVENANCE_2 = {
  laboratoryId: 'lab-002',
  referenceId: 'ref-002',
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  laboratoryType: 'concept_visualization' as const,
  purpose: 'understanding' as const,
  rationale: 'Visualize attention mechanism.',
  providedBy: 'research-agent',
};

const VALID_LAB_1: ResearchLaboratoryMetadata = {
  laboratoryId: 'lab-001',
  laboratoryType: 'algorithm_reproduction',
  purpose: 'reproduction',
  integrationMode: 'after_reading',
  title: 'CNN Algorithm Reproduction',
  description: 'Reproduce the CNN algorithm from the original paper.',
  associatedEvidence: ['ref-001', 'ref-002'],
  associatedMethods: ['method-001'],
  associatedBenchmarks: ['benchmark-001'],
  associatedDatasets: ['dataset-001'],
  associatedReadingPaths: ['path-001'],
  officialSource: 'https://example.com/lab-001',
  governanceStatus: 'canonical',
  lifecycle: 'active',
  rationale: 'Essential reproduction of foundational algorithm.',
  provenance: VALID_PROVENANCE_1,
};

const VALID_LAB_2: ResearchLaboratoryMetadata = {
  laboratoryId: 'lab-002',
  laboratoryType: 'concept_visualization',
  purpose: 'understanding',
  integrationMode: 'during_reading',
  title: 'Attention Mechanism Visualization',
  description: 'Visualize the attention mechanism in Transformers.',
  associatedEvidence: ['ref-003', 'ref-004'],
  associatedMethods: ['method-002'],
  associatedBenchmarks: ['benchmark-002'],
  associatedDatasets: ['dataset-002'],
  associatedReadingPaths: ['path-002'],
  officialSource: 'https://example.com/lab-002',
  governanceStatus: 'canonical',
  lifecycle: 'active',
  rationale: 'Visualization aids understanding of attention.',
  provenance: VALID_PROVENANCE_2,
};

// ---------------------------------------------------------------------------
// Valid Laboratory Metadata Tests
// ---------------------------------------------------------------------------

describe('composeLaboratoryMetadata', () => {
  it('should compose valid laboratory metadata', () => {
    const metadata = composeLaboratoryMetadata(
      'lab-001',
      'algorithm_reproduction',
      'reproduction',
      'after_reading',
      'Test Lab',
      'A test laboratory.',
      ['ref-001'],
      ['method-001'],
      ['benchmark-001'],
      ['dataset-001'],
      ['path-001'],
      'https://example.com',
      'canonical',
      'active',
      'Test rationale.',
      VALID_PROVENANCE_1,
    );

    assert.equal(metadata.laboratoryId, 'lab-001');
    assert.equal(metadata.laboratoryType, 'algorithm_reproduction');
    assert.equal(metadata.purpose, 'reproduction');
    assert.equal(metadata.integrationMode, 'after_reading');
    assert.equal(metadata.lifecycle, 'active');
  });
});

// ---------------------------------------------------------------------------
// Valid Registry Tests
// ---------------------------------------------------------------------------

describe('composeLaboratoryRegistry', () => {
  it('should compose a valid laboratory registry', () => {
    const registry = composeLaboratoryRegistry('registry-001', [VALID_LAB_1, VALID_LAB_2]);

    assert.equal(registry.registryId, 'registry-001');
    assert.equal(registry.laboratories.length, 2);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Laboratory Tests
// ---------------------------------------------------------------------------

describe('duplicate laboratory validation', () => {
  it('should detect duplicate laboratory IDs', () => {
    const registry = composeLaboratoryRegistry('registry-001', [
      VALID_LAB_1,
      { ...VALID_LAB_1, laboratoryId: 'lab-001' },
    ]);

    const errors = validateLaboratoryRegistry(registry);
    const duplicateError = errors.find((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_DUPLICATE_ID);

    assert.ok(duplicateError, 'Should have LABMETA_DUPLICATE_ID error');
  });

  it('should not flag unique IDs as duplicates', () => {
    const registry = composeLaboratoryRegistry('registry-001', [VALID_LAB_1, VALID_LAB_2]);
    const errors = validateLaboratoryRegistry(registry);
    const duplicateErrors = errors.filter((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_DUPLICATE_ID);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Laboratory Type Tests
// ---------------------------------------------------------------------------

describe('unsupported laboratory type validation', () => {
  it('should detect unsupported laboratory type', () => {
    const lab: ResearchLaboratoryMetadata = {
      ...VALID_LAB_1,
      laboratoryType: 'unsupported_type' as any,
    };

    const errors = validateLaboratoryMetadata(lab);
    const unsupportedError = errors.find((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_UNKNOWN_TYPE);

    assert.ok(unsupportedError, 'Should have LABMETA_UNKNOWN_TYPE error');
  });

  it('should support all canonical laboratory types', () => {
    const types = getCanonicalLaboratoryTypes();
    assert.equal(types.length, 10);
    assert.ok(types.includes('algorithm_reproduction'));
    assert.ok(types.includes('paper_reproduction'));
    assert.ok(types.includes('concept_visualization'));
    assert.ok(types.includes('comparative_experiment'));
    assert.ok(types.includes('parameter_exploration'));
    assert.ok(types.includes('benchmark_replication'));
    assert.ok(types.includes('dataset_exploration'));
    assert.ok(types.includes('ablation_study'));
    assert.ok(types.includes('failure_analysis'));
    assert.ok(types.includes('engineering_case'));
  });

  it('should correctly identify supported laboratory types', () => {
    assert.equal(isSupportedLaboratoryType('algorithm_reproduction'), true);
    assert.equal(isSupportedLaboratoryType('paper_reproduction'), true);
    assert.equal(isSupportedLaboratoryType('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Unsupported Purpose Tests
// ---------------------------------------------------------------------------

describe('unsupported purpose validation', () => {
  it('should detect unsupported purpose', () => {
    const lab: ResearchLaboratoryMetadata = {
      ...VALID_LAB_1,
      purpose: 'unsupported_purpose' as any,
    };

    const errors = validateLaboratoryMetadata(lab);
    const unsupportedError = errors.find((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_UNKNOWN_PURPOSE);

    assert.ok(unsupportedError, 'Should have LABMETA_UNKNOWN_PURPOSE error');
  });

  it('should support all canonical purposes', () => {
    const purposes = getCanonicalLaboratoryPurposes();
    assert.equal(purposes.length, 6);
    assert.ok(purposes.includes('understanding'));
    assert.ok(purposes.includes('validation'));
    assert.ok(purposes.includes('comparison'));
    assert.ok(purposes.includes('exploration'));
    assert.ok(purposes.includes('reproduction'));
    assert.ok(purposes.includes('experimentation'));
  });

  it('should correctly identify supported purposes', () => {
    assert.equal(isSupportedLaboratoryPurpose('understanding'), true);
    assert.equal(isSupportedLaboratoryPurpose('validation'), true);
    assert.equal(isSupportedLaboratoryPurpose('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Unsupported Integration Mode Tests
// ---------------------------------------------------------------------------

describe('unsupported integration mode validation', () => {
  it('should detect unsupported integration mode', () => {
    const lab: ResearchLaboratoryMetadata = {
      ...VALID_LAB_1,
      integrationMode: 'unsupported_mode' as any,
    };

    const errors = validateLaboratoryMetadata(lab);
    const unsupportedError = errors.find((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_UNKNOWN_MODE);

    assert.ok(unsupportedError, 'Should have LABMETA_UNKNOWN_MODE error');
  });

  it('should support all canonical integration modes', () => {
    const modes = getCanonicalLaboratoryIntegrationModes();
    assert.equal(modes.length, 7);
    assert.ok(modes.includes('before_reading'));
    assert.ok(modes.includes('during_reading'));
    assert.ok(modes.includes('after_reading'));
    assert.ok(modes.includes('after_comparison'));
    assert.ok(modes.includes('after_benchmark'));
    assert.ok(modes.includes('after_dataset'));
    assert.ok(modes.includes('after_evolution'));
  });

  it('should correctly identify supported integration modes', () => {
    assert.equal(isSupportedLaboratoryIntegrationMode('before_reading'), true);
    assert.equal(isSupportedLaboratoryIntegrationMode('after_reading'), true);
    assert.equal(isSupportedLaboratoryIntegrationMode('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('missing provenance validation', () => {
  it('should detect missing provenance', () => {
    const lab: ResearchLaboratoryMetadata = {
      ...VALID_LAB_1,
      provenance: null as any,
    };

    const errors = validateLaboratoryMetadata(lab);
    const provenanceError = errors.find((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have LABMETA_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const lab: ResearchLaboratoryMetadata = {
      ...VALID_LAB_1,
      provenance: {
        ...VALID_PROVENANCE_1,
        rationale: '',
      },
    };

    const errors = validateLaboratoryMetadata(lab);
    const provenanceError = errors.find((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have LABMETA_MISSING_PROVENANCE error');
  });

  it('should not flag valid provenance', () => {
    const errors = validateLaboratoryMetadata(VALID_LAB_1);
    const provenanceErrors = errors.filter((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_MISSING_PROVENANCE);

    assert.equal(provenanceErrors.length, 0, 'Should not have provenance errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Evidence Tests
// ---------------------------------------------------------------------------

describe('missing evidence validation', () => {
  it('should detect missing associated evidence', () => {
    const lab: ResearchLaboratoryMetadata = {
      ...VALID_LAB_1,
      associatedEvidence: [],
    };

    const errors = validateLaboratoryMetadata(lab);
    const evidenceError = errors.find((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_MISSING_EVIDENCE);

    assert.ok(evidenceError, 'Should have LABMETA_MISSING_EVIDENCE error');
  });

  it('should not flag valid evidence', () => {
    const errors = validateLaboratoryMetadata(VALID_LAB_1);
    const evidenceErrors = errors.filter((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_MISSING_EVIDENCE);

    assert.equal(evidenceErrors.length, 0, 'Should not have evidence errors');
  });
});

// ---------------------------------------------------------------------------
// Invalid Reference Tests
// ---------------------------------------------------------------------------

describe('invalid reference validation', () => {
  it('should detect missing official source', () => {
    const lab: ResearchLaboratoryMetadata = {
      ...VALID_LAB_1,
      officialSource: '',
    };

    const errors = validateLaboratoryMetadata(lab);
    const sourceError = errors.find((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_MISSING_SOURCE);

    assert.ok(sourceError, 'Should have LABMETA_MISSING_SOURCE error');
  });

  it('should detect missing rationale', () => {
    const lab: ResearchLaboratoryMetadata = {
      ...VALID_LAB_1,
      rationale: '',
    };

    const errors = validateLaboratoryMetadata(lab);
    const rationaleError = errors.find((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_MISSING_SOURCE);

    assert.ok(rationaleError, 'Should have LABMETA_MISSING_SOURCE error');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('empty registry validation', () => {
  it('should detect empty registry', () => {
    const registry = composeLaboratoryRegistry('registry-001', []);
    const errors = validateLaboratoryRegistry(registry);
    const emptyErrors = errors.filter((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_EMPTY_REGISTRY);

    assert.ok(emptyErrors.length > 0, 'Should have LABMETA_EMPTY_REGISTRY errors');
  });

  it('should not flag non-empty registry', () => {
    const registry = composeLaboratoryRegistry('registry-001', [VALID_LAB_1]);
    const errors = validateLaboratoryRegistry(registry);
    const emptyErrors = errors.filter((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_EMPTY_REGISTRY);

    assert.equal(emptyErrors.length, 0, 'Should not have empty registry errors');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('deterministic ordering', () => {
  it('should sort laboratories deterministically by ID', () => {
    const registry = composeLaboratoryRegistry('registry-001', [VALID_LAB_2, VALID_LAB_1]);

    assert.equal(registry.laboratories[0].laboratoryId, 'lab-001');
    assert.equal(registry.laboratories[1].laboratoryId, 'lab-002');
  });

  it('should produce identical ordering for identical input', () => {
    const input: ResearchLaboratoryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Laboratories',
      laboratories: [VALID_LAB_2, VALID_LAB_1],
    };

    const output1 = composeResearchLaboratories(input);
    const output2 = composeResearchLaboratories(input);

    assert.deepEqual(output1.laboratoryRegistry.laboratories, output2.laboratoryRegistry.laboratories);
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('immutable input', () => {
  it('should not mutate input laboratories', () => {
    const input: ResearchLaboratoryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Laboratories',
      laboratories: [VALID_LAB_1, VALID_LAB_2],
    };

    const originalTitle = VALID_LAB_1.title;

    composeResearchLaboratories(input);

    assert.equal(VALID_LAB_1.title, originalTitle);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('identical output', () => {
  it('should produce identical registries', () => {
    const input: ResearchLaboratoryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Laboratories',
      laboratories: [VALID_LAB_1, VALID_LAB_2],
    };

    const artifact1 = composeResearchLaboratories(input);
    const artifact2 = composeResearchLaboratories(input);

    assert.deepEqual(artifact1.laboratoryRegistry, artifact2.laboratoryRegistry);
  });

  it('should produce identical traces', () => {
    const input: ResearchLaboratoryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Laboratories',
      laboratories: [VALID_LAB_1, VALID_LAB_2],
    };

    const artifact1 = composeResearchLaboratories(input);
    const artifact2 = composeResearchLaboratories(input);

    assert.deepEqual(artifact1.laboratoryTrace, artifact2.laboratoryTrace);
  });
});

// ---------------------------------------------------------------------------
// No Execution Callbacks Tests
// ---------------------------------------------------------------------------

describe('no execution callbacks', () => {
  it('should not have execution callbacks', () => {
    const input: ResearchLaboratoryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Laboratories',
      laboratories: [VALID_LAB_1, VALID_LAB_2],
    };

    const artifact = composeResearchLaboratories(input);

    // Should not have execution fields
    assert.ok(!('execute' in artifact), 'Should not have execute field');
    assert.ok(!('run' in artifact), 'Should not have run field');
    assert.ok(!('simulate' in artifact), 'Should not have simulate field');
    assert.ok(!('callback' in artifact), 'Should not have callback field');
  });
});

// ---------------------------------------------------------------------------
// No Generated Code Tests
// ---------------------------------------------------------------------------

describe('no generated code', () => {
  it('should not generate laboratory code', () => {
    const input: ResearchLaboratoryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Laboratories',
      laboratories: [VALID_LAB_1, VALID_LAB_2],
    };

    const artifact = composeResearchLaboratories(input);

    // Should not have code generation fields
    assert.ok(!('generatedCode' in artifact), 'Should not have generatedCode field');
    assert.ok(!('notebookContent' in artifact), 'Should not have notebookContent field');
    assert.ok(!('scriptContent' in artifact), 'Should not have scriptContent field');
  });
});

// ---------------------------------------------------------------------------
// No Runtime Execution Tests
// ---------------------------------------------------------------------------

describe('no runtime execution', () => {
  it('should not execute laboratories', () => {
    const input: ResearchLaboratoryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Laboratories',
      laboratories: [VALID_LAB_1, VALID_LAB_2],
    };

    const artifact = composeResearchLaboratories(input);

    // Should not have runtime fields
    assert.ok(!('runtime' in artifact), 'Should not have runtime field');
    assert.ok(!('sandbox' in artifact), 'Should not have sandbox field');
    assert.ok(!('executionResults' in artifact), 'Should not have executionResults field');
  });
});

// ---------------------------------------------------------------------------
// No Generated Content Tests
// ---------------------------------------------------------------------------

describe('no generated content', () => {
  it('should not generate educational content', () => {
    const input: ResearchLaboratoryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Laboratories',
      laboratories: [VALID_LAB_1, VALID_LAB_2],
    };

    const artifact = composeResearchLaboratories(input);

    // Laboratory metadata should only contain input data, not generated summaries
    for (const lab of artifact.laboratoryRegistry.laboratories) {
      assert.ok(!lab.title.includes('generated'));
      assert.ok(!lab.title.includes('synthesized'));
    }
  });
});

// ---------------------------------------------------------------------------
// Additional Negative Tests
// ---------------------------------------------------------------------------

describe('additional negative tests', () => {
  it('should validate complete artifact', () => {
    const input: ResearchLaboratoryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Laboratories',
      laboratories: [VALID_LAB_1, VALID_LAB_2],
    };

    const artifact = composeResearchLaboratories(input);
    const result = validateResearchArtifactWithLaboratories(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate laboratory input', () => {
    const input: ResearchLaboratoryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Laboratories',
      laboratories: [VALID_LAB_1, VALID_LAB_2],
    };

    const errors = validateLaboratoryInput(input);
    assert.equal(errors.length, 0);
  });

  it('should detect missing concept ID in input', () => {
    const input: ResearchLaboratoryInput = {
      conceptId: '',
      conceptLabel: 'Laboratories',
      laboratories: [VALID_LAB_1],
    };

    const errors = validateLaboratoryInput(input);
    const conceptError = errors.find((e) => e.field === 'conceptId');

    assert.ok(conceptError, 'Should have conceptId error');
  });

  it('should detect missing concept label in input', () => {
    const input: ResearchLaboratoryInput = {
      conceptId: 'concept-001',
      conceptLabel: '',
      laboratories: [VALID_LAB_1],
    };

    const errors = validateLaboratoryInput(input);
    const labelError = errors.find((e) => e.field === 'conceptLabel');

    assert.ok(labelError, 'Should have conceptLabel error');
  });

  it('should detect missing laboratories in input', () => {
    const input: ResearchLaboratoryInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Laboratories',
      laboratories: [],
    };

    const errors = validateLaboratoryInput(input);
    const labsError = errors.find((e) => e.field === 'laboratories');

    assert.ok(labsError, 'Should have laboratories error');
  });

  it('should compose laboratory provenance correctly', () => {
    const provenance = composeLaboratoryProvenance(
      'lab-001',
      'ref-001',
      'research-agent',
      'canonical',
      'algorithm_reproduction',
      'reproduction',
      'Test rationale.',
      'research-agent',
    );

    assert.equal(provenance.laboratoryId, 'lab-001');
    assert.equal(provenance.referenceId, 'ref-001');
    assert.equal(provenance.source, 'research-agent');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.laboratoryType, 'algorithm_reproduction');
    assert.equal(provenance.purpose, 'reproduction');
    assert.equal(provenance.rationale, 'Test rationale.');
    assert.equal(provenance.providedBy, 'research-agent');
  });

  it('should compose laboratory trace correctly', () => {
    const decisions = [
      {
        decisionId: 'decision-001',
        laboratoryId: 'lab-001',
        laboratoryType: 'algorithm_reproduction' as const,
        validationPassed: true,
        validationErrors: [],
      },
    ];

    const trace = composeLaboratoryTrace('trace-001', decisions);

    assert.equal(trace.traceId, 'trace-001');
    assert.equal(trace.metadataCount, 1);
    assert.equal(trace.validatedCount, 1);
    assert.equal(trace.invalidCount, 0);
  });

  it('should detect invalid governance status', () => {
    const lab: ResearchLaboratoryMetadata = {
      ...VALID_LAB_1,
      governanceStatus: '' as any,
    };

    const errors = validateLaboratoryMetadata(lab);
    const statusError = errors.find((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_INVALID_STATUS);

    assert.ok(statusError, 'Should have LABMETA_INVALID_STATUS error');
  });

  it('should detect missing title', () => {
    const lab: ResearchLaboratoryMetadata = {
      ...VALID_LAB_1,
      title: '',
    };

    const errors = validateLaboratoryMetadata(lab);
    const titleError = errors.find((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_MISSING_SOURCE);

    assert.ok(titleError, 'Should have LABMETA_MISSING_SOURCE error');
  });

  it('should detect missing description', () => {
    const lab: ResearchLaboratoryMetadata = {
      ...VALID_LAB_1,
      description: '',
    };

    const errors = validateLaboratoryMetadata(lab);
    const descError = errors.find((e) => e.code === LABORATORY_VALIDATION_CODES.LABMETA_MISSING_SOURCE);

    assert.ok(descError, 'Should have LABMETA_MISSING_SOURCE error');
  });
});
