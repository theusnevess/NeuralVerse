/**
 * NV-1000-A1 / NV-1300-D1A/D1B/D1C/D1D — Didactic Architecture Agent
 *
 * The pedagogical orchestrator of NeuralVerse.
 * Interprets existing NV-800 curriculum resources and presents them
 * in the most pedagogically effective way possible.
 *
 * This is a read-only pedagogical layer. It does NOT modify curriculum.
 *
 * D1A Evolution: Builds a deterministic pedagogical plan before producing
 * any didactic response. Integrates composition DAG, instructional layers,
 * difficulty ladder, and multi-perspective engine.
 *
 * D1B Evolution: Adds semantic dependency resolution, example selection,
 * recap insertion, cross-domain connections, and resource selection.
 *
 * D1C Evolution: Adds visualization orchestration, laboratory placement,
 * media timeline generation, instructional transitions, and density optimization.
 *
 * D1D Evolution: Adds evidence tracing, memory & review bridges, semantic
 * learning bridge, cross-agent collaboration orchestration, and optional
 * local generative augmentation (P11). The deterministic planner remains
 * the canonical instructional engine. Generative AI may only enrich the
 * lesson; it never defines the lesson.
 *
 * 10 Educational Modes:
 * 1. Explain — Structured explanations
 * 2. Analogy — Multi-domain analogies
 * 3. Socratic — Layered questioning
 * 4. Misconception — Proactive correction
 * 5. Comparison — Concept comparison
 * 6. Multi-Level — Adaptive depth (Beginner/Intermediate/Advanced/Research)
 * 7. Learning Order — Prerequisites and next steps
 * 8. Reading Companion — Artifact-specific guidance
 * 9. Reflection — Reflective prompts
 * 10. Knowledge Transfer — Industry/research mapping
 */

import { createMisconceptionLibrary } from './misconception-library.js';
import { createAnalogyEngine } from './analogy-engine.js';
import { createComparisonEngine } from './comparison-engine.js';
import { createSocraticEngine } from './socratic-engine.js';
import { createSharedKnowledgeService } from '../shared-knowledge/shared-knowledge-service.js';
import { createCompositionGraph } from './composition-graph.js';
import { createInstructionalLayers } from './instructional-layers.js';
import { createDifficultyLadder } from './difficulty-ladder.js';
import { createMultiPerspectiveEngine } from './multi-perspective-engine.js';
import { createPedagogicalPlanner } from './pedagogical-planner.js';
import { createSemanticDependencyResolver } from './semantic-dependency-resolver.js';
import { createExampleSelectionEngine } from './example-selection-engine.js';
import { createExampleRegistry } from './example-registry.js';
import { createCrossDomainConnector } from './cross-domain-connector.js';
import { createRecapInserter } from './recap-inserter.js';
import { createResourceSelector } from './resource-selector.js';
import { createVisualizationOrchestrator } from './visualization-orchestrator.js';
import { createLaboratoryPlacer } from './laboratory-placer.js';
import { createMediaOrchestrator } from './media-orchestrator.js';
import { createInstructionalTransitionEngine } from './instructional-transition-engine.js';
import { createMediaDensityOptimizer } from './media-density-optimizer.js';
import { createEvidenceTracer } from './evidence-tracer.js';
import { createMemoryReviewBridge } from './memory-review-bridge.js';
import { createSemanticLearningBridge } from './semantic-learning-bridge.js';
import { createAgentCollaborationOrchestrator } from './agent-collaboration-orchestrator.js';
import { createGenerativeAugmenter } from './generative-augmenter.js';
import { createCognitiveLoadOptimizer } from './cognitive-load-optimizer.js';
import { createInstructionalPacingEngine } from './instructional-pacing-engine.js';
import { createLessonComposer } from './lesson-composer.js';
import { createReadabilityOptimizer } from './readability-optimizer.js';
import { createAccessibilityPolish } from './accessibility-polish.js';

const EXPLANATION_MODES = [
  { id: 'default', label: 'Default', description: 'Balanced explanation with all framework sections' },
  { id: 'beginner', label: 'Beginner', description: 'Simple language, heavy on intuition and analogies' },
  { id: 'intermediate', label: 'Intermediate', description: 'Assumes foundational knowledge, focuses on connections' },
  { id: 'advanced', label: 'Advanced', description: 'Technical depth, mathematical rigor, research context' },
  { id: 'mathematical', label: 'Mathematical', description: 'Formula-driven with variable definitions and proofs' },
  { id: 'engineering', label: 'Engineering', description: 'Implementation-focused, trade-offs, production considerations' },
  { id: 'research', label: 'Research', description: 'Paper-oriented, SOTA context, open questions' },
  { id: 'visual-intuition', label: 'Visual Intuition', description: 'Spatial reasoning, diagram-first explanations' },
  { id: 'analogy-first', label: 'Analogy First', description: 'Start with everyday analogies, then bridge to technical' },
  { id: 'step-by-step', label: 'Step-by-Step', description: 'Sequential walkthrough with numbered steps' },
  { id: 'executive-summary', label: 'Executive Summary', description: '3-sentence overview with key takeaways' },
  { id: 'socratic', label: 'Socratic', description: 'Guiding questions instead of direct answers' }
];

const INTENT_PATTERNS = {
  simplify: ['simplify', 'easy', 'beginner', 'basic', 'simple', 'explain simply', 'like im five', 'simple terms', 'in simple'],
  deepen: ['deep', 'advanced', 'technical', 'mathematical', 'proof', 'formal', 'rigorous'],
  compare: ['compare', 'vs', 'versus', 'difference', 'similar', 'contrast', 'diferen\u00e7a', 'comparar'],
  analogy: ['analogy', 'analog', 'like', 'similar to', 'reminds me of', 'imagine'],
  misconception: ['misconception', 'wrong', 'mistake', 'confused', 'confusion', 'common error'],
  summarize: ['summarize', 'summary', 'overview', 'tldr', 'brief', 'concise'],
  connect: ['connect', 'relate', 'relationship', 'prerequisite', 'depends on', 'linked'],
  socratic: ['guide me', 'help me think', 'ask me', 'socratic', 'don\'t tell me', 'lead me', 'question'],
  reflection: ['reflect', 'think about', 'consider', 'ponder', 'what if', 'imagine if'],
  transfer: ['industry', 'real world', 'production', 'apply', 'career', 'professional', 'deploy'],
  reading: ['reading', 'artifact', 'lesson', 'module', 'current topic', 'this page'],
  explain: ['explain', 'what is', 'what are', 'describe', 'tell me about', 'define']
};

const READING_COMPANION_SECTIONS = {
  summary: 'A concise summary of the key ideas in this artifact.',
  keyIdea: 'The single most important insight to take away.',
  hiddenAssumptions: 'Assumptions that are not explicitly stated but are necessary for the content to make sense.',
  terminology: 'Key terms defined precisely to avoid confusion.',
  checkpoints: 'Questions to verify your understanding as you read.',
  reflection: 'Prompts for deeper thinking about the content.'
};

const KNOWLEDGE_TRANSFER_DOMAINS = {
  industry: {
    label: 'Industry Applications',
    descriptions: [
      'How this concept is used in production systems at tech companies.',
      'Real-world deployment considerations and scaling challenges.',
      'Industry-specific adaptations and optimizations.'
    ]
  },
  research: {
    label: 'Research Frontiers',
    descriptions: [
      'Current open problems and active research directions.',
      'Recent papers that extend or challenge this concept.',
      'Unresolved questions in the field.'
    ]
  },
  production: {
    label: 'Production Systems',
    descriptions: [
      'How to implement this in a production ML pipeline.',
      'Monitoring, debugging, and maintenance considerations.',
      'Performance optimization and cost management.'
    ]
  },
  software: {
    label: 'Software Architecture',
    descriptions: [
      'How this concept fits into software system design.',
      'API design and interface considerations.',
      'Integration patterns with existing codebases.'
    ]
  },
  cv: {
    label: 'Computer Vision',
    descriptions: [
      'Specific applications in image and video processing.',
      'Architecture patterns for vision tasks.',
      'Datasets and benchmarks relevant to this concept.'
    ]
  },
  ml: {
    label: 'Machine Learning',
    descriptions: [
      'Connections to other ML concepts and techniques.',
      'How this fits into the broader ML landscape.',
      'Common pitfalls and best practices.'
    ]
  },
  genai: {
    label: 'Generative AI',
    descriptions: [
      'Applications in generative models (LLMs, diffusion, etc.).',
      'How this concept enables or constrains generation.',
      'Emerging techniques and future directions.'
    ]
  }
};

function createDidacticArchitectureAgent() {
  const misconceptionLib = createMisconceptionLibrary();
  const analogyEngine = createAnalogyEngine();
  const comparisonEngine = createComparisonEngine();
  const socraticEngine = createSocraticEngine();
  const sharedKnowledge = (typeof window !== 'undefined' && window.NeuralVerse?.sharedKnowledgeService)
    ? window.NeuralVerse.sharedKnowledgeService
    : createSharedKnowledgeService();

  const compositionGraph = createCompositionGraph();
  const instructionalLayers = createInstructionalLayers();
  const difficultyLadder = createDifficultyLadder();
  const multiPerspectiveEngine = createMultiPerspectiveEngine();
  const semanticResolver = createSemanticDependencyResolver();
  const exampleEngine = createExampleSelectionEngine();
  const exampleReg = createExampleRegistry();
  const crossDomainConnector = createCrossDomainConnector();
  const recapInserter = createRecapInserter();
  const resourceSelector = createResourceSelector();
  const visualizationOrchestrator = createVisualizationOrchestrator();
  const laboratoryPlacer = createLaboratoryPlacer();
  const transitionEngine = createInstructionalTransitionEngine();
  const densityOptimizer = createMediaDensityOptimizer();
  const mediaOrchestrator = createMediaOrchestrator({
    visualizationOrchestrator: visualizationOrchestrator,
    laboratoryPlacer: laboratoryPlacer,
    transitionEngine: transitionEngine,
    densityOptimizer: densityOptimizer
  });
  const evidenceTracer = createEvidenceTracer();
  const memoryReviewBridge = createMemoryReviewBridge();
  const semanticLearningBridge = createSemanticLearningBridge();
  const agentCollaborationOrchestrator = createAgentCollaborationOrchestrator({
    agents: {
      sharedKnowledge: sharedKnowledge,
      research: (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.researchStateOfArtAgent) || null,
      applications: (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.applicationProfessionalTransferAgent) || null,
      curiosity: (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.curiosityEngagementAgent) || null,
      assessment: (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.assessmentReinforcementAgent) || null
    }
  });
  const generativeAugmenter = createGenerativeAugmenter({
    generativeController: (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.GenerativeController) || null
  });
  const cognitiveLoadOptimizer = createCognitiveLoadOptimizer();
  const instructionalPacingEngine = createInstructionalPacingEngine();
  const lessonComposer = createLessonComposer();
  const readabilityOptimizer = createReadabilityOptimizer();
  const accessibilityPolish = createAccessibilityPolish();
  const pedagogicalPlanner = createPedagogicalPlanner({
    compositionGraph: compositionGraph,
    instructionalLayers: instructionalLayers,
    difficultyLadder: difficultyLadder,
    multiPerspectiveEngine: multiPerspectiveEngine,
    semanticResolver: semanticResolver,
    exampleEngine: exampleEngine,
    exampleRegistry: exampleReg,
    crossDomainConnector: crossDomainConnector,
    recapInserter: recapInserter,
    resourceSelector: resourceSelector,
    mediaOrchestrator: mediaOrchestrator,
    evidenceTracer: evidenceTracer,
    memoryReviewBridge: memoryReviewBridge,
    semanticLearningBridge: semanticLearningBridge,
    agentCollaborationOrchestrator: agentCollaborationOrchestrator,
    generativeAugmenter: generativeAugmenter,
    cognitiveLoadOptimizer: cognitiveLoadOptimizer,
    instructionalPacingEngine: instructionalPacingEngine,
    lessonComposer: lessonComposer,
    readabilityOptimizer: readabilityOptimizer,
    accessibilityPolish: accessibilityPolish
  });

  let _sharedKnowledgeReady = false;

  async function initialize() {
    try {
      await sharedKnowledge.initialize();
      _sharedKnowledgeReady = true;
    } catch {
      _sharedKnowledgeReady = false;
    }
  }

  if (typeof window !== 'undefined') {
    initialize();
  }

  function canHandle(context) {
    if (!context) return false;
    const query = (context.userQuery || '').toLowerCase();
    const explicitMatch = context.requestType === 'didactic-architecture';
    const keywordMatch = query.length > 0;
    return explicitMatch || keywordMatch;
  }

  function _buildPlannerInput(context, intent, mode, options) {
    const query = context.userQuery || '';
    const topic = extractTopic(context, query);
    const difficulty = (options && options.difficulty) || 'standard';
    const perspective = (options && options.perspective) || undefined;

    const availableResources = {
      concepts: [],
      artifacts: [],
      visualizations: [],
      laboratories: [],
      sharedKnowledge: []
    };

    if (context.selectedArtifact) {
      availableResources.artifacts.push(context.selectedArtifact);
    }
    if (context.selectedLesson && context.selectedLesson.artifacts) {
      for (var a = 0; a < context.selectedLesson.artifacts.length; a++) {
        availableResources.artifacts.push(context.selectedLesson.artifacts[a]);
      }
    }

    if (typeof window !== 'undefined' && window.NeuralVerse) {
      var vizRegistry = window.NeuralVerse.ParametricRegistry;
      if (vizRegistry && typeof vizRegistry.getAll === 'function') {
        var allViz = vizRegistry.getAll();
        for (var v = 0; v < allViz.length; v++) {
          if (allViz[v].concepts && allViz[v].concepts.length > 0) {
            availableResources.visualizations.push(allViz[v]);
          }
        }
      }

      var labRegistry = window.NeuralVerse.LabRegistry;
      if (labRegistry && typeof labRegistry.getAll === 'function') {
        var allLabs = labRegistry.getAll();
        for (var l = 0; l < allLabs.length; l++) {
          availableResources.laboratories.push(allLabs[l]);
        }
      }
    }

    if (_sharedKnowledgeReady && sharedKnowledge) {
      var domainData = sharedKnowledge.getSyncDomainByTopic ? sharedKnowledge.getSyncDomainByTopic(topic, query) : null;
      if (domainData) {
        availableResources.sharedKnowledge.push(domainData);
      }
    }

    return {
      query: query,
      intent: intent,
      mode: mode,
      topic: topic,
      difficulty: difficulty,
      perspective: perspective,
      availableResources: availableResources,
      conceptIds: context.conceptIds || []
    };
  }

  function _attachPlanMetadata(result, plan) {
    if (!result || typeof result !== 'object') return result;
    if (!plan || typeof plan !== 'object') return result;

    result.planId = plan.id || null;
    result.difficulty = plan.difficulty || 'standard';
    result.perspective = plan.selectedPerspective || 'intuitive';
    result.includedLayers = plan.layers ? plan.layers.map(function (l) { return l.id; }) : [];
    result.omittedLayers = plan.omissions ? plan.omissions.map(function (o) { return o.layerId; }) : [];
    result.graphValid = plan.graph ? plan.graph.valid : false;
    result.evidence = plan.evidence || [];
    result.visualizations = plan.visualizations || [];
    result.laboratories = plan.laboratories || [];
    result.mediaTimeline = plan.mediaTimeline || [];
    result.transitionMap = plan.transitionMap || [];
    result.densityMetrics = plan.densityMetrics || {};
    result.evidenceTree = plan.evidenceTree || null;
    result.evidenceBlocks = plan.evidenceBlocks || [];
    result.memoryContext = plan.memoryContext || null;
    result.reviewContext = plan.reviewContext || null;
    result.semanticContext = plan.semanticContext || null;
    result.agentContributions = plan.agentContributions || null;
    result.generatedBlocks = plan.generatedBlocks || [];

    return result;
  }

  function run(context, options = {}) {
    const mode = options.mode || 'default';
    const query = context.userQuery || '';
    const intent = detectIntent(query);

    const reasoningStrategy = buildReasoningStrategy(intent, mode, context);

    const plannerInput = _buildPlannerInput(context, intent, mode, options);
    plannerInput.allowGenerative = options.allowGenerative === true;
    const plan = pedagogicalPlanner.buildPlan(plannerInput);

    let result;
    let effectiveMode = mode;
    switch (intent) {
      case 'compare':
        result = buildComparisonResponse(context, mode);
        effectiveMode = 'comparison';
        break;
      case 'socratic':
        result = buildSocraticResponse(context, mode);
        effectiveMode = 'socratic';
        break;
      case 'analogy':
        result = buildAnalogyResponse(context, mode);
        effectiveMode = 'analogy';
        break;
      case 'misconception':
        result = buildMisconceptionResponse(context, mode);
        effectiveMode = 'misconception';
        break;
      case 'reflection':
        result = buildReflectionResponse(context, mode);
        effectiveMode = 'reflection';
        break;
      case 'transfer':
        result = buildTransferResponse(context, mode);
        effectiveMode = 'transfer';
        break;
      case 'reading':
        result = buildReadingCompanionResponse(context, mode);
        effectiveMode = 'reading-companion';
        break;
      case 'connect':
        result = buildConnectionResponse(context, mode);
        effectiveMode = 'connection';
        break;
      case 'summarize':
        result = buildSummaryResponse(context, mode);
        effectiveMode = 'summary';
        break;
      case 'simplify':
        result = buildStandardResponse(context, 'beginner');
        effectiveMode = 'beginner';
        break;
      case 'deepen':
        result = buildStandardResponse(context, 'advanced');
        effectiveMode = 'advanced';
        break;
      default:
        result = buildStandardResponse(context, mode);
    }

    result.mode = effectiveMode;
    result.reasoningStrategy = reasoningStrategy;
    result = _attachPlanMetadata(result, plan);
    return result;
  }

  function detectIntent(query) {
    const lower = (query || '').toLowerCase();

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (lower.includes(pattern)) {
          return intent;
        }
      }
    }

    return 'explain';
  }

  function buildReasoningStrategy(intent, mode, context) {
    const strategies = [];

    if (intent === 'analogy' || mode === 'analogy-first') strategies.push('Analogy');
    if (intent === 'misconception') strategies.push('Misconception Correction');
    if (intent === 'compare') strategies.push('Comparison');
    if (intent === 'socratic') strategies.push('Socratic Guidance');
    if (intent === 'reflection') strategies.push('Reflection Prompts');
    if (intent === 'transfer') strategies.push('Knowledge Transfer');
    if (intent === 'reading') strategies.push('Reading Companion');
    if (context.selectedPath || context.selectedModule) strategies.push('Curriculum Context');

    if (strategies.length === 0) strategies.push('Structured Explanation');

    return strategies.join(' + ');
  }

  function buildStandardResponse(context, mode) {
    const query = context.userQuery || '';
    const topic = extractTopic(context, query);
    const sections = [];

    sections.push(buildOverviewSection(topic, context, mode));
    sections.push(buildIntuitionSection(topic, context, mode));
    sections.push(buildDetailedExplanationSection(topic, context, mode));

    const analogy = analogyEngine.generate(topic, context, mode);
    if (analogy) {
      sections.push({ title: 'Analogy', content: analogy, type: 'analogy' });
    }

    sections.push(buildMisconceptionsSection(topic, context));
    sections.push(buildConnectionsSection(topic, context));
    sections.push(buildReflectionSection(topic, context));
    sections.push(buildSuggestedNextSection(topic, context));

    return {
      agentId: 'didactic-architecture',
      agentName: 'Didactic Architecture Agent',
      mode,
      topic,
      sections: sections.filter(Boolean),
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: null
    };
  }

  function buildOverviewSection(topic, context, mode) {
    let content = '';

    if (mode === 'executive-summary') {
      content = `**${topic}** \u2014 A concise overview.\n\n`;
      content += 'This concept is a key building block in the curriculum. ';
      content += 'It bridges theoretical understanding and practical application. ';
      content += 'Understanding it deeply will accelerate your progress through related topics.';
    } else if (mode === 'beginner') {
      content = `**${topic}**\n\n`;
      content += 'In simple terms, this is a fundamental concept that helps us understand how AI systems work. ';
      content += 'Think of it as a building block \u2014 once you understand this, many other concepts will make more sense.';
    } else if (mode === 'advanced' || mode === 'mathematical') {
      content = `**${topic}**\n\n`;
      content += 'This concept represents a formal construct within the theoretical framework. ';
      content += 'Its mathematical properties ensure consistency and enable rigorous analysis. ';
      content += 'The formal definition captures essential invariants that simpler formulations miss.';
    } else {
      content = `**${topic}**\n\n`;
      content += 'This is a key concept in the curriculum that connects theory to practice. ';
      content += 'Understanding it well will make subsequent topics significantly more accessible.';
    }

    return { title: 'Overview', content, type: 'text' };
  }

  function buildIntuitionSection(topic, context, mode) {
    let content = '';

    if (mode === 'visual-intuition') {
      content = `**Visual Mental Model:**\n\nImagine ${topic} as a system with inputs flowing through a process to produce outputs. `;
      content += 'The key visual insight is seeing how each component transforms the information \u2014 not just what it does, but *how the shape of the data changes* at each step. ';
      content += 'Trace the data flow mentally: what enters, what gets transformed, and what emerges.';
    } else if (mode === 'analogy-first') {
      const analogy = analogyEngine.generate(topic, context, 'beginner');
      content = analogy || `**Intuitive Understanding:**\n\n${topic} can be understood through everyday experience. `;
      content += 'Consider how you solve problems in daily life \u2014 you rarely start from first principles. Instead, you recognize patterns, apply heuristics, and refine based on feedback.';
    } else {
      content = `**Mental Model:**\n\nThink of ${topic} as a *lens* through which we can understand a larger system. `;
      content += 'The intuition is not about memorizing a definition, but about developing a *feel* for when and why this concept applies. ';
      content += 'Ask yourself: "What would the world look like without this concept? What breaks?" ';
      content += 'The answer reveals its essential purpose.';
    }

    return { title: 'Intuition', content, type: 'intuition' };
  }

  function buildDetailedExplanationSection(topic, context, mode) {
    const depth = mode === 'beginner' ? 'accessible' :
                  mode === 'advanced' || mode === 'mathematical' ? 'technical' : 'balanced';

    let content = '';

    if (depth === 'accessible') {
      content = `At its core, **${topic}** is about understanding a fundamental relationship in the curriculum. `;
      content += 'Think of it as a piece of a larger puzzle \u2014 each concept builds on previous ones and enables future learning. ';
      content += 'The key insight is not memorizing definitions, but understanding *why* this concept exists and *what problem* it solves.';
    } else if (depth === 'technical') {
      content = `**${topic}** represents a formal construct within the theoretical framework. `;
      content += 'Its mathematical properties ensure consistency and enable rigorous analysis. ';
      content += 'The formal definition captures essential invariants that simpler formulations miss. ';
      content += 'Understanding the formal underpinnings enables you to reason about edge cases and limits.';
    } else {
      content = `**${topic}** is a concept that bridges theoretical understanding and practical application. `;
      content += 'It exists because simpler approaches fail to capture important nuances. ';
      content += 'The key is understanding the *why* behind the formulation, not just the *what*.';
    }

    return { title: 'Detailed Explanation', content, type: 'text' };
  }

  function buildComparisonResponse(context, mode) {
    const query = context.userQuery || '';
    const parsed = comparisonEngine.parseComparisonQuery(query);
    const result = comparisonEngine.compare(parsed.conceptA, parsed.conceptB, context);

    const sections = [
      {
        title: `Comparison: ${parsed.conceptA} vs ${parsed.conceptB}`,
        content: result.table,
        type: 'comparison-table'
      },
      { title: 'Key Differences', content: result.differences, type: 'text' },
      { title: 'When to Use Which', content: result.guidance, type: 'text' }
    ];

    if (result.similarities) {
      sections.push({ title: 'Similarities', content: result.similarities, type: 'text' });
    }
    if (result.assumptions) {
      sections.push({ title: 'Underlying Assumptions', content: result.assumptions, type: 'text' });
    }
    if (result.tradeoffs) {
      sections.push({ title: 'Trade-offs', content: result.tradeoffs, type: 'text' });
    }

    return {
      agentId: 'didactic-architecture',
      agentName: 'Didactic Architecture Agent',
      mode: 'comparison',
      topic: `Comparing ${parsed.conceptA} vs ${parsed.conceptB}`,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: null
    };
  }

  function buildSocraticResponse(context, mode) {
    const query = context.userQuery || '';
    const topic = extractTopic(context, query);
    const questions = socraticEngine.generate(topic, context);
    const mainQuestions = Array.isArray(questions.main) ? questions.main.join('\n') : questions.main;

    const sections = [
      { title: 'Let\'s Think Together', content: questions.intro || questions.opening, type: 'text' },
      { title: 'Guiding Questions', content: mainQuestions, type: 'socratic-questions' },
      { title: 'Reflection Prompts', content: questions.reflection, type: 'text' }
    ];

    if (questions.layers) {
      for (const [layer, qs] of Object.entries(questions.layers)) {
        sections.push({
          title: `${layer.charAt(0).toUpperCase() + layer.slice(1)} Questions`,
          content: qs.join('\n'),
          type: 'socratic-questions'
        });
      }
    }

    return {
      agentId: 'didactic-architecture',
      agentName: 'Didactic Architecture Agent',
      mode: 'socratic',
      topic,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: null
    };
  }

  function buildAnalogyResponse(context, mode) {
    const query = context.userQuery || '';
    const topic = extractTopic(context, query);

    const multiDomain = analogyEngine.generateMultiDomain(topic, context, 3);
    const primaryAnalogy = analogyEngine.generate(topic, context, mode);

    const sections = [
      { title: 'Primary Analogy', content: primaryAnalogy, type: 'analogy' }
    ];

    if (multiDomain.length > 1) {
      let additionalContent = '';
      for (let i = 1; i < multiDomain.length; i++) {
        const a = multiDomain[i];
        additionalContent += `**${a.domainLabel} Perspective:**\n\n${a.analogy}\n\n`;
      }
      sections.push({ title: 'Alternative Perspectives', content: additionalContent.trim(), type: 'text' });
    }

    if (_sharedKnowledgeReady) {
      const domainData = sharedKnowledge.getSyncDomainByTopic(topic, query);
      if (domainData?.analogies?.length > 0) {
        let sharedContent = '';
        for (const a of domainData.analogies) {
          sharedContent += `**${a.domain || 'Domain'} Perspective:**\n\n${a.text}\n\n`;
          if (a.limitations) {
            sharedContent += `*Limitations:* ${a.limitations}\n\n`;
          }
        }
        sections.push({ title: 'Shared Knowledge Analogies', content: sharedContent.trim(), type: 'analogy' });
      }
    }

    sections.push({
      title: 'Available Domains',
      content: `Analogies available for: ${analogyEngine.getAvailableDomains().join(', ')}`,
      type: 'text'
    });

    return {
      agentId: 'didactic-architecture',
      agentName: 'Didactic Architecture Agent',
      mode: 'analogy',
      topic,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: null
    };
  }

  function buildMisconceptionResponse(context, mode) {
    const query = context.userQuery || '';
    const topic = extractTopic(context, query);
    const detected = misconceptionLib.detect(topic, query);

    if (_sharedKnowledgeReady) {
      const domainData = sharedKnowledge.getSyncDomainByTopic(topic, query);
      if (domainData?.commonMisconceptions?.length > 0) {
        for (const m of domainData.commonMisconceptions) {
          const alreadyDetected = detected.some(
            (d) => d.wrong === m.wrong || d.title === m.trigger
          );
          if (!alreadyDetected) {
            detected.push({
              title: m.trigger || 'Common Misconception',
              wrong: m.wrong,
              correct: m.correct,
              whyLearnersBelieveIt: 'This is a frequent misunderstanding highlighted in shared domain knowledge.',
              intuition: m.correct,
              verificationPrompt: 'Test your understanding against this misconception explicitly.'
            });
          }
        }
      }
    }

    const sections = [];

    if (detected.length === 0) {
      sections.push({
        title: 'Misconception Check',
        content: `No common misconceptions detected for **${topic}**. However, always verify your understanding by testing it against edge cases and asking "what could go wrong?"`,
        type: 'text'
      });
    } else {
      for (const m of detected) {
        const profile = misconceptionLib.getFormattedProfile(m);
        sections.push({
          title: m.title,
          content: profile,
          type: 'misconceptions'
        });
      }
    }

    sections.push({
      title: 'Self-Verification',
      content: 'Try explaining this concept to someone else. If you can\'t explain it simply, you may not understand it as well as you think. If you can\'t explain where it breaks down, you may have a misconception.',
      type: 'text'
    });

    return {
      agentId: 'didactic-architecture',
      agentName: 'Didactic Architecture Agent',
      mode: 'misconception',
      topic,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: null
    };
  }

  function buildReflectionResponse(context, mode) {
    const query = context.userQuery || '';
    const topic = extractTopic(context, query);

    const prompts = [
      `What would happen if ${topic} didn't exist? What systems would break?`,
      `Why is this assumption necessary? What happens if we remove it?`,
      `How would this concept change under different constraints (limited data, real-time requirements, adversarial conditions)?`,
      `Can you construct a counterexample where this concept fails?`,
      `What is the simplest possible version of this concept that still works?`,
      `What is the most complex real-world application you can imagine?`,
      `How would you explain this to someone with no technical background?`,
      `What questions do you still have after learning this?`
    ];

    const selectedPrompts = prompts.slice(0, 5);

    let content = '**Reflection Prompts:**\n\n';
    selectedPrompts.forEach((p, i) => {
      content += `${i + 1}. ${p}\n\n`;
    });
    content += '*Take your time with these. There are no right or wrong answers \u2014 the goal is to deepen your understanding.*';

    return {
      agentId: 'didactic-architecture',
      agentName: 'Didactic Architecture Agent',
      mode: 'reflection',
      topic,
      sections: [
        { title: 'Reflection Prompts', content, type: 'text' }
      ],
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: null
    };
  }

  function buildTransferResponse(context, mode) {
    const query = context.userQuery || '';
    const topic = extractTopic(context, query);

    const sections = [];

    for (const [domainKey, domain] of Object.entries(KNOWLEDGE_TRANSFER_DOMAINS)) {
      const description = domain.descriptions[0];
      sections.push({
        title: domain.label,
        content: `**${topic}** in ${domain.label}:\n\n${description}\n\nThis connection helps you see how abstract concepts translate into practical applications.`,
        type: 'text'
      });
    }

    return {
      agentId: 'didactic-architecture',
      agentName: 'Didactic Architecture Agent',
      mode: 'transfer',
      topic,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: null
    };
  }

  function buildReadingCompanionResponse(context, mode) {
    const query = context.userQuery || '';
    const topic = extractTopic(context, query);
    const artifactType = context.selectedArtifact?.type || context.artifactType || 'unknown';

    const sections = [
      {
        title: 'Summary',
        content: `This artifact covers **${topic}**. Here are the key points to focus on as you read.`,
        type: 'text'
      },
      {
        title: 'Key Idea',
        content: `The single most important insight is understanding *why* ${topic} matters and *how* it connects to the broader curriculum.`,
        type: 'text'
      },
      {
        title: 'Hidden Assumptions',
        content: 'As you read, pay attention to assumptions that are not explicitly stated:\n\n- What prior knowledge is assumed?\n- What mathematical tools are required?\n- What simplifications are being made?',
        type: 'text'
      },
      {
        title: 'Terminology Check',
        content: `Key terms to define as you encounter them:\n\n- **${topic}**: The core concept being explained\n- Related terms: Look for definitions of technical vocabulary\n- If a term is unclear, pause and look it up before continuing`,
        type: 'text'
      },
      {
        title: 'Conceptual Checkpoints',
        content: 'After reading each section, pause and ask yourself:\n\n1. Can I summarize this in my own words?\n2. Can I give an example?\n3. Can I explain why this matters?',
        type: 'text'
      },
      {
        title: 'Suggested Reflection',
        content: `After reading, consider: How does ${topic} change the way you think about the subject? What questions does it raise?`,
        type: 'text'
      }
    ];

    if (artifactType === 'Interactive Visualization') {
      sections.splice(1, 0, {
        title: 'Interactive Guidance',
        content: 'This is an interactive visualization. Here\'s how to get the most out of it:\n\n1. Start by adjusting one parameter at a time\n2. Observe how the output changes\n3. Try to find the boundary where behavior changes\n4. Ask yourself: "Why does this parameter have this effect?"',
        type: 'text'
      });
    }

    return {
      agentId: 'didactic-architecture',
      agentName: 'Didactic Architecture Agent',
      mode: 'reading-companion',
      topic,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: null
    };
  }

  function buildConnectionResponse(context, mode) {
    const query = context.userQuery || '';
    const topic = extractTopic(context, query);

    let content = '**Curriculum Connections:**\n\n';

    if (context.selectedPath) {
      content += `- **Current Learning Path:** ${context.selectedPath.title || context.selectedPath.id}\n`;
    }
    if (context.selectedModule) {
      content += `- **Current Module:** ${context.selectedModule.title || context.selectedModule.id}\n`;
    }
    if (context.selectedLesson) {
      content += `- **Current Lesson:** ${context.selectedLesson.title || context.selectedLesson.id}\n`;
    }

    content += '\n**Prerequisite Knowledge:**\n';
    content += 'This concept builds on foundational topics covered earlier in the curriculum. ';
    content += 'If any of those feel shaky, consider reviewing them before diving deeper.\n\n';

    content += '**Downstream Concepts:**\n';
    content += 'Understanding this concept well will make subsequent topics significantly easier. ';
    content += 'The connections become more apparent as you progress through the curriculum.\n\n';

    content += '**Cross-Topic Connections:**\n';
    content += 'This concept relates to multiple areas of the curriculum. ';
    content += 'Exploring these connections deepens understanding and reveals the unity of the subject matter.';

    return {
      agentId: 'didactic-architecture',
      agentName: 'Didactic Architecture Agent',
      mode: 'connection',
      topic,
      sections: [{ title: 'Connections', content, type: 'connections' }],
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: null
    };
  }

  function buildSummaryResponse(context, mode) {
    const query = context.userQuery || '';
    const topic = extractTopic(context, query);

    const content = `**${topic}** \u2014 Executive Summary\n\n` +
      `This concept is a key building block in the curriculum. ` +
      `It bridges theoretical understanding and practical application. ` +
      `Understanding it deeply will accelerate your progress through related topics.\n\n` +
      `**Key Takeaways:**\n` +
      `- This concept solves a specific problem in the curriculum\n` +
      `- It connects to prerequisite knowledge and enables future learning\n` +
      `- Understanding the "why" is more important than memorizing the "what"\n` +
      `- Apply it to concrete examples to solidify your understanding`;

    return {
      agentId: 'didactic-architecture',
      agentName: 'Didactic Architecture Agent',
      mode: 'summary',
      topic,
      sections: [{ title: 'Summary', content, type: 'text' }],
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: null
    };
  }

  function buildMisconceptionsSection(topic, context) {
    const detected = misconceptionLib.detect(topic, context.userQuery || '');

    if (_sharedKnowledgeReady) {
      const domainData = sharedKnowledge.getSyncDomainByTopic(topic, context.userQuery || '');
      if (domainData?.commonMisconceptions?.length > 0) {
        for (const m of domainData.commonMisconceptions) {
          const alreadyDetected = detected.some(
            (d) => d.wrong === m.wrong || d.title === m.trigger
          );
          if (!alreadyDetected) {
            detected.push({
              title: m.trigger || 'Common Misconception',
              wrong: m.wrong,
              correct: m.correct,
              whyLearnersBelieveIt: 'This is a frequent misunderstanding highlighted in shared domain knowledge.',
              intuition: m.correct,
              verificationPrompt: 'Test your understanding against this misconception explicitly.'
            });
          }
        }
      }
    }

    if (detected.length === 0) {
      return {
        title: 'Common Misconceptions',
        content: 'No common misconceptions detected for this specific topic. However, always verify your understanding by testing it against edge cases and asking "what could go wrong?"',
        type: 'misconceptions'
      };
    }

    let content = '';
    detected.forEach((m, i) => {
      content += `**Misconception ${i + 1}: ${m.title}**\n`;
      content += `*Wrong:* ${m.wrong}\n`;
      content += `*Correct:* ${m.correct}\n`;
      content += `*Why learners believe this:* ${m.whyLearnersBelieveIt}\n`;
      content += `*Intuition:* ${m.intuition}\n`;
      content += `*Verification:* ${m.verificationPrompt}\n\n`;
    });

    return {
      title: 'Common Misconceptions',
      content: content.trim(),
      type: 'misconceptions'
    };
  }

  function buildConnectionsSection(topic, context) {
    let content = '';

    content += '**Curriculum Connections:**\n\n';

    if (context.selectedPath) {
      content += `- **Current Learning Path:** ${context.selectedPath.title || context.selectedPath.id}\n`;
    }
    if (context.selectedModule) {
      content += `- **Current Module:** ${context.selectedModule.title || context.selectedModule.id}\n`;
    }
    if (context.selectedLesson) {
      content += `- **Current Lesson:** ${context.selectedLesson.title || context.selectedLesson.id}\n`;
    }

    content += '\n**Prerequisite Knowledge:**\n';
    content += 'This concept builds on foundational topics covered earlier in the curriculum. ';
    content += 'If any of those feel shaky, consider reviewing them before diving deeper.\n\n';

    content += '**Downstream Concepts:**\n';
    content += 'Understanding this concept well will make subsequent topics significantly easier. ';
    content += 'The connections become more apparent as you progress through the curriculum.';

    return {
      title: 'Connections',
      content,
      type: 'connections'
    };
  }

  function buildReflectionSection(topic, context) {
    const prompts = [
      `What would happen if ${topic} didn't exist?`,
      'Why is this assumption necessary?',
      'How would this change under different constraints?',
      'Can you construct a counterexample?'
    ];

    let content = '**Reflection Prompts:**\n\n';
    prompts.forEach((p, i) => {
      content += `${i + 1}. ${p}\n`;
    });

    return {
      title: 'Reflection',
      content,
      type: 'text'
    };
  }

  function buildSuggestedNextSection(topic, context) {
    let content = '';

    content += '**Suggested Next Exploration:**\n\n';
    content += 'Based on your current position in the curriculum:\n\n';

    if (context.selectedLesson) {
      content += '- Review the next artifact in this lesson for a different perspective\n';
    }
    if (context.selectedModule) {
      content += '- Explore related lessons within this module\n';
    }
    content += '- Use the Knowledge Graph Atlas to discover visual connections\n';
    content += '- Try the Retrieval Playground to find related research\n';

    content += '\n*These suggestions reference existing curriculum resources. No content has been fabricated.*';

    return {
      title: 'Suggested Next Exploration',
      content,
      type: 'suggested-next'
    };
  }

  function extractTopic(context, query) {
    if (context.selectedArtifact?.title) return context.selectedArtifact.title;
    if (context.selectedLesson?.title) return context.selectedLesson.title;
    if (context.selectedModule?.title) return context.selectedModule.title;
    if (query.length > 5) return query;
    return 'current curriculum topic';
  }

  function getExplanationModes() {
    return [...EXPLANATION_MODES];
  }

  function getModeById(modeId) {
    return EXPLANATION_MODES.find(m => m.id === modeId) || EXPLANATION_MODES[0];
  }

  function getAvailableIntents() {
    return Object.keys(INTENT_PATTERNS);
  }

  return {
    canHandle,
    run,
    getExplanationModes,
    getModeById,
    getAvailableIntents,
    getPlanner: function () { return pedagogicalPlanner; },
    getCompositionGraph: function () { return compositionGraph; },
    getInstructionalLayers: function () { return instructionalLayers; },
    getDifficultyLadder: function () { return difficultyLadder; },
    getMultiPerspectiveEngine: function () { return multiPerspectiveEngine; },
    getSemanticResolver: function () { return semanticResolver; },
    getExampleEngine: function () { return exampleEngine; },
    getExampleRegistry: function () { return exampleReg; },
    getCrossDomainConnector: function () { return crossDomainConnector; },
    getRecapInserter: function () { return recapInserter; },
    getResourceSelector: function () { return resourceSelector; },
    getVisualizationOrchestrator: function () { return visualizationOrchestrator; },
    getLaboratoryPlacer: function () { return laboratoryPlacer; },
    getMediaOrchestrator: function () { return mediaOrchestrator; },
    getTransitionEngine: function () { return transitionEngine; },
    getDensityOptimizer: function () { return densityOptimizer; },
    getMediaPlan: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? plan.mediaPlan : null;
    },
    getVisualizationPlan: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? plan.visualizations : [];
    },
    getLaboratoryPlan: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? plan.laboratories : [];
    },
    getTransitionMap: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? plan.transitionMap : [];
    },
    getLastPlan: function () { return pedagogicalPlanner.getLastPlan(); },
    getEvidence: function () { return evidenceTracer; },
    getMemoryContext: function () { return memoryReviewBridge.getMemoryContext(); },
    getReviewContext: function () { return memoryReviewBridge.getReviewContext(); },
    getSemanticContext: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? plan.semanticContext : null;
    },
    getAgentContributions: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? plan.agentContributions : null;
    },
    getGeneratedBlocks: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? (plan.generatedBlocks || []) : [];
    },
    getEvidenceTree: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? plan.evidenceTree : null;
    },
    getEvidenceBlocks: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? (plan.evidenceBlocks || []) : [];
    },
    getGenerativeAugmenter: function () { return generativeAugmenter; },
    getAgentCollaborationOrchestrator: function () { return agentCollaborationOrchestrator; },
    getSemanticLearningBridge: function () { return semanticLearningBridge; },
    getMemoryReviewBridge: function () { return memoryReviewBridge; },
    getLessonOutline: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? plan.lessonOutline : null;
    },
    getLoadMetrics: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? plan.loadMetrics : null;
    },
    getPacingPlan: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? plan.pacingPlan : null;
    },
    getComposition: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? plan.composition : null;
    },
    getAccessibilityReport: function () {
      var plan = pedagogicalPlanner.getLastPlan();
      return plan ? plan.accessibilityAnnotations : null;
    },
    getCognitiveLoadOptimizer: function () { return cognitiveLoadOptimizer; },
    getInstructionalPacingEngine: function () { return instructionalPacingEngine; },
    getLessonComposer: function () { return lessonComposer; },
    getReadabilityOptimizer: function () { return readabilityOptimizer; },
    getAccessibilityPolish: function () { return accessibilityPolish; },
    EXPLANATION_MODES,
    INTENT_PATTERNS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.didacticArchitectureAgent = createDidacticArchitectureAgent();
}

export { createDidacticArchitectureAgent, EXPLANATION_MODES };
