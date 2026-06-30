/**
 * Semantic Learning Intelligence — Artifact Bridge
 * Connects semantic engine to the curriculum artifact system.
 *
 * NV-1100-P9
 */
(function () {
  'use strict';

  function getEngine() {
    return window.NeuralVerse?.SemanticEngine || null;
  }

  function getCurriculumService() {
    return window.NeuralVerse?.curriculum?.service || null;
  }

  function getRelatedArtifacts(conceptId) {
    var engine = getEngine();
    if (!engine || !conceptId) return [];

    var concept = engine.getConcept(conceptId);
    if (!concept) return [];

    var result = [];
    for (var i = 0; i < concept.artifactReferences.length; i++) {
      result.push({
        id: concept.artifactReferences[i],
        name: concept.artifactReferences[i],
        type: 'artifact',
        reason: 'Artifact references concept: ' + conceptId,
        relationship: 'artifact_concept',
        deterministic: true
      });
    }

    // Also find artifacts from related concepts that share the same category
    var related = engine.getRelatedConcepts(conceptId);
    for (var i = 0; i < related.length; i++) {
      var relatedConcept = engine.getConcept(related[i].id);
      if (relatedConcept && relatedConcept.category === concept.category) {
        for (var j = 0; j < relatedConcept.artifactReferences.length; j++) {
          var artId = relatedConcept.artifactReferences[j];
          var alreadyAdded = false;
          for (var k = 0; k < result.length; k++) {
            if (result[k].id === artId) { alreadyAdded = true; break; }
          }
          if (!alreadyAdded) {
            result.push({
              id: artId,
              name: artId,
              type: 'artifact',
              reason: 'Artifact from related concept ' + related[i].id + ' in same category',
              relationship: 'shared_category_artifact',
              deterministic: true
            });
          }
        }
      }
    }

    return result;
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.SemanticArtifactBridge = {
    getRelatedArtifacts: getRelatedArtifacts
  };
})();
