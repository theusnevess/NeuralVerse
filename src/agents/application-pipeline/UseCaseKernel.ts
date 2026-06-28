/**
 * NV-1900-D7-OPT-02 — Systematic Use Case Mapping Kernel
 *
 * Deterministic orchestration functions for use case metadata.
 * Produces use case nodes, relationships, traces, and registries.
 *
 * This module never:
 * - Generates use case content
 * - Infers new use cases
 * - Ranks technologies
 * - Produces recommendations
 * - Stores educational content
 * - Generates markdown
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Use case metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ApplicationUseCase,
  UseCaseProvenance,
  UseCaseRelationship,
  UseCaseDecision,
  UseCaseTrace,
  UseCaseRegistry,
  UseCaseRegistryMetadata,
  UseCaseInput,
  UseCaseType,
  EngineeringProblemType,
  BusinessValueType,
  ApplicationContextType,
  ApplicationGovernanceStatus,
  ApplicationNode,
  ApplicationArtifactWithUseCases,
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
// Use Case Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes use case provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeUseCaseProvenance(params: {
  readonly providedBy: string;
  readonly rationale: string;
  readonly reviewedBy: string;
  readonly reviewDate: string;
  readonly governanceStatus: ApplicationGovernanceStatus;
}): UseCaseProvenance {
  return {
    providedBy: params.providedBy,
    rationale: params.rationale,
    reviewedBy: params.reviewedBy,
    reviewDate: params.reviewDate,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Application Use Case Composition
// ---------------------------------------------------------------------------

/**
 * Composes an application use case from provided parameters.
 * Pure function. No side effects.
 */
export function composeApplicationUseCase(params: {
  readonly useCaseId: string;
  readonly title: string;
  readonly description: string;
  readonly applicationArtifactId: string;
  readonly knowledgeArtifactId: string;
  readonly useCaseType: UseCaseType;
  readonly engineeringProblemType: EngineeringProblemType;
  readonly businessValueType: BusinessValueType;
  readonly applicationContext: ApplicationContextType;
  readonly summary: string;
  readonly provenance: UseCaseProvenance;
}): ApplicationUseCase {
  return {
    useCaseId: params.useCaseId,
    title: params.title,
    description: params.description,
    applicationArtifactId: params.applicationArtifactId,
    knowledgeArtifactId: params.knowledgeArtifactId,
    useCaseType: params.useCaseType,
    engineeringProblemType: params.engineeringProblemType,
    businessValueType: params.businessValueType,
    applicationContext: params.applicationContext,
    summary: params.summary,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Use Case Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes a use case relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeUseCaseRelationship(params: {
  readonly relationshipId: string;
  readonly sourceUseCase: string;
  readonly targetUseCase: string;
  readonly relationshipType: string;
  readonly provenance: UseCaseProvenance;
}): UseCaseRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceUseCase: params.sourceUseCase,
    targetUseCase: params.targetUseCase,
    relationshipType: params.relationshipType,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Use Case Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a use case decision from validation results.
 * Pure function. No side effects.
 */
function _composeUseCaseDecision(
  useCaseId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): UseCaseDecision {
  return {
    decisionId: `_decision_${useCaseId}`,
    useCaseId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Use Case Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a use case trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeUseCaseTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly UseCaseDecision[];
  readonly registryVersion: string;
  readonly compositionVersion: string;
}): UseCaseTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_use_case_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for application use cases.
 * Sorts by useCaseId, then useCaseType, then title.
 * Pure function. No side effects.
 */
function _compareUseCase(
  a: ApplicationUseCase,
  b: ApplicationUseCase,
): number {
  if (a.useCaseId < b.useCaseId) return -1;
  if (a.useCaseId > b.useCaseId) return 1;

  if (a.useCaseType < b.useCaseType) return -1;
  if (a.useCaseType > b.useCaseType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

/**
 * Deterministic comparator for use case relationships.
 * Sorts by relationshipId.
 * Pure function. No side effects.
 */
function _compareRelationship(
  a: UseCaseRelationship,
  b: UseCaseRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Use Case Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a use case registry from use cases and relationships.
 * Pure function. No side effects.
 * Deterministic ordering: useCaseId → useCaseType → title.
 */
export function composeUseCaseRegistry(
  useCases: readonly ApplicationUseCase[],
  relationships: readonly UseCaseRelationship[],
): UseCaseRegistry {
  const sortedUseCases = [...useCases].sort(_compareUseCase);
  const sortedRelationships = [...relationships].sort(_compareRelationship);

  const types = new Set(sortedUseCases.map((u) => u.useCaseType));
  const problemTypes = new Set(sortedUseCases.map((u) => u.engineeringProblemType));

  const metadata: UseCaseRegistryMetadata = {
    registryId: `_registry_${sortedUseCases.length}_${sortedRelationships.length}`,
    useCaseCount: sortedUseCases.length,
    relationshipCount: sortedRelationships.length,
    typeCount: types.size,
    problemTypeCount: problemTypes.size,
  };

  return {
    registryId: metadata.registryId,
    useCases: sortedUseCases,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedUseCases.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: true,
      generatedFrom: 'deterministic_use_case_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_use_case_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Use Case Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a use case registry from an input.
 * Pure function. No side effects.
 */
export function composeUseCaseRegistryFromInput(
  input: UseCaseInput,
): UseCaseRegistry {
  return composeUseCaseRegistry(input.useCases, input.relationships);
}

// ---------------------------------------------------------------------------
// Use Case Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete use case registry from an input.
 * Pure function. No side effects.
 */
export function composeApplicationUseCases(
  input: UseCaseInput,
): UseCaseRegistry {
  const decisions = input.useCases.map((useCase) => {
    const errors = _validateUseCaseForDecision(useCase);
    return _composeUseCaseDecision(useCase.useCaseId, errors.length === 0, errors);
  });

  const registry = composeUseCaseRegistry(input.useCases, input.relationships);

  return {
    ...registry,
    trace: composeUseCaseTrace({
      traceId: `_trace_${input.useCases.length}`,
      decisions,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    }),
  };
}

// ---------------------------------------------------------------------------
// Application Artifact with Use Cases Composition
// ---------------------------------------------------------------------------

/**
 * Attaches use case registry metadata to an application artifact.
 * Pure function. No side effects.
 * Never mutates the original artifact.
 */
export function composeApplicationArtifactWithUseCases(params: {
  readonly applicationNode: ApplicationNode;
  readonly useCaseRegistry: UseCaseRegistry;
}): ApplicationArtifactWithUseCases {
  return {
    applicationNode: { ...params.applicationNode },
    useCaseRegistry: { ...params.useCaseRegistry },
    deterministic: true,
    generatedFrom: 'deterministic_use_case_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Use Case Decision Validation
// ---------------------------------------------------------------------------

/**
 * Validates a use case for decision composition.
 * Pure function. No side effects.
 */
function _validateUseCaseForDecision(
  useCase: ApplicationUseCase,
): readonly string[] {
  const errors: string[] = [];

  if (!useCase.useCaseId || useCase.useCaseId.trim() === '') {
    errors.push('USE_CASE_MISSING_USE_CASE_ID');
  }

  if (!useCase.title || useCase.title.trim() === '') {
    errors.push('USE_CASE_MISSING_TITLE');
  }

  if (!CANONICAL_USE_CASE_TYPES.includes(useCase.useCaseType)) {
    errors.push('USE_CASE_INVALID_TYPE');
  }

  if (!CANONICAL_ENGINEERING_PROBLEM_TYPES.includes(useCase.engineeringProblemType)) {
    errors.push('USE_CASE_INVALID_ENGINEERING_PROBLEM');
  }

  if (!CANONICAL_BUSINESS_VALUE_TYPES.includes(useCase.businessValueType)) {
    errors.push('USE_CASE_INVALID_BUSINESS_VALUE');
  }

  if (!CANONICAL_APPLICATION_CONTEXT_TYPES.includes(useCase.applicationContext)) {
    errors.push('USE_CASE_INVALID_CONTEXT');
  }

  if (!useCase.provenance) {
    errors.push('USE_CASE_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported use case type.
 */
export function isSupportedUseCaseType(
  useCaseType: string,
): useCaseType is UseCaseType {
  return CANONICAL_USE_CASE_TYPES.includes(useCaseType as UseCaseType);
}

/**
 * Checks if a string is a supported engineering problem type.
 */
export function isSupportedEngineeringProblemType(
  problemType: string,
): problemType is EngineeringProblemType {
  return CANONICAL_ENGINEERING_PROBLEM_TYPES.includes(problemType as EngineeringProblemType);
}

/**
 * Checks if a string is a supported business value type.
 */
export function isSupportedBusinessValueType(
  businessValueType: string,
): businessValueType is BusinessValueType {
  return CANONICAL_BUSINESS_VALUE_TYPES.includes(businessValueType as BusinessValueType);
}

/**
 * Checks if a string is a supported application context.
 */
export function isSupportedApplicationContext(
  context: string,
): context is ApplicationContextType {
  return CANONICAL_APPLICATION_CONTEXT_TYPES.includes(context as ApplicationContextType);
}

/**
 * Checks if a string is a supported use case status.
 */
export function isSupportedUseCaseStatus(
  status: string,
): status is UseCaseStatus {
  return CANONICAL_USE_CASE_STATUS.includes(status as UseCaseStatus);
}

/**
 * Checks if a string is a supported use case governance status.
 */
export function isSupportedUseCaseGovernance(
  governanceStatus: string,
): governanceStatus is ApplicationGovernanceStatus {
  return CANONICAL_APPLICATION_GOVERNANCE.includes(
    governanceStatus as ApplicationGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical use case types.
 */
export function getCanonicalUseCaseTypes(): readonly UseCaseType[] {
  return CANONICAL_USE_CASE_TYPES;
}

/**
 * Returns the canonical engineering problem types.
 */
export function getCanonicalEngineeringProblemTypes(): readonly EngineeringProblemType[] {
  return CANONICAL_ENGINEERING_PROBLEM_TYPES;
}

/**
 * Returns the canonical business value types.
 */
export function getCanonicalBusinessValueTypes(): readonly BusinessValueType[] {
  return CANONICAL_BUSINESS_VALUE_TYPES;
}

/**
 * Returns the canonical application context types.
 */
export function getCanonicalApplicationContexts(): readonly ApplicationContextType[] {
  return CANONICAL_APPLICATION_CONTEXT_TYPES;
}

/**
 * Returns the canonical use case statuses.
 */
export function getCanonicalUseCaseStatuses(): readonly UseCaseStatus[] {
  return CANONICAL_USE_CASE_STATUS;
}
