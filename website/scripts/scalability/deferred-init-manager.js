/**
 * NV-1100-P10 — Deferred Initialization Manager
 * Heavy subsystems initialize only when needed.
 * Initialization is deterministic, APIs available after init, no race conditions.
 */
(function () {
  'use strict';

  var _subsystems = {};
  var _initPromises = {};

  function register(name, initFn, options) {
    _subsystems[name] = {
      initFn: initFn,
      options: options || {},
      initialized: false,
      error: null
    };
  }

  function initialize(name) {
    if (!_subsystems[name]) return Promise.resolve(false);
    if (_subsystems[name].initialized) return Promise.resolve(true);
    if (_initPromises[name]) return _initPromises[name];

    var startTime = performance.now();
    _initPromises[name] = Promise.resolve()
      .then(function () {
        return _subsystems[name].initFn();
      })
      .then(function () {
        _subsystems[name].initialized = true;
        _subsystems[name].initTimeMs = performance.now() - startTime;

        var perf = window.NeuralVerse?.PerfInstrumentation;
        if (perf && perf.isEnabled()) {
          perf.recordLazyLoad(startTime);
        }

        window.dispatchEvent(new CustomEvent('nv:subsystem-initialized', {
          detail: { name: name, timeMs: _subsystems[name].initTimeMs }
        }));

        return true;
      })
      .catch(function (err) {
        _subsystems[name].error = err;
        _initPromises[name] = null;
        console.warn('DeferredInit: Failed to initialize ' + name + ':', err.message || err);
        return false;
      });

    return _initPromises[name];
  }

  function isInitialized(name) {
    return _subsystems[name] ? _subsystems[name].initialized : false;
  }

  function getInitTime(name) {
    return _subsystems[name] ? _subsystems[name].initTimeMs : null;
  }

  function getAllStatus() {
    var status = {};
    var names = Object.keys(_subsystems);
    for (var i = 0; i < names.length; i++) {
      var s = _subsystems[names[i]];
      status[names[i]] = {
        initialized: s.initialized,
        initTimeMs: s.initTimeMs || null,
        error: s.error ? s.error.message || String(s.error) : null
      };
    }
    return status;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.DeferredInitManager = {
    register: register,
    initialize: initialize,
    isInitialized: isInitialized,
    getInitTime: getInitTime,
    getAllStatus: getAllStatus
  };
})();
