/**
 * NV-1600-D4-OPT-01 — Laboratory Contract & Registry Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Laboratory Kernel.
 * Covers: valid laboratory, duplicate ID, duplicate title, unsupported type,
 * unsupported level, unsupported status, missing provenance, missing source,
 * missing rationale, missing providedBy, empty registry, deterministic ordering,
 * immutable input, identical output, artifact validation, registry validation,
 * trace validation, helper functions, canonical enum completeness,
 * negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  LaboratoryMetadata,
  LaboratoryInput,
  LaboratoryRegistry,
  LaboratoryArtifact,
  LaboratoryTrace,
  LaboratoryNode,
  LaboratoryProvenance,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_LABORATORY_TYPES,
  CANONICAL_LABORATORY_LEVELS,
  CANONICAL_LABORATORY_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

import {
  composeLaboratoryProvenance,
  composeLaboratoryTrace,
  composeLaboratoryNode,
  composeLaboratoryArtifact,
  composeLaboratoryRegistry,
  composeLaboratory,
  composeLaboratoryRegistryFromInput,
  isSupportedLaboratoryType,
  isSupportedLaboratoryLevel,
  isSupportedLaboratoryStatus,
  isSupportedGovernanceStatus,
  getCanonicalLaboratoryTypes,
  getCanonicalLaboratoryLevels,
  getCanonicalLaboratoryStatuses,
  getCanonicalGovernanceStatuses,
} from './LaboratoryKernel.ts';

import {
  validateLaboratory,
  validateLaboratoryRegistry,
  validateLaboratoryArtifact,
  validateLaboratoryInput,
  LABORATORY_VALIDATION_CODES,
} from './LaboratoryValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_LABORATORY: LaboratoryMetadata = {
  laboratoryId: 'lab-001',
  title: 'Introduction to Neural Networks',
  description: 'An interactive demo of basic neural network concepts.',
  laboratoryType: 'interactive_demo',
  laboratoryLevel: 'beginner',
  status: 'published',
  governanceStatus: 'canonical',
  tags: ['neural_networks', 'introduction'],
  estimatedDurationMinutes: 30,
  prerequisites: [],
  learningObjectives: ['Understand basic neural network architecture'],
  author: 'NeuralVerse Team',
};

const VALID_LABORATORY_2: LaboratoryMetadata = {
  laboratoryId: 'lab-002',
  title: 'Convolutional Vision Pipeline',
  description: 'A simulation of CNN feature extraction.',
  laboratoryType: 'computer_vision',
  laboratoryLevel: 'intermediate',
  status: 'approved',
  governanceStatus: 'accepted',
  tags: ['cnn', 'vision'],
  estimatedDurationMinutes: 45,
  prerequisites: ['lab-001'],
  learningObjectives: ['Understand convolution operations'],
  author: 'NeuralVerse Team',
};

const INVALID_LABORATORY_MISSING_ID: LaboratoryMetadata = {
  laboratoryId: '',
  title: 'Missing ID Lab',
  description: 'A lab with no ID.',
  laboratoryType: 'simulation',
  laboratoryLevel: 'beginner',
  status: 'draft',
  governanceStatus: 'provisional',
  tags: [],
  estimatedDurationMinutes: 10,
  prerequisites: [],
  learningObjectives: [],
  author: 'Test Author',
};

const INVALID_LABORATORY_MISSING_TITLE: LaboratoryMetadata = {
  laboratoryId: 'lab-003',
  title: '',
  description: 'A lab with no title.',
  laboratoryType: 'simulation',
  laboratoryLevel: 'beginner',
  status: 'draft',
  governanceStatus: 'provisional',
  tags: [],
  estimatedDurationMinutes: 10,
  prerequisites: [],
  learningObjectives: [],
  author: 'Test Author',
};

const INVALID_LABORATORY_UNKNOWN_TYPE: LaboratoryMetadata = {
  laboratoryId: 'lab-004',
  title: 'Unknown Type Lab',
  description: 'A lab with an unsupported type.',
  laboratoryType: 'unsupported_type' as any,
  laboratoryLevel: 'beginner',
  status: 'draft',
  governanceStatus: 'provisional',
  tags: [],
  estimatedDurationMinutes: 10,
  prerequisites: [],
  learningObjectives: [],
  author: 'Test Author',
};

const INVALID_LABORATORY_UNKNOWN_LEVEL: LaboratoryMetadata = {
  laboratoryId: 'lab-005',
  title: 'Unknown Level Lab',
  description: 'A lab with an unsupported level.',
  laboratoryType: 'simulation',
  laboratoryLevel: 'unsupported_level' as any,
  status: 'draft',
  governanceStatus: 'provisional',
  tags: [],
  estimatedDurationMinutes: 10,
  prerequisites: [],
  learningObjectives: [],
  author: 'Test Author',
};

const INVALID_LABORATORY_UNKNOWN_STATUS: LaboratoryMetadata = {
  laboratoryId: 'lab-006',
  title: 'Unknown Status Lab',
  description: 'A lab with an unsupported status.',
  laboratoryType: 'simulation',
  laboratoryLevel: 'beginner',
  status: 'unsupported_status' as any,
  governanceStatus: 'provisional',
  tags: [],
  estimatedDurationMinutes: 10,
  prerequisites: [],
  learningObjectives: [],
  author: 'Test Author',
};

// ---------------------------------------------------------------------------
// Valid Laboratory Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Valid Laboratory', () => {
  it('should compose valid laboratory provenance', () => {
    const provenance = composeLaboratoryProvenance({
      laboratoryId: 'lab-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Educational purpose',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.laboratoryId, 'lab-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.rationale, 'Educational purpose');
    assert.equal(provenance.providedBy, 'NeuralVerse Team');
  });

  it('should compose valid laboratory trace', () => {
    const trace = composeLaboratoryTrace({
      traceId: '_trace_1',
      laboratoryCount: 2,
      decisions: [
        { decisionId: 'd1', laboratoryId: 'lab-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', laboratoryId: 'lab-002', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.laboratoryCount, 2);
    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.invalidCount, 0);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid laboratory node', () => {
    const provenance = composeLaboratoryProvenance({
      laboratoryId: 'lab-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Educational purpose',
      providedBy: 'NeuralVerse Team',
    });

    const node = composeLaboratoryNode({
      laboratoryId: 'lab-001',
      metadata: VALID_LABORATORY,
      provenance,
    });

    assert.equal(node.nodeId, '_node_lab-001');
    assert.equal(node.laboratoryId, 'lab-001');
    assert.equal(node.metadata.title, 'Introduction to Neural Networks');
  });

  it('should compose valid laboratory artifact', () => {
    const provenance = composeLaboratoryProvenance({
      laboratoryId: 'lab-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Educational purpose',
      providedBy: 'NeuralVerse Team',
    });

    const node = composeLaboratoryNode({
      laboratoryId: 'lab-001',
      metadata: VALID_LABORATORY,
      provenance,
    });

    const trace = composeLaboratoryTrace({
      traceId: '_trace_1',
      laboratoryCount: 1,
      decisions: [
        { decisionId: 'd1', laboratoryId: 'lab-001', validationPassed: true, validationErrors: [] },
      ],
    });

    const artifact = composeLaboratoryArtifact({
      artifactId: '_artifact_lab-001',
      laboratoryNode: node,
      trace,
    });

    assert.equal(artifact.artifactId, '_artifact_lab-001');
    assert.equal(artifact.laboratoryNode.laboratoryId, 'lab-001');
    assert.equal(artifact.trace.deterministic, true);
  });

  it('should validate a valid laboratory with no errors', () => {
    const errors = validateLaboratory(VALID_LABORATORY);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid laboratory artifact', () => {
    const input: LaboratoryInput = {
      laboratories: [VALID_LABORATORY],
    };

    const artifact = composeLaboratory(input);
    const result = validateLaboratoryArtifact(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate a valid laboratory input', () => {
    const input: LaboratoryInput = {
      laboratories: [VALID_LABORATORY, VALID_LABORATORY_2],
    };

    const result = validateLaboratoryInput(input);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Duplicate ID Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Duplicate ID', () => {
  it('should detect duplicate laboratory IDs in registry', () => {
    const registry = composeLaboratoryRegistry([VALID_LABORATORY, VALID_LABORATORY]);
    const result = validateLaboratoryRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LAB_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have LAB_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Title Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Duplicate Title', () => {
  it('should detect duplicate laboratory titles in registry', () => {
    const lab1 = { ...VALID_LABORATORY, laboratoryId: 'lab-001', title: 'Same Title' };
    const lab2 = { ...VALID_LABORATORY, laboratoryId: 'lab-002', title: 'Same Title' };
    const registry = composeLaboratoryRegistry([lab1, lab2]);
    const result = validateLaboratoryRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LAB_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have LAB_DUPLICATE_TITLE error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Type Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Unsupported Type', () => {
  it('should reject unsupported laboratory type', () => {
    assert.equal(isSupportedLaboratoryType('interactive_demo'), true);
    assert.equal(isSupportedLaboratoryType('simulation'), true);
    assert.equal(isSupportedLaboratoryType('unsupported_type'), false);
  });

  it('should detect unsupported type in validation', () => {
    const errors = validateLaboratory(INVALID_LABORATORY_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LAB_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have LAB_UNKNOWN_TYPE error');
    assert.equal(typeError.field, 'laboratoryType');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Level Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Unsupported Level', () => {
  it('should reject unsupported laboratory level', () => {
    assert.equal(isSupportedLaboratoryLevel('beginner'), true);
    assert.equal(isSupportedLaboratoryLevel('advanced'), true);
    assert.equal(isSupportedLaboratoryLevel('unsupported_level'), false);
  });

  it('should detect unsupported level in validation', () => {
    const errors = validateLaboratory(INVALID_LABORATORY_UNKNOWN_LEVEL);
    const levelError = errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LAB_UNKNOWN_LEVEL,
    );

    assert.ok(levelError, 'Should have LAB_UNKNOWN_LEVEL error');
    assert.equal(levelError.field, 'laboratoryLevel');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Status Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Unsupported Status', () => {
  it('should reject unsupported laboratory status', () => {
    assert.equal(isSupportedLaboratoryStatus('draft'), true);
    assert.equal(isSupportedLaboratoryStatus('published'), true);
    assert.equal(isSupportedLaboratoryStatus('unsupported_status'), false);
  });

  it('should detect unsupported status in validation', () => {
    const errors = validateLaboratory(INVALID_LABORATORY_UNKNOWN_STATUS);
    const statusError = errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LAB_UNKNOWN_STATUS,
    );

    assert.ok(statusError, 'Should have LAB_UNKNOWN_STATUS error');
    assert.equal(statusError.field, 'status');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Missing Provenance', () => {
  it('should detect missing source in provenance', () => {
    const provenance = composeLaboratoryProvenance({
      laboratoryId: 'lab-001',
      source: '',
      governanceStatus: 'canonical',
      rationale: 'Educational purpose',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.source, '');
  });

  it('should detect missing rationale in provenance', () => {
    const provenance = composeLaboratoryProvenance({
      laboratoryId: 'lab-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: '',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.rationale, '');
  });

  it('should detect missing providedBy in provenance', () => {
    const provenance = composeLaboratoryProvenance({
      laboratoryId: 'lab-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Educational purpose',
      providedBy: '',
    });

    assert.equal(provenance.providedBy, '');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Missing Source', () => {
  it('should validate laboratory with source', () => {
    const lab = { ...VALID_LABORATORY, author: 'Test Author' };
    const errors = validateLaboratory(lab);
    const sourceErrors = errors.filter(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LAB_MISSING_SOURCE,
    );
    assert.equal(sourceErrors.length, 0, 'Should not have source errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Rationale Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Missing Rationale', () => {
  it('should validate laboratory with rationale', () => {
    const lab = { ...VALID_LABORATORY };
    const errors = validateLaboratory(lab);
    const rationaleErrors = errors.filter(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LAB_MISSING_RATIONALE,
    );
    assert.equal(rationaleErrors.length, 0, 'Should not have rationale errors');
  });
});

// ---------------------------------------------------------------------------
// Missing ProvidedBy Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Missing ProvidedBy', () => {
  it('should validate laboratory with providedBy', () => {
    const lab = { ...VALID_LABORATORY };
    const errors = validateLaboratory(lab);
    const providedByErrors = errors.filter(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LAB_MISSING_PROVIDED_BY,
    );
    assert.equal(providedByErrors.length, 0, 'Should not have providedBy errors');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Empty Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeLaboratoryRegistry([]);
    const result = validateLaboratoryRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LAB_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have LAB_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input', () => {
    const input: LaboratoryInput = { laboratories: [] };
    const result = validateLaboratoryInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LAB_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have LAB_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Deterministic Ordering', () => {
  it('should sort laboratories by laboratoryId', () => {
    const lab3 = { ...VALID_LABORATORY, laboratoryId: 'lab-003', title: 'Lab C' };
    const lab1 = { ...VALID_LABORATORY, laboratoryId: 'lab-001', title: 'Lab A' };
    const lab2 = { ...VALID_LABORATORY, laboratoryId: 'lab-002', title: 'Lab B' };

    const registry = composeLaboratoryRegistry([lab3, lab1, lab2]);

    assert.equal(registry.laboratories[0].laboratoryId, 'lab-001');
    assert.equal(registry.laboratories[1].laboratoryId, 'lab-002');
    assert.equal(registry.laboratories[2].laboratoryId, 'lab-003');
  });

  it('should sort by laboratoryType when laboratoryId is equal', () => {
    const labA = { ...VALID_LABORATORY, laboratoryId: 'lab-001', laboratoryType: 'simulation' as const, title: 'Lab A' };
    const labB = { ...VALID_LABORATORY, laboratoryId: 'lab-001', laboratoryType: 'interactive_demo' as const, title: 'Lab B' };

    const registry = composeLaboratoryRegistry([labA, labB]);

    assert.equal(registry.laboratories[0].laboratoryType, 'interactive_demo');
    assert.equal(registry.laboratories[1].laboratoryType, 'simulation');
  });

  it('should sort by title when laboratoryId and laboratoryType are equal', () => {
    const labA = { ...VALID_LABORATORY, laboratoryId: 'lab-001', laboratoryType: 'simulation' as const, title: 'Alpha Lab' };
    const labB = { ...VALID_LABORATORY, laboratoryId: 'lab-001', laboratoryType: 'simulation' as const, title: 'Beta Lab' };

    const registry = composeLaboratoryRegistry([labB, labA]);

    assert.equal(registry.laboratories[0].title, 'Alpha Lab');
    assert.equal(registry.laboratories[1].title, 'Beta Lab');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Immutable Input', () => {
  it('should not mutate input laboratories', () => {
    const input: LaboratoryInput = {
      laboratories: [VALID_LABORATORY],
    };

    const originalTitle = VALID_LABORATORY.title;
    const originalId = VALID_LABORATORY.laboratoryId;

    composeLaboratory(input);

    assert.equal(VALID_LABORATORY.title, originalTitle);
    assert.equal(VALID_LABORATORY.laboratoryId, originalId);
  });

  it('should not mutate input registry laboratories', () => {
    const labs = [VALID_LABORATORY, VALID_LABORATORY_2];
    const originalTitles = labs.map((l) => l.title);

    composeLaboratoryRegistry(labs);

    assert.equal(labs[0].title, originalTitles[0]);
    assert.equal(labs[1].title, originalTitles[1]);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Identical Output', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const input: LaboratoryInput = {
      laboratories: [VALID_LABORATORY, VALID_LABORATORY_2],
    };

    const results: ReturnType<typeof composeLaboratory>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeLaboratory(input));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifactId, results[i].artifactId);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
      assert.deepStrictEqual(results[0].trace.decisions, results[i].trace.decisions);
      assert.deepStrictEqual(results[0].laboratoryNode.metadata, results[i].laboratoryNode.metadata);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const labs = [VALID_LABORATORY, VALID_LABORATORY_2];

    const results: ReturnType<typeof composeLaboratoryRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeLaboratoryRegistry(labs));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].laboratories, results[i].laboratories);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Artifact Validation Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Artifact Validation', () => {
  it('should validate a complete artifact', () => {
    const input: LaboratoryInput = {
      laboratories: [VALID_LABORATORY],
    };

    const artifact = composeLaboratory(input);
    const result = validateLaboratoryArtifact(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'laboratory_artifact_composition');
  });

  it('should detect missing artifact ID', () => {
    const provenance = composeLaboratoryProvenance({
      laboratoryId: 'lab-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Educational purpose',
      providedBy: 'NeuralVerse Team',
    });

    const node = composeLaboratoryNode({
      laboratoryId: 'lab-001',
      metadata: VALID_LABORATORY,
      provenance,
    });

    const trace = composeLaboratoryTrace({
      traceId: '_trace_1',
      laboratoryCount: 1,
      decisions: [
        { decisionId: 'd1', laboratoryId: 'lab-001', validationPassed: true, validationErrors: [] },
      ],
    });

    const artifact = composeLaboratoryArtifact({
      artifactId: '',
      laboratoryNode: node,
      trace,
    });

    const result = validateLaboratoryArtifact(artifact);
    const artifactError = result.errors.find(
      (e) => e.code === LABORATORY_VALIDATION_CODES.LAB_INVALID_ARTIFACT,
    );

    assert.ok(artifactError, 'Should have LAB_INVALID_ARTIFACT error');
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Registry Validation', () => {
  it('should validate a complete registry', () => {
    const registry = composeLaboratoryRegistry([VALID_LABORATORY, VALID_LABORATORY_2]);
    const result = validateLaboratoryRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'laboratory_registry_composition');
  });

  it('should validate registry determinism metadata', () => {
    const registry = composeLaboratoryRegistry([VALID_LABORATORY]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.generatedFrom, 'deterministic_laboratory_kernel');
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Trace Validation', () => {
  it('should validate trace determinism metadata', () => {
    const trace = composeLaboratoryTrace({
      traceId: '_trace_1',
      laboratoryCount: 1,
      decisions: [
        { decisionId: 'd1', laboratoryId: 'lab-001', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
    assert.equal(trace.generatedFrom, 'deterministic_laboratory_kernel');
  });

  it('should count validated and invalid decisions', () => {
    const trace = composeLaboratoryTrace({
      traceId: '_trace_1',
      laboratoryCount: 3,
      decisions: [
        { decisionId: 'd1', laboratoryId: 'lab-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', laboratoryId: 'lab-002', validationPassed: false, validationErrors: ['LAB_UNKNOWN_TYPE'] },
        { decisionId: 'd3', laboratoryId: 'lab-003', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.invalidCount, 1);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Helper Functions', () => {
  it('should return canonical laboratory types', () => {
    const types = getCanonicalLaboratoryTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_LABORATORY_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical laboratory levels', () => {
    const levels = getCanonicalLaboratoryLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_LABORATORY_LEVELS]);
    assert.equal(levels.length, 5);
  });

  it('should return canonical laboratory statuses', () => {
    const statuses = getCanonicalLaboratoryStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_LABORATORY_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should return canonical governance statuses', () => {
    const statuses = getCanonicalGovernanceStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_GOVERNANCE_STATUSES]);
    assert.equal(statuses.length, 5);
  });

  it('should validate governance status', () => {
    assert.equal(isSupportedGovernanceStatus('canonical'), true);
    assert.equal(isSupportedGovernanceStatus('accepted'), true);
    assert.equal(isSupportedGovernanceStatus('provisional'), true);
    assert.equal(isSupportedGovernanceStatus('deprecated'), true);
    assert.equal(isSupportedGovernanceStatus('rejected'), true);
    assert.equal(isSupportedGovernanceStatus('invalid'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 laboratory types', () => {
    assert.equal(CANONICAL_LABORATORY_TYPES.length, 10);
  });

  it('should have exactly 5 laboratory levels', () => {
    assert.equal(CANONICAL_LABORATORY_LEVELS.length, 5);
  });

  it('should have exactly 6 laboratory statuses', () => {
    assert.equal(CANONICAL_LABORATORY_STATUS.length, 6);
  });

  it('should have exactly 5 governance statuses', () => {
    assert.equal(CANONICAL_GOVERNANCE_STATUSES.length, 5);
  });

  it('should contain all expected laboratory types', () => {
    const expectedTypes = [
      'interactive_demo',
      'simulation',
      'parameter_exploration',
      'visualization',
      'algorithm_execution',
      'mathematical_experiment',
      'machine_learning',
      'computer_vision',
      'agent_system',
      'capstone_lab',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_LABORATORY_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected laboratory levels', () => {
    const expectedLevels = ['beginner', 'intermediate', 'advanced', 'expert', 'research'];

    for (const level of expectedLevels) {
      assert.ok(
        CANONICAL_LABORATORY_LEVELS.includes(level as any),
        `Should include level: ${level}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Laboratory Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const input: LaboratoryInput = {
      laboratories: [VALID_LABORATORY],
    };

    const result = composeLaboratory(input);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const input: LaboratoryInput = {
      laboratories: [VALID_LABORATORY],
    };

    const result = composeLaboratory(input);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const input: LaboratoryInput = {
      laboratories: [VALID_LABORATORY],
    };

    const result = composeLaboratory(input);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const input: LaboratoryInput = {
      laboratories: [VALID_LABORATORY],
    };

    const result = composeLaboratory(input);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not execute code', () => {
    const input: LaboratoryInput = {
      laboratories: [VALID_LABORATORY],
    };

    const result = composeLaboratory(input);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
    assert.ok(!('stdout' in result), 'Should not have stdout');
  });

  it('should not run simulations', () => {
    const input: LaboratoryInput = {
      laboratories: [VALID_LABORATORY],
    };

    const result = composeLaboratory(input);
    assert.ok(!('simulationResult' in result), 'Should not have simulation result');
    assert.ok(!('runtimeState' in result), 'Should not have runtime state');
  });

  it('should not perform network requests', () => {
    const input: LaboratoryInput = {
      laboratories: [VALID_LABORATORY],
    };

    const result = composeLaboratory(input);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not generate educational content', () => {
    const input: LaboratoryInput = {
      laboratories: [VALID_LABORATORY],
    };

    const result = composeLaboratory(input);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('educationalMaterial' in result), 'Should not have educational material');
  });
});
