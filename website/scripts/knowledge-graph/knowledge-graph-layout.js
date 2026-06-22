/**
 * NV-900-UI10C — Focus-based curriculum atlas layout.
 *
 * The graph is rendered from explicit state instead of accumulated expansion.
 * Each mode shows one readable neighborhood with deterministic rows and arcs.
 */

export const NODE_SIZES = {
  path: { w: 400, h: 140 },
  module: { w: 280, h: 96 },
  lesson: { w: 230, h: 74 },
  artifact: { w: 180, h: 56 },
};

const ROW_GAP = 260;
const COL_GAP = 360;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function getChildren(graph, parentId) {
  return graph.edges
    .filter((edge) => edge.type === 'contains' && edge.source === parentId)
    .map((edge) => graph.nodeById.get(edge.target))
    .filter(Boolean);
}

function getParent(graph, nodeId) {
  const edge = graph.edges.find((candidate) => candidate.type === 'contains' && candidate.target === nodeId);
  return edge ? graph.nodeById.get(edge.source) : null;
}

function getSiblings(graph, node) {
  const parent = getParent(graph, node.id);
  if (!parent) return [];
  return getChildren(graph, parent.id).filter((candidate) => candidate.id !== node.id);
}

function getDependencyNodes(graph, nodeId) {
  const dependencyTypes = new Set(['prerequisite', 'recommended_before', 'recommended_after', 'complementary', 'alternative']);
  return graph.edges
    .filter((edge) => dependencyTypes.has(edge.type) && (edge.source === nodeId || edge.target === nodeId))
    .map((edge) => graph.nodeById.get(edge.source === nodeId ? edge.target : edge.source))
    .filter(Boolean);
}

function placeRow(nodes, y, options = {}) {
  const positioned = [];
  const count = nodes.length;
  const gap = options.gap || COL_GAP;
  const maxVisible = options.maxVisible || 12;
  const visible = nodes.slice(0, maxVisible);
  const start = -((visible.length - 1) * gap) / 2;
  visible.forEach((node, index) => {
    const arc = options.arc ? Math.sin((index / Math.max(1, visible.length - 1)) * Math.PI) * 54 : 0;
    positioned.push({
      ...node,
      wx: start + index * gap,
      wy: y + arc,
      _role: options.role || 'context',
      _hiddenCount: index === visible.length - 1 && count > maxVisible ? count - maxVisible : 0,
    });
  });
  return positioned;
}

function pathOverview(graph) {
  const paths = graph.nodes.filter((node) => node.type === 'path');
  const positions = new Map();
  const base = 200;
  const growth = 360;
  paths.forEach((path, index) => {
    const angle = index * GOLDEN_ANGLE;
    const radius = base + growth * Math.sqrt(index + 1);
    positions.set(path.id, {
      ...path,
      wx: Math.cos(angle) * radius,
      wy: Math.sin(angle) * radius * 0.85,
      _role: 'selected',
    });
  });
  return positions;
}

function addNode(map, node, x, y, role) {
  if (!node) return;
  map.set(node.id, { ...node, wx: x, wy: y, _role: role });
}

function layoutPathFocus(graph, path) {
  const positions = new Map();
  addNode(positions, path, 0, -ROW_GAP / 2, 'selected');
  placeRow(getChildren(graph, path.id), ROW_GAP / 2, { role: 'child', arc: true, maxVisible: 10 })
    .forEach((node) => positions.set(node.id, node));
  return positions;
}

function layoutModuleFocus(graph, module) {
  const positions = new Map();
  const parent = getParent(graph, module.id);
  addNode(positions, parent, 0, -ROW_GAP, 'parent');
  getSiblings(graph, module).slice(0, 8).forEach((sibling, index, siblings) => {
    const side = index < siblings.length / 2 ? -1 : 1;
    const offsetIndex = index < siblings.length / 2 ? index : index - Math.ceil(siblings.length / 2);
    // Use 320 instead of 245 for offset to prevent overlap (module width is 280)
    addNode(positions, sibling, side * (440 + offsetIndex * 320), 0, 'sibling');
  });
  addNode(positions, module, 0, 0, 'selected');
  placeRow(getChildren(graph, module.id), ROW_GAP, { role: 'child', arc: true, maxVisible: 10 })
    .forEach((node) => positions.set(node.id, node));
  return positions;
}

function layoutLessonFocus(graph, lesson) {
  const positions = new Map();
  const parent = getParent(graph, lesson.id);
  addNode(positions, parent, 0, -ROW_GAP, 'parent');
  getSiblings(graph, lesson).slice(0, 8).forEach((sibling, index, siblings) => {
    // Lesson width is 230, use 280 gap to leave 50px padding
    const start = -((siblings.length - 1) * 280) / 2;
    addNode(positions, sibling, start + index * 280, -90, 'sibling');
  });
  addNode(positions, lesson, 0, 0, 'selected');
  placeRow(getChildren(graph, lesson.id), ROW_GAP, { role: 'child', arc: true, gap: 250, maxVisible: 12 })
    .forEach((node) => positions.set(node.id, node));
  return positions;
}

function layoutArtifactFocus(graph, artifact) {
  const positions = new Map();
  const parent = getParent(graph, artifact.id);
  addNode(positions, parent, 0, -ROW_GAP, 'parent');
  addNode(positions, artifact, 0, 0, 'selected');
  const related = [...getSiblings(graph, artifact), ...getDependencyNodes(graph, artifact.id)]
    .filter((node, index, all) => all.findIndex((candidate) => candidate.id === node.id) === index);
  placeRow(related, ROW_GAP, { role: 'child', arc: true, gap: 240, maxVisible: 12 })
    .forEach((node) => positions.set(node.id, node));
  return positions;
}

export function computeLayout(graph, state) {
  const focused = state.focusedNodeId ? graph.nodeById.get(state.focusedNodeId) : null;
  if (!focused || state.mode === 'overview') return pathOverview(graph);
  if (state.mode === 'path' || focused.type === 'path') return layoutPathFocus(graph, focused);
  if (state.mode === 'module' || focused.type === 'module') return layoutModuleFocus(graph, focused);
  if (state.mode === 'lesson' || focused.type === 'lesson') return layoutLessonFocus(graph, focused);
  return layoutArtifactFocus(graph, focused);
}

export function computeVisibleEdges(graph, nodePositions) {
  const visibleIds = new Set(nodePositions.keys());
  return graph.edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
}

export function computeBounds(nodePositions) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodePositions.forEach((node) => {
    const hw = (NODE_SIZES[node.type]?.w || 160) / 2;
    const hh = (NODE_SIZES[node.type]?.h || 48) / 2;
    minX = Math.min(minX, node.wx - hw);
    minY = Math.min(minY, node.wy - hh);
    maxX = Math.max(maxX, node.wx + hw);
    maxY = Math.max(maxY, node.wy + hh);
  });
  if (minX === Infinity) return { minX: 0, minY: 0, maxX: 900, maxY: 600, width: 900, height: 600 };
  return { minX, minY, maxX, maxY, width: maxX - minX + 240, height: maxY - minY + 220 };
}
