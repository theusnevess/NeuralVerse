/**
 * NV-900-P8 — Research Storage
 * Local-first persistence for research sessions using localStorage.
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'nv_research_sessions';
  var MAX_SESSIONS_PER_LAB = 50;

  function getAdapter() {
    return window.NeuralVerse?.StorageAdapter || null;
  }

  function readJSON(key) {
    var adapter = getAdapter();
    if (!adapter) return null;
    var raw = adapter.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function writeJSON(key, value) {
    var adapter = getAdapter();
    if (!adapter) return;
    adapter.setItem(key, JSON.stringify(value));
  }

  function getAllSessions() {
    return readJSON(STORAGE_KEY) || {};
  }

  function getSessionsForLab(labId) {
    var all = getAllSessions();
    return all[labId] || [];
  }

  function saveSession(labId, session) {
    var all = getAllSessions();
    if (!all[labId]) all[labId] = [];

    // Update existing or add new
    var existingIdx = -1;
    for (var i = 0; i < all[labId].length; i++) {
      if (all[labId][i].id === session.id) {
        existingIdx = i;
        break;
      }
    }

    if (existingIdx >= 0) {
      all[labId][existingIdx] = session;
    } else {
      all[labId].unshift(session);
    }

    // Trim to max
    if (all[labId].length > MAX_SESSIONS_PER_LAB) {
      all[labId] = all[labId].slice(0, MAX_SESSIONS_PER_LAB);
    }

    writeJSON(STORAGE_KEY, all);
    dispatchEvent('nv:research_session_saved', { labId: labId, sessionId: session.id });
  }

  function getSession(labId, sessionId) {
    var sessions = getSessionsForLab(labId);
    for (var i = 0; i < sessions.length; i++) {
      if (sessions[i].id === sessionId) return sessions[i];
    }
    return null;
  }

  function deleteSession(labId, sessionId) {
    var all = getAllSessions();
    if (!all[labId]) return;
    all[labId] = all[labId].filter(function (s) { return s.id !== sessionId; });
    writeJSON(STORAGE_KEY, all);
    dispatchEvent('nv:research_session_deleted', { labId: labId, sessionId: sessionId });
  }

  function getRecentSessions(labId, count) {
    var sessions = getSessionsForLab(labId);
    return sessions.slice(0, count || 10);
  }

  function getAllRecentSessions(count) {
    var all = getAllSessions();
    var flat = [];
    for (var labId in all) {
      for (var i = 0; i < all[labId].length; i++) {
        flat.push(all[labId][i]);
      }
    }
    flat.sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return flat.slice(0, count || 20);
  }

  function getSessionCount(labId) {
    var all = getAllSessions();
    return all[labId] ? all[labId].length : 0;
  }

  function createSession(labId, labSlug, labTitle, params) {
    return {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      labId: labId,
      labSlug: labSlug,
      labTitle: labTitle,
      name: 'Session ' + new Date().toLocaleString(),
      hypothesis: '',
      params: params || {},
      runs: [],
      notes: [],
      bookmarks: [],
      conclusions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };
  }

  function createRun(session, params, result) {
    return {
      id: 'run_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      params: params || {},
      result: result || null,
      metrics: {},
      observations: [],
      log: [],
      runtime: 0,
      timestamp: new Date().toISOString()
    };
  }

  function addNote(session, note) {
    session.notes.push({
      id: 'note_' + Date.now(),
      text: note.text || '',
      type: note.type || 'observation',
      stepIndex: note.stepIndex || 0,
      timestamp: new Date().toISOString()
    });
    session.updatedAt = new Date().toISOString();
  }

  function addBookmark(session, bookmark) {
    session.bookmarks.push({
      id: 'bookmark_' + Date.now(),
      stepIndex: bookmark.stepIndex || 0,
      label: bookmark.label || '',
      state: bookmark.state || null,
      timestamp: new Date().toISOString()
    });
    session.updatedAt = new Date().toISOString();
  }

  function addConclusion(session, conclusion) {
    session.conclusions.push({
      id: 'conclusion_' + Date.now(),
      text: conclusion.text || '',
      type: conclusion.type || 'observation',
      supported: conclusion.supported || null,
      timestamp: new Date().toISOString()
    });
    session.updatedAt = new Date().toISOString();
  }

  function updateSessionName(session, name) {
    session.name = name;
    session.updatedAt = new Date().toISOString();
  }

  function updateHypothesis(session, hypothesis) {
    session.hypothesis = hypothesis;
    session.updatedAt = new Date().toISOString();
  }

  function getResearchInsights(labId) {
    var sessions = getSessionsForLab(labId);
    if (sessions.length < 2) return null;

    var totalRuns = 0;
    var convergedCount = 0;
    var paramRanges = {};

    for (var i = 0; i < sessions.length; i++) {
      var session = sessions[i];
      totalRuns += session.runs.length;
      for (var j = 0; j < session.runs.length; j++) {
        var run = session.runs[j];
        if (run.result && run.result.converged) convergedCount++;
        for (var key in run.params) {
          if (!paramRanges[key]) paramRanges[key] = { min: Infinity, max: -Infinity };
          var val = parseFloat(run.params[key]);
          if (!isNaN(val)) {
            if (val < paramRanges[key].min) paramRanges[key].min = val;
            if (val > paramRanges[key].max) paramRanges[key].max = val;
          }
        }
      }
    }

    return {
      totalSessions: sessions.length,
      totalRuns: totalRuns,
      convergenceRate: totalRuns > 0 ? Math.round((convergedCount / totalRuns) * 100) : 0,
      parameterRanges: paramRanges
    };
  }

  function dispatchEvent(name, detail) {
    try {
      window.dispatchEvent(new CustomEvent(name, { detail: detail }));
    } catch (e) {
      // Ignore
    }
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.ResearchStorage = {
    getAllSessions: getAllSessions,
    getSessionsForLab: getSessionsForLab,
    getSession: getSession,
    saveSession: saveSession,
    deleteSession: deleteSession,
    getRecentSessions: getRecentSessions,
    getAllRecentSessions: getAllRecentSessions,
    getSessionCount: getSessionCount,
    createSession: createSession,
    createRun: createRun,
    addNote: addNote,
    addBookmark: addBookmark,
    addConclusion: addConclusion,
    updateSessionName: updateSessionName,
    updateHypothesis: updateHypothesis,
    getResearchInsights: getResearchInsights
  };

})();
