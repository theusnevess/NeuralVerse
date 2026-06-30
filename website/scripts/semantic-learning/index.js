/**
 * Semantic Learning Intelligence — Entry Point
 * Initializes the semantic learning subsystem.
 * NV-1100-P9
 */
(function () {
  'use strict';

  var _initialized = false;

  function init() {
    var conceptLayerService = window.NeuralVerse?.conceptLayerService;
    if (!conceptLayerService) {
      return Promise.resolve();
    }

    // Ensure the concept layer index is loaded first
    var initPromise = typeof conceptLayerService.initialize === 'function'
      ? conceptLayerService.initialize()
      : Promise.resolve();

    return initPromise.then(function () {
      return conceptLayerService.getAllConcepts();
    }).then(function (concepts) {
      if (window.NeuralVerse?.SemanticEngine && Array.isArray(concepts)) {
        window.NeuralVerse.SemanticEngine.initialize(concepts);
        _initialized = true;
      }

      window.dispatchEvent(new CustomEvent('nv:semantic-initialized', {
        detail: { conceptCount: window.NeuralVerse?.SemanticEngine?.getConceptCount() || 0 }
      }));
    }).catch(function (err) {
      console.warn('Semantic Learning: Failed to load concepts:', err.message);
    });
  }

  function ensureInitialized() {
    if (window.NeuralVerse?.SemanticEngine?.isInitialized()) return Promise.resolve();
    return init();
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.semanticLearning = {
    init: init,
    ensureInitialized: ensureInitialized,
    isInitialized: function () { return _initialized; }
  };
})();
