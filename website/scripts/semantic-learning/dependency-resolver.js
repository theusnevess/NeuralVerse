/**
 * Semantic Learning Intelligence — Dependency Resolver
 * Resolves concept dependency chains for prerequisite analysis.
 * Deterministic, bounded, cycle-safe.
 *
 * NV-1100-P9
 */
(function () {
  'use strict';

  function getEngine() {
    return window.NeuralVerse?.SemanticEngine || null;
  }

  function resolveDependencies(conceptId, options) {
    var engine = getEngine();
    if (!engine || !conceptId) return { prerequisites: [], allDependencies: [], chain: [] };

    var opts = options || {};
    var maxDepth = typeof opts.maxDepth === 'number' ? Math.min(opts.maxDepth, 5) : 5;

    var visited = {};
    var prerequisites = [];
    var chain = [];

    function walk(id, depth) {
      if (depth > maxDepth || visited[id]) return;
      visited[id] = true;

      var concept = engine.getConcept(id);
      if (!concept) return;

      var prereqs = engine.getPrerequisites(id);
      for (var i = 0; i < prereqs.length; i++) {
        if (!visited[prereqs[i].id]) {
          prerequisites.push({
            id: prereqs[i].id,
            name: prereqs[i].name,
            category: prereqs[i].category,
            depth: depth + 1,
            childConcept: id
          });
          walk(prereqs[i].id, depth + 1);
        }
      }
    }

    walk(conceptId, 0);

    // Sort by depth (deepest first = most foundational first)
    prerequisites.sort(function (a, b) {
      return b.depth - a.depth || a.name.localeCompare(b.name);
    });

    // Build dependency chain (concept -> its prerequisites -> their prerequisites)
    var chainMap = {};
    for (var i = 0; i < prerequisites.length; i++) {
      var p = prerequisites[i];
      if (!chainMap[p.childConcept]) chainMap[p.childConcept] = [];
      chainMap[p.childConcept].push(p.id);
    }

    chain = buildChain(conceptId, chainMap, {}, 0, maxDepth);

    return {
      prerequisites: prerequisites,
      allDependencies: prerequisites.map(function (p) { return p.id; }),
      chain: chain,
      totalPrerequisites: prerequisites.length,
      deterministic: true
    };
  }

  function buildChain(conceptId, chainMap, visited, depth, maxDepth) {
    if (depth > maxDepth || visited[conceptId]) return [];
    visited[conceptId] = true;

    var engine = getEngine();
    var concept = engine?.getConcept(conceptId);
    var node = {
      id: conceptId,
      name: concept ? concept.name : conceptId,
      children: []
    };

    var deps = chainMap[conceptId] || [];
    for (var i = 0; i < deps.length; i++) {
      var childChain = buildChain(deps[i], chainMap, visited, depth + 1, maxDepth);
      if (childChain.length > 0) {
        node.children.push(childChain[0]);
      }
    }

    return [node];
  }

  function getMissingPrerequisites(conceptId, exploredConceptIds) {
    var resolved = resolveDependencies(conceptId);
    var explored = {};
    if (Array.isArray(exploredConceptIds)) {
      for (var i = 0; i < exploredConceptIds.length; i++) {
        explored[exploredConceptIds[i]] = true;
      }
    }

    var missing = [];
    for (var i = 0; i < resolved.prerequisites.length; i++) {
      if (!explored[resolved.prerequisites[i].id]) {
        missing.push(resolved.prerequisites[i]);
      }
    }
    return missing;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.DependencyResolver = {
    resolveDependencies: resolveDependencies,
    getMissingPrerequisites: getMissingPrerequisites
  };
})();
