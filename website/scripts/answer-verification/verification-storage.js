/**
 * NV-1100-P6 — Verification Storage
 *
 * Local-first persistence for verification items and history.
 * Storage key: nv_answer_verification_history
 *
 * No sensitive free-form answers are stored by default. The schema records
 * the itemId, status, timestamp, and minimal metadata — not the raw user
 * input.
 */

const KEY_HISTORY = 'nv_answer_verification_history';
const KEY_ITEMS = 'nv_answer_verification_items';

function getStorage() {
  if (typeof window !== 'undefined' && window.NeuralVerse && window.NeuralVerse.StorageAdapter) {
    return window.NeuralVerse.StorageAdapter;
  }
  if (typeof localStorage !== 'undefined') {
    return {
      getItem: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
      setItem: (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
      removeItem: (k) => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
    };
  }
  return null;
}

function safeParse(raw, fallback) {
  if (raw === null || raw === undefined) return fallback;
  try { return JSON.parse(raw); } catch (e) { return fallback; }
}

function loadKey(key, fallback) {
  const s = getStorage();
  if (!s) return fallback;
  return safeParse(s.getItem(key), fallback);
}

function saveKey(key, value) {
  const s = getStorage();
  if (!s) return false;
  try { s.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
}

export const VerificationStorage = {
  KEYS: Object.freeze({ HISTORY: KEY_HISTORY, ITEMS: KEY_ITEMS }),

  loadItems() {
    return loadKey(KEY_ITEMS, {}) || {};
  },

  saveItem(item) {
    if (!item || !item.id) return false;
    const items = this.loadItems();
    items[item.id] = item;
    return saveKey(KEY_ITEMS, items);
  },

  getItem(id) {
    if (!id) return null;
    const items = this.loadItems();
    return items[id] || null;
  },

  removeItem(id) {
    if (!id) return false;
    const items = this.loadItems();
    if (items[id]) {
      delete items[id];
      return saveKey(KEY_ITEMS, items);
    }
    return false;
  },

  loadHistory() {
    return loadKey(KEY_HISTORY, []) || [];
  },

  appendHistory(entry) {
    if (!entry || typeof entry !== 'object') return false;
    if (!entry.itemId || !entry.timestamp || !entry.status) return false;
    const history = this.loadHistory();
    history.push(entry);
    return saveKey(KEY_HISTORY, history);
  },

  getHistoryForItem(itemId) {
    if (!itemId) return [];
    return this.loadHistory().filter(e => e.itemId === itemId);
  },

  clearHistory() {
    return saveKey(KEY_HISTORY, []);
  },

  exportAll() {
    return {
      [KEY_HISTORY]: this.loadHistory(),
      [KEY_ITEMS]: this.loadItems()
    };
  },

  importReplace(bundle) {
    if (!bundle || typeof bundle !== 'object') return false;
    const s = getStorage();
    if (!s) return false;
    if (bundle[KEY_HISTORY] && Array.isArray(bundle[KEY_HISTORY])) {
      s.setItem(KEY_HISTORY, JSON.stringify(bundle[KEY_HISTORY]));
    } else {
      s.removeItem(KEY_HISTORY);
    }
    if (bundle[KEY_ITEMS] && typeof bundle[KEY_ITEMS] === 'object') {
      s.setItem(KEY_ITEMS, JSON.stringify(bundle[KEY_ITEMS]));
    } else {
      s.removeItem(KEY_ITEMS);
    }
    return true;
  },

  importMerge(bundle) {
    if (!bundle || typeof bundle !== 'object') return false;
    // Items: union by id, incoming wins on conflict
    const curItems = this.loadItems();
    const incItems = (bundle[KEY_ITEMS] && typeof bundle[KEY_ITEMS] === 'object') ? bundle[KEY_ITEMS] : {};
    const mergedItems = { ...curItems, ...incItems };
    saveKey(KEY_ITEMS, mergedItems);
    // History: union by (itemId, timestamp, status), chronological
    const curHistory = this.loadHistory();
    const incHistory = Array.isArray(bundle[KEY_HISTORY]) ? bundle[KEY_HISTORY] : [];
    const seen = new Set();
    const mergedHistory = [];
    for (const e of [...curHistory, ...incHistory]) {
      if (!e || !e.itemId || !e.timestamp || !e.status) continue;
      const k = `${e.itemId}|${e.timestamp}|${e.status}`;
      if (seen.has(k)) continue;
      seen.add(k);
      mergedHistory.push(e);
    }
    mergedHistory.sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return ta - tb;
    });
    saveKey(KEY_HISTORY, mergedHistory);
    return true;
  }
};

export default VerificationStorage;
