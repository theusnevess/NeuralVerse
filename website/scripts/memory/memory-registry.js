/**
 * NeuralVerse Memory Registry
 * Central in-memory registry for all memory items.
 * Self-contained IIFE. No eval, no Function, no external requests.
 */
(function () {
  'use strict';

  var _items = new Map();
  var _idIndex = new Map();
  var _typeIndex = {};
  var _tagIndex = {};
  var _conceptIndex = {};
  var _artifactIndex = {};
  var _pinnedSet = new Set();

  function _rebuildIndexes() {
    _typeIndex = {};
    _tagIndex = {};
    _conceptIndex = {};
    _artifactIndex = {};
    _pinnedSet = new Set();

    _items.forEach(function (item) {
      _addToIndexes(item);
    });
  }

  function _addToIndexes(item) {
    if (!_typeIndex[item.type]) _typeIndex[item.type] = [];
    _typeIndex[item.type].push(item.id);

    if (Array.isArray(item.tags)) {
      for (var t = 0; t < item.tags.length; t++) {
        var tag = item.tags[t].toLowerCase();
        if (!_tagIndex[tag]) _tagIndex[tag] = [];
        _tagIndex[tag].push(item.id);
      }
    }

    if (Array.isArray(item.relatedConcepts)) {
      for (var c = 0; c < item.relatedConcepts.length; c++) {
        var concept = item.relatedConcepts[c].toLowerCase();
        if (!_conceptIndex[concept]) _conceptIndex[concept] = [];
        _conceptIndex[concept].push(item.id);
      }
    }

    if (Array.isArray(item.relatedArtifacts)) {
      for (var a = 0; a < item.relatedArtifacts.length; a++) {
        var artifact = item.relatedArtifacts[a].toLowerCase();
        if (!_artifactIndex[artifact]) _artifactIndex[artifact] = [];
        _artifactIndex[artifact].push(item.id);
      }
    }

    if (item.pinned === true) {
      _pinnedSet.add(item.id);
    }
  }

  function _removeFromIndexes(item) {
    if (_typeIndex[item.type]) {
      var idx = _typeIndex[item.type].indexOf(item.id);
      if (idx !== -1) _typeIndex[item.type].splice(idx, 1);
    }

    if (Array.isArray(item.tags)) {
      for (var t = 0; t < item.tags.length; t++) {
        var tag = item.tags[t].toLowerCase();
        if (_tagIndex[tag]) {
          var idx = _tagIndex[tag].indexOf(item.id);
          if (idx !== -1) _tagIndex[tag].splice(idx, 1);
        }
      }
    }

    if (Array.isArray(item.relatedConcepts)) {
      for (var c = 0; c < item.relatedConcepts.length; c++) {
        var concept = item.relatedConcepts[c].toLowerCase();
        if (_conceptIndex[concept]) {
          var idx = _conceptIndex[concept].indexOf(item.id);
          if (idx !== -1) _conceptIndex[concept].splice(idx, 1);
        }
      }
    }

    if (Array.isArray(item.relatedArtifacts)) {
      for (var a = 0; a < item.relatedArtifacts.length; a++) {
        var artifact = item.relatedArtifacts[a].toLowerCase();
        if (_artifactIndex[artifact]) {
          var idx = _artifactIndex[artifact].indexOf(item.id);
          if (idx !== -1) _artifactIndex[artifact].splice(idx, 1);
        }
      }
    }

    _pinnedSet.delete(item.id);
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getSchema() {
    return window.NeuralVerse && window.NeuralVerse.MemorySchema
      ? window.NeuralVerse.MemorySchema
      : null;
  }

  function register(item) {
    var schema = getSchema();
    if (!schema) {
      throw new Error('MemorySchema not loaded. Cannot validate items.');
    }

    var validation = schema.validate(item);
    if (!validation.valid) {
      throw new Error('Invalid memory item: ' + validation.errors.join('; '));
    }

    if (_items.has(item.id)) {
      throw new Error('Item with id "' + item.id + '" already exists.');
    }

    var stored = {
      id: item.id,
      type: item.type,
      title: item.title,
      summary: item.summary || '',
      content: item.content || '',
      tags: Array.isArray(item.tags) ? item.tags.slice() : [],
      relatedArtifacts: Array.isArray(item.relatedArtifacts)
        ? item.relatedArtifacts.slice()
        : [],
      relatedConcepts: Array.isArray(item.relatedConcepts)
        ? item.relatedConcepts.slice()
        : [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      pinned: typeof item.pinned === 'boolean' ? item.pinned : false,
      archived: typeof item.archived === 'boolean' ? item.archived : false,
      source: item.source || 'manual',
      version: item.version || '1.0.0'
    };

    _items.set(stored.id, stored);
    _idIndex.set(stored.id, stored);
    _addToIndexes(stored);

    return stored;
  }

  function get(id) {
    if (typeof id !== 'string' || id.length === 0) return null;
    return _items.has(id) ? Object.assign({}, _items.get(id)) : null;
  }

  function getAll(includeArchived) {
    var result = [];
    _items.forEach(function (item) {
      if (!includeArchived && item.archived) return;
      result.push(Object.assign({}, item));
    });
    return result;
  }

  function getAllIncludingArchived() {
    return getAll(true);
  }

  function update(id, updates) {
    if (typeof id !== 'string' || !_items.has(id)) {
      throw new Error('Item with id "' + id + '" not found.');
    }

    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      throw new Error('Updates must be a non-null object.');
    }

    var existing = _items.get(id);
    var updated = Object.assign({}, existing);

    _removeFromIndexes(existing);

    var protectedFields = ['id', 'createdAt'];
    var keys = Object.keys(updates);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (protectedFields.indexOf(key) !== -1) continue;
      if (key === 'tags' || key === 'relatedArtifacts' || key === 'relatedConcepts') {
        updated[key] = Array.isArray(updates[key]) ? updates[key].slice() : existing[key];
      } else {
        updated[key] = updates[key];
      }
    }

    updated.updatedAt = new Date().toISOString();

    _items.set(id, updated);
    _idIndex.set(id, updated);
    _addToIndexes(updated);

    return Object.assign({}, updated);
  }

  function remove(id) {
    if (typeof id !== 'string' || !_items.has(id)) {
      return false;
    }
    var item = _items.get(id);
    _removeFromIndexes(item);
    _items.delete(id);
    _idIndex.delete(id);
    return true;
  }

  function search(query) {
    if (typeof query !== 'string' || query.length === 0) return [];
    var lowerQuery = query.toLowerCase();
    var results = [];

    _items.forEach(function (item) {
      if (item.archived) return;

      var titleMatch = item.title && item.title.toLowerCase().indexOf(lowerQuery) !== -1;
      var summaryMatch = item.summary && item.summary.toLowerCase().indexOf(lowerQuery) !== -1;
      var tagMatch = false;

      if (Array.isArray(item.tags)) {
        for (var t = 0; t < item.tags.length; t++) {
          if (item.tags[t].toLowerCase().indexOf(lowerQuery) !== -1) {
            tagMatch = true;
            break;
          }
        }
      }

      if (titleMatch || summaryMatch || tagMatch) {
        results.push(Object.assign({}, item));
      }
    });

    return results;
  }

  function getByType(type) {
    if (typeof type !== 'string') return [];
    var ids = _typeIndex[type] || [];
    var result = [];
    for (var i = 0; i < ids.length; i++) {
      var item = _items.get(ids[i]);
      if (item && !item.archived) {
        result.push(Object.assign({}, item));
      }
    }
    return result;
  }

  function getByTag(tag) {
    if (typeof tag !== 'string') return [];
    var lowerTag = tag.toLowerCase();
    var ids = _tagIndex[lowerTag] || [];
    var result = [];
    for (var i = 0; i < ids.length; i++) {
      var item = _items.get(ids[i]);
      if (item && !item.archived) {
        result.push(Object.assign({}, item));
      }
    }
    return result;
  }

  function getByConcept(concept) {
    if (typeof concept !== 'string') return [];
    var lowerConcept = concept.toLowerCase();
    var ids = _conceptIndex[lowerConcept] || [];
    var result = [];
    for (var i = 0; i < ids.length; i++) {
      var item = _items.get(ids[i]);
      if (item && !item.archived) {
        result.push(Object.assign({}, item));
      }
    }
    return result;
  }

  function getByArtifact(artifact) {
    if (typeof artifact !== 'string') return [];
    var lowerArtifact = artifact.toLowerCase();
    var ids = _artifactIndex[lowerArtifact] || [];
    var result = [];
    for (var i = 0; i < ids.length; i++) {
      var item = _items.get(ids[i]);
      if (item && !item.archived) {
        result.push(Object.assign({}, item));
      }
    }
    return result;
  }

  function getByCollection(collectionId) {
    if (typeof collectionId !== 'string') return [];
    var collections =
      window.NeuralVerse && window.NeuralVerse.MemoryCollections
        ? window.NeuralVerse.MemoryCollections
        : null;
    if (!collections) return [];

    var col = collections.get(collectionId);
    if (!col || !Array.isArray(col.itemIds)) return [];

    var result = [];
    for (var i = 0; i < col.itemIds.length; i++) {
      var item = _items.get(col.itemIds[i]);
      if (item) {
        result.push(Object.assign({}, item));
      }
    }

    return result;
  }

  function getPinned() {
    var result = [];
    _pinnedSet.forEach(function (id) {
      var item = _items.get(id);
      if (item && !item.archived) {
        result.push(Object.assign({}, item));
      }
    });
    return result;
  }

  function getByDateRange(from, to) {
    var fromDate = new Date(from);
    var toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return [];
    }

    var result = [];
    _items.forEach(function (item) {
      if (item.archived) return;
      var itemDate = new Date(item.updatedAt);
      if (itemDate >= fromDate && itemDate <= toDate) {
        result.push(Object.assign({}, item));
      }
    });

    return result;
  }

  function getCount() {
    return _items.size;
  }

  function hasId(id) {
    return typeof id === 'string' && _idIndex.has(id);
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.MemoryRegistry = {
    register: register,
    get: get,
    getAll: getAll,
    getAllIncludingArchived: getAllIncludingArchived,
    update: update,
    remove: remove,
    search: search,
    getByType: getByType,
    getByTag: getByTag,
    getByConcept: getByConcept,
    getByArtifact: getByArtifact,
    getByCollection: getByCollection,
    getPinned: getPinned,
    getByDateRange: getByDateRange,
    getCount: getCount,
    hasId: hasId,
    _items: _items,
    _idIndex: _idIndex
  };
})();
