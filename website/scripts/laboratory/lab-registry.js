/**
 * NV-1100-P7 — Lab Registry
 * Central registry for all laboratory definitions.
 */

(function () {
  'use strict';

  var labs = {};
  var labOrder = [];
  var _slugIndex = {};
  var _categoryIndex = {};
  var _conceptIndex = {};
  var _artifactIndex = {};

  function _rebuildIndexes() {
    _slugIndex = {};
    _categoryIndex = {};
    _conceptIndex = {};
    _artifactIndex = {};

    for (var i = 0; i < labOrder.length; i++) {
      var lab = labs[labOrder[i]];
      if (!lab) continue;
      _addToIndexes(lab);
    }
  }

  function _addToIndexes(lab) {
    if (lab.slug) _slugIndex[lab.slug] = lab;

    if (lab.category) {
      if (!_categoryIndex[lab.category]) _categoryIndex[lab.category] = [];
      _categoryIndex[lab.category].push(lab.id);
    }

    if (lab.conceptReferences && Array.isArray(lab.conceptReferences)) {
      for (var c = 0; c < lab.conceptReferences.length; c++) {
        var cid = lab.conceptReferences[c];
        if (!_conceptIndex[cid]) _conceptIndex[cid] = [];
        _conceptIndex[cid].push(lab.id);
      }
    }

    if (lab.artifactReferences && Array.isArray(lab.artifactReferences)) {
      for (var a = 0; a < lab.artifactReferences.length; a++) {
        var aid = lab.artifactReferences[a];
        if (!_artifactIndex[aid]) _artifactIndex[aid] = [];
        _artifactIndex[aid].push(lab.id);
      }
    }
  }

  function _removeFromIndexes(lab) {
    if (lab.slug && _slugIndex[lab.slug]) delete _slugIndex[lab.slug];

    if (lab.category && _categoryIndex[lab.category]) {
      var idx = _categoryIndex[lab.category].indexOf(lab.id);
      if (idx !== -1) _categoryIndex[lab.category].splice(idx, 1);
    }

    if (lab.conceptReferences && Array.isArray(lab.conceptReferences)) {
      for (var c = 0; c < lab.conceptReferences.length; c++) {
        var cid = lab.conceptReferences[c];
        if (_conceptIndex[cid]) {
          var idx = _conceptIndex[cid].indexOf(lab.id);
          if (idx !== -1) _conceptIndex[cid].splice(idx, 1);
        }
      }
    }

    if (lab.artifactReferences && Array.isArray(lab.artifactReferences)) {
      for (var a = 0; a < lab.artifactReferences.length; a++) {
        var aid = lab.artifactReferences[a];
        if (_artifactIndex[aid]) {
          var idx = _artifactIndex[aid].indexOf(lab.id);
          if (idx !== -1) _artifactIndex[aid].splice(idx, 1);
        }
      }
    }
  }

  function registerLab(definition) {
    var validation = window.NeuralVerse.LabDefinition.validate(definition);
    if (validation.length > 0) {
      console.warn('Lab validation failed for ' + (definition.id || 'unknown') + ':', validation);
      return false;
    }
    labs[definition.id] = definition;
    if (labOrder.indexOf(definition.id) === -1) {
      labOrder.push(definition.id);
    }
    _addToIndexes(definition);
    return true;
  }

  function getLab(id) {
    return labs[id] || null;
  }

  function getLabBySlug(slug) {
    return _slugIndex[slug] || null;
  }

  function getAllLabs() {
    return labOrder.map(function (id) { return labs[id]; }).filter(Boolean);
  }

  function getLabsByCategory(category) {
    var ids = _categoryIndex[category] || [];
    var result = [];
    for (var i = 0; i < ids.length; i++) {
      if (labs[ids[i]]) result.push(labs[ids[i]]);
    }
    return result;
  }

  function getLabsByConcept(conceptId) {
    var ids = _conceptIndex[conceptId] || [];
    var result = [];
    for (var i = 0; i < ids.length; i++) {
      if (labs[ids[i]]) result.push(labs[ids[i]]);
    }
    return result;
  }

  function getLabsByArtifact(artifactId) {
    var ids = _artifactIndex[artifactId] || [];
    var result = [];
    for (var i = 0; i < ids.length; i++) {
      if (labs[ids[i]]) result.push(labs[ids[i]]);
    }
    return result;
  }

  function getCategories() {
    var cats = {};
    getAllLabs().forEach(function (lab) {
      cats[lab.category] = (cats[lab.category] || 0) + 1;
    });
    return cats;
  }

  function searchLabs(query) {
    if (!query || typeof query !== 'string') return [];
    var q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return getAllLabs().filter(function (lab) {
      var haystack = [
        lab.title, lab.summary, lab.category,
        lab.conceptReferences.join(' '),
        lab.artifactReferences.join(' ')
      ].join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return haystack.indexOf(q) !== -1;
    });
  }

  function getLabIndex() {
    return getAllLabs().map(function (lab) {
      return {
        id: lab.id,
        slug: lab.slug,
        title: lab.title,
        summary: lab.summary,
        category: lab.category,
        conceptReferences: lab.conceptReferences,
        artifactReferences: lab.artifactReferences,
        estimatedDuration: lab.estimatedDuration || '5-10 minutes'
      };
    });
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.LabRegistry = {
    register: registerLab,
    get: getLab,
    getBySlug: getLabBySlug,
    getAll: getAllLabs,
    getByCategory: getLabsByCategory,
    getByConcept: getLabsByConcept,
    getByArtifact: getLabsByArtifact,
    getCategories: getCategories,
    search: searchLabs,
    getIndex: getLabIndex
  };

})();
