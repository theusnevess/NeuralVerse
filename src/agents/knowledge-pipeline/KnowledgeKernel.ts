/**
 * D10-OPT-01 — Knowledge Kernel
 *
 * Deterministic orchestration functions for knowledge metadata.
 * Produces knowledge nodes, traces, and registries.
 *
 * This module never:
 * - Rewrites documentation
 * - Synchronizes external systems
 * - Performs governance decisions
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 * - Uses Math.random
 * - Uses Date.now
 * - Uses async/await
 *
 * Knowledge metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeNode,
  KnowledgeProvenance,
  KnowledgeDecision,
  KnowledgeTrace,
  KnowledgeRegistry,
  KnowledgeRegistryMetadata,
  KnowledgeInput,
  KnowledgeType,
  KnowledgeCategory,
  KnowledgeDifficulty,
  KnowledgeStatus,
  KnowledgeReviewStatus,
  KnowledgeGovernance,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_KNOWLEDGE_TYPES,
  CANONICAL_KNOWLEDGE_CATEGORIES,
  CANONICAL_KNOWLEDGE_DIFFICULTY,
  CANONICAL_KNOWLEDGE_STATUS,
  CANONICAL_KNOWLEDGE_REVIEW_STATUS,
  CANONICAL_KNOWLEDGE_GOVERNANCE,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Knowledge Provenance Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeProvenance(params: {
  readonly source: string;
  readonly provider: string;
  readonly rationale: string;
  readonly governance: KnowledgeGovernance;
}): KnowledgeProvenance {
  return {
    source: params.source,
    provider: params.provider,
    rationale: params.rationale,
    governance: params.governance,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Decision Composition
// ---------------------------------------------------------------------------

function _composeKnowledgeDecision(
  knowledgeId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): KnowledgeDecision {
  return {
    decisionId: `_decision_${knowledgeId}`,
    knowledgeId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Trace Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly KnowledgeDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): KnowledgeTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_knowledge_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Node Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeNode(params: {
  readonly nodeId: string;
  readonly title: string;
  readonly knowledgeType: KnowledgeType;
  readonly category: KnowledgeCategory;
  readonly difficulty: KnowledgeDifficulty;
  readonly status: KnowledgeStatus;
  readonly reviewStatus: KnowledgeReviewStatus;
  readonly governance: KnowledgeGovernance;
  readonly canonicalIdentifier: string;
  readonly tags: readonly string[];
  readonly summary: string;
  readonly provenance: KnowledgeProvenance;
}): KnowledgeNode {
  return {
    nodeId: params.nodeId,
    title: params.title,
    knowledgeType: params.knowledgeType,
    category: params.category,
    difficulty: params.difficulty,
    status: params.status,
    reviewStatus: params.reviewStatus,
    governance: params.governance,
    canonicalIdentifier: params.canonicalIdentifier,
    tags: [...params.tags],
    summary: params.summary,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

function _compareKnowledgeNode(
  a: KnowledgeNode,
  b: KnowledgeNode,
): number {
  if (a.nodeId < b.nodeId) return -1;
  if (a.nodeId > b.nodeId) return 1;

  if (a.knowledgeType < b.knowledgeType) return -1;
  if (a.knowledgeType > b.knowledgeType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Knowledge Registry Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeRegistry(
  nodes: readonly KnowledgeNode[],
): KnowledgeRegistry {
  const sortedNodes = [...nodes].sort(_compareKnowledgeNode);

  const categories = new Set(sortedNodes.map((n) => n.category));
  const types = new Set(sortedNodes.map((n) => n.knowledgeType));

  const metadata: KnowledgeRegistryMetadata = {
    registryId: `_registry_${sortedNodes.length}`,
    nodeCount: sortedNodes.length,
    categoryCount: categories.size,
    typeCount: types.size,
  };

  return {
    registryId: metadata.registryId,
    nodes: sortedNodes,
    artifacts: sortedNodes,
    metadata,
    trace: {
      traceId: `_trace_${sortedNodes.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_knowledge_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_knowledge_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Registry From Input Composition
// ---------------------------------------------------------------------------

export function composeKnowledgeRegistryFromInput(
  input: KnowledgeInput,
): KnowledgeRegistry {
  return composeKnowledgeRegistry(input.nodes ?? []);
}

export const composeKnowledgeArtifact = (node: KnowledgeNode): KnowledgeNode => node;

// ---------------------------------------------------------------------------
// Knowledge Composition (Main Entry Point)
// ---------------------------------------------------------------------------

export function composeKnowledge(
  input: KnowledgeInput,
): KnowledgeRegistry {
  const nodes = input.nodes ?? input.artifacts ?? [];
  const decisions = nodes.map((node) => {
    const errors = _validateKnowledgeForDecision(node);
    return _composeKnowledgeDecision(node.nodeId, errors.length === 0, errors);
  });

  const registry = composeKnowledgeRegistry(nodes);

  return {
    ...registry,
    trace: composeKnowledgeTrace({
      traceId: `_trace_${nodes.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

function _validateKnowledgeForDecision(
  node: KnowledgeNode,
): readonly string[] {
  const errors: string[] = [];

  if (!node.nodeId || node.nodeId.trim() === '') {
    errors.push('KNOWLEDGE_MISSING_NODE_ID');
  }

  if (!node.title || node.title.trim() === '') {
    errors.push('KNOWLEDGE_MISSING_TITLE');
  }

  if (!CANONICAL_KNOWLEDGE_TYPES.includes(node.knowledgeType)) {
    errors.push('KNOWLEDGE_INVALID_TYPE');
  }

  if (!CANONICAL_KNOWLEDGE_CATEGORIES.includes(node.category)) {
    errors.push('KNOWLEDGE_INVALID_CATEGORY');
  }

  if (!CANONICAL_KNOWLEDGE_DIFFICULTY.includes(node.difficulty)) {
    errors.push('KNOWLEDGE_INVALID_DIFFICULTY');
  }

  if (!CANONICAL_KNOWLEDGE_STATUS.includes(node.status)) {
    errors.push('KNOWLEDGE_INVALID_STATUS');
  }

  if (!CANONICAL_KNOWLEDGE_GOVERNANCE.includes(node.governance)) {
    errors.push('KNOWLEDGE_INVALID_GOVERNANCE');
  }

  if (!node.provenance) {
    errors.push('KNOWLEDGE_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

export function isSupportedKnowledgeType(
  value: string,
): value is KnowledgeType {
  return CANONICAL_KNOWLEDGE_TYPES.includes(value as KnowledgeType);
}

export function isSupportedKnowledgeCategory(
  value: string,
): value is KnowledgeCategory {
  return CANONICAL_KNOWLEDGE_CATEGORIES.includes(value as KnowledgeCategory);
}

export function isSupportedKnowledgeDifficulty(
  value: string,
): value is KnowledgeDifficulty {
  return CANONICAL_KNOWLEDGE_DIFFICULTY.includes(value as KnowledgeDifficulty);
}

export function isSupportedKnowledgeReviewStatus(
  value: string,
): value is KnowledgeReviewStatus {
  return CANONICAL_KNOWLEDGE_REVIEW_STATUS.includes(value as KnowledgeReviewStatus);
}

export function isSupportedKnowledgeGovernance(
  value: string,
): value is KnowledgeGovernance {
  return CANONICAL_KNOWLEDGE_GOVERNANCE.includes(value as KnowledgeGovernance);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalKnowledgeTypes(): readonly KnowledgeType[] {
  return CANONICAL_KNOWLEDGE_TYPES;
}

export function getCanonicalKnowledgeCategories(): readonly KnowledgeCategory[] {
  return CANONICAL_KNOWLEDGE_CATEGORIES;
}

export function getCanonicalKnowledgeDifficulty(): readonly KnowledgeDifficulty[] {
  return CANONICAL_KNOWLEDGE_DIFFICULTY;
}

export function getCanonicalKnowledgeStatuses(): readonly KnowledgeStatus[] {
  return CANONICAL_KNOWLEDGE_STATUS;
}

export function getCanonicalKnowledgeGovernance(): readonly KnowledgeGovernance[] {
  return CANONICAL_KNOWLEDGE_GOVERNANCE;
}
