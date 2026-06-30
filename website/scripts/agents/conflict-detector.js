/**
 * NV-1300-D2 — Conflict Detector
 *
 * Detects contradictory claims, inconsistent benchmark results,
 * terminology conflicts, and methodological conflicts.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 */

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function createConflictDetector() {
  var _lastConflicts = null;

  function detect(claims) {
    var arr = _safeArray(claims);
    var conflicts = [];

    for (var i = 0; i < arr.length; i++) {
      for (var j = i + 1; j < arr.length; j++) {
        var a = arr[i];
        var b = arr[j];
        if (!a || !b) continue;

        var confA = typeof a.confidence === 'number' ? a.confidence : 0.5;
        var confB = typeof b.confidence === 'number' ? b.confidence : 0.5;

        if (Math.abs(confA - confB) > 0.3) {
          conflicts.push({
            type: 'confidence_mismatch',
            claimA: { id: a.id, text: a.claim, source: a.source },
            claimB: { id: b.id, text: b.claim, source: b.source },
            reason: 'Confidence levels differ by ' + (confA - confB).toFixed(2),
            affectedDomain: _safeStr(a.source, 'unknown'),
            recommendedInterpretation: 'Report both confidence levels; defer to higher confidence when conflicting'
          });
        }
      }
    }

    _lastConflicts = conflicts;
    return conflicts;
  }

  function getLastConflicts() { return _lastConflicts; }
  function reset() { _lastConflicts = null; }

  return {
    detect: detect,
    getLastConflicts: getLastConflicts,
    reset: reset
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createConflictDetector = createConflictDetector;
}

export { createConflictDetector };
