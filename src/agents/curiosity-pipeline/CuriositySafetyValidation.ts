/**
 * NV-2100-D9-OPT-14 — Curiosity Safety Validation Layer
 *
 * Deterministic validation for safety certification metadata.
 * Returns structured errors, never exceptions for expected validation failures.
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
  CertificationInput,
  CuriositySafetyTrace,
  CuriosityArtifactWithCertification,
  CertificationValidationError,
  CertificationRegistryValidationResult,
  CertificationInputValidationResult,
  CertificationTraceValidationResult,
  CuriosityArtifactWithCertificationValidationResult,
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
// Validation Error Codes
// ---------------------------------------------------------------------------

export const CERTIFICATION_VALIDATION_CODES = {
  CERTIFICATION_DUPLICATE_ID: 'CERTIFICATION_DUPLICATE_ID',
  CERTIFICATION_DUPLICATE_TITLE: 'CERTIFICATION_DUPLICATE_TITLE',
  CERTIFICATION_INVALID_SAFETY: 'CERTIFICATION_INVALID_SAFETY',
  CERTIFICATION_INVALID_HUMOR: 'CERTIFICATION_INVALID_HUMOR',
  CERTIFICATION_INVALID_ACCESSIBILITY: 'CERTIFICATION_INVALID_ACCESSIBILITY',
  CERTIFICATION_INVALID_FINDING: 'CERTIFICATION_INVALID_FINDING',
  CERTIFICATION_INVALID_DIMENSION: 'CERTIFICATION_INVALID_DIMENSION',
  CERTIFICATION_INVALID_STATUS: 'CERTIFICATION_INVALID_STATUS',
  CERTIFICATION_INVALID_GOVERNANCE: 'CERTIFICATION_INVALID_GOVERNANCE',
  CERTIFICATION_MISSING_PROVENANCE: 'CERTIFICATION_MISSING_PROVENANCE',
  CERTIFICATION_MISSING_PROVIDER: 'CERTIFICATION_MISSING_PROVIDER',
  CERTIFICATION_MISSING_RATIONALE: 'CERTIFICATION_MISSING_RATIONALE',
  CERTIFICATION_MISSING_CURIOSITY_REFERENCE: 'CERTIFICATION_MISSING_CURIOSITY_REFERENCE',
  CERTIFICATION_MISSING_PROFILE_ID: 'CERTIFICATION_MISSING_PROFILE_ID',
  CERTIFICATION_MISSING_TITLE: 'CERTIFICATION_MISSING_TITLE',
  CERTIFICATION_MISSING_CERTIFICATION: 'CERTIFICATION_MISSING_CERTIFICATION',
  CERTIFICATION_SELF_RELATIONSHIP: 'CERTIFICATION_SELF_RELATIONSHIP',
  CERTIFICATION_EMPTY_REGISTRY: 'CERTIFICATION_EMPTY_REGISTRY',
  CERTIFICATION_INVALID_TRACE: 'CERTIFICATION_INVALID_TRACE',
  CERTIFICATION_REGISTRY_INCONSISTENCY: 'CERTIFICATION_REGISTRY_INCONSISTENCY',
  CERTIFICATION_INVALID_CONFIGURATION: 'CERTIFICATION_INVALID_CONFIGURATION',
  CERTIFICATION_INVALID_RELATIONSHIP: 'CERTIFICATION_INVALID_RELATIONSHIP',
  CERTIFICATION_MISSING_GOVERNANCE: 'CERTIFICATION_MISSING_GOVERNANCE',
  CERTIFICATION_UNSUPPORTED_CONFIGURATION: 'CERTIFICATION_UNSUPPORTED_CONFIGURATION',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single safety certification profile against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriositySafetyProfile(
  profile: CuriositySafetyProfile,
): readonly CertificationValidationError[] {
  const errors: CertificationValidationError[] = [];

  if (!profile.profileId || profile.profileId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_PROFILE_ID,
      message: 'Safety certification profile is missing a profile ID.',
      field: 'profileId',
      profileId: profile.profileId,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_TITLE,
      message: 'Safety certification profile is missing a title.',
      field: 'title',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_SAFETY_CERTIFICATION_TYPES.includes(profile.safetyCertificationType)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_SAFETY,
      message: `Safety certification profile has unsupported safety certification type: "${profile.safetyCertificationType}".`,
      field: 'safetyCertificationType',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_HUMOR_RISK_LEVELS.includes(profile.humorRiskLevel)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_HUMOR,
      message: `Safety certification profile has unsupported humor risk level: "${profile.humorRiskLevel}".`,
      field: 'humorRiskLevel',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_ACCESSIBILITY_COMPLIANCE.includes(profile.accessibilityCompliance)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_ACCESSIBILITY,
      message: `Safety certification profile has unsupported accessibility compliance: "${profile.accessibilityCompliance}".`,
      field: 'accessibilityCompliance',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_CERTIFICATION_STATUS.includes(profile.status)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_STATUS,
      message: `Safety certification profile has unsupported status: "${profile.status}".`,
      field: 'status',
      profileId: profile.profileId,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_GOVERNANCE,
      message: `Safety certification profile has invalid governance: "${profile.governance}".`,
      field: 'governance',
      profileId: profile.profileId,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_PROVENANCE,
      message: 'Safety certification profile is missing provenance.',
      field: 'provenance',
      profileId: profile.profileId,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_PROVIDER,
        message: 'Safety certification provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: profile.profileId,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_RATIONALE,
        message: 'Safety certification provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: profile.profileId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Humor Risk Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates humor risk metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHumorRiskMetadata(
  metadata: HumorRiskMetadata,
): readonly CertificationValidationError[] {
  const errors: CertificationValidationError[] = [];

  if (!metadata.metadataId || metadata.metadataId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_CERTIFICATION,
      message: 'Humor risk metadata is missing a metadata ID.',
      field: 'metadataId',
    });
  }

  if (!metadata.profileId || metadata.profileId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Humor risk metadata is missing a profile ID.',
      field: 'profileId',
    });
  }

  if (!CANONICAL_HUMOR_RISK_LEVELS.includes(metadata.humorRiskLevel)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_HUMOR,
      message: `Humor risk metadata has unsupported humor risk level: "${metadata.humorRiskLevel}".`,
      field: 'humorRiskLevel',
    });
  }

  if (!metadata.riskDescription || metadata.riskDescription.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_CONFIGURATION,
      message: 'Humor risk metadata is missing risk description.',
      field: 'riskDescription',
    });
  }

  if (!metadata.mitigationStrategy || metadata.mitigationStrategy.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_CONFIGURATION,
      message: 'Humor risk metadata is missing mitigation strategy.',
      field: 'mitigationStrategy',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Accessibility Certification Validation
// ---------------------------------------------------------------------------

/**
 * Validates accessibility certification against canonical invariants.
 * Pure function. No side effects.
 */
export function validateAccessibilityCertification(
  certification: AccessibilityCertification,
): readonly CertificationValidationError[] {
  const errors: CertificationValidationError[] = [];

  if (!certification.certificationId || certification.certificationId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_CERTIFICATION,
      message: 'Accessibility certification is missing a certification ID.',
      field: 'certificationId',
    });
  }

  if (!certification.profileId || certification.profileId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Accessibility certification is missing a profile ID.',
      field: 'profileId',
    });
  }

  if (!CANONICAL_ACCESSIBILITY_COMPLIANCE.includes(certification.accessibilityCompliance)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_ACCESSIBILITY,
      message: `Accessibility certification has unsupported accessibility compliance: "${certification.accessibilityCompliance}".`,
      field: 'accessibilityCompliance',
    });
  }

  if (!certification.complianceDescription || certification.complianceDescription.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_CONFIGURATION,
      message: 'Accessibility certification is missing compliance description.',
      field: 'complianceDescription',
    });
  }

  if (!certification.wcagLevel || certification.wcagLevel.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_CONFIGURATION,
      message: 'Accessibility certification is missing WCAG level.',
      field: 'wcagLevel',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Certification Finding Validation
// ---------------------------------------------------------------------------

/**
 * Validates a certification finding against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCertificationFinding(
  finding: CertificationFindingRecord,
): readonly CertificationValidationError[] {
  const errors: CertificationValidationError[] = [];

  if (!finding.findingId || finding.findingId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_CERTIFICATION,
      message: 'Certification finding is missing a finding ID.',
      field: 'findingId',
    });
  }

  if (!finding.profileId || finding.profileId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Certification finding is missing a profile ID.',
      field: 'profileId',
    });
  }

  if (!CANONICAL_CERTIFICATION_FINDINGS.includes(finding.certificationFinding)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_FINDING,
      message: `Certification finding has unsupported finding: "${finding.certificationFinding}".`,
      field: 'certificationFinding',
    });
  }

  if (!finding.findingDescription || finding.findingDescription.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_CONFIGURATION,
      message: 'Certification finding is missing finding description.',
      field: 'findingDescription',
    });
  }

  if (!finding.severity || finding.severity.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_CONFIGURATION,
      message: 'Certification finding is missing severity.',
      field: 'severity',
    });
  }

  if (!finding.recommendation || finding.recommendation.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_CONFIGURATION,
      message: 'Certification finding is missing recommendation.',
      field: 'recommendation',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Certification Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a certification relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCertificationRelationship(
  relationship: CertificationRelationship,
): readonly CertificationValidationError[] {
  const errors: CertificationValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Certification relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceProfileId || relationship.sourceProfileId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Certification relationship is missing a source profile ID.',
      field: 'sourceProfileId',
    });
  }

  if (!relationship.targetProfileId || relationship.targetProfileId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Certification relationship is missing a target profile ID.',
      field: 'targetProfileId',
    });
  }

  if (relationship.sourceProfileId === relationship.targetProfileId) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_SELF_RELATIONSHIP,
      message: 'Certification relationship cannot be a self-relationship.',
      field: 'targetProfileId',
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_PROVENANCE,
      message: 'Certification relationship is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!relationship.provenance.provider || relationship.provenance.provider.trim() === '') {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_PROVIDER,
        message: 'Certification relationship provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_RATIONALE,
        message: 'Certification relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Certification Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a certification registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCertificationRegistry(
  registry: CertificationRegistry,
): CertificationRegistryValidationResult {
  const errors: CertificationValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.profiles || registry.profiles.length === 0) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_EMPTY_REGISTRY,
      message: 'Registry has no profiles.',
      field: 'profiles',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate profile IDs
  const seenIds = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenIds.has(profile.profileId)) {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_DUPLICATE_ID,
        message: `Duplicate profile ID: "${profile.profileId}".`,
        profileId: profile.profileId,
      });
    }
    seenIds.add(profile.profileId);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const profile of registry.profiles) {
    if (seenTitles.has(profile.title)) {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_DUPLICATE_TITLE,
        message: `Duplicate profile title: "${profile.title}".`,
        field: 'title',
        profileId: profile.profileId,
      });
    }
    seenTitles.add(profile.title);
  }

  // Validate each profile
  for (const profile of registry.profiles) {
    errors.push(...validateCuriositySafetyProfile(profile));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateCertificationRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'certification_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Certification Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates certification input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCertificationInput(
  input: CertificationInput,
): CertificationInputValidationResult {
  const errors: CertificationValidationError[] = [];

  if (!input.profiles || input.profiles.length === 0) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_EMPTY_REGISTRY,
      message: 'Input has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of input.profiles) {
      errors.push(...validateCuriositySafetyProfile(profile));
    }
  }

  for (const relationship of input.relationships) {
    errors.push(...validateCertificationRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'certification_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Certification Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a certification trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCertificationTrace(
  trace: CuriositySafetyTrace,
): CertificationTraceValidationResult {
  const errors: CertificationValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_TRACE,
      message: 'Certification trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_TRACE,
      message: 'Certification trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_TRACE,
      message: 'Certification trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_TRACE,
      message: 'Certification trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'certification_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Certification Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity artifact with certification against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityArtifactWithCertification(
  artifact: CuriosityArtifactWithCertification,
): CuriosityArtifactWithCertificationValidationResult {
  const errors: CertificationValidationError[] = [];

  if (!artifact.curiosityId || artifact.curiosityId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity artifact is missing a curiosity ID.',
      field: 'curiosityId',
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_TITLE,
      message: 'Curiosity artifact is missing a title.',
      field: 'title',
    });
  }

  if (!artifact.profiles || artifact.profiles.length === 0) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_EMPTY_REGISTRY,
      message: 'Curiosity artifact has no profiles.',
      field: 'profiles',
    });
  } else {
    for (const profile of artifact.profiles) {
      errors.push(...validateCuriositySafetyProfile(profile));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_PROVENANCE,
      message: 'Curiosity artifact is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_PROVIDER,
        message: 'Curiosity artifact provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_RATIONALE,
        message: 'Curiosity artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_artifact_with_certification_composition',
  };
}
