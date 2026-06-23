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
    updateContinueReading(path, module, lesson, artifact = null, scrollPosition = 0) {
      const state = {
        path: path ? { id: path.id, title: path.title } : null,
        module: module ? { id: module.id, title: module.title } : null,
        lesson: lesson ? { id: lesson.id, title: lesson.title } : null,
        artifact: artifact ? { id: artifact.id, title: artifact.title } : null,
        scrollPosition,
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
      // Calculate revisit count and preserve duration estimate
      const existingEntry = history.find(h => h.id === id);
      const revisitCount = existingEntry ? (existingEntry.revisitCount || 1) + 1 : 1;

      history = history.filter(h => h.id !== id);
      history.unshift({
        id,
        type,
        title,
        lineage,
        canonicalStatus,
        revisitCount,
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

      // Update active study session metrics
      const activeSession = this.getActiveSession();
      if (activeSession) {
        if (!activeSession.notesEdited.includes(id)) {
          activeSession.notesEdited.push(id);
          this.saveActiveSession(activeSession);
        }
      }

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

    // --- 8. Study Session ---
    getActiveSession() {
      return getStorage('active_session', null);
    },
    saveActiveSession(session) {
      setStorage('active_session', session);
    },
    startSession(goalMinutes = null) {
      const session = {
        startTime: new Date().toISOString(),
        paused: false,
        accumulatedTime: 0,
        lastUpdated: new Date().toISOString(),
        goalMinutes: goalMinutes ? Number(goalMinutes) : null,
        resourcesVisited: [],
        notesEdited: [],
        bookmarksAdded: [],
        completedItemsCount: 0
      };
      this.saveActiveSession(session);
      window.dispatchEvent(new CustomEvent('nv:study_session_started'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    pauseSession() {
      const session = this.getActiveSession();
      if (!session || session.paused) return;
      const elapsed = Math.floor((new Date() - new Date(session.lastUpdated)) / 1000);
      session.accumulatedTime += elapsed;
      session.paused = true;
      session.lastUpdated = new Date().toISOString();
      this.saveActiveSession(session);
      window.dispatchEvent(new CustomEvent('nv:study_session_paused'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    resumeSession() {
      const session = this.getActiveSession();
      if (!session || !session.paused) return;
      session.paused = false;
      session.lastUpdated = new Date().toISOString();
      this.saveActiveSession(session);
      window.dispatchEvent(new CustomEvent('nv:study_session_resumed'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    endSession() {
      const session = this.getActiveSession();
      if (!session) return null;

      let finalDuration = session.accumulatedTime;
      if (!session.paused) {
        finalDuration += Math.floor((new Date() - new Date(session.lastUpdated)) / 1000);
      }

      const summary = {
        durationSeconds: finalDuration,
        startTime: session.startTime,
        endTime: new Date().toISOString(),
        visitedCount: session.resourcesVisited.length,
        visitedItems: session.resourcesVisited,
        notesCount: session.notesEdited.length,
        bookmarksCount: session.bookmarksAdded.length,
        goalMinutes: session.goalMinutes,
        completedCount: session.completedItemsCount
      };

      setStorage('session_summary', summary);
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'active_session');
      window.dispatchEvent(new CustomEvent('nv:study_session_ended', { detail: { summary } }));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
      return summary;
    },
    getLastSessionSummary() {
      return getStorage('session_summary', null);
    },
    clearLastSessionSummary() {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'session_summary');
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },

    // --- 9. Study Queue ---
    getQueue() {
      return getStorage('study_queue', []);
    },
    addToQueue(item) {
      const queue = this.getQueue();
      if (queue.some(q => q.id === item.id)) return;
      queue.push({
        id: item.id,
        type: item.type,
        title: item.title,
        route: item.route,
        addedAt: new Date().toISOString()
      });
      setStorage('study_queue', queue);
      window.dispatchEvent(new CustomEvent('nv:study_queue_updated'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    removeFromQueue(id) {
      let queue = this.getQueue();
      queue = queue.filter(q => q.id !== id);
      setStorage('study_queue', queue);
      window.dispatchEvent(new CustomEvent('nv:study_queue_updated'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    moveQueueItem(id, direction) {
      const queue = this.getQueue();
      const idx = queue.findIndex(q => q.id === id);
      if (idx === -1) return;
      if (direction === 'up' && idx > 0) {
        const temp = queue[idx];
        queue[idx] = queue[idx - 1];
        queue[idx - 1] = temp;
      } else if (direction === 'down' && idx < queue.length - 1) {
        const temp = queue[idx];
        queue[idx] = queue[idx + 1];
        queue[idx + 1] = temp;
      }
      setStorage('study_queue', queue);
      window.dispatchEvent(new CustomEvent('nv:study_queue_updated'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    clearQueue() {
      setStorage('study_queue', []);
      window.dispatchEvent(new CustomEvent('nv:study_queue_updated'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },

    // --- 10. Favorites ---
    getFavorites() {
      return getStorage('favorites', []);
    },
    toggleFavorite(id, type, title, route) {
      let favorites = this.getFavorites();
      const isFav = favorites.some(f => f.id === id);
      if (isFav) {
        favorites = favorites.filter(f => f.id !== id);
      } else {
        favorites.push({
          id,
          type,
          title,
          route,
          timestamp: new Date().toISOString()
        });
      }
      setStorage('favorites', favorites);
      window.dispatchEvent(new CustomEvent('nv:favorites_updated'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    isFavorite(id) {
      return this.getFavorites().some(f => f.id === id);
    },

    // --- 11. Reading Bookmarks (inside long artifacts) ---
    getReadingBookmarks(artifactId) {
      const bookmarksMap = getStorage('reading_bookmarks', {});
      return bookmarksMap[artifactId] || [];
    },
    addReadingBookmark(artifactId, title, position, type = 'scroll') {
      const bookmarksMap = getStorage('reading_bookmarks', {});
      const list = bookmarksMap[artifactId] || [];
      const bookmarkId = 'bmark_' + Date.now();
      list.push({
        id: bookmarkId,
        title,
        position, // scrollRatio or CSS selector
        type,
        timestamp: new Date().toISOString()
      });
      bookmarksMap[artifactId] = list;
      setStorage('reading_bookmarks', bookmarksMap);

      // Update active study session metrics
      const activeSession = this.getActiveSession();
      if (activeSession) {
        if (!activeSession.bookmarksAdded.includes(bookmarkId)) {
          activeSession.bookmarksAdded.push(bookmarkId);
          this.saveActiveSession(activeSession);
        }
      }

      window.dispatchEvent(new CustomEvent('nv:reading_bookmarks_updated'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
      return bookmarkId;
    },
    removeReadingBookmark(artifactId, bookmarkId) {
      const bookmarksMap = getStorage('reading_bookmarks', {});
      let list = bookmarksMap[artifactId] || [];
      list = list.filter(b => b.id !== bookmarkId);
      bookmarksMap[artifactId] = list;
      setStorage('reading_bookmarks', bookmarksMap);
      window.dispatchEvent(new CustomEvent('nv:reading_bookmarks_updated'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },

    // --- 12. Reading Goals ---
    getGoals() {
      return getStorage('reading_goals', { goalMinutes: 30, completedMinutesToday: 0 });
    },
    setGoal(minutes) {
      const goals = this.getGoals();
      goals.goalMinutes = Number(minutes);
      setStorage('reading_goals', goals);
      window.dispatchEvent(new CustomEvent('nv:goals_updated'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    updateGoalProgress(minutes) {
      const goals = this.getGoals();
      goals.completedMinutesToday += Number(minutes);
      setStorage('reading_goals', goals);
      window.dispatchEvent(new CustomEvent('nv:goals_updated'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },
    resetGoalProgress() {
      const goals = this.getGoals();
      goals.completedMinutesToday = 0;
      setStorage('reading_goals', goals);
      window.dispatchEvent(new CustomEvent('nv:goals_updated'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },

    // --- 13. Reading Progress Integration ---
    getReadingProgressMap() {
      return getStorage('reading_progress_map', {});
    },
    getReadingProgress(artifactId) {
      const progressMap = this.getReadingProgressMap();
      return progressMap[artifactId] || { status: 'Not Started', updatedAt: null };
    },
    setReadingProgress(artifactId, status) {
      const progressMap = this.getReadingProgressMap();
      progressMap[artifactId] = {
        status,
        updatedAt: new Date().toISOString()
      };
      setStorage('reading_progress_map', progressMap);

      // Sync with the standard neuralverse.progress.v1 storage key used by the R3 Workspace continuity card
      try {
        const rawProgress = localStorage.getItem('neuralverse.progress.v1');
        let progressStore = rawProgress ? JSON.parse(rawProgress) : { records: [] };
        let record = progressStore.records.find(r => r.entityId === artifactId && r.entityType === 'content-item');

        if (!record) {
          record = {
            entityId: artifactId,
            entityType: 'content-item',
            status: 'not-started',
            progressValue: 0,
            lastOpenedAt: new Date().toISOString(),
            completedAt: null
          };
          progressStore.records.push(record);
        }

        if (status === 'Completed') {
          record.status = 'completed';
          record.progressValue = 100;
          record.completedAt = new Date().toISOString();

          // Increment completed items count in active session
          const activeSession = this.getActiveSession();
          if (activeSession) {
            activeSession.completedItemsCount += 1;
            this.saveActiveSession(activeSession);
          }
        } else if (status === 'In Progress') {
          record.status = 'in-progress';
          record.progressValue = Math.max(record.progressValue, 1);
          record.completedAt = null;
        } else {
          record.status = 'not-started';
          record.progressValue = 0;
          record.completedAt = null;
        }

        localStorage.setItem('neuralverse.progress.v1', JSON.stringify(progressStore));
      } catch (err) {
        console.error('Failed to sync to neuralverse.progress.v1 key:', err);
      }

      window.dispatchEvent(new CustomEvent('nv:progressupdated'));
      window.dispatchEvent(new CustomEvent('nv:personalization_updated'));
    },

    // --- 14. Reading Statistics ---
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
