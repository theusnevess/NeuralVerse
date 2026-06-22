/**
 * NeuralVerse Global Curriculum Search & Discovery Controller
 *
 * Scope:
 * Fast, debounced, client-side exact and substring search over paths, modules,
 * lessons, and artifacts. Integrates lineage mapping, custom glassmorphism modal,
 * and keyboard navigation shortcuts (Ctrl+K).
 */

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // remove punctuation (keeping +, - and #)
    .replace(/\s+/g, ' ')
    .trim();
}

function highlightText(text, terms) {
  const escaped = escapeHtml(text);
  if (!terms || terms.length === 0) return escaped;

  let markedText = escaped;
  // Sort terms by length descending to match longer phrases first
  const sortedTerms = [...terms].sort((a, b) => b.length - a.length);

  sortedTerms.forEach(term => {
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (!escapedTerm) return;

    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    markedText = markedText.replace(regex, `\u0002$1\u0003`);
  });

  return markedText
    .replace(/\u0002/g, '<mark class="nv-search-highlight">')
    .replace(/\u0003/g, '</mark>');
}

export function createCurriculumSearchController(options = {}) {
  const root = options.root || document;
  let flatIndex = null;
  let indexPromise = null;
  let activeIndex = -1;
  let debounceTimeout = null;

  // DOM Elements
  const modal = root.getElementById('nv-curriculum-search-modal');
  const input = root.getElementById('nv-curriculum-search-input');
  const resultsContainer = root.getElementById('nv-curriculum-search-results');
  const trigger = root.getElementById('nv-global-search-trigger');
  const closeBtn = root.getElementById('nv-curriculum-search-close');

  function ensureIndex() {
    if (flatIndex) return Promise.resolve();
    if (indexPromise) return indexPromise;

    const service = window.NeuralVerse?.curriculum?.service;
    if (!service) {
      console.warn('Curriculum service not available. Retrying index generation later.');
      return Promise.resolve();
    }

    indexPromise = service.getIndex()
      .then(indexData => {
        flatIndex = buildFlatIndex(indexData);
      })
      .catch(e => {
        console.error('Failed to build curriculum search index:', e);
        indexPromise = null; // reset to allow retry
      });

    return indexPromise;
  }

  function buildFlatIndex(indexData) {
    const flat = [];
    const { learningPaths = [], modules = [], lessons = [], artifacts = [] } = indexData;

    function getParentModule(lessonId) {
      return modules.find(m => m.lessonIds && m.lessonIds.includes(lessonId));
    }

    function getParentPath(moduleId) {
      return learningPaths.find(p => p.moduleIds && p.moduleIds.includes(moduleId));
    }

    function getParentLesson(artifactId) {
      return lessons.find(l => l.artifactIds && l.artifactIds.includes(artifactId));
    }

    // 1. Learning Paths
    learningPaths.forEach(path => {
      flat.push({
        id: path.id,
        type: 'path',
        badgeLabel: 'Path',
        title: path.title,
        summary: path.overview || path.aim || '',
        href: `#/learning/${path.id}`,
        breadcrumbs: [path.title],
        searchableText: `${path.id} ${path.title} ${path.overview || ''} ${path.aim || ''} path`.toLowerCase()
      });
    });

    // 2. Modules
    modules.forEach(mod => {
      const parentPath = getParentPath(mod.id);
      const pathId = parentPath ? parentPath.id : '';
      const href = pathId ? `#/learning/${pathId}/module/${mod.id}` : `#/modules/${mod.id}`;
      const breadcrumbs = parentPath ? [parentPath.title, mod.title] : [mod.title];
      flat.push({
        id: mod.id,
        type: 'module',
        badgeLabel: mod.type || 'Module',
        title: mod.title,
        summary: mod.overview || mod.aim || '',
        href: href,
        breadcrumbs: breadcrumbs,
        searchableText: `${mod.id} ${mod.title} ${mod.overview || ''} ${mod.aim || ''} module`.toLowerCase()
      });
    });

    // 3. Lessons
    lessons.forEach(les => {
      const parentModule = getParentModule(les.id);
      const moduleId = parentModule ? parentModule.id : '';
      const parentPath = parentModule ? getParentPath(moduleId) : null;
      const pathId = parentPath ? parentPath.id : '';

      const href = (pathId && moduleId)
        ? `#/learning/${pathId}/module/${moduleId}/lesson/${les.id}`
        : `#/modules/${moduleId || les.id}`; // fallback

      const breadcrumbs = [];
      if (parentPath) breadcrumbs.push(parentPath.title);
      if (parentModule) breadcrumbs.push(parentModule.title);
      breadcrumbs.push(les.title);

      flat.push({
        id: les.id,
        type: 'lesson',
        badgeLabel: 'Lesson',
        title: les.title,
        summary: les.overview || les.learningGoal || '',
        href: href,
        breadcrumbs: breadcrumbs,
        searchableText: `${les.id} ${les.title} ${les.overview || ''} ${les.learningGoal || ''} lesson ${les.topic || ''}`.toLowerCase()
      });
    });

    // 4. Artifacts
    artifacts.forEach(art => {
      const parentLesson = getParentLesson(art.id);
      const lessonId = parentLesson ? parentLesson.id : '';
      const parentModule = parentLesson ? getParentModule(lessonId) : null;
      const moduleId = parentModule ? parentModule.id : '';
      const parentPath = parentModule ? getParentPath(moduleId) : null;
      const pathId = parentPath ? parentPath.id : '';

      const href = (pathId && moduleId && lessonId)
        ? `#/learning/${pathId}/module/${moduleId}/lesson/${lessonId}/artifact/${art.id}`
        : `#/learning`; // fallback

      const breadcrumbs = [];
      if (parentPath) breadcrumbs.push(parentPath.title);
      if (parentModule) breadcrumbs.push(parentModule.title);
      if (parentLesson) breadcrumbs.push(parentLesson.title);
      breadcrumbs.push(art.title);

      flat.push({
        id: art.id,
        type: 'artifact',
        badgeLabel: art.type || 'Artifact',
        title: art.title,
        summary: art.family || '',
        href: href,
        breadcrumbs: breadcrumbs,
        searchableText: `${art.id} ${art.title} ${art.family || ''} ${art.type || ''} artifact`.toLowerCase()
      });
    });

    return flat;
  }

  async function openModal() {
    if (!modal) return;
    modal.showModal();
    if (input) {
      input.value = '';
      input.focus();
    }

    if (!flatIndex) {
      renderLoadingState();
      await ensureIndex();
    }
    renderInitialState();
  }

  function closeModal() {
    if (!modal) return;
    modal.close();
    if (trigger) {
      trigger.focus();
    }
  }

  function renderLoadingState() {
    activeIndex = -1;
    if (!resultsContainer) return;
    resultsContainer.innerHTML = `
      <div class="nv-search-loading">
        <div class="nv-search-loading-spinner"></div>
        <div class="nv-search-loading-text">Preparing curriculum index…</div>
      </div>
    `;
  }

  function renderInitialState() {
    activeIndex = -1;
    if (!resultsContainer) return;
    resultsContainer.innerHTML = `
      <div class="nv-search-initial">
        <div class="nv-search-initial-icon">🖲️</div>
        <div class="nv-search-initial-title">Curriculum Discovery</div>
        <div class="nv-search-initial-text">Search for Learning Paths, Modules, Lessons, or Specific Artifacts. Type to begin.</div>
      </div>
    `;
  }

  function renderEmptyState() {
    activeIndex = -1;
    if (!resultsContainer) return;
    resultsContainer.innerHTML = `
      <div class="nv-search-empty">
        <div class="nv-search-empty-icon">⚠️</div>
        <div class="nv-search-empty-title">No results found</div>
        <div class="nv-search-empty-text">We couldn't find any curriculum matches. Please check spelling or try other keywords.</div>
        <div class="nv-search-empty-suggestions">
          <div class="nv-search-suggest-title">Try searching for:</div>
          <ul class="nv-search-suggest-list">
            <li class="nv-search-suggest-item"><button class="nv-search-suggest-btn" type="button">embeddings</button></li>
            <li class="nv-search-suggest-item"><button class="nv-search-suggest-btn" type="button">transformer</button></li>
            <li class="nv-search-suggest-item"><button class="nv-search-suggest-btn" type="button">reranking</button></li>
            <li class="nv-search-suggest-item"><button class="nv-search-suggest-btn" type="button">guardrail</button></li>
            <li class="nv-search-suggest-item"><button class="nv-search-suggest-btn" type="button">MLOps</button></li>
          </ul>
        </div>
      </div>
    `;

    // Add click listeners to suggestions
    const suggestionBtns = resultsContainer.querySelectorAll('.nv-search-suggest-btn');
    suggestionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const keyword = e.target.textContent;
        if (input) {
          input.value = keyword;
          input.focus();
          performSearch(keyword);
        }
      });
    });
  }

  function performSearch(query) {
    if (!flatIndex) return;
    const normQuery = normalizeText(query);
    const queryTerms = normQuery.split(/\s+/).filter(Boolean);
    if (queryTerms.length === 0) {
      renderInitialState();
      return;
    }

    // Match and calculate weighted scores
    const matches = flatIndex.map(item => {
      const normTitle = normalizeText(item.title);
      const normSummary = normalizeText(item.summary);
      const normId = normalizeText(item.id);

      const allTermsMatch = queryTerms.every(term => {
        return normTitle.includes(term) || normSummary.includes(term) || normId.includes(term) || item.type.toLowerCase().includes(term);
      });

      if (!allTermsMatch) return null;

      // Calculate score
      let score = 0;
      let matchedInTitle = queryTerms.every(term => normTitle.includes(term));
      let matchedInSummary = queryTerms.every(term => normSummary.includes(term));
      let matchedInId = queryTerms.every(term => normId.includes(term));

      if (normTitle === normQuery) {
        score = 1000;
      } else if (normTitle.startsWith(normQuery)) {
        score = 800;
      } else if (normTitle.includes(normQuery)) {
        score = 600;
      } else if (matchedInTitle) {
        score = 500;
      } else if (normSummary.includes(normQuery)) {
        score = 400;
      } else if (matchedInSummary) {
        score = 300;
      } else if (matchedInId) {
        score = 200;
      } else {
        score = 100;
      }

      return {
        item,
        score,
        matchedInTitle,
        matchedInSummary,
        matchedInId
      };
    }).filter(Boolean);

    if (matches.length === 0) {
      renderEmptyState();
      return;
    }

    // Sort: score desc, then alphabetically by title
    matches.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.item.title.localeCompare(b.item.title);
    });

    renderResults(matches, queryTerms);
  }

  function renderResults(matches, terms) {
    if (!resultsContainer) return;
    activeIndex = -1;

    const fragment = document.createDocumentFragment();
    matches.forEach(({ item, score, matchedInTitle, matchedInSummary, matchedInId }, index) => {
      const anchor = document.createElement('a');
      anchor.className = 'nv-search-item';
      anchor.href = item.href;
      anchor.setAttribute('role', 'option');
      anchor.setAttribute('aria-selected', 'false');
      anchor.dataset.index = index;

      const header = document.createElement('div');
      header.className = 'nv-search-item-header';

      const titleWrapper = document.createElement('div');
      titleWrapper.className = 'nv-search-item-title-wrapper';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'nv-search-item-title';
      titleSpan.innerHTML = highlightText(item.title, terms);

      titleWrapper.appendChild(titleSpan);

      const badge = document.createElement('span');
      badge.className = 'nv-search-badge';
      badge.dataset.type = item.type;
      badge.textContent = item.badgeLabel;

      header.appendChild(titleWrapper);
      header.appendChild(badge);

      anchor.appendChild(header);

      if (item.breadcrumbs && item.breadcrumbs.length > 0) {
        const breadcrumbsDiv = document.createElement('div');
        breadcrumbsDiv.className = 'nv-search-item-breadcrumbs';
        breadcrumbsDiv.innerHTML = item.breadcrumbs.map(bc => `<span>${escapeHtml(bc)}</span>`).join('');
        anchor.appendChild(breadcrumbsDiv);
      }

      if (item.summary) {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'nv-search-item-summary';
        summaryDiv.innerHTML = highlightText(item.summary, terms);
        anchor.appendChild(summaryDiv);
      }

      // Contextual highlight indicators
      const matchInfoDiv = document.createElement('div');
      matchInfoDiv.className = 'nv-search-item-match-info';

      let matchInfoHtml = `<span class="nv-match-label">Matches in:</span>`;
      let evidences = [];
      if (matchedInTitle) evidences.push('<span class="nv-match-badge">title</span>');
      if (matchedInSummary) evidences.push('<span class="nv-match-badge">summary</span>');
      if (matchedInId) evidences.push('<span class="nv-match-badge">id</span>');
      if (evidences.length === 0) evidences.push('<span class="nv-match-badge">metadata</span>');

      matchInfoDiv.innerHTML = matchInfoHtml + evidences.join(' ');
      anchor.appendChild(matchInfoDiv);

      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        window.location.hash = item.href;
      });

      fragment.appendChild(anchor);
    });

    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(fragment);
  }

  function updateActiveItem(direction) {
    if (!resultsContainer) return;
    const items = resultsContainer.querySelectorAll('.nv-search-item');
    if (items.length === 0) return;

    if (activeIndex >= 0 && items[activeIndex]) {
      items[activeIndex].classList.remove('active');
      items[activeIndex].setAttribute('aria-selected', 'false');
    }

    if (direction === 'down') {
      activeIndex = (activeIndex + 1) % items.length;
    } else if (direction === 'up') {
      activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
    } else if (direction === 'first') {
      activeIndex = 0;
    } else if (direction === 'last') {
      activeIndex = items.length - 1;
    }

    const activeItem = items[activeIndex];
    if (activeItem) {
      activeItem.classList.add('active');
      activeItem.setAttribute('aria-selected', 'true');
      activeItem.focus();
      // Keep input focused so user can keep typing
      if (input) {
        input.focus();
      }
      // Scroll into view
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }

  function handleKeyDown(e) {
    // 1. Esc closes search
    if (e.key === 'Escape') {
      closeModal();
      e.preventDefault();
      return;
    }

    // 2. Arrow keys navigate results
    if (e.key === 'ArrowDown') {
      updateActiveItem('down');
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      updateActiveItem('up');
      e.preventDefault();
    }

    // 3. Home / End keys focus first/last item
    if (e.key === 'Home') {
      updateActiveItem('first');
      e.preventDefault();
    } else if (e.key === 'End') {
      updateActiveItem('last');
      e.preventDefault();
    }

    // 4. Enter / Ctrl+Enter select active result
    if (e.key === 'Enter') {
      if (!resultsContainer) return;
      const items = resultsContainer.querySelectorAll('.nv-search-item');
      const activeItem = items[activeIndex] || items[0];
      if (activeItem) {
        if (e.ctrlKey || e.metaKey) {
          // Open in a new tab
          window.open(activeItem.href, '_blank');
        } else {
          activeItem.click();
        }
        e.preventDefault();
      }
    }
  }

  function handleInput(e) {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const query = e.target.value.trim();

    debounceTimeout = setTimeout(() => {
      performSearch(query);
    }, 200); // 200ms debounce
  }

  function init() {
    if (!modal) {
      console.warn('Search modal DOM element not found. Search integration skipped.');
      return;
    }

    // Event Listeners
    if (trigger) {
      trigger.addEventListener('click', openModal);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // Dialog backdrop clicks close the modal
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const clickInDialog = (
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right
      );
      if (!clickInDialog) {
        closeModal();
      }
    });

    if (input) {
      input.addEventListener('input', handleInput);
      input.addEventListener('keydown', handleKeyDown);
    }

    // Trap focus inside modal
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusable = Array.from(modal.querySelectorAll('input, button, [role="option"], a, [tabindex="0"]')).filter(el => {
          return el.tabIndex >= 0 && !el.disabled && el.offsetParent !== null;
        });
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    });

    // Global shortcut Ctrl+K
    window.addEventListener('keydown', (e) => {
      const isK = e.key.toLowerCase() === 'k';
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd && isK) {
        e.preventDefault();
        if (modal.open) {
          closeModal();
        } else {
          openModal();
        }
      }
    });

    // Proactively pre-fetch/load search index
    ensureIndex();
  }

  return {
    init,
    openModal,
    closeModal,
    performSearch
  };
}
