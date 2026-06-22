import { hasVisualization } from '../visualizations/visualization-registry.js';
import { buildKnowledgeGraphModel, DEPENDENCY_TYPES } from './knowledge-graph-model.js';

function el(tag, cls = '', text = '') {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

function normalize(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function createKnowledgeGraphController(options = {}) {
  const root = options.root || document;
  let graph = null;

  const state = {
    // 'overview' | 'path' | 'module' | 'lesson' | 'artifact'
    mode: 'overview',
    selectedNodeId: null,
  };

  const historyStack = [];

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

  function selectNode(nodeId, pushHistory = true) {
    const node = graph.nodeById.get(nodeId);
    if (!node) {
      resetGraph(pushHistory);
      return;
    }
    if (pushHistory && state.selectedNodeId !== node.id) {
      historyStack.push(state.selectedNodeId);
    }
    state.selectedNodeId = node.id;
    state.mode = node.type;
    applyCurrentRender();
  }

  function goBack() {
    if (historyStack.length > 0) {
      const prev = historyStack.pop();
      if (prev) {
        selectNode(prev, false);
      } else {
        resetGraph(false);
      }
    } else {
      if (state.selectedNodeId) {
        const parent = getParent(state.selectedNodeId);
        if (parent) {
          selectNode(parent.id, true);
        } else {
          resetGraph(true);
        }
      } else {
        resetGraph(true);
      }
    }
  }

  function resetGraph(pushHistory = true) {
    if (pushHistory && state.selectedNodeId !== null) {
      historyStack.push(state.selectedNodeId);
    }
    state.selectedNodeId = null;
    state.mode = 'overview';
    applyCurrentRender();
  }

  function applyCurrentRender() {
    renderAtlas();
    renderToolbar();
    renderInspector();
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

    // Search input group
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
      selectNode(match.id);
    });
    const searchStatus = el('span', 'nv-kg-search-status');
    searchStatus.id = 'nv-kg-search-status';
    searchStatus.setAttribute('aria-live', 'polite');
    searchGroup.append(search, searchStatus, datalist);

    // Stage Navigation Actions
    const navGroup = group('Stage navigation');
    navGroup.append(
      button('Back', goBack),
      button('Reset Atlas', () => resetGraph(true))
    );

    // View Actions
    const viewGroup = group('View actions');
    // Fit scrolls page back to top to align perfectly
    viewGroup.append(
      button('Fit', () => {
        const wrap = root.querySelector('[data-kg-canvas]');
        if (wrap) { wrap.scrollTop = 0; wrap.scrollLeft = 0; }
      }),
      button('Open Selected', () => {
        const node = state.selectedNodeId ? graph.nodeById.get(state.selectedNodeId) : null;
        if (node) window.location.hash = node.route;
      }, 'primary')
    );

    // Legend
    const legend = group('Legend');
    legend.classList.add('nv-kg-legend');
    [['path', 'Path'], ['module', 'Module'], ['lesson', 'Lesson'], ['artifact', 'Artifact']].forEach(([type, label]) => {
      legend.append(el('span', `nv-kg-legend-item nv-kg-legend-item--${type}`, label));
    });

    toolbar.append(searchGroup, navGroup, viewGroup, legend);
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
      const paths = graph.nodes.filter(n => n.type === 'path').length;
      const modules = graph.nodes.filter(n => n.type === 'module').length;
      const lessons = graph.nodes.filter(n => n.type === 'lesson').length;
      const artifacts = graph.nodes.filter(n => n.type === 'artifact').length;

      panel.append(
        el('h2', 'nv-kg-insp-title', 'Curriculum Atlas'),
        detail('Current stage', 'Stage 1 — Overview'),
        detail('Total Paths', String(paths)),
        detail('Total Modules', String(modules)),
        detail('Total Lessons', String(lessons)),
        detail('Total Artifacts', String(artifacts))
      );

      const guide = el('div', 'nv-kg-insp-guide');
      guide.innerHTML = `
        <h3>How to explore</h3>
        <p>Select any Learning Path card in the atlas grid to focus. You can drill down hierarchically from Path to Module, Lesson, and individual Artifacts.</p>
        <h3>Keyboard shortcuts</h3>
        <ul>
          <li><kbd>Tab</kbd> to move focus</li>
          <li><kbd>Enter</kbd> or <kbd>Space</kbd> to select card</li>
          <li><kbd>Backspace</kbd> to go back</li>
        </ul>
      `;
      panel.append(guide);
      return;
    }

    const children = getChildren(node.id);
    const siblings = getSiblings(node);
    const dependencies = getDependencies(node.id);

    panel.append(
      el('span', `nv-kg-insp-type nv-kg-insp-type--${node.type}`, node.typeLabel),
      el('h2', 'nv-kg-insp-title', node.title)
    );

    const details = el('div', 'nv-kg-insp-details');
    details.append(
      detail('Status', node.status),
      detail('Lineage', (node.lineage?.labels || []).join(' > ')),
      detail('Children count', String(children.length)),
      detail('Siblings count', String(siblings.length)),
      detail('Dependencies count', String(dependencies.length))
    );
    panel.append(details);

    const actions = el('div', 'nv-kg-insp-actions');
    actions.append(
      button('Open Resource', () => { window.location.hash = node.route; }, 'primary'),
      button('Back', goBack),
      button('Reset Atlas', () => resetGraph(true))
    );
    panel.append(actions);
  }  function getCategory(pathTitle) {
    const title = pathTitle.toLowerCase();
    if (title.includes('retrieval') || title.includes('rag') || title.includes('vector')) {
      return 'Retrieval & Context Optimization';
    }
    if (title.includes('agent') || title.includes('flow') || title.includes('pipeline')) {
      return 'Agentic & Pipeline Orchestration';
    }
    if (title.includes('neural') || title.includes('optimization') || title.includes('learning')) {
      return 'Foundational Networks & Math';
    }
    return 'Generative Architectures & Research';
  }

  function renderAtlas() {
    const canvasWrap = root.querySelector('[data-kg-canvas]');
    if (!canvasWrap) return;
    canvasWrap.innerHTML = '';

    const atlasContainer = el('div', 'nv-kg-atlas');

    if (state.mode === 'overview') {
      const gallery = el('div', 'nv-kg-asymmetric-gallery');
      const paths = graph.nodes.filter(n => n.type === 'path');

      // Group paths by category
      const groups = {};
      paths.forEach(path => {
        const cat = getCategory(path.title);
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(path);
      });

      const categories = [
        'Foundational Networks & Math',
        'Retrieval & Context Optimization',
        'Agentic & Pipeline Orchestration',
        'Generative Architectures & Research'
      ];

      categories.forEach((catName, idx) => {
        const pathList = groups[catName] || [];
        if (pathList.length === 0) return;

        const section = el('section', 'nv-kg-gallery-section');
        const header = el('h4', 'nv-kg-gallery-header');
        header.innerHTML = `<span>0${idx + 1} //</span> ${catName}`;

        const grid = el('div', 'nv-kg-gallery-grid');
        pathList.forEach(path => {
          const card = el('div', 'nv-kg-card nv-kg-card--path');
          card.tabIndex = 0;
          card.setAttribute('aria-label', `Learning Path: ${path.title}`);

          const modules = getChildren(path.id);
          const lessons = modules.flatMap(m => getChildren(m.id));
          const artifacts = lessons.flatMap(l => getChildren(l.id));

          card.innerHTML = `
            <div class="nv-kg-card__header">
              <span class="nv-kg-card__kicker">Learning Path</span>
              <span class="nv-kg-status nv-kg-status--${path.status.toLowerCase()}">${path.status}</span>
            </div>
            <h3 class="nv-kg-card__title">${path.title}</h3>
            <p class="nv-kg-card__desc">${path.metadata?.overview || 'Curriculum Path'}</p>
            <div class="nv-kg-card__footer">
              <span class="nv-kg-chip"><b>${modules.length}</b> Modules</span>
              <span class="nv-kg-chip"><b>${lessons.length}</b> Lessons</span>
              <span class="nv-kg-chip"><b>${artifacts.length}</b> Artifacts</span>
            </div>
          `;
          card.addEventListener('click', () => selectNode(path.id));
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              selectNode(path.id);
            }
          });
          grid.append(card);
        });

        section.append(header, grid);
        gallery.append(section);
      });

      atlasContainer.append(gallery);
    }
    else if (state.mode === 'path') {
      const pathNode = graph.nodeById.get(state.selectedNodeId);
      const modules = getChildren(pathNode.id);

      const layout = el('div', 'nv-kg-stage-layout');
      const heroCol = el('div', 'nv-kg-stage-hero-col');
      const contentCol = el('div', 'nv-kg-stage-content-col');

      const heroCard = el('div', 'nv-kg-card nv-kg-card--path nv-kg-hero-card');
      heroCard.innerHTML = `
        <div class="nv-kg-card__header">
          <span class="nv-kg-card__kicker">Selected Learning Path</span>
          <span class="nv-kg-status nv-kg-status--${pathNode.status.toLowerCase()}">${pathNode.status}</span>
        </div>
        <h3 class="nv-kg-card__title">${pathNode.title}</h3>
        <p class="nv-kg-card__desc">${pathNode.metadata?.overview || 'Curriculum Path'}</p>
        <div class="nv-kg-card__footer">
          <span class="nv-kg-chip"><b>${modules.length}</b> Modules</span>
        </div>
      `;
      heroCol.append(heroCard);

      const actions = el('div', 'nv-kg-insp-actions');
      actions.append(
        button('Back to Atlas', goBack),
        button('Open Path', () => { window.location.hash = pathNode.route; }, 'primary')
      );
      heroCol.append(actions);

      const sectionTitle = el('h4', 'nv-kg-section-title', 'Contained Modules');
      sectionTitle.append(el('span', 'nv-kg-section-line'));
      const modulesGrid = el('div', 'nv-kg-gallery-grid');
      contentCol.append(sectionTitle, modulesGrid);

      modules.forEach(mod => {
        const card = el('div', 'nv-kg-card nv-kg-card--module');
        card.tabIndex = 0;
        card.setAttribute('aria-label', `Module: ${mod.title}`);

        const modLessons = getChildren(mod.id);
        const modArtifacts = modLessons.flatMap(l => getChildren(l.id));

        card.innerHTML = `
          <div class="nv-kg-card__header">
            <span class="nv-kg-card__kicker">Module</span>
            <span class="nv-kg-status nv-kg-status--${mod.status.toLowerCase()}">${mod.status}</span>
          </div>
          <h3 class="nv-kg-card__title">${mod.title}</h3>
          <p class="nv-kg-card__desc">${mod.metadata?.overview || 'Module details'}</p>
          <div class="nv-kg-card__footer">
            <span class="nv-kg-chip"><b>${modLessons.length}</b> Lessons</span>
            <span class="nv-kg-chip"><b>${modArtifacts.length}</b> Artifacts</span>
          </div>
        `;
        card.addEventListener('click', () => selectNode(mod.id));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectNode(mod.id);
          }
        });
        modulesGrid.append(card);
      });
      const currentCategory = getCategory(pathNode.title);
      const otherPaths = graph.nodes.filter(n => n.type === 'path' && n.id !== pathNode.id && getCategory(n.title) === currentCategory);
      if (otherPaths.length > 0) {
        const relatedBox = el('div', 'nv-kg-related-paths-box');
        const relatedTitle = el('h4', 'nv-kg-related-title', 'Related Paths');
        const relatedList = el('div', 'nv-kg-related-list');
        otherPaths.forEach(op => {
          const item = el('button', 'nv-kg-related-item');
          item.type = 'button';
          item.innerHTML = `<span class="nv-kg-related-bullet"></span><span class="nv-kg-related-text">${op.title}</span>`;
          item.addEventListener('click', () => selectNode(op.id));
          relatedList.append(item);
        });
        relatedBox.append(relatedTitle, relatedList);
        heroCol.append(relatedBox);
      }

      layout.append(heroCol, contentCol);
      atlasContainer.append(layout);
    }
    else if (state.mode === 'module') {
      const modNode = graph.nodeById.get(state.selectedNodeId);
      const parentPath = getParent(modNode.id);
      const lessons = getChildren(modNode.id);

      const layout = el('div', 'nv-kg-stage-layout');
      const heroCol = el('div', 'nv-kg-stage-hero-col');
      const contentCol = el('div', 'nv-kg-stage-content-col');

      const heroCard = el('div', 'nv-kg-card nv-kg-card--module nv-kg-hero-card');
      heroCard.innerHTML = `
        <div class="nv-kg-card__header">
          <span class="nv-kg-card__kicker">Selected Module (${parentPath ? parentPath.title : 'Path'})</span>
          <span class="nv-kg-status nv-kg-status--${modNode.status.toLowerCase()}">${modNode.status}</span>
        </div>
        <h3 class="nv-kg-card__title">${modNode.title}</h3>
        <p class="nv-kg-card__desc">${modNode.metadata?.overview || 'Module details'}</p>
      `;
      heroCol.append(heroCard);

      const actions = el('div', 'nv-kg-insp-actions');
      actions.append(
        button('Back to Path', goBack),
        button('Open Module', () => { window.location.hash = modNode.route; }, 'primary')
      );
      heroCol.append(actions);

      const sectionTitle = el('h4', 'nv-kg-section-title', 'Contained Lessons');
      sectionTitle.append(el('span', 'nv-kg-section-line'));
      const lessonsGrid = el('div', 'nv-kg-gallery-grid');
      contentCol.append(sectionTitle, lessonsGrid);

      lessons.forEach(lesson => {
        const card = el('div', 'nv-kg-card nv-kg-card--lesson');
        card.tabIndex = 0;
        card.setAttribute('aria-label', `Lesson: ${lesson.title}`);

        const lessArtifacts = getChildren(lesson.id);

        card.innerHTML = `
          <div class="nv-kg-card__header">
            <span class="nv-kg-card__kicker">Lesson</span>
            <span class="nv-kg-status nv-kg-status--${lesson.status.toLowerCase()}">${lesson.status}</span>
          </div>
          <h3 class="nv-kg-card__title">${lesson.title}</h3>
          <div class="nv-kg-card__footer">
            <span class="nv-kg-chip"><b>${lessArtifacts.length}</b> Artifacts</span>
          </div>
        `;
        card.addEventListener('click', () => selectNode(lesson.id));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectNode(lesson.id);
          }
        });
        lessonsGrid.append(card);
      });

      const siblingsTitle = el('h4', 'nv-kg-section-title', 'Sibling Modules');
      siblingsTitle.append(el('span', 'nv-kg-section-line'));
      const siblingsStrip = el('div', 'nv-kg-siblings-strip');
      const siblings = getSiblings(modNode);
      siblings.forEach(sib => {
        const pill = el('button', 'nv-kg-sibling-pill', sib.title);
        pill.type = 'button';
        pill.addEventListener('click', () => selectNode(sib.id));
        siblingsStrip.append(pill);
      });
      contentCol.append(siblingsTitle, siblingsStrip);

      layout.append(heroCol, contentCol);
      atlasContainer.append(layout);
    }
    else if (state.mode === 'lesson') {
      const lessonNode = graph.nodeById.get(state.selectedNodeId);
      const parentModule = getParent(lessonNode.id);
      const artifacts = getChildren(lessonNode.id);

      const layout = el('div', 'nv-kg-stage-layout');
      const heroCol = el('div', 'nv-kg-stage-hero-col');
      const contentCol = el('div', 'nv-kg-stage-content-col');

      const heroCard = el('div', 'nv-kg-card nv-kg-card--lesson nv-kg-hero-card');
      heroCard.innerHTML = `
        <div class="nv-kg-card__header">
          <span class="nv-kg-card__kicker">Selected Lesson (${parentModule ? parentModule.title : 'Module'})</span>
          <span class="nv-kg-status nv-kg-status--${lessonNode.status.toLowerCase()}">${lessonNode.status}</span>
        </div>
        <h3 class="nv-kg-card__title">${lessonNode.title}</h3>
      `;
      heroCol.append(heroCard);

      const actions = el('div', 'nv-kg-insp-actions');
      actions.append(
        button('Back to Module', goBack),
        button('Open Lesson', () => { window.location.hash = lessonNode.route; }, 'primary')
      );
      heroCol.append(actions);

      const sectionTitle = el('h4', 'nv-kg-section-title', 'Artifact Flow Order');
      sectionTitle.append(el('span', 'nv-kg-section-line'));
      const flowList = el('div', 'nv-kg-flow-list');
      contentCol.append(sectionTitle, flowList);

      artifacts.forEach((art, index) => {
        const flowItem = el('div', 'nv-kg-flow-item');
        const indexBadge = el('span', 'nv-kg-flow-index', String(index + 1));

        const card = el('div', 'nv-kg-card nv-kg-card--artifact nv-kg-flow-card');
        card.tabIndex = 0;
        card.setAttribute('aria-label', `Artifact: ${art.title}`);

        const durStr = art.metadata?.duration ? `${art.metadata.duration} min` : '';

        card.innerHTML = `
          <div class="nv-kg-card__header">
            <span class="nv-kg-card__kicker">${art.metadata?.artifactType || 'Artifact'}</span>
            <span class="nv-kg-status nv-kg-status--${art.status.toLowerCase()}">${art.status}</span>
          </div>
          <h3 class="nv-kg-card__title">${art.title}</h3>
          <div class="nv-kg-card__footer">
            ${durStr ? `<span class="nv-kg-chip">${durStr}</span>` : ''}
          </div>
        `;
        card.addEventListener('click', () => selectNode(art.id));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectNode(art.id);
          }
        });
        flowItem.append(indexBadge, card);
        flowList.append(flowItem);
      });

      const siblingsTitle = el('h4', 'nv-kg-section-title', 'Sibling Lessons');
      siblingsTitle.append(el('span', 'nv-kg-section-line'));
      const siblingsStrip = el('div', 'nv-kg-siblings-strip');
      const siblings = getSiblings(lessonNode);
      siblings.forEach(sib => {
        const pill = el('button', 'nv-kg-sibling-pill', sib.title);
        pill.type = 'button';
        pill.addEventListener('click', () => selectNode(sib.id));
        siblingsStrip.append(pill);
      });
      contentCol.append(siblingsTitle, siblingsStrip);

      layout.append(heroCol, contentCol);
      atlasContainer.append(layout);
    }
    else if (state.mode === 'artifact') {
      const artNode = graph.nodeById.get(state.selectedNodeId);
      const parentLesson = getParent(artNode.id);
      const deps = getDependencies(artNode.id);

      const layout = el('div', 'nv-kg-stage-layout');
      const heroCol = el('div', 'nv-kg-stage-hero-col');
      const contentCol = el('div', 'nv-kg-stage-content-col');

      const heroCard = el('div', 'nv-kg-card nv-kg-card--artifact nv-kg-hero-card');
      const durStr = artNode.metadata?.duration ? `${artNode.metadata.duration} min` : '';
      heroCard.innerHTML = `
        <div class="nv-kg-card__header">
          <span class="nv-kg-card__kicker">${artNode.metadata?.artifactType || 'Artifact'} (${parentLesson ? parentLesson.title : 'Lesson'})</span>
          <span class="nv-kg-status nv-kg-status--${artNode.status.toLowerCase()}">${artNode.status}</span>
        </div>
        <h3 class="nv-kg-card__title">${artNode.title}</h3>
        ${durStr ? `<p class="nv-kg-card__desc">Estimated Duration: ${durStr}</p>` : ''}
      `;
      heroCol.append(heroCard);

      const actions = el('div', 'nv-kg-insp-actions');
      actions.append(
        button('Back to Lesson', goBack),
        button('Open Artifact', () => { window.location.hash = artNode.route; }, 'primary')
      );
      heroCol.append(actions);

      if (parentLesson) {
        const sibTitle = el('h4', 'nv-kg-section-title', 'Sibling Artifacts');
        sibTitle.append(el('span', 'nv-kg-section-line'));
        const sibGrid = el('div', 'nv-kg-gallery-grid');
        contentCol.append(sibTitle, sibGrid);

        const siblings = getChildren(parentLesson.id).filter(a => a.id !== artNode.id);
        siblings.forEach(sib => {
          const card = el('div', 'nv-kg-card nv-kg-card--artifact');
          card.tabIndex = 0;
          card.setAttribute('aria-label', `Sibling Artifact: ${sib.title}`);
          card.innerHTML = `
            <div class="nv-kg-card__header">
              <span class="nv-kg-card__kicker">${sib.metadata?.artifactType || 'Artifact'}</span>
              <span class="nv-kg-status nv-kg-status--${sib.status.toLowerCase()}">${sib.status}</span>
            </div>
            <h3 class="nv-kg-card__title">${sib.title}</h3>
          `;
          card.addEventListener('click', () => selectNode(sib.id));
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              selectNode(sib.id);
            }
          });
          sibGrid.append(card);
        });
      }

      if (deps.length > 0) {
        const depTitle = el('h4', 'nv-kg-section-title', 'Declared Dependencies');
        depTitle.append(el('span', 'nv-kg-section-line'));
        const depGrid = el('div', 'nv-kg-gallery-grid');
        contentCol.append(depTitle, depGrid);

        deps.forEach(edge => {
          const depNode = graph.nodeById.get(edge.target);
          if (!depNode) return;
          const card = el('div', `nv-kg-card nv-kg-card--${depNode.type}`);
          card.tabIndex = 0;
          card.setAttribute('aria-label', `Dependency: ${depNode.title}`);
          card.innerHTML = `
            <div class="nv-kg-card__header">
              <span class="nv-kg-card__kicker">${depNode.typeLabel}</span>
              <span class="nv-kg-status nv-kg-status--${depNode.status.toLowerCase()}">${depNode.status}</span>
            </div>
            <h3 class="nv-kg-card__title">${depNode.title}</h3>
          `;
          card.addEventListener('click', () => selectNode(depNode.id));
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              selectNode(depNode.id);
            }
          });
          depGrid.append(card);
        });
      }

      layout.append(heroCol, contentCol);
      atlasContainer.append(layout);
    }

    canvasWrap.append(atlasContainer);
  }

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
          <summary>Atlas controls</summary>
          <div class="nv-kg-toolbar" aria-label="Atlas controls"></div>
        </details>
        <div class="nv-kg-workspace">
          <div class="nv-kg-canvas-wrap" data-kg-canvas></div>
          <aside class="nv-kg-inspector" data-kg-inspector aria-label="Node details"></aside>
        </div>
      </section>`;
  }

  async function renderCurrentRoute() {
    if (!target()) return;
    renderShell();
    try {
      await ensureGraph();
      applyHashFocus();
      applyCurrentRender();
    } catch (err) {
      const container = target();
      if (container) {
        container.innerHTML = `<section class="nv-panel"><h1>Atlas unavailable</h1><p>${err.message}</p></section>`;
      }
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Backspace') {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT' || activeEl.tagName === 'TEXTAREA')) {
        return; // Don't hijack input backspacing
      }
      e.preventDefault();
      goBack();
    }
  }

  function applyHashFocus() {
    const query = String(window.location.hash || '').split('?')[1];
    const focusId = query ? new URLSearchParams(query).get('focus') : '';
    const node = focusId ? graph.nodeById.get(focusId) : null;
    if (node) {
      state.selectedNodeId = node.id;
      state.mode = node.type;
    } else {
      state.selectedNodeId = null;
      state.mode = 'overview';
    }
  }

  function init() {
    window.addEventListener('nv:routerendered', () => renderCurrentRoute());
    window.addEventListener('keydown', handleKeyDown);
    renderCurrentRoute();
  }

  return { init, renderCurrentRoute };
}
