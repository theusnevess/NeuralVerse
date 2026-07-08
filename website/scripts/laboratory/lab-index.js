/**
 * NV-1100-P7 — Laboratory Index Loader
 * Bootstraps the laboratory system: registers all labs, wires persistence.
 */

(function () {
  'use strict';

  var EXPECTED_LAB_COUNT = 10;

  var LAB_FILES = [
    'data/laboratories/linear-regression-lab.js',
    'data/laboratories/logistic-regression-lab.js',
    'data/laboratories/gradient-descent-lab.js',
    'data/laboratories/pca-projection-lab.js',
    'data/laboratories/kmeans-clustering-lab.js',
    'data/laboratories/bayes-rule-lab.js',
    'data/laboratories/embedding-similarity-lab.js',
    'data/laboratories/cosine-similarity-lab.js',
    'data/laboratories/precision-recall-lab.js',
    'data/laboratories/transformer-attention-lab.js'
  ];

  var loaded = false;
  var loading = false;
  var pendingCallbacks = [];

  function loadAllLabs(callback) {
    // Primary: labs are loaded via static script tags in index.html.
    // Fallback: dynamically inject any that are missing.
    var existingLabs = window.NeuralVerse.LabRegistry ? window.NeuralVerse.LabRegistry.getAll().length : 0;

    if (existingLabs >= EXPECTED_LAB_COUNT || loaded) {
      loaded = true;
      if (callback) callback();
      return;
    }

    if (loading) {
      if (callback) pendingCallbacks.push(callback);
      return;
    }

    loading = true;
    if (callback) pendingCallbacks.push(callback);

    var loadedCount = 0;
    var toLoad = LAB_FILES.filter(function (file) {
      return !document.querySelector('script[src*="' + file + '"]');
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
        console.warn('Failed to load lab file: ' + file);
        if (window.NeuralVerse.LabRegistry && window.NeuralVerse.LabRegistry.recordFailure) {
          window.NeuralVerse.LabRegistry.recordFailure(file, 'Script load failed');
        }
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

      var registry = window.NeuralVerse.LabRegistry;
      var health = registry ? registry.healthCheck(EXPECTED_LAB_COUNT) : null;
      if (health) {
        if (window.NV_DEBUG || !health.complete) {
          console.log('Laboratory health: ' + health.loaded + '/' + EXPECTED_LAB_COUNT + ' labs loaded' +
            (health.failedCount > 0 ? ' (' + health.failedCount + ' failed)' : '') +
            (health.duplicates > 0 ? ' (' + health.duplicates + ' duplicates blocked)' : ''));
        }
      }
    });
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.loadAllLabs = loadAllLabs;
  window.NeuralVerse.initLaboratorySystem = initLaboratorySystem;

})();
