/**
 * NV-1300-D3D — Unified Curriculum Report Composer
 *
 * Merges D3A, D3B, D3C outputs into one deterministic report:
 * - Executive Summary
 * - Structure Validation
 * - Dependency Graph
 * - Typed Dependencies
 * - Concept Prerequisites
 * - Goal Interpretation
 * - Dependency Justifications
 * - Priority Analysis
 * - Progression Continuity
 * - Redundancy
 * - Coverage
 * - Unlock Maps
 * - Curriculum Health
 * - Warnings
 * - Recommendations
 * - Evidence Appendix
 * - Validation Metadata
 *
 * Deterministic templates only. No LLM.
 * Missing upstream data produces explicit 'unavailable' sections.
 *
 * Read-only, deterministic, no learner inference.
 */

function createUnifiedCurriculumReportComposer() {

  function getCapabilities() {
    return {
      name: 'UnifiedCurriculumReportComposer',
      version: '1.0.0',
      methods: [
        'composeUnifiedReport',
        'composeExecutiveSummary',
        'composeStructureSection',
        'composeDependencySection',
        'composeGoalInterpretationSection',
        'composeProgressionSection',
        'composeCoverageSection',
        'composeHealthSection',
        'composeEvidenceAppendix',
        'validateUnifiedReport',
        'getCapabilities'
      ]
    };
  }

  function composeUnifiedReport(input) {
    if (!input || typeof input !== 'object') {
      return { valid: false, error: 'Invalid input', sections: [] };
    }

    const sections = [];
    const warnings = [];
    const recommendations = [];
    const evidence = [];

    sections.push(composeExecutiveSummary(input));
    sections.push(composeStructureSection(input));
    sections.push(composeDependencySection(input));
    sections.push(composeGoalInterpretationSection(input));
    sections.push(composeProgressionSection(input));
    sections.push(composeCoverageSection(input));
    sections.push(composeHealthSection(input));

    const evidenceSection = composeEvidenceAppendix(input);
    sections.push(evidenceSection);

    collectWarnings(input, warnings);
    collectRecommendations(input, recommendations);

    sections.push({
      title: 'Warnings',
      content: formatWarnings(warnings),
      type: 'warnings',
      provenance: { source: 'd3d-aggregation', timestamp: null }
    });

    sections.push({
      title: 'Recommendations',
      content: formatRecommendations(recommendations),
      type: 'recommendations',
      provenance: { source: 'd3d-aggregation', timestamp: null }
    });

    sections.push({
      title: 'Validation Metadata',
      content: formatMetadata(input),
      type: 'metadata',
      provenance: { source: 'd3d-metadata', timestamp: null }
    });

    return {
      valid: true,
      sections,
      totalSections: sections.length,
      status: 'operational',
      timestamp: null
    };
  }

  function composeExecutiveSummary(input) {
    const lines = [];
    lines.push('Curriculum Governance Report');
    lines.push('');
    lines.push('This report consolidates structural validation, dependency analysis,');
    lines.push('goal interpretation, progression intelligence, and curriculum health.');
    lines.push('');

    if (input.structure) {
      lines.push(`Structure: ${input.structure.valid ? 'Valid' : 'Issues detected'}`);
    } else {
      lines.push('Structure: Unavailable');
    }

    if (input.dependencies) {
      lines.push(`Dependencies: ${input.dependencies.valid ? 'Valid' : 'Issues detected'}`);
    } else {
      lines.push('Dependencies: Unavailable');
    }

    if (input.health) {
      lines.push(`Health Score: ${input.health.healthScore || 'N/A'}/100`);
    } else {
      lines.push('Health: Unavailable');
    }

    return {
      title: 'Executive Summary',
      content: lines.join('\n'),
      type: 'executive_summary',
      provenance: { source: 'd3d-executive', timestamp: null }
    };
  }

  function composeStructureSection(input) {
    if (!input.structure) {
      return {
        title: 'Structure Validation',
        content: 'Section unavailable: Structure validation data not provided.',
        type: 'structure',
        status: 'unavailable',
        provenance: { source: 'd3a-structure', timestamp: null }
      };
    }

    const lines = [];
    lines.push('Structure Validation:');
    lines.push('');

    if (input.structure.stats) {
      lines.push(`Learning Paths: ${input.structure.stats.learningPaths || 0}`);
      lines.push(`Modules: ${input.structure.stats.modules || 0}`);
      lines.push(`Lessons: ${input.structure.stats.lessons || 0}`);
      lines.push(`Artifacts: ${input.structure.stats.artifacts || 0}`);
    }

    if (input.structure.valid) {
      lines.push('Status: Valid');
    } else {
      lines.push('Status: Issues detected');
      if (input.structure.errors) {
        for (const error of input.structure.errors.slice(0, 5)) {
          lines.push(`  - ${error}`);
        }
      }
    }

    return {
      title: 'Structure Validation',
      content: lines.join('\n'),
      type: 'structure',
      status: 'available',
      provenance: { source: 'd3a-structure', timestamp: null }
    };
  }

  function composeDependencySection(input) {
    if (!input.dependencies) {
      return {
        title: 'Dependency Graph',
        content: 'Section unavailable: Dependency validation data not provided.',
        type: 'dependencies',
        status: 'unavailable',
        provenance: { source: 'd3a-dependencies', timestamp: null }
      };
    }

    const lines = [];
    lines.push('Dependency Graph Analysis:');
    lines.push('');

    if (input.dependencies.stats) {
      lines.push(`Nodes: ${input.dependencies.stats.nodeCount || 0}`);
      lines.push(`Edges: ${input.dependencies.stats.edgeCount || 0}`);
    }

    if (input.typedDependencies) {
      lines.push('');
      lines.push('Typed Dependencies:');
      const types = input.typedDependencies.types || [];
      for (const type of types) {
        lines.push(`  - ${type}: ${type.count || 0}`);
      }
    }

    if (input.conceptPrerequisites) {
      lines.push('');
      lines.push('Concept Prerequisites:');
      if (input.conceptPrerequisites.valid) {
        lines.push('Status: Valid');
      } else {
        lines.push('Status: Issues detected');
      }
    }

    return {
      title: 'Dependency Graph',
      content: lines.join('\n'),
      type: 'dependencies',
      status: 'available',
      provenance: { source: 'd3a-dependencies', timestamp: null }
    };
  }

  function composeGoalInterpretationSection(input) {
    if (!input.goalInterpretation) {
      return {
        title: 'Goal Interpretation',
        content: 'Section unavailable: Goal interpretation data not provided.',
        type: 'goal_interpretation',
        status: 'unavailable',
        provenance: { source: 'd3b-goal', timestamp: null }
      };
    }

    const lines = [];
    lines.push('Goal Interpretation:');
    lines.push('');

    const gi = input.goalInterpretation;
    if (gi.goal) {
      lines.push(`Goal: ${gi.goal}`);
    }
    if (gi.totalPrerequisites !== undefined) {
      lines.push(`Total Prerequisites: ${gi.totalPrerequisites}`);
    }

    if (gi.byPriority) {
      lines.push('');
      lines.push('By Priority:');
      for (const [priority, prereqs] of Object.entries(gi.byPriority)) {
        if (Array.isArray(prereqs) && prereqs.length > 0) {
          lines.push(`  ${priority}: ${prereqs.length}`);
        }
      }
    }

    return {
      title: 'Goal Interpretation',
      content: lines.join('\n'),
      type: 'goal_interpretation',
      status: 'available',
      provenance: { source: 'd3b-goal', timestamp: null }
    };
  }

  function composeProgressionSection(input) {
    if (!input.progression) {
      return {
        title: 'Progression Continuity',
        content: 'Section unavailable: Progression analysis data not provided.',
        type: 'progression',
        status: 'unavailable',
        provenance: { source: 'd3c-progression', timestamp: null }
      };
    }

    const lines = [];
    lines.push('Progression Continuity:');
    lines.push('');

    if (input.progression.totalIssues !== undefined) {
      lines.push(`Total Issues: ${input.progression.totalIssues}`);
    }

    if (input.redundancy) {
      lines.push('');
      lines.push('Redundancy:');
      lines.push(`Total Redundant Items: ${input.redundancy.total || 0}`);
    }

    if (input.unlockMap) {
      lines.push('');
      lines.push('Unlock Map:');
      if (input.unlockMap.target) {
        lines.push(`Target: ${input.unlockMap.target.name}`);
      }
      if (input.unlockMap.criticalPath) {
        lines.push(`Critical Path Length: ${input.unlockMap.criticalPath.length}`);
      }
    }

    return {
      title: 'Progression Continuity',
      content: lines.join('\n'),
      type: 'progression',
      status: 'available',
      provenance: { source: 'd3c-progression', timestamp: null }
    };
  }

  function composeCoverageSection(input) {
    if (!input.coverage) {
      return {
        title: 'Coverage',
        content: 'Section unavailable: Coverage verification data not provided.',
        type: 'coverage',
        status: 'unavailable',
        provenance: { source: 'd3c-coverage', timestamp: null }
      };
    }

    const lines = [];
    lines.push('Curriculum Coverage:');
    lines.push('');

    if (input.coverage.summary) {
      lines.push(`Total Objectives: ${input.coverage.summary.total || 0}`);
      lines.push(`Covered: ${input.coverage.summary.covered || 0}`);
      lines.push(`Partially Covered: ${input.coverage.summary.partiallyCovered || 0}`);
      lines.push(`Unsupported: ${input.coverage.summary.unsupported || 0}`);
      lines.push(`Coverage Ratio: ${input.coverage.summary.coverageRatio || '0%'}`);
    }

    return {
      title: 'Coverage',
      content: lines.join('\n'),
      type: 'coverage',
      status: 'available',
      provenance: { source: 'd3c-coverage', timestamp: null }
    };
  }

  function composeHealthSection(input) {
    if (!input.health) {
      return {
        title: 'Curriculum Health',
        content: 'Section unavailable: Health analysis data not provided.',
        type: 'health',
        status: 'unavailable',
        provenance: { source: 'd3c-health', timestamp: null }
      };
    }

    const lines = [];
    lines.push('Curriculum Health:');
    lines.push('');

    if (input.health.healthScore !== undefined) {
      lines.push(`Health Score: ${input.health.healthScore}/100`);
    }

    if (input.health.metrics) {
      lines.push('');
      lines.push('Metrics:');
      for (const [key, value] of Object.entries(input.health.metrics)) {
        lines.push(`  ${key}: ${value}`);
      }
    }

    if (input.health.warnings && input.health.warnings.length > 0) {
      lines.push('');
      lines.push(`Warnings: ${input.health.warnings.length}`);
    }

    return {
      title: 'Curriculum Health',
      content: lines.join('\n'),
      type: 'health',
      status: 'available',
      provenance: { source: 'd3c-health', timestamp: null }
    };
  }

  function composeEvidenceAppendix(input) {
    const lines = [];
    lines.push('Evidence Appendix:');
    lines.push('');

    const evidenceItems = [];

    if (input.structure) {
      evidenceItems.push({ source: 'd3a-structure', status: input.structure.valid ? 'valid' : 'issues' });
    }
    if (input.dependencies) {
      evidenceItems.push({ source: 'd3a-dependencies', status: input.dependencies.valid ? 'valid' : 'issues' });
    }
    if (input.goalInterpretation) {
      evidenceItems.push({ source: 'd3b-goal', status: 'available' });
    }
    if (input.progression) {
      evidenceItems.push({ source: 'd3c-progression', status: input.progression.valid ? 'valid' : 'issues' });
    }
    if (input.health) {
      evidenceItems.push({ source: 'd3c-health', status: 'available' });
    }

    for (const item of evidenceItems) {
      lines.push(`  ${item.source}: ${item.status}`);
    }

    if (evidenceItems.length === 0) {
      lines.push('  No evidence available.');
    }

    return {
      title: 'Evidence Appendix',
      content: lines.join('\n'),
      type: 'evidence',
      status: 'available',
      provenance: { source: 'd3d-evidence', timestamp: null }
    };
  }

  function collectWarnings(input, warnings) {
    if (input.structure && !input.structure.valid) {
      warnings.push({ source: 'structure', message: 'Structure validation issues detected' });
    }
    if (input.dependencies && !input.dependencies.valid) {
      warnings.push({ source: 'dependencies', message: 'Dependency validation issues detected' });
    }
    if (input.progression && input.progression.totalIssues > 0) {
      warnings.push({ source: 'progression', message: `${input.progression.totalIssues} progression issues detected` });
    }
    if (input.health && input.health.warnings) {
      for (const w of input.health.warnings) {
        warnings.push({ source: 'health', message: w.message || 'Health warning' });
      }
    }
  }

  function collectRecommendations(input, recommendations) {
    if (input.health && input.health.recommendations) {
      for (const r of input.health.recommendations) {
        recommendations.push({ source: 'health', message: r.message || 'Health recommendation' });
      }
    }
  }

  function formatWarnings(warnings) {
    if (warnings.length === 0) return 'No warnings.';
    const lines = [];
    for (const w of warnings) {
      lines.push(`- [${w.source}] ${w.message}`);
    }
    return lines.join('\n');
  }

  function formatRecommendations(recommendations) {
    if (recommendations.length === 0) return 'No recommendations.';
    const lines = [];
    for (const r of recommendations) {
      lines.push(`- [${r.source}] ${r.message}`);
    }
    return lines.join('\n');
  }

  function formatMetadata(input) {
    const lines = [];
    lines.push('Validation Metadata:');
    lines.push('');
    lines.push('D3A: Structure, Dependencies, Typed Dependencies, Concept Prerequisites');
    lines.push('D3B: Goal Interpretation, Justifications, Priority, Narrative');
    lines.push('D3C: Progression, Redundancy, Coverage, Health');
    lines.push('D3D: Unified Report, Capability Matrix, Certification');
    lines.push('');
    lines.push('All outputs are deterministic and read-only.');
    return lines.join('\n');
  }

  function validateUnifiedReport(report) {
    if (!report || typeof report !== 'object') {
      return { valid: false, errors: ['Invalid report'] };
    }

    const errors = [];

    if (!report.sections || !Array.isArray(report.sections)) {
      errors.push('Missing sections array');
    }

    if (report.valid === undefined) {
      errors.push('Missing valid flag');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  return {
    getCapabilities,
    composeUnifiedReport,
    composeExecutiveSummary,
    composeStructureSection,
    composeDependencySection,
    composeGoalInterpretationSection,
    composeProgressionSection,
    composeCoverageSection,
    composeHealthSection,
    composeEvidenceAppendix,
    validateUnifiedReport
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.unifiedCurriculumReportComposer = createUnifiedCurriculumReportComposer();
}

export { createUnifiedCurriculumReportComposer };
