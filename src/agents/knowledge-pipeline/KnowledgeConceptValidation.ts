/**
 * D10-OPT-03 — Concept Structure, Canonical Components Validation Layer
 *
 * Deterministic validation for concept component metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 20 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeComponent,
  KnowledgeComponentRelationship,
  KnowledgeComponentRegistry,
  KnowledgeConceptTrace,
  KnowledgeComponentInput,
  KnowledgeArtifactWithComponents,
  KnowledgeComponentValidationError,
  KnowledgeComponentRegistryValidationResult,
  KnowledgeComponentInputValidationResult,
  KnowledgeComponentTraceValidationResult,
  KnowledgeArtifactWithComponentsValidationResult,
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
// Stable Validation Codes (exactly 20, prefix COMPONENT_)
// ---------------------------------------------------------------------------

export const COMPONENT_VALIDATION_CODES = {
  COMPONENT_DUPLICATE_ID: 'COMPONENT_DUPLICATE_ID',
  COMPONENT_DUPLICATE_TITLE: 'COMPONENT_DUPLICATE_TITLE',
  COMPONENT_INVALID_TYPE: 'COMPONENT_INVALID_TYPE',
  COMPONENT_INVALID_PRIORITY: 'COMPONENT_INVALID_PRIORITY',
  COMPONENT_INVALID_ROLE: 'COMPONENT_INVALID_ROLE',
  COMPONENT_INVALID_VISIBILITY: 'COMPONENT_INVALID_VISIBILITY',
  COMPONENT_INVALID_STATUS: 'COMPONENT_INVALID_STATUS',
  COMPONENT_INVALID_GOVERNANCE: 'COMPONENT_INVALID_GOVERNANCE',
  COMPONENT_MISSING_PROVENANCE: 'COMPONENT_MISSING_PROVENANCE',
  COMPONENT_MISSING_PROVIDER: 'COMPONENT_MISSING_PROVIDER',
  COMPONENT_MISSING_RATIONALE: 'COMPONENT_MISSING_RATIONALE',
  COMPONENT_MISSING_CONCEPT_REFERENCE: 'COMPONENT_MISSING_CONCEPT_REFERENCE',
  COMPONENT_MISSING_COMPONENT_ID: 'COMPONENT_MISSING_COMPONENT_ID',
  COMPONENT_MISSING_TITLE: 'COMPONENT_MISSING_TITLE',
  COMPONENT_SELF_RELATIONSHIP: 'COMPONENT_SELF_RELATIONSHIP',
  COMPONENT_EMPTY_REGISTRY: 'COMPONENT_EMPTY_REGISTRY',
  COMPONENT_INVALID_TRACE: 'COMPONENT_INVALID_TRACE',
  COMPONENT_REGISTRY_INCONSISTENCY: 'COMPONENT_REGISTRY_INCONSISTENCY',
  COMPONENT_INVALID_CONFIGURATION: 'COMPONENT_INVALID_CONFIGURATION',
  COMPONENT_INVALID_ORDER: 'COMPONENT_INVALID_ORDER',
} as const;

// ---------------------------------------------------------------------------
// Single Component Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeComponent(
  component: KnowledgeComponent,
): readonly KnowledgeComponentValidationError[] {
  const errors: KnowledgeComponentValidationError[] = [];

  if (!component.componentId || component.componentId.trim() === '') {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_COMPONENT_ID,
      message: 'Component is missing a component ID.',
      field: 'componentId',
      componentId: component.componentId,
    });
  }

  if (!component.title || component.title.trim() === '') {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_TITLE,
      message: 'Component is missing a title.',
      field: 'title',
      componentId: component.componentId,
    });
  }

  if (!component.conceptId || component.conceptId.trim() === '') {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_CONCEPT_REFERENCE,
      message: 'Component is missing a concept reference.',
      field: 'conceptId',
      componentId: component.componentId,
    });
  }

  if (!CANONICAL_COMPONENT_TYPES.includes(component.componentType)) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_TYPE,
      message: `Component has unsupported type: "${component.componentType}".`,
      field: 'componentType',
      componentId: component.componentId,
    });
  }

  if (!CANONICAL_COMPONENT_PRIORITY.includes(component.priority)) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_PRIORITY,
      message: `Component has unsupported priority: "${component.priority}".`,
      field: 'priority',
      componentId: component.componentId,
    });
  }

  if (!CANONICAL_COMPONENT_ROLE.includes(component.role)) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_ROLE,
      message: `Component has unsupported role: "${component.role}".`,
      field: 'role',
      componentId: component.componentId,
    });
  }

  if (!CANONICAL_COMPONENT_VISIBILITY.includes(component.visibility)) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_VISIBILITY,
      message: `Component has unsupported visibility: "${component.visibility}".`,
      field: 'visibility',
      componentId: component.componentId,
    });
  }

  if (!CANONICAL_COMPONENT_STATUS.includes(component.status)) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_STATUS,
      message: `Component has unsupported status: "${component.status}".`,
      field: 'status',
      componentId: component.componentId,
    });
  }

  if (!CANONICAL_COMPONENT_GOVERNANCE.includes(component.governance)) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_GOVERNANCE,
      message: `Component has unsupported governance: "${component.governance}".`,
      field: 'governance',
      componentId: component.componentId,
    });
  }

  if (!component.provenance) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_PROVENANCE,
      message: 'Component is missing provenance.',
      field: 'provenance',
      componentId: component.componentId,
    });
  } else {
    if (!component.provenance.provider || component.provenance.provider.trim() === '') {
      errors.push({
        code: COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_PROVIDER,
        message: 'Component provenance is missing a provider.',
        field: 'provenance.provider',
        componentId: component.componentId,
      });
    }

    if (!component.provenance.rationale || component.provenance.rationale.trim() === '') {
      errors.push({
        code: COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_RATIONALE,
        message: 'Component provenance is missing a rationale.',
        field: 'provenance.rationale',
        componentId: component.componentId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Relationship Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeComponentRelationship(
  relationship: KnowledgeComponentRelationship,
  knownComponentIds: ReadonlySet<string>,
): readonly KnowledgeComponentValidationError[] {
  const errors: KnowledgeComponentValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_COMPONENT_ID,
      message: 'Component relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (relationship.sourceComponentId === relationship.targetComponentId) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_SELF_RELATIONSHIP,
      message: 'Component relationship cannot reference itself.',
      field: 'targetComponentId',
      componentId: relationship.sourceComponentId,
    });
  }

  if (!knownComponentIds.has(relationship.sourceComponentId)) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_CONFIGURATION,
      message: `Component relationship references unknown source component: "${relationship.sourceComponentId}".`,
      field: 'sourceComponentId',
      componentId: relationship.sourceComponentId,
    });
  }

  if (!knownComponentIds.has(relationship.targetComponentId)) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_CONFIGURATION,
      message: `Component relationship references unknown target component: "${relationship.targetComponentId}".`,
      field: 'targetComponentId',
      componentId: relationship.targetComponentId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_PROVENANCE,
      message: 'Component relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Component Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeComponentRegistry(
  registry: KnowledgeComponentRegistry,
): KnowledgeComponentRegistryValidationResult {
  const errors: KnowledgeComponentValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.components || registry.components.length === 0) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_EMPTY_REGISTRY,
      message: 'Registry has no components.',
      field: 'components',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const component of registry.components) {
    if (seenIds.has(component.componentId)) {
      errors.push({
        code: COMPONENT_VALIDATION_CODES.COMPONENT_DUPLICATE_ID,
        message: `Duplicate component ID: "${component.componentId}".`,
        componentId: component.componentId,
      });
    }
    seenIds.add(component.componentId);
  }

  const seenTitles = new Set<string>();
  for (const component of registry.components) {
    if (seenTitles.has(component.title)) {
      errors.push({
        code: COMPONENT_VALIDATION_CODES.COMPONENT_DUPLICATE_TITLE,
        message: `Duplicate component title: "${component.title}".`,
        field: 'title',
        componentId: component.componentId,
      });
    }
    seenTitles.add(component.title);
  }

  for (const component of registry.components) {
    errors.push(...validateKnowledgeComponent(component));
  }

  const knownComponentIds = new Set(registry.components.map((c) => c.componentId));
  for (const relationship of registry.relationships) {
    errors.push(...validateKnowledgeComponentRelationship(relationship, knownComponentIds));
  }

  if (registry.metadata.componentCount !== registry.components.length) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_REGISTRY_INCONSISTENCY,
      message: `Registry metadata component count (${registry.metadata.componentCount}) does not match actual component count (${registry.components.length}).`,
      field: 'metadata.componentCount',
    });
  }

  if (registry.metadata.relationshipCount !== registry.relationships.length) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_REGISTRY_INCONSISTENCY,
      message: `Registry metadata relationship count (${registry.metadata.relationshipCount}) does not match actual relationship count (${registry.relationships.length}).`,
      field: 'metadata.relationshipCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_component_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Component Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeComponentInput(
  input: KnowledgeComponentInput,
): KnowledgeComponentInputValidationResult {
  const errors: KnowledgeComponentValidationError[] = [];

  if (!input.components || input.components.length === 0) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_EMPTY_REGISTRY,
      message: 'Input has no components.',
      field: 'components',
    });
  } else {
    for (const component of input.components) {
      errors.push(...validateKnowledgeComponent(component));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_component_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Component Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeComponentTrace(
  trace: KnowledgeConceptTrace,
): KnowledgeComponentTraceValidationResult {
  const errors: KnowledgeComponentValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_TRACE,
      message: 'Component trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_TRACE,
      message: 'Component trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_TRACE,
      message: 'Component trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_INVALID_TRACE,
      message: 'Component trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_component_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Components Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeArtifactWithComponents(
  artifact: KnowledgeArtifactWithComponents,
): KnowledgeArtifactWithComponentsValidationResult {
  const errors: KnowledgeComponentValidationError[] = [];

  if (!artifact.conceptId || artifact.conceptId.trim() === '') {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_CONCEPT_REFERENCE,
      message: 'Artifact is missing a concept ID.',
      field: 'conceptId',
    });
  }

  if (!artifact.conceptTitle || artifact.conceptTitle.trim() === '') {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_TITLE,
      message: 'Artifact is missing a concept title.',
      field: 'conceptTitle',
    });
  }

  if (!artifact.components || artifact.components.length === 0) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_EMPTY_REGISTRY,
      message: 'Artifact has no components.',
      field: 'components',
    });
  } else {
    for (const component of artifact.components) {
      errors.push(...validateKnowledgeComponent(component));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: COMPONENT_VALIDATION_CODES.COMPONENT_MISSING_PROVENANCE,
      message: 'Artifact is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_components_composition',
  };
}
