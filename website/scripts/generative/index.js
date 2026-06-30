/**
 * NV-1100-P11 — Generative Layer Entry Point
 * Initializes the optional generative layer subsystem.
 */
(function () {
  'use strict';

  var _initialized = false;

  function init() {
    if (_initialized) return;
    if (window.NeuralVerse?.GenerativeController) {
      window.NeuralVerse.GenerativeController.init();
    }
    _initialized = true;

    window.dispatchEvent(new CustomEvent('nv:generative-initialized', {
      detail: { enabled: window.NeuralVerse?.GenerativeController?.isEnabled() || false }
    }));
  }

  function isInitialized() { return _initialized; }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.generativeLayer = {
    init: init,
    isInitialized: isInitialized
  };
})();
