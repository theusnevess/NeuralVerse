/**
 * NV-1100-P9B — Visualization State Storage
 * localStorage persistence for visualization preferences, presets, and recent sessions.
 */
(function () {
  'use strict';

  var KEYS = {
    preferences: 'nv_visualization_preferences',
    presets: 'nv_visualization_presets',
    recent: 'nv_visualization_recent'
  };

  var MAX_RECENT = 20;

  function getStorage() {
    if (window.NeuralVerse && window.NeuralVerse.StorageAdapter &&
        typeof window.NeuralVerse.StorageAdapter === 'object') {
      return window.NeuralVerse.StorageAdapter;
    }
    return null;
  }

  function safeGet(key) {
    try {
      var adapter = getStorage();
      if (adapter && typeof adapter.getItem === 'function') {
        return adapter.getItem(key);
      }
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      var adapter = getStorage();
      if (adapter && typeof adapter.setItem === 'function') {
        adapter.setItem(key, value);
        return true;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function parseJson(raw) {
    if (raw === null || raw === undefined) return null;
    if (typeof raw !== 'string') return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  // --- Preferences ---

  var DEFAULT_PREFERENCES = {
    showGrid: true,
    showAnnotations: true,
    animationSpeed: 'normal',
    colorScheme: 'default'
  };

  function loadPreferences() {
    var raw = safeGet(KEYS.preferences);
    var data = parseJson(raw);
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      var merged = {};
      var defaultKeys = Object.keys(DEFAULT_PREFERENCES);
      for (var i = 0; i < defaultKeys.length; i++) {
        merged[defaultKeys[i]] = DEFAULT_PREFERENCES[defaultKeys[i]];
      }
      var dataKeys = Object.keys(data);
      for (var j = 0; j < dataKeys.length; j++) {
        merged[dataKeys[j]] = data[dataKeys[j]];
      }
      return merged;
    }
    return Object.assign({}, DEFAULT_PREFERENCES);
  }

  function savePreferences(prefs) {
    if (!prefs || typeof prefs !== 'object' || Array.isArray(prefs)) return false;
    return safeSet(KEYS.preferences, JSON.stringify(prefs));
  }

  // --- Presets ---

  function loadPresets() {
    var raw = safeGet(KEYS.presets);
    var data = parseJson(raw);
    return (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  }

  function savePresets(presets) {
    if (!presets || typeof presets !== 'object' || Array.isArray(presets)) return false;
    return safeSet(KEYS.presets, JSON.stringify(presets));
  }

  function savePreset(vizId, name, params) {
    if (typeof vizId !== 'string' || typeof name !== 'string') return false;
    var presets = loadPresets();
    if (!presets[vizId]) presets[vizId] = [];
    presets[vizId].push({
      name: name,
      params: params,
      createdAt: new Date().toISOString()
    });
    return savePresets(presets);
  }

  function deletePreset(vizId, index) {
    var presets = loadPresets();
    if (!presets[vizId] || !Array.isArray(presets[vizId])) return false;
    presets[vizId].splice(index, 1);
    return savePresets(presets);
  }

  function getPresets(vizId) {
    var presets = loadPresets();
    return presets[vizId] || [];
  }

  // --- Recent Sessions ---

  function loadRecent() {
    var raw = safeGet(KEYS.recent);
    var data = parseJson(raw);
    return Array.isArray(data) ? data : [];
  }

  function saveRecent(recent) {
    return safeSet(KEYS.recent, JSON.stringify(recent));
  }

  function addRecent(vizId, title, params) {
    var recent = loadRecent();
    // Remove existing entry for same viz
    recent = recent.filter(function (r) { return r.vizId !== vizId; });
    recent.unshift({
      vizId: vizId,
      title: title || vizId,
      params: params,
      lastOpened: new Date().toISOString()
    });
    if (recent.length > MAX_RECENT) {
      recent = recent.slice(0, MAX_RECENT);
    }
    return saveRecent(recent);
  }

  function getRecent() {
    return loadRecent();
  }

  function clearRecent() {
    return saveRecent([]);
  }

  // --- Favorites ---

  function loadFavorites() {
    var prefs = loadPreferences();
    return Array.isArray(prefs.favorites) ? prefs.favorites : [];
  }

  function toggleFavorite(vizId) {
    var prefs = loadPreferences();
    if (!Array.isArray(prefs.favorites)) prefs.favorites = [];
    var idx = prefs.favorites.indexOf(vizId);
    if (idx === -1) {
      prefs.favorites.push(vizId);
    } else {
      prefs.favorites.splice(idx, 1);
    }
    savePreferences(prefs);
    return prefs.favorites;
  }

  function isFavorite(vizId) {
    var favs = loadFavorites();
    return favs.indexOf(vizId) !== -1;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.VizStateStorage = {
    KEYS: KEYS,
    loadPreferences: loadPreferences,
    savePreferences: savePreferences,
    loadPresets: loadPresets,
    savePresets: savePresets,
    savePreset: savePreset,
    deletePreset: deletePreset,
    getPresets: getPresets,
    loadRecent: loadRecent,
    addRecent: addRecent,
    getRecent: getRecent,
    clearRecent: clearRecent,
    loadFavorites: loadFavorites,
    toggleFavorite: toggleFavorite,
    isFavorite: isFavorite
  };
})();
