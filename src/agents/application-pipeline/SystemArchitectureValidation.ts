/**
 * NV-1900-D7-OPT-03 — System Architecture Validation Layer
 *
 * Deterministic validation for system architecture metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  SystemArchitecture,
  SystemComponent,
  SystemDataFlow,
  SystemConstraint,
  ArchitectureRegistry,
  ArchitectureTrace,
  ArchitectureInput,
  ArchitectureValidationError,
  ArchitectureRegistryValidationResult,
  ArchitectureInputValidationResult,
  ArchitectureTraceValidationResult,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_SYSTEM_ARCHITECTURE_TYPES,
  CANONICAL_SYSTEM_COMPONENT_TYPES,
  CANONICAL_DATA_FLOW_TYPES,
  CANONICAL_ARCHITECTURE_LAYER_TYPES,
  CANONICAL_SYSTEM_CONSTRAINT_TYPES,
  CANONICAL_SYSTEM_ARCHITECTURE_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const ARCHITECTURE_VALIDATION_CODES = {
  ARCHITECTURE_DUPLICATE_ID: 'ARCHITECTURE_DUPLICATE_ID',
  ARCHITECTURE_DUPLICATE_TITLE: 'ARCHITECTURE_DUPLICATE_TITLE',
  ARCHITECTURE_COMPONENT_DUPLICATE_ID: 'ARCHITECTURE_COMPONENT_DUPLICATE_ID',
  ARCHITECTURE_FLOW_DUPLICATE_ID: 'ARCHITECTURE_FLOW_DUPLICATE_ID',
  ARCHITECTURE_CONSTRAINT_DUPLICATE_ID: 'ARCHITECTURE_CONSTRAINT_DUPLICATE_ID',
  ARCHITECTURE_INVALID_TYPE: 'ARCHITECTURE_INVALID_TYPE',
  ARCHITECTURE_INVALID_COMPONENT_TYPE: 'ARCHITECTURE_INVALID_COMPONENT_TYPE',
  ARCHITECTURE_INVALID_FLOW_TYPE: 'ARCHITECTURE_INVALID_FLOW_TYPE',
  ARCHITECTURE_INVALID_LAYER_TYPE: 'ARCHITECTURE_INVALID_LAYER_TYPE',
  ARCHITECTURE_INVALID_CONSTRAINT_TYPE: 'ARCHITECTURE_INVALID_CONSTRAINT_TYPE',
  ARCHITECTURE_INVALID_STATUS: 'ARCHITECTURE_INVALID_STATUS',
  ARCHITECTURE_INVALID_GOVERNANCE: 'ARCHITECTURE_INVALID_GOVERNANCE',
  ARCHITECTURE_MISSING_PROVENANCE: 'ARCHITECTURE_MISSING_PROVENANCE',
  ARCHITECTURE_MISSING_RATIONALE: 'ARCHITECTURE_MISSING_RATIONALE',
  ARCHITECTURE_MISSING_PROVIDER: 'ARCHITECTURE_MISSING_PROVIDER',
  ARCHITECTURE_MISSING_APPLICATION_REFERENCE: 'ARCHITECTURE_MISSING_APPLICATION_REFERENCE',
  ARCHITECTURE_MISSING_KNOWLEDGE_REFERENCE: 'ARCHITECTURE_MISSING_KNOWLEDGE_REFERENCE',
  ARCHITECTURE_MISSING_ARCHITECTURE_ID: 'ARCHITECTURE_MISSING_ARCHITECTURE_ID',
  ARCHITECTURE_MISSING_COMPONENT_ID: 'ARCHITECTURE_MISSING_COMPONENT_ID',
  ARCHITECTURE_MISSING_FLOW_ID: 'ARCHITECTURE_MISSING_FLOW_ID',
  ARCHITECTURE_MISSING_CONSTRAINT_ID: 'ARCHITECTURE_MISSING_CONSTRAINT_ID',
  ARCHITECTURE_MISSING_TITLE: 'ARCHITECTURE_MISSING_TITLE',
  ARCHITECTURE_BROKEN_COMPONENT_REFERENCE: 'ARCHITECTURE_BROKEN_COMPONENT_REFERENCE',
  ARCHITECTURE_BROKEN_FLOW_REFERENCE: 'ARCHITECTURE_BROKEN_FLOW_REFERENCE',
  ARCHITECTURE_BROKEN_CONSTRAINT_REFERENCE: 'ARCHITECTURE_BROKEN_CONSTRAINT_REFERENCE',
  ARCHITECTURE_SELF_FLOW: 'ARCHITECTURE_SELF_FLOW',
  ARCHITECTURE_EMPTY_REGISTRY: 'ARCHITECTURE_EMPTY_REGISTRY',
  ARCHITECTURE_INVALID_TRACE: 'ARCHITECTURE_INVALID_TRACE',
  ARCHITECTURE_REGISTRY_INCONSISTENCY: 'ARCHITECTURE_REGISTRY_INCONSISTENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Architecture Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single system architecture against canonical invariants.
 * Pure function. No side effects.
 */
export function validateSystemArchitecture(
  architecture: SystemArchitecture,
): readonly ArchitectureValidationError[] {
  const errors: ArchitectureValidationError[] = [];

  if (!architecture.architectureId || architecture.architectureId.trim() === '') {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_ARCHITECTURE_ID,
      message: 'System architecture is missing an architecture ID.',
      field: 'architectureId',
      architectureId: architecture.architectureId,
    });
  }

  if (!architecture.title || architecture.title.trim() === '') {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_TITLE,
      message: 'System architecture is missing a title.',
      field: 'title',
      architectureId: architecture.architectureId,
    });
  }

  if (!CANONICAL_SYSTEM_ARCHITECTURE_TYPES.includes(architecture.architectureType)) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_TYPE,
      message: `System architecture has unsupported type: "${architecture.architectureType}".`,
      field: 'architectureType',
      architectureId: architecture.architectureId,
    });
  }

  if (!CANONICAL_SYSTEM_ARCHITECTURE_STATUS.includes(architecture.status)) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_STATUS,
      message: `System architecture has unsupported status: "${architecture.status}".`,
      field: 'status',
      architectureId: architecture.architectureId,
    });
  }

  if (!architecture.applicationArtifactId || architecture.applicationArtifactId.trim() === '') {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_APPLICATION_REFERENCE,
      message: 'System architecture is missing applicationArtifactId.',
      field: 'applicationArtifactId',
      architectureId: architecture.architectureId,
    });
  }

  if (!architecture.knowledgeArtifactId || architecture.knowledgeArtifactId.trim() === '') {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_KNOWLEDGE_REFERENCE,
      message: 'System architecture is missing knowledgeArtifactId.',
      field: 'knowledgeArtifactId',
      architectureId: architecture.architectureId,
    });
  }

  if (!architecture.provenance) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_PROVENANCE,
      message: 'System architecture is missing provenance.',
      field: 'provenance',
      architectureId: architecture.architectureId,
    });
  } else {
    if (!architecture.provenance.providedBy || architecture.provenance.providedBy.trim() === '') {
      errors.push({
        code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_PROVIDER,
        message: 'Architecture provenance is missing providedBy.',
        field: 'provenance.providedBy',
        architectureId: architecture.architectureId,
      });
    }

    if (!architecture.provenance.rationale || architecture.provenance.rationale.trim() === '') {
      errors.push({
        code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_RATIONALE,
        message: 'Architecture provenance is missing rationale.',
        field: 'provenance.rationale',
        architectureId: architecture.architectureId,
      });
    }

    if (!CANONICAL_APPLICATION_GOVERNANCE.includes(architecture.provenance.governanceStatus)) {
      errors.push({
        code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_GOVERNANCE,
        message: `Architecture provenance has invalid governance status: "${architecture.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        architectureId: architecture.architectureId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// System Component Validation
// ---------------------------------------------------------------------------

/**
 * Validates a system component against canonical invariants.
 * Pure function. No side effects.
 */
export function validateSystemComponent(
  component: SystemComponent,
): readonly ArchitectureValidationError[] {
  const errors: ArchitectureValidationError[] = [];

  if (!component.componentId || component.componentId.trim() === '') {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_COMPONENT_ID,
      message: 'System component is missing a component ID.',
      field: 'componentId',
      componentId: component.componentId,
    });
  }

  if (!component.architectureId || component.architectureId.trim() === '') {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_ARCHITECTURE_ID,
      message: 'System component is missing an architecture ID.',
      field: 'architectureId',
      componentId: component.componentId,
    });
  }

  if (!CANONICAL_SYSTEM_COMPONENT_TYPES.includes(component.componentType)) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_COMPONENT_TYPE,
      message: `System component has unsupported type: "${component.componentType}".`,
      field: 'componentType',
      componentId: component.componentId,
    });
  }

  if (!CANONICAL_ARCHITECTURE_LAYER_TYPES.includes(component.layerType)) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_LAYER_TYPE,
      message: `System component has unsupported layer type: "${component.layerType}".`,
      field: 'layerType',
      componentId: component.componentId,
    });
  }

  if (!component.provenance) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_PROVENANCE,
      message: 'System component is missing provenance.',
      field: 'provenance',
      componentId: component.componentId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// System Data Flow Validation
// ---------------------------------------------------------------------------

/**
 * Validates a system data flow against canonical invariants.
 * Pure function. No side effects.
 */
export function validateSystemDataFlow(
  flow: SystemDataFlow,
  allComponentIds: readonly string[],
): readonly ArchitectureValidationError[] {
  const errors: ArchitectureValidationError[] = [];

  if (!flow.flowId || flow.flowId.trim() === '') {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_FLOW_ID,
      message: 'System data flow is missing a flow ID.',
      field: 'flowId',
      flowId: flow.flowId,
    });
  }

  if (!CANONICAL_DATA_FLOW_TYPES.includes(flow.flowType)) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_FLOW_TYPE,
      message: `System data flow has unsupported type: "${flow.flowType}".`,
      field: 'flowType',
      flowId: flow.flowId,
    });
  }

  if (flow.sourceComponentId === flow.targetComponentId) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_SELF_FLOW,
      message: `System data flow references itself: "${flow.sourceComponentId}".`,
      field: 'sourceComponentId',
      flowId: flow.flowId,
    });
  }

  if (flow.sourceComponentId && !allComponentIds.includes(flow.sourceComponentId)) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_BROKEN_FLOW_REFERENCE,
      message: `System data flow references unknown source component: "${flow.sourceComponentId}".`,
      field: 'sourceComponentId',
      flowId: flow.flowId,
    });
  }

  if (flow.targetComponentId && !allComponentIds.includes(flow.targetComponentId)) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_BROKEN_FLOW_REFERENCE,
      message: `System data flow references unknown target component: "${flow.targetComponentId}".`,
      field: 'targetComponentId',
      flowId: flow.flowId,
    });
  }

  if (!flow.provenance) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_PROVENANCE,
      message: 'System data flow is missing provenance.',
      field: 'provenance',
      flowId: flow.flowId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// System Constraint Validation
// ---------------------------------------------------------------------------

/**
 * Validates a system constraint against canonical invariants.
 * Pure function. No side effects.
 */
export function validateSystemConstraint(
  constraint: SystemConstraint,
  allComponentIds: readonly string[],
): readonly ArchitectureValidationError[] {
  const errors: ArchitectureValidationError[] = [];

  if (!constraint.constraintId || constraint.constraintId.trim() === '') {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_CONSTRAINT_ID,
      message: 'System constraint is missing a constraint ID.',
      field: 'constraintId',
      constraintId: constraint.constraintId,
    });
  }

  if (!CANONICAL_SYSTEM_CONSTRAINT_TYPES.includes(constraint.constraintType)) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_CONSTRAINT_TYPE,
      message: `System constraint has unsupported type: "${constraint.constraintType}".`,
      field: 'constraintType',
      constraintId: constraint.constraintId,
    });
  }

  for (const affectedId of constraint.affectedComponentIds) {
    if (!allComponentIds.includes(affectedId)) {
      errors.push({
        code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_BROKEN_CONSTRAINT_REFERENCE,
        message: `System constraint references unknown component: "${affectedId}".`,
        field: 'affectedComponentIds',
        constraintId: constraint.constraintId,
      });
    }
  }

  if (!constraint.provenance) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_MISSING_PROVENANCE,
      message: 'System constraint is missing provenance.',
      field: 'provenance',
      constraintId: constraint.constraintId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Architecture Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates an architecture registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateArchitectureRegistry(
  registry: ArchitectureRegistry,
): ArchitectureRegistryValidationResult {
  const errors: ArchitectureValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.architectures || registry.architectures.length === 0) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_EMPTY_REGISTRY,
      message: 'Registry has no architectures.',
      field: 'architectures',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate architecture IDs
  const seenArchIds = new Set<string>();
  for (const architecture of registry.architectures) {
    if (seenArchIds.has(architecture.architectureId)) {
      errors.push({
        code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_DUPLICATE_ID,
        message: `Duplicate architecture ID: "${architecture.architectureId}".`,
        architectureId: architecture.architectureId,
      });
    }
    seenArchIds.add(architecture.architectureId);
  }

  // Check for duplicate architecture titles
  const seenArchTitles = new Set<string>();
  for (const architecture of registry.architectures) {
    if (seenArchTitles.has(architecture.title)) {
      errors.push({
        code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_DUPLICATE_TITLE,
        message: `Duplicate architecture title: "${architecture.title}".`,
        field: 'title',
        architectureId: architecture.architectureId,
      });
    }
    seenArchTitles.add(architecture.title);
  }

  // Check for duplicate component IDs
  const seenComponentIds = new Set<string>();
  for (const component of registry.components) {
    if (seenComponentIds.has(component.componentId)) {
      errors.push({
        code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_COMPONENT_DUPLICATE_ID,
        message: `Duplicate component ID: "${component.componentId}".`,
        componentId: component.componentId,
      });
    }
    seenComponentIds.add(component.componentId);
  }

  // Check for duplicate flow IDs
  const seenFlowIds = new Set<string>();
  for (const flow of registry.flows) {
    if (seenFlowIds.has(flow.flowId)) {
      errors.push({
        code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_FLOW_DUPLICATE_ID,
        message: `Duplicate flow ID: "${flow.flowId}".`,
        flowId: flow.flowId,
      });
    }
    seenFlowIds.add(flow.flowId);
  }

  // Check for duplicate constraint IDs
  const seenConstraintIds = new Set<string>();
  for (const constraint of registry.constraints) {
    if (seenConstraintIds.has(constraint.constraintId)) {
      errors.push({
        code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_CONSTRAINT_DUPLICATE_ID,
        message: `Duplicate constraint ID: "${constraint.constraintId}".`,
        constraintId: constraint.constraintId,
      });
    }
    seenConstraintIds.add(constraint.constraintId);
  }

  // Validate each architecture
  for (const architecture of registry.architectures) {
    errors.push(...validateSystemArchitecture(architecture));
  }

  // Validate each component
  for (const component of registry.components) {
    errors.push(...validateSystemComponent(component));
  }

  // Validate flows
  const allComponentIds = registry.components.map((c) => c.componentId);
  for (const flow of registry.flows) {
    errors.push(...validateSystemDataFlow(flow, allComponentIds));
  }

  // Validate constraints
  for (const constraint of registry.constraints) {
    errors.push(...validateSystemConstraint(constraint, allComponentIds));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'architecture_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Architecture Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates architecture input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateArchitectureInput(
  input: ArchitectureInput,
): ArchitectureInputValidationResult {
  const errors: ArchitectureValidationError[] = [];

  if (!input.architectures || input.architectures.length === 0) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_EMPTY_REGISTRY,
      message: 'Input has no architectures.',
      field: 'architectures',
    });
  } else {
    for (const architecture of input.architectures) {
      errors.push(...validateSystemArchitecture(architecture));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'architecture_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Architecture Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates an architecture trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateArchitectureTrace(
  trace: ArchitectureTrace,
): ArchitectureTraceValidationResult {
  const errors: ArchitectureValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_TRACE,
      message: 'Architecture trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_TRACE,
      message: 'Architecture trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_TRACE,
      message: 'Architecture trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: ARCHITECTURE_VALIDATION_CODES.ARCHITECTURE_INVALID_TRACE,
      message: 'Architecture trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'architecture_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Architectures Validation
// ---------------------------------------------------------------------------

/**
 * Validates an application artifact with architectures against canonical invariants.
 * Pure function. No side effects.
 */
export function validateApplicationArtifactWithArchitectures(
  registry: ArchitectureRegistry,
): readonly ArchitectureValidationError[] {
  const errors: ArchitectureValidationError[] = [];

  const registryResult = validateArchitectureRegistry(registry);
  errors.push(...registryResult.errors);

  return errors;
}
