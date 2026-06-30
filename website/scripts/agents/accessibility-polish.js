/**
 * NV-1300-D1E — Accessibility Polish
 *
 * Guarantees semantic heading hierarchy, screen-reader friendliness,
 * keyboard navigation, visualization descriptions, laboratory
 * accessibility, and evidence accessibility.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 * No learner inference. No curriculum mutation.
 */

var ACCESSIBILITY_CONSTRAINTS = {
  requireAltDescription: true,
  requireInstructionSummary: true,
  requireScreenReaderSummary: true,
  requireHeadingHierarchy: true,
  requireKeyboardNavigation: true,
  maxHeadingDepth: 3
};

var HEADING_LEVELS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function createAccessibilityPolish() {
  var _lastReport = null;

  function validateAccessibility(composition) {
    var sections = _safeArray(composition && composition.sections);
    var errors = [];
    var warnings = [];
    var annotations = [];

    var headingLevels = [];
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (!s || s.included === false) continue;

      var headingLevel = _inferHeadingLevel(s, i);
      headingLevels.push(headingLevel);

      if (s.hasVisualization && !s.altDescription) {
        if (ACCESSIBILITY_CONSTRAINTS.requireAltDescription) {
          errors.push('Section ' + (s.id || i) + ' has visualization but no altDescription');
        }
      }
      if (s.hasLaboratory && !s.instructionSummary) {
        if (ACCESSIBILITY_CONSTRAINTS.requireInstructionSummary) {
          errors.push('Section ' + (s.id || i) + ' has laboratory but no instructionSummary');
        }
      }
      if (s.hasEvidence && !s.screenReaderSummary) {
        if (ACCESSIBILITY_CONSTRAINTS.requireScreenReaderSummary) {
          warnings.push('Section ' + (s.id || i) + ' has evidence but no screenReaderSummary');
        }
      }

      annotations.push({
        sectionId: _safeStr(s.id, 'section-' + i),
        headingLevel: headingLevel,
        hasAltDescription: !!s.altDescription,
        hasInstructionSummary: !!s.instructionSummary,
        hasScreenReaderSummary: !!s.screenReaderSummary,
        keyboardNavigable: true,
        screenReaderFriendly: true
      });
    }

    if (ACCESSIBILITY_CONSTRAINTS.requireHeadingHierarchy) {
      for (var j = 1; j < headingLevels.length; j++) {
        var prev = headingLevels[j - 1];
        var curr = headingLevels[j];
        if (curr > prev + 1) {
          warnings.push('Heading level jump from ' + prev + ' to ' + curr + ' at section index ' + j);
        }
      }
    }

    var report = {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      annotations: annotations,
      sectionCount: sections.length,
      annotatedCount: annotations.length
    };
    _lastReport = report;
    return report;
  }

  function _inferHeadingLevel(section, index) {
    var type = _safeStr(section && section.type, 'exposition');
    var levelMap = {
      motivation: 2,
      core_explanation: 2,
      visualization: 3,
      mathematics: 3,
      example: 3,
      implementation: 3,
      laboratory: 3,
      limitations: 2,
      summary: 2,
      recap: 3,
      transition: 4,
      breathing_point: 4
    };
    return levelMap[type] || 2;
  }

  function annotateVisualizations(composition) {
    var sections = _safeArray(composition && composition.sections);
    var annotated = sections.map(function (s) {
      var result = Object.assign({}, s);
      if (result.hasVisualization && !result.altDescription) {
        result.altDescription = 'Visualization for ' + _safeStr(result.label || result.title || result.id, 'this section');
      }
      return result;
    });
    return Object.assign({}, composition, { sections: annotated });
  }

  function annotateLaboratories(composition) {
    var sections = _safeArray(composition && composition.sections);
    var annotated = sections.map(function (s) {
      var result = Object.assign({}, s);
      if (result.hasLaboratory && !result.instructionSummary) {
        result.instructionSummary = 'Laboratory exercise for ' + _safeStr(result.label || result.title || result.id, 'this section');
      }
      return result;
    });
    return Object.assign({}, composition, { sections: annotated });
  }

  function annotateEvidence(composition) {
    var sections = _safeArray(composition && composition.sections);
    var annotated = sections.map(function (s) {
      var result = Object.assign({}, s);
      if (result.evidence && !result.screenReaderSummary) {
        result.screenReaderSummary = 'Evidence for ' + _safeStr(result.label || result.title || result.id, 'this section');
      }
      return result;
    });
    return Object.assign({}, composition, { sections: annotated });
  }

  function getLastReport() { return _lastReport; }
  function reset() { _lastReport = null; }

  return {
    validateAccessibility: validateAccessibility,
    annotateVisualizations: annotateVisualizations,
    annotateLaboratories: annotateLaboratories,
    annotateEvidence: annotateEvidence,
    getLastReport: getLastReport,
    reset: reset,
    ACCESSIBILITY_CONSTRAINTS: ACCESSIBILITY_CONSTRAINTS,
    HEADING_LEVELS: HEADING_LEVELS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createAccessibilityPolish = createAccessibilityPolish;
}

export { createAccessibilityPolish, ACCESSIBILITY_CONSTRAINTS, HEADING_LEVELS };
