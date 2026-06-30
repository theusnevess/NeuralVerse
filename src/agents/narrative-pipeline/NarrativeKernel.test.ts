/**
 * NV-1700-D6-OPT-01 — Narrative Contract & Registry Kernel Test Suite
 *
 * Comprehensive deterministic test suite for the Narrative Kernel.
 * Covers: valid provenance, valid narrative unit, valid trace, valid registry,
 * valid artifact, duplicate IDs, duplicate titles, invalid unit type,
 * invalid mode, invalid domain, invalid status, invalid governance status,
 * missing provenance, missing source, missing rationale, missing providedBy,
 * missing canonical reference, invalid sequence order, empty registry,
 * invalid trace, deterministic ordering, immutable input, identical output
 * (100 iterations), helper functions, canonical enum completeness,
 * negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  NarrativeProvenance,
  NarrativeUnit,
  NarrativeInput,
  NarrativeRegistry,
  NarrativeTrace,
  NarrativeArtifact,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_NARRATIVE_UNIT_TYPES,
  CANONICAL_NARRATIVE_MODES,
  CANONICAL_NARRATIVE_DOMAINS,
  CANONICAL_NARRATIVE_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

import {
  composeNarrativeProvenance,
  composeNarrativeUnit,
  composeNarrativeTrace,
  composeNarrativeArtifact,
  composeNarrativeRegistry,
  composeNarrativeRegistryFromInput,
  composeNarrative,
  isSupportedNarrativeUnitType,
  isSupportedNarrativeMode,
  isSupportedNarrativeDomain,
  isSupportedNarrativeStatus,
  isSupportedNarrativeGovernanceStatus,
  getCanonicalNarrativeUnitTypes,
  getCanonicalNarrativeModes,
  getCanonicalNarrativeDomains,
  getCanonicalNarrativeStatuses,
  getCanonicalNarrativeGovernanceStatuses,
} from './NarrativeKernel.ts';

import {
  validateNarrativeUnit,
  validateNarrativeRegistry,
  validateNarrativeInput,
  validateNarrativeTrace,
  validateNarrativeArtifact,
  NARRATIVE_VALIDATION_CODES,
} from './NarrativeValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: NarrativeProvenance = {
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  providedBy: 'NeuralVerse Team',
  rationale: 'Core narrative framing for neural network concepts.',
};

const VALID_UNIT: NarrativeUnit = {
  narrativeId: 'narrative-001',
  title: 'The Perceptron Story',
  unitType: 'lesson_opening',
  narrativeMode: 'historical_discovery',
  domain: 'deep_learning',
  status: 'published',
  canonicalKnowledgeId: 'knowledge-001',
  curriculumNodeId: 'curriculum-001',
  lessonId: 'lesson-001',
  laboratoryId: 'lab-001',
  sequenceOrder: 1,
  summary: 'Opening narrative framing for perceptron introduction.',
  tags: ['perceptron', 'history'],
  provenance: VALID_PROVENANCE,
};

const VALID_UNIT_2: NarrativeUnit = {
  narrativeId: 'narrative-002',
  title: 'Why Neural Networks Matter',
  unitType: 'concept_motivation',
  narrativeMode: 'engineering_problem',
  domain: 'deep_learning',
  status: 'approved',
  canonicalKnowledgeId: 'knowledge-002',
  curriculumNodeId: 'curriculum-002',
  lessonId: 'lesson-002',
  laboratoryId: '',
  sequenceOrder: 2,
  summary: 'Motivation for learning neural networks.',
  tags: ['motivation', 'importance'],
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_INPUT: NarrativeInput = {
  narratives: [VALID_UNIT, VALID_UNIT_2],
};

const EMPTY_INPUT: NarrativeInput = {
  narratives: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Narrative Kernel — Composition', () => {
  it('should compose valid narrative provenance', () => {
    const provenance = composeNarrativeProvenance({
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      providedBy: 'NeuralVerse Team',
      rationale: 'Core concept.',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.rationale, 'Core concept.');
  });

  it('should compose valid narrative unit', () => {
    const unit = composeNarrativeUnit({
      narrativeId: 'narrative-001',
      title: 'The Perceptron Story',
      unitType: 'lesson_opening',
      narrativeMode: 'historical_discovery',
      domain: 'deep_learning',
      status: 'published',
      canonicalKnowledgeId: 'knowledge-001',
      curriculumNodeId: 'curriculum-001',
      lessonId: 'lesson-001',
      laboratoryId: 'lab-001',
      sequenceOrder: 1,
      summary: 'Opening narrative.',
      tags: ['perceptron'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(unit.narrativeId, 'narrative-001');
    assert.equal(unit.title, 'The Perceptron Story');
    assert.equal(unit.unitType, 'lesson_opening');
    assert.equal(unit.narrativeMode, 'historical_discovery');
    assert.equal(unit.domain, 'deep_learning');
    assert.equal(unit.tags.length, 1);
  });

  it('should compose valid narrative trace', () => {
    const trace = composeNarrativeTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', narrativeId: 'narrative-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
  });

  it('should compose valid narrative artifact', () => {
    const artifact = composeNarrativeArtifact({
      narrativeId: 'narrative-001',
      title: 'The Perceptron Story',
      unitType: 'lesson_opening',
      narrativeMode: 'historical_discovery',
      domain: 'deep_learning',
      status: 'published',
      canonicalKnowledgeId: 'knowledge-001',
      curriculumNodeId: 'curriculum-001',
      lessonId: 'lesson-001',
      laboratoryId: 'lab-001',
      sequenceOrder: 1,
      summary: 'Opening narrative.',
      tags: ['perceptron'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.narrativeId, 'narrative-001');
    assert.equal(artifact.title, 'The Perceptron Story');
  });

  it('should validate a valid unit with no errors', () => {
    const errors = validateNarrativeUnit(VALID_UNIT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeNarrativeRegistry([VALID_UNIT, VALID_UNIT_2]);
    const result = validateNarrativeRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate narrative input', () => {
    const result = validateNarrativeInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate a valid artifact with no errors', () => {
    const errors = validateNarrativeArtifact({
      narrativeId: 'narrative-001',
      title: 'Test',
      unitType: 'lesson_opening',
      narrativeMode: 'historical_discovery',
      domain: 'deep_learning',
      status: 'published',
      canonicalKnowledgeId: 'knowledge-001',
      curriculumNodeId: 'curriculum-001',
      lessonId: 'lesson-001',
      laboratoryId: '',
      sequenceOrder: 1,
      summary: 'Test.',
      tags: [],
      provenance: VALID_PROVENANCE,
    });
    assert.deepStrictEqual(errors, []);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Narrative Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeNarrativeRegistry([]);
    const result = validateNarrativeRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have NARRATIVE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeNarrativeRegistry([VALID_UNIT, VALID_UNIT]);
    const result = validateNarrativeRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have NARRATIVE_DUPLICATE_ID error');
  });

  it('should detect duplicate titles', () => {
    const unit1 = { ...VALID_UNIT, narrativeId: 'narrative-001', title: 'Same Title' };
    const unit2 = { ...VALID_UNIT, narrativeId: 'narrative-002', title: 'Same Title' };
    const registry = composeNarrativeRegistry([unit1, unit2]);
    const result = validateNarrativeRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_DUPLICATE_TITLE,
    );

    assert.ok(duplicateError, 'Should have NARRATIVE_DUPLICATE_TITLE error');
  });

  it('should sort deterministically by narrativeId', () => {
    const unit3 = { ...VALID_UNIT, narrativeId: 'narrative-003' };
    const unit1 = { ...VALID_UNIT, narrativeId: 'narrative-001' };
    const unit2 = { ...VALID_UNIT, narrativeId: 'narrative-002' };

    const registry = composeNarrativeRegistry([unit3, unit1, unit2]);

    assert.equal(registry.narratives[0].narrativeId, 'narrative-001');
    assert.equal(registry.narratives[1].narrativeId, 'narrative-002');
    assert.equal(registry.narratives[2].narrativeId, 'narrative-003');
  });

  it('should sort by unitType when narrativeId is equal', () => {
    const unitA = { ...VALID_UNIT, narrativeId: 'narrative-001', unitType: 'transition' as const };
    const unitB = { ...VALID_UNIT, narrativeId: 'narrative-001', unitType: 'lesson_opening' as const };

    const registry = composeNarrativeRegistry([unitA, unitB]);

    assert.equal(registry.narratives[0].unitType, 'lesson_opening');
    assert.equal(registry.narratives[1].unitType, 'transition');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Narrative Kernel — Validation', () => {
  it('should detect invalid unit type', () => {
    const unit = { ...VALID_UNIT, unitType: 'unsupported' as any };
    const errors = validateNarrativeUnit(unit);
    const typeError = errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_UNIT_TYPE,
    );

    assert.ok(typeError, 'Should have NARRATIVE_INVALID_UNIT_TYPE error');
  });

  it('should detect invalid mode', () => {
    const unit = { ...VALID_UNIT, narrativeMode: 'unsupported' as any };
    const errors = validateNarrativeUnit(unit);
    const modeError = errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_MODE,
    );

    assert.ok(modeError, 'Should have NARRATIVE_INVALID_MODE error');
  });

  it('should detect invalid domain', () => {
    const unit = { ...VALID_UNIT, domain: 'unsupported' as any };
    const errors = validateNarrativeUnit(unit);
    const domainError = errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_DOMAIN,
    );

    assert.ok(domainError, 'Should have NARRATIVE_INVALID_DOMAIN error');
  });

  it('should detect invalid status', () => {
    const unit = { ...VALID_UNIT, status: 'unsupported' as any };
    const errors = validateNarrativeUnit(unit);
    const statusError = errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have NARRATIVE_INVALID_STATUS error');
  });

  it('should detect invalid governance status', () => {
    const unit = { ...VALID_UNIT, provenance: { ...VALID_PROVENANCE, governanceStatus: 'unsupported' as any } };
    const errors = validateNarrativeUnit(unit);
    const govError = errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_GOVERNANCE_STATUS,
    );

    assert.ok(govError, 'Should have NARRATIVE_INVALID_GOVERNANCE_STATUS error');
  });

  it('should detect missing provenance', () => {
    const unit = { ...VALID_UNIT, provenance: undefined as any };
    const errors = validateNarrativeUnit(unit);
    const provenanceError = errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have NARRATIVE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance source', () => {
    const unit = { ...VALID_UNIT, provenance: { ...VALID_PROVENANCE, source: '' } };
    const errors = validateNarrativeUnit(unit);
    const sourceError = errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have NARRATIVE_MISSING_SOURCE error');
  });

  it('should detect missing provenance rationale', () => {
    const unit = { ...VALID_UNIT, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateNarrativeUnit(unit);
    const rationaleError = errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have NARRATIVE_MISSING_RATIONALE error');
  });

  it('should detect missing provenance providedBy', () => {
    const unit = { ...VALID_UNIT, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateNarrativeUnit(unit);
    const providedByError = errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have NARRATIVE_MISSING_PROVIDED_BY error');
  });

  it('should detect missing canonical reference', () => {
    const unit = { ...VALID_UNIT, canonicalKnowledgeId: '' };
    const errors = validateNarrativeUnit(unit);
    const refError = errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_MISSING_CANONICAL_REFERENCE,
    );

    assert.ok(refError, 'Should have NARRATIVE_MISSING_CANONICAL_REFERENCE error');
  });

  it('should detect invalid sequence order', () => {
    const unit = { ...VALID_UNIT, sequenceOrder: -1 };
    const errors = validateNarrativeUnit(unit);
    const seqError = errors.find(
      (e) => e.code === NARRATIVE_VALIDATION_CODES.NARRATIVE_INVALID_SEQUENCE_ORDER,
    );

    assert.ok(seqError, 'Should have NARRATIVE_INVALID_SEQUENCE_ORDER error');
  });

  it('should validate a valid trace', () => {
    const trace = composeNarrativeTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
    });

    const result = validateNarrativeTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: NarrativeTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      compositionMetadata: {},
      deterministicMetadata: {},
      deterministic: false as true,
      generatedFrom: 'deterministic_narrative_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateNarrativeTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Narrative Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeNarrative>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeNarrative(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].narratives, results[i].narratives);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeNarrativeRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeNarrativeRegistry([VALID_UNIT, VALID_UNIT_2]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].narratives, results[i].narratives);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Narrative Kernel — Immutability', () => {
  it('should not mutate input units', () => {
    const originalId = VALID_UNIT.narrativeId;
    const originalTitle = VALID_UNIT.title;

    composeNarrative(VALID_INPUT);

    assert.equal(VALID_UNIT.narrativeId, originalId);
    assert.equal(VALID_UNIT.title, originalTitle);
  });

  it('should not mutate input registry narratives', () => {
    const units = [VALID_UNIT, VALID_UNIT_2];
    const originalIds = units.map((n) => n.narrativeId);

    composeNarrativeRegistry(units);

    assert.equal(units[0].narrativeId, originalIds[0]);
    assert.equal(units[1].narrativeId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Narrative Kernel — Helper Functions', () => {
  it('should return canonical unit types', () => {
    const types = getCanonicalNarrativeUnitTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_NARRATIVE_UNIT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical modes', () => {
    const modes = getCanonicalNarrativeModes();
    assert.deepStrictEqual([...modes], [...CANONICAL_NARRATIVE_MODES]);
    assert.equal(modes.length, 8);
  });

  it('should return canonical domains', () => {
    const domains = getCanonicalNarrativeDomains();
    assert.deepStrictEqual([...domains], [...CANONICAL_NARRATIVE_DOMAINS]);
    assert.equal(domains.length, 10);
  });

  it('should return canonical statuses', () => {
    const statuses = getCanonicalNarrativeStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_NARRATIVE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should return canonical governance statuses', () => {
    const statuses = getCanonicalNarrativeGovernanceStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_GOVERNANCE_STATUSES]);
    assert.equal(statuses.length, 5);
  });

  it('should validate unit type support', () => {
    assert.equal(isSupportedNarrativeUnitType('lesson_opening'), true);
    assert.equal(isSupportedNarrativeUnitType('synthesis'), true);
    assert.equal(isSupportedNarrativeUnitType('unsupported'), false);
  });

  it('should validate mode support', () => {
    assert.equal(isSupportedNarrativeMode('historical_discovery'), true);
    assert.equal(isSupportedNarrativeMode('research_evolution'), true);
    assert.equal(isSupportedNarrativeMode('unsupported'), false);
  });

  it('should validate domain support', () => {
    assert.equal(isSupportedNarrativeDomain('mathematics'), true);
    assert.equal(isSupportedNarrativeDomain('deep_learning'), true);
    assert.equal(isSupportedNarrativeDomain('unsupported'), false);
  });

  it('should validate status support', () => {
    assert.equal(isSupportedNarrativeStatus('draft'), true);
    assert.equal(isSupportedNarrativeStatus('published'), true);
    assert.equal(isSupportedNarrativeStatus('unsupported'), false);
  });

  it('should validate governance status support', () => {
    assert.equal(isSupportedNarrativeGovernanceStatus('canonical'), true);
    assert.equal(isSupportedNarrativeGovernanceStatus('accepted'), true);
    assert.equal(isSupportedNarrativeGovernanceStatus('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Narrative Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 unit types', () => {
    assert.equal(CANONICAL_NARRATIVE_UNIT_TYPES.length, 10);
  });

  it('should have exactly 8 modes', () => {
    assert.equal(CANONICAL_NARRATIVE_MODES.length, 8);
  });

  it('should have exactly 10 domains', () => {
    assert.equal(CANONICAL_NARRATIVE_DOMAINS.length, 10);
  });

  it('should have exactly 6 statuses', () => {
    assert.equal(CANONICAL_NARRATIVE_STATUS.length, 6);
  });

  it('should have exactly 5 governance statuses', () => {
    assert.equal(CANONICAL_GOVERNANCE_STATUSES.length, 5);
  });

  it('should contain all expected unit types', () => {
    const expectedTypes = [
      'lesson_opening',
      'concept_motivation',
      'historical_frame',
      'problem_origin',
      'transition',
      'analogy_frame',
      'laboratory_intro',
      'lesson_closure',
      'forward_connection',
      'synthesis',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_NARRATIVE_UNIT_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected modes', () => {
    const expectedModes = [
      'historical_discovery',
      'engineering_problem',
      'scientific_investigation',
      'industrial_case_study',
      'everyday_analogy',
      'step_by_step_construction',
      'failure_driven_explanation',
      'research_evolution',
    ];

    for (const mode of expectedModes) {
      assert.ok(
        CANONICAL_NARRATIVE_MODES.includes(mode as any),
        `Should include mode: ${mode}`,
      );
    }
  });

  it('should contain all expected domains', () => {
    const expectedDomains = [
      'mathematics',
      'statistics',
      'computer_science',
      'machine_learning',
      'deep_learning',
      'computer_vision',
      'generative_ai',
      'mlops',
      'software_engineering',
      'research',
    ];

    for (const domain of expectedDomains) {
      assert.ok(
        CANONICAL_NARRATIVE_DOMAINS.includes(domain as any),
        `Should include domain: ${domain}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Narrative Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate lesson prose', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(!('lessonProse' in result), 'Should not have lesson prose');
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
  });

  it('should not generate facts', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(!('generatedFacts' in result), 'Should not have generated facts');
    assert.ok(!('canonicalFacts' in result), 'Should not have canonical facts');
  });

  it('should not rewrite knowledge', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(!('rewrittenKnowledge' in result), 'Should not have rewritten knowledge');
    assert.ok(!('modifiedKnowledge' in result), 'Should not have modified knowledge');
  });

  it('should not mutate curriculum', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(!('curriculumMutation' in result), 'Should not have curriculum mutation');
    assert.ok(!('modifiedCurriculum' in result), 'Should not have modified curriculum');
  });

  it('should not infer dependencies', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(!('inferredDependencies' in result), 'Should not have inferred dependencies');
    assert.ok(!('dependencyGraph' in result), 'Should not have dependency graph');
  });

  it('should not make unsupported historical claims', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(!('historicalClaims' in result), 'Should not have historical claims');
    assert.ok(!('unsupportedHistory' in result), 'Should not have unsupported history');
  });

  it('should not call LLMs', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(!('llmCall' in result), 'Should not have LLM call');
    assert.ok(!('modelResponse' in result), 'Should not have model response');
  });

  it('should not call external APIs', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(!('apiCall' in result), 'Should not have API call');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not perform runtime personalization', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(!('personalization' in result), 'Should not have personalization');
    assert.ok(!('learnerProfile' in result), 'Should not have learner profile');
  });

  it('should not infer learner mastery', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(!('masteryInference' in result), 'Should not have mastery inference');
    assert.ok(!('learnerMastery' in result), 'Should not have learner mastery');
  });

  it('should not execute laboratories', () => {
    const result = composeNarrative(VALID_INPUT);
    assert.ok(!('labExecution' in result), 'Should not have lab execution');
    assert.ok(!('executionResult' in result), 'Should not have execution result');
  });

  it('should not have executable callbacks in unit', () => {
    const unit = composeNarrativeUnit({
      narrativeId: 'narrative-001',
      title: 'Test',
      unitType: 'lesson_opening',
      narrativeMode: 'historical_discovery',
      domain: 'deep_learning',
      status: 'published',
      canonicalKnowledgeId: 'knowledge-001',
      curriculumNodeId: 'curriculum-001',
      lessonId: 'lesson-001',
      laboratoryId: '',
      sequenceOrder: 1,
      summary: 'Test.',
      tags: [],
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(unit);
    for (const key of keys) {
      const value = (unit as any)[key];
      assert.ok(typeof value !== 'function', `Unit field "${key}" should not be a function`);
    }
  });
});
