/**
 * NV-1300-D2 — Consensus Analyzer
 *
 * Determines consensus level from claims and conflicts.
 * Always evidence-backed.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 */

var CONSENSUS_LEVELS = {
  STRONG: 'strong_consensus',
  MODERATE: 'moderate_consensus',
  LIMITED: 'limited_evidence',
  CONFLICTING: 'conflicting_evidence',
  INSUFFICIENT: 'insufficient_evidence'
};

function _safeArray(v) { return Array.isArray(v) ? v : []; }

function createConsensusAnalyzer() {
  var _lastAnalysis = null;

  function analyze(claims, conflicts) {
    var claimArr = _safeArray(claims);
    var conflictArr = _safeArray(conflicts);

    if (claimArr.length === 0) {
      _lastAnalysis = { level: CONSENSUS_LEVELS.INSUFFICIENT, confidence: 0, claimCount: 0, conflictCount: 0 };
      return _lastAnalysis;
    }

    var totalConfidence = 0;
    for (var i = 0; i < claimArr.length; i++) {
      totalConfidence += (typeof claimArr[i].confidence === 'number' ? claimArr[i].confidence : 0.5);
    }
    var avgConfidence = totalConfidence / claimArr.length;

    var conflictRatio = conflictArr.length / claimArr.length;
    var level;
    if (conflictRatio > 0.3) level = CONSENSUS_LEVELS.CONFLICTING;
    else if (avgConfidence >= 0.8) level = CONSENSUS_LEVELS.STRONG;
    else if (avgConfidence >= 0.6) level = CONSENSUS_LEVELS.MODERATE;
    else if (claimArr.length < 3) level = CONSENSUS_LEVELS.INSUFFICIENT;
    else level = CONSENSUS_LEVELS.LIMITED;

    _lastAnalysis = {
      level: level,
      confidence: Math.round(avgConfidence * 100) / 100,
      claimCount: claimArr.length,
      conflictCount: conflictArr.length,
      conflictRatio: Math.round(conflictRatio * 100) / 100
    };
    return _lastAnalysis;
  }

  function getLastAnalysis() { return _lastAnalysis; }
  function reset() { _lastAnalysis = null; }

  return {
    analyze: analyze,
    getLastAnalysis: getLastAnalysis,
    reset: reset,
    CONSENSUS_LEVELS: CONSENSUS_LEVELS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createConsensusAnalyzer = createConsensusAnalyzer;
}

export { createConsensusAnalyzer, CONSENSUS_LEVELS };
