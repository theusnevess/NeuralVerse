/**
 * NV-1300-D3B — Goal Dependency Interpreter
 *
 * Deterministically interprets curriculum dependencies based on
 * declared educational objectives. Prioritizes prerequisites
 * without modifying the curriculum structure.
 *
 * Given a goal, computes:
 * - Highest priority prerequisites
 * - Secondary prerequisites
 * - Supporting background
 * - Enrichment topics
 *
 * The curriculum NEVER changes.
 * Only priority ordering changes.
 *
 * Read-only, deterministic, no learner inference.
 */

const PRIORITY_LEVELS = {
  critical: { label: 'Critical', order: 1, description: 'Essential prerequisite for goal' },
  high: { label: 'High', order: 2, description: 'Strongly recommended prerequisite' },
  medium: { label: 'Medium', order: 3, description: 'Useful background knowledge' },
  low: { label: 'Low', order: 4, description: 'Helpful but optional context' },
  background: { label: 'Background', order: 5, description: 'General supporting knowledge' }
};

function createGoalDependencyInterpreter() {

  function getCapabilities() {
    return {
      name: 'GoalDependencyInterpreter',
      version: '1.0.0',
      methods: [
        'interpretGoal',
        'prioritizePrerequisites',
        'classifyByPriority',
        'getPriorityLevels',
        'explainInterpretation'
      ]
    };
  }

  function getPriorityLevels() {
    return Object.keys(PRIORITY_LEVELS);
  }

  function interpretGoal(goal, conceptIndex, dependencyGraph) {
    if (!goal || !conceptIndex) {
      return { goal: null, prerequisites: [], error: 'Invalid input' };
    }

    const concepts = conceptIndex.concepts || conceptIndex;
    if (!Array.isArray(concepts)) {
      return { goal: null, prerequisites: [], error: 'Invalid concept index' };
    }

    const goalConcept = findConceptByGoal(goal, concepts);
    if (!goalConcept) {
      return { goal: goal, prerequisites: [], error: 'Goal concept not found' };
    }

    const allPrereqs = collectPrerequisites(goalConcept.id, concepts, dependencyGraph);
    const prioritized = prioritizePrerequisites(goalConcept.id, allPrereqs, concepts, dependencyGraph);

    return {
      goal: goal,
      goalConcept: { id: goalConcept.id, name: goalConcept.name || goalConcept.id },
      prerequisites: prioritized,
      totalPrerequisites: prioritized.length,
      byPriority: groupByPriority(prioritized)
    };
  }

  function findConceptByGoal(goal, concepts) {
    const goalLower = goal.toLowerCase();

    const exactMatch = concepts.find(c =>
      c.id && c.id.toLowerCase() === goalLower
    );
    if (exactMatch) return exactMatch;

    const nameMatch = concepts.find(c =>
      (c.name || '').toLowerCase() === goalLower
    );
    if (nameMatch) return nameMatch;

    const partialMatch = concepts.find(c =>
      (c.id || '').toLowerCase().includes(goalLower) ||
      (c.name || '').toLowerCase().includes(goalLower)
    );
    if (partialMatch) return partialMatch;

    return concepts.find(c => {
      const aliases = c.aliases || c.altNames || [];
      return aliases.some(a => a.toLowerCase() === goalLower);
    }) || null;
  }

  function collectPrerequisites(conceptId, concepts, dependencyGraph, visited = new Set()) {
    if (visited.has(conceptId)) return [];
    visited.add(conceptId);

    const concept = concepts.find(c => c.id === conceptId);
    if (!concept) return [];

    const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
    const result = [];

    for (const prereqId of prereqs) {
      if (visited.has(prereqId)) continue;

      const prereqConcept = concepts.find(c => c.id === prereqId);
      if (!prereqConcept) continue;

      result.push({
        id: prereqId,
        name: prereqConcept.name || prereqId,
        depth: 1
      });

      const transitive = collectPrerequisites(prereqId, concepts, dependencyGraph, new Set(visited));
      for (const t of transitive) {
        if (!result.find(r => r.id === t.id)) {
          result.push({ ...t, depth: t.depth + 1 });
        }
      }
    }

    return result;
  }

  function prioritizePrerequisites(goalId, prerequisites, concepts, dependencyGraph) {
    return prerequisites.map(prereq => {
      const concept = concepts.find(c => c.id === prereq.id);
      const score = computePriorityScore(goalId, prereq.id, prereq.depth, concept, concepts, dependencyGraph);
      const priority = scoreToPriority(score);

      return {
        id: prereq.id,
        name: prereq.name,
        depth: prereq.depth,
        score: score,
        priority: priority,
        priorityLabel: PRIORITY_LEVELS[priority].label,
        reasoning: generatePriorityReasoning(goalId, prereq.id, prereq.depth, priority, concept)
      };
    }).sort((a, b) => {
      const orderDiff = PRIORITY_LEVELS[a.priority].order - PRIORITY_LEVELS[b.priority].order;
      if (orderDiff !== 0) return orderDiff;
      return a.depth - b.depth;
    });
  }

  function computePriorityScore(goalId, prereqId, depth, concept, concepts, dependencyGraph) {
    let score = 0;

    if (depth === 1) {
      score += 40;
    } else if (depth === 2) {
      score += 25;
    } else if (depth === 3) {
      score += 15;
    } else {
      score += 5;
    }

    const typeBonus = computeTypeBonus(prereqId, goalId, concepts);
    score += typeBonus;

    const centralityBonus = computeCentralityBonus(prereqId, concepts);
    score += centralityBonus;

    const positionBonus = computePositionBonus(prereqId, concepts);
    score += positionBonus;

    return Math.min(100, Math.max(0, score));
  }

  function computeTypeBonus(prereqId, goalId, concepts) {
    const prereq = concepts.find(c => c.id === prereqId);
    if (!prereq) return 0;

    const type = prereq.type || prereq.category || '';
    const coreTypes = ['mathematics', 'fundamental', 'core', 'prerequisite'];

    if (coreTypes.some(t => type.toLowerCase().includes(t))) {
      return 20;
    }

    return 10;
  }

  function computeCentralityBonus(prereqId, concepts) {
    let inDegree = 0;
    for (const concept of concepts) {
      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      if (prereqs.includes(prereqId)) {
        inDegree++;
      }
    }

    if (inDegree >= 5) return 15;
    if (inDegree >= 3) return 10;
    if (inDegree >= 1) return 5;
    return 0;
  }

  function computePositionBonus(prereqId, concepts) {
    const index = concepts.findIndex(c => c.id === prereqId);
    if (index === -1) return 0;

    const total = concepts.length;
    const position = index / total;

    if (position < 0.25) return 15;
    if (position < 0.5) return 10;
    if (position < 0.75) return 5;
    return 0;
  }

  function scoreToPriority(score) {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    if (score >= 15) return 'low';
    return 'background';
  }

  function generatePriorityReasoning(goalId, prereqId, depth, priority, concept) {
    const reasons = [];

    if (depth === 1) {
      reasons.push(`${prereqId} is a direct prerequisite of ${goalId}`);
    } else if (depth === 2) {
      reasons.push(`${prereqId} supports an intermediate prerequisite of ${goalId}`);
    } else {
      reasons.push(`${prereqId} provides foundational context for ${goalId}`);
    }

    if (priority === 'critical' || priority === 'high') {
      reasons.push(`Understanding ${prereqId} is essential for mastering ${goalId}`);
    }

    return reasons.join('. ');
  }

  function classifyByPriority(prerequisites) {
    const classified = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      background: []
    };

    for (const prereq of prerequisites) {
      const priority = prereq.priority || 'background';
      if (classified[priority]) {
        classified[priority].push(prereq);
      }
    }

    return classified;
  }

  function groupByPriority(prerequisites) {
    return classifyByPriority(prerequisites);
  }

  function explainInterpretation(interpretation) {
    if (!interpretation || !interpretation.prerequisites) {
      return 'No interpretation available.';
    }

    const lines = [];
    lines.push(`Goal: ${interpretation.goal}`);
    lines.push(`Total prerequisites: ${interpretation.totalPrerequisites}`);
    lines.push('');

    const classified = interpretation.byPriority || classifyByPriority(interpretation.prerequisites);

    for (const [priority, prereqs] of Object.entries(classified)) {
      if (prereqs.length === 0) continue;
      lines.push(`${PRIORITY_LEVELS[priority].label}:`);
      for (const p of prereqs) {
        lines.push(`  - ${p.name} (depth ${p.depth})`);
      }
    }

    return lines.join('\n');
  }

  return {
    getCapabilities,
    getPriorityLevels,
    interpretGoal,
    prioritizePrerequisites,
    classifyByPriority,
    explainInterpretation
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.goalDependencyInterpreter = createGoalDependencyInterpreter();
}

export { createGoalDependencyInterpreter };
