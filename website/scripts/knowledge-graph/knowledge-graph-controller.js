import { hasVisualization } from '../visualizations/visualization-registry.js';
import { buildKnowledgeGraphModel, DEPENDENCY_TYPES } from './knowledge-graph-model.js';
import { computeClusterAnchors, computeLayout, computeVisibleEdges, computeBounds } from './knowledge-graph-layout.js';
import { KnowledgeGraphRenderer } from './knowledge-graph-renderer.js';

function el(tag, cls = '', text = '') {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  return n;
}
function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createKnowledgeGraphController(options = {}) {
  const root = options.root || document;
  let graph = null;
  let renderer = null;
  let clusterAnchors = null;
  let nodePositions = null;
  let visibleEdges = null;
  let routeInitialized = false;

  const state = {
    selectedNodeId: '',
    expandedPaths: new Set(),
    expandedModules: new Set(),
    expandedLessons: new Set(),
  };

  function target() { return root.querySelector('[data-knowledge-graph-root]'); }

  async function ensureGraph() {
    if (graph) return;
    const service = window.NeuralVerse?.curriculum?.service;
    if (!service) throw new Error('Curriculum service unavailable.');
    const index = await service.getIndex();
    graph = buildKnowledgeGraphModel(index, { hasVisualization });
    clusterAnchors = computeClusterAnchors(graph);
  }

  function recomputeLayout() {
    nodePositions = computeLayout(graph, state.expandedPaths, state.expandedModules, state.expandedLessons, clusterAnchors);
    // Annotate child counts and expanded state for renderer
    nodePositions.forEach((node, id) => {
      const childEdges = graph.edges.filter(e => e.type === 'contains' && e.source === id);
      node._childCount = childEdges.length;
      node._expanded = state.expandedPaths.has(id) || state.expandedModules.has(id) || state.expandedLessons.has(id);
    });
    visibleEdges = computeVisibleEdges(graph, nodePositions);
  }

  function getNeighborIds(nodeId) {
    const neighbors = new Set();
    graph.edges.forEach(e => {
      if (e.source === nodeId) neighbors.add(e.target);
      if (e.target === nodeId) neighbors.add(e.source);
    });
    return neighbors;
  }

  // ── Handlers for renderer ────────────────────────────────────────────────
  const handlers = {
    selectNode(nodeId) {
      const node = graph.nodeById.get(nodeId);
      if (!node) return;

      // Toggle expand/collapse one level at a time.
      if (node.type === 'path') {
        if (state.expandedPaths.has(nodeId)) {
          state.expandedPaths.delete(nodeId);
          graph.edges.filter(e => e.type === 'contains' && e.source === nodeId).forEach(e => {
            state.expandedModules.delete(e.target);
            graph.edges.filter(child => child.type === 'contains' && child.source === e.target)
              .forEach(child => state.expandedLessons.delete(child.target));
          });
        } else {
          state.expandedPaths.add(nodeId);
        }
      } else if (node.type === 'module') {
        if (node.lineage?.pathId) state.expandedPaths.add(node.lineage.pathId);
        if (state.expandedModules.has(nodeId)) {
          state.expandedModules.delete(nodeId);
          // Collapse child lessons too
          graph.edges.filter(e => e.type === 'contains' && e.source === nodeId)
            .forEach(e => state.expandedLessons.delete(e.target));
        } else {
          state.expandedModules.add(nodeId);
        }
      } else if (node.type === 'lesson') {
        if (node.lineage?.pathId) state.expandedPaths.add(node.lineage.pathId);
        if (node.lineage?.moduleId) state.expandedModules.add(node.lineage.moduleId);
        state.expandedLessons.has(nodeId)
          ? state.expandedLessons.delete(nodeId)
          : state.expandedLessons.add(nodeId);
      } else if (node.type === 'artifact') {
        if (node.lineage?.pathId) state.expandedPaths.add(node.lineage.pathId);
        if (node.lineage?.moduleId) state.expandedModules.add(node.lineage.moduleId);
        if (node.lineage?.lessonId) state.expandedLessons.add(node.lineage.lessonId);
      }

      recomputeLayout();
      renderer.update(nodePositions, visibleEdges);
      state.selectedNodeId = nodeId;
      renderer.applyFocus(nodeId, getNeighborIds(nodeId));
      renderer.centerOn(nodeId, nodePositions, true);
      renderInspector();
      renderFallback();
    },
    clearSelection() {
      state.selectedNodeId = '';
      renderer.applyFocus('', new Set());
      renderInspector();
    },
    centerNode(nodeId) {
      renderer.centerOn(nodeId, nodePositions);
    },
    moveFocus(delta) {
      const ids = renderer.getVisibleNodeIds();
      const cur = ids.indexOf(state.selectedNodeId);
      const next = Math.max(0, Math.min(ids.length - 1, cur + delta));
      if (ids[next]) { handlers.selectNode(ids[next]); renderer.focusNodeEl(ids[next]); }
    },
  };

  // ── Shell ──────────────────────────────────────────────────────────────────
  function renderShell() {
    const c = target();
    if (!c) return;
    c.innerHTML = `
      <section class="nv-kg" aria-labelledby="nv-kg-title">
        <header class="nv-kg-hero nv-curriculum-hero">
          <div class="nv-stack nv-stack--gap-xs">
            <span class="nv-curriculum-card__kicker">NV-900 Graph Atlas</span>
            <h1 id="nv-kg-title">Knowledge Explorer</h1>
            <p class="nv-muted">Navigate the curriculum as a scientific atlas. Start with Learning Paths, then expand into modules, lessons, and artifacts.</p>
          </div>
          <a class="nv-button" data-variant="secondary" href="#/learning">Open Curriculum</a>
        </header>
        <div class="nv-kg-toolbar" aria-label="Graph controls"></div>
        <div class="nv-kg-workspace">
          <div class="nv-kg-canvas-wrap" data-kg-canvas></div>
          <aside class="nv-kg-inspector" data-kg-inspector aria-label="Node details"></aside>
        </div>
        <section class="nv-kg-fallback" data-kg-fallback aria-label="Text fallback for current graph"></section>
      </section>`;
  }

  // ── Toolbar ────────────────────────────────────────────────────────────────
  function renderToolbar() {
    const toolbar = root.querySelector('.nv-kg-toolbar');
    if (!toolbar || !graph) return;
    toolbar.innerHTML = '';

    // Search
    const search = el('input', 'nv-input nv-kg-search');
    search.type = 'search';
    search.placeholder = 'Find a path, module, or lesson…';
    search.setAttribute('aria-label', 'Search curriculum nodes');
    search.setAttribute('list', 'nv-kg-dl');
    search.setAttribute('aria-describedby', 'nv-kg-search-status');
    const datalist = el('datalist');
    datalist.id = 'nv-kg-dl';
    graph.nodes.slice().sort((a, b) => a.title.localeCompare(b.title)).forEach(n => {
      const o = el('option');
      o.value = n.id;
      o.label = `${n.title} (${n.typeLabel})`;
      datalist.append(o);
    });
    search.addEventListener('change', () => {
      const q = normalize(search.value);
      const match = graph.nodeById.get(search.value)
        || graph.nodes.find(n => normalize(n.title).includes(q));
      if (!match) {
        const status = root.querySelector('#nv-kg-search-status');
        if (status) status.textContent = search.value ? `No graph node found for "${search.value}".` : '';
        renderer.applyFocus('', new Set());
        return;
      }
      const status = root.querySelector('#nv-kg-search-status');
      if (status) status.textContent = `Focused ${match.title}.`;
      // Auto-expand ancestors and then pulse the destination node.
      if (match.type === 'module' && match.lineage?.pathId) {
        state.expandedPaths.add(match.lineage.pathId);
      }
      if (match.type === 'lesson' && match.lineage?.moduleId) {
        if (match.lineage?.pathId) state.expandedPaths.add(match.lineage.pathId);
        state.expandedModules.add(match.lineage.moduleId);
      }
      if (match.type === 'artifact') {
        if (match.lineage?.pathId) state.expandedPaths.add(match.lineage.pathId);
        if (match.lineage?.moduleId) state.expandedModules.add(match.lineage.moduleId);
        if (match.lineage?.lessonId) state.expandedLessons.add(match.lineage.lessonId);
      }
      recomputeLayout();
      renderer.update(nodePositions, visibleEdges);
      state.selectedNodeId = match.id;
      renderer.applyFocus(match.id, getNeighborIds(match.id));
      renderer.centerOn(match.id, nodePositions, true);
      renderer.pulseNode(match.id);
      renderer.focusNodeEl(match.id);
      renderInspector();
      renderFallback();
    });
    const searchStatus = el('span', 'nv-kg-search-status');
    searchStatus.id = 'nv-kg-search-status';
    searchStatus.setAttribute('aria-live', 'polite');

    // Buttons
    const btns = el('div', 'nv-kg-toolbar-btns');
    [
      ['Fit All', () => renderer.fitAll(computeBounds(nodePositions))],
      ['Zoom +', () => renderer.zoomBy(1.3)],
      ['Zoom −', () => renderer.zoomBy(0.77)],
      ['Pan ←', () => renderer.panBy(120, 0)],
      ['Pan →', () => renderer.panBy(-120, 0)],
      ['Pan ↑', () => renderer.panBy(0, 120)],
      ['Pan ↓', () => renderer.panBy(0, -120)],
      ['Expand Level', expandSelectedLevel],
      ['Collapse All', () => { state.expandedPaths.clear(); state.expandedModules.clear(); state.expandedLessons.clear(); state.selectedNodeId = ''; recomputeLayout(); renderer.update(nodePositions, visibleEdges); renderer.applyFocus('', new Set()); renderInspector(); renderFallback(); }],
    ].forEach(([label, fn]) => {
      const b = el('button', 'nv-button nv-kg-tool-btn', label);
      b.type = 'button';
      b.dataset.variant = 'secondary';
      b.addEventListener('click', fn);
      btns.append(b);
    });

    // Legend
    const legend = el('div', 'nv-kg-legend');
    [['path', 'Learning Path'], ['module', 'Module'], ['lesson', 'Lesson'], ['artifact', 'Artifact']].forEach(([type, label]) => {
      legend.append(el('span', `nv-kg-legend-item nv-kg-legend-item--${type}`, label));
    });

    const searchWrap = el('div', 'nv-kg-search-wrap');
    searchWrap.append(search, searchStatus, datalist);
    toolbar.append(searchWrap, btns, legend);
  }

  function expandSelectedLevel() {
    const node = graph.nodeById.get(state.selectedNodeId);
    if (!node) {
      const firstPath = graph.nodes.find(n => n.type === 'path');
      if (firstPath) state.expandedPaths.add(firstPath.id);
    } else if (node.type === 'path') state.expandedPaths.add(node.id);
    else if (node.type === 'module') state.expandedModules.add(node.id);
    else if (node.type === 'lesson') state.expandedLessons.add(node.id);
    recomputeLayout();
    renderer.update(nodePositions, visibleEdges);
    if (state.selectedNodeId) renderer.applyFocus(state.selectedNodeId, getNeighborIds(state.selectedNodeId));
    renderInspector();
    renderFallback();
  }

  // ── Inspector ──────────────────────────────────────────────────────────────
  function renderInspector() {
    const panel = root.querySelector('[data-kg-inspector]');
    if (!panel) return;
    panel.innerHTML = '';

    const node = graph?.nodeById.get(state.selectedNodeId);

    if (!node) {
      // Rich empty context
      const pathCount = graph?.nodes.filter(n => n.type === 'path').length || 0;
      const modCount  = graph?.nodes.filter(n => n.type === 'module').length || 0;
      const lesCount  = graph?.nodes.filter(n => n.type === 'lesson').length || 0;
      const artCount  = graph?.nodes.filter(n => n.type === 'artifact').length || 0;

      panel.append(
        el('h2', 'nv-kg-insp-title', 'Knowledge Graph'),
        detail('Learning Paths', String(pathCount)),
        detail('Modules', String(modCount)),
        detail('Lessons', String(lesCount)),
        detail('Artifacts', String(artCount)),
      );

      const guide = el('div', 'nv-kg-insp-guide');
      guide.innerHTML = `
        <h3>How to explore</h3>
        <ul>
          <li><strong>Click</strong> a module to expand its lessons</li>
          <li><strong>Click</strong> a lesson to reveal artifacts</li>
          <li><strong>Click again</strong> to collapse</li>
          <li><strong>Double-click</strong> to center on a node</li>
          <li><strong>Scroll wheel</strong> to zoom in/out</li>
          <li><strong>Drag canvas</strong> to pan around</li>
          <li><strong>Search bar</strong> finds and focuses any item</li>
        </ul>
        <h3>Color key</h3>
        <ul>
          <li><span style="color:#89b4fa">■</span> Learning Paths — cyan blue</li>
          <li><span style="color:#a6e3a1">■</span> Modules — soft green</li>
          <li><span style="color:#f9e2af">■</span> Lessons — warm amber</li>
          <li><span style="color:#cba6f7">■</span> Artifacts — lavender</li>
        </ul>
        <h3>Keyboard shortcuts</h3>
        <ul>
          <li><kbd>↑</kbd> <kbd>↓</kbd> Navigate nodes</li>
          <li><kbd>Enter</kbd> / <kbd>Space</kbd> Select/expand</li>
          <li><kbd>Tab</kbd> Move between nodes</li>
        </ul>`;
      panel.append(guide);
      return;
    }

    // Selected node details
    const lineage = (node.lineage.labels || []).join(' › ') || '—';
    const connCount = (graph.edgesByNodeId.get(node.id) || []).length;
    const isExpanded = state.expandedPaths.has(node.id) || state.expandedModules.has(node.id) || state.expandedLessons.has(node.id);

    panel.append(el('span', `nv-kg-insp-type nv-kg-insp-type--${node.type}`, node.typeLabel));
    panel.append(el('h2', 'nv-kg-insp-title', node.title));

    const dets = el('div', 'nv-kg-insp-details');
    dets.append(
      detail('Status', node.status),
      detail('Lineage', lineage),
      detail('Connections', String(connCount)),
    );
    if (node.metadata?.overview) dets.append(detail('Overview', node.metadata.overview));
    if (node.metadata?.estimatedDuration) dets.append(detail('Duration', node.metadata.estimatedDuration));
    if (node.metadata?.artifactType) dets.append(detail('Artifact type', node.metadata.artifactType));

    // Relationship lists
    const contains = (graph.edgesByNodeId.get(node.id) || [])
      .filter(e => e.type === 'contains' && e.source === node.id)
      .map(e => graph.nodeById.get(e.target)?.title)
      .filter(Boolean);
    const parents = (graph.edgesByNodeId.get(node.id) || [])
      .filter(e => e.type === 'contains' && e.target === node.id)
      .map(e => graph.nodeById.get(e.source)?.title)
      .filter(Boolean);
    if (parents.length) dets.append(detail('Parent', parents.join(', ')));
    if (contains.length) dets.append(detail('Related items', contains.join(', ')));
    ['prerequisite', 'recommended_before', 'recommended_after', 'complementary', 'alternative'].forEach(type => {
      const rels = (graph.edgesByNodeId.get(node.id) || [])
        .filter(e => e.type === type)
        .map(e => graph.nodeById.get(e.source === node.id ? e.target : e.source)?.title)
        .filter(Boolean);
      if (rels.length) dets.append(detail(type.replace(/_/g, ' '), rels.join(', ')));
    });

    panel.append(dets);

    // Actions
    const actions = el('div', 'nv-kg-insp-actions');
    const openBtn = el('button', 'nv-button', 'Open Resource');
    openBtn.type = 'button'; openBtn.dataset.variant = 'primary';
    openBtn.addEventListener('click', () => { window.location.hash = node.route; });
    actions.append(openBtn);

    const focusBtn = el('button', 'nv-button', 'Focus');
    focusBtn.type = 'button'; focusBtn.dataset.variant = 'secondary';
    focusBtn.addEventListener('click', () => {
      renderer.applyFocus(node.id, getNeighborIds(node.id));
      renderer.centerOn(node.id, nodePositions, true);
      renderer.pulseNode(node.id);
    });
    actions.append(focusBtn);

    const centerBtn = el('button', 'nv-button', 'Center View');
    centerBtn.type = 'button'; centerBtn.dataset.variant = 'secondary';
    centerBtn.addEventListener('click', () => renderer.centerOn(node.id, nodePositions));
    actions.append(centerBtn);

    if (node.type === 'module' || node.type === 'lesson') {
      const toggleBtn = el('button', 'nv-button', isExpanded ? 'Collapse' : 'Expand');
      toggleBtn.type = 'button'; toggleBtn.dataset.variant = 'secondary';
      toggleBtn.addEventListener('click', () => handlers.selectNode(node.id));
      actions.append(toggleBtn);
    }

    if (node.type === 'path') {
      const toggleBtn = el('button', 'nv-button', isExpanded ? 'Collapse' : 'Expand');
      toggleBtn.type = 'button'; toggleBtn.dataset.variant = 'secondary';
      toggleBtn.addEventListener('click', () => handlers.selectNode(node.id));
      actions.append(toggleBtn);
    }

    const lineageBtn = el('button', 'nv-button', 'Reveal Lineage');
    lineageBtn.type = 'button'; lineageBtn.dataset.variant = 'secondary';
    lineageBtn.addEventListener('click', () => revealLineage(node));
    actions.append(lineageBtn);

    panel.append(actions);
  }

  function revealLineage(node) {
    if (node.lineage?.pathId) state.expandedPaths.add(node.lineage.pathId);
    if (node.lineage?.moduleId) state.expandedModules.add(node.lineage.moduleId);
    if (node.lineage?.lessonId && node.type === 'artifact') state.expandedLessons.add(node.lineage.lessonId);
    recomputeLayout();
    renderer.update(nodePositions, visibleEdges);
    state.selectedNodeId = node.id;
    renderer.applyFocus(node.id, getNeighborIds(node.id));
    renderer.centerOn(node.id, nodePositions, true);
    renderInspector();
    renderFallback();
  }

  function detail(label, value) {
    const d = el('div', 'nv-kg-detail');
    d.append(el('span', 'nv-kg-detail__label', label), el('span', 'nv-kg-detail__value', value || '—'));
    return d;
  }

  function renderFallback() {
    const fallback = root.querySelector('[data-kg-fallback]');
    if (!fallback || !nodePositions) return;
    fallback.innerHTML = '';
    const nodes = [...nodePositions.values()];
    const list = el('ol', 'nv-kg-fallback-list');
    nodes.forEach(node => {
      const item = el('li');
      const link = el('a', '', `${node.typeLabel}: ${node.title}`);
      link.href = node.route;
      item.append(link);
      list.append(item);
    });
    const rels = el('ol', 'nv-kg-fallback-list');
    visibleEdges.forEach(edge => {
      rels.append(el('li', '', `${graph.nodeById.get(edge.source)?.title || edge.source} contains ${graph.nodeById.get(edge.target)?.title || edge.target}`));
    });
    fallback.append(el('h2', '', 'Current Atlas Text View'), el('h3', '', 'Nodes'), list, el('h3', '', 'Relationships'), rels);
  }

  function applyHashFocus() {
    const query = String(window.location.hash || '').split('?')[1];
    if (!query) return;
    const params = new URLSearchParams(query);
    const focusId = params.get('focus');
    const node = focusId ? graph.nodeById.get(focusId) : null;
    if (!node) return;
    if (node.lineage?.pathId) state.expandedPaths.add(node.lineage.pathId);
    if (node.type === 'module') state.expandedPaths.add(node.lineage?.pathId || '');
    if (node.type === 'lesson' || node.type === 'artifact') state.expandedModules.add(node.lineage?.moduleId || '');
    if (node.type === 'artifact') state.expandedLessons.add(node.lineage?.lessonId || '');
    state.expandedPaths.delete('');
    state.expandedModules.delete('');
    state.expandedLessons.delete('');
    state.selectedNodeId = node.id;
  }

  // ── Main render ──────────────────────────────────────────────────────────
  async function renderCurrentRoute() {
    if (!target()) {
      if (renderer) {
        renderer.destroy();
        renderer = null;
      }
      routeInitialized = false;
      return;
    }
    renderShell();
    try {
      await ensureGraph();
      applyHashFocus();
      recomputeLayout();
      const canvasWrap = root.querySelector('[data-kg-canvas]');
      if (renderer) renderer.destroy();
      renderer = new KnowledgeGraphRenderer(canvasWrap, handlers);
      renderer.render(nodePositions, visibleEdges);
      requestAnimationFrame(() => renderer.fitAll(computeBounds(nodePositions)));
      if (state.selectedNodeId) requestAnimationFrame(() => {
        renderer.applyFocus(state.selectedNodeId, getNeighborIds(state.selectedNodeId));
        renderer.centerOn(state.selectedNodeId, nodePositions, true);
        renderer.pulseNode(state.selectedNodeId);
      });
      renderToolbar();
      renderInspector();
      renderFallback();
      routeInitialized = true;
    } catch (err) {
      const c = target();
      if (c) c.innerHTML = `<section class="nv-panel"><h1>Graph unavailable</h1><p>${err.message}</p></section>`;
    }
  }

  function init() {
    window.addEventListener('nv:routerendered', () => renderCurrentRoute());
    window.addEventListener('hashchange', () => {
      if (!String(window.location.hash || '').startsWith('#/knowledge-graph') && renderer) {
        renderer.destroy();
        renderer = null;
        routeInitialized = false;
      }
    });
    renderCurrentRoute();
  }

  return { init, renderCurrentRoute };
}
