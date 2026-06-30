/**
 * NV-1300-D2 — Research Strategy Builder
 *
 * Produces deterministic research strategies.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 */

var STRATEGY_TYPES = {
  COMPARATIVE_REVIEW: 'comparative_review',
  SYSTEMATIC_OVERVIEW: 'systematic_overview',
  HISTORICAL_EVOLUTION: 'historical_evolution',
  IMPLEMENTATION_ANALYSIS: 'implementation_analysis',
  BENCHMARK_ANALYSIS: 'benchmark_analysis',
  ALGORITHMIC_ANALYSIS: 'algorithmic_analysis',
  SURVEY: 'survey',
  STATE_OF_THE_ART: 'state_of_the_art',
  FAILURE_ANALYSIS: 'failure_analysis',
  DESIGN_PATTERN_ANALYSIS: 'design_pattern_analysis'
};

var STRATEGY_FOR_INTENT = {
  comparative: STRATEGY_TYPES.COMPARATIVE_REVIEW,
  survey: STRATEGY_TYPES.SURVEY,
  historical: STRATEGY_TYPES.HISTORICAL_EVOLUTION,
  implementation: STRATEGY_TYPES.IMPLEMENTATION_ANALYSIS,
  benchmark: STRATEGY_TYPES.BENCHMARK_ANALYSIS,
  algorithmic: STRATEGY_TYPES.ALGORITHMIC_ANALYSIS,
  state_of_the_art: STRATEGY_TYPES.STATE_OF_THE_ART,
  failure: STRATEGY_TYPES.FAILURE_ANALYSIS,
  design_pattern: STRATEGY_TYPES.DESIGN_PATTERN_ANALYSIS
};

var STRATEGY_STEPS = {
  comparative_review: ['identify_entities', 'extract_attributes', 'compare_attributes', 'synthesize_differences'],
  systematic_overview: ['define_scope', 'search_evidence', 'screen_evidence', 'extract_data', 'synthesize'],
  historical_evolution: ['identify_origins', 'trace_milestones', 'analyze_paradigms', 'document_current_state'],
  implementation_analysis: ['identify_requirements', 'analyze_architecture', 'review_code_patterns', 'document_practices'],
  benchmark_analysis: ['identify_datasets', 'identify_metrics', 'collect_results', 'compare_methods'],
  algorithmic_analysis: ['formalize_problem', 'describe_algorithm', 'analyze_complexity', 'review_proofs'],
  survey: ['define_scope', 'categorize_approaches', 'summarize_findings', 'identify_gaps'],
  state_of_the_art: ['identify_recent_advances', 'compare_leading_methods', 'assess_benchmarks', 'identify_open_problems'],
  failure_analysis: ['identify_failure_modes', 'analyze_root_causes', 'document_mitigations', 'suggest_alternatives'],
  design_pattern_analysis: ['identify_problem', 'describe_solution', 'analyze_tradeoffs', 'document_examples']
};

function createResearchStrategyBuilder() {
  var _lastStrategy = null;

  function buildStrategy(intent) {
    var strategyType = STRATEGY_FOR_INTENT[intent] || STRATEGY_TYPES.SURVEY;
    var steps = STRATEGY_STEPS[strategyType] || STRATEGY_STEPS.survey;

    var strategy = {
      type: strategyType,
      intent: intent,
      steps: steps.map(function (s, i) { return { order: i, action: s }; }),
      stepCount: steps.length,
      deterministic: true
    };

    _lastStrategy = strategy;
    return strategy;
  }

  function getLastStrategy() { return _lastStrategy; }
  function reset() { _lastStrategy = null; }

  return {
    buildStrategy: buildStrategy,
    getLastStrategy: getLastStrategy,
    reset: reset,
    STRATEGY_TYPES: STRATEGY_TYPES,
    STRATEGY_FOR_INTENT: STRATEGY_FOR_INTENT,
    STRATEGY_STEPS: STRATEGY_STEPS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createResearchStrategyBuilder = createResearchStrategyBuilder;
}

export { createResearchStrategyBuilder, STRATEGY_TYPES, STRATEGY_STEPS };
