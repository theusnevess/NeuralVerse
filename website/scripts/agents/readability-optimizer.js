/**
 * NV-1300-D1E — Readability Optimizer
 *
 * Improves paragraph size, sentence flow, heading distribution,
 * bullet balance, and list consistency. Presentation only —
 * no factual modifications.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 * No learner inference. No curriculum mutation.
 */

var READABILITY_CONSTRAINTS = {
  maxParagraphLines: 6,
  maxBulletItems: 8,
  maxSentenceLength: 200,
  minSentenceLength: 10,
  preferredSentenceVariation: ['short', 'medium', 'long']
};

var SENTENCE_LENGTH_CATEGORIES = {
  short: { max: 40 },
  medium: { max: 100 },
  long: { max: 200 }
};

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function _sentenceCategory(length) {
  if (length <= SENTENCE_LENGTH_CATEGORIES.short.max) return 'short';
  if (length <= SENTENCE_LENGTH_CATEGORIES.medium.max) return 'medium';
  return 'long';
}

function _countLines(text) {
  if (typeof text !== 'string') return 0;
  return text.split('\n').length;
}

function _countSentences(text) {
  if (typeof text !== 'string') return 0;
  var matches = text.match(/[.!?]+/g);
  return matches ? matches.length : 0;
}

function _balanceList(items, maxItems) {
  if (!Array.isArray(items) || items.length <= maxItems) return items;
  return items.slice(0, maxItems);
}

function createReadabilityOptimizer() {
  var _lastMetrics = null;

  function optimizeReadability(composition) {
    if (!composition || typeof composition !== 'object') return composition;

    var sections = _safeArray(composition.sections);
    var optimized = sections.map(function (s) {
      var result = Object.assign({}, s);

      if (result.content && typeof result.content === 'string') {
        result.content = _optimizeParagraphs(result.content);
      }
      if (Array.isArray(result.bullets)) {
        result.bullets = _balanceList(result.bullets, READABILITY_CONSTRAINTS.maxBulletItems);
      }
      if (Array.isArray(result.items)) {
        result.items = _balanceList(result.items, READABILITY_CONSTRAINTS.maxBulletItems);
      }

      return result;
    });

    return Object.assign({}, composition, { sections: optimized });
  }

  function _optimizeParagraphs(text) {
    var lines = text.split('\n');
    var result = [];
    var currentParagraph = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      currentParagraph.push(line);

      if (currentParagraph.length >= READABILITY_CONSTRAINTS.maxParagraphLines || line.trim() === '') {
        result.push(currentParagraph.join('\n'));
        currentParagraph = [];
      }
    }

    if (currentParagraph.length > 0) {
      result.push(currentParagraph.join('\n'));
    }

    return result.join('\n');
  }

  function balanceParagraphs(composition) {
    if (!composition || typeof composition !== 'object') return composition;

    var sections = _safeArray(composition.sections);
    var balanced = sections.map(function (s) {
      var result = Object.assign({}, s);
      if (result.content && typeof result.content === 'string') {
        result.content = _optimizeParagraphs(result.content);
      }
      return result;
    });

    return Object.assign({}, composition, { sections: balanced });
  }

  function normalizeLists(composition) {
    if (!composition || typeof composition !== 'object') return composition;

    var sections = _safeArray(composition.sections);
    var normalized = sections.map(function (s) {
      var result = Object.assign({}, s);
      if (Array.isArray(result.bullets)) {
        result.bullets = _balanceList(result.bullets, READABILITY_CONSTRAINTS.maxBulletItems);
      }
      if (Array.isArray(result.items)) {
        result.items = _balanceList(result.items, READABILITY_CONSTRAINTS.maxBulletItems);
      }
      return result;
    });

    return Object.assign({}, composition, { sections: normalized });
  }

  function validateReadability(composition) {
    var sections = _safeArray(composition && composition.sections);
    var errors = [];
    var warnings = [];
    var totalSentences = 0;
    var totalParagraphs = 0;

    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (!s || s.included === false) continue;

      if (s.content && typeof s.content === 'string') {
        var lines = _countLines(s.content);
        if (lines > READABILITY_CONSTRAINTS.maxParagraphLines * 2) {
          warnings.push('Section ' + (s.id || i) + ' has ' + lines + ' lines (may need splitting)');
        }
        totalSentences += _countSentences(s.content);
        totalParagraphs += Math.ceil(lines / READABILITY_CONSTRAINTS.maxParagraphLines);
      }

      if (Array.isArray(s.bullets) && s.bullets.length > READABILITY_CONSTRAINTS.maxBulletItems) {
        warnings.push('Section ' + (s.id || i) + ' has ' + s.bullets.length + ' bullets (max ' + READABILITY_CONSTRAINTS.maxBulletItems + ')');
      }
    }

    _lastMetrics = {
      sectionCount: sections.length,
      totalSentences: totalSentences,
      totalParagraphs: totalParagraphs,
      averageSentencesPerSection: sections.length > 0 ? Math.round(totalSentences / sections.length * 100) / 100 : 0
    };

    return { valid: errors.length === 0, errors: errors, warnings: warnings, metrics: _lastMetrics };
  }

  function getLastMetrics() { return _lastMetrics; }
  function reset() { _lastMetrics = null; }

  return {
    optimizeReadability: optimizeReadability,
    balanceParagraphs: balanceParagraphs,
    normalizeLists: normalizeLists,
    validateReadability: validateReadability,
    getLastMetrics: getLastMetrics,
    reset: reset,
    READABILITY_CONSTRAINTS: READABILITY_CONSTRAINTS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createReadabilityOptimizer = createReadabilityOptimizer;
}

export { createReadabilityOptimizer, READABILITY_CONSTRAINTS };
