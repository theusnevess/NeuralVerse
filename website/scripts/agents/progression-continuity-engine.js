/**
 * NV-1300-D3C — Progression Continuity Engine
 *
 * Detects curriculum progression problems:
 * - Conceptual jumps
 * - Missing intermediate concepts
 * - Disconnected progression
 * - Abrupt complexity increases
 * - Isolated concepts
 * - Unreachable curriculum goals
 *
 * Read-only, deterministic, never invents curriculum.
 */

function createProgressionContinuityEngine() {

  function getCapabilities() {
    return {
      name: 'ProgressionContinuityEngine',
      version: '1.0.0',
      methods: [
        'validateProgression',
        'detectConceptJumps',
        'detectMissingSteps',
        'detectDisconnectedChains',
        'detectAbruptComplexity',
        'detectIsolatedConcepts',
        'getCapabilities'
      ]
    };
  }

  function validateProgression(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { valid: false, errors: ['Invalid curriculum input'], issues: [] };
    }

    const issues = [];
    const concepts = curriculum.concepts || [];
    const dependencies = curriculum.dependencies || [];

    const jumps = detectConceptJumps(curriculum);
    issues.push(...jumps.issues);

    const missing = detectMissingSteps(curriculum);
    issues.push(...missing.issues);

    const disconnected = detectDisconnectedChains(curriculum);
    issues.push(...disconnected.issues);

    const complexity = detectAbruptComplexity(curriculum);
    issues.push(...complexity.issues);

    const isolated = detectIsolatedConcepts(curriculum);
    issues.push(...isolated.issues);

    return {
      valid: issues.length === 0,
      issues,
      totalIssues: issues.length,
      bySeverity: groupBySeverity(issues)
    };
  }

  function detectConceptJumps(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { issues: [] };
    }

    const issues = [];
    const concepts = curriculum.concepts || [];

    for (const concept of concepts) {
      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];

      if (prereqs.length === 0) continue;

      const conceptComplexity = estimateComplexity(concept);
      let maxPrereqComplexity = 0;

      for (const prereqId of prereqs) {
        const prereq = concepts.find(c => c.id === prereqId);
        if (prereq) {
          const prereqComplexity = estimateComplexity(prereq);
          maxPrereqComplexity = Math.max(maxPrereqComplexity, prereqComplexity);
        }
      }

      const jump = conceptComplexity - maxPrereqComplexity;
      if (jump > 2) {
        issues.push({
          type: 'concept_jump',
          severity: jump > 3 ? 'high' : 'medium',
          conceptId: concept.id,
          conceptName: concept.name || concept.id,
          jumpSize: jump,
          message: `Concept ${concept.name || concept.id} has a complexity jump of ${jump} levels from prerequisites`
        });
      }
    }

    return { issues };
  }

  function detectMissingSteps(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { issues: [] };
    }

    const issues = [];
    const concepts = curriculum.concepts || [];
    const conceptIds = new Set(concepts.map(c => c.id));

    for (const concept of concepts) {
      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];

      for (const prereqId of prereqs) {
        if (!conceptIds.has(prereqId)) {
          issues.push({
            type: 'missing_step',
            severity: 'high',
            conceptId: concept.id,
            conceptName: concept.name || concept.id,
            missingId: prereqId,
            message: `Concept ${concept.name || concept.id} references missing prerequisite ${prereqId}`
          });
        }
      }
    }

    return { issues };
  }

  function detectDisconnectedChains(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { issues: [] };
    }

    const issues = [];
    const concepts = curriculum.concepts || [];

    const reachable = new Set();
    const roots = concepts.filter(c => {
      const prereqs = c.prerequisiteConcepts || c.prerequisites || c.dependsOn || [];
      return prereqs.length === 0;
    });

    function traverse(conceptId, visited) {
      if (visited.has(conceptId)) return;
      visited.add(conceptId);
      reachable.add(conceptId);

      for (const concept of concepts) {
        const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
        if (prereqs.includes(conceptId)) {
          traverse(concept.id, visited);
        }
      }
    }

    for (const root of roots) {
      traverse(root.id, new Set());
    }

    for (const concept of concepts) {
      if (!reachable.has(concept.id)) {
        const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
        const hasIncoming = prereqs.some(p => reachable.has(p));

        if (!hasIncoming && prereqs.length > 0) {
          issues.push({
            type: 'disconnected_chain',
            severity: 'medium',
            conceptId: concept.id,
            conceptName: concept.name || concept.id,
            message: `Concept ${concept.name || concept.id} is not reachable from any root concept`
          });
        }
      }
    }

    return { issues };
  }

  function detectAbruptComplexity(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { issues: [] };
    }

    const issues = [];
    const concepts = curriculum.concepts || [];

    const complexityMap = new Map();
    for (const concept of concepts) {
      complexityMap.set(concept.id, estimateComplexity(concept));
    }

    for (const concept of concepts) {
      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      if (prereqs.length === 0) continue;

      const conceptComplexity = complexityMap.get(concept.id) || 0;

      for (const prereqId of prereqs) {
        const prereqComplexity = complexityMap.get(prereqId) || 0;
        const increase = conceptComplexity - prereqComplexity;

        if (increase > 3) {
          issues.push({
            type: 'abrupt_complexity',
            severity: 'high',
            conceptId: concept.id,
            conceptName: concept.name || concept.id,
            prereqId,
            complexityIncrease: increase,
            message: `Abrupt complexity increase from ${prereqId} to ${concept.name || concept.id}`
          });
        }
      }
    }

    return { issues };
  }

  function detectIsolatedConcepts(curriculum) {
    if (!curriculum || typeof curriculum !== 'object') {
      return { issues: [] };
    }

    const issues = [];
    const concepts = curriculum.concepts || [];

    for (const concept of concepts) {
      const prereqs = concept.prerequisiteConcepts || concept.prerequisites || concept.dependsOn || [];
      const dependents = concepts.filter(c => {
        const cPrereqs = c.prerequisiteConcepts || c.prerequisites || c.dependsOn || [];
        return cPrereqs.includes(concept.id);
      });

      if (prereqs.length === 0 && dependents.length === 0 && concepts.length > 1) {
        issues.push({
          type: 'isolated_concept',
          severity: 'medium',
          conceptId: concept.id,
          conceptName: concept.name || concept.id,
          message: `Concept ${concept.name || concept.id} has no prerequisites and no dependents`
        });
      }
    }

    return { issues };
  }

  function estimateComplexity(concept) {
    if (!concept) return 0;

    const type = (concept.type || concept.category || '').toLowerCase();
    const complexityMap = {
      'mathematics': 4,
      'algorithmic': 3,
      'implementation': 3,
      'fundamental': 2,
      'conceptual': 1
    };

    return complexityMap[type] || 2;
  }

  function groupBySeverity(issues) {
    const grouped = { critical: [], high: [], medium: [], low: [] };
    for (const issue of issues) {
      const severity = issue.severity || 'low';
      if (grouped[severity]) {
        grouped[severity].push(issue);
      }
    }
    return grouped;
  }

  return {
    getCapabilities,
    validateProgression,
    detectConceptJumps,
    detectMissingSteps,
    detectDisconnectedChains,
    detectAbruptComplexity,
    detectIsolatedConcepts
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.progressionContinuityEngine = createProgressionContinuityEngine();
}

export { createProgressionContinuityEngine };
