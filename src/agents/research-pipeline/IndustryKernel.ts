/**
 * NV-1400-D2-OPT-07 — Industry Adoption Intelligence Orchestration Kernel
 *
 * Deterministic orchestration functions for industry adoption metadata.
 * Produces industry registries, industry references, and traces.
 *
 * This module never:
 * - Monitors companies
 * - Collects market data
 * - Ranks technologies
 * - Estimates adoption
 * - Predicts trends
 * - Calls external APIs
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchIndustryReference,
  ResearchIndustryRegistry,
  ResearchIndustryDecision,
  ResearchIndustryTrace,
  ResearchIndustryInput,
  ResearchArtifactWithIndustry,
  ResearchIndustrySector,
  ResearchAdoptionType,
  ResearchAdoptionStage,
  ResearchIndustryProvenance,
  ResearchIndustryUseCase,
  ResearchGovernanceStatus,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_INDUSTRY_SECTORS,
  CANONICAL_ADOPTION_TYPES,
  CANONICAL_ADOPTION_STAGES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Industry Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes industry provenance.
 * Pure function. No side effects.
 */
export function composeIndustryProvenance(
  industryId: string,
  referenceId: string,
  source: string,
  governanceStatus: ResearchGovernanceStatus,
  sector: ResearchIndustrySector,
  adoptionType: ResearchAdoptionType,
  adoptionStage: ResearchAdoptionStage,
  rationale: string,
): ResearchIndustryProvenance {
  return {
    industryId,
    referenceId,
    source,
    governanceStatus,
    sector,
    adoptionType,
    adoptionStage,
    rationale,
  };
}

// ---------------------------------------------------------------------------
// Industry Use Case Composition
// ---------------------------------------------------------------------------

/**
 * Composes an industry use case.
 * Pure function. No side effects.
 */
export function composeIndustryUseCase(
  useCaseId: string,
  title: string,
  description: string,
  sector: ResearchIndustrySector,
  adoptionType: ResearchAdoptionType,
  adoptionStage: ResearchAdoptionStage,
  associatedMethods: readonly string[],
  rationale: string,
): ResearchIndustryUseCase {
  return {
    useCaseId,
    title,
    description,
    sector,
    adoptionType,
    adoptionStage,
    associatedMethods: [...associatedMethods],
    rationale,
  };
}

// ---------------------------------------------------------------------------
// Industry Reference Composition
// ---------------------------------------------------------------------------

/**
 * Composes an industry reference.
 * Pure function. No side effects.
 */
export function composeIndustryReference(
  industryId: string,
  sector: ResearchIndustrySector,
  adoptionType: ResearchAdoptionType,
  adoptionStage: ResearchAdoptionStage,
  useCases: readonly ResearchIndustryUseCase[],
  associatedMethods: readonly string[],
  associatedEvidence: readonly string[],
  associatedBenchmarks: readonly string[],
  associatedDatasets: readonly string[],
  officialSource: string,
  governanceStatus: ResearchGovernanceStatus,
  lifecycle: 'active' | 'deprecated' | 'historical',
  rationale: string,
  provenance: ResearchIndustryProvenance,
): ResearchIndustryReference {
  return {
    industryId,
    sector,
    adoptionType,
    adoptionStage,
    useCases: [...useCases],
    associatedMethods: [...associatedMethods],
    associatedEvidence: [...associatedEvidence],
    associatedBenchmarks: [...associatedBenchmarks],
    associatedDatasets: [...associatedDatasets],
    officialSource,
    governanceStatus,
    lifecycle,
    rationale,
    provenance,
  };
}

// ---------------------------------------------------------------------------
// Industry Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes an industry registry from industry references.
 * Pure function. No side effects.
 */
export function composeIndustryRegistry(
  registryId: string,
  records: readonly ResearchIndustryReference[],
): ResearchIndustryRegistry {
  const sortedRecords = _sortRecordsDeterministically(records);

  return {
    registryId,
    records: [...sortedRecords],
    deterministic: true,
    generatedFrom: 'deterministic_industry_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Research Industry Composition
// ---------------------------------------------------------------------------

/**
 * Composes research industry from an input.
 * Pure function. No side effects.
 */
export function composeResearchIndustry(
  input: ResearchIndustryInput,
): ResearchArtifactWithIndustry {
  const decisions = _composeDecisions(input);

  const trace: ResearchIndustryTrace = {
    traceId: `_industry_trace_${input.conceptId}`,
    recordCount: input.records.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_industry_kernel',
    randomUsed: false,
    timeDependency: false,
  };

  const registry = composeIndustryRegistry(
    `_industry_registry_${input.conceptId}`,
    input.records,
  );

  return {
    artifactId: `_industry_artifact_${input.conceptId}`,
    artifactType: 'concept',
    industryRegistry: registry,
    industryTrace: trace,
  };
}

/**
 * Composes industry decisions from input records.
 * Pure function. No side effects.
 */
function _composeDecisions(
  input: ResearchIndustryInput,
): readonly ResearchIndustryDecision[] {
  return input.records.map((record) => {
    const validationErrors = _validateRecordForDecision(record);
    const validationPassed = validationErrors.length === 0;

    return {
      decisionId: `_decision_${record.industryId}`,
      industryId: record.industryId,
      sector: record.sector,
      validationPassed,
      validationErrors,
    };
  });
}

/**
 * Validates an industry record for decision composition.
 * Returns validation error codes.
 */
function _validateRecordForDecision(record: ResearchIndustryReference): readonly string[] {
  const errors: string[] = [];

  if (!record.industryId || record.industryId.trim() === '') {
    errors.push('INDUSTRY_MISSING_SOURCE');
  }

  if (!CANONICAL_INDUSTRY_SECTORS.includes(record.sector)) {
    errors.push('INDUSTRY_UNKNOWN_SECTOR');
  }

  if (!CANONICAL_ADOPTION_TYPES.includes(record.adoptionType)) {
    errors.push('INDUSTRY_UNKNOWN_ADOPTION_TYPE');
  }

  if (!CANONICAL_ADOPTION_STAGES.includes(record.adoptionStage)) {
    errors.push('INDUSTRY_UNKNOWN_STAGE');
  }

  if (!record.useCases || record.useCases.length === 0) {
    errors.push('INDUSTRY_MISSING_USE_CASE');
  }

  if (!record.associatedEvidence || record.associatedEvidence.length === 0) {
    errors.push('INDUSTRY_MISSING_EVIDENCE');
  }

  if (!record.provenance || !record.provenance.rationale || record.provenance.rationale.trim() === '') {
    errors.push('INDUSTRY_MISSING_PROVENANCE');
  }

  if (!record.governanceStatus || record.governanceStatus.trim() === '') {
    errors.push('INDUSTRY_INVALID_STATUS');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts industry records deterministically.
 * Sorting based on industryId for consistent ordering.
 * Pure function. No side effects.
 */
function _sortRecordsDeterministically(
  records: readonly ResearchIndustryReference[],
): readonly ResearchIndustryReference[] {
  return [...records].sort((a, b) => a.industryId.localeCompare(b.industryId));
}

// ---------------------------------------------------------------------------
// Industry Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes an industry trace.
 * Pure function. No side effects.
 */
export function composeIndustryTrace(
  traceId: string,
  decisions: readonly ResearchIndustryDecision[],
): ResearchIndustryTrace {
  return {
    traceId,
    recordCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions: [...decisions],
    deterministic: true,
    generatedFrom: 'deterministic_industry_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Sector, Adoption Type, and Stage Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if an industry sector is supported (in canonical sectors).
 */
export function isSupportedIndustrySector(sector: string): sector is ResearchIndustrySector {
  return CANONICAL_INDUSTRY_SECTORS.includes(sector as ResearchIndustrySector);
}

/**
 * Checks if an adoption type is supported (in canonical adoption types).
 */
export function isSupportedAdoptionType(type: string): type is ResearchAdoptionType {
  return CANONICAL_ADOPTION_TYPES.includes(type as ResearchAdoptionType);
}

/**
 * Checks if an adoption stage is supported (in canonical adoption stages).
 */
export function isSupportedAdoptionStage(stage: string): stage is ResearchAdoptionStage {
  return CANONICAL_ADOPTION_STAGES.includes(stage as ResearchAdoptionStage);
}

/**
 * Returns all canonical industry sectors.
 */
export function getCanonicalIndustrySectors(): readonly ResearchIndustrySector[] {
  return CANONICAL_INDUSTRY_SECTORS;
}

/**
 * Returns all canonical adoption types.
 */
export function getCanonicalAdoptionTypes(): readonly ResearchAdoptionType[] {
  return CANONICAL_ADOPTION_TYPES;
}

/**
 * Returns all canonical adoption stages.
 */
export function getCanonicalAdoptionStages(): readonly ResearchAdoptionStage[] {
  return CANONICAL_ADOPTION_STAGES;
}
