/**
 * NV-1900-D7-OPT-05 — Engineering Trade-Off Analysis Kernel
 *
 * Deterministic orchestration functions for trade-off metadata.
 * Produces trade-offs, dimensions, relationships, traces, and registries.
 *
 * This module never:
 * - Recommends solutions
 * - Optimizes architectures
 * - Computes scores
 * - Ranks alternatives
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Trade-off metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  EngineeringTradeOff,
  TradeOffProvenance,
  TradeOffDimension,
  TradeOffRelationship,
  TradeOffDecision,
  TradeOffTrace,
  TradeOffRegistry,
  TradeOffRegistryMetadata,
  TradeOffInput,
  TradeOffType,
  EngineeringDimension,
  TradeOffSeverity,
  DecisionDriver,
  TradeOffStatus,
  ApplicationGovernanceStatus,
  ApplicationNode,
  ApplicationArtifactWithTradeOffs,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_TRADE_OFF_TYPES,
  CANONICAL_ENGINEERING_DIMENSIONS,
  CANONICAL_TRADE_OFF_SEVERITY,
  CANONICAL_DECISION_DRIVERS,
  CANONICAL_TRADE_OFF_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Trade-Off Provenance Composition
// ---------------------------------------------------------------------------

export function composeTradeOffProvenance(params: {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}): TradeOffProvenance {
  return {
    providedBy: params.providedBy,
    rationale: params.rationale,
    reviewedBy: params.reviewedBy,
    reviewDate: params.reviewDate,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Engineering Trade-Off Composition
// ---------------------------------------------------------------------------

export function composeEngineeringTradeOff(params: {
  readonly tradeOffId: string;
  readonly title: string;
  readonly description: string;
  readonly tradeOffType: TradeOffType;
  readonly severity: TradeOffSeverity;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly architectureId: string;
  readonly caseStudyId: string;
  readonly decisionDriver: DecisionDriver;
  readonly status: TradeOffStatus;
  readonly provenance: TradeOffProvenance;
}): EngineeringTradeOff {
  return {
    tradeOffId: params.tradeOffId,
    title: params.title,
    description: params.description,
    tradeOffType: params.tradeOffType,
    severity: params.severity,
    applicationArtifactId: params.applicationArtifactId,
    knowledgeArtifactId: params.knowledgeArtifactId,
    architectureId: params.architectureId,
    caseStudyId: params.caseStudyId,
    decisionDriver: params.decisionDriver,
    status: params.status,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Trade-Off Dimension Composition
// ---------------------------------------------------------------------------

export function composeTradeOffDimension(params: {
  readonly dimensionId: string;
  readonly tradeOffId: string;
  readonly dimension: EngineeringDimension;
  readonly effect: 'improved' | 'neutral' | 'degraded';
  readonly description: string;
  readonly provenance: TradeOffProvenance;
}): TradeOffDimension {
  return {
    dimensionId: params.dimensionId,
    tradeOffId: params.tradeOffId,
    dimension: params.dimension,
    effect: params.effect,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Trade-Off Relationship Composition
// ---------------------------------------------------------------------------

export function composeTradeOffRelationship(params: {
  readonly relationshipId: string;
  readonly sourceTradeOffId: string;
  readonly targetTradeOffId: string;
  readonly relationshipType: string;
  readonly provenance: TradeOffProvenance;
}): TradeOffRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceTradeOffId: params.sourceTradeOffId,
    targetTradeOffId: params.targetTradeOffId,
    relationshipType: params.relationshipType,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Trade-Off Decision Composition
// ---------------------------------------------------------------------------

function _composeTradeOffDecision(
  tradeOffId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): TradeOffDecision {
  return {
    decisionId: `_decision_${tradeOffId}`,
    tradeOffId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Trade-Off Trace Composition
// ---------------------------------------------------------------------------

export function composeTradeOffTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly TradeOffDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): TradeOffTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_trade_off_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

function _compareTradeOff(
  a: EngineeringTradeOff,
  b: EngineeringTradeOff,
): number {
  if (a.tradeOffId < b.tradeOffId) return -1;
  if (a.tradeOffId > b.tradeOffId) return 1;
  if (a.tradeOffType < b.tradeOffType) return -1;
  if (a.tradeOffType > b.tradeOffType) return 1;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

function _compareDimension(
  a: TradeOffDimension,
  b: TradeOffDimension,
): number {
  if (a.tradeOffId < b.tradeOffId) return -1;
  if (a.tradeOffId > b.tradeOffId) return 1;
  if (a.dimension < b.dimension) return -1;
  if (a.dimension > b.dimension) return 1;
  if (a.dimensionId < b.dimensionId) return -1;
  if (a.dimensionId > b.dimensionId) return 1;
  return 0;
}

function _compareRelationship(
  a: TradeOffRelationship,
  b: TradeOffRelationship,
): number {
  if (a.sourceTradeOffId < b.sourceTradeOffId) return -1;
  if (a.sourceTradeOffId > b.sourceTradeOffId) return 1;
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Trade-Off Registry Composition
// ---------------------------------------------------------------------------

export function composeTradeOffRegistry(
  tradeOffs: readonly EngineeringTradeOff[],
  dimensions: readonly TradeOffDimension[],
  relationships: readonly TradeOffRelationship[],
): TradeOffRegistry {
  const sortedTradeOffs = [...tradeOffs].sort(_compareTradeOff);
  const sortedDimensions = [...dimensions].sort(_compareDimension);
  const sortedRelationships = [...relationships].sort(_compareRelationship);

  const types = new Set(sortedTradeOffs.map((t) => t.tradeOffType));

  const metadata: TradeOffRegistryMetadata = {
    registryId: `_registry_${sortedTradeOffs.length}_${sortedDimensions.length}_${sortedRelationships.length}`,
    tradeOffCount: sortedTradeOffs.length,
    dimensionCount: sortedDimensions.length,
    relationshipCount: sortedRelationships.length,
    typeCount: types.size,
  };

  return {
    registryId: metadata.registryId,
    tradeOffs: sortedTradeOffs,
    dimensions: sortedDimensions,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedTradeOffs.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_trade_off_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_trade_off_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Trade-Off Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeTradeOffRegistryFromInput(
  input: TradeOffInput,
): TradeOffRegistry {
  return composeTradeOffRegistry(
    input.tradeOffs,
    input.dimensions,
    input.relationships,
  );
}

// ---------------------------------------------------------------------------
// Trade-Off Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeEngineeringTradeOffs(
  input: TradeOffInput,
): TradeOffRegistry {
  const decisions = input.tradeOffs.map((tradeOff) => {
    const errors = _validateTradeOffForDecision(tradeOff);
    return _composeTradeOffDecision(tradeOff.tradeOffId, errors.length === 0, errors);
  });

  const registry = composeTradeOffRegistry(
    input.tradeOffs,
    input.dimensions,
    input.relationships,
  );

  return {
    ...registry,
    trace: composeTradeOffTrace({
      traceId: `_trace_${input.tradeOffs.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Trade-Offs Composition
// ---------------------------------------------------------------------------

export function composeApplicationArtifactWithTradeOffs(params: {
  readonly applicationNode: ApplicationNode;
  readonly tradeOffRegistry: TradeOffRegistry;
}): ApplicationArtifactWithTradeOffs {
  return {
    applicationNode: { ...params.applicationNode },
    tradeOffRegistry: { ...params.tradeOffRegistry },
    deterministic: true,
    generatedFrom: 'deterministic_trade_off_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Trade-Off Decision Validation
// ---------------------------------------------------------------------------

function _validateTradeOffForDecision(
  tradeOff: EngineeringTradeOff,
): readonly string[] {
  const errors: string[] = [];

  if (!tradeOff.tradeOffId || tradeOff.tradeOffId.trim() === '') {
    errors.push('TRADE_OFF_MISSING_TRADE_OFF_ID');
  }

  if (!tradeOff.title || tradeOff.title.trim() === '') {
    errors.push('TRADE_OFF_MISSING_TITLE');
  }

  if (!CANONICAL_TRADE_OFF_TYPES.includes(tradeOff.tradeOffType)) {
    errors.push('TRADE_OFF_INVALID_TYPE');
  }

  if (!CANONICAL_TRADE_OFF_SEVERITY.includes(tradeOff.severity)) {
    errors.push('TRADE_OFF_INVALID_SEVERITY');
  }

  if (!CANONICAL_DECISION_DRIVERS.includes(tradeOff.decisionDriver)) {
    errors.push('TRADE_OFF_INVALID_DRIVER');
  }

  if (!CANONICAL_TRADE_OFF_STATUS.includes(tradeOff.status)) {
    errors.push('TRADE_OFF_INVALID_STATUS');
  }

  if (!tradeOff.provenance) {
    errors.push('TRADE_OFF_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedTradeOffType(
  tradeOffType: string,
): tradeOffType is TradeOffType {
  return CANONICAL_TRADE_OFF_TYPES.includes(tradeOffType as TradeOffType);
}

export function isSupportedEngineeringDimension(
  dimension: string,
): dimension is EngineeringDimension {
  return CANONICAL_ENGINEERING_DIMENSIONS.includes(dimension as EngineeringDimension);
}

export function isSupportedTradeOffSeverity(
  severity: string,
): severity is TradeOffSeverity {
  return CANONICAL_TRADE_OFF_SEVERITY.includes(severity as TradeOffSeverity);
}

export function isSupportedDecisionDriver(
  driver: string,
): driver is DecisionDriver {
  return CANONICAL_DECISION_DRIVERS.includes(driver as DecisionDriver);
}

export function isSupportedTradeOffStatus(
  status: string,
): status is TradeOffStatus {
  return CANONICAL_TRADE_OFF_STATUS.includes(status as TradeOffStatus);
}

export function isSupportedTradeOffGovernance(
  governanceStatus: string,
): governanceStatus is ApplicationGovernanceStatus {
  return CANONICAL_APPLICATION_GOVERNANCE.includes(
    governanceStatus as ApplicationGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalTradeOffTypes(): readonly TradeOffType[] {
  return CANONICAL_TRADE_OFF_TYPES;
}

export function getCanonicalEngineeringDimensions(): readonly EngineeringDimension[] {
  return CANONICAL_ENGINEERING_DIMENSIONS;
}

export function getCanonicalTradeOffSeverities(): readonly TradeOffSeverity[] {
  return CANONICAL_TRADE_OFF_SEVERITY;
}

export function getCanonicalDecisionDrivers(): readonly DecisionDriver[] {
  return CANONICAL_DECISION_DRIVERS;
}

export function getCanonicalTradeOffStatuses(): readonly TradeOffStatus[] {
  return CANONICAL_TRADE_OFF_STATUS;
}
