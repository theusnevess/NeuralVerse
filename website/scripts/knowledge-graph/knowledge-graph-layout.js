/**
 * NV-900-UIX — Knowledge Graph Layout Engine
 *
 * Cluster-based, top-down tree layout.
 * Stable, deterministic, progressive disclosure aware.
 *
 * Coordinate space: world-space pixels.
 * Each cluster is placed at an (cx, cy) anchor.
 * Nodes within a cluster are positioned relative to that anchor.
 */

// ── Node visual sizes ──────────────────────────────────────────────────────────
export const NODE_SIZES = {
  path:     { w: 220, h: 64 },
  module:   { w: 170, h: 50 },
  lesson:   { w: 144, h: 40 },
  artifact: { w: 120, h: 30 },
};

// ── Spacing constants ─────────────────────────────────────────────────────────
const CLUSTER_COLS       = 4;    // paths per row
const CLUSTER_SLOT_W     = 860;  // horizontal slot per cluster (px)
const CLUSTER_SLOT_H     = 360;  // vertical slot per cluster (px, unexpanded)
const CLUSTER_GAP_X      = 200;  // gap between cluster columns
const CLUSTER_GAP_Y      = 220;  // gap between cluster rows
const ROW_STAGGER        = 180;  // x-offset for odd rows

const PATH_TO_MOD_Y      = 110;  // vertical gap: path → module layer
const MOD_TO_LES_Y       = 100;  // vertical gap: module → lesson layer
const LES_TO_ART_Y       = 80;   // vertical gap: lesson → artifact layer
const SIBLING_GAP_MOD    = 24;   // horizontal gap between module subtrees
const SIBLING_GAP_LES    = 14;   // horizontal gap between lesson subtrees
const SIBLING_GAP_ART    = 10;   // horizontal gap between artifact nodes

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return all module IDs belonging to a path (from contains edges). */
function getChildIds(parentId, edges) {
  return edges
    .filter(e => e.type === 'contains' && e.source === parentId)
    .map(e => e.target);
}

/** Subtree width of a module (depends on whether lessons are expanded). */
function lessonSubtreeWidth(lessonId, expandedLessons, edges) {
  if (!expandedLessons.has(lessonId)) return NODE_SIZES.lesson.w;
  const artIds = getChildIds(lessonId, edges);
  if (!artIds.length) return NODE_SIZES.lesson.w;
  const total = artIds.length * NODE_SIZES.artifact.w + (artIds.length - 1) * SIBLING_GAP_ART;
  return Math.max(NODE_SIZES.lesson.w, total);
}

function moduleSubtreeWidth(moduleId, expandedModules, expandedLessons, edges) {
  if (!expandedModules.has(moduleId)) return NODE_SIZES.module.w;
  const lessonIds = getChildIds(moduleId, edges);
  if (!lessonIds.length) return NODE_SIZES.module.w;
  const total = lessonIds.reduce((s, lid) =>
    s + lessonSubtreeWidth(lid, expandedLessons, edges), 0
  ) + (lessonIds.length - 1) * SIBLING_GAP_LES;
  return Math.max(NODE_SIZES.module.w, total);
}

// ── Cluster-level layout ──────────────────────────────────────────────────────

/**
 * Compute (x, y) positions for all visible nodes within one cluster.
 * Returns an array of { id, x, y, type, ...node } in world space.
 * All positions are absolute (anchor already added).
 */
function layoutCluster(pathNode, graph, expandedModules, expandedLessons, anchorX, anchorY) {
  const { edges, nodeById } = graph;
  const nodes = [];

  // ── Path node ───────────────────────────────────────────────────
  const pathX = anchorX;
  const pathY = anchorY;
  nodes.push({ ...pathNode, wx: pathX, wy: pathY });

  // ── Modules ─────────────────────────────────────────────────────
  const moduleIds = getChildIds(pathNode.id, edges);
  const modWidths = moduleIds.map(mid =>
    moduleSubtreeWidth(mid, expandedModules, expandedLessons, edges)
  );
  const totalModW = modWidths.reduce((s, w) => s + w, 0)
    + Math.max(0, moduleIds.length - 1) * SIBLING_GAP_MOD;
  let modCursorX = pathX - totalModW / 2;
  const modY = pathY + PATH_TO_MOD_Y;

  moduleIds.forEach((moduleId, mi) => {
    const moduleNode = nodeById.get(moduleId);
    if (!moduleNode) return;
    const modW = modWidths[mi];
    const modCenterX = modCursorX + modW / 2;
    nodes.push({ ...moduleNode, wx: modCenterX, wy: modY });

    // ── Lessons ────────────────────────────────────────────────────
    if (expandedModules.has(moduleId)) {
      const lessonIds = getChildIds(moduleId, edges);
      const lesWidths = lessonIds.map(lid =>
        lessonSubtreeWidth(lid, expandedLessons, edges)
      );
      const totalLesW = lesWidths.reduce((s, w) => s + w, 0)
        + Math.max(0, lessonIds.length - 1) * SIBLING_GAP_LES;
      let lesCursorX = modCenterX - totalLesW / 2;
      const lesY = modY + MOD_TO_LES_Y;

      lessonIds.forEach((lessonId, li) => {
        const lessonNode = nodeById.get(lessonId);
        if (!lessonNode) return;
        const lesW = lesWidths[li];
        const lesCenterX = lesCursorX + lesW / 2;
        nodes.push({ ...lessonNode, wx: lesCenterX, wy: lesY });

        // ── Artifacts ──────────────────────────────────────────────
        if (expandedLessons.has(lessonId)) {
          const artIds = getChildIds(lessonId, edges);
          const totalArtW = artIds.length * NODE_SIZES.artifact.w
            + Math.max(0, artIds.length - 1) * SIBLING_GAP_ART;
          let artCursorX = lesCenterX - totalArtW / 2;
          const artY = lesY + LES_TO_ART_Y;
          artIds.forEach(artId => {
            const artNode = nodeById.get(artId);
            if (!artNode) return;
            nodes.push({ ...artNode, wx: artCursorX + NODE_SIZES.artifact.w / 2, wy: artY });
            artCursorX += NODE_SIZES.artifact.w + SIBLING_GAP_ART;
          });
        }

        lesCursorX += lesW + SIBLING_GAP_LES;
      });
    }

    modCursorX += modW + SIBLING_GAP_MOD;
  });

  return nodes;
}

// ── Top-level entry points ────────────────────────────────────────────────────

/**
 * Compute anchor (world-space x,y) for each Learning Path cluster.
 * Stable and deterministic — independent of expansion state.
 */
export function computeClusterAnchors(graph) {
  const paths = graph.nodes.filter(n => n.type === 'path');
  const anchors = new Map();
  paths.forEach((path, i) => {
    const col = i % CLUSTER_COLS;
    const row = Math.floor(i / CLUSTER_COLS);
    const stagger = row % 2 === 1 ? ROW_STAGGER : 0;
    anchors.set(path.id, {
      x: 120 + col * (CLUSTER_SLOT_W + CLUSTER_GAP_X) + stagger,
      y: 80  + row * (CLUSTER_SLOT_H + CLUSTER_GAP_Y),
    });
  });
  return anchors;
}

/**
 * Compute world-space positions for ALL visible nodes.
 * Returns Map<nodeId, {wx, wy, ...node}>
 */
export function computeLayout(graph, expandedModules, expandedLessons, clusterAnchors) {
  const positions = new Map();
  const paths = graph.nodes.filter(n => n.type === 'path');
  paths.forEach(pathNode => {
    const anchor = clusterAnchors.get(pathNode.id) || { x: 0, y: 0 };
    const clusterNodes = layoutCluster(
      pathNode, graph, expandedModules, expandedLessons, anchor.x, anchor.y
    );
    clusterNodes.forEach(n => positions.set(n.id, n));
  });
  return positions;
}

/**
 * Compute visible edges for the current expansion state.
 * Collapses edges to "path → module → collapsed-count" when children are hidden.
 */
export function computeVisibleEdges(graph, nodePositions) {
  const visibleIds = new Set(nodePositions.keys());
  return graph.edges.filter(e =>
    e.type === 'contains'
      && visibleIds.has(e.source)
      && visibleIds.has(e.target)
  );
}

/**
 * Compute canvas bounds from all visible node positions.
 */
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
  return { minX, minY, maxX, maxY,
    width: maxX - minX + 200, height: maxY - minY + 200 };
}
