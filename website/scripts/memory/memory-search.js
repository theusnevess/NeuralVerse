/**
 * NeuralVerse Memory Search Integration
 * Integrates memory retrieval with the global Ctrl+K search system.
 * Self-contained IIFE. No eval, no Function, no external requests.
 */
(function () {
  'use strict';

  var searchIndex = null;

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

  function getRetrieval() {
    return window.NeuralVerse?.MemoryRetrieval || null;
  }

  function buildIndex() {
    var retrieval = getRetrieval();
    if (!retrieval || typeof retrieval.search !== 'function') return [];
    var result = retrieval.search('', { limit: 1000, archived: false });
    var items = result.items || [];
    var index = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      index.push({
        id: item.id,
        type: item.type || 'note',
        title: item.title || '',
        summary: item.summary || '',
        tags: (item.tags || []).join(' '),
        concepts: (item.relatedConcepts || []).join(' '),
        content: item.content || '',
        searchableText: normalizeText(
          (item.id || '') + ' ' +
          (item.title || '') + ' ' +
          (item.summary || '') + ' ' +
          (item.tags || []).join(' ') + ' ' +
          (item.relatedConcepts || []).join(' ') + ' ' +
          (item.content || '') + ' ' +
          (item.type || '')
        ),
        pinned: item.pinned || false
      });
    }
    return index;
  }

  function indexMemories() {
    searchIndex = buildIndex();
    return searchIndex.length;
  }

  function ensureIndex() {
    if (!searchIndex) {
      indexMemories();
    }
    return searchIndex || [];
  }

  function searchMemories(query) {
    var index = ensureIndex();
    if (!query || typeof query !== 'string') return [];
    var normQuery = normalizeText(query);
    var terms = normQuery.split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    var results = [];
    for (var i = 0; i < index.length; i++) {
      var entry = index[i];
      var allTermsMatch = terms.every(function (t) {
        return entry.searchableText.indexOf(t) !== -1;
      });
      if (!allTermsMatch) continue;

      var score = 0;
      var normTitle = normalizeText(entry.title);
      var normSummary = normalizeText(entry.summary);

      if (normTitle === normQuery) {
        score = 1000;
      } else if (normTitle.indexOf(normQuery) === 0) {
        score = 800;
      } else if (normTitle.indexOf(normQuery) !== -1) {
        score = 600;
      } else if (terms.every(function (t) { return normTitle.indexOf(t) !== -1; })) {
        score = 500;
      } else if (terms.every(function (t) { return entry.tags.indexOf(t) !== -1; })) {
        score = 400;
      } else if (normSummary.indexOf(normQuery) !== -1) {
        score = 350;
      } else if (terms.every(function (t) { return normSummary.indexOf(t) !== -1; })) {
        score = 300;
      } else {
        score = 100;
      }

      if (entry.pinned) score += 50;

      results.push({
        id: entry.id,
        type: 'memory',
        badgeLabel: 'Memory',
        title: entry.title,
        summary: entry.summary,
        href: '#/memory/' + entry.id,
        breadcrumbs: ['Memory', entry.title],
        searchableText: entry.searchableText,
        score: score
      });
    }

    results.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return (a.title || '').localeCompare(b.title || '');
    });

    return results.slice(0, 10);
  }

  function highlightText(text, terms) {
    var escaped = escapeHtml(text);
    if (!terms || terms.length === 0) return escaped;
    var sortedTerms = terms.slice().sort(function (a, b) { return b.length - a.length; });
    var marked = escaped;
    for (var i = 0; i < sortedTerms.length; i++) {
      var term = sortedTerms[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      if (!term) continue;
      var regex = new RegExp('(' + term + ')', 'gi');
      marked = marked.replace(regex, '\u0002$1\u0003');
    }
    return marked
      .replace(/\u0002/g, '<mark class="nv-search-highlight">')
      .replace(/\u0003/g, '</mark>');
  }

  function getSearchResultHtml(memory, terms) {
    if (!memory) return '';
    var normQuery = '';
    if (terms && terms.length > 0) {
      normQuery = terms.join(' ');
    }
    var queryTerms = normQuery.length > 0 ? normQuery.split(/\s+/).filter(Boolean) : [];

    var title = highlightText(memory.title || '', queryTerms);
    var summary = memory.summary ? '<div class="nv-search-item-summary">' + highlightText(memory.summary, queryTerms) + '</div>' : '';
    var badge = '<span class="nv-search-badge" data-type="memory">Memory</span>';
    var breadcrumbs = memory.breadcrumbs
      ? '<div class="nv-search-item-breadcrumbs">' +
        memory.breadcrumbs.map(function (bc) { return '<span>' + escapeHtml(bc) + '</span>'; }).join('') +
        '</div>'
      : '';

    return '<a class="nv-search-item" href="' + escapeHtml(memory.href || '') + '" role="option" data-memory-id="' + escapeHtml(memory.id || '') + '">' +
      '<div class="nv-search-item-header">' +
      '<div class="nv-search-item-title-wrapper"><span class="nv-search-item-title">' + title + '</span></div>' +
      badge +
      '</div>' +
      breadcrumbs +
      summary +
      '</a>';
  }

  function isMemoryQuery(query) {
    if (!query || typeof query !== 'string') return false;
    var norm = normalizeText(query);
    var memoryTerms = ['memory', 'memories', 'note', 'notes', 'bookmark', 'bookmarks', 'highlight', 'highlights'];
    for (var i = 0; i < memoryTerms.length; i++) {
      if (norm.indexOf(memoryTerms[i]) !== -1) return true;
    }
    if (norm.indexOf('mem') === 0) return true;
    return false;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.MemorySearch = {
    indexMemories: indexMemories,
    searchMemories: searchMemories,
    getSearchResultHtml: getSearchResultHtml,
    isMemoryQuery: isMemoryQuery
  };
})();
