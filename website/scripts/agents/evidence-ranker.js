/**
 * NV-1300-D2 — Evidence Ranker
 *
 * Ranks evidence using deterministic criteria. Rule-based only.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 */

var RANKING_CRITERIA = {
  SOURCE_QUALITY: 'source_quality',
  PUBLICATION_TYPE: 'publication_type',
  CANONICAL_RELEVANCE: 'canonical_relevance',
  CONCEPT_RELEVANCE: 'concept_relevance',
  BENCHMARK_RELEVANCE: 'benchmark_relevance'
};

var SOURCE_QUALITY_SCORES = {
  canonical: 10,
  peer_reviewed: 9,
  conference: 8,
  preprint: 6,
  implementation_reference: 7,
  documentation: 5,
  community_reference: 4
};

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _scoreItem(item) {
  var score = 0;
  if (item && item.source) {
    if (item.source === 'curriculum' || item.source === 'shared_knowledge') score += SOURCE_QUALITY_SCORES.canonical;
    else if (item.source === 'external' && item.content && item.content.quality) {
      score += SOURCE_QUALITY_SCORES[item.content.quality] || SOURCE_QUALITY_SCORES.community_reference;
    } else {
      score += SOURCE_QUALITY_SCORES.documentation;
    }
  }
  if (item && item.content && item.content.relevance) {
    score += item.content.relevance;
  }
  if (item && item.content && item.content.citationCount) {
    score += Math.min(item.content.citationCount / 100, 3);
  }
  return score;
}

function createEvidenceRanker() {
  var _lastRanking = null;

  function rank(collection) {
    var items = _safeArray(collection && collection.items);
    var scored = items.map(function (item, i) {
      return { index: i, item: item, score: _scoreItem(item) };
    });

    scored.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    });

    _lastRanking = { ranked: scored, count: scored.length, deterministic: true };
    return _lastRanking;
  }

  function getLastRanking() { return _lastRanking; }
  function reset() { _lastRanking = null; }

  return {
    rank: rank,
    getLastRanking: getLastRanking,
    reset: reset,
    RANKING_CRITERIA: RANKING_CRITERIA,
    SOURCE_QUALITY_SCORES: SOURCE_QUALITY_SCORES
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createEvidenceRanker = createEvidenceRanker;
}

export { createEvidenceRanker, RANKING_CRITERIA, SOURCE_QUALITY_SCORES };
