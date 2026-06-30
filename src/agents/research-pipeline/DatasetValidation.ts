/**
 * NV-1400-D2-OPT-06 — Dataset Validation Layer
 *
 * Deterministic validation for research dataset metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchDataset,
  ResearchDatasetRegistry,
  ResearchArtifactWithDatasets,
  ResearchDatasetValidationError,
  ResearchDatasetValidationResult,
  ResearchDatasetInput,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_DATASET_DOMAINS,
  CANONICAL_DATASET_TASKS,
  CANONICAL_DATASET_ANNOTATION_TYPES,
  CANONICAL_DATASET_LICENSES,
  CANONICAL_DATASET_SCALES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const DATASET_VALIDATION_CODES = {
  DATASET_UNKNOWN_DOMAIN: 'DATASET_UNKNOWN_DOMAIN',
  DATASET_UNKNOWN_TASK: 'DATASET_UNKNOWN_TASK',
  DATASET_UNKNOWN_SCALE: 'DATASET_UNKNOWN_SCALE',
  DATASET_UNKNOWN_ANNOTATION: 'DATASET_UNKNOWN_ANNOTATION',
  DATASET_DUPLICATE_ID: 'DATASET_DUPLICATE_ID',
  DATASET_DUPLICATE_NAME: 'DATASET_DUPLICATE_NAME',
  DATASET_MISSING_SOURCE: 'DATASET_MISSING_SOURCE',
  DATASET_MISSING_EVIDENCE: 'DATASET_MISSING_EVIDENCE',
  DATASET_MISSING_LICENSE: 'DATASET_MISSING_LICENSE',
  DATASET_INVALID_REFERENCE: 'DATASET_INVALID_REFERENCE',
  DATASET_EMPTY_REGISTRY: 'DATASET_EMPTY_REGISTRY',
  DATASET_MISSING_PROVENANCE: 'DATASET_MISSING_PROVENANCE',
  DATASET_INVALID_STATUS: 'DATASET_INVALID_STATUS',
} as const;

// ---------------------------------------------------------------------------
// Dataset Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single dataset.
 * Pure function. No side effects.
 */
export function validateDataset(
  dataset: ResearchDataset,
): readonly ResearchDatasetValidationError[] {
  const errors: ResearchDatasetValidationError[] = [];

  if (!dataset.datasetId || dataset.datasetId.trim() === '') {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_MISSING_SOURCE,
      message: 'Dataset is missing an ID.',
      field: 'datasetId',
      datasetId: dataset.datasetId,
    });
  }

  if (!dataset.datasetName || dataset.datasetName.trim() === '') {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_MISSING_SOURCE,
      message: 'Dataset is missing a name.',
      field: 'datasetName',
      datasetId: dataset.datasetId,
    });
  }

  if (!CANONICAL_DATASET_DOMAINS.includes(dataset.domain)) {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_UNKNOWN_DOMAIN,
      message: `Dataset has unknown domain: "${dataset.domain}".`,
      field: 'domain',
      datasetId: dataset.datasetId,
    });
  }

  if (!CANONICAL_DATASET_TASKS.includes(dataset.primaryTask)) {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_UNKNOWN_TASK,
      message: `Dataset has unknown primary task: "${dataset.primaryTask}".`,
      field: 'primaryTask',
      datasetId: dataset.datasetId,
    });
  }

  if (!dataset.supportedTasks || dataset.supportedTasks.length === 0) {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_UNKNOWN_TASK,
      message: 'Dataset has no supported tasks.',
      field: 'supportedTasks',
      datasetId: dataset.datasetId,
    });
  } else {
    for (const task of dataset.supportedTasks) {
      if (!CANONICAL_DATASET_TASKS.includes(task)) {
        errors.push({
          code: DATASET_VALIDATION_CODES.DATASET_UNKNOWN_TASK,
          message: `Dataset has unsupported task: "${task}".`,
          field: 'supportedTasks',
          datasetId: dataset.datasetId,
        });
      }
    }
  }

  if (!CANONICAL_DATASET_ANNOTATION_TYPES.includes(dataset.annotationType)) {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_UNKNOWN_ANNOTATION,
      message: `Dataset has unknown annotation type: "${dataset.annotationType}".`,
      field: 'annotationType',
      datasetId: dataset.datasetId,
    });
  }

  if (!CANONICAL_DATASET_LICENSES.includes(dataset.license)) {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_MISSING_LICENSE,
      message: `Dataset has unknown license: "${dataset.license}".`,
      field: 'license',
      datasetId: dataset.datasetId,
    });
  }

  if (!CANONICAL_DATASET_SCALES.includes(dataset.scale)) {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_UNKNOWN_SCALE,
      message: `Dataset has unknown scale: "${dataset.scale}".`,
      field: 'scale',
      datasetId: dataset.datasetId,
    });
  }

  if (typeof dataset.publicationYear !== 'number' || dataset.publicationYear < 0) {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_MISSING_SOURCE,
      message: 'Dataset has invalid publication year.',
      field: 'publicationYear',
      datasetId: dataset.datasetId,
    });
  }

  if (!dataset.officialSource || dataset.officialSource.trim() === '') {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_MISSING_SOURCE,
      message: 'Dataset is missing an official source.',
      field: 'officialSource',
      datasetId: dataset.datasetId,
    });
  }

  if (!dataset.associatedEvidence || dataset.associatedEvidence.length === 0) {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_MISSING_EVIDENCE,
      message: 'Dataset has no associated evidence.',
      field: 'associatedEvidence',
      datasetId: dataset.datasetId,
    });
  }

  if (!dataset.rationale || dataset.rationale.trim() === '') {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_MISSING_SOURCE,
      message: 'Dataset is missing a rationale.',
      field: 'rationale',
      datasetId: dataset.datasetId,
    });
  }

  if (!dataset.provenance || typeof dataset.provenance !== 'object') {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_MISSING_PROVENANCE,
      message: 'Dataset is missing provenance.',
      field: 'provenance',
      datasetId: dataset.datasetId,
    });
  } else {
    if (!dataset.provenance.rationale || dataset.provenance.rationale.trim() === '') {
      errors.push({
        code: DATASET_VALIDATION_CODES.DATASET_MISSING_PROVENANCE,
        message: 'Dataset provenance is missing rationale.',
        field: 'provenance.rationale',
        datasetId: dataset.datasetId,
      });
    }
    if (!dataset.provenance.source || dataset.provenance.source.trim() === '') {
      errors.push({
        code: DATASET_VALIDATION_CODES.DATASET_MISSING_PROVENANCE,
        message: 'Dataset provenance is missing source.',
        field: 'provenance.source',
        datasetId: dataset.datasetId,
      });
    }
  }

  if (!dataset.governanceStatus || dataset.governanceStatus.trim() === '') {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_INVALID_STATUS,
      message: 'Dataset is missing governance status.',
      field: 'governanceStatus',
      datasetId: dataset.datasetId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a dataset registry for structural integrity.
 * Pure function. No side effects.
 */
export function validateDatasetRegistry(
  registry: ResearchDatasetRegistry,
): readonly ResearchDatasetValidationError[] {
  const errors: ResearchDatasetValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_MISSING_SOURCE,
      message: 'Dataset registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  // Check for empty registry
  if (!registry.datasets || registry.datasets.length === 0) {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_EMPTY_REGISTRY,
      message: 'Dataset registry has no datasets.',
      field: 'datasets',
    });
  }

  // Validate all datasets
  if (registry.datasets) {
    for (const dataset of registry.datasets) {
      errors.push(...validateDataset(dataset));
    }
  }

  // Check for duplicate IDs
  if (registry.datasets) {
    const seenIds = new Set<string>();
    for (const dataset of registry.datasets) {
      if (seenIds.has(dataset.datasetId)) {
        errors.push({
          code: DATASET_VALIDATION_CODES.DATASET_DUPLICATE_ID,
          message: `Duplicate dataset ID: "${dataset.datasetId}".`,
          datasetId: dataset.datasetId,
        });
      }
      seenIds.add(dataset.datasetId);
    }
  }

  // Check for duplicate names
  if (registry.datasets) {
    const seenNames = new Set<string>();
    for (const dataset of registry.datasets) {
      if (seenNames.has(dataset.datasetName)) {
        errors.push({
          code: DATASET_VALIDATION_CODES.DATASET_DUPLICATE_NAME,
          message: `Duplicate dataset name: "${dataset.datasetName}".`,
          datasetId: dataset.datasetId,
        });
      }
      seenNames.add(dataset.datasetName);
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a research artifact with datasets.
 * Pure function. No side effects.
 */
export function validateResearchArtifactWithDatasets(
  artifact: ResearchArtifactWithDatasets,
): ResearchDatasetValidationResult {
  const errors: ResearchDatasetValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_MISSING_SOURCE,
      message: 'Research artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate dataset registry
  errors.push(...validateDatasetRegistry(artifact.datasetRegistry));

  // Validate trace
  if (!artifact.datasetTrace || typeof artifact.datasetTrace !== 'object') {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_MISSING_PROVENANCE,
      message: 'Research artifact is missing dataset trace.',
      field: 'datasetTrace',
    });
  } else {
    if (artifact.datasetTrace.deterministic !== true) {
      errors.push({
        code: DATASET_VALIDATION_CODES.DATASET_MISSING_PROVENANCE,
        message: 'Dataset trace must declare deterministic: true.',
        field: 'datasetTrace.deterministic',
      });
    }
    if (artifact.datasetTrace.randomUsed !== false) {
      errors.push({
        code: DATASET_VALIDATION_CODES.DATASET_MISSING_PROVENANCE,
        message: 'Dataset trace must declare randomUsed: false.',
        field: 'datasetTrace.randomUsed',
      });
    }
    if (artifact.datasetTrace.timeDependency !== false) {
      errors.push({
        code: DATASET_VALIDATION_CODES.DATASET_MISSING_PROVENANCE,
        message: 'Dataset trace must declare timeDependency: false.',
        field: 'datasetTrace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'dataset_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates research dataset input.
 * Pure function. No side effects.
 */
export function validateDatasetInput(
  input: ResearchDatasetInput,
): readonly ResearchDatasetValidationError[] {
  const errors: ResearchDatasetValidationError[] = [];

  if (!input.conceptId || input.conceptId.trim() === '') {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_MISSING_SOURCE,
      message: 'Dataset input is missing concept ID.',
      field: 'conceptId',
    });
  }

  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_MISSING_SOURCE,
      message: 'Dataset input is missing concept label.',
      field: 'conceptLabel',
    });
  }

  if (!input.datasets || input.datasets.length === 0) {
    errors.push({
      code: DATASET_VALIDATION_CODES.DATASET_EMPTY_REGISTRY,
      message: 'Dataset input has no datasets.',
      field: 'datasets',
    });
  } else {
    for (const dataset of input.datasets) {
      errors.push(...validateDataset(dataset));
    }
  }

  return errors;
}
