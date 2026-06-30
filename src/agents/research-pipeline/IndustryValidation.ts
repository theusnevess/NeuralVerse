/**
 * NV-1400-D2-OPT-07 — Industry Validation Layer
 *
 * Deterministic validation for industry adoption metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchIndustryReference,
  ResearchIndustryRegistry,
  ResearchArtifactWithIndustry,
  ResearchIndustryValidationError,
  ResearchIndustryValidationResult,
  ResearchIndustryInput,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_INDUSTRY_SECTORS,
  CANONICAL_ADOPTION_TYPES,
  CANONICAL_ADOPTION_STAGES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const INDUSTRY_VALIDATION_CODES = {
  INDUSTRY_UNKNOWN_SECTOR: 'INDUSTRY_UNKNOWN_SECTOR',
  INDUSTRY_UNKNOWN_ADOPTION_TYPE: 'INDUSTRY_UNKNOWN_ADOPTION_TYPE',
  INDUSTRY_UNKNOWN_STAGE: 'INDUSTRY_UNKNOWN_STAGE',
  INDUSTRY_DUPLICATE_ID: 'INDUSTRY_DUPLICATE_ID',
  INDUSTRY_DUPLICATE_RECORD: 'INDUSTRY_DUPLICATE_RECORD',
  INDUSTRY_MISSING_SOURCE: 'INDUSTRY_MISSING_SOURCE',
  INDUSTRY_MISSING_EVIDENCE: 'INDUSTRY_MISSING_EVIDENCE',
  INDUSTRY_MISSING_USE_CASE: 'INDUSTRY_MISSING_USE_CASE',
  INDUSTRY_INVALID_REFERENCE: 'INDUSTRY_INVALID_REFERENCE',
  INDUSTRY_EMPTY_REGISTRY: 'INDUSTRY_EMPTY_REGISTRY',
  INDUSTRY_MISSING_PROVENANCE: 'INDUSTRY_MISSING_PROVENANCE',
  INDUSTRY_INVALID_STATUS: 'INDUSTRY_INVALID_STATUS',
} as const;

// ---------------------------------------------------------------------------
// Industry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single industry record.
 * Pure function. No side effects.
 */
export function validateIndustryRecord(
  record: ResearchIndustryReference,
): readonly ResearchIndustryValidationError[] {
  const errors: ResearchIndustryValidationError[] = [];

  if (!record.industryId || record.industryId.trim() === '') {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_SOURCE,
      message: 'Industry record is missing an ID.',
      field: 'industryId',
      industryId: record.industryId,
    });
  }

  if (!CANONICAL_INDUSTRY_SECTORS.includes(record.sector)) {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_UNKNOWN_SECTOR,
      message: `Industry record has unknown sector: "${record.sector}".`,
      field: 'sector',
      industryId: record.industryId,
    });
  }

  if (!CANONICAL_ADOPTION_TYPES.includes(record.adoptionType)) {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_UNKNOWN_ADOPTION_TYPE,
      message: `Industry record has unknown adoption type: "${record.adoptionType}".`,
      field: 'adoptionType',
      industryId: record.industryId,
    });
  }

  if (!CANONICAL_ADOPTION_STAGES.includes(record.adoptionStage)) {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_UNKNOWN_STAGE,
      message: `Industry record has unknown adoption stage: "${record.adoptionStage}".`,
      field: 'adoptionStage',
      industryId: record.industryId,
    });
  }

  if (!record.useCases || record.useCases.length === 0) {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_USE_CASE,
      message: 'Industry record has no use cases.',
      field: 'useCases',
      industryId: record.industryId,
    });
  } else {
    for (const useCase of record.useCases) {
      if (!useCase.title || useCase.title.trim() === '') {
        errors.push({
          code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_USE_CASE,
          message: 'Industry use case is missing a title.',
          field: 'useCases.title',
          industryId: record.industryId,
        });
      }
      if (!useCase.description || useCase.description.trim() === '') {
        errors.push({
          code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_USE_CASE,
          message: 'Industry use case is missing a description.',
          field: 'useCases.description',
          industryId: record.industryId,
        });
      }
    }
  }

  if (!record.associatedMethods || record.associatedMethods.length === 0) {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_SOURCE,
      message: 'Industry record has no associated methods.',
      field: 'associatedMethods',
      industryId: record.industryId,
    });
  }

  if (!record.associatedEvidence || record.associatedEvidence.length === 0) {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_EVIDENCE,
      message: 'Industry record has no associated evidence.',
      field: 'associatedEvidence',
      industryId: record.industryId,
    });
  }

  if (!record.officialSource || record.officialSource.trim() === '') {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_SOURCE,
      message: 'Industry record is missing an official source.',
      field: 'officialSource',
      industryId: record.industryId,
    });
  }

  if (!record.rationale || record.rationale.trim() === '') {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_SOURCE,
      message: 'Industry record is missing a rationale.',
      field: 'rationale',
      industryId: record.industryId,
    });
  }

  if (!record.provenance || typeof record.provenance !== 'object') {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_PROVENANCE,
      message: 'Industry record is missing provenance.',
      field: 'provenance',
      industryId: record.industryId,
    });
  } else {
    if (!record.provenance.rationale || record.provenance.rationale.trim() === '') {
      errors.push({
        code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_PROVENANCE,
        message: 'Industry provenance is missing rationale.',
        field: 'provenance.rationale',
        industryId: record.industryId,
      });
    }
    if (!record.provenance.source || record.provenance.source.trim() === '') {
      errors.push({
        code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_PROVENANCE,
        message: 'Industry provenance is missing source.',
        field: 'provenance.source',
        industryId: record.industryId,
      });
    }
  }

  if (!record.governanceStatus || record.governanceStatus.trim() === '') {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_INVALID_STATUS,
      message: 'Industry record is missing governance status.',
      field: 'governanceStatus',
      industryId: record.industryId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates an industry registry for structural integrity.
 * Pure function. No side effects.
 */
export function validateIndustryRegistry(
  registry: ResearchIndustryRegistry,
): readonly ResearchIndustryValidationError[] {
  const errors: ResearchIndustryValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_SOURCE,
      message: 'Industry registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  // Check for empty registry
  if (!registry.records || registry.records.length === 0) {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_EMPTY_REGISTRY,
      message: 'Industry registry has no records.',
      field: 'records',
    });
  }

  // Validate all records
  if (registry.records) {
    for (const record of registry.records) {
      errors.push(...validateIndustryRecord(record));
    }
  }

  // Check for duplicate IDs
  if (registry.records) {
    const seenIds = new Set<string>();
    for (const record of registry.records) {
      if (seenIds.has(record.industryId)) {
        errors.push({
          code: INDUSTRY_VALIDATION_CODES.INDUSTRY_DUPLICATE_ID,
          message: `Duplicate industry ID: "${record.industryId}".`,
          industryId: record.industryId,
        });
      }
      seenIds.add(record.industryId);
    }
  }

  // Check for duplicate records (same sector + adoptionType)
  if (registry.records) {
    const seenRecords = new Set<string>();
    for (const record of registry.records) {
      const key = `${record.sector}:${record.adoptionType}`;
      if (seenRecords.has(key)) {
        errors.push({
          code: INDUSTRY_VALIDATION_CODES.INDUSTRY_DUPLICATE_RECORD,
          message: `Duplicate industry record for sector "${record.sector}" with adoption type "${record.adoptionType}".`,
          industryId: record.industryId,
        });
      }
      seenRecords.add(key);
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a research artifact with industry metadata.
 * Pure function. No side effects.
 */
export function validateResearchArtifactWithIndustry(
  artifact: ResearchArtifactWithIndustry,
): ResearchIndustryValidationResult {
  const errors: ResearchIndustryValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_SOURCE,
      message: 'Research artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate industry registry
  errors.push(...validateIndustryRegistry(artifact.industryRegistry));

  // Validate trace
  if (!artifact.industryTrace || typeof artifact.industryTrace !== 'object') {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_PROVENANCE,
      message: 'Research artifact is missing industry trace.',
      field: 'industryTrace',
    });
  } else {
    if (artifact.industryTrace.deterministic !== true) {
      errors.push({
        code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_PROVENANCE,
        message: 'Industry trace must declare deterministic: true.',
        field: 'industryTrace.deterministic',
      });
    }
    if (artifact.industryTrace.randomUsed !== false) {
      errors.push({
        code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_PROVENANCE,
        message: 'Industry trace must declare randomUsed: false.',
        field: 'industryTrace.randomUsed',
      });
    }
    if (artifact.industryTrace.timeDependency !== false) {
      errors.push({
        code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_PROVENANCE,
        message: 'Industry trace must declare timeDependency: false.',
        field: 'industryTrace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'industry_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates research industry input.
 * Pure function. No side effects.
 */
export function validateIndustryInput(
  input: ResearchIndustryInput,
): readonly ResearchIndustryValidationError[] {
  const errors: ResearchIndustryValidationError[] = [];

  if (!input.conceptId || input.conceptId.trim() === '') {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_SOURCE,
      message: 'Industry input is missing concept ID.',
      field: 'conceptId',
    });
  }

  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_MISSING_SOURCE,
      message: 'Industry input is missing concept label.',
      field: 'conceptLabel',
    });
  }

  if (!input.records || input.records.length === 0) {
    errors.push({
      code: INDUSTRY_VALIDATION_CODES.INDUSTRY_EMPTY_REGISTRY,
      message: 'Industry input has no records.',
      field: 'records',
    });
  } else {
    for (const record of input.records) {
      errors.push(...validateIndustryRecord(record));
    }
  }

  return errors;
}
