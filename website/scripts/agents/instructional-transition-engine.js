/**
 * NV-1300-D1C — Instructional Transition Engine
 *
 * Generates deterministic transitions between instructional sections.
 * Each transition references previous/next section, dependency reason,
 * and expected learning purpose.
 *
 * Deterministic. No Math.random. No Date.now.
 */

var TRANSITION_TYPES = {
  conceptual: 'Sequential conceptual progression',
  media_to_concept: 'Returning from media to textual explanation',
  concept_to_media: 'Transitioning from explanation to media',
  media_to_media: 'Direct media-to-media transition',
  recap: 'Recap of prerequisite knowledge',
  cross_domain: 'Connection to related domain',
  summary: 'Consolidation of learned material'
};

var SECTION_PURPOSE = {
  motivation: 'Establish relevance and purpose',
  context: 'Position within curriculum',
  intuition: 'Build mental model',
  core_explanation: 'Deliver canonical explanation',
  visualization: 'Provide visual understanding',
  mathematics: 'Present formal definitions',
  algorithm: 'Describe computational steps',
  implementation: 'Show practical patterns',
  laboratory: 'Enable hands-on practice',
  limitations_tradeoffs: 'Discuss failure modes',
  assessment: 'Verify understanding',
  summary: 'Consolidate key takeaways',
  forward_connections: 'Link to next topics',
  misconception: 'Correct common errors',
  inserted_recap: 'Review prerequisite knowledge'
};

function createInstructionalTransitionEngine() {
  function generateTransition(fromSection, toSection, plan) {
    if (!fromSection || !toSection) return null;

    var fromId = fromSection.sectionId || fromSection.id || '';
    var toId = toSection.sectionId || toSection.id || '';
    var fromMedia = fromSection.mediaType || 'none';
    var toMedia = toSection.mediaType || 'none';

    var transitionType = _determineTransitionType(fromMedia, toMedia, fromId, toId);
    var reason = _determineReason(fromId, toId, fromMedia, toMedia, plan);
    var purpose = _determinePurpose(toId, toMedia);

    return {
      from: fromId,
      to: toId,
      fromMedia: fromMedia,
      toMedia: toMedia,
      type: transitionType,
      reason: reason,
      purpose: purpose,
      dependencyReason: _determineDependencyReason(fromId, toId, plan)
    };
  }

  function _determineTransitionType(fromMedia, toMedia, fromId, toId) {
    if (fromMedia !== 'none' && toMedia !== 'none') return 'media_to_media';
    if (fromMedia !== 'none' && toMedia === 'none') return 'media_to_concept';
    if (fromMedia === 'none' && toMedia !== 'none') return 'concept_to_media';

    if (toId === 'inserted_recap') return 'recap';
    if (toId === 'forward_connections') return 'cross_domain';
    if (toId === 'summary') return 'summary';

    return 'conceptual';
  }

  function _determineReason(fromId, toId, fromMedia, toMedia, plan) {
    if (fromMedia !== 'none' && toMedia === 'none') {
      if (fromMedia === 'visualization') {
        return 'Returning to textual explanation after visual exploration of the concept';
      }
      if (fromMedia === 'laboratory') {
        return 'Returning to structured explanation after interactive experimentation';
      }
    }

    if (fromMedia === 'none' && toMedia !== 'none') {
      if (toMedia === 'visualization') {
        return 'Visual representation follows conceptual introduction for deeper spatial understanding';
      }
      if (toMedia === 'laboratory') {
        return 'Hands-on practice follows explanation to reinforce understanding through interaction';
      }
    }

    if (fromMedia === 'visualization' && toMedia === 'laboratory') {
      return 'Moving from visual understanding to interactive experimentation';
    }

    var purposeFrom = SECTION_PURPOSE[fromId] || fromId;
    var purposeTo = SECTION_PURPOSE[toId] || toId;

    return purposeFrom + ' leads naturally into ' + purposeTo;
  }

  function _determinePurpose(toId, toMedia) {
    if (toMedia === 'visualization') {
      return 'Provide visual or spatial understanding of the concept';
    }
    if (toMedia === 'laboratory') {
      return 'Enable interactive exploration and hands-on reinforcement';
    }

    return SECTION_PURPOSE[toId] || 'Continue instructional progression';
  }

  function _determineDependencyReason(fromId, toId, plan) {
    if (!plan) return 'Standard instructional sequence';

    var dependencyChain = plan.dependencyChain || [];
    if (dependencyChain.length > 0) {
      for (var i = 0; i < dependencyChain.length; i++) {
        var dep = dependencyChain[i];
        if (dep.id === toId || dep.name === toId) {
          return 'Depends on: ' + (dep.name || dep.id) + ' (depth ' + (dep.depth || 0) + ')';
        }
      }
    }

    var order = ['motivation', 'context', 'intuition', 'core_explanation', 'visualization',
      'mathematics', 'algorithm', 'implementation', 'laboratory', 'limitations_tradeoffs',
      'assessment', 'summary', 'forward_connections'];

    var fromIdx = order.indexOf(fromId);
    var toIdx = order.indexOf(toId);

    if (fromIdx !== -1 && toIdx !== -1 && toIdx > fromIdx) {
      return 'Sequential dependency: ' + fromId + ' must precede ' + toId;
    }

    return 'Standard instructional sequence';
  }

  function buildSectionTransitions(plan, timeline) {
    if (!Array.isArray(timeline) || timeline.length < 2) return [];

    var transitions = [];
    for (var i = 0; i < timeline.length - 1; i++) {
      var current = timeline[i];
      var next = timeline[i + 1];

      if (!current.included || !next.included) continue;

      var transition = generateTransition(current, next, plan);
      if (transition) {
        transitions.push(transition);
      }
    }

    return transitions;
  }

  function validateTransitions(transitions) {
    if (!Array.isArray(transitions)) {
      return { valid: false, errors: ['transitions must be an array'] };
    }

    var errors = [];

    for (var i = 0; i < transitions.length; i++) {
      var t = transitions[i];
      if (!t.from || typeof t.from !== 'string') {
        errors.push('Transition at index ' + i + ' missing valid from');
      }
      if (!t.to || typeof t.to !== 'string') {
        errors.push('Transition at index ' + i + ' missing valid to');
      }
      if (!t.type || typeof t.type !== 'string') {
        errors.push('Transition at index ' + i + ' missing valid type');
      }
      if (!t.reason || typeof t.reason !== 'string') {
        errors.push('Transition at index ' + i + ' missing valid reason');
      }
      if (!t.purpose || typeof t.purpose !== 'string') {
        errors.push('Transition at index ' + i + ' missing valid purpose');
      }
      if (t.from === t.to) {
        errors.push('Transition at index ' + i + ' is a self-loop: ' + t.from);
      }

      var validTypes = Object.keys(TRANSITION_TYPES);
      if (validTypes.indexOf(t.type) === -1) {
        errors.push('Transition at index ' + i + ' has invalid type: ' + t.type);
      }
    }

    for (var j = 0; j < transitions.length - 1; j++) {
      if (transitions[j].to !== transitions[j + 1].from) {
        errors.push('Transition chain broken at index ' + j + ': ' + transitions[j].to + ' != ' + transitions[j + 1].from);
      }
    }

    return { valid: errors.length === 0, errors: errors };
  }

  return {
    generateTransition: generateTransition,
    buildSectionTransitions: buildSectionTransitions,
    validateTransitions: validateTransitions,
    TRANSITION_TYPES: TRANSITION_TYPES,
    SECTION_PURPOSE: SECTION_PURPOSE
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createInstructionalTransitionEngine = createInstructionalTransitionEngine;
}

export { createInstructionalTransitionEngine };
