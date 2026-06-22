/**
 * NV-900-Graph-Polish — Knowledge Graph SVG Renderer (Iteration 2)
 *
 * Premium rendering with:
 *  - Hierarchical node sizing (path largest → artifact smallest)
 *  - Smooth CSS transitions on all position/opacity changes
 *  - Focus-mode dimming with lineage highlight
 *  - Wheel zoom around cursor, drag pan, touch pan
 *  - Adaptive labels (zoom-dependent abbreviation)
 *  - Gradient glow halos on selected/focused nodes
 */

import { NODE_SIZES } from './knowledge-graph-layout.js';

const COLORS = {
  path:     { fill: '#141b2d', stroke: '#89b4fa', text: '#b4d0fc', type: '#5b8fd4', glow: '137,180,250' },
  module:   { fill: '#142018', stroke: '#a6e3a1', text: '#c3edc0', type: '#5ba66a', glow: '166,227,161' },
  lesson:   { fill: '#221e0f', stroke: '#f9e2af', text: '#f5dfa0', type: '#a69040', glow: '249,226,175' },
  artifact: { fill: '#1a1528', stroke: '#cba6f7', text: '#d4bcf5', type: '#8567aa', glow: '203,166,247' },
};

const TYPE_LABELS = { path: 'LEARNING PATH', module: 'MODULE', lesson: 'LESSON', artifact: 'ARTIFACT' };

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function truncate(s, n) {
  s = String(s || '');
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// ── Node builder ────────────────────────────────────────────────────────────

function buildNodeGroup(node) {
  const { w, h } = NODE_SIZES[node.type] || NODE_SIZES.lesson;
  const c = COLORS[node.type] || COLORS.artifact;
  const hw = w / 2, hh = h / 2;
  const rx = node.type === 'path' ? 18 : node.type === 'module' ? 14 : node.type === 'lesson' ? 12 : 8;

  const g = svgEl('g', {
    class: `nv-kg-node nv-kg-node--${node.type}`,
    'data-node-id': node.id,
    'data-type': node.type,
    tabindex: '0',
    role: 'button',
    'aria-label': `${TYPE_LABELS[node.type]}: ${node.title}`,
    'aria-pressed': 'false',
  });

  // Outer glow (visible on select/hover)
  g.append(svgEl('rect', {
    class: 'nv-kg-node-glow',
    x: -hw - 8, y: -hh - 8, width: w + 16, height: h + 16, rx: rx + 6,
    fill: 'none', stroke: c.stroke,
  }));

  // Main card rect
  const rect = svgEl('rect', {
    class: 'nv-kg-node-shape',
    x: -hw, y: -hh, width: w, height: h, rx,
    fill: c.fill, stroke: c.stroke,
  });
  g.append(rect);

  // Type label (top-left inside card)
  if (node.type !== 'artifact') {
    const typeEl = svgEl('text', {
      class: 'nv-kg-node-type',
      x: -hw + 14, y: -hh + 17, 'text-anchor': 'start',
    });
    typeEl.textContent = TYPE_LABELS[node.type];
    typeEl.style.fill = c.type;
    g.append(typeEl);
  }

  // Title (centered or left-aligned based on type)
  const maxChars = node.type === 'path' ? 30 : node.type === 'module' ? 24 : node.type === 'lesson' ? 20 : 16;
  const titleEl = svgEl('text', {
    class: `nv-kg-node-title nv-kg-node-title--${node.type}`,
    x: node.type === 'artifact' ? 0 : -hw + 14,
    y: node.type === 'path' ? hh - 20 : node.type === 'module' ? hh - 14 :
       node.type === 'artifact' ? 5 : hh - 10,
    'text-anchor': node.type === 'artifact' ? 'middle' : 'start',
  });
  titleEl.textContent = truncate(node.title, maxChars);
  titleEl.style.fill = c.text;
  g.append(titleEl);

  // Child count badge (for expandable nodes)
  if (node._childCount > 0) {
    const badgeBg = svgEl('rect', {
      class: 'nv-kg-count-badge',
      x: hw - 42, y: -hh + 6, width: 34, height: 18, rx: 9,
      fill: 'rgba(255,255,255,0.06)', stroke: c.stroke,
    });
    const badgeText = svgEl('text', {
      class: 'nv-kg-count-text',
      x: hw - 25, y: -hh + 19, 'text-anchor': 'middle',
    });
    badgeText.textContent = node._expanded ? '−' : `+${node._childCount}`;
    badgeText.style.fill = c.text;
    g.append(badgeBg, badgeText);
  }

  // Status indicator
  if (node.status === 'Reviewed') {
    g.append(svgEl('circle', {
      cx: hw - 10, cy: hh - 10, r: 4,
      class: 'nv-kg-badge--reviewed',
    }));
  }

  return g;
}

// ── Edge builder ────────────────────────────────────────────────────────────

function buildEdgePath(srcNode, tgtNode) {
  const sh = (NODE_SIZES[srcNode.type]?.h || 48) / 2;
  const th = (NODE_SIZES[tgtNode.type]?.h || 48) / 2;
  const x1 = srcNode.wx, y1 = srcNode.wy + sh;
  const x2 = tgtNode.wx, y2 = tgtNode.wy - th;
  const cy1 = y1 + (y2 - y1) * 0.4;
  const cy2 = y1 + (y2 - y1) * 0.6;

  return svgEl('path', {
    class: 'nv-kg-edge',
    d: `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`,
    'data-edge-src': srcNode.id,
    'data-edge-tgt': tgtNode.id,
    fill: 'none',
  });
}

// ── Renderer class ──────────────────────────────────────────────────────────

export class KnowledgeGraphRenderer {
  constructor(container, handlers) {
    this.container = container;
    this.handlers = handlers;
    this.transform = { x: 0, y: 0, k: 1 };
    this._isPanning = false;
    this._panStart = { x: 0, y: 0 };
    this._nodeEls = new Map();
    this._mouseMoveHandler = null;
    this._mouseUpHandler = null;
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
    this.world.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
    this.world.style.transformOrigin = '0 0';
    this.world.setAttribute('transform', `translate(${x} ${y}) scale(${k})`);
    this.svg.dataset.zoom = k < 0.32 ? 'far' : k < 0.72 ? 'medium' : 'near';
  }

  _attachInteraction() {
    const svg = this.svg;

    // Wheel zoom
    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.91;
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { x, y, k } = this.transform;
      const newK = Math.max(0.08, Math.min(3, k * factor));
      this.transform = {
        x: mx - (mx - x) * (newK / k),
        y: my - (my - y) * (newK / k),
        k: newK,
      };
      this._applyTransform();
    }, { passive: false });

    // Drag pan
    svg.addEventListener('mousedown', e => {
      if (e.button !== 0 || e.target.closest('[data-node-id]')) return;
      this._isPanning = true;
      this._panStart = { x: e.clientX - this.transform.x, y: e.clientY - this.transform.y };
      svg.style.cursor = 'grabbing';
      e.preventDefault();
    });
    this._mouseMoveHandler = e => {
      if (!this._isPanning) return;
      this.transform.x = e.clientX - this._panStart.x;
      this.transform.y = e.clientY - this._panStart.y;
      this._applyTransform();
    };
    this._mouseUpHandler = () => {
      if (!this._isPanning) return;
      this._isPanning = false;
      svg.style.cursor = 'grab';
    };
    window.addEventListener('mousemove', this._mouseMoveHandler);
    window.addEventListener('mouseup', this._mouseUpHandler);

    // Touch pan
    let lastTouch = null;
    svg.addEventListener('touchstart', e => {
      if (e.touches.length === 1) lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    svg.addEventListener('touchmove', e => {
      if (!lastTouch || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastTouch.x;
      const dy = e.touches[0].clientY - lastTouch.y;
      this.transform.x += dx;
      this.transform.y += dy;
      this._applyTransform();
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    // Click / dblclick delegation
    this.world.addEventListener('click', e => {
      const nodeEl = e.target.closest('[data-node-id]');
      if (nodeEl) this.handlers.selectNode(nodeEl.dataset.nodeId);
      else this.handlers.clearSelection();
    });
    this.world.addEventListener('dblclick', e => {
      const nodeEl = e.target.closest('[data-node-id]');
      if (nodeEl) this.handlers.centerNode(nodeEl.dataset.nodeId);
    });

    // Keyboard
    this.world.addEventListener('keydown', e => {
      const nodeEl = e.target.closest('[data-node-id]');
      if (!nodeEl) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); this.handlers.selectNode(nodeEl.dataset.nodeId);
      }
      if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); this.handlers.moveFocus(1); }
      if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); this.handlers.moveFocus(-1); }
    });
  }

  // ── Render / Update ──────────────────────────────────────────────────────

  render(nodePositions, edges) {
    this._nodeEls.clear();
    this.edgeLayer.innerHTML = '';
    this.nodeLayer.innerHTML = '';

    edges.forEach(edge => {
      const src = nodePositions.get(edge.source);
      const tgt = nodePositions.get(edge.target);
      if (src && tgt) this.edgeLayer.append(buildEdgePath(src, tgt));
    });

    nodePositions.forEach(node => {
      const g = buildNodeGroup(node);
      g.setAttribute('transform', `translate(${node.wx},${node.wy})`);
      g.dataset.wx = String(node.wx);
      g.dataset.wy = String(node.wy);
      g.dataset.w = String(NODE_SIZES[node.type]?.w || NODE_SIZES.lesson.w);
      g.dataset.h = String(NODE_SIZES[node.type]?.h || NODE_SIZES.lesson.h);
      this._nodeEls.set(node.id, g);
      this.nodeLayer.append(g);
    });
  }

  update(nodePositions, edges) {
    // Full re-render (cheap enough for <200 visible nodes)
    this.render(nodePositions, edges);
  }

  // ── Focus mode ──────────────────────────────────────────────────────────

  applyFocus(selectedId, neighborIds) {
    this._nodeEls.forEach((el, id) => {
      el.classList.remove('is-selected', 'is-neighbor', 'is-dim');
      el.setAttribute('aria-pressed', 'false');
      if (!selectedId) return;
      if (id === selectedId) { el.classList.add('is-selected'); el.setAttribute('aria-pressed', 'true'); }
      else if (neighborIds.has(id)) el.classList.add('is-neighbor');
      else el.classList.add('is-dim');
    });
    this.edgeLayer.querySelectorAll('.nv-kg-edge').forEach(edge => {
      edge.classList.remove('is-active', 'is-dim');
      if (!selectedId) return;
      const active = edge.dataset.edgeSrc === selectedId || edge.dataset.edgeTgt === selectedId;
      edge.classList.add(active ? 'is-active' : 'is-dim');
    });
  }

  // ── Camera ──────────────────────────────────────────────────────────────

  fitAll(bounds) {
    const sw = this.svg.clientWidth || 1000;
    const sh = this.svg.clientHeight || 600;
    const scaleX = (sw - 100) / bounds.width;
    const scaleY = (sh - 100) / bounds.height;
    const k = Math.max(0.18, Math.min(1.0, Math.min(scaleX, scaleY)));
    this.transform = {
      x: (sw - bounds.width * k) / 2 - bounds.minX * k,
      y: (sh - bounds.height * k) / 2 - bounds.minY * k,
      k,
    };
    this._applyTransform();
  }

  centerOn(nodeId, nodePositions, zoomIn = false) {
    const node = nodePositions.get(nodeId);
    if (!node) return;
    const sw = this.svg.clientWidth || 1000;
    const sh = this.svg.clientHeight || 600;
    const targetK = zoomIn ? Math.max(this.transform.k, node.type === 'path' ? 0.95 : node.type === 'module' ? 1.15 : 1.35) : this.transform.k;
    const k = Math.min(2.2, targetK);
    this.transform.k = k;
    this.transform.x = sw / 2 - node.wx * k;
    this.transform.y = sh / 2 - node.wy * k;
    this._applyTransform();
  }

  zoomBy(factor) {
    const sw = this.svg.clientWidth || 1000;
    const sh = this.svg.clientHeight || 600;
    const { x, y, k } = this.transform;
    const newK = Math.max(0.08, Math.min(3, k * factor));
    const cx = sw / 2, cy = sh / 2;
    this.transform = {
      x: cx - (cx - x) * (newK / k),
      y: cy - (cy - y) * (newK / k),
      k: newK,
    };
    this._applyTransform();
  }

  panBy(dx, dy) {
    this.transform.x += dx;
    this.transform.y += dy;
    this._applyTransform();
  }

  destroy() {
    if (this._mouseMoveHandler) window.removeEventListener('mousemove', this._mouseMoveHandler);
    if (this._mouseUpHandler) window.removeEventListener('mouseup', this._mouseUpHandler);
    this.container.innerHTML = '';
  }

  focusNodeEl(nodeId) {
    const el = this._nodeEls.get(nodeId);
    if (el) el.focus();
  }

  pulseNode(nodeId) {
    const el = this._nodeEls.get(nodeId);
    if (!el) return;
    el.classList.remove('is-pulsing');
    void el.getBoundingClientRect();
    el.classList.add('is-pulsing');
    window.setTimeout(() => el.classList.remove('is-pulsing'), 1100);
  }

  getVisibleNodeIds() {
    return [...this._nodeEls.keys()];
  }
}
