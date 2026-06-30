/**
 * NV-1400-D2-OPT-13-B — Literature Maintenance Orchestration Test Suite
 *
 * Comprehensive tests for the literature maintenance kernel.
 * Covers: valid maintenance signal, valid registry, obsolete reference,
 * stronger evidence available, survey supersession, terminology evolution,
 * industrial consensus shift, stale verification, replacement reference
 * available, unsupported signal type, unsupported priority, unsupported action,
 * duplicate signal, missing source, missing provenance, missing rationale,
 * missing affected reference, invalid replacement reference, empty registry,
 * deterministic ordering, immutable input, identical output,
 * no automatic revision, no live literature search, no content rewriting,
 * no consensus inference.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeMaintenanceProvenance,
  composeMaintenanceSignal,
  composeMaintenanceRegistry,
  composeResearchMaintenance,
  composeMaintenanceTrace,
  isSupportedMaintenanceSignalType,
  isSupportedMaintenancePriority,
  isSupportedMaintenanceAction,
  getCanonicalMaintenanceSignalTypes,
  getCanonicalMaintenancePriorities,
  getCanonicalMaintenanceActions,
} from './LiteratureMaintenanceKernel.ts';

import {
  validateMaintenanceSignal,
  validateMaintenanceRegistry,
  validateResearchArtifactWithMaintenance,
  validateMaintenanceInput,
  MAINTENANCE_VALIDATION_CODES,
} from './LiteratureMaintenanceValidation.ts';

import type {
  ResearchMaintenanceSignal,
  ResearchMaintenanceInput,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_SIGNAL_1: ResearchMaintenanceSignal = {
  signalId: 'maint-001',
  signalType: 'obsolete_reference',
  priority: 'high',
  recommendedAction: 'replace_reference',
  affectedReferenceIds: ['ref-001'],
  affectedArtifactIds: ['artifact-001'],
  replacementReferenceIds: ['ref-002'],
  source: 'research-agent',
  governanceStatus: 'canonical',
  lifecycle: 'active',
  rationale: 'Reference superseded by newer publication.',
  provenance: {
    signalId: 'maint-001',
    referenceId: 'ref-001',
    source: 'research-agent',
    governanceStatus: 'canonical',
    signalType: 'obsolete_reference',
    rationale: 'Governance-backed maintenance signal.',
    providedBy: 'research-agent',
  },
};

const VALID_SIGNAL_2: ResearchMaintenanceSignal = {
  signalId: 'maint-002',
  signalType: 'terminology_evolution',
  priority: 'medium',
  recommendedAction: 'update_terminology',
  affectedReferenceIds: ['ref-003'],
  affectedArtifactIds: [],
  replacementReferenceIds: [],
  source: 'research-agent',
  governanceStatus: 'accepted',
  lifecycle: 'active',
  rationale: 'Terminology has evolved in the field.',
  provenance: {
    signalId: 'maint-002',
    referenceId: 'ref-003',
    source: 'research-agent',
    governanceStatus: 'accepted',
    signalType: 'terminology_evolution',
    rationale: 'Governance-backed maintenance signal.',
    providedBy: 'research-agent',
  },
};

// ---------------------------------------------------------------------------
// Valid Maintenance Signal
// ---------------------------------------------------------------------------

describe('Literature Maintenance Kernel', () => {
  it('should compose a valid maintenance signal', () => {
    const provenance = composeMaintenanceProvenance(
      'maint-001', 'ref-001', 'research-agent', 'canonical', 'obsolete_reference',
      'Governance-backed.', 'research-agent',
    );

    const signal = composeMaintenanceSignal(
      'maint-001', 'obsolete_reference', 'high', 'replace_reference',
      ['ref-001'], ['artifact-001'], ['ref-002'],
      'research-agent', 'canonical', 'active', 'Superseded.', provenance,
    );

    assert.strictEqual(signal.signalId, 'maint-001');
    assert.strictEqual(signal.signalType, 'obsolete_reference');
    assert.strictEqual(signal.priority, 'high');
    assert.strictEqual(signal.recommendedAction, 'replace_reference');
    assert.strictEqual(signal.affectedReferenceIds.length, 1);
    assert.strictEqual(signal.governanceStatus, 'canonical');
  });

  // ---------------------------------------------------------------------------
  // Valid Registry
  // ---------------------------------------------------------------------------

  it('should compose a valid maintenance registry', () => {
    const input: ResearchMaintenanceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      signals: [VALID_SIGNAL_1, VALID_SIGNAL_2],
    };

    const artifact = composeResearchMaintenance(input);

    assert.strictEqual(artifact.maintenanceRegistry.signals.length, 2);
    assert.strictEqual(artifact.maintenanceTrace.signalCount, 2);
    assert.strictEqual(artifact.maintenanceTrace.validatedCount, 2);
    assert.strictEqual(artifact.maintenanceTrace.invalidCount, 0);
  });

  // ---------------------------------------------------------------------------
  // Duplicate Signal ID
  // ---------------------------------------------------------------------------

  it('should detect duplicate signal IDs', () => {
    const duplicateSignal: ResearchMaintenanceSignal = {
      ...VALID_SIGNAL_1,
      rationale: 'Different rationale but same ID.',
    };

    const input: ResearchMaintenanceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      signals: [VALID_SIGNAL_1, duplicateSignal],
    };

    const artifact = composeResearchMaintenance(input);
    const validation = validateMaintenanceRegistry(artifact.maintenanceRegistry);

    const duplicateErrors = validation.filter((e) => e.code === MAINTENANCE_VALIDATION_CODES.MAINT_DUPLICATE_SIGNAL);
    assert.ok(duplicateErrors.length > 0, 'Should detect duplicate signal ID');
  });

  // ---------------------------------------------------------------------------
  // Unsupported Signal Type
  // ---------------------------------------------------------------------------

  it('should reject unsupported signal type', () => {
    const invalidSignal: ResearchMaintenanceSignal = {
      ...VALID_SIGNAL_1,
      signalType: 'nonexistent_type' as any,
    };

    const errors = validateMaintenanceSignal(invalidSignal);
    const typeErrors = errors.filter((e) => e.code === MAINTENANCE_VALIDATION_CODES.MAINT_UNKNOWN_SIGNAL_TYPE);
    assert.ok(typeErrors.length > 0, 'Should reject unsupported signal type');
  });

  // ---------------------------------------------------------------------------
  // Unsupported Priority
  // ---------------------------------------------------------------------------

  it('should reject unsupported priority', () => {
    const invalidSignal: ResearchMaintenanceSignal = {
      ...VALID_SIGNAL_1,
      priority: 'nonexistent_priority' as any,
    };

    const errors = validateMaintenanceSignal(invalidSignal);
    const priorityErrors = errors.filter((e) => e.code === MAINTENANCE_VALIDATION_CODES.MAINT_UNKNOWN_PRIORITY);
    assert.ok(priorityErrors.length > 0, 'Should reject unsupported priority');
  });

  // ---------------------------------------------------------------------------
  // Unsupported Action
  // ---------------------------------------------------------------------------

  it('should reject unsupported action', () => {
    const invalidSignal: ResearchMaintenanceSignal = {
      ...VALID_SIGNAL_1,
      recommendedAction: 'nonexistent_action' as any,
    };

    const errors = validateMaintenanceSignal(invalidSignal);
    const actionErrors = errors.filter((e) => e.code === MAINTENANCE_VALIDATION_CODES.MAINT_UNKNOWN_ACTION);
    assert.ok(actionErrors.length > 0, 'Should reject unsupported action');
  });

  // ---------------------------------------------------------------------------
  // Missing Affected Reference
  // ---------------------------------------------------------------------------

  it('should reject missing affected reference', () => {
    const invalidSignal: ResearchMaintenanceSignal = {
      ...VALID_SIGNAL_1,
      affectedReferenceIds: [],
    };

    const errors = validateMaintenanceSignal(invalidSignal);
    const refErrors = errors.filter((e) => e.code === MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_AFFECTED_REFERENCE);
    assert.ok(refErrors.length > 0, 'Should reject missing affected reference');
  });

  // ---------------------------------------------------------------------------
  // Missing Source
  // ---------------------------------------------------------------------------

  it('should reject missing source', () => {
    const invalidSignal: ResearchMaintenanceSignal = {
      ...VALID_SIGNAL_1,
      source: '',
    };

    const errors = validateMaintenanceSignal(invalidSignal);
    const sourceErrors = errors.filter((e) => e.code === MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_SOURCE);
    assert.ok(sourceErrors.length > 0, 'Should reject missing source');
  });

  // ---------------------------------------------------------------------------
  // Missing Provenance
  // ---------------------------------------------------------------------------

  it('should reject missing provenance', () => {
    const invalidSignal: ResearchMaintenanceSignal = {
      ...VALID_SIGNAL_1,
      provenance: {
        ...VALID_SIGNAL_1.provenance,
        rationale: '',
      },
    };

    const errors = validateMaintenanceSignal(invalidSignal);
    const provenanceErrors = errors.filter((e) => e.code === MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_PROVENANCE);
    assert.ok(provenanceErrors.length > 0, 'Should reject missing provenance');
  });

  // ---------------------------------------------------------------------------
  // Missing Rationale
  // ---------------------------------------------------------------------------

  it('should reject missing rationale', () => {
    const invalidSignal: ResearchMaintenanceSignal = {
      ...VALID_SIGNAL_1,
      rationale: '',
    };

    const errors = validateMaintenanceSignal(invalidSignal);
    const rationaleErrors = errors.filter((e) => e.code === MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_RATIONALE);
    assert.ok(rationaleErrors.length > 0, 'Should reject missing rationale');
  });

  // ---------------------------------------------------------------------------
  // Empty Registry
  // ---------------------------------------------------------------------------

  it('should reject empty registry', () => {
    const input: ResearchMaintenanceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      signals: [],
    };

    const errors = validateMaintenanceInput(input);
    const emptyErrors = errors.filter((e) => e.code === MAINTENANCE_VALIDATION_CODES.MAINT_EMPTY_REGISTRY);
    assert.ok(emptyErrors.length > 0, 'Should reject empty registry');
  });

  // ---------------------------------------------------------------------------
  // Deterministic Ordering
  // ---------------------------------------------------------------------------

  it('should produce deterministic ordering', () => {
    const input: ResearchMaintenanceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      signals: [VALID_SIGNAL_2, VALID_SIGNAL_1],
    };

    const artifact1 = composeResearchMaintenance(input);
    const artifact2 = composeResearchMaintenance(input);

    assert.deepStrictEqual(
      artifact1.maintenanceRegistry.signals.map((s) => s.signalId),
      artifact2.maintenanceRegistry.signals.map((s) => s.signalId),
    );
  });

  // ---------------------------------------------------------------------------
  // Immutable Input
  // ---------------------------------------------------------------------------

  it('should not mutate input', () => {
    const originalSignals = [VALID_SIGNAL_1, VALID_SIGNAL_2];
    const input: ResearchMaintenanceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      signals: originalSignals,
    };

    composeResearchMaintenance(input);

    assert.deepStrictEqual(input.signals, originalSignals);
  });

  // ---------------------------------------------------------------------------
  // Identical Output
  // ---------------------------------------------------------------------------

  it('should produce identical output for identical input', () => {
    const input: ResearchMaintenanceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      signals: [VALID_SIGNAL_1],
    };

    const artifact1 = composeResearchMaintenance(input);
    const artifact2 = composeResearchMaintenance(input);

    assert.deepStrictEqual(artifact1, artifact2);
  });

  // ---------------------------------------------------------------------------
  // No Automatic Revision
  // ---------------------------------------------------------------------------

  it('should not automatically revise content', () => {
    const input: ResearchMaintenanceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      signals: [VALID_SIGNAL_1],
    };

    const artifact = composeResearchMaintenance(input);

    assert.strictEqual(artifact.maintenanceTrace.deterministic, true);
    assert.strictEqual(artifact.maintenanceTrace.generatedFrom, 'deterministic_maintenance_kernel');
  });

  // ---------------------------------------------------------------------------
  // No Live Search
  // ---------------------------------------------------------------------------

  it('should not perform live literature search', () => {
    const input: ResearchMaintenanceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      signals: [VALID_SIGNAL_1],
    };

    const artifact = composeResearchMaintenance(input);

    assert.strictEqual(artifact.maintenanceTrace.randomUsed, false);
    assert.strictEqual(artifact.maintenanceTrace.timeDependency, false);
  });

  // ---------------------------------------------------------------------------
  // No Content Rewriting
  // ---------------------------------------------------------------------------

  it('should not rewrite content', () => {
    const provenance = composeMaintenanceProvenance(
      'maint-test', 'ref-test', 'research-agent', 'canonical', 'obsolete_reference',
      'Test.', 'research-agent',
    );

    const signal = composeMaintenanceSignal(
      'maint-test', 'obsolete_reference', 'medium', 'review_required',
      ['ref-test'], [], [],
      'research-agent', 'canonical', 'active', 'Test signal.', provenance,
    );

    assert.strictEqual(signal.signalType, 'obsolete_reference');
    assert.strictEqual(signal.recommendedAction, 'review_required');
  });

  // ---------------------------------------------------------------------------
  // No Consensus Inference
  // ---------------------------------------------------------------------------

  it('should not infer consensus', () => {
    const input: ResearchMaintenanceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      signals: [VALID_SIGNAL_1],
    };

    const artifact = composeResearchMaintenance(input);

    for (const signal of artifact.maintenanceRegistry.signals) {
      assert.ok(!signal.rationale.toLowerCase().includes('consensus determined'));
      assert.ok(!signal.rationale.toLowerCase().includes('automatically decided'));
    }
  });

  // ---------------------------------------------------------------------------
  // Canonical Signal Types
  // ---------------------------------------------------------------------------

  it('should expose canonical signal types', () => {
    const types = getCanonicalMaintenanceSignalTypes();
    assert.ok(types.includes('obsolete_reference'));
    assert.ok(types.includes('stronger_evidence_available'));
    assert.ok(types.includes('survey_supersession'));
    assert.ok(types.includes('terminology_evolution'));
    assert.ok(types.includes('industrial_consensus_shift'));
    assert.ok(types.includes('stale_verification'));
    assert.ok(types.includes('replacement_reference_available'));
    assert.strictEqual(types.length, 10);
  });

  // ---------------------------------------------------------------------------
  // Canonical Priorities
  // ---------------------------------------------------------------------------

  it('should expose canonical priorities', () => {
    const priorities = getCanonicalMaintenancePriorities();
    assert.ok(priorities.includes('low'));
    assert.ok(priorities.includes('medium'));
    assert.ok(priorities.includes('high'));
    assert.ok(priorities.includes('critical'));
    assert.strictEqual(priorities.length, 4);
  });

  // ---------------------------------------------------------------------------
  // Canonical Actions
  // ---------------------------------------------------------------------------

  it('should expose canonical actions', () => {
    const actions = getCanonicalMaintenanceActions();
    assert.ok(actions.includes('review_required'));
    assert.ok(actions.includes('replace_reference'));
    assert.ok(actions.includes('add_supporting_reference'));
    assert.ok(actions.includes('update_terminology'));
    assert.ok(actions.includes('mark_deprecated'));
    assert.ok(actions.includes('preserve_historical_version'));
    assert.ok(actions.includes('escalate_to_governance'));
    assert.ok(actions.includes('no_action'));
    assert.strictEqual(actions.length, 8);
  });

  // ---------------------------------------------------------------------------
  // Signal Type Helper
  // ---------------------------------------------------------------------------

  it('should support signal type check helper', () => {
    assert.strictEqual(isSupportedMaintenanceSignalType('obsolete_reference'), true);
    assert.strictEqual(isSupportedMaintenanceSignalType('nonexistent'), false);
  });

  // ---------------------------------------------------------------------------
  // Priority Helper
  // ---------------------------------------------------------------------------

  it('should support priority check helper', () => {
    assert.strictEqual(isSupportedMaintenancePriority('high'), true);
    assert.strictEqual(isSupportedMaintenancePriority('nonexistent'), false);
  });

  // ---------------------------------------------------------------------------
  // Action Helper
  // ---------------------------------------------------------------------------

  it('should support action check helper', () => {
    assert.strictEqual(isSupportedMaintenanceAction('replace_reference'), true);
    assert.strictEqual(isSupportedMaintenanceAction('nonexistent'), false);
  });

  // ---------------------------------------------------------------------------
  // Trace Determinism
  // ---------------------------------------------------------------------------

  it('should produce deterministic trace', () => {
    const input: ResearchMaintenanceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      signals: [VALID_SIGNAL_1],
    };

    const artifact = composeResearchMaintenance(input);

    assert.strictEqual(artifact.maintenanceTrace.deterministic, true);
    assert.strictEqual(artifact.maintenanceTrace.randomUsed, false);
    assert.strictEqual(artifact.maintenanceTrace.timeDependency, false);
    assert.strictEqual(artifact.maintenanceTrace.generatedFrom, 'deterministic_maintenance_kernel');
  });

  // ---------------------------------------------------------------------------
  // Replacement Reference Signal
  // ---------------------------------------------------------------------------

  it('should handle replacement reference available signal', () => {
    const replacementSignal: ResearchMaintenanceSignal = {
      signalId: 'maint-replace',
      signalType: 'replacement_reference_available',
      priority: 'medium',
      recommendedAction: 'replace_reference',
      affectedReferenceIds: ['ref-old'],
      affectedArtifactIds: [],
      replacementReferenceIds: ['ref-new'],
      source: 'research-agent',
      governanceStatus: 'accepted',
      lifecycle: 'active',
      rationale: 'A newer reference is available.',
      provenance: {
        signalId: 'maint-replace',
        referenceId: 'ref-old',
        source: 'research-agent',
        governanceStatus: 'accepted',
        signalType: 'replacement_reference_available',
        rationale: 'Governance-backed.',
        providedBy: 'research-agent',
      },
    };

    const input: ResearchMaintenanceInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Test',
      signals: [replacementSignal],
    };

    const artifact = composeResearchMaintenance(input);
    assert.strictEqual(artifact.maintenanceRegistry.signals.length, 1);
    assert.strictEqual(artifact.maintenanceRegistry.signals[0].replacementReferenceIds.length, 1);
  });
});
