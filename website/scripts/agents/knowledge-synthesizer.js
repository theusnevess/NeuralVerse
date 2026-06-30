/**
 * NV-1300-D2 — Knowledge Synthesizer
 *
 * Merges validated claims into deterministic synthesis.
 * Never invents relationships. Never omits conflict information.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 */

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function createKnowledgeSynthesizer() {
  var _lastSynthesis = null;

  function synthesize(claims, consensus, conflicts) {
    var claimArr = _safeArray(claims);
    var consensusObj = consensus || { level: 'insufficient_evidence', confidence: 0 };
    var conflictArr = _safeArray(conflicts);

    var claimIds = claimArr.map(function (c) { return c && c.id; }).filter(function (id) { return id; });
    var conflictIds = conflictArr.map(function (c) { return c && c.type; }).filter(function (t) { return t; });

    var keyFindings = claimArr
      .filter(function (c) { return c && (typeof c.confidence === 'number' ? c.confidence : 0) >= 0.7; })
      .map(function (c) { return { id: c.id, claim: c.claim, confidence: c.confidence }; });

    _lastSynthesis = {
      consensusLevel: _safeStr(consensusObj.level, 'insufficient_evidence'),
      consensusConfidence: typeof consensusObj.confidence === 'number' ? consensusObj.confidence : 0,
      claimCount: claimArr.length,
      claimIds: claimIds,
      conflictCount: conflictArr.length,
      conflictTypes: conflictIds,
      keyFindings: keyFindings,
      hasConflicts: conflictArr.length > 0
    };
    return _lastSynthesis;
  }

  function getLastSynthesis() { return _lastSynthesis; }
  function reset() { _lastSynthesis = null; }

  return {
    synthesize: synthesize,
    getLastSynthesis: getLastSynthesis,
    reset: reset
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createKnowledgeSynthesizer = createKnowledgeSynthesizer;
}

export { createKnowledgeSynthesizer };
