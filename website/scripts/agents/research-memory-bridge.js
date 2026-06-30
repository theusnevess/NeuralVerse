/**
 * NV-1300-D2 — Research Memory Bridge
 *
 * Reads only explicit user state: bookmarks, saved papers,
 * pinned research, saved searches. Never infers interests.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 */

function _safeArray(v) { return Array.isArray(v) ? v : []; }

function createResearchMemoryBridge() {
  var _lastContext = null;

  function loadBookmarks() {
    if (typeof window === 'undefined') return [];
    var nv = window.NeuralVerse;
    var reg = nv && (nv.MemoryRegistry || nv.memoryRegistry);
    if (!reg || typeof reg.getAll !== 'function') return [];
    try {
      var all = reg.getAll();
      if (!Array.isArray(all)) return [];
      return all.filter(function (item) { return item && item.type === 'bookmark' && item.relatedResearch; });
    } catch (e) { return []; }
  }

  function loadSavedPapers() {
    if (typeof window === 'undefined') return [];
    var nv = window.NeuralVerse;
    var reg = nv && (nv.ResearchLibrary || nv.researchLibrary);
    if (!reg || typeof reg.getAll !== 'function') return [];
    try {
      var all = reg.getAll();
      return Array.isArray(all) ? all.filter(function (p) { return p && p.saved === true; }) : [];
    } catch (e) { return []; }
  }

  function loadPinnedResearch() {
    if (typeof window === 'undefined') return [];
    var nv = window.NeuralVerse;
    var reg = nv && (nv.MemoryRegistry || nv.memoryRegistry);
    if (!reg || typeof reg.getAll !== 'function') return [];
    try {
      var all = reg.getAll();
      return Array.isArray(all) ? all.filter(function (item) { return item && item.pinned === true && item.type === 'research'; }) : [];
    } catch (e) { return []; }
  }

  function buildContext() {
    var bookmarks = loadBookmarks();
    var papers = loadSavedPapers();
    var pinned = loadPinnedResearch();

    _lastContext = {
      bookmarks: bookmarks,
      savedPapers: papers,
      pinnedResearch: pinned,
      counts: {
        bookmarks: bookmarks.length,
        papers: papers.length,
        pinned: pinned.length
      }
    };
    return _lastContext;
  }

  function getLastContext() { return _lastContext; }
  function reset() { _lastContext = null; }

  return {
    loadBookmarks: loadBookmarks,
    loadSavedPapers: loadSavedPapers,
    loadPinnedResearch: loadPinnedResearch,
    buildContext: buildContext,
    getLastContext: getLastContext,
    reset: reset
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createResearchMemoryBridge = createResearchMemoryBridge;
}

export { createResearchMemoryBridge };
