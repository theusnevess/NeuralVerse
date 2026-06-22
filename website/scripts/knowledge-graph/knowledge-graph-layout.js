const TYPE_X = { path: 120, module: 380, lesson: 650, artifact: 930 };

function sortNodes(nodes) {
  return [...nodes].sort((a, b) => (a.lineage.labels || []).join(' / ').localeCompare((b.lineage.labels || []).join(' / ')) || a.title.localeCompare(b.title));
}

export function layoutOverviewGraph(graph, includeLessons = true) {
  const nodes = graph.nodes.filter((node) => node.type !== 'artifact' && (includeLessons || node.type !== 'lesson'));
  return layoutLayered(nodes, graph.edges.filter((edge) => nodes.some((node) => node.id === edge.source) && nodes.some((node) => node.id === edge.target)));
}

export function layoutFocusedLessonGraph(graph, lessonId) {
  const lesson = graph.nodeById.get(lessonId) || graph.nodes.find((node) => node.type === 'lesson');
  if (!lesson) return layoutLayered([], []);
  const ids = new Set([lesson.id, lesson.lineage.pathId, lesson.lineage.moduleId].filter(Boolean));
  const lessonItem = graph.lessonById.get(lesson.id);
  (lessonItem?.artifactIds || []).forEach((id) => ids.add(id));
  const moduleItem = graph.moduleById.get(lesson.lineage.moduleId);
  (moduleItem?.lessonIds || []).forEach((id) => ids.add(id));
  (graph.edgesByNodeId.get(lesson.id) || []).forEach((edge) => { ids.add(edge.source); ids.add(edge.target); });
  (lessonItem?.artifactIds || []).forEach((id) => (graph.edgesByNodeId.get(id) || []).forEach((edge) => { ids.add(edge.source); ids.add(edge.target); }));
  const nodes = [...ids].map((id) => graph.nodeById.get(id)).filter(Boolean);
  const edges = graph.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target));
  return layoutLayered(nodes, edges, lesson.id);
}

export function layoutArtifactNeighborhoodGraph(graph, artifactId) {
  const artifact = graph.nodeById.get(artifactId) || graph.nodes.find((node) => node.type === 'artifact');
  if (!artifact) return layoutLayered([], []);
  const ids = new Set([artifact.id, artifact.lineage.lessonId, artifact.lineage.moduleId, artifact.lineage.pathId].filter(Boolean));
  const lessonItem = graph.lessonById.get(artifact.lineage.lessonId);
  (lessonItem?.artifactIds || []).forEach((id) => ids.add(id));
  (graph.edgesByNodeId.get(artifact.id) || []).forEach((edge) => { ids.add(edge.source); ids.add(edge.target); });
  const nodes = [...ids].map((id) => graph.nodeById.get(id)).filter(Boolean);
  const edges = graph.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target));
  return layoutLayered(nodes, edges, artifact.id);
}

function layoutLayered(nodes, edges, focusId = '') {
  const byType = new Map();
  sortNodes(nodes).forEach((node) => {
    if (!byType.has(node.type)) byType.set(node.type, []);
    byType.get(node.type).push(node);
  });
  const laidOutNodes = [];
  byType.forEach((items, type) => {
    const gap = type === 'artifact' ? 118 : 132;
    const startY = Math.max(80, 360 - ((items.length - 1) * gap) / 2);
    items.forEach((node, index) => {
      laidOutNodes.push({ ...node, x: TYPE_X[type] || 120, y: startY + index * gap, focus: node.id === focusId });
    });
  });
  const maxY = laidOutNodes.reduce((max, node) => Math.max(max, node.y), 520);
  const maxX = laidOutNodes.reduce((max, node) => Math.max(max, node.x), 980);
  return { nodes: laidOutNodes, edges, width: maxX + 180, height: maxY + 110 };
}
