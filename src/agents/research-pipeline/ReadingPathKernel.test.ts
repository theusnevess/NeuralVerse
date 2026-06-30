/**
 * NV-1400-D2-OPT-09 — Research Reading Path Orchestration Test Suite
 *
 * Comprehensive tests for the reading path kernel.
 * Covers: valid reading path, valid registry, duplicate path,
 * duplicate node, unsupported path type, unsupported stage,
 * invalid ordering, missing provenance, invalid reference,
 * empty path, empty registry, deterministic ordering,
 * immutable input, identical output, no recommendation logic,
 * no personalization, no generated content.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeReadingPathNode,
  composeReadingPathProvenance,
  composeReadingPath,
  composeReadingPathRegistry,
  composeResearchReadingPaths,
  composeReadingPathTrace,
  isSupportedReadingPathType,
  isSupportedReadingPathStage,
  getCanonicalReadingPathTypes,
  getCanonicalReadingPathStages,
} from './ReadingPathKernel.ts';

import {
  validateReadingPathNode,
  validateReadingPath,
  validateReadingPathRegistry,
  validateResearchArtifactWithReadingPaths,
  validateReadingPathInput,
  READING_PATH_VALIDATION_CODES,
} from './ReadingPathValidation.ts';

import type {
  ResearchReadingPath,
  ResearchReadingPathInput,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE_1 = {
  pathId: 'path-001',
  referenceId: 'ref-001',
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  pathType: 'foundational' as const,
  rationale: 'Foundational reading path for deep learning.',
  providedBy: 'research-agent',
};

const VALID_PROVENANCE_2 = {
  pathId: 'path-002',
  referenceId: 'ref-002',
  source: 'research-agent',
  governanceStatus: 'canonical' as const,
  pathType: 'historical' as const,
  rationale: 'Historical reading path for neural networks.',
  providedBy: 'research-agent',
};

const VALID_NODE_1 = {
  nodeId: 'node-001',
  referenceId: 'ref-001',
  title: 'Deep Learning Fundamentals',
  stage: 'introduction' as const,
  order: 1,
  publicationYear: 2015,
  governanceStatus: 'canonical' as const,
  rationale: 'Essential introduction to deep learning.',
};

const VALID_NODE_2 = {
  nodeId: 'node-002',
  referenceId: 'ref-002',
  title: 'Convolutional Neural Networks',
  stage: 'core_foundation' as const,
  order: 2,
  publicationYear: 2012,
  governanceStatus: 'canonical' as const,
  rationale: 'Foundational paper on CNNs.',
};

const VALID_NODE_3 = {
  nodeId: 'node-003',
  referenceId: 'ref-003',
  title: 'Recurrent Neural Networks',
  stage: 'core_foundation' as const,
  order: 3,
  publicationYear: 2013,
  governanceStatus: 'canonical' as const,
  rationale: 'Foundational paper on RNNs.',
};

const VALID_PATH_1: ResearchReadingPath = {
  pathId: 'path-001',
  pathType: 'foundational',
  title: 'Deep Learning Foundations',
  description: 'A foundational reading path for deep learning.',
  orderedNodes: [VALID_NODE_1, VALID_NODE_2, VALID_NODE_3],
  associatedEvidence: ['ref-001', 'ref-002', 'ref-003'],
  associatedTimeline: ['timeline-001'],
  associatedBenchmarks: ['benchmark-001'],
  associatedDatasets: ['dataset-001'],
  associatedEvolution: ['evolution-001'],
  governanceStatus: 'canonical',
  lifecycle: 'active',
  rationale: 'Essential reading for deep learning.',
  provenance: VALID_PROVENANCE_1,
};

const VALID_PATH_2: ResearchReadingPath = {
  pathId: 'path-002',
  pathType: 'historical',
  title: 'Neural Network History',
  description: 'A historical reading path for neural networks.',
  orderedNodes: [VALID_NODE_1],
  associatedEvidence: ['ref-001'],
  associatedTimeline: ['timeline-001'],
  associatedBenchmarks: [],
  associatedDatasets: [],
  associatedEvolution: [],
  governanceStatus: 'canonical',
  lifecycle: 'active',
  rationale: 'Historical perspective on neural networks.',
  provenance: VALID_PROVENANCE_2,
};

// ---------------------------------------------------------------------------
// Valid Reading Path Tests
// ---------------------------------------------------------------------------

describe('composeReadingPath', () => {
  it('should compose a valid reading path', () => {
    const path = composeReadingPath(
      'path-001',
      'foundational',
      'Test Path',
      'A test reading path.',
      [VALID_NODE_1],
      ['ref-001'],
      ['timeline-001'],
      ['benchmark-001'],
      ['dataset-001'],
      ['evolution-001'],
      'canonical',
      'active',
      'Test rationale.',
      VALID_PROVENANCE_1,
    );

    assert.equal(path.pathId, 'path-001');
    assert.equal(path.pathType, 'foundational');
    assert.equal(path.title, 'Test Path');
    assert.equal(path.lifecycle, 'active');
  });
});

// ---------------------------------------------------------------------------
// Valid Registry Tests
// ---------------------------------------------------------------------------

describe('composeReadingPathRegistry', () => {
  it('should compose a valid reading path registry', () => {
    const registry = composeReadingPathRegistry('registry-001', [VALID_PATH_1, VALID_PATH_2]);

    assert.equal(registry.registryId, 'registry-001');
    assert.equal(registry.paths.length, 2);
    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Path Tests
// ---------------------------------------------------------------------------

describe('duplicate path validation', () => {
  it('should detect duplicate path IDs', () => {
    const registry = composeReadingPathRegistry('registry-001', [
      VALID_PATH_1,
      { ...VALID_PATH_1, pathId: 'path-001' },
    ]);

    const errors = validateReadingPathRegistry(registry);
    const duplicateError = errors.find((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_DUPLICATE_PATH);

    assert.ok(duplicateError, 'Should have READING_PATH_DUPLICATE_PATH error');
  });

  it('should not flag unique path IDs as duplicates', () => {
    const registry = composeReadingPathRegistry('registry-001', [VALID_PATH_1, VALID_PATH_2]);
    const errors = validateReadingPathRegistry(registry);
    const duplicateErrors = errors.filter((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_DUPLICATE_PATH);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Node Tests
// ---------------------------------------------------------------------------

describe('duplicate node validation', () => {
  it('should detect duplicate node IDs', () => {
    const path: ResearchReadingPath = {
      ...VALID_PATH_1,
      orderedNodes: [
        VALID_NODE_1,
        { ...VALID_NODE_1, nodeId: 'node-001' },
      ],
    };

    const errors = validateReadingPath(path);
    const duplicateError = errors.find((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_DUPLICATE_NODE);

    assert.ok(duplicateError, 'Should have READING_PATH_DUPLICATE_NODE error');
  });

  it('should not flag unique node IDs as duplicates', () => {
    const errors = validateReadingPath(VALID_PATH_1);
    const duplicateErrors = errors.filter((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_DUPLICATE_NODE);

    assert.equal(duplicateErrors.length, 0, 'Should not have duplicate errors');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Path Type Tests
// ---------------------------------------------------------------------------

describe('unsupported path type validation', () => {
  it('should detect unsupported path type', () => {
    const path: ResearchReadingPath = {
      ...VALID_PATH_1,
      pathType: 'unsupported_type' as any,
    };

    const errors = validateReadingPath(path);
    const unsupportedError = errors.find((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_UNKNOWN_TYPE);

    assert.ok(unsupportedError, 'Should have READING_PATH_UNKNOWN_TYPE error');
  });

  it('should support all canonical path types', () => {
    const pathTypes = getCanonicalReadingPathTypes();
    assert.equal(pathTypes.length, 10);
    assert.ok(pathTypes.includes('foundational'));
    assert.ok(pathTypes.includes('historical'));
    assert.ok(pathTypes.includes('implementation'));
    assert.ok(pathTypes.includes('mathematical'));
    assert.ok(pathTypes.includes('comparative'));
    assert.ok(pathTypes.includes('survey'));
    assert.ok(pathTypes.includes('benchmark_oriented'));
    assert.ok(pathTypes.includes('dataset_oriented'));
    assert.ok(pathTypes.includes('industry_oriented'));
    assert.ok(pathTypes.includes('advanced'));
  });

  it('should correctly identify supported path types', () => {
    assert.equal(isSupportedReadingPathType('foundational'), true);
    assert.equal(isSupportedReadingPathType('historical'), true);
    assert.equal(isSupportedReadingPathType('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Unsupported Stage Tests
// ---------------------------------------------------------------------------

describe('unsupported stage validation', () => {
  it('should detect unsupported stage', () => {
    const node = {
      ...VALID_NODE_1,
      stage: 'unsupported_stage' as any,
    };

    const errors = validateReadingPathNode(node);
    const unsupportedError = errors.find((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_UNKNOWN_STAGE);

    assert.ok(unsupportedError, 'Should have READING_PATH_UNKNOWN_STAGE error');
  });

  it('should support all canonical stages', () => {
    const stages = getCanonicalReadingPathStages();
    assert.equal(stages.length, 10);
    assert.ok(stages.includes('introduction'));
    assert.ok(stages.includes('background'));
    assert.ok(stages.includes('core_foundation'));
    assert.ok(stages.includes('methodology'));
    assert.ok(stages.includes('evaluation'));
    assert.ok(stages.includes('comparison'));
    assert.ok(stages.includes('extensions'));
    assert.ok(stages.includes('applications'));
    assert.ok(stages.includes('limitations'));
    assert.ok(stages.includes('future_directions'));
  });

  it('should correctly identify supported stages', () => {
    assert.equal(isSupportedReadingPathStage('introduction'), true);
    assert.equal(isSupportedReadingPathStage('core_foundation'), true);
    assert.equal(isSupportedReadingPathStage('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Invalid Ordering Tests
// ---------------------------------------------------------------------------

describe('invalid ordering validation', () => {
  it('should detect invalid ordering', () => {
    const path: ResearchReadingPath = {
      ...VALID_PATH_1,
      orderedNodes: [
        { ...VALID_NODE_2, order: 2 },
        { ...VALID_NODE_1, order: 1 },
      ],
    };

    const errors = validateReadingPath(path);
    const orderError = errors.find((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_NON_DETERMINISTIC_ORDER);

    assert.ok(orderError, 'Should have READING_PATH_NON_DETERMINISTIC_ORDER error');
  });

  it('should not flag valid ordering', () => {
    const errors = validateReadingPath(VALID_PATH_1);
    const orderErrors = errors.filter((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_NON_DETERMINISTIC_ORDER);

    assert.equal(orderErrors.length, 0, 'Should not have ordering errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('missing provenance validation', () => {
  it('should detect missing provenance', () => {
    const path: ResearchReadingPath = {
      ...VALID_PATH_1,
      provenance: null as any,
    };

    const errors = validateReadingPath(path);
    const provenanceError = errors.find((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have READING_PATH_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const path: ResearchReadingPath = {
      ...VALID_PATH_1,
      provenance: {
        ...VALID_PROVENANCE_1,
        rationale: '',
      },
    };

    const errors = validateReadingPath(path);
    const provenanceError = errors.find((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_PROVENANCE);

    assert.ok(provenanceError, 'Should have READING_PATH_MISSING_PROVENANCE error');
  });

  it('should not flag valid provenance', () => {
    const errors = validateReadingPath(VALID_PATH_1);
    const provenanceErrors = errors.filter((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_PROVENANCE);

    assert.equal(provenanceErrors.length, 0, 'Should not have provenance errors');
  });
});

// ---------------------------------------------------------------------------
// Invalid Reference Tests
// ---------------------------------------------------------------------------

describe('invalid reference validation', () => {
  it('should detect invalid reference ID', () => {
    const node = {
      ...VALID_NODE_1,
      referenceId: '',
    };

    const errors = validateReadingPathNode(node);
    const refError = errors.find((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_INVALID_REFERENCE);

    assert.ok(refError, 'Should have READING_PATH_INVALID_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Empty Path Tests
// ---------------------------------------------------------------------------

describe('empty path validation', () => {
  it('should detect empty path', () => {
    const path: ResearchReadingPath = {
      ...VALID_PATH_1,
      orderedNodes: [],
    };

    const errors = validateReadingPath(path);
    const emptyErrors = errors.filter((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_EMPTY_PATH);

    assert.ok(emptyErrors.length > 0, 'Should have READING_PATH_EMPTY_PATH errors');
  });

  it('should not flag non-empty path', () => {
    const errors = validateReadingPath(VALID_PATH_1);
    const emptyErrors = errors.filter((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_EMPTY_PATH);

    assert.equal(emptyErrors.length, 0, 'Should not have empty path errors');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('empty registry validation', () => {
  it('should detect empty registry', () => {
    const registry = composeReadingPathRegistry('registry-001', []);
    const errors = validateReadingPathRegistry(registry);
    const emptyErrors = errors.filter((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_EMPTY_REGISTRY);

    assert.ok(emptyErrors.length > 0, 'Should have READING_PATH_EMPTY_REGISTRY errors');
  });

  it('should not flag non-empty registry', () => {
    const registry = composeReadingPathRegistry('registry-001', [VALID_PATH_1]);
    const errors = validateReadingPathRegistry(registry);
    const emptyErrors = errors.filter((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_EMPTY_REGISTRY);

    assert.equal(emptyErrors.length, 0, 'Should not have empty registry errors');
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('deterministic ordering', () => {
  it('should sort paths deterministically by ID', () => {
    const registry = composeReadingPathRegistry('registry-001', [VALID_PATH_2, VALID_PATH_1]);

    assert.equal(registry.paths[0].pathId, 'path-001');
    assert.equal(registry.paths[1].pathId, 'path-002');
  });

  it('should sort nodes deterministically by order', () => {
    const path = composeReadingPath(
      'path-001',
      'foundational',
      'Test Path',
      'A test reading path.',
      [VALID_NODE_3, VALID_NODE_1, VALID_NODE_2],
      ['ref-001'],
      ['timeline-001'],
      ['benchmark-001'],
      ['dataset-001'],
      ['evolution-001'],
      'canonical',
      'active',
      'Test rationale.',
      VALID_PROVENANCE_1,
    );

    assert.equal(path.orderedNodes[0].nodeId, 'node-001');
    assert.equal(path.orderedNodes[1].nodeId, 'node-002');
    assert.equal(path.orderedNodes[2].nodeId, 'node-003');
  });

  it('should produce identical ordering for identical input', () => {
    const input: ResearchReadingPathInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Reading Paths',
      paths: [VALID_PATH_2, VALID_PATH_1],
    };

    const output1 = composeResearchReadingPaths(input);
    const output2 = composeResearchReadingPaths(input);

    assert.deepEqual(output1.readingPathRegistry.paths, output2.readingPathRegistry.paths);
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('immutable input', () => {
  it('should not mutate input paths', () => {
    const input: ResearchReadingPathInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Reading Paths',
      paths: [VALID_PATH_1, VALID_PATH_2],
    };

    const originalTitle = VALID_PATH_1.title;

    composeResearchReadingPaths(input);

    assert.equal(VALID_PATH_1.title, originalTitle);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('identical output', () => {
  it('should produce identical registries', () => {
    const input: ResearchReadingPathInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Reading Paths',
      paths: [VALID_PATH_1, VALID_PATH_2],
    };

    const artifact1 = composeResearchReadingPaths(input);
    const artifact2 = composeResearchReadingPaths(input);

    assert.deepEqual(artifact1.readingPathRegistry, artifact2.readingPathRegistry);
  });

  it('should produce identical traces', () => {
    const input: ResearchReadingPathInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Reading Paths',
      paths: [VALID_PATH_1, VALID_PATH_2],
    };

    const artifact1 = composeResearchReadingPaths(input);
    const artifact2 = composeResearchReadingPaths(input);

    assert.deepEqual(artifact1.readingPathTrace, artifact2.readingPathTrace);
  });
});

// ---------------------------------------------------------------------------
// No Recommendation Logic Tests
// ---------------------------------------------------------------------------

describe('no recommendation logic', () => {
  it('should not recommend papers', () => {
    const input: ResearchReadingPathInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Reading Paths',
      paths: [VALID_PATH_1, VALID_PATH_2],
    };

    const artifact = composeResearchReadingPaths(input);

    // Should not have recommendation fields
    assert.ok(!('recommendations' in artifact), 'Should not have recommendations field');
    assert.ok(!('suggestedReadings' in artifact), 'Should not have suggestedReadings field');
    assert.ok(!('nextSteps' in artifact), 'Should not have nextSteps field');
  });
});

// ---------------------------------------------------------------------------
// No Personalization Tests
// ---------------------------------------------------------------------------

describe('no personalization', () => {
  it('should not personalize reading', () => {
    const input: ResearchReadingPathInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Reading Paths',
      paths: [VALID_PATH_1, VALID_PATH_2],
    };

    const artifact = composeResearchReadingPaths(input);

    // Should not have personalization fields
    assert.ok(!('personalizedPath' in artifact), 'Should not have personalizedPath field');
    assert.ok(!('learnerProfile' in artifact), 'Should not have learnerProfile field');
    assert.ok(!('difficultyLevel' in artifact), 'Should not have difficultyLevel field');
  });
});

// ---------------------------------------------------------------------------
// No Generated Content Tests
// ---------------------------------------------------------------------------

describe('no generated content', () => {
  it('should not generate educational content', () => {
    const input: ResearchReadingPathInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Reading Paths',
      paths: [VALID_PATH_1, VALID_PATH_2],
    };

    const artifact = composeResearchReadingPaths(input);

    // Reading path metadata should only contain input data, not generated summaries
    for (const path of artifact.readingPathRegistry.paths) {
      assert.ok(!path.title.includes('generated'));
      assert.ok(!path.title.includes('synthesized'));
    }
  });
});

// ---------------------------------------------------------------------------
// Additional Negative Tests
// ---------------------------------------------------------------------------

describe('additional negative tests', () => {
  it('should validate complete artifact', () => {
    const input: ResearchReadingPathInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Reading Paths',
      paths: [VALID_PATH_1, VALID_PATH_2],
    };

    const artifact = composeResearchReadingPaths(input);
    const result = validateResearchArtifactWithReadingPaths(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate reading path input', () => {
    const input: ResearchReadingPathInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Reading Paths',
      paths: [VALID_PATH_1, VALID_PATH_2],
    };

    const errors = validateReadingPathInput(input);
    assert.equal(errors.length, 0);
  });

  it('should detect missing concept ID in input', () => {
    const input: ResearchReadingPathInput = {
      conceptId: '',
      conceptLabel: 'Reading Paths',
      paths: [VALID_PATH_1],
    };

    const errors = validateReadingPathInput(input);
    const conceptError = errors.find((e) => e.field === 'conceptId');

    assert.ok(conceptError, 'Should have conceptId error');
  });

  it('should detect missing concept label in input', () => {
    const input: ResearchReadingPathInput = {
      conceptId: 'concept-001',
      conceptLabel: '',
      paths: [VALID_PATH_1],
    };

    const errors = validateReadingPathInput(input);
    const labelError = errors.find((e) => e.field === 'conceptLabel');

    assert.ok(labelError, 'Should have conceptLabel error');
  });

  it('should detect missing paths in input', () => {
    const input: ResearchReadingPathInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Reading Paths',
      paths: [],
    };

    const errors = validateReadingPathInput(input);
    const pathsError = errors.find((e) => e.field === 'paths');

    assert.ok(pathsError, 'Should have paths error');
  });

  it('should compose reading path provenance correctly', () => {
    const provenance = composeReadingPathProvenance(
      'path-001',
      'ref-001',
      'research-agent',
      'canonical',
      'foundational',
      'Test rationale.',
      'research-agent',
    );

    assert.equal(provenance.pathId, 'path-001');
    assert.equal(provenance.referenceId, 'ref-001');
    assert.equal(provenance.source, 'research-agent');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.pathType, 'foundational');
    assert.equal(provenance.rationale, 'Test rationale.');
    assert.equal(provenance.providedBy, 'research-agent');
  });

  it('should compose reading path node correctly', () => {
    const node = composeReadingPathNode(
      'node-001',
      'ref-001',
      'Test Node',
      'introduction',
      1,
      2015,
      'canonical',
      'Test rationale.',
    );

    assert.equal(node.nodeId, 'node-001');
    assert.equal(node.referenceId, 'ref-001');
    assert.equal(node.title, 'Test Node');
    assert.equal(node.stage, 'introduction');
    assert.equal(node.order, 1);
    assert.equal(node.publicationYear, 2015);
    assert.equal(node.governanceStatus, 'canonical');
    assert.equal(node.rationale, 'Test rationale.');
  });

  it('should compose reading path trace correctly', () => {
    const decisions = [
      {
        decisionId: 'decision-001',
        pathId: 'path-001',
        pathType: 'foundational' as const,
        validationPassed: true,
        validationErrors: [],
      },
    ];

    const trace = composeReadingPathTrace('trace-001', decisions);

    assert.equal(trace.traceId, 'trace-001');
    assert.equal(trace.pathCount, 1);
    assert.equal(trace.validatedCount, 1);
    assert.equal(trace.invalidCount, 0);
  });

  it('should detect invalid governance status', () => {
    const path: ResearchReadingPath = {
      ...VALID_PATH_1,
      governanceStatus: '' as any,
    };

    const errors = validateReadingPath(path);
    const statusError = errors.find((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_INVALID_STATUS);

    assert.ok(statusError, 'Should have READING_PATH_INVALID_STATUS error');
  });

  it('should detect missing associated evidence', () => {
    const path: ResearchReadingPath = {
      ...VALID_PATH_1,
      associatedEvidence: [],
    };

    const errors = validateReadingPath(path);
    const evidenceError = errors.find((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_EVIDENCE);

    assert.ok(evidenceError, 'Should have READING_PATH_MISSING_EVIDENCE error');
  });

  it('should detect missing description', () => {
    const path: ResearchReadingPath = {
      ...VALID_PATH_1,
      description: '',
    };

    const errors = validateReadingPath(path);
    const descError = errors.find((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_SOURCE);

    assert.ok(descError, 'Should have READING_PATH_MISSING_SOURCE error');
  });

  it('should detect invalid order in node', () => {
    const node = {
      ...VALID_NODE_1,
      order: -1,
    };

    const errors = validateReadingPathNode(node);
    const orderError = errors.find((e) => e.code === READING_PATH_VALIDATION_CODES.READING_PATH_INVALID_ORDER);

    assert.ok(orderError, 'Should have READING_PATH_INVALID_ORDER error');
  });
});
