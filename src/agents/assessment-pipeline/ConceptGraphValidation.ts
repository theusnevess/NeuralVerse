/**
 * NV-2000-D8-OPT-04 — Concept Graph Validation Layer
 *
 * Deterministic validation for the Concept Graph Kernel.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentArtifactWithConceptGraph,
  type AssessmentArtifactWithConceptGraphValidationResult,
  type AssessmentConceptCoverage,
  type AssessmentConceptGraph,
  type AssessmentGovernanceLevel,
  type AssessmentGraphObjective,
  type ConceptGraphInput,
  type ConceptGraphInputValidationResult,
  type ConceptGraphRegistry,
  type ConceptGraphRegistryValidationResult,
  type ConceptGraphTrace,
  type ConceptGraphTraceValidationResult,
  type ConceptGraphValidationError,
  type ConceptNodeType,
  type ConceptNodeReference,
  type ConceptRelationship,
  type GraphCoverageType,
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
// VALIDATION CODES — Stable forever (22 codes)
// ============================================================================

export const CONCEPT_GRAPH_VALIDATION_CODES = {
  GRAPH_DUPLICATE_ID: 'GRAPH_DUPLICATE_ID',
  GRAPH_DUPLICATE_TITLE: 'GRAPH_DUPLICATE_TITLE',
  GRAPH_NODE_DUPLICATE_ID: 'GRAPH_NODE_DUPLICATE_ID',
  GRAPH_RELATIONSHIP_DUPLICATE_ID: 'GRAPH_RELATIONSHIP_DUPLICATE_ID',
  GRAPH_INVALID_NODE_TYPE: 'GRAPH_INVALID_NODE_TYPE',
  GRAPH_INVALID_RELATIONSHIP: 'GRAPH_INVALID_RELATIONSHIP',
  GRAPH_INVALID_COVERAGE: 'GRAPH_INVALID_COVERAGE',
  GRAPH_INVALID_OBJECTIVE: 'GRAPH_INVALID_OBJECTIVE',
  GRAPH_INVALID_STATUS: 'GRAPH_INVALID_STATUS',
  GRAPH_INVALID_GOVERNANCE: 'GRAPH_INVALID_GOVERNANCE',
  GRAPH_MISSING_PROVENANCE: 'GRAPH_MISSING_PROVENANCE',
  GRAPH_MISSING_PROVIDER: 'GRAPH_MISSING_PROVIDER',
  GRAPH_MISSING_RATIONALE: 'GRAPH_MISSING_RATIONALE',
  GRAPH_MISSING_ASSESSMENT_REFERENCE: 'GRAPH_MISSING_ASSESSMENT_REFERENCE',
  GRAPH_MISSING_KNOWLEDGE_REFERENCE: 'GRAPH_MISSING_KNOWLEDGE_REFERENCE',
  GRAPH_MISSING_GRAPH_ID: 'GRAPH_MISSING_GRAPH_ID',
  GRAPH_MISSING_TITLE: 'GRAPH_MISSING_TITLE',
  GRAPH_BROKEN_NODE_REFERENCE: 'GRAPH_BROKEN_NODE_REFERENCE',
  GRAPH_BROKEN_RELATIONSHIP_REFERENCE: 'GRAPH_BROKEN_RELATIONSHIP_REFERENCE',
  GRAPH_EMPTY_REGISTRY: 'GRAPH_EMPTY_REGISTRY',
  GRAPH_INVALID_TRACE: 'GRAPH_INVALID_TRACE',
  GRAPH_REGISTRY_INCONSISTENCY: 'GRAPH_REGISTRY_INCONSISTENCY',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate a single ConceptNodeReference.
 */
export function validateConceptNodeReference(
  node: ConceptNodeReference,
): readonly ConceptGraphValidationError[] {
  const errors: ConceptGraphValidationError[] = [];

  if (!node.id || node.id.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_GRAPH_ID,
      message: 'Concept node is missing a valid id.',
      field: 'id',
    });
  }

  if (!node.title || node.title.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_TITLE,
      message: 'Concept node is missing a valid title.',
      field: 'title',
      entityId: node.id,
    });
  }

  if (!node.nodeType || !CANONICAL_CONCEPT_NODE_TYPES.includes(node.nodeType)) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_NODE_TYPE,
      message: `Invalid concept node type: ${String(node.nodeType)}`,
      field: 'nodeType',
      entityId: node.id,
    });
  }

  if (!node.knowledgeGraphId || node.knowledgeGraphId.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_KNOWLEDGE_REFERENCE,
      message: 'Concept node is missing knowledgeGraphId.',
      field: 'knowledgeGraphId',
      entityId: node.id,
    });
  }

  if (!node.knowledgeNodeId || node.knowledgeNodeId.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_KNOWLEDGE_REFERENCE,
      message: 'Concept node is missing knowledgeNodeId.',
      field: 'knowledgeNodeId',
      entityId: node.id,
    });
  }

  return errors;
}

/**
 * Validate a ConceptRelationship.
 */
export function validateConceptRelationship(
  rel: ConceptRelationship,
): readonly ConceptGraphValidationError[] {
  const errors: ConceptGraphValidationError[] = [];

  if (!rel.id || rel.id.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_RELATIONSHIP_DUPLICATE_ID,
      message: 'Relationship is missing a valid id.',
      field: 'id',
    });
  }

  if (!rel.sourceConceptId || rel.sourceConceptId.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_BROKEN_RELATIONSHIP_REFERENCE,
      message: 'Relationship is missing sourceConceptId.',
      field: 'sourceConceptId',
      entityId: rel.id,
    });
  }

  if (!rel.targetConceptId || rel.targetConceptId.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_BROKEN_RELATIONSHIP_REFERENCE,
      message: 'Relationship is missing targetConceptId.',
      field: 'targetConceptId',
      entityId: rel.id,
    });
  }

  if (!rel.relationshipType || !CANONICAL_RELATIONSHIP_TYPES.includes(rel.relationshipType)) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_RELATIONSHIP,
      message: `Invalid relationship type: ${String(rel.relationshipType)}`,
      field: 'relationshipType',
      entityId: rel.id,
    });
  }

  if (!rel.knowledgeGraphId || rel.knowledgeGraphId.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_KNOWLEDGE_REFERENCE,
      message: 'Relationship is missing knowledgeGraphId.',
      field: 'knowledgeGraphId',
      entityId: rel.id,
    });
  }

  return errors;
}

/**
 * Validate an AssessmentConceptCoverage.
 */
export function validateAssessmentConceptCoverage(
  coverage: AssessmentConceptCoverage,
): readonly ConceptGraphValidationError[] {
  const errors: ConceptGraphValidationError[] = [];

  if (!coverage.id || coverage.id.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_GRAPH_ID,
      message: 'Coverage is missing a valid id.',
      field: 'id',
    });
  }

  if (!coverage.coverageType || !CANONICAL_GRAPH_COVERAGE_TYPES.includes(coverage.coverageType)) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_COVERAGE,
      message: `Invalid coverage type: ${String(coverage.coverageType)}`,
      field: 'coverageType',
      entityId: coverage.id,
    });
  }

  if (!coverage.objective || !CANONICAL_ASSESSMENT_GRAPH_OBJECTIVES.includes(coverage.objective)) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_OBJECTIVE,
      message: `Invalid objective: ${String(coverage.objective)}`,
      field: 'objective',
      entityId: coverage.id,
    });
  }

  return errors;
}

/**
 * Validate an AssessmentConceptGraph.
 */
export function validateAssessmentConceptGraph(
  graph: AssessmentConceptGraph,
): readonly ConceptGraphValidationError[] {
  const errors: ConceptGraphValidationError[] = [];

  if (!graph || typeof graph !== 'object') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_GRAPH_ID,
      message: 'Graph is null or not an object.',
    });
    return errors;
  }

  if (!graph.id || typeof graph.id !== 'string' || graph.id.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_GRAPH_ID,
      message: 'Graph is missing a valid id.',
      field: 'id',
      entityId: graph.id ?? 'unknown',
    });
  }

  if (!graph.title || typeof graph.title !== 'string' || graph.title.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_TITLE,
      message: 'Graph is missing a valid title.',
      field: 'title',
      entityId: graph.id,
    });
  }

  if (!graph.knowledgeGraphId || graph.knowledgeGraphId.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_KNOWLEDGE_REFERENCE,
      message: 'Graph is missing knowledgeGraphId.',
      field: 'knowledgeGraphId',
      entityId: graph.id,
    });
  }

  if (!graph.conceptNodes || !Array.isArray(graph.conceptNodes)) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Graph is missing conceptNodes array.',
      field: 'conceptNodes',
      entityId: graph.id,
    });
  } else if (graph.conceptNodes.length === 0) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Graph has no conceptNodes.',
      field: 'conceptNodes',
      entityId: graph.id,
    });
  } else {
    for (const node of graph.conceptNodes) {
      const nodeErrors = validateConceptNodeReference(node);
      errors.push(...nodeErrors);
    }
  }

  if (!graph.relationships || !Array.isArray(graph.relationships)) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Graph is missing relationships array.',
      field: 'relationships',
      entityId: graph.id,
    });
  } else {
    for (const rel of graph.relationships) {
      const relErrors = validateConceptRelationship(rel);
      errors.push(...relErrors);
    }
  }

  if (!graph.coverages || !Array.isArray(graph.coverages)) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Graph is missing coverages array.',
      field: 'coverages',
      entityId: graph.id,
    });
  } else {
    for (const cov of graph.coverages) {
      const covErrors = validateAssessmentConceptCoverage(cov);
      errors.push(...covErrors);
    }
  }

  if (!graph.status || !CANONICAL_GRAPH_MAPPING_STATUS.includes(graph.status)) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_STATUS,
      message: `Invalid status: ${String(graph.status)}`,
      field: 'status',
      entityId: graph.id,
    });
  }

  if (!graph.governance || !CANONICAL_ASSESSMENT_GOVERNANCE.includes(graph.governance)) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_GOVERNANCE,
      message: `Invalid governance: ${String(graph.governance)}`,
      field: 'governance',
      entityId: graph.id,
    });
  }

  if (!graph.provenance || typeof graph.provenance !== 'object') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_PROVENANCE,
      message: 'Graph is missing provenance.',
      field: 'provenance',
      entityId: graph.id,
    });
  } else {
    if (!graph.provenance.provider || graph.provenance.provider.trim() === '') {
      errors.push({
        code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: graph.id,
      });
    }
    if (!graph.provenance.rationale || graph.provenance.rationale.trim() === '') {
      errors.push({
        code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: graph.id,
      });
    }
  }

  if (!graph.trace || typeof graph.trace !== 'object') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
      message: 'Graph is missing trace metadata.',
      field: 'trace',
      entityId: graph.id,
    });
  } else {
    if (graph.trace.deterministic !== true) {
      errors.push({
        code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: graph.id,
      });
    }
    if (graph.trace.randomUsed !== false) {
      errors.push({
        code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: graph.id,
      });
    }
    if (graph.trace.timeDependency !== false) {
      errors.push({
        code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: graph.id,
      });
    }
  }

  return errors;
}

/**
 * Validate a ConceptGraphRegistry.
 */
export function validateConceptGraphRegistry(
  registry: ConceptGraphRegistry,
): ConceptGraphRegistryValidationResult {
  const errors: ConceptGraphValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'concept_graph_registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'concept_graph_registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'concept_graph_registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validateAssessmentConceptGraph(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      checkedAt: 'concept_graph_node_validation' as const,
    };
  });

  for (const result of nodeResults) {
    errors.push(...result.errors);
  }

  const idSet = new Set<string>();
  const titleSet = new Set<string>();
  for (const node of registry.nodes) {
    if (idSet.has(node.id)) {
      errors.push({
        code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_DUPLICATE_ID,
        message: `Duplicate graph id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_DUPLICATE_TITLE,
        message: `Duplicate graph title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'concept_graph_registry_validation',
  };
}

/**
 * Validate a ConceptGraphInput.
 */
export function validateConceptGraphInput(
  input: ConceptGraphInput,
): ConceptGraphInputValidationResult {
  const errors: ConceptGraphValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'concept_graph_input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'concept_graph_input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'concept_graph_input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validateAssessmentConceptGraph(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'concept_graph_input_validation',
  };
}

/**
 * Validate a ConceptGraphTrace.
 */
export function validateConceptGraphTrace(
  trace: ConceptGraphTrace,
): ConceptGraphTraceValidationResult {
  const errors: ConceptGraphValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'concept_graph_trace_validation',
    };
  }

  if (!trace.traceId || typeof trace.traceId !== 'string' || trace.traceId.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'concept_graph_trace_validation',
  };
}

/**
 * Validate an AssessmentArtifactWithConceptGraph.
 */
export function validateAssessmentArtifactWithConceptGraph(
  artifact: AssessmentArtifactWithConceptGraph,
): AssessmentArtifactWithConceptGraphValidationResult {
  const errors: ConceptGraphValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'artifact_concept_graph_validation',
    };
  }

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (!artifact.artifactTitle || artifact.artifactTitle.trim() === '') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_TITLE,
      message: 'Artifact is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  if (!artifact.conceptGraph || typeof artifact.conceptGraph !== 'object') {
    errors.push({
      code: CONCEPT_GRAPH_VALIDATION_CODES.GRAPH_MISSING_PROVENANCE,
      message: 'Artifact is missing conceptGraph.',
      field: 'conceptGraph',
    });
  } else {
    const graphErrors = validateAssessmentConceptGraph(artifact.conceptGraph);
    errors.push(...graphErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'artifact_concept_graph_validation',
  };
}
