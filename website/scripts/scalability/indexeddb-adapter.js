/**
 * NV-1100-P10 — IndexedDB Preparation
 * Provides StorageAdapter abstraction allowing future migration
 * from localStorage to IndexedDB without behavior changes.
 *
 * Currently uses localStorage only. IndexedDB adapter is stubbed
 * for future use.
 */
(function () {
  'use strict';

  function createIndexedDBAdapter() {
    return {
      type: 'indexedDB',

      _dbName: 'neuralverse',
      _dbVersion: 1,
      _storeName: 'kv',

      getItem: function (key) {
        return new Promise(function (resolve) {
          if (typeof indexedDB === 'undefined') { resolve(null); return; }
          var request = indexedDB.open(this._dbName, this._dbVersion);
          request.onerror = function () { resolve(null); };
          request.onsuccess = function (event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains('kv')) { resolve(null); db.close(); return; }
            var tx = db.transaction('kv', 'readonly');
            var store = tx.objectStore('kv');
            var getReq = store.get(key);
            getReq.onsuccess = function () { resolve(getReq.result || null); db.close(); };
            getReq.onerror = function () { resolve(null); db.close(); };
          };
          request.onupgradeneeded = function (event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains('kv')) {
              db.createObjectStore('kv');
            }
          };
        }.bind(this));
      },

      setItem: function (key, value) {
        return new Promise(function (resolve) {
          if (typeof indexedDB === 'undefined') { resolve(false); return; }
          var request = indexedDB.open(this._dbName, this._dbVersion);
          request.onerror = function () { resolve(false); };
          request.onsuccess = function (event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains('kv')) { resolve(false); db.close(); return; }
            var tx = db.transaction('kv', 'readwrite');
            var store = tx.objectStore('kv');
            var putReq = store.put(value, key);
            putReq.onsuccess = function () { resolve(true); db.close(); };
            putReq.onerror = function () { resolve(false); db.close(); };
          };
          request.onupgradeneeded = function (event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains('kv')) {
              db.createObjectStore('kv');
            }
          };
        }.bind(this));
      },

      removeItem: function (key) {
        return new Promise(function (resolve) {
          if (typeof indexedDB === 'undefined') { resolve(); return; }
          var request = indexedDB.open(this._dbName, this._dbVersion);
          request.onerror = function () { resolve(); };
          request.onsuccess = function (event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains('kv')) { resolve(); db.close(); return; }
            var tx = db.transaction('kv', 'readwrite');
            var store = tx.objectStore('kv');
            var delReq = store.delete(key);
            delReq.onsuccess = function () { resolve(); db.close(); };
            delReq.onerror = function () { resolve(); db.close(); };
          };
          request.onupgradeneeded = function (event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains('kv')) {
              db.createObjectStore('kv');
            }
          };
        }.bind(this));
      },

      clear: function () {
        return new Promise(function (resolve) {
          if (typeof indexedDB === 'undefined') { resolve(); return; }
          var request = indexedDB.open(this._dbName, this._dbVersion);
          request.onerror = function () { resolve(); };
          request.onsuccess = function (event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains('kv')) { resolve(); db.close(); return; }
            var tx = db.transaction('kv', 'readwrite');
            var store = tx.objectStore('kv');
            var clearReq = store.clear();
            clearReq.onsuccess = function () { resolve(); db.close(); };
            clearReq.onerror = function () { resolve(); db.close(); };
          };
          request.onupgradeneeded = function (event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains('kv')) {
              db.createObjectStore('kv');
            }
          };
        }.bind(this));
      }
    };
  }

  function createUnifiedStorageAdapter(localStorageAdapter) {
    var _active = localStorageAdapter;

    return {
      get activeType() { return _active.type; },

      getItem: function (key) {
        var result = _active.getItem(key);
        if (result && typeof result.then === 'function') return result;
        return Promise.resolve(result);
      },

      setItem: function (key, value) {
        var result = _active.setItem(key, value);
        if (result && typeof result.then === 'function') return result;
        return Promise.resolve(result);
      },

      removeItem: function (key) {
        var result = _active.removeItem(key);
        if (result && typeof result.then === 'function') return result;
        return Promise.resolve(result);
      },

      clear: function () {
        var result = _active.clear();
        if (result && typeof result.then === 'function') return result;
        return Promise.resolve(result);
      },

      keys: function () {
        if (typeof _active.keys === 'function') return _active.keys();
        return [];
      },

      getAll: function () {
        if (typeof _active.getAll === 'function') return _active.getAll();
        return {};
      },

      setAll: function (data) {
        if (typeof _active.setAll === 'function') return _active.setAll(data);
      },

      getUsageEstimate: function () {
        if (typeof _active.getUsageEstimate === 'function') return _active.getUsageEstimate();
        return 0;
      },

      migrateTo: function (targetType) {
        if (targetType === 'indexedDB') {
          _active = createIndexedDBAdapter();
          return true;
        }
        return false;
      }
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};

  var existingAdapter = window.NeuralVerse.StorageAdapter;
  if (existingAdapter) {
    var unified = createUnifiedStorageAdapter(existingAdapter);
    unified._localStorageAdapter = existingAdapter;
    unified._indexedDBAdapter = createIndexedDBAdapter();
    window.NeuralVerse.StorageAdapter = unified;
    window.NeuralVerse.StorageAdapterFactory = {
      createLocalStorage: function () { return existingAdapter; },
      createIndexedDB: createIndexedDBAdapter,
      createUnified: createUnifiedStorageAdapter
    };
  } else {
    window.NeuralVerse.StorageAdapterFactory = {
      createLocalStorage: function () { return createLocalStorageAdapter(); },
      createIndexedDB: createIndexedDBAdapter,
      createUnified: createUnifiedStorageAdapter
    };
  }
})();
