  /**
   * NeuralVerse Memory Export/Import Bridge
   * P1 PersistenceManager integration for memory data.
   * Self-contained IIFE. No eval, no Function, no external requests.
   *
   * Idempotency: merge operations are idempotent. Repeated merge with the
   * same import data produces the same result. This is guaranteed by:
   * - mergeItems uses a byId map keyed on item.id, so duplicate IDs collapse
   *   to the same entry, and newer updatedAt wins deterministically.
   * - mergeCollections uses the same byId pattern.
   * - Preferences are merged via Object.assign (last-write-wins per key).
   * - Session data is fully replaced (not merged) on import.
   */
(function () {
  'use strict';

  var STORAGE_ITEMS_KEY = 'nv_memory_items';
  var STORAGE_COLLECTIONS_KEY = 'nv_memory_collections';
  var STORAGE_PREFS_KEY = 'nv_memory_preferences';
  var STORAGE_SESSION_KEY = 'nv_memory_session';

  function getStorage() {
    return window.NeuralVerse?.MemoryStorage || null;
  }

  function readKey(key) {
    var storage = getStorage();
    if (!storage || typeof storage.getItem !== 'function') return null;
    var raw = storage.getItem(key);
    if (!raw) return null;
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (e) {
      return raw;
    }
  }

  function writeKey(key, value) {
    var storage = getStorage();
    if (!storage || typeof storage.setItem !== 'function') return;
    storage.setItem(key, value);
  }

  function removeKey(key) {
    var storage = getStorage();
    if (!storage || typeof storage.removeItem !== 'function') return;
    storage.removeItem(key);
  }

  function exportMemoryState() {
    return {
      items: readKey(STORAGE_ITEMS_KEY) || [],
      collections: readKey(STORAGE_COLLECTIONS_KEY) || [],
      preferences: readKey(STORAGE_PREFS_KEY) || {},
      session: readKey(STORAGE_SESSION_KEY) || null
    };
  }

  function identityKey(item) {
    if (!item || typeof item !== 'object') return JSON.stringify(item);
    return String(item.id || '');
  }

  function mergeItems(existing, imported) {
    var byId = {};
    for (var i = 0; i < existing.length; i++) {
      var key = identityKey(existing[i]);
      if (key) byId[key] = existing[i];
    }
    for (var j = 0; j < imported.length; j++) {
      var importKey = identityKey(imported[j]);
      if (!importKey) continue;
      if (byId[importKey]) {
        var existDate = new Date(byId[importKey].updatedAt || byId[importKey].createdAt || 0);
        var importDate = new Date(imported[j].updatedAt || imported[j].createdAt || 0);
        if (importDate > existDate) {
          byId[importKey] = imported[j];
        }
      } else {
        byId[importKey] = imported[j];
      }
    }
    var result = [];
    var keys = Object.keys(byId);
    for (var k = 0; k < keys.length; k++) {
      result.push(byId[keys[k]]);
    }
    return result;
  }

  function mergeCollections(existing, imported) {
    var byId = {};
    for (var i = 0; i < existing.length; i++) {
      if (existing[i] && existing[i].id) {
        byId[existing[i].id] = existing[i];
      }
    }
    for (var j = 0; j < imported.length; j++) {
      if (imported[j] && imported[j].id) {
        if (byId[imported[j].id]) {
          var existDate = new Date(byId[imported[j].id].updatedAt || byId[imported[j].id].createdAt || 0);
          var importDate = new Date(imported[j].updatedAt || imported[j].createdAt || 0);
          if (importDate > existDate) {
            byId[imported[j].id] = imported[j];
          }
        } else {
          byId[imported[j].id] = imported[j];
        }
      }
    }
    var result = [];
    var keys = Object.keys(byId);
    for (var k = 0; k < keys.length; k++) {
      result.push(byId[keys[k]]);
    }
    return result;
  }

  function importMemoryState(data, mode) {
    if (!data || typeof data !== 'object') {
      return { success: false, errors: ['Invalid import data'] };
    }

    var safeMode = mode === 'replace' ? 'replace' : 'merge';

    try {
      var importedItems = Array.isArray(data.items) ? data.items : [];
      var importedCollections = Array.isArray(data.collections) ? data.collections : [];
      var importedPrefs = data.preferences && typeof data.preferences === 'object' ? data.preferences : {};
      var importedSession = data.session || null;

      if (safeMode === 'replace') {
        writeKey(STORAGE_ITEMS_KEY, importedItems);
        writeKey(STORAGE_COLLECTIONS_KEY, importedCollections);
        writeKey(STORAGE_PREFS_KEY, importedPrefs);
        if (importedSession) {
          writeKey(STORAGE_SESSION_KEY, importedSession);
        } else {
          removeKey(STORAGE_SESSION_KEY);
        }
      } else {
        var existingItems = readKey(STORAGE_ITEMS_KEY) || [];
        var existingCollections = readKey(STORAGE_COLLECTIONS_KEY) || [];
        var existingPrefs = readKey(STORAGE_PREFS_KEY) || {};

        writeKey(STORAGE_ITEMS_KEY, mergeItems(existingItems, importedItems));
        writeKey(STORAGE_COLLECTIONS_KEY, mergeCollections(existingCollections, importedCollections));

        var mergedPrefs = {};
        var prefKeys = Object.keys(existingPrefs);
        for (var p = 0; p < prefKeys.length; p++) {
          mergedPrefs[prefKeys[p]] = existingPrefs[prefKeys[p]];
        }
        var importPrefKeys = Object.keys(importedPrefs);
        for (var ip = 0; ip < importPrefKeys.length; ip++) {
          mergedPrefs[importPrefKeys[ip]] = importedPrefs[importPrefKeys[ip]];
        }
        writeKey(STORAGE_PREFS_KEY, mergedPrefs);

        if (importedSession) {
          writeKey(STORAGE_SESSION_KEY, importedSession);
        }
      }

      window.dispatchEvent(new CustomEvent('nv:memory_imported', {
        detail: { mode: safeMode, itemCount: importedItems.length }
      }));

      return { success: true, errors: [] };
    } catch (e) {
      return { success: false, errors: ['Import failed: ' + e.message] };
    }
  }

  function integrateWithPersistenceManager() {
    var pm = window.NeuralVerse?.PersistenceManager;
    if (!pm) return false;

    if (pm._memoryIntegrated) return true;

    var originalExport = pm.exportBackup;
    if (typeof originalExport === 'function') {
      pm.exportBackup = function () {
        var payload = originalExport.call(pm);
        if (!payload) return payload;
        payload.memory = exportMemoryState();
        return payload;
      };
    }

    var originalImport = pm.importBackup;
    if (typeof originalImport === 'function') {
      pm.importBackup = function (fileContent, mode) {
        var result = originalImport.call(pm, fileContent, mode);
        try {
          var parsed = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
          if (parsed && parsed.memory) {
            importMemoryState(parsed.memory, mode);
          }
        } catch (e) {
          // Non-fatal: memory import is optional
        }
        return result;
      };
    }

    pm._memoryIntegrated = true;

    window.dispatchEvent(new CustomEvent('nv:memory_exported'));
    return true;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.MemoryExportImport = {
    exportMemoryState: exportMemoryState,
    importMemoryState: importMemoryState,
    integrateWithPersistenceManager: integrateWithPersistenceManager
  };
})();
