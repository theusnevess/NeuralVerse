/**
 * NV-1300-D1E — Instructional Pacing Engine
 *
 * Controls exposition rhythm, concept alternation, implementation
 * spacing, mathematical cadence, and recap timing.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 * No learner inference. No curriculum mutation.
 */

var PACING_CONSTRAINTS = {
  maxExpositionBeforeRelief: 3,
  maxMathBeforeIntuition: 2,
  maxImplementationBeforeBreak: 2,
  recapAfterHeavySections: true,
  minSectionsBetweenRecaps: 2,
  breathingPointTypes: ['visualization', 'example', 'laboratory', 'recap', 'transition']
};

var SECTION_PACING_ROLES = {
  motivation: 'exposition',
  core_explanation: 'exposition',
  visualization: 'relief',
  mathematics: 'heavy',
  example: 'relief',
  implementation: 'heavy',
  laboratory: 'relief',
  limitations: 'exposition',
  summary: 'exposition',
  recap: 'relief'
};

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function _pacingRole(section) {
  var id = _safeStr(section && section.id, '');
  return SECTION_PACING_ROLES[id] || 'exposition';
}

function _isRelief(role) {
  return role === 'relief';
}

function _isHeavy(role) {
  return role === 'heavy';
}

function createInstructionalPacingEngine() {
  var _lastPacing = null;

  function buildPacing(plan) {
    var sections = _safeArray(plan && plan.sections).filter(function (s) {
      return s && s.included !== false;
    });

    var pacing = [];
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      var role = _pacingRole(s);
      pacing.push({
        sectionId: _safeStr(s.id, 'section-' + i),
        sectionLabel: _safeStr(s.label || s.title, s.id || 'section-' + i),
        pacingRole: role,
        index: i,
        needsRelief: false,
        isBreathingPoint: _isRelief(role)
      });
    }

    var consecutiveExposition = 0;
    var consecutiveHeavy = 0;
    var lastRecapIndex = -PACING_CONSTRAINTS.minSectionsBetweenRecaps - 1;

    for (var j = 0; j < pacing.length; j++) {
      var p = pacing[j];

      if (_isHeavy(p.pacingRole)) {
        consecutiveHeavy++;
        consecutiveExposition = 0;
        if (consecutiveHeavy > PACING_CONSTRAINTS.maxImplementationBeforeBreak) {
          p.needsRelief = true;
        }
      } else if (_isRelief(p.pacingRole)) {
        consecutiveHeavy = 0;
        consecutiveExposition = 0;
        if (p.pacingRole === 'recap') lastRecapIndex = j;
      } else {
        consecutiveHeavy = 0;
        consecutiveExposition++;
        if (consecutiveExposition > PACING_CONSTRAINTS.maxExpositionBeforeRelief) {
          p.needsRelief = true;
        }
      }
    }

    _lastPacing = { sections: pacing, constraints: PACING_CONSTRAINTS };
    return _lastPacing;
  }

  function insertBreathingPoints(plan) {
    var pacing = buildPacing(plan);
    var sections = _safeArray(plan && plan.sections).filter(function (s) {
      return s && s.included !== false;
    });
    var result = [];
    var breathingCount = 0;

    for (var i = 0; i < sections.length; i++) {
      result.push(Object.assign({}, sections[i]));

      var p = pacing.sections[i];
      if (p && p.needsRelief) {
        var reliefType = PACING_CONSTRAINTS.breathingPointTypes[breathingCount % PACING_CONSTRAINTS.breathingPointTypes.length];
        result.push({
          id: 'breathing-' + breathingCount,
          label: 'Breathing Point',
          type: 'breathing_point',
          pacingRole: 'relief',
          complexity: 'very_low',
          mediaType: reliefType === 'visualization' ? 'visualization'
            : reliefType === 'laboratory' ? 'laboratory' : 'none',
          included: true,
          generated: true,
          generator: 'instructional-pacing-engine',
          canonicalStatus: 'NonCanonical',
          insertionReason: 'pacing_breathing_point'
        });
        breathingCount++;
      }
    }

    return { sections: result, breathingPointsInserted: breathingCount };
  }

  function insertRecaps(plan) {
    var sections = _safeArray(plan && plan.sections).filter(function (s) {
      return s && s.included !== false;
    });
    var result = [];
    var recapCount = 0;
    var lastRecapIndex = -PACING_CONSTRAINTS.minSectionsBetweenRecaps - 1;
    var consecutiveHeavy = 0;

    for (var i = 0; i < sections.length; i++) {
      var s = Object.assign({}, sections[i]);
      result.push(s);

      var role = _pacingRole(s);
      if (_isHeavy(role)) {
        consecutiveHeavy++;
      } else {
        consecutiveHeavy = 0;
      }

      var shouldRecap = false;
      if (consecutiveHeavy >= 2 && (i - lastRecapIndex) >= PACING_CONSTRAINTS.minSectionsBetweenRecaps) {
        shouldRecap = true;
      }
      if (role === 'laboratory' && (i - lastRecapIndex) >= PACING_CONSTRAINTS.minSectionsBetweenRecaps) {
        shouldRecap = true;
      }

      if (shouldRecap) {
        result.push({
          id: 'recap-' + recapCount,
          label: 'Recap',
          type: 'recap',
          pacingRole: 'recap',
          complexity: 'very_low',
          mediaType: 'none',
          included: true,
          generated: true,
          generator: 'instructional-pacing-engine',
          canonicalStatus: 'NonCanonical',
          insertionReason: 'pacing_recap'
        });
        recapCount++;
        lastRecapIndex = result.length - 1;
        consecutiveHeavy = 0;
      }
    }

    return { sections: result, recapsInserted: recapCount };
  }

  function validatePacing(plan) {
    var pacing = buildPacing(plan);
    var errors = [];
    var warnings = [];
    var consecutiveExposition = 0;
    var consecutiveHeavy = 0;

    for (var i = 0; i < pacing.sections.length; i++) {
      var p = pacing.sections[i];
      if (_isHeavy(p.pacingRole)) {
        consecutiveHeavy++;
        consecutiveExposition = 0;
        if (consecutiveHeavy > PACING_CONSTRAINTS.maxImplementationBeforeBreak) {
          errors.push('Too many consecutive heavy sections at index ' + i);
        }
      } else if (_isRelief(p.pacingRole)) {
        consecutiveHeavy = 0;
        consecutiveExposition = 0;
      } else {
        consecutiveHeavy = 0;
        consecutiveExposition++;
        if (consecutiveExposition > PACING_CONSTRAINTS.maxExpositionBeforeRelief) {
          warnings.push('Long exposition run at index ' + i);
        }
      }
    }

    return { valid: errors.length === 0, errors: errors, warnings: warnings, pacing: pacing };
  }

  function getLastPacing() { return _lastPacing; }
  function reset() { _lastPacing = null; }

  return {
    buildPacing: buildPacing,
    insertBreathingPoints: insertBreathingPoints,
    insertRecaps: insertRecaps,
    validatePacing: validatePacing,
    getLastPacing: getLastPacing,
    reset: reset,
    PACING_CONSTRAINTS: PACING_CONSTRAINTS,
    SECTION_PACING_ROLES: SECTION_PACING_ROLES
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createInstructionalPacingEngine = createInstructionalPacingEngine;
}

export { createInstructionalPacingEngine, PACING_CONSTRAINTS, SECTION_PACING_ROLES };
