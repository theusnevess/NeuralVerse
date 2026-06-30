/**
 * NV-1100-P3 — Shared Knowledge Service
 *
 * Canonical query interface for the shared knowledge repository.
 * Provides deterministic, immutable access to consolidated domain knowledge.
 * Agents query this service instead of maintaining isolated CURATED_*_MAP structures.
 *
 * Philosophy:
 * - Immutable at runtime after initialization
 * - Local-first, offline-capable
 * - Deterministic (no randomness, no hidden mutations)
 * - Single source of truth for domain educational content
 */

const SHARED_KNOWLEDGE_INDEX_PATH = '/data/shared-knowledge/index.json';
const SHARED_KNOWLEDGE_BASE_PATH = '/data/shared-knowledge/';

let _indexCache = null;
let _domainCache = new Map();
let _indexPromise = null;

function _getLRU() {
  var LRU = window.NeuralVerse?.BoundedLRUCache;
  if (LRU && !_lruCache) _lruCache = LRU(128);
  return _lruCache;
}
var _lruCache = null;

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

async function loadIndex() {
  if (_indexCache) return _indexCache;
  if (_indexPromise) return _indexPromise;

  _indexPromise = fetchJson(SHARED_KNOWLEDGE_INDEX_PATH)
    .then((index) => {
      _indexCache = Object.freeze(index);
      return _indexCache;
    })
    .catch((err) => {
      console.error('Failed to load shared knowledge index:', err);
      _indexPromise = null;
      return null;
    });

  return _indexPromise;
}

async function loadDomain(domainId) {
  if (_domainCache.has(domainId)) {
    var perf = window.NeuralVerse?.PerfInstrumentation;
    if (perf) perf.recordCacheHit();
    return _domainCache.get(domainId);
  }

  var lru = _getLRU();
  if (lru && lru.has('domain:' + domainId)) {
    var cached = lru.get('domain:' + domainId);
    _domainCache.set(domainId, cached);
    var perf2 = window.NeuralVerse?.PerfInstrumentation;
    if (perf2) perf2.recordCacheHit();
    return cached;
  }

  var perf3 = window.NeuralVerse?.PerfInstrumentation;
  if (perf3) perf3.recordCacheMiss();

  const index = await loadIndex();
  if (!index) return null;

  const domainEntry = index.domains.find((d) => d.id === domainId);
  if (!domainEntry) return null;

  var loadStart = performance.now();
  const domainData = await fetchJson(`${SHARED_KNOWLEDGE_BASE_PATH}${domainEntry.file}`).catch((err) => {
    console.error(`Failed to load domain ${domainId}:`, err);
    return null;
  });
  if (perf3) perf3.recordLazyLoad(loadStart);

  if (domainData) {
    Object.freeze(domainData);
    _domainCache.set(domainId, domainData);
    if (lru) lru.put('domain:' + domainId, domainData);
  }

  return domainData;
}

async function loadAllDomains() {
  const index = await loadIndex();
  if (!index) return [];

  const results = await Promise.all(
    index.domains.map((d) => loadDomain(d.id))
  );

  return results.filter(Boolean);
}

function resolveDomain(topic, query) {
  const lower = `${topic} ${query}`.toLowerCase();
  if (lower.includes('mlops') || lower.includes('monitoring') || lower.includes('observability') || lower.includes('drift') || lower.includes('pipeline')) return 'mlops';
  if (lower.includes('llm') || lower.includes('gpt') || lower.includes('copilot') || lower.includes('prompt') || lower.includes('decoder')) return 'llms';
  if (lower.includes('rag') || lower.includes('retrieval') || lower.includes('indexing') || lower.includes('vector search')) return 'rag';
  if (lower.includes('agent') || lower.includes('react') || lower.includes('planning') || lower.includes('tool use')) return 'agents';
  if (lower.includes('vision') || lower.includes('image') || lower.includes('yolo') || lower.includes('segmentation') || lower.includes('cnn') || lower.includes('pooling')) return 'computer-vision';
  if (lower.includes('deep learning') || lower.includes('pytorch') || lower.includes('tensor') || lower.includes('gpu') || lower.includes('activations') || lower.includes('gradients')) return 'deep-learning';
  if (lower.includes('machine learning') || lower.includes('feature') || lower.includes('predictive') || lower.includes('classification') || lower.includes('linear') || lower.includes('boundary') || lower.includes('regularization')) return 'machine-learning';
  if (lower.includes('transformer') || lower.includes('attention') || lower.includes('self-attention')) return 'transformers';
  if (lower.includes('embedding') || lower.includes('vector') || lower.includes('semantic') || lower.includes('dense')) return 'embeddings';
  if (lower.includes('gradient') || lower.includes('converge') || lower.includes('learning rate') || lower.includes('optimizer') || lower.includes('sgd') || lower.includes('loss')) return 'optimization';
  return 'machine-learning';
}

function getResearchData(domainData) {
  if (!domainData) return null;
  return {
    confidence: domainData.canonicalStatus === 'Reviewed' ? 'Established' : 'Emerging',
    landmarks: (domainData.landmarkReferences || []).map((ref) => [ref.title, ref.authors, ref.year, ref.contribution]),
    benchmarks: (domainData.keywords || []).slice(0, 3),
    trends: (domainData.concepts || []).slice(0, 3)
  };
}

function getTransferData(domainData) {
  if (!domainData) return null;
  return {
    domainName: domainData.title,
    applications: domainData.industryApplications || [],
    architecture: (domainData.professionalInsights || []).join('\n'),
    tradeOffs: '',
    mlops: (domainData.professionalInsights || []).slice(0, 2).join('\n'),
    framework: '',
    failures: '',
    scaling: (domainData.professionalInsights || []).slice(-1).join('\n'),
    caseStudy: '',
    roles: ''
  };
}

function getAssessmentData(domainData) {
  if (!domainData) return null;
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
    plan: (domainData.relatedConcepts || []).map((r) => {
      const domainId = typeof r === 'string' ? r : (r.domain || r);
      return `Review ${domainId} connections`;
    }),
    misconceptions: misconceptions.length > 0 ? misconceptions[0].wrong : '',
    journal: `Write down one concept from ${domainData.title} that clicked today and one that still feels hazy.`,
    connections: `Connect ${domainData.title} concepts to other curriculum modules.`,
    sessionObjectives: `Strengthen fundamental intuition behind ${domainData.title}.`
  };
}

function getKnowledgeData(domainData) {
  if (!domainData) return null;
  const relatedLines = (domainData.relatedConcepts || []).map((r) => {
    const domainId = typeof r === 'string' ? r : (r.domain || r);
    const relType = typeof r === 'object' && r.type ? ` (${r.type})` : '';
    return `- ${domainId}${relType}`;
  });
  const backlinks = (domainData.relatedConcepts || []).map((r) => {
    const domainId = typeof r === 'string' ? r : (r.domain || r);
    const relType = typeof r === 'object' && r.type ? r.type : 'related';
    return {
      source: domainData.title,
      target: domainId,
      reason: `${relType} relationship in ${domainData.title}`
    };
  });
  return {
    domainName: domainData.title,
    permanentNote: `# Evergreen: ${domainData.title}\n## Definition\n${domainData.summary}\n\n## Key Insights\n${(domainData.concepts || []).map((c) => `- ${c}`).join('\n')}\n\n## Related Concepts\n${relatedLines.join('\n')}`,
    backlinks,
    tags: (domainData.keywords || []).slice(0, 4).map((k) => `#${k.replace(/\s+/g, '-')}`),
    collections: `NeuralVerse -> ${domainData.title}`,
    conceptMap: `${domainData.title}\n${(domainData.concepts || []).map((c) => `├── ${c}`).join('\n')}`,
    gap: `Explore neighboring concepts in ${domainData.title} to build context.`,
    refinement: `Review and expand key insights with concrete examples.`,
    splitting: `${domainData.title} Note\n${(domainData.concepts || []).slice(0, 2).map((c, i) => `├── Note ${String.fromCharCode(65 + i)}: ${c}`).join('\n')}`,
    review: `Review and consolidate notes on ${domainData.title} concepts.`,
    strategy: `Organize ${domainData.title} notes with extensive tag properties.`
  };
}

function getNarrativeData(domainData) {
  if (!domainData) return null;
  return {
    domainName: domainData.title,
    origin: domainData.historicalContext || '',
    journey: `1. **Foundations**: Core concepts in ${domainData.title}\n2. **Intermediate**: Advanced techniques and applications\n3. **Current**: Modern implementations and best practices\n4. **Advanced**: Research frontiers and open problems`,
    problem: `- **Challenge**: Understanding complex interactions in ${domainData.title}\n- **Key Insight**: Build intuitive understanding through systematic exploration`,
    timeline: (domainData.landmarkReferences || []).map((r) => `- **${r.year}**: ${r.title} — ${r.contribution}`).join('\n'),
    human: `Practitioners in ${domainData.title} think systematically about trade-offs, constraints, and real-world applicability.`,
    continuity: `${domainData.title} builds on foundational concepts. Understanding it prepares you for advanced topics.`,
    mental: (domainData.analogies || []).length > 0
      ? `- **Metaphor**: ${domainData.analogies[0].text}\n- **Limitations**: ${domainData.analogies[0].limitations}`
      : `- **Metaphor**: Understanding ${domainData.title} is like learning a new language — start with fundamentals, then build fluency.`,
    science: domainData.summary || '',
    motivation: `Mastering ${domainData.title} enables you to solve complex problems and build production systems.`,
    orientation: `You have explored ${domainData.title}. The next step is to apply these concepts in practice.`
  };
}

function getCuriosityData(domainData) {
  if (!domainData) return null;
  const facts = domainData.curiosityFacts || [];
  const analogies = domainData.analogies || [];
  return {
    domainName: domainData.title,
    did_you_know: facts.length > 0 ? facts[0] : `Did you know that ${domainData.title} is one of the most rapidly evolving fields in computer science?`,
    surprising_connection: facts.length > 1 ? facts[1] : `${domainData.title} connects to multiple adjacent scientific domains.`,
    historical_anecdote: domainData.historicalContext || '',
    thought_experiment: `What if ${domainData.title} did not exist? What systems would break?`,
    counterintuitive_insight: (domainData.commonMisconceptions || []).length > 0
      ? domainData.commonMisconceptions[0].correct
      : `Understanding ${domainData.title} often reveals counterintuitive insights.`,
    interdisciplinary_bridge: `${domainData.title} connects to multiple scientific disciplines.`,
    frontier_curiosity: `Active research in ${domainData.title} continues to push boundaries.`,
    everyday_analogy: analogies.length > 0
      ? `- **Analogy**: ${analogies[0].text}\n- **Limitations**: ${analogies[0].limitations}`
      : `- **Analogy**: Understanding ${domainData.title} is like learning to drive — initially complex, eventually intuitive.`,
    why_field_changed: `${domainData.title} transformed how we approach related problems.`,
    explore_next: `Explore related concepts in ${domainData.title} to deepen your understanding.`
  };
}

function createSharedKnowledgeService() {
  function initialize() {
    return loadIndex();
  }

  async function getDomain(domainId) {
    return loadDomain(domainId);
  }

  async function getAllDomains() {
    return loadAllDomains();
  }

  async function getDomainByTopic(topic, query) {
    const domainId = resolveDomain(topic, query || '');
    return loadDomain(domainId);
  }

  function resolveDomainForQuery(topic, query) {
    return resolveDomain(topic, query || '');
  }

  async function getResearchDataForDomain(domainId) {
    const domain = await loadDomain(domainId);
    return getResearchData(domain);
  }

  async function getTransferDataForDomain(domainId) {
    const domain = await loadDomain(domainId);
    return getTransferData(domain);
  }

  async function getAssessmentDataForDomain(domainId) {
    const domain = await loadDomain(domainId);
    return getAssessmentData(domain);
  }

  async function getKnowledgeDataForDomain(domainId) {
    const domain = await loadDomain(domainId);
    return getKnowledgeData(domain);
  }

  async function getNarrativeDataForDomain(domainId) {
    const domain = await loadDomain(domainId);
    return getNarrativeData(domain);
  }

  async function getCuriosityDataForDomain(domainId) {
    const domain = await loadDomain(domainId);
    return getCuriosityData(domain);
  }

  async function searchConcepts(query) {
    const domains = await loadAllDomains();
    const lower = (query || '').toLowerCase();
    const results = [];

    for (const domain of domains) {
      for (const concept of (domain.concepts || [])) {
        if (concept.toLowerCase().includes(lower)) {
          results.push({ domain: domain.id, concept, title: domain.title });
        }
      }
      for (const keyword of (domain.keywords || [])) {
        if (keyword.toLowerCase().includes(lower)) {
          results.push({ domain: domain.id, keyword, title: domain.title });
        }
      }
      if (domain.summary && domain.summary.toLowerCase().includes(lower)) {
        results.push({ domain: domain.id, match: 'summary', title: domain.title });
      }
    }

    return results;
  }

  function getSyncDomain(domainId) {
    return _domainCache.get(domainId) || null;
  }

  function getSyncDomainByTopic(topic, query) {
    const domainId = resolveDomain(topic, query || '');
    return _domainCache.get(domainId) || null;
  }

  function getTypedRelations(domainId) {
    const domain = _domainCache.get(domainId);
    if (!domain || !Array.isArray(domain.relatedConcepts)) return [];
    return domain.relatedConcepts.map((r) => {
      if (typeof r === 'string') return { domain: r, type: 'related' };
      return { domain: r.domain, type: r.type || 'related' };
    });
  }

  function getRelationsByType(relationType) {
    const results = [];
    for (const [domainId, domain] of _domainCache) {
      if (!Array.isArray(domain.relatedConcepts)) continue;
      for (const r of domain.relatedConcepts) {
        const type = typeof r === 'object' ? r.type : 'related';
        const target = typeof r === 'string' ? r : r.domain;
        if (type === relationType) {
          results.push({ source: domainId, target, type });
        }
      }
    }
    return results;
  }

  function getSourceReferences(domainId) {
    const domain = _domainCache.get(domainId);
    if (!domain || !Array.isArray(domain.sourceReferences)) return [];
    return domain.sourceReferences;
  }

  return {
    initialize,
    getDomain,
    getAllDomains,
    getDomainByTopic,
    resolveDomainForQuery,
    getResearchDataForDomain,
    getTransferDataForDomain,
    getAssessmentDataForDomain,
    getKnowledgeDataForDomain,
    getNarrativeDataForDomain,
    getCuriosityDataForDomain,
    searchConcepts,
    getSyncDomain,
    getSyncDomainByTopic,
    getTypedRelations,
    getRelationsByType,
    getSourceReferences,
    loadIndex
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.sharedKnowledgeService = createSharedKnowledgeService();
}

export { createSharedKnowledgeService };
