import { hasVisualization } from '../visualizations/visualization-registry.js';
import { buildKnowledgeGraphModel, DEPENDENCY_TYPES } from './knowledge-graph-model.js';
import { layoutArtifactNeighborhoodGraph, layoutFocusedLessonGraph, layoutOverviewGraph } from './knowledge-graph-layout.js';
import { renderGraphSvg } from './knowledge-graph-renderer.js';

const NODE_TYPES = ['path', 'module', 'lesson', 'artifact'];
const REL_TYPES = ['contains', 'sibling', ...DEPENDENCY_TYPES];

function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function routeParts() {
  return String(window.location.hash || '').split('?')[1] || '';
}

function paramsFromHash() {
  return new URLSearchParams(routeParts());
}

function normalize(text) {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function relationDescription(edge) {
  return edge?.description || `Curriculum index lists a ${edge?.label || 'relationship'} relationship.`;
}

export function createKnowledgeGraphController(options = {}) {
  const root = options.root || document;
  let graph = null;
  let layout = null;
  let state = {
    mode: 'overview',
    focusId: '',
    selectedNodeId: '',
    selectedEdgeId: '',
    previewNodeId: '',
    // Overview: default = no artifacts
    showArtifacts: false,
    nodeTypes: new Set(['path', 'module', 'lesson']),
    statuses: new Set(['Draft', 'Reviewed']),
    relTypes: new Set(['contains']),
    // viewBox is derived from layout in fitView()
    viewBox: { x: 0, y: 0, width: 1400, height: 820 },
    zoom: 1,
  };

  function target() { return root.querySelector('[data-knowledge-graph-root]'); }

  // ── Graph model ─────────────────────────────────────────────────────────────

  async function ensureGraph() {
    if (graph) return graph;
    const service = window.NeuralVerse?.curriculum?.service;
    if (!service) throw new Error('Curriculum service is unavailable.');
    const index = await service.getIndex();
    graph = buildKnowledgeGraphModel(index, { hasVisualization });
    applyPersonalizationOverlays();
    return graph;
  }

  function applyPersonalizationOverlays() {
    const service = window.NeuralVerse?.PersonalizationService;
    if (!service || !graph) return;
    graph.nodes.forEach(node => {
      node.metadata.bookmarked = service.isBookmarked?.(node.id) || false;
      node.metadata.hasNotes = !!service.getNote?.(node.id);
      node.metadata.recentlyVisited = service.getRecentlyVisited?.().some(item => item.id === node.id) || false;
    });
  }

  // ── Layout ──────────────────────────────────────────────────────────────────

  function computeLayout() {
    if (state.mode === 'focused-lesson') {
      layout = layoutFocusedLessonGraph(graph, state.focusId);
    } else if (state.mode === 'artifact-neighborhood') {
      layout = layoutArtifactNeighborhoodGraph(graph, state.focusId);
    } else {
      // Overview mode: show artifacts only if explicitly toggled
      layout = layoutOverviewGraph(graph, state.showArtifacts);
    }

    // Apply node type + status filters
    layout.nodes = layout.nodes.filter(
      node => state.nodeTypes.has(node.type) && state.statuses.has(node.status)
    );
    const visibleIds = new Set(layout.nodes.map(n => n.id));
    layout.edges = layout.edges.filter(
      edge => visibleIds.has(edge.source) && visibleIds.has(edge.target)
        && state.relTypes.has(edge.type)
    );

    // Auto-select first node if current selection is not visible
    if (!layout.nodes.some(n => n.id === state.selectedNodeId)) {
      state.selectedNodeId = layout.nodes[0]?.id || '';
    }
    if (!layout.edges.some(e => e.id === state.selectedEdgeId)) {
      state.selectedEdgeId = '';
    }
  }

  function fitView() {
    // Use the layout's actual computed dimensions
    const width = Math.max(900, layout?.width || 1400);
    const height = Math.max(560, layout?.height || 820);
    state.viewBox = { x: -40, y: -40, width: width + 80, height: height + 80 };
    state.zoom = 1;
  }

  // ── Shell ───────────────────────────────────────────────────────────────────

  function renderShell() {
    const container = target();
    if (!container) return;
    container.innerHTML = `
      <section class="nv-kg" aria-labelledby="nv-kg-title">
        <header class="nv-kg-hero nv-curriculum-hero">
          <div class="nv-stack nv-stack--gap-xs">
            <span class="nv-curriculum-card__kicker">NV-900-UI10</span>
            <h1 id="nv-kg-title">Knowledge Graph &amp; Semantic Exploration</h1>
            <p>Deterministic visualization of curriculum hierarchy and explicit artifact relationships.</p>
          </div>
          <a class="nv-button" data-variant="secondary" href="#/learning">Open Curriculum</a>
        </header>

        <div class="nv-kg-toolbar" aria-label="Knowledge graph controls"></div>

        <div class="nv-kg-grid">
          <section class="nv-kg-canvas-panel" aria-label="Graph canvas">
            <div class="nv-kg-canvas" data-kg-canvas></div>
            <p class="nv-sr-only" aria-live="polite" data-kg-announcer></p>
          </section>
          <aside class="nv-kg-inspector" data-kg-inspector aria-label="Graph inspector"></aside>
        </div>

        <details class="nv-kg-fallback-details">
          <summary>Text view of current graph</summary>
          <section class="nv-kg-fallback" data-kg-fallback aria-label="Text fallback"></section>
        </details>
      </section>`;
  }

  // ── Toolbar ─────────────────────────────────────────────────────────────────

  function renderToolbar() {
    const toolbar = root.querySelector('.nv-kg-toolbar');
    if (!toolbar) return;
    toolbar.innerHTML = '';

    // ── Section: Mode + Search ──
    const modeSection = el('div', 'nv-kg-toolbar-section');

    const mode = el('select', 'nv-input nv-kg-control');
    mode.setAttribute('aria-label', 'Graph mode');
    [
      ['overview', '🗺 Overview'],
      ['focused-lesson', '📖 Lesson Focus'],
      ['artifact-neighborhood', '🔬 Artifact Neighborhood'],
    ].forEach(([value, label]) => {
      const option = el('option', '', label);
      option.value = value;
      option.selected = state.mode === value;
      mode.append(option);
    });
    mode.addEventListener('change', () => {
      state.mode = mode.value;
      updateDefaultsForMode();
      render();
    });

    const search = el('input', 'nv-input nv-kg-search');
    search.type = 'search';
    search.placeholder = 'Find curriculum item…';
    search.setAttribute('list', 'nv-kg-search-options');
    search.setAttribute('aria-label', 'Search and focus curriculum item');
    search.value = state.focusId;
    search.addEventListener('change', () => focusSearch(search.value));

    const datalist = el('datalist');
    datalist.id = 'nv-kg-search-options';
    graph.nodes.slice().sort((a, b) => a.title.localeCompare(b.title)).forEach(node => {
      const opt = el('option');
      opt.value = node.id;
      opt.label = `${node.title} (${node.typeLabel})`;
      datalist.append(opt);
    });

    modeSection.append(mode, search, datalist);

    // ── Section: Node Filters ──
    const filterSection = el('div', 'nv-kg-toolbar-section');

    // Artifact toggle for overview
    const artifactToggleWrapper = el('label', 'nv-kg-check nv-kg-artifact-toggle');
    const artifactToggle = el('input');
    artifactToggle.type = 'checkbox';
    artifactToggle.checked = state.showArtifacts;
    artifactToggle.setAttribute('aria-label', 'Show artifact nodes in overview');
    artifactToggle.addEventListener('change', () => {
      state.showArtifacts = artifactToggle.checked;
      if (state.showArtifacts) {
        state.nodeTypes.add('artifact');
      } else {
        state.nodeTypes.delete('artifact');
      }
      render();
    });
    artifactToggleWrapper.append(artifactToggle, document.createTextNode(' Show Artifacts'));
    filterSection.append(
      artifactToggleWrapper,
      filterGroup('Status', ['Draft', 'Reviewed'], state.statuses),
      filterGroup('Edges', REL_TYPES, state.relTypes),
    );

    // ── Section: View Controls ──
    const viewSection = el('div', 'nv-kg-toolbar-section nv-kg-toolbar-section--view');
    [
      ['Zoom +', () => zoomView(0.8)],
      ['Zoom −', () => zoomView(1.25)],
      ['← Pan', () => panView(-120, 0)],
      ['→ Pan', () => panView(120, 0)],
      ['↑ Pan', () => panView(0, -120)],
      ['↓ Pan', () => panView(0, 120)],
      ['Fit', () => { fitView(); paintGraph(); }],
      ['Reset', resetView],
      ['Open', openSelected],
    ].forEach(([label, action]) => {
      const btn = el('button', 'nv-button nv-kg-view-btn', label);
      btn.type = 'button';
      btn.dataset.variant = 'secondary';
      btn.addEventListener('click', action);
      viewSection.append(btn);
    });

    toolbar.append(modeSection, filterSection, viewSection);
  }

  function filterGroup(label, values, set) {
    const wrapper = el('fieldset', 'nv-kg-filter');
    wrapper.append(el('legend', '', label));
    values.forEach(value => {
      const id = `nv-kg-${label}-${value}`.replace(/\W+/g, '-');
      const item = el('label', 'nv-kg-check');
      const input = el('input');
      input.type = 'checkbox';
      input.id = id;
      input.checked = set.has(value);
      input.addEventListener('change', () => {
        input.checked ? set.add(value) : set.delete(value);
        render();
      });
      item.append(input, document.createTextNode(value.replace(/_/g, ' ')));
      wrapper.append(item);
    });
    return wrapper;
  }

  function updateDefaultsForMode() {
    if (state.mode === 'overview') {
      state.nodeTypes = new Set(['path', 'module', 'lesson']);
      if (state.showArtifacts) state.nodeTypes.add('artifact');
      state.relTypes = new Set(['contains']);
    }
    if (state.mode === 'focused-lesson') {
      state.nodeTypes = new Set(NODE_TYPES);
      state.relTypes = new Set(REL_TYPES);
      if (graph.nodeById.get(state.focusId)?.type !== 'lesson') {
        state.focusId = graph.nodes.find(n => n.type === 'lesson')?.id || '';
      }
    }
    if (state.mode === 'artifact-neighborhood') {
      state.nodeTypes = new Set(NODE_TYPES);
      state.relTypes = new Set(REL_TYPES);
      if (graph.nodeById.get(state.focusId)?.type !== 'artifact') {
        state.focusId = graph.nodes.find(n => n.type === 'artifact')?.id || '';
      }
    }
  }

  // ── Search ──────────────────────────────────────────────────────────────────

  function focusSearch(value) {
    const query = normalize(value);
    const match = graph.nodeById.get(value)
      || graph.nodes.find(n => normalize(n.title).includes(query) || normalize(n.id).includes(query));
    if (!match) return;
    state.focusId = match.id;
    state.selectedNodeId = match.id;
    if (match.type === 'artifact') state.mode = 'artifact-neighborhood';
    else if (match.type === 'lesson') state.mode = 'focused-lesson';
    updateDefaultsForMode();
    render();
  }

  // ── Paint ────────────────────────────────────────────────────────────────────

  function paintGraph() {
    const canvas = root.querySelector('[data-kg-canvas]');
    if (!canvas) return;
    renderGraphSvg(canvas, layout, state, {
      selectNode,
      selectEdge,
      previewNode: id => { state.previewNodeId = id; renderInspector(); },
      moveNodeFocus,
    });
  }

  // ── Inspector ────────────────────────────────────────────────────────────────

  function renderInspector() {
    const inspector = root.querySelector('[data-kg-inspector]');
    if (!inspector) return;
    inspector.innerHTML = '';

    const edge = layout?.edges.find(e => e.id === state.selectedEdgeId);
    const node = graph.nodeById.get(state.selectedNodeId || state.previewNodeId);

    if (edge) {
      const source = graph.nodeById.get(edge.source);
      const target = graph.nodeById.get(edge.target);
      const section = el('div', 'nv-kg-inspector-section');
      section.append(
        el('h2', 'nv-kg-inspector-title', 'Selected Relationship'),
        detail('Type', edge.label),
        detail('From', source?.title),
        detail('To', target?.title),
        detail('Explanation', relationDescription(edge)),
      );
      inspector.append(
        section,
        actionButton('Focus source', () => selectNode(edge.source)),
        actionButton('Focus target', () => selectNode(edge.target)),
      );
      return;
    }

    if (node) {
      const lineage = (node.lineage.labels || []).join(' / ') || '—';
      const connCount = (graph.edgesByNodeId.get(node.id) || []).length;
      const section = el('div', 'nv-kg-inspector-section');
      section.append(
        el('h2', 'nv-kg-inspector-title', node.title),
        detail('Type', node.typeLabel),
        detail('Status', node.status),
        detail('Lineage', lineage),
      );
      if (node.metadata.estimatedDuration) section.append(detail('Duration', node.metadata.estimatedDuration));
      if (node.metadata.artifactType) section.append(detail('Artifact type', node.metadata.artifactType));
      if (node.metadata.overview) section.append(detail('Overview', node.metadata.overview));
      section.append(detail('Connections', String(connCount)));

      inspector.append(
        section,
        actionButton('Open resource', () => { window.location.hash = node.route; }),
        actionButton('Focus node', () => {
          state.focusId = node.id;
          if (node.type === 'artifact') state.mode = 'artifact-neighborhood';
          else if (node.type === 'lesson') state.mode = 'focused-lesson';
          else state.mode = 'overview';
          updateDefaultsForMode();
          render();
        }),
      );
      return;
    }

    // No selection — show graph summary
    const summary = el('div', 'nv-kg-inspector-section');
    summary.append(
      el('h2', 'nv-kg-inspector-title', 'Graph Summary'),
      detail('Mode', state.mode.replace(/-/g, ' ')),
      detail('Visible nodes', String(layout?.nodes.length || 0)),
      detail('Visible edges', String(layout?.edges.length || 0)),
      detail('Data boundary', 'Existing curriculum metadata only. No AI-inferred links.'),
    );
    if (state.mode === 'overview' && !state.showArtifacts) {
      const hint = el('p', 'nv-kg-inspector-hint', '💡 Artifact nodes are hidden in overview. Enable "Show Artifacts" in the toolbar to display them.');
      summary.append(hint);
    }
    inspector.append(summary);
  }

  function detail(label, value) {
    const item = el('div', 'nv-kg-detail');
    item.append(el('span', 'nv-kg-detail__label', label), el('span', 'nv-kg-detail__value', value || '—'));
    return item;
  }

  function actionButton(label, action) {
    const btn = el('button', 'nv-button', label);
    btn.type = 'button';
    btn.dataset.variant = 'secondary';
    btn.addEventListener('click', action);
    return btn;
  }

  // ── Fallback ─────────────────────────────────────────────────────────────────

  function renderFallback() {
    const fallback = root.querySelector('[data-kg-fallback]');
    if (!fallback) return;
    fallback.innerHTML = '';
    const nodeList = el('ol', 'nv-kg-fallback-list');
    layout.nodes.forEach(node => {
      const item = el('li');
      const link = el('a', '', `${node.typeLabel}: ${node.title}`);
      link.href = node.route;
      item.append(link);
      nodeList.append(item);
    });
    const edgeList = el('ol', 'nv-kg-fallback-list');
    layout.edges.forEach(edge => {
      const src = graph.nodeById.get(edge.source)?.title || edge.source;
      const tgt = graph.nodeById.get(edge.target)?.title || edge.target;
      edgeList.append(el('li', '', `${edge.label}: ${src} → ${tgt}`));
    });
    fallback.append(
      el('h3', '', 'Graph nodes'),
      nodeList,
      el('h3', '', 'Graph edges'),
      edgeList,
    );
  }

  // ── Interaction handlers ──────────────────────────────────────────────────────

  function selectNode(id) {
    state.selectedNodeId = id;
    state.selectedEdgeId = '';
    announce(`Selected ${graph.nodeById.get(id)?.title || id}`);
    renderInspector();
    paintGraph();
  }

  function selectEdge(id) {
    state.selectedEdgeId = id;
    state.selectedNodeId = '';
    const edge = layout.edges.find(e => e.id === id);
    announce(`Selected relationship: ${edge?.label || id}`);
    renderInspector();
    paintGraph();
  }

  function moveNodeFocus(key) {
    const current = Math.max(0, layout.nodes.findIndex(n => n.id === state.selectedNodeId));
    const next = (key === 'ArrowLeft' || key === 'ArrowUp')
      ? Math.max(0, current - 1)
      : Math.min(layout.nodes.length - 1, current + 1);
    const element = root.querySelector(`[data-node-id="${layout.nodes[next]?.id}"]`);
    if (element) { element.focus(); selectNode(layout.nodes[next].id); }
  }

  function announce(message) {
    const announcer = root.querySelector('[data-kg-announcer]');
    if (announcer) announcer.textContent = message;
  }

  function openSelected() {
    const node = graph.nodeById.get(state.selectedNodeId);
    if (node) window.location.hash = node.route;
  }

  function resetView() { fitView(); render(); }

  function zoomView(factor) {
    const maxW = (layout?.width || 1400) * 2;
    const maxH = (layout?.height || 820) * 2;
    const nextWidth = Math.max(400, Math.min(maxW, state.viewBox.width * factor));
    const nextHeight = Math.max(260, Math.min(maxH, state.viewBox.height * factor));
    state.viewBox = {
      x: state.viewBox.x + (state.viewBox.width - nextWidth) / 2,
      y: state.viewBox.y + (state.viewBox.height - nextHeight) / 2,
      width: nextWidth,
      height: nextHeight,
    };
    paintGraph();
  }

  function panView(dx, dy) {
    state.viewBox = { ...state.viewBox, x: state.viewBox.x + dx, y: state.viewBox.y + dy };
    paintGraph();
  }

  // ── Render orchestration ─────────────────────────────────────────────────────

  function render() {
    if (!target() || !graph) return;
    computeLayout();
    fitView();
    renderToolbar();
    paintGraph();
    renderInspector();
    renderFallback();
  }

  async function renderCurrentRoute() {
    if (!target()) return;
    renderShell();
    try {
      await ensureGraph();
      const params = paramsFromHash();
      state.mode = params.get('mode') || state.mode;
      state.focusId = params.get('focus') || state.focusId || graph.nodes.find(n => n.type === 'lesson')?.id || '';
      updateDefaultsForMode();
      render();
    } catch (error) {
      const c = target();
      if (c) c.innerHTML = `<section class="nv-panel"><h1>Knowledge graph unavailable</h1><p>${error.message}</p></section>`;
    }
  }

  function init() {
    window.addEventListener('nv:routerendered', () => renderCurrentRoute());
    renderCurrentRoute();
  }

  return { init, renderCurrentRoute };
}
