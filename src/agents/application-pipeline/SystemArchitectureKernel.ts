/**
 * NV-1900-D7-OPT-03 — Theory-to-System Architecture Mapping Kernel
 *
 * Deterministic orchestration functions for system architecture metadata.
 * Produces architecture nodes, components, data flows, constraints, traces, and registries.
 *
 * This module never:
 * - Generates architecture content
 * - Infers architectures
 * - Generates diagrams
 * - Recommends deployment decisions
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * System architecture metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  SystemArchitecture,
  SystemArchitectureProvenance,
  SystemComponent,
  SystemDataFlow,
  SystemConstraint,
  ArchitectureDecision,
  ArchitectureTrace,
  ArchitectureRegistry,
  ArchitectureRegistryMetadata,
  ArchitectureInput,
  SystemArchitectureType,
  SystemComponentType,
  DataFlowType,
  ArchitectureLayerType,
  SystemConstraintType,
  SystemArchitectureStatus,
  ApplicationGovernanceStatus,
  ApplicationNode,
  ApplicationArtifactWithArchitectures,
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
// System Architecture Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes system architecture provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeSystemArchitectureProvenance(params: {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}): SystemArchitectureProvenance {
  return {
    providedBy: params.providedBy,
    rationale: params.rationale,
    reviewedBy: params.reviewedBy,
    reviewDate: params.reviewDate,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// System Architecture Composition
// ---------------------------------------------------------------------------

/**
 * Composes a system architecture from provided parameters.
 * Pure function. No side effects.
 */
export function composeSystemArchitecture(params: {
  readonly architectureId: string;
  readonly title: string;
  readonly description: string;
  readonly architectureType: SystemArchitectureType;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly useCaseIds: readonly string[];
  readonly componentIds: readonly string[];
  readonly flowIds: readonly string[];
  readonly constraintIds: readonly string[];
  readonly status: SystemArchitectureStatus;
  readonly provenance: SystemArchitectureProvenance;
}): SystemArchitecture {
  return {
    architectureId: params.architectureId,
    title: params.title,
    description: params.description,
    architectureType: params.architectureType,
    applicationArtifactId: params.applicationArtifactId,
    knowledgeArtifactId: params.knowledgeArtifactId,
    useCaseIds: [...params.useCaseIds],
    componentIds: [...params.componentIds],
    flowIds: [...params.flowIds],
    constraintIds: [...params.constraintIds],
    status: params.status,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// System Component Composition
// ---------------------------------------------------------------------------

/**
 * Composes a system component from provided parameters.
 * Pure function. No side effects.
 */
export function composeSystemComponent(params: {
  readonly componentId: string;
  readonly architectureId: string;
  readonly componentType: SystemComponentType;
  readonly title: string;
  readonly description: string;
  readonly relatedConceptId: string;
  readonly layerType: ArchitectureLayerType;
  readonly order: number;
  readonly provenance: SystemArchitectureProvenance;
}): SystemComponent {
  return {
    componentId: params.componentId,
    architectureId: params.architectureId,
    componentType: params.componentType,
    title: params.title,
    description: params.description,
    relatedConceptId: params.relatedConceptId,
    layerType: params.layerType,
    order: params.order,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// System Data Flow Composition
// ---------------------------------------------------------------------------

/**
 * Composes a system data flow from provided parameters.
 * Pure function. No side effects.
 */
export function composeSystemDataFlow(params: {
  readonly flowId: string;
  readonly architectureId: string;
  readonly sourceComponentId: string;
  readonly targetComponentId: string;
  readonly flowType: DataFlowType;
  readonly description: string;
  readonly provenance: SystemArchitectureProvenance;
}): SystemDataFlow {
  return {
    flowId: params.flowId,
    architectureId: params.architectureId,
    sourceComponentId: params.sourceComponentId,
    targetComponentId: params.targetComponentId,
    flowType: params.flowType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// System Constraint Composition
// ---------------------------------------------------------------------------

/**
 * Composes a system constraint from provided parameters.
 * Pure function. No side effects.
 */
export function composeSystemConstraint(params: {
  readonly constraintId: string;
  readonly architectureId: string;
  readonly constraintType: SystemConstraintType;
  readonly description: string;
  readonly affectedComponentIds: readonly string[];
  readonly provenance: SystemArchitectureProvenance;
}): SystemConstraint {
  return {
    constraintId: params.constraintId,
    architectureId: params.architectureId,
    constraintType: params.constraintType,
    description: params.description,
    affectedComponentIds: [...params.affectedComponentIds],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Architecture Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes an architecture decision from validation results.
 * Pure function. No side effects.
 */
function _composeArchitectureDecision(
  architectureId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): ArchitectureDecision {
  return {
    decisionId: `_decision_${architectureId}`,
    architectureId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Architecture Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes an architecture trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeArchitectureTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly ArchitectureDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): ArchitectureTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_architecture_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for system architectures.
 * Sorts by architectureId, then architectureType, then title.
 * Pure function. No side effects.
 */
function _compareArchitecture(
  a: SystemArchitecture,
  b: SystemArchitecture,
): number {
  if (a.architectureId < b.architectureId) return -1;
  if (a.architectureId > b.architectureId) return 1;

  if (a.architectureType < b.architectureType) return -1;
  if (a.architectureType > b.architectureType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

/**
 * Deterministic comparator for system components.
 * Sorts by architectureId, order, componentId, componentType.
 * Pure function. No side effects.
 */
function _compareComponent(
  a: SystemComponent,
  b: SystemComponent,
): number {
  if (a.architectureId < b.architectureId) return -1;
  if (a.architectureId > b.architectureId) return 1;

  if (a.order < b.order) return -1;
  if (a.order > b.order) return 1;

  if (a.componentId < b.componentId) return -1;
  if (a.componentId > b.componentId) return 1;

  if (a.componentType < b.componentType) return -1;
  if (a.componentType > b.componentType) return 1;

  return 0;
}

/**
 * Deterministic comparator for system data flows.
 * Sorts by architectureId, sourceComponentId, targetComponentId, flowId.
 * Pure function. No side effects.
 */
function _compareFlow(
  a: SystemDataFlow,
  b: SystemDataFlow,
): number {
  if (a.architectureId < b.architectureId) return -1;
  if (a.architectureId > b.architectureId) return 1;

  if (a.sourceComponentId < b.sourceComponentId) return -1;
  if (a.sourceComponentId > b.sourceComponentId) return 1;

  if (a.targetComponentId < b.targetComponentId) return -1;
  if (a.targetComponentId > b.targetComponentId) return 1;

  if (a.flowId < b.flowId) return -1;
  if (a.flowId > b.flowId) return 1;

  return 0;
}

/**
 * Deterministic comparator for system constraints.
 * Sorts by architectureId, constraintType, constraintId.
 * Pure function. No side effects.
 */
function _compareConstraint(
  a: SystemConstraint,
  b: SystemConstraint,
): number {
  if (a.architectureId < b.architectureId) return -1;
  if (a.architectureId > b.architectureId) return 1;

  if (a.constraintType < b.constraintType) return -1;
  if (a.constraintType > b.constraintType) return 1;

  if (a.constraintId < b.constraintId) return -1;
  if (a.constraintId > b.constraintId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Architecture Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes an architecture registry from components.
 * Pure function. No side effects.
 * Deterministic ordering for all collections.
 */
export function composeArchitectureRegistry(
  architectures: readonly SystemArchitecture[],
  components: readonly SystemComponent[],
  flows: readonly SystemDataFlow[],
  constraints: readonly SystemConstraint[],
): ArchitectureRegistry {
  const sortedArchitectures = [...architectures].sort(_compareArchitecture);
  const sortedComponents = [...components].sort(_compareComponent);
  const sortedFlows = [...flows].sort(_compareFlow);
  const sortedConstraints = [...constraints].sort(_compareConstraint);

  const types = new Set(sortedArchitectures.map((a) => a.architectureType));

  const metadata: ArchitectureRegistryMetadata = {
    registryId: `_registry_${sortedArchitectures.length}_${sortedComponents.length}_${sortedFlows.length}_${sortedConstraints.length}`,
    architectureCount: sortedArchitectures.length,
    componentCount: sortedComponents.length,
    flowCount: sortedFlows.length,
    constraintCount: sortedConstraints.length,
    typeCount: types.size,
  };

  return {
    registryId: metadata.registryId,
    architectures: sortedArchitectures,
    components: sortedComponents,
    flows: sortedFlows,
    constraints: sortedConstraints,
    metadata,
    trace: {
      traceId: `_trace_${sortedArchitectures.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_architecture_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_architecture_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Architecture Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes an architecture registry from an input.
 * Pure function. No side effects.
 */
export function composeArchitectureRegistryFromInput(
  input: ArchitectureInput,
): ArchitectureRegistry {
  return composeArchitectureRegistry(
    input.architectures,
    input.components,
    input.flows,
    input.constraints,
  );
}

// ---------------------------------------------------------------------------
// Architecture Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete architecture registry from an input.
 * Pure function. No side effects.
 */
export function composeApplicationArchitectures(
  input: ArchitectureInput,
): ArchitectureRegistry {
  const decisions = input.architectures.map((architecture) => {
    const errors = _validateArchitectureForDecision(architecture);
    return _composeArchitectureDecision(architecture.architectureId, errors.length === 0, errors);
  });

  const registry = composeArchitectureRegistry(
    input.architectures,
    input.components,
    input.flows,
    input.constraints,
  );

  return {
    ...registry,
    trace: composeArchitectureTrace({
      traceId: `_trace_${input.architectures.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Architectures Composition
// ---------------------------------------------------------------------------

/**
 * Attaches architecture registry metadata to an application artifact.
 * Pure function. No side effects.
 * Never mutates the original artifact.
 */
export function composeApplicationArtifactWithArchitectures(params: {
  readonly applicationNode: ApplicationNode;
  readonly architectureRegistry: ArchitectureRegistry;
}): ApplicationArtifactWithArchitectures {
  return {
    applicationNode: { ...params.applicationNode },
    architectureRegistry: { ...params.architectureRegistry },
    deterministic: true,
    generatedFrom: 'deterministic_architecture_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Architecture Decision Validation
// ---------------------------------------------------------------------------

/**
 * Validates an architecture for decision composition.
 * Pure function. No side effects.
 */
function _validateArchitectureForDecision(
  architecture: SystemArchitecture,
): readonly string[] {
  const errors: string[] = [];

  if (!architecture.architectureId || architecture.architectureId.trim() === '') {
    errors.push('ARCHITECTURE_MISSING_ARCHITECTURE_ID');
  }

  if (!architecture.title || architecture.title.trim() === '') {
    errors.push('ARCHITECTURE_MISSING_TITLE');
  }

  if (!CANONICAL_SYSTEM_ARCHITECTURE_TYPES.includes(architecture.architectureType)) {
    errors.push('ARCHITECTURE_INVALID_TYPE');
  }

  if (!CANONICAL_SYSTEM_ARCHITECTURE_STATUS.includes(architecture.status)) {
    errors.push('ARCHITECTURE_INVALID_STATUS');
  }

  if (!architecture.provenance) {
    errors.push('ARCHITECTURE_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported system architecture type.
 */
export function isSupportedSystemArchitectureType(
  architectureType: string,
): architectureType is SystemArchitectureType {
  return CANONICAL_SYSTEM_ARCHITECTURE_TYPES.includes(architectureType as SystemArchitectureType);
}

/**
 * Checks if a string is a supported system component type.
 */
export function isSupportedSystemComponentType(
  componentType: string,
): componentType is SystemComponentType {
  return CANONICAL_SYSTEM_COMPONENT_TYPES.includes(componentType as SystemComponentType);
}

/**
 * Checks if a string is a supported data flow type.
 */
export function isSupportedDataFlowType(
  flowType: string,
): flowType is DataFlowType {
  return CANONICAL_DATA_FLOW_TYPES.includes(flowType as DataFlowType);
}

/**
 * Checks if a string is a supported architecture layer type.
 */
export function isSupportedArchitectureLayerType(
  layerType: string,
): layerType is ArchitectureLayerType {
  return CANONICAL_ARCHITECTURE_LAYER_TYPES.includes(layerType as ArchitectureLayerType);
}

/**
 * Checks if a string is a supported system constraint type.
 */
export function isSupportedSystemConstraintType(
  constraintType: string,
): constraintType is SystemConstraintType {
  return CANONICAL_SYSTEM_CONSTRAINT_TYPES.includes(constraintType as SystemConstraintType);
}

/**
 * Checks if a string is a supported system architecture status.
 */
export function isSupportedSystemArchitectureStatus(
  status: string,
): status is SystemArchitectureStatus {
  return CANONICAL_SYSTEM_ARCHITECTURE_STATUS.includes(status as SystemArchitectureStatus);
}

/**
 * Checks if a string is a supported system architecture governance status.
 */
export function isSupportedSystemArchitectureGovernance(
  governanceStatus: string,
): governanceStatus is ApplicationGovernanceStatus {
  return CANONICAL_APPLICATION_GOVERNANCE.includes(
    governanceStatus as ApplicationGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical system architecture types.
 */
export function getCanonicalSystemArchitectureTypes(): readonly SystemArchitectureType[] {
  return CANONICAL_SYSTEM_ARCHITECTURE_TYPES;
}

/**
 * Returns the canonical system component types.
 */
export function getCanonicalSystemComponentTypes(): readonly SystemComponentType[] {
  return CANONICAL_SYSTEM_COMPONENT_TYPES;
}

/**
 * Returns the canonical data flow types.
 */
export function getCanonicalDataFlowTypes(): readonly DataFlowType[] {
  return CANONICAL_DATA_FLOW_TYPES;
}

/**
 * Returns the canonical architecture layer types.
 */
export function getCanonicalArchitectureLayerTypes(): readonly ArchitectureLayerType[] {
  return CANONICAL_ARCHITECTURE_LAYER_TYPES;
}

/**
 * Returns the canonical system constraint types.
 */
export function getCanonicalSystemConstraintTypes(): readonly SystemConstraintType[] {
  return CANONICAL_SYSTEM_CONSTRAINT_TYPES;
}

/**
 * Returns the canonical system architecture statuses.
 */
export function getCanonicalSystemArchitectureStatuses(): readonly SystemArchitectureStatus[] {
  return CANONICAL_SYSTEM_ARCHITECTURE_STATUS;
}
