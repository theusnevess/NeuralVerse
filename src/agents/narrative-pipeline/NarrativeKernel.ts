/**
 * NV-1700-D6-OPT-01 — Narrative Contract & Registry Kernel
 *
 * Deterministic orchestration functions for narrative metadata.
 * Produces narrative units, traces, and registries.
 *
 * This module never:
 * - Generates lesson prose
 * - Rewrites knowledge
 * - Mutates curriculum
 * - Infers dependencies
 * - Makes unsupported historical claims
 * - Calls LLMs
 * - Calls external APIs
 * - Performs runtime personalization
 * - Infers learner mastery
 * - Executes laboratories
 *
 * Narrative metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  NarrativeProvenance,
  NarrativeUnit,
  NarrativeDecision,
  NarrativeTrace,
  NarrativeRegistry,
  NarrativeRegistryMetadata,
  NarrativeInput,
  NarrativeUnitType,
  NarrativeMode,
  NarrativeDomain,
  NarrativeStatus,
  NarrativeGovernanceStatus,
  NarrativeArtifact,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_NARRATIVE_UNIT_TYPES,
  CANONICAL_NARRATIVE_MODES,
  CANONICAL_NARRATIVE_DOMAINS,
  CANONICAL_NARRATIVE_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

// ---------------------------------------------------------------------------
// Narrative Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes narrative provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeNarrativeProvenance(params: {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): NarrativeProvenance {
  return {
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Narrative Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative decision from validation results.
 * Pure function. No side effects.
 */
function _composeNarrativeDecision(
  narrativeId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): NarrativeDecision {
  return {
    decisionId: `_decision_${narrativeId}`,
    narrativeId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Narrative Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeNarrativeTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly NarrativeDecision[];
  readonly registryVersion: string;
  readonly pipelineVersion: string;
}): NarrativeTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    pipelineVersion: params.pipelineVersion,
    compositionMetadata: {},
    deterministicMetadata: {},
    deterministic: true,
    generatedFrom: 'deterministic_narrative_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Narrative Unit Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative unit from provided parameters.
 * Pure function. No side effects.
 */
export function composeNarrativeUnit(params: {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
}): NarrativeUnit {
  return {
    narrativeId: params.narrativeId,
    title: params.title,
    unitType: params.unitType,
    narrativeMode: params.narrativeMode,
    domain: params.domain,
    status: params.status,
    canonicalKnowledgeId: params.canonicalKnowledgeId,
    curriculumNodeId: params.curriculumNodeId,
    lessonId: params.lessonId,
    laboratoryId: params.laboratoryId,
    sequenceOrder: params.sequenceOrder,
    summary: params.summary,
    tags: [...params.tags],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Narrative Artifact Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative artifact from provided parameters.
 * Pure function. No side effects.
 */
export function composeNarrativeArtifact(params: {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
}): NarrativeArtifact {
  return {
    narrativeId: params.narrativeId,
    title: params.title,
    unitType: params.unitType,
    narrativeMode: params.narrativeMode,
    domain: params.domain,
    status: params.status,
    canonicalKnowledgeId: params.canonicalKnowledgeId,
    curriculumNodeId: params.curriculumNodeId,
    lessonId: params.lessonId,
    laboratoryId: params.laboratoryId,
    sequenceOrder: params.sequenceOrder,
    summary: params.summary,
    tags: [...params.tags],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for narrative units.
 * Sorts by narrativeId, then unitType, then sequenceOrder, then title.
 * Pure function. No side effects.
 */
function _compareNarrativeUnit(
  a: NarrativeUnit,
  b: NarrativeUnit,
): number {
  if (a.narrativeId < b.narrativeId) return -1;
  if (a.narrativeId > b.narrativeId) return 1;

  if (a.unitType < b.unitType) return -1;
  if (a.unitType > b.unitType) return 1;

  if (a.sequenceOrder < b.sequenceOrder) return -1;
  if (a.sequenceOrder > b.sequenceOrder) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Narrative Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative registry from units.
 * Pure function. No side effects.
 * Deterministic ordering: narrativeId → unitType → sequenceOrder → title.
 */
export function composeNarrativeRegistry(
  narratives: readonly NarrativeUnit[],
): NarrativeRegistry {
  const sortedNarratives = [...narratives].sort(_compareNarrativeUnit);

  const domains = new Set(sortedNarratives.map((n) => n.domain));
  const types = new Set(sortedNarratives.map((n) => n.unitType));
  const modes = new Set(sortedNarratives.map((n) => n.narrativeMode));

  const metadata: NarrativeRegistryMetadata = {
    registryId: `_registry_${sortedNarratives.length}`,
    narrativeCount: sortedNarratives.length,
    domainCount: domains.size,
    typeCount: types.size,
    modeCount: modes.size,
  };

  return {
    registryId: metadata.registryId,
    narratives: sortedNarratives,
    metadata,
    trace: {
      traceId: `_trace_${sortedNarratives.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      compositionMetadata: {},
      deterministicMetadata: {},
      deterministic: true,
      generatedFrom: 'deterministic_narrative_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_narrative_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Narrative Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative registry from an input.
 * Pure function. No side effects.
 */
export function composeNarrativeRegistryFromInput(
  input: NarrativeInput,
): NarrativeRegistry {
  return composeNarrativeRegistry(input.narratives);
}

// ---------------------------------------------------------------------------
// Narrative Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete narrative registry from an input.
 * Pure function. No side effects.
 */
export function composeNarrative(
  input: NarrativeInput,
): NarrativeRegistry {
  const decisions = input.narratives.map((narrative) => {
    const errors = _validateNarrativeForDecision(narrative);
    return _composeNarrativeDecision(narrative.narrativeId, errors.length === 0, errors);
  });

  const registry = composeNarrativeRegistry(input.narratives);

  return {
    ...registry,
    trace: composeNarrativeTrace({
      traceId: `_trace_${input.narratives.length}`,
      decisions,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
    }),
  };
}

/**
 * Validates a narrative unit for decision composition.
 * Pure function. No side effects.
 */
function _validateNarrativeForDecision(
  narrative: NarrativeUnit,
): readonly string[] {
  const errors: string[] = [];

  if (!narrative.narrativeId || narrative.narrativeId.trim() === '') {
    errors.push('NARRATIVE_MISSING_NARRATIVE_ID');
  }

  if (!narrative.title || narrative.title.trim() === '') {
    errors.push('NARRATIVE_MISSING_TITLE');
  }

  if (!CANONICAL_NARRATIVE_UNIT_TYPES.includes(narrative.unitType)) {
    errors.push('NARRATIVE_INVALID_UNIT_TYPE');
  }

  if (!CANONICAL_NARRATIVE_MODES.includes(narrative.narrativeMode)) {
    errors.push('NARRATIVE_INVALID_MODE');
  }

  if (!CANONICAL_NARRATIVE_DOMAINS.includes(narrative.domain)) {
    errors.push('NARRATIVE_INVALID_DOMAIN');
  }

  if (!CANONICAL_NARRATIVE_STATUS.includes(narrative.status)) {
    errors.push('NARRATIVE_INVALID_STATUS');
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(narrative.provenance.governanceStatus)) {
    errors.push('NARRATIVE_INVALID_GOVERNANCE_STATUS');
  }

  if (!narrative.provenance) {
    errors.push('NARRATIVE_MISSING_PROVENANCE');
  }

  if (!narrative.canonicalKnowledgeId || narrative.canonicalKnowledgeId.trim() === '') {
    errors.push('NARRATIVE_MISSING_CANONICAL_REFERENCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported narrative unit type.
 */
export function isSupportedNarrativeUnitType(
  unitType: string,
): unitType is NarrativeUnitType {
  return CANONICAL_NARRATIVE_UNIT_TYPES.includes(unitType as NarrativeUnitType);
}

/**
 * Checks if a string is a supported narrative mode.
 */
export function isSupportedNarrativeMode(
  mode: string,
): mode is NarrativeMode {
  return CANONICAL_NARRATIVE_MODES.includes(mode as NarrativeMode);
}

/**
 * Checks if a string is a supported narrative domain.
 */
export function isSupportedNarrativeDomain(
  domain: string,
): domain is NarrativeDomain {
  return CANONICAL_NARRATIVE_DOMAINS.includes(domain as NarrativeDomain);
}

/**
 * Checks if a string is a supported narrative status.
 */
export function isSupportedNarrativeStatus(
  status: string,
): status is NarrativeStatus {
  return CANONICAL_NARRATIVE_STATUS.includes(status as NarrativeStatus);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedNarrativeGovernanceStatus(
  governanceStatus: string,
): governanceStatus is NarrativeGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(
    governanceStatus as NarrativeGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical narrative unit types.
 */
export function getCanonicalNarrativeUnitTypes(): readonly NarrativeUnitType[] {
  return CANONICAL_NARRATIVE_UNIT_TYPES;
}

/**
 * Returns the canonical narrative modes.
 */
export function getCanonicalNarrativeModes(): readonly NarrativeMode[] {
  return CANONICAL_NARRATIVE_MODES;
}

/**
 * Returns the canonical narrative domains.
 */
export function getCanonicalNarrativeDomains(): readonly NarrativeDomain[] {
  return CANONICAL_NARRATIVE_DOMAINS;
}

/**
 * Returns the canonical narrative statuses.
 */
export function getCanonicalNarrativeStatuses(): readonly NarrativeStatus[] {
  return CANONICAL_NARRATIVE_STATUS;
}

/**
 * Returns the canonical governance statuses.
 */
export function getCanonicalNarrativeGovernanceStatuses(): readonly NarrativeGovernanceStatus[] {
  return CANONICAL_GOVERNANCE_STATUSES;
}
