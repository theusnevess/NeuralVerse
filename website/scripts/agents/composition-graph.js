/**
 * NV-1300-D1A — Composition Graph
 *
 * Represents the didactic plan as a deterministic DAG.
 * Canonical order defines the pedagogical flow.
 * Validates cycles, dangling edges, duplicate nodes.
 *
 * Deterministic. No Math.random. No Date.now.
 */

const CANONICAL_SECTION_ORDER = [
  'motivation',
  'context',
  'intuition',
  'core_explanation',
  'visualization',
  'mathematics',
  'algorithm',
  'implementation',
  'laboratory',
  'misconception',
  'assessment',
  'summary',
  'forward_connections'
];

function createCompositionGraph() {
  let _lastGraph = null;

  function createGraph(sections) {
    if (!Array.isArray(sections)) {
      return { nodes: [], edges: [], valid: false, errors: ['sections must be an array'] };
    }

    var nodeMap = Object.create(null);
    var nodes = [];
    var errors = [];

    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      var id = s && s.id ? s.id : null;
      if (!id) {
        errors.push('Section at index ' + i + ' missing id');
        continue;
      }
      if (nodeMap[id]) {
        errors.push('Duplicate node: ' + id);
        continue;
      }
      var node = {
        id: id,
        label: s.label || id,
        type: s.type || 'text',
        included: s.included !== false,
        order: i,
        metadata: s.metadata || null
      };
      nodeMap[id] = node;
      nodes.push(node);
    }

    var edges = [];
    for (var j = 0; j < nodes.length - 1; j++) {
      var src = nodes[j].id;
      var tgt = nodes[j + 1].id;
      if (nodeMap[src] && nodeMap[tgt]) {
        edges.push({ source: src, target: tgt, type: 'sequential' });
      }
    }

    var graph = {
      nodes: nodes,
      edges: edges,
      nodeMap: nodeMap,
      valid: errors.length === 0,
      errors: errors
    };

    _lastGraph = graph;
    return graph;
  }

  function buildFromSections(sections) {
    var graphSections = [];
    for (var i = 0; i < CANONICAL_SECTION_ORDER.length; i++) {
      var sectionId = CANONICAL_SECTION_ORDER[i];
      var found = null;
      for (var j = 0; j < sections.length; j++) {
        if (sections[j].id === sectionId) {
          found = sections[j];
          break;
        }
      }
      graphSections.push({
        id: sectionId,
        label: found ? (found.label || sectionId) : sectionId,
        type: found ? (found.type || 'text') : 'text',
        included: found ? (found.included !== false) : false,
        metadata: found ? (found.metadata || null) : null
      });
    }
    return createGraph(graphSections);
  }

  function validateGraph(graph) {
    if (!graph || typeof graph !== 'object') {
      return { valid: false, errors: ['Graph is not an object'] };
    }
    if (!Array.isArray(graph.nodes)) {
      return { valid: false, errors: ['Graph nodes must be an array'] };
    }
    if (!Array.isArray(graph.edges)) {
      return { valid: false, errors: ['Graph edges must be an array'] };
    }

    var errors = [];
    var nodeIds = Object.create(null);

    for (var i = 0; i < graph.nodes.length; i++) {
      var n = graph.nodes[i];
      if (!n.id) {
        errors.push('Node at index ' + i + ' missing id');
      } else if (nodeIds[n.id]) {
        errors.push('Duplicate node id: ' + n.id);
      } else {
        nodeIds[n.id] = true;
      }
    }

    for (var j = 0; j < graph.edges.length; j++) {
      var e = graph.edges[j];
      if (!e.source || !e.target) {
        errors.push('Edge at index ' + j + ' missing source or target');
        continue;
      }
      if (!nodeIds[e.source]) {
        errors.push('Edge references non-existent source: ' + e.source);
      }
      if (!nodeIds[e.target]) {
        errors.push('Edge references non-existent target: ' + e.target);
      }
      if (e.source === e.target) {
        errors.push('Self-loop detected: ' + e.source);
      }
    }

    if (hasCycle(graph)) {
      errors.push('Cycle detected in graph');
    }

    return { valid: errors.length === 0, errors: errors };
  }

  function hasCycle(graph) {
    if (!graph || !graph.nodes || !graph.edges) return false;

    var adjacency = Object.create(null);
    for (var i = 0; i < graph.nodes.length; i++) {
      adjacency[graph.nodes[i].id] = [];
    }
    for (var j = 0; j < graph.edges.length; j++) {
      var e = graph.edges[j];
      if (adjacency[e.source]) {
        adjacency[e.source].push(e.target);
      }
    }

    var WHITE = 0, GRAY = 1, BLACK = 2;
    var color = Object.create(null);
    for (var k = 0; k < graph.nodes.length; k++) {
      color[graph.nodes[k].id] = WHITE;
    }

    var nodeIds = [];
    for (var m = 0; m < graph.nodes.length; m++) {
      nodeIds.push(graph.nodes[m].id);
    }

    for (var p = 0; p < nodeIds.length; p++) {
      if (color[nodeIds[p]] !== WHITE) continue;

      var stack = [nodeIds[p]];
      while (stack.length > 0) {
        var u = stack[stack.length - 1];
        if (color[u] === WHITE) {
          color[u] = GRAY;
          var neighbors = adjacency[u] || [];
          for (var q = 0; q < neighbors.length; q++) {
            var v = neighbors[q];
            if (color[v] === GRAY) return true;
            if (color[v] === WHITE) {
              stack.push(v);
            }
          }
        } else {
          color[u] = BLACK;
          stack.pop();
        }
      }
    }

    return false;
  }

  function topologicalSort(graph) {
    if (!graph || !graph.nodes) return [];

    var adjacency = Object.create(null);
    var inDegree = Object.create(null);
    for (var i = 0; i < graph.nodes.length; i++) {
      var nid = graph.nodes[i].id;
      adjacency[nid] = [];
      inDegree[nid] = 0;
    }
    for (var j = 0; j < graph.edges.length; j++) {
      var e = graph.edges[j];
      if (adjacency[e.source]) {
        adjacency[e.source].push(e.target);
      }
      if (inDegree[e.target] !== undefined) {
        inDegree[e.target]++;
      }
    }

    var queue = [];
    for (var k = 0; k < graph.nodes.length; k++) {
      if (inDegree[graph.nodes[k].id] === 0) {
        queue.push(graph.nodes[k].id);
      }
    }

    var sorted = [];
    while (queue.length > 0) {
      var current = queue.shift();
      sorted.push(current);
      var neighbors = adjacency[current] || [];
      for (var m = 0; m < neighbors.length; m++) {
        inDegree[neighbors[m]]--;
        if (inDegree[neighbors[m]] === 0) {
          queue.push(neighbors[m]);
        }
      }
    }

    if (sorted.length !== graph.nodes.length) {
      return [];
    }

    return sorted;
  }

  function getEdges(graph) {
    return graph && Array.isArray(graph.edges) ? graph.edges.slice() : [];
  }

  function getNodes(graph) {
    return graph && Array.isArray(graph.nodes) ? graph.nodes.slice() : [];
  }

  function getLastGraph() {
    return _lastGraph;
  }

  return {
    createGraph: createGraph,
    buildFromSections: buildFromSections,
    validateGraph: validateGraph,
    hasCycle: hasCycle,
    topologicalSort: topologicalSort,
    getEdges: getEdges,
    getNodes: getNodes,
    getLastGraph: getLastGraph,
    CANONICAL_SECTION_ORDER: CANONICAL_SECTION_ORDER
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createCompositionGraph = createCompositionGraph;
}

export { createCompositionGraph, CANONICAL_SECTION_ORDER };
