import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  // Response
  CANONICAL_EDUCATIONAL_RESPONSE_TYPES,
  CANONICAL_CONFIDENCE_LEVELS,
  createEducationalResponse,
  // Sections
  CANONICAL_SECTION_TYPES,
  generateSections,
  // Cards
  CANONICAL_CARD_TYPES,
  generateCards,
  // Actions
  CANONICAL_ACTION_TYPES,
  generateActions,
  getEnabledActions,
  getActionsByPriority,
  // Metadata
  generateMetadata,
  getMetadataSummary,
  isMetadataConsistent,
  // Validation
  validateEducationalResponse,
  validateSection,
  validateCard,
  validateAction,
  isValidEducationalResponse,
  getValidationErrors,
  // Pipeline
  EducationalResponsePipeline,
  getEducationalPipeline,
  resetEducationalPipeline
} from './index.ts';
import type { EducationalResponse, EducationalContext } from './EducationalResponse.ts';
import type { EducationalSection } from './EducationalSections.ts';
import type { EducationalCard } from './EducationalCards.ts';
import type { EducationalAction } from './EducationalActions.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const DEFAULT_CONTEXT: EducationalContext = {
  userQuery: 'Explain neural networks',
  mode: 'teaching',
  style: 'default',
  currentRoute: '#/learning',
  currentLesson: {
    lessonId: 'nn-101',
    lessonTitle: 'Neural Networks',
    moduleId: 'dl-basics',
    moduleTitle: 'Deep Learning Basics',
    pathId: 'ml-path',
    pathTitle: 'Machine Learning',
    difficulty: 'intermediate'
  },
  agentOutputs: [],
  developerMode: false
};

const MATH_CONTENT = `
Neural networks use the equation y = f(Wx + b) where W is the weight matrix.
The derivative ∂L/∂W is computed during backpropagation.
This involves matrix multiplication and gradient descent.
`;

const CODE_CONTENT = `
Here's a simple neural network implementation:

\`\`\`python
def neural_network(x, W, b):
    return sigmoid(W @ x + b)
\`\`\`

The function computes the forward pass.
`;

const RESEARCH_CONTENT = `
Research shows that deep learning has transformed AI.
A 2020 study by Smith et al. demonstrated that transformers
outperform RNNs on most NLP benchmarks.
The evidence suggests that attention mechanisms are key.
`;

const SIMPLE_CONTENT = `
Neural networks are computing systems inspired by biological neural networks.
They consist of layers of interconnected nodes that process information.
Neural networks are used for tasks like image recognition and language processing.
`;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

describe('EducationalResponse -- Types', () => {
  it('should have 8 canonical response types', () => {
    assert.equal(CANONICAL_EDUCATIONAL_RESPONSE_TYPES.length, 8);
  });

  it('should have 4 confidence levels', () => {
    assert.equal(CANONICAL_CONFIDENCE_LEVELS.length, 4);
  });
});

describe('EducationalResponse -- Creation', () => {
  it('should create response with correct defaults', () => {
    const response = createEducationalResponse(SIMPLE_CONTENT, 'explanation', DEFAULT_CONTEXT);
    assert.ok(response.id.startsWith('edu-response-'));
    assert.equal(response.type, 'explanation');
    assert.equal(response.content, SIMPLE_CONTENT);
    assert.equal(response.sections.length, 0);
    assert.equal(response.cards.length, 0);
    assert.equal(response.actions.length, 0);
  });
});

// ============================================================================
// SECTIONS
// ============================================================================

describe('EducationalSections -- Types', () => {
  it('should have 18 canonical section types', () => {
    assert.equal(CANONICAL_SECTION_TYPES.length, 18);
  });
});

describe('EducationalSections -- Generation', () => {
  it('should generate sections for simple content', () => {
    const sections = generateSections(SIMPLE_CONTENT, 'explanation', {
      mode: 'teaching',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasResearchContent: false,
      hasVisualContent: false,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    assert.ok(sections.length > 0);
    assert.ok(sections.some(s => s.type === 'explanation'));
  });

  it('should include math section for math content', () => {
    const sections = generateSections(MATH_CONTENT, 'explanation', {
      mode: 'advanced',
      style: 'default',
      hasMathContent: true,
      hasCodeContent: false,
      hasResearchContent: false,
      hasVisualContent: false,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    assert.ok(sections.some(s => s.type === 'mathematical-insight'));
  });

  it('should include code section for code content', () => {
    const sections = generateSections(CODE_CONTENT, 'explanation', {
      mode: 'engineering',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: true,
      hasResearchContent: false,
      hasVisualContent: false,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    assert.ok(sections.some(s => s.type === 'engineering-perspective'));
  });

  it('should include research section for research content', () => {
    const sections = generateSections(RESEARCH_CONTENT, 'explanation', {
      mode: 'research',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasResearchContent: true,
      hasVisualContent: false,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    assert.ok(sections.some(s => s.type === 'research-notes'));
  });

  it('should generate unique section IDs', () => {
    const sections = generateSections(SIMPLE_CONTENT, 'explanation', {
      mode: 'teaching',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasResearchContent: false,
      hasVisualContent: false,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    const ids = sections.map(s => s.id);
    const uniqueIds = new Set(ids);
    assert.equal(ids.length, uniqueIds.size);
  });
});

// ============================================================================
// CARDS
// ============================================================================

describe('EducationalCards -- Types', () => {
  it('should have 14 canonical card types', () => {
    assert.equal(CANONICAL_CARD_TYPES.length, 14);
  });
});

describe('EducationalCards -- Generation', () => {
  it('should generate cards for content with concepts', () => {
    const sections = generateSections(SIMPLE_CONTENT, 'explanation', {
      mode: 'teaching',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasResearchContent: false,
      hasVisualContent: false,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    const cards = generateCards(SIMPLE_CONTENT, sections, {
      mode: 'teaching',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasResearchContent: false
    });

    assert.ok(Array.isArray(cards));
  });

  it('should generate code card for code content', () => {
    const sections = generateSections(CODE_CONTENT, 'explanation', {
      mode: 'engineering',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: true,
      hasResearchContent: false,
      hasVisualContent: false,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    const cards = generateCards(CODE_CONTENT, sections, {
      mode: 'engineering',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: true,
      hasResearchContent: false
    });

    assert.ok(cards.some(c => c.type === 'code'));
  });

  it('should generate unique card IDs', () => {
    const cards = generateCards(SIMPLE_CONTENT, [], {
      mode: 'teaching',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasResearchContent: false
    });

    const ids = cards.map(c => c.id);
    const uniqueIds = new Set(ids);
    assert.equal(ids.length, uniqueIds.size);
  });
});

// ============================================================================
// ACTIONS
// ============================================================================

describe('EducationalActions -- Types', () => {
  it('should have 15 canonical action types', () => {
    assert.equal(CANONICAL_ACTION_TYPES.length, 15);
  });
});

describe('EducationalActions -- Generation', () => {
  it('should always include explain-more and simplify', () => {
    const actions = generateActions(SIMPLE_CONTENT, 'explanation', {
      mode: 'teaching',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    assert.ok(actions.some(a => a.type === 'explain-more'));
    assert.ok(actions.some(a => a.type === 'simplify'));
  });

  it('should include practice for code content', () => {
    const actions = generateActions(CODE_CONTENT, 'explanation', {
      mode: 'engineering',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: true,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    assert.ok(actions.some(a => a.type === 'practice'));
  });

  it('should include quiz for assessment content', () => {
    const actions = generateActions(SIMPLE_CONTENT, 'explanation', {
      mode: 'teaching',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasLabContent: false,
      hasAssessmentContent: true
    });

    assert.ok(actions.some(a => a.type === 'generate-quiz'));
  });

  it('should return only enabled actions', () => {
    const actions = generateActions(SIMPLE_CONTENT, 'explanation', {
      mode: 'teaching',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    const enabled = getEnabledActions(actions);
    assert.ok(enabled.every(a => a.enabled));
  });

  it('should sort actions by priority', () => {
    const actions = generateActions(SIMPLE_CONTENT, 'explanation', {
      mode: 'teaching',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    const sorted = getActionsByPriority(actions);
    for (let i = 1; i < sorted.length; i++) {
      assert.ok(sorted[i].priority >= sorted[i - 1].priority);
    }
  });
});

// ============================================================================
// METADATA
// ============================================================================

describe('EducationalMetadata -- Generation', () => {
  it('should generate metadata', () => {
    const sections = generateSections(SIMPLE_CONTENT, 'explanation', {
      mode: 'teaching',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasResearchContent: false,
      hasVisualContent: false,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    const cards = generateCards(SIMPLE_CONTENT, sections, {
      mode: 'teaching',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasResearchContent: false
    });

    const actions = generateActions(SIMPLE_CONTENT, 'explanation', {
      mode: 'teaching',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    const metadata = generateMetadata(SIMPLE_CONTENT, 'explanation', sections, cards, actions, {
      mode: 'teaching',
      style: 'default',
      route: '#/learning'
    });

    assert.equal(metadata.responseType, 'explanation');
    assert.equal(metadata.mode, 'teaching');
    assert.equal(metadata.style, 'default');
    assert.equal(metadata.route, '#/learning');
    assert.ok(metadata.createdAt);
    assert.ok(isMetadataConsistent(metadata));
  });

  it('should generate summary', () => {
    const metadata = generateMetadata(SIMPLE_CONTENT, 'explanation', [], [], [], {
      mode: 'teaching',
      style: 'default',
      route: '#/learning'
    });

    const summary = getMetadataSummary(metadata);
    assert.ok(summary.includes('Type: explanation'));
    assert.ok(summary.includes('Difficulty:'));
  });
});

// ============================================================================
// VALIDATION
// ============================================================================

describe('EducationalValidation -- Response', () => {
  it('should validate empty response', () => {
    const response = createEducationalResponse('', 'explanation', DEFAULT_CONTEXT);
    const result = validateEducationalResponse(response);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'response_empty');
  });

  it('should validate response with no sections', () => {
    const response = createEducationalResponse(SIMPLE_CONTENT, 'explanation', DEFAULT_CONTEXT);
    const result = validateEducationalResponse(response);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'response_no_sections');
  });

  it('should validate complete response', () => {
    let response = createEducationalResponse(SIMPLE_CONTENT, 'explanation', DEFAULT_CONTEXT);

    // Add sections
    const sections = generateSections(SIMPLE_CONTENT, 'explanation', {
      mode: 'teaching',
      style: 'default',
      hasMathContent: false,
      hasCodeContent: false,
      hasResearchContent: false,
      hasVisualContent: false,
      hasLabContent: false,
      hasAssessmentContent: false
    });

    response = { ...response, sections };

    const result = validateEducationalResponse(response);
    assert.equal(result.valid, true);
  });
});

describe('EducationalValidation -- Section', () => {
  it('should validate valid section', () => {
    const section: EducationalSection = {
      id: 'section-1',
      type: 'explanation',
      title: 'Explanation',
      content: 'This is an explanation.',
      priority: 1,
      expandable: true,
      defaultExpanded: true
    };

    const result = validateSection(section);
    assert.equal(result.valid, true);
  });

  it('should reject invalid section type', () => {
    const section = {
      id: 'section-1',
      type: 'invalid',
      title: 'Invalid',
      content: 'Content',
      priority: 1,
      expandable: true,
      defaultExpanded: true
    } as unknown as EducationalSection;

    const result = validateSection(section);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'section_invalid_type');
  });

  it('should reject empty section content', () => {
    const section: EducationalSection = {
      id: 'section-1',
      type: 'explanation',
      title: 'Empty',
      content: '',
      priority: 1,
      expandable: true,
      defaultExpanded: true
    };

    const result = validateSection(section);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'section_empty_content');
  });
});

describe('EducationalValidation -- Card', () => {
  it('should validate valid card', () => {
    const card: EducationalCard = {
      id: 'card-1',
      type: 'concept',
      title: 'Concept',
      content: 'This is a concept.',
      metadata: {
        priority: 1,
        category: 'definition',
        tags: ['concept'],
        relatedConcepts: []
      },
      expandable: false
    };

    const result = validateCard(card);
    assert.equal(result.valid, true);
  });

  it('should reject invalid card type', () => {
    const card = {
      id: 'card-1',
      type: 'invalid',
      title: 'Invalid',
      content: 'Content',
      metadata: {
        priority: 1,
        category: 'test',
        tags: [],
        relatedConcepts: []
      },
      expandable: false
    } as unknown as EducationalCard;

    const result = validateCard(card);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'card_invalid_type');
  });
});

describe('EducationalValidation -- Action', () => {
  it('should validate valid action', () => {
    const action: EducationalAction = {
      id: 'action-1',
      type: 'explain-more',
      label: 'Explain More',
      description: 'Get more details',
      icon: '\u{1F50D}',
      priority: 1,
      enabled: true
    };

    const result = validateAction(action);
    assert.equal(result.valid, true);
  });

  it('should reject disabled action', () => {
    const action: EducationalAction = {
      id: 'action-1',
      type: 'explain-more',
      label: 'Explain More',
      description: 'Get more details',
      icon: '\u{1F50D}',
      priority: 1,
      enabled: false
    };

    const result = validateAction(action);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'action_disabled');
  });
});

// ============================================================================
// PIPELINE
// ============================================================================

describe('EducationalPipeline -- Core', () => {
  it('should create pipeline', () => {
    const pipeline = new EducationalResponsePipeline();
    assert.ok(pipeline);
  });

  it('should process simple content', () => {
    const pipeline = new EducationalResponsePipeline();
    const response = pipeline.process(SIMPLE_CONTENT, DEFAULT_CONTEXT);

    assert.ok(response.id);
    assert.equal(response.type, 'explanation');
    assert.equal(response.content, SIMPLE_CONTENT);
    assert.ok(response.sections.length > 0);
    assert.ok(response.metadata);
  });

  it('should process math content', () => {
    const pipeline = new EducationalResponsePipeline();
    const response = pipeline.process(MATH_CONTENT, DEFAULT_CONTEXT);

    assert.ok(response.sections.some(s => s.type === 'mathematical-insight'));
  });

  it('should process code content', () => {
    const pipeline = new EducationalResponsePipeline();
    const response = pipeline.process(CODE_CONTENT, {
      ...DEFAULT_CONTEXT,
      mode: 'engineering'
    });

    assert.ok(response.cards.some(c => c.type === 'code'));
  });

  it('should process research content', () => {
    const pipeline = new EducationalResponsePipeline();
    const response = pipeline.process(RESEARCH_CONTENT, {
      ...DEFAULT_CONTEXT,
      mode: 'research'
    });

    assert.ok(response.sections.some(s => s.type === 'research-notes'));
  });

  it('should validate response', () => {
    const pipeline = new EducationalResponsePipeline();
    const response = pipeline.process(SIMPLE_CONTENT, DEFAULT_CONTEXT);
    const result = pipeline.validate(response);

    assert.equal(result.valid, true);
  });

  it('should detect math content', () => {
    const pipeline = new EducationalResponsePipeline();
    const response = pipeline.process(MATH_CONTENT, DEFAULT_CONTEXT);

    assert.equal(response.metadata.hasMath, true);
  });

  it('should detect code content', () => {
    const pipeline = new EducationalResponsePipeline();
    const response = pipeline.process(CODE_CONTENT, DEFAULT_CONTEXT);

    assert.equal(response.metadata.hasCode, true);
  });

  it('should generate actions', () => {
    const pipeline = new EducationalResponsePipeline();
    const response = pipeline.process(SIMPLE_CONTENT, DEFAULT_CONTEXT);

    assert.ok(response.actions.length > 0);
  });

  it('should generate next steps', () => {
    const pipeline = new EducationalResponsePipeline();
    const response = pipeline.process(SIMPLE_CONTENT, DEFAULT_CONTEXT);

    assert.ok(response.nextSteps.length > 0);
  });

  it('should generate summary', () => {
    const pipeline = new EducationalResponsePipeline();
    const response = pipeline.process(SIMPLE_CONTENT, DEFAULT_CONTEXT);

    assert.ok(response.summary.length > 0);
  });
});

describe('EducationalPipeline -- Determinism', () => {
  it('should produce identical output for same input', () => {
    const pipeline = new EducationalResponsePipeline();

    const response1 = pipeline.process(SIMPLE_CONTENT, DEFAULT_CONTEXT);
    const response2 = pipeline.process(SIMPLE_CONTENT, DEFAULT_CONTEXT);

    assert.equal(response1.type, response2.type);
    assert.equal(response1.content, response2.content);
    assert.equal(response1.sections.length, response2.sections.length);
    assert.equal(response1.cards.length, response2.cards.length);
    assert.equal(response1.actions.length, response2.actions.length);
  });

  it('should not mutate input', () => {
    const pipeline = new EducationalResponsePipeline();
    const originalContent = SIMPLE_CONTENT;

    pipeline.process(SIMPLE_CONTENT, DEFAULT_CONTEXT);

    assert.equal(SIMPLE_CONTENT, originalContent);
  });
});

describe('EducationalPipeline -- Convenience', () => {
  it('should get default pipeline', () => {
    resetEducationalPipeline();
    const pipeline = getEducationalPipeline();
    assert.ok(pipeline);
  });

  it('should return same instance', () => {
    resetEducationalPipeline();
    const p1 = getEducationalPipeline();
    const p2 = getEducationalPipeline();
    assert.strictEqual(p1, p2);
  });
});
