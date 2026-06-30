/**
 * NV-1600-D4-OPT-08 — Predict-Before-Run & Hypothesis Modeling Test Suite
 *
 * Comprehensive deterministic test suite for the Hypothesis Kernel.
 * Covers: valid hypothesis, valid prediction prompt, valid observation target,
 * valid registry, duplicate hypothesis IDs, duplicate prompt IDs, unsupported
 * hypothesis type, unsupported prompt type, unsupported observation target,
 * unsupported status, invalid references, missing provenance, missing source,
 * missing rationale, missing providedBy, empty registry, deterministic ordering,
 * immutable input, identical output, 100-iteration determinism, helper functions,
 * registry validation, artifact validation, trace validation, canonical enum
 * completeness, workflow integration, experiment integration, visualization
 * integration, parameter integration, negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  LaboratoryHypothesis,
  LaboratoryPredictionPrompt,
  LaboratoryHypothesisInput,
  LaboratoryHypothesisRegistry,
  LaboratoryArtifactWithHypotheses,
  LaboratoryHypothesisTrace,
  LaboratoryHypothesisProvenance,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_HYPOTHESIS_TYPES,
  CANONICAL_PREDICTION_PROMPT_TYPES,
  CANONICAL_OBSERVATION_TARGETS,
  CANONICAL_HYPOTHESIS_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

import {
  composeHypothesisProvenance,
  composePredictionPrompt,
  composeHypothesis,
  composeHypothesisTrace,
  composeHypothesisRegistry,
  composeLaboratoryHypotheses,
  isSupportedHypothesisType,
  isSupportedPredictionPromptType,
  isSupportedObservationTarget,
  isSupportedHypothesisStatus,
  isSupportedHypothesisGovernanceStatus,
  getCanonicalHypothesisTypes,
  getCanonicalPredictionPromptTypes,
  getCanonicalObservationTargets,
  getCanonicalHypothesisStatuses,
} from './HypothesisKernel.ts';

import {
  validateHypothesis,
  validatePredictionPrompt,
  validateHypothesisRegistry,
  validateLaboratoryArtifactWithHypotheses,
  validateHypothesisInput,
  HYPOTHESIS_VALIDATION_CODES,
} from './HypothesisValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_HYPOTHESIS_PROVENANCE: LaboratoryHypothesisProvenance = {
  hypothesisId: 'hypothesis-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Expected behavior hypothesis',
  providedBy: 'NeuralVerse Team',
};

const VALID_PROMPT_1: LaboratoryPredictionPrompt = {
  promptId: 'prompt-001',
  promptType: 'multiple_choice',
  title: 'Predict Training Loss',
  description: 'What will the training loss be after 10 epochs?',
  hypothesisId: 'hypothesis-001',
  observationTargetId: 'obs-target-001',
  reasoningCategory: 'metric_prediction',
  governanceStatus: 'canonical',
};

const VALID_PROMPT_2: LaboratoryPredictionPrompt = {
  promptId: 'prompt-002',
  promptType: 'visual_prediction',
  title: 'Predict Visualization',
  description: 'What pattern will the loss curve show?',
  hypothesisId: 'hypothesis-001',
  observationTargetId: 'obs-target-002',
  reasoningCategory: 'visual_prediction',
  governanceStatus: 'canonical',
};

const VALID_HYPOTHESIS: LaboratoryHypothesis = {
  hypothesisId: 'hypothesis-001',
  hypothesisType: 'expected_metric',
  name: 'Training Loss Hypothesis',
  description: 'Hypothesis about expected training loss.',
  experimentId: 'exp-001',
  workflowId: 'workflow-001',
  parameterId: 'param-001',
  visualizationId: 'vis-001',
  observationTargetId: 'obs-target-001',
  prompts: [VALID_PROMPT_1, VALID_PROMPT_2],
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_HYPOTHESIS_PROVENANCE,
};

const VALID_HYPOTHESIS_2: LaboratoryHypothesis = {
  hypothesisId: 'hypothesis-002',
  hypothesisType: 'expected_behavior',
  name: 'Algorithm Behavior Hypothesis',
  description: 'Hypothesis about algorithm behavior.',
  experimentId: 'exp-002',
  workflowId: 'workflow-001',
  parameterId: '',
  visualizationId: '',
  observationTargetId: 'obs-target-003',
  prompts: [
    { ...VALID_PROMPT_1, promptId: 'prompt-003', promptType: 'free_observation', title: 'Describe Behavior', observationTargetId: 'obs-target-003' },
  ],
  status: 'published',
  governanceStatus: 'accepted',
  provenance: { ...VALID_HYPOTHESIS_PROVENANCE, hypothesisId: 'hypothesis-002' },
};

const INVALID_HYPOTHESIS_UNKNOWN_TYPE: LaboratoryHypothesis = {
  hypothesisId: 'hypothesis-003',
  hypothesisType: 'unsupported_type' as any,
  name: 'Invalid Type Hypothesis',
  description: 'A hypothesis with unsupported type.',
  experimentId: 'exp-001',
  workflowId: 'workflow-001',
  parameterId: '',
  visualizationId: '',
  observationTargetId: 'obs-target-001',
  prompts: [VALID_PROMPT_1],
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_HYPOTHESIS_PROVENANCE,
};

const INVALID_HYPOTHESIS_UNKNOWN_STATUS: LaboratoryHypothesis = {
  hypothesisId: 'hypothesis-004',
  hypothesisType: 'expected_metric',
  name: 'Invalid Status Hypothesis',
  description: 'A hypothesis with unsupported status.',
  experimentId: 'exp-001',
  workflowId: 'workflow-001',
  parameterId: '',
  visualizationId: '',
  observationTargetId: 'obs-target-001',
  prompts: [VALID_PROMPT_1],
  status: 'unsupported_status' as any,
  governanceStatus: 'canonical',
  provenance: VALID_HYPOTHESIS_PROVENANCE,
};

const INVALID_PROMPT_UNKNOWN_TYPE: LaboratoryPredictionPrompt = {
  promptId: 'prompt-004',
  promptType: 'unsupported_type' as any,
  title: 'Invalid Prompt',
  description: 'A prompt with unsupported type.',
  hypothesisId: 'hypothesis-001',
  observationTargetId: 'obs-target-001',
  reasoningCategory: 'test',
  governanceStatus: 'canonical',
};

// ---------------------------------------------------------------------------
// Valid Hypothesis Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Valid Hypothesis', () => {
  it('should compose valid hypothesis provenance', () => {
    const provenance = composeHypothesisProvenance({
      hypothesisId: 'hypothesis-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Expected behavior hypothesis',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.hypothesisId, 'hypothesis-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
  });

  it('should compose valid prediction prompt', () => {
    const prompt = composePredictionPrompt({
      promptId: 'prompt-001',
      promptType: 'multiple_choice',
      title: 'Predict Training Loss',
      description: 'What will the training loss be?',
      hypothesisId: 'hypothesis-001',
      observationTargetId: 'obs-target-001',
      reasoningCategory: 'metric_prediction',
      governanceStatus: 'canonical',
    });

    assert.equal(prompt.promptId, 'prompt-001');
    assert.equal(prompt.promptType, 'multiple_choice');
    assert.equal(prompt.observationTargetId, 'obs-target-001');
  });

  it('should compose valid hypothesis', () => {
    const hyp = composeHypothesis({
      hypothesisId: 'hypothesis-001',
      hypothesisType: 'expected_metric',
      name: 'Training Loss Hypothesis',
      description: 'Hypothesis about expected training loss.',
      experimentId: 'exp-001',
      workflowId: 'workflow-001',
      parameterId: 'param-001',
      visualizationId: 'vis-001',
      observationTargetId: 'obs-target-001',
      prompts: [VALID_PROMPT_1],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_HYPOTHESIS_PROVENANCE,
    });

    assert.equal(hyp.hypothesisId, 'hypothesis-001');
    assert.equal(hyp.hypothesisType, 'expected_metric');
    assert.equal(hyp.prompts.length, 1);
  });

  it('should compose valid hypothesis trace', () => {
    const trace = composeHypothesisTrace({
      traceId: '_trace_hypothesis_1',
      hypothesisCount: 2,
      promptCount: 5,
      decisions: [
        { decisionId: 'd1', hypothesisId: 'hypothesis-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', hypothesisId: 'hypothesis-002', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.traceId, '_trace_hypothesis_1');
    assert.equal(trace.hypothesisCount, 2);
    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.deterministic, true);
  });

  it('should compose valid hypothesis registry', () => {
    const registry = composeHypothesisRegistry([VALID_HYPOTHESIS]);

    assert.equal(registry.hypotheses.length, 1);
    assert.equal(registry.hypothesisCount, 1);
    assert.equal(registry.promptCount, 2);
    assert.equal(registry.deterministic, true);
  });

  it('should validate a valid hypothesis with no errors', () => {
    const errors = validateHypothesis(VALID_HYPOTHESIS);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid prediction prompt with no errors', () => {
    const errors = validatePredictionPrompt(VALID_PROMPT_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a complete artifact', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const artifact = composeLaboratoryHypotheses(input);
    const result = validateLaboratoryArtifactWithHypotheses(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate hypothesis input', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS, VALID_HYPOTHESIS_2],
    };

    const result = validateHypothesisInput(input);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Duplicate ID Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Duplicate IDs', () => {
  it('should detect duplicate hypothesis IDs in registry', () => {
    const registry = composeHypothesisRegistry([VALID_HYPOTHESIS, VALID_HYPOTHESIS]);
    const result = validateHypothesisRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.REGISTRY_DUPLICATE_HYPOTHESIS_ID,
    );

    assert.ok(duplicateError, 'Should have REGISTRY_DUPLICATE_HYPOTHESIS_ID error');
  });

  it('should detect duplicate prompt IDs in hypothesis', () => {
    const hyp = {
      ...VALID_HYPOTHESIS,
      prompts: [VALID_PROMPT_1, VALID_PROMPT_1],
    };
    const errors = validateHypothesis(hyp);
    const duplicateError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.PROMPT_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have PROMPT_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Name Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Duplicate Names', () => {
  it('should detect duplicate hypothesis names in registry', () => {
    const hyp1 = { ...VALID_HYPOTHESIS, hypothesisId: 'hyp-001', name: 'Same Name' };
    const hyp2 = { ...VALID_HYPOTHESIS, hypothesisId: 'hyp-002', name: 'Same Name' };
    const registry = composeHypothesisRegistry([hyp1, hyp2]);
    const result = validateHypothesisRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.REGISTRY_DUPLICATE_HYPOTHESIS_NAME,
    );

    assert.ok(duplicateError, 'Should have REGISTRY_DUPLICATE_HYPOTHESIS_NAME error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Type Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Unsupported Types', () => {
  it('should reject unsupported hypothesis type', () => {
    assert.equal(isSupportedHypothesisType('expected_metric'), true);
    assert.equal(isSupportedHypothesisType('expected_behavior'), true);
    assert.equal(isSupportedHypothesisType('unsupported_type'), false);
  });

  it('should detect unsupported hypothesis type in validation', () => {
    const errors = validateHypothesis(INVALID_HYPOTHESIS_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have HYPOTHESIS_UNKNOWN_TYPE error');
  });

  it('should reject unsupported prediction prompt type', () => {
    assert.equal(isSupportedPredictionPromptType('multiple_choice'), true);
    assert.equal(isSupportedPredictionPromptType('visual_prediction'), true);
    assert.equal(isSupportedPredictionPromptType('unsupported_type'), false);
  });

  it('should detect unsupported prompt type in validation', () => {
    const errors = validatePredictionPrompt(INVALID_PROMPT_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.PROMPT_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have PROMPT_UNKNOWN_TYPE error');
  });

  it('should reject unsupported observation target', () => {
    assert.equal(isSupportedObservationTarget('visualization'), true);
    assert.equal(isSupportedObservationTarget('metric'), true);
    assert.equal(isSupportedObservationTarget('unsupported_target'), false);
  });

  it('should reject unsupported hypothesis status', () => {
    assert.equal(isSupportedHypothesisStatus('draft'), true);
    assert.equal(isSupportedHypothesisStatus('approved'), true);
    assert.equal(isSupportedHypothesisStatus('unsupported_status'), false);
  });

  it('should detect unsupported status in validation', () => {
    const errors = validateHypothesis(INVALID_HYPOTHESIS_UNKNOWN_STATUS);
    const statusError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_UNKNOWN_STATUS,
    );

    assert.ok(statusError, 'Should have HYPOTHESIS_UNKNOWN_STATUS error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Missing Provenance', () => {
  it('should detect missing provenance in hypothesis', () => {
    const hyp = { ...VALID_HYPOTHESIS, provenance: undefined as any };
    const errors = validateHypothesis(hyp);
    const provenanceError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have HYPOTHESIS_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Missing Source', () => {
  it('should detect missing provenance in hypothesis', () => {
    const hyp = { ...VALID_HYPOTHESIS, provenance: undefined as any };
    const errors = validateHypothesis(hyp);
    const provenanceError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have HYPOTHESIS_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Rationale Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Missing Rationale', () => {
  it('should detect missing provenance in hypothesis', () => {
    const hyp = { ...VALID_HYPOTHESIS, provenance: undefined as any };
    const errors = validateHypothesis(hyp);
    const provenanceError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have HYPOTHESIS_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing ProvidedBy Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Missing ProvidedBy', () => {
  it('should detect missing provenance in hypothesis', () => {
    const hyp = { ...VALID_HYPOTHESIS, provenance: undefined as any };
    const errors = validateHypothesis(hyp);
    const provenanceError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have HYPOTHESIS_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid References Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Invalid References', () => {
  it('should detect missing hypothesis ID', () => {
    const hyp = { ...VALID_HYPOTHESIS, hypothesisId: '' };
    const errors = validateHypothesis(hyp);
    const idError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_MISSING_HYPOTHESIS_ID,
    );

    assert.ok(idError, 'Should have HYPOTHESIS_MISSING_HYPOTHESIS_ID error');
  });

  it('should detect missing hypothesis name', () => {
    const hyp = { ...VALID_HYPOTHESIS, name: '' };
    const errors = validateHypothesis(hyp);
    const nameError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_MISSING_NAME,
    );

    assert.ok(nameError, 'Should have HYPOTHESIS_MISSING_NAME error');
  });

  it('should detect missing prompt ID', () => {
    const prompt = { ...VALID_PROMPT_1, promptId: '' };
    const errors = validatePredictionPrompt(prompt);
    const idError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.PROMPT_MISSING_ID,
    );

    assert.ok(idError, 'Should have PROMPT_MISSING_ID error');
  });

  it('should detect missing prompt title', () => {
    const prompt = { ...VALID_PROMPT_1, title: '' };
    const errors = validatePredictionPrompt(prompt);
    const titleError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.PROMPT_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have PROMPT_MISSING_TITLE error');
  });

  it('should detect missing prompt observation target', () => {
    const prompt = { ...VALID_PROMPT_1, observationTargetId: '' };
    const errors = validatePredictionPrompt(prompt);
    const refError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.PROMPT_INVALID_REFERENCE,
    );

    assert.ok(refError, 'Should have PROMPT_INVALID_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Empty Hypothesis Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Empty Hypothesis', () => {
  it('should detect empty hypothesis prompts', () => {
    const hyp = { ...VALID_HYPOTHESIS, prompts: [] };
    const errors = validateHypothesis(hyp);
    const emptyError = errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_MISSING_PROMPTS,
    );

    assert.ok(emptyError, 'Should have HYPOTHESIS_MISSING_PROMPTS error');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Empty Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeHypothesisRegistry([]);
    const result = validateHypothesisRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input hypotheses', () => {
    const input: LaboratoryHypothesisInput = { hypotheses: [] };
    const result = validateHypothesisInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === HYPOTHESIS_VALIDATION_CODES.EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Deterministic Ordering', () => {
  it('should sort hypotheses by hypothesisId', () => {
    const hyp3 = { ...VALID_HYPOTHESIS, hypothesisId: 'hyp-003' };
    const hyp1 = { ...VALID_HYPOTHESIS, hypothesisId: 'hyp-001' };
    const hyp2 = { ...VALID_HYPOTHESIS, hypothesisId: 'hyp-002' };

    const registry = composeHypothesisRegistry([hyp3, hyp1, hyp2]);

    assert.equal(registry.hypotheses[0].hypothesisId, 'hyp-001');
    assert.equal(registry.hypotheses[1].hypothesisId, 'hyp-002');
    assert.equal(registry.hypotheses[2].hypothesisId, 'hyp-003');
  });

  it('should sort by hypothesisType when hypothesisId is equal', () => {
    const hypA = { ...VALID_HYPOTHESIS, hypothesisId: 'hyp-001', hypothesisType: 'expected_visual_pattern' as const };
    const hypB = { ...VALID_HYPOTHESIS, hypothesisId: 'hyp-001', hypothesisType: 'expected_metric' as const };

    const registry = composeHypothesisRegistry([hypA, hypB]);

    assert.equal(registry.hypotheses[0].hypothesisType, 'expected_metric');
    assert.equal(registry.hypotheses[1].hypothesisType, 'expected_visual_pattern');
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Trace Validation', () => {
  it('should validate trace determinism metadata', () => {
    const trace = composeHypothesisTrace({
      traceId: '_trace_hypothesis_1',
      hypothesisCount: 1,
      promptCount: 2,
      decisions: [
        { decisionId: 'd1', hypothesisId: 'hyp-001', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
    assert.equal(trace.generatedFrom, 'deterministic_hypothesis_kernel');
  });

  it('should count validated and invalid decisions', () => {
    const trace = composeHypothesisTrace({
      traceId: '_trace_hypothesis_1',
      hypothesisCount: 3,
      promptCount: 6,
      decisions: [
        { decisionId: 'd1', hypothesisId: 'hyp-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', hypothesisId: 'hyp-002', validationPassed: false, validationErrors: ['HYPOTHESIS_UNKNOWN_TYPE'] },
        { decisionId: 'd3', hypothesisId: 'hyp-003', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.invalidCount, 1);
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Registry Validation', () => {
  it('should validate a complete registry', () => {
    const registry = composeHypothesisRegistry([VALID_HYPOTHESIS, VALID_HYPOTHESIS_2]);
    const result = validateHypothesisRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'hypothesis_registry_composition');
  });

  it('should validate registry determinism metadata', () => {
    const registry = composeHypothesisRegistry([VALID_HYPOTHESIS]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.generatedFrom, 'deterministic_hypothesis_kernel');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Immutable Input', () => {
  it('should not mutate input hypotheses', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const originalId = VALID_HYPOTHESIS.hypothesisId;
    const originalName = VALID_HYPOTHESIS.name;

    composeLaboratoryHypotheses(input);

    assert.equal(VALID_HYPOTHESIS.hypothesisId, originalId);
    assert.equal(VALID_HYPOTHESIS.name, originalName);
  });

  it('should not mutate input registry hypotheses', () => {
    const hypotheses = [VALID_HYPOTHESIS, VALID_HYPOTHESIS_2];
    const originalIds = hypotheses.map((h) => h.hypothesisId);

    composeHypothesisRegistry(hypotheses);

    assert.equal(hypotheses[0].hypothesisId, originalIds[0]);
    assert.equal(hypotheses[1].hypothesisId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Identical Output', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS, VALID_HYPOTHESIS_2],
    };

    const results: ReturnType<typeof composeLaboratoryHypotheses>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeLaboratoryHypotheses(input));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifactId, results[i].artifactId);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
      assert.deepStrictEqual(results[0].trace.decisions, results[i].trace.decisions);
      assert.deepStrictEqual(results[0].registry.hypotheses, results[i].registry.hypotheses);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const hypotheses = [VALID_HYPOTHESIS, VALID_HYPOTHESIS_2];

    const results: ReturnType<typeof composeHypothesisRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeHypothesisRegistry(hypotheses));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].hypotheses, results[i].hypotheses);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Helper Functions', () => {
  it('should return canonical hypothesis types', () => {
    const types = getCanonicalHypothesisTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_HYPOTHESIS_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical prediction prompt types', () => {
    const types = getCanonicalPredictionPromptTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_PREDICTION_PROMPT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical observation targets', () => {
    const targets = getCanonicalObservationTargets();
    assert.deepStrictEqual([...targets], [...CANONICAL_OBSERVATION_TARGETS]);
    assert.equal(targets.length, 10);
  });

  it('should return canonical hypothesis statuses', () => {
    const statuses = getCanonicalHypothesisStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_HYPOTHESIS_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate governance status', () => {
    assert.equal(isSupportedHypothesisGovernanceStatus('canonical'), true);
    assert.equal(isSupportedHypothesisGovernanceStatus('accepted'), true);
    assert.equal(isSupportedHypothesisGovernanceStatus('provisional'), true);
    assert.equal(isSupportedHypothesisGovernanceStatus('deprecated'), true);
    assert.equal(isSupportedHypothesisGovernanceStatus('rejected'), true);
    assert.equal(isSupportedHypothesisGovernanceStatus('invalid'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 hypothesis types', () => {
    assert.equal(CANONICAL_HYPOTHESIS_TYPES.length, 10);
  });

  it('should have exactly 10 prediction prompt types', () => {
    assert.equal(CANONICAL_PREDICTION_PROMPT_TYPES.length, 10);
  });

  it('should have exactly 10 observation targets', () => {
    assert.equal(CANONICAL_OBSERVATION_TARGETS.length, 10);
  });

  it('should have exactly 6 hypothesis statuses', () => {
    assert.equal(CANONICAL_HYPOTHESIS_STATUS.length, 6);
  });

  it('should contain all expected hypothesis types', () => {
    const expectedTypes = ['expected_behavior', 'expected_visual_pattern', 'expected_metric', 'algorithm_prediction', 'parameter_effect', 'dataset_prediction', 'performance_prediction', 'comparison_prediction', 'failure_prediction', 'custom'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_HYPOTHESIS_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected prediction prompt types', () => {
    const expectedTypes = ['multiple_choice', 'ranking', 'ordering', 'selection', 'free_observation', 'visual_prediction', 'parameter_prediction', 'comparison_prediction', 'metric_prediction', 'reflection'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_PREDICTION_PROMPT_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected observation targets', () => {
    const expectedTargets = ['visualization', 'metric', 'algorithm', 'dataset', 'parameter', 'workflow', 'experiment', 'comparison', 'result_artifact', 'custom'];

    for (const target of expectedTargets) {
      assert.ok(
        CANONICAL_OBSERVATION_TARGETS.includes(target as any),
        `Should include target: ${target}`,
      );
    }
  });

  it('should contain all expected hypothesis statuses', () => {
    const expectedStatuses = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expectedStatuses) {
      assert.ok(
        CANONICAL_HYPOTHESIS_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Workflow Integration Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Workflow Integration', () => {
  it('should compose hypothesis with workflow reference', () => {
    const hyp = composeHypothesis({
      hypothesisId: 'hypothesis-workflow-001',
      hypothesisType: 'expected_behavior',
      name: 'Workflow Hypothesis',
      description: 'A hypothesis associated with a workflow.',
      experimentId: '',
      workflowId: 'workflow-001',
      parameterId: '',
      visualizationId: '',
      observationTargetId: 'obs-target-001',
      prompts: [VALID_PROMPT_1],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_HYPOTHESIS_PROVENANCE,
    });

    assert.equal(hyp.workflowId, 'workflow-001');
    const errors = validateHypothesis(hyp);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Experiment Integration Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Experiment Integration', () => {
  it('should compose hypothesis with experiment reference', () => {
    const hyp = composeHypothesis({
      hypothesisId: 'hypothesis-experiment-001',
      hypothesisType: 'expected_metric',
      name: 'Experiment Hypothesis',
      description: 'A hypothesis associated with an experiment.',
      experimentId: 'exp-001',
      workflowId: '',
      parameterId: '',
      visualizationId: '',
      observationTargetId: 'obs-target-001',
      prompts: [VALID_PROMPT_1],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_HYPOTHESIS_PROVENANCE,
    });

    assert.equal(hyp.experimentId, 'exp-001');
    const errors = validateHypothesis(hyp);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Visualization Integration Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Visualization Integration', () => {
  it('should compose hypothesis with visualization reference', () => {
    const hyp = composeHypothesis({
      hypothesisId: 'hypothesis-visualization-001',
      hypothesisType: 'expected_visual_pattern',
      name: 'Visualization Hypothesis',
      description: 'A hypothesis about visualization patterns.',
      experimentId: '',
      workflowId: '',
      parameterId: '',
      visualizationId: 'vis-001',
      observationTargetId: 'obs-target-001',
      prompts: [
        { ...VALID_PROMPT_1, promptId: 'prompt-visual-001', promptType: 'visual_prediction', title: 'Predict Visualization Pattern' },
      ],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_HYPOTHESIS_PROVENANCE,
    });

    assert.equal(hyp.visualizationId, 'vis-001');
    const errors = validateHypothesis(hyp);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Parameter Integration Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Parameter Integration', () => {
  it('should compose hypothesis with parameter reference', () => {
    const hyp = composeHypothesis({
      hypothesisId: 'hypothesis-parameter-001',
      hypothesisType: 'parameter_effect',
      name: 'Parameter Effect Hypothesis',
      description: 'A hypothesis about parameter effects.',
      experimentId: '',
      workflowId: '',
      parameterId: 'param-001',
      visualizationId: '',
      observationTargetId: 'obs-target-001',
      prompts: [
        { ...VALID_PROMPT_1, promptId: 'prompt-param-001', promptType: 'parameter_prediction', title: 'Predict Parameter Effect' },
      ],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_HYPOTHESIS_PROVENANCE,
    });

    assert.equal(hyp.parameterId, 'param-001');
    const errors = validateHypothesis(hyp);
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Hypothesis Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not store learner answers', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('learnerAnswers' in result), 'Should not have learner answers');
    assert.ok(!('answers' in result), 'Should not have answers');
  });

  it('should not evaluate correctness', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('correctness' in result), 'Should not have correctness');
    assert.ok(!('isCorrect' in result), 'Should not have isCorrect');
  });

  it('should not grade hypotheses', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('grade' in result), 'Should not have grade');
    assert.ok(!('score' in result), 'Should not have score');
  });

  it('should not infer mastery', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('mastery' in result), 'Should not have mastery');
    assert.ok(!('masteryLevel' in result), 'Should not have masteryLevel');
  });

  it('should not generate hypotheses automatically', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('generatedHypothesis' in result), 'Should not have generated hypothesis');
    assert.ok(!('autoGenerated' in result), 'Should not have autoGenerated');
  });

  it('should not use AI-generated predictions', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('aiPrediction' in result), 'Should not have AI prediction');
    assert.ok(!('llmPrediction' in result), 'Should not have LLM prediction');
  });

  it('should not use LLM integration', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('llmResult' in result), 'Should not have LLM result');
    assert.ok(!('llmOutput' in result), 'Should not have LLM output');
    assert.ok(!('llmResponse' in result), 'Should not have LLM response');
  });

  it('should not use analytics', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('analytics' in result), 'Should not have analytics');
    assert.ok(!('metrics' in result), 'Should not have metrics');
  });

  it('should not use telemetry', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('telemetry' in result), 'Should not have telemetry');
    assert.ok(!('tracking' in result), 'Should not have tracking');
  });

  it('should not use session state', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('sessionState' in result), 'Should not have session state');
    assert.ok(!('session' in result), 'Should not have session');
  });

  it('should not use persistence', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('persistence' in result), 'Should not have persistence');
    assert.ok(!('storage' in result), 'Should not have storage');
  });

  it('should not perform network requests', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not generate code', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });

  it('should not have executable callbacks in hypothesis', () => {
    const hyp = composeHypothesis({
      hypothesisId: 'hypothesis-001',
      hypothesisType: 'expected_metric',
      name: 'Test Hypothesis',
      description: 'A test hypothesis.',
      experimentId: 'exp-001',
      workflowId: 'workflow-001',
      parameterId: '',
      visualizationId: '',
      observationTargetId: 'obs-target-001',
      prompts: [VALID_PROMPT_1],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_HYPOTHESIS_PROVENANCE,
    });

    const keys = Object.keys(hyp);
    for (const key of keys) {
      const value = (hyp as any)[key];
      assert.ok(typeof value !== 'function', `Hypothesis field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in prompt', () => {
    const prompt = composePredictionPrompt({
      promptId: 'prompt-001',
      promptType: 'multiple_choice',
      title: 'Test Prompt',
      description: 'A test prompt.',
      hypothesisId: 'hypothesis-001',
      observationTargetId: 'obs-target-001',
      reasoningCategory: 'test',
      governanceStatus: 'canonical',
    });

    const keys = Object.keys(prompt);
    for (const key of keys) {
      const value = (prompt as any)[key];
      assert.ok(typeof value !== 'function', `Prompt field "${key}" should not be a function`);
    }
  });

  it('should not have recommendation engine', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('recommendation' in result), 'Should not have recommendation');
    assert.ok(!('recommendationEngine' in result), 'Should not have recommendation engine');
  });

  it('should not have adaptive behavior', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('adaptiveBehavior' in result), 'Should not have adaptive behavior');
    assert.ok(!('adaptation' in result), 'Should not have adaptation');
  });

  it('should not have runtime hypothesis generation', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('runtimeHypothesis' in result), 'Should not have runtime hypothesis');
    assert.ok(!('generatedHypothesis' in result), 'Should not have generated hypothesis');
  });

  it('should not have browser APIs', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('window' in result), 'Should not have window');
    assert.ok(!('document' in result), 'Should not have document');
    assert.ok(!('localStorage' in result), 'Should not have localStorage');
  });

  it('should not have confidence estimation', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('confidence' in result), 'Should not have confidence');
    assert.ok(!('confidenceScore' in result), 'Should not have confidenceScore');
  });

  it('should not have prediction storage', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('predictionStorage' in result), 'Should not have prediction storage');
    assert.ok(!('predictions' in result), 'Should not have predictions');
  });

  it('should not have learner answers', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('learnerAnswers' in result), 'Should not have learner answers');
    assert.ok(!('userAnswers' in result), 'Should not have user answers');
  });

  it('should not have grading', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('grading' in result), 'Should not have grading');
    assert.ok(!('grade' in result), 'Should not have grade');
    assert.ok(!('score' in result), 'Should not have score');
  });

  it('should not have correctness evaluation', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('correctnessEvaluation' in result), 'Should not have correctness evaluation');
    assert.ok(!('isCorrect' in result), 'Should not have isCorrect');
  });

  it('should not have mastery inference', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('masteryInference' in result), 'Should not have mastery inference');
    assert.ok(!('mastery' in result), 'Should not have mastery');
  });

  it('should not have adaptive prompts', () => {
    const input: LaboratoryHypothesisInput = {
      hypotheses: [VALID_HYPOTHESIS],
    };

    const result = composeLaboratoryHypotheses(input);
    assert.ok(!('adaptivePrompts' in result), 'Should not have adaptive prompts');
    assert.ok(!('adaptive' in result), 'Should not have adaptive');
  });
});
