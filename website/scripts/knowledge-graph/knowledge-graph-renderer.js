/**
 * NV-900-UIX — Knowledge Graph SVG Renderer
 *
 * Design principles:
 *  - Single SVG element; pan/zoom via CSS transform on a world <g> (no viewBox changes)
 *  - Incremental DOM updates (reuse elements, patch attributes)
 *  - Focus mode via CSS class toggling (opacity handled in CSS)
 *  - Mouse-wheel zoom and click-drag pan built in
 *  - Semantic coloring and adaptive node sizing by type
 */

import { NODE_SIZES } from './knowledge-graph-layout.js';

// ── Colour tokens (inline fallbacks for SVG context) ────────────────────────
const COLORS = {
  path:     { fill: 'rgba(30,30,60,0.95)',  stroke: '#89b4fa', label: '#89b4fa', typeText: '#4e8fdb' },
  module:   { fill: 'rgba(20,40,30,0.95)',  stroke: '#a6e3a1', label: '#a6e3a1', typeText: '#4a8c60' },
  lesson:   { fill: 'rgba(40,35,15,0.95)',  stroke: '#f9e2af', label: '#f9e2af', typeText: '#9c7c2e' },
  artifact: { fill: 'rgba(30,25,45,0.95)',  stroke: '#cba6f7', label: '#cba6f7', typeText: '#7a5fa8' },
};

const TYPE_LABELS = { path: 'LEARNING PATH', module: 'MODULE', lesson: 'LESSON', artifact: 'ARTIFACT' };

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// ── Node shape builders ───────────────────────────────────────────────────────

function buildNodeGroup(node) {
  const { w, h } = NODE_SIZES[node.type] || NODE_SIZES.lesson;
  const c = COLORS[node.type] || COLORS.artifact;
  const hw = w / 2, hh = h / 2;
  const rx = node.type === 'artifact' ? 8 : node.type === 'lesson' ? 10 : 14;

  const g = svgEl('g', {
    class: `nv-kg-node nv-kg-node--${node.type}`,
    'data-node-id': node.id,
    'data-type': node.type,
    tabindex: '0',
    role: 'button',
    'aria-label': `${TYPE_LABELS[node.type] || node.type}: ${node.title}`,
    'aria-pressed': 'false',
  });

  // Glow (shown on select / hover via CSS)
  const glow = svgEl('rect', {
    class: 'nv-kg-node-glow',
    x: -hw - 6, y: -hh - 6, width: w + 12, height: h + 12, rx: rx + 4,
  });
  glow.style.fill = 'none';
  glow.style.stroke = c.stroke;

  // Main card
  const rect = svgEl('rect', {
    class: 'nv-kg-node-shape',
    x: -hw, y: -hh, width: w, height: h, rx,
  });
  rect.style.fill = c.fill;
  rect.style.stroke = c.stroke;

  // Type label
  const typeEl = svgEl('text', {
    class: 'nv-kg-node-type',
    x: 0, y: node.type === 'artifact' ? -6 : -hh + 13,
    'text-anchor': 'middle',
  });
  typeEl.textContent = node.type === 'artifact' ? '' : TYPE_LABELS[node.type];
  typeEl.style.fill = c.typeText;

  // Title
  const maxChars = node.type === 'path' ? 26 : node.type === 'module' ? 22 : node.type === 'lesson' ? 18 : 16;
  const titleEl = svgEl('text', {
    class: 'nv-kg-node-title',
    x: 0,
    y: node.type === 'path' ? hh - 16 : node.type === 'artifact' ? 10 : hh - 11,
    'text-anchor': 'middle',
  });
  titleEl.textContent = truncate(node.title, maxChars);
  titleEl.style.fill = c.label;

  g.append(glow, rect, typeEl, titleEl);

  // Expand/collapse indicator for expandable nodes (module/lesson)
  if (node.type === 'module' || node.type === 'lesson') {
    const indicator = svgEl('text', {
      class: 'nv-kg-node-expand',
      x: hw - 14, y: 5,
      'text-anchor': 'middle',
    });
    indicator.style.fill = c.label;
    indicator.dataset.expandIndicator = node.id;
    g.append(indicator);
  }

  // Status dot
  if (node.status === 'Reviewed') {
    g.append(svgEl('circle', {
      cx: hw - 9, cy: -hh + 9, r: 4,
      class: 'nv-kg-badge--reviewed',
    }));
  }

  return g;
}

function buildEdgePath(srcNode, tgtNode) {
  const srcHH = (NODE_SIZES[srcNode.type]?.h || 48) / 2;
  const tgtHH = (NODE_SIZES[tgtNode.type]?.h || 48) / 2;
  const x1 = srcNode.wx, y1 = srcNode.wy + srcHH;
  const x2 = tgtNode.wx, y2 = tgtNode.wy - tgtHH;
  const cy = (y1 + y2) / 2;

  const path = svgEl('path', {
    class: `nv-kg-edge nv-kg-edge--contains`,
    d: `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`,
    'data-edge-src': srcNode.id,
    'data-edge-tgt': tgtNode.id,
    tabindex: '-1',
    fill: 'none',
  });
  return path;
}

// ── Renderer class ────────────────────────────────────────────────────────────

export class KnowledgeGraphRenderer {
  constructor(container, handlers) {
    this.container = container;
    this.handlers = handlers;
    this.transform = { x: 60, y: 60, k: 1 };
    this._isPanning = false;
    this._panStart = { x: 0, y: 0 };
    this._nodeEls = new Map();   // id → SVGGElement
    this._edgeEls = new Map();   // `src-tgt` → SVGPathElement
    this._build();
  }

  _build() {
    this.container.innerHTML = '';

    this.svg = svgEl('svg', {
      class: 'nv-kg-svg',
      role: 'graphics-document',
      'aria-label': 'Interactive curriculum knowledge graph',
      tabindex: '0',
    });
    this.svg.style.cursor = 'grab';

    // World group receives pan/zoom transform
    this.world = svgEl('g', { class: 'nv-kg-world' });
    this.edgeLayer = svgEl('g', { class: 'nv-kg-edge-layer' });
    this.nodeLayer = svgEl('g', { class: 'nv-kg-node-layer' });
    this.world.append(this.edgeLayer, this.nodeLayer);
    this.svg.append(this.world);
    this.container.append(this.svg);

    this._attachInteraction();
  }

  _applyTransform() {
    const { x, y, k } = this.transform;
    this.world.setAttribute('transform', `translate(${x},${y}) scale(${k})`);
  }

  _attachInteraction() {
    const svg = this.svg;

    // Wheel zoom (zoom around cursor)
    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { x, y, k } = this.transform;
      const newK = Math.max(0.15, Math.min(4, k * factor));
      this.transform = {
        x: mx - (mx - x) * (newK / k),
        y: my - (my - y) * (newK / k),
        k: newK,
      };
      this._applyTransform();
    }, { passive: false });

    // Click-drag pan
    svg.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      // Don't start pan if clicking a node
      if (e.target.closest('[data-node-id]')) return;
      this._isPanning = true;
      this._panStart = { x: e.clientX - this.transform.x, y: e.clientY - this.transform.y };
      svg.style.cursor = 'grabbing';
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!this._isPanning) return;
      this.transform.x = e.clientX - this._panStart.x;
      this.transform.y = e.clientY - this._panStart.y;
      this._applyTransform();
    });
    window.addEventListener('mouseup', () => {
      if (!this._isPanning) return;
      this._isPanning = false;
      svg.style.cursor = 'grab';
    });

    // Touch pan (single finger)
    let lastTouch = null;
    svg.addEventListener('touchstart', e => {
      if (e.touches.length === 1) lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    svg.addEventListener('touchmove', e => {
      if (e.touches.length !== 1 || !lastTouch) return;
      const dx = e.touches[0].clientX - lastTouch.x;
      const dy = e.touches[0].clientY - lastTouch.y;
      this.transform.x += dx;
      this.transform.y += dy;
      this._applyTransform();
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    // Click delegation on world group
    this.world.addEventListener('click', e => {
      const nodeEl = e.target.closest('[data-node-id]');
      if (nodeEl) {
        this.handlers.selectNode(nodeEl.dataset.nodeId);
      } else {
        this.handlers.clearSelection();
      }
    });

    // Double-click centers on node
    this.world.addEventListener('dblclick', e => {
      const nodeEl = e.target.closest('[data-node-id]');
      if (nodeEl) this.handlers.centerNode(nodeEl.dataset.nodeId);
    });

    // Keyboard on node elements (delegated via world)
    this.world.addEventListener('keydown', e => {
      const nodeEl = e.target.closest('[data-node-id]');
      if (!nodeEl) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handlers.selectNode(nodeEl.dataset.nodeId);
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.handlers.moveFocus(1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.handlers.moveFocus(-1);
      }
    });
  }

  // ── Full render (first load or major layout change) ───────────────────────

  render(nodePositions, edges) {
    this._nodeEls.clear();
    this._edgeEls.clear();
    this.edgeLayer.innerHTML = '';
    this.nodeLayer.innerHTML = '';

    // Edges first (below nodes)
    edges.forEach(edge => {
      const src = nodePositions.get(edge.source);
      const tgt = nodePositions.get(edge.target);
      if (!src || !tgt) return;
      const pathEl = buildEdgePath(src, tgt);
      this._edgeEls.set(`${edge.source}-${edge.target}`, pathEl);
      this.edgeLayer.append(pathEl);
    });

    // Nodes
    nodePositions.forEach(node => {
      const g = buildNodeGroup(node);
      g.setAttribute('transform', `translate(${node.wx},${node.wy})`);
      this._nodeEls.set(node.id, g);
      this.nodeLayer.append(g);
    });
  }

  // ── Incremental update (expand/collapse) ─────────────────────────────────

  update(nodePositions, edges) {
    const seenNodes = new Set();
    const seenEdges = new Set();

    // Add/update nodes
    nodePositions.forEach(node => {
      seenNodes.add(node.id);
      let g = this._nodeEls.get(node.id);
      if (!g) {
        g = buildNodeGroup(node);
        this._nodeEls.set(node.id, g);
        this.nodeLayer.append(g);
      }
      g.setAttribute('transform', `translate(${node.wx},${node.wy})`);
    });

    // Remove stale nodes
    this._nodeEls.forEach((el, id) => {
      if (!seenNodes.has(id)) { el.remove(); this._nodeEls.delete(id); }
    });

    // Rebuild edges (cheap — edges are simpler)
    this.edgeLayer.innerHTML = '';
    this._edgeEls.clear();
    edges.forEach(edge => {
      const src = nodePositions.get(edge.source);
      const tgt = nodePositions.get(edge.target);
      if (!src || !tgt) return;
      const pathEl = buildEdgePath(src, tgt);
      const key = `${edge.source}-${edge.target}`;
      this._edgeEls.set(key, pathEl);
      seenEdges.add(key);
      this.edgeLayer.append(pathEl);
    });

    // Update expand indicators
    nodePositions.forEach(node => {
      const g = this._nodeEls.get(node.id);
      if (!g) return;
      const ind = g.querySelector('[data-expand-indicator]');
      if (ind) ind.textContent = node._expanded ? '−' : '+';
    });
  }

  // ── Focus mode ────────────────────────────────────────────────────────────

  applyFocus(selectedId, neighborIds) {
    this._nodeEls.forEach((el, id) => {
      el.classList.remove('is-selected', 'is-neighbor', 'is-dim');
      el.removeAttribute('aria-pressed');
      if (!selectedId) return;
      if (id === selectedId) { el.classList.add('is-selected'); el.setAttribute('aria-pressed', 'true'); }
      else if (neighborIds.has(id)) el.classList.add('is-neighbor');
      else el.classList.add('is-dim');
    });
    this._edgeEls.forEach((el, key) => {
      el.classList.remove('is-connected');
      if (selectedId && (key.startsWith(selectedId) || key.endsWith(selectedId))) {
        el.classList.add('is-connected');
      }
    });
  }

  // ── Camera controls ───────────────────────────────────────────────────────

  fitAll(bounds) {
    const svgW = this.svg.clientWidth || 900;
    const svgH = this.svg.clientHeight || 600;
    const scaleX = (svgW - 120) / bounds.width;
    const scaleY = (svgH - 120) / bounds.height;
    const k = Math.max(0.1, Math.min(1.2, Math.min(scaleX, scaleY)));
    this.transform = {
      x: (svgW - bounds.width * k) / 2 - bounds.minX * k,
      y: (svgH - bounds.height * k) / 2 - bounds.minY * k,
      k,
    };
    this._applyTransform();
  }

  centerOn(nodeId, nodePositions) {
    const node = nodePositions.get(nodeId);
    if (!node) return;
    const svgW = this.svg.clientWidth || 900;
    const svgH = this.svg.clientHeight || 600;
    const { k } = this.transform;
    this.transform.x = svgW / 2 - node.wx * k;
    this.transform.y = svgH / 2 - node.wy * k;
    this._applyTransform();
  }

  zoomBy(factor) {
    const svgW = this.svg.clientWidth || 900;
    const svgH = this.svg.clientHeight || 600;
    const { x, y, k } = this.transform;
    const newK = Math.max(0.15, Math.min(4, k * factor));
    const cx = svgW / 2, cy = svgH / 2;
    this.transform = {
      x: cx - (cx - x) * (newK / k),
      y: cy - (cy - y) * (newK / k),
      k: newK,
    };
    this._applyTransform();
  }

  destroy() {
    window.removeEventListener('mousemove', null);
    window.removeEventListener('mouseup', null);
    this.container.innerHTML = '';
  }

  focusNodeEl(nodeId) {
    const el = this._nodeEls.get(nodeId);
    if (el) el.focus();
  }

  getVisibleNodeIds() {
    return [...this._nodeEls.keys()];
  }
}
