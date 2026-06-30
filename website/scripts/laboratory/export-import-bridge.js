/**
 * NV-1100-P7 — Export/Import Bridge
 * Compatibility bridge for laboratory state within NV-1100-P1 export/import.
 */

(function () {
  'use strict';

  var LAB_DATA_KEY = 'nv_lab_state';
  var LAB_RECENT_KEY = 'nv_lab_recent';
  var LAB_PREFS_KEY = 'nv_lab_preferences';

  function readKey(adapter, key) {
    var raw = adapter.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return raw;
    }
  }

  function writeKey(adapter, key, value) {
    if (value === null || value === undefined) {
      adapter.removeItem(key);
    } else {
      adapter.setItem(key, JSON.stringify(value));
    }
  }

  function collectLabState(adapter) {
    return {
      labState: readKey(adapter, LAB_DATA_KEY) || {},
      labRecent: readKey(adapter, LAB_RECENT_KEY) || [],
      labPreferences: readKey(adapter, LAB_PREFS_KEY) || null
    };
  }

  function exportLabState() {
    var adapter = window.NeuralVerse?.StorageAdapter;
    if (!adapter) return null;
    return collectLabState(adapter);
  }

  function importLabState(labData, mode) {
    var adapter = window.NeuralVerse?.StorageAdapter;
    if (!adapter) return { success: false, errors: ['Storage adapter unavailable'] };

    if (!labData || typeof labData !== 'object') {
      return { success: false, errors: ['Invalid laboratory data'] };
    }

    try {
      if (mode === 'replace') {
        writeKey(adapter, LAB_DATA_KEY, labData.labState || {});
        writeKey(adapter, LAB_RECENT_KEY, labData.labRecent || []);
        if (labData.labPreferences) {
          writeKey(adapter, LAB_PREFS_KEY, labData.labPreferences);
        }
      } else {
        // Merge mode
        var existing = readKey(adapter, LAB_DATA_KEY) || {};
        var merged = Object.assign({}, existing, labData.labState || {});
        writeKey(adapter, LAB_DATA_KEY, merged);

        var existingRecent = readKey(adapter, LAB_RECENT_KEY) || [];
        var importedRecent = labData.labRecent || [];
        var byId = {};
        existingRecent.forEach(function (r) { if (r && r.labId) byId[r.labId] = r; });
        importedRecent.forEach(function (r) { if (r && r.labId) byId[r.labId] = r; });
        var mergedRecent = Object.values(byId)
          .sort(function (a, b) { return new Date(b.lastOpened || 0) - new Date(a.lastOpened || 0); })
          .slice(0, 20);
        writeKey(adapter, LAB_RECENT_KEY, mergedRecent);

        if (labData.labPreferences) {
          var existingPrefs = readKey(adapter, LAB_PREFS_KEY) || {};
          writeKey(adapter, LAB_PREFS_KEY, Object.assign({}, existingPrefs, labData.labPreferences));
        }
      }

      window.dispatchEvent(new CustomEvent('nv:lab_state_imported'));
      return { success: true, errors: [] };
    } catch (e) {
      return { success: false, errors: ['Import failed: ' + e.message] };
    }
  }

  function integrateWithPersistenceManager() {
    var pm = window.NeuralVerse?.PersistenceManager;
    if (!pm) return;

    var originalExport = pm.exportBackup;
    if (originalExport && !pm._labIntegrated) {
      pm.exportBackup = function () {
        var payload = originalExport.call(pm);
        if (!payload) return payload;
        payload.laboratory = exportLabState();
        return payload;
      };
    }

    var originalImport = pm.importBackup;
    if (originalImport && !pm._labIntegrated) {
      pm.importBackup = function (fileContent, mode) {
        var result = originalImport.call(pm, fileContent, mode);
        try {
          var parsed = JSON.parse(fileContent);
          if (parsed.laboratory) {
            importLabState(parsed.laboratory, mode);
          }
        } catch (e) {
          // Non-fatal
        }
        return result;
      };
    }

    pm._labIntegrated = true;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.ExportImportBridge = {
    exportLabState: exportLabState,
    importLabState: importLabState,
    integrateWithPersistenceManager: integrateWithPersistenceManager
  };

})();
