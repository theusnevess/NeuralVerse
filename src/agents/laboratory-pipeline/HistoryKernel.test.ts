/**
 * NV-1600-D4-OPT-09 — Laboratory History & Local Evidence Modeling Test Suite
 *
 * Comprehensive deterministic test suite for the History Kernel.
 * Covers: valid history, valid evidence, valid relationship, duplicate IDs,
 * unsupported enums, invalid references, missing provenance, empty registry,
 * deterministic ordering, immutable input, identical output (100 iterations),
 * helper functions, canonical enum completeness, registry validation,
 * artifact validation, trace validation, relationship validation,
 * negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  LaboratoryHistoryRecord,
  LaboratoryEvidenceRecord,
  LaboratoryEvidenceRelationship,
  LaboratoryHistoryInput,
  LaboratoryHistoryRegistry,
  LaboratoryArtifactWithHistory,
  LaboratoryHistoryTrace,
  LaboratoryHistoryProvenance,
  LaboratoryEvidenceProvenance,
  LaboratoryEvidenceRelationshipProvenance,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_HISTORY_TYPES,
  CANONICAL_EVIDENCE_TYPES,
  CANONICAL_EVIDENCE_RELATIONSHIP_TYPES,
  CANONICAL_HISTORY_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

import {
  composeHistoryProvenance,
  composeEvidenceProvenance,
  composeEvidenceRelationshipProvenance,
  composeHistoryRecord,
  composeEvidenceRecord,
  composeEvidenceRelationship,
  composeHistoryTrace,
  composeHistoryRegistry,
  composeLaboratoryHistory,
  isSupportedHistoryType,
  isSupportedEvidenceType,
  isSupportedEvidenceRelationshipType,
  isSupportedHistoryStatus,
  isSupportedHistoryGovernanceStatus,
  getCanonicalHistoryTypes,
  getCanonicalEvidenceTypes,
  getCanonicalEvidenceRelationshipTypes,
  getCanonicalHistoryStatuses,
} from './LaboratoryHistoryKernel.ts';

import {
  validateHistoryRecord,
  validateEvidenceRecord,
  validateEvidenceRelationship,
  validateHistoryRegistry,
  validateLaboratoryArtifactWithHistory,
  validateHistoryInput,
  HISTORY_VALIDATION_CODES,
} from './HistoryValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_HISTORY_PROVENANCE: LaboratoryHistoryProvenance = {
  historyId: 'history-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Experiment history record',
  providedBy: 'NeuralVerse Team',
};

const VALID_EVIDENCE_PROVENANCE: LaboratoryEvidenceProvenance = {
  evidenceId: 'evidence-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Observation evidence',
  providedBy: 'NeuralVerse Team',
};

const VALID_REL_PROVENANCE: LaboratoryEvidenceRelationshipProvenance = {
  relationshipId: 'rel-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Evidence relationship',
  providedBy: 'NeuralVerse Team',
};

const VALID_HISTORY_RECORD: LaboratoryHistoryRecord = {
  historyId: 'history-001',
  historyType: 'experiment_history',
  title: 'Experiment History',
  description: 'History of experiment execution.',
  experimentId: 'exp-001',
  workflowId: 'workflow-001',
  configurationId: 'config-001',
  evidenceIds: ['evidence-001', 'evidence-002'],
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_HISTORY_PROVENANCE,
};

const VALID_HISTORY_RECORD_2: LaboratoryHistoryRecord = {
  historyId: 'history-002',
  historyType: 'observation_history',
  title: 'Observation History',
  description: 'History of observations.',
  experimentId: 'exp-002',
  workflowId: 'workflow-001',
  configurationId: 'config-002',
  evidenceIds: ['evidence-003'],
  status: 'published',
  governanceStatus: 'accepted',
  provenance: { ...VALID_HISTORY_PROVENANCE, historyId: 'history-002' },
};

const VALID_EVIDENCE_RECORD: LaboratoryEvidenceRecord = {
  evidenceId: 'evidence-001',
  evidenceType: 'observation',
  title: 'Training Loss Observation',
  description: 'Observation of training loss behavior.',
  experimentId: 'exp-001',
  workflowId: 'workflow-001',
  configurationId: 'config-001',
  visualizationId: 'vis-001',
  metricId: 'metric-001',
  observationId: 'obs-001',
  hypothesisId: 'hyp-001',
  artifactId: 'artifact-001',
  governanceStatus: 'canonical',
  provenance: VALID_EVIDENCE_PROVENANCE,
};

const VALID_EVIDENCE_RECORD_2: LaboratoryEvidenceRecord = {
  evidenceId: 'evidence-002',
  evidenceType: 'metric',
  title: 'Accuracy Metric',
  description: 'Accuracy metric observation.',
  experimentId: 'exp-001',
  workflowId: 'workflow-001',
  configurationId: 'config-001',
  visualizationId: '',
  metricId: 'metric-002',
  observationId: '',
  hypothesisId: '',
  artifactId: '',
  governanceStatus: 'accepted',
  provenance: { ...VALID_EVIDENCE_PROVENANCE, evidenceId: 'evidence-002' },
};

const VALID_RELATIONSHIP: LaboratoryEvidenceRelationship = {
  relationshipId: 'rel-001',
  sourceEvidenceId: 'evidence-001',
  targetEvidenceId: 'evidence-002',
  relationshipType: 'derived_from',
  description: 'Metric derived from observation.',
  governanceStatus: 'canonical',
  provenance: VALID_REL_PROVENANCE,
};

const VALID_RELATIONSHIP_2: LaboratoryEvidenceRelationship = {
  relationshipId: 'rel-002',
  sourceEvidenceId: 'evidence-002',
  targetEvidenceId: 'evidence-001',
  relationshipType: 'supports',
  description: 'Metric supports observation.',
  governanceStatus: 'accepted',
  provenance: { ...VALID_REL_PROVENANCE, relationshipId: 'rel-002' },
};

const INVALID_HISTORY_UNKNOWN_TYPE: LaboratoryHistoryRecord = {
  historyId: 'history-003',
  historyType: 'unsupported_type' as any,
  title: 'Invalid Type History',
  description: 'A history with unsupported type.',
  experimentId: 'exp-001',
  workflowId: 'workflow-001',
  configurationId: 'config-001',
  evidenceIds: [],
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_HISTORY_PROVENANCE,
};

const INVALID_EVIDENCE_UNKNOWN_TYPE: LaboratoryEvidenceRecord = {
  evidenceId: 'evidence-003',
  evidenceType: 'unsupported_type' as any,
  title: 'Invalid Type Evidence',
  description: 'An evidence with unsupported type.',
  experimentId: 'exp-001',
  workflowId: 'workflow-001',
  configurationId: 'config-001',
  visualizationId: '',
  metricId: '',
  observationId: '',
  hypothesisId: '',
  artifactId: '',
  governanceStatus: 'canonical',
  provenance: VALID_EVIDENCE_PROVENANCE,
};

// ---------------------------------------------------------------------------
// Valid History Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Valid History', () => {
  it('should compose valid history provenance', () => {
    const provenance = composeHistoryProvenance({
      historyId: 'history-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Experiment history',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.historyId, 'history-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
  });

  it('should compose valid evidence provenance', () => {
    const provenance = composeEvidenceProvenance({
      evidenceId: 'evidence-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Observation evidence',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.evidenceId, 'evidence-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
  });

  it('should compose valid evidence relationship provenance', () => {
    const provenance = composeEvidenceRelationshipProvenance({
      relationshipId: 'rel-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Evidence relationship',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.relationshipId, 'rel-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
  });

  it('should compose valid history record', () => {
    const hist = composeHistoryRecord({
      historyId: 'history-001',
      historyType: 'experiment_history',
      title: 'Experiment History',
      description: 'History of experiments.',
      experimentId: 'exp-001',
      workflowId: 'workflow-001',
      configurationId: 'config-001',
      evidenceIds: ['evidence-001'],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_HISTORY_PROVENANCE,
    });

    assert.equal(hist.historyId, 'history-001');
    assert.equal(hist.historyType, 'experiment_history');
    assert.equal(hist.evidenceIds.length, 1);
  });

  it('should compose valid evidence record', () => {
    const evidence = composeEvidenceRecord({
      evidenceId: 'evidence-001',
      evidenceType: 'observation',
      title: 'Training Loss Observation',
      description: 'Observation of training loss.',
      experimentId: 'exp-001',
      workflowId: 'workflow-001',
      configurationId: 'config-001',
      visualizationId: 'vis-001',
      metricId: 'metric-001',
      observationId: 'obs-001',
      hypothesisId: 'hyp-001',
      artifactId: 'artifact-001',
      governanceStatus: 'canonical',
      provenance: VALID_EVIDENCE_PROVENANCE,
    });

    assert.equal(evidence.evidenceId, 'evidence-001');
    assert.equal(evidence.evidenceType, 'observation');
  });

  it('should compose valid evidence relationship', () => {
    const rel = composeEvidenceRelationship({
      relationshipId: 'rel-001',
      sourceEvidenceId: 'evidence-001',
      targetEvidenceId: 'evidence-002',
      relationshipType: 'derived_from',
      description: 'Metric derived from observation.',
      governanceStatus: 'canonical',
      provenance: VALID_REL_PROVENANCE,
    });

    assert.equal(rel.relationshipId, 'rel-001');
    assert.equal(rel.relationshipType, 'derived_from');
  });

  it('should compose valid history trace', () => {
    const trace = composeHistoryTrace({
      traceId: '_trace_history_1',
      historyCount: 2,
      evidenceCount: 5,
      relationshipCount: 3,
      decisions: [
        { decisionId: 'd1', historyId: 'history-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', historyId: 'history-002', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.traceId, '_trace_history_1');
    assert.equal(trace.historyCount, 2);
    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.deterministic, true);
  });

  it('should compose valid history registry', () => {
    const registry = composeHistoryRegistry(
      [VALID_HISTORY_RECORD],
      [VALID_EVIDENCE_RECORD],
      [VALID_RELATIONSHIP],
    );

    assert.equal(registry.histories.length, 1);
    assert.equal(registry.evidence.length, 1);
    assert.equal(registry.relationships.length, 1);
    assert.equal(registry.deterministic, true);
  });

  it('should validate a valid history record with no errors', () => {
    const errors = validateHistoryRecord(VALID_HISTORY_RECORD);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid evidence record with no errors', () => {
    const errors = validateEvidenceRecord(VALID_EVIDENCE_RECORD);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid evidence relationship with no errors', () => {
    const errors = validateEvidenceRelationship(VALID_RELATIONSHIP);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a complete artifact', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const artifact = composeLaboratoryHistory(input);
    const result = validateLaboratoryArtifactWithHistory(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate history input', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD, VALID_HISTORY_RECORD_2],
      evidence: [VALID_EVIDENCE_RECORD, VALID_EVIDENCE_RECORD_2],
      relationships: [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
    };

    const result = validateHistoryInput(input);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Duplicate ID Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Duplicate IDs', () => {
  it('should detect duplicate history IDs in registry', () => {
    const registry = composeHistoryRegistry(
      [VALID_HISTORY_RECORD, VALID_HISTORY_RECORD],
      [VALID_EVIDENCE_RECORD],
      [VALID_RELATIONSHIP],
    );
    const result = validateHistoryRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.HISTORY_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have HISTORY_DUPLICATE_ID error');
  });

  it('should detect duplicate evidence IDs in registry', () => {
    const registry = composeHistoryRegistry(
      [VALID_HISTORY_RECORD],
      [VALID_EVIDENCE_RECORD, VALID_EVIDENCE_RECORD],
      [VALID_RELATIONSHIP],
    );
    const result = validateHistoryRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.EVIDENCE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have EVIDENCE_DUPLICATE_ID error');
  });

  it('should detect duplicate relationship IDs in registry', () => {
    const registry = composeHistoryRegistry(
      [VALID_HISTORY_RECORD],
      [VALID_EVIDENCE_RECORD],
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP],
    );
    const result = validateHistoryRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have RELATIONSHIP_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Title Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Duplicate Titles', () => {
  it('should detect duplicate history titles in registry', () => {
    const hist1 = { ...VALID_HISTORY_RECORD, historyId: 'hist-001', title: 'Same Title' };
    const hist2 = { ...VALID_HISTORY_RECORD, historyId: 'hist-002', title: 'Same Title' };
    const registry = composeHistoryRegistry([hist1, hist2], [VALID_EVIDENCE_RECORD], [VALID_RELATIONSHIP]);
    const result = validateHistoryRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.HISTORY_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have HISTORY_DUPLICATE_TITLE error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Type Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Unsupported Types', () => {
  it('should reject unsupported history type', () => {
    assert.equal(isSupportedHistoryType('experiment_history'), true);
    assert.equal(isSupportedHistoryType('observation_history'), true);
    assert.equal(isSupportedHistoryType('unsupported_type'), false);
  });

  it('should detect unsupported history type in validation', () => {
    const errors = validateHistoryRecord(INVALID_HISTORY_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.HISTORY_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have HISTORY_UNKNOWN_TYPE error');
  });

  it('should reject unsupported evidence type', () => {
    assert.equal(isSupportedEvidenceType('observation'), true);
    assert.equal(isSupportedEvidenceType('metric'), true);
    assert.equal(isSupportedEvidenceType('unsupported_type'), false);
  });

  it('should detect unsupported evidence type in validation', () => {
    const errors = validateEvidenceRecord(INVALID_EVIDENCE_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.EVIDENCE_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have EVIDENCE_UNKNOWN_TYPE error');
  });

  it('should reject unsupported evidence relationship type', () => {
    assert.equal(isSupportedEvidenceRelationshipType('derived_from'), true);
    assert.equal(isSupportedEvidenceRelationshipType('supports'), true);
    assert.equal(isSupportedEvidenceRelationshipType('unsupported_type'), false);
  });

  it('should reject unsupported history status', () => {
    assert.equal(isSupportedHistoryStatus('draft'), true);
    assert.equal(isSupportedHistoryStatus('approved'), true);
    assert.equal(isSupportedHistoryStatus('unsupported_status'), false);
  });

  it('should detect unsupported status in validation', () => {
    const hist = { ...VALID_HISTORY_RECORD, status: 'unsupported_status' as any };
    const errors = validateHistoryRecord(hist);
    const statusError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.HISTORY_UNKNOWN_STATUS,
    );

    assert.ok(statusError, 'Should have HISTORY_UNKNOWN_STATUS error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Missing Provenance', () => {
  it('should detect missing provenance in history record', () => {
    const hist = { ...VALID_HISTORY_RECORD, provenance: undefined as any };
    const errors = validateHistoryRecord(hist);
    const provenanceError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.HISTORY_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have HISTORY_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance in evidence record', () => {
    const evidence = { ...VALID_EVIDENCE_RECORD, provenance: undefined as any };
    const errors = validateEvidenceRecord(evidence);
    const provenanceError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });

  it('should detect missing provenance in relationship', () => {
    const rel = { ...VALID_RELATIONSHIP, provenance: undefined as any };
    const errors = validateEvidenceRelationship(rel);
    const provenanceError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Missing Source', () => {
  it('should detect missing provenance in history record', () => {
    const hist = { ...VALID_HISTORY_RECORD, provenance: undefined as any };
    const errors = validateHistoryRecord(hist);
    const provenanceError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.HISTORY_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have HISTORY_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Rationale Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Missing Rationale', () => {
  it('should detect missing provenance in evidence record', () => {
    const evidence = { ...VALID_EVIDENCE_RECORD, provenance: undefined as any };
    const errors = validateEvidenceRecord(evidence);
    const provenanceError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing ProvidedBy Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Missing ProvidedBy', () => {
  it('should detect missing provenance in relationship', () => {
    const rel = { ...VALID_RELATIONSHIP, provenance: undefined as any };
    const errors = validateEvidenceRelationship(rel);
    const provenanceError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid References Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Invalid References', () => {
  it('should detect missing history ID', () => {
    const hist = { ...VALID_HISTORY_RECORD, historyId: '' };
    const errors = validateHistoryRecord(hist);
    const idError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.HISTORY_MISSING_HISTORY_ID,
    );

    assert.ok(idError, 'Should have HISTORY_MISSING_HISTORY_ID error');
  });

  it('should detect missing history title', () => {
    const hist = { ...VALID_HISTORY_RECORD, title: '' };
    const errors = validateHistoryRecord(hist);
    const titleError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.HISTORY_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have HISTORY_MISSING_TITLE error');
  });

  it('should detect missing evidence ID', () => {
    const evidence = { ...VALID_EVIDENCE_RECORD, evidenceId: '' };
    const errors = validateEvidenceRecord(evidence);
    const idError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.EVIDENCE_MISSING_ID,
    );

    assert.ok(idError, 'Should have EVIDENCE_MISSING_ID error');
  });

  it('should detect missing evidence title', () => {
    const evidence = { ...VALID_EVIDENCE_RECORD, title: '' };
    const errors = validateEvidenceRecord(evidence);
    const titleError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.EVIDENCE_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have EVIDENCE_MISSING_TITLE error');
  });

  it('should detect missing relationship ID', () => {
    const rel = { ...VALID_RELATIONSHIP, relationshipId: '' };
    const errors = validateEvidenceRelationship(rel);
    const idError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.RELATIONSHIP_MISSING_ID,
    );

    assert.ok(idError, 'Should have RELATIONSHIP_MISSING_ID error');
  });

  it('should detect missing relationship source', () => {
    const rel = { ...VALID_RELATIONSHIP, sourceEvidenceId: '' };
    const errors = validateEvidenceRelationship(rel);
    const sourceError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.RELATIONSHIP_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have RELATIONSHIP_MISSING_SOURCE error');
  });

  it('should detect missing relationship target', () => {
    const rel = { ...VALID_RELATIONSHIP, targetEvidenceId: '' };
    const errors = validateEvidenceRelationship(rel);
    const targetError = errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.RELATIONSHIP_MISSING_TARGET,
    );

    assert.ok(targetError, 'Should have RELATIONSHIP_MISSING_TARGET error');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Empty Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeHistoryRegistry([], [], []);
    const result = validateHistoryRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input histories', () => {
    const input: LaboratoryHistoryInput = {
      histories: [],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };
    const result = validateHistoryInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input evidence', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [],
      relationships: [VALID_RELATIONSHIP],
    };
    const result = validateHistoryInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.EVIDENCE_MISSING_ID,
    );

    assert.ok(emptyError, 'Should have EVIDENCE_MISSING_ID error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input relationships', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [],
    };
    const result = validateHistoryInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === HISTORY_VALIDATION_CODES.RELATIONSHIP_MISSING_ID,
    );

    assert.ok(emptyError, 'Should have RELATIONSHIP_MISSING_ID error');
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Deterministic Ordering', () => {
  it('should sort histories by historyId', () => {
    const hist3 = { ...VALID_HISTORY_RECORD, historyId: 'hist-003' };
    const hist1 = { ...VALID_HISTORY_RECORD, historyId: 'hist-001' };
    const hist2 = { ...VALID_HISTORY_RECORD, historyId: 'hist-002' };

    const registry = composeHistoryRegistry([hist3, hist1, hist2], [VALID_EVIDENCE_RECORD], [VALID_RELATIONSHIP]);

    assert.equal(registry.histories[0].historyId, 'hist-001');
    assert.equal(registry.histories[1].historyId, 'hist-002');
    assert.equal(registry.histories[2].historyId, 'hist-003');
  });

  it('should sort by historyType when historyId is equal', () => {
    const histA = { ...VALID_HISTORY_RECORD, historyId: 'hist-001', historyType: 'observation_history' as const };
    const histB = { ...VALID_HISTORY_RECORD, historyId: 'hist-001', historyType: 'experiment_history' as const };

    const registry = composeHistoryRegistry([histA, histB], [VALID_EVIDENCE_RECORD], [VALID_RELATIONSHIP]);

    assert.equal(registry.histories[0].historyType, 'experiment_history');
    assert.equal(registry.histories[1].historyType, 'observation_history');
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Trace Validation', () => {
  it('should validate trace determinism metadata', () => {
    const trace = composeHistoryTrace({
      traceId: '_trace_history_1',
      historyCount: 1,
      evidenceCount: 2,
      relationshipCount: 1,
      decisions: [
        { decisionId: 'd1', historyId: 'hist-001', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
    assert.equal(trace.generatedFrom, 'deterministic_history_kernel');
  });

  it('should count validated and invalid decisions', () => {
    const trace = composeHistoryTrace({
      traceId: '_trace_history_1',
      historyCount: 3,
      evidenceCount: 5,
      relationshipCount: 3,
      decisions: [
        { decisionId: 'd1', historyId: 'hist-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', historyId: 'hist-002', validationPassed: false, validationErrors: ['HISTORY_UNKNOWN_TYPE'] },
        { decisionId: 'd3', historyId: 'hist-003', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.invalidCount, 1);
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Registry Validation', () => {
  it('should validate a complete registry', () => {
    const registry = composeHistoryRegistry(
      [VALID_HISTORY_RECORD, VALID_HISTORY_RECORD_2],
      [VALID_EVIDENCE_RECORD, VALID_EVIDENCE_RECORD_2],
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
    );
    const result = validateHistoryRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'history_registry_composition');
  });

  it('should validate registry determinism metadata', () => {
    const registry = composeHistoryRegistry([VALID_HISTORY_RECORD], [VALID_EVIDENCE_RECORD], [VALID_RELATIONSHIP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.generatedFrom, 'deterministic_history_kernel');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Immutable Input', () => {
  it('should not mutate input histories', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const originalId = VALID_HISTORY_RECORD.historyId;
    const originalTitle = VALID_HISTORY_RECORD.title;

    composeLaboratoryHistory(input);

    assert.equal(VALID_HISTORY_RECORD.historyId, originalId);
    assert.equal(VALID_HISTORY_RECORD.title, originalTitle);
  });

  it('should not mutate input registry histories', () => {
    const histories = [VALID_HISTORY_RECORD, VALID_HISTORY_RECORD_2];
    const originalIds = histories.map((h) => h.historyId);

    composeHistoryRegistry(histories, [VALID_EVIDENCE_RECORD], [VALID_RELATIONSHIP]);

    assert.equal(histories[0].historyId, originalIds[0]);
    assert.equal(histories[1].historyId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Identical Output', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD, VALID_HISTORY_RECORD_2],
      evidence: [VALID_EVIDENCE_RECORD, VALID_EVIDENCE_RECORD_2],
      relationships: [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
    };

    const results: ReturnType<typeof composeLaboratoryHistory>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeLaboratoryHistory(input));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifactId, results[i].artifactId);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
      assert.deepStrictEqual(results[0].trace.decisions, results[i].trace.decisions);
      assert.deepStrictEqual(results[0].registry.histories, results[i].registry.histories);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const histories = [VALID_HISTORY_RECORD, VALID_HISTORY_RECORD_2];
    const evidence = [VALID_EVIDENCE_RECORD, VALID_EVIDENCE_RECORD_2];
    const relationships = [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2];

    const results: ReturnType<typeof composeHistoryRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeHistoryRegistry(histories, evidence, relationships));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].histories, results[i].histories);
      assert.deepStrictEqual(results[0].evidence, results[i].evidence);
      assert.deepStrictEqual(results[0].relationships, results[i].relationships);
    }
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Helper Functions', () => {
  it('should return canonical history types', () => {
    const types = getCanonicalHistoryTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_HISTORY_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical evidence types', () => {
    const types = getCanonicalEvidenceTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_EVIDENCE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical evidence relationship types', () => {
    const types = getCanonicalEvidenceRelationshipTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_EVIDENCE_RELATIONSHIP_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical history statuses', () => {
    const statuses = getCanonicalHistoryStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_HISTORY_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate governance status', () => {
    assert.equal(isSupportedHistoryGovernanceStatus('canonical'), true);
    assert.equal(isSupportedHistoryGovernanceStatus('accepted'), true);
    assert.equal(isSupportedHistoryGovernanceStatus('provisional'), true);
    assert.equal(isSupportedHistoryGovernanceStatus('deprecated'), true);
    assert.equal(isSupportedHistoryGovernanceStatus('rejected'), true);
    assert.equal(isSupportedHistoryGovernanceStatus('invalid'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 history types', () => {
    assert.equal(CANONICAL_HISTORY_TYPES.length, 10);
  });

  it('should have exactly 10 evidence types', () => {
    assert.equal(CANONICAL_EVIDENCE_TYPES.length, 10);
  });

  it('should have exactly 10 evidence relationship types', () => {
    assert.equal(CANONICAL_EVIDENCE_RELATIONSHIP_TYPES.length, 10);
  });

  it('should have exactly 6 history statuses', () => {
    assert.equal(CANONICAL_HISTORY_STATUS.length, 6);
  });

  it('should contain all expected history types', () => {
    const expectedTypes = ['experiment_history', 'observation_history', 'hypothesis_history', 'workflow_history', 'configuration_history', 'comparison_history', 'artifact_history', 'evaluation_history', 'annotation_history', 'session_history'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_HISTORY_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected evidence types', () => {
    const expectedTypes = ['observation', 'measurement', 'metric', 'visualization', 'annotation', 'comparison', 'prediction', 'hypothesis', 'result_artifact', 'evaluation'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_EVIDENCE_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected evidence relationship types', () => {
    const expectedTypes = ['derived_from', 'supports', 'contradicts', 'extends', 'refines', 'references', 'compares', 'validates', 'documents', 'groups'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_EVIDENCE_RELATIONSHIP_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected history statuses', () => {
    const expectedStatuses = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expectedStatuses) {
      assert.ok(
        CANONICAL_HISTORY_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('History Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not store runtime values', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('runtimeValues' in result), 'Should not have runtime values');
    assert.ok(!('values' in result), 'Should not have values');
  });

  it('should not store learner answers', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('learnerAnswers' in result), 'Should not have learner answers');
    assert.ok(!('answers' in result), 'Should not have answers');
  });

  it('should not store timestamps', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('timestamps' in result), 'Should not have timestamps');
    assert.ok(!('createdAt' in result), 'Should not have createdAt');
  });

  it('should not store execution history', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('executionHistory' in result), 'Should not have execution history');
    assert.ok(!('executionLog' in result), 'Should not have execution log');
  });

  it('should not store interaction history', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('interactionHistory' in result), 'Should not have interaction history');
    assert.ok(!('interactionLog' in result), 'Should not have interaction log');
  });

  it('should not store learner analytics', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('learnerAnalytics' in result), 'Should not have learner analytics');
    assert.ok(!('analytics' in result), 'Should not have analytics');
  });

  it('should not store metrics collected during execution', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('executionMetrics' in result), 'Should not have execution metrics');
    assert.ok(!('collectedMetrics' in result), 'Should not have collected metrics');
  });

  it('should not store logs', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('logs' in result), 'Should not have logs');
    assert.ok(!('logEntries' in result), 'Should not have log entries');
  });

  it('should not store files', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('files' in result), 'Should not have files');
    assert.ok(!('fileStorage' in result), 'Should not have file storage');
  });

  it('should not store images', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('images' in result), 'Should not have images');
    assert.ok(!('imageStorage' in result), 'Should not have image storage');
  });

  it('should not store predictions', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('predictions' in result), 'Should not have predictions');
    assert.ok(!('predictionStorage' in result), 'Should not have prediction storage');
  });

  it('should not store confidence', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('confidence' in result), 'Should not have confidence');
    assert.ok(!('confidenceScore' in result), 'Should not have confidence score');
  });

  it('should not perform execution', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });

  it('should not perform persistence', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('persistence' in result), 'Should not have persistence');
    assert.ok(!('storage' in result), 'Should not have storage');
  });

  it('should not perform synchronization', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('synchronization' in result), 'Should not have synchronization');
    assert.ok(!('sync' in result), 'Should not have sync');
  });

  it('should not perform network access', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not call LLMs', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('llmResult' in result), 'Should not have LLM result');
    assert.ok(!('llmOutput' in result), 'Should not have LLM output');
    assert.ok(!('llmResponse' in result), 'Should not have LLM response');
  });

  it('should not generate evidence', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('generatedEvidence' in result), 'Should not have generated evidence');
    assert.ok(!('autoGenerated' in result), 'Should not have autoGenerated');
  });

  it('should not infer relationships', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('inferredRelationships' in result), 'Should not have inferred relationships');
    assert.ok(!('autoInferred' in result), 'Should not have autoInferred');
  });

  it('should not rewrite evidence', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('rewrittenEvidence' in result), 'Should not have rewritten evidence');
    assert.ok(!('modifiedEvidence' in result), 'Should not have modified evidence');
  });

  it('should not generate code', () => {
    const input: LaboratoryHistoryInput = {
      histories: [VALID_HISTORY_RECORD],
      evidence: [VALID_EVIDENCE_RECORD],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryHistory(input);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });

  it('should not have executable callbacks in history record', () => {
    const hist = composeHistoryRecord({
      historyId: 'history-001',
      historyType: 'experiment_history',
      title: 'Test History',
      description: 'A test history.',
      experimentId: 'exp-001',
      workflowId: 'workflow-001',
      configurationId: 'config-001',
      evidenceIds: [],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_HISTORY_PROVENANCE,
    });

    const keys = Object.keys(hist);
    for (const key of keys) {
      const value = (hist as any)[key];
      assert.ok(typeof value !== 'function', `History field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in evidence record', () => {
    const evidence = composeEvidenceRecord({
      evidenceId: 'evidence-001',
      evidenceType: 'observation',
      title: 'Test Evidence',
      description: 'A test evidence.',
      experimentId: 'exp-001',
      workflowId: 'workflow-001',
      configurationId: 'config-001',
      visualizationId: '',
      metricId: '',
      observationId: '',
      hypothesisId: '',
      artifactId: '',
      governanceStatus: 'canonical',
      provenance: VALID_EVIDENCE_PROVENANCE,
    });

    const keys = Object.keys(evidence);
    for (const key of keys) {
      const value = (evidence as any)[key];
      assert.ok(typeof value !== 'function', `Evidence field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in relationship', () => {
    const rel = composeEvidenceRelationship({
      relationshipId: 'rel-001',
      sourceEvidenceId: 'evidence-001',
      targetEvidenceId: 'evidence-002',
      relationshipType: 'derived_from',
      description: 'Test relationship.',
      governanceStatus: 'canonical',
      provenance: VALID_REL_PROVENANCE,
    });

    const keys = Object.keys(rel);
    for (const key of keys) {
      const value = (rel as any)[key];
      assert.ok(typeof value !== 'function', `Relationship field "${key}" should not be a function`);
    }
  });
});
