/**
 * NV-1300-D1A-F1 — Example Provider
 *
 * Compatibility abstraction for example retrieval.
 * Decouples consumers from the Example Registry implementation.
 *
 * Current: delegates to Example Registry.
 * Future: will transparently delegate to Concept Layer.
 *
 * No API changes required when migration occurs.
 * No randomness. No external state. Deterministic.
 */

function createExampleProvider(deps) {
  var exampleRegistry = deps && deps.exampleRegistry ? deps.exampleRegistry : null;
  var conceptLayerService = deps && deps.conceptLayerService ? deps.conceptLayerService : null;

  function _getRegistry() {
    if (exampleRegistry) return exampleRegistry;
    if (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.createExampleRegistry) {
      return window.NeuralVerse.createExampleRegistry();
    }
    return null;
  }

  function _getConceptLayer() {
    if (conceptLayerService) return conceptLayerService;
    if (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.conceptLayerService) {
      return window.NeuralVerse.conceptLayerService;
    }
    return null;
  }

  function getExamplesForConcept(conceptId) {
    if (!conceptId || typeof conceptId !== 'string') return [];
    var registry = _getRegistry();
    if (!registry) return [];
    return registry.getExamplesByConcept(conceptId);
  }

  function getExamplesForArtifact(artifactId) {
    if (!artifactId || typeof artifactId !== 'string') return [];
    var registry = _getRegistry();
    if (!registry) return [];

    var allExamples = registry.getAllExamples();
    var result = [];
    for (var i = 0; i < allExamples.length; i++) {
      var ex = allExamples[i];
      if (ex.artifactIds && ex.artifactIds.indexOf(artifactId) !== -1) {
        result.push(ex);
      }
    }
    return result;
  }

  function getExamplesByDifficulty(difficulty) {
    if (!difficulty || typeof difficulty !== 'string') return [];
    var registry = _getRegistry();
    if (!registry) return [];
    return registry.getExamplesByDifficulty(difficulty);
  }

  function getExamplesByCategory(category) {
    if (!category || typeof category !== 'string') return [];
    var registry = _getRegistry();
    if (!registry) return [];
    return registry.getExamplesByCategory(category);
  }

  function getAllExamples() {
    var registry = _getRegistry();
    if (!registry) return [];
    return registry.getAllExamples();
  }

  function searchExamples(query) {
    if (!query || typeof query !== 'string') return [];
    var registry = _getRegistry();
    if (!registry) return [];
    return registry.searchExamples(query);
  }

  function getExample(id) {
    if (!id || typeof id !== 'string') return null;
    var registry = _getRegistry();
    if (!registry) return null;
    return registry.getExample(id);
  }

  function getCount() {
    var registry = _getRegistry();
    if (!registry) return 0;
    return registry.getCount();
  }

  function getSource() {
    return 'example-registry';
  }

  return {
    getExamplesForConcept: getExamplesForConcept,
    getExamplesForArtifact: getExamplesForArtifact,
    getExamplesByDifficulty: getExamplesByDifficulty,
    getExamplesByCategory: getExamplesByCategory,
    getAllExamples: getAllExamples,
    searchExamples: searchExamples,
    getExample: getExample,
    getCount: getCount,
    getSource: getSource
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createExampleProvider = createExampleProvider;
}

export { createExampleProvider };
