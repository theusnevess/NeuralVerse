/**
 * NV-1300-D3C — Goal Unlock Map Generator
 *
 * Produces deterministic unlock graphs:
 * - Goal Tree
 * - Unlock Graph
 * - Critical Path
 * - Optional Enrichment
 * - Background Topics
 *
 * No alternative curriculum generation.
 * Only visualization-ready graph data.
 *
 * Read-only, deterministic, no learner inference.
 */

function createGoalUnlockMapGenerator() {

  function getCapabilities() {
    return {
      name: 'GoalUnlockMapGenerator',
      version: '1.0.0',
      methods: [
        'generateUnlockMap',
        'generateConceptRoadmap',
        'validateUnlockMap',
        'explainUnlockMap',
        'getCapabilities'
      ]
    };
  }

  function generateUnlockMap(targetConcept, curriculum) {
    if (!targetConcept || !curriculum) {
      return { valid: false, error: 'Invalid input' };
    }

    const concepts = curriculum.concepts || [];
    const target = concepts.find(c => c.id === targetConcept || c.name === targetConcept);

    if (!target) {
      return { valid: false, error: 'Target concept not found' };
    }

    const goalTree = buildGoalTree(target, concepts);
    const unlockGraph = buildUnlockGraph(target, concepts);
    const criticalPath = findCriticalPath(target, concepts);
    const enrichment = findEnrichment(target, concepts);
    const background = findBackground(target, concepts);

    return {
      valid: true,
      target: { id: target.id, name: target.name || target.id },
      goalTree,
      unlockGraph,
      criticalPath,
      enrichment,
      background,
      totalNodes: goalTree.length
    };
  }

  function buildGoalTree(target, concepts) {
    const visited = new Set();
    const tree = [];

    function traverse(concept, depth) {
      if (visited.has(concept.id)) return;
      visited.add(concept.id);

      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      const children = [];

      for (const prereqId of prereqs) {
        const prereq = concepts.find(c => c.id === prereqId);
        if (prereq) {
          children.push(traverse(prereq, depth + 1));
        }
      }

      tree.push({
        id: concept.id,
        name: concept.name || concept.id,
        depth,
        children: children.filter(Boolean)
      });

      return {
        id: concept.id,
        name: concept.name || concept.id,
        depth
      };
    }

    traverse(target, 0);
    return tree;
  }

  function buildUnlockGraph(target, concepts) {
    const edges = [];
    const nodes = [];
    const visited = new Set();

    function traverse(concept) {
      if (visited.has(concept.id)) return;
      visited.add(concept.id);

      nodes.push({
        id: concept.id,
        name: concept.name || concept.id
      });

      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      for (const prereqId of prereqs) {
        const prereq = concepts.find(c => c.id === prereqId);
        if (prereq) {
          edges.push({
            source: prereq.id,
            target: concept.id,
            type: 'prerequisite'
          });
          traverse(prereq);
        }
      }
    }

    traverse(target);
    return { nodes, edges };
  }

  function findCriticalPath(target, concepts) {
    const visited = new Set();
    const path = [];

    function traverse(concept) {
      if (visited.has(concept.id)) return;
      visited.add(concept.id);

      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      let maxDepth = 0;
      let deepestChild = null;

      for (const prereqId of prereqs) {
        const prereq = concepts.find(c => c.id === prereqId);
        if (prereq) {
          const childDepth = getDepth(prereq, concepts);
          if (childDepth > maxDepth) {
            maxDepth = childDepth;
            deepestChild = prereq;
          }
        }
      }

      if (deepestChild) {
        traverse(deepestChild);
      }

      path.push({
        id: concept.id,
        name: concept.name || concept.id,
        depth: getDepth(concept, concepts)
      });
    }

    traverse(target);
    return path;
  }

  function getDepth(concept, concepts, visited = new Set()) {
    if (visited.has(concept.id)) return 0;
    visited.add(concept.id);

    const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
    if (prereqs.length === 0) return 0;

    let maxDepth = 0;
    for (const prereqId of prereqs) {
      const prereq = concepts.find(c => c.id === prereqId);
      if (prereq) {
        const depth = getDepth(prereq, concepts, new Set(visited));
        maxDepth = Math.max(maxDepth, depth + 1);
      }
    }

    return maxDepth;
  }

  function findEnrichment(target, concepts) {
    const visited = new Set();
    const enrichment = [];

    function traverse(concept) {
      if (visited.has(concept.id)) return;
      visited.add(concept.id);

      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      for (const prereqId of prereqs) {
        const prereq = concepts.find(c => c.id === prereqId);
        if (prereq) {
          const type = (prereq.type || prereq.category || '').toLowerCase();
          if (type === 'enrichment' || type === 'extension') {
            enrichment.push({
              id: prereq.id,
              name: prereq.name || prereq.id,
              type: 'enrichment'
            });
          }
          traverse(prereq);
        }
      }
    }

    traverse(target);
    return enrichment;
  }

  function findBackground(target, concepts) {
    const visited = new Set();
    const background = [];

    function traverse(concept) {
      if (visited.has(concept.id)) return;
      visited.add(concept.id);

      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      for (const prereqId of prereqs) {
        const prereq = concepts.find(c => c.id === prereqId);
        if (prereq) {
          const type = (prereq.type || prereq.category || '').toLowerCase();
          if (type === 'background' || type === 'optional') {
            background.push({
              id: prereq.id,
              name: prereq.name || prereq.id,
              type: 'background'
            });
          }
          traverse(prereq);
        }
      }
    }

    traverse(target);
    return background;
  }

  function generateConceptRoadmap(conceptId, curriculum) {
    return generateUnlockMap(conceptId, curriculum);
  }

  function validateUnlockMap(unlockMap) {
    if (!unlockMap || typeof unlockMap !== 'object') {
      return { valid: false, errors: ['Invalid unlock map'] };
    }

    const errors = [];

    if (!unlockMap.target) errors.push('Missing target');
    if (!unlockMap.goalTree) errors.push('Missing goal tree');
    if (!unlockMap.unlockGraph) errors.push('Missing unlock graph');
    if (!unlockMap.criticalPath) errors.push('Missing critical path');

    return {
      valid: errors.length === 0,
      errors
    };
  }

  function explainUnlockMap(unlockMap) {
    if (!unlockMap || !unlockMap.valid) {
      return 'No unlock map available.';
    }

    const lines = [];
    lines.push(`Goal: ${unlockMap.target.name}`);
    lines.push(`Total prerequisites: ${unlockMap.totalNodes}`);
    lines.push('');
    lines.push('Critical Path:');
    for (const step of unlockMap.criticalPath) {
      lines.push(`  - ${step.name}`);
    }

    if (unlockMap.enrichment.length > 0) {
      lines.push('');
      lines.push('Enrichment:');
      for (const e of unlockMap.enrichment) {
        lines.push(`  - ${e.name}`);
      }
    }

    if (unlockMap.background.length > 0) {
      lines.push('');
      lines.push('Background:');
      for (const b of unlockMap.background) {
        lines.push(`  - ${b.name}`);
      }
    }

    return lines.join('\n');
  }

  return {
    getCapabilities,
    generateUnlockMap,
    generateConceptRoadmap,
    validateUnlockMap,
    explainUnlockMap
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.goalUnlockMapGenerator = createGoalUnlockMapGenerator();
}

export { createGoalUnlockMapGenerator };
