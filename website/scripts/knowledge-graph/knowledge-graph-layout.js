/**
 * NV-900-UIX — Radial Mind Map Layout
 * 
 * Nodes open and close organically. 
 * Root nodes (Paths) are arranged around a central origin.
 * Expanded children branch outwards dynamically based on allocated angle slices.
 */

export const NODE_SIZES = {
  path: { w: 280, h: 80 },
  module: { w: 200, h: 58 },
  lesson: { w: 160, h: 44 },
  artifact: { w: 130, h: 34 },
};

function getChildren(graph, parentId) {
  return graph.edges
    .filter((edge) => edge.type === 'contains' && edge.source === parentId)
    .map((edge) => graph.nodeById.get(edge.target))
    .filter(Boolean);
}

export function computeLayout(graph, state) {
  const positions = new Map();
  const paths = graph.nodes.filter((node) => node.type === 'path');

  // Calculates the visual "weight" (number of leaves) of a subtree to allocate angle space
  function calculateWeight(nodeId) {
    if (!state.expandedNodeIds.has(nodeId)) return 1;
    const children = getChildren(graph, nodeId);
    if (children.length === 0) return 1;
    let weight = 0;
    for (const child of children) {
      weight += calculateWeight(child.id);
    }
    return weight;
  }

  const totalWeight = paths.reduce((sum, p) => sum + calculateWeight(p.id), 0);

  // Radius configuration for each tier
  const LEVEL_RADIUS = {
    path: 1400,      // Distance from center to paths
    module: 450,     // Distance from path to modules
    lesson: 300,     // Distance from module to lessons
    artifact: 240    // Distance from lesson to artifacts
  };

  function placeRadial(node, startAngle, endAngle, currentRadius, centerX, centerY) {
    const angle = (startAngle + endAngle) / 2;
    
    // Smooth angle interpolation for subtrees to push them outwards naturally
    const wx = centerX + Math.cos(angle) * currentRadius;
    const wy = centerY + Math.sin(angle) * currentRadius;

    positions.set(node.id, { 
      ...node, 
      wx, 
      wy,
      _role: state.selectedNodeId === node.id ? 'selected' : 'context'
    });

    if (state.expandedNodeIds.has(node.id)) {
      const children = getChildren(graph, node.id);
      if (children.length > 0) {
        let currentStart = startAngle;
        const totalNodeWeight = calculateWeight(node.id);
        
        // For children, we place them relative to their parent's position to form true branches
        // But to keep the mind map expanding radially without crossing, we keep using the global angle slices
        // but set the origin to the parent's coordinates.
        for (const child of children) {
          const childWeight = calculateWeight(child.id);
          // Distribute angle proportionally to weight
          const childAngleSpan = (childWeight / totalNodeWeight) * (endAngle - startAngle);
          const childEndAngle = currentStart + childAngleSpan;
          
          const radiusOffset = LEVEL_RADIUS[child.type] || 200;
          placeRadial(child, currentStart, childEndAngle, radiusOffset, wx, wy);
          
          currentStart = childEndAngle;
        }
      }
    }
  }

  let currentStart = 0;
  for (const path of paths) {
    const weight = calculateWeight(path.id);
    // Allocate full 360 degrees (2 * PI) proportionally
    const angleSpan = (weight / totalWeight) * Math.PI * 2;
    const endAngle = currentStart + angleSpan;
    
    // Place root paths around a central absolute origin (0,0)
    placeRadial(path, currentStart, endAngle, LEVEL_RADIUS.path, 0, 0);
    
    currentStart = endAngle;
  }

  return positions;
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
  
  // Add padding
  return { minX, minY, maxX, maxY, width: maxX - minX + 400, height: maxY - minY + 400 };
}
