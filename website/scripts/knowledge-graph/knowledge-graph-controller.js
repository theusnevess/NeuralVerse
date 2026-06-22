import { hasVisualization } from '../visualizations/visualization-registry.js';
import { buildKnowledgeGraphModel, DEPENDENCY_TYPES } from './knowledge-graph-model.js';
import { computeLayout, computeVisibleEdges, computeBounds } from './knowledge-graph-layout.js';
import { KnowledgeGraphRenderer } from './knowledge-graph-renderer.js';

function el(tag, cls = '', text = '') {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

function normalize(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

const MODE_BY_TYPE = { path: 'path', module: 'module', lesson: 'lesson', artifact: 'artifact' };

export function createKnowledgeGraphController(options = {}) {
  const root = options.root || document;
  let graph = null;
  let renderer = null;
  let nodePositions = null;
  let visibleEdges = null;

  const state = {
    mode: 'overview',
    focusedNodeId: null,
    expandedNodeIds: new Set(),
    selectedNodeId: null,
  };

  function target() { return root.querySelector('[data-knowledge-graph-root]'); }
  function getChildren(id) { return graph.edges.filter((edge) => edge.type === 'contains' && edge.source === id).map((edge) => graph.nodeById.get(edge.target)).filter(Boolean); }
  function getParent(id) { const edge = graph.edges.find((candidate) => candidate.type === 'contains' && candidate.target === id); return edge ? graph.nodeById.get(edge.source) : null; }
  function getSiblings(node) { const parent = getParent(node.id); return parent ? getChildren(parent.id).filter((child) => child.id !== node.id) : []; }
  function getDependencies(id) { return (graph.edgesByNodeId.get(id) || []).filter((edge) => DEPENDENCY_TYPES.includes(edge.type)); }

  async function ensureGraph() {
    if (graph) return;
    const service = window.NeuralVerse?.curriculum?.service;
    if (!service) throw new Error('Curriculum service unavailable.');
    graph = buildKnowledgeGraphModel(await service.getIndex(), { hasVisualization });
  }

  function annotateNodes() {
    nodePositions.forEach((node, id) => {
      const children = getChildren(id);
      node._childCount = children.length;
      node._expanded = state.expandedNodeIds.has(id) || state.selectedNodeId === id;
      if (node.type === 'path') {
        const modules = children;
        const lessons = modules.flatMap((module) => getChildren(module.id));
        const artifacts = lessons.flatMap((lesson) => getChildren(lesson.id));
        const reviewed = [...modules, ...lessons, ...artifacts].filter((item) => item.status === 'Reviewed').length;
        node._summary = { modules: modules.length, lessons: lessons.length, artifacts: artifacts.length, reviewed };
      }
    });
  }

  function recomputeLayout() {
    nodePositions = computeLayout(graph, state);
    annotateNodes();
    visibleEdges = computeVisibleEdges(graph, nodePositions).filter((edge) => {
      if (edge.type === 'contains') return true;
      return state.mode === 'artifact' && (edge.source === state.selectedNodeId || edge.target === state.selectedNodeId);
    });
  }

  function getLineageIds(node) {
    return new Set([node.lineage?.pathId, node.lineage?.moduleId, node.lineage?.lessonId, node.id].filter(Boolean));
  }

  function getNeighborIds(nodeId) {
    const selected = graph.nodeById.get(nodeId);
    const ids = getLineageIds(selected || {});
    visibleEdges.forEach((edge) => {
      if (edge.source === nodeId) ids.add(edge.target);
      if (edge.target === nodeId) ids.add(edge.source);
    });
    return ids;
  }

  function applyCurrentRender(center = true) {
    recomputeLayout();
    renderer.update(nodePositions, visibleEdges);
    if (state.selectedNodeId) renderer.applyFocus(state.selectedNodeId, getNeighborIds(state.selectedNodeId));
    else renderer.applyFocus('', new Set());
    if (center && state.selectedNodeId) renderer.centerOn(state.selectedNodeId, nodePositions, true);
    else if (center) renderer.fitAll(computeBounds(nodePositions));
    renderToolbar();
    renderInspector();
    renderFallback();
  }

  function focusNode(nodeId) {
    const node = graph.nodeById.get(nodeId);
    if (!node) return;
    
    // Select the node
    state.selectedNodeId = node.id;

    // Toggle expansion
    if (state.expandedNodeIds.has(node.id)) {
      state.expandedNodeIds.delete(node.id);
    } else {
      state.expandedNodeIds.add(node.id);
      // Ensure lineage is open so we can see it (e.g. if found via search)
      getLineageIds(node).forEach(id => {
        if (id !== node.id) state.expandedNodeIds.add(id);
      });
    }

    applyCurrentRender(true);
    renderer.pulseNode(node.id);
    renderer.focusNodeEl(node.id);
  }

  function resetGraph() {
    state.mode = 'overview';
    state.focusedNodeId = null;
    state.selectedNodeId = null;
    state.expandedNodeIds.clear();
    applyCurrentRender(true);
  }

  const handlers = {
    selectNode: focusNode,
    clearSelection() {
      state.selectedNodeId = null;
      renderer.applyFocus('', new Set());
      renderInspector();
    },
    centerNode(nodeId) { renderer.centerOn(nodeId, nodePositions); },
    moveFocus(delta) {
      const ids = renderer.getVisibleNodeIds();
      const cur = ids.indexOf(state.selectedNodeId);
      const next = Math.max(0, Math.min(ids.length - 1, cur + delta));
      if (ids[next]) focusNode(ids[next]);
    },
  };

  function renderShell() {
    const container = target();
    if (!container) return;
    container.innerHTML = `
      <section class="nv-kg" aria-labelledby="nv-kg-title">
        <header class="nv-kg-hero nv-curriculum-hero">
          <div class="nv-stack nv-stack--gap-xs">
            <span class="nv-curriculum-card__kicker">NV-900 Curriculum Atlas</span>
            <h1 id="nv-kg-title">Knowledge Explorer</h1>
            <p class="nv-muted">Explore the curriculum through focused levels: paths, modules, lessons, and artifacts.</p>
          </div>
          <a class="nv-button" data-variant="secondary" href="#/learning">Open Curriculum</a>
        </header>
        <details class="nv-kg-controls" open>
          <summary>Graph controls</summary>
          <div class="nv-kg-toolbar" aria-label="Graph controls"></div>
        </details>
        <div class="nv-kg-workspace">
          <div class="nv-kg-canvas-wrap" data-kg-canvas></div>
          <aside class="nv-kg-inspector" data-kg-inspector aria-label="Node details"></aside>
        </div>
        <section class="nv-kg-fallback" data-kg-fallback aria-label="Text fallback for current graph"></section>
      </section>`;
  }

  function button(label, fn, variant = 'secondary') {
    const b = el('button', 'nv-button nv-kg-tool-btn', label);
    b.type = 'button';
    b.dataset.variant = variant;
    b.addEventListener('click', fn);
    return b;
  }

  function group(title) {
    const wrapper = el('div', 'nv-kg-control-group');
    wrapper.append(el('span', 'nv-kg-control-label', title));
    return wrapper;
  }

  function renderToolbar() {
    const toolbar = root.querySelector('.nv-kg-toolbar');
    if (!toolbar || !graph) return;
    toolbar.innerHTML = '';

    const searchGroup = group('Search / Focus');
    const search = el('input', 'nv-input nv-kg-search');
    search.type = 'search';
    search.placeholder = 'Find any curriculum node...';
    search.setAttribute('aria-label', 'Search curriculum nodes');
    search.setAttribute('list', 'nv-kg-dl');
    search.setAttribute('aria-describedby', 'nv-kg-search-status');
    const datalist = el('datalist');
    datalist.id = 'nv-kg-dl';
    graph.nodes.slice().sort((a, b) => a.title.localeCompare(b.title)).forEach((node) => {
      const option = el('option');
      option.value = node.id;
      option.label = `${node.title} (${node.typeLabel})`;
      datalist.append(option);
    });
    search.addEventListener('change', () => {
      const q = normalize(search.value);
      const match = graph.nodeById.get(search.value) || graph.nodes.find((node) => normalize(node.title).includes(q));
      const status = root.querySelector('#nv-kg-search-status');
      if (!match) {
        if (status) status.textContent = search.value ? `No node found for ${search.value}.` : '';
        return;
      }
      if (status) status.textContent = `Focused ${match.typeLabel}: ${match.title}.`;
      focusNode(match.id);
    });
    const searchStatus = el('span', 'nv-kg-search-status');
    searchStatus.id = 'nv-kg-search-status';
    searchStatus.setAttribute('aria-live', 'polite');
    searchGroup.append(search, searchStatus, datalist);

    const viewGroup = group('View Mode');
    viewGroup.append(button('Overview', resetGraph), button('Focus', () => state.selectedNodeId && focusNode(state.selectedNodeId)));

    const expansionGroup = group('Expansion');
    expansionGroup.append(
      button('Expand', () => state.selectedNodeId && focusNode(state.selectedNodeId)),
      button('Collapse', resetGraph),
      button('Back to Parent', () => { const node = graph.nodeById.get(state.focusedNodeId); const parent = node && getParent(node.id); parent ? focusNode(parent.id) : resetGraph(); }),
    );

    const cameraGroup = group('Camera');
    cameraGroup.append(button('Fit', () => renderer.fitAll(computeBounds(nodePositions))), button('Zoom +', () => renderer.zoomBy(1.25)), button('Zoom -', () => renderer.zoomBy(0.8)));

    const legend = group('Legend');
    legend.classList.add('nv-kg-legend');
    [['path', 'Path'], ['module', 'Module'], ['lesson', 'Lesson'], ['artifact', 'Artifact']].forEach(([type, label]) => legend.append(el('span', `nv-kg-legend-item nv-kg-legend-item--${type}`, label)));

    toolbar.append(searchGroup, viewGroup, expansionGroup, cameraGroup, legend);
  }

  function detail(label, value) {
    const d = el('div', 'nv-kg-detail');
    d.append(el('span', 'nv-kg-detail__label', label), el('span', 'nv-kg-detail__value', value || '-'));
    return d;
  }

  function renderInspector() {
    const panel = root.querySelector('[data-kg-inspector]');
    if (!panel) return;
    panel.innerHTML = '';
    const node = state.selectedNodeId ? graph.nodeById.get(state.selectedNodeId) : null;

    if (!node) {
      const visible = nodePositions ? nodePositions.size : 0;
      panel.append(el('h2', 'nv-kg-insp-title', 'Curriculum Atlas'), detail('Current level', 'Learning Path Overview'), detail('Visible nodes', String(visible)), detail('Visible relationships', String(visibleEdges?.length || 0)));
      const guide = el('div', 'nv-kg-insp-guide');
      guide.innerHTML = '<h3>How to explore</h3><p>Select a Learning Path to reveal modules. Continue into a module for lessons, a lesson for artifacts, or search any item to jump directly to its local neighborhood.</p><h3>Shortcuts</h3><p>Tab to nodes, Enter or Space to focus, arrow keys to move between visible nodes.</p>';
      panel.append(guide);
      return;
    }

    const children = getChildren(node.id);
    const siblings = getSiblings(node);
    const dependencies = getDependencies(node.id);
    panel.append(el('span', `nv-kg-insp-type nv-kg-insp-type--${node.type}`, node.typeLabel), el('h2', 'nv-kg-insp-title', node.title));
    const details = el('div', 'nv-kg-insp-details');
    details.append(
      detail('Status', node.status),
      detail('Lineage', (node.lineage?.labels || []).join(' > ')),
      detail('Description', node.metadata?.overview || node.metadata?.artifactType || 'Local curriculum node'),
      detail('Children', String(children.length)),
      detail('Siblings', String(siblings.length)),
      detail('Dependencies', String(dependencies.length)),
      detail('Focus level', state.mode),
    );
    panel.append(details);

    const actions = el('div', 'nv-kg-insp-actions');
    actions.append(
      button('Focus', () => focusNode(node.id)),
      button('Expand children', () => focusNode(node.id)),
      button('Collapse', resetGraph),
      button('Back to parent', () => { const parent = getParent(node.id); parent ? focusNode(parent.id) : resetGraph(); }),
      button('Open resource', () => { window.location.hash = node.route; }, 'primary'),
      button('Center view', () => renderer.centerOn(node.id, nodePositions)),
    );
    panel.append(actions);
  }

  function renderFallback() {
    const fallback = root.querySelector('[data-kg-fallback]');
    if (!fallback || !nodePositions) return;
    fallback.innerHTML = '';
    const list = el('ol', 'nv-kg-fallback-list');
    [...nodePositions.values()].forEach((node) => {
      const item = el('li');
      const trigger = el('button', 'nv-kg-fallback-button', `${node.typeLabel}: ${node.title}`);
      trigger.type = 'button';
      trigger.addEventListener('click', () => focusNode(node.id));
      item.append(trigger);
      list.append(item);
    });
    fallback.append(el('h2', '', 'Current Atlas Text View'), list);
  }

  function applyHashFocus() {
    const query = String(window.location.hash || '').split('?')[1];
    const focusId = query ? new URLSearchParams(query).get('focus') : '';
    const node = focusId ? graph.nodeById.get(focusId) : null;
    if (!node) return;
    state.mode = MODE_BY_TYPE[node.type] || 'overview';
    state.focusedNodeId = node.id;
    state.selectedNodeId = node.id;
    state.expandedNodeIds = getLineageIds(node);
  }

  async function renderCurrentRoute() {
    if (!target()) {
      if (renderer) renderer.destroy();
      renderer = null;
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
      if (state.selectedNodeId) requestAnimationFrame(() => renderer.applyFocus(state.selectedNodeId, getNeighborIds(state.selectedNodeId)));
      renderToolbar();
      renderInspector();
      renderFallback();
    } catch (err) {
      const container = target();
      if (container) container.innerHTML = `<section class="nv-panel"><h1>Graph unavailable</h1><p>${err.message}</p></section>`;
    }
  }

  function init() {
    window.addEventListener('nv:routerendered', () => renderCurrentRoute());
    window.addEventListener('hashchange', () => {
      if (!String(window.location.hash || '').startsWith('#/knowledge-graph') && renderer) {
        renderer.destroy();
        renderer = null;
      }
    });
    renderCurrentRoute();
  }

  return { init, renderCurrentRoute };
}
