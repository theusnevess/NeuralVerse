/**
 * NV-1900-D7-OPT-10 — Technology Maturity Classification Kernel
 *
 * Deterministic orchestration functions for technology maturity metadata.
 * Produces maturity profiles, ecosystem profiles, adoption profiles, classifications, indicators, traces, and registries.
 *
 * This module never:
 * - Evaluates technologies automatically
 * - Predicts adoption
 * - Recommends technologies
 * - Ranks ecosystems
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Technology maturity metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  TechnologyMaturityProfile,
  TechnologyMaturityProvenance,
  EcosystemProfile,
  IndustryAdoptionProfile,
  LifecycleClassification,
  ReadinessIndicator,
  TechnologyMaturityDecision,
  TechnologyMaturityTraceDecision,
  TechnologyMaturityTrace,
  TechnologyMaturityRegistry,
  TechnologyMaturityRegistryMetadata,
  TechnologyMaturityInput,
  TechnologyMaturityLevel,
  EcosystemStabilityType,
  IndustryAdoptionType,
  TechnologyLifecycleType,
  ReadinessIndicatorType,
  TechnologyMaturityStatus,
  ApplicationGovernanceStatus,
  ApplicationNode,
  ApplicationArtifactWithTechnologyMaturity,
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
// Technology Maturity Provenance Composition
// ---------------------------------------------------------------------------

export function composeTechnologyMaturityProvenance(params: {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}): TechnologyMaturityProvenance {
  return {
    providedBy: params.providedBy,
    rationale: params.rationale,
    reviewedBy: params.reviewedBy,
    reviewDate: params.reviewDate,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Technology Maturity Profile Composition
// ---------------------------------------------------------------------------

export function composeTechnologyMaturityProfile(params: {
  readonly maturityId: string;
  readonly title: string;
  readonly technologyMaturityLevel: TechnologyMaturityLevel;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly architectureId: string;
  readonly status: TechnologyMaturityStatus;
  readonly provenance: TechnologyMaturityProvenance;
}): TechnologyMaturityProfile {
  return {
    maturityId: params.maturityId,
    title: params.title,
    technologyMaturityLevel: params.technologyMaturityLevel,
    applicationArtifactId: params.applicationArtifactId,
    knowledgeArtifactId: params.knowledgeArtifactId,
    architectureId: params.architectureId,
    status: params.status,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Ecosystem Profile Composition
// ---------------------------------------------------------------------------

export function composeEcosystemProfile(params: {
  readonly ecosystemId: string;
  readonly maturityId: string;
  readonly ecosystemStability: EcosystemStabilityType;
  readonly description: string;
  readonly provenance: TechnologyMaturityProvenance;
}): EcosystemProfile {
  return {
    ecosystemId: params.ecosystemId,
    maturityId: params.maturityId,
    ecosystemStability: params.ecosystemStability,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Industry Adoption Profile Composition
// ---------------------------------------------------------------------------

export function composeIndustryAdoptionProfile(params: {
  readonly adoptionId: string;
  readonly maturityId: string;
  readonly industryAdoptionType: IndustryAdoptionType;
  readonly description: string;
  readonly provenance: TechnologyMaturityProvenance;
}): IndustryAdoptionProfile {
  return {
    adoptionId: params.adoptionId,
    maturityId: params.maturityId,
    industryAdoptionType: params.industryAdoptionType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Lifecycle Classification Composition
// ---------------------------------------------------------------------------

export function composeLifecycleClassification(params: {
  readonly classificationId: string;
  readonly maturityId: string;
  readonly lifecycleType: TechnologyLifecycleType;
  readonly description: string;
  readonly provenance: TechnologyMaturityProvenance;
}): LifecycleClassification {
  return {
    classificationId: params.classificationId,
    maturityId: params.maturityId,
    lifecycleType: params.lifecycleType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Readiness Indicator Composition
// ---------------------------------------------------------------------------

export function composeReadinessIndicator(params: {
  readonly indicatorId: string;
  readonly maturityId: string;
  readonly indicatorType: ReadinessIndicatorType;
  readonly description: string;
  readonly provenance: TechnologyMaturityProvenance;
}): ReadinessIndicator {
  return {
    indicatorId: params.indicatorId,
    maturityId: params.maturityId,
    indicatorType: params.indicatorType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Technology Maturity Decision Composition
// ---------------------------------------------------------------------------

export function composeTechnologyMaturityDecision(params: {
  readonly decisionId: string;
  readonly maturityId: string;
  readonly description: string;
  readonly provenance: TechnologyMaturityProvenance;
}): TechnologyMaturityDecision {
  return {
    decisionId: params.decisionId,
    maturityId: params.maturityId,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Technology Maturity Trace Decision Composition
// ---------------------------------------------------------------------------

function _composeTechnologyMaturityTraceDecision(
  maturityId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): TechnologyMaturityTraceDecision {
  return {
    decisionId: `_decision_${maturityId}`,
    maturityId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Technology Maturity Trace Composition
// ---------------------------------------------------------------------------

export function composeTechnologyMaturityTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly TechnologyMaturityTraceDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): TechnologyMaturityTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_technology_maturity_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

function _compareMaturity(
  a: TechnologyMaturityProfile,
  b: TechnologyMaturityProfile,
): number {
  if (a.maturityId < b.maturityId) return -1;
  if (a.maturityId > b.maturityId) return 1;
  if (a.technologyMaturityLevel < b.technologyMaturityLevel) return -1;
  if (a.technologyMaturityLevel > b.technologyMaturityLevel) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareEcosystem(
  a: EcosystemProfile,
  b: EcosystemProfile,
): number {
  if (a.maturityId < b.maturityId) return -1;
  if (a.maturityId > b.maturityId) return 1;
  if (a.ecosystemStability < b.ecosystemStability) return -1;
  if (a.ecosystemStability > b.ecosystemStability) return 1;
  if (a.ecosystemId < b.ecosystemId) return -1;
  if (a.ecosystemId > b.ecosystemId) return 1;
  return 0;
}

function _compareAdoption(
  a: IndustryAdoptionProfile,
  b: IndustryAdoptionProfile,
): number {
  if (a.maturityId < b.maturityId) return -1;
  if (a.maturityId > b.maturityId) return 1;
  if (a.industryAdoptionType < b.industryAdoptionType) return -1;
  if (a.industryAdoptionType > b.industryAdoptionType) return 1;
  if (a.adoptionId < b.adoptionId) return -1;
  if (a.adoptionId > b.adoptionId) return 1;
  return 0;
}

function _compareClassification(
  a: LifecycleClassification,
  b: LifecycleClassification,
): number {
  if (a.maturityId < b.maturityId) return -1;
  if (a.maturityId > b.maturityId) return 1;
  if (a.lifecycleType < b.lifecycleType) return -1;
  if (a.lifecycleType > b.lifecycleType) return 1;
  if (a.classificationId < b.classificationId) return -1;
  if (a.classificationId > b.classificationId) return 1;
  return 0;
}

function _compareIndicator(
  a: ReadinessIndicator,
  b: ReadinessIndicator,
): number {
  if (a.maturityId < b.maturityId) return -1;
  if (a.maturityId > b.maturityId) return 1;
  if (a.indicatorType < b.indicatorType) return -1;
  if (a.indicatorType > b.indicatorType) return 1;
  if (a.indicatorId < b.indicatorId) return -1;
  if (a.indicatorId > b.indicatorId) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Technology Maturity Registry Composition
// ---------------------------------------------------------------------------

export function composeTechnologyMaturityRegistry(
  maturityProfiles: readonly TechnologyMaturityProfile[],
  ecosystemProfiles: readonly EcosystemProfile[],
  adoptionProfiles: readonly IndustryAdoptionProfile[],
  classifications: readonly LifecycleClassification[],
  indicators: readonly ReadinessIndicator[],
): TechnologyMaturityRegistry {
  const sortedMaturity = [...maturityProfiles].sort(_compareMaturity);
  const sortedEcosystem = [...ecosystemProfiles].sort(_compareEcosystem);
  const sortedAdoption = [...adoptionProfiles].sort(_compareAdoption);
  const sortedClassification = [...classifications].sort(_compareClassification);
  const sortedIndicator = [...indicators].sort(_compareIndicator);

  const types = new Set(sortedMaturity.map((m) => m.technologyMaturityLevel));

  const metadata: TechnologyMaturityRegistryMetadata = {
    registryId: `_registry_${sortedMaturity.length}_${sortedEcosystem.length}_${sortedAdoption.length}_${sortedClassification.length}_${sortedIndicator.length}`,
    maturityCount: sortedMaturity.length,
    ecosystemCount: sortedEcosystem.length,
    adoptionCount: sortedAdoption.length,
    classificationCount: sortedClassification.length,
    indicatorCount: sortedIndicator.length,
    typeCount: types.size,
  };

  return {
    registryId: metadata.registryId,
    maturityProfiles: sortedMaturity,
    ecosystemProfiles: sortedEcosystem,
    adoptionProfiles: sortedAdoption,
    classifications: sortedClassification,
    indicators: sortedIndicator,
    metadata,
    trace: {
      traceId: `_trace_${sortedMaturity.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_technology_maturity_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_technology_maturity_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Technology Maturity Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeTechnologyMaturityRegistryFromInput(
  input: TechnologyMaturityInput,
): TechnologyMaturityRegistry {
  return composeTechnologyMaturityRegistry(
    input.maturityProfiles,
    input.ecosystemProfiles,
    input.adoptionProfiles,
    input.classifications,
    input.indicators,
  );
}

// ---------------------------------------------------------------------------
// Technology Maturity Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeTechnologyMaturity(
  input: TechnologyMaturityInput,
): TechnologyMaturityRegistry {
  const decisions = input.maturityProfiles.map((profile) => {
    const errors = _validateMaturityForDecision(profile);
    return _composeTechnologyMaturityTraceDecision(profile.maturityId, errors.length === 0, errors);
  });

  const registry = composeTechnologyMaturityRegistry(
    input.maturityProfiles,
    input.ecosystemProfiles,
    input.adoptionProfiles,
    input.classifications,
    input.indicators,
  );

  return {
    ...registry,
    trace: composeTechnologyMaturityTrace({
      traceId: `_trace_${input.maturityProfiles.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Technology Maturity Composition
// ---------------------------------------------------------------------------

export function composeApplicationArtifactWithTechnologyMaturity(params: {
  readonly applicationNode: ApplicationNode;
  readonly technologyMaturityRegistry: TechnologyMaturityRegistry;
}): ApplicationArtifactWithTechnologyMaturity {
  return {
    applicationNode: { ...params.applicationNode },
    technologyMaturityRegistry: { ...params.technologyMaturityRegistry },
    deterministic: true,
    generatedFrom: 'deterministic_technology_maturity_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Technology Maturity Decision Validation
// ---------------------------------------------------------------------------

function _validateMaturityForDecision(
  profile: TechnologyMaturityProfile,
): readonly string[] {
  const errors: string[] = [];

  if (!profile.maturityId || profile.maturityId.trim() === '') {
    errors.push('MATURITY_MISSING_MATURITY_ID');
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push('MATURITY_MISSING_TITLE');
  }

  if (!CANONICAL_TECHNOLOGY_MATURITY_LEVELS.includes(profile.technologyMaturityLevel)) {
    errors.push('MATURITY_INVALID_LEVEL');
  }

  if (!CANONICAL_TECHNOLOGY_MATURITY_STATUS.includes(profile.status)) {
    errors.push('MATURITY_INVALID_STATUS');
  }

  if (!profile.provenance) {
    errors.push('MATURITY_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedTechnologyMaturityLevel(
  level: string,
): level is TechnologyMaturityLevel {
  return CANONICAL_TECHNOLOGY_MATURITY_LEVELS.includes(level as TechnologyMaturityLevel);
}

export function isSupportedEcosystemStability(
  stability: string,
): stability is EcosystemStabilityType {
  return CANONICAL_ECOSYSTEM_STABILITY_TYPES.includes(stability as EcosystemStabilityType);
}

export function isSupportedIndustryAdoption(
  adoption: string,
): adoption is IndustryAdoptionType {
  return CANONICAL_INDUSTRY_ADOPTION_TYPES.includes(adoption as IndustryAdoptionType);
}

export function isSupportedLifecycleClassification(
  lifecycleType: string,
): lifecycleType is TechnologyLifecycleType {
  return CANONICAL_TECHNOLOGY_LIFECYCLE_TYPES.includes(lifecycleType as TechnologyLifecycleType);
}

export function isSupportedReadinessIndicator(
  indicatorType: string,
): indicatorType is ReadinessIndicatorType {
  return CANONICAL_READINESS_INDICATORS.includes(indicatorType as ReadinessIndicatorType);
}

export function isSupportedTechnologyMaturityStatus(
  status: string,
): status is TechnologyMaturityStatus {
  return CANONICAL_TECHNOLOGY_MATURITY_STATUS.includes(status as TechnologyMaturityStatus);
}

export function isSupportedTechnologyMaturityGovernance(
  governanceStatus: string,
): governanceStatus is ApplicationGovernanceStatus {
  return CANONICAL_APPLICATION_GOVERNANCE.includes(
    governanceStatus as ApplicationGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalTechnologyMaturityLevels(): readonly TechnologyMaturityLevel[] {
  return CANONICAL_TECHNOLOGY_MATURITY_LEVELS;
}

export function getCanonicalEcosystemStabilityTypes(): readonly EcosystemStabilityType[] {
  return CANONICAL_ECOSYSTEM_STABILITY_TYPES;
}

export function getCanonicalIndustryAdoptionTypes(): readonly IndustryAdoptionType[] {
  return CANONICAL_INDUSTRY_ADOPTION_TYPES;
}

export function getCanonicalLifecycleClassificationTypes(): readonly TechnologyLifecycleType[] {
  return CANONICAL_TECHNOLOGY_LIFECYCLE_TYPES;
}

export function getCanonicalReadinessIndicators(): readonly ReadinessIndicatorType[] {
  return CANONICAL_READINESS_INDICATORS;
}

export function getCanonicalTechnologyMaturityStatuses(): readonly TechnologyMaturityStatus[] {
  return CANONICAL_TECHNOLOGY_MATURITY_STATUS;
}
