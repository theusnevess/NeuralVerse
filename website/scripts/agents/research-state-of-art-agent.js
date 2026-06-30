/**
 * NV-1000-A5 — Research & State-of-the-Art Agent
 *
 * Offline, deterministic research mentor for connecting curriculum concepts to
 * historical context, landmark directions, benchmarks, trends, open problems,
 * frontier topics, and confidence-labeled research guidance.
 *
 * Uses the shared knowledge repository (NV-1100-P3) for domain data.
 * Falls back to local defaults if shared data is unavailable.
 */

import { createSharedKnowledgeService } from '../shared-knowledge/shared-knowledge-service.js';

const RESEARCH_INTENT_PATTERNS = {
  historical_context: ['history', 'historical', 'evolved', 'timeline', 'origin', 'milestone'],
  landmark_papers: ['landmark', 'paper', 'papers', 'foundational', 'seminal', 'classic'],
  benchmark_landscape: ['benchmark', 'imagenet', 'coco', 'glue', 'mmlu', 'humaneval', 'ragas'],
  research_trends: ['trend', 'trends', 'active research', 'emerging', 'declining'],
  open_problems: ['open problem', 'unsolved', 'challenge', 'limitations remain', 'research challenge'],
  method_comparison: ['compare', ' vs ', 'versus', 'competing', 'directions'],
  reading_roadmap: ['read after', 'reading roadmap', 'what should i read', 'study order', 'reading list'],
  frontier_topics: ['frontier', 'future', 'reasoning models', 'world models', 'scientific discovery', 'multimodal'],
  evidence_confidence: ['confidence', 'evidence', 'how mature', 'established', 'speculative'],
  curriculum_bridge: ['connect to research', 'broader research', 'research theme', 'industrial relevance', 'future study']
};

const MODE_LABELS = {
  historical_context: 'Historical Context',
  landmark_papers: 'Landmark Papers',
  benchmark_landscape: 'Benchmark Landscape',
  research_trends: 'Research Trends',
  open_problems: 'Open Problems',
  method_comparison: 'Method Comparison',
  reading_roadmap: 'Reading Roadmap',
  frontier_topics: 'Frontier Topics',
  evidence_confidence: 'Evidence Confidence',
  curriculum_bridge: 'Curriculum Bridge'
};

const CONFIDENCE_LEVELS = ['Established', 'Emerging', 'Experimental', 'Speculative'];

const FALLBACK_RESEARCH_DATA = {
  confidence: 'Emerging',
  landmarks: [['Curated foundational direction unavailable offline', 'Unknown', 'N/A', 'The agent avoids fabricating papers when offline mappings are incomplete.']],
  benchmarks: ['domain-specific benchmark varies'],
  trends: ['evaluation reliability', 'efficiency', 'robustness']
};

function createResearchStateOfArtAgent() {
  const responseCache = new Map();
  const sharedKnowledge = (typeof window !== 'undefined' && window.NeuralVerse?.sharedKnowledgeService)
    ? window.NeuralVerse.sharedKnowledgeService
    : createSharedKnowledgeService();

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
    const confidence = chooseConfidence(mode, domain, query);
    const cacheKey = JSON.stringify({ mode, topic, domain, confidence, query: normalizeQuery(query) });

    if (responseCache.has(cacheKey)) return cloneWithTimestamp(responseCache.get(cacheKey));

    const result = buildResponse(mode, topic, domain, confidence, context, query);
    responseCache.set(cacheKey, result);
    return cloneWithTimestamp(result);
  }

  function detectIntent(query) {
    const lower = ` ${(query || '').toLowerCase()} `;
    for (const [intent, patterns] of Object.entries(RESEARCH_INTENT_PATTERNS)) {
      if (patterns.some((pattern) => lower.includes(pattern))) return intent;
    }
    return 'curriculum_bridge';
  }

  function buildResponse(mode, topic, domain, confidence, context, query) {
    const sections = addRequiredResearchSections(buildSectionsForMode(mode, topic, domain, confidence, context, query), mode, topic, confidence);
    return {
      agentId: 'research-state-of-art',
      agentName: 'Research & State-of-the-Art Agent',
      mode,
      modeLabel: MODE_LABELS[mode] || 'Research Mentor',
      topic,
      domain,
      confidenceLevel: confidence,
      reasoningStrategy: `Separate established knowledge, active research, uncertainty, and educational next steps for ${topic}.`,
      sections,
      timestamp: new Date().toISOString(),
      status: 'operational',
      disclaimer: 'Offline educational research guidance only. No live search, fabricated citations, benchmark scores, or curriculum mutations.'
    };
  }

  function buildSectionsForMode(mode, topic, domain, confidence, context, query) {
    const builders = {
      historical_context: () => buildHistoricalContext(topic, domain),
      landmark_papers: () => buildLandmarkPapers(topic, domain),
      benchmark_landscape: () => buildBenchmarkLandscape(topic, domain),
      research_trends: () => buildResearchTrends(topic, domain),
      open_problems: () => buildOpenProblems(topic, domain),
      method_comparison: () => buildMethodComparison(topic, query),
      reading_roadmap: () => buildReadingRoadmap(topic, domain),
      frontier_topics: () => buildFrontierTopics(topic),
      evidence_confidence: () => buildEvidenceConfidence(topic, confidence),
      curriculum_bridge: () => buildCurriculumBridge(topic, domain, context)
    };
    return (builders[mode] || builders.curriculum_bridge)();
  }

  function buildHistoricalContext(topic, domain) {
    return [
      researchCard('Historical Evolution', `Frame **${topic}** as a sequence of research shifts: early formulation, scaling phase, modern integration, and current limitations.`),
      { title: 'Chronological Structure', type: 'timeline', content: `1. Early foundations established the problem vocabulary\n2. Neural or statistical methods made the idea practical\n3. Scaling and benchmark pressure exposed trade-offs\n4. Current research focuses on reliability, efficiency, and evaluation` },
      uncertaintySection(domain)
    ];
  }

  function buildLandmarkPapers(topic, domain) {
    const data = getDomainData(domain);
    return [
      researchCard('Landmark Scope', `Relevant curated directions for **${topic}**. This is educational, not exhaustive.`),
      { title: 'Foundational Directions', type: 'research-table', content: `| Paper | Authors | Year | Contribution |\n|---|---|---|---|\n${data.landmarks.map((p) => `| ${p[0]} | ${p[1]} | ${p[2]} | ${p[3]} |`).join('\n')}` },
      { title: 'Citation Boundary', type: 'text', content: 'Only curated entries are named. The agent avoids fabricating citations; if a needed paper is not in the offline map, it states incompleteness rather than inventing a citation.' }
    ];
  }

  function buildBenchmarkLandscape(topic, domain) {
    const data = getDomainData(domain);
    return [
      researchCard('Benchmark Purpose', `Benchmarks help compare methods around **${topic}**, but they do not fully define real-world capability.`),
      { title: 'Relevant Benchmarks', type: 'research-table', content: `| Benchmark | What It Measures | Strength | Limitation |\n|---|---|---|---|\n${data.benchmarks.map((b) => `| ${b} | Domain-relevant task behavior | Shared comparison protocol | Does not prove general deployment reliability |`).join('\n')}` },
      { title: 'Interpretation Rule', type: 'text', content: 'No benchmark scores are reported. Treat benchmark names as orientation points, not hidden rankings.' }
    ];
  }

  function buildResearchTrends(topic, domain) {
    const data = getDomainData(domain);
    return [
      researchCard('Research Trend Map', `Trends around **${topic}** should be read as directional signals, not settled conclusions.`),
      { title: 'Established vs Emerging', type: 'research-table', content: `| Category | Examples | Confidence |\n|---|---|---|\n| Established | Core formulation and known limitations | Established |\n| Emerging | ${data.trends.join(', ')} | Emerging |\n| Uncertain | Evaluation transfer and robustness claims | Experimental |` },
      uncertaintySection(domain)
    ];
  }

  function buildOpenProblems(topic) {
    return [
      researchCard('Open Problem Framing', `Open problems for **${topic}** should be described as unresolved challenges, not failures of the curriculum.`),
      { title: 'Unresolved Challenges', type: 'research-table', content: '| Challenge | Why It Matters | Current Limitation | Possible Direction |\n|---|---|---|---|\n| Robust evaluation | Prevents misleading conclusions | Benchmarks can be narrow | Broader task suites and qualitative audits |\n| Efficiency | Enables deployment at scale | Better methods can be costly | Distillation, indexing, compression, sparse computation |\n| Reliability | Supports trust and debugging | Edge cases remain hard | Better attribution and uncertainty reporting |' }
    ];
  }

  function buildMethodComparison(topic, query) {
    const pair = extractComparisonPair(query) || ['Method A', 'Method B'];
    return [
      researchCard('Comparison Scope', `Compare research directions for **${topic}** without declaring a universal winner.`),
      { title: 'Method Family Comparison', type: 'research-table', content: `| Dimension | ${pair[0]} | ${pair[1]} |\n|---|---|---|\n| Assumption | Works best under one modeling bias | Works best under another modeling bias |\n| Strength | Clear advantage in some contexts | Clear advantage in other contexts |\n| Limitation | Can fail outside assumptions | Can fail outside assumptions |\n| Research Status | Context-dependent | Context-dependent |` }
    ];
  }

  function buildReadingRoadmap(topic, domain) {
    const data = getDomainData(domain);
    return [
      researchCard('Reading Roadmap', `Study **${topic}** from stable foundations toward active research.`),
      { title: 'Recommended Order', type: 'timeline', content: `1. Textbook or lecture notes for definitions\n2. Survey or tutorial to map terminology\n3. Foundational paper direction: ${data.landmarks[0]?.[0] || 'curated foundational direction unavailable'}\n4. Benchmark overview: ${data.benchmarks[0] || 'domain benchmark varies'}\n5. Recent directions only after the core lesson is stable` },
      { title: 'Reading Boundary', type: 'text', content: 'This is a learning roadmap, not an exhaustive bibliography.' }
    ];
  }

  function buildFrontierTopics(topic) {
    return [
      researchCard('Frontier Overview', `Frontier research connected to **${topic}** may change quickly and should be treated cautiously.`),
      { title: 'Frontier Areas', type: 'research-table', content: '| Area | Why It Connects | Confidence |\n|---|---|---|\n| Reasoning models | Tests structured inference beyond pattern matching | Emerging |\n| World models | Connects representation learning with prediction and planning | Experimental |\n| Scalable agents | Applies planning, memory, and tool use in dynamic settings | Experimental |\n| Multimodal reasoning | Combines text, vision, audio, or structured signals | Emerging |' },
      { title: 'Speculation Boundary', type: 'text', content: 'Future impact is uncertain. Treat frontier topics as reading directions, not guaranteed outcomes.' }
    ];
  }

  function buildEvidenceConfidence(topic, confidence) {
    return [
      researchCard('Confidence Label', `**${topic}** is currently labeled **${confidence}** for this response.`),
      { title: 'Confidence Taxonomy', type: 'research-table', content: '| Label | Meaning | Use |\n|---|---|---|\n| Established | Stable and broadly accepted | Teach as foundation |\n| Emerging | Active but increasingly common | Teach with caveats |\n| Experimental | Promising but unsettled | Treat as research direction |\n| Speculative | Early or uncertain | Clearly separate from fact |' }
    ];
  }

  function buildCurriculumBridge(topic, domain, context) {
    return [
      researchCard('Curriculum-to-Research Bridge', `Connect **${topic}** to broader research without changing the NV-800 sequence.`),
      { title: 'Bridge Map', type: 'text', content: `- Current artifact/lesson: ${context.selectedArtifact?.title || context.selectedLesson?.title || 'current curriculum item'}\n- Research theme: ${domain}\n- Adjacent disciplines: evaluation, systems design, human-centered reliability\n- Industrial relevance: depends on robustness, cost, maintainability, and monitoring\n- Future study: read foundations before frontier claims` },
      uncertaintySection(domain)
    ];
  }

  function addRequiredResearchSections(sections, mode, topic, confidence) {
    return [
      { title: 'Research Scope', type: 'research-card', confidence, content: `Mode: **${MODE_LABELS[mode]}**\nTopic: **${topic}**\nScope: offline educational synthesis grounded in curated mappings and conservative templates.` },
      { title: 'Confidence Level', type: 'confidence-card', confidence, content: confidence },
      ...sections,
      { title: 'Educational Purpose', type: 'text', content: 'Help learners place canonical curriculum knowledge in the broader scientific landscape without replacing academic search.' },
      { title: 'Known Limitations', type: 'text', content: '- No live search or background crawling\n- No invented papers, venues, scores, or author claims\n- Curated mappings are intentionally incomplete\n- Active research may evolve' },
      { title: 'Suggested Follow-up Reading', type: 'text', content: 'Start with a survey or lecture note, then one foundational paper direction, then benchmark documentation, then recent work if the foundations are clear.' }
    ];
  }

  function researchCard(title, content) {
    return { title, type: 'research-card', content };
  }

  function uncertaintySection(domain) {
    return { title: 'Uncertainty Boundary', type: 'text', content: `Domain **${domain}** includes both established knowledge and active research. Claims about future directions should be treated as provisional.` };
  }

  function getDomainData(domain) {
    const cached = sharedKnowledge.getSyncDomain(domain);
    if (cached) {
      const researchData = {
        confidence: cached.canonicalStatus === 'Reviewed' ? 'Established' : 'Emerging',
        landmarks: (cached.landmarkReferences || []).map((ref) => [ref.title, ref.authors, ref.year, ref.contribution]),
        benchmarks: (cached.keywords || []).slice(0, 3),
        trends: (cached.concepts || []).slice(0, 3)
      };
      return researchData;
    }
    return FALLBACK_RESEARCH_DATA;
  }

  function chooseConfidence(mode, domain, query) {
    const lower = (query || '').toLowerCase();
    if (mode === 'frontier_topics') return 'Experimental';
    if (lower.includes('future') || lower.includes('speculative')) return 'Speculative';
    if (mode === 'research_trends' || mode === 'open_problems') return 'Emerging';
    return getDomainData(domain).confidence || 'Emerging';
  }

  function resolveDomain(topic, query) {
    const lower = `${topic} ${query}`.toLowerCase();
    if (lower.includes('attention') || lower.includes('transformer')) return 'transformers';
    if (lower.includes('retrieval') || lower.includes('rag') || lower.includes('ranking')) return 'rag';
    if (lower.includes('vision') || lower.includes('cnn') || lower.includes('image') || lower.includes('segmentation')) return 'computer-vision';
    if (lower.includes('agent') || lower.includes('tool use') || lower.includes('planning')) return 'agents';
    return 'machine-learning';
  }

  function extractComparisonPair(query) {
    const match = (query || '').match(/(.+?)\s+(?:vs|versus)\s+(.+)/i);
    if (!match) return null;
    return [titleCase(match[1].replace(/compare|directions|research/ig, '').trim()), titleCase(match[2].trim())];
  }

  function resolveTopic(context, query) {
    return context.selectedArtifact?.title || context.selectedLesson?.title || context.selectedModule?.title || context.selectedPath?.title || extractTopicFromQuery(query) || 'current concept';
  }

  function extractTopicFromQuery(query) {
    const cleaned = (query || '').replace(/what are|what is|show me|explain|landmark papers|benchmarks|research trends|open problems|connect to research|historical context/ig, '').replace(/[?!.]/g, '').trim();
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

  function getConfidenceLevels() {
    return [...CONFIDENCE_LEVELS];
  }

  function getCacheStats() {
    return { entries: responseCache.size };
  }

  return { initialize, canHandle, run, detectIntent, getAvailableModes, getConfidenceLevels, getCacheStats };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.researchStateOfArtAgent = createResearchStateOfArtAgent();
}

export { createResearchStateOfArtAgent };
