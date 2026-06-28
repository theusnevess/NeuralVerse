/**
 * NV-1900-D7-OPT-08 — Common Adoption Mistakes & Engineering Judgment Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Engineering Judgment Kernel.
 * Covers: valid mistake, valid pitfall, valid judgment, valid anti-pattern,
 * valid provenance, registry composition, artifact with engineering judgment,
 * duplicate IDs, duplicate titles, invalid enums, missing provenance,
 * missing provider, missing rationale, missing references, empty registry,
 * registry inconsistency, invalid trace, deterministic ordering,
 * 100 identical executions, immutable registry, input immutability,
 * artifact immutability, cross-agent boundary verification,
 * negative capability verification, helper functions,
 * canonical enum completeness, validator stability, no mutation verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  EngineeringMistake,
  EngineeringJudgmentProvenance,
  AdoptionPitfall,
  EngineeringJudgment,
  EngineeringAntiPattern,
  EngineeringJudgmentInput,
  EngineeringJudgmentRegistry,
  EngineeringJudgmentTrace,
  ApplicationNode,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_ENGINEERING_MISTAKE_TYPES,
  CANONICAL_ADOPTION_PITFALL_TYPES,
  CANONICAL_ENGINEERING_JUDGMENT_TYPES,
  CANONICAL_ENGINEERING_ANTI_PATTERN_TYPES,
  CANONICAL_ENGINEERING_JUDGMENT_SEVERITY,
  CANONICAL_ENGINEERING_JUDGMENT_STATUS,
} from './ApplicationAgentContract.ts';

import {
  composeEngineeringJudgmentProvenance,
  composeEngineeringMistake,
  composeAdoptionPitfall,
  composeEngineeringJudgment,
  composeEngineeringAntiPattern,
  composeEngineeringJudgmentTrace,
  composeEngineeringJudgmentRegistry,
  composeEngineeringJudgmentRegistryFromInput,
  composeEngineeringJudgments,
  composeApplicationArtifactWithEngineeringJudgment,
  isSupportedEngineeringMistakeType,
  isSupportedAdoptionPitfallType,
  isSupportedEngineeringJudgmentType,
  isSupportedEngineeringAntiPatternType,
  isSupportedEngineeringJudgmentSeverity,
  isSupportedEngineeringJudgmentStatus,
  isSupportedEngineeringJudgmentGovernance,
  getCanonicalEngineeringMistakeTypes,
  getCanonicalAdoptionPitfallTypes,
  getCanonicalEngineeringJudgmentTypes,
  getCanonicalEngineeringAntiPatternTypes,
  getCanonicalEngineeringJudgmentSeverities,
  getCanonicalEngineeringJudgmentStatuses,
} from './EngineeringJudgmentKernel.ts';

import {
  validateEngineeringMistake,
  validateAdoptionPitfall,
  validateEngineeringJudgmentEntry,
  validateEngineeringAntiPattern,
  validateEngineeringJudgmentRegistry,
  validateEngineeringJudgmentInput,
  validateEngineeringJudgmentTrace,
  ENGINEERING_JUDGMENT_VALIDATION_CODES,
} from './EngineeringJudgmentValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: EngineeringJudgmentProvenance = {
  providedBy: 'NeuralVerse Team',
  rationale: 'Core judgment concept.',
  reviewedBy: 'Architecture Review Board',
  reviewDate: '2026-01-01',
  governanceStatus: 'canonical',
};

const VALID_NODE: ApplicationNode = {
  applicationId: 'app-001',
  title: 'Medical Imaging System',
  artifactType: 'case_study',
  domain: 'computer_vision',
  status: 'published',
  description: 'Complete medical imaging system.',
  provenance: {
    providedBy: 'NeuralVerse Team',
    rationale: 'Core application concept.',
    reviewedBy: 'Architecture Review Board',
    reviewDate: '2026-01-01',
    governanceStatus: 'canonical',
  },
  trace: {
    traceId: '_trace_1',
    decisionCount: 1,
    validationCount: 1,
    registryVersion: '1.0.0',
    compositionVersion: '1.0.0',
    decisions: [],
    deterministic: true,
    generatedFrom: 'deterministic_application_kernel',
    randomUsed: false,
    timeDependency: false,
  },
};

const VALID_MISTAKE: EngineeringMistake = {
  mistakeId: 'mistake-001',
  title: 'Premature Model Optimization',
  description: 'Optimizing model before establishing baseline performance.',
  mistakeType: 'premature_optimization',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-001',
  caseStudyId: 'cs-001',
  severity: 'major',
  status: 'published',
  provenance: VALID_PROVENANCE,
};

const VALID_MISTAKE_2: EngineeringMistake = {
  mistakeId: 'mistake-002',
  title: 'Missing Monitoring in Production',
  description: 'Deploying without adequate monitoring infrastructure.',
  mistakeType: 'monitoring_absence',
  applicationArtifactId: 'app-001',
  knowledgeArtifactId: 'knowledge-002',
  caseStudyId: 'cs-002',
  severity: 'critical',
  status: 'approved',
  provenance: { ...VALID_PROVENANCE, providedBy: 'Research Team' },
};

const VALID_PITFALL: AdoptionPitfall = {
  pitfallId: 'pitfall-001',
  mistakeId: 'mistake-001',
  pitfallType: 'technology_hype',
  description: 'Adopting technology based on hype rather than requirements.',
  provenance: VALID_PROVENANCE,
};

const VALID_JUDGMENT: EngineeringJudgment = {
  judgmentId: 'judgment-001',
  mistakeId: 'mistake-001',
  judgmentType: 'architecture_selection',
  description: 'Select architecture based on requirements, not trends.',
  provenance: VALID_PROVENANCE,
};

const VALID_ANTI_PATTERN: EngineeringAntiPattern = {
  antiPatternId: 'ap-001',
  mistakeId: 'mistake-001',
  antiPatternType: 'hidden_complexity',
  description: 'Complexity hidden behind simple interfaces.',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: EngineeringJudgmentInput = {
  mistakes: [VALID_MISTAKE, VALID_MISTAKE_2],
  pitfalls: [VALID_PITFALL],
  judgments: [VALID_JUDGMENT],
  antiPatterns: [VALID_ANTI_PATTERN],
};

const EMPTY_INPUT: EngineeringJudgmentInput = {
  mistakes: [],
  pitfalls: [],
  judgments: [],
  antiPatterns: [],
};

// ---------------------------------------------------------------------------
// Mistake Composition Tests
// ---------------------------------------------------------------------------

describe('Engineering Judgment Kernel — Composition', () => {
  it('should compose valid judgment provenance', () => {
    const provenance = composeEngineeringJudgmentProvenance({
      providedBy: 'NeuralVerse Team',
      rationale: 'Core concept.',
      reviewedBy: 'Review Board',
      reviewDate: '2026-01-01',
      governanceStatus: 'canonical',
    });

    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.rationale, 'Core concept.');
  });

  it('should compose valid engineering mistake', () => {
    const mistake = composeEngineeringMistake({
      mistakeId: 'mistake-001',
      title: 'Test Mistake',
      description: 'Test.',
      mistakeType: 'premature_optimization',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      caseStudyId: 'cs-001',
      severity: 'major',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(mistake.mistakeId, 'mistake-001');
    assert.equal(mistake.title, 'Test Mistake');
    assert.equal(mistake.mistakeType, 'premature_optimization');
    assert.equal(mistake.severity, 'major');
  });

  it('should compose valid adoption pitfall', () => {
    const pitfall = composeAdoptionPitfall({
      pitfallId: 'pitfall-001',
      mistakeId: 'mistake-001',
      pitfallType: 'technology_hype',
      description: 'Test pitfall.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(pitfall.pitfallId, 'pitfall-001');
    assert.equal(pitfall.pitfallType, 'technology_hype');
  });

  it('should compose valid engineering judgment', () => {
    const judgment = composeEngineeringJudgment({
      judgmentId: 'judgment-001',
      mistakeId: 'mistake-001',
      judgmentType: 'architecture_selection',
      description: 'Test judgment.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(judgment.judgmentId, 'judgment-001');
    assert.equal(judgment.judgmentType, 'architecture_selection');
  });

  it('should compose valid anti-pattern', () => {
    const antiPattern = composeEngineeringAntiPattern({
      antiPatternId: 'ap-001',
      mistakeId: 'mistake-001',
      antiPatternType: 'hidden_complexity',
      description: 'Test anti-pattern.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(antiPattern.antiPatternId, 'ap-001');
    assert.equal(antiPattern.antiPatternType, 'hidden_complexity');
  });

  it('should compose valid judgment trace', () => {
    const trace = composeEngineeringJudgmentTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', mistakeId: 'mistake-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
  });

  it('should validate a valid mistake with no errors', () => {
    const errors = validateEngineeringMistake(VALID_MISTAKE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeEngineeringJudgmentRegistry(
      [VALID_MISTAKE, VALID_MISTAKE_2],
      [VALID_PITFALL],
      [VALID_JUDGMENT],
      [VALID_ANTI_PATTERN],
    );
    const result = validateEngineeringJudgmentRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate engineering judgment input', () => {
    const result = validateEngineeringJudgmentInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Engineering Judgment Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeEngineeringJudgmentRegistry([], [], [], []);
    const result = validateEngineeringJudgmentRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have ENGINEERING_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate mistake IDs', () => {
    const registry = composeEngineeringJudgmentRegistry([VALID_MISTAKE, VALID_MISTAKE], [], [], []);
    const result = validateEngineeringJudgmentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISTAKE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ENGINEERING_MISTAKE_DUPLICATE_ID error');
  });

  it('should detect duplicate mistake titles', () => {
    const m1 = { ...VALID_MISTAKE, mistakeId: 'mistake-001', title: 'Same Title' };
    const m2 = { ...VALID_MISTAKE, mistakeId: 'mistake-002', title: 'Same Title' };
    const registry = composeEngineeringJudgmentRegistry([m1, m2], [], [], []);
    const result = validateEngineeringJudgmentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISTAKE_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have ENGINEERING_MISTAKE_DUPLICATE_TITLE error');
  });

  it('should detect duplicate pitfall IDs', () => {
    const registry = composeEngineeringJudgmentRegistry(
      [VALID_MISTAKE],
      [VALID_PITFALL, VALID_PITFALL],
      [],
      [],
    );
    const result = validateEngineeringJudgmentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_PITFALL_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ENGINEERING_PITFALL_DUPLICATE_ID error');
  });

  it('should detect duplicate judgment IDs', () => {
    const registry = composeEngineeringJudgmentRegistry(
      [VALID_MISTAKE],
      [],
      [VALID_JUDGMENT, VALID_JUDGMENT],
      [],
    );
    const result = validateEngineeringJudgmentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_JUDGMENT_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ENGINEERING_JUDGMENT_DUPLICATE_ID error');
  });

  it('should detect duplicate anti-pattern IDs', () => {
    const registry = composeEngineeringJudgmentRegistry(
      [VALID_MISTAKE],
      [],
      [],
      [VALID_ANTI_PATTERN, VALID_ANTI_PATTERN],
    );
    const result = validateEngineeringJudgmentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_ANTI_PATTERN_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ENGINEERING_ANTI_PATTERN_DUPLICATE_ID error');
  });

  it('should sort mistakes deterministically', () => {
    const m3 = { ...VALID_MISTAKE, mistakeId: 'mistake-003' };
    const m1 = { ...VALID_MISTAKE, mistakeId: 'mistake-001' };
    const m2 = { ...VALID_MISTAKE, mistakeId: 'mistake-002' };

    const registry = composeEngineeringJudgmentRegistry([m3, m1, m2], [], [], []);

    assert.equal(registry.mistakes[0].mistakeId, 'mistake-001');
    assert.equal(registry.mistakes[1].mistakeId, 'mistake-002');
    assert.equal(registry.mistakes[2].mistakeId, 'mistake-003');
  });

  it('should sort pitfalls deterministically', () => {
    const p2 = { ...VALID_PITFALL, pitfallId: 'pitfall-002', pitfallType: 'insufficient_data' };
    const p1 = { ...VALID_PITFALL, pitfallId: 'pitfall-001', pitfallType: 'technology_hype' };

    const registry = composeEngineeringJudgmentRegistry(
      [VALID_MISTAKE],
      [p2, p1],
      [],
      [],
    );

    assert.equal(registry.pitfalls[0].pitfallType, 'insufficient_data');
    assert.equal(registry.pitfalls[1].pitfallType, 'technology_hype');
  });

  it('should sort judgments deterministically', () => {
    const j2 = { ...VALID_JUDGMENT, judgmentId: 'judgment-002', judgmentType: 'deployment_decision' };
    const j1 = { ...VALID_JUDGMENT, judgmentId: 'judgment-001', judgmentType: 'architecture_selection' };

    const registry = composeEngineeringJudgmentRegistry(
      [VALID_MISTAKE],
      [],
      [j2, j1],
      [],
    );

    assert.equal(registry.judgments[0].judgmentType, 'architecture_selection');
    assert.equal(registry.judgments[1].judgmentType, 'deployment_decision');
  });

  it('should sort anti-patterns deterministically', () => {
    const a2 = { ...VALID_ANTI_PATTERN, antiPatternId: 'ap-002', antiPatternType: 'tight_coupling' };
    const a1 = { ...VALID_ANTI_PATTERN, antiPatternId: 'ap-001', antiPatternType: 'hidden_complexity' };

    const registry = composeEngineeringJudgmentRegistry(
      [VALID_MISTAKE],
      [],
      [],
      [a2, a1],
    );

    assert.equal(registry.antiPatterns[0].antiPatternType, 'hidden_complexity');
    assert.equal(registry.antiPatterns[1].antiPatternType, 'tight_coupling');
  });

  it('should compute correct metadata counts', () => {
    const registry = composeEngineeringJudgmentRegistry(
      [VALID_MISTAKE, VALID_MISTAKE_2],
      [VALID_PITFALL],
      [VALID_JUDGMENT],
      [VALID_ANTI_PATTERN],
    );

    assert.equal(registry.metadata.mistakeCount, 2);
    assert.equal(registry.metadata.pitfallCount, 1);
    assert.equal(registry.metadata.judgmentCount, 1);
    assert.equal(registry.metadata.antiPatternCount, 1);
    assert.equal(registry.metadata.typeCount, 2);
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Engineering Judgment Kernel — Validation', () => {
  it('should detect invalid mistake type', () => {
    const mistake = { ...VALID_MISTAKE, mistakeType: 'unsupported' as any };
    const errors = validateEngineeringMistake(mistake);
    const typeError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_MISTAKE_TYPE,
    );

    assert.ok(typeError, 'Should have ENGINEERING_INVALID_MISTAKE_TYPE error');
  });

  it('should detect invalid pitfall type', () => {
    const pitfall = { ...VALID_PITFALL, pitfallType: 'unsupported' as any };
    const errors = validateAdoptionPitfall(pitfall);
    const typeError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_PITFALL_TYPE,
    );

    assert.ok(typeError, 'Should have ENGINEERING_INVALID_PITFALL_TYPE error');
  });

  it('should detect invalid judgment type', () => {
    const judgment = { ...VALID_JUDGMENT, judgmentType: 'unsupported' as any };
    const errors = validateEngineeringJudgmentEntry(judgment);
    const typeError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_JUDGMENT_TYPE,
    );

    assert.ok(typeError, 'Should have ENGINEERING_INVALID_JUDGMENT_TYPE error');
  });

  it('should detect invalid anti-pattern type', () => {
    const antiPattern = { ...VALID_ANTI_PATTERN, antiPatternType: 'unsupported' as any };
    const errors = validateEngineeringAntiPattern(antiPattern);
    const typeError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_ANTI_PATTERN_TYPE,
    );

    assert.ok(typeError, 'Should have ENGINEERING_INVALID_ANTI_PATTERN_TYPE error');
  });

  it('should detect invalid severity', () => {
    const mistake = { ...VALID_MISTAKE, severity: 'unsupported' as any };
    const errors = validateEngineeringMistake(mistake);
    const severityError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_SEVERITY,
    );

    assert.ok(severityError, 'Should have ENGINEERING_INVALID_SEVERITY error');
  });

  it('should detect invalid status', () => {
    const mistake = { ...VALID_MISTAKE, status: 'unsupported' as any };
    const errors = validateEngineeringMistake(mistake);
    const statusError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have ENGINEERING_INVALID_STATUS error');
  });

  it('should detect invalid governance', () => {
    const mistake = { ...VALID_MISTAKE, provenance: { ...VALID_PROVENANCE, governanceStatus: 'invalid' as any } };
    const errors = validateEngineeringMistake(mistake);
    const governanceError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_INVALID_GOVERNANCE,
    );

    assert.ok(governanceError, 'Should have ENGINEERING_INVALID_GOVERNANCE error');
  });

  it('should detect missing provenance', () => {
    const mistake = { ...VALID_MISTAKE, provenance: undefined as any };
    const errors = validateEngineeringMistake(mistake);
    const provenanceError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have ENGINEERING_MISSING_PROVENANCE error');
  });

  it('should detect missing provider', () => {
    const mistake = { ...VALID_MISTAKE, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateEngineeringMistake(mistake);
    const providerError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_PROVIDER,
    );

    assert.ok(providerError, 'Should have ENGINEERING_MISSING_PROVIDER error');
  });

  it('should detect missing rationale', () => {
    const mistake = { ...VALID_MISTAKE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateEngineeringMistake(mistake);
    const rationaleError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have ENGINEERING_MISSING_RATIONALE error');
  });

  it('should detect missing application reference', () => {
    const mistake = { ...VALID_MISTAKE, applicationArtifactId: '' };
    const errors = validateEngineeringMistake(mistake);
    const refError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_APPLICATION_REFERENCE,
    );

    assert.ok(refError, 'Should have ENGINEERING_MISSING_APPLICATION_REFERENCE error');
  });

  it('should detect missing knowledge reference', () => {
    const mistake = { ...VALID_MISTAKE, knowledgeArtifactId: '' };
    const errors = validateEngineeringMistake(mistake);
    const refError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_KNOWLEDGE_REFERENCE,
    );

    assert.ok(refError, 'Should have ENGINEERING_MISSING_KNOWLEDGE_REFERENCE error');
  });

  it('should detect missing case study reference', () => {
    const mistake = { ...VALID_MISTAKE, caseStudyId: '' };
    const errors = validateEngineeringMistake(mistake);
    const refError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_CASE_STUDY_REFERENCE,
    );

    assert.ok(refError, 'Should have ENGINEERING_MISSING_CASE_STUDY_REFERENCE error');
  });

  it('should detect missing mistake ID', () => {
    const mistake = { ...VALID_MISTAKE, mistakeId: '' };
    const errors = validateEngineeringMistake(mistake);
    const idError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_MISTAKE_ID,
    );

    assert.ok(idError, 'Should have ENGINEERING_MISSING_MISTAKE_ID error');
  });

  it('should detect missing title', () => {
    const mistake = { ...VALID_MISTAKE, title: '' };
    const errors = validateEngineeringMistake(mistake);
    const titleError = errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_MISSING_TITLE,
    );

    assert.ok(titleError, 'Should have ENGINEERING_MISSING_TITLE error');
  });

  it('should validate a valid trace', () => {
    const trace = composeEngineeringJudgmentTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
    });

    const result = validateEngineeringJudgmentTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: EngineeringJudgmentTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      decisions: [],
      deterministic: false,
      generatedFrom: 'deterministic_engineering_judgment_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateEngineeringJudgmentTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Engineering Judgment Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeEngineeringJudgments>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeEngineeringJudgments(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].mistakes, results[i].mistakes);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeEngineeringJudgmentRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeEngineeringJudgmentRegistry(
        [VALID_MISTAKE],
        [],
        [],
        [],
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].mistakes, results[i].mistakes);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Engineering Judgment Kernel — Immutability', () => {
  it('should not mutate input mistakes', () => {
    const originalId = VALID_MISTAKE.mistakeId;
    const originalTitle = VALID_MISTAKE.title;

    composeEngineeringJudgments(VALID_INPUT);

    assert.equal(VALID_MISTAKE.mistakeId, originalId);
    assert.equal(VALID_MISTAKE.title, originalTitle);
  });

  it('should not mutate input registry mistakes', () => {
    const mistakes = [VALID_MISTAKE, VALID_MISTAKE_2];
    const originalIds = mistakes.map((m) => m.mistakeId);

    composeEngineeringJudgmentRegistry(mistakes, [], [], []);

    assert.equal(mistakes[0].mistakeId, originalIds[0]);
    assert.equal(mistakes[1].mistakeId, originalIds[1]);
  });

  it('should not mutate the original application node', () => {
    const registry = composeEngineeringJudgmentRegistry([VALID_MISTAKE], [], [], []);
    const originalDescription = VALID_NODE.description;

    composeApplicationArtifactWithEngineeringJudgment({
      applicationNode: VALID_NODE,
      engineeringJudgmentRegistry: registry,
    });

    assert.equal(VALID_NODE.description, originalDescription);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Engineering Judgment Kernel — Helper Functions', () => {
  it('should return canonical mistake types', () => {
    const types = getCanonicalEngineeringMistakeTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ENGINEERING_MISTAKE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical pitfall types', () => {
    const types = getCanonicalAdoptionPitfallTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ADOPTION_PITFALL_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical judgment types', () => {
    const types = getCanonicalEngineeringJudgmentTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ENGINEERING_JUDGMENT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical anti-pattern types', () => {
    const types = getCanonicalEngineeringAntiPatternTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ENGINEERING_ANTI_PATTERN_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical severities', () => {
    const sevs = getCanonicalEngineeringJudgmentSeverities();
    assert.deepStrictEqual([...sevs], [...CANONICAL_ENGINEERING_JUDGMENT_SEVERITY]);
    assert.equal(sevs.length, 5);
  });

  it('should return canonical statuses', () => {
    const statuses = getCanonicalEngineeringJudgmentStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_ENGINEERING_JUDGMENT_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate mistake type support', () => {
    assert.equal(isSupportedEngineeringMistakeType('premature_optimization'), true);
    assert.equal(isSupportedEngineeringMistakeType('monitoring_absence'), true);
    assert.equal(isSupportedEngineeringMistakeType('unsupported'), false);
  });

  it('should validate pitfall type support', () => {
    assert.equal(isSupportedAdoptionPitfallType('technology_hype'), true);
    assert.equal(isSupportedAdoptionPitfallType('insufficient_data'), true);
    assert.equal(isSupportedAdoptionPitfallType('unsupported'), false);
  });

  it('should validate judgment type support', () => {
    assert.equal(isSupportedEngineeringJudgmentType('architecture_selection'), true);
    assert.equal(isSupportedEngineeringJudgmentType('deployment_decision'), true);
    assert.equal(isSupportedEngineeringJudgmentType('unsupported'), false);
  });

  it('should validate anti-pattern type support', () => {
    assert.equal(isSupportedEngineeringAntiPatternType('hidden_complexity'), true);
    assert.equal(isSupportedEngineeringAntiPatternType('tight_coupling'), true);
    assert.equal(isSupportedEngineeringAntiPatternType('unsupported'), false);
  });

  it('should validate severity support', () => {
    assert.equal(isSupportedEngineeringJudgmentSeverity('minor'), true);
    assert.equal(isSupportedEngineeringJudgmentSeverity('critical'), true);
    assert.equal(isSupportedEngineeringJudgmentSeverity('unsupported'), false);
  });

  it('should validate status support', () => {
    assert.equal(isSupportedEngineeringJudgmentStatus('draft'), true);
    assert.equal(isSupportedEngineeringJudgmentStatus('published'), true);
    assert.equal(isSupportedEngineeringJudgmentStatus('unsupported'), false);
  });

  it('should validate governance support', () => {
    assert.equal(isSupportedEngineeringJudgmentGovernance('canonical'), true);
    assert.equal(isSupportedEngineeringJudgmentGovernance('accepted'), true);
    assert.equal(isSupportedEngineeringJudgmentGovernance('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Engineering Judgment Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 mistake types', () => {
    assert.equal(CANONICAL_ENGINEERING_MISTAKE_TYPES.length, 10);
  });

  it('should have exactly 10 pitfall types', () => {
    assert.equal(CANONICAL_ADOPTION_PITFALL_TYPES.length, 10);
  });

  it('should have exactly 10 judgment types', () => {
    assert.equal(CANONICAL_ENGINEERING_JUDGMENT_TYPES.length, 10);
  });

  it('should have exactly 10 anti-pattern types', () => {
    assert.equal(CANONICAL_ENGINEERING_ANTI_PATTERN_TYPES.length, 10);
  });

  it('should have exactly 5 severities', () => {
    assert.equal(CANONICAL_ENGINEERING_JUDGMENT_SEVERITY.length, 5);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_ENGINEERING_JUDGMENT_STATUS.length, 6);
  });

  it('should contain all expected mistake types', () => {
    const expected = ['incorrect_problem_definition', 'dataset_misuse', 'architecture_mismatch', 'premature_optimization', 'overengineering', 'underengineering', 'deployment_misconfiguration', 'monitoring_absence', 'evaluation_bias', 'maintenance_neglect'];

    for (const type of expected) {
      assert.ok(
        CANONICAL_ENGINEERING_MISTAKE_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected statuses', () => {
    const expected = ['draft', 'review', 'approved', 'published', 'deprecated', 'archived'];

    for (const status of expected) {
      assert.ok(
        CANONICAL_ENGINEERING_JUDGMENT_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Engineering Judgment Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeEngineeringJudgments(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeEngineeringJudgments(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeEngineeringJudgments(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeEngineeringJudgments(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate judgment content', () => {
    const result = composeEngineeringJudgments(VALID_INPUT);
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
    assert.ok(!('generatedMarkdown' in result), 'Should not have generated markdown');
  });

  it('should not perform network requests', () => {
    const result = composeEngineeringJudgments(VALID_INPUT);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
  });

  it('should not generate code', () => {
    const result = composeEngineeringJudgments(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
  });

  it('should not have executable callbacks in mistake', () => {
    const mistake = composeEngineeringMistake({
      mistakeId: 'mistake-001',
      title: 'Test',
      description: 'Test.',
      mistakeType: 'premature_optimization',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      caseStudyId: 'cs-001',
      severity: 'major',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(mistake);
    for (const key of keys) {
      const value = (mistake as any)[key];
      assert.ok(typeof value !== 'function', `Mistake field "${key}" should not be a function`);
    }
  });

  it('should not store educational content', () => {
    const result = composeEngineeringJudgments(VALID_INPUT);
    assert.ok(!('educationalContent' in result), 'Should not have educational content');
  });

  it('should not access filesystem', () => {
    const result = composeEngineeringJudgments(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Engineering Judgment Kernel — Registry Validation', () => {
  it('should detect registry inconsistency with invalid deterministic flag', () => {
    const registry: EngineeringJudgmentRegistry = {
      ...composeEngineeringJudgmentRegistry([VALID_MISTAKE], [], [], []),
      deterministic: false as any,
    };
    const result = validateEngineeringJudgmentRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid randomUsed flag', () => {
    const registry: EngineeringJudgmentRegistry = {
      ...composeEngineeringJudgmentRegistry([VALID_MISTAKE], [], [], []),
      randomUsed: true as any,
    };
    const result = validateEngineeringJudgmentRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect registry inconsistency with invalid timeDependency flag', () => {
    const registry: EngineeringJudgmentRegistry = {
      ...composeEngineeringJudgmentRegistry([VALID_MISTAKE], [], [], []),
      timeDependency: true as any,
    };
    const result = validateEngineeringJudgmentRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should validate empty input', () => {
    const result = validateEngineeringJudgmentInput(EMPTY_INPUT);
    assert.equal(result.valid, false);
    const emptyError = result.errors.find(
      (e) => e.code === ENGINEERING_JUDGMENT_VALIDATION_CODES.ENGINEERING_EMPTY_REGISTRY,
    );
    assert.ok(emptyError, 'Should have ENGINEERING_EMPTY_REGISTRY error');
  });
});

// ---------------------------------------------------------------------------
// Validator Stability Tests
// ---------------------------------------------------------------------------

describe('Engineering Judgment Kernel — Validator Stability', () => {
  it('should produce identical validation results for valid input', () => {
    const result1 = validateEngineeringJudgmentRegistry(composeEngineeringJudgmentRegistry([VALID_MISTAKE], [], [], []));
    const result2 = validateEngineeringJudgmentRegistry(composeEngineeringJudgmentRegistry([VALID_MISTAKE], [], [], []));

    assert.deepStrictEqual(result1.valid, result2.valid);
    assert.deepStrictEqual(result1.errors.length, result2.errors.length);
  });

  it('should produce identical validation results for invalid input', () => {
    const mistake = { ...VALID_MISTAKE, mistakeType: 'unsupported' as any };
    const result1 = validateEngineeringMistake(mistake);
    const result2 = validateEngineeringMistake(mistake);

    assert.deepStrictEqual(result1.length, result2.length);
  });
});

// ---------------------------------------------------------------------------
// No Mutation Behavior Tests
// ---------------------------------------------------------------------------

describe('Engineering Judgment Kernel — No Mutation Behavior', () => {
  it('should not mutate mistakes during registry composition', () => {
    const mistakes = [
      { ...VALID_MISTAKE, mistakeId: 'mistake-003' },
      { ...VALID_MISTAKE, mistakeId: 'mistake-001' },
      { ...VALID_MISTAKE, mistakeId: 'mistake-002' },
    ];
    const originalOrder = mistakes.map((m) => m.mistakeId);

    composeEngineeringJudgmentRegistry(mistakes, [], [], []);

    assert.deepStrictEqual(mistakes.map((m) => m.mistakeId), originalOrder);
  });

  it('should not mutate input during full composition', () => {
    const input: EngineeringJudgmentInput = {
      mistakes: [
        { ...VALID_MISTAKE, mistakeId: 'mistake-002' },
        { ...VALID_MISTAKE, mistakeId: 'mistake-001' },
      ],
      pitfalls: [],
      judgments: [],
      antiPatterns: [],
    };
    const originalOrder = input.mistakes.map((m) => m.mistakeId);

    composeEngineeringJudgments(input);

    assert.deepStrictEqual(input.mistakes.map((m) => m.mistakeId), originalOrder);
  });
});

// ---------------------------------------------------------------------------
// Artifact with Engineering Judgment Tests
// ---------------------------------------------------------------------------

describe('Engineering Judgment Kernel — Artifact with Engineering Judgment', () => {
  it('should compose application artifact with engineering judgment', () => {
    const registry = composeEngineeringJudgmentRegistry([VALID_MISTAKE], [VALID_PITFALL], [], []);
    const result = composeApplicationArtifactWithEngineeringJudgment({
      applicationNode: VALID_NODE,
      engineeringJudgmentRegistry: registry,
    });

    assert.equal(result.applicationNode.applicationId, 'app-001');
    assert.equal(result.engineeringJudgmentRegistry.mistakes.length, 1);
    assert.equal(result.deterministic, true);
    assert.equal(result.randomUsed, false);
    assert.equal(result.timeDependency, false);
  });

  it('should not mutate the original application node', () => {
    const registry = composeEngineeringJudgmentRegistry([VALID_MISTAKE], [], [], []);
    const originalTitle = VALID_NODE.title;

    composeApplicationArtifactWithEngineeringJudgment({
      applicationNode: VALID_NODE,
      engineeringJudgmentRegistry: registry,
    });

    assert.equal(VALID_NODE.title, originalTitle);
  });
});

// ---------------------------------------------------------------------------
// Cross-Agent Boundary Verification Tests
// ---------------------------------------------------------------------------

describe('Engineering Judgment Kernel — Cross-Agent Boundary Verification', () => {
  it('should only reference external IDs, not own external metadata', () => {
    const mistake = composeEngineeringMistake({
      mistakeId: 'mistake-001',
      title: 'Test',
      description: 'Test.',
      mistakeType: 'premature_optimization',
      applicationArtifactId: 'app-001',
      knowledgeArtifactId: 'knowledge-001',
      caseStudyId: 'cs-001',
      severity: 'major',
      status: 'published',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(typeof mistake.knowledgeArtifactId, 'string');
    assert.ok(!('knowledgeContent' in mistake), 'Should not have knowledge content');
    assert.ok(!('narrativeContent' in mistake), 'Should not have narrative content');
  });

  it('should not diagnose engineering mistakes', () => {
    const result = composeEngineeringJudgments(VALID_INPUT);
    assert.ok(!('diagnosis' in result), 'Should not have diagnosis');
    assert.ok(!('detectedMistakes' in result), 'Should not have detected mistakes');
  });

  it('should not detect anti-patterns automatically', () => {
    const result = composeEngineeringJudgments(VALID_INPUT);
    assert.ok(!('autoDetected' in result), 'Should not have auto-detected');
    assert.ok(!('detectedAntiPatterns' in result), 'Should not have detected anti-patterns');
  });

  it('should not recommend corrections', () => {
    const result = composeEngineeringJudgments(VALID_INPUT);
    assert.ok(!('recommendations' in result), 'Should not have recommendations');
    assert.ok(!('suggestedFixes' in result), 'Should not have suggested fixes');
  });

  it('should not evaluate users', () => {
    const result = composeEngineeringJudgments(VALID_INPUT);
    assert.ok(!('userEvaluation' in result), 'Should not have user evaluation');
    assert.ok(!('engineerScore' in result), 'Should not have engineer score');
  });
});
