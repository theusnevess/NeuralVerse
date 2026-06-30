/**
 * NV-1300-D1E — Cognitive Load Optimizer
 *
 * Measures and balances cognitive load across lesson sections.
 * Prevents consecutive high-complexity blocks. Inserts relief
 * (visualizations, examples, recaps, laboratories) between heavy
 * sections.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 * No learner inference. No curriculum mutation.
 */

var COMPLEXITY_LEVELS = ['very_low', 'low', 'medium', 'high', 'very_high'];

var COMPLEXITY_WEIGHTS = {
  very_low: 1,
  low: 2,
  medium: 3,
  high: 4,
  very_high: 5
};

var LOAD_CONSTRAINTS = {
  maxConsecutiveHigh: 2,
  maxConsecutiveVeryHigh: 1,
  maxCumulativeLoad: 20,
  preferredReliefTypes: ['visualization', 'example', 'recap', 'laboratory', 'transition']
};

var SECTION_COMPLEXITY_DEFAULTS = {
  motivation: 'low',
  core_explanation: 'medium',
  visualization: 'low',
  mathematics: 'high',
  example: 'medium',
  implementation: 'high',
  laboratory: 'medium',
  limitations: 'low',
  summary: 'low',
  recap: 'very_low'
};

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function _assignComplexity(section) {
  if (typeof section.complexity === 'string') return section.complexity;
  var id = _safeStr(section.id, '');
  return SECTION_COMPLEXITY_DEFAULTS[id] || 'medium';
}

function _complexityWeight(level) {
  return COMPLEXITY_WEIGHTS[level] || 3;
}

function createCognitiveLoadOptimizer() {
  var _lastMetrics = null;

  function measureLoad(plan) {
    var sections = _safeArray(plan && plan.sections);
    var result = [];
    var cumulative = 0;

    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (!s || s.included === false) continue;
      var complexity = _assignComplexity(s);
      var weight = _complexityWeight(complexity);
      cumulative += weight;
      result.push({
        sectionId: _safeStr(s.id, 'section-' + i),
        sectionLabel: _safeStr(s.label || s.title, s.id || 'section-' + i),
        complexity: complexity,
        weight: weight,
        cumulativeLoad: cumulative,
        mediaType: _safeStr(s.mediaType, 'none'),
        hasVisualization: s.hasVisualization === true,
        hasLaboratory: s.hasLaboratory === true,
        hasExample: s.hasExample === true
      });
    }
    return result;
  }

  function _findConsecutiveHeavyLoads(loadMetrics) {
    var violations = [];
    var runStart = -1;
    var runComplexity = '';

    for (var i = 0; i < loadMetrics.length; i++) {
      var m = loadMetrics[i];
      var isHeavy = m.complexity === 'high' || m.complexity === 'very_high';

      if (isHeavy) {
        if (runStart === -1) {
          runStart = i;
          runComplexity = m.complexity;
        } else if (m.complexity === 'very_high' || runComplexity === 'very_high') {
          violations.push({ startIndex: runStart, endIndex: i, length: i - runStart + 1 });
          runStart = i;
          runComplexity = m.complexity;
        }
      } else {
        if (runStart !== -1) {
          var runLength = i - runStart;
          var maxAllowed = runComplexity === 'very_high'
            ? LOAD_CONSTRAINTS.maxConsecutiveVeryHigh
            : LOAD_CONSTRAINTS.maxConsecutiveHigh;
          if (runLength > maxAllowed) {
            violations.push({ startIndex: runStart, endIndex: i - 1, length: runLength });
          }
          runStart = -1;
          runComplexity = '';
        }
      }
    }

    if (runStart !== -1) {
      var tailLen = loadMetrics.length - runStart;
      var maxTail = runComplexity === 'very_high'
        ? LOAD_CONSTRAINTS.maxConsecutiveVeryHigh
        : LOAD_CONSTRAINTS.maxConsecutiveHigh;
      if (tailLen > maxTail) {
        violations.push({ startIndex: runStart, endIndex: loadMetrics.length - 1, length: tailLen });
      }
    }

    return violations;
  }

  function optimizeLoad(plan) {
    var sections = _safeArray(plan && plan.sections).filter(function (s) {
      return s && s.included !== false;
    });
    var loadMetrics = measureLoad(plan);
    var violations = _findConsecutiveHeavyLoads(loadMetrics);

    if (violations.length === 0) {
      return { sections: sections, loadMetrics: loadMetrics, violations: [], adjustments: [] };
    }

    var optimized = sections.map(function (s) { return Object.assign({}, s); });
    var adjustments = [];

    for (var v = 0; v < violations.length; v++) {
      var violation = violations[v];
      var insertAfter = Math.min(violation.endIndex, optimized.length - 1);
      var reliefType = LOAD_CONSTRAINTS.preferredReliefTypes[v % LOAD_CONSTRAINTS.preferredReliefTypes.length];

      var reliefSection = {
        id: 'load-relief-' + v,
        label: 'Cognitive Load Relief',
        type: 'relief',
        complexity: 'very_low',
        mediaType: reliefType === 'visualization' ? 'visualization'
          : reliefType === 'laboratory' ? 'laboratory' : 'none',
        hasVisualization: reliefType === 'visualization',
        hasLaboratory: reliefType === 'laboratory',
        hasExample: reliefType === 'example',
        included: true,
        generated: true,
        generator: 'cognitive-load-optimizer',
        canonicalStatus: 'NonCanonical',
        insertionReason: 'cognitive_load_relief'
      };

      optimized.splice(insertAfter + 1, 0, reliefSection);
      adjustments.push({
        after: violation.endIndex,
        type: reliefType,
        reason: 'consecutive_heavy_load'
      });
    }

    var newMetrics = measureLoad({ sections: optimized });
    return { sections: optimized, loadMetrics: newMetrics, violations: violations, adjustments: adjustments };
  }

  function splitHeavySections(plan) {
    var sections = _safeArray(plan && plan.sections).filter(function (s) {
      return s && s.included !== false;
    });
    var result = [];

    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      var complexity = _assignComplexity(s);
      if (complexity === 'very_high' && s.content && s.content.length > 500) {
        result.push(Object.assign({}, s, { id: s.id + '-part-a', label: _safeStr(s.label, s.id) + ' (Part 1)' }));
        result.push({
          id: s.id + '-part-b',
          label: _safeStr(s.label, s.id) + ' (Part 2)',
          type: s.type,
          complexity: 'high',
          mediaType: 'none',
          included: true,
          generated: true,
          generator: 'cognitive-load-optimizer',
          canonicalStatus: 'NonCanonical',
          insertionReason: 'section_split'
        });
      } else {
        result.push(Object.assign({}, s));
      }
    }
    return result;
  }

  function balanceComplexity(plan) {
    var sections = _safeArray(plan && plan.sections).filter(function (s) {
      return s && s.included !== false;
    });
    var result = [];
    var lastHeavyCount = 0;

    for (var i = 0; i < sections.length; i++) {
      var s = Object.assign({}, sections[i]);
      var complexity = _assignComplexity(s);
      var isHeavy = complexity === 'high' || complexity === 'very_high';

      if (isHeavy) {
        lastHeavyCount++;
        if (lastHeavyCount > LOAD_CONSTRAINTS.maxConsecutiveHigh) {
          s.complexity = 'medium';
          complexity = 'medium';
          isHeavy = false;
        }
      } else {
        lastHeavyCount = 0;
      }
      result.push(s);
    }
    return result;
  }

  function computeLoadMetrics(plan) {
    var loadMetrics = measureLoad(plan);
    var totalWeight = 0;
    var maxWeight = 0;
    var highCount = 0;
    var veryHighCount = 0;

    for (var i = 0; i < loadMetrics.length; i++) {
      var w = loadMetrics[i].weight;
      totalWeight += w;
      if (w > maxWeight) maxWeight = w;
      if (loadMetrics[i].complexity === 'high') highCount++;
      if (loadMetrics[i].complexity === 'very_high') veryHighCount++;
    }

    var avgWeight = loadMetrics.length > 0 ? totalWeight / loadMetrics.length : 0;
    var violations = _findConsecutiveHeavyLoads(loadMetrics);

    var metrics = {
      sectionCount: loadMetrics.length,
      totalWeight: totalWeight,
      averageWeight: Math.round(avgWeight * 100) / 100,
      maxWeight: maxWeight,
      highCount: highCount,
      veryHighCount: veryHighCount,
      violationCount: violations.length,
      loadMetrics: loadMetrics,
      balanced: violations.length === 0
    };
    _lastMetrics = metrics;
    return metrics;
  }

  function validateLoad(plan) {
    var metrics = computeLoadMetrics(plan);
    var errors = [];
    var warnings = [];

    if (metrics.violationCount > 0) {
      errors.push('Found ' + metrics.violationCount + ' consecutive heavy load violations');
    }
    if (metrics.totalWeight > LOAD_CONSTRAINTS.maxCumulativeLoad) {
      warnings.push('Total cumulative load (' + metrics.totalWeight + ') exceeds preferred maximum (' + LOAD_CONSTRAINTS.maxCumulativeLoad + ')');
    }

    return { valid: errors.length === 0, errors: errors, warnings: warnings, metrics: metrics };
  }

  function getLastMetrics() { return _lastMetrics; }
  function reset() { _lastMetrics = null; }

  return {
    measureLoad: measureLoad,
    optimizeLoad: optimizeLoad,
    splitHeavySections: splitHeavySections,
    balanceComplexity: balanceComplexity,
    computeLoadMetrics: computeLoadMetrics,
    validateLoad: validateLoad,
    getLastMetrics: getLastMetrics,
    reset: reset,
    COMPLEXITY_LEVELS: COMPLEXITY_LEVELS,
    COMPLEXITY_WEIGHTS: COMPLEXITY_WEIGHTS,
    LOAD_CONSTRAINTS: LOAD_CONSTRAINTS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createCognitiveLoadOptimizer = createCognitiveLoadOptimizer;
}

export { createCognitiveLoadOptimizer, COMPLEXITY_LEVELS, COMPLEXITY_WEIGHTS, LOAD_CONSTRAINTS };
