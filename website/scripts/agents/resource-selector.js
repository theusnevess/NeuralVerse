/**
 * NV-1300-D1B — Resource Selector
 *
 * Selects canonical support resources for a didactic plan.
 * Validates all IDs. Produces deterministic resource bundles.
 * No randomness. No external state.
 */

function createResourceSelector() {
  function _getConceptLayer() {
    return (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.conceptLayerService)
      ? window.NeuralVerse.conceptLayerService
      : null;
  }

  function _getSharedKnowledge() {
    return (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.sharedKnowledgeService)
      ? window.NeuralVerse.sharedKnowledgeService
      : null;
  }

  function _getParametricRegistry() {
    return (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.ParametricRegistry)
      ? window.NeuralVerse.ParametricRegistry
      : null;
  }

  function _getLabRegistry() {
    return (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.LabRegistry)
      ? window.NeuralVerse.LabRegistry
      : null;
  }

  function _getSemanticEngine() {
    return (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.SemanticEngine)
      ? window.NeuralVerse.SemanticEngine
      : null;
  }

  function selectConcepts(conceptIds) {
    if (!Array.isArray(conceptIds) || conceptIds.length === 0) return [];

    var engine = _getSemanticEngine();
    var result = [];

    for (var i = 0; i < conceptIds.length; i++) {
      var concept = engine ? engine.getConcept(conceptIds[i]) : null;
      if (concept) {
        result.push({
          id: concept.id,
          name: concept.name,
          category: concept.category,
          type: 'concept',
          valid: true
        });
      } else {
        result.push({
          id: conceptIds[i],
          name: conceptIds[i],
          category: '',
          type: 'concept',
          valid: false
        });
      }
    }

    return result;
  }

  function selectArtifacts(artifactIds) {
    if (!Array.isArray(artifactIds) || artifactIds.length === 0) return [];

    var result = [];
    for (var i = 0; i < artifactIds.length; i++) {
      var id = typeof artifactIds[i] === 'string' ? artifactIds[i] : (artifactIds[i].id || '');
      result.push({
        id: id,
        type: 'artifact',
        valid: id.length > 0
      });
    }

    return result;
  }

  function selectVisualizations(conceptIds) {
    if (!Array.isArray(conceptIds) || conceptIds.length === 0) return [];

    var registry = _getParametricRegistry();
    if (!registry) return [];

    var allViz = registry.getAll ? registry.getAll() : [];
    var selected = [];
    var seen = {};

    for (var i = 0; i < conceptIds.length; i++) {
      var conceptId = conceptIds[i];
      for (var v = 0; v < allViz.length; v++) {
        if (seen[allViz[v].id]) continue;
        if (allViz[v].concepts && allViz[v].concepts.indexOf(conceptId) !== -1) {
          selected.push({
            id: allViz[v].id,
            title: allViz[v].title || allViz[v].id,
            category: allViz[v].category || '',
            type: 'visualization',
            valid: true,
            matchedConcept: conceptId
          });
          seen[allViz[v].id] = true;
        }
      }
    }

    return selected;
  }

  function selectLabs(conceptIds) {
    if (!Array.isArray(conceptIds) || conceptIds.length === 0) return [];

    var registry = _getLabRegistry();
    if (!registry) return [];

    var selected = [];
    var seen = {};

    for (var i = 0; i < conceptIds.length; i++) {
      var conceptId = conceptIds[i];
      var labs = registry.getByConcept ? registry.getByConcept(conceptId) : [];
      for (var l = 0; l < labs.length; l++) {
        if (seen[labs[l].id]) continue;
        selected.push({
          id: labs[l].id,
          title: labs[l].title || labs[l].id,
          category: labs[l].category || '',
          type: 'laboratory',
          valid: true,
          matchedConcept: conceptId
        });
        seen[labs[l].id] = true;
      }
    }

    return selected;
  }

  function selectSharedKnowledge(conceptIds) {
    if (!Array.isArray(conceptIds) || conceptIds.length === 0) return [];

    var engine = _getSemanticEngine();
    var selected = [];
    var seen = {};

    for (var i = 0; i < conceptIds.length; i++) {
      var domains = engine ? engine.getSharedKnowledgeDomains(conceptIds[i]) : [];
      for (var d = 0; d < domains.length; d++) {
        var domainId = domains[d].id;
        if (seen[domainId]) continue;
        selected.push({
          id: domainId,
          type: 'sharedKnowledge',
          valid: true,
          matchedConcept: conceptIds[i]
        });
        seen[domainId] = true;
      }
    }

    return selected;
  }

  function buildResourceBundle(plan) {
    if (!plan || typeof plan !== 'object') {
      return { artifacts: [], concepts: [], visualizations: [], laboratories: [], sharedKnowledge: [], warnings: [] };
    }

    var conceptIds = [];
    if (Array.isArray(plan.conceptIds)) {
      conceptIds = plan.conceptIds.slice();
    }

    var artifactIds = [];
    if (Array.isArray(plan.artifactIds)) {
      artifactIds = plan.artifactIds.slice();
    }

    var concepts = selectConcepts(conceptIds);
    var artifacts = selectArtifacts(artifactIds);
    var visualizations = selectVisualizations(conceptIds);
    var laboratories = selectLabs(conceptIds);
    var sharedKnowledge = selectSharedKnowledge(conceptIds);

    var warnings = [];
    var invalidConcepts = concepts.filter(function (c) { return !c.valid; });
    if (invalidConcepts.length > 0) {
      warnings.push('Invalid concept IDs: ' + invalidConcepts.map(function (c) { return c.id; }).join(', '));
    }

    if (conceptIds.length > 0 && visualizations.length === 0) {
      warnings.push('No visualizations found for concepts: ' + conceptIds.join(', '));
    }

    if (conceptIds.length > 0 && laboratories.length === 0) {
      warnings.push('No laboratories found for concepts: ' + conceptIds.join(', '));
    }

    return {
      artifacts: artifacts,
      concepts: concepts,
      visualizations: visualizations,
      laboratories: laboratories,
      sharedKnowledge: sharedKnowledge,
      warnings: warnings
    };
  }

  function validateResourceBundle(bundle) {
    if (!bundle || typeof bundle !== 'object') {
      return { valid: false, errors: ['Bundle is not an object'] };
    }

    var errors = [];

    if (!Array.isArray(bundle.artifacts)) errors.push('artifacts must be an array');
    if (!Array.isArray(bundle.concepts)) errors.push('concepts must be an array');
    if (!Array.isArray(bundle.visualizations)) errors.push('visualizations must be an array');
    if (!Array.isArray(bundle.laboratories)) errors.push('laboratories must be an array');
    if (!Array.isArray(bundle.sharedKnowledge)) errors.push('sharedKnowledge must be an array');
    if (!Array.isArray(bundle.warnings)) errors.push('warnings must be an array');

    var allItems = [].concat(bundle.artifacts, bundle.concepts, bundle.visualizations, bundle.laboratories, bundle.sharedKnowledge);
    var ids = {};
    for (var i = 0; i < allItems.length; i++) {
      if (!allItems[i].id) {
        errors.push('Resource at index ' + i + ' missing id');
      } else if (ids[allItems[i].id]) {
        errors.push('Duplicate resource ID: ' + allItems[i].id);
      } else {
        ids[allItems[i].id] = true;
      }
    }

    return { valid: errors.length === 0, errors: errors };
  }

  return {
    selectConcepts: selectConcepts,
    selectArtifacts: selectArtifacts,
    selectVisualizations: selectVisualizations,
    selectLabs: selectLabs,
    selectSharedKnowledge: selectSharedKnowledge,
    buildResourceBundle: buildResourceBundle,
    validateResourceBundle: validateResourceBundle
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createResourceSelector = createResourceSelector;
}

export { createResourceSelector };
