/**
 * Semantic Learning Intelligence — Lab Bridge
 * Connects semantic engine to the Executable Laboratories system (P7).
 *
 * NV-1100-P9
 */
(function () {
  'use strict';

  function getRegistry() {
    return window.NeuralVerse?.LabRegistry || null;
  }

  function getRelatedLabs(conceptId) {
    var registry = getRegistry();
    if (!registry || !conceptId) return [];

    var allLabs = registry.getAll();
    var result = [];
    for (var i = 0; i < allLabs.length; i++) {
      var lab = allLabs[i];
      if (lab.conceptReferences && lab.conceptReferences.indexOf(conceptId) !== -1) {
        result.push({
          id: lab.id,
          name: lab.title || lab.id,
          type: 'laboratory',
          reason: 'Laboratory explores concept: ' + conceptId,
          relationship: 'laboratory_concept',
          slug: lab.slug,
          category: lab.category,
          estimatedDuration: lab.estimatedDuration,
          deterministic: true
        });
      }
    }
    return result;
  }

  function getLabById(labId) {
    var registry = getRegistry();
    if (!registry) return null;
    return registry.get(labId) || null;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.SemanticLabBridge = {
    getRelatedLabs: getRelatedLabs,
    getLabById: getLabById
  };
})();
