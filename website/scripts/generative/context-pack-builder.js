/**
 * NV-1100-P11 — Context Pack Builder
 * Builds explicit context packs for LLM prompts.
 * The LLM must never receive the entire application state by default.
 */
(function () {
  'use strict';

  var PRIVACY_LEVELS = {
    none: { id: 'none', label: 'No context', includeMemory: false, includeReview: false },
    current_artifact_only: { id: 'current_artifact_only', label: 'Current artifact only', includeMemory: false, includeReview: false },
    curriculum_context: { id: 'curriculum_context', label: 'Curriculum context', includeMemory: false, includeReview: false },
    semantic_context: { id: 'semantic_context', label: 'Semantic context', includeMemory: false, includeReview: false },
    include_user_memory: { id: 'include_user_memory', label: 'Include user memory', includeMemory: true, includeReview: false },
    include_review_state: { id: 'include_review_state', label: 'Include review state', includeMemory: true, includeReview: true }
  };

  var DEFAULT_PRIVACY = 'current_artifact_only';

  function buildArtifactContext(artifact) {
    if (!artifact) return null;
    return {
      type: 'artifact_context',
      sourceId: artifact.id || '',
      sourceType: 'artifact',
      title: artifact.title || '',
      excerpt: (artifact.content || artifact.summary || '').substring(0, 1000),
      canonicalStatus: artifact.canonicalStatus || 'draft',
      limitations: 'This is curriculum content. Generated responses based on this are non-canonical.'
    };
  }

  function buildConceptContext(concept) {
    if (!concept) return null;
    return {
      type: 'concept_context',
      sourceId: concept.id || '',
      sourceType: 'concept',
      title: concept.name || concept.title || '',
      excerpt: (concept.summary || concept.definition || '').substring(0, 1000),
      canonicalStatus: concept.canonicalStatus || 'draft',
      limitations: 'This is concept data. Generated responses are non-canonical.'
    };
  }

  function buildSemanticContext(semanticData) {
    if (!semanticData) return null;
    return {
      type: 'semantic_context',
      sourceId: semanticData.conceptId || '',
      sourceType: 'semantic',
      title: 'Semantic relationships for ' + (semanticData.conceptName || ''),
      excerpt: JSON.stringify(semanticData).substring(0, 1000),
      canonicalStatus: 'derived',
      limitations: 'This is derived semantic data. Generated responses are non-canonical.'
    };
  }

  function buildMemoryContext(memories) {
    if (!memories || !Array.isArray(memories) || memories.length === 0) return null;
    var items = memories.slice(0, 5).map(function (m) {
      return (m.title || '') + ': ' + (m.content || m.summary || '').substring(0, 200);
    });
    return {
      type: 'memory_context',
      sourceId: 'user-memory',
      sourceType: 'memory',
      title: 'User notes (' + memories.length + ' items)',
      excerpt: items.join('\n'),
      canonicalStatus: 'user-generated',
      limitations: 'This is user-generated memory content. Generated responses are non-canonical.'
    };
  }

  function buildReviewContext(reviewState) {
    if (!reviewState) return null;
    return {
      type: 'review_context',
      sourceId: 'review-state',
      sourceType: 'review',
      title: 'Review state',
      excerpt: 'Due items: ' + (reviewState.dueCount || 0) + ', Reviewed today: ' + (reviewState.reviewedToday || 0),
      canonicalStatus: 'system-generated',
      limitations: 'This is review scheduling data. Generated responses are non-canonical.'
    };
  }

  function buildLabContext(lab) {
    if (!lab) return null;
    return {
      type: 'lab_context',
      sourceId: lab.id || '',
      sourceType: 'laboratory',
      title: lab.title || '',
      excerpt: (lab.summary || '').substring(0, 1000),
      canonicalStatus: 'reviewed',
      limitations: 'This is laboratory data. Generated explanations are non-canonical.'
    };
  }

  function buildVisualizationContext(viz) {
    if (!viz) return null;
    return {
      type: 'visualization_context',
      sourceId: viz.id || '',
      sourceType: 'visualization',
      title: viz.title || '',
      excerpt: (viz.summary || '').substring(0, 1000),
      canonicalStatus: 'reviewed',
      limitations: 'This is visualization data. Generated explanations are non-canonical.'
    };
  }

  function buildVerificationContext(verification) {
    if (!verification) return null;
    return {
      type: 'verification_context',
      sourceId: 'verification',
      sourceType: 'verification',
      title: 'Answer verification state',
      excerpt: 'Status: ' + (verification.status || 'unknown'),
      canonicalStatus: 'system-generated',
      limitations: 'This is verification data. Generated responses are non-canonical.'
    };
  }

  function buildSharedKnowledgeContext(domain) {
    if (!domain) return null;
    return {
      type: 'shared_knowledge_context',
      sourceId: domain.id || '',
      sourceType: 'shared-knowledge',
      title: domain.title || '',
      excerpt: (domain.summary || '').substring(0, 1000),
      canonicalStatus: domain.canonicalStatus || 'reviewed',
      limitations: 'This is shared knowledge data. Generated responses are non-canonical.'
    };
  }

  function buildContextPack(sources, privacyLevel) {
    var level = PRIVACY_LEVELS[privacyLevel || DEFAULT_PRIVACY] || PRIVACY_LEVELS[DEFAULT_PRIVACY];
    var packs = [];

    if (sources.artifact) {
      var p = buildArtifactContext(sources.artifact);
      if (p) packs.push(p);
    }
    if (sources.concept) {
      var p = buildConceptContext(sources.concept);
      if (p) packs.push(p);
    }
    if (sources.semantic) {
      var p = buildSemanticContext(sources.semantic);
      if (p) packs.push(p);
    }
    if (sources.lab) {
      var p = buildLabContext(sources.lab);
      if (p) packs.push(p);
    }
    if (sources.visualization) {
      var p = buildVisualizationContext(sources.visualization);
      if (p) packs.push(p);
    }
    if (sources.verification) {
      var p = buildVerificationContext(sources.verification);
      if (p) packs.push(p);
    }
    if (sources.sharedKnowledge) {
      var p = buildSharedKnowledgeContext(sources.sharedKnowledge);
      if (p) packs.push(p);
    }
    if (level.includeMemory && sources.memories) {
      var p = buildMemoryContext(sources.memories);
      if (p) packs.push(p);
    }
    if (level.includeReview && sources.reviewState) {
      var p = buildReviewContext(sources.reviewState);
      if (p) packs.push(p);
    }

    return packs;
  }

  function getPrivacyLevels() {
    return Object.keys(PRIVACY_LEVELS).map(function (k) { return PRIVACY_LEVELS[k]; });
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.ContextPackBuilder = {
    buildContextPack: buildContextPack,
    getPrivacyLevels: getPrivacyLevels,
    buildArtifactContext: buildArtifactContext,
    buildConceptContext: buildConceptContext,
    buildSemanticContext: buildSemanticContext,
    buildMemoryContext: buildMemoryContext,
    buildReviewContext: buildReviewContext,
    buildLabContext: buildLabContext,
    buildVisualizationContext: buildVisualizationContext,
    buildVerificationContext: buildVerificationContext,
    buildSharedKnowledgeContext: buildSharedKnowledgeContext,
    PRIVACY_LEVELS: PRIVACY_LEVELS,
    DEFAULT_PRIVACY: DEFAULT_PRIVACY
  };
})();
