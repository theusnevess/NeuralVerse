/**
 * NeuralVerse Memory Retrieval Engine
 * Deterministic search and query system for memory items.
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

  function normalizeText(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getRegistry() {
    return window.NeuralVerse?.MemoryRegistry || null;
  }

  function getIndexer() {
    return window.NeuralVerse?.MemoryIndexer || null;
  }

  function getAllItems() {
    var registry = getRegistry();
    if (!registry || typeof registry.getAll !== 'function') return [];
    var items = registry.getAll();
    return Array.isArray(items) ? items : [];
  }

  function scoreItem(item, normQuery, queryTerms) {
    var normTitle = normalizeText(item.title || '');
    var normSummary = normalizeText(item.summary || '');
    var normContent = normalizeText(item.content || '');
    var normTags = (item.tags || []).map(normalizeText).join(' ');
    var normId = normalizeText(item.id || '');

    var score = 0;

    if (normQuery && normQuery.length > 0) {
      if (normTitle === normQuery) {
        score = 1000;
      } else if (normTitle.indexOf(normQuery) === 0) {
        score = 800;
      } else if (normTitle.indexOf(normQuery) !== -1) {
        score = 600;
      } else if (queryTerms.length > 0 && queryTerms.every(function (t) { return normTitle.indexOf(t) !== -1; })) {
        score = 500;
      } else if (normTags.indexOf(normQuery) !== -1) {
        score = 450;
      } else if (queryTerms.length > 0 && queryTerms.every(function (t) { return normTags.indexOf(t) !== -1; })) {
        score = 400;
      } else if (normSummary.indexOf(normQuery) !== -1) {
        score = 350;
      } else if (queryTerms.length > 0 && queryTerms.every(function (t) { return normSummary.indexOf(t) !== -1; })) {
        score = 300;
      } else if (normContent.indexOf(normQuery) !== -1) {
        score = 200;
      } else if (queryTerms.length > 0 && queryTerms.every(function (t) { return normContent.indexOf(t) !== -1; })) {
        score = 150;
      } else if (normId.indexOf(normQuery) !== -1) {
        score = 100;
      } else {
        score = 0;
      }
    }

    if (item.pinned) {
      score += 50;
    }
    if (item.archived) {
      score -= 200;
    }

    return score;
  }

  function matchesFilters(item, options) {
    if (!options) return true;

    if (options.type && item.type !== options.type) {
      return false;
    }

    if (options.pinned === true && item.pinned !== true) {
      return false;
    }

    if (options.archived === true && item.archived !== true) {
      return false;
    }

    if (options.tags && Array.isArray(options.tags) && options.tags.length > 0) {
      var itemTags = item.tags || [];
      var hasAll = options.tags.every(function (t) {
        return itemTags.indexOf(t) !== -1;
      });
      if (!hasAll) return false;
    }

    if (options.concepts && Array.isArray(options.concepts) && options.concepts.length > 0) {
      var itemConcepts = item.relatedConcepts || [];
      var conceptsMatch = options.concepts.every(function (c) {
        return itemConcepts.indexOf(c) !== -1;
      });
      if (!conceptsMatch) return false;
    }

    if (options.collection) {
      var collections = window.NeuralVerse?.MemoryCollections;
      if (collections && typeof collections.containsItem === 'function') {
        if (!collections.containsItem(options.collection, item.id)) {
          return false;
        }
      }
    }

    if (options.from || options.to) {
      var itemDate = new Date(item.updatedAt || item.createdAt);
      if (options.from) {
        var fromDate = new Date(options.from);
        if (itemDate < fromDate) return false;
      }
      if (options.to) {
        var toDate = new Date(options.to);
        if (itemDate > toDate) return false;
      }
    }

    return true;
  }

  function search(query, options) {
    var opts = options || {};
    var limit = typeof opts.limit === 'number' ? opts.limit : 50;
    var offset = typeof opts.offset === 'number' ? opts.offset : 0;
    var normQuery = normalizeText(query || '');
    var queryTerms = normQuery.length > 0 ? normQuery.split(/\s+/).filter(Boolean) : [];
    var items = getAllItems();

    var scored = [];
    for (var i = 0; i < items.length; i++) {
      if (!matchesFilters(items[i], opts)) continue;

      if (normQuery.length > 0) {
        var s = scoreItem(items[i], normQuery, queryTerms);
        if (s > 0) {
          scored.push({ item: items[i], score: s });
        }
      } else {
        scored.push({ item: items[i], score: items[i].pinned ? 50 : 0 });
      }
    }

    scored.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      var dateA = a.item.updatedAt || a.item.createdAt || '';
      var dateB = b.item.updatedAt || b.item.createdAt || '';
      if (dateB !== dateA) return dateB > dateA ? 1 : -1;
      return (a.item.title || '').localeCompare(b.item.title || '');
    });

    var total = scored.length;
    var page = scored.slice(offset, offset + limit);

    return {
      items: page.map(function (s) { return s.item; }),
      total: total,
      offset: offset,
      limit: limit
    };
  }

  function getRecent(limit) {
    var items = getAllItems();
    var max = typeof limit === 'number' ? limit : 20;
    var sorted = items.slice().sort(function (a, b) {
      var dateA = a.updatedAt || a.createdAt || '';
      var dateB = b.updatedAt || b.createdAt || '';
      if (dateB !== dateA) return dateB > dateA ? 1 : -1;
      return (a.title || '').localeCompare(b.title || '');
    });
    return sorted.slice(0, max);
  }

  function getByTag(tag) {
    var items = getAllItems();
    return items.filter(function (item) {
      return (item.tags || []).indexOf(tag) !== -1;
    });
  }

  function getByConcept(concept) {
    var items = getAllItems();
    return items.filter(function (item) {
      return (item.relatedConcepts || []).indexOf(concept) !== -1;
    });
  }

  function getByArtifact(artifact) {
    var items = getAllItems();
    return items.filter(function (item) {
      return (item.relatedArtifacts || []).indexOf(artifact) !== -1;
    });
  }

  function getByType(type) {
    var items = getAllItems();
    return items.filter(function (item) {
      return item.type === type;
    });
  }

  function getPinned() {
    var items = getAllItems();
    return items.filter(function (item) {
      return item.pinned === true;
    });
  }

  function getByCollection(collectionId) {
    var collections = window.NeuralVerse?.MemoryCollections;
    if (collections && typeof collections.getItems === 'function') {
      return collections.getItems(collectionId);
    }
    return [];
  }

  function getByDateRange(from, to) {
    var items = getAllItems();
    var fromDate = from ? new Date(from) : null;
    var toDate = to ? new Date(to) : null;
    return items.filter(function (item) {
      var d = new Date(item.updatedAt || item.createdAt);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }

  function getMemory(id) {
    var registry = getRegistry();
    if (registry && typeof registry.getById === 'function') {
      return registry.getById(id) || null;
    }
    var items = getAllItems();
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) return items[i];
    }
    return null;
  }

  function getStats() {
    var items = getAllItems();
    var typeCounts = {};
    var pinnedCount = 0;
    var archivedCount = 0;
    for (var i = 0; i < items.length; i++) {
      var t = items[i].type || 'unknown';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
      if (items[i].pinned) pinnedCount++;
      if (items[i].archived) archivedCount++;
    }
    return {
      total: items.length,
      byType: typeCounts,
      pinned: pinnedCount,
      archived: archivedCount
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.MemoryRetrieval = {
    search: search,
    getRecent: getRecent,
    getByTag: getByTag,
    getByConcept: getByConcept,
    getByArtifact: getByArtifact,
    getByType: getByType,
    getPinned: getPinned,
    getByCollection: getByCollection,
    getByDateRange: getByDateRange,
    getMemory: getMemory,
    getStats: getStats
  };
})();
