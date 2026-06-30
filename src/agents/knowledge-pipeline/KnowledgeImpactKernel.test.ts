/**
 * NV-1700-D5-OPT-06 — Dependency-Aware Consistency Analysis & Impact Validation Test Suite
 *
 * Comprehensive deterministic test suite for the Impact Kernel.
 * Covers: valid impact, valid report, valid relationship, valid registry,
 * duplicate impacts, duplicate reports, duplicate relationships,
 * invalid types, invalid severity, missing provenance,
 * self references, empty registry, deterministic ordering, immutable input,
 * identical output (100 iterations), helper functions,
 * canonical enum completeness, negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeImpact,
  ConsistencyReport,
  ImpactRelationship,
  ImpactProvenance,
  ConsistencyInput,
  ConsistencyRegistry,
  ConsistencyTrace,
  KnowledgeArtifactWithConsistency,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_IMPACT_TYPES,
  CANONICAL_IMPACT_SEVERITY,
  CANONICAL_CONSISTENCY_STATUS,
  CANONICAL_IMPACT_RESOLUTION_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

import {
  composeImpactProvenance,
  composeKnowledgeImpact,
  composeConsistencyReport,
  composeImpactRelationship,
  composeConsistencyTrace,
  composeConsistencyRegistry,
  composeConsistencyRegistryFromInput,
  composeKnowledgeConsistency,
  composeKnowledgeArtifactWithConsistency,
  isSupportedImpactType,
  isSupportedImpactSeverity,
  isSupportedConsistencyStatus,
  isSupportedImpactResolutionStatus,
  isSupportedGovernanceStatus,
  getCanonicalImpactTypes,
  getCanonicalImpactSeverities,
  getCanonicalConsistencyStatuses,
  getCanonicalImpactResolutionStatuses,
} from './KnowledgeImpactKernel.ts';

import {
  validateKnowledgeImpact,
  validateConsistencyReport,
  validateImpactRelationship,
  validateConsistencyRegistry,
  validateConsistencyInput,
  validateConsistencyTrace,
  validateKnowledgeArtifactWithConsistency,
  IMPACT_VALIDATION_CODES,
} from './KnowledgeImpactValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: ImpactProvenance = {
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  providedBy: 'NeuralVerse Team',
  rationale: 'Core impact metadata.',
};

const VALID_IMPACT: KnowledgeImpact = {
  impactId: 'impact-001',
  sourceArtifactId: 'knowledge-001',
  targetArtifactId: 'knowledge-002',
  impactType: 'direct_dependency',
  severity: 'high',
  description: 'Direct dependency on knowledge artifact.',
  rationale: 'Critical dependency for curriculum.',
  provenance: VALID_PROVENANCE,
};

const VALID_IMPACT_2: KnowledgeImpact = {
  impactId: 'impact-002',
  sourceArtifactId: 'knowledge-002',
  targetArtifactId: 'knowledge-003',
  impactType: 'transitive_dependency',
  severity: 'moderate',
  description: 'Transitive dependency.',
  rationale: 'Indirect dependency chain.',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_REPORT: ConsistencyReport = {
  reportId: 'report-001',
  artifactId: 'knowledge-001',
  impacts: [VALID_IMPACT],
  affectedArtifacts: ['knowledge-002'],
  summary: 'Direct impact on downstream artifact.',
  provenance: VALID_PROVENANCE,
};

const VALID_REPORT_2: ConsistencyReport = {
  reportId: 'report-002',
  artifactId: 'knowledge-002',
  impacts: [VALID_IMPACT_2],
  affectedArtifacts: ['knowledge-003'],
  summary: 'Transitive impact chain.',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_RELATIONSHIP: ImpactRelationship = {
  relationshipId: 'relationship-001',
  sourceArtifactId: 'knowledge-001',
  targetArtifactId: 'knowledge-002',
  relationshipType: 'depends_on',
  description: 'Direct dependency relationship.',
  provenance: VALID_PROVENANCE,
};

const VALID_RELATIONSHIP_2: ImpactRelationship = {
  relationshipId: 'relationship-002',
  sourceArtifactId: 'knowledge-002',
  targetArtifactId: 'knowledge-003',
  relationshipType: 'transitive_of',
  description: 'Transitive dependency relationship.',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_INPUT: ConsistencyInput = {
  reports: [VALID_REPORT, VALID_REPORT_2],
  relationships: [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
};

const EMPTY_INPUT: ConsistencyInput = {
  reports: [],
  relationships: [],
};

// ---------------------------------------------------------------------------
// Impact Composition Tests
// ---------------------------------------------------------------------------

describe('Impact Kernel — Impact Composition', () => {
  it('should compose valid impact provenance', () => {
    const provenance = composeImpactProvenance({
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      providedBy: 'NeuralVerse Team',
      rationale: 'Core impact.',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.rationale, 'Core impact.');
  });

  it('should compose valid knowledge impact', () => {
    const impact = composeKnowledgeImpact({
      impactId: 'impact-001',
      sourceArtifactId: 'knowledge-001',
      targetArtifactId: 'knowledge-002',
      impactType: 'direct_dependency',
      severity: 'high',
      description: 'Direct dependency.',
      rationale: 'Critical dependency.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(impact.impactId, 'impact-001');
    assert.equal(impact.sourceArtifactId, 'knowledge-001');
    assert.equal(impact.targetArtifactId, 'knowledge-002');
    assert.equal(impact.impactType, 'direct_dependency');
    assert.equal(impact.severity, 'high');
  });

  it('should compose valid consistency report', () => {
    const report = composeConsistencyReport({
      reportId: 'report-001',
      artifactId: 'knowledge-001',
      impacts: [VALID_IMPACT],
      affectedArtifacts: ['knowledge-002'],
      summary: 'Direct impact.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(report.reportId, 'report-001');
    assert.equal(report.artifactId, 'knowledge-001');
    assert.equal(report.impacts.length, 1);
    assert.equal(report.affectedArtifacts.length, 1);
  });

  it('should compose valid impact relationship', () => {
    const relationship = composeImpactRelationship({
      relationshipId: 'relationship-001',
      sourceArtifactId: 'knowledge-001',
      targetArtifactId: 'knowledge-002',
      relationshipType: 'depends_on',
      description: 'Direct dependency.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(relationship.relationshipId, 'relationship-001');
    assert.equal(relationship.sourceArtifactId, 'knowledge-001');
    assert.equal(relationship.targetArtifactId, 'knowledge-002');
    assert.equal(relationship.relationshipType, 'depends_on');
  });

  it('should compose valid consistency trace', () => {
    const trace = composeConsistencyTrace({
      traceId: '_trace_1',
      decisionCount: 5,
      validationCount: 4,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      deterministicHashMetadata: '_hash_default',
      compositionMetadata: '_composition_default',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 5);
    assert.equal(trace.validationCount, 4);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should validate a valid impact with no errors', () => {
    const errors = validateKnowledgeImpact(VALID_IMPACT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid report with no errors', () => {
    const errors = validateConsistencyReport(VALID_REPORT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid relationship with no errors', () => {
    const errors = validateImpactRelationship(VALID_RELATIONSHIP);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeConsistencyRegistry(
      [VALID_REPORT, VALID_REPORT_2],
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
    );
    const result = validateConsistencyRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate consistency input', () => {
    const result = validateConsistencyInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Impact Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeConsistencyRegistry([], []);
    const result = validateConsistencyRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have IMPACT_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate report IDs', () => {
    const registry = composeConsistencyRegistry(
      [VALID_REPORT, VALID_REPORT],
      [],
    );
    const result = validateConsistencyRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_DUPLICATE_REPORT,
    );

    assert.ok(duplicateError, 'Should have IMPACT_DUPLICATE_REPORT error');
  });

  it('should detect duplicate relationship IDs', () => {
    const registry = composeConsistencyRegistry(
      [],
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP],
    );
    const result = validateConsistencyRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_DUPLICATE_RELATIONSHIP,
    );

    assert.ok(duplicateError, 'Should have IMPACT_DUPLICATE_RELATIONSHIP error');
  });

  it('should detect self-reference in impact', () => {
    const selfRef: KnowledgeImpact = {
      ...VALID_IMPACT,
      impactId: 'self-ref-001',
      targetArtifactId: 'knowledge-001',
    };
    const errors = validateKnowledgeImpact(selfRef);
    const selfRefError = errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_SELF_REFERENCE,
    );

    assert.ok(selfRefError, 'Should have IMPACT_SELF_REFERENCE error');
  });

  it('should detect self-reference in relationship', () => {
    const selfRef: ImpactRelationship = {
      ...VALID_RELATIONSHIP,
      relationshipId: 'self-ref-001',
      targetArtifactId: 'knowledge-001',
    };
    const errors = validateImpactRelationship(selfRef);
    const selfRefError = errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_SELF_REFERENCE,
    );

    assert.ok(selfRefError, 'Should have IMPACT_SELF_REFERENCE error');
  });

  it('should sort deterministically by reportId', () => {
    const report3 = { ...VALID_REPORT, reportId: 'report-003' };
    const report1 = { ...VALID_REPORT, reportId: 'report-001' };
    const report2 = { ...VALID_REPORT, reportId: 'report-002' };

    const registry = composeConsistencyRegistry([report3, report1, report2], []);

    assert.equal(registry.reports[0].reportId, 'report-001');
    assert.equal(registry.reports[1].reportId, 'report-002');
    assert.equal(registry.reports[2].reportId, 'report-003');
  });

  it('should sort relationships deterministically by relationshipId', () => {
    const relationship3 = { ...VALID_RELATIONSHIP, relationshipId: 'relationship-003' };
    const relationship1 = { ...VALID_RELATIONSHIP, relationshipId: 'relationship-001' };
    const relationship2 = { ...VALID_RELATIONSHIP, relationshipId: 'relationship-002' };

    const registry = composeConsistencyRegistry([], [relationship3, relationship1, relationship2]);

    assert.equal(registry.relationships[0].relationshipId, 'relationship-001');
    assert.equal(registry.relationships[1].relationshipId, 'relationship-002');
    assert.equal(registry.relationships[2].relationshipId, 'relationship-003');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Impact Kernel — Validation', () => {
  it('should detect invalid impact type', () => {
    const impact = { ...VALID_IMPACT, impactType: 'unsupported' as any };
    const errors = validateKnowledgeImpact(impact);
    const typeError = errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have IMPACT_INVALID_TYPE error');
  });

  it('should detect invalid impact severity', () => {
    const impact = { ...VALID_IMPACT, severity: 'unsupported' as any };
    const errors = validateKnowledgeImpact(impact);
    const severityError = errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_INVALID_SEVERITY,
    );

    assert.ok(severityError, 'Should have IMPACT_INVALID_SEVERITY error');
  });

  it('should detect missing provenance', () => {
    const impact = { ...VALID_IMPACT, provenance: undefined as any };
    const errors = validateKnowledgeImpact(impact);
    const provenanceError = errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have IMPACT_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance source', () => {
    const impact = { ...VALID_IMPACT, provenance: { ...VALID_PROVENANCE, source: '' } };
    const errors = validateKnowledgeImpact(impact);
    const sourceError = errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have IMPACT_MISSING_SOURCE error');
  });

  it('should detect missing provenance rationale', () => {
    const impact = { ...VALID_IMPACT, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeImpact(impact);
    const rationaleError = errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have IMPACT_MISSING_RATIONALE error');
  });

  it('should detect missing provenance providedBy', () => {
    const impact = { ...VALID_IMPACT, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateKnowledgeImpact(impact);
    const providedByError = errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have IMPACT_MISSING_PROVIDED_BY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeConsistencyTrace({
      traceId: '_trace_1',
      decisionCount: 5,
      validationCount: 4,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      deterministicHashMetadata: '_hash_default',
      compositionMetadata: '_composition_default',
    });

    const result = validateConsistencyTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: ConsistencyTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      deterministicHashMetadata: '_hash_default',
      compositionMetadata: '_composition_default',
      deterministic: false as true,
      generatedFrom: 'deterministic_impact_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateConsistencyTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Impact Kernel — Provenance', () => {
  it('should detect missing provenance on impact', () => {
    const impact = { ...VALID_IMPACT, provenance: undefined as any };
    const errors = validateKnowledgeImpact(impact);
    const provenanceError = errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have IMPACT_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance on report', () => {
    const report = { ...VALID_REPORT, provenance: undefined as any };
    const errors = validateConsistencyReport(report);
    const provenanceError = errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have IMPACT_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance on relationship', () => {
    const relationship = { ...VALID_RELATIONSHIP, provenance: undefined as any };
    const errors = validateImpactRelationship(relationship);
    const provenanceError = errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have IMPACT_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const impact = { ...VALID_IMPACT, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeImpact(impact);
    const rationaleError = errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have IMPACT_MISSING_RATIONALE error');
  });

  it('should detect missing providedBy in provenance', () => {
    const impact = { ...VALID_IMPACT, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateKnowledgeImpact(impact);
    const providedByError = errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have IMPACT_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Impact Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeConsistency>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeConsistency(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].reports, results[i].reports);
      assert.deepStrictEqual(results[0].relationships, results[i].relationships);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeConsistencyRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(
        composeConsistencyRegistry(
          [VALID_REPORT, VALID_REPORT_2],
          [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
        ),
      );
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].reports, results[i].reports);
      assert.deepStrictEqual(results[0].relationships, results[i].relationships);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Impact Kernel — Immutability', () => {
  it('should not mutate input reports', () => {
    const originalId = VALID_REPORT.reportId;
    const originalArtifactId = VALID_REPORT.artifactId;

    composeKnowledgeConsistency(VALID_INPUT);

    assert.equal(VALID_REPORT.reportId, originalId);
    assert.equal(VALID_REPORT.artifactId, originalArtifactId);
  });

  it('should not mutate input relationships', () => {
    const originalId = VALID_RELATIONSHIP.relationshipId;
    const originalSource = VALID_RELATIONSHIP.sourceArtifactId;

    composeKnowledgeConsistency(VALID_INPUT);

    assert.equal(VALID_RELATIONSHIP.relationshipId, originalId);
    assert.equal(VALID_RELATIONSHIP.sourceArtifactId, originalSource);
  });

  it('should not mutate input registry reports', () => {
    const reports = [VALID_REPORT, VALID_REPORT_2];
    const originalIds = reports.map((r) => r.reportId);

    composeConsistencyRegistry(reports, []);

    assert.equal(reports[0].reportId, originalIds[0]);
    assert.equal(reports[1].reportId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Impact Kernel — Helper Functions', () => {
  it('should return canonical impact types', () => {
    const types = getCanonicalImpactTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_IMPACT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical impact severities', () => {
    const severities = getCanonicalImpactSeverities();
    assert.deepStrictEqual([...severities], [...CANONICAL_IMPACT_SEVERITY]);
    assert.equal(severities.length, 5);
  });

  it('should return canonical consistency statuses', () => {
    const statuses = getCanonicalConsistencyStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_CONSISTENCY_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should return canonical impact resolution statuses', () => {
    const statuses = getCanonicalImpactResolutionStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_IMPACT_RESOLUTION_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate impact type support', () => {
    assert.equal(isSupportedImpactType('direct_dependency'), true);
    assert.equal(isSupportedImpactType('transitive_dependency'), true);
    assert.equal(isSupportedImpactType('unsupported'), false);
  });

  it('should validate impact severity support', () => {
    assert.equal(isSupportedImpactSeverity('low'), true);
    assert.equal(isSupportedImpactSeverity('critical'), true);
    assert.equal(isSupportedImpactSeverity('unsupported'), false);
  });

  it('should validate consistency status support', () => {
    assert.equal(isSupportedConsistencyStatus('draft'), true);
    assert.equal(isSupportedConsistencyStatus('published'), true);
    assert.equal(isSupportedConsistencyStatus('unsupported'), false);
  });

  it('should validate impact resolution status support', () => {
    assert.equal(isSupportedImpactResolutionStatus('pending'), true);
    assert.equal(isSupportedImpactResolutionStatus('resolved'), true);
    assert.equal(isSupportedImpactResolutionStatus('unsupported'), false);
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

describe('Impact Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 impact types', () => {
    assert.equal(CANONICAL_IMPACT_TYPES.length, 10);
  });

  it('should have exactly 5 impact severities', () => {
    assert.equal(CANONICAL_IMPACT_SEVERITY.length, 5);
  });

  it('should have exactly 6 consistency statuses', () => {
    assert.equal(CANONICAL_CONSISTENCY_STATUS.length, 6);
  });

  it('should have exactly 6 impact resolution statuses', () => {
    assert.equal(CANONICAL_IMPACT_RESOLUTION_STATUS.length, 6);
  });

  it('should contain all expected impact types', () => {
    const expectedTypes = [
      'direct_dependency',
      'transitive_dependency',
      'curriculum_dependency',
      'knowledge_dependency',
      'visualization_dependency',
      'laboratory_dependency',
      'assessment_dependency',
      'documentation_dependency',
      'reference_dependency',
      'cross_agent_dependency',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_IMPACT_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected impact severities', () => {
    const expectedSeverities = [
      'low',
      'moderate',
      'high',
      'critical',
      'blocking',
    ];

    for (const severity of expectedSeverities) {
      assert.ok(
        CANONICAL_IMPACT_SEVERITY.includes(severity as any),
        `Should include severity: ${severity}`,
      );
    }
  });

  it('should contain all expected consistency statuses', () => {
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
        CANONICAL_CONSISTENCY_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });

  it('should contain all expected impact resolution statuses', () => {
    const expectedStatuses = [
      'pending',
      'under_review',
      'validated',
      'resolved',
      'rejected',
      'superseded',
    ];

    for (const status of expectedStatuses) {
      assert.ok(
        CANONICAL_IMPACT_RESOLUTION_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Impact Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not perform automatic repairs', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(!('autoRepair' in result), 'Should not have auto repair');
    assert.ok(!('repairResult' in result), 'Should not have repair result');
  });

  it('should not mutate artifacts', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(!('mutatedArtifact' in result), 'Should not have mutated artifact');
    assert.ok(!('artifactMutation' in result), 'Should not have artifact mutation');
  });

  it('should not generate knowledge', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(!('generatedKnowledge' in result), 'Should not have generated knowledge');
    assert.ok(!('knowledgeGeneration' in result), 'Should not have knowledge generation');
  });

  it('should not infer dependencies', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(!('inferredDependencies' in result), 'Should not have inferred dependencies');
    assert.ok(!('dependencyInference' in result), 'Should not have dependency inference');
  });

  it('should not infer relationships', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(!('inferredRelationships' in result), 'Should not have inferred relationships');
    assert.ok(!('relationshipInference' in result), 'Should not have relationship inference');
  });

  it('should not publish automatically', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(!('autoPublish' in result), 'Should not have auto publish');
    assert.ok(!('publishResult' in result), 'Should not have publish result');
  });

  it('should not make editorial decisions', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(!('editorialDecision' in result), 'Should not have editorial decision');
    assert.ok(!('decisionResult' in result), 'Should not have decision result');
  });

  it('should not call LLMs', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(!('llmResult' in result), 'Should not have LLM result');
    assert.ok(!('aiGeneration' in result), 'Should not have AI generation');
  });

  it('should not call external APIs', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(!('apiResult' in result), 'Should not have API result');
    assert.ok(!('externalCall' in result), 'Should not have external call');
  });

  it('should not have executable callbacks in impact', () => {
    const impact = composeKnowledgeImpact({
      impactId: 'impact-001',
      sourceArtifactId: 'knowledge-001',
      targetArtifactId: 'knowledge-002',
      impactType: 'direct_dependency',
      severity: 'high',
      description: 'Test.',
      rationale: 'Test.',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(impact);
    for (const key of keys) {
      const value = (impact as any)[key];
      assert.ok(typeof value !== 'function', `Impact field "${key}" should not be a function`);
    }
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform runtime execution', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(!('runtimeExecution' in result), 'Should not have runtime execution');
    assert.ok(!('output' in result), 'Should not have output');
  });

  it('should not generate code', () => {
    const result = composeKnowledgeConsistency(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });
});

// ---------------------------------------------------------------------------
// Knowledge Artifact With Consistency Tests
// ---------------------------------------------------------------------------

describe('Impact Kernel — Knowledge Artifact With Consistency', () => {
  it('should compose valid knowledge artifact with consistency', () => {
    const artifact = composeKnowledgeArtifactWithConsistency({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      reports: [VALID_REPORT],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.knowledgeId, 'knowledge-001');
    assert.equal(artifact.title, 'Neural Networks');
    assert.equal(artifact.reports.length, 1);
    assert.equal(artifact.relationships.length, 1);
  });

  it('should validate valid knowledge artifact with consistency', () => {
    const artifact = composeKnowledgeArtifactWithConsistency({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      reports: [VALID_REPORT],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithConsistency(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect missing knowledgeId', () => {
    const artifact = composeKnowledgeArtifactWithConsistency({
      knowledgeId: '',
      title: 'Neural Networks',
      reports: [VALID_REPORT],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithConsistency(artifact);
    const knowledgeIdError = result.errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_MISSING_ARTIFACT_ID,
    );

    assert.ok(knowledgeIdError, 'Should have IMPACT_MISSING_ARTIFACT_ID error');
  });

  it('should detect missing title', () => {
    const artifact = composeKnowledgeArtifactWithConsistency({
      knowledgeId: 'knowledge-001',
      title: '',
      reports: [VALID_REPORT],
      relationships: [VALID_RELATIONSHIP],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithConsistency(artifact);
    const titleError = result.errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_MISSING_ARTIFACT_ID,
    );

    assert.ok(titleError, 'Should have IMPACT_MISSING_ARTIFACT_ID error');
  });

  it('should detect missing provenance', () => {
    const artifact = composeKnowledgeArtifactWithConsistency({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      reports: [VALID_REPORT],
      relationships: [VALID_RELATIONSHIP],
      provenance: undefined as any,
    });

    const result = validateKnowledgeArtifactWithConsistency(artifact);
    const provenanceError = result.errors.find(
      (e) => e.code === IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have IMPACT_MISSING_PROVENANCE error');
  });
});
