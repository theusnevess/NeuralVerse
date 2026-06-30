/**
 * NV-1700-D6-OPT-04 — Analogy Validation Layer
 *
 * Deterministic validation for analogy metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  Analogy,
  Metaphor,
  Intuition,
  ConceptMapping,
  CognitiveBridge,
  AnalogyRegistry,
  AnalogyInput,
  NarrativeArtifactWithAnalogies,
  AnalogyValidationError,
  AnalogyUnitValidationResult,
  MetaphorValidationResult,
  IntuitionValidationResult,
  ConceptMappingValidationResult,
  CognitiveBridgeValidationResult,
  AnalogyRegistryValidationResult,
  AnalogyInputValidationResult,
  NarrativeArtifactWithAnalogiesValidationResult,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_ANALOGY_TYPES,
  CANONICAL_METAPHOR_TYPES,
  CANONICAL_INTUITION_TYPES,
  CANONICAL_MAPPING_TYPES,
  CANONICAL_ABSTRACTION_LEVELS,
  CANONICAL_ANALOGY_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const ANALOGY_VALIDATION_CODES = {
  ANALOGY_DUPLICATE_ID: 'ANALOGY_DUPLICATE_ID',
  ANALOGY_DUPLICATE_TITLE: 'ANALOGY_DUPLICATE_TITLE',
  ANALOGY_INVALID_TYPE: 'ANALOGY_INVALID_TYPE',
  ANALOGY_INVALID_ABSTRACTION_LEVEL: 'ANALOGY_INVALID_ABSTRACTION_LEVEL',
  ANALOGY_INVALID_GOVERNANCE_STATUS: 'ANALOGY_INVALID_GOVERNANCE_STATUS',
  ANALOGY_MISSING_PROVENANCE: 'ANALOGY_MISSING_PROVENANCE',
  ANALOGY_MISSING_SOURCE: 'ANALOGY_MISSING_SOURCE',
  ANALOGY_MISSING_RATIONALE: 'ANALOGY_MISSING_RATIONALE',
  ANALOGY_MISSING_PROVIDED_BY: 'ANALOGY_MISSING_PROVIDED_BY',
  ANALOGY_MISSING_ANALOGY_ID: 'ANALOGY_MISSING_ANALOGY_ID',
  ANALOGY_MISSING_TITLE: 'ANALOGY_MISSING_TITLE',
  ANALOGY_MISSING_SOURCE_CONCEPT: 'ANALOGY_MISSING_SOURCE_CONCEPT',
  ANALOGY_MISSING_TARGET_CONCEPT: 'ANALOGY_MISSING_TARGET_CONCEPT',
  ANALOGY_EMPTY_REGISTRY: 'ANALOGY_EMPTY_REGISTRY',
  ANALOGY_INVALID_TRACE: 'ANALOGY_INVALID_TRACE',
  ANALOGY_TRACE_RANDOM_USED: 'ANALOGY_TRACE_RANDOM_USED',
  ANALOGY_TRACE_TIME_DEPENDENCY: 'ANALOGY_TRACE_TIME_DEPENDENCY',
  METAPHOR_DUPLICATE_ID: 'METAPHOR_DUPLICATE_ID',
  METAPHOR_INVALID_TYPE: 'METAPHOR_INVALID_TYPE',
  METAPHOR_MISSING_PROVENANCE: 'METAPHOR_MISSING_PROVENANCE',
  METAPHOR_MISSING_SOURCE: 'METAPHOR_MISSING_SOURCE',
  METAPHOR_MISSING_RATIONALE: 'METAPHOR_MISSING_RATIONALE',
  METAPHOR_MISSING_PROVIDED_BY: 'METAPHOR_MISSING_PROVIDED_BY',
  METAPHOR_MISSING_METAPHOR_ID: 'METAPHOR_MISSING_METAPHOR_ID',
  METAPHOR_MISSING_TITLE: 'METAPHOR_MISSING_TITLE',
  INTUITION_DUPLICATE_ID: 'INTUITION_DUPLICATE_ID',
  INTUITION_INVALID_TYPE: 'INTUITION_INVALID_TYPE',
  INTUITION_INVALID_ABSTRACTION_LEVEL: 'INTUITION_INVALID_ABSTRACTION_LEVEL',
  INTUITION_MISSING_PROVENANCE: 'INTUITION_MISSING_PROVENANCE',
  INTUITION_MISSING_SOURCE: 'INTUITION_MISSING_SOURCE',
  INTUITION_MISSING_RATIONALE: 'INTUITION_MISSING_RATIONALE',
  INTUITION_MISSING_PROVIDED_BY: 'INTUITION_MISSING_PROVIDED_BY',
  INTUITION_MISSING_INTUITION_ID: 'INTUITION_MISSING_INTUITION_ID',
  INTUITION_MISSING_TITLE: 'INTUITION_MISSING_TITLE',
  MAPPING_DUPLICATE_ID: 'MAPPING_DUPLICATE_ID',
  MAPPING_INVALID_TYPE: 'MAPPING_INVALID_TYPE',
  MAPPING_MISSING_PROVENANCE: 'MAPPING_MISSING_PROVENANCE',
  MAPPING_MISSING_SOURCE: 'MAPPING_MISSING_SOURCE',
  MAPPING_MISSING_RATIONALE: 'MAPPING_MISSING_RATIONALE',
  MAPPING_MISSING_PROVIDED_BY: 'MAPPING_MISSING_PROVIDED_BY',
  MAPPING_MISSING_MAPPING_ID: 'MAPPING_MISSING_MAPPING_ID',
  MAPPING_MISSING_DESCRIPTION: 'MAPPING_MISSING_DESCRIPTION',
  BRIDGE_DUPLICATE_ID: 'BRIDGE_DUPLICATE_ID',
  BRIDGE_MISSING_PROVENANCE: 'BRIDGE_MISSING_PROVENANCE',
  BRIDGE_MISSING_SOURCE: 'BRIDGE_MISSING_SOURCE',
  BRIDGE_MISSING_RATIONALE: 'BRIDGE_MISSING_RATIONALE',
  BRIDGE_MISSING_PROVIDED_BY: 'BRIDGE_MISSING_PROVIDED_BY',
  BRIDGE_MISSING_BRIDGE_ID: 'BRIDGE_MISSING_BRIDGE_ID',
  BRIDGE_MISSING_PURPOSE: 'BRIDGE_MISSING_PURPOSE',
} as const;

// ---------------------------------------------------------------------------
// Single Analogy Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single analogy against canonical invariants.
 * Pure function. No side effects.
 */
export function validateAnalogy(
  analogy: Analogy,
): readonly AnalogyValidationError[] {
  const errors: AnalogyValidationError[] = [];

  if (!analogy.analogyId || analogy.analogyId.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_ANALOGY_ID,
      message: 'Analogy is missing an analogy ID.',
      field: 'analogyId',
      analogyId: analogy.analogyId,
    });
  }

  if (!analogy.title || analogy.title.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_TITLE,
      message: 'Analogy is missing a title.',
      field: 'title',
      analogyId: analogy.analogyId,
    });
  }

  if (!CANONICAL_ANALOGY_TYPES.includes(analogy.analogyType)) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.ANALOGY_INVALID_TYPE,
      message: `Analogy has unsupported type: "${analogy.analogyType}".`,
      field: 'analogyType',
      analogyId: analogy.analogyId,
    });
  }

  if (!CANONICAL_ABSTRACTION_LEVELS.includes(analogy.abstractionLevel)) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.ANALOGY_INVALID_ABSTRACTION_LEVEL,
      message: `Analogy has unsupported abstraction level: "${analogy.abstractionLevel}".`,
      field: 'abstractionLevel',
      analogyId: analogy.analogyId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(analogy.governanceStatus)) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.ANALOGY_INVALID_GOVERNANCE_STATUS,
      message: `Analogy has invalid governance status: "${analogy.governanceStatus}".`,
      field: 'governanceStatus',
      analogyId: analogy.analogyId,
    });
  }

  if (!analogy.provenance) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_PROVENANCE,
      message: 'Analogy is missing provenance.',
      field: 'provenance',
      analogyId: analogy.analogyId,
    });
  } else {
    if (!analogy.provenance.source || analogy.provenance.source.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_SOURCE,
        message: 'Analogy provenance is missing a source.',
        field: 'provenance.source',
        analogyId: analogy.analogyId,
      });
    }

    if (!analogy.provenance.rationale || analogy.provenance.rationale.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_RATIONALE,
        message: 'Analogy provenance is missing a rationale.',
        field: 'provenance.rationale',
        analogyId: analogy.analogyId,
      });
    }

    if (!analogy.provenance.providedBy || analogy.provenance.providedBy.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_PROVIDED_BY,
        message: 'Analogy provenance is missing providedBy.',
        field: 'provenance.providedBy',
        analogyId: analogy.analogyId,
      });
    }
  }

  if (!analogy.sourceConceptId || analogy.sourceConceptId.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_SOURCE_CONCEPT,
      message: 'Analogy is missing a source concept reference.',
      field: 'sourceConceptId',
      analogyId: analogy.analogyId,
    });
  }

  if (!analogy.targetConceptId || analogy.targetConceptId.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_TARGET_CONCEPT,
      message: 'Analogy is missing a target concept reference.',
      field: 'targetConceptId',
      analogyId: analogy.analogyId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Metaphor Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single metaphor against canonical invariants.
 * Pure function. No side effects.
 */
export function validateMetaphor(
  metaphor: Metaphor,
): readonly AnalogyValidationError[] {
  const errors: AnalogyValidationError[] = [];

  if (!metaphor.metaphorId || metaphor.metaphorId.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.METAPHOR_MISSING_METAPHOR_ID,
      message: 'Metaphor is missing a metaphor ID.',
      field: 'metaphorId',
      metaphorId: metaphor.metaphorId,
    });
  }

  if (!metaphor.title || metaphor.title.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.METAPHOR_MISSING_TITLE,
      message: 'Metaphor is missing a title.',
      field: 'title',
      metaphorId: metaphor.metaphorId,
    });
  }

  if (!CANONICAL_METAPHOR_TYPES.includes(metaphor.metaphorType)) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.METAPHOR_INVALID_TYPE,
      message: `Metaphor has unsupported type: "${metaphor.metaphorType}".`,
      field: 'metaphorType',
      metaphorId: metaphor.metaphorId,
    });
  }

  if (!metaphor.provenance) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.METAPHOR_MISSING_PROVENANCE,
      message: 'Metaphor is missing provenance.',
      field: 'provenance',
      metaphorId: metaphor.metaphorId,
    });
  } else {
    if (!metaphor.provenance.source || metaphor.provenance.source.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.METAPHOR_MISSING_SOURCE,
        message: 'Metaphor provenance is missing a source.',
        field: 'provenance.source',
        metaphorId: metaphor.metaphorId,
      });
    }

    if (!metaphor.provenance.rationale || metaphor.provenance.rationale.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.METAPHOR_MISSING_RATIONALE,
        message: 'Metaphor provenance is missing a rationale.',
        field: 'provenance.rationale',
        metaphorId: metaphor.metaphorId,
      });
    }

    if (!metaphor.provenance.providedBy || metaphor.provenance.providedBy.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.METAPHOR_MISSING_PROVIDED_BY,
        message: 'Metaphor provenance is missing providedBy.',
        field: 'provenance.providedBy',
        metaphorId: metaphor.metaphorId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Intuition Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single intuition against canonical invariants.
 * Pure function. No side effects.
 */
export function validateIntuition(
  intuition: Intuition,
): readonly AnalogyValidationError[] {
  const errors: AnalogyValidationError[] = [];

  if (!intuition.intuitionId || intuition.intuitionId.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.INTUITION_MISSING_INTUITION_ID,
      message: 'Intuition is missing an intuition ID.',
      field: 'intuitionId',
      intuitionId: intuition.intuitionId,
    });
  }

  if (!intuition.title || intuition.title.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.INTUITION_MISSING_TITLE,
      message: 'Intuition is missing a title.',
      field: 'title',
      intuitionId: intuition.intuitionId,
    });
  }

  if (!CANONICAL_INTUITION_TYPES.includes(intuition.intuitionType)) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.INTUITION_INVALID_TYPE,
      message: `Intuition has unsupported type: "${intuition.intuitionType}".`,
      field: 'intuitionType',
      intuitionId: intuition.intuitionId,
    });
  }

  if (!CANONICAL_ABSTRACTION_LEVELS.includes(intuition.abstractionLevel)) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.INTUITION_INVALID_ABSTRACTION_LEVEL,
      message: `Intuition has unsupported abstraction level: "${intuition.abstractionLevel}".`,
      field: 'abstractionLevel',
      intuitionId: intuition.intuitionId,
    });
  }

  if (!intuition.provenance) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.INTUITION_MISSING_PROVENANCE,
      message: 'Intuition is missing provenance.',
      field: 'provenance',
      intuitionId: intuition.intuitionId,
    });
  } else {
    if (!intuition.provenance.source || intuition.provenance.source.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.INTUITION_MISSING_SOURCE,
        message: 'Intuition provenance is missing a source.',
        field: 'provenance.source',
        intuitionId: intuition.intuitionId,
      });
    }

    if (!intuition.provenance.rationale || intuition.provenance.rationale.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.INTUITION_MISSING_RATIONALE,
        message: 'Intuition provenance is missing a rationale.',
        field: 'provenance.rationale',
        intuitionId: intuition.intuitionId,
      });
    }

    if (!intuition.provenance.providedBy || intuition.provenance.providedBy.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.INTUITION_MISSING_PROVIDED_BY,
        message: 'Intuition provenance is missing providedBy.',
        field: 'provenance.providedBy',
        intuitionId: intuition.intuitionId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Concept Mapping Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single concept mapping against canonical invariants.
 * Pure function. No side effects.
 */
export function validateConceptMapping(
  mapping: ConceptMapping,
): readonly AnalogyValidationError[] {
  const errors: AnalogyValidationError[] = [];

  if (!mapping.mappingId || mapping.mappingId.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.MAPPING_MISSING_MAPPING_ID,
      message: 'Concept mapping is missing a mapping ID.',
      field: 'mappingId',
      mappingId: mapping.mappingId,
    });
  }

  if (!mapping.description || mapping.description.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.MAPPING_MISSING_DESCRIPTION,
      message: 'Concept mapping is missing a description.',
      field: 'description',
      mappingId: mapping.mappingId,
    });
  }

  if (!CANONICAL_MAPPING_TYPES.includes(mapping.mappingType)) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.MAPPING_INVALID_TYPE,
      message: `Concept mapping has unsupported type: "${mapping.mappingType}".`,
      field: 'mappingType',
      mappingId: mapping.mappingId,
    });
  }

  if (!mapping.provenance) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.MAPPING_MISSING_PROVENANCE,
      message: 'Concept mapping is missing provenance.',
      field: 'provenance',
      mappingId: mapping.mappingId,
    });
  } else {
    if (!mapping.provenance.source || mapping.provenance.source.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.MAPPING_MISSING_SOURCE,
        message: 'Concept mapping provenance is missing a source.',
        field: 'provenance.source',
        mappingId: mapping.mappingId,
      });
    }

    if (!mapping.provenance.rationale || mapping.provenance.rationale.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.MAPPING_MISSING_RATIONALE,
        message: 'Concept mapping provenance is missing a rationale.',
        field: 'provenance.rationale',
        mappingId: mapping.mappingId,
      });
    }

    if (!mapping.provenance.providedBy || mapping.provenance.providedBy.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.MAPPING_MISSING_PROVIDED_BY,
        message: 'Concept mapping provenance is missing providedBy.',
        field: 'provenance.providedBy',
        mappingId: mapping.mappingId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Cognitive Bridge Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single cognitive bridge against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCognitiveBridge(
  bridge: CognitiveBridge,
): readonly AnalogyValidationError[] {
  const errors: AnalogyValidationError[] = [];

  if (!bridge.bridgeId || bridge.bridgeId.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.BRIDGE_MISSING_BRIDGE_ID,
      message: 'Cognitive bridge is missing a bridge ID.',
      field: 'bridgeId',
      bridgeId: bridge.bridgeId,
    });
  }

  if (!bridge.bridgePurpose || bridge.bridgePurpose.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.BRIDGE_MISSING_PURPOSE,
      message: 'Cognitive bridge is missing a purpose.',
      field: 'bridgePurpose',
      bridgeId: bridge.bridgeId,
    });
  }

  if (!bridge.provenance) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.BRIDGE_MISSING_PROVENANCE,
      message: 'Cognitive bridge is missing provenance.',
      field: 'provenance',
      bridgeId: bridge.bridgeId,
    });
  } else {
    if (!bridge.provenance.source || bridge.provenance.source.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.BRIDGE_MISSING_SOURCE,
        message: 'Cognitive bridge provenance is missing a source.',
        field: 'provenance.source',
        bridgeId: bridge.bridgeId,
      });
    }

    if (!bridge.provenance.rationale || bridge.provenance.rationale.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.BRIDGE_MISSING_RATIONALE,
        message: 'Cognitive bridge provenance is missing a rationale.',
        field: 'provenance.rationale',
        bridgeId: bridge.bridgeId,
      });
    }

    if (!bridge.provenance.providedBy || bridge.provenance.providedBy.trim() === '') {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.BRIDGE_MISSING_PROVIDED_BY,
        message: 'Cognitive bridge provenance is missing providedBy.',
        field: 'provenance.providedBy',
        bridgeId: bridge.bridgeId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Analogy Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates an analogy registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateAnalogyRegistry(
  registry: AnalogyRegistry,
): AnalogyRegistryValidationResult {
  const errors: AnalogyValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.ANALOGY_EMPTY_REGISTRY,
      message: 'Analogy registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.ANALOGY_INVALID_TRACE,
      message: 'Analogy registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.ANALOGY_TRACE_RANDOM_USED,
      message: 'Analogy registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.ANALOGY_TRACE_TIME_DEPENDENCY,
      message: 'Analogy registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate analogy IDs
  const seenAnalogyIds = new Set<string>();
  for (const analogy of registry.analogies) {
    if (seenAnalogyIds.has(analogy.analogyId)) {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.ANALOGY_DUPLICATE_ID,
        message: `Duplicate analogy ID: "${analogy.analogyId}".`,
        analogyId: analogy.analogyId,
      });
    }
    seenAnalogyIds.add(analogy.analogyId);
  }

  // Check for duplicate metaphor IDs
  const seenMetaphorIds = new Set<string>();
  for (const metaphor of registry.metaphors) {
    if (seenMetaphorIds.has(metaphor.metaphorId)) {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.METAPHOR_DUPLICATE_ID,
        message: `Duplicate metaphor ID: "${metaphor.metaphorId}".`,
        metaphorId: metaphor.metaphorId,
      });
    }
    seenMetaphorIds.add(metaphor.metaphorId);
  }

  // Check for duplicate intuition IDs
  const seenIntuitionIds = new Set<string>();
  for (const intuition of registry.intuitions) {
    if (seenIntuitionIds.has(intuition.intuitionId)) {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.INTUITION_DUPLICATE_ID,
        message: `Duplicate intuition ID: "${intuition.intuitionId}".`,
        intuitionId: intuition.intuitionId,
      });
    }
    seenIntuitionIds.add(intuition.intuitionId);
  }

  // Check for duplicate mapping IDs
  const seenMappingIds = new Set<string>();
  for (const mapping of registry.mappings) {
    if (seenMappingIds.has(mapping.mappingId)) {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.MAPPING_DUPLICATE_ID,
        message: `Duplicate mapping ID: "${mapping.mappingId}".`,
        mappingId: mapping.mappingId,
      });
    }
    seenMappingIds.add(mapping.mappingId);
  }

  // Check for duplicate bridge IDs
  const seenBridgeIds = new Set<string>();
  for (const bridge of registry.bridges) {
    if (seenBridgeIds.has(bridge.bridgeId)) {
      errors.push({
        code: ANALOGY_VALIDATION_CODES.BRIDGE_DUPLICATE_ID,
        message: `Duplicate bridge ID: "${bridge.bridgeId}".`,
        bridgeId: bridge.bridgeId,
      });
    }
    seenBridgeIds.add(bridge.bridgeId);
  }

  // Validate each entity
  for (const analogy of registry.analogies) {
    errors.push(...validateAnalogy(analogy));
  }

  for (const metaphor of registry.metaphors) {
    errors.push(...validateMetaphor(metaphor));
  }

  for (const intuition of registry.intuitions) {
    errors.push(...validateIntuition(intuition));
  }

  for (const mapping of registry.mappings) {
    errors.push(...validateConceptMapping(mapping));
  }

  for (const bridge of registry.bridges) {
    errors.push(...validateCognitiveBridge(bridge));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'analogy_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Analogy Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates analogy input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateAnalogyInput(
  input: AnalogyInput,
): AnalogyInputValidationResult {
  const errors: AnalogyValidationError[] = [];

  for (const analogy of input.analogies) {
    errors.push(...validateAnalogy(analogy));
  }

  for (const metaphor of input.metaphors) {
    errors.push(...validateMetaphor(metaphor));
  }

  for (const intuition of input.intuitions) {
    errors.push(...validateIntuition(intuition));
  }

  for (const mapping of input.mappings) {
    errors.push(...validateConceptMapping(mapping));
  }

  for (const bridge of input.bridges) {
    errors.push(...validateCognitiveBridge(bridge));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'analogy_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Analogies Validation
// ---------------------------------------------------------------------------

/**
 * Validates a narrative artifact with analogies against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeArtifactWithAnalogies(
  artifact: NarrativeArtifactWithAnalogies,
): NarrativeArtifactWithAnalogiesValidationResult {
  const errors: AnalogyValidationError[] = [];

  if (!artifact.narrativeId || artifact.narrativeId.trim() === '') {
    errors.push({
      code: ANALOGY_VALIDATION_CODES.ANALOGY_MISSING_ANALOGY_ID,
      message: 'Narrative artifact with analogies is missing a narrative ID.',
      field: 'narrativeId',
    });
  }

  for (const analogy of artifact.analogies) {
    errors.push(...validateAnalogy(analogy));
  }

  for (const metaphor of artifact.metaphors) {
    errors.push(...validateMetaphor(metaphor));
  }

  for (const intuition of artifact.intuitions) {
    errors.push(...validateIntuition(intuition));
  }

  for (const mapping of artifact.mappings) {
    errors.push(...validateConceptMapping(mapping));
  }

  for (const bridge of artifact.bridges) {
    errors.push(...validateCognitiveBridge(bridge));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'narrative_artifact_with_analogies_composition',
  };
}