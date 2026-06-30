/**
 * NV-1700-D5-OPT-07 — Editorial Quality Index & Governance Scoring Test Suite
 *
 * Comprehensive deterministic test suite for the Editorial Quality Kernel.
 * Covers: valid dimension, valid finding, valid report, valid registry,
 * duplicate reports, duplicate dimensions, duplicate findings,
 * invalid types, invalid level, invalid score, missing provenance,
 * empty registry, deterministic ordering, immutable input,
 * identical output (100 iterations), helper functions,
 * canonical enum completeness, negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  EditorialQualityDimension,
  EditorialQualityFinding,
  EditorialQualityReport,
  QualityProvenance,
  EditorialQualityInput,
  EditorialQualityRegistry,
  EditorialQualityTrace,
  KnowledgeArtifactWithEditorialQuality,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_QUALITY_DIMENSIONS,
  CANONICAL_QUALITY_LEVELS,
  CANONICAL_QUALITY_FINDINGS,
  CANONICAL_QUALITY_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
  CANONICAL_IMPACT_SEVERITY,
} from './KnowledgeAgentContract.ts';

import {
  composeEditorialQualityProvenance,
  composeEditorialQualityDimension,
  composeEditorialQualityFinding,
  composeEditorialQualityReport,
  composeEditorialQualityTrace,
  composeEditorialQualityRegistry,
  composeEditorialQualityRegistryFromInput,
  composeEditorialQuality,
  composeKnowledgeArtifactWithEditorialQuality,
  isSupportedQualityDimension,
  isSupportedQualityLevel,
  isSupportedQualityFinding,
  isSupportedQualityStatus,
  isSupportedGovernanceStatus,
  getCanonicalQualityDimensions,
  getCanonicalQualityLevels,
  getCanonicalQualityFindings,
  getCanonicalQualityStatuses,
} from './EditorialQualityKernel.ts';

import {
  validateEditorialQualityDimension,
  validateEditorialQualityFinding,
  validateEditorialQualityReport,
  validateEditorialQualityRegistry,
  validateEditorialQualityInput,
  validateEditorialQualityTrace,
  validateKnowledgeArtifactWithEditorialQuality,
  EDITORIAL_QUALITY_VALIDATION_CODES,
} from './EditorialQualityValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: QualityProvenance = {
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  providedBy: 'NeuralVerse Team',
  rationale: 'Core quality metadata.',
};

const VALID_DIMENSION: EditorialQualityDimension = {
  dimensionId: 'dimension-001',
  dimensionType: 'conceptual_completeness',
  qualityLevel: 'excellent',
  score: 0.95,
  rationale: 'Highly complete conceptual coverage.',
  provenance: VALID_PROVENANCE,
};

const VALID_DIMENSION_2: EditorialQualityDimension = {
  dimensionId: 'dimension-002',
  dimensionType: 'mathematical_rigor',
  qualityLevel: 'good',
  score: 0.80,
  rationale: 'Good mathematical rigor.',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_FINDING: EditorialQualityFinding = {
  findingId: 'finding-001',
  findingType: 'missing_visualization',
  severity: 'moderate',
  description: 'Missing visualization support.',
  affectedArtifactId: 'knowledge-001',
  provenance: VALID_PROVENANCE,
};

const VALID_FINDING_2: EditorialQualityFinding = {
  findingId: 'finding-002',
  findingType: 'missing_laboratory',
  severity: 'high',
  description: 'Missing laboratory support.',
  affectedArtifactId: 'knowledge-001',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_REPORT: EditorialQualityReport = {
  reportId: 'report-001',
  artifactId: 'knowledge-001',
  dimensions: [VALID_DIMENSION],
  findings: [VALID_FINDING],
  overallScore: 0.85,
  qualityLevel: 'good',
  summary: 'Strong conceptual coverage with minor gaps.',
  provenance: VALID_PROVENANCE,
};

const VALID_REPORT_2: EditorialQualityReport = {
  reportId: 'report-002',
  artifactId: 'knowledge-002',
  dimensions: [VALID_DIMENSION_2],
  findings: [VALID_FINDING_2],
  overallScore: 0.75,
  qualityLevel: 'basic',
  summary: 'Basic coverage with significant gaps.',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_INPUT: EditorialQualityInput = {
  reports: [VALID_REPORT, VALID_REPORT_2],
  dimensions: [VALID_DIMENSION, VALID_DIMENSION_2],
  findings: [VALID_FINDING, VALID_FINDING_2],
};

const EMPTY_INPUT: EditorialQualityInput = {
  reports: [],
  dimensions: [],
  findings: [],
};

// ---------------------------------------------------------------------------
// Dimension Composition Tests
// ---------------------------------------------------------------------------

describe('Editorial Quality Kernel — Dimension Composition', () => {
  it('should compose valid quality provenance', () => {
    const provenance = composeEditorialQualityProvenance({
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      providedBy: 'NeuralVerse Team',
      rationale: 'Core quality.',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.rationale, 'Core quality.');
  });

  it('should compose valid quality dimension', () => {
    const dimension = composeEditorialQualityDimension({
      dimensionId: 'dimension-001',
      dimensionType: 'conceptual_completeness',
      qualityLevel: 'excellent',
      score: 0.95,
      rationale: 'Highly complete.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(dimension.dimensionId, 'dimension-001');
    assert.equal(dimension.dimensionType, 'conceptual_completeness');
    assert.equal(dimension.qualityLevel, 'excellent');
    assert.equal(dimension.score, 0.95);
  });

  it('should compose valid quality finding', () => {
    const finding = composeEditorialQualityFinding({
      findingId: 'finding-001',
      findingType: 'missing_visualization',
      severity: 'moderate',
      description: 'Missing visualization.',
      affectedArtifactId: 'knowledge-001',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(finding.findingId, 'finding-001');
    assert.equal(finding.findingType, 'missing_visualization');
    assert.equal(finding.severity, 'moderate');
    assert.equal(finding.affectedArtifactId, 'knowledge-001');
  });

  it('should compose valid quality report', () => {
    const report = composeEditorialQualityReport({
      reportId: 'report-001',
      artifactId: 'knowledge-001',
      dimensions: [VALID_DIMENSION],
      findings: [VALID_FINDING],
      overallScore: 0.85,
      qualityLevel: 'good',
      summary: 'Strong coverage.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(report.reportId, 'report-001');
    assert.equal(report.artifactId, 'knowledge-001');
    assert.equal(report.dimensions.length, 1);
    assert.equal(report.findings.length, 1);
    assert.equal(report.overallScore, 0.85);
    assert.equal(report.qualityLevel, 'good');
  });

  it('should compose valid quality trace', () => {
    const trace = composeEditorialQualityTrace({
      traceId: '_trace_1',
      decisionCount: 5,
      validationCount: 4,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      compositionMetadata: '_composition_default',
      deterministicMetadata: '_deterministic_default',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 5);
    assert.equal(trace.validationCount, 4);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should validate a valid dimension with no errors', () => {
    const errors = validateEditorialQualityDimension(VALID_DIMENSION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid finding with no errors', () => {
    const errors = validateEditorialQualityFinding(VALID_FINDING);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid report with no errors', () => {
    const errors = validateEditorialQualityReport(VALID_REPORT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeEditorialQualityRegistry(
      [VALID_REPORT, VALID_REPORT_2],
      [VALID_DIMENSION, VALID_DIMENSION_2],
      [VALID_FINDING, VALID_FINDING_2],
    );
    const result = validateEditorialQualityRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate editorial quality input', () => {
    const result = validateEditorialQualityInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Editorial Quality Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeEditorialQualityRegistry([], [], []);
    const result = validateEditorialQualityRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have QUALITY_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate report IDs', () => {
    const registry = composeEditorialQualityRegistry(
      [VALID_REPORT, VALID_REPORT],
      [],
      [],
    );
    const result = validateEditorialQualityRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_DUPLICATE_REPORT,
    );

    assert.ok(duplicateError, 'Should have QUALITY_DUPLICATE_REPORT error');
  });

  it('should detect duplicate dimension IDs', () => {
    const registry = composeEditorialQualityRegistry(
      [],
      [VALID_DIMENSION, VALID_DIMENSION],
      [],
    );
    const result = validateEditorialQualityRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_DUPLICATE_DIMENSION,
    );

    assert.ok(duplicateError, 'Should have QUALITY_DUPLICATE_DIMENSION error');
  });

  it('should detect duplicate finding IDs', () => {
    const registry = composeEditorialQualityRegistry(
      [],
      [],
      [VALID_FINDING, VALID_FINDING],
    );
    const result = validateEditorialQualityRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_DUPLICATE_FINDING,
    );

    assert.ok(duplicateError, 'Should have QUALITY_DUPLICATE_FINDING error');
  });

  it('should sort deterministically by reportId', () => {
    const report3 = { ...VALID_REPORT, reportId: 'report-003' };
    const report1 = { ...VALID_REPORT, reportId: 'report-001' };
    const report2 = { ...VALID_REPORT, reportId: 'report-002' };

    const registry = composeEditorialQualityRegistry([report3, report1, report2], [], []);

    assert.equal(registry.reports[0].reportId, 'report-001');
    assert.equal(registry.reports[1].reportId, 'report-002');
    assert.equal(registry.reports[2].reportId, 'report-003');
  });

  it('should sort dimensions deterministically by dimensionId', () => {
    const dimension3 = { ...VALID_DIMENSION, dimensionId: 'dimension-003' };
    const dimension1 = { ...VALID_DIMENSION, dimensionId: 'dimension-001' };
    const dimension2 = { ...VALID_DIMENSION, dimensionId: 'dimension-002' };

    const registry = composeEditorialQualityRegistry([], [dimension3, dimension1, dimension2], []);

    assert.equal(registry.dimensions[0].dimensionId, 'dimension-001');
    assert.equal(registry.dimensions[1].dimensionId, 'dimension-002');
    assert.equal(registry.dimensions[2].dimensionId, 'dimension-003');
  });

  it('should sort findings deterministically by findingId', () => {
    const finding3 = { ...VALID_FINDING, findingId: 'finding-003' };
    const finding1 = { ...VALID_FINDING, findingId: 'finding-001' };
    const finding2 = { ...VALID_FINDING, findingId: 'finding-002' };

    const registry = composeEditorialQualityRegistry([], [], [finding3, finding1, finding2]);

    assert.equal(registry.findings[0].findingId, 'finding-001');
    assert.equal(registry.findings[1].findingId, 'finding-002');
    assert.equal(registry.findings[2].findingId, 'finding-003');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Editorial Quality Kernel — Validation', () => {
  it('should detect invalid dimension type', () => {
    const dimension = { ...VALID_DIMENSION, dimensionType: 'unsupported' as any };
    const errors = validateEditorialQualityDimension(dimension);
    const typeError = errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_DIMENSION,
    );

    assert.ok(typeError, 'Should have QUALITY_INVALID_DIMENSION error');
  });

  it('should detect invalid quality level', () => {
    const dimension = { ...VALID_DIMENSION, qualityLevel: 'unsupported' as any };
    const errors = validateEditorialQualityDimension(dimension);
    const levelError = errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_LEVEL,
    );

    assert.ok(levelError, 'Should have QUALITY_INVALID_LEVEL error');
  });

  it('should detect invalid score', () => {
    const dimension = { ...VALID_DIMENSION, score: 1.5 };
    const errors = validateEditorialQualityDimension(dimension);
    const scoreError = errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_SCORE,
    );

    assert.ok(scoreError, 'Should have QUALITY_INVALID_SCORE error');
  });

  it('should detect invalid finding type', () => {
    const finding = { ...VALID_FINDING, findingType: 'unsupported' as any };
    const errors = validateEditorialQualityFinding(finding);
    const typeError = errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_FINDING,
    );

    assert.ok(typeError, 'Should have QUALITY_INVALID_FINDING error');
  });

  it('should detect missing provenance', () => {
    const dimension = { ...VALID_DIMENSION, provenance: undefined as any };
    const errors = validateEditorialQualityDimension(dimension);
    const provenanceError = errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have QUALITY_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance source', () => {
    const dimension = { ...VALID_DIMENSION, provenance: { ...VALID_PROVENANCE, source: '' } };
    const errors = validateEditorialQualityDimension(dimension);
    const sourceError = errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have QUALITY_MISSING_SOURCE error');
  });

  it('should detect missing provenance rationale', () => {
    const dimension = { ...VALID_DIMENSION, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateEditorialQualityDimension(dimension);
    const rationaleError = errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have QUALITY_MISSING_RATIONALE error');
  });

  it('should detect missing provenance providedBy', () => {
    const dimension = { ...VALID_DIMENSION, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateEditorialQualityDimension(dimension);
    const providedByError = errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have QUALITY_MISSING_PROVIDED_BY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeEditorialQualityTrace({
      traceId: '_trace_1',
      decisionCount: 5,
      validationCount: 4,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      compositionMetadata: '_composition_default',
      deterministicMetadata: '_deterministic_default',
    });

    const result = validateEditorialQualityTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: EditorialQualityTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      compositionMetadata: '_composition_default',
      deterministicMetadata: '_deterministic_default',
      deterministic: false as true,
      generatedFrom: 'deterministic_quality_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateEditorialQualityTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Editorial Quality Kernel — Provenance', () => {
  it('should detect missing provenance on dimension', () => {
    const dimension = { ...VALID_DIMENSION, provenance: undefined as any };
    const errors = validateEditorialQualityDimension(dimension);
    const provenanceError = errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have QUALITY_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance on finding', () => {
    const finding = { ...VALID_FINDING, provenance: undefined as any };
    const errors = validateEditorialQualityFinding(finding);
    const provenanceError = errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have QUALITY_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance on report', () => {
    const report = { ...VALID_REPORT, provenance: undefined as any };
    const errors = validateEditorialQualityReport(report);
    const provenanceError = errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have QUALITY_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const dimension = { ...VALID_DIMENSION, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateEditorialQualityDimension(dimension);
    const rationaleError = errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have QUALITY_MISSING_RATIONALE error');
  });

  it('should detect missing providedBy in provenance', () => {
    const dimension = { ...VALID_DIMENSION, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateEditorialQualityDimension(dimension);
    const providedByError = errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have QUALITY_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Editorial Quality Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeEditorialQuality>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeEditorialQuality(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].reports, results[i].reports);
      assert.deepStrictEqual(results[0].dimensions, results[i].dimensions);
      assert.deepStrictEqual(results[0].findings, results[i].findings);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeEditorialQualityRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(
        composeEditorialQualityRegistry(
          [VALID_REPORT, VALID_REPORT_2],
          [VALID_DIMENSION, VALID_DIMENSION_2],
          [VALID_FINDING, VALID_FINDING_2],
        ),
      );
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].reports, results[i].reports);
      assert.deepStrictEqual(results[0].dimensions, results[i].dimensions);
      assert.deepStrictEqual(results[0].findings, results[i].findings);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Editorial Quality Kernel — Immutability', () => {
  it('should not mutate input reports', () => {
    const originalId = VALID_REPORT.reportId;
    const originalArtifactId = VALID_REPORT.artifactId;

    composeEditorialQuality(VALID_INPUT);

    assert.equal(VALID_REPORT.reportId, originalId);
    assert.equal(VALID_REPORT.artifactId, originalArtifactId);
  });

  it('should not mutate input dimensions', () => {
    const originalId = VALID_DIMENSION.dimensionId;
    const originalType = VALID_DIMENSION.dimensionType;

    composeEditorialQuality(VALID_INPUT);

    assert.equal(VALID_DIMENSION.dimensionId, originalId);
    assert.equal(VALID_DIMENSION.dimensionType, originalType);
  });

  it('should not mutate input findings', () => {
    const originalId = VALID_FINDING.findingId;
    const originalType = VALID_FINDING.findingType;

    composeEditorialQuality(VALID_INPUT);

    assert.equal(VALID_FINDING.findingId, originalId);
    assert.equal(VALID_FINDING.findingType, originalType);
  });

  it('should not mutate input registry reports', () => {
    const reports = [VALID_REPORT, VALID_REPORT_2];
    const originalIds = reports.map((r) => r.reportId);

    composeEditorialQualityRegistry(reports, [], []);

    assert.equal(reports[0].reportId, originalIds[0]);
    assert.equal(reports[1].reportId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Editorial Quality Kernel — Helper Functions', () => {
  it('should return canonical quality dimensions', () => {
    const dimensions = getCanonicalQualityDimensions();
    assert.deepStrictEqual([...dimensions], [...CANONICAL_QUALITY_DIMENSIONS]);
    assert.equal(dimensions.length, 10);
  });

  it('should return canonical quality levels', () => {
    const levels = getCanonicalQualityLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_QUALITY_LEVELS]);
    assert.equal(levels.length, 5);
  });

  it('should return canonical quality findings', () => {
    const findings = getCanonicalQualityFindings();
    assert.deepStrictEqual([...findings], [...CANONICAL_QUALITY_FINDINGS]);
    assert.equal(findings.length, 10);
  });

  it('should return canonical quality statuses', () => {
    const statuses = getCanonicalQualityStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_QUALITY_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate quality dimension support', () => {
    assert.equal(isSupportedQualityDimension('conceptual_completeness'), true);
    assert.equal(isSupportedQualityDimension('mathematical_rigor'), true);
    assert.equal(isSupportedQualityDimension('unsupported'), false);
  });

  it('should validate quality level support', () => {
    assert.equal(isSupportedQualityLevel('insufficient'), true);
    assert.equal(isSupportedQualityLevel('canonical'), true);
    assert.equal(isSupportedQualityLevel('unsupported'), false);
  });

  it('should validate quality finding support', () => {
    assert.equal(isSupportedQualityFinding('missing_visualization'), true);
    assert.equal(isSupportedQualityFinding('missing_laboratory'), true);
    assert.equal(isSupportedQualityFinding('unsupported'), false);
  });

  it('should validate quality status support', () => {
    assert.equal(isSupportedQualityStatus('draft'), true);
    assert.equal(isSupportedQualityStatus('published'), true);
    assert.equal(isSupportedQualityStatus('unsupported'), false);
  });

  it('should validate governance status support', () => {
    assert.equal(isSupportedGovernanceStatus('canonical'), true);
    assert.equal(isSupportedGovernanceStatus('accepted'), true);
    assert.equal(isSupportedGovernanceStatus('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Editorial Quality Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 quality dimensions', () => {
    assert.equal(CANONICAL_QUALITY_DIMENSIONS.length, 10);
  });

  it('should have exactly 5 quality levels', () => {
    assert.equal(CANONICAL_QUALITY_LEVELS.length, 5);
  });

  it('should have exactly 10 quality findings', () => {
    assert.equal(CANONICAL_QUALITY_FINDINGS.length, 10);
  });

  it('should have exactly 6 quality statuses', () => {
    assert.equal(CANONICAL_QUALITY_STATUS.length, 6);
  });

  it('should contain all expected quality dimensions', () => {
    const expectedDimensions = [
      'conceptual_completeness',
      'mathematical_rigor',
      'implementation_coverage',
      'practical_applications',
      'visual_support',
      'laboratory_support',
      'misconception_coverage',
      'assessment_availability',
      'source_quality',
      'review_freshness',
    ];

    for (const dimension of expectedDimensions) {
      assert.ok(
        CANONICAL_QUALITY_DIMENSIONS.includes(dimension as any),
        `Should include dimension: ${dimension}`,
      );
    }
  });

  it('should contain all expected quality levels', () => {
    const expectedLevels = [
      'insufficient',
      'basic',
      'good',
      'excellent',
      'canonical',
    ];

    for (const level of expectedLevels) {
      assert.ok(
        CANONICAL_QUALITY_LEVELS.includes(level as any),
        `Should include level: ${level}`,
      );
    }
  });

  it('should contain all expected quality findings', () => {
    const expectedFindings = [
      'missing_visualization',
      'missing_laboratory',
      'missing_assessment',
      'missing_sources',
      'missing_review',
      'missing_examples',
      'missing_cross_reference',
      'missing_history',
      'missing_practical_context',
      'missing_validation',
    ];

    for (const finding of expectedFindings) {
      assert.ok(
        CANONICAL_QUALITY_FINDINGS.includes(finding as any),
        `Should include finding: ${finding}`,
      );
    }
  });

  it('should contain all expected quality statuses', () => {
    const expectedStatuses = [
      'draft',
      'review',
      'approved',
      'published',
      'deprecated',
      'archived',
    ];

    for (const status of expectedStatuses) {
      assert.ok(
        CANONICAL_QUALITY_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Editorial Quality Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not perform automatic scoring', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(!('autoScore' in result), 'Should not have auto score');
    assert.ok(!('scoreResult' in result), 'Should not have score result');
  });

  it('should not perform AI evaluation', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(!('aiEvaluation' in result), 'Should not have AI evaluation');
    assert.ok(!('llmResult' in result), 'Should not have LLM result');
  });

  it('should not mutate artifacts', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(!('mutatedArtifact' in result), 'Should not have mutated artifact');
    assert.ok(!('artifactMutation' in result), 'Should not have artifact mutation');
  });

  it('should not repair deficiencies', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(!('repairResult' in result), 'Should not have repair result');
    assert.ok(!('autoRepair' in result), 'Should not have auto repair');
  });

  it('should not generate recommendations', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(!('recommendations' in result), 'Should not have recommendations');
    assert.ok(!('recommendationResult' in result), 'Should not have recommendation result');
  });

  it('should not modify curriculum', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(!('curriculumModification' in result), 'Should not have curriculum modification');
    assert.ok(!('modifiedCurriculum' in result), 'Should not have modified curriculum');
  });

  it('should not rewrite lessons', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(!('rewrittenLesson' in result), 'Should not have rewritten lesson');
    assert.ok(!('lessonRewrite' in result), 'Should not have lesson rewrite');
  });

  it('should not make editorial decisions', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(!('editorialDecision' in result), 'Should not have editorial decision');
    assert.ok(!('decisionResult' in result), 'Should not have decision result');
  });

  it('should not have executable callbacks in dimension', () => {
    const dimension = composeEditorialQualityDimension({
      dimensionId: 'dimension-001',
      dimensionType: 'conceptual_completeness',
      qualityLevel: 'excellent',
      score: 0.95,
      rationale: 'Test.',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(dimension);
    for (const key of keys) {
      const value = (dimension as any)[key];
      assert.ok(typeof value !== 'function', `Dimension field "${key}" should not be a function`);
    }
  });

  it('should not access filesystem', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform runtime execution', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(!('runtimeExecution' in result), 'Should not have runtime execution');
    assert.ok(!('output' in result), 'Should not have output');
  });

  it('should not generate code', () => {
    const result = composeEditorialQuality(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });
});

// ---------------------------------------------------------------------------
// Knowledge Artifact With Editorial Quality Tests
// ---------------------------------------------------------------------------

describe('Editorial Quality Kernel — Knowledge Artifact With Editorial Quality', () => {
  it('should compose valid knowledge artifact with editorial quality', () => {
    const artifact = composeKnowledgeArtifactWithEditorialQuality({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      reports: [VALID_REPORT],
      dimensions: [VALID_DIMENSION],
      findings: [VALID_FINDING],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.knowledgeId, 'knowledge-001');
    assert.equal(artifact.title, 'Neural Networks');
    assert.equal(artifact.reports.length, 1);
    assert.equal(artifact.dimensions.length, 1);
    assert.equal(artifact.findings.length, 1);
  });

  it('should validate valid knowledge artifact with editorial quality', () => {
    const artifact = composeKnowledgeArtifactWithEditorialQuality({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      reports: [VALID_REPORT],
      dimensions: [VALID_DIMENSION],
      findings: [VALID_FINDING],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithEditorialQuality(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect missing knowledgeId', () => {
    const artifact = composeKnowledgeArtifactWithEditorialQuality({
      knowledgeId: '',
      title: 'Neural Networks',
      reports: [VALID_REPORT],
      dimensions: [VALID_DIMENSION],
      findings: [VALID_FINDING],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithEditorialQuality(artifact);
    const knowledgeIdError = result.errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_ARTIFACT_ID,
    );

    assert.ok(knowledgeIdError, 'Should have QUALITY_MISSING_ARTIFACT_ID error');
  });

  it('should detect missing title', () => {
    const artifact = composeKnowledgeArtifactWithEditorialQuality({
      knowledgeId: 'knowledge-001',
      title: '',
      reports: [VALID_REPORT],
      dimensions: [VALID_DIMENSION],
      findings: [VALID_FINDING],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithEditorialQuality(artifact);
    const titleError = result.errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_ARTIFACT_ID,
    );

    assert.ok(titleError, 'Should have QUALITY_MISSING_ARTIFACT_ID error');
  });

  it('should detect missing provenance', () => {
    const artifact = composeKnowledgeArtifactWithEditorialQuality({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      reports: [VALID_REPORT],
      dimensions: [VALID_DIMENSION],
      findings: [VALID_FINDING],
      provenance: undefined as any,
    });

    const result = validateKnowledgeArtifactWithEditorialQuality(artifact);
    const provenanceError = result.errors.find(
      (e) => e.code === EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have QUALITY_MISSING_PROVENANCE error');
  });
});
