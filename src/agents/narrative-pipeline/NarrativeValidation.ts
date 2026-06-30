/**
 * NV-1700-D6-OPT-01 — Narrative Validation Layer
 *
 * Deterministic validation for narrative metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  NarrativeUnit,
  NarrativeRegistry,
  NarrativeTrace,
  NarrativeInput,
  NarrativeValidationError,
  NarrativeUnitValidationResult,
  NarrativeRegistryValidationResult,
  NarrativeInputValidationResult,
  NarrativeTraceValidationResult,
  NarrativeArtifact,
  NarrativeArtifactValidationResult,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_NARRATIVE_UNIT_TYPES,
  CANONICAL_NARRATIVE_MODES,
  CANONICAL_NARRATIVE_DOMAINS,
  CANONICAL_NARRATIVE_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const NARRATIVE_VALIDATION_CODES = {
  NARRATIVE_DUPLICATE_ID: 'NARRATIVE_DUPLICATE_ID',
  NARRATIVE_DUPLICATE_TITLE: 'NARRATIVE_DUPLICATE_TITLE',
  NARRATIVE_INVALID_UNIT_TYPE: 'NARRATIVE_INVALID_UNIT_TYPE',
  NARRATIVE_INVALID_MODE: 'NARRATIVE_INVALID_MODE',
  NARRATIVE_INVALID_DOMAIN: 'NARRATIVE_INVALID_DOMAIN',
  NARRATIVE_INVALID_STATUS: 'NARRATIVE_INVALID_STATUS',
  NARRATIVE_INVALID_GOVERNANCE_STATUS: 'NARRATIVE_INVALID_GOVERNANCE_STATUS',
  NARRATIVE_MISSING_PROVENANCE: 'NARRATIVE_MISSING_PROVENANCE',
  NARRATIVE_MISSING_SOURCE: 'NARRATIVE_MISSING_SOURCE',
  NARRATIVE_MISSING_RATIONALE: 'NARRATIVE_MISSING_RATIONALE',
  NARRATIVE_MISSING_PROVIDED_BY: 'NARRATIVE_MISSING_PROVIDED_BY',
  NARRATIVE_MISSING_CANONICAL_REFERENCE: 'NARRATIVE_MISSING_CANONICAL_REFERENCE',
  NARRATIVE_INVALID_SEQUENCE_ORDER: 'NARRATIVE_INVALID_SEQUENCE_ORDER',
  NARRATIVE_EMPTY_REGISTRY: 'NARRATIVE_EMPTY_REGISTRY',
  NARRATIVE_INVALID_TRACE: 'NARRATIVE_INVALID_TRACE',
  NARRATIVE_TRACE_NOT_DETERMINISTIC: 'NARRATIVE_TRACE_NOT_DETERMINISTIC',
  NARRATIVE_TRACE_RANDOM_USED: 'NARRATIVE_TRACE_RANDOM_USED',
  NARRATIVE_TRACE_TIME_DEPENDENCY: 'NARRATIVE_TRACE_TIME_DEPENDENCY',
  NARRATIVE_TRACE_MUTATED: 'NARRATIVE_TRACE_MUTATED',
  NARRATIVE_MISSING_NARRATIVE_ID: 'NARRATIVE_MISSING_NARRATIVE_ID',
  NARRATIVE_MISSING_TITLE: 'NARRATIVE_MISSING_TITLE',
} as const;

// ---------------------------------------------------------------------------
// Single Narrative Unit Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single narrative unit against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeUnit(
  unit: NarrativeUnit,
): readonly NarrativeValidationError[] {
  const errors: NarrativeValidationError[] = [];

  if (!unit.narrativeId || unit.narrativeId.trim() === '') {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_NARRATIVE_ID,
      message: 'Narrative unit is missing a narrative ID.',
      field: 'narrativeId',
      narrativeId: unit.narrativeId,
    });
  }

  if (!unit.title || unit.title.trim() === '') {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_TITLE,
      message: 'Narrative unit is missing a title.',
      field: 'title',
      narrativeId: unit.narrativeId,
    });
  }

  if (!CANONICAL_NARRATIVE_UNIT_TYPES.includes(unit.unitType)) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_UNIT_TYPE,
      message: `Narrative unit has unsupported type: "${unit.unitType}".`,
      field: 'unitType',
      narrativeId: unit.narrativeId,
    });
  }

  if (!CANONICAL_NARRATIVE_MODES.includes(unit.narrativeMode)) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_MODE,
      message: `Narrative unit has unsupported mode: "${unit.narrativeMode}".`,
      field: 'narrativeMode',
      narrativeId: unit.narrativeId,
    });
  }

  if (!CANONICAL_NARRATIVE_DOMAINS.includes(unit.domain)) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_DOMAIN,
      message: `Narrative unit has unsupported domain: "${unit.domain}".`,
      field: 'domain',
      narrativeId: unit.narrativeId,
    });
  }

  if (!CANONICAL_NARRATIVE_STATUS.includes(unit.status)) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_STATUS,
      message: `Narrative unit has unsupported status: "${unit.status}".`,
      field: 'status',
      narrativeId: unit.narrativeId,
    });
  }

  if (!unit.provenance) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_PROVENANCE,
      message: 'Narrative unit is missing provenance.',
      field: 'provenance',
      narrativeId: unit.narrativeId,
    });
  } else {
    if (!unit.provenance.source || unit.provenance.source.trim() === '') {
      errors.push({
        code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_SOURCE,
        message: 'Narrative provenance is missing a source.',
        field: 'provenance.source',
        narrativeId: unit.narrativeId,
      });
    }

    if (!unit.provenance.rationale || unit.provenance.rationale.trim() === '') {
      errors.push({
        code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_RATIONALE,
        message: 'Narrative provenance is missing a rationale.',
        field: 'provenance.rationale',
        narrativeId: unit.narrativeId,
      });
    }

    if (!unit.provenance.providedBy || unit.provenance.providedBy.trim() === '') {
      errors.push({
        code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_PROVIDED_BY,
        message: 'Narrative provenance is missing providedBy.',
        field: 'provenance.providedBy',
        narrativeId: unit.narrativeId,
      });
    }

    if (!CANONICAL_GOVERNANCE_STATUSES.includes(unit.provenance.governanceStatus)) {
      errors.push({
        code: NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_GOVERNANCE_STATUS,
        message: `Narrative provenance has invalid governance status: "${unit.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        narrativeId: unit.narrativeId,
      });
    }
  }

  if (!unit.canonicalKnowledgeId || unit.canonicalKnowledgeId.trim() === '') {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_CANONICAL_REFERENCE,
      message: 'Narrative unit is missing a canonical knowledge reference.',
      field: 'canonicalKnowledgeId',
      narrativeId: unit.narrativeId,
    });
  }

  if (typeof unit.sequenceOrder !== 'number' || unit.sequenceOrder < 0) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_SEQUENCE_ORDER,
      message: `Narrative unit has invalid sequence order: ${unit.sequenceOrder}.`,
      field: 'sequenceOrder',
      narrativeId: unit.narrativeId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Narrative Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single narrative artifact against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeArtifact(
  artifact: NarrativeArtifact,
): readonly NarrativeValidationError[] {
  const errors: NarrativeValidationError[] = [];

  if (!artifact.narrativeId || artifact.narrativeId.trim() === '') {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_NARRATIVE_ID,
      message: 'Narrative artifact is missing a narrative ID.',
      field: 'narrativeId',
      narrativeId: artifact.narrativeId,
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_TITLE,
      message: 'Narrative artifact is missing a title.',
      field: 'title',
      narrativeId: artifact.narrativeId,
    });
  }

  if (!CANONICAL_NARRATIVE_UNIT_TYPES.includes(artifact.unitType)) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_UNIT_TYPE,
      message: `Narrative artifact has unsupported type: "${artifact.unitType}".`,
      field: 'unitType',
      narrativeId: artifact.narrativeId,
    });
  }

  if (!CANONICAL_NARRATIVE_MODES.includes(artifact.narrativeMode)) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_MODE,
      message: `Narrative artifact has unsupported mode: "${artifact.narrativeMode}".`,
      field: 'narrativeMode',
      narrativeId: artifact.narrativeId,
    });
  }

  if (!CANONICAL_NARRATIVE_DOMAINS.includes(artifact.domain)) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_DOMAIN,
      message: `Narrative artifact has unsupported domain: "${artifact.domain}".`,
      field: 'domain',
      narrativeId: artifact.narrativeId,
    });
  }

  if (!CANONICAL_NARRATIVE_STATUS.includes(artifact.status)) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_STATUS,
      message: `Narrative artifact has unsupported status: "${artifact.status}".`,
      field: 'status',
      narrativeId: artifact.narrativeId,
    });
  }

  if (!artifact.provenance) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_PROVENANCE,
      message: 'Narrative artifact is missing provenance.',
      field: 'provenance',
      narrativeId: artifact.narrativeId,
    });
  } else {
    if (!artifact.provenance.source || artifact.provenance.source.trim() === '') {
      errors.push({
        code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_SOURCE,
        message: 'Narrative provenance is missing a source.',
        field: 'provenance.source',
        narrativeId: artifact.narrativeId,
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_RATIONALE,
        message: 'Narrative provenance is missing a rationale.',
        field: 'provenance.rationale',
        narrativeId: artifact.narrativeId,
      });
    }

    if (!artifact.provenance.providedBy || artifact.provenance.providedBy.trim() === '') {
      errors.push({
        code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_PROVIDED_BY,
        message: 'Narrative provenance is missing providedBy.',
        field: 'provenance.providedBy',
        narrativeId: artifact.narrativeId,
      });
    }
  }

  if (!artifact.canonicalKnowledgeId || artifact.canonicalKnowledgeId.trim() === '') {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_CANONICAL_REFERENCE,
      message: 'Narrative artifact is missing a canonical knowledge reference.',
      field: 'canonicalKnowledgeId',
      narrativeId: artifact.narrativeId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Narrative Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a narrative registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeRegistry(
  registry: NarrativeRegistry,
): NarrativeRegistryValidationResult {
  const errors: NarrativeValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.narratives || registry.narratives.length === 0) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_EMPTY_REGISTRY,
      message: 'Registry has no narratives.',
      field: 'narratives',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_TRACE_NOT_DETERMINISTIC,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_TRACE_RANDOM_USED,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_TRACE_TIME_DEPENDENCY,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate narrative IDs
  const seenIds = new Set<string>();
  for (const narrative of registry.narratives) {
    if (seenIds.has(narrative.narrativeId)) {
      errors.push({
        code: NARRATIVE_VALIDATION_CODES.NARRATIVE_DUPLICATE_ID,
        message: `Duplicate narrative ID: "${narrative.narrativeId}".`,
        narrativeId: narrative.narrativeId,
      });
    }
    seenIds.add(narrative.narrativeId);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const narrative of registry.narratives) {
    if (seenTitles.has(narrative.title)) {
      errors.push({
        code: NARRATIVE_VALIDATION_CODES.NARRATIVE_DUPLICATE_TITLE,
        message: `Duplicate narrative title: "${narrative.title}".`,
        field: 'title',
        narrativeId: narrative.narrativeId,
      });
    }
    seenTitles.add(narrative.title);
  }

  // Validate each narrative unit
  for (const narrative of registry.narratives) {
    errors.push(...validateNarrativeUnit(narrative));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'narrative_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Narrative Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates narrative input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeInput(
  input: NarrativeInput,
): NarrativeInputValidationResult {
  const errors: NarrativeValidationError[] = [];

  if (!input.narratives || input.narratives.length === 0) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_EMPTY_REGISTRY,
      message: 'Input has no narratives.',
      field: 'narratives',
    });
  } else {
    for (const narrative of input.narratives) {
      errors.push(...validateNarrativeUnit(narrative));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'narrative_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Narrative Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a narrative trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeTrace(
  trace: NarrativeTrace,
): NarrativeTraceValidationResult {
  const errors: NarrativeValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_TRACE,
      message: 'Narrative trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_TRACE_NOT_DETERMINISTIC,
      message: 'Narrative trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_TRACE_RANDOM_USED,
      message: 'Narrative trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: NARRATIVE_VALIDATION_CODES.NARRATIVE_TRACE_TIME_DEPENDENCY,
      message: 'Narrative trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'narrative_trace_composition',
  };
}
