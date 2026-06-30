/**
 * NV-1300-D3C — Redundancy Detection Engine
 *
 * Detects curriculum redundancy:
 * - Duplicated concepts
 * - Duplicated prerequisites
 * - Repeated learning objectives
 * - Repeated curriculum artifacts
 * - Unnecessary dependency duplication
 *
 * No automatic removal. Only reporting.
 * Read-only, deterministic, no learner inference.
 */

function createRedundancyDetectionEngine() {

  function getCapabilities() {
    return {
      name: 'RedundancyDetectionEngine',
      version: '1.0.0',
      methods: [
        'findDuplicateConcepts',
        'findDuplicateDependencies',
        'findDuplicateObjectives',
        'findDuplicateArtifacts',
        'summarizeRedundancy',
        'getCapabilities'
      ]
    };
  }

  function findDuplicateConcepts(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { duplicates: [], count: 0 };
    }

    const concepts = curriculum.concepts || [];
    const nameMap = new Map();
    const duplicates = [];

    for (const concept of concepts) {
      const name = (concept.name || concept.id || '').toLowerCase().trim();
      if (!name) continue;

      if (nameMap.has(name)) {
        const existing = nameMap.get(name);
        duplicates.push({
          type: 'duplicate_concept',
          conceptIds: [existing.id, concept.id],
          name: concept.name || concept.id,
          message: `Duplicate concept: "${concept.name || concept.id}" (${existing.id} and ${concept.id})`
        });
      } else {
        nameMap.set(name, concept);
      }
    }

    return { duplicates, count: duplicates.length };
  }

  function findDuplicateDependencies(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { duplicates: [], count: 0 };
    }

    const concepts = curriculum.concepts || [];
    const edgeMap = new Map();
    const duplicates = [];

    for (const concept of concepts) {
      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];

      for (const prereqId of prereqs) {
        const key = `${prereqId}|||${concept.id}`;

        if (edgeMap.has(key)) {
          duplicates.push({
            type: 'duplicate_dependency',
            source: prereqId,
            target: concept.id,
            message: `Duplicate dependency: ${prereqId} -> ${concept.id}`
          });
        } else {
          edgeMap.set(key, true);
        }
      }
    }

    return { duplicates, count: duplicates.length };
  }

  function findDuplicateObjectives(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { duplicates: [], count: 0 };
    }

    const lessons = curriculum.lessons || [];
    const objectiveMap = new Map();
    const duplicates = [];

    for (const lesson of lessons) {
      const objectives = lesson.objectives || lesson.goals || lesson.learningGoals || [];

      for (const objective of objectives) {
        const normalized = (typeof objective === 'string' ? objective : objective.text || '').toLowerCase().trim();
        if (!normalized) continue;

        if (objectiveMap.has(normalized)) {
          const existing = objectiveMap.get(normalized);
          duplicates.push({
            type: 'duplicate_objective',
            lessonIds: [existing.lessonId, lesson.id],
            objective: normalized,
            message: `Duplicate objective in lessons ${existing.lessonId} and ${lesson.id}`
          });
        } else {
          objectiveMap.set(normalized, { lessonId: lesson.id });
        }
      }
    }

    return { duplicates, count: duplicates.length };
  }

  function findDuplicateArtifacts(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { duplicates: [], count: 0 };
    }

    const artifacts = curriculum.artifacts || [];
    const titleMap = new Map();
    const duplicates = [];

    for (const artifact of artifacts) {
      const title = (artifact.title || artifact.name || '').toLowerCase().trim();
      if (!title) continue;

      if (titleMap.has(title)) {
        const existing = titleMap.get(title);
        duplicates.push({
          type: 'duplicate_artifact',
          artifactIds: [existing.id, artifact.id],
          title: artifact.title || artifact.name,
          message: `Duplicate artifact: "${artifact.title || artifact.name}" (${existing.id} and ${artifact.id})`
        });
      } else {
        titleMap.set(title, artifact);
      }
    }

    return { duplicates, count: duplicates.length };
  }

  function summarizeRedundancy(curriculum) {
    const concepts = findDuplicateConcepts(curriculum);
    const dependencies = findDuplicateDependencies(curriculum);
    const objectives = findDuplicateObjectives(curriculum);
    const artifacts = findDuplicateArtifacts(curriculum);

    const allDuplicates = [
      ...concepts.duplicates,
      ...dependencies.duplicates,
      ...objectives.duplicates,
      ...artifacts.duplicates
    ];

    return {
      total: allDuplicates.length,
      byType: {
        concepts: concepts.count,
        dependencies: dependencies.count,
        objectives: objectives.count,
        artifacts: artifacts.count
      },
      duplicates: allDuplicates,
      hasRedundancy: allDuplicates.length > 0
    };
  }

  return {
    getCapabilities,
    findDuplicateConcepts,
    findDuplicateDependencies,
    findDuplicateObjectives,
    findDuplicateArtifacts,
    summarizeRedundancy
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.redundancyDetectionEngine = createRedundancyDetectionEngine();
}

export { createRedundancyDetectionEngine };
