/**
 * NV-1100-P10 — Performance Instrumentation
 * Optional local diagnostics for cache hits, cache misses, registry sizes,
 * lookup times, and search timings.
 *
 * Local only, disabled by default, no telemetry, no external transmission.
 */
(function () {
  'use strict';

  var _enabled = false;
  var _metrics = {
    cacheHits: 0,
    cacheMisses: 0,
    registryLookups: 0,
    registryLookupTimeMs: 0,
    searchQueries: 0,
    searchTimeMs: 0,
    indexBuilds: 0,
    indexBuildTimeMs: 0,
    lazyLoads: 0,
    lazyLoadTimeMs: 0
  };

  function enable() { _enabled = true; }
  function disable() { _enabled = false; }
  function isEnabled() { return _enabled; }

  function reset() {
    _metrics.cacheHits = 0;
    _metrics.cacheMisses = 0;
    _metrics.registryLookups = 0;
    _metrics.registryLookupTimeMs = 0;
    _metrics.searchQueries = 0;
    _metrics.searchTimeMs = 0;
    _metrics.indexBuilds = 0;
    _metrics.indexBuildTimeMs = 0;
    _metrics.lazyLoads = 0;
    _metrics.lazyLoadTimeMs = 0;
  }

  function recordCacheHit() { if (_enabled) _metrics.cacheHits++; }
  function recordCacheMiss() { if (_enabled) _metrics.cacheMisses++; }

  function recordRegistryLookup(startTime) {
    if (!_enabled) return;
    _metrics.registryLookups++;
    _metrics.registryLookupTimeMs += (performance.now() - startTime);
  }

  function recordSearchQuery(startTime) {
    if (!_enabled) return;
    _metrics.searchQueries++;
    _metrics.searchTimeMs += (performance.now() - startTime);
  }

  function recordIndexBuild(startTime) {
    if (!_enabled) return;
    _metrics.indexBuilds++;
    _metrics.indexBuildTimeMs += (performance.now() - startTime);
  }

  function recordLazyLoad(startTime) {
    if (!_enabled) return;
    _metrics.lazyLoads++;
    _metrics.lazyLoadTimeMs += (performance.now() - startTime);
  }

  function getMetrics() {
    return {
      enabled: _enabled,
      cacheHits: _metrics.cacheHits,
      cacheMisses: _metrics.cacheMisses,
      cacheHitRate: _metrics.cacheHits + _metrics.cacheMisses > 0
        ? (_metrics.cacheHits / (_metrics.cacheHits + _metrics.cacheMisses) * 100).toFixed(1) + '%'
        : 'N/A',
      registryLookups: _metrics.registryLookups,
      avgRegistryLookupMs: _metrics.registryLookups > 0
        ? (_metrics.registryLookupTimeMs / _metrics.registryLookups).toFixed(2)
        : 'N/A',
      searchQueries: _metrics.searchQueries,
      avgSearchTimeMs: _metrics.searchQueries > 0
        ? (_metrics.searchTimeMs / _metrics.searchQueries).toFixed(2)
        : 'N/A',
      indexBuilds: _metrics.indexBuilds,
      avgIndexBuildMs: _metrics.indexBuilds > 0
        ? (_metrics.indexBuildTimeMs / _metrics.indexBuilds).toFixed(2)
        : 'N/A',
      lazyLoads: _metrics.lazyLoads,
      avgLazyLoadMs: _metrics.lazyLoads > 0
        ? (_metrics.lazyLoadTimeMs / _metrics.lazyLoads).toFixed(2)
        : 'N/A'
    };
  }

  function snapshot() {
    return JSON.parse(JSON.stringify(getMetrics()));
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.PerfInstrumentation = {
    enable: enable,
    disable: disable,
    isEnabled: isEnabled,
    reset: reset,
    recordCacheHit: recordCacheHit,
    recordCacheMiss: recordCacheMiss,
    recordRegistryLookup: recordRegistryLookup,
    recordSearchQuery: recordSearchQuery,
    recordIndexBuild: recordIndexBuild,
    recordLazyLoad: recordLazyLoad,
    getMetrics: getMetrics,
    snapshot: snapshot
  };
})();
