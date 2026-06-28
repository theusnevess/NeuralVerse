/**
 * NV-1900-D7-OPT-05 — Trade-Off Validation Layer
 *
 * Deterministic validation for trade-off metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  EngineeringTradeOff,
  TradeOffDimension,
  TradeOffRelationship,
  TradeOffRegistry,
  TradeOffTrace,
  TradeOffInput,
  TradeOffValidationError,
  TradeOffRegistryValidationResult,
  TradeOffInputValidationResult,
  TradeOffTraceValidationResult,
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
// Validation Error Codes
// ---------------------------------------------------------------------------

export const TRADE_OFF_VALIDATION_CODES = {
  TRADE_OFF_DUPLICATE_ID: 'TRADE_OFF_DUPLICATE_ID',
  TRADE_OFF_DUPLICATE_TITLE: 'TRADE_OFF_DUPLICATE_TITLE',
  TRADE_OFF_DIMENSION_DUPLICATE_ID: 'TRADE_OFF_DIMENSION_DUPLICATE_ID',
  TRADE_OFF_RELATIONSHIP_DUPLICATE_ID: 'TRADE_OFF_RELATIONSHIP_DUPLICATE_ID',
  TRADE_OFF_INVALID_TYPE: 'TRADE_OFF_INVALID_TYPE',
  TRADE_OFF_INVALID_DIMENSION: 'TRADE_OFF_INVALID_DIMENSION',
  TRADE_OFF_INVALID_SEVERITY: 'TRADE_OFF_INVALID_SEVERITY',
  TRADE_OFF_INVALID_DRIVER: 'TRADE_OFF_INVALID_DRIVER',
  TRADE_OFF_INVALID_STATUS: 'TRADE_OFF_INVALID_STATUS',
  TRADE_OFF_INVALID_GOVERNANCE: 'TRADE_OFF_INVALID_GOVERNANCE',
  TRADE_OFF_INVALID_EFFECT: 'TRADE_OFF_INVALID_EFFECT',
  TRADE_OFF_MISSING_PROVENANCE: 'TRADE_OFF_MISSING_PROVENANCE',
  TRADE_OFF_MISSING_PROVIDER: 'TRADE_OFF_MISSING_PROVIDER',
  TRADE_OFF_MISSING_RATIONALE: 'TRADE_OFF_MISSING_RATIONALE',
  TRADE_OFF_MISSING_APPLICATION_REFERENCE: 'TRADE_OFF_MISSING_APPLICATION_REFERENCE',
  TRADE_OFF_MISSING_KNOWLEDGE_REFERENCE: 'TRADE_OFF_MISSING_KNOWLEDGE_REFERENCE',
  TRADE_OFF_MISSING_ARCHITECTURE_REFERENCE: 'TRADE_OFF_MISSING_ARCHITECTURE_REFERENCE',
  TRADE_OFF_MISSING_CASE_STUDY_REFERENCE: 'TRADE_OFF_MISSING_CASE_STUDY_REFERENCE',
  TRADE_OFF_MISSING_TRADE_OFF_ID: 'TRADE_OFF_MISSING_TRADE_OFF_ID',
  TRADE_OFF_MISSING_TITLE: 'TRADE_OFF_MISSING_TITLE',
  TRADE_OFF_SELF_RELATIONSHIP: 'TRADE_OFF_SELF_RELATIONSHIP',
  TRADE_OFF_EMPTY_REGISTRY: 'TRADE_OFF_EMPTY_REGISTRY',
  TRADE_OFF_INVALID_TRACE: 'TRADE_OFF_INVALID_TRACE',
  TRADE_OFF_REGISTRY_INCONSISTENCY: 'TRADE_OFF_REGISTRY_INCONSISTENCY',
} as const;

const VALID_EFFECTS = ['improved', 'neutral', 'degraded'] as const;

// ---------------------------------------------------------------------------
// Single Trade-Off Validation
// ---------------------------------------------------------------------------

export function validateEngineeringTradeOff(
  tradeOff: EngineeringTradeOff,
): readonly TradeOffValidationError[] {
  const errors: TradeOffValidationError[] = [];

  if (!tradeOff.tradeOffId || tradeOff.tradeOffId.trim() === '') {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_TRADE_OFF_ID,
      message: 'Engineering trade-off is missing a trade-off ID.',
      field: 'tradeOffId',
      tradeOffId: tradeOff.tradeOffId,
    });
  }

  if (!tradeOff.title || tradeOff.title.trim() === '') {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_TITLE,
      message: 'Engineering trade-off is missing a title.',
      field: 'title',
      tradeOffId: tradeOff.tradeOffId,
    });
  }

  if (!CANONICAL_TRADE_OFF_TYPES.includes(tradeOff.tradeOffType)) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_TYPE,
      message: `Engineering trade-off has unsupported type: "${tradeOff.tradeOffType}".`,
      field: 'tradeOffType',
      tradeOffId: tradeOff.tradeOffId,
    });
  }

  if (!CANONICAL_TRADE_OFF_SEVERITY.includes(tradeOff.severity)) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_SEVERITY,
      message: `Engineering trade-off has unsupported severity: "${tradeOff.severity}".`,
      field: 'severity',
      tradeOffId: tradeOff.tradeOffId,
    });
  }

  if (!CANONICAL_DECISION_DRIVERS.includes(tradeOff.decisionDriver)) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_DRIVER,
      message: `Engineering trade-off has unsupported decision driver: "${tradeOff.decisionDriver}".`,
      field: 'decisionDriver',
      tradeOffId: tradeOff.tradeOffId,
    });
  }

  if (!CANONICAL_TRADE_OFF_STATUS.includes(tradeOff.status)) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_STATUS,
      message: `Engineering trade-off has unsupported status: "${tradeOff.status}".`,
      field: 'status',
      tradeOffId: tradeOff.tradeOffId,
    });
  }

  if (!tradeOff.applicationArtifactId || tradeOff.applicationArtifactId.trim() === '') {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_APPLICATION_REFERENCE,
      message: 'Engineering trade-off is missing applicationArtifactId.',
      field: 'applicationArtifactId',
      tradeOffId: tradeOff.tradeOffId,
    });
  }

  if (!tradeOff.knowledgeArtifactId || tradeOff.knowledgeArtifactId.trim() === '') {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_KNOWLEDGE_REFERENCE,
      message: 'Engineering trade-off is missing knowledgeArtifactId.',
      field: 'knowledgeArtifactId',
      tradeOffId: tradeOff.tradeOffId,
    });
  }

  if (!tradeOff.architectureId || tradeOff.architectureId.trim() === '') {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_ARCHITECTURE_REFERENCE,
      message: 'Engineering trade-off is missing architectureId.',
      field: 'architectureId',
      tradeOffId: tradeOff.tradeOffId,
    });
  }

  if (!tradeOff.caseStudyId || tradeOff.caseStudyId.trim() === '') {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_CASE_STUDY_REFERENCE,
      message: 'Engineering trade-off is missing caseStudyId.',
      field: 'caseStudyId',
      tradeOffId: tradeOff.tradeOffId,
    });
  }

  if (!tradeOff.provenance) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_PROVENANCE,
      message: 'Engineering trade-off is missing provenance.',
      field: 'provenance',
      tradeOffId: tradeOff.tradeOffId,
    });
  } else {
    if (!tradeOff.provenance.providedBy || tradeOff.provenance.providedBy.trim() === '') {
      errors.push({
        code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_PROVIDER,
        message: 'Trade-off provenance is missing providedBy.',
        field: 'provenance.providedBy',
        tradeOffId: tradeOff.tradeOffId,
      });
    }

    if (!tradeOff.provenance.rationale || tradeOff.provenance.rationale.trim() === '') {
      errors.push({
        code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_RATIONALE,
        message: 'Trade-off provenance is missing rationale.',
        field: 'provenance.rationale',
        tradeOffId: tradeOff.tradeOffId,
      });
    }

    if (!CANONICAL_APPLICATION_GOVERNANCE.includes(tradeOff.provenance.governanceStatus)) {
      errors.push({
        code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_GOVERNANCE,
        message: `Trade-off provenance has invalid governance status: "${tradeOff.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        tradeOffId: tradeOff.tradeOffId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Trade-Off Dimension Validation
// ---------------------------------------------------------------------------

export function validateTradeOffDimension(
  dimension: TradeOffDimension,
): readonly TradeOffValidationError[] {
  const errors: TradeOffValidationError[] = [];

  if (!dimension.dimensionId || dimension.dimensionId.trim() === '') {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_DIMENSION_DUPLICATE_ID,
      message: 'Trade-off dimension is missing a dimension ID.',
      field: 'dimensionId',
      dimensionId: dimension.dimensionId,
    });
  }

  if (!CANONICAL_ENGINEERING_DIMENSIONS.includes(dimension.dimension)) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_DIMENSION,
      message: `Trade-off dimension has unsupported dimension: "${dimension.dimension}".`,
      field: 'dimension',
      dimensionId: dimension.dimensionId,
    });
  }

  if (!VALID_EFFECTS.includes(dimension.effect)) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_EFFECT,
      message: `Trade-off dimension has unsupported effect: "${dimension.effect}".`,
      field: 'effect',
      dimensionId: dimension.dimensionId,
    });
  }

  if (!dimension.provenance) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_PROVENANCE,
      message: 'Trade-off dimension is missing provenance.',
      field: 'provenance',
      dimensionId: dimension.dimensionId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Trade-Off Relationship Validation
// ---------------------------------------------------------------------------

export function validateTradeOffRelationship(
  relationship: TradeOffRelationship,
  allTradeOffIds: readonly string[],
): readonly TradeOffValidationError[] {
  const errors: TradeOffValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_RELATIONSHIP_DUPLICATE_ID,
      message: 'Trade-off relationship is missing a relationship ID.',
      field: 'relationshipId',
      relationshipId: relationship.relationshipId,
    });
  }

  if (relationship.sourceTradeOffId === relationship.targetTradeOffId) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_SELF_RELATIONSHIP,
      message: `Trade-off relationship references itself: "${relationship.sourceTradeOffId}".`,
      field: 'sourceTradeOffId',
      tradeOffId: relationship.sourceTradeOffId,
    });
  }

  if (relationship.sourceTradeOffId && !allTradeOffIds.includes(relationship.sourceTradeOffId)) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_RELATIONSHIP_DUPLICATE_ID,
      message: `Trade-off relationship references unknown source: "${relationship.sourceTradeOffId}".`,
      field: 'sourceTradeOffId',
      tradeOffId: relationship.sourceTradeOffId,
    });
  }

  if (relationship.targetTradeOffId && !allTradeOffIds.includes(relationship.targetTradeOffId)) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_RELATIONSHIP_DUPLICATE_ID,
      message: `Trade-off relationship references unknown target: "${relationship.targetTradeOffId}".`,
      field: 'targetTradeOffId',
      tradeOffId: relationship.targetTradeOffId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_MISSING_PROVENANCE,
      message: 'Trade-off relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Trade-Off Registry Validation
// ---------------------------------------------------------------------------

export function validateTradeOffRegistry(
  registry: TradeOffRegistry,
): TradeOffRegistryValidationResult {
  const errors: TradeOffValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.tradeOffs || registry.tradeOffs.length === 0) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_EMPTY_REGISTRY,
      message: 'Registry has no trade-offs.',
      field: 'tradeOffs',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Duplicate trade-off IDs
  const seenIds = new Set<string>();
  for (const to of registry.tradeOffs) {
    if (seenIds.has(to.tradeOffId)) {
      errors.push({
        code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_DUPLICATE_ID,
        message: `Duplicate trade-off ID: "${to.tradeOffId}".`,
        tradeOffId: to.tradeOffId,
      });
    }
    seenIds.add(to.tradeOffId);
  }

  // Duplicate trade-off titles
  const seenTitles = new Set<string>();
  for (const to of registry.tradeOffs) {
    if (seenTitles.has(to.title)) {
      errors.push({
        code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_DUPLICATE_TITLE,
        message: `Duplicate trade-off title: "${to.title}".`,
        field: 'title',
        tradeOffId: to.tradeOffId,
      });
    }
    seenTitles.add(to.title);
  }

  // Duplicate dimension IDs
  const seenDimIds = new Set<string>();
  for (const dim of registry.dimensions) {
    if (seenDimIds.has(dim.dimensionId)) {
      errors.push({
        code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_DIMENSION_DUPLICATE_ID,
        message: `Duplicate dimension ID: "${dim.dimensionId}".`,
        dimensionId: dim.dimensionId,
      });
    }
    seenDimIds.add(dim.dimensionId);
  }

  // Duplicate relationship IDs
  const seenRelIds = new Set<string>();
  for (const rel of registry.relationships) {
    if (seenRelIds.has(rel.relationshipId)) {
      errors.push({
        code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_RELATIONSHIP_DUPLICATE_ID,
        message: `Duplicate relationship ID: "${rel.relationshipId}".`,
        relationshipId: rel.relationshipId,
      });
    }
    seenRelIds.add(rel.relationshipId);
  }

  // Validate each trade-off
  for (const to of registry.tradeOffs) {
    errors.push(...validateEngineeringTradeOff(to));
  }

  // Validate each dimension
  for (const dim of registry.dimensions) {
    errors.push(...validateTradeOffDimension(dim));
  }

  // Validate relationships
  const allTradeOffIds = registry.tradeOffs.map((t) => t.tradeOffId);
  for (const rel of registry.relationships) {
    errors.push(...validateTradeOffRelationship(rel, allTradeOffIds));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'trade_off_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Trade-Off Input Validation
// ---------------------------------------------------------------------------

export function validateTradeOffInput(
  input: TradeOffInput,
): TradeOffInputValidationResult {
  const errors: TradeOffValidationError[] = [];

  if (!input.tradeOffs || input.tradeOffs.length === 0) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_EMPTY_REGISTRY,
      message: 'Input has no trade-offs.',
      field: 'tradeOffs',
    });
  } else {
    for (const to of input.tradeOffs) {
      errors.push(...validateEngineeringTradeOff(to));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'trade_off_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Trade-Off Trace Validation
// ---------------------------------------------------------------------------

export function validateTradeOffTrace(
  trace: TradeOffTrace,
): TradeOffTraceValidationResult {
  const errors: TradeOffValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_TRACE,
      message: 'Trade-off trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_TRACE,
      message: 'Trade-off trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_TRACE,
      message: 'Trade-off trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: TRADE_OFF_VALIDATION_CODES.TRADE_OFF_INVALID_TRACE,
      message: 'Trade-off trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'trade_off_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Trade-Offs Validation
// ---------------------------------------------------------------------------

export function validateApplicationArtifactWithTradeOffs(
  registry: TradeOffRegistry,
): readonly TradeOffValidationError[] {
  const errors: TradeOffValidationError[] = [];
  const registryResult = validateTradeOffRegistry(registry);
  errors.push(...registryResult.errors);
  return errors;
}
