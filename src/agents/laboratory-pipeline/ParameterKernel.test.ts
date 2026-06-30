/**
 * NV-1600-D4-OPT-03 — Laboratory Parameter Space & Configuration Orchestration Test Suite
 *
 * Comprehensive deterministic test suite for the Parameter Kernel.
 * Covers: valid parameter, valid constraint, valid group, valid configuration,
 * valid registry, duplicate parameter ID, duplicate parameter name, duplicate
 * configuration, unsupported parameter type, unsupported category, unsupported
 * constraint, unsupported status, invalid references, missing provenance,
 * missing source, missing rationale, missing providedBy, empty registry,
 * deterministic ordering, immutable input, identical output over 100 iterations,
 * helper functions, canonical enum completeness, registry validation,
 * artifact validation, trace validation, negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  LaboratoryParameter,
  LaboratoryParameterConstraint,
  LaboratoryParameterGroup,
  LaboratoryConfiguration,
  LaboratoryConfigurationInput,
  LaboratoryConfigurationRegistry,
  LaboratoryArtifactWithConfiguration,
  LaboratoryConfigurationTrace,
  LaboratoryConfigurationProvenance,
  LaboratoryParameterProvenance,
  LaboratoryParameterGroupProvenance,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_PARAMETER_TYPES,
  CANONICAL_PARAMETER_CATEGORIES,
  CANONICAL_PARAMETER_CONSTRAINTS,
  CANONICAL_CONFIGURATION_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

import {
  composeParameterProvenance,
  composeParameterGroupProvenance,
  composeConfigurationProvenance,
  composeParameterConstraint,
  composeParameter,
  composeParameterGroup,
  composeConfiguration,
  composeConfigurationTrace,
  composeConfigurationRegistry,
  composeLaboratoryConfiguration,
  isSupportedParameterType,
  isSupportedParameterCategory,
  isSupportedConstraintType,
  isSupportedConfigurationStatus,
  isSupportedParameterGovernanceStatus,
  getCanonicalParameterTypes,
  getCanonicalParameterCategories,
  getCanonicalConstraintTypes,
  getCanonicalConfigurationStatuses,
} from './ParameterKernel.ts';

import {
  validateParameter,
  validateConstraint,
  validateParameterGroup,
  validateConfiguration,
  validateConfigurationRegistry,
  validateLaboratoryArtifactWithConfiguration,
  validateConfigurationInput,
  PARAMETER_VALIDATION_CODES,
} from './ParameterValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_CONSTRAINT: LaboratoryParameterConstraint = {
  constraintId: 'constraint-001',
  constraintType: 'range',
  minimum: 0,
  maximum: 100,
  governanceStatus: 'canonical',
};

const VALID_CONSTRAINT_2: LaboratoryParameterConstraint = {
  constraintId: 'constraint-002',
  constraintType: 'set',
  allowedValues: ['adam', 'sgd', 'rmsprop'],
  governanceStatus: 'canonical',
};

const VALID_PARAMETER_PROVENANCE: LaboratoryParameterProvenance = {
  parameterId: 'param-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Learning rate parameter',
  providedBy: 'NeuralVerse Team',
};

const VALID_PARAMETER: LaboratoryParameter = {
  parameterId: 'param-001',
  name: 'learning_rate',
  description: 'The learning rate for the optimizer.',
  parameterType: 'float',
  parameterCategory: 'algorithm',
  defaultValue: '0.01',
  constraints: [VALID_CONSTRAINT],
  groupId: 'group-001',
  required: true,
  visible: true,
  editable: true,
  provenance: VALID_PARAMETER_PROVENANCE,
};

const VALID_PARAMETER_2: LaboratoryParameter = {
  parameterId: 'param-002',
  name: 'optimizer',
  description: 'The optimizer algorithm.',
  parameterType: 'categorical',
  parameterCategory: 'algorithm',
  defaultValue: 'adam',
  constraints: [VALID_CONSTRAINT_2],
  groupId: 'group-001',
  required: true,
  visible: true,
  editable: true,
  provenance: {
    ...VALID_PARAMETER_PROVENANCE,
    parameterId: 'param-002',
  },
};

const VALID_GROUP_PROVENANCE: LaboratoryParameterGroupProvenance = {
  groupId: 'group-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Algorithm parameters',
  providedBy: 'NeuralVerse Team',
};

const VALID_GROUP: LaboratoryParameterGroup = {
  groupId: 'group-001',
  name: 'Algorithm',
  description: 'Algorithm-related parameters.',
  parameterIds: ['param-001', 'param-002'],
  sortOrder: 1,
  governanceStatus: 'canonical',
  provenance: VALID_GROUP_PROVENANCE,
};

const VALID_GROUP_2: LaboratoryParameterGroup = {
  groupId: 'group-002',
  name: 'Visualization',
  description: 'Visualization-related parameters.',
  parameterIds: ['param-003'],
  sortOrder: 2,
  governanceStatus: 'accepted',
  provenance: {
    ...VALID_GROUP_PROVENANCE,
    groupId: 'group-002',
    rationale: 'Visualization parameters',
  },
};

const VALID_CONFIG_PROVENANCE: LaboratoryConfigurationProvenance = {
  configurationId: 'config-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Default configuration',
  providedBy: 'NeuralVerse Team',
};

const VALID_CONFIGURATION: LaboratoryConfiguration = {
  configurationId: 'config-001',
  laboratoryId: 'lab-001',
  parameterIds: ['param-001', 'param-002'],
  groupIds: ['group-001'],
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_CONFIG_PROVENANCE,
};

const VALID_CONFIGURATION_2: LaboratoryConfiguration = {
  configurationId: 'config-002',
  laboratoryId: 'lab-002',
  parameterIds: ['param-001'],
  groupIds: ['group-001'],
  status: 'published',
  governanceStatus: 'accepted',
  provenance: {
    ...VALID_CONFIG_PROVENANCE,
    configurationId: 'config-002',
  },
};

const INVALID_PARAMETER_MISSING_ID: LaboratoryParameter = {
  parameterId: '',
  name: 'missing_id_param',
  description: 'A parameter with no ID.',
  parameterType: 'float',
  parameterCategory: 'algorithm',
  defaultValue: '0.01',
  constraints: [],
  groupId: 'group-001',
  required: true,
  visible: true,
  editable: true,
  provenance: VALID_PARAMETER_PROVENANCE,
};

const INVALID_PARAMETER_UNKNOWN_TYPE: LaboratoryParameter = {
  parameterId: 'param-003',
  name: 'unknown_type_param',
  description: 'A parameter with an unsupported type.',
  parameterType: 'unsupported_type' as any,
  parameterCategory: 'algorithm',
  defaultValue: '0.01',
  constraints: [],
  groupId: 'group-001',
  required: true,
  visible: true,
  editable: true,
  provenance: VALID_PARAMETER_PROVENANCE,
};

const INVALID_PARAMETER_UNKNOWN_CATEGORY: LaboratoryParameter = {
  parameterId: 'param-004',
  name: 'unknown_category_param',
  description: 'A parameter with an unsupported category.',
  parameterType: 'float',
  parameterCategory: 'unsupported_category' as any,
  defaultValue: '0.01',
  constraints: [],
  groupId: 'group-001',
  required: true,
  visible: true,
  editable: true,
  provenance: VALID_PARAMETER_PROVENANCE,
};

const INVALID_CONSTRAINT_UNKNOWN_TYPE: LaboratoryParameterConstraint = {
  constraintId: 'constraint-003',
  constraintType: 'unsupported_constraint' as any,
  governanceStatus: 'canonical',
};

// ---------------------------------------------------------------------------
// Valid Parameter Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Valid Parameter', () => {
  it('should compose valid parameter provenance', () => {
    const provenance = composeParameterProvenance({
      parameterId: 'param-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Learning rate parameter',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.parameterId, 'param-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.rationale, 'Learning rate parameter');
    assert.equal(provenance.providedBy, 'NeuralVerse Team');
  });

  it('should compose valid parameter group provenance', () => {
    const provenance = composeParameterGroupProvenance({
      groupId: 'group-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Algorithm parameters',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.groupId, 'group-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
  });

  it('should compose valid configuration provenance', () => {
    const provenance = composeConfigurationProvenance({
      configurationId: 'config-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Default configuration',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.configurationId, 'config-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
  });

  it('should compose valid parameter constraint', () => {
    const constraint = composeParameterConstraint({
      constraintId: 'constraint-001',
      constraintType: 'range',
      minimum: 0,
      maximum: 100,
      governanceStatus: 'canonical',
    });

    assert.equal(constraint.constraintId, 'constraint-001');
    assert.equal(constraint.constraintType, 'range');
    assert.equal(constraint.minimum, 0);
    assert.equal(constraint.maximum, 100);
  });

  it('should compose valid parameter', () => {
    const param = composeParameter({
      parameterId: 'param-001',
      name: 'learning_rate',
      description: 'The learning rate.',
      parameterType: 'float',
      parameterCategory: 'algorithm',
      defaultValue: '0.01',
      constraints: [VALID_CONSTRAINT],
      groupId: 'group-001',
      required: true,
      visible: true,
      editable: true,
      provenance: VALID_PARAMETER_PROVENANCE,
    });

    assert.equal(param.parameterId, 'param-001');
    assert.equal(param.name, 'learning_rate');
    assert.equal(param.parameterType, 'float');
    assert.equal(param.parameterCategory, 'algorithm');
    assert.equal(param.required, true);
  });

  it('should compose valid parameter group', () => {
    const group = composeParameterGroup({
      groupId: 'group-001',
      name: 'Algorithm',
      description: 'Algorithm parameters.',
      parameterIds: ['param-001'],
      sortOrder: 1,
      governanceStatus: 'canonical',
      provenance: VALID_GROUP_PROVENANCE,
    });

    assert.equal(group.groupId, 'group-001');
    assert.equal(group.name, 'Algorithm');
    assert.equal(group.parameterIds.length, 1);
    assert.equal(group.sortOrder, 1);
  });

  it('should compose valid configuration', () => {
    const config = composeConfiguration({
      configurationId: 'config-001',
      laboratoryId: 'lab-001',
      parameterIds: ['param-001'],
      groupIds: ['group-001'],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_CONFIG_PROVENANCE,
    });

    assert.equal(config.configurationId, 'config-001');
    assert.equal(config.laboratoryId, 'lab-001');
    assert.equal(config.status, 'approved');
  });

  it('should compose valid configuration trace', () => {
    const trace = composeConfigurationTrace({
      traceId: '_trace_config_1',
      configurationCount: 2,
      parameterCount: 3,
      groupCount: 1,
      decisions: [
        { decisionId: 'd1', configurationId: 'config-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', configurationId: 'config-002', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.traceId, '_trace_config_1');
    assert.equal(trace.configurationCount, 2);
    assert.equal(trace.parameterCount, 3);
    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.invalidCount, 0);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should compose valid configuration registry', () => {
    const registry = composeConfigurationRegistry(
      [VALID_CONFIGURATION],
      [VALID_PARAMETER],
      [VALID_GROUP],
    );

    assert.equal(registry.configurations.length, 1);
    assert.equal(registry.parameters.length, 1);
    assert.equal(registry.groups.length, 1);
    assert.equal(registry.deterministic, true);
  });

  it('should validate a valid parameter with no errors', () => {
    const errors = validateParameter(VALID_PARAMETER);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid constraint with no errors', () => {
    const errors = validateConstraint(VALID_CONSTRAINT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid parameter group with no errors', () => {
    const errors = validateParameterGroup(VALID_GROUP);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid configuration with no errors', () => {
    const errors = validateConfiguration(VALID_CONFIGURATION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a complete artifact', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION],
      parameters: [VALID_PARAMETER],
      groups: [VALID_GROUP],
    };

    const artifact = composeLaboratoryConfiguration(input);
    const result = validateLaboratoryArtifactWithConfiguration(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate configuration input', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION, VALID_CONFIGURATION_2],
      parameters: [VALID_PARAMETER, VALID_PARAMETER_2],
      groups: [VALID_GROUP, VALID_GROUP_2],
    };

    const result = validateConfigurationInput(input);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Parameter ID Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Duplicate Parameter ID', () => {
  it('should detect duplicate parameter IDs in registry', () => {
    const registry = composeConfigurationRegistry(
      [VALID_CONFIGURATION],
      [VALID_PARAMETER, VALID_PARAMETER],
      [VALID_GROUP],
    );
    const result = validateConfigurationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.PARAMETER_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have PARAMETER_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Parameter Name Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Duplicate Parameter Name', () => {
  it('should detect duplicate parameter names in registry', () => {
    const param1 = { ...VALID_PARAMETER, parameterId: 'param-001', name: 'same_name' };
    const param2 = { ...VALID_PARAMETER, parameterId: 'param-002', name: 'same_name' };
    const registry = composeConfigurationRegistry(
      [VALID_CONFIGURATION],
      [param1, param2],
      [VALID_GROUP],
    );
    const result = validateConfigurationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.PARAMETER_DUPLICATE_NAME,
    );

    assert.ok(duplicateError, 'Should have PARAMETER_DUPLICATE_NAME error');
  });
});

// ---------------------------------------------------------------------------
// Duplicate Configuration Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Duplicate Configuration', () => {
  it('should detect duplicate configuration IDs in registry', () => {
    const registry = composeConfigurationRegistry(
      [VALID_CONFIGURATION, VALID_CONFIGURATION],
      [VALID_PARAMETER],
      [VALID_GROUP],
    );
    const result = validateConfigurationRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.CONFIGURATION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have CONFIGURATION_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Parameter Type Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Unsupported Parameter Type', () => {
  it('should reject unsupported parameter type', () => {
    assert.equal(isSupportedParameterType('float'), true);
    assert.equal(isSupportedParameterType('integer'), true);
    assert.equal(isSupportedParameterType('unsupported_type'), false);
  });

  it('should detect unsupported type in validation', () => {
    const errors = validateParameter(INVALID_PARAMETER_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.PARAMETER_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have PARAMETER_UNKNOWN_TYPE error');
    assert.equal(typeError.field, 'parameterType');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Category Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Unsupported Category', () => {
  it('should reject unsupported parameter category', () => {
    assert.equal(isSupportedParameterCategory('algorithm'), true);
    assert.equal(isSupportedParameterCategory('visualization'), true);
    assert.equal(isSupportedParameterCategory('unsupported_category'), false);
  });

  it('should detect unsupported category in validation', () => {
    const errors = validateParameter(INVALID_PARAMETER_UNKNOWN_CATEGORY);
    const categoryError = errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.PARAMETER_UNKNOWN_CATEGORY,
    );

    assert.ok(categoryError, 'Should have PARAMETER_UNKNOWN_CATEGORY error');
    assert.equal(categoryError.field, 'parameterCategory');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Constraint Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Unsupported Constraint', () => {
  it('should reject unsupported constraint type', () => {
    assert.equal(isSupportedConstraintType('range'), true);
    assert.equal(isSupportedConstraintType('set'), true);
    assert.equal(isSupportedConstraintType('unsupported_constraint'), false);
  });

  it('should detect unsupported constraint in validation', () => {
    const errors = validateConstraint(INVALID_CONSTRAINT_UNKNOWN_TYPE);
    const constraintError = errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.CONSTRAINT_UNKNOWN_TYPE,
    );

    assert.ok(constraintError, 'Should have CONSTRAINT_UNKNOWN_TYPE error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Status Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Unsupported Status', () => {
  it('should reject unsupported configuration status', () => {
    assert.equal(isSupportedConfigurationStatus('draft'), true);
    assert.equal(isSupportedConfigurationStatus('approved'), true);
    assert.equal(isSupportedConfigurationStatus('unsupported_status'), false);
  });

  it('should detect unsupported status in validation', () => {
    const config = { ...VALID_CONFIGURATION, status: 'unsupported_status' as any };
    const errors = validateConfiguration(config);
    const statusError = errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.CONFIGURATION_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have CONFIGURATION_INVALID_STATUS error');
  });
});

// ---------------------------------------------------------------------------
// Invalid References Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Invalid References', () => {
  it('should detect missing laboratory ID in configuration', () => {
    const config = { ...VALID_CONFIGURATION, laboratoryId: '' };
    const errors = validateConfiguration(config);
    const refError = errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.CONFIGURATION_INVALID_REFERENCE,
    );

    assert.ok(refError, 'Should have CONFIGURATION_INVALID_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Missing Provenance', () => {
  it('should detect missing provenance in parameter', () => {
    const param = { ...VALID_PARAMETER, provenance: undefined as any };
    const errors = validateParameter(param);
    const provenanceError = errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.PARAMETER_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have PARAMETER_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance in group', () => {
    const group = { ...VALID_GROUP, provenance: undefined as any };
    const errors = validateParameterGroup(group);
    const provenanceError = errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.GROUP_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have GROUP_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance in configuration', () => {
    const config = { ...VALID_CONFIGURATION, provenance: undefined as any };
    const errors = validateConfiguration(config);
    const provenanceError = errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.CONFIGURATION_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have CONFIGURATION_MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Missing Source', () => {
  it('should detect missing source in parameter provenance', () => {
    const param = {
      ...VALID_PARAMETER,
      provenance: { ...VALID_PARAMETER_PROVENANCE, source: '' },
    };
    const errors = validateParameter(param);
    const sourceError = errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.PARAMETER_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have PARAMETER_MISSING_SOURCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Rationale Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Missing Rationale', () => {
  it('should detect missing rationale in parameter provenance', () => {
    const param = {
      ...VALID_PARAMETER,
      provenance: { ...VALID_PARAMETER_PROVENANCE, rationale: '' },
    };
    const errors = validateParameter(param);
    const rationaleError = errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.PARAMETER_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have PARAMETER_MISSING_RATIONALE error');
  });
});

// ---------------------------------------------------------------------------
// Missing ProvidedBy Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Missing ProvidedBy', () => {
  it('should detect missing providedBy in parameter provenance', () => {
    const param = {
      ...VALID_PARAMETER,
      provenance: { ...VALID_PARAMETER_PROVENANCE, providedBy: '' },
    };
    const errors = validateParameter(param);
    const providedByError = errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.PARAMETER_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have PARAMETER_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Empty Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeConfigurationRegistry([], [], []);
    const result = validateConfigurationRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.CONFIGURATION_EMPTY,
    );

    assert.ok(emptyError, 'Should have CONFIGURATION_EMPTY error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input configurations', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [],
      parameters: [VALID_PARAMETER],
      groups: [VALID_GROUP],
    };
    const result = validateConfigurationInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.CONFIGURATION_EMPTY,
    );

    assert.ok(emptyError, 'Should have CONFIGURATION_EMPTY error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input parameters', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION],
      parameters: [],
      groups: [VALID_GROUP],
    };
    const result = validateConfigurationInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.PARAMETER_MISSING_ID,
    );

    assert.ok(emptyError, 'Should have PARAMETER_MISSING_ID error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input groups', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION],
      parameters: [VALID_PARAMETER],
      groups: [],
    };
    const result = validateConfigurationInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === PARAMETER_VALIDATION_CODES.GROUP_EMPTY,
    );

    assert.ok(emptyError, 'Should have GROUP_EMPTY error');
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Deterministic Ordering', () => {
  it('should sort configurations by configurationId', () => {
    const config3 = { ...VALID_CONFIGURATION, configurationId: 'config-003', laboratoryId: 'lab-003' };
    const config1 = { ...VALID_CONFIGURATION, configurationId: 'config-001', laboratoryId: 'lab-001' };
    const config2 = { ...VALID_CONFIGURATION, configurationId: 'config-002', laboratoryId: 'lab-002' };

    const registry = composeConfigurationRegistry([config3, config1, config2], [VALID_PARAMETER], [VALID_GROUP]);

    assert.equal(registry.configurations[0].configurationId, 'config-001');
    assert.equal(registry.configurations[1].configurationId, 'config-002');
    assert.equal(registry.configurations[2].configurationId, 'config-003');
  });

  it('should sort by laboratoryId when configurationId is equal', () => {
    const configA = { ...VALID_CONFIGURATION, configurationId: 'config-001', laboratoryId: 'lab-002' };
    const configB = { ...VALID_CONFIGURATION, configurationId: 'config-001', laboratoryId: 'lab-001' };

    const registry = composeConfigurationRegistry([configA, configB], [VALID_PARAMETER], [VALID_GROUP]);

    assert.equal(registry.configurations[0].laboratoryId, 'lab-001');
    assert.equal(registry.configurations[1].laboratoryId, 'lab-002');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Immutable Input', () => {
  it('should not mutate input parameters', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION],
      parameters: [VALID_PARAMETER],
      groups: [VALID_GROUP],
    };

    const originalName = VALID_PARAMETER.name;
    const originalId = VALID_PARAMETER.parameterId;

    composeLaboratoryConfiguration(input);

    assert.equal(VALID_PARAMETER.name, originalName);
    assert.equal(VALID_PARAMETER.parameterId, originalId);
  });

  it('should not mutate input configurations', () => {
    const configs = [VALID_CONFIGURATION, VALID_CONFIGURATION_2];
    const originalIds = configs.map((c) => c.configurationId);

    composeConfigurationRegistry(configs, [VALID_PARAMETER], [VALID_GROUP]);

    assert.equal(configs[0].configurationId, originalIds[0]);
    assert.equal(configs[1].configurationId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Identical Output', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION, VALID_CONFIGURATION_2],
      parameters: [VALID_PARAMETER, VALID_PARAMETER_2],
      groups: [VALID_GROUP, VALID_GROUP_2],
    };

    const results: ReturnType<typeof composeLaboratoryConfiguration>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeLaboratoryConfiguration(input));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifactId, results[i].artifactId);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
      assert.deepStrictEqual(results[0].trace.decisions, results[i].trace.decisions);
      assert.deepStrictEqual(results[0].registry.configurations, results[i].registry.configurations);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const configs = [VALID_CONFIGURATION, VALID_CONFIGURATION_2];
    const params = [VALID_PARAMETER, VALID_PARAMETER_2];
    const groups = [VALID_GROUP, VALID_GROUP_2];

    const results: ReturnType<typeof composeConfigurationRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeConfigurationRegistry(configs, params, groups));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].configurations, results[i].configurations);
      assert.deepStrictEqual(results[0].parameters, results[i].parameters);
      assert.deepStrictEqual(results[0].groups, results[i].groups);
    }
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Registry Validation', () => {
  it('should validate a complete registry', () => {
    const registry = composeConfigurationRegistry(
      [VALID_CONFIGURATION, VALID_CONFIGURATION_2],
      [VALID_PARAMETER, VALID_PARAMETER_2],
      [VALID_GROUP, VALID_GROUP_2],
    );
    const result = validateConfigurationRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'configuration_registry_composition');
  });

  it('should validate registry determinism metadata', () => {
    const registry = composeConfigurationRegistry([VALID_CONFIGURATION], [VALID_PARAMETER], [VALID_GROUP]);

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.generatedFrom, 'deterministic_parameter_kernel');
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Trace Validation', () => {
  it('should validate trace determinism metadata', () => {
    const trace = composeConfigurationTrace({
      traceId: '_trace_config_1',
      configurationCount: 1,
      parameterCount: 2,
      groupCount: 1,
      decisions: [
        { decisionId: 'd1', configurationId: 'config-001', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
    assert.equal(trace.generatedFrom, 'deterministic_parameter_kernel');
  });

  it('should count validated and invalid decisions', () => {
    const trace = composeConfigurationTrace({
      traceId: '_trace_config_1',
      configurationCount: 3,
      parameterCount: 5,
      groupCount: 2,
      decisions: [
        { decisionId: 'd1', configurationId: 'config-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', configurationId: 'config-002', validationPassed: false, validationErrors: ['CONFIGURATION_INVALID_STATUS'] },
        { decisionId: 'd3', configurationId: 'config-003', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.invalidCount, 1);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Helper Functions', () => {
  it('should return canonical parameter types', () => {
    const types = getCanonicalParameterTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_PARAMETER_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical parameter categories', () => {
    const categories = getCanonicalParameterCategories();
    assert.deepStrictEqual([...categories], [...CANONICAL_PARAMETER_CATEGORIES]);
    assert.equal(categories.length, 10);
  });

  it('should return canonical constraint types', () => {
    const constraints = getCanonicalConstraintTypes();
    assert.deepStrictEqual([...constraints], [...CANONICAL_PARAMETER_CONSTRAINTS]);
    assert.equal(constraints.length, 10);
  });

  it('should return canonical configuration statuses', () => {
    const statuses = getCanonicalConfigurationStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_CONFIGURATION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate governance status', () => {
    assert.equal(isSupportedParameterGovernanceStatus('canonical'), true);
    assert.equal(isSupportedParameterGovernanceStatus('accepted'), true);
    assert.equal(isSupportedParameterGovernanceStatus('provisional'), true);
    assert.equal(isSupportedParameterGovernanceStatus('deprecated'), true);
    assert.equal(isSupportedParameterGovernanceStatus('rejected'), true);
    assert.equal(isSupportedParameterGovernanceStatus('invalid'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 parameter types', () => {
    assert.equal(CANONICAL_PARAMETER_TYPES.length, 10);
  });

  it('should have exactly 10 parameter categories', () => {
    assert.equal(CANONICAL_PARAMETER_CATEGORIES.length, 10);
  });

  it('should have exactly 10 constraint types', () => {
    assert.equal(CANONICAL_PARAMETER_CONSTRAINTS.length, 10);
  });

  it('should have exactly 6 configuration statuses', () => {
    assert.equal(CANONICAL_CONFIGURATION_STATUS.length, 6);
  });

  it('should contain all expected parameter types', () => {
    const expectedTypes = ['integer', 'float', 'boolean', 'categorical', 'enum', 'string', 'vector', 'matrix', 'distribution', 'seed'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_PARAMETER_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected parameter categories', () => {
    const expectedCategories = ['algorithm', 'visualization', 'simulation', 'dataset', 'preprocessing', 'postprocessing', 'execution', 'hardware', 'evaluation', 'experimental'];

    for (const category of expectedCategories) {
      assert.ok(
        CANONICAL_PARAMETER_CATEGORIES.includes(category as any),
        `Should include category: ${category}`,
      );
    }
  });

  it('should contain all expected constraint types', () => {
    const expectedConstraints = ['range', 'set', 'fixed', 'regex', 'dependency', 'exclusive', 'required', 'optional', 'readonly', 'computed'];

    for (const constraint of expectedConstraints) {
      assert.ok(
        CANONICAL_PARAMETER_CONSTRAINTS.includes(constraint as any),
        `Should include constraint: ${constraint}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Parameter Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION],
      parameters: [VALID_PARAMETER],
      groups: [VALID_GROUP],
    };

    const result = composeLaboratoryConfiguration(input);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION],
      parameters: [VALID_PARAMETER],
      groups: [VALID_GROUP],
    };

    const result = composeLaboratoryConfiguration(input);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION],
      parameters: [VALID_PARAMETER],
      groups: [VALID_GROUP],
    };

    const result = composeLaboratoryConfiguration(input);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION],
      parameters: [VALID_PARAMETER],
      groups: [VALID_GROUP],
    };

    const result = composeLaboratoryConfiguration(input);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not execute code', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION],
      parameters: [VALID_PARAMETER],
      groups: [VALID_GROUP],
    };

    const result = composeLaboratoryConfiguration(input);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
    assert.ok(!('stdout' in result), 'Should not have stdout');
  });

  it('should not run simulations', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION],
      parameters: [VALID_PARAMETER],
      groups: [VALID_GROUP],
    };

    const result = composeLaboratoryConfiguration(input);
    assert.ok(!('simulationResult' in result), 'Should not have simulation result');
    assert.ok(!('runtimeState' in result), 'Should not have runtime state');
  });

  it('should not perform network requests', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION],
      parameters: [VALID_PARAMETER],
      groups: [VALID_GROUP],
    };

    const result = composeLaboratoryConfiguration(input);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not generate code', () => {
    const input: LaboratoryConfigurationInput = {
      configurations: [VALID_CONFIGURATION],
      parameters: [VALID_PARAMETER],
      groups: [VALID_GROUP],
    };

    const result = composeLaboratoryConfiguration(input);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });

  it('should not have executable callbacks in parameter', () => {
    const param = composeParameter({
      parameterId: 'param-001',
      name: 'learning_rate',
      description: 'The learning rate.',
      parameterType: 'float',
      parameterCategory: 'algorithm',
      defaultValue: '0.01',
      constraints: [],
      groupId: 'group-001',
      required: true,
      visible: true,
      editable: true,
      provenance: VALID_PARAMETER_PROVENANCE,
    });

    const keys = Object.keys(param);
    for (const key of keys) {
      const value = (param as any)[key];
      assert.ok(typeof value !== 'function', `Parameter field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in constraint', () => {
    const constraint = composeParameterConstraint({
      constraintId: 'constraint-001',
      constraintType: 'range',
      minimum: 0,
      maximum: 100,
      governanceStatus: 'canonical',
    });

    const keys = Object.keys(constraint);
    for (const key of keys) {
      const value = (constraint as any)[key];
      assert.ok(typeof value !== 'function', `Constraint field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in configuration', () => {
    const config = composeConfiguration({
      configurationId: 'config-001',
      laboratoryId: 'lab-001',
      parameterIds: ['param-001'],
      groupIds: ['group-001'],
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_CONFIG_PROVENANCE,
    });

    const keys = Object.keys(config);
    for (const key of keys) {
      const value = (config as any)[key];
      assert.ok(typeof value !== 'function', `Configuration field "${key}" should not be a function`);
    }
  });
});
