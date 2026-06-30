/**
 * NV-1300-D1B — Recap Inserter
 *
 * Inserts deterministic recap blocks when prerequisites are missing.
 * Never recursive. Maximum recap depth controlled by difficulty preset.
 * Deterministic. No Math.random. No Date.now.
 */

var RECAP_DEPTH_LIMITS = {
  essentials: 1,
  standard: 2,
  deep_dive: 3,
  research_notes: 3
};

var RECAP_TEMPLATES = {
  motivation: {
    label: 'Prerequisite Recap — Motivation',
    purpose: 'Review why this prerequisite matters before proceeding.',
    template: function (prereqName, childName) {
      return 'Before understanding **' + childName + '**, we need to revisit **' + prereqName + '** — ' +
        'it provides the foundational intuition that makes the next concepts accessible.';
    }
  },
  context: {
    label: 'Prerequisite Recap — Context',
    purpose: 'Position the prerequisite within the learning path.',
    template: function (prereqName, childName) {
      return '**' + prereqName + '** is a prerequisite for **' + childName + '**. ' +
        'Understanding this connection helps build a coherent mental model.';
    }
  },
  intuition: {
    label: 'Prerequisite Recap — Intuition',
    purpose: 'Refresh the mental model of the prerequisite.',
    template: function (prereqName, childName) {
      return 'To grasp **' + childName + '**, we first need to recall the core intuition behind **' + prereqName + '**.';
    }
  }
};

function createRecapInserter() {
  var _lastInsertions = [];

  function needsRecap(conceptId, plan) {
    if (!conceptId || typeof conceptId !== 'string') return false;
    if (!plan || typeof plan !== 'object') return false;

    var difficulty = plan.difficulty || 'standard';
    var maxRecaps = RECAP_DEPTH_LIMITS[difficulty] || 2;

    var planConceptIds = [];
    if (Array.isArray(plan.conceptIds)) {
      planConceptIds = plan.conceptIds.slice();
    }

    var resolver = (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.createSemanticDependencyResolver)
      ? window.NeuralVerse.createSemanticDependencyResolver()
      : null;

    if (!resolver) return false;

    var transitive = resolver.resolveTransitivePrerequisites(conceptId, 3);
    var missingCount = 0;

    for (var i = 0; i < transitive.length; i++) {
      var found = false;
      for (var j = 0; j < planConceptIds.length; j++) {
        if (planConceptIds[j] === transitive[i].id) {
          found = true;
          break;
        }
      }
      if (!found && transitive[i].depth <= 1) {
        missingCount++;
      }
    }

    return missingCount > 0 && missingCount <= maxRecaps;
  }

  function createRecap(prereqId, childId, options) {
    if (!prereqId || !childId) return null;

    var opts = options || {};
    var style = opts.style || 'intuition';
    var depth = typeof opts.depth === 'number' ? opts.depth : 1;

    var engine = (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.SemanticEngine)
      ? window.NeuralVerse.SemanticEngine
      : null;

    var prereqName = prereqId;
    var childName = childId;

    if (engine) {
      var prereqConcept = engine.getConcept(prereqId);
      var childConcept = engine.getConcept(childId);
      if (prereqConcept) prereqName = prereqConcept.name || prereqId;
      if (childConcept) childName = childConcept.name || childId;
    }

    var template = RECAP_TEMPLATES[style] || RECAP_TEMPLATES.intuition;

    return {
      id: 'recap-' + prereqId + '-for-' + childId,
      type: 'recap',
      label: template.label,
      purpose: template.purpose,
      content: template.template(prereqName, childName),
      prereqId: prereqId,
      prereqName: prereqName,
      childId: childId,
      childName: childName,
      depth: depth,
      style: style,
      included: true,
      metadata: {
        sourceType: 'recap',
        sourceId: prereqId,
        reason: 'Prerequisite recap inserted for missing dependency'
      }
    };
  }

  function insertRecaps(plan) {
    if (!plan || typeof plan !== 'object') return plan;

    var difficulty = plan.difficulty || 'standard';
    var maxRecaps = RECAP_DEPTH_LIMITS[difficulty] || 2;

    var conceptIds = [];
    if (Array.isArray(plan.conceptIds)) {
      conceptIds = plan.conceptIds.slice();
    }

    if (conceptIds.length === 0) return plan;

    var resolver = (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.createSemanticDependencyResolver)
      ? window.NeuralVerse.createSemanticDependencyResolver()
      : null;

    if (!resolver) return plan;

    var updated = {};
    var planKeys = Object.keys(plan);
    for (var i = 0; i < planKeys.length; i++) {
      updated[planKeys[i]] = plan[planKeys[i]];
    }

    var recaps = [];
    var coveredPrereqs = {};
    var insertedCount = 0;

    for (var c = 0; c < conceptIds.length && insertedCount < maxRecaps; c++) {
      var transitive = resolver.resolveTransitivePrerequisites(conceptIds[c], 3);

      for (var t = 0; t < transitive.length && insertedCount < maxRecaps; t++) {
        var prereq = transitive[t];
        if (coveredPrereqs[prereq.id]) continue;

        var isInPlan = false;
        for (var p = 0; p < conceptIds.length; p++) {
          if (conceptIds[p] === prereq.id) {
            isInPlan = true;
            break;
          }
        }

        if (!isInPlan && prereq.depth <= 1) {
          var style = prereq.depth === 0 ? 'motivation' : 'intuition';
          var recap = createRecap(prereq.id, conceptIds[c], {
            style: style,
            depth: prereq.depth
          });

          if (recap) {
            recaps.push(recap);
            coveredPrereqs[prereq.id] = true;
            insertedCount++;
          }
        }
      }
    }

    updated.insertedRecaps = recaps;
    updated.recapsCount = recaps.length;

    if (Array.isArray(updated.omissions)) {
      for (var r = 0; r < recaps.length; r++) {
        updated.omissions.push({
          layerId: 'recap',
          reason: 'Recap inserted for prerequisite: ' + recaps[r].prereqName,
          severity: 'info'
        });
      }
    }

    _lastInsertions = recaps;
    return updated;
  }

  function getLastInsertions() {
    return _lastInsertions.slice();
  }

  function getRecapLimits() {
    return {
      essentials: RECAP_DEPTH_LIMITS.essentials,
      standard: RECAP_DEPTH_LIMITS.standard,
      deep_dive: RECAP_DEPTH_LIMITS.deep_dive,
      research_notes: RECAP_DEPTH_LIMITS.research_notes
    };
  }

  return {
    needsRecap: needsRecap,
    createRecap: createRecap,
    insertRecaps: insertRecaps,
    getLastInsertions: getLastInsertions,
    getRecapLimits: getRecapLimits,
    RECAP_DEPTH_LIMITS: RECAP_DEPTH_LIMITS
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createRecapInserter = createRecapInserter;
}

export { createRecapInserter, RECAP_DEPTH_LIMITS };
