/**
 * D10-OPT-01 — Knowledge Validation Layer
 *
 * Deterministic validation for knowledge metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 16 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeNode,
  KnowledgeRegistry,
  KnowledgeTrace,
  KnowledgeInput,
  KnowledgeValidationError,
  KnowledgeNodeValidationResult,
  KnowledgeRegistryValidationResult,
  KnowledgeInputValidationResult,
  KnowledgeTraceValidationResult,
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
// Stable Validation Codes (exactly 16, prefix KNOWLEDGE_)
// ---------------------------------------------------------------------------

export const KNOWLEDGE_VALIDATION_CODES = {
  KNOWLEDGE_DUPLICATE_ID: 'KNOWLEDGE_DUPLICATE_ID',
  KNOWLEDGE_DUPLICATE_TITLE: 'KNOWLEDGE_DUPLICATE_TITLE',
  KNOWLEDGE_INVALID_TYPE: 'KNOWLEDGE_INVALID_TYPE',
  KNOWLEDGE_INVALID_CATEGORY: 'KNOWLEDGE_INVALID_CATEGORY',
  KNOWLEDGE_INVALID_DIFFICULTY: 'KNOWLEDGE_INVALID_DIFFICULTY',
  KNOWLEDGE_INVALID_STATUS: 'KNOWLEDGE_INVALID_STATUS',
  KNOWLEDGE_INVALID_GOVERNANCE: 'KNOWLEDGE_INVALID_GOVERNANCE',
  KNOWLEDGE_MISSING_PROVENANCE: 'KNOWLEDGE_MISSING_PROVENANCE',
  KNOWLEDGE_MISSING_PROVIDER: 'KNOWLEDGE_MISSING_PROVIDER',
  KNOWLEDGE_MISSING_RATIONALE: 'KNOWLEDGE_MISSING_RATIONALE',
  KNOWLEDGE_MISSING_TRACE: 'KNOWLEDGE_MISSING_TRACE',
  KNOWLEDGE_MISSING_NODE_ID: 'KNOWLEDGE_MISSING_NODE_ID',
  KNOWLEDGE_MISSING_TITLE: 'KNOWLEDGE_MISSING_TITLE',
  KNOWLEDGE_EMPTY_REGISTRY: 'KNOWLEDGE_EMPTY_REGISTRY',
  KNOWLEDGE_INVALID_TRACE: 'KNOWLEDGE_INVALID_TRACE',
  KNOWLEDGE_REGISTRY_INCONSISTENCY: 'KNOWLEDGE_REGISTRY_INCONSISTENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Node Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeNode(
  node: KnowledgeNode,
): readonly KnowledgeValidationError[] {
  const errors: KnowledgeValidationError[] = [];

  if (!node.nodeId || node.nodeId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_MISSING_NODE_ID,
      message: 'Knowledge node is missing a node ID.',
      field: 'nodeId',
      knowledgeId: node.nodeId,
    });
  }

  if (!node.title || node.title.trim() === '') {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_MISSING_TITLE,
      message: 'Knowledge node is missing a title.',
      field: 'title',
      knowledgeId: node.nodeId,
    });
  }

  if (!CANONICAL_KNOWLEDGE_TYPES.includes(node.knowledgeType)) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_TYPE,
      message: `Knowledge node has unsupported type: "${node.knowledgeType}".`,
      field: 'knowledgeType',
      knowledgeId: node.nodeId,
    });
  }

  if (!CANONICAL_KNOWLEDGE_CATEGORIES.includes(node.category)) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_CATEGORY,
      message: `Knowledge node has unsupported category: "${node.category}".`,
      field: 'category',
      knowledgeId: node.nodeId,
    });
  }

  if (!CANONICAL_KNOWLEDGE_DIFFICULTY.includes(node.difficulty)) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_DIFFICULTY,
      message: `Knowledge node has unsupported difficulty: "${node.difficulty}".`,
      field: 'difficulty',
      knowledgeId: node.nodeId,
    });
  }

  if (!CANONICAL_KNOWLEDGE_STATUS.includes(node.status)) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_STATUS,
      message: `Knowledge node has unsupported status: "${node.status}".`,
      field: 'status',
      knowledgeId: node.nodeId,
    });
  }

  if (!CANONICAL_KNOWLEDGE_GOVERNANCE.includes(node.governance)) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_GOVERNANCE,
      message: `Knowledge node has invalid governance: "${node.governance}".`,
      field: 'governance',
      knowledgeId: node.nodeId,
    });
  }

  if (!node.provenance) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_MISSING_PROVENANCE,
      message: 'Knowledge node is missing provenance.',
      field: 'provenance',
      knowledgeId: node.nodeId,
    });
  } else {
    if (!node.provenance.provider || node.provenance.provider.trim() === '') {
      errors.push({
        code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_MISSING_PROVIDER,
        message: 'Knowledge provenance is missing a provider.',
        field: 'provenance.provider',
        knowledgeId: node.nodeId,
      });
    }

    if (!node.provenance.rationale || node.provenance.rationale.trim() === '') {
      errors.push({
        code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_MISSING_RATIONALE,
        message: 'Knowledge provenance is missing a rationale.',
        field: 'provenance.rationale',
        knowledgeId: node.nodeId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Registry Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeRegistry(
  registry: KnowledgeRegistry,
): KnowledgeRegistryValidationResult {
  const errors: KnowledgeValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.nodes || registry.nodes.length === 0) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  const seenIds = new Set<string>();
  for (const node of registry.nodes) {
    if (seenIds.has(node.nodeId)) {
      errors.push({
        code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_DUPLICATE_ID,
        message: `Duplicate node ID: "${node.nodeId}".`,
        knowledgeId: node.nodeId,
      });
    }
    seenIds.add(node.nodeId);
  }

  const seenTitles = new Set<string>();
  for (const node of registry.nodes) {
    if (seenTitles.has(node.title)) {
      errors.push({
        code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_DUPLICATE_TITLE,
        message: `Duplicate node title: "${node.title}".`,
        field: 'title',
        knowledgeId: node.nodeId,
      });
    }
    seenTitles.add(node.title);
  }

  for (const node of registry.nodes) {
    errors.push(...validateKnowledgeNode(node));
  }

  if (
    registry.metadata.nodeCount !== registry.nodes.length
  ) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_REGISTRY_INCONSISTENCY,
      message: `Registry metadata node count (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
      field: 'metadata.nodeCount',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Input Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeInput(
  input: KnowledgeInput,
): KnowledgeInputValidationResult {
  const errors: KnowledgeValidationError[] = [];

  if (!input.nodes || input.nodes.length === 0) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
  } else {
    for (const node of input.nodes) {
      errors.push(...validateKnowledgeNode(node));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Trace Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeTrace(
  trace: KnowledgeTrace,
): KnowledgeTraceValidationResult {
  const errors: KnowledgeValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_TRACE,
      message: 'Knowledge trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_TRACE,
      message: 'Knowledge trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_TRACE,
      message: 'Knowledge trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: KNOWLEDGE_VALIDATION_CODES.KNOWLEDGE_INVALID_TRACE,
      message: 'Knowledge trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_trace_composition',
  };
}

export const validateKnowledgeArtifact = validateKnowledgeNode;
