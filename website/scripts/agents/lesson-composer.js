/**
 * NV-1300-D1E — Lesson Composer
 *
 * Central lesson assembler. Receives all planner outputs and generates
 * the final instructional structure with narrative cohesion,
 * composition quality, and deterministic ordering.
 *
 * Pure, deterministic. No Math.random. No Date.now.
 * No learner inference. No curriculum mutation.
 */

var COMPOSITION_CONSTRAINTS = {
  standardSections: ['motivation', 'core_explanation', 'visualization', 'mathematics', 'example', 'implementation', 'laboratory', 'limitations', 'summary'],
  requiredFields: ['id', 'label', 'type', 'included'],
  maxSectionsPerLesson: 20,
  minSectionsPerLesson: 3
};

var SECTION_TYPES = {
  MOTIVATION: 'motivation',
  CORE_EXPLANATION: 'core_explanation',
  VISUALIZATION: 'visualization',
  MATHEMATICS: 'mathematics',
  EXAMPLE: 'example',
  IMPLEMENTATION: 'implementation',
  LABORATORY: 'laboratory',
  LIMITATIONS: 'limitations',
  SUMMARY: 'summary',
  RECAP: 'recap',
  TRANSITION: 'transition',
  BREATHING_POINT: 'breathing_point'
};

function _safeArray(v) { return Array.isArray(v) ? v : []; }
function _safeStr(v, fallback) { return typeof v === 'string' ? v : (fallback || ''); }

function _buildOutline(sections) {
  var outline = [];
  for (var i = 0; i < sections.length; i++) {
    var s = sections[i];
    if (!s || s.included === false) continue;
    outline.push({
      position: outline.length,
      id: _safeStr(s.id, 'section-' + i),
      label: _safeStr(s.label || s.title, s.id || 'section-' + i),
      type: _safeStr(s.type, 'exposition'),
      hasMedia: s.mediaType !== 'none' && !!s.mediaType,
      complexity: _safeStr(s.complexity, 'medium')
    });
  }
  return outline;
}

function _buildNarrative(sections, plan) {
  var narrative = [];
  var topic = _safeStr(plan && plan.topic, 'the topic');

  for (var i = 0; i < sections.length; i++) {
    var s = sections[i];
    if (!s || s.included === false) continue;

    var transition = null;
    if (i > 0 && sections[i - 1] && sections[i - 1].included !== false) {
      var prev = sections[i - 1];
      transition = {
        from: _safeStr(prev.id, 'previous'),
        to: _safeStr(s.id, 'current'),
        type: _safeStr(s.transitionType, 'conceptual')
      };
    }

    narrative.push({
      sectionId: _safeStr(s.id, 'section-' + i),
      sectionLabel: _safeStr(s.label || s.title, s.id),
      purpose: _safeStr(s.purpose, 'explain'),
      transition: transition,
      hasVisualization: s.hasVisualization === true,
      hasLaboratory: s.hasLaboratory === true,
      hasExample: s.hasExample === true
    });
  }

  return narrative;
}

function createLessonComposer() {
  var _lastComposition = null;

  function composeLesson(plan) {
    var sections = _safeArray(plan && plan.sections).filter(function (s) {
      return s && s.included !== false;
    });

    if (sections.length === 0) {
      return { valid: false, errors: ['No included sections'], sections: [], outline: [], narrative: [] };
    }

    var outline = _buildOutline(sections);
    var narrative = _buildNarrative(sections, plan);

    var composition = {
      valid: true,
      topic: _safeStr(plan && plan.topic, ''),
      sectionCount: sections.length,
      sections: sections.map(function (s, i) {
        return {
          id: _safeStr(s.id, 'section-' + i),
          label: _safeStr(s.label || s.title, s.id),
          type: _safeStr(s.type, 'exposition'),
          complexity: _safeStr(s.complexity, 'medium'),
          mediaType: _safeStr(s.mediaType, 'none'),
          hasVisualization: s.hasVisualization === true,
          hasLaboratory: s.hasLaboratory === true,
          hasExample: s.hasExample === true,
          included: true,
          position: i
        };
      }),
      outline: outline,
      narrative: narrative,
      planId: _safeStr(plan && plan.id, 'unknown'),
      generatedAt: null
    };

    _lastComposition = composition;
    return composition;
  }

  function composeSections(plan) {
    var composition = composeLesson(plan);
    return composition.sections;
  }

  function composeNarrative(plan) {
    var composition = composeLesson(plan);
    return composition.narrative;
  }

  function buildOutline(plan) {
    var composition = composeLesson(plan);
    return composition.outline;
  }

  function finalizeComposition(composition) {
    if (!composition || typeof composition !== 'object') {
      return { valid: false, errors: ['Invalid composition'] };
    }

    var errors = [];
    var warnings = [];

    if (!Array.isArray(composition.sections) || composition.sections.length === 0) {
      errors.push('Composition has no sections');
    }
    if (composition.sections && composition.sections.length > COMPOSITION_CONSTRAINTS.maxSectionsPerLesson) {
      warnings.push('Section count (' + composition.sections.length + ') exceeds recommended maximum');
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      composition: composition
    };
  }

  function getLastComposition() { return _lastComposition; }
  function reset() { _lastComposition = null; }

  return {
    composeLesson: composeLesson,
    composeSections: composeSections,
    composeNarrative: composeNarrative,
    buildOutline: buildOutline,
    finalizeComposition: finalizeComposition,
    getLastComposition: getLastComposition,
    reset: reset,
    COMPOSITION_CONSTRAINTS: COMPOSITION_CONSTRAINTS,
    SECTION_TYPES: SECTION_TYPES
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createLessonComposer = createLessonComposer;
}

export { createLessonComposer, COMPOSITION_CONSTRAINTS, SECTION_TYPES };
