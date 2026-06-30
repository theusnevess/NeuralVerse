/**
 * NV-1300-D3D — Curriculum Capability Matrix
 *
 * Exposes D3A/D3B/D3C/D3D capability coverage:
 * - Maps each capability to module, API, validation status, governance status
 * - Generates a stable capability matrix for audits
 *
 * Read-only, deterministic, no learner inference.
 */

const CAPABILITY_DEFINITIONS = [
  // D3A - Structure
  { id: 'structure_guardian', group: 'structure', module: 'curriculum-structure-guardian.js', api: 'validateStructure', phase: 'D3A' },
  { id: 'structure_ownership', group: 'structure', module: 'curriculum-structure-guardian.js', api: 'validateOwnership', phase: 'D3A' },
  { id: 'structure_orphans', group: 'structure', module: 'curriculum-structure-guardian.js', api: 'getOrphans', phase: 'D3A' },
  { id: 'structure_broken_refs', group: 'structure', module: 'curriculum-structure-guardian.js', api: 'getBrokenReferences', phase: 'D3A' },
  { id: 'structure_reachability', group: 'structure', module: 'curriculum-structure-guardian.js', api: 'getReachabilityReport', phase: 'D3A' },

  // D3A - Dependencies
  { id: 'dependency_graph_validation', group: 'dependencies', module: 'dependency-graph-validator.js', api: 'validateGraph', phase: 'D3A' },
  { id: 'dependency_cycle_detection', group: 'dependencies', module: 'dependency-graph-validator.js', api: 'detectCycles', phase: 'D3A' },
  { id: 'dependency_self_detection', group: 'dependencies', module: 'dependency-graph-validator.js', api: 'detectSelfDependencies', phase: 'D3A' },
  { id: 'dependency_duplicate_detection', group: 'dependencies', module: 'dependency-graph-validator.js', api: 'detectDuplicateEdges', phase: 'D3A' },
  { id: 'dependency_topological_sort', group: 'dependencies', module: 'dependency-graph-validator.js', api: 'topologicalSort', phase: 'D3A' },

  // D3A - Typed Dependencies
  { id: 'typed_dependency_normalization', group: 'typed_dependencies', module: 'typed-dependency-engine.js', api: 'normalizeDependencyType', phase: 'D3A' },
  { id: 'typed_dependency_validation', group: 'typed_dependencies', module: 'typed-dependency-engine.js', api: 'validateDependencyType', phase: 'D3A' },
  { id: 'typed_dependency_classification', group: 'typed_dependencies', module: 'typed-dependency-engine.js', api: 'classifyDependency', phase: 'D3A' },
  { id: 'typed_dependency_filtering', group: 'typed_dependencies', module: 'typed-dependency-engine.js', api: 'filterByType', phase: 'D3A' },

  // D3A - Concept Prerequisites
  { id: 'concept_prerequisite_resolution', group: 'concept_prerequisites', module: 'concept-prerequisite-engine.js', api: 'getPrerequisitesForConcept', phase: 'D3A' },
  { id: 'concept_prerequisite_chain', group: 'concept_prerequisites', module: 'concept-prerequisite-engine.js', api: 'buildConceptChain', phase: 'D3A' },
  { id: 'concept_prerequisite_validation', group: 'concept_prerequisites', module: 'concept-prerequisite-engine.js', api: 'validateConceptPrerequisites', phase: 'D3A' },

  // D3B - Goal Interpretation
  { id: 'goal_interpretation', group: 'goal_interpretation', module: 'goal-dependency-interpreter.js', api: 'interpretGoal', phase: 'D3B' },
  { id: 'goal_prerequisite_prioritization', group: 'goal_interpretation', module: 'goal-dependency-interpreter.js', api: 'prioritizePrerequisites', phase: 'D3B' },
  { id: 'goal_priority_classification', group: 'goal_interpretation', module: 'goal-dependency-interpreter.js', api: 'classifyByPriority', phase: 'D3B' },

  // D3B - Justification
  { id: 'justification_generation', group: 'justification', module: 'dependency-justification-engine.js', api: 'buildJustification', phase: 'D3B' },
  { id: 'justification_validation', group: 'justification', module: 'dependency-justification-engine.js', api: 'validateJustification', phase: 'D3B' },
  { id: 'justification_explanation', group: 'justification', module: 'dependency-justification-engine.js', api: 'explainDependency', phase: 'D3B' },

  // D3B - Depth Metadata
  { id: 'depth_level_validation', group: 'depth_metadata', module: 'prerequisite-depth-engine.js', api: 'validateDepthLevel', phase: 'D3B' },
  { id: 'depth_level_normalization', group: 'depth_metadata', module: 'prerequisite-depth-engine.js', api: 'normalizeDepthLevel', phase: 'D3B' },
  { id: 'depth_level_comparison', group: 'depth_metadata', module: 'prerequisite-depth-engine.js', api: 'compareDepthLevels', phase: 'D3B' },

  // D3B - Priority
  { id: 'priority_computation', group: 'priority', module: 'goal-priority-engine.js', api: 'computePriority', phase: 'D3B' },
  { id: 'priority_categorization', group: 'priority', module: 'goal-priority-engine.js', api: 'categorizeScore', phase: 'D3B' },

  // D3C - Progression
  { id: 'progression_validation', group: 'progression', module: 'progression-continuity-engine.js', api: 'validateProgression', phase: 'D3C' },
  { id: 'progression_concept_jumps', group: 'progression', module: 'progression-continuity-engine.js', api: 'detectConceptJumps', phase: 'D3C' },
  { id: 'progression_missing_steps', group: 'progression', module: 'progression-continuity-engine.js', api: 'detectMissingSteps', phase: 'D3C' },
  { id: 'progression_disconnected', group: 'progression', module: 'progression-continuity-engine.js', api: 'detectDisconnectedChains', phase: 'D3C' },

  // D3C - Redundancy
  { id: 'redundancy_concepts', group: 'redundancy', module: 'redundancy-detection-engine.js', api: 'findDuplicateConcepts', phase: 'D3C' },
  { id: 'redundancy_dependencies', group: 'redundancy', module: 'redundancy-detection-engine.js', api: 'findDuplicateDependencies', phase: 'D3C' },
  { id: 'redundancy_artifacts', group: 'redundancy', module: 'redundancy-detection-engine.js', api: 'findDuplicateArtifacts', phase: 'D3C' },

  // D3C - Coverage
  { id: 'coverage_verification', group: 'coverage', module: 'curriculum-coverage-verifier.js', api: 'verifyCoverage', phase: 'D3C' },
  { id: 'coverage_unsupported', group: 'coverage', module: 'curriculum-coverage-verifier.js', api: 'findUnsupportedObjectives', phase: 'D3C' },

  // D3C - Unlock Maps
  { id: 'unlock_map_generation', group: 'unlock_maps', module: 'goal-unlock-map-generator.js', api: 'generateUnlockMap', phase: 'D3C' },
  { id: 'unlock_map_critical_path', group: 'unlock_maps', module: 'goal-unlock-map-generator.js', api: 'generateConceptRoadmap', phase: 'D3C' },

  // D3C - Health
  { id: 'health_analysis', group: 'health', module: 'curriculum-health-analyzer.js', api: 'analyzeHealth', phase: 'D3C' },
  { id: 'health_metrics', group: 'health', module: 'curriculum-health-analyzer.js', api: 'computeMetrics', phase: 'D3C' },
  { id: 'health_score', group: 'health', module: 'curriculum-health-analyzer.js', api: 'computeHealthScore', phase: 'D3C' },

  // D3D - Reporting
  { id: 'unified_report', group: 'reporting', module: 'unified-curriculum-report-composer.js', api: 'composeUnifiedReport', phase: 'D3D' },
  { id: 'report_validation', group: 'reporting', module: 'unified-curriculum-report-composer.js', api: 'validateUnifiedReport', phase: 'D3D' },

  // D3D - Governance
  { id: 'capability_matrix', group: 'governance', module: 'curriculum-capability-matrix.js', api: 'buildMatrix', phase: 'D3D' },
  { id: 'certification_runner', group: 'governance', module: 'curriculum-certification-runner.js', api: 'runCertification', phase: 'D3D' },
  { id: 'agent_facade', group: 'governance', module: 'curriculum-agent-facade.js', api: 'validateCurriculum', phase: 'D3D' },

  // D3D - Determinism
  { id: 'deterministic_structure', group: 'determinism', module: 'curriculum-structure-guardian.js', api: 'validateStructure', phase: 'D3A', deterministic: true },
  { id: 'deterministic_dependencies', group: 'determinism', module: 'dependency-graph-validator.js', api: 'validateGraph', phase: 'D3A', deterministic: true },
  { id: 'deterministic_goals', group: 'determinism', module: 'goal-dependency-interpreter.js', api: 'interpretGoal', phase: 'D3B', deterministic: true },
  { id: 'deterministic_progression', group: 'determinism', module: 'progression-continuity-engine.js', api: 'validateProgression', phase: 'D3C', deterministic: true }
];

const GROUP_NAMES = {
  structure: 'Structure',
  dependencies: 'Dependencies',
  typed_dependencies: 'Typed Dependencies',
  concept_prerequisites: 'Concept Prerequisites',
  goal_interpretation: 'Goal Interpretation',
  justification: 'Justification',
  depth_metadata: 'Depth Metadata',
  priority: 'Priority',
  progression: 'Progression',
  redundancy: 'Redundancy',
  coverage: 'Coverage',
  unlock_maps: 'Unlock Maps',
  health: 'Health',
  reporting: 'Reporting',
  governance: 'Governance',
  determinism: 'Determinism'
};

function createCurriculumCapabilityMatrix() {

  function getCapabilities() {
    return {
      name: 'CurriculumCapabilityMatrix',
      version: '1.0.0',
      methods: [
        'buildMatrix',
        'getCapability',
        'listCapabilities',
        'validateMatrix',
        'summarizeCoverage',
        'getCapabilities'
      ]
    };
  }

  function buildMatrix() {
    const capabilities = CAPABILITY_DEFINITIONS.map(cap => ({
      ...cap,
      groupName: GROUP_NAMES[cap.group] || cap.group,
      validationStatus: 'implemented',
      governanceStatus: 'read-only',
      deterministic: cap.deterministic !== false
    }));

    return {
      valid: true,
      capabilities,
      groups: Object.keys(GROUP_NAMES),
      totalCapabilities: capabilities.length,
      byGroup: groupByGroup(capabilities),
      byPhase: groupByPhase(capabilities)
    };
  }

  function getCapability(id) {
    const cap = CAPABILITY_DEFINITIONS.find(c => c.id === id);
    if (!cap) {
      return { valid: false, error: 'Capability not found' };
    }
    return {
      valid: true,
      capability: {
        ...cap,
        groupName: GROUP_NAMES[cap.group] || cap.group,
        validationStatus: 'implemented',
        governanceStatus: 'read-only',
        deterministic: cap.deterministic !== false
      }
    };
  }

  function listCapabilities() {
    return CAPABILITY_DEFINITIONS.map(c => ({
      id: c.id,
      group: c.group,
      phase: c.phase
    }));
  }

  function validateMatrix(matrix) {
    if (!matrix || typeof matrix !== 'object') {
      return { valid: false, errors: ['Invalid matrix'] };
    }

    const errors = [];

    if (!matrix.capabilities || !Array.isArray(matrix.capabilities)) {
      errors.push('Missing capabilities array');
    }

    if (matrix.totalCapabilities === undefined) {
      errors.push('Missing totalCapabilities');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  function summarizeCoverage(matrix) {
    if (!matrix || !matrix.capabilities) {
      return { total: 0, byGroup: {}, byPhase: {} };
    }

    return {
      total: matrix.capabilities.length,
      byGroup: matrix.byGroup || {},
      byPhase: matrix.byPhase || {},
      groupsCovered: Object.keys(matrix.byGroup || {}).length,
      totalGroups: Object.keys(GROUP_NAMES).length
    };
  }

  function groupByGroup(capabilities) {
    const grouped = {};
    for (const cap of capabilities) {
      if (!grouped[cap.group]) grouped[cap.group] = [];
      grouped[cap.group].push(cap);
    }
    return grouped;
  }

  function groupByPhase(capabilities) {
    const grouped = {};
    for (const cap of capabilities) {
      if (!grouped[cap.phase]) grouped[cap.phase] = [];
      grouped[cap.phase].push(cap);
    }
    return grouped;
  }

  return {
    getCapabilities,
    buildMatrix,
    getCapability,
    listCapabilities,
    validateMatrix,
    summarizeCoverage
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.curriculumCapabilityMatrix = createCurriculumCapabilityMatrix();
}

export { createCurriculumCapabilityMatrix };
