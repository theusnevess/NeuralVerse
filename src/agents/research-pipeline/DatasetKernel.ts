/**
 * NV-1400-D2-OPT-06 — Dataset Mapping Orchestration Kernel
 *
 * Deterministic orchestration functions for research dataset metadata.
 * Produces dataset registries, datasets, and traces.
 *
 * This module never:
 * - Downloads datasets
 * - Inspects dataset contents
 * - Computes statistics
 * - Benchmarks datasets
 * - Recommends datasets
 * - Compares datasets
 * - Summarizes datasets
 * - Calls external APIs
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchDataset,
  ResearchDatasetRegistry,
  ResearchDatasetDecision,
  ResearchDatasetTrace,
  ResearchDatasetInput,
  ResearchArtifactWithDatasets,
  ResearchDatasetDomain,
  ResearchDatasetTask,
  ResearchDatasetAnnotationType,
  ResearchDatasetLicense,
  ResearchDatasetScale,
  ResearchDatasetProvenance,
  ResearchGovernanceStatus,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_DATASET_DOMAINS,
  CANONICAL_DATASET_TASKS,
  CANONICAL_DATASET_ANNOTATION_TYPES,
  CANONICAL_DATASET_LICENSES,
  CANONICAL_DATASET_SCALES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Dataset Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes dataset provenance.
 * Pure function. No side effects.
 */
export function composeDatasetProvenance(
  datasetId: string,
  referenceId: string,
  source: string,
  governanceStatus: ResearchGovernanceStatus,
  domain: ResearchDatasetDomain,
  primaryTask: ResearchDatasetTask,
  publicationYear: number,
  rationale: string,
): ResearchDatasetProvenance {
  return {
    datasetId,
    referenceId,
    source,
    governanceStatus,
    domain,
    primaryTask,
    publicationYear,
    rationale,
  };
}

// ---------------------------------------------------------------------------
// Dataset Composition
// ---------------------------------------------------------------------------

/**
 * Composes a dataset.
 * Pure function. No side effects.
 */
export function composeDataset(
  datasetId: string,
  datasetName: string,
  domain: ResearchDatasetDomain,
  primaryTask: ResearchDatasetTask,
  supportedTasks: readonly ResearchDatasetTask[],
  annotationType: ResearchDatasetAnnotationType,
  license: ResearchDatasetLicense,
  scale: ResearchDatasetScale,
  publicationYear: number,
  officialSource: string,
  associatedEvidence: readonly string[],
  associatedBenchmarks: readonly string[],
  associatedMethods: readonly string[],
  governanceStatus: ResearchGovernanceStatus,
  lifecycle: 'active' | 'deprecated' | 'historical',
  rationale: string,
  provenance: ResearchDatasetProvenance,
): ResearchDataset {
  return {
    datasetId,
    datasetName,
    domain,
    primaryTask,
    supportedTasks: [...supportedTasks],
    annotationType,
    license,
    scale,
    publicationYear,
    officialSource,
    associatedEvidence: [...associatedEvidence],
    associatedBenchmarks: [...associatedBenchmarks],
    associatedMethods: [...associatedMethods],
    governanceStatus,
    lifecycle,
    rationale,
    provenance,
  };
}

// ---------------------------------------------------------------------------
// Dataset Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a dataset registry from datasets.
 * Pure function. No side effects.
 */
export function composeDatasetRegistry(
  registryId: string,
  datasets: readonly ResearchDataset[],
): ResearchDatasetRegistry {
  const sortedDatasets = _sortDatasetsDeterministically(datasets);

  return {
    registryId,
    datasets: [...sortedDatasets],
    deterministic: true,
    generatedFrom: 'deterministic_dataset_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Research Datasets Composition
// ---------------------------------------------------------------------------

/**
 * Composes research datasets from an input.
 * Pure function. No side effects.
 */
export function composeResearchDatasets(
  input: ResearchDatasetInput,
): ResearchArtifactWithDatasets {
  const decisions = _composeDecisions(input);

  const trace: ResearchDatasetTrace = {
    traceId: `_dataset_trace_${input.conceptId}`,
    datasetCount: input.datasets.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_dataset_kernel',
    randomUsed: false,
    timeDependency: false,
  };

  const registry = composeDatasetRegistry(
    `_dataset_registry_${input.conceptId}`,
    input.datasets,
  );

  return {
    artifactId: `_dataset_artifact_${input.conceptId}`,
    artifactType: 'concept',
    datasetRegistry: registry,
    datasetTrace: trace,
  };
}

/**
 * Composes dataset decisions from input datasets.
 * Pure function. No side effects.
 */
function _composeDecisions(
  input: ResearchDatasetInput,
): readonly ResearchDatasetDecision[] {
  return input.datasets.map((dataset) => {
    const validationErrors = _validateDatasetForDecision(dataset);
    const validationPassed = validationErrors.length === 0;

    return {
      decisionId: `_decision_${dataset.datasetId}`,
      datasetId: dataset.datasetId,
      datasetName: dataset.datasetName,
      validationPassed,
      validationErrors,
    };
  });
}

/**
 * Validates a dataset for decision composition.
 * Returns validation error codes.
 */
function _validateDatasetForDecision(dataset: ResearchDataset): readonly string[] {
  const errors: string[] = [];

  if (!dataset.datasetId || dataset.datasetId.trim() === '') {
    errors.push('DATASET_MISSING_SOURCE');
  }

  if (!dataset.datasetName || dataset.datasetName.trim() === '') {
    errors.push('DATASET_MISSING_SOURCE');
  }

  if (!CANONICAL_DATASET_DOMAINS.includes(dataset.domain)) {
    errors.push('DATASET_UNKNOWN_DOMAIN');
  }

  if (!CANONICAL_DATASET_TASKS.includes(dataset.primaryTask)) {
    errors.push('DATASET_UNKNOWN_TASK');
  }

  if (!CANONICAL_DATASET_ANNOTATION_TYPES.includes(dataset.annotationType)) {
    errors.push('DATASET_UNKNOWN_ANNOTATION');
  }

  if (!CANONICAL_DATASET_LICENSES.includes(dataset.license)) {
    errors.push('DATASET_MISSING_LICENSE');
  }

  if (!CANONICAL_DATASET_SCALES.includes(dataset.scale)) {
    errors.push('DATASET_UNKNOWN_SCALE');
  }

  if (!dataset.associatedEvidence || dataset.associatedEvidence.length === 0) {
    errors.push('DATASET_MISSING_EVIDENCE');
  }

  if (!dataset.provenance || !dataset.provenance.rationale || dataset.provenance.rationale.trim() === '') {
    errors.push('DATASET_MISSING_PROVENANCE');
  }

  if (!dataset.governanceStatus || dataset.governanceStatus.trim() === '') {
    errors.push('DATASET_INVALID_STATUS');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts datasets deterministically.
 * Sorting based on datasetId for consistent ordering.
 * Pure function. No side effects.
 */
function _sortDatasetsDeterministically(
  datasets: readonly ResearchDataset[],
): readonly ResearchDataset[] {
  return [...datasets].sort((a, b) => a.datasetId.localeCompare(b.datasetId));
}

// ---------------------------------------------------------------------------
// Dataset Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a dataset trace.
 * Pure function. No side effects.
 */
export function composeDatasetTrace(
  traceId: string,
  decisions: readonly ResearchDatasetDecision[],
): ResearchDatasetTrace {
  return {
    traceId,
    datasetCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions: [...decisions],
    deterministic: true,
    generatedFrom: 'deterministic_dataset_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Domain, Task, Annotation, License, and Scale Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a dataset domain is supported (in canonical domains).
 */
export function isSupportedDatasetDomain(domain: string): domain is ResearchDatasetDomain {
  return CANONICAL_DATASET_DOMAINS.includes(domain as ResearchDatasetDomain);
}

/**
 * Checks if a dataset task is supported (in canonical tasks).
 */
export function isSupportedDatasetTask(task: string): task is ResearchDatasetTask {
  return CANONICAL_DATASET_TASKS.includes(task as ResearchDatasetTask);
}

/**
 * Checks if a dataset annotation type is supported (in canonical annotation types).
 */
export function isSupportedDatasetAnnotationType(
  annotationType: string,
): annotationType is ResearchDatasetAnnotationType {
  return CANONICAL_DATASET_ANNOTATION_TYPES.includes(annotationType as ResearchDatasetAnnotationType);
}

/**
 * Checks if a dataset license is supported (in canonical licenses).
 */
export function isSupportedDatasetLicense(license: string): license is ResearchDatasetLicense {
  return CANONICAL_DATASET_LICENSES.includes(license as ResearchDatasetLicense);
}

/**
 * Checks if a dataset scale is supported (in canonical scales).
 */
export function isSupportedDatasetScale(scale: string): scale is ResearchDatasetScale {
  return CANONICAL_DATASET_SCALES.includes(scale as ResearchDatasetScale);
}

/**
 * Returns all canonical dataset domains.
 */
export function getCanonicalDatasetDomains(): readonly ResearchDatasetDomain[] {
  return CANONICAL_DATASET_DOMAINS;
}

/**
 * Returns all canonical dataset tasks.
 */
export function getCanonicalDatasetTasks(): readonly ResearchDatasetTask[] {
  return CANONICAL_DATASET_TASKS;
}

/**
 * Returns all canonical dataset annotation types.
 */
export function getCanonicalDatasetAnnotationTypes(): readonly ResearchDatasetAnnotationType[] {
  return CANONICAL_DATASET_ANNOTATION_TYPES;
}

/**
 * Returns all canonical dataset licenses.
 */
export function getCanonicalDatasetLicenses(): readonly ResearchDatasetLicense[] {
  return CANONICAL_DATASET_LICENSES;
}

/**
 * Returns all canonical dataset scales.
 */
export function getCanonicalDatasetScales(): readonly ResearchDatasetScale[] {
  return CANONICAL_DATASET_SCALES;
}
