/**
 * NV-1100-P7 — State Storage
 * Local-first persistence for laboratory state using localStorage.
 */

(function () {
  'use strict';

  var KEYS = {
    state: 'nv_lab_state',
    recent: 'nv_lab_recent',
    preferences: 'nv_lab_preferences'
  };

  var MAX_RECENT = 20;

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
    if (value === null || value === undefined) {
      adapter.removeItem(key);
    } else {
      adapter.setItem(key, JSON.stringify(value));
    }
  }

  function getState(labId) {
    var all = readJSON(KEYS.state) || {};
    return all[labId] || null;
  }

  function saveState(labId, state) {
    var all = readJSON(KEYS.state) || {};
    all[labId] = {
      params: state.params || {},
      lastExecuted: state.lastExecuted || new Date().toISOString(),
      resultSummary: state.resultSummary || null
    };
    writeJSON(KEYS.state, all);
    dispatchLabEvent('nv:lab_state_saved', { labId: labId });
  }

  function clearState(labId) {
    var all = readJSON(KEYS.state) || {};
    delete all[labId];
    writeJSON(KEYS.state, all);
    dispatchLabEvent('nv:lab_state_cleared', { labId: labId });
  }

  function getRecentLabs() {
    return readJSON(KEYS.recent) || [];
  }

  function addRecentLab(labId, title, slug) {
    var recent = getRecentLabs();
    recent = recent.filter(function (r) { return r.labId !== labId; });
    recent.unshift({
      labId: labId,
      title: title,
      slug: slug,
      lastOpened: new Date().toISOString()
    });
    if (recent.length > MAX_RECENT) {
      recent = recent.slice(0, MAX_RECENT);
    }
    writeJSON(KEYS.recent, recent);
    dispatchLabEvent('nv:lab_recent_updated', {});
  }

  function getPreferences() {
    return readJSON(KEYS.preferences) || {
      showGuidance: true,
      autoExecute: true,
      theme: 'default'
    };
  }

  function savePreferences(prefs) {
    writeJSON(KEYS.preferences, prefs);
    dispatchLabEvent('nv:lab_preferences_updated', {});
  }

  function getAllLabStates() {
    return readJSON(KEYS.state) || {};
  }

  function dispatchLabEvent(name, detail) {
    try {
      window.dispatchEvent(new CustomEvent(name, { detail: detail }));
    } catch (e) {
      // Ignore
    }
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.LabStateStorage = {
    KEYS: KEYS,
    getState: getState,
    saveState: saveState,
    clearState: clearState,
    getRecentLabs: getRecentLabs,
    addRecentLab: addRecentLab,
    getPreferences: getPreferences,
    savePreferences: savePreferences,
    getAllLabStates: getAllLabStates
  };

})();
