/**
 * Knowledge Graph Layout Engine (NV-900-UI10A)
 *
 * Root cause of previous collapse:
 *   - All nodes of each type were assigned the same x column (TYPE_X).
 *   - Y positions were computed independently per type with gap * index,
 *     producing 15,898px of height for 120 lessons at 132px gap.
 *   - fitView() then tried to compress this into a 720px viewBox.
 *   - The result was all nodes visually collapsed into an unreadable vertical strip.
 *
 * Strategy (Overview):
 *   - Group paths into rows (max PATHS_PER_ROW per row).
 *   - Within each path group block: Path node left, Modules center, Lessons right.
 *   - Each group block has independent vertical space derived from its content.
 *   - Artifacts hidden by default; shown only in focused/neighborhood modes.
 *
 * Strategy (Focused/Neighborhood):
 *   - Use the same layered approach but scoped to the relevant subgraph.
 *   - Focus node is visually centered.
 */

// Layout constants
const PATHS_PER_ROW = 3;           // paths arranged in a grid row
const COL_GAP = 320;               // horizontal gap between hierarchy columns (px)
const PATH_COL_X = 120;            // x of path node within its group block
const MODULE_COL_X = PATH_COL_X + COL_GAP;   // 440
const LESSON_COL_X = MODULE_COL_X + COL_GAP; // 760
const ARTIFACT_COL_X = LESSON_COL_X + COL_GAP; // 1080

const NODE_H = 64;                 // node height (matches renderer rect height 62 + margin)
const LESSON_V_GAP = 80;           // vertical gap between lessons within a module
const MODULE_V_GAP = 40;           // extra gap between sibling module groups
const PATH_ROW_GAP = 80;           // vertical gap between path grid rows
const GROUP_BLOCK_PAD_Y = 48;      // top padding within each path group block

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sortByTitle(nodes) {
  return [...nodes].sort((a, b) => (a.lineage.labels || []).join('/').localeCompare((b.lineage.labels || []).join('/')) || a.title.localeCompare(b.title));
}

/**
 * Build layout result object.
 */
function layoutResult(nodes, edges) {
  const maxX = nodes.reduce((m, n) => Math.max(m, n.x), 0);
  const maxY = nodes.reduce((m, n) => Math.max(m, n.y), 0);
  return {
    nodes,
    edges,
    width: Math.max(900, maxX + 240),
    height: Math.max(560, maxY + 120)
  };
}

// ─── Overview Mode ─────────────────────────────────────────────────────────────

/**
 * Lays out path/module/lesson nodes grouped by curriculum hierarchy.
 * Paths are arranged in a grid (PATHS_PER_ROW columns), each with its modules
 * and lessons positioned in sub-columns to the right.
 *
 * Artifacts are excluded unless showArtifacts=true.
 */
export function layoutOverviewGraph(graph, showArtifacts = false) {
  const paths = sortByTitle(graph.nodes.filter(n => n.type === 'path'));
  const laidOutNodes = [];
  const seenIds = new Set();

  // Compute a bounding height for one path group (path + all its modules + lessons)
  function groupBlockHeight(path) {
    const moduleItems = (path.lineage ? [] : []).concat(
      [...(graph.moduleById ? graph.moduleById.values() : [])]
        .filter(m => {
          const pathNode = graph.nodeById?.get(path.id);
          return pathNode && graph.parentPathByModule?.get(m.id)?.id === path.id;
        })
    );

    // Walk graph model to find modules belonging to this path
    const pathModuleIds = [];
    graph.edges.forEach(e => {
      if (e.type === 'contains' && e.source === path.id) pathModuleIds.push(e.target);
    });

    let totalH = GROUP_BLOCK_PAD_Y;
    pathModuleIds.forEach(mid => {
      const moduleLessonIds = [];
      graph.edges.forEach(e => {
        if (e.type === 'contains' && e.source === mid) moduleLessonIds.push(e.target);
      });
      const lessonCount = Math.max(1, moduleLessonIds.length);
      totalH += lessonCount * LESSON_V_GAP + MODULE_V_GAP;
    });
    return Math.max(NODE_H + GROUP_BLOCK_PAD_Y * 2, totalH + GROUP_BLOCK_PAD_Y);
  }

  // Arrange paths in rows of PATHS_PER_ROW
  let currentRowY = 60;

  for (let rowStart = 0; rowStart < paths.length; rowStart += PATHS_PER_ROW) {
    const rowPaths = paths.slice(rowStart, rowStart + PATHS_PER_ROW);

    // Find max group block height in this row
    let rowHeight = 0;
    rowPaths.forEach(p => { rowHeight = Math.max(rowHeight, groupBlockHeight(p)); });
    rowHeight = Math.max(rowHeight, 200);

    rowPaths.forEach((pathNode, colIndex) => {
      // Each path occupies a horizontal band
      const groupOffsetX = colIndex * (ARTIFACT_COL_X + 240); // wide block per path
      const pathX = groupOffsetX + PATH_COL_X;
      const pathCenterY = currentRowY + rowHeight / 2;

      if (!seenIds.has(pathNode.id)) {
        laidOutNodes.push({ ...pathNode, x: pathX, y: pathCenterY, focus: false });
        seenIds.add(pathNode.id);
      }

      // Collect modules for this path
      const moduleIds = [];
      graph.edges.forEach(e => {
        if (e.type === 'contains' && e.source === pathNode.id) moduleIds.push(e.target);
      });
      const moduleNodes = moduleIds.map(id => graph.nodeById.get(id)).filter(Boolean);

      // Position modules vertically centered in the path group block
      const totalModuleArea = rowHeight - GROUP_BLOCK_PAD_Y * 2;
      const moduleSpacing = moduleNodes.length > 1
        ? Math.min(LESSON_V_GAP * 3, totalModuleArea / (moduleNodes.length - 1))
        : 0;
      const moduleStartY = moduleNodes.length > 1
        ? currentRowY + GROUP_BLOCK_PAD_Y + (totalModuleArea - moduleSpacing * (moduleNodes.length - 1)) / 2
        : pathCenterY;

      moduleNodes.forEach((moduleNode, mi) => {
        const moduleX = groupOffsetX + MODULE_COL_X;
        const moduleY = moduleStartY + mi * moduleSpacing;

        if (!seenIds.has(moduleNode.id)) {
          laidOutNodes.push({ ...moduleNode, x: moduleX, y: moduleY, focus: false });
          seenIds.add(moduleNode.id);
        }

        // Collect lessons for this module
        const lessonIds = [];
        graph.edges.forEach(e => {
          if (e.type === 'contains' && e.source === moduleNode.id) lessonIds.push(e.target);
        });
        const lessonNodes = lessonIds.map(id => graph.nodeById.get(id)).filter(Boolean);

        const totalLessonH = Math.max(0, (lessonNodes.length - 1)) * LESSON_V_GAP;
        const lessonStartY = moduleY - totalLessonH / 2;

        lessonNodes.forEach((lessonNode, li) => {
          const lessonX = groupOffsetX + LESSON_COL_X;
          const lessonY = lessonStartY + li * LESSON_V_GAP;

          if (!seenIds.has(lessonNode.id)) {
            laidOutNodes.push({ ...lessonNode, x: lessonX, y: lessonY, focus: false });
            seenIds.add(lessonNode.id);
          }

          // Optionally show artifacts
          if (showArtifacts) {
            const artifactIds = [];
            graph.edges.forEach(e => {
              if (e.type === 'contains' && e.source === lessonNode.id) artifactIds.push(e.target);
            });
            const artifactNodes = artifactIds.map(id => graph.nodeById.get(id)).filter(Boolean);
            const artStartY = lessonY - ((artifactNodes.length - 1) * 60) / 2;
            artifactNodes.forEach((artNode, ai) => {
              if (!seenIds.has(artNode.id)) {
                laidOutNodes.push({ ...artNode, x: groupOffsetX + ARTIFACT_COL_X, y: artStartY + ai * 60, focus: false });
                seenIds.add(artNode.id);
              }
            });
          }
        });
      });
    });

    currentRowY += rowHeight + PATH_ROW_GAP;
  }

  // Filter edges to only visible nodes
  const visibleIds = new Set(laidOutNodes.map(n => n.id));
  const edges = graph.edges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target));

  return layoutResult(laidOutNodes, edges);
}

// ─── Focused Lesson Mode ────────────────────────────────────────────────────────

/**
 * Lesson-focused layout:
 *   Path (left) → Module (center-left) → Selected Lesson (center) →
 *   Artifacts (right) + Sibling Lessons (below lesson column)
 */
export function layoutFocusedLessonGraph(graph, lessonId) {
  const lesson = graph.nodeById.get(lessonId) || graph.nodes.find(n => n.type === 'lesson');
  if (!lesson) return layoutResult([], []);

  const ids = new Set([lesson.id, lesson.lineage.pathId, lesson.lineage.moduleId].filter(Boolean));
  const lessonItem = graph.lessonById?.get(lesson.id);
  (lessonItem?.artifactIds || []).forEach(id => ids.add(id));

  // Sibling lessons (same module)
  const moduleItem = graph.moduleById?.get(lesson.lineage.moduleId);
  (moduleItem?.lessonIds || []).forEach(id => ids.add(id));

  // Dependency edges
  graph.edges.forEach(e => {
    if (ids.has(e.source) || ids.has(e.target)) { ids.add(e.source); ids.add(e.target); }
  });

  const nodes = [...ids].map(id => graph.nodeById.get(id)).filter(Boolean);
  return _layerLayout(nodes, graph.edges, lesson.id, graph);
}

// ─── Artifact Neighborhood Mode ──────────────────────────────────────────────

/**
 * Artifact-neighborhood layout:
 *   Path → Module → Lesson → Selected Artifact (focus center)
 *   + sibling artifacts + dependency artifacts around perimeter
 */
export function layoutArtifactNeighborhoodGraph(graph, artifactId) {
  const artifact = graph.nodeById.get(artifactId) || graph.nodes.find(n => n.type === 'artifact');
  if (!artifact) return layoutResult([], []);

  const ids = new Set([artifact.id, artifact.lineage.lessonId, artifact.lineage.moduleId, artifact.lineage.pathId].filter(Boolean));
  const lessonItem = graph.lessonById?.get(artifact.lineage.lessonId);
  (lessonItem?.artifactIds || []).forEach(id => ids.add(id)); // siblings

  graph.edges.forEach(e => {
    if (ids.has(e.source) || ids.has(e.target)) { ids.add(e.source); ids.add(e.target); }
  });

  const nodes = [...ids].map(id => graph.nodeById.get(id)).filter(Boolean);
  return _layerLayout(nodes, graph.edges, artifact.id, graph);
}

// ─── Shared Focused Layout ───────────────────────────────────────────────────

/**
 * Shared layered layout for focused/neighborhood modes.
 * Assigns each node to a column by type; groups by parent within each column.
 * The focus node is vertically centered.
 */
function _layerLayout(nodes, allEdges, focusId, graph) {
  const byType = { path: [], module: [], lesson: [], artifact: [] };
  nodes.forEach(n => { if (byType[n.type]) byType[n.type].push(n); });

  const columnX = { path: 80, module: 80 + COL_GAP, lesson: 80 + COL_GAP * 2, artifact: 80 + COL_GAP * 3 };
  const laidOut = [];

  // Center-Y anchor: try to keep focus node at y=300
  const FOCUS_Y = 300;

  // For each column, position nodes grouped by parent, focus node centered
  Object.entries(byType).forEach(([type, typeNodes]) => {
    if (!typeNodes.length) return;
    const x = columnX[type];

    // Sort: focus first, then by lineage
    const sorted = [...typeNodes].sort((a, b) => {
      if (a.id === focusId) return -1;
      if (b.id === focusId) return 1;
      return (a.lineage.labels || []).join('/').localeCompare((b.lineage.labels || []).join('/'));
    });

    // Find focus node index
    const focusIdx = sorted.findIndex(n => n.id === focusId);
    const effectiveFocusIdx = focusIdx >= 0 ? focusIdx : 0;
    const startY = FOCUS_Y - effectiveFocusIdx * LESSON_V_GAP;

    sorted.forEach((node, i) => {
      laidOut.push({
        ...node,
        x,
        y: Math.max(60, startY + i * LESSON_V_GAP),
        focus: node.id === focusId
      });
    });
  });

  const visibleIds = new Set(laidOut.map(n => n.id));
  const edges = allEdges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target));
  return layoutResult(laidOut, edges);
}
