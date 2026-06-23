/**
 * NV-1000-A7 — Assessment & Reinforcement Agent
 *
 * Formative learning coach helping reinforce understanding, encourage retrieval practice,
 * promote reflection, and generate educational exercises without grading or evaluation.
 */

const ASSESSMENT_INTENT_PATTERNS = {
  practice_questions: ['practice question', 'exercises', 'questions', 'test my understanding', 'problems'],
  flashcards: ['flashcard', 'flashcards', 'card', 'cards', 'vocabulary', 'term'],
  retrieval_practice: ['retrieval practice', 'retrieval', 'recall', 'without looking', 'self-test'],
  self_assessment: ['self-assessment', 'self assessment', 'guided self', 'reflect on understanding', 'own words'],
  mini_challenges: ['mini challenge', 'mini-challenge', 'challenge', 'critique', 'puzzle', 'debug challenge'],
  reinforcement_plan: ['reinforcement plan', 'spaced review', 'review plan', 'review schedule', 'study schedule'],
  misconception_check: ['misconception check', 'misunderstanding', 'common mistakes', 'concept check'],
  reflection_journal: ['reflection journal', 'journal', 'document learning', 'surprising insights', 'diary'],
  concept_connections: ['concept connection', 'connect lessons', 'synthesis', 'relationship'],
  review_session: ['review session', 'build review', 'structured review', 'study session']
};

const MODE_LABELS = {
  practice_questions: 'Practice Questions',
  flashcards: 'Flashcard Builder',
  retrieval_practice: 'Retrieval Practice',
  self_assessment: 'Guided Self-Assessment',
  mini_challenges: 'Mini Challenge',
  reinforcement_plan: 'Reinforcement Plan',
  misconception_check: 'Misconception Check',
  reflection_journal: 'Reflection Journal',
  concept_connections: 'Concept Connection',
  review_session: 'Review Session Builder'
};

const CURATED_ASSESSMENT_MAP = {
  'machine-learning': {
    domainName: 'Machine Learning',
    questions: [
      'Explain how decision tree boundaries differ from logistic regression boundaries in your own words.',
      'Why is regularizing feature weights beneficial when dealing with highly correlated inputs?'
    ],
    flashcards: [
      { front: 'Overfitting', back: 'A model learning noise in training data instead of general patterns.', hint: 'Think high variance.' },
      { front: 'L1 Regularization', back: 'Adds absolute value of weights penalty to simplify models.', hint: 'Sparsity inducer.' }
    ],
    retrieval: 'Sketch the difference between high-bias and high-variance error curves over training epochs from memory.',
    selfAssessment: 'How would you explain the trade-offs of linear models to a non-technical peer?',
    challenge: 'A model has 99% accuracy but performs poorly on new test classes. Critique this validation setup.',
    plan: ['Revisit ML Fundamentals Module', 'Practice regularization simulations', 'Review bias-variance tradeoff lesson'],
    misconceptions: 'Believing that higher training performance always translates to better real-world deployment outcomes.',
    journal: 'Write down one concept from linear models that clicked today and one that still feels hazy.',
    connections: 'How do learning rate adjustments in gradient descent connect to regularization constraints?',
    sessionObjectives: 'Strengthen fundamental intuition behind model parameters and generalization limits.'
  },
  'deep-learning': {
    domainName: 'Deep Learning',
    questions: [
      'Explain the purpose of the key, query, and value vectors in self-attention mechanisms.',
      'Why does initializing weights to zero prevent deep networks from learning distinct features?'
    ],
    flashcards: [
      { front: 'Gradient Vanishing', back: 'Gradients shrinking close to zero, blocking weight adjustments in early layers.', hint: 'Common with sigmoid activations.' },
      { front: 'Backpropagation', back: 'Algorithm computing gradient of loss function with respect to weights using chain rule.', hint: 'Backward pass.' }
    ],
    retrieval: 'Recall the mathematical formula for Softmax normalization and describe how it shapes class logits.',
    selfAssessment: 'Explain why non-linear activation functions are necessary for deep networks to learn complex functions.',
    challenge: 'Design a neural network topology that processes temporal sequences without using recursive loops.',
    plan: ['Review Deep Learning Basics', 'Analyze feedforward network backward pass', 'Revisit activation functions'],
    misconceptions: 'Assuming that adding more hidden layers always improves the model without risks of vanishing gradients.',
    journal: 'How has your mental model of backpropagation changed since you started studying neural networks?',
    connections: 'Connect activation saturation in deep networks to the vanishing gradient problem in recurrent networks.',
    sessionObjectives: 'Deconstruct activation mechanisms, gradient flows, and optimization backbones.'
  },
  'computer-vision': {
    domainName: 'Computer Vision',
    applications: ['Visual feature extractors', 'Object detectors', 'Image segmentation blocks'],
    questions: [
      'Compare standard convolutions with depthwise separable convolutions in terms of calculation overhead.',
      'Why do pooling layers assist in establishing spatial invariance within CNN feature maps?'
    ],
    flashcards: [
      { front: 'Convolution', back: 'Mathematical operation applying a kernel filter across input channels to extract features.', hint: 'Feature extractor.' },
      { front: 'Receptive Field', back: 'Specific region of input space that influences a particular feature node.', hint: 'Visual footprint.' }
    ],
    retrieval: 'Write down the steps a typical CNN performs to transform raw pixel grids into class likelihood distributions.',
    selfAssessment: 'Explain the role of data augmentation in training robust image classifier models.',
    challenge: 'A classification network behaves erratically under variations in image brightness. Devise a visual test suite.',
    plan: ['Revisit CNN Foundations', 'Review convolutional layer operations', 'Analyze spatial pooling mechanisms'],
    misconceptions: 'Believing that filters in deep CNN layers focus on raw pixel intensities rather than abstract edges and textures.',
    journal: 'Summarize the primary intuition behind local connectivity in visual models.',
    connections: 'Connect visual feature representations in CNN backbones to the token retrieval processes in visual transformers.',
    sessionObjectives: 'Deepen understanding of feature extractors, spatial hierarchies, and filter activations.'
  },
  'llms': {
    domainName: 'Large Language Models',
    questions: [
      'Contrast temperature scaling with top-k filtering during text generation decoding.',
      'What are the advantages of tokenization strategies like Byte-Pair Encoding compared to word-level models?'
    ],
    flashcards: [
      { front: 'Attention Matrix', back: 'Represents pairwise token relationship strengths in transformer blocks.', hint: 'Calculated using query-key dot products.' },
      { front: 'Context Window', back: 'The maximum sequence length a transformer network can process in a single invocation.', hint: 'Memory capacity boundary.' }
    ],
    retrieval: 'Detail the sequence of steps that occur from input text to vocabulary token output generation.',
    selfAssessment: 'How would you explain the trade-offs of autoregressive generation compared to encoder-only tasks?',
    challenge: 'A model starts repeating phrases in a loop. Diagnose the prompt parameters and generation settings.',
    plan: ['Review Transformer Architecture', 'Analyze attention mechanism inputs', 'Revisit generation decoding schemes'],
    misconceptions: 'Expecting models to perform complex multi-step logical reasoning tasks reliably in a single forward pass without step-by-step guidance.',
    journal: 'Document your insights regarding how prompt layout affects in-context learning.',
    connections: 'How do attention weight distributions connect to human cognitive retrieval dynamics?',
    sessionObjectives: 'Master transformer decoding, attention weights, and tokenization characteristics.'
  },
  'rag': {
    domainName: 'Retrieval-Augmented Generation',
    questions: [
      'Under what system demands would you recommend dense vector search over traditional keyword index searches?',
      'Why is chunk segmentation strategy crucial to the reliability of prompt injections in RAG pipelines?'
    ],
    flashcards: [
      { front: 'Vector Embedding', back: 'High-dimensional numerical projection representing the semantic meaning of text chunks.', hint: 'Dense retrieval block.' },
      { front: 'Reranking', back: 'Re-ordering retrieved search documents using a precise cross-encoder prior to LLM input.', hint: 'Accuracy booster.' }
    ],
    retrieval: 'Trace the path of a query through a complete RAG system without looking at any diagrams.',
    selfAssessment: 'Explain how chunk size choices impact retrieval performance and model cost trade-offs.',
    challenge: 'A RAG pipeline retrieves relevant snippets, but the LLM answer leaves out critical numbers. Diagnose the prompt template.',
    plan: ['Review RAG Pipelines Module', 'Review embedding techniques', 'Examine search indexing parameters'],
    misconceptions: 'Believing that adding more background documents to the prompt context always yields more accurate model answers.',
    journal: 'What surprised you most about the difference between keyword matching and semantic vector lookup?',
    connections: 'Connect dense vector cosine distances with attention alignment scores in visual layers.',
    sessionObjectives: 'Understand vector space transformations, reranking layers, and context extraction limits.'
  },
  'agents': {
    domainName: 'AI Agents',
    questions: [
      'Contrast the planning behavior of a ReAct agent loop with linear directed acyclic graph (DAG) routing.',
      'What security risks arise when giving LLM agents direct tool access without sandboxing?'
    ],
    flashcards: [
      { front: 'ReAct Pattern', back: 'A framework combining reasoning and action loops to guide step-by-step agent execution.', hint: 'Thought, Action, Observation cycle.' },
      { front: 'Tool Calling', back: 'Agent output formatting specifying function names and arguments for execution.', hint: 'Interface bridge.' }
    ],
    retrieval: 'Explain how an agent knows when to stop executing tools and return a final response to the user.',
    selfAssessment: 'Describe the role of feedback loops in improving the reliability of autonomous multi-step agents.',
    challenge: 'An agent tool-use execution loop becomes stuck executing the same failed API call repeatedly. Critique the loop safety bounds.',
    plan: ['Review Agent Workflows', 'Study planning graphs', 'Analyze tool calling interfaces'],
    misconceptions: 'Assuming that agents are inherently reliable decision makers for multi-step goals without continuous feedback safeguards.',
    journal: 'What are the main security concerns you have about deploying agents in internal enterprise directories?',
    connections: 'How do planning loops in agents build upon conversational memory chains in large language models?',
    sessionObjectives: 'Deconstruct reasoning graphs, tool invocation hooks, and execution safety policies.'
  },
  'mlops': {
    domainName: 'MLOps',
    questions: [
      'Explain how prediction drift differ from concept drift in deployed model monitoring.',
      'What are the trade-offs of using automated canary rollouts compared to instant blue-green deployments?'
    ],
    flashcards: [
      { front: 'Data Drift', back: 'Changes in the distribution of input data over time compared to the training set baseline.', hint: 'PSI monitored.' },
      { front: 'Model Registry', back: 'Central repository storing trained model artifacts, signatures, and version states.', hint: 'Version controller.' }
    ],
    retrieval: 'Describe the stages of model deployment from registry verification to shadow traffic validation.',
    selfAssessment: 'Explain why training-serving skew occurs and how you would prevent it.',
    challenge: 'A deployed model shows an increase in prediction latency but normal resource utilization. What variables would you examine first?',
    plan: ['Review MLOps Lifecycles', 'Analyze pipeline monitoring metrics', 'Examine container scaling rules'],
    misconceptions: 'Assuming that deploying a model to a target cluster completes the project lifecycle without ongoing maintenance constraints.',
    journal: 'Draft a short checklist of monitoring thresholds you would configure for an enterprise classifier service.',
    connections: 'Connect features store dependencies with model signature validations in model registries.',
    sessionObjectives: 'Master deployment lifecycles, monitoring thresholds, and pipeline auditability.'
  }
};

function createAssessmentReinforcementAgent() {
  const responseCache = new Map();

  function initialize() {
    return Promise.resolve({ status: 'ready', modes: Object.keys(MODE_LABELS).length });
  }

  function canHandle(context) {
    return Boolean(context?.userQuery || context?.selectedArtifact || context?.selectedLesson);
  }

  async function run(context = {}, options = {}) {
    await initialize();
    const query = context.userQuery || '';
    const mode = options.mode || detectIntent(query);
    const topic = resolveTopic(context, query);
    const domain = resolveDomain(topic, query);
    const cacheKey = JSON.stringify({ mode, topic, domain, query: normalizeQuery(query) });

    if (responseCache.has(cacheKey)) return cloneWithTimestamp(responseCache.get(cacheKey));

    const result = buildResponse(mode, topic, domain, context, query);
    responseCache.set(cacheKey, result);
    return cloneWithTimestamp(result);
  }

  function detectIntent(query) {
    const lower = ` ${(query || '').toLowerCase()} `;
    for (const [intent, patterns] of Object.entries(ASSESSMENT_INTENT_PATTERNS)) {
      if (patterns.some((pattern) => lower.includes(pattern))) return intent;
    }
    return 'practice_questions';
  }

  function buildResponse(mode, topic, domain, context, query) {
    const sections = addRequiredAssessmentSections(buildSectionsForMode(mode, topic, domain, context, query), mode, topic, domain);
    return {
      agentId: 'assessment-reinforcement',
      agentName: 'Assessment & Reinforcement Agent',
      mode,
      modeLabel: MODE_LABELS[mode] || 'Learning Support Coach',
      topic,
      domain,
      reasoningStrategy: `Facilitate retrieval practice, conceptual connections, and diagnostic reviews for ${topic} without evaluation.`,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: 'Formative learning assistance only. No grades, scoring, competency evaluations, or curriculum alterations.'
    };
  }

  function buildSectionsForMode(mode, topic, domain, context, query) {
    const builders = {
      practice_questions: () => buildPracticeQuestions(topic, domain),
      flashcards: () => buildFlashcards(topic, domain),
      retrieval_practice: () => buildRetrievalPractice(topic, domain),
      self_assessment: () => buildSelfAssessment(topic, domain),
      mini_challenges: () => buildMiniChallenges(topic, domain),
      reinforcement_plan: () => buildReinforcementPlan(topic, domain),
      misconception_check: () => buildMisconceptionCheck(topic, domain),
      reflection_journal: () => buildReflectionJournal(topic, domain),
      concept_connections: () => buildConceptConnections(topic, domain),
      review_session: () => buildReviewSession(topic, domain)
    };
    return (builders[mode] || builders.practice_questions)();
  }

  function buildPracticeQuestions(topic, domain) {
    const data = getDomainData(domain);
    return [
      reinforcementCard('Practice Questions', `Reinforce conceptual understanding of **${topic}** with targeted questions.`),
      { title: 'Questions for Deepening Understanding', type: 'text', content: data.questions.map((q, idx) => `${idx + 1}. **${q}**`).join('\n') },
      { title: 'Practice Strategy', type: 'text', content: 'Draft your answers in a local notepad. Focus on explaining the mechanical causes of design choices.' }
    ];
  }

  function buildFlashcards(topic, domain) {
    const data = getDomainData(domain);
    return [
      reinforcementCard('Flashcard Builder', `Interactive conceptual flashcards for **${topic}**.`),
      {
        title: 'Review Flashcards',
        type: 'text',
        content: data.flashcards.map((fc) => `
**Front**: ${fc.front}
**Back**: ${fc.back}
*Hint*: ${fc.hint}
---
`).join('\n')
      }
    ];
  }

  function buildRetrievalPractice(topic, domain) {
    const data = getDomainData(domain);
    return [
      reinforcementCard('Retrieval Practice Prompt', `Recall key structural aspects of **${topic}** from memory to build mental paths.`),
      { title: 'Recall Prompt', type: 'text', content: `**Prompt**: ${data.retrieval}` },
      { title: 'Review Advice', type: 'text', content: 'Write down your recall steps. Then, review the lesson to verify details. This reinforces memory routes.' }
    ];
  }

  function buildSelfAssessment(topic, domain) {
    const data = getDomainData(domain);
    return [
      reinforcementCard('Guided Self-Assessment', `Metacognitive checks to evaluate your own understanding of **${topic}**.`),
      { title: 'Assessment Prompt', type: 'text', content: `**Prompt**: ${data.selfAssessment}` },
      { title: 'Reflection Prompt', type: 'text', content: 'Explain this to yourself or writing it down. Finding vocabulary gaps helps you pinpoint what details to study next.' }
    ];
  }

  function buildMiniChallenges(topic, domain) {
    const data = getDomainData(domain);
    return [
      reinforcementCard('Mini Challenge', `Apply your knowledge of **${topic}** to architectural scenarios.`),
      { title: 'Challenge Prompt', type: 'text', content: `**Prompt**: ${data.challenge}` },
      { title: 'How to Approach', type: 'text', content: 'Sketch out a design or write a structural critique. Think about structural faults and boundary conditions.' }
    ];
  }

  function buildReinforcementPlan(topic, domain) {
    const data = getDomainData(domain);
    return [
      reinforcementCard('Spaced Review Schedule', `Advisory planning for reinforcing **${topic}**.`),
      { title: 'Recommended Review Actions', type: 'text', content: data.plan.map((step) => `- **${step}**`).join('\n') },
      { title: 'Note on Spaced Review', type: 'text', content: 'This recommendation is advisory and local. Plan your review according to your learning style.' }
    ];
  }

  function buildMisconceptionCheck(topic, domain) {
    const data = getDomainData(domain);
    return [
      reinforcementCard('Misconception Spotting', `Identify structural misunderstandings regarding **${topic}**.`),
      { title: 'Common Misconception', type: 'text', content: `**Misconception**: ${data.misconceptions}` },
      { title: 'Conceptual Resolution', type: 'text', content: 'Understand that real systems involve noisy variables and boundary parameters that challenge theoretical assumptions.' }
    ];
  }

  function buildReflectionJournal(topic, domain) {
    const data = getDomainData(domain);
    return [
      reinforcementCard('Reflection Journal Prompt', `Document your insights and unresolved questions for **${topic}**.`),
      { title: 'Reflection Prompt', type: 'text', content: `**Prompt**: ${data.journal}` },
      { title: 'Why Document?', type: 'text', content: 'Writing helps solidify abstract ideas into structured knowledge.' }
    ];
  }

  function buildConceptConnections(topic, domain) {
    const data = getDomainData(domain);
    return [
      reinforcementCard('Concept Connection Exercise', `Connect **${topic}** to other curriculum modules.`),
      { title: 'Connection Activity', type: 'text', content: `**Prompt**: ${data.connections}` },
      { title: 'Synthesis Guideline', type: 'text', content: 'Find similarities in routing patterns or optimization pathways to form holistic system maps.' }
    ];
  }

  function buildReviewSession(topic, domain) {
    const data = getDomainData(domain);
    return [
      reinforcementCard('Review Session Structure', `Structured local review session for **${topic}**.`),
      { title: 'Session Objective', type: 'text', content: data.sessionObjectives },
      { title: 'Target Concepts to Check', type: 'text', content: `- **Key Terms**: ${data.flashcards.map(f => f.front).join(', ')}\n- **Key Activity**: ${data.retrieval}` },
      { title: 'Study Resource Guide', type: 'text', content: 'Revisit neighboring lessons or visual artifacts for clarification.' }
    ];
  }

  function addRequiredAssessmentSections(sections, mode, topic, domain) {
    const data = getDomainData(domain);
    return [
      { title: 'Educational Objective', type: 'reinforcement-card', content: `Mode: **${MODE_LABELS[mode]}**\nTopic: **${topic}**\nDomain Context: **${data.domainName}**\nFormative learning reinforcement designed to encourage active recall.` },
      ...sections,
      { title: 'Why This Exercise Exists', type: 'text', content: 'Promoting active retrieval and critical reflection helps build robust cognitive models and long-term memory routes.' },
      { title: 'Suggested Thinking Strategy', type: 'text', content: 'Deconstruct the problem into input/output stages. Focus on why parameters are chosen rather than rote formulas.' },
      { title: 'Related Concepts', type: 'text', content: `- **Cognitive Maps**: Connecting structural models\n- **Active Retrieval**: Recalling without passive reading guides` },
      { title: 'Optional Extension', type: 'text', content: 'Discuss this challenge prompt with peers or write a mock architectural review detailing failure modes.' }
    ];
  }

  function reinforcementCard(title, content) {
    return { title, type: 'reinforcement-card', content };
  }

  function getDomainData(domain) {
    return CURATED_ASSESSMENT_MAP[domain] || {
      domainName: 'Systems Engineering Principles',
      questions: [
        'Explain the role of decoupled microservice interfaces in systems engineering.',
        'Why does shared-state concurrency introduce potential race conditions in database transactions?'
      ],
      flashcards: [
        { front: 'Decoupling', back: 'Splitting components so they change and scale independently.', hint: 'Independent scalability.' },
        { front: 'Concurrency', back: 'Executing multiple processes in overlapping time intervals.', hint: 'Parallel paths.' }
      ],
      retrieval: 'Detail the core stages of database replication from read replica scaling to failover logic.',
      selfAssessment: 'How would you explain the trade-offs of microservices compared to monolithic designs in your own words?',
      challenge: 'A database scaling project leads to data conflicts. Critique the replication policy.',
      plan: ['Review database scaling patterns', 'Analyze replication latencies', 'Revisit decoupled service lessons'],
      misconceptions: 'Believing that microservices are always superior to monolithic architectures for small-scale applications.',
      journal: 'Write down one system boundary condition that clicked today and one that feels fuzzy.',
      connections: 'Connect database concurrency controls to thread isolation rules in multi-core execution environments.',
      sessionObjectives: 'Deepen understanding of distributed systems coordination, scaling boundaries, and caching patterns.'
    };
  }

  function resolveDomain(topic, query) {
    const lower = `${topic} ${query}`.toLowerCase();
    if (lower.includes('mlops') || lower.includes('monitoring') || lower.includes('observability')) return 'mlops';
    if (lower.includes('llm') || lower.includes('gpt') || lower.includes('copilot') || lower.includes('prompt')) return 'llms';
    if (lower.includes('rag') || lower.includes('retrieval') || lower.includes('indexing')) return 'rag';
    if (lower.includes('agent') || lower.includes('planning') || lower.includes('tool use')) return 'agents';
    if (lower.includes('vision') || lower.includes('image') || lower.includes('yolo') || lower.includes('segmentation')) return 'computer-vision';
    if (lower.includes('deep learning') || lower.includes('pytorch') || lower.includes('tensor') || lower.includes('gpu')) return 'deep-learning';
    if (lower.includes('machine learning') || lower.includes('feature') || lower.includes('predictive') || lower.includes('classification')) return 'machine-learning';
    return 'general-systems';
  }

  function resolveTopic(context, query) {
    return context.selectedArtifact?.title || context.selectedLesson?.title || context.selectedModule?.title || context.selectedPath?.title || extractTopicFromQuery(query) || 'current concept';
  }

  function extractTopicFromQuery(query) {
    const cleaned = (query || '').replace(/what are|what is|show me|explain|practice questions|exercises|flashcards|retrieval practice|self-assessment|challenge|reinforcement plan|misconception check|reflection journal|connect concepts|review session/ig, '').replace(/[?!.]/g, '').trim();
    return cleaned ? titleCase(cleaned) : null;
  }

  function normalizeQuery(query) {
    return (query || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function titleCase(value) {
    return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  function cloneWithTimestamp(result) {
    return { ...JSON.parse(JSON.stringify(result)), timestamp: new Date().toISOString() };
  }

  function getAvailableModes() {
    return Object.keys(MODE_LABELS);
  }

  function getCacheStats() {
    return { entries: responseCache.size };
  }

  return { initialize, canHandle, run, detectIntent, getAvailableModes, getCacheStats };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.assessmentReinforcementAgent = createAssessmentReinforcementAgent();
}

export { createAssessmentReinforcementAgent };
