/**
 * D10-OPT-03 — Concept Structure, Canonical Components & Internal Knowledge Kernel
 *
 * Deterministic orchestration functions for concept component metadata.
 * Produces components, relationships, traces, and registries.
 *
 * This module never:
 * - Generates components
 * - Performs automatic concept decomposition
 * - Performs semantic parsing
 * - Uses NLP
 * - Invokes LLMs
 * - Creates ontologies automatically
 * - Performs graph inference
 * - Accesses filesystem
 * - Performs network requests
 *
 * Concept component metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeComponent,
  KnowledgeConceptProvenance,
  KnowledgeConceptDecision,
  KnowledgeConceptTrace,
  KnowledgeComponentRegistry,
  KnowledgeComponentRegistryMetadata,
  KnowledgeComponentInput,
  KnowledgeComponentRelationship,
  KnowledgeArtifactWithComponents,
  ComponentType,
  ComponentPriority,
  ComponentRole,
  ComponentVisibility,
  ComponentStatus,
  ComponentGovernance,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_COMPONENT_TYPES,
  CANONICAL_COMPONENT_PRIORITY,
  CANONICAL_COMPONENT_STATUS,
  CANONICAL_COMPONENT_VISIBILITY,
  CANONICAL_COMPONENT_ROLE,
  CANONICAL_COMPONENT_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Concept Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeConceptProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: ComponentGovernance;
}): KnowledgeConceptProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Concept Decision Composition
// ---------------------------------------------------------------------------

function _composeConceptDecision(
  componentId: string,
  conceptId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeConceptDecision {
  return {
    decisionId: `_decision_${componentId}`,
    componentId,
    conceptId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Concept Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeConceptTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeConceptDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeConceptTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_concept_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Component Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeComponent(params: {
  readonly componentId: string;
  readonly conceptId: string;
  readonly title: string;
  readonly componentType: ComponentType;
  readonly priority: ComponentPriority;
  readonly role: ComponentRole;
  readonly visibility: ComponentVisibility;
  readonly status: ComponentStatus;
  readonly governance: ComponentGovernance;
  readonly tags: readonly string[];
  readonly orderIndex: number;
  readonly references: readonly string[];
  readonly provenance: KnowledgeConceptProvenance;
}): KnowledgeComponent {
  return {
    componentId: params.componentId,
    conceptId: params.conceptId,
    title: params.title,
    componentType: params.componentType,
    priority: params.priority,
    role: params.role,
    visibility: params.visibility,
    status: params.status,
    governance: params.governance,
    tags: [...params.tags],
    orderIndex: params.orderIndex,
    references: [...params.references],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Component Relationship Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeComponentRelationship(params: {
  readonly relationshipId: string;
  readonly sourceComponentId: string;
  readonly targetComponentId: string;
  readonly conceptId: string;
  readonly relationshipType: 'prerequisite' | 'extension' | 'dependency' | 'reference';
  readonly description: string;
  readonly provenance: KnowledgeConceptProvenance;
}): KnowledgeComponentRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceComponentId: params.sourceComponentId,
    targetComponentId: params.targetComponentId,
    conceptId: params.conceptId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeComponent(
  a: KnowledgeComponent,
  b: KnowledgeComponent,
): number {
  if (a.conceptId < b.conceptId) return -1;
  if (a.conceptId > b.conceptId) return 1;

  if (a.orderIndex < b.orderIndex) return -1;
  if (a.orderIndex > b.orderIndex) return 1;

  if (a.componentType < b.componentType) return -1;
  if (a.componentType > b.componentType) return 1;

  if (a.componentId < b.componentId) return -1;
  if (a.componentId > b.componentId) return 1;

  return 0;
}

function _compareKnowledgeComponentRelationship(
  a: KnowledgeComponentRelationship,
  b: KnowledgeComponentRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Component Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeComponentRegistry(
  components: readonly KnowledgeComponent[],
  relationships: readonly KnowledgeComponentRelationship[],
): KnowledgeComponentRegistry {
  const sortedComponents = [...components].sort(_compareKnowledgeComponent);
  const sortedRelationships = [...relationships].sort(_compareKnowledgeComponentRelationship);

  const concepts = new Set(sortedComponents.map((c) => c.conceptId));
  const componentTypes = new Set(sortedComponents.map((c) => c.componentType));

  const metadata: KnowledgeComponentRegistryMetadata = {
    registryId: `_registry_${sortedComponents.length}`,
    componentCount: sortedComponents.length,
    relationshipCount: sortedRelationships.length,
    conceptCount: concepts.size,
    componentTypeCount: componentTypes.size,
  };

  return {
    registryId: metadata.registryId,
    components: sortedComponents,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedComponents.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_concept_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_concept_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Component Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeComponentRegistryFromInput(
  input: KnowledgeComponentInput,
): KnowledgeComponentRegistry {
  return composeKnowledgeComponentRegistry(input.components, input.relationships);
}

// ---------------------------------------------------------------------------
// Component Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledgeComponents(
  input: KnowledgeComponentInput,
): KnowledgeComponentRegistry {
  const decisions = input.components.map((component) => {
    const errors = _validateComponentForDecision(component);
    return _composeConceptDecision(component.componentId, component.conceptId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeComponentRegistry(input.components, input.relationships);

  return {
    ...registry,
    trace: composeKnowledgeConceptTrace({
      traceId: `_trace_${input.components.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateComponentForDecision(
  component: KnowledgeComponent,
): readonly string[] {
  const errors: string[] = [];

  if (!component.componentId || component.componentId.trim() === '') {
    errors.push('COMPONENT_MISSING_COMPONENT_ID');
  }

  if (!component.title || component.title.trim() === '') {
    errors.push('COMPONENT_MISSING_TITLE');
  }

  if (!component.conceptId || component.conceptId.trim() === '') {
    errors.push('COMPONENT_MISSING_CONCEPT_REFERENCE');
  }

  if (!CANONICAL_COMPONENT_TYPES.includes(component.componentType)) {
    errors.push('COMPONENT_INVALID_TYPE');
  }

  if (!CANONICAL_COMPONENT_PRIORITY.includes(component.priority)) {
    errors.push('COMPONENT_INVALID_PRIORITY');
  }

  if (!CANONICAL_COMPONENT_ROLE.includes(component.role)) {
    errors.push('COMPONENT_INVALID_ROLE');
  }

  if (!CANONICAL_COMPONENT_VISIBILITY.includes(component.visibility)) {
    errors.push('COMPONENT_INVALID_VISIBILITY');
  }

  if (!CANONICAL_COMPONENT_STATUS.includes(component.status)) {
    errors.push('COMPONENT_INVALID_STATUS');
  }

  if (!CANONICAL_COMPONENT_GOVERNANCE.includes(component.governance)) {
    errors.push('COMPONENT_INVALID_GOVERNANCE');
  }

  if (!component.provenance) {
    errors.push('COMPONENT_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact With Components Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeArtifactWithComponents(params: {
  readonly conceptId: string;
  readonly conceptTitle: string;
  readonly components: readonly KnowledgeComponent[];
  readonly relationships: readonly KnowledgeComponentRelationship[];
  readonly provenance: KnowledgeConceptProvenance;
}): KnowledgeArtifactWithComponents {
  return {
    conceptId: params.conceptId,
    conceptTitle: params.conceptTitle,
    components: [...params.components],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedComponentType(
  value: string,
): value is ComponentType {
  return CANONICAL_COMPONENT_TYPES.includes(value as ComponentType);
}

export function isSupportedComponentPriority(
  value: string,
): value is ComponentPriority {
  return CANONICAL_COMPONENT_PRIORITY.includes(value as ComponentPriority);
}

export function isSupportedComponentRole(
  value: string,
): value is ComponentRole {
  return CANONICAL_COMPONENT_ROLE.includes(value as ComponentRole);
}

export function isSupportedComponentVisibility(
  value: string,
): value is ComponentVisibility {
  return CANONICAL_COMPONENT_VISIBILITY.includes(value as ComponentVisibility);
}

export function isSupportedComponentStatus(
  value: string,
): value is ComponentStatus {
  return CANONICAL_COMPONENT_STATUS.includes(value as ComponentStatus);
}

export function isSupportedComponentGovernance(
  value: string,
): value is ComponentGovernance {
  return CANONICAL_COMPONENT_GOVERNANCE.includes(value as ComponentGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalComponentTypes(): readonly ComponentType[] {
  return CANONICAL_COMPONENT_TYPES;
}

export function getCanonicalComponentPriorities(): readonly ComponentPriority[] {
  return CANONICAL_COMPONENT_PRIORITY;
}

export function getCanonicalComponentRoles(): readonly ComponentRole[] {
  return CANONICAL_COMPONENT_ROLE;
}

export function getCanonicalComponentVisibility(): readonly ComponentVisibility[] {
  return CANONICAL_COMPONENT_VISIBILITY;
}

export function getCanonicalComponentStatuses(): readonly ComponentStatus[] {
  return CANONICAL_COMPONENT_STATUS;
}
