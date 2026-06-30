/**
 * NV-1100-P9B — Parametric Visualization Registry
 * Central registry for deterministic parametric visualizations.
 * Provides lookup, search, cross-validation, and index access.
 */
(function () {
  'use strict';

  var _registry = {};
  var _definitions = [];
  var _index = [];
  var _initialized = false;
  var _slugIndex = {};
  var _categoryIndex = {};
  var _conceptIndex = {};

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function normalizeText(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function initialize() {
    var definitions = window.NeuralVerse && window.NeuralVerse.VisualizationDefinitions
      ? window.NeuralVerse.VisualizationDefinitions
      : [];

    if (!Array.isArray(definitions) || definitions.length === 0) {
      return false;
    }

    _registry = {};
    _definitions = [];
    _index = [];
    _slugIndex = {};
    _categoryIndex = {};
    _conceptIndex = {};

    for (var i = 0; i < definitions.length; i++) {
      var def = definitions[i];
      if (!def || typeof def.id !== 'string') continue;

      _registry[def.id] = def;
      _definitions.push(def);

      if (def.slug) _slugIndex[def.slug] = def;

      if (def.category) {
        if (!_categoryIndex[def.category]) _categoryIndex[def.category] = [];
        _categoryIndex[def.category].push(def.id);
      }

      if (Array.isArray(def.concepts)) {
        for (var c = 0; c < def.concepts.length; c++) {
          var cid = def.concepts[c];
          if (!_conceptIndex[cid]) _conceptIndex[cid] = [];
          _conceptIndex[cid].push(def.id);
        }
      }

      _index.push({
        id: def.id,
        type: 'visualization',
        badgeLabel: 'Visualization',
        title: def.title,
        summary: def.summary || '',
        href: '#/visualizations/' + def.slug,
        breadcrumbs: ['Visualizations', def.title],
        searchableText: normalizeText(
          def.id + ' ' +
          def.title + ' ' +
          def.slug + ' ' +
          (def.summary || '') + ' ' +
          (def.category || '') + ' ' +
          (def.concepts || []).join(' ') + ' ' +
          (def.artifactReferences || []).join(' ') +
          ' visualization parametric interactive'
        ),
        category: def.category || '',
        concepts: def.concepts || []
      });
    }

    _initialized = true;
    return true;
  }

  function isInitialized() {
    return _initialized;
  }

  function getDefinition(id) {
    return _registry[id] || null;
  }

  function getDefinitionBySlug(slug) {
    return _slugIndex[slug] || null;
  }

  function getAll() {
    return _definitions.slice();
  }

  function getByCategory(category) {
    var ids = _categoryIndex[category] || [];
    var result = [];
    for (var i = 0; i < ids.length; i++) {
      if (_registry[ids[i]]) result.push(_registry[ids[i]]);
    }
    return result;
  }

  function getCategories() {
    var cats = {};
    for (var i = 0; i < _definitions.length; i++) {
      cats[_definitions[i].category] = true;
    }
    return Object.keys(cats);
  }

  function search(query) {
    var normalized = normalizeText(query);
    if (!normalized) return [];

    var terms = normalized.split(/\s+/).filter(Boolean);
    var results = [];

    for (var i = 0; i < _index.length; i++) {
      var entry = _index[i];
      var score = 0;
      var match = true;

      for (var t = 0; t < terms.length; t++) {
        if (entry.searchableText.indexOf(terms[t]) !== -1) {
          score += 1;
        } else {
          match = false;
          break;
        }
      }

      if (match && score > 0) {
        results.push({
          definition: _registry[entry.id],
          score: score,
          index: entry
        });
      }
    }

    results.sort(function (a, b) { return b.score - a.score; });
    return results;
  }

  function getSearchIndex() {
    return _index.slice();
  }

  function validateConceptReferences() {
    var conceptService = window.NeuralVerse && window.NeuralVerse.conceptLayerService
      ? window.NeuralVerse.conceptLayerService
      : null;
    var errors = [];

    if (!conceptService) return { valid: true, errors: [], warning: 'Concept service not available for validation' };

    for (var i = 0; i < _definitions.length; i++) {
      var def = _definitions[i];
      var concepts = def.concepts || [];
      for (var c = 0; c < concepts.length; c++) {
        var concept = conceptService.get(concepts[c]);
        if (!concept) {
          errors.push(def.id + ': concept "' + concepts[c] + '" not found');
        }
      }
    }

    return { valid: errors.length === 0, errors: errors };
  }

  function validateArtifactReferences() {
    var errors = [];
    for (var i = 0; i < _definitions.length; i++) {
      var def = _definitions[i];
      if (!def.artifactReferences || def.artifactReferences.length === 0) {
        errors.push(def.id + ': no artifact references');
      }
    }
    return { valid: errors.length === 0, errors: errors };
  }

  function validateSharedKnowledgeReferences() {
    var errors = [];
    for (var i = 0; i < _definitions.length; i++) {
      var def = _definitions[i];
      if (!def.sharedKnowledgeDomains || def.sharedKnowledgeDomains.length === 0) {
        errors.push(def.id + ': no shared knowledge domains');
      }
    }
    return { valid: errors.length === 0, errors: errors };
  }

  function validateRegistryIntegrity() {
    var errors = [];
    var seenIds = {};

    for (var i = 0; i < _definitions.length; i++) {
      var def = _definitions[i];

      if (!def.id) {
        errors.push('Definition at index ' + i + ': missing id');
        continue;
      }

      if (seenIds[def.id]) {
        errors.push('Duplicate id: ' + def.id);
      }
      seenIds[def.id] = true;

      if (!def.title || typeof def.title !== 'string') {
        errors.push(def.id + ': missing or invalid title');
      }
      if (!def.slug || typeof def.slug !== 'string') {
        errors.push(def.id + ': missing or invalid slug');
      }
      if (!def.summary || typeof def.summary !== 'string') {
        errors.push(def.id + ': missing or invalid summary');
      }
      if (!def.category || typeof def.category !== 'string') {
        errors.push(def.id + ': missing or invalid category');
      }
      if (!Array.isArray(def.concepts) || def.concepts.length === 0) {
        errors.push(def.id + ': missing or empty concepts array');
      }
      if (!Array.isArray(def.artifactReferences) || def.artifactReferences.length === 0) {
        errors.push(def.id + ': missing or empty artifactReferences array');
      }
      if (!Array.isArray(def.sharedKnowledgeDomains) || def.sharedKnowledgeDomains.length === 0) {
        errors.push(def.id + ': missing or empty sharedKnowledgeDomains array');
      }
      if (!Array.isArray(def.parameterSchema)) {
        errors.push(def.id + ': missing parameterSchema array');
      }
      if (!def.defaultParameters || typeof def.defaultParameters !== 'object') {
        errors.push(def.id + ': missing defaultParameters object');
      }
      if (!def.renderer || typeof def.renderer !== 'string') {
        errors.push(def.id + ': missing renderer string');
      }
      if (!def.version || typeof def.version !== 'string') {
        errors.push(def.id + ': missing version string');
      }
      if (!def.canonicalStatus) {
        errors.push(def.id + ': missing canonicalStatus');
      }
    }

    return { valid: errors.length === 0, errors: errors };
  }

  function getCount() {
    return _definitions.length;
  }

  function getByConcept(conceptId) {
    var ids = _conceptIndex[conceptId] || [];
    var result = [];
    for (var i = 0; i < ids.length; i++) {
      if (_registry[ids[i]]) result.push(_registry[ids[i]]);
    }
    return result;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.ParametricRegistry = {
    initialize: initialize,
    isInitialized: isInitialized,
    get: getDefinition,
    getBySlug: getDefinitionBySlug,
    getAll: getAll,
    getByCategory: getByCategory,
    getByConcept: getByConcept,
    getCategories: getCategories,
    search: search,
    getSearchIndex: getSearchIndex,
    getCount: getCount,
    validateConceptReferences: validateConceptReferences,
    validateArtifactReferences: validateArtifactReferences,
    validateSharedKnowledgeReferences: validateSharedKnowledgeReferences,
    validateRegistryIntegrity: validateRegistryIntegrity
  };
})();
