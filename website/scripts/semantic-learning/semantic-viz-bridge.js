/**
 * Semantic Learning Intelligence — Visualization Bridge
 * Connects semantic engine to the Parametric Visualizations system (P9B).
 *
 * NV-1100-P9B
 */
(function () {
  'use strict';

  function getRegistry() {
    return window.NeuralVerse?.ParametricRegistry || null;
  }

  function getRelatedVisualizations(conceptId) {
    var registry = getRegistry();
    if (!registry || !conceptId) return [];

    var allDefs = registry.getAll();
    var result = [];
    for (var i = 0; i < allDefs.length; i++) {
      var def = allDefs[i];
      if (def.concepts && def.concepts.indexOf(conceptId) !== -1) {
        result.push({
          id: def.id,
          name: def.title || def.id,
          type: 'visualization',
          reason: 'Visualization explores concept: ' + conceptId,
          relationship: 'visualization_concept',
          slug: def.slug,
          category: def.category,
          deterministic: true
        });
      }
    }
    return result;
  }

  function getVisualizationById(vizId) {
    var registry = getRegistry();
    if (!registry) return null;
    return registry.get(vizId) || null;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.SemanticVizBridge = {
    getRelatedVisualizations: getRelatedVisualizations,
    getVisualizationById: getVisualizationById
  };
})();
