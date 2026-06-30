/**
 * NeuralVerse Memory Collections
 * Collection management for organizing memory items.
 * Self-contained IIFE. No eval, no Function, no external requests.
 */
(function () {
  'use strict';

  var _collections = new Map();
  var _collectionIdIndex = new Map();
  var _collectionCounter = 0;

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function generateCollectionId() {
    _collectionCounter += 1;
    var timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
    return 'col_' + timestamp + '_' + String(_collectionCounter).padStart(4, '0');
  }

  function getStorage() {
    return window.NeuralVerse && window.NeuralVerse.MemoryStorage
      ? window.NeuralVerse.MemoryStorage
      : null;
  }

  function persist() {
    var storage = getStorage();
    if (!storage) return false;

    var arr = [];
    _collections.forEach(function (col) {
      arr.push(Object.assign({}, col));
    });

    return storage.saveCollections(arr);
  }

  function create(name, description, color) {
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('Collection name must be a non-empty string.');
    }

    var now = new Date().toISOString();
    var collection = {
      id: generateCollectionId(),
      name: name,
      description: typeof description === 'string' ? description : '',
      color: typeof color === 'string' ? color : '#4a90d9',
      itemIds: [],
      createdAt: now,
      updatedAt: now
    };

    _collections.set(collection.id, collection);
    _collectionIdIndex.set(collection.id, collection);
    persist();

    return Object.assign({}, collection);
  }

  function get(id) {
    if (typeof id !== 'string' || !_collections.has(id)) return null;
    return Object.assign({}, _collections.get(id));
  }

  function getAll() {
    var result = [];
    _collections.forEach(function (col) {
      result.push(Object.assign({}, col));
    });
    return result;
  }

  function update(id, updates) {
    if (typeof id !== 'string' || !_collections.has(id)) {
      throw new Error('Collection with id "' + id + '" not found.');
    }

    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      throw new Error('Updates must be a non-null object.');
    }

    var existing = _collections.get(id);
    var updated = Object.assign({}, existing);

    var protectedFields = ['id', 'createdAt'];
    var keys = Object.keys(updates);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (protectedFields.indexOf(key) !== -1) continue;
      updated[key] = updates[key];
    }

    updated.updatedAt = new Date().toISOString();

    _collections.set(id, updated);
    _collectionIdIndex.set(id, updated);
    persist();

    return Object.assign({}, updated);
  }

  function remove(id) {
    if (typeof id !== 'string' || !_collections.has(id)) {
      return false;
    }

    _collections.delete(id);
    _collectionIdIndex.delete(id);
    persist();
    return true;
  }

  function addItem(collectionId, itemId) {
    if (typeof collectionId !== 'string' || !_collections.has(collectionId)) {
      throw new Error('Collection with id "' + collectionId + '" not found.');
    }

    if (typeof itemId !== 'string' || itemId.length === 0) {
      throw new Error('Item ID must be a non-empty string.');
    }

    var col = _collections.get(collectionId);

    for (var i = 0; i < col.itemIds.length; i++) {
      if (col.itemIds[i] === itemId) {
        return Object.assign({}, col);
      }
    }

    col.itemIds.push(itemId);
    col.updatedAt = new Date().toISOString();

    _collections.set(collectionId, col);
    persist();

    return Object.assign({}, col);
  }

  function removeItem(collectionId, itemId) {
    if (typeof collectionId !== 'string' || !_collections.has(collectionId)) {
      throw new Error('Collection with id "' + collectionId + '" not found.');
    }

    if (typeof itemId !== 'string' || itemId.length === 0) {
      throw new Error('Item ID must be a non-empty string.');
    }

    var col = _collections.get(collectionId);
    var found = false;

    for (var i = col.itemIds.length - 1; i >= 0; i--) {
      if (col.itemIds[i] === itemId) {
        col.itemIds.splice(i, 1);
        found = true;
        break;
      }
    }

    if (found) {
      col.updatedAt = new Date().toISOString();
      _collections.set(collectionId, col);
      persist();
    }

    return Object.assign({}, col);
  }

  function getItems(collectionId) {
    if (typeof collectionId !== 'string' || !_collections.has(collectionId)) {
      return [];
    }

    var col = _collections.get(collectionId);
    var registry =
      window.NeuralVerse && window.NeuralVerse.MemoryRegistry
        ? window.NeuralVerse.MemoryRegistry
        : null;
    if (!registry) return [];

    var items = [];
    for (var i = 0; i < col.itemIds.length; i++) {
      var item = registry.get(col.itemIds[i]);
      if (item) {
        items.push(item);
      }
    }

    return items;
  }

  function getItemCollections(itemId) {
    if (typeof itemId !== 'string' || itemId.length === 0) {
      return [];
    }

    var result = [];
    _collections.forEach(function (col) {
      for (var i = 0; i < col.itemIds.length; i++) {
        if (col.itemIds[i] === itemId) {
          result.push(Object.assign({}, col));
          break;
        }
      }
    });

    return result;
  }

  function loadFromStorage() {
    var storage = getStorage();
    if (!storage) return false;

    var collections = storage.loadCollections();
    if (!Array.isArray(collections)) return false;

    _collections.clear();
    _collectionIdIndex.clear();

    for (var i = 0; i < collections.length; i++) {
      var col = collections[i];
      if (col && typeof col.id === 'string') {
        _collections.set(col.id, col);
        _collectionIdIndex.set(col.id, col);
      }
    }

    return true;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.MemoryCollections = {
    create: create,
    get: get,
    getAll: getAll,
    update: update,
    remove: remove,
    addItem: addItem,
    removeItem: removeItem,
    getItems: getItems,
    getItemCollections: getItemCollections,
    loadFromStorage: loadFromStorage,
    _collections: _collections,
    _collectionIdIndex: _collectionIdIndex
  };
})();
