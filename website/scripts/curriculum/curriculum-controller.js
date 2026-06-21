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
  badge.title = `${status} is a curriculum lifecycle status. It does not imply learner mastery or certification.`;
  return badge;
}

function typeLabel(type) {
  return type === 'Interactive Visualization' ? 'Interactive Visualization Specification' : type;
}

function meta(label, value) {
  const item = el('span', 'nv-card-meta__item');
  item.textContent = `${label}: ${value || 'Not specified'}`;
  return item;
}

function card(title, summary, href, status, extra = []) {
  const article = el('article', 'nv-card');
  const header = el('div', 'nv-cluster nv-cluster--gap-sm');
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'flex-start';
  const heading = el('h3', '', title);
  header.append(heading, statusBadge(status));

  const description = el('p', 'nv-muted', summary || 'Canonical curriculum composition.');
  const metaRow = el('div', 'nv-card-meta');
  extra.forEach((item) => metaRow.append(item));

  const actions = el('div');
  actions.style.marginTop = 'auto';
  actions.style.paddingTop = 'var(--sys-space-stack-sm)';
  const link = el('a', 'nv-button', 'Open');
  link.dataset.variant = 'secondary';
  link.href = href;
  actions.append(link);

  article.append(header, description, metaRow, actions);
  return article;
}

function markdownToHtml(markdown) {
  const lines = String(markdown || '').split('\n');
  const html = [];
  let listOpen = false;
  let table = [];

  function closeList() {
    if (listOpen) {
      html.push('</ul>');
      listOpen = false;
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
        html.push('<ul>');
        listOpen = true;
      }
      html.push(`<li>${escapeHtml(bullet[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${escapeHtml(line)}</p>`);
  }

  closeList();
  flushTable();
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

  function renderShell(title, description = '') {
    const container = target();
    if (!container) return null;
    container.innerHTML = '';

    const header = el('header', 'nv-stack nv-stack--gap-xs');
    const eyebrow = el('span', 'nv-badge', 'NV-800 Curriculum');
    eyebrow.dataset.variant = 'info';
    header.append(eyebrow, el('h1', '', title));
    if (description) header.append(el('p', 'nv-muted', description));

    const body = el('div', 'nv-stack nv-stack--gap-md');
    container.append(header, body);
    return body;
  }

  async function renderLearningPaths() {
    const paths = await service.getLearningPaths();
    const body = renderShell('Learning Paths', 'Canonical NV-800 learning paths rendered from authored compositions.');
    if (!body) return;
    const grid = el('div', 'nv-grid nv-grid--cols-2');
    paths.forEach((path) => {
      grid.append(card(path.title, path.aim || path.overview, `#/learning/${path.id}`, path.canonicalStatus, [
        meta('Modules', String(path.moduleIds.length)),
        meta('Status', path.canonicalStatus),
      ]));
    });
    body.append(grid);
    setWorkspace('Learning Paths', `${paths.length} canonical learning paths available.`);
  }

  async function renderModulesIndex() {
    const modules = await service.getModules();
    const body = renderShell('Modules', 'Canonical NV-800 modules across all learning paths.');
    if (!body) return;
    const grid = el('div', 'nv-grid nv-grid--cols-2');
    modules.forEach((module) => {
      grid.append(card(module.title, module.aim || module.overview, `#/modules/${module.id}`, module.canonicalStatus, [
        meta('Lessons', String(module.lessonIds.length)),
        meta('Type', module.type),
      ]));
    });
    body.append(grid);
    setWorkspace('Modules', `${modules.length} canonical modules available.`);
  }

  async function renderPath(pathId) {
    const [path, modules] = await Promise.all([service.getLearningPath(pathId), service.getModulesForPath(pathId)]);
    const body = renderShell(path?.title || 'Learning Path', path?.aim || path?.overview || 'Learning path not found.');
    if (!body || !path) return;

    const metaRow = el('div', 'nv-card-meta');
    metaRow.append(meta('Status', path.canonicalStatus), meta('Modules', String(modules.length)), meta('Type', path.type));
    body.append(metaRow);

    const grid = el('div', 'nv-grid nv-grid--cols-2');
    modules.forEach((module) => {
      grid.append(card(module.title, module.aim || module.overview, `#/learning/${path.id}/module/${module.id}`, module.canonicalStatus, [
        meta('Lessons', String(module.lessonIds.length)),
      ]));
    });
    body.append(grid);
    setWorkspace(path.title, `${modules.length} modules in this learning path.`);
  }

  async function renderModule(pathId, moduleId) {
    const [module, lessons] = await Promise.all([service.getModule(moduleId), service.getLessonsForModule(moduleId)]);
    const body = renderShell(module?.title || 'Module', module?.aim || module?.overview || 'Module not found.');
    if (!body || !module) return;

    const metaRow = el('div', 'nv-card-meta');
    metaRow.append(meta('Status', module.canonicalStatus), meta('Lessons', String(lessons.length)), meta('Type', module.type));
    body.append(metaRow);

    const flow = el('p', 'nv-muted', 'Estimated learning flow: lessons are displayed in the canonical module order. This does not enforce progression logic.');
    body.append(flow);

    const stack = el('div', 'nv-stack nv-stack--gap-sm');
    lessons.forEach((lesson) => {
      stack.append(card(lesson.title, lesson.learningGoal || lesson.overview, `#/learning/${pathId}/module/${module.id}/lesson/${lesson.id}`, lesson.canonicalStatus, [
        meta('Artifacts', String(lesson.artifactIds.length)),
        meta('Topic', lesson.topic),
      ]));
    });
    body.append(stack);
    setWorkspace(module.title, `${lessons.length} lessons in this module.`);
  }

  async function renderStandaloneModule(moduleId) {
    const index = await service.getIndex();
    const path = index.learningPaths.find((candidate) => candidate.moduleIds.includes(moduleId));
    await renderModule(path?.id || 'canonical', moduleId);
  }

  async function renderLesson(pathId, moduleId, lessonId) {
    const [lesson, artifacts] = await Promise.all([service.getLesson(lessonId), service.getArtifactsForLesson(lessonId)]);
    const body = renderShell(lesson?.title || 'Lesson', lesson?.learningGoal || lesson?.overview || 'Lesson not found.');
    if (!body || !lesson) return;

    const metaRow = el('div', 'nv-card-meta');
    metaRow.append(meta('Status', lesson.canonicalStatus), meta('Artifacts', String(artifacts.length)), meta('Topic', lesson.topic));
    body.append(metaRow);

    const order = el('p', 'nv-muted', 'Artifact order: Explanatory Text → Visual Intuition → Interactive Visualization Specification → Exercise → Comparison Table.');
    body.append(order);

    const stack = el('div', 'nv-stack nv-stack--gap-sm');
    artifacts.forEach((artifact) => {
      stack.append(card(artifact.title, typeLabel(artifact.type), `#/learning/${pathId}/module/${moduleId}/lesson/${lesson.id}/artifact/${artifact.id}`, artifact.canonicalStatus, [
        meta('Type', typeLabel(artifact.type)),
        meta('Duration', artifact.estimatedDuration),
      ]));
    });
    body.append(stack);
    setWorkspace(lesson.title, `${artifacts.length} artifacts in this lesson.`);
  }

  async function renderArtifact(pathId, moduleId, lessonId, artifactId) {
    const content = await service.loadArtifactMarkdown(artifactId);
    const body = renderShell(content?.artifact?.title || 'Learning Artifact', typeLabel(content?.artifact?.type) || 'Artifact not found.');
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
      const notice = el('div', 'nv-panel');
      notice.append(el('strong', '', 'Specification only'));
      notice.append(el('p', 'nv-muted', 'This artifact describes a future interactive visualization. No executable interaction is fabricated in the frontend.'));
      body.append(notice);
    }

    const article = el('article', 'nv-panel nv-stack nv-stack--gap-sm');
    article.innerHTML = markdownToHtml(markdown);
    body.append(article);
    setWorkspace(artifact.title, `${typeLabel(artifact.type)} artifact.`);
  }

  async function renderCurrentRoute(hashValue = window.location.hash) {
    if (!target()) return;
    const parts = routeParts(hashValue);

    try {
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
