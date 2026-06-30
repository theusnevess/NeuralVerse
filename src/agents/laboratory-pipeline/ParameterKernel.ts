/**
 * NV-1600-D4-OPT-03 — Laboratory Parameter Space & Configuration Orchestration Kernel
 *
 * Deterministic orchestration functions for laboratory parameter metadata.
 * Produces parameters, constraints, groups, configurations, artifacts, traces, and registries.
 *
 * This module never:
 * - Executes laboratories
 * - Evaluates parameters
 * - Optimizes parameters
 * - Generates parameter values
 * - Infers defaults
 * - Infers best parameters
 * - Performs hyperparameter optimization
 * - Performs search
 * - Executes callbacks
 * - Evaluates expressions
 * - Generates code
 * - Generates scripts
 * - Accesses filesystem
 * - Accesses browser APIs
 * - Accesses network
 * - Mutates configuration
 * - Mutates registry
 *
 * Parameter metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryParameter,
  LaboratoryParameterConstraint,
  LaboratoryParameterGroup,
  LaboratoryConfiguration,
  LaboratoryConfigurationRegistry,
  LaboratoryConfigurationDecision,
  LaboratoryConfigurationTrace,
  LaboratoryConfigurationInput,
  LaboratoryArtifactWithConfiguration,
  LaboratoryConfigurationProvenance,
  LaboratoryParameterProvenance,
  LaboratoryParameterGroupProvenance,
  LaboratoryParameterType,
  LaboratoryParameterCategory,
  LaboratoryParameterConstraintType,
  LaboratoryConfigurationStatus,
  LaboratoryGovernanceStatus,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_PARAMETER_TYPES,
  CANONICAL_PARAMETER_CATEGORIES,
  CANONICAL_PARAMETER_CONSTRAINTS,
  CANONICAL_CONFIGURATION_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Parameter Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes parameter provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeParameterProvenance(params: {
  readonly parameterId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): LaboratoryParameterProvenance {
  return {
    parameterId: params.parameterId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Parameter Group Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes parameter group provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeParameterGroupProvenance(params: {
  readonly groupId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): LaboratoryParameterGroupProvenance {
  return {
    groupId: params.groupId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Configuration Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes configuration provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeConfigurationProvenance(params: {
  readonly configurationId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): LaboratoryConfigurationProvenance {
  return {
    configurationId: params.configurationId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Parameter Constraint Composition
// ---------------------------------------------------------------------------

/**
 * Composes a parameter constraint from provided parameters.
 * Pure function. No side effects.
 */
export function composeParameterConstraint(params: {
  readonly constraintId: string;
  readonly constraintType: LaboratoryParameterConstraintType;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly allowedValues?: readonly string[];
  readonly pattern?: string;
  readonly dependsOn?: string;
  readonly exclusiveWith?: readonly string[];
  readonly governanceStatus: LaboratoryGovernanceStatus;
}): LaboratoryParameterConstraint {
  return {
    constraintId: params.constraintId,
    constraintType: params.constraintType,
    minimum: params.minimum,
    maximum: params.maximum,
    allowedValues: params.allowedValues ? [...params.allowedValues] : undefined,
    pattern: params.pattern,
    dependsOn: params.dependsOn,
    exclusiveWith: params.exclusiveWith ? [...params.exclusiveWith] : undefined,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Parameter Composition
// ---------------------------------------------------------------------------

/**
 * Composes a parameter from provided parameters.
 * Pure function. No side effects.
 */
export function composeParameter(params: {
  readonly parameterId: string;
  readonly name: string;
  readonly description: string;
  readonly parameterType: LaboratoryParameterType;
  readonly parameterCategory: LaboratoryParameterCategory;
  readonly defaultValue: string;
  readonly constraints: readonly LaboratoryParameterConstraint[];
  readonly groupId: string;
  readonly required: boolean;
  readonly visible: boolean;
  readonly editable: boolean;
  readonly provenance: LaboratoryParameterProvenance;
}): LaboratoryParameter {
  return {
    parameterId: params.parameterId,
    name: params.name,
    description: params.description,
    parameterType: params.parameterType,
    parameterCategory: params.parameterCategory,
    defaultValue: params.defaultValue,
    constraints: [...params.constraints],
    groupId: params.groupId,
    required: params.required,
    visible: params.visible,
    editable: params.editable,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Parameter Group Composition
// ---------------------------------------------------------------------------

/**
 * Composes a parameter group from provided parameters.
 * Pure function. No side effects.
 */
export function composeParameterGroup(params: {
  readonly groupId: string;
  readonly name: string;
  readonly description: string;
  readonly parameterIds: readonly string[];
  readonly sortOrder: number;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryParameterGroupProvenance;
}): LaboratoryParameterGroup {
  return {
    groupId: params.groupId,
    name: params.name,
    description: params.description,
    parameterIds: [...params.parameterIds],
    sortOrder: params.sortOrder,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Configuration Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a configuration decision from validation results.
 * Pure function. No side effects.
 */
function _composeConfigurationDecision(
  configurationId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): LaboratoryConfigurationDecision {
  return {
    decisionId: `_decision_config_${configurationId}`,
    configurationId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Configuration Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a configuration trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeConfigurationTrace(params: {
  readonly traceId: string;
  readonly configurationCount: number;
  readonly parameterCount: number;
  readonly groupCount: number;
  readonly decisions: readonly LaboratoryConfigurationDecision[];
}): LaboratoryConfigurationTrace {
  return {
    traceId: params.traceId,
    configurationCount: params.configurationCount,
    parameterCount: params.parameterCount,
    groupCount: params.groupCount,
    validatedCount: params.decisions.filter((d) => d.validationPassed).length,
    invalidCount: params.decisions.filter((d) => !d.validationPassed).length,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_parameter_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Configuration Composition
// ---------------------------------------------------------------------------

/**
 * Composes a configuration from provided parameters.
 * Pure function. No side effects.
 */
export function composeConfiguration(params: {
  readonly configurationId: string;
  readonly laboratoryId: string;
  readonly parameterIds: readonly string[];
  readonly groupIds: readonly string[];
  readonly status: LaboratoryConfigurationStatus;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryConfigurationProvenance;
}): LaboratoryConfiguration {
  return {
    configurationId: params.configurationId,
    laboratoryId: params.laboratoryId,
    parameterIds: [...params.parameterIds],
    groupIds: [...params.groupIds],
    status: params.status,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for configurations.
 * Sorts by configurationId, then laboratoryId, then parameterGroup, then parameterId.
 * Pure function. No side effects.
 */
function _compareConfiguration(
  a: LaboratoryConfiguration,
  b: LaboratoryConfiguration,
): number {
  if (a.configurationId < b.configurationId) return -1;
  if (a.configurationId > b.configurationId) return 1;

  if (a.laboratoryId < b.laboratoryId) return -1;
  if (a.laboratoryId > b.laboratoryId) return 1;

  if ((a.groupIds ?? [])[0] < (b.groupIds ?? [])[0]) return -1;
  if ((a.groupIds ?? [])[0] > (b.groupIds ?? [])[0]) return 1;

  if ((a.parameterIds ?? [])[0] < (b.parameterIds ?? [])[0]) return -1;
  if ((a.parameterIds ?? [])[0] > (b.parameterIds ?? [])[0]) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Configuration Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a configuration registry from configurations, parameters, and groups.
 * Pure function. No side effects.
 * Deterministic ordering: configurationId → laboratoryId → parameterGroup → parameterId.
 */
export function composeConfigurationRegistry(
  configurations: readonly LaboratoryConfiguration[],
  parameters: readonly LaboratoryParameter[],
  groups: readonly LaboratoryParameterGroup[],
): LaboratoryConfigurationRegistry {
  const sortedConfigs = [...configurations].sort(_compareConfiguration);

  return {
    registryId: `_config_registry_${sortedConfigs.length}`,
    configurations: sortedConfigs,
    parameters: [...parameters],
    groups: [...groups],
    configurationCount: sortedConfigs.length,
    parameterCount: parameters.length,
    groupCount: groups.length,
    deterministic: true,
    generatedFrom: 'deterministic_parameter_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Configuration Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete laboratory configuration artifact from an input.
 * Pure function. No side effects.
 */
export function composeLaboratoryConfiguration(
  input: LaboratoryConfigurationInput,
): LaboratoryArtifactWithConfiguration {
  const decisions = input.configurations.map((config) => {
    const errors = _validateConfigurationForDecision(config);
    return _composeConfigurationDecision(config.configurationId, errors.length === 0, errors);
  });

  const trace = composeConfigurationTrace({
    traceId: `_trace_config_${input.configurations.length}`,
    configurationCount: input.configurations.length,
    parameterCount: input.parameters.length,
    groupCount: input.groups.length,
    decisions,
  });

  const registry = composeConfigurationRegistry(
    input.configurations,
    input.parameters,
    input.groups,
  );

  return {
    artifactId: `_artifact_config_${input.configurations.length}`,
    registry,
    trace,
  };
}

/**
 * Validates a configuration for decision composition.
 * Pure function. No side effects.
 */
function _validateConfigurationForDecision(
  config: LaboratoryConfiguration,
): readonly string[] {
  const errors: string[] = [];

  if (!config.configurationId || config.configurationId.trim() === '') {
    errors.push('CONFIG_MISSING_CONFIGURATION_ID');
  }

  if (!config.laboratoryId || config.laboratoryId.trim() === '') {
    errors.push('CONFIG_MISSING_LABORATORY_ID');
  }

  if (!config.status || !CANONICAL_CONFIGURATION_STATUS.includes(config.status)) {
    errors.push('CONFIGURATION_INVALID_STATUS');
  }

  if (!config.governanceStatus || !CANONICAL_GOVERNANCE_STATUSES.includes(config.governanceStatus)) {
    errors.push('CONFIGURATION_INVALID_GOVERNANCE');
  }

  if (!config.provenance) {
    errors.push('CONFIGURATION_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported parameter type.
 */
export function isSupportedParameterType(
  parameterType: string,
): parameterType is LaboratoryParameterType {
  return CANONICAL_PARAMETER_TYPES.includes(parameterType as LaboratoryParameterType);
}

/**
 * Checks if a string is a supported parameter category.
 */
export function isSupportedParameterCategory(
  parameterCategory: string,
): parameterCategory is LaboratoryParameterCategory {
  return CANONICAL_PARAMETER_CATEGORIES.includes(parameterCategory as LaboratoryParameterCategory);
}

/**
 * Checks if a string is a supported constraint type.
 */
export function isSupportedConstraintType(
  constraintType: string,
): constraintType is LaboratoryParameterConstraintType {
  return CANONICAL_PARAMETER_CONSTRAINTS.includes(constraintType as LaboratoryParameterConstraintType);
}

/**
 * Checks if a string is a supported configuration status.
 */
export function isSupportedConfigurationStatus(
  status: string,
): status is LaboratoryConfigurationStatus {
  return CANONICAL_CONFIGURATION_STATUS.includes(status as LaboratoryConfigurationStatus);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedParameterGovernanceStatus(
  governanceStatus: string,
): governanceStatus is LaboratoryGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(
    governanceStatus as LaboratoryGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical parameter types.
 */
export function getCanonicalParameterTypes(): readonly LaboratoryParameterType[] {
  return CANONICAL_PARAMETER_TYPES;
}

/**
 * Returns the canonical parameter categories.
 */
export function getCanonicalParameterCategories(): readonly LaboratoryParameterCategory[] {
  return CANONICAL_PARAMETER_CATEGORIES;
}

/**
 * Returns the canonical constraint types.
 */
export function getCanonicalConstraintTypes(): readonly LaboratoryParameterConstraintType[] {
  return CANONICAL_PARAMETER_CONSTRAINTS;
}

/**
 * Returns the canonical configuration statuses.
 */
export function getCanonicalConfigurationStatuses(): readonly LaboratoryConfigurationStatus[] {
  return CANONICAL_CONFIGURATION_STATUS;
}
