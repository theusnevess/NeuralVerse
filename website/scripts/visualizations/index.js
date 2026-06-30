/**
 * NV-1100-P9B — Parametric Visualizations Entry Point
 * Initializes the parametric visualization system.
 */
(function () {
  'use strict';

  var _initialized = false;

  function init() {
    if (_initialized) return;

    var registry = window.NeuralVerse && window.NeuralVerse.ParametricRegistry;
    if (registry && typeof registry.initialize === 'function') {
      registry.initialize();
    }

    var exportImport = window.NeuralVerse && window.NeuralVerse.VizExportImport;
    if (exportImport && typeof exportImport.integrateWithPersistenceManager === 'function') {
      exportImport.integrateWithPersistenceManager();
    }

    _initialized = true;

    window.dispatchEvent(new CustomEvent('nv:viz_initialized', {
      detail: { count: registry ? registry.getCount() : 0 }
    }));
  }

  function isInitialized() {
    return _initialized;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.vizSystem = {
    init: init,
    isInitialized: isInitialized
  };
})();
