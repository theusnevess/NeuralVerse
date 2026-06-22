/**
 * NV-900-Graph-Polish — Knowledge Graph Layout Engine (Iteration 2)
 *
 * Organic, deterministic atlas placement.
 *
 * Level 1: Learning Paths only.
 * Level 2: Selected/expanded Path + Modules.
 * Level 3: Selected/expanded Module + Lessons.
 * Level 4: Selected/expanded Lesson + Artifacts.
 */

// ── Node visual sizes (larger than Iteration 1) ─────────────────────────────
export const NODE_SIZES = {
  path:     { w: 360, h: 118 },
  module:   { w: 260, h: 86 },
  lesson:   { w: 210, h: 66 },
  artifact: { w: 160, h: 46 },
};

// ── Spiral placement constants ───────────────────────────────────────────────
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));  // ≈2.399 radians
const SPIRAL_BASE  = 120;
const SPIRAL_GROWTH = 178;
const CLUSTER_PAD  = 430;

// ── Helpers ─────────────────────────────────────────────────────────────────

function getChildIds(parentId, edges) {
  return edges
    .filter(e => e.type === 'contains' && e.source === parentId)
    .map(e => e.target);
}

function placeChildren(parent, childIds, graph, radius, arcOffset = 0) {
  const nodes = [];
  const count = childIds.length;
  childIds.forEach((childId, index) => {
    const child = graph.nodeById.get(childId);
    if (!child) return;
    const spread = Math.min(Math.PI * 1.35, Math.PI * 0.42 + count * 0.22);
    const t = count === 1 ? 0.5 : index / (count - 1);
    const angle = arcOffset - spread / 2 + t * spread;
    const drift = ((index % 2 === 0 ? 1 : -1) * (18 + (index % 3) * 14));
    nodes.push({
      ...child,
      wx: parent.wx + Math.cos(angle) * (radius + drift),
      wy: parent.wy + Math.sin(angle) * (radius - drift * 0.35),
      _parentId: parent.id,
    });
  });
  return nodes;
}

function avoidCollisions(nodes) {
  for (let pass = 0; pass < 30; pass++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const as = NODE_SIZES[a.type] || NODE_SIZES.lesson;
        const bs = NODE_SIZES[b.type] || NODE_SIZES.lesson;
        const minDist = Math.max(as.w, bs.w) * 0.92 + Math.max(as.h, bs.h) * 1.1 + 88;
        const dx = b.wx - a.wx;
        const dy = b.wy - a.wy;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        if (dist < minDist) {
          const push = (minDist - dist) * 0.5;
          const nx = dx / dist;
          const ny = dy / dist;
          if (!a._locked) { a.wx -= nx * push; a.wy -= ny * push; }
          if (!b._locked) { b.wx += nx * push; b.wy += ny * push; }
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

function layoutExpandedPath(pathNode, graph, expandedPaths, expandedModules, expandedLessons, anchor) {
  const path = { ...pathNode, wx: anchor.x, wy: anchor.y, _locked: true };
  const nodes = [path];
  if (!expandedPaths.has(pathNode.id)) return nodes;

  const modules = placeChildren(path, getChildIds(path.id, graph.edges), graph, 520, Math.PI / 2);
  nodes.push(...modules);
  modules.forEach(module => {
    if (!expandedModules.has(module.id)) return;
    const lessons = placeChildren(module, getChildIds(module.id, graph.edges), graph, 400, Math.PI / 2 + 0.28);
    nodes.push(...lessons);
    lessons.forEach(lesson => {
      if (!expandedLessons.has(lesson.id)) return;
      nodes.push(...placeChildren(lesson, getChildIds(lesson.id, graph.edges), graph, 430, Math.PI / 2 - 0.18));
    });
  });
  avoidCollisions(nodes);
  return nodes;
}

// ── Organic cluster anchor placement (golden-angle spiral) ──────────────────

export function computeClusterAnchors(graph) {
  const paths = graph.nodes.filter(n => n.type === 'path');
  const anchors = new Map();
  const n = paths.length;

  // Place clusters on a Fermat spiral with golden-angle separation.
  // This produces an organic, non-grid distribution.
  paths.forEach((path, i) => {
    const angle = i * GOLDEN_ANGLE;
    const radius = SPIRAL_BASE + SPIRAL_GROWTH * Math.sqrt(i + 1);
    const x = Math.cos(angle) * radius * 1.62;
    const y = Math.sin(angle) * radius * 1.08;
    anchors.set(path.id, { x, y });
  });

  // Ensure minimum separation (collision pass)
  const ids = [...anchors.keys()];
  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = anchors.get(ids[i]);
        const b = anchors.get(ids[j]);
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CLUSTER_PAD && dist > 0) {
          const push = (CLUSTER_PAD - dist) / 2;
          const nx = dx / dist, ny = dy / dist;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }

  return anchors;
}

// ── Public API ──────────────────────────────────────────────────────────────

export function computeLayout(graph, expandedPaths, expandedModules, expandedLessons, clusterAnchors) {
  const positioned = [];
  graph.nodes.filter(n => n.type === 'path').forEach(pathNode => {
    const anchor = clusterAnchors.get(pathNode.id) || { x: 0, y: 0 };
    layoutExpandedPath(pathNode, graph, expandedPaths, expandedModules, expandedLessons, anchor)
      .forEach(n => positioned.push(n));
  });
  avoidCollisions(positioned);
  const positions = new Map();
  positioned.forEach(n => positions.set(n.id, n));
  return positions;
}

export function computeVisibleEdges(graph, nodePositions) {
  const visibleIds = new Set(nodePositions.keys());
  return graph.edges.filter(e =>
    e.type === 'contains' && visibleIds.has(e.source) && visibleIds.has(e.target)
  );
}

export function computeBounds(nodePositions) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodePositions.forEach(n => {
    const hw = (NODE_SIZES[n.type]?.w || 160) / 2;
    const hh = (NODE_SIZES[n.type]?.h || 48) / 2;
    minX = Math.min(minX, n.wx - hw);
    minY = Math.min(minY, n.wy - hh);
    maxX = Math.max(maxX, n.wx + hw);
    maxY = Math.max(maxY, n.wy + hh);
  });
  if (minX === Infinity) return { minX: 0, minY: 0, maxX: 900, maxY: 600, width: 900, height: 600 };
  return { minX, minY, maxX, maxY, width: maxX - minX + 300, height: maxY - minY + 300 };
}
