/**
 * NV-900-UI8 — Personalized Learning & Knowledge Workspace
 * Abstraction layer for localStorage persistence of user personalization metadata.
 */

(function () {
  'use strict';

  const STORAGE_KEY_PREFIX = 'nv_personalization_';

  function getStorage(key, defaultValue) {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error('Failed to read from localStorage: ', e);
      return defaultValue;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to write to localStorage: ', e);
    }
  }

  const PersonalizationService = {
    // --- 1. Bookmarks ---
    getBookmarks() {
      return getStorage('bookmarks', []);
    },
    addBookmark(id, type, title, lineage = null) {
      const bookmarks = this.getBookmarks();
      if (bookmarks.some(b => b.id === id)) return;
      bookmarks.push({
        id,
        type,
        title,
        timestamp: new Date().toISOString(),
        lineage
      });
      setStorage('bookmarks', bookmarks);
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    removeBookmark(id) {
      let bookmarks = this.getBookmarks();
      bookmarks = bookmarks.filter(b => b.id !== id);
      setStorage('bookmarks', bookmarks);
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    isBookmarked(id) {
      return this.getBookmarks().some(b => b.id === id);
    },

    // --- 2. Continue Reading ---
    getContinueReading() {
      return getStorage('continue_reading', null);
    },
    updateContinueReading(path, module, lesson, artifact = null) {
      const state = {
        path: path ? { id: path.id, title: path.title } : null,
        module: module ? { id: module.id, title: module.title } : null,
        lesson: lesson ? { id: lesson.id, title: lesson.title } : null,
        artifact: artifact ? { id: artifact.id, title: artifact.title } : null,
        timestamp: new Date().toISOString()
      };
      setStorage('continue_reading', state);
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },

    // --- 3. Recently Visited ---
    getRecentlyVisited() {
      return getStorage('recently_visited', []);
    },
    addRecentlyVisited(id, type, title, lineage = null, canonicalStatus = 'Draft') {
      let history = this.getRecentlyVisited();
      // Remove existing to collapse duplicates into latest visit
      history = history.filter(h => h.id !== id);
      history.unshift({
        id,
        type,
        title,
        lineage,
        canonicalStatus,
        timestamp: new Date().toISOString()
      });
      // Cap at 50 entries
      if (history.length > 50) {
        history = history.slice(0, 50);
      }
      setStorage('recently_visited', history);
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    clearRecentlyVisited() {
      setStorage('recently_visited', []);
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },

    // --- 4. Personal Notes ---
    getNotes() {
      return getStorage('notes', {});
    },
    getNote(id) {
      const notes = this.getNotes();
      return notes[id] || null;
    },
    saveNote(id, title, type, noteText) {
      const notes = this.getNotes();
      if (!noteText || noteText.trim() === '') {
        delete notes[id];
      } else {
        notes[id] = {
          text: noteText,
          title,
          type,
          timestamp: new Date().toISOString()
        };
      }
      setStorage('notes', notes);
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },

    // --- 5. Reading Highlights ---
    getHighlights() {
      return getStorage('highlights', []);
    },
    getHighlightsForResource(resourceId) {
      return this.getHighlights().filter(h => h.resourceId === resourceId);
    },
    toggleHighlight(resourceId, anchorId, color = 'yellow') {
      let highlights = this.getHighlights();
      const index = highlights.findIndex(h => h.resourceId === resourceId && h.anchorId === anchorId);
      if (index !== -1) {
        highlights.splice(index, 1);
      } else {
        highlights.push({
          resourceId,
          anchorId,
          color,
          timestamp: new Date().toISOString()
        });
      }
      setStorage('highlights', highlights);
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },

    // --- 6. Study Collections ---
    getCollections() {
      return getStorage('collections', []);
    },
    createCollection(name) {
      const collections = this.getCollections();
      if (collections.some(c => c.name.toLowerCase() === name.toLowerCase())) return;
      collections.push({
        name,
        resources: []
      });
      setStorage('collections', collections);
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    renameCollection(oldName, newName) {
      const collections = this.getCollections();
      const col = collections.find(c => c.name === oldName);
      if (col) {
        col.name = newName;
        setStorage('collections', collections);
        window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
      }
    },
    deleteCollection(name) {
      let collections = this.getCollections();
      collections = collections.filter(c => c.name !== name);
      setStorage('collections', collections);
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    addToCollection(name, resourceId, resourceTitle, resourceType) {
      const collections = this.getCollections();
      const col = collections.find(c => c.name === name);
      if (col) {
        if (!col.resources.some(r => r.id === resourceId)) {
          col.resources.push({
            id: resourceId,
            title: resourceTitle,
            type: resourceType,
            timestamp: new Date().toISOString()
          });
          setStorage('collections', collections);
          window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
        }
      }
    },
    removeFromCollection(name, resourceId) {
      const collections = this.getCollections();
      const col = collections.find(c => c.name === name);
      if (col) {
        col.resources = col.resources.filter(r => r.id !== resourceId);
        setStorage('collections', collections);
        window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
      }
    },
    isInCollection(name, resourceId) {
      const collections = this.getCollections();
      const col = collections.find(c => c.name === name);
      return col ? col.resources.some(r => r.id === resourceId) : false;
    },

    // --- 7. Personal Tags ---
    getTagsMap() {
      return getStorage('tags', {});
    },
    getTagsForResource(resourceId) {
      const tagsMap = this.getTagsMap();
      return tagsMap[resourceId] || [];
    },
    addTag(resourceId, tag) {
      const tagsMap = this.getTagsMap();
      const tags = tagsMap[resourceId] || [];
      const cleanTag = tag.trim().toLowerCase();
      if (cleanTag && !tags.includes(cleanTag)) {
        tags.push(cleanTag);
        tagsMap[resourceId] = tags;
        setStorage('tags', tagsMap);
        window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
      }
    },
    removeTag(resourceId, tag) {
      const tagsMap = this.getTagsMap();
      let tags = tagsMap[resourceId] || [];
      tags = tags.filter(t => t !== tag);
      if (tags.length === 0) {
        delete tagsMap[resourceId];
      } else {
        tagsMap[resourceId] = tags;
      }
      setStorage('tags', tagsMap);
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },

    // --- 8. Reading Statistics ---
    getStats() {
      const bookmarksCount = this.getBookmarks().length;
      const history = this.getRecentlyVisited();
      const recentCount = history.length;
      
      const notes = this.getNotes();
      const notesCount = Object.keys(notes).length;
      
      const highlightsCount = this.getHighlights().length;
      const collectionsCount = this.getCollections().length;
      
      const reviewedCount = history.filter(h => h.canonicalStatus === 'Reviewed').length;
      const draftCount = history.filter(h => h.canonicalStatus === 'Draft').length;

      return {
        bookmarksCount,
        recentCount,
        notesCount,
        highlightsCount,
        collectionsCount,
        reviewedCount,
        draftCount
      };
    }
  };

  // Register globally
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.PersonalizationService = PersonalizationService;

})();
