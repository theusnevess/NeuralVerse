/**
 * NV-1300-D1D — Semantic Learning Bridge
 *
 * Integrates the Semantic Engine (P9), Concept Layer (P4), and
 * Dependency Resolver with the pedagogical planner. Provides
 * concept neighborhood, prerequisite, cross-domain, and
 * supporting-concept queries.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 * No learner inference. No curriculum mutation.
 */

const NEIGHBORHOOD_DEPTH_MAX = 3;
const NEIGHBORHOOD_DEFAULT_DEPTH = 1;
const RECOMMENDATIONS_LIMIT = 8;
const CROSS_DOMAIN_LIMIT = 6;
const PREREQUISITES_LIMIT = 12;
const SUPPORTING_LIMIT = 8;

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }
function _dedup(arr) {
  var seen = Object.create(null);
  var out = [];
  for (var i = 0; i < arr.length; i++) {
    var v = arr[i];
    if (v == null) continue;
    var key = typeof v === 'string' ? v : v.id;
    if (seen[key]) continue;
    seen[key] = true;
    out.push(v);
  }
  return out;
}

function createSemanticLearningBridge() {
  var _lastNeighborhood = null;
  var _lastRecommendations = [];

  function _getSemanticEngine() {
    if (typeof window === 'undefined') return null;
    var nv = window.NeuralVerse;
    return nv ? (nv.SemanticEngine || nv.semanticEngine) : null;
  }

  function _getConceptLayer() {
    if (typeof window === 'undefined') return null;
    var nv = window.NeuralVerse;
    return nv ? (nv.ConceptLayerService || nv.conceptLayerService) : null;
  }

  function _getDependencyResolver() {
    if (typeof window === 'undefined') return null;
    var nv = window.NeuralVerse;
    return nv ? (nv.semanticDependencyResolver || nv.SemanticDependencyResolver) : null;
  }

  function _getAllConceptsSync() {
    var cl = _getConceptLayer();
    if (!cl) return [];
    if (typeof cl.getAllConceptsSync === 'function') {
      var out = cl.getAllConceptsSync();
      return Array.isArray(out) ? out : [];
    }
    if (typeof cl.getAllConcepts === 'function') {
      try {
        var p = cl.getAllConcepts();
        if (Array.isArray(p)) return p;
      } catch (e) { /* not a sync call */ }
    }
    if (typeof cl.concepts === 'object' && cl.concepts) {
      var arr = [];
      for (var k in cl.concepts) {
        if (Object.prototype.hasOwnProperty.call(cl.concepts, k)) {
          arr.push(cl.concepts[k]);
        }
      }
      return arr;
    }
    return [];
  }

  function _findConcept(conceptId) {
    var all = _getAllConceptsSync();
    for (var i = 0; i < all.length; i++) {
      var c = all[i];
      if (c && c.id === conceptId) return c;
    }
    return null;
  }

  function _resolveLinks(conceptId, direction) {
    var sem = _getSemanticEngine();
    if (!sem) return [];
    if (typeof sem.getLinkedConcepts === 'function') {
      try {
        var r = sem.getLinkedConcepts(conceptId, direction);
        if (Array.isArray(r)) return r;
      } catch (e) { /* fallthrough */ }
    }
    if (typeof sem.getNeighbors === 'function') {
      try {
        var n = sem.getNeighbors(conceptId);
        if (Array.isArray(n)) return n;
      } catch (e) { /* fallthrough */ }
    }
    return [];
  }

  function getConceptNeighborhood(conceptId, depth) {
    var id = _safeStr(conceptId);
    if (!id) return { conceptId: null, depth: 0, nodes: [], edges: [] };

    var maxDepth = typeof depth === 'number' && depth > 0 ? Math.min(depth, NEIGHBORHOOD_DEPTH_MAX) : NEIGHBORHOOD_DEFAULT_DEPTH;

    var visited = Object.create(null);
    var nodes = [];
    var edges = [];
    var queue = [{ id: id, depth: 0 }];
    visited[id] = 0;

    while (queue.length > 0) {
      var current = queue.shift();
      var concept = _findConcept(current.id);
      if (!concept) continue;

      nodes.push({
        id: current.id,
        name: _safeStr(concept.name || concept.title || current.id),
        depth: current.depth
      });

      if (current.depth >= maxDepth) continue;

      var outbound = _resolveLinks(current.id, 'outbound');
      for (var i = 0; i < outbound.length; i++) {
        var next = outbound[i];
        var nextId = _safeStr(next.id || next.conceptId || next);
        if (!nextId) continue;
        if (visited[nextId] !== undefined && visited[nextId] <= current.depth + 1) continue;
        visited[nextId] = current.depth + 1;
        edges.push({ from: current.id, to: nextId, direction: 'outbound' });
        queue.push({ id: nextId, depth: current.depth + 1 });
      }

      var inbound = _resolveLinks(current.id, 'inbound');
      for (var j = 0; j < inbound.length; j++) {
        var prev = inbound[j];
        var prevId = _safeStr(prev.id || prev.conceptId || prev);
        if (!prevId) continue;
        if (visited[prevId] !== undefined && visited[prevId] <= current.depth + 1) continue;
        visited[prevId] = current.depth + 1;
        edges.push({ from: prevId, to: current.id, direction: 'inbound' });
        queue.push({ id: prevId, depth: current.depth + 1 });
      }
    }

    _lastNeighborhood = { conceptId: id, depth: maxDepth, nodes: nodes, edges: edges };
    return _lastNeighborhood;
  }

  function getPrerequisites(conceptId) {
    var id = _safeStr(conceptId);
    if (!id) return [];

    var resolver = _getDependencyResolver();
    if (resolver && typeof resolver.buildDependencyChain === 'function') {
      try {
        var chain = resolver.buildDependencyChain(id);
        if (chain && Array.isArray(chain.chain)) {
          return chain.chain.slice(0, PREREQUISITES_LIMIT).map(function (c) {
            return { id: _safeStr(c.id), name: _safeStr(c.name), depth: typeof c.depth === 'number' ? c.depth : 0, type: _safeStr(c.type, 'prerequisite') };
          });
        }
      } catch (e) { /* fallthrough */ }
    }

    var sem = _getSemanticEngine();
    if (sem && typeof sem.getPrerequisites === 'function') {
      try {
        var p = sem.getPrerequisites(id);
        if (Array.isArray(p)) return p.slice(0, PREREQUISITES_LIMIT);
      } catch (e) { /* fallthrough */ }
    }

    var inbound = _resolveLinks(id, 'inbound');
    return inbound.slice(0, PREREQUISITES_LIMIT).map(function (c) {
      return { id: _safeStr(c.id || c), name: _safeStr(c.name || c.id || c), depth: 1, type: 'prerequisite' };
    });
  }

  function getCrossDomainLinks(conceptId) {
    var id = _safeStr(conceptId);
    if (!id) return [];

    var sem = _getSemanticEngine();
    if (sem && typeof sem.getCrossDomainLinks === 'function') {
      try {
        var cdl = sem.getCrossDomainLinks(id);
        if (Array.isArray(cdl)) return cdl.slice(0, CROSS_DOMAIN_LIMIT);
      } catch (e) { /* fallthrough */ }
    }

    var concept = _findConcept(id);
    if (!concept || !concept.domain) return [];

    var all = _getAllConceptsSync();
    var result = [];
    for (var i = 0; i < all.length; i++) {
      var c = all[i];
      if (!c || c.id === id) continue;
      if (c.domain && c.domain !== concept.domain) {
        result.push({
          sourceId: id,
          targetId: c.id,
          targetName: c.name || c.title || c.id,
          targetDomain: c.domain,
          relationshipType: 'cross_domain'
        });
        if (result.length >= CROSS_DOMAIN_LIMIT) break;
      }
    }
    return result;
  }

  function getSemanticRecommendations(conceptIds) {
    var ids = _safeArray(conceptIds);
    if (ids.length === 0) {
      _lastRecommendations = [];
      return _lastRecommendations;
    }

    var candidates = Object.create(null);
    for (var i = 0; i < ids.length; i++) {
      var cid = ids[i];
      var neighborhood = getConceptNeighborhood(cid, 2);
      for (var n = 0; n < neighborhood.nodes.length; n++) {
        var node = neighborhood.nodes[n];
        if (ids.indexOf(node.id) !== -1) continue;
        if (node.id === cid) continue;
        if (!candidates[node.id]) {
          candidates[node.id] = { id: node.id, name: node.name, score: 0, sources: [] };
        }
        candidates[node.id].score += (1 / (node.depth + 1));
        if (candidates[node.id].sources.indexOf(cid) === -1) {
          candidates[node.id].sources.push(cid);
        }
      }
    }

    var list = [];
    for (var k in candidates) {
      if (Object.prototype.hasOwnProperty.call(candidates, k)) {
        list.push(candidates[k]);
      }
    }
    list.sort(function (a, b) { return b.score - a.score; });
    _lastRecommendations = list.slice(0, RECOMMENDATIONS_LIMIT);
    return _lastRecommendations;
  }

  function getSupportingConcepts(conceptId) {
    var id = _safeStr(conceptId);
    if (!id) return [];

    var sem = _getSemanticEngine();
    if (sem && typeof sem.getSupportingConcepts === 'function') {
      try {
        var s = sem.getSupportingConcepts(id);
        if (Array.isArray(s)) return s.slice(0, SUPPORTING_LIMIT);
      } catch (e) { /* fallthrough */ }
    }

    var neighborhood = getConceptNeighborhood(id, 1);
    return neighborhood.nodes
      .filter(function (n) { return n.id !== id; })
      .slice(0, SUPPORTING_LIMIT)
      .map(function (n) {
        return { id: n.id, name: n.name, depth: n.depth, type: 'supporting' };
      });
  }

  function getSemanticContext(input) {
    var src = input || {};
    var ids = _safeArray(src.conceptIds);

    var neighborhoods = [];
    var allPrereqs = [];
    var allCrossDomain = [];
    var allSupporting = [];

    for (var i = 0; i < ids.length; i++) {
      var cid = ids[i];
      neighborhoods.push(getConceptNeighborhood(cid, 1));
      var pre = getPrerequisites(cid);
      for (var p = 0; p < pre.length; p++) allPrereqs.push(pre[p]);
      var cdl = getCrossDomainLinks(cid);
      for (var c = 0; c < cdl.length; c++) allCrossDomain.push(cdl[c]);
      var sup = getSupportingConcepts(cid);
      for (var s = 0; s < sup.length; s++) allSupporting.push(sup[s]);
    }

    var recommendations = getSemanticRecommendations(ids);

    return {
      conceptIds: ids,
      neighborhoods: neighborhoods,
      prerequisites: _dedup(allPrereqs),
      crossDomainLinks: _dedup(allCrossDomain),
      supportingConcepts: _dedup(allSupporting),
      recommendations: recommendations,
      counts: {
        neighborhoods: neighborhoods.length,
        prerequisites: _dedup(allPrereqs).length,
        crossDomain: _dedup(allCrossDomain).length,
        supporting: _dedup(allSupporting).length,
        recommendations: recommendations.length
      }
    };
  }

  function getLastNeighborhood() { return _lastNeighborhood; }
  function getLastRecommendations() { return _lastRecommendations.slice(); }
  function reset() { _lastNeighborhood = null; _lastRecommendations = []; }

  return {
    getConceptNeighborhood: getConceptNeighborhood,
    getPrerequisites: getPrerequisites,
    getCrossDomainLinks: getCrossDomainLinks,
    getSemanticRecommendations: getSemanticRecommendations,
    getSupportingConcepts: getSupportingConcepts,
    getSemanticContext: getSemanticContext,
    getLastNeighborhood: getLastNeighborhood,
    getLastRecommendations: getLastRecommendations,
    reset: reset,
    NEIGHBORHOOD_DEPTH_MAX: NEIGHBORHOOD_DEPTH_MAX,
    NEIGHBORHOOD_DEFAULT_DEPTH: NEIGHBORHOOD_DEFAULT_DEPTH,
    RECOMMENDATIONS_LIMIT: RECOMMENDATIONS_LIMIT
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createSemanticLearningBridge = createSemanticLearningBridge;
}

export { createSemanticLearningBridge, NEIGHBORHOOD_DEPTH_MAX, NEIGHBORHOOD_DEFAULT_DEPTH, RECOMMENDATIONS_LIMIT };
