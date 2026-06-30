/**
 * NeuralVerse Memory UI Controller
 * Full UI controller for the memory system.
 * Dark theme, cyan accents, elegant cards, restrained animation.
 * Self-contained IIFE. No eval, no Function, no external requests.
 */
(function () {
  'use strict';

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  function getRegistry() {
    return window.NeuralVerse?.MemoryRegistry || null;
  }

  function getStorage() {
    return window.NeuralVerse?.MemoryStorage || null;
  }

  function getCollections() {
    return window.NeuralVerse?.MemoryCollections || null;
  }

  function getRetrieval() {
    return window.NeuralVerse?.MemoryRetrieval || null;
  }

  function getIndexer() {
    return window.NeuralVerse?.MemoryIndexer || null;
  }

  function getSession() {
    return window.NeuralVerse?.SessionContinuity || null;
  }

  function dispatch(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      var h = String(d.getHours()).padStart(2, '0');
      var min = String(d.getMinutes()).padStart(2, '0');
      return y + '-' + m + '-' + day + ' ' + h + ':' + min;
    } catch (e) {
      return iso;
    }
  }

  function typeLabel(type) {
    var labels = {
      note: 'Note',
      bookmark: 'Bookmark',
      highlight: 'Highlight',
      collection: 'Collection',
      workspace: 'Workspace',
      laboratory: 'Laboratory',
      review: 'Review',
      search: 'Search',
      custom: 'Custom'
    };
    return labels[type] || type;
  }

  function createMemoryUIController(options) {
    var root = (options && options.root) || document;
    var container = null;
    var _listeners = [];

    function addEvent(el, event, handler) {
      if (!el) return;
      el.addEventListener(event, handler);
      _listeners.push({ el: el, event: event, handler: handler });
    }

    function clearListeners() {
      for (var i = 0; i < _listeners.length; i++) {
        _listeners[i].el.removeEventListener(_listeners[i].event, _listeners[i].handler);
      }
      _listeners = [];
    }

    function renderMemoryDashboard(containerEl) {
      container = containerEl;
      if (!container) return;
      var retrieval = getRetrieval();
      var collectionsMod = getCollections();

      var pinnedItems = retrieval && typeof retrieval.getPinned === 'function' ? retrieval.getPinned() : [];
      var recentItems = retrieval && typeof retrieval.getRecent === 'function' ? retrieval.getRecent(8) : [];
      var stats = retrieval && typeof retrieval.getStats === 'function' ? retrieval.getStats() : { total: 0, byType: {}, pinned: 0, archived: 0 };
      var allCollections = collectionsMod && typeof collectionsMod.getAll === 'function' ? collectionsMod.getAll() : [];

      var html = '<div class="nv-memory-dashboard" role="main" aria-label="Memory Dashboard">';
      html += '<div class="nv-memory-dashboard-header">';
      html += '<h1 class="nv-memory-title">Memory System</h1>';
      html += '<div class="nv-memory-actions">';
      html += '<button class="nv-memory-btn nv-memory-btn-primary" data-action="create" aria-label="Create new memory">+ New Memory</button>';
      html += '<button class="nv-memory-btn nv-memory-btn-secondary" data-action="import" aria-label="Import memory data">Import</button>';
      html += '<button class="nv-memory-btn nv-memory-btn-secondary" data-action="export" aria-label="Export memory data">Export</button>';
      html += '</div>';
      html += '</div>';

      html += '<div class="nv-memory-stats" role="region" aria-label="Memory statistics">';
      html += '<div class="nv-memory-stat-card"><span class="nv-memory-stat-value">' + stats.total + '</span><span class="nv-memory-stat-label">Total</span></div>';
      html += '<div class="nv-memory-stat-card"><span class="nv-memory-stat-value">' + stats.pinned + '</span><span class="nv-memory-stat-label">Pinned</span></div>';
      html += '<div class="nv-memory-stat-card"><span class="nv-memory-stat-value">' + stats.archived + '</span><span class="nv-memory-stat-label">Archived</span></div>';
      var typeKeys = Object.keys(stats.byType);
      for (var t = 0; t < typeKeys.length; t++) {
        html += '<div class="nv-memory-stat-card"><span class="nv-memory-stat-value">' + stats.byType[typeKeys[t]] + '</span><span class="nv-memory-stat-label">' + escapeHtml(typeLabel(typeKeys[t])) + '</span></div>';
      }
      html += '</div>';

      html += '<div class="nv-memory-section">';
      html += '<div class="nv-memory-section-header"><h2 class="nv-memory-section-title">Pinned</h2></div>';
      if (pinnedItems.length === 0) {
        html += '<div class="nv-memory-empty">No pinned memories.</div>';
      } else {
        html += '<div class="nv-memory-card-grid" role="list" aria-label="Pinned memories">';
        for (var p = 0; p < pinnedItems.length; p++) {
          html += renderMemoryCard(pinnedItems[p]);
        }
        html += '</div>';
      }
      html += '</div>';

      html += '<div class="nv-memory-section">';
      html += '<div class="nv-memory-section-header"><h2 class="nv-memory-section-title">Recent</h2></div>';
      if (recentItems.length === 0) {
        html += '<div class="nv-memory-empty">No memories yet. Create your first one.</div>';
      } else {
        html += '<div class="nv-memory-card-grid" role="list" aria-label="Recent memories">';
        for (var r = 0; r < recentItems.length; r++) {
          html += renderMemoryCard(recentItems[r]);
        }
        html += '</div>';
      }
      html += '</div>';

      html += '<div class="nv-memory-section">';
      html += '<div class="nv-memory-section-header"><h2 class="nv-memory-section-title">Collections</h2></div>';
      if (allCollections.length === 0) {
        html += '<div class="nv-memory-empty">No collections yet.</div>';
      } else {
        html += '<div class="nv-memory-card-grid" role="list" aria-label="Collections">';
        for (var c = 0; c < allCollections.length; c++) {
          var col = allCollections[c];
          html += '<div class="nv-memory-card nv-memory-collection-card" role="listitem" tabindex="0" data-collection-id="' + escapeAttr(col.id) + '" aria-label="Collection: ' + escapeAttr(col.name || col.title || '') + '">';
          html += '<div class="nv-memory-card-header">';
          html += '<h3 class="nv-memory-card-title">' + escapeHtml(col.name || col.title || 'Untitled') + '</h3>';
          html += '<span class="nv-memory-badge nv-memory-badge-collection">Collection</span>';
          html += '</div>';
          if (col.description) {
            html += '<p class="nv-memory-card-summary">' + escapeHtml(col.description) + '</p>';
          }
          var itemCount = col.items ? col.items.length : (col.itemIds ? col.itemIds.length : 0);
          html += '<div class="nv-memory-card-meta">' + itemCount + ' item(s)</div>';
          html += '</div>';
        }
        html += '</div>';
      }
      html += '</div>';

      html += '<div class="nv-memory-section">';
      html += '<div class="nv-memory-section-header">';
      html += '<h2 class="nv-memory-section-title">All Memories</h2>';
      html += '<div class="nv-memory-filters" role="group" aria-label="Filter memories">';
      html += '<select class="nv-memory-select" data-filter="type" aria-label="Filter by type">';
      html += '<option value="">All Types</option>';
      var validTypes = ['note', 'bookmark', 'highlight', 'collection', 'workspace', 'laboratory', 'review', 'search', 'custom'];
      for (var vt = 0; vt < validTypes.length; vt++) {
        html += '<option value="' + escapeAttr(validTypes[vt]) + '">' + escapeHtml(typeLabel(validTypes[vt])) + '</option>';
      }
      html += '</select>';
      html += '<select class="nv-memory-select" data-filter="sort" aria-label="Sort by">';
      html += '<option value="updatedAt">Last Updated</option>';
      html += '<option value="createdAt">Created</option>';
      html += '<option value="title">Title</option>';
      html += '</select>';
      html += '<label class="nv-memory-checkbox-label"><input type="checkbox" data-filter="pinned" aria-label="Show only pinned"> Pinned</label>';
      html += '<label class="nv-memory-checkbox-label"><input type="checkbox" data-filter="archived" aria-label="Show archived"> Archived</label>';
      html += '</div>';
      html += '</div>';
      html += '<div class="nv-memory-card-grid" role="list" aria-label="All memories" id="nv-memory-all-list">';
      var allItems = retrieval && typeof retrieval.search === 'function' ? retrieval.search('', { limit: 100 }) : { items: [] };
      var items = allItems.items || [];
      for (var a = 0; a < items.length; a++) {
        html += renderMemoryCard(items[a]);
      }
      html += '</div>';
      html += '</div>';

      html += '</div>';

      container.innerHTML = html;
      bindDashboardEvents(container);
    }

    function renderMemoryCard(memory) {
      if (!memory) return '';
      var pinnedClass = memory.pinned ? ' nv-memory-card-pinned' : '';
      var archivedClass = memory.archived ? ' nv-memory-card-archived' : '';
      var html = '<div class="nv-memory-card' + pinnedClass + archivedClass + '" role="listitem" tabindex="0" data-memory-id="' + escapeAttr(memory.id) + '" aria-label="Memory: ' + escapeAttr(memory.title || '') + '">';
      html += '<div class="nv-memory-card-header">';
      html += '<h3 class="nv-memory-card-title">' + escapeHtml(memory.title || 'Untitled') + '</h3>';
      html += '<span class="nv-memory-badge nv-memory-badge-' + escapeAttr(memory.type || 'note') + '">' + escapeHtml(typeLabel(memory.type)) + '</span>';
      if (memory.pinned) {
        html += '<span class="nv-memory-pin-indicator" aria-label="Pinned">\u2605</span>';
      }
      html += '</div>';
      if (memory.summary) {
        html += '<p class="nv-memory-card-summary">' + escapeHtml(memory.summary) + '</p>';
      }
      if (memory.tags && memory.tags.length > 0) {
        html += '<div class="nv-memory-card-tags" aria-label="Tags">';
        for (var i = 0; i < memory.tags.length; i++) {
          html += '<span class="nv-memory-tag">' + escapeHtml(memory.tags[i]) + '</span>';
        }
        html += '</div>';
      }
      html += '<div class="nv-memory-card-meta">';
      html += '<span class="nv-memory-date" title="Last updated">' + formatDate(memory.updatedAt) + '</span>';
      html += '</div>';
      html += '</div>';
      return html;
    }

    function renderMemoryDetail(containerEl, memoryId) {
      container = containerEl;
      if (!container) return;
      var retrieval = getRetrieval();
      var memory = retrieval && typeof retrieval.getMemory === 'function' ? retrieval.getMemory(memoryId) : null;
      if (!memory) {
        container.innerHTML = '<div class="nv-memory-not-found" role="alert">Memory not found.</div>';
        return;
      }

      var collectionsMod = getCollections();
      var allCollections = collectionsMod && typeof collectionsMod.getAll === 'function' ? collectionsMod.getAll() : [];
      var itemCollections = [];
      for (var c = 0; c < allCollections.length; c++) {
        var col = allCollections[c];
        var items = col.items || col.itemIds || [];
        if (items.indexOf(memory.id) !== -1) {
          itemCollections.push(col);
        }
      }

      var html = '<div class="nv-memory-detail" role="article" aria-label="Memory detail: ' + escapeAttr(memory.title) + '">';
      html += '<div class="nv-memory-detail-header">';
      html += '<button class="nv-memory-btn nv-memory-btn-back" data-action="back" aria-label="Back to dashboard">\u2190 Back</button>';
      html += '<div class="nv-memory-detail-actions">';
      html += '<button class="nv-memory-btn nv-memory-btn-secondary" data-action="edit" data-memory-id="' + escapeAttr(memory.id) + '" aria-label="Edit memory">Edit</button>';
      html += '<button class="nv-memory-btn nv-memory-btn-secondary" data-action="pin" data-memory-id="' + escapeAttr(memory.id) + '" aria-label="' + (memory.pinned ? 'Unpin memory' : 'Pin memory') + '">' + (memory.pinned ? 'Unpin' : 'Pin') + '</button>';
      html += '<button class="nv-memory-btn nv-memory-btn-secondary" data-action="archive" data-memory-id="' + escapeAttr(memory.id) + '" aria-label="' + (memory.archived ? 'Unarchive memory' : 'Archive memory') + '">' + (memory.archived ? 'Unarchive' : 'Archive') + '</button>';
      html += '<button class="nv-memory-btn nv-memory-btn-danger" data-action="delete" data-memory-id="' + escapeAttr(memory.id) + '" aria-label="Delete memory">Delete</button>';
      html += '</div>';
      html += '</div>';

      html += '<div class="nv-memory-detail-content">';
      html += '<h1 class="nv-memory-detail-title">' + escapeHtml(memory.title) + '</h1>';
      html += '<div class="nv-memory-detail-meta">';
      html += '<span class="nv-memory-badge nv-memory-badge-' + escapeAttr(memory.type) + '">' + escapeHtml(typeLabel(memory.type)) + '</span>';
      html += '<span class="nv-memory-date">Created: ' + formatDate(memory.createdAt) + '</span>';
      html += '<span class="nv-memory-date">Updated: ' + formatDate(memory.updatedAt) + '</span>';
      html += '</div>';
      if (memory.summary) {
        html += '<div class="nv-memory-detail-section">';
        html += '<h2 class="nv-memory-detail-section-title">Summary</h2>';
        html += '<p class="nv-memory-detail-text">' + escapeHtml(memory.summary) + '</p>';
        html += '</div>';
      }
      if (memory.content) {
        html += '<div class="nv-memory-detail-section">';
        html += '<h2 class="nv-memory-detail-section-title">Content</h2>';
        html += '<div class="nv-memory-detail-content-body">' + escapeHtml(memory.content).replace(/\n/g, '<br>') + '</div>';
        html += '</div>';
      }
      if (memory.tags && memory.tags.length > 0) {
        html += '<div class="nv-memory-detail-section">';
        html += '<h2 class="nv-memory-detail-section-title">Tags</h2>';
        html += '<div class="nv-memory-card-tags">';
        for (var t = 0; t < memory.tags.length; t++) {
          html += '<span class="nv-memory-tag">' + escapeHtml(memory.tags[t]) + '</span>';
        }
        html += '</div>';
        html += '</div>';
      }
      if (memory.relatedConcepts && memory.relatedConcepts.length > 0) {
        html += '<div class="nv-memory-detail-section">';
        html += '<h2 class="nv-memory-detail-section-title">Concepts</h2>';
        html += '<div class="nv-memory-card-tags">';
        for (var k = 0; k < memory.relatedConcepts.length; k++) {
          html += '<span class="nv-memory-tag nv-memory-tag-concept">' + escapeHtml(memory.relatedConcepts[k]) + '</span>';
        }
        html += '</div>';
        html += '</div>';
      }
      if (memory.relatedArtifacts && memory.relatedArtifacts.length > 0) {
        html += '<div class="nv-memory-detail-section">';
        html += '<h2 class="nv-memory-detail-section-title">Artifacts</h2>';
        html += '<div class="nv-memory-card-tags">';
        for (var ar = 0; ar < memory.relatedArtifacts.length; ar++) {
          html += '<span class="nv-memory-tag nv-memory-tag-artifact">' + escapeHtml(memory.relatedArtifacts[ar]) + '</span>';
        }
        html += '</div>';
        html += '</div>';
      }
      if (itemCollections.length > 0) {
        html += '<div class="nv-memory-detail-section">';
        html += '<h2 class="nv-memory-detail-section-title">Collections</h2>';
        html += '<div class="nv-memory-card-tags">';
        for (var co = 0; co < itemCollections.length; co++) {
          html += '<span class="nv-memory-tag nv-memory-tag-collection">' + escapeHtml(itemCollections[co].name || itemCollections[co].title || '') + '</span>';
        }
        html += '</div>';
        html += '</div>';
      }
      html += '</div>';
      html += '</div>';

      container.innerHTML = html;
      bindDetailEvents(container, memory);
    }

    function renderMemoryEditor(containerEl, memory) {
      container = containerEl;
      if (!container) return;
      var isEdit = memory && memory.id;
      var validTypes = ['note', 'bookmark', 'highlight', 'collection', 'workspace', 'laboratory', 'review', 'search', 'custom'];

      var html = '<div class="nv-memory-editor" role="form" aria-label="' + (isEdit ? 'Edit memory' : 'Create memory') + '">';
      html += '<div class="nv-memory-editor-header">';
      html += '<button class="nv-memory-btn nv-memory-btn-back" data-action="back" aria-label="Go back">\u2190 Back</button>';
      html += '<h1 class="nv-memory-editor-title">' + (isEdit ? 'Edit Memory' : 'Create Memory') + '</h1>';
      html += '</div>';

      html += '<div class="nv-memory-editor-fields">';
      html += '<div class="nv-memory-field">';
      html += '<label class="nv-memory-label" for="nv-memory-type">Type</label>';
      html += '<select class="nv-memory-select nv-memory-input" id="nv-memory-type" name="type" aria-label="Memory type" required>';
      for (var vt = 0; vt < validTypes.length; vt++) {
        var selected = (isEdit && memory.type === validTypes[vt]) ? ' selected' : '';
        html += '<option value="' + escapeAttr(validTypes[vt]) + '"' + selected + '>' + escapeHtml(typeLabel(validTypes[vt])) + '</option>';
      }
      html += '</select>';
      html += '</div>';

      html += '<div class="nv-memory-field">';
      html += '<label class="nv-memory-label" for="nv-memory-title">Title</label>';
      html += '<input class="nv-memory-input" type="text" id="nv-memory-title" name="title" value="' + escapeAttr(isEdit ? memory.title || '' : '') + '" placeholder="Memory title" aria-label="Memory title" required>';
      html += '</div>';

      html += '<div class="nv-memory-field">';
      html += '<label class="nv-memory-label" for="nv-memory-summary">Summary</label>';
      html += '<input class="nv-memory-input" type="text" id="nv-memory-summary" name="summary" value="' + escapeAttr(isEdit ? memory.summary || '' : '') + '" placeholder="Brief summary" aria-label="Memory summary">';
      html += '</div>';

      html += '<div class="nv-memory-field">';
      html += '<label class="nv-memory-label" for="nv-memory-content">Content</label>';
      html += '<textarea class="nv-memory-input nv-memory-textarea" id="nv-memory-content" name="content" rows="6" placeholder="Memory content..." aria-label="Memory content">' + escapeHtml(isEdit ? memory.content || '' : '') + '</textarea>';
      html += '</div>';

      html += '<div class="nv-memory-field">';
      html += '<label class="nv-memory-label" for="nv-memory-tags">Tags (comma-separated)</label>';
      html += '<input class="nv-memory-input" type="text" id="nv-memory-tags" name="tags" value="' + escapeAttr(isEdit && memory.tags ? memory.tags.join(', ') : '') + '" placeholder="tag1, tag2, tag3" aria-label="Memory tags">';
      html += '</div>';

      html += '<div class="nv-memory-field">';
      html += '<label class="nv-memory-label" for="nv-memory-concepts">Concepts (comma-separated)</label>';
      html += '<input class="nv-memory-input" type="text" id="nv-memory-concepts" name="concepts" value="' + escapeAttr(isEdit && memory.relatedConcepts ? memory.relatedConcepts.join(', ') : '') + '" placeholder="concept1, concept2" aria-label="Related concepts">';
      html += '</div>';

      html += '<div class="nv-memory-field">';
      html += '<label class="nv-memory-label" for="nv-memory-artifacts">Artifacts (comma-separated)</label>';
      html += '<input class="nv-memory-input" type="text" id="nv-memory-artifacts" name="artifacts" value="' + escapeAttr(isEdit && memory.relatedArtifacts ? memory.relatedArtifacts.join(', ') : '') + '" placeholder="artifact1, artifact2" aria-label="Related artifacts">';
      html += '</div>';

      html += '<div class="nv-memory-field nv-memory-field-checkbox">';
      html += '<label class="nv-memory-checkbox-label"><input type="checkbox" id="nv-memory-pinned" name="pinned"' + (isEdit && memory.pinned ? ' checked' : '') + ' aria-label="Pin this memory"> Pin this memory</label>';
      html += '</div>';

      html += '<div class="nv-memory-field nv-memory-field-checkbox">';
      html += '<label class="nv-memory-checkbox-label"><input type="checkbox" id="nv-memory-archived" name="archived"' + (isEdit && memory.archived ? ' checked' : '') + ' aria-label="Archive this memory"> Archive this memory</label>';
      html += '</div>';

      html += '<div class="nv-memory-editor-actions">';
      html += '<button class="nv-memory-btn nv-memory-btn-primary" data-action="save" aria-label="' + (isEdit ? 'Save changes' : 'Create memory') + '">' + (isEdit ? 'Save Changes' : 'Create Memory') + '</button>';
      html += '<button class="nv-memory-btn nv-memory-btn-secondary" data-action="cancel" aria-label="Cancel">Cancel</button>';
      html += '</div>';
      html += '</div>';
      html += '</div>';

      container.innerHTML = html;
      bindEditorEvents(container, memory);
    }

    function renderCollectionsList(containerEl) {
      container = containerEl;
      if (!container) return;
      var collectionsMod = getCollections();
      var allCollections = collectionsMod && typeof collectionsMod.getAll === 'function' ? collectionsMod.getAll() : [];

      var html = '<div class="nv-memory-collections" role="main" aria-label="Memory Collections">';
      html += '<div class="nv-memory-dashboard-header">';
      html += '<h1 class="nv-memory-title">Collections</h1>';
      html += '<button class="nv-memory-btn nv-memory-btn-primary" data-action="create-collection" aria-label="Create new collection">+ New Collection</button>';
      html += '</div>';

      if (allCollections.length === 0) {
        html += '<div class="nv-memory-empty">No collections yet. Create one to organize your memories.</div>';
      } else {
        html += '<div class="nv-memory-card-grid" role="list" aria-label="Collections list">';
        for (var c = 0; c < allCollections.length; c++) {
          var col = allCollections[c];
          var items = col.items || col.itemIds || [];
          html += '<div class="nv-memory-card nv-memory-collection-card" role="listitem" tabindex="0" data-collection-id="' + escapeAttr(col.id) + '" aria-label="Collection: ' + escapeAttr(col.name || col.title || '') + '">';
          html += '<div class="nv-memory-card-header">';
          html += '<h3 class="nv-memory-card-title">' + escapeHtml(col.name || col.title || 'Untitled') + '</h3>';
          html += '<span class="nv-memory-badge nv-memory-badge-collection">Collection</span>';
          html += '</div>';
          if (col.description) {
            html += '<p class="nv-memory-card-summary">' + escapeHtml(col.description) + '</p>';
          }
          html += '<div class="nv-memory-card-meta">' + items.length + ' item(s)</div>';
          html += '</div>';
        }
        html += '</div>';
      }
      html += '</div>';

      container.innerHTML = html;
      bindCollectionsListEvents(container);
    }

    function renderCollectionDetail(containerEl, collectionId) {
      container = containerEl;
      if (!container) return;
      var collectionsMod = getCollections();
      var collection = null;
      if (collectionsMod && typeof collectionsMod.getById === 'function') {
        collection = collectionsMod.getById(collectionId);
      }
      if (!collection) {
        container.innerHTML = '<div class="nv-memory-not-found" role="alert">Collection not found.</div>';
        return;
      }

      var retrieval = getRetrieval();
      var items = [];
      if (retrieval && typeof retrieval.getByCollection === 'function') {
        items = retrieval.getByCollection(collectionId);
      }

      var html = '<div class="nv-memory-collection-detail" role="article" aria-label="Collection: ' + escapeAttr(collection.name || collection.title || '') + '">';
      html += '<div class="nv-memory-detail-header">';
      html += '<button class="nv-memory-btn nv-memory-btn-back" data-action="back-collections" aria-label="Back to collections">\u2190 Collections</button>';
      html += '<div class="nv-memory-detail-actions">';
      html += '<button class="nv-memory-btn nv-memory-btn-secondary" data-action="delete-collection" data-collection-id="' + escapeAttr(collectionId) + '" aria-label="Delete collection">Delete Collection</button>';
      html += '</div>';
      html += '</div>';

      html += '<h1 class="nv-memory-detail-title">' + escapeHtml(collection.name || collection.title || 'Untitled') + '</h1>';
      if (collection.description) {
        html += '<p class="nv-memory-detail-text">' + escapeHtml(collection.description) + '</p>';
      }

      if (items.length === 0) {
        html += '<div class="nv-memory-empty">This collection is empty.</div>';
      } else {
        html += '<div class="nv-memory-card-grid" role="list" aria-label="Collection items">';
        for (var i = 0; i < items.length; i++) {
          html += renderMemoryCard(items[i]);
        }
        html += '</div>';
      }
      html += '</div>';

      container.innerHTML = html;
      bindCollectionDetailEvents(container, collectionId);
    }

    function renderSearchResults(containerEl, query) {
      container = containerEl;
      if (!container) return;
      var retrieval = getRetrieval();
      var result = retrieval && typeof retrieval.search === 'function'
        ? retrieval.search(query, { limit: 20 })
        : { items: [], total: 0 };

      var html = '<div class="nv-memory-search-results" role="search" aria-label="Memory search results">';
      html += '<div class="nv-memory-dashboard-header">';
      html += '<h1 class="nv-memory-title">Search Results</h1>';
      html += '<span class="nv-memory-search-count">' + result.total + ' result(s)</span>';
      html += '</div>';

      if (result.items.length === 0) {
        html += '<div class="nv-memory-empty">No memories found for "' + escapeHtml(query) + '".</div>';
      } else {
        html += '<div class="nv-memory-card-grid" role="list" aria-label="Search results">';
        for (var i = 0; i < result.items.length; i++) {
          html += renderMemoryCard(result.items[i]);
        }
        html += '</div>';
      }
      html += '</div>';

      container.innerHTML = html;
      bindSearchResultsEvents(container);
    }

    function parseCommaSeparated(value) {
      if (!value) return [];
      return value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    }

    function collectEditorData() {
      var typeEl = document.getElementById('nv-memory-type');
      var titleEl = document.getElementById('nv-memory-title');
      var summaryEl = document.getElementById('nv-memory-summary');
      var contentEl = document.getElementById('nv-memory-content');
      var tagsEl = document.getElementById('nv-memory-tags');
      var conceptsEl = document.getElementById('nv-memory-concepts');
      var artifactsEl = document.getElementById('nv-memory-artifacts');
      var pinnedEl = document.getElementById('nv-memory-pinned');
      var archivedEl = document.getElementById('nv-memory-archived');

      return {
        type: typeEl ? typeEl.value : 'note',
        title: titleEl ? titleEl.value.trim() : '',
        summary: summaryEl ? summaryEl.value.trim() : '',
        content: contentEl ? contentEl.value : '',
        tags: parseCommaSeparated(tagsEl ? tagsEl.value : ''),
        relatedConcepts: parseCommaSeparated(conceptsEl ? conceptsEl.value : ''),
        relatedArtifacts: parseCommaSeparated(artifactsEl ? artifactsEl.value : ''),
        pinned: pinnedEl ? pinnedEl.checked : false,
        archived: archivedEl ? archivedEl.checked : false
      };
    }

    function saveMemory(existingMemory) {
      var data = collectEditorData();
      if (!data.title) {
        window.alert('Title is required.');
        return;
      }
      var registry = getRegistry();
      var storage = getStorage();
      var now = new Date().toISOString();
      if (existingMemory && existingMemory.id) {
        var updated = Object.assign({}, existingMemory, data, { updatedAt: now });
        if (registry && typeof registry.update === 'function') {
          registry.update(updated);
        }
        if (storage && typeof storage.save === 'function') {
          storage.save();
        }
        dispatch('nv:memory_updated', { memory: updated });
      } else {
        var schema = window.NeuralVerse?.MemorySchema;
        var newMemory = schema && typeof schema.create === 'function'
          ? schema.create(data)
          : Object.assign({ id: 'mem_' + Date.now(), createdAt: now, updatedAt: now, version: '1.0.0', source: 'manual' }, data);
        if (registry && typeof registry.register === 'function') {
          registry.register(newMemory);
        }
        if (storage && typeof storage.save === 'function') {
          storage.save();
        }
        dispatch('nv:memory_created', { memory: newMemory });
      }
      if (container) {
        renderMemoryDashboard(container);
      }
    }

    function deleteMemory(memoryId) {
      if (!window.confirm('Are you sure you want to delete this memory?')) return;
      var registry = getRegistry();
      if (registry && typeof registry.remove === 'function') {
        registry.remove(memoryId);
      }
      dispatch('nv:memory_deleted', { memoryId: memoryId });
      if (container) {
        renderMemoryDashboard(container);
      }
    }

    function togglePin(memory) {
      if (!memory) return;
      var registry = getRegistry();
      var updated = Object.assign({}, memory, { pinned: !memory.pinned, updatedAt: new Date().toISOString() });
      if (registry && typeof registry.update === 'function') {
        registry.update(updated);
      }
      dispatch('nv:memory_pinned', { memory: updated });
      if (container) {
        renderMemoryDetail(container, updated.id);
      }
    }

    function toggleArchive(memory) {
      if (!memory) return;
      var registry = getRegistry();
      var updated = Object.assign({}, memory, { archived: !memory.archived, updatedAt: new Date().toISOString() });
      if (registry && typeof registry.update === 'function') {
        registry.update(updated);
      }
      dispatch('nv:memory_updated', { memory: updated });
      if (container) {
        renderMemoryDetail(container, updated.id);
      }
    }

    function bindDashboardEvents(root) {
      addEvent(root, 'click', function (e) {
        var target = e.target.closest('[data-action]');
        if (!target) return;
        var action = target.getAttribute('data-action');
        if (action === 'create') {
          renderMemoryEditor(container);
        } else if (action === 'export') {
          var bridge = window.NeuralVerse?.MemoryExportImport;
          if (bridge && typeof bridge.exportMemoryState === 'function') {
            var state = bridge.exportMemoryState();
            var json = JSON.stringify(state, null, 2);
            var blob = new Blob([json], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'neuralverse-memory-export-' + new Date().toISOString().slice(0, 10) + '.json';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(function () { URL.revokeObjectURL(url); document.body.removeChild(a); }, 100);
          }
        } else if (action === 'import') {
          var input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.setAttribute('aria-label', 'Import memory JSON file');
          addEvent(input, 'change', function (ev) {
            var file = ev.target.files && ev.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            addEvent(reader, 'load', function (re) {
              try {
                var data = JSON.parse(re.target.result);
                var bridge = window.NeuralVerse?.MemoryExportImport;
                if (bridge && typeof bridge.importMemoryState === 'function') {
                  var result = bridge.importMemoryState(data, 'merge');
                  if (result.success) {
                    renderMemoryDashboard(container);
                  } else {
                    window.alert('Import failed: ' + (result.errors || []).join(', '));
                  }
                }
              } catch (err) {
                window.alert('Invalid JSON file.');
              }
            });
            reader.readAsText(file);
          });
          input.click();
        }
      });

      addEvent(root, 'click', function (e) {
        var card = e.target.closest('[data-memory-id]');
        if (!card || e.target.closest('[data-action]')) return;
        var id = card.getAttribute('data-memory-id');
        if (id) renderMemoryDetail(container, id);
      });

      addEvent(root, 'click', function (e) {
        var card = e.target.closest('[data-collection-id]');
        if (!card || e.target.closest('[data-action]')) return;
        var id = card.getAttribute('data-collection-id');
        if (id) renderCollectionDetail(container, id);
      });

      addEvent(root, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var card = e.target.closest('[data-memory-id]');
          if (card && !e.target.closest('[data-action]')) {
            e.preventDefault();
            var id = card.getAttribute('data-memory-id');
            if (id) renderMemoryDetail(container, id);
          }
        }
      });

      addEvent(root, 'change', function (e) {
        var filterEl = e.target.closest('[data-filter]');
        if (!filterEl) return;
        applyFilters(root);
      });
    }

    function applyFilters(root) {
      var typeFilter = root.querySelector('[data-filter="type"]');
      var sortFilter = root.querySelector('[data-filter="sort"]');
      var pinnedFilter = root.querySelector('[data-filter="pinned"]');
      var archivedFilter = root.querySelector('[data-filter="archived"]');
      var listEl = root.querySelector('#nv-memory-all-list');
      if (!listEl) return;

      var retrieval = getRetrieval();
      if (!retrieval || typeof retrieval.search !== 'function') return;

      var opts = { limit: 100 };
      if (typeFilter && typeFilter.value) opts.type = typeFilter.value;
      if (pinnedFilter && pinnedFilter.checked) opts.pinned = true;
      if (archivedFilter && archivedFilter.checked) opts.archived = true;

      var result = retrieval.search('', opts);
      var items = result.items || [];

      if (sortFilter) {
        var sortBy = sortFilter.value;
        items.sort(function (a, b) {
          if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
          var dateA = a[sortBy] || '';
          var dateB = b[sortBy] || '';
          return dateB > dateA ? 1 : dateB < dateA ? -1 : 0;
        });
      }

      var html = '';
      for (var i = 0; i < items.length; i++) {
        html += renderMemoryCard(items[i]);
      }
      listEl.innerHTML = html || '<div class="nv-memory-empty">No memories match the filter.</div>';
    }

    function bindDetailEvents(root, memory) {
      addEvent(root, 'click', function (e) {
        var target = e.target.closest('[data-action]');
        if (!target) return;
        var action = target.getAttribute('data-action');
        if (action === 'back') {
          renderMemoryDashboard(container);
        } else if (action === 'edit') {
          renderMemoryEditor(container, memory);
        } else if (action === 'pin') {
          togglePin(memory);
        } else if (action === 'archive') {
          toggleArchive(memory);
        } else if (action === 'delete') {
          deleteMemory(memory.id);
        }
      });

      addEvent(root, 'keydown', function (e) {
        if (e.key === 'Escape') {
          renderMemoryDashboard(container);
        }
      });
    }

    function bindEditorEvents(root, existingMemory) {
      addEvent(root, 'click', function (e) {
        var target = e.target.closest('[data-action]');
        if (!target) return;
        var action = target.getAttribute('data-action');
        if (action === 'save') {
          saveMemory(existingMemory);
        } else if (action === 'cancel' || action === 'back') {
          if (existingMemory && existingMemory.id) {
            renderMemoryDetail(container, existingMemory.id);
          } else {
            renderMemoryDashboard(container);
          }
        }
      });

      addEvent(root, 'keydown', function (e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          saveMemory(existingMemory);
        }
        if (e.key === 'Escape') {
          if (existingMemory && existingMemory.id) {
            renderMemoryDetail(container, existingMemory.id);
          } else {
            renderMemoryDashboard(container);
          }
        }
      });
    }

    function bindCollectionsListEvents(root) {
      addEvent(root, 'click', function (e) {
        var target = e.target.closest('[data-action]');
        if (!target) return;
        var action = target.getAttribute('data-action');
        if (action === 'create-collection') {
          var name = window.prompt('Collection name:');
          if (!name || !name.trim()) return;
          var collectionsMod = getCollections();
          if (collectionsMod && typeof collectionsMod.create === 'function') {
            collectionsMod.create({ name: name.trim() });
          }
          renderCollectionsList(container);
        }
      });

      addEvent(root, 'click', function (e) {
        var card = e.target.closest('[data-collection-id]');
        if (!card || e.target.closest('[data-action]')) return;
        var id = card.getAttribute('data-collection-id');
        if (id) renderCollectionDetail(container, id);
      });

      addEvent(root, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var card = e.target.closest('[data-collection-id]');
          if (card && !e.target.closest('[data-action]')) {
            e.preventDefault();
            var id = card.getAttribute('data-collection-id');
            if (id) renderCollectionDetail(container, id);
          }
        }
      });
    }

    function bindCollectionDetailEvents(root, collectionId) {
      addEvent(root, 'click', function (e) {
        var target = e.target.closest('[data-action]');
        if (!target) return;
        var action = target.getAttribute('data-action');
        if (action === 'back-collections') {
          renderCollectionsList(container);
        } else if (action === 'delete-collection') {
          if (!window.confirm('Delete this collection?')) return;
          var collectionsMod = getCollections();
          if (collectionsMod && typeof collectionsMod.remove === 'function') {
            collectionsMod.remove(collectionId);
          }
          renderCollectionsList(container);
        }
      });

      addEvent(root, 'click', function (e) {
        var card = e.target.closest('[data-memory-id]');
        if (!card || e.target.closest('[data-action]')) return;
        var id = card.getAttribute('data-memory-id');
        if (id) renderMemoryDetail(container, id);
      });

      addEvent(root, 'keydown', function (e) {
        if (e.key === 'Escape') {
          renderCollectionsList(container);
        }
      });
    }

    function bindSearchResultsEvents(root) {
      addEvent(root, 'click', function (e) {
        var card = e.target.closest('[data-memory-id]');
        if (!card) return;
        var id = card.getAttribute('data-memory-id');
        if (id) renderMemoryDetail(container, id);
      });

      addEvent(root, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var card = e.target.closest('[data-memory-id]');
          if (card) {
            e.preventDefault();
            var id = card.getAttribute('data-memory-id');
            if (id) renderMemoryDetail(container, id);
          }
        }
      });
    }

    function init() {
      var session = getSession();
      if (session && typeof session.isSessionFresh === 'function' && session.isSessionFresh()) {
        var loaded = session.loadSession();
        if (loaded && loaded.lastWorkspace) {
          // Session is valid; dashboard will load on render
        }
      }
    }

    function renderDashboard(targetContainer) {
      var c = targetContainer || container;
      if (!c) return;
      renderMemoryDashboard(c);
    }

    function destroy() {
      clearListeners();
      container = null;
    }

    return {
      init: init,
      renderDashboard: renderDashboard,
      renderMemoryDashboard: renderMemoryDashboard,
      renderMemoryDetail: renderMemoryDetail,
      renderMemoryEditor: renderMemoryEditor,
      renderCollectionsList: renderCollectionsList,
      renderCollectionDetail: renderCollectionDetail,
      renderSearchResults: renderSearchResults,
      destroy: destroy
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createMemoryUIController = createMemoryUIController;
})();
