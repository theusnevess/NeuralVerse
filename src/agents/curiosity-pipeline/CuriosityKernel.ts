/**
 * NV-2100-D9-OPT-01 — Curiosity Registry & Canonical Artifact Kernel
 *
 * Deterministic orchestration functions for curiosity metadata.
 * Produces curiosity nodes, traces, and registries.
 *
 * This module never:
 * - Generates curiosity content
 * - Recommends curiosity artifacts
 * - Retrieves curiosity data
 * - Ranks curiosity nodes
 * - Searches for curiosity
 * - Discovers new curiosity
 * - Infers curiosity relationships
 * - Calls LLMs
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Curiosity metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CuriosityNode,
  CuriosityProvenance,
  CuriosityDecision,
  CuriosityTrace,
  CuriosityRegistry,
  CuriosityRegistryMetadata,
  CuriosityInput,
  CuriosityType,
  CuriosityCategory,
  CuriosityTone,
  CuriosityStatus,
  CuriosityGovernance,
  CuriosityReviewStatus,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_CURIOSITY_TYPES,
  CANONICAL_CURIOSITY_CATEGORIES,
  CANONICAL_CURIOSITY_TONES,
  CANONICAL_CURIOSITY_CANONICAL_STATUS,
  CANONICAL_CURIOSITY_REVIEW_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Curiosity Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes curiosity provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: CuriosityReviewStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): CuriosityProvenance {
  return {
    provider: params.provider,
    source: params.source,
    reviewStatus: params.reviewStatus,
    reviewDate: params.reviewDate,
    version: params.version,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity decision from validation results.
 * Pure function. No side effects.
 */
function _composeCuriosityDecision(
  curiosityId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): CuriosityDecision {
  return {
    decisionId: `_decision_${curiosityId}`,
    curiosityId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity trace from metadata.
 * Pure function. No side effects.
 */
export function composeCuriosityTrace(params: {
  readonly traceId: string;
}): CuriosityTrace {
  return {
    traceId: params.traceId,
    generatedFrom: 'deterministic_curiosity_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Node Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity node from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityNode(params: {
  readonly curiosityId: string;
  readonly title: string;
  readonly curiosityType: CuriosityType;
  readonly category: CuriosityCategory;
  readonly tone: CuriosityTone;
  readonly status: CuriosityStatus;
  readonly governance: CuriosityGovernance;
  readonly tags: readonly string[];
  readonly summary: string;
  readonly provenance: CuriosityProvenance;
}): CuriosityNode {
  return {
    curiosityId: params.curiosityId,
    title: params.title,
    curiosityType: params.curiosityType,
    category: params.category,
    tone: params.tone,
    status: params.status,
    governance: params.governance,
    tags: [...params.tags],
    summary: params.summary,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for curiosity nodes.
 * Sorts by curiosityId, then curiosityType, then title.
 * Pure function. No side effects.
 */
function _compareCuriosityNode(
  a: CuriosityNode,
  b: CuriosityNode,
): number {
  if (a.curiosityId < b.curiosityId) return -1;
  if (a.curiosityId > b.curiosityId) return 1;

  if (a.curiosityType < b.curiosityType) return -1;
  if (a.curiosityType > b.curiosityType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Curiosity Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity registry from nodes.
 * Pure function. No side effects.
 * Deterministic ordering: curiosityId → curiosityType → title.
 */
export function composeCuriosityRegistry(
  nodes: readonly CuriosityNode[],
): CuriosityRegistry {
  const sortedNodes = [...nodes].sort(_compareCuriosityNode);

  const metadata: CuriosityRegistryMetadata = {
    registryId: `_registry_${sortedNodes.length}`,
    version: '1.0.0',
    nodeCount: sortedNodes.length,
    generatedFrom: 'deterministic_curiosity_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };

  return {
    registryId: metadata.registryId,
    nodes: sortedNodes,
    metadata,
    trace: {
      traceId: `_trace_${sortedNodes.length}`,
      generatedFrom: 'deterministic_curiosity_kernel',
      deterministic: true,
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_curiosity_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a curiosity registry from an input.
 * Pure function. No side effects.
 */
export function composeCuriosityRegistryFromInput(
  input: CuriosityInput,
): CuriosityRegistry {
  return composeCuriosityRegistry(input.nodes);
}

// ---------------------------------------------------------------------------
// Curiosity Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete curiosity registry from an input.
 * Pure function. No side effects.
 */
export function composeCuriosity(
  input: CuriosityInput,
): CuriosityRegistry {
  const decisions = input.nodes.map((node) => {
    const errors = _validateCuriosityForDecision(node);
    return _composeCuriosityDecision(node.curiosityId, errors.length === 0, errors);
  });

  const registry = composeCuriosityRegistry(input.nodes);

  return {
    ...registry,
    trace: composeCuriosityTrace({
      traceId: `_trace_${input.nodes.length}`,
    }),
  };
}

/**
 * Validates a curiosity node for decision composition.
 * Pure function. No side effects.
 */
function _validateCuriosityForDecision(
  node: CuriosityNode,
): readonly string[] {
  const errors: string[] = [];

  if (!node.curiosityId || node.curiosityId.trim() === '') {
    errors.push('CURIOSITY_MISSING_CURIOSITY_ID');
  }

  if (!node.title || node.title.trim() === '') {
    errors.push('CURIOSITY_MISSING_TITLE');
  }

  if (!CANONICAL_CURIOSITY_TYPES.includes(node.curiosityType)) {
    errors.push('CURIOSITY_INVALID_TYPE');
  }

  if (!CANONICAL_CURIOSITY_CATEGORIES.includes(node.category)) {
    errors.push('CURIOSITY_INVALID_CATEGORY');
  }

  if (!CANONICAL_CURIOSITY_TONES.includes(node.tone)) {
    errors.push('CURIOSITY_INVALID_TONE');
  }

  if (!CANONICAL_CURIOSITY_CANONICAL_STATUS.includes(node.status)) {
    errors.push('CURIOSITY_INVALID_STATUS');
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(node.governance)) {
    errors.push('CURIOSITY_INVALID_GOVERNANCE');
  }

  if (!node.provenance) {
    errors.push('CURIOSITY_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported curiosity type.
 */
export function isSupportedCuriosityType(
  curiosityType: string,
): curiosityType is CuriosityType {
  return CANONICAL_CURIOSITY_TYPES.includes(curiosityType as CuriosityType);
}

/**
 * Checks if a string is a supported curiosity category.
 */
export function isSupportedCuriosityCategory(
  category: string,
): category is CuriosityCategory {
  return CANONICAL_CURIOSITY_CATEGORIES.includes(category as CuriosityCategory);
}

/**
 * Checks if a string is a supported curiosity tone.
 */
export function isSupportedCuriosityTone(
  tone: string,
): tone is CuriosityTone {
  return CANONICAL_CURIOSITY_TONES.includes(tone as CuriosityTone);
}

/**
 * Checks if a string is a supported curiosity review status.
 */
export function isSupportedCuriosityReviewStatus(
  reviewStatus: string,
): reviewStatus is CuriosityReviewStatus {
  return CANONICAL_CURIOSITY_REVIEW_STATUS.includes(reviewStatus as CuriosityReviewStatus);
}

/**
 * Checks if a string is a supported curiosity governance.
 */
export function isSupportedCuriosityGovernance(
  governance: string,
): governance is CuriosityGovernance {
  return CANONICAL_CURIOSITY_GOVERNANCE.includes(governance as CuriosityGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical curiosity types.
 */
export function getCanonicalCuriosityTypes(): readonly CuriosityType[] {
  return [...CANONICAL_CURIOSITY_TYPES];
}

/**
 * Returns the canonical curiosity categories.
 */
export function getCanonicalCuriosityCategories(): readonly CuriosityCategory[] {
  return [...CANONICAL_CURIOSITY_CATEGORIES];
}

/**
 * Returns the canonical curiosity tones.
 */
export function getCanonicalCuriosityTones(): readonly CuriosityTone[] {
  return [...CANONICAL_CURIOSITY_TONES];
}

/**
 * Returns the canonical curiosity statuses.
 */
export function getCanonicalCuriosityStatuses(): readonly CuriosityStatus[] {
  return [...CANONICAL_CURIOSITY_CANONICAL_STATUS];
}

/**
 * Returns the canonical curiosity governance values.
 */
export function getCanonicalCuriosityGovernance(): readonly CuriosityGovernance[] {
  return [...CANONICAL_CURIOSITY_GOVERNANCE];
}
