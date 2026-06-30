/**
 * NV-1000-A7 — Assessment & Reinforcement Agent
 *
 * Formative learning coach helping reinforce understanding, encourage retrieval practice,
 * promote reflection, and generate educational exercises without grading or evaluation.
 */

import { createSharedKnowledgeService } from '../shared-knowledge/shared-knowledge-service.js';

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

const FALLBACK_ASSESSMENT_DATA = {
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

function createAssessmentReinforcementAgent() {
  const responseCache = new Map();
  const sharedKnowledge = createSharedKnowledgeService();

  async function initialize() {
    await sharedKnowledge.initialize();
    return { status: 'ready', modes: Object.keys(MODE_LABELS).length };
  }

  function canHandle(context) {
    return Boolean(context?.userQuery || context?.selectedArtifact || context?.selectedLesson);
  }

  async function run(context = {}, options = {}) {
    await initialize();
    if (!context) context = {};
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
    const domainData = sharedKnowledge.getSyncDomain(domain);
    if (!domainData) return FALLBACK_ASSESSMENT_DATA;

    const misconceptions = domainData.commonMisconceptions || [];
    return {
      domainName: domainData.title,
      questions: domainData.assessmentSeeds || [],
      flashcards: (domainData.concepts || []).slice(0, 4).map((c) => ({
        front: c,
        back: `Core concept in ${domainData.title}`,
        hint: 'Review the curriculum for details'
      })),
      retrieval: `Recall the key structural aspects of ${domainData.title} from memory.`,
      selfAssessment: `How would you explain the trade-offs of ${domainData.title} concepts to a peer?`,
      challenge: `Critique a production system that uses ${domainData.title} concepts without monitoring.`,
      plan: (domainData.relatedConcepts || []).map((c) => `Review ${c} connections`),
      misconceptions: misconceptions.length > 0 ? misconceptions[0].wrong : '',
      journal: `Write down one concept from ${domainData.title} that clicked today and one that still feels hazy.`,
      connections: `Connect ${domainData.title} concepts to other curriculum modules.`,
      sessionObjectives: `Strengthen fundamental intuition behind ${domainData.title}.`
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
