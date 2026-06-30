/**
 * NeuralVerse Memory Storage
 * localStorage persistence layer for the memory system.
 * Self-contained IIFE. No eval, no Function, no external requests.
 */
(function () {
  'use strict';

  var KEYS = {
    items: 'nv_memory_items',
    collections: 'nv_memory_collections',
    preferences: 'nv_memory_preferences',
    session: 'nv_memory_session'
  };

  var DEFAULT_PREFERENCES = {
    restoreSession: true,
    maxRecent: 20,
    autoPin: false,
    showArchived: false,
    defaultSort: 'updatedAt'
  };

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getStorage() {
    if (
      window.NeuralVerse &&
      window.NeuralVerse.StorageAdapter &&
      typeof window.NeuralVerse.StorageAdapter === 'object'
    ) {
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
      console.error('MemoryStorage: Error reading key "' + key + '":', e.message);
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
      console.error('MemoryStorage: Error writing key "' + key + '":', e.message);
      return false;
    }
  }

  function safeRemove(key) {
    try {
      var adapter = getStorage();
      if (adapter && typeof adapter.removeItem === 'function') {
        adapter.removeItem(key);
        return true;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return true;
      }
      return false;
    } catch (e) {
      console.error('MemoryStorage: Error removing key "' + key + '":', e.message);
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

  function load() {
    var registry =
      window.NeuralVerse && window.NeuralVerse.MemoryRegistry
        ? window.NeuralVerse.MemoryRegistry
        : null;
    if (!registry) {
      console.error('MemoryStorage: MemoryRegistry not loaded.');
      return false;
    }

    var raw = safeGet(KEYS.items);
    var items = parseJson(raw);

    if (!Array.isArray(items)) {
      return false;
    }

    var schema =
      window.NeuralVerse && window.NeuralVerse.MemorySchema
        ? window.NeuralVerse.MemorySchema
        : null;

    var loaded = 0;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item || typeof item.id !== 'string') continue;

      if (registry.hasId(item.id)) {
        try {
          registry.update(item.id, item);
          loaded += 1;
        } catch (e) {
          console.warn('MemoryStorage: Could not update item ' + item.id + ':', e.message);
        }
      } else {
        if (schema) {
          var validation = schema.validate(item);
          if (!validation.valid) {
            console.warn(
              'MemoryStorage: Skipping invalid item ' + item.id + ':',
              validation.errors.join('; ')
            );
            continue;
          }
        }
        try {
          registry.register(item);
          loaded += 1;
        } catch (e) {
          console.warn('MemoryStorage: Could not register item ' + item.id + ':', e.message);
        }
      }
    }

    return loaded > 0;
  }

  function save() {
    var registry =
      window.NeuralVerse && window.NeuralVerse.MemoryRegistry
        ? window.NeuralVerse.MemoryRegistry
        : null;
    if (!registry) {
      console.error('MemoryStorage: MemoryRegistry not loaded.');
      return false;
    }

    var items = registry.getAllIncludingArchived();
    return safeSet(KEYS.items, JSON.stringify(items));
  }

  function saveItem(item) {
    if (!item || typeof item.id !== 'string') return false;
    var registry =
      window.NeuralVerse && window.NeuralVerse.MemoryRegistry
        ? window.NeuralVerse.MemoryRegistry
        : null;
    if (!registry) return false;

    if (registry.hasId(item.id)) {
      try {
        registry.update(item.id, item);
      } catch (e) {
        console.error('MemoryStorage: Could not update item:', e.message);
        return false;
      }
    } else {
      try {
        registry.register(item);
      } catch (e) {
        console.error('MemoryStorage: Could not register item:', e.message);
        return false;
      }
    }

    return save();
  }

  function removeItem(id) {
    if (typeof id !== 'string') return false;
    var registry =
      window.NeuralVerse && window.NeuralVerse.MemoryRegistry
        ? window.NeuralVerse.MemoryRegistry
        : null;
    if (!registry) return false;

    registry.remove(id);
    return save();
  }

  function loadCollections() {
    var raw = safeGet(KEYS.collections);
    var data = parseJson(raw);
    return Array.isArray(data) ? data : [];
  }

  function saveCollections(collections) {
    if (!Array.isArray(collections)) return false;
    return safeSet(KEYS.collections, JSON.stringify(collections));
  }

  function loadPreferences() {
    var raw = safeGet(KEYS.preferences);
    var data = parseJson(raw);

    if (data && typeof data === 'object' && !Array.isArray(data)) {
      var merged = {};
      var defaultKeys = Object.keys(DEFAULT_PREFERENCES);
      for (var d = 0; d < defaultKeys.length; d++) {
        merged[defaultKeys[d]] = DEFAULT_PREFERENCES[defaultKeys[d]];
      }
      var dataKeys = Object.keys(data);
      for (var k = 0; k < dataKeys.length; k++) {
        merged[dataKeys[k]] = data[dataKeys[k]];
      }
      return merged;
    }

    return Object.assign({}, DEFAULT_PREFERENCES);
  }

  function savePreferences(prefs) {
    if (!prefs || typeof prefs !== 'object' || Array.isArray(prefs)) return false;
    return safeSet(KEYS.preferences, JSON.stringify(prefs));
  }

  function loadSession() {
    var raw = safeGet(KEYS.session);
    return parseJson(raw) || null;
  }

  function saveSession(session) {
    if (!session || typeof session !== 'object') return false;
    return safeSet(KEYS.session, JSON.stringify(session));
  }

  function clearSession() {
    return safeRemove(KEYS.session);
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.MemoryStorage = {
    KEYS: KEYS,
    DEFAULT_PREFERENCES: Object.assign({}, DEFAULT_PREFERENCES),
    load: load,
    save: save,
    saveItem: saveItem,
    removeItem: removeItem,
    loadCollections: loadCollections,
    saveCollections: saveCollections,
    loadPreferences: loadPreferences,
    savePreferences: savePreferences,
    loadSession: loadSession,
    saveSession: saveSession,
    clearSession: clearSession
  };
})();
