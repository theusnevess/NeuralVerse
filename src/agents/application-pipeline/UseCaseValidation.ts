/**
 * NV-1900-D7-OPT-02 — Use Case Validation Layer
 *
 * Deterministic validation for use case metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ApplicationUseCase,
  UseCaseRelationship,
  UseCaseRegistry,
  UseCaseTrace,
  UseCaseInput,
  UseCaseValidationError,
  UseCaseNodeValidationResult,
  UseCaseRelationshipValidationResult,
  UseCaseRegistryValidationResult,
  UseCaseInputValidationResult,
  UseCaseTraceValidationResult,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_USE_CASE_TYPES,
  CANONICAL_ENGINEERING_PROBLEM_TYPES,
  CANONICAL_BUSINESS_VALUE_TYPES,
  CANONICAL_APPLICATION_CONTEXT_TYPES,
  CANONICAL_USE_CASE_STATUS,
  CANONICAL_APPLICATION_GOVERNANCE,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const USE_CASE_VALIDATION_CODES = {
  USE_CASE_DUPLICATE_ID: 'USE_CASE_DUPLICATE_ID',
  USE_CASE_DUPLICATE_TITLE: 'USE_CASE_DUPLICATE_TITLE',
  USE_CASE_INVALID_TYPE: 'USE_CASE_INVALID_TYPE',
  USE_CASE_INVALID_ENGINEERING_PROBLEM: 'USE_CASE_INVALID_ENGINEERING_PROBLEM',
  USE_CASE_INVALID_BUSINESS_VALUE: 'USE_CASE_INVALID_BUSINESS_VALUE',
  USE_CASE_INVALID_CONTEXT: 'USE_CASE_INVALID_CONTEXT',
  USE_CASE_INVALID_STATUS: 'USE_CASE_INVALID_STATUS',
  USE_CASE_INVALID_GOVERNANCE: 'USE_CASE_INVALID_GOVERNANCE',
  USE_CASE_MISSING_PROVENANCE: 'USE_CASE_MISSING_PROVENANCE',
  USE_CASE_MISSING_RATIONALE: 'USE_CASE_MISSING_RATIONALE',
  USE_CASE_MISSING_PROVIDER: 'USE_CASE_MISSING_PROVIDER',
  USE_CASE_MISSING_APPLICATION_REFERENCE: 'USE_CASE_MISSING_APPLICATION_REFERENCE',
  USE_CASE_MISSING_KNOWLEDGE_REFERENCE: 'USE_CASE_MISSING_KNOWLEDGE_REFERENCE',
  USE_CASE_EMPTY_REGISTRY: 'USE_CASE_EMPTY_REGISTRY',
  USE_CASE_INVALID_TRACE: 'USE_CASE_INVALID_TRACE',
  USE_CASE_REGISTRY_INCONSISTENCY: 'USE_CASE_REGISTRY_INCONSISTENCY',
  USE_CASE_SELF_RELATIONSHIP: 'USE_CASE_SELF_RELATIONSHIP',
  USE_CASE_INVALID_RELATIONSHIP: 'USE_CASE_INVALID_RELATIONSHIP',
  USE_CASE_MISSING_USE_CASE_ID: 'USE_CASE_MISSING_USE_CASE_ID',
  USE_CASE_MISSING_TITLE: 'USE_CASE_MISSING_TITLE',
} as const;

// ---------------------------------------------------------------------------
// Single Use Case Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single application use case against canonical invariants.
 * Pure function. No side effects.
 */
export function validateApplicationUseCase(
  useCase: ApplicationUseCase,
): readonly UseCaseValidationError[] {
  const errors: UseCaseValidationError[] = [];

  if (!useCase.useCaseId || useCase.useCaseId.trim() === '') {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_USE_CASE_ID,
      message: 'Application use case is missing a use case ID.',
      field: 'useCaseId',
      useCaseId: useCase.useCaseId,
    });
  }

  if (!useCase.title || useCase.title.trim() === '') {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_TITLE,
      message: 'Application use case is missing a title.',
      field: 'title',
      useCaseId: useCase.useCaseId,
    });
  }

  if (!CANONICAL_USE_CASE_TYPES.includes(useCase.useCaseType)) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_TYPE,
      message: `Application use case has unsupported type: "${useCase.useCaseType}".`,
      field: 'useCaseType',
      useCaseId: useCase.useCaseId,
    });
  }

  if (!CANONICAL_ENGINEERING_PROBLEM_TYPES.includes(useCase.engineeringProblemType)) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_ENGINEERING_PROBLEM,
      message: `Application use case has unsupported engineering problem type: "${useCase.engineeringProblemType}".`,
      field: 'engineeringProblemType',
      useCaseId: useCase.useCaseId,
    });
  }

  if (!CANONICAL_BUSINESS_VALUE_TYPES.includes(useCase.businessValueType)) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_BUSINESS_VALUE,
      message: `Application use case has unsupported business value type: "${useCase.businessValueType}".`,
      field: 'businessValueType',
      useCaseId: useCase.useCaseId,
    });
  }

  if (!CANONICAL_APPLICATION_CONTEXT_TYPES.includes(useCase.applicationContext)) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_CONTEXT,
      message: `Application use case has unsupported context: "${useCase.applicationContext}".`,
      field: 'applicationContext',
      useCaseId: useCase.useCaseId,
    });
  }

  if (!useCase.applicationArtifactId || useCase.applicationArtifactId.trim() === '') {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_APPLICATION_REFERENCE,
      message: 'Application use case is missing applicationArtifactId.',
      field: 'applicationArtifactId',
      useCaseId: useCase.useCaseId,
    });
  }

  if (!useCase.knowledgeArtifactId || useCase.knowledgeArtifactId.trim() === '') {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_KNOWLEDGE_REFERENCE,
      message: 'Application use case is missing knowledgeArtifactId.',
      field: 'knowledgeArtifactId',
      useCaseId: useCase.useCaseId,
    });
  }

  if (!useCase.provenance) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_PROVENANCE,
      message: 'Application use case is missing provenance.',
      field: 'provenance',
      useCaseId: useCase.useCaseId,
    });
  } else {
    if (!useCase.provenance.providedBy || useCase.provenance.providedBy.trim() === '') {
      errors.push({
        code: USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_PROVIDER,
        message: 'Use case provenance is missing providedBy.',
        field: 'provenance.providedBy',
        useCaseId: useCase.useCaseId,
      });
    }

    if (!useCase.provenance.rationale || useCase.provenance.rationale.trim() === '') {
      errors.push({
        code: USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_RATIONALE,
        message: 'Use case provenance is missing rationale.',
        field: 'provenance.rationale',
        useCaseId: useCase.useCaseId,
      });
    }

    if (!CANONICAL_APPLICATION_GOVERNANCE.includes(useCase.provenance.governanceStatus)) {
      errors.push({
        code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_GOVERNANCE,
        message: `Use case provenance has invalid governance status: "${useCase.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        useCaseId: useCase.useCaseId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Use Case Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a use case relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateUseCaseRelationship(
  relationship: UseCaseRelationship,
  allUseCaseIds: readonly string[],
): readonly UseCaseValidationError[] {
  const errors: UseCaseValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_RELATIONSHIP,
      message: 'Use case relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceUseCase || relationship.sourceUseCase.trim() === '') {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_RELATIONSHIP,
      message: 'Use case relationship is missing sourceUseCase.',
      field: 'sourceUseCase',
    });
  }

  if (!relationship.targetUseCase || relationship.targetUseCase.trim() === '') {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_RELATIONSHIP,
      message: 'Use case relationship is missing targetUseCase.',
      field: 'targetUseCase',
    });
  }

  if (
    relationship.sourceUseCase &&
    relationship.targetUseCase &&
    relationship.sourceUseCase === relationship.targetUseCase
  ) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_SELF_RELATIONSHIP,
      message: `Use case relationship references itself: "${relationship.sourceUseCase}".`,
      field: 'sourceUseCase',
      useCaseId: relationship.sourceUseCase,
    });
  }

  if (
    relationship.sourceUseCase &&
    !allUseCaseIds.includes(relationship.sourceUseCase)
  ) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_RELATIONSHIP,
      message: `Use case relationship references unknown source: "${relationship.sourceUseCase}".`,
      field: 'sourceUseCase',
      useCaseId: relationship.sourceUseCase,
    });
  }

  if (
    relationship.targetUseCase &&
    !allUseCaseIds.includes(relationship.targetUseCase)
  ) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_RELATIONSHIP,
      message: `Use case relationship references unknown target: "${relationship.targetUseCase}".`,
      field: 'targetUseCase',
      useCaseId: relationship.targetUseCase,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_MISSING_PROVENANCE,
      message: 'Use case relationship is missing provenance.',
      field: 'provenance',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Use Case Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a use case registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateUseCaseRegistry(
  registry: UseCaseRegistry,
): UseCaseRegistryValidationResult {
  const errors: UseCaseValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.useCases || registry.useCases.length === 0) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_EMPTY_REGISTRY,
      message: 'Registry has no use cases.',
      field: 'useCases',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate use case IDs
  const seenIds = new Set<string>();
  for (const useCase of registry.useCases) {
    if (seenIds.has(useCase.useCaseId)) {
      errors.push({
        code: USE_CASE_VALIDATION_CODES.USE_CASE_DUPLICATE_ID,
        message: `Duplicate use case ID: "${useCase.useCaseId}".`,
        useCaseId: useCase.useCaseId,
      });
    }
    seenIds.add(useCase.useCaseId);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const useCase of registry.useCases) {
    if (seenTitles.has(useCase.title)) {
      errors.push({
        code: USE_CASE_VALIDATION_CODES.USE_CASE_DUPLICATE_TITLE,
        message: `Duplicate use case title: "${useCase.title}".`,
        field: 'title',
        useCaseId: useCase.useCaseId,
      });
    }
    seenTitles.add(useCase.title);
  }

  // Validate each use case
  for (const useCase of registry.useCases) {
    errors.push(...validateApplicationUseCase(useCase));
  }

  // Validate relationships
  const allUseCaseIds = registry.useCases.map((u) => u.useCaseId);
  for (const relationship of registry.relationships) {
    errors.push(...validateUseCaseRelationship(relationship, allUseCaseIds));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'use_case_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Use Case Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates use case input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateUseCaseInput(
  input: UseCaseInput,
): UseCaseInputValidationResult {
  const errors: UseCaseValidationError[] = [];

  if (!input.useCases || input.useCases.length === 0) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_EMPTY_REGISTRY,
      message: 'Input has no use cases.',
      field: 'useCases',
    });
  } else {
    for (const useCase of input.useCases) {
      errors.push(...validateApplicationUseCase(useCase));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'use_case_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Use Case Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a use case trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateUseCaseTrace(
  trace: UseCaseTrace,
): UseCaseTraceValidationResult {
  const errors: UseCaseValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_TRACE,
      message: 'Use case trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_TRACE,
      message: 'Use case trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_TRACE,
      message: 'Use case trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: USE_CASE_VALIDATION_CODES.USE_CASE_INVALID_TRACE,
      message: 'Use case trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'use_case_trace_composition',
  };
}
