/**
 * Semantic Learning Intelligence — Recommendation Engine
 * Rule-based, deterministic recommendations. No learner inference.
 * No mastery, no competence, no proficiency, no intelligence scoring.
 *
 * NV-1100-P9
 */
(function () {
  'use strict';

  var MAX_RECOMMENDATIONS_PER_CATEGORY = 5;

  function getEngine() {
    return window.NeuralVerse?.SemanticEngine || null;
  }

  function getTraversal() {
    return window.NeuralVerse?.SemanticTraversal || null;
  }

  function getNeighborhood() {
    return window.NeuralVerse?.SemanticNeighborhood || null;
  }

  function getMemoryBridge() {
    return window.NeuralVerse?.SemanticMemoryBridge || null;
  }

  function getLabBridge() {
    return window.NeuralVerse?.SemanticLabBridge || null;
  }

  function getArtifactBridge() {
    return window.NeuralVerse?.SemanticArtifactBridge || null;
  }

  function getSharedKnowledgeBridge() {
    return window.NeuralVerse?.SemanticSharedKnowledgeBridge || null;
  }

  function getVizBridge() {
    return window.NeuralVerse?.SemanticVizBridge || null;
  }

  function deduplicate(items) {
    var seen = {};
    var result = [];
    for (var i = 0; i < items.length; i++) {
      if (!seen[items[i].id]) {
        seen[items[i].id] = true;
        result.push(items[i]);
      }
    }
    return result;
  }

  function createRecommendation(item, reason, relationship, distance) {
    return {
      id: item.id,
      name: item.name || item.id,
      type: item.type || 'concept',
      reason: reason,
      relationship: relationship,
      distance: distance || 1,
      deterministic: true
    };
  }

  function getRecommendations(conceptId) {
    var engine = getEngine();
    if (!engine || !conceptId) return { categories: {}, total: 0, deterministic: true };

    var concept = engine.getConcept(conceptId);
    if (!concept) return { categories: {}, total: 0, deterministic: true };

    var categories = {};

    // 1. Related Concepts
    var relatedConcepts = engine.getRelatedConcepts(conceptId);
    var relatedItems = [];
    for (var i = 0; i < relatedConcepts.length; i++) {
      relatedItems.push(createRecommendation(
        relatedConcepts[i],
        'Directly related concept',
        relatedConcepts[i].relationshipType,
        1
      ));
    }
    categories.relatedConcepts = deduplicate(relatedItems).slice(0, MAX_RECOMMENDATIONS_PER_CATEGORY);

    // 2. Prerequisites
    var prereqs = engine.getPrerequisites(conceptId);
    var prereqItems = [];
    for (var i = 0; i < prereqs.length; i++) {
      prereqItems.push(createRecommendation(
        prereqs[i],
        'Prerequisite concept',
        'prerequisite',
        1
      ));
    }
    categories.prerequisites = deduplicate(prereqItems).slice(0, MAX_RECOMMENDATIONS_PER_CATEGORY);

    // 3. Dependent Concepts
    var deps = engine.getDependents(conceptId);
    var depItems = [];
    for (var i = 0; i < deps.length; i++) {
      depItems.push(createRecommendation(
        deps[i],
        'Depends on this concept',
        'dependent',
        1
      ));
    }
    categories.dependentConcepts = deduplicate(depItems).slice(0, MAX_RECOMMENDATIONS_PER_CATEGORY);

    // 4. Related Artifacts
    var artifactRefs = engine.getArtifactReferences(conceptId);
    var artifactItems = [];
    for (var i = 0; i < artifactRefs.length; i++) {
      artifactItems.push(createRecommendation(
        artifactRefs[i],
        'Artifact references this concept',
        'artifact_reference',
        1
      ));
    }
    // Also check artifacts from related concepts
    var relatedArtifactItems = getArtifactBridge()?.getRelatedArtifacts(conceptId) || [];
    artifactItems = artifactItems.concat(relatedArtifactItems);
    categories.relatedArtifacts = deduplicate(artifactItems).slice(0, MAX_RECOMMENDATIONS_PER_CATEGORY);

    // 5. Related Laboratories
    var labRefs = engine.getLaboratoryReferences(conceptId);
    var labItems = [];
    for (var i = 0; i < labRefs.length; i++) {
      labItems.push(createRecommendation(
        labRefs[i],
        'Laboratory reinforces this concept',
        'laboratory_reference',
        1
      ));
    }
    var relatedLabItems = getLabBridge()?.getRelatedLabs(conceptId) || [];
    labItems = labItems.concat(relatedLabItems);
    categories.relatedLabs = deduplicate(labItems).slice(0, MAX_RECOMMENDATIONS_PER_CATEGORY);

    // 6. Related Memories
    var memoryItems = getMemoryBridge()?.getRelatedMemories(conceptId) || [];
    categories.relatedMemories = deduplicate(memoryItems).slice(0, MAX_RECOMMENDATIONS_PER_CATEGORY);

    // 7. Related Reviews (informational only)
    var reviewItems = getMemoryBridge()?.getRelatedReviews(conceptId) || [];
    categories.relatedReviews = deduplicate(reviewItems).slice(0, MAX_RECOMMENDATIONS_PER_CATEGORY);

    // 8. Shared Knowledge Domains
    var domainRefs = engine.getSharedKnowledgeDomains(conceptId);
    var domainItems = [];
    for (var i = 0; i < domainRefs.length; i++) {
      domainItems.push(createRecommendation(
        domainRefs[i],
        'Concept belongs to this knowledge domain',
        'domain_reference',
        1
      ));
    }
    var skItems = getSharedKnowledgeBridge()?.getRelatedDomains(conceptId) || [];
    domainItems = domainItems.concat(skItems);
    categories.sharedKnowledgeDomains = deduplicate(domainItems).slice(0, MAX_RECOMMENDATIONS_PER_CATEGORY);

    // 9. Related Visualizations (NV-1100-P9B)
    var vizItems = getVizBridge()?.getRelatedVisualizations(conceptId) || [];
    categories.relatedVisualizations = deduplicate(vizItems).slice(0, MAX_RECOMMENDATIONS_PER_CATEGORY);

    // Calculate total
    var total = 0;
    var catKeys = Object.keys(categories);
    for (var i = 0; i < catKeys.length; i++) {
      total += categories[catKeys[i]].length;
    }

    return {
      categories: categories,
      total: total,
      conceptId: conceptId,
      conceptName: concept.name,
      deterministic: true
    };
  }

  function explainRecommendation(itemId, conceptId) {
    if (typeof itemId !== 'string' || typeof conceptId !== 'string') {
      return { explanation: 'Invalid input', deterministic: true };
    }

    var engine = getEngine();
    if (!engine) return null;

    var sourceConcept = engine.getConcept(conceptId);
    var targetConcept = engine.getConcept(itemId);

    if (!sourceConcept) return { explanation: 'Source concept not found', deterministic: true };

    // Check if target is a prerequisite
    for (var i = 0; i < sourceConcept.prerequisiteConcepts.length; i++) {
      if (sourceConcept.prerequisiteConcepts[i] === itemId) {
        return {
          explanation: itemId + ' is a prerequisite of ' + conceptId,
          relationship: 'prerequisite',
          direction: 'incoming',
          distance: 1,
          deterministic: true
        };
      }
    }

    // Check if target is related
    for (var i = 0; i < sourceConcept.relatedConcepts.length; i++) {
      var rel = sourceConcept.relatedConcepts[i];
      if ((rel.concept || rel.id || rel) === itemId) {
        return {
          explanation: itemId + ' is ' + (rel.type || 'related_to') + ' ' + conceptId,
          relationship: rel.type || 'related_to',
          direction: 'outgoing',
          distance: 1,
          deterministic: true
        };
      }
    }

    // Check shared artifacts
    if (targetConcept) {
      var sharedArtifacts = [];
      for (var i = 0; i < sourceConcept.artifactReferences.length; i++) {
        for (var j = 0; j < targetConcept.artifactReferences.length; j++) {
          if (sourceConcept.artifactReferences[i] === targetConcept.artifactReferences[j]) {
            sharedArtifacts.push(sourceConcept.artifactReferences[i]);
          }
        }
      }
      if (sharedArtifacts.length > 0) {
        return {
          explanation: itemId + ' and ' + conceptId + ' share artifact(s): ' + sharedArtifacts.join(', '),
          relationship: 'shared_artifact',
          sharedArtifacts: sharedArtifacts,
          distance: 2,
          deterministic: true
        };
      }
    }

    // Check shared knowledge domains
    if (targetConcept) {
      var sharedDomains = [];
      for (var i = 0; i < sourceConcept.sharedKnowledgeDomains.length; i++) {
        for (var j = 0; j < targetConcept.sharedKnowledgeDomains.length; j++) {
          if (sourceConcept.sharedKnowledgeDomains[i] === targetConcept.sharedKnowledgeDomains[j]) {
            sharedDomains.push(sourceConcept.sharedKnowledgeDomains[i]);
          }
        }
      }
      if (sharedDomains.length > 0) {
        return {
          explanation: itemId + ' and ' + conceptId + ' belong to shared domain(s): ' + sharedDomains.join(', '),
          relationship: 'shared_domain',
          sharedDomains: sharedDomains,
          distance: 2,
          deterministic: true
        };
      }
    }

    return {
      explanation: 'No direct relationship found between ' + itemId + ' and ' + conceptId,
      relationship: 'none',
      distance: -1,
      deterministic: true
    };
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.RecommendationEngine = {
    getRecommendations: getRecommendations,
    explainRecommendation: explainRecommendation,
    MAX_RECOMMENDATIONS_PER_CATEGORY: MAX_RECOMMENDATIONS_PER_CATEGORY
  };
})();
