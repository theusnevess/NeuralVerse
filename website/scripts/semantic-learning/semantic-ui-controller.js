/**
 * Semantic Learning Intelligence — UI Controller
 * Renders semantic recommendations in workspace and artifact pages.
 * Responsive, accessible, keyboard-navigable.
 *
 * NV-1100-P9
 */
(function () {
  'use strict';

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getEngine() {
    return window.NeuralVerse?.SemanticEngine || null;
  }

  function getRecommendations() {
    return window.NeuralVerse?.RecommendationEngine || null;
  }

  function getTraversal() {
    return window.NeuralVerse?.SemanticTraversal || null;
  }

  function getLabBridge() {
    return window.NeuralVerse?.SemanticLabBridge || null;
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return d.getFullYear() + '-' + m + '-' + day;
    } catch (e) {
      return iso;
    }
  }

  function renderRecommendationSection(title, items, icon) {
    if (!items || items.length === 0) return '';
    var html = '<div class="nv-sem-section">';
    html += '<h3 class="nv-sem-section-title">' + (icon || '') + ' ' + escapeHtml(title) + ' (' + items.length + ')</h3>';
    html += '<ul class="nv-sem-list" role="list">';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var href = '#';
      if (item.type === 'concept') href = '#/knowledge-graph?focus=' + encodeURIComponent(item.id);
      else if (item.type === 'laboratory') href = '#/laboratory/' + encodeURIComponent(item.slug || item.id);
      else if (item.type === 'memory') href = '#/memory/' + encodeURIComponent(item.id);
      else if (item.type === 'artifact') href = '#/content/' + encodeURIComponent(item.id);
      else if (item.type === 'shared-knowledge-domain') href = '#/knowledge-graph?focus=' + encodeURIComponent(item.id);
      else if (item.type === 'visualization') href = '#/visualizations/' + encodeURIComponent(item.slug || item.id);

      html += '<li class="nv-sem-item" role="listitem">';
      html += '<a href="' + href + '" class="nv-sem-link" tabindex="0" aria-label="' + escapeHtml(item.name || item.id) + '">';
      html += '<span class="nv-sem-item-name">' + escapeHtml(item.name || item.id) + '</span>';
      html += '<span class="nv-sem-item-type nv-sem-type-' + escapeHtml(item.type) + '">' + escapeHtml(item.type) + '</span>';
      html += '</a>';
      if (item.reason) {
        html += '<span class="nv-sem-item-reason">' + escapeHtml(item.reason) + '</span>';
      }
      html += '</li>';
    }
    html += '</ul></div>';
    return html;
  }

  function renderSemanticPanel(conceptId) {
    var engine = getEngine();
    var recs = getRecommendations();
    if (!engine || !recs) return '<p class="nv-sem-empty">Semantic engine not available.</p>';

    var concept = engine.getConcept(conceptId);
    if (!concept) return '<p class="nv-sem-empty">Concept not found: ' + escapeHtml(conceptId) + '</p>';

    var recommendations = recs.getRecommendations(conceptId);
    var html = '<div class="nv-sem-panel" role="region" aria-label="Semantic recommendations for ' + escapeHtml(concept.name) + '">';
    html += '<h2 class="nv-sem-panel-title">Semantic Context</h2>';
    html += '<p class="nv-sem-panel-subtitle">Concept: ' + escapeHtml(concept.name) + ' (' + escapeHtml(concept.category) + ')</p>';

    html += renderRecommendationSection('Related Concepts', recommendations.categories.relatedConcepts);
    html += renderRecommendationSection('Prerequisites', recommendations.categories.prerequisites);
    html += renderRecommendationSection('Dependent Concepts', recommendations.categories.dependentConcepts);
    html += renderRecommendationSection('Related Artifacts', recommendations.categories.relatedArtifacts);
    html += renderRecommendationSection('Related Laboratories', recommendations.categories.relatedLabs);
    html += renderRecommendationSection('Related Memories', recommendations.categories.relatedMemories);
    html += renderRecommendationSection('Related Reviews', recommendations.categories.relatedReviews);
    html += renderRecommendationSection('Shared Knowledge Domains', recommendations.categories.sharedKnowledgeDomains);
    html += renderRecommendationSection('Related Visualizations', recommendations.categories.relatedVisualizations, '&#9654;');

    html += '<p class="nv-sem-footer">All recommendations are deterministic and rule-based. No learner inference.</p>';
    html += '</div>';
    return html;
  }

  function renderWorkspaceSuggestions(conceptId) {
    var engine = getEngine();
    var recs = getRecommendations();
    if (!engine || !recs) return '';

    var concept = engine.getConcept(conceptId);
    if (!concept) return '';

    var recommendations = recs.getRecommendations(conceptId);
    var html = '<div class="nv-sem-workspace-card" role="region" aria-label="Semantic suggestions">';
    html += '<div class="nv-sem-card-header">';
    html += '<h3 class="nv-sem-card-title">Semantic Suggestions</h3>';
    html += '<p class="nv-sem-card-concept">' + escapeHtml(concept.name) + '</p>';
    html += '</div>';
    html += '<div class="nv-sem-card-body">';

    if (recommendations.categories.relatedConcepts.length > 0) {
      html += renderRecommendationSection('Related Concepts', recommendations.categories.relatedConcepts.slice(0, 5));
    }
    if (recommendations.categories.relatedLabs.length > 0) {
      html += renderRecommendationSection('Suggested Labs', recommendations.categories.relatedLabs.slice(0, 5));
    }
    if (recommendations.categories.relatedReviews.length > 0) {
      html += renderRecommendationSection('Suggested Reviews', recommendations.categories.relatedReviews.slice(0, 5));
    }
    if (recommendations.categories.relatedMemories.length > 0) {
      html += renderRecommendationSection('Suggested Notes', recommendations.categories.relatedMemories.slice(0, 5));
    }
    if (recommendations.categories.relatedArtifacts.length > 0) {
      html += renderRecommendationSection('Suggested Artifacts', recommendations.categories.relatedArtifacts.slice(0, 5));
    }

    html += '</div></div>';
    return html;
  }

  function renderTraversalPanel(conceptId) {
    var traversal = getTraversal();
    if (!traversal) return '';

    var result = traversal.getTraversal(conceptId, { maxDepth: 2 });
    if (!result || !result.nodes || result.nodes.length === 0) return '';

    var html = '<div class="nv-sem-traversal" role="region" aria-label="Concept traversal">';
    html += '<h3 class="nv-sem-section-title">Concept Traversal</h3>';
    html += '<p class="nv-sem-traversal-info">Source: ' + escapeHtml(result.sourceConcept?.name || conceptId) + ' | Nodes: ' + result.totalNodes + ' | Max depth: ' + result.maxDepth + '</p>';
    html += '<ul class="nv-sem-list" role="list">';
    for (var i = 0; i < result.nodes.length; i++) {
      var node = result.nodes[i];
      var href = '#/knowledge-graph?focus=' + encodeURIComponent(node.id);
      html += '<li class="nv-sem-item" role="listitem">';
      html += '<a href="' + href + '" class="nv-sem-link" tabindex="0">';
      html += '<span class="nv-sem-item-name">' + escapeHtml(node.name) + '</span>';
      html += '<span class="nv-sem-item-depth">depth ' + node.depth + '</span>';
      html += '<span class="nv-sem-item-type">' + escapeHtml(node.relationshipType) + '</span>';
      html += '</a>';
      html += '</li>';
    }
    html += '</ul></div>';
    return html;
  }

  function renderSemanticSearchResults(query) {
    var engine = getEngine();
    if (!engine) return [];

    var results = [];
    var concepts = engine.getAllConcepts();
    var q = (query || '').toLowerCase();

    // Search for "related to X" pattern
    var relatedMatch = q.match(/^related\s+to\s+(.+)$/i);
    if (relatedMatch) {
      var targetConcept = relatedMatch[1].trim();
      for (var i = 0; i < concepts.length; i++) {
        if (concepts[i].name.toLowerCase().indexOf(targetConcept) !== -1 ||
            concepts[i].id.toLowerCase().indexOf(targetConcept) !== -1) {
          var related = engine.getRelatedConcepts(concepts[i].id);
          for (var j = 0; j < related.length; j++) {
            results.push({
              id: related[j].id,
              type: 'concept',
              badgeLabel: 'Semantic',
              title: related[j].name,
              summary: 'Related to ' + concepts[i].name,
              href: '#/knowledge-graph?focus=' + encodeURIComponent(related[j].id),
              breadcrumbs: ['Semantic', 'Related to ' + concepts[i].name, related[j].name],
              searchableText: (related[j].id + ' ' + related[j].name + ' related semantic').toLowerCase()
            });
          }
          break;
        }
      }
    }

    // Search for "prerequisites of X" pattern
    var prereqMatch = q.match(/^prerequisites?\s+(?:of\s+)?(.+)$/i);
    if (prereqMatch) {
      var targetConcept = prereqMatch[1].trim();
      for (var i = 0; i < concepts.length; i++) {
        if (concepts[i].name.toLowerCase().indexOf(targetConcept) !== -1 ||
            concepts[i].id.toLowerCase().indexOf(targetConcept) !== -1) {
          var prereqs = engine.getPrerequisites(concepts[i].id);
          for (var j = 0; j < prereqs.length; j++) {
            results.push({
              id: prereqs[j].id,
              type: 'concept',
              badgeLabel: 'Semantic',
              title: prereqs[j].name,
              summary: 'Prerequisite of ' + concepts[i].name,
              href: '#/knowledge-graph?focus=' + encodeURIComponent(prereqs[j].id),
              breadcrumbs: ['Semantic', 'Prerequisites', prereqs[j].name],
              searchableText: (prereqs[j].id + ' ' + prereqs[j].name + ' prerequisite semantic').toLowerCase()
            });
          }
          break;
        }
      }
    }

    // Search for "labs for X" pattern
    var labMatch = q.match(/^labs?\s+(?:for|of)\s+(.+)$/i);
    if (labMatch) {
      var targetConcept = labMatch[1].trim();
      var labBridge = getLabBridge();
      if (labBridge) {
        for (var i = 0; i < concepts.length; i++) {
          if (concepts[i].name.toLowerCase().indexOf(targetConcept) !== -1 ||
              concepts[i].id.toLowerCase().indexOf(targetConcept) !== -1) {
            var labs = labBridge.getRelatedLabs(concepts[i].id);
            for (var j = 0; j < labs.length; j++) {
              results.push({
                id: labs[j].id,
                type: 'laboratory',
                badgeLabel: 'Semantic',
                title: labs[j].name,
                summary: 'Lab for ' + concepts[i].name,
                href: '#/laboratory/' + encodeURIComponent(labs[j].slug || labs[j].id),
                breadcrumbs: ['Semantic', 'Labs', labs[j].name],
                searchableText: (labs[j].id + ' ' + labs[j].name + ' lab semantic').toLowerCase()
              });
            }
            break;
          }
        }
      }
    }

    // Search for "notes about X" pattern
    var noteMatch = q.match(/^notes?\s+(?:about|for)\s+(.+)$/i);
    if (noteMatch) {
      var targetConcept = noteMatch[1].trim();
      var memBridge = window.NeuralVerse?.SemanticMemoryBridge;
      if (memBridge) {
        for (var i = 0; i < concepts.length; i++) {
          if (concepts[i].name.toLowerCase().indexOf(targetConcept) !== -1 ||
              concepts[i].id.toLowerCase().indexOf(targetConcept) !== -1) {
            var memories = memBridge.getRelatedMemories(concepts[i].id);
            for (var j = 0; j < memories.length; j++) {
              results.push({
                id: memories[j].id,
                type: 'memory',
                badgeLabel: 'Semantic',
                title: memories[j].name,
                summary: 'Memory about ' + concepts[i].name,
                href: '#/memory/' + encodeURIComponent(memories[j].id),
                breadcrumbs: ['Semantic', 'Notes', memories[j].name],
                searchableText: (memories[j].id + ' ' + memories[j].name + ' note memory semantic').toLowerCase()
              });
            }
            break;
          }
        }
      }
    }

    return results.slice(0, 10);
  }

  function mountSemanticPanel(conceptId, container) {
    if (!container) return;
    container.innerHTML = renderSemanticPanel(conceptId);
  }

  function mountTraversalPanel(conceptId, container) {
    if (!container) return;
    container.innerHTML = renderTraversalPanel(conceptId);
  }

  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.SemanticUIController = {
    renderSemanticPanel: renderSemanticPanel,
    renderWorkspaceSuggestions: renderWorkspaceSuggestions,
    renderTraversalPanel: renderTraversalPanel,
    renderSemanticSearchResults: renderSemanticSearchResults,
    mountSemanticPanel: mountSemanticPanel,
    mountTraversalPanel: mountTraversalPanel
  };
})();
