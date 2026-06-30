/**
 * NV-1600-D4-OPT-03 — Parameter Validation Layer
 *
 * Deterministic validation for parameter metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryParameter,
  LaboratoryParameterConstraint,
  LaboratoryParameterGroup,
  LaboratoryConfiguration,
  LaboratoryConfigurationRegistry,
  LaboratoryArtifactWithConfiguration,
  LaboratoryConfigurationInput,
  LaboratoryConfigurationValidationError,
  LaboratoryConfigurationValidationResult,
  LaboratoryConfigurationRegistryValidationResult,
  LaboratoryConfigurationArtifactValidationResult,
  LaboratoryConfigurationInputValidationResult,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_PARAMETER_TYPES,
  CANONICAL_PARAMETER_CATEGORIES,
  CANONICAL_PARAMETER_CONSTRAINTS,
  CANONICAL_CONFIGURATION_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const PARAMETER_VALIDATION_CODES = {
  PARAMETER_UNKNOWN_TYPE: 'PARAMETER_UNKNOWN_TYPE',
  PARAMETER_UNKNOWN_CATEGORY: 'PARAMETER_UNKNOWN_CATEGORY',
  PARAMETER_DUPLICATE_ID: 'PARAMETER_DUPLICATE_ID',
  PARAMETER_DUPLICATE_NAME: 'PARAMETER_DUPLICATE_NAME',
  PARAMETER_INVALID_DEFAULT: 'PARAMETER_INVALID_DEFAULT',
  PARAMETER_MISSING_PROVENANCE: 'PARAMETER_MISSING_PROVENANCE',
  PARAMETER_MISSING_SOURCE: 'PARAMETER_MISSING_SOURCE',
  PARAMETER_MISSING_RATIONALE: 'PARAMETER_MISSING_RATIONALE',
  PARAMETER_MISSING_PROVIDED_BY: 'PARAMETER_MISSING_PROVIDED_BY',
  CONSTRAINT_UNKNOWN_TYPE: 'CONSTRAINT_UNKNOWN_TYPE',
  CONSTRAINT_INVALID_REFERENCE: 'CONSTRAINT_INVALID_REFERENCE',
  GROUP_DUPLICATE_ID: 'GROUP_DUPLICATE_ID',
  GROUP_EMPTY: 'GROUP_EMPTY',
  CONFIGURATION_DUPLICATE_ID: 'CONFIGURATION_DUPLICATE_ID',
  CONFIGURATION_INVALID_REFERENCE: 'CONFIGURATION_INVALID_REFERENCE',
  CONFIGURATION_EMPTY: 'CONFIGURATION_EMPTY',
  CONFIGURATION_INVALID_STATUS: 'CONFIGURATION_INVALID_STATUS',
  CONFIGURATION_MISSING_PROVENANCE: 'CONFIGURATION_MISSING_PROVENANCE',
  REGISTRY_EMPTY: 'REGISTRY_EMPTY',
  TRACE_NOT_DETERMINISTIC: 'TRACE_NOT_DETERMINISTIC',
  TRACE_RANDOM_USED: 'TRACE_RANDOM_USED',
  TRACE_TIME_DEPENDENCY: 'TRACE_TIME_DEPENDENCY',
  TRACE_LABORATORY_MUTATED: 'TRACE_LABORATORY_MUTATED',
  CONFIGURATION_INVALID_GOVERNANCE: 'CONFIGURATION_INVALID_GOVERNANCE',
  PARAMETER_MISSING_ID: 'PARAMETER_MISSING_ID',
  PARAMETER_MISSING_NAME: 'PARAMETER_MISSING_NAME',
  PARAMETER_INVALID_GROUP: 'PARAMETER_INVALID_GROUP',
  CONSTRAINT_MISSING_ID: 'CONSTRAINT_MISSING_ID',
  CONSTRAINT_INVALID_GOVERNANCE: 'CONSTRAINT_INVALID_GOVERNANCE',
  GROUP_MISSING_ID: 'GROUP_MISSING_ID',
  GROUP_MISSING_NAME: 'GROUP_MISSING_NAME',
  GROUP_MISSING_PROVENANCE: 'GROUP_MISSING_PROVENANCE',
  GROUP_INVALID_GOVERNANCE: 'GROUP_INVALID_GOVERNANCE',
} as const;

// ---------------------------------------------------------------------------
// Single Parameter Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single parameter against canonical invariants.
 * Pure function. No side effects.
 */
export function validateParameter(
  param: LaboratoryParameter,
): readonly LaboratoryConfigurationValidationError[] {
  const errors: LaboratoryConfigurationValidationError[] = [];

  if (!param.parameterId || param.parameterId.trim() === '') {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.PARAMETER_MISSING_ID,
      message: 'Parameter is missing a parameter ID.',
      field: 'parameterId',
      parameterId: param.parameterId,
    });
  }

  if (!param.name || param.name.trim() === '') {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.PARAMETER_MISSING_NAME,
      message: 'Parameter is missing a name.',
      field: 'name',
      parameterId: param.parameterId,
    });
  }

  if (!param.description || param.description.trim() === '') {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.PARAMETER_INVALID_DEFAULT,
      message: 'Parameter is missing a description.',
      field: 'description',
      parameterId: param.parameterId,
    });
  }

  if (!CANONICAL_PARAMETER_TYPES.includes(param.parameterType)) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.PARAMETER_UNKNOWN_TYPE,
      message: `Parameter has unsupported type: "${param.parameterType}".`,
      field: 'parameterType',
      parameterId: param.parameterId,
    });
  }

  if (!CANONICAL_PARAMETER_CATEGORIES.includes(param.parameterCategory)) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.PARAMETER_UNKNOWN_CATEGORY,
      message: `Parameter has unsupported category: "${param.parameterCategory}".`,
      field: 'parameterCategory',
      parameterId: param.parameterId,
    });
  }

  if (!param.groupId || param.groupId.trim() === '') {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.PARAMETER_INVALID_GROUP,
      message: 'Parameter is missing a group ID.',
      field: 'groupId',
      parameterId: param.parameterId,
    });
  }

  if (!param.provenance) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.PARAMETER_MISSING_PROVENANCE,
      message: 'Parameter is missing provenance.',
      field: 'provenance',
      parameterId: param.parameterId,
    });
  } else {
    if (!param.provenance.source || param.provenance.source.trim() === '') {
      errors.push({
        code: PARAMETER_VALIDATION_CODES.PARAMETER_MISSING_SOURCE,
        message: 'Parameter provenance is missing a source.',
        field: 'provenance.source',
        parameterId: param.parameterId,
      });
    }

    if (!param.provenance.rationale || param.provenance.rationale.trim() === '') {
      errors.push({
        code: PARAMETER_VALIDATION_CODES.PARAMETER_MISSING_RATIONALE,
        message: 'Parameter provenance is missing a rationale.',
        field: 'provenance.rationale',
        parameterId: param.parameterId,
      });
    }

    if (!param.provenance.providedBy || param.provenance.providedBy.trim() === '') {
      errors.push({
        code: PARAMETER_VALIDATION_CODES.PARAMETER_MISSING_PROVIDED_BY,
        message: 'Parameter provenance is missing providedBy.',
        field: 'provenance.providedBy',
        parameterId: param.parameterId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Constraint Validation
// ---------------------------------------------------------------------------

/**
 * Validates a parameter constraint against canonical invariants.
 * Pure function. No side effects.
 */
export function validateConstraint(
  constraint: LaboratoryParameterConstraint,
): readonly LaboratoryConfigurationValidationError[] {
  const errors: LaboratoryConfigurationValidationError[] = [];

  if (!constraint.constraintId || constraint.constraintId.trim() === '') {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.CONSTRAINT_MISSING_ID,
      message: 'Constraint is missing a constraint ID.',
      field: 'constraintId',
    });
  }

  if (!CANONICAL_PARAMETER_CONSTRAINTS.includes(constraint.constraintType)) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.CONSTRAINT_UNKNOWN_TYPE,
      message: `Constraint has unsupported type: "${constraint.constraintType}".`,
      field: 'constraintType',
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(constraint.governanceStatus)) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.CONSTRAINT_INVALID_GOVERNANCE,
      message: `Constraint has invalid governance status: "${constraint.governanceStatus}".`,
      field: 'governanceStatus',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Parameter Group Validation
// ---------------------------------------------------------------------------

/**
 * Validates a parameter group against canonical invariants.
 * Pure function. No side effects.
 */
export function validateParameterGroup(
  group: LaboratoryParameterGroup,
): readonly LaboratoryConfigurationValidationError[] {
  const errors: LaboratoryConfigurationValidationError[] = [];

  if (!group.groupId || group.groupId.trim() === '') {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.GROUP_MISSING_ID,
      message: 'Group is missing a group ID.',
      field: 'groupId',
      groupId: group.groupId,
    });
  }

  if (!group.name || group.name.trim() === '') {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.GROUP_MISSING_NAME,
      message: 'Group is missing a name.',
      field: 'name',
      groupId: group.groupId,
    });
  }

  if (!group.description || group.description.trim() === '') {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.GROUP_EMPTY,
      message: 'Group is missing a description.',
      field: 'description',
      groupId: group.groupId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(group.governanceStatus)) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.GROUP_INVALID_GOVERNANCE,
      message: `Group has invalid governance status: "${group.governanceStatus}".`,
      field: 'governanceStatus',
      groupId: group.groupId,
    });
  }

  if (!group.provenance) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.GROUP_MISSING_PROVENANCE,
      message: 'Group is missing provenance.',
      field: 'provenance',
      groupId: group.groupId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Configuration Validation
// ---------------------------------------------------------------------------

/**
 * Validates a configuration against canonical invariants.
 * Pure function. No side effects.
 */
export function validateConfiguration(
  config: LaboratoryConfiguration,
): readonly LaboratoryConfigurationValidationError[] {
  const errors: LaboratoryConfigurationValidationError[] = [];

  if (!config.configurationId || config.configurationId.trim() === '') {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.CONFIGURATION_DUPLICATE_ID,
      message: 'Configuration is missing a configuration ID.',
      field: 'configurationId',
      configurationId: config.configurationId,
    });
  }

  if (!config.laboratoryId || config.laboratoryId.trim() === '') {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.CONFIGURATION_INVALID_REFERENCE,
      message: 'Configuration is missing a laboratory ID.',
      field: 'laboratoryId',
      configurationId: config.configurationId,
    });
  }

  if (!config.status || !CANONICAL_CONFIGURATION_STATUS.includes(config.status)) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.CONFIGURATION_INVALID_STATUS,
      message: `Configuration has invalid status: "${config.status}".`,
      field: 'status',
      configurationId: config.configurationId,
    });
  }

  if (!config.governanceStatus || !CANONICAL_GOVERNANCE_STATUSES.includes(config.governanceStatus)) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.CONFIGURATION_INVALID_GOVERNANCE,
      message: `Configuration has invalid governance status: "${config.governanceStatus}".`,
      field: 'governanceStatus',
      configurationId: config.configurationId,
    });
  }

  if (!config.provenance) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.CONFIGURATION_MISSING_PROVENANCE,
      message: 'Configuration is missing provenance.',
      field: 'provenance',
      configurationId: config.configurationId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Configuration Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a configuration registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateConfigurationRegistry(
  registry: LaboratoryConfigurationRegistry,
): LaboratoryConfigurationRegistryValidationResult {
  const errors: LaboratoryConfigurationValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.REGISTRY_EMPTY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.configurations || registry.configurations.length === 0) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.CONFIGURATION_EMPTY,
      message: 'Registry has no configurations.',
      field: 'configurations',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.TRACE_RANDOM_USED,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate configuration IDs
  const seenConfigIds = new Set<string>();
  for (const config of registry.configurations) {
    if (seenConfigIds.has(config.configurationId)) {
      errors.push({
        code: PARAMETER_VALIDATION_CODES.CONFIGURATION_DUPLICATE_ID,
        message: `Duplicate configuration ID: "${config.configurationId}".`,
        configurationId: config.configurationId,
      });
    }
    seenConfigIds.add(config.configurationId);
  }

  // Check for duplicate parameter IDs
  const seenParamIds = new Set<string>();
  for (const param of registry.parameters) {
    if (seenParamIds.has(param.parameterId)) {
      errors.push({
        code: PARAMETER_VALIDATION_CODES.PARAMETER_DUPLICATE_ID,
        message: `Duplicate parameter ID: "${param.parameterId}".`,
        parameterId: param.parameterId,
      });
    }
    seenParamIds.add(param.parameterId);
  }

  // Check for duplicate parameter names
  const seenParamNames = new Set<string>();
  for (const param of registry.parameters) {
    if (seenParamNames.has(param.name)) {
      errors.push({
        code: PARAMETER_VALIDATION_CODES.PARAMETER_DUPLICATE_NAME,
        message: `Duplicate parameter name: "${param.name}".`,
        field: 'name',
        parameterId: param.parameterId,
      });
    }
    seenParamNames.add(param.name);
  }

  // Check for duplicate group IDs
  const seenGroupIds = new Set<string>();
  for (const group of registry.groups) {
    if (seenGroupIds.has(group.groupId)) {
      errors.push({
        code: PARAMETER_VALIDATION_CODES.GROUP_DUPLICATE_ID,
        message: `Duplicate group ID: "${group.groupId}".`,
        groupId: group.groupId,
      });
    }
    seenGroupIds.add(group.groupId);
  }

  // Validate each configuration
  for (const config of registry.configurations) {
    errors.push(...validateConfiguration(config));
  }

  // Validate each parameter
  for (const param of registry.parameters) {
    errors.push(...validateParameter(param));
  }

  // Validate each group
  for (const group of registry.groups) {
    errors.push(...validateParameterGroup(group));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'configuration_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a laboratory artifact with configuration against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryArtifactWithConfiguration(
  artifact: LaboratoryArtifactWithConfiguration,
): LaboratoryConfigurationArtifactValidationResult {
  const errors: LaboratoryConfigurationValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.CONFIGURATION_INVALID_REFERENCE,
      message: 'Artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!artifact.registry) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.REGISTRY_EMPTY,
      message: 'Artifact is missing a registry.',
      field: 'registry',
    });
  } else {
    const registryResult = validateConfigurationRegistry(artifact.registry);
    errors.push(...registryResult.errors);
  }

  if (!artifact.trace) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Artifact is missing a trace.',
      field: 'trace',
    });
  } else {
    if (artifact.trace.deterministic !== true) {
      errors.push({
        code: PARAMETER_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (artifact.trace.randomUsed !== false) {
      errors.push({
        code: PARAMETER_VALIDATION_CODES.TRACE_RANDOM_USED,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (artifact.trace.timeDependency !== false) {
      errors.push({
        code: PARAMETER_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'configuration_artifact_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates configuration input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateConfigurationInput(
  input: LaboratoryConfigurationInput,
): LaboratoryConfigurationInputValidationResult {
  const errors: LaboratoryConfigurationValidationError[] = [];

  if (!input.configurations || input.configurations.length === 0) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.CONFIGURATION_EMPTY,
      message: 'Input has no configurations.',
      field: 'configurations',
    });
  } else {
    for (const config of input.configurations) {
      errors.push(...validateConfiguration(config));
    }
  }

  if (!input.parameters || input.parameters.length === 0) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.PARAMETER_MISSING_ID,
      message: 'Input has no parameters.',
      field: 'parameters',
    });
  } else {
    for (const param of input.parameters) {
      errors.push(...validateParameter(param));
    }
  }

  if (!input.groups || input.groups.length === 0) {
    errors.push({
      code: PARAMETER_VALIDATION_CODES.GROUP_EMPTY,
      message: 'Input has no groups.',
      field: 'groups',
    });
  } else {
    for (const group of input.groups) {
      errors.push(...validateParameterGroup(group));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'configuration_input_composition',
  };
}
