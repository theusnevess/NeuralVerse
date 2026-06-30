/**
 * NV-2100-D9-OPT-14 — Safety, Accessibility & Humor Risk Certification
 *
 * Deterministic orchestration functions for safety certification metadata.
 * Produces safety profiles, humor risk metadata, accessibility certifications, findings, traces, and registries.
 *
 * This module never:
 * - Performs content moderation
 * - Detects toxicity
 * - Detects hate speech
 * - Adapts accessibility
 * - Generates humor
 * - Enforces policies
 * - Executes certifications
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Safety certification metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CuriositySafetyProfile,
  HumorRiskMetadata,
  AccessibilityCertification,
  CertificationFindingRecord,
  CertificationRelationship,
  CertificationRegistry,
  CertificationRegistryMetadata,
  CertificationInput,
  CuriositySafetyProvenance,
  CuriositySafetyDecision,
  CuriositySafetyTrace,
  CuriosityArtifactWithCertification,
  SafetyCertificationType,
  HumorRiskLevel,
  AccessibilityCompliance,
  CertificationFinding,
  CertificationDimension,
  CertificationStatus,
  CuriosityGovernance,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_SAFETY_CERTIFICATION_TYPES,
  CANONICAL_HUMOR_RISK_LEVELS,
  CANONICAL_ACCESSIBILITY_COMPLIANCE,
  CANONICAL_CERTIFICATION_FINDINGS,
  CANONICAL_CERTIFICATION_DIMENSIONS,
  CANONICAL_CERTIFICATION_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Safety Certification Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes safety certification provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriositySafetyProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}): CuriositySafetyProvenance {
  return {
    provider: params.provider,
    source: params.source,
    rationale: params.rationale,
    version: params.version,
  };
}

// ---------------------------------------------------------------------------
// Safety Certification Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a safety certification decision from validation results.
 * Pure function. No side effects.
 */
function _composeCuriositySafetyDecision(
  profileId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): CuriositySafetyDecision {
  return {
    decisionId: `_decision_${profileId}`,
    profileId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Safety Certification Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a safety certification trace from metadata.
 * Pure function. No side effects.
 */
export function composeCuriositySafetyTrace(params: {
  readonly traceId: string;
}): CuriositySafetyTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_curiosity_safety_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Safety Certification Profile Composition
// ---------------------------------------------------------------------------

/**
 * Composes a safety certification profile from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriositySafetyProfile(params: {
  readonly profileId: string;
  readonly title: string;
  readonly safetyCertificationType: SafetyCertificationType;
  readonly humorRiskLevel: HumorRiskLevel;
  readonly accessibilityCompliance: AccessibilityCompliance;
  readonly conceptIds: readonly string[];
  readonly status: CertificationStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriositySafetyProvenance;
  readonly trace: CuriositySafetyTrace;
}): CuriositySafetyProfile {
  return {
    profileId: params.profileId,
    title: params.title,
    safetyCertificationType: params.safetyCertificationType,
    humorRiskLevel: params.humorRiskLevel,
    accessibilityCompliance: params.accessibilityCompliance,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Humor Risk Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes humor risk metadata from provided parameters.
 * Pure function. No side effects.
 */
export function composeHumorRiskMetadata(params: {
  readonly metadataId: string;
  readonly profileId: string;
  readonly humorRiskLevel: HumorRiskLevel;
  readonly riskDescription: string;
  readonly mitigationStrategy: string;
  readonly reviewRequired: boolean;
  readonly safetyJustification: string;
}): HumorRiskMetadata {
  return {
    metadataId: params.metadataId,
    profileId: params.profileId,
    humorRiskLevel: params.humorRiskLevel,
    riskDescription: params.riskDescription,
    mitigationStrategy: params.mitigationStrategy,
    reviewRequired: params.reviewRequired,
    safetyJustification: params.safetyJustification,
  };
}

// ---------------------------------------------------------------------------
// Accessibility Certification Composition
// ---------------------------------------------------------------------------

/**
 * Composes accessibility certification from provided parameters.
 * Pure function. No side effects.
 */
export function composeAccessibilityCertification(params: {
  readonly certificationId: string;
  readonly profileId: string;
  readonly accessibilityCompliance: AccessibilityCompliance;
  readonly complianceDescription: string;
  readonly remediationRequired: boolean;
  readonly alternativeProvided: boolean;
  readonly wcagLevel: string;
}): AccessibilityCertification {
  return {
    certificationId: params.certificationId,
    profileId: params.profileId,
    accessibilityCompliance: params.accessibilityCompliance,
    complianceDescription: params.complianceDescription,
    remediationRequired: params.remediationRequired,
    alternativeProvided: params.alternativeProvided,
    wcagLevel: params.wcagLevel,
  };
}

// ---------------------------------------------------------------------------
// Certification Finding Composition
// ---------------------------------------------------------------------------

/**
 * Composes a certification finding from provided parameters.
 * Pure function. No side effects.
 */
export function composeCertificationFinding(params: {
  readonly findingId: string;
  readonly profileId: string;
  readonly certificationFinding: CertificationFinding;
  readonly findingDescription: string;
  readonly severity: string;
  readonly recommendation: string;
}): CertificationFindingRecord {
  return {
    findingId: params.findingId,
    profileId: params.profileId,
    certificationFinding: params.certificationFinding,
    findingDescription: params.findingDescription,
    severity: params.severity,
    recommendation: params.recommendation,
  };
}

// ---------------------------------------------------------------------------
// Certification Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a certification relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeCertificationRelationship(params: {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: CuriositySafetyProvenance;
}): CertificationRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceProfileId: params.sourceProfileId,
    targetProfileId: params.targetProfileId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Profiles
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for safety certification profiles.
 * Sorts by profileId, then safetyCertificationType, then title.
 * Pure function. No side effects.
 */
function _compareCuriositySafetyProfile(
  a: CuriositySafetyProfile,
  b: CuriositySafetyProfile,
): number {
  if (a.profileId < b.profileId) return -1;
  if (a.profileId > b.profileId) return 1;

  if (a.safetyCertificationType < b.safetyCertificationType) return -1;
  if (a.safetyCertificationType > b.safetyCertificationType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Relationships
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for certification relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _compareCertificationRelationship(
  a: CertificationRelationship,
  b: CertificationRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Certification Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a certification registry from profiles, humor risks, accessibility, findings, and relationships.
 * Pure function. No side effects.
 * Deterministic ordering: profileId → safetyCertificationType → title.
 */
export function composeCertificationRegistry(
  profiles: readonly CuriositySafetyProfile[],
  humorRisks: readonly HumorRiskMetadata[],
  accessibility: readonly AccessibilityCertification[],
  findings: readonly CertificationFindingRecord[],
  relationships: readonly CertificationRelationship[],
): CertificationRegistry {
  const sortedProfiles = [...profiles].sort(_compareCuriositySafetyProfile);
  const sortedRelationships = [...relationships].sort(_compareCertificationRelationship);

  const metadata: CertificationRegistryMetadata = {
    registryId: `_registry_${sortedProfiles.length}_${humorRisks.length}_${accessibility.length}_${findings.length}_${sortedRelationships.length}`,
    version: '1.0.0',
    profileCount: sortedProfiles.length,
    humorRiskCount: humorRisks.length,
    accessibilityCount: accessibility.length,
    findingCount: findings.length,
    relationshipCount: sortedRelationships.length,
  };

  return {
    registryId: metadata.registryId,
    profiles: sortedProfiles,
    humorRisks,
    accessibility,
    findings,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedProfiles.length}_${humorRisks.length}_${accessibility.length}_${findings.length}_${sortedRelationships.length}`,
      generatedFrom: 'deterministic_curiosity_safety_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_curiosity_safety_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Certification Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a certification registry from an input.
 * Pure function. No side effects.
 */
export function composeCertificationRegistryFromInput(
  input: CertificationInput,
): CertificationRegistry {
  return composeCertificationRegistry(input.profiles, input.humorRisks, input.accessibility, input.findings, input.relationships);
}

// ---------------------------------------------------------------------------
// Certification Artifacts Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete certification registry from an input.
 * Pure function. No side effects.
 */
export function composeCertificationArtifacts(
  input: CertificationInput,
): CertificationRegistry {
  const registry = composeCertificationRegistry(input.profiles, input.humorRisks, input.accessibility, input.findings, input.relationships);

  return {
    ...registry,
    trace: composeCuriositySafetyTrace({
      traceId: `_trace_${input.profiles.length}_${input.humorRisks.length}_${input.accessibility.length}_${input.findings.length}_${input.relationships.length}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Certification Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact with certification from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifactWithCertification(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly profiles: readonly CuriositySafetyProfile[];
  readonly humorRisks: readonly HumorRiskMetadata[];
  readonly accessibility: readonly AccessibilityCertification[];
  readonly findings: readonly CertificationFindingRecord[];
  readonly relationships: readonly CertificationRelationship[];
  readonly provenance: CuriositySafetyProvenance;
}): CuriosityArtifactWithCertification {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    profiles: [...params.profiles],
    humorRisks: [...params.humorRisks],
    accessibility: [...params.accessibility],
    findings: [...params.findings],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported safety certification type.
 */
export function isSupportedSafetyCertificationType(
  certificationType: string,
): certificationType is SafetyCertificationType {
  return CANONICAL_SAFETY_CERTIFICATION_TYPES.includes(certificationType as SafetyCertificationType);
}

/**
 * Checks if a string is a supported humor risk level.
 */
export function isSupportedHumorRiskLevel(
  level: string,
): level is HumorRiskLevel {
  return CANONICAL_HUMOR_RISK_LEVELS.includes(level as HumorRiskLevel);
}

/**
 * Checks if a string is a supported accessibility compliance.
 */
export function isSupportedAccessibilityCompliance(
  compliance: string,
): compliance is AccessibilityCompliance {
  return CANONICAL_ACCESSIBILITY_COMPLIANCE.includes(compliance as AccessibilityCompliance);
}

/**
 * Checks if a string is a supported certification finding.
 */
export function isSupportedCertificationFinding(
  finding: string,
): finding is CertificationFinding {
  return CANONICAL_CERTIFICATION_FINDINGS.includes(finding as CertificationFinding);
}

/**
 * Checks if a string is a supported certification dimension.
 */
export function isSupportedCertificationDimension(
  dimension: string,
): dimension is CertificationDimension {
  return CANONICAL_CERTIFICATION_DIMENSIONS.includes(dimension as CertificationDimension);
}

/**
 * Checks if a string is a supported certification status.
 */
export function isSupportedCertificationStatus(
  status: string,
): status is CertificationStatus {
  return CANONICAL_CERTIFICATION_STATUS.includes(status as CertificationStatus);
}

/**
 * Checks if a string is a supported certification governance.
 */
export function isSupportedCertificationGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical safety certification types.
 */
export function getCanonicalSafetyCertificationTypes(): readonly SafetyCertificationType[] {
  return [...CANONICAL_SAFETY_CERTIFICATION_TYPES];
}

/**
 * Returns the canonical humor risk levels.
 */
export function getCanonicalHumorRiskLevels(): readonly HumorRiskLevel[] {
  return [...CANONICAL_HUMOR_RISK_LEVELS];
}

/**
 * Returns the canonical accessibility compliance values.
 */
export function getCanonicalAccessibilityCompliance(): readonly AccessibilityCompliance[] {
  return [...CANONICAL_ACCESSIBILITY_COMPLIANCE];
}

/**
 * Returns the canonical certification findings.
 */
export function getCanonicalCertificationFindings(): readonly CertificationFinding[] {
  return [...CANONICAL_CERTIFICATION_FINDINGS];
}

/**
 * Returns the canonical certification dimensions.
 */
export function getCanonicalCertificationDimensions(): readonly CertificationDimension[] {
  return [...CANONICAL_CERTIFICATION_DIMENSIONS];
}

/**
 * Returns the canonical certification statuses.
 */
export function getCanonicalCertificationStatuses(): readonly CertificationStatus[] {
  return [...CANONICAL_CERTIFICATION_STATUS];
}
