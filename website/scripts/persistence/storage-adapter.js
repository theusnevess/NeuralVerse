/**
 * NV-1100-P1 — Storage Adapter Abstraction Layer
 * Provides a unified interface over localStorage with future IndexedDB compatibility.
 */

(function () {
  'use strict';

  function createLocalStorageAdapter() {
    return {
      type: 'localStorage',

      getItem(key) {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          console.error('StorageAdapter: read failed', e);
          return null;
        }
      },

      setItem(key, value) {
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (e) {
          console.error('StorageAdapter: write failed', e);
          return false;
        }
      },

      removeItem(key) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error('StorageAdapter: remove failed', e);
        }
      },

      clear() {
        try {
          localStorage.clear();
        } catch (e) {
          console.error('StorageAdapter: clear failed', e);
        }
      },

      keys() {
        try {
          const result = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) result.push(key);
          }
          return result;
        } catch (e) {
          return [];
        }
      },

      getAll() {
        const data = {};
        const allKeys = this.keys();
        for (const key of allKeys) {
          try {
            const raw = this.getItem(key);
            data[key] = raw ? JSON.parse(raw) : null;
          } catch (e) {
            data[key] = null;
          }
        }
        return data;
      },

      setAll(data) {
        for (const [key, value] of Object.entries(data)) {
          if (value === null || value === undefined) {
            this.removeItem(key);
          } else {
            this.setItem(key, JSON.stringify(value));
          }
        }
      },

      getUsageEstimate() {
        let total = 0;
        const allKeys = this.keys();
        for (const key of allKeys) {
          total += key.length;
          const val = this.getItem(key);
          if (val) total += val.length;
        }
        return total;
      }
    };
  }

  const StorageAdapter = createLocalStorageAdapter();

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.StorageAdapter = StorageAdapter;

})();
