/**
 * NV-1300-D3A — Concept Prerequisite Engine
 *
 * Resolves concept-level prerequisites:
 * - Direct prerequisite resolution
 * - Transitive prerequisite chains
 * - Duplicate prerequisite detection
 * - Artifact/lesson to concept mapping
 * - Cycle detection in prerequisite graphs
 *
 * Read-only, deterministic, safe on missing input.
 */

function createConceptPrerequisiteEngine() {

  function getCapabilities() {
    return {
      name: 'ConceptPrerequisiteEngine',
      version: '1.0.0',
      methods: [
        'getPrerequisitesForConcept',
        'getPrerequisitesForArtifact',
        'getPrerequisitesForLesson',
        'buildConceptChain',
        'validateConceptPrerequisites'
      ]
    };
  }

  function getPrerequisitesForConcept(conceptId, conceptIndex) {
    if (!conceptId || !conceptIndex) {
      return [];
    }

    const concepts = conceptIndex.concepts || conceptIndex;
    if (!Array.isArray(concepts)) {
      return [];
    }

    const concept = concepts.find(c => c.id === conceptId);
    if (!concept) {
      return [];
    }

    const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
    return [...new Set(prereqs)].filter(Boolean);
  }

  function getPrerequisitesForArtifact(artifactId, curriculumIndex, conceptIndex) {
    if (!artifactId || !curriculumIndex || !conceptIndex) {
      return [];
    }

    const artifacts = curriculumIndex.artifacts || [];
    const artifact = artifacts.find(a => a.id === artifactId);
    if (!artifact) {
      return [];
    }

    const conceptIds = artifact.conceptIds || artifact.concepts || [];
    if (conceptIds.length === 0) {
      return [];
    }

    const allPrereqs = new Set();
    for (const conceptId of conceptIds) {
      const prereqs = getPrerequisitesForConcept(conceptId, conceptIndex);
      for (const prereq of prereqs) {
        allPrereqs.add(prereq);
      }
    }

    return [...allPrereqs];
  }

  function getPrerequisitesForLesson(lessonId, curriculumIndex, conceptIndex) {
    if (!lessonId || !curriculumIndex || !conceptIndex) {
      return [];
    }

    const lessons = curriculumIndex.lessons || [];
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) {
      return [];
    }

    const conceptIds = lesson.conceptIds || lesson.concepts || [];
    if (conceptIds.length === 0) {
      const artifacts = curriculumIndex.artifacts || [];
      const lessonArtifacts = artifacts.filter(a =>
        (lesson.artifactIds || []).includes(a.id)
      );

      const allConceptIds = new Set();
      for (const artifact of lessonArtifacts) {
        const artifactConcepts = artifact.conceptIds || artifact.concepts || [];
        for (const cid of artifactConcepts) {
          allConceptIds.add(cid);
        }
      }

      const allPrereqs = new Set();
      for (const conceptId of allConceptIds) {
        const prereqs = getPrerequisitesForConcept(conceptId, conceptIndex);
        for (const prereq of prereqs) {
          allPrereqs.add(prereq);
        }
      }

      return [...allPrereqs];
    }

    const allPrereqs = new Set();
    for (const conceptId of conceptIds) {
      const prereqs = getPrerequisitesForConcept(conceptId, conceptIndex);
      for (const prereq of prereqs) {
        allPrereqs.add(prereq);
      }
    }

    return [...allPrereqs];
  }

  function buildConceptChain(conceptId, conceptIndex, maxDepth = 10) {
    if (!conceptId || !conceptIndex) {
      return { chain: [], hasCycle: false, depth: 0 };
    }

    const concepts = conceptIndex.concepts || conceptIndex;
    if (!Array.isArray(concepts)) {
      return { chain: [], hasCycle: false, depth: 0 };
    }

    const chain = [];
    const visited = new Set();
    let hasCycle = false;
    let currentDepth = 0;

    function traverse(id, depth) {
      if (depth > maxDepth) return;
      if (visited.has(id)) {
        hasCycle = true;
        return;
      }

      visited.add(id);

      const concept = concepts.find(c => c.id === id);
      if (!concept) return;

      chain.push({
        id: concept.id,
        name: concept.name || concept.id,
        depth
      });

      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      for (const prereq of prereqs) {
        traverse(prereq, depth + 1);
      }

      visited.delete(id);
    }

    traverse(conceptId, 0);

    chain.sort((a, b) => a.depth - b.depth);

    return {
      chain,
      hasCycle,
      depth: chain.length > 0 ? Math.max(...chain.map(c => c.depth)) + 1 : 0
    };
  }

  function validateConceptPrerequisites(concepts) {
    if (!concepts) {
      return { valid: true, errors: [], warnings: [] };
    }

    const conceptList = concepts.concepts || concepts;
    if (!Array.isArray(conceptList)) {
      return { valid: true, errors: [], warnings: [] };
    }

    const errors = [];
    const warnings = [];
    const conceptIds = new Set(conceptList.map(c => c.id).filter(Boolean));

    for (const concept of conceptList) {
      if (!concept.id) {
        errors.push('Concept missing id');
        continue;
      }

      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      const seen = new Set();

      for (const prereq of prereqs) {
        if (!conceptIds.has(prereq)) {
          warnings.push(`Concept ${concept.id} references unknown prerequisite ${prereq}`);
        }

        if (seen.has(prereq)) {
          errors.push(`Concept ${concept.id} has duplicate prerequisite ${prereq}`);
        }
        seen.add(prereq);
      }

      if (prereqs.includes(concept.id)) {
        errors.push(`Concept ${concept.id} has self-dependency`);
      }
    }

    const cycleCheck = detectPrerequisiteCycles(conceptList);
    if (cycleCheck.hasCycle) {
      errors.push(`Prerequisite cycles detected: ${cycleCheck.cycles.length}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  function detectPrerequisiteCycles(conceptList) {
    if (!Array.isArray(conceptList)) {
      return { hasCycle: false, cycles: [] };
    }

    const adjacency = new Map();
    for (const concept of conceptList) {
      if (concept.id) {
        const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
        adjacency.set(concept.id, prereqs.filter(p => p !== concept.id));
      }
    }

    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    function dfs(node, path) {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = adjacency.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const cyclePath = dfs(neighbor, path);
          if (cyclePath) return cyclePath;
        } else if (recursionStack.has(neighbor)) {
          const cycleStart = path.indexOf(neighbor);
          return path.slice(cycleStart).concat(neighbor);
        }
      }

      path.pop();
      recursionStack.delete(node);
      return null;
    }

    for (const concept of conceptList) {
      if (concept.id && !visited.has(concept.id)) {
        const cyclePath = dfs(concept.id, []);
        if (cyclePath) {
          cycles.push(cyclePath);
        }
      }
    }

    return {
      hasCycle: cycles.length > 0,
      cycles
    };
  }

  return {
    getCapabilities,
    getPrerequisitesForConcept,
    getPrerequisitesForArtifact,
    getPrerequisitesForLesson,
    buildConceptChain,
    validateConceptPrerequisites
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.conceptPrerequisiteEngine = createConceptPrerequisiteEngine();
}

export { createConceptPrerequisiteEngine };
