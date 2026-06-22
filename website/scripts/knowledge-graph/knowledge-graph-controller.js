import { hasVisualization } from '../visualizations/visualization-registry.js';
import { buildKnowledgeGraphModel, DEPENDENCY_TYPES } from './knowledge-graph-model.js';
import {
  computeClusterAnchors, computeLayout, computeVisibleEdges, computeBounds,
} from './knowledge-graph-layout.js';
import { KnowledgeGraphRenderer } from './knowledge-graph-renderer.js';

function el(tag, cls = '', text = '') {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  return n;
}
function normalize(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function createKnowledgeGraphController(options = {}) {
  const root = options.root || document;

  // ── Core state ─────────────────────────────────────────────────────────────
  let graph = null;
  let renderer = null;
  let clusterAnchors = null;
  let nodePositions = null;   // Map<id, node-with-wx,wy>
  let visibleEdges = null;

  const state = {
    selectedNodeId: '',
    expandedModules: new Set(),
    expandedLessons: new Set(),
    searchQuery: '',
  };

  function target() { return root.querySelector('[data-knowledge-graph-root]'); }

  // ── Graph model ─────────────────────────────────────────────────────────────
  async function ensureGraph() {
    if (graph) return;
    const service = window.NeuralVerse?.curriculum?.service;
    if (!service) throw new Error('Curriculum service unavailable.');
    const index = await service.getIndex();
    graph = buildKnowledgeGraphModel(index, { hasVisualization });
    clusterAnchors = computeClusterAnchors(graph);
  }

  // ── Layout helpers ──────────────────────────────────────────────────────────
  function recomputeLayout() {
    // Annotate expanded state onto positions for indicator rendering
    nodePositions = computeLayout(graph, state.expandedModules, state.expandedLessons, clusterAnchors);
    nodePositions.forEach((node, id) => {
      node._expanded = state.expandedModules.has(id) || state.expandedLessons.has(id);
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

  // ── Interaction handlers (passed to renderer) ───────────────────────────────
  const handlers = {
    selectNode(nodeId) {
      const node = graph.nodeById.get(nodeId);
      if (!node) return;

      // Progressive disclosure: toggle expand/collapse
      if (node.type === 'module') {
        if (state.expandedModules.has(nodeId)) {
          state.expandedModules.delete(nodeId);
          // Also collapse any lessons inside it
          const lessonIds = visibleEdges
            .filter(e => e.source === nodeId)
            .map(e => e.target);
          lessonIds.forEach(id => state.expandedLessons.delete(id));
        } else {
          state.expandedModules.add(nodeId);
        }
        recomputeLayout();
        renderer.update(nodePositions, visibleEdges);
      } else if (node.type === 'lesson') {
        if (state.expandedLessons.has(nodeId)) {
          state.expandedLessons.delete(nodeId);
        } else {
          state.expandedLessons.add(nodeId);
        }
        recomputeLayout();
        renderer.update(nodePositions, visibleEdges);
      }

      // Always update selection
      state.selectedNodeId = nodeId;
      renderer.applyFocus(nodeId, getNeighborIds(nodeId));
      renderInspector();
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
      const nextId = ids[next];
      if (nextId) { handlers.selectNode(nextId); renderer.focusNodeEl(nextId); }
    },
  };

  // ── Shell ────────────────────────────────────────────────────────────────────
  function renderShell() {
    const c = target();
    if (!c) return;
    c.innerHTML = `
      <section class="nv-kg" aria-labelledby="nv-kg-title">
        <header class="nv-kg-hero nv-curriculum-hero">
          <div class="nv-stack nv-stack--gap-xs">
            <span class="nv-curriculum-card__kicker">NV-900-UIX</span>
            <h1 id="nv-kg-title">Knowledge Graph</h1>
            <p class="nv-muted">Explore curriculum structure interactively. Click modules or lessons to expand.</p>
          </div>
          <a class="nv-button" data-variant="secondary" href="#/learning">Open Curriculum</a>
        </header>
        <div class="nv-kg-toolbar" aria-label="Graph controls"></div>
        <div class="nv-kg-workspace">
          <div class="nv-kg-canvas-wrap" data-kg-canvas></div>
          <aside class="nv-kg-inspector" data-kg-inspector aria-label="Node details"></aside>
        </div>
      </section>`;
  }

  // ── Toolbar ──────────────────────────────────────────────────────────────────
  function renderToolbar() {
    const toolbar = root.querySelector('.nv-kg-toolbar');
    if (!toolbar || !graph) return;
    toolbar.innerHTML = '';

    // Search
    const searchWrap = el('div', 'nv-kg-search-wrap');
    const search = el('input', 'nv-input nv-kg-search');
    search.type = 'search';
    search.placeholder = 'Search nodes…';
    search.setAttribute('aria-label', 'Search curriculum nodes');
    const datalist = el('datalist');
    datalist.id = 'nv-kg-dl';
    graph.nodes.slice().sort((a,b) => a.title.localeCompare(b.title)).forEach(n => {
      const o = el('option'); o.value = n.id; o.label = `${n.title} (${n.typeLabel})`; datalist.append(o);
    });
    search.setAttribute('list', 'nv-kg-dl');
    search.addEventListener('change', () => {
      const q = normalize(search.value);
      const match = graph.nodeById.get(search.value)
        || graph.nodes.find(n => normalize(n.title).includes(q));
      if (match) {
        handlers.selectNode(match.id);
        renderer.centerOn(match.id, nodePositions);
        renderer.focusNodeEl(match.id);
      }
    });
    searchWrap.append(search, datalist);

    // View buttons
    const viewBtns = el('div', 'nv-kg-toolbar-btns');
    [
      ['Fit All',    () => renderer.fitAll(computeBounds(nodePositions))],
      ['Zoom +',     () => renderer.zoomBy(1.25)],
      ['Zoom −',     () => renderer.zoomBy(0.8)],
      ['Expand All Modules', expandAllModules],
      ['Collapse All',       collapseAll],
    ].forEach(([label, fn]) => {
      const b = el('button', 'nv-button nv-kg-tool-btn', label);
      b.type = 'button'; b.dataset.variant = 'secondary';
      b.addEventListener('click', fn);
      viewBtns.append(b);
    });

    // Legend
    const legend = el('div', 'nv-kg-legend');
    [
      ['path',     'Learning Path'],
      ['module',   'Module'],
      ['lesson',   'Lesson (click module to show)'],
      ['artifact', 'Artifact (click lesson to show)'],
    ].forEach(([type, label]) => {
      const item = el('span', `nv-kg-legend-item nv-kg-legend-item--${type}`, label);
      legend.append(item);
    });

    toolbar.append(searchWrap, viewBtns, legend);
  }

  function expandAllModules() {
    graph.nodes.filter(n => n.type === 'module').forEach(n => state.expandedModules.add(n.id));
    recomputeLayout();
    renderer.update(nodePositions, visibleEdges);
    renderInspector();
  }

  function collapseAll() {
    state.expandedModules.clear();
    state.expandedLessons.clear();
    recomputeLayout();
    renderer.update(nodePositions, visibleEdges);
    renderInspector();
  }

  // ── Inspector ────────────────────────────────────────────────────────────────
  function renderInspector() {
    const panel = root.querySelector('[data-kg-inspector]');
    if (!panel) return;
    panel.innerHTML = '';

    const node = graph?.nodeById.get(state.selectedNodeId);

    if (!node) {
      // Summary
      panel.append(
        el('h2', 'nv-kg-insp-title', 'Knowledge Graph'),
        detail('Paths', String(graph?.nodes.filter(n=>n.type==='path').length||0)),
        detail('Modules', String(graph?.nodes.filter(n=>n.type==='module').length||0)),
        detail('Lessons', String(graph?.nodes.filter(n=>n.type==='lesson').length||0)),
        detail('Artifacts', String(graph?.nodes.filter(n=>n.type==='artifact').length||0)),
        el('p', 'nv-kg-insp-hint', '💡 Click any node to see details.\nClick a module or lesson to expand/collapse it.\nScroll to zoom, drag to pan.')
      );
      return;
    }

    const lineage = (node.lineage.labels || []).join(' › ') || '—';
    const connCount = (graph.edgesByNodeId.get(node.id) || []).length;
    const isExpanded = state.expandedModules.has(node.id) || state.expandedLessons.has(node.id);

    panel.append(
      el('span', `nv-kg-insp-type nv-kg-insp-type--${node.type}`, node.typeLabel),
      el('h2', 'nv-kg-insp-title', node.title),
    );

    const details = el('div', 'nv-kg-insp-details');
    details.append(
      detail('Status', node.status),
      detail('Lineage', lineage),
    );
    if (node.metadata?.overview) details.append(detail('Overview', node.metadata.overview));
    if (node.metadata?.estimatedDuration) details.append(detail('Duration', node.metadata.estimatedDuration));
    if (node.metadata?.artifactType) details.append(detail('Artifact type', node.metadata.artifactType));
    details.append(detail('Connections', String(connCount)));
    panel.append(details);

    // Relationship lists
    const depTypes = [
      ['prerequisite', 'Prerequisites'],
      ['recommended_before', 'Recommended Before'],
      ['recommended_after', 'Recommended After'],
      ['complementary', 'Complementary'],
      ['alternative', 'Alternatives'],
    ];
    depTypes.forEach(([type, label]) => {
      const rels = (graph.edgesByNodeId.get(node.id) || [])
        .filter(e => e.type === type)
        .map(e => graph.nodeById.get(e.source === node.id ? e.target : e.source)?.title)
        .filter(Boolean);
      if (rels.length) details.append(detail(label, rels.join(', ')));
    });

    // Actions
    const actions = el('div', 'nv-kg-insp-actions');
    const openBtn = el('button', 'nv-button', 'Open Resource');
    openBtn.type = 'button'; openBtn.dataset.variant = 'primary';
    openBtn.addEventListener('click', () => { window.location.hash = node.route; });

    const centerBtn = el('button', 'nv-button', 'Center View');
    centerBtn.type = 'button'; centerBtn.dataset.variant = 'secondary';
    centerBtn.addEventListener('click', () => renderer.centerOn(node.id, nodePositions));

    actions.append(openBtn, centerBtn);

    if (node.type === 'module' || node.type === 'lesson') {
      const toggleBtn = el('button', 'nv-button', isExpanded ? 'Collapse' : 'Expand');
      toggleBtn.type = 'button'; toggleBtn.dataset.variant = 'secondary';
      toggleBtn.addEventListener('click', () => handlers.selectNode(node.id));
      actions.append(toggleBtn);
    }

    panel.append(actions);
  }

  function detail(label, value) {
    const d = el('div', 'nv-kg-detail');
    d.append(el('span', 'nv-kg-detail__label', label), el('span', 'nv-kg-detail__value', value || '—'));
    return d;
  }

  // ── Init & route ─────────────────────────────────────────────────────────────
  async function renderCurrentRoute() {
    if (!target()) return;
    renderShell();

    try {
      await ensureGraph();
      recomputeLayout();

      const canvasWrap = root.querySelector('[data-kg-canvas]');
      if (renderer) renderer.destroy();
      renderer = new KnowledgeGraphRenderer(canvasWrap, handlers);
      renderer.render(nodePositions, visibleEdges);

      // Fit view on initial load (small delay for SVG to measure)
      requestAnimationFrame(() => {
        renderer.fitAll(computeBounds(nodePositions));
      });

      renderToolbar();
      renderInspector();
    } catch (err) {
      const c = target();
      if (c) c.innerHTML = `<section class="nv-panel"><h1>Graph unavailable</h1><p>${err.message}</p></section>`;
    }
  }

  function init() {
    window.addEventListener('nv:routerendered', () => renderCurrentRoute());
    renderCurrentRoute();
  }

  return { init, renderCurrentRoute };
}
