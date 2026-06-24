/**
 * NV-1100-P1 — Persistence Manager
 * Core export/import/merge/replace engine for NeuralVerse personalization data.
 */

(function () {
  'use strict';

  const PERSONALIZATION_PREFIX = 'nv_personalization_';
  const KNOWN_NAMESPACES = [
    'bookmarks', 'continue_reading', 'recently_visited', 'notes',
    'highlights', 'collections', 'tags', 'active_session',
    'session_summary', 'study_queue', 'favorites', 'reading_bookmarks',
    'reading_goals', 'reading_progress_map'
  ];

  const ADDITIONAL_KEYS = [
    'neuralverse.progress.v1',
    'nv_agent_panel_mode',
    'nv_agent_panel_collapsed',
    'nv_agent_panel_recent_prompts',
    'nv_favorites_sort',
    'nv_history_filter'
  ];

  function getAdapter() {
    return window.NeuralVerse?.StorageAdapter || null;
  }

  function discoverPersonalizationKeys(adapter) {
    const allKeys = adapter.keys();
    const personalizationKeys = allKeys.filter(k => k.startsWith(PERSONALIZATION_PREFIX));
    const additionalPresent = ADDITIONAL_KEYS.filter(k => allKeys.includes(k));
    return { personalizationKeys, additionalPresent };
  }

  function readKey(adapter, key) {
    try {
      const raw = adapter.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeKey(adapter, key, value) {
    if (value === null || value === undefined) {
      adapter.removeItem(key);
    } else {
      adapter.setItem(key, JSON.stringify(value));
    }
  }

  function collectCurrentState(adapter) {
    const { personalizationKeys, additionalPresent } = discoverPersonalizationKeys(adapter);
    const state = {};

    for (const key of personalizationKeys) {
      const shortKey = key.replace(PERSONALIZATION_PREFIX, '');
      state[shortKey] = readKey(adapter, key);
    }

    for (const key of additionalPresent) {
      state['__extra__' + key] = readKey(adapter, key);
    }

    const progress = readKey(adapter, 'neuralverse.progress.v1');
    if (progress !== null) {
      state['progress'] = progress;
    }

    const agentMode = readKey(adapter, 'nv_agent_panel_mode');
    if (agentMode !== null) {
      state['agent_mode'] = agentMode;
    }
    const agentCollapsed = readKey(adapter, 'nv_agent_panel_collapsed');
    if (agentCollapsed !== null) {
      state['agent_collapsed'] = agentCollapsed;
    }
    const agentPrompts = readKey(adapter, 'nv_agent_panel_recent_prompts');
    if (agentPrompts !== null) {
      state['agent_recent_prompts'] = agentPrompts;
    }
    const favSort = readKey(adapter, 'nv_favorites_sort');
    if (favSort !== null) {
      state['favorites_sort'] = favSort;
    }
    const histFilter = readKey(adapter, 'nv_history_filter');
    if (histFilter !== null) {
      state['history_filter'] = histFilter;
    }

    return state;
  }

  function collectSections(state) {
    const sections = [];
    if (state.bookmarks && (Array.isArray(state.bookmarks) ? state.bookmarks.length > 0 : Object.keys(state.bookmarks).length > 0)) {
      sections.push({ key: 'bookmarks', label: 'Bookmarks', count: Array.isArray(state.bookmarks) ? state.bookmarks.length : Object.keys(state.bookmarks).length });
    }
    if (state.favorites && Array.isArray(state.favorites) && state.favorites.length > 0) {
      sections.push({ key: 'favorites', label: 'Favorites', count: state.favorites.length });
    }
    if (state.notes && Object.keys(state.notes).length > 0) {
      sections.push({ key: 'notes', label: 'Notes', count: Object.keys(state.notes).length });
    }
    if (state.highlights && Array.isArray(state.highlights) && state.highlights.length > 0) {
      sections.push({ key: 'highlights', label: 'Highlights', count: state.highlights.length });
    }
    if (state.collections && Array.isArray(state.collections) && state.collections.length > 0) {
      sections.push({ key: 'collections', label: 'Collections', count: state.collections.length });
    }
    if (state.tags && Object.keys(state.tags).length > 0) {
      sections.push({ key: 'tags', label: 'Tags', count: Object.keys(state.tags).length });
    }
    if (state.study_queue && Array.isArray(state.study_queue) && state.study_queue.length > 0) {
      sections.push({ key: 'study_queue', label: 'Study Queue', count: state.study_queue.length });
    }
    if (state.reading_progress_map && Object.keys(state.reading_progress_map).length > 0) {
      sections.push({ key: 'reading_progress_map', label: 'Reading Progress', count: Object.keys(state.reading_progress_map).length });
    }
    if (state.continue_reading) {
      sections.push({ key: 'continue_reading', label: 'Continue Reading', count: 1 });
    }
    if (state.recently_visited && Array.isArray(state.recently_visited) && state.recently_visited.length > 0) {
      sections.push({ key: 'recently_visited', label: 'Recently Visited', count: state.recently_visited.length });
    }
    if (state.reading_bookmarks && Object.keys(state.reading_bookmarks).length > 0) {
      sections.push({ key: 'reading_bookmarks', label: 'Reading Bookmarks', count: Object.keys(state.reading_bookmarks).length });
    }
    if (state.reading_goals) {
      sections.push({ key: 'reading_goals', label: 'Reading Goals', count: 1 });
    }
    if (state.progress && state.progress.records && state.progress.records.length > 0) {
      sections.push({ key: 'progress', label: 'Progress Records', count: state.progress.records.length });
    }
    if (state.favorites_sort) {
      sections.push({ key: 'favorites_sort', label: 'Favorites Sort', count: 1 });
    }
    if (state.history_filter) {
      sections.push({ key: 'history_filter', label: 'History Filter', count: 1 });
    }
    return sections;
  }

  function buildExportPayload(adapter) {
    const state = collectCurrentState(adapter);
    const sections = collectSections(state);

    return {
      schemaVersion: 1,
      neuralVerseVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      personalization: {
        bookmarks: state.bookmarks || [],
        favorites: state.favorites || [],
        continue_reading: state.continue_reading || null,
        recently_visited: state.recently_visited || [],
        reading_bookmarks: state.reading_bookmarks || {},
        reading_goals: state.reading_goals || { goalMinutes: 30, completedMinutesToday: 0 },
        reading_progress_map: state.reading_progress_map || {}
      },
      study: {
        study_queue: state.study_queue || [],
        active_session: state.active_session || null,
        session_summary: state.session_summary || null
      },
      notes: state.notes || {},
      highlights: state.highlights || [],
      collections: state.collections || [],
      tags: state.tags || {},
      preferences: {
        favorites_sort: state.favorites_sort || 'alphabetical',
        history_filter: state.history_filter || 'All',
        agent_mode: state.agent_mode || 'default',
        agent_collapsed: state.agent_collapsed || [],
        agent_recent_prompts: state.agent_recent_prompts || []
      },
      progress: state.progress || { records: [] },
      _meta: {
        sections,
        totalSections: sections.length
      }
    };
  }

  function mergeArrays(existing, imported, key) {
    if (!Array.isArray(imported)) return existing;
    if (!Array.isArray(existing)) return imported;
    if (key === 'recently_visited') {
      const merged = [...existing];
      for (const item of imported) {
        const idx = merged.findIndex(m => m.id === item.id);
        if (idx === -1) {
          merged.push(item);
        } else {
          merged[idx] = item;
        }
      }
      return merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);
    }
    const merged = [...existing];
    for (const item of imported) {
      if (!merged.some(m => m.id === item.id)) {
        merged.push(item);
      }
    }
    return merged;
  }

  function mergeMaps(existing, imported) {
    if (!imported || typeof imported !== 'object') return existing;
    if (!existing || typeof existing !== 'object') return imported;
    return { ...existing, ...imported };
  }

  function mergeSets(existing, imported) {
    if (!Array.isArray(imported)) return existing;
    if (!Array.isArray(existing)) return imported;
    return [...new Set([...existing, ...imported])];
  }

  function mergeData(currentState, importData, mode) {
    const merged = { ...currentState };

    if (mode === 'replace') {
      if (importData.personalization) {
        Object.assign(merged, importData.personalization);
      }
      if (importData.study) {
        Object.assign(merged, importData.study);
      }
      if (importData.notes) merged.notes = importData.notes;
      if (importData.highlights) merged.highlights = importData.highlights;
      if (importData.collections) merged.collections = importData.collections;
      if (importData.tags) merged.tags = importData.tags;
      if (importData.preferences) {
        merged.favorites_sort = importData.preferences.favorites_sort || merged.favorites_sort;
        merged.history_filter = importData.preferences.history_filter || merged.history_filter;
        merged.agent_mode = importData.preferences.agent_mode || merged.agent_mode;
        merged.agent_collapsed = importData.preferences.agent_collapsed || merged.agent_collapsed;
        merged.agent_recent_prompts = importData.preferences.agent_recent_prompts || merged.agent_recent_prompts;
      }
      if (importData.progress) merged.progress = importData.progress;
      return merged;
    }

    if (importData.personalization) {
      const p = importData.personalization;
      if (p.bookmarks) merged.bookmarks = mergeArrays(merged.bookmarks || [], p.bookmarks, 'bookmarks');
      if (p.favorites) merged.favorites = mergeArrays(merged.favorites || [], p.favorites, 'favorites');
      if (p.continue_reading) merged.continue_reading = p.continue_reading;
      if (p.recently_visited) merged.recently_visited = mergeArrays(merged.recently_visited || [], p.recently_visited, 'recently_visited');
      if (p.reading_bookmarks) merged.reading_bookmarks = mergeMaps(merged.reading_bookmarks || {}, p.reading_bookmarks);
      if (p.reading_goals) {
        merged.reading_goals = {
          goalMinutes: p.reading_goals.goalMinutes ?? (merged.reading_goals?.goalMinutes ?? 30),
          completedMinutesToday: Math.max(merged.reading_goals?.completedMinutesToday || 0, p.reading_goals.completedMinutesToday || 0)
        };
      }
      if (p.reading_progress_map) merged.reading_progress_map = mergeMaps(merged.reading_progress_map || {}, p.reading_progress_map);
    }

    if (importData.study) {
      const s = importData.study;
      if (s.study_queue) merged.study_queue = mergeArrays(merged.study_queue || [], s.study_queue, 'study_queue');
      if (s.active_session) merged.active_session = s.active_session;
      if (s.session_summary) merged.session_summary = s.session_summary;
    }

    if (importData.notes) {
      merged.notes = mergeMaps(merged.notes || {}, importData.notes);
    }

    if (importData.highlights) {
      merged.highlights = mergeArrays(merged.highlights || [], importData.highlights, 'highlights');
    }

    if (importData.collections) {
      merged.collections = mergeArrays(merged.collections || [], importData.collections, 'collections');
    }

    if (importData.tags) {
      merged.tags = mergeMaps(merged.tags || {}, importData.tags);
    }

    if (importData.preferences) {
      const prefs = importData.preferences;
      if (prefs.favorites_sort) merged.favorites_sort = prefs.favorites_sort;
      if (prefs.history_filter) merged.history_filter = prefs.history_filter;
      if (prefs.agent_mode) merged.agent_mode = prefs.agent_mode;
      if (prefs.agent_collapsed) merged.agent_collapsed = mergeSets(merged.agent_collapsed || [], prefs.agent_collapsed);
      if (prefs.agent_recent_prompts) merged.agent_recent_prompts = mergeSets(merged.agent_recent_prompts || [], prefs.agent_recent_prompts);
    }

    if (importData.progress) {
      merged.progress = mergeProgressData(merged.progress || { records: [] }, importData.progress);
    }

    return merged;
  }

  function mergeProgressData(existing, imported) {
    if (!imported || !Array.isArray(imported.records)) return existing;
    const mergedRecords = [...(existing.records || [])];

    for (const importedRecord of imported.records) {
      const idx = mergedRecords.findIndex(
        r => r.entityId === importedRecord.entityId && r.entityType === importedRecord.entityType
      );
      if (idx === -1) {
        mergedRecords.push(importedRecord);
      } else {
        const existingRecord = mergedRecords[idx];
        const existingDate = existingRecord.lastOpenedAt ? new Date(existingRecord.lastOpenedAt) : null;
        const importedDate = importedRecord.lastOpenedAt ? new Date(importedRecord.lastOpenedAt) : null;

        if (importedRecord.status === 'completed') {
          mergedRecords[idx] = importedRecord;
        } else if (existingRecord.status === 'completed') {
          // keep completed
        } else if (importedDate && existingDate && importedDate > existingDate) {
          mergedRecords[idx] = importedRecord;
        } else {
          mergedRecords[idx] = {
            ...existingRecord,
            progressValue: Math.max(existingRecord.progressValue || 0, importedRecord.progressValue || 0),
            lastOpenedAt: importedRecord.lastOpenedAt || existingRecord.lastOpenedAt
          };
        }
      }
    }

    return { records: mergedRecords };
  }

  function applyStateToStorage(adapter, mergedState) {
    for (const key of KNOWN_NAMESPACES) {
      const value = mergedState[key];
      if (value !== undefined) {
        writeKey(adapter, PERSONALIZATION_PREFIX + key, value);
      }
    }

    if (mergedState.progress !== undefined) {
      writeKey(adapter, 'neuralverse.progress.v1', mergedState.progress);
    }
    if (mergedState.agent_mode !== undefined) {
      writeKey(adapter, 'nv_agent_panel_mode', mergedState.agent_mode);
    }
    if (mergedState.agent_collapsed !== undefined) {
      writeKey(adapter, 'nv_agent_panel_collapsed', mergedState.agent_collapsed);
    }
    if (mergedState.agent_recent_prompts !== undefined) {
      writeKey(adapter, 'nv_agent_panel_recent_prompts', mergedState.agent_recent_prompts);
    }
    if (mergedState.favorites_sort !== undefined) {
      writeKey(adapter, 'nv_favorites_sort', mergedState.favorites_sort);
    }
    if (mergedState.history_filter !== undefined) {
      writeKey(adapter, 'nv_history_filter', mergedState.history_filter);
    }
  }

  function dispatchImportEvents() {
    window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    window.dispatchEvent(new CustomEvent('nv:favorites_updated'));
    window.dispatchEvent(new CustomEvent('nv:study_queue_updated'));
    window.dispatchEvent(new CustomEvent('nv:reading_bookmarks_updated'));
    window.dispatchEvent(new CustomEvent('nv:goals_updated'));
    window.dispatchEvent(new CustomEvent('nv:progressupdated'));
  }

  const PersistenceManager = {
    SCHEMA_VERSION: 1,
    KNOWN_NAMESPACES,
    PERSONALIZATION_PREFIX,

    exportBackup() {
      const adapter = getAdapter();
      if (!adapter) return null;
      return buildExportPayload(adapter);
    },

    triggerDownload(payload) {
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = 'neuralverse-backup-' + timestamp + '.json';

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    },

    importBackup(fileContent, mode) {
      const adapter = getAdapter();
      if (!adapter) return { success: false, errors: ['Storage adapter unavailable.'] };

      const parseResult = window.NeuralVerse.ValidationService.validateFileContent(fileContent);
      if (!parseResult.valid) {
        return { success: false, errors: parseResult.errors };
      }

      const validation = window.NeuralVerse.ValidationService.validateBackup(parseResult.data);
      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      try {
        const currentState = collectCurrentState(adapter);
        const mergedState = mergeData(currentState, parseResult.data, mode);
        applyStateToStorage(adapter, mergedState);
        dispatchImportEvents();

        return { success: true, errors: [], sections: collectSections(mergedState) };
      } catch (e) {
        return { success: false, errors: ['Import failed: ' + e.message] };
      }
    },

    getBackupPreview(fileContent) {
      const parseResult = window.NeuralVerse.ValidationService.validateFileContent(fileContent);
      if (!parseResult.valid) {
        return { valid: false, errors: parseResult.errors, preview: null };
      }

      const validation = window.NeuralVerse.ValidationService.validateBackup(parseResult.data);
      if (!validation.valid) {
        return { valid: false, errors: validation.errors, preview: null };
      }

      const data = parseResult.data;
      const preview = {
        exportedAt: data.exportedAt,
        neuralVerseVersion: data.neuralVerseVersion,
        schemaVersion: data.schemaVersion,
        sections: collectSections({
          bookmarks: data.personalization?.bookmarks,
          favorites: data.personalization?.favorites,
          continue_reading: data.personalization?.continue_reading,
          recently_visited: data.personalization?.recently_visited,
          reading_bookmarks: data.personalization?.reading_bookmarks,
          reading_goals: data.personalization?.reading_goals,
          reading_progress_map: data.personalization?.reading_progress_map,
          study_queue: data.study?.study_queue,
          active_session: data.study?.active_session,
          session_summary: data.study?.session_summary,
          notes: data.notes,
          highlights: data.highlights,
          collections: data.collections,
          tags: data.tags,
          favorites_sort: data.preferences?.favorites_sort,
          history_filter: data.preferences?.history_filter,
          progress: data.progress
        })
      };

      return { valid: true, errors: [], preview };
    },

    getCurrentSections() {
      const adapter = getAdapter();
      if (!adapter) return [];
      const state = collectCurrentState(adapter);
      return collectSections(state);
    }
  };

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.PersistenceManager = PersistenceManager;

})();
