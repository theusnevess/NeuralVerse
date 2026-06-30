import { createCurriculumService } from './curriculum-service.js?v=1';
import { hasVisualization, createVisualization } from '../visualizations/visualization-registry.js';

function el(tagName, className = '', text = '') {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function routeParts(hashValue = window.location.hash) {
  return String(hashValue || '').replace(/^#\/?/, '').split('/').filter(Boolean);
}

function statusBadge(status) {
  const badge = el('span', 'nv-badge', status || 'Draft');
  badge.dataset.variant = status === 'Reviewed' ? 'success' : 'neutral';
  badge.title = `${status} is a curriculum lifecycle status. It does not imply certification or learner achievement.`;
  return badge;
}

function sortByStatus(items) {
  return [...items].sort((a, b) => {
    if (a.canonicalStatus === b.canonicalStatus) return 0;
    return a.canonicalStatus === 'Reviewed' ? -1 : 1;
  });
}

function typeLabel(type) {
  return type === 'Interactive Visualization' ? 'Interactive Visualization Specification' : type;
}

function meta(label, value) {
  const item = el('span', 'nv-card-meta__item');
  item.textContent = `${label}: ${value || 'Not specified'}`;
  return item;
}

function card(title, summary, href, status, extra = [], options = {}) {
  const article = el('article', `nv-card nv-curriculum-card ${options.kind ? `nv-curriculum-card--${options.kind}` : ''}`.trim());
  article.dataset.status = status || 'Draft';
  const header = el('div', 'nv-cluster nv-cluster--gap-sm');
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'flex-start';

  const headingGroup = el('div', 'nv-stack nv-stack--gap-xs');
  if (options.kicker) {
    headingGroup.append(el('span', 'nv-curriculum-card__kicker', options.kicker));
  }
  const heading = el('h3', 'nv-curriculum-card__title');
  const titleLink = el('a', '', title);
  titleLink.href = href;
  heading.append(titleLink);
  headingGroup.append(heading);
  header.append(headingGroup, statusBadge(status));

  const description = el('p', 'nv-curriculum-card__description', summary || 'Canonical curriculum composition.');
  const metaRow = el('div', 'nv-card-meta');
  extra.forEach((item) => metaRow.append(item));

  const actions = el('div');
  actions.style.marginTop = 'auto';
  actions.style.paddingTop = 'var(--sys-space-stack-sm)';
  const link = el('a', 'nv-button', 'Open');
  link.dataset.variant = 'secondary';
  link.href = href;
  actions.append(link);

  article.append(header, description, metaRow);
  if (options.flow) article.append(options.flow);
  article.append(actions);
  return article;
}

function renderCrossLinkCard(entity, entityType, href) {
  const article = el('article', 'nv-card nv-cross-link-card');
  article.dataset.status = entity.canonicalStatus || 'Draft';

  const header = el('div', 'nv-cluster nv-cluster--gap-sm');
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'flex-start';

  const headingGroup = el('div', 'nv-stack nv-stack--gap-xs');
  const kicker = el('span', 'nv-cross-link-card__kicker', entityType);
  const heading = el('h4', 'nv-cross-link-card__title');
  const titleLink = el('a', '', entity.title);
  titleLink.href = href;
  heading.append(titleLink);
  headingGroup.append(kicker, heading);

  header.append(headingGroup, statusBadge(entity.canonicalStatus));

  const description = el('p', 'nv-cross-link-card__description', entity.overview || entity.aim || entity.learningGoal || '');

  const actions = el('div', 'nv-cross-link-card__action');
  const link = el('a', 'nv-button', 'Explore →');
  link.dataset.variant = 'secondary';
  link.href = href;
  actions.append(link);

  article.append(header, description, actions);
  return article;
}

function renderFilterableCollection(items, renderItem, emptyMessage, className = 'nv-grid nv-grid--cols-2') {
  const wrapper = el('section', 'nv-curriculum-collection');
  const controls = el('div', 'nv-curriculum-filter', '');
  controls.setAttribute('aria-label', 'Filter resources by lifecycle status');
  const list = el('div', className);
  const empty = el('p', 'nv-empty-state-description', emptyMessage);
  empty.hidden = true;

  function paint(filter = 'All') {
    list.innerHTML = '';
    const visible = sortByStatus(items).filter((item) => filter === 'All' || item.canonicalStatus === filter);
    visible.forEach((item, index) => list.append(renderItem(item, index)));
    empty.hidden = visible.length > 0;
  }

  ['All', 'Reviewed', 'Draft'].forEach((label) => {
    const button = el('button', 'nv-button nv-curriculum-filter__button', label);
    button.type = 'button';
    button.dataset.variant = label === 'All' ? 'primary' : 'secondary';
    button.setAttribute('aria-pressed', String(label === 'All'));
    button.addEventListener('click', () => {
      controls.querySelectorAll('button').forEach((candidate) => {
        candidate.dataset.variant = 'secondary';
        candidate.setAttribute('aria-pressed', 'false');
      });
      button.dataset.variant = 'primary';
      button.setAttribute('aria-pressed', 'true');
      paint(label);
    });
    controls.append(button);
  });

  paint();
  wrapper.append(controls, list, empty);
  return wrapper;
}

function breadcrumbs(items) {
  const nav = el('nav', 'nv-curriculum-breadcrumbs');
  nav.setAttribute('aria-label', 'Curriculum hierarchy');
  items.forEach((item, index) => {
    if (index > 0) nav.append(el('span', 'nv-curriculum-breadcrumbs__separator', '→'));
    if (item.href && index < items.length - 1) {
      const link = el('a', 'nv-curriculum-breadcrumbs__item', item.label);
      link.href = item.href;
      nav.append(link);
    } else {
      const current = el('span', 'nv-curriculum-breadcrumbs__item', item.label);
      current.setAttribute('aria-current', 'location');
      nav.append(current);
    }
  });
  return nav;
}

function renderLoadingState(root, title = 'Loading curriculum') {
  const container = targetFrom(root);
  if (!container) return;
  container.innerHTML = '';
  const loading = el('section', 'nv-curriculum-loading');
  loading.setAttribute('aria-busy', 'true');
  loading.append(el('span', 'nv-curriculum-skeleton'), el('h1', '', title), el('p', 'nv-muted', 'Reading canonical curriculum metadata...'));
  container.append(loading);
}

function targetFrom(root) {
  return root.querySelector('[data-curriculum-root]');
}

function emptyState(title, message) {
  const state = el('section', 'nv-empty-state nv-curriculum-empty');
  state.append(el('h2', 'nv-empty-state-title', title), el('p', 'nv-empty-state-description', message));
  return state;
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function markdownToHtml(markdown) {
  const lines = String(markdown || '').split('\n');
  const html = [];
  let listOpen = false;
  let orderedListOpen = false;
  let table = [];
  let codeOpen = false;

  function closeList() {
    if (listOpen) {
      html.push('</ul>');
      listOpen = false;
    }
    if (orderedListOpen) {
      html.push('</ol>');
      orderedListOpen = false;
    }
  }

  function flushTable() {
    if (!table.length) return;
    html.push('<table class="nv-curriculum-table">');
    table.forEach((row, index) => {
      if (/^\s*\|?\s*:?-{3,}/.test(row)) return;
      const cells = row.split('|').map((cell) => cell.trim()).filter(Boolean);
      const tag = index === 0 ? 'th' : 'td';
      html.push(`<tr>${cells.map((cell) => `<${tag}>${escapeHtml(cell)}</${tag}>`).join('')}</tr>`);
    });
    html.push('</table>');
    table = [];
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      flushTable();
      closeList();
      html.push(codeOpen ? '</code></pre>' : '<pre><code>');
      codeOpen = !codeOpen;
      continue;
    }

    if (codeOpen) {
      html.push(`${escapeHtml(line)}\n`);
      continue;
    }

    if (line.trim().startsWith('|')) {
      closeList();
      table.push(line);
      continue;
    }

    flushTable();

    if (!line.trim()) {
      closeList();
      continue;
    }

    if (line.startsWith('### ')) {
      closeList();
      html.push(`<h4>${escapeHtml(line.slice(4))}</h4>`);
      continue;
    }

    if (line.startsWith('## ')) {
      closeList();
      html.push(`<h3>${escapeHtml(line.slice(3))}</h3>`);
      continue;
    }

    if (line.startsWith('# ')) {
      closeList();
      html.push(`<h2>${escapeHtml(line.slice(2))}</h2>`);
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      if (!listOpen) {
        if (orderedListOpen) {
          html.push('</ol>');
          orderedListOpen = false;
        }
        html.push('<ul>');
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(bullet[1])}</li>`);
      continue;
    }

    const ordered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ordered) {
      if (!orderedListOpen) {
        if (listOpen) {
          html.push('</ul>');
          listOpen = false;
        }
        html.push('<ol>');
        orderedListOpen = true;
      }
      html.push(`<li>${inlineMarkdown(ordered[1])}</li>`);
      continue;
    }

    if (line.startsWith('> ')) {
      closeList();
      html.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`);
      continue;
    }

    closeList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  closeList();
  flushTable();
  if (codeOpen) html.push('</code></pre>');
  return html.join('');
}

function setWorkspace(title, description) {
  const workspace = window.NeuralVerse?.workspace || window.NeuralVerse?.workspaceState;
  if (workspace && typeof workspace.setState === 'function') {
    workspace.setState({
      activeView: 'learning',
      routeTitle: title,
      routeDescription: description,
      status: 'active',
    });
  }
}

export function createCurriculumController(options = {}) {
  const root = options.root || document;
  const service = options.service || createCurriculumService();
  let activeVisualization = null;

  function cleanupActiveVisualization() {
    if (activeVisualization) {
      try {
        activeVisualization.destroy();
      } catch (e) {
        console.error('Error destroying visualization:', e);
      }
      activeVisualization = null;
    }
  }

  async function findRouteForArtifact(artifactId) {
    const index = await service.getIndex();
    for (const path of index.learningPaths) {
      if (path.artifactScope && path.artifactScope.includes(artifactId)) {
        for (const moduleId of path.moduleIds) {
          const mod = index.modules.find((m) => m.id === moduleId);
          if (mod && mod.artifactScope && mod.artifactScope.includes(artifactId)) {
            for (const lessonId of mod.lessonIds) {
              const les = index.lessons.find((l) => l.id === lessonId);
              if (les && les.artifactIds && les.artifactIds.includes(artifactId)) {
                return { pathId: path.id, moduleId: mod.id, lessonId: les.id };
              }
            }
          }
        }
      }
    }
    return null;
  }

  function target() {
    return root.querySelector('[data-curriculum-root]');
  }

  function renderShell(title, description = '', breadcrumbItems = [], stats = []) {
    const container = target();
    if (!container) return null;
    container.innerHTML = '';

    const header = el('header', 'nv-curriculum-hero');
    const eyebrow = el('span', 'nv-badge', 'NV-800 Curriculum');
    eyebrow.dataset.variant = 'info';
    if (breadcrumbItems.length) header.append(breadcrumbs(breadcrumbItems));
    header.append(eyebrow, el('h1', '', title));
    if (description) header.append(el('p', 'nv-muted', description));
    if (stats.length) {
      const statGrid = el('dl', 'nv-curriculum-stats');
      stats.forEach((stat) => {
        const item = el('div', 'nv-curriculum-stat');
        item.append(el('dt', '', stat.label), el('dd', '', stat.value));
        statGrid.append(item);
      });
      header.append(statGrid);
    }

    const body = el('div', 'nv-stack nv-stack--gap-lg');
    container.append(header, body);
    return body;
  }

  async function renderLearningPaths() {
    const paths = await service.getLearningPaths();
    const reviewedCount = paths.filter((path) => path.canonicalStatus === 'Reviewed').length;
    const body = renderShell('Learning Paths', 'Canonical NV-800 learning paths rendered from authored compositions.', [
      { label: 'Learning Paths' },
    ], [
      { label: 'Paths', value: String(paths.length) },
      { label: 'Reviewed', value: String(reviewedCount) },
      { label: 'Draft', value: String(paths.length - reviewedCount) },
    ]);
    if (!body) return;
    body.append(renderFilterableCollection(paths, (path) => card(path.title, path.aim || path.overview, `#/learning/${path.id}`, path.canonicalStatus, [
      meta('Modules', String(path.moduleIds.length)),
      meta('Status', path.canonicalStatus),
    ], { kind: 'path', kicker: 'Learning Path' }), 'No learning paths available.'));
    setWorkspace('Learning Paths', `${paths.length} canonical learning paths available.`);
  }

  async function renderModulesIndex() {
    const modules = await service.getModules();
    const reviewedCount = modules.filter((module) => module.canonicalStatus === 'Reviewed').length;
    const body = renderShell('Modules', 'Canonical NV-800 modules across all learning paths.', [
      { label: 'Modules' },
    ], [
      { label: 'Modules', value: String(modules.length) },
      { label: 'Reviewed', value: String(reviewedCount) },
      { label: 'Draft', value: String(modules.length - reviewedCount) },
    ]);
    if (!body) return;
    body.append(renderFilterableCollection(modules, (module) => card(module.title, module.aim || module.overview, `#/modules/${module.id}`, module.canonicalStatus, [
      meta('Lessons', String(module.lessonIds.length)),
      meta('Artifacts', String(module.artifactScope.length)),
      meta('Type', module.type),
    ], { kind: 'module', kicker: 'Module' }), 'No modules found.'));
    setWorkspace('Modules', `${modules.length} canonical modules available.`);
  }

  async function renderPath(pathId) {
    const [path, modules] = await Promise.all([service.getLearningPath(pathId), service.getModulesForPath(pathId)]);
    const body = renderShell(path?.title || 'Learning Path', path?.aim || path?.overview || 'Learning path not found.', [
      { label: 'Learning Paths', href: '#/learning' },
      { label: path?.title || 'Learning Path' },
    ], path ? [
      { label: 'Modules', value: String(modules.length) },
      { label: 'Lessons', value: String(path.lessonScope.length) },
      { label: 'Artifacts', value: String(path.artifactScope.length) },
    ] : []);
    if (!body || !path) return;

    const metaRow = el('div', 'nv-card-meta');
    metaRow.append(meta('Status', path.canonicalStatus), meta('Modules', String(modules.length)), meta('Type', path.type));
    body.append(metaRow);

    body.append(renderFilterableCollection(modules, (module, index) => card(module.title, module.aim || module.overview, `#/learning/${path.id}/module/${module.id}`, module.canonicalStatus, [
      meta('Lessons', String(module.lessonIds.length)),
      meta('Artifacts', String(module.artifactScope.length)),
    ], { kind: 'module', kicker: `Module ${index + 1}` }), 'No modules available for this learning path.'));

    // Path Cross-Link / Curriculum Summary Section
    const pathSection = el('section', 'nv-cross-links-section');
    pathSection.setAttribute('aria-label', 'Contextual Navigation');
    const pathTitle = el('h3', 'nv-cross-links-section__title', 'Curriculum Summary');
    const summaryCard = el('article', 'nv-card nv-cross-link-card');
    summaryCard.dataset.status = path.canonicalStatus;
    const summaryHeader = el('div', 'nv-cluster nv-cluster--gap-sm');
    summaryHeader.style.justifyContent = 'space-between';
    const summaryTitle = el('h4', 'nv-cross-link-card__title', path.title);
    summaryHeader.append(summaryTitle, statusBadge(path.canonicalStatus));
    const summaryDesc = el('p', 'nv-cross-link-card__description', path.aim || path.overview || '');
    summaryCard.append(summaryHeader, summaryDesc);
    pathSection.append(pathTitle, summaryCard);
    body.append(pathSection);

    setWorkspace(path.title, `${modules.length} modules in this learning path.`);
  }

  async function renderModule(pathId, moduleId) {
    const [module, lessons] = await Promise.all([service.getModule(moduleId), service.getLessonsForModule(moduleId)]);
    const path = await service.getLearningPath(pathId);
    const body = renderShell(module?.title || 'Module', module?.aim || module?.overview || 'Module not found.', [
      { label: 'Learning Paths', href: '#/learning' },
      { label: path?.title || 'Learning Path', href: path ? `#/learning/${path.id}` : '#/learning' },
      { label: module?.title || 'Module' },
    ], module ? [
      { label: 'Lessons', value: String(lessons.length) },
      { label: 'Artifacts', value: String(module.artifactScope.length) },
      { label: 'Status', value: module.canonicalStatus },
    ] : []);
    if (!body || !module) return;

    const metaRow = el('div', 'nv-card-meta');
    metaRow.append(meta('Status', module.canonicalStatus), meta('Lessons', String(lessons.length)), meta('Type', module.type));
    body.append(metaRow);

    const flow = el('p', 'nv-muted', 'Estimated learning flow: lessons are displayed in the canonical module order. This does not enforce sequence control.');
    body.append(flow);

    body.append(renderFilterableCollection(lessons, (lesson, index) => card(lesson.title, lesson.learningGoal || lesson.overview, `#/learning/${pathId}/module/${module.id}/lesson/${lesson.id}`, lesson.canonicalStatus, [
      meta('Artifacts', String(lesson.artifactIds.length)),
      meta('Topic', lesson.topic),
    ], { kind: 'lesson', kicker: `Lesson ${index + 1}` }), 'No lessons found in this module.', 'nv-stack nv-stack--gap-sm'));

    // Module Cross-Links Context Panel
    const relatedSection = el('section', 'nv-cross-links-section');
    relatedSection.setAttribute('aria-label', 'Contextual Navigation');
    relatedSection.append(el('h3', 'nv-cross-links-section__title', 'Contextual Navigation'));

    const grid = el('div', 'nv-cross-links-grid');
    if (path) {
      grid.append(renderCrossLinkCard(path, 'Parent Learning Path', `#/learning/${path.id}`));

      const moduleIdx = path.moduleIds.indexOf(moduleId);
      const pathModules = await service.getModulesForPath(pathId);
      if (moduleIdx > 0) {
        const prevMod = pathModules[moduleIdx - 1];
        if (prevMod) {
          grid.append(renderCrossLinkCard(prevMod, 'Previous Module', `#/learning/${pathId}/module/${prevMod.id}`));
        }
      }
      if (moduleIdx < path.moduleIds.length - 1) {
        const nextMod = pathModules[moduleIdx + 1];
        if (nextMod) {
          grid.append(renderCrossLinkCard(nextMod, 'Next Module', `#/learning/${pathId}/module/${nextMod.id}`));
        }
      }
    }
    relatedSection.append(grid);
    body.append(relatedSection);

    setWorkspace(module.title, `${lessons.length} lessons in this module.`);
  }

  async function renderStandaloneModule(moduleId) {
    const index = await service.getIndex();
    const path = index.learningPaths.find((candidate) => candidate.moduleIds.includes(moduleId));
    await renderModule(path?.id || 'canonical', moduleId);
  }

  function appendMetadataItem(dl, label, value) {
    const dt = el('dt', 'nv-lesson-workspace__metadata-label', label);
    const dd = el('dd', 'nv-lesson-workspace__metadata-value', value);
    dl.append(dt, dd);
  }

  function renderLessonFlow(activeType = null) {
    const flowViz = el('div', 'nv-lesson-flow-viz');
    flowViz.setAttribute('aria-label', 'Canonical Lesson Flow');

    const steps = [
      { type: 'Explanatory Text', num: 1 },
      { type: 'Visual Intuition', num: 2 },
      { type: 'Interactive Visualization', label: 'Interactive Spec', num: 3 },
      { type: 'Exercise', num: 4 },
      { type: 'Comparison Table', num: 5 }
    ];

    steps.forEach((step, idx) => {
      if (idx > 0) {
        const connector = el('div', 'nv-lesson-flow-viz__connector', '→');
        connector.setAttribute('aria-hidden', 'true');
        flowViz.append(connector);
      }

      const stepEl = el('div', 'nv-lesson-flow-viz__step');
      const isActive = activeType && (activeType === step.type || (step.type === 'Interactive Visualization' && activeType.startsWith('Interactive')));
      if (isActive) {
        stepEl.setAttribute('data-active', 'true');
      }

      const icon = el('span', 'nv-lesson-flow-viz__step-icon', String(step.num));
      const label = el('span', 'nv-lesson-flow-viz__step-label', step.label || step.type);

      stepEl.append(icon, label);
      flowViz.append(stepEl);
    });

    return flowViz;
  }

  async function renderWorkspaceLayout(pathId, moduleId, lessonId, activeArtifactId = null) {
    const container = target();
    if (!container) return null;
    container.innerHTML = '';

    const [lesson, artifacts] = await Promise.all([
      service.getLesson(lessonId),
      service.getArtifactsForLesson(lessonId)
    ]);
    const [path, module] = await Promise.all([
      service.getLearningPath(pathId),
      service.getModule(moduleId)
    ]);

    if (!lesson) {
      container.append(emptyState('Lesson not found', 'The requested lesson is not available.'));
      return null;
    }

    setWorkspace(lesson.title, `Topic: ${lesson.topic || 'General'}`);

    const workspaceEl = el('div', 'nv-lesson-workspace');

    const focusModeKey = 'nv_curriculum_workspace_focus_mode';
    const isFocusMode = localStorage.getItem(focusModeKey) === 'true';
    if (isFocusMode) {
      workspaceEl.classList.add('nv-lesson-workspace--focus');
    }

    const header = el('header', 'nv-lesson-workspace__header nv-curriculum-hero');

    const breadcrumbItems = [
      { label: 'Learning Paths', href: '#/learning' },
      { label: path?.title || 'Learning Path', href: path ? `#/learning/${path.id}` : '#/learning' },
      { label: module?.title || 'Module', href: `#/learning/${pathId}/module/${moduleId}` }
    ];
    if (activeArtifactId) {
      const activeArt = artifacts.find(a => a.id === activeArtifactId);
      breadcrumbItems.push({
        label: lesson.title,
        href: `#/learning/${pathId}/module/${moduleId}/lesson/${lessonId}`
      });
      breadcrumbItems.push({
        label: activeArt ? activeArt.title : 'Artifact'
      });
    } else {
      breadcrumbItems.push({
        label: lesson.title
      });
    }
    header.append(breadcrumbs(breadcrumbItems));

    const titleCluster = el('div', 'nv-cluster nv-cluster--gap-sm');
    titleCluster.style.justifyContent = 'space-between';
    titleCluster.style.alignItems = 'flex-start';
    titleCluster.style.width = '100%';

    const titleGroup = el('div', 'nv-stack nv-stack--gap-xs');
    titleGroup.append(
      el('span', 'nv-curriculum-card__kicker', `Lesson / Topic: ${lesson.topic || 'General'}`),
      el('h1', 'nv-lesson-workspace__title', lesson.title)
    );

    const controlsGroup = el('div', 'nv-cluster nv-cluster--gap-sm');
    controlsGroup.style.alignItems = 'center';

    const statusBadgeEl = statusBadge(lesson.canonicalStatus);

    const focusBtn = el('button', 'nv-button nv-button--focus-mode', isFocusMode ? 'Exit Focus' : 'Focus Mode');
    focusBtn.type = 'button';
    focusBtn.dataset.variant = 'secondary';

    const updateFocusMode = (active) => {
      if (active) {
        workspaceEl.classList.add('nv-lesson-workspace--focus');
        focusBtn.textContent = 'Exit Focus';
        localStorage.setItem(focusModeKey, 'true');
      } else {
        workspaceEl.classList.remove('nv-lesson-workspace--focus');
        focusBtn.textContent = 'Focus Mode';
        localStorage.setItem(focusModeKey, 'false');
      }
    };

    focusBtn.addEventListener('click', () => {
      const active = !workspaceEl.classList.contains('nv-lesson-workspace--focus');
      updateFocusMode(active);
    });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && workspaceEl.classList.contains('nv-lesson-workspace--focus')) {
        updateFocusMode(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    window.addEventListener('hashchange', () => {
      document.removeEventListener('keydown', handleKeyDown);
    }, { once: true });

    controlsGroup.append(statusBadgeEl, focusBtn);
    titleCluster.append(titleGroup, controlsGroup);
    header.append(titleCluster);
    workspaceEl.append(header);

    const grid = el('div', 'nv-lesson-workspace__grid');

    const outlineCol = el('aside', 'nv-lesson-workspace__outline-col');
    outlineCol.setAttribute('aria-label', 'Lesson Outline');

    const outlineAccordion = el('details', 'nv-lesson-workspace__outline-accordion');
    outlineAccordion.setAttribute('open', 'true');

    const outlineSummary = el('summary', 'nv-lesson-workspace__outline-summary');
    outlineSummary.append(el('span', '', 'Lesson Outline'));

    const outlineContent = el('div', 'nv-lesson-workspace__outline-content');
    const outlineList = el('ul', 'nv-lesson-workspace__outline-list');
    outlineList.setAttribute('role', 'list');

    // Add Lesson Overview item
    const overviewLink = el('a', 'nv-lesson-workspace__outline-item');
    overviewLink.href = `#/learning/${pathId}/module/${moduleId}/lesson/${lessonId}`;
    if (!activeArtifactId) {
      overviewLink.setAttribute('aria-current', 'location');
    }
    const overviewTitle = el('span', 'nv-lesson-workspace__outline-item-title', 'Lesson Overview');
    const overviewMeta = el('span', 'nv-lesson-workspace__outline-item-meta');
    const overviewType = el('span', '', 'Lesson Overview');
    overviewMeta.append(overviewType);
    overviewLink.append(overviewTitle, overviewMeta);

    const overviewLi = el('li');
    overviewLi.append(overviewLink);
    outlineList.append(overviewLi);

    artifacts.forEach((art, index) => {
      const itemLink = el('a', 'nv-lesson-workspace__outline-item');
      itemLink.href = `#/learning/${pathId}/module/${moduleId}/lesson/${lessonId}/artifact/${art.id}`;

      if (activeArtifactId === art.id) {
        itemLink.setAttribute('aria-current', 'location');
      }

      const itemTitle = el('span', 'nv-lesson-workspace__outline-item-title', art.title);

      const itemMeta = el('span', 'nv-lesson-workspace__outline-item-meta');
      const itemType = el('span', '', typeLabel(art.type));
      const itemBadge = el('span', 'nv-badge', art.canonicalStatus);
      itemBadge.dataset.variant = art.canonicalStatus === 'Reviewed' ? 'success' : 'neutral';

      itemMeta.append(itemType, itemBadge);
      itemLink.append(itemTitle, itemMeta);

      const li = el('li');
      li.append(itemLink);
      outlineList.append(li);
    });

    outlineContent.append(outlineList);
    outlineAccordion.append(outlineSummary, outlineContent);
    outlineCol.append(outlineAccordion);
    grid.append(outlineCol);

    const contentCol = el('div', 'nv-lesson-workspace__content-col');
    const mainContent = el('main', 'nv-lesson-workspace__main-content');
    mainContent.setAttribute('tabindex', '-1');
    contentCol.append(mainContent);
    grid.append(contentCol);

    const metadataCol = el('aside', 'nv-lesson-workspace__metadata-col');
    metadataCol.setAttribute('aria-label', 'Artifact Metadata');
    const metadataCard = el('div', 'nv-panel nv-lesson-workspace__metadata-card nv-stack nv-stack--gap-md');
    const metadataTitle = el('h3', 'nv-lesson-workspace__section-title', 'Metadata');
    const metadataList = el('dl', 'nv-lesson-workspace__metadata-list');
    metadataCard.append(metadataTitle, metadataList);
    metadataCol.append(metadataCard);
    grid.append(metadataCol);

    workspaceEl.append(grid);
    container.append(workspaceEl);

    return {
      mainContent,
      metadataList,
      artifacts,
      lesson,
      path,
      module
    };
  }

  async function renderLesson(pathId, moduleId, lessonId) {
    const layout = await renderWorkspaceLayout(pathId, moduleId, lessonId, null);
    if (!layout) return;

    const { mainContent, metadataList, artifacts, lesson } = layout;

    appendMetadataItem(metadataList, 'Topic', lesson.topic || 'General');
    appendMetadataItem(metadataList, 'Status', lesson.canonicalStatus || 'Draft');
    appendMetadataItem(metadataList, 'Artifacts Count', String(artifacts.length));
    if (lesson.learningGoal) {
      appendMetadataItem(metadataList, 'Learning Goal', lesson.learningGoal);
    }

    const heading = el('h2', '', 'Lesson Overview');
    const goalText = el('p', '', lesson.learningGoal || lesson.overview || 'Understand the core competencies of this lesson.');

    const flowHeading = el('h3', '', 'Canonical Learning Flow');
    const flowViz = renderLessonFlow(null);
    const flowNote = el('p', 'nv-muted', 'This visual sequence follows the canonical lesson order for presentation only. It does not enforce sequence control.');
    flowNote.style.fontSize = 'var(--sys-font-caption-size)';

    const artifactListHeading = el('h3', '', 'Lesson Artifacts');
    const artifactsGrid = el('div', 'nv-grid nv-grid--cols-2');

    artifacts.forEach((art, index) => {
      const artCard = card(
        art.title,
        typeLabel(art.type),
        `#/learning/${pathId}/module/${moduleId}/lesson/${lessonId}/artifact/${art.id}`,
        art.canonicalStatus,
        [
          meta('Type', typeLabel(art.type)),
          meta('Duration', art.estimatedDuration || 'Not specified')
        ],
        { kind: 'artifact', kicker: `Artifact ${index + 1}` }
      );
      artifactsGrid.append(artCard);
    });

    mainContent.append(
      heading,
      goalText,
      flowHeading,
      flowViz,
      flowNote,
      el('hr'),
      artifactListHeading,
      artifactsGrid
    );

    // Lesson Cross-Links Context Panel
    const relatedSection = el('section', 'nv-cross-links-section');
    relatedSection.setAttribute('aria-label', 'Contextual Navigation');
    relatedSection.append(el('h3', 'nv-cross-links-section__title', 'Contextual Navigation'));

    const grid = el('div', 'nv-cross-links-grid');
    const path = await service.getLearningPath(pathId);
    const module = await service.getModule(moduleId);
    if (path) {
      grid.append(renderCrossLinkCard(path, 'Parent Learning Path', `#/learning/${path.id}`));
    }
    if (module) {
      grid.append(renderCrossLinkCard(module, 'Parent Module', `#/learning/${pathId}/module/${module.id}`));

      const lessonIdx = module.lessonIds.indexOf(lessonId);
      const moduleLessons = await service.getLessonsForModule(moduleId);
      if (lessonIdx > 0) {
        const prevLesson = moduleLessons[lessonIdx - 1];
        if (prevLesson) {
          grid.append(renderCrossLinkCard(prevLesson, 'Previous Lesson', `#/learning/${pathId}/module/${moduleId}/lesson/${prevLesson.id}`));
        }
      }
      if (lessonIdx < module.lessonIds.length - 1) {
        const nextLesson = moduleLessons[lessonIdx + 1];
        if (nextLesson) {
          grid.append(renderCrossLinkCard(nextLesson, 'Next Lesson', `#/learning/${pathId}/module/${moduleId}/lesson/${nextLesson.id}`));
        }
      }
    }
    relatedSection.append(grid);
    mainContent.append(relatedSection);

    if (window.NeuralVerse && typeof window.NeuralVerse.initPersonalizationExperience === 'function') {
      window.NeuralVerse.initPersonalizationExperience({
        pathId,
        moduleId,
        lessonId,
        artifactId: null,
        artifact: null,
        lesson,
        path,
        module,
        mainContent
      });
    }
  }

  async function renderArtifact(pathId, moduleId, lessonId, artifactId) {
    const content = await service.loadArtifactMarkdown(artifactId);
    if (!content) {
      const container = target();
      if (container) container.innerHTML = '';
      container.append(emptyState('Artifact not found', 'The requested artifact is not available.'));
      return;
    }

    const { artifact, markdown } = content;
    const layout = await renderWorkspaceLayout(pathId, moduleId, lessonId, artifactId);
    if (!layout) return;

    const { mainContent, metadataList, artifacts } = layout;

    // NV-1100-P5C: Inject review badge and metadata panel
    if (typeof window !== 'undefined' && window.NeuralVerse?.reviewBadgeRenderer && window.NeuralVerse?.reviewScheduler) {
      const r = window.NeuralVerse.reviewBadgeRenderer;
      const sched = window.NeuralVerse.reviewScheduler;
      const badgeGroup = r.renderBadgeAndAction(artifactId, 'artifact', sched);
      if (badgeGroup) {
        const wrap = el('div', 'nv-review-badge-wrap');
        wrap.innerHTML = badgeGroup;
        mainContent.append(wrap.firstElementChild || wrap);
        // Wire action button
        const actionBtn = mainContent.querySelector('[data-review-action]');
        if (actionBtn && !actionBtn.disabled && actionBtn.getAttribute('aria-disabled') !== 'true') {
          actionBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            try { sched.ensureItem(artifactId, 'artifact'); } catch (e) { /* ignore */ }
            const ctrl = window.NeuralVerse?.reviewSessionController;
            if (ctrl) {
              if (typeof ctrl.hasActiveSession === 'function' && ctrl.hasActiveSession()) ctrl.resumeSession();
              else ctrl.startSession();
            }
          });
        }
      }
      // Metadata panel
      const metaPanel = r.renderMetadataPanel(artifactId, 'artifact', sched);
      if (metaPanel) {
        const wrap2 = el('div', 'nv-review-meta-wrap');
        wrap2.innerHTML = metaPanel;
        const panelEl = wrap2.firstElementChild;
        if (panelEl) {
          const sidePanel = el('div', 'nv-card nv-review-meta-card');
          sidePanel.append(panelEl);
          mainContent.append(sidePanel);
        }
      }
    }

    appendMetadataItem(metadataList, 'Type', typeLabel(artifact.type));
    appendMetadataItem(metadataList, 'Status', artifact.canonicalStatus || 'Draft');
    appendMetadataItem(metadataList, 'Duration', artifact.estimatedDuration || 'Not specified');

    const depths = artifact.learning_depths || [];
    if (depths.length) {
      appendMetadataItem(metadataList, 'Learning Depths', depths.join(', '));
    }

    const objectives = artifact.instructional_objectives || [];
    if (objectives.length) {
      appendMetadataItem(metadataList, 'Objectives', objectives.join(', '));
    }

    const flowViz = renderLessonFlow(artifact.type);
    mainContent.append(flowViz);

    const banner = el('div', 'nv-lesson-workspace__artifact-type-banner');
    const badge = el('span', 'nv-badge', typeLabel(artifact.type));
    badge.dataset.variant = 'info';
    banner.append(badge);
    mainContent.append(banner);

    if (artifact.type === 'Interactive Visualization') {
      if (hasVisualization(artifactId)) {
        const vizContainer = el('div', 'nv-visualization-container');
        vizContainer.id = `visualization-${artifactId}`;
        mainContent.append(vizContainer);
        try {
          activeVisualization = createVisualization(artifactId);
          if (activeVisualization) {
            activeVisualization.initialize(vizContainer);
          }
        } catch (err) {
          console.error(`Failed to initialize visualization for ${artifactId}:`, err);
          vizContainer.textContent = 'Failed to load interactive visualization.';
        }
      } else {
        const notice = el('aside', 'nv-panel nv-curriculum-callout');
        notice.append(el('strong', '', 'Specification only'));
        notice.append(el('p', 'nv-muted', 'This artifact describes a future interactive visualization. No executable interaction is fabricated in the frontend.'));
        mainContent.append(notice);
      }
    }

    const readerKind = artifact.type === 'Explanatory Text' ? 'explanatory' :
                       artifact.type === 'Visual Intuition' ? 'visual' :
                       artifact.type === 'Interactive Visualization' ? 'interactive-spec' :
                       artifact.type === 'Exercise' ? 'exercise' : 'comparison';

    const article = el('article', `nv-panel nv-curriculum-reader nv-curriculum-reader--${readerKind}`);
    article.innerHTML = markdownToHtml(markdown);
    mainContent.append(article);

    // Contextual Cross-Links Section
    const relatedNavSection = el('section', 'nv-cross-links-section');
    relatedNavSection.setAttribute('aria-label', 'Contextual Navigation');

    const sectionTitle = el('h3', 'nv-cross-links-section__title', 'Contextual Navigation');
    relatedNavSection.append(sectionTitle);

    // Parent lineage
    const path = await service.getLearningPath(pathId);
    const module = await service.getModule(moduleId);
    const lesson = await service.getLesson(lessonId);
    if (path && module && lesson) {
      const partOfTrail = el('div', 'nv-part-of-trail');
      partOfTrail.append(el('span', 'nv-part-of-trail__label', 'Part of:'));

      const pathLink = el('a', 'nv-part-of-trail__item', path.title);
      pathLink.href = `#/learning/${path.id}`;

      const moduleLink = el('a', 'nv-part-of-trail__item', module.title);
      moduleLink.href = `#/learning/${path.id}/module/${module.id}`;

      const lessonLink = el('a', 'nv-part-of-trail__item', lesson.title);
      lessonLink.href = `#/learning/${path.id}/module/${module.id}/lesson/${lesson.id}`;

      partOfTrail.append(
        pathLink,
        el('span', 'nv-part-of-trail__separator', ' → '),
        moduleLink,
        el('span', 'nv-part-of-trail__separator', ' → '),
        lessonLink
      );
      relatedNavSection.append(partOfTrail);
    }

    // Related sibling artifacts
    const siblings = artifacts.filter(a => a.id !== artifactId);
    if (siblings.length > 0) {
      const sibTitle = el('h4', '', 'Related Artifacts (in this lesson)');
      sibTitle.style.fontSize = 'var(--ref-font-size-400)';
      sibTitle.style.marginBlock = 'var(--sys-space-stack-sm)';
      relatedNavSection.append(sibTitle);

      const grid = el('div', 'nv-cross-links-grid');
      siblings.forEach(sib => {
        grid.append(renderCrossLinkCard(sib, typeLabel(sib.type), `#/learning/${pathId}/module/${moduleId}/lesson/${lessonId}/artifact/${sib.id}`));
      });
      relatedNavSection.append(grid);
    }

    // Dependency metadata relationships (prerequisites, complementary, alternative, recommended_before, recommended_after)
    const resolveArtifacts = async (val) => {
      if (!val) return [];
      const ids = Array.isArray(val) ? val : [val];
      const index = await service.getIndex();
      return ids.map(id => index.artifacts.find(a => a.id === id)).filter(Boolean);
    };

    const prereqs = await resolveArtifacts(artifact.prerequisite);
    const complementary = await resolveArtifacts(artifact.complementary);
    const recBefore = await resolveArtifacts(artifact.recommended_before);
    const recAfter = await resolveArtifacts(artifact.recommended_after);
    const alternative = await resolveArtifacts(artifact.alternative);

    if (prereqs.length > 0) {
      const subTitle = el('h4', '', 'Prerequisites');
      subTitle.style.fontSize = 'var(--ref-font-size-400)';
      subTitle.style.marginBlock = 'var(--sys-space-stack-sm)';
      relatedNavSection.append(subTitle);

      const grid = el('div', 'nv-cross-links-grid');
      for (const item of prereqs) {
        const route = await findRouteForArtifact(item.id);
        const href = route ? `#/learning/${route.pathId}/module/${route.moduleId}/lesson/${route.lessonId}/artifact/${item.id}` : '#/learning';
        grid.append(renderCrossLinkCard(item, 'Prerequisite', href));
      }
      relatedNavSection.append(grid);
    }

    if (complementary.length > 0) {
      const subTitle = el('h4', '', 'Complementary Resources');
      subTitle.style.fontSize = 'var(--ref-font-size-400)';
      subTitle.style.marginBlock = 'var(--sys-space-stack-sm)';
      relatedNavSection.append(subTitle);

      const grid = el('div', 'nv-cross-links-grid');
      for (const item of complementary) {
        const route = await findRouteForArtifact(item.id);
        const href = route ? `#/learning/${route.pathId}/module/${route.moduleId}/lesson/${route.lessonId}/artifact/${item.id}` : '#/learning';
        grid.append(renderCrossLinkCard(item, 'Complementary', href));
      }
      relatedNavSection.append(grid);
    }

    if (recBefore.length > 0) {
      const subTitle = el('h4', '', 'Recommended Before');
      subTitle.style.fontSize = 'var(--ref-font-size-400)';
      subTitle.style.marginBlock = 'var(--sys-space-stack-sm)';
      relatedNavSection.append(subTitle);

      const grid = el('div', 'nv-cross-links-grid');
      for (const item of recBefore) {
        const route = await findRouteForArtifact(item.id);
        const href = route ? `#/learning/${route.pathId}/module/${route.moduleId}/lesson/${route.lessonId}/artifact/${item.id}` : '#/learning';
        grid.append(renderCrossLinkCard(item, 'Recommended Before', href));
      }
      relatedNavSection.append(grid);
    }

    if (recAfter.length > 0) {
      const subTitle = el('h4', '', 'Recommended After');
      subTitle.style.fontSize = 'var(--ref-font-size-400)';
      subTitle.style.marginBlock = 'var(--sys-space-stack-sm)';
      relatedNavSection.append(subTitle);

      const grid = el('div', 'nv-cross-links-grid');
      for (const item of recAfter) {
        const route = await findRouteForArtifact(item.id);
        const href = route ? `#/learning/${route.pathId}/module/${route.moduleId}/lesson/${route.lessonId}/artifact/${item.id}` : '#/learning';
        grid.append(renderCrossLinkCard(item, 'Recommended After', href));
      }
      relatedNavSection.append(grid);
    }

    if (alternative.length > 0) {
      const subTitle = el('h4', '', 'Alternative Resources');
      subTitle.style.fontSize = 'var(--ref-font-size-400)';
      subTitle.style.marginBlock = 'var(--sys-space-stack-sm)';
      relatedNavSection.append(subTitle);

      const grid = el('div', 'nv-cross-links-grid');
      for (const item of alternative) {
        const route = await findRouteForArtifact(item.id);
        const href = route ? `#/learning/${route.pathId}/module/${route.moduleId}/lesson/${route.lessonId}/artifact/${item.id}` : '#/learning';
        grid.append(renderCrossLinkCard(item, 'Alternative Resource', href));
      }
      relatedNavSection.append(grid);
    }

    mainContent.append(relatedNavSection);

    const currentIndex = artifacts.findIndex(art => art.id === artifactId);
    const navFooter = el('nav', 'nv-lesson-workspace__navigation');
    navFooter.setAttribute('aria-label', 'Artifact Navigation');

    const navCluster = el('div', 'nv-cluster');
    navCluster.style.justifyContent = 'space-between';
    navCluster.style.alignItems = 'center';
    navCluster.style.width = '100%';

    if (currentIndex > 0) {
      const prevBtn = el('a', 'nv-button nv-button--prev', '← Previous');
      prevBtn.dataset.variant = 'secondary';
      prevBtn.href = `#/learning/${pathId}/module/${moduleId}/lesson/${lessonId}/artifact/${artifacts[currentIndex - 1].id}`;
      navCluster.append(prevBtn);
    } else {
      const prevPlaceholder = el('button', 'nv-button nv-button--prev', '← Previous');
      prevPlaceholder.dataset.variant = 'secondary';
      prevPlaceholder.disabled = true;
      navCluster.append(prevPlaceholder);
    }

    const positionText = el('span', 'nv-lesson-workspace__position-indicator', `Artifact ${currentIndex + 1} of ${artifacts.length}`);
    navCluster.append(positionText);

    if (currentIndex < artifacts.length - 1) {
      const nextBtn = el('a', 'nv-button nv-button--next', 'Next →');
      nextBtn.dataset.variant = 'secondary';
      nextBtn.href = `#/learning/${pathId}/module/${moduleId}/lesson/${lessonId}/artifact/${artifacts[currentIndex + 1].id}`;
      navCluster.append(nextBtn);
    } else {
      const nextPlaceholder = el('button', 'nv-button nv-button--next', 'Next →');
      nextPlaceholder.dataset.variant = 'secondary';
      nextPlaceholder.disabled = true;
      navCluster.append(nextPlaceholder);
    }

    navFooter.append(navCluster);
    mainContent.append(navFooter);

    if (window.NeuralVerse && typeof window.NeuralVerse.initReadingExperience === 'function') {
      window.NeuralVerse.initReadingExperience({
        pathId,
        moduleId,
        lessonId,
        artifactId,
        artifact,
        lesson,
        path,
        module,
        mainContent
      });
    }

    if (window.NeuralVerse && typeof window.NeuralVerse.initPersonalizationExperience === 'function') {
      window.NeuralVerse.initPersonalizationExperience({
        pathId,
        moduleId,
        lessonId,
        artifactId,
        artifact,
        lesson,
        path,
        module,
        mainContent
      });
    }
  }

  async function renderCurrentRoute(hashValue = window.location.hash) {
    if (!target()) return;
    cleanupActiveVisualization();
    const parts = routeParts(hashValue);

    try {
      renderLoadingState(root);
      if (parts[0] === 'modules' && parts[1]) return renderStandaloneModule(parts[1]);
      if (parts[0] === 'modules') return renderModulesIndex();
      if (parts[0] !== 'learning') return;
      if (!parts[1]) return renderLearningPaths();
      if (parts[2] === 'module' && parts[4] === 'lesson' && parts[6] === 'artifact') return renderArtifact(parts[1], parts[3], parts[5], parts[7]);
      if (parts[2] === 'module' && parts[4] === 'lesson') return renderLesson(parts[1], parts[3], parts[5]);
      if (parts[2] === 'module') return renderModule(parts[1], parts[3]);
      return renderPath(parts[1]);
    } catch (error) {
      console.error('Curriculum rendering failed.', error);
      const body = renderShell('Curriculum could not be loaded', 'The canonical curriculum index is unavailable.');
      if (body) body.append(el('p', 'nv-muted', error.message));
    }
  }

  function init() {
    window.addEventListener('nv:routerendered', () => renderCurrentRoute(window.location.hash));
    renderCurrentRoute(window.location.hash);

    window.NeuralVerse = window.NeuralVerse || {};
    window.NeuralVerse.curriculum = { service, renderCurrentRoute };
    service.getIndex().then((index) => {
      window.NeuralVerse.curriculumIndex = index;
      window.NeuralVerse.contextBuilder?.setCurriculumIndex?.(index);
    }).catch(() => {});
  }

  return { init, renderCurrentRoute };
}
