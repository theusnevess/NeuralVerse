/**
 * NV-1300-D3C — Curriculum Health Analyzer
 *
 * Computes deterministic curriculum quality metrics:
 * - Orphan rate
 * - Dependency density
 * - Average prerequisite depth
 * - Coverage ratio
 * - Redundancy ratio
 * - Goal connectivity
 * - Curriculum completeness
 *
 * HealthScore evaluates the curriculum.
 * Never evaluates learners.
 *
 * Read-only, deterministic, no learner inference.
 */

function createCurriculumHealthAnalyzer() {

  function getCapabilities() {
    return {
      name: 'CurriculumHealthAnalyzer',
      version: '1.0.0',
      methods: [
        'analyzeHealth',
        'computeMetrics',
        'computeHealthScore',
        'generateRecommendations',
        'getCapabilities'
      ]
    };
  }

  function analyzeHealth(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { valid: false, error: 'Invalid curriculum input' };
    }

    const metrics = computeMetrics(curriculum);
    const healthScore = computeHealthScore(metrics);
    const warnings = generateWarnings(metrics);
    const recommendations = generateRecommendations(metrics, warnings);

    return {
      valid: true,
      healthScore,
      metrics,
      warnings,
      recommendations
    };
  }

  function computeMetrics(curriculum) {
    const concepts = curriculum.concepts || [];
    const lessons = curriculum.lessons || [];
    const artifacts = curriculum.artifacts || [];
    const dependencies = curriculum.dependencies || [];

    const orphanRate = computeOrphanRate(concepts, lessons, artifacts);
    const dependencyDensity = computeDependencyDensity(concepts, dependencies);
    const avgPrereqDepth = computeAveragePrereqDepth(concepts);
    const coverageRatio = computeCoverageRatio(concepts, lessons, artifacts);
    const redundancyRatio = computeRedundancyRatio(concepts, dependencies);
    const goalConnectivity = computeGoalConnectivity(concepts);
    const completeness = computeCompleteness(curriculum);

    return {
      orphanRate,
      dependencyDensity,
      avgPrereqDepth,
      coverageRatio,
      redundancyRatio,
      goalConnectivity,
      completeness
    };
  }

  function computeOrphanRate(concepts, lessons, artifacts) {
    const totalEntities = concepts.length + lessons.length + artifacts.length;
    if (totalEntities === 0) return 0;

    let orphans = 0;

    const conceptIds = new Set(concepts.map(c => c.id));
    const lessonIds = new Set(lessons.map(l => l.id));

    const referencedConcepts = new Set();
    const referencedLessons = new Set();

    for (const lesson of lessons) {
      const conceptRefs = lesson.conceptIds || lesson.concepts || [];
      for (const ref of conceptRefs) {
        referencedConcepts.add(ref);
      }
    }

    for (const artifact of artifacts) {
      const lessonRef = artifact.lessonId || artifact.lesson;
      if (lessonRef) {
        referencedLessons.add(lessonRef);
      }
    }

    for (const concept of concepts) {
      if (!referencedConcepts.has(concept.id)) {
        orphans++;
      }
    }

    for (const lesson of lessons) {
      if (!referencedLessons.has(lesson.id)) {
        orphans++;
      }
    }

    return (orphans / totalEntities * 100).toFixed(1);
  }

  function computeDependencyDensity(concepts, dependencies) {
    if (concepts.length === 0) return 0;

    let totalDeps = 0;
    for (const concept of concepts) {
      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      totalDeps += prereqs.length;
    }

    const maxPossible = concepts.length * (concepts.length - 1);
    return maxPossible > 0 ? (totalDeps / maxPossible * 100).toFixed(2) : 0;
  }

  function computeAveragePrereqDepth(concepts) {
    if (concepts.length === 0) return 0;

    let totalDepth = 0;
    for (const concept of concepts) {
      totalDepth += getMaxDepth(concept, concepts);
    }

    return (totalDepth / concepts.length).toFixed(2);
  }

  function getMaxDepth(concept, concepts, visited = new Set()) {
    if (visited.has(concept.id)) return 0;
    visited.add(concept.id);

    const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
    if (prereqs.length === 0) return 0;

    let maxDepth = 0;
    for (const prereqId of prereqs) {
      const prereq = concepts.find(c => c.id === prereqId);
      if (prereq) {
        const depth = getMaxDepth(prereq, concepts, new Set(visited));
        maxDepth = Math.max(maxDepth, depth + 1);
      }
    }

    return maxDepth;
  }

  function computeCoverageRatio(concepts, lessons, artifacts) {
    const totalRequirements = concepts.length;
    if (totalRequirements === 0) return 100;

    let covered = 0;
    for (const concept of concepts) {
      const hasLessons = lessons.some(l => {
        const refs = l.conceptIds || l.concepts || [];
        return refs.includes(concept.id);
      });
      if (hasLessons) covered++;
    }

    return (covered / totalRequirements * 100).toFixed(1);
  }

  function computeRedundancyRatio(concepts, dependencies) {
    if (concepts.length === 0) return 0;

    let redundantDeps = 0;
    const edgeSet = new Set();

    for (const concept of concepts) {
      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      for (const prereqId of prereqs) {
        const key = `${prereqId}|||${concept.id}`;
        if (edgeSet.has(key)) {
          redundantDeps++;
        } else {
          edgeSet.add(key);
        }
      }
    }

    const totalDeps = edgeSet.size + redundantDeps;
    return totalDeps > 0 ? (redundantDeps / totalDeps * 100).toFixed(1) : 0;
  }

  function computeGoalConnectivity(concepts) {
    if (concepts.length === 0) return 0;

    let connected = 0;
    for (const concept of concepts) {
      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      if (prereqs.length > 0) {
        connected++;
      }
    }

    return (connected / concepts.length * 100).toFixed(1);
  }

  function computeCompleteness(curriculum) {
    const concepts = curriculum.concepts || [];
    const lessons = curriculum.lessons || [];
    const artifacts = curriculum.artifacts || [];

    let score = 0;
    if (concepts.length > 0) score += 33;
    if (lessons.length > 0) score += 33;
    if (artifacts.length > 0) score += 34;

    return score;
  }

  function computeHealthScore(metrics) {
    let score = 100;

    if (metrics.orphanRate > 20) score -= 20;
    else if (metrics.orphanRate > 10) score -= 10;

    if (metrics.dependencyDensity < 5) score -= 15;
    else if (metrics.dependencyDensity > 50) score -= 10;

    if (metrics.avgPrereqDepth > 5) score -= 15;
    else if (metrics.avgPrereqDepth > 3) score -= 5;

    if (metrics.coverageRatio < 50) score -= 20;
    else if (metrics.coverageRatio < 80) score -= 10;

    if (metrics.redundancyRatio > 20) score -= 15;
    else if (metrics.redundancyRatio > 10) score -= 5;

    if (metrics.goalConnectivity < 30) score -= 15;
    else if (metrics.goalConnectivity < 60) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  function generateWarnings(metrics) {
    const warnings = [];

    if (metrics.orphanRate > 20) {
      warnings.push({ type: 'orphan_rate', severity: 'high', message: `High orphan rate: ${metrics.orphanRate}%` });
    }

    if (metrics.dependencyDensity < 5) {
      warnings.push({ type: 'dependency_density', severity: 'medium', message: `Low dependency density: ${metrics.dependencyDensity}%` });
    }

    if (metrics.avgPrereqDepth > 5) {
      warnings.push({ type: 'prereq_depth', severity: 'high', message: `High average prerequisite depth: ${metrics.avgPrereqDepth}` });
    }

    if (metrics.coverageRatio < 50) {
      warnings.push({ type: 'coverage', severity: 'high', message: `Low coverage ratio: ${metrics.coverageRatio}%` });
    }

    if (metrics.redundancyRatio > 20) {
      warnings.push({ type: 'redundancy', severity: 'medium', message: `High redundancy ratio: ${metrics.redundancyRatio}%` });
    }

    return warnings;
  }

  function generateRecommendations(metrics, warnings) {
    const recommendations = [];

    for (const warning of warnings) {
      if (warning.type === 'orphan_rate') {
        recommendations.push({ type: 'reduce_orphans', message: 'Review and integrate orphaned curriculum elements' });
      }
      if (warning.type === 'dependency_density') {
        recommendations.push({ type: 'increase_dependencies', message: 'Add more prerequisite relationships between concepts' });
      }
      if (warning.type === 'prereq_depth') {
        recommendations.push({ type: 'simplify_chains', message: 'Consider simplifying deep prerequisite chains' });
      }
      if (warning.type === 'coverage') {
        recommendations.push({ type: 'improve_coverage', message: 'Add lessons and artifacts to cover more concepts' });
      }
      if (warning.type === 'redundancy') {
        recommendations.push({ type: 'reduce_redundancy', message: 'Remove duplicate dependencies' });
      }
    }

    return recommendations;
  }

  return {
    getCapabilities,
    analyzeHealth,
    computeMetrics,
    computeHealthScore,
    generateRecommendations
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.curriculumHealthAnalyzer = createCurriculumHealthAnalyzer();
}

export { createCurriculumHealthAnalyzer };
