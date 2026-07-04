/**
 * NV-900-UI8 — Personalized Learning & Knowledge Workspace
 * Coordinates study sessions, study queue, favorites, reading goals, reading bookmarks,
 * paragraph highlights, collections, tags, notes, and renders the Workspace Dashboard on #/workspace.
 */

(function () {
  'use strict';

  let curriculumIndex = null;
  let saveNoteTimeout = null;
  let studySessionInterval = null;

  async function getIndex() {
    if (curriculumIndex) return curriculumIndex;
    const service = window.NeuralVerse?.curriculum?.service;
    if (service) {
      curriculumIndex = await service.getIndex();
    }
    return curriculumIndex;
  }

  function getResourceDetails(id, index) {
    if (!index) return null;
    const { learningPaths = [], modules = [], lessons = [], artifacts = [] } = index;

    // Search in artifacts
    const art = artifacts.find(a => a.id === id);
    if (art) {
      const lesson = lessons.find(l => l.artifactIds && l.artifactIds.includes(art.id));
      const module = lesson ? modules.find(m => m.lessonIds && m.lessonIds.includes(lesson.id)) : null;
      const path = module ? learningPaths.find(p => p.moduleIds && p.moduleIds.includes(module.id)) : null;
      return {
        id,
        type: 'Artifact',
        title: art.title,
        status: art.canonicalStatus || 'Draft',
        lineage: {
          path: path ? { id: path.id, title: path.title } : null,
          module: module ? { id: module.id, title: module.title } : null,
          lesson: lesson ? { id: lesson.id, title: lesson.title } : null
        }
      };
    }

    // Search in lessons
    const les = lessons.find(l => l.id === id);
    if (les) {
      const module = modules.find(m => m.lessonIds && m.lessonIds.includes(les.id));
      const path = module ? learningPaths.find(p => p.moduleIds && p.moduleIds.includes(module.id)) : null;
      return {
        id,
        type: 'Lesson',
        title: les.title,
        status: les.canonicalStatus || 'Draft',
        lineage: {
          path: path ? { id: path.id, title: path.title } : null,
          module: module ? { id: module.id, title: module.title } : null,
          lesson: null
        }
      };
    }

    // Search in modules
    const mod = modules.find(m => m.id === id);
    if (mod) {
      const path = learningPaths.find(p => p.moduleIds && p.moduleIds.includes(mod.id));
      return {
        id,
        type: 'Module',
        title: mod.title,
        status: mod.canonicalStatus || 'Draft',
        lineage: {
          path: path ? { id: path.id, title: path.title } : null,
          module: null,
          lesson: null
        }
      };
    }

    // Search in paths
    const pat = learningPaths.find(p => p.id === id);
    if (pat) {
      return {
        id,
        type: 'Learning Path',
        title: pat.title,
        status: pat.canonicalStatus || 'Draft',
        lineage: {
          path: null,
          module: null,
          lesson: null
        }
      };
    }

    return null;
  }

  // --- Helper: Format time ---
  function formatSecondsToTimer(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }

  // --- Helper: Render markdown in notes preview ---
  function renderMarkdown(md) {
    if (!md) return '<span class="nv-muted">Preview matches typed notes...</span>';
    return md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  // --- Helper: Global Session Bar DOM management ---
  function ensureSessionBar() {
    let bar = document.getElementById('nv-global-session-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'nv-global-session-bar';
      bar.className = 'nv-session-bar';
      bar.hidden = true;

      bar.innerHTML = `
        <div class="nv-session-bar__left">
          <span class="nv-session-indicator-pulse"></span>
          <span class="nv-session-status-text">Study Session Active</span>
          <span class="nv-session-timer" id="nv-session-timer-display">00:00</span>
          <span class="nv-session-resource-title" id="nv-session-resource-display">—</span>
        </div>
        <div class="nv-session-bar__actions">
          <button class="nv-button nv-button--xs" id="nv-session-pause-btn" type="button" style="padding: 4px 8px; min-block-size: unset;">Pause</button>
          <button class="nv-button nv-button--xs nv-button--primary" id="nv-session-end-btn" type="button" style="padding: 4px 8px; min-block-size: unset;">End Session</button>
        </div>
      `;
      document.body.prepend(bar);

      bar.querySelector('#nv-session-pause-btn').addEventListener('click', () => {
        const service = window.NeuralVerse.PersonalizationService;
        const session = service.getActiveSession();
        if (session) {
          if (session.paused) {
            service.resumeSession();
          } else {
            service.pauseSession();
          }
        }
      });

      bar.querySelector('#nv-session-end-btn').addEventListener('click', () => {
        const service = window.NeuralVerse.PersonalizationService;
        const summary = service.endSession();
        if (summary) {
          showSessionSummaryModal(summary);
        }
      });
    }
    return bar;
  }

  function showSessionSummaryModal(summary) {
    const existing = document.getElementById('nv-session-summary-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'nv-summary-modal-overlay';
    overlay.id = 'nv-session-summary-modal';

    const modal = document.createElement('div');
    modal.className = 'nv-summary-modal nv-stack nv-stack--gap-md';

    const formattedTime = formatSecondsToTimer(summary.durationSeconds);
    const goalText = summary.goalMinutes ? `${summary.goalMinutes}m` : 'None';

    modal.innerHTML = `
      <h2 style="margin: 0; font-size: var(--ref-font-size-600); color: var(--sys-color-accent-primary);">Session Complete</h2>
      <p class="nv-muted">Here's a summary of your study session.</p>

      <div class="nv-summary-stat-grid">
        <div class="nv-summary-stat-card">
          <div class="nv-summary-stat-value">${formattedTime}</div>
          <div class="nv-summary-stat-label">Duration</div>
        </div>
        <div class="nv-summary-stat-card">
          <div class="nv-summary-stat-value">${goalText}</div>
          <div class="nv-summary-stat-label">Goal</div>
        </div>
        <div class="nv-summary-stat-card">
          <div class="nv-summary-stat-value">${summary.visitedCount}</div>
          <div class="nv-summary-stat-label">Items Visited</div>
        </div>
        <div class="nv-summary-stat-card">
          <div class="nv-summary-stat-value">${summary.notesCount}</div>
          <div class="nv-summary-stat-label">Notes</div>
        </div>
      </div>

      <div class="nv-stack nv-stack--gap-xs" style="border-block-start: var(--sys-border-subtle) solid var(--sys-color-border-subtle); padding-block-start: var(--sys-space-stack-sm);">
        <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">
          Completed ${summary.completedCount} learning items. Added ${summary.bookmarksCount} bookmarks.
        </p>
      </div>

      <div class="nv-cluster" style="justify-content: flex-end;">
        <button class="nv-button" id="nv-summary-close-btn" type="button">Close</button>
      </div>
    `;

    overlay.append(modal);
    document.body.appendChild(overlay);

    overlay.querySelector('#nv-summary-close-btn').addEventListener('click', () => {
      overlay.remove();
      const currentHash = window.location.hash || '#/';
      if (currentHash === '#/workspace') {
        renderWorkspaceDashboard().catch(console.error);
      }
    });
  }

  function updateSessionTimerUI() {
    const service = window.NeuralVerse.PersonalizationService;
    const session = service.getActiveSession();
    const bar = ensureSessionBar();

    if (!session) {
      bar.hidden = true;
      document.body.classList.remove('nv-has-active-session');
      if (studySessionInterval) {
        clearInterval(studySessionInterval);
        studySessionInterval = null;
      }
      return;
    }

    bar.hidden = false;
    document.body.classList.add('nv-has-active-session');

    const pulseIndicator = bar.querySelector('.nv-session-indicator-pulse');
    const pauseBtn = bar.querySelector('#nv-session-pause-btn');
    const statusText = bar.querySelector('.nv-session-status-text');

    if (session.paused) {
      pulseIndicator.classList.add('nv-session-indicator-pulse--paused');
      pauseBtn.textContent = 'Resume';
      statusText.textContent = 'Session Paused';
    } else {
      pulseIndicator.classList.remove('nv-session-indicator-pulse--paused');
      pauseBtn.textContent = 'Pause';
      statusText.textContent = 'Session Active';
    }

    const resourceDisplay = bar.querySelector('#nv-session-resource-display');
    if (session.resourcesVisited.length > 0) {
      const latest = session.resourcesVisited[session.resourcesVisited.length - 1];
      resourceDisplay.textContent = `${latest.type}: ${latest.title}`;
    } else {
      resourceDisplay.textContent = 'Overview';
    }

    let elapsed = session.accumulatedTime;
    if (!session.paused) {
      elapsed += Math.floor((new Date() - new Date(session.lastUpdated)) / 1000);
    }

    bar.querySelector('#nv-session-timer-display').textContent = formatSecondsToTimer(elapsed);
  }

  let secondsElapsedThisSessionInstance = 0;
  function startStudySessionTicker() {
    if (studySessionInterval) clearInterval(studySessionInterval);
    updateSessionTimerUI();
    studySessionInterval = setInterval(() => {
      const service = window.NeuralVerse.PersonalizationService;
      const session = service.getActiveSession();
      if (session) {
        updateSessionTimerUI();

        if (!session.paused) {
          secondsElapsedThisSessionInstance++;
          if (secondsElapsedThisSessionInstance >= 60) {
            secondsElapsedThisSessionInstance = 0;
            service.updateGoalProgress(1);
          }

          const currentElapsed = session.accumulatedTime + Math.floor((new Date() - new Date(session.lastUpdated)) / 1000);
          if (currentElapsed % 5 === 0) {
            service.saveActiveSession(session);
          }
        }
      } else {
        clearInterval(studySessionInterval);
        studySessionInterval = null;
      }
    }, 1000);
  }

  // --- Track Navigation ---
  async function trackNavigation() {
    const hash = window.location.hash || '#/';
    const index = await getIndex();
    if (!index) return;

    let resourceId = null;
    let resourceType = null;

    if (hash.includes('/artifact/')) {
      const parts = hash.split('/artifact/');
      resourceId = parts[1];
      resourceType = 'Artifact';
    } else if (hash.includes('/lesson/')) {
      const parts = hash.split('/lesson/');
      resourceId = parts[1].split('/')[0];
      resourceType = 'Lesson';
    } else if (hash.includes('/module/')) {
      const parts = hash.split('/module/');
      resourceId = parts[1].split('/')[0];
      resourceType = 'Module';
    } else if (hash.includes('/learning/')) {
      const parts = hash.split('/learning/');
      resourceId = parts[1].split('/')[0];
      resourceType = 'Learning Path';
    }

    if (resourceId) {
      const details = getResourceDetails(resourceId, index);
      if (details) {
        const service = window.NeuralVerse.PersonalizationService;

        // Update recently visited
        service.addRecentlyVisited(
          details.id,
          details.type,
          details.title,
          details.lineage,
          details.status
        );

        // Update active study session visited resources
        const activeSession = service.getActiveSession();
        if (activeSession) {
          const visitedExists = activeSession.resourcesVisited.some(r => r.id === details.id);
          if (!visitedExists) {
            activeSession.resourcesVisited.push({
              id: details.id,
              type: details.type,
              title: details.title,
              timestamp: new Date().toISOString()
            });
            service.saveActiveSession(activeSession);
          }
        }

        // Update continue reading
        const lin = details.lineage;
        if (details.type === 'Artifact') {
          service.updateContinueReading(
            lin.path, lin.module, lin.lesson, { id: details.id, title: details.title }
          );
        } else if (details.type === 'Lesson') {
          service.updateContinueReading(
            lin.path, lin.module, { id: details.id, title: details.title }, null
          );
        } else if (details.type === 'Module') {
          service.updateContinueReading(
            lin.path, { id: details.id, title: details.title }, null, null
          );
        } else if (details.type === 'Learning Path') {
          service.updateContinueReading(
            { id: details.id, title: details.title }, null, null, null
          );
        }
      }
    }
  }

  // --- Personalization UI Integration ---
  function initPersonalizationExperience(context) {
    const { pathId, moduleId, lessonId, artifactId, artifact, lesson, path, module, mainContent } = context;
    const service = window.NeuralVerse.PersonalizationService;
    if (!service) return;

    const resourceId = artifactId || lessonId;
    const resourceTitle = artifact ? artifact.title : lesson.title;
    const resourceType = artifact ? 'Artifact' : 'Lesson';

    const metadataCol = document.querySelector('.nv-lesson-workspace__metadata-col');

    // 1. Add Bookmark Button to sticky reading header or lesson header
    if (artifactId) {
      const stickyHeader = document.querySelector('.nv-sticky-reading-header__left');
      if (stickyHeader && !stickyHeader.querySelector('.nv-button--bookmark')) {
        const bookmarkBtn = document.createElement('button');
        bookmarkBtn.className = 'nv-button nv-button--bookmark nv-button--icon-only';
        bookmarkBtn.type = 'button';
        bookmarkBtn.setAttribute('aria-label', 'Toggle Bookmark');

        const updateBookmarkBtnState = () => {
          const isBookmarked = service.isBookmarked(resourceId);
          bookmarkBtn.dataset.bookmarked = isBookmarked ? 'true' : 'false';
          bookmarkBtn.innerHTML = isBookmarked ? '★' : '☆';
        };

        bookmarkBtn.addEventListener('click', () => {
          if (service.isBookmarked(resourceId)) {
            service.removeBookmark(resourceId);
          } else {
            const lin = {
              path: path ? { id: path.id, title: path.title } : null,
              module: module ? { id: module.id, title: module.title } : null,
              lesson: lesson ? { id: lesson.id, title: lesson.title } : null
            };
            service.addBookmark(resourceId, resourceType, resourceTitle, lin);
          }
          updateBookmarkBtnState();
        });

        updateBookmarkBtnState();
        stickyHeader.append(bookmarkBtn);
      }
    } else {
      const lessonTitleGroup = document.querySelector('.nv-lesson-workspace__header .nv-cluster');
      if (lessonTitleGroup && !lessonTitleGroup.querySelector('.nv-button--bookmark')) {
        const bookmarkBtn = document.createElement('button');
        bookmarkBtn.className = 'nv-button nv-button--bookmark nv-button--icon-only';
        bookmarkBtn.type = 'button';
        bookmarkBtn.setAttribute('aria-label', 'Toggle Bookmark');

        const updateBookmarkBtnState = () => {
          const isBookmarked = service.isBookmarked(resourceId);
          bookmarkBtn.dataset.bookmarked = isBookmarked ? 'true' : 'false';
          bookmarkBtn.innerHTML = isBookmarked ? '★' : '☆';
        };

        bookmarkBtn.addEventListener('click', () => {
          if (service.isBookmarked(resourceId)) {
            service.removeBookmark(resourceId);
          } else {
            const lin = {
              path: path ? { id: path.id, title: path.title } : null,
              module: module ? { id: module.id, title: module.title } : null,
              lesson: null
            };
            service.addBookmark(resourceId, resourceType, resourceTitle, lin);
          }
          updateBookmarkBtnState();
        });

        updateBookmarkBtnState();
        lessonTitleGroup.append(bookmarkBtn);
      }
    }

    if (!metadataCol) return;

    // Remove existing personalization panels to avoid duplication
    metadataCol.querySelectorAll('.nv-personalization-panel').forEach(p => p.remove());

    // Restore scroll position
    const continueReading = service.getContinueReading();
    if (continueReading && continueReading.artifact && continueReading.artifact.id === artifactId && continueReading.scrollPosition > 0) {
      setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight > 0) {
          window.scrollTo({
            top: continueReading.scrollPosition * scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 400);
    }

    // ==========================================
    // PANEL 1: STUDY TOOLS
    // ==========================================
    const toolsCard = document.createElement('div');
    toolsCard.className = 'nv-panel nv-lesson-workspace__metadata-card nv-personalization-panel nv-stack nv-stack--gap-xs';

    const toolsTitle = document.createElement('h3');
    toolsTitle.className = 'nv-lesson-workspace__section-title';
    toolsTitle.textContent = 'Study Tools';

    const toolsGroup = document.createElement('div');
    toolsGroup.className = 'nv-stack nv-stack--gap-xs';

    // Favorite button
    const favBtn = document.createElement('button');
    favBtn.className = 'nv-button';
    favBtn.type = 'button';
    favBtn.style.width = '100%';
    const updateFavBtnText = () => {
      const isFav = service.isFavorite(resourceId);
      favBtn.dataset.variant = isFav ? 'primary' : 'secondary';
      favBtn.textContent = isFav ? '★ Favorited' : '☆ Add to Favorites';
    };
    favBtn.addEventListener('click', () => {
      service.toggleFavorite(resourceId, resourceType, resourceTitle, window.location.hash);
      updateFavBtnText();
    });
    updateFavBtnText();

    // Queue button
    const qBtn = document.createElement('button');
    qBtn.className = 'nv-button';
    qBtn.type = 'button';
    qBtn.style.width = '100%';
    const updateQBtnText = () => {
      const queue = service.getQueue();
      const inQ = queue.some(item => item.id === resourceId);
      qBtn.dataset.variant = inQ ? 'primary' : 'secondary';
      qBtn.textContent = inQ ? '✓ In Study Queue' : '+ Add to Study Queue';
      qBtn.disabled = inQ;
    };
    qBtn.addEventListener('click', () => {
      service.addToQueue({ id: resourceId, type: resourceType, title: resourceTitle, route: window.location.hash });
      updateQBtnText();
    });
    updateQBtnText();

    // Reading Progress Dropdown
    const progressBlock = document.createElement('div');
    progressBlock.className = 'nv-stack nv-stack--gap-xs';
    progressBlock.style.marginTop = '5px';

    const progressLabel = document.createElement('label');
    progressLabel.textContent = 'Reading Progress:';
    progressLabel.style.fontSize = '0.7rem';
    progressLabel.style.fontWeight = 'bold';

    const progressSelect = document.createElement('select');
    progressSelect.className = 'nv-input';
    progressSelect.style.padding = '4px';
    progressSelect.style.width = '100%';

    const statuses = ['Not Started', 'In Progress', 'Completed'];
    statuses.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      progressSelect.appendChild(opt);
    });

    progressSelect.value = service.getReadingProgress(resourceId).status;
    progressSelect.addEventListener('change', () => {
      service.setReadingProgress(resourceId, progressSelect.value);
    });

    progressBlock.append(progressLabel, progressSelect);
    toolsGroup.append(favBtn, qBtn, progressBlock);
    toolsCard.append(toolsTitle, toolsGroup);
    metadataCol.append(toolsCard);

    // ==========================================
    // PANEL 2: READING BOOKMARKS
    // ==========================================
    const bmarksCard = document.createElement('div');
    bmarksCard.className = 'nv-panel nv-lesson-workspace__metadata-card nv-personalization-panel nv-stack nv-stack--gap-xs';

    const bmarksTitle = document.createElement('h3');
    bmarksTitle.className = 'nv-lesson-workspace__section-title';
    bmarksTitle.textContent = 'Reading Bookmarks';

    const addBmarkBtn = document.createElement('button');
    addBmarkBtn.className = 'nv-button';
    addBmarkBtn.dataset.variant = 'secondary';
    addBmarkBtn.textContent = 'Bookmark Current Position';
    addBmarkBtn.type = 'button';
    addBmarkBtn.style.width = '100%';

    const bmarkList = document.createElement('ul');
    bmarkList.className = 'nv-bookmarks-list';

    const renderReadingBookmarks = () => {
      bmarkList.innerHTML = '';
      const list = service.getReadingBookmarks(resourceId);
      if (list.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'nv-muted';
        empty.textContent = 'No bookmarks saved.';
        empty.style.fontSize = '0.75rem';
        bmarkList.append(empty);
        return;
      }
      list.forEach(b => {
        const li = document.createElement('li');
        li.className = 'nv-bookmark-item';

        const link = document.createElement('a');
        link.className = 'nv-bookmark-item__link';
        link.textContent = b.title;
        link.addEventListener('click', () => {
          if (b.type === 'scroll') {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({
              top: b.position * scrollHeight,
              behavior: 'smooth'
            });
          }
        });

        const delBtn = document.createElement('button');
        delBtn.className = 'nv-button nv-button--icon-only';
        delBtn.innerHTML = '×';
        delBtn.style.padding = '0 4px';
        delBtn.addEventListener('click', () => {
          service.removeReadingBookmark(resourceId, b.id);
          renderReadingBookmarks();
        });

        li.append(link, delBtn);
        bmarkList.append(li);
      });
    };

    addBmarkBtn.addEventListener('click', () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      let ratio = 0;
      if (scrollHeight > 0) {
        ratio = window.scrollY / scrollHeight;
      }
      const pct = Math.round(ratio * 100);
      const title = `Scroll position: ${pct}%`;
      service.addReadingBookmark(resourceId, title, ratio, 'scroll');
      renderReadingBookmarks();
    });

    bmarksCard.append(bmarksTitle, addBmarkBtn, bmarkList);
    metadataCol.append(bmarksCard);
    renderReadingBookmarks();

    // ==========================================
    // PANEL 3: PERSONAL NOTES (from original controller)
    // ==========================================
    const notesCard = document.createElement('div');
    notesCard.className = 'nv-panel nv-lesson-workspace__metadata-card nv-personalization-panel nv-notes-card nv-stack nv-stack--gap-xs';

    const notesTitle = document.createElement('h3');
    notesTitle.className = 'nv-lesson-workspace__section-title';
    notesTitle.textContent = 'Personal Notes';

    const notesTextarea = document.createElement('textarea');
    notesTextarea.className = 'nv-notes-textarea';
    notesTextarea.placeholder = 'Write notes using Markdown...';
    notesTextarea.value = service.getNote(resourceId)?.text || '';

    const notesStatus = document.createElement('span');
    notesStatus.className = 'nv-notes-status nv-muted';
    notesStatus.textContent = 'Autosaved';
    notesStatus.style.fontSize = '0.65rem';

    // Live Preview
    const previewHeader = document.createElement('h5');
    previewHeader.textContent = 'Live Preview:';
    previewHeader.style.margin = '10px 0 5px 0';
    previewHeader.style.fontSize = '0.75rem';

    const previewPane = document.createElement('div');
    previewPane.className = 'nv-notes-preview';
    previewPane.innerHTML = renderMarkdown(notesTextarea.value);

    // Save/Clear Actions
    const notesActions = document.createElement('div');
    notesActions.className = 'nv-cluster nv-cluster--gap-xs';
    notesActions.style.marginTop = '5px';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'nv-button';
    saveBtn.dataset.variant = 'secondary';
    saveBtn.textContent = 'Save Now';
    saveBtn.style.padding = '4px 8px';
    saveBtn.style.fontSize = '0.7rem';
    saveBtn.type = 'button';
    saveBtn.addEventListener('click', () => {
      service.saveNote(resourceId, resourceTitle, resourceType, notesTextarea.value);
      notesStatus.textContent = 'Saved manually';
    });

    const clearBtn = document.createElement('button');
    clearBtn.className = 'nv-button';
    clearBtn.dataset.variant = 'secondary';
    clearBtn.textContent = 'Clear Notes';
    clearBtn.style.padding = '4px 8px';
    clearBtn.style.fontSize = '0.7rem';
    clearBtn.type = 'button';
    clearBtn.addEventListener('click', () => {
      notesTextarea.value = '';
      service.saveNote(resourceId, resourceTitle, resourceType, '');
      previewPane.innerHTML = renderMarkdown('');
      notesStatus.textContent = 'Cleared';
    });

    notesActions.append(saveBtn, clearBtn, notesStatus);

    notesTextarea.addEventListener('input', () => {
      notesStatus.textContent = 'Saving...';
      previewPane.innerHTML = renderMarkdown(notesTextarea.value);
      clearTimeout(saveNoteTimeout);
      saveNoteTimeout = setTimeout(() => {
        service.saveNote(resourceId, resourceTitle, resourceType, notesTextarea.value);
        notesStatus.textContent = 'Autosaved';
      }, 500);
    });

    notesCard.append(notesTitle, notesTextarea, notesActions, previewHeader, previewPane);
    metadataCol.append(notesCard);

    // ==========================================
    // PANEL 4: STUDY COLLECTIONS (from original controller)
    // ==========================================
    const collectionsCard = document.createElement('div');
    collectionsCard.className = 'nv-panel nv-lesson-workspace__metadata-card nv-personalization-panel nv-collections-card nv-stack nv-stack--gap-xs';

    const colTitle = document.createElement('h3');
    colTitle.className = 'nv-lesson-workspace__section-title';
    colTitle.textContent = 'Study Collections';

    const colList = document.createElement('div');
    colList.className = 'nv-collections-list nv-stack nv-stack--gap-xs';

    const renderCollections = () => {
      colList.innerHTML = '';
      const collections = service.getCollections();

      if (collections.length === 0) {
        const empty = document.createElement('span');
        empty.className = 'nv-muted';
        empty.textContent = 'No collections created yet.';
        colList.append(empty);
        return;
      }

      collections.forEach(col => {
        const item = document.createElement('label');
        item.className = 'nv-collection-item-label';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = service.isInCollection(col.name, resourceId);

        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            service.addToCollection(col.name, resourceId, resourceTitle, resourceType);
          } else {
            service.removeFromCollection(col.name, resourceId);
          }
        });

        const labelText = document.createTextNode(` ${col.name}`);
        item.append(checkbox, labelText);
        colList.append(item);
      });
    };

    const addColGroup = document.createElement('div');
    addColGroup.className = 'nv-cluster nv-cluster--gap-xs';

    const addColInput = document.createElement('input');
    addColInput.className = 'nv-input nv-add-collection-input';
    addColInput.placeholder = 'New Collection Name...';
    addColInput.style.padding = '4px';

    const addColBtn = document.createElement('button');
    addColBtn.className = 'nv-button';
    addColBtn.dataset.variant = 'secondary';
    addColBtn.textContent = 'Create';
    addColBtn.type = 'button';

    addColBtn.addEventListener('click', () => {
      const name = addColInput.value.trim();
      if (name) {
        service.createCollection(name);
        addColInput.value = '';
        renderCollections();
      }
    });

    addColInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addColBtn.click();
      }
    });

    addColGroup.append(addColInput, addColBtn);
    collectionsCard.append(colTitle, colList, addColGroup);
    metadataCol.append(collectionsCard);
    renderCollections();

    // ==========================================
    // PANEL 5: PERSONAL TAGS (from original controller)
    // ==========================================
    const tagsCard = document.createElement('div');
    tagsCard.className = 'nv-panel nv-lesson-workspace__metadata-card nv-personalization-panel nv-tags-card nv-stack nv-stack--gap-xs';

    const tagsTitle = document.createElement('h3');
    tagsTitle.className = 'nv-lesson-workspace__section-title';
    tagsTitle.textContent = 'Personal Tags';

    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'nv-tags-container nv-cluster nv-cluster--gap-xs';

    const renderTags = () => {
      tagsContainer.innerHTML = '';
      const tags = service.getTagsForResource(resourceId);

      tags.forEach(tag => {
        const badge = document.createElement('span');
        badge.className = 'nv-badge nv-tag-badge';
        badge.dataset.variant = 'info';

        const label = document.createElement('span');
        label.textContent = tag;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'nv-tag-remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.type = 'button';
        removeBtn.setAttribute('aria-label', `Remove tag ${tag}`);

        removeBtn.addEventListener('click', () => {
          service.removeTag(resourceId, tag);
          renderTags();
        });

        badge.append(label, removeBtn);
        tagsContainer.append(badge);
      });
    };

    const addTagInput = document.createElement('input');
    addTagInput.className = 'nv-input nv-add-tag-input';
    addTagInput.placeholder = 'Add Tag (press Enter)...';
    addTagInput.style.padding = '4px';

    addTagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const tag = addTagInput.value.trim();
        if (tag) {
          service.addTag(resourceId, tag);
          addTagInput.value = '';
          renderTags();
        }
      }
    });

    tagsCard.append(tagsTitle, tagsContainer, addTagInput);
    metadataCol.append(tagsCard);
    renderTags();

    // ==========================================
    // Paragraph-Level Highlighting (from original controller)
    // ==========================================
    if (artifactId) {
      const article = mainContent.querySelector('.nv-curriculum-reader');
      if (article) {
        const paragraphs = Array.from(article.querySelectorAll('p, li, blockquote'));

        paragraphs.forEach((p, index) => {
          const anchorId = `block-${index}`;
          p.dataset.highlightAnchor = anchorId;

          const activeHighlights = service.getHighlightsForResource(resourceId);
          const activeH = activeHighlights.find(h => h.anchorId === anchorId);
          if (activeH) {
            p.classList.add(`nv-highlight--${activeH.color}`);
          }

          p.addEventListener('mouseenter', () => {
            if (p.querySelector('.nv-paragraph-highlight-menu')) return;

            const menu = document.createElement('div');
            menu.className = 'nv-paragraph-highlight-menu nv-cluster nv-cluster--gap-xs';

            const colors = ['yellow', 'green', 'clear'];
            colors.forEach(col => {
              const btn = document.createElement('button');
              btn.className = `nv-highlight-color-btn nv-highlight-color-btn--${col}`;
              btn.type = 'button';
              btn.setAttribute('aria-label', `${col} highlight`);

              btn.addEventListener('click', (e) => {
                e.stopPropagation();
                p.classList.remove('nv-highlight--yellow', 'nv-highlight--green');

                if (col === 'clear') {
                  const curr = service.getHighlightsForResource(resourceId).find(h => h.anchorId === anchorId);
                  if (curr) service.toggleHighlight(resourceId, anchorId);
                } else {
                  const curr = service.getHighlightsForResource(resourceId).find(h => h.anchorId === anchorId);
                  if (curr) {
                    if (curr.color !== col) {
                      service.toggleHighlight(resourceId, anchorId);
                      service.toggleHighlight(resourceId, anchorId, col);
                    }
                  } else {
                    service.toggleHighlight(resourceId, anchorId, col);
                  }
                  p.classList.add(`nv-highlight--${col}`);
                }
              });

              menu.append(btn);
            });

            p.style.position = 'relative';
            p.append(menu);
          });

          p.addEventListener('mouseleave', () => {
            const menu = p.querySelector('.nv-paragraph-highlight-menu');
            if (menu) menu.remove();
          });
        });
      }
    }

    // Hook list item indicators in Lesson Outline
    updateOutlineProgressBadges();
  }

  // Hook progress bullets next to items in outline list
  function updateOutlineProgressBadges() {
    const service = window.NeuralVerse.PersonalizationService;
    const outlineItems = document.querySelectorAll('.nv-lesson-workspace__outline-item');
    outlineItems.forEach(item => {
      const href = item.getAttribute('href');
      if (!href) return;

      let itemId = null;
      if (href.includes('/artifact/')) {
        itemId = href.split('/artifact/')[1];
      } else if (href.includes('/lesson/')) {
        itemId = href.split('/lesson/')[1].split('/')[0];
      }

      if (itemId) {
        const progress = service.getReadingProgress(itemId);
        const existing = item.querySelector('.nv-progress-bullet');
        if (existing) existing.remove();

        const bullet = document.createElement('span');
        bullet.className = 'nv-progress-bullet';
        if (progress.status === 'Completed') {
          bullet.classList.add('nv-progress-bullet--completed');
          bullet.title = 'Completed';
        } else if (progress.status === 'In Progress') {
          bullet.classList.add('nv-progress-bullet--in-progress');
          bullet.title = 'In Progress';
        } else {
          bullet.classList.add('nv-progress-bullet--not-started');
          bullet.title = 'Not Started';
        }

        const titleEl = item.querySelector('.nv-lesson-workspace__outline-item-title');
        if (titleEl) {
          titleEl.prepend(bullet);
        }
      }
    });
  }

  // --- Render Workspace Dashboard ---
  async function renderWorkspaceDashboard() {
    const index = await getIndex();
    const service = window.NeuralVerse.PersonalizationService;
    if (!service || !index) return;

    const container = document.querySelector('#nv-workspace-content-body') || document.querySelector('.nv-main-workspace');
    if (!container) return;

    const stats = service.getStats();
    const continueReading = service.getContinueReading();
    const bookmarks = service.getBookmarks();
    const recentlyVisited = service.getRecentlyVisited();
    const collections = service.getCollections();
    const notes = service.getNotes();
    const highlights = service.getHighlights();
    const queue = service.getQueue();
    const favorites = service.getFavorites();
    const goals = service.getGoals();
    const activeSession = service.getActiveSession();
    const lastSession = service.getLastSessionSummary();

    const getRoute = (id, type, lineage = {}) => {
      if (type === 'Artifact' && lineage.path && lineage.module && lineage.lesson) {
        return `#/learning/${lineage.path.id}/module/${lineage.module.id}/lesson/${lineage.lesson.id}/artifact/${id}`;
      }
      if (type === 'Lesson' && lineage.path && lineage.module) {
        return `#/learning/${lineage.path.id}/module/${lineage.module.id}/lesson/${id}`;
      }
      if (type === 'Module' && lineage.path) {
        return `#/learning/${lineage.path.id}/module/${id}`;
      }
      if (type === 'Learning Path') {
        return `#/learning/${id}`;
      }
      return '#/learning';
    };

    // 1. Session Summary Banner
    let sessionSummaryHtml = '';
    if (lastSession) {
      const formattedTime = formatSecondsToTimer(lastSession.durationSeconds);
      sessionSummaryHtml = `
        <article class="nv-card nv-card--primary" style="border-color: var(--sys-color-accent-primary);">
          <header class="nv-card__header" style="justify-content: space-between;">
            <h3 class="nv-card__title" style="color: var(--sys-color-accent-primary);">Last Session</h3>
            <button id="dismiss-summary-btn" class="nv-button" data-variant="ghost" style="padding: 2px 6px; min-block-size: unset;">Dismiss</button>
          </header>
          <div class="nv-card__body">
            <p class="nv-muted" style="font-size: var(--sys-font-caption-size); margin: 0;">
              Ended at ${new Date(lastSession.endTime).toLocaleTimeString()}
            </p>
            <div class="nv-summary-stat-grid" style="margin-block-start: var(--sys-space-stack-sm);">
              <div class="nv-summary-stat-card">
                <div class="nv-summary-stat-value">${formattedTime}</div>
                <div class="nv-summary-stat-label">Duration</div>
              </div>
              <div class="nv-summary-stat-card">
                <div class="nv-summary-stat-value">${lastSession.visitedCount}</div>
                <div class="nv-summary-stat-label">Visited</div>
              </div>
              <div class="nv-summary-stat-card">
                <div class="nv-summary-stat-value">${lastSession.notesCount}</div>
                <div class="nv-summary-stat-label">Notes</div>
              </div>
              <div class="nv-summary-stat-card">
                <div class="nv-summary-stat-value">${lastSession.completedCount}</div>
                <div class="nv-summary-stat-label">Completed</div>
              </div>
            </div>
          </div>
        </article>
      `;
    }

    // 2. Active Session Card & Goals
    let sessionControlsHtml = '';
    const goalProgressPct = Math.min(100, Math.round((goals.completedMinutesToday / goals.goalMinutes) * 100));

    if (activeSession) {
      sessionControlsHtml = `
        <article class="nv-card nv-card--primary nv-card--session-active">
          <header class="nv-card__header">
            <h3 class="nv-card__title">Current Session</h3>
          </header>
          <div class="nv-card__body">
            <div class="nv-cluster" style="justify-content: space-between; align-items: center;">
              <div class="nv-cluster" style="gap: var(--sys-space-inline-sm); align-items: center;">
                <span class="nv-session-timer" id="dashboard-session-timer">00:00</span>
                <span class="nv-workspace-session-status">${activeSession.paused ? 'Paused' : 'Running'}</span>
              </div>
              <div class="nv-cluster nv-cluster--gap-xs">
                <button class="nv-button" id="dashboard-session-pause-btn" data-variant="secondary">${activeSession.paused ? 'Resume' : 'Pause'}</button>
                <button class="nv-button nv-button--primary" id="dashboard-session-end-btn">End Session</button>
              </div>
            </div>

            <div class="nv-goal-widget" style="margin-block-start: var(--sys-space-stack-sm);">
              <div class="nv-cluster" style="justify-content: space-between; font-size: var(--sys-font-caption-size);">
                <span>Daily Goal</span>
                <strong>${goals.completedMinutesToday} / ${goals.goalMinutes} min</strong>
              </div>
              <div class="nv-goal-progress-bar">
                <div class="nv-goal-progress-fill" style="width: ${goalProgressPct}%;"></div>
              </div>
            </div>
          </div>
        </article>
      `;
    } else {
      sessionControlsHtml = `
        <article class="nv-card nv-card--primary">
          <header class="nv-card__header">
            <h3 class="nv-card__title">Start Study Session</h3>
          </header>
          <div class="nv-card__body">
            <div class="nv-workspace-session-launcher">
              <div class="nv-cluster" style="align-items: center; gap: var(--sys-space-inline-md);">
                <div class="nv-workspace-session-launcher__goal">
                  <label class="nv-workspace-session-launcher__label" for="session-goal-select">Goal</label>
                  <select class="nv-input nv-workspace-session-launcher__select" id="session-goal-select">
                    <option value="15">15 minutes</option>
                    <option value="30" selected>30 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="custom">Custom...</option>
                  </select>
                  <input type="number" class="nv-input nv-workspace-session-launcher__custom" id="session-goal-custom" placeholder="min" aria-label="Custom goal minutes" min="1" value="45" hidden />
                </div>
                <button class="nv-button nv-button--primary nv-workspace-session-launcher__cta" id="dashboard-session-start-btn">Start Session</button>
              </div>
            </div>

            <div class="nv-goal-widget" style="margin-block-start: var(--sys-space-stack-sm);">
              <div class="nv-cluster" style="justify-content: space-between; font-size: var(--sys-font-caption-size);">
                <span>Daily Goal</span>
                <strong>${goals.completedMinutesToday} / ${goals.goalMinutes} min</strong>
              </div>
              <div class="nv-goal-progress-bar">
                <div class="nv-goal-progress-fill" style="width: ${goalProgressPct}%;"></div>
              </div>
              <div class="nv-cluster" style="justify-content: flex-end; align-items: center; margin-block-start: var(--sys-space-stack-xs);">
                <button class="nv-button" id="reset-goal-btn" data-variant="ghost">Reset Progress</button>
              </div>
            </div>
          </div>
        </article>
      `;
    }

    // 3. Study Queue Panel
    let queueHtml = '';
    if (queue.length === 0) {
      queueHtml = `<p class="nv-workspace-empty-state">Your study queue is empty. Add items from learning paths.</p>`;
    } else {
      queueHtml = `
        <div class="nv-stack nv-stack--gap-xs">
          <ul class="nv-queue-list">
            ${queue.map((item, index) => {
              const startNextBtn = index === 0 ? `<button class="nv-button nv-button--primary nv-queue-start-btn" data-id="${item.id}" data-route="${item.route}" style="padding: 2px 6px; font-size: 0.65rem; min-block-size: unset;">Start</button>` : '';
              return `
                <li class="nv-queue-item">
                  <div class="nv-queue-item__details">
                    <a href="${item.route}" class="nv-queue-item__title">${item.title}</a>
                    <span class="nv-queue-item__meta">${item.type}</span>
                  </div>
                  <div class="nv-cluster nv-cluster--gap-xs">
                    ${startNextBtn}
                    <div class="nv-queue-item__controls">
                      <button class="nv-button nv-button--icon-only nv-queue-up-btn" data-id="${item.id}" style="padding: 2px 6px;" title="Move Up">↑</button>
                      <button class="nv-button nv-button--icon-only nv-queue-down-btn" data-id="${item.id}" style="padding: 2px 6px;" title="Move Down">↓</button>
                      <button class="nv-button nv-button--icon-only nv-queue-remove-btn" data-id="${item.id}" style="padding: 2px 6px;" title="Remove">×</button>
                    </div>
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
          <div class="nv-cluster" style="justify-content: flex-end;">
            <button id="clear-queue-btn" class="nv-button" data-variant="ghost">Clear Queue</button>
          </div>
        </div>
      `;
    }

    // 4. Favorites Panel (Categorized & Sorted)
    let favoritesHtml = '';
    if (favorites.length === 0) {
      favoritesHtml = `<p class="nv-workspace-empty-state">Your saved references will appear here. Star items to collect them.</p>`;
    } else {
      const activeSort = localStorage.getItem('nv_favorites_sort') || 'alphabetical';
      let sortedFavorites = [...favorites];

      if (activeSort === 'alphabetical') {
        sortedFavorites.sort((a, b) => a.title.localeCompare(b.title));
      } else if (activeSort === 'alphabetical-desc') {
        sortedFavorites.sort((a, b) => b.title.localeCompare(a.title));
      } else {
        sortedFavorites.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }

      // Group by type
      const groups = {
        'Learning Path': [],
        'Module': [],
        'Lesson': [],
        'Artifact': []
      };

      sortedFavorites.forEach(f => {
        if (groups[f.type]) {
          groups[f.type].push(f);
        } else {
          groups['Artifact'].push(f);
        }
      });

      favoritesHtml = `
        <div class="nv-stack nv-stack--gap-xs">
          <div class="nv-cluster" style="justify-content: space-between; align-items: center; margin-block-end: var(--sys-space-stack-sm);">
            <label for="fav-sort-select" style="font-size: var(--sys-font-caption-size); font-weight: var(--ref-font-weight-medium); color: var(--sys-color-text-secondary);">Sort:</label>
            <select class="nv-input" id="fav-sort-select" style="padding: 2px 6px; font-size: 0.7rem; width: auto;">
              <option value="alphabetical" ${activeSort === 'alphabetical' ? 'selected' : ''}>A-Z</option>
              <option value="alphabetical-desc" ${activeSort === 'alphabetical-desc' ? 'selected' : ''}>Z-A</option>
              <option value="newest" ${activeSort === 'newest' ? 'selected' : ''}>Newest</option>
            </select>
          </div>

          ${Object.keys(groups).map(type => {
            const list = groups[type];
            if (list.length === 0) return '';
            return `
              <div class="nv-stack nv-stack--gap-xs">
                <h4 style="margin: 0; font-size: var(--ref-font-size-200); color: var(--sys-color-accent-primary); text-transform: uppercase; letter-spacing: var(--ref-font-tracking-wide);">${type}s</h4>
                <ul class="nv-dashboard-list">
                  ${list.map(f => `
                    <li class="nv-dashboard-list-item">
                      <a href="${f.route}" class="nv-dashboard-list-item__title" style="min-inline-size: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${f.title}</a>
                      <button class="nv-button nv-button--icon-only nv-fav-toggle-btn" data-id="${f.id}" style="padding: 2px 6px;">×</button>
                    </li>
                  `).join('')}
                </ul>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // 5. Enhanced Chronological Reading History with Filter
    let historyHtml = '';
    const activeFilter = localStorage.getItem('nv_history_filter') || 'All';
    let filteredHistory = recentlyVisited;
    if (activeFilter !== 'All') {
      filteredHistory = recentlyVisited.filter(h => h.type === activeFilter);
    }

    if (filteredHistory.length === 0) {
      historyHtml = `<p class="nv-workspace-empty-state">Your exploration history will appear here.</p>`;
    } else {
      historyHtml = `
        <div class="nv-stack nv-stack--gap-xs">
          <div class="nv-cluster" style="gap: 4px; margin-block-end: var(--sys-space-stack-sm);">
            ${['All', 'Learning Path', 'Module', 'Lesson', 'Artifact'].map(f => {
              const active = activeFilter === f ? 'data-variant="primary"' : 'data-variant="ghost"';
              return `<button class="nv-button nv-history-filter-btn" data-filter="${f}" ${active} style="padding: 2px 6px; font-size: 0.65rem; min-block-size: unset;">${f}s</button>`;
            }).join('')}
          </div>

          <ul class="nv-dashboard-list">
            ${filteredHistory.map(h => {
              const href = getRoute(h.id, h.type, h.lineage);
              const badgeVariant = h.canonicalStatus === 'Reviewed' ? 'success' : 'neutral';
              const formattedDate = new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
              const revisits = h.revisitCount > 1 ? ` <span class="nv-badge" data-variant="info" style="font-size: 0.55rem; padding: 1px 3px;">×${h.revisitCount}</span>` : '';
              return `
                <li class="nv-dashboard-list-item">
                  <div class="nv-stack nv-stack--gap-xs" style="min-inline-size: 0;">
                    <a href="${href}" class="nv-dashboard-list-item__title">${h.title}${revisits}</a>
                    <span class="nv-muted" style="font-size: 0.65rem;">
                      ${formattedDate} — ${h.type}
                    </span>
                  </div>
                  <span class="nv-badge" data-variant="${badgeVariant}">${h.canonicalStatus}</span>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      `;
    }

    // Continue Reading Slots
    let continueReadingHtml = '';
    if (!continueReading) {
      continueReadingHtml = `
        <article class="nv-card nv-card--secondary">
          <header class="nv-card__header">
            <h3 class="nv-card__title">Continue Reading</h3>
          </header>
          <div class="nv-card__body">
            <p class="nv-workspace-empty-state">Your reading progress will resume here. <a href="#/learning">Start learning</a></p>
          </div>
        </article>
      `;
    } else {
      let targetItem = null;
      let resumeHref = '#/learning';
      if (continueReading.artifact) {
        targetItem = continueReading.artifact;
        resumeHref = `#/learning/${continueReading.path.id}/module/${continueReading.module.id}/lesson/${continueReading.lesson.id}/artifact/${continueReading.artifact.id}`;
      } else if (continueReading.lesson) {
        targetItem = continueReading.lesson;
        resumeHref = `#/learning/${continueReading.path.id}/module/${continueReading.module.id}/lesson/${continueReading.lesson.id}`;
      } else if (continueReading.module) {
        targetItem = continueReading.module;
        resumeHref = `#/learning/${continueReading.path.id}/module/${continueReading.module.id}`;
      } else if (continueReading.path) {
        targetItem = continueReading.path;
        resumeHref = `#/learning/${continueReading.path.id}`;
      }

      if (targetItem) {
        const timeDiff = new Date() - new Date(continueReading.timestamp);
        const mins = Math.floor(timeDiff / 60000);
        let timeLabel = 'just now';
        if (mins > 0 && mins < 60) timeLabel = `${mins}m ago`;
        else if (mins >= 60) timeLabel = `${Math.floor(mins / 60)}h ago`;

      continueReadingHtml = `
        <article class="nv-card nv-card--secondary nv-continue-reading-banner" style="background: transparent; border: none; box-shadow: none; padding-block: var(--ref-space-300); opacity: 0.88;">
          <div class="nv-continue-reading-banner__content">
            <span class="nv-page-section__eyebrow" style="font-size: var(--ref-font-size-100);">Continue Reading</span>
            <h3 class="nv-continue-reading-banner__title" style="font-size: 0.9375rem;">${targetItem.title}</h3>
            <span class="nv-muted" style="font-size: var(--sys-font-caption-size); opacity: 0.6;">Last opened ${timeLabel}</span>
          </div>
          <a href="${resumeHref}" class="nv-button" data-variant="primary">Resume</a>
        </article>
      `;
      }
    }

    let bookmarksHtml = '';
    if (bookmarks.length === 0) {
      bookmarksHtml = `<p class="nv-workspace-empty-state">Bookmarks created while studying will appear here.</p>`;
    } else {
      bookmarksHtml = `
        <ul class="nv-dashboard-list">
          ${bookmarks.map(b => {
            const href = getRoute(b.id, b.type, b.lineage);
            return `
              <li class="nv-dashboard-list-item">
                <div class="nv-stack nv-stack--gap-xs" style="min-inline-size: 0;">
                  <a href="${href}" class="nv-dashboard-list-item__title">${b.title}</a>
                  <span class="nv-muted" style="font-size: 0.65rem;">${b.type}</span>
                </div>
                <button class="nv-button nv-button--icon-only nv-bookmark-delete-btn" data-id="${b.id}" style="padding: 2px 6px;">×</button>
              </li>
            `;
          }).join('')}
        </ul>
      `;
    }

    let collectionsHtml = '';
    if (collections.length === 0) {
      collectionsHtml = `<p class="nv-workspace-empty-state">Organize resources into collections as you explore.</p>`;
    } else {
      collectionsHtml = `
        <div class="nv-stack nv-stack--gap-xs">
          ${collections.map(c => `
            <div class="nv-dashboard-collection-card nv-stack nv-stack--gap-xs">
              <div class="nv-cluster" style="justify-content: space-between; width: 100%;">
                <h4 style="margin: 0; font-size: var(--sys-font-body-size); font-weight: var(--ref-font-weight-semibold);">${c.name}</h4>
                <button class="nv-button nv-button--icon-only nv-collection-delete-btn" data-name="${c.name}" style="padding: 2px 6px;">×</button>
              </div>
              <ul class="nv-stack nv-stack--gap-xs" style="margin: 0; padding-inline-start: var(--ref-space-300); font-size: var(--sys-font-caption-size);">
                ${c.resources.length === 0 ? '<li class="nv-muted">Empty</li>' : c.resources.map(r => `
                  <li><a href="${getRoute(r.id, r.type)}" class="nv-muted-link">${r.title}</a></li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      `;
    }

    let notesHtml = '';
    const notesKeys = Object.keys(notes);
    if (notesKeys.length === 0) {
      notesHtml = `<p class="nv-workspace-empty-state">Your notes and thoughts will be collected here.</p>`;
    } else {
      notesHtml = `
        <div class="nv-stack nv-stack--gap-xs">
          ${notesKeys.map(key => {
            const note = notes[key];
            const details = getResourceDetails(key, index);
            const href = details ? getRoute(key, details.type, details.lineage) : '#/learning';
            return `
              <div class="nv-dashboard-collection-card nv-stack nv-stack--gap-xs">
                <div class="nv-cluster" style="justify-content: space-between; width: 100%;">
                  <a href="${href}" style="font-weight: var(--ref-font-weight-semibold); text-decoration: none; color: var(--sys-color-text-primary);">${note.title || 'Untitled note'}</a>
                  <span class="nv-badge" data-variant="info">${note.type}</span>
                </div>
                <p class="nv-muted" style="margin: 0; font-size: var(--sys-font-caption-size); white-space: pre-wrap; overflow: hidden; text-overflow: ellipsis; max-block-size: 3em;">${note.text}</p>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    let highlightsHtml = '';
    if (highlights.length === 0) {
      highlightsHtml = `<p class="nv-workspace-empty-state">Marked passages from your reading will appear here.</p>`;
    } else {
      highlightsHtml = `
        <ul class="nv-dashboard-list">
          ${highlights.map(h => {
            const details = getResourceDetails(h.resourceId, index);
            const href = details ? getRoute(h.resourceId, details.type, details.lineage) : '#/learning';
            return `
              <li class="nv-dashboard-list-item">
                <a href="${href}" class="nv-dashboard-list-item__title" style="min-inline-size: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${details?.title || 'Resource'}</a>
                <span class="nv-highlight-badge--${h.color}">${h.color}</span>
              </li>
            `;
          }).join('')}
        </ul>
      `;
    }

    container.innerHTML = `
      <div class="nv-workspace-dashboard">
        <header class="nv-page-section__header nv-workspace-header">
          <p class="nv-page-section__eyebrow">Workspace</p>
        </header>

        <div id="session-summary-banner-container">
          ${sessionSummaryHtml}
        </div>

        <!-- ═══════════════════════════════════════════════════
             SECTION 1 — WORKSPACE
             Review Dashboard (protagonist) + Current Session
             ═══════════════════════════════════════════════════ -->
        <section class="nv-workspace-section" aria-label="Workspace">
          <h2 class="nv-workspace-section__title">Workspace</h2>

          <div class="nv-workspace-section__grid">
            <article class="nv-card nv-review-dashboard nv-card--primary" data-review-dashboard aria-label="Today's Reviews" data-review-launch>
              <header class="nv-card__header">
                <h3 class="nv-card__title">Today's Reviews</h3>
              </header>
              <div class="nv-card__body">
                <dl class="nv-review-dashboard__metrics nv-review-dashboard__metrics--hero" aria-label="Review summary">
                  <div class="nv-review-dashboard__metric">
                    <dt>Due Today</dt>
                    <dd data-review-dashboard-due-today>0</dd>
                  </div>
                  <div class="nv-review-dashboard__metric">
                    <dt>Overdue</dt>
                    <dd data-review-dashboard-overdue>0</dd>
                  </div>
                  <div class="nv-review-dashboard__metric">
                    <dt>Completed</dt>
                    <dd data-review-dashboard-reviewed-today>0</dd>
                  </div>
                </dl>
                <div class="nv-review-dashboard__next">
                  <h4 class="nv-review-dashboard__next-title">Next scheduled review</h4>
                  <p>
                    <strong data-review-dashboard-next-item>Nothing scheduled</strong>
                    <span class="nv-muted" data-review-dashboard-next-time>—</span>
                  </p>
                </div>
                <div class="nv-review-dashboard__upcoming">
                  <h4 class="nv-review-dashboard__upcoming-title">Upcoming</h4>
                  <ul data-review-dashboard-upcoming aria-label="Upcoming reviews"></ul>
                </div>
                <div class="nv-review-dashboard__due-list" data-review-due-list-section>
                  <h4 class="nv-review-dashboard__due-list-title">Artifacts due for review</h4>
                  <div data-review-due-list-mount></div>
                </div>
                <div class="nv-review-dashboard__actions">
                  <button type="button" class="nv-button" data-variant="primary" data-review-dashboard-start aria-label="Start review session">Start Review</button>
                  <button type="button" class="nv-button" data-variant="secondary" data-review-dashboard-continue aria-label="Continue review session">Continue</button>
                </div>
                <p class="nv-review-dashboard__empty" data-review-dashboard-empty hidden>All caught up.</p>
              </div>
            </article>

            <div class="nv-stack nv-stack--gap-md">
              <div id="session-controls-container">
                ${sessionControlsHtml}
              </div>

              <div id="continue-reading-container">
                ${continueReadingHtml}
              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════
             SECTION 2 — PERSONAL KNOWLEDGE
             Bookmarks, Pinned Memories, Notes, Highlights, Collections
             ═══════════════════════════════════════════════════ -->
        <section class="nv-workspace-section" aria-label="Personal Knowledge">
          <h2 class="nv-workspace-section__title">Personal Knowledge</h2>

          <div class="nv-workspace-section__grid nv-workspace-section__grid--three">
            <article class="nv-card nv-card--secondary">
              <header class="nv-card__header">
                <h3 class="nv-card__title">Bookmarks</h3>
              </header>
              <div class="nv-card__body">
                ${bookmarksHtml}
              </div>
            </article>

            <article class="nv-card nv-card--secondary" data-pinned-memories-card aria-label="Pinned Memories">
              <header class="nv-card__header">
                <h3 class="nv-card__title">Pinned Memories</h3>
              </header>
              <div class="nv-card__body" data-pinned-memories-mount>
                <p class="nv-workspace-empty-state">Your pinned memories will appear here. <a href="#/memory">Create one</a></p>
              </div>
            </article>

            <article class="nv-card nv-card--secondary">
              <header class="nv-card__header">
                <h3 class="nv-card__title">Notes</h3>
              </header>
              <div class="nv-card__body">
                ${notesHtml}
              </div>
            </article>

            <article class="nv-card nv-card--secondary">
              <header class="nv-card__header">
                <h3 class="nv-card__title">Highlights</h3>
              </header>
              <div class="nv-card__body">
                ${highlightsHtml}
              </div>
            </article>

            <article class="nv-card nv-card--secondary">
              <header class="nv-card__header">
                <h3 class="nv-card__title">Collections</h3>
              </header>
              <div class="nv-card__body">
                <div class="nv-cluster nv-cluster--gap-xs" style="margin-block-end: var(--sys-space-stack-sm);">
                  <input id="dashboard-col-input" class="nv-input" placeholder="Create collection name..." aria-label="Collection name" />
                  <button id="dashboard-col-btn" class="nv-button" data-variant="primary">Create</button>
                </div>
                ${collectionsHtml}
              </div>
            </article>

            <article class="nv-card nv-card--passive">
              <header class="nv-card__header">
                <h3 class="nv-card__title">Study Queue</h3>
              </header>
              <div class="nv-card__body">
                ${queueHtml}
              </div>
            </article>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════
             SECTION 3 — DISCOVERY
             Semantic Suggestions, Visualizations, History
             ═══════════════════════════════════════════════════ -->
        <section class="nv-workspace-section" aria-label="Discovery">
          <h2 class="nv-workspace-section__title">Discovery</h2>

          <div class="nv-workspace-section__grid nv-workspace-section__grid--three">
            <article class="nv-card nv-card--secondary nv-card--wide" data-semantic-suggestions-card aria-label="Semantic Suggestions">
              <header class="nv-card__header">
                <h3 class="nv-card__title">Semantic Suggestions</h3>
              </header>
              <div class="nv-card__body" data-semantic-suggestions-mount>
                <p class="nv-workspace-empty-state">Semantic connections will emerge as you explore.</p>
              </div>
            </article>

            <article class="nv-card nv-card--secondary" data-recent-viz-card aria-label="Recent Visualizations">
              <header class="nv-card__header">
                <h3 class="nv-card__title">Recent Visualizations</h3>
              </header>
              <div class="nv-card__body" data-recent-viz-mount>
                <p class="nv-workspace-empty-state">Embeddings, attention maps, and decision boundaries will appear here. <a href="#/visualizations">Browse</a></p>
              </div>
            </article>

            <article class="nv-card nv-card--secondary" data-pinned-viz-card aria-label="Pinned Visualizations">
              <header class="nv-card__header">
                <h3 class="nv-card__title">Pinned Visualizations</h3>
              </header>
              <div class="nv-card__body" data-pinned-viz-mount>
                <p class="nv-workspace-empty-state">Your saved parametric visualizations will be collected here. <a href="#/visualizations">Explore</a></p>
              </div>
            </article>

            <article class="nv-card nv-card--secondary" data-recent-labs-card aria-label="Recent Laboratories">
              <header class="nv-card__header">
                <h3 class="nv-card__title">Recent Laboratories</h3>
              </header>
              <div class="nv-card__body" data-recent-labs-mount>
                <p class="nv-workspace-empty-state">Your recent laboratories will appear here. <a href="#/laboratory">Browse laboratories</a></p>
              </div>
            </article>

            <article class="nv-card nv-card--secondary">
              <header class="nv-card__header">
                <h3 class="nv-card__title">History</h3>
              </header>
              <div class="nv-card__body">
                <div class="nv-cluster" style="justify-content: space-between; margin-block-end: var(--sys-space-stack-sm);">
                  <span class="nv-workspace-section__subtitle">Chronological Exploration Log</span>
                  <button id="clear-history-btn" class="nv-button" data-variant="ghost">Clear</button>
                </div>
                ${historyHtml}
              </div>
            </article>

            <article class="nv-card nv-card--passive">
              <header class="nv-card__header">
                <h3 class="nv-card__title">Quick Filters</h3>
              </header>
              <div class="nv-card__body">
                <p class="nv-workspace-empty-state">Use <kbd class="nv-search-kbd">Ctrl+K</kbd> to search bookmarks and resources.</p>
              </div>
            </article>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════
             STATS STRIP
             ═══════════════════════════════════════════════════ -->
        <div class="nv-workspace-stats-strip">
          <dl class="nv-workspace-stats-strip__list">
            <div class="nv-workspace-stats-strip__item">
              <dt>Favorites</dt>
              <dd>${favorites.length}</dd>
            </div>
            <div class="nv-workspace-stats-strip__item">
              <dt>Bookmarks</dt>
              <dd>${stats.bookmarksCount}</dd>
            </div>
            <div class="nv-workspace-stats-strip__item">
              <dt>Notes</dt>
              <dd>${stats.notesCount}</dd>
            </div>
            <div class="nv-workspace-stats-strip__item">
              <dt>Highlights</dt>
              <dd>${stats.highlightsCount}</dd>
            </div>
            <div class="nv-workspace-stats-strip__item">
              <dt>Collections</dt>
              <dd>${stats.collectionsCount}</dd>
            </div>
            <div class="nv-workspace-stats-strip__item">
              <dt>Queue</dt>
              <dd>${queue.length}</dd>
            </div>
          </dl>
        </div>
      </div>
    `;

    // Dismiss Summary Button
    const dismissSummaryBtn = container.querySelector('#dismiss-summary-btn');
    if (dismissSummaryBtn) {
      dismissSummaryBtn.addEventListener('click', () => {
        service.clearLastSessionSummary();
        renderWorkspaceDashboard().catch(console.error);
      });
    }

    // Session Timer Update in Dashboard (if active)
    let dashboardTimerInterval = null;
    const startDashboardTimerTicker = () => {
      const timerDisplay = container.querySelector('#dashboard-session-timer');
      if (!timerDisplay) return;

      const updateTimer = () => {
        const session = service.getActiveSession();
        if (!session) {
          clearInterval(dashboardTimerInterval);
          return;
        }
        let elapsed = session.accumulatedTime;
        if (!session.paused) {
          elapsed += Math.floor((new Date() - new Date(session.lastUpdated)) / 1000);
        }
        timerDisplay.textContent = formatSecondsToTimer(elapsed);
      };

      updateTimer();
      dashboardTimerInterval = setInterval(updateTimer, 1000);
    };

    // Pause/Resume Session
    const dPauseBtn = container.querySelector('#dashboard-session-pause-btn');
    if (dPauseBtn) {
      dPauseBtn.addEventListener('click', () => {
        const session = service.getActiveSession();
        if (session) {
          if (session.paused) {
            service.resumeSession();
          } else {
            service.pauseSession();
          }
          renderWorkspaceDashboard().catch(console.error);
        }
      });
    }

    // End Session
    const dEndBtn = container.querySelector('#dashboard-session-end-btn');
    if (dEndBtn) {
      dEndBtn.addEventListener('click', () => {
        const summary = service.endSession();
        if (summary) {
          showSessionSummaryModal(summary);
        }
      });
    }

    // Start Session Goal select toggle
    const goalSelect = container.querySelector('#session-goal-select');
    const customGoalInput = container.querySelector('#session-goal-custom');
    if (goalSelect && customGoalInput) {
      goalSelect.addEventListener('change', () => {
        if (goalSelect.value === 'custom') {
          customGoalInput.hidden = false;
        } else {
          customGoalInput.hidden = true;
        }
      });
    }

    // Start Session
    const dStartBtn = container.querySelector('#dashboard-session-start-btn');
    if (dStartBtn) {
      dStartBtn.addEventListener('click', () => {
        let goalVal = goalSelect.value;
        if (goalVal === 'custom') {
          goalVal = customGoalInput.value || 30;
        }
        service.startSession(goalVal);
        service.setGoal(goalVal);
        renderWorkspaceDashboard().catch(console.error);
      });
    }

    // Reset Goal progress
    const dResetGoalBtn = container.querySelector('#reset-goal-btn');
    if (dResetGoalBtn) {
      dResetGoalBtn.addEventListener('click', () => {
        service.resetGoalProgress();
        renderWorkspaceDashboard().catch(console.error);
      });
    }

    // Queue buttons
    container.querySelectorAll('.nv-queue-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        service.removeFromQueue(id);
        renderWorkspaceDashboard().catch(console.error);
      });
    });

    container.querySelectorAll('.nv-queue-up-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        service.moveQueueItem(id, 'up');
        renderWorkspaceDashboard().catch(console.error);
      });
    });

    container.querySelectorAll('.nv-queue-down-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        service.moveQueueItem(id, 'down');
        renderWorkspaceDashboard().catch(console.error);
      });
    });

    container.querySelectorAll('.nv-queue-start-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const route = btn.getAttribute('data-route');
        service.removeFromQueue(id);
        window.location.hash = route;
      });
    });

    const clearQueueBtn = container.querySelector('#clear-queue-btn');
    if (clearQueueBtn) {
      clearQueueBtn.addEventListener('click', () => {
        service.clearQueue();
        renderWorkspaceDashboard().catch(console.error);
      });
    }

    // Favorites sort select
    const favSortSelect = container.querySelector('#fav-sort-select');
    if (favSortSelect) {
      favSortSelect.addEventListener('change', () => {
        localStorage.setItem('nv_favorites_sort', favSortSelect.value);
        renderWorkspaceDashboard().catch(console.error);
      });
    }

    container.querySelectorAll('.nv-fav-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const favItem = favorites.find(f => f.id === id);
        if (favItem) {
          service.toggleFavorite(id, favItem.type, favItem.title, favItem.route);
          renderWorkspaceDashboard().catch(console.error);
        }
      });
    });

    // History filter buttons
    container.querySelectorAll('.nv-history-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        localStorage.setItem('nv_history_filter', filter);
        renderWorkspaceDashboard().catch(console.error);
      });
    });

    const clearHistoryBtn = container.querySelector('#clear-history-btn');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        service.clearRecentlyVisited();
        renderWorkspaceDashboard().catch(console.error);
      });
    }

    const dashboardColInput = container.querySelector('#dashboard-col-input');
    const dashboardColBtn = container.querySelector('#dashboard-col-btn');
    if (dashboardColBtn && dashboardColInput) {
      dashboardColBtn.addEventListener('click', () => {
        const name = dashboardColInput.value.trim();
        if (name) {
          service.createCollection(name);
          dashboardColInput.value = '';
          renderWorkspaceDashboard().catch(console.error);
        }
      });
    }

    container.querySelectorAll('.nv-bookmark-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        service.removeBookmark(id);
        renderWorkspaceDashboard().catch(console.error);
      });
    });

    container.querySelectorAll('.nv-collection-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        service.deleteCollection(name);
        renderWorkspaceDashboard().catch(console.error);
      });
    });

    if (activeSession) {
      startDashboardTimerTicker();
    }
  }

  // --- Track scroll position debounced to update continue reading ---
  let scrollTimeout = null;
  window.addEventListener('scroll', () => {
    const service = window.NeuralVerse.PersonalizationService;
    if (!service) return;
    const cont = service.getContinueReading();
    if (!cont || !cont.artifact) return;

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollRatio = window.scrollY / scrollHeight;
      service.updateContinueReading(cont.path, cont.module, cont.lesson, cont.artifact, scrollRatio);
    }, 500);
  });

  // Start study session ticker on page load/init
  window.addEventListener('load', () => {
    startStudySessionTicker();
  });

  // Bind to Router Events
    window.addEventListener('hashchange', () => {
      trackNavigation();
      const service = window.NeuralVerse.PersonalizationService;
      if (service && service.getActiveSession()) {
        updateSessionTimerUI();
      }
    });

  window.addEventListener('load', trackNavigation);

  window.addEventListener('nv:routerendered', (e) => {
    const routeId = e.detail?.routeId;
    if (routeId === 'workspace') {
      renderWorkspaceDashboard().catch(console.error);
    }
  });

  // Listen to study session custom event triggers
  window.addEventListener('nv:study_session_started', startStudySessionTicker);
  window.addEventListener('nv:study_session_paused', updateSessionTimerUI);
  window.addEventListener('nv:study_session_resumed', startStudySessionTicker);
  window.addEventListener('nv:study_session_ended', () => {
    updateSessionTimerUI();
    const bar = document.getElementById('nv-global-session-bar');
    if (bar) {
      bar.hidden = true;
      document.body.classList.remove('nv-has-active-session');
    }
  });

  // Export globally
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.initPersonalizationExperience = initPersonalizationExperience;
  window.NeuralVerse.renderWorkspaceDashboard = renderWorkspaceDashboard;
  window.NeuralVerse.startStudySessionTicker = startStudySessionTicker;

})();
