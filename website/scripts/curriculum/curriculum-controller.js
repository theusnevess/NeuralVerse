import { createCurriculumService } from './curriculum-service.js?v=1';

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
      current.setAttribute('aria-current', 'page');
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
    setWorkspace(module.title, `${lessons.length} lessons in this module.`);
  }

  async function renderStandaloneModule(moduleId) {
    const index = await service.getIndex();
    const path = index.learningPaths.find((candidate) => candidate.moduleIds.includes(moduleId));
    await renderModule(path?.id || 'canonical', moduleId);
  }

  async function renderLesson(pathId, moduleId, lessonId) {
    const [lesson, artifacts] = await Promise.all([service.getLesson(lessonId), service.getArtifactsForLesson(lessonId)]);
    const [path, module] = await Promise.all([service.getLearningPath(pathId), service.getModule(moduleId)]);
    const body = renderShell(lesson?.title || 'Lesson', lesson?.learningGoal || lesson?.overview || 'Lesson not found.', [
      { label: 'Learning Paths', href: '#/learning' },
      { label: path?.title || 'Learning Path', href: path ? `#/learning/${path.id}` : '#/learning' },
      { label: module?.title || 'Module', href: `#/learning/${pathId}/module/${moduleId}` },
      { label: lesson?.title || 'Lesson' },
    ], lesson ? [
      { label: 'Artifacts', value: String(artifacts.length) },
      { label: 'Topic', value: lesson.topic },
      { label: 'Status', value: lesson.canonicalStatus },
    ] : []);
    if (!body || !lesson) return;

    const metaRow = el('div', 'nv-card-meta');
    metaRow.append(meta('Status', lesson.canonicalStatus), meta('Artifacts', String(artifacts.length)), meta('Topic', lesson.topic));
    body.append(metaRow);

    const flow = el('ol', 'nv-curriculum-flow');
    ['Explanatory Text', 'Visual Intuition', 'Interactive Visualization Specification', 'Exercise', 'Comparison Table'].forEach((label) => {
      flow.append(el('li', '', label));
    });
    const flowNote = el('p', 'nv-muted', 'This visual sequence follows canonical lesson order for presentation only. It does not enforce sequence control.');
    body.append(flow, flowNote);

    body.append(renderFilterableCollection(artifacts, (artifact, index) => card(artifact.title, typeLabel(artifact.type), `#/learning/${pathId}/module/${moduleId}/lesson/${lesson.id}/artifact/${artifact.id}`, artifact.canonicalStatus, [
      meta('Type', typeLabel(artifact.type)),
      meta('Duration', artifact.estimatedDuration),
    ], { kind: 'artifact', kicker: `Artifact ${index + 1}` }), 'No artifacts found for this lesson.', 'nv-stack nv-stack--gap-sm'));
    setWorkspace(lesson.title, `${artifacts.length} artifacts in this lesson.`);
  }

  async function renderArtifact(pathId, moduleId, lessonId, artifactId) {
    const content = await service.loadArtifactMarkdown(artifactId);
    const [path, module, lesson] = await Promise.all([service.getLearningPath(pathId), service.getModule(moduleId), service.getLesson(lessonId)]);
    const body = renderShell(content?.artifact?.title || 'Learning Artifact', typeLabel(content?.artifact?.type) || 'Artifact not found.', [
      { label: 'Learning Paths', href: '#/learning' },
      { label: path?.title || 'Learning Path', href: path ? `#/learning/${path.id}` : '#/learning' },
      { label: module?.title || 'Module', href: `#/learning/${pathId}/module/${moduleId}` },
      { label: lesson?.title || 'Lesson', href: `#/learning/${pathId}/module/${moduleId}/lesson/${lessonId}` },
      { label: content?.artifact?.title || 'Artifact' },
    ], content ? [
      { label: 'Type', value: typeLabel(content.artifact.type) },
      { label: 'Duration', value: content.artifact.estimatedDuration || 'Not specified' },
      { label: 'Status', value: content.artifact.canonicalStatus },
    ] : []);
    if (!body || !content) return;

    const { artifact, markdown } = content;
    const metaRow = el('div', 'nv-card-meta');
    metaRow.append(
      meta('Status', artifact.canonicalStatus),
      meta('Type', typeLabel(artifact.type)),
      meta('Duration', artifact.estimatedDuration),
      meta('Objectives', artifact.instructionalObjectives.join(', '))
    );
    body.append(metaRow);

    if (artifact.type === 'Interactive Visualization') {
      const notice = el('aside', 'nv-panel nv-curriculum-callout');
      notice.append(el('strong', '', 'Specification only'));
      notice.append(el('p', 'nv-muted', 'This artifact describes a future interactive visualization. No executable interaction is fabricated in the frontend.'));
      body.append(notice);
    }

    const article = el('article', 'nv-panel nv-curriculum-reader');
    article.innerHTML = markdownToHtml(markdown);
    body.append(article);
    setWorkspace(artifact.title, `${typeLabel(artifact.type)} artifact.`);
  }

  async function renderCurrentRoute(hashValue = window.location.hash) {
    if (!target()) return;
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
    window.addEventListener('hashchange', () => renderCurrentRoute(window.location.hash));
    renderCurrentRoute(window.location.hash);

    window.NeuralVerse = window.NeuralVerse || {};
    window.NeuralVerse.curriculum = { service, renderCurrentRoute };
  }

  return { init, renderCurrentRoute };
}
