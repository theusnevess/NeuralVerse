/**
 * NV-1300-D3D — Curriculum Agent Facade
 *
 * Provides a stable public facade over the D3 subsystem:
 * - Exposes a compact API for other agents
 * - Hides internal module complexity
 * - Preserves backwards compatibility
 * - Acts as read-only dependency provider
 *
 * Read-only, deterministic, no learner inference.
 */

function createCurriculumAgentFacade(deps = {}) {
  let lastResult = null;

  function getCapabilities() {
    return {
      name: 'CurriculumAgentFacade',
      version: '1.0.0',
      methods: [
        'validateCurriculum',
        'validateDependencies',
        'explainDependency',
        'interpretGoal',
        'analyzeProgression',
        'generateUnlockMap',
        'composeReport',
        'runCertification',
        'getCapabilityMatrix',
        'getLastResult',
        'getCapabilities'
      ]
    };
  }

  function validateCurriculum(input) {
    const structureGuardian = deps.structureGuardian;
    if (!structureGuardian) {
      return { valid: false, error: 'Structure guardian not available' };
    }

    const result = structureGuardian.validateStructure(input);
    lastResult = { method: 'validateCurriculum', result };
    return result;
  }

  function validateDependencies(input) {
    const graphValidator = deps.graphValidator;
    if (!graphValidator) {
      return { valid: false, error: 'Graph validator not available' };
    }

    const graph = {
      nodes: (input.concepts || []).map(c => ({ id: c.id })),
      edges: []
    };

    for (const concept of (input.concepts || [])) {
      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      for (const prereqId of prereqs) {
        graph.edges.push({ source: prereqId, target: concept.id });
      }
    }

    const result = graphValidator.validateGraph(graph);
    lastResult = { method: 'validateDependencies', result };
    return result;
  }

  function explainDependency(source, target, input) {
    const justificationEngine = deps.justificationEngine;
    if (!justificationEngine) {
      return { valid: false, error: 'Justification engine not available' };
    }

    const result = justificationEngine.explainDependency(source, target, null, input);
    lastResult = { method: 'explainDependency', result };
    return result;
  }

  function interpretGoal(goal, input) {
    const goalInterpreter = deps.goalInterpreter;
    if (!goalInterpreter) {
      return { valid: false, error: 'Goal interpreter not available' };
    }

    const result = goalInterpreter.interpretGoal(goal, input);
    lastResult = { method: 'interpretGoal', result };
    return result;
  }

  function analyzeProgression(input) {
    const progressionEngine = deps.progressionEngine;
    if (!progressionEngine) {
      return { valid: false, error: 'Progression engine not available' };
    }

    const result = progressionEngine.validateProgression(input);
    lastResult = { method: 'analyzeProgression', result };
    return result;
  }

  function generateUnlockMap(targetConcept, input) {
    const unlockMapGenerator = deps.unlockMapGenerator;
    if (!unlockMapGenerator) {
      return { valid: false, error: 'Unlock map generator not available' };
    }

    const result = unlockMapGenerator.generateUnlockMap(targetConcept, input);
    lastResult = { method: 'generateUnlockMap', result };
    return result;
  }

  function composeReport(input) {
    const reportComposer = deps.reportComposer;
    if (!reportComposer) {
      return { valid: false, error: 'Report composer not available' };
    }

    const result = reportComposer.composeUnifiedReport(input);
    lastResult = { method: 'composeReport', result };
    return result;
  }

  function runCertification(input) {
    const certificationRunner = deps.certificationRunner;
    if (!certificationRunner) {
      return { certified: false, error: 'Certification runner not available' };
    }

    const result = certificationRunner.runCertification(input);
    lastResult = { method: 'runCertification', result };
    return result;
  }

  function getCapabilityMatrix() {
    const capabilityMatrix = deps.capabilityMatrix;
    if (!capabilityMatrix) {
      return { valid: false, error: 'Capability matrix not available' };
    }

    const result = capabilityMatrix.buildMatrix();
    lastResult = { method: 'getCapabilityMatrix', result };
    return result;
  }

  function getLastResult() {
    return lastResult;
  }

  return {
    getCapabilities,
    validateCurriculum,
    validateDependencies,
    explainDependency,
    interpretGoal,
    analyzeProgression,
    generateUnlockMap,
    composeReport,
    runCertification,
    getCapabilityMatrix,
    getLastResult
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.curriculumAgentFacade = createCurriculumAgentFacade();
}

export { createCurriculumAgentFacade };
