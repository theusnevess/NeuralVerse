/**
 * NV-2000-D8-OPT-01 — Deterministic Assessment Kernel
 *
 * Pure deterministic compose functions for the Assessment Pipeline.
 * D8-OPT-01 implements ONLY the structural foundation.
 *
 * Guarantees:
 * - Same inputs always produce identical outputs.
 * - No global mutable state reads.
 * - No random values.
 * - No time dependency.
 * - Canonical order is always preserved.
 * - No assessment logic. No content fabrication.
 *
 * Deterministic. No Math.random. No Date.now.
 */

import {
  type AssessmentArtifactType,
  type AssessmentDecision,
  type AssessmentDomain,
  type AssessmentGovernanceLevel,
  type AssessmentInput,
  type AssessmentInputValidationResult,
  type AssessmentNode,
  type AssessmentNodeValidationResult,
  type AssessmentProvenance,
  type AssessmentRegistry,
  type AssessmentRegistryMetadata,
  type AssessmentRegistryValidationResult,
  type AssessmentStatus,
  type AssessmentTrace,
  type AssessmentTraceValidationResult,
  type AssessmentValidationError,
  type AssessmentValidationResult,
  CANONICAL_ASSESSMENT_ARTIFACT_TYPES,
  CANONICAL_ASSESSMENT_DOMAINS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_ASSESSMENT_STATUS,
} from './AssessmentAgentContract.ts';
import {
  validateAssessmentInput,
  validateAssessmentNode,
  validateAssessmentRegistry,
  validateAssessmentTrace,
} from './AssessmentValidation.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported assessment artifact type?
 */
export function isSupportedAssessmentArtifactType(
  value: string,
): value is AssessmentArtifactType {
  return (
    CANONICAL_ASSESSMENT_ARTIFACT_TYPES.includes(
      value as AssessmentArtifactType,
    )
  );
}

/**
 * Type guard: is the value a supported assessment domain?
 */
export function isSupportedAssessmentDomain(
  value: string,
): value is AssessmentDomain {
  return CANONICAL_ASSESSMENT_DOMAINS.includes(value as AssessmentDomain);
}

/**
 * Type guard: is the value a supported assessment status?
 */
export function isSupportedAssessmentStatus(
  value: string,
): value is AssessmentStatus {
  return CANONICAL_ASSESSMENT_STATUS.includes(value as AssessmentStatus);
}

/**
 * Type guard: is the value a supported assessment governance level?
 */
export function isSupportedAssessmentGovernance(
  value: string,
): value is AssessmentGovernanceLevel {
  return CANONICAL_ASSESSMENT_GOVERNANCE.includes(
    value as AssessmentGovernanceLevel,
  );
}

/**
 * Returns a copy of canonical assessment artifact types.
 */
export function getCanonicalAssessmentArtifactTypes(): readonly AssessmentArtifactType[] {
  return [...CANONICAL_ASSESSMENT_ARTIFACT_TYPES];
}

/**
 * Returns a copy of canonical assessment domains.
 */
export function getCanonicalAssessmentDomains(): readonly AssessmentDomain[] {
  return [...CANONICAL_ASSESSMENT_DOMAINS];
}

/**
 * Returns a copy of canonical assessment statuses.
 */
export function getCanonicalAssessmentStatuses(): readonly AssessmentStatus[] {
  return [...CANONICAL_ASSESSMENT_STATUS];
}

/**
 * Returns a copy of canonical assessment governance levels.
 */
export function getCanonicalAssessmentGovernance(): readonly AssessmentGovernanceLevel[] {
  return [...CANONICAL_ASSESSMENT_GOVERNANCE];
}

// ============================================================================
// COMPOSE FUNCTIONS — Pure deterministic composition
// ============================================================================

/**
 * Deterministic ID generator.
 * Produces stable IDs from input parameters.
 */
function _deterministicId(prefix: string, parts: readonly string[]): string {
  const slug = parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
  return `${prefix}-${slug}`;
}

/**
 * Compose an immutable AssessmentProvenance from input.
 *
 * Deterministic. Pure. Immutable.
 */
export function composeAssessmentProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: AssessmentStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): AssessmentProvenance {
  return {
    provider: params.provider,
    source: params.source,
    reviewStatus: params.reviewStatus,
    reviewDate: params.reviewDate,
    version: params.version,
    rationale: params.rationale,
  };
}

/**
 * Compose an immutable AssessmentTrace.
 *
 * Deterministic. Pure. Immutable. No random. No time.
 */
export function composeAssessmentTrace(params: {
  readonly traceId: string;
}): AssessmentTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_assessment_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable AssessmentNode.
 *
 * Deterministic. Pure. Immutable.
 */
export function composeAssessmentNode(params: {
  readonly id: string;
  readonly title: string;
  readonly artifactType: AssessmentArtifactType;
  readonly domain: AssessmentDomain;
  readonly status: AssessmentStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: AssessmentProvenance;
}): AssessmentNode {
  const traceId = _deterministicId('assessment-node', [params.id]);
  const trace = composeAssessmentTrace({ traceId });

  return {
    id: params.id,
    title: params.title,
    artifactType: params.artifactType,
    domain: params.domain,
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace,
  };
}

/**
 * Compose an immutable AssessmentRegistryMetadata.
 *
 * Deterministic. Pure. Immutable.
 */
export function _composeRegistryMetadata(
  nodes: readonly AssessmentNode[],
): AssessmentRegistryMetadata {
  const sortedIds = [...nodes].map((n) => n.id).sort();
  const registryId = _deterministicId('assessment-registry', sortedIds);

  return {
    registryId,
    version: '1.0.0',
    nodeCount: nodes.length,
    generatedFrom: 'deterministic_assessment_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable AssessmentRegistry from pre-composed nodes.
 *
 * Deterministic. Pure. Immutable. Sorted copy.
 */
export function composeAssessmentRegistry(
  nodes: readonly AssessmentNode[],
): AssessmentRegistry {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const metadata = _composeRegistryMetadata(sortedNodes);

  return {
    metadata,
    nodes: sortedNodes,
  };
}

/**
 * Compose an immutable AssessmentRegistry from an AssessmentInput.
 *
 * Deterministic. Pure. Immutable. Sorted copy.
 */
export function composeAssessmentRegistryFromInput(
  input: AssessmentInput,
): AssessmentRegistry {
  return composeAssessmentRegistry(input.nodes);
}

/**
 * Compose a complete AssessmentValidationResult for a node.
 *
 * Deterministic. Pure. Immutable.
 */
export function _composeNodeValidation(
  node: AssessmentNode,
): AssessmentNodeValidationResult {
  const errors = validateAssessmentNode(node);

  return {
    valid: errors.length === 0,
    errors,
    nodeId: node.id,
    checkedAt: 'node_validation',
  };
}

/**
 * Compose a complete AssessmentValidationResult for a registry.
 *
 * Deterministic. Pure. Immutable.
 */
export function _composeRegistryValidation(
  registry: AssessmentRegistry,
): AssessmentRegistryValidationResult {
  const nodeResults = registry.nodes.map((node) =>
    _composeNodeValidation(node),
  );

  const allErrors: AssessmentValidationError[] = [];
  for (const result of nodeResults) {
    allErrors.push(...result.errors);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    nodeResults,
    checkedAt: 'registry_validation',
  };
}

/**
 * Top-level compose function.
 * Composes a full assessment output with validation.
 *
 * Deterministic. Pure. Immutable.
 */
export function composeAssessment(params: {
  readonly nodes: readonly AssessmentNode[];
}): {
  readonly registry: AssessmentRegistry;
  readonly validation: AssessmentRegistryValidationResult;
  readonly trace: AssessmentTrace;
} {
  const registry = composeAssessmentRegistry(params.nodes);
  const validation = _composeRegistryValidation(registry);

  const traceId = _deterministicId('assessment-composed', [
    registry.metadata.registryId,
  ]);
  const trace = composeAssessmentTrace({ traceId });

  return {
    registry,
    validation,
    trace,
  };
}
