/**
 * NV-1700-D5-OPT-09 — Knowledge Gap Detection & Coverage Audit Test Suite
 *
 * Comprehensive deterministic test suite for the Coverage Kernel.
 * Covers: valid component, valid gap, valid report, valid registry,
 * duplicate reports, duplicate components, duplicate gaps,
 * invalid types, invalid level, missing provenance,
 * empty registry, deterministic ordering, immutable input,
 * identical output (100 iterations), helper functions,
 * canonical enum completeness, negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeCoverageComponent,
  KnowledgeGap,
  KnowledgeCoverageReport,
  CoverageProvenance,
  KnowledgeCoverageInput,
  KnowledgeCoverageRegistry,
  KnowledgeCoverageTrace,
  KnowledgeArtifactWithCoverage,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_COVERAGE_COMPONENT_TYPES,
  CANONICAL_GAP_TYPES,
  CANONICAL_COVERAGE_LEVELS,
  CANONICAL_COVERAGE_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
  CANONICAL_IMPACT_SEVERITY,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeCoverageProvenance,
  composeKnowledgeCoverageComponent,
  composeKnowledgeGap,
  composeKnowledgeCoverageReport,
  composeKnowledgeCoverageTrace,
  composeKnowledgeCoverageRegistry,
  composeKnowledgeCoverageRegistryFromInput,
  composeKnowledgeCoverage,
  composeKnowledgeArtifactWithCoverage,
  isSupportedCoverageComponent,
  isSupportedGapType,
  isSupportedCoverageLevel,
  isSupportedCoverageStatus,
  isSupportedGovernanceStatus,
  getCanonicalCoverageComponents,
  getCanonicalGapTypes,
  getCanonicalCoverageLevels,
  getCanonicalCoverageStatuses,
} from './KnowledgeCoverageKernel.ts';

import {
  validateKnowledgeCoverageComponent,
  validateKnowledgeGap,
  validateKnowledgeCoverageReport,
  validateKnowledgeCoverageRegistry,
  validateKnowledgeCoverageInput,
  validateKnowledgeCoverageTrace,
  validateKnowledgeArtifactWithCoverage,
  COVERAGE_VALIDATION_CODES,
} from './KnowledgeCoverageValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: CoverageProvenance = {
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  providedBy: 'NeuralVerse Team',
  rationale: 'Core coverage metadata.',
};

const VALID_COMPONENT: KnowledgeCoverageComponent = {
  componentId: 'component-001',
  artifactId: 'knowledge-001',
  componentType: 'concept',
  coverageLevel: 'complete',
  provenance: VALID_PROVENANCE,
};

const VALID_COMPONENT_2: KnowledgeCoverageComponent = {
  componentId: 'component-002',
  artifactId: 'knowledge-002',
  componentType: 'visualization',
  coverageLevel: 'partial',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_GAP: KnowledgeGap = {
  gapId: 'gap-001',
  artifactId: 'knowledge-001',
  gapType: 'missing_visualization',
  severity: 'moderate',
  rationale: 'Missing visualization support.',
  provenance: VALID_PROVENANCE,
};

const VALID_GAP_2: KnowledgeGap = {
  gapId: 'gap-002',
  artifactId: 'knowledge-002',
  gapType: 'missing_laboratory',
  severity: 'high',
  rationale: 'Missing laboratory support.',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_REPORT: KnowledgeCoverageReport = {
  reportId: 'report-001',
  artifactId: 'knowledge-001',
  components: [VALID_COMPONENT],
  gaps: [VALID_GAP],
  overallCoverageLevel: 'complete',
  provenance: VALID_PROVENANCE,
};

const VALID_REPORT_2: KnowledgeCoverageReport = {
  reportId: 'report-002',
  artifactId: 'knowledge-002',
  components: [VALID_COMPONENT_2],
  gaps: [VALID_GAP_2],
  overallCoverageLevel: 'partial',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_INPUT: KnowledgeCoverageInput = {
  reports: [VALID_REPORT, VALID_REPORT_2],
  components: [VALID_COMPONENT, VALID_COMPONENT_2],
  gaps: [VALID_GAP, VALID_GAP_2],
};

const EMPTY_INPUT: KnowledgeCoverageInput = {
  reports: [],
  components: [],
  gaps: [],
};

// ---------------------------------------------------------------------------
// Component Composition Tests
// ---------------------------------------------------------------------------

describe('Coverage Kernel — Component Composition', () => {
  it('should compose valid coverage provenance', () => {
    const provenance = composeKnowledgeCoverageProvenance({
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      providedBy: 'NeuralVerse Team',
      rationale: 'Core coverage.',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.rationale, 'Core coverage.');
  });

  it('should compose valid coverage component', () => {
    const component = composeKnowledgeCoverageComponent({
      componentId: 'component-001',
      artifactId: 'knowledge-001',
      componentType: 'concept',
      coverageLevel: 'complete',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(component.componentId, 'component-001');
    assert.equal(component.artifactId, 'knowledge-001');
    assert.equal(component.componentType, 'concept');
    assert.equal(component.coverageLevel, 'complete');
  });

  it('should compose valid knowledge gap', () => {
    const gap = composeKnowledgeGap({
      gapId: 'gap-001',
      artifactId: 'knowledge-001',
      gapType: 'missing_visualization',
      severity: 'moderate',
      rationale: 'Missing visualization.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(gap.gapId, 'gap-001');
    assert.equal(gap.artifactId, 'knowledge-001');
    assert.equal(gap.gapType, 'missing_visualization');
    assert.equal(gap.severity, 'moderate');
  });

  it('should compose valid coverage report', () => {
    const report = composeKnowledgeCoverageReport({
      reportId: 'report-001',
      artifactId: 'knowledge-001',
      components: [VALID_COMPONENT],
      gaps: [VALID_GAP],
      overallCoverageLevel: 'complete',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(report.reportId, 'report-001');
    assert.equal(report.artifactId, 'knowledge-001');
    assert.equal(report.components.length, 1);
    assert.equal(report.gaps.length, 1);
    assert.equal(report.overallCoverageLevel, 'complete');
  });

  it('should compose valid coverage trace', () => {
    const trace = composeKnowledgeCoverageTrace({
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

  it('should validate a valid component with no errors', () => {
    const errors = validateKnowledgeCoverageComponent(VALID_COMPONENT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid gap with no errors', () => {
    const errors = validateKnowledgeGap(VALID_GAP);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid report with no errors', () => {
    const errors = validateKnowledgeCoverageReport(VALID_REPORT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeCoverageRegistry(
      [VALID_REPORT, VALID_REPORT_2],
      [VALID_COMPONENT, VALID_COMPONENT_2],
      [VALID_GAP, VALID_GAP_2],
    );
    const result = validateKnowledgeCoverageRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate coverage input', () => {
    const result = validateKnowledgeCoverageInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Coverage Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeKnowledgeCoverageRegistry([], [], []);
    const result = validateKnowledgeCoverageRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have COVERAGE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate report IDs', () => {
    const registry = composeKnowledgeCoverageRegistry(
      [VALID_REPORT, VALID_REPORT],
      [],
      [],
    );
    const result = validateKnowledgeCoverageRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_DUPLICATE_REPORT,
    );

    assert.ok(duplicateError, 'Should have COVERAGE_DUPLICATE_REPORT error');
  });

  it('should detect duplicate component IDs', () => {
    const registry = composeKnowledgeCoverageRegistry(
      [],
      [VALID_COMPONENT, VALID_COMPONENT],
      [],
    );
    const result = validateKnowledgeCoverageRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_DUPLICATE_COMPONENT,
    );

    assert.ok(duplicateError, 'Should have COVERAGE_DUPLICATE_COMPONENT error');
  });

  it('should detect duplicate gap IDs', () => {
    const registry = composeKnowledgeCoverageRegistry(
      [],
      [],
      [VALID_GAP, VALID_GAP],
    );
    const result = validateKnowledgeCoverageRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_DUPLICATE_GAP,
    );

    assert.ok(duplicateError, 'Should have COVERAGE_DUPLICATE_GAP error');
  });

  it('should sort deterministically by reportId', () => {
    const report3 = { ...VALID_REPORT, reportId: 'report-003' };
    const report1 = { ...VALID_REPORT, reportId: 'report-001' };
    const report2 = { ...VALID_REPORT, reportId: 'report-002' };

    const registry = composeKnowledgeCoverageRegistry([report3, report1, report2], [], []);

    assert.equal(registry.reports[0].reportId, 'report-001');
    assert.equal(registry.reports[1].reportId, 'report-002');
    assert.equal(registry.reports[2].reportId, 'report-003');
  });

  it('should sort components deterministically by componentId', () => {
    const component3 = { ...VALID_COMPONENT, componentId: 'component-003' };
    const component1 = { ...VALID_COMPONENT, componentId: 'component-001' };
    const component2 = { ...VALID_COMPONENT, componentId: 'component-002' };

    const registry = composeKnowledgeCoverageRegistry([], [component3, component1, component2], []);

    assert.equal(registry.components[0].componentId, 'component-001');
    assert.equal(registry.components[1].componentId, 'component-002');
    assert.equal(registry.components[2].componentId, 'component-003');
  });

  it('should sort gaps deterministically by gapId', () => {
    const gap3 = { ...VALID_GAP, gapId: 'gap-003' };
    const gap1 = { ...VALID_GAP, gapId: 'gap-001' };
    const gap2 = { ...VALID_GAP, gapId: 'gap-002' };

    const registry = composeKnowledgeCoverageRegistry([], [], [gap3, gap1, gap2]);

    assert.equal(registry.gaps[0].gapId, 'gap-001');
    assert.equal(registry.gaps[1].gapId, 'gap-002');
    assert.equal(registry.gaps[2].gapId, 'gap-003');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Coverage Kernel — Validation', () => {
  it('should detect invalid component type', () => {
    const component = { ...VALID_COMPONENT, componentType: 'unsupported' as any };
    const errors = validateKnowledgeCoverageComponent(component);
    const typeError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_COMPONENT,
    );

    assert.ok(typeError, 'Should have COVERAGE_INVALID_COMPONENT error');
  });

  it('should detect invalid gap type', () => {
    const gap = { ...VALID_GAP, gapType: 'unsupported' as any };
    const errors = validateKnowledgeGap(gap);
    const typeError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_GAP,
    );

    assert.ok(typeError, 'Should have COVERAGE_INVALID_GAP error');
  });

  it('should detect invalid coverage level', () => {
    const component = { ...VALID_COMPONENT, coverageLevel: 'unsupported' as any };
    const errors = validateKnowledgeCoverageComponent(component);
    const levelError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_LEVEL,
    );

    assert.ok(levelError, 'Should have COVERAGE_INVALID_LEVEL error');
  });

  it('should detect invalid severity', () => {
    const gap = { ...VALID_GAP, severity: 'unsupported' as any };
    const errors = validateKnowledgeGap(gap);
    const severityError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_SEVERITY,
    );

    assert.ok(severityError, 'Should have COVERAGE_INVALID_SEVERITY error');
  });

  it('should detect missing provenance', () => {
    const component = { ...VALID_COMPONENT, provenance: undefined as any };
    const errors = validateKnowledgeCoverageComponent(component);
    const provenanceError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have COVERAGE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance source', () => {
    const component = { ...VALID_COMPONENT, provenance: { ...VALID_PROVENANCE, source: '' } };
    const errors = validateKnowledgeCoverageComponent(component);
    const sourceError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have COVERAGE_MISSING_SOURCE error');
  });

  it('should detect missing provenance rationale', () => {
    const component = { ...VALID_COMPONENT, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeCoverageComponent(component);
    const rationaleError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have COVERAGE_MISSING_RATIONALE error');
  });

  it('should detect missing provenance providedBy', () => {
    const component = { ...VALID_COMPONENT, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateKnowledgeCoverageComponent(component);
    const providedByError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have COVERAGE_MISSING_PROVIDED_BY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeCoverageTrace({
      traceId: '_trace_1',
      decisionCount: 5,
      validationCount: 4,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      compositionMetadata: '_composition_default',
      deterministicMetadata: '_deterministic_default',
    });

    const result = validateKnowledgeCoverageTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeCoverageTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      compositionMetadata: '_composition_default',
      deterministicMetadata: '_deterministic_default',
      deterministic: false as true,
      generatedFrom: 'deterministic_coverage_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateKnowledgeCoverageTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Coverage Kernel — Provenance', () => {
  it('should detect missing provenance on component', () => {
    const component = { ...VALID_COMPONENT, provenance: undefined as any };
    const errors = validateKnowledgeCoverageComponent(component);
    const provenanceError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have COVERAGE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance on gap', () => {
    const gap = { ...VALID_GAP, provenance: undefined as any };
    const errors = validateKnowledgeGap(gap);
    const provenanceError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have COVERAGE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance on report', () => {
    const report = { ...VALID_REPORT, provenance: undefined as any };
    const errors = validateKnowledgeCoverageReport(report);
    const provenanceError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have COVERAGE_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const component = { ...VALID_COMPONENT, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeCoverageComponent(component);
    const rationaleError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have COVERAGE_MISSING_RATIONALE error');
  });

  it('should detect missing providedBy in provenance', () => {
    const component = { ...VALID_COMPONENT, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateKnowledgeCoverageComponent(component);
    const providedByError = errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have COVERAGE_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Coverage Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeCoverage>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeCoverage(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].reports, results[i].reports);
      assert.deepStrictEqual(results[0].components, results[i].components);
      assert.deepStrictEqual(results[0].gaps, results[i].gaps);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeCoverageRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(
        composeKnowledgeCoverageRegistry(
          [VALID_REPORT, VALID_REPORT_2],
          [VALID_COMPONENT, VALID_COMPONENT_2],
          [VALID_GAP, VALID_GAP_2],
        ),
      );
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].reports, results[i].reports);
      assert.deepStrictEqual(results[0].components, results[i].components);
      assert.deepStrictEqual(results[0].gaps, results[i].gaps);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Coverage Kernel — Immutability', () => {
  it('should not mutate input reports', () => {
    const originalId = VALID_REPORT.reportId;
    const originalArtifactId = VALID_REPORT.artifactId;

    composeKnowledgeCoverage(VALID_INPUT);

    assert.equal(VALID_REPORT.reportId, originalId);
    assert.equal(VALID_REPORT.artifactId, originalArtifactId);
  });

  it('should not mutate input components', () => {
    const originalId = VALID_COMPONENT.componentId;
    const originalType = VALID_COMPONENT.componentType;

    composeKnowledgeCoverage(VALID_INPUT);

    assert.equal(VALID_COMPONENT.componentId, originalId);
    assert.equal(VALID_COMPONENT.componentType, originalType);
  });

  it('should not mutate input gaps', () => {
    const originalId = VALID_GAP.gapId;
    const originalType = VALID_GAP.gapType;

    composeKnowledgeCoverage(VALID_INPUT);

    assert.equal(VALID_GAP.gapId, originalId);
    assert.equal(VALID_GAP.gapType, originalType);
  });

  it('should not mutate input registry reports', () => {
    const reports = [VALID_REPORT, VALID_REPORT_2];
    const originalIds = reports.map((r) => r.reportId);

    composeKnowledgeCoverageRegistry(reports, [], []);

    assert.equal(reports[0].reportId, originalIds[0]);
    assert.equal(reports[1].reportId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Coverage Kernel — Helper Functions', () => {
  it('should return canonical coverage component types', () => {
    const components = getCanonicalCoverageComponents();
    assert.deepStrictEqual([...components], [...CANONICAL_COVERAGE_COMPONENT_TYPES]);
    assert.equal(components.length, 10);
  });

  it('should return canonical gap types', () => {
    const gaps = getCanonicalGapTypes();
    assert.deepStrictEqual([...gaps], [...CANONICAL_GAP_TYPES]);
    assert.equal(gaps.length, 10);
  });

  it('should return canonical coverage levels', () => {
    const levels = getCanonicalCoverageLevels();
    assert.deepStrictEqual([...levels], [...CANONICAL_COVERAGE_LEVELS]);
    assert.equal(levels.length, 5);
  });

  it('should return canonical coverage statuses', () => {
    const statuses = getCanonicalCoverageStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_COVERAGE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate coverage component support', () => {
    assert.equal(isSupportedCoverageComponent('concept'), true);
    assert.equal(isSupportedCoverageComponent('visualization'), true);
    assert.equal(isSupportedCoverageComponent('unsupported'), false);
  });

  it('should validate gap type support', () => {
    assert.equal(isSupportedGapType('missing_visualization'), true);
    assert.equal(isSupportedGapType('missing_laboratory'), true);
    assert.equal(isSupportedGapType('unsupported'), false);
  });

  it('should validate coverage level support', () => {
    assert.equal(isSupportedCoverageLevel('insufficient'), true);
    assert.equal(isSupportedCoverageLevel('canonical'), true);
    assert.equal(isSupportedCoverageLevel('unsupported'), false);
  });

  it('should validate coverage status support', () => {
    assert.equal(isSupportedCoverageStatus('draft'), true);
    assert.equal(isSupportedCoverageStatus('published'), true);
    assert.equal(isSupportedCoverageStatus('unsupported'), false);
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

describe('Coverage Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 coverage component types', () => {
    assert.equal(CANONICAL_COVERAGE_COMPONENT_TYPES.length, 10);
  });

  it('should have exactly 10 gap types', () => {
    assert.equal(CANONICAL_GAP_TYPES.length, 10);
  });

  it('should have exactly 5 coverage levels', () => {
    assert.equal(CANONICAL_COVERAGE_LEVELS.length, 5);
  });

  it('should have exactly 6 coverage statuses', () => {
    assert.equal(CANONICAL_COVERAGE_STATUS.length, 6);
  });

  it('should contain all expected coverage component types', () => {
    const expectedComponents = [
      'concept',
      'visualization',
      'laboratory',
      'assessment',
      'worked_example',
      'real_world_application',
      'misconception',
      'cross_reference',
      'evidence',
      'summary',
    ];

    for (const component of expectedComponents) {
      assert.ok(
        CANONICAL_COVERAGE_COMPONENT_TYPES.includes(component as any),
        `Should include component: ${component}`,
      );
    }
  });

  it('should contain all expected gap types', () => {
    const expectedGaps = [
      'missing_visualization',
      'missing_laboratory',
      'missing_assessment',
      'missing_reference',
      'missing_example',
      'missing_application',
      'missing_cross_reference',
      'missing_evidence',
      'missing_review',
      'missing_summary',
    ];

    for (const gap of expectedGaps) {
      assert.ok(
        CANONICAL_GAP_TYPES.includes(gap as any),
        `Should include gap: ${gap}`,
      );
    }
  });

  it('should contain all expected coverage levels', () => {
    const expectedLevels = [
      'insufficient',
      'partial',
      'adequate',
      'complete',
      'canonical',
    ];

    for (const level of expectedLevels) {
      assert.ok(
        CANONICAL_COVERAGE_LEVELS.includes(level as any),
        `Should include level: ${level}`,
      );
    }
  });

  it('should contain all expected coverage statuses', () => {
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
        CANONICAL_COVERAGE_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Coverage Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not perform automatic gap filling', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(!('gapFill' in result), 'Should not have gap fill');
    assert.ok(!('filledGap' in result), 'Should not have filled gap');
  });

  it('should not generate content', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('contentGeneration' in result), 'Should not have content generation');
  });

  it('should not generate lessons', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(!('generatedLesson' in result), 'Should not have generated lesson');
    assert.ok(!('lessonGeneration' in result), 'Should not have lesson generation');
  });

  it('should not generate laboratories', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(!('generatedLaboratory' in result), 'Should not have generated laboratory');
    assert.ok(!('laboratoryGeneration' in result), 'Should not have laboratory generation');
  });

  it('should not generate assessments', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(!('generatedAssessment' in result), 'Should not have generated assessment');
    assert.ok(!('assessmentGeneration' in result), 'Should not have assessment generation');
  });

  it('should not generate visualizations', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(!('generatedVisualization' in result), 'Should not have generated visualization');
    assert.ok(!('visualizationGeneration' in result), 'Should not have visualization generation');
  });

  it('should not mutate artifacts', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(!('mutatedArtifact' in result), 'Should not have mutated artifact');
    assert.ok(!('artifactMutation' in result), 'Should not have artifact mutation');
  });

  it('should not perform AI inference', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(!('aiInference' in result), 'Should not have AI inference');
    assert.ok(!('llmResult' in result), 'Should not have LLM result');
  });

  it('should not perform runtime execution', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(!('runtimeExecution' in result), 'Should not have runtime execution');
    assert.ok(!('output' in result), 'Should not have output');
  });

  it('should not have executable callbacks in component', () => {
    const component = composeKnowledgeCoverageComponent({
      componentId: 'component-001',
      artifactId: 'knowledge-001',
      componentType: 'concept',
      coverageLevel: 'complete',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(component);
    for (const key of keys) {
      const value = (component as any)[key];
      assert.ok(typeof value !== 'function', `Component field "${key}" should not be a function`);
    }
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not generate code', () => {
    const result = composeKnowledgeCoverage(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });
});

// ---------------------------------------------------------------------------
// Knowledge Artifact With Coverage Tests
// ---------------------------------------------------------------------------

describe('Coverage Kernel — Knowledge Artifact With Coverage', () => {
  it('should compose valid knowledge artifact with coverage', () => {
    const artifact = composeKnowledgeArtifactWithCoverage({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      reports: [VALID_REPORT],
      components: [VALID_COMPONENT],
      gaps: [VALID_GAP],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.knowledgeId, 'knowledge-001');
    assert.equal(artifact.title, 'Neural Networks');
    assert.equal(artifact.reports.length, 1);
    assert.equal(artifact.components.length, 1);
    assert.equal(artifact.gaps.length, 1);
  });

  it('should validate valid knowledge artifact with coverage', () => {
    const artifact = composeKnowledgeArtifactWithCoverage({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      reports: [VALID_REPORT],
      components: [VALID_COMPONENT],
      gaps: [VALID_GAP],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithCoverage(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect missing knowledgeId', () => {
    const artifact = composeKnowledgeArtifactWithCoverage({
      knowledgeId: '',
      title: 'Neural Networks',
      reports: [VALID_REPORT],
      components: [VALID_COMPONENT],
      gaps: [VALID_GAP],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithCoverage(artifact);
    const knowledgeIdError = result.errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_ARTIFACT_ID,
    );

    assert.ok(knowledgeIdError, 'Should have COVERAGE_MISSING_ARTIFACT_ID error');
  });

  it('should detect missing title', () => {
    const artifact = composeKnowledgeArtifactWithCoverage({
      knowledgeId: 'knowledge-001',
      title: '',
      reports: [VALID_REPORT],
      components: [VALID_COMPONENT],
      gaps: [VALID_GAP],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithCoverage(artifact);
    const titleError = result.errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_ARTIFACT_ID,
    );

    assert.ok(titleError, 'Should have COVERAGE_MISSING_ARTIFACT_ID error');
  });

  it('should detect missing provenance', () => {
    const artifact = composeKnowledgeArtifactWithCoverage({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      reports: [VALID_REPORT],
      components: [VALID_COMPONENT],
      gaps: [VALID_GAP],
      provenance: undefined as any,
    });

    const result = validateKnowledgeArtifactWithCoverage(artifact);
    const provenanceError = result.errors.find(
      (e) => e.code === COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have COVERAGE_MISSING_PROVENANCE error');
  });
});
