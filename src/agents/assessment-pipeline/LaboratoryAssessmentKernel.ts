/**
 * NV-2000-D8-OPT-07 — Deterministic Laboratory Assessment Kernel
 *
 * Pure deterministic compose functions for laboratory-aware assessment integration.
 * The Assessment Agent models how assessments connect to laboratories.
 * It stores laboratory references, validates laboratory mappings,
 * governs laboratory assessment metadata.
 * It never executes laboratories, evaluates laboratory results,
 * or creates laboratories.
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
  type AssessmentArtifactWithLaboratories,
  type AssessmentGovernanceLevel,
  type AssessmentLaboratoryIntegration,
  type LaboratoryAssessmentInput,
  type LaboratoryAssessmentProvenance,
  type LaboratoryAssessmentRegistry,
  type LaboratoryAssessmentRegistryMetadata,
  type LaboratoryAssessmentRelationship,
  type LaboratoryAssessmentStatus,
  type LaboratoryAssessmentTrace,
  type LaboratoryAssessmentType,
  type LaboratoryEvidenceReference,
  type LaboratoryEvidenceType,
  type LaboratoryMappingType,
  type LaboratoryObjective,
  type LaboratoryObjectiveType,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_LAB_ASSESSMENT_STATUS,
  CANONICAL_LAB_ASSESSMENT_TYPES,
  CANONICAL_LAB_EVIDENCE_TYPES,
  CANONICAL_LAB_MAPPING_TYPES,
  CANONICAL_LAB_OBJECTIVE_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported laboratory assessment type?
 */
export function isSupportedLaboratoryAssessmentType(
  value: string,
): value is LaboratoryAssessmentType {
  return CANONICAL_LAB_ASSESSMENT_TYPES.includes(value as LaboratoryAssessmentType);
}

/**
 * Type guard: is the value a supported laboratory objective type?
 */
export function isSupportedLaboratoryObjectiveType(
  value: string,
): value is LaboratoryObjectiveType {
  return CANONICAL_LAB_OBJECTIVE_TYPES.includes(value as LaboratoryObjectiveType);
}

/**
 * Type guard: is the value a supported laboratory evidence type?
 */
export function isSupportedLaboratoryEvidenceType(
  value: string,
): value is LaboratoryEvidenceType {
  return CANONICAL_LAB_EVIDENCE_TYPES.includes(value as LaboratoryEvidenceType);
}

/**
 * Type guard: is the value a supported laboratory mapping type?
 */
export function isSupportedLaboratoryMappingType(
  value: string,
): value is LaboratoryMappingType {
  return CANONICAL_LAB_MAPPING_TYPES.includes(value as LaboratoryMappingType);
}

/**
 * Type guard: is the value a supported laboratory assessment status?
 */
export function isSupportedLaboratoryAssessmentStatus(
  value: string,
): value is LaboratoryAssessmentStatus {
  return CANONICAL_LAB_ASSESSMENT_STATUS.includes(value as LaboratoryAssessmentStatus);
}

/**
 * Type guard: is the value a supported laboratory assessment governance level?
 */
export function isSupportedLaboratoryAssessmentGovernance(
  value: string,
): value is AssessmentGovernanceLevel {
  return CANONICAL_ASSESSMENT_GOVERNANCE.includes(
    value as AssessmentGovernanceLevel,
  );
}

/**
 * Returns a copy of canonical laboratory assessment types.
 */
export function getCanonicalLaboratoryAssessmentTypes(): readonly LaboratoryAssessmentType[] {
  return [...CANONICAL_LAB_ASSESSMENT_TYPES];
}

/**
 * Returns a copy of canonical laboratory objective types.
 */
export function getCanonicalLaboratoryObjectiveTypes(): readonly LaboratoryObjectiveType[] {
  return [...CANONICAL_LAB_OBJECTIVE_TYPES];
}

/**
 * Returns a copy of canonical laboratory evidence types.
 */
export function getCanonicalLaboratoryEvidenceTypes(): readonly LaboratoryEvidenceType[] {
  return [...CANONICAL_LAB_EVIDENCE_TYPES];
}

/**
 * Returns a copy of canonical laboratory mapping types.
 */
export function getCanonicalLaboratoryMappingTypes(): readonly LaboratoryMappingType[] {
  return [...CANONICAL_LAB_MAPPING_TYPES];
}

/**
 * Returns a copy of canonical laboratory assessment statuses.
 */
export function getCanonicalLaboratoryAssessmentStatuses(): readonly LaboratoryAssessmentStatus[] {
  return [...CANONICAL_LAB_ASSESSMENT_STATUS];
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
 * Compose an immutable LaboratoryAssessmentProvenance.
 */
export function composeLaboratoryAssessmentProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: LaboratoryAssessmentStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): LaboratoryAssessmentProvenance {
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
 * Compose an immutable LaboratoryAssessmentTrace.
 */
export function composeLaboratoryAssessmentTrace(params: {
  readonly traceId: string;
}): LaboratoryAssessmentTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_assessment_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable LaboratoryEvidenceReference.
 */
export function composeLaboratoryEvidenceReference(params: {
  readonly id: string;
  readonly evidenceType: LaboratoryEvidenceType;
  readonly laboratoryActivityId: string;
  readonly description: string;
}): LaboratoryEvidenceReference {
  return {
    id: params.id,
    evidenceType: params.evidenceType,
    laboratoryActivityId: params.laboratoryActivityId,
    description: params.description,
  };
}

/**
 * Compose an immutable LaboratoryObjective.
 */
export function composeLaboratoryObjective(params: {
  readonly id: string;
  readonly objectiveType: LaboratoryObjectiveType;
  readonly description: string;
  readonly conceptIds: readonly string[];
}): LaboratoryObjective {
  return {
    id: params.id,
    objectiveType: params.objectiveType,
    description: params.description,
    conceptIds: [...params.conceptIds],
  };
}

/**
 * Compose an immutable LaboratoryAssessmentRelationship.
 */
export function composeLaboratoryAssessmentRelationship(params: {
  readonly id: string;
  readonly sourceIntegrationId: string;
  readonly targetIntegrationId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}): LaboratoryAssessmentRelationship {
  return {
    id: params.id,
    sourceIntegrationId: params.sourceIntegrationId,
    targetIntegrationId: params.targetIntegrationId,
    relationshipType: params.relationshipType,
    rationale: params.rationale,
  };
}

/**
 * Compose an immutable AssessmentLaboratoryIntegration.
 */
export function composeAssessmentLaboratoryIntegration(params: {
  readonly id: string;
  readonly title: string;
  readonly labAssessmentType: LaboratoryAssessmentType;
  readonly mappingType: LaboratoryMappingType;
  readonly laboratoryActivityId: string;
  readonly objectives: readonly LaboratoryObjective[];
  readonly evidenceReferences: readonly LaboratoryEvidenceReference[];
  readonly conceptIds: readonly string[];
  readonly status: LaboratoryAssessmentStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: LaboratoryAssessmentProvenance;
}): AssessmentLaboratoryIntegration {
  const traceId = _deterministicId('lab-assessment', [params.id]);
  const trace = composeLaboratoryAssessmentTrace({ traceId });

  return {
    id: params.id,
    title: params.title,
    labAssessmentType: params.labAssessmentType,
    mappingType: params.mappingType,
    laboratoryActivityId: params.laboratoryActivityId,
    objectives: params.objectives.map((o) => ({
      ...o,
      conceptIds: [...o.conceptIds],
    })),
    evidenceReferences: [...params.evidenceReferences],
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace,
  };
}

/**
 * Compose immutable LaboratoryAssessmentRegistryMetadata.
 */
export function _composeLaboratoryAssessmentRegistryMetadata(
  nodes: readonly AssessmentLaboratoryIntegration[],
): LaboratoryAssessmentRegistryMetadata {
  const sortedIds = [...nodes].map((n) => n.id).sort();
  const registryId = _deterministicId('lab-assessment-registry', sortedIds);

  return {
    registryId,
    version: '1.0.0',
    nodeCount: nodes.length,
    generatedFrom: 'deterministic_laboratory_assessment_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable LaboratoryAssessmentRegistry from pre-composed nodes.
 */
export function composeLaboratoryAssessmentRegistry(
  nodes: readonly AssessmentLaboratoryIntegration[],
): LaboratoryAssessmentRegistry {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const metadata = _composeLaboratoryAssessmentRegistryMetadata(sortedNodes);

  return {
    metadata,
    nodes: sortedNodes,
  };
}

/**
 * Compose an immutable LaboratoryAssessmentRegistry from input.
 */
export function composeLaboratoryAssessmentRegistryFromInput(
  input: LaboratoryAssessmentInput,
): LaboratoryAssessmentRegistry {
  return composeLaboratoryAssessmentRegistry(input.nodes);
}

/**
 * Compose assessment laboratory mappings into a registry.
 */
export function composeAssessmentLaboratoryMappings(params: {
  readonly integrations: readonly AssessmentLaboratoryIntegration[];
}): LaboratoryAssessmentRegistry {
  return composeLaboratoryAssessmentRegistry(params.integrations);
}

/**
 * Compose an assessment artifact enriched with laboratory integrations.
 */
export function composeAssessmentArtifactWithLaboratories(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly laboratories: readonly AssessmentLaboratoryIntegration[];
}): AssessmentArtifactWithLaboratories {
  return {
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    laboratories: [...params.laboratories],
  };
}
