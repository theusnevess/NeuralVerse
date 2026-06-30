/**
 * NV-1400-D2-OPT-09 — Reading Path Validation Layer
 *
 * Deterministic validation for research reading path metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchReadingPath,
  ResearchReadingPathNode,
  ResearchReadingPathRegistry,
  ResearchArtifactWithReadingPaths,
  ResearchReadingPathValidationError,
  ResearchReadingPathValidationResult,
  ResearchReadingPathInput,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_READING_PATH_TYPES,
  CANONICAL_READING_PATH_STAGES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const READING_PATH_VALIDATION_CODES = {
  READING_PATH_UNKNOWN_TYPE: 'READING_PATH_UNKNOWN_TYPE',
  READING_PATH_UNKNOWN_STAGE: 'READING_PATH_UNKNOWN_STAGE',
  READING_PATH_DUPLICATE_NODE: 'READING_PATH_DUPLICATE_NODE',
  READING_PATH_DUPLICATE_PATH: 'READING_PATH_DUPLICATE_PATH',
  READING_PATH_INVALID_ORDER: 'READING_PATH_INVALID_ORDER',
  READING_PATH_MISSING_PROVENANCE: 'READING_PATH_MISSING_PROVENANCE',
  READING_PATH_INVALID_REFERENCE: 'READING_PATH_INVALID_REFERENCE',
  READING_PATH_EMPTY_PATH: 'READING_PATH_EMPTY_PATH',
  READING_PATH_EMPTY_REGISTRY: 'READING_PATH_EMPTY_REGISTRY',
  READING_PATH_NON_DETERMINISTIC_ORDER: 'READING_PATH_NON_DETERMINISTIC_ORDER',
  READING_PATH_MISSING_SOURCE: 'READING_PATH_MISSING_SOURCE',
  READING_PATH_MISSING_EVIDENCE: 'READING_PATH_MISSING_EVIDENCE',
  READING_PATH_INVALID_STATUS: 'READING_PATH_INVALID_STATUS',
} as const;

// ---------------------------------------------------------------------------
// Node Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single reading path node.
 * Pure function. No side effects.
 */
export function validateReadingPathNode(
  node: ResearchReadingPathNode,
): readonly ResearchReadingPathValidationError[] {
  const errors: ResearchReadingPathValidationError[] = [];

  if (!node.nodeId || node.nodeId.trim() === '') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_SOURCE,
      message: 'Reading path node is missing an ID.',
      field: 'nodeId',
      pathId: node.nodeId,
    });
  }

  if (!node.referenceId || node.referenceId.trim() === '') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_INVALID_REFERENCE,
      message: 'Reading path node is missing a reference ID.',
      field: 'referenceId',
      pathId: node.nodeId,
    });
  }

  if (!node.title || node.title.trim() === '') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_SOURCE,
      message: 'Reading path node is missing a title.',
      field: 'title',
      pathId: node.nodeId,
    });
  }

  if (!CANONICAL_READING_PATH_STAGES.includes(node.stage)) {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_UNKNOWN_STAGE,
      message: `Reading path node has unknown stage: "${node.stage}".`,
      field: 'stage',
      pathId: node.nodeId,
    });
  }

  if (typeof node.order !== 'number' || node.order < 0) {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_INVALID_ORDER,
      message: 'Reading path node has invalid order.',
      field: 'order',
      pathId: node.nodeId,
    });
  }

  if (typeof node.publicationYear !== 'number' || node.publicationYear < 0) {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_SOURCE,
      message: 'Reading path node has invalid publication year.',
      field: 'publicationYear',
      pathId: node.nodeId,
    });
  }

  if (!node.governanceStatus || node.governanceStatus.trim() === '') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_INVALID_STATUS,
      message: 'Reading path node is missing governance status.',
      field: 'governanceStatus',
      pathId: node.nodeId,
    });
  }

  if (!node.rationale || node.rationale.trim() === '') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_SOURCE,
      message: 'Reading path node is missing a rationale.',
      field: 'rationale',
      pathId: node.nodeId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Path Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single reading path.
 * Pure function. No side effects.
 */
export function validateReadingPath(
  path: ResearchReadingPath,
): readonly ResearchReadingPathValidationError[] {
  const errors: ResearchReadingPathValidationError[] = [];

  if (!path.pathId || path.pathId.trim() === '') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_SOURCE,
      message: 'Reading path is missing an ID.',
      field: 'pathId',
      pathId: path.pathId,
    });
  }

  if (!CANONICAL_READING_PATH_TYPES.includes(path.pathType)) {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_UNKNOWN_TYPE,
      message: `Reading path has unknown type: "${path.pathType}".`,
      field: 'pathType',
      pathId: path.pathId,
    });
  }

  if (!path.title || path.title.trim() === '') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_SOURCE,
      message: 'Reading path is missing a title.',
      field: 'title',
      pathId: path.pathId,
    });
  }

  if (!path.description || path.description.trim() === '') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_SOURCE,
      message: 'Reading path is missing a description.',
      field: 'description',
      pathId: path.pathId,
    });
  }

  // Validate nodes
  if (!path.orderedNodes || path.orderedNodes.length === 0) {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_EMPTY_PATH,
      message: 'Reading path has no nodes.',
      field: 'orderedNodes',
      pathId: path.pathId,
    });
  } else {
    // Validate each node
    for (const node of path.orderedNodes) {
      errors.push(...validateReadingPathNode(node));
    }

    // Check for duplicate node IDs
    const seenNodeIds = new Set<string>();
    for (const node of path.orderedNodes) {
      if (seenNodeIds.has(node.nodeId)) {
        errors.push({
          code: READING_PATH_VALIDATION_CODES.READING_PATH_DUPLICATE_NODE,
          message: `Duplicate node ID: "${node.nodeId}".`,
          field: 'orderedNodes',
          pathId: path.pathId,
        });
      }
      seenNodeIds.add(node.nodeId);
    }

    // Check for deterministic ordering
    const isDeterministic = _checkDeterministicOrdering(path.orderedNodes);
    if (!isDeterministic) {
      errors.push({
        code: READING_PATH_VALIDATION_CODES.READING_PATH_NON_DETERMINISTIC_ORDER,
        message: 'Reading path nodes are not in deterministic order.',
        field: 'orderedNodes',
        pathId: path.pathId,
      });
    }
  }

  if (!path.associatedEvidence || path.associatedEvidence.length === 0) {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_EVIDENCE,
      message: 'Reading path has no associated evidence.',
      field: 'associatedEvidence',
      pathId: path.pathId,
    });
  }

  if (!path.provenance || typeof path.provenance !== 'object') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_PROVENANCE,
      message: 'Reading path is missing provenance.',
      field: 'provenance',
      pathId: path.pathId,
    });
  } else {
    if (!path.provenance.rationale || path.provenance.rationale.trim() === '') {
      errors.push({
        code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_PROVENANCE,
        message: 'Reading path provenance is missing rationale.',
        field: 'provenance.rationale',
        pathId: path.pathId,
      });
    }
    if (!path.provenance.source || path.provenance.source.trim() === '') {
      errors.push({
        code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_PROVENANCE,
        message: 'Reading path provenance is missing source.',
        field: 'provenance.source',
        pathId: path.pathId,
      });
    }
  }

  if (!path.governanceStatus || path.governanceStatus.trim() === '') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_INVALID_STATUS,
      message: 'Reading path is missing governance status.',
      field: 'governanceStatus',
      pathId: path.pathId,
    });
  }

  return errors;
}

/**
 * Checks if nodes are in deterministic order.
 * Order is determined by: order, then publicationYear, then nodeId.
 * Pure function. No side effects.
 */
function _checkDeterministicOrdering(
  nodes: readonly ResearchReadingPathNode[],
): boolean {
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];

    // Check if current order is valid
    if (curr.order < prev.order) {
      return false;
    }

    // If orders are equal, check publicationYear
    if (curr.order === prev.order) {
      if (curr.publicationYear < prev.publicationYear) {
        return false;
      }

      // If publicationYears are equal, check nodeId
      if (curr.publicationYear === prev.publicationYear) {
        if (curr.nodeId.localeCompare(prev.nodeId) < 0) {
          return false;
        }
      }
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a reading path registry for structural integrity.
 * Pure function. No side effects.
 */
export function validateReadingPathRegistry(
  registry: ResearchReadingPathRegistry,
): readonly ResearchReadingPathValidationError[] {
  const errors: ResearchReadingPathValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_SOURCE,
      message: 'Reading path registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  // Check for empty registry
  if (!registry.paths || registry.paths.length === 0) {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_EMPTY_REGISTRY,
      message: 'Reading path registry has no paths.',
      field: 'paths',
    });
  }

  // Validate all paths
  if (registry.paths) {
    for (const path of registry.paths) {
      errors.push(...validateReadingPath(path));
    }
  }

  // Check for duplicate path IDs
  if (registry.paths) {
    const seenPathIds = new Set<string>();
    for (const path of registry.paths) {
      if (seenPathIds.has(path.pathId)) {
        errors.push({
          code: READING_PATH_VALIDATION_CODES.READING_PATH_DUPLICATE_PATH,
          message: `Duplicate path ID: "${path.pathId}".`,
          pathId: path.pathId,
        });
      }
      seenPathIds.add(path.pathId);
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a research artifact with reading paths.
 * Pure function. No side effects.
 */
export function validateResearchArtifactWithReadingPaths(
  artifact: ResearchArtifactWithReadingPaths,
): ResearchReadingPathValidationResult {
  const errors: ResearchReadingPathValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_SOURCE,
      message: 'Research artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate reading path registry
  errors.push(...validateReadingPathRegistry(artifact.readingPathRegistry));

  // Validate trace
  if (!artifact.readingPathTrace || typeof artifact.readingPathTrace !== 'object') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_PROVENANCE,
      message: 'Research artifact is missing reading path trace.',
      field: 'readingPathTrace',
    });
  } else {
    if (artifact.readingPathTrace.deterministic !== true) {
      errors.push({
        code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_PROVENANCE,
        message: 'Reading path trace must declare deterministic: true.',
        field: 'readingPathTrace.deterministic',
      });
    }
    if (artifact.readingPathTrace.randomUsed !== false) {
      errors.push({
        code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_PROVENANCE,
        message: 'Reading path trace must declare randomUsed: false.',
        field: 'readingPathTrace.randomUsed',
      });
    }
    if (artifact.readingPathTrace.timeDependency !== false) {
      errors.push({
        code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_PROVENANCE,
        message: 'Reading path trace must declare timeDependency: false.',
        field: 'readingPathTrace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'reading_path_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates research reading path input.
 * Pure function. No side effects.
 */
export function validateReadingPathInput(
  input: ResearchReadingPathInput,
): readonly ResearchReadingPathValidationError[] {
  const errors: ResearchReadingPathValidationError[] = [];

  if (!input.conceptId || input.conceptId.trim() === '') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_SOURCE,
      message: 'Reading path input is missing concept ID.',
      field: 'conceptId',
    });
  }

  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_MISSING_SOURCE,
      message: 'Reading path input is missing concept label.',
      field: 'conceptLabel',
    });
  }

  if (!input.paths || input.paths.length === 0) {
    errors.push({
      code: READING_PATH_VALIDATION_CODES.READING_PATH_EMPTY_REGISTRY,
      message: 'Reading path input has no paths.',
      field: 'paths',
    });
  } else {
    for (const path of input.paths) {
      errors.push(...validateReadingPath(path));
    }
  }

  return errors;
}
