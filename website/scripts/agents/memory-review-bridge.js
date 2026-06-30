/**
 * NV-1300-D1D — Memory & Review Bridge
 *
 * Read-only bridge between the pedagogical planner and the
 * NeuralVerse Memory System (P8) and Review Scheduler (P5).
 *
 * Reads ONLY explicit user state:
 *   - bookmarks
 *   - notes
 *   - pinned memories
 *   - collections
 *   - due reviews
 *   - review history
 *   - completed laboratories
 *
 * FORBIDDEN:
 *   - infer mastery
 *   - infer competence
 *   - infer weakness
 *   - estimate proficiency
 *   - estimate intelligence
 *
 * Pure, deterministic. No Math.random. No Date.now.
 * No external IO. No curriculum mutation.
 */

const MEMORY_TYPES = ['bookmark', 'note', 'pinned', 'collection'];
const REVIEW_STATUSES = ['due', 'overdue', 'scheduled', 'completed', 'never_seen'];
const LAB_STATUSES = ['completed', 'in_progress', 'not_started'];

function _safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function _safeStr(v, fallback) {
  return typeof v === 'string' ? v : (fallback || '');
}

function _safeGet(obj, key) {
  if (!obj || typeof obj !== 'object') return undefined;
  return obj[key];
}

function _filterByType(list, type) {
  if (!Array.isArray(list)) return [];
  return list.filter(function (item) { return item && item.type === type; });
}

function createMemoryReviewBridge() {
  var _memoryContext = null;
  var _reviewContext = null;

  function _readMemoryRegistry() {
    if (typeof window === 'undefined') return null;
    var nv = window.NeuralVerse;
    if (!nv) return null;
    return nv.MemoryRegistry || nv.memoryRegistry || null;
  }

  function _readReviewScheduler() {
    if (typeof window === 'undefined') return null;
    var nv = window.NeuralVerse;
    if (!nv) return null;
    return nv.reviewScheduler || nv.ReviewScheduler || null;
  }

  function _readLabRegistry() {
    if (typeof window === 'undefined') return null;
    var nv = window.NeuralVerse;
    if (!nv) return null;
    return nv.LabRegistry || nv.labRegistry || null;
  }

  function loadBookmarks() {
    var reg = _readMemoryRegistry();
    if (!reg || typeof reg.getAll !== 'function') return [];
    try {
      var all = reg.getAll();
      return _filterByType(all, 'bookmark').map(function (item) {
        return {
          id: _safeStr(item.id),
          type: 'bookmark',
          relatedConcepts: _safeArray(item.relatedConcepts),
          relatedArtifacts: _safeArray(item.relatedArtifacts),
          tags: _safeArray(item.tags)
        };
      });
    } catch (e) {
      return [];
    }
  }

  function loadNotes() {
    var reg = _readMemoryRegistry();
    if (!reg || typeof reg.getAll !== 'function') return [];
    try {
      var all = reg.getAll();
      return _filterByType(all, 'note').map(function (item) {
        return {
          id: _safeStr(item.id),
          type: 'note',
          relatedConcepts: _safeArray(item.relatedConcepts),
          relatedArtifacts: _safeArray(item.relatedArtifacts),
          tags: _safeArray(item.tags),
          preview: _safeStr(item.preview || item.content || '').substring(0, 200)
        };
      });
    } catch (e) {
      return [];
    }
  }

  function loadPinned() {
    var reg = _readMemoryRegistry();
    if (!reg || typeof reg.getAll !== 'function') return [];
    try {
      var all = reg.getAll();
      return all.filter(function (item) {
        return item && item.pinned === true;
      }).map(function (item) {
        return {
          id: _safeStr(item.id),
          type: _safeStr(item.type, 'pinned'),
          relatedConcepts: _safeArray(item.relatedConcepts),
          relatedArtifacts: _safeArray(item.relatedArtifacts)
        };
      });
    } catch (e) {
      return [];
    }
  }

  function loadCollections() {
    var reg = _readMemoryRegistry();
    if (!reg || typeof reg.getAll !== 'function') return [];
    try {
      var all = reg.getAll();
      return _filterByType(all, 'collection').map(function (item) {
        return {
          id: _safeStr(item.id),
          type: 'collection',
          name: _safeStr(item.name || item.title),
          itemIds: _safeArray(item.itemIds || item.items),
          relatedConcepts: _safeArray(item.relatedConcepts)
        };
      });
    } catch (e) {
      return [];
    }
  }

  function loadDueReviews() {
    var sched = _readReviewScheduler();
    if (!sched || typeof sched.getAllItems !== 'function') {
      if (sched && typeof sched.getItem === 'function') return [];
      return [];
    }
    try {
      var all = sched.getAllItems();
      if (!Array.isArray(all)) return [];
      return all.filter(function (it) {
        if (!it) return false;
        return it.due === true || it.status === 'due' || it.status === 'overdue';
      }).map(function (it) {
        return {
          reviewId: _safeStr(it.reviewId || it.id),
          entityId: _safeStr(it.entityId),
          type: _safeStr(it.type, 'flashcard'),
          status: _safeStr(it.status, 'due'),
          dueDate: it.dueDate || null
        };
      });
    } catch (e) {
      return [];
    }
  }

  function loadReviewHistory() {
    var sched = _readReviewScheduler();
    if (!sched || typeof sched.getAllItems !== 'function') return [];
    try {
      var all = sched.getAllItems();
      if (!Array.isArray(all)) return [];
      return all.filter(function (it) {
        return it && (it.status === 'completed' || it.reviewCount > 0);
      }).map(function (it) {
        return {
          reviewId: _safeStr(it.reviewId || it.id),
          entityId: _safeStr(it.entityId),
          type: _safeStr(it.type, 'flashcard'),
          reviewCount: typeof it.reviewCount === 'number' ? it.reviewCount : 0,
          lastReviewedAt: it.lastReviewedAt || null
        };
      });
    } catch (e) {
      return [];
    }
  }

  function loadCompletedLaboratories() {
    var reg = _readLabRegistry();
    if (!reg) return [];
    try {
      var all = typeof reg.getAll === 'function' ? reg.getAll() : [];
      return all.filter(function (lab) {
        return lab && (lab.completed === true || lab.status === 'completed');
      }).map(function (lab) {
        return {
          id: _safeStr(lab.id),
          title: _safeStr(lab.title),
          status: LAB_STATUSES[2],
          relatedConcepts: _safeArray(lab.relatedConcepts)
        };
      });
    } catch (e) {
      return [];
    }
  }

  function buildContext(input) {
    var src = input || {};
    var conceptIds = _safeArray(src.conceptIds);
    var artifactIds = _safeArray(src.artifactIds);

    var bookmarks = loadBookmarks();
    var notes = loadNotes();
    var pinned = loadPinned();
    var collections = loadCollections();
    var dueReviews = loadDueReviews();
    var reviewHistory = loadReviewHistory();
    var completedLabs = loadCompletedLaboratories();

    var bookmarkedConcepts = [];
    var bookmarkedArtifacts = [];
    for (var i = 0; i < bookmarks.length; i++) {
      var b = bookmarks[i];
      for (var c = 0; c < b.relatedConcepts.length; c++) {
        if (bookmarkedConcepts.indexOf(b.relatedConcepts[c]) === -1) {
          bookmarkedConcepts.push(b.relatedConcepts[c]);
        }
      }
      for (var a = 0; a < b.relatedArtifacts.length; a++) {
        if (bookmarkedArtifacts.indexOf(b.relatedArtifacts[a]) === -1) {
          bookmarkedArtifacts.push(b.relatedArtifacts[a]);
        }
      }
    }

    var resumeCandidates = [];
    for (var j = 0; j < conceptIds.length; j++) {
      var cid = conceptIds[j];
      for (var k = 0; k < bookmarks.length; k++) {
        if (bookmarks[k].relatedConcepts.indexOf(cid) !== -1) {
          resumeCandidates.push({
            conceptId: cid,
            memoryId: bookmarks[k].id,
            type: 'bookmark'
          });
        }
      }
    }

    var dueReviewConcepts = [];
    for (var r = 0; r < dueReviews.length; r++) {
      var dr = dueReviews[r];
      if (conceptIds.indexOf(dr.entityId) !== -1) {
        dueReviewConcepts.push({
          conceptId: dr.entityId,
          reviewId: dr.reviewId,
          type: dr.type
        });
      }
    }

    _memoryContext = {
      bookmarks: bookmarks,
      notes: notes,
      pinned: pinned,
      collections: collections,
      bookmarkedConcepts: bookmarkedConcepts,
      bookmarkedArtifacts: bookmarkedArtifacts,
      resumeCandidates: resumeCandidates,
      counts: {
        bookmarks: bookmarks.length,
        notes: notes.length,
        pinned: pinned.length,
        collections: collections.length
      }
    };

    _reviewContext = {
      dueReviews: dueReviews,
      reviewHistory: reviewHistory,
      dueReviewConcepts: dueReviewConcepts,
      completedLaboratories: completedLabs,
      counts: {
        due: dueReviews.length,
        history: reviewHistory.length,
        completedLabs: completedLabs.length
      }
    };

    return {
      memory: _memoryContext,
      review: _reviewContext
    };
  }

  function validateContext(ctx) {
    var errors = [];
    var warnings = [];
    if (!ctx || typeof ctx !== 'object') {
      return { valid: false, errors: ['Context must be an object'], warnings: [] };
    }

    var forbiddenTerms = ['mastery', 'competence', 'proficiency', 'weakness', 'intelligence score', 'skill score', 'skill_level'];
    function checkForbidden(label, value) {
      if (typeof value !== 'string') return;
      var lower = value.toLowerCase();
      for (var i = 0; i < forbiddenTerms.length; i++) {
        if (lower.indexOf(forbiddenTerms[i]) !== -1) {
          errors.push(label + ' contains forbidden inference term: ' + forbiddenTerms[i]);
        }
      }
    }

    function walkObject(obj, label) {
      if (!obj) return;
      if (typeof obj === 'string') { checkForbidden(label, obj); return; }
      if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) walkObject(obj[i], label + '[' + i + ']');
        return;
      }
      if (typeof obj === 'object') {
        for (var k in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, k)) {
            walkObject(obj[k], label + '.' + k);
          }
        }
      }
    }

    walkObject(ctx, 'ctx');
    if (ctx.memory) {
      if (!Array.isArray(ctx.memory.bookmarks)) errors.push('memory.bookmarks must be array');
      if (!Array.isArray(ctx.memory.notes)) errors.push('memory.notes must be array');
      if (!Array.isArray(ctx.memory.pinned)) errors.push('memory.pinned must be array');
      if (!Array.isArray(ctx.memory.collections)) errors.push('memory.collections must be array');
    }
    if (ctx.review) {
      if (!Array.isArray(ctx.review.dueReviews)) errors.push('review.dueReviews must be array');
      if (!Array.isArray(ctx.review.reviewHistory)) errors.push('review.reviewHistory must be array');
      if (!Array.isArray(ctx.review.completedLaboratories)) errors.push('review.completedLaboratories must be array');
    }

    return { valid: errors.length === 0, errors: errors, warnings: warnings };
  }

  function getMemoryContext() { return _memoryContext; }
  function getReviewContext() { return _reviewContext; }
  function reset() { _memoryContext = null; _reviewContext = null; }

  return {
    loadBookmarks: loadBookmarks,
    loadNotes: loadNotes,
    loadPinned: loadPinned,
    loadCollections: loadCollections,
    loadDueReviews: loadDueReviews,
    loadReviewHistory: loadReviewHistory,
    loadCompletedLaboratories: loadCompletedLaboratories,
    buildContext: buildContext,
    validateContext: validateContext,
    getMemoryContext: getMemoryContext,
    getReviewContext: getReviewContext,
    reset: reset,
    MEMORY_TYPES: MEMORY_TYPES,
    REVIEW_STATUSES: REVIEW_STATUSES,
    LAB_STATUSES: LAB_STATUSES
  };
}

if (typeof window !== 'undefined') {
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.createMemoryReviewBridge = createMemoryReviewBridge;
}

export { createMemoryReviewBridge, MEMORY_TYPES, REVIEW_STATUSES, LAB_STATUSES };
