/**
 * NV-1300-D2 — Source Quality Engine
 *
 * Assigns deterministic quality labels. Never infers quality
 * beyond explicit metadata.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 */

var QUALITY_LABELS = {
  CANONICAL: 'canonical',
  PEER_REVIEWED: 'peer_reviewed',
  CONFERENCE: 'conference',
  PREPRINT: 'preprint',
  IMPLEMENTATION_REFERENCE: 'implementation_reference',
  DOCUMENTATION: 'documentation',
  COMMUNITY_REFERENCE: 'community_reference'
};

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function createSourceQualityEngine() {
  var _lastLabels = null;

  function label(source) {
    var s = _safeStr(source && source.type, '');
    if (s === 'canonical' || s === 'curriculum' || s === 'shared_knowledge') return QUALITY_LABELS.CANONICAL;
    if (s === 'peer_reviewed') return QUALITY_LABELS.PEER_REVIEWED;
    if (s === 'conference') return QUALITY_LABELS.CONFERENCE;
    if (s === 'preprint') return QUALITY_LABELS.PREPRINT;
    if (s === 'implementation' || s === 'code') return QUALITY_LABELS.IMPLEMENTATION_REFERENCE;
    if (s === 'documentation') return QUALITY_LABELS.DOCUMENTATION;
    if (s === 'community' || s === 'blog' || s === 'forum') return QUALITY_LABELS.COMMUNITY_REFERENCE;
    return QUALITY_LABELS.DOCUMENTATION;
  }

  function labelAll(sources) {
    var arr = _safeArray(sources);
    var labels = arr.map(function (s, i) { return { index: i, source: s, label: label(s) }; });
    _lastLabels = labels;
    return labels;
  }

  function getLastLabels() { return _lastLabels; }
  function reset() { _lastLabels = null; }

  return {
    label: label,
    labelAll: labelAll,
    getLastLabels: getLastLabels,
    reset: reset,
    QUALITY_LABELS: QUALITY_LABELS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createSourceQualityEngine = createSourceQualityEngine;
}

export { createSourceQualityEngine, QUALITY_LABELS };
