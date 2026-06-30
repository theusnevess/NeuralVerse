/**
 * NV-1300-D3A — Dependency Graph Validator
 *
 * Validates dependency graph structure:
 * - Graph shape validation
 * - Cycle detection
 * - Self-dependency detection
 * - Duplicate edge detection
 * - Broken reference detection
 * - Dependency direction validation
 * - Stable topological ordering
 *
 * Read-only, deterministic, safe on empty/invalid input.
 */

function createDependencyGraphValidator() {

  function getCapabilities() {
    return {
      name: 'DependencyGraphValidator',
      version: '1.0.0',
      methods: [
        'validateGraph',
        'detectCycles',
        'detectSelfDependencies',
        'detectDuplicateEdges',
        'detectBrokenReferences',
        'validateDependencyDirection',
        'topologicalSort'
      ]
    };
  }

  function validateGraph(graph, options = {}) {
    if (!graph || typeof graph !== 'object') {
      return { valid: false, errors: ['Invalid graph input'], warnings: [], stats: {} };
    }

    const errors = [];
    const warnings = [];
    const nodes = graph.nodes || [];
    const edges = graph.edges || [];

    const stats = {
      nodeCount: nodes.length,
      edgeCount: edges.length
    };

    if (nodes.length === 0 && edges.length === 0) {
      return { valid: true, errors: [], warnings: [], stats };
    }

    const nodeIds = new Set(nodes.map(n => n.id).filter(Boolean));

    for (const node of nodes) {
      if (!node.id) {
        errors.push('Node missing id');
      }
    }

    for (const edge of edges) {
      if (!edge.source && !edge.from) {
        errors.push('Edge missing source/from');
      }
      if (!edge.target && !edge.to) {
        errors.push('Edge missing target/to');
      }
    }

    const selfDeps = detectSelfDependencies(graph);
    if (selfDeps.selfDependencies.length > 0) {
      errors.push(`Self-dependencies detected: ${selfDeps.selfDependencies.length}`);
    }

    const dupes = detectDuplicateEdges(graph);
    if (dupes.duplicateEdges.length > 0) {
      warnings.push(`Duplicate edges detected: ${dupes.duplicateEdges.length}`);
    }

    const cycles = detectCycles(graph);
    if (cycles.hasCycles) {
      errors.push(`Cycles detected: ${cycles.cycles.length}`);
    }

    const broken = detectBrokenReferences(graph, nodeIds);
    if (broken.brokenReferences.length > 0) {
      errors.push(`Broken references detected: ${broken.brokenReferences.length}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats
    };
  }

  function detectCycles(graph) {
    if (!graph || typeof graph !== 'object') {
      return { hasCycles: false, cycles: [] };
    }

    const nodes = graph.nodes || [];
    const edges = graph.edges || [];

    if (nodes.length === 0) {
      return { hasCycles: false, cycles: [] };
    }

    const adjacency = new Map();
    for (const node of nodes) {
      if (node.id) {
        adjacency.set(node.id, []);
      }
    }

    for (const edge of edges) {
      const source = edge.source || edge.from;
      const target = edge.target || edge.to;
      if (source && target && adjacency.has(source)) {
        adjacency.get(source).push(target);
      }
    }

    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    function dfs(node, path) {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = adjacency.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const cyclePath = dfs(neighbor, path);
          if (cyclePath) return cyclePath;
        } else if (recursionStack.has(neighbor)) {
          const cycleStart = path.indexOf(neighbor);
          return path.slice(cycleStart).concat(neighbor);
        }
      }

      path.pop();
      recursionStack.delete(node);
      return null;
    }

    for (const node of nodes) {
      if (node.id && !visited.has(node.id)) {
        const cyclePath = dfs(node.id, []);
        if (cyclePath) {
          cycles.push(cyclePath);
        }
      }
    }

    return {
      hasCycles: cycles.length > 0,
      cycles
    };
  }

  function detectSelfDependencies(graph) {
    if (!graph || typeof graph !== 'object') {
      return { selfDependencies: [] };
    }

    const edges = graph.edges || [];
    const selfDependencies = [];

    for (const edge of edges) {
      const source = edge.source || edge.from;
      const target = edge.target || edge.to;
      if (source && target && source === target) {
        selfDependencies.push({ node: source, edge });
      }
    }

    return { selfDependencies };
  }

  function detectDuplicateEdges(graph) {
    if (!graph || typeof graph !== 'object') {
      return { duplicateEdges: [] };
    }

    const edges = graph.edges || [];
    const seen = new Map();
    const duplicateEdges = [];

    for (const edge of edges) {
      const source = edge.source || edge.from;
      const target = edge.target || edge.to;
      const key = `${source}|||${target}`;

      if (seen.has(key)) {
        duplicateEdges.push({ edge, firstOccurrence: seen.get(key) });
      } else {
        seen.set(key, edge);
      }
    }

    return { duplicateEdges };
  }

  function detectBrokenReferences(graph, validIds) {
    if (!graph || typeof graph !== 'object') {
      return { brokenReferences: [] };
    }

    const edges = graph.edges || [];
    const brokenReferences = [];

    for (const edge of edges) {
      const source = edge.source || edge.from;
      const target = edge.target || edge.to;

      if (source && validIds && !validIds.has(source)) {
        brokenReferences.push({ edge, missingId: source, type: 'source' });
      }
      if (target && validIds && !validIds.has(target)) {
        brokenReferences.push({ edge, missingId: target, type: 'target' });
      }
    }

    return { brokenReferences };
  }

  function validateDependencyDirection(graph) {
    if (!graph || typeof graph !== 'object') {
      return { valid: true, issues: [] };
    }

    const edges = graph.edges || [];
    const issues = [];

    for (const edge of edges) {
      if (!edge.source && !edge.from) {
        issues.push({ edge, issue: 'missing source' });
      }
      if (!edge.target && !edge.to) {
        issues.push({ edge, issue: 'missing target' });
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  function topologicalSort(graph) {
    if (!graph || typeof graph !== 'object') {
      return { sorted: [], valid: false, error: 'Invalid graph' };
    }

    const nodes = graph.nodes || [];
    const edges = graph.edges || [];

    if (nodes.length === 0) {
      return { sorted: [], valid: true };
    }

    const nodeIds = nodes.map(n => n.id).filter(Boolean);
    const inDegree = new Map();
    const adjacency = new Map();

    for (const id of nodeIds) {
      inDegree.set(id, 0);
      adjacency.set(id, []);
    }

    for (const edge of edges) {
      const source = edge.source || edge.from;
      const target = edge.target || edge.to;

      if (source && target && adjacency.has(source)) {
        adjacency.get(source).push(target);
        inDegree.set(target, (inDegree.get(target) || 0) + 1);
      }
    }

    const queue = [];
    for (const id of nodeIds) {
      if (inDegree.get(id) === 0) {
        queue.push(id);
      }
    }

    queue.sort();

    const sorted = [];

    while (queue.length > 0) {
      const current = queue.shift();
      sorted.push(current);

      const neighbors = adjacency.get(current) || [];
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
          queue.sort();
        }
      }
    }

    const valid = sorted.length === nodeIds.length;

    return { sorted, valid };
  }

  return {
    getCapabilities,
    validateGraph,
    detectCycles,
    detectSelfDependencies,
    detectDuplicateEdges,
    detectBrokenReferences,
    validateDependencyDirection,
    topologicalSort
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.dependencyGraphValidator = createDependencyGraphValidator();
}

export { createDependencyGraphValidator };
