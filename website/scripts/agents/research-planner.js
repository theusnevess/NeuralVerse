/**
 * NV-1300-D2 — Research Planner
 *
 * Classifies research intent, determines scope, evidence requirements,
 * and depth. Builds deterministic research plans.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 * No learner inference. No canonical mutation.
 */

var RESEARCH_INTENTS = {
  COMPARATIVE: 'comparative',
  SURVEY: 'survey',
  HISTORICAL: 'historical',
  IMPLEMENTATION: 'implementation',
  BENCHMARK: 'benchmark',
  ALGORITHMIC: 'algorithmic',
  STATE_OF_ART: 'state_of_the_art',
  FAILURE: 'failure',
  DESIGN_PATTERN: 'design_pattern'
};

var DEPTH_PRESETS = {
  overview: { maxClaims: 10, maxSources: 5, sections: ['scope', 'summary', 'references'] },
  standard: { maxClaims: 20, maxSources: 10, sections: ['scope', 'methodology', 'evidence', 'claims', 'conclusion', 'references'] },
  deep_review: { maxClaims: 40, maxSources: 20, sections: ['scope', 'methodology', 'evidence', 'claims', 'consensus', 'conflicts', 'conclusion', 'references'] },
  systematic: { maxClaims: 60, maxSources: 30, sections: ['scope', 'methodology', 'evidence', 'claims', 'consensus', 'conflicts', 'limitations', 'conclusion', 'references'] },
  research_notes: { maxClaims: 15, maxSources: 8, sections: ['scope', 'evidence', 'claims', 'conclusion', 'references'] }
};

function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function _classifyIntent(query) {
  var q = _safeStr(query).toLowerCase();
  if (/compar| vs |versus|diff/.test(q)) return RESEARCH_INTENTS.COMPARATIVE;
  if (/histor|origin|evolution|timeline|milestone/.test(q)) return RESEARCH_INTENTS.HISTORICAL;
  if (/implement|code|practice|how to|build/.test(q)) return RESEARCH_INTENTS.IMPLEMENTATION;
  if (/benchmark|performance|accuracy|metric/.test(q)) return RESEARCH_INTENTS.BENCHMARK;
  if (/algorithm|complexity|theory|math/.test(q)) return RESEARCH_INTENTS.ALGORITHMIC;
  if (/failure|limitation|weakness|problem/.test(q)) return RESEARCH_INTENTS.FAILURE;
  if (/pattern|design|architecture/.test(q)) return RESEARCH_INTENTS.DESIGN_PATTERN;
  if (/state.of.the.art|sota|frontier|latest|current/.test(q)) return RESEARCH_INTENTS.STATE_OF_ART;
  return RESEARCH_INTENTS.SURVEY;
}

function createResearchPlanner() {
  var _lastPlan = null;

  function buildPlan(input) {
    var src = input || {};
    var query = _safeStr(src.query, '');
    var topic = _safeStr(src.topic, query);
    var depth = DEPTH_PRESETS[src.depth] ? src.depth : 'standard';
    var preset = DEPTH_PRESETS[depth];

    var plan = {
      id: 'research-' + depth + '-' + topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40),
      query: query,
      topic: topic,
      intent: _classifyIntent(query),
      depth: depth,
      scope: {
        maxClaims: preset.maxClaims,
        maxSources: preset.maxSources,
        sections: preset.sections.slice()
      },
      evidenceRequirements: {
        requireCanonical: true,
        requirePeerReviewed: depth === 'systematic' || depth === 'deep_review',
        requireBenchmark: /benchmark|performance|accuracy/.test(query.toLowerCase()),
        requireHistorical: depth === 'systematic' || _classifyIntent(query) === RESEARCH_INTENTS.HISTORICAL
      },
      timestamp: null,
      deterministic: true
    };

    _lastPlan = plan;
    return plan;
  }

  function validatePlan(plan) {
    var errors = [];
    if (!plan || !plan.id) errors.push('Plan missing id');
    if (!plan.topic) errors.push('Plan missing topic');
    if (!plan.intent) errors.push('Plan missing intent');
    if (!DEPTH_PRESETS[plan.depth]) errors.push('Invalid depth preset');
    return { valid: errors.length === 0, errors: errors };
  }

  function explainPlan(plan) {
    if (!plan) return 'No plan';
    var lines = [];
    lines.push('Research Plan: ' + plan.id);
    lines.push('  Topic: ' + plan.topic);
    lines.push('  Intent: ' + plan.intent);
    lines.push('  Depth: ' + plan.depth);
    lines.push('  Max Claims: ' + plan.scope.maxClaims);
    lines.push('  Max Sources: ' + plan.scope.maxSources);
    return lines.join('\n');
  }

  function getLastPlan() { return _lastPlan; }
  function reset() { _lastPlan = null; }

  return {
    buildPlan: buildPlan,
    validatePlan: validatePlan,
    explainPlan: explainPlan,
    getLastPlan: getLastPlan,
    reset: reset,
    RESEARCH_INTENTS: RESEARCH_INTENTS,
    DEPTH_PRESETS: DEPTH_PRESETS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createResearchPlanner = createResearchPlanner;
}

export { createResearchPlanner, RESEARCH_INTENTS, DEPTH_PRESETS };
