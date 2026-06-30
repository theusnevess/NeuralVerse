/**
 * NV-1600-D4-OPT-01 — Laboratory Validation Layer
 *
 * Deterministic validation for laboratory metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryMetadata,
  LaboratoryRegistry,
  LaboratoryArtifact,
  LaboratoryInput,
  LaboratoryValidationError,
  LaboratoryValidationResult,
  LaboratoryRegistryValidationResult,
  LaboratoryArtifactValidationResult,
  LaboratoryInputValidationResult,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_LABORATORY_TYPES,
  CANONICAL_LABORATORY_LEVELS,
  CANONICAL_LABORATORY_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const LABORATORY_VALIDATION_CODES = {
  LAB_UNKNOWN_TYPE: 'LAB_UNKNOWN_TYPE',
  LAB_UNKNOWN_LEVEL: 'LAB_UNKNOWN_LEVEL',
  LAB_UNKNOWN_STATUS: 'LAB_UNKNOWN_STATUS',
  LAB_DUPLICATE_ID: 'LAB_DUPLICATE_ID',
  LAB_DUPLICATE_TITLE: 'LAB_DUPLICATE_TITLE',
  LAB_INVALID_REFERENCE: 'LAB_INVALID_REFERENCE',
  LAB_EMPTY_REGISTRY: 'LAB_EMPTY_REGISTRY',
  LAB_MISSING_SOURCE: 'LAB_MISSING_SOURCE',
  LAB_MISSING_RATIONALE: 'LAB_MISSING_RATIONALE',
  LAB_MISSING_PROVIDED_BY: 'LAB_MISSING_PROVIDED_BY',
  LAB_MISSING_PROVENANCE: 'LAB_MISSING_PROVENANCE',
  LAB_INVALID_STATUS: 'LAB_INVALID_STATUS',
  LAB_INVALID_TRACE: 'LAB_INVALID_TRACE',
  LAB_INVALID_ARTIFACT: 'LAB_INVALID_ARTIFACT',
  LAB_INVALID_INPUT: 'LAB_INVALID_INPUT',
  LAB_MISSING_LABORATORY_ID: 'LAB_MISSING_LABORATORY_ID',
  LAB_MISSING_TITLE: 'LAB_MISSING_TITLE',
  LAB_INVALID_GOVERNANCE: 'LAB_INVALID_GOVERNANCE',
  LAB_MISSING_METADATA: 'LAB_MISSING_METADATA',
  LAB_MISSING_PROVENANCE_DATA: 'LAB_MISSING_PROVENANCE_DATA',
  LAB_INVALID_NODE: 'LAB_INVALID_NODE',
} as const;

// ---------------------------------------------------------------------------
// Single Laboratory Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single laboratory metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratory(
  lab: LaboratoryMetadata,
): readonly LaboratoryValidationError[] {
  const errors: LaboratoryValidationError[] = [];

  if (!lab.laboratoryId || lab.laboratoryId.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_MISSING_LABORATORY_ID,
      message: 'Laboratory is missing a laboratory ID.',
      field: 'laboratoryId',
      laboratoryId: lab.laboratoryId,
    });
  }

  if (!lab.title || lab.title.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_MISSING_TITLE,
      message: 'Laboratory is missing a title.',
      field: 'title',
      laboratoryId: lab.laboratoryId,
    });
  }

  if (!lab.description || lab.description.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_INVALID_INPUT,
      message: 'Laboratory is missing a description.',
      field: 'description',
      laboratoryId: lab.laboratoryId,
    });
  }

  if (!CANONICAL_LABORATORY_TYPES.includes(lab.laboratoryType)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_UNKNOWN_TYPE,
      message: `Laboratory has unsupported type: "${lab.laboratoryType}".`,
      field: 'laboratoryType',
      laboratoryId: lab.laboratoryId,
    });
  }

  if (!CANONICAL_LABORATORY_LEVELS.includes(lab.laboratoryLevel)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_UNKNOWN_LEVEL,
      message: `Laboratory has unsupported level: "${lab.laboratoryLevel}".`,
      field: 'laboratoryLevel',
      laboratoryId: lab.laboratoryId,
    });
  }

  if (!CANONICAL_LABORATORY_STATUS.includes(lab.status)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_UNKNOWN_STATUS,
      message: `Laboratory has unsupported status: "${lab.status}".`,
      field: 'status',
      laboratoryId: lab.laboratoryId,
    });
  }

  if (!lab.governanceStatus || !CANONICAL_GOVERNANCE_STATUSES.includes(lab.governanceStatus)) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_INVALID_GOVERNANCE,
      message: `Laboratory has invalid governance status: "${lab.governanceStatus}".`,
      field: 'governanceStatus',
      laboratoryId: lab.laboratoryId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Laboratory Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a laboratory registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryRegistry(
  registry: LaboratoryRegistry,
): LaboratoryRegistryValidationResult {
  const errors: LaboratoryValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_MISSING_PROVENANCE,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.laboratories || registry.laboratories.length === 0) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_EMPTY_REGISTRY,
      message: 'Registry has no laboratories.',
      field: 'laboratories',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate IDs
  const seenIds = new Set<string>();
  for (const lab of registry.laboratories) {
    if (seenIds.has(lab.laboratoryId)) {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LAB_DUPLICATE_ID,
        message: `Duplicate laboratory ID: "${lab.laboratoryId}".`,
        laboratoryId: lab.laboratoryId,
      });
    }
    seenIds.add(lab.laboratoryId);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const lab of registry.laboratories) {
    if (seenTitles.has(lab.title)) {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LAB_DUPLICATE_TITLE,
        message: `Duplicate laboratory title: "${lab.title}".`,
        field: 'title',
        laboratoryId: lab.laboratoryId,
      });
    }
    seenTitles.add(lab.title);
  }

  // Validate each laboratory
  for (const lab of registry.laboratories) {
    errors.push(...validateLaboratory(lab));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'laboratory_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Laboratory Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a laboratory artifact against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryArtifact(
  artifact: LaboratoryArtifact,
): LaboratoryArtifactValidationResult {
  const errors: LaboratoryValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_INVALID_ARTIFACT,
      message: 'Artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!artifact.laboratoryNode) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_INVALID_NODE,
      message: 'Artifact is missing a laboratory node.',
      field: 'laboratoryNode',
    });
  } else {
    if (!artifact.laboratoryNode.nodeId || artifact.laboratoryNode.nodeId.trim() === '') {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LAB_INVALID_NODE,
        message: 'Laboratory node is missing a node ID.',
        field: 'nodeId',
      });
    }

    if (!artifact.laboratoryNode.laboratoryId || artifact.laboratoryNode.laboratoryId.trim() === '') {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LAB_INVALID_NODE,
        message: 'Laboratory node is missing a laboratory ID.',
        field: 'laboratoryId',
      });
    }

    if (artifact.laboratoryNode.metadata) {
      errors.push(...validateLaboratory(artifact.laboratoryNode.metadata));
    } else {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LAB_MISSING_METADATA,
        message: 'Laboratory node is missing metadata.',
        field: 'metadata',
      });
    }

    if (!artifact.laboratoryNode.provenance) {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LAB_MISSING_PROVENANCE_DATA,
        message: 'Laboratory node is missing provenance.',
        field: 'provenance',
      });
    } else {
      if (!artifact.laboratoryNode.provenance.source || artifact.laboratoryNode.provenance.source.trim() === '') {
        errors.push({
          code: LABORATORY_VALIDATION_CODES.LAB_MISSING_SOURCE,
          message: 'Laboratory provenance is missing a source.',
          field: 'provenance.source',
        });
      }

      if (!artifact.laboratoryNode.provenance.rationale || artifact.laboratoryNode.provenance.rationale.trim() === '') {
        errors.push({
          code: LABORATORY_VALIDATION_CODES.LAB_MISSING_RATIONALE,
          message: 'Laboratory provenance is missing a rationale.',
          field: 'provenance.rationale',
        });
      }

      if (!artifact.laboratoryNode.provenance.providedBy || artifact.laboratoryNode.provenance.providedBy.trim() === '') {
        errors.push({
          code: LABORATORY_VALIDATION_CODES.LAB_MISSING_PROVIDED_BY,
          message: 'Laboratory provenance is missing providedBy.',
          field: 'provenance.providedBy',
        });
      }
    }
  }

  if (!artifact.trace) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_INVALID_TRACE,
      message: 'Artifact is missing a trace.',
      field: 'trace',
    });
  } else {
    if (artifact.trace.deterministic !== true) {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LAB_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (artifact.trace.randomUsed !== false) {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LAB_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (artifact.trace.timeDependency !== false) {
      errors.push({
        code: LABORATORY_VALIDATION_CODES.LAB_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'laboratory_artifact_composition',
  };
}

// ---------------------------------------------------------------------------
// Laboratory Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates laboratory input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryInput(
  input: LaboratoryInput,
): LaboratoryInputValidationResult {
  const errors: LaboratoryValidationError[] = [];

  if (!input.laboratories || input.laboratories.length === 0) {
    errors.push({
      code: LABORATORY_VALIDATION_CODES.LAB_EMPTY_REGISTRY,
      message: 'Input has no laboratories.',
      field: 'laboratories',
    });
  } else {
    for (const lab of input.laboratories) {
      errors.push(...validateLaboratory(lab));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'laboratory_input_composition',
  };
}
