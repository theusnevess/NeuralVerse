/**
 * NV-1400-D2-OPT-10 — Research Laboratory Integration Orchestration Kernel
 *
 * Deterministic orchestration functions for research laboratory metadata.
 * Produces laboratory registries, laboratory metadata, and traces.
 *
 * This module never:
 * - Executes laboratories
 * - Generates laboratory code
 * - Launches simulations
 * - Calls the Laboratory Agent
 * - Modifies evidence
 * - Modifies reading paths
 * - Modifies benchmarks
 * - Modifies datasets
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchLaboratoryMetadata,
  ResearchLaboratoryRegistry,
  ResearchLaboratoryDecision,
  ResearchLaboratoryTrace,
  ResearchLaboratoryInput,
  ResearchArtifactWithLaboratories,
  ResearchLaboratoryType,
  ResearchLaboratoryPurpose,
  ResearchLaboratoryIntegrationMode,
  ResearchLaboratoryProvenance,
  ResearchGovernanceStatus,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_LABORATORY_TYPES,
  CANONICAL_LABORATORY_PURPOSES,
  CANONICAL_LABORATORY_INTEGRATION_MODES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Laboratory Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes laboratory provenance.
 * Pure function. No side effects.
 */
export function composeLaboratoryProvenance(
  laboratoryId: string,
  referenceId: string,
  source: string,
  governanceStatus: ResearchGovernanceStatus,
  laboratoryType: ResearchLaboratoryType,
  purpose: ResearchLaboratoryPurpose,
  rationale: string,
  providedBy: string,
): ResearchLaboratoryProvenance {
  return {
    laboratoryId,
    referenceId,
    source,
    governanceStatus,
    laboratoryType,
    purpose,
    rationale,
    providedBy,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes laboratory metadata.
 * Pure function. No side effects.
 */
export function composeLaboratoryMetadata(
  laboratoryId: string,
  laboratoryType: ResearchLaboratoryType,
  purpose: ResearchLaboratoryPurpose,
  integrationMode: ResearchLaboratoryIntegrationMode,
  title: string,
  description: string,
  associatedEvidence: readonly string[],
  associatedMethods: readonly string[],
  associatedBenchmarks: readonly string[],
  associatedDatasets: readonly string[],
  associatedReadingPaths: readonly string[],
  officialSource: string,
  governanceStatus: ResearchGovernanceStatus,
  lifecycle: 'active' | 'deprecated' | 'historical',
  rationale: string,
  provenance: ResearchLaboratoryProvenance,
): ResearchLaboratoryMetadata {
  return {
    laboratoryId,
    laboratoryType,
    purpose,
    integrationMode,
    title,
    description,
    associatedEvidence: [...associatedEvidence],
    associatedMethods: [...associatedMethods],
    associatedBenchmarks: [...associatedBenchmarks],
    associatedDatasets: [...associatedDatasets],
    associatedReadingPaths: [...associatedReadingPaths],
    officialSource,
    governanceStatus,
    lifecycle,
    rationale,
    provenance,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a laboratory registry from laboratory metadata.
 * Pure function. No side effects.
 */
export function composeLaboratoryRegistry(
  registryId: string,
  laboratories: readonly ResearchLaboratoryMetadata[],
): ResearchLaboratoryRegistry {
  const sortedLaboratories = _sortLaboratoriesDeterministically(laboratories);

  return {
    registryId,
    laboratories: [...sortedLaboratories],
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Research Laboratories Composition
// ---------------------------------------------------------------------------

/**
 * Composes research laboratories from an input.
 * Pure function. No side effects.
 */
export function composeResearchLaboratories(
  input: ResearchLaboratoryInput,
): ResearchArtifactWithLaboratories {
  const decisions = _composeDecisions(input);

  const trace: ResearchLaboratoryTrace = {
    traceId: `_laboratory_trace_${input.conceptId}`,
    metadataCount: input.laboratories.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_kernel',
    randomUsed: false,
    timeDependency: false,
  };

  const registry = composeLaboratoryRegistry(
    `_laboratory_registry_${input.conceptId}`,
    input.laboratories,
  );

  return {
    artifactId: `_laboratory_artifact_${input.conceptId}`,
    artifactType: 'concept',
    laboratoryRegistry: registry,
    laboratoryTrace: trace,
  };
}

/**
 * Composes laboratory decisions from input laboratories.
 * Pure function. No side effects.
 */
function _composeDecisions(
  input: ResearchLaboratoryInput,
): readonly ResearchLaboratoryDecision[] {
  return input.laboratories.map((lab) => {
    const validationErrors = _validateLaboratoryForDecision(lab);
    const validationPassed = validationErrors.length === 0;

    return {
      decisionId: `_decision_${lab.laboratoryId}`,
      laboratoryId: lab.laboratoryId,
      laboratoryType: lab.laboratoryType,
      validationPassed,
      validationErrors,
    };
  });
}

/**
 * Validates a laboratory for decision composition.
 * Returns validation error codes.
 */
function _validateLaboratoryForDecision(lab: ResearchLaboratoryMetadata): readonly string[] {
  const errors: string[] = [];

  if (!lab.laboratoryId || lab.laboratoryId.trim() === '') {
    errors.push('LABMETA_MISSING_SOURCE');
  }

  if (!CANONICAL_LABORATORY_TYPES.includes(lab.laboratoryType)) {
    errors.push('LABMETA_UNKNOWN_TYPE');
  }

  if (!CANONICAL_LABORATORY_PURPOSES.includes(lab.purpose)) {
    errors.push('LABMETA_UNKNOWN_PURPOSE');
  }

  if (!CANONICAL_LABORATORY_INTEGRATION_MODES.includes(lab.integrationMode)) {
    errors.push('LABMETA_UNKNOWN_MODE');
  }

  if (!lab.title || lab.title.trim() === '') {
    errors.push('LABMETA_MISSING_SOURCE');
  }

  if (!lab.associatedEvidence || lab.associatedEvidence.length === 0) {
    errors.push('LABMETA_MISSING_EVIDENCE');
  }

  if (!lab.provenance || !lab.provenance.rationale || lab.provenance.rationale.trim() === '') {
    errors.push('LABMETA_MISSING_PROVENANCE');
  }

  if (!lab.governanceStatus || lab.governanceStatus.trim() === '') {
    errors.push('LABMETA_INVALID_STATUS');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts laboratory metadata deterministically.
 * Sorting based on laboratoryId for consistent ordering.
 * Pure function. No side effects.
 */
function _sortLaboratoriesDeterministically(
  laboratories: readonly ResearchLaboratoryMetadata[],
): readonly ResearchLaboratoryMetadata[] {
  return [...laboratories].sort((a, b) => a.laboratoryId.localeCompare(b.laboratoryId));
}

// ---------------------------------------------------------------------------
// Laboratory Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a laboratory trace.
 * Pure function. No side effects.
 */
export function composeLaboratoryTrace(
  traceId: string,
  decisions: readonly ResearchLaboratoryDecision[],
): ResearchLaboratoryTrace {
  return {
    traceId,
    metadataCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions: [...decisions],
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Type, Purpose, and Integration Mode Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a laboratory type is supported (in canonical types).
 */
export function isSupportedLaboratoryType(type: string): type is ResearchLaboratoryType {
  return CANONICAL_LABORATORY_TYPES.includes(type as ResearchLaboratoryType);
}

/**
 * Checks if a laboratory purpose is supported (in canonical purposes).
 */
export function isSupportedLaboratoryPurpose(purpose: string): purpose is ResearchLaboratoryPurpose {
  return CANONICAL_LABORATORY_PURPOSES.includes(purpose as ResearchLaboratoryPurpose);
}

/**
 * Checks if a laboratory integration mode is supported (in canonical modes).
 */
export function isSupportedLaboratoryIntegrationMode(mode: string): mode is ResearchLaboratoryIntegrationMode {
  return CANONICAL_LABORATORY_INTEGRATION_MODES.includes(mode as ResearchLaboratoryIntegrationMode);
}

/**
 * Returns all canonical laboratory types.
 */
export function getCanonicalLaboratoryTypes(): readonly ResearchLaboratoryType[] {
  return CANONICAL_LABORATORY_TYPES;
}

/**
 * Returns all canonical laboratory purposes.
 */
export function getCanonicalLaboratoryPurposes(): readonly ResearchLaboratoryPurpose[] {
  return CANONICAL_LABORATORY_PURPOSES;
}

/**
 * Returns all canonical laboratory integration modes.
 */
export function getCanonicalLaboratoryIntegrationModes(): readonly ResearchLaboratoryIntegrationMode[] {
  return CANONICAL_LABORATORY_INTEGRATION_MODES;
}
