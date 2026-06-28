/**
 * NV-1900-D7-OPT-10 — Technology Maturity Validation Layer
 *
 * Deterministic validation for technology maturity metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  TechnologyMaturityProfile,
  EcosystemProfile,
  IndustryAdoptionProfile,
  LifecycleClassification,
  ReadinessIndicator,
  TechnologyMaturityRegistry,
  TechnologyMaturityTrace,
  TechnologyMaturityInput,
  TechnologyMaturityValidationError,
  TechnologyMaturityRegistryValidationResult,
  TechnologyMaturityInputValidationResult,
  TechnologyMaturityTraceValidationResult,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_TECHNOLOGY_MATURITY_LEVELS,
  CANONICAL_ECOSYSTEM_STABILITY_TYPES,
  CANONICAL_INDUSTRY_ADOPTION_TYPES,
  CANONICAL_TECHNOLOGY_LIFECYCLE_TYPES,
  CANONICAL_READINESS_INDICATORS,
  CANONICAL_TECHNOLOGY_MATURITY_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const TECHNOLOGY_MATURITY_VALIDATION_CODES = {
  MATURITY_DUPLICATE_ID: 'MATURITY_DUPLICATE_ID',
  MATURITY_DUPLICATE_TITLE: 'MATURITY_DUPLICATE_TITLE',
  ECOSYSTEM_DUPLICATE_ID: 'ECOSYSTEM_DUPLICATE_ID',
  ADOPTION_DUPLICATE_ID: 'ADOPTION_DUPLICATE_ID',
  LIFECYCLE_DUPLICATE_ID: 'LIFECYCLE_DUPLICATE_ID',
  READINESS_DUPLICATE_ID: 'READINESS_DUPLICATE_ID',
  MATURITY_INVALID_LEVEL: 'MATURITY_INVALID_LEVEL',
  MATURITY_INVALID_ECOSYSTEM: 'MATURITY_INVALID_ECOSYSTEM',
  MATURITY_INVALID_ADOPTION: 'MATURITY_INVALID_ADOPTION',
  MATURITY_INVALID_LIFECYCLE: 'MATURITY_INVALID_LIFECYCLE',
  MATURITY_INVALID_READINESS: 'MATURITY_INVALID_READINESS',
  MATURITY_INVALID_STATUS: 'MATURITY_INVALID_STATUS',
  MATURITY_INVALID_GOVERNANCE: 'MATURITY_INVALID_GOVERNANCE',
  MATURITY_MISSING_PROVENANCE: 'MATURITY_MISSING_PROVENANCE',
  MATURITY_MISSING_PROVIDER: 'MATURITY_MISSING_PROVIDER',
  MATURITY_MISSING_RATIONALE: 'MATURITY_MISSING_RATIONALE',
  MATURITY_MISSING_APPLICATION_REFERENCE: 'MATURITY_MISSING_APPLICATION_REFERENCE',
  MATURITY_MISSING_KNOWLEDGE_REFERENCE: 'MATURITY_MISSING_KNOWLEDGE_REFERENCE',
  MATURITY_MISSING_ARCHITECTURE_REFERENCE: 'MATURITY_MISSING_ARCHITECTURE_REFERENCE',
  MATURITY_MISSING_MATURITY_ID: 'MATURITY_MISSING_MATURITY_ID',
  MATURITY_MISSING_TITLE: 'MATURITY_MISSING_TITLE',
  MATURITY_EMPTY_REGISTRY: 'MATURITY_EMPTY_REGISTRY',
  MATURITY_INVALID_TRACE: 'MATURITY_INVALID_TRACE',
  MATURITY_REGISTRY_INCONSISTENCY: 'MATURITY_REGISTRY_INCONSISTENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Maturity Profile Validation
// ---------------------------------------------------------------------------

export function validateTechnologyMaturityProfile(
  profile: TechnologyMaturityProfile,
): readonly TechnologyMaturityValidationError[] {
  const errors: TechnologyMaturityValidationError[] = [];

  if (!profile.maturityId || profile.maturityId.trim() === '') {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_MATURITY_ID,
      message: 'Technology maturity profile is missing a maturity ID.',
      field: 'maturityId',
      maturityId: profile.maturityId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_TITLE,
      message: 'Technology maturity profile is missing a title.',
      field: 'title',
      maturityId: profile.maturityId,
    });
  }

  if (!CANONICAL_TECHNOLOGY_MATURITY_LEVELS.includes(profile.technologyMaturityLevel)) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_LEVEL,
      message: `Technology maturity profile has unsupported level: "${profile.technologyMaturityLevel}".`,
      field: 'technologyMaturityLevel',
      maturityId: profile.maturityId,
    });
  }

  if (!CANONICAL_TECHNOLOGY_MATURITY_STATUS.includes(profile.status)) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_STATUS,
      message: `Technology maturity profile has unsupported status: "${profile.status}".`,
      field: 'status',
      maturityId: profile.maturityId,
    });
  }

  if (!profile.applicationArtifactId || profile.applicationArtifactId.trim() === '') {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_APPLICATION_REFERENCE,
      message: 'Technology maturity profile is missing applicationArtifactId.',
      field: 'applicationArtifactId',
      maturityId: profile.maturityId,
    });
  }

  if (!profile.knowledgeArtifactId || profile.knowledgeArtifactId.trim() === '') {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_KNOWLEDGE_REFERENCE,
      message: 'Technology maturity profile is missing knowledgeArtifactId.',
      field: 'knowledgeArtifactId',
      maturityId: profile.maturityId,
    });
  }

  if (!profile.architectureId || profile.architectureId.trim() === '') {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_ARCHITECTURE_REFERENCE,
      message: 'Technology maturity profile is missing architectureId.',
      field: 'architectureId',
      maturityId: profile.maturityId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_PROVENANCE,
      message: 'Technology maturity profile is missing provenance.',
      field: 'provenance',
      maturityId: profile.maturityId,
    });
  } else {
    if (!profile.provenance.providedBy || profile.provenance.providedBy.trim() === '') {
      errors.push({
        code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_PROVIDER,
        message: 'Maturity provenance is missing providedBy.',
        field: 'provenance.providedBy',
        maturityId: profile.maturityId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_RATIONALE,
        message: 'Maturity provenance is missing rationale.',
        field: 'provenance.rationale',
        maturityId: profile.maturityId,
      });
    }

    if (!CANONICAL_APPLICATION_GOVERNANCE.includes(profile.provenance.governanceStatus)) {
      errors.push({
        code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_GOVERNANCE,
        message: `Maturity provenance has invalid governance status: "${profile.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        maturityId: profile.maturityId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Ecosystem Profile Validation
// ---------------------------------------------------------------------------

export function validateEcosystemProfile(
  profile: EcosystemProfile,
): readonly TechnologyMaturityValidationError[] {
  const errors: TechnologyMaturityValidationError[] = [];

  if (!profile.ecosystemId || profile.ecosystemId.trim() === '') {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.ECOSYSTEM_DUPLICATE_ID,
      message: 'Ecosystem profile is missing an ecosystem ID.',
      field: 'ecosystemId',
      ecosystemId: profile.ecosystemId,
    });
  }

  if (!CANONICAL_ECOSYSTEM_STABILITY_TYPES.includes(profile.ecosystemStability)) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_ECOSYSTEM,
      message: `Ecosystem profile has unsupported stability: "${profile.ecosystemStability}".`,
      field: 'ecosystemStability',
      ecosystemId: profile.ecosystemId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_PROVENANCE,
      message: 'Ecosystem profile is missing provenance.',
      field: 'provenance',
      ecosystemId: profile.ecosystemId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Industry Adoption Profile Validation
// ---------------------------------------------------------------------------

export function validateIndustryAdoptionProfile(
  profile: IndustryAdoptionProfile,
): readonly TechnologyMaturityValidationError[] {
  const errors: TechnologyMaturityValidationError[] = [];

  if (!profile.adoptionId || profile.adoptionId.trim() === '') {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.ADOPTION_DUPLICATE_ID,
      message: 'Industry adoption profile is missing an adoption ID.',
      field: 'adoptionId',
      adoptionId: profile.adoptionId,
    });
  }

  if (!CANONICAL_INDUSTRY_ADOPTION_TYPES.includes(profile.industryAdoptionType)) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_ADOPTION,
      message: `Industry adoption profile has unsupported type: "${profile.industryAdoptionType}".`,
      field: 'industryAdoptionType',
      adoptionId: profile.adoptionId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_PROVENANCE,
      message: 'Industry adoption profile is missing provenance.',
      field: 'provenance',
      adoptionId: profile.adoptionId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Lifecycle Classification Validation
// ---------------------------------------------------------------------------

export function validateLifecycleClassification(
  classification: LifecycleClassification,
): readonly TechnologyMaturityValidationError[] {
  const errors: TechnologyMaturityValidationError[] = [];

  if (!classification.classificationId || classification.classificationId.trim() === '') {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.LIFECYCLE_DUPLICATE_ID,
      message: 'Lifecycle classification is missing a classification ID.',
      field: 'classificationId',
      classificationId: classification.classificationId,
    });
  }

  if (!CANONICAL_TECHNOLOGY_LIFECYCLE_TYPES.includes(classification.lifecycleType)) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_LIFECYCLE,
      message: `Lifecycle classification has unsupported type: "${classification.lifecycleType}".`,
      field: 'lifecycleType',
      classificationId: classification.classificationId,
    });
  }

  if (!classification.provenance) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_PROVENANCE,
      message: 'Lifecycle classification is missing provenance.',
      field: 'provenance',
      classificationId: classification.classificationId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Readiness Indicator Validation
// ---------------------------------------------------------------------------

export function validateReadinessIndicator(
  indicator: ReadinessIndicator,
): readonly TechnologyMaturityValidationError[] {
  const errors: TechnologyMaturityValidationError[] = [];

  if (!indicator.indicatorId || indicator.indicatorId.trim() === '') {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.READINESS_DUPLICATE_ID,
      message: 'Readiness indicator is missing an indicator ID.',
      field: 'indicatorId',
      indicatorId: indicator.indicatorId,
    });
  }

  if (!CANONICAL_READINESS_INDICATORS.includes(indicator.indicatorType)) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_READINESS,
      message: `Readiness indicator has unsupported type: "${indicator.indicatorType}".`,
      field: 'indicatorType',
      indicatorId: indicator.indicatorId,
    });
  }

  if (!indicator.provenance) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_MISSING_PROVENANCE,
      message: 'Readiness indicator is missing provenance.',
      field: 'provenance',
      indicatorId: indicator.indicatorId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Technology Maturity Registry Validation
// ---------------------------------------------------------------------------

export function validateTechnologyMaturityRegistry(
  registry: TechnologyMaturityRegistry,
): TechnologyMaturityRegistryValidationResult {
  const errors: TechnologyMaturityValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.maturityProfiles || registry.maturityProfiles.length === 0) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_EMPTY_REGISTRY,
      message: 'Registry has no maturity profiles.',
      field: 'maturityProfiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Duplicate maturity IDs
  const seenMaturityIds = new Set<string>();
  for (const m of registry.maturityProfiles) {
    if (seenMaturityIds.has(m.maturityId)) {
      errors.push({
        code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_DUPLICATE_ID,
        message: `Duplicate maturity ID: "${m.maturityId}".`,
        maturityId: m.maturityId,
      });
    }
    seenMaturityIds.add(m.maturityId);
  }

  // Duplicate maturity titles
  const seenMaturityTitles = new Set<string>();
  for (const m of registry.maturityProfiles) {
    if (seenMaturityTitles.has(m.title)) {
      errors.push({
        code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_DUPLICATE_TITLE,
        message: `Duplicate maturity title: "${m.title}".`,
        field: 'title',
        maturityId: m.maturityId,
      });
    }
    seenMaturityTitles.add(m.title);
  }

  // Duplicate ecosystem IDs
  const seenEcosystemIds = new Set<string>();
  for (const e of registry.ecosystemProfiles) {
    if (seenEcosystemIds.has(e.ecosystemId)) {
      errors.push({
        code: TECHNOLOGY_MATURITY_VALIDATION_CODES.ECOSYSTEM_DUPLICATE_ID,
        message: `Duplicate ecosystem ID: "${e.ecosystemId}".`,
        ecosystemId: e.ecosystemId,
      });
    }
    seenEcosystemIds.add(e.ecosystemId);
  }

  // Duplicate adoption IDs
  const seenAdoptionIds = new Set<string>();
  for (const a of registry.adoptionProfiles) {
    if (seenAdoptionIds.has(a.adoptionId)) {
      errors.push({
        code: TECHNOLOGY_MATURITY_VALIDATION_CODES.ADOPTION_DUPLICATE_ID,
        message: `Duplicate adoption ID: "${a.adoptionId}".`,
        adoptionId: a.adoptionId,
      });
    }
    seenAdoptionIds.add(a.adoptionId);
  }

  // Duplicate classification IDs
  const seenClassificationIds = new Set<string>();
  for (const c of registry.classifications) {
    if (seenClassificationIds.has(c.classificationId)) {
      errors.push({
        code: TECHNOLOGY_MATURITY_VALIDATION_CODES.LIFECYCLE_DUPLICATE_ID,
        message: `Duplicate classification ID: "${c.classificationId}".`,
        classificationId: c.classificationId,
      });
    }
    seenClassificationIds.add(c.classificationId);
  }

  // Duplicate indicator IDs
  const seenIndicatorIds = new Set<string>();
  for (const i of registry.indicators) {
    if (seenIndicatorIds.has(i.indicatorId)) {
      errors.push({
        code: TECHNOLOGY_MATURITY_VALIDATION_CODES.READINESS_DUPLICATE_ID,
        message: `Duplicate indicator ID: "${i.indicatorId}".`,
        indicatorId: i.indicatorId,
      });
    }
    seenIndicatorIds.add(i.indicatorId);
  }

  // Validate each maturity profile
  for (const m of registry.maturityProfiles) {
    errors.push(...validateTechnologyMaturityProfile(m));
  }

  // Validate each ecosystem profile
  for (const e of registry.ecosystemProfiles) {
    errors.push(...validateEcosystemProfile(e));
  }

  // Validate each adoption profile
  for (const a of registry.adoptionProfiles) {
    errors.push(...validateIndustryAdoptionProfile(a));
  }

  // Validate each classification
  for (const c of registry.classifications) {
    errors.push(...validateLifecycleClassification(c));
  }

  // Validate each indicator
  for (const i of registry.indicators) {
    errors.push(...validateReadinessIndicator(i));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'technology_maturity_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Technology Maturity Input Validation
// ---------------------------------------------------------------------------

export function validateTechnologyMaturityInput(
  input: TechnologyMaturityInput,
): TechnologyMaturityInputValidationResult {
  const errors: TechnologyMaturityValidationError[] = [];

  if (!input.maturityProfiles || input.maturityProfiles.length === 0) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_EMPTY_REGISTRY,
      message: 'Input has no maturity profiles.',
      field: 'maturityProfiles',
    });
  } else {
    for (const m of input.maturityProfiles) {
      errors.push(...validateTechnologyMaturityProfile(m));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'technology_maturity_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Technology Maturity Trace Validation
// ---------------------------------------------------------------------------

export function validateTechnologyMaturityTrace(
  trace: TechnologyMaturityTrace,
): TechnologyMaturityTraceValidationResult {
  const errors: TechnologyMaturityValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_TRACE,
      message: 'Technology maturity trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_TRACE,
      message: 'Technology maturity trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_TRACE,
      message: 'Technology maturity trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: TECHNOLOGY_MATURITY_VALIDATION_CODES.MATURITY_INVALID_TRACE,
      message: 'Technology maturity trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'technology_maturity_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Technology Maturity Validation
// ---------------------------------------------------------------------------

export function validateApplicationArtifactWithTechnologyMaturity(
  registry: TechnologyMaturityRegistry,
): readonly TechnologyMaturityValidationError[] {
  const errors: TechnologyMaturityValidationError[] = [];
  const registryResult = validateTechnologyMaturityRegistry(registry);
  errors.push(...registryResult.errors);
  return errors;
}
