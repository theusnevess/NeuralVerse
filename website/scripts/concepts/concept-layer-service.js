/**
 * Concept Layer Service
 *
 * Canonical query interface for the concept layer.
 * Provides deterministic, immutable access to concept data.
 * Agents query this service instead of maintaining isolated concept maps.
 *
 * Philosophy:
 * - Immutable at runtime after initialization
 * - Local-first, offline-capable
 * - Deterministic (no randomness, no hidden mutations)
 * - Single source of truth for concept content
 */

const CONCEPT_INDEX_PATH = '/data/concepts/index.json';
const CONCEPT_BASE_PATH = '/data/concepts/';

let _indexCache = null;
let _conceptCache = new Map();
let _conceptPromises = new Map();
let _indexPromise = null;

let _aliasIndex = null;
let _categoryIndex = null;
let _sharedDomainIndex = null;

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

  _indexPromise = fetchJson(CONCEPT_INDEX_PATH)
    .then((index) => {
      _indexCache = Object.freeze(index);
      return _indexCache;
    })
    .catch((err) => {
      console.error('Failed to load concept layer index:', err);
      _indexPromise = null;
      return null;
    });

  return _indexPromise;
}

async function loadConcept(conceptId) {
  if (_conceptCache.has(conceptId)) {
    var perf = window.NeuralVerse?.PerfInstrumentation;
    if (perf) perf.recordCacheHit();
    return _conceptCache.get(conceptId);
  }

  if (_conceptPromises.has(conceptId)) return _conceptPromises.get(conceptId);

  const request = (async () => {
    var perf = window.NeuralVerse?.PerfInstrumentation;
    if (perf) perf.recordCacheMiss();

    const index = await loadIndex();
    if (!index) return null;

    const entry = index.concepts.find((c) => c.id === conceptId);
    if (!entry) return null;

    var loadStart = performance.now();
    const data = await fetchJson(`${CONCEPT_BASE_PATH}${entry.file}`).catch((err) => {
      console.error(`Failed to load concept ${conceptId}:`, err);
      return null;
    });
    if (perf) perf.recordLazyLoad(loadStart);

    if (data) _conceptCache.set(conceptId, Object.freeze(data));
    return data;
  })();

  _conceptPromises.set(conceptId, request);
  try {
    return await request;
  } finally {
    _conceptPromises.delete(conceptId);
  }
}

async function loadAllConcepts() {
  const index = await loadIndex();
  if (!index) return [];

  const results = await Promise.all(
    index.concepts.map((c) => loadConcept(c.id))
  );

  return results.filter(Boolean);
}

function _buildSecondaryIndexes(concepts) {
  _aliasIndex = Object.create(null);
  _categoryIndex = Object.create(null);
  _sharedDomainIndex = Object.create(null);

  for (var i = 0; i < concepts.length; i++) {
    var c = concepts[i];

    if (Array.isArray(c.aliases)) {
      for (var a = 0; a < c.aliases.length; a++) {
        var alias = c.aliases[a].toLowerCase();
        if (!_aliasIndex[alias]) _aliasIndex[alias] = [];
        _aliasIndex[alias].push(c);
      }
    }

    if (c.category) {
      if (!_categoryIndex[c.category]) _categoryIndex[c.category] = [];
      _categoryIndex[c.category].push(c);
    }

    if (Array.isArray(c.sharedKnowledgeDomains)) {
      for (var d = 0; d < c.sharedKnowledgeDomains.length; d++) {
        var domain = c.sharedKnowledgeDomains[d];
        if (!_sharedDomainIndex[domain]) _sharedDomainIndex[domain] = [];
        _sharedDomainIndex[domain].push(c);
      }
    }
  }
}

function getPrerequisites(conceptData) {
  if (!conceptData || !Array.isArray(conceptData.prerequisites)) return [];
  return conceptData.prerequisites.map((p) => {
    if (typeof p === 'string') return { id: p, type: 'required' };
    return { id: p.id, type: p.type || 'required' };
  });
}

function getDependents(conceptId, allConcepts) {
  const dependents = [];
  for (const concept of allConcepts) {
    if (!Array.isArray(concept.prerequisites)) continue;
    for (const prereq of concept.prerequisites) {
      const prereqId = typeof prereq === 'string' ? prereq : prereq.id;
      if (prereqId === conceptId) {
        dependents.push({ id: concept.id, title: concept.title });
      }
    }
  }
  return dependents;
}

function getArtifacts(conceptData) {
  if (!conceptData || !Array.isArray(conceptData.artifacts)) return [];
  return conceptData.artifacts.map((a) => {
    if (typeof a === 'string') return { id: a, type: 'general' };
    return { id: a.id, type: a.type || 'general', label: a.label || '' };
  });
}

function getSharedKnowledge(conceptData) {
  if (!conceptData || !Array.isArray(conceptData.sharedKnowledgeDomains)) return [];
  return conceptData.sharedKnowledgeDomains;
}

function getRelatedConcepts(conceptData) {
  if (!conceptData || !Array.isArray(conceptData.relatedConcepts)) return [];
  return conceptData.relatedConcepts.map((r) => {
    if (typeof r === 'string') return { id: r, type: 'related' };
    return { id: r.id, type: r.type || 'related' };
  });
}

function normalizeText(text) {
  return (text || '').toLowerCase();
}

function matchQuery(text, queryLower) {
  return normalizeText(text).includes(queryLower);
}

function searchInConcept(concept, queryLower) {
  const matches = [];

  if (matchQuery(concept.title, queryLower)) {
    matches.push({ field: 'title', value: concept.title });
  }

  if (Array.isArray(concept.aliases)) {
    for (const alias of concept.aliases) {
      if (matchQuery(alias, queryLower)) {
        matches.push({ field: 'alias', value: alias });
      }
    }
  }

  if (Array.isArray(concept.keywords)) {
    for (const keyword of concept.keywords) {
      if (matchQuery(keyword, queryLower)) {
        matches.push({ field: 'keyword', value: keyword });
      }
    }
  }

  if (matchQuery(concept.summary, queryLower)) {
    matches.push({ field: 'summary', value: concept.summary });
  }

  if (matchQuery(concept.definition, queryLower)) {
    matches.push({ field: 'definition', value: concept.definition });
  }

  return matches;
}

function createConceptLayerService() {
  function initialize() {
    return loadIndex();
  }

  async function getConcept(id) {
    return loadConcept(id);
  }

  async function getAllConcepts() {
    const concepts = await loadAllConcepts();
    if (concepts.length > 0 && !_aliasIndex) {
      _buildSecondaryIndexes(concepts);
    }
    return concepts;
  }

  async function searchConcepts(query) {
    const concepts = await getAllConcepts();
    const queryLower = normalizeText(query);
    const results = [];

    for (const concept of concepts) {
      const matches = searchInConcept(concept, queryLower);
      if (matches.length > 0) {
        results.push({ concept: concept.id, title: concept.title, matches });
      }
    }

    return results;
  }

  async function getPrerequisites(id) {
    const concept = await loadConcept(id);
    return getPrerequisites(concept);
  }

  async function getDependents(id) {
    const concepts = await getAllConcepts();
    return getDependents(id, concepts);
  }

  async function getArtifacts(id) {
    const concept = await loadConcept(id);
    return getArtifacts(concept);
  }

  async function getSharedKnowledge(id) {
    const concept = await loadConcept(id);
    return getSharedKnowledge(concept);
  }

  async function getRelatedConcepts(id) {
    const concept = await loadConcept(id);
    return getRelatedConcepts(concept);
  }

  async function getConceptGraph() {
    const concepts = await getAllConcepts();
    const nodes = [];
    const edges = [];
    const nodeIds = new Set();

    for (const concept of concepts) {
      nodeIds.add(concept.id);
      nodes.push({
        id: concept.id,
        label: concept.title || concept.id,
        category: concept.category || 'general',
        difficulty: concept.difficulty || 'intermediate'
      });
    }

    for (const concept of concepts) {
      if (Array.isArray(concept.prerequisites)) {
        for (const prereq of concept.prerequisites) {
          const prereqId = typeof prereq === 'string' ? prereq : prereq.id;
          const type = typeof prereq === 'object' ? (prereq.type || 'required') : 'required';
          if (nodeIds.has(concept.id) && nodeIds.has(prereqId)) {
            edges.push({ source: prereqId, target: concept.id, type });
          }
        }
      }

      if (Array.isArray(concept.relatedConcepts)) {
        for (const related of concept.relatedConcepts) {
          const relatedId = typeof related === 'string' ? related : related.id;
          const type = typeof related === 'object' ? (related.type || 'related') : 'related';
          if (nodeIds.has(concept.id) && nodeIds.has(relatedId)) {
            edges.push({ source: concept.id, target: relatedId, type });
          }
        }
      }
    }

    return { nodes, edges };
  }

  async function getConceptsByCategory(category) {
    const concepts = await loadAllConcepts();
    return concepts.filter((c) => c.category === category);
  }

  async function getConceptsForArtifact(artifactId) {
    const concepts = await loadAllConcepts();
    const results = [];

    for (const concept of concepts) {
      if (!Array.isArray(concept.artifactReferences)) continue;
      for (const ref of concept.artifactReferences) {
        const refId = typeof ref === 'string' ? ref : ref.id;
        if (refId === artifactId) {
          results.push(concept);
          break;
        }
      }
    }

    return results;
  }

  function getSyncConcept(id) {
    return _conceptCache.get(id) || null;
  }

  function getSyncConceptBySlug(slug) {
    for (const [id, concept] of _conceptCache) {
      if (concept.slug === slug) return concept;
    }
    return null;
  }

  function getByAlias(alias) {
    if (!_aliasIndex) return [];
    return _aliasIndex[alias.toLowerCase()] || [];
  }

  function getByCategory(category) {
    if (!_categoryIndex) return [];
    return _categoryIndex[category] || [];
  }

  function getBySharedKnowledgeDomain(domainId) {
    if (!_sharedDomainIndex) return [];
    return _sharedDomainIndex[domainId] || [];
  }

  function isIndexBuilt() {
    return _aliasIndex !== null;
  }

  return {
    initialize,
    getConcept,
    getAllConcepts,
    searchConcepts,
    getPrerequisites,
    getDependents,
    getArtifacts,
    getSharedKnowledge,
    getRelatedConcepts,
    getConceptGraph,
    getConceptsByCategory,
    getConceptsForArtifact,
    getSyncConcept,
    getSyncConceptBySlug,
    getByAlias,
    getByCategory,
    getBySharedKnowledgeDomain,
    isIndexBuilt,
    loadIndex
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.conceptLayerService = createConceptLayerService();
}
