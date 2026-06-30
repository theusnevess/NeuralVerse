/**
 * NV-2000-D8-OPT-05 — Deterministic Misconception Kernel
 *
 * Pure deterministic compose functions for misconception detection and
 * remediation modeling. The Assessment Agent models misconception knowledge.
 * It never diagnoses learners, detects misconceptions automatically,
 * generates hints, or recommends personalized remediation.
 *
 * Guarantees:
 * - Same inputs always produce identical outputs.
 * - No global mutable state reads.
 * - No random values.
 * - No time dependency.
 * - Canonical order is always preserved.
 *
 * Deterministic. No Math.random. No Date.now.
 */

import {
  type AssessmentArtifactWithMisconceptions,
  type AssessmentGovernanceLevel,
  type AssessmentMisconception,
  type MisconceptionCause,
  type MisconceptionCauseEntry,
  type MisconceptionInput,
  type MisconceptionProvenance,
  type MisconceptionRegistry,
  type MisconceptionRegistryMetadata,
  type MisconceptionRelationship,
  type MisconceptionSeverity,
  type MisconceptionStatus,
  type MisconceptionTrace,
  type MisconceptionType,
  type RemediationPriority,
  type RemediationStrategy,
  type RemediationType,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_MISCONCEPTION_CAUSES,
  CANONICAL_MISCONCEPTION_SEVERITY,
  CANONICAL_MISCONCEPTION_STATUS,
  CANONICAL_MISCONCEPTION_TYPES,
  CANONICAL_REMEDIATION_PRIORITY,
  CANONICAL_REMEDIATION_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported misconception type?
 */
export function isSupportedMisconceptionType(
  value: string,
): value is MisconceptionType {
  return CANONICAL_MISCONCEPTION_TYPES.includes(value as MisconceptionType);
}

/**
 * Type guard: is the value a supported misconception cause?
 */
export function isSupportedMisconceptionCause(
  value: string,
): value is MisconceptionCause {
  return CANONICAL_MISCONCEPTION_CAUSES.includes(value as MisconceptionCause);
}

/**
 * Type guard: is the value a supported remediation type?
 */
export function isSupportedRemediationType(
  value: string,
): value is RemediationType {
  return CANONICAL_REMEDIATION_TYPES.includes(value as RemediationType);
}

/**
 * Type guard: is the value a supported remediation priority?
 */
export function isSupportedRemediationPriority(
  value: string,
): value is RemediationPriority {
  return CANONICAL_REMEDIATION_PRIORITY.includes(value as RemediationPriority);
}

/**
 * Type guard: is the value a supported misconception severity?
 */
export function isSupportedMisconceptionSeverity(
  value: string,
): value is MisconceptionSeverity {
  return CANONICAL_MISCONCEPTION_SEVERITY.includes(value as MisconceptionSeverity);
}

/**
 * Type guard: is the value a supported misconception status?
 */
export function isSupportedMisconceptionStatus(
  value: string,
): value is MisconceptionStatus {
  return CANONICAL_MISCONCEPTION_STATUS.includes(value as MisconceptionStatus);
}

/**
 * Type guard: is the value a supported misconception governance level?
 */
export function isSupportedMisconceptionGovernance(
  value: string,
): value is AssessmentGovernanceLevel {
  return CANONICAL_ASSESSMENT_GOVERNANCE.includes(
    value as AssessmentGovernanceLevel,
  );
}

/**
 * Returns a copy of canonical misconception types.
 */
export function getCanonicalMisconceptionTypes(): readonly MisconceptionType[] {
  return [...CANONICAL_MISCONCEPTION_TYPES];
}

/**
 * Returns a copy of canonical misconception causes.
 */
export function getCanonicalMisconceptionCauses(): readonly MisconceptionCause[] {
  return [...CANONICAL_MISCONCEPTION_CAUSES];
}

/**
 * Returns a copy of canonical remediation types.
 */
export function getCanonicalRemediationTypes(): readonly RemediationType[] {
  return [...CANONICAL_REMEDIATION_TYPES];
}

/**
 * Returns a copy of canonical remediation priorities.
 */
export function getCanonicalRemediationPriorities(): readonly RemediationPriority[] {
  return [...CANONICAL_REMEDIATION_PRIORITY];
}

/**
 * Returns a copy of canonical misconception severities.
 */
export function getCanonicalMisconceptionSeverities(): readonly MisconceptionSeverity[] {
  return [...CANONICAL_MISCONCEPTION_SEVERITY];
}

/**
 * Returns a copy of canonical misconception statuses.
 */
export function getCanonicalMisconceptionStatuses(): readonly MisconceptionStatus[] {
  return [...CANONICAL_MISCONCEPTION_STATUS];
}

// ============================================================================
// COMPOSE FUNCTIONS — Pure deterministic composition
// ============================================================================

/**
 * Deterministic ID generator.
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
 * Compose an immutable MisconceptionProvenance.
 */
export function composeMisconceptionProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: MisconceptionStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): MisconceptionProvenance {
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
 * Compose an immutable MisconceptionTrace.
 */
export function composeMisconceptionTrace(params: {
  readonly traceId: string;
}): MisconceptionTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_misconception_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable MisconceptionCauseEntry.
 */
export function composeMisconceptionCause(params: {
  readonly id: string;
  readonly causeType: MisconceptionCause;
  readonly description: string;
}): MisconceptionCauseEntry {
  return {
    id: params.id,
    causeType: params.causeType,
    description: params.description,
  };
}

/**
 * Compose an immutable RemediationStrategy.
 */
export function composeRemediationStrategy(params: {
  readonly id: string;
  readonly title: string;
  readonly remediationType: RemediationType;
  readonly priority: RemediationPriority;
  readonly description: string;
  readonly conceptIds: readonly string[];
}): RemediationStrategy {
  return {
    id: params.id,
    title: params.title,
    remediationType: params.remediationType,
    priority: params.priority,
    description: params.description,
    conceptIds: [...params.conceptIds],
  };
}

/**
 * Compose an immutable MisconceptionRelationship.
 */
export function composeMisconceptionRelationship(params: {
  readonly id: string;
  readonly sourceMisconceptionId: string;
  readonly targetMisconceptionId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}): MisconceptionRelationship {
  return {
    id: params.id,
    sourceMisconceptionId: params.sourceMisconceptionId,
    targetMisconceptionId: params.targetMisconceptionId,
    relationshipType: params.relationshipType,
    rationale: params.rationale,
  };
}

/**
 * Compose an immutable AssessmentMisconception.
 */
export function composeAssessmentMisconception(params: {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly misconceptionType: MisconceptionType;
  readonly causes: readonly MisconceptionCause[];
  readonly severity: MisconceptionSeverity;
  readonly conceptIds: readonly string[];
  readonly remediationStrategies: readonly RemediationStrategy[];
  readonly status: MisconceptionStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: MisconceptionProvenance;
}): AssessmentMisconception {
  const traceId = _deterministicId('misconception', [params.id]);
  const trace = composeMisconceptionTrace({ traceId });

  return {
    id: params.id,
    title: params.title,
    description: params.description,
    misconceptionType: params.misconceptionType,
    causes: [...params.causes],
    severity: params.severity,
    conceptIds: [...params.conceptIds],
    remediationStrategies: params.remediationStrategies.map((s) => ({
      ...s,
      conceptIds: [...s.conceptIds],
    })),
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace,
  };
}

/**
 * Compose immutable MisconceptionRegistryMetadata.
 */
export function _composeMisconceptionRegistryMetadata(
  nodes: readonly AssessmentMisconception[],
): MisconceptionRegistryMetadata {
  const sortedIds = [...nodes].map((n) => n.id).sort();
  const registryId = _deterministicId('misconception-registry', sortedIds);

  return {
    registryId,
    version: '1.0.0',
    nodeCount: nodes.length,
    generatedFrom: 'deterministic_misconception_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable MisconceptionRegistry from pre-composed nodes.
 */
export function composeMisconceptionRegistry(
  nodes: readonly AssessmentMisconception[],
): MisconceptionRegistry {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const metadata = _composeMisconceptionRegistryMetadata(sortedNodes);

  return {
    metadata,
    nodes: sortedNodes,
  };
}

/**
 * Compose an immutable MisconceptionRegistry from a MisconceptionInput.
 */
export function composeMisconceptionRegistryFromInput(
  input: MisconceptionInput,
): MisconceptionRegistry {
  return composeMisconceptionRegistry(input.nodes);
}

/**
 * Compose assessment misconceptions into a registry.
 */
export function composeAssessmentMisconceptions(params: {
  readonly misconceptions: readonly AssessmentMisconception[];
}): MisconceptionRegistry {
  return composeMisconceptionRegistry(params.misconceptions);
}

/**
 * Compose an assessment artifact enriched with misconceptions.
 */
export function composeAssessmentArtifactWithMisconceptions(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly misconceptions: readonly AssessmentMisconception[];
}): AssessmentArtifactWithMisconceptions {
  return {
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    misconceptions: [...params.misconceptions],
  };
}
