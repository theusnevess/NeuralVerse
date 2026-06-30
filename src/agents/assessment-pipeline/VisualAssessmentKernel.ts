/**
 * NV-2000-D8-OPT-08 — Deterministic Visual Assessment Kernel
 *
 * Pure deterministic compose functions for visual and multimodal assessment modeling.
 * The Assessment Agent models visual educational assessment metadata.
 * It stores references, validates visual assessment structures,
 * governs visual educational assets.
 * It never renders images, analyzes images, or generates diagrams.
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
  type AssessmentArtifactWithVisualAssets,
  type AssessmentVisualArtifact,
  type MultimodalEvidence,
  type MultimodalEvidenceType,
  type VisualAssessmentInput,
  type VisualAssessmentProvenance,
  type VisualAssessmentRegistry,
  type VisualAssessmentRegistryMetadata,
  type VisualAssessmentRelationship,
  type VisualAssessmentStatus,
  type VisualAssessmentTask,
  type VisualAssessmentTrace,
  type VisualAssessmentType,
  type VisualGovernanceLevel,
  type VisualAssessmentReference,
  type VisualResourceType,
  type VisualTaskType,
  CANONICAL_MULTIMODAL_EVIDENCE_TYPES,
  CANONICAL_VISUAL_ASSESSMENT_STATUS,
  CANONICAL_VISUAL_ASSESSMENT_TYPES,
  CANONICAL_VISUAL_GOVERNANCE_LEVELS,
  CANONICAL_VISUAL_RESOURCE_TYPES,
  CANONICAL_VISUAL_TASK_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported visual assessment type?
 */
export function isSupportedVisualAssessmentType(
  value: string,
): value is VisualAssessmentType {
  return CANONICAL_VISUAL_ASSESSMENT_TYPES.includes(value as VisualAssessmentType);
}

/**
 * Type guard: is the value a supported visual resource type?
 */
export function isSupportedVisualResourceType(
  value: string,
): value is VisualResourceType {
  return CANONICAL_VISUAL_RESOURCE_TYPES.includes(value as VisualResourceType);
}

/**
 * Type guard: is the value a supported visual task type?
 */
export function isSupportedVisualTaskType(
  value: string,
): value is VisualTaskType {
  return CANONICAL_VISUAL_TASK_TYPES.includes(value as VisualTaskType);
}

/**
 * Type guard: is the value a supported multimodal evidence type?
 */
export function isSupportedMultimodalEvidenceType(
  value: string,
): value is MultimodalEvidenceType {
  return CANONICAL_MULTIMODAL_EVIDENCE_TYPES.includes(
    value as MultimodalEvidenceType,
  );
}

/**
 * Type guard: is the value a supported visual governance level?
 */
export function isSupportedVisualGovernanceLevel(
  value: string,
): value is VisualGovernanceLevel {
  return CANONICAL_VISUAL_GOVERNANCE_LEVELS.includes(
    value as VisualGovernanceLevel,
  );
}

/**
 * Type guard: is the value a supported visual assessment status?
 */
export function isSupportedVisualAssessmentStatus(
  value: string,
): value is VisualAssessmentStatus {
  return CANONICAL_VISUAL_ASSESSMENT_STATUS.includes(
    value as VisualAssessmentStatus,
  );
}

/**
 * Type guard: is the value a supported visual assessment governance level?
 */
export function isSupportedVisualAssessmentGovernance(
  value: string,
): value is VisualGovernanceLevel {
  return CANONICAL_VISUAL_GOVERNANCE_LEVELS.includes(
    value as VisualGovernanceLevel,
  );
}

/**
 * Returns a copy of canonical visual assessment types.
 */
export function getCanonicalVisualAssessmentTypes(): readonly VisualAssessmentType[] {
  return [...CANONICAL_VISUAL_ASSESSMENT_TYPES];
}

/**
 * Returns a copy of canonical visual resource types.
 */
export function getCanonicalVisualResourceTypes(): readonly VisualResourceType[] {
  return [...CANONICAL_VISUAL_RESOURCE_TYPES];
}

/**
 * Returns a copy of canonical visual task types.
 */
export function getCanonicalVisualTaskTypes(): readonly VisualTaskType[] {
  return [...CANONICAL_VISUAL_TASK_TYPES];
}

/**
 * Returns a copy of canonical multimodal evidence types.
 */
export function getCanonicalMultimodalEvidenceTypes(): readonly MultimodalEvidenceType[] {
  return [...CANONICAL_MULTIMODAL_EVIDENCE_TYPES];
}

/**
 * Returns a copy of canonical visual governance levels.
 */
export function getCanonicalVisualGovernanceLevels(): readonly VisualGovernanceLevel[] {
  return [...CANONICAL_VISUAL_GOVERNANCE_LEVELS];
}

/**
 * Returns a copy of canonical visual assessment statuses.
 */
export function getCanonicalVisualAssessmentStatuses(): readonly VisualAssessmentStatus[] {
  return [...CANONICAL_VISUAL_ASSESSMENT_STATUS];
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
 * Compose an immutable VisualAssessmentProvenance.
 */
export function composeVisualAssessmentProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: VisualAssessmentStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): VisualAssessmentProvenance {
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
 * Compose an immutable VisualAssessmentTrace.
 */
export function composeVisualAssessmentTrace(params: {
  readonly traceId: string;
}): VisualAssessmentTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_visual_assessment_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable VisualAssessmentReference.
 */
export function composeVisualAssessmentReference(params: {
  readonly id: string;
  readonly resourceType: VisualResourceType;
  readonly resourceUri: string;
  readonly description: string;
}): VisualAssessmentReference {
  return {
    id: params.id,
    resourceType: params.resourceType,
    resourceUri: params.resourceUri,
    description: params.description,
  };
}

/**
 * Compose an immutable VisualAssessmentTask.
 */
export function composeVisualAssessmentTask(params: {
  readonly id: string;
  readonly taskType: VisualTaskType;
  readonly description: string;
  readonly conceptIds: readonly string[];
}): VisualAssessmentTask {
  return {
    id: params.id,
    taskType: params.taskType,
    description: params.description,
    conceptIds: [...params.conceptIds],
  };
}

/**
 * Compose an immutable MultimodalEvidence.
 */
export function composeMultimodalEvidence(params: {
  readonly id: string;
  readonly evidenceType: MultimodalEvidenceType;
  readonly description: string;
}): MultimodalEvidence {
  return {
    id: params.id,
    evidenceType: params.evidenceType,
    description: params.description,
  };
}

/**
 * Compose an immutable VisualAssessmentRelationship.
 */
export function composeVisualAssessmentRelationship(params: {
  readonly id: string;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}): VisualAssessmentRelationship {
  return {
    id: params.id,
    sourceArtifactId: params.sourceArtifactId,
    targetArtifactId: params.targetArtifactId,
    relationshipType: params.relationshipType,
    rationale: params.rationale,
  };
}

/**
 * Compose an immutable AssessmentVisualArtifact.
 */
export function composeAssessmentVisualArtifact(params: {
  readonly id: string;
  readonly title: string;
  readonly visualAssessmentType: VisualAssessmentType;
  readonly visualReferences: readonly VisualAssessmentReference[];
  readonly tasks: readonly VisualAssessmentTask[];
  readonly evidence: readonly MultimodalEvidence[];
  readonly conceptIds: readonly string[];
  readonly status: VisualAssessmentStatus;
  readonly governance: VisualGovernanceLevel;
  readonly provenance: VisualAssessmentProvenance;
}): AssessmentVisualArtifact {
  const traceId = _deterministicId('visual-assessment', [params.id]);
  const trace = composeVisualAssessmentTrace({ traceId });

  return {
    id: params.id,
    title: params.title,
    visualAssessmentType: params.visualAssessmentType,
    visualReferences: [...params.visualReferences],
    tasks: params.tasks.map((t) => ({
      ...t,
      conceptIds: [...t.conceptIds],
    })),
    evidence: [...params.evidence],
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace,
  };
}

/**
 * Compose immutable VisualAssessmentRegistryMetadata.
 */
export function _composeVisualAssessmentRegistryMetadata(
  nodes: readonly AssessmentVisualArtifact[],
): VisualAssessmentRegistryMetadata {
  const sortedIds = [...nodes].map((n) => n.id).sort();
  const registryId = _deterministicId('visual-assessment-registry', sortedIds);

  return {
    registryId,
    version: '1.0.0',
    nodeCount: nodes.length,
    generatedFrom: 'deterministic_visual_assessment_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable VisualAssessmentRegistry from pre-composed nodes.
 */
export function composeVisualAssessmentRegistry(
  nodes: readonly AssessmentVisualArtifact[],
): VisualAssessmentRegistry {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const metadata = _composeVisualAssessmentRegistryMetadata(sortedNodes);

  return {
    metadata,
    nodes: sortedNodes,
  };
}

/**
 * Compose an immutable VisualAssessmentRegistry from input.
 */
export function composeVisualAssessmentRegistryFromInput(
  input: VisualAssessmentInput,
): VisualAssessmentRegistry {
  return composeVisualAssessmentRegistry(input.nodes);
}

/**
 * Compose assessment visual assets into a registry.
 */
export function composeAssessmentVisualAssets(params: {
  readonly artifacts: readonly AssessmentVisualArtifact[];
}): VisualAssessmentRegistry {
  return composeVisualAssessmentRegistry(params.artifacts);
}

/**
 * Compose an assessment artifact enriched with visual assets.
 */
export function composeAssessmentArtifactWithVisualAssets(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly visualAssets: readonly AssessmentVisualArtifact[];
}): AssessmentArtifactWithVisualAssets {
  return {
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    visualAssets: [...params.visualAssets],
  };
}
