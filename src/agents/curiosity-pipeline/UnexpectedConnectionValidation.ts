/**
 * NV-2100-D9-OPT-07 — Unexpected Connection Validation Layer
 *
 * Deterministic validation for unexpected connection metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  UnexpectedConnectionProfile,
  LimitationWarning,
  ApplicationSurprise,
  DiscoveryRelationship,
  DiscoveryRegistry,
  DiscoveryInput,
  UnexpectedConnectionTrace,
  CuriosityArtifactWithDiscoveries,
  DiscoveryValidationError,
  DiscoveryRegistryValidationResult,
  DiscoveryInputValidationResult,
  DiscoveryTraceValidationResult,
  CuriosityArtifactWithDiscoveriesValidationResult,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_CONNECTION_TYPES,
  CANONICAL_LIMITATION_TYPES,
  CANONICAL_SURPRISE_TYPES,
  CANONICAL_DISCOVERY_IMPACT,
  CANONICAL_DISCOVERY_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const DISCOVERY_VALIDATION_CODES = {
  DISCOVERY_DUPLICATE_ID: 'DISCOVERY_DUPLICATE_ID',
  DISCOVERY_DUPLICATE_TITLE: 'DISCOVERY_DUPLICATE_TITLE',
  DISCOVERY_INVALID_CONNECTION: 'DISCOVERY_INVALID_CONNECTION',
  DISCOVERY_INVALID_LIMITATION: 'DISCOVERY_INVALID_LIMITATION',
  DISCOVERY_INVALID_SURPRISE: 'DISCOVERY_INVALID_SURPRISE',
  DISCOVERY_INVALID_IMPACT: 'DISCOVERY_INVALID_IMPACT',
  DISCOVERY_INVALID_STATUS: 'DISCOVERY_INVALID_STATUS',
  DISCOVERY_INVALID_GOVERNANCE: 'DISCOVERY_INVALID_GOVERNANCE',
  DISCOVERY_MISSING_PROVENANCE: 'DISCOVERY_MISSING_PROVENANCE',
  DISCOVERY_MISSING_PROVIDER: 'DISCOVERY_MISSING_PROVIDER',
  DISCOVERY_MISSING_RATIONALE: 'DISCOVERY_MISSING_RATIONALE',
  DISCOVERY_MISSING_CURIOSITY_REFERENCE: 'DISCOVERY_MISSING_CURIOSITY_REFERENCE',
  DISCOVERY_MISSING_PROFILE_ID: 'DISCOVERY_MISSING_PROFILE_ID',
  DISCOVERY_MISSING_TITLE: 'DISCOVERY_MISSING_TITLE',
  DISCOVERY_MISSING_DISCOVERY: 'DISCOVERY_MISSING_DISCOVERY',
  DISCOVERY_SELF_RELATIONSHIP: 'DISCOVERY_SELF_RELATIONSHIP',
  DISCOVERY_EMPTY_REGISTRY: 'DISCOVERY_EMPTY_REGISTRY',
  DISCOVERY_INVALID_TRACE: 'DISCOVERY_INVALID_TRACE',
  DISCOVERY_REGISTRY_INCONSISTENCY: 'DISCOVERY_REGISTRY_INCONSISTENCY',
  DISCOVERY_INVALID_CONFIGURATION: 'DISCOVERY_INVALID_CONFIGURATION',
  DISCOVERY_INVALID_REFERENCE: 'DISCOVERY_INVALID_REFERENCE',
  DISCOVERY_INVALID_RELATIONSHIP: 'DISCOVERY_INVALID_RELATIONSHIP',
  DISCOVERY_MISSING_RELATIONSHIP: 'DISCOVERY_MISSING_RELATIONSHIP',
  DISCOVERY_MISSING_GOVERNANCE: 'DISCOVERY_MISSING_GOVERNANCE',
} as const;

// ---------------------------------------------------------------------------
// Single Profile Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single unexpected connection profile against canonical invariants.
 * Pure function. No side effects.
 */
export function validateUnexpectedConnectionProfile(
  profile: UnexpectedConnectionProfile,
): readonly DiscoveryValidationError[] {
  const errors: DiscoveryValidationError[] = [];

  if (!profile.id || profile.id.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROFILE_ID,
      message: 'Unexpected connection profile is missing a profile ID.',
      field: 'id',
      profileId: profile.id,
    });
  }

  if (!profile.title || profile.title.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_TITLE,
      message: 'Unexpected connection profile is missing a title.',
      field: 'title',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_CONNECTION_TYPES.includes(profile.connectionType)) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_CONNECTION,
      message: `Unexpected connection profile has unsupported connection type: "${profile.connectionType}".`,
      field: 'connectionType',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_LIMITATION_TYPES.includes(profile.limitationType)) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_LIMITATION,
      message: `Unexpected connection profile has unsupported limitation type: "${profile.limitationType}".`,
      field: 'limitationType',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_SURPRISE_TYPES.includes(profile.surpriseType)) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_SURPRISE,
      message: `Unexpected connection profile has unsupported surprise type: "${profile.surpriseType}".`,
      field: 'surpriseType',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_DISCOVERY_IMPACT.includes(profile.discoveryImpact)) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_IMPACT,
      message: `Unexpected connection profile has unsupported discovery impact: "${profile.discoveryImpact}".`,
      field: 'discoveryImpact',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_DISCOVERY_STATUS.includes(profile.status)) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_STATUS,
      message: `Unexpected connection profile has unsupported status: "${profile.status}".`,
      field: 'status',
      profileId: profile.id,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(profile.governance)) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_GOVERNANCE,
      message: `Unexpected connection profile has invalid governance: "${profile.governance}".`,
      field: 'governance',
      profileId: profile.id,
    });
  }

  if (!profile.provenance) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVENANCE,
      message: 'Unexpected connection profile is missing provenance.',
      field: 'provenance',
      profileId: profile.id,
    });
  } else {
    if (!profile.provenance.provider || profile.provenance.provider.trim() === '') {
      errors.push({
        code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVIDER,
        message: 'Unexpected connection provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: profile.id,
      });
    }

    if (!profile.provenance.rationale || profile.provenance.rationale.trim() === '') {
      errors.push({
        code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_RATIONALE,
        message: 'Unexpected connection provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: profile.id,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Limitation Warning Validation
// ---------------------------------------------------------------------------

/**
 * Validates a limitation warning against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLimitationWarning(
  warning: LimitationWarning,
): readonly DiscoveryValidationError[] {
  const errors: DiscoveryValidationError[] = [];

  if (!warning.warningId || warning.warningId.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_DISCOVERY,
      message: 'Limitation warning is missing a warning ID.',
      field: 'warningId',
    });
  }

  if (!warning.title || warning.title.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_TITLE,
      message: 'Limitation warning is missing a title.',
      field: 'title',
    });
  }

  if (!CANONICAL_LIMITATION_TYPES.includes(warning.limitationType)) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_LIMITATION,
      message: `Limitation warning has unsupported limitation type: "${warning.limitationType}".`,
      field: 'limitationType',
    });
  }

  if (!warning.limitationDescription || warning.limitationDescription.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_CONFIGURATION,
      message: 'Limitation warning is missing limitation description.',
      field: 'limitationDescription',
    });
  }

  if (!warning.impactAssessment || warning.impactAssessment.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_CONFIGURATION,
      message: 'Limitation warning is missing impact assessment.',
      field: 'impactAssessment',
    });
  }

  if (!warning.mitigationStrategy || warning.mitigationStrategy.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_CONFIGURATION,
      message: 'Limitation warning is missing mitigation strategy.',
      field: 'mitigationStrategy',
    });
  }

  if (!CANONICAL_DISCOVERY_STATUS.includes(warning.status)) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_STATUS,
      message: `Limitation warning has unsupported status: "${warning.status}".`,
      field: 'status',
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(warning.governance)) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_GOVERNANCE,
      message: `Limitation warning has invalid governance: "${warning.governance}".`,
      field: 'governance',
    });
  }

  if (!warning.provenance) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVENANCE,
      message: 'Limitation warning is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!warning.provenance.provider || warning.provenance.provider.trim() === '') {
      errors.push({
        code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVIDER,
        message: 'Limitation warning provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!warning.provenance.rationale || warning.provenance.rationale.trim() === '') {
      errors.push({
        code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_RATIONALE,
        message: 'Limitation warning provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Application Surprise Validation
// ---------------------------------------------------------------------------

/**
 * Validates an application surprise against canonical invariants.
 * Pure function. No side effects.
 */
export function validateApplicationSurprise(
  surprise: ApplicationSurprise,
): readonly DiscoveryValidationError[] {
  const errors: DiscoveryValidationError[] = [];

  if (!surprise.surpriseId || surprise.surpriseId.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_DISCOVERY,
      message: 'Application surprise is missing a surprise ID.',
      field: 'surpriseId',
    });
  }

  if (!surprise.title || surprise.title.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_TITLE,
      message: 'Application surprise is missing a title.',
      field: 'title',
    });
  }

  if (!CANONICAL_SURPRISE_TYPES.includes(surprise.surpriseType)) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_SURPRISE,
      message: `Application surprise has unsupported surprise type: "${surprise.surpriseType}".`,
      field: 'surpriseType',
    });
  }

  if (!surprise.originalContext || surprise.originalContext.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_CONFIGURATION,
      message: 'Application surprise is missing original context.',
      field: 'originalContext',
    });
  }

  if (!surprise.unexpectedApplication || surprise.unexpectedApplication.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_CONFIGURATION,
      message: 'Application surprise is missing unexpected application.',
      field: 'unexpectedApplication',
    });
  }

  if (!surprise.whySurprising || surprise.whySurprising.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_CONFIGURATION,
      message: 'Application surprise is missing why surprising.',
      field: 'whySurprising',
    });
  }

  if (!CANONICAL_DISCOVERY_STATUS.includes(surprise.status)) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_STATUS,
      message: `Application surprise has unsupported status: "${surprise.status}".`,
      field: 'status',
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(surprise.governance)) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_GOVERNANCE,
      message: `Application surprise has invalid governance: "${surprise.governance}".`,
      field: 'governance',
    });
  }

  if (!surprise.provenance) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVENANCE,
      message: 'Application surprise is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!surprise.provenance.provider || surprise.provenance.provider.trim() === '') {
      errors.push({
        code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVIDER,
        message: 'Application surprise provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!surprise.provenance.rationale || surprise.provenance.rationale.trim() === '') {
      errors.push({
        code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_RATIONALE,
        message: 'Application surprise provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Discovery Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a discovery relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateDiscoveryRelationship(
  relationship: DiscoveryRelationship,
): readonly DiscoveryValidationError[] {
  const errors: DiscoveryValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_CURIOSITY_REFERENCE,
      message: 'Discovery relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceProfileId || relationship.sourceProfileId.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_CURIOSITY_REFERENCE,
      message: 'Discovery relationship is missing a source profile ID.',
      field: 'sourceProfileId',
    });
  }

  if (!relationship.targetProfileId || relationship.targetProfileId.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_CURIOSITY_REFERENCE,
      message: 'Discovery relationship is missing a target profile ID.',
      field: 'targetProfileId',
    });
  }

  if (relationship.sourceProfileId === relationship.targetProfileId) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_SELF_RELATIONSHIP,
      message: 'Discovery relationship cannot be a self-relationship.',
      field: 'targetProfileId',
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVENANCE,
      message: 'Discovery relationship is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!relationship.provenance.provider || relationship.provenance.provider.trim() === '') {
      errors.push({
        code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVIDER,
        message: 'Discovery relationship provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_RATIONALE,
        message: 'Discovery relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Discovery Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a discovery registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateDiscoveryRegistry(
  registry: DiscoveryRegistry,
): DiscoveryRegistryValidationResult {
  const errors: DiscoveryValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.connections || registry.connections.length === 0) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_EMPTY_REGISTRY,
      message: 'Registry has no connections.',
      field: 'connections',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate connection IDs
  const seenIds = new Set<string>();
  for (const connection of registry.connections) {
    if (seenIds.has(connection.id)) {
      errors.push({
        code: DISCOVERY_VALIDATION_CODES.DISCOVERY_DUPLICATE_ID,
        message: `Duplicate connection ID: "${connection.id}".`,
        profileId: connection.id,
      });
    }
    seenIds.add(connection.id);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const connection of registry.connections) {
    if (seenTitles.has(connection.title)) {
      errors.push({
        code: DISCOVERY_VALIDATION_CODES.DISCOVERY_DUPLICATE_TITLE,
        message: `Duplicate connection title: "${connection.title}".`,
        field: 'title',
        profileId: connection.id,
      });
    }
    seenTitles.add(connection.title);
  }

  // Validate each connection
  for (const connection of registry.connections) {
    errors.push(...validateUnexpectedConnectionProfile(connection));
  }

  // Validate each limitation
  for (const limitation of registry.limitations) {
    errors.push(...validateLimitationWarning(limitation));
  }

  // Validate each surprise
  for (const surprise of registry.surprises) {
    errors.push(...validateApplicationSurprise(surprise));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateDiscoveryRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'discovery_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Discovery Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates discovery input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateDiscoveryInput(
  input: DiscoveryInput,
): DiscoveryInputValidationResult {
  const errors: DiscoveryValidationError[] = [];

  if (!input.connections || input.connections.length === 0) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_EMPTY_REGISTRY,
      message: 'Input has no connections.',
      field: 'connections',
    });
  } else {
    for (const connection of input.connections) {
      errors.push(...validateUnexpectedConnectionProfile(connection));
    }
  }

  for (const limitation of input.limitations) {
    errors.push(...validateLimitationWarning(limitation));
  }

  for (const surprise of input.surprises) {
    errors.push(...validateApplicationSurprise(surprise));
  }

  for (const relationship of input.relationships) {
    errors.push(...validateDiscoveryRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'discovery_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Discovery Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a discovery trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateDiscoveryTrace(
  trace: UnexpectedConnectionTrace,
): DiscoveryTraceValidationResult {
  const errors: DiscoveryValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_TRACE,
      message: 'Discovery trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_TRACE,
      message: 'Discovery trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_TRACE,
      message: 'Discovery trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_INVALID_TRACE,
      message: 'Discovery trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'discovery_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Discoveries Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity artifact with discoveries against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityArtifactWithDiscoveries(
  artifact: CuriosityArtifactWithDiscoveries,
): CuriosityArtifactWithDiscoveriesValidationResult {
  const errors: DiscoveryValidationError[] = [];

  if (!artifact.curiosityId || artifact.curiosityId.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity artifact is missing a curiosity ID.',
      field: 'curiosityId',
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_TITLE,
      message: 'Curiosity artifact is missing a title.',
      field: 'title',
    });
  }

  if (!artifact.connections || artifact.connections.length === 0) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_EMPTY_REGISTRY,
      message: 'Curiosity artifact has no connections.',
      field: 'connections',
    });
  } else {
    for (const connection of artifact.connections) {
      errors.push(...validateUnexpectedConnectionProfile(connection));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVENANCE,
      message: 'Curiosity artifact is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_PROVIDER,
        message: 'Curiosity artifact provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: DISCOVERY_VALIDATION_CODES.DISCOVERY_MISSING_RATIONALE,
        message: 'Curiosity artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_artifact_with_discoveries_composition',
  };
}
