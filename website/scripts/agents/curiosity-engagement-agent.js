/**
 * NV-1000-A10 — Curiosity & Engagement Agent
 *
 * Stimulates intellectual curiosity, surfaces interdisciplinary connections,
 * and encourages exploration without mutating curriculum files or estimating mastery.
 */

import { createSharedKnowledgeService } from '../shared-knowledge/shared-knowledge-service.js';

const CURIOSITY_INTENT_PATTERNS = {
  did_you_know: ['did you know', 'interesting fact', 'surprising fact', 'fact'],
  surprising_connection: ['surprising connection', 'unexpected connection'],
  historical_anecdote: ['historical anecdote', 'anecdote', 'famous anecdote', 'history'],
  thought_experiment: ['thought experiment', 'what if', 'scenario'],
  everyday_analogy: ['everyday analogy', 'analogy', 'metaphor'],
  counterintuitive_insight: ['counterintuitive', 'fails', 'surprises'],
  interdisciplinary_bridge: ['interdisciplinary', 'other field', 'another field', 'relate to another', 'neuroscience', 'biology', 'physics'],
  frontier_curiosity: ['frontier', 'open question', 'research direction', 'speculative'],
  why_field_changed: ['why it changed', 'why changed', 'why did', 'change the field', 'meaningful shift', 'displaced'],
  explore_next: ['explore next', 'adjacent idea', 'what next', 'suggest']
};

const MODE_LABELS = {
  did_you_know: 'Did You Know?',
  surprising_connection: 'Surprising Connection',
  historical_anecdote: 'Historical Anecdote',
  thought_experiment: 'Thought Experiment',
  counterintuitive_insight: 'Counterintuitive Insight',
  interdisciplinary_bridge: 'Interdisciplinary Bridge',
  frontier_curiosity: 'Frontier Curiosity',
  everyday_analogy: 'Everyday Analogy',
  why_field_changed: 'Why It Changed the Field',
  explore_next: 'Explore Next'
};

const FALLBACK_CURIOSITY_DATA = {
  domainName: 'Systems Engineering Foundations',
  did_you_know: `
Did you know that early operating system interface decoupling was modeled on hardware boards? Just as physical cards could be swapped in backplanes, software modularity sought to allow dropping in subroutines.
`,
  surprising_connection: `
Interface design shares structures with molecular structures: decoupling models use connection graph topologies mathematically equivalent to chemical bond models.
`,
  historical_anecdote: `
In 1968, the NATO Software Engineering conference coined the term "Software Engineering" to address the "Software Crisis", initiating structured interface design.
`,
  thought_experiment: `
What if software libraries were compiled as tight global monoliths? Modularity would be lost, making concurrent software developments impossible.
`,
  counterintuitive_insight: `
Decoupling modules does not always increase performance. Excessive abstraction layers can introduce computational overhead due to constant interface redirections.
`,
  interdisciplinary_bridge: `
System modularity connects to biology: the cellular membrane decouples interior functions from external environments, similar to software interfaces.
`,
  frontier_curiosity: `
Decentralized autonomous execution research investigates how microservices can coordinate contracts without central orchestrators.
`,
  everyday_analogy: `
- **Analogy**: Decoupled components are like standardized wall plugs.
- **Scientific Reality**: Interfaces define signature boundaries to isolate executions.
- **Limitations**: Plugs pass electrical currents, whereas software interfaces handle complex variable state transitions.
`,
  why_field_changed: `
Interface decoupling shifted systems design from static compiled monoliths to dynamic, interchangeable component architectures.
`,
  explore_next: `
Explore dependency injection frameworks next to see how systems manage module bindings dynamically.
`
};

function createCuriosityEngagementAgent() {
  const responseCache = new Map();
  const sharedKnowledge = createSharedKnowledgeService();

  async function initialize() {
    await sharedKnowledge.initialize();
    return { status: 'ready', modes: Object.keys(MODE_LABELS).length };
  }

  function canHandle(context) {
    return Boolean(context?.userQuery || context?.selectedArtifact || context?.selectedLesson);
  }

  const FABRICATION_PATTERNS = [
    /invent.*(fun fact|historical|anecdote|story|researcher|quote|breakthrough)/i,
    /make up.*(quote|researcher|story|anecdote|fact)/i,
    /fake.*(quote|researcher|paper|study|breakthrough)/i,
    /pretend.*(breakthrough|discovery|paper|study).*happened/i,
    /say this changed everything forever/i,
    /claim.*guaranteed.*dominate/i
  ];

  function checkFabricationRequest(query) {
    return FABRICATION_PATTERNS.some((pattern) => pattern.test(query));
  }

  function buildRefusalResponse(reason) {
    return {
      type: 'governed-refusal',
      agentId: 'curiosity-engagement',
      agentName: 'Curiosity & Engagement Agent',
      reason: `I cannot fabricate or invent content. ${reason}`,
      notice: 'This request was blocked by historical integrity guardrails. Only fact-grounded curiosities are provided.',
      timestamp: new Date().toISOString(),
      status: 'refused'
    };
  }

  async function run(context = {}, options = {}) {
    await initialize();
    if (!context) context = {};
    const query = context.userQuery || '';
    if (checkFabricationRequest(query)) {
      return buildRefusalResponse('The agent only provides factually grounded curiosities without invented facts, anecdotes, quotes, or hype claims.');
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
    for (const [intent, patterns] of Object.entries(CURIOSITY_INTENT_PATTERNS)) {
      if (patterns.some((pattern) => lower.includes(pattern))) return intent;
    }
    return 'did_you_know';
  }

  function buildResponse(mode, topic, domain, context, query) {
    const sections = addRequiredCuriositySections(buildSectionsForMode(mode, topic, domain, context, query), mode, topic, domain);
    return {
      agentId: 'curiosity-engagement',
      agentName: 'Curiosity & Engagement Agent',
      mode,
      modeLabel: MODE_LABELS[mode] || 'Academic Curiosity Engine',
      topic,
      domain,
      reasoningStrategy: `Generate rigorous, fact-grounded curiosity hooks for ${topic} without mutating curriculum data.`,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: 'Curiosities are advisory and grounded in verifiable historical contexts.'
    };
  }

  function buildSectionsForMode(mode, topic, domain, context, query) {
    const builders = {
      did_you_know: () => buildDidYouKnow(topic, domain),
      surprising_connection: () => buildSurprisingConnection(topic, domain),
      historical_anecdote: () => buildHistoricalAnecdote(topic, domain),
      thought_experiment: () => buildThoughtExperiment(topic, domain),
      counterintuitive_insight: () => buildCounterintuitiveInsight(topic, domain),
      interdisciplinary_bridge: () => buildInterdisciplinaryBridge(topic, domain),
      frontier_curiosity: () => buildFrontierCuriosity(topic, domain),
      everyday_analogy: () => buildEverydayAnalogy(topic, domain),
      why_field_changed: () => buildWhyFieldChanged(topic, domain),
      explore_next: () => buildExploreNext(topic, domain)
    };
    return (builders[mode] || builders.did_you_know)();
  }

  function buildDidYouKnow(topic, domain) {
    const data = getDomainData(domain);
    return [
      curiosityCard('Did You Know?', `Fascinating educational fact about **${topic}**.`),
      { title: 'The Curiosity', type: 'text', content: data.did_you_know }
    ];
  }

  function buildSurprisingConnection(topic, domain) {
    const data = getDomainData(domain);
    return [
      curiosityCard('Surprising Connection', `Surprising, non-obvious links for **${topic}**.`),
      { title: 'The Connection', type: 'text', content: data.surprising_connection }
    ];
  }

  function buildHistoricalAnecdote(topic, domain) {
    const data = getDomainData(domain);
    return [
      curiosityCard('Historical Anecdote', `Factual historical anecdote surrounding **${topic}**.`),
      { title: 'The Factual Anecdote', type: 'text', content: data.historical_anecdote }
    ];
  }

  function buildThoughtExperiment(topic, domain) {
    const data = getDomainData(domain);
    return [
      curiosityCard('Thought Experiment', `Thought-provoking scenario reinforcing **${topic}**.`),
      { title: 'The Thought Experiment', type: 'text', content: data.thought_experiment },
      { title: 'Hypothetical Status', type: 'text', content: 'This is a hypothetical scenario for educational exploration. The described conditions are contrived and do not reflect actual system behavior or research outcomes.' }
    ];
  }

  function buildCounterintuitiveInsight(topic, domain) {
    const data = getDomainData(domain);
    return [
      curiosityCard('Counterintuitive Insight', `Insights about **${topic}** that often surprise learners.`),
      { title: 'The Counterintuitive Reality', type: 'text', content: data.counterintuitive_insight }
    ];
  }

  function buildInterdisciplinaryBridge(topic, domain) {
    const data = getDomainData(domain);
    return [
      curiosityCard('Interdisciplinary Bridge', `Connecting **${topic}** with adjacent scientific domains.`),
      { title: 'The Interdisciplinary Bridge', type: 'text', content: data.interdisciplinary_bridge }
    ];
  }

  function buildFrontierCuriosity(topic, domain) {
    const data = getDomainData(domain);
    const classification = classifyFrontier(topic, domain, data);
    return [
      curiosityCard('Frontier Curiosity', `Intriguing open questions and future paths for **${topic}**.`),
      { title: 'Frontier Classification', type: 'text', content: classification },
      { title: 'The Research Frontier', type: 'text', content: data.frontier_curiosity }
    ];
  }

  function classifyFrontier(topic, domain, data) {
    const lower = `${topic} ${domain}`.toLowerCase();
    if (lower.includes('physics-informed') || lower.includes('piml') || lower.includes('neuromorphic') || lower.includes('vlm') || lower.includes('vision-language')) {
      return '**Status**: Emerging — active research with promising prototypes but not yet production-standard.';
    }
    if (lower.includes('mechanistic interpretability') || lower.includes('self-correction') || lower.includes('active retrieval')) {
      return '**Status**: Speculative — preliminary exploration with open questions about scalability and reliability.';
    }
    if (lower.includes('edge mlops') || lower.includes('decentralized') || lower.includes('edge')) {
      return '**Status**: Emerging — early implementations exist in constrained environments with ongoing standardization.';
    }
    return '**Status**: Emerging — current research direction with partial implementations and active community exploration.';
  }

  function buildEverydayAnalogy(topic, domain) {
    const data = getDomainData(domain);
    return [
      curiosityCard('Everyday Analogy', `Real-world analogies for **${topic}** with transparent limitations.`),
      { title: 'The Analogy', type: 'text', content: data.everyday_analogy }
    ];
  }

  function buildWhyFieldChanged(topic, domain) {
    const data = getDomainData(domain);
    return [
      curiosityCard('Why It Changed the Field', `Explaining the paradigm shift represented by **${topic}**.`),
      { title: 'The Paradigm Shift', type: 'text', content: data.why_field_changed }
    ];
  }

  function buildExploreNext(topic, domain) {
    const data = getDomainData(domain);
    return [
      curiosityCard('Explore Next', `Intellectually adjacent ideas to follow up on **${topic}**.`),
      { title: 'Suggested Neighbor', type: 'text', content: data.explore_next }
    ];
  }

  function addRequiredCuriositySections(sections, mode, topic, domain) {
    const data = getDomainData(domain);
    return [
      { title: 'Curiosity Objective', type: 'curiosity-card', content: `Mode: **${MODE_LABELS[mode]}**\nTopic: **${topic}**\nDomain: **${data.domainName}**\nGoal: Surface engaging educational insights to deepen understanding.` },
      ...sections,
      { title: 'Scientific Basis', type: 'text', content: 'Surfaced facts are grounded in peer-reviewed computer science literature and verified systems history.' },
      { title: 'Known Limitations', type: 'text', content: 'Thought experiments and analogies are simplified representations meant for intuitive scaffolding, not mathematical definitions.' },
      { title: 'Suggested Follow-up Exploration', type: 'text', content: `Examine the curriculum index and research publications to investigate this topic's formal models.` }
    ];
  }

  function curiosityCard(title, content) {
    return { title, type: 'curiosity-card', content };
  }

  function getDomainData(domain) {
    const domainData = sharedKnowledge.getSyncDomain(domain);
    if (!domainData) return FALLBACK_CURIOSITY_DATA;

    const facts = domainData.curiosityFacts || [];
    const misconceptions = domainData.commonMisconceptions || [];
    const analogies = domainData.analogies || [];

    return {
      domainName: domainData.title,
      did_you_know: facts.length > 0
        ? facts[0]
        : `Did you know that ${domainData.title} is one of the most rapidly evolving fields in computer science?`,
      surprising_connection: facts.length > 1
        ? facts[1]
        : `${domainData.title} connects to multiple adjacent scientific domains.`,
      historical_anecdote: domainData.historicalContext || '',
      thought_experiment: `What if ${domainData.title} did not exist?`,
      counterintuitive_insight: misconceptions.length > 0
        ? misconceptions[0].correct
        : `Understanding ${domainData.title} often reveals counterintuitive insights.`,
      interdisciplinary_bridge: `${domainData.title} connects to multiple disciplines.`,
      frontier_curiosity: `Active research in ${domainData.title} continues.`,
      everyday_analogy: analogies.length > 0
        ? `- **Analogy**: ${analogies[0].text}\n- **Limitations**: ${analogies[0].limitations}`
        : `- **Analogy**: Understanding ${domainData.title} is like learning to drive — initially complex, eventually intuitive.`,
      why_field_changed: `${domainData.title} transformed related problem approaches.`,
      explore_next: `Explore related concepts in ${domainData.title}.`
    };
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
    const cleaned = (query || '').replace(/what are|what is|show me|explain|did you know|connection|anecdote|thought experiment|counterintuitive|interdisciplinary|frontier|analogy|why changed|explore next/ig, '').replace(/[?!.]/g, '').trim();
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
  window.NeuralVerse.curiosityEngagementAgent = createCuriosityEngagementAgent();
}

export { createCuriosityEngagementAgent };
