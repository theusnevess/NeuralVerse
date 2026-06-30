/**
 * Semantic Learning Intelligence — Semantic Traversal
 * Bounded, deterministic graph traversal over concept relationships.
 * No cycles. No infinite loops. No probabilistic ranking.
 *
 * NV-1100-P9
 */
(function () {
  'use strict';

  var MAX_DEPTH = 3;
  var MAX_RESULTS = 50;
  var _traversalCache = null;

  function _getCache() {
    if (_traversalCache) return _traversalCache;
    var LRU = window.NeuralVerse?.BoundedLRUCache;
    if (LRU) _traversalCache = LRU(64);
    return _traversalCache;
  }

  function getEngine() {
    return window.NeuralVerse?.SemanticEngine || null;
  }

  function traverse(conceptId, options) {
    if (typeof conceptId !== 'string') return [];

    var cache = _getCache();
    var cacheKey = conceptId + ':' + JSON.stringify(options || {});
    if (cache && cache.has(cacheKey)) {
      var perf = window.NeuralVerse?.PerfInstrumentation;
      if (perf) perf.recordCacheHit();
      return cache.get(cacheKey);
    }

    var perf = window.NeuralVerse?.PerfInstrumentation;
    if (perf) perf.recordCacheMiss();
    var engine = getEngine();
    if (!engine || !conceptId) return [];

    var opts = options || {};
    var maxDepth = typeof opts.maxDepth === 'number' ? Math.min(opts.maxDepth, MAX_DEPTH) : MAX_DEPTH;
    var maxResults = typeof opts.maxResults === 'number' ? Math.min(opts.maxResults, MAX_RESULTS) : MAX_RESULTS;
    var direction = opts.direction || 'both'; // 'both', 'prerequisites', 'dependents', 'related'

    var visited = {};
    var results = [];
    var queue = [{ id: conceptId, depth: 0, path: [] }];

    while (queue.length > 0 && results.length < maxResults) {
      var current = queue.shift();
      if (visited[current.id]) continue;
      visited[current.id] = true;

      if (current.depth > 0) {
        var concept = engine.getConcept(current.id);
        if (concept) {
          results.push({
            id: concept.id,
            name: concept.name,
            category: concept.category,
            depth: current.depth,
            path: current.path.concat([concept.id]),
            relationshipType: current.relationshipType || 'traversal'
          });
        }
      }

      if (current.depth >= maxDepth) continue;

      // Add prerequisites
      if (direction === 'both' || direction === 'prerequisites') {
        var prereqs = engine.getPrerequisites(current.id);
        for (var i = 0; i < prereqs.length; i++) {
          if (!visited[prereqs[i].id]) {
            queue.push({
              id: prereqs[i].id,
              depth: current.depth + 1,
              path: current.path.concat([current.id]),
              relationshipType: 'prerequisite'
            });
          }
        }
      }

      // Add dependents
      if (direction === 'both' || direction === 'dependents') {
        var deps = engine.getDependents(current.id);
        for (var i = 0; i < deps.length; i++) {
          if (!visited[deps[i].id]) {
            queue.push({
              id: deps[i].id,
              depth: current.depth + 1,
              path: current.path.concat([current.id]),
              relationshipType: 'dependent'
            });
          }
        }
      }

      // Add related concepts
      if (direction === 'both' || direction === 'related') {
        var related = engine.getRelatedConcepts(current.id);
        for (var i = 0; i < related.length; i++) {
          if (!visited[related[i].id]) {
            queue.push({
              id: related[i].id,
              depth: current.depth + 1,
              path: current.path.concat([current.id]),
              relationshipType: related[i].relationshipType
            });
          }
        }
      }
    }

    if (cache) cache.put(cacheKey, results);
    return results;
  }

  function getTraversal(conceptId, options) {
    var results = traverse(conceptId, options);
    var concept = getEngine()?.getConcept(conceptId);
    return {
      sourceConcept: concept ? { id: concept.id, name: concept.name } : null,
      nodes: results,
      totalNodes: results.length,
      maxDepth: options?.maxDepth || MAX_DEPTH,
      deterministic: true
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.SemanticTraversal = {
    traverse: traverse,
    getTraversal: getTraversal,
    MAX_DEPTH: MAX_DEPTH,
    MAX_RESULTS: MAX_RESULTS
  };
})();
