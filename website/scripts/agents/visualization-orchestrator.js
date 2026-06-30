/**
 * NV-1300-D1C — Visualization Orchestrator
 *
 * Deterministically selects, scores, and places visualizations
 * within a didactic plan. Every selection is justified and traceable.
 *
 * Visualization appears only when visual explanation > text explanation.
 * Maximum 2 visualizations per explanation.
 *
 * Deterministic. No Math.random. No Date.now.
 */

var VIZ_SELECTION_RULES = {
  conceptCoverage: 0.30,
  semanticProximity: 0.20,
  difficultyCompatibility: 0.15,
  visualExplanatoryPower: 0.15,
  mathematicalSuitability: 0.10,
  laboratoryComplementarity: 0.05,
  canonicalPriority: 0.05
};

var CONCEPT_VIZ_AFFINITY = {
  'word-embeddings': { strong: true, reason: 'Vector space is inherently visual' },
  'self-attention': { strong: true, reason: 'Attention weights are spatially interpretable' },
  'gradient-descent': { strong: true, reason: 'Loss surfaces are geometrically intuitive' },
  'pca': { strong: true, reason: 'Dimensional reduction is a visual transformation' },
  'bayes-theorem': { strong: true, reason: 'Probability regions are visually partitionable' },
  'linear-models': { strong: true, reason: 'Regression lines are directly visual' },
  'sigmoid-function': { strong: true, reason: 'Sigmoid curve is visually distinctive' },
  'convolution': { strong: true, reason: 'Kernel operations are spatially visual' },
  'softmax-function': { strong: true, reason: 'Distribution visualization clarifies behavior' },
  'decision-boundary': { strong: true, reason: 'Classification boundaries are inherently visual' },
  'neural-networks': { strong: false, reason: 'Architecture diagrams help but are not essential' },
  'backpropagation': { strong: false, reason: 'Gradient flow can be visualized but is complex' },
  'loss-functions': { strong: false, reason: 'Loss curves help but text can suffice' },
  'transformer-architecture': { strong: true, reason: 'Attention flow is spatially interpretable' },
  'rag-pipeline': { strong: false, reason: 'Pipeline diagrams help but are not essential' },
  'dense-retrieval': { strong: false, reason: 'Embedding space visualization is helpful' },
  'semantic-search': { strong: false, reason: 'Similarity space can be visualized' },
  'learning-rate-scheduling': { strong: true, reason: 'Convergence paths are visually informative' },
  'optimizers': { strong: true, reason: 'Optimizer trajectories are visually distinct' },
  'pooling': { strong: false, reason: 'Spatial reduction is visual but simple' },
  'batch-normalization': { strong: false, reason: 'Distribution shift is visual but secondary' },
  'regularization': { strong: false, reason: 'Effect on weights is visual but abstract' },
  'dropout': { strong: false, reason: 'Random masking is not strongly visual' },
  'activation-functions': { strong: true, reason: 'Function shapes are visually distinctive' }
};

var MAX_VISUALIZATIONS_PER_PLAN = 2;

function createVisualizationOrchestrator() {
  function _getParametricRegistry() {
    return (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.ParametricRegistry)
      ? window.NeuralVerse.ParametricRegistry
      : null;
  }

  function _getSemanticEngine() {
    return (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.SemanticEngine)
      ? window.NeuralVerse.SemanticEngine
      : null;
  }

  function _getConceptLayer() {
    return (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.conceptLayerService)
      ? window.NeuralVerse.conceptLayerService
      : null;
  }

  function shouldInsertVisualization(plan) {
    if (!plan || typeof plan !== 'object') return false;

    var conceptIds = Array.isArray(plan.conceptIds) ? plan.conceptIds : [];
    if (conceptIds.length === 0) return false;

    var hasVisLayer = false;
    if (Array.isArray(plan.layers)) {
      for (var i = 0; i < plan.layers.length; i++) {
        if (plan.layers[i].id === 'visualization' && plan.layers[i].included) {
          hasVisLayer = true;
          break;
        }
      }
    }

    if (!hasVisLayer) return false;

    var registry = _getParametricRegistry();
    if (!registry) return false;

    var allViz = registry.getAll ? registry.getAll() : [];
    if (allViz.length === 0) return false;

    var scoredCandidates = [];
    for (var c = 0; c < conceptIds.length; c++) {
      var affinity = CONCEPT_VIZ_AFFINITY[conceptIds[c]];
      if (affinity && affinity.strong) {
        for (var v = 0; v < allViz.length; v++) {
          if (allViz[v].concepts && allViz[v].concepts.indexOf(conceptIds[c]) !== -1) {
            scoredCandidates.push(allViz[v]);
          }
        }
      }
    }

    if (scoredCandidates.length === 0) {
      for (var c2 = 0; c2 < conceptIds.length; c2++) {
        for (var v2 = 0; v2 < allViz.length; v2++) {
          if (allViz[v2].concepts && allViz[v2].concepts.indexOf(conceptIds[c2]) !== -1) {
            scoredCandidates.push(allViz[v2]);
          }
        }
      }
    }

    return scoredCandidates.length > 0;
  }

  function scoreVisualization(viz, plan) {
    if (!viz || typeof viz !== 'object') return 0;
    if (!plan || typeof plan !== 'object') return 0;

    var conceptIds = Array.isArray(plan.conceptIds) ? plan.conceptIds : [];
    var difficulty = plan.difficulty || 'standard';
    var labs = plan.selectedResources && plan.selectedResources.laboratories
      ? plan.selectedResources.laboratories : [];

    var conceptCoverage = 0;
    if (viz.concepts && viz.concepts.length > 0) {
      var matched = 0;
      for (var i = 0; i < conceptIds.length; i++) {
        if (viz.concepts.indexOf(conceptIds[i]) !== -1) matched++;
      }
      conceptCoverage = matched / Math.max(conceptIds.length, 1);
    }

    var semanticProximity = 0;
    var engine = _getSemanticEngine();
    if (engine && conceptIds.length > 0 && viz.concepts) {
      var maxProx = 0;
      for (var s = 0; s < conceptIds.length; s++) {
        var related = engine.getRelatedConcepts ? engine.getRelatedConcepts(conceptIds[s]) : [];
        for (var r = 0; r < related.length; r++) {
          if (viz.concepts.indexOf(related[r].id) !== -1 || viz.concepts.indexOf(related[r]) !== -1) {
            maxProx = Math.max(maxProx, 0.7);
          }
        }
      }
      semanticProximity = maxProx;
    }

    var difficultyCompatibility = 0;
    var vizDifficulty = viz.difficulty || 'intermediate';
    var difficultyMap = { essentials: 1, beginner: 2, standard: 3, intermediate: 4, advanced: 5, deep_dive: 5, research_notes: 5 };
    var planLevel = difficultyMap[difficulty] || 3;
    var vizLevel = difficultyMap[vizDifficulty] || 3;
    var diffDelta = Math.abs(planLevel - vizLevel);
    difficultyCompatibility = diffDelta === 0 ? 1.0 : diffDelta === 1 ? 0.7 : diffDelta === 2 ? 0.4 : 0.2;

    var visualExplanatoryPower = 0;
    if (viz.category) {
      var highPowerCategories = ['interactive', 'parametric', 'spatial', 'geometric', 'distribution'];
      for (var p = 0; p < highPowerCategories.length; p++) {
        if (viz.category.toLowerCase().indexOf(highPowerCategories[p]) !== -1) {
          visualExplanatoryPower = 0.9;
          break;
        }
      }
      if (visualExplanatoryPower === 0) visualExplanatoryPower = 0.6;
    }

    var mathematicalSuitability = 0;
    if (plan.sections) {
      var hasMath = false;
      for (var m = 0; m < plan.sections.length; m++) {
        if (plan.sections[m].id === 'mathematics' && plan.sections[m].included) {
          hasMath = true;
          break;
        }
      }
      if (hasMath && viz.concepts) {
        var mathConcepts = ['gradient-descent', 'loss-functions', 'linear-models', 'pca', 'bayes-theorem', 'sigmoid-function'];
        for (var mc = 0; mc < mathConcepts.length; mc++) {
          if (viz.concepts.indexOf(mathConcepts[mc]) !== -1) {
            mathematicalSuitability = 0.8;
            break;
          }
        }
        if (mathematicalSuitability === 0) mathematicalSuitability = 0.4;
      } else {
        mathematicalSuitability = 0.5;
      }
    }

    var labComplementarity = 0;
    if (labs.length > 0 && viz.concepts) {
      for (var l = 0; l < labs.length; l++) {
        var labConcepts = labs[l].concepts || [];
        for (var lc = 0; lc < labConcepts.length; lc++) {
          if (viz.concepts.indexOf(labConcepts[lc]) !== -1) {
            labComplementarity = 0.8;
            break;
          }
        }
        if (labComplementarity > 0) break;
      }
    }

    var canonicalPriority = 0;
    if (viz.canonicalStatus === 'Reviewed') canonicalPriority = 1.0;
    else if (viz.canonicalStatus === 'Draft') canonicalPriority = 0.5;
    else canonicalPriority = 0.3;

    var score =
      conceptCoverage * VIZ_SELECTION_RULES.conceptCoverage +
      semanticProximity * VIZ_SELECTION_RULES.semanticProximity +
      difficultyCompatibility * VIZ_SELECTION_RULES.difficultyCompatibility +
      visualExplanatoryPower * VIZ_SELECTION_RULES.visualExplanatoryPower +
      mathematicalSuitability * VIZ_SELECTION_RULES.mathematicalSuitability +
      labComplementarity * VIZ_SELECTION_RULES.laboratoryComplementarity +
      canonicalPriority * VIZ_SELECTION_RULES.canonicalPriority;

    return Math.round(score * 1000) / 1000;
  }

  function selectVisualization(plan) {
    if (!plan || typeof plan !== 'object') {
      return { selected: [], explanation: 'No plan provided.' };
    }

    var conceptIds = Array.isArray(plan.conceptIds) ? plan.conceptIds : [];
    var registry = _getParametricRegistry();
    if (!registry) {
      return { selected: [], explanation: 'Parametric registry not available.' };
    }

    var allViz = registry.getAll ? registry.getAll() : [];
    if (allViz.length === 0) {
      return { selected: [], explanation: 'No visualizations registered.' };
    }

    var candidates = [];
    var seen = {};
    for (var i = 0; i < conceptIds.length; i++) {
      for (var v = 0; v < allViz.length; v++) {
        if (seen[allViz[v].id]) continue;
        if (allViz[v].concepts && allViz[v].concepts.indexOf(conceptIds[i]) !== -1) {
          var s = scoreVisualization(allViz[v], plan);
          candidates.push({ visualization: allViz[v], score: s, matchedConcept: conceptIds[i] });
          seen[allViz[v].id] = true;
        }
      }
    }

    candidates.sort(function (a, b) { return b.score - a.score; });

    var selected = candidates.slice(0, MAX_VISUALIZATIONS_PER_PLAN);

    var explanation = explainSelection(selected, plan);

    return { selected: selected, explanation: explanation };
  }

  function buildVisualizationPlacement(plan, selectedVisualizations) {
    if (!plan || typeof plan !== 'object') return [];
    if (!Array.isArray(selectedVisualizations) || selectedVisualizations.length === 0) return [];

    var placements = [];
    var visualizationIndex = 0;

    if (Array.isArray(plan.sections)) {
      for (var i = 0; i < plan.sections.length; i++) {
        if (plan.sections[i].id === 'visualization' && plan.sections[i].included) {
          if (visualizationIndex < selectedVisualizations.length) {
            var viz = selectedVisualizations[visualizationIndex];
            placements.push({
              visualizationId: viz.visualization ? viz.visualization.id : viz.id,
              visualizationTitle: viz.visualization ? (viz.visualization.title || viz.visualization.id) : (viz.title || viz.id),
              sectionId: 'visualization',
              position: i,
              insertionType: 'inline',
              matchedConcept: viz.matchedConcept || '',
              score: viz.score || 0,
              reason: _buildPlacementReason(viz, plan)
            });
            visualizationIndex++;
          }
        }
      }
    }

    if (visualizationIndex < selectedVisualizations.length) {
      var lastSectionIdx = plan.sections ? plan.sections.length - 1 : 0;
      for (var j = visualizationIndex; j < selectedVisualizations.length; j++) {
        var vizExtra = selectedVisualizations[j];
        placements.push({
          visualizationId: vizExtra.visualization ? vizExtra.visualization.id : vizExtra.id,
          visualizationTitle: vizExtra.visualization ? (vizExtra.visualization.title || vizExtra.visualization.id) : (vizExtra.title || vizExtra.id),
          sectionId: 'visualization',
          position: lastSectionIdx,
          insertionType: 'append',
          matchedConcept: vizExtra.matchedConcept || '',
          score: vizExtra.score || 0,
          reason: _buildPlacementReason(vizExtra, plan)
        });
      }
    }

    return placements;
  }

  function _buildPlacementReason(vizEntry, plan) {
    var viz = vizEntry.visualization || vizEntry;
    var conceptId = vizEntry.matchedConcept || '';
    var affinity = CONCEPT_VIZ_AFFINITY[conceptId];

    var reasons = [];
    if (affinity && affinity.strong) {
      reasons.push(affinity.reason);
    }
    if (viz.category) {
      reasons.push('Category: ' + viz.category);
    }
    if (conceptId) {
      reasons.push('Matches concept: ' + conceptId);
    }
    if (vizEntry.score > 0.6) {
      reasons.push('High score: ' + vizEntry.score);
    }

    return reasons.length > 0 ? reasons.join('; ') : 'Selected by deterministic scoring';
  }

  function explainSelection(selected, plan) {
    if (!Array.isArray(selected) || selected.length === 0) {
      return 'No visualizations selected. Either no visualizations match the plan concepts, or the visualization layer is not included.';
    }

    var lines = [];
    lines.push('Visualization Selection (' + selected.length + ' of max ' + MAX_VISUALIZATIONS_PER_PLAN + '):');
    for (var i = 0; i < selected.length; i++) {
      var entry = selected[i];
      var viz = entry.visualization || entry;
      lines.push('  ' + (i + 1) + '. ' + (viz.title || viz.id) + ' (score: ' + (entry.score || 0) + ')');
      lines.push('     Concept: ' + (entry.matchedConcept || 'none'));
      if (viz.category) {
        lines.push('     Category: ' + viz.category);
      }
    }

    return lines.join('\n');
  }

  return {
    shouldInsertVisualization: shouldInsertVisualization,
    scoreVisualization: scoreVisualization,
    selectVisualization: selectVisualization,
    buildVisualizationPlacement: buildVisualizationPlacement,
    explainSelection: explainSelection,
    VIZ_SELECTION_RULES: VIZ_SELECTION_RULES,
    CONCEPT_VIZ_AFFINITY: CONCEPT_VIZ_AFFINITY,
    MAX_VISUALIZATIONS_PER_PLAN: MAX_VISUALIZATIONS_PER_PLAN
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createVisualizationOrchestrator = createVisualizationOrchestrator;
}

export { createVisualizationOrchestrator };
