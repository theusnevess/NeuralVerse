/**
 * NeuralVerse Session Continuity
 * Session restore system for memory module state persistence.
 * Self-contained IIFE. No eval, no Function, no external requests.
 */
(function () {
  'use strict';

  var SESSION_KEY = 'nv_memory_session';
  var MAX_RECENT = 20;

  function getStorage() {
    return window.NeuralVerse?.MemoryStorage || null;
  }

  function readSession() {
    var storage = getStorage();
    if (!storage || typeof storage.getItem !== 'function') return null;
    var raw = storage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (e) {
      return null;
    }
  }

  function writeSession(data) {
    var storage = getStorage();
    if (!storage || typeof storage.setItem !== 'function') return false;
    storage.setItem(SESSION_KEY, JSON.stringify(data));
    return true;
  }

  function createDefaultSession() {
    return {
      lastWorkspace: '',
      recentSearches: [],
      activeLaboratory: null,
      activeReviewSession: false,
      recentArtifacts: [],
      recentConcepts: [],
      lastVisited: new Date().toISOString(),
      sessionId: 'sess_' + Date.now()
    };
  }

  function dedupArray(arr, maxLen) {
    var seen = {};
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      var val = arr[i];
      if (!seen[val]) {
        seen[val] = true;
        result.push(val);
      }
    }
    return result.slice(0, maxLen || MAX_RECENT);
  }

  function saveSession(data) {
    var session = readSession() || createDefaultSession();
    if (data && typeof data === 'object') {
      if ('lastWorkspace' in data) session.lastWorkspace = data.lastWorkspace;
      if ('recentSearches' in data) session.recentSearches = dedupArray(data.recentSearches, MAX_RECENT);
      if ('activeLaboratory' in data) session.activeLaboratory = data.activeLaboratory;
      if ('activeReviewSession' in data) session.activeReviewSession = data.activeReviewSession;
      if ('recentArtifacts' in data) session.recentArtifacts = dedupArray(data.recentArtifacts, MAX_RECENT);
      if ('recentConcepts' in data) session.recentConcepts = dedupArray(data.recentConcepts, MAX_RECENT);
      if ('sessionId' in data) session.sessionId = data.sessionId;
    }
    session.lastVisited = new Date().toISOString();
    writeSession(session);
    return session;
  }

  function loadSession() {
    var session = readSession();
    if (!session) {
      session = createDefaultSession();
      writeSession(session);
    }
    return session;
  }

  function clearSession() {
    var storage = getStorage();
    if (storage && typeof storage.removeItem === 'function') {
      storage.removeItem(SESSION_KEY);
    }
  }

  function getSessionSummary() {
    var session = loadSession();
    var parts = [];
    parts.push('Session ' + (session.sessionId || 'unknown'));
    if (session.lastWorkspace) {
      parts.push('Last workspace: ' + session.lastWorkspace);
    }
    if (session.recentSearches.length > 0) {
      parts.push(session.recentSearches.length + ' recent search(es)');
    }
    if (session.activeLaboratory) {
      parts.push('Active lab: ' + session.activeLaboratory);
    }
    if (session.activeReviewSession) {
      parts.push('Review session active');
    }
    if (session.recentArtifacts.length > 0) {
      parts.push(session.recentArtifacts.length + ' recent artifact(s)');
    }
    if (session.recentConcepts.length > 0) {
      parts.push(session.recentConcepts.length + ' recent concept(s)');
    }
    var visited = session.lastVisited ? new Date(session.lastVisited) : null;
    if (visited) {
      var now = Date.now();
      var diffMs = now - visited.getTime();
      var diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) {
        parts.push('Last visited: just now');
      } else if (diffMin < 60) {
        parts.push('Last visited: ' + diffMin + 'm ago');
      } else {
        var diffH = Math.floor(diffMin / 60);
        if (diffH < 24) {
          parts.push('Last visited: ' + diffH + 'h ago');
        } else {
          parts.push('Last visited: ' + Math.floor(diffH / 24) + 'd ago');
        }
      }
    }
    return parts.join(' \u00b7 ');
  }

  function isSessionFresh() {
    var session = readSession();
    if (!session || !session.lastVisited) return false;
    var visited = new Date(session.lastVisited);
    var now = Date.now();
    var diffMs = now - visited.getTime();
    var hours24 = 24 * 60 * 60 * 1000;
    return diffMs < hours24;
  }

  function updateRecentSearch(query) {
    if (!query || typeof query !== 'string') return;
    var session = loadSession();
    var searches = session.recentSearches || [];
    searches.unshift(query);
    session.recentSearches = dedupArray(searches, MAX_RECENT);
    session.lastVisited = new Date().toISOString();
    writeSession(session);
  }

  function updateRecentArtifact(artifactId) {
    if (!artifactId || typeof artifactId !== 'string') return;
    var session = loadSession();
    var artifacts = session.recentArtifacts || [];
    artifacts.unshift(artifactId);
    session.recentArtifacts = dedupArray(artifacts, MAX_RECENT);
    session.lastVisited = new Date().toISOString();
    writeSession(session);
  }

  function updateRecentConcept(conceptId) {
    if (!conceptId || typeof conceptId !== 'string') return;
    var session = loadSession();
    var concepts = session.recentConcepts || [];
    concepts.unshift(conceptId);
    session.recentConcepts = dedupArray(concepts, MAX_RECENT);
    session.lastVisited = new Date().toISOString();
    writeSession(session);
  }

  function setActiveLab(labId) {
    var session = loadSession();
    session.activeLaboratory = labId || null;
    session.lastVisited = new Date().toISOString();
    writeSession(session);
  }

  function setActiveReviewSession(active) {
    var session = loadSession();
    session.activeReviewSession = active === true;
    session.lastVisited = new Date().toISOString();
    writeSession(session);
  }

  function setLastWorkspace(routeId) {
    var session = loadSession();
    session.lastWorkspace = routeId || '';
    session.lastVisited = new Date().toISOString();
    writeSession(session);
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.SessionContinuity = {
    saveSession: saveSession,
    loadSession: loadSession,
    clearSession: clearSession,
    getSessionSummary: getSessionSummary,
    isSessionFresh: isSessionFresh,
    updateRecentSearch: updateRecentSearch,
    updateRecentArtifact: updateRecentArtifact,
    updateRecentConcept: updateRecentConcept,
    setActiveLab: setActiveLab,
    setActiveReviewSession: setActiveReviewSession,
    setLastWorkspace: setLastWorkspace
  };
})();
