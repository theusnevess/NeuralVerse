/**
 * NV-1300-D3C — Competency Coverage Verifier
 *
 * Verifies that declared competencies are supported by curriculum artifacts:
 * - Covered: Full curriculum support exists
 * - Partially covered: Some support exists
 * - Unsupported: No curriculum support exists
 *
 * Evaluates curriculum completeness.
 * NEVER evaluates learners.
 *
 * Read-only, deterministic, no learner inference.
 */

function createCompetencyCoverageVerifier() {

  function getCapabilities() {
    return {
      name: 'CompetencyCoverageVerifier',
      version: '1.0.0',
      methods: [
        'verifyCoverage',
        'findUnsupportedCompetencies',
        'findPartiallyCoveredCompetencies',
        'findCoveredCompetencies',
        'buildCoverageReport',
        'getCapabilities'
      ]
    };
  }

  function verifyCoverage(curriculum, competencyMap) {
    if (!curriculum || !competencyMap) {
      return { valid: false, error: 'Invalid input', coverage: {} };
    }

    const competencies = competencyMap.competencies || competencyMap;
    if (!Array.isArray(competencies)) {
      return { valid: false, error: 'Invalid competency map', coverage: {} };
    }

    const concepts = curriculum.concepts || [];
    const lessons = curriculum.lessons || [];
    const artifacts = curriculum.artifacts || [];
    const laboratories = curriculum.laboratories || [];
    const visualizations = curriculum.visualizations || [];

    const coverage = {
      covered: [],
      partiallyCovered: [],
      unsupported: []
    };

    for (const competency of competencies) {
      const result = assessCompetency(competency, concepts, lessons, artifacts, laboratories, visualizations);

      if (result.status === 'covered') {
        coverage.covered.push(result);
      } else if (result.status === 'partially_covered') {
        coverage.partiallyCovered.push(result);
      } else {
        coverage.unsupported.push(result);
      }
    }

    return {
      valid: true,
      coverage,
      summary: {
        total: competencies.length,
        covered: coverage.covered.length,
        partiallyCovered: coverage.partiallyCovered.length,
        unsupported: coverage.unsupported.length,
        coverageRatio: competencies.length > 0
          ? (coverage.covered.length / competencies.length * 100).toFixed(1) + '%'
          : '0%'
      }
    };
  }

  function assessCompetency(competency, concepts, lessons, artifacts, laboratories, visualizations) {
    const competencyId = competency.id || competency.name;
    const competencyName = competency.name || competency.id;

    const relatedConcepts = findRelatedConcepts(competencyId, concepts);
    const relatedLessons = findRelatedLessons(competencyId, lessons);
    const relatedArtifacts = findRelatedArtifacts(competencyId, artifacts);
    const relatedLabs = findRelatedLabs(competencyId, laboratories);
    const relatedViz = findRelatedVisualizations(competencyId, visualizations);

    const supportScore = computeSupportScore(
      relatedConcepts.length,
      relatedLessons.length,
      relatedArtifacts.length,
      relatedLabs.length,
      relatedViz.length
    );

    let status;
    if (supportScore >= 70) {
      status = 'covered';
    } else if (supportScore >= 30) {
      status = 'partially_covered';
    } else {
      status = 'unsupported';
    }

    return {
      competencyId,
      competencyName,
      status,
      supportScore,
      support: {
        concepts: relatedConcepts.map(c => ({ id: c.id, name: c.name || c.id })),
        lessons: relatedLessons.map(l => ({ id: l.id, name: l.title || l.id })),
        artifacts: relatedArtifacts.map(a => ({ id: a.id, name: a.title || a.id })),
        laboratories: relatedLabs.map(l => ({ id: l.id, name: l.title || l.id })),
        visualizations: relatedViz.map(v => ({ id: v.id, name: v.title || v.id }))
      }
    };
  }

  function findRelatedConcepts(competencyId, concepts) {
    const normalized = (competencyId || '').toLowerCase();
    return concepts.filter(c => {
      const name = (c.name || c.id || '').toLowerCase();
      const keywords = c.keywords || c.tags || [];
      return name.includes(normalized) ||
             normalized.includes(name) ||
             keywords.some(k => k.toLowerCase().includes(normalized));
    });
  }

  function findRelatedLessons(competencyId, lessons) {
    const normalized = (competencyId || '').toLowerCase();
    return lessons.filter(l => {
      const title = (l.title || l.id || '').toLowerCase();
      const topics = l.topics || l.concepts || [];
      return title.includes(normalized) ||
             normalized.includes(title) ||
             topics.some(t => t.toLowerCase().includes(normalized));
    });
  }

  function findRelatedArtifacts(competencyId, artifacts) {
    const normalized = (competencyId || '').toLowerCase();
    return artifacts.filter(a => {
      const title = (a.title || a.id || '').toLowerCase();
      return title.includes(normalized) || normalized.includes(title);
    });
  }

  function findRelatedLabs(competencyId, laboratories) {
    const normalized = (competencyId || '').toLowerCase();
    return (laboratories || []).filter(l => {
      const title = (l.title || l.id || '').toLowerCase();
      return title.includes(normalized) || normalized.includes(title);
    });
  }

  function findRelatedVisualizations(competencyId, visualizations) {
    const normalized = (competencyId || '').toLowerCase();
    return (visualizations || []).filter(v => {
      const title = (v.title || v.id || '').toLowerCase();
      return title.includes(normalized) || normalized.includes(title);
    });
  }

  function computeSupportScore(concepts, lessons, artifacts, labs, viz) {
    let score = 0;
    score += Math.min(30, concepts * 10);
    score += Math.min(25, lessons * 8);
    score += Math.min(25, artifacts * 5);
    score += Math.min(10, labs * 5);
    score += Math.min(10, viz * 5);
    return Math.min(100, score);
  }

  function findUnsupportedCompetencies(curriculum, competencyMap) {
    const result = verifyCoverage(curriculum, competencyMap);
    return result.coverage?.unsupported || [];
  }

  function findPartiallyCoveredCompetencies(curriculum, competencyMap) {
    const result = verifyCoverage(curriculum, competencyMap);
    return result.coverage?.partiallyCovered || [];
  }

  function findCoveredCompetencies(curriculum, competencyMap) {
    const result = verifyCoverage(curriculum, competencyMap);
    return result.coverage?.covered || [];
  }

  function buildCoverageReport(curriculum, competencyMap) {
    const result = verifyCoverage(curriculum, competencyMap);

    return {
      valid: result.valid,
      summary: result.summary,
      covered: result.coverage?.covered?.length || 0,
      partiallyCovered: result.coverage?.partiallyCovered?.length || 0,
      unsupported: result.coverage?.unsupported?.length || 0,
      recommendations: generateRecommendations(result.coverage)
    };
  }

  function generateRecommendations(coverage) {
    if (!coverage) return [];

    const recommendations = [];

    for (const item of (coverage.unsupported || [])) {
      recommendations.push({
        type: 'add_support',
        competencyId: item.competencyId,
        competencyName: item.competencyName,
        message: `Add curriculum support for competency: ${item.competencyName}`
      });
    }

    for (const item of (coverage.partiallyCovered || [])) {
      recommendations.push({
        type: 'enhance_support',
        competencyId: item.competencyId,
        competencyName: item.competencyName,
        message: `Enhance curriculum support for competency: ${item.competencyName}`
      });
    }

    return recommendations;
  }

  return {
    getCapabilities,
    verifyCoverage,
    findUnsupportedCompetencies,
    findPartiallyCoveredCompetencies,
    findCoveredCompetencies,
    buildCoverageReport
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.competencyCoverageVerifier = createCompetencyCoverageVerifier();
}

export { createCompetencyCoverageVerifier };
