/**
 * NV-1500-D3-OPT-05 — Curriculum Roadmap Validation Layer
 *
 * Deterministic validation for curriculum roadmap structures.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumRoadmap,
  CurriculumRoadmapNode,
  CurriculumRoadmapRegistry,
  CurriculumArtifactWithRoadmaps,
  CurriculumRoadmapInput,
  CurriculumRoadmapValidationError,
  CurriculumRoadmapValidationResult,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_ROADMAP_TYPES,
  CANONICAL_ROADMAP_STAGES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Stage Order Helper
// ---------------------------------------------------------------------------

function _getStageOrder(stage: string): number {
  const index = CANONICAL_ROADMAP_STAGES.indexOf(
    stage as (typeof CANONICAL_ROADMAP_STAGES)[number],
  );
  return index === -1 ? -1 : index;
}

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const ROADMAP_VALIDATION_CODES = {
  ROADMAP_UNKNOWN_TYPE: 'ROADMAP_UNKNOWN_TYPE',
  ROADMAP_UNKNOWN_STAGE: 'ROADMAP_UNKNOWN_STAGE',
  ROADMAP_DUPLICATE_ID: 'ROADMAP_DUPLICATE_ID',
  ROADMAP_DUPLICATE_NODE: 'ROADMAP_DUPLICATE_NODE',
  ROADMAP_INVALID_REFERENCE: 'ROADMAP_INVALID_REFERENCE',
  ROADMAP_INVALID_ENTRY: 'ROADMAP_INVALID_ENTRY',
  ROADMAP_INVALID_TERMINAL: 'ROADMAP_INVALID_TERMINAL',
  ROADMAP_EMPTY_PATH: 'ROADMAP_EMPTY_PATH',
  ROADMAP_EMPTY_REGISTRY: 'ROADMAP_EMPTY_REGISTRY',
  ROADMAP_INVALID_ORDER: 'ROADMAP_INVALID_ORDER',
  ROADMAP_MISSING_PROVENANCE: 'ROADMAP_MISSING_PROVENANCE',
  ROADMAP_MISSING_SOURCE: 'ROADMAP_MISSING_SOURCE',
  ROADMAP_INVALID_STATUS: 'ROADMAP_INVALID_STATUS',
  ROADMAP_MISSING_ID: 'ROADMAP_MISSING_ID',
  ROADMAP_MISSING_LABEL: 'ROADMAP_MISSING_LABEL',
  ROADMAP_MISSING_ENTRY: 'ROADMAP_MISSING_ENTRY',
  ROADMAP_MISSING_COMPLETION: 'ROADMAP_MISSING_COMPLETION',
  ROADMAP_MISSING_RATIONALE: 'ROADMAP_MISSING_RATIONALE',
  ROADMAP_MISSING_PROVIDED_BY: 'ROADMAP_MISSING_PROVIDED_BY',
  ROADMAP_MISSING_REGISTRY_ID: 'ROADMAP_MISSING_REGISTRY_ID',
  ROADMAP_MISSING_GRAPH_ID: 'ROADMAP_MISSING_GRAPH_ID',
  ROADMAP_TRACE_NOT_DETERMINISTIC: 'ROADMAP_TRACE_NOT_DETERMINISTIC',
  ROADMAP_TRACE_RANDOM_USED: 'ROADMAP_TRACE_RANDOM_USED',
  ROADMAP_TRACE_TIME_DEPENDENCY: 'ROADMAP_TRACE_TIME_DEPENDENCY',
  ROADMAP_TRACE_CURRICULUM_MUTATED: 'ROADMAP_TRACE_CURRICULUM_MUTATED',
} as const;

// ---------------------------------------------------------------------------
// Roadmap Node Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curriculum roadmap node against canonical invariants.
 * Pure function. No side effects.
 */
export function validateRoadmapNode(
  node: CurriculumRoadmapNode,
  graphNodeIds: readonly string[],
): readonly CurriculumRoadmapValidationError[] {
  const errors: CurriculumRoadmapValidationError[] = [];

  if (!node.roadmapNodeId || node.roadmapNodeId.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_ID,
      message: 'Curriculum roadmap node is missing a roadmap node ID.',
      field: 'roadmapNodeId',
      nodeId: node.roadmapNodeId,
    });
  }

  if (!node.curriculumNodeId || node.curriculumNodeId.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_INVALID_REFERENCE,
      message: 'Curriculum roadmap node is missing a curriculum node ID.',
      field: 'curriculumNodeId',
      nodeId: node.roadmapNodeId,
    });
  }

  // Node existence check
  if (node.curriculumNodeId && !graphNodeIds.includes(node.curriculumNodeId)) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_INVALID_REFERENCE,
      message: `Curriculum roadmap node references non-existent curriculum node: "${node.curriculumNodeId}".`,
      field: 'curriculumNodeId',
      nodeId: node.roadmapNodeId,
    });
  }

  if (!CANONICAL_ROADMAP_STAGES.includes(node.stage)) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_UNKNOWN_STAGE,
      message: `Curriculum roadmap node has unsupported stage: "${node.stage}".`,
      field: 'stage',
      nodeId: node.roadmapNodeId,
    });
  }

  if (!node.source || node.source.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_SOURCE,
      message: 'Curriculum roadmap node is missing a source.',
      field: 'source',
      nodeId: node.roadmapNodeId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(node.governanceStatus)) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_INVALID_STATUS,
      message: `Curriculum roadmap node has invalid governance status: "${node.governanceStatus}".`,
      field: 'governanceStatus',
      nodeId: node.roadmapNodeId,
    });
  }

  if (!node.rationale || node.rationale.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_RATIONALE,
      message: 'Curriculum roadmap node is missing a rationale.',
      field: 'rationale',
      nodeId: node.roadmapNodeId,
    });
  }

  if (!node.providedBy || node.providedBy.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_PROVIDED_BY,
      message: 'Curriculum roadmap node is missing a providedBy.',
      field: 'providedBy',
      nodeId: node.roadmapNodeId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Roadmap Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curriculum roadmap against canonical invariants.
 * Pure function. No side effects.
 */
export function validateRoadmap(
  roadmap: CurriculumRoadmap,
  graphNodeIds: readonly string[],
): readonly CurriculumRoadmapValidationError[] {
  const errors: CurriculumRoadmapValidationError[] = [];

  if (!roadmap.roadmapId || roadmap.roadmapId.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_ID,
      message: 'Curriculum roadmap is missing a roadmap ID.',
      field: 'roadmapId',
      roadmapId: roadmap.roadmapId,
    });
  }

  if (!CANONICAL_ROADMAP_TYPES.includes(roadmap.roadmapType)) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_UNKNOWN_TYPE,
      message: `Curriculum roadmap has unsupported roadmap type: "${roadmap.roadmapType}".`,
      field: 'roadmapType',
      roadmapId: roadmap.roadmapId,
    });
  }

  if (!roadmap.roadmapLabel || roadmap.roadmapLabel.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_LABEL,
      message: 'Curriculum roadmap is missing a roadmap label.',
      field: 'roadmapLabel',
      roadmapId: roadmap.roadmapId,
    });
  }

  // Empty roadmap check
  if (!roadmap.nodes || roadmap.nodes.length === 0) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_EMPTY_PATH,
      message: 'Curriculum roadmap has no nodes.',
      field: 'nodes',
      roadmapId: roadmap.roadmapId,
    });
  }

  // Entry node validation
  if (!roadmap.entryNodeId || roadmap.entryNodeId.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_ENTRY,
      message: 'Curriculum roadmap is missing an entry node ID.',
      field: 'entryNodeId',
      roadmapId: roadmap.roadmapId,
    });
  } else if (roadmap.nodes && roadmap.nodes.length > 0) {
    const entryNode = roadmap.nodes.find((n) => n.curriculumNodeId === roadmap.entryNodeId);
    if (!entryNode) {
      errors.push({
        code: ROADMAP_VALIDATION_CODES.ROADMAP_INVALID_ENTRY,
        message: `Curriculum roadmap entry node "${roadmap.entryNodeId}" is not in roadmap nodes.`,
        field: 'entryNodeId',
        roadmapId: roadmap.roadmapId,
        nodeId: roadmap.entryNodeId,
      });
    } else if (entryNode.stage !== 'entry') {
      errors.push({
        code: ROADMAP_VALIDATION_CODES.ROADMAP_INVALID_ENTRY,
        message: `Curriculum roadmap entry node "${roadmap.entryNodeId}" does not have stage "entry".`,
        field: 'entryNodeId',
        roadmapId: roadmap.roadmapId,
        nodeId: roadmap.entryNodeId,
      });
    }
  }

  // Completion node validation
  if (!roadmap.completionNodeId || roadmap.completionNodeId.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_COMPLETION,
      message: 'Curriculum roadmap is missing a completion node ID.',
      field: 'completionNodeId',
      roadmapId: roadmap.roadmapId,
    });
  } else if (roadmap.nodes && roadmap.nodes.length > 0) {
    const completionNode = roadmap.nodes.find(
      (n) => n.curriculumNodeId === roadmap.completionNodeId,
    );
    if (!completionNode) {
      errors.push({
        code: ROADMAP_VALIDATION_CODES.ROADMAP_INVALID_TERMINAL,
        message: `Curriculum roadmap completion node "${roadmap.completionNodeId}" is not in roadmap nodes.`,
        field: 'completionNodeId',
        roadmapId: roadmap.roadmapId,
        nodeId: roadmap.completionNodeId,
      });
    } else if (completionNode.stage !== 'completion') {
      errors.push({
        code: ROADMAP_VALIDATION_CODES.ROADMAP_INVALID_TERMINAL,
        message: `Curriculum roadmap completion node "${roadmap.completionNodeId}" does not have stage "completion".`,
        field: 'completionNodeId',
        roadmapId: roadmap.roadmapId,
        nodeId: roadmap.completionNodeId,
      });
    }
  }

  // Stage order validation: stages cannot regress
  if (roadmap.nodes && roadmap.nodes.length > 1) {
    const sortedNodes = [...roadmap.nodes].sort((a, b) => a.nodeOrder - b.nodeOrder);
    for (let i = 1; i < sortedNodes.length; i++) {
      const prevStage = _getStageOrder(sortedNodes[i - 1].stage);
      const currStage = _getStageOrder(sortedNodes[i].stage);
      if (currStage < prevStage) {
        errors.push({
          code: ROADMAP_VALIDATION_CODES.ROADMAP_INVALID_ORDER,
          message: `Curriculum roadmap has regressing stage order: node "${sortedNodes[i].roadmapNodeId}" (stage "${sortedNodes[i].stage}") follows node "${sortedNodes[i - 1].roadmapNodeId}" (stage "${sortedNodes[i - 1].stage}").`,
          field: 'nodes',
          roadmapId: roadmap.roadmapId,
          nodeId: sortedNodes[i].roadmapNodeId,
        });
      }
    }
  }

  // Duplicate node check in roadmap
  if (roadmap.nodes) {
    const seenNodeIds = new Set<string>();
    for (const node of roadmap.nodes) {
      if (seenNodeIds.has(node.curriculumNodeId)) {
        errors.push({
          code: ROADMAP_VALIDATION_CODES.ROADMAP_DUPLICATE_NODE,
          message: `Curriculum roadmap has duplicate curriculum node ID: "${node.curriculumNodeId}".`,
          field: 'nodes',
          roadmapId: roadmap.roadmapId,
          nodeId: node.curriculumNodeId,
        });
      }
      seenNodeIds.add(node.curriculumNodeId);
    }
  }

  // Validate each node
  if (roadmap.nodes) {
    for (const node of roadmap.nodes) {
      errors.push(...validateRoadmapNode(node, graphNodeIds));
    }
  }

  if (!roadmap.source || roadmap.source.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_SOURCE,
      message: 'Curriculum roadmap is missing a source.',
      field: 'source',
      roadmapId: roadmap.roadmapId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(roadmap.governanceStatus)) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_INVALID_STATUS,
      message: `Curriculum roadmap has invalid governance status: "${roadmap.governanceStatus}".`,
      field: 'governanceStatus',
      roadmapId: roadmap.roadmapId,
    });
  }

  if (!roadmap.rationale || roadmap.rationale.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_RATIONALE,
      message: 'Curriculum roadmap is missing a rationale.',
      field: 'rationale',
      roadmapId: roadmap.roadmapId,
    });
  }

  if (!roadmap.providedBy || roadmap.providedBy.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_PROVIDED_BY,
      message: 'Curriculum roadmap is missing a providedBy.',
      field: 'providedBy',
      roadmapId: roadmap.roadmapId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Roadmap Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum roadmap registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateRoadmapRegistry(
  registry: CurriculumRoadmapRegistry,
  graphNodeIds: readonly string[],
): CurriculumRoadmapValidationResult {
  const errors: CurriculumRoadmapValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_REGISTRY_ID,
      message: 'Curriculum roadmap registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.graphId || registry.graphId.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_GRAPH_ID,
      message: 'Curriculum roadmap registry is missing a graph ID.',
      field: 'graphId',
    });
  }

  // Empty registry check
  if (registry.roadmaps.length === 0) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_EMPTY_REGISTRY,
      message: 'Curriculum roadmap registry has no roadmaps.',
      field: 'roadmaps',
    });
  }

  // Duplicate roadmap ID check
  const seenRoadmapIds = new Set<string>();
  for (const roadmap of registry.roadmaps) {
    if (seenRoadmapIds.has(roadmap.roadmapId)) {
      errors.push({
        code: ROADMAP_VALIDATION_CODES.ROADMAP_DUPLICATE_ID,
        message: `Duplicate roadmap ID: "${roadmap.roadmapId}".`,
        roadmapId: roadmap.roadmapId,
      });
    }
    seenRoadmapIds.add(roadmap.roadmapId);
  }

  // Validate each roadmap
  for (const roadmap of registry.roadmaps) {
    errors.push(...validateRoadmap(roadmap, graphNodeIds));
  }

  // Deterministic metadata check
  if (registry.deterministic !== true) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum roadmap registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_TRACE_RANDOM_USED,
      message: 'Curriculum roadmap registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum roadmap registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_roadmap_orchestration',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Roadmaps Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum artifact with roadmaps against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumArtifactWithRoadmaps(
  artifact: CurriculumArtifactWithRoadmaps,
): CurriculumRoadmapValidationResult {
  const errors: CurriculumRoadmapValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_PROVENANCE,
      message: 'Curriculum artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate roadmap registry
  if (artifact.roadmapRegistry && artifact.graph) {
    const graphNodeIds = artifact.graph.nodes.map((n) => n.nodeId);
    const registryResult = validateRoadmapRegistry(
      artifact.roadmapRegistry,
      graphNodeIds,
    );
    errors.push(...registryResult.errors);
  }

  // Deterministic metadata check
  if (artifact.deterministic !== true) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum artifact must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (artifact.randomUsed !== false) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_TRACE_RANDOM_USED,
      message: 'Curriculum artifact must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (artifact.timeDependency !== false) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum artifact must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_roadmap_orchestration',
  };
}

// ---------------------------------------------------------------------------
// Roadmap Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates curriculum roadmap input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateRoadmapInput(
  input: CurriculumRoadmapInput,
  graphNodeIds: readonly string[],
): readonly CurriculumRoadmapValidationError[] {
  const errors: CurriculumRoadmapValidationError[] = [];

  if (!input.registryId || input.registryId.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_REGISTRY_ID,
      message: 'Curriculum roadmap input is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!input.graphId || input.graphId.trim() === '') {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_MISSING_GRAPH_ID,
      message: 'Curriculum roadmap input is missing a graph ID.',
      field: 'graphId',
    });
  }

  if (!input.roadmaps || input.roadmaps.length === 0) {
    errors.push({
      code: ROADMAP_VALIDATION_CODES.ROADMAP_EMPTY_REGISTRY,
      message: 'Curriculum roadmap input has no roadmaps.',
      field: 'roadmaps',
    });
  } else {
    for (const roadmap of input.roadmaps) {
      errors.push(...validateRoadmap(roadmap, graphNodeIds));
    }
  }

  return errors;
}
