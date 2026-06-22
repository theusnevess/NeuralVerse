/**
 * Knowledge Graph SVG Renderer (NV-900-UI10A)
 *
 * Changes from previous version:
 *  - Node width increased to 200px (±100) to accommodate titles
 *  - Two-line text wrapping with ellipsis for long titles
 *  - Count chip nodes for summary placeholder nodes
 *  - Edge rendering: contains = solid, sibling = dashed, dependency = coloured
 *  - Nodes keyboard-focusable with proper aria-labels
 *  - Subtle grid background rendered via SVG pattern (no CSS background-size issues)
 */

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}

/** Wrap a string to at most two lines of maxChars each, then ellipsis */
function wrapTitle(text, maxChars = 22) {
  const words = String(text || '').split(' ');
  const lines = [''];
  words.forEach(word => {
    const last = lines[lines.length - 1];
    if ((last + (last ? ' ' : '') + word).length <= maxChars) {
      lines[lines.length - 1] = last + (last ? ' ' : '') + word;
    } else if (lines.length < 2) {
      lines.push(word);
    } else {
      // Truncate with ellipsis
      if (lines[1].length > maxChars - 1) {
        lines[1] = lines[1].slice(0, maxChars - 1) + '…';
      } else {
        lines[1] = (lines[1] + ' ' + word).slice(0, maxChars - 1) + '…';
      }
    }
  });
  return lines.filter(Boolean);
}

const NODE_W = 100;   // half-width: rect goes from -NODE_W to +NODE_W
const NODE_H2 = 34;  // half-height: rect goes from -NODE_H2 to +NODE_H2

const TYPE_COLORS = {
  path:     { stroke: 'var(--sys-color-accent-primary, #89b4fa)', label: 'var(--sys-color-accent-primary, #89b4fa)' },
  module:   { stroke: 'var(--ref-color-blue-500, #60a5fa)',        label: 'var(--ref-color-blue-500, #60a5fa)' },
  lesson:   { stroke: 'var(--ref-color-green-500, #4ade80)',       label: 'var(--ref-color-green-500, #4ade80)' },
  artifact: { stroke: 'var(--ref-color-amber-500, #fbbf24)',       label: 'var(--ref-color-amber-500, #fbbf24)' },
};

export function renderGraphSvg(container, layout, state, handlers) {
  container.innerHTML = '';

  if (!layout || !layout.nodes.length) {
    const empty = document.createElement('div');
    empty.className = 'nv-kg-empty-state';
    empty.innerHTML = '<p>No nodes match the current filters. Try enabling more node types or changing the mode.</p>';
    container.append(empty);
    return;
  }

  const vb = state.viewBox;
  const svg = svgEl('svg', {
    class: 'nv-kg-svg',
    role: 'graphics-document',
    'aria-label': 'Deterministic curriculum knowledge graph',
    viewBox: `${vb.x} ${vb.y} ${vb.width} ${vb.height}`,
    tabindex: '0'
  });

  // ── Defs: arrow markers + grid pattern ──────────────────────────────────────
  const defs = svgEl('defs');

  function makeMarker(id, color) {
    const marker = svgEl('marker', {
      id, markerWidth: '9', markerHeight: '9', refX: '8', refY: '4', orient: 'auto'
    });
    const path = svgEl('path', { d: 'M0,0 L9,4 L0,8 Z' });
    path.style.fill = color;
    marker.append(path);
    return marker;
  }

  defs.append(
    makeMarker('nv-kg-arrow-contains', 'rgba(137,180,250,0.55)'),
    makeMarker('nv-kg-arrow-sibling',  'rgba(137,180,250,0.30)'),
    makeMarker('nv-kg-arrow-dep',      'rgba(96,165,250,0.65)'),
    makeMarker('nv-kg-arrow-selected', 'rgba(137,180,250,0.9)')
  );

  // Grid pattern
  const pattern = svgEl('pattern', { id: 'nv-kg-grid-pattern', width: '48', height: '48', patternUnits: 'userSpaceOnUse' });
  const gridLineH = svgEl('line', { x1: '0', y1: '0', x2: '48', y2: '0', stroke: 'rgba(137,180,250,0.08)', 'stroke-width': '1' });
  const gridLineV = svgEl('line', { x1: '0', y1: '0', x2: '0', y2: '48', stroke: 'rgba(137,180,250,0.08)', 'stroke-width': '1' });
  pattern.append(gridLineH, gridLineV);
  defs.append(pattern);

  svg.append(defs);

  // Grid background rect (drawn first so it's behind everything)
  svg.append(svgEl('rect', {
    x: vb.x, y: vb.y, width: vb.width, height: vb.height,
    fill: 'url(#nv-kg-grid-pattern)'
  }));

  // ── Edges ────────────────────────────────────────────────────────────────────
  const nodeById = new Map(layout.nodes.map(n => [n.id, n]));
  const edgeLayer = svgEl('g', { class: 'nv-kg-edge-layer' });

  layout.edges.forEach(edge => {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target) return;

    const isSelected = state.selectedEdgeId === edge.id;
    const sx = source.x + NODE_W;
    const tx = target.x - NODE_W;
    const midX = (sx + tx) / 2;

    let markerEnd = 'url(#nv-kg-arrow-contains)';
    let edgeClass = `nv-kg-edge nv-kg-edge--${edge.type}`;
    if (edge.type === 'sibling') markerEnd = 'url(#nv-kg-arrow-sibling)';
    if (!['contains', 'sibling'].includes(edge.type)) markerEnd = 'url(#nv-kg-arrow-dep)';
    if (isSelected) { markerEnd = 'url(#nv-kg-arrow-selected)'; edgeClass += ' is-selected'; }

    const path = svgEl('path', {
      d: `M ${sx} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${tx} ${target.y}`,
      class: edgeClass,
      'data-edge-id': edge.id,
      tabindex: '0',
      role: 'button',
      'aria-label': `${edge.label}: ${source.title} → ${target.title}`,
      'aria-pressed': String(isSelected),
      'marker-end': markerEnd
    });

    path.addEventListener('click', () => handlers.selectEdge(edge.id));
    path.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlers.selectEdge(edge.id); }
    });
    edgeLayer.append(path);
  });

  svg.append(edgeLayer);

  // ── Nodes ────────────────────────────────────────────────────────────────────
  const nodeLayer = svgEl('g', { class: 'nv-kg-node-layer' });

  layout.nodes.forEach(node => {
    const isSelected = state.selectedNodeId === node.id;
    const isFocus = !!node.focus;
    const colors = TYPE_COLORS[node.type] || TYPE_COLORS.artifact;
    const titleLines = wrapTitle(node.title);

    const group = svgEl('g', {
      class: [
        'nv-kg-node',
        `nv-kg-node--${node.type}`,
        isFocus ? 'is-focus' : '',
        isSelected ? 'is-selected' : ''
      ].filter(Boolean).join(' '),
      transform: `translate(${node.x}, ${node.y})`,
      tabindex: '0',
      role: 'button',
      'data-node-id': node.id,
      'aria-label': `${node.typeLabel}: ${node.title} (${node.status})`,
      'aria-pressed': String(isSelected)
    });

    // Shadow glow for focus/selected
    if (isSelected || isFocus) {
      group.append(svgEl('rect', {
        x: -NODE_W - 4, y: -NODE_H2 - 4,
        width: NODE_W * 2 + 8, height: NODE_H2 * 2 + 8,
        rx: '18',
        class: 'nv-kg-node-glow'
      }));
    }

    // Main rect
    group.append(svgEl('rect', {
      x: -NODE_W, y: -NODE_H2,
      width: NODE_W * 2, height: NODE_H2 * 2,
      rx: '14',
      class: 'nv-kg-node-shape'
    }));

    // Type label (top)
    const typeLabelEl = svgEl('text', {
      x: '0', y: '-14',
      class: 'nv-kg-node-type',
      'text-anchor': 'middle'
    });
    typeLabelEl.textContent = node.typeLabel;
    typeLabelEl.style.fill = colors.label;
    group.append(typeLabelEl);

    // Title line(s)
    if (titleLines.length === 1) {
      const titleEl = svgEl('text', {
        x: '0', y: '8',
        class: 'nv-kg-node-title',
        'text-anchor': 'middle'
      });
      titleEl.textContent = titleLines[0];
      group.append(titleEl);
    } else {
      const line1 = svgEl('text', {
        x: '0', y: '2',
        class: 'nv-kg-node-title',
        'text-anchor': 'middle'
      });
      line1.textContent = titleLines[0];
      const line2 = svgEl('text', {
        x: '0', y: '18',
        class: 'nv-kg-node-title',
        'text-anchor': 'middle'
      });
      line2.textContent = titleLines[1];
      group.append(line1, line2);
    }

    // Status badge dot
    if (node.status === 'Reviewed') {
      group.append(svgEl('circle', { cx: NODE_W - 12, cy: -NODE_H2 + 10, r: '5', class: 'nv-kg-node-badge nv-kg-node-badge--reviewed' }));
    }

    // Viz badge dot
    if (node.metadata?.hasVisualization) {
      group.append(svgEl('circle', { cx: NODE_W - 24, cy: -NODE_H2 + 10, r: '5', class: 'nv-kg-node-badge nv-kg-node-badge--viz' }));
    }

    // Bookmark badge
    if (node.metadata?.bookmarked) {
      group.append(svgEl('circle', { cx: -(NODE_W - 12), cy: -NODE_H2 + 10, r: '5', class: 'nv-kg-node-badge nv-kg-node-badge--bookmark' }));
    }

    group.addEventListener('click', () => handlers.selectNode(node.id));
    group.addEventListener('focus', () => handlers.previewNode(node.id));
    group.addEventListener('mouseenter', () => handlers.previewNode(node.id));
    group.addEventListener('mouseleave', () => handlers.previewNode(''));
    group.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlers.selectNode(node.id); }
      if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) {
        e.preventDefault(); handlers.moveNodeFocus(e.key);
      }
    });

    nodeLayer.append(group);
  });

  svg.append(nodeLayer);
  container.append(svg);
}
