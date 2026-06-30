/**
 * NV-1300-D3D — Curriculum Certification Runner
 *
 * Executes D3A, D3B, D3C, D3D checks through a single deterministic runtime interface:
 * - Aggregates results
 * - Produces certification status
 * - Distinguishes structural readiness from runtime certification
 * - Classifies issues by severity
 *
 * Read-only, deterministic, no learner inference.
 */

const SEVERITY_LEVELS = {
  critical: { order: 1, description: 'Blocks certification' },
  high: { order: 2, description: 'Major issue requiring resolution' },
  medium: { order: 3, description: 'Issue requiring attention' },
  low: { order: 4, description: 'Minor issue' },
  info: { order: 5, description: 'Informational' },
  environment: { order: 6, description: 'Environment limitation, not a defect' }
};

function createCurriculumCertificationRunner() {

  function getCapabilities() {
    return {
      name: 'CurriculumCertificationRunner',
      version: '1.0.0',
      methods: [
        'runCertification',
        'runStructureCertification',
        'runDependencyCertification',
        'runIntelligenceCertification',
        'runProgressionCertification',
        'runUnifiedReportCertification',
        'classifyIssue',
        'summarizeCertification',
        'getCapabilities'
      ]
    };
  }

  function runCertification(input) {
    if (!input || typeof input !== 'object') {
      return { certified: false, error: 'Invalid input', issues: [] };
    }

    const issues = [];

    const structureResult = runStructureCertification(input);
    issues.push(...structureResult.issues);

    const dependencyResult = runDependencyCertification(input);
    issues.push(...dependencyResult.issues);

    const intelligenceResult = runIntelligenceCertification(input);
    issues.push(...intelligenceResult.issues);

    const progressionResult = runProgressionCertification(input);
    issues.push(...progressionResult.issues);

    const reportResult = runUnifiedReportCertification(input);
    issues.push(...reportResult.issues);

    const classifiedIssues = issues.map(i => classifyIssue(i));
    const certified = !classifiedIssues.some(i => i.severity === 'critical' || i.severity === 'high');

    return {
      certified,
      issues: classifiedIssues,
      summary: summarizeCertification({ certified, issues: classifiedIssues }),
      phase: 'D3D',
      timestamp: null
    };
  }

  function runStructureCertification(input) {
    const issues = [];

    if (!input.structure) {
      issues.push({
        source: 'structure',
        message: 'Structure validation data not provided',
        severity: 'info'
      });
      return { passed: true, issues };
    }

    if (!input.structure.valid) {
      issues.push({
        source: 'structure',
        message: 'Structure validation failed',
        severity: 'high'
      });

      if (input.structure.errors) {
        for (const error of input.structure.errors) {
          issues.push({
            source: 'structure',
            message: error,
            severity: 'medium'
          });
        }
      }
    }

    return {
      passed: !issues.some(i => i.severity === 'critical' || i.severity === 'high'),
      issues
    };
  }

  function runDependencyCertification(input) {
    const issues = [];

    if (!input.dependencies) {
      issues.push({
        source: 'dependencies',
        message: 'Dependency validation data not provided',
        severity: 'info'
      });
      return { passed: true, issues };
    }

    if (!input.dependencies.valid) {
      issues.push({
        source: 'dependencies',
        message: 'Dependency validation failed',
        severity: 'high'
      });
    }

    if (input.conceptPrerequisites && !input.conceptPrerequisites.valid) {
      issues.push({
        source: 'concept_prerequisites',
        message: 'Concept prerequisite validation failed',
        severity: 'medium'
      });
    }

    return {
      passed: !issues.some(i => i.severity === 'critical' || i.severity === 'high'),
      issues
    };
  }

  function runIntelligenceCertification(input) {
    const issues = [];

    if (!input.goalInterpretation) {
      issues.push({
        source: 'goal_interpretation',
        message: 'Goal interpretation data not provided',
        severity: 'info'
      });
    }

    if (input.justifications) {
      if (input.justifications.missing && input.justifications.missing.length > 0) {
        issues.push({
          source: 'justification',
          message: `${input.justifications.missing.length} missing justifications`,
          severity: 'medium'
        });
      }
    }

    return {
      passed: !issues.some(i => i.severity === 'critical' || i.severity === 'high'),
      issues
    };
  }

  function runProgressionCertification(input) {
    const issues = [];

    if (!input.progression) {
      issues.push({
        source: 'progression',
        message: 'Progression analysis data not provided',
        severity: 'info'
      });
      return { passed: true, issues };
    }

    if (input.progression.totalIssues > 10) {
      issues.push({
        source: 'progression',
        message: `High progression issue count: ${input.progression.totalIssues}`,
        severity: 'medium'
      });
    }

    if (input.progression.issues) {
      const criticalIssues = input.progression.issues.filter(i => i.severity === 'critical');
      if (criticalIssues.length > 0) {
        issues.push({
          source: 'progression',
          message: `${criticalIssues.length} critical progression issues`,
          severity: 'high'
        });
      }
    }

    return {
      passed: !issues.some(i => i.severity === 'critical' || i.severity === 'high'),
      issues
    };
  }

  function runUnifiedReportCertification(input) {
    const issues = [];

    if (!input.report) {
      issues.push({
        source: 'report',
        message: 'Unified report not provided',
        severity: 'info'
      });
      return { passed: true, issues };
    }

    if (!input.report.valid) {
      issues.push({
        source: 'report',
        message: 'Unified report validation failed',
        severity: 'high'
      });
    }

    return {
      passed: !issues.some(i => i.severity === 'critical' || i.severity === 'high'),
      issues
    };
  }

  function classifyIssue(issue) {
    if (!issue) {
      return { source: 'unknown', message: 'Unknown issue', severity: 'info' };
    }

    const severity = issue.severity || 'info';

    return {
      source: issue.source || 'unknown',
      message: issue.message || 'No message',
      severity,
      severityDescription: SEVERITY_LEVELS[severity]?.description || 'Unknown'
    };
  }

  function summarizeCertification(result) {
    if (!result) {
      return { certified: false, totalIssues: 0, bySeverity: {} };
    }

    const bySeverity = {};
    for (const level of Object.keys(SEVERITY_LEVELS)) {
      bySeverity[level] = 0;
    }

    for (const issue of (result.issues || [])) {
      if (bySeverity[issue.severity] !== undefined) {
        bySeverity[issue.severity]++;
      }
    }

    return {
      certified: result.certified,
      totalIssues: (result.issues || []).length,
      bySeverity,
      hasBlockingIssues: bySeverity.critical > 0 || bySeverity.high > 0
    };
  }

  return {
    getCapabilities,
    runCertification,
    runStructureCertification,
    runDependencyCertification,
    runIntelligenceCertification,
    runProgressionCertification,
    runUnifiedReportCertification,
    classifyIssue,
    summarizeCertification
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.curriculumCertificationRunner = createCurriculumCertificationRunner();
}

export { createCurriculumCertificationRunner };
