/**
 * NV-1300-D2 — Claim Extractor
 *
 * Extracts structured claims from evidence. No paraphrased hallucinations.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 */

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function createClaimExtractor() {
  var _lastClaims = null;
  var _idCounter = 0;

  function _newId() {
    _idCounter++;
    return 'claim-' + _idCounter.toString(36);
  }

  function extractFromEvidence(ranking, maxClaims) {
    var ranked = _safeArray(ranking && ranking.ranked);
    var limit = typeof maxClaims === 'number' ? maxClaims : ranked.length;
    var claims = [];

    for (var i = 0; i < ranked.length && claims.length < limit; i++) {
      var entry = ranked[i];
      if (!entry || !entry.item) continue;
      var content = entry.item.content;
      if (!content) continue;

      var claimText = _safeStr(content.claim || content.text || content.title || content.description, '');
      if (!claimText) continue;

      claims.push({
        id: _newId(),
        claim: claimText,
        source: _safeStr(entry.item.source, 'unknown'),
        refId: _safeStr(entry.item.refId, ''),
        confidence: typeof content.confidence === 'number' ? content.confidence : 0.7,
        evidence: _safeArray(content.evidence).slice(),
        limitations: _safeArray(content.limitations).slice(),
        supportingReferences: [entry.item.refId]
      });
    }

    _lastClaims = claims;
    return claims;
  }

  function getLastClaims() { return _lastClaims; }
  function reset() { _lastClaims = null; _idCounter = 0; }

  return {
    extractFromEvidence: extractFromEvidence,
    getLastClaims: getLastClaims,
    reset: reset
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createClaimExtractor = createClaimExtractor;
}

export { createClaimExtractor };
