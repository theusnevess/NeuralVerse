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
  return edge?.description || `This edge exists because the curriculum index lists a ${edge?.label || 'relationship'} relationship.`;
}

export function createKnowledgeGraphController(options = {}) {
  const root = options.root || document;
  let graph = null;
  let layout = null;
  let state = {
    mode: 'overview', focusId: '', selectedNodeId: '', selectedEdgeId: '', previewNodeId: '',
    nodeTypes: new Set(['path', 'module', 'lesson']), statuses: new Set(['Draft', 'Reviewed']), relTypes: new Set(['contains', 'sibling']),
    viewBox: { x: 0, y: 0, width: 1120, height: 720 }, zoom: 1
  };

  function target() { return root.querySelector('[data-knowledge-graph-root]'); }

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
    graph.nodes.forEach((node) => {
      node.metadata.bookmarked = service.isBookmarked?.(node.id) || false;
      node.metadata.hasNotes = !!service.getNote?.(node.id);
      node.metadata.recentlyVisited = service.getRecentlyVisited?.().some((item) => item.id === node.id) || false;
      node.metadata.inCollection = service.getCollections?.().some((collection) => collection.resources?.some((item) => item.id === node.id)) || false;
    });
  }

  function computeLayout() {
    if (state.mode === 'focused-lesson') layout = layoutFocusedLessonGraph(graph, state.focusId);
    else if (state.mode === 'artifact-neighborhood') layout = layoutArtifactNeighborhoodGraph(graph, state.focusId);
    else layout = layoutOverviewGraph(graph, true);
    const nodeIds = new Set(layout.nodes.map((node) => node.id));
    layout.nodes = layout.nodes.filter((node) => state.nodeTypes.has(node.type) && state.statuses.has(node.status));
    const visibleIds = new Set(layout.nodes.map((node) => node.id));
    layout.edges = layout.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target) && visibleIds.has(edge.source) && visibleIds.has(edge.target) && state.relTypes.has(edge.type));
    if (!layout.nodes.some((node) => node.id === state.selectedNodeId)) state.selectedNodeId = layout.nodes[0]?.id || '';
    if (!layout.edges.some((edge) => edge.id === state.selectedEdgeId)) state.selectedEdgeId = '';
  }

  function fitView() {
    const width = Math.max(900, layout?.width || 1120);
    const height = Math.max(560, layout?.height || 720);
    state.viewBox = { x: 0, y: 0, width, height };
    state.zoom = 1;
  }

  function renderShell() {
    const container = target();
    if (!container) return;
    container.innerHTML = `
      <section class="nv-kg" aria-labelledby="nv-kg-title">
        <header class="nv-kg-hero nv-curriculum-hero">
          <div class="nv-stack nv-stack--gap-xs">
            <span class="nv-curriculum-card__kicker">NV-900-UI10</span>
            <h1 id="nv-kg-title">Knowledge Graph & Semantic Exploration</h1>
            <p>Deterministic visualization of curriculum hierarchy, siblings, and explicit artifact relationships from the frontend curriculum index.</p>
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
        <section class="nv-kg-fallback" data-kg-fallback aria-label="Text fallback for graph nodes and relationships"></section>
      </section>`;
  }

  function renderToolbar() {
    const toolbar = root.querySelector('.nv-kg-toolbar');
    if (!toolbar) return;
    toolbar.innerHTML = '';
    const mode = el('select', 'nv-input nv-kg-control');
    mode.setAttribute('aria-label', 'Graph mode');
    [
      ['overview', 'Curriculum Overview'], ['focused-lesson', 'Focused Lesson'], ['artifact-neighborhood', 'Artifact Neighborhood']
    ].forEach(([value, label]) => {
      const option = el('option', '', label);
      option.value = value;
      option.selected = state.mode === value;
      mode.append(option);
    });
    mode.addEventListener('change', () => { state.mode = mode.value; updateDefaultsForMode(); render(); });
    const search = el('input', 'nv-input nv-kg-search');
    search.type = 'search'; search.placeholder = 'Search and focus curriculum item'; search.setAttribute('list', 'nv-kg-search-options'); search.value = state.focusId;
    search.addEventListener('change', () => focusSearch(search.value));
    const datalist = el('datalist'); datalist.id = 'nv-kg-search-options';
    graph.nodes.slice().sort((a, b) => a.title.localeCompare(b.title)).forEach((node) => {
      const option = el('option'); option.value = node.id; option.label = `${node.title} (${node.typeLabel})`; datalist.append(option);
    });
    toolbar.append(mode, search, datalist, filterGroup('Node type', NODE_TYPES, state.nodeTypes), filterGroup('Status', ['Draft', 'Reviewed'], state.statuses), filterGroup('Relationship', REL_TYPES, state.relTypes));
    [['Zoom in', () => zoomView(0.82)], ['Zoom out', () => zoomView(1.18)], ['Pan left', () => panView(-80, 0)], ['Pan right', () => panView(80, 0)], ['Pan up', () => panView(0, -80)], ['Pan down', () => panView(0, 80)], ['Reset', resetView], ['Fit', () => { fitView(); paintGraph(); }], ['Open selected', openSelected]].forEach(([label, action]) => {
      const button = el('button', 'nv-button', label); button.type = 'button'; button.dataset.variant = 'secondary'; button.addEventListener('click', action); toolbar.append(button);
    });
  }

  function filterGroup(label, values, set) {
    const wrapper = el('fieldset', 'nv-kg-filter');
    wrapper.append(el('legend', '', label));
    values.forEach((value) => {
      const id = `nv-kg-${label}-${value}`.replace(/\W+/g, '-');
      const item = el('label', 'nv-kg-check');
      const input = el('input'); input.type = 'checkbox'; input.id = id; input.checked = set.has(value);
      input.addEventListener('change', () => { input.checked ? set.add(value) : set.delete(value); render(); });
      item.append(input, document.createTextNode(value.replace(/_/g, ' ')));
      wrapper.append(item);
    });
    return wrapper;
  }

  function updateDefaultsForMode() {
    if (state.mode === 'overview') { state.nodeTypes = new Set(['path', 'module', 'lesson']); state.relTypes = new Set(['contains', 'sibling']); }
    if (state.mode === 'focused-lesson') { state.nodeTypes = new Set(NODE_TYPES); state.relTypes = new Set(REL_TYPES); if (graph.nodeById.get(state.focusId)?.type !== 'lesson') state.focusId = graph.nodes.find((node) => node.type === 'lesson')?.id || ''; }
    if (state.mode === 'artifact-neighborhood') { state.nodeTypes = new Set(NODE_TYPES); state.relTypes = new Set(REL_TYPES); if (graph.nodeById.get(state.focusId)?.type !== 'artifact') state.focusId = graph.nodes.find((node) => node.type === 'artifact')?.id || ''; }
  }

  function focusSearch(value) {
    const query = normalize(value);
    const match = graph.nodeById.get(value) || graph.nodes.find((node) => normalize(node.title).includes(query) || normalize(node.id).includes(query));
    if (!match) return;
    state.focusId = match.id;
    state.selectedNodeId = match.id;
    if (match.type === 'artifact') state.mode = 'artifact-neighborhood';
    else if (match.type === 'lesson') state.mode = 'focused-lesson';
    render();
  }

  function paintGraph() {
    const canvas = root.querySelector('[data-kg-canvas]');
    if (!canvas) return;
    renderGraphSvg(canvas, layout, state, {
      selectNode, selectEdge, previewNode: (id) => { state.previewNodeId = id; renderInspector(); }, moveNodeFocus
    });
  }

  function renderInspector() {
    const inspector = root.querySelector('[data-kg-inspector]');
    if (!inspector) return;
    const edge = layout?.edges.find((candidate) => candidate.id === state.selectedEdgeId);
    const node = graph.nodeById.get(state.selectedNodeId || state.previewNodeId);
    inspector.innerHTML = '';
    if (edge) {
      const source = graph.nodeById.get(edge.source); const target = graph.nodeById.get(edge.target);
      inspector.append(el('h2', '', 'Selected Relationship'), detail('Relationship type', edge.label), detail('Source', source?.title), detail('Target', target?.title), detail('Explanation', relationDescription(edge)), actionButton('Focus source', () => selectNode(edge.source)), actionButton('Focus target', () => selectNode(edge.target)));
      return;
    }
    if (node) {
      const list = el('div', 'nv-kg-inspector-list');
      list.append(detail('Type', node.typeLabel), detail('Status', node.status), detail('Lineage', (node.lineage.labels || []).join(' / ') || 'Not specified'));
      if (node.metadata.estimatedDuration) list.append(detail('Estimated duration', node.metadata.estimatedDuration));
      if (node.metadata.artifactType) list.append(detail('Artifact type', node.metadata.artifactType));
      if (node.metadata.instructionalObjectives?.length) list.append(detail('Instructional objectives', node.metadata.instructionalObjectives.join(', ')));
      if (node.metadata.overview) list.append(detail('Context', node.metadata.overview));
      inspector.append(el('h2', '', node.title), list, actionButton('Open resource', () => { window.location.hash = node.route; }), actionButton('Focus node', () => { state.focusId = node.id; if (node.type === 'artifact') state.mode = 'artifact-neighborhood'; if (node.type === 'lesson') state.mode = 'focused-lesson'; render(); }));
      return;
    }
    inspector.append(el('h2', '', 'Graph Summary'), detail('Nodes', String(layout?.nodes.length || 0)), detail('Relationships', String(layout?.edges.length || 0)), detail('Boundary', 'Existing curriculum metadata only. No inferred semantic edges are generated.'));
  }

  function detail(label, value) {
    const item = el('div', 'nv-kg-detail'); item.append(el('span', 'nv-kg-detail__label', label), el('span', 'nv-kg-detail__value', value || 'Not specified')); return item;
  }

  function actionButton(label, action) {
    const button = el('button', 'nv-button', label); button.type = 'button'; button.dataset.variant = 'secondary'; button.addEventListener('click', action); return button;
  }

  function renderFallback() {
    const fallback = root.querySelector('[data-kg-fallback]');
    if (!fallback) return;
    fallback.innerHTML = '<h2>Current Graph Text View</h2>';
    const nodes = el('ol', 'nv-kg-fallback-list');
    layout.nodes.forEach((node) => { const item = el('li'); const link = el('a', '', `${node.typeLabel}: ${node.title}`); link.href = node.route; item.append(link); nodes.append(item); });
    const edges = el('ol', 'nv-kg-fallback-list');
    layout.edges.forEach((edge) => { const item = el('li', '', `${edge.label}: ${graph.nodeById.get(edge.source)?.title || edge.source} → ${graph.nodeById.get(edge.target)?.title || edge.target}`); edges.append(item); });
    fallback.append(el('h3', '', 'Current graph nodes'), nodes, el('h3', '', 'Current graph relationships'), edges);
  }

  function selectNode(id) { state.selectedNodeId = id; state.selectedEdgeId = ''; announce(`Selected ${graph.nodeById.get(id)?.title || id}`); renderInspector(); paintGraph(); }
  function selectEdge(id) { state.selectedEdgeId = id; state.selectedNodeId = ''; announce(`Selected relationship ${layout.edges.find((edge) => edge.id === id)?.label || id}`); renderInspector(); paintGraph(); }
  function moveNodeFocus(key) {
    const current = Math.max(0, layout.nodes.findIndex((node) => node.id === state.selectedNodeId));
    const next = key === 'ArrowLeft' || key === 'ArrowUp' ? Math.max(0, current - 1) : Math.min(layout.nodes.length - 1, current + 1);
    const element = root.querySelector(`[data-node-id="${layout.nodes[next]?.id}"]`);
    if (element) { element.focus(); selectNode(layout.nodes[next].id); }
  }
  function announce(message) { const announcer = root.querySelector('[data-kg-announcer]'); if (announcer) announcer.textContent = message; }
  function openSelected() { const node = graph.nodeById.get(state.selectedNodeId); if (node) window.location.hash = node.route; }
  function resetView() { fitView(); render(); }
  function zoomView(factor) {
    const nextWidth = Math.max(360, Math.min((layout?.width || 1120) * 1.8, state.viewBox.width * factor));
    const nextHeight = Math.max(260, Math.min((layout?.height || 720) * 1.8, state.viewBox.height * factor));
    state.viewBox = {
      x: state.viewBox.x + (state.viewBox.width - nextWidth) / 2,
      y: state.viewBox.y + (state.viewBox.height - nextHeight) / 2,
      width: nextWidth,
      height: nextHeight
    };
    paintGraph();
  }
  function panView(dx, dy) {
    state.viewBox = { ...state.viewBox, x: state.viewBox.x + dx, y: state.viewBox.y + dy };
    paintGraph();
  }

  function render() {
    if (!target() || !graph) return;
    computeLayout(); fitView(); renderToolbar(); paintGraph(); renderInspector(); renderFallback();
  }

  async function renderCurrentRoute() {
    if (!target()) return;
    renderShell();
    try {
      await ensureGraph();
      const params = paramsFromHash();
      state.mode = params.get('mode') || state.mode;
      state.focusId = params.get('focus') || state.focusId || graph.nodes.find((node) => node.type === 'lesson')?.id || '';
      updateDefaultsForMode();
      render();
    } catch (error) {
      target().innerHTML = `<section class="nv-panel"><h1>Knowledge graph unavailable</h1><p>${error.message}</p></section>`;
    }
  }

  function init() {
    window.addEventListener('nv:routerendered', () => renderCurrentRoute());
    renderCurrentRoute();
  }

  return { init, renderCurrentRoute };
}
