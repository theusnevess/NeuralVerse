/**
 * Semantic Learning Intelligence — Shared Knowledge Bridge
 * Connects semantic engine to the Shared Knowledge system.
 * Exposes domain information using existing repositories only.
 *
 * NV-1100-P9
 */
(function () {
  'use strict';

  function getEngine() {
    return window.NeuralVerse?.SemanticEngine || null;
  }

  function getSharedKnowledgeService() {
    return window.NeuralVerse?.sharedKnowledgeService || null;
  }

  function getRelatedDomains(conceptId) {
    var engine = getEngine();
    if (!engine || !conceptId) return [];

    var concept = engine.getConcept(conceptId);
    if (!concept) return [];

    var result = [];
    for (var i = 0; i < concept.sharedKnowledgeDomains.length; i++) {
      var domainId = concept.sharedKnowledgeDomains[i];
      result.push({
        id: domainId,
        name: domainId,
        type: 'shared-knowledge-domain',
        reason: 'Concept belongs to domain: ' + domainId,
        relationship: 'domain_membership',
        deterministic: true
      });
    }

    // Also find domains from related concepts
    var related = engine.getRelatedConcepts(conceptId);
    for (var i = 0; i < related.length; i++) {
      var relatedConcept = engine.getConcept(related[i].id);
      if (relatedConcept) {
        for (var j = 0; j < relatedConcept.sharedKnowledgeDomains.length; j++) {
          var dId = relatedConcept.sharedKnowledgeDomains[j];
          var alreadyAdded = false;
          for (var k = 0; k < result.length; k++) {
            if (result[k].id === dId) { alreadyAdded = true; break; }
          }
          if (!alreadyAdded) {
            result.push({
              id: dId,
              name: dId,
              type: 'shared-knowledge-domain',
              reason: 'Related concept ' + related[i].id + ' belongs to domain: ' + dId,
              relationship: 'related_domain',
              deterministic: true
            });
          }
        }
      }
    }

    return result;
  }

  function getDomainDetails(domainId) {
    var service = getSharedKnowledgeService();
    if (!service || !domainId) return null;

    // Try to get domain data synchronously from cache
    if (typeof service.getDomain === 'function') {
      return service.getDomain(domainId);
    }
    return null;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.SemanticSharedKnowledgeBridge = {
    getRelatedDomains: getRelatedDomains,
    getDomainDetails: getDomainDetails
  };
})();
