/**
 * NeuralVerse Memory Indexer
 * Deterministic indexing for fast retrieval of memory items.
 * Self-contained IIFE. No eval, no Function, no external requests.
 */
(function () {
  'use strict';

  var _indexes = {
    tags: {},
    concepts: {},
    artifacts: {},
    types: {},
    pinned: new Set(),
    archived: new Set(),
    collection: {},
    dateSorted: []
  };

  var _indexedIds = new Set();

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getRegistry() {
    return window.NeuralVerse && window.NeuralVerse.MemoryRegistry
      ? window.NeuralVerse.MemoryRegistry
      : null;
  }

  function _addToSet(obj, key, id) {
    if (!obj[key]) {
      obj[key] = new Set();
    }
    obj[key].add(id);
  }

  function _removeFromSet(obj, key, id) {
    if (obj[key]) {
      obj[key].delete(id);
      if (obj[key].size === 0) {
        delete obj[key];
      }
    }
  }

  function _rebuildDateSorted() {
    var registry = getRegistry();
    if (!registry) {
      _indexes.dateSorted = [];
      return;
    }

    var allItems = registry.getAllIncludingArchived();
    _indexes.dateSorted = allItems
      .map(function (item) {
        return { id: item.id, updatedAt: item.updatedAt };
      })
      .sort(function (a, b) {
        if (b.updatedAt > a.updatedAt) return 1;
        if (b.updatedAt < a.updatedAt) return -1;
        return 0;
      })
      .map(function (entry) {
        return entry.id;
      });
  }

  function buildIndex() {
    _indexes.tags = {};
    _indexes.concepts = {};
    _indexes.artifacts = {};
    _indexes.types = {};
    _indexes.pinned = new Set();
    _indexes.archived = new Set();
    _indexes.collection = {};
    _indexes.dateSorted = [];
    _indexedIds.clear();

    var registry = getRegistry();
    if (!registry) return;

    var allItems = registry.getAllIncludingArchived();
    for (var i = 0; i < allItems.length; i++) {
      add(allItems[i]);
    }

    _rebuildDateSorted();
  }

  function add(item) {
    if (!item || typeof item.id !== 'string') return;

    _indexedIds.add(item.id);

    if (Array.isArray(item.tags)) {
      for (var t = 0; t < item.tags.length; t++) {
        var tagLower = item.tags[t].toLowerCase();
        _addToSet(_indexes.tags, tagLower, item.id);
      }
    }

    if (Array.isArray(item.relatedConcepts)) {
      for (var c = 0; c < item.relatedConcepts.length; c++) {
        var conceptLower = item.relatedConcepts[c].toLowerCase();
        _addToSet(_indexes.concepts, conceptLower, item.id);
      }
    }

    if (Array.isArray(item.relatedArtifacts)) {
      for (var a = 0; a < item.relatedArtifacts.length; a++) {
        var artifactLower = item.relatedArtifacts[a].toLowerCase();
        _addToSet(_indexes.artifacts, artifactLower, item.id);
      }
    }

    if (typeof item.type === 'string') {
      _addToSet(_indexes.types, item.type, item.id);
    }

    if (item.pinned === true) {
      _indexes.pinned.add(item.id);
    }

    if (item.archived === true) {
      _indexes.archived.add(item.id);
    }

    _updateDateSortedAdd(item.id, item.updatedAt);
  }

  function remove(id) {
    if (typeof id !== 'string') return;

    var registry = getRegistry();
    var item = registry ? registry.get(id) : null;

    _indexedIds.delete(id);

    if (item) {
      if (Array.isArray(item.tags)) {
        for (var t = 0; t < item.tags.length; t++) {
          _removeFromSet(_indexes.tags, item.tags[t].toLowerCase(), id);
        }
      }

      if (Array.isArray(item.relatedConcepts)) {
        for (var c = 0; c < item.relatedConcepts.length; c++) {
          _removeFromSet(_indexes.concepts, item.relatedConcepts[c].toLowerCase(), id);
        }
      }

      if (Array.isArray(item.relatedArtifacts)) {
        for (var a = 0; a < item.relatedArtifacts.length; a++) {
          _removeFromSet(_indexes.artifacts, item.relatedArtifacts[a].toLowerCase(), id);
        }
      }

      _removeFromSet(_indexes.types, item.type, id);
    }

    _indexes.pinned.delete(id);
    _indexes.archived.delete(id);

    _updateDateSortedRemove(id);
  }

  function update(item) {
    if (!item || typeof item.id !== 'string') return;
    remove(item.id);
    add(item);
  }

  function _updateDateSortedAdd(id, updatedAt) {
    _updateDateSortedRemove(id);
    var entry = { id: id, updatedAt: updatedAt || new Date().toISOString() };

    var inserted = false;
    for (var i = 0; i < _indexes.dateSorted.length; i++) {
      var existingEntry = _getSortEntry(_indexes.dateSorted[i]);
      if (entry.updatedAt > existingEntry) {
        _indexes.dateSorted.splice(i, 0, id);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      _indexes.dateSorted.push(id);
    }
  }

  function _updateDateSortedRemove(id) {
    for (var i = _indexes.dateSorted.length - 1; i >= 0; i--) {
      if (_indexes.dateSorted[i] === id) {
        _indexes.dateSorted.splice(i, 1);
        break;
      }
    }
  }

  function _getSortEntry(id) {
    var registry = getRegistry();
    if (!registry) return '';
    var item = registry.get(id);
    return item ? item.updatedAt : '';
  }

  function _setToArray(set) {
    var arr = [];
    set.forEach(function (val) {
      arr.push(val);
    });
    return arr;
  }

  function query(filters) {
    if (!filters || typeof filters !== 'object' || Array.isArray(filters)) {
      return [];
    }

    var registry = getRegistry();
    if (!registry) return [];

    var candidateIds = null;

    if (filters.tag) {
      var tagLower = filters.tag.toLowerCase();
      var tagSet = _indexes.tags[tagLower];
      candidateIds = _intersect(candidateIds, tagSet ? _setToArray(tagSet) : []);
    }

    if (filters.concept) {
      var conceptLower = filters.concept.toLowerCase();
      var conceptSet = _indexes.concepts[conceptLower];
      candidateIds = _intersect(candidateIds, conceptSet ? _setToArray(conceptSet) : []);
    }

    if (filters.artifact) {
      var artifactLower = filters.artifact.toLowerCase();
      var artifactSet = _indexes.artifacts[artifactLower];
      candidateIds = _intersect(candidateIds, artifactSet ? _setToArray(artifactSet) : []);
    }

    if (filters.type) {
      var typeSet = _indexes.types[filters.type];
      candidateIds = _intersect(candidateIds, typeSet ? _setToArray(typeSet) : []);
    }

    if (filters.pinned === true) {
      candidateIds = _intersect(candidateIds, _setToArray(_indexes.pinned));
    }

    if (filters.archived === true) {
      candidateIds = _intersect(candidateIds, _setToArray(_indexes.archived));
    } else if (filters.archived === false) {
      var archivedArr = _setToArray(_indexes.archived);
      candidateIds = _exclude(candidateIds, archivedArr);
    }

    if (filters.collectionId) {
      var collectionIds = _getCollectionItemIds(filters.collectionId);
      candidateIds = _intersect(candidateIds, collectionIds);
    }

    if (filters.from || filters.to) {
      var dateIds = _getDateRangeIds(filters.from, filters.to);
      candidateIds = _intersect(candidateIds, dateIds);
    }

    if (candidateIds === null) {
      candidateIds = [];
      _indexedIds.forEach(function (id) {
        candidateIds.push(id);
      });
    }

    var results = [];
    for (var i = 0; i < candidateIds.length; i++) {
      var item = registry.get(candidateIds[i]);
      if (item) {
        results.push(item);
      }
    }

    return results;
  }

  function _intersect(arr1, arr2) {
    if (arr1 === null) return arr2.slice();
    if (arr2 === null) return arr1.slice();

    var set2 = {};
    for (var i = 0; i < arr2.length; i++) {
      set2[arr2[i]] = true;
    }

    var result = [];
    for (var j = 0; j < arr1.length; j++) {
      if (set2[arr1[j]]) {
        result.push(arr1[j]);
      }
    }

    return result;
  }

  function _exclude(arr, excludeArr) {
    if (arr === null) {
      arr = [];
      _indexedIds.forEach(function (id) {
        arr.push(id);
      });
    }

    var excludeSet = {};
    for (var i = 0; i < excludeArr.length; i++) {
      excludeSet[excludeArr[i]] = true;
    }

    var result = [];
    for (var j = 0; j < arr.length; j++) {
      if (!excludeSet[arr[j]]) {
        result.push(arr[j]);
      }
    }

    return result;
  }

  function _getCollectionItemIds(collectionId) {
    var collections =
      window.NeuralVerse && window.NeuralVerse.MemoryCollections
        ? window.NeuralVerse.MemoryCollections
        : null;
    if (!collections) return [];

    var col = collections.get(collectionId);
    if (!col || !Array.isArray(col.itemIds)) return [];

    return col.itemIds.slice();
  }

  function _getDateRangeIds(from, to) {
    var fromDate = from ? new Date(from) : new Date('0000-01-01T00:00:00.000Z');
    var toDate = to ? new Date(to) : new Date('9999-12-31T23:59:59.999Z');

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return [];

    var registry = getRegistry();
    if (!registry) return [];

    var result = [];
    for (var i = 0; i < _indexes.dateSorted.length; i++) {
      var item = registry.get(_indexes.dateSorted[i]);
      if (!item) continue;
      var itemDate = new Date(item.updatedAt);
      if (itemDate >= fromDate && itemDate <= toDate) {
        result.push(item.id);
      }
    }

    return result;
  }

  function getByTag(tag) {
    if (typeof tag !== 'string') return [];
    var tagLower = tag.toLowerCase();
    var set = _indexes.tags[tagLower];
    return set ? _setToArray(set) : [];
  }

  function getByConcept(concept) {
    if (typeof concept !== 'string') return [];
    var conceptLower = concept.toLowerCase();
    var set = _indexes.concepts[conceptLower];
    return set ? _setToArray(set) : [];
  }

  function getByArtifact(artifact) {
    if (typeof artifact !== 'string') return [];
    var artifactLower = artifact.toLowerCase();
    var set = _indexes.artifacts[artifactLower];
    return set ? _setToArray(set) : [];
  }

  function getByType(type) {
    if (typeof type !== 'string') return [];
    var set = _indexes.types[type];
    return set ? _setToArray(set) : [];
  }

  function getPinned() {
    return _setToArray(_indexes.pinned);
  }

  function getArchived() {
    return _setToArray(_indexes.archived);
  }

  function getRecent(limit) {
    var max = typeof limit === 'number' && limit > 0 ? limit : 10;
    return _indexes.dateSorted.slice(0, max);
  }

  function getByCollection(collectionId) {
    return _getCollectionItemIds(collectionId);
  }

  function getByDateRange(from, to) {
    return _getDateRangeIds(from, to);
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.MemoryIndexer = {
    buildIndex: buildIndex,
    add: add,
    remove: remove,
    update: update,
    query: query,
    getByTag: getByTag,
    getByConcept: getByConcept,
    getByArtifact: getByArtifact,
    getByType: getByType,
    getPinned: getPinned,
    getArchived: getArchived,
    getRecent: getRecent,
    getByCollection: getByCollection,
    getByDateRange: getByDateRange,
    _indexes: _indexes,
    _indexedIds: _indexedIds
  };
})();
