/**
 * NV-1300-D1C — Media Orchestrator
 *
 * Central coordinator for visualization and laboratory orchestration.
 * Builds a complete media plan, validates it, balances density,
 * and produces a deterministic media timeline.
 *
 * Deterministic. No Math.random. No Date.now.
 */

function createMediaOrchestrator(deps) {
  var visualizationOrchestrator = deps && deps.visualizationOrchestrator;
  var laboratoryPlacer = deps && deps.laboratoryPlacer;
  var transitionEngine = deps && deps.transitionEngine;
  var densityOptimizer = deps && deps.densityOptimizer;

  function _validateMediaPlan(mediaPlan) {
    var errors = [];

    if (!mediaPlan || typeof mediaPlan !== 'object') {
      return { valid: false, errors: ['Media plan is not an object'] };
    }

    if (!Array.isArray(mediaPlan.visualizations)) {
      errors.push('visualizations must be an array');
    }
    if (!mediaPlan.laboratory || typeof mediaPlan.laboratory !== 'object') {
      if (mediaPlan.laboratory !== null) {
        errors.push('laboratory must be an object or null');
      }
    }
    if (!Array.isArray(mediaPlan.timeline)) {
      errors.push('timeline must be an array');
    }
    if (!Array.isArray(mediaPlan.transitions)) {
      errors.push('transitions must be an array');
    }
    if (!mediaPlan.densityMetrics || typeof mediaPlan.densityMetrics !== 'object') {
      errors.push('densityMetrics must be an object');
    }
    if (!Array.isArray(mediaPlan.evidence)) {
      errors.push('evidence must be an array');
    }

    var vizCount = Array.isArray(mediaPlan.visualizations) ? mediaPlan.visualizations.length : 0;
    if (vizCount > 2) {
      errors.push('Maximum 2 visualizations per plan, got ' + vizCount);
    }

    var labCount = mediaPlan.laboratory ? 1 : 0;
    if (labCount > 1) {
      errors.push('Maximum 1 laboratory per plan');
    }

    return { valid: errors.length === 0, errors: errors };
  }

  function _buildTimeline(plan, vizPlacements, labPlacement) {
    var timeline = [];

    if (Array.isArray(plan.sections)) {
      for (var i = 0; i < plan.sections.length; i++) {
        var section = plan.sections[i];
        var entry = {
          sectionId: section.id,
          sectionLabel: section.label || section.id,
          position: i,
          mediaType: 'none',
          mediaId: null,
          mediaTitle: null,
          included: section.included !== false
        };

        if (section.id === 'visualization' && Array.isArray(vizPlacements)) {
          for (var v = 0; v < vizPlacements.length; v++) {
            if (vizPlacements[v].position === i) {
              entry.mediaType = 'visualization';
              entry.mediaId = vizPlacements[v].visualizationId;
              entry.mediaTitle = vizPlacements[v].visualizationTitle;
              break;
            }
          }
        }

        if (section.id === 'laboratory' && labPlacement && labPlacement.position === i) {
          entry.mediaType = 'laboratory';
          entry.mediaId = labPlacement.laboratoryId;
          entry.mediaTitle = labPlacement.laboratoryTitle;
        }

        timeline.push(entry);
      }
    }

    return timeline;
  }

  function _buildTransitions(plan, timeline) {
    if (transitionEngine && typeof transitionEngine.buildSectionTransitions === 'function') {
      return transitionEngine.buildSectionTransitions(plan, timeline);
    }

    var transitions = [];
    for (var i = 0; i < timeline.length - 1; i++) {
      var current = timeline[i];
      var next = timeline[i + 1];

      if (!current.included || !next.included) continue;

      transitions.push({
        from: current.sectionId,
        to: next.sectionId,
        fromMedia: current.mediaType,
        toMedia: next.mediaType,
        type: current.mediaType !== 'none' || next.mediaType !== 'none' ? 'media-transition' : 'conceptual',
        reason: _inferTransitionReason(current, next)
      });
    }

    return transitions;
  }

  function _inferTransitionReason(from, to) {
    if (from.mediaType === 'visualization' && to.mediaType === 'none') {
      return 'Returning to textual explanation after visual exploration';
    }
    if (from.mediaType === 'none' && to.mediaType === 'visualization') {
      return 'Transitioning to visual representation of concept';
    }
    if (from.mediaType === 'none' && to.mediaType === 'laboratory') {
      return 'Transitioning from explanation to hands-on practice';
    }
    if (from.mediaType === 'laboratory' && to.mediaType === 'none') {
      return 'Returning to structured explanation after laboratory';
    }
    if (from.mediaType === 'visualization' && to.mediaType === 'laboratory') {
      return 'Moving from visual understanding to interactive experimentation';
    }
    return 'Sequential progression through instructional sections';
  }

  function _buildDensityMetrics(timeline) {
    var totalSections = 0;
    var mediaSections = 0;
    var vizCount = 0;
    var labCount = 0;
    var consecutiveMedia = 0;
    var maxConsecutiveMedia = 0;

    for (var i = 0; i < timeline.length; i++) {
      if (!timeline[i].included) continue;
      totalSections++;

      if (timeline[i].mediaType !== 'none') {
        mediaSections++;
        consecutiveMedia++;
        if (consecutiveMedia > maxConsecutiveMedia) {
          maxConsecutiveMedia = consecutiveMedia;
        }
        if (timeline[i].mediaType === 'visualization') vizCount++;
        if (timeline[i].mediaType === 'laboratory') labCount++;
      } else {
        consecutiveMedia = 0;
      }
    }

    return {
      totalSections: totalSections,
      mediaSections: mediaSections,
      visualizationCount: vizCount,
      laboratoryCount: labCount,
      densityRatio: totalSections > 0 ? Math.round((mediaSections / totalSections) * 100) / 100 : 0,
      maxConsecutiveMedia: maxConsecutiveMedia,
      balanced: maxConsecutiveMedia <= 1
    };
  }

  function _buildEvidence(plan, vizPlacements, labPlacement, vizSelection, labResult) {
    var evidence = [];
    var conceptIds = Array.isArray(plan.conceptIds) ? plan.conceptIds : [];

    for (var c = 0; c < conceptIds.length; c++) {
      evidence.push({
        type: 'concept',
        id: conceptIds[c],
        reason: 'Concept reference for media orchestration'
      });
    }

    if (Array.isArray(vizPlacements)) {
      for (var v = 0; v < vizPlacements.length; v++) {
        evidence.push({
          type: 'visualization',
          id: vizPlacements[v].visualizationId,
          reason: vizPlacements[v].reason || 'Selected by visualization orchestrator',
          matchedConcept: vizPlacements[v].matchedConcept,
          score: vizPlacements[v].score
        });
      }
    }

    if (labPlacement) {
      evidence.push({
        type: 'laboratory',
        id: labPlacement.laboratoryId,
        reason: labPlacement.reason || 'Selected by laboratory placer',
        matchedConcept: labPlacement.matchedConcept,
        score: labPlacement.score,
        role: labPlacement.role
      });
    }

    return evidence;
  }

  function buildMediaPlan(plan) {
    if (!plan || typeof plan !== 'object') {
      return {
        visualizations: [],
        laboratory: null,
        vizPlacements: [],
        labPlacement: null,
        timeline: [],
        transitions: [],
        densityMetrics: { totalSections: 0, mediaSections: 0, visualizationCount: 0, laboratoryCount: 0, densityRatio: 0, maxConsecutiveMedia: 0, balanced: true },
        evidence: [],
        warnings: ['No plan provided to media orchestrator.'],
        valid: false
      };
    }

    var vizResult = { selected: [], explanation: '' };
    if (visualizationOrchestrator) {
      vizResult = visualizationOrchestrator.selectVisualization(plan);
    }

    var vizPlacements = [];
    if (visualizationOrchestrator && Array.isArray(vizResult.selected) && vizResult.selected.length > 0) {
      vizPlacements = visualizationOrchestrator.buildVisualizationPlacement(plan, vizResult.selected);
    }

    var labResult = { selected: null, role: null, explanation: '' };
    if (laboratoryPlacer) {
      labResult = laboratoryPlacer.selectLaboratory(plan);
    }

    var labPlacement = null;
    if (laboratoryPlacer && labResult.selected) {
      labPlacement = laboratoryPlacer.buildPlacement(plan, labResult);
    }

    var timeline = _buildTimeline(plan, vizPlacements, labPlacement);

    if (densityOptimizer && typeof densityOptimizer.balance === 'function') {
      timeline = densityOptimizer.balance(timeline);
    }

    var transitions = _buildTransitions(plan, timeline);

    var densityMetrics = _buildDensityMetrics(timeline);

    var evidence = _buildEvidence(plan, vizPlacements, labPlacement, vizResult, labResult);

    var warnings = [];
    if (!vizResult.selected || vizResult.selected.length === 0) {
      if (plan.layers) {
        for (var l = 0; l < plan.layers.length; l++) {
          if (plan.layers[l].id === 'visualization' && plan.layers[l].included) {
            warnings.push('Visualization layer included but no suitable visualization found.');
            break;
          }
        }
      }
    }
    if (!labResult.selected) {
      if (plan.layers) {
        for (var l2 = 0; l2 < plan.layers.length; l2++) {
          if (plan.layers[l2].id === 'laboratory' && plan.layers[l2].included) {
            warnings.push('Laboratory layer included but no suitable laboratory found.');
            break;
          }
        }
      }
    }

    var mediaPlan = {
      visualizations: vizPlacements.map(function (p) {
        return { id: p.visualizationId, title: p.visualizationTitle, score: p.score, reason: p.reason };
      }),
      laboratory: labPlacement ? {
        id: labPlacement.laboratoryId,
        title: labPlacement.laboratoryTitle,
        role: labPlacement.role,
        score: labPlacement.score,
        reason: labPlacement.reason
      } : null,
      vizPlacements: vizPlacements,
      labPlacement: labPlacement,
      timeline: timeline,
      transitions: transitions,
      densityMetrics: densityMetrics,
      evidence: evidence,
      warnings: warnings,
      vizSelectionExplanation: vizResult.explanation || '',
      labSelectionExplanation: labResult.explanation || ''
    };

    var validation = _validateMediaPlan(mediaPlan);
    mediaPlan.valid = validation.valid;
    mediaPlan.validationErrors = validation.errors;

    return mediaPlan;
  }

  function validateMediaPlan(mediaPlan) {
    return _validateMediaPlan(mediaPlan);
  }

  function getMediaTimeline(mediaPlan) {
    if (!mediaPlan || !Array.isArray(mediaPlan.timeline)) return [];
    return mediaPlan.timeline.slice();
  }

  return {
    buildMediaPlan: buildMediaPlan,
    validateMediaPlan: validateMediaPlan,
    getMediaTimeline: getMediaTimeline
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createMediaOrchestrator = createMediaOrchestrator;
}

export { createMediaOrchestrator };
