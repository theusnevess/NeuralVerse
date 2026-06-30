/**
 * Semantic Learning Intelligence — Semantic Engine
 * Core semantic reasoning engine that operates on concept relationships.
 * Deterministic, local-first, offline-capable, explainable.
 *
 * NV-1100-P9
 */
(function () {
  'use strict';

  var _concepts = {};
  var _initialized = false;

  function initialize(conceptsData) {
    _concepts = {};
    if (!conceptsData || !Array.isArray(conceptsData)) return;
    for (var i = 0; i < conceptsData.length; i++) {
      var c = conceptsData[i];
      if (c && c.id) {
        _concepts[c.id] = {
          id: c.id,
          name: c.name || c.id,
          slug: c.slug || c.id,
          summary: c.summary || '',
          category: c.category || '',
          difficulty: c.difficulty || '',
          relatedConcepts: Array.isArray(c.relatedConcepts) ? c.relatedConcepts : [],
          prerequisiteConcepts: Array.isArray(c.prerequisiteConcepts) ? c.prerequisiteConcepts : [],
          artifactReferences: Array.isArray(c.artifactReferences) ? c.artifactReferences : [],
          sharedKnowledgeDomains: Array.isArray(c.sharedKnowledgeDomains) ? c.sharedKnowledgeDomains : [],
          laboratoryReferences: Array.isArray(c.recommendedLabs) ? c.recommendedLabs : [],
          aliases: Array.isArray(c.aliases) ? c.aliases : [],
          keywords: Array.isArray(c.keywords) ? c.keywords : []
        };
      }
    }
    _initialized = true;
  }

  function isInitialized() {
    return _initialized;
  }

  function getConcept(id) {
    if (typeof id !== 'string') return null;
    return _concepts[id] || null;
  }

  function getAllConcepts() {
    var result = [];
    var ids = Object.keys(_concepts);
    for (var i = 0; i < ids.length; i++) {
      result.push(_concepts[ids[i]]);
    }
    return result;
  }

  function getConceptCount() {
    return Object.keys(_concepts).length;
  }

  function getRelatedConcepts(conceptId) {
    if (typeof conceptId !== 'string') return [];
    var concept = getConcept(conceptId);
    if (!concept) return [];
    var result = [];
    for (var i = 0; i < concept.relatedConcepts.length; i++) {
      var rel = concept.relatedConcepts[i];
      var target = getConcept(rel.concept || rel.id || rel);
      if (target) {
        result.push({
          id: target.id,
          name: target.name,
          category: target.category,
          relationshipType: rel.type || 'related_to',
          direction: 'outgoing'
        });
      }
    }
    return result;
  }

  function getPrerequisites(conceptId) {
    if (typeof conceptId !== 'string') return [];
    var concept = getConcept(conceptId);
    if (!concept) return [];
    var result = [];
    for (var i = 0; i < concept.prerequisiteConcepts.length; i++) {
      var prereqId = concept.prerequisiteConcepts[i];
      var prereq = getConcept(prereqId);
      if (prereq) {
        result.push({
          id: prereq.id,
          name: prereq.name,
          category: prereq.category,
          relationshipType: 'prerequisite',
          direction: 'incoming'
        });
      }
    }
    return result;
  }

  function getDependents(conceptId) {
    if (typeof conceptId !== 'string') return [];
    var allConcepts = getAllConcepts();
    var result = [];
    for (var i = 0; i < allConcepts.length; i++) {
      var c = allConcepts[i];
      for (var j = 0; j < c.prerequisiteConcepts.length; j++) {
        if (c.prerequisiteConcepts[j] === conceptId) {
          result.push({
            id: c.id,
            name: c.name,
            category: c.category,
            relationshipType: 'dependent',
            direction: 'outgoing'
          });
          break;
        }
      }
      for (var k = 0; k < c.relatedConcepts.length; k++) {
        var rel = c.relatedConcepts[k];
        if ((rel.concept || rel.id || rel) === conceptId && rel.type === 'depends_on') {
          result.push({
            id: c.id,
            name: c.name,
            category: c.category,
            relationshipType: 'dependent',
            direction: 'outgoing'
          });
          break;
        }
      }
    }
    return result;
  }

  function getArtifactReferences(conceptId) {
    if (typeof conceptId !== 'string') return [];
    var concept = getConcept(conceptId);
    if (!concept) return [];
    var result = [];
    for (var i = 0; i < concept.artifactReferences.length; i++) {
      result.push({
        id: concept.artifactReferences[i],
        type: 'artifact',
        relationshipType: 'referenced_by'
      });
    }
    return result;
  }

  function getLaboratoryReferences(conceptId) {
    if (typeof conceptId !== 'string') return [];
    var concept = getConcept(conceptId);
    if (!concept) return [];
    var result = [];
    for (var i = 0; i < concept.laboratoryReferences.length; i++) {
      result.push({
        id: concept.laboratoryReferences[i],
        type: 'laboratory',
        relationshipType: 'recommended_lab'
      });
    }
    return result;
  }

  function getSharedKnowledgeDomains(conceptId) {
    if (typeof conceptId !== 'string') return [];
    var concept = getConcept(conceptId);
    if (!concept) return [];
    var result = [];
    for (var i = 0; i < concept.sharedKnowledgeDomains.length; i++) {
      result.push({
        id: concept.sharedKnowledgeDomains[i],
        type: 'shared-knowledge-domain',
        relationshipType: 'domain_reference'
      });
    }
    return result;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.SemanticEngine = {
    initialize: initialize,
    isInitialized: isInitialized,
    getConcept: getConcept,
    getAllConcepts: getAllConcepts,
    getConceptCount: getConceptCount,
    getRelatedConcepts: getRelatedConcepts,
    getPrerequisites: getPrerequisites,
    getDependents: getDependents,
    getArtifactReferences: getArtifactReferences,
    getLaboratoryReferences: getLaboratoryReferences,
    getSharedKnowledgeDomains: getSharedKnowledgeDomains
  };
})();
