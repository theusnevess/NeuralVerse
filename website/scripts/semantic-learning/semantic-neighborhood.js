/**
 * Semantic Learning Intelligence — Semantic Neighborhood
 * Discovers concept neighborhoods based on relationship strength.
 * Bounded, deterministic, explainable.
 *
 * NV-1100-P9
 */
(function () {
  'use strict';

  var MAX_NEIGHBORHOOD_SIZE = 30;
  var _neighborhoodCache = null;

  function _getCache() {
    if (_neighborhoodCache) return _neighborhoodCache;
    var LRU = window.NeuralVerse?.BoundedLRUCache;
    if (LRU) _neighborhoodCache = LRU(64);
    return _neighborhoodCache;
  }

  function getEngine() {
    return window.NeuralVerse?.SemanticEngine || null;
  }

  function getNeighborhood(conceptId, depth) {
    var engine = getEngine();
    if (typeof conceptId !== 'string') return null;
    if (!engine || !conceptId) return null;

    var cache = _getCache();
    var cacheKey = conceptId + ':' + (depth || 2);
    if (cache && cache.has(cacheKey)) {
      var perf = window.NeuralVerse?.PerfInstrumentation;
      if (perf) perf.recordCacheHit();
      return cache.get(cacheKey);
    }

    var perf = window.NeuralVerse?.PerfInstrumentation;
    if (perf) perf.recordCacheMiss();

    var concept = engine.getConcept(conceptId);
    if (!concept) return null;

    var maxDepth = typeof depth === 'number' ? Math.min(depth, 3) : 2;
    var neighbors = [];
    var visited = {};
    visited[conceptId] = true;

    // Direct neighbors (depth 1)
    var related = engine.getRelatedConcepts(conceptId);
    var prereqs = engine.getPrerequisites(conceptId);
    var deps = engine.getDependents(conceptId);
    var artifacts = engine.getArtifactReferences(conceptId);
    var labs = engine.getLaboratoryReferences(conceptId);
    var domains = engine.getSharedKnowledgeDomains(conceptId);

    for (var i = 0; i < related.length; i++) {
      if (!visited[related[i].id]) {
        visited[related[i].id] = true;
        neighbors.push({
          id: related[i].id,
          name: related[i].name,
          category: related[i].category,
          distance: 1,
          relationshipType: related[i].relationshipType,
          kind: 'concept'
        });
      }
    }
    for (var i = 0; i < prereqs.length; i++) {
      if (!visited[prereqs[i].id]) {
        visited[prereqs[i].id] = true;
        neighbors.push({
          id: prereqs[i].id,
          name: prereqs[i].name,
          category: prereqs[i].category,
          distance: 1,
          relationshipType: 'prerequisite',
          kind: 'concept'
        });
      }
    }
    for (var i = 0; i < deps.length; i++) {
      if (!visited[deps[i].id]) {
        visited[deps[i].id] = true;
        neighbors.push({
          id: deps[i].id,
          name: deps[i].name,
          category: deps[i].category,
          distance: 1,
          relationshipType: 'dependent',
          kind: 'concept'
        });
      }
    }
    for (var i = 0; i < artifacts.length; i++) {
      neighbors.push({
        id: artifacts[i].id,
        name: artifacts[i].id,
        distance: 1,
        relationshipType: 'artifact_reference',
        kind: 'artifact'
      });
    }
    for (var i = 0; i < labs.length; i++) {
      neighbors.push({
        id: labs[i].id,
        name: labs[i].id,
        distance: 1,
        relationshipType: 'laboratory_reference',
        kind: 'laboratory'
      });
    }
    for (var i = 0; i < domains.length; i++) {
      neighbors.push({
        id: domains[i].id,
        name: domains[i].id,
        distance: 1,
        relationshipType: 'domain_reference',
        kind: 'shared-knowledge-domain'
      });
    }

    // Two-hop neighbors (depth 2)
    if (maxDepth >= 2) {
      var oneHopIds = [];
      for (var i = 0; i < neighbors.length; i++) {
        if (neighbors[i].kind === 'concept') oneHopIds.push(neighbors[i].id);
      }
      for (var i = 0; i < oneHopIds.length; i++) {
        var related2 = engine.getRelatedConcepts(oneHopIds[i]);
        for (var j = 0; j < related2.length; j++) {
          if (!visited[related2[j].id]) {
            visited[related2[j].id] = true;
            neighbors.push({
              id: related2[j].id,
              name: related2[j].name,
              category: related2[j].category,
              distance: 2,
              relationshipType: related2[j].relationshipType,
              kind: 'concept'
            });
          }
        }
        var prereqs2 = engine.getPrerequisites(oneHopIds[i]);
        for (var j = 0; j < prereqs2.length; j++) {
          if (!visited[prereqs2[j].id]) {
            visited[prereqs2[j].id] = true;
            neighbors.push({
              id: prereqs2[j].id,
              name: prereqs2[j].name,
              category: prereqs2[j].category,
              distance: 2,
              relationshipType: 'prerequisite',
              kind: 'concept'
            });
          }
        }
      }
    }

    // Sort by distance then alphabetical
    neighbors.sort(function (a, b) {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.kind !== b.kind) return a.kind < b.kind ? -1 : 1;
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });

    // Limit
    if (neighbors.length > MAX_NEIGHBORHOOD_SIZE) {
      neighbors = neighbors.slice(0, MAX_NEIGHBORHOOD_SIZE);
    }

    var result = {
      conceptId: conceptId,
      conceptName: concept.name,
      neighbors: neighbors,
      totalNeighbors: neighbors.length,
      maxDepth: maxDepth,
      deterministic: true
    };

    if (cache) cache.put(cacheKey, result);
    return result;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.SemanticNeighborhood = {
    getNeighborhood: getNeighborhood,
    MAX_NEIGHBORHOOD_SIZE: MAX_NEIGHBORHOOD_SIZE
  };
})();
