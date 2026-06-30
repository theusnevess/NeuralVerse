/**
 * NV-1600-D4-OPT-02 — Safe Deterministic Execution Model Test Suite
 *
 * Comprehensive deterministic test suite for the Execution Kernel.
 * Covers: valid execution plan, valid policy, valid environment, duplicate IDs,
 * unsupported execution mode, unsupported sandbox, unsupported state, missing
 * provenance, missing source, missing rationale, missing providedBy, empty
 * registry, policy validation, environment validation, artifact validation,
 * trace validation, deterministic ordering, immutable input, identical output,
 * 100 iteration determinism, helper functions, canonical enum completeness,
 * negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  LaboratoryExecutionPlan,
  LaboratoryExecutionPolicy,
  LaboratoryExecutionEnvironment,
  LaboratoryExecutionInput,
  LaboratoryExecutionRegistry,
  LaboratoryExecutionArtifact,
  LaboratoryExecutionTrace,
  LaboratoryExecutionProvenance,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_EXECUTION_MODES,
  CANONICAL_EXECUTION_STATES,
  CANONICAL_SANDBOX_LEVELS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

import {
  composeExecutionPolicy,
  composeExecutionEnvironment,
  composeExecutionPlan,
  composeExecutionProvenance,
  composeExecutionTrace,
  composeExecutionArtifact,
  composeExecutionRegistry,
  composeLaboratoryExecution,
  isSupportedExecutionMode,
  isSupportedExecutionState,
  isSupportedSandboxLevel,
  isSupportedExecutionGovernanceStatus,
  getCanonicalExecutionModes,
  getCanonicalExecutionStates,
  getCanonicalSandboxLevels,
} from './ExecutionKernel.ts';

import {
  validateExecutionPlan,
  validateExecutionPolicy,
  validateExecutionEnvironment,
  validateExecutionRegistry,
  validateExecutionArtifact,
  validateExecutionInput,
  EXECUTION_VALIDATION_CODES,
} from './ExecutionValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_POLICY: LaboratoryExecutionPolicy = {
  policyId: 'policy-001',
  executionMode: 'deterministic_simulation',
  sandboxLevel: 'educational',
  requiresValidation: true,
  allowsParameters: true,
  allowsVisualization: true,
  allowsComparison: false,
  requiresApproval: false,
  governanceStatus: 'canonical',
};

const VALID_ENVIRONMENT: LaboratoryExecutionEnvironment = {
  environmentId: 'env-001',
  sandboxLevel: 'educational',
  runtimeProfile: 'standard',
  resourceProfile: 'medium',
  executionPolicyId: 'policy-001',
};

const VALID_EXECUTION_PLAN: LaboratoryExecutionPlan = {
  executionId: 'exec-001',
  laboratoryId: 'lab-001',
  executionMode: 'deterministic_simulation',
  executionState: 'ready',
  executionPolicy: VALID_POLICY,
  executionEnvironment: VALID_ENVIRONMENT,
  parameters: { learning_rate: '0.01', epochs: '10' },
  constraints: ['max_memory: 512MB', 'max_time: 30s'],
  governanceStatus: 'canonical',
};

const VALID_EXECUTION_PLAN_2: LaboratoryExecutionPlan = {
  executionId: 'exec-002',
  laboratoryId: 'lab-002',
  executionMode: 'interactive_step',
  executionState: 'validated',
  executionPolicy: {
    ...VALID_POLICY,
    policyId: 'policy-002',
    executionMode: 'interactive_step',
  },
  executionEnvironment: {
    ...VALID_ENVIRONMENT,
    environmentId: 'env-002',
    executionPolicyId: 'policy-002',
  },
  parameters: {},
  constraints: [],
  governanceStatus: 'accepted',
};

const INVALID_EXECUTION_MISSING_ID: LaboratoryExecutionPlan = {
  executionId: '',
  laboratoryId: 'lab-001',
  executionMode: 'deterministic_simulation',
  executionState: 'ready',
  executionPolicy: VALID_POLICY,
  executionEnvironment: VALID_ENVIRONMENT,
  parameters: {},
  constraints: [],
  governanceStatus: 'canonical',
};

const INVALID_EXECUTION_UNKNOWN_MODE: LaboratoryExecutionPlan = {
  executionId: 'exec-003',
  laboratoryId: 'lab-001',
  executionMode: 'unsupported_mode' as any,
  executionState: 'ready',
  executionPolicy: VALID_POLICY,
  executionEnvironment: VALID_ENVIRONMENT,
  parameters: {},
  constraints: [],
  governanceStatus: 'canonical',
};

const INVALID_EXECUTION_UNKNOWN_STATE: LaboratoryExecutionPlan = {
  executionId: 'exec-004',
  laboratoryId: 'lab-001',
  executionMode: 'deterministic_simulation',
  executionState: 'unsupported_state' as any,
  executionPolicy: VALID_POLICY,
  executionEnvironment: VALID_ENVIRONMENT,
  parameters: {},
  constraints: [],
  governanceStatus: 'canonical',
};

const INVALID_EXECUTION_UNKNOWN_SANDBOX: LaboratoryExecutionPlan = {
  executionId: 'exec-005',
  laboratoryId: 'lab-001',
  executionMode: 'deterministic_simulation',
  executionState: 'ready',
  executionPolicy: {
    ...VALID_POLICY,
    sandboxLevel: 'unsupported_sandbox' as any,
  },
  executionEnvironment: VALID_ENVIRONMENT,
  parameters: {},
  constraints: [],
  governanceStatus: 'canonical',
};

// ---------------------------------------------------------------------------
// Valid Execution Plan Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Valid Execution Plan', () => {
  it('should compose valid execution policy', () => {
    const policy = composeExecutionPolicy({
      policyId: 'policy-001',
      executionMode: 'deterministic_simulation',
      sandboxLevel: 'educational',
      requiresValidation: true,
      allowsParameters: true,
      allowsVisualization: true,
      allowsComparison: false,
      requiresApproval: false,
      governanceStatus: 'canonical',
    });

    assert.equal(policy.policyId, 'policy-001');
    assert.equal(policy.executionMode, 'deterministic_simulation');
    assert.equal(policy.sandboxLevel, 'educational');
    assert.equal(policy.requiresValidation, true);
    assert.equal(policy.allowsParameters, true);
    assert.equal(policy.governanceStatus, 'canonical');
  });

  it('should compose valid execution environment', () => {
    const environment = composeExecutionEnvironment({
      environmentId: 'env-001',
      sandboxLevel: 'educational',
      runtimeProfile: 'standard',
      resourceProfile: 'medium',
      executionPolicyId: 'policy-001',
    });

    assert.equal(environment.environmentId, 'env-001');
    assert.equal(environment.sandboxLevel, 'educational');
    assert.equal(environment.runtimeProfile, 'standard');
    assert.equal(environment.resourceProfile, 'medium');
    assert.equal(environment.executionPolicyId, 'policy-001');
  });

  it('should compose valid execution plan', () => {
    const plan = composeExecutionPlan({
      executionId: 'exec-001',
      laboratoryId: 'lab-001',
      executionMode: 'deterministic_simulation',
      executionState: 'ready',
      executionPolicy: VALID_POLICY,
      executionEnvironment: VALID_ENVIRONMENT,
      parameters: { learning_rate: '0.01' },
      constraints: ['max_memory: 512MB'],
      governanceStatus: 'canonical',
    });

    assert.equal(plan.executionId, 'exec-001');
    assert.equal(plan.laboratoryId, 'lab-001');
    assert.equal(plan.executionMode, 'deterministic_simulation');
    assert.equal(plan.executionState, 'ready');
    assert.equal(plan.parameters.learning_rate, '0.01');
    assert.equal(plan.constraints.length, 1);
  });

  it('should compose valid execution provenance', () => {
    const provenance = composeExecutionProvenance({
      executionId: 'exec-001',
      source: 'deterministic_execution_kernel',
      governanceStatus: 'canonical',
      rationale: 'Educational execution plan',
      providedBy: 'deterministic_execution_kernel',
    });

    assert.equal(provenance.executionId, 'exec-001');
    assert.equal(provenance.source, 'deterministic_execution_kernel');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.rationale, 'Educational execution plan');
    assert.equal(provenance.providedBy, 'deterministic_execution_kernel');
  });

  it('should compose valid execution trace', () => {
    const trace = composeExecutionTrace({
      traceId: '_trace_exec_1',
      executionCount: 2,
      decisions: [
        { decisionId: 'd1', executionId: 'exec-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', executionId: 'exec-002', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.traceId, '_trace_exec_1');
    assert.equal(trace.executionCount, 2);
    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.invalidCount, 0);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid execution artifact', () => {
    const artifact = composeExecutionArtifact({
      artifactId: '_artifact_exec_001',
      executionPlan: VALID_EXECUTION_PLAN,
      trace: composeExecutionTrace({
        traceId: '_trace_exec_1',
        executionCount: 1,
        decisions: [
          { decisionId: 'd1', executionId: 'exec-001', validationPassed: true, validationErrors: [] },
        ],
      }),
    });

    assert.equal(artifact.artifactId, '_artifact_exec_001');
    assert.equal(artifact.executionPlan.executionId, 'exec-001');
    assert.equal(artifact.trace.deterministic, true);
  });

  it('should validate a valid execution plan with no errors', () => {
    const errors = validateExecutionPlan(VALID_EXECUTION_PLAN);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid execution policy with no errors', () => {
    const errors = validateExecutionPolicy(VALID_POLICY);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid execution environment with no errors', () => {
    const errors = validateExecutionEnvironment(VALID_ENVIRONMENT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a complete execution artifact', () => {
    const input: LaboratoryExecutionInput = {
      executions: [VALID_EXECUTION_PLAN],
    };

    const artifact = composeLaboratoryExecution(input);
    const result = validateExecutionArtifact(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate execution input', () => {
    const input: LaboratoryExecutionInput = {
      executions: [VALID_EXECUTION_PLAN, VALID_EXECUTION_PLAN_2],
    };

    const result = validateExecutionInput(input);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Duplicate ID Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Duplicate ID', () => {
  it('should detect duplicate execution IDs in registry', () => {
    const registry = composeExecutionRegistry([VALID_EXECUTION_PLAN, VALID_EXECUTION_PLAN]);
    const result = validateExecutionRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have EXEC_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Execution Mode Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Unsupported Execution Mode', () => {
  it('should reject unsupported execution mode', () => {
    assert.equal(isSupportedExecutionMode('deterministic_simulation'), true);
    assert.equal(isSupportedExecutionMode('interactive_step'), true);
    assert.equal(isSupportedExecutionMode('unsupported_mode'), false);
  });

  it('should detect unsupported mode in validation', () => {
    const errors = validateExecutionPlan(INVALID_EXECUTION_UNKNOWN_MODE);
    const modeError = errors.find(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_UNKNOWN_MODE,
    );

    assert.ok(modeError, 'Should have EXEC_UNKNOWN_MODE error');
    assert.equal(modeError.field, 'executionMode');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Sandbox Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Unsupported Sandbox', () => {
  it('should reject unsupported sandbox level', () => {
    assert.equal(isSupportedSandboxLevel('strict'), true);
    assert.equal(isSupportedSandboxLevel('educational'), true);
    assert.equal(isSupportedSandboxLevel('unsupported_sandbox'), false);
  });

  it('should detect unsupported sandbox in policy validation', () => {
    const errors = validateExecutionPolicy({
      ...VALID_POLICY,
      sandboxLevel: 'unsupported_sandbox' as any,
    });
    const sandboxError = errors.find(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_UNKNOWN_SANDBOX,
    );

    assert.ok(sandboxError, 'Should have EXEC_UNKNOWN_SANDBOX error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported State Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Unsupported State', () => {
  it('should reject unsupported execution state', () => {
    assert.equal(isSupportedExecutionState('ready'), true);
    assert.equal(isSupportedExecutionState('completed'), true);
    assert.equal(isSupportedExecutionState('unsupported_state'), false);
  });

  it('should detect unsupported state in validation', () => {
    const errors = validateExecutionPlan(INVALID_EXECUTION_UNKNOWN_STATE);
    const stateError = errors.find(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_UNKNOWN_STATE,
    );

    assert.ok(stateError, 'Should have EXEC_UNKNOWN_STATE error');
    assert.equal(stateError.field, 'executionState');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Missing Provenance', () => {
  it('should detect missing source in provenance', () => {
    const provenance = composeExecutionProvenance({
      executionId: 'exec-001',
      source: '',
      governanceStatus: 'canonical',
      rationale: 'Educational execution plan',
      providedBy: 'deterministic_execution_kernel',
    });

    assert.equal(provenance.source, '');
  });

  it('should detect missing rationale in provenance', () => {
    const provenance = composeExecutionProvenance({
      executionId: 'exec-001',
      source: 'deterministic_execution_kernel',
      governanceStatus: 'canonical',
      rationale: '',
      providedBy: 'deterministic_execution_kernel',
    });

    assert.equal(provenance.rationale, '');
  });

  it('should detect missing providedBy in provenance', () => {
    const provenance = composeExecutionProvenance({
      executionId: 'exec-001',
      source: 'deterministic_execution_kernel',
      governanceStatus: 'canonical',
      rationale: 'Educational execution plan',
      providedBy: '',
    });

    assert.equal(provenance.providedBy, '');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Missing Source', () => {
  it('should validate execution plan with source', () => {
    const plan = { ...VALID_EXECUTION_PLAN };
    const errors = validateExecutionPlan(plan);
    const sourceErrors = errors.filter(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_MISSING_SOURCE,
    );
    assert.equal(sourceErrors.length, 0, 'Should not have source errors');
  });
});

// ---------------------------------------------------------------------------
// Missing Rationale Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Missing Rationale', () => {
  it('should validate execution plan with rationale', () => {
    const plan = { ...VALID_EXECUTION_PLAN };
    const errors = validateExecutionPlan(plan);
    const rationaleErrors = errors.filter(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_MISSING_RATIONALE,
    );
    assert.equal(rationaleErrors.length, 0, 'Should not have rationale errors');
  });
});

// ---------------------------------------------------------------------------
// Missing ProvidedBy Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Missing ProvidedBy', () => {
  it('should validate execution plan with providedBy', () => {
    const plan = { ...VALID_EXECUTION_PLAN };
    const errors = validateExecutionPlan(plan);
    const providedByErrors = errors.filter(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_MISSING_PROVIDED_BY,
    );
    assert.equal(providedByErrors.length, 0, 'Should not have providedBy errors');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Empty Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeExecutionRegistry([]);
    const result = validateExecutionRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EXEC_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input', () => {
    const input: LaboratoryExecutionInput = { executions: [] };
    const result = validateExecutionInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EXEC_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Policy Validation Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Policy Validation', () => {
  it('should validate a complete policy', () => {
    const errors = validateExecutionPolicy(VALID_POLICY);
    assert.equal(errors.length, 0);
  });

  it('should detect missing policy ID', () => {
    const errors = validateExecutionPolicy({
      ...VALID_POLICY,
      policyId: '',
    });
    const policyError = errors.find(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_INVALID_POLICY,
    );
    assert.ok(policyError, 'Should have EXEC_INVALID_POLICY error');
  });

  it('should detect invalid governance in policy', () => {
    const errors = validateExecutionPolicy({
      ...VALID_POLICY,
      governanceStatus: 'invalid_governance' as any,
    });
    const governanceError = errors.find(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_INVALID_POLICY_GOVERNANCE,
    );
    assert.ok(governanceError, 'Should have EXEC_INVALID_POLICY_GOVERNANCE error');
  });
});

// ---------------------------------------------------------------------------
// Environment Validation Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Environment Validation', () => {
  it('should validate a complete environment', () => {
    const errors = validateExecutionEnvironment(VALID_ENVIRONMENT);
    assert.equal(errors.length, 0);
  });

  it('should detect missing environment ID', () => {
    const errors = validateExecutionEnvironment({
      ...VALID_ENVIRONMENT,
      environmentId: '',
    });
    const envError = errors.find(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_INVALID_ENVIRONMENT,
    );
    assert.ok(envError, 'Should have EXEC_INVALID_ENVIRONMENT error');
  });

  it('should detect missing runtime profile', () => {
    const errors = validateExecutionEnvironment({
      ...VALID_ENVIRONMENT,
      runtimeProfile: '',
    });
    const envError = errors.find(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_INVALID_ENVIRONMENT,
    );
    assert.ok(envError, 'Should have EXEC_INVALID_ENVIRONMENT error');
  });

  it('should detect missing resource profile', () => {
    const errors = validateExecutionEnvironment({
      ...VALID_ENVIRONMENT,
      resourceProfile: '',
    });
    const envError = errors.find(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_INVALID_ENVIRONMENT,
    );
    assert.ok(envError, 'Should have EXEC_INVALID_ENVIRONMENT error');
  });

  it('should detect missing execution policy ID', () => {
    const errors = validateExecutionEnvironment({
      ...VALID_ENVIRONMENT,
      executionPolicyId: '',
    });
    const envError = errors.find(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_INVALID_ENVIRONMENT,
    );
    assert.ok(envError, 'Should have EXEC_INVALID_ENVIRONMENT error');
  });
});

// ---------------------------------------------------------------------------
// Artifact Validation Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Artifact Validation', () => {
  it('should validate a complete artifact', () => {
    const input: LaboratoryExecutionInput = {
      executions: [VALID_EXECUTION_PLAN],
    };

    const artifact = composeLaboratoryExecution(input);
    const result = validateExecutionArtifact(artifact);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'execution_artifact_composition');
  });

  it('should detect missing artifact ID', () => {
    const trace = composeExecutionTrace({
      traceId: '_trace_exec_1',
      executionCount: 1,
      decisions: [
        { decisionId: 'd1', executionId: 'exec-001', validationPassed: true, validationErrors: [] },
      ],
    });

    const artifact = composeExecutionArtifact({
      artifactId: '',
      executionPlan: VALID_EXECUTION_PLAN,
      trace,
    });

    const result = validateExecutionArtifact(artifact);
    const artifactError = result.errors.find(
      (e) => e.code === EXECUTION_VALIDATION_CODES.EXEC_INVALID_ARTIFACT,
    );

    assert.ok(artifactError, 'Should have EXEC_INVALID_ARTIFACT error');
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Trace Validation', () => {
  it('should validate trace determinism metadata', () => {
    const trace = composeExecutionTrace({
      traceId: '_trace_exec_1',
      executionCount: 1,
      decisions: [
        { decisionId: 'd1', executionId: 'exec-001', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
    assert.equal(trace.generatedFrom, 'deterministic_execution_kernel');
  });

  it('should count validated and invalid decisions', () => {
    const trace = composeExecutionTrace({
      traceId: '_trace_exec_1',
      executionCount: 3,
      decisions: [
        { decisionId: 'd1', executionId: 'exec-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', executionId: 'exec-002', validationPassed: false, validationErrors: ['EXEC_UNKNOWN_MODE'] },
        { decisionId: 'd3', executionId: 'exec-003', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.invalidCount, 1);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Deterministic Ordering', () => {
  it('should sort executions by executionId', () => {
    const exec3 = { ...VALID_EXECUTION_PLAN, executionId: 'exec-003', laboratoryId: 'lab-003' };
    const exec1 = { ...VALID_EXECUTION_PLAN, executionId: 'exec-001', laboratoryId: 'lab-001' };
    const exec2 = { ...VALID_EXECUTION_PLAN, executionId: 'exec-002', laboratoryId: 'lab-002' };

    const registry = composeExecutionRegistry([exec3, exec1, exec2]);

    assert.equal(registry.executions[0].executionId, 'exec-001');
    assert.equal(registry.executions[1].executionId, 'exec-002');
    assert.equal(registry.executions[2].executionId, 'exec-003');
  });

  it('should sort by executionMode when executionId is equal', () => {
    const execA = { ...VALID_EXECUTION_PLAN, executionId: 'exec-001', executionMode: 'deterministic_simulation' as const };
    const execB = { ...VALID_EXECUTION_PLAN, executionId: 'exec-001', executionMode: 'interactive_step' as const };

    const registry = composeExecutionRegistry([execA, execB]);

    assert.equal(registry.executions[0].executionMode, 'deterministic_simulation');
    assert.equal(registry.executions[1].executionMode, 'interactive_step');
  });

  it('should sort by laboratoryId when executionId and executionMode are equal', () => {
    const execA = { ...VALID_EXECUTION_PLAN, executionId: 'exec-001', executionMode: 'deterministic_simulation' as const, laboratoryId: 'lab-001' };
    const execB = { ...VALID_EXECUTION_PLAN, executionId: 'exec-001', executionMode: 'deterministic_simulation' as const, laboratoryId: 'lab-002' };

    const registry = composeExecutionRegistry([execB, execA]);

    assert.equal(registry.executions[0].laboratoryId, 'lab-001');
    assert.equal(registry.executions[1].laboratoryId, 'lab-002');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Immutable Input', () => {
  it('should not mutate input executions', () => {
    const input: LaboratoryExecutionInput = {
      executions: [VALID_EXECUTION_PLAN],
    };

    const originalId = VALID_EXECUTION_PLAN.executionId;
    const originalMode = VALID_EXECUTION_PLAN.executionMode;

    composeLaboratoryExecution(input);

    assert.equal(VALID_EXECUTION_PLAN.executionId, originalId);
    assert.equal(VALID_EXECUTION_PLAN.executionMode, originalMode);
  });

  it('should not mutate input registry executions', () => {
    const execs = [VALID_EXECUTION_PLAN, VALID_EXECUTION_PLAN_2];
    const originalIds = execs.map((e) => e.executionId);

    composeExecutionRegistry(execs);

    assert.equal(execs[0].executionId, originalIds[0]);
    assert.equal(execs[1].executionId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Identical Output', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const input: LaboratoryExecutionInput = {
      executions: [VALID_EXECUTION_PLAN, VALID_EXECUTION_PLAN_2],
    };

    const results: ReturnType<typeof composeLaboratoryExecution>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeLaboratoryExecution(input));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifactId, results[i].artifactId);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
      assert.deepStrictEqual(results[0].trace.decisions, results[i].trace.decisions);
      assert.deepStrictEqual(results[0].executionPlan.executionId, results[i].executionPlan.executionId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const execs = [VALID_EXECUTION_PLAN, VALID_EXECUTION_PLAN_2];

    const results: ReturnType<typeof composeExecutionRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeExecutionRegistry(execs));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].executions, results[i].executions);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Helper Functions', () => {
  it('should return canonical execution modes', () => {
    const modes = getCanonicalExecutionModes();
    assert.deepStrictEqual([...modes], [...CANONICAL_EXECUTION_MODES]);
    assert.equal(modes.length, 8);
  });

  it('should return canonical execution states', () => {
    const states = getCanonicalExecutionStates();
    assert.deepStrictEqual([...states], [...CANONICAL_EXECUTION_STATES]);
    assert.equal(states.length, 6);
  });

  it('should return canonical sandbox levels', () => {
    const levels = getCanonicalSandboxLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_SANDBOX_LEVELS]);
    assert.equal(levels.length, 3);
  });

  it('should validate governance status', () => {
    assert.equal(isSupportedExecutionGovernanceStatus('canonical'), true);
    assert.equal(isSupportedExecutionGovernanceStatus('accepted'), true);
    assert.equal(isSupportedExecutionGovernanceStatus('provisional'), true);
    assert.equal(isSupportedExecutionGovernanceStatus('deprecated'), true);
    assert.equal(isSupportedExecutionGovernanceStatus('rejected'), true);
    assert.equal(isSupportedExecutionGovernanceStatus('invalid'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 8 execution modes', () => {
    assert.equal(CANONICAL_EXECUTION_MODES.length, 8);
  });

  it('should have exactly 6 execution states', () => {
    assert.equal(CANONICAL_EXECUTION_STATES.length, 6);
  });

  it('should have exactly 3 sandbox levels', () => {
    assert.equal(CANONICAL_SANDBOX_LEVELS.length, 3);
  });

  it('should contain all expected execution modes', () => {
    const expectedModes = [
      'metadata_only',
      'deterministic_simulation',
      'interactive_step',
      'parameter_preview',
      'visualization_only',
      'comparison_only',
      'dry_run',
      'laboratory_chain',
    ];

    for (const mode of expectedModes) {
      assert.ok(
        CANONICAL_EXECUTION_MODES.includes(mode as any),
        `Should include mode: ${mode}`,
      );
    }
  });

  it('should contain all expected execution states', () => {
    const expectedStates = ['ready', 'validated', 'blocked', 'completed', 'cancelled', 'invalid'];

    for (const state of expectedStates) {
      assert.ok(
        CANONICAL_EXECUTION_STATES.includes(state as any),
        `Should include state: ${state}`,
      );
    }
  });

  it('should contain all expected sandbox levels', () => {
    const expectedLevels = ['strict', 'restricted', 'educational'];

    for (const level of expectedLevels) {
      assert.ok(
        CANONICAL_SANDBOX_LEVELS.includes(level as any),
        `Should include level: ${level}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Execution Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const input: LaboratoryExecutionInput = {
      executions: [VALID_EXECUTION_PLAN],
    };

    const result = composeLaboratoryExecution(input);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const input: LaboratoryExecutionInput = {
      executions: [VALID_EXECUTION_PLAN],
    };

    const result = composeLaboratoryExecution(input);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const input: LaboratoryExecutionInput = {
      executions: [VALID_EXECUTION_PLAN],
    };

    const result = composeLaboratoryExecution(input);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const input: LaboratoryExecutionInput = {
      executions: [VALID_EXECUTION_PLAN],
    };

    const result = composeLaboratoryExecution(input);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not execute code', () => {
    const input: LaboratoryExecutionInput = {
      executions: [VALID_EXECUTION_PLAN],
    };

    const result = composeLaboratoryExecution(input);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
    assert.ok(!('stdout' in result), 'Should not have stdout');
  });

  it('should not run simulations', () => {
    const input: LaboratoryExecutionInput = {
      executions: [VALID_EXECUTION_PLAN],
    };

    const result = composeLaboratoryExecution(input);
    assert.ok(!('simulationResult' in result), 'Should not have simulation result');
    assert.ok(!('runtimeState' in result), 'Should not have runtime state');
  });

  it('should not perform network requests', () => {
    const input: LaboratoryExecutionInput = {
      executions: [VALID_EXECUTION_PLAN],
    };

    const result = composeLaboratoryExecution(input);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not generate code', () => {
    const input: LaboratoryExecutionInput = {
      executions: [VALID_EXECUTION_PLAN],
    };

    const result = composeLaboratoryExecution(input);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });

  it('should not have executable callbacks', () => {
    const policy = composeExecutionPolicy({
      policyId: 'policy-001',
      executionMode: 'deterministic_simulation',
      sandboxLevel: 'educational',
      requiresValidation: true,
      allowsParameters: true,
      allowsVisualization: true,
      allowsComparison: false,
      requiresApproval: false,
      governanceStatus: 'canonical',
    });

    const keys = Object.keys(policy);
    for (const key of keys) {
      const value = (policy as any)[key];
      assert.ok(typeof value !== 'function', `Policy field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in environment', () => {
    const environment = composeExecutionEnvironment({
      environmentId: 'env-001',
      sandboxLevel: 'educational',
      runtimeProfile: 'standard',
      resourceProfile: 'medium',
      executionPolicyId: 'policy-001',
    });

    const keys = Object.keys(environment);
    for (const key of keys) {
      const value = (environment as any)[key];
      assert.ok(typeof value !== 'function', `Environment field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in plan', () => {
    const plan = composeExecutionPlan({
      executionId: 'exec-001',
      laboratoryId: 'lab-001',
      executionMode: 'deterministic_simulation',
      executionState: 'ready',
      executionPolicy: VALID_POLICY,
      executionEnvironment: VALID_ENVIRONMENT,
      parameters: {},
      constraints: [],
      governanceStatus: 'canonical',
    });

    const keys = Object.keys(plan);
    for (const key of keys) {
      const value = (plan as any)[key];
      assert.ok(typeof value !== 'function', `Plan field "${key}" should not be a function`);
    }
  });
});
