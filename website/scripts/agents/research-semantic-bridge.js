/**
 * NV-1300-D2 — Research Semantic Bridge
 *
 * Uses concept graph, semantic engine, and dependency graph
 * to expand research context. Never mutates semantic structures.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 */

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function createResearchSemanticBridge() {
  var _lastContext = null;

  function _getConceptGraph() {
    if (typeof window === 'undefined') return null;
    return window.NeuralVerse && (window.NeuralVerse.ConceptGraph || window.NeuralVerse.conceptGraph);
  }

  function _getSemanticEngine() {
    if (typeof window === 'undefined') return null;
    return window.NeuralVerse && (window.NeuralVerse.SemanticEngine || window.NeuralVerse.semanticEngine);
  }

  function getRelatedConcepts(conceptId) {
    var id = _safeStr(conceptId);
    if (!id) return [];
    var cg = _getConceptGraph();
    if (!cg || typeof cg.getRelated !== 'function') return [];
    try {
      var r = cg.getRelated(id);
      return _safeArray(r);
    } catch (e) { return []; }
  }

  function getPrerequisites(conceptId) {
    var id = _safeStr(conceptId);
    if (!id) return [];
    var sem = _getSemanticEngine();
    if (!sem || typeof sem.getPrerequisites !== 'function') return [];
    try {
      var r = sem.getPrerequisites(id);
      return _safeArray(r);
    } catch (e) { return []; }
  }

  function expandContext(conceptIds) {
    var ids = _safeArray(conceptIds);
    var related = [];
    var prereqs = [];

    for (var i = 0; i < ids.length; i++) {
      related = related.concat(getRelatedConcepts(ids[i]));
      prereqs = prereqs.concat(getPrerequisites(ids[i]));
    }

    _lastContext = {
      inputConcepts: ids,
      relatedConcepts: related,
      prerequisites: prereqs,
      counts: {
        related: related.length,
        prerequisites: prereqs.length
      }
    };
    return _lastContext;
  }

  function getLastContext() { return _lastContext; }
  function reset() { _lastContext = null; }

  return {
    getRelatedConcepts: getRelatedConcepts,
    getPrerequisites: getPrerequisites,
    expandContext: expandContext,
    getLastContext: getLastContext,
    reset: reset
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createResearchSemanticBridge = createResearchSemanticBridge;
}

export { createResearchSemanticBridge };
