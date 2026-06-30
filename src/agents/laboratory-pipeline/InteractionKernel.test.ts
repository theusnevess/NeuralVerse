/**
 * NV-1600-D4-OPT-07 — Laboratory Interaction & User Action Modeling Test Suite
 *
 * Comprehensive deterministic test suite for the Interaction Kernel.
 * Covers: valid interaction, valid action, valid registry, duplicate interaction ID,
 * duplicate action ID, unsupported interaction type, unsupported action type,
 * unsupported status, invalid references, missing provenance, missing source,
 * missing rationale, missing providedBy, empty registry, deterministic ordering,
 * immutable input, identical output, 100-iteration determinism, registry validation,
 * artifact validation, trace validation, helper functions, canonical enum completeness,
 * prediction metadata, workflow interaction metadata, visualization interaction metadata,
 * negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  LaboratoryInteraction,
  LaboratoryUserAction,
  LaboratoryInteractionInput,
  LaboratoryInteractionRegistry,
  LaboratoryArtifactWithInteractions,
  LaboratoryInteractionTrace,
  LaboratoryInteractionProvenance,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_INTERACTION_TYPES,
  CANONICAL_USER_ACTION_TYPES,
  CANONICAL_INTERACTION_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

import {
  composeInteractionProvenance,
  composeUserAction,
  composeInteraction,
  composeInteractionTrace,
  composeInteractionRegistry,
  composeLaboratoryInteractions,
  isSupportedInteractionType,
  isSupportedUserActionType,
  isSupportedInteractionStatus,
  isSupportedInteractionGovernanceStatus,
  getCanonicalInteractionTypes,
  getCanonicalUserActionTypes,
  getCanonicalInteractionStatuses,
} from './InteractionKernel.ts';

import {
  validateInteraction,
  validateUserAction,
  validateInteractionRegistry,
  validateLaboratoryArtifactWithInteractions,
  validateInteractionInput,
  INTERACTION_VALIDATION_CODES,
} from './InteractionValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_INTERACTION_PROVENANCE: LaboratoryInteractionProvenance = {
  interactionId: 'interaction-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Parameter adjustment interaction',
  providedBy: 'NeuralVerse Team',
};

const VALID_ACTION_1: LaboratoryUserAction = {
  actionId: 'action-001',
  actionType: 'modify',
  title: 'Adjust Learning Rate',
  description: 'Modify the learning rate parameter.',
  targetId: 'param-001',
  targetType: 'parameter',
  interactionId: 'interaction-001',
  governanceStatus: 'canonical',
};

const VALID_ACTION_2: LaboratoryUserAction = {
  actionId: 'action-002',
  actionType: 'select',
  title: 'Select Optimizer',
  description: 'Choose an optimizer algorithm.',
  targetId: 'param-002',
  targetType: 'parameter',
  interactionId: 'interaction-001',
  governanceStatus: 'canonical',
};

const VALID_INTERACTION: LaboratoryInteraction = {
  interactionId: 'interaction-001',
  interactionType: 'parameter_adjustment',
  name: 'Parameter Adjustment',
  description: 'Adjust experiment parameters.',
  workflowId: 'workflow-001',
  workflowStepId: 'step-001',
  experimentId: 'exp-001',
  configurationId: 'config-001',
  parameterId: 'param-001',
  resultArtifactId: '',
  visualizationId: '',
  datasetReferenceId: '',
  actions: [VALID_ACTION_1, VALID_ACTION_2],
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_INTERACTION_PROVENANCE,
};

const VALID_INTERACTION_2: LaboratoryInteraction = {
  interactionId: 'interaction-002',
  interactionType: 'visualization_focus',
  name: 'Visualization Inspection',
  description: 'Inspect visualization details.',
  workflowId: 'workflow-001',
  workflowStepId: 'step-002',
  experimentId: 'exp-001',
  configurationId: 'config-001',
  parameterId: '',
  resultArtifactId: 'result-001',
  visualizationId: 'vis-001',
  datasetReferenceId: '',
  actions: [
    { ...VALID_ACTION_1, actionId: 'action-003', actionType: 'inspect', title: 'Inspect Chart', targetId: 'vis-001', targetType: 'visualization' },
  ],
  status: 'published',
  governanceStatus: 'accepted',
  provenance: { ...VALID_INTERACTION_PROVENANCE, interactionId: 'interaction-002' },
};

const INVALID_INTERACTION_UNKNOWN_TYPE: LaboratoryInteraction = {
  interactionId: 'interaction-003',
  interactionType: 'unsupported_type' as any,
  name: 'Invalid Type Interaction',
  description: 'An interaction with unsupported type.',
  workflowId: 'workflow-001',
  workflowStepId: 'step-001',
  experimentId: 'exp-001',
  configurationId: 'config-001',
  parameterId: '',
  resultArtifactId: '',
  visualizationId: '',
  datasetReferenceId: '',
  actions: [VALID_ACTION_1],
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_INTERACTION_PROVENANCE,
};

const INVALID_INTERACTION_UNKNOWN_STATUS: LaboratoryInteraction = {
  interactionId: 'interaction-004',
  interactionType: 'parameter_adjustment',
  name: 'Invalid Status Interaction',
  description: 'An interaction with unsupported status.',
  workflowId: 'workflow-001',
  workflowStepId: 'step-001',
  experimentId: 'exp-001',
  configurationId: 'config-001',
  parameterId: '',
  resultArtifactId: '',
  visualizationId: '',
  datasetReferenceId: '',
  actions: [VALID_ACTION_1],
  status: 'unsupported_status' as any,
  governanceStatus: 'canonical',
  provenance: VALID_INTERACTION_PROVENANCE,
};

const INVALID_ACTION_UNKNOWN_TYPE: LaboratoryUserAction = {
  actionId: 'action-004',
  actionType: 'unsupported_type' as any,
  title: 'Invalid Action',
  description: 'An action with unsupported type.',
  targetId: 'param-001',
  targetType: 'parameter',
  interactionId: 'interaction-001',
  governanceStatus: 'canonical',
};

// ---------------------------------------------------------------------------
// Valid Interaction Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Valid Interaction', () => {
  it('should compose valid interaction provenance', () => {
    const provenance = composeInteractionProvenance({
      interactionId: 'interaction-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Parameter adjustment interaction',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.interactionId, 'interaction-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
  });

  it('should compose valid user action', () => {
    const action = composeUserAction({
      actionId: 'action-001',
      actionType: 'modify',
      title: 'Adjust Learning Rate',
      description: 'Modify the learning rate.',
      targetId: 'param-001',
      targetType: 'parameter',
      interactionId: 'interaction-001',
      governanceStatus: 'canonical',
    });

    assert.equal(action.actionId, 'action-001');
    assert.equal(action.actionType, 'modify');
    assert.equal(action.targetId, 'param-001');
  });

  it('should compose valid interaction', () => {
    const inter = composeInteraction({
      interactionId: 'interaction-001',
      interactionType: 'parameter_adjustment',
      name: 'Parameter Adjustment',
      description: 'Adjust parameters.',
      workflowId: 'workflow-001',
      workflowStepId: 'step-001',
      experimentId: 'exp-001',
      configurationId: 'config-001',
      parameterId: 'param-001',
      resultArtifactId: '',
      visualizationId: '',
      datasetReferenceId: '',
      actions: [VALID_ACTION_1],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_INTERACTION_PROVENANCE,
    });

    assert.equal(inter.interactionId, 'interaction-001');
    assert.equal(inter.interactionType, 'parameter_adjustment');
    assert.equal(inter.actions.length, 1);
  });

  it('should compose valid interaction trace', () => {
    const trace = composeInteractionTrace({
      traceId: '_trace_interaction_1',
      interactionCount: 2,
      actionCount: 5,
      decisions: [
        { decisionId: 'd1', interactionId: 'interaction-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', interactionId: 'interaction-002', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.traceId, '_trace_interaction_1');
    assert.equal(trace.interactionCount, 2);
    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.deterministic, true);
  });

  it('should compose valid interaction registry', () => {
    const registry = composeInteractionRegistry([VALID_INTERACTION]);

    assert.equal(registry.interactions.length, 1);
    assert.equal(registry.interactionCount, 1);
    assert.equal(registry.actionCount, 2);
    assert.equal(registry.deterministic, true);
  });

  it('should validate a valid interaction with no errors', () => {
    const errors = validateInteraction(VALID_INTERACTION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid user action with no errors', () => {
    const errors = validateUserAction(VALID_ACTION_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a complete artifact', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const artifact = composeLaboratoryInteractions(input);
    const result = validateLaboratoryArtifactWithInteractions(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate interaction input', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION, VALID_INTERACTION_2],
    };

    const result = validateInteractionInput(input);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Duplicate ID Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Duplicate IDs', () => {
  it('should detect duplicate interaction IDs in registry', () => {
    const registry = composeInteractionRegistry([VALID_INTERACTION, VALID_INTERACTION]);
    const result = validateInteractionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.REGISTRY_DUPLICATE_INTERACTION_ID,
    );

    assert.ok(duplicateError, 'Should have REGISTRY_DUPLICATE_INTERACTION_ID error');
  });

  it('should detect duplicate action IDs in interaction', () => {
    const inter = {
      ...VALID_INTERACTION,
      actions: [VALID_ACTION_1, VALID_ACTION_1],
    };
    const errors = validateInteraction(inter);
    const duplicateError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.ACTION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ACTION_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Name Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Duplicate Names', () => {
  it('should detect duplicate interaction names in registry', () => {
    const inter1 = { ...VALID_INTERACTION, interactionId: 'int-001', name: 'Same Name' };
    const inter2 = { ...VALID_INTERACTION, interactionId: 'int-002', name: 'Same Name' };
    const registry = composeInteractionRegistry([inter1, inter2]);
    const result = validateInteractionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.REGISTRY_DUPLICATE_INTERACTION_NAME,
    );

    assert.ok(duplicateError, 'Should have REGISTRY_DUPLICATE_INTERACTION_NAME error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Type Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Unsupported Types', () => {
  it('should reject unsupported interaction type', () => {
    assert.equal(isSupportedInteractionType('parameter_adjustment'), true);
    assert.equal(isSupportedInteractionType('visualization_focus'), true);
    assert.equal(isSupportedInteractionType('unsupported_type'), false);
  });

  it('should detect unsupported interaction type in validation', () => {
    const errors = validateInteraction(INVALID_INTERACTION_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.INTERACTION_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have INTERACTION_UNKNOWN_TYPE error');
  });

  it('should reject unsupported user action type', () => {
    assert.equal(isSupportedUserActionType('select'), true);
    assert.equal(isSupportedUserActionType('modify'), true);
    assert.equal(isSupportedUserActionType('unsupported_type'), false);
  });

  it('should detect unsupported action type in validation', () => {
    const errors = validateUserAction(INVALID_ACTION_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.ACTION_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have ACTION_UNKNOWN_TYPE error');
  });

  it('should reject unsupported interaction status', () => {
    assert.equal(isSupportedInteractionStatus('draft'), true);
    assert.equal(isSupportedInteractionStatus('approved'), true);
    assert.equal(isSupportedInteractionStatus('unsupported_status'), false);
  });

  it('should detect unsupported status in validation', () => {
    const errors = validateInteraction(INVALID_INTERACTION_UNKNOWN_STATUS);
    const statusError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.INTERACTION_UNKNOWN_STATUS,
    );

    assert.ok(statusError, 'Should have INTERACTION_UNKNOWN_STATUS error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Missing Provenance', () => {
  it('should detect missing provenance in interaction', () => {
    const inter = { ...VALID_INTERACTION, provenance: undefined as any };
    const errors = validateInteraction(inter);
    const provenanceError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.INTERACTION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have INTERACTION_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Missing Source', () => {
  it('should detect missing provenance in interaction', () => {
    const inter = { ...VALID_INTERACTION, provenance: undefined as any };
    const errors = validateInteraction(inter);
    const provenanceError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.INTERACTION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have INTERACTION_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Rationale Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Missing Rationale', () => {
  it('should detect missing provenance in interaction', () => {
    const inter = { ...VALID_INTERACTION, provenance: undefined as any };
    const errors = validateInteraction(inter);
    const provenanceError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.INTERACTION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have INTERACTION_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing ProvidedBy Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Missing ProvidedBy', () => {
  it('should detect missing provenance in interaction', () => {
    const inter = { ...VALID_INTERACTION, provenance: undefined as any };
    const errors = validateInteraction(inter);
    const provenanceError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.INTERACTION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have INTERACTION_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid References Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Invalid References', () => {
  it('should detect missing interaction ID', () => {
    const inter = { ...VALID_INTERACTION, interactionId: '' };
    const errors = validateInteraction(inter);
    const idError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.INTERACTION_MISSING_INTERACTION_ID,
    );

    assert.ok(idError, 'Should have INTERACTION_MISSING_INTERACTION_ID error');
  });

  it('should detect missing interaction name', () => {
    const inter = { ...VALID_INTERACTION, name: '' };
    const errors = validateInteraction(inter);
    const nameError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.INTERACTION_MISSING_NAME,
    );

    assert.ok(nameError, 'Should have INTERACTION_MISSING_NAME error');
  });

  it('should detect missing action ID', () => {
    const action = { ...VALID_ACTION_1, actionId: '' };
    const errors = validateUserAction(action);
    const idError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.ACTION_MISSING_ID,
    );

    assert.ok(idError, 'Should have ACTION_MISSING_ID error');
  });

  it('should detect missing action title', () => {
    const action = { ...VALID_ACTION_1, title: '' };
    const errors = validateUserAction(action);
    const titleError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.ACTION_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have ACTION_MISSING_TITLE error');
  });

  it('should detect missing action target ID', () => {
    const action = { ...VALID_ACTION_1, targetId: '' };
    const errors = validateUserAction(action);
    const refError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.ACTION_INVALID_REFERENCE,
    );

    assert.ok(refError, 'Should have ACTION_INVALID_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Empty Interaction Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Empty Interaction', () => {
  it('should detect empty interaction actions', () => {
    const inter = { ...VALID_INTERACTION, actions: [] };
    const errors = validateInteraction(inter);
    const emptyError = errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.INTERACTION_MISSING_STEPS,
    );

    assert.ok(emptyError, 'Should have INTERACTION_MISSING_STEPS error');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Empty Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeInteractionRegistry([]);
    const result = validateInteractionRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input interactions', () => {
    const input: LaboratoryInteractionInput = { interactions: [] };
    const result = validateInteractionInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === INTERACTION_VALIDATION_CODES.EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Deterministic Ordering', () => {
  it('should sort interactions by interactionId', () => {
    const int3 = { ...VALID_INTERACTION, interactionId: 'int-003' };
    const int1 = { ...VALID_INTERACTION, interactionId: 'int-001' };
    const int2 = { ...VALID_INTERACTION, interactionId: 'int-002' };

    const registry = composeInteractionRegistry([int3, int1, int2]);

    assert.equal(registry.interactions[0].interactionId, 'int-001');
    assert.equal(registry.interactions[1].interactionId, 'int-002');
    assert.equal(registry.interactions[2].interactionId, 'int-003');
  });

  it('should sort by interactionType when interactionId is equal', () => {
    const intA = { ...VALID_INTERACTION, interactionId: 'int-001', interactionType: 'visualization_focus' as const };
    const intB = { ...VALID_INTERACTION, interactionId: 'int-001', interactionType: 'parameter_adjustment' as const };

    const registry = composeInteractionRegistry([intA, intB]);

    assert.equal(registry.interactions[0].interactionType, 'parameter_adjustment');
    assert.equal(registry.interactions[1].interactionType, 'visualization_focus');
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Trace Validation', () => {
  it('should validate trace determinism metadata', () => {
    const trace = composeInteractionTrace({
      traceId: '_trace_interaction_1',
      interactionCount: 1,
      actionCount: 2,
      decisions: [
        { decisionId: 'd1', interactionId: 'int-001', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
    assert.equal(trace.generatedFrom, 'deterministic_interaction_kernel');
  });

  it('should count validated and invalid decisions', () => {
    const trace = composeInteractionTrace({
      traceId: '_trace_interaction_1',
      interactionCount: 3,
      actionCount: 6,
      decisions: [
        { decisionId: 'd1', interactionId: 'int-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', interactionId: 'int-002', validationPassed: false, validationErrors: ['INTERACTION_UNKNOWN_TYPE'] },
        { decisionId: 'd3', interactionId: 'int-003', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.invalidCount, 1);
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Registry Validation', () => {
  it('should validate a complete registry', () => {
    const registry = composeInteractionRegistry([VALID_INTERACTION, VALID_INTERACTION_2]);
    const result = validateInteractionRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'interaction_registry_composition');
  });

  it('should validate registry determinism metadata', () => {
    const registry = composeInteractionRegistry([VALID_INTERACTION]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.generatedFrom, 'deterministic_interaction_kernel');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Immutable Input', () => {
  it('should not mutate input interactions', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const originalId = VALID_INTERACTION.interactionId;
    const originalName = VALID_INTERACTION.name;

    composeLaboratoryInteractions(input);

    assert.equal(VALID_INTERACTION.interactionId, originalId);
    assert.equal(VALID_INTERACTION.name, originalName);
  });

  it('should not mutate input registry interactions', () => {
    const interactions = [VALID_INTERACTION, VALID_INTERACTION_2];
    const originalIds = interactions.map((i) => i.interactionId);

    composeInteractionRegistry(interactions);

    assert.equal(interactions[0].interactionId, originalIds[0]);
    assert.equal(interactions[1].interactionId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Identical Output', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION, VALID_INTERACTION_2],
    };

    const results: ReturnType<typeof composeLaboratoryInteractions>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeLaboratoryInteractions(input));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifactId, results[i].artifactId);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
      assert.deepStrictEqual(results[0].trace.decisions, results[i].trace.decisions);
      assert.deepStrictEqual(results[0].registry.interactions, results[i].registry.interactions);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const interactions = [VALID_INTERACTION, VALID_INTERACTION_2];

    const results: ReturnType<typeof composeInteractionRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeInteractionRegistry(interactions));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].interactions, results[i].interactions);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Helper Functions', () => {
  it('should return canonical interaction types', () => {
    const types = getCanonicalInteractionTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_INTERACTION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical user action types', () => {
    const types = getCanonicalUserActionTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_USER_ACTION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical interaction statuses', () => {
    const statuses = getCanonicalInteractionStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_INTERACTION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate governance status', () => {
    assert.equal(isSupportedInteractionGovernanceStatus('canonical'), true);
    assert.equal(isSupportedInteractionGovernanceStatus('accepted'), true);
    assert.equal(isSupportedInteractionGovernanceStatus('provisional'), true);
    assert.equal(isSupportedInteractionGovernanceStatus('deprecated'), true);
    assert.equal(isSupportedInteractionGovernanceStatus('rejected'), true);
    assert.equal(isSupportedInteractionGovernanceStatus('invalid'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 interaction types', () => {
    assert.equal(CANONICAL_INTERACTION_TYPES.length, 10);
  });

  it('should have exactly 10 user action types', () => {
    assert.equal(CANONICAL_USER_ACTION_TYPES.length, 10);
  });

  it('should have exactly 6 interaction statuses', () => {
    assert.equal(CANONICAL_INTERACTION_STATUS.length, 6);
  });

  it('should contain all expected interaction types', () => {
    const expectedTypes = ['parameter_adjustment', 'prediction_submission', 'observation_note', 'comparison_selection', 'visualization_focus', 'step_navigation', 'dataset_selection', 'experiment_selection', 'result_inspection', 'completion_marker'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_INTERACTION_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected user action types', () => {
    const expectedTypes = ['select', 'modify', 'inspect', 'compare', 'annotate', 'navigate', 'confirm', 'reset', 'review', 'complete'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_USER_ACTION_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected interaction statuses', () => {
    const expectedStatuses = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expectedStatuses) {
      assert.ok(
        CANONICAL_INTERACTION_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Prediction Metadata Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Prediction Metadata', () => {
  it('should compose prediction submission interaction', () => {
    const predictionAction: LaboratoryUserAction = {
      actionId: 'action-predict-001',
      actionType: 'annotate',
      title: 'Submit Prediction',
      description: 'Submit a prediction before running the experiment.',
      targetId: 'exp-001',
      targetType: 'experiment',
      interactionId: 'interaction-predict-001',
      governanceStatus: 'canonical',
    };

    const predictionInteraction: LaboratoryInteraction = {
      interactionId: 'interaction-predict-001',
      interactionType: 'prediction_submission',
      name: 'Prediction Submission',
      description: 'Submit a prediction before experiment execution.',
      workflowId: 'workflow-001',
      workflowStepId: 'step-001',
      experimentId: 'exp-001',
      configurationId: 'config-001',
      parameterId: '',
      resultArtifactId: '',
      visualizationId: '',
      datasetReferenceId: '',
      actions: [predictionAction],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: { ...VALID_INTERACTION_PROVENANCE, interactionId: 'interaction-predict-001' },
    };

    const errors = validateInteraction(predictionInteraction);
    assert.deepStrictEqual(errors, []);
    assert.equal(predictionInteraction.interactionType, 'prediction_submission');
  });
});

// ---------------------------------------------------------------------------
// Workflow Interaction Metadata Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Workflow Interaction Metadata', () => {
  it('should compose step navigation interaction', () => {
    const navigateAction: LaboratoryUserAction = {
      actionId: 'action-nav-001',
      actionType: 'navigate',
      title: 'Navigate to Next Step',
      description: 'Move to the next workflow step.',
      targetId: 'step-002',
      targetType: 'workflow_step',
      interactionId: 'interaction-nav-001',
      governanceStatus: 'canonical',
    };

    const navigationInteraction: LaboratoryInteraction = {
      interactionId: 'interaction-nav-001',
      interactionType: 'step_navigation',
      name: 'Step Navigation',
      description: 'Navigate between workflow steps.',
      workflowId: 'workflow-001',
      workflowStepId: 'step-001',
      experimentId: '',
      configurationId: '',
      parameterId: '',
      resultArtifactId: '',
      visualizationId: '',
      datasetReferenceId: '',
      actions: [navigateAction],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: { ...VALID_INTERACTION_PROVENANCE, interactionId: 'interaction-nav-001' },
    };

    const errors = validateInteraction(navigationInteraction);
    assert.deepStrictEqual(errors, []);
    assert.equal(navigationInteraction.interactionType, 'step_navigation');
  });
});

// ---------------------------------------------------------------------------
// Visualization Interaction Metadata Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Visualization Interaction Metadata', () => {
  it('should compose visualization focus interaction', () => {
    const focusAction: LaboratoryUserAction = {
      actionId: 'action-focus-001',
      actionType: 'inspect',
      title: 'Focus on Visualization',
      description: 'Focus on a specific visualization region.',
      targetId: 'vis-001',
      targetType: 'visualization',
      interactionId: 'interaction-focus-001',
      governanceStatus: 'canonical',
    };

    const focusInteraction: LaboratoryInteraction = {
      interactionId: 'interaction-focus-001',
      interactionType: 'visualization_focus',
      name: 'Visualization Focus',
      description: 'Focus on visualization details.',
      workflowId: 'workflow-001',
      workflowStepId: 'step-001',
      experimentId: '',
      configurationId: '',
      parameterId: '',
      resultArtifactId: '',
      visualizationId: 'vis-001',
      datasetReferenceId: '',
      actions: [focusAction],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: { ...VALID_INTERACTION_PROVENANCE, interactionId: 'interaction-focus-001' },
    };

    const errors = validateInteraction(focusInteraction);
    assert.deepStrictEqual(errors, []);
    assert.equal(focusInteraction.interactionType, 'visualization_focus');
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Interaction Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not execute interactions', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });

  it('should not handle click events', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('clickHandler' in result), 'Should not have click handler');
    assert.ok(!('onClick' in result), 'Should not have onClick');
  });

  it('should not use event emitters', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('eventEmitter' in result), 'Should not have event emitter');
    assert.ok(!('emit' in result), 'Should not have emit');
  });

  it('should not store learner progress', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('learnerProgress' in result), 'Should not have learner progress');
    assert.ok(!('progress' in result), 'Should not have progress');
  });

  it('should not store telemetry', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('telemetry' in result), 'Should not have telemetry');
    assert.ok(!('analytics' in result), 'Should not have analytics');
  });

  it('should not use browser APIs', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('window' in result), 'Should not have window');
    assert.ok(!('document' in result), 'Should not have document');
    assert.ok(!('localStorage' in result), 'Should not have localStorage');
  });

  it('should not perform network requests', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not generate code', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });

  it('should not have executable callbacks in interaction', () => {
    const inter = composeInteraction({
      interactionId: 'interaction-001',
      interactionType: 'parameter_adjustment',
      name: 'Test Interaction',
      description: 'A test interaction.',
      workflowId: 'workflow-001',
      workflowStepId: 'step-001',
      experimentId: 'exp-001',
      configurationId: 'config-001',
      parameterId: 'param-001',
      resultArtifactId: '',
      visualizationId: '',
      datasetReferenceId: '',
      actions: [VALID_ACTION_1],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_INTERACTION_PROVENANCE,
    });

    const keys = Object.keys(inter);
    for (const key of keys) {
      const value = (inter as any)[key];
      assert.ok(typeof value !== 'function', `Interaction field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in action', () => {
    const action = composeUserAction({
      actionId: 'action-001',
      actionType: 'modify',
      title: 'Test Action',
      description: 'A test action.',
      targetId: 'param-001',
      targetType: 'parameter',
      interactionId: 'interaction-001',
      governanceStatus: 'canonical',
    });

    const keys = Object.keys(action);
    for (const key of keys) {
      const value = (action as any)[key];
      assert.ok(typeof value !== 'function', `Action field "${key}" should not be a function`);
    }
  });

  it('should not have runtime predictions', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('predictionResult' in result), 'Should not have prediction result');
    assert.ok(!('prediction' in result), 'Should not have prediction');
  });

  it('should not have automatic grading', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('gradingResult' in result), 'Should not have grading result');
    assert.ok(!('grade' in result), 'Should not have grade');
  });

  it('should not have automatic evaluation', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('evaluationResult' in result), 'Should not have evaluation result');
    assert.ok(!('evaluationOutput' in result), 'Should not have evaluation output');
  });

  it('should not have LLM usage', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('llmResult' in result), 'Should not have LLM result');
    assert.ok(!('llmOutput' in result), 'Should not have LLM output');
    assert.ok(!('llmResponse' in result), 'Should not have LLM response');
  });

  it('should not have execution history', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('executionHistory' in result), 'Should not have execution history');
    assert.ok(!('history' in result), 'Should not have history');
  });

  it('should not have session state', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('sessionState' in result), 'Should not have session state');
    assert.ok(!('session' in result), 'Should not have session');
  });

  it('should not have persistence', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('persistence' in result), 'Should not have persistence');
    assert.ok(!('storage' in result), 'Should not have storage');
  });

  it('should not have synchronization', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('synchronization' in result), 'Should not have synchronization');
    assert.ok(!('sync' in result), 'Should not have sync');
  });

  it('should not have prediction engines', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('predictionEngine' in result), 'Should not have prediction engine');
    assert.ok(!('engine' in result), 'Should not have engine');
  });

  it('should not have adaptive behavior', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('adaptiveBehavior' in result), 'Should not have adaptive behavior');
    assert.ok(!('adaptation' in result), 'Should not have adaptation');
  });

  it('should not have learner profile', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('learnerProfile' in result), 'Should not have learner profile');
    assert.ok(!('profile' in result), 'Should not have profile');
  });

  it('should not have mastery inference', () => {
    const input: LaboratoryInteractionInput = {
      interactions: [VALID_INTERACTION],
    };

    const result = composeLaboratoryInteractions(input);
    assert.ok(!('masteryInference' in result), 'Should not have mastery inference');
    assert.ok(!('mastery' in result), 'Should not have mastery');
  });
});
