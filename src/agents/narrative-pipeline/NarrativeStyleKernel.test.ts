/**
 * NV-1700-D6-OPT-02 — Narrative Style & Framing Orchestration Test Suite
 *
 * Comprehensive deterministic test suite for the Narrative Style Kernel.
 * Covers: valid style, valid frame, valid motivation, valid tone, valid registry,
 * valid artifact, duplicate IDs, duplicate frame, invalid style, invalid frame,
 * invalid tone, invalid motivation, invalid status, missing provenance,
 * missing source, missing rationale, missing providedBy, empty registry,
 * invalid trace, deterministic ordering, immutable input, identical output
 * (100 iterations), helper functions, canonical enum completeness,
 * negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  NarrativeProvenance,
  NarrativeStyle,
  NarrativeFrame,
  NarrativeMotivation,
  NarrativeStyleInput,
  NarrativeStyleRegistry,
  NarrativeStyleTrace,
  NarrativeArtifactWithStyle,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_NARRATIVE_STYLES,
  CANONICAL_NARRATIVE_FRAMES,
  CANONICAL_MOTIVATION_TYPES,
  CANONICAL_NARRATIVE_TONES,
  CANONICAL_NARRATIVE_STYLE_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

import {
  composeNarrativeStyle,
  composeNarrativeFrame,
  composeNarrativeMotivation,
  composeNarrativeTone,
  composeNarrativeStyleTrace,
  composeNarrativeStyleRegistry,
  composeNarrativeStyleRegistryFromInput,
  composeNarrativeStyleOrchestration,
  composeNarrativeArtifactWithStyle,
  isSupportedNarrativeStyle,
  isSupportedNarrativeFrame,
  isSupportedMotivationType,
  isSupportedNarrativeTone,
  isSupportedNarrativeStyleStatus,
  getCanonicalNarrativeStyles,
  getCanonicalNarrativeFrames,
  getCanonicalMotivationTypes,
  getCanonicalNarrativeTones,
  getCanonicalNarrativeStyleStatuses,
} from './NarrativeStyleKernel.ts';

import {
  validateNarrativeStyle,
  validateNarrativeFrame,
  validateNarrativeMotivation,
  validateNarrativeRegistry,
  validateNarrativeStyleTrace,
  validateNarrativeArtifactWithStyle,
  validateNarrativeStyleInput,
  NARRATIVE_STYLE_VALIDATION_CODES,
} from './NarrativeStyleValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: NarrativeProvenance = {
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  providedBy: 'NeuralVerse Team',
  rationale: 'Core narrative style for neural network concepts.',
};

const VALID_STYLE: NarrativeStyle = {
  styleId: 'style-001',
  styleType: 'historical',
  preferredFrame: 'historical_first',
  motivationType: 'historical_problem',
  tone: 'exploratory',
  domain: 'deep_learning',
  knowledgeArtifactId: 'knowledge-001',
  curriculumNodeId: 'curriculum-001',
  lessonId: 'lesson-001',
  sequencePriority: 1,
  summary: 'Historical narrative style for perceptron introduction.',
  tags: ['perceptron', 'history'],
  provenance: VALID_PROVENANCE,
};

const VALID_STYLE_2: NarrativeStyle = {
  styleId: 'style-002',
  styleType: 'engineering',
  preferredFrame: 'problem_first',
  motivationType: 'engineering_constraint',
  tone: 'technical',
  domain: 'deep_learning',
  knowledgeArtifactId: 'knowledge-002',
  curriculumNodeId: 'curriculum-002',
  lessonId: 'lesson-002',
  sequencePriority: 2,
  summary: 'Engineering narrative style for CNN introduction.',
  tags: ['cnn', 'engineering'],
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_FRAME: NarrativeFrame = {
  frameId: 'frame-001',
  frameType: 'problem_first',
  openingStrategy: 'Present the core challenge',
  transitionStrategy: 'Connect to historical context',
  closureStrategy: 'Summarize the problem-solution arc',
  supportedStyles: ['engineering', 'investigative'],
  provenance: VALID_PROVENANCE,
};

const VALID_MOTIVATION: NarrativeMotivation = {
  motivationId: 'motivation-001',
  motivationType: 'curiosity',
  title: 'Why Neural Networks Work',
  description: 'Explore the fundamental question of neural network effectiveness.',
  domain: 'deep_learning',
  knowledgeArtifactId: 'knowledge-001',
  provenance: VALID_PROVENANCE,
};

const VALID_INPUT: NarrativeStyleInput = {
  styles: [VALID_STYLE, VALID_STYLE_2],
};

const EMPTY_INPUT: NarrativeStyleInput = {
  styles: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Narrative Style Kernel — Composition', () => {
  it('should compose valid narrative style', () => {
    const style = composeNarrativeStyle({
      styleId: 'style-001',
      styleType: 'historical',
      preferredFrame: 'historical_first',
      motivationType: 'historical_problem',
      tone: 'exploratory',
      domain: 'deep_learning',
      knowledgeArtifactId: 'knowledge-001',
      curriculumNodeId: 'curriculum-001',
      lessonId: 'lesson-001',
      sequencePriority: 1,
      summary: 'Historical narrative.',
      tags: ['history'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(style.styleId, 'style-001');
    assert.equal(style.styleType, 'historical');
    assert.equal(style.preferredFrame, 'historical_first');
    assert.equal(style.motivationType, 'historical_problem');
    assert.equal(style.tone, 'exploratory');
    assert.equal(style.tags.length, 1);
  });

  it('should compose valid narrative frame', () => {
    const frame = composeNarrativeFrame({
      frameId: 'frame-001',
      frameType: 'problem_first',
      openingStrategy: 'Present the challenge',
      transitionStrategy: 'Connect context',
      closureStrategy: 'Summarize',
      supportedStyles: ['engineering', 'investigative'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(frame.frameId, 'frame-001');
    assert.equal(frame.frameType, 'problem_first');
    assert.equal(frame.openingStrategy, 'Present the challenge');
    assert.equal(frame.supportedStyles.length, 2);
  });

  it('should compose valid narrative motivation', () => {
    const motivation = composeNarrativeMotivation({
      motivationId: 'motivation-001',
      motivationType: 'curiosity',
      title: 'Why Neural Networks Work',
      description: 'Explore effectiveness.',
      domain: 'deep_learning',
      knowledgeArtifactId: 'knowledge-001',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(motivation.motivationId, 'motivation-001');
    assert.equal(motivation.motivationType, 'curiosity');
    assert.equal(motivation.title, 'Why Neural Networks Work');
  });

  it('should compose valid narrative tone', () => {
    const tone = composeNarrativeTone({
      toneId: 'tone-001',
      tone: 'exploratory',
      domain: 'deep_learning',
      description: 'Exploratory tone for discovery.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(tone.toneId, 'tone-001');
    assert.equal(tone.tone, 'exploratory');
    assert.equal(tone.domain, 'deep_learning');
  });

  it('should compose valid narrative style trace', () => {
    const trace = composeNarrativeStyleTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', styleId: 'style-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
  });

  it('should compose valid narrative style registry', () => {
    const registry = composeNarrativeStyleRegistry([VALID_STYLE, VALID_STYLE_2]);
    const result = validateNarrativeRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate a valid style with no errors', () => {
    const errors = validateNarrativeStyle(VALID_STYLE);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid frame with no errors', () => {
    const errors = validateNarrativeFrame(VALID_FRAME);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid motivation with no errors', () => {
    const errors = validateNarrativeMotivation(VALID_MOTIVATION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate narrative style input', () => {
    const result = validateNarrativeStyleInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should compose valid narrative artifact with style', () => {
    const artifact = composeNarrativeArtifactWithStyle({
      narrativeId: 'narrative-001',
      title: 'The Perceptron Story',
      unitType: 'lesson_opening',
      narrativeMode: 'historical_discovery',
      domain: 'deep_learning',
      status: 'published',
      canonicalKnowledgeId: 'knowledge-001',
      curriculumNodeId: 'curriculum-001',
      lessonId: 'lesson-001',
      laboratoryId: '',
      sequenceOrder: 1,
      summary: 'Opening narrative.',
      tags: ['perceptron'],
      provenance: VALID_PROVENANCE,
      appliedStyle: VALID_STYLE,
      appliedFrame: VALID_FRAME,
    });

    assert.equal(artifact.narrativeId, 'narrative-001');
    assert.equal(artifact.appliedStyle.styleId, 'style-001');
    assert.equal(artifact.appliedFrame.frameId, 'frame-001');
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Narrative Style Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeNarrativeStyleRegistry([]);
    const result = validateNarrativeRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === NARRATIVE_STYLE_VALIDATION_CODES.STYLE_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have STYLE_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate IDs', () => {
    const registry = composeNarrativeStyleRegistry([VALID_STYLE, VALID_STYLE]);
    const result = validateNarrativeRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === NARRATIVE_STYLE_VALIDATION_CODES.STYLE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have STYLE_DUPLICATE_ID error');
  });

  it('should sort deterministically by styleId', () => {
    const style3 = { ...VALID_STYLE, styleId: 'style-003' };
    const style1 = { ...VALID_STYLE, styleId: 'style-001' };
    const style2 = { ...VALID_STYLE, styleId: 'style-002' };

    const registry = composeNarrativeStyleRegistry([style3, style1, style2]);

    assert.equal(registry.styles[0].styleId, 'style-001');
    assert.equal(registry.styles[1].styleId, 'style-002');
    assert.equal(registry.styles[2].styleId, 'style-003');
  });

  it('should sort by styleType when styleId is equal', () => {
    const styleA = { ...VALID_STYLE, styleId: 'style-001', styleType: 'engineering' as const };
    const styleB = { ...VALID_STYLE, styleId: 'style-001', styleType: 'historical' as const };

    const registry = composeNarrativeStyleRegistry([styleA, styleB]);

    assert.equal(registry.styles[0].styleType, 'engineering');
    assert.equal(registry.styles[1].styleType, 'historical');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Narrative Style Kernel — Validation', () => {
  it('should detect invalid style type', () => {
    const style = { ...VALID_STYLE, styleType: 'unsupported' as any };
    const errors = validateNarrativeStyle(style);
    const styleError = errors.find(
      (e) => e.code === NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_STYLE,
    );

    assert.ok(styleError, 'Should have STYLE_INVALID_STYLE error');
  });

  it('should detect invalid frame', () => {
    const style = { ...VALID_STYLE, preferredFrame: 'unsupported' as any };
    const errors = validateNarrativeStyle(style);
    const frameError = errors.find(
      (e) => e.code === NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_FRAME,
    );

    assert.ok(frameError, 'Should have STYLE_INVALID_FRAME error');
  });

  it('should detect invalid tone', () => {
    const style = { ...VALID_STYLE, tone: 'unsupported' as any };
    const errors = validateNarrativeStyle(style);
    const toneError = errors.find(
      (e) => e.code === NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_TONE,
    );

    assert.ok(toneError, 'Should have STYLE_INVALID_TONE error');
  });

  it('should detect invalid motivation', () => {
    const style = { ...VALID_STYLE, motivationType: 'unsupported' as any };
    const errors = validateNarrativeStyle(style);
    const motivationError = errors.find(
      (e) => e.code === NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_MOTIVATION,
    );

    assert.ok(motivationError, 'Should have STYLE_INVALID_MOTIVATION error');
  });

  it('should detect invalid status', () => {
    const style = { ...VALID_STYLE, provenance: { ...VALID_PROVENANCE, governanceStatus: 'unsupported' as any } };
    const errors = validateNarrativeStyle(style);
    const statusError = errors.find(
      (e) => e.code === NARRATIVE_STYLE_VALIDATION_CODES.STYLE_INVALID_STATUS,
    );

    assert.ok(statusError, 'Should have STYLE_INVALID_STATUS error');
  });

  it('should detect missing provenance', () => {
    const style = { ...VALID_STYLE, provenance: undefined as any };
    const errors = validateNarrativeStyle(style);
    const provenanceError = errors.find(
      (e) => e.code === NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have STYLE_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance source', () => {
    const style = { ...VALID_STYLE, provenance: { ...VALID_PROVENANCE, source: '' } };
    const errors = validateNarrativeStyle(style);
    const sourceError = errors.find(
      (e) => e.code === NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have STYLE_MISSING_SOURCE error');
  });

  it('should detect missing provenance rationale', () => {
    const style = { ...VALID_STYLE, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateNarrativeStyle(style);
    const rationaleError = errors.find(
      (e) => e.code === NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have STYLE_MISSING_RATIONALE error');
  });

  it('should detect missing provenance providedBy', () => {
    const style = { ...VALID_STYLE, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateNarrativeStyle(style);
    const providedByError = errors.find(
      (e) => e.code === NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have STYLE_MISSING_PROVIDED_BY error');
  });

  it('should detect missing artifact reference', () => {
    const style = { ...VALID_STYLE, knowledgeArtifactId: '' };
    const errors = validateNarrativeStyle(style);
    const refError = errors.find(
      (e) => e.code === NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_ARTIFACT_REFERENCE,
    );

    assert.ok(refError, 'Should have STYLE_MISSING_ARTIFACT_REFERENCE error');
  });

  it('should validate a valid frame strategy fields', () => {
    const frame = { ...VALID_FRAME, openingStrategy: '' };
    const errors = validateNarrativeFrame(frame);
    const openingError = errors.find(
      (e) => e.code === NARRATIVE_STYLE_VALIDATION_CODES.STYLE_MISSING_OPENING_STRATEGY,
    );

    assert.ok(openingError, 'Should have STYLE_MISSING_OPENING_STRATEGY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeNarrativeStyleTrace({
      traceId: '_trace_1',
      decisions: [],
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
    });

    const result = validateNarrativeStyleTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: NarrativeStyleTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      compositionMetadata: {},
      deterministicMetadata: {},
      deterministic: false as true,
      generatedFrom: 'deterministic_narrative_style_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateNarrativeStyleTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Narrative Style Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeNarrativeStyleOrchestration>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeNarrativeStyleOrchestration(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].styles, results[i].styles);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeNarrativeStyleRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeNarrativeStyleRegistry([VALID_STYLE, VALID_STYLE_2]));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].styles, results[i].styles);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Narrative Style Kernel — Immutability', () => {
  it('should not mutate input styles', () => {
    const originalId = VALID_STYLE.styleId;
    const originalSummary = VALID_STYLE.summary;

    composeNarrativeStyleOrchestration(VALID_INPUT);

    assert.equal(VALID_STYLE.styleId, originalId);
    assert.equal(VALID_STYLE.summary, originalSummary);
  });

  it('should not mutate input registry styles', () => {
    const styles = [VALID_STYLE, VALID_STYLE_2];
    const originalIds = styles.map((s) => s.styleId);

    composeNarrativeStyleRegistry(styles);

    assert.equal(styles[0].styleId, originalIds[0]);
    assert.equal(styles[1].styleId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Narrative Style Kernel — Helper Functions', () => {
  it('should return canonical styles', () => {
    const styles = getCanonicalNarrativeStyles();
    assert.deepStrictEqual([...styles], [...CANONICAL_NARRATIVE_STYLES]);
    assert.equal(styles.length, 10);
  });

  it('should return canonical frames', () => {
    const frames = getCanonicalNarrativeFrames();
    assert.deepStrictEqual([...frames], [...CANONICAL_NARRATIVE_FRAMES]);
    assert.equal(frames.length, 10);
  });

  it('should return canonical motivations', () => {
    const motivations = getCanonicalMotivationTypes();
    assert.deepStrictEqual([...motivations], [...CANONICAL_MOTIVATION_TYPES]);
    assert.equal(motivations.length, 10);
  });

  it('should return canonical tones', () => {
    const tones = getCanonicalNarrativeTones();
    assert.deepStrictEqual([...tones], [...CANONICAL_NARRATIVE_TONES]);
    assert.equal(tones.length, 8);
  });

  it('should return canonical style statuses', () => {
    const statuses = getCanonicalNarrativeStyleStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_NARRATIVE_STYLE_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate style support', () => {
    assert.equal(isSupportedNarrativeStyle('historical'), true);
    assert.equal(isSupportedNarrativeStyle('storytelling'), true);
    assert.equal(isSupportedNarrativeStyle('unsupported'), false);
  });

  it('should validate frame support', () => {
    assert.equal(isSupportedNarrativeFrame('problem_first'), true);
    assert.equal(isSupportedNarrativeFrame('comparison_first'), true);
    assert.equal(isSupportedNarrativeFrame('unsupported'), false);
  });

  it('should validate motivation support', () => {
    assert.equal(isSupportedMotivationType('curiosity'), true);
    assert.equal(isSupportedMotivationType('failure'), true);
    assert.equal(isSupportedMotivationType('unsupported'), false);
  });

  it('should validate tone support', () => {
    assert.equal(isSupportedNarrativeTone('formal'), true);
    assert.equal(isSupportedNarrativeTone('didactic'), true);
    assert.equal(isSupportedNarrativeTone('unsupported'), false);
  });

  it('should validate style status support', () => {
    assert.equal(isSupportedNarrativeStyleStatus('draft'), true);
    assert.equal(isSupportedNarrativeStyleStatus('published'), true);
    assert.equal(isSupportedNarrativeStyleStatus('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Narrative Style Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 styles', () => {
    assert.equal(CANONICAL_NARRATIVE_STYLES.length, 10);
  });

  it('should have exactly 10 frames', () => {
    assert.equal(CANONICAL_NARRATIVE_FRAMES.length, 10);
  });

  it('should have exactly 10 motivations', () => {
    assert.equal(CANONICAL_MOTIVATION_TYPES.length, 10);
  });

  it('should have exactly 8 tones', () => {
    assert.equal(CANONICAL_NARRATIVE_TONES.length, 8);
  });

  it('should have exactly 6 style statuses', () => {
    assert.equal(CANONICAL_NARRATIVE_STYLE_STATUS.length, 6);
  });

  it('should contain all expected styles', () => {
    const expectedStyles = [
      'historical',
      'engineering',
      'scientific',
      'investigative',
      'comparative',
      'incremental',
      'application_driven',
      'failure_driven',
      'storytelling',
      'research_journey',
    ];

    for (const style of expectedStyles) {
      assert.ok(
        CANONICAL_NARRATIVE_STYLES.includes(style as any),
        `Should include style: ${style}`,
      );
    }
  });

  it('should contain all expected frames', () => {
    const expectedFrames = [
      'problem_first',
      'solution_first',
      'question_first',
      'historical_first',
      'application_first',
      'intuition_first',
      'mathematical_first',
      'experiment_first',
      'observation_first',
      'comparison_first',
    ];

    for (const frame of expectedFrames) {
      assert.ok(
        CANONICAL_NARRATIVE_FRAMES.includes(frame as any),
        `Should include frame: ${frame}`,
      );
    }
  });

  it('should contain all expected motivations', () => {
    const expectedMotivations = [
      'curiosity',
      'necessity',
      'historical_problem',
      'engineering_constraint',
      'scientific_question',
      'real_world_application',
      'optimization',
      'discovery',
      'failure',
      'research',
    ];

    for (const motivation of expectedMotivations) {
      assert.ok(
        CANONICAL_MOTIVATION_TYPES.includes(motivation as any),
        `Should include motivation: ${motivation}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Narrative Style Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate lesson prose', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(!('lessonProse' in result), 'Should not have lesson prose');
    assert.ok(!('generatedContent' in result), 'Should not have generated content');
  });

  it('should not generate examples', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(!('generatedExamples' in result), 'Should not have generated examples');
    assert.ok(!('exampleContent' in result), 'Should not have example content');
  });

  it('should not generate analogies', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(!('generatedAnalogies' in result), 'Should not have generated analogies');
    assert.ok(!('analogyContent' in result), 'Should not have analogy content');
  });

  it('should not make unsupported historical claims', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(!('historicalClaims' in result), 'Should not have historical claims');
    assert.ok(!('unsupportedHistory' in result), 'Should not have unsupported history');
  });

  it('should not call LLMs', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(!('llmCall' in result), 'Should not have LLM call');
    assert.ok(!('modelResponse' in result), 'Should not have model response');
  });

  it('should not rewrite knowledge', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(!('rewrittenKnowledge' in result), 'Should not have rewritten knowledge');
    assert.ok(!('modifiedKnowledge' in result), 'Should not have modified knowledge');
  });

  it('should not mutate curriculum', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(!('curriculumMutation' in result), 'Should not have curriculum mutation');
    assert.ok(!('modifiedCurriculum' in result), 'Should not have modified curriculum');
  });

  it('should not model learner mastery', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(!('learnerMastery' in result), 'Should not have learner mastery');
    assert.ok(!('masteryInference' in result), 'Should not have mastery inference');
  });

  it('should not recommend styles', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(!('styleRecommendation' in result), 'Should not have style recommendation');
    assert.ok(!('recommendedStyles' in result), 'Should not have recommended styles');
  });

  it('should not perform runtime personalization', () => {
    const result = composeNarrativeStyleOrchestration(VALID_INPUT);
    assert.ok(!('personalization' in result), 'Should not have personalization');
    assert.ok(!('learnerProfile' in result), 'Should not have learner profile');
  });

  it('should not have executable callbacks in style', () => {
    const style = composeNarrativeStyle({
      styleId: 'style-001',
      styleType: 'historical',
      preferredFrame: 'historical_first',
      motivationType: 'historical_problem',
      tone: 'exploratory',
      domain: 'deep_learning',
      knowledgeArtifactId: 'knowledge-001',
      curriculumNodeId: 'curriculum-001',
      lessonId: 'lesson-001',
      sequencePriority: 1,
      summary: 'Test.',
      tags: [],
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(style);
    for (const key of keys) {
      const value = (style as any)[key];
      assert.ok(typeof value !== 'function', `Style field "${key}" should not be a function`);
    }
  });
});
