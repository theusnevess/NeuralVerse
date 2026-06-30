/**
 * NV-1300-D1-OPT-02 — Deterministic Prerequisite Analyzer
 *
 * Pure deterministic function that analyzes governed dependency metadata
 * and produces prerequisite decisions for lesson composition.
 *
 * Rules:
 * - required missing prerequisite → block_or_recap_required
 * - recommended missing prerequisite → insert_recap
 * - optional_background missing → add_context_note
 * - enrichment missing → add_forward_connection
 * - co_requisite missing → insert_parallel_context
 * - known/encountered prerequisite → none
 * - unknown prerequisite status → validation warning (never inferred)
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 * Does not mutate dependency graph, curriculum, or input objects.
 */

import type {
  DidacticDependencyGraph,
  DidacticLessonInput,
  DidacticPrerequisiteDecision,
  DidacticPrerequisiteReference,
  DidacticPrerequisiteStatus,
  DidacticPrerequisiteSupportAction,
  DidacticDependencyTrace,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Valid dependency types and required depths (for validation)
// ---------------------------------------------------------------------------

const VALID_DEPENDENCY_TYPES = new Set<string>([
  'required',
  'recommended',
  'optional_background',
  'enrichment',
  'co_requisite',
]);

const VALID_REQUIRED_DEPTHS = new Set<string>([
  'awareness',
  'basic_understanding',
  'working_knowledge',
  'advanced_understanding',
  'mastery',
]);

// ---------------------------------------------------------------------------
// Pure deterministic prerequisite status resolution
// ---------------------------------------------------------------------------

function _resolvePrerequisiteStatus(
  prereq: DidacticPrerequisiteReference,
  conceptIds: readonly string[],
  encounteredList: readonly string[],
): DidacticPrerequisiteStatus {
  const prereqId = prereq.conceptId;

  // Check if the prerequisite concept is in the lesson's concept list
  for (let i = 0; i < conceptIds.length; i++) {
    if (conceptIds[i] === prereqId) {
      return 'known';
    }
  }

  // Check if the prerequisite has been encountered (e.g., in a prior lesson)
  for (let i = 0; i < encounteredList.length; i++) {
    if (encounteredList[i] === prereqId) {
      return 'known';
    }
  }

  // Not found anywhere — status is missing
  // (unknown would require explicit marking in the dependency graph)
  return 'missing';
}

// ---------------------------------------------------------------------------
// Pure deterministic support action mapping
// ---------------------------------------------------------------------------

function _mapDependencyTypeToAction(
  dependencyType: DidacticPrerequisiteReference['dependencyType'],
  status: DidacticPrerequisiteStatus,
): DidacticPrerequisiteSupportAction {
  if (status === 'known') {
    return 'none';
  }

  switch (dependencyType) {
    case 'required':
      return 'block_or_recap_required';
    case 'recommended':
      return 'insert_recap';
    case 'optional_background':
      return 'add_context_note';
    case 'enrichment':
      return 'add_forward_connection';
    case 'co_requisite':
      return 'insert_parallel_context';
    default:
      // Unknown dependency type — should not happen if graph is valid
      return 'none';
  }
}

// ---------------------------------------------------------------------------
// Core prerequisite analysis function
// ---------------------------------------------------------------------------

export function analyzePrerequisites(
  input: DidacticLessonInput,
  dependencyGraph: DidacticDependencyGraph,
): DidacticPrerequisiteDecision[] {
  if (!dependencyGraph || typeof dependencyGraph !== 'object') {
    return [];
  }

  if (!Array.isArray(dependencyGraph.prerequisites) || dependencyGraph.prerequisites.length === 0) {
    return [];
  }

  const conceptIds = input.conceptIds || [];
  const encounteredList = dependencyGraph.encounteredList || [];

  const decisions: DidacticPrerequisiteDecision[] = [];

  for (let i = 0; i < dependencyGraph.prerequisites.length; i++) {
    const prereq = dependencyGraph.prerequisites[i];

    // Find the concept label from the dependency graph
    let prereqLabel = prereq.label;
    if (!prereqLabel && Array.isArray(dependencyGraph.concepts)) {
      for (let j = 0; j < dependencyGraph.concepts.length; j++) {
        if (dependencyGraph.concepts[j].conceptId === prereq.conceptId) {
          prereqLabel = dependencyGraph.concepts[j].label;
          break;
        }
      }
    }

    const status = _resolvePrerequisiteStatus(prereq, conceptIds, encounteredList);
    const supportAction = _mapDependencyTypeToAction(prereq.dependencyType, status);

    decisions.push({
      conceptId: prereq.conceptId,
      prerequisiteConceptId: prereq.conceptId,
      prerequisiteLabel: prereqLabel || prereq.conceptId,
      dependencyType: prereq.dependencyType,
      requiredDepth: prereq.requiredDepth,
      status,
      supportAction,
      rationale: prereq.rationale,
      source: prereq.source,
    });
  }

  return decisions;
}

// ---------------------------------------------------------------------------
// Build dependency trace from decisions
// ---------------------------------------------------------------------------

export function buildDependencyTrace(
  conceptIds: readonly string[],
  decisions: readonly DidacticPrerequisiteDecision[],
): DidacticDependencyTrace {
  const blockedByMissingRequired: string[] = [];
  const recapsInserted: string[] = [];
  const contextNotesAdded: string[] = [];
  const forwardConnectionsAdded: string[] = [];
  const parallelContextsInserted: string[] = [];

  for (let i = 0; i < decisions.length; i++) {
    const d = decisions[i];
    switch (d.supportAction) {
      case 'block_or_recap_required':
        blockedByMissingRequired.push(d.prerequisiteConceptId);
        break;
      case 'insert_recap':
        recapsInserted.push(d.prerequisiteConceptId);
        break;
      case 'add_context_note':
        contextNotesAdded.push(d.prerequisiteConceptId);
        break;
      case 'add_forward_connection':
        forwardConnectionsAdded.push(d.prerequisiteConceptId);
        break;
      case 'insert_parallel_context':
        parallelContextsInserted.push(d.prerequisiteConceptId);
        break;
      default:
        break;
    }
  }

  return {
    conceptId: conceptIds.length > 0 ? conceptIds[0] : '',
    prerequisitesAnalyzed: decisions.length,
    decisions,
    blockedByMissingRequired,
    recapsInserted,
    contextNotesAdded,
    forwardConnectionsAdded,
    parallelContextsInserted,
  };
}

// ---------------------------------------------------------------------------
// Validation helpers (used by ValidationLayer)
// ---------------------------------------------------------------------------

export function validatePrerequisiteReference(
  prereq: DidacticPrerequisiteReference,
): string[] {
  const errors: string[] = [];

  if (!prereq.conceptId || prereq.conceptId.trim() === '') {
    errors.push('Prerequisite missing conceptId');
  }
  if (!prereq.label || prereq.label.trim() === '') {
    errors.push('Prerequisite missing label');
  }
  if (!prereq.rationale || prereq.rationale.trim() === '') {
    errors.push('Prerequisite missing rationale');
  }
  if (!prereq.source || prereq.source.trim() === '') {
    errors.push('Prerequisite missing source');
  }
  if (!VALID_DEPENDENCY_TYPES.has(prereq.dependencyType)) {
    errors.push(`Unsupported dependency type: "${prereq.dependencyType}"`);
  }
  if (!VALID_REQUIRED_DEPTHS.has(prereq.requiredDepth)) {
    errors.push(`Unsupported required depth: "${prereq.requiredDepth}"`);
  }

  return errors;
}

export function validateDependencyGraph(
  graph: DidacticDependencyGraph,
): string[] {
  const errors: string[] = [];

  if (!graph || typeof graph !== 'object') {
    return ['Dependency graph is not a valid object'];
  }

  if (!Array.isArray(graph.concepts)) {
    errors.push('Dependency graph missing concepts array');
  }
  if (!Array.isArray(graph.prerequisites)) {
    errors.push('Dependency graph missing prerequisites array');
  }

  if (Array.isArray(graph.prerequisites)) {
    for (let i = 0; i < graph.prerequisites.length; i++) {
      const prereqErrors = validatePrerequisiteReference(graph.prerequisites[i]);
      for (const err of prereqErrors) {
        errors.push(`Prerequisite[${i}]: ${err}`);
      }
    }
  }

  return errors;
}

export { VALID_DEPENDENCY_TYPES, VALID_REQUIRED_DEPTHS };
