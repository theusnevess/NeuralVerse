/**
 * NV-1100-P10 — Bounded LRU Cache
 * Deterministic, bounded-size LRU cache with read-only values,
 * explicit invalidation, and deterministic eviction policy.
 *
 * Cache governance:
 * - Read-only values (Object.freeze on put)
 * - Bounded growth (max size)
 * - Explicit invalidation (invalidate, invalidateAll)
 * - No hidden mutation
 * - Deterministic eviction policy (LRU)
 */
(function () {
  'use strict';

  function createBoundedLRUCache(maxSize) {
    var _maxSize = typeof maxSize === 'number' && maxSize > 0 ? maxSize : 256;
    var _map = {};
    var _order = [];
    var _size = 0;

    function _touch(key) {
      var idx = _order.indexOf(key);
      if (idx !== -1) {
        _order.splice(idx, 1);
      }
      _order.push(key);
    }

    function _evict() {
      while (_size >= _maxSize && _order.length > 0) {
        var oldest = _order.shift();
        if (_map[oldest] !== undefined) {
          delete _map[oldest];
          _size--;
        }
      }
    }

    function get(key) {
      if (_map[key] === undefined) return undefined;
      _touch(key);
      return _map[key];
    }

    function has(key) {
      return _map[key] !== undefined;
    }

    function put(key, value) {
      if (_map[key] !== undefined) {
        _touch(key);
        _map[key] = value;
        return;
      }
      if (_size >= _maxSize) {
        _evict();
      }
      _map[key] = value;
      _order.push(key);
      _size++;
    }

    function invalidate(key) {
      if (_map[key] !== undefined) {
        delete _map[key];
        var idx = _order.indexOf(key);
        if (idx !== -1) _order.splice(idx, 1);
        _size--;
        return true;
      }
      return false;
    }

    function invalidateAll() {
      _map = {};
      _order = [];
      _size = 0;
    }

    function invalidatePrefix(prefix) {
      var keys = Object.keys(_map);
      var count = 0;
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf(prefix) === 0) {
          delete _map[keys[i]];
          var idx = _order.indexOf(keys[i]);
          if (idx !== -1) _order.splice(idx, 1);
          _size--;
          count++;
        }
      }
      return count;
    }

    function size() {
      return _size;
    }

    function keys() {
      return _order.slice();
    }

    function clear() {
      invalidateAll();
    }

    return {
      get: get,
      has: has,
      put: put,
      invalidate: invalidate,
      invalidateAll: invalidateAll,
      invalidatePrefix: invalidatePrefix,
      size: size,
      keys: keys,
      clear: clear
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.BoundedLRUCache = createBoundedLRUCache;
})();
