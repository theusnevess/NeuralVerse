/**
 * NV-1900-D7-OPT-01 — Application Validation Layer
 *
 * Deterministic validation for application metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ApplicationNode,
  ApplicationRegistry,
  ApplicationTrace,
  ApplicationInput,
  ApplicationValidationError,
  ApplicationNodeValidationResult,
  ApplicationRegistryValidationResult,
  ApplicationInputValidationResult,
  ApplicationTraceValidationResult,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_APPLICATION_ARTIFACT_TYPES,
  CANONICAL_APPLICATION_DOMAINS,
  CANONICAL_APPLICATION_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const APPLICATION_VALIDATION_CODES = {
  APPLICATION_DUPLICATE_ID: 'APPLICATION_DUPLICATE_ID',
  APPLICATION_DUPLICATE_TITLE: 'APPLICATION_DUPLICATE_TITLE',
  APPLICATION_INVALID_ARTIFACT_TYPE: 'APPLICATION_INVALID_ARTIFACT_TYPE',
  APPLICATION_INVALID_DOMAIN: 'APPLICATION_INVALID_DOMAIN',
  APPLICATION_INVALID_STATUS: 'APPLICATION_INVALID_STATUS',
  APPLICATION_INVALID_GOVERNANCE: 'APPLICATION_INVALID_GOVERNANCE',
  APPLICATION_MISSING_PROVENANCE: 'APPLICATION_MISSING_PROVENANCE',
  APPLICATION_MISSING_RATIONALE: 'APPLICATION_MISSING_RATIONALE',
  APPLICATION_MISSING_PROVIDER: 'APPLICATION_MISSING_PROVIDER',
  APPLICATION_MISSING_TRACE: 'APPLICATION_MISSING_TRACE',
  APPLICATION_MISSING_APPLICATION_ID: 'APPLICATION_MISSING_APPLICATION_ID',
  APPLICATION_MISSING_TITLE: 'APPLICATION_MISSING_TITLE',
  APPLICATION_EMPTY_REGISTRY: 'APPLICATION_EMPTY_REGISTRY',
  APPLICATION_INVALID_TRACE: 'APPLICATION_INVALID_TRACE',
  APPLICATION_REGISTRY_INCONSISTENCY: 'APPLICATION_REGISTRY_INCONSISTENCY',
} as const;

// ---------------------------------------------------------------------------
// Single Node Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single application node against canonical invariants.
 * Pure function. No side effects.
 */
export function validateApplicationNode(
  node: ApplicationNode,
): readonly ApplicationValidationError[] {
  const errors: ApplicationValidationError[] = [];

  if (!node.applicationId || node.applicationId.trim() === '') {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_APPLICATION_ID,
      message: 'Application node is missing an application ID.',
      field: 'applicationId',
      applicationId: node.applicationId,
    });
  }

  if (!node.title || node.title.trim() === '') {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_TITLE,
      message: 'Application node is missing a title.',
      field: 'title',
      applicationId: node.applicationId,
    });
  }

  if (!CANONICAL_APPLICATION_ARTIFACT_TYPES.includes(node.artifactType)) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_ARTIFACT_TYPE,
      message: `Application node has unsupported artifact type: "${node.artifactType}".`,
      field: 'artifactType',
      applicationId: node.applicationId,
    });
  }

  if (!CANONICAL_APPLICATION_DOMAINS.includes(node.domain)) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_DOMAIN,
      message: `Application node has unsupported domain: "${node.domain}".`,
      field: 'domain',
      applicationId: node.applicationId,
    });
  }

  if (!CANONICAL_APPLICATION_STATUS.includes(node.status)) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_STATUS,
      message: `Application node has unsupported status: "${node.status}".`,
      field: 'status',
      applicationId: node.applicationId,
    });
  }

  if (!node.provenance) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROVENANCE,
      message: 'Application node is missing provenance.',
      field: 'provenance',
      applicationId: node.applicationId,
    });
  } else {
    if (!node.provenance.providedBy || node.provenance.providedBy.trim() === '') {
      errors.push({
        code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_PROVIDER,
        message: 'Application provenance is missing providedBy.',
        field: 'provenance.providedBy',
        applicationId: node.applicationId,
      });
    }

    if (!node.provenance.rationale || node.provenance.rationale.trim() === '') {
      errors.push({
        code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_RATIONALE,
        message: 'Application provenance is missing rationale.',
        field: 'provenance.rationale',
        applicationId: node.applicationId,
      });
    }

    if (!CANONICAL_APPLICATION_GOVERNANCE.includes(node.provenance.governanceStatus)) {
      errors.push({
        code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_GOVERNANCE,
        message: `Application provenance has invalid governance status: "${node.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        applicationId: node.applicationId,
      });
    }
  }

  if (!node.trace) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_MISSING_TRACE,
      message: 'Application node is missing trace.',
      field: 'trace',
      applicationId: node.applicationId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Application Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates an application registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateApplicationRegistry(
  registry: ApplicationRegistry,
): ApplicationRegistryValidationResult {
  const errors: ApplicationValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.nodes || registry.nodes.length === 0) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate application IDs
  const seenIds = new Set<string>();
  for (const node of registry.nodes) {
    if (seenIds.has(node.applicationId)) {
      errors.push({
        code: APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_ID,
        message: `Duplicate application ID: "${node.applicationId}".`,
        applicationId: node.applicationId,
      });
    }
    seenIds.add(node.applicationId);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const node of registry.nodes) {
    if (seenTitles.has(node.title)) {
      errors.push({
        code: APPLICATION_VALIDATION_CODES.APPLICATION_DUPLICATE_TITLE,
        message: `Duplicate application title: "${node.title}".`,
        field: 'title',
        applicationId: node.applicationId,
      });
    }
    seenTitles.add(node.title);
  }

  // Validate each node
  for (const node of registry.nodes) {
    errors.push(...validateApplicationNode(node));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'application_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates application input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateApplicationInput(
  input: ApplicationInput,
): ApplicationInputValidationResult {
  const errors: ApplicationValidationError[] = [];

  if (!input.nodes || input.nodes.length === 0) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
  } else {
    for (const node of input.nodes) {
      errors.push(...validateApplicationNode(node));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'application_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Application Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates an application trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateApplicationTrace(
  trace: ApplicationTrace,
): ApplicationTraceValidationResult {
  const errors: ApplicationValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Application trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Application trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Application trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: APPLICATION_VALIDATION_CODES.APPLICATION_INVALID_TRACE,
      message: 'Application trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'application_trace_composition',
  };
}
