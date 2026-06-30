/**
 * Semantic Learning Intelligence — Memory Bridge
 * Connects semantic engine to the Advanced Memory system (P8).
 * Discovers memories linked to concepts via explicit references only.
 *
 * NV-1100-P9
 */
(function () {
  'use strict';

  function getRegistry() {
    return window.NeuralVerse?.MemoryRegistry || null;
  }

  function getRetrieval() {
    return window.NeuralVerse?.MemoryRetrieval || null;
  }

  function getRelatedMemories(conceptId) {
    var registry = getRegistry();
    if (!registry || !conceptId) return [];

    var items = registry.getByConcept(conceptId);
    var result = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      result.push({
        id: item.id,
        name: item.title || item.id,
        type: 'memory',
        memoryType: item.type,
        reason: 'Memory references concept: ' + conceptId,
        relationship: 'memory_reference',
        distance: 1,
        tags: item.tags || [],
        deterministic: true
      });
    }
    return result;
  }

  function getRelatedReviews(conceptId) {
    var retrieval = getRetrieval();
    if (!retrieval || !conceptId) return [];

    var items = retrieval.search('', { type: 'review', concepts: [conceptId], limit: 10 });
    var memories = items.items || items;
    var result = [];
    for (var i = 0; i < memories.length; i++) {
      var mem = memories[i];
      result.push({
        id: mem.id,
        name: mem.title || mem.id,
        type: 'review',
        reason: 'Review references concept: ' + conceptId,
        relationship: 'review_reference',
        distance: 1,
        deterministic: true
      });
    }
    return result;
  }

  function getConceptsFromMemory(memoryId) {
    var registry = getRegistry();
    if (!registry) return [];
    var item = registry.get(memoryId);
    if (!item || !item.relatedConcepts) return [];
    return item.relatedConcepts;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.SemanticMemoryBridge = {
    getRelatedMemories: getRelatedMemories,
    getRelatedReviews: getRelatedReviews,
    getConceptsFromMemory: getConceptsFromMemory
  };
})();
