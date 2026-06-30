/**
 * NV-1100-P9B — Visualization Export/Import Bridge
 * Export/import compatibility for visualization state with persistence integration.
 */
(function () {
  'use strict';

  var STORAGE_KEY_EXPORT = 'nv_visualization_export';

  function exportState() {
    var storage = window.NeuralVerse && window.NeuralVerse.VizStateStorage;
    if (!storage) return null;

    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      preferences: storage.loadPreferences(),
      presets: storage.loadPresets(),
      recent: storage.getRecent(),
      favorites: storage.loadFavorites()
    };
  }

  function importState(data, mode) {
    if (!data || typeof data !== 'object') return { success: false, error: 'Invalid import data' };

    var storage = window.NeuralVerse && window.NeuralVerse.VizStateStorage;
    if (!storage) return { success: false, error: 'Storage not available' };

    var validModes = ['replace', 'merge'];
    if (validModes.indexOf(mode) === -1) mode = 'replace';

    try {
      if (mode === 'replace') {
        if (data.preferences) storage.savePreferences(data.preferences);
        if (data.presets) storage.savePresets(data.presets);
        if (data.recent) {
          var recentJson = JSON.stringify(data.recent);
          var adapter = window.NeuralVerse && window.NeuralVerse.StorageAdapter;
          if (adapter && typeof adapter.setItem === 'function') {
            adapter.setItem('nv_visualization_recent', recentJson);
          } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('nv_visualization_recent', recentJson);
          }
        }
        if (data.favorites) {
          var prefs = storage.loadPreferences();
          prefs.favorites = data.favorites;
          storage.savePreferences(prefs);
        }
      } else if (mode === 'merge') {
        var currentPrefs = storage.loadPreferences();
        if (data.preferences) {
          var keys = Object.keys(data.preferences);
          for (var i = 0; i < keys.length; i++) {
            if (keys[i] !== 'favorites') {
              currentPrefs[keys[i]] = data.preferences[keys[i]];
            }
          }
          if (data.preferences.favorites) {
            var currentFavs = Array.isArray(currentPrefs.favorites) ? currentPrefs.favorites : [];
            var newFavs = data.preferences.favorites;
            for (var fi = 0; fi < newFavs.length; fi++) {
              if (currentFavs.indexOf(newFavs[fi]) === -1) {
                currentFavs.push(newFavs[fi]);
              }
            }
            currentPrefs.favorites = currentFavs;
          }
          storage.savePreferences(currentPrefs);
        }

        if (data.presets) {
          var currentPresets = storage.loadPresets();
          var presetKeys = Object.keys(data.presets);
          for (var pi = 0; pi < presetKeys.length; pi++) {
            if (!currentPresets[presetKeys[pi]]) {
              currentPresets[presetKeys[pi]] = data.presets[presetKeys[pi]];
            } else {
              currentPresets[presetKeys[pi]] = currentPresets[presetKeys[pi]].concat(data.presets[presetKeys[pi]]);
            }
          }
          storage.savePresets(currentPresets);
        }

        if (data.recent && Array.isArray(data.recent)) {
          var currentRecent = storage.getRecent();
          var recentMap = {};
          for (var ri = 0; ri < currentRecent.length; ri++) {
            recentMap[currentRecent[ri].vizId] = currentRecent[ri];
          }
          for (var rj = 0; rj < data.recent.length; rj++) {
            recentMap[data.recent[rj].vizId] = data.recent[rj];
          }
          var mergedRecent = Object.values(recentMap);
          mergedRecent.sort(function (a, b) {
            return new Date(b.lastOpened) - new Date(a.lastOpened);
          });
          var adapter2 = window.NeuralVerse && window.NeuralVerse.StorageAdapter;
          if (adapter2 && typeof adapter2.setItem === 'function') {
            adapter2.setItem('nv_visualization_recent', JSON.stringify(mergedRecent.slice(0, 20)));
          } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('nv_visualization_recent', JSON.stringify(mergedRecent.slice(0, 20)));
          }
        }
      }

      window.dispatchEvent(new CustomEvent('nv:viz_state_imported', { detail: { mode: mode } }));
      return { success: true, mode: mode };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  function integrateWithPersistenceManager() {
    var pm = window.NeuralVerse && window.NeuralVerse.PersistenceManager;
    if (!pm || typeof pm.registerExportSource !== 'function') return;

    pm.registerExportSource('visualization', {
      exportData: exportState,
      label: 'Visualization Preferences & Presets'
    });
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.VizExportImport = {
    exportState: exportState,
    importState: importState,
    integrateWithPersistenceManager: integrateWithPersistenceManager
  };
})();
