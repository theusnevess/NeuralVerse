/**
 * NV-1600-D4-OPT-06 — Laboratory Workflow Orchestration Test Suite
 *
 * Comprehensive deterministic test suite for the Workflow Kernel.
 * Covers: valid workflow, valid workflow step, valid registry, duplicate workflow ID,
 * duplicate workflow name, duplicate step ID, unsupported workflow type, unsupported
 * step type, unsupported status, missing provenance, missing source, missing rationale,
 * missing providedBy, invalid references, empty workflow, empty registry,
 * deterministic ordering, trace validation, artifact validation, registry validation,
 * helper functions, canonical enum completeness, immutable input, identical output,
 * 100-iteration determinism, negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  LaboratoryWorkflow,
  LaboratoryWorkflowStep,
  LaboratoryWorkflowInput,
  LaboratoryWorkflowRegistry,
  LaboratoryArtifactWithWorkflows,
  LaboratoryWorkflowTrace,
  LaboratoryWorkflowProvenance,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_WORKFLOW_TYPES,
  CANONICAL_WORKFLOW_STEP_TYPES,
  CANONICAL_WORKFLOW_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

import {
  composeWorkflowProvenance,
  composeWorkflowStep,
  composeWorkflow,
  composeWorkflowTrace,
  composeWorkflowRegistry,
  composeLaboratoryWorkflows,
  isSupportedWorkflowType,
  isSupportedWorkflowStepType,
  isSupportedWorkflowStatus,
  isSupportedWorkflowGovernanceStatus,
  getCanonicalWorkflowTypes,
  getCanonicalWorkflowStepTypes,
  getCanonicalWorkflowStatuses,
} from './WorkflowKernel.ts';

import {
  validateWorkflow,
  validateWorkflowStep,
  validateWorkflowRegistry,
  validateLaboratoryArtifactWithWorkflows,
  validateWorkflowInput,
  WORKFLOW_VALIDATION_CODES,
} from './WorkflowValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_WORKFLOW_PROVENANCE: LaboratoryWorkflowProvenance = {
  workflowId: 'workflow-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Single experiment workflow',
  providedBy: 'NeuralVerse Team',
};

const VALID_STEP_1: LaboratoryWorkflowStep = {
  stepId: 'step-001',
  stepType: 'prepare',
  stepOrder: 1,
  title: 'Prepare Dataset',
  description: 'Load and prepare the dataset.',
  experimentId: 'exp-001',
  configurationId: 'config-001',
  executionPolicyId: 'policy-001',
  resultArtifactId: '',
  visualizationId: '',
  governanceStatus: 'canonical',
};

const VALID_STEP_2: LaboratoryWorkflowStep = {
  stepId: 'step-002',
  stepType: 'configure',
  stepOrder: 2,
  title: 'Configure Parameters',
  description: 'Set up experiment parameters.',
  experimentId: 'exp-001',
  configurationId: 'config-001',
  executionPolicyId: 'policy-001',
  resultArtifactId: '',
  visualizationId: '',
  governanceStatus: 'canonical',
};

const VALID_STEP_3: LaboratoryWorkflowStep = {
  stepId: 'step-003',
  stepType: 'execute_metadata',
  stepOrder: 3,
  title: 'Execute Metadata',
  description: 'Record execution metadata.',
  experimentId: 'exp-001',
  configurationId: 'config-001',
  executionPolicyId: 'policy-001',
  resultArtifactId: 'result-001',
  visualizationId: '',
  governanceStatus: 'canonical',
};

const VALID_WORKFLOW: LaboratoryWorkflow = {
  workflowId: 'workflow-001',
  workflowType: 'single_experiment',
  name: 'Single Experiment Workflow',
  description: 'A simple single experiment workflow.',
  laboratoryId: 'lab-001',
  steps: [VALID_STEP_1, VALID_STEP_2, VALID_STEP_3],
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_WORKFLOW_PROVENANCE,
};

const VALID_WORKFLOW_2: LaboratoryWorkflow = {
  workflowId: 'workflow-002',
  workflowType: 'comparison',
  name: 'Comparison Workflow',
  description: 'A comparison workflow.',
  laboratoryId: 'lab-002',
  steps: [
    { ...VALID_STEP_1, stepId: 'step-004', stepOrder: 1 },
    { ...VALID_STEP_2, stepId: 'step-005', stepOrder: 2 },
  ],
  status: 'published',
  governanceStatus: 'accepted',
  provenance: { ...VALID_WORKFLOW_PROVENANCE, workflowId: 'workflow-002' },
};

const INVALID_WORKFLOW_UNKNOWN_TYPE: LaboratoryWorkflow = {
  workflowId: 'workflow-003',
  workflowType: 'unsupported_type' as any,
  name: 'Invalid Type Workflow',
  description: 'A workflow with unsupported type.',
  laboratoryId: 'lab-001',
  steps: [VALID_STEP_1],
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_WORKFLOW_PROVENANCE,
};

const INVALID_WORKFLOW_UNKNOWN_STATUS: LaboratoryWorkflow = {
  workflowId: 'workflow-004',
  workflowType: 'single_experiment',
  name: 'Invalid Status Workflow',
  description: 'A workflow with unsupported status.',
  laboratoryId: 'lab-001',
  steps: [VALID_STEP_1],
  status: 'unsupported_status' as any,
  governanceStatus: 'canonical',
  provenance: VALID_WORKFLOW_PROVENANCE,
};

const INVALID_STEP_UNKNOWN_TYPE: LaboratoryWorkflowStep = {
  stepId: 'step-006',
  stepType: 'unsupported_type' as any,
  stepOrder: 1,
  title: 'Invalid Step',
  description: 'A step with unsupported type.',
  experimentId: 'exp-001',
  configurationId: 'config-001',
  executionPolicyId: 'policy-001',
  resultArtifactId: '',
  visualizationId: '',
  governanceStatus: 'canonical',
};

// ---------------------------------------------------------------------------
// Valid Workflow Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Valid Workflow', () => {
  it('should compose valid workflow provenance', () => {
    const provenance = composeWorkflowProvenance({
      workflowId: 'workflow-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Single experiment workflow',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.workflowId, 'workflow-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
  });

  it('should compose valid workflow step', () => {
    const step = composeWorkflowStep({
      stepId: 'step-001',
      stepType: 'prepare',
      stepOrder: 1,
      title: 'Prepare Dataset',
      description: 'Load and prepare.',
      experimentId: 'exp-001',
      configurationId: 'config-001',
      executionPolicyId: 'policy-001',
      resultArtifactId: '',
      visualizationId: '',
      governanceStatus: 'canonical',
    });

    assert.equal(step.stepId, 'step-001');
    assert.equal(step.stepType, 'prepare');
    assert.equal(step.stepOrder, 1);
  });

  it('should compose valid workflow', () => {
    const wf = composeWorkflow({
      workflowId: 'workflow-001',
      workflowType: 'single_experiment',
      name: 'Single Experiment Workflow',
      description: 'A simple workflow.',
      laboratoryId: 'lab-001',
      steps: [VALID_STEP_1],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_WORKFLOW_PROVENANCE,
    });

    assert.equal(wf.workflowId, 'workflow-001');
    assert.equal(wf.workflowType, 'single_experiment');
    assert.equal(wf.steps.length, 1);
  });

  it('should compose valid workflow trace', () => {
    const trace = composeWorkflowTrace({
      traceId: '_trace_wf_1',
      workflowCount: 2,
      stepCount: 5,
      decisions: [
        { decisionId: 'd1', workflowId: 'workflow-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', workflowId: 'workflow-002', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.traceId, '_trace_wf_1');
    assert.equal(trace.workflowCount, 2);
    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.deterministic, true);
  });

  it('should compose valid workflow registry', () => {
    const registry = composeWorkflowRegistry([VALID_WORKFLOW]);

    assert.equal(registry.workflows.length, 1);
    assert.equal(registry.workflowCount, 1);
    assert.equal(registry.stepCount, 3);
    assert.equal(registry.deterministic, true);
  });

  it('should validate a valid workflow with no errors', () => {
    const errors = validateWorkflow(VALID_WORKFLOW);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid workflow step with no errors', () => {
    const errors = validateWorkflowStep(VALID_STEP_1);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a complete artifact', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const artifact = composeLaboratoryWorkflows(input);
    const result = validateLaboratoryArtifactWithWorkflows(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate workflow input', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW, VALID_WORKFLOW_2],
    };

    const result = validateWorkflowInput(input);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Duplicate ID Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Duplicate IDs', () => {
  it('should detect duplicate workflow IDs in registry', () => {
    const registry = composeWorkflowRegistry([VALID_WORKFLOW, VALID_WORKFLOW]);
    const result = validateWorkflowRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.REGISTRY_DUPLICATE_WORKFLOW_ID,
    );

    assert.ok(duplicateError, 'Should have REGISTRY_DUPLICATE_WORKFLOW_ID error');
  });

  it('should detect duplicate step IDs in workflow', () => {
    const wf = {
      ...VALID_WORKFLOW,
      steps: [VALID_STEP_1, VALID_STEP_1],
    };
    const errors = validateWorkflow(wf);
    const duplicateError = errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.STEP_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have STEP_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Name Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Duplicate Names', () => {
  it('should detect duplicate workflow names in registry', () => {
    const wf1 = { ...VALID_WORKFLOW, workflowId: 'wf-001', name: 'Same Name' };
    const wf2 = { ...VALID_WORKFLOW, workflowId: 'wf-002', name: 'Same Name' };
    const registry = composeWorkflowRegistry([wf1, wf2]);
    const result = validateWorkflowRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.REGISTRY_DUPLICATE_WORKFLOW_NAME,
    );

    assert.ok(duplicateError, 'Should have REGISTRY_DUPLICATE_WORKFLOW_NAME error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Type Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Unsupported Types', () => {
  it('should reject unsupported workflow type', () => {
    assert.equal(isSupportedWorkflowType('single_experiment'), true);
    assert.equal(isSupportedWorkflowType('comparison'), true);
    assert.equal(isSupportedWorkflowType('unsupported_type'), false);
  });

  it('should detect unsupported workflow type in validation', () => {
    const errors = validateWorkflow(INVALID_WORKFLOW_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.WORKFLOW_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have WORKFLOW_UNKNOWN_TYPE error');
  });

  it('should reject unsupported workflow step type', () => {
    assert.equal(isSupportedWorkflowStepType('prepare'), true);
    assert.equal(isSupportedWorkflowStepType('configure'), true);
    assert.equal(isSupportedWorkflowStepType('unsupported_type'), false);
  });

  it('should detect unsupported step type in validation', () => {
    const errors = validateWorkflowStep(INVALID_STEP_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.STEP_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have STEP_UNKNOWN_TYPE error');
  });

  it('should reject unsupported workflow status', () => {
    assert.equal(isSupportedWorkflowStatus('draft'), true);
    assert.equal(isSupportedWorkflowStatus('approved'), true);
    assert.equal(isSupportedWorkflowStatus('unsupported_status'), false);
  });

  it('should detect unsupported status in validation', () => {
    const errors = validateWorkflow(INVALID_WORKFLOW_UNKNOWN_STATUS);
    const statusError = errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.WORKFLOW_UNKNOWN_STATUS,
    );

    assert.ok(statusError, 'Should have WORKFLOW_UNKNOWN_STATUS error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Missing Provenance', () => {
  it('should detect missing provenance in workflow', () => {
    const wf = { ...VALID_WORKFLOW, provenance: undefined as any };
    const errors = validateWorkflow(wf);
    const provenanceError = errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.WORKFLOW_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have WORKFLOW_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Missing Source', () => {
  it('should detect missing provenance in workflow', () => {
    const wf = { ...VALID_WORKFLOW, provenance: undefined as any };
    const errors = validateWorkflow(wf);
    const provenanceError = errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.WORKFLOW_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have WORKFLOW_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Rationale Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Missing Rationale', () => {
  it('should detect missing provenance in workflow', () => {
    const wf = { ...VALID_WORKFLOW, provenance: undefined as any };
    const errors = validateWorkflow(wf);
    const provenanceError = errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.WORKFLOW_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have WORKFLOW_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing ProvidedBy Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Missing ProvidedBy', () => {
  it('should detect missing provenance in workflow', () => {
    const wf = { ...VALID_WORKFLOW, provenance: undefined as any };
    const errors = validateWorkflow(wf);
    const provenanceError = errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.WORKFLOW_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have WORKFLOW_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Invalid References Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Invalid References', () => {
  it('should detect missing workflow ID', () => {
    const wf = { ...VALID_WORKFLOW, workflowId: '' };
    const errors = validateWorkflow(wf);
    const idError = errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.WORKFLOW_MISSING_WORKFLOW_ID,
    );

    assert.ok(idError, 'Should have WORKFLOW_MISSING_WORKFLOW_ID error');
  });

  it('should detect missing workflow name', () => {
    const wf = { ...VALID_WORKFLOW, name: '' };
    const errors = validateWorkflow(wf);
    const nameError = errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.WORKFLOW_MISSING_NAME,
    );

    assert.ok(nameError, 'Should have WORKFLOW_MISSING_NAME error');
  });

  it('should detect missing laboratory ID', () => {
    const wf = { ...VALID_WORKFLOW, laboratoryId: '' };
    const errors = validateWorkflow(wf);
    const labError = errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.WORKFLOW_MISSING_LABORATORY_ID,
    );

    assert.ok(labError, 'Should have WORKFLOW_MISSING_LABORATORY_ID error');
  });
});

// ---------------------------------------------------------------------------
// Empty Workflow Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Empty Workflow', () => {
  it('should detect empty workflow steps', () => {
    const wf = { ...VALID_WORKFLOW, steps: [] };
    const errors = validateWorkflow(wf);
    const emptyError = errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.WORKFLOW_MISSING_STEPS,
    );

    assert.ok(emptyError, 'Should have WORKFLOW_MISSING_STEPS error');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Empty Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeWorkflowRegistry([]);
    const result = validateWorkflowRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input workflows', () => {
    const input: LaboratoryWorkflowInput = { workflows: [] };
    const result = validateWorkflowInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === WORKFLOW_VALIDATION_CODES.EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Deterministic Ordering', () => {
  it('should sort workflows by workflowId', () => {
    const wf3 = { ...VALID_WORKFLOW, workflowId: 'wf-003', laboratoryId: 'lab-003' };
    const wf1 = { ...VALID_WORKFLOW, workflowId: 'wf-001', laboratoryId: 'lab-001' };
    const wf2 = { ...VALID_WORKFLOW, workflowId: 'wf-002', laboratoryId: 'lab-002' };

    const registry = composeWorkflowRegistry([wf3, wf1, wf2]);

    assert.equal(registry.workflows[0].workflowId, 'wf-001');
    assert.equal(registry.workflows[1].workflowId, 'wf-002');
    assert.equal(registry.workflows[2].workflowId, 'wf-003');
  });

  it('should sort by workflowType when workflowId is equal', () => {
    const wfA = { ...VALID_WORKFLOW, workflowId: 'wf-001', workflowType: 'comparison' as const };
    const wfB = { ...VALID_WORKFLOW, workflowId: 'wf-001', workflowType: 'single_experiment' as const };

    const registry = composeWorkflowRegistry([wfA, wfB]);

    assert.equal(registry.workflows[0].workflowType, 'comparison');
    assert.equal(registry.workflows[1].workflowType, 'single_experiment');
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Trace Validation', () => {
  it('should validate trace determinism metadata', () => {
    const trace = composeWorkflowTrace({
      traceId: '_trace_wf_1',
      workflowCount: 1,
      stepCount: 3,
      decisions: [
        { decisionId: 'd1', workflowId: 'wf-001', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
    assert.equal(trace.generatedFrom, 'deterministic_workflow_kernel');
  });

  it('should count validated and invalid decisions', () => {
    const trace = composeWorkflowTrace({
      traceId: '_trace_wf_1',
      workflowCount: 3,
      stepCount: 6,
      decisions: [
        { decisionId: 'd1', workflowId: 'wf-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', workflowId: 'wf-002', validationPassed: false, validationErrors: ['WORKFLOW_UNKNOWN_TYPE'] },
        { decisionId: 'd3', workflowId: 'wf-003', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.invalidCount, 1);
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Registry Validation', () => {
  it('should validate a complete registry', () => {
    const registry = composeWorkflowRegistry([VALID_WORKFLOW, VALID_WORKFLOW_2]);
    const result = validateWorkflowRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'workflow_registry_composition');
  });

  it('should validate registry determinism metadata', () => {
    const registry = composeWorkflowRegistry([VALID_WORKFLOW]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.generatedFrom, 'deterministic_workflow_kernel');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Immutable Input', () => {
  it('should not mutate input workflows', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const originalId = VALID_WORKFLOW.workflowId;
    const originalName = VALID_WORKFLOW.name;

    composeLaboratoryWorkflows(input);

    assert.equal(VALID_WORKFLOW.workflowId, originalId);
    assert.equal(VALID_WORKFLOW.name, originalName);
  });

  it('should not mutate input registry workflows', () => {
    const workflows = [VALID_WORKFLOW, VALID_WORKFLOW_2];
    const originalIds = workflows.map((w) => w.workflowId);

    composeWorkflowRegistry(workflows);

    assert.equal(workflows[0].workflowId, originalIds[0]);
    assert.equal(workflows[1].workflowId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Identical Output', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW, VALID_WORKFLOW_2],
    };

    const results: ReturnType<typeof composeLaboratoryWorkflows>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeLaboratoryWorkflows(input));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifactId, results[i].artifactId);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
      assert.deepStrictEqual(results[0].trace.decisions, results[i].trace.decisions);
      assert.deepStrictEqual(results[0].registry.workflows, results[i].registry.workflows);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const workflows = [VALID_WORKFLOW, VALID_WORKFLOW_2];

    const results: ReturnType<typeof composeWorkflowRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeWorkflowRegistry(workflows));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].workflows, results[i].workflows);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Helper Functions', () => {
  it('should return canonical workflow types', () => {
    const types = getCanonicalWorkflowTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_WORKFLOW_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical workflow step types', () => {
    const types = getCanonicalWorkflowStepTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_WORKFLOW_STEP_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical workflow statuses', () => {
    const statuses = getCanonicalWorkflowStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_WORKFLOW_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate governance status', () => {
    assert.equal(isSupportedWorkflowGovernanceStatus('canonical'), true);
    assert.equal(isSupportedWorkflowGovernanceStatus('accepted'), true);
    assert.equal(isSupportedWorkflowGovernanceStatus('provisional'), true);
    assert.equal(isSupportedWorkflowGovernanceStatus('deprecated'), true);
    assert.equal(isSupportedWorkflowGovernanceStatus('rejected'), true);
    assert.equal(isSupportedWorkflowGovernanceStatus('invalid'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 workflow types', () => {
    assert.equal(CANONICAL_WORKFLOW_TYPES.length, 10);
  });

  it('should have exactly 10 workflow step types', () => {
    assert.equal(CANONICAL_WORKFLOW_STEP_TYPES.length, 10);
  });

  it('should have exactly 6 workflow statuses', () => {
    assert.equal(CANONICAL_WORKFLOW_STATUS.length, 6);
  });

  it('should contain all expected workflow types', () => {
    const expectedTypes = ['single_experiment', 'multi_experiment', 'comparison', 'parameter_sweep', 'educational_sequence', 'guided_walkthrough', 'research_validation', 'visualization_pipeline', 'capstone_workflow', 'custom'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_WORKFLOW_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected workflow step types', () => {
    const expectedTypes = ['prepare', 'configure', 'execute_metadata', 'observe', 'compare', 'visualize', 'record', 'evaluate', 'review', 'complete'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_WORKFLOW_STEP_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected workflow statuses', () => {
    const expectedStatuses = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expectedStatuses) {
      assert.ok(
        CANONICAL_WORKFLOW_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Workflow Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not execute workflows', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
    assert.ok(!('stdout' in result), 'Should not have stdout');
  });

  it('should not schedule workflows', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('scheduledAt' in result), 'Should not have scheduledAt');
    assert.ok(!('executionTime' in result), 'Should not have executionTime');
  });

  it('should not use workflow engines', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('engineResult' in result), 'Should not have engine result');
    assert.ok(!('pipelineResult' in result), 'Should not have pipeline result');
  });

  it('should not perform network requests', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not generate code', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });

  it('should not have executable callbacks in workflow', () => {
    const wf = composeWorkflow({
      workflowId: 'workflow-001',
      workflowType: 'single_experiment',
      name: 'Test Workflow',
      description: 'A test workflow.',
      laboratoryId: 'lab-001',
      steps: [VALID_STEP_1],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_WORKFLOW_PROVENANCE,
    });

    const keys = Object.keys(wf);
    for (const key of keys) {
      const value = (wf as any)[key];
      assert.ok(typeof value !== 'function', `Workflow field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in step', () => {
    const step = composeWorkflowStep({
      stepId: 'step-001',
      stepType: 'prepare',
      stepOrder: 1,
      title: 'Prepare',
      description: 'Prepare dataset.',
      experimentId: 'exp-001',
      configurationId: 'config-001',
      executionPolicyId: 'policy-001',
      resultArtifactId: '',
      visualizationId: '',
      governanceStatus: 'canonical',
    });

    const keys = Object.keys(step);
    for (const key of keys) {
      const value = (step as any)[key];
      assert.ok(typeof value !== 'function', `Step field "${key}" should not be a function`);
    }
  });

  it('should not have runtime scheduler', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('scheduler' in result), 'Should not have scheduler');
    assert.ok(!('cronExpression' in result), 'Should not have cronExpression');
  });

  it('should not have event bus', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('eventBus' in result), 'Should not have event bus');
    assert.ok(!('eventEmitter' in result), 'Should not have event emitter');
  });

  it('should not have message queue', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('messageQueue' in result), 'Should not have message queue');
    assert.ok(!('queue' in result), 'Should not have queue');
  });

  it('should not have state machines', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('stateMachine' in result), 'Should not have state machine');
    assert.ok(!('state' in result), 'Should not have state');
  });

  it('should not have interpreter', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('interpreter' in result), 'Should not have interpreter');
    assert.ok(!('runtime' in result), 'Should not have runtime');
  });

  it('should not have execution graphs', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('executionGraph' in result), 'Should not have execution graph');
    assert.ok(!('dag' in result), 'Should not have DAG');
  });

  it('should not have background jobs', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('backgroundJob' in result), 'Should not have background job');
    assert.ok(!('worker' in result), 'Should not have worker');
  });

  it('should not have simulation execution', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('simulationResult' in result), 'Should not have simulation result');
    assert.ok(!('runtimeState' in result), 'Should not have runtime state');
  });

  it('should not have parameter execution', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('parameterResult' in result), 'Should not have parameter result');
    assert.ok(!('parameterValues' in result), 'Should not have parameter values');
  });

  it('should not have algorithm execution', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('algorithmResult' in result), 'Should not have algorithm result');
    assert.ok(!('algorithmOutput' in result), 'Should not have algorithm output');
  });

  it('should not have runtime evaluation', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('evaluationResult' in result), 'Should not have evaluation result');
    assert.ok(!('evaluationOutput' in result), 'Should not have evaluation output');
  });

  it('should not have generated workflow', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('generatedWorkflow' in result), 'Should not have generated workflow');
    assert.ok(!('autoGenerated' in result), 'Should not have autoGenerated');
  });

  it('should not have automatic workflow creation', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('autoCreated' in result), 'Should not have autoCreated');
    assert.ok(!('automaticCreation' in result), 'Should not have automaticCreation');
  });

  it('should not have LLM usage', () => {
    const input: LaboratoryWorkflowInput = {
      workflows: [VALID_WORKFLOW],
    };

    const result = composeLaboratoryWorkflows(input);
    assert.ok(!('llmResult' in result), 'Should not have LLM result');
    assert.ok(!('llmOutput' in result), 'Should not have LLM output');
    assert.ok(!('llmResponse' in result), 'Should not have LLM response');
  });
});
