/**
 * NeuralVerse — Shared Semantic Context
 * Ecosystem contract for semantic context consumption.
 * Provides unified access to semantic context across all pages.
 *
 * NV-1100 Phase 9 — Ecosystem Consumption Integration
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'nv:semantic-active-concept';
  var listeners = [];

  /* ─── Context Contract ────────────────────────────────── */

  function getActiveContext() {
    // Priority: sessionStorage > null
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {
      // sessionStorage unavailable or corrupt
    }
    return null;
  }

  function setActiveContext(conceptId, conceptName, category, source) {
    var ctx = {
      id: conceptId,
      name: conceptName || conceptId,
      category: category || '',
      source: source || 'semantic',
      timestamp: Date.now()
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
    } catch (e) {
      // sessionStorage unavailable
    }

    // Notify subscribers
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](ctx); } catch (e) { /* silent */ }
    }

    // Dispatch global event
    window.dispatchEvent(new CustomEvent('nv:semantic-context-updated', { detail: ctx }));

    return ctx;
  }

  function clearActiveContext() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // silent
    }

    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](null); } catch (e) { /* silent */ }
    }

    window.dispatchEvent(new CustomEvent('nv:semantic-context-updated', { detail: null }));
  }

  function subscribeContext(callback) {
    if (typeof callback !== 'function') return function () {};
    listeners.push(callback);
    return function () {
      listeners = listeners.filter(function (l) { return l !== callback; });
    };
  }

  /* ─── URL Parameter Helpers ────────────────────────────── */

  function getParamFromHash(param) {
    var hash = window.location.hash || '';
    var qIdx = hash.indexOf('?');
    if (qIdx === -1) return null;
    var params = new URLSearchParams(hash.substring(qIdx + 1));
    return params.get(param) || null;
  }

  function setParamInHash(param, value) {
    var hash = window.location.hash || '#/';
    var qIdx = hash.indexOf('?');
    var base = qIdx === -1 ? hash : hash.substring(0, qIdx);
    var existing = {};

    if (qIdx !== -1) {
      var sp = new URLSearchParams(hash.substring(qIdx + 1));
      sp.forEach(function (v, k) { existing[k] = v; });
    }

    if (value) {
      existing[param] = value;
    } else {
      delete existing[param];
    }

    var newQs = Object.keys(existing).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(existing[k]);
    }).join('&');

    window.history.replaceState(null, '', base + (newQs ? '?' + newQs : ''));
  }

  /* ─── Context Banner ───────────────────────────────────── */

  function renderContextBanner(source, conceptName) {
    if (!source || !conceptName) return '';

    var sourceLabels = {
      'semantic': 'Semantic',
      'atlas': 'Atlas',
      'retrieval': 'Retrieval',
      'learning': 'Learning',
      'memory': 'Memory',
      'workspace': 'Workspace'
    };

    var sourceLabel = sourceLabels[source] || source;

    return '<div class="nv-context-banner" role="status" aria-label="Opened from ' + escapeHtml(sourceLabel) + '">' +
      '<span class="nv-context-banner__source">Opened from ' + escapeHtml(sourceLabel) + '</span>' +
      '<span class="nv-context-banner__concept">' + escapeHtml(conceptName) + '</span>' +
      '<button type="button" class="nv-context-banner__dismiss" aria-label="Dismiss banner" data-dismiss-banner>×</button>' +
      '</div>';
  }

  function mountContextBanner(container, source, conceptName) {
    if (!container) return;
    container.innerHTML = renderContextBanner(source, conceptName);
    container.hidden = !conceptName;

    var dismiss = container.querySelector('[data-dismiss-banner]');
    if (dismiss) {
      dismiss.addEventListener('click', function () {
        container.innerHTML = '';
        container.hidden = true;
      });
    }
  }

  /* ─── Cross-System Source Tracker ──────────────────────── */

  function getSourceContext() {
    var ctx = getActiveContext();
    return ctx ? ctx.source : null;
  }

  function isFromSemantic() {
    return getSourceContext() === 'semantic';
  }

  function isFromAtlas() {
    return getSourceContext() === 'atlas';
  }

  /* ─── Helpers ──────────────────────────────────────────── */

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ─── Public API ───────────────────────────────────────── */

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.SemanticContext = {
    getActiveContext: getActiveContext,
    setActiveContext: setActiveContext,
    clearActiveContext: clearActiveContext,
    subscribeContext: subscribeContext,
    getParamFromHash: getParamFromHash,
    setParamInHash: setParamInHash,
    renderContextBanner: renderContextBanner,
    mountContextBanner: mountContextBanner,
    getSourceContext: getSourceContext,
    isFromSemantic: isFromSemantic,
    isFromAtlas: isFromAtlas
  };
})();
