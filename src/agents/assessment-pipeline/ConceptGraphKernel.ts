/**
 * NV-2000-D8-OPT-04 — Deterministic Concept Graph Kernel
 *
 * Pure deterministic compose functions for concept graph assessment mapping.
 * The Assessment Agent models assessment coverage of concept graphs.
 * It never computes knowledge graphs, performs graph traversal,
 * or infers prerequisite structures.
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
  type AssessmentConceptCoverage,
  type AssessmentConceptGraph,
  type AssessmentArtifactWithConceptGraph,
  type AssessmentGovernanceLevel,
  type AssessmentGraphObjective,
  type ConceptGraphInput,
  type ConceptGraphProvenance,
  type ConceptGraphRegistry,
  type ConceptGraphRegistryMetadata,
  type ConceptGraphTrace,
  type ConceptNodeType,
  type ConceptNodeReference,
  type ConceptRelationship,
  type GraphCoverageType,
  type GraphCoverageEntry,
  type GraphMappingStatus,
  type RelationshipType,
  CANONICAL_ASSESSMENT_GRAPH_OBJECTIVES,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_CONCEPT_NODE_TYPES,
  CANONICAL_GRAPH_COVERAGE_TYPES,
  CANONICAL_GRAPH_MAPPING_STATUS,
  CANONICAL_RELATIONSHIP_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported concept node type?
 */
export function isSupportedConceptNodeType(
  value: string,
): value is ConceptNodeType {
  return CANONICAL_CONCEPT_NODE_TYPES.includes(value as ConceptNodeType);
}

/**
 * Type guard: is the value a supported relationship type?
 */
export function isSupportedRelationshipType(
  value: string,
): value is RelationshipType {
  return CANONICAL_RELATIONSHIP_TYPES.includes(value as RelationshipType);
}

/**
 * Type guard: is the value a supported graph coverage type?
 */
export function isSupportedGraphCoverageType(
  value: string,
): value is GraphCoverageType {
  return CANONICAL_GRAPH_COVERAGE_TYPES.includes(value as GraphCoverageType);
}

/**
 * Type guard: is the value a supported assessment graph objective?
 */
export function isSupportedAssessmentGraphObjective(
  value: string,
): value is AssessmentGraphObjective {
  return CANONICAL_ASSESSMENT_GRAPH_OBJECTIVES.includes(
    value as AssessmentGraphObjective,
  );
}

/**
 * Type guard: is the value a supported graph mapping status?
 */
export function isSupportedGraphMappingStatus(
  value: string,
): value is GraphMappingStatus {
  return CANONICAL_GRAPH_MAPPING_STATUS.includes(value as GraphMappingStatus);
}

/**
 * Type guard: is the value a supported graph governance level?
 */
export function isSupportedGraphGovernance(
  value: string,
): value is AssessmentGovernanceLevel {
  return CANONICAL_ASSESSMENT_GOVERNANCE.includes(
    value as AssessmentGovernanceLevel,
  );
}

/**
 * Returns a copy of canonical concept node types.
 */
export function getCanonicalConceptNodeTypes(): readonly ConceptNodeType[] {
  return [...CANONICAL_CONCEPT_NODE_TYPES];
}

/**
 * Returns a copy of canonical relationship types.
 */
export function getCanonicalRelationshipTypes(): readonly RelationshipType[] {
  return [...CANONICAL_RELATIONSHIP_TYPES];
}

/**
 * Returns a copy of canonical graph coverage types.
 */
export function getCanonicalGraphCoverageTypes(): readonly GraphCoverageType[] {
  return [...CANONICAL_GRAPH_COVERAGE_TYPES];
}

/**
 * Returns a copy of canonical assessment graph objectives.
 */
export function getCanonicalAssessmentGraphObjectives(): readonly AssessmentGraphObjective[] {
  return [...CANONICAL_ASSESSMENT_GRAPH_OBJECTIVES];
}

/**
 * Returns a copy of canonical graph mapping statuses.
 */
export function getCanonicalGraphMappingStatuses(): readonly GraphMappingStatus[] {
  return [...CANONICAL_GRAPH_MAPPING_STATUS];
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
 * Compose an immutable ConceptGraphProvenance.
 */
export function composeConceptGraphProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: GraphMappingStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): ConceptGraphProvenance {
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
 * Compose an immutable ConceptGraphTrace.
 */
export function composeConceptGraphTrace(params: {
  readonly traceId: string;
}): ConceptGraphTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_concept_graph_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable ConceptNodeReference.
 */
export function composeConceptNodeReference(params: {
  readonly id: string;
  readonly title: string;
  readonly nodeType: ConceptNodeType;
  readonly knowledgeGraphId: string;
  readonly knowledgeNodeId: string;
}): ConceptNodeReference {
  return {
    id: params.id,
    title: params.title,
    nodeType: params.nodeType,
    knowledgeGraphId: params.knowledgeGraphId,
    knowledgeNodeId: params.knowledgeNodeId,
  };
}

/**
 * Compose an immutable ConceptRelationship.
 */
export function composeConceptRelationship(params: {
  readonly id: string;
  readonly sourceConceptId: string;
  readonly targetConceptId: string;
  readonly relationshipType: RelationshipType;
  readonly knowledgeGraphId: string;
  readonly rationale: string;
}): ConceptRelationship {
  return {
    id: params.id,
    sourceConceptId: params.sourceConceptId,
    targetConceptId: params.targetConceptId,
    relationshipType: params.relationshipType,
    knowledgeGraphId: params.knowledgeGraphId,
    rationale: params.rationale,
  };
}

/**
 * Compose an immutable AssessmentConceptCoverage.
 */
export function composeAssessmentConceptCoverage(params: {
  readonly id: string;
  readonly coverageType: GraphCoverageType;
  readonly objective: AssessmentGraphObjective;
  readonly conceptNodeIds: readonly string[];
  readonly relationshipIds: readonly string[];
}): AssessmentConceptCoverage {
  return {
    id: params.id,
    coverageType: params.coverageType,
    objective: params.objective,
    conceptNodeIds: [...params.conceptNodeIds],
    relationshipIds: [...params.relationshipIds],
  };
}

/**
 * Compose an immutable GraphCoverageEntry.
 */
export function composeGraphCoverageEntry(params: {
  readonly id: string;
  readonly assessmentConceptGraphId: string;
  readonly coverageType: GraphCoverageType;
  readonly objective: AssessmentGraphObjective;
}): GraphCoverageEntry {
  return {
    id: params.id,
    assessmentConceptGraphId: params.assessmentConceptGraphId,
    coverageType: params.coverageType,
    objective: params.objective,
  };
}

/**
 * Compose an immutable AssessmentConceptGraph.
 */
export function composeAssessmentConceptGraph(params: {
  readonly id: string;
  readonly title: string;
  readonly knowledgeGraphId: string;
  readonly conceptNodes: readonly ConceptNodeReference[];
  readonly relationships: readonly ConceptRelationship[];
  readonly coverages: readonly AssessmentConceptCoverage[];
  readonly status: GraphMappingStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: ConceptGraphProvenance;
}): AssessmentConceptGraph {
  const traceId = _deterministicId('concept-graph', [params.id]);
  const trace = composeConceptGraphTrace({ traceId });

  return {
    id: params.id,
    title: params.title,
    knowledgeGraphId: params.knowledgeGraphId,
    conceptNodes: [...params.conceptNodes],
    relationships: [...params.relationships],
    coverages: [...params.coverages],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace,
  };
}

/**
 * Compose immutable ConceptGraphRegistryMetadata.
 */
export function _composeConceptGraphRegistryMetadata(
  nodes: readonly AssessmentConceptGraph[],
): ConceptGraphRegistryMetadata {
  const sortedIds = [...nodes].map((n) => n.id).sort();
  const registryId = _deterministicId('concept-graph-registry', sortedIds);

  return {
    registryId,
    version: '1.0.0',
    nodeCount: nodes.length,
    generatedFrom: 'deterministic_concept_graph_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable ConceptGraphRegistry from pre-composed nodes.
 */
export function composeConceptGraphRegistry(
  nodes: readonly AssessmentConceptGraph[],
): ConceptGraphRegistry {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const metadata = _composeConceptGraphRegistryMetadata(sortedNodes);

  return {
    metadata,
    nodes: sortedNodes,
  };
}

/**
 * Compose an immutable ConceptGraphRegistry from a ConceptGraphInput.
 */
export function composeConceptGraphRegistryFromInput(
  input: ConceptGraphInput,
): ConceptGraphRegistry {
  return composeConceptGraphRegistry(input.nodes);
}

/**
 * Compose assessment concept graphs into a registry.
 */
export function composeAssessmentConceptGraphs(params: {
  readonly graphs: readonly AssessmentConceptGraph[];
}): ConceptGraphRegistry {
  return composeConceptGraphRegistry(params.graphs);
}

/**
 * Compose an assessment artifact enriched with a concept graph mapping.
 */
export function composeAssessmentArtifactWithConceptGraph(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly conceptGraph: AssessmentConceptGraph;
}): AssessmentArtifactWithConceptGraph {
  return {
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    conceptGraph: params.conceptGraph,
  };
}
