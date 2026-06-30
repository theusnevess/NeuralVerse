/**
 * NV-1300-D2 — Evidence Collector
 *
 * Collects evidence from canonical curriculum, shared knowledge,
 * concept layer, laboratories, visualizations, and pre-retrieved
 * external sources. No autonomous web search.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 */

var EVIDENCE_SOURCES = {
  CURRICULUM: 'curriculum',
  SHARED_KNOWLEDGE: 'shared_knowledge',
  CONCEPT: 'concept',
  LABORATORY: 'laboratory',
  VISUALIZATION: 'visualization',
  EXTERNAL: 'external'
};

function _safeArray(v) { return Array.isArray(v) ? v : []; }

function createEvidenceCollector() {
  var _lastCollection = null;

  function collect(input) {
    var src = input || {};
    var items = [];

    var curriculum = _safeArray(src.curriculum);
    for (var i = 0; i < curriculum.length; i++) {
      items.push({ source: EVIDENCE_SOURCES.CURRICULUM, content: curriculum[i], refId: 'curr-' + i });
    }

    var sharedKnowledge = _safeArray(src.sharedKnowledge);
    for (var s = 0; s < sharedKnowledge.length; s++) {
      items.push({ source: EVIDENCE_SOURCES.SHARED_KNOWLEDGE, content: sharedKnowledge[s], refId: 'sk-' + s });
    }

    var concepts = _safeArray(src.concepts);
    for (var c = 0; c < concepts.length; c++) {
      items.push({ source: EVIDENCE_SOURCES.CONCEPT, content: concepts[c], refId: concepts[c].id || ('concept-' + c) });
    }

    var laboratories = _safeArray(src.laboratories);
    for (var l = 0; l < laboratories.length; l++) {
      items.push({ source: EVIDENCE_SOURCES.LABORATORY, content: laboratories[l], refId: laboratories[l].id || ('lab-' + l) });
    }

    var visualizations = _safeArray(src.visualizations);
    for (var v = 0; v < visualizations.length; v++) {
      items.push({ source: EVIDENCE_SOURCES.VISUALIZATION, content: visualizations[v], refId: visualizations[v].id || ('viz-' + v) });
    }

    var external = _safeArray(src.external);
    for (var e = 0; e < external.length; e++) {
      items.push({ source: EVIDENCE_SOURCES.EXTERNAL, content: external[e], refId: external[e].id || ('ext-' + e) });
    }

    _lastCollection = { items: items, count: items.length, sources: EVIDENCE_SOURCES };
    return _lastCollection;
  }

  function getLastCollection() { return _lastCollection; }
  function reset() { _lastCollection = null; }

  return {
    collect: collect,
    getLastCollection: getLastCollection,
    reset: reset,
    EVIDENCE_SOURCES: EVIDENCE_SOURCES
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createEvidenceCollector = createEvidenceCollector;
}

export { createEvidenceCollector, EVIDENCE_SOURCES };
