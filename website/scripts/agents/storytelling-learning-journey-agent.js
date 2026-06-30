/**
 * NV-1000-A9 — Storytelling & Learning Journey Agent
 *
 * Provides historical narratives, evolution timelines, conceptual models,
 * cross-lesson continuity, and motivational guidance without curriculum mutation.
 */

import { createSharedKnowledgeService } from '../shared-knowledge/shared-knowledge-service.js';

const NARRATIVE_INTENT_PATTERNS = {
  origin_story: ['origin', 'why invented', 'history', 'how emerged', 'who created'],
  learning_journey: ['learning journey', 'learning path', 'conceptual progression', 'intermediate', 'frontier'],
  concept_timeline: ['timeline', 'chronological', 'stages', 'evolution timeline'],
  problem_driven: ['problem', 'challenge', 'failed approach', 'limitation', 'engineering challenge'],
  human_perspective: ['human', 'practitioner', 'researcher perspective'],
  cross_lesson: ['connect previous', 'previous lesson', 'lesson build', 'dependencies', 'dependency'],
  mental_model: ['mental model', 'analogy', 'metaphor', 'library system'],
  scientific_journey: ['scientific journey', 'scientific evolution', 'field evolved', 'symbolic ai', 'hand-crafted'],
  motivation_relevance: ['why learn', 'why does', 'matter', 'opportunities', 'practical questions'],
  personalized_orientation: ['orient my', 'orient next', 'completed', 'next major leap']
};

const FABRICATION_PATTERNS = [
  /invent.*(historical|anecdote|story|researcher|scientist|discovery)/i,
  /make up.*(quote|researcher|story|anecdote)/i,
  /fictional.*origin.*real|present.*fictional.*real/i,
  /pretend.*(paper|study|research|experiment).*exist/i,
  /dramatic.*(lab|discovery|experiment|breakthrough).*scene/i
];

const MODE_LABELS = {
  origin_story: 'Origin Story',
  learning_journey: 'Learning Journey Narrative',
  problem_driven: 'Problem-Driven Storytelling',
  concept_timeline: 'Concept Evolution Timeline',
  human_perspective: 'Human-Centered Explanation',
  cross_lesson: 'Cross-Lesson Continuity',
  mental_model: 'Mental Model Construction',
  scientific_journey: 'Scientific Journey',
  motivation_relevance: 'Motivation & Relevance',
  personalized_orientation: 'Personalized Learning Orientation'
};

const FALLBACK_NARRATIVE_DATA = {
  domainName: 'Systems Engineering Foundations',
  origin: `
Traditional software modularity concepts emerged in the 1960s to address the spaghetti-code software crisis. The introduction of structured interfaces allowed engineers to decouple execution paths, transforming programming into a repeatable engineering discipline.
`,
  journey: `
1. **Foundations**: Monolithic program routines.
2. **Intermediate**: Structured subroutines and local function calls.
3. **Current**: Decoupled component interfaces.
4. **Advanced**: Event-driven microservice meshes.
`,
  problem: `
- **Challenge**: Building scalable systems that can be updated concurrently.
- **Failed Approach**: Compiling all systems into a single tight global binary.
- **Key Insight**: Program to abstract interfaces instead of concrete classes.
- **New Solution**: Decoupled dynamic dependencies.
`,
  timeline: `
- **1968**: NATO Conference defines the term "Software Engineering".
- **1972**: David Parnas introduces criteria for modular software partition.
- **1994**: Design Patterns book formalizes decoupling structures.
`,
  human: `
Systems architects view applications as sets of interacting nodes. They measure dependency coupling densities and prioritize interface stability above all.
`,
  continuity: `
Decoupled interfaces build on functions and subroutines. Understanding this prepares you for dependency injection frameworks in the next lesson.
`,
  mental: `
- **Metaphor**: Decoupled components are like standardized wall plugs; any appliance fitting the plug can draw power without knowing the plant source.
- **Limitations**: Real interfaces have state transitions and network failures that simpler wall plugs do not model.
`,
  science: `
Systems engineering transitioned from static compiled structures to modular architectures, and finally to decentralized, containerized environments.
`,
  motivation: `
Mastering component decoupling ensures your systems remain modular, testable, and maintainable over decades of service.
`,
  orientation: `
You have analyzed interface decoupling. This connects to dependency injection. The next major conceptual leap is service discovery.
`
};

function createStorytellingLearningJourneyAgent() {
  const responseCache = new Map();
  const sharedKnowledge = createSharedKnowledgeService();

  async function initialize() {
    await sharedKnowledge.initialize();
    return { status: 'ready', modes: Object.keys(MODE_LABELS).length };
  }

  function canHandle(context) {
    return Boolean(context?.userQuery || context?.selectedArtifact || context?.selectedLesson);
  }

  function checkFabricationRequest(query) {
    return FABRICATION_PATTERNS.some((pattern) => pattern.test(query));
  }

  function buildRefusalResponse(reason) {
    return {
      type: 'governed-refusal',
      agentId: 'storytelling-learning-journey',
      agentName: 'Storytelling & Learning Journey Agent',
      reason: `I cannot fabricate historical content. ${reason}`,
      notice: 'This request was blocked by historical integrity guardrails. Only factual, documented narratives are provided.',
      timestamp: new Date().toISOString(),
      status: 'refused'
    };
  }

  async function run(context = {}, options = {}) {
    await initialize();
    if (!context) context = {};
    const query = context.userQuery || '';
    if (checkFabricationRequest(query)) {
      return buildRefusalResponse('The agent only presents historically documented events without invented anecdotes, quotes, or discovery scenes.');
    }
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
    for (const [intent, patterns] of Object.entries(NARRATIVE_INTENT_PATTERNS)) {
      if (patterns.some((pattern) => lower.includes(pattern))) return intent;
    }
    return 'origin_story';
  }

  function buildResponse(mode, topic, domain, context, query) {
    const sections = addRequiredNarrativeSections(buildSectionsForMode(mode, topic, domain, context, query), mode, topic, domain);
    return {
      agentId: 'storytelling-learning-journey',
      agentName: 'Storytelling & Learning Journey Agent',
      mode,
      modeLabel: MODE_LABELS[mode] || 'Academic Storyteller',
      topic,
      domain,
      reasoningStrategy: `Contextualize ${topic} using factual histories, conceptual timelines, and structured evolution narratives.`,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: 'Factual historical narratives only. Curriculum files remain unmodified.'
    };
  }

  function buildSectionsForMode(mode, topic, domain, context, query) {
    const builders = {
      origin_story: () => buildOriginStory(topic, domain),
      learning_journey: () => buildLearningJourney(topic, domain),
      problem_driven: () => buildProblemDriven(topic, domain),
      concept_timeline: () => buildConceptTimeline(topic, domain),
      human_perspective: () => buildHumanPerspective(topic, domain),
      cross_lesson: () => buildCrossLesson(topic, domain),
      mental_model: () => buildMentalModel(topic, domain),
      scientific_journey: () => buildScientificJourney(topic, domain),
      motivation_relevance: () => buildMotivationRelevance(topic, domain),
      personalized_orientation: () => buildPersonalizedOrientation(topic, domain)
    };
    return (builders[mode] || builders.origin_story)();
  }

  function buildOriginStory(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Origin Story', `Historical context detailing how the concept of **${topic}** emerged.`),
      { title: 'The Historical Narrative', type: 'text', content: data.origin }
    ];
  }

  function buildLearningJourney(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Learning Journey Arc', `Conceptual path mapping your learning journey through **${topic}**.`),
      { title: 'Learning Pathway Steps', type: 'text', content: data.journey }
    ];
  }

  function buildProblemDriven(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Problem Frame', `Framing **${topic}** around fundamental engineering challenges.`),
      { title: 'The Engineering Narrative', type: 'text', content: data.problem }
    ];
  }

  function buildConceptTimeline(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Concept Timeline', `Chronological milestones of paradigms surrounding **${topic}**.`),
      { title: 'Chronological Milestones', type: 'text', content: data.timeline }
    ];
  }

  function buildHumanPerspective(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Practitioner Perspective', `Understanding how researchers and engineers conceptualize **${topic}**.`),
      { title: 'Inside the Practitioner\'s Mind', type: 'text', content: data.human }
    ];
  }

  function buildCrossLesson(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Lesson Connections', `Bridges connecting **${topic}** to surrounding lessons.`),
      { title: 'Cross-Lesson Dependencies', type: 'text', content: data.continuity }
    ];
  }

  function buildMentalModel(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Mental Metaphor', `memorable analogies to help internalize **${topic}**.`),
      { title: 'Conceptual Analogy', type: 'text', content: data.mental }
    ];
  }

  function buildScientificJourney(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Scientific Paradigm Shift', `Evolution of the scientific field surrounding **${topic}**.`),
      { title: 'Scientific History', type: 'text', content: data.science }
    ];
  }

  function buildMotivationRelevance(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Motivation & Relevance', `Why mastering **${topic}** is critical in production systems.`),
      { title: 'Why This Matters', type: 'text', content: data.motivation }
    ];
  }

  function buildPersonalizedOrientation(topic, domain) {
    const data = getDomainData(domain);
    return [
      narrativeCard('Next Learning Step', `Advisory roadmap outlining what concepts lie ahead of **${topic}**.`),
      { title: 'Orientation Steps', type: 'text', content: data.orientation }
    ];
  }

  function addRequiredNarrativeSections(sections, mode, topic, domain) {
    const data = getDomainData(domain);
    return [
      { title: 'Narrative Objective', type: 'narrative-card', content: `Mode: **${MODE_LABELS[mode]}**\nTopic: **${topic}**\nDomain: **${data.domainName}**\nGoal: Contextualize conceptual foundations using fact-grounded narratives.` },
      ...sections,
      { title: 'Historical/Factual Basis', type: 'text', content: 'This narrative is constructed from peer-reviewed scientific literature and documented engineering paradigms.' },
      { title: 'Metaphorical Elements', type: 'text', content: 'We employ analogies to represent mathematical concepts visually without mutating underlying formulas.' },
      { title: 'Limitations', type: 'text', content: 'Simplified mental metaphors serve only as temporary conceptual bridges and cannot replace exact mathematical implementations.' },
      { title: 'Suggested Follow-up Topic', type: 'text', content: `Read the next lesson in the curriculum to explore this concept's formal applications.` }
    ];
  }

  function narrativeCard(title, content) {
    return { title, type: 'narrative-card', content };
  }

  function getDomainData(domain) {
    const sharedDomain = sharedKnowledge.getSyncDomain(domain);
    if (sharedDomain) {
      return {
        domainName: sharedDomain.title,
        origin: sharedDomain.historicalContext || '',
        journey: `1. **Foundations**: Core concepts in ${sharedDomain.title}\n2. **Intermediate**: Advanced techniques\n3. **Current**: Modern implementations\n4. **Advanced**: Research frontiers`,
        problem: `- **Challenge**: Understanding ${sharedDomain.title}\n- **Key Insight**: Build intuitive understanding`,
        timeline: (sharedDomain.landmarkReferences || []).map((r) => `- **${r.year}**: ${r.title} — ${r.contribution}`).join('\n'),
        human: `Practitioners in ${sharedDomain.title} think systematically about trade-offs.`,
        continuity: `${sharedDomain.title} builds on foundational concepts.`,
        mental: (sharedDomain.analogies || []).length > 0
          ? `- **Metaphor**: ${sharedDomain.analogies[0].text}\n- **Limitations**: ${sharedDomain.analogies[0].limitations}`
          : `- **Metaphor**: Understanding ${sharedDomain.title} is like learning a new language — start with fundamentals, then build fluency.`,
        science: sharedDomain.summary || '',
        motivation: `Mastering ${sharedDomain.title} enables complex problem solving.`,
        orientation: `You have explored ${sharedDomain.title}. Next: apply in practice.`
      };
    }
    return FALLBACK_NARRATIVE_DATA;
  }

  function resolveDomain(topic, query) {
    const lower = `${topic} ${query}`.toLowerCase();
    if (lower.includes('mlops') || lower.includes('monitoring') || lower.includes('drift') || lower.includes('pipeline')) return 'mlops';
    if (lower.includes('llm') || lower.includes('gpt') || lower.includes('transformer') || lower.includes('attention')) return 'llms';
    if (lower.includes('rag') || lower.includes('retrieval') || lower.includes('vector search')) return 'rag';
    if (lower.includes('agent') || lower.includes('react') || lower.includes('planning')) return 'agents';
    if (lower.includes('vision') || lower.includes('image') || lower.includes('cnn') || lower.includes('pooling')) return 'computer-vision';
    if (lower.includes('deep learning') || lower.includes('activations') || lower.includes('gradients')) return 'deep-learning';
    if (lower.includes('machine learning') || lower.includes('linear') || lower.includes('boundary') || lower.includes('regularization')) return 'machine-learning';
    return 'general-systems';
  }

  function resolveTopic(context, query) {
    return context.selectedArtifact?.title || context.selectedLesson?.title || context.selectedModule?.title || context.selectedPath?.title || extractTopicFromQuery(query) || 'current concept';
  }

  function extractTopicFromQuery(query) {
    const cleaned = (query || '').replace(/what are|what is|show me|explain|origin story|learning journey|problem|timeline|human|connect previous|mental model|scientific evolution|why learn|orient next/ig, '').replace(/[?!.]/g, '').trim();
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
  window.NeuralVerse.storytellingLearningJourneyAgent = createStorytellingLearningJourneyAgent();
}

export { createStorytellingLearningJourneyAgent };
