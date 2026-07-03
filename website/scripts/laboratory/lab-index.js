/**
 * NV-1100-P7 — Laboratory Index Loader
 * Bootstraps the laboratory system: registers all labs, wires persistence.
 */

(function () {
  'use strict';

  var LAB_FILES = [];

  var loaded = false;
  var loading = false;
  var pendingCallbacks = [];

  function loadAllLabs(callback) {
    // Labs are loaded via static script tags in index.html.
    // Check if they're already registered.
    var existingLabs = window.NeuralVerse.LabRegistry ? window.NeuralVerse.LabRegistry.getAll().length : 0;
    if (existingLabs >= LAB_FILES.length || loaded) {
      loaded = true;
      if (callback) callback();
      return;
    }

    if (loading) {
      if (callback) pendingCallbacks.push(callback);
      return;
    }

    // Dynamic fallback: load scripts that haven't been loaded yet
    loading = true;
    if (callback) pendingCallbacks.push(callback);

    var loadedCount = 0;
    var toLoad = LAB_FILES.filter(function (file) {
      return !document.querySelector('script[src="' + file + '"]');
    });

    if (toLoad.length === 0) {
      loaded = true;
      loading = false;
      flushCallbacks();
      return;
    }

    toLoad.forEach(function (file) {
      var script = document.createElement('script');
      script.src = file + '?v=2';
      script.onload = function () {
        loadedCount++;
        if (loadedCount >= toLoad.length) {
          loaded = true;
          loading = false;
          flushCallbacks();
        }
      };
      script.onerror = function () {
        loadedCount++;
        if (loadedCount >= toLoad.length) {
          loaded = true;
          loading = false;
          flushCallbacks();
        }
      };
      document.head.appendChild(script);
    });
  }

  function flushCallbacks() {
    var cbs = pendingCallbacks;
    pendingCallbacks = [];
    cbs.forEach(function (cb) {
      try { cb(); } catch (e) { console.warn('Lab callback error:', e); }
    });
  }

  function initLaboratorySystem() {
    loadAllLabs(function () {
      if (window.NeuralVerse.ExportImportBridge) {
        window.NeuralVerse.ExportImportBridge.integrateWithPersistenceManager();
      }

      var labCount = window.NeuralVerse.LabRegistry ? window.NeuralVerse.LabRegistry.getAll().length : 0;
      if (window.NV_DEBUG) console.log('Laboratory system initialized with ' + labCount + ' labs.');
    });
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.loadAllLabs = loadAllLabs;
  window.NeuralVerse.initLaboratorySystem = initLaboratorySystem;

})();
