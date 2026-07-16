/** NV-1600 — validated browser-local persistence for Research Sessions. */
(function () {
  'use strict';
  var STORAGE_KEY = 'nv_research_sessions';
  var SCHEMA_VERSION = 1;
  var MAX_SESSIONS_PER_LAB = 50;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function id(prefix) { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }
  function adapter() {
    var storage = window.NeuralVerse && window.NeuralVerse.StorageAdapter;
    // ResearchStorage is a synchronous local-session contract. The optional
    // unified adapter exposes promise-returning methods, while retaining this
    // canonical local adapter for synchronous consumers.
    return storage && storage._localStorageAdapter ? storage._localStorageAdapter : storage;
  }
  function read() {
    var store = adapter();
    if (!store) return {};
    try { var value = JSON.parse(store.getItem(STORAGE_KEY) || '{}'); return value && typeof value === 'object' ? value : {}; } catch (e) { return {}; }
  }
  function write(value) { var store = adapter(); if (store) store.setItem(STORAGE_KEY, JSON.stringify(value)); }
  function valid(session) {
    return session && session.version === SCHEMA_VERSION && typeof session.id === 'string' && typeof session.laboratoryId === 'string' && Array.isArray(session.runs) && Array.isArray(session.capturedEvidence);
  }
  function createSession(lab) {
    var now = new Date().toISOString();
    return { id: id('session'), version: SCHEMA_VERSION, laboratoryId: lab.id, laboratorySlug: lab.slug, laboratoryTitle: lab.title, laboratoryContractVersion: lab.version || '1', title: 'Untitled investigation', state: 'draft', createdAt: now, updatedAt: now, researchQuestion: '', hypothesis: { statement: '', rationale: '', status: 'untested' }, variables: { independent: [], dependent: [], controlled: [] }, runs: [], capturedEvidence: [], observations: [], interpretations: [], comparisons: [], limitations: [], conclusion: '', reproducibility: { persistence: 'browser-local only', knownLimitations: [] } };
  }
  function save(session) {
    if (!valid(session)) return false;
    var all = read(); var list = Array.isArray(all[session.laboratoryId]) ? all[session.laboratoryId] : [];
    session.updatedAt = new Date().toISOString();
    var index = list.findIndex(function (item) { return item.id === session.id; });
    if (index >= 0) list[index] = clone(session); else list.unshift(clone(session));
    all[session.laboratoryId] = list.slice(0, MAX_SESSIONS_PER_LAB); write(all); return true;
  }
  function get(labId, sessionId) { var item = (read()[labId] || []).find(function (session) { return session.id === sessionId; }); return valid(item) ? clone(item) : null; }
  function allForLab(labId) { return (read()[labId] || []).filter(valid).map(clone); }
  function remove(labId, sessionId) { var all = read(); all[labId] = (all[labId] || []).filter(function (session) { return session.id !== sessionId; }); write(all); }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.ResearchStorage = { SCHEMA_VERSION: SCHEMA_VERSION, createSession: createSession, saveSession: save, getSession: get, getSessionsForLab: allForLab, deleteSession: remove };
})();
