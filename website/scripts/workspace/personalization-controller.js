/**
 * NV-900-UI8 — Personalized Learning & Knowledge Workspace
 * Coordinates bookmarking, continue reading, notes, highlights, collections, tags,
 * and renders the Workspace Dashboard on #/workspace.
 */

(function () {
  'use strict';

  let curriculumIndex = null;
  let saveNoteTimeout = null;

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
      // Find lineage
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

  // --- Track Navigation ---
  async function trackNavigation() {
    const hash = window.location.hash || '#/';
    const index = await getIndex();
    if (!index) return;

    let matched = null;
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
        // Update recently visited
        window.NeuralVerse.PersonalizationService.addRecentlyVisited(
          details.id,
          details.type,
          details.title,
          details.lineage,
          details.status
        );

        // Update continue reading
        const lin = details.lineage;
        if (details.type === 'Artifact') {
          window.NeuralVerse.PersonalizationService.updateContinueReading(
            lin.path, lin.module, lin.lesson, { id: details.id, title: details.title }
          );
        } else if (details.type === 'Lesson') {
          window.NeuralVerse.PersonalizationService.updateContinueReading(
            lin.path, lin.module, { id: details.id, title: details.title }, null
          );
        } else if (details.type === 'Module') {
          window.NeuralVerse.PersonalizationService.updateContinueReading(
            lin.path, { id: details.id, title: details.title }, null, null
          );
        } else if (details.type === 'Learning Path') {
          window.NeuralVerse.PersonalizationService.updateContinueReading(
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
      // Lesson overview page bookmark button
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

    // 2. Personal Notes Card
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

    notesTextarea.addEventListener('input', () => {
      notesStatus.textContent = 'Saving...';
      clearTimeout(saveNoteTimeout);
      saveNoteTimeout = setTimeout(() => {
        service.saveNote(resourceId, resourceTitle, resourceType, notesTextarea.value);
        notesStatus.textContent = 'Saved';
      }, 500);
    });

    notesCard.append(notesTitle, notesTextarea, notesStatus);
    metadataCol.append(notesCard);

    // 3. Study Collections Card
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

    // 4. Personal Tags Card
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

    // 5. Paragraph-Level Highlighting
    if (artifactId) {
      const article = mainContent.querySelector('.nv-curriculum-reader');
      if (article) {
        const paragraphs = Array.from(article.querySelectorAll('p, li, blockquote'));
        
        paragraphs.forEach((p, index) => {
          const anchorId = `block-${index}`;
          p.dataset.highlightAnchor = anchorId;

          // Render active highlight if stored
          const activeHighlights = service.getHighlightsForResource(resourceId);
          const activeH = activeHighlights.find(h => h.anchorId === anchorId);
          if (activeH) {
            p.classList.add(`nv-highlight--${activeH.color}`);
          }

          // Enable mouse triggers to show highlighting overlay
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
                // Clear existing
                p.classList.remove('nv-highlight--yellow', 'nv-highlight--green');
                
                if (col === 'clear') {
                  const curr = service.getHighlightsForResource(resourceId).find(h => h.anchorId === anchorId);
                  if (curr) service.toggleHighlight(resourceId, anchorId);
                } else {
                  const curr = service.getHighlightsForResource(resourceId).find(h => h.anchorId === anchorId);
                  if (curr) {
                    if (curr.color !== col) {
                      service.toggleHighlight(resourceId, anchorId); // Toggle off old
                      service.toggleHighlight(resourceId, anchorId, col); // Toggle on new
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

    // Map bookmark & recently visited routes
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

    let continueReadingHtml = `
      <div class="nv-empty-state" style="padding: var(--sys-space-stack-sm);">
        <p class="nv-empty-state__message">No learning session started yet.</p>
        <a href="#/learning" class="nv-button" data-variant="primary">Start Learning</a>
      </div>
    `;

    if (continueReading) {
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
          <div class="nv-continue-reading-banner nv-cluster">
            <div class="nv-continue-reading-banner__content nv-stack nv-stack--gap-xs">
              <span class="nv-curriculum-card__kicker">Continue Reading</span>
              <h3 class="nv-continue-reading-banner__title">${targetItem.title}</h3>
              <span class="nv-muted">Last opened ${timeLabel}</span>
            </div>
            <a href="${resumeHref}" class="nv-button" data-variant="primary">Resume →</a>
          </div>
        `;
      }
    }

    let bookmarksHtml = '';
    if (bookmarks.length === 0) {
      bookmarksHtml = `<p class="nv-muted">No bookmarks added yet.</p>`;
    } else {
      bookmarksHtml = `
        <ul class="nv-dashboard-list nv-stack nv-stack--gap-xs">
          ${bookmarks.map(b => {
            const href = getRoute(b.id, b.type, b.lineage);
            return `
              <li class="nv-dashboard-list-item nv-cluster">
                <div class="nv-stack nv-stack--gap-xs">
                  <a href="${href}" class="nv-dashboard-list-item__title">★ ${b.title}</a>
                  <span class="nv-muted" style="font-size: 0.65rem;">${b.type}</span>
                </div>
                <button class="nv-button nv-button--icon-only nv-bookmark-delete-btn" data-id="${b.id}" style="padding: 2px 6px;">×</button>
              </li>
            `;
          }).join('')}
        </ul>
      `;
    }

    let historyHtml = '';
    if (recentlyVisited.length === 0) {
      historyHtml = `<p class="nv-muted">No history found.</p>`;
    } else {
      historyHtml = `
        <ul class="nv-dashboard-list nv-stack nv-stack--gap-xs">
          ${recentlyVisited.map(h => {
            const href = getRoute(h.id, h.type, h.lineage);
            const badgeVariant = h.canonicalStatus === 'Reviewed' ? 'success' : 'neutral';
            return `
              <li class="nv-dashboard-list-item nv-cluster" style="justify-content: space-between;">
                <div class="nv-stack nv-stack--gap-xs">
                  <a href="${href}" class="nv-dashboard-list-item__title">⏱ ${h.title}</a>
                  <span class="nv-muted" style="font-size: 0.65rem;">
                    ${h.lineage?.path ? `${h.lineage.path.title} → ` : ''}
                    ${h.lineage?.module ? `${h.lineage.module.title} → ` : ''}
                    ${h.type}
                  </span>
                </div>
                <span class="nv-badge" data-variant="${badgeVariant}">${h.canonicalStatus}</span>
              </li>
            `;
          }).join('')}
        </ul>
      `;
    }

    let collectionsHtml = '';
    if (collections.length === 0) {
      collectionsHtml = `<p class="nv-muted">No collections created yet.</p>`;
    } else {
      collectionsHtml = `
        <div class="nv-grid nv-grid--cols-2" style="gap: var(--sys-space-stack-sm);">
          ${collections.map(c => `
            <div class="nv-panel nv-dashboard-collection-card nv-stack nv-stack--gap-sm">
              <div class="nv-cluster" style="justify-content: space-between; width: 100%;">
                <h4 style="margin: 0;">${c.name}</h4>
                <button class="nv-button nv-button--icon-only nv-collection-delete-btn" data-name="${c.name}" style="padding: 2px 6px;">×</button>
              </div>
              <ul class="nv-stack nv-stack--gap-xs" style="margin: 0; padding-left: 12px; font-size: var(--sys-font-caption-size);">
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
      notesHtml = `<p class="nv-muted">No notes created yet.</p>`;
    } else {
      notesHtml = `
        <div class="nv-stack nv-stack--gap-sm">
          ${notesKeys.map(key => {
            const note = notes[key];
            const details = getResourceDetails(key, index);
            const href = details ? getRoute(key, details.type, details.lineage) : '#/learning';
            return `
              <div class="nv-panel nv-stack nv-stack--gap-xs">
                <div class="nv-cluster" style="justify-content: space-between; width: 100%;">
                  <a href="${href}" style="font-weight: var(--ref-font-weight-semibold);">${note.title || 'Untitled note'}</a>
                  <span class="nv-badge" data-variant="info">${note.type}</span>
                </div>
                <p class="nv-muted" style="margin: var(--sys-space-stack-xs) 0; font-size: var(--sys-font-caption-size); white-space: pre-wrap;">${note.text}</p>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    let highlightsHtml = '';
    if (highlights.length === 0) {
      highlightsHtml = `<p class="nv-muted">No highlights added yet.</p>`;
    } else {
      highlightsHtml = `
        <ul class="nv-dashboard-list nv-stack nv-stack--gap-xs">
          ${highlights.map(h => {
            const details = getResourceDetails(h.resourceId, index);
            const href = details ? getRoute(h.resourceId, details.type, details.lineage) : '#/learning';
            return `
              <li class="nv-dashboard-list-item nv-cluster" style="justify-content: space-between;">
                <a href="${href}" class="nv-dashboard-list-item__title">🖍 Highlight in ${details?.title || 'Resource'}</a>
                <span class="nv-badge nv-highlight-badge--${h.color}">${h.color}</span>
              </li>
            `;
          }).join('')}
        </ul>
      `;
    }

    container.innerHTML = `
      <div class="nv-stack nv-stack--gap-md nv-workspace-dashboard">
        <header class="nv-curriculum-hero">
          <span class="nv-badge" data-variant="info">Workspace</span>
          <h1>Personalized Learning & Knowledge Dashboard</h1>
          <p class="nv-muted">Review continue reading slots, bookmarks, tags, highlights, and custom study collections.</p>
        </header>

        <div id="continue-reading-container">
          ${continueReadingHtml}
        </div>

        <div class="nv-grid nv-grid--cols-3" style="align-items: start;">
          <!-- Left Main Column (History, Notes, Collections) -->
          <div class="nv-stack nv-stack--gap-md" style="grid-column: span 2;">
            <div class="nv-panel nv-stack nv-stack--gap-sm">
              <div class="nv-cluster" style="justify-content: space-between; width: 100%;">
                <h3>Recently Visited History</h3>
                <button id="clear-history-btn" class="nv-button" data-variant="secondary">Clear History</button>
              </div>
              ${historyHtml}
            </div>

            <div class="nv-panel nv-stack nv-stack--gap-sm">
              <h3>Study Collections</h3>
              <div class="nv-cluster nv-cluster--gap-xs">
                <input id="dashboard-col-input" class="nv-input" placeholder="Create collection name..." style="flex: 1;" />
                <button id="dashboard-col-btn" class="nv-button" data-variant="primary">Create</button>
              </div>
              ${collectionsHtml}
            </div>

            <div class="nv-panel nv-stack nv-stack--gap-sm">
              <h3>Personal Notes</h3>
              ${notesHtml}
            </div>

            <div class="nv-panel nv-stack nv-stack--gap-sm">
              <h3>Reading Highlights</h3>
              ${highlightsHtml}
            </div>
          </div>

          <!-- Right Sidebar Column (Stats, Bookmarks) -->
          <div class="nv-stack nv-stack--gap-md">
            <div class="nv-panel nv-stack nv-stack--gap-sm">
              <h3>Personal Metrics</h3>
              <dl class="nv-curriculum-stats" style="grid-template-columns: repeat(2, 1fr); gap: var(--sys-space-stack-sm);">
                <div class="nv-curriculum-stat">
                  <dt>Bookmarks</dt>
                  <dd>${stats.bookmarksCount}</dd>
                </div>
                <div class="nv-curriculum-stat">
                  <dt>Notes</dt>
                  <dd>${stats.notesCount}</dd>
                </div>
                <div class="nv-curriculum-stat">
                  <dt>Collections</dt>
                  <dd>${stats.collectionsCount}</dd>
                </div>
                <div class="nv-curriculum-stat">
                  <dt>Highlights</dt>
                  <dd>${stats.highlightsCount}</dd>
                </div>
              </dl>
              <div style="border-top: 1px solid var(--sys-color-border-subtle); padding-top: var(--sys-space-stack-sm); font-size: var(--sys-font-caption-size);">
                <span class="nv-muted">Activity: ${stats.reviewedCount} Reviewed, ${stats.draftCount} Draft resources visited.</span>
              </div>
            </div>

            <div class="nv-panel nv-stack nv-stack--gap-sm">
              <h3>Bookmarks Quick List</h3>
              ${bookmarksHtml}
            </div>

            <div class="nv-panel nv-stack nv-stack--gap-sm">
              <h3>Quick Search Filters</h3>
              <p class="nv-muted" style="font-size: var(--sys-font-caption-size);">Use global search shortcut <kbd class="nv-search-kbd">Ctrl+K</kbd> to access bookmark filters.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Hook listeners
    const clearHistoryBtn = container.querySelector('#clear-history-btn');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        service.clearRecentlyVisited();
        renderWorkspaceDashboard();
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
          renderWorkspaceDashboard();
        }
      });
      dashboardColInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          dashboardColBtn.click();
        }
      });
    }

    container.querySelectorAll('.nv-bookmark-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        service.removeBookmark(id);
        renderWorkspaceDashboard();
      });
    });

    container.querySelectorAll('.nv-collection-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        service.deleteCollection(name);
        renderWorkspaceDashboard();
      });
    });
  }

  // Bind to Router Events
  window.addEventListener('hashchange', trackNavigation);
  window.addEventListener('load', trackNavigation);

  window.addEventListener('nv:routerendered', (e) => {
    const routeId = e.detail?.routeId;
    if (routeId === 'workspace') {
      renderWorkspaceDashboard().catch(console.error);
    }
  });

  // Export globally
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.initPersonalizationExperience = initPersonalizationExperience;
  window.NeuralVerse.renderWorkspaceDashboard = renderWorkspaceDashboard;

})();
