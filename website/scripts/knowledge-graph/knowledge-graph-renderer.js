function svgEl(tag, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}

function truncate(value, length = 28) {
  const text = String(value || '');
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

export function renderGraphSvg(container, layout, state, handlers) {
  container.innerHTML = '';
  const svg = svgEl('svg', {
    class: 'nv-kg-svg', role: 'graphics-document', 'aria-label': 'Deterministic curriculum knowledge graph',
    viewBox: `${state.viewBox.x} ${state.viewBox.y} ${state.viewBox.width} ${state.viewBox.height}`,
    tabindex: '0'
  });
  const defs = svgEl('defs');
  const marker = svgEl('marker', { id: 'nv-kg-arrow', markerWidth: '8', markerHeight: '8', refX: '7', refY: '4', orient: 'auto' });
  marker.append(svgEl('path', { d: 'M0,0 L8,4 L0,8 Z', class: 'nv-kg-arrow' }));
  defs.append(marker);
  svg.append(defs);

  const nodeById = new Map(layout.nodes.map((node) => [node.id, node]));
  const edgeLayer = svgEl('g', { class: 'nv-kg-edge-layer' });
  layout.edges.forEach((edge) => {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target) return;
    const midX = (source.x + target.x) / 2;
    const path = svgEl('path', {
      d: `M ${source.x + 62} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x - 62} ${target.y}`,
      class: `nv-kg-edge nv-kg-edge--${edge.type}`,
      'data-edge-id': edge.id,
      tabindex: '0', role: 'button', 'aria-label': `${edge.label}: ${source.title} to ${target.title}`,
      'aria-pressed': String(state.selectedEdgeId === edge.id), 'marker-end': 'url(#nv-kg-arrow)'
    });
    if (state.selectedEdgeId === edge.id) path.classList.add('is-selected');
    path.addEventListener('click', () => handlers.selectEdge(edge.id));
    path.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handlers.selectEdge(edge.id); }
    });
    edgeLayer.append(path);
  });
  svg.append(edgeLayer);

  const nodeLayer = svgEl('g', { class: 'nv-kg-node-layer' });
  layout.nodes.forEach((node) => {
    const group = svgEl('g', {
      class: `nv-kg-node nv-kg-node--${node.type}${node.focus ? ' is-focus' : ''}${state.selectedNodeId === node.id ? ' is-selected' : ''}`,
      transform: `translate(${node.x}, ${node.y})`, tabindex: '0', role: 'button',
      'data-node-id': node.id, 'aria-label': `${node.typeLabel}: ${node.title}`, 'aria-pressed': String(state.selectedNodeId === node.id)
    });
    group.append(svgEl('rect', { x: '-68', y: '-31', width: '136', height: '62', rx: '14', class: 'nv-kg-node-shape' }));
    const type = svgEl('text', { x: '0', y: '-9', class: 'nv-kg-node-type', 'text-anchor': 'middle' });
    type.textContent = node.typeLabel;
    const title = svgEl('text', { x: '0', y: '12', class: 'nv-kg-node-title', 'text-anchor': 'middle' });
    title.textContent = truncate(node.title);
    group.append(type, title);
    if (node.status === 'Reviewed') group.append(svgEl('circle', { cx: '53', cy: '-21', r: '5', class: 'nv-kg-node-badge nv-kg-node-badge--reviewed' }));
    if (node.metadata.hasVisualization) group.append(svgEl('circle', { cx: '38', cy: '-21', r: '5', class: 'nv-kg-node-badge nv-kg-node-badge--viz' }));
    if (node.metadata.bookmarked) group.append(svgEl('circle', { cx: '-53', cy: '-21', r: '5', class: 'nv-kg-node-badge nv-kg-node-badge--bookmark' }));
    group.addEventListener('click', () => handlers.selectNode(node.id));
    group.addEventListener('focus', () => handlers.previewNode(node.id));
    group.addEventListener('mouseenter', () => handlers.previewNode(node.id));
    group.addEventListener('mouseleave', () => handlers.previewNode(''));
    group.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handlers.selectNode(node.id); }
      if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) { event.preventDefault(); handlers.moveNodeFocus(event.key); }
    });
    nodeLayer.append(group);
  });
  svg.append(nodeLayer);
  container.append(svg);
}
