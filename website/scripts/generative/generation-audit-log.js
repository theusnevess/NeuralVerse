/**
 * NV-1100-P11 — Generation Audit Log
 * Persists generation events for local audit.
 * Does not store full prompts or outputs by default.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'nv_generative_audit_log';
  var MAX_ENTRIES = 500;

  function _load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function _save(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('GenerativeAuditLog: save failed', e);
    }
  }

  var _counter = 0;
  function _nextId() {
    _counter += 1;
    return 'gen-audit-' + Date.now().toString(36) + '-' + _counter.toString(36);
  }

  function log(entry) {
    var entries = _load();
    var record = {
      id: _nextId(),
      timestamp: new Date().toISOString(),
      provider: entry.provider || 'unknown',
      model: entry.model || 'unknown',
      mode: entry.mode || 'unknown',
      contextPackTypes: entry.contextPackTypes || [],
      privacyLevel: entry.privacyLevel || 'current_artifact_only',
      outputClass: entry.outputClass || 'unsupported',
      blocked: typeof entry.blocked === 'boolean' ? entry.blocked : false,
      blockedReasons: entry.blockedReasons || [],
      warningCount: typeof entry.warningCount === 'number' ? entry.warningCount : 0
    };
    entries.push(record);
    if (entries.length > MAX_ENTRIES) {
      entries = entries.slice(entries.length - MAX_ENTRIES);
    }
    _save(entries);
    return record;
  }

  function getAll() { return _load(); }
  function getRecent(count) {
    var entries = _load();
    return entries.slice(-(count || 50));
  }
  function clear() { _save([]); }
  function getCount() { return _load().length; }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.GenerationAuditLog = {
    log: log,
    getAll: getAll,
    getRecent: getRecent,
    clear: clear,
    getCount: getCount,
    STORAGE_KEY: STORAGE_KEY,
    MAX_ENTRIES: MAX_ENTRIES
  };
})();
