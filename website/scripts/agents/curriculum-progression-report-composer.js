/**
 * NV-1300-D3C — Curriculum Progression Report Composer
 *
 * Composes deterministic reports with sections:
 * - Overview
 * - Structure Summary
 * - Progression
 * - Dependency Quality
 * - Coverage
 * - Redundancy
 * - Unlock Graph
 * - Curriculum Health
 * - Recommendations
 * - Evidence
 *
 * No LLM. No narrative generation outside deterministic templates.
 * Read-only, deterministic, no learner inference.
 */

function createCurriculumProgressionReportComposer() {

  function getCapabilities() {
    return {
      name: 'CurriculumProgressionReportComposer',
      version: '1.0.0',
      methods: [
        'composeReport',
        'composeOverview',
        'composeStructureSummary',
        'composeProgression',
        'composeDependencyQuality',
        'composeCoverage',
        'composeRedundancy',
        'composeUnlockGraph',
        'composeHealth',
        'composeRecommendations',
        'getCapabilities'
      ]
    };
  }

  function composeReport(curriculum, context = {}) {
    if (!curriculum) {
      return { valid: false, error: 'No curriculum provided' };
    }

    const sections = [];

    sections.push(composeOverview(curriculum, context));
    sections.push(composeStructureSummary(curriculum));
    sections.push(composeProgression(context.progression));
    sections.push(composeDependencyQuality(context.dependencyQuality));
    sections.push(composeCoverage(context.coverage));
    sections.push(composeRedundancy(context.redundancy));
    sections.push(composeUnlockGraph(context.unlockMap));
    sections.push(composeHealth(context.health));
    sections.push(composeRecommendations(context.recommendations));

    return {
      valid: true,
      sections,
      timestamp: null,
      status: 'operational'
    };
  }

  function composeOverview(curriculum, context) {
    const concepts = curriculum.concepts || [];
    const lessons = curriculum.lessons || [];
    const artifacts = curriculum.artifacts || [];

    const lines = [];
    lines.push('Curriculum Progression Report');
    lines.push('');
    lines.push(`Concepts: ${concepts.length}`);
    lines.push(`Lessons: ${lessons.length}`);
    lines.push(`Artifacts: ${artifacts.length}`);

    if (context.health) {
      lines.push(`Health Score: ${context.health}/100`);
    }

    return {
      title: 'Overview',
      content: lines.join('\n'),
      type: 'overview'
    };
  }

  function composeStructureSummary(curriculum) {
    const concepts = curriculum.concepts || [];
    const lines = [];

    lines.push('Structure Summary:');
    lines.push('');

    const typeGroups = {};
    for (const concept of concepts) {
      const type = concept.type || concept.category || 'unknown';
      if (!typeGroups[type]) typeGroups[type] = [];
      typeGroups[type].push(concept.name || concept.id);
    }

    for (const [type, items] of Object.entries(typeGroups)) {
      lines.push(`${type}: ${items.length} concepts`);
    }

    return {
      title: 'Structure Summary',
      content: lines.join('\n'),
      type: 'structure'
    };
  }

  function composeProgression(progression) {
    if (!progression) {
      return {
        title: 'Progression',
        content: 'No progression analysis available.',
        type: 'progression'
      };
    }

    const lines = [];
    lines.push('Progression Analysis:');
    lines.push('');

    if (progression.totalIssues !== undefined) {
      lines.push(`Total issues: ${progression.totalIssues}`);
    }

    if (progression.issues && progression.issues.length > 0) {
      lines.push('');
      lines.push('Issues:');
      for (const issue of progression.issues.slice(0, 10)) {
        lines.push(`  - [${issue.severity}] ${issue.message}`);
      }
    }

    return {
      title: 'Progression',
      content: lines.join('\n'),
      type: 'progression'
    };
  }

  function composeDependencyQuality(quality) {
    if (!quality) {
      return {
        title: 'Dependency Quality',
        content: 'No dependency quality analysis available.',
        type: 'quality'
      };
    }

    const lines = [];
    lines.push('Dependency Quality:');
    lines.push('');

    if (quality.score !== undefined) {
      lines.push(`Quality Score: ${quality.score}/100`);
    }

    if (quality.issues) {
      lines.push(`Issues found: ${quality.issues.length}`);
    }

    return {
      title: 'Dependency Quality',
      content: lines.join('\n'),
      type: 'quality'
    };
  }

  function composeCoverage(coverage) {
    if (!coverage) {
      return {
        title: 'Coverage',
        content: 'No coverage analysis available.',
        type: 'coverage'
      };
    }

    const lines = [];
    lines.push('Competency Coverage:');
    lines.push('');

    if (coverage.summary) {
      lines.push(`Total: ${coverage.summary.total}`);
      lines.push(`Covered: ${coverage.summary.covered}`);
      lines.push(`Partially Covered: ${coverage.summary.partiallyCovered}`);
      lines.push(`Unsupported: ${coverage.summary.unsupported}`);
      lines.push(`Coverage Ratio: ${coverage.summary.coverageRatio}`);
    }

    return {
      title: 'Coverage',
      content: lines.join('\n'),
      type: 'coverage'
    };
  }

  function composeRedundancy(redundancy) {
    if (!redundancy) {
      return {
        title: 'Redundancy',
        content: 'No redundancy analysis available.',
        type: 'redundancy'
      };
    }

    const lines = [];
    lines.push('Redundancy Analysis:');
    lines.push('');

    if (redundancy.total !== undefined) {
      lines.push(`Total redundant items: ${redundancy.total}`);
    }

    if (redundancy.byType) {
      lines.push(`Concepts: ${redundancy.byType.concepts}`);
      lines.push(`Dependencies: ${redundancy.byType.dependencies}`);
      lines.push(`Objectives: ${redundancy.byType.objectives}`);
      lines.push(`Artifacts: ${redundancy.byType.artifacts}`);
    }

    return {
      title: 'Redundancy',
      content: lines.join('\n'),
      type: 'redundancy'
    };
  }

  function composeUnlockGraph(unlockMap) {
    if (!unlockMap) {
      return {
        title: 'Unlock Graph',
        content: 'No unlock map available.',
        type: 'unlock'
      };
    }

    const lines = [];
    lines.push('Goal Unlock Map:');
    lines.push('');

    if (unlockMap.target) {
      lines.push(`Target: ${unlockMap.target.name}`);
    }

    if (unlockMap.criticalPath) {
      lines.push('');
      lines.push('Critical Path:');
      for (const step of unlockMap.criticalPath) {
        lines.push(`  - ${step.name}`);
      }
    }

    return {
      title: 'Unlock Graph',
      content: lines.join('\n'),
      type: 'unlock'
    };
  }

  function composeHealth(health) {
    if (!health) {
      return {
        title: 'Curriculum Health',
        content: 'No health analysis available.',
        type: 'health'
      };
    }

    const lines = [];
    lines.push('Curriculum Health:');
    lines.push('');

    if (health.healthScore !== undefined) {
      lines.push(`Health Score: ${health.healthScore}/100`);
    }

    if (health.warnings && health.warnings.length > 0) {
      lines.push('');
      lines.push('Warnings:');
      for (const warning of health.warnings.slice(0, 5)) {
        lines.push(`  - [${warning.severity}] ${warning.message}`);
      }
    }

    return {
      title: 'Curriculum Health',
      content: lines.join('\n'),
      type: 'health'
    };
  }

  function composeRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return {
        title: 'Recommendations',
        content: 'No recommendations at this time.',
        type: 'recommendations'
      };
    }

    const lines = [];
    lines.push('Recommendations:');
    lines.push('');

    for (const rec of recommendations.slice(0, 10)) {
      lines.push(`- ${rec.message}`);
    }

    return {
      title: 'Recommendations',
      content: lines.join('\n'),
      type: 'recommendations'
    };
  }

  return {
    getCapabilities,
    composeReport,
    composeOverview,
    composeStructureSummary,
    composeProgression,
    composeDependencyQuality,
    composeCoverage,
    composeRedundancy,
    composeUnlockGraph,
    composeHealth,
    composeRecommendations
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.curriculumProgressionReportComposer = createCurriculumProgressionReportComposer();
}

export { createCurriculumProgressionReportComposer };
