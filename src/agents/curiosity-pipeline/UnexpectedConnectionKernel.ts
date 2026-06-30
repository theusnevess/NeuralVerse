/**
 * NV-2100-D9-OPT-07 — Unexpected Connection Kernel
 *
 * Deterministic orchestration functions for unexpected connection metadata.
 * Produces connection profiles, limitation warnings, application surprises, traces, and registries.
 *
 * This module never:
 * - Generates unexpected connections
 * - Performs reasoning
 * - Infers relationships
 * - Searches knowledge
 * - Generates analogies
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Unexpected connection metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  UnexpectedConnectionProfile,
  LimitationWarning,
  ApplicationSurprise,
  DiscoveryRelationship,
  DiscoveryRegistry,
  DiscoveryRegistryMetadata,
  DiscoveryInput,
  UnexpectedConnectionProvenance,
  UnexpectedConnectionDecision,
  UnexpectedConnectionTrace,
  CuriosityArtifactWithDiscoveries,
  ConnectionType,
  LimitationType,
  SurpriseType,
  DiscoveryImpact,
  DiscoveryStatus,
  CuriosityGovernance,
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
// Unexpected Connection Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes unexpected connection provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeUnexpectedConnectionProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly rationale: string;
  readonly version: string;
}): UnexpectedConnectionProvenance {
  return {
    provider: params.provider,
    source: params.source,
    rationale: params.rationale,
    version: params.version,
  };
}

// ---------------------------------------------------------------------------
// Unexpected Connection Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes an unexpected connection decision from validation results.
 * Pure function. No side effects.
 */
function _composeUnexpectedConnectionDecision(
  profileId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): UnexpectedConnectionDecision {
  return {
    decisionId: `_decision_${profileId}`,
    profileId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Unexpected Connection Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes an unexpected connection trace from metadata.
 * Pure function. No side effects.
 */
export function composeUnexpectedConnectionTrace(params: {
  readonly traceId: string;
}): UnexpectedConnectionTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_unexpected_connection_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Unexpected Connection Profile Composition
// ---------------------------------------------------------------------------

/**
 * Composes an unexpected connection profile from provided parameters.
 * Pure function. No side effects.
 */
export function composeUnexpectedConnectionProfile(params: {
  readonly id: string;
  readonly title: string;
  readonly connectionType: ConnectionType;
  readonly limitationType: LimitationType;
  readonly surpriseType: SurpriseType;
  readonly discoveryImpact: DiscoveryImpact;
  readonly conceptIds: readonly string[];
  readonly status: DiscoveryStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: UnexpectedConnectionProvenance;
  readonly trace: UnexpectedConnectionTrace;
}): UnexpectedConnectionProfile {
  return {
    id: params.id,
    title: params.title,
    connectionType: params.connectionType,
    limitationType: params.limitationType,
    surpriseType: params.surpriseType,
    discoveryImpact: params.discoveryImpact,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Limitation Warning Composition
// ---------------------------------------------------------------------------

/**
 * Composes a limitation warning from provided parameters.
 * Pure function. No side effects.
 */
export function composeLimitationWarning(params: {
  readonly warningId: string;
  readonly title: string;
  readonly limitationType: LimitationType;
  readonly limitationDescription: string;
  readonly impactAssessment: string;
  readonly mitigationStrategy: string;
  readonly conceptIds: readonly string[];
  readonly status: DiscoveryStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: UnexpectedConnectionProvenance;
  readonly trace: UnexpectedConnectionTrace;
}): LimitationWarning {
  return {
    warningId: params.warningId,
    title: params.title,
    limitationType: params.limitationType,
    limitationDescription: params.limitationDescription,
    impactAssessment: params.impactAssessment,
    mitigationStrategy: params.mitigationStrategy,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Application Surprise Composition
// ---------------------------------------------------------------------------

/**
 * Composes an application surprise from provided parameters.
 * Pure function. No side effects.
 */
export function composeApplicationSurprise(params: {
  readonly surpriseId: string;
  readonly title: string;
  readonly surpriseType: SurpriseType;
  readonly originalContext: string;
  readonly unexpectedApplication: string;
  readonly whySurprising: string;
  readonly conceptIds: readonly string[];
  readonly status: DiscoveryStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: UnexpectedConnectionProvenance;
  readonly trace: UnexpectedConnectionTrace;
}): ApplicationSurprise {
  return {
    surpriseId: params.surpriseId,
    title: params.title,
    surpriseType: params.surpriseType,
    originalContext: params.originalContext,
    unexpectedApplication: params.unexpectedApplication,
    whySurprising: params.whySurprising,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace: params.trace,
  };
}

// ---------------------------------------------------------------------------
// Discovery Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a discovery relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeDiscoveryRelationship(params: {
  readonly relationshipId: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: UnexpectedConnectionProvenance;
}): DiscoveryRelationship {
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
// Deterministic Sort Comparator for Connections
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for unexpected connection profiles.
 * Sorts by id, then connectionType, then title.
 * Pure function. No side effects.
 */
function _compareUnexpectedConnectionProfile(
  a: UnexpectedConnectionProfile,
  b: UnexpectedConnectionProfile,
): number {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;

  if (a.connectionType < b.connectionType) return -1;
  if (a.connectionType > b.connectionType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Limitations
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for limitation warnings.
 * Sorts by warningId.
 * Pure function. No side effects.
 */
function _compareLimitationWarning(
  a: LimitationWarning,
  b: LimitationWarning,
): number {
  if (a.warningId < b.warningId) return -1;
  if (a.warningId > b.warningId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Surprises
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for application surprises.
 * Sorts by surpriseId.
 * Pure function. No side effects.
 */
function _compareApplicationSurprise(
  a: ApplicationSurprise,
  b: ApplicationSurprise,
): number {
  if (a.surpriseId < b.surpriseId) return -1;
  if (a.surpriseId > b.surpriseId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Relationships
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for discovery relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _compareDiscoveryRelationship(
  a: DiscoveryRelationship,
  b: DiscoveryRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Discovery Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a discovery registry from connections, limitations, surprises, and relationships.
 * Pure function. No side effects.
 * Deterministic ordering: id → connectionType → title.
 */
export function composeDiscoveryRegistry(
  connections: readonly UnexpectedConnectionProfile[],
  limitations: readonly LimitationWarning[],
  surprises: readonly ApplicationSurprise[],
  relationships: readonly DiscoveryRelationship[],
): DiscoveryRegistry {
  const sortedConnections = [...connections].sort(_compareUnexpectedConnectionProfile);
  const sortedLimitations = [...limitations].sort(_compareLimitationWarning);
  const sortedSurprises = [...surprises].sort(_compareApplicationSurprise);
  const sortedRelationships = [...relationships].sort(_compareDiscoveryRelationship);

  const metadata: DiscoveryRegistryMetadata = {
    registryId: `_registry_${sortedConnections.length}_${sortedLimitations.length}_${sortedSurprises.length}_${sortedRelationships.length}`,
    version: '1.0.0',
    connectionCount: sortedConnections.length,
    limitationCount: sortedLimitations.length,
    surpriseCount: sortedSurprises.length,
    relationshipCount: sortedRelationships.length,
  };

  return {
    registryId: metadata.registryId,
    connections: sortedConnections,
    limitations: sortedLimitations,
    surprises: sortedSurprises,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedConnections.length}_${sortedLimitations.length}_${sortedSurprises.length}_${sortedRelationships.length}`,
      generatedFrom: 'deterministic_unexpected_connection_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_unexpected_connection_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Discovery Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a discovery registry from an input.
 * Pure function. No side effects.
 */
export function composeDiscoveryRegistryFromInput(
  input: DiscoveryInput,
): DiscoveryRegistry {
  return composeDiscoveryRegistry(input.connections, input.limitations, input.surprises, input.relationships);
}

// ---------------------------------------------------------------------------
// Discoveries Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete discovery registry from an input.
 * Pure function. No side effects.
 */
export function composeDiscoveries(
  input: DiscoveryInput,
): DiscoveryRegistry {
  const registry = composeDiscoveryRegistry(input.connections, input.limitations, input.surprises, input.relationships);

  return {
    ...registry,
    trace: composeUnexpectedConnectionTrace({
      traceId: `_trace_${input.connections.length}_${input.limitations.length}_${input.surprises.length}_${input.relationships.length}`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Discoveries Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity artifact with discoveries from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityArtifactWithDiscoveries(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly connections: readonly UnexpectedConnectionProfile[];
  readonly limitations: readonly LimitationWarning[];
  readonly surprises: readonly ApplicationSurprise[];
  readonly relationships: readonly DiscoveryRelationship[];
  readonly provenance: UnexpectedConnectionProvenance;
}): CuriosityArtifactWithDiscoveries {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    connections: [...params.connections],
    limitations: [...params.limitations],
    surprises: [...params.surprises],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported connection type.
 */
export function isSupportedConnectionType(
  connectionType: string,
): connectionType is ConnectionType {
  return CANONICAL_CONNECTION_TYPES.includes(connectionType as ConnectionType);
}

/**
 * Checks if a string is a supported limitation type.
 */
export function isSupportedLimitationType(
  limitationType: string,
): limitationType is LimitationType {
  return CANONICAL_LIMITATION_TYPES.includes(limitationType as LimitationType);
}

/**
 * Checks if a string is a supported surprise type.
 */
export function isSupportedSurpriseType(
  surpriseType: string,
): surpriseType is SurpriseType {
  return CANONICAL_SURPRISE_TYPES.includes(surpriseType as SurpriseType);
}

/**
 * Checks if a string is a supported discovery impact.
 */
export function isSupportedDiscoveryImpact(
  impact: string,
): impact is DiscoveryImpact {
  return CANONICAL_DISCOVERY_IMPACT.includes(impact as DiscoveryImpact);
}

/**
 * Checks if a string is a supported discovery status.
 */
export function isSupportedDiscoveryStatus(
  status: string,
): status is DiscoveryStatus {
  return CANONICAL_DISCOVERY_STATUS.includes(status as DiscoveryStatus);
}

/**
 * Checks if a string is a supported discovery governance.
 */
export function isSupportedDiscoveryGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical connection types.
 */
export function getCanonicalConnectionTypes(): readonly ConnectionType[] {
  return [...CANONICAL_CONNECTION_TYPES];
}

/**
 * Returns the canonical limitation types.
 */
export function getCanonicalLimitationTypes(): readonly LimitationType[] {
  return [...CANONICAL_LIMITATION_TYPES];
}

/**
 * Returns the canonical surprise types.
 */
export function getCanonicalSurpriseTypes(): readonly SurpriseType[] {
  return [...CANONICAL_SURPRISE_TYPES];
}

/**
 * Returns the canonical discovery impacts.
 */
export function getCanonicalDiscoveryImpacts(): readonly DiscoveryImpact[] {
  return [...CANONICAL_DISCOVERY_IMPACT];
}

/**
 * Returns the canonical discovery statuses.
 */
export function getCanonicalDiscoveryStatuses(): readonly DiscoveryStatus[] {
  return [...CANONICAL_DISCOVERY_STATUS];
}
