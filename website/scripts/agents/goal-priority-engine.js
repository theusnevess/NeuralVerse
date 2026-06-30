/**
 * NV-1300-D3B — Goal Priority Engine
 *
 * For every dependency computes deterministic priority based on:
 * - Goal
 * - Dependency type
 * - Distance
 * - Concept centrality
 * - Curriculum position
 * - Shared Knowledge relevance
 *
 * Outputs:
 * - Critical
 * - High
 * - Medium
 * - Low
 * - Background
 *
 * Scoring MUST be deterministic.
 * No ML. No inference. No personalization.
 *
 * Read-only, deterministic, no learner inference.
 */

const PRIORITY_CATEGORIES = {
  critical: { label: 'Critical', order: 1, minScore: 80 },
  high: { label: 'High', order: 2, minScore: 60 },
  medium: { label: 'Medium', order: 3, minScore: 40 },
  low: { label: 'Low', order: 4, minScore: 20 },
  background: { label: 'Background', order: 5, minScore: 0 }
};

const WEIGHTS = {
  dependencyType: 0.30,
  distance: 0.25,
  centrality: 0.20,
  position: 0.15,
  sharedKnowledge: 0.10
};

function createGoalPriorityEngine() {

  function getCapabilities() {
    return {
      name: 'GoalPriorityEngine',
      version: '1.0.0',
      methods: [
        'computePriority',
        'scoreDependency',
        'categorizeScore',
        'getPriorityCategories',
        'getWeights',
        'explainPriority'
      ]
    };
  }

  function getPriorityCategories() {
    return Object.keys(PRIORITY_CATEGORIES);
  }

  function getWeights() {
    return { ...WEIGHTS };
  }

  function computePriority(goal, dependency, conceptIndex, dependencyGraph, sharedKnowledge) {
    if (!goal || !dependency) {
      return { valid: false, error: 'Invalid input' };
    }

    const source = dependency.source || dependency.from;
    const target = dependency.target || dependency.to;
    const type = dependency.type || dependency.relationship || 'conceptual';
    const depth = dependency.depth || 1;

    const concepts = conceptIndex?.concepts || conceptIndex || [];

    const scores = {
      dependencyType: scoreDependencyType(type),
      distance: scoreDistance(depth),
      centrality: scoreCentrality(source, concepts, dependencyGraph),
      position: scorePosition(source, concepts),
      sharedKnowledge: scoreSharedKnowledge(source, sharedKnowledge)
    };

    const totalScore = computeTotalScore(scores);
    const category = categorizeScore(totalScore);

    return {
      valid: true,
      source,
      target,
      goal,
      scores,
      totalScore,
      category,
      categoryLabel: PRIORITY_CATEGORIES[category].label,
      reasoning: generateReasoning(source, target, category, scores)
    };
  }

  function scoreDependencyType(type) {
    const typeScores = {
      required: 100,
      fundamental: 90,
      mathematics: 85,
      algorithmic: 75,
      implementation: 70,
      conceptual: 60,
      recommended: 50,
      optional_background: 30,
      enrichment: 20,
      co_requisite: 40
    };

    return typeScores[type] || 50;
  }

  function scoreDistance(depth) {
    if (depth <= 1) return 100;
    if (depth === 2) return 70;
    if (depth === 3) return 40;
    return 20;
  }

  function scoreCentrality(source, concepts, dependencyGraph) {
    let inDegree = 0;

    for (const concept of concepts) {
      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      if (prereqs.includes(source)) {
        inDegree++;
      }
    }

    if (inDegree >= 5) return 100;
    if (inDegree >= 3) return 75;
    if (inDegree >= 1) return 50;
    return 25;
  }

  function scorePosition(source, concepts) {
    const index = concepts.findIndex(c => c.id === source);
    if (index === -1) return 50;

    const total = concepts.length;
    const position = index / total;

    if (position < 0.2) return 100;
    if (position < 0.4) return 75;
    if (position < 0.6) return 50;
    if (position < 0.8) return 25;
    return 10;
  }

  function scoreSharedKnowledge(source, sharedKnowledge) {
    if (!sharedKnowledge) return 30;

    const items = sharedKnowledge.items || sharedKnowledge;
    if (!Array.isArray(items)) return 30;

    const relevant = items.filter(item =>
      item.concepts && item.concepts.includes(source)
    );

    if (relevant.length >= 3) return 100;
    if (relevant.length >= 2) return 75;
    if (relevant.length >= 1) return 50;
    return 25;
  }

  function computeTotalScore(scores) {
    let total = 0;
    for (const [key, weight] of Object.entries(WEIGHTS)) {
      total += (scores[key] || 0) * weight;
    }
    return Math.round(Math.min(100, Math.max(0, total)));
  }

  function categorizeScore(score) {
    if (score >= PRIORITY_CATEGORIES.critical.minScore) return 'critical';
    if (score >= PRIORITY_CATEGORIES.high.minScore) return 'high';
    if (score >= PRIORITY_CATEGORIES.medium.minScore) return 'medium';
    if (score >= PRIORITY_CATEGORIES.low.minScore) return 'low';
    return 'background';
  }

  function generateReasoning(source, target, category, scores) {
    const reasons = [];

    if (scores.dependencyType >= 80) {
      reasons.push(`${source} is a high-priority dependency type for ${target}`);
    }

    if (scores.distance >= 70) {
      reasons.push(`${source} is a direct prerequisite`);
    }

    if (scores.centrality >= 75) {
      reasons.push(`${source} is a highly connected concept`);
    }

    if (scores.position >= 75) {
      reasons.push(`${source} appears early in the curriculum`);
    }

    return reasons.join('. ') || `Priority for ${source} relative to ${target}`;
  }

  function scoreDependency(dependency, goal, conceptIndex, sharedKnowledge) {
    return computePriority(goal, dependency, conceptIndex, null, sharedKnowledge);
  }

  function explainPriority(priorityResult) {
    if (!priorityResult || !priorityResult.valid) {
      return 'No priority information available.';
    }

    const lines = [];
    lines.push(`Source: ${priorityResult.source}`);
    lines.push(`Target: ${priorityResult.target}`);
    lines.push(`Goal: ${priorityResult.goal}`);
    lines.push(`Priority: ${priorityResult.categoryLabel} (${priorityResult.totalScore}/100)`);
    lines.push('');
    lines.push('Score Breakdown:');
    for (const [key, value] of Object.entries(priorityResult.scores)) {
      lines.push(`  ${key}: ${value}`);
    }
    lines.push('');
    lines.push(`Reasoning: ${priorityResult.reasoning}`);

    return lines.join('\n');
  }

  return {
    getCapabilities,
    getPriorityCategories,
    getWeights,
    computePriority,
    scoreDependency,
    categorizeScore,
    explainPriority
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.goalPriorityEngine = createGoalPriorityEngine();
}

export { createGoalPriorityEngine };
