/**
 * NV-2100-D9-OPT-01 — Curiosity Validation Layer
 *
 * Deterministic validation for curiosity metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CuriosityNode,
  CuriosityRegistry,
  CuriosityTrace,
  CuriosityInput,
  CuriosityValidationError,
  CuriosityNodeValidationResult,
  CuriosityRegistryValidationResult,
  CuriosityInputValidationResult,
  CuriosityTraceValidationResult,
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
// Validation Error Codes
// ---------------------------------------------------------------------------

export const CURIOSITY_VALIDATION_CODES = {
  CURIOSITY_DUPLICATE_ID: 'CURIOSITY_DUPLICATE_ID',
  CURIOSITY_DUPLICATE_TITLE: 'CURIOSITY_DUPLICATE_TITLE',
  CURIOSITY_INVALID_TYPE: 'CURIOSITY_INVALID_TYPE',
  CURIOSITY_INVALID_CATEGORY: 'CURIOSITY_INVALID_CATEGORY',
  CURIOSITY_INVALID_TONE: 'CURIOSITY_INVALID_TONE',
  CURIOSITY_INVALID_STATUS: 'CURIOSITY_INVALID_STATUS',
  CURIOSITY_INVALID_GOVERNANCE: 'CURIOSITY_INVALID_GOVERNANCE',
  CURIOSITY_MISSING_PROVENANCE: 'CURIOSITY_MISSING_PROVENANCE',
  CURIOSITY_MISSING_PROVIDER: 'CURIOSITY_MISSING_PROVIDER',
  CURIOSITY_MISSING_RATIONALE: 'CURIOSITY_MISSING_RATIONALE',
  CURIOSITY_MISSING_TRACE: 'CURIOSITY_MISSING_TRACE',
  CURIOSITY_MISSING_CURIOSITY_ID: 'CURIOSITY_MISSING_CURIOSITY_ID',
  CURIOSITY_MISSING_TITLE: 'CURIOSITY_MISSING_TITLE',
  CURIOSITY_EMPTY_REGISTRY: 'CURIOSITY_EMPTY_REGISTRY',
  CURIOSITY_INVALID_TRACE: 'CURIOSITY_INVALID_TRACE',
  CURIOSITY_REGISTRY_INCONSISTENCY: 'CURIOSITY_REGISTRY_INCONSISTENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Node Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curiosity node against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityNode(
  node: CuriosityNode,
): readonly CuriosityValidationError[] {
  const errors: CuriosityValidationError[] = [];

  if (!node.curiosityId || node.curiosityId.trim() === '') {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_CURIOSITY_ID,
      message: 'Curiosity node is missing a curiosity ID.',
      field: 'curiosityId',
      curiosityId: node.curiosityId,
    });
  }

  if (!node.title || node.title.trim() === '') {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_TITLE,
      message: 'Curiosity node is missing a title.',
      field: 'title',
      curiosityId: node.curiosityId,
    });
  }

  if (!CANONICAL_CURIOSITY_TYPES.includes(node.curiosityType)) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TYPE,
      message: `Curiosity node has unsupported type: "${node.curiosityType}".`,
      field: 'curiosityType',
      curiosityId: node.curiosityId,
    });
  }

  if (!CANONICAL_CURIOSITY_CATEGORIES.includes(node.category)) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_CATEGORY,
      message: `Curiosity node has unsupported category: "${node.category}".`,
      field: 'category',
      curiosityId: node.curiosityId,
    });
  }

  if (!CANONICAL_CURIOSITY_TONES.includes(node.tone)) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TONE,
      message: `Curiosity node has unsupported tone: "${node.tone}".`,
      field: 'tone',
      curiosityId: node.curiosityId,
    });
  }

  if (!CANONICAL_CURIOSITY_CANONICAL_STATUS.includes(node.status)) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_STATUS,
      message: `Curiosity node has unsupported status: "${node.status}".`,
      field: 'status',
      curiosityId: node.curiosityId,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(node.governance)) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_GOVERNANCE,
      message: `Curiosity node has invalid governance: "${node.governance}".`,
      field: 'governance',
      curiosityId: node.curiosityId,
    });
  }

  if (!node.provenance) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_PROVENANCE,
      message: 'Curiosity node is missing provenance.',
      field: 'provenance',
      curiosityId: node.curiosityId,
    });
  } else {
    if (!node.provenance.provider || node.provenance.provider.trim() === '') {
      errors.push({
        code: CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_PROVIDER,
        message: 'Curiosity provenance is missing a provider.',
        field: 'provenance.provider',
        curiosityId: node.curiosityId,
      });
    }

    if (!node.provenance.rationale || node.provenance.rationale.trim() === '') {
      errors.push({
        code: CURIOSITY_VALIDATION_CODES.CURIOSITY_MISSING_RATIONALE,
        message: 'Curiosity provenance is missing a rationale.',
        field: 'provenance.rationale',
        curiosityId: node.curiosityId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Curiosity Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityRegistry(
  registry: CuriosityRegistry,
): CuriosityRegistryValidationResult {
  const errors: CuriosityValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.nodes || registry.nodes.length === 0) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate curiosity IDs
  const seenIds = new Set<string>();
  for (const node of registry.nodes) {
    if (seenIds.has(node.curiosityId)) {
      errors.push({
        code: CURIOSITY_VALIDATION_CODES.CURIOSITY_DUPLICATE_ID,
        message: `Duplicate curiosity ID: "${node.curiosityId}".`,
        curiosityId: node.curiosityId,
      });
    }
    seenIds.add(node.curiosityId);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const node of registry.nodes) {
    if (seenTitles.has(node.title)) {
      errors.push({
        code: CURIOSITY_VALIDATION_CODES.CURIOSITY_DUPLICATE_TITLE,
        message: `Duplicate curiosity title: "${node.title}".`,
        field: 'title',
        curiosityId: node.curiosityId,
      });
    }
    seenTitles.add(node.title);
  }

  // Validate each node
  for (const node of registry.nodes) {
    errors.push(...validateCuriosityNode(node));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_registry_composition',
  };
}

export const validateCuriosity = validateCuriosityRegistry;

// ---------------------------------------------------------------------------
// Curiosity Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates curiosity input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityInput(
  input: CuriosityInput,
): CuriosityInputValidationResult {
  const errors: CuriosityValidationError[] = [];

  if (!input.nodes || input.nodes.length === 0) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
  } else {
    for (const node of input.nodes) {
      errors.push(...validateCuriosityNode(node));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityTrace(
  trace: CuriosityTrace,
): CuriosityTraceValidationResult {
  const errors: CuriosityValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TRACE,
      message: 'Curiosity trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TRACE,
      message: 'Curiosity trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TRACE,
      message: 'Curiosity trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: CURIOSITY_VALIDATION_CODES.CURIOSITY_INVALID_TRACE,
      message: 'Curiosity trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_trace_composition',
  };
}
