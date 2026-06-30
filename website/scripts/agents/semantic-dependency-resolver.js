/**
 * NV-1300-D1B — Semantic Dependency Resolver
 *
 * Resolves prerequisite chains, detects hidden dependencies,
 * identifies gaps, and validates dependency ordering.
 *
 * Uses existing Semantic Engine and Concept Layer APIs only.
 * Deterministic. No Math.random. No Date.now.
 */

function createSemanticDependencyResolver() {
  var _cache = {};

  function _getSemanticEngine() {
    return (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.SemanticEngine)
      ? window.NeuralVerse.SemanticEngine
      : null;
  }

  function _getConceptLayer() {
    return (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.conceptLayerService)
      ? window.NeuralVerse.conceptLayerService
      : null;
  }

  function _clearCache() {
    _cache = {};
  }

  function resolvePrerequisites(conceptId) {
    if (!conceptId || typeof conceptId !== 'string') return [];

    var cacheKey = 'prereqs:' + conceptId;
    if (_cache[cacheKey]) return _cache[cacheKey];

    var engine = _getSemanticEngine();
    if (!engine) return [];

    var concept = engine.getConcept(conceptId);
    if (!concept) return [];

    var direct = [];
    var seen = {};

    for (var i = 0; i < concept.prerequisiteConcepts.length; i++) {
      var prereqId = concept.prerequisiteConcepts[i];
      if (!seen[prereqId]) {
        seen[prereqId] = true;
        var prereqConcept = engine.getConcept(prereqId);
        direct.push({
          id: prereqId,
          name: prereqConcept ? prereqConcept.name : prereqId,
          category: prereqConcept ? prereqConcept.category : '',
          depth: 1,
          type: 'direct'
        });
      }
    }

    _cache[cacheKey] = direct;
    return direct;
  }

  function resolveTransitivePrerequisites(conceptId, maxDepth) {
    if (!conceptId || typeof conceptId !== 'string') return [];

    var depth = typeof maxDepth === 'number' ? Math.min(maxDepth, 5) : 5;
    var cacheKey = 'transitive:' + conceptId + ':' + depth;
    if (_cache[cacheKey]) return _cache[cacheKey];

    var engine = _getSemanticEngine();
    if (!engine) return [];

    var visited = {};
    var result = [];

    function walk(id, currentDepth) {
      if (currentDepth > depth || visited[id]) return;
      visited[id] = true;

      var concept = engine.getConcept(id);
      if (!concept) return;

      for (var i = 0; i < concept.prerequisiteConcepts.length; i++) {
        var prereqId = concept.prerequisiteConcepts[i];
        if (!visited[prereqId]) {
          var prereqConcept = engine.getConcept(prereqId);
          result.push({
            id: prereqId,
            name: prereqConcept ? prereqConcept.name : prereqId,
            category: prereqConcept ? prereqConcept.category : '',
            depth: currentDepth + 1,
            type: currentDepth === 0 ? 'direct' : 'transitive',
            childConcept: id
          });
          walk(prereqId, currentDepth + 1);
        }
      }
    }

    walk(conceptId, 0);

    result.sort(function (a, b) {
      return b.depth - a.depth || a.name.localeCompare(b.name);
    });

    _cache[cacheKey] = result;
    return result;
  }

  function detectMissingDependencies(plan) {
    if (!plan || typeof plan !== 'object') return [];

    var conceptIds = [];
    if (Array.isArray(plan.conceptIds)) {
      conceptIds = plan.conceptIds.slice();
    }

    if (conceptIds.length === 0 && plan.topic) {
      var layerEngine = _getSemanticEngine();
      if (layerEngine) {
        var allConcepts = layerEngine.getAllConcepts();
        var topicLower = plan.topic.toLowerCase();
        for (var i = 0; i < allConcepts.length; i++) {
          if (allConcepts[i].name && allConcepts[i].name.toLowerCase().indexOf(topicLower) !== -1) {
            conceptIds.push(allConcepts[i].id);
          }
        }
      }
    }

    if (conceptIds.length === 0) return [];

    var missing = [];
    var covered = {};

    for (var c = 0; c < conceptIds.length; c++) {
      covered[conceptIds[c]] = true;
    }

    for (var j = 0; j < conceptIds.length; j++) {
      var transitive = resolveTransitivePrerequisites(conceptIds[j], 3);
      for (var k = 0; k < transitive.length; k++) {
        var prereq = transitive[k];
        if (!covered[prereq.id]) {
          missing.push({
            conceptId: prereq.id,
            name: prereq.name,
            requiredBy: conceptIds[j],
            depth: prereq.depth,
            severity: prereq.depth <= 1 ? 'warning' : 'info'
          });
          covered[prereq.id] = true;
        }
      }
    }

    return missing;
  }

  function buildDependencyChain(conceptId) {
    if (!conceptId || typeof conceptId !== 'string') return { chain: [], order: [], valid: true };

    var transitive = resolveTransitivePrerequisites(conceptId, 5);
    var allIds = [conceptId];
    for (var i = 0; i < transitive.length; i++) {
      allIds.push(transitive[i].id);
    }

    var engine = _getSemanticEngine();
    var adjacency = {};
    var inDegree = {};

    for (var a = 0; a < allIds.length; a++) {
      adjacency[allIds[a]] = [];
      inDegree[allIds[a]] = 0;
    }

    for (var b = 0; b < allIds.length; b++) {
      var cid = allIds[b];
      if (!engine) continue;
      var concept = engine.getConcept(cid);
      if (!concept) continue;

      for (var p = 0; p < concept.prerequisiteConcepts.length; p++) {
        var prereqId = concept.prerequisiteConcepts[p];
        if (adjacency[prereqId] !== undefined && adjacency[cid] !== undefined) {
          adjacency[prereqId].push(cid);
          inDegree[cid]++;
        }
      }
    }

    var queue = [];
    for (var q = 0; q < allIds.length; q++) {
      if (inDegree[allIds[q]] === 0) {
        queue.push(allIds[q]);
      }
    }

    var sorted = [];
    while (queue.length > 0) {
      var current = queue.shift();
      sorted.push(current);
      var neighbors = adjacency[current] || [];
      for (var n = 0; n < neighbors.length; n++) {
        inDegree[neighbors[n]]--;
        if (inDegree[neighbors[n]] === 0) {
          queue.push(neighbors[n]);
        }
      }
    }

    var valid = sorted.length === allIds.length;

    return {
      chain: transitive,
      order: sorted,
      valid: valid,
      rootConcept: conceptId
    };
  }

  function validateDependencyOrder(sequence) {
    if (!Array.isArray(sequence) || sequence.length === 0) {
      return { valid: true, violations: [] };
    }

    var engine = _getSemanticEngine();
    var position = {};
    for (var i = 0; i < sequence.length; i++) {
      position[sequence[i]] = i;
    }

    var violations = [];

    for (var j = 0; j < sequence.length; j++) {
      var cid = sequence[j];
      if (!engine) continue;
      var concept = engine.getConcept(cid);
      if (!concept) continue;

      for (var p = 0; p < concept.prerequisiteConcepts.length; p++) {
        var prereqId = concept.prerequisiteConcepts[p];
        if (position[prereqId] !== undefined && position[prereqId] > j) {
          violations.push({
            conceptId: cid,
            prerequisiteId: prereqId,
            conceptPosition: j,
            prerequisitePosition: position[prereqId],
            reason: 'Prerequisite ' + prereqId + ' appears after ' + cid
          });
        }
      }
    }

    return { valid: violations.length === 0, violations: violations };
  }

  function explainDependency(conceptA, conceptB) {
    if (!conceptA || !conceptB) return { connected: false, reason: 'Invalid input' };

    var engine = _getSemanticEngine();
    if (!engine) return { connected: false, reason: 'Semantic engine unavailable' };

    var conceptAData = engine.getConcept(conceptA);
    var conceptBData = engine.getConcept(conceptB);

    if (!conceptAData) return { connected: false, reason: 'Concept A not found: ' + conceptA };
    if (!conceptBData) return { connected: false, reason: 'Concept B not found: ' + conceptB };

    for (var i = 0; i < conceptAData.prerequisiteConcepts.length; i++) {
      if (conceptAData.prerequisiteConcepts[i] === conceptB) {
        return {
          connected: true,
          relationship: 'prerequisite',
          direction: conceptB + ' → ' + conceptA,
          explanation: conceptBData.name + ' is a direct prerequisite of ' + conceptAData.name
        };
      }
    }

    for (var j = 0; j < conceptBData.prerequisiteConcepts.length; j++) {
      if (conceptBData.prerequisiteConcepts[j] === conceptA) {
        return {
          connected: true,
          relationship: 'prerequisite',
          direction: conceptA + ' → ' + conceptB,
          explanation: conceptAData.name + ' is a direct prerequisite of ' + conceptBData.name
        };
      }
    }

    var chainAB = buildDependencyChain(conceptA);
    for (var k = 0; k < chainAB.order.length; k++) {
      if (chainAB.order[k] === conceptB) {
        return {
          connected: true,
          relationship: 'transitive-prerequisite',
          direction: conceptB + ' → ... → ' + conceptA,
          explanation: conceptBData.name + ' is a transitive prerequisite of ' + conceptAData.name
        };
      }
    }

    var chainBA = buildDependencyChain(conceptB);
    for (var m = 0; m < chainBA.order.length; m++) {
      if (chainBA.order[m] === conceptA) {
        return {
          connected: true,
          relationship: 'transitive-prerequisite',
          direction: conceptA + ' → ... → ' + conceptB,
          explanation: conceptAData.name + ' is a transitive prerequisite of ' + conceptBData.name
        };
      }
    }

    for (var r = 0; r < conceptAData.relatedConcepts.length; r++) {
      var rel = conceptAData.relatedConcepts[r];
      var relId = typeof rel === 'string' ? rel : (rel.id || rel.concept || '');
      if (relId === conceptB) {
        var relType = typeof rel === 'object' ? (rel.type || 'related_to') : 'related_to';
        return {
          connected: true,
          relationship: relType,
          direction: conceptA + ' ↔ ' + conceptB,
          explanation: conceptAData.name + ' and ' + conceptBData.name + ' are related (' + relType + ')'
        };
      }
    }

    return {
      connected: false,
      relationship: 'none',
      direction: '',
      explanation: 'No direct or transitive dependency found between ' + conceptAData.name + ' and ' + conceptBData.name
    };
  }

  return {
    resolvePrerequisites: resolvePrerequisites,
    resolveTransitivePrerequisites: resolveTransitivePrerequisites,
    detectMissingDependencies: detectMissingDependencies,
    buildDependencyChain: buildDependencyChain,
    validateDependencyOrder: validateDependencyOrder,
    explainDependency: explainDependency
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createSemanticDependencyResolver = createSemanticDependencyResolver;
}

export { createSemanticDependencyResolver };
