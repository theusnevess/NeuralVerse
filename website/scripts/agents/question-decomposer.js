/**
 * NV-1300-D2 — Question Decomposer
 *
 * Splits research questions into deterministic investigation units.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 */

var DECOMPOSITION_TEMPLATES = {
  comparative: ['concepts', 'architectures', 'benchmarks', 'advantages', 'limitations', 'applications'],
  survey: ['overview', 'key_areas', 'methods', 'results', 'open_questions'],
  historical: ['origins', 'key_milestones', 'evolution', 'current_state'],
  implementation: ['requirements', 'architecture', 'code_structure', 'best_practices', 'pitfalls'],
  benchmark: ['datasets', 'metrics', 'results', 'comparisons', 'limitations'],
  algorithmic: ['problem_formulation', 'approach', 'complexity', 'proofs', 'extensions'],
  state_of_the_art: ['recent_advances', 'leading_methods', 'benchmarks', 'open_problems'],
  failure: ['failure_modes', 'root_causes', 'mitigations', 'alternatives'],
  design_pattern: ['problem', 'solution', 'tradeoffs', 'examples', 'anti_patterns']
};

function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function createQuestionDecomposer() {
  var _lastDecomposition = null;

  function decompose(question, intent) {
    var q = _safeStr(question);
    var it = _safeStr(intent, 'survey');
    var template = DECOMPOSITION_TEMPLATES[it] || DECOMPOSITION_TEMPLATES.survey;

    var units = template.map(function (key, i) {
      return {
        id: 'unit-' + i,
        key: key,
        question: q + ' — ' + key.replace(/_/g, ' '),
        order: i
      };
    });

    _lastDecomposition = { question: q, intent: it, units: units, count: units.length };
    return _lastDecomposition;
  }

  function getLastDecomposition() { return _lastDecomposition; }
  function reset() { _lastDecomposition = null; }

  return {
    decompose: decompose,
    getLastDecomposition: getLastDecomposition,
    reset: reset,
    DECOMPOSITION_TEMPLATES: DECOMPOSITION_TEMPLATES
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createQuestionDecomposer = createQuestionDecomposer;
}

export { createQuestionDecomposer, DECOMPOSITION_TEMPLATES };
